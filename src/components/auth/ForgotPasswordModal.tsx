
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({ open, onOpenChange }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email obrigatório",
        description: "Por favor, informe seu email para redefinir sua senha.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      setEmailSent(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada e pasta de spam para redefinir sua senha.",
      });
    } catch (error) {
      console.error('Error sending reset password email:', error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: "Não foi possível enviar o email de redefinição. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => {
      if(!open) setEmailSent(false);
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Esqueceu sua senha?</DialogTitle>
          <DialogDescription>
            Insira seu email para receber um link de redefinição de senha.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="relative">
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="Seu email"
              disabled={isLoading || emailSent}
            />
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
          
          {emailSent && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Email enviado para <strong>{email}</strong>. Por favor, verifique tanto sua caixa de entrada quanto a pasta de spam/lixo eletrônico para encontrar o link de redefinição de senha.
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || emailSent}>
              {isLoading ? "Enviando..." : emailSent ? "Email enviado" : "Enviar link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
