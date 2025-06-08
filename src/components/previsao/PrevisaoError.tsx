
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";

interface PrevisaoErrorProps {
  error: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const PrevisaoError = ({ error, onRefresh, isRefreshing }: PrevisaoErrorProps) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center h-[30vh] text-center">
        <div className="text-4xl font-bold text-muted-foreground mb-2">😕</div>
        <h2 className="text-2xl font-semibold mb-2">Falha ao carregar dados</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível carregar suas informações financeiras no momento.
        </p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Erro: {error}
        </p>
      </div>
    </Card>
  );
};

export default PrevisaoError;
