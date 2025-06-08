
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface SidebarMobileToggleProps {
  onClick: () => void;
}

export const SidebarMobileToggle = ({ onClick }: SidebarMobileToggleProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-10">
      <Button
        size="icon"
        className="rounded-full h-12 w-12 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={onClick}
      >
        <Menu />
      </Button>
    </div>
  );
};
