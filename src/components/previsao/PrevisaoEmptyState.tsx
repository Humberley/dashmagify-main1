
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PrevisaoEmptyStateProps {
  hasNoEntries: boolean;
}

const PrevisaoEmptyState = ({ hasNoEntries }: PrevisaoEmptyStateProps) => {
  if (!hasNoEntries) return null;
  
  return (
    <Alert variant="warning">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Não foram encontradas entradas financeiras. Adicione receitas, despesas e outros itens para gerar uma previsão.
      </AlertDescription>
    </Alert>
  );
};

export default PrevisaoEmptyState;
