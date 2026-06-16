import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, AlertCircle, Bot, User, CheckCircle, RefreshCw, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AICoachChatProps {
  currentXP: number;
  streakDays: number;
  completedTasksCount: number;
  totalTasksCount: number;
  examName: string;
}

export default function AICoachChat({ 
  currentXP, 
  streakDays, 
  completedTasksCount, 
  totalTasksCount,
  examName
}: AICoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Hello there! I'm your AI Study Coach. 
      
I keep track of your active syllabus parameters, study consistencies, and quiz standings. 

What can I help you optimize today? Ask me about:
• Preparing for **${examName || "your upcoming exam"}**
• Burnout advice or Pomodoro intervals
• Spaced revision schedules`
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyConfigured, setKeyConfigured] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Quick query pills
  const quickPrompts = [
    { label: "What should I study today?", text: "What should I focus on studying today?" },
    { label: "Am I on track?", text: "Check my statistics and let me know if I am on track before the exam deadline." },
    { label: "Which subject needs focus?", text: "Detect which core subjects or chapters need more priority." },
    { label: "Give me study motivation!", text: "Provide a quick burst of study motivation and concentration advice." }
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    // Check if key is configured
    fetch("/api/gemini-status")
      .then(res => res.json())
      .then(data => setKeyConfigured(data.configured))
      .catch(() => setKeyConfigured(false));
  }, []);

  const getLocalCoachResponse = (userQuery: string): string => {
    const q = userQuery.toLowerCase();
    const coveragePercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
    
    if (q.includes("today") || q.includes("focus")) {
      return `### Based on your syllabus metrics:
Here is your study direction for today:
1. **Target Priority Module**: Review the highest-priority pending chapter in your study plan list.
2. **Launch Recall Practice**: Completing a topic triggers an **AI Knowledge Check**. Set aside 5 minutes for active diagnostics.
3. **Take neural refresh breaks**: Do not study continuously for over 90 minutes. Do a rapid **AI Brain Refresh** to optimize cognitive pathways!`;
    }
    
    if (q.includes("track") || q.includes("statistics") || q.includes("status")) {
      return `### Syllabus Progress Audit:
• **Overall Coverage**: \`${coveragePercent}%\` complete (\`${completedTasksCount}/${totalTasksCount}\` topics).
• **Habit Streak**: \`${streakDays} Days\` consecutive study streak! 
• **Rank standing**: Gold III (accumulated \`${currentXP} XP\`).

**Verdict**: ${
        streakDays >= 3 
          ? "🟢 **Superb consistency!** Your consecutive streak multiplier is active. Preserve this momentum to complete remaining chapters comfortably."
          : "🟡 **Time to build momentum!** Try completing at least one diagnostic quiz today to re-awaken your passive memory recall."
      }`;
    }

    if (q.includes("motivation") || q.includes("help") || q.includes("burnout")) {
      return `### Cognitive Motivation Spark:
*"Amateurs wait for motivation. Professionals build simple systems."*

If you are feeling fatigued or burnt out today, try our **Micro-Commitment Method**:
1. Open the **Focus Room** tab.
2. Select standard **Pomodoro** and commit to studying for just **10 focused minutes**.
3. If you want to stop after 10 minutes, that's perfectly okay. But 90% of the time, the initial block is the hardest barrier, and momentum will carry you forward!`;
    }

    return `### StudyFlow Coaching Insights:
I have logged your request. Your streak standing is **${streakDays} Days** and you have cleared **${completedTasksCount}** syllabus elements! 

I recommend:
1. Keeping high-priority files marked checklist-completed.
2. Standardizing your daily **daily hours goal**. Keep doing custom quizzes to lock formulas into durable memory!`;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setUserInput("");
    setLoading(true);

    try {
      // Call coaching proxy
      const response = await fetch("/api/coach-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg]
        })
      });

      if (!response.ok) {
        throw new Error("Coaching proxy failed");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "model", text: data.text }]);
    } catch (err) {
      console.warn("Failed back-end chat route, loading offline Coaching insights:", err);
      
      // Delay briefly for organic timing
      setTimeout(() => {
        const fallbackText = getLocalCoachResponse(textToSend);
        setMessages(prev => [...prev, { role: "model", text: fallbackText }]);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 font-sans">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl flex flex-col h-[520px]">
        
        {/* Chat Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-805/40 mb-4 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Bot className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">StudyFlow Coach AI</h3>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Cognitive Assistant</span>
              </p>
            </div>
          </div>

          {!keyConfigured && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 tracking-wider">
              OFFLINE INSIGHTS ACTIVE
            </span>
          )}
        </div>

        {/* Messaging Logs Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
          {messages.map((m, idx) => {
            const isModel = m.role === "model";
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${isModel ? "self-start" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar Icon */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  isModel 
                    ? "bg-slate-950 border-indigo-500/10 text-indigo-400" 
                    : "bg-indigo-600 border-indigo-500 text-white"
                }`}>
                  {isModel ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                {/* Bubble content */}
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  isModel 
                    ? "bg-slate-950 text-slate-300 rounded-tl-none border border-slate-900/60" 
                    : "bg-indigo-600/10 border border-indigo-500/20 text-indigo-100 rounded-tr-none"
                }`}>
                  {/* Highly rendered structured markdown layout */}
                  <div className="space-y-1 text-[11.5px]">
                    {m.text.split("\n").map((line, lineIdx) => {
                      if (line.startsWith("###")) {
                        return <h4 key={lineIdx} className="font-bold text-slate-100 text-[12px] pt-1">{line.replace("###", "").trim()}</h4>;
                      }
                      if (line.startsWith("•") || line.startsWith("-")) {
                        return <li key={lineIdx} className="ml-2.5 list-disc leading-normal">{line.replace(/[•-]/, "").trim()}</li>;
                      }
                      return <p key={lineIdx} className="leading-normal">{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs pl-2 font-medium">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Analyzing syllabus parameters...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Quick query pills drawer (only if not loading) */}
        {!loading && (
          <div className="flex gap-2 overflow-x-auto pb-3 shrink-0 scrollbar-none max-w-full">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                id={`pill-prompt-${i}`}
                onClick={() => handleSendMessage(p.text)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 hover:border-slate-700 border border-slate-850 text-[10px] font-semibold text-slate-300 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Message Input controls */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(userInput); }}
          className="flex items-center gap-2 border-t border-slate-850/60 pt-3 shrink-0"
        >
          <input
            id="chat-user-message-input"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask coaching advice, study hacks, or streak multi..."
            className="flex-1 bg-slate-910/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 outline-none text-xs font-semibold"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!userInput.trim() || loading}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              userInput.trim() && !loading 
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-600/10" 
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
