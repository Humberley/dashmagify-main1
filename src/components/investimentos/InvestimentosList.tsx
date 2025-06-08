
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FinancialEntry, deleteFinancialEntry, formatCurrencyBR, updateFinancialEntry } from "@/lib/financeUtils";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import InvestimentoEditForm from "./InvestimentoEditForm";
import { Card } from "@/components/ui/card";

interface InvestimentosListProps {
  investimentos: FinancialEntry[];
  isLoading: boolean;
  onDelete: () => void;
  onUpdate: () => void;
}

const InvestimentosList = ({ 
  investimentos, 
  isLoading, 
  onDelete,
  onUpdate 
}: InvestimentosListProps) => {
  const { toast } = useToast();
  const [editingInvestimento, setEditingInvestimento] = useState<FinancialEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const getInvestimentoDetalhes = (investimento: FinancialEntry) => {
    try {
      if (!investimento.descricao) {
        return { 
          categoria: "Não especificado", 
          instituicao: "Não especificado", 
          taxa_juros: 0,
          valor_atual: 0 
        };
      }
      return JSON.parse(investimento.descricao);
    } catch (e) {
      return { 
        categoria: "Erro ao carregar", 
        instituicao: "Erro ao carregar", 
        taxa_juros: 0,
        valor_atual: 0 
      };
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const success = await deleteFinancialEntry(id);
      if (success) {
        toast({
          title: "Investimento excluído",
          description: "O investimento foi excluído com sucesso!"
        });
        onDelete();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o investimento.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o investimento.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEdit = (investimento: FinancialEntry) => {
    setEditingInvestimento(investimento);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Carregando investimentos...</p>
        </div>
      </Card>
    );
  }

  if (investimentos.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-xl font-medium mb-2">Nenhum investimento encontrado</p>
          <p className="text-muted-foreground">
            Adicione seu primeiro investimento utilizando o formulário acima.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Aporte Mensal</TableHead>
              <TableHead>Valor Atual</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Instituição</TableHead>
              <TableHead>Taxa de Juros</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investimentos.map((investimento) => {
              const detalhes = getInvestimentoDetalhes(investimento);
              return (
                <TableRow key={investimento.id}>
                  <TableCell className="font-medium">{investimento.nome}</TableCell>
                  <TableCell>{formatCurrencyBR(investimento.valor)}</TableCell>
                  <TableCell>{formatCurrencyBR(detalhes.valor_atual || 0)}</TableCell>
                  <TableCell>{detalhes.categoria}</TableCell>
                  <TableCell>{detalhes.instituicao}</TableCell>
                  <TableCell>{detalhes.taxa_juros}% a.a.</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(investimento)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(investimento.id)}
                        disabled={isDeleting === investimento.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Investimento</DialogTitle>
          </DialogHeader>
          {editingInvestimento && (
            <InvestimentoEditForm
              investimento={editingInvestimento}
              onSuccess={() => {
                setIsDialogOpen(false);
                onUpdate();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InvestimentosList;
