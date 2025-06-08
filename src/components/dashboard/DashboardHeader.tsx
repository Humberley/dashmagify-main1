
import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const DashboardHeader = ({ onRefresh, isRefreshing }: DashboardHeaderProps) => {
  const currentDate = new Date();
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-2xl md:text-3xl font-bold">Dashboard Financeiro</h1>
      <div className="flex items-center gap-2">
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
        <p className="text-sm text-muted-foreground hidden sm:block">
          Última atualização: {currentDate.toLocaleDateString('pt-BR')} às {currentDate.toLocaleTimeString('pt-BR')}
        </p>
      </div>
    </div>
  );
};

export default DashboardHeader;
