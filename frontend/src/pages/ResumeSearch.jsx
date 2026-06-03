import { useEffect, useState, useCallback } from "react";
import { searchApi, documentApi } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  FileWarning,
  Loader2,
  Database,
  Info,
} from "lucide-react";

const ResumeSearch = () => {
  const [resumeExists, setResumeExists] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [searched, setSearched] = useState(false);

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

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearched(true);
    try {
      const data = await searchApi.searchChunks(query.trim());
      if (data.success && Array.isArray(data.chunks)) {
        setChunks(data.chunks);
      } else {
        toast.error("Failed to run vector search.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error running vector query.");
    } finally {
      setSearching(false);
    }
  };

  if (checkingResume) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-sans">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm text-slate-400">Verifying resume index status...</p>
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
            You need to upload your resume before InterviewPilot can search its vector chunks.
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
    <div className="space-y-8 animate-fade-in font-sans max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4 border-b border-slate-800/40 pb-6">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
            <Database className="w-8 h-8 text-indigo-400" />
            Resume Chunk Search
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Directly query the Atlas vector database for fragments from your parsed resume.
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <div className="glass-card rounded-2xl border border-slate-800/60 p-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              placeholder="e.g. AWS deployments, React experience, university education..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm glass-input text-slate-200 placeholder-slate-650"
              disabled={searching}
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="py-3.5 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-md hover:shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {searching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Querying...
              </>
            ) : (
              <>
                Search
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Container */}
      <div className="space-y-4">
        {searching ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-xs text-slate-450">Executing similarity metrics query...</p>
          </div>
        ) : chunks.length > 0 ? (
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
              Vector Matches Found ({chunks.length})
            </span>
            <div className="space-y-3">
              {chunks.map((content, index) => (
                <div
                  key={index}
                  className="glass-card rounded-xl border border-slate-850 p-4 md:p-5 text-xs md:text-sm leading-relaxed text-slate-205 border-l-4 border-l-indigo-500 shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 bg-slate-900 border-b border-l border-slate-850 rounded-bl-lg text-[9px] font-bold text-slate-500 uppercase">
                    Rank #{index + 1}
                  </div>
                  <p className="pr-12">{content}</p>
                </div>
              ))}
            </div>
          </div>
        ) : searched ? (
          <div className="glass-card rounded-2xl border border-slate-850 p-10 text-center text-slate-500 flex flex-col items-center justify-center">
            <Info className="w-12 h-12 text-slate-700 mb-4" />
            <h3 className="font-semibold text-sm text-slate-400">No Vector Matches</h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
              No matching resume chunks met the threshold index for the query: "{query}"
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-slate-850 p-10 text-center text-slate-550 flex flex-col items-center justify-center">
            <Search className="w-12 h-12 text-slate-800 mb-4" />
            <h3 className="font-semibold text-sm text-slate-405">Query Database</h3>
            <p className="text-xs text-slate-505 max-w-xs mt-1.5 leading-relaxed">
              Enter keywords or sentences above to retrieve exact fragments retrieved by similarity scores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeSearch;
