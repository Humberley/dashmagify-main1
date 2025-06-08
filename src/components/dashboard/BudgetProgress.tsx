
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface BudgetStatus {
  total: number;
  spent: number;
  remaining: number;
}

interface BudgetProgressProps {
  budgetStatus: BudgetStatus;
}

const BudgetProgress = ({ budgetStatus }: BudgetProgressProps) => {
  const percentage = Math.round((budgetStatus.spent / budgetStatus.total) * 100);
  
  let statusColor = "bg-primary";
  if (percentage > 80) {
    statusColor = "bg-red-500";
  } else if (percentage > 60) {
    statusColor = "bg-yellow-500";
  } else if (percentage > 40) {
    statusColor = "bg-green-500";
  }

  return (
    <Card className="magify-card">
      <CardHeader>
        <CardTitle className="text-lg">Monthly Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Budget Used</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          
          <Progress value={percentage} className={`h-3 ${statusColor}`} />
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Spent</div>
              <div className="font-semibold">${budgetStatus.spent.toFixed(2)}</div>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-lg">
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div className="font-semibold">${budgetStatus.remaining.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <div className="text-sm text-muted-foreground">
              Total Budget: <span className="text-foreground font-medium">${budgetStatus.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
