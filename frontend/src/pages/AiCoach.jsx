import { useEffect, useState, useRef, useCallback } from "react";
import { chatApi, documentApi } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MessagesSquare,
  FileWarning,
  Loader2,
  Send,
  Sparkles,
  User,
  Brain,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";

const AiCoach = () => {
  const [resumeExists, setResumeExists] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your AI Interview Coach. I have analyzed your resume chunks in our vector database. Ask me anything about your qualifications, technical stack, how to explain certain projects, or general interview strategy!",
      chunks: [],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [expandedCitationIndex, setExpandedCitationIndex] = useState(null);

  const messagesEndRef = useRef(null);

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

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { sender: "user", text: userText, chunks: [] }]);
    setSending(true);

    try {
      const data = await chatApi.sendMessage(userText);
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.answer,
            chunks: Array.isArray(data.chunks) ? data.chunks : [],
          },
        ]);
      } else {
        toast.error("Failed to fetch response.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error communicating with AI Coach.");
    } finally {
      setSending(false);
    }
  };

  const handleCitationToggle = (index) => {
    setExpandedCitationIndex(expandedCitationIndex === index ? null : index);
  };

  const starterPrompts = [
    "What are the top three technical skills highlighted in my resume?",
    "Suggest a behavioral interview question based on my project experience.",
    "How can I better explain the technical details of my work history?",
  ];

  const handleStarterClick = (promptText) => {
    setInputMessage(promptText);
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
            You need to upload your resume before InterviewPilot can retrieve background contexts for coaching answers.
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
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] space-y-4 font-sans max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-800/40 pb-4 shrink-0">
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
          <MessagesSquare className="w-7 md:w-8 h-7 md:h-8 text-indigo-400" />
          AI Coach
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-0.5">
          Ask questions, practice interview scenarios, or get tips based on your vectorized resume profile.
        </p>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto glass-card rounded-2xl border border-slate-800/60 p-4 md:p-6 space-y-6 min-h-0 relative">
        <div className="space-y-6">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border text-white ${
                    isUser
                      ? "bg-slate-800 border-slate-700 text-indigo-400"
                      : "bg-gradient-to-tr from-indigo-500 to-purple-600 border-indigo-500 shadow-md"
                  }`}
                >
                  {isUser ? <User className="w-4.5 h-4.5" /> : <Brain className="w-4.5 h-4.5" />}
                </div>

                {/* Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-900 border border-slate-850 text-slate-205 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Accordion citation */}
                  {!isUser && msg.chunks.length > 0 && (
                    <div className="space-y-1.5 pl-1">
                      <button
                        onClick={() => handleCitationToggle(idx)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        {expandedCitationIndex === idx ? (
                          <>
                            Hide Resume Sources <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Show Resume Sources ({msg.chunks.length}) <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>

                      {expandedCitationIndex === idx && (
                        <div className="space-y-1.5 p-3 rounded-lg bg-slate-950/60 border border-slate-900 animate-slide-in">
                          {msg.chunks.map((chunk, cIdx) => (
                            <div
                              key={cIdx}
                              className="text-[10.5px] leading-relaxed text-slate-400 border-l border-slate-800 pl-2 select-none"
                            >
                              "{chunk}"
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 border border-indigo-500 shrink-0 flex items-center justify-center shadow-md">
                <Brain className="w-4.5 h-4.5 text-white animate-pulse" />
              </div>
              <div className="bg-slate-900 border border-slate-850 py-3.5 px-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-450">AI Coach is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Prompts suggestions (only visible when chat starts or idle) */}
      {messages.length === 1 && !sending && (
        <div className="shrink-0 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Quick Starter Prompts
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {starterPrompts.map((pText, i) => (
              <button
                key={i}
                onClick={() => handleStarterClick(pText)}
                className="p-3 text-left rounded-xl bg-slate-900/30 hover:bg-slate-900/80 border border-slate-850 hover:border-slate-750 text-[11px] md:text-xs text-slate-350 leading-relaxed transition-all cursor-pointer"
              >
                {pText}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <form onSubmit={handleSendMessage} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask a question about your resume capabilities..."
          className="flex-1 py-3.5 px-4 rounded-xl text-sm glass-input text-slate-200 placeholder-slate-600"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !inputMessage.trim()}
          className="py-3.5 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-md hover:shadow-indigo-550/20 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
};

export default AiCoach;
