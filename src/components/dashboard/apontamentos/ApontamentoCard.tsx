
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CalendarCheck, CalendarMinus, Edit, Trash2 } from "lucide-react";
import { formatDateBR } from "@/lib/utils";
import { FinancialRecord } from "@/lib/supabaseUtils";
import { cn } from "@/lib/utils";
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

interface ApontamentoCardProps {
  item: FinancialRecord;
  onEdit: (record: FinancialRecord) => void;
  onDelete?: (recordId: string) => Promise<boolean>;
}

const ApontamentoCard: React.FC<ApontamentoCardProps> = ({ item, onEdit, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const incomplete = isIncompleteRecord(item);
  const isIncomeRecord = item.classificacao?.startsWith('Receita:');
  const isForecasted = item.tipo_registro === 'previsto';

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    const success = await onDelete(item.id);
    setIsDeleting(false);
    
    if (success) {
      setDeleteDialogOpen(false);
    }
  };
  
  return (
    <Card 
      className={cn(
        `mb-3`,
        incomplete ? 'border-yellow-400 border-2' : '',
        isForecasted ? 'bg-muted/10' : ''
      )}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              {isForecasted ? (
                <CalendarMinus className="h-3 w-3 text-muted-foreground" />
              ) : (
                <CalendarCheck className="h-3 w-3 text-primary" />
              )}
              {!item.data_movimentacao && <AlertTriangle className="h-3 w-3 text-yellow-500 ml-1" />}
              <span className={cn(
                "text-sm font-medium",
                isForecasted ? "text-muted-foreground" : ""
              )}>
                {formatDateBR(item.data_movimentacao)}
              </span>
              
              {isForecasted && (
                <span className="text-xs text-muted-foreground ml-1">(Previsto)</span>
              )}
            </div>
            <span 
              className={cn(
                `text-lg font-bold`,
                isForecasted 
                  ? isIncomeRecord ? 'text-green-500/70' : 'text-red-500/70'
                  : isIncomeRecord ? 'text-green-600' : 'text-red-600',
                isForecasted ? "text-base" : "text-lg"
              )}
            >
              {formatCurrency(item.valor)}
            </span>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit(item)}
              className="h-8 w-8 p-0"
              aria-label="Editar apontamento"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                aria-label="Excluir apontamento"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo:</span>
            <span className={cn(
              "font-medium",
              isForecasted ? "text-muted-foreground" : ""
            )}>
              {getTransactionType(item)}
            </span>
          </div>
          
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Categoria:</span>
            <div className="flex items-center text-right">
              {!item.classificacao && <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />}
              <span className={cn(
                "font-medium",
                isForecasted ? "text-muted-foreground" : ""
              )}>
                {formatCategoryName(item.classificacao)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Descrição:</span>
            <div className="flex items-center max-w-[60%] text-right">
              {!item.descricao && <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />}
              <span className={cn(
                "font-medium truncate",
                isForecasted ? "text-muted-foreground" : ""
              )}>
                {item.descricao || '-'}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Pagamento:</span>
            <div className="flex items-center text-right">
              {!item.forma_pagamento && <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1" />}
              <span className={cn(
                "font-medium",
                isForecasted ? "text-muted-foreground" : "" 
              )}>
                {item.forma_pagamento || '-'}
              </span>
            </div>
          </div>
        </div>
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
              onClick={confirmDelete}
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

// Helper functions
const isIncompleteRecord = (record: FinancialRecord): boolean => {
  return !record.data_movimentacao || 
         !record.classificacao || 
         !record.descricao || 
         !record.forma_pagamento;
};

const getTransactionType = (record: FinancialRecord): string => {
  const classification = record.classificacao || '';
  
  if (classification.startsWith('Receita:')) {
    return "Receita";
  } else if (classification.startsWith('Fixa:')) {
    return "Despesa Fixa";
  } else if (classification.startsWith('Variável:')) {
    return "Despesa Variável";
  } else if (classification === 'Pagamento de fatura Cartão de Crédito') {
    return "Cartão de Crédito";
  } else if (classification === 'Dívidas e Parcelados') {
    return "Dívida/Parcelado";
  } else if (classification === 'Investimentos') {
    return "Investimento";
  }
  
  return "Outro";
};

const formatCategoryName = (category: string | null): string => {
  if (!category) return '-';
  
  if (category.startsWith("Fixa: ")) {
    return category.replace("Fixa: ", "");
  } else if (category.startsWith("Variável: ")) {
    return category.replace("Variável: ", "");
  } else if (category.startsWith("Receita: ")) {
    return category.replace("Receita: ", "");
  }
  
  return category;
};

const formatCurrency = (value: any) => {
  if (value === undefined || value === null) return "-";
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return "-";
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};

export { 
  ApontamentoCard,
  isIncompleteRecord,
  getTransactionType,
  formatCategoryName,
  formatCurrency
};
