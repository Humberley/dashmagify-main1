
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import EntryList from "@/components/dashboard/EntryList";
import EntryFormModal from "@/components/dashboard/EntryFormModal";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  FinancialEntryType,
  FinancialEntry,
  NewFinancialEntry,
  getFinancialEntries,
  createFinancialEntry,
  updateFinancialEntry,
  getUserFromLocalStorage
} from "@/lib/financeUtils";

interface FinancialEntriesPageProps {
  title: string;
  entryType: FinancialEntryType;
  description?: string;
}

const FinancialEntriesPage = ({ title, entryType, description }: FinancialEntriesPageProps) => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<FinancialEntry | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  // Check if user is authenticated
  useEffect(() => {
    const localUser = getUserFromLocalStorage();
    if (localUser?.id) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setError("Usuário não autenticado. Por favor, faça login para continuar.");
    }
  }, []);

  const fetchEntries = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const data = await getFinancialEntries(entryType);
      setEntries(data);
      setError(null);
      
      if (showToast) {
        toast({
          title: "Dados atualizados",
          description: "Os registros foram atualizados",
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError("Falha ao carregar os dados");
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Por favor, tente atualizar a página",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      fetchEntries();
    }
  }, [entryType, isAuthenticated]);

  const handleRefresh = () => {
    fetchEntries(true);
  };

  const handleAddNew = () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Não autenticado",
        description: "Você precisa estar logado para adicionar registros",
      });
      return;
    }
    setCurrentEntry(undefined);
    setFormModalOpen(true);
  };

  const handleEdit = (entry: FinancialEntry) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Não autenticado",
        description: "Você precisa estar logado para editar registros",
      });
      return;
    }
    setCurrentEntry(entry);
    setFormModalOpen(true);
  };

  const handleSubmit = async (values: Partial<NewFinancialEntry>) => {
    try {
      if (!isAuthenticated) {
        toast({
          variant: "destructive",
          title: "Não autenticado",
          description: "Você precisa estar logado para salvar registros",
        });
        return;
      }
      
      setIsSubmitting(true);
      
      // Ensure required fields for new entries
      if (!currentEntry && (!values.nome || !values.valor || !values.data_pagamento)) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios",
        });
        return;
      }
      
      let success;
      
      if (currentEntry) {
        // Updating existing entry
        const updatedEntry = await updateFinancialEntry(currentEntry.id, values);
        success = !!updatedEntry;
        
        if (success) {
          toast({
            title: "Registro atualizado",
            description: "As alterações foram salvas com sucesso",
          });
        }
      } else {
        // Creating new entry - ensure we have the entryType
        const newEntryData = {
          ...values,
          tipo: entryType
        } as NewFinancialEntry;
        
        const newEntry = await createFinancialEntry(newEntryData);
        success = !!newEntry;
        
        if (success) {
          toast({
            title: "Registro criado",
            description: "O novo registro foi criado com sucesso",
          });
        }
      }
      
      if (success) {
        setFormModalOpen(false);
        fetchEntries(); // Refresh the list
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Não foi possível salvar o registro",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar salvar o registro",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <div className="text-4xl font-bold text-muted-foreground mb-2">😕</div>
          <h2 className="text-2xl font-semibold mb-2">
            {!isAuthenticated ? "Não autenticado" : "Falha ao carregar dados"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {!isAuthenticated 
              ? "Você precisa estar logado para acessar essa página." 
              : error}
          </p>
          <Button
            onClick={isAuthenticated ? handleRefresh : () => window.location.href = "/login"}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            {isAuthenticated ? "Tentar Novamente" : "Ir para o Login"}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
          </Button>
        </div>

        <EntryList
          title={title}
          entries={entries}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onRefresh={handleRefresh}
        />
        
        <EntryFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          title={currentEntry ? `Editar ${title}` : `Nova ${title}`}
          entry={currentEntry}
        />
      </div>
    </DashboardLayout>
  );
};

export default FinancialEntriesPage;
