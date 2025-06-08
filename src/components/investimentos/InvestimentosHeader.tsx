
import { Button } from "@/components/ui/button";
import { formatCurrencyBR } from "@/lib/financeUtils";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";

interface InvestimentosHeaderProps {
  totalInvestido: number;
  totalValorAtual: number;
  onRefresh: () => void;
  isLoading: boolean;
  onAddWithdrawal?: () => void;
}

const InvestimentosHeader = ({ 
  totalInvestido, 
  totalValorAtual,
  onRefresh, 
  isLoading,
  onAddWithdrawal
}: InvestimentosHeaderProps) => {
  const rendimento = totalValorAtual - totalInvestido;
  const rendimentoPercent = totalInvestido > 0 
    ? (rendimento / totalInvestido) * 100
    : 0;
    
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investimentos</h1>
        <p className="text-muted-foreground">
          Gerencie seus investimentos e acompanhe seu patrimônio financeiro
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row items-end gap-4">
        <div className="bg-green-100 p-3 rounded-lg">
          <p className="text-2xl font-bold text-green-700">
            {formatCurrencyBR(totalValorAtual)}
          </p>
        </div>
        
        <div className="flex gap-2">
          {onAddWithdrawal && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAddWithdrawal}
              className="flex items-center gap-2"
            >
              <TrendingDown className="h-4 w-4" />
              Registrar Resgate
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvestimentosHeader;
