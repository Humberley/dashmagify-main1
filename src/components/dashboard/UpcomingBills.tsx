
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
}

interface UpcomingBillsProps {
  bills: Bill[];
}

const UpcomingBills = ({ bills }: UpcomingBillsProps) => {
  // Sort bills by due date
  const sortedBills = [...bills].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <Card className="magify-card">
      <CardHeader>
        <CardTitle className="text-lg">Upcoming Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedBills.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No upcoming bills
            </div>
          ) : (
            sortedBills.map((bill) => {
              // Calculate days remaining until due date
              const today = new Date();
              const dueDate = new Date(bill.dueDate);
              const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
              
              let statusColor = "bg-gray-100 text-gray-700";
              if (daysRemaining <= 3) {
                statusColor = "bg-red-100 text-red-700";
              } else if (daysRemaining <= 7) {
                statusColor = "bg-yellow-100 text-yellow-700";
              } else {
                statusColor = "bg-green-100 text-green-700";
              }

              return (
                <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <h4 className="font-medium">{bill.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(bill.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">${bill.amount.toFixed(2)}</div>
                    <div className={`text-xs rounded-full px-2 py-1 ${statusColor}`}>
                      {daysRemaining <= 0 ? "Due today" : `${daysRemaining} days left`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingBills;
