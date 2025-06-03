import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Shield, Phone } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email ou numéro de téléphone requis"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { loginMutation } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mako-green via-green-600 to-green-700 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Hero Section */}
        <div className="hidden lg:block space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">
              MAKOEXPRESS
            </h1>
            <p className="text-xl text-white opacity-90">
              Connexion sécurisée à votre compte
            </p>
          </div>
          
          <div className="space-y-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span>Authentification sécurisée</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <span>Support multi-pays</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-mako-green">Se connecter</CardTitle>
            <CardDescription className="text-mako-green opacity-80">
              Accédez à votre compte MAKOEXPRESS
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
                      <FormLabel className="text-mako-green font-medium">Email ou numéro de téléphone</FormLabel>
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

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-mako-green font-medium">Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Votre mot de passe"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-white text-mako-green border border-mako-green hover:bg-mako-green hover:text-white transition-colors font-semibold py-3 rounded-lg"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-center space-y-2">
              <Link href="/auth/forgot-password" className="text-mako-green hover:underline text-sm block mb-4 font-medium">
                Mot de passe oublié ?
              </Link>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vous n'avez pas de compte ?{" "}
                <Link href="/auth/register" className="text-mako-green hover:underline font-semibold">
                  Créer un compte
                </Link>
              </p>
              
              <div className="pt-4 border-t border-mako-green/20">
                <p className="text-xs text-mako-green/70">
                  Authentification sécurisée avec validation par pays
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}