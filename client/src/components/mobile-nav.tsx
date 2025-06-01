import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function MobileNav() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      path: "/",
      icon: "fas fa-home",
      label: "Accueil",
      id: "home"
    },
    {
      path: "/delivery",
      icon: "fas fa-box",
      label: "Envoyer",
      id: "delivery"
    },
    {
      path: "/tracking",
      icon: "fas fa-map-marker-alt",
      label: "Suivre",
      id: "tracking"
    },
    {
      path: user?.role === 'admin' ? "/admin" : "/driver/dashboard",
      icon: user?.role === 'admin' ? "fas fa-cog" : "fas fa-user",
      label: user?.role === 'admin' ? "Admin" : "Profil",
      id: "profile"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-mako-silver md:hidden z-40">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center justify-center transition-colors ${
              location === item.path 
                ? "text-mako-green" 
                : "text-mako-gray hover:text-mako-green"
            }`}
          >
            <i className={`${item.icon} text-lg`}></i>
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
