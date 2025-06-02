import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import DriverAchievementBadges from "@/components/driver-achievement-badges";
import DeliveryCard from "@/components/delivery-card";
import VoiceAssistantPanel from "@/components/voice-assistant-panel";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

export default function DriverDashboard() {
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { announceDriverNotification } = useVoiceAssistant();

  const { data: driverProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/drivers/profile"],
  });

  const { data: availableOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/drivers/orders/available"],
  });

  // Voice notifications for new orders
  useEffect(() => {
    if (availableOrders && availableOrders.length > previousOrderCount && previousOrderCount > 0) {
      announceDriverNotification('new_order', 'high');
      toast({
        title: "Nouvelle commande !",
        description: "Une nouvelle livraison est disponible près de vous",
        variant: "default"
      });
    }
    if (availableOrders) {
      setPreviousOrderCount(availableOrders.length);
    }
  }, [availableOrders, previousOrderCount, announceDriverNotification, toast]);

  const { data: myOrders } = useQuery({
    queryKey: ["/api/drivers/orders/my"],
  });

  const { data: driverStats } = useQuery({
    queryKey: ["/api/drivers/stats"],
  });

  const updateOnlineStatusMutation = useMutation({
    mutationFn: async (isOnline: boolean) => {
      await apiRequest("PATCH", "/api/drivers/online-status", { isOnline });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/profile"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    },
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest("POST", `/api/drivers/orders/${orderId}/accept`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Commande acceptée!",
        description: "La commande a été ajoutée à vos livraisons",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/orders/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/orders/my"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la commande",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/orders/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!profileLoading && !driverProfile) {
      toast({
        title: "Accès refusé",
        description: "Vous devez être un livreur approuvé pour accéder à cette page",
        variant: "destructive",
      });
      window.location.href = "/driver/register";
    }
  }, [driverProfile, profileLoading, toast]);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-mako-green mb-4"></i>
          <p className="text-mako-gray">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!driverProfile || driverProfile.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-exclamation-triangle text-4xl text-yellow-500 mb-4"></i>
            <h2 className="text-xl font-semibold text-mako-dark mb-2">Accès restreint</h2>
            <p className="text-mako-gray mb-4">
              Vous devez être un livreur approuvé pour accéder au tableau de bord
            </p>
            <Button onClick={() => window.location.href = "/driver/register"}>
              Vérifier ma candidature
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleToggleOnlineStatus = (isOnline: boolean) => {
    updateOnlineStatusMutation.mutate(isOnline);
  };

  const handleAcceptOrder = (orderId: number) => {
    acceptOrderMutation.mutate(orderId);
  };

  const handleUpdateOrderStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  const activeOrders = myOrders?.filter((order: any) => 
    ['accepted', 'picked_up', 'in_transit'].includes(order.status)
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-mako-dark">Tableau de Bord Livreur</h1>
              <p className="text-mako-gray">Bienvenue de retour!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-mako-gray">Statut</p>
                <div className="flex items-center space-x-2">
                  <div className={`rounded-full w-3 h-3 ${
                    driverProfile.isOnline ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="font-medium text-mako-dark">
                    {driverProfile.isOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                  <Switch
                    checked={driverProfile.isOnline}
                    onCheckedChange={handleToggleOnlineStatus}
                    disabled={updateOnlineStatusMutation.isPending}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-mako-green text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Gains aujourd'hui</p>
                    <p className="text-3xl font-bold">
                      {driverStats ? `${driverStats.todayEarnings.toLocaleString()} FCFA` : '0 FCFA'}
                    </p>
                  </div>
                  <i className="fas fa-wallet text-3xl text-green-200"></i>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Livraisons complétées</p>
                    <p className="text-3xl font-bold">
                      {driverStats ? driverStats.totalDeliveries : 0}
                    </p>
                  </div>
                  <i className="fas fa-check-circle text-3xl text-blue-200"></i>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Note moyenne</p>
                    <p className="text-3xl font-bold">
                      {driverStats ? `${driverStats.averageRating.toFixed(1)} ★` : '0.0 ★'}
                    </p>
                  </div>
                  <i className="fas fa-star text-3xl text-purple-200"></i>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Available Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-list mr-2 text-mako-green"></i>
                  Livraisons Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <i className="fas fa-spinner fa-spin text-2xl text-mako-green mb-2"></i>
                    <p className="text-mako-gray">Chargement...</p>
                  </div>
                ) : availableOrders && availableOrders.length > 0 ? (
                  <div className="space-y-4">
                    {availableOrders.map((order: any) => (
                      <DeliveryCard
                        key={order.id}
                        order={order}
                        onAccept={() => handleAcceptOrder(order.id)}
                        isAccepting={acceptOrderMutation.isPending}
                        showAcceptButton={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-inbox text-4xl text-mako-silver mb-4"></i>
                    <p className="text-mako-gray">Aucune livraison disponible pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* My Active Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-truck mr-2 text-mako-green"></i>
                  Mes Livraisons en Cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeOrders.length > 0 ? (
                  <div className="space-y-4">
                    {activeOrders.map((order: any) => (
                      <DeliveryCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={(status) => handleUpdateOrderStatus(order.id, status)}
                        isUpdating={updateOrderStatusMutation.isPending}
                        showStatusActions={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-clipboard-check text-4xl text-mako-silver mb-4"></i>
                    <p className="text-mako-gray">Aucune livraison en cours</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Voice Assistant Panel for Drivers */}
          <div className="mt-8">
            <VoiceAssistantPanel userType="driver" />
          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}
