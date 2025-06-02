import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DriverTierUpgradeProps {
  className?: string;
}

export default function DriverTierUpgrade({ className }: DriverTierUpgradeProps) {
  const [selectedTier, setSelectedTier] = useState<"standard" | "premium">("standard");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: driverProfile, isLoading } = useQuery({
    queryKey: ["/api/drivers/profile"],
  });

  const { data: tierComparison } = useQuery({
    queryKey: ["/api/drivers/tier-comparison"],
  });

  const upgradeMutation = useMutation({
    mutationFn: async (tier: "standard" | "premium") => {
      return await apiRequest(`/api/drivers/upgrade-tier`, {
        method: "POST",
        body: JSON.stringify({ tier }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Demande de mise à niveau envoyée",
        description: "Votre demande de passage au niveau Premium a été soumise pour approbation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/profile"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || !driverProfile) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-32 bg-gray-300 rounded"></div>
      </div>
    );
  }

  const currentTier = driverProfile.equipmentTier || "standard";
  const canUpgrade = driverProfile.status === "approved" && 
                    driverProfile.driversLicenseUrl && 
                    driverProfile.vehicleRegistrationUrl &&
                    driverProfile.insuranceCertificateUrl &&
                    driverProfile.medicalCertificateUrl;

  const tiers = {
    standard: {
      name: "Standard",
      commission: "20%",
      priority: "Basse",
      payout: "24h",
      equipment: "Aucun",
      color: "bg-gray-100 text-gray-800",
      benefits: [
        "Accès aux commandes de base",
        "Paiement sous 24h",
        "Support client standard"
      ]
    },
    premium: {
      name: "Premium VIP",
      commission: "30%",
      priority: "Haute",
      payout: "Instantané",
      equipment: "Sac GPS + Assurance + Uniforme",
      color: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
      benefits: [
        "Commission de 30% (au lieu de 20%)",
        "Priorité absolue sur les commandes",
        "Paiement instantané via MakoPay",
        "Sac GPS et équipement fourni par MAKOEXPRESS",
        "Assurance professionnelle incluse",
        "Uniforme MAKOEXPRESS officiel",
        "Support VIP prioritaire 24/7",
        "Accès aux commandes premium exclusives",
        "Visibilité renforcée sur la carte",
        "Badge VIP visible par les clients"
      ]
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Niveaux de Livreurs MAKOEXPRESS
        </h2>
        <p className="text-gray-600">
          Choisissez votre niveau et maximisez vos revenus
        </p>
      </div>

      {/* Comparaison des niveaux */}
      <div className="grid md:grid-cols-2 gap-6">
        {(Object.keys(tiers) as Array<keyof typeof tiers>).map((tier) => {
          const tierInfo = tiers[tier];
          const isCurrentTier = currentTier === tier;
          const isPremium = tier === "premium";

          return (
            <Card 
              key={tier}
              className={`p-6 relative overflow-hidden transition-all hover:shadow-lg ${
                selectedTier === tier ? "ring-2 ring-mako-green" : ""
              } ${isCurrentTier ? "border-mako-green border-2" : ""}`}
            >
              {isPremium && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-400 to-yellow-600 text-white px-3 py-1 text-xs font-bold">
                  VIP
                </div>
              )}

              {isCurrentTier && (
                <div className="absolute top-0 left-0 bg-mako-green text-white px-3 py-1 text-xs font-bold">
                  ACTUEL
                </div>
              )}

              <div className="space-y-4">
                <div className="text-center">
                  <Badge className={tierInfo.color}>
                    {tierInfo.name}
                  </Badge>
                  <h3 className="text-xl font-bold mt-2">{tierInfo.commission}</h3>
                  <p className="text-sm text-gray-600">de commission par livraison</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Priorité:</span>
                    <p>{tierInfo.priority}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Paiement:</span>
                    <p>{tierInfo.payout}</p>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-sm">Équipement:</span>
                  <p className="text-sm text-gray-600">{tierInfo.equipment}</p>
                </div>

                <div>
                  <span className="font-semibold text-sm">Avantages:</span>
                  <ul className="text-xs space-y-1 mt-2">
                    {tierInfo.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fas fa-check text-green-500 mr-2 mt-0.5 text-xs"></i>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {!isCurrentTier && (
                  <Button
                    onClick={() => setSelectedTier(tier)}
                    variant={selectedTier === tier ? "default" : "outline"}
                    className="w-full"
                    disabled={isPremium && !canUpgrade}
                  >
                    {isPremium && !canUpgrade ? "Documents requis" : "Sélectionner"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Conditions pour Premium */}
      {selectedTier === "premium" && !canUpgrade && (
        <Alert>
          <i className="fas fa-info-circle"></i>
          <AlertDescription>
            <strong>Documents requis pour le niveau Premium :</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Permis de conduire valide</li>
              <li>• Carte grise du véhicule</li>
              <li>• Attestation d'assurance</li>
              <li>• Certificat médical d'aptitude</li>
            </ul>
            Veuillez compléter votre dossier dans la section "Vérification" pour accéder au niveau Premium.
          </AlertDescription>
        </Alert>
      )}

      {/* Exemple de calcul de revenus */}
      <Card className="p-6 bg-blue-50">
        <h3 className="font-bold text-lg mb-4">
          <i className="fas fa-calculator text-blue-600 mr-2"></i>
          Exemple de revenus mensuels
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold">Niveau Standard (20%)</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>30 livraisons × 2,000 FCFA</span>
                <span>60,000 FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Commission (20%)</span>
                <span className="text-red-600">-12,000 FCFA</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Vos revenus</span>
                <span className="text-green-600">48,000 FCFA</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-yellow-600">Niveau Premium VIP (30%)</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>30 livraisons × 2,000 FCFA</span>
                <span>60,000 FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Commission (30%)</span>
                <span className="text-red-600">-18,000 FCFA</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>Vos revenus</span>
                <span className="text-green-600">42,000 FCFA</span>
              </div>
              <div className="text-xs text-yellow-600 mt-2">
                + Équipement fourni + Assurance + Priorité
              </div>
            </div>
          </div>
        </div>
        
        <Alert className="mt-4 bg-yellow-50 border-yellow-200">
          <i className="fas fa-lightbulb text-yellow-600"></i>
          <AlertDescription className="text-yellow-800">
            <strong>Note :</strong> Bien que la commission Premium soit plus élevée, les avantages incluent 
            l'équipement gratuit, l'assurance, et la priorité sur les commandes qui peuvent augmenter 
            significativement votre volume de livraisons.
          </AlertDescription>
        </Alert>
      </Card>

      {/* Actions */}
      {selectedTier !== currentTier && canUpgrade && (
        <div className="flex justify-center">
          <Button
            onClick={() => upgradeMutation.mutate(selectedTier)}
            disabled={upgradeMutation.isPending}
            className="px-8 py-3"
          >
            {upgradeMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Envoi en cours...
              </>
            ) : (
              <>
                <i className="fas fa-arrow-up mr-2"></i>
                Demander la mise à niveau vers {tiers[selectedTier].name}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}