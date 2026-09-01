import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { SubscriptionGate } from "./auth/SubscriptionGate";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientDetailPage } from "./pages/PatientDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminProfessionalsPage } from "./pages/admin/AdminProfessionalsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <DashboardPage />
                </SubscriptionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pacientes/:patientId"
            element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <PatientDetailPage />
                </SubscriptionGate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendario"
            element={
              <ProtectedRoute>
                <ComingSoonPage title="Calendario" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suscripcion"
            element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/profesionales"
            element={
              <ProtectedRoute role="superadmin">
                <AdminProfessionalsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
