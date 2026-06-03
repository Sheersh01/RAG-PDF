import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { Loader2 } from "lucide-react";

// Route guards
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Layout
import MainLayout from "./components/MainLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import AtsMatcher from "./pages/AtsMatcher";
import MockInterview from "./pages/MockInterview";
import AiCoach from "./pages/AiCoach";
import ResumeSearch from "./pages/ResumeSearch";

const App = () => {
  const { initAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#111111] animate-spin" />
        <span className="text-xs text-[#6B6B6B] font-semibold tracking-wider uppercase select-none">Verifying session...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (only accessible if logged out) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Private Routes (only accessible if logged in) */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
            <Route path="/resume-analyzer" element={<ErrorBoundary><ResumeAnalyzer /></ErrorBoundary>} />
            <Route path="/ats-matcher" element={<ErrorBoundary><AtsMatcher /></ErrorBoundary>} />
            <Route path="/mock-interview" element={<ErrorBoundary><MockInterview /></ErrorBoundary>} />
            <Route path="/ai-coach" element={<ErrorBoundary><AiCoach /></ErrorBoundary>} />
            <Route path="/resume-search" element={<ErrorBoundary><ResumeSearch /></ErrorBoundary>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;