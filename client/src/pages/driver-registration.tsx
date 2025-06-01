import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import { useLocation } from "wouter";

const driverSchema = z.object({
  age: z.string().min(1, "L'âge est requis").transform(Number),
  vehicleType: z.string().min(1, "Le type de véhicule est requis"),
  profileImageUrl: z.string().optional(),
  identityDocumentUrl: z.string().optional(),
});

type DriverFormData = z.infer<typeof driverSchema>;

export default function DriverRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: driverProfile } = useQuery({
    queryKey: ["/api/drivers/profile"],
  });

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      age: "",
      vehicleType: "",
      profileImageUrl: "",
      identityDocumentUrl: "",
    },
  });

  const registerDriverMutation = useMutation({
    mutationFn: async (data: DriverFormData) => {
      const response = await apiRequest("POST", "/api/drivers/register", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Candidature soumise avec succès!",
        description: "Votre candidature est en cours d'examen. Vous recevrez une notification une fois approuvée.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/drivers/profile"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre candidature",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DriverFormData) => {
    registerDriverMutation.mutate(data);
  };

  // If user already has a driver profile, show status
  if (driverProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="pt-20 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-mako-dark mb-4">
                  <i className="fas fa-motorcycle mr-2 text-mako-green"></i>
                  Statut de votre Candidature
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold mb-6 ${
                  driverProfile.status === 'approved' ? 'bg-green-100 text-green-800' :
                  driverProfile.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  <i className={`fas mr-2 ${
                    driverProfile.status === 'approved' ? 'fa-check-circle' :
                    driverProfile.status === 'rejected' ? 'fa-times-circle' :
                    'fa-clock'
                  }`}></i>
                  {driverProfile.status === 'approved' ? 'Candidature Approuvée' :
                   driverProfile.status === 'rejected' ? 'Candidature Rejetée' :
                   'Candidature en Cours d\'Examen'}
                </div>

                <div className="space-y-4 mb-8">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <span className="text-mako-gray">Âge:</span>
                      <p className="font-medium text-mako-dark">{driverProfile.age} ans</p>
                    </div>
                    <div>
                      <span className="text-mako-gray">Véhicule:</span>
                      <p className="font-medium text-mako-dark capitalize">{driverProfile.vehicleType}</p>
                    </div>
                  </div>
                </div>

                {driverProfile.status === 'approved' && (
                  <Button onClick={() => setLocation("/driver/dashboard")}>
                    <i className="fas fa-tachometer-alt mr-2"></i>
                    Accéder au Tableau de Bord
                  </Button>
                )}

                {driverProfile.status === 'pending' && (
                  <p className="text-mako-gray">
                    Votre candidature est en cours d'examen. Vous recevrez une notification une fois la décision prise.
                  </p>
                )}

                {driverProfile.status === 'rejected' && (
                  <p className="text-mako-gray">
                    Votre candidature a été rejetée. Vous pouvez contacter notre support pour plus d'informations.
                  </p>
                )}
              </CardContent>
            </Card>
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
      
      <div className="pt-20 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Benefits Section */}
            <div>
              <h1 className="text-3xl font-bold text-mako-dark mb-6">Devenez Livreur Partenaire</h1>
              <p className="text-lg text-mako-gray mb-8">
                Rejoignez notre réseau de livreurs et générez des revenus flexibles. 
                Inscription simple, formation gratuite et paiements via MAKOPAY.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-mako-green rounded-full p-2">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <span className="text-mako-dark">Horaires flexibles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-mako-green rounded-full p-2">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <span className="text-mako-dark">Paiements quotidiens via MAKOPAY</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-mako-green rounded-full p-2">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <span className="text-mako-dark">Formation et support inclus</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-mako-green rounded-full p-2">
                    <i className="fas fa-check text-white text-sm"></i>
                  </div>
                  <span className="text-mako-dark">Assurance couverte</span>
                </div>
              </div>
            </div>
            
            {/* Registration Form */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-mako-dark">
                  Formulaire de Candidature
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Âge</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Votre âge" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vehicleType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de véhicule</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner votre véhicule" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="moto">Moto</SelectItem>
                              <SelectItem value="velo">Vélo</SelectItem>
                              <SelectItem value="voiture">Voiture</SelectItem>
                              <SelectItem value="a-pied">À pied</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profileImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Photo de profil (URL)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://exemple.com/photo.jpg" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="identityDocumentUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pièce d'identité (URL)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://exemple.com/piece-identite.jpg" 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full py-3 font-semibold"
                      disabled={registerDriverMutation.isPending}
                    >
                      {registerDriverMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Soumission en cours...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i>
                          Soumettre ma candidature
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}
