
import { useMemo, useState } from "react";
import { FinancialRecord } from "@/lib/supabaseUtils";

export const useCategoryAnalysis = (data: FinancialRecord[]) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  // Extract all unique categories from the data
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    
    // Certifica-se de capturar todas as categorias, mesmo aquelas sem transações
    // Lista completa de todas as categorias possíveis
    const allPossibleCategories = [
      // Receitas
      "Receita: Salário",
      "Receita: Outras",
      "Receita: Aposentadoria",
      
      // Fixas
      "Fixa: Banco",
      "Fixa: Carro",
      "Fixa: Comunicação",
      "Fixa: Educação",
      "Fixa: Habitação",
      "Fixa: Outras",
      "Fixa: Saúde",
      "Fixa: Lazer",
      
      // Variáveis
      "Variável: Carro",
      "Variável: Educação",
      "Variável: Entretenimento",
      "Variável: Habitação",
      "Variável: Lazer",
      "Variável: Outros",
      "Variável: Pet",
      "Variável: Presentes",
      "Variável: Saúde",
      "Variável: Trabalho",
      "Variável: Transporte",
      "Variável: Vestuário",
      "Variável: Viagem",
      "Variável: Estética",
      "Variável: Mercado",
      
      // Outros - garantimos que estas categorias específicas sejam incluídas
      "Dívidas e Parcelados",
      "Pagamento de fatura Cartão de Crédito",
      "Investimentos"
    ];
    
    // Primeiro adiciona todas as categorias predefinidas
    allPossibleCategories.forEach(category => {
      uniqueCategories.add(category);
    });
    
    // Depois adiciona quaisquer categorias extras dos dados que não estejam na lista
    data.forEach(item => {
      if (item.classificacao) {
        // Normalize e adicione a categoria (pode precisar verificar caixa/espaços)
        uniqueCategories.add(item.classificacao);
      }
    });
    
    // Verificação extra para garantir que essas categorias específicas estejam presentes
    uniqueCategories.add("Dívidas e Parcelados");
    uniqueCategories.add("Pagamento de fatura Cartão de Crédito");
    
    return Array.from(uniqueCategories).sort();
  }, [data]);
  
  // Calculate total amount spent in the selected category
  const categoryTotal = useMemo(() => {
    if (!selectedCategory) return 0;
    
    console.log(`Calculando total para categoria: ${selectedCategory}`);
    
    // Verifique se a string da categoria corresponde exatamente
    const categoryTransactions = data.filter(item => {
      const matchExact = item.classificacao === selectedCategory;
      if (matchExact) {
        console.log(`Encontrado registro para categoria "${selectedCategory}": ${item.descricao}`);
      }
      return matchExact;
    });
    
    console.log(`Encontrados ${categoryTransactions.length} registros para categoria "${selectedCategory}"`);
    
    const totalAmount = categoryTransactions.reduce((sum, item) => {
      const value = Math.abs(item.valor || 0);
      console.log(`Registro: ${item.descricao}, valor: ${value}`);
      return sum + value;
    }, 0);
    
    console.log(`Total calculado para categoria "${selectedCategory}": ${totalAmount}`);
    return totalAmount;
  }, [selectedCategory, data]);
  
  // Get transactions for the selected category
  const categoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    
    // Verifique se a string da categoria corresponde exatamente
    const transactions = data
      .filter(item => item.classificacao === selectedCategory)
      .sort((a, b) => {
        // Sort by date descending
        const dateA = a.data_movimentacao ? new Date(a.data_movimentacao) : new Date(0);
        const dateB = b.data_movimentacao ? new Date(b.data_movimentacao) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    
    console.log(`Transações para categoria "${selectedCategory}": ${transactions.length}`);
    if (transactions.length > 0) {
      console.log("Primeira transação:", transactions[0]);
    }
    
    return transactions;
  }, [selectedCategory, data]);

  // Determine if the selected category is income
  const isSelectedIncome = useMemo(() => {
    return selectedCategory?.startsWith('Receita:') || false;
  }, [selectedCategory]);

  return {
    selectedCategory,
    setSelectedCategory,
    categories,
    categoryTotal,
    categoryTransactions,
    isSelectedIncome
  };
};

export default useCategoryAnalysis;
