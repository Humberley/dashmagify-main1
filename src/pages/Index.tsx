
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Valid session exists
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('name, certificate')
              .eq('id', data.session.user.id)
              .single();
              
            if (profileError) {
              console.error("Error fetching profile:", profileError);
            }
            
            localStorage.setItem('magify_user', JSON.stringify({
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: profileData?.name || data.session.user.user_metadata.name || '',
              certificate: profileData?.certificate || '',
            }));
            
            navigate("/dashboard");
          } catch (error) {
            console.error("Error setting user data:", error);
            navigate("/dashboard");
          }
        } else {
          // No valid session
          localStorage.removeItem('magify_user');
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full magify-gradient flex items-center justify-center animate-pulse">
          <span className="text-white text-2xl font-bold">M</span>
        </div>
        <h1 className="text-2xl font-bold mb-4">Carregando Magify...</h1>
      </div>
    </div>
  );
};

export default Index;
