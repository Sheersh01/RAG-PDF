import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { documentApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  BrainCircuit,
  ChevronRight,
  TrendingUp,
  Clock,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { clearAnalysisCacheForUser } from "../utils/analysisCache";

const Dashboard = () => {
  const { user } = useAuthStore();
  const [resume, setResume] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadStage, setUploadStage] = useState(""); // 'parsing' | 'splitting' | 'embedding' | 'indexing' | 'done' | ''
  const [targetRole, setTargetRole] = useState("");

  // Preview Resume states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [loadingText, setLoadingText] = useState(false);

  const getRelativeTime = (pastDate, offsetMs = 0) => {
    if (!pastDate) return "";
    const past = new Date(new Date(pastDate).getTime() + offsetMs);
    const now = new Date();
    const diffMs = Math.max(0, now - past);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return past.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const fetchResume = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentApi.getResume();
      if (data.success && data.document) {
        setResume(data.document);
        try {
          const statsData = await documentApi.getResumeStats();
          if (statsData.success) {
            setStats(statsData);
          }
        } catch {
          setStats(null);
        }
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("Failed to load resume details.");
      }
      setResume(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  useEffect(() => {
    if (user) {
      const savedRole = localStorage.getItem(`targetRole_${user.id}`);
      if (savedRole) {
        setTargetRole(savedRole);
      }
    }
  }, [user]);

  // Listen for storage events to sync target role preference dynamically
  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        const savedRole = localStorage.getItem(`targetRole_${user.id}`);
        if (savedRole) {
          setTargetRole(savedRole);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]);

  const handleOpenPreview = async () => {
    setIsPreviewOpen(true);
    if (extractedText) return; // already loaded
    
    setLoadingText(true);
    try {
      const data = await documentApi.getResumeText();
      if (data.success && data.extractedText) {
        setExtractedText(data.extractedText);
      } else {
        toast.error("Failed to fetch resume text content.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error fetching resume text.");
    } finally {
      setLoadingText(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file only.");
      return;
    }

    setUploading(true);
    setUploadStage("parsing");

    const parseTimer = setTimeout(() => setUploadStage("splitting"), 1200);
    const splitTimer = setTimeout(() => setUploadStage("embedding"), 2400);
    const embedTimer = setTimeout(() => setUploadStage("indexing"), 4500);

    const toastId = toast.loading("Processing resume ingestion...");
    try {
      const data = await documentApi.uploadResume(file);
      if (data && data._id) {
        clearTimeout(parseTimer);
        clearTimeout(splitTimer);
        clearTimeout(embedTimer);
        setUploadStage("done");
        toast.success("Resume processed and indexed successfully!", { id: toastId });
        
        setTimeout(() => {
          if (user?.id) {
            clearAnalysisCacheForUser(user.id);
          }
          setResume(data);
          setUploading(false);
          setUploadStage("");
          setCurrentStep(2); // Move to Choose Role step
        }, 800);
      } else {
        clearTimeout(parseTimer);
        clearTimeout(splitTimer);
        clearTimeout(embedTimer);
        setUploadStage("");
        setUploading(false);
        toast.error("Failed to process resume.", { id: toastId });
      }
    } catch (err) {
      clearTimeout(parseTimer);
      clearTimeout(splitTimer);
      clearTimeout(embedTimer);
      setUploadStage("");
      setUploading(false);
      console.error(err);
      toast.error(err.response?.data?.message || "Error uploading resume.", { id: toastId });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    disabled: uploading,
  });

  if (loading) {
    return (
      <div className="space-y-12 animate-pulse font-sans">
        <div className="space-y-4">
          <div className="h-4 bg-[#E8E8E6] rounded w-20"></div>
          <div className="h-16 bg-[#E8E8E6] rounded w-1/2"></div>
          <div className="h-6 bg-[#E8E8E6] rounded w-2/3"></div>
        </div>
        <div className="h-[300px] bg-[#E8E8E6] rounded-2xl"></div>
        <div className="h-[200px] bg-[#E8E8E6] rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in font-sans">
      {!resume ? (
        /* ONBOARDING WIZARD IN EDITORIAL STYLE */
        <div className="max-w-xl mx-auto py-12 space-y-10">
          <div className="space-y-3 text-center">
            <span className="text-[11px] font-bold tracking-widest text-[#6B6B6B] uppercase">
              Workspace Setup
            </span>
            <h2 className="text-4xl font-display font-medium text-[#111111] leading-tight">
              Create Your workspace
            </h2>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-sm mx-auto">
              Initialize a calm, tailored interview preparation environment grounded in your resume content.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-4">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 1 ? 'bg-[#111111] text-white' : 'bg-[#E8E8E6] text-[#6B6B6B]'}`}>1</div>
              <span className={`text-xs font-semibold ${currentStep === 1 ? 'text-[#111111]' : 'text-[#6B6B6B]'}`}>Upload</span>
            </div>
            <div className="h-px bg-[#E8E8E6] flex-1 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 2 ? 'bg-[#111111] text-white' : 'bg-[#E8E8E6] text-[#6B6B6B]'}`}>2</div>
              <span className={`text-xs font-semibold ${currentStep === 2 ? 'text-[#111111]' : 'text-[#6B6B6B]'}`}>Define Focus</span>
            </div>
            <div className="h-px bg-[#E8E8E6] flex-1 mx-4"></div>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 3 ? 'bg-[#111111] text-white' : 'bg-[#E8E8E6] text-[#6B6B6B]'}`}>3</div>
              <span className={`text-xs font-semibold ${currentStep === 3 ? 'text-[#111111]' : 'text-[#6B6B6B]'}`}>Ready</span>
            </div>
          </div>

          {/* Step Panels */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {uploading ? (
                <div className="p-12 border border-[#E8E8E6] rounded-2xl text-center space-y-5 bg-white">
                  <Loader2 className="w-8 h-8 text-[#111111] animate-spin mx-auto" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#111111]">Ingesting Document</h3>
                    <p className="text-xs text-[#6B6B6B] mt-1 animate-pulse font-medium">
                      {uploadStage === 'parsing' && "Parsing PDF text content..."}
                      {uploadStage === 'splitting' && "Splitting text into chunks..."}
                      {uploadStage === 'embedding' && "Generating vector embeddings..."}
                      {uploadStage === 'indexing' && "Indexing vectors in Atlas..."}
                      {uploadStage === 'done' && "Finalizing workspace..."}
                      {!uploadStage && "Initializing pipeline..."}
                    </p>
                  </div>
                  <div className="flex justify-center items-center gap-4 text-[9px] text-[#6B6B6B] font-semibold uppercase tracking-wider pt-2 select-none">
                    <span className={uploadStage === 'parsing' ? 'text-[#111111] font-bold' : ''}>1. Parse</span>
                    <span>&rarr;</span>
                    <span className={uploadStage === 'splitting' ? 'text-[#111111] font-bold' : ''}>2. Split</span>
                    <span>&rarr;</span>
                    <span className={uploadStage === 'embedding' ? 'text-[#111111] font-bold' : ''}>3. Embed</span>
                    <span>&rarr;</span>
                    <span className={uploadStage === 'indexing' ? 'text-[#111111] font-bold' : ''}>4. Index</span>
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border border-[#E8E8E6] rounded-2xl p-12 text-center cursor-pointer bg-white transition-all hover:border-[#111111] ${
                    isDragActive ? 'border-[#111111] bg-[#F8F8F6]/40' : ''
                  }`}
                >
                  <input {...getInputProps()} />
                  <UploadCloud className="w-10 h-10 text-[#6B6B6B] mx-auto mb-4" />
                  <h3 className="text-sm font-semibold text-[#111111]">Upload your PDF resume</h3>
                  <p className="text-xs text-[#6B6B6B] mt-1 max-w-xs mx-auto leading-relaxed">
                    Drag and drop your document here, or click to browse files from your computer.
                  </p>
                  <div className="mt-6 text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider bg-[#F8F8F6] py-2 px-4 rounded-lg inline-flex border border-[#E8E8E6]">
                    Max size 10MB • PDF Format Only
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 p-6 border border-[#E8E8E6] rounded-2xl bg-white">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#111111]">Target Role Focus</h3>
                <p className="text-xs text-[#6B6B6B]">
                  Tell us what role or domain you're targeting. This structures the generated prep content.
                </p>
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold block">Presets</span>
                <div className="flex flex-wrap gap-2">
                  {['Software Engineer', 'Product Manager', 'Data Analyst', 'UI/UX Designer'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setTargetRole(role)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        targetRole === role
                          ? 'bg-[#111111] text-white border-[#111111]'
                          : 'border-[#E8E8E6] text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="space-y-2">
                <label className="block text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">Custom target role</label>
                <input
                  type="text"
                  placeholder="e.g. Site Reliability Engineer, Operations Specialist..."
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-lg text-sm border border-[#E8E8E6] focus:border-[#111111] outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (user && targetRole.trim()) {
                      localStorage.setItem(`targetRole_${user.id}`, targetRole.trim());
                    }
                    setCurrentStep(3);
                  }}
                  disabled={!targetRole.trim()}
                  className="px-5 py-2.5 bg-[#111111] hover:bg-black disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="p-8 border border-[#E8E8E6] rounded-2xl bg-white text-center space-y-6">
              <div className="w-10 h-10 rounded-full bg-[#4E7C59]/10 text-[#4E7C59] border border-[#4E7C59]/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#111111]">Ready for Analysis</h3>
                <p className="text-xs text-[#6B6B6B] max-w-xs mx-auto leading-relaxed">
                  Your resume is vectorized. Target role set to <strong className="text-[#111111] font-semibold">{targetRole}</strong>. Click below to view analysis insights.
                </p>
              </div>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-[#E8E8E6] text-[#6B6B6B] hover:text-[#111111] hover:border-[#111111] rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Change Role
                </button>
                <Link
                  to="/resume-analyzer"
                  className="px-5 py-2 bg-[#111111] hover:bg-black text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Run First Analysis
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PREMIUM EDITORIAL SAAS DASHBOARD */
        <div className="space-y-16 animate-fade-in font-sans">
          
          {/* Top Section Layout: MAIN CONTENT + RIGHT PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Main Content (Width: 7 cols on Desktop) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-2">
                <span className="text-[11px] font-bold tracking-widest text-[#6B6B6B] uppercase block">
                  Workspace
                </span>
                <h1 className="text-[64px] font-display font-medium text-[#111111] leading-none tracking-tight">
                  Resume Workspace
                </h1>
                <p className="text-xl text-[#6B6B6B] font-light max-w-xl leading-relaxed pt-2">
                  Turn your resume into a personalized interview preparation environment.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-6 pt-2">
                <Link
                  to="/mock-interview"
                  className="px-6 py-3.5 bg-[#111111] hover:bg-black text-white font-medium text-sm rounded-lg flex items-center gap-3 transition-all cursor-pointer"
                >
                  Start Interview
                  <span className="text-xs text-slate-400">&rarr;</span>
                </Link>
                <button
                  onClick={handleOpenPreview}
                  className="text-sm font-semibold text-[#111111] hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  Preview Resume
                </button>
              </div>
            </div>

            {/* Right Hero Panel: Floating card & concentric circles (Width: 5 cols) */}
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[300px]">
              
              {/* Almost invisible concentric SVG circles background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <svg className="w-[320px] h-[320px] opacity-[0.06] text-[#4E7C59]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </svg>
              </div>

              {/* Floating Document Card */}
              <div className="editorial-card rounded-2xl p-6 w-[320px] shadow-sm relative z-10 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-[#F8F8F6] rounded-lg text-[#111111]">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-[#111111] truncate">
                      {resume.fileName || "PM_Resume.pdf"}
                    </h3>
                    <p className="text-[10px] text-[#6B6B6B] mt-0.5">
                      Uploaded on {new Date(resume.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-[#E8E8E6] pt-4">
                  <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Status</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#4E7C59]">
                    <div className="w-2 h-2 rounded-full bg-[#4E7C59]"></div>
                    Vectorized & Ready
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-[#E8E8E6] pt-4">
                  <div>
                    <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Sections</span>
                    <span className="text-xs font-bold text-[#111111]">{resume.sectionsCount ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Vectors</span>
                    <span className="text-xs font-bold text-[#111111]">{resume.vectorsCount ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#6B6B6B] uppercase tracking-wider block">Quality</span>
                    <span className="text-xs font-bold text-[#111111]">{resume.quality ?? 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Section (Horizontal container directly below hero) */}
          <div className="border border-[#E8E8E6] bg-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 font-sans select-none divide-y md:divide-y-0 md:divide-x divide-[#E8E8E6]">
            
            <div className="flex-1 w-full md:w-auto text-center py-4 md:py-0">
              <span className="text-5xl font-display font-medium text-[#111111] block mb-1">
                {resume.sectionsCount ?? 0}
              </span>
              <span className="text-xs text-[#6B6B6B] font-medium tracking-wide">
                Resume Sections
              </span>
            </div>

            <div className="flex-1 w-full md:w-auto text-center py-4 md:py-0">
              <span className="text-5xl font-display font-medium text-[#111111] block mb-1">
                {resume.vectorsCount ?? 0}
              </span>
              <span className="text-xs text-[#6B6B6B] font-medium tracking-wide">
                Vector Chunks Indexed
              </span>
            </div>

            <div className="flex-1 w-full md:w-auto text-center py-4 md:py-0">
              <span className="text-5xl font-display font-medium text-[#111111] block mb-1">
                {stats?.stats?.lastAtsScore != null ? `${stats.stats.lastAtsScore}%` : "—"}
              </span>
              <span className="text-xs text-[#6B6B6B] font-medium tracking-wide">
                Last ATS Score
              </span>
            </div>
          </div>

          {/* Insights & Recent Activity Section (Two column layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
            
            {/* Insights Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-lg font-bold text-[#111111] pl-1">Insights</h2>
              <div className="border border-[#E8E8E6] bg-white rounded-2xl divide-y divide-[#E8E8E6] overflow-hidden">
                {(stats?.insights || []).map((insight, idx) => (
                  <Link
                    key={idx}
                    to={insight.link}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-[#F8F8F6]/30 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#F8F8F6] rounded text-[#111111] group-hover:bg-[#E8E8E6] transition-colors">
                        {insight.type === "ats" ? (
                          <Sparkles className="w-4 h-4" />
                        ) : insight.type === "improvement" ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <TrendingUp className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#111111] group-hover:underline">{insight.title}</h4>
                        <p className="text-[10px] text-[#6B6B6B] mt-0.5">{insight.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6B6B6B]" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-lg font-bold text-[#111111] pl-1">Recent Activity</h2>
              <div className="border border-[#E8E8E6] bg-white rounded-2xl p-6 space-y-6">
                {(stats?.activity || []).length > 0 ? (
                  stats.activity.map((item, idx) => {
                    const linkMap = {
                      upload: null,
                      analysis: "/resume-analyzer",
                      ats: "/ats-matcher",
                      chat: "/ai-coach",
                      interview: "/mock-interview",
                    };
                    const iconMap = {
                      upload: Clock,
                      analysis: FileText,
                      ats: SlidersHorizontal,
                      chat: BrainCircuit,
                      interview: BrainCircuit,
                    };
                    const Icon = iconMap[item.type] || Clock;
                    const link = linkMap[item.type];

                    const content = (
                      <div className="flex gap-3">
                        <Icon className="w-4 h-4 text-[#6B6B6B] mt-0.5 group-hover:text-[#111111] transition-colors" />
                        <div>
                          <h4 className="text-xs font-semibold text-[#111111] group-hover:underline">{item.label}</h4>
                          <p className="text-[10px] text-[#6B6B6B] mt-0.5">{item.detail}</p>
                        </div>
                      </div>
                    );

                    return link ? (
                      <Link
                        key={idx}
                        to={link}
                        className="flex items-start justify-between gap-4 hover:opacity-85 transition-opacity cursor-pointer group"
                      >
                        {content}
                        <span className="text-[9px] text-[#6B6B6B] font-medium mt-0.5">{getRelativeTime(item.timestamp)}</span>
                      </Link>
                    ) : (
                      <button
                        key={idx}
                        onClick={handleOpenPreview}
                        className="w-full flex items-start justify-between gap-4 hover:opacity-85 transition-opacity cursor-pointer group text-left bg-transparent border-none p-0"
                      >
                        {content}
                        <span className="text-[9px] text-[#6B6B6B] font-medium mt-0.5">{getRelativeTime(item.timestamp)}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#6B6B6B]">No activity yet. Run an analysis or start a mock interview.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Resume Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 bg-[#111111]/30 backdrop-blur-[1px] z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="bg-white border border-[#E8E8E6] rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-xl text-left flex flex-col h-[80vh] font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-4 shrink-0">
              <div>
                <h3 className="font-display font-semibold text-lg text-[#111111]">
                  Parsed Document Text
                </h3>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Raw textual content extracted and vectorized in InterviewPilot.
                </p>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1 rounded hover:bg-[#E8E8E6] text-[#6B6B6B] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#F8F8F6] p-6 rounded-xl border border-[#E8E8E6] min-h-0 text-[#111111] select-text">
              {loadingText ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 text-xs text-[#6B6B6B]">
                  <Loader2 className="w-6 h-6 text-[#111111] animate-spin" />
                  <span>Retrieving extracted vectors...</span>
                </div>
              ) : extractedText ? (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-serif font-light">
                  {extractedText}
                </pre>
              ) : (
                <div className="text-center py-20 text-xs text-[#6B6B6B] italic">
                  No text content extracted.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
