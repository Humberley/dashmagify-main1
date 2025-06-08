
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type SignupValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSignup = async (values: SignupValues) => {
    setIsLoading(true);
    
    try {
      // Register user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
        },
      });

      if (error) throw error;

      // Show success message instead of storing session and redirecting
      if (data && data.user) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar sua conta e faça login. Lembre-se de verificar também a pasta de spam/lixo eletrônico.",
        });
        
        // Store email in localStorage to identify users coming from signup
        localStorage.setItem("magify_signup_email", values.email);
        
        // Redirect to login page instead of dashboard
        navigate("/login");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Decorative */}
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
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6" />
                <path d="M12 18v2m0-16v2" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white drop-shadow-md">
              Junte-se ao Magify
            </h2>
            <p className="text-white/80 max-w-xs mx-auto">
              Assuma o controle de suas finanças com insights inteligentes e análises bonitas
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Signup Form */}
      <div className="flex flex-col justify-center items-center p-6 md:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Crie sua <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-magify-lavender">Magify</span> conta
            </h1>
            <p className="mt-3 text-muted-foreground">Cadastre-se para iniciar sua jornada financeira</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="mt-8 space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            id="name"
                            type="text"
                            className="pastel-input pl-10"
                            placeholder="Nome completo"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            id="email"
                            type="email"
                            className="pastel-input pl-10"
                            placeholder="Endereço de email"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
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
                            className="pastel-input pl-10 pr-10"
                            placeholder="Senha"
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
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-muted-foreground">
                  Eu concordo com os <a href="#" className="text-primary">Termos de Serviço</a> e <a href="#" className="text-primary">Política de Privacidade</a>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-magify-lavender hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Já tem uma conta?</span>{" "}
                <a href="/login" className="font-medium text-primary hover:text-primary/80">
                  Entrar
                </a>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
