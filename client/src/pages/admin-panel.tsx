import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  AlertTriangle, 
  ArrowLeft,
  Eye,
  Download,
  Clock
} from "lucide-react";

interface Driver {
  id: number;
  fullName: string;
  identityNumber: string;
  identityType: string;
  phone: string;
  vehicleType: string;
  vehicleRegistration: string;
  driversLicense: string;
  status: string;
  submissionDate: string;
  selfiePhotoUrl?: string;
  identityDocumentUrl?: string;
  healthCertificateUrl?: string;
  locationVerified: boolean;
  tier: string;
  totalDeliveries: number;
  averageRating: number;
  monthlyEarnings: number;
}

interface AdminStats {
  totalOrders: number;
  activeDrivers: number;
  pendingDrivers: number;
  completedToday: number;
  totalRevenue: number;
  monthlyCommission: number;
}

export default function AdminPanel() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();

  // Fetch admin dashboard data
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false
  });

  // Fetch pending drivers
  const { data: pendingDrivers, isLoading: driversLoading } = useQuery({
    queryKey: ["/api/admin/pending-drivers"],
    retry: false
  });

  // Fetch commission data
  const { data: commissionData, isLoading: commissionLoading } = useQuery({
    queryKey: ["/api/admin/commissions"],
    retry: false
  });

  // Approve driver mutation
  const approveDriverMutation = useMutation({
    mutationFn: async (driverId: number) => {
      const res = await apiRequest("POST", `/api/admin/approve-driver/${driverId}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Livreur approuvé",
        description: "Le livreur a été approuvé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-drivers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject driver mutation
  const rejectDriverMutation = useMutation({
    mutationFn: async ({ driverId, reason }: { driverId: number; reason: string }) => {
      const res = await apiRequest("POST", `/api/admin/reject-driver/${driverId}`, { reason });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Livreur refusé",
        description: "Le livreur a été refusé avec raison fournie",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-drivers"] });
      setSelectedDriver(null);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approuvé</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Refusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Panneau d'Administration</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Administrateur
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Commandes totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : adminStats?.totalOrders || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Livreurs actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : adminStats?.activeDrivers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : adminStats?.pendingDrivers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Commission mensuelle</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : formatCurrency(adminStats?.monthlyCommission || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="drivers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="drivers">Gestion des Livreurs</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>

          {/* Drivers Management Tab */}
          <TabsContent value="drivers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Livreurs en attente d'approbation</CardTitle>
              </CardHeader>
              <CardContent>
                {driversLoading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : pendingDrivers?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun livreur en attente d'approbation
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom complet</TableHead>
                          <TableHead>Téléphone</TableHead>
                          <TableHead>Type de véhicule</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Date de soumission</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingDrivers?.map((driver: Driver) => (
                          <TableRow key={driver.id}>
                            <TableCell className="font-medium">{driver.fullName}</TableCell>
                            <TableCell>{driver.phone}</TableCell>
                            <TableCell>{driver.vehicleType}</TableCell>
                            <TableCell>{getStatusBadge(driver.status)}</TableCell>
                            <TableCell>
                              {new Date(driver.submissionDate).toLocaleDateString('fr-FR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedDriver(driver)}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Voir
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Détails du livreur - {selectedDriver?.fullName}</DialogTitle>
                                      <DialogDescription>
                                        Vérifiez les informations et documents soumis
                                      </DialogDescription>
                                    </DialogHeader>
                                    
                                    {selectedDriver && (
                                      <div className="space-y-6">
                                        {/* Personal Information */}
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Nom complet</label>
                                            <p className="text-sm text-gray-900">{selectedDriver.fullName}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Téléphone</label>
                                            <p className="text-sm text-gray-900">{selectedDriver.phone}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Numéro d'identité</label>
                                            <p className="text-sm text-gray-900">{selectedDriver.identityNumber}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Type d'identité</label>
                                            <p className="text-sm text-gray-900">{selectedDriver.identityType}</p>
                                          </div>
                                        </div>

                                        {/* Vehicle Information */}
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Type de véhicule</label>
                                            <p className="text-sm text-gray-900">{selectedDriver.vehicleType}</p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-600">Immatriculation</label>
                                            <p className="text-sm text-gray-900">{selectedDriver.vehicleRegistration}</p>
                                          </div>
                                        </div>

                                        {/* Documents */}
                                        <div className="space-y-3">
                                          <h4 className="font-medium text-gray-900">Documents soumis</h4>
                                          <div className="grid grid-cols-1 gap-2">
                                            {selectedDriver.selfiePhotoUrl && (
                                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm">Photo selfie</span>
                                                <Button variant="outline" size="sm">
                                                  <Download className="w-4 h-4 mr-1" />
                                                  Télécharger
                                                </Button>
                                              </div>
                                            )}
                                            {selectedDriver.identityDocumentUrl && (
                                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm">Document d'identité</span>
                                                <Button variant="outline" size="sm">
                                                  <Download className="w-4 h-4 mr-1" />
                                                  Télécharger
                                                </Button>
                                              </div>
                                            )}
                                            {selectedDriver.healthCertificateUrl && (
                                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="text-sm">Certificat médical</span>
                                                <Button variant="outline" size="sm">
                                                  <Download className="w-4 h-4 mr-1" />
                                                  Télécharger
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-4 pt-4">
                                          <Button
                                            onClick={() => approveDriverMutation.mutate(selectedDriver.id)}
                                            disabled={approveDriverMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approuver
                                          </Button>
                                          
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button variant="destructive">
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Refuser
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                              <DialogHeader>
                                                <DialogTitle>Refuser le livreur</DialogTitle>
                                                <DialogDescription>
                                                  Veuillez fournir une raison pour le refus
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="space-y-4">
                                                <Textarea
                                                  placeholder="Raison du refus..."
                                                  value={rejectionReason}
                                                  onChange={(e) => setRejectionReason(e.target.value)}
                                                />
                                                <div className="flex space-x-2">
                                                  <Button
                                                    onClick={() => rejectDriverMutation.mutate({ 
                                                      driverId: selectedDriver.id, 
                                                      reason: rejectionReason 
                                                    })}
                                                    disabled={rejectDriverMutation.isPending || !rejectionReason.trim()}
                                                    variant="destructive"
                                                  >
                                                    Confirmer le refus
                                                  </Button>
                                                </div>
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commissions Tab */}
          <TabsContent value="commissions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenus ce mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Commissions totales</span>
                      <span className="font-semibold">
                        {formatCurrency(adminStats?.monthlyCommission || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Revenus bruts</span>
                      <span className="font-semibold">
                        {formatCurrency(adminStats?.totalRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Commandes complétées</span>
                      <span className="font-semibold">{adminStats?.completedToday || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistiques des commissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux de commission standard</span>
                      <span className="font-semibold">20%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux de commission premium</span>
                      <span className="font-semibold">30%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Commande moyenne</span>
                      <span className="font-semibold">
                        {formatCurrency((adminStats?.totalRevenue || 0) / Math.max(adminStats?.totalOrders || 1, 1))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commission breakdown chart placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Graphique des commissions (à venir)
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}