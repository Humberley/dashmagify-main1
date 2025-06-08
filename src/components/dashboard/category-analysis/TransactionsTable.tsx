
import React from "react";
import { FinancialRecord, formatCurrency } from "@/lib/supabaseUtils";
import { formatDateBR } from "@/lib/utils";
import { CalendarCheck, CalendarMinus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionsTableProps {
  transactions: FinancialRecord[];
  isIncome: boolean;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  isIncome
}) => {
  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Nenhuma transação encontrada para esta categoria.
      </div>
    );
  }

  // Helper to determine if a transaction is forecasted or realized
  const isForecasted = (transaction: FinancialRecord): boolean => {
    // Logic to determine if a transaction is forecasted
    // This is a placeholder - you should replace with your actual logic
    return transaction.tipo_registro === 'previsto';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Data</th>
            <th className="px-4 py-2 text-left text-sm font-medium">Descrição</th>
            <th className="px-4 py-2 text-right text-sm font-medium">Valor</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((item, index) => {
            // Calculate the display value based on whether it's income or expense
            let displayValue = Math.abs(item.valor || 0);
            if (!isIncome) {
              // For expenses, make the display value negative
              displayValue = -displayValue;
            }
            
            const forecasted = isForecasted(item);
            
            return (
              <tr 
                key={index} 
                className={cn(
                  "border-b last:border-b-0 hover:bg-muted/20",
                  forecasted ? "bg-muted/10" : ""
                )}
              >
                <td className="px-4 py-2 text-sm">
                  {forecasted ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CalendarMinus className="h-4 w-4" />
                      <span className="text-xs">Previsto</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-primary">
                      <CalendarCheck className="h-4 w-4" />
                      <span className="text-xs">Realizado</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-sm">
                  {formatDateBR(item.data_movimentacao)}
                </td>
                <td className={cn(
                  "px-4 py-2 text-sm",
                  forecasted ? "text-muted-foreground" : ""
                )}>
                  {item.descricao || 'Sem descrição'}
                </td>
                <td className={cn(
                  "px-4 py-2 text-right font-medium",
                  forecasted 
                    ? isIncome ? "text-green-500/70" : "text-red-500/70"
                    : isIncome ? "text-green-600" : "text-red-600"
                )}>
                  <div className={cn(
                    forecasted ? "text-sm" : "text-base"
                  )}>
                    {formatCurrency(displayValue)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
