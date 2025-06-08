
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialRecord } from "@/lib/supabaseUtils";
import CategorySelector from "./category-analysis/CategorySelector";
import CategorySummary from "./category-analysis/CategorySummary";
import TransactionsTable from "./category-analysis/TransactionsTable";
import { useCategoryAnalysis } from "./category-analysis/hooks/useCategoryAnalysis";

interface CategoryAnalysisProps {
  data: FinancialRecord[];
}

const CategoryAnalysis = ({ data }: CategoryAnalysisProps) => {
  const {
    selectedCategory,
    setSelectedCategory,
    categories,
    categoryTotal,
    categoryTransactions,
    isSelectedIncome
  } = useCategoryAnalysis(data);

  useEffect(() => {
    // Log para debug - verificar se temos apontamentos com categorias específicas
    const dividas = data.filter(item => item.classificacao === "Dívidas e Parcelados");
    const cartaoCredito = data.filter(item => item.classificacao === "Pagamento de fatura Cartão de Crédito");
    
    console.log(`Apontamentos de "Dívidas e Parcelados": ${dividas.length}`);
    if (dividas.length > 0) {
      console.log("Exemplo:", dividas[0]);
    }
    
    console.log(`Apontamentos de "Pagamento de fatura Cartão de Crédito": ${cartaoCredito.length}`);
    if (cartaoCredito.length > 0) {
      console.log("Exemplo:", cartaoCredito[0]);
    }
    
    console.log("Total de categorias disponíveis:", categories.length);
    console.log("Lista de categorias:", categories);

    // Verificar se essas categorias estão na lista
    const temDividas = categories.includes("Dívidas e Parcelados");
    const temCartao = categories.includes("Pagamento de fatura Cartão de Crédito");
    console.log("Categoria 'Dívidas e Parcelados' está na lista:", temDividas);
    console.log("Categoria 'Pagamento de fatura Cartão de Crédito' está na lista:", temCartao);
  }, [data, categories]);

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Análise por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CategorySelector 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          
          {selectedCategory ? (
            <div className="mt-4 space-y-4">
              <CategorySummary 
                selectedCategory={selectedCategory}
                isIncome={isSelectedIncome}
                totalAmount={categoryTotal}
              />
              
              <TransactionsTable 
                transactions={categoryTransactions}
                isIncome={isSelectedIncome}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Selecione uma categoria para visualizar seus gastos em detalhe.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryAnalysis;
