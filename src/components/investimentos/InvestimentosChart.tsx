
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FinancialEntry } from '@/lib/financeUtils';
import { useState, useEffect } from 'react';

interface InvestimentosChartProps {
  investimentos: FinancialEntry[];
}

const COLORS = [
  '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9', '#10B981', 
  '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#EF4444'
];

const InvestimentosChart = ({ investimentos }: InvestimentosChartProps) => {
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);
  
  useEffect(() => {
    if (!investimentos.length) {
      setChartData([]);
      return;
    }
    
    // Agrupar os investimentos por categoria usando o valor atual
    const categorias = new Map<string, number>();
    
    investimentos.forEach(investimento => {
      try {
        if (!investimento.descricao) return;
        
        const detalhes = JSON.parse(investimento.descricao);
        const categoria = detalhes.categoria || "Não categorizado";
        const valorAtual = detalhes.valor_atual || investimento.valor;
        
        const valorAtualCategoria = categorias.get(categoria) || 0;
        categorias.set(categoria, valorAtualCategoria + valorAtual);
      } catch (e) {
        // Em caso de erro ao processar a descrição, ignore este investimento
      }
    });
    
    // Converter para o formato esperado pelo gráfico
    const data = Array.from(categorias.entries()).map(([name, value]) => ({
      name,
      value
    }));
    
    setChartData(data);
  }, [investimentos]);
  
  if (!chartData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">
          Nenhum dado disponível para visualização
        </p>
      </div>
    );
  }
  
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Formatar como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, value }) => `${name}: ${((value / total) * 100).toFixed(1)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [formatCurrency(value as number), 'Valor']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InvestimentosChart;
