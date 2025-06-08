
import { useState } from "react";
import { FinancialRecord } from "@/lib/supabaseUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Calendar } from "lucide-react";

interface AlertsSectionProps {
  data: FinancialRecord[];
}

interface IncompleteRecord {
  id: string;
  issueType: "data_movimentacao" | "classificacao" | "descricao" | "forma_pagamento";
  issueMessage: string;
  record: FinancialRecord;
}

const AlertsSection = ({ data }: AlertsSectionProps) => {
  const { toast } = useToast();
  const [selectedRecord, setSelectedRecord] = useState<IncompleteRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateValue, setUpdateValue] = useState("");

  // Get records with missing data
  const incompleteRecords: IncompleteRecord[] = data
    .filter(record => {
      return !record.data_movimentacao || 
             !record.classificacao || 
             !record.descricao || 
             !record.forma_pagamento;
    })
    .map(record => {
      // Determine what's missing
      if (!record.data_movimentacao) {
        return {
          id: record.id,
          issueType: "data_movimentacao" as const,
          issueMessage: "Data de movimentação não informada",
          record
        };
      } else if (!record.classificacao) {
        return {
          id: record.id,
          issueType: "classificacao" as const,
          issueMessage: "Classificação não informada",
          record
        };
      } else if (!record.descricao) {
        return {
          id: record.id,
          issueType: "descricao" as const,
          issueMessage: "Descrição não informada",
          record
        };
      } else {
        return {
          id: record.id,
          issueType: "forma_pagamento" as const,
          issueMessage: "Forma de pagamento não informada",
          record
        };
      }
    });

  const handleFixRecord = (record: IncompleteRecord) => {
    setSelectedRecord(record);
    setUpdateValue(record.issueType === "data_movimentacao" 
      ? "" 
      : record.record[record.issueType] || "");
    setIsOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedRecord) return;
    
    setIsUpdating(true);
    
    try {
      let updatedValue = selectedRecord.issueType === "data_movimentacao" 
        ? new Date(updateValue).toISOString().split('T')[0]
        : updateValue;
        
      const { error } = await supabase
        .from('historico_financeiro')
        .update({ [selectedRecord.issueType]: updatedValue })
        .eq('id', selectedRecord.id);
        
      if (error) throw error;
      
      toast({
        title: "Registro atualizado",
        description: "O registro foi atualizado com sucesso",
      });
      
      setIsOpen(false);
      
      // Refresh the page to get the updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating record:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o registro",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (incompleteRecords.length === 0) {
    return null; // Don't render anything if no alerts
  }

  return (
    <>
      <Card className="border-yellow-300 bg-yellow-50/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg font-semibold text-yellow-800">
                Registros Incompletos
              </CardTitle>
            </div>
            <Badge variant="outline" className="bg-yellow-200/80 text-yellow-800 border-yellow-400">
              {incompleteRecords.length} {incompleteRecords.length === 1 ? 'item' : 'itens'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mt-2">
            {incompleteRecords.slice(0, 3).map((item) => (
              <Alert key={item.id} variant="warning" className="flex items-center justify-between">
                <div>
                  <AlertTitle>
                    {item.issueMessage}
                  </AlertTitle>
                  <AlertDescription className="text-sm text-yellow-800/80 mt-1">
                    {item.record.descricao || item.record.classificacao || 'Transação não identificada'} 
                    {item.record.valor ? ` - Valor: ${new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(item.record.valor)}` : ''}
                  </AlertDescription>
                </div>
                <Button
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={() => handleFixRecord(item)}
                >
                  Corrigir
                </Button>
              </Alert>
            ))}
            
            {incompleteRecords.length > 3 && (
              <Button 
                variant="link" 
                className="text-yellow-600"
                onClick={() => window.location.href = '/apontamentos'}
              >
                Ver todos os {incompleteRecords.length} registros incompletos
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog for fixing records */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRecord?.issueMessage}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Preencha o valor abaixo para corrigir este registro.
            </p>
            
            {selectedRecord?.issueType === "data_movimentacao" ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 opacity-70" />
                <Input 
                  type="date" 
                  value={updateValue} 
                  onChange={(e) => setUpdateValue(e.target.value)}
                />
              </div>
            ) : (
              <Input 
                placeholder={`Informe ${
                  selectedRecord?.issueType === "classificacao" ? "a classificação" :
                  selectedRecord?.issueType === "descricao" ? "a descrição" : 
                  "a forma de pagamento"
                }`}
                value={updateValue}
                onChange={(e) => setUpdateValue(e.target.value)}
              />
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              disabled={isUpdating || !updateValue} 
              onClick={handleUpdate}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertsSection;
