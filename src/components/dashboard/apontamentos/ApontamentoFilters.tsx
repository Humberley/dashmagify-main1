
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ApontamentoFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortOrder: "desc" | "asc";
  setSortOrder: (value: "desc" | "asc") => void;
  showIncomplete: boolean;
  setShowIncomplete: (value: boolean) => void;
  incompleteCount: number;
  isMobile: boolean;
}

const ApontamentoFilters: React.FC<ApontamentoFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  showIncomplete,
  setShowIncomplete,
  incompleteCount,
  isMobile,
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-2xl font-semibold leading-none tracking-tight">Apontamentos</div>
        
        {incompleteCount > 0 && (
          <Button 
            variant={showIncomplete ? "default" : "outline"}
            className={`flex items-center gap-2 ${showIncomplete ? "bg-yellow-500 hover:bg-yellow-600" : ""}`}
            onClick={() => setShowIncomplete(!showIncomplete)}
            size={isMobile ? "sm" : "default"}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>
              {showIncomplete ? "Todos" : `${incompleteCount} incompletos`}
            </span>
            {!showIncomplete && incompleteCount > 0 && (
              <Badge className="ml-1 bg-yellow-500">{incompleteCount}</Badge>
            )}
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 mt-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar apontamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select 
          value={sortOrder} 
          onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
        >
          <SelectTrigger className={isMobile ? "w-full" : "w-[180px]"}>
            <SelectValue placeholder="Ordenar por data" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Mais recentes primeiro</SelectItem>
            <SelectItem value="asc">Mais antigos primeiro</SelectItem>
          </SelectContent>
        </Select>
        
        {searchTerm && (
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm("")}
            className={isMobile ? "w-full" : "shrink-0"}
          >
            Limpar
          </Button>
        )}
      </div>
    </>
  );
};

export default ApontamentoFilters;
