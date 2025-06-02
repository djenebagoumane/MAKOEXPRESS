import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useRecommendationEngine } from "@/hooks/useRecommendationEngine";
import { useToast } from "@/hooks/use-toast";

interface RecommendationPanelProps {
  currentContext?: {
    pickupAddress?: string;
    deliveryAddress?: string;
    packageType?: string;
    urgency?: string;
  };
  onApplyRecommendation?: (recommendation: any) => void;
  className?: string;
}

export default function RecommendationPanel({
  currentContext,
  onApplyRecommendation,
  className = ""
}: RecommendationPanelProps) {
  const [expandedRec, setExpandedRec] = useState<number | null>(null);
  const { toast } = useToast();
  
  const {
    recommendations,
    insights,
    isLoading,
    acceptRecommendation,
    dismissRecommendation,
    generateRecommendations,
    getHighConfidenceRecommendations,
    calculatePotentialSavings,
    isGenerating
  } = useRecommendationEngine();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'route_optimization':
        return 'fa-route';
      case 'time_suggestion':
        return 'fa-clock';
      case 'driver_match':
        return 'fa-user-check';
      case 'price_optimization':
        return 'fa-tags';
      default:
        return 'fa-lightbulb';
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'route_optimization':
        return 'bg-blue-100 text-blue-800';
      case 'time_suggestion':
        return 'bg-green-100 text-green-800';
      case 'driver_match':
        return 'bg-purple-100 text-purple-800';
      case 'price_optimization':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAcceptRecommendation = (recommendation: any) => {
    acceptRecommendation(recommendation.id);
    if (onApplyRecommendation) {
      onApplyRecommendation(recommendation);
    }
    toast({
      title: "Recommandation appliquée",
      description: "Votre livraison a été optimisée selon nos suggestions",
      variant: "default",
    });
  };

  const handleDismissRecommendation = (recommendationId: number) => {
    dismissRecommendation(recommendationId);
    toast({
      title: "Recommandation ignorée",
      description: "Cette suggestion ne vous sera plus proposée",
      variant: "default",
    });
  };

  const handleGenerateRecommendations = () => {
    generateRecommendations(currentContext || {});
    toast({
      title: "Analyse en cours",
      description: "Génération de nouvelles recommandations personnalisées...",
      variant: "default",
    });
  };

  const potentialSavings = calculatePotentialSavings();
  const highConfidenceRecs = getHighConfidenceRecommendations();

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-2xl text-mako-green mb-2"></i>
              <p className="text-gray-600">Analyse de vos habitudes de livraison...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Savings Summary */}
      {(potentialSavings.time > 0 || potentialSavings.money > 0) && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-chart-line text-green-600"></i>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Économies Potentielles</h4>
                  <p className="text-sm text-green-700">
                    {potentialSavings.time > 0 && `${potentialSavings.time} min `}
                    {potentialSavings.money > 0 && `• ${formatAmount(potentialSavings.money)} FCFA`}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGenerateRecommendations}
                size="sm"
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-refresh"></i>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Confidence Recommendations */}
      {highConfidenceRecs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-star mr-2 text-yellow-500"></i>
              Recommandations Prioritaires
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highConfidenceRecs.slice(0, 3).map((recommendation: any) => (
              <div
                key={recommendation.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandedRec(
                  expandedRec === recommendation.id ? null : recommendation.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <i className={`fas ${getRecommendationIcon(recommendation.recommendationType)} mr-2 text-mako-green`}></i>
                      <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                      <Badge className={`ml-2 ${getRecommendationColor(recommendation.recommendationType)}`}>
                        {Math.round(recommendation.confidence * 100)}% sûr
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                    
                    {expandedRec === recommendation.id && (
                      <div className="mt-3 space-y-2">
                        {recommendation.suggestedTime && (
                          <div className="text-sm">
                            <span className="font-medium">Heure suggérée: </span>
                            {new Date(recommendation.suggestedTime).toLocaleString('fr-FR')}
                          </div>
                        )}
                        {recommendation.estimatedPrice && (
                          <div className="text-sm">
                            <span className="font-medium">Prix estimé: </span>
                            {formatAmount(recommendation.estimatedPrice)} FCFA
                          </div>
                        )}
                        {recommendation.estimatedDuration && (
                          <div className="text-sm">
                            <span className="font-medium">Durée: </span>
                            {recommendation.estimatedDuration} minutes
                          </div>
                        )}
                        {recommendation.savings && (
                          <div className="bg-green-50 p-2 rounded text-sm">
                            <span className="font-medium text-green-800">Économies: </span>
                            <span className="text-green-700">{recommendation.savings.reason}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 mt-3">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptRecommendation(recommendation);
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <i className="fas fa-check mr-1"></i>
                            Appliquer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismissRecommendation(recommendation.id);
                            }}
                          >
                            <i className="fas fa-times mr-1"></i>
                            Ignorer
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <div className="text-right">
                      <Progress 
                        value={recommendation.confidence * 100} 
                        className="w-16 h-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(recommendation.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-lightbulb mr-2 text-mako-green"></i>
                Toutes les Suggestions
              </div>
              <Button
                onClick={handleGenerateRecommendations}
                size="sm"
                variant="outline"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Analyse...
                  </>
                ) : (
                  <>
                    <i className="fas fa-refresh mr-2"></i>
                    Actualiser
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {recommendations.slice(0, 5).map((recommendation: any) => (
                <div
                  key={recommendation.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center flex-1">
                    <i className={`fas ${getRecommendationIcon(recommendation.recommendationType)} mr-3 text-gray-500`}></i>
                    <div>
                      <h5 className="font-medium text-gray-900">{recommendation.title}</h5>
                      <p className="text-sm text-gray-600">{recommendation.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getRecommendationColor(recommendation.recommendationType)}>
                      {Math.round(recommendation.confidence * 100)}%
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRecommendation(recommendation)}
                    >
                      <i className="fas fa-check"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-pie mr-2 text-mako-green"></i>
              Vos Habitudes de Livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.mostFrequentTime || "Matin"}
                </div>
                <p className="text-sm text-blue-800">Créneau préféré</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {insights.averageDeliveryTime || "45"} min
                </div>
                <p className="text-sm text-green-800">Temps moyen</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {insights.preferredPackageType || "Documents"}
                </div>
                <p className="text-sm text-purple-800">Type fréquent</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {formatAmount(insights.averageSpending || 2500)} FCFA
                </div>
                <p className="text-sm text-orange-800">Dépense moyenne</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(!recommendations || recommendations.length === 0) && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <i className="fas fa-robot text-4xl text-gray-400 mb-4"></i>
            <h4 className="font-semibold text-gray-700 mb-2">Aucune recommandation disponible</h4>
            <p className="text-gray-600 mb-4">
              Effectuez quelques livraisons pour que notre IA puisse analyser vos habitudes
            </p>
            <Button
              onClick={handleGenerateRecommendations}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Génération...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Générer des suggestions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}