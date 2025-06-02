import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CommissionData {
  orderId: string;
  totalAmount: number;
  adminCommission: number;
  driverPortion: number;
  date: string;
  customerName: string;
}

interface CommissionBreakdownChartProps {
  data: CommissionData[];
  className?: string;
}

export default function CommissionBreakdownChart({
  data,
  className = ""
}: CommissionBreakdownChartProps) {
  const [selectedOrder, setSelectedOrder] = useState<CommissionData | null>(null);
  const [animatedValues, setAnimatedValues] = useState<{ admin: number; driver: number }>({ admin: 0, driver: 0 });

  useEffect(() => {
    if (selectedOrder) {
      // Animate the breakdown visualization
      const animationDuration = 1500;
      const steps = 60;
      const adminIncrement = selectedOrder.adminCommission / steps;
      const driverIncrement = selectedOrder.driverPortion / steps;
      
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        setAnimatedValues({
          admin: Math.min(adminIncrement * currentStep, selectedOrder.adminCommission),
          driver: Math.min(driverIncrement * currentStep, selectedOrder.driverPortion)
        });
        
        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, animationDuration / steps);

      return () => clearInterval(interval);
    }
  }, [selectedOrder]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const calculatePercentage = (part: number, total: number) => {
    return ((part / total) * 100).toFixed(1);
  };

  const totalCommissions = data.reduce((sum, item) => sum + item.adminCommission, 0);
  const totalDriverEarnings = data.reduce((sum, item) => sum + item.driverPortion, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.totalAmount, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-coins text-green-600"></i>
              </div>
              <div>
                <p className="text-sm text-green-700">Commission Admin (20%)</p>
                <p className="text-xl font-bold text-green-800">{formatAmount(totalCommissions)} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-user-tie text-blue-600"></i>
              </div>
              <div>
                <p className="text-sm text-blue-700">Gains Livreurs (80%)</p>
                <p className="text-xl font-bold text-blue-800">{formatAmount(totalDriverEarnings)} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-chart-line text-purple-600"></i>
              </div>
              <div>
                <p className="text-sm text-purple-700">Revenus Total</p>
                <p className="text-xl font-bold text-purple-800">{formatAmount(totalRevenue)} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Breakdown Visualization */}
      {selectedOrder && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="fas fa-pie-chart mr-2 text-orange-600"></i>
                Détail Commission - Commande {selectedOrder.orderId}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                <i className="fas fa-times"></i>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Visual Breakdown */}
              <div className="relative">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatAmount(selectedOrder.totalAmount)} FCFA
                    </div>
                    <p className="text-sm text-gray-600">Montant Total</p>
                  </div>
                  <div className="flex-1 flex items-center">
                    <i className="fas fa-arrow-right text-gray-400 mx-4"></i>
                  </div>
                </div>

                {/* Animated Split Visualization */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Admin Commission */}
                  <div className="relative">
                    <div className="bg-green-100 rounded-lg p-6 border-2 border-green-200">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-crown text-white text-xl"></i>
                        </div>
                        <h3 className="font-semibold text-green-800">Commission Admin</h3>
                        <p className="text-sm text-green-600">Zeinab (20%)</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-green-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-green-500 h-full transition-all duration-1000 ease-out"
                            style={{ width: `${(animatedValues.admin / selectedOrder.adminCommission) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-800">
                            {formatAmount(Math.round(animatedValues.admin))} FCFA
                          </div>
                          <p className="text-sm text-green-600">
                            {calculatePercentage(selectedOrder.adminCommission, selectedOrder.totalAmount)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Portion */}
                  <div className="relative">
                    <div className="bg-blue-100 rounded-lg p-6 border-2 border-blue-200">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <i className="fas fa-motorcycle text-white text-xl"></i>
                        </div>
                        <h3 className="font-semibold text-blue-800">Gains Livreur</h3>
                        <p className="text-sm text-blue-600">Portion (80%)</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-blue-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full transition-all duration-1000 ease-out"
                            style={{ width: `${(animatedValues.driver / selectedOrder.driverPortion) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-800">
                            {formatAmount(Math.round(animatedValues.driver))} FCFA
                          </div>
                          <p className="text-sm text-blue-600">
                            {calculatePercentage(selectedOrder.driverPortion, selectedOrder.totalAmount)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Money Flow Animation */}
                <div className="mt-6 relative">
                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <i className="fas fa-user text-gray-600"></i>
                      </div>
                      <p className="text-sm text-gray-600">{selectedOrder.customerName}</p>
                    </div>
                    
                    <div className="flex-1 relative">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 animate-pulse"></div>
                      </div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                          <i className="fas fa-coins text-yellow-800 text-xs"></i>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-mako-green rounded-full flex items-center justify-center mb-2">
                        <i className="fas fa-building text-white"></i>
                      </div>
                      <p className="text-sm text-gray-600">MAKO Express</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Détails de la Transaction</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium">{new Date(selectedOrder.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Client:</span>
                      <span className="ml-2 font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Commande:</span>
                      <span className="ml-2 font-medium">#{selectedOrder.orderId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Statut:</span>
                      <Badge className="ml-2 bg-green-100 text-green-800">Payé</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-list mr-2 text-mako-green"></i>
            Historique des Commissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((order) => (
              <div
                key={order.orderId}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedOrder?.orderId === order.orderId 
                    ? 'border-orange-300 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-mako-green bg-opacity-10 rounded-full flex items-center justify-center">
                      <i className="fas fa-receipt text-mako-green"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold">Commande #{order.orderId}</h4>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="font-bold text-lg">{formatAmount(order.totalAmount)} FCFA</div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Admin: {formatAmount(order.adminCommission)}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Livreur: {formatAmount(order.driverPortion)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}