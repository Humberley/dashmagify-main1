
import { useLocation } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  Home,
  Calculator,
  CalendarClock,
  Receipt,
  LineChart,
  Wallet,
  TrendingUp,
  Percent
} from "lucide-react";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarNavItemCollapsed } from "./SidebarNavItemCollapsed";

interface SidebarNavigationProps {
  isOpen: boolean;
  closeSidebar?: () => void;
}

export const SidebarNavigation = ({ isOpen, closeSidebar }: SidebarNavigationProps) => {
  const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: LineChart, label: "Previsão", href: "/previsao" },
    { icon: Wallet, label: "Receitas", href: "/receitas" },
    { icon: Receipt, label: "Despesas Fixas", href: "/despesas-fixas" },
    { icon: Calculator, label: "Variáveis", href: "/variaveis" },
    { icon: BarChart3, label: "Investimentos", href: "/investimentos" },
    { icon: CreditCard, label: "Dívidas", href: "/dividas-parcelas" },
    { icon: CalendarClock, label: "Apontamentos", href: "/apontamentos" },
    { icon: TrendingUp, label: "Previsão Investimento", href: "/previsao-investimento" },
    { icon: Percent, label: "Previsão Dívida", href: "/previsao-divida" },
  ];

  return (
    <nav className="p-2 space-y-1 flex-1 overflow-auto">
      {navItems.map((item) => (
        <div key={item.href}>
          {!isOpen ? (
            <SidebarNavItemCollapsed 
              icon={item.icon} 
              href={item.href} 
              closeSidebar={closeSidebar}
            />
          ) : (
            <SidebarNavItem 
              icon={item.icon}
              label={item.label}
              href={item.href}
              closeSidebar={closeSidebar}
            />
          )}
        </div>
      ))}
    </nav>
  );
};
