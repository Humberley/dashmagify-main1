import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PrevisaoPage from "./pages/PrevisaoPage";
import ReceitasPage from "./pages/ReceitasPage";
import DespesasFixasPage from "./pages/DespesasFixasPage";
import VariaveisPage from "./pages/VariaveisPage";
import InvestimentosPage from "./pages/InvestimentosPage";
import DividasParcelasPage from "./pages/DividasParcelasPage";
import ApontamentosPage from "./pages/ApontamentosPage";
import PrevisaoInvestimentoPage from "./pages/PrevisaoInvestimentoPage";
import PrevisaoDividaPage from "./pages/PrevisaoDividaPage";
import ConectarContasPage from "./pages/ConectarContasPage"; // Import new page
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Auth check helper function
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("magify_user") !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {/* Move TooltipProvider inside BrowserRouter */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/index" element={<Index />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/previsao" 
            element={
              <ProtectedRoute>
                <PrevisaoPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/receitas" 
            element={
              <ProtectedRoute>
                <ReceitasPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/despesas-fixas" 
            element={
              <ProtectedRoute>
                <DespesasFixasPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/variaveis" 
            element={
              <ProtectedRoute>
                <VariaveisPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/investimentos" 
            element={
              <ProtectedRoute>
                <InvestimentosPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dividas-parcelas" 
            element={
              <ProtectedRoute>
                <DividasParcelasPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/apontamentos" 
            element={
              <ProtectedRoute>
                <ApontamentosPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/previsao-investimento" 
            element={
              <ProtectedRoute>
                <PrevisaoInvestimentoPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/previsao-divida" 
            element={
              <ProtectedRoute>
                <PrevisaoDividaPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/conectar-contas"  // New route
            element={
              <ProtectedRoute>
                <ConectarContasPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cards" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/budgets" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* Default Routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;