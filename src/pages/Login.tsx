
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [isNewSignup, setIsNewSignup] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Check if user just signed up
  useEffect(() => {
    const email = localStorage.getItem("magify_signup_email");
    if (email) {
      setIsNewSignup(true);
      setSignupEmail(email);
      form.setValue("email", email);
      // Clear the stored email after using it
      localStorage.removeItem("magify_signup_email");
    }
  }, [form]);
  
  // Handle cooldown timer for resend verification
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    const email = form.getValues("email");
    if (!email) {
      toast({
        variant: "destructive",
        title: "Erro ao reenviar verificação",
        description: "Por favor, insira seu email primeiro",
      });
      return;
    }
    
    // Don't allow resend if cooldown is active
    if (resendCooldown > 0) {
      toast({
        variant: "warning",
        title: "Aguarde um momento",
        description: `Você poderá reenviar o email em ${resendCooldown} segundos.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      // Start cooldown (60 seconds)
      setResendCooldown(60);
      
      toast({
        title: "Email de verificação enviado",
        description: "Por favor, verifique sua caixa de entrada e pasta de spam/lixo eletrônico e clique no link de confirmação.",
      });
      setEmailVerificationError(false);
    } catch (error) {
      const errorMsg = (error as Error).message;
      // Check for rate limiting error
      if (errorMsg.includes("rate limit") || errorMsg.includes("too many requests")) {
        toast({
          variant: "destructive",
          title: "Limite de tentativas excedido",
          description: "Por favor, aguarde alguns minutos antes de tentar novamente. Verifique também sua caixa de spam/lixo eletrônico.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao reenviar verificação",
          description: "Tente novamente mais tarde.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (values: LoginValues) => {
    setIsLoading(true);
    setEmailVerificationError(false);
    
    try {
      console.log("Attempting login for:", values.email);
      
      // Login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        console.error("Login error:", error.message);
        
        // Check specifically for the email not confirmed error
        if (error.message.includes("Email not confirmed")) {
          setEmailVerificationError(true);
          throw new Error("Email não verificado. Por favor, verifique seu email (incluindo a pasta de spam/lixo eletrônico) para confirmar sua conta.");
        }
        
        throw error;
      }

      console.log("Login successful, user data:", data.user);

      if (data && data.user) {
        try {
          // Fetch user profile data after successful login
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, certificate')
            .eq('id', data.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching profile:", profileError);
          }

          console.log("Profile data fetched:", profileData);

          // Store session data including certificate
          localStorage.setItem('magify_user', JSON.stringify({
            id: data.user.id,
            email: values.email,
            name: profileData?.name || data.user.user_metadata.name || '',
            certificate: profileData?.certificate || '',
          }));

          toast({
            title: "Login bem-sucedido!",
            description: "Bem-vindo ao assistente financeiro Magify",
          });
          
          navigate("/dashboard");
        } catch (profileError) {
          console.error("Error in profile fetch:", profileError);
          // Still allow login even if profile fetch fails
          localStorage.setItem('magify_user', JSON.stringify({
            id: data.user.id,
            email: values.email,
            name: data.user.user_metadata.name || '',
          }));
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha no login",
        description: (error as Error).message || "Verifique suas credenciais e tente novamente",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left side - Login Form */}
      <div className="flex flex-col justify-center items-center p-6 md:p-10 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Bem-vindo ao <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-magify-lavender">Magify</span>
            </h1>
            <p className="mt-3 text-muted-foreground">Seu assistente financeiro pessoal</p>
          </div>
          
          {isNewSignup && (
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Verifique seu email</AlertTitle>
              <AlertDescription className="text-amber-700">
                Enviamos um email de verificação para <strong>{signupEmail}</strong>. 
                Por favor, verifique tanto a caixa de entrada quanto a pasta de spam/lixo eletrônico.
                Confirme seu email antes de fazer login.
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="mt-8 space-y-6">
              <div className="space-y-4">
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

              {emailVerificationError && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <p className="text-amber-700 text-sm mb-2">
                    Você precisa verificar seu email antes de fazer login. Por favor, verifique tanto sua caixa de entrada quanto a pasta de spam/lixo eletrônico.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="text-amber-700 border-amber-300 hover:bg-amber-100"
                    onClick={handleResendVerification}
                    disabled={isLoading || resendCooldown > 0}
                  >
                    {resendCooldown > 0 
                      ? `Reenviar em ${resendCooldown}s` 
                      : "Reenviar email de verificação"}
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                    Lembrar-me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    className="font-medium text-primary hover:text-primary/80"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-magify-lavender hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Não tem uma conta?</span>{" "}
                <a href="/signup" className="font-medium text-primary hover:text-primary/80">
                  Cadastrar-se
                </a>
              </div>
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
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6" />
                <path d="M12 18v2m0-16v2" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white drop-shadow-md">
              Magify
            </h2>
            <p className="text-white/80 max-w-xs mx-auto">
              Simplifique suas finanças com insights inteligentes e análises bonitas
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal 
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </div>
  );
};

export default Login;
