
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FinancialRecord } from "@/lib/supabaseUtils";
import { useApontamentosData } from "@/hooks/useApontamentosData";

// Import smaller components
import ApontamentosHeader from "@/components/dashboard/ApontamentosHeader";
import ApontamentosInfoCard from "@/components/dashboard/ApontamentosInfoCard";
import ApontamentosLoading from "@/components/dashboard/ApontamentosLoading";
import ApontamentosError from "@/components/dashboard/ApontamentosError";
import ApontamentosSection from "@/components/dashboard/ApontamentosSection";
import ApontamentoEditModal from "@/components/dashboard/ApontamentoEditModal";

const ApontamentosPage = () => {
  const { 
    data, 
    isLoading, 
    isRefreshing, 
    error, 
    handleRefresh,
    handleUpdateRecord,
    handleDeleteRecord 
  } = useApontamentosData();
  
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showForecast, setShowForecast] = useState(true); // State to control forecast display

  const handleEditClick = (record: FinancialRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedRecord: FinancialRecord) => {
    const success = await handleUpdateRecord(updatedRecord);
    if (success) {
      setIsEditModalOpen(false);
      setEditingRecord(null);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <ApontamentosLoading />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <ApontamentosError message={error || undefined} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ApontamentosHeader 
          onRefresh={handleRefresh} 
          isRefreshing={isRefreshing}
          showForecast={showForecast}
          onToggleForecast={() => setShowForecast(!showForecast)}
        />

        <ApontamentosInfoCard showForecast={showForecast} />

        <ApontamentosSection 
          data={data.filter(record => 
            // If showForecast is true, show all records
            // Otherwise only show realized records
            showForecast || record.tipo_registro !== 'previsto'
          )} 
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteRecord}
        />

        {editingRecord && (
          <ApontamentoEditModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            record={editingRecord}
            onSave={handleSaveEdit}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApontamentosPage;
