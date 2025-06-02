import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'bonus' | 'commission';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  orderId?: string;
  fromUser?: string;
  toDestination?: string;
}

interface AnimatedWalletHistoryProps {
  transactions: Transaction[];
  className?: string;
}

export default function AnimatedWalletHistory({
  transactions,
  className = ""
}: AnimatedWalletHistoryProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [animatingTransactions, setAnimatingTransactions] = useState<Set<string>>(new Set());
  const [moneyFlow, setMoneyFlow] = useState<{ id: string; amount: number } | null>(null);

  useEffect(() => {
    // Simulate new transaction animation for recent transactions
    const recentTransactions = transactions.filter(t => 
      new Date(t.timestamp) > new Date(Date.now() - 10000) // Last 10 seconds
    );

    if (recentTransactions.length > 0) {
      recentTransactions.forEach(transaction => {
        setAnimatingTransactions(prev => new Set(prev).add(transaction.id));
        
        // Start money flow animation
        setMoneyFlow({ id: transaction.id, amount: transaction.amount });
        
        setTimeout(() => {
          setAnimatingTransactions(prev => {
            const newSet = new Set(prev);
            newSet.delete(transaction.id);
            return newSet;
          });
          setMoneyFlow(null);
        }, 3000);
      });
    }
  }, [transactions]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning': return 'fa-plus-circle';
      case 'withdrawal': return 'fa-minus-circle';
      case 'bonus': return 'fa-gift';
      case 'commission': return 'fa-percentage';
      default: return 'fa-exchange-alt';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning': return 'text-green-600';
      case 'withdrawal': return 'text-red-600';
      case 'bonus': return 'text-purple-600';
      case 'commission': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTransactionBg = (type: string) => {
    switch (type) {
      case 'earning': return 'bg-green-50 border-green-200';
      case 'withdrawal': return 'bg-red-50 border-red-200';
      case 'bonus': return 'bg-purple-50 border-purple-200';
      case 'commission': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Échoué</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Money Flow Animation Overlay */}
      {moneyFlow && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${(i - 2) * 20}px`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              >
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <i className="fas fa-coins text-yellow-800 text-sm"></i>
                </div>
              </div>
            ))}
            <div className="text-center mt-12 bg-white bg-opacity-90 rounded-lg p-4 shadow-lg animate-fade-in">
              <div className="text-2xl font-bold text-green-600">
                +{formatAmount(moneyFlow.amount)} FCFA
              </div>
              <p className="text-sm text-gray-600">Transaction traitée</p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Card className="border-2 border-mako-green shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <i className={`fas ${getTransactionIcon(selectedTransaction.type)} mr-2 ${getTransactionColor(selectedTransaction.type)}`}></i>
                Détails de la Transaction
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTransaction(null)}
              >
                <i className="fas fa-times"></i>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Visual Transaction Flow */}
              <div className="relative bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <i className="fas fa-user text-blue-600 text-xl"></i>
                    </div>
                    <p className="text-sm font-medium">
                      {selectedTransaction.fromUser || 'Client'}
                    </p>
                  </div>

                  <div className="flex-1 relative mx-8">
                    <div className="h-2 bg-gradient-to-r from-blue-300 to-green-300 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 animate-pulse"></div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-yellow-400 rounded-full p-2 animate-pulse">
                        <i className="fas fa-coins text-yellow-800"></i>
                      </div>
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white rounded-lg px-3 py-1 shadow-md border">
                        <span className="text-lg font-bold text-green-600">
                          {selectedTransaction.type === 'withdrawal' ? '-' : '+'}
                          {formatAmount(selectedTransaction.amount)} FCFA
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <i className="fas fa-wallet text-green-600 text-xl"></i>
                    </div>
                    <p className="text-sm font-medium">
                      {selectedTransaction.toDestination || 'Portefeuille'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transaction Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Montant</label>
                    <p className={`text-2xl font-bold ${getTransactionColor(selectedTransaction.type)}`}>
                      {selectedTransaction.type === 'withdrawal' ? '-' : '+'}
                      {formatAmount(selectedTransaction.amount)} FCFA
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <p className="font-medium capitalize">{selectedTransaction.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Statut</label>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date & Heure</label>
                    <p className="font-medium">
                      {new Date(selectedTransaction.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm">{selectedTransaction.description}</p>
                  </div>
                  {selectedTransaction.orderId && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Commande</label>
                      <p className="font-medium">#{selectedTransaction.orderId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-history mr-2 text-mako-green"></i>
            Historique des Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`relative overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                  animatingTransactions.has(transaction.id)
                    ? 'animate-pulse border-2 border-yellow-300 bg-yellow-50'
                    : getTransactionBg(transaction.type)
                } rounded-lg p-4 border`}
                onClick={() => setSelectedTransaction(transaction)}
              >
                {/* New Transaction Glow Effect */}
                {animatingTransactions.has(transaction.id) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-green-200 opacity-30 animate-pulse"></div>
                )}

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      animatingTransactions.has(transaction.id) 
                        ? 'bg-yellow-200 animate-bounce' 
                        : 'bg-white'
                    }`}>
                      <i className={`fas ${getTransactionIcon(transaction.type)} ${getTransactionColor(transaction.type)} text-lg`}></i>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">{transaction.description}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.timestamp).toLocaleString('fr-FR')}
                      </p>
                      {transaction.orderId && (
                        <p className="text-xs text-gray-500">Commande #{transaction.orderId}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xl font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'withdrawal' ? '-' : '+'}
                      {formatAmount(transaction.amount)} FCFA
                    </div>
                    <div className="mt-1">
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>

                {/* Money Trail Animation for New Transactions */}
                {animatingTransactions.has(transaction.id) && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-green-400 animate-pulse"></div>
                )}
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-inbox text-4xl mb-4"></i>
                <p>Aucune transaction trouvée</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        {['earning', 'withdrawal', 'bonus', 'commission'].map(type => {
          const typeTransactions = transactions.filter(t => t.type === type);
          const total = typeTransactions.reduce((sum, t) => sum + t.amount, 0);
          
          return (
            <Card key={type} className={getTransactionBg(type)}>
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-white`}>
                  <i className={`fas ${getTransactionIcon(type)} ${getTransactionColor(type)} text-xl`}></i>
                </div>
                <h4 className="font-semibold text-sm capitalize mb-1">{type}</h4>
                <p className={`text-lg font-bold ${getTransactionColor(type)}`}>
                  {formatAmount(total)} FCFA
                </p>
                <p className="text-xs text-gray-600">{typeTransactions.length} transactions</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}