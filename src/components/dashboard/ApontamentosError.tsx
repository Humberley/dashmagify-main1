
import { Button } from "@/components/ui/button";

interface ApontamentosErrorProps {
  message?: string;
}

const ApontamentosError = ({ message }: ApontamentosErrorProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-center">
      <div className="text-4xl font-bold text-muted-foreground mb-2">😕</div>
      <h2 className="text-2xl font-semibold mb-2">Falha ao carregar dados</h2>
      <p className="text-muted-foreground mb-6">
        {message || "Não foi possível carregar seus apontamentos no momento."}
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
      >
        Atualizar
      </Button>
    </div>
  );
};

export default ApontamentosError;
