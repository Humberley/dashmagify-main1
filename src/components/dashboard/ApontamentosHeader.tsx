
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarCheck, CalendarMinus, RefreshCcw } from "lucide-react";

interface ApontamentosHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  showForecast?: boolean;
  onToggleForecast?: () => void;
}

const ApontamentosHeader: React.FC<ApontamentosHeaderProps> = ({ 
  onRefresh, 
  isRefreshing,
  showForecast = true,
  onToggleForecast
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">Apontamentos</h1>
      
      <div className="flex flex-wrap gap-2">
        {onToggleForecast && (
          <div className="flex gap-2">
            <Button
              variant={showForecast ? "outline" : "default"}
              size="sm"
              onClick={onToggleForecast}
              className="flex items-center gap-2"
              title="Mostrar apenas realizados"
            >
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Realizados</span>
            </Button>
            
            <Button
              variant={showForecast ? "default" : "outline"}
              size="sm"
              onClick={onToggleForecast}
              className="flex items-center gap-2"
              title="Mostrar previstos e realizados"
            >
              <CalendarMinus className="h-4 w-4" />
              <span className="hidden sm:inline">Incluir Previstos</span>
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>
    </div>
  );
};

export default ApontamentosHeader;
