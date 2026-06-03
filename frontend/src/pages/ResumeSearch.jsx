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
        <Loader2 className="w-8 h-8 text-[#111111] animate-spin mb-4" />
        <p className="text-sm text-[#6B6B6B]">Verifying resume index status...</p>
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
            You need to upload your resume before InterviewPilot can search its vector chunks.
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
    <div className="space-y-8 animate-fade-in font-sans max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4 border-b border-[#E8E8E6] pb-6">
        <div>
          <h1 className="text-3xl font-display font-medium text-[#111111] tracking-tight flex items-center gap-3">
            <Database className="w-6 h-6 text-[#111111]" />
            Resume Chunk Search
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            Directly query the Atlas vector database for fragments from your parsed resume.
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-white border border-[#E8E8E6] rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B6B6B]">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              placeholder="e.g. AWS deployments, React experience, university education..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border border-[#E8E8E6] focus:border-[#111111] outline-none text-[#111111] placeholder-[#6B6B6B]/40 bg-white"
              disabled={searching}
            />
          </div>
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="py-2.5 px-5 rounded-lg bg-[#111111] hover:bg-black text-white font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {searching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
            <Loader2 className="w-8 h-8 text-[#111111] animate-spin" />
            <p className="text-xs text-[#6B6B6B]">Executing similarity metrics query...</p>
          </div>
        ) : chunks.length > 0 ? (
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-[#111111] uppercase tracking-wider pl-1 flex items-center gap-1.5">
              Vector Matches Found ({chunks.length})
            </span>
            <div className="space-y-3">
              {chunks.map((content, index) => (
                <div
                  key={index}
                  className="bg-white border border-[#E8E8E6] rounded-lg p-4 md:p-5 text-xs md:text-sm leading-relaxed text-[#111111] border-l-4 border-l-[#111111] shadow-sm relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 bg-[#F8F8F6] border-b border-l border-[#E8E8E6] rounded-bl-lg text-[9px] font-bold text-[#6B6B6B] uppercase">
                    Rank #{index + 1}
                  </div>
                  <p className="pr-12">{content}</p>
                </div>
              ))}
            </div>
          </div>
        ) : searched ? (
          <div className="bg-white border border-[#E8E8E6] rounded-2xl p-10 text-center text-[#6B6B6B] flex flex-col items-center justify-center shadow-sm">
            <Info className="w-12 h-12 text-[#6B6B6B] mb-4" />
            <h3 className="font-semibold text-sm text-[#111111]">No Vector Matches</h3>
            <p className="text-xs text-[#6B6B6B] max-w-xs mt-1.5 leading-relaxed">
              No matching resume chunks met the threshold index for the query: "{query}"
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E8E8E6] rounded-2xl p-10 text-center text-[#6B6B6B] flex flex-col items-center justify-center shadow-sm">
            <Search className="w-12 h-12 text-[#6B6B6B] mb-4" />
            <h3 className="font-semibold text-sm text-[#111111]">Query Database</h3>
            <p className="text-xs text-[#6B6B6B] max-w-xs mt-1.5 leading-relaxed">
              Enter keywords or sentences above to retrieve exact fragments retrieved by similarity scores.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeSearch;
