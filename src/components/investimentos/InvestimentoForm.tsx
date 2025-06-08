
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFinancialEntry, FinancialEntryType } from "@/lib/financeUtils";

const formSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  valor: z.coerce.number().positive("O valor deve ser positivo"),
  valor_atual: z.coerce.number().min(0, "O valor atual não pode ser negativo"),
  categoria: z.string().min(1, "Selecione uma categoria"),
  instituicao: z.string().min(2, "Informe a instituição financeira"),
  taxa_juros: z.coerce.number().min(0, "A taxa de juros não pode ser negativa"),
  descricao: z.string().optional(),
});

const categorias = [
  "Renda Fixa",
  "Renda Variável",
  "Tesouro Direto",
  "Poupança",
  "CDB",
  "LCI/LCA",
  "Fundos Imobiliários",
  "Ações",
  "Criptomoedas",
  "Outros"
];

interface InvestimentoFormProps {
  onSuccess: () => void;
}

const InvestimentoForm = ({ onSuccess }: InvestimentoFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      valor: 0,
      valor_atual: 0,
      categoria: "",
      instituicao: "",
      taxa_juros: 0,
      descricao: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Prepare the data for the financial entry
      const investmentEntry = {
        tipo: "investimento" as FinancialEntryType,
        nome: values.nome,
        valor: values.valor,
        data_pagamento: new Date().toISOString(),
        descricao: JSON.stringify({
          categoria: values.categoria,
          instituicao: values.instituicao,
          taxa_juros: values.taxa_juros,
          valor_atual: values.valor_atual,
          descricao: values.descricao,
        }),
      };
      
      const result = await createFinancialEntry(investmentEntry);
      if (result) {
        toast({
          title: "Investimento adicionado",
          description: "O investimento foi adicionado com sucesso!",
        });
        form.reset();
        onSuccess();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o investimento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar investimento:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o investimento.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Investimento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Tesouro IPCA+ 2026" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aporte Mensal (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="valor_atual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Atual Investido (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="instituicao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instituição Financeira</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Banco X" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="taxa_juros"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxa de Juros (% a.a.)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Detalhes adicionais sobre o investimento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Adicionando..." : "Adicionar Investimento"}
        </Button>
      </form>
    </Form>
  );
};

export default InvestimentoForm;
