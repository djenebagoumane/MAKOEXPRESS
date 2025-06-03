import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import WeatherWidget from "@/components/weather-widget";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  
  const { data: myOrders } = useQuery({
    queryKey: ["/api/orders/my"],
  });

  const { data: driverProfile } = useQuery({
    queryKey: ["/api/drivers/profile"],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-20 md:pb-8">
        {/* Welcome Section */}
        <section className="gradient-mako text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <h1 className="text-3xl lg:text-4xl font-bold mb-4">
                  Bienvenue, {user?.firstName || 'Utilisateur'}!
                </h1>
                <p className="text-green-100 text-lg">
                  Que souhaitez-vous faire aujourd'hui ?
                </p>
              </div>
              <div className="lg:col-span-1">
                <WeatherWidget location="Bamako" compact={true} />
              </div>
            </div>
          </div>
        </section>

        {/* Weather and Quick Actions */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Weather Context for Deliveries */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold text-mako-dark mb-4">Conditions de livraison actuelles</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <WeatherWidget location="Bamako" />
                  <WeatherWidget location="Sikasso" compact={true} />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-mako-dark mb-4">Autres villes</h2>
                <div className="space-y-3">
                  <WeatherWidget location="Ségou" compact={true} />
                  <WeatherWidget location="Mopti" compact={true} />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-mako-dark mb-4">Actions rapides</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/delivery">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-mako-green rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-box text-white text-2xl"></i>
                    </div>
                    <h3 className="font-semibold text-mako-dark">Envoyer un Colis</h3>
                    <p className="text-sm text-mako-gray mt-2">Créer une nouvelle demande de livraison</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/tracking">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-search text-white text-2xl"></i>
                    </div>
                    <h3 className="font-semibold text-mako-dark">Suivre un Colis</h3>
                    <p className="text-sm text-mako-gray mt-2">Vérifier le statut de vos livraisons</p>
                  </CardContent>
                </Card>
              </Link>

              {driverProfile ? (
                <Link href="/driver/dashboard">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-motorcycle text-white text-2xl"></i>
                      </div>
                      <h3 className="font-semibold text-mako-dark">Tableau de Bord</h3>
                      <p className="text-sm text-mako-gray mt-2">Gérer vos livraisons</p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Link href="/driver/register">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-user-plus text-white text-2xl"></i>
                      </div>
                      <h3 className="font-semibold text-mako-dark">Devenir Livreur</h3>
                      <p className="text-sm text-mako-gray mt-2">Rejoindre notre équipe</p>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {/* Mon Compte - pour tous les utilisateurs connectés */}
              <Link href="/account">
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
          </div>
        </section>

        {/* Recent Orders */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-history mr-2 text-mako-green"></i>
                  Mes Commandes Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myOrders && myOrders.length > 0 ? (
                  <div className="space-y-4">
                    {myOrders.slice(0, 3).map((order: any) => (
                      <div key={order.id} className="border border-mako-silver rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-mako-dark">#{order.trackingNumber}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'delivered' ? 'Livré' :
                             order.status === 'in_transit' ? 'En transit' :
                             order.status === 'accepted' ? 'Accepté' :
                             order.status === 'picked_up' ? 'Collecté' :
                             'En attente'}
                          </span>
                        </div>
                        <div className="text-sm text-mako-gray">
                          <p><i className="fas fa-map-marker-alt text-mako-green mr-2"></i>De: {order.pickupAddress}</p>
                          <p><i className="fas fa-flag-checkered text-mako-green mr-2"></i>À: {order.deliveryAddress}</p>
                          <p><i className="fas fa-money-bill text-mako-green mr-2"></i>Prix: {Number(order.price).toLocaleString()} FCFA</p>
                        </div>
                      </div>
                    ))}
                    {myOrders.length > 3 && (
                      <div className="text-center">
                        <Link href="/tracking">
                          <Button variant="outline">
                            Voir toutes mes commandes
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-box-open text-6xl text-mako-silver mb-4"></i>
                    <h3 className="text-lg font-semibold text-mako-dark mb-2">Aucune commande</h3>
                    <p className="text-mako-gray mb-4">Vous n'avez pas encore passé de commande</p>
                    <Link href="/delivery">
                      <Button>
                        <i className="fas fa-plus mr-2"></i>
                        Créer ma première commande
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}
