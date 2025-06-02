import { Driver } from "@shared/schema";

export interface CommissionCalculation {
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  driverEarnings: number;
  adminEarnings: number;
  tier: "standard" | "premium";
  benefits: string[];
}

export function calculateCommission(driver: Driver, deliveryAmount: number): CommissionCalculation {
  let commissionRate = 0.20; // 20% par défaut
  let tier: "standard" | "premium" = "standard";
  const benefits: string[] = [];

  // Vérifier si le livreur est premium (équipé GPS + assurance)
  if (driver.hasGpsEquipment && driver.hasInsurance) {
    commissionRate = 0.30; // 30% pour premium
    tier = "premium";
    benefits.push("Sac GPS fourni");
    benefits.push("Assurance couverte");
    benefits.push("Priorité haute sur les commandes");
    benefits.push("Paiement instantané via MakoPay");
  }

  // Bonus supplémentaire pour l'uniforme
  if (driver.hasUniform) {
    benefits.push("Uniforme professionnel fourni");
  }

  const commissionAmount = deliveryAmount * commissionRate;
  const driverEarnings = deliveryAmount - commissionAmount;
  const adminEarnings = commissionAmount;

  return {
    baseAmount: deliveryAmount,
    commissionRate,
    commissionAmount,
    driverEarnings,
    adminEarnings,
    tier,
    benefits
  };
}

export function getEquipmentTierInfo(tier: "standard" | "premium") {
  const tiers = {
    standard: {
      name: "Standard",
      commission: "20%",
      priority: "Basse",
      payout: "24h",
      equipment: "Aucun",
      color: "gray",
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
      color: "gold",
      benefits: [
        "Priorité sur les commandes",
        "Paiement instantané via MakoPay",
        "Sac GPS et équipement fourni",
        "Assurance professionnelle incluse",
        "Uniforme MAKOEXPRESS",
        "Support VIP prioritaire",
        "Accès aux commandes premium",
        "Visibilité renforcée sur la carte"
      ]
    }
  };

  return tiers[tier];
}

export function canUpgradeToPremium(driver: Driver): boolean {
  // Le livreur peut passer premium s'il a été approuvé et a fourni tous les documents
  return (
    driver.status === "approved" &&
    !!driver.driversLicenseUrl &&
    !!driver.vehicleRegistrationUrl &&
    !!driver.insuranceCertificateUrl &&
    !!driver.medicalCertificateUrl
  );
}

export function calculateMakoPayTransfer(amount: number, isFreeTier: boolean = false): {
  transferAmount: number;
  fees: number;
  netAmount: number;
} {
  // Aucun frais pour les retraits MakoPay (puisque ça appartient à l'admin)
  if (isFreeTier) {
    return {
      transferAmount: amount,
      fees: 0,
      netAmount: amount
    };
  }

  // Frais pour les autres méthodes de paiement (Orange Money, banque)
  const feeRate = 0.02; // 2% de frais
  const fees = amount * feeRate;
  
  return {
    transferAmount: amount,
    fees,
    netAmount: amount - fees
  };
}