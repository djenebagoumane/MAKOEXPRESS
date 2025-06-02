import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
  description: string;
}

interface WeatherWidgetProps {
  location?: string;
  className?: string;
  compact?: boolean;
}

export default function WeatherWidget({ 
  location = "Bamako", 
  className = "", 
  compact = false 
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, [location]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using OpenWeatherMap API for authentic weather data
      const response = await fetch(
        `/api/weather?location=${encodeURIComponent(location)}`
      );
      
      if (!response.ok) {
        throw new Error("Impossible de récupérer les données météo");
      }
      
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur météo");
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryAdvice = (condition: string, windSpeed: number) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes("rain") || lowerCondition.includes("storm")) {
      return {
        level: "warning",
        message: "Livraisons possibles mais délais prolongés",
        icon: "fas fa-exclamation-triangle"
      };
    }
    
    if (windSpeed > 25) {
      return {
        level: "caution",
        message: "Vents forts - prudence pour les motos",
        icon: "fas fa-wind"
      };
    }
    
    if (lowerCondition.includes("clear") || lowerCondition.includes("sunny")) {
      return {
        level: "good",
        message: "Conditions idéales pour les livraisons",
        icon: "fas fa-check-circle"
      };
    }
    
    return {
      level: "normal",
      message: "Conditions normales de livraison",
      icon: "fas fa-info-circle"
    };
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes("rain")) return "fas fa-cloud-rain";
    if (lowerCondition.includes("storm")) return "fas fa-bolt";
    if (lowerCondition.includes("cloud")) return "fas fa-cloud";
    if (lowerCondition.includes("clear") || lowerCondition.includes("sunny")) return "fas fa-sun";
    if (lowerCondition.includes("wind")) return "fas fa-wind";
    
    return "fas fa-cloud-sun";
  };

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br from-blue-50 to-blue-100 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin">
              <i className="fas fa-spinner text-blue-600 text-xl"></i>
            </div>
            <span className="text-blue-800">Chargement météo...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-gradient-to-br from-red-50 to-red-100 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <i className="fas fa-exclamation-circle text-red-600 text-xl"></i>
            <div>
              <p className="text-red-800 font-medium">Météo indisponible</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  const advice = getDeliveryAdvice(weather.condition, weather.windSpeed);

  if (compact) {
    return (
      <Card className={`bg-gradient-to-br from-blue-50 to-blue-100 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className={`${getWeatherIcon(weather.condition)} text-blue-600 text-lg`}></i>
              <div>
                <p className="font-semibold text-blue-900">{weather.temperature}°C</p>
                <p className="text-xs text-blue-700">{weather.location}</p>
              </div>
            </div>
            <Badge 
              variant={advice.level === "warning" ? "destructive" : 
                     advice.level === "caution" ? "secondary" : "default"}
              className="text-xs"
            >
              <i className={`${advice.icon} mr-1`}></i>
              {advice.level === "warning" ? "Attention" : 
               advice.level === "caution" ? "Prudence" : "OK"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-blue-100 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-blue-900">
          <i className="fas fa-map-marker-alt text-blue-600"></i>
          <span>Météo - {weather.location}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Conditions actuelles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center">
              <i className={`${getWeatherIcon(weather.condition)} text-blue-600 text-2xl`}></i>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-900">{weather.temperature}°C</p>
              <p className="text-blue-700 capitalize">{weather.description}</p>
            </div>
          </div>
        </div>

        {/* Détails météo */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-200">
          <div className="flex items-center space-x-2">
            <i className="fas fa-tint text-blue-600"></i>
            <span className="text-sm text-blue-800">Humidité: {weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-wind text-blue-600"></i>
            <span className="text-sm text-blue-800">Vent: {weather.windSpeed} km/h</span>
          </div>
        </div>

        {/* Conseil livraison */}
        <div className={`p-3 rounded-lg border-l-4 ${
          advice.level === "warning" ? "bg-red-50 border-red-400" :
          advice.level === "caution" ? "bg-yellow-50 border-yellow-400" :
          advice.level === "good" ? "bg-green-50 border-green-400" :
          "bg-blue-50 border-blue-400"
        }`}>
          <div className="flex items-center space-x-2">
            <i className={`${advice.icon} ${
              advice.level === "warning" ? "text-red-600" :
              advice.level === "caution" ? "text-yellow-600" :
              advice.level === "good" ? "text-green-600" :
              "text-blue-600"
            }`}></i>
            <span className={`text-sm font-medium ${
              advice.level === "warning" ? "text-red-800" :
              advice.level === "caution" ? "text-yellow-800" :
              advice.level === "good" ? "text-green-800" :
              "text-blue-800"
            }`}>
              {advice.message}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}