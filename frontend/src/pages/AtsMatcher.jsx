import { useEffect, useState, useRef } from "react";
import { atsApi, documentApi } from "../services/api";
import { Link } from "react-router-dom";
import CircularProgress from "../components/CircularProgress";
import toast from "react-hot-toast";
import { useResumeStatus } from "../hooks/useResumeStatus";
import {
  SlidersHorizontal,
  FileWarning,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";

const AtsMatcher = () => {
  const { resumeExists, checkingResume } = useResumeStatus();
  const [jdMode, setJdMode] = useState("saved");
  const [savedJd, setSavedJd] = useState(null);
  const [loadingJd, setLoadingJd] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const [jdUploadText, setJdUploadText] = useState("");
  const [uploadingJd, setUploadingJd] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await documentApi.getJd();
        if (cancelled) return;

        if (data.success && data.document) {
          setSavedJd(data.document);
        } else {
          setSavedJd(null);
        }
      } catch {
        if (!cancelled) {
          setSavedJd(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingJd(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleJdTextUpload = async () => {
    if (!jdUploadText.trim() || jdUploadText.trim().length < 50) {
      toast.error("Please provide a more detailed job description (min 50 characters).");
      return;
    }

    setUploadingJd(true);
    const toastId = toast.loading("Indexing job description...");
    try {
      const data = await documentApi.uploadJdText(jdUploadText.trim());
      if (data.success) {
        toast.success("Job description saved and indexed!", { id: toastId });
        setSavedJd(data.document);
        setJdMode("saved");
        setJdUploadText("");
      } else {
        toast.error("Failed to save job description.", { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error uploading job description.", { id: toastId });
    } finally {
      setUploadingJd(false);
    }
  };

  const handleJdPdfUpload = async (file) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported.");
      return;
    }

    setUploadingJd(true);
    const toastId = toast.loading("Extracting and indexing PDF...");
    try {
      const data = await documentApi.uploadJd(file);
      if (data.success) {
        toast.success("Job description PDF indexed!", { id: toastId });
        setSavedJd(data.document);
        setJdMode("saved");
      } else {
        toast.error("Failed to index PDF.", { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error uploading PDF.", { id: toastId });
    } finally {
      setUploadingJd(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteJd = async () => {
    if (!window.confirm("Delete your saved job description?")) return;
    const toastId = toast.loading("Removing saved JD...");
    try {
      await documentApi.deleteJd();
      setSavedJd(null);
      toast.success("Saved job description removed.", { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete JD.", { id: toastId });
    }
  };

  const handleScoreCalculate = async (e) => {
    e.preventDefault();

    if (jdMode === "saved") {
      if (!savedJd) {
        toast.error("No saved job description. Upload or paste one first.");
        return;
      }
    } else if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      toast.error("Please provide a more detailed Job Description (min 50 characters).");
      return;
    }

    setScoring(true);
    setResult(null);
    const toastId = toast.loading("Analyzing matching scores and comparing keywords...");
    try {
      const data =
        jdMode === "saved"
          ? await atsApi.scoreWithSavedJd()
          : await atsApi.scoreMatch(jobDescription);
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
        color: "text-[#4E7C59] border-[#4E7C59]/20 bg-[#4E7C59]/5",
      };
    }
    if (score >= 55) {
      return {
        title: "Good Potential",
        desc: "Your profile matches some core duties, but there are several missing skills and tools that are key to the job.",
        color: "text-[#111111] border-[#E8E8E6] bg-[#F8F8F6]",
      };
    }
    return {
      title: "Low Compatibility",
      desc: "Your resume appears to lack a significant amount of the technical keywords and duties outlined in this description.",
      color: "text-red-750 border-red-500/20 bg-red-50/50",
    };
  };

  if (checkingResume) {
    return (
      <div className="space-y-6 animate-pulse font-sans">
        <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-6">
          <div className="space-y-2 w-full">
            <div className="h-8 bg-[#E8E8E6] rounded w-1/3"></div>
            <div className="h-4 bg-[#E8E8E6] rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white border border-[#E8E8E6] rounded-2xl p-6 h-96">
            <div className="h-6 bg-[#E8E8E6] rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-[#E8E8E6] rounded-lg"></div>
          </div>
          <div className="lg:col-span-2 bg-white border border-[#E8E8E6] rounded-2xl p-6 h-96">
            <div className="h-48 w-48 rounded-full bg-[#E8E8E6] mx-auto mb-6"></div>
            <div className="h-16 bg-[#E8E8E6] rounded-lg"></div>
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
            You need to upload your resume before InterviewPilot can run ATS matches against job requirements.
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
      <div className="flex items-center gap-4 border-b border-[#E8E8E6] pb-6">
        <div>
          <h1 className="text-3xl font-display font-medium text-[#111111] tracking-tight flex items-center gap-3">
            <SlidersHorizontal className="w-6 h-6 text-[#111111]" />
            ATS Optimizer
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Analyze your resume's keyword alignments against job descriptions using vector search scores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "saved", label: "Use Saved JD" },
                { id: "paste", label: "Paste New" },
                { id: "upload", label: "Upload JD" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setJdMode(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    jdMode === tab.id
                      ? "bg-[#111111] text-white border-[#111111]"
                      : "bg-white text-[#6B6B6B] border-[#E8E8E6] hover:border-[#111111]/30"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {jdMode === "saved" && (
              <div className="space-y-4">
                {loadingJd ? (
                  <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading saved job description...
                  </div>
                ) : savedJd ? (
                  <div className="p-4 rounded-lg border border-[#E8E8E6] bg-[#F8F8F6] space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#111111] flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {savedJd.fileName}
                        </p>
                        <p className="text-xs text-[#6B6B6B] mt-1">
                          {savedJd.vectorsCount} indexed chunks • Updated{" "}
                          {new Date(savedJd.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDeleteJd}
                        className="p-2 rounded-lg border border-[#E8E8E6] hover:bg-white text-[#6B6B6B] hover:text-red-700 transition-colors cursor-pointer"
                        title="Delete saved JD"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-dashed border-[#E8E8E6] text-center text-sm text-[#6B6B6B]">
                    No saved job description yet. Use the Upload JD or Paste New tab to index one.
                  </div>
                )}
              </div>
            )}

            {jdMode === "paste" && (
              <div className="space-y-3">
                <h2 className="text-base font-display font-semibold text-[#111111]">
                  One-off Job Description
                </h2>
                <textarea
                  placeholder="Paste the full job description details here for a one-time ATS comparison..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full h-64 p-4 rounded-lg text-sm border border-[#E8E8E6] focus:border-[#111111] outline-none text-[#111111] placeholder-[#6B6B6B]/40 bg-white resize-none leading-relaxed"
                  disabled={scoring}
                />
                <div className="flex justify-between items-center text-xs text-[#6B6B6B] px-1">
                  <span>Minimum recommended length: 50 characters</span>
                  <span>{jobDescription.length} characters</span>
                </div>
              </div>
            )}

            {jdMode === "upload" && (
              <div className="space-y-4">
                <h2 className="text-base font-display font-semibold text-[#111111]">
                  Save & Index Job Description
                </h2>
                <div
                  className="border-2 border-dashed border-[#E8E8E6] rounded-xl p-8 text-center hover:border-[#111111]/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-[#6B6B6B] mx-auto mb-2" />
                  <p className="text-sm text-[#111111] font-medium">Drop a PDF or click to upload</p>
                  <p className="text-xs text-[#6B6B6B] mt-1">Replaces any existing saved JD</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => handleJdPdfUpload(e.target.files?.[0])}
                    disabled={uploadingJd}
                  />
                </div>
                <div className="text-center text-xs text-[#6B6B6B]">— or paste text below —</div>
                <textarea
                  placeholder="Paste job description text to save and index for future ATS runs..."
                  value={jdUploadText}
                  onChange={(e) => setJdUploadText(e.target.value)}
                  className="w-full h-40 p-4 rounded-lg text-sm border border-[#E8E8E6] focus:border-[#111111] outline-none text-[#111111] placeholder-[#6B6B6B]/40 bg-white resize-none leading-relaxed"
                  disabled={uploadingJd}
                />
                <button
                  type="button"
                  onClick={handleJdTextUpload}
                  disabled={uploadingJd || !jdUploadText.trim()}
                  className="w-full py-2.5 px-4 rounded-lg border border-[#E8E8E6] hover:bg-[#F8F8F6] text-[#111111] font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {uploadingJd ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Indexing...
                    </>
                  ) : (
                    "Save & Index Text JD"
                  )}
                </button>
              </div>
            )}

            <form onSubmit={handleScoreCalculate}>
              <button
                type="submit"
                disabled={
                  scoring ||
                  uploadingJd ||
                  (jdMode === "saved" && !savedJd) ||
                  (jdMode === "paste" && !jobDescription.trim())
                }
                className="w-full py-3 px-4 rounded-lg bg-[#111111] hover:bg-black text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {scoring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Calculating matching index...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3.5 h-3.5" />
                    Score Compatibility
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {scoring ? (
            <div className="bg-white border border-[#E8E8E6] rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 h-[440px] shadow-sm">
              <Loader2 className="w-8 h-8 text-[#111111] animate-spin" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#111111]">Running ATS Review</h3>
                <p className="text-xs text-[#6B6B6B]">Checking vector similarities in resume chunks...</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
                <CircularProgress percentage={result.score} size={150} />
                {(() => {
                  const feedback = getScoreFeedback(result.score);
                  return (
                    <div className={`mt-6 p-4 rounded-lg border ${feedback.color} w-full`}>
                      <h4 className="font-bold text-sm flex items-center justify-center gap-1.5 mb-1.5">
                        <Award className="w-4 h-4" />
                        {feedback.title}
                      </h4>
                      <p className="text-xs leading-relaxed">{feedback.desc}</p>
                    </div>
                  );
                })()}
              </div>

              <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 shadow-sm">
                <h3 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-4 pl-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#111111]" />
                  Identified Keyword Gaps
                </h3>
                {result.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-700 border border-red-500/10"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-lg bg-[#F8F8F6] border border-[#E8E8E6] text-xs text-[#6B6B6B] italic">
                    No significant keyword gaps identified. Awesome!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#E8E8E6] rounded-2xl p-10 text-center flex flex-col items-center justify-center h-[440px] text-[#6B6B6B] shadow-sm">
              <AlertCircle className="w-12 h-12 text-[#6B6B6B] mb-4" />
              <h3 className="font-semibold text-sm text-[#111111]">Calculation Pending</h3>
              <p className="text-xs text-[#6B6B6B] max-w-xs mt-1.5 leading-relaxed">
                Select a saved JD, paste a description, or upload one, then run the ATS score.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtsMatcher;
