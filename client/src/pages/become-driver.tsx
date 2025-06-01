import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const driverSchema = z.object({
  vehicleType: z.string().min(1, "Le type de véhicule est requis"),
  vehicleModel: z.string().min(1, "Le modèle de véhicule est requis"),
  licenseNumber: z.string().min(1, "Le numéro de permis est requis"),
  vehicleRegistration: z.string().min(1, "L'immatriculation est requise"),
  insuranceNumber: z.string().min(1, "Le numéro d'assurance est requis"),
  phoneNumber: z.string().min(1, "Le numéro de téléphone est requis"),
  emergencyContact: z.string().min(1, "Le contact d'urgence est requis"),
  workingAreas: z.string().min(1, "Les zones de travail sont requises"),
  experience: z.string().min(1, "L'expérience est requise"),
  availability: z.string().min(1, "La disponibilité est requise"),
  motivation: z.string().min(10, "La motivation doit contenir au moins 10 caractères"),
});

type DriverFormData = z.infer<typeof driverSchema>;

export default function BecomeDriver() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      vehicleType: "",
      vehicleModel: "",
      licenseNumber: "",
      vehicleRegistration: "",
      insuranceNumber: "",
      phoneNumber: "",
      emergencyContact: "",
      workingAreas: "",
      experience: "",
      availability: "",
      motivation: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: DriverFormData) => {
      return await apiRequest("/api/drivers", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          status: "pending",
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Candidature soumise",
        description: "Votre candidature a été envoyée avec succès ! Nous vous contacterons sous 48h.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers"] });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi de la candidature.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DriverFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mako-green to-mako-jade">
      <Navigation />
      
      <div className="pt-20 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête Devenir Livreur */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
              <h1 className="text-4xl font-bold text-mako-anthracite mb-4">
                <i className="fas fa-motorcycle text-mako-green mr-3"></i>
                Devenir Livreur MAKOEXPRESS
              </h1>
              <p className="text-xl text-mako-anthracite opacity-80 mb-6">
                Rejoignez notre équipe et générez des revenus flexibles
              </p>
              
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded-lg">
                  <i className="fas fa-money-bill-wave text-green-600 text-2xl mb-2"></i>
                  <div className="text-sm font-semibold text-mako-anthracite">Revenus</div>
                  <div className="text-green-600 font-bold">Jusqu'à 150k CFA/mois</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <i className="fas fa-clock text-blue-600 text-2xl mb-2"></i>
                  <div className="text-sm font-semibold text-mako-anthracite">Horaires</div>
                  <div className="text-blue-600 font-bold">Flexibles</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <i className="fas fa-shield-alt text-orange-600 text-2xl mb-2"></i>
                  <div className="text-sm font-semibold text-mako-anthracite">Assurance</div>
                  <div className="text-orange-600 font-bold">Incluse</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <i className="fas fa-graduation-cap text-purple-600 text-2xl mb-2"></i>
                  <div className="text-sm font-semibold text-mako-anthracite">Formation</div>
                  <div className="text-purple-600 font-bold">Gratuite</div>
                </div>
              </div>
            </div>
          </div>

          {/* Avantages */}
          <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-mako-anthracite mb-4 text-center">
              <i className="fas fa-star text-yellow-500 mr-2"></i>
              Pourquoi choisir MAKOEXPRESS ?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-green-500 text-lg"></i>
                  <span className="text-mako-anthracite">Paiements rapides et sécurisés</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-green-500 text-lg"></i>
                  <span className="text-mako-anthracite">Support technique 24/7</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-green-500 text-lg"></i>
                  <span className="text-mako-anthracite">Bonus de performance mensuel</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-green-500 text-lg"></i>
                  <span className="text-mako-anthracite">Équipement fourni (sac, GPS)</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-green-500 text-lg"></i>
                  <span className="text-mako-anthracite">Formation complète gratuite</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-green-500 text-lg"></i>
                  <span className="text-mako-anthracite">Assurance accidents incluse</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-green-500 text-lg"></i>
                  <span className="text-mako-anthracite">Programme de fidélité</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="fas fa-check-circle text-green-500 text-lg"></i>
                  <span className="text-mako-anthracite">Communauté de livreurs solidaire</span>
                </div>
              </div>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-mako-green to-mako-jade text-white">
              <CardTitle className="text-2xl font-bold">
                <i className="fas fa-user-plus mr-2"></i>
                Formulaire de Candidature
              </CardTitle>
              <p>Remplissez tous les champs pour postuler</p>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="vehicleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-motorcycle text-mako-green mr-2"></i>
                            Type de véhicule *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner votre véhicule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="moto">
                                <div className="flex items-center">
                                  <i className="fas fa-motorcycle text-red-500 mr-2"></i>
                                  Moto (125cc ou plus)
                                </div>
                              </SelectItem>
                              <SelectItem value="scooter">
                                <div className="flex items-center">
                                  <i className="fas fa-bicycle text-blue-500 mr-2"></i>
                                  Scooter
                                </div>
                              </SelectItem>
                              <SelectItem value="voiture">
                                <div className="flex items-center">
                                  <i className="fas fa-car text-green-500 mr-2"></i>
                                  Voiture
                                </div>
                              </SelectItem>
                              <SelectItem value="velo">
                                <div className="flex items-center">
                                  <i className="fas fa-bicycle text-yellow-500 mr-2"></i>
                                  Vélo (Bamako centre uniquement)
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-cog text-mako-green mr-2"></i>
                            Marque et modèle *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Yamaha NMAX 155, Honda PCX" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-id-card text-mako-green mr-2"></i>
                            Numéro de permis de conduire *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Numéro de votre permis" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleRegistration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-clipboard-list text-mako-green mr-2"></i>
                            Numéro d'immatriculation *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Carte grise de votre véhicule" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="insuranceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-shield-alt text-mako-green mr-2"></i>
                            Numéro d'assurance *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Police d'assurance véhicule" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-phone text-mako-green mr-2"></i>
                            Téléphone principal *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+223 XX XX XX XX" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-phone-alt text-red-500 mr-2"></i>
                            Contact d'urgence *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nom et téléphone (famille/ami)" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workingAreas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-map-marker-alt text-mako-green mr-2"></i>
                            Zones de travail préférées *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner vos zones" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="bamako-centre">Bamako Centre</SelectItem>
                              <SelectItem value="bamako-complet">Tout Bamako</SelectItem>
                              <SelectItem value="bamako-region">Bamako + Région</SelectItem>
                              <SelectItem value="national">National (toutes régions)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-star text-mako-green mr-2"></i>
                            Expérience de conduite *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Votre expérience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="debutant">Débutant (moins d'1 an)</SelectItem>
                              <SelectItem value="intermediate">Intermédiaire (1-3 ans)</SelectItem>
                              <SelectItem value="experienced">Expérimenté (3-5 ans)</SelectItem>
                              <SelectItem value="expert">Expert (plus de 5 ans)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-calendar-alt text-mako-green mr-2"></i>
                            Disponibilité *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Vos horaires" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="temps-plein">Temps plein (8h/jour)</SelectItem>
                              <SelectItem value="temps-partiel">Temps partiel (4h/jour)</SelectItem>
                              <SelectItem value="week-end">Week-end uniquement</SelectItem>
                              <SelectItem value="flexible">Horaires flexibles</SelectItem>
                              <SelectItem value="nuit">Service de nuit</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="motivation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <i className="fas fa-heart text-red-500 mr-2"></i>
                          Motivation et objectifs *
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Pourquoi voulez-vous devenir livreur MAKOEXPRESS ? Quels sont vos objectifs professionnels ?"
                            className="resize-none h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-mako-anthracite mb-2">
                      <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                      Documents requis après validation :
                    </h3>
                    <ul className="text-sm text-mako-anthracite space-y-1">
                      <li>• Photocopie du permis de conduire</li>
                      <li>• Carte grise du véhicule</li>
                      <li>• Attestation d'assurance valide</li>
                      <li>• Photo d'identité récente</li>
                      <li>• Certificat médical d'aptitude</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full bg-gradient-to-r from-mako-green to-mako-jade hover:from-green-600 hover:to-teal-600 text-white text-lg py-3"
                  >
                    {mutation.isPending ? (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    ) : (
                      <i className="fas fa-paper-plane mr-2"></i>
                    )}
                    Soumettre ma candidature
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Processus de recrutement */}
          <div className="bg-white rounded-lg p-6 shadow-lg mt-8">
            <h2 className="text-2xl font-bold text-mako-anthracite mb-6 text-center">
              <i className="fas fa-road text-mako-green mr-2"></i>
              Processus de recrutement
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-file-alt text-blue-600 text-2xl"></i>
                </div>
                <h3 className="font-semibold text-mako-anthracite mb-2">1. Candidature</h3>
                <p className="text-sm text-mako-anthracite opacity-70">
                  Remplissez le formulaire en ligne
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-phone text-yellow-600 text-2xl"></i>
                </div>
                <h3 className="font-semibold text-mako-anthracite mb-2">2. Entretien</h3>
                <p className="text-sm text-mako-anthracite opacity-70">
                  Entretien téléphonique (48h)
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-graduation-cap text-green-600 text-2xl"></i>
                </div>
                <h3 className="font-semibold text-mako-anthracite mb-2">3. Formation</h3>
                <p className="text-sm text-mako-anthracite opacity-70">
                  Formation gratuite (1 jour)
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-rocket text-purple-600 text-2xl"></i>
                </div>
                <h3 className="font-semibold text-mako-anthracite mb-2">4. Démarrage</h3>
                <p className="text-sm text-mako-anthracite opacity-70">
                  Première livraison immédiate
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}