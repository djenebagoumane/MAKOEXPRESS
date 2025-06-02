import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import OnboardingTutorial from "@/components/onboarding-tutorial";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function Landing() {
  const { showOnboarding, completeOnboarding, closeOnboarding, startOnboarding } = useOnboarding();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="gradient-mako text-white py-12 sm:py-16 lg:py-24 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                Livraison rapide et fiable à travers le Mali
              </h1>
              <p className="text-lg sm:text-xl text-green-100">
                Envoyez vos colis en toute sécurité avec MAKOEXPRESS. 
                Paiement facile avec MAKOPAY, suivi en temps réel et livreurs vérifiés.
              </p>
              <div className="flex flex-col gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
                <Button 
                  onClick={() => window.location.href = "/delivery"}
                  className="bg-white text-mako-green h-12 sm:h-14 px-6 sm:px-8 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center text-sm sm:text-base touch-manipulation"
                >
                  <i className="fas fa-box mr-2"></i>
                  Envoyer un colis
                </Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    onClick={() => window.location.href = "/driver/register"}
                    variant="outline"
                    className="bg-white text-mako-green h-12 px-4 sm:px-6 rounded-xl font-semibold hover:bg-white hover:text-mako-green transition-colors flex items-center justify-center text-sm touch-manipulation"
                  >
                    <i className="fas fa-motorcycle mr-2"></i>
                    Devenir livreur
                  </Button>
                  <Button 
                    onClick={startOnboarding}
                    variant="outline"
                    className="border-2 border-yellow-400 text-yellow-400 h-12 px-4 sm:px-6 rounded-xl font-semibold hover:bg-yellow-400 hover:text-mako-green transition-colors flex items-center justify-center text-sm touch-manipulation"
                  >
                    <i className="fas fa-question-circle mr-2"></i>
                    Guide
                  </Button>
                </div>
                <Button 
                  onClick={() => window.location.href = "/auth/login"}
                  variant="outline"
                  className="bg-white text-mako-green  h-12 sm:h-14 px-6 sm:px-8 rounded-xl font-semibold hover:bg-white hover:text-mako-green transition-colors flex items-center justify-center text-sm sm:text-base touch-manipulation"
                >
                  <i className="fas fa-user mr-2"></i>
                  Se connecter
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <div className="w-full h-64 bg-white/20 rounded-xl flex items-center justify-center">
                  <i className="fas fa-truck text-white text-6xl opacity-50"></i>
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
                  <i className="fas fa-bolt text-white text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-mako-dark mb-3">Livraison Express</h3>
                <p className="text-mako-gray">Livraison ultra-rapide en 1-6 heures à Bamako</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-mako-green text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-mako-dark mb-3">Sécurité Garantie</h3>
                <p className="text-mako-gray">Vos colis sont assurés et suivis en permanence</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-mobile-alt text-mako-green text-2xl"></i>
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
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-credit-card text-mako-anthracite text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Paiement Mobile</h3>
                  <p className="text-green-100">Payez directement depuis votre téléphone avec MAKOPAY</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-lock text-mako-anthracite text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Sécurité Maximale</h3>
                  <p className="text-green-100">Toutes vos transactions sont cryptées et sécurisées</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-clock text-mako-anthracite text-lg"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Instantané</h3>
                  <p className="text-green-100">Confirmez votre livraison et payez en quelques secondes</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <div className="text-center">
                <div className="bg-yellow-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-mobile-alt text-mako-anthracite text-3xl"></i>
                </div>
                <h3 className="text-2xl font-bold mb-4">MAKOPAY</h3>
                <p className="text-green-100 mb-6">Le portefeuille digital du Mali intégré à MAKOEXPRESS</p>
                <Button 
                  className="bg-yellow-400 text-mako-anthracite hover:bg-yellow-300 font-semibold px-8 py-3"
                  onClick={() => window.open("https://makopay.ml", "_blank")}
                >
                  Découvrir MAKOPAY
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Tutoriel d'onboarding */}
      <OnboardingTutorial
        isOpen={showOnboarding}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </div>
  );
}