import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
  reward?: {
    type: 'bonus' | 'privilege';
    value: string;
  };
}

interface DriverAchievementBadgesProps {
  driverStats: {
    totalDeliveries: number;
    averageRating: number;
    onTimeRate: number;
    totalEarnings: number;
    consecutiveDays: number;
    customerSatisfaction: number;
  };
  className?: string;
}

export default function DriverAchievementBadges({
  driverStats,
  className = ""
}: DriverAchievementBadgesProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);

  useEffect(() => {
    // Calculate achievements based on driver stats
    const calculatedAchievements: Achievement[] = [
      // Delivery Milestones
      {
        id: "first_delivery",
        title: "Premier Pas",
        description: "Effectuer votre première livraison",
        icon: "fa-baby",
        category: "milestones",
        rarity: "bronze",
        isUnlocked: driverStats.totalDeliveries >= 1,
        reward: { type: "bonus", value: "500 FCFA" }
      },
      {
        id: "delivery_10",
        title: "Apprenti Livreur",
        description: "Effectuer 10 livraisons",
        icon: "fa-bicycle",
        category: "milestones",
        rarity: "bronze",
        isUnlocked: driverStats.totalDeliveries >= 10,
        progress: Math.min(driverStats.totalDeliveries, 10),
        maxProgress: 10,
        reward: { type: "bonus", value: "1,000 FCFA" }
      },
      {
        id: "delivery_50",
        title: "Livreur Confirmé",
        description: "Effectuer 50 livraisons",
        icon: "fa-motorcycle",
        category: "milestones",
        rarity: "silver",
        isUnlocked: driverStats.totalDeliveries >= 50,
        progress: Math.min(driverStats.totalDeliveries, 50),
        maxProgress: 50,
        reward: { type: "bonus", value: "5,000 FCFA" }
      },
      {
        id: "delivery_100",
        title: "Expert Livraison",
        description: "Effectuer 100 livraisons",
        icon: "fa-truck",
        category: "milestones",
        rarity: "gold",
        isUnlocked: driverStats.totalDeliveries >= 100,
        progress: Math.min(driverStats.totalDeliveries, 100),
        maxProgress: 100,
        reward: { type: "privilege", value: "Priorité sur les commandes" }
      },
      {
        id: "delivery_500",
        title: "Maître Livreur",
        description: "Effectuer 500 livraisons",
        icon: "fa-crown",
        category: "milestones",
        rarity: "platinum",
        isUnlocked: driverStats.totalDeliveries >= 500,
        progress: Math.min(driverStats.totalDeliveries, 500),
        maxProgress: 500,
        reward: { type: "bonus", value: "50,000 FCFA + Badge VIP" }
      },

      // Quality Achievements
      {
        id: "perfect_rating",
        title: "Excellence",
        description: "Maintenir une note de 5/5",
        icon: "fa-star",
        category: "quality",
        rarity: "gold",
        isUnlocked: driverStats.averageRating >= 5.0,
        reward: { type: "bonus", value: "2,000 FCFA" }
      },
      {
        id: "high_rating",
        title: "Service de Qualité",
        description: "Maintenir une note supérieure à 4.5/5",
        icon: "fa-thumbs-up",
        category: "quality",
        rarity: "silver",
        isUnlocked: driverStats.averageRating >= 4.5,
        reward: { type: "privilege", value: "Badge Qualité" }
      },
      {
        id: "punctual_pro",
        title: "Ponctualité Pro",
        description: "Taux de ponctualité de 95%+",
        icon: "fa-clock",
        category: "quality",
        rarity: "gold",
        isUnlocked: driverStats.onTimeRate >= 95,
        progress: Math.min(driverStats.onTimeRate, 95),
        maxProgress: 95,
        reward: { type: "bonus", value: "3,000 FCFA" }
      },

      // Earnings Achievements
      {
        id: "first_10k",
        title: "Premiers Gains",
        description: "Gagner 10,000 FCFA",
        icon: "fa-coins",
        category: "earnings",
        rarity: "bronze",
        isUnlocked: driverStats.totalEarnings >= 10000,
        progress: Math.min(driverStats.totalEarnings, 10000),
        maxProgress: 10000
      },
      {
        id: "earner_100k",
        title: "Entrepreneur",
        description: "Gagner 100,000 FCFA",
        icon: "fa-money-bill-wave",
        category: "earnings",
        rarity: "silver",
        isUnlocked: driverStats.totalEarnings >= 100000,
        progress: Math.min(driverStats.totalEarnings, 100000),
        maxProgress: 100000,
        reward: { type: "bonus", value: "5% bonus pendant 1 semaine" }
      },
      {
        id: "big_earner",
        title: "Millionnaire",
        description: "Gagner 1,000,000 FCFA",
        icon: "fa-gem",
        category: "earnings",
        rarity: "platinum",
        isUnlocked: driverStats.totalEarnings >= 1000000,
        progress: Math.min(driverStats.totalEarnings, 1000000),
        maxProgress: 1000000,
        reward: { type: "bonus", value: "100,000 FCFA + Statut VIP" }
      },

      // Loyalty Achievements
      {
        id: "consistent_week",
        title: "Régularité",
        description: "Livrer 7 jours consécutifs",
        icon: "fa-calendar-check",
        category: "loyalty",
        rarity: "silver",
        isUnlocked: driverStats.consecutiveDays >= 7,
        progress: Math.min(driverStats.consecutiveDays, 7),
        maxProgress: 7,
        reward: { type: "bonus", value: "1,500 FCFA" }
      },
      {
        id: "monthly_warrior",
        title: "Guerrier du Mois",
        description: "Livrer 30 jours consécutifs",
        icon: "fa-fire",
        category: "loyalty",
        rarity: "gold",
        isUnlocked: driverStats.consecutiveDays >= 30,
        progress: Math.min(driverStats.consecutiveDays, 30),
        maxProgress: 30,
        reward: { type: "privilege", value: "10% bonus permanent" }
      }
    ];

    // Add unlock dates for unlocked achievements
    const achievementsWithDates = calculatedAchievements.map(achievement => {
      if (achievement.isUnlocked && !achievement.unlockedAt) {
        achievement.unlockedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
      }
      return achievement;
    });

    setAchievements(achievementsWithDates);

    // Check for new unlocks (simulate)
    const recentUnlocks = achievementsWithDates
      .filter(a => a.isUnlocked && a.unlockedAt && new Date(a.unlockedAt) > new Date(Date.now() - 5000))
      .map(a => a.id);
    
    if (recentUnlocks.length > 0) {
      setNewUnlocks(recentUnlocks);
      setTimeout(() => setNewUnlocks([]), 5000);
    }
  }, [driverStats]);

  const categories = [
    { id: "all", label: "Tous", icon: "fa-trophy" },
    { id: "milestones", label: "Étapes", icon: "fa-flag-checkered" },
    { id: "quality", label: "Qualité", icon: "fa-star" },
    { id: "earnings", label: "Gains", icon: "fa-coins" },
    { id: "loyalty", label: "Fidélité", icon: "fa-heart" }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return 'from-amber-400 to-orange-500';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-300 to-gray-500';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'bronze': return 'border-orange-300';
      case 'silver': return 'border-gray-300';
      case 'gold': return 'border-yellow-300';
      case 'platinum': return 'border-purple-300';
      default: return 'border-gray-300';
    }
  };

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionRate = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* New Unlock Notifications */}
      {newUnlocks.map(unlockId => {
        const achievement = achievements.find(a => a.id === unlockId);
        if (!achievement) return null;
        
        return (
          <div
            key={unlockId}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg animate-bounce"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <i className={`fas ${achievement.icon} text-xl`}></i>
              </div>
              <div>
                <h4 className="font-bold">Badge Débloqué!</h4>
                <p className="text-sm">{achievement.title}</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Progress Overview */}
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <i className="fas fa-trophy text-yellow-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-800">Progression des Badges</h3>
                <p className="text-yellow-600">{unlockedCount} sur {totalCount} débloqués</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-800">{completionRate}%</div>
              <p className="text-sm text-yellow-600">Completé</p>
            </div>
          </div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center space-x-2"
          >
            <i className={`fas ${category.icon}`}></i>
            <span>{category.label}</span>
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <Card
            key={achievement.id}
            className={`relative overflow-hidden transition-all hover:shadow-lg ${
              achievement.isUnlocked 
                ? `${getRarityBorder(achievement.rarity)} bg-gradient-to-br from-white to-gray-50`
                : 'border-gray-200 bg-gray-50 opacity-75'
            }`}
          >
            {/* Rarity Indicator */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}></div>
            
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.isUnlocked 
                    ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white`
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <i className={`fas ${achievement.icon} text-lg`}></i>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold ${achievement.isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h4>
                    {achievement.isUnlocked && (
                      <Badge className={`${getRarityColor(achievement.rarity)} text-white text-xs`}>
                        {achievement.rarity.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  
                  <p className={`text-sm mb-3 ${achievement.isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {achievement.maxProgress && !achievement.isUnlocked && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{achievement.progress || 0}</span>
                        <span>{achievement.maxProgress}</span>
                      </div>
                      <Progress 
                        value={((achievement.progress || 0) / achievement.maxProgress) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Reward */}
                  {achievement.reward && achievement.isUnlocked && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                      <p className="text-xs text-green-700">
                        <i className="fas fa-gift mr-1"></i>
                        Récompense: {achievement.reward.value}
                      </p>
                    </div>
                  )}

                  {/* Unlock Date */}
                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-gray-500">
                      Débloqué le {new Date(achievement.unlockedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-target mr-2 text-mako-green"></i>
            Prochains Objectifs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements
              .filter(a => !a.isUnlocked && a.maxProgress)
              .slice(0, 3)
              .map(achievement => (
                <div key={achievement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <i className={`fas ${achievement.icon} text-gray-500`}></i>
                    </div>
                    <div>
                      <h5 className="font-medium">{achievement.title}</h5>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {achievement.progress || 0} / {achievement.maxProgress}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(((achievement.progress || 0) / achievement.maxProgress!) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}