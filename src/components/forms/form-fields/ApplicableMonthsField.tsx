
import { useState } from "react";
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { FormValues } from "../FinancialEntryForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplicableMonthsFieldProps {
  control: Control<FormValues>;
  selectedMonths: number[];
}

export function ApplicableMonthsField({ control, selectedMonths }: ApplicableMonthsFieldProps) {
  const [open, setOpen] = useState(false);
  const [tempSelectedMonths, setTempSelectedMonths] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Generate years array (current year and 5 years into the future)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
  
  const months = [
    { id: 1, name: "Janeiro" },
    { id: 2, name: "Fevereiro" },
    { id: 3, name: "Março" },
    { id: 4, name: "Abril" },
    { id: 5, name: "Maio" },
    { id: 6, name: "Junho" },
    { id: 7, name: "Julho" },
    { id: 8, name: "Agosto" },
    { id: 9, name: "Setembro" },
    { id: 10, name: "Outubro" },
    { id: 11, name: "Novembro" },
    { id: 12, name: "Dezembro" },
  ];

  const getSelectedMonthsText = () => {
    if (!selectedMonths || selectedMonths.length === 0) {
      return "Nenhum mês selecionado";
    }
    
    if (selectedMonths.length === 12) {
      return "Todos os meses";
    }
    
    if (selectedMonths.length <= 2) {
      return selectedMonths
        .map(id => months.find(m => m.id === id)?.name)
        .join(", ");
    }
    
    return `${selectedMonths.length} meses selecionados`;
  };

  const toggleMonth = (monthId: number) => {
    if (tempSelectedMonths.includes(monthId)) {
      setTempSelectedMonths(tempSelectedMonths.filter(id => id !== monthId));
    } else {
      setTempSelectedMonths([...tempSelectedMonths, monthId]);
    }
  };

  const selectAllMonths = () => {
    setTempSelectedMonths(months.map(m => m.id));
  };

  const clearAllMonths = () => {
    setTempSelectedMonths([]);
  };

  const openDialog = (currentValue: number[], onChange: (value: number[]) => void) => {
    setTempSelectedMonths([...currentValue]);
    setOpen(true);
  };

  const saveSelection = (onChange: (value: number[]) => void) => {
    onChange([...tempSelectedMonths]);
    setOpen(false);
  };

  return (
    <FormField
      control={control}
      name="mesesAplicaveis"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Meses aplicáveis</FormLabel>
          <FormControl>
            <Button 
              variant="outline" 
              className="w-full justify-between text-left font-normal"
              onClick={() => openDialog(field.value || [], field.onChange)}
              type="button"
            >
              <span>{getSelectedMonthsText()}</span>
            </Button>
          </FormControl>
          <FormMessage />
          
          <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
              setOpen(false);
            }
          }}>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Selecionar meses aplicáveis</DialogTitle>
              </DialogHeader>
              
              <div className="flex justify-between items-center py-2">
                <div className="flex-1">
                  <Select 
                    value={selectedYear.toString()} 
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={selectAllMonths}
                    type="button"
                  >
                    Selecionar todos
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllMonths}
                    type="button"
                  >
                    Limpar
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                {months.map((month) => (
                  <div key={month.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`month-${month.id}`}
                      checked={tempSelectedMonths.includes(month.id)}
                      onCheckedChange={() => toggleMonth(month.id)}
                    />
                    <label 
                      htmlFor={`month-${month.id}`} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {month.name}
                    </label>
                  </div>
                ))}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={() => saveSelection(field.onChange)}
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </FormItem>
      )}
    />
  );
}
