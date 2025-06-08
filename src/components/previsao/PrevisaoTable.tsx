
import { FinancialEntry } from "@/lib/financeUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyBR } from "@/lib/financeUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrevisaoTableProps {
  forecast: any[];
}

const PrevisaoTable = ({ forecast }: PrevisaoTableProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-xl">Previsão Financeira - Próximos 24 Meses</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Receitas</TableHead>
                <TableHead>Despesas Fixas</TableHead>
                <TableHead>Despesas Variáveis</TableHead>
                <TableHead>Investimentos</TableHead>
                <TableHead>Dívidas/Parcelas</TableHead>
                <TableHead>Saldo do Mês</TableHead>
                <TableHead>Saldo Acumulado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecast.length > 0 ? (
                forecast.map((month, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{month.mes}</TableCell>
                    <TableCell className="text-green-600">{formatCurrencyBR(month.receitas)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrencyBR(month.despesas_fixas)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrencyBR(month.despesas_variaveis)}</TableCell>
                    <TableCell className="text-blue-600">{formatCurrencyBR(month.investimentos)}</TableCell>
                    <TableCell className="text-red-600">{formatCurrencyBR(month.dividas_parcelas)}</TableCell>
                    <TableCell className={month.saldo_mes >= 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrencyBR(month.saldo_mes)}
                    </TableCell>
                    <TableCell 
                      className={`font-bold ${month.saldo_acumulado >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {formatCurrencyBR(month.saldo_acumulado)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="text-muted-foreground">
                      <p>Não há dados suficientes para gerar uma previsão.</p>
                      <p className="mt-1">
                        Adicione receitas, despesas e outros itens nas seções correspondentes.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrevisaoTable;
