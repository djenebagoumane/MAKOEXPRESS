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

const standardDeliverySchema = z.object({
  pickupAddress: z.string().min(1, "L'adresse de collecte est requise"),
  deliveryAddress: z.string().min(1, "L'adresse de livraison est requise"),
  packageType: z.string().min(1, "Le type de colis est requis"),
  weight: z.string().min(1, "Le poids est requis"),
  urgency: z.string().min(1, "L'urgence est requise"),
  customerPhone: z.string().min(1, "Le numéro de téléphone est requis"),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.string().min(1, "La méthode de paiement est requise"),
});

type StandardDeliveryFormData = z.infer<typeof standardDeliverySchema>;

export default function DeliveryStandard() {
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StandardDeliveryFormData>({
    resolver: zodResolver(standardDeliverySchema),
    defaultValues: {
      pickupAddress: "",
      deliveryAddress: "",
      packageType: "",
      weight: "",
      urgency: "normal",
      customerPhone: "",
      deliveryInstructions: "",
      paymentMethod: "makopay",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: StandardDeliveryFormData) => {
      return await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          price: calculatedPrice.toString(),
          status: "pending",
          serviceType: "standard",
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Commande créée",
        description: "Votre demande de livraison standard a été enregistrée avec succès !",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/my"] });
      form.reset();
      setCalculatedPrice(0);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de la commande.",
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

    let basePrice = 2000; // Prix de base Standard

    // Multiplicateur de poids
    switch (weight) {
      case "moins-1kg":
        basePrice += 300;
        break;
      case "1-5kg":
        basePrice += 500;
        break;
      case "5-10kg":
        basePrice += 1000;
        break;
      case "plus-10kg":
        basePrice += 2500;
        break;
    }

    // Multiplicateur d'urgence Standard
    switch (urgency) {
      case "normal":
        basePrice *= 1.0;
        break;
      case "prioritaire":
        basePrice *= 1.2;
        break;
    }

    // Frais de distance
    const pickup = pickupAddress.toLowerCase();
    const delivery = deliveryAddress.toLowerCase();
    
    if (pickup.includes("bamako") && delivery.includes("bamako")) {
      basePrice += 300; // Même ville
    } else if (pickup.includes("bamako") || delivery.includes("bamako")) {
      basePrice += 1000; // Une ville vers/depuis Bamako
    } else {
      basePrice += 1500; // Intercité
    }

    // Régions éloignées
    const regionEloignees = ["gao", "tombouctou", "kidal", "ménaka"];
    if (regionEloignees.some(region => pickup.includes(region) || delivery.includes(region))) {
      basePrice += 2000;
    }

    setCalculatedPrice(Math.round(basePrice));
  };

  const onSubmit = (data: StandardDeliveryFormData) => {
    if (calculatedPrice === 0) {
      calculatePrice();
      return;
    }
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mako-green to-mako-jade">
      <Navigation />
      
      <div className="pt-20 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête Standard */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
              <h1 className="text-4xl font-bold text-mako-anthracite mb-4">
                <i className="fas fa-truck text-mako-green mr-3"></i>
                Livraison Standard
              </h1>
              <p className="text-xl text-mako-anthracite opacity-80 mb-4">
                Livraison fiable dans tout le Mali sous 24-48h
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded-lg">
                  <i className="fas fa-clock text-mako-green text-2xl mb-2"></i>
                  <div className="text-sm font-semibold text-mako-anthracite">Délai</div>
                  <div className="text-mako-green font-bold">24-48 heures</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <i className="fas fa-map text-blue-600 text-2xl mb-2"></i>
                  <div className="text-sm font-semibold text-mako-anthracite">Zone</div>
                  <div className="text-blue-600 font-bold">Tout le Mali</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <i className="fas fa-tag text-purple-600 text-2xl mb-2"></i>
                  <div className="text-sm font-semibold text-mako-anthracite">Prix</div>
                  <div className="text-purple-600 font-bold">Économique</div>
                </div>
              </div>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-mako-green to-mako-jade text-white">
              <CardTitle className="text-2xl font-bold">
                <i className="fas fa-truck mr-2"></i>
                Commande Standard
              </CardTitle>
              <p>Livraison économique et fiable</p>
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
                            <Input 
                              placeholder="Ex: Ségou, Région de Ségou" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                calculatePrice();
                              }}
                            />
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
                            <i className="fas fa-map-marker-alt text-mako-green mr-2"></i>
                            Adresse de livraison
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Sikasso, Région de Sikasso" 
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                calculatePrice();
                              }}
                            />
                          </FormControl>
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
                                <SelectValue placeholder="Sélectionner le type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="document">Documents</SelectItem>
                              <SelectItem value="nourriture">Nourriture non-périssable</SelectItem>
                              <SelectItem value="medicament">Médicaments</SelectItem>
                              <SelectItem value="electronique">Électronique</SelectItem>
                              <SelectItem value="vetement">Vêtements</SelectItem>
                              <SelectItem value="artisanat">Artisanat local</SelectItem>
                              <SelectItem value="materiel">Matériel</SelectItem>
                              <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-weight text-mako-green mr-2"></i>
                            Poids estimé
                          </FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            calculatePrice();
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le poids" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="moins-1kg">Moins de 1kg</SelectItem>
                              <SelectItem value="1-5kg">1 à 5kg</SelectItem>
                              <SelectItem value="5-10kg">5 à 10kg</SelectItem>
                              <SelectItem value="plus-10kg">Plus de 10kg</SelectItem>
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
                            <i className="fas fa-hourglass-half text-mako-green mr-2"></i>
                            Priorité de livraison
                          </FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            calculatePrice();
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner la priorité" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="normal">
                                <div className="flex items-center">
                                  <i className="fas fa-truck text-mako-green mr-2"></i>
                                  Normal (48h) - Prix standard
                                </div>
                              </SelectItem>
                              <SelectItem value="prioritaire">
                                <div className="flex items-center">
                                  <i className="fas fa-shipping-fast text-orange-500 mr-2"></i>
                                  Prioritaire (24h) +20%
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
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <i className="fas fa-phone text-mako-green mr-2"></i>
                            Téléphone
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="+223 XX XX XX XX" {...field} />
                          </FormControl>
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
                          <i className="fas fa-sticky-note text-mako-green mr-2"></i>
                          Instructions de livraison (optionnel)
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Instructions spéciales, contacts supplémentaires..."
                            className="resize-none"
                            {...field}
                          />
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
                              <SelectValue placeholder="Sélectionner le mode de paiement" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="makopay">
                              <div className="flex items-center">
                                <i className="fas fa-mobile-alt text-mako-green mr-2"></i>
                                MAKOPAY (Mobile Money)
                              </div>
                            </SelectItem>
                            <SelectItem value="cash">
                              <div className="flex items-center">
                                <i className="fas fa-money-bill text-green-600 mr-2"></i>
                                Espèces à la livraison
                              </div>
                            </SelectItem>
                            <SelectItem value="bank">
                              <div className="flex items-center">
                                <i className="fas fa-university text-blue-600 mr-2"></i>
                                Virement bancaire
                              </div>
                            </SelectItem>
                            <SelectItem value="credit">
                              <div className="flex items-center">
                                <i className="fas fa-handshake text-purple-600 mr-2"></i>
                                Crédit (clients professionnels)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {calculatedPrice > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-mako-green">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-mako-anthracite mb-2">
                          <i className="fas fa-calculator text-mako-green mr-2"></i>
                          Prix estimé Standard
                        </h3>
                        <div className="text-3xl font-bold text-mako-green">
                          {calculatedPrice.toLocaleString()} CFA
                        </div>
                        <p className="text-sm text-mako-anthracite opacity-70 mt-2">
                          Livraison fiable et économique dans tout le Mali
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={calculatePrice}
                      className="flex-1"
                    >
                      <i className="fas fa-calculator mr-2"></i>
                      Calculer le prix
                    </Button>
                    <Button
                      type="submit"
                      disabled={mutation.isPending || calculatedPrice === 0}
                      className="flex-1 bg-gradient-to-r from-mako-green to-mako-jade hover:from-green-600 hover:to-teal-600 text-white"
                    >
                      {mutation.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-truck mr-2"></i>
                      )}
                      Confirmer livraison Standard
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}