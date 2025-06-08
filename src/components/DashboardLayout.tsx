
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { WhatsappIcon } from "./WhatsappIcon";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const user = localStorage.getItem("magify_user");
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  // Feche a sidebar por padrão em dispositivos móveis
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5562982178614", "_blank");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 min-h-screen">
        <div className={`container p-4 md:p-6 max-w-7xl mx-auto ${isMobile ? 'pt-4' : 'pt-6'}`}>
          {children}
        </div>
      </main>
      
      {/* Botão de WhatsApp flutuante */}
      <button 
        onClick={handleWhatsAppClick}
        className="fixed bottom-20 right-6 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Contato via WhatsApp"
      >
        <WhatsappIcon size={28} />
      </button>
    </div>
  );
};

export default DashboardLayout;
