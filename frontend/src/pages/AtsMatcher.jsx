import { useEffect, useState, useCallback } from "react";
import { atsApi, documentApi } from "../services/api";
import { Link } from "react-router-dom";
import CircularProgress from "../components/CircularProgress";
import toast from "react-hot-toast";
import {
  SlidersHorizontal,
  FileWarning,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award,
} from "lucide-react";

const AtsMatcher = () => {
  const [resumeExists, setResumeExists] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);

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

  const handleScoreCalculate = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      toast.error("Please provide a more detailed Job Description (min 50 characters).");
      return;
    }

    setScoring(true);
    setResult(null);
    const toastId = toast.loading("Analyzing matching scores and comparing keywords...");
    try {
      const data = await atsApi.scoreMatch(jobDescription);
      if (data.success) {
        toast.success("ATS Compatibility Calculated!", { id: toastId });
        setResult(data);
      } else {
        toast.error("Failed to generate ATS score.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error running ATS matcher.", { id: toastId });
    } finally {
      setScoring(false);
    }
  };

  const getScoreFeedback = (score) => {
    if (score >= 80) {
      return {
        title: "Strong Compatibility",
        desc: "Your profile is a great match for this position! The resume contains almost all required keyword vectors and capabilities.",
        color: "text-emerald-400 border-emerald-500/20 bg-emerald-950/10",
      };
    }
    if (score >= 55) {
      return {
        title: "Good Potential",
        desc: "Your profile matches some core duties, but there are several missing skills and tools that are key to the job.",
        color: "text-indigo-400 border-indigo-500/20 bg-indigo-950/10",
      };
    }
    return {
      title: "Low Compatibility",
      desc: "Your resume appears to lack a significant amount of the technical keywords and duties outlined in this description.",
      color: "text-rose-400 border-rose-500/20 bg-rose-950/10",
    };
  };

  if (checkingResume) {
    return (
      <div className="space-y-6 animate-pulse font-sans">
        <div className="flex items-center justify-between border-b border-slate-800/40 pb-6">
          <div className="space-y-2 w-full">
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 glass-card rounded-2xl border border-slate-800/40 p-6 h-96 bg-slate-900/20">
            <div className="h-6 bg-slate-800 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-slate-800 rounded-xl"></div>
          </div>
          <div className="lg:col-span-2 glass-card rounded-2xl border border-slate-800/40 p-6 h-96 bg-slate-900/20">
            <div className="h-48 w-48 rounded-full bg-slate-800 mx-auto mb-6"></div>
            <div className="h-16 bg-slate-800 rounded-xl"></div>
          </div>
        </div>
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
            You need to upload your resume before InterviewPilot can run ATS matches against job requirements.
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
      <div className="flex items-center gap-4 border-b border-slate-800/40 pb-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
            <SlidersHorizontal className="w-8 h-8 text-indigo-400" />
            ATS Optimizer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyze your resume's keyword alignments against job descriptions using vector search scores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Paste Form Panel */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6">
            <h2 className="text-base font-display font-bold text-white mb-3">
              Target Job Description
            </h2>
            <form onSubmit={handleScoreCalculate} className="space-y-4">
              <div>
                <textarea
                  placeholder="Paste the full job description details here, including responsibilities, prerequisites, required technologies, and experience levels..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full h-80 p-4 rounded-xl text-sm glass-input text-slate-200 placeholder-slate-600 resize-none leading-relaxed"
                  disabled={scoring}
                />
                <div className="flex justify-between items-center text-xs text-slate-500 mt-2 px-1">
                  <span>Minimum recommended length: 50 characters</span>
                  <span>{jobDescription.length} characters</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={scoring || !jobDescription.trim()}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                {scoring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating matching index...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Score Compatibility
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {scoring ? (
            <div className="glass-card rounded-2xl border border-slate-800/60 p-12 text-center flex flex-col items-center justify-center space-y-4 h-[440px]">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-200">Running ATS Review</h3>
                <p className="text-xs text-slate-500">Checking vector similarities in resume chunks...</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Score summary card */}
              <div className="glass-card rounded-2xl border border-slate-800/60 p-6 flex flex-col items-center text-center">
                <CircularProgress percentage={result.score} size={150} />

                {/* Score feedback text */}
                {(() => {
                  const feedback = getScoreFeedback(result.score);
                  return (
                    <div className={`mt-6 p-4 rounded-xl border ${feedback.color} w-full`}>
                      <h4 className="font-bold text-sm flex items-center justify-center gap-1.5 mb-1.5">
                        <Award className="w-4 h-4" />
                        {feedback.title}
                      </h4>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {feedback.desc}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Missing skills card */}
              <div className="glass-card rounded-2xl border border-slate-800/60 p-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 pl-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-indigo-400" />
                  Identified Keyword Gaps
                </h3>
                {result.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl bg-slate-900/30 border border-slate-850 text-xs text-slate-450 italic">
                    No significant keyword gaps identified. Awesome!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-slate-800/60 p-10 text-center flex flex-col items-center justify-center h-[440px] text-slate-500">
              <AlertCircle className="w-12 h-12 text-slate-700 mb-4" />
              <h3 className="font-semibold text-sm text-slate-400">Calculation Pending</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                Paste a target job description on the left and submit to assess score indicators.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtsMatcher;
