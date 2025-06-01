import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function TermsOfService() {
  const lastUpdated = "1er Juin 2025";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-mako-anthracite mb-4">
              <i className="fas fa-file-contract text-mako-green mr-3"></i>
              Conditions d'Utilisation
            </h1>
            <p className="text-lg text-mako-anthracite opacity-80">
              MAKOEXPRESS - Service de livraison au Mali
            </p>
            <p className="text-sm text-mako-anthracite opacity-60 mt-2">
              Dernière mise à jour : {lastUpdated}
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-mako-green to-mako-jade text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-info-circle mr-2"></i>
                  1. Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <p>
                    Bienvenue sur MAKOEXPRESS, le service de livraison de référence au Mali. En utilisant notre plateforme, 
                    vous acceptez les présentes conditions d'utilisation dans leur intégralité.
                  </p>
                  <p>
                    MAKOEXPRESS est exploité par MAKO SARL, société de droit malien immatriculée au Registre du Commerce 
                    et du Crédit Mobilier de Bamako sous le numéro MA-BKO-2024-B-XXXX.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-800">Important :</p>
                    <p className="text-blue-700">
                      Ces conditions s'appliquent à tous les utilisateurs : clients, livreurs et partenaires commerciaux.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-truck mr-2"></i>
                  2. Description des Services
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">2.1 Services de Livraison</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Livraison Express :</strong> Livraison dans la journée (1-6 heures) à Bamako</li>
                    <li><strong>Livraison Standard :</strong> Livraison en 24-48 heures dans tout le Mali</li>
                    <li><strong>Services spécialisés :</strong> Livraison de documents, nourriture, médicaments</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">2.2 Zones de Couverture</h3>
                  <p>
                    Nos services couvrent l'ensemble du territoire malien avec des délais variables selon la localisation. 
                    Les zones rurales peuvent nécessiter des délais supplémentaires.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">2.3 Limitations</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="font-semibold text-yellow-800">Articles interdits :</p>
                    <ul className="list-disc pl-6 text-yellow-700">
                      <li>Substances illégales ou dangereuses</li>
                      <li>Armes et munitions</li>
                      <li>Produits périssables sans emballage approprié</li>
                      <li>Liquides inflammables</li>
                      <li>Objets de valeur supérieure à 1 000 000 CFA sans assurance complémentaire</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tarifs et Paiement */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-credit-card mr-2"></i>
                  3. Tarifs et Paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">3.1 Structure Tarifaire</h3>
                  <p>
                    Les tarifs sont calculés en fonction du poids, de la distance, du type de service et de l'urgence. 
                    Tous les prix sont affichés en francs CFA et incluent les taxes applicables.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">3.2 Moyens de Paiement</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>MAKOPAY (Mobile Money) - Orange Money, Moov Money, Malitel Money</li>
                    <li>Espèces à la livraison (supplément de 500 CFA)</li>
                    <li>Virement bancaire pour les entreprises</li>
                    <li>Crédit pour les clients professionnels agréés</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">3.3 Politique de Remboursement</h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <ul className="list-disc pl-6 text-green-700">
                      <li>Remboursement intégral si livraison impossible par notre faute</li>
                      <li>Remboursement partiel en cas de retard de plus de 24h sur les délais annoncés</li>
                      <li>Frais de dédommagement en cas de perte ou dommage du colis</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Responsabilités */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-shield-alt mr-2"></i>
                  4. Responsabilités et Garanties
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">4.1 Responsabilité de MAKOEXPRESS</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Livraison sécurisée dans les délais annoncés</li>
                    <li>Protection des données clients selon la réglementation malienne</li>
                    <li>Assurance automatique jusqu'à 100 000 CFA par colis</li>
                    <li>Service client 7j/7</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">4.2 Responsabilité du Client</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Exactitude des informations fournies</li>
                    <li>Emballage approprié des articles fragiles</li>
                    <li>Respect des articles autorisés</li>
                    <li>Paiement dans les délais convenus</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">4.3 Limitations de Responsabilité</h3>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-red-700">
                      Notre responsabilité est limitée au montant payé pour le service de livraison, 
                      sauf souscription d'une assurance complémentaire pour les objets de valeur.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Livreurs Partenaires */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-motorcycle mr-2"></i>
                  5. Livreurs Partenaires
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">5.1 Statut des Livreurs</h3>
                  <p>
                    Les livreurs MAKOEXPRESS sont des partenaires indépendants soumis à un processus de sélection rigoureux 
                    incluant vérification des documents, formation obligatoire et évaluation continue.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">5.2 Obligations des Livreurs</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Respect du code de la route malien</li>
                    <li>Port des équipements de sécurité obligatoires</li>
                    <li>Professionnalisme et courtoisie envers les clients</li>
                    <li>Respect des horaires et délais de livraison</li>
                    <li>Signalement immédiat de tout incident</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">5.3 Rémunération</h3>
                  <p>
                    La rémunération des livreurs est basée sur le nombre de livraisons effectuées, 
                    avec des bonus de performance et de ponctualité.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Protection des Données */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-user-shield mr-2"></i>
                  6. Protection des Données
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <p>
                    MAKOEXPRESS s'engage à protéger vos données personnelles conformément à la 
                    législation malienne sur la protection des données.
                  </p>
                  
                  <h3 className="font-semibold text-lg">6.1 Données Collectées</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Informations d'identification (nom, téléphone, email)</li>
                    <li>Adresses de collecte et de livraison</li>
                    <li>Historique des commandes</li>
                    <li>Données de géolocalisation pour le suivi</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">6.2 Utilisation des Données</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Traitement et suivi des commandes</li>
                    <li>Amélioration de nos services</li>
                    <li>Communication relative aux livraisons</li>
                    <li>Facturation et comptabilité</li>
                  </ul>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-semibold text-blue-800">Vos droits :</p>
                    <p className="text-blue-700">
                      Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. 
                      Contactez-nous à privacy@makoexpress.ml pour exercer ces droits.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modification et Résiliation */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-800 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-edit mr-2"></i>
                  7. Modification et Résiliation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">7.1 Modification des Conditions</h3>
                  <p>
                    MAKOEXPRESS se réserve le droit de modifier ces conditions à tout moment. 
                    Les utilisateurs seront informés par email et notification sur l'application.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">7.2 Suspension de Compte</h3>
                  <p>
                    Nous nous réservons le droit de suspendre ou fermer un compte en cas de :
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Non-respect répété des conditions d'utilisation</li>
                    <li>Tentative de fraude ou d'utilisation abusive</li>
                    <li>Impayés récurrents</li>
                    <li>Comportement inapproprié envers les livreurs</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">7.3 Résiliation par l'Utilisateur</h3>
                  <p>
                    L'utilisateur peut fermer son compte à tout moment en contactant le service client. 
                    Les commandes en cours seront honorées selon les conditions initiales.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Droit Applicable */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-mako-green to-mako-jade text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-gavel mr-2"></i>
                  8. Droit Applicable et Règlement des Litiges
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">8.1 Droit Applicable</h3>
                  <p>
                    Les présentes conditions sont régies par le droit malien. Tout litige sera soumis 
                    à la compétence exclusive des tribunaux de Bamako, Mali.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">8.2 Règlement Amiable</h3>
                  <p>
                    En cas de litige, nous privilégions le règlement amiable. Contactez notre service 
                    client pour une résolution rapide et équitable.
                  </p>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-800">Contact Juridique :</p>
                    <p className="text-green-700">
                      Pour toute question juridique : legal@makoexpress.ml<br/>
                      Téléphone : +223 XX XX XX XX<br/>
                      Adresse : ACI 2000, Bamako, Mali
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acceptation */}
            <Card className="shadow-lg border-2 border-mako-green">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-bold text-mako-anthracite mb-4">
                  <i className="fas fa-check-circle text-mako-green mr-2"></i>
                  Acceptation des Conditions
                </h2>
                <p className="text-mako-anthracite mb-4">
                  En utilisant les services MAKOEXPRESS, vous déclarez avoir lu, compris et accepté 
                  l'intégralité de ces conditions d'utilisation.
                </p>
                <p className="text-sm text-mako-anthracite opacity-70">
                  Version en vigueur depuis le {lastUpdated}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}