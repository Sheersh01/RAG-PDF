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
      <div className="space-y-6 animate-pulse font-sans max-w-4xl mx-auto h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] flex flex-col">
        <div className="border-b border-[#E8E8E6] pb-4 shrink-0">
          <div className="h-8 bg-[#E8E8E6] rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-[#E8E8E6] rounded w-1/2"></div>
        </div>
        <div className="flex-1 bg-white border border-[#E8E8E6] rounded-2xl p-6 space-y-4">
          <div className="flex gap-3 max-w-[70%] mr-auto">
            <div className="w-9 h-9 rounded-xl bg-[#E8E8E6] shrink-0"></div>
            <div className="h-16 bg-[#E8E8E6] rounded-lg w-full"></div>
          </div>
          <div className="flex gap-3 max-w-[50%] ml-auto flex-row-reverse">
            <div className="w-9 h-9 rounded-xl bg-[#E8E8E6] shrink-0"></div>
            <div className="h-12 bg-[#E8E8E6] rounded-lg w-full"></div>
          </div>
        </div>
        <div className="h-14 bg-white border border-[#E8E8E6] rounded-lg shrink-0 mt-4"></div>
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
            You need to upload your resume before InterviewPilot can retrieve background contexts for coaching answers.
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
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] space-y-4 font-sans max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-[#E8E8E6] pb-4 shrink-0">
        <h1 className="text-2xl md:text-3xl font-display font-medium text-[#111111] tracking-tight flex items-center gap-3">
          <MessagesSquare className="w-6 h-6 text-[#111111]" />
          AI Coach
        </h1>
        <p className="text-xs md:text-sm text-[#6B6B6B] mt-0.5">
          Ask questions, practice interview scenarios, or get tips based on your vectorized resume profile.
        </p>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto bg-white border border-[#E8E8E6] rounded-2xl p-4 md:p-6 space-y-6 min-h-0 relative shadow-sm">
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
                  className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center border text-[#111111] ${
                    isUser
                      ? "bg-[#F8F8F6] border-[#E8E8E6]"
                      : "bg-[#111111] border-[#111111] text-white"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4 text-[#111111]" /> : <Brain className="w-4 h-4 text-white" />}
                </div>

                {/* Bubble */}
                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-lg text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-[#111111] text-white rounded-tr-none"
                        : "bg-[#F8F8F6] border border-[#E8E8E6] text-[#111111] rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Accordion citation */}
                  {!isUser && msg.chunks.length > 0 && (
                    <div className="space-y-1.5 pl-1">
                      <button
                        onClick={() => handleCitationToggle(idx)}
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#111111]/70 hover:text-[#111111] transition-colors focus:outline-none cursor-pointer"
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
                        <div className="space-y-1.5 p-3 rounded-lg bg-white border border-[#E8E8E6] animate-slide-in">
                          {msg.chunks.map((chunk, cIdx) => (
                            <div
                              key={cIdx}
                              className="text-[10.5px] leading-relaxed text-[#6B6B6B] border-l border-[#E8E8E6] pl-2 select-none"
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
              <div className="w-9 h-9 rounded-lg bg-[#111111] border border-[#111111] shrink-0 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="bg-[#F8F8F6] border border-[#E8E8E6] py-3.5 px-4 rounded-lg rounded-tl-none flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-[#111111] animate-spin" />
                <span className="text-xs text-[#6B6B6B]">AI Coach is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Prompts suggestions (only visible when chat starts or idle) */}
      {messages.length === 1 && !sending && (
        <div className="shrink-0 space-y-2">
          <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider pl-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#111111]" />
            Quick Starter Prompts
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {starterPrompts.map((pText, i) => (
              <button
                key={i}
                onClick={() => handleStarterClick(pText)}
                className="p-3 text-left rounded-lg bg-white hover:bg-[#F8F8F6] border border-[#E8E8E6] hover:border-[#111111]/30 text-[11px] md:text-xs text-[#6B6B6B] hover:text-[#111111] leading-relaxed transition-all cursor-pointer shadow-sm"
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
          className="flex-1 py-2.5 px-4 rounded-lg text-sm border border-[#E8E8E6] focus:border-[#111111] outline-none text-[#111111] placeholder-[#6B6B6B]/40 bg-white"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !inputMessage.trim()}
          className="py-2.5 px-5 rounded-lg bg-[#111111] hover:bg-black text-white font-semibold text-sm flex items-center justify-center shrink-0 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AiCoach;
