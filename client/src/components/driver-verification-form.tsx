import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const driverVerificationSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est requis"),
  identityNumber: z.string().min(5, "Le numéro d'identité est requis"),
  identityType: z.enum(["cni", "passport", "carte_consulaire"]),
  declaredCountry: z.string().min(2, "Le pays est requis"),
  age: z.number().min(18, "Vous devez avoir au moins 18 ans").max(70, "Âge maximum 70 ans"),
  vehicleType: z.enum(["moto", "velo", "voiture", "van"]),
  vehicleRegistration: z.string().optional(),
  driversLicense: z.string().optional(),
  availabilityHours: z.string().min(1, "Les heures de disponibilité sont requises"),
  phone: z.string().min(8, "Numéro de téléphone valide requis"),
  whatsappNumber: z.string().min(8, "Numéro WhatsApp valide requis"),
  makoPayId: z.string().min(3, "Identifiant MakoPay requis"),
  address: z.string().min(5, "Adresse complète requise"),
  city: z.string().min(2, "Ville requise"),
  healthDeclaration: z.boolean().refine(val => val, "Déclaration de santé requise"),
});

type DriverVerificationData = z.infer<typeof driverVerificationSchema>;

interface DriverVerificationFormProps {
  onStepComplete: (step: string, data: any) => void;
  initialData?: Partial<DriverVerificationData>;
}

export default function DriverVerificationForm({ onStepComplete, initialData }: DriverVerificationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'verified' | 'failed' | 'mismatch'>('checking');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [healthFile, setHealthFile] = useState<File | null>(null);
  
  const selfieRef = useRef<HTMLInputElement>(null);
  const identityRef = useRef<HTMLInputElement>(null);
  const healthRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<DriverVerificationData>({
    resolver: zodResolver(driverVerificationSchema),
    defaultValues: {
      fullName: "",
      identityNumber: "",
      identityType: "cni",
      declaredCountry: "Mali",
      age: 25,
      vehicleType: "moto",
      vehicleRegistration: "",
      driversLicense: "",
      availabilityHours: "08:00-18:00",
      phone: "",
      whatsappNumber: "",
      makoPayId: "",
      address: "",
      city: "Bamako",
      healthDeclaration: false,
      ...initialData
    },
  });

  // Geolocation verification
  useEffect(() => {
    if (currentStep === 2) {
      checkLocation();
    }
  }, [currentStep]);

  const checkLocation = () => {
    setLocationStatus('checking');
    
    if (!navigator.geolocation) {
      setLocationStatus('failed');
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Verify location against declared country
        verifyLocationMatch(latitude, longitude, form.watch("declaredCountry"));
      },
      (error) => {
        setLocationStatus('failed');
        toast({
          title: "Erreur de géolocalisation",
          description: "Impossible d'obtenir votre position. Veuillez autoriser l'accès à votre localisation.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const verifyLocationMatch = (lat: number, lng: number, declaredCountry: string) => {
    // Mali coordinates boundaries (approximate)
    const maliBounds = {
      north: 25.0,
      south: 10.0,
      east: 4.3,
      west: -12.2
    };

    const isInMali = lat >= maliBounds.south && lat <= maliBounds.north && 
                    lng >= maliBounds.west && lng <= maliBounds.east;

    if (declaredCountry === "Mali" && isInMali) {
      setLocationStatus('verified');
      toast({
        title: "Localisation vérifiée",
        description: "Votre position correspond au Mali",
        duration: 3000,
      });
    } else if (declaredCountry === "Mali" && !isInMali) {
      setLocationStatus('mismatch');
      toast({
        title: "Localisation non conforme",
        description: "Votre position GPS ne correspond pas au Mali déclaré",
        variant: "destructive",
      });
    } else {
      // For other countries, accept for now
      setLocationStatus('verified');
      toast({
        title: "Localisation acceptée",
        description: `Position vérifiée pour ${declaredCountry}`,
        duration: 3000,
      });
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data: DriverVerificationData & { 
      gpsLatitude?: number, 
      gpsLongitude?: number,
      locationVerified: boolean,
      selfiePhotoUrl?: string,
      identityDocumentUrl?: string,
      healthCertificateUrl?: string
    }) => {
      return apiRequest("/api/drivers/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Demande soumise",
        description: "Votre demande de livreur a été soumise avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/drivers/profile'] });
      onStepComplete('completed', {});
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre votre demande",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (file: File, type: 'selfie' | 'identity' | 'health') => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Formats acceptés: JPG, PNG, PDF",
        variant: "destructive",
      });
      return;
    }

    switch (type) {
      case 'selfie':
        setSelfieFile(file);
        break;
      case 'identity':
        setIdentityFile(file);
        break;
      case 'health':
        setHealthFile(file);
        break;
    }

    toast({
      title: "Fichier uploadé",
      description: `${file.name} ajouté avec succès`,
    });
  };

  const onSubmit = (data: DriverVerificationData) => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      onStepComplete(`step_${currentStep}`, data);
      return;
    }

    // Final submission
    const submissionData = {
      ...data,
      gpsLatitude: userLocation?.lat,
      gpsLongitude: userLocation?.lng,
      locationVerified: locationStatus === 'verified',
      selfiePhotoUrl: selfieFile ? `uploads/selfies/${selfieFile.name}` : undefined,
      identityDocumentUrl: identityFile ? `uploads/identity/${identityFile.name}` : undefined,
      healthCertificateUrl: healthFile ? `uploads/health/${healthFile.name}` : undefined,
    };

    submitMutation.mutate(submissionData);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return form.watch("fullName") && form.watch("identityNumber") && form.watch("phone");
      case 2:
        return locationStatus === 'verified';
      case 3:
        return selfieFile && identityFile;
      case 4:
        return form.watch("makoPayId") && form.watch("healthDeclaration");
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Informations personnelles";
      case 2: return "Vérification de localisation";
      case 3: return "Documents et photos";
      case 4: return "Finalisation";
      default: return "Inscription livreur";
    }
  };

  const getLocationStatusIcon = () => {
    switch (locationStatus) {
      case 'checking': return <i className="fas fa-spinner fa-spin text-blue-500"></i>;
      case 'verified': return <i className="fas fa-check-circle text-green-500"></i>;
      case 'failed': return <i className="fas fa-times-circle text-red-500"></i>;
      case 'mismatch': return <i className="fas fa-exclamation-triangle text-red-500"></i>;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-user text-mako-green mr-2"></i>
                      Nom complet *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nom complet comme sur votre pièce d'identité" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-calendar text-mako-green mr-2"></i>
                      Âge *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="18" 
                        max="70" 
                        placeholder="25" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="identityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-id-card text-mako-green mr-2"></i>
                      Type de pièce d'identité *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cni">Carte Nationale d'Identité</SelectItem>
                        <SelectItem value="passport">Passeport</SelectItem>
                        <SelectItem value="carte_consulaire">Carte Consulaire</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="identityNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-hashtag text-mako-green mr-2"></i>
                      Numéro d'identité *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="ML123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-phone text-mako-green mr-2"></i>
                      Téléphone *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+223 XX XX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fab fa-whatsapp text-mako-green mr-2"></i>
                      WhatsApp *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+223 XX XX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="declaredCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-globe text-mako-green mr-2"></i>
                      Pays de résidence *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir le pays" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mali">Mali</SelectItem>
                        <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                        <SelectItem value="Côte d'Ivoire">Côte d'Ivoire</SelectItem>
                        <SelectItem value="Sénégal">Sénégal</SelectItem>
                        <SelectItem value="Niger">Niger</SelectItem>
                        <SelectItem value="Guinée">Guinée</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-city text-mako-green mr-2"></i>
                      Ville *
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Bamako" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <i className="fas fa-map-marker-alt text-mako-green mr-2"></i>
                    Adresse complète *
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Adresse complète avec quartier et références" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Alert>
              <i className="fas fa-info-circle"></i>
              <AlertDescription>
                Nous devons vérifier que votre localisation GPS correspond au pays que vous avez déclaré. 
                Cela garantit l'authenticité de votre inscription.
              </AlertDescription>
            </Alert>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Vérification de localisation</h3>
                {getLocationStatusIcon()}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Pays déclaré:</span>
                  <Badge variant="outline">{form.watch("declaredCountry")}</Badge>
                </div>

                {userLocation && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Latitude GPS:</span>
                      <span className="font-mono text-sm">{userLocation.lat.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Longitude GPS:</span>
                      <span className="font-mono text-sm">{userLocation.lng.toFixed(6)}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Statut:</span>
                  <Badge className={
                    locationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                    locationStatus === 'checking' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {locationStatus === 'verified' ? 'Vérifiée' :
                     locationStatus === 'checking' ? 'Vérification...' :
                     locationStatus === 'mismatch' ? 'Non conforme' : 'Échec'}
                  </Badge>
                </div>
              </div>

              {locationStatus === 'failed' && (
                <Button onClick={checkLocation} className="w-full mt-4">
                  <i className="fas fa-redo mr-2"></i>
                  Réessayer la géolocalisation
                </Button>
              )}

              {locationStatus === 'mismatch' && (
                <Alert className="mt-4">
                  <i className="fas fa-exclamation-triangle"></i>
                  <AlertDescription>
                    Votre position GPS ne correspond pas au pays déclaré. Veuillez vérifier vos informations 
                    ou nous contacter si vous pensez qu'il y a une erreur.
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Alert>
              <i className="fas fa-camera"></i>
              <AlertDescription>
                Veuillez fournir des photos claires et lisibles. Formats acceptés: JPG, PNG, PDF (max 5MB).
              </AlertDescription>
            </Alert>

            {/* Selfie Photo */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  <i className="fas fa-camera text-mako-green mr-2"></i>
                  Photo Selfie *
                </h3>
                {selfieFile && <Badge className="bg-green-100 text-green-800">Uploadé</Badge>}
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Prenez une photo claire de votre visage. Assurez-vous que votre visage est bien visible et éclairé.
                </p>
                
                <input
                  ref={selfieRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
                  className="hidden"
                />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => selfieRef.current?.click()}
                  className="w-full"
                >
                  <i className="fas fa-camera mr-2"></i>
                  {selfieFile ? `Changer la photo (${selfieFile.name})` : 'Prendre un selfie'}
                </Button>
              </div>
            </Card>

            {/* Identity Document */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  <i className="fas fa-id-card text-mako-green mr-2"></i>
                  Pièce d'identité *
                </h3>
                {identityFile && <Badge className="bg-green-100 text-green-800">Uploadé</Badge>}
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Photo de votre {form.watch("identityType") === 'cni' ? 'Carte Nationale d\'Identité' : 
                                   form.watch("identityType") === 'passport' ? 'Passeport' : 'Carte Consulaire'}.
                </p>
                
                <input
                  ref={identityRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'identity')}
                  className="hidden"
                />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => identityRef.current?.click()}
                  className="w-full"
                >
                  <i className="fas fa-upload mr-2"></i>
                  {identityFile ? `Changer le document (${identityFile.name})` : 'Uploader la pièce d\'identité'}
                </Button>
              </div>
            </Card>

            {/* Health Certificate */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  <i className="fas fa-heartbeat text-mako-green mr-2"></i>
                  Certificat de santé
                </h3>
                {healthFile && <Badge className="bg-green-100 text-green-800">Uploadé</Badge>}
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Certificat médical simple ou déclaration sur l'honneur de bonne santé (optionnel mais recommandé).
                </p>
                
                <input
                  ref={healthRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'health')}
                  className="hidden"
                />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => healthRef.current?.click()}
                  className="w-full"
                >
                  <i className="fas fa-upload mr-2"></i>
                  {healthFile ? `Changer le document (${healthFile.name})` : 'Uploader le certificat (optionnel)'}
                </Button>
              </div>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-motorcycle text-mako-green mr-2"></i>
                      Type de transport *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir le véhicule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="moto">Moto</SelectItem>
                        <SelectItem value="velo">Vélo</SelectItem>
                        <SelectItem value="voiture">Voiture</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availabilityHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-clock text-mako-green mr-2"></i>
                      Disponibilité *
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Heures de travail" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="08:00-18:00">08h00 - 18h00 (Journée)</SelectItem>
                        <SelectItem value="06:00-14:00">06h00 - 14h00 (Matin)</SelectItem>
                        <SelectItem value="14:00-22:00">14h00 - 22h00 (Après-midi)</SelectItem>
                        <SelectItem value="18:00-06:00">18h00 - 06h00 (Nuit)</SelectItem>
                        <SelectItem value="24/7">24h/24 7j/7 (Flexible)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleRegistration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-file-alt text-mako-green mr-2"></i>
                      Immatriculation véhicule
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro d'immatriculation (optionnel)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="driversLicense"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <i className="fas fa-id-card text-mako-green mr-2"></i>
                      Permis de conduire
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Numéro de permis (optionnel)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="makoPayId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <i className="fas fa-wallet text-mako-green mr-2"></i>
                    Identifiant MakoPay *
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Votre identifiant MakoPay pour recevoir les paiements" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="healthDeclaration"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border border-gray-300"
                    />
                    <FormLabel className="text-sm">
                      <i className="fas fa-check-circle text-mako-green mr-2"></i>
                      Je déclare être en bonne santé et apte à effectuer des livraisons *
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{getStepTitle()}</span>
          <Badge variant="outline">Étape {currentStep}/4</Badge>
        </CardTitle>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-mako-green h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}

            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Précédent
                </Button>
              )}

              <Button 
                type="submit"
                disabled={!canProceedToNext() || submitMutation.isPending}
                className="ml-auto"
              >
                {submitMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : currentStep === 4 ? (
                  <i className="fas fa-check mr-2"></i>
                ) : (
                  <i className="fas fa-arrow-right mr-2"></i>
                )}
                {currentStep === 4 ? 'Soumettre la demande' : 'Suivant'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}