import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Link } from "wouter";
import { useState } from "react";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const { startOnboarding } = useOnboarding();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-mako-green shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-2">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="bg-mako-orange rounded-lg p-2 shadow-sm">
              <i className="fas fa-truck text-white text-lg sm:text-xl"></i>
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate drop-shadow-md">MAKOEXPRESS</h1>
          </Link>
          
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-white hover:text-mako-light transition-colors">
                Accueil
              </Link>
              <div className="relative group">
                <span className="text-white hover:text-mako-light transition-colors cursor-pointer">
                  Livraison
                  <i className="fas fa-chevron-down ml-1 text-xs"></i>
                </span>
                <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-mako-silver opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link href="/delivery/express" className="block px-4 py-3 text-mako-anthracite hover:bg-mako-green hover:text-white transition-colors">
                    <i className="fas fa-bolt mr-2"></i>
                    Livraison Express
                  </Link>
                  <Link href="/delivery/standard" className="block px-4 py-3 text-mako-anthracite hover:bg-mako-green hover:text-white transition-colors">
                    <i className="fas fa-truck mr-2"></i>
                    Livraison Standard
                  </Link>
                </div>
              </div>
              <Link href="/tracking" className="text-white hover:text-mako-light transition-colors">
                <i className="fas fa-search mr-1"></i>
                Suivi de Colis
              </Link>
              <Link href="/ai-recommendations" className="text-white hover:text-mako-light transition-colors">
                <i className="fas fa-brain mr-1"></i>
                Recommandations IA
              </Link>
              <Link href="/customer-account" className="text-white hover:text-mako-light transition-colors">
                <i className="fas fa-user-circle mr-1"></i>
                Mon Compte
              </Link>
              <Link href="/driver/register" className="text-white hover:text-mako-light transition-colors">
                <i className="fas fa-motorcycle mr-1"></i>
                Devenir Livreur
              </Link>
              <Link href="/admin" className="text-white hover:text-mako-light transition-colors">
                <i className="fas fa-cog mr-1"></i>
                Admin
              </Link>
            </nav>
          )}
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Menu hamburger mobile */}
            <button 
              className="md:hidden bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-white text-lg`}></i>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="hidden lg:flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <i className="fas fa-user text-white text-sm"></i>
                  </div>
                  <span className="text-sm text-white">
                    Client
                  </span>
                </div>
                <Button 
                  onClick={() => {
                    console.log("Guide button clicked (authenticated)");
                    startOnboarding();
                  }}
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-mako-green px-2 py-2 cursor-pointer min-w-0 flex-shrink-0"
                >
                  <i className="fas fa-question-circle text-sm"></i>
                  <span className="hidden lg:inline text-sm ml-1">Guide</span>
                </Button>
                <Button 
                  onClick={() => window.location.href = "/auth/login"}
                  variant="outline"
                  size="sm"
                  className="hidden md:block"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button 
                  onClick={() => {
                    console.log("Guide button clicked (not authenticated)");
                    startOnboarding();
                  }}
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-mako-green px-2 py-2 cursor-pointer min-w-0 flex-shrink-0"
                >
                  <i className="fas fa-question-circle text-sm"></i>
                  <span className="hidden lg:inline text-sm ml-1">Guide</span>
                </Button>
                <Button 
                  onClick={() => window.location.href = "/auth/login"}
                  size="sm"
                  className="bg-mako-green text-white hover:bg-green-600 px-2 sm:px-4"
                >
                  <i className="fas fa-user sm:mr-2"></i>
                  <span className="hidden sm:inline">Se connecter</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && isAuthenticated && (
          <div className="md:hidden bg-white border-t border-mako-silver">
            <div className="px-4 py-2 space-y-1">
              <Link 
                href="/" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-home mr-2"></i>
                Accueil
              </Link>
              <Link 
                href="/delivery/express" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-bolt mr-2"></i>
                Livraison Express
              </Link>
              <Link 
                href="/delivery/standard" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-truck mr-2"></i>
                Livraison Standard
              </Link>
              <Link 
                href="/tracking" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-search mr-2"></i>
                Suivi de Colis
              </Link>
              <Link 
                href="/ai-recommendations" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-brain mr-2"></i>
                Recommandations IA
              </Link>
              <Link 
                href="/customer-account" 
                className="block px-3 py-2 text-purple-600 hover:bg-purple-100 hover:text-purple-700 rounded-md transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-user-circle mr-2"></i>
                Mon Compte Client
              </Link>
              <Link 
                href="/driver/register" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-motorcycle mr-2"></i>
                Devenir Livreur
              </Link>
              <div className="border-t border-mako-silver pt-2 mt-2">
                <button 
                  onClick={() => {
                    startOnboarding();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-mako-green hover:bg-mako-green hover:text-white rounded-md transition-colors"
                >
                  <i className="fas fa-question-circle mr-2"></i>
                  Guide d'utilisation
                </button>
                <button 
                  onClick={() => window.location.href = "/auth/login"}
                  className="block w-full text-left px-3 py-2 text-mako-anthracite hover:bg-red-500 hover:text-white rounded-md transition-colors"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Menu mobile pour utilisateurs non connectés */}
        {isMobileMenuOpen && !isAuthenticated && (
          <div className="md:hidden bg-white border-t border-mako-silver">
            <div className="px-4 py-2 space-y-1">
              <Link 
                href="/delivery/express" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-bolt mr-2"></i>
                Livraison Express
              </Link>
              <Link 
                href="/delivery/standard" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-truck mr-2"></i>
                Livraison Standard
              </Link>
              <Link 
                href="/tracking" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-map-marker-alt mr-2"></i>
                Suivi de colis
              </Link>
              <Link 
                href="/driver/register" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-motorcycle mr-2"></i>
                Devenir Livreur
              </Link>
              <div className="border-t border-mako-silver pt-2 mt-2">
                <button 
                  onClick={() => {
                    startOnboarding();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-mako-green hover:bg-mako-green hover:text-white rounded-md transition-colors"
                >
                  <i className="fas fa-question-circle mr-2"></i>
                  Guide d'utilisation
                </button>
                <button 
                  onClick={() => window.location.href = "/auth/login"}
                  className="block w-full text-left px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                >
                  <i className="fas fa-user mr-2"></i>
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
