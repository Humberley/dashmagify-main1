import { useQuery } from "@tanstack/react-query";
import { fetchUserFinancialData, isInvestment, isInvestmentWithdrawal, formatCurrency } from "@/lib/supabaseUtils";
import { getUserFromLocalStorage } from "@/lib/financeUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { parseDate } from "@/lib/utils";

const InvestimentosHistory = () => {
  const user = getUserFromLocalStorage();
  
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['financialHistory', 'investimentos'],
    queryFn: () => fetchUserFinancialData(user?.email || null),
  });
  
  // Filter investment and withdrawal transactions
  const investimentosTransactions = financialData?.filter(record => 
    isInvestment(record) || 
    isInvestmentWithdrawal(record)
  ) || [];
  
  // Sort by date (most recent first)
  const sortedTransactions = [...investimentosTransactions].sort((a, b) => {
    const dateA = a.data_movimentacao ? parseDate(a.data_movimentacao) : null;
    const dateB = b.data_movimentacao ? parseDate(b.data_movimentacao) : null;
    
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    return dateB.getTime() - dateA.getTime();
  });
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    
    const date = parseDate(dateStr);
    if (!date) return dateStr;
    
    return date.toLocaleDateString('pt-BR');
  };
  
  // Determine if a transaction is a withdrawal
  const isWithdrawal = (record: any) => {
    return isInvestmentWithdrawal(record) || Number(record.valor) < 0;
  };
  
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-xl font-medium mb-2 text-destructive">Erro ao carregar dados</p>
          <p className="text-muted-foreground">
            Não foi possível carregar o histórico de investimentos.
          </p>
        </div>
      </Card>
    );
  }
  
  if (sortedTransactions.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-40">
          <p className="text-xl font-medium mb-2">Nenhuma transação encontrada</p>
          <p className="text-muted-foreground">
            As transações dos seus investimentos aparecerão aqui.
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
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Forma de Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.data_movimentacao)}</TableCell>
                <TableCell>{transaction.descricao || "-"}</TableCell>
                <TableCell>
                  {isWithdrawal(transaction) ? "Resgate" : "Aplicação/Atualização"}
                </TableCell>
                <TableCell>{transaction.forma_pagamento || "-"}</TableCell>
                <TableCell className="text-right">
                  <span className={Number(transaction.valor) < 0 ? "text-destructive" : "text-green-600"}>
                    {formatCurrency(Number(transaction.valor))}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default InvestimentosHistory;
