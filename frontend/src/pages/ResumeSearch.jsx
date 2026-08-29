import { useState } from "react";
import { searchApi } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useResumeStatus } from "../hooks/useResumeStatus";
import {
  Search,
  FileWarning,
  Loader2,
  Database,
  Info,
} from "lucide-react";

const ResumeSearch = () => {
  const { resumeExists, checkingResume } = useResumeStatus();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [chunks, setChunks] = useState([]);
  const [searched, setSearched] = useState(false);

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
            <div className="space-y-4">
              {chunks.map((chunk, index) => {
                // Find matched keywords in the client-side for rendering
                const queryTerms = query
                  .toLowerCase()
                  .replace(/[^a-z0-9\s]/g, "")
                  .split(/\s+/)
                  .filter(term => term.length >= 3);
                
                const matchedWords = queryTerms.filter(term => 
                  chunk.content.toLowerCase().includes(term)
                );

                const relevanceScore = chunk.score 
                  ? Math.min(100, Math.round(chunk.score * 100)) 
                  : 100;

                return (
                  <div
                    key={index}
                    className="bg-white border border-[#E8E8E6] rounded-xl p-5 md:p-6 space-y-4 shadow-sm relative overflow-hidden hover:border-[#111111]/30 transition-all font-sans text-left"
                  >
                    {/* Rank & Relevance badge */}
                    <div className="flex items-center justify-between border-b border-[#E8E8E6] pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-widest block">
                          {chunk.section || "General"}
                        </span>
                        <h4 className="text-sm font-bold text-[#111111] mt-0.5">
                          {chunk.title || chunk.documentName || "Resume Document"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10.5px] font-semibold text-[#6B6B6B] bg-[#F8F8F6] px-2.5 py-1 rounded-md border border-[#E8E8E6]">
                          Rank #{index + 1}
                        </span>
                        <span className="text-[10.5px] font-bold text-[#4E7C59] bg-[#4E7C59]/10 px-2.5 py-1 rounded-md border border-[#4E7C59]/15">
                          Relevance: {relevanceScore}%
                        </span>
                      </div>
                    </div>

                    {/* Content text */}
                    <p className="text-xs md:text-sm text-[#111111] leading-relaxed whitespace-pre-wrap font-serif font-light">
                      {chunk.content}
                    </p>

                    {/* Footer metadata details */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-[10px] text-[#6B6B6B] border-t border-[#E8E8E6]/60">
                      {/* Matched Keywords */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold uppercase tracking-wider">Matched Keywords:</span>
                        {matchedWords.length > 0 ? (
                          matchedWords.map((word, wIdx) => (
                            <span key={wIdx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#4E7C59]/10 text-[#4E7C59] rounded font-medium border border-[#4E7C59]/15 lowercase">
                              ✓ {word}
                            </span>
                          ))
                        ) : (
                          <span className="italic text-[#6B6B6B]/60">semantic match</span>
                        )}
                      </div>
                      
                      {/* Document filename */}
                      {chunk.documentName && (
                        <span className="italic text-[10.5px]">
                          Source: {chunk.documentName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
