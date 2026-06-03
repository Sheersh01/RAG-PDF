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
      <div className="space-y-6 animate-pulse font-sans">
        <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-6">
          <div className="space-y-2 w-full">
            <div className="h-8 bg-[#E8E8E6] rounded w-1/3"></div>
            <div className="h-4 bg-[#E8E8E6] rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 h-80">
            <div className="h-6 bg-[#E8E8E6] rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-[#E8E8E6] rounded w-full"></div>
              <div className="h-3 bg-[#E8E8E6] rounded w-5/6"></div>
              <div className="h-3 bg-[#E8E8E6] rounded w-4/5"></div>
            </div>
          </div>
          <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 h-80">
            <div className="h-6 bg-[#E8E8E6] rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-[#E8E8E6] rounded w-full"></div>
              <div className="h-3 bg-[#E8E8E6] rounded w-5/6"></div>
              <div className="h-3 bg-[#E8E8E6] rounded w-4/5"></div>
            </div>
          </div>
          <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 h-80">
            <div className="h-6 bg-[#E8E8E6] rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-[#E8E8E6] rounded w-full"></div>
              <div className="h-3 bg-[#E8E8E6] rounded w-5/6"></div>
              <div className="h-3 bg-[#E8E8E6] rounded w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resumeExists) {
    return (
      <div className="bg-white border border-[#E8E8E6] rounded-2xl p-10 text-center max-w-xl mx-auto my-10 space-y-6 shadow-sm">
        <FileWarning className="w-16 h-16 text-[#6B6B6B] mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-medium text-[#111111]">No Resume Found</h2>
          <p className="text-sm text-[#6B6B6B]">
            You need to upload your resume before InterviewPilot can analyze its strengths, weaknesses, and improvement items.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-[#111111] hover:bg-black text-white font-semibold text-xs transition-all"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E8E6] pb-6">
        <div>
          <h1 className="text-3xl font-display font-medium text-[#111111] tracking-tight flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#111111]" />
            Resume Analyzer
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Grounded review of your accomplishments, formatting structures, and potential improvements.
          </p>
        </div>
        {!analyzing && analysis && (
          <button
            onClick={runAnalysis}
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-[#E8E8E6] hover:bg-white text-[#111111] text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Re-Analyze
          </button>
        )}
      </div>

      {analyzing ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-8 h-8 text-[#111111] animate-spin" />
          <div className="text-center space-y-1.5">
            <h3 className="text-sm font-semibold text-[#111111]">Reviewing resume vectors...</h3>
            <p className="text-xs text-[#6B6B6B]">Evaluating formatting, highlights, and verb actions</p>
          </div>
        </div>
      ) : analysis ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Strengths Card */}
          <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 flex flex-col h-full shadow-sm hover:border-[#111111]/30 transition-all">
            <div className="flex items-center gap-3 border-b border-[#E8E8E6] pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#4E7C59]/10 text-[#4E7C59] flex items-center justify-center">
                <CheckCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-[#4E7C59]">Core Strengths</h3>
                <span className="text-[10px] text-[#6B6B6B] font-medium">Valid achievements identified</span>
              </div>
            </div>
            {analysis.strengths.length > 0 ? (
              <ul className="space-y-3.5 flex-1">
                {analysis.strengths.map((item, index) => (
                  <li key={index} className="flex gap-3 text-xs md:text-sm text-[#111111] leading-relaxed">
                    <span className="text-[#4E7C59] select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-[#6B6B6B] text-xs italic">
                No distinct strengths parsed from the context.
              </div>
            )}
          </div>

          {/* Weaknesses Card */}
          <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 flex flex-col h-full shadow-sm hover:border-[#111111]/30 transition-all">
            <div className="flex items-center gap-3 border-b border-[#E8E8E6] pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-red-700">Critical Gaps</h3>
                <span className="text-[10px] text-[#6B6B6B] font-medium">Potential areas of concern</span>
              </div>
            </div>
            {analysis.weaknesses.length > 0 ? (
              <ul className="space-y-3.5 flex-1">
                {analysis.weaknesses.map((item, index) => (
                  <li key={index} className="flex gap-3 text-xs md:text-sm text-[#111111] leading-relaxed">
                    <span className="text-red-700 select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-[#6B6B6B] text-xs italic">
                No major weaknesses found in the resume. Good job!
              </div>
            )}
          </div>

          {/* Improvements Card */}
          <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 flex flex-col h-full shadow-sm hover:border-[#111111]/30 transition-all">
            <div className="flex items-center gap-3 border-b border-[#E8E8E6] pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#111111]/5 text-[#111111] flex items-center justify-center">
                <ArrowUpCircle className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-[#111111]">Improvements</h3>
                <span className="text-[10px] text-[#6B6B6B] font-medium">Actionable adjustments</span>
              </div>
            </div>
            {analysis.improvements.length > 0 ? (
              <ul className="space-y-3.5 flex-1">
                {analysis.improvements.map((item, index) => (
                  <li key={index} className="flex gap-3 text-xs md:text-sm text-[#111111] leading-relaxed">
                    <span className="text-[#111111] select-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-[#6B6B6B] text-xs italic">
                No immediate improvements suggested.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-[#E8E8E6] rounded-2xl shadow-sm">
          <Info className="w-12 h-12 text-[#6B6B6B] mx-auto mb-4" />
          <p className="text-sm text-[#6B6B6B]">Ready to analyze your resume.</p>
          <button
            onClick={runAnalysis}
            className="mt-4 px-5 py-2 bg-[#111111] hover:bg-black text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Trigger Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
