import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { LoginModalProvider } from "./auth/LoginModalContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { SubscriptionGate } from "./auth/SubscriptionGate";
import { LoginModal } from "./components/LoginModal";
import { HomePage } from "./pages/HomePage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PatientDetailPage } from "./pages/PatientDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { CalendarPage } from "./pages/CalendarPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminProfessionalsPage } from "./pages/admin/AdminProfessionalsPage";
import { AdminSubscriptionSettingsPage } from "./pages/admin/AdminSubscriptionSettingsPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoginModalProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
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
                  <SubscriptionGate>
                    <CalendarPage />
                  </SubscriptionGate>
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
            <Route
              path="/admin/profesionales"
              element={<Navigate to="/admin/profesionales/por-activar" replace />}
            />
            <Route
              path="/admin/profesionales/nuevos"
              element={
                <ProtectedRoute role="superadmin">
                  <AdminProfessionalsPage view="new" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profesionales/por-activar"
              element={
                <ProtectedRoute role="superadmin">
                  <AdminProfessionalsPage view="reported" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profesionales/activos"
              element={
                <ProtectedRoute role="superadmin">
                  <AdminProfessionalsPage view="active" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/configuracion"
              element={
                <ProtectedRoute role="superadmin">
                  <AdminSubscriptionSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <LoginModal />
        </LoginModalProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
