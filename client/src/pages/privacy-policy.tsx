import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function PrivacyPolicy() {
  const lastUpdated = "1er Juin 2025";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-mako-anthracite mb-4">
              <i className="fas fa-user-shield text-mako-green mr-3"></i>
              Politique de Confidentialité
            </h1>
            <p className="text-lg text-mako-anthracite opacity-80">
              Protection de vos données personnelles chez MAKOEXPRESS
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
                  1. Notre Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <p>
                    Chez MAKOEXPRESS, la protection de vos données personnelles est notre priorité. 
                    Cette politique explique comment nous collectons, utilisons et protégeons vos informations 
                    dans le respect de la législation malienne sur la protection des données.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-800">Notre promesse :</p>
                    <ul className="list-disc pl-6 text-green-700 mt-2">
                      <li>Transparence totale sur l'utilisation de vos données</li>
                      <li>Sécurité maximale de vos informations personnelles</li>
                      <li>Respect de vos droits et de votre vie privée</li>
                      <li>Utilisation des données uniquement pour améliorer nos services</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Données collectées */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-database mr-2"></i>
                  2. Données que Nous Collectons
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">2.1 Informations d'Identification</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Nom complet et prénom</li>
                    <li>Numéro de téléphone mobile</li>
                    <li>Adresse email</li>
                    <li>Date de naissance (pour les livreurs)</li>
                    <li>Pièce d'identité (pour la vérification des livreurs)</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">2.2 Informations de Livraison</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Adresses de collecte et de livraison</li>
                    <li>Instructions de livraison spéciales</li>
                    <li>Contacts de destinataires</li>
                    <li>Type et description des colis</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">2.3 Données de Géolocalisation</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-blue-700">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      Nous collectons votre position uniquement pendant les livraisons pour :
                    </p>
                    <ul className="list-disc pl-6 text-blue-700 mt-2">
                      <li>Optimiser les trajets de nos livreurs</li>
                      <li>Vous fournir un suivi en temps réel</li>
                      <li>Calculer avec précision les délais de livraison</li>
                    </ul>
                  </div>

                  <h3 className="font-semibold text-lg mt-6">2.4 Données de Paiement</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Méthode de paiement préférée</li>
                    <li>Historique des transactions (montants et dates)</li>
                    <li>Informations de facturation pour les entreprises</li>
                  </ul>
                  <p className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-700">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Nous ne stockons jamais vos codes PIN, mots de passe ou données bancaires complètes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Utilisation des données */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-cogs mr-2"></i>
                  3. Comment Nous Utilisons Vos Données
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">3.1 Services de Livraison</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Traitement et exécution de vos commandes</li>
                    <li>Attribution des livraisons aux livreurs</li>
                    <li>Suivi en temps réel de vos colis</li>
                    <li>Communication des mises à jour de statut</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">3.2 Amélioration des Services</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Analyse des performances de livraison</li>
                    <li>Optimisation des itinéraires</li>
                    <li>Développement de nouvelles fonctionnalités</li>
                    <li>Études de satisfaction client</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">3.3 Communication</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Notifications SMS pour le suivi des livraisons</li>
                    <li>Emails de confirmation et de facturation</li>
                    <li>Alertes de sécurité importantes</li>
                    <li>Enquêtes de satisfaction (optionnelles)</li>
                  </ul>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-800">
                      <i className="fas fa-check-circle mr-2"></i>
                      Nous n'utilisons JAMAIS vos données pour :
                    </p>
                    <ul className="list-disc pl-6 text-green-700 mt-2">
                      <li>Vendre à des tiers sans votre consentement</li>
                      <li>Spam publicitaire non sollicité</li>
                      <li>Profilage à des fins commerciales externes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partage des données */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-share-alt mr-2"></i>
                  4. Partage de Vos Données
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">4.1 Avec Nos Livreurs Partenaires</h3>
                  <p>
                    Nous partageons uniquement les informations nécessaires à la livraison :
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Nom du destinataire</li>
                    <li>Adresse de livraison</li>
                    <li>Numéro de téléphone pour contact</li>
                    <li>Instructions de livraison</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">4.2 Partenaires de Paiement</h3>
                  <p>
                    Pour les paiements MAKOPAY, nous travaillons avec :
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Orange Money Mali</li>
                    <li>Moov Money Mali</li>
                    <li>Malitel Money</li>
                    <li>Banques partenaires pour les virements</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">4.3 Autorités Légales</h3>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-red-700">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Nous pouvons divulguer vos données uniquement si requis par la loi malienne 
                      ou sur ordre d'un tribunal compétent.
                    </p>
                  </div>

                  <h3 className="font-semibold text-lg mt-6">4.4 Jamais de Vente</h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-800">
                      MAKOEXPRESS ne vend JAMAIS vos données personnelles à des tiers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sécurité */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-lock mr-2"></i>
                  5. Sécurité de Vos Données
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">5.1 Mesures Techniques</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Chiffrement SSL/TLS pour tous les échanges de données</li>
                    <li>Serveurs sécurisés avec accès restreint</li>
                    <li>Sauvegardes automatiques et chiffrées</li>
                    <li>Surveillance 24/7 contre les intrusions</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">5.2 Mesures Organisationnelles</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Accès aux données limité au personnel autorisé</li>
                    <li>Formation régulière du personnel sur la sécurité</li>
                    <li>Audits de sécurité trimestriels</li>
                    <li>Politique de mots de passe renforcée</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">5.3 Conservation des Données</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-blue-700">
                      <i className="fas fa-clock mr-2"></i>
                      Durées de conservation :
                    </p>
                    <ul className="list-disc pl-6 text-blue-700 mt-2">
                      <li>Données de livraison : 3 ans (obligations légales)</li>
                      <li>Données de géolocalisation : 30 jours maximum</li>
                      <li>Logs de sécurité : 1 an</li>
                      <li>Comptes inactifs : suppression après 2 ans</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Droits des utilisateurs */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-user-check mr-2"></i>
                  6. Vos Droits
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">6.1 Droit d'Accès</h3>
                  <p>
                    Vous pouvez demander une copie de toutes les données personnelles que nous détenons sur vous.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">6.2 Droit de Rectification</h3>
                  <p>
                    Vous pouvez corriger ou mettre à jour vos informations personnelles à tout moment 
                    via votre compte ou en nous contactant.
                  </p>

                  <h3 className="font-semibold text-lg mt-6">6.3 Droit de Suppression</h3>
                  <p>
                    Vous pouvez demander la suppression de vos données, sous réserve de nos obligations légales 
                    (facturation, comptabilité).
                  </p>

                  <h3 className="font-semibold text-lg mt-6">6.4 Droit d'Opposition</h3>
                  <p>
                    Vous pouvez vous opposer au traitement de vos données pour certains usages 
                    (marketing, analyses statistiques).
                  </p>

                  <h3 className="font-semibold text-lg mt-6">6.5 Portabilité des Données</h3>
                  <p>
                    Vous pouvez demander un export de vos données dans un format lisible et transférable.
                  </p>

                  <div className="bg-mako-green bg-opacity-10 p-4 rounded-lg border border-mako-green">
                    <p className="font-semibold text-mako-green">
                      <i className="fas fa-envelope mr-2"></i>
                      Pour exercer vos droits :
                    </p>
                    <ul className="list-disc pl-6 text-mako-anthracite mt-2">
                      <li>Email : privacy@makoexpress.ml</li>
                      <li>Téléphone : +223 XX XX XX XX</li>
                      <li>Courrier : ACI 2000, Bamako, Mali</li>
                      <li>Délai de réponse : 30 jours maximum</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-cookie-bite mr-2"></i>
                  7. Cookies et Technologies Similaires
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">7.1 Types de Cookies</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site</li>
                    <li><strong>Cookies de performance :</strong> Analyse de l'utilisation du site</li>
                    <li><strong>Cookies de préférence :</strong> Mémorisation de vos choix</li>
                  </ul>

                  <h3 className="font-semibold text-lg mt-6">7.2 Gestion des Cookies</h3>
                  <p>
                    Vous pouvez configurer votre navigateur pour accepter ou refuser les cookies. 
                    Cependant, refuser les cookies essentiels peut affecter le fonctionnement du site.
                  </p>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-yellow-700">
                      <i className="fas fa-info-circle mr-2"></i>
                      Les cookies de géolocalisation sont utilisés uniquement pendant les livraisons 
                      et sont automatiquement supprimés après 24 heures.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="shadow-lg border-2 border-mako-green">
              <CardHeader className="bg-gradient-to-r from-mako-green to-mako-jade text-white">
                <CardTitle className="text-xl">
                  <i className="fas fa-envelope mr-2"></i>
                  8. Contact et Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 text-mako-anthracite">
                  <h3 className="font-semibold text-lg">Délégué à la Protection des Données</h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <ul className="space-y-2 text-green-700">
                      <li><i className="fas fa-user mr-2"></i> <strong>Nom :</strong> Mme Aïssata KEITA</li>
                      <li><i className="fas fa-envelope mr-2"></i> <strong>Email :</strong> dpo@makoexpress.ml</li>
                      <li><i className="fas fa-phone mr-2"></i> <strong>Téléphone :</strong> +223 XX XX XX XX</li>
                      <li><i className="fas fa-map-marker-alt mr-2"></i> <strong>Adresse :</strong> MAKOEXPRESS, ACI 2000, Bamako</li>
                    </ul>
                  </div>

                  <h3 className="font-semibold text-lg mt-6">Autorité de Contrôle</h3>
                  <p>
                    Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir 
                    l'autorité malienne compétente en matière de protection des données.
                  </p>

                  <div className="text-center mt-6">
                    <p className="text-sm text-mako-anthracite opacity-70">
                      Cette politique de confidentialité peut être mise à jour. 
                      Nous vous informerons de tout changement important.
                    </p>
                    <p className="text-sm text-mako-anthracite opacity-70 mt-2">
                      Version en vigueur depuis le {lastUpdated}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}