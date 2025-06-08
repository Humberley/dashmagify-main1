
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SidebarUserSectionProps {
  isOpen: boolean;
}

export const SidebarUserSection = ({ isOpen }: SidebarUserSectionProps) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("magify_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("magify_user");
    toast({
      title: "Logged out successfully",
    });
    navigate("/login");
  };

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center gap-y-4 py-2">
        <Link
          to="/profile"
          className="relative w-9 h-9 flex items-center justify-center bg-magify-blue/50 text-primary rounded-full hover:bg-magify-blue/70"
        >
          <User className="h-5 w-5" />
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center text-muted-foreground hover:text-destructive p-2 rounded-md hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="p-2 flex items-center gap-3">
        <Link
          to="/profile"
          className="relative w-10 h-10 flex items-center justify-center bg-magify-blue/50 text-primary rounded-full hover:bg-magify-blue/70"
        >
          {user?.name ? (
            user.name.charAt(0).toUpperCase()
          ) : (
            <User className="h-5 w-5" />
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {user?.name || "User"}
          </h4>
          <p className="text-muted-foreground text-xs truncate">
            {user?.email || "user@example.com"}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full flex items-center justify-start text-muted-foreground hover:text-destructive hover:border-destructive/30"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </>
  );
};
