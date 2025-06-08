
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormValues } from "../FinancialEntryForm";

interface AmountFieldProps {
  control: Control<FormValues>;
}

export function AmountField({ control }: AmountFieldProps) {
  const formatCurrency = (value: string) => {
    // Remove anything that isn't a digit or comma
    const onlyDigitsAndComma = value.replace(/[^\d,]/g, '');
    
    // Ensure only one comma
    const parts = onlyDigitsAndComma.split(',');
    let result = parts[0] || '';
    
    if (parts.length > 1) {
      // Join the first part with the first decimal part
      result = `${result},${parts[1]}`;
    }
    
    return result;
  };

  return (
    <FormField
      control={control}
      name="valor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Valor</FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input 
                placeholder="0,00" 
                className="pl-10" 
                {...field}
                onChange={(e) => {
                  field.onChange(formatCurrency(e.target.value));
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
