
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-5xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-xl text-gray-600 mb-6">Página não encontrada</p>
        <p className="text-gray-500 mb-8">
          A página que você está tentando acessar não existe ou foi movida.
        </p>
        <Button asChild className="px-6 py-2">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
