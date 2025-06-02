import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import { Link } from "wouter";

export default function CustomerAccount() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [language, setLanguage] = useState("fr");

  // Récupérer les commandes du client
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders/my"],
  });

  // Récupérer les transactions MakoPay
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions/my"],
  });

  // Récupérer les préférences utilisateur
  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ["/api/user/preferences"],
  });

  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/user/profile", "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour les préférences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/user/preferences", "PATCH", data);
    },
    onSuccess: () => {
      toast({
        title: "Préférences mises à jour",
        description: "Vos préférences ont été sauvegardées.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "in_transit": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "payment": return "bg-red-100 text-red-800";
      case "refund": return "bg-green-100 text-green-800";
      case "commission": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête du compte */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mon Compte
            </h1>
            <p className="text-gray-600">
              Gérez vos informations personnelles, commandes et préférences
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="preferences">Préférences</TabsTrigger>
              <TabsTrigger value="help">Aide</TabsTrigger>
              <TabsTrigger value="legal">Légal</TabsTrigger>
            </TabsList>

            {/* Onglet Profil */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-user text-mako-green"></i>
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        defaultValue={user?.firstName || ""}
                        placeholder="Votre prénom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        defaultValue={user?.lastName || ""}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user?.email || ""}
                        placeholder="votre@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+223 XX XX XX XX"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => updateProfileMutation.mutate({})}
                      disabled={updateProfileMutation.isPending}
                      className="bg-mako-green hover:bg-mako-deep"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Sauvegarder
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Commandes */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-box text-mako-green"></i>
                    Historique des commandes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <i className="fas fa-spinner fa-spin text-2xl text-mako-green"></i>
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order: any) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">
                                Commande #{order.trackingNumber}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">De:</p>
                              <p className="font-medium">{order.pickupAddress}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Vers:</p>
                              <p className="font-medium">{order.deliveryAddress}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                              <span className="text-sm">
                                <i className="fas fa-box mr-1"></i>
                                {order.packageType}
                              </span>
                              <span className="text-sm">
                                <i className="fas fa-weight mr-1"></i>
                                {order.weight}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-mako-green">
                                {formatAmount(order.price)}
                              </span>
                              <Link href={`/tracking?number=${order.trackingNumber}`}>
                                <Button variant="outline" size="sm">
                                  <i className="fas fa-search mr-2"></i>
                                  Suivre
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Aucune commande trouvée</p>
                      <Link href="/delivery/express">
                        <Button className="mt-4 bg-mako-green hover:bg-mako-deep">
                          <i className="fas fa-plus mr-2"></i>
                          Nouvelle commande
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Transactions */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-credit-card text-mako-green"></i>
                    Transactions MakoPay
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="flex justify-center py-8">
                      <i className="fas fa-spinner fa-spin text-2xl text-mako-green"></i>
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((transaction: any) => (
                        <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">
                                Transaction #{transaction.id}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                            <Badge className={getTransactionTypeColor(transaction.type)}>
                              {transaction.type}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">{transaction.description}</span>
                            <span className={`font-bold ${
                              transaction.type === 'payment' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {transaction.type === 'payment' ? '-' : '+'}{formatAmount(transaction.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-receipt text-4xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">Aucune transaction trouvée</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Préférences */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-cog text-mako-green"></i>
                    Préférences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="language">Langue</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="bm">🇲🇱 Bambara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notifications">Notifications</Label>
                    <div className="space-y-3 mt-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                        <span>Notifications par email</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                        <span>Notifications SMS</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300" />
                        <span>Notifications de livraison</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deliveryTime">Heure de livraison préférée</Label>
                    <Select defaultValue={preferences?.preferredDeliveryTime || "afternoon"}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une heure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Matin (8h-12h)</SelectItem>
                        <SelectItem value="afternoon">Après-midi (12h-17h)</SelectItem>
                        <SelectItem value="evening">Soir (17h-20h)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => updatePreferencesMutation.mutate({ language, preferredDeliveryTime: "afternoon" })}
                      disabled={updatePreferencesMutation.isPending}
                      className="bg-mako-green hover:bg-mako-deep"
                    >
                      {updatePreferencesMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Sauvegarder
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Aide */}
            <TabsContent value="help">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <i className="fas fa-question-circle text-mako-green"></i>
                      Centre d'aide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href="/help-center">
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-book mr-2"></i>
                        Guide d'utilisation
                      </Button>
                    </Link>
                    
                    <Link href="/contact">
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-envelope mr-2"></i>
                        Contacter le support
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fas fa-phone mr-2"></i>
                      +223 XX XX XX XX
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fas fa-comments mr-2"></i>
                      Chat en direct
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <i className="fas fa-info-circle text-mako-green"></i>
                      Questions fréquentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <details className="border rounded p-3">
                      <summary className="cursor-pointer font-medium">
                        Comment suivre ma commande ?
                      </summary>
                      <p className="mt-2 text-gray-600 text-sm">
                        Utilisez votre numéro de suivi dans la section "Suivi de colis" pour voir l'état de votre livraison en temps réel.
                      </p>
                    </details>
                    
                    <details className="border rounded p-3">
                      <summary className="cursor-pointer font-medium">
                        Comment payer avec MakoPay ?
                      </summary>
                      <p className="mt-2 text-gray-600 text-sm">
                        MakoPay permet de payer facilement par mobile money. Votre compte sera débité automatiquement.
                      </p>
                    </details>
                    
                    <details className="border rounded p-3">
                      <summary className="cursor-pointer font-medium">
                        Que faire si ma commande est en retard ?
                      </summary>
                      <p className="mt-2 text-gray-600 text-sm">
                        Contactez notre support client immédiatement. Nous localiserons votre colis et vous fournirons une mise à jour.
                      </p>
                    </details>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Légal */}
            <TabsContent value="legal">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <i className="fas fa-file-contract text-mako-green"></i>
                      Documents légaux
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href="/terms-of-service">
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-file-alt mr-2"></i>
                        Conditions d'utilisation
                      </Button>
                    </Link>
                    
                    <Link href="/privacy-policy">
                      <Button variant="outline" className="w-full justify-start">
                        <i className="fas fa-shield-alt mr-2"></i>
                        Politique de confidentialité
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fas fa-cookie-bite mr-2"></i>
                      Politique des cookies
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <i className="fas fa-handshake mr-2"></i>
                      Conditions de livraison
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <i className="fas fa-balance-scale text-mako-green"></i>
                      Vos droits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="border rounded p-3">
                      <h4 className="font-medium mb-2">Droit de rétractation</h4>
                      <p className="text-gray-600 text-sm">
                        Vous pouvez annuler votre commande dans les 24h avant la prise en charge.
                      </p>
                    </div>
                    
                    <div className="border rounded p-3">
                      <h4 className="font-medium mb-2">Protection des données</h4>
                      <p className="text-gray-600 text-sm">
                        Vos données personnelles sont protégées et utilisées uniquement pour vos livraisons.
                      </p>
                    </div>
                    
                    <div className="border rounded p-3">
                      <h4 className="font-medium mb-2">Remboursement</h4>
                      <p className="text-gray-600 text-sm">
                        En cas de problème, vous bénéficiez d'un remboursement intégral via MakoPay.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <MobileNav />
      <Footer />
    </div>
  );
}