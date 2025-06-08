import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ConectarContasPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Conectar Contas</h1>
        <Card>
          <CardHeader>
            <CardTitle>Integração de Contas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Esta página será utilizada para conectar suas contas bancárias e outras fontes de dados financeiros.
            </p>
            {/* Conteúdo da página virá aqui */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ConectarContasPage;