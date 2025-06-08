
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/supabaseUtils";
import { formatCurrencyBR } from "@/lib/financeUtils";

interface StatCardItemProps {
  title: string;
  icon: ReactNode;
  realValue: number;
  plannedValue: number;
  isIncome?: boolean;
  description?: string;
}

const StatCardItem = ({ 
  title, 
  icon, 
  realValue, 
  plannedValue, 
  isIncome = false,
  description
}: StatCardItemProps) => {
  // Determine text color based on whether it's an income or expense type
  // Saldo is a special case that can be positive or negative
  const getTextColorClass = (value: number, isBalanceCard = false) => {
    if (isBalanceCard) {
      return value >= 0 ? 'text-green-600' : 'text-red-600';
    }
    return isIncome ? 'text-green-600' : 'text-red-600';
  };

  const getPlannedTextColorClass = (value: number, isBalanceCard = false) => {
    if (isBalanceCard) {
      return value >= 0 ? 'text-green-500/70' : 'text-red-500/70';
    }
    return isIncome ? 'text-green-500/70' : 'text-red-500/70';
  };

  const isBalanceCard = title === "Saldo";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
          {title}
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground">Previsto</p>
            <div className={`text-lg font-medium ${getPlannedTextColorClass(plannedValue, isBalanceCard)}`}>
              {formatCurrencyBR(plannedValue)}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">Realizado</p>
            <div className={`text-2xl font-bold ${getTextColorClass(realValue, isBalanceCard)}`}>
              {formatCurrency(realValue)}
            </div>
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground pt-1 border-t border-muted">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCardItem;
