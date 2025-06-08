
import { Link } from "react-router-dom";
import { X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarHeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

export const SidebarHeader = ({ isOpen, setIsOpen, isMobile }: SidebarHeaderProps) => {
  return (
    <div className="p-4 flex items-center justify-between h-16 border-b">
      {isOpen && (
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-magify-lavender flex items-center justify-center text-white font-semibold">
            M
          </div>
          <span className="font-bold text-lg">Magify</span>
        </Link>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(false)}
      >
        <X className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
};
