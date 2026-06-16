import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Circle, 
  Lock, 
  HelpCircle, 
  HelpCircle as QuizIcon, 
  Gift, 
  Gamepad2, 
  BookOpen, 
  Award, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  Brain,
  ChevronDown,
  Sparkles,
  ChevronUp,
  PartyPopper
} from "lucide-react";
import { StudyTask } from "../types";

interface VisualLearningJourneyProps {
  tasks: StudyTask[];
  onTaskCompletedToggle: (task: StudyTask) => void;
  onLaunchBreak: (task: StudyTask) => void;
  onLaunchQuiz: (task: StudyTask) => void;
  onLaunchSummary: (task: StudyTask) => void;
  onXpUpdate: (amount: number) => void;
}

export default function VisualLearningJourney({
  tasks,
  onTaskCompletedToggle,
  onLaunchBreak,
  onLaunchQuiz,
  onLaunchSummary,
  onXpUpdate
}: VisualLearningJourneyProps) {
  // Let the student select which task they are tracking in the pipeline
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);
  
  // Mystery Reward Opened State Tracked offline in localStorage
  const [openedRewards, setOpenedRewards] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem("studyflow_opened_rewards");
    return cached ? JSON.parse(cached) : {};
  });

  // Reveal Modal animation
  const [rewardRevealMsg, setRewardRevealMsg] = useState<{ title: string; desc: string; icon: string } | null>(null);

  // Set default selected task to the first pending or completed
  useEffect(() => {
    if (tasks.length > 0 && !selectedTaskId) {
      const pending = tasks.find(t => t.status !== "COMPLETED");
      if (pending) {
        setSelectedTaskId(pending.id);
      } else {
        setSelectedTaskId(tasks[0].id);
      }
    }
  }, [tasks, selectedTaskId]);

  const task = tasks.find(t => t.id === selectedTaskId);

  // Cache opened rewards
  const saveOpenedReward = (taskId: string, rewardName: string) => {
    const updated = { ...openedRewards, [taskId]: rewardName };
    setOpenedRewards(updated);
    localStorage.setItem("studyflow_opened_rewards", JSON.stringify(updated));
  };

  const possibleRewards = [
    { title: "Bonus 75 XP Multiplier", desc: "Your level indicators have surged forward!", icon: "⭐" },
    { title: "Streak Shield Protection Bubble", desc: "No worries if you miss studying tomorrow!", icon: "🛡️" },
    { title: "Exclusive 'Deep Thinker' Badge", desc: "Wear this on your profile proudly!", icon: "🎖️" },
    { title: "Vibrant Lavender Theme Unlocked", desc: "Switch themes in the customization tab!", icon: "🎨" },
    { title: "Legendary Coder Avatar Sunglasses", desc: "Your pixel sprite looks 10x cooler!", icon: "🕶️" },
    { title: "Alan Turing's Spark of Genius Code", desc: "'We can only see a short distance ahead, but we can see plenty there that needs to be done.'", icon: "🧠" },
    { title: "Sudoku Game Brain Trial Unlocked", desc: "Double reaction scores valid for next hour!", icon: "🎲" }
  ];

  const handleOpenMysteryBox = (taskId: string) => {
    if (openedRewards[taskId]) return; // Already claimed

    // Random roll
    const idx = Math.floor(Math.random() * possibleRewards.length);
    const rolled = possibleRewards[idx];
    
    // Persist
    saveOpenedReward(taskId, `${rolled.icon} ${rolled.title}`);
    
    // Award XP
    onXpUpdate(75);

    // Launch reveal modal
    setRewardRevealMsg({
      title: rolled.title,
      desc: rolled.desc,
      icon: rolled.icon
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 text-center">
        <Circle className="w-8 h-8 text-slate-700 mx-auto mb-2 animate-pulse" />
        <p className="text-xs text-slate-500 font-medium font-sans">No tasks available in your planner. Add topics to initiate the flowchart timeline!</p>
      </div>
    );
  }

  // Define steps matching the exact learning pipeline engine
  // 1. Study Topic
  // 2. Mark Complete
  // 3. Mystery Reward
  // 4. Interactive Brain Game
  // 5. AI Knowledge Quiz (5 Questions)
  // 6. AI Topic Summary
  // 7. XP & Achievement Update
  // 8. Revision Scheduled
  // 9. Next Topic Recommended
  
  const isCompleted = task?.status === "COMPLETED";
  const confidence = task?.confidenceScore || 0;
  const confidenceLvl = task?.confidenceLevel || "NEEDS_REVISION";
  const hasRewardOpened = task ? !!openedRewards[task.id] : false;
  const rewardClaimedText = task ? openedRewards[task.id] : "";

  // Helper to resolve step states
  // returns: 'COMPLETED' | 'CURRENT' | 'UPCOMING'
  const getStepState = (stepIdx: number): "COMPLETED" | "CURRENT" | "UPCOMING" => {
    if (!task) return "UPCOMING";
    
    const isTopicDone = task.status === "COMPLETED";

    if (stepIdx === 0) {
      return "COMPLETED"; // Always started
    }
    if (stepIdx === 1) {
      return isTopicDone ? "COMPLETED" : "CURRENT";
    }

    // Remaining steps require Topic completion, otherwise locked/upcoming
    if (!isTopicDone) {
      return "UPCOMING";
    }

    if (stepIdx === 2) {
      return hasRewardOpened ? "COMPLETED" : "CURRENT";
    }
    if (stepIdx === 3) {
      // Game: completed if reward opened
      return hasRewardOpened ? (task.confidenceScore !== undefined ? "COMPLETED" : "CURRENT") : "UPCOMING";
    }
    if (stepIdx === 4) {
      // Quiz: completed if score is registered
      return task.confidenceScore !== undefined ? "COMPLETED" : "UPCOMING";
    }
    if (stepIdx === 5) {
      // Summary
      return task.confidenceScore !== undefined ? "CURRENT" : "UPCOMING";
    }
    if (stepIdx === 6) {
      // XP Updated
      return isTopicDone ? "COMPLETED" : "UPCOMING";
    }
    if (stepIdx === 7) {
      // Spaced repetition scheduled
      return task.revisionScheduledDate ? "COMPLETED" : "UPCOMING";
    }
    if (stepIdx === 8) {
      // Next Topic Recommended
      return "CURRENT";
    }

    return "UPCOMING";
  };

  const steps = [
    {
      title: "Study Topic Concept",
      desc: `Revise and scan core lecture items for "${task?.topic || "Selected Chapter"}"`,
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      actionText: "Open Study Notes",
      action: () => alert("Switch to the 'Study Notes Deck' tab to consult details!")
    },
    {
      title: "Mark Topic Complete",
      desc: isCompleted ? "✓ Verified! Topic cleared." : "Complete self-revision to mark as checked.",
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      actionText: isCompleted ? "Reset to Pending" : "Mark Covered",
      action: () => task && onTaskCompletedToggle(task)
    },
    {
      title: "🎁 Surprise Reward Waiting",
      desc: hasRewardOpened 
        ? `Claimed: ${rewardClaimedText}`
        : "Unlock mystery badges, streak shields, and secret quotes!",
      icon: <Gift className={`w-4 h-4 ${hasRewardOpened ? "text-emerald-400" : "text-amber-400 animate-bounce"}`} />,
      actionText: hasRewardOpened ? "Opened ✅" : "🎁 Open Mystery Reward",
      action: () => task && handleOpenMysteryBox(task.id),
      disabled: !isCompleted || hasRewardOpened
    },
    {
      title: "🎮 Interactive Brain Game",
      desc: "Recover concentration scores with a 60-second reactive game challenge.",
      icon: <Gamepad2 className="w-4 h-4 text-purple-400" />,
      actionText: isCompleted ? "🎮 Start Mind Break" : "LOCKED",
      action: () => task && onLaunchBreak(task),
      disabled: !isCompleted
    },
    {
      title: "📝 AI Knowledge Quiz (5 Questions)",
      desc: "Run active spaced recall queries to benchmark memory pathways.",
      icon: <QuizIcon className="w-4 h-4 text-indigo-400" />,
      actionText: isCompleted ? (confidence > 0 ? `Redo Quiz (Best: ${confidence}%)` : "📝 Take recall test") : "LOCKED",
      action: () => task && onLaunchQuiz(task),
      disabled: !isCompleted
    },
    {
      title: "📚 AI Topic Summary Recap",
      desc: "Instantly draft bullet formulas and mistakes using intelligence models.",
      icon: <Brain className="w-4 h-4 text-pink-400" />,
      actionText: isCompleted ? "📚 Read instant recap" : "LOCKED",
      action: () => task && onLaunchSummary(task),
      disabled: !isCompleted
    },
    {
      title: "⭐ XP & Achievement Update",
      desc: isCompleted ? "Earned +50 XP and registered analytical updates." : "Pending course checks.",
      icon: <Award className="w-4 h-4 text-yellow-400" />,
      actionText: "View Profile Honours",
      action: () => alert("Consult your profile achievements to evaluate badges!")
    },
    {
      title: "Spaced Repetition Scheduled",
      desc: task?.revisionScheduledDate 
        ? `Review queued for Spaced Repetition on ${task.revisionScheduledDate} (Confidence: ${confidenceLvl})`
        : "Interval scheduled automatically based on memory score.",
      icon: <Calendar className="w-4 h-4 text-teal-400" />,
      actionText: "Automatic Timeline",
      action: () => {}
    },
    {
      title: "Next Topic Recommended",
      desc: "Consult dashboard recommender guidelines to lock the next milestone entry.",
      icon: <ArrowRight className="w-4 h-4 text-sky-400" />,
      actionText: "Inspect Roadmap",
      action: () => {}
    }
  ];

  const toggleStepExpand = (idx: number) => {
    setExpandedStepIndex(expandedStepIndex === idx ? null : idx);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5.5 backdrop-blur-sm shadow-xl space-y-4 font-sans text-xs">
      
      {/* HEADER SECTION WITH DROPDOWN TASK TRACKER */}
      <div className="border-b border-slate-850 pb-3.5 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5 leading-none">
            <TrendingUp className="w-4.5 h-4.5 text-indigo-450 animate-pulse" />
            <span>Interactive Roadmapped Pipeline</span>
          </h3>
          <span className="text-[8px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded uppercase">ENGINEER</span>
        </div>
        
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-500 tracking-wider font-mono">Curriculum Task Scanned:</label>
          <select
            value={selectedTaskId}
            onChange={(e) => {
              setSelectedTaskId(e.target.value);
              setExpandedStepIndex(null);
            }}
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-slate-100 font-bold uppercase text-[11px] outline-none outline-none focus:border-indigo-500 cursor-pointer"
          >
            {tasks.map(t => (
              <option key={t.id} value={t.id} className="bg-slate-950 text-slate-350">
                {t.subject.substring(0,6)} • {t.topic} {!t.status || t.status !== "COMPLETED" ? "⏳" : "🟢"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ROADMAP VERTICAL ENGINE LIST */}
      <div className="relative pl-3 pr-1 space-y-4 max-h-[500px] overflow-y-auto pt-1 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Connection pipe track behind */}
        <div className="absolute left-6.5 top-3 bottom-8 w-0.5 bg-gradient-to-b from-emerald-500 via-indigo-600 to-slate-800 z-0 opacity-40" />

        {steps.map((st, idx) => {
          const stepState = getStepState(idx);
          const isCurrent = stepState === "CURRENT";
          const isClaimed = stepState === "COMPLETED";
          const isExpand = expandedStepIndex === idx;

          let bulletStyle = "bg-slate-950 border-slate-800 text-slate-650";
          let textColorStyle = "text-slate-500";
          let barStyle = "text-slate-650";

          if (isClaimed) {
            bulletStyle = "bg-emerald-550/15 border-emerald-500 text-emerald-400 scale-105 shadow-sm shadow-emerald-500/5";
            textColorStyle = "text-slate-300";
          } else if (isCurrent) {
            bulletStyle = "bg-indigo-650/20 border-indigo-500 text-indigo-300 scale-110 shadow-lg shadow-indigo-500/10 animate-pulse";
            textColorStyle = "text-white font-bold";
          }

          return (
            <div 
              key={idx} 
              className={`relative flex gap-3.5 items-start transition-all duration-300 z-10 ${
                isCurrent ? "bg-indigo-600/5 p-2 rounded-2xl border border-indigo-500/10" : ""
              }`}
            >
              {/* Vertical Dot Connector */}
              <div 
                onClick={() => toggleStepExpand(idx)}
                className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 cursor-pointer text-xs font-mono font-bold select-none ${bulletStyle}`}
              >
                {isClaimed ? (
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step info block */}
              <div className="flex-1 space-y-1 pr-1 font-sans">
                <div 
                  onClick={() => toggleStepExpand(idx)}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <h4 className={`text-[11px] uppercase tracking-tight font-black flex items-center gap-1.5 ${textColorStyle}`}>
                    {st.icon}
                    <span>{st.title}</span>
                  </h4>
                  <div className="p-0.5 rounded hover:bg-slate-800 text-slate-550 group-hover:text-slate-205">
                    {isExpand ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <p className="text-[10px] text-slate-450 leading-relaxed font-light">{st.desc}</p>

                {/* Collapsible expanded detail helper actions */}
                {isExpand && (
                  <div className="pt-2 pb-1 bg-slate-950 p-2.5 rounded-xl border border-slate-850/70 space-y-2 text-[10.5px] font-medium leading-normal animate-slide-down">
                    
                    {/* Locked activity warning */}
                    {stepState === "UPCOMING" ? (
                      <p className="text-slate-500 italic flex items-center gap-1 font-semibold text-[9.5px]">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>This pipeline segment is locked untill preceding steps clear.</span>
                      </p>
                    ) : (
                      <>
                        <p className="text-slate-350 pr-1 select-none font-sans">Active segment parameters registered inside task tracker nodes.</p>
                        
                        {st.actionText !== "Automatic Timeline" && st.actionText !== "LOCKED" && (
                          <button
                            disabled={st.disabled}
                            onClick={st.action}
                            className={`w-full py-1.5 px-3 rounded-lg text-[10px] font-bold text-center active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer shadow ${
                              st.disabled
                                ? "bg-slate-900 border border-slate-850 text-slate-600 cursor-not-allowed"
                                : "bg-indigo-650 hover:bg-indigo-600 border border-indigo-550 text-white"
                            }`}
                          >
                            <span>{st.actionText}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP OVERLAY REVEALING MYSTERY REWARD SPARKLES */}
      {rewardRevealMsg && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center px-4 animate-fade-in">
          <div className="max-w-sm w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-60" />
            
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 text-3xl flex items-center justify-center mx-auto animate-bounce">
              {rewardRevealMsg.icon}
            </div>

            <div className="space-y-1.5 relative z-10 font-sans">
              <div className="flex justify-center items-center gap-1.5 text-xs text-amber-500 font-black uppercase tracking-widest leading-none">
                <PartyPopper className="w-4 h-4 text-amber-500" />
                <span>Mystery Box Claimed</span>
              </div>
              <h3 className="text-base font-black text-white pt-2 uppercase">{rewardRevealMsg.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light px-2">{rewardRevealMsg.desc}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850/80 prose prose-invert font-mono text-[10px] text-slate-400 select-none">
              <span className="text-emerald-400 font-bold block">✓ +75 Bonus XP Claimed!</span>
              <p className="text-[9px] text-slate-550 mt-1 capitalize">Logged inside your study logs deck.</p>
            </div>

            <button
              onClick={() => setRewardRevealMsg(null)}
              className="w-full py-2.5 bg-amber-505 hover:bg-amber-500 text-slate-950 font-black tracking-tight rounded-xl active:scale-95 transition-all text-xs cursor-pointer shadow-lg shadow-amber-500/10 uppercase"
              style={{
                backgroundColor: "var(--color-amber-500, #f59e0b)"
              }}
            >
              Collect Rewards
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
