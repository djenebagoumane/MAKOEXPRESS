import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { Link } from "wouter";

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "Livraison",
      questions: [
        {
          question: "Quels sont les délais de livraison ?",
          answer: "Livraison Express : 1-6 heures à Bamako. Livraison Standard : 24-48 heures dans tout le Mali. Les délais peuvent varier selon la météo et les conditions routières."
        },
        {
          question: "Comment suivre mon colis ?",
          answer: "Utilisez votre numéro de suivi sur notre page de tracking ou recevez des SMS automatiques à chaque étape de la livraison."
        },
        {
          question: "Que faire si mon colis est endommagé ?",
          answer: "Contactez-nous immédiatement via WhatsApp au +223 XX XX XX XX avec des photos. Nous gérons tous les dommages sous 24h."
        },
        {
          question: "Puis-je modifier l'adresse de livraison ?",
          answer: "Oui, jusqu'à ce que le livreur ait collecté le colis. Contactez le service client rapidement pour modifier l'adresse."
        }
      ]
    },
    {
      category: "Paiement",
      questions: [
        {
          question: "Quels moyens de paiement acceptez-vous ?",
          answer: "MAKOPAY (Mobile Money), espèces à la livraison, virement bancaire, et crédit pour les clients professionnels."
        },
        {
          question: "Comment fonctionne MAKOPAY ?",
          answer: "MAKOPAY utilise Orange Money, Moov Money et Malitel Money. Payez directement depuis votre téléphone en toute sécurité."
        },
        {
          question: "Puis-je payer à la livraison ?",
          answer: "Oui, le paiement en espèces à la livraison est disponible pour tous nos services avec un léger supplément."
        }
      ]
    },
    {
      category: "Livreurs",
      questions: [
        {
          question: "Comment devenir livreur MAKOEXPRESS ?",
          answer: "Remplissez le formulaire en ligne, passez l'entretien téléphonique, suivez la formation gratuite d'une journée, puis commencez à livrer."
        },
        {
          question: "Combien gagne un livreur ?",
          answer: "Entre 50k et 150k CFA par mois selon les heures travaillées. Plus des bonus de performance mensuels."
        },
        {
          question: "Dois-je avoir mon propre véhicule ?",
          answer: "Oui, vous devez posséder une moto, scooter, voiture ou vélo avec permis et assurance valides."
        }
      ]
    },
    {
      category: "Compte",
      questions: [
        {
          question: "Comment créer un compte ?",
          answer: "Cliquez sur 'Se connecter' puis 'Créer un compte'. Renseignez votre téléphone et email pour commencer."
        },
        {
          question: "J'ai oublié mon mot de passe",
          answer: "Cliquez sur 'Mot de passe oublié' sur la page de connexion. Vous recevrez un SMS avec les instructions."
        },
        {
          question: "Comment modifier mes informations ?",
          answer: "Connectez-vous à votre compte et allez dans 'Mon profil' pour modifier vos informations personnelles."
        }
      ]
    }
  ];

  const quickActions = [
    {
      title: "Suivi de colis",
      description: "Suivez votre livraison en temps réel",
      icon: "fas fa-map-marker-alt",
      link: "/tracking",
      color: "bg-blue-500"
    },
    {
      title: "Nouvelle livraison",
      description: "Créer une demande de livraison",
      icon: "fas fa-plus-circle",
      link: "/delivery",
      color: "bg-green-500"
    },
    {
      title: "Contacter le support",
      description: "Parler à notre équipe",
      icon: "fas fa-headset",
      link: "/contact",
      color: "bg-purple-500"
    },
    {
      title: "Devenir livreur",
      description: "Rejoindre notre équipe",
      icon: "fas fa-motorcycle",
      link: "/driver/register",
      color: "bg-orange-500"
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-mako-anthracite mb-4">
              <i className="fas fa-question-circle text-mako-green mr-3"></i>
              Centre d'Aide MAKOEXPRESS
            </h1>
            <p className="text-xl text-mako-anthracite opacity-80 mb-8">
              Trouvez rapidement les réponses à vos questions
            </p>
            
            {/* Barre de recherche */}
            <div className="max-w-md mx-auto relative">
              <Input
                placeholder="Rechercher dans l'aide..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg"
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-mako-anthracite opacity-50"></i>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-mako-anthracite mb-6 text-center">
              Actions Rapides
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link href={action.link} key={index}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <i className={`${action.icon} text-white text-2xl`}></i>
                      </div>
                      <h3 className="font-semibold text-mako-anthracite mb-2">{action.title}</h3>
                      <p className="text-sm text-mako-anthracite opacity-70">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredFaqs.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-mako-green to-mako-jade text-white">
                  <CardTitle className="text-xl">
                    <i className="fas fa-folder mr-2"></i>
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left text-mako-anthracite hover:text-mako-green">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-mako-anthracite opacity-80 leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {searchTerm && filteredFaqs.length === 0 && (
            <div className="text-center mt-12">
              <i className="fas fa-search text-6xl text-mako-anthracite opacity-30 mb-4"></i>
              <h3 className="text-xl font-semibold text-mako-anthracite mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-mako-anthracite opacity-70 mb-6">
                Essayez d'autres mots-clés ou contactez notre support
              </p>
              <Link href="/contact">
                <Button className="bg-mako-green text-white hover:bg-green-600">
                  <i className="fas fa-headset mr-2"></i>
                  Contacter le Support
                </Button>
              </Link>
            </div>
          )}

          {/* Support supplémentaire */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-mako-anthracite mb-4">
                  <i className="fas fa-headset text-blue-600 mr-2"></i>
                  Besoin d'aide supplémentaire ?
                </h2>
                <p className="text-lg text-mako-anthracite opacity-80 mb-6">
                  Notre équipe support est disponible 7j/7 pour vous aider
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <i className="fas fa-phone text-green-600 text-2xl mb-2"></i>
                    <div className="font-semibold">Téléphone</div>
                    <div className="text-sm opacity-70">+223 XX XX XX XX</div>
                  </div>
                  <div className="text-center">
                    <i className="fab fa-whatsapp text-green-600 text-2xl mb-2"></i>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-sm opacity-70">Réponse en 5 min</div>
                  </div>
                  <div className="text-center">
                    <i className="fas fa-envelope text-blue-600 text-2xl mb-2"></i>
                    <div className="font-semibold">Email</div>
                    <div className="text-sm opacity-70">support@makoexpress.ml</div>
                  </div>
                </div>
                <div className="mt-6">
                  <Link href="/contact">
                    <Button className="bg-mako-green text-white hover:bg-green-600 px-8">
                      <i className="fas fa-comments mr-2"></i>
                      Démarrer une conversation
                    </Button>
                  </Link>
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