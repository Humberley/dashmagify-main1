
import { FinancialEntry, formatCurrencyBR } from "@/lib/financeUtils";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck, CalendarClock, Calendar } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DailyFinancialDetailsProps {
  receitas: FinancialEntry[];
  despesas: FinancialEntry[];
}

const DailyFinancialDetails = ({ receitas, despesas }: DailyFinancialDetailsProps) => {
  // Função para formatar o tipo de entrada financeira
  const formatarTipo = (tipo: string) => {
    const tiposMap: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
      receita: { label: "Receita", variant: "default" },
      despesa_fixa: { label: "Despesa Fixa", variant: "destructive" },
      despesa_variavel: { label: "Despesa Variável", variant: "secondary" },
      divida_parcela: { label: "Dívida/Parcela", variant: "outline" },
    };
    
    return tiposMap[tipo] || { label: tipo, variant: "default" };
  };

  // Renderizar ícone com base na recorrência
  const renderRecorrenciaIcon = (recorrente: boolean) => {
    if (recorrente) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <CalendarClock className="h-4 w-4 text-blue-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Recorrente</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Calendar className="h-4 w-4 text-gray-500" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Única</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Separar despesas variáveis das outras despesas
  const despesasFixas = despesas.filter(d => d.tipo !== "despesa_variavel");
  const despesasVariaveis = despesas.filter(d => d.tipo === "despesa_variavel");

  return (
    <div className="space-y-4 p-4 bg-muted/20 border rounded-md text-sm">
      {receitas.length > 0 && (
        <div>
          <h4 className="text-green-600 font-semibold mb-2 flex items-center gap-1">
            Receitas ({receitas.length})
          </h4>
          <div className="space-y-2">
            {receitas.map((receita) => (
              <div key={receita.id} className="flex flex-wrap justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-md border gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex-none">{renderRecorrenciaIcon(receita.recorrente)}</div>
                  <div>
                    <p className="font-medium">{receita.nome}</p>
                    {receita.descricao && <p className="text-xs text-muted-foreground">{receita.descricao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/20">
                    {formatCurrencyBR(receita.valor)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {despesasFixas.length > 0 && (
        <div>
          <h4 className="text-red-600 font-semibold mb-2 flex items-center gap-1">
            Despesas Fixas ({despesasFixas.length})
          </h4>
          <div className="space-y-2">
            {despesasFixas.map((despesa) => (
              <div key={despesa.id} className="flex flex-wrap justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-md border gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex-none">{renderRecorrenciaIcon(despesa.recorrente)}</div>
                  <div>
                    <p className="font-medium">{despesa.nome}</p>
                    {despesa.descricao && <p className="text-xs text-muted-foreground">{despesa.descricao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={formatarTipo(despesa.tipo).variant} className="bg-red-50 text-red-600 dark:bg-red-900/20">
                    {formatCurrencyBR(despesa.valor)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {formatarTipo(despesa.tipo).label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {despesasVariaveis.length > 0 && (
        <div>
          <h4 className="text-amber-600 font-semibold mb-2 flex items-center gap-1">
            Despesas Variáveis ({despesasVariaveis.length})
          </h4>
          <div className="p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-md mb-2">
            <p className="text-xs">
              As despesas variáveis são distribuídas ao longo do mês e não têm um dia específico.
              São incluídas no planejamento para fins de cálculo de saldo.
            </p>
          </div>
          <div className="space-y-2">
            {despesasVariaveis.map((despesa) => (
              <div key={despesa.id} className="flex flex-wrap justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-md border border-dashed border-amber-300 gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex-none">{renderRecorrenciaIcon(despesa.recorrente)}</div>
                  <div>
                    <p className="font-medium">{despesa.nome}</p>
                    {despesa.descricao && <p className="text-xs text-muted-foreground">{despesa.descricao}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-amber-50 text-amber-600 dark:bg-amber-900/20">
                    {formatCurrencyBR(despesa.valor)}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-amber-300">
                    Despesa Variável
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {receitas.length === 0 && despesas.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          <p>Nenhuma movimentação financeira registrada para este dia.</p>
        </div>
      )}
    </div>
  );
};

export default DailyFinancialDetails;
