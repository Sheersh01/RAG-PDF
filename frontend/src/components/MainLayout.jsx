import { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { documentApi } from "../services/api";
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
  MessagesSquare,
  Check,
  ChevronDown,
  ShieldCheck,
  Trash2,
  Lock,
  Brain,
} from "lucide-react";

const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // Modal open states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Pro Subscription local state
  const [isPro, setIsPro] = useState(() => {
    return localStorage.getItem("isPro") === "true";
  });

  // Settings values
  const [targetRoleInput, setTargetRoleInput] = useState("");

  // Help values
  const [helpSubject, setHelpSubject] = useState("");
  const [helpMessage, setHelpMessage] = useState("");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Upgrade values
  const [upgradeCardholder, setUpgradeCardholder] = useState("");
  const [upgradeCardNumber, setUpgradeCardNumber] = useState("");
  const [upgradeCardExpiry, setUpgradeCardExpiry] = useState("");
  const [upgradeCardCvc, setUpgradeCardCvc] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsPro(localStorage.getItem(`isPro_${user.id}`) === "true");
      setTargetRoleInput(localStorage.getItem(`targetRole_${user.id}`) || "");
      setUpgradeCardholder(user.name || "");
    }
  }, [user]);

  // Sync state changes across potential tabs or triggers
  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        setIsPro(localStorage.getItem(`isPro_${user.id}`) === "true");
        setTargetRoleInput(localStorage.getItem(`targetRole_${user.id}`) || "");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

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
      label: "AI Coach",
      path: "/ai-coach",
      icon: MessagesSquare,
    },
    {
      label: "Search",
      path: "/resume-search",
      icon: Search,
    },
  ];

  const navItems = baseNavItems;

  const handleLogout = () => {
    logout();
  };

  const handlePurgeWorkspace = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your resume and vectorized chunks? This cannot be undone.")) {
      return;
    }
    const toastId = toast.loading("Purging resume index from server database...");
    try {
      const res = await documentApi.deleteResume();
      if (res.success || res.message) {
        toast.success("Workspace index purged successfully.", { id: toastId });
        setIsSettingsOpen(false);
        setTimeout(() => {
          window.location.reload();
        }, 600);
      } else {
        toast.error("Failed to purge workspace.", { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error resetting workspace.", { id: toastId });
    }
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
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-[#6B6B6B] hover:text-[#111111] hover:bg-[#E8E8E6]/20 font-medium text-left cursor-pointer"
        >
          <Settings className="w-4 h-4 text-[#6B6B6B]" />
          Settings
        </button>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-[#6B6B6B] hover:text-[#111111] hover:bg-[#E8E8E6]/20 font-medium text-left cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-[#6B6B6B]" />
          Help
        </button>
      </div>

      {/* Promo banner or Pro status */}
      {!isPro ? (
        <div className="mt-8 p-4 rounded-xl border border-[#E8E8E6] bg-[#F8F8F6] space-y-2 select-none">
          <h4 className="text-xs font-semibold text-[#111111]">Unlock Advanced Features</h4>
          <p className="text-[10px] text-[#6B6B6B] leading-relaxed">
            Upgrade to Pro for deeper insights, unlimited mocks and more.
          </p>
          <button
            onClick={() => setIsUpgradeOpen(true)}
            className="text-[10px] font-bold text-[#111111] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
          >
            Upgrade Now &rarr;
          </button>
        </div>
      ) : (
        <div className="mt-8 p-4 rounded-xl border border-[#4E7C59]/30 bg-[#4E7C59]/5 flex items-center justify-between select-none">
          <div>
            <span className="text-[9px] font-bold text-[#4E7C59] uppercase tracking-widest block">Subscription</span>
            <span className="text-xs font-bold text-[#111111] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4E7C59]" />
              Pro Member
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#4E7C59] animate-pulse"></div>
        </div>
      )}

      {/* User Profile pinned to bottom */}
      <div className="mt-auto pt-6 border-t border-[#E8E8E6] flex items-center justify-between gap-3">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-3 min-w-0 text-left cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-[#E8E8E6] flex items-center justify-center text-[#111111] text-xs font-bold shrink-0">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : "US"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#111111] truncate">{user?.name || "Sheersh Saxena"}</p>
            <p className="text-[10px] text-[#6B6B6B] truncate">{user?.email || "sheersh@gmail.com"}</p>
          </div>
        </button>
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 bg-[#111111]/30 backdrop-blur-[1px] z-50 flex items-center justify-center p-4"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="bg-white border border-[#E8E8E6] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-xl animate-fade-in text-left font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-4">
              <h3 className="font-display font-semibold text-lg text-[#111111] flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#111111]" />
                Account Settings
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded hover:bg-[#E8E8E6] text-[#6B6B6B] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm">
              {/* Profile Details */}
              <div className="space-y-1 bg-[#F8F8F6] p-3 rounded-lg border border-[#E8E8E6]">
                <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">User Profile</span>
                <p className="font-bold text-[#111111]">{user?.name || "Sheersh Saxena"}</p>
                <p className="text-xs text-[#6B6B6B]">{user?.email || "sheersh@gmail.com"}</p>
              </div>

              {/* Subscription Status */}
              <div className="space-y-1 bg-[#F8F8F6] p-3 rounded-lg border border-[#E8E8E6] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Subscription Plan</span>
                  <p className="font-bold text-[#111111]">{isPro ? "Pro Plan Active" : "Free Plan"}</p>
                </div>
                {!isPro ? (
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsUpgradeOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white rounded text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Upgrade
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#4E7C59]/10 text-[#4E7C59] border border-[#4E7C59]/15 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-[#4E7C59]" />
                    Active
                  </span>
                )}
              </div>

              {/* Target Role Preference */}
              <div className="space-y-2">
                <label className="block text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">Target Role Focus</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer, Product Manager"
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs md:text-sm border border-[#E8E8E6] focus:border-[#111111] outline-none bg-white text-[#111111]"
                  />
                  <button
                    onClick={() => {
                      if (user) {
                        localStorage.setItem(`targetRole_${user.id}`, targetRoleInput);
                        window.dispatchEvent(new Event("storage"));
                        toast.success("Target role focus updated!");
                      }
                    }}
                    className="px-3 py-2 bg-[#111111] hover:bg-black text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#E8E8E6] my-4"></div>

              {/* Danger Zone */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Danger Zone</span>
                <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                  Resetting your workspace will delete your uploaded resume and purge your vector embeddings from the server, letting you start the wizard over.
                </p>
                <button
                  onClick={handlePurgeWorkspace}
                  className="w-full py-2 border border-red-500/20 hover:border-red-650 hover:bg-red-50 text-red-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge & Reset Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpOpen && (
        <div
          className="fixed inset-0 bg-[#111111]/30 backdrop-blur-[1px] z-50 flex items-center justify-center p-4"
          onClick={() => setIsHelpOpen(false)}
        >
          <div
            className="bg-white border border-[#E8E8E6] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-xl animate-fade-in text-left font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-4">
              <h3 className="font-display font-semibold text-lg text-[#111111] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#111111]" />
                Help Desk & FAQs
              </h3>
              <button
                onClick={() => setIsHelpOpen(false)}
                className="p-1 rounded hover:bg-[#E8E8E6] text-[#6B6B6B] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {/* FAQ Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Frequently Asked Questions</span>
                <div className="space-y-2">
                  {[
                    {
                      q: "How does vector search matching work?",
                      a: "InterviewPilot parses your PDF resume, splits it into semantic chunks of 500 characters, generates vector embeddings for each chunk, and indexes them in a vector database. When you run an ATS match or ask the AI Coach questions, we perform a vector similarity query to retrieve the most contextually relevant parts of your experience."
                    },
                    {
                      q: "Is my resume data safe and private?",
                      a: "Yes. Your resume text is securely processed and indexed for your account alone. Document chunks are vectorized and isolated using secure user authentication tokens."
                    },
                    {
                      q: "What file formats does the system support?",
                      a: "We support PDF files up to 10MB. For optimal extraction results, ensure your PDF contains selectable text rather than scanned images."
                    }
                  ].map((faq, idx) => {
                    const isOpen = activeFaq === idx;
                    return (
                      <div key={idx} className="border border-[#E8E8E6] rounded-lg overflow-hidden bg-[#F8F8F6]">
                        <button
                          onClick={() => setActiveFaq(isOpen ? null : idx)}
                          className="w-full p-3 text-left font-bold text-xs text-[#111111] flex items-center justify-between hover:bg-[#E8E8E6]/25 transition-colors cursor-pointer"
                        >
                          {faq.q}
                          <ChevronDown className={`w-3.5 h-3.5 text-[#6B6B6B] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="p-3 border-t border-[#E8E8E6] bg-white text-xs leading-relaxed text-[#6B6B6B] animate-slide-in">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#E8E8E6]"></div>

              {/* Ticket Form Section */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Submit Support Ticket</span>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!helpSubject.trim() || !helpMessage.trim()) {
                      toast.error("Please fill in both subject and message.");
                      return;
                    }
                    setIsSubmittingTicket(true);
                    const toastId = toast.loading("Sending ticket to support agents...");
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    toast.success("Support ticket submitted! Ticket #IP-9841 created.", { id: toastId });
                    setHelpSubject("");
                    setHelpMessage("");
                    setIsSubmittingTicket(false);
                    setIsHelpOpen(false);
                  }}
                  className="space-y-2.5"
                >
                  <input
                    type="text"
                    placeholder="Subject Summary"
                    value={helpSubject}
                    onChange={(e) => setHelpSubject(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg text-xs border border-[#E8E8E6] focus:border-[#111111] outline-none bg-white text-[#111111]"
                    disabled={isSubmittingTicket}
                    required
                  />
                  <textarea
                    placeholder="Describe your issue or feedback in detail..."
                    value={helpMessage}
                    onChange={(e) => setHelpMessage(e.target.value)}
                    className="w-full h-24 p-2.5 rounded-lg text-xs border border-[#E8E8E6] focus:border-[#111111] outline-none bg-white text-[#111111] resize-none"
                    disabled={isSubmittingTicket}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingTicket}
                    className="w-full py-2 bg-[#111111] hover:bg-black text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubmittingTicket ? "Submitting..." : "Submit Ticket"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Pro Modal */}
      {isUpgradeOpen && (
        <div
          className="fixed inset-0 bg-[#111111]/30 backdrop-blur-[1px] z-50 flex items-center justify-center p-4"
          onClick={() => setIsUpgradeOpen(false)}
        >
          <div
            className="bg-white border border-[#E8E8E6] rounded-2xl w-full max-w-md p-6 space-y-6 shadow-xl animate-fade-in text-left font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-4">
              <h3 className="font-display font-semibold text-lg text-[#111111] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#111111]" />
                Upgrade to Pro Plan
              </h3>
              <button
                onClick={() => setIsUpgradeOpen(false)}
                className="p-1 rounded hover:bg-[#E8E8E6] text-[#6B6B6B] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5 text-left text-xs md:text-sm">
              <p className="text-[#6B6B6B] leading-relaxed">
                Empower your career growth with unlimited mock interview attempts, custom target presets, and advanced resume vectors reports.
              </p>

              {/* Benefits list */}
              <div className="space-y-2 bg-[#F8F8F6] p-4 rounded-xl border border-[#E8E8E6]">
                {[
                  "Unlimited AI Coaching queries",
                  "Detailed keyword gap reports & ATS score analysis",
                  "Unlimited mock technical & behavioral simulations",
                  "Priority support ticket resolution"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[#111111] font-medium">
                    <Check className="w-4 h-4 text-[#4E7C59]" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Pricing section */}
              <div className="text-center py-1">
                <span className="text-3xl font-display font-bold text-[#111111]">$15</span>
                <span className="text-xs text-[#6B6B6B] font-semibold"> / month</span>
              </div>

              {/* Mock Checkout Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsUpgrading(true);
                  const toastId = toast.loading("Processing payment simulation...");
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  if (user) {
                    localStorage.setItem(`isPro_${user.id}`, "true");
                    localStorage.setItem("isPro", "true");
                  }
                  setIsPro(true);
                  toast.success("Account upgraded to Pro successfully!", { id: toastId });
                  setIsUpgrading(false);
                  setIsUpgradeOpen(false);
                  window.dispatchEvent(new Event("storage"));
                }}
                className="space-y-3"
              >
                <div className="space-y-1">
                  <label className="block text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={upgradeCardholder}
                    onChange={(e) => setUpgradeCardholder(e.target.value)}
                    placeholder="e.g. Sheersh Saxena"
                    className="w-full py-2 px-3 rounded-lg text-xs border border-[#E8E8E6] focus:border-[#111111] outline-none bg-white text-[#111111]"
                    disabled={isUpgrading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">Card Details</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={upgradeCardNumber}
                      onChange={(e) => setUpgradeCardNumber(e.target.value)}
                      maxLength={19}
                      className="w-full py-2 px-3 rounded-lg text-xs border border-[#E8E8E6] focus:border-[#111111] outline-none bg-white text-[#111111]"
                      disabled={isUpgrading}
                    />
                    <Lock className="w-3.5 h-3.5 text-[#6B6B6B]/40 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={upgradeCardExpiry}
                      onChange={(e) => setUpgradeCardExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full py-2 px-3 rounded-lg text-xs border border-[#E8E8E6] focus:border-[#111111] outline-none bg-white text-[#111111]"
                      disabled={isUpgrading}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">CVC</label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={upgradeCardCvc}
                      onChange={(e) => setUpgradeCardCvc(e.target.value)}
                      maxLength={4}
                      className="w-full py-2 px-3 rounded-lg text-xs border border-[#E8E8E6] focus:border-[#111111] outline-none bg-white text-[#111111]"
                      disabled={isUpgrading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpgrading}
                  className="w-full py-3 bg-[#111111] hover:bg-black text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                >
                  {isUpgrading ? "Processing Payment..." : "Upgrade & Unlock All Features"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
