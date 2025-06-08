
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Enhanced date formatting function for Brazilian format
export const formatDateBR = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  
  try {
    // Check if it's already in Brazilian format (dd/mm/yyyy)
    if (dateStr.includes('/')) {
      // Validate if it looks like a proper dd/mm/yyyy format
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        // No need to reformat if it's already in the correct format
        // Just validate it's a proper date
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && 
            day >= 1 && day <= 31 && month >= 1 && month <= 12) {
          return dateStr; // Already in the correct format
        }
      }
    }
    
    // If it's an ISO string, parse and format
    const date = parseISO(dateStr);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (e) {
    console.error("Error formatting date:", e);
    
    // Try one more time with the native Date constructor
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
      }
    } catch (e) {
      console.error("Second attempt to format date failed:", e);
    }
    
    return dateStr; // Return original if couldn't parse
  }
};

// Função aprimorada para converter string de data no formato dd/mm/yyyy para objeto Date
export const parseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  
  try {
    // Se for ISO string, usar parseISO
    if (dateStr.includes('T') || dateStr.includes('Z')) {
      return parseISO(dateStr);
    }
    
    // Se for no formato dd/mm/yyyy (com barras)
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        // Corrigido para garantir que os valores são tratados como números
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
        const year = parseInt(parts[2], 10);
        
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          // Criamos uma data com os valores normalizados
          const date = new Date(year, month, day);
          
          // Verificamos se a data criada corresponde aos valores originais
          // para evitar problemas como 31/02/2025 que seria convertido para 03/03/2025
          if (date.getDate() === day && 
              date.getMonth() === month && 
              date.getFullYear() === year) {
            return date;
          }
        }
      }
    }
    
    // Se não estiver em formato conhecido, tenta interpretar como data diretamente
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    return null;
  } catch (e) {
    console.error("Error parsing date:", e);
    return null;
  }
};

// Retorna o primeiro e o último dia do mês
export const getMonthBoundaries = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  return { firstDay, lastDay };
};

// Verifica se uma data está dentro de um mês específico
export const isDateInMonth = (date: string | null, targetMonth: Date): boolean => {
  if (!date) return false;
  
  const checkDate = parseDate(date);
  if (!checkDate) return false;
  
  return (
    checkDate.getFullYear() === targetMonth.getFullYear() &&
    checkDate.getMonth() === targetMonth.getMonth()
  );
};

// Formata mês e ano em português brasileiro
export const formatMonthYear = (date: Date | undefined): string => {
  if (!date) return '';
  
  return format(date, "MMMM 'de' yyyy", { locale: ptBR });
};

// Função para formatar valores monetários no formato brasileiro
export const formatCurrencyValue = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined) return "R$ 0,00";
  
  // Converter para número se for string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verificar se é um número válido
  if (isNaN(numValue)) return "R$ 0,00";
  
  // Formatar para o padrão brasileiro
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};
