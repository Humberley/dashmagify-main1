import { supabase } from "@/integrations/supabase/client";

export type FinancialEntryType = 
  | "receita" 
  | "despesa_fixa" 
  | "despesa_variavel" 
  | "investimento" 
  | "divida_parcela";

export interface FinancialEntry {
  id: string;
  user_id: string;
  tipo: FinancialEntryType;
  nome: string;
  descricao: string | null;
  valor: number;
  data_pagamento: string;
  created_at: string;
  updated_at: string;
  recorrente: boolean;
  meses_aplicaveis: number[] | null;
}

export type NewFinancialEntry = {
  tipo: FinancialEntryType;
  nome: string;
  descricao?: string | null;
  valor: number;
  data_pagamento: string;
  recorrente?: boolean;
  meses_aplicaveis?: number[] | null;
};

// Função para formatar o valor para exibição
export const formatCurrencyBR = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Function to get the current user data from localStorage
export const getUserFromLocalStorage = () => {
  try {
    const userData = localStorage.getItem('magify_user');
    if (!userData) return null;
    
    return JSON.parse(userData);
  } catch (error) {
    console.error("Error getting user from localStorage:", error);
    return null;
  }
};

// Função para obter todas as entradas de um tipo específico
export async function getFinancialEntries(tipo: FinancialEntryType): Promise<FinancialEntry[]> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.error("Usuário não autenticado ao buscar entradas financeiras");
      
      // Try to get user from localStorage as fallback
      const localUser = getUserFromLocalStorage();
      if (!localUser?.id) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('entradas_financeiras')
        .select('*')
        .eq('tipo', tipo)
        .eq('user_id', localUser.id)
        .order('data_pagamento', { ascending: true });

      if (error) {
        console.error(`Erro ao buscar entradas do tipo ${tipo}:`, error);
        throw error;
      }
      
      return data as FinancialEntry[] || [];
    }
    
    const { data, error } = await supabase
      .from('entradas_financeiras')
      .select('*')
      .eq('tipo', tipo)
      .eq('user_id', userData.user.id)
      .order('data_pagamento', { ascending: true });

    if (error) {
      console.error(`Erro ao buscar entradas do tipo ${tipo}:`, error);
      throw error;
    }
    
    return data as FinancialEntry[] || [];
  } catch (error) {
    console.error(`Erro ao buscar entradas do tipo ${tipo}:`, error);
    return [];
  }
}

// Função específica para buscar investimentos
export async function getInvestimentos(): Promise<FinancialEntry[]> {
  return getFinancialEntries("investimento");
}

// Função para criar uma nova entrada financeira
export async function createFinancialEntry(entry: NewFinancialEntry): Promise<FinancialEntry | null> {
  try {
    console.log("Criando entrada financeira:", entry);
    
    const { data: userData } = await supabase.auth.getUser();
    let userId: string | undefined;
    
    if (!userData.user) {
      // Try to get user from localStorage as fallback
      const localUser = getUserFromLocalStorage();
      if (!localUser?.id) {
        throw new Error("Usuário não autenticado");
      }
      userId = localUser.id;
    } else {
      userId = userData.user.id;
    }
    
    const { data, error } = await supabase
      .from('entradas_financeiras')
      .insert({
        ...entry,
        user_id: userId,
        recorrente: entry.recorrente !== undefined ? entry.recorrente : true,
        meses_aplicaveis: entry.meses_aplicaveis || null
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar entrada financeira:", error);
      throw error;
    }
    
    console.log("Entrada financeira criada com sucesso:", data);
    return data as FinancialEntry;
  } catch (error) {
    console.error("Exceção ao criar entrada financeira:", error);
    return null;
  }
}

// Função para atualizar uma entrada financeira
export async function updateFinancialEntry(id: string, updates: Partial<NewFinancialEntry>): Promise<FinancialEntry | null> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    let userId: string | undefined;
    
    if (!userData.user) {
      // Try to get user from localStorage as fallback
      const localUser = getUserFromLocalStorage();
      if (!localUser?.id) {
        throw new Error("Usuário não autenticado");
      }
      userId = localUser.id;
    } else {
      userId = userData.user.id;
    }
    
    // Se estiver atualizando a data de pagamento, mantemos o mesmo dia mas com data atual
    if (updates.data_pagamento) {
      const updatedDate = new Date(updates.data_pagamento);
      console.log("Atualizando com data:", updatedDate);
    }
    
    const { data, error } = await supabase
      .from('entradas_financeiras')
      .update({
        ...updates,
        // Ensure we don't set recorrente to undefined
        recorrente: updates.recorrente === undefined 
          ? undefined 
          : updates.recorrente,
        // Set meses_aplicaveis to null if recorrente is true
        meses_aplicaveis: updates.recorrente ? null : updates.meses_aplicaveis
      })
      .eq('id', id)
      .eq('user_id', userId)  // Ensure user can only update their own entries
      .select()
      .single();

    if (error) throw error;
    return data as FinancialEntry;
  } catch (error) {
    console.error("Erro ao atualizar entrada financeira:", error);
    return null;
  }
}

// Função para excluir uma entrada financeira
export async function deleteFinancialEntry(id: string): Promise<boolean> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    let userId: string | undefined;
    
    if (!userData.user) {
      // Try to get user from localStorage as fallback
      const localUser = getUserFromLocalStorage();
      if (!localUser?.id) {
        throw new Error("Usuário não autenticado");
      }
      userId = localUser.id;
    } else {
      userId = userData.user.id;
    }
    
    const { error } = await supabase
      .from('entradas_financeiras')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);  // Ensure user can only delete their own entries

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erro ao excluir entrada financeira:", error);
    return false;
  }
}

// Helper function to determine if a financial entry is applicable for a given month and year
const isEntryApplicableForMonth = (entry: FinancialEntry, monthNumber: number, year: number): boolean => {
  // If the entry is recurring, it applies to all months
  if (entry.recorrente) {
    return true;
  }
  
  // If not recurring, check if it's in the applicable months array
  if (entry.meses_aplicaveis && entry.meses_aplicaveis.includes(monthNumber)) {
    // For non-recurring entries with specific applicable months,
    // we need to check the payment date's year to match it only in the correct year
    if (entry.data_pagamento) {
      try {
        const paymentDate = new Date(entry.data_pagamento);
        const paymentYear = paymentDate.getFullYear();
        
        // Only apply in the specific year from the payment date
        return paymentYear === year;
      } catch (error) {
        console.error("Error parsing payment date:", error);
        return false;
      }
    }
  }
  
  // If it's not recurring and not in applicable months, check if the payment date matches this month and year
  if (!entry.meses_aplicaveis && entry.data_pagamento) {
    try {
      const paymentDate = new Date(entry.data_pagamento);
      const paymentMonth = paymentDate.getMonth() + 1; // 1-12
      const paymentYear = paymentDate.getFullYear();
      
      // Check both month and year match
      return paymentMonth === monthNumber && paymentYear === year;
    } catch (error) {
      console.error("Error parsing payment date:", error);
      return false;
    }
  }
  
  return false;
};

// Função para gerar previsão financeira dos próximos 24 meses
export function generateFinancialForecast(
  receitas: FinancialEntry[],
  despesasFixas: FinancialEntry[],
  despesasVariaveis: FinancialEntry[],
  investimentos: FinancialEntry[],
  dividasParcelas: FinancialEntry[]
): any[] {
  console.log("Generating financial forecast with:", {
    receitas: receitas.length,
    despesasFixas: despesasFixas.length,
    despesasVariaveis: despesasVariaveis.length,
    investimentos: investimentos.length,
    dividasParcelas: dividasParcelas.length
  });
  
  // Array para armazenar os resultados da previsão
  const forecast = [];
  
  // Data atual para iniciar a previsão
  const startDate = new Date();
  
  // Calcular o saldo total de cada mês
  let saldoAcumulado = 0;
  
  // Gerar previsão para os próximos 24 meses
  for (let i = 0; i < 24; i++) {
    // Calcular a data do mês atual na previsão
    const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
    const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    const monthNumber = currentMonth.getMonth() + 1; // 1-12 for January-December
    const currentYear = currentMonth.getFullYear();
    
    console.log(`Processing month ${i+1}: ${monthName} (${monthNumber}/${currentYear})`);
    
    // Filtrar entradas para o mês atual com base na recorrência
    // Now passing the year to the isEntryApplicableForMonth function as well
    const filteredReceitas = receitas.filter(entry => 
      isEntryApplicableForMonth(entry, monthNumber, currentYear));
    
    const filteredDespesasFixas = despesasFixas.filter(entry => 
      isEntryApplicableForMonth(entry, monthNumber, currentYear));
    
    const filteredDespesasVariaveis = despesasVariaveis.filter(entry => 
      isEntryApplicableForMonth(entry, monthNumber, currentYear));
    
    const filteredInvestimentos = investimentos.filter(entry => 
      isEntryApplicableForMonth(entry, monthNumber, currentYear));
    
    const filteredDividasParcelas = dividasParcelas.filter(entry => 
      isEntryApplicableForMonth(entry, monthNumber, currentYear));
    
    console.log(`Month ${monthName} filtered entries:`, {
      receitas: filteredReceitas.length,
      despesasFixas: filteredDespesasFixas.length,
      despesasVariaveis: filteredDespesasVariaveis.length,
      investimentos: filteredInvestimentos.length,
      dividasParcelas: filteredDividasParcelas.length
    });
    
    // Calcular receitas do mês
    const receitasMes = filteredReceitas.reduce((total, receita) => total + receita.valor, 0);
    
    // Calcular despesas fixas do mês
    const despesasFixasMes = filteredDespesasFixas.reduce((total, despesa) => total + despesa.valor, 0);
    
    // Calcular despesas variáveis do mês
    const despesasVariaveisMes = filteredDespesasVariaveis.reduce((total, despesa) => total + despesa.valor, 0);
    
    // Calcular investimentos do mês
    const investimentosMes = filteredInvestimentos.reduce((total, investimento) => total + investimento.valor, 0);
    
    // Calcular dívidas e parcelas do mês
    const dividasParcelasMes = filteredDividasParcelas.reduce((total, divida) => total + divida.valor, 0);
    
    // Calcular o saldo do mês
    const saldoMes = receitasMes - despesasFixasMes - despesasVariaveisMes - investimentosMes - dividasParcelasMes;
    
    // Atualizar saldo acumulado
    saldoAcumulado += saldoMes;
    
    console.log(`Month ${monthName} results:`, {
      receitas: receitasMes,
      despesasFixas: despesasFixasMes,
      despesasVariaveis: despesasVariaveisMes,
      investimentos: investimentosMes,
      dividasParceladas: dividasParcelasMes,
      saldoMes,
      saldoAcumulado
    });
    
    // Adicionar o mês ao forecast
    forecast.push({
      mes: monthName,
      mes_numero: monthNumber,
      receitas: receitasMes,
      despesas_fixas: despesasFixasMes,
      despesas_variaveis: despesasVariaveisMes,
      investimentos: investimentosMes,
      dividas_parcelas: dividasParcelasMes,
      saldo_mes: saldoMes,
      saldo_acumulado: saldoAcumulado
    });
  }
  
  return forecast;
}
