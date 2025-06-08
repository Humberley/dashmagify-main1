
import { useState } from "react";
import { Calendar as CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn, formatMonthYear } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateFilterProps {
  selectedDate: Date | undefined;
  isCurrentMonth: boolean;
  onDateSelect: (date: Date | undefined) => void;
  onToggleCurrentMonth: () => void;
}

const DateFilter = ({
  selectedDate,
  isCurrentMonth,
  onDateSelect,
  onToggleCurrentMonth
}: DateFilterProps) => {
  const currentDate = selectedDate || new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

  // Gerar os anos disponíveis para seleção (5 anos para trás e 5 anos para frente)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Meses em português
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", 
    "Maio", "Junho", "Julho", "Agosto", 
    "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Função para navegar para o mês anterior
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateSelect(newDate);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  // Função para navegar para o próximo mês
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateSelect(newDate);
    setSelectedMonth(newDate.getMonth());
    setSelectedYear(newDate.getFullYear());
  };

  // Quando o mês ou ano for alterado via Select
  const handleMonthYearChange = (month?: number, year?: number) => {
    const newDate = new Date(currentDate);
    
    if (month !== undefined) {
      newDate.setMonth(month);
      setSelectedMonth(month);
    }
    
    if (year !== undefined) {
      newDate.setFullYear(year);
      setSelectedYear(year);
    }
    
    onDateSelect(newDate);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-lg border">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        <h2 className="font-medium">Visualizando dados de:</h2>
        
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-md border shadow-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={goToPreviousMonth}
            aria-label="Mês anterior"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Select
              value={String(selectedMonth)}
              onValueChange={(value) => handleMonthYearChange(Number(value))}
            >
              <SelectTrigger className="w-[110px] h-8 border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {months.map((month, index) => (
                  <SelectItem key={index} value={String(index)}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(selectedYear)}
              onValueChange={(value) => handleMonthYearChange(undefined, Number(value))}
            >
              <SelectTrigger className="w-[80px] h-8 border-0 bg-transparent focus:ring-0 focus-visible:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={goToNextMonth}
            aria-label="Próximo mês"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        {!isCurrentMonth && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={onToggleCurrentMonth}
            className="text-xs p-0 h-auto"
          >
            (voltar para mês atual)
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <Button
          variant={isCurrentMonth ? "default" : "outline"}
          size="sm"
          onClick={onToggleCurrentMonth}
        >
          {isCurrentMonth ? "Ver todos os dados" : "Apenas mês atual"}
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              Calendário
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              captionLayout="dropdown"
              fromYear={2020}
              toYear={2030}
              showOutsideDays={false}
              displayMode="month"
              defaultMonth={selectedDate}
              disabled={(date) => false}
              locale={ptBR}
              formatters={{
                formatCaption: (date, options) => {
                  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                },
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateFilter;
