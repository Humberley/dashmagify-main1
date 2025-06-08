
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  FinancialEntry, 
  NewFinancialEntry, 
  createFinancialEntry, 
  deleteFinancialEntry, 
  getFinancialEntries, 
  updateFinancialEntry 
} from "@/lib/financeUtils";
import { useToast } from "@/hooks/use-toast";
import DataTable from "@/components/dashboard/DataTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EntryFormModal from "@/components/dashboard/EntryFormModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VariableExpenseForm, { VariableExpenseFormValues } from "@/components/forms/VariableExpenseForm";

const VariaveisPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<FinancialEntry | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const entryType = "despesa_variavel";

  // Consulta para obter as entradas financeiras
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['financial-entries', entryType],
    queryFn: () => getFinancialEntries(entryType),
  });

  // Mutação para criar uma nova entrada
  const createMutation = useMutation({
    mutationFn: createFinancialEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] });
      setIsModalOpen(false);
      toast({
        title: "Despesa variável adicionada",
        description: "A despesa variável foi adicionada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar",
        description: `Ocorreu um erro: ${error}`,
      });
    },
  });

  // Mutação para atualizar uma entrada existente
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<NewFinancialEntry> }) => 
      updateFinancialEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] });
      setIsModalOpen(false);
      setCurrentEntry(undefined);
      toast({
        title: "Despesa variável atualizada",
        description: "A despesa variável foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: `Ocorreu um erro: ${error}`,
      });
    },
  });

  // Mutação para excluir uma entrada
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFinancialEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] });
      setIsDeleteDialogOpen(false);
      setCurrentEntry(undefined);
      toast({
        title: "Despesa variável excluída",
        description: "A despesa variável foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: `Ocorreu um erro: ${error}`,
      });
    },
  });

  // Função para abrir o modal e definir a entrada atual (se estiver editando)
  const handleOpenModal = (entry?: FinancialEntry) => {
    setCurrentEntry(entry);
    setIsModalOpen(true);
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEntry(undefined);
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = (values: VariableExpenseFormValues) => {
    const now = new Date();
    const dataCompleta = new Date(now.getFullYear(), now.getMonth(), 1); // Define o dia 1 do mês atual
    
    const formattedValues: Partial<NewFinancialEntry> = {
      nome: values.nome,
      descricao: values.descricao,
      valor: values.valor ? Number(values.valor.replace(',', '.')) : 0,
      data_pagamento: dataCompleta.toISOString(),
      tipo: entryType,
      recorrente: values.isRecorrente,
      meses_aplicaveis: values.isRecorrente ? null : values.mesesAplicaveis
    };

    if (currentEntry) {
      updateMutation.mutate({ id: currentEntry.id, updates: formattedValues });
    } else {
      createMutation.mutate(formattedValues as NewFinancialEntry);
    }
  };

  // Função para confirmar a exclusão de uma entrada
  const handleDeleteConfirm = () => {
    if (currentEntry) {
      deleteMutation.mutate(currentEntry.id);
    }
  };

  // Colunas para a tabela de despesas variáveis
  const columns = [
    {
      header: "Nome",
      accessorKey: "nome",
    },
    {
      header: "Descrição",
      accessorKey: "descricao",
      cell: ({ row }: { row: any }) => {
        return row.descricao || "-";
      },
    },
    {
      header: "Valor Mensal",
      accessorKey: "valor",
      cell: ({ row }: { row: any }) => {
        const valor = row.valor;
        if (valor === undefined || valor === null) return "-";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
      },
    },
    {
      header: "Recorrência",
      accessorKey: "recorrente",
      cell: ({ row }: { row: any }) => {
        return row.recorrente ? "Mensal" : "Meses específicos";
      },
    },
    {
      header: "Ações",
      cell: ({ row }: { row: any }) => {
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost" onClick={() => handleOpenModal(row)}>
              Editar
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => {
                setCurrentEntry(row);
                setIsDeleteDialogOpen(true);
              }}>
              Excluir
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Despesas Variáveis</h1>
            <p className="text-muted-foreground">
              Gerencie seus gastos variáveis mensais como alimentação, combustível e outras despesas de consumo
            </p>
          </div>
          <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
            <Plus size={16} /> Nova Despesa Variável
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Suas Despesas Variáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              data={entries} 
              columns={columns} 
              isLoading={isLoading} 
              noDataMessage="Nenhuma despesa variável encontrada. Adicione sua primeira despesa variável."
            />
          </CardContent>
        </Card>

        {/* Modal para adicionar/editar despesa variável */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{currentEntry ? "Editar Despesa Variável" : "Nova Despesa Variável"}</DialogTitle>
            </DialogHeader>
            <VariableExpenseForm
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              initialValues={
                currentEntry ? {
                  nome: currentEntry.nome,
                  descricao: currentEntry.descricao || undefined,
                  valor: currentEntry.valor.toString().replace('.', ','),
                  isRecorrente: currentEntry.recorrente,
                  mesesAplicaveis: currentEntry.meses_aplicaveis || [],
                } : undefined
              }
              buttonText={currentEntry ? "Atualizar" : "Adicionar"}
            />
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmação para excluir */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Tem certeza que deseja excluir esta despesa variável? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default VariaveisPage;
