import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UserPreferences {
  preferredDeliveryTime: string;
  preferredPackageTypes: string[];
  frequentAddresses: any[];
  budgetRange: string;
  urgencyPreference: string;
  preferredDrivers: string[];
  deliveryPatterns: any;
}

interface DeliveryRecommendation {
  id: number;
  recommendationType: string;
  title: string;
  description: string;
  suggestedPickupAddress?: string;
  suggestedDeliveryAddress?: string;
  suggestedTime?: string;
  estimatedPrice?: number;
  estimatedDuration?: number;
  confidence: number;
  metadata?: any;
  savings?: {
    timeSaved: number;
    moneySaved: number;
    reason: string;
  };
}

export function useRecommendationEngine() {
  const queryClient = useQueryClient();

  // Get user preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ["/api/user/preferences"],
  });

  // Get personalized recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ["/api/recommendations"],
  });

  // Get delivery insights
  const { data: insights } = useQuery({
    queryKey: ["/api/user/delivery-insights"],
  });

  // Update user preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<UserPreferences>) => {
      return await apiRequest("/api/user/preferences", {
        method: "PUT",
        body: JSON.stringify(newPreferences),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });

  // Accept a recommendation
  const acceptRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: number) => {
      return await apiRequest(`/api/recommendations/${recommendationId}/accept`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });

  // Dismiss a recommendation
  const dismissRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: number) => {
      return await apiRequest(`/api/recommendations/${recommendationId}/dismiss`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });

  // Generate new recommendations based on current context
  const generateRecommendationsMutation = useMutation({
    mutationFn: async (context: {
      pickupAddress?: string;
      deliveryAddress?: string;
      packageType?: string;
      urgency?: string;
    }) => {
      return await apiRequest("/api/recommendations/generate", {
        method: "POST",
        body: JSON.stringify(context),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });

  // Analyze delivery patterns and update preferences automatically
  const analyzePatternsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/user/analyze-patterns", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/delivery-insights"] });
    },
  });

  const getRecommendationsByType = (type: string) => {
    return recommendations?.filter((rec: DeliveryRecommendation) => 
      rec.recommendationType === type
    ) || [];
  };

  const getHighConfidenceRecommendations = () => {
    return recommendations?.filter((rec: DeliveryRecommendation) => 
      rec.confidence >= 0.8
    ) || [];
  };

  const calculatePotentialSavings = () => {
    if (!recommendations) return { time: 0, money: 0 };
    
    return recommendations.reduce((total: any, rec: DeliveryRecommendation) => {
      if (rec.savings) {
        total.time += rec.savings.timeSaved;
        total.money += rec.savings.moneySaved;
      }
      return total;
    }, { time: 0, money: 0 });
  };

  return {
    preferences,
    recommendations,
    insights,
    isLoading: preferencesLoading || recommendationsLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    acceptRecommendation: acceptRecommendationMutation.mutate,
    dismissRecommendation: dismissRecommendationMutation.mutate,
    generateRecommendations: generateRecommendationsMutation.mutate,
    analyzePatterns: analyzePatternsMutation.mutate,
    getRecommendationsByType,
    getHighConfidenceRecommendations,
    calculatePotentialSavings,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    isGenerating: generateRecommendationsMutation.isPending,
    isAnalyzing: analyzePatternsMutation.isPending,
  };
}