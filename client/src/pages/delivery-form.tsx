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
import MobileNav from "@/components/mobile-nav";
import { useLocation } from "wouter";

const deliverySchema = z.object({
  pickupAddress: z.string().min(1, "L'adresse de collecte est requise"),
  deliveryAddress: z.string().min(1, "L'adresse de livraison est requise"),
  packageType: z.string().min(1, "Le type de colis est requis"),
  weight: z.string().min(1, "Le poids est requis"),
  urgency: z.string().min(1, "L'urgence est requise"),
  customerPhone: z.string().min(1, "Le numéro de téléphone est requis"),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.string().min(1, "La méthode de paiement est requise"),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;

export default function DeliveryForm() {
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      pickupAddress: "",
      deliveryAddress: "",
      packageType: "",
      weight: "",
      urgency: "standard",
      customerPhone: "",
      deliveryInstructions: "",
      paymentMethod: "makopay",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: DeliveryFormData) => {
      const response = await apiRequest("POST", "/api/orders", {
        ...data,
        price: calculatedPrice,
      });
      return response.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Commande créée avec succès!",
        description: `Numéro de suivi: ${order.trackingNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/my"] });
      setLocation("/tracking");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande",
        variant: "destructive",
      });
    },
  });

  const calculatePrice = () => {
    const weight = form.watch("weight");
    const urgency = form.watch("urgency");
    const pickupAddress = form.watch("pickupAddress");
    const deliveryAddress = form.watch("deliveryAddress");

    if (!weight || !urgency || !pickupAddress || !deliveryAddress) {
      setCalculatedPrice(0);
      return;
    }

    let basePrice = 1500;
    
    // Weight multiplier
    switch (weight) {
      case "moins-1kg":
        basePrice += 500;
        break;
      case "1-5kg":
        basePrice += 1000;
        break;
      case "5-10kg":
        basePrice += 2000;
        break;
      case "plus-10kg":
        basePrice += 3500;
        break;
    }

    // Urgency multiplier
    switch (urgency) {
      case "express":
        basePrice += 1500;
        break;
      case "urgent":
        basePrice += 3000;
        break;
    }

    // Simple distance calculation (mock)
    const distance = Math.random() * 20 + 5; // 5-25km
    basePrice += Math.floor(distance * 100);

    setCalculatedPrice(basePrice);
  };

  // Recalculate price when form values change
  form.watch(() => {
    calculatePrice();
  });

  const onSubmit = (data: DeliveryFormData) => {
    if (calculatedPrice === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs pour calculer le prix",
        variant: "destructive",
      });
      return;
    }
    createOrderMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-mako-dark mb-4">
                <i className="fas fa-box mr-2 text-mako-green"></i>
                Demander une Livraison
              </CardTitle>
              <p className="text-mako-gray">Remplissez le formulaire pour obtenir un devis instantané</p>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="pickupAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-map-marker-alt text-mako-green mr-2"></i>
                            Adresse de collecte
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Quartier ACI 2000, Bamako" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-flag-checkered text-mako-green mr-2"></i>
                            Adresse de livraison
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Quartier Hippodrome, Bamako" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-weight text-mako-green mr-2"></i>
                            Poids
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le poids" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="moins-1kg">Moins de 1kg</SelectItem>
                              <SelectItem value="1-5kg">1-5kg</SelectItem>
                              <SelectItem value="5-10kg">5-10kg</SelectItem>
                              <SelectItem value="plus-10kg">Plus de 10kg</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="packageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-box text-mako-green mr-2"></i>
                            Type de colis
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Type de colis" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="documents">Documents</SelectItem>
                              <SelectItem value="nourriture">Nourriture</SelectItem>
                              <SelectItem value="vetements">Vêtements</SelectItem>
                              <SelectItem value="electronique">Électronique</SelectItem>
                              <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-clock text-mako-green mr-2"></i>
                            Urgence
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Niveau d'urgence" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard">Standard (24h)</SelectItem>
                              <SelectItem value="express">Express (4h)</SelectItem>
                              <SelectItem value="urgent">Urgent (1h)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-phone text-mako-green mr-2"></i>
                            Numéro de téléphone
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+223 70 12 34 56" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-credit-card text-mako-green mr-2"></i>
                            Méthode de paiement
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir la méthode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="makopay">MAKOPAY</SelectItem>
                              <SelectItem value="cash">Espèces</SelectItem>
                              <SelectItem value="card">Carte bancaire</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="deliveryInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <i className="fas fa-comment text-mako-green mr-2"></i>
                          Instructions de livraison (optionnel)
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Instructions spéciales pour le livreur..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price Display */}
                  <div className="bg-mako-green bg-opacity-10 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-mako-dark">Prix estimé</h4>
                        <p className="text-sm text-mako-gray">Calculé automatiquement selon la distance</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-mako-green">
                          {calculatedPrice.toLocaleString()}
                        </span>
                        <span className="text-lg text-mako-gray ml-1">FCFA</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full py-4 text-lg font-semibold"
                    disabled={createOrderMutation.isPending || calculatedPrice === 0}
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Confirmer la demande
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}
