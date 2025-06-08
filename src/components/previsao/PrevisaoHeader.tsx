
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrevisaoHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const PrevisaoHeader = ({
  onRefresh,
  isRefreshing
}: PrevisaoHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">Previsão</h1>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </Button>
      </div>
    </div>
  );
};

export default PrevisaoHeader;
