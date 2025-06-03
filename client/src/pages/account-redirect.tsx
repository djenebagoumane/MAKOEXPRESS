import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountRedirect() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/auth");
      return;
    }

    // Force redirect to customer account page
    setLocation("/customer-account");
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirection vers votre compte</h2>
          <p className="text-gray-600">Vous êtes redirigé vers votre espace client...</p>
        </CardContent>
      </Card>
    </div>
  );
}