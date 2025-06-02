import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useRecommendationEngine } from "@/hooks/useRecommendationEngine";
import { useToast } from "@/hooks/use-toast";
import RecommendationPanel from "@/components/recommendation-panel";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";

const preferencesSchema = z.object({
  preferredDeliveryTime: z.string(),
  budgetRange: z.string(),
  urgencyPreference: z.string(),
  preferredPackageTypes: z.array(z.string()).min(1, "Sélectionnez au moins un type de colis"),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

export default function SmartRecommendations() {
  const [activeTab, setActiveTab] = useState("recommendations");
  const { toast } = useToast();
  
  const {
    preferences,
    recommendations,
    insights,
    isLoading,
    updatePreferences,
    analyzePatterns,
    getRecommendationsByType,
    calculatePotentialSavings,
    isUpdatingPreferences,
    isAnalyzing
  } = useRecommendationEngine();

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      preferredDeliveryTime: preferences?.preferredDeliveryTime || "afternoon",
      budgetRange: preferences?.budgetRange || "medium",
      urgencyPreference: preferences?.urgencyPreference || "standard",
      preferredPackageTypes: preferences?.preferredPackageTypes || ["documents"],
    },
  });

  const handleUpdatePreferences = (data: PreferencesFormData) => {
    updatePreferences(data);
    toast({
      title: "Préférences mises à jour",
      description: "Vos recommandations seront personnalisées selon vos nouveaux choix",
      variant: "default",
    });
  };

  const handleAnalyzePatterns = () => {
    analyzePatterns();
    toast({
      title: "Analyse en cours",
      description: "Analyse intelligente de vos habitudes de livraison...",
      variant: "default",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const potentialSavings = calculatePotentialSavings();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <i className="fas fa-brain text-4xl text-mako-green mb-4"></i>
            <p className="text-gray-600">Analyse de vos habitudes de livraison...</p>
          </div>
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Recommandations Intelligentes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            IA personnalisée pour optimiser vos livraisons et économiser temps et argent
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-lightbulb text-blue-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Suggestions Actives</h3>
                  <p className="text-2xl font-bold text-blue-700">
                    {recommendations?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-clock text-green-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Temps Économisé</h3>
                  <p className="text-2xl font-bold text-green-700">
                    {potentialSavings.time} min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <i className="fas fa-coins text-orange-600"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">Économies</h3>
                  <p className="text-2xl font-bold text-orange-700">
                    {formatAmount(potentialSavings.money)} FCFA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
            <TabsTrigger value="insights">Analyses</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
            <TabsTrigger value="patterns">Habitudes</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Route Optimization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-route mr-2 text-blue-600"></i>
                    Optimisation d'Itinéraires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getRecommendationsByType('route_optimization').length > 0 ? (
                    <div className="space-y-3">
                      {getRecommendationsByType('route_optimization').map((rec: any) => (
                        <div key={rec.id} className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900">{rec.title}</h4>
                          <p className="text-sm text-blue-700">{rec.description}</p>
                          {rec.savings && (
                            <div className="flex items-center mt-2">
                              <Badge variant="outline" className="text-blue-600">
                                -{rec.savings.timeSaved} min
                              </Badge>
                              {rec.savings.moneySaved > 0 && (
                                <Badge variant="outline" className="ml-2 text-green-600">
                                  -{formatAmount(rec.savings.moneySaved)} FCFA
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      Aucune optimisation d'itinéraire disponible
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Time Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <i className="fas fa-clock mr-2 text-green-600"></i>
                    Suggestions de Créneaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getRecommendationsByType('time_suggestion').length > 0 ? (
                    <div className="space-y-3">
                      {getRecommendationsByType('time_suggestion').map((rec: any) => (
                        <div key={rec.id} className="p-3 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900">{rec.title}</h4>
                          <p className="text-sm text-green-700">{rec.description}</p>
                          {rec.suggestedTime && (
                            <p className="text-xs text-green-600 mt-1">
                              Recommandé : {new Date(rec.suggestedTime).toLocaleString('fr-FR')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">
                      Créneaux optimaux détectés automatiquement
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* All Recommendations Panel */}
            <RecommendationPanel className="mt-8" />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {insights ? (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques de Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Taux de ponctualité</span>
                      <span className="font-semibold">{insights.efficiencyMetrics?.onTimeRate || 94}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Score de satisfaction</span>
                      <span className="font-semibold">{insights.efficiencyMetrics?.satisfactionScore || 4.6}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de recommande</span>
                      <span className="font-semibold">{insights.efficiencyMetrics?.repeatBookingRate || 78}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Zones d'Activité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Zone de collecte principale</p>
                      <p className="font-semibold">{insights.locationPatterns?.topPickupZone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Zone de livraison principale</p>
                      <p className="font-semibold">{insights.locationPatterns?.topDeliveryZone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Couverture géographique</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {insights.locationPatterns?.coverage?.map((zone: string, index: number) => (
                          <Badge key={index} variant="outline">{zone}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tendances Saisonnières</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Mois de pointe</span>
                      <span className="font-semibold">{insights.seasonalTrends?.peakMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mois faible</span>
                      <span className="font-semibold">{insights.seasonalTrends?.lowMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Impact météo</span>
                      <span className="font-semibold capitalize">{insights.seasonalTrends?.weatherImpact}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Fréquence de Livraison</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Par semaine</span>
                      <span className="font-semibold">{insights.deliveryFrequency?.weekly} livraisons</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Par mois</span>
                      <span className="font-semibold">{insights.deliveryFrequency?.monthly} livraisons</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <i className="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
                  <h3 className="font-semibold text-gray-700 mb-2">Analyses en développement</h3>
                  <p className="text-gray-600 mb-4">
                    Effectuez plus de livraisons pour obtenir des analyses détaillées
                  </p>
                  <Button onClick={handleAnalyzePatterns} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Analyse...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-analytics mr-2"></i>
                        Analyser maintenant
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personnaliser vos Préférences</CardTitle>
                <p className="text-gray-600">
                  Aidez-nous à mieux vous comprendre pour des recommandations plus précises
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleUpdatePreferences)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="preferredDeliveryTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Créneau préféré</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir un créneau" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="morning">Matin (8h-12h)</SelectItem>
                                <SelectItem value="afternoon">Après-midi (12h-17h)</SelectItem>
                                <SelectItem value="evening">Soir (17h-20h)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="budgetRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget habituel</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir un budget" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Économique (&lt; 2000 FCFA)</SelectItem>
                                <SelectItem value="medium">Standard (2000-5000 FCFA)</SelectItem>
                                <SelectItem value="high">Premium (&gt; 5000 FCFA)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="urgencyPreference"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Urgence habituelle</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choisir l'urgence" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="standard">Standard (même jour)</SelectItem>
                                <SelectItem value="express">Express (moins de 2h)</SelectItem>
                                <SelectItem value="scheduled">Programmée</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="preferredPackageTypes"
                      render={() => (
                        <FormItem>
                          <FormLabel>Types de colis habituels</FormLabel>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            {[
                              { id: "documents", label: "Documents" },
                              { id: "food", label: "Nourriture" },
                              { id: "electronics", label: "Électronique" },
                              { id: "clothing", label: "Vêtements" },
                              { id: "books", label: "Livres" },
                              { id: "other", label: "Autres" },
                            ].map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="preferredPackageTypes"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, item.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isUpdatingPreferences} className="w-full">
                      {isUpdatingPreferences ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Sauvegarder les préférences
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-brain mr-2 text-mako-green"></i>
                    Analyse Comportementale
                  </div>
                  <Button onClick={handleAnalyzePatterns} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Analyse...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-refresh mr-2"></i>
                        Réanalyser
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Habitudes Détectées</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                        Livraisons fréquentes le mercredi
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                        Préférence pour documents et nourriture
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                        Créneaux 14h-16h optimaux
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check-circle text-green-500 mr-2"></i>
                        Zone ACI 2000 ↔ Hippodrome récurrente
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Suggestions d'Optimisation</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        Réserver le mercredi à l'avance
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        Grouper les livraisons ACI-Hippodrome
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                        Utiliser les créneaux après-midi
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Gains d'Efficacité Projetés</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">23%</div>
                      <p className="text-sm text-green-700">Réduction temps</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">18%</div>
                      <p className="text-sm text-green-700">Économies coûts</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">12%</div>
                      <p className="text-sm text-green-700">Satisfaction améliorée</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}