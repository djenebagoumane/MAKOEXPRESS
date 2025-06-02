import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import VoiceAssistantPanel from "@/components/voice-assistant-panel";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

interface CustomerOrderStatusProps {
  orderId: number;
  trackingNumber: string;
  refreshInterval?: number;
}

export default function CustomerOrderStatus({ 
  orderId, 
  trackingNumber,
  refreshInterval = 15000 
}: CustomerOrderStatusProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { announceDeliveryUpdate } = useVoiceAssistant();

  // Poll order status
  const { data: orderStatus, refetch } = useQuery({
    queryKey: [`/api/orders/${orderId}/status`],
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        body: JSON.stringify({})
      });
    },
    onSuccess: () => {
      toast({
        title: "Commande annulée",
        description: "Votre commande a été annulée avec succès",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}/status`] });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande",
        variant: "destructive"
      });
    }
  });

  const handleCancel = () => {
    if (confirm("Êtes-vous sûr de vouloir annuler cette commande ?")) {
      setIsCancelling(true);
      cancelOrderMutation.mutate();
    }
  };

  // Voice announcements for status changes
  useEffect(() => {
    if (orderStatus?.status && orderStatus.status !== previousStatus && previousStatus !== "") {
      // Announce status change via voice assistant
      announceDeliveryUpdate({
        orderId: trackingNumber,
        status: orderStatus.status,
        driverName: orderStatus.driverInfo?.name,
        estimatedTime: orderStatus.estimatedTime,
        priority: orderStatus.status === 'delivered' ? 'high' : 'medium'
      });

      // Also show toast notification
      const statusInfo = getStatusInfo(orderStatus.status);
      toast({
        title: statusInfo.title,
        description: statusInfo.description,
        variant: "default"
      });
    }
    
    if (orderStatus?.status) {
      setPreviousStatus(orderStatus.status);
    }
  }, [orderStatus?.status, previousStatus, announceDeliveryUpdate, trackingNumber, orderStatus?.driverInfo, orderStatus?.estimatedTime, toast]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-500",
          icon: "fas fa-clock",
          text: "Recherche de livreur...",
          description: "Nous cherchons un livreur disponible dans votre zone"
        };
      case "accepted":
        return {
          color: "bg-green-500",
          icon: "fas fa-user-check",
          text: "Livreur assigné",
          description: "Un livreur a accepté votre commande et se dirige vers le point de collecte"
        };
      case "picked_up":
        return {
          color: "bg-blue-500",
          icon: "fas fa-box",
          text: "Colis collecté",
          description: "Le livreur a récupéré votre colis et est en route"
        };
      case "in_transit":
        return {
          color: "bg-blue-600",
          icon: "fas fa-route",
          text: "En transit",
          description: "Votre colis est en cours de livraison"
        };
      case "delivered":
        return {
          color: "bg-green-600",
          icon: "fas fa-check-circle",
          text: "Livré",
          description: "Votre colis a été livré avec succès"
        };
      case "cancelled":
        return {
          color: "bg-red-500",
          icon: "fas fa-times-circle",
          text: "Annulé",
          description: "Cette commande a été annulée"
        };
      default:
        return {
          color: "bg-gray-500",
          icon: "fas fa-question",
          text: "Statut inconnu",
          description: "Vérification du statut en cours..."
        };
    }
  };

  if (!orderStatus) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(orderStatus.status);
  const canCancel = orderStatus.canCancel && orderStatus.status === "pending";

  return (
    <Card className="border-l-4 border-l-mako-green">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-mako-dark">
            <i className="fas fa-shipping-fast mr-2 text-mako-green"></i>
            Commande #{trackingNumber}
          </CardTitle>
          <Badge className={`${statusInfo.color} text-white`}>
            <i className={`${statusInfo.icon} mr-1`}></i>
            {statusInfo.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Description */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 font-medium mb-1">
            {statusInfo.description}
          </p>
          <p className="text-xs text-gray-500">
            Dernière mise à jour : {new Date(orderStatus.lastUpdate).toLocaleString('fr-FR')}
          </p>
        </div>

        {/* Driver Information */}
        {orderStatus.driverAssigned && orderStatus.driverInfo && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <i className="fas fa-motorcycle mr-2"></i>
              Votre livreur
            </h4>
            <div className="space-y-1">
              <p className="text-sm text-green-700">
                <strong>Nom :</strong> {orderStatus.driverInfo.name}
              </p>
              <p className="text-sm text-green-700">
                <strong>Téléphone :</strong> {orderStatus.driverInfo.phone}
              </p>
              <p className="text-sm text-green-700">
                <strong>Véhicule :</strong> {orderStatus.driverInfo.vehicle}
              </p>
            </div>
          </div>
        )}

        {/* Real-time Updates */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Mise à jour automatique toutes les {refreshInterval / 1000}s
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs"
          >
            <i className="fas fa-sync-alt mr-1"></i>
            Actualiser
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {canCancel ? (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                <i className="fas fa-info-circle mr-1 text-blue-500"></i>
                Vous pouvez annuler tant qu'aucun livreur n'a accepté
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling || cancelOrderMutation.isPending}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                {isCancelling || cancelOrderMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-1"></i>
                    Annulation...
                  </>
                ) : (
                  <>
                    <i className="fas fa-times mr-1"></i>
                    Annuler la commande
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="w-full">
              {orderStatus.status === "accepted" && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <i className="fas fa-lock mr-2"></i>
                  <span>
                    Commande confirmée - Annulation impossible (livreur assigné)
                  </span>
                </div>
              )}
              {orderStatus.status === "cancelled" && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <i className="fas fa-times-circle mr-2"></i>
                  <span>Cette commande a été annulée</span>
                </div>
              )}
              {orderStatus.status === "delivered" && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <i className="fas fa-check-circle mr-2"></i>
                  <span>Livraison terminée avec succès</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voice Assistant Panel */}
        <div className="mt-6">
          <VoiceAssistantPanel userType="customer" className="border-blue-100" />
        </div>
      </CardContent>
    </Card>
  );
}