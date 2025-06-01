import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: adminStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: user?.role === 'admin',
  });

  const { data: pendingDrivers } = useQuery({
    queryKey: ["/api/admin/drivers/pending"],
    enabled: user?.role === 'admin',
  });

  const updateDriverStatusMutation = useMutation({
    mutationFn: async ({ driverId, status }: { driverId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/drivers/${driverId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut du livreur a été mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/drivers/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous devez être connecté en tant qu'administrateur. Redirection...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du livreur",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-mako-green mb-4"></i>
          <p className="text-mako-gray">Chargement...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <i className="fas fa-lock text-4xl text-red-500 mb-4"></i>
            <h2 className="text-xl font-semibold text-mako-dark mb-2">Accès refusé</h2>
            <p className="text-mako-gray mb-4">
              Vous devez être administrateur pour accéder à cette page
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateDriverStatus = (driverId: number, status: string) => {
    updateDriverStatusMutation.mutate({ driverId, status });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-mako-dark mb-2">Panneau d'Administration</h1>
            <p className="text-mako-gray">Gérez les livreurs et surveillez les performances de la plateforme</p>
          </div>

          {/* Stats Cards */}
          {adminStats && (
            <div className="grid lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-mako-gray">Total Commandes</p>
                      <p className="text-3xl font-bold text-mako-dark">{adminStats.totalOrders}</p>
                    </div>
                    <i className="fas fa-box text-3xl text-blue-500"></i>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-mako-gray">Livreurs Actifs</p>
                      <p className="text-3xl font-bold text-mako-dark">{adminStats.activeDrivers}</p>
                    </div>
                    <i className="fas fa-motorcycle text-3xl text-mako-green"></i>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-mako-gray">En Attente</p>
                      <p className="text-3xl font-bold text-mako-dark">{adminStats.pendingOrders}</p>
                    </div>
                    <i className="fas fa-clock text-3xl text-yellow-500"></i>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-mako-gray">Livrées Aujourd'hui</p>
                      <p className="text-3xl font-bold text-mako-dark">{adminStats.completedToday}</p>
                    </div>
                    <i className="fas fa-check-circle text-3xl text-green-500"></i>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pending Drivers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-user-clock mr-2 text-mako-green"></i>
                Candidatures de Livreurs en Attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingDrivers && pendingDrivers.length > 0 ? (
                <div className="space-y-4">
                  {pendingDrivers.map((driver: any) => (
                    <div key={driver.id} className="border border-mako-silver rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {driver.profileImageUrl ? (
                            <img 
                              src={driver.profileImageUrl} 
                              alt="Photo de profil"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-mako-silver flex items-center justify-center">
                              <i className="fas fa-user text-mako-gray"></i>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-mako-dark">Candidat #{driver.id}</h3>
                            <p className="text-sm text-mako-gray">
                              Soumis le {new Date(driver.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          En attente
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-mako-gray">Âge:</span>
                          <p className="font-medium text-mako-dark">{driver.age} ans</p>
                        </div>
                        <div>
                          <span className="text-sm text-mako-gray">Véhicule:</span>
                          <p className="font-medium text-mako-dark capitalize">{driver.vehicleType}</p>
                        </div>
                        <div>
                          <span className="text-sm text-mako-gray">Photo:</span>
                          <p className="font-medium text-mako-dark">
                            {driver.profileImageUrl ? (
                              <a 
                                href={driver.profileImageUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-mako-green hover:underline"
                              >
                                Voir
                              </a>
                            ) : (
                              <span className="text-mako-gray">Non fournie</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-mako-gray">Pièce d'identité:</span>
                          <p className="font-medium text-mako-dark">
                            {driver.identityDocumentUrl ? (
                              <a 
                                href={driver.identityDocumentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-mako-green hover:underline"
                              >
                                Voir
                              </a>
                            ) : (
                              <span className="text-mako-gray">Non fournie</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleUpdateDriverStatus(driver.id, 'approved')}
                          disabled={updateDriverStatusMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <i className="fas fa-check mr-2"></i>
                          Approuver
                        </Button>
                        <Button
                          onClick={() => handleUpdateDriverStatus(driver.id, 'rejected')}
                          disabled={updateDriverStatusMutation.isPending}
                          variant="destructive"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-inbox text-4xl text-mako-silver mb-4"></i>
                  <h3 className="text-lg font-semibold text-mako-dark mb-2">Aucune candidature en attente</h3>
                  <p className="text-mako-gray">Toutes les candidatures ont été traitées</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}
