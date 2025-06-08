
import { Card } from "@/components/ui/card";

const PrevisaoExplanation = () => {
  return (
    <Card className="p-4 bg-muted/10">
      <h3 className="font-semibold mb-2">Como funciona a previsão?</h3>
      <p className="text-sm text-muted-foreground">
        Esta previsão é baseada nos valores cadastrados em suas receitas, despesas fixas, 
        despesas variáveis, investimentos e dívidas/parcelas. O saldo acumulado considera o saldo 
        do mês anterior, permitindo visualizar a evolução de suas finanças ao longo do tempo.
      </p>
    </Card>
  );
};

export default PrevisaoExplanation;
