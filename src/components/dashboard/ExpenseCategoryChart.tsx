
import { useMemo } from "react";
import { FinancialRecord, formatCurrency, isExpense } from "@/lib/supabaseUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  PieChart,
  ResponsiveContainer,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface ExpenseCategoryChartProps {
  data: FinancialRecord[];
}

// Cores mais vibrantes para o gráfico
const COLORS = [
  "#8B5CF6", // roxo vibrante
  "#F97316", // laranja vibrante
  "#0EA5E9", // azul oceano
  "#10B981", // verde esmeralda
  "#F43F5E", // rosa vibrante
  "#FBBF24", // amarelo âmbar
  "#6366F1", // indigo
  "#D946EF", // fúcsia
  "#14B8A6", // turquesa
  "#EC4899", // rosa magenta
];

// Mapeamento de categorias para grupos principais
const categoryGroups = {
  // Categorias de despesas fixas
  "Fixa: Banco": "Despesas Fixas",
  "Fixa: Carro": "Despesas Fixas",
  "Fixa: Comunicação": "Despesas Fixas",
  "Fixa: Educação": "Despesas Fixas",
  "Fixa: Habitação": "Despesas Fixas",
  "Fixa: Outras": "Despesas Fixas",
  "Fixa: Saúde": "Despesas Fixas",
  "Fixa: Lazer": "Despesas Fixas",

  // Categorias de despesas variáveis
  "Variável: Carro": "Despesas Variáveis",
  "Variável: Educação": "Despesas Variáveis",
  "Variável: Entretenimento": "Despesas Variáveis",
  "Variável: Habitação": "Despesas Variáveis",
  "Variável: Lazer": "Despesas Variáveis",
  "Variável: Outros": "Despesas Variáveis",
  "Variável: Pet": "Despesas Variáveis",
  "Variável: Presentes": "Despesas Variáveis",
  "Variável: Saúde": "Despesas Variáveis",
  "Variável: Trabalho": "Despesas Variáveis",
  "Variável: Transporte": "Despesas Variáveis",
  "Variável: Vestuário": "Despesas Variáveis",
  "Variável: Viagem": "Despesas Variáveis",
  "Variável: Estética": "Despesas Variáveis",
  "Variável: Mercado": "Despesas Variáveis",

  // Categorias de dívidas e cartões
  "Dívidas e Parcelados": "Dívidas e Parcelas",
  "Pagamento de fatura Cartão de Crédito": "Dívidas e Parcelas",

  // Categorias de investimentos
  "Investimentos": "Investimentos",

  // Categorias de receitas
  "Receita: Salário": "Receitas",
  "Receita: Outras": "Receitas",
  "Receita: Aposentadoria": "Receitas",
};

const ExpenseCategoryChart = ({ data }: ExpenseCategoryChartProps) => {
  const isMobile = useIsMobile();
  
  const chartData = useMemo(() => {
    // Filtrar apenas despesas (removendo investimentos)
    const expensesOnly = data.filter(record => isExpense(record));
    
    console.log("Records for chart:", expensesOnly.length, "records");
    if (expensesOnly.length > 0) {
      console.log("Sample record for chart:", {
        valor: expensesOnly[0].valor,
        classificacao: expensesOnly[0].classificacao
      });
    }
    
    const categoryMap = new Map<string, number>();
    
    expensesOnly.forEach(record => {
      const category = record.classificacao || "Não classificado";
      const amount = Math.abs(record.valor || 0);
      
      const currentAmount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentAmount + amount);
    });
    
    const result = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount);
    
    console.log("Categories data for chart:", result);
    
    // Se tivermos muitas categorias, agrupar as menores como "Outras"
    // For mobile, we should group even more categories to avoid overlap
    const maxCategories = isMobile ? 5 : 9;
    
    if (result.length > maxCategories) {
      const mainCategories = result.slice(0, maxCategories - 1);
      const otherCategories = result.slice(maxCategories - 1);
      
      const otherAmount = otherCategories.reduce((sum, cat) => sum + cat.amount, 0);
      
      return [
        ...mainCategories,
        { category: "Outras", amount: otherAmount }
      ];
    }
    
    return result;
  }, [data, isMobile]);

  // Formatar nomes de categorias para serem mais amigáveis
  const formatCategoryName = (category: string): string => {
    if (category.startsWith("Fixa: ")) {
      return category.replace("Fixa: ", "");
    } else if (category.startsWith("Variável: ")) {
      return category.replace("Variável: ", "");
    }
    return category;
  };

  // Determinar a qual grupo principal pertence a categoria
  const getCategoryGroup = (category: string): string => {
    return categoryGroups[category] || "Outras Despesas";
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-semibold">{formatCategoryName(data.category)}</p>
          <p className="text-sm font-medium">{formatCurrency(data.amount)}</p>
          <p className="text-xs text-muted-foreground">
            {getCategoryGroup(data.category)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-md border-muted/40">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg font-semibold">Categorias de Despesas</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {chartData.length > 0 ? (
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  outerRadius={isMobile ? 70 : 90}
                  innerRadius={isMobile ? 35 : 45}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="category"
                  paddingAngle={2}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    // On mobile, only show percentage labels for larger segments
                    if (isMobile && percent < 0.1) return null;
                    // On desktop, only show percentage labels for medium segments
                    if (!isMobile && percent < 0.05) return null;
                    
                    const radius = innerRadius + (outerRadius - innerRadius) * (isMobile ? 1.5 : 1.2);
                    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                    
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#333"
                        fontWeight="600"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        fontSize={isMobile ? 10 : 12}
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout={isMobile ? "horizontal" : "vertical"}
                  verticalAlign={isMobile ? "bottom" : "middle"}
                  align={isMobile ? "center" : "right"}
                  formatter={(value) => formatCategoryName(value as string)}
                  wrapperStyle={{ 
                    fontSize: isMobile ? '10px' : '12px', 
                    paddingLeft: isMobile ? '0px' : '10px',
                    overflowY: 'auto',
                    maxHeight: isMobile ? '60px' : '200px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[250px] bg-gray-50 rounded-lg">
            <p className="text-center text-muted-foreground py-4">
              Sem dados de despesas para exibir.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseCategoryChart;
