
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Edit, Trash2 } from "lucide-react";
import { formatDateBR } from "@/lib/utils";
import { FinancialRecord } from "@/lib/supabaseUtils";
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
import { isIncompleteRecord, getTransactionType, formatCategoryName, formatCurrency } from "./ApontamentoCard";

interface ApontamentoTableProps {
  data: FinancialRecord[];
  onEditClick: (record: FinancialRecord) => void;
  onDeleteClick?: (recordId: string) => Promise<boolean>;
}

const ApontamentoTable: React.FC<ApontamentoTableProps> = ({ 
  data, 
  onEditClick,
  onDeleteClick
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<FinancialRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (record: FinancialRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete || !onDeleteClick) return;
    
    setIsDeleting(true);
    const success = await onDeleteClick(recordToDelete.id);
    setIsDeleting(false);
    
    if (success) {
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow 
                key={item.id || Math.random().toString()}
                className={isIncompleteRecord(item) ? "bg-yellow-50" : ""}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!item.data_movimentacao && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {formatDateBR(item.data_movimentacao)}
                    {item.data_criacao && item.data_criacao !== item.data_movimentacao && (
                      <span className="text-xs text-muted-foreground">
                        (criado em {formatDateBR(item.data_criacao)})
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className={
                  item.classificacao?.startsWith('Receita:') ? 'text-green-600' : 'text-red-600'
                }>
                  {formatCurrency(item.valor)}
                </TableCell>
                <TableCell>{getTransactionType(item)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!item.classificacao && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {formatCategoryName(item.classificacao)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 max-w-[150px]">
                    {!item.descricao && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    <span className="truncate">{item.descricao || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!item.forma_pagamento && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {item.forma_pagamento || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditClick(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {onDeleteClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center">
                Nenhum resultado encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ApontamentoTable;
