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

const expressDeliverySchema = z.object({
  pickupAddress: z.string().min(1, "L'adresse de collecte est requise"),
  deliveryAddress: z.string().min(1, "L'adresse de livraison est requise"),
  packageType: z.string().min(1, "Le type de colis est requis"),
  weight: z.string().min(1, "Le poids est requis"),
  urgency: z.string().min(1, "L'urgence est requise"),
  customerPhone: z.string().min(1, "Le numéro de téléphone est requis"),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.string().min(1, "La méthode de paiement est requise"),
});

type ExpressDeliveryFormData = z.infer<typeof expressDeliverySchema>;

export default function DeliveryExpress() {
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ExpressDeliveryFormData>({
    resolver: zodResolver(expressDeliverySchema),
    defaultValues: {
      pickupAddress: "",
      deliveryAddress: "",
      packageType: "",
      weight: "",
      urgency: "urgent",
      customerPhone: "",
      deliveryInstructions: "",
      paymentMethod: "makopay",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ExpressDeliveryFormData) => {
      return await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          price: calculatedPrice.toString(),
          status: "pending",
          serviceType: "express",
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Commande créée",
        description: "Votre demande de livraison express a été enregistrée avec succès !",
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

    let basePrice = 3000; // Prix de base Express

    // Multiplicateur de poids
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
        basePrice += 4000;
        break;
    }

    // Multiplicateur d'urgence Express
    switch (urgency) {
      case "urgent":
        basePrice *= 1.3;
        break;
      case "très urgent":
        basePrice *= 1.6;
        break;
    }

    // Frais de distance (simplifié)
    if (pickupAddress.toLowerCase().includes("bamako") && deliveryAddress.toLowerCase().includes("bamako")) {
      basePrice += 500; // Même ville
    } else {
      basePrice += 2000; // Intercité
    }

    setCalculatedPrice(Math.round(basePrice));
  };

  const onSubmit = (data: ExpressDeliveryFormData) => {
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
          {/* En-tête Express */}
          <div className="text-center mb-8">
            <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
              <h1 className="text-4xl font-bold text-mako-anthracite mb-4">
                <i className="fas fa-bolt text-yellow-500 mr-3"></i>
                Livraison Express
              </h1>
              <p className="text-xl text-mako-anthracite opacity-80 mb-4">
                Livraison dans la journée pour Bamako
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <i className="fas fa-clock text-yellow-600 text-2xl mb-2"></i>
                  <div className="text-sm font-semibold text-mako-anthracite">Délai</div>
                  <div className="text-yellow-600 font-bold">1-6 heures</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <i className="fas fa-map-marker-alt text-green-600 text-2xl mb-2"></i>
                  <div className="text-sm font-semibold text-mako-anthracite">Zone</div>
                  <div className="text-green-600 font-bold">Bamako uniquement</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <i className="fas fa-shield-alt text-blue-600 text-2xl mb-2"></i>
                  <div className="text-sm font-semibold text-mako-anthracite">Garantie</div>
                  <div className="text-blue-600 font-bold">100% Sécurisé</div>
                </div>
              </div>
            </div>
          </div>

          <Card className="shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <CardTitle className="text-2xl font-bold">
                <i className="fas fa-bolt mr-2"></i>
                Commande Express
              </CardTitle>
              <p>Livraison prioritaire dans la journée</p>
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
                              placeholder="Ex: ACI 2000, Bamako" 
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
                              placeholder="Ex: Hippodrome, Bamako" 
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
                              <SelectItem value="nourriture">Nourriture</SelectItem>
                              <SelectItem value="medicament">Médicaments</SelectItem>
                              <SelectItem value="electronique">Électronique</SelectItem>
                              <SelectItem value="vetement">Vêtements</SelectItem>
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
                            <i className="fas fa-bolt text-yellow-500 mr-2"></i>
                            Niveau d'urgence
                          </FormLabel>
                          <Select onValueChange={(value) => {
                            field.onChange(value);
                            calculatePrice();
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner l'urgence" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="urgent">
                                <div className="flex items-center">
                                  <i className="fas fa-bolt text-orange-500 mr-2"></i>
                                  Urgent (2-6h) +30%
                                </div>
                              </SelectItem>
                              <SelectItem value="très urgent">
                                <div className="flex items-center">
                                  <i className="fas fa-fire text-red-500 mr-2"></i>
                                  Très urgent (1-2h) +60%
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
                            placeholder="Instructions spéciales pour le livreur..."
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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {calculatedPrice > 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-200">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-mako-anthracite mb-2">
                          <i className="fas fa-calculator text-yellow-600 mr-2"></i>
                          Prix estimé Express
                        </h3>
                        <div className="text-3xl font-bold text-yellow-600">
                          {calculatedPrice.toLocaleString()} CFA
                        </div>
                        <p className="text-sm text-mako-anthracite opacity-70 mt-2">
                          Livraison prioritaire garantie dans la journée
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
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                    >
                      {mutation.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-bolt mr-2"></i>
                      )}
                      Confirmer livraison Express
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