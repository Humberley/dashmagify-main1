
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const PrevisaoDividaPage = () => {
  // Estados para os modos de cálculo
  const [modoCalculo, setModoCalculo] = useState<"taxa" | "valorFinal">("taxa");
  
  // Estados para valores do formulário
  const [valorInicial, setValorInicial] = useState<number>(10000);
  const [taxaJuros, setTaxaJuros] = useState<number>(3.5); // 3.5% ao mês
  const [valorFinal, setValorFinal] = useState<number>(15000);
  const [periodo, setPeriodo] = useState<number>(12); // 12 meses (1 ano)
  const [dadosCalculados, setDadosCalculados] = useState<any[]>([]);
  const [taxaCalculada, setTaxaCalculada] = useState<number | null>(null);
  const [valorParcela, setValorParcela] = useState<number | null>(null);
  const [totalJuros, setTotalJuros] = useState<number>(0);

  // Função para calcular a dívida com taxa conhecida
  const calcularDividaComTaxa = () => {
    const dados = [];
    let saldoDevedor = valorInicial;
    let totalJur = 0;
    
    // Calcular valor da parcela para pagamento em períodos iguais
    const i = taxaJuros / 100;
    const parcela = valorInicial * (i * Math.pow(1 + i, periodo)) / (Math.pow(1 + i, periodo) - 1);
    setValorParcela(parcela);
    
    for (let mes = 0; mes <= periodo; mes++) {
      if (mes === 0) {
        dados.push({
          mes,
          saldo: saldoDevedor,
          juros: 0,
          amortizacao: 0,
          parcela: 0
        });
        continue;
      }
      
      const jurosDoMes = saldoDevedor * (taxaJuros / 100);
      const amortizacao = parcela - jurosDoMes;
      
      totalJur += jurosDoMes;
      saldoDevedor -= amortizacao;
      
      // Em caso de imprecisão no último mês
      if (mes === periodo) {
        saldoDevedor = Math.max(0, saldoDevedor);
      }
      
      dados.push({
        mes,
        saldo: saldoDevedor,
        juros: jurosDoMes,
        amortizacao,
        parcela
      });
    }
    
    setDadosCalculados(dados);
    setTotalJuros(totalJur);
    setValorFinal(valorInicial + totalJur);
  };

  // Função para calcular a taxa a partir do valor final
  const calcularTaxaAPartirDoValorFinal = () => {
    if (valorFinal <= valorInicial) {
      alert("O valor final deve ser maior que o valor inicial!");
      return;
    }
    
    // Cálculo da taxa usando aproximação (tentativa e erro com busca binária)
    let taxaMin = 0.0001; // 0.01%
    let taxaMax = 20; // 20%
    let taxaMedia = 0;
    let valorCalculado = 0;
    let iteracoes = 0;
    const maxIteracoes = 100;
    const precisao = 0.0001;
    
    while (iteracoes < maxIteracoes) {
      taxaMedia = (taxaMin + taxaMax) / 2;
      valorCalculado = valorInicial * Math.pow(1 + taxaMedia / 100, periodo);
      
      if (Math.abs(valorCalculado - valorFinal) < precisao) {
        break;
      }
      
      if (valorCalculado < valorFinal) {
        taxaMin = taxaMedia;
      } else {
        taxaMax = taxaMedia;
      }
      
      iteracoes++;
    }
    
    setTaxaCalculada(taxaMedia);
    setTaxaJuros(taxaMedia);
    
    // Após calcular a taxa, geramos os dados com a mesma para visualização
    calcularDividaComTaxa();
  };

  // Função de cálculo que escolhe o método correto
  const calcular = () => {
    if (modoCalculo === "taxa") {
      calcularDividaComTaxa();
    } else {
      calcularTaxaAPartirDoValorFinal();
    }
  };

  // Formatar taxa anual
  const taxaAnualEquivalente = (Math.pow(1 + taxaJuros / 100, 12) - 1) * 100;

  // Função para análise da dívida
  const analisarDivida = () => {
    const taxaAnual = (Math.pow(1 + taxaJuros / 100, 12) - 1) * 100;
    let analise = [];
    
    if (taxaAnual > 50) {
      analise.push("Alerta: Esta taxa de juros é extremamente elevada! Recomenda-se buscar alternativas de refinanciamento.");
    } else if (taxaAnual > 25) {
      analise.push("Atenção: Esta taxa de juros é alta. Vale a pena pesquisar opções de financiamento com taxas menores.");
    }
    
    if (totalJuros > valorInicial * 0.5) {
      analise.push("O total de juros representa mais de 50% do valor inicial da dívida.");
    }
    
    if (valorParcela && valorParcela > valorInicial * 0.3) {
      analise.push("As parcelas são consideravelmente altas em relação ao valor da dívida. Considere estender o prazo se possível.");
    }
    
    return analise;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold">Previsão de Dívida</h1>
        
        <Card className="p-4 bg-muted/10 mb-6">
          <h3 className="font-semibold mb-2">Como funciona?</h3>
          <p className="text-sm text-muted-foreground">
            Analise suas dívidas de duas maneiras: fornecendo a taxa de juros para calcular o valor final, 
            ou informando o valor final para descobrir a taxa de juros embutida. A ferramenta calcula 
            também o valor das parcelas e a evolução da dívida.
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
                  <Label htmlFor="modoCalculo">Modo de cálculo</Label>
                  <RadioGroup 
                    value={modoCalculo} 
                    onValueChange={(value) => setModoCalculo(value as "taxa" | "valorFinal")}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="taxa" id="taxa" />
                      <Label htmlFor="taxa">Tenho a taxa de juros</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="valorFinal" id="valorFinal" />
                      <Label htmlFor="valorFinal">Tenho o valor final</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valorInicial">Valor inicial da dívida (R$)</Label>
                  <Input
                    id="valorInicial"
                    type="number"
                    value={valorInicial}
                    onChange={(e) => setValorInicial(Number(e.target.value))}
                    min="0"
                    step="100"
                  />
                </div>
                
                {modoCalculo === "taxa" ? (
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
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="valorFinal">Valor final a pagar (R$)</Label>
                    <Input
                      id="valorFinal"
                      type="number"
                      value={valorFinal}
                      onChange={(e) => setValorFinal(Number(e.target.value))}
                      min={valorInicial}
                      step="100"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período (meses)</Label>
                  <Input
                    id="periodo"
                    type="number"
                    value={periodo}
                    onChange={(e) => setPeriodo(Number(e.target.value))}
                    min="1"
                    max="360"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {periodo ? `Equivale a ${(periodo / 12).toFixed(1)} anos` : ''}
                  </p>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={calcular}
                  disabled={
                    valorInicial <= 0 || 
                    periodo <= 0 ||
                    (modoCalculo === "taxa" && taxaJuros <= 0) ||
                    (modoCalculo === "valorFinal" && valorFinal <= valorInicial)
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
                    <TabsTrigger value="tabela">Tabela de Amortização</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="grafico" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-muted/20 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">Valor Total da Dívida</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrencyBR(valorFinal)}
                        </p>
                      </div>
                      <div className="bg-muted/20 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">Juros Totais</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatCurrencyBR(totalJuros)}
                        </p>
                      </div>
                      <div className="bg-muted/20 rounded-lg p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          {modoCalculo === "taxa" ? "Valor da Parcela" : "Taxa Calculada"}
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {modoCalculo === "taxa" 
                            ? formatCurrencyBR(valorParcela || 0) 
                            : `${taxaCalculada?.toFixed(2)}% a.m.`}
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
                            dataKey="saldo"
                            name="Saldo Devedor"
                            stroke="#f87171"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="juros"
                            name="Juros do Mês"
                            stroke="#fb923c"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="parcela"
                            name="Valor da Parcela"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analise">
                    <div className="space-y-4">
                      <Alert variant="destructive" className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-red-700">
                          Taxa anual equivalente: {taxaAnualEquivalente.toFixed(2)}%
                        </AlertDescription>
                      </Alert>
                      
                      <h3 className="font-semibold text-lg">Análise da dívida</h3>
                      
                      <div className="space-y-2">
                        {analisarDivida().map((item, index) => (
                          <p key={index} className="text-muted-foreground">{item}</p>
                        ))}
                        
                        <p className="text-muted-foreground">
                          Para um empréstimo de {formatCurrencyBR(valorInicial)}, 
                          você pagará um total de {formatCurrencyBR(totalJuros)} em juros, 
                          o que representa {((totalJuros / valorInicial) * 100).toFixed(2)}% do valor original.
                        </p>
                      </div>
                      
                      <Alert variant={taxaJuros > 5 ? "destructive" : "default"} className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {taxaJuros > 10 
                            ? "Esta taxa é extremamente alta! Considere outras opções de financiamento."
                            : taxaJuros > 5
                            ? "Esta taxa é elevada. Compare com outras ofertas no mercado."
                            : "Esta taxa está dentro de parâmetros razoáveis para o mercado atual."}
                        </AlertDescription>
                      </Alert>
                      
                      <div className="mt-6 bg-muted/10 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Comparação com investimentos</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Se você investisse o valor inicial desta dívida a uma taxa média de mercado:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-background rounded border">
                            <p className="text-sm text-muted-foreground">Investimento a 0.5% a.m.</p>
                            <p className="text-lg font-bold">
                              {formatCurrencyBR(valorInicial * Math.pow(1 + 0.5 / 100, periodo))}
                            </p>
                          </div>
                          <div className="p-3 bg-background rounded border">
                            <p className="text-sm text-muted-foreground">Investimento a 1.0% a.m.</p>
                            <p className="text-lg font-bold">
                              {formatCurrencyBR(valorInicial * Math.pow(1 + 1.0 / 100, periodo))}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="tabela" className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/20">
                          <th className="p-2 text-left">Mês</th>
                          <th className="p-2 text-right">Prestação</th>
                          <th className="p-2 text-right">Juros</th>
                          <th className="p-2 text-right">Amortização</th>
                          <th className="p-2 text-right">Saldo Devedor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dadosCalculados.map((dado, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-muted/5" : ""}>
                            <td className="p-2">{dado.mes}</td>
                            <td className="p-2 text-right">{formatCurrencyBR(dado.parcela)}</td>
                            <td className="p-2 text-right text-orange-600">{formatCurrencyBR(dado.juros)}</td>
                            <td className="p-2 text-right">{formatCurrencyBR(dado.amortizacao)}</td>
                            <td className="p-2 text-right font-medium">{formatCurrencyBR(dado.saldo)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-muted-foreground">
                    Preencha os parâmetros e clique em "Calcular" para ver a análise da sua dívida.
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

export default PrevisaoDividaPage;
