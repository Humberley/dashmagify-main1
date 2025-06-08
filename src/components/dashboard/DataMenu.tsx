
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DataMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DataMenu = ({ activeSection, onSectionChange }: DataMenuProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    { id: 'previsao', label: 'Previsão' },
    { id: 'receitas', label: 'Receitas' },
    { id: 'despesasFixas', label: 'Despesas Fixas' },
    { id: 'variaveis', label: 'Variáveis' },
    { id: 'investimentos', label: 'Investimentos' },
    { id: 'dividasEParcelas', label: 'Dívidas e Parcelas' },
    { id: 'apontamentos', label: 'Apontamentos' },
  ];

  return (
    <div className="bg-card rounded-lg border shadow-sm p-2 mb-6">
      <div 
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-semibold">Categorias</h3>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>
      
      {isExpanded && (
        <ScrollArea className="h-[200px]">
          <div className="p-2 space-y-1">
            {menuItems.map((item) => (
              <Button 
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"} 
                className="w-full justify-start text-sm"
                onClick={() => onSectionChange(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default DataMenu;
