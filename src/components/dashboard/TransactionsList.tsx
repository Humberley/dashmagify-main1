
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/supabaseUtils";

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: string;
  category: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
}

const TransactionsList = ({ transactions }: TransactionsListProps) => {
  // Get the icon and background color based on transaction category
  const getCategoryStyle = (category: string) => {
    if (category.startsWith('Receita:')) {
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        icon: '+'
      };
    } else if (category.startsWith('Fixa:')) {
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        icon: 'F'
      };
    } else if (category.startsWith('Variável:')) {
      return {
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600',
        icon: 'V'
      };
    } else if (category === 'Pagamento de fatura Cartão de Crédito') {
      return {
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-600',
        icon: 'C'
      };
    } else if (category === 'Dívidas e Parcelados') {
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
        icon: 'D'
      };
    } else if (category === 'Investimentos') {
      return {
        bgColor: 'bg-teal-100',
        textColor: 'text-teal-600',
        icon: 'I'
      };
    }
    
    // Default style for other categories
    return {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      icon: '?'
    };
  };

  // Format category display name (remove Fixa:, Variável: prefixes)
  const formatCategoryName = (category: string): string => {
    if (category.startsWith("Fixa: ")) {
      return category.replace("Fixa: ", "");
    } else if (category.startsWith("Variável: ")) {
      return category.replace("Variável: ", "");
    } else if (category.startsWith("Receita: ")) {
      return category.replace("Receita: ", "");
    }
    return category;
  };

  return (
    <Card className="magify-card">
      <CardHeader>
        <CardTitle className="text-lg">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const categoryStyle = getCategoryStyle(transaction.category);
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${categoryStyle.bgColor} ${categoryStyle.textColor}`}
                  >
                    {categoryStyle.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{transaction.description}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatCategoryName(transaction.category)} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div
                  className={transaction.type === "income" ? "text-green-600 font-medium" : "text-red-600 font-medium"}
                >
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            );
          })}
          
          {transactions.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma transação para exibir
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsList;
