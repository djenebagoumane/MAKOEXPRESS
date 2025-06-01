import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useState } from "react";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-mako-silver fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-mako-green rounded-lg p-2">
              <i className="fas fa-truck text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-mako-dark">MAKOEXPRESS</h1>
          </Link>
          
          {isAuthenticated && (
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-mako-anthracite hover:text-mako-green transition-colors">
                Accueil
              </Link>
              <div className="relative group">
                <span className="text-mako-anthracite hover:text-mako-green transition-colors cursor-pointer">
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
              <Link href="/tracking" className="text-mako-anthracite hover:text-mako-green transition-colors">
                <i className="fas fa-search mr-1"></i>
                Suivi de Colis
              </Link>
              <Link href="/driver/register" className="text-mako-anthracite hover:text-mako-green transition-colors">
                <i className="fas fa-motorcycle mr-1"></i>
                Devenir Livreur
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-mako-anthracite hover:text-mako-green transition-colors">
                  <i className="fas fa-cog mr-1"></i>
                  Admin
                </Link>
              )}
            </nav>
          )}
          
          <div className="flex items-center space-x-4">
            {/* Menu hamburger mobile */}
            <button 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-mako-anthracite text-xl`}></i>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-mako-green flex items-center justify-center">
                    <i className="fas fa-user text-white text-sm"></i>
                  </div>
                  <span className="text-sm text-mako-anthracite">
                    Utilisateur
                  </span>
                </div>
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
              <Button 
                onClick={() => window.location.href = "/auth/login"}
                className="bg-mako-green text-white hover:bg-green-600"
              >
                <i className="fas fa-user mr-2"></i>
                Se connecter
              </Button>
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
                href="/driver/register" 
                className="block px-3 py-2 text-mako-anthracite hover:bg-mako-green hover:text-white rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fas fa-motorcycle mr-2"></i>
                Devenir Livreur
              </Link>
              <div className="border-t border-mako-silver pt-2 mt-2">
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
      </div>
    </header>
  );
}
