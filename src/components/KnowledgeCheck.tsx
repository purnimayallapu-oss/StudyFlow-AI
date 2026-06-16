import React, { useState, useEffect } from "react";
import { Check, X, Award, HelpCircle, ArrowRight, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { GeneratedQuiz, QuizQuestion, StudyTask } from "../types";

interface KnowledgeCheckProps {
  task: StudyTask;
  skillLevel: string;
  onCheckCompleted: (scorePercent: number, confidenceLevel: "STRONG" | "NEEDS_REVISION" | "REVISIT") => void;
  onClose: () => void;
}

export default function KnowledgeCheck({ task, skillLevel, onCheckCompleted, onClose }: KnowledgeCheckProps) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answersLog, setAnswersLog] = useState<{ questionId: number; userAns: string; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [task]);

  const loadLocalQuizFallback = () => {
    // Elegant fallback quiz generation to bypass API limitations
    const fallbackQuestions: QuizQuestion[] = [
      {
        id: 1,
        questionText: `What is the worst-case time complexity of searching or traversing in a standard balanced setup for "${task.topic}"?`,
        questionType: "MCQ",
        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        correctAnswer: "O(log N)",
        explanation: "In most optimized hierarchical layouts or trees, lookup scales logarithmically. If unbalanced, it degenerates to linear O(N)."
      },
      {
        id: 2,
        questionText: `True or False: The performance of analyzing "${task.topic}" remains completely unaffected by initial data ordering.`,
        questionType: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "Sorting, partitioning, and traversals often depend heavily on initial configuration. Presorted lists might trigger worst-case scenarios."
      },
      {
        id: 3,
        questionText: `Which main memory constraint or buffer type is traditionally utilized to cache elements during a "${task.topic}" operation?`,
        questionType: "MCQ",
        options: ["Cache Stack Buffer", "Heaps Allocation Space", "Static Virtual Table", "Contiguous Register Arrays"],
        correctAnswer: "Cache Stack Buffer",
        explanation: "Stack buffers or recursion stacks maintain state during systematic depth-first sweeps or execution states."
      },
      {
        id: 4,
        questionText: `True or False: We should always opt for the absolute highest priority allocation when scheduling or scaling "${task.topic}".`,
        questionType: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "High priority allocations ensure minimal starvation, lower processing jitter, and robust compliance."
      },
      {
        id: 5,
        questionText: `In standard terms, what is the primary objective of studying "${task.topic}" in your custom curriculum?`,
        questionType: "MCQ",
        options: ["Minimize space complexity and latency", "Synthesize mock values", "Duplicate data nodes", "Bypass index lookups"],
        correctAnswer: "Minimize space complexity and latency",
        explanation: "Efficiency in algorithmic resource management is the core objective of studying optimized topics."
      }
    ];

    setQuiz({
      quizTitle: `Self-Assessment: ${task.topic}`,
      questions: fallbackQuestions
    });
    setLoading(false);
  };

  const fetchQuiz = async () => {
    setLoading(true);
    setApiFailed(false);
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: task.subject,
          chapter: task.chapter,
          topic: task.topic,
          skillLevel: skillLevel
        })
      });

      if (!response.ok) {
        throw new Error("Unable to fetch quiz from AI server.");
      }

      const parsed = await response.json();
      if (!parsed.questions || parsed.questions.length === 0) {
        throw new Error("Invalid schema structure returned.");
      }

      setQuiz(parsed);
      setLoading(false);
    } catch (err) {
      console.warn("Quiz API failed or offline, loading fallback assessments:", err);
      setApiFailed(true);
      loadLocalQuizFallback();
    }
  };

  const activeQuestion = quiz?.questions[currentQuestionIndex];
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAnswerSelect = (option: string) => {
    if (showExplanation) return;
    setSelectedAnswer(option);
    setValidationError(null);
  };

  const handleNextOrSubmit = () => {
    if (!activeQuestion) return;

    if (!showExplanation) {
      if (!selectedAnswer || selectedAnswer.trim() === "") {
        setValidationError("Please select an option or type a valid answer before submitting.");
        return;
      }
      setValidationError(null);
      
      // Evaluate selected answer
      const isCorrect = selectedAnswer.trim().toLowerCase() === activeQuestion.correctAnswer.trim().toLowerCase();
      
      setAnswersLog(prev => [
        ...prev, 
        { questionId: activeQuestion.id, userAns: selectedAnswer, correct: isCorrect }
      ]);

      if (isCorrect) {
        setScore(prev => prev + 1);
      }
      setShowExplanation(true);
    } else {
      // Advance to next or finish
      setValidationError(null);
      if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer("");
        setShowExplanation(false);
      } else {
        setFinished(true);
      }
    }
  };

  const calculateFinalResults = () => {
    const totalQuestions = quiz?.questions.length || 5;
    const pct = Math.round((score / totalQuestions) * 100);
    
    let confidenceLevel: "STRONG" | "NEEDS_REVISION" | "REVISIT" = "NEEDS_REVISION";
    if (pct >= 80) confidenceLevel = "STRONG";
    else if (pct < 40) confidenceLevel = "REVISIT";

    onCheckCompleted(pct, confidenceLevel);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6.5 shadow-2xl relative overflow-hidden">
        
        {/* API Fallback alert badge */}
        {apiFailed && !loading && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1 font-mono">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>Local Recall Engine Fallback</span>
          </div>
        )}

        {/* LOADING INDICATOR */}
        {loading ? (
          <div className="py-16 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
            <div>
              <p className="text-slate-200 font-semibold text-sm">Generating Active AI Quiz...</p>
              <p className="text-[10px] text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                Analyzing chapter and synthesizing MCQ, True/False, and conceptual diagnostic questions...
              </p>
            </div>
          </div>
        ) : (
          <div>
            {!finished ? (
              <div>
                {/* ACTIVE QUIZ HEADER */}
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-800/80 text-xs text-slate-400 mt-2">
                  <span className="font-semibold text-[10px] text-indigo-400 tracking-wider uppercase font-sans">
                    Question {currentQuestionIndex + 1} of {quiz?.questions.length}
                  </span>
                  <span className="font-mono bg-slate-950 px-2 py-0.5 rounded text-[10px] text-slate-500">{task.topic}</span>
                </div>

                {/* Question text */}
                <div className="mb-6">
                  <h4 className="text-md font-bold text-slate-100 leading-relaxed font-sans">
                    {activeQuestion?.questionText}
                  </h4>
                </div>

                {/* Answer Options (Rendered if options are present) */}
                {activeQuestion?.options && activeQuestion.options.length > 0 && (
                  <div className="space-y-2.5 mb-5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Available Options:</span>
                    {activeQuestion.options.map((opt, idx) => {
                      const isSelected = selectedAnswer.trim().toLowerCase() === opt.trim().toLowerCase();
                      const isCorrect = opt.trim().toLowerCase() === activeQuestion.correctAnswer.trim().toLowerCase();
                      
                      let btnClass = "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60";
                      if (isSelected) {
                        btnClass = "bg-indigo-600/10 text-indigo-300 border-indigo-500";
                      }
                      if (showExplanation) {
                        if (isCorrect) {
                          btnClass = "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
                        } else if (isSelected && !isCorrect) {
                          btnClass = "bg-red-500/15 text-red-300 border-red-400/40";
                        } else {
                          btnClass = "bg-slate-950 text-slate-500 border-slate-900 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          id={`quiz-option-${idx}`}
                          disabled={showExplanation}
                          onClick={() => handleAnswerSelect(opt)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${btnClass}`}
                        >
                          <span>{opt}</span>
                          {showExplanation && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                          {showExplanation && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* ALWAYS RENDER A VISIBLE ANSWER INPUT FIELD */}
                <div className="space-y-2.5 mt-4">
                  <label htmlFor="quiz-answer-input" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    {activeQuestion?.questionType === "FILL_BLANK" ? "✍️ Type Your Answer:" : "📝 Your Answer Selection:"}
                  </label>
                  <div className="relative">
                    <input
                      id="quiz-answer-input"
                      type="text"
                      disabled={showExplanation}
                      placeholder={
                        activeQuestion?.questionType === "FILL_BLANK" 
                          ? "Type correct term, command, or phrase..."
                          : "Type text or select an option card above..."
                      }
                      value={selectedAnswer}
                      onChange={(e) => {
                        if (showExplanation) return;
                        setSelectedAnswer(e.target.value);
                        setValidationError(null);
                      }}
                      className="w-full bg-slate-950 text-slate-100 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-xs outline-none transition-all placeholder:text-slate-600 font-normal tracking-wide h-11 block opacity-100 visible select-all"
                      style={{
                        height: "44px",
                        maxHeight: "44px",
                        minHeight: "44px",
                        visibility: "visible",
                        display: "block",
                        opacity: 1
                      }}
                    />
                  </div>
                </div>

                {/* Validation message box */}
                {validationError && (
                  <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2 font-sans">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Explanation text */}
                {showExplanation && (
                  <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-850/80 text-[11px] leading-relaxed text-slate-400 shadow font-sans">
                    <p className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Conceptual Explanation:</span>
                    </p>
                    <p>{activeQuestion?.explanation}</p>
                  </div>
                )}

                {/* Submit / Action button */}
                <div className="mt-6 pt-4 border-t border-slate-800/40 flex justify-between items-center font-sans">
                  <span className="text-[10px] text-slate-500 font-mono">Current Score: {score} Correct</span>
                  <button
                    id="quiz-next-btn"
                    onClick={handleNextOrSubmit}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{showExplanation ? "Next Question" : "Submit Answer"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* COMPLETED RESULTS SCREEN */
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <Award className="w-7 h-7" />
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-100">Assessment Concluded!</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Topic concept checked. We have logged your score to adjust your next revision cycle interval.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Correct</div>
                    <div className="text-xl font-black text-slate-200 mt-1">{score} / {quiz?.questions.length}</div>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Accuracy</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">
                      {Math.round((score / (quiz?.questions.length || 5)) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-xl text-left text-xs text-slate-300 max-w-sm mx-auto">
                  <h5 className="font-bold text-slate-200 mb-1">Knowledge Standing:</h5>
                  <p className="leading-normal text-slate-400">
                    {score >= 4 ? (
                      <span className="text-emerald-400 font-medium">🟢 Strong Understanding.</span>
                    ) : score >= 2 ? (
                      <span className="text-yellow-400 font-medium">🟡 Moderate Understanding. Needs revision soon.</span>
                    ) : (
                      <span className="text-red-400 font-medium">🔴 Revisit topic. Re-prioritized on schedule automatically.</span>
                    )}
                    {" We will adjust the spaced repetition priority level of this chapter."}
                  </p>
                </div>

                <button
                  id="quiz-finalize-btn"
                  onClick={calculateFinalResults}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm cursor-pointer shadow active:scale-95 transition-all"
                >
                  Apply & Claim XP Rewards
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
