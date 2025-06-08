
import { useState, useEffect } from "react";
import { fetchUserFinancialData, FinancialRecord, isIncome, isExpense, isInvestmentWithdrawal } from "@/lib/supabaseUtils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseDate, isDateInMonth, getMonthBoundaries } from "@/lib/utils";

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categories: number;
}

export const useDashboardData = () => {
  const [data, setData] = useState<FinancialRecord[]>([]);
  const [filteredData, setFilteredData] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categories: 0
  });
  
  // Date filter state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isCurrentMonth, setIsCurrentMonth] = useState(true);

  // Filter data by selected month and year - versão melhorada
  const filterDataByMonth = (records: FinancialRecord[], date: Date | undefined) => {
    if (!date || !records.length) return [];
    
    // Obtém o primeiro e o último dia do mês para comparação
    const { firstDay, lastDay } = getMonthBoundaries(date);
    
    console.log(`Filtrando dados para mês: ${date.getMonth() + 1}/${date.getFullYear()}`);
    console.log(`Período: ${firstDay.toISOString()} até ${lastDay.toISOString()}`);
    console.log(`Total de registros antes da filtragem: ${records.length}`);
    
    // Converte as datas de forma mais robusta
    const filtered = records.filter(record => {
      const recordDate = parseDate(record.data_movimentacao);
      
      if (!recordDate) {
        console.log(`Registro ignorado - data inválida: ${record.data_movimentacao}`);
        return false;
      }
      
      // Verifica se a data está dentro do mês selecionado
      const isInSelectedMonth = 
        recordDate.getFullYear() === date.getFullYear() && 
        recordDate.getMonth() === date.getMonth();
        
      if (isInSelectedMonth) {
        console.log(`Registro incluído: ${record.data_movimentacao} - ${record.descricao || record.classificacao}`);
      }
      
      return isInSelectedMonth;
    });
    
    console.log(`Registros filtrados: ${filtered.length}`);
    
    // Log alguns registros filtrados para depuração
    if (filtered.length > 0) {
      console.log("Exemplos de registros filtrados:", 
        filtered.slice(0, Math.min(3, filtered.length)).map(r => ({
          data: r.data_movimentacao,
          valor: r.valor,
          classificacao: r.classificacao,
          descricao: r.descricao
        }))
      );
    } else {
      console.log("ALERTA: Nenhum registro encontrado para este mês!");
      console.log("Mês atual da filtragem:", date.toISOString());
      
      // Log algumas datas disponíveis para depuração
      const availableDates = records
        .filter(r => r.data_movimentacao)
        .map(r => r.data_movimentacao)
        .slice(0, 10);
      
      console.log("Algumas datas disponíveis:", availableDates);
    }
    
    return filtered;
  };

  // Toggle between current month and all data
  const toggleCurrentMonthFilter = () => {
    if (isCurrentMonth) {
      // Show all data
      console.log("Exibindo todos os dados");
      setFilteredData(data);
      setIsCurrentMonth(false);
      calculateStats(data); // Recalcular com todos os dados
    } else {
      // Show only current month
      console.log("Exibindo apenas mês atual");
      const currentDate = new Date();
      const filtered = filterDataByMonth(data, currentDate);
      setFilteredData(filtered);
      setIsCurrentMonth(true);
      setSelectedDate(currentDate);
      calculateStats(filtered); // Recalcular com dados filtrados
    }
  };

  // Handle date selection - versão melhorada
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    console.log(`Data selecionada: ${date.toISOString()}`);
    
    // Quando selecionamos apenas mês/ano, queremos criar uma data no primeiro dia do mês
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    setSelectedDate(firstDayOfMonth);
    
    const filtered = filterDataByMonth(data, firstDayOfMonth);
    setFilteredData(filtered);
    
    // Alterado para false apenas se a data selecionada não for o mês atual
    const currentDate = new Date();
    const isCurrentMonthSelected = 
      firstDayOfMonth.getMonth() === currentDate.getMonth() && 
      firstDayOfMonth.getFullYear() === currentDate.getFullYear();
      
    setIsCurrentMonth(isCurrentMonthSelected);
    
    // Recalcular estatísticas com base nos dados filtrados
    calculateStats(filtered);
  };

  // Busca o e-mail do usuário - Função mantida sem alterações
  const getUserEmail = async () => {
    try {
      // First approach: Try getting from localStorage
      const userDataStr = localStorage.getItem('magify_user');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData.email) {
          console.log("Found user email in localStorage:", userData.email);
          return userData.email;
        }
      }

      // If that fails, try getting from Supabase session
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        console.log("Using email from Supabase auth:", user.email);
        return user.email;
      }
      
      // For development/testing, if all else fails
      const testEmail = "humberleycezilio@gmail.com";
      console.log("⚠️ Using test email:", testEmail);
      return testEmail;
    } catch (e) {
      console.error('Error getting user email:', e);
      return null;
    }
  };

  // Calcular estatísticas - versão melhorada
  const calculateStats = (dataToCalculate: FinancialRecord[]) => {
    console.log(`Calculando estatísticas de ${dataToCalculate.length} registros`);
    
    // Filter out investment withdrawals 
    const filteredData = dataToCalculate.filter(record => !isInvestmentWithdrawal(record));
    
    // Log registro de exemplo para debug
    if (filteredData.length > 0) {
      console.log("Registro de exemplo:", filteredData[0]);
    } else {
      console.log("Sem dados disponíveis para calcular estatísticas");
      // Definir estatísticas zeradas quando não há dados
      setStats({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categories: 0
      });
      return;
    }
    
    // Debug: Log classificações
    const classifications = filteredData
      .filter(item => item.classificacao)
      .map(item => item.classificacao);
      
    const uniqueClassifications = [...new Set(classifications)];
    console.log("Classificações encontradas:", uniqueClassifications);
    
    // Identificar receitas usando a função auxiliar isIncome
    const incomeRecords = filteredData.filter(item => isIncome(item));
    const income = incomeRecords.reduce((sum, item) => sum + Math.abs(item.valor || 0), 0);
    
    console.log(`Total de receitas calculado: ${income} de ${incomeRecords.length} registros`);
    
    // Identificar despesas usando a função auxiliar isExpense
    const expenseRecords = filteredData.filter(item => isExpense(item));
    const expense = expenseRecords.reduce((sum, item) => sum + Math.abs(item.valor || 0), 0);
    
    console.log(`Total de despesas calculado: ${expense} de ${expenseRecords.length} registros`);
    
    // Calcular número de categorias únicas
    const uniqueCategories = new Set(
      filteredData
        .filter(item => item.classificacao)
        .map(item => item.classificacao)
    );
    
    setStats({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      categories: uniqueCategories.size
    });
  };

  // Carregar dados - função com melhorias
  const loadData = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const userEmail = await getUserEmail();
      console.log("Buscando dados para o usuário:", userEmail);
      
      if (!userEmail) {
        setError("Não foi possível identificar o usuário. Tente fazer login novamente.");
        toast({
          variant: "destructive",
          title: "Erro de autenticação",
          description: "Não foi possível identificar o usuário",
        });
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      
      const financialData = await fetchUserFinancialData(userEmail);
      console.log(`Dados financeiros recebidos: ${financialData.length} registros`);
      
      // Log dados de exemplo
      if (financialData.length > 0) {
        const sampleRecords = financialData.slice(0, Math.min(3, financialData.length));
        console.log("Exemplos de registros:", sampleRecords);
        
        // Log formatos de data
        const dateSamples = financialData
          .filter(record => record.data_movimentacao)
          .map(record => record.data_movimentacao)
          .slice(0, 5);
        console.log("Amostras de formato de data:", dateSamples);
      } else {
        console.log("ALERTA: Nenhum dado financeiro encontrado para este usuário");
      }
      
      // Ordenar dados por data_movimentacao (mais recente primeiro)
      const sortedData = [...financialData].sort((a, b) => {
        // Tratar datas nulas
        if (!a.data_movimentacao) return 1;
        if (!b.data_movimentacao) return -1;
        
        const dateA = parseDate(a.data_movimentacao);
        const dateB = parseDate(b.data_movimentacao);
        
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return dateB.getTime() - dateA.getTime();
      });
      
      setData(sortedData);
      
      // Inicialmente, tentar filtrar pelo mês atual
      const currentDate = new Date();
      console.log(`Data atual para filtragem: ${currentDate.toISOString()}`);
      
      const currentMonthData = filterDataByMonth(sortedData, currentDate);
      
      // Se não houver dados para o mês atual, mostrar todos os dados
      if (currentMonthData.length === 0) {
        console.log("Nenhum dado encontrado para o mês atual. Mostrando todos os dados.");
        setFilteredData(sortedData);
        setIsCurrentMonth(false);
        
        // Encontra o mês mais recente com dados disponíveis
        if (sortedData.length > 0) {
          const mostRecentRecord = sortedData[0];
          if (mostRecentRecord.data_movimentacao) {
            const mostRecentDate = parseDate(mostRecentRecord.data_movimentacao);
            if (mostRecentDate) {
              console.log(`Usando mês mais recente disponível: ${mostRecentDate.toISOString()}`);
              setSelectedDate(mostRecentDate);
            }
          }
        }
        
        // Calcular estatísticas com todos os dados
        calculateStats(sortedData);
      } else {
        console.log(`Dados do mês atual: ${currentMonthData.length} registros`);
        setFilteredData(currentMonthData);
        setIsCurrentMonth(true);
        
        // Calcular estatísticas com base nos dados filtrados
        calculateStats(currentMonthData);
      }
      
      setError(null);
      
      if (showToast) {
        toast({
          title: "Dados atualizados",
          description: "Seus dados financeiros foram atualizados",
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
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

  // Efeito para carregar dados iniciais
  useEffect(() => {
    setIsLoading(true);
    loadData();
  }, []);

  return {
    data,
    filteredData,
    isLoading,
    isRefreshing,
    error,
    stats,
    selectedDate,
    isCurrentMonth,
    handleDateSelect,
    toggleCurrentMonthFilter,
    loadData
  };
};

export default useDashboardData;
