import React, { useState, useEffect } from "react";
import { Sparkles, HelpCircle, AlertOctagon, BookOpen, Check, Loader2, ArrowRight } from "lucide-react";
import { MicroSummaryData, StudyTask } from "../types";

interface MicroSummaryProps {
  task: StudyTask;
  onFinished: () => void;
}

export default function MicroSummary({ task, onFinished }: MicroSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MicroSummaryData | null>(null);

  useEffect(() => {
    fetchSummary();
  }, [task]);

  const loadLocalSummaryFallback = () => {
    const fallback: MicroSummaryData = {
      bullets: [
        `Optimal logical representation saves structural overhead space.`,
        `Direct read & linear traversals scale at linear O(N) complexity steps.`,
        `Always check index boundaries or allocation parameters to prevent overflows.`,
        `Caching buffers can be set to mitigate recursive storage constraints.`
      ],
      formulasOrDefinitions: [
        `Recursion Stack Space = O(D) where D represents execution depth depth.`,
        `Contiguous Array Lookup = O(1) random memory offset indexing.`
      ],
      examInsights: "Examiners heavily test marginal case limits, index offsets (-1, N), empty initialization inputs, and stack overflow conditions.",
      commonMistakes: [
        "Neglecting buffer bounds checking.",
        "Assuming best-case linear configurations default values.",
        "Overlooking pointer references in memory heaps."
      ]
    };
    setData(fallback);
    setLoading(false);
  };

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: task.subject,
          topic: task.topic
        })
      });

      if (!response.ok) {
        throw new Error("Summary API failed");
      }

      const parsed = await response.json();
      setData(parsed);
      setLoading(false);
    } catch (err) {
      console.warn("Summary API failed, loading local fallback recap:", err);
      loadLocalSummaryFallback();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Sparkles background */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center space-x-2.5 mb-5 pb-3 border-b border-slate-805/60">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">AI Micro-Summary</h3>
            <p className="text-[10px] text-indigo-300 font-medium">Concept reinforced successfully</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <span className="text-xs text-slate-400 text-center block">Distilling formulas and key mistake alerts...</span>
          </div>
        ) : (
          <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1">
            
            {/* Core concepts bullets */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>Core Takeaways</span>
              </h4>
              <ul className="space-y-1.5 pl-1">
                {data?.bullets.map((b, i) => (
                  <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formulas of Importance */}
            {data?.formulasOrDefinitions && data.formulasOrDefinitions.length > 0 && (
              <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-850">
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  Key Definitions & Formulas
                </h4>
                <ul className="space-y-1">
                  {data.formulasOrDefinitions.map((f, i) => (
                    <li key={i} className="text-[11px] font-mono text-slate-400 leading-normal">
                      • {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Exam focus insight */}
            {data?.examInsights && (
              <div className="space-y-1 bg-slate-950/40 p-3 rounded-xl border border-slate-850/80">
                <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-purple-400" />
                  <span>Exam Insight</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed italic pr-1">{data.examInsights}</p>
              </div>
            )}

            {/* Common pitfalls to prevent */}
            {data?.commonMistakes && data.commonMistakes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3 text-red-400" />
                  <span>Common Pitfalls to Avoid</span>
                </h4>
                <ul className="space-y-1 pl-1">
                  {data.commonMistakes.map((m, i) => (
                    <li key={i} className="text-[11px] text-red-300/90 leading-relaxed flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500/60 shrink-0" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              id="summary-return-btn"
              onClick={onFinished}
              className="w-full mt-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow flex items-center justify-center space-x-1 active:scale-95 transition-all"
            >
              <span>Accept Summary Recap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
