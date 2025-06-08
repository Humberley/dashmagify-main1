
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck, CalendarMinus } from "lucide-react";

interface ApontamentosInfoCardProps {
  showForecast?: boolean;
}

const ApontamentosInfoCard: React.FC<ApontamentosInfoCardProps> = ({ 
  showForecast = true 
}) => {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {showForecast ? (
            <CalendarMinus className="h-5 w-5 text-muted-foreground mt-0.5" />
          ) : (
            <CalendarCheck className="h-5 w-5 text-primary mt-0.5" />
          )}
          
          <div>
            <h3 className="font-semibold mb-1">
              {showForecast 
                ? "Visualizando realizados e previstos" 
                : "Visualizando apenas realizados"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {showForecast
                ? "Os apontamentos incluem tanto transações realizadas quanto previsões futuras. As previsões são exibidas em um formato mais discreto."
                : "Apenas transações efetivamente realizadas estão sendo exibidas."
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApontamentosInfoCard;
