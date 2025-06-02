import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ArrowLeft, Mail, Phone, CheckCircle } from "lucide-react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email ou numéro de téléphone requis"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const res = await apiRequest("POST", "/api/forgot-password", data);
      return res.json();
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: "Instructions envoyées",
        description: "Vérifiez votre email ou SMS pour réinitialiser votre mot de passe",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Instructions envoyées</CardTitle>
            <CardDescription>
              Nous avons envoyé un lien de réinitialisation à votre email ou par SMS
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Vérifiez votre boîte de réception et suivez les instructions pour créer un nouveau mot de passe.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => setIsSuccess(false)}
                variant="outline"
                className="w-full"
              >
                Renvoyer le lien
              </Button>
              
              <Link href="/auth/login" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Hero Section */}
        <div className="hidden lg:block space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
              MAKOEXPRESS
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Récupération de mot de passe
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span>Réinitialisation par email</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span>Réinitialisation par SMS</span>
            </div>
          </div>
        </div>

        {/* Forgot Password Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Mot de passe oublié</CardTitle>
            <CardDescription>
              Entrez votre email ou numéro de téléphone pour recevoir un lien de réinitialisation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Email or Phone */}
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ou numéro de téléphone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="votre@email.com ou +223XXXXXXXX" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? "Envoi..." : "Envoyer le lien"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center space-y-2">
              <Link href="/auth/login" className="text-green-600 hover:underline text-sm">
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Retour à la connexion
              </Link>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vous n'avez pas de compte ?{" "}
                  <Link href="/auth/register" className="text-green-600 hover:underline">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}