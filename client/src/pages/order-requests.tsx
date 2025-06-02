import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import OrderRequestCard from "@/components/order-request-card";
import VoiceControlPanel from "@/components/voice-control-panel";
import { useVoiceGuidance } from "@/hooks/useVoiceGuidance";

export default function OrderRequests() {
  const [activeTab, setActiveTab] = useState<"available" | "my-orders">("available");
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const { announceNewOrder, announceStatusChange } = useVoiceGuidance();

  // Available orders for drivers
  const { data: availableOrders, refetch: refetchAvailable } = useQuery({
    queryKey: ["/api/orders/available"],
    refetchInterval: refreshInterval,
    enabled: activeTab === "available"
  });

  // Driver's accepted orders
  const { data: myOrders, refetch: refetchMy } = useQuery({
    queryKey: ["/api/orders/my"],
    refetchInterval: refreshInterval,
    enabled: activeTab === "my-orders"
  });

  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === "available") {
        refetchAvailable();
      } else {
        refetchMy();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [activeTab, refreshInterval, refetchAvailable, refetchMy]);

  const handleOrderAccepted = () => {
    // Refresh both lists when an order is accepted
    refetchAvailable();
    refetchMy();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-mako-dark dark:text-white mb-4">
            <i className="fas fa-motorcycle mr-3 text-mako-green"></i>
            Tableau de bord livreur
          </h1>
          <p className="text-xl text-mako-gray dark:text-gray-300">
            Gérez vos commandes de livraison en temps réel
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg border border-gray-200 dark:border-gray-700">
            <Button
              variant={activeTab === "available" ? "default" : "ghost"}
              onClick={() => setActiveTab("available")}
              className={`px-6 py-2 ${activeTab === "available" ? "bg-mako-green text-white" : "text-gray-600 dark:text-gray-300"}`}
            >
              <i className="fas fa-list mr-2"></i>
              Commandes disponibles
              {availableOrders && (
                <Badge className="ml-2 bg-orange-500 text-white">
                  {availableOrders.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === "my-orders" ? "default" : "ghost"}
              onClick={() => setActiveTab("my-orders")}
              className={`px-6 py-2 ${activeTab === "my-orders" ? "bg-mako-green text-white" : "text-gray-600 dark:text-gray-300"}`}
            >
              <i className="fas fa-tasks mr-2"></i>
              Mes commandes
              {myOrders && (
                <Badge className="ml-2 bg-blue-500 text-white">
                  {myOrders.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Refresh Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab === "available") {
                  refetchAvailable();
                } else {
                  refetchMy();
                }
              }}
              className="flex items-center"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Actualiser
            </Button>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value={10000}>Actualisation : 10s</option>
              <option value={30000}>Actualisation : 30s</option>
              <option value={60000}>Actualisation : 1min</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <i className="fas fa-clock mr-1"></i>
            Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
          </div>
        </div>

        {/* Voice Control Panel */}
        <VoiceControlPanel userType="driver" className="mb-6" />

        {/* Content */}
        {activeTab === "available" && (
          <div>
            <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                  <i className="fas fa-bell mr-2 text-mako-green"></i>
                  Nouvelles demandes de livraison
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableOrders && availableOrders.length > 0 ? (
                  <div className="space-y-4">
                    {availableOrders.map((order: any) => (
                      <OrderRequestCard
                        key={order.id}
                        order={order}
                        onAccept={handleOrderAccepted}
                        isDriver={true}
                        showActions={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-inbox text-6xl text-gray-400 dark:text-gray-500 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Aucune commande disponible
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Les nouvelles demandes apparaîtront ici automatiquement
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "my-orders" && (
          <div>
            <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
                  <i className="fas fa-clipboard-list mr-2 text-mako-green"></i>
                  Mes commandes acceptées
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myOrders && myOrders.length > 0 ? (
                  <div className="space-y-4">
                    {myOrders.map((order: any) => (
                      <OrderRequestCard
                        key={order.id}
                        order={order}
                        isDriver={true}
                        showActions={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-clipboard text-6xl text-gray-400 dark:text-gray-500 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Aucune commande acceptée
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Vos commandes acceptées apparaîtront ici
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-mako-green mb-2">
                {availableOrders?.length || 0}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Commandes disponibles</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {myOrders?.length || 0}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Mes commandes</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">
                {refreshInterval / 1000}s
              </div>
              <p className="text-gray-600 dark:text-gray-400">Intervalle de mise à jour</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}