import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  LayoutDashboard,
  Sparkles,
  SlidersHorizontal,
  MessagesSquare,
  Search,
  LogOut,
  Menu,
  X,
  BrainCircuit,
  User,
} from "lucide-react";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      description: "Resume upload & text preview",
    },
    {
      label: "Resume Analyzer",
      path: "/resume-analyzer",
      icon: Sparkles,
      description: "Strengths, weaknesses & tips",
    },
    {
      label: "ATS Optimizer",
      path: "/ats-matcher",
      icon: SlidersHorizontal,
      description: "Compare resume vs job desc",
    },
    {
      label: "Mock Interview",
      path: "/mock-interview",
      icon: BrainCircuit,
      description: "AI interview question simulation",
    },
    {
      label: "AI Coach (Chat)",
      path: "/ai-coach",
      icon: MessagesSquare,
      description: "Chat with resume citations",
    },
    {
      label: "Resume Search",
      path: "/resume-search",
      icon: Search,
      description: "Direct vector chunk query",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden font-sans">
      {/* Decorative Glow Blobs */}
      <div className="glow-blob bg-indigo-600/10 w-[500px] h-[500px] -top-40 -left-40 animate-pulse-slow" />
      <div className="glow-blob bg-purple-600/10 w-[600px] h-[600px] -bottom-45 -right-40 animate-pulse-slow" style={{ animationDelay: "2s" }} />

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 glass-card border-r border-slate-800/50 z-30 shrink-0">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
              InterviewPilot
            </h1>
            <span className="text-xs text-indigo-400/80 font-medium">AI Career Companion</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-start gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-200 border-l-2 border-indigo-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 transition-transform duration-300 ${
                  isActive ? "text-indigo-400" : "text-slate-450 group-hover:scale-110 group-hover:text-indigo-400"
                }`} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-normal">{item.label}</span>
                  <span className="text-[11px] text-slate-500 leading-normal group-hover:text-slate-450 transition-colors">
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Summary */}
        <div className="p-4 border-t border-slate-800/40 bg-slate-900/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-900/30 border border-slate-800/40">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate leading-none mb-1">
                {user?.name || "Candidate"}
              </p>
              <p className="text-[10px] text-slate-450 truncate leading-none">
                {user?.email || "candidate@pilot.ai"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-950/20 hover:bg-red-900/30 border border-red-900/30 hover:border-red-800/40 text-red-400 hover:text-red-300 text-xs font-medium transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout Account
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-slate-800/50 bg-slate-950/70 backdrop-blur-md z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-md text-white">InterviewPilot</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg border border-slate-800 hover:bg-slate-900/50 text-slate-400 hover:text-white"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40" onClick={toggleSidebar}>
          <aside
            className="w-72 h-full bg-slate-950 border-r border-slate-800/50 flex flex-col z-50 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-md text-white">InterviewPilot</h1>
                  <span className="text-[10px] text-indigo-400">AI Career Companion</span>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleSidebar}
                    className={`flex items-start gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-600/15 text-indigo-200 border-l-2 border-indigo-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0 mt-0.5 text-indigo-400" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-[10px] text-slate-500">{item.description}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800/40 bg-slate-900/10">
              <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-slate-900/30 border border-slate-800/40">
                <div className="w-8 h-8 rounded bg-slate-850 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || "Candidate"}</p>
                  <p className="text-[9px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleSidebar();
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-950/20 hover:bg-red-900/30 border border-red-900/35 text-red-400 text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout Account
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0 z-10 relative overflow-y-auto">
        <div className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
