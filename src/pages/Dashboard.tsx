import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import RecentTransactionsList from "@/components/dashboard/RecentTransactionsList";
import AlertsSection from "@/components/dashboard/AlertsSection";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DateFilter from "@/components/dashboard/DateFilter";
import StatCards from "@/components/dashboard/StatCards";
import ChartSection from "@/components/dashboard/ChartSection";
import DashboardLoadingState from "@/components/dashboard/DashboardLoadingState";
import DashboardErrorState from "@/components/dashboard/DashboardErrorState";
import CategoryAnalysis from "@/components/dashboard/CategoryAnalysis";
import useDashboardData from "@/hooks/use-dashboard-data";
import {
  FinancialEntry,
  FinancialEntryType,
  getFinancialEntries,
  formatCurrencyBR
} from "@/lib/financeUtils";
import { isIncome, isExpense, isInvestment, isInvestmentWithdrawal } from "@/lib/supabaseUtils";

const Dashboard = () => {
  const {
    filteredData,
    isLoading: isLoadingApontamentos,
    isRefreshing: isRefreshingApontamentos,
    error: errorApontamentos,
    stats,
    selectedDate,
    isCurrentMonth,
    handleDateSelect,
    toggleCurrentMonthFilter,
    loadData: loadApontamentosData
  } = useDashboardData();

  // Estado para entradas financeiras de inputs do usuário
  const [receitas, setReceitas] = useState<FinancialEntry[]>([]);
  const [despesasFixas, setDespesasFixas] = useState<FinancialEntry[]>([]);
  const [despesasVariaveis, setDespesasVariaveis] = useState<FinancialEntry[]>([]);
  const [investimentos, setInvestimentos] = useState<FinancialEntry[]>([]);
  const [dividasParcelas, setDividasParcelas] = useState<FinancialEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [errorEntries, setErrorEntries] = useState<string | null>(null);

  // Buscar todas as entradas financeiras
  const fetchFinancialEntries = async () => {
    try {
      setIsLoadingEntries(true);
      
      // Buscar todos os tipos de entradas
      const [
        receitasData,
        despesasFixasData,
        despesasVariaveisData,
        investimentosData,
        dividasParcelasData
      ] = await Promise.all([
        getFinancialEntries("receita"),
        getFinancialEntries("despesa_fixa"),
        getFinancialEntries("despesa_variavel"),
        getFinancialEntries("investimento"),
        getFinancialEntries("divida_parcela")
      ]);
      
      setReceitas(receitasData);
      setDespesasFixas(despesasFixasData);
      setDespesasVariaveis(despesasVariaveisData);
      setInvestimentos(investimentosData);
      setDividasParcelas(dividasParcelasData);
      setErrorEntries(null);
    } catch (err) {
      console.error('Erro ao carregar entradas financeiras:', err);
      setErrorEntries("Falha ao carregar os dados das entradas financeiras");
    } finally {
      setIsLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchFinancialEntries();
  }, []);

  const handleRefresh = () => {
    loadApontamentosData(true);
    fetchFinancialEntries();
  };

  // Filtrar entradas financeiras com base no mês selecionado
  const filterEntriesByMonth = (entries: FinancialEntry[]) => {
    if (!selectedDate) return [];
    const monthNumber = selectedDate.getMonth() + 1; // Converte para 1-12
    
    return entries.filter(entry => 
      entry.recorrente || 
      (entry.meses_aplicaveis && entry.meses_aplicaveis.includes(monthNumber))
    );
  };

  // Aplicar filtros com base no mês selecionado
  const filteredReceitas = filterEntriesByMonth(receitas);
  const filteredDespesasFixas = filterEntriesByMonth(despesasFixas);
  const filteredDespesasVariaveis = filterEntriesByMonth(despesasVariaveis);
  const filteredInvestimentos = filterEntriesByMonth(investimentos);
  const filteredDividasParcelas = filterEntriesByMonth(dividasParcelas);

  // Calcular totais com base nos dados filtrados
  const totalReceitas = filteredReceitas.reduce((sum, item) => sum + item.valor, 0);
  const totalDespesasFixas = filteredDespesasFixas.reduce((sum, item) => sum + item.valor, 0);
  const totalDespesasVariaveis = filteredDespesasVariaveis.reduce((sum, item) => sum + item.valor, 0);
  const totalInvestimentos = filteredInvestimentos.reduce((sum, item) => sum + item.valor, 0);
  const totalDividasParcelas = filteredDividasParcelas.reduce((sum, item) => sum + item.valor, 0);
  
  // Calcular despesas totais e saldo
  const totalDespesas = totalDespesasFixas + totalDespesasVariaveis + totalDividasParcelas;
  const saldoMensal = totalReceitas - totalDespesas - totalInvestimentos;

  // Preparar dados para passar para StatCards
  const plannedData = {
    totalReceitas,
    totalDespesasFixas,
    totalDespesasVariaveis,
    totalInvestimentos,
    totalDividasParcelas,
    saldoMensal
  };

  // Calcular dados reais a partir dos apontamentos
  const realData = filteredData
    .filter(record => !isInvestmentWithdrawal(record)) // Filter out investment withdrawals
    .reduce((acc, record) => {
      const value = Math.abs(record.valor || 0);
      
      if (isIncome(record)) {
        acc.totalReceitas += value;
      } else if (isExpense(record)) {
        // Separar despesas fixas e variáveis
        if (record.classificacao?.startsWith('Fixa:')) {
          acc.totalDespesasFixas += value;
        } else if (record.classificacao?.startsWith('Variável:')) {
          acc.totalDespesasVariaveis += value;
        } else if (
          record.classificacao === 'Dívidas e Parcelados' || 
          record.classificacao === 'Pagamento de fatura Cartão de Crédito'
        ) {
          acc.totalDividasParcelas += value;
        }
      } else if (isInvestment(record)) {
        acc.totalInvestimentos += value;
      }
      
      return acc;
    }, {
      totalReceitas: 0,
      totalDespesasFixas: 0,
      totalDespesasVariaveis: 0,
      totalInvestimentos: 0,
      totalDividasParcelas: 0,
      get saldoMensal() {
        return this.totalReceitas - this.totalDespesasFixas - this.totalDespesasVariaveis - this.totalDividasParcelas - this.totalInvestimentos;
      }
    });

  if (isLoadingApontamentos || isLoadingEntries) {
    return (
      <DashboardLayout>
        <DashboardLoadingState />
      </DashboardLayout>
    );
  }

  if (errorApontamentos && errorEntries) {
    return (
      <DashboardLayout>
        <DashboardErrorState error="Falha ao carregar os dados financeiros" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader 
          onRefresh={handleRefresh} 
          isRefreshing={isRefreshingApontamentos} 
        />
        
        <DateFilter 
          selectedDate={selectedDate}
          isCurrentMonth={isCurrentMonth}
          onDateSelect={handleDateSelect}
          onToggleCurrentMonth={toggleCurrentMonthFilter}
        />
        
        <AlertsSection data={filteredData} />

        <StatCards stats={stats} plannedData={plannedData} realData={realData} />
        
        <ChartSection data={filteredData} />
        
        <CategoryAnalysis data={filteredData} />
        
        <RecentTransactionsList data={filteredData} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
