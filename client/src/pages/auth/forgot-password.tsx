import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Email ou téléphone requis"),
  resetMethod: z.enum(["email", "sms"])
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [resetToken, setResetToken] = useState("");
  const [userIdentifier, setUserIdentifier] = useState("");
  const { toast } = useToast();

  const form = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      identifier: "",
      resetMethod: "email"
    }
  });

  const requestResetMutation = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      return await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      setUserIdentifier(form.getValues("identifier"));
      setStep("verify");
      toast({
        title: "Code envoyé",
        description: `Un code de réinitialisation a été envoyé à ${form.getValues("identifier")}`,
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le code de réinitialisation",
        variant: "destructive"
      });
    }
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("/api/auth/verify-reset-code", {
        method: "POST",
        body: JSON.stringify({
          identifier: userIdentifier,
          code
        })
      });
    },
    onSuccess: (data) => {
      setResetToken(data.token);
      setStep("reset");
      toast({
        title: "Code vérifié",
        description: "Vous pouvez maintenant définir votre nouveau mot de passe",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Code invalide",
        description: "Le code de vérification est incorrect ou expiré",
        variant: "destructive"
      });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      return await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token: resetToken,
          password
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été modifié avec succès",
        variant: "default"
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le mot de passe",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ForgotPasswordData) => {
    requestResetMutation.mutate(data);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const code = formData.get("code") as string;
    if (code) {
      verifyCodeMutation.mutate(code);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Erreur", 
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }
    
    resetPasswordMutation.mutate(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md shadow-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center">
              <i className="fas fa-key mr-2"></i>
              Mot de passe oublié
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            {step === "request" && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Email ou téléphone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="votre@email.com ou +223 XX XX XX XX"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resetMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Méthode de réinitialisation</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            <option value="email">Par email</option>
                            <option value="sms">Par SMS</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-mako-green hover:bg-green-600 text-white"
                    disabled={requestResetMutation.isPending}
                  >
                    {requestResetMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane mr-2"></i>
                        Envoyer le code
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {step === "verify" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Code de vérification
                  </label>
                  <Input
                    name="code"
                    type="text"
                    placeholder="Entrez le code reçu"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Code envoyé à {userIdentifier}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-mako-green hover:bg-green-600 text-white"
                  disabled={verifyCodeMutation.isPending}
                >
                  {verifyCodeMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Vérification...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Vérifier le code
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep("request")}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Retour
                </Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nouveau mot de passe
                  </label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Nouveau mot de passe"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    minLength={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-mako-green hover:bg-green-600 text-white"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Réinitialisation...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Réinitialiser le mot de passe
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vous vous souvenez de votre mot de passe ?{" "}
                <a href="/login" className="text-mako-green hover:underline font-medium">
                  Se connecter
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}