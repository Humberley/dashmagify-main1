import { useMemo } from "react";
import { FinancialRecord, formatCurrency, isIncome as isIncomeUtil } from "@/lib/supabaseUtils";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { formatDateBR } from "@/lib/utils";

interface RecentTransactionsListProps {
  data: FinancialRecord[];
  limit?: number;
}

const RecentTransactionsList = ({ data, limit = 5 }: RecentTransactionsListProps) => {
  // Determine if a record is an income - Now importing this from utilities
  const isIncome = (record: FinancialRecord): boolean => {
    return isIncomeUtil(record);
  };
  
  // Get the icon and background color based on transaction category
  const getCategoryStyle = (category: string) => {
    if (category?.startsWith('Receita:')) {
      return {
        bgColor: 'bg-green-500',
        textColor: 'text-white',
        icon: '+'
      };
    } else if (category?.startsWith('Fixa:')) {
      return {
        bgColor: 'bg-blue-500',
        textColor: 'text-white',
        icon: 'F'
      };
    } else if (category?.startsWith('Variável:')) {
      return {
        bgColor: 'bg-purple-500',
        textColor: 'text-white',
        icon: 'V'
      };
    } else if (category === 'Pagamento de fatura Cartão de Crédito') {
      return {
        bgColor: 'bg-orange-500',
        textColor: 'text-white',
        icon: 'C'
      };
    } else if (category === 'Dívidas e Parcelados') {
      return {
        bgColor: 'bg-red-500',
        textColor: 'text-white',
        icon: 'D'
      };
    } else if (category === 'Investimentos') {
      return {
        bgColor: 'bg-teal-500',
        textColor: 'text-white',
        icon: 'I'
      };
    }
    
    // Default para outras categorias
    return {
      bgColor: 'bg-gray-500', 
      textColor: 'text-white', 
      icon: '?'
    };
  };

  // Format date using the utility function to ensure consistent Brazilian date format
  const formatDate = (dateStr: string) => {
    try {
      return formatDateBR(dateStr);
    } catch (e) {
      return "-";
    }
  };

  // Format category display name
  const formatCategoryName = (category: string): string => {
    if (!category) return 'Não classificado';
    
    if (category.startsWith("Fixa: ")) {
      return category.replace("Fixa: ", "");
    } else if (category.startsWith("Variável: ")) {
      return category.replace("Variável: ", "");
    } else if (category.startsWith("Receita: ")) {
      return category.replace("Receita: ", "");
    }
    return category;
  };

  const transactions = useMemo(() => {
    // Filter valid transactions (with date and value)
    const validTransactions = data.filter(record => 
      record.data_movimentacao && record.valor !== undefined && record.valor !== null
    );
    
    // Sort by date (newest first)
    const sorted = [...validTransactions].sort((a, b) => {
      if (!a.data_movimentacao) return 1;
      if (!b.data_movimentacao) return -1;
      return new Date(b.data_movimentacao).getTime() - new Date(a.data_movimentacao).getTime();
    });
    
    // Map to display format and limit
    return sorted.slice(0, limit).map((record, index) => ({
      id: record.id || index,
      description: record.descricao || record.classificacao || 'Transação',
      amount: record.valor,
      date: record.data_movimentacao,
      type: isIncome(record) ? "income" : "expense",
      category: record.classificacao || 'Não classificado'
    }));
  }, [data, limit]);

  return (
    <Card className="shadow-md border-muted/40">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((transaction) => {
              const categoryStyle = getCategoryStyle(transaction.category);
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white border border-muted/40 shadow-sm hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${categoryStyle.bgColor} ${categoryStyle.textColor} shadow-sm`}
                    >
                      <span className="font-semibold">{categoryStyle.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatCategoryName(transaction.category)} • {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-medium ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-[150px] bg-gray-50 rounded-lg">
              <p className="text-center text-muted-foreground py-4">Nenhuma transação para exibir</p>
            </div>
          )}
        </div>
      </CardContent>
      {transactions.length > 0 && (
        <CardFooter className="border-t pt-4">
          <Link to="/apontamentos" className="text-sm text-primary font-medium hover:underline">
            Ver todas as transações
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};

export default RecentTransactionsList;
