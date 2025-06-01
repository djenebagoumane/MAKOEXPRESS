import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="gradient-mako text-white py-16 lg:py-24 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Livraison rapide et fiable à travers le Mali
              </h1>
              <p className="text-xl text-green-100">
                Envoyez vos colis en toute sécurité avec MAKOEXPRESS. 
                Paiement facile avec MAKOPAY, suivi en temps réel et livreurs vérifiés.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => window.location.href = "/auth/register"}
                  className="bg-white text-mako-green px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
                >
                  <i className="fas fa-box mr-2"></i>
                  Envoyer un colis
                </Button>
                <Button 
                  onClick={() => window.location.href = "/auth/login"}
                  variant="outline"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-mako-green transition-colors flex items-center justify-center"
                >
                  <i className="fas fa-motorcycle mr-2"></i>
                  Devenir livreur
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 h-80 flex items-center justify-center">
                <div className="text-center text-mako-gray">
                  <i className="fas fa-motorcycle text-6xl text-mako-green mb-4"></i>
                  <p className="text-lg">Livreur professionnel au Mali</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-mako-anthracite mb-4">Nos Services</h2>
            <p className="text-mako-anthracite opacity-70 text-lg max-w-2xl mx-auto">
              Une solution complète de livraison adaptée aux besoins du Mali
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-mako-green rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shipping-fast text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-mako-anthracite mb-3">Livraison Express</h3>
                <p className="text-mako-anthracite opacity-70">Livraison dans la journée pour Bamako et principales villes du Mali</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-mako-green rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-mako-dark mb-3">Sécurisé</h3>
                <p className="text-mako-gray">Livreurs vérifiés et assurance de vos colis jusqu'à destination</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-mako-green rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-mobile-alt text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-mako-dark mb-3">Suivi en Temps Réel</h3>
                <p className="text-mako-gray">Suivez votre colis à chaque étape via notre application</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment Integration */}
      <section className="py-16 bg-mako-green" id="payment">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-12">
            <h2 className="text-3xl font-bold mb-4">Paiement Sécurisé avec MAKOPAY</h2>
            <p className="text-green-100 text-lg">
              Intégration complète avec MAKOPAY pour des transactions rapides et sécurisées
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-mobile-alt text-mako-green text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-mako-dark mb-3">Mobile Money</h3>
                <p className="text-mako-gray">Orange Money, Moov Money et tous les opérateurs maliens</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-credit-card text-mako-green text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-mako-dark mb-3">Cartes Bancaires</h3>
                <p className="text-mako-gray">Visa, MasterCard et cartes locales acceptées</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-money-bill text-mako-green text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-mako-dark mb-3">Paiement à la Livraison</h3>
                <p className="text-mako-gray">Payez en espèces directement au livreur</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
