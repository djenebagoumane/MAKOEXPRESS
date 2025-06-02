import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MakoPayPaymentWidgetProps {
  orderId: string;
  amount: number;
  customerPhone: string;
  driverId?: string;
  driverPhone?: string;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
  className?: string;
}

export default function MakoPayPaymentWidget({
  orderId,
  amount,
  customerPhone,
  driverId,
  driverPhone,
  onPaymentSuccess,
  onPaymentError,
  className
}: MakoPayPaymentWidgetProps) {
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { toast } = useToast();

  const paymentMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/payments/makopay", {
        method: "POST",
        body: JSON.stringify({
          orderId,
          amount,
          customerPhone,
          driverId,
          driverPhone
        }),
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Paiement initié",
        description: "Le paiement MakoPay a été traité avec succès",
      });
      
      if (result.payment?.transactionId) {
        setTransactionId(result.payment.transactionId);
      }
      
      onPaymentSuccess?.(result);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Erreur lors du paiement MakoPay";
      toast({
        title: "Erreur de paiement",
        description: errorMessage,
        variant: "destructive",
      });
      onPaymentError?.(errorMessage);
    },
  });

  const { data: transactionStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/payments/makopay", transactionId, "status"],
    enabled: !!transactionId,
    refetchInterval: 5000, // Check status every 5 seconds
  });

  const { data: makoPayBalance } = useQuery({
    queryKey: ["/api/payments/makopay/balance"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Échec</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-ML', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-mako-green rounded-lg flex items-center justify-center">
              <i className="fas fa-credit-card text-white text-sm"></i>
            </div>
            <span>Paiement MakoPay</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Commande:</span>
              <span className="font-medium">#{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Montant:</span>
              <span className="font-bold text-lg">{formatAmount(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Téléphone client:</span>
              <span className="font-medium">{customerPhone}</span>
            </div>
          </div>

          {/* Payment Status */}
          {transactionId && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Statut de la transaction:</span>
                {transactionStatus?.status && getStatusBadge(transactionStatus.status)}
              </div>
              
              <div className="text-xs text-gray-500">
                ID Transaction: {transactionId}
              </div>

              {transactionStatus?.status === 'pending' && (
                <Alert>
                  <i className="fas fa-clock"></i>
                  <AlertDescription>
                    Paiement en cours de traitement. Veuillez patienter...
                  </AlertDescription>
                </Alert>
              )}

              {transactionStatus?.status === 'completed' && (
                <Alert className="bg-green-50 border-green-200">
                  <i className="fas fa-check-circle text-green-600"></i>
                  <AlertDescription className="text-green-800">
                    Paiement terminé avec succès. Le livreur a été automatiquement payé.
                  </AlertDescription>
                </Alert>
              )}

              {transactionStatus?.status === 'failed' && (
                <Alert className="bg-red-50 border-red-200">
                  <i className="fas fa-exclamation-triangle text-red-600"></i>
                  <AlertDescription className="text-red-800">
                    Échec du paiement. Veuillez réessayer ou contacter le support.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Commission Breakdown */}
          {driverId && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-blue-800 mb-2">
                <i className="fas fa-chart-pie mr-2"></i>
                Répartition automatique
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Livreur ({driverPhone}):</span>
                  <span className="font-medium">{formatAmount(amount * 0.8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission MAKOEXPRESS:</span>
                  <span className="font-medium">{formatAmount(amount * 0.2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {!transactionId ? (
              <Button
                onClick={() => paymentMutation.mutate()}
                disabled={paymentMutation.isPending}
                className="flex-1 bg-mako-green hover:bg-mako-deep"
              >
                {paymentMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Traitement...
                  </>
                ) : (
                  <>
                    <i className="fas fa-mobile-alt mr-2"></i>
                    Payer avec MakoPay
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => refetchStatus()}
                variant="outline"
                className="flex-1"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Vérifier le statut
              </Button>
            )}
          </div>

          {/* MakoPay Balance (for admin) */}
          {makoPayBalance && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Solde MakoPay:</span>
                <span className="font-medium">
                  {formatAmount(makoPayBalance.balance || 0)}
                </span>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-3">
            <i className="fas fa-info-circle mr-1"></i>
            Le paiement sera traité via MakoPay. Une fois confirmé, le montant du livreur sera automatiquement transféré sur son compte MakoPay sans frais supplémentaires.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}