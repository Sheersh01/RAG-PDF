import { useEffect, useState, useCallback } from "react";
import { interviewApi, chatApi, documentApi } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  BrainCircuit,
  FileWarning,
  Loader2,
  Send,
  ArrowRight,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Undo,
  MessageSquare,
} from "lucide-react";

const MockInterview = () => {
  const [resumeExists, setResumeExists] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);

  // States for flow management: 'setup' | 'active' | 'summary'
  const [stage, setStage] = useState("setup");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Active session states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  
  // Array of { question, answer, feedback }
  const [qaHistory, setQaHistory] = useState([]);

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

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setGenerating(true);
    const toastId = toast.loading("Generating tailor-fit interview questions...");
    try {
      const data = await interviewApi.generateQuestions(
        topic.trim() || "Generate mock interview questions from this resume."
      );
      if (data.success && data.questions?.length > 0) {
        toast.success("Questions generated! Good luck.", { id: toastId });
        setQuestions(data.questions);
        setQaHistory(data.questions.map((q) => ({ question: q, answer: "", feedback: "" })));
        setCurrentIndex(0);
        setStage("active");
      } else {
        toast.error("Failed to generate questions. Please try again.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Error generating mock questions.",
        { id: toastId }
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error("Please enter an answer to submit.");
      return;
    }

    setSubmittingAnswer(true);
    const currentQuestion = questions[currentIndex];
    const toastId = toast.loading("Evaluating answer...");

    const prompt = `
You are an expert technical interviewer evaluating a candidate's response.
Provide constructive feedback and a brief qualitative rating (e.g. Excellent, Good, Fair, Needs Improvement).

Question: "${currentQuestion}"
Candidate's Answer: "${userAnswer.trim()}"

Provide a concise, grounded critique (max 4-5 sentences) summarizing:
1. Performance Rating (Bold this first)
2. What went well (Strengths)
3. What could be added or improved (Gaps)
`;

    try {
      const data = await chatApi.sendMessage(prompt);
      if (data.success) {
        toast.success("Feedback received!", { id: toastId });
        const updatedHistory = [...qaHistory];
        updatedHistory[currentIndex] = {
          question: currentQuestion,
          answer: userAnswer.trim(),
          feedback: data.answer,
        };
        setQaHistory(updatedHistory);
      } else {
        toast.error("Failed to evaluate answer.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error getting answer feedback.", { id: toastId });
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNext = () => {
    setUserAnswer("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStage("summary");
    }
  };

  const handleReset = () => {
    setStage("setup");
    setQuestions([]);
    setQaHistory([]);
    setCurrentIndex(0);
    setUserAnswer("");
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
            You need to upload your resume before InterviewPilot can generate specific mock questions.
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
      <div className="border-b border-slate-800/40 pb-6">
        <h1 className="text-3xl font-display font-extrabold text-white tracking-tight flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-indigo-400" />
          Mock Interview Simulator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Simulate standard interview queries tailored to your experience and target role, with immediate qualitative AI feedback.
        </p>
      </div>

      {/* STAGE 1: SETUP */}
      {stage === "setup" && (
        <div className="glass-card rounded-2xl border border-slate-800/60 p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-display font-bold text-white">Set Interview Focus</h2>
            <p className="text-xs text-slate-400">
              Provide a job role, technology stack, or target field. Leaving it blank generates general questions based entirely on your uploaded resume text.
            </p>
          </div>

          <form onSubmit={handleGenerateQuestions} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-1">
                Target Role / Focus Topic
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer (React/TypeScript), Product Manager, Machine Learning Scientist..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full py-3 px-4 rounded-xl text-sm glass-input text-slate-200 placeholder-slate-600"
                disabled={generating}
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 hover:shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating questions...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Start Interview Simulator
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STAGE 2: ACTIVE SESSION */}
      {stage === "active" && questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-medium px-1">
            <span className="text-indigo-400 uppercase tracking-wider font-semibold">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-slate-500">
              {Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-550 transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6 md:p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <HelpCircle className="w-24 h-24 text-slate-100" />
            </div>

            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-semibold text-slate-550 uppercase tracking-widest pl-0.5">
                AI Interviewer Question
              </span>
              <h2 className="text-lg md:text-xl font-display font-bold text-slate-100 leading-snug">
                {questions[currentIndex]}
              </h2>
            </div>

            {/* Answer textarea */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1">
                Your Answer
              </label>
              <textarea
                placeholder="Type your detailed response here. Use specific examples from your experience, metrics, or technical explanations where applicable..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full h-40 p-4 rounded-xl text-sm glass-input text-slate-200 placeholder-slate-600 resize-none leading-relaxed"
                disabled={submittingAnswer || qaHistory[currentIndex].feedback}
              />
            </div>

            {/* Actions & Feedback */}
            <div className="space-y-6">
              {/* Feedback box */}
              {qaHistory[currentIndex].feedback && (
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/50 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <MessageSquare className="w-4 h-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">AI Evaluation Feedback</h4>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed text-slate-300 font-medium whitespace-pre-wrap">
                    {qaHistory[currentIndex].feedback}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                {!qaHistory[currentIndex].feedback ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || !userAnswer.trim()}
                    className="py-3 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none transition-all"
                  >
                    {submittingAnswer ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Answer
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-550 to-purple-650 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Finish Interview
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: SUMMARY */}
      {stage === "summary" && qaHistory.length > 0 && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl border border-slate-800/60 p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle className="w-16 h-16 text-emerald-555 mx-auto" />
              <h2 className="text-2xl font-display font-extrabold text-white">Interview Complete!</h2>
              <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto">
                Below is a compilation of the questions asked, your responses, and the feedback provided by the AI reviewer.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {qaHistory.map((item, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-900/30 border border-slate-850 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">
                      Question {idx + 1}
                    </span>
                    <h3 className="text-sm md:text-base font-bold text-slate-200">
                      {item.question}
                    </h3>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Your Response
                    </span>
                    <p className="p-3 bg-slate-950/45 rounded-lg border border-slate-900 text-xs text-slate-350 italic">
                      {item.answer}
                    </p>
                  </div>

                  <div className="space-y-1.5 p-4 rounded-lg bg-indigo-950/10 border border-indigo-950/20">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      AI Critique
                    </span>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {item.feedback}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4 border-t border-slate-800/40">
              <button
                onClick={handleReset}
                className="py-3 px-6 rounded-xl border border-slate-800 hover:bg-slate-900/50 text-slate-300 font-semibold text-sm flex items-center gap-2 cursor-pointer transition-all"
              >
                <Undo className="w-4 h-4" />
                Practice New Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
