import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DeliveryRecommendation {
  id: string;
  type: 'route_optimization' | 'time_suggestion' | 'driver_match' | 'price_optimization' | 'location_suggestion';
  title: string;
  description: string;
  confidence: number;
  savings: {
    timeSaved: number;
    moneySaved: number;
    reason: string;
  };
  suggestedAction?: any;
  metadata?: any;
}

interface PersonalizedRecommendationsProps {
  currentRequest?: {
    pickupAddress?: string;
    deliveryAddress?: string;
    packageType?: string;
    urgency?: string;
  };
  onApplyRecommendation?: (recommendation: DeliveryRecommendation) => void;
  className?: string;
}

export default function PersonalizedRecommendations({
  currentRequest,
  onApplyRecommendation,
  className
}: PersonalizedRecommendationsProps) {
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch personalized recommendations
  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ["/api/recommendations", currentRequest],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentRequest?.pickupAddress) params.append('pickupAddress', currentRequest.pickupAddress);
      if (currentRequest?.deliveryAddress) params.append('deliveryAddress', currentRequest.deliveryAddress);
      if (currentRequest?.packageType) params.append('packageType', currentRequest.packageType);
      if (currentRequest?.urgency) params.append('urgency', currentRequest.urgency);
      
      return await apiRequest(`/api/recommendations?${params.toString()}`);
    },
  });

  // Get user delivery patterns for insights
  const { data: userPatterns } = useQuery({
    queryKey: ["/api/user/delivery-patterns"],
  });

  // Accept recommendation mutation
  const acceptMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      return await apiRequest(`/api/recommendations/${recommendationId}/accept`, {
        method: "POST",
      });
    },
    onSuccess: (_, recommendationId) => {
      toast({
        title: "Recommandation appliquée",
        description: "Vos préférences ont été mises à jour automatiquement",
      });
      
      const recommendation = recommendations?.find((r: DeliveryRecommendation) => r.id === recommendationId);
      if (recommendation && onApplyRecommendation) {
        onApplyRecommendation(recommendation);
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer la recommandation",
        variant: "destructive",
      });
    },
  });

  // Dismiss recommendation mutation
  const dismissMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      return await apiRequest(`/api/recommendations/${recommendationId}/dismiss`, {
        method: "POST",
      });
    },
    onSuccess: (_, recommendationId) => {
      setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
      toast({
        title: "Recommandation ignorée",
        description: "Nous apprendrons de vos préférences",
      });
    },
  });

  // Generate new recommendations based on current context
  const generateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/recommendations/generate", {
        method: "POST",
        body: JSON.stringify(currentRequest || {}),
      });
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Nouvelles recommandations",
        description: "Recommandations mises à jour selon votre contexte",
      });
    },
  });

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'time_suggestion':
        return 'fas fa-clock';
      case 'route_optimization':
        return 'fas fa-route';
      case 'driver_match':
        return 'fas fa-user-check';
      case 'price_optimization':
        return 'fas fa-tag';
      case 'location_suggestion':
        return 'fas fa-map-marker-alt';
      default:
        return 'fas fa-lightbulb';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const formatSavings = (savings: { timeSaved: number; moneySaved: number }) => {
    const parts = [];
    if (savings.timeSaved > 0) parts.push(`${savings.timeSaved}min`);
    if (savings.moneySaved > 0) parts.push(`${savings.moneySaved} FCFA`);
    return parts.join(' + ');
  };

  const visibleRecommendations = recommendations?.filter(
    (rec: DeliveryRecommendation) => !dismissedRecommendations.has(rec.id)
  ) || [];

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-mako-green rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-white text-sm"></i>
              </div>
              <span>Recommandations IA</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-sync-alt"></i>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : visibleRecommendations.length === 0 ? (
            <Alert>
              <i className="fas fa-info-circle"></i>
              <AlertDescription>
                Aucune recommandation disponible pour le moment. Continuez à utiliser MAKOEXPRESS pour des suggestions personnalisées.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {visibleRecommendations.map((recommendation: DeliveryRecommendation) => (
                <Card key={recommendation.id} className="border-l-4 border-l-mako-green">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <i className={`${getRecommendationIcon(recommendation.type)} text-mako-green`}></i>
                          <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                          <Badge className={getConfidenceColor(recommendation.confidence)}>
                            {Math.round(recommendation.confidence * 100)}% sûr
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">
                          {recommendation.description}
                        </p>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1 text-green-600">
                            <i className="fas fa-chart-line"></i>
                            <span>Économie: {formatSavings(recommendation.savings)}</span>
                          </div>
                          <div className="text-gray-500">
                            {recommendation.savings.reason}
                          </div>
                        </div>

                        {/* Suggested Action Details */}
                        {recommendation.suggestedAction && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                            <div className="font-medium text-gray-700 mb-1">Action suggérée:</div>
                            {recommendation.type === 'time_suggestion' && recommendation.suggestedAction.timeSlot && (
                              <div>Livraison recommandée: {recommendation.suggestedAction.timeSlot} 
                                {recommendation.suggestedAction.hour && ` vers ${recommendation.suggestedAction.hour}h`}
                              </div>
                            )}
                            {recommendation.type === 'driver_match' && recommendation.suggestedAction.driverName && (
                              <div>Livreur recommandé: {recommendation.suggestedAction.driverName}</div>
                            )}
                            {recommendation.type === 'location_suggestion' && recommendation.suggestedAction.address && (
                              <div>Adresse suggérée: {recommendation.suggestedAction.address}</div>
                            )}
                            {recommendation.type === 'price_optimization' && recommendation.suggestedAction.savings && (
                              <div>Économie possible: {recommendation.suggestedAction.savings} FCFA</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => acceptMutation.mutate(recommendation.id)}
                          disabled={acceptMutation.isPending}
                          className="bg-mako-green hover:bg-mako-deep text-white"
                        >
                          {acceptMutation.isPending ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <>
                              <i className="fas fa-check mr-1"></i>
                              Appliquer
                            </>
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => dismissMutation.mutate(recommendation.id)}
                          disabled={dismissMutation.isPending}
                        >
                          <i className="fas fa-times mr-1"></i>
                          Ignorer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* User Patterns Insights */}
          {userPatterns && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">
                <i className="fas fa-chart-pie text-mako-green mr-2"></i>
                Vos habitudes de livraison
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-gray-700">Moment préféré</div>
                  <div className="text-mako-green">{userPatterns.preferredTimes?.[0] || "Pas de préférence"}</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-700">Budget moyen</div>
                  <div className="text-mako-green">{Math.round(userPatterns.averageOrderValue || 0)} FCFA</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-700">Fréquence</div>
                  <div className="text-mako-green">{userPatterns.deliveryFrequency || 0} livraisons</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-700">Type favori</div>
                  <div className="text-mako-green">
                    {userPatterns.packageTypePreferences?.[0]?.type || "Non défini"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}