import { storage } from "./storage";
import type { Order, Driver, User } from "@shared/schema";

export interface UserDeliveryPattern {
  userId: string;
  preferredTimes: string[];
  frequentLocations: {
    pickup: Array<{ address: string; frequency: number }>;
    delivery: Array<{ address: string; frequency: number }>;
  };
  packageTypePreferences: Array<{ type: string; frequency: number }>;
  averageOrderValue: number;
  deliveryFrequency: number;
  urgencyPattern: 'standard' | 'express' | 'mixed';
  budgetRange: 'low' | 'medium' | 'high';
}

export interface DeliveryRecommendation {
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

export class RecommendationEngine {
  
  async analyzeUserPatterns(userId: string): Promise<UserDeliveryPattern> {
    const userOrders = await storage.getOrdersByCustomer(userId);
    
    if (userOrders.length === 0) {
      return this.getDefaultPattern(userId);
    }

    const patterns = this.extractPatterns(userOrders);
    return patterns;
  }

  private extractPatterns(orders: Order[]): UserDeliveryPattern {
    const timeFrequency: Record<string, number> = {};
    const pickupLocations: Record<string, number> = {};
    const deliveryLocations: Record<string, number> = {};
    const packageTypes: Record<string, number> = {};
    let totalValue = 0;
    let expressCount = 0;

    orders.forEach(order => {
      // Analyze time patterns
      const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
      const hour = createdAt.getHours();
      const timeSlot = this.getTimeSlot(hour);
      timeFrequency[timeSlot] = (timeFrequency[timeSlot] || 0) + 1;

      // Analyze location patterns
      pickupLocations[order.pickupAddress] = (pickupLocations[order.pickupAddress] || 0) + 1;
      deliveryLocations[order.deliveryAddress] = (deliveryLocations[order.deliveryAddress] || 0) + 1;

      // Analyze package types
      packageTypes[order.packageType] = (packageTypes[order.packageType] || 0) + 1;

      // Calculate totals
      totalValue += parseFloat(order.price);
      if (order.urgency === 'express') expressCount++;
    });

    const preferredTimes = Object.entries(timeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([time]) => time);

    const frequentPickups = Object.entries(pickupLocations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([address, frequency]) => ({ address, frequency }));

    const frequentDeliveries = Object.entries(deliveryLocations)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([address, frequency]) => ({ address, frequency }));

    const packagePreferences = Object.entries(packageTypes)
      .sort(([,a], [,b]) => b - a)
      .map(([type, frequency]) => ({ type, frequency }));

    const averageOrderValue = totalValue / orders.length;
    const expressRatio = expressCount / orders.length;

    return {
      userId: orders[0]?.customerId?.toString() || "",
      preferredTimes,
      frequentLocations: {
        pickup: frequentPickups,
        delivery: frequentDeliveries
      },
      packageTypePreferences: packagePreferences,
      averageOrderValue,
      deliveryFrequency: orders.length,
      urgencyPattern: expressRatio > 0.6 ? 'express' : expressRatio > 0.3 ? 'mixed' : 'standard',
      budgetRange: averageOrderValue > 3000 ? 'high' : averageOrderValue > 1500 ? 'medium' : 'low'
    };
  }

  private getTimeSlot(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private getDefaultPattern(userId: string): UserDeliveryPattern {
    return {
      userId,
      preferredTimes: ['afternoon'],
      frequentLocations: { pickup: [], delivery: [] },
      packageTypePreferences: [],
      averageOrderValue: 2000,
      deliveryFrequency: 0,
      urgencyPattern: 'standard',
      budgetRange: 'medium'
    };
  }

  async generateRecommendations(
    userId: string, 
    currentRequest?: {
      pickupAddress?: string;
      deliveryAddress?: string;
      packageType?: string;
      urgency?: string;
    }
  ): Promise<DeliveryRecommendation[]> {
    const patterns = await this.analyzeUserPatterns(userId);
    const recommendations: DeliveryRecommendation[] = [];

    // Time-based recommendations
    const timeRecs = this.generateTimeRecommendations(patterns);
    recommendations.push(...timeRecs);

    // Location-based recommendations
    if (currentRequest?.pickupAddress || currentRequest?.deliveryAddress) {
      const locationRecs = this.generateLocationRecommendations(patterns, currentRequest);
      recommendations.push(...locationRecs);
    }

    // Driver matching recommendations
    const driverRecs = await this.generateDriverRecommendations(patterns, currentRequest);
    recommendations.push(...driverRecs);

    // Price optimization recommendations
    const priceRecs = this.generatePriceRecommendations(patterns, currentRequest);
    recommendations.push(...priceRecs);

    // Route optimization recommendations
    const routeRecs = this.generateRouteRecommendations(patterns, currentRequest);
    recommendations.push(...routeRecs);

    // Sort by confidence and return top recommendations
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private generateTimeRecommendations(patterns: UserDeliveryPattern): DeliveryRecommendation[] {
    const currentHour = new Date().getHours();
    const currentTimeSlot = this.getTimeSlot(currentHour);
    const recommendations: DeliveryRecommendation[] = [];

    // Check if current time matches user preferences
    if (!patterns.preferredTimes.includes(currentTimeSlot)) {
      const preferredTime = patterns.preferredTimes[0];
      const suggestedHour = this.getOptimalHourForTimeSlot(preferredTime);
      
      recommendations.push({
        id: `time_${Date.now()}`,
        type: 'time_suggestion',
        title: 'Meilleur moment pour livrer',
        description: `Basé sur vos habitudes, ${preferredTime} est optimal`,
        confidence: 0.85,
        savings: {
          timeSaved: 15,
          moneySaved: 0,
          reason: 'Période de livraison préférée'
        },
        suggestedAction: {
          timeSlot: preferredTime,
          hour: suggestedHour
        }
      });
    }

    // Peak hour avoidance
    if (currentHour >= 12 && currentHour <= 14) {
      recommendations.push({
        id: `peak_${Date.now()}`,
        type: 'time_suggestion',
        title: 'Éviter l\'heure de pointe',
        description: 'Livraison plus rapide après 15h',
        confidence: 0.75,
        savings: {
          timeSaved: 20,
          moneySaved: 0,
          reason: 'Moins de trafic'
        },
        suggestedAction: {
          timeSlot: 'afternoon',
          hour: 15
        }
      });
    }

    return recommendations;
  }

  private generateLocationRecommendations(
    patterns: UserDeliveryPattern, 
    request: any
  ): DeliveryRecommendation[] {
    const recommendations: DeliveryRecommendation[] = [];

    // Frequent location suggestions
    if (patterns.frequentLocations.pickup.length > 0 && !request.pickupAddress) {
      const topPickup = patterns.frequentLocations.pickup[0];
      recommendations.push({
        id: `pickup_${Date.now()}`,
        type: 'location_suggestion',
        title: 'Adresse de ramassage habituelle',
        description: `Vous utilisez souvent: ${topPickup.address}`,
        confidence: Math.min(0.9, topPickup.frequency / 10),
        savings: {
          timeSaved: 5,
          moneySaved: 0,
          reason: 'Adresse connue du livreur'
        },
        suggestedAction: {
          address: topPickup.address,
          type: 'pickup'
        }
      });
    }

    if (patterns.frequentLocations.delivery.length > 0 && !request.deliveryAddress) {
      const topDelivery = patterns.frequentLocations.delivery[0];
      recommendations.push({
        id: `delivery_${Date.now()}`,
        type: 'location_suggestion',
        title: 'Adresse de livraison habituelle',
        description: `Vous livrez souvent à: ${topDelivery.address}`,
        confidence: Math.min(0.9, topDelivery.frequency / 10),
        savings: {
          timeSaved: 5,
          moneySaved: 0,
          reason: 'Itinéraire familier'
        },
        suggestedAction: {
          address: topDelivery.address,
          type: 'delivery'
        }
      });
    }

    return recommendations;
  }

  private async generateDriverRecommendations(
    patterns: UserDeliveryPattern,
    request: any
  ): Promise<DeliveryRecommendation[]> {
    const recommendations: DeliveryRecommendation[] = [];
    
    try {
      const availableDrivers = await storage.getDrivers();
      const activeDrivers = availableDrivers.filter(d => d.status === 'approved');

      if (activeDrivers.length > 0) {
        // Recommend driver based on package type preference
        if (request?.packageType && patterns.packageTypePreferences.length > 0) {
          const preferredType = patterns.packageTypePreferences[0].type;
          if (preferredType === request.packageType) {
            const driver = activeDrivers[0]; // In real scenario, filter by specialization
            recommendations.push({
              id: `driver_${Date.now()}`,
              type: 'driver_match',
              title: 'Livreur spécialisé recommandé',
              description: `${driver.fullName} excelle avec ${preferredType}`,
              confidence: 0.8,
              savings: {
                timeSaved: 10,
                moneySaved: 0,
                reason: 'Expertise spécialisée'
              },
              suggestedAction: {
                driverId: driver.id,
                driverName: driver.fullName
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error generating driver recommendations:', error);
    }

    return recommendations;
  }

  private generatePriceRecommendations(
    patterns: UserDeliveryPattern,
    request: any
  ): DeliveryRecommendation[] {
    const recommendations: DeliveryRecommendation[] = [];

    // Budget-based recommendations
    if (patterns.budgetRange === 'low' && request?.urgency === 'express') {
      recommendations.push({
        id: `price_${Date.now()}`,
        type: 'price_optimization',
        title: 'Économie sur le prix',
        description: 'Livraison standard recommandée (-40%)',
        confidence: 0.7,
        savings: {
          timeSaved: 0,
          moneySaved: 800,
          reason: 'Correspond à votre budget habituel'
        },
        suggestedAction: {
          urgency: 'standard',
          savings: 800
        }
      });
    }

    // Package type optimization
    if (patterns.packageTypePreferences.length > 0) {
      const mostUsedType = patterns.packageTypePreferences[0];
      if (request?.packageType && request.packageType !== mostUsedType.type) {
        recommendations.push({
          id: `package_${Date.now()}`,
          type: 'price_optimization',
          title: 'Type de colis optimisé',
          description: `Vous utilisez souvent: ${mostUsedType.type}`,
          confidence: 0.6,
          savings: {
            timeSaved: 5,
            moneySaved: 200,
            reason: 'Tarif préférentiel'
          },
          suggestedAction: {
            packageType: mostUsedType.type
          }
        });
      }
    }

    return recommendations;
  }

  private generateRouteRecommendations(
    patterns: UserDeliveryPattern,
    request: any
  ): DeliveryRecommendation[] {
    const recommendations: DeliveryRecommendation[] = [];

    // Route optimization based on frequent locations
    if (patterns.frequentLocations.pickup.length > 0 && 
        patterns.frequentLocations.delivery.length > 0) {
      
      const commonRoute = this.findCommonRoute(patterns);
      if (commonRoute) {
        recommendations.push({
          id: `route_${Date.now()}`,
          type: 'route_optimization',
          title: 'Itinéraire optimisé détecté',
          description: 'Route familière disponible',
          confidence: 0.75,
          savings: {
            timeSaved: 12,
            moneySaved: 0,
            reason: 'Itinéraire fréquemment utilisé'
          },
          suggestedAction: {
            route: commonRoute
          }
        });
      }
    }

    return recommendations;
  }

  private findCommonRoute(patterns: UserDeliveryPattern): any {
    // Find most common pickup-delivery combination
    const topPickup = patterns.frequentLocations.pickup[0]?.address;
    const topDelivery = patterns.frequentLocations.delivery[0]?.address;
    
    if (topPickup && topDelivery) {
      return {
        from: topPickup,
        to: topDelivery,
        frequency: Math.min(
          patterns.frequentLocations.pickup[0].frequency,
          patterns.frequentLocations.delivery[0].frequency
        )
      };
    }
    return null;
  }

  private getOptimalHourForTimeSlot(timeSlot: string): number {
    switch (timeSlot) {
      case 'morning': return 9;
      case 'afternoon': return 14;
      case 'evening': return 18;
      default: return 10;
    }
  }

  async trackRecommendationAcceptance(
    userId: string,
    recommendationId: string,
    accepted: boolean
  ): Promise<void> {
    // In a real implementation, this would update ML model weights
    console.log(`Recommendation ${recommendationId} for user ${userId}: ${accepted ? 'accepted' : 'dismissed'}`);
  }
}

export const recommendationEngine = new RecommendationEngine();