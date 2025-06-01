import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

interface OrderStatusProps {
  order: {
    id: number;
    trackingNumber: string;
    pickupAddress: string;
    deliveryAddress: string;
    packageType: string;
    weight: string;
    price: string;
    status: string;
    driverId?: string;
    customerPhone?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    deliveredAt?: string;
    estimatedDeliveryTime?: string;
    statusHistory?: Array<{
      id: number;
      status: string;
      location?: string;
      notes?: string;
      timestamp: string;
    }>;
  };
  showHistory?: boolean;
}

export default function OrderStatus({ order, showHistory = false }: OrderStatusProps) {
  const { data: orderDetails } = useQuery({
    queryKey: [`/api/orders/track/${order.trackingNumber}`],
    enabled: showHistory && !order.statusHistory,
  });

  const statusHistory = order.statusHistory || orderDetails?.statusHistory || [];

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return "fas fa-check-circle";
      case "in_transit":
        return "fas fa-truck";
      case "picked_up":
        return "fas fa-hand-paper";
      case "accepted":
        return "fas fa-user-check";
      case "pending":
        return "fas fa-clock";
      default:
        return "fas fa-circle";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "pending":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payé";
      case "failed":
        return "Échec";
      case "pending":
        return "En attente";
      default:
        return "Inconnu";
    }
  };

  return (
    <div className="border border-mako-silver rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-semibold text-mako-dark">
            Colis #{order.trackingNumber}
          </h4>
          <p className="text-mako-gray">
            De: {order.pickupAddress} → À: {order.deliveryAddress}
          </p>
        </div>
        <Badge className={getStatusColor(order.status)}>
          {getStatusText(order.status)}
        </Badge>
      </div>

      {showHistory && statusHistory.length > 0 && (
        <div className="space-y-4 mb-6">
          <h5 className="font-medium text-mako-dark">Historique du colis</h5>
          {statusHistory.map((item, index) => (
            <div key={item.id || index} className="flex items-start space-x-4">
              <div className={`rounded-full w-4 h-4 mt-1 ${
                index === 0 ? 'bg-mako-green' : 
                order.status === 'delivered' && index < 3 ? 'bg-mako-green' :
                order.status === 'in_transit' && index < 2 ? 'bg-mako-green' :
                order.status === 'picked_up' && index < 1 ? 'bg-mako-green' :
                index === 0 ? 'bg-mako-green' : 'bg-mako-silver'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-mako-dark flex items-center">
                    <i className={`${getStatusIcon(item.status)} mr-2 text-mako-green`}></i>
                    {getStatusText(item.status)}
                  </span>
                  <span className="text-sm text-mako-gray">
                    {new Date(item.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-sm text-mako-gray mt-1">{item.notes}</p>
                )}
                {item.location && (
                  <p className="text-sm text-mako-gray">📍 {item.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-mako-gray">Poids:</span>
          <p className="font-medium text-mako-dark">{order.weight}</p>
        </div>
        <div>
          <span className="text-mako-gray">Type:</span>
          <p className="font-medium text-mako-dark">{order.packageType}</p>
        </div>
        <div>
          <span className="text-mako-gray">Prix:</span>
          <p className="font-medium text-mako-dark">
            {Number(order.price).toLocaleString()} FCFA
          </p>
        </div>
      </div>

      {(order.customerPhone || order.paymentStatus || order.driverId) && (
        <div className="mt-6 pt-6 border-t border-mako-silver">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {order.customerPhone && (
              <div>
                <span className="text-mako-gray">Contact:</span>
                <p className="font-medium text-mako-dark">{order.customerPhone}</p>
              </div>
            )}
            {order.paymentStatus && (
              <div>
                <span className="text-mako-gray">Paiement:</span>
                <p className={`font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {getPaymentStatusText(order.paymentStatus)}
                  {order.paymentMethod && ` via ${order.paymentMethod.toUpperCase()}`}
                </p>
              </div>
            )}
            {order.estimatedDeliveryTime && order.status !== 'delivered' && (
              <div>
                <span className="text-mako-gray">Estimation:</span>
                <p className="font-medium text-mako-dark">
                  {new Date(order.estimatedDeliveryTime).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
            {order.deliveredAt && order.status === 'delivered' && (
              <div>
                <span className="text-mako-gray">Livré le:</span>
                <p className="font-medium text-mako-green">
                  {new Date(order.deliveredAt).toLocaleDateString('fr-FR')} à{' '}
                  {new Date(order.deliveredAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
