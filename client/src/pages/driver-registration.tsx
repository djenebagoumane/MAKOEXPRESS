import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import DriverVerificationForm from "@/components/driver-verification-form";
import { useLocation } from "wouter";

export default function DriverRegistration() {
  const [currentStep, setCurrentStep] = useState('form');
  const [location, setLocation] = useLocation();

  // Check if user already has a driver profile
  const { data: driverProfile, isLoading } = useQuery({
    queryKey: ['/api/drivers/profile'],
    retry: false,
  });

  const handleStepComplete = (step: string, data: any) => {
    console.log(`Step ${step} completed:`, data);
    
    if (step === 'completed') {
      setCurrentStep('submitted');
    }
  };

  const getStatusInfo = () => {
    if (!driverProfile) return null;

    const status = driverProfile.status;
    const verificationStep = driverProfile.verificationStep;

    switch (status) {
      case 'incomplete':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: 'fa-clock',
          title: 'Profil incomplet',
          description: 'Veuillez compléter toutes les informations requises',
          canAccessDashboard: false
        };
      case 'pending':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: 'fa-hourglass-half',
          title: 'En attente de validation',
          description: 'Votre demande est en cours d\'examen par notre équipe',
          canAccessDashboard: false
        };
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: 'fa-check-circle',
          title: 'Profil approuvé',
          description: 'Félicitations ! Vous pouvez maintenant accéder à votre tableau de bord',
          canAccessDashboard: true
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: 'fa-times-circle',
          title: 'Demande refusée',
          description: driverProfile.rejectionReason || 'Votre demande a été refusée',
          canAccessDashboard: false
        };
      case 'suspended':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: 'fa-ban',
          title: 'Compte suspendu',
          description: 'Votre compte livreur a été temporairement suspendu',
          canAccessDashboard: false
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-mako-green mb-4"></i>
              <p className="text-gray-600">Vérification de votre statut...</p>
            </div>
          </div>
        </div>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              <i className="fas fa-motorcycle text-mako-green mr-3"></i>
              Devenir Livreur MakoExpress
            </h1>
            <p className="text-lg text-gray-600">
              Rejoignez notre équipe de livreurs et commencez à gagner de l'argent dès aujourd'hui
            </p>
          </div>

          {/* Existing Driver Status */}
          {statusInfo && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${statusInfo.color}`}>
                      <i className={`fas ${statusInfo.icon} text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{statusInfo.title}</h3>
                      <p className="text-gray-600">{statusInfo.description}</p>
                      {driverProfile?.createdAt && (
                        <p className="text-sm text-gray-500 mt-1">
                          Demande soumise le {new Date(driverProfile.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {statusInfo.canAccessDashboard && (
                    <Button 
                      onClick={() => setLocation('/driver-dashboard')}
                      className="bg-mako-green hover:bg-mako-green/90"
                    >
                      <i className="fas fa-tachometer-alt mr-2"></i>
                      Accéder au tableau de bord
                    </Button>
                  )}
                </div>

                {/* Required Information Missing Alert */}
                {statusInfo && !statusInfo.canAccessDashboard && driverProfile?.status !== 'rejected' && (
                  <Alert className="mt-4">
                    <i className="fas fa-info-circle"></i>
                    <AlertDescription>
                      <strong>Informations requises pour l'approbation :</strong>
                      <ul className="mt-2 space-y-1">
                        <li>✅ Informations personnelles complètes</li>
                        <li>{driverProfile?.locationVerified ? '✅' : '❌'} Vérification géolocalisation</li>
                        <li>{driverProfile?.selfiePhotoUrl ? '✅' : '❌'} Photo selfie</li>
                        <li>{driverProfile?.identityDocumentUrl ? '✅' : '❌'} Pièce d'identité</li>
                        <li>{driverProfile?.makoPayId ? '✅' : '❌'} Compte MakoPay</li>
                        <li>{driverProfile?.healthCertificateUrl ? '✅' : '❌'} Certificat de santé (optionnel)</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* New Registration or Update Form */}
          {(!statusInfo || statusInfo.title === 'Profil incomplet' || statusInfo.title === 'Demande refusée') && (
            <>
              {currentStep === 'form' && (
                <DriverVerificationForm 
                  onStepComplete={handleStepComplete}
                  initialData={driverProfile}
                />
              )}

              {currentStep === 'submitted' && (
                <Card className="text-center">
                  <CardContent className="p-8">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-check text-2xl text-green-600"></i>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Demande soumise avec succès !
                      </h2>
                      <p className="text-gray-600">
                        Votre demande de livreur a été soumise et sera examinée par notre équipe.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-blue-900 mb-2">Prochaines étapes :</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>📧 Vous recevrez un email de confirmation</li>
                        <li>🔍 Notre équipe vérifiera vos documents (24-48h)</li>
                        <li>✅ Validation manuelle par l'administrateur</li>
                        <li>🚀 Accès à votre tableau de bord livreur</li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <Button 
                        onClick={() => setLocation('/tracking')}
                        className="w-full"
                      >
                        <i className="fas fa-search mr-2"></i>
                        Suivre ma demande
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => setLocation('/')}
                        className="w-full"
                      >
                        <i className="fas fa-home mr-2"></i>
                        Retour à l'accueil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Benefits Section */}
          {!statusInfo && (
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-mako-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-money-bill-wave text-mako-green text-xl"></i>
                  </div>
                  <h3 className="font-semibold mb-2">Revenus attractifs</h3>
                  <p className="text-sm text-gray-600">
                    Gagnez jusqu'à 50,000 FCFA par mois avec des commissions compétitives
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-mako-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-clock text-mako-green text-xl"></i>
                  </div>
                  <h3 className="font-semibold mb-2">Horaires flexibles</h3>
                  <p className="text-sm text-gray-600">
                    Travaillez quand vous voulez, où vous voulez selon votre disponibilité
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-mako-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-wallet text-mako-green text-xl"></i>
                  </div>
                  <h3 className="font-semibold mb-2">Paiement rapide</h3>
                  <p className="text-sm text-gray-600">
                    Recevez vos gains directement sur MakoPay après chaque livraison
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Requirements Section */}
          {!statusInfo && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>
                  <i className="fas fa-list-check text-mako-green mr-2"></i>
                  Conditions requises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Documents obligatoires :</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Pièce d'identité valide (CNI, Passeport)
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Photo selfie claire
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Numéro WhatsApp actif
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Compte MakoPay pour les paiements
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Conditions d'éligibilité :</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Âge minimum 18 ans
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Résidence vérifiée par GPS
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Moyen de transport fiable
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        Déclaration de bonne santé
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}