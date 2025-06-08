
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormValues } from "../FinancialEntryForm";

interface NameFieldProps {
  control: Control<FormValues>;
}

export function NameField({ control }: NameFieldProps) {
  return (
    <FormField
      control={control}
      name="nome"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome</FormLabel>
          <FormControl>
            <Input placeholder="Nome do item" {...field} autoFocus />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
