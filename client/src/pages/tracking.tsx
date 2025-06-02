import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import OrderStatus from "@/components/order-status";
import DeliveryRouteMap from "@/components/delivery-route-map";

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(false);

  const { data: myOrders } = useQuery({
    queryKey: ["/api/orders/my"],
  });

  const { data: trackedOrder, isLoading: isTracking } = useQuery({
    queryKey: ["/api/orders/track", trackingNumber],
    enabled: !!trackingNumber && searchAttempted,
    retry: false,
  });

  const handleTrackOrder = () => {
    if (trackingNumber.trim()) {
      setSearchAttempted(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tracking Search */}
          <Card className="shadow-xl mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-mako-dark mb-4">
                <i className="fas fa-search mr-2 text-mako-green"></i>
                Suivre ma Livraison
              </CardTitle>
              <p className="text-mako-gray">Entrez votre numéro de suivi pour voir le statut de votre colis</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Ex: MAKO123456789"
                  value={trackingNumber}
                  onChange={(e) => {
                    setTrackingNumber(e.target.value);
                    setSearchAttempted(false);
                  }}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleTrackOrder();
                    }
                  }}
                />
                <Button 
                  onClick={handleTrackOrder}
                  disabled={!trackingNumber.trim() || isTracking}
                  className="px-8"
                >
                  {isTracking ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Recherche...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search mr-2"></i>
                      Suivre
                    </>
                  )}
                </Button>
              </div>

              {/* Tracking Result */}
              {searchAttempted && trackingNumber && (
                <div className="mt-6 space-y-6">
                  {trackedOrder ? (
                    <>
                      <OrderStatus order={trackedOrder} showHistory={true} />
                      
                      {/* Interactive Route Map */}
                      <DeliveryRouteMap 
                        orderId={trackedOrder.id.toString()}
                        pickupLocation={{
                          id: "pickup",
                          name: "Point de collecte",
                          address: trackedOrder.pickupAddress,
                          lat: 12.6392,
                          lng: -8.0029,
                          type: "pickup",
                          status: trackedOrder.status === "pending" ? "pending" : "completed"
                        }}
                        deliveryLocation={{
                          id: "delivery", 
                          name: "Point de livraison",
                          address: trackedOrder.deliveryAddress,
                          lat: 12.6500,
                          lng: -7.9950,
                          type: "delivery",
                          status: trackedOrder.status === "delivered" ? "completed" : 
                                 trackedOrder.status === "in_transit" ? "current" : "pending"
                        }}
                        driverLocation={trackedOrder.status !== "pending" ? {
                          id: "driver",
                          name: "Livreur",
                          address: "En route",
                          lat: 12.6450,
                          lng: -7.9980,
                          type: "driver",
                          status: "current"
                        } : undefined}
                        isAnimated={true}
                        showControls={true}
                        className="mt-6"
                      />
                    </>
                  ) : !isTracking ? (
                    <div className="text-center py-8">
                      <i className="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
                      <h3 className="text-lg font-semibold text-mako-dark mb-2">Commande introuvable</h3>
                      <p className="text-mako-gray">Vérifiez votre numéro de suivi et réessayez</p>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Orders */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-list mr-2 text-mako-green"></i>
                Mes Commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myOrders && myOrders.length > 0 ? (
                <div className="space-y-6">
                  {myOrders.map((order: any) => (
                    <OrderStatus key={order.id} order={order} showHistory={false} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-box-open text-6xl text-mako-silver mb-4"></i>
                  <h3 className="text-lg font-semibold text-mako-dark mb-2">Aucune commande</h3>
                  <p className="text-mako-gray mb-4">Vous n'avez pas encore passé de commande</p>
                  <Button onClick={() => window.location.href = "/delivery"}>
                    <i className="fas fa-plus mr-2"></i>
                    Créer ma première commande
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}
