
import { FinancialRecord } from "@/lib/supabaseUtils";
import ExpenseCategoryChart from "@/components/dashboard/ExpenseCategoryChart";
import MonthlyFinanceChart from "@/components/dashboard/MonthlyFinanceChart";

interface ChartSectionProps {
  data: FinancialRecord[];
}

const ChartSection = ({ data }: ChartSectionProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ExpenseCategoryChart data={data} />
      <MonthlyFinanceChart data={data} />
    </div>
  );
};

export default ChartSection;
