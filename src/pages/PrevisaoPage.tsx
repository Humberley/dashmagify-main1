
import DashboardLayout from "@/components/DashboardLayout";
import PrevisaoHeader from "@/components/previsao/PrevisaoHeader";
import PrevisaoExplanation from "@/components/previsao/PrevisaoExplanation";
import PrevisaoEmptyState from "@/components/previsao/PrevisaoEmptyState";
import PrevisaoTable from "@/components/previsao/PrevisaoTable";
import PrevisaoError from "@/components/previsao/PrevisaoError";
import PrevisaoLoading from "@/components/previsao/PrevisaoLoading";
import { usePrevisaoData } from "@/hooks/usePrevisaoData";

const PrevisaoPage = () => {
  const {
    isLoading,
    isRefreshing,
    error,
    forecast,
    hasNoEntries,
    handleRefresh
  } = usePrevisaoData();

  if (isLoading) {
    return (
      <DashboardLayout>
        <PrevisaoLoading />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <PrevisaoHeader 
            onRefresh={handleRefresh} 
            isRefreshing={isRefreshing}
          />
          <PrevisaoError 
            error={error} 
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PrevisaoHeader 
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <PrevisaoExplanation />
        <PrevisaoEmptyState hasNoEntries={hasNoEntries} />
        <PrevisaoTable forecast={forecast} />
      </div>
    </DashboardLayout>
  );
};

export default PrevisaoPage;
