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
import { formatCurrencyValue } from "@/lib/utils";

interface Column {
  header: string;
  accessorKey?: string;
  cell?: (props: { row: any }) => any;
}

interface DataTableProps {
  title?: string;
  data: Array<Record<string, any>>;
  columns: Column[];
  isLoading?: boolean;
  noDataMessage?: string;
}

const DataTable = ({ 
  title, 
  data, 
  columns, 
  isLoading = false, 
  noDataMessage = "Nenhum dado disponível" 
}: DataTableProps) => {
  const [validData, setValidData] = useState<Array<Record<string, any>>>([]);
  
  useEffect(() => {
    // Less strict filtering - only filter out completely empty rows
    const filtered = data.filter(item => {
      // Keep any row that has at least one value in the columns we care about
      return columns.some(col => {
        if (!col.accessorKey) return true; // For columns with custom cell renderers
        return item[col.accessorKey] !== undefined && 
               item[col.accessorKey] !== null && 
               item[col.accessorKey] !== "";
      });
    });
    
    console.log(`DataTable ${title ? `'${title}'` : ''} filtered data:`, filtered);
    setValidData(filtered);
  }, [data, columns, title]);

  const renderCellContent = (row: any, col: Column) => {
    try {
      // For custom cell renderers, pass the entire row object
      if (col.cell) {
        return col.cell({ row });
      } else if (col.accessorKey) {
        // For columns like "Valor" that should be formatted as currency
        if (col.header === "Valor" || col.header === "Valor Mensal" || 
            col.header === "Valor Diário" || col.header.includes("Valor")) { 
          return formatCurrencyValue(row[col.accessorKey]);
        }
        return row[col.accessorKey] || '-';
      }
      return '-';
    } catch (error) {
      console.error("Error rendering cell:", error);
      return '-';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <div className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        <p className="text-muted-foreground py-6 text-center">{noDataMessage}</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index} className="font-bold">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {validData.length > 0 ? (
              validData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={`${rowIndex}-${colIndex}`}>
                      {renderCellContent(row, col)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-4">
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default DataTable;
