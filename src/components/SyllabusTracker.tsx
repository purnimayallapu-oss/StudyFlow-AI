import React from "react";
import { CheckCircle, Layers, Book, Bookmark, Target, Award, Sparkles, FolderOpen } from "lucide-react";
import { Exam, StudyTask, Milestone } from "../types";

interface SyllabusTrackerProps {
  exam: Exam | null;
  tasks: StudyTask[];
  onToggleMilestone: (id: string) => void;
}

export default function SyllabusTracker({ exam, tasks, onToggleMilestone }: SyllabusTrackerProps) {
  if (!exam) {
    return (
      <div className="max-w-xl mx-auto px-6 py-12 text-center bg-slate-909/40 border border-slate-800 rounded-3xl">
        <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-base font-bold text-slate-300">No active Exam Planner detected</h3>
        <p className="text-xs text-slate-500 mt-2">Initialize your blueprint using our generative AI wizard!</p>
      </div>
    );
  }

  // Calculate subjects list
  const subjects = Array.from(new Set(tasks.map(t => t.subject)));

  // Calculate stats per subject
  const subjectStats = subjects.map(sub => {
    const subTasks = tasks.filter(t => t.subject === sub);
    const completed = subTasks.filter(t => t.status === "COMPLETED").length;
    const total = subTasks.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Group chapters
    const chapters = Array.from(new Set(subTasks.map(t => t.chapter)));
    const chapterData = chapters.map(ch => {
      const chTasks = subTasks.filter(t => t.chapter === ch);
      const chCompleted = chTasks.filter(t => t.status === "COMPLETED").length;
      const chTotal = chTasks.length;
      return {
        name: ch,
        completed: chCompleted,
        total: chTotal,
        percentage: chTotal > 0 ? Math.round((chCompleted / chTotal) * 100) : 0,
        tasks: chTasks
      };
    });

    return {
      name: sub,
      percentage,
      completed,
      total,
      chapters: chapterData
    };
  });

  const overallCompleted = tasks.filter(t => t.status === "COMPLETED").length;
  const overallTotal = tasks.length;
  const overallPercentage = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 font-sans space-y-6">
      
      {/* SECTION HEADER BLOCK */}
      <section className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Structured Hierarchy Tracker</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1.5">{exam.name} Syllabus Blueprint</h2>
          <p className="text-xs text-slate-400 mt-1">Estimations valid untill scheduled exams on {exam.targetDate}</p>
        </div>

        <div className="flex items-center space-x-4 shrink-0 bg-slate-950 p-4.5 rounded-2xl border border-slate-850 w-full md:w-auto">
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" className="stroke-slate-900" strokeWidth="4" fill="transparent" />
              <circle 
                cx="28" 
                cy="28" 
                r="24" 
                className="stroke-indigo-505" 
                strokeWidth="4" 
                fill="transparent" 
                style={{
                  stroke: "var(--color-indigo-500)",
                  strokeDasharray: "150",
                  strokeDashoffset: `${150 - (150 * overallPercentage) / 100}`
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-slate-100">
              {overallPercentage}%
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Syllabus Covered</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{overallCompleted} of {overallTotal} Topics completed</div>
          </div>
        </div>
      </section>

      {/* MILESTONES BAR PORTAL */}
      {exam.milestones && exam.milestones.length > 0 && (
        <section className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl backdrop-blur-sm shadow-xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5 text-indigo-400" />
            <span>AI Spaced Milestone Goals</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {exam.milestones.map((m) => (
              <div 
                key={m.id}
                className={`p-3.5 rounded-xl border flex justify-between items-start transition-all gap-3 ${
                  m.completed ? "bg-indigo-600/10 border-indigo-500/30 opacity-70" : "bg-slate-950/80 border-slate-850 hover:border-slate-800"
                }`}
              >
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-slate-105 flex items-center gap-1">
                    <span>{m.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-550 leading-relaxed pr-1">{m.description}</p>
                  <span className="inline-block text-[9px] font-mono font-bold text-slate-500 uppercase pt-2">Target: {m.targetDate}</span>
                </div>
                <input
                  id={`milestone-chk-${m.id}`}
                  type="checkbox"
                  checked={m.completed}
                  onChange={() => onToggleMilestone(m.id)}
                  className="w-4 h-4 cursor-pointer accent-indigo-505 rounded mt-0.5"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* HIERARCHICAL MATRIX LIST: Subject -> Chapter -> Topic */}
      <section className="space-y-4">
        {subjectStats.map((sub, sIdx) => (
          <div 
            key={sIdx}
            className="bg-slate-900/40 border border-slate-805/60 rounded-3xl p-5 backdrop-blur-sm space-y-4"
          >
            {/* SUBJECT ROW HEADER */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-850/60">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-500/10 border border-indigo-550/15 rounded-lg text-indigo-400">
                  <Book className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight">{sub.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{sub.completed} of {sub.total} Modules cleared</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 shrink-0">
                <span className="font-mono text-xs font-bold text-indigo-400">{sub.percentage}%</span>
                <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${sub.percentage}%` }} />
                </div>
              </div>
            </div>

            {/* NESTED CHAPTER TREE */}
            <div className="space-y-3.5 pl-2 leading-relaxed">
              {sub.chapters.map((ch, cIdx) => (
                <div 
                  key={cIdx} 
                  className="bg-slate-950/40 border border-slate-850 rounded-xl p-3.5 pl-4 space-y-2.5"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-200">Chapter: {ch.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({ch.percentage}% covered)</span>
                  </div>

                  {/* ACTIVE TOPICS NESTED ROWS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ch.tasks.map((t) => {
                      const complete = t.status === "COMPLETED";
                      return (
                        <div 
                          key={t.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between text-[11px] font-medium transition-all ${
                            complete 
                              ? "bg-slate-900/60 border-indigo-500/10 text-slate-400 opacity-70" 
                              : "bg-slate-950 border-slate-850 text-slate-300 hover:border-slate-800"
                          }`}
                        >
                          <span className="truncate pr-4 uppercase tracking-tight font-semibold">{t.topic}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono ${
                            complete 
                              ? "bg-indigo-550/10 text-indigo-400" 
                              : "bg-slate-850 text-slate-500"
                          }`}>
                            {complete ? "Covered" : "Pending"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </section>

    </div>
  );
}
