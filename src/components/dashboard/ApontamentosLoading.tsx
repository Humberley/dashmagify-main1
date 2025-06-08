
import { Skeleton } from "@/components/ui/skeleton";

const ApontamentosLoading = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-xl md:text-3xl font-bold">Apontamentos</h1>
      <Skeleton className="h-64 w-full" />
    </div>
  );
};

export default ApontamentosLoading;
