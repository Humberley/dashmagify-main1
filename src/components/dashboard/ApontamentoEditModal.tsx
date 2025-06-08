import { useState } from "react";
import { FinancialRecord } from "@/lib/supabaseUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface ApontamentoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: FinancialRecord;
  onSave: (updatedRecord: FinancialRecord) => Promise<void>;
}

const ApontamentoEditModal = ({
  isOpen,
  onClose,
  record,
  onSave,
}: ApontamentoEditModalProps) => {
  const [editedRecord, setEditedRecord] = useState<FinancialRecord>({...record});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Payment methods options
  const paymentMethods = [
    "Dinheiro",
    "Cartão de Crédito",
    "Cartão de Débito",
    "Pix",
    "Transferência Bancária",
    "Boleto",
    "Outro"
  ];

  // Categories options (more comprehensive list)
  const categories = {
    income: [
      "Receita: Salário", 
      "Receita: Investimentos", 
      "Receita: Freelancer", 
      "Receita: Bônus", 
      "Receita: Aposentadoria",
      "Receita: Outras"
    ],
    expenses: {
      fixed: [
        "Fixa: Moradia", 
        "Fixa: Alimentação", 
        "Fixa: Transporte", 
        "Fixa: Comunicação", 
        "Fixa: Habitação",
        "Fixa: Educação",
        "Fixa: Saúde",
        "Fixa: Outras"
      ],
      variable: [
        "Variável: Alimentação", 
        "Variável: Transporte", 
        "Variável: Lazer", 
        "Variável: Saúde", 
        "Variável: Educação",
        "Variável: Mercado",
        "Variável: Outros"
      ]
    },
    other: [
      "Pagamento de fatura Cartão de Crédito",
      "Dívidas e Parcelados",
      "Investimentos"
    ]
  };

  // Get date from string or return null with improved validation
  const getDateFromString = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    
    try {
      // Handle string dates in format "dd/mm/yyyy"
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        const parsedDate = new Date(year, month - 1, day);
        return isValid(parsedDate) ? parsedDate : null;
      }
      
      // Try standard date parsing
      const date = new Date(dateStr);
      return isValid(date) ? date : null;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  // Handle date selection
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setEditedRecord({
        ...editedRecord,
        data_movimentacao: date.toISOString(),
      });
    }
  };

  // Handle numeric input for currency
  const handleCurrencyInput = (value: string) => {
    // Remove non-numeric characters except dot
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Convert to number
    const numValue = parseFloat(numericValue);
    if (!isNaN(numValue)) {
      setEditedRecord({
        ...editedRecord,
        valor: numValue
      });
    } else if (value === '') {
      setEditedRecord({
        ...editedRecord,
        valor: 0
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate required fields
      if (!editedRecord.descricao) {
        setError("A descrição é obrigatória");
        return;
      }
      
      if (!editedRecord.classificacao) {
        setError("A classificação é obrigatória");
        return;
      }
      
      if (!editedRecord.forma_pagamento) {
        setError("A forma de pagamento é obrigatória");
        return;
      }
      
      if (!editedRecord.data_movimentacao) {
        setError("A data é obrigatória");
        return;
      }
      
      await onSave(editedRecord);
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      setError("Ocorreu um erro ao salvar as alterações");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get all categories for select
  const getAllCategories = () => {
    return [
      ...categories.income,
      ...categories.expenses.fixed,
      ...categories.expenses.variable,
      ...categories.other
    ];
  };

  // Format date safely for display
  const formatDateSafely = (dateStr: string | null): string => {
    const date = getDateFromString(dateStr);
    if (!date) return "Selecione uma data";
    
    try {
      return format(date, "PPP", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Formato de data inválido";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`${isMobile ? 'w-[95%] p-4' : 'sm:max-w-[500px]'} max-h-[90vh] overflow-y-auto`}
      >
        <DialogHeader>
          <DialogTitle>Editar Apontamento</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar o apontamento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-2 md:py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            {/* Date field */}
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !getDateFromString(editedRecord.data_movimentacao) && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateSafely(editedRecord.data_movimentacao)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={`w-auto p-0 ${isMobile ? 'max-w-[90vw]' : ''}`}>
                  <Calendar
                    mode="single"
                    selected={getDateFromString(editedRecord.data_movimentacao) || undefined}
                    onSelect={handleDateChange}
                    initialFocus
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Value field */}
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                value={editedRecord.valor?.toString() || "0"}
                onChange={(e) => handleCurrencyInput(e.target.value)}
                type="number"
                step="0.01"
                inputMode="decimal"
              />
            </div>
          </div>
          
          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={editedRecord.descricao || ""}
              onChange={(e) => 
                setEditedRecord({...editedRecord, descricao: e.target.value})
              }
              placeholder="Digite uma descrição"
              className="resize-none"
            />
          </div>
          
          {/* Classification field */}
          <div className="space-y-2">
            <Label htmlFor="classificacao">Classificação</Label>
            <Select
              value={editedRecord.classificacao || ""}
              onValueChange={(value) => 
                setEditedRecord({...editedRecord, classificacao: value})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma classificação" />
              </SelectTrigger>
              <SelectContent className={isMobile ? "max-h-[50vh]" : ""}>
                {/* Income categories */}
                <SelectItem value="header-income" disabled>
                  <span className="font-semibold">Receitas</span>
                </SelectItem>
                {categories.income.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                
                {/* Fixed expenses categories */}
                <SelectItem value="header-fixed" disabled>
                  <span className="font-semibold">Despesas Fixas</span>
                </SelectItem>
                {categories.expenses.fixed.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                
                {/* Variable expenses categories */}
                <SelectItem value="header-variable" disabled>
                  <span className="font-semibold">Despesas Variáveis</span>
                </SelectItem>
                {categories.expenses.variable.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                
                {/* Other categories */}
                <SelectItem value="header-other" disabled>
                  <span className="font-semibold">Outros</span>
                </SelectItem>
                {categories.other.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Payment method field */}
          <div className="space-y-2">
            <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
            <Select
              value={editedRecord.forma_pagamento || ""}
              onValueChange={(value) => 
                setEditedRecord({...editedRecord, forma_pagamento: value})
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
            className={isMobile ? "w-full" : ""}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={isMobile ? "w-full" : ""}
          >
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApontamentoEditModal;
