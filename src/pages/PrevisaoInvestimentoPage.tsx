
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { formatCurrencyBR } from "@/lib/financeUtils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PrevisaoInvestimentoPage = () => {
  // Estado para valores do formulário
  const [valorInicial, setValorInicial] = useState<number>(1000);
  const [valorMensal, setValorMensal] = useState<number>(200);
  const [taxaJuros, setTaxaJuros] = useState<number>(0.8); // 0.8% ao mês
  const [periodo, setPeriodo] = useState<number>(60); // 60 meses (5 anos)
  const [tipoInvestimento, setTipoInvestimento] = useState<"mensal" | "unico">("mensal");
  const [dadosCalculados, setDadosCalculados] = useState<any[]>([]);
  const [totalInvestido, setTotalInvestido] = useState<number>(0);
  const [totalJuros, setTotalJuros] = useState<number>(0);
  const [valorFinal, setValorFinal] = useState<number>(0);

  // Função para calcular o investimento
  const calcularInvestimento = () => {
    const dados = [];
    let valorAcumulado = valorInicial;
    let totalInv = valorInicial;
    let totalJur = 0;
    
    for (let i = 0; i <= periodo; i++) {
      // Adicionamos aportes mensais apenas se for investimento mensal e não for o mês inicial
      if (tipoInvestimento === "mensal" && i > 0) {
        valorAcumulado += valorMensal;
        totalInv += valorMensal;
      }
      
      // Calculamos os juros apenas após o primeiro mês
      if (i > 0) {
        const juros = valorAcumulado * (taxaJuros / 100);
        valorAcumulado += juros;
        totalJur += juros;
      }
      
      dados.push({
        mes: i,
        valor: valorAcumulado,
        jurosAcumulados: totalJur,
        investido: totalInv
      });
    }
    
    setDadosCalculados(dados);
    setTotalInvestido(totalInv);
    setTotalJuros(totalJur);
    setValorFinal(valorAcumulado);
  };

  // Análise do investimento
  const analisarInvestimento = () => {
    const taxaAnual = (Math.pow(1 + taxaJuros / 100, 12) - 1) * 100;
    const inflacaoEstimada = 4.0; // Estimativa de inflação anual (%)
    
    let analise = [];
    
    if (taxaAnual > inflacaoEstimada + 3) {
      analise.push("Este investimento está significativamente acima da inflação, o que é excelente para preservar e aumentar seu poder de compra.");
    } else if (taxaAnual > inflacaoEstimada) {
      analise.push("Este investimento está superando a inflação, o que é positivo para manter seu poder de compra.");
    } else {
      analise.push("Atenção: Este investimento pode não superar a inflação no longo prazo, comprometendo seu poder de compra.");
    }
    
    if (totalJuros > totalInvestido * 0.3) {
      analise.push("Os juros compostos estão trabalhando bem a seu favor, representando uma parte significativa do resultado final.");
    }
    
    if (periodo >= 60) {
      analise.push("Investimentos de longo prazo como este tendem a diluir a volatilidade do mercado e maximizar os juros compostos.");
    }
    
    return analise;
  };

  // Formatar taxa anual
  const taxaAnualEquivalente = (Math.pow(1 + taxaJuros / 100, 12) - 1) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Previsão de Investimento</h1>
        
        <Card className="p-4 bg-muted/10 mb-6">
          <h3 className="font-semibold mb-2">Como funciona?</h3>
          <p className="text-sm text-muted-foreground">
            Simule seus investimentos preenchendo os valores abaixo. Você pode escolher entre investir 
            mensalmente ou fazer um único aporte. O sistema calculará o crescimento do seu patrimônio 
            considerando juros compostos.
          </p>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Formulário de entrada */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl">Parâmetros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="valorInicial">Valor inicial (R$)</Label>
                  <Input
                    id="valorInicial"
                    type="number"
                    value={valorInicial}
                    onChange={(e) => setValorInicial(Number(e.target.value))}
                    min="0"
                    step="100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipoInvestimento">Tipo de investimento</Label>
                  <RadioGroup 
                    value={tipoInvestimento} 
                    onValueChange={(value) => setTipoInvestimento(value as "mensal" | "unico")}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mensal" id="mensal" />
                      <Label htmlFor="mensal">Investimento mensal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unico" id="unico" />
                      <Label htmlFor="unico">Aporte único</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {tipoInvestimento === "mensal" && (
                  <div className="space-y-2">
                    <Label htmlFor="valorMensal">Valor mensal (R$)</Label>
                    <Input
                      id="valorMensal"
                      type="number"
                      value={valorMensal}
                      onChange={(e) => setValorMensal(Number(e.target.value))}
                      min="0"
                      step="50"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="taxaJuros">Taxa de juros (% ao mês)</Label>
                  <Input
                    id="taxaJuros"
                    type="number"
                    value={taxaJuros}
                    onChange={(e) => setTaxaJuros(Number(e.target.value))}
                    step="0.1"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {taxaJuros ? `Equivale a ${taxaAnualEquivalente.toFixed(2)}% ao ano` : ''}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período (meses)</Label>
                  <Input
                    id="periodo"
                    type="number"
                    value={periodo}
                    onChange={(e) => setPeriodo(Number(e.target.value))}
                    min="1"
                    max="600"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {periodo ? `Equivale a ${(periodo / 12).toFixed(1)} anos` : ''}
                  </p>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={calcularInvestimento}
                  disabled={
                    valorInicial < 0 || 
                    (tipoInvestimento === "mensal" && valorMensal < 0) || 
                    taxaJuros < 0 ||
                    periodo <= 0
                  }
                >
                  Calcular
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Resultados */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              {dadosCalculados.length > 0 ? (
                <Tabs defaultValue="grafico">
                  <TabsList className="mb-4">
                    <TabsTrigger value="grafico">Gráfico</TabsTrigger>
                    <TabsTrigger value="analise">Análise</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="grafico" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-muted/20 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">Total Investido</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrencyBR(totalInvestido)}
                        </p>
                      </div>
                      <div className="bg-muted/20 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">Juros Acumulados</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrencyBR(totalJuros)}
                        </p>
                      </div>
                      <div className="bg-muted/20 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">Valor Final</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrencyBR(valorFinal)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={dadosCalculados}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis
                            dataKey="mes"
                            label={{ value: 'Meses', position: 'insideBottomRight', offset: -10 }}
                            tickFormatter={(value) => {
                              // Mostrar apenas alguns ticks para não sobrecarregar o gráfico
                              if (periodo <= 12) return value;
                              if (periodo <= 60 && value % 6 === 0) return value;
                              if (periodo <= 120 && value % 12 === 0) return value;
                              if (value % 24 === 0) return value;
                              return '';
                            }}
                          />
                          <YAxis 
                            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            formatter={(value: number) => [formatCurrencyBR(value), ""]}
                            labelFormatter={(label) => `Mês ${label}`}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="investido"
                            name="Valor Investido"
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="jurosAcumulados"
                            name="Juros Acumulados"
                            stroke="#82ca9d"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="valor"
                            name="Valor Total"
                            stroke="#ff7300"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analise">
                    <div className="space-y-4">
                      <Alert variant="default" className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        <AlertDescription className="text-blue-700">
                          Taxa anual equivalente: {taxaAnualEquivalente.toFixed(2)}%
                        </AlertDescription>
                      </Alert>
                      
                      <h3 className="font-semibold text-lg">Análise do investimento</h3>
                      
                      <div className="space-y-2">
                        {analisarInvestimento().map((item, index) => (
                          <p key={index} className="text-muted-foreground">{item}</p>
                        ))}
                      </div>
                      
                      <div className="mt-6 bg-muted/10 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Rendimento ao longo do tempo</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[12, 24, 36, periodo].map((mes, index) => {
                            const dadoMes = dadosCalculados.find(d => d.mes === mes);
                            if (!dadoMes) return null;
                            
                            return (
                              <div key={index} className="p-3 bg-background rounded border">
                                <p className="text-sm text-muted-foreground">
                                  {mes === periodo ? 'Final' : `${mes} meses`}
                                </p>
                                <p className="text-lg font-bold">
                                  {formatCurrencyBR(dadoMes.valor)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Juros: {formatCurrencyBR(dadoMes.jurosAcumulados)}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-muted-foreground">
                    Preencha os parâmetros e clique em "Calcular" para ver a previsão do seu investimento.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrevisaoInvestimentoPage;
