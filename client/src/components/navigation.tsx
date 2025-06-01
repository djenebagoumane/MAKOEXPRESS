import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();

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
              <Link href="/" className="text-mako-gray hover:text-mako-green transition-colors">
                Accueil
              </Link>
              <Link href="/delivery" className="text-mako-gray hover:text-mako-green transition-colors">
                Livraison
              </Link>
              <Link href="/tracking" className="text-mako-gray hover:text-mako-green transition-colors">
                Suivi
              </Link>
              <Link href="/driver/register" className="text-mako-gray hover:text-mako-green transition-colors">
                Devenir Livreur
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="text-mako-gray hover:text-mako-green transition-colors">
                  Admin
                </Link>
              )}
            </nav>
          )}
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profil"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-mako-silver flex items-center justify-center">
                      <i className="fas fa-user text-mako-gray text-sm"></i>
                    </div>
                  )}
                  <span className="text-sm text-mako-dark">
                    {user?.firstName || 'Utilisateur'}
                  </span>
                </div>
                <Button 
                  onClick={() => window.location.href = "/api/logout"}
                  variant="outline"
                  size="sm"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="bg-mako-green text-white hover:bg-green-600"
              >
                <i className="fas fa-user mr-2"></i>
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
