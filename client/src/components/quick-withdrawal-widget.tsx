import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QuickWithdrawalWidgetProps {
  walletBalance: number;
  makoPayAccount?: string;
  className?: string;
}

export default function QuickWithdrawalWidget({
  walletBalance,
  makoPayAccount,
  className = ""
}: QuickWithdrawalWidgetProps) {
  const [quickAmount, setQuickAmount] = useState("");
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const quickAmounts = [1000, 2500, 5000, 10000];

  const withdrawalMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest("/api/drivers/quick-withdrawal", {
        method: "POST",
        body: JSON.stringify({
          amount: amount.toString(),
          makoPayAccount: makoPayAccount || "+223 70 12 34 56"
        }),
      });
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      toast({
        title: "Retrait instantané réussi",
        description: `${formatAmount(Number(quickAmount))} FCFA transféré vers MakoPay`,
        variant: "default",
      });
      setQuickAmount("");
      setShowCustomAmount(false);
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/wallet"] });
    },
    onError: () => {
      setIsProcessing(false);
      toast({
        title: "Erreur de retrait",
        description: "Impossible de traiter le retrait instantané",
        variant: "destructive",
      });
    },
  });

  const handleQuickWithdrawal = async (amount: number) => {
    if (amount > walletBalance) {
      toast({
        title: "Solde insuffisant",
        description: "Montant supérieur au solde disponible",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setQuickAmount(amount.toString());

    // Simulate MakoPay processing animation
    setTimeout(() => {
      withdrawalMutation.mutate(amount);
    }, 1500);
  };

  const handleCustomWithdrawal = () => {
    const amount = Number(quickAmount);
    if (amount < 1000) {
      toast({
        title: "Montant minimum",
        description: "Le montant minimum est de 1,000 FCFA",
        variant: "destructive",
      });
      return;
    }
    handleQuickWithdrawal(amount);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <Card className={`border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <i className="fas fa-bolt text-green-600"></i>
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Retrait Instantané</h3>
              <p className="text-sm text-green-600">Directement vers MakoPay</p>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800">
            <i className="fas fa-clock mr-1"></i>
            {isProcessing ? "En cours..." : "Instantané"}
          </Badge>
        </div>

        {isProcessing ? (
          <div className="text-center py-8">
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-coins text-green-600"></i>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-green-800">Transfert en cours</p>
                <p className="text-sm text-green-600">
                  {formatAmount(Number(quickAmount))} FCFA → MakoPay
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!showCustomAmount ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {quickAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      disabled={amount > walletBalance}
                      onClick={() => handleQuickWithdrawal(amount)}
                      className={`h-16 flex flex-col items-center justify-center border-green-200 hover:bg-green-50 ${
                        amount > walletBalance ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="text-lg font-bold text-green-700">
                        {formatAmount(amount)}
                      </span>
                      <span className="text-xs text-green-600">FCFA</span>
                      {amount > walletBalance && (
                        <span className="text-xs text-red-500">Insuffisant</span>
                      )}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setShowCustomAmount(true)}
                  className="w-full text-green-700 hover:bg-green-50"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Montant personnalisé
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Montant en FCFA"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    min="1000"
                    max={walletBalance}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCustomWithdrawal}
                    disabled={!quickAmount || Number(quickAmount) < 1000 || Number(quickAmount) > walletBalance}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </Button>
                </div>
                
                <div className="flex items-center justify-between text-xs text-green-600">
                  <span>Min: 1,000 FCFA</span>
                  <span>Max: {formatAmount(walletBalance)} FCFA</span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCustomAmount(false);
                    setQuickAmount("");
                  }}
                  className="w-full text-green-700"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Retour aux montants rapides
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">Frais de transfert:</span>
            <span className="font-semibold text-green-800">0 FCFA</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-green-700">Délai:</span>
            <span className="font-semibold text-green-800">Instantané</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}