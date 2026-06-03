import { useEffect, useState, useCallback } from "react";
import { analysisApi, documentApi } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  ArrowUpCircle,
  Loader2,
  FileWarning,
  RefreshCw,
  Info,
} from "lucide-react";

const ResumeAnalyzer = () => {
  const [resumeExists, setResumeExists] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const checkResumeStatus = useCallback(async () => {
    try {
      setCheckingResume(true);
      const data = await documentApi.getResume();
      if (data.success && data.document) {
        setResumeExists(true);
      }
    } catch (err) {
      setResumeExists(false);
    } finally {
      setCheckingResume(false);
    }
  }, []);

  useEffect(() => {
    checkResumeStatus();
  }, [checkResumeStatus]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    const toastId = toast.loading("Analyzing resume structures and contents...");
    try {
      const data = await analysisApi.analyzeResume();
      if (data.success) {
        toast.success("Resume analysis generated!", { id: toastId });
        setAnalysis(data);
      } else {
        toast.error("Failed to analyze resume.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Error running AI resume review.",
        { id: toastId }
      );
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (resumeExists) {
      runAnalysis();
    }
  }, [resumeExists]);

  if (checkingResume) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-405">Verifying resume index status...</p>
      </div>
    );
  }

  if (!resumeExists) {
    return (
      <div className="glass-card rounded-2xl border border-slate-800/60 p-10 text-center max-w-xl mx-auto my-10 space-y-6">
        <FileWarning className="w-16 h-16 text-slate-500 mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-extrabold text-white">No Resume Found</h2>
          <p className="text-sm text-slate-400">
            You need to upload your resume before InterviewPilot can analyze its strengths, weaknesses, and improvement items.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/40 pb-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            Resume Analyzer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Grounded review of your accomplishments, formatting structures, and potential improvements.
          </p>
        </div>
        {!analyzing && analysis && (
          <button
            onClick={runAnalysis}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-slate-800 hover:bg-slate-900/50 text-slate-300 text-sm font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Re-Analyze
          </button>
        )}
      </div>

      {analyzing ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-550 animate-spin" />
          <div className="text-center space-y-1.5">
            <h3 className="text-sm font-semibold text-slate-205">Reviewing resume vectors...</h3>
            <p className="text-xs text-slate-500">Evaluating formatting, highlights, and verb actions</p>
          </div>
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Strengths Card */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6 flex flex-col h-full bg-emerald-950/5 hover:border-emerald-500/20 transition-all">
            <div className="flex items-center gap-3 border-b border-slate-800/40 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-405 flex items-center justify-center">
                <CheckCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-emerald-400">Core Strengths</h3>
                <span className="text-[10px] text-slate-450 font-medium">Valid achievements identified</span>
              </div>
            </div>
            {analysis.strengths.length > 0 ? (
              <ul className="space-y-3.5 flex-1">
                {analysis.strengths.map((item, index) => (
                  <li key={index} className="flex gap-3 text-xs md:text-sm text-slate-300 leading-relaxed">
                    <span className="text-emerald-500 select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                No distinct strengths parsed from the context.
              </div>
            )}
          </div>

          {/* Weaknesses Card */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6 flex flex-col h-full bg-rose-950/5 hover:border-rose-500/20 transition-all">
            <div className="flex items-center gap-3 border-b border-slate-800/40 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-455 flex items-center justify-center">
                <AlertTriangle className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-rose-400">Critical Gaps</h3>
                <span className="text-[10px] text-slate-450 font-medium">Potential areas of concern</span>
              </div>
            </div>
            {analysis.weaknesses.length > 0 ? (
              <ul className="space-y-3.5 flex-1">
                {analysis.weaknesses.map((item, index) => (
                  <li key={index} className="flex gap-3 text-xs md:text-sm text-slate-300 leading-relaxed">
                    <span className="text-rose-500 select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                No major weaknesses found in the resume. Good job!
              </div>
            )}
          </div>

          {/* Improvements Card */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6 flex flex-col h-full bg-indigo-950/5 hover:border-indigo-500/20 transition-all">
            <div className="flex items-center gap-3 border-b border-slate-800/40 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-455 flex items-center justify-center">
                <ArrowUpCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-indigo-400">Improvements</h3>
                <span className="text-[10px] text-slate-450 font-medium">Actionable adjustments</span>
              </div>
            </div>
            {analysis.improvements.length > 0 ? (
              <ul className="space-y-3.5 flex-1">
                {analysis.improvements.map((item, index) => (
                  <li key={index} className="flex gap-3 text-xs md:text-sm text-slate-300 leading-relaxed">
                    <span className="text-indigo-500 select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                No immediate improvements suggested.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-2xl border border-slate-850">
          <Info className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-sm text-slate-400">Ready to analyze your resume.</p>
          <button
            onClick={runAnalysis}
            className="mt-4 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Trigger Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
