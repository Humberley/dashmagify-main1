
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";

const PrevisaoLoading = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Previsão</h1>
      <Skeleton className="h-64 w-full" />
    </div>
  );
};

export default PrevisaoLoading;
