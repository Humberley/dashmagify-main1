
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .max(72, "A senha não pode ter mais de 72 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Check if URL contains hash fragment with access_token
    // This happens when users click the password reset link
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    
    if (accessToken) {
      setHasToken(true);
    } else {
      setHasToken(false);
    }
  }, []);

  const handleReset = async (values: ResetPasswordValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada com sucesso",
        description: "Você pode agora entrar com sua nova senha.",
      });
      
      // Navigate to login page after short delay
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: "Não foi possível redefinir sua senha. O link pode ter expirado.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading or error if we're still checking for token or no token found
  if (hasToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verificando link de redefinição...</p>
      </div>
    );
  }
  
  if (hasToken === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Link inválido</h1>
          <p className="text-muted-foreground">
            O link de redefinição de senha é inválido ou expirou.
          </p>
          <Alert className="bg-amber-50 border-amber-200 text-left">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Dica</AlertTitle>
            <AlertDescription className="text-amber-700">
              Verifique se você clicou no link mais recente enviado para seu email. 
              Certifique-se também de ter verificado sua pasta de spam/lixo eletrônico.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/login")}>
            Voltar para o login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Reset Form */}
      <div className="flex flex-col justify-center items-center p-6 md:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Redefinir senha
            </h1>
            <p className="mt-3 text-muted-foreground">
              Crie uma nova senha para sua conta
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleReset)} className="mt-8 space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                            placeholder="Nova senha"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground"
                        >
                          {showPassword ? 
                            <EyeOff className="h-5 w-5" /> : 
                            <Eye className="h-5 w-5" />
                          }
                        </button>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                            placeholder="Confirme a nova senha"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground"
                        >
                          {showConfirmPassword ? 
                            <EyeOff className="h-5 w-5" /> : 
                            <Eye className="h-5 w-5" />
                          }
                        </button>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-magify-lavender hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Atualizando..." : "Atualizar senha"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden md:block relative magify-gradient overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')]" />
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <div className="text-center space-y-6">
            <div className="mx-auto w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-float">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-16 h-16 text-white"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white drop-shadow-md">
              Redefinição Segura
            </h2>
            <p className="text-white/80 max-w-xs mx-auto">
              Escolha uma senha forte para proteger sua conta Magify
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
