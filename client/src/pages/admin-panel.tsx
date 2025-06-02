import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";

export default function AdminPanel() {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get admin dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard"],
  });

  // Get pending withdrawals
  const { data: pendingWithdrawals } = useQuery({
    queryKey: ["/api/admin/withdrawals"],
  });

  const approveWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalId: number) => {
      return await apiRequest(`/api/admin/approve-withdrawal/${withdrawalId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      toast({
        title: "Retrait approuvé",
        description: "Le transfert MakoPay a été effectué avec succès",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le retrait",
        variant: "destructive",
      });
    },
  });

  const rejectWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, reason }: { withdrawalId: number; reason: string }) => {
      return await apiRequest(`/api/admin/reject-withdrawal/${withdrawalId}`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Retrait rejeté",
        description: "Le livreur sera informé de la décision",
        variant: "default",
      });
      setSelectedWithdrawal(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le retrait",
        variant: "destructive",
      });
    },
  });

  const formatAmount = (amount: string | number) => {
    return new Intl.NumberFormat('fr-FR').format(Number(amount));
  };

  const handleApprove = (withdrawalId: number) => {
    if (confirm("Confirmer l'approbation de ce retrait ?")) {
      approveWithdrawalMutation.mutate(withdrawalId);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Raison requise",
        description: "Veuillez indiquer la raison du rejet",
        variant: "destructive",
      });
      return;
    }

    rejectWithdrawalMutation.mutate({
      withdrawalId: selectedWithdrawal.id,
      reason: rejectionReason
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-mako-green mb-4"></i>
            <p className="text-gray-600">Chargement du panneau d'administration...</p>
          </div>
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Panneau d'Administration
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bienvenue Zeinab - Gérez MAKOEXPRESS et surveillez les revenus
          </p>
        </div>

        {/* Revenue Summary */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-green-800">
                <i className="fas fa-coins mr-2"></i>
                Commissions Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {formatAmount(dashboardData?.totalCommissions || 0)} FCFA
              </div>
              <p className="text-sm text-green-700">20% de chaque livraison</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-blue-800">
                <i className="fas fa-calendar-day mr-2"></i>
                Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {formatAmount(dashboardData?.todayCommissions || 0)} FCFA
              </div>
              <p className="text-sm text-blue-700">Commissions du jour</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-purple-800">
                <i className="fas fa-chart-line mr-2"></i>
                Croissance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                +{dashboardData?.monthlyGrowth || 0}%
              </div>
              <p className="text-sm text-purple-700">Ce mois-ci</p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-orange-800">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                En Attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {dashboardData?.pendingWithdrawals || 0}
              </div>
              <p className="text-sm text-orange-700">Retraits à traiter</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending Withdrawals */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-hand-holding-dollar mr-2 text-mako-green"></i>
                  Demandes de Retrait en Attente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingWithdrawals && pendingWithdrawals.length > 0 ? (
                  <div className="space-y-4">
                    {pendingWithdrawals.map((withdrawal: any) => (
                      <div
                        key={withdrawal.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {withdrawal.driverName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {withdrawal.driverPhone}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-mako-green">
                              {formatAmount(withdrawal.amount)} FCFA
                            </div>
                            <p className="text-xs text-gray-600">
                              Vers: {withdrawal.makoPayAccount}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-3">
                          Demandé le {new Date(withdrawal.requestDate).toLocaleString('fr-FR')}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(withdrawal.id)}
                            disabled={approveWithdrawalMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <i className="fas fa-check mr-1"></i>
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedWithdrawal(withdrawal)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <i className="fas fa-times mr-1"></i>
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-check-circle text-4xl text-green-400 mb-4"></i>
                    <p className="text-gray-600">Aucune demande en attente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistics and Top Drivers */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-chart-bar mr-2 text-mako-green"></i>
                  Statistiques Rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Commandes totales</span>
                  <span className="font-semibold">{dashboardData?.totalOrders || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Livreurs actifs</span>
                  <span className="font-semibold">{dashboardData?.activeDrivers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Chiffre d'affaires</span>
                  <span className="font-semibold">
                    {formatAmount(dashboardData?.totalRevenue || 0)} FCFA
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Top Drivers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-trophy mr-2 text-mako-green"></i>
                  Meilleurs Livreurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.topDrivers && dashboardData.topDrivers.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.topDrivers.map((driver: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' :
                            index === 1 ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{driver.name}</p>
                            <p className="text-xs text-gray-600">{driver.orders} livraisons</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            {formatAmount(driver.earnings)} FCFA
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">Aucune donnée disponible</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Rejection Modal */}
        {selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Rejeter la demande de retrait
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Livreur: <strong>{selectedWithdrawal.driverName}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Montant: <strong>{formatAmount(selectedWithdrawal.amount)} FCFA</strong>
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison du rejet *
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Expliquez pourquoi ce retrait est rejeté..."
                  className="w-full"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleReject}
                  disabled={rejectWithdrawalMutation.isPending || !rejectionReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {rejectWithdrawalMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Rejet...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times mr-2"></i>
                      Rejeter
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedWithdrawal(null);
                    setRejectionReason("");
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}