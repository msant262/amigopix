import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoadingScreen } from "@/components/LoadingScreen";
import { FirebaseError } from "@/components/FirebaseError";
import { ToastProvider } from "@/components/ui/toast";

// Pages
import { AuthPage } from "@/features/auth/AuthPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { EmprestimosPage } from "@/features/emprestimos/EmprestimosPage";
import { ClientesPage } from "@/features/clientes/ClientesPage";
import { ConteudosPage } from "@/features/conteudos/ConteudosPage";
import { PerfilPage } from "@/features/perfil/PerfilPage";
import { RelatoriosPage } from "@/features/relatorios/RelatoriosPage";
import { SeedPage } from "@/features/admin/SeedPage";
import { OriginComponentsDemo } from "@/components/origin/demo";

// Layout
import { AppLayout } from "@/components/layout/AppLayout";

function AppRoutes() {
  const { user, loading } = useAuth();

  // Check if Firebase is configured
  const isFirebaseConfigured =
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_API_KEY !== "demo-api-key";

  if (!isFirebaseConfigured) {
    return <FirebaseError />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="emprestimos/*" element={<EmprestimosPage />} />
        <Route
          path="clientes/*"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <ClientesPage />
            </ProtectedRoute>
          }
        />
        <Route path="conteudos/*" element={<ConteudosPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route
          path="relatorios"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <RelatoriosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/seed"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <SeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="demo"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <OriginComponentsDemo />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-background text-foreground">
          <AppRoutes />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
