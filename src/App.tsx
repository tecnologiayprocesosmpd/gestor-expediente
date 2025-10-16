import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SecurityProvider } from "@/contexts/SecurityContext";
import { UserProvider } from "@/contexts/UserContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect } from "react";
import { tramiteStorage } from "@/utils/tramiteStorage";
import { initializeMockAgendaData } from "@/utils/mockAgendaData";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize mock data on first load
  useEffect(() => {
    tramiteStorage.initializeMockData();
    initializeMockAgendaData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ErrorBoundary>
          </TooltipProvider>
        </UserProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
};

export default App;
