
import { useMemo } from "react";
import { FinancialRecord, formatCurrency, isIncome, isExpense } from "@/lib/supabaseUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseDate } from "@/lib/utils";
import {
  BarChart,
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";

interface MonthlyFinanceChartProps {
  data: FinancialRecord[];
}

const MonthlyFinanceChart = ({ data }: MonthlyFinanceChartProps) => {
  const chartData = useMemo(() => {
    const monthlyData: Record<string, {income: number, expense: number}> = {};
    
    console.log(`Processando ${data.length} registros para o gráfico mensal`);
    
    // Iteramos por todos os registros para agrupar por mês
    data.forEach(record => {
      if (!record.data_movimentacao || record.valor === null || record.valor === undefined) {
        return;
      }
      
      const date = parseDate(record.data_movimentacao);
      if (!date) {
        console.log(`Falha ao analisar data: ${record.data_movimentacao}`);
        return;
      }
      
      // Formato de chave: YYYY-MM
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }
      
      // Usamos as funções auxiliares para determinar tipo de registro
      if (isIncome(record)) {
        monthlyData[monthYear].income += Math.abs(record.valor);
      } else if (isExpense(record)) {
        monthlyData[monthYear].expense += Math.abs(record.valor);
      }
    });
    
    console.log("Dados do gráfico mensal:", monthlyData);
    
    // Converter para array para o gráfico
    const chartArray = Object.entries(monthlyData)
      .map(([month, values]) => {
        // Extrair ano e mês
        const [year, monthNum] = month.split('-');
        // Criar array de nomes de meses abreviados
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        return {
          month: `${monthNames[parseInt(monthNum) - 1]}/${year.slice(2)}`,
          income: values.income,
          expense: values.expense
        };
      })
      .sort((a, b) => {
        // Ordenar pelo ano e mês
        const [monthA, yearA] = a.month.split('/');
        const [monthB, yearB] = b.month.split('/');
        
        // Converter abreviação de mês para índice
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const monthIndexA = monthNames.indexOf(monthA);
        const monthIndexB = monthNames.indexOf(monthB);
        
        // Comparar primeiro pelo ano, depois pelo mês
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
        return monthIndexA - monthIndexB;
      });
    
    console.log(`Gerados dados do gráfico com ${chartArray.length} meses:`, chartArray);
    return chartArray;
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-green-600 font-medium">
            Receitas: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-red-600 font-medium">
            Despesas: {formatCurrency(Math.abs(payload[1].value))}
          </p>
          <p className="text-sm font-medium border-t mt-1 pt-1">
            Saldo: {formatCurrency(payload[0].value - Math.abs(payload[1].value))}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-md border-muted/40">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg font-semibold">Receitas e Despesas Mensais</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {chartData.length > 0 ? (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={{ stroke: '#888' }}
                  tickLine={false}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => new Intl.NumberFormat('pt-BR', {
                    notation: 'compact',
                    compactDisplay: 'short'
                  }).format(value)}
                  axisLine={{ stroke: '#888' }}
                  tickLine={false}
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                <ReferenceLine y={0} stroke="#000" />
                <Bar dataKey="income" name="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Despesas" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[250px] bg-gray-50 rounded-lg">
            <p className="text-center text-muted-foreground py-4">
              Sem dados mensais para exibir.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyFinanceChart;
