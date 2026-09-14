import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

/* =========================
   Protected Route Guard
========================= */
function ProtectedRoute({ children }) {
  const { isAuthenticated, token } = useAuth();
  const storedToken = localStorage.getItem("token");

  if (!isAuthenticated && !token && !storedToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================
   Public Only Route Guard
========================= */
function PublicOnlyRoute({ children }) {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  let userRole = null;
  if (storedToken && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      userRole = parsedUser?.role || "user";
    } catch {
      userRole = null;
    }
  }

  if (storedToken && userRole) {
    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/* =========================
   Application Root
========================= */
export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* SaaS Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Student / Standard User Auth Routes */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <Register />
                  </PublicOnlyRoute>
                }
              />

              {/* Dedicated Administrator Auth Routes */}
              <Route
                path="/admin/login"
                element={
                  <PublicOnlyRoute>
                    <AdminLogin />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/admin-login"
                element={
                  <PublicOnlyRoute>
                    <AdminLogin />
                  </PublicOnlyRoute>
                }
              />

              {/* User Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Console */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}