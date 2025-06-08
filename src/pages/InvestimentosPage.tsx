
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { getInvestimentos, formatCurrencyBR } from "@/lib/financeUtils";
import { Card } from "@/components/ui/card";
import InvestimentosList from "@/components/investimentos/InvestimentosList";
import InvestimentoForm from "@/components/investimentos/InvestimentoForm";
import InvestimentosHeader from "@/components/investimentos/InvestimentosHeader";
import InvestimentosChart from "@/components/investimentos/InvestimentosChart";
import InvestimentosHistory from "@/components/investimentos/InvestimentosHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InvestimentoWithdrawalForm from "@/components/investimentos/InvestimentoWithdrawalForm";

const InvestimentosPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  
  const { 
    data: investimentos, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['investimentos', refreshTrigger],
    queryFn: () => getInvestimentos()
  });
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Calculate total invested amount (monthly)
  const totalInvestido = investimentos?.reduce((total, inv) => total + inv.valor, 0) || 0;
  
  // Calculate total current value
  const totalValorAtual = investimentos?.reduce((total, inv) => {
    try {
      if (inv.descricao) {
        const detalhes = JSON.parse(inv.descricao);
        return total + (detalhes.valor_atual || 0);
      }
      return total;
    } catch (e) {
      return total;
    }
  }, 0) || 0;

  const handleAddWithdrawal = () => {
    setWithdrawalDialogOpen(true);
  };

  const handleWithdrawalComplete = () => {
    setWithdrawalDialogOpen(false);
    handleRefresh();
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <InvestimentosHeader 
          totalInvestido={totalInvestido}
          totalValorAtual={totalValorAtual}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          onAddWithdrawal={handleAddWithdrawal}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Adicionar Investimento</h3>
            <InvestimentoForm onSuccess={handleRefresh} />
          </Card>
          
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Distribuição por Categoria</h3>
            <InvestimentosChart investimentos={investimentos || []} />
          </Card>
        </div>
        
        <Tabs defaultValue="ativos" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ativos">Investimentos Ativos</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Transações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ativos">
            <InvestimentosList 
              investimentos={investimentos || []} 
              isLoading={isLoading} 
              onDelete={handleRefresh}
              onUpdate={handleRefresh}
            />
          </TabsContent>
          
          <TabsContent value="historico">
            <InvestimentosHistory />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Resgate de Investimento</DialogTitle>
          </DialogHeader>
          <InvestimentoWithdrawalForm 
            investimentos={investimentos || []}
            onSuccess={handleWithdrawalComplete}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default InvestimentosPage;
