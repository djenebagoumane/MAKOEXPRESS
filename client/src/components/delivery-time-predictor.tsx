import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDeliveryPredictor } from "@/hooks/useDeliveryPredictor";

interface DeliveryTimePredictorProps {
  pickupAddress: string;
  deliveryAddress: string;
  packageType?: string;
  onPredictionUpdate?: (prediction: any) => void;
  className?: string;
}

export default function DeliveryTimePredictor({
  pickupAddress,
  deliveryAddress,
  packageType = 'standard',
  onPredictionUpdate,
  className = ""
}: DeliveryTimePredictorProps) {
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { predictDeliveryTime, trafficData, weatherData } = useDeliveryPredictor();

  useEffect(() => {
    if (pickupAddress && deliveryAddress) {
      generatePrediction();
    }
  }, [pickupAddress, deliveryAddress, packageType]);

  const generatePrediction = async () => {
    setIsLoading(true);
    try {
      const result = await predictDeliveryTime(pickupAddress, deliveryAddress, packageType);
      setPrediction(result);
      onPredictionUpdate?.(result);
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'Très fiable';
    if (confidence >= 0.6) return 'Fiable';
    return 'Estimation approximative';
  };

  const getImpactColor = (impact: number): string => {
    if (Math.abs(impact) < 5) return 'text-gray-600';
    if (impact > 0) return 'text-red-600';
    return 'text-green-600';
  };

  const getImpactIcon = (impact: number): string => {
    if (Math.abs(impact) < 5) return 'fas fa-minus';
    if (impact > 0) return 'fas fa-arrow-up';
    return 'fas fa-arrow-down';
  };

  if (isLoading) {
    return (
      <Card className={`border-blue-200 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-500 mr-3"></i>
            <span className="text-gray-700">Calcul des prédictions en cours...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <i className="fas fa-clock text-3xl text-gray-400 mb-3"></i>
          <p className="text-gray-600">Aucune prédiction disponible</p>
          <Button
            onClick={generatePrediction}
            size="sm"
            className="mt-3"
          >
            <i className="fas fa-calculator mr-2"></i>
            Calculer le temps
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-l-4 border-l-blue-500 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-gray-900">
            <i className="fas fa-route mr-2 text-blue-500"></i>
            Prédiction de livraison
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={`${getConfidenceColor(prediction.confidence)} bg-transparent border`}>
              {Math.round(prediction.confidence * 100)}% {getConfidenceLabel(prediction.confidence)}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="p-1"
            >
              <i className={`fas fa-chevron-${showDetails ? 'up' : 'down'}`}></i>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Prediction */}
        <div className="text-center bg-blue-50 rounded-lg p-4">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {formatTime(prediction.estimatedTime)}
          </div>
          <p className="text-sm text-gray-600">Temps estimé de livraison</p>
          {prediction.optimalDepartureTime && (
            <p className="text-xs text-blue-600 mt-2">
              <i className="fas fa-clock mr-1"></i>
              Départ optimal : {prediction.optimalDepartureTime}
            </p>
          )}
        </div>

        {/* Quick Factors Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Trafic</span>
            <div className="flex items-center">
              {trafficData ? (
                <Badge variant="outline" className="text-xs">
                  {trafficData.congestionLevel || 'Normal'}
                </Badge>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Météo</span>
            <div className="flex items-center">
              {prediction.weatherImpact !== 0 && (
                <span className={`text-xs ${prediction.weatherImpact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {prediction.weatherImpact > 0 ? '+' : ''}{prediction.weatherImpact}%
                </span>
              )}
              {weatherData && (
                <i className={`fas fa-${weatherData.icon} ml-1 text-blue-500`}></i>
              )}
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Confiance de la prédiction</span>
            <span>{Math.round(prediction.confidence * 100)}%</span>
          </div>
          <Progress 
            value={prediction.confidence * 100} 
            className="h-2"
          />
        </div>

        {showDetails && (
          <>
            {/* Detailed Factors */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <i className="fas fa-analytics mr-2 text-blue-500"></i>
                Facteurs d'influence
              </h4>
              {prediction.factors.map((factor: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{factor.name}</p>
                    <p className="text-xs text-gray-600">{factor.description}</p>
                  </div>
                  <div className="flex items-center ml-3">
                    <i className={`${getImpactIcon(factor.impact)} mr-1 ${getImpactColor(factor.impact)}`}></i>
                    <span className={`text-sm font-medium ${getImpactColor(factor.impact)}`}>
                      {factor.impact > 0 ? '+' : ''}{Math.round(factor.impact)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Alternative Routes */}
            {prediction.alternativeRoutes && prediction.alternativeRoutes.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <i className="fas fa-map-signs mr-2 text-blue-500"></i>
                  Routes alternatives
                </h4>
                {prediction.alternativeRoutes.map((route: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                    <div>
                      <p className="text-sm font-medium">Route {index + 1}</p>
                      <p className="text-xs text-gray-600">
                        {route.distance} km • Trafic {route.trafficLevel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">
                        {formatTime(route.estimatedTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Data Sources */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <i className="fas fa-database mr-2 text-blue-500"></i>
                Sources de données
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className={`flex items-center ${trafficData ? 'text-green-600' : 'text-gray-400'}`}>
                  <i className={`fas fa-${trafficData ? 'check' : 'times'} mr-1`}></i>
                  Trafic temps réel
                </div>
                <div className={`flex items-center ${weatherData ? 'text-green-600' : 'text-gray-400'}`}>
                  <i className={`fas fa-${weatherData ? 'check' : 'times'} mr-1`}></i>
                  Données météo
                </div>
                <div className="flex items-center text-green-600">
                  <i className="fas fa-check mr-1"></i>
                  Données historiques
                </div>
              </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={generatePrediction}
                size="sm"
                variant="outline"
                disabled={isLoading}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Actualiser la prédiction
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}