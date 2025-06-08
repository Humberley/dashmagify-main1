
import { useState, useEffect } from "react";
import { FinancialRecord } from "@/lib/supabaseUtils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import ApontamentoFilters from "./apontamentos/ApontamentoFilters";
import { ApontamentoCard, isIncompleteRecord } from "./apontamentos/ApontamentoCard";
import ApontamentoTable from "./apontamentos/ApontamentoTable";
import ApontamentoEmptyState from "./apontamentos/ApontamentoEmptyState";

interface ApontamentosSectionProps {
  data: FinancialRecord[];
  onEditClick?: (record: FinancialRecord) => void;
  onDeleteClick?: (recordId: string) => Promise<boolean>;
}

const ApontamentosSection = ({ 
  data, 
  onEditClick = () => {}, 
  onDeleteClick 
}: ApontamentosSectionProps) => {
  const [filteredData, setFilteredData] = useState<FinancialRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showIncomplete, setShowIncomplete] = useState<boolean>(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    console.log("Apontamentos raw data:", data);
    
    if (!data || data.length === 0) {
      setFilteredData([]);
      return;
    }
    
    let processedData = [...data];
    
    // Filter incomplete records if selected
    if (showIncomplete) {
      processedData = processedData.filter(item => 
        !item.data_movimentacao || 
        !item.classificacao || 
        !item.descricao || 
        !item.forma_pagamento
      );
    }
    
    // Apply search term filter
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      processedData = processedData.filter(item => {
        // Search in multiple fields
        return (
          (item.classificacao && item.classificacao.toLowerCase().includes(searchLower)) ||
          (item.descricao && item.descricao.toLowerCase().includes(searchLower)) ||
          (item.identificacao && item.identificacao.toLowerCase().includes(searchLower)) ||
          (item.forma_pagamento && item.forma_pagamento.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Sort by date
    processedData.sort((a, b) => {
      // Handle null dates
      if (!a.data_movimentacao) return 1;
      if (!b.data_movimentacao) return -1;
      
      const dateA = new Date(a.data_movimentacao).getTime();
      const dateB = new Date(b.data_movimentacao).getTime();
      
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    
    setFilteredData(processedData);
  }, [data, searchTerm, sortOrder, showIncomplete]);
  
  // Count incomplete records
  const incompleteCount = data?.filter(isIncompleteRecord).length || 0;

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <ApontamentoFilters 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            showIncomplete={showIncomplete}
            setShowIncomplete={setShowIncomplete}
            incompleteCount={incompleteCount}
            isMobile={isMobile}
          />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum apontamento encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <ApontamentoFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          showIncomplete={showIncomplete}
          setShowIncomplete={setShowIncomplete}
          incompleteCount={incompleteCount}
          isMobile={isMobile}
        />
      </CardHeader>
      <CardContent>
        {isMobile ? (
          // Mobile view - card list
          <div className="space-y-2">
            {filteredData.length > 0 ? (
              filteredData.map(item => (
                <ApontamentoCard 
                  key={item.id} 
                  item={item} 
                  onEdit={onEditClick}
                  onDelete={onDeleteClick}
                />
              ))
            ) : (
              <ApontamentoEmptyState searchTerm={searchTerm} />
            )}
          </div>
        ) : (
          // Desktop view - table
          filteredData.length > 0 ? (
            <ApontamentoTable 
              data={filteredData} 
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
            />
          ) : (
            <ApontamentoEmptyState searchTerm={searchTerm} />
          )
        )}
      </CardContent>
    </Card>
  );
};

export default ApontamentosSection;
