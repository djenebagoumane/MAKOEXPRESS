import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PersonalizedRecommendations from "@/components/personalized-recommendations";
import { useAuth } from "@/hooks/useAuth";

export default function AIRecommendations() {
  const { user } = useAuth();
  const [currentRequest, setCurrentRequest] = useState({
    pickupAddress: "",
    deliveryAddress: "",
    packageType: "",
    urgency: "standard"
  });

  const { data: userPatterns } = useQuery({
    queryKey: ["/api/user/delivery-patterns"],
    enabled: !!user,
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/user/delivery-insights"],
  });

  const handleApplyRecommendation = (recommendation: any) => {
    // Apply recommendation to current request
    if (recommendation.suggestedAction) {
      const action = recommendation.suggestedAction;
      
      if (action.address) {
        if (action.type === 'pickup') {
          setCurrentRequest(prev => ({ ...prev, pickupAddress: action.address }));
        } else if (action.type === 'delivery') {
          setCurrentRequest(prev => ({ ...prev, deliveryAddress: action.address }));
        }
      }
      
      if (action.urgency) {
        setCurrentRequest(prev => ({ ...prev, urgency: action.urgency }));
      }
      
      if (action.packageType) {
        setCurrentRequest(prev => ({ ...prev, packageType: action.packageType }));
      }
    }
  };

  const clearForm = () => {
    setCurrentRequest({
      pickupAddress: "",
      deliveryAddress: "",
      packageType: "",
      urgency: "standard"
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-mako-anthracite mb-2">
          Recommandations IA
        </h1>
        <p className="text-gray-600">
          Découvrez des suggestions personnalisées basées sur vos habitudes de livraison
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Request Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <i className="fas fa-edit text-mako-green"></i>
                <span>Nouvelle livraison</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Adresse de ramassage
                </label>
                <Input
                  placeholder="Ex: ACI 2000, Bamako"
                  value={currentRequest.pickupAddress}
                  onChange={(e) => setCurrentRequest(prev => ({ 
                    ...prev, 
                    pickupAddress: e.target.value 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Adresse de livraison
                </label>
                <Input
                  placeholder="Ex: Hippodrome, Bamako"
                  value={currentRequest.deliveryAddress}
                  onChange={(e) => setCurrentRequest(prev => ({ 
                    ...prev, 
                    deliveryAddress: e.target.value 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type de colis
                </label>
                <Select 
                  value={currentRequest.packageType} 
                  onValueChange={(value) => setCurrentRequest(prev => ({ 
                    ...prev, 
                    packageType: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="food">Nourriture</SelectItem>
                    <SelectItem value="electronics">Électronique</SelectItem>
                    <SelectItem value="clothing">Vêtements</SelectItem>
                    <SelectItem value="medicine">Médicaments</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Urgence
                </label>
                <Select 
                  value={currentRequest.urgency} 
                  onValueChange={(value) => setCurrentRequest(prev => ({ 
                    ...prev, 
                    urgency: value 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (2-4h)</SelectItem>
                    <SelectItem value="express">Express (1-2h)</SelectItem>
                    <SelectItem value="urgent">Urgent (30min-1h)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                onClick={clearForm}
                className="w-full"
              >
                <i className="fas fa-eraser mr-2"></i>
                Effacer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations and Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personalized Recommendations */}
          <PersonalizedRecommendations
            currentRequest={currentRequest}
            onApplyRecommendation={handleApplyRecommendation}
          />

          {/* User Analytics Dashboard */}
          {userPatterns && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-chart-bar text-mako-green"></i>
                  <span>Analyse de vos habitudes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Delivery Patterns */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Habitudes de livraison</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Moments préférés:</span>
                        <div className="flex space-x-1">
                          {userPatterns.preferredTimes?.slice(0, 2).map((time: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Budget moyen:</span>
                        <span className="font-medium text-mako-green">
                          {Math.round(userPatterns.averageOrderValue || 0)} FCFA
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Fréquence:</span>
                        <span className="font-medium">
                          {userPatterns.deliveryFrequency || 0} livraisons
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Profil:</span>
                        <Badge className={
                          userPatterns.urgencyPattern === 'express' ? 'bg-red-100 text-red-800' :
                          userPatterns.urgencyPattern === 'mixed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {userPatterns.urgencyPattern}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Frequent Locations */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Lieux fréquents</h4>
                    <div className="space-y-3">
                      {userPatterns.frequentLocations?.pickup?.slice(0, 2).map((location: any, index: number) => (
                        <div key={index} className="text-sm">
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-map-marker-alt text-blue-500"></i>
                            <span className="font-medium">Ramassage:</span>
                          </div>
                          <div className="text-gray-600 ml-5 truncate">
                            {location.address} ({location.frequency}x)
                          </div>
                        </div>
                      ))}
                      
                      {userPatterns.frequentLocations?.delivery?.slice(0, 2).map((location: any, index: number) => (
                        <div key={index} className="text-sm">
                          <div className="flex items-center space-x-2">
                            <i className="fas fa-home text-green-500"></i>
                            <span className="font-medium">Livraison:</span>
                          </div>
                          <div className="text-gray-600 ml-5 truncate">
                            {location.address} ({location.frequency}x)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Insights */}
          {insights && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-lightbulb text-mako-green"></i>
                  <span>Insights avancés</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {insights.efficiencyMetrics?.onTimeRate || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Livraisons à l'heure</div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {insights.efficiencyMetrics?.satisfactionScore || 0}/5
                    </div>
                    <div className="text-sm text-gray-600">Satisfaction moyenne</div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {insights.deliveryFrequency?.monthly || 0}
                    </div>
                    <div className="text-sm text-gray-600">Livraisons/mois</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Zones d'activité</h4>
                  <div className="flex flex-wrap gap-2">
                    {insights.locationPatterns?.coverage?.map((zone: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {zone}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No data state */}
          {!userPatterns && !insights && user && (
            <Alert>
              <i className="fas fa-info-circle"></i>
              <AlertDescription>
                Commencez à utiliser MAKOEXPRESS pour recevoir des recommandations personnalisées basées sur vos habitudes de livraison.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}