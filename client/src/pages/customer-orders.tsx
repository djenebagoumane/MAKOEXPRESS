import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CustomerOrderStatus from "@/components/customer-order-status";
import VoiceControlPanel from "@/components/voice-control-panel";

export default function CustomerOrders() {
  const [trackingNumber, setTrackingNumber] = useState("");

  // Get customer's orders
  const { data: customerOrders } = useQuery({
    queryKey: ["/api/customer/orders"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Search for specific order
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      // Navigate to tracking page or show specific order
      window.location.href = `/tracking?number=${trackingNumber}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-mako-dark dark:text-white mb-4">
            <i className="fas fa-box mr-3 text-mako-green"></i>
            Mes Commandes
          </h1>
          <p className="text-xl text-mako-gray dark:text-gray-300">
            Suivez vos livraisons en temps réel
          </p>
        </div>

        {/* Voice Control Panel */}
        <VoiceControlPanel userType="customer" className="mb-6" />

        {/* Quick Search */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <i className="fas fa-search mr-2 text-mako-green"></i>
              Recherche rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex space-x-3">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Entrez votre numéro de suivi (ex: MAKO001234)"
                className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
              <Button
                type="submit"
                className="bg-mako-green hover:bg-green-600 text-white"
              >
                <i className="fas fa-search mr-2"></i>
                Rechercher
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className="mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <i className="fas fa-truck mr-2 text-mako-green"></i>
              Commandes actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customerOrders && customerOrders.length > 0 ? (
              <div className="space-y-6">
                {customerOrders.map((order: any) => (
                  <CustomerOrderStatus
                    key={order.id}
                    orderId={order.id}
                    trackingNumber={order.trackingNumber}
                    refreshInterval={15000}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <i className="fas fa-inbox text-6xl text-gray-400 dark:text-gray-500 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Aucune commande active
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Vous n'avez pas de commandes en cours de livraison
                </p>
                <Button 
                  onClick={() => window.location.href = "/delivery"}
                  className="bg-mako-green hover:bg-green-600 text-white"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Nouvelle commande
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Orders for Testing */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <i className="fas fa-vial mr-2 text-blue-500"></i>
              Commandes de test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Utilisez ces commandes de démonstration pour tester le système :
            </p>
            
            <div className="space-y-4">
              <CustomerOrderStatus
                orderId={1}
                trackingNumber="MAKO001234"
                refreshInterval={10000}
              />
              
              <CustomerOrderStatus
                orderId={2}
                trackingNumber="MAKO001235"
                refreshInterval={10000}
              />
              
              <CustomerOrderStatus
                orderId={3}
                trackingNumber="MAKO001236"
                refreshInterval={10000}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}