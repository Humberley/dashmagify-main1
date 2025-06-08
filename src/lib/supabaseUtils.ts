import { supabase } from "@/integrations/supabase/client";
import { parseDate } from "@/lib/utils";

export interface FinancialRecord {
  id: string;
  email: string;
  valor: number;
  data_movimentacao: string | null;
  classificacao: string | null;
  forma_pagamento: string | null;
  descricao: string | null;
  identificacao: string | null;
  tipo_registro: string | null;
  parcelado: boolean | null;
  data_criacao: string | null;
}

export async function fetchUserFinancialData(userEmail: string | null): Promise<FinancialRecord[]> {
  if (!userEmail) {
    console.error("No user email provided for financial data fetch");
    return [];
  }

  try {
    // Log the email we're using to query data
    console.log("Fetching financial data for email:", userEmail);
    
    const { data, error } = await supabase
      .from('historico_financeiro')
      .select('*')
      .eq('email', userEmail);

    if (error) {
      console.error("Error fetching financial data from Supabase:", error);
      throw error;
    }

    console.log("Financial data fetched from Supabase:", data?.length || 0, "records");
    
    // If no data was found, log more details to help debug
    if (!data || data.length === 0) {
      console.log("No financial records found for this email. Check if the email matches records in the database.");
    } else {
      // Log sample data to verify structure
      console.log("Sample record:", data[0]);
      
      // Log classifications for debugging
      const classifications = data
        .map(record => record.classificacao)
        .filter(Boolean)
        .slice(0, 20);
      console.log("Sample classifications:", classifications);
    }
    
    // Process the data to convert the text value to number
    const processedData = data?.map(record => ({
      ...record,
      valor: record.valor ? parseFloat(record.valor) : null
    })) || [];
    
    return processedData;
  } catch (error) {
    console.error("Exception when fetching financial data:", error);
    throw error;
  }
}

// Determine if a record is an income based on classification
export function isIncome(record: FinancialRecord): boolean {
  if (!record.classificacao) return false;
  
  // Check if classification starts with "Receita:"
  return record.classificacao.startsWith('Receita:');
}

// Determine if a record is an expense based on classification
export function isExpense(record: FinancialRecord): boolean {
  if (!record.classificacao) return false;
  
  // Check if classification starts with "Fixa:" or "Variável:"
  // or is explicitly "Dívidas e Parcelados" or "Pagamento de fatura Cartão de Crédito"
  return (
    record.classificacao.startsWith('Fixa:') || 
    record.classificacao.startsWith('Variável:') ||
    record.classificacao === 'Dívidas e Parcelados' ||
    record.classificacao === 'Pagamento de fatura Cartão de Crédito'
  );
}

// Determine if a record is an investment
export function isInvestment(record: FinancialRecord): boolean {
  // Check for investment classification
  if (record.classificacao === 'Investimentos') {
    return true;
  }
  
  // Check if it's a regular investment entry
  return false;
}

// Determine if a record is an investment withdrawal
export function isInvestmentWithdrawal(record: FinancialRecord): boolean {
  // Check for withdrawal type or description
  return (
    record.tipo_registro === 'resgate_investimento' ||
    (record.descricao?.toLowerCase().includes('resgate') && 
     record.classificacao?.toLowerCase().includes('investimento'))
  );
}

// Get the adjusted value based on the record type
export function getAdjustedValue(record: FinancialRecord): number {
  // Get the absolute value
  const absValue = Math.abs(record.valor || 0);
  
  // If it's an income, make it positive, otherwise negative
  if (isIncome(record)) {
    return absValue;
  } else if (isExpense(record) || isInvestment(record)) {
    return -absValue;
  }
  
  // Default: Return the original value
  return record.valor || 0;
}

// Aggregate expense data by category for the pie chart
export function aggregateExpensesByCategory(data: FinancialRecord[]): { category: string; amount: number }[] {
  const expensesOnly = data.filter(isExpense);
  
  console.log(`Found ${expensesOnly.length} expense records for aggregation`);
  
  const categoryMap = new Map<string, number>();
  
  expensesOnly.forEach(expense => {
    const category = expense.classificacao || "Não classificado";
    const amount = Math.abs(expense.valor || 0);
    
    const currentAmount = categoryMap.get(category) || 0;
    categoryMap.set(category, currentAmount + amount);
  });
  
  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount
  })).sort((a, b) => b.amount - a.amount);
}

// Get transactions formatted for the transaction list
export function getFormattedTransactions(data: FinancialRecord[], limit = 10): any[] {
  return data
    .filter(record => record.data_movimentacao && record.valor)
    .map((record, index) => ({
      id: record.id || index,
      description: record.descricao || record.classificacao || 'Transação',
      amount: record.valor,
      date: record.data_movimentacao,
      type: isIncome(record) ? "income" : "expense",
      category: record.classificacao || 'Não classificado'
    }))
    .sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);
}

// Format currency values
export function formatCurrency(value: number | undefined): string {
  if (value === undefined || value === null) return "R$ 0,00";
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Calculate monthly totals for income and expenses
export function calculateMonthlyTotals(data: FinancialRecord[]) {
  const monthlyData: Record<string, {income: number, expense: number}> = {};
  
  data.forEach(record => {
    if (!record.data_movimentacao || record.valor === null || record.valor === undefined) return;
    
    const date = parseDate(record.data_movimentacao);
    if (!date) return;
    
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 };
    }
    
    if (isIncome(record)) {
      monthlyData[monthYear].income += Math.abs(record.valor);
    } else if (isExpense(record)) {
      monthlyData[monthYear].expense += Math.abs(record.valor);
    }
  });
  
  // Convert to array for chart
  return Object.entries(monthlyData)
    .map(([month, values]) => {
      // Extrair ano e mês
      const [year, monthNum] = month.split('-');
      // Criar array de nomes de meses abreviados
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      return {
        month: `${monthNames[parseInt(monthNum) - 1]}/${year.slice(2)}`,
        income: values.income,
        expense: values.expense
      };
    })
    .sort((a, b) => {
      // Ordenar pelo ano e mês
      const [monthA, yearA] = a.month.split('/');
      const [monthB, yearB] = b.month.split('/');
      
      // Comparar primeiro pelo ano, depois pelo mês
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      
      // Converter abreviação de mês para índice
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
    });
}

// Get expense categories grouped by type (fixed, variable)
export function getCategorizedExpenses(data: FinancialRecord[]): {
  fixed: { category: string; amount: number }[];
  variable: { category: string; amount: number }[];
  creditCard: { category: string; amount: number }[];
  debts: { category: string; amount: number }[];
} {
  const expensesOnly = data.filter(isExpense);
  
  const fixedExpenses = new Map<string, number>();
  const variableExpenses = new Map<string, number>();
  const creditCardPayments = new Map<string, number>();
  const debtsAndInstallments = new Map<string, number>();
  
  expensesOnly.forEach(expense => {
    const category = expense.classificacao || "Não classificado";
    const amount = Math.abs(expense.valor || 0);
    
    if (category.startsWith('Fixa:')) {
      const currentAmount = fixedExpenses.get(category) || 0;
      fixedExpenses.set(category, currentAmount + amount);
    } else if (category.startsWith('Variável:')) {
      const currentAmount = variableExpenses.get(category) || 0;
      variableExpenses.set(category, currentAmount + amount);
    } else if (category === 'Pagamento de fatura Cartão de Crédito') {
      const currentAmount = creditCardPayments.get(category) || 0;
      creditCardPayments.set(category, currentAmount + amount);
    } else if (category === 'Dívidas e Parcelados') {
      const currentAmount = debtsAndInstallments.get(category) || 0;
      debtsAndInstallments.set(category, currentAmount + amount);
    }
  });
  
  return {
    fixed: Array.from(fixedExpenses.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    variable: Array.from(variableExpenses.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    creditCard: Array.from(creditCardPayments.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    debts: Array.from(debtsAndInstallments.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}

// Add the updateFinancialRecord function to the exports
export async function updateFinancialRecord(record: FinancialRecord): Promise<boolean> {
  try {
    console.log("Updating financial record:", record);
    
    const { error } = await supabase
      .from('historico_financeiro')
      .update({
        descricao: record.descricao,
        classificacao: record.classificacao,
        forma_pagamento: record.forma_pagamento,
        data_movimentacao: record.data_movimentacao,
        valor: record.valor?.toString() // Convert number to string to match the database schema
      })
      .eq('id', record.id);
    
    if (error) {
      console.error("Erro ao atualizar registro financeiro:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exceção ao atualizar registro financeiro:", error);
    return false;
  }
}

// Delete financial record
export async function deleteFinancialRecord(recordId: string): Promise<boolean> {
  try {
    console.log("Deleting financial record with ID:", recordId);
    
    const { error } = await supabase
      .from('historico_financeiro')
      .delete()
      .eq('id', recordId);
    
    if (error) {
      console.error("Erro ao excluir registro financeiro:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exceção ao excluir registro financeiro:", error);
    return false;
  }
}
