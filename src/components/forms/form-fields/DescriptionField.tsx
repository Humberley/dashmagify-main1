
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FormValues } from "../FinancialEntryForm";

interface DescriptionFieldProps {
  control: Control<FormValues>;
}

export function DescriptionField({ control }: DescriptionFieldProps) {
  return (
    <FormField
      control={control}
      name="descricao"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descrição (opcional)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Detalhes adicionais" 
              className="resize-none min-h-[80px]" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
