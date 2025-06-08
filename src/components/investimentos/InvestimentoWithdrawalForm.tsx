
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
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
import { FinancialEntry, updateFinancialEntry, formatCurrencyBR } from "@/lib/financeUtils";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  investimento_id: z.string().min(1, "Selecione um investimento"),
  valor_retirada: z.coerce.number().positive("O valor de resgate deve ser positivo"),
  motivo: z.string().min(2, "Informe o motivo do resgate").optional(),
});

interface InvestimentoWithdrawalFormProps {
  investimentos: FinancialEntry[];
  onSuccess: () => void;
}

const InvestimentoWithdrawalForm = ({ investimentos, onSuccess }: InvestimentoWithdrawalFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInvestimento, setSelectedInvestimento] = useState<FinancialEntry | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      investimento_id: "",
      valor_retirada: 0,
      motivo: "",
    },
  });

  const getInvestimentoDetalhes = (investimento: FinancialEntry | null) => {
    if (!investimento?.descricao) return null;
    try {
      return JSON.parse(investimento.descricao);
    } catch (e) {
      return null;
    }
  };

  const handleInvestimentoChange = (investimentoId: string) => {
    const investimento = investimentos.find(inv => inv.id === investimentoId);
    setSelectedInvestimento(investimento || null);
  };

  // Function to record the withdrawal in the financial history
  const recordWithdrawalInHistory = async (investimento: FinancialEntry, withdrawalAmount: number, reason: string | null) => {
    try {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('pt-BR');
      
      const getUserEmail = () => {
        const userDataStr = localStorage.getItem('magify_user');
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            return userData.email || null;
          } catch (e) {
            console.error('Error parsing user data:', e);
            return null;
          }
        }
        return null;
      };

      const userEmail = getUserEmail();
      if (!userEmail) {
        console.error("Não foi possível obter o email do usuário");
        return false;
      }

      // Generate a random ID for the transaction
      const generateTransactionId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 10; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      // Record the withdrawal transaction with negative value (outflow from investment)
      const { error } = await supabase
        .from('historico_financeiro')
        .insert({
          email: userEmail,
          data_criacao: formattedDate,
          data_movimentacao: formattedDate,
          valor: `-${withdrawalAmount.toFixed(2)}`, // Negative value for outflow
          classificacao: 'Investimentos',
          parcelado: false,
          descricao: `Resgate de ${investimento.nome}: ${reason || 'Resgate de investimento'}`,
          forma_pagamento: 'Transferência',
          identificacao: generateTransactionId(),
          tipo_registro: 'resgate_investimento'
        });

      if (error) {
        console.error("Erro ao registrar resgate no histórico:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao registrar resgate no histórico:", error);
      return false;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedInvestimento) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Selecione um investimento válido",
      });
      return;
    }

    const detalhes = getInvestimentoDetalhes(selectedInvestimento);
    if (!detalhes) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível obter os detalhes do investimento",
      });
      return;
    }

    const valorAtual = detalhes.valor_atual || 0;
    if (values.valor_retirada > valorAtual) {
      toast({
        variant: "destructive",
        title: "Valor inválido",
        description: "O valor de resgate não pode ser maior que o valor atual do investimento",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Atualizar o valor atual após resgate
      const novoValorAtual = valorAtual - values.valor_retirada;
      
      // Atualizar os detalhes do investimento
      const novosDetalhes = {
        ...detalhes,
        valor_atual: novoValorAtual,
        ultima_atualizacao: new Date().toISOString(),
        historico_transacoes: [
          ...(detalhes.historico_transacoes || []),
          {
            tipo: "resgate",
            valor: values.valor_retirada,
            data: new Date().toISOString(),
            motivo: values.motivo || "Resgate de investimento"
          }
        ]
      };
      
      // Atualizar o investimento no banco de dados
      const result = await updateFinancialEntry(selectedInvestimento.id, {
        descricao: JSON.stringify(novosDetalhes)
      });
      
      // Record the withdrawal in the financial history
      await recordWithdrawalInHistory(
        selectedInvestimento, 
        values.valor_retirada, 
        values.motivo || null
      );
      
      if (result) {
        toast({
          title: "Resgate registrado",
          description: `Resgate de ${formatCurrencyBR(values.valor_retirada)} realizado com sucesso!`
        });
        form.reset();
        onSuccess();
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível registrar o resgate"
        });
      }
    } catch (error) {
      console.error("Erro ao registrar resgate:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao registrar o resgate"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInvestimentoDetalhes = getInvestimentoDetalhes(selectedInvestimento);
  const valorAtual = selectedInvestimentoDetalhes?.valor_atual || 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="investimento_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Investimento</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleInvestimentoChange(value);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o investimento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {investimentos.map((investimento) => {
                    const detalhes = getInvestimentoDetalhes(investimento);
                    const valor = detalhes?.valor_atual || 0;
                    if (valor <= 0) return null;
                    
                    return (
                      <SelectItem key={investimento.id} value={investimento.id}>
                        {investimento.nome} - {formatCurrencyBR(valor)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {selectedInvestimento && (
          <div className="p-4 border rounded-md bg-slate-50">
            <p className="font-medium">Detalhes do investimento:</p>
            <p className="text-sm">Valor atual: {formatCurrencyBR(valorAtual)}</p>
            {selectedInvestimentoDetalhes?.categoria && (
              <p className="text-sm">Categoria: {selectedInvestimentoDetalhes.categoria}</p>
            )}
            {selectedInvestimentoDetalhes?.instituicao && (
              <p className="text-sm">Instituição: {selectedInvestimentoDetalhes.instituicao}</p>
            )}
          </div>
        )}
        
        <FormField
          control={form.control}
          name="valor_retirada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Resgate (R$)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  {...field}
                  max={valorAtual}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="motivo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Necessidade pessoal, transferência..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || !selectedInvestimento || valorAtual === 0}
        >
          {isSubmitting ? "Processando..." : "Registrar Resgate"}
        </Button>
      </form>
    </Form>
  );
};

export default InvestimentoWithdrawalForm;
