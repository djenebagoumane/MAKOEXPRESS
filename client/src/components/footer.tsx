import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-mako-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-mako-green rounded-lg p-2">
                <i className="fas fa-truck text-white text-xl"></i>
              </div>
              <h4 className="text-xl font-bold">MAKOEXPRESS</h4>
            </div>
            <p className="text-gray-400 mb-4">
              Service de livraison rapide et fiable à travers le Mali. 
              Connecté à l'écosystème MAKO pour une expérience complète.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Services</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/delivery" className="hover:text-white transition-colors">
                  Livraison Express
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-white transition-colors">
                  Livraison Standard
                </Link>
              </li>
              <li>
                <Link href="/driver/register" className="hover:text-white transition-colors">
                  Devenir Livreur
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="hover:text-white transition-colors">
                  Suivi de Colis
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Support</h5>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Centre d'Aide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Conditions d'Utilisation
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold mb-4">Contact</h5>
            <div className="space-y-2 text-gray-400">
              <p>
                <i className="fas fa-phone mr-2"></i>
                +223 75700265
              </p>
              <p>
                <i className="fas fa-envelope mr-2"></i>
                contact@makoexpress.com
              </p>
              <p>
                <i className="fas fa-map-marker-alt mr-2"></i>
                Bamako, Mali
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2025 MAKOEXPRESS. Tous droits réservés. Propulsé par l'écosystème MAKO.</p>
        </div>
      </div>
    </footer>
  );
}
