
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressCardProps {
  title: string;
  value: number;
  max: number;
  description?: string;
  formatValue?: (value: number) => string;
  formatMax?: (max: number) => string;
  progressColor?: string;
  icon?: ReactNode;
  className?: string;
}

const ProgressCard = ({
  title,
  value,
  max,
  description,
  formatValue = (v) => `${v}`,
  formatMax = (m) => `${m}`,
  progressColor,
  icon,
  className,
}: ProgressCardProps) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  
  return (
    <Card className={cn("overflow-hidden magify-card", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="p-2 rounded-full bg-muted/30 text-primary">{icon}</div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{formatValue(value)}</span>
            <span className="text-sm text-muted-foreground">
              of {formatMax(max)}
            </span>
          </div>
          <Progress 
            value={percentage} 
            className={cn(
              "h-2", 
              progressColor
            )} 
          />
          {description && (
            <p className="text-xs text-muted-foreground pt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressCard;
