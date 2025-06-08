
import { Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormValues } from "../FinancialEntryForm";

interface DayOfMonthFieldProps {
  control: Control<FormValues>;
}

export function DayOfMonthField({ control }: DayOfMonthFieldProps) {
  // Generate array of days 1-31
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <FormField
      control={control}
      name="dia_mes"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Dia do mês</FormLabel>
          <FormControl>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant={field.value === day ? "default" : "outline"}
                  className={cn(
                    "h-9 w-9",
                    field.value === day && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => field.onChange(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
