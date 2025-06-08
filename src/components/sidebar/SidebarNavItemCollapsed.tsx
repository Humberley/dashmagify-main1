
import { ElementType } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarNavItemCollapsedProps {
  icon: ElementType;
  href: string;
  closeSidebar?: () => void;
}

export const SidebarNavItemCollapsed = ({ 
  icon: Icon, 
  href, 
  closeSidebar 
}: SidebarNavItemCollapsedProps) => {
  const location = useLocation();
  const active = location.pathname === href;
  
  return (
    <Link
      to={href}
      className={`flex justify-center py-2 rounded-md transition-colors ${
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      }`}
      onClick={closeSidebar}
    >
      <Icon className="h-5 w-5" />
    </Link>
  );
};
