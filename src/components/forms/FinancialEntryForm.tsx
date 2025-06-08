
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { NameField } from "./form-fields/NameField";
import { DescriptionField } from "./form-fields/DescriptionField";
import { AmountField } from "./form-fields/AmountField";
import { DayOfMonthField } from "./form-fields/DayOfMonthField";
import { RecurrenceField } from "./form-fields/RecurrenceField";
import { ApplicableMonthsField } from "./form-fields/ApplicableMonthsField";

const formSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  descricao: z.string().optional(),
  valor: z.string().min(1, "O valor é obrigatório").refine(
    (val) => !isNaN(Number(val.replace(',', '.'))),
    { message: "Valor inválido" }
  ),
  dia_mes: z.number().min(1, "Selecione um dia").max(31, "Dia inválido"),
  isRecorrente: z.boolean().default(true),
  mesesAplicaveis: z.array(z.number()).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface FinancialEntryFormProps {
  onSubmit: (values: FormValues) => void;
  isLoading?: boolean;
  initialValues?: Partial<FormValues>;
  buttonText?: string;
}

const FinancialEntryForm = ({
  onSubmit,
  isLoading = false,
  initialValues,
  buttonText = "Salvar",
}: FinancialEntryFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialValues?.nome || "",
      descricao: initialValues?.descricao || "",
      valor: initialValues?.valor || "",
      dia_mes: initialValues?.dia_mes || new Date().getDate(),
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
        <DayOfMonthField control={form.control} />
        <RecurrenceField control={form.control} />
        
        {!isRecorrente && (
          <ApplicableMonthsField 
            control={form.control} 
            selectedMonths={form.watch("mesesAplicaveis") || []}
          />
        )}
        
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

export default FinancialEntryForm;
