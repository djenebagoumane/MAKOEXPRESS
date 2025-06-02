import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OrderRequest {
  id: number;
  trackingNumber: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageType: string;
  weight: string;
  price: string;
  urgency: string;
  customerPhone: string;
  status: string;
  distance: number;
  estimatedTime: string;
  createdAt: string;
  customerName?: string;
  specialInstructions?: string;
}

interface OrderRequestCardProps {
  order: OrderRequest;
  onAccept?: () => void;
  onDecline?: () => void;
  showActions?: boolean;
  isDriver?: boolean;
}

export default function OrderRequestCard({
  order,
  onAccept,
  onDecline,
  showActions = true,
  isDriver = false
}: OrderRequestCardProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const acceptOrderMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/orders/${order.id}/accept`, {
        method: "POST",
        body: JSON.stringify({})
      });
    },
    onSuccess: () => {
      toast({
        title: "Commande acceptée",
        description: `Vous avez accepté la commande ${order.trackingNumber}`,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/available"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/my"] });
      onAccept?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la commande",
        variant: "destructive"
      });
    }
  });

  const declineOrderMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/orders/${order.id}/decline`, {
        method: "POST",
        body: JSON.stringify({})
      });
    },
    onSuccess: () => {
      toast({
        title: "Commande refusée",
        description: "La commande a été refusée",
        variant: "default"
      });
      onDecline?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de refuser la commande",
        variant: "destructive"
      });
    }
  });

  const handleAccept = () => {
    setIsAccepting(true);
    acceptOrderMutation.mutate();
  };

  const handleDecline = () => {
    setIsDeclining(true);
    declineOrderMutation.mutate();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "express": return "bg-red-500 text-white";
      case "urgent": return "bg-orange-500 text-white";
      case "standard": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-mako-green">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-mako-dark flex items-center">
            <i className="fas fa-box mr-2 text-mako-green"></i>
            #{order.trackingNumber}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getUrgencyColor(order.urgency)}>
              {order.urgency}
            </Badge>
            <Badge variant="outline" className="text-mako-green border-mako-green">
              {order.price}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Route Information */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Point de collecte</p>
              <p className="text-sm text-gray-600">{order.pickupAddress}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Point de livraison</p>
              <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Package Details */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">Type de colis</p>
            <p className="text-sm font-medium">{order.packageType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Poids</p>
            <p className="text-sm font-medium">{order.weight}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Distance</p>
            <p className="text-sm font-medium">{order.distance} km</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Temps estimé</p>
            <p className="text-sm font-medium">{order.estimatedTime}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {order.customerName || "Client"}
              </p>
              <p className="text-sm text-gray-600">{order.customerPhone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Demandé</p>
              <p className="text-sm font-medium">{formatTimeAgo(order.createdAt)}</p>
            </div>
          </div>
          
          {order.specialInstructions && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-xs text-gray-500">Instructions spéciales</p>
              <p className="text-sm text-gray-700">{order.specialInstructions}</p>
            </div>
          )}
        </div>

        {/* Action Buttons for Drivers */}
        {showActions && isDriver && order.status === "pending" && (
          <div className="flex space-x-3 pt-2">
            <Button
              onClick={handleAccept}
              className="flex-1 bg-mako-green hover:bg-green-600 text-white"
              disabled={isAccepting || acceptOrderMutation.isPending}
            >
              {isAccepting || acceptOrderMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Acceptation...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Accepter
                </>
              )}
            </Button>
            
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
              disabled={isDeclining || declineOrderMutation.isPending}
            >
              {isDeclining || declineOrderMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Refus...
                </>
              ) : (
                <>
                  <i className="fas fa-times mr-2"></i>
                  Refuser
                </>
              )}
            </Button>
          </div>
        )}

        {/* Status for Customers */}
        {!isDriver && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                order.status === "pending" ? "bg-yellow-500" :
                order.status === "accepted" ? "bg-green-500" :
                order.status === "cancelled" ? "bg-red-500" : "bg-gray-500"
              }`}></div>
              <span className="text-sm font-medium">
                {order.status === "pending" && "En attente de livreur"}
                {order.status === "accepted" && "Livreur trouvé !"}
                {order.status === "cancelled" && "Commande annulée"}
              </span>
            </div>
            
            {order.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 border-red-500 hover:bg-red-50"
                onClick={() => {
                  // Handle cancellation
                }}
              >
                <i className="fas fa-times mr-1"></i>
                Annuler
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}