import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLocation } from "wouter";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: string;
  targetRoute?: string;
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Bienvenue sur MAKOEXPRESS",
    description: "Découvrez la plateforme de livraison la plus fiable du Mali. Nous allons vous guider à travers les principales fonctionnalités.",
    icon: "fas fa-hand-wave",
  },
  {
    id: "services",
    title: "Nos Services de Livraison",
    description: "MAKOEXPRESS propose deux types de services : Express (livraison dans la journée) et Standard (24-48h dans tout le Mali).",
    icon: "fas fa-truck",
    highlight: "services",
  },
  {
    id: "express",
    title: "Livraison Express",
    description: "Pour vos urgences à Bamako : livraison en 1-6 heures avec priorité absolue.",
    icon: "fas fa-bolt",
    action: "Découvrir Express",
    targetRoute: "/delivery/express",
  },
  {
    id: "standard",
    title: "Livraison Standard",
    description: "Service économique pour tout le Mali : livraison fiable en 24-48h partout dans le pays.",
    icon: "fas fa-truck",
    action: "Découvrir Standard",
    targetRoute: "/delivery/standard",
  },
  {
    id: "tracking",
    title: "Suivi en Temps Réel",
    description: "Suivez votre colis en temps réel avec notre système de tracking avancé. Recevez des notifications à chaque étape.",
    icon: "fas fa-map-marker-alt",
    action: "Tester le Suivi",
    targetRoute: "/tracking",
  },
  {
    id: "driver",
    title: "Devenir Livreur",
    description: "Rejoignez notre équipe ! Générez des revenus flexibles jusqu'à 150k CFA/mois avec horaires libres.",
    icon: "fas fa-motorcycle",
    action: "Postuler",
    targetRoute: "/driver/register",
  },
  {
    id: "payment",
    title: "Paiements Sécurisés",
    description: "Payez facilement avec MAKOPAY (Mobile Money), espèces à la livraison ou virement bancaire.",
    icon: "fas fa-credit-card",
  },
  {
    id: "complete",
    title: "Prêt à Commencer !",
    description: "Vous connaissez maintenant toutes les fonctionnalités de MAKOEXPRESS. Commencez votre première livraison !",
    icon: "fas fa-check-circle",
    action: "Première Livraison",
    targetRoute: "/delivery",
  },
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingTutorial({ isOpen, onClose, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [, setLocation] = useLocation();

  const currentTutorialStep = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    if (currentTutorialStep.targetRoute) {
      setLocation(currentTutorialStep.targetRoute);
      onClose();
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-mako-green text-white">
              Étape {currentStep + 1} sur {tutorialSteps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Passer le tutoriel
            </Button>
          </div>
          <Progress value={progress} className="w-full mt-2" />
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-mako-green to-mako-jade rounded-full flex items-center justify-center mb-4">
              <i className={`${currentTutorialStep.icon} text-white text-3xl`}></i>
            </div>
            <CardTitle className="text-2xl text-mako-anthracite">
              {currentTutorialStep.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-mako-anthracite opacity-80 mb-6 leading-relaxed">
              {currentTutorialStep.description}
            </p>

            {/* Contenu spécifique selon l'étape */}
            {currentTutorialStep.id === "services" && (
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <i className="fas fa-bolt text-yellow-600 text-2xl mb-2"></i>
                  <h3 className="font-semibold text-mako-anthracite">Express</h3>
                  <p className="text-sm text-mako-anthracite opacity-70">1-6 heures à Bamako</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <i className="fas fa-truck text-mako-green text-2xl mb-2"></i>
                  <h3 className="font-semibold text-mako-anthracite">Standard</h3>
                  <p className="text-sm text-mako-anthracite opacity-70">24-48h dans tout le Mali</p>
                </div>
              </div>
            )}

            {currentTutorialStep.id === "express" && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <i className="fas fa-clock text-orange-600 text-xl mb-1"></i>
                    <div className="text-sm font-semibold">1-6 heures</div>
                  </div>
                  <div>
                    <i className="fas fa-map-marker-alt text-orange-600 text-xl mb-1"></i>
                    <div className="text-sm font-semibold">Bamako uniquement</div>
                  </div>
                  <div>
                    <i className="fas fa-bolt text-orange-600 text-xl mb-1"></i>
                    <div className="text-sm font-semibold">Priorité max</div>
                  </div>
                </div>
              </div>
            )}

            {currentTutorialStep.id === "standard" && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <i className="fas fa-clock text-mako-green text-xl mb-1"></i>
                    <div className="text-sm font-semibold">24-48 heures</div>
                  </div>
                  <div>
                    <i className="fas fa-map text-mako-green text-xl mb-1"></i>
                    <div className="text-sm font-semibold">Tout le Mali</div>
                  </div>
                  <div>
                    <i className="fas fa-tag text-mako-green text-xl mb-1"></i>
                    <div className="text-sm font-semibold">Économique</div>
                  </div>
                </div>
              </div>
            )}

            {currentTutorialStep.id === "driver" && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <i className="fas fa-money-bill-wave text-green-600 text-xl mb-1"></i>
                    <div className="text-sm font-semibold">Jusqu'à 150k CFA/mois</div>
                  </div>
                  <div>
                    <i className="fas fa-clock text-blue-600 text-xl mb-1"></i>
                    <div className="text-sm font-semibold">Horaires flexibles</div>
                  </div>
                </div>
              </div>
            )}

            {currentTutorialStep.id === "tracking" && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="text-center">
                    <i className="fas fa-box text-blue-600 text-lg mb-1"></i>
                    <div className="text-xs">Collecté</div>
                  </div>
                  <i className="fas fa-arrow-right text-blue-400"></i>
                  <div className="text-center">
                    <i className="fas fa-truck text-blue-600 text-lg mb-1"></i>
                    <div className="text-xs">En transit</div>
                  </div>
                  <i className="fas fa-arrow-right text-blue-400"></i>
                  <div className="text-center">
                    <i className="fas fa-check-circle text-green-600 text-lg mb-1"></i>
                    <div className="text-xs">Livré</div>
                  </div>
                </div>
              </div>
            )}

            {currentTutorialStep.id === "payment" && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-center">
                  <i className="fas fa-mobile-alt text-mako-green text-lg mb-1"></i>
                  <div className="text-xs font-semibold">MAKOPAY</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
                  <i className="fas fa-money-bill text-yellow-600 text-lg mb-1"></i>
                  <div className="text-xs font-semibold">Espèces</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
                  <i className="fas fa-university text-blue-600 text-lg mb-1"></i>
                  <div className="text-xs font-semibold">Virement</div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <i className="fas fa-arrow-left"></i>
                <span>Précédent</span>
              </Button>

              <div className="flex space-x-3">
                {currentTutorialStep.action && (
                  <Button
                    variant="outline"
                    onClick={handleAction}
                    className="border-mako-green text-mako-green hover:bg-mako-green hover:text-white"
                  >
                    <i className="fas fa-external-link-alt mr-2"></i>
                    {currentTutorialStep.action}
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-mako-green to-mako-jade hover:from-green-600 hover:to-teal-600 text-white flex items-center space-x-2"
                >
                  <span>
                    {currentStep === tutorialSteps.length - 1 ? "Terminer" : "Suivant"}
                  </span>
                  <i className="fas fa-arrow-right"></i>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}