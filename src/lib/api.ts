
/**
 * API function to fetch financial data from the webhook with retry capability
 */
export async function fetchFinancialData(userEmail?: string) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second delay between retries
  
  // Try to get user data from local storage including certificate
  const userDataStr = localStorage.getItem('magify_user');
  let certificate = '';
  
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      userEmail = userEmail || userData.email;
      certificate = userData.certificate || '';
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }
  
  // Retry function
  const fetchWithRetry = async (retryCount = 0) => {
    try {
      const url = 'https://nwh.fluxerautoma.shop/webhook/dash';
      
      console.log(`Fetching data from: ${url} with email: ${userEmail || 'not provided'} and certificate included: ${certificate ? 'yes' : 'no'}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userEmail || '',
          certificate: certificate
        }),
        // Add cache control to avoid cached responses
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      // Get raw text from response first for debugging
      const rawText = await response.text();
      console.log('Raw API response:', rawText.substring(0, 200) + '...');
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.error('Failed to parse API response as JSON:', jsonError);
        throw new Error('Invalid JSON response from API');
      }

      console.log('Data fetched successfully, structure:', Object.keys(data));

      // Parse the JSON strings in the response with robust error handling
      const parsedData = {
        previsao: safeParseJson(data["Previsão"], 'Previsão', []),
        receitas: safeParseJson(data.receitas, 'receitas', []),
        despesasFixas: safeParseJson(data["despesas fixas"], 'despesas fixas', []),
        variaveis: safeParseJson(data.variaveis, 'variaveis', []),
        investimentos: safeParseJson(data.investimentos, 'investimentos', []),
        dividasEParcelas: safeParseJson(data["dividas e parcelas"], 'dividas e parcelas', []),
        apontamentos: safeParseJson(data.Apontamentos, 'Apontamentos', []),
        relatorioGeral: safeParseJson(data["Relatório geral"], 'Relatório geral', [])
      };
      
      console.log('Data successfully parsed:', {
        previsaoCount: parsedData.previsao.length,
        receitasCount: parsedData.receitas.length,
        despesasFixasCount: parsedData.despesasFixas.length,
        variaveisCount: parsedData.variaveis.length,
        investimentosCount: parsedData.investimentos.length,
        dividasEParcelasCount: parsedData.dividasEParcelas.length,
        apontamentosCount: parsedData.apontamentos.length,
        relatorioGeralCount: parsedData.relatorioGeral.length
      });
      
      return parsedData;
    } catch (error) {
      console.error(`Error fetching data (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error);
      
      if (retryCount < MAX_RETRIES - 1) {
        console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
        // Wait for the delay period
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        // Try again
        return fetchWithRetry(retryCount + 1);
      }
      
      console.error('Max retries reached, using fallback data');
      // Return mock data for fallback in case the API fails after retries
      return getMockData();
    }
  };
  
  return fetchWithRetry();
}

// Enhanced helper function to safely parse JSON with detailed error logging
function safeParseJson(jsonString: string | undefined, fieldName: string, defaultValue: any) {
  if (!jsonString) {
    console.log(`Field ${fieldName} is empty or undefined, using default empty array`);
    return defaultValue;
  }
  
  try {
    // Before parsing, check if the string appears to be JSON
    const trimmedString = jsonString.trim();
    if (!(trimmedString.startsWith('[') || trimmedString.startsWith('{'))) {
      console.error(`Field ${fieldName} does not appear to be valid JSON. Starting with: ${trimmedString.substring(0, 20)}...`);
      return defaultValue;
    }
    
    // Before parsing, log a sample of the string for debugging
    console.log(`Parsing ${fieldName}, sample: ${jsonString.substring(0, 50)}...`);
    
    const result = JSON.parse(jsonString);
    
    // Validate the parsed data
    if (Array.isArray(result)) {
      console.log(`Successfully parsed ${fieldName}, found ${result.length} entries`);
      
      // Add row_number if missing
      return result.map((item, index) => {
        if (item.row_number === undefined) {
          item.row_number = index + 1;
        }
        return item;
      });
    } else {
      console.warn(`Field ${fieldName} parsed successfully but is not an array:`, typeof result);
      // Try to convert to array if possible
      if (typeof result === 'object' && result !== null) {
        return [result];
      }
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error parsing ${fieldName}:`, error);
    console.error(`Problem JSON string: ${jsonString.substring(0, 200)}...`);
    return defaultValue;
  }
}

// Enhanced fallback mock data in case the API is unavailable
function getMockData() {
  console.log("Using mock data as fallback");
  
  return {
    previsao: [
      {row_number: 2, "Descrição": "Receita", col_2: "", col_3: 71882, "dez./24": 7176, "jan./25": 10676},
      {row_number: 3, "Descrição": "Fixas", col_2: 0.236, col_3: 16991, "dez./24": 2104, "jan./25": 2104},
      {row_number: 4, "Descrição": "Variáveis", col_2: 0.253, col_3: 18200, "dez./24": 2600, "jan./25": 2600},
      {row_number: 5, "Descrição": "Parceladas", col_2: 0.187, col_3: 13450, "dez./24": 2500, "jan./25": 2500},
      {row_number: 6, "Descrição": "Investimentos", col_2: 0.040, col_3: 2900, "dez./24": 200, "jan./25": 200},
      {row_number: 7, "Descrição": "Saldo", col_2: 0.292, col_3: 21003, "dez./24": 434, "jan./25": 3272},
      {row_number: 8, "Descrição": "Saldo acumulado", col_2: "", col_3: "", "dez./24": 434, "jan./25": 3706}
    ],
    receitas: [
      {row_number: 2, "Class.": "kitnet", "Desc.": "", Valor: 3800},
      {row_number: 5, "Class.": "Aposent", "Desc.": "", Valor: 800}
    ],
    despesasFixas: [
      {row_number: 2, "Identificação": "Aluguel", "Desc.": "", Valor: 1350},
      {row_number: 3, "Identificação": "Luz", "Desc.": "", Valor: 300}
    ],
    variaveis: [
      {row_number: 3, "Class.": "Alimentação", "Desc.": "", Valor: 1200, "dez./24": 1200},
      {row_number: 4, "Class.": "Transporte", "Desc.": "", Valor: 600, "dez./24": 600}
    ],
    investimentos: [
      {row_number: 3, "Class.": "dindin", "Desc.": "", Valor: 200}
    ],
    dividasEParcelas: [
      {row_number: 4, "Class.": "cartão", "Desc.": "", Valor: 1558}
    ],
    apontamentos: [
      {row_number: 2, "Carimbo de data/hora": "03/12/2024", "Quando?": "03/12/2024", "Quanto?": 27.9, "Classificação": "Variável: Saúde", "Parcelado?": "Não", "Descrição Complementar": "Compra de fraldas na farmácia", "Forma de Pagamento?": "Cartão de Débito", "Identificação": "LCT-123"},
      {row_number: 3, "Carimbo de data/hora": "04/12/2024", "Quando?": "04/12/2024", "Quanto?": 42.66, "Classificação": "Variável: Outros", "Parcelado?": "Sim", "Descrição Complementar": "Créditos OpenAI", "Forma de Pagamento?": "Cartão de crédito", "Identificação": "LCT-124"}
    ],
    relatorioGeral: [
      {row_number: 2, col_1: "Fixas", Realizado: 1928, Previsto: 2504, "% realizado": 0.77, "Saldo remanescente": 576},
      {row_number: 3, col_1: "Variaveis", Realizado: 5228, Previsto: 2600, "% realizado": 2.01, "Saldo remanescente": -2628}
    ]
  };
}

// Tipos para os dados financeiros
export interface FinancialData {
  previsao: PrevisaoItem[];
  receitas: ReceitaItem[];
  despesasFixas: DespesaFixaItem[];
  variaveis: VariavelItem[];
  investimentos: InvestimentoItem[];
  dividasEParcelas: DividaParcelaItem[];
  apontamentos: ApontamentoItem[];
  relatorioGeral: RelatorioGeralItem[];
}

export interface PrevisaoItem {
  row_number: number;
  "Descrição"?: string;
  col_2?: string | number;
  col_3?: string | number;
  [key: string]: any; // Para as colunas dos meses (dez./24, jan./25, etc.)
}

export interface ReceitaItem {
  row_number: number;
  "Class."?: string;
  "Desc."?: string;
  Valor?: number;
}

export interface DespesaFixaItem {
  row_number: number;
  "Identificação"?: string;
  "Desc."?: string;
  Valor?: number;
}

export interface VariavelItem {
  row_number: number;
  "Class."?: string;
  "Desc."?: string;
  Valor?: number;
  [key: string]: any; // Para as colunas dos meses
}

export interface InvestimentoItem {
  row_number: number;
  "Class."?: string;
  "Desc."?: string;
  Valor?: number;
}

export interface DividaParcelaItem {
  row_number: number;
  "Class."?: string;
  "Desc."?: string;
  Valor?: number;
}

export interface ApontamentoItem {
  row_number: number;
  "Carimbo de data/hora"?: string;
  "Quando?"?: string;
  "Quanto?"?: number;
  "Classificação"?: string;
  "Parcelado?"?: string;
  "Descrição Complementar"?: string;
  "Forma de Pagamento?"?: string;
  "Identificação"?: string;
}

export interface RelatorioGeralItem {
  row_number: number;
  col_1?: string;
  Realizado?: number;
  Previsto?: number;
  "% realizado"?: number;
  "Saldo remanescente"?: number;
}
