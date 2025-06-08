
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";
import { SidebarUserSection } from "./sidebar/SidebarUserSection";
import { SidebarMobileToggle } from "./sidebar/SidebarMobileToggle";

interface DashboardSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const DashboardSidebar = ({ isOpen, setIsOpen }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const userData = localStorage.getItem("magify_user");
    if (!userData) {
      navigate("/login");
    }
  }, [navigate]);

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen bg-card z-30 transition-all duration-300 flex flex-col border-r shadow-sm overflow-hidden ${
          isOpen ? "w-64" : "w-0 md:w-16"
        }`}
      >
        <SidebarHeader isOpen={isOpen} setIsOpen={setIsOpen} isMobile={isMobile} />
        <SidebarNavigation isOpen={isOpen} closeSidebar={closeSidebar} />
        <div className="p-2 mt-auto border-t">
          <SidebarUserSection isOpen={isOpen} />
        </div>
      </aside>

      {/* Mobile toggle button */}
      {!isOpen && isMobile && <SidebarMobileToggle onClick={() => setIsOpen(true)} />}
    </>
  );
};

export default DashboardSidebar;
