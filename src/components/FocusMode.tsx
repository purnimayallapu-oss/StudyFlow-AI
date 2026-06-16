import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye, EyeOff, Award, Sparkles, Check, HelpCircle } from "lucide-react";

interface FocusModeProps {
  onFocusSessionLogged: (minutes: number, xpAwarded: number) => void;
}

export default function FocusMode({ onFocusSessionLogged }: FocusModeProps) {
  const [mode, setMode] = useState<"FOCUS" | "SHORT_BREAK" | "LONG_BREAK">("FOCUS");
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [distractionFree, setDistractionFree] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(false);

  // Motivational quote pool
  const quotes = [
    "Refining neural pathways happens one focused minute at a time.",
    "Deep work is the superpower of the 21st century.",
    "Small consistent steps lead to massive syllabus readiness.",
    "Consistency beats intensity. Build your daily streak now.",
    "Your future self is thanking you for this specific block of time."
  ];
  const [activeQuote, setActiveQuote] = useState(quotes[0]);

  // Audio elements (using a gentle oscillator for notifications)
  const playAlertSound = () => {
    if (muted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, audioCtx.currentTime); // Gentle alert freq
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5); // sound for half second
    } catch (e) {
      console.warn("AudioContext block by browser configuration or constraints:", e);
    }
  };

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            handleTimerExpiration();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, mode]);

  // Reset Timer to selected mode limits
  const setTimerForMode = (selectedMode: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK") => {
    setIsActive(false);
    setMode(selectedMode);
    
    if (selectedMode === "FOCUS") {
      setSecondsLeft(25 * 60);
    } else if (selectedMode === "SHORT_BREAK") {
      setSecondsLeft(5 * 60);
    } else {
      setSecondsLeft(15 * 60);
    }

    // Pick a new quote for variety
    const nextQ = quotes[Math.floor(Math.random() * quotes.length)];
    setActiveQuote(nextQ);
  };

  const handleTimerExpiration = () => {
    playAlertSound();
    
    if (mode === "FOCUS") {
      setCompletedSessions((prev) => prev + 1);
      const focusMinutesCompleted = 25;
      const earnedXp = 30; // +30 XP for a Pomodoro
      
      onFocusSessionLogged(focusMinutesCompleted, earnedXp);
      
      // Auto-toggle to break
      setTimerForMode("SHORT_BREAK");
    } else {
      // Return to focus
      setTimerForMode("FOCUS");
    }
  };

  const toggleActiveState = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimerForMode(mode);
  };

  const formatTime = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = () => {
    let maxSeconds = 25 * 60;
    if (mode === "SHORT_BREAK") maxSeconds = 5 * 60;
    else if (mode === "LONG_BREAK") maxSeconds = 15 * 60;
    return ((maxSeconds - secondsLeft) / maxSeconds) * 100;
  };

  return (
    <div className={`transition-all max-w-3xl mx-auto px-6 py-6`} id="focus-pane-container">
      <div className={`p-8 rounded-3xl border transition-all duration-300 relative overflow-hidden backdrop-blur-md ${
        distractionFree 
          ? "bg-slate-950 border-slate-900/60 shadow-none py-16" 
          : "bg-slate-900/60 border-slate-800 shadow-xl"
      }`}>
        
        {/* Background gradient blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* DISTRACTION FREE HEADER BAR */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-805/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-purple-400" />
            </div>
            {!distractionFree && (
              <div>
                <h3 className="text-sm font-bold text-slate-100">Deep Work Focus Room</h3>
                <p className="text-[10px] text-slate-400">Lock study hours & earn XP blocks</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="focus-toggle-audio"
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={muted ? "Unmute clock alert" : "Mute clock alert"}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              id="focus-toggle-distract-free"
              onClick={() => setDistractionFree(!distractionFree)}
              className="px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center space-x-1"
            >
              {distractionFree ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{distractionFree ? "Normal Mode" : "Distraction-Free"}</span>
            </button>
          </div>
        </div>

        {/* TIMER DISPLAY */}
        <div className="text-center py-8 space-y-6">
          
          {/* TAB TO THERAPY MODES (ONLY VISIBLE IN NORMAL VIEW) */}
          {!distractionFree && (
            <div className="inline-flex p-1 rounded-2xl bg-slate-950 border border-slate-850 max-w-sm mx-auto">
              {(["FOCUS", "SHORT_BREAK", "LONG_BREAK"] as const).map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    id={`focus-tab-${m}`}
                    onClick={() => setTimerForMode(m)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      active 
                        ? "bg-indigo-600 text-white shadow" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {m.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          )}

          {/* TIMER GRAPHIC RING / COUNTDOWN */}
          <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
            
            {/* Outline Circular Progress */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="94"
                className="stroke-slate-950"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="94"
                className="stroke-indigo-505 transition-all duration-1000"
                strokeWidth="8"
                fill="transparent"
                style={{
                  stroke: mode === "FOCUS" ? "var(--color-indigo-500)" : "var(--color-emerald-500)",
                  strokeDasharray: "590",
                  strokeDashoffset: `${590 - (590 * progressPercentage()) / 100}`
                }}
              />
            </svg>

            {/* Inner text countdown */}
            <div className="z-10 space-y-1">
              <div 
                id="focus-digital-timer"
                className="text-5xl font-black font-mono tracking-tight text-white transition-all"
              >
                {formatTime(secondsLeft)}
              </div>
              <div className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase font-mono">
                {mode === "FOCUS" ? "🔥 Target Focused" : "🌿 Recalibration"}
              </div>
            </div>
          </div>

          {/* QUOTE REINFORCEMENTS */}
          <div className="max-w-md mx-auto pt-2 min-h-[44px]">
            <p className="text-sm font-medium italic text-slate-300 leading-normal">
              "{activeQuote}"
            </p>
          </div>

          {/* CORE CONTROLS */}
          <div className="flex items-center justify-center space-x-4 pt-4">
            <button
              id="focus-btn-reset"
              onClick={resetTimer}
              className="p-3.5 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-white text-slate-400 transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              id="focus-btn-toggle"
              onClick={toggleActiveState}
              className={`px-8 py-4.5 rounded-full font-extrabold text-sm tracking-wide cursor-pointer transition-all shadow-lg active:scale-95 ${
                isActive 
                  ? "bg-slate-800 hover:bg-slate-750 text-slate-100" 
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10"
              }`}
            >
              <span>{isActive ? "Pause Active Session" : "Start Focus Session"}</span>
            </button>
          </div>

          {/* SESSIONS COMPLETED METRIC (ONLY IN NORMAL STYLES) */}
          {!distractionFree && (
            <div className="pt-6 border-t border-slate-805/40 flex items-center justify-between text-xs text-slate-400 px-6">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Focus Intervals Today: <strong>{completedSessions}</strong></span>
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-850">
                +30 XP per completed block
              </span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
