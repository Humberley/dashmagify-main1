
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ExpenseCategory {
  category: string;
  amount: number;
}

interface ExpenseChartProps {
  data: ExpenseCategory[];
}

// Pastel colors for chart
const COLORS = [
  "#BDEBD0", // mint
  "#E5DEFF", // lavender
  "#D3E4FD", // blue
  "#FDE1D3", // peach
  "#FFDEE2", // pink
  "#FEF7CD", // yellow
  "#D0F0FD", // light blue
  "#F5E9FF", // light purple
];

const ExpenseChart = ({ data }: ExpenseChartProps) => {
  const [chartData, setChartData] = useState(data);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderLabel = (entry: any) => {
    return windowWidth > 768 ? entry.category : "";
  };

  return (
    <Card className="magify-card">
      <CardHeader>
        <CardTitle className="text-lg">Expense Categories</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={windowWidth > 768}
              label={renderLabel}
              outerRadius={windowWidth > 768 ? 100 : 80}
              fill="#8884d8"
              dataKey="amount"
              nameKey="category"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Amount']}
              contentStyle={{ 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ExpenseChart;
