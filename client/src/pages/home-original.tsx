import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: orders } = useQuery({
    queryKey: ["/api/orders/my"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <div>Redirection...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <section className="py-12 text-center">
          <h1 className="text-4xl font-bold text-mako-dark mb-4">
            Bienvenue sur MAKOEXPRESS
          </h1>
          <p className="text-xl text-mako-gray mb-8">
            Bonjour {user?.firstName || 'Utilisateur'}, votre plateforme de livraison rapide au Mali
          </p>
        </section>

        {/* Quick Actions */}
        <section className="py-8 bg-white rounded-lg shadow-sm mb-8">
          <div className="px-8">
            <h2 className="text-2xl font-bold text-mako-dark mb-8 text-center">Actions Rapides</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link href="/delivery">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-mako-green rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-plus text-white text-2xl"></i>
                    </div>
                    <h3 className="font-semibold text-mako-dark">Nouvelle Livraison</h3>
                    <p className="text-sm text-mako-gray mt-2">Créer une commande</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tracking">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-search text-white text-2xl"></i>
                    </div>
                    <h3 className="font-semibold text-mako-dark">Suivi de Colis</h3>
                    <p className="text-sm text-mako-gray mt-2">Localiser votre commande</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/customer-account">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-user text-white text-2xl"></i>
                    </div>
                    <h3 className="font-semibold text-mako-dark">Mon Compte</h3>
                    <p className="text-sm text-mako-gray mt-2">Profil et historique</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/driver/register">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-motorcycle text-white text-2xl"></i>
                    </div>
                    <h3 className="font-semibold text-mako-dark">Devenir Livreur</h3>
                    <p className="text-sm text-mako-gray mt-2">Rejoindre notre équipe</p>
                  </CardContent>
                </Card>
              </Link>

              {user?.role === 'admin' && (
                <Link href="/admin">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="bg-red-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-cog text-white text-2xl"></i>
                      </div>
                      <h3 className="font-semibold text-mako-dark">Administration</h3>
                      <p className="text-sm text-mako-gray mt-2">Gérer la plateforme</p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Recent Orders */}
        <section className="py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-history mr-2 text-mako-green"></i>
                Commandes Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">#{order.trackingNumber}</p>
                        <p className="text-sm text-gray-600">{order.pickupAddress} → {order.deliveryAddress}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status === 'delivered' ? 'Livré' :
                           order.status === 'in_transit' ? 'En transit' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-box-open text-4xl mb-4"></i>
                  <p>Aucune commande récente</p>
                  <Link href="/delivery" className="text-mako-green hover:underline">
                    Créer votre première livraison
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Weather Widget */}
        <section className="py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-cloud-sun mr-2 text-blue-500"></i>
                Conditions Météo - Mali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold">Bamako</p>
                  <p className="text-2xl font-bold text-blue-600">28°C</p>
                  <p className="text-sm text-gray-600">Ensoleillé</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="font-semibold">Sikasso</p>
                  <p className="text-2xl font-bold text-green-600">26°C</p>
                  <p className="text-sm text-gray-600">Nuageux</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="font-semibold">Kayes</p>
                  <p className="text-2xl font-bold text-yellow-600">31°C</p>
                  <p className="text-sm text-gray-600">Ensoleillé</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}