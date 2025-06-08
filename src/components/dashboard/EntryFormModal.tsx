
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import FinancialEntryForm, { FormValues } from "@/components/forms/FinancialEntryForm";
import { FinancialEntry, NewFinancialEntry } from "@/lib/financeUtils";

interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<NewFinancialEntry>) => Promise<void>;
  isLoading: boolean;
  title: string;
  entry?: FinancialEntry;
}

const EntryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title,
  entry
}: EntryFormModalProps) => {
  // Prepare initial values if editing an existing entry
  const initialValues: FormValues | undefined = entry
    ? {
        nome: entry.nome,
        descricao: entry.descricao || undefined,
        valor: entry.valor.toString().replace('.', ','),
        dia_mes: entry.data_pagamento ? new Date(entry.data_pagamento).getDate() : undefined,
        isRecorrente: entry.recorrente !== undefined ? entry.recorrente : true,
        mesesAplicaveis: entry.meses_aplicaveis || [],
      }
    : undefined;

  // Handle form submission with type conversion
  const handleSubmit = async (values: FormValues) => {
    // Create a date object for the current month with the selected day
    const now = new Date();
    const dataCompleta = new Date(now.getFullYear(), now.getMonth(), values.dia_mes || 1);
    
    // Convert form values to the expected types for NewFinancialEntry
    const formattedValues: Partial<NewFinancialEntry> = {
      nome: values.nome,
      descricao: values.descricao,
      // Convert string to number, replacing comma with dot for correct parsing
      valor: values.valor ? Number(values.valor.replace(',', '.')) : undefined,
      // Set the full date using the selected day with current month and year
      data_pagamento: dataCompleta.toISOString(),
      // Add the new fields
      recorrente: values.isRecorrente,
      meses_aplicaveis: values.isRecorrente ? null : values.mesesAplicaveis
    };

    await onSubmit(formattedValues);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <FinancialEntryForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          initialValues={initialValues}
          buttonText={entry ? "Atualizar" : "Adicionar"}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EntryFormModal;
