
import React from "react";

interface ApontamentoEmptyStateProps {
  searchTerm: string;
}

const ApontamentoEmptyState: React.FC<ApontamentoEmptyStateProps> = ({ searchTerm }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <img 
        src="/lovable-uploads/01375c46-ab91-43fe-afd1-b803656b67c9.png" 
        alt="Robô Magify" 
        className="w-40 h-auto mb-4"
      />
      <p className="text-lg font-medium text-muted-foreground">
        {searchTerm 
          ? "Nenhum resultado encontrado para a busca" 
          : "Nenhum apontamento disponível"}
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        {searchTerm 
          ? "Tente usar outros termos de busca" 
          : "Adicione um novo apontamento para começar"}
      </p>
    </div>
  );
};

export default ApontamentoEmptyState;
