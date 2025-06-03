import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";

export default function AdminHome() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête administrateur */}
        <section className="py-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                <i className="fas fa-crown text-white text-3xl"></i>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue, Administrateur
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Bonjour {user?.firstName || 'Admin'}, vous avez accès aux outils de gestion de MAKOEXPRESS
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <i className="fas fa-shield-alt mr-2"></i>
              Compte administrateur actif - Accès complet à la plateforme
            </div>
          </div>
        </section>

        {/* Actions principales pour administrateur */}
        <section className="py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tableau de Bord</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/admin">
              <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 transform hover:scale-105">
                <CardContent className="p-10 text-center">
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <i className="fas fa-cog text-white text-4xl"></i>
                  </div>
                  <h3 className="font-bold text-red-700 text-2xl mb-4">Panel d'Administration</h3>
                  <p className="text-red-600 text-lg mb-6">
                    Gérer les livreurs, valider les documents, suivre les commandes et analyser les statistiques
                  </p>
                  <div className="bg-red-100 rounded-full px-6 py-3 text-red-700 font-bold text-lg">
                    <i className="fas fa-arrow-right mr-2"></i>
                    Accéder au panel
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/customer-account">
              <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 transform hover:scale-105">
                <CardContent className="p-10 text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <i className="fas fa-user-circle text-white text-4xl"></i>
                  </div>
                  <h3 className="font-bold text-purple-700 text-2xl mb-4">Mon Profil Personnel</h3>
                  <p className="text-purple-600 text-lg mb-6">
                    Modifier vos informations personnelles, préférences de langue et paramètres de compte
                  </p>
                  <div className="bg-purple-100 rounded-full px-6 py-3 text-purple-700 font-bold text-lg">
                    <i className="fas fa-edit mr-2"></i>
                    Modifier le profil
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Statistiques rapides */}
        <section className="py-8 bg-white rounded-2xl shadow-lg mt-8">
          <div className="px-8 py-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Accès Rapide</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin" className="text-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-users text-white"></i>
                </div>
                <span className="text-sm font-medium text-gray-700">Livreurs</span>
              </Link>
              
              <Link href="/admin" className="text-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-box text-white"></i>
                </div>
                <span className="text-sm font-medium text-gray-700">Commandes</span>
              </Link>
              
              <Link href="/admin" className="text-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-chart-bar text-white"></i>
                </div>
                <span className="text-sm font-medium text-gray-700">Statistiques</span>
              </Link>
              
              <Link href="/admin" className="text-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                  <i className="fas fa-dollar-sign text-white"></i>
                </div>
                <span className="text-sm font-medium text-gray-700">Revenus</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}