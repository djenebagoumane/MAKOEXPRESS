import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DeliveryCardProps {
  order: {
    id: number;
    trackingNumber: string;
    pickupAddress: string;
    deliveryAddress: string;
    packageType: string;
    weight: string;
    price: string;
    status: string;
    customerPhone?: string;
    urgency?: string;
  };
  onAccept?: () => void;
  onUpdateStatus?: (status: string) => void;
  isAccepting?: boolean;
  isUpdating?: boolean;
  showAcceptButton?: boolean;
  showStatusActions?: boolean;
}

export default function DeliveryCard({
  order,
  onAccept,
  onUpdateStatus,
  isAccepting = false,
  isUpdating = false,
  showAcceptButton = false,
  showStatusActions = false,
}: DeliveryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "picked_up":
        return "bg-purple-100 text-purple-800";
      case "accepted":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Livré";
      case "in_transit":
        return "En transit";
      case "picked_up":
        return "Collecté";
      case "accepted":
        return "Accepté";
      case "pending":
        return "En attente";
      default:
        return "Inconnu";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "express":
        return "bg-orange-100 text-orange-800";
      case "standard":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "Urgent (1h)";
      case "express":
        return "Express (4h)";
      case "standard":
        return "Standard (24h)";
      default:
        return "Standard";
    }
  };

  return (
    <div className="bg-white border border-mako-silver rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="font-medium text-mako-dark">#{order.trackingNumber}</span>
          <Badge className={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Badge>
          {order.urgency && (
            <Badge variant="outline" className={getUrgencyColor(order.urgency)}>
              {getUrgencyText(order.urgency)}
            </Badge>
          )}
        </div>
        <span className="bg-mako-green text-white px-3 py-1 rounded-full text-sm font-medium">
          {Number(order.price).toLocaleString()} FCFA
        </span>
      </div>

      <div className="text-sm text-mako-gray space-y-1 mb-4">
        <p>
          <i className="fas fa-map-marker-alt text-mako-green mr-2"></i>
          De: {order.pickupAddress}
        </p>
        <p>
          <i className="fas fa-flag-checkered text-mako-green mr-2"></i>
          À: {order.deliveryAddress}
        </p>
        <div className="flex items-center space-x-4">
          <p>
            <i className="fas fa-weight text-mako-green mr-2"></i>
            Poids: {order.weight}
          </p>
          <p>
            <i className="fas fa-box text-mako-green mr-2"></i>
            Type: {order.packageType}
          </p>
        </div>
        {order.customerPhone && (
          <p>
            <i className="fas fa-phone text-mako-green mr-2"></i>
            Client: {order.customerPhone}
          </p>
        )}
      </div>

      {showAcceptButton && onAccept && (
        <Button 
          onClick={onAccept}
          disabled={isAccepting}
          className="w-full"
        >
          {isAccepting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Acceptation...
            </>
          ) : (
            <>
              <i className="fas fa-check mr-2"></i>
              Accepter cette livraison
            </>
          )}
        </Button>
      )}

      {showStatusActions && onUpdateStatus && (
        <div className="flex gap-2">
          {order.status === "accepted" && (
            <Button 
              onClick={() => onUpdateStatus("picked_up")}
              disabled={isUpdating}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {isUpdating ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-hand-paper mr-2"></i>
              )}
              Collecter
            </Button>
          )}

          {order.status === "picked_up" && (
            <Button 
              onClick={() => onUpdateStatus("in_transit")}
              disabled={isUpdating}
              className="flex-1 bg-purple-500 hover:bg-purple-600"
            >
              {isUpdating ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-truck mr-2"></i>
              )}
              En route
            </Button>
          )}

          {order.status === "in_transit" && (
            <Button 
              onClick={() => onUpdateStatus("delivered")}
              disabled={isUpdating}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              {isUpdating ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-check-circle mr-2"></i>
              )}
              Marquer comme livré
            </Button>
          )}

          {order.customerPhone && (
            <Button 
              onClick={() => window.open(`tel:${order.customerPhone}`)}
              variant="outline"
              className="px-4"
            >
              <i className="fas fa-phone"></i>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
