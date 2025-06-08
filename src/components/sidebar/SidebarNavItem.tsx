
import { ElementType } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface SidebarNavItemProps {
  icon: ElementType;
  label: string;
  href: string;
  closeSidebar?: () => void;
}

export const SidebarNavItem = ({ icon: Icon, label, href, closeSidebar }: SidebarNavItemProps) => {
  const location = useLocation();
  const active = location.pathname === href;
  
  return (
    <Link to={href} className="w-full" onClick={closeSidebar}>
      <Button
        variant={active ? "default" : "ghost"}
        className={`w-full justify-start ${
          active
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "hover:bg-muted/50"
        }`}
      >
        <Icon className="mr-2 h-5 w-5" />
        {label}
      </Button>
    </Link>
  );
};
