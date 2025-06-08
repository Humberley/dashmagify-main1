
import { useState, useEffect } from "react";
import { fetchUserFinancialData, FinancialRecord, updateFinancialRecord, deleteFinancialRecord } from "@/lib/supabaseUtils";
import { useToast } from "@/hooks/use-toast";

export const useApontamentosData = () => {
  const [data, setData] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getUserEmail = () => {
    const userDataStr = localStorage.getItem('magify_user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return userData.email || null;
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  };

  const loadData = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const userEmail = getUserEmail();
      const financialData = await fetchUserFinancialData(userEmail);
      
      setData(financialData);
      setError(null);
      
      if (showToast) {
        toast({
          title: "Dados atualizados",
          description: "Seus apontamentos foram atualizados",
        });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError("Falha ao carregar os dados financeiros");
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
    setIsLoading(true);
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleUpdateRecord = async (updatedRecord: FinancialRecord) => {
    try {
      const success = await updateFinancialRecord(updatedRecord);
      
      if (success) {
        toast({
          title: "Registro atualizado",
          description: "As alterações foram salvas com sucesso",
        });
        
        // Refresh the data to show the updated record
        await loadData();
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações",
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao atualizar registro:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao tentar atualizar o registro",
      });
      return false;
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const success = await deleteFinancialRecord(recordId);
      
      if (success) {
        toast({
          title: "Registro excluído",
          description: "O registro foi excluído com sucesso",
        });
        
        // Refresh the data to update the list
        await loadData();
        return true;
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Não foi possível excluir o registro",
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao tentar excluir o registro",
      });
      return false;
    }
  };

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    handleRefresh,
    handleUpdateRecord,
    handleDeleteRecord
  };
};
