import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import QuickWithdrawalWidget from "@/components/quick-withdrawal-widget";
import AnimatedWalletHistory from "@/components/animated-wallet-history";

const withdrawalSchema = z.object({
  amount: z.string().min(1, "Montant requis"),
  makoPayAccount: z.string().min(1, "Compte MakoPay requis"),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

export default function DriverWallet() {
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get driver wallet info
  const { data: walletData, isLoading } = useQuery({
    queryKey: ["/api/drivers/wallet"],
  });

  // Get transaction history
  const { data: transactions } = useQuery({
    queryKey: ["/api/drivers/transactions"],
  });

  // Get withdrawal requests
  const { data: withdrawalRequests } = useQuery({
    queryKey: ["/api/drivers/withdrawals"],
  });

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      makoPayAccount: "",
    },
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalFormData) => {
      return await apiRequest("/api/drivers/withdrawal-request", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Demande de retrait envoyée",
        description: "Votre demande sera traitée sous 24h",
        variant: "default",
      });
      setShowWithdrawalForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/withdrawals"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la demande de retrait",
        variant: "destructive",
      });
    },
  });

  const handleWithdrawal = (data: WithdrawalFormData) => {
    withdrawalMutation.mutate(data);
  };

  const formatAmount = (amount: string | number) => {
    return new Intl.NumberFormat('fr-FR').format(Number(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'failed':
        return 'Échoué';
      case 'rejected':
        return 'Rejeté';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-mako-green mb-4"></i>
            <p className="text-gray-600">Chargement de votre portefeuille...</p>
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
            Mon Portefeuille
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos gains et effectuez des retraits vers MakoPay
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Withdrawal Widget */}
          <div className="lg:col-span-1">
            <QuickWithdrawalWidget
              walletBalance={Number(walletData?.balance || 0)}
              makoPayAccount="+223 70 12 34 56"
              className="mb-6"
            />
          </div>

          {/* Wallet Summary */}
          <div className="lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Current Balance */}
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-green-800">
                    <i className="fas fa-wallet mr-2"></i>
                    Solde Disponible
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900 mb-2">
                    {formatAmount(walletData?.balance || 0)} FCFA
                  </div>
                  <Button
                    onClick={() => setShowWithdrawalForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!walletData?.balance || Number(walletData.balance) < 1000}
                  >
                    <i className="fas fa-download mr-2"></i>
                    Retrait Standard
                  </Button>
                  {Number(walletData?.balance || 0) < 1000 && (
                    <p className="text-xs text-green-700 mt-2">
                      Minimum 1,000 FCFA pour un retrait
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Total Earnings */}
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-blue-800">
                    <i className="fas fa-chart-line mr-2"></i>
                    Gains Totaux
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900 mb-2">
                    {formatAmount(walletData?.totalEarnings || 0)} FCFA
                  </div>
                  <p className="text-sm text-blue-700">
                    Depuis le début de votre activité
                  </p>
                </CardContent>
              </Card>

              {/* Total Withdrawn */}
              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-purple-800">
                    <i className="fas fa-money-bill-transfer mr-2"></i>
                    Montant Retiré
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900 mb-2">
                    {formatAmount(walletData?.totalWithdrawn || 0)} FCFA
                  </div>
                  <p className="text-sm text-purple-700">
                    Transféré vers MakoPay
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Withdrawal Form */}
          {showWithdrawalForm && (
            <div className="lg:col-span-3">
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-orange-800">
                    <div className="flex items-center">
                      <i className="fas fa-hand-holding-dollar mr-2"></i>
                      Demande de Retrait
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowWithdrawalForm(false)}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleWithdrawal)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Montant à retirer (FCFA)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Ex: 5000"
                                  min="1000"
                                  max={walletData?.balance || 0}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="makoPayAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compte MakoPay</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: +223 70 12 34 56"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-800 mb-2">
                          Information importante :
                        </h4>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Montant minimum : 1,000 FCFA</li>
                          <li>• Frais de transfert : 50 FCFA</li>
                          <li>• Délai de traitement : 24h maximum</li>
                          <li>• Vérifiez votre numéro MakoPay</li>
                        </ul>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={withdrawalMutation.isPending}
                      >
                        {withdrawalMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Traitement...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane mr-2"></i>
                            Envoyer la demande
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Withdrawal Requests */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-clock mr-2 text-mako-green"></i>
                  Demandes de Retrait
                </CardTitle>
              </CardHeader>
              <CardContent>
                {withdrawalRequests && withdrawalRequests.length > 0 ? (
                  <div className="space-y-4">
                    {withdrawalRequests.map((request: any) => (
                      <div
                        key={request.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">
                            {formatAmount(request.amount)} FCFA
                          </div>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusText(request.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Vers : {request.makoPayAccount}</p>
                          <p>Demandé le : {new Date(request.createdAt).toLocaleDateString('fr-FR')}</p>
                          {request.processedAt && (
                            <p>Traité le : {new Date(request.processedAt).toLocaleDateString('fr-FR')}</p>
                          )}
                          {request.rejectionReason && (
                            <p className="text-red-600">Raison : {request.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-600">Aucune demande de retrait</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Animated Wallet History */}
          <div className="lg:col-span-3">
            <AnimatedWalletHistory
              transactions={[
                {
                  id: "1",
                  type: "earning",
                  amount: 2500,
                  description: "Livraison Commande #ORD-001",
                  timestamp: new Date().toISOString(),
                  status: "completed",
                  orderId: "ORD-001",
                  fromUser: "Aminata Traoré",
                  toDestination: "Portefeuille"
                },
                {
                  id: "2",
                  type: "withdrawal",
                  amount: 5000,
                  description: "Retrait vers MakoPay",
                  timestamp: new Date(Date.now() - 86400000).toISOString(),
                  status: "completed",
                  toDestination: "+223 70 12 34 56"
                },
                {
                  id: "3",
                  type: "bonus",
                  amount: 1000,
                  description: "Badge Excellence débloqué",
                  timestamp: new Date(Date.now() - 172800000).toISOString(),
                  status: "completed"
                },
                {
                  id: "4",
                  type: "commission",
                  amount: 500,
                  description: "Commission Admin (20%)",
                  timestamp: new Date(Date.now() - 259200000).toISOString(),
                  status: "completed",
                  orderId: "ORD-002"
                }
              ]}
            />
          </div>

          {/* Recent Transactions - Simple List */}
          <div className="lg:col-span-1 hidden">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-history mr-2 text-mako-green"></i>
                  Transactions Récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            transaction.type === 'commission' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <i className={`fas ${
                              transaction.type === 'commission' ? 'fa-plus text-green-600' : 'fa-minus text-blue-600'
                            } text-sm`}></i>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {transaction.type === 'commission' ? 'Commission' : 'Retrait'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          transaction.type === 'commission' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {transaction.type === 'commission' ? '+' : '-'}
                          {formatAmount(transaction.driverPortion || transaction.amount)} FCFA
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <i className="fas fa-receipt text-3xl text-gray-400 mb-2"></i>
                    <p className="text-gray-600 text-sm">Aucune transaction</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}