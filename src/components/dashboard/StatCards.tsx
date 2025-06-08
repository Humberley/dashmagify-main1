
import { 
  DollarSign, 
  TrendingDown, 
  CreditCard,
  TrendingUp,
  BanknoteIcon
} from "lucide-react";
import StatCardItem from "./StatCardItem";

interface StatCardsProps {
  stats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    categories: number;
  };
  plannedData: {
    totalReceitas: number;
    totalDespesasFixas: number;
    totalDespesasVariaveis: number;
    totalInvestimentos: number;
    totalDividasParcelas: number;
    saldoMensal: number;
  };
  realData: {
    totalReceitas: number;
    totalDespesasFixas: number;
    totalDespesasVariaveis: number;
    totalInvestimentos: number;
    totalDividasParcelas: number;
    saldoMensal: number;
  };
}

const StatCards = ({ stats, plannedData, realData }: StatCardsProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RECEITAS CARD */}
        <StatCardItem 
          title="Receitas"
          icon={<DollarSign className="h-4 w-4" />}
          realValue={realData.totalReceitas}
          plannedValue={plannedData.totalReceitas}
          isIncome={true}
          description="Receita: Salário, Receita: Outras, Receita: Aposentadoria"
        />
        
        {/* DESPESAS FIXAS CARD */}
        <StatCardItem 
          title="Despesas Fixas"
          icon={<TrendingDown className="h-4 w-4" />}
          realValue={realData.totalDespesasFixas}
          plannedValue={plannedData.totalDespesasFixas}
          description="Fixa: Banco, Carro, Comunicação, Educação, Habitação, Saúde, etc."
        />
        
        {/* DESPESAS VARIÁVEIS CARD */}
        <StatCardItem 
          title="Despesas Variáveis"
          icon={<CreditCard className="h-4 w-4" />}
          realValue={realData.totalDespesasVariaveis}
          plannedValue={plannedData.totalDespesasVariaveis}
          description="Variável: Carro, Educação, Entretenimento, Mercado, etc."
        />
        
        {/* DÍVIDAS E PARCELAS CARD */}
        <StatCardItem 
          title="Dívidas e Parcelas"
          icon={<BanknoteIcon className="h-4 w-4" />}
          realValue={realData.totalDividasParcelas}
          plannedValue={plannedData.totalDividasParcelas}
          description="Dívidas e Parcelados, Pagamento de fatura Cartão de Crédito"
        />
        
        {/* INVESTIMENTOS CARD */}
        <StatCardItem 
          title="Investimentos"
          icon={<TrendingUp className="h-4 w-4" />}
          realValue={realData.totalInvestimentos}
          plannedValue={plannedData.totalInvestimentos}
          description="Investimentos"
        />
        
        {/* SALDO CARD */}
        <StatCardItem 
          title="Saldo"
          icon={<DollarSign className="h-4 w-4" />}
          realValue={realData.saldoMensal}
          plannedValue={plannedData.saldoMensal}
          description="Receitas - Despesas - Investimentos"
        />
      </div>
    </div>
  );
};

export default StatCards;
