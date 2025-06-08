
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { NameField } from "./form-fields/NameField";
import { DescriptionField } from "./form-fields/DescriptionField";
import { AmountField } from "./form-fields/AmountField";
import { RecurrenceField } from "./form-fields/RecurrenceField";
import { ApplicableMonthsField } from "./form-fields/ApplicableMonthsField";

const formSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  descricao: z.string().optional(),
  valor: z.string().min(1, "O valor é obrigatório").refine(
    (val) => !isNaN(Number(val.replace(',', '.'))),
    { message: "Valor inválido" }
  ),
  isRecorrente: z.boolean().default(true),
  mesesAplicaveis: z.array(z.number()).optional(),
});

export type VariableExpenseFormValues = z.infer<typeof formSchema>;

interface VariableExpenseFormProps {
  onSubmit: (values: VariableExpenseFormValues) => void;
  isLoading?: boolean;
  initialValues?: Partial<VariableExpenseFormValues>;
  buttonText?: string;
}

const VariableExpenseForm = ({
  onSubmit,
  isLoading = false,
  initialValues,
  buttonText = "Salvar",
}: VariableExpenseFormProps) => {
  const form = useForm<VariableExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialValues?.nome || "",
      descricao: initialValues?.descricao || "",
      valor: initialValues?.valor || "",
      isRecorrente: initialValues?.isRecorrente !== undefined ? initialValues.isRecorrente : true,
      mesesAplicaveis: initialValues?.mesesAplicaveis || [],
    },
  });

  const isRecorrente = form.watch("isRecorrente");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <NameField control={form.control} />
        <DescriptionField control={form.control} />
        <AmountField control={form.control} />
        <RecurrenceField control={form.control} />
        
        {!isRecorrente && (
          <ApplicableMonthsField 
            control={form.control} 
            selectedMonths={form.watch("mesesAplicaveis") || []}
          />
        )}
        
        <div className="p-4 bg-muted rounded-md text-sm mb-4">
          <h4 className="font-medium mb-2">Sobre Despesas Variáveis</h4>
          <p>
            As despesas variáveis representam gastos distribuídos ao longo do mês, 
            como combustível, alimentação e outras despesas de consumo regular.
          </p>
          <p className="mt-2">
            Diferente de despesas fixas com dia específico, estas são consideradas 
            no planejamento como distribuídas ao longo do período.
          </p>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Processando..." : buttonText}
        </Button>
      </form>
    </Form>
  );
};

export default VariableExpenseForm;
