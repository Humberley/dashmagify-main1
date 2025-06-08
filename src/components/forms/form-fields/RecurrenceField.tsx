
import { Control } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormValues } from "../FinancialEntryForm";

interface RecurrenceFieldProps {
  control: Control<FormValues>;
}

export function RecurrenceField({ control }: RecurrenceFieldProps) {
  return (
    <FormField
      control={control}
      name="isRecorrente"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <div className="font-medium">
              Recorrente
            </div>
            <p className="text-sm text-muted-foreground">
              {field.value 
                ? "Este valor se repete todos os meses" 
                : "Selecione os meses aplicáveis"}
            </p>
          </div>
        </FormItem>
      )}
    />
  );
}
