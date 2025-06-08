
import { useState, useEffect } from "react";
import { 
  FinancialEntry, 
  getFinancialEntries, 
  generateFinancialForecast, 
} from "@/lib/financeUtils";
import { useToast } from "@/hooks/use-toast";

export const usePrevisaoData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receitas, setReceitas] = useState<FinancialEntry[]>([]);
  const [despesasFixas, setDespesasFixas] = useState<FinancialEntry[]>([]);
  const [despesasVariaveis, setDespesasVariaveis] = useState<FinancialEntry[]>([]);
  const [investimentos, setInvestimentos] = useState<FinancialEntry[]>([]);
  const [dividasParcelas, setDividasParcelas] = useState<FinancialEntry[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchAllData = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Fetch all financial entries
      const receitasData = await getFinancialEntries("receita");
      const despesasFixasData = await getFinancialEntries("despesa_fixa");
      const despesasVariaveisData = await getFinancialEntries("despesa_variavel");
      const investimentosData = await getFinancialEntries("investimento");
      const dividasParcelasData = await getFinancialEntries("divida_parcela");
      
      console.log("Fetched financial data:", {
        receitas: receitasData.length,
        despesasFixas: despesasFixasData.length,
        despesasVariaveis: despesasVariaveisData.length,
        investimentos: investimentosData.length,
        dividasParcelas: dividasParcelasData.length,
      });
      
      // Update state with fetched data
      setReceitas(receitasData);
      setDespesasFixas(despesasFixasData);
      setDespesasVariaveis(despesasVariaveisData);
      setInvestimentos(investimentosData);
      setDividasParcelas(dividasParcelasData);
      
      // Generate forecast based on the data
      const forecastData = generateFinancialForecast(
        receitasData,
        despesasFixasData,
        despesasVariaveisData,
        investimentosData,
        dividasParcelasData
      );
      
      console.log("Generated forecast data:", forecastData);
      setForecast(forecastData);
      
      if (showToast) {
        toast({
          title: "Dados atualizados",
          description: "Sua previsão financeira foi atualizada",
        });
      }
    } catch (err) {
      console.error("Erro ao carregar dados para previsão:", err);
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
    fetchAllData();
  }, []);

  const hasNoEntries = 
    receitas.length === 0 && 
    despesasFixas.length === 0 && 
    despesasVariaveis.length === 0 && 
    investimentos.length === 0 && 
    dividasParcelas.length === 0;

  return {
    isLoading,
    isRefreshing,
    error,
    forecast,
    receitas,
    despesasFixas,
    despesasVariaveis,
    investimentos,
    dividasParcelas,
    hasNoEntries,
    handleRefresh: () => fetchAllData(true)
  };
};
