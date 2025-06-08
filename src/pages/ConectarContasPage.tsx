import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Pluggy from "@pluggy/pluggy-js"; // Import the JS SDK
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getUserFromLocalStorage } from "@/lib/financeUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PluggyItem {
  id: string;
  connector?: any; // Add other relevant properties if needed
}

interface PluggyError {
  code?: string;
  message: string;
  itemId?: string;
  details?: any;
}

const ConectarContasPage = () => {
  const [connectToken, setConnectToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const pluggyContainerRef = useRef<HTMLDivElement>(null);
  const pluggyInstanceRef = useRef<any>(null); // To store Pluggy instance for potential cleanup

  useEffect(() => {
    const user = getUserFromLocalStorage();
    if (user?.id) {
      setUserId(user.id);
    } else {
      setError("Usuário não autenticado. Por favor, faça login para conectar suas contas.");
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchToken() {
      if (!userId) return;

      setIsLoading(true);
      setError(null);
      try {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;

        const response = await fetch(`https://kgmtbffyvygfjkwadkrc.supabase.co/functions/v1/generate-pluggy-connect-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken || ''}`
          },
          body: JSON.stringify({ userId })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ao buscar token de conexão: ${response.statusText}`);
        }

        const data = await response.json();
        setConnectToken(data.connectToken);
      } catch (err) {
        console.error("Erro ao buscar token de conexão:", err);
        setError((err as Error).message || "Não foi possível gerar o token de conexão. Tente novamente.");
        toast({
          variant: "destructive",
          title: "Erro de conexão",
          description: "Não foi possível gerar o token para conectar suas contas.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchToken();
    }
  }, [userId, toast]);

  const savePluggyItemId = async (itemId: string) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não identificado para salvar o item da Pluggy.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pluggy_item_id: itemId })
        .eq('id', userId);

      if (error) throw error;

      const currentUserData = getUserFromLocalStorage();
      if (currentUserData) {
        localStorage.setItem('magify_user', JSON.stringify({
          ...currentUserData,
          pluggy_item_id: itemId,
        }));
      }

      toast({
        title: "Conta conectada!",
        description: "Sua conta bancária foi conectada com sucesso.",
      });
    } catch (err) {
      console.error("Erro ao salvar itemId da Pluggy:", err);
      toast({
        variant: "destructive",
        title: "Erro ao salvar item",
        description: "Não foi possível salvar o item da Pluggy no seu perfil.",
      });
    }
  };

  useEffect(() => {
    if (connectToken && pluggyContainerRef.current) {
      // Clear previous instance if any
      if (pluggyInstanceRef.current && typeof pluggyInstanceRef.current.destroy === 'function') {
        pluggyInstanceRef.current.destroy();
      }
      if (pluggyContainerRef.current) {
        pluggyContainerRef.current.innerHTML = ''; // Clear the container
      }

      pluggyInstanceRef.current = new Pluggy.Connect({
        connectToken,
        includeSandbox: true, // Set to false in production if not needed
        language: "pt",
        onSuccess: (data: { item: PluggyItem }) => {
          console.log("Pluggy Connect Success:", data.item);
          if (data.item && data.item.id) {
            savePluggyItemId(data.item.id);
          } else {
            console.error("Pluggy onSuccess callback did not return a valid item ID.");
            toast({
              variant: "destructive",
              title: "Erro na conexão",
              description: "Não foi possível obter o ID do item conectado.",
            });
          }
        },
        onError: (error: PluggyError) => {
          console.error("Erro na integração Pluggy:", error);
          toast({
            variant: "destructive",
            title: "Erro na integração",
            description: error.message || "Ocorreu um erro ao conectar sua conta.",
          });
        },
        onClose: () => {
          console.log("Pluggy Connect widget closed by user.");
        },
        // The SDK will automatically look for a div with id="pluggy-connect"
        // or you can pass an elementId option if supported by the specific version.
        // For now, we rely on the default behavior or the SDK using the container.
      });
    }

    return () => {
      // Cleanup Pluggy instance on component unmount
      if (pluggyInstanceRef.current && typeof pluggyInstanceRef.current.destroy === 'function') {
        pluggyInstanceRef.current.destroy();
      }
       if (pluggyContainerRef.current) {
        pluggyContainerRef.current.innerHTML = ''; // Also clear on unmount
      }
    };
  }, [connectToken, toast, userId]); // Added userId to ensure savePluggyItemId has the correct closure

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Conectar Contas</h1>
        <Card>
          <CardHeader>
            <CardTitle>Integração de Contas Bancárias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Conecte suas contas bancárias e outras fontes de dados financeiros de forma segura através da Pluggy.
              Isso permitirá que o Magify importe suas transações automaticamente.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading && !error && (
              <div className="flex flex-col items-center justify-center h-40">
                <Skeleton className="h-10 w-64 mb-4" />
                <p className="text-muted-foreground">Gerando token de conexão...</p>
              </div>
            )}

            {!isLoading && !error && connectToken && (
              // Container for Pluggy Connect widget. The SDK will mount here.
              // Ensure this div has the ID that Pluggy SDK expects, typically "pluggy-connect".
              <div id="pluggy-connect" ref={pluggyContainerRef} className="w-full h-[600px] border rounded-lg overflow-hidden">
                {/* Pluggy Connect widget will be mounted here by the SDK */}
              </div>
            )}

            {!isLoading && !error && !connectToken && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground">
                  Não foi possível carregar o componente de conexão. Verifique sua autenticação ou tente novamente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ConectarContasPage;