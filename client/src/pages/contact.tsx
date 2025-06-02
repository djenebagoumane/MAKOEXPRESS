import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

const contactSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  subject: z.string().min(1, "Le sujet est requis"),
  category: z.string().min(1, "La catégorie est requise"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  priority: z.string().min(1, "La priorité est requise"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      category: "",
      message: "",
      priority: "normal",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return await apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Message envoyé",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi du message.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    mutation.mutate(data);
  };

  const contactMethods = [
    {
      title: "Support Téléphonique",
      description: "Parlez directement à notre équipe",
      icon: "fas fa-phone",
      contact: "+223 XX XX XX XX",
      availability: "Lun-Sam 8h-20h",
      color: "bg-green-500"
    },
    {
      title: "WhatsApp Business",
      description: "Chat en temps réel",
      icon: "fab fa-whatsapp",
      contact: "+223 75 70 02 65",
      availability: "Réponse sous 5 min",
      color: "bg-green-600"
    },
    {
      title: "Email Support",
      description: "Pour les demandes détaillées",
      icon: "fas fa-envelope",
      contact: "support@makoexpress.com",
      availability: "Réponse sous 2h",
      color: "bg-blue-500"
    },
    {
      title: "Urgences 24/7",
      description: "Ligne d'urgence",
      icon: "fas fa-exclamation-triangle",
      contact: "+223 96 86 52 10",
      availability: "24h/24 - 7j/7",
      color: "bg-red-500"
    }
  ];

  const officeLocations = [
    {
      city: "Bamako",
      address: "ACI 2000, Rue 123, Immeuble MAKO",
      phone: "+223 XX XX XX XX",
      hours: "Lun-Ven 8h-18h, Sam 9h-15h",
      manager: "Directeur: Amadou TRAORE"
    },
    {
      city: "Sikasso",
      address: "Centre-ville, Avenue de la République",
      phone: "+223 75 70 02 65",
      hours: "Lun-Ven 8h-17h, Sam 9h-14h",
      manager: "Responsable: Fatou "
    },
    {
      city: "Ségou",
      address: "Quartier Pelengana, Route de Mopti",
      phone: "+223 XX XX XX XX",
      hours: "Lun-Ven 8h-17h",
      manager: "Responsable: Ibrahim COULIBALY"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-mako-anthracite mb-4">
              <i className="fas fa-headset text-mako-green mr-3"></i>
              Contactez-nous
            </h1>
            <p className="text-xl text-mako-anthracite opacity-80">
              Notre équipe est là pour vous aider 7 jours sur 7
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulaire de contact */}
            <div>
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-mako-green to-mako-jade text-white">
                  <CardTitle className="text-2xl">
                    <i className="fas fa-envelope mr-2"></i>
                    Envoyer un message
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <i className="fas fa-user text-mako-green mr-2"></i>
                                Nom complet *
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Votre nom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <i className="fas fa-phone text-mako-green mr-2"></i>
                                Téléphone *
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <i className="fas fa-envelope text-mako-green mr-2"></i>
                              Email *
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="votre@email.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <i className="fas fa-tag text-mako-green mr-2"></i>
                                Catégorie *
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choisir une catégorie" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="livraison">Problème de livraison</SelectItem>
                                  <SelectItem value="paiement">Question de paiement</SelectItem>
                                  <SelectItem value="tracking">Suivi de colis</SelectItem>
                                  <SelectItem value="livreur">Devenir livreur</SelectItem>
                                  <SelectItem value="technique">Support technique</SelectItem>
                                  <SelectItem value="partenariat">Partenariat</SelectItem>
                                  <SelectItem value="autre">Autre</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                <i className="fas fa-exclamation-circle text-mako-green mr-2"></i>
                                Priorité *
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Niveau de priorité" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">
                                    <div className="flex items-center">
                                      <i className="fas fa-circle text-green-500 mr-2 text-xs"></i>
                                      Basse - Question générale
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="normal">
                                    <div className="flex items-center">
                                      <i className="fas fa-circle text-yellow-500 mr-2 text-xs"></i>
                                      Normale - Demande standard
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="high">
                                    <div className="flex items-center">
                                      <i className="fas fa-circle text-orange-500 mr-2 text-xs"></i>
                                      Haute - Problème urgent
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="urgent">
                                    <div className="flex items-center">
                                      <i className="fas fa-circle text-red-500 mr-2 text-xs"></i>
                                      Urgente - Colis perdu/endommagé
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <i className="fas fa-heading text-mako-green mr-2"></i>
                              Sujet *
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Résumé de votre demande" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <i className="fas fa-comment text-mako-green mr-2"></i>
                              Message *
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Décrivez votre demande en détail..."
                                className="resize-none h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                        Envoyer le message
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Informations de contact */}
            <div className="space-y-8">
              {/* Méthodes de contact */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <CardTitle className="text-xl">
                    <i className="fas fa-phone-volume mr-2"></i>
                    Moyens de Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {contactMethods.map((method, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50">
                        <div className={`w-12 h-12 ${method.color} rounded-full flex items-center justify-center`}>
                          <i className={`${method.icon} text-white text-lg`}></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-mako-anthracite">{method.title}</h3>
                          <p className="text-sm text-mako-anthracite opacity-70">{method.description}</p>
                          <p className="text-sm font-mono text-mako-green">{method.contact}</p>
                          <p className="text-xs text-mako-anthracite opacity-60">{method.availability}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bureaux */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-mako-green to-mako-jade text-white">
                  <CardTitle className="text-xl">
                    <i className="fas fa-building mr-2"></i>
                    Nos Bureaux
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {officeLocations.map((office, index) => (
                      <div key={index} className="border-l-4 border-mako-green pl-4">
                        <h3 className="font-bold text-lg text-mako-anthracite">{office.city}</h3>
                        <p className="text-mako-anthracite opacity-80 mb-1">{office.address}</p>
                        <p className="text-sm text-mako-green font-mono mb-1">{office.phone}</p>
                        <p className="text-sm text-mako-anthracite opacity-70 mb-1">{office.hours}</p>
                        <p className="text-sm text-mako-anthracite opacity-60">{office.manager}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* FAQ rapide */}
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <CardTitle className="text-xl">
                    <i className="fas fa-question-circle mr-2"></i>
                    Réponses Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-clock text-mako-green"></i>
                      <span className="text-sm">Livraison Express: 1-6h à Bamako</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-truck text-mako-green"></i>
                      <span className="text-sm">Standard: 24-48h dans tout le Mali</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-mobile-alt text-mako-green"></i>
                      <span className="text-sm">Paiement: MAKOPAY, espèces, virement</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-shield-alt text-mako-green"></i>
                      <span className="text-sm">Assurance colis incluse</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}