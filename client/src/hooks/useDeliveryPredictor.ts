import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface TrafficData {
  roadSegmentId: string;
  averageSpeed: number;
  congestionLevel: 'low' | 'medium' | 'high' | 'severe';
  incidents: Array<{
    type: 'accident' | 'construction' | 'weather' | 'event';
    severity: number;
    estimatedDelay: number;
  }>;
  historicalData: Array<{
    hour: number;
    dayOfWeek: number;
    averageSpeed: number;
    deliveryCount: number;
  }>;
}

interface DeliveryPrediction {
  estimatedTime: number;
  confidence: number;
  factors: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
  alternativeRoutes: Array<{
    routeId: string;
    estimatedTime: number;
    distance: number;
    trafficLevel: string;
  }>;
  optimalDepartureTime: string;
  weatherImpact: number;
}

interface PredictorSettings {
  useTrafficData: boolean;
  useWeatherData: boolean;
  useHistoricalData: boolean;
  confidenceThreshold: number;
  updateInterval: number;
}

const MALI_ROAD_SEGMENTS = {
  // Bamako routes principales
  'bamako_center': {
    name: 'Centre de Bamako',
    baseSpeed: 25, // km/h average in city center
    peakHours: [7, 8, 17, 18, 19],
    marketDays: [1, 3, 6] // Monday, Wednesday, Saturday
  },
  'bamako_suburbs': {
    name: 'Banlieue de Bamako',
    baseSpeed: 35,
    peakHours: [7, 8, 17, 18],
    marketDays: []
  },
  // Routes inter-villes
  'bamako_sikasso': {
    name: 'Bamako - Sikasso',
    baseSpeed: 60,
    peakHours: [6, 7, 18, 19],
    marketDays: [6] // Saturday market traffic
  },
  'bamako_segou': {
    name: 'Bamako - Ségou',
    baseSpeed: 55,
    peakHours: [6, 7, 18],
    marketDays: [2, 5] // Tuesday, Friday
  },
  'segou_mopti': {
    name: 'Ségou - Mopti',
    baseSpeed: 50,
    peakHours: [6, 18],
    marketDays: [1, 4] // Monday, Thursday
  }
};

export function useDeliveryPredictor() {
  const [settings, setSettings] = useState<PredictorSettings>({
    useTrafficData: true,
    useWeatherData: true,
    useHistoricalData: true,
    confidenceThreshold: 0.7,
    updateInterval: 300000 // 5 minutes
  });

  // Get current traffic data from Mali road network
  const { data: trafficData, refetch: refetchTraffic } = useQuery({
    queryKey: ["/api/traffic/current"],
    refetchInterval: settings.updateInterval,
    enabled: settings.useTrafficData
  });

  // Get weather data for delivery impact analysis
  const { data: weatherData } = useQuery({
    queryKey: ["/api/weather"],
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    enabled: settings.useWeatherData
  });

  // Get historical delivery performance data
  const { data: historicalData } = useQuery({
    queryKey: ["/api/delivery/historical"],
    refetchInterval: 60 * 60 * 1000, // 1 hour
    enabled: settings.useHistoricalData
  });

  const predictDeliveryTime = async (
    pickupAddress: string,
    deliveryAddress: string,
    packageType: string = 'standard',
    departureTime?: Date
  ): Promise<DeliveryPrediction> => {
    const departure = departureTime || new Date();
    const hour = departure.getHours();
    const dayOfWeek = departure.getDay();

    // Determine route segment
    const routeSegment = determineRouteSegment(pickupAddress, deliveryAddress);
    const segmentData = MALI_ROAD_SEGMENTS[routeSegment];

    // Calculate base distance and time
    const distance = calculateDistance(pickupAddress, deliveryAddress);
    let baseTime = (distance / segmentData.baseSpeed) * 60; // minutes

    // Apply traffic factors
    const trafficFactor = calculateTrafficFactor(routeSegment, hour, dayOfWeek);
    const weatherFactor = calculateWeatherFactor();
    const historicalFactor = calculateHistoricalFactor(routeSegment, hour, dayOfWeek);
    const packageFactor = calculatePackageFactor(packageType);

    // Combine all factors
    const adjustedTime = baseTime * trafficFactor * weatherFactor * historicalFactor * packageFactor;

    // Calculate confidence based on data availability
    const confidence = calculateConfidence([
      settings.useTrafficData && trafficData ? 0.3 : 0,
      settings.useWeatherData && weatherData ? 0.2 : 0,
      settings.useHistoricalData && historicalData ? 0.4 : 0,
      0.1 // base confidence
    ]);

    // Generate factors explanation
    const factors = [
      {
        name: 'Conditions de trafic',
        impact: (trafficFactor - 1) * 100,
        description: getTrafficDescription(trafficFactor)
      },
      {
        name: 'Conditions météo',
        impact: (weatherFactor - 1) * 100,
        description: getWeatherDescription(weatherFactor)
      },
      {
        name: 'Données historiques',
        impact: (historicalFactor - 1) * 100,
        description: getHistoricalDescription(historicalFactor)
      },
      {
        name: 'Type de colis',
        impact: (packageFactor - 1) * 100,
        description: getPackageDescription(packageFactor, packageType)
      }
    ];

    // Find alternative routes
    const alternativeRoutes = findAlternativeRoutes(pickupAddress, deliveryAddress);

    // Calculate optimal departure time
    const optimalDeparture = findOptimalDepartureTime(routeSegment, adjustedTime);

    return {
      estimatedTime: Math.round(adjustedTime),
      confidence: Math.round(confidence * 100) / 100,
      factors,
      alternativeRoutes,
      optimalDepartureTime: optimalDeparture,
      weatherImpact: Math.round((weatherFactor - 1) * 100)
    };
  };

  const determineRouteSegment = (pickup: string, delivery: string): string => {
    const pickupCity = extractCity(pickup);
    const deliveryCity = extractCity(delivery);

    if (pickupCity === 'bamako' && deliveryCity === 'bamako') {
      return pickup.toLowerCase().includes('centre') || delivery.toLowerCase().includes('centre') 
        ? 'bamako_center' : 'bamako_suburbs';
    }
    if ((pickupCity === 'bamako' && deliveryCity === 'sikasso') || 
        (pickupCity === 'sikasso' && deliveryCity === 'bamako')) {
      return 'bamako_sikasso';
    }
    if ((pickupCity === 'bamako' && deliveryCity === 'segou') || 
        (pickupCity === 'segou' && deliveryCity === 'bamako')) {
      return 'bamako_segou';
    }
    if ((pickupCity === 'segou' && deliveryCity === 'mopti') || 
        (pickupCity === 'mopti' && deliveryCity === 'segou')) {
      return 'segou_mopti';
    }
    return 'bamako_center'; // default
  };

  const extractCity = (address: string): string => {
    const cities = ['bamako', 'sikasso', 'segou', 'ségou', 'mopti'];
    for (const city of cities) {
      if (address.toLowerCase().includes(city)) {
        return city === 'ségou' ? 'segou' : city;
      }
    }
    return 'bamako';
  };

  const calculateDistance = (pickup: string, delivery: string): number => {
    // Approximate distances between Mali cities (km)
    const distances: Record<string, Record<string, number>> = {
      'bamako': { 'bamako': 15, 'sikasso': 375, 'segou': 240, 'mopti': 635 },
      'sikasso': { 'bamako': 375, 'sikasso': 10, 'segou': 350, 'mopti': 580 },
      'segou': { 'bamako': 240, 'sikasso': 350, 'segou': 8, 'mopti': 280 },
      'mopti': { 'bamako': 635, 'sikasso': 580, 'segou': 280, 'mopti': 12 }
    };

    const pickupCity = extractCity(pickup);
    const deliveryCity = extractCity(delivery);
    
    return distances[pickupCity]?.[deliveryCity] || 20; // default city distance
  };

  const calculateTrafficFactor = (routeSegment: string, hour: number, dayOfWeek: number): number => {
    const segment = MALI_ROAD_SEGMENTS[routeSegment];
    let factor = 1.0;

    // Peak hours impact
    if (segment.peakHours.includes(hour)) {
      factor *= 1.4; // 40% slower during peak hours
    }

    // Market days impact
    if (segment.marketDays.includes(dayOfWeek)) {
      factor *= 1.2; // 20% slower on market days
    }

    // Real-time traffic data
    if (trafficData) {
      const currentTraffic = trafficData.segments?.[routeSegment];
      if (currentTraffic) {
        switch (currentTraffic.congestionLevel) {
          case 'severe': factor *= 1.8; break;
          case 'high': factor *= 1.5; break;
          case 'medium': factor *= 1.2; break;
          case 'low': factor *= 0.9; break;
        }
      }
    }

    return Math.min(factor, 2.5); // Cap at 150% increase
  };

  const calculateWeatherFactor = (): number => {
    if (!weatherData) return 1.0;

    let factor = 1.0;
    const condition = weatherData.condition?.toLowerCase() || '';

    if (condition.includes('rain') || condition.includes('pluie')) {
      factor *= 1.3; // 30% slower in rain
    }
    if (condition.includes('storm') || condition.includes('orage')) {
      factor *= 1.6; // 60% slower in storms
    }
    if (weatherData.windSpeed > 15) {
      factor *= 1.1; // 10% slower in high winds
    }
    if (weatherData.temperature > 40) {
      factor *= 1.1; // 10% slower in extreme heat
    }

    return Math.min(factor, 2.0);
  };

  const calculateHistoricalFactor = (routeSegment: string, hour: number, dayOfWeek: number): number => {
    if (!historicalData) return 1.0;

    const historicalEntry = historicalData.find((entry: any) => 
      entry.routeSegment === routeSegment && 
      entry.hour === hour && 
      entry.dayOfWeek === dayOfWeek
    );

    if (historicalEntry) {
      return historicalEntry.performanceFactor || 1.0;
    }

    return 1.0;
  };

  const calculatePackageFactor = (packageType: string): number => {
    switch (packageType.toLowerCase()) {
      case 'express': return 0.8; // 20% faster
      case 'fragile': return 1.2; // 20% slower for careful handling
      case 'heavy': return 1.1; // 10% slower for heavy items
      default: return 1.0;
    }
  };

  const calculateConfidence = (factors: number[]): number => {
    const totalWeight = factors.reduce((sum, factor) => sum + factor, 0);
    return Math.min(totalWeight, 1.0);
  };

  const getTrafficDescription = (factor: number): string => {
    if (factor > 1.5) return 'Trafic très dense';
    if (factor > 1.2) return 'Trafic modéré';
    if (factor < 0.95) return 'Trafic fluide';
    return 'Trafic normal';
  };

  const getWeatherDescription = (factor: number): string => {
    if (factor > 1.4) return 'Conditions météo difficiles';
    if (factor > 1.1) return 'Conditions météo défavorables';
    return 'Conditions météo favorables';
  };

  const getHistoricalDescription = (factor: number): string => {
    if (factor > 1.1) return 'Historiquement plus lent';
    if (factor < 0.9) return 'Historiquement plus rapide';
    return 'Performance habituelle';
  };

  const getPackageDescription = (factor: number, packageType: string): string => {
    if (packageType === 'express') return 'Livraison express prioritaire';
    if (packageType === 'fragile') return 'Manipulation délicate requise';
    if (packageType === 'heavy') return 'Colis lourd - temps supplémentaire';
    return 'Livraison standard';
  };

  const findAlternativeRoutes = (pickup: string, delivery: string) => {
    // Generate alternative route suggestions
    return [
      {
        routeId: 'route_1',
        estimatedTime: 45,
        distance: 12.5,
        trafficLevel: 'moyen'
      },
      {
        routeId: 'route_2',
        estimatedTime: 52,
        distance: 15.2,
        trafficLevel: 'faible'
      }
    ];
  };

  const findOptimalDepartureTime = (routeSegment: string, estimatedTime: number): string => {
    const now = new Date();
    const optimal = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
    return optimal.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return {
    predictDeliveryTime,
    settings,
    setSettings,
    trafficData,
    weatherData,
    historicalData,
    refetchTraffic
  };
}