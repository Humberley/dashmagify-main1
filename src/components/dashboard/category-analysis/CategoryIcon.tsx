
import React from "react";
import {
  BookOpen,
  Building,
  Car,
  CreditCard,
  DollarSign,
  Gift,
  Heart,
  Home,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Plane,
  Plus,
  Receipt,
  Shirt,
  ShoppingBag,
  Smartphone,
  UtensilsCrossed,
  Wallet,
  Landmark,
  FileText,
  ScrollText,
} from "lucide-react";

interface CategoryIconProps {
  category: string;
  isIncome?: boolean;
}

export const categoryIcons: Record<string, React.ReactNode> = {
  // Receitas
  "Receita: Salário": <Wallet className="h-4 w-4" />,
  "Receita: Outras": <Plus className="h-4 w-4" />,
  "Receita: Aposentadoria": <Landmark className="h-4 w-4" />,
  
  // Fixas
  "Fixa: Banco": <Landmark className="h-4 w-4" />,
  "Fixa: Carro": <Car className="h-4 w-4" />,
  "Fixa: Comunicação": <Smartphone className="h-4 w-4" />,
  "Fixa: Educação": <BookOpen className="h-4 w-4" />,
  "Fixa: Habitação": <Home className="h-4 w-4" />,
  "Fixa: Outras": <MoreHorizontal className="h-4 w-4" />,
  "Fixa: Saúde": <Heart className="h-4 w-4" />,
  "Fixa: Lazer": <UtensilsCrossed className="h-4 w-4" />,
  
  // Variáveis
  "Variável: Carro": <Car className="h-4 w-4" />,
  "Variável: Educação": <BookOpen className="h-4 w-4" />,
  "Variável: Entretenimento": <UtensilsCrossed className="h-4 w-4" />,
  "Variável: Habitação": <Home className="h-4 w-4" />,
  "Variável: Lazer": <UtensilsCrossed className="h-4 w-4" />,
  "Variável: Outros": <MoreHorizontal className="h-4 w-4" />,
  "Variável: Pet": <Heart className="h-4 w-4" />,
  "Variável: Presentes": <Gift className="h-4 w-4" />,
  "Variável: Saúde": <Heart className="h-4 w-4" />,
  "Variável: Trabalho": <Building className="h-4 w-4" />,
  "Variável: Transporte": <Car className="h-4 w-4" />,
  "Variável: Vestuário": <Shirt className="h-4 w-4" />,
  "Variável: Viagem": <Plane className="h-4 w-4" />,
  "Variável: Estética": <Heart className="h-4 w-4" />,
  "Variável: Mercado": <ShoppingBag className="h-4 w-4" />,
  
  // Outros
  "Dívidas e Parcelados": <ScrollText className="h-4 w-4" />,
  "Pagamento de fatura Cartão de Crédito": <CreditCard className="h-4 w-4" />,
  "Investimentos": <DollarSign className="h-4 w-4" />,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, isIncome }) => {
  // Se não houver um ícone específico para a categoria, use um ícone padrão
  const icon = categoryIcons[category] || <MoreHorizontal className="h-4 w-4" />;
  
  return (
    <div className={`p-2 rounded-full ${isIncome ? 'bg-green-100' : 'bg-red-100'}`}>
      {icon}
    </div>
  );
};

export default CategoryIcon;
