import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  LayoutDashboard,
  Sparkles,
  Search,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  BrainCircuit,
  User,
  ChevronUp,
} from "lucide-react";

const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const baseNavItems = [
    {
      label: "Overview",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Analysis",
      path: "/resume-analyzer",
      icon: Sparkles,
    },
    {
      label: "Preparation",
      path: "/mock-interview",
      icon: BrainCircuit,
    },
    {
      label: "Search",
      path: "/resume-search",
      icon: Search,
    },
  ];

  const navItems = import.meta.env.DEV
    ? baseNavItems
    : baseNavItems.filter((item) => item.path !== "/resume-search");

  const handleLogout = () => {
    logout();
  };

  const activeItem = navItems.find((item) => location.pathname === item.path) || navItems[0];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E8E8E6] py-6 px-6 font-sans">
      {/* Logo Section */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-6 h-6 rounded bg-[#111111] flex items-center justify-center text-white font-bold text-xs">
          ip
        </div>
        <h1 className="font-display text-lg font-bold text-[#111111] tracking-tight">
          InterviewPilot
        </h1>
      </div>

      {/* Workspace label */}
      <span className="text-[10px] text-[#6B6B6B] font-bold tracking-widest uppercase mb-4 pl-1">
        Workspace
      </span>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-all text-sm ${
                isActive
                  ? "bg-[#E8E8E6]/40 text-[#111111] font-bold"
                  : "text-[#6B6B6B] hover:text-[#111111] hover:bg-[#E8E8E6]/20 font-medium"
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${isActive ? 'text-[#111111]' : 'text-[#6B6B6B]'}`} />
                {item.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#111111]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E6] my-6"></div>

      {/* Bottom Nav Links */}
      <div className="space-y-1">
        <Link
          to="#"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-[#6B6B6B] hover:text-[#111111] hover:bg-[#E8E8E6]/20 font-medium"
        >
          <Settings className="w-4 h-4 text-[#6B6B6B]" />
          Settings
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-[#6B6B6B] hover:text-[#111111] hover:bg-[#E8E8E6]/20 font-medium"
        >
          <HelpCircle className="w-4 h-4 text-[#6B6B6B]" />
          Help
        </Link>
      </div>

      {/* Promo banner */}
      <div className="mt-8 p-4 rounded-xl border border-[#E8E8E6] bg-[#F8F8F6] space-y-2 select-none">
        <h4 className="text-xs font-semibold text-[#111111]">Unlock Advanced Features</h4>
        <p className="text-[10px] text-[#6B6B6B] leading-relaxed">
          Upgrade to Pro for deeper insights, unlimited mocks and more.
        </p>
        <button className="text-[10px] font-bold text-[#111111] hover:underline flex items-center gap-1 mt-1 cursor-pointer">
          Upgrade Now &rarr;
        </button>
      </div>

      {/* User Profile pinned to bottom */}
      <div className="mt-auto pt-6 border-t border-[#E8E8E6] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#E8E8E6] flex items-center justify-center text-[#111111] text-xs font-bold shrink-0">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#111111] truncate">{user?.name || "Sheersh Saxena"}</p>
            <p className="text-[10px] text-[#6B6B6B] truncate">{user?.email || "sheersh@gmail.com"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-1 rounded hover:bg-[#E8E8E6]/60 text-[#6B6B6B] hover:text-[#111111] transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F6] text-[#111111] flex relative overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:block w-72 shrink-0 h-screen z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b border-[#E8E8E6] bg-[#FFFFFF] z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#111111] flex items-center justify-center text-white font-bold text-[10px]">
            ip
          </div>
          <span className="font-display font-bold text-sm text-[#111111]">InterviewPilot</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded border border-[#E8E8E6] text-[#111111] hover:bg-[#F8F8F6] cursor-pointer"
        >
          {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-[#111111]/10 z-40" onClick={() => setIsMobileOpen(false)}>
          <aside
            className="w-72 h-full bg-[#FFFFFF] flex flex-col z-50 animate-fade-in shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#E8E8E6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#111111] flex items-center justify-center text-white font-bold text-xs">
                  ip
                </div>
                <h1 className="font-display text-sm font-bold text-[#111111]">InterviewPilot</h1>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-1 rounded hover:bg-[#E8E8E6] cursor-pointer">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0 h-screen overflow-y-auto z-10 relative">
        <div className="flex-1 p-6 md:p-12 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
