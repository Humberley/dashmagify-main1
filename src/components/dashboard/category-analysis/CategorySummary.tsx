
import React from "react";
import { CategoryIcon } from "./CategoryIcon";
import { formatCurrency } from "@/lib/supabaseUtils";

interface CategorySummaryProps {
  selectedCategory: string;
  isIncome: boolean;
  totalAmount: number;
}

const CategorySummary: React.FC<CategorySummaryProps> = ({
  selectedCategory,
  isIncome,
  totalAmount
}) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <CategoryIcon category={selectedCategory} isIncome={isIncome} />
        <div>
          <h4 className="font-semibold">{selectedCategory}</h4>
          <p className="text-sm text-muted-foreground">
            {isIncome ? 'Total recebido nessa categoria' : 'Total gasto nessa categoria'}
          </p>
        </div>
      </div>
      <div className={`text-xl font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
        {formatCurrency(totalAmount)}
      </div>
    </div>
  );
};

export default CategorySummary;
