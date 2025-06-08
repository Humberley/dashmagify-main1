
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Edit, Trash2, RepeatIcon, CalendarIcon } from "lucide-react";
import { 
  FinancialEntry, 
  formatCurrencyBR,
  deleteFinancialEntry
} from "@/lib/financeUtils";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EntryListProps {
  title: string;
  entries: FinancialEntry[];
  onAddNew: () => void;
  onEdit: (entry: FinancialEntry) => void;
  onRefresh: () => void;
}

const EntryList = ({ title, entries, onAddNew, onEdit, onRefresh }: EntryListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<FinancialEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const formatDay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Return just the day with suffix (e.g., "15º dia")
      return `${date.getDate()}º dia`;
    } catch (e) {
      return dateStr;
    }
  };

  const formatMesesAplicaveis = (meses: number[] | null) => {
    if (!meses || meses.length === 0) return "";
    
    const mesesNomes = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    
    return meses.map(m => mesesNomes[m-1]).join(", ");
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    
    try {
      setIsDeleting(true);
      const success = await deleteFinancialEntry(entryToDelete.id);
      
      if (success) {
        toast({
          title: "Registro excluído",
          description: "O registro foi removido com sucesso",
        });
        onRefresh(); // Refresh data
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Não foi possível excluir o registro",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao tentar excluir o registro",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };

  const confirmDelete = (entry: FinancialEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-2 sm:space-y-0">
        <CardTitle className="text-xl">{title}</CardTitle>
        <Button 
          onClick={onAddNew} 
          size="sm" 
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar</span>
        </Button>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Dia</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.nome}</TableCell>
                    <TableCell>{formatCurrencyBR(entry.valor)}</TableCell>
                    <TableCell>{formatDay(entry.data_pagamento)}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            {entry.recorrente ? (
                              <RepeatIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 text-blue-500 mr-1" />
                                {entry.meses_aplicaveis && entry.meses_aplicaveis.length > 0 && (
                                  <span className="text-xs">{entry.meses_aplicaveis.length}</span>
                                )}
                              </div>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {entry.recorrente 
                              ? "Recorrente (todos os meses)" 
                              : `Avulso: ${formatMesesAplicaveis(entry.meses_aplicaveis)}`
                            }
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => onEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => confirmDelete(entry)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>Nenhum registro encontrado.</p>
            <p>Clique em "Adicionar" para criar um novo registro.</p>
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default EntryList;
