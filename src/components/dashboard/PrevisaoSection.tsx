import { PrevisaoItem } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PrevisaoSectionProps {
  data: PrevisaoItem[];
}

const PrevisaoSection = ({ data }: PrevisaoSectionProps) => {
  const [validData, setValidData] = useState<PrevisaoItem[]>([]);
  const [isEmpty, setIsEmpty] = useState(false);
  
  useEffect(() => {
    // Log incoming data for debugging
    console.log("PrevisaoSection - Raw data received:", data);
    
    // More lenient filtering - keep items with any reasonable data
    const filtered = data.filter(item => {
      // Accept any item that has at least a description or any month value
      const hasDescription = item["Descrição"] !== undefined && item["Descrição"] !== null && item["Descrição"] !== "";
      
      // Check if it has any month column with data
      const hasMonthData = Object.keys(item).some(key => 
        /^[a-z]{3}\.\/\d{2}$/.test(key) && item[key] !== undefined && item[key] !== null
      );
      
      // Accept items that have either description or month data
      return hasDescription || hasMonthData;
    });
    
    console.log("Previsão filtered data:", filtered);
    setValidData(filtered);
    setIsEmpty(filtered.length === 0);
  }, [data]);

  // Get all month columns dynamically with more robust detection
  const getMonthColumns = () => {
    if (!data || data.length === 0) return [];
    
    // Collect month columns from all items to ensure we don't miss any
    const monthKeys = new Set<string>();
    
    data.forEach(item => {
      Object.keys(item || {}).forEach(key => {
        if (/^[a-z]{3}\.\/\d{2}$/.test(key)) {
          monthKeys.add(key);
        }
      });
    });
    
    // Sort month columns chronologically
    const sortedMonths = Array.from(monthKeys).sort((a, b) => {
      // Extract month and year for comparison
      const [monthA, yearA] = a.split('/');
      const [monthB, yearB] = b.split('/');
      
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }
      
      // Map month abbreviations to numbers for sorting
      const monthMap: {[key: string]: number} = {
        'jan.': 1, 'fev.': 2, 'mar.': 3, 'abr.': 4, 'mai.': 5, 'jun.': 6,
        'jul.': 7, 'ago.': 8, 'set.': 9, 'out.': 10, 'nov.': 11, 'dez.': 12
      };
      
      return monthMap[monthA.toLowerCase()] - monthMap[monthB.toLowerCase()];
    });
    
    console.log("Month columns found:", sortedMonths);
    return sortedMonths;
  };

  const monthColumns = getMonthColumns();
  
  // Format currency with improved handling
  const formatCurrency = (value: any) => {
    if (value === undefined || value === null || value === "") return "-";
    
    // Handle string values that might be formatted currencies already
    if (typeof value === 'string') {
      // If it already looks like a formatted currency, return it as is
      if (value.includes('R$')) return value;
      
      // Try to convert string to number if possible
      const cleanValue = value.replace(/[^0-9,.-]/g, '').replace(',', '.');
      const numValue = parseFloat(cleanValue);
      
      if (!isNaN(numValue)) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(numValue);
      }
      
      // If we couldn't parse it as a number, return the original string
      return value;
    }
    
    if (typeof value === 'number') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(value);
    }
    
    // If it's some other type, convert to string
    return String(value);
  };

  // Format column header for better display
  const formatColumnHeader = (col: string) => {
    if (col === "col_3") return "Total";
    
    // Format month headers nicely
    if (/^[a-z]{3}\.\/\d{2}$/.test(col)) {
      // Capitalize the month abbreviation
      const [month, year] = col.split('/');
      return month.charAt(0).toUpperCase() + month.slice(1) + '/' + year;
    }
    
    return col;
  };

  if (!data || data.length === 0 || isEmpty) {
    return (
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Previsão</h2>
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum dado de previsão disponível no momento. Tente atualizar os dados ou verificar sua conexão com n8n.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">Previsão</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Descrição</TableHead>
              <TableHead className="font-bold">{formatColumnHeader("col_3")}</TableHead>
              {monthColumns.map((month) => (
                <TableHead key={month} className="font-bold">{formatColumnHeader(month)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {validData.length > 0 ? (
              validData.map((item, index) => (
                <TableRow 
                  key={index} 
                  className={
                    item["Descrição"] === "Saldo acumulado" ? "bg-muted/30 font-semibold" : 
                    item["Descrição"] === "Saldo" ? "bg-primary/10" : ""
                  }
                >
                  <TableCell className="font-medium">{item["Descrição"] || '-'}</TableCell>
                  <TableCell>{formatCurrency(item.col_3)}</TableCell>
                  {monthColumns.map((month) => (
                    <TableCell key={month}>
                      {formatCurrency(item[month])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2 + monthColumns.length} className="text-center py-4">
                  Nenhum dado disponível para exibição
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default PrevisaoSection;
