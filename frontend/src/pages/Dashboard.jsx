import { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { documentApi } from "../services/api";
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
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadStage, setUploadStage] = useState(""); // 'parsing' | 'splitting' | 'embedding' | 'indexing' | 'done' | ''
  const [targetRole, setTargetRole] = useState("");

  const fetchResume = useCallback(async () => {
    try {
      setLoading(true);
      const data = await documentApi.getResume();
      if (data.success && data.document) {
        setResume(data.document);
      }
    } catch (err) {
      // 404 is expected if user hasn't uploaded a resume yet
      if (err.response?.status !== 404) {
        toast.error("Failed to load resume details.");
      }
      setResume(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
            Candidate Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload your resume to initialize vector search and activate AI prep tools.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          {/* Main workspace section skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl border border-slate-800/40 p-6 h-72 bg-slate-900/20">
              <div className="h-6 bg-slate-800 rounded w-1/4 mb-6"></div>
              <div className="h-24 bg-slate-800 rounded-xl mb-4"></div>
              <div className="h-16 bg-slate-800 rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-5 border border-slate-850 h-32 bg-slate-900/20">
                <div className="w-8 h-8 rounded bg-slate-800 mb-3"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-800 rounded w-3/4"></div>
              </div>
              <div className="glass-card rounded-xl p-5 border border-slate-850 h-32 bg-slate-900/20">
                <div className="w-8 h-8 rounded bg-slate-800 mb-3"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-800 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          {/* Sidebar sections skeleton */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl border border-slate-800/40 p-6 h-[260px] bg-slate-900/20">
              <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-12 bg-slate-800 rounded-xl"></div>
                <div className="h-12 bg-slate-800 rounded-xl"></div>
                <div className="h-12 bg-slate-800 rounded-xl"></div>
              </div>
            </div>
            <div className="glass-card rounded-2xl border border-slate-800/40 p-6 h-36 bg-slate-900/20">
              <div className="h-3 bg-slate-800 rounded w-1/4 mb-3"></div>
              <div className="h-3 bg-slate-800 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-800 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resume Upload / Info Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl border border-slate-800/60 p-6 relative overflow-hidden">
              <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Resume Document Source
              </h2>

              {resume ? (
                /* Resume Info Display */
                <div className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/30">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 shrink-0">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-200 text-sm md:text-base truncate max-w-xs md:max-w-md">
                          {resume.fileName}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Vector Index Ready
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-450 mt-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Uploaded on: {formatDate(resume.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {resume.extractedText && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                        Parsed Content Preview
                      </h4>
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 text-slate-350 text-xs leading-relaxed max-h-48 overflow-y-auto font-mono whitespace-pre-wrap select-none">
                        {resume.extractedText}
                      </div>
                    </div>
                  )}

                  {/* Re-upload toggle */}
                  <div className="pt-2">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive
                          ? "border-indigo-500 bg-indigo-500/5"
                          : "border-slate-850 hover:border-slate-700 hover:bg-slate-900/20"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <UploadCloud className="w-7 h-7 text-slate-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-medium text-slate-300">
                        Want to replace your resume? Drag & drop a new PDF here
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">PDF format only (Max 10MB)</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Onboarding Wizard */
                <div className="space-y-6">
                  {/* Step Indicators */}
                  <div className="flex items-center justify-between border-b border-slate-800/40 pb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 1 ? 'bg-indigo-650 text-white' : 'bg-slate-800 text-slate-400'}`}>1</div>
                      <span className={`text-xs font-semibold ${currentStep === 1 ? 'text-white' : 'text-slate-500'}`}>Upload Resume</span>
                    </div>
                    <div className="h-px bg-slate-800 flex-1 mx-4"></div>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 2 ? 'bg-indigo-650 text-white' : 'bg-slate-800 text-slate-400'}`}>2</div>
                      <span className={`text-xs font-semibold ${currentStep === 2 ? 'text-white' : 'text-slate-500'}`}>Define Focus</span>
                    </div>
                    <div className="h-px bg-slate-800 flex-1 mx-4"></div>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 3 ? 'bg-indigo-650 text-white' : 'bg-slate-800 text-slate-400'}`}>3</div>
                      <span className={`text-xs font-semibold ${currentStep === 3 ? 'text-white' : 'text-slate-500'}`}>Ready</span>
                    </div>
                  </div>

                  {/* Step Content */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      {uploading ? (
                        /* Progress Indicator during upload */
                        <div className="p-10 border border-slate-800 rounded-2xl text-center space-y-4 bg-slate-900/10">
                          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-2" />
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-semibold text-slate-200">Processing Ingestion</h3>
                            <p className="text-xs text-indigo-400 font-medium animate-pulse">
                              {uploadStage === 'parsing' && "Parsing PDF text content..."}
                              {uploadStage === 'splitting' && "Splitting text into chunks..."}
                              {uploadStage === 'embedding' && "Generating vector embeddings..."}
                              {uploadStage === 'indexing' && "Indexing vectors in Atlas..."}
                              {uploadStage === 'done' && "Almost done! Wrapping up..."}
                              {!uploadStage && "Initializing ingestion pipeline..."}
                            </p>
                          </div>
                          {/* Simulated step checker UI */}
                          <div className="flex justify-center items-center gap-6 text-[9px] text-slate-500 font-semibold uppercase tracking-wider pt-2 select-none">
                            <span className={uploadStage === 'parsing' ? 'text-indigo-400' : ''}>1. Parse</span>
                            <span>•</span>
                            <span className={uploadStage === 'splitting' ? 'text-indigo-400' : ''}>2. Split</span>
                            <span>•</span>
                            <span className={uploadStage === 'embedding' ? 'text-indigo-400' : ''}>3. Embed</span>
                            <span>•</span>
                            <span className={uploadStage === 'indexing' ? 'text-indigo-400' : ''}>4. Index</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                            isDragActive
                              ? "border-indigo-500 bg-indigo-500/5"
                              : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/10"
                          }`}
                        >
                          <input {...getInputProps()} />
                          <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-bounce" />
                          <h3 className="text-sm font-semibold text-slate-200">
                            Upload your resume to get started
                          </h3>
                          <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                            Drag and drop your PDF resume here, or click to browse files from your device.
                          </p>
                          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-550 uppercase tracking-wider bg-slate-900/50 py-2.5 px-4 rounded-lg inline-flex border border-slate-850">
                            <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
                            PDF files are split & stored as vectors for LLM RAG context
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6 p-4">
                      <div className="space-y-1.5 text-center">
                        <h3 className="text-base font-semibold text-white">Define Target Focus</h3>
                        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                          Select a role preset or type your target job role. This focus grounds your upcoming AI resume analysis and mock interviews.
                        </p>
                      </div>

                      {/* Preset Pills */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Presets Quick-fill</span>
                        <div className="flex flex-wrap gap-2">
                          {['Software Engineer', 'Product Manager', 'Data Analyst', 'UI/UX Designer'].map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setTargetRole(role)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                targetRole === role
                                  ? 'bg-indigo-650/20 border-indigo-500 text-indigo-300'
                                  : 'border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Input */}
                      <div className="space-y-2">
                        <label className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold pl-0.5">Custom Focus Role</label>
                        <input
                          type="text"
                          placeholder="e.g. Mobile Developer, Cloud Architect, QA Engineer..."
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full py-3 px-4 rounded-xl text-sm glass-input text-slate-200 placeholder-slate-650"
                        />
                      </div>

                      {/* Next button */}
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(3)}
                          disabled={!targetRole.trim()}
                          className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-lg shadow-indigo-600/20"
                        >
                          Next Step
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6 p-4 text-center">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-white">Setup Completed!</h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                          Your resume is fully indexed and your target role is set to <strong className="text-indigo-400">{targetRole}</strong>. Let's run your first full AI analysis!
                        </p>
                      </div>

                      <div className="flex justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="px-5 py-2.5 border border-slate-800 hover:bg-slate-900/50 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Change Role
                        </button>
                        <Link
                          to="/resume-analyzer"
                          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-lg shadow-indigo-650/20"
                        >
                          Run First Analysis
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Feature Guides */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-5 border border-slate-850 hover:border-slate-800 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-550/10 text-indigo-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm">Resume Analysis</h3>
                <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
                  Identify resume strengths, key weaknesses, and direct action items to improve your formatting and descriptions.
                </p>
              </div>

              <div className="glass-card rounded-xl p-5 border border-slate-850 hover:border-slate-800 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-550/10 text-purple-400 flex items-center justify-center mb-3">
                  <SlidersHorizontal className="w-4.5 h-4.5" />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm">ATS Matcher</h3>
                <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">
                  Compare your indexed resume chunks against any job description to evaluate matching percentages and identify gaps.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Info/Quick Access Panel */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl border border-slate-800/60 p-6">
              <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider mb-4">
                Interview Prep Tools
              </h3>
              <div className="space-y-4">
                <Link
                  to={resume ? "/resume-analyzer" : "#"}
                  onClick={() => !resume && toast.error("Please upload a resume first.")}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-850 transition-all ${
                    resume
                      ? "bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-750"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-200">Analyze Resume</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Generate strengths & tips</p>
                  </div>
                </Link>

                <Link
                  to={resume ? "/ats-matcher" : "#"}
                  onClick={() => !resume && toast.error("Please upload a resume first.")}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-850 transition-all ${
                    resume
                      ? "bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-750"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-200">ATS Optimizer</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Score job compatibility</p>
                  </div>
                </Link>

                <Link
                  to={resume ? "/mock-interview" : "#"}
                  onClick={() => !resume && toast.error("Please upload a resume first.")}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-855 transition-all ${
                    resume
                      ? "bg-slate-900/40 hover:bg-slate-900/80 hover:border-slate-750"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-200">Mock Interview</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Practice interactive QA</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-slate-800/60 p-6 bg-gradient-to-tr from-indigo-950/20 to-purple-950/20 relative overflow-hidden">
              <div className="glow-blob bg-indigo-500/5 w-24 h-24 -top-8 -right-8" />
              <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
                RAG Pipeline Active
              </h3>
              <p className="text-xs text-slate-350 leading-relaxed">
                When you query the AI coach or run assessments, InterviewPilot retrieves exact relevant fragments from your vectorized resume database. This guarantees highly grounded and personalized coaching answers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
