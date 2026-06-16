import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Book, 
  Layers, 
  HelpCircle, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  Award,
  Zap,
  Target,
  Check,
  RotateCcw
} from "lucide-react";
import { Exam, StudyTask, Milestone } from "../types";

interface PlanGeneratorProps {
  onPlanGenerated: (exam: Exam, tasks: StudyTask[]) => void;
}

type GoalType = "Academic" | "Competitive Exam" | "Placement" | "Certification" | "Skill Learning" | "Custom";

export default function PlanGenerator({ onPlanGenerated }: PlanGeneratorProps) {
  const [step, setStep] = useState<number>(1);
  
  // New Onboarding States
  const [goalType, setGoalType] = useState<GoalType>("Certification");
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [currentSkillLevel, setCurrentSkillLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [dailyHours, setDailyHours] = useState(4);
  const [weeklyAvailability, setWeeklyAvailability] = useState<string[]>([
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
  ]);

  // Syllabus custom input options
  const [syllabusMethod, setSyllabusMethod] = useState<"ai" | "manual">("ai");
  const [subjects, setSubjects] = useState("");
  const [chapters, setChapters] = useState("");
  const [topics, setTopics] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  // Dynamically advise placeholder suggestions based on selected goal type
  const goalPlaceholders: Record<GoalType, { name: string; subjects: string; chapters: string; topics: string }> = {
    Academic: {
      name: "e.g. University Semester Exams, Physics Honors Finals",
      subjects: "Classical Mechanics, Quantum Physics, Electromagnetism",
      chapters: "Newtonian Equations, Schrodinger Wave, Maxwell Laws",
      topics: "Relativity, Photoelectric Effect, Boundary Conditions, Coulomb Force"
    },
    "Competitive Exam": {
      name: "e.g. UPSC civil services, JEE Mains, NEET, UPSC, CAT, SSC, Banking",
      subjects: "Quantitative Aptitude, General History, Data Interpretation",
      chapters: "Vedic History, Modern Economics, Linear Algebra Formulas",
      topics: "Ancient Dynasties, Monetary Policy, GDP Calculations, Probability Matrices"
    },
    Placement: {
      name: "e.g. FAANG Software Engineer prep, Placement preparation",
      subjects: "Data Structures & Algorithms, System Design, behavioral prep",
      chapters: "Grid BFS/DFS, Load Balancers, Leadership principles",
      topics: "Graph Traversal, Cache Consistency, STAR Methodology, Multi-threading"
    },
    Certification: {
      name: "e.g. AWS Solutions Architect, Azure fundamentals, PMP certification",
      subjects: "Cloud Network Infrastructure, Identity Management, Storage Classes",
      chapters: "VPC Networks, IAM policies, Simple Storage Service (S3)",
      topics: "Public/Private Subnets, Multi-Factor Authentication, Lifecycle Rules, EC2 scaling"
    },
    "Skill Learning": {
      name: "e.g. Fluent Conversational French, Data Science Bootcamp, Python Programming",
      subjects: "Core Vocab & Grammar, Python libraries, Pandas modeling",
      chapters: "Verb conjugations, Dataframes processing, Supervised learning",
      topics: "Present tense, Lambda mapping, Linear regressions, Speech articulation"
    },
    Custom: {
      name: "e.g. Write custom learning goal or professional project",
      subjects: "Prerequisites basics, Advanced implementation, Deployments",
      chapters: "Module foundational guidelines, Execution roadmap, Live Launch",
      topics: "Initial Scaffolding review, Bug solving drills, Production server hosting"
    }
  };

  // Set default target exam date to 90 days out automatically if blank
  useEffect(() => {
    if (!examDate) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 90);
      setExamDate(futureDate.toISOString().split("T")[0]);
    }
  }, []);

  const handleDayToggle = (day: string) => {
    if (weeklyAvailability.includes(day)) {
      setWeeklyAvailability(weeklyAvailability.filter(d => d !== day));
    } else {
      setWeeklyAvailability([...weeklyAvailability, day]);
    }
  };

  const getIntensityDescriptor = (hours: number): string => {
    if (hours <= 2) return "Light Habits (Consistent steps)";
    if (hours <= 5) return "Moderate Tracker (Standard candidate)";
    if (hours <= 8) return "Intensive Sprint (Fast progress)";
    return "Extreme Bootcamp (Maximum recall density)";
  };

  const handleLocalGenerator = () => {
    const mockExamId = "exam_" + Date.now();
    
    // Fallback curriculums if AI fails/unavailable, dynamically chosen based on goal type to prevent GATE CS bias
    let chosenSubjects = subjects;
    let chosenChapters = chapters;
    let chosenTopics = topics;

    if (!chosenTopics || chosenTopics.trim() === "") {
      const fallbackConfig = goalPlaceholders[goalType];
      chosenSubjects = fallbackConfig.subjects;
      chosenChapters = fallbackConfig.chapters;
      chosenTopics = fallbackConfig.topics;
    }

    const subjectList = chosenSubjects.split(",").map(s => s.trim()).filter(Boolean);
    const chapterList = chosenChapters.split(",").map(c => c.trim()).filter(Boolean);
    const topicList = chosenTopics.split(",").map(t => t.trim()).filter(Boolean);

    const targetDateObj = new Date(examDate || "2027-02-15");
    const today = new Date();
    const timeframeDays = Math.max(7, Math.floor((targetDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    const generatedTasks: StudyTask[] = [];
    
    topicList.forEach((topicName, idx) => {
      const assignedSubject = subjectList[idx % subjectList.length] || subjectList[0] || "General Foundations";
      const assignedChapter = chapterList[idx % chapterList.length] || chapterList[0] || "Module Chapter 1";
      
      const daysToAdd = Math.floor((idx + 1) * (timeframeDays / (topicList.length + 1)));
      const taskDueDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      generatedTasks.push({
        id: `task_${idx}_${Date.now()}`,
        examId: mockExamId,
        subject: assignedSubject,
        chapter: assignedChapter,
        topic: topicName,
        priority: idx % 3 === 0 ? "HIGH" : idx % 3 === 1 ? "MEDIUM" : "LOW",
        estimatedHours: Math.max(1, Math.round((2.5 + (idx % 2)) * 10) / 10),
        dueDate: taskDueDate.toISOString().split("T")[0],
        status: "NOT_STARTED",
        revisionCount: 0
      });
    });

    const generatedMilestones: Milestone[] = [
      {
        id: "m_1_" + Date.now(),
        title: `${examName || "Syllabus"} Launchpoint`,
        targetDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        description: "Initialize your primary active-recall learning nodes.",
        completed: false
      },
      {
        id: "m_2_" + Date.now(),
        title: "Intermediate Readiness Evaluation",
        targetDate: new Date(today.getTime() + Math.floor(timeframeDays * 0.5) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        description: `Complete at least ${Math.ceil(topicList.length / 2)} structured syllabus topics.`,
        completed: false
      },
      {
        id: "m_3_" + Date.now(),
        title: "Full Roadmap Coverage & Revision Phase",
        targetDate: new Date(targetDateObj.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        description: "Conclude active spaced revisions and perfect mock scores.",
        completed: false
      }
    ];

    const finalExam: Exam = {
      id: mockExamId,
      name: examName || `${goalType} Plan`,
      goalType: goalType,
      targetDate: examDate,
      dailyHoursGoal: Number(dailyHours),
      currentSkillLevel: currentSkillLevel,
      weeklyAvailability: weeklyAvailability,
      estimatedCompletionDate: new Date(targetDateObj.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      totalExpectedHours: topicList.length * 3,
      milestones: generatedMilestones
    };

    onPlanGenerated(finalExam, generatedTasks);
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setErrorMessage(null);

    // Prepare clean server payload
    const payload = {
      examName: examName || `${goalType} Syllabus`,
      goalType: goalType,
      examDate,
      subjects: syllabusMethod === "manual" ? subjects.split(",").map(s => s.trim()).filter(Boolean) : [],
      chapters: syllabusMethod === "manual" ? chapters.split(",").map(c => c.trim()).filter(Boolean) : [],
      topics: syllabusMethod === "manual" ? topics.split(",").map(t => t.trim()).filter(Boolean) : [],
      dailyHours,
      weeklyAvailability,
      currentSkillLevel,
    };

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed server API call");
      }

      const data = await response.json();
      
      const mockExamId = "exam_" + Date.now();
      const mappedTasks: StudyTask[] = (data.tasks || []).map((t: any, index: number) => ({
        id: `task_${index}_${Date.now()}`,
        examId: mockExamId,
        subject: t.subject || "General Module",
        chapter: t.chapter || "Syllabus Unit",
        topic: t.topic,
        priority: t.priority === "HIGH" || t.priority === "MEDIUM" || t.priority === "LOW" ? t.priority : "MEDIUM",
        estimatedHours: t.estimatedHours || 3,
        dueDate: t.dueDate || examDate,
        status: "NOT_STARTED",
        revisionCount: 0
      }));

      const mappedMilestones: Milestone[] = (data.milestones || []).map((m: any, index: number) => ({
        id: `milestone_${index}_${Date.now()}`,
        title: m.title,
        targetDate: m.targetDate,
        description: m.description,
        completed: false
      }));

      const generatedExam: Exam = {
        id: mockExamId,
        name: examName || `${goalType} Study Plan`,
        goalType,
        targetDate: examDate,
        dailyHoursGoal: Number(dailyHours),
        currentSkillLevel,
        weeklyAvailability,
        estimatedCompletionDate: data.estimatedCompletionDate || examDate,
        totalExpectedHours: data.totalExpectedHours || Math.round(mappedTasks.length * 3),
        milestones: mappedMilestones
      };

      onPlanGenerated(generatedExam, mappedTasks);

    } catch (err: any) {
      console.warn("API Error, launching elegant high-fidelity algorithmic planner:", err.message);
      setErrorMessage(`Gemini API connection or key missing. Activating StudyFlow high-fidelity local scheduler as a seamless fallback!`);
      
      // Delay briefly so the student registers the fallback setup
      setTimeout(() => {
        handleLocalGenerator();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 font-sans">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm shadow-xl relative overflow-hidden">
        
        {/* Progress Bar Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">AI Onboarding Setup</h2>
              <span className="text-xs text-slate-400">Let's craft your high-fidelity study system</span>
            </div>
          </div>
          <div className="flex space-x-1.5">
            <button 
              id="goto-step-1"
              onClick={() => setStep(1)}
              className={`w-8 h-2 rounded-full cursor-pointer transition-all ${step >= 1 ? "bg-indigo-500" : "bg-slate-800"}`} 
            />
            <button 
              id="goto-step-2"
              disabled={!examName.trim()}
              onClick={() => setStep(2)}
              className={`w-8 h-2 rounded-full transition-all ${step >= 2 ? "bg-indigo-500" : "bg-slate-800"} disabled:opacity-40 disabled:cursor-not-allowed`} 
            />
            <button 
              id="goto-step-3"
              disabled={!examName.trim()}
              onClick={() => setStep(3)}
              className={`w-8 h-2 rounded-full transition-all ${step >= 3 ? "bg-indigo-500" : "bg-slate-800"} disabled:opacity-40 disabled:cursor-not-allowed`} 
            />
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-xs text-indigo-300 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0 animate-bounce" />
            <div>
              <p className="font-bold">{errorMessage}</p>
              <p className="text-[10px] text-indigo-400 mt-1">Generating custom chapters and trackable nodes in our regional client core database...</p>
            </div>
          </div>
        )}

        {/* LOADING STATE SCREEN */}
        {loading ? (
          <div className="py-20 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-505 border-t-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <div className="text-slate-100 font-bold">Researching {examName}...</div>
              <p className="text-xs text-slate-450">Gemini is writing custom active recall modules and milestones.</p>
            </div>
            <div className="space-y-2 text-[11px] text-slate-400 max-w-sm mx-auto bg-slate-950/40 p-4 rounded-2xl border border-slate-850/60 leading-relaxed font-mono">
              <p className="animate-pulse flex items-center justify-center gap-1.5 text-emerald-400"><Check className="w-3.5 h-3.5" /> Building standard subjects & chapters mapped to target dates...</p>
              <p className="delay-300 animate-pulse flex items-center justify-center gap-1.5 text-indigo-300"><Check className="w-3.5 h-3.5" /> Evenly dividing {dailyHours}h daily budget across weekly days...</p>
              <p className="delay-700 animate-pulse flex items-center justify-center gap-1.5 text-amber-350"><Check className="w-3.5 h-3.5" /> Incorporating spaced repeat intervals (1d, 3d, 7d, 15d)...</p>
            </div>
          </div>
        ) : (
          <div>
            {/* STEP 1: GOAL PROFILE */}
            {step === 1 && (
              <div className="space-y-6">
                
                {/* 1. Goal Type Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    1. What is your Study Goal Category?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(["Academic", "Competitive Exam", "Placement", "Certification", "Skill Learning", "Custom"] as GoalType[]).map((type) => {
                      const isSelected = goalType === type;
                      return (
                        <button
                          key={type}
                          id={`goal-card-${type.replace(/\s+/g, "-").toLowerCase()}`}
                          type="button"
                          onClick={() => setGoalType(type)}
                          className={`p-4 rounded-2xl border cursor-pointer text-left transition-all relative ${
                            isSelected 
                              ? "bg-indigo-600/10 border-indigo-500 text-white shadow" 
                              : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className={`p-1.5 rounded-lg border flex items-center justify-center ${isSelected ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" : "bg-slate-900 border-slate-800 text-slate-500"}`}>
                              {type === "Academic" && <GraduationCap className="w-4 h-4" />}
                              {type === "Competitive Exam" && <Target className="w-4 h-4" />}
                              {type === "Placement" && <Briefcase className="w-4 h-4" />}
                              {type === "Certification" && <Award className="w-4 h-4" />}
                              {type === "Skill Learning" && <Zap className="w-4 h-4" />}
                              {type === "Custom" && <Sparkles className="w-4 h-4" />}
                            </span>
                            <span className="text-xs font-bold">{type}</span>
                          </div>
                          {isSelected && (
                            <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-indigo-605 text-white flex items-center justify-center text-[8px] animate-fade-in">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Goal Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    2. Describe your Goal Name
                  </label>
                  <input
                    id="setup-exam-name"
                    type="text"
                    required
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder={goalPlaceholders[goalType].name}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-650 outline-none text-sm font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5 italic">
                    Example: {goalPlaceholders[goalType].name.replace("e.g. ", "")}
                  </p>
                </div>

                {/* 3. Date & Skill Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      3. Target Completion Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                      <input
                        id="setup-exam-date"
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500/80 rounded-xl pl-11 pr-4 py-3 tracking-wide text-slate-100 outline-none text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      4. Current Expertise
                    </label>
                    <select
                      id="setup-exam-level"
                      value={currentSkillLevel}
                      onChange={(e) => setCurrentSkillLevel(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500/80 rounded-xl p-3 text-slate-200 outline-none text-sm font-medium"
                    >
                      <option value="Beginner">Beginner (Starting from Scratch)</option>
                      <option value="Intermediate">Intermediate (Has basic fundamentals)</option>
                      <option value="Advanced">Advanced (Polishing mock practices)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    id="setup-btn-next-1"
                    type="button"
                    disabled={!examName.trim()}
                    onClick={() => setStep(2)}
                    className="px-6 py-3 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow active:scale-95 transition-all"
                  >
                    <span>Define Availability</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: AVAILABILITY & WEEKLY INTENSITY */}
            {step === 2 && (
              <div className="space-y-6">
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    5. Which days of the week can you study block?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {daysOfWeek.map((day) => {
                      const active = weeklyAvailability.includes(day);
                      return (
                        <button
                          key={day}
                          id={`chk-day-${day}`}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-2.5 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                            active 
                              ? "bg-indigo-600/15 text-indigo-300 border-indigo-500" 
                              : "bg-slate-950 text-slate-400 border-slate-850/80 hover:border-slate-800"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                      6. Daily Target study commitment
                    </label>
                    <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                      {dailyHours} Hours/day
                    </span>
                  </div>
                  <div className="flex items-center space-x-5">
                    <input
                      id="setup-daily-hours-slider"
                      type="range"
                      min="1"
                      max="12"
                      value={dailyHours}
                      onChange={(e) => setDailyHours(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-450 mt-2 font-medium">
                    Study Pattern Index: <span className="font-bold text-slate-300">{getIntensityDescriptor(dailyHours)}</span>
                  </p>
                </div>

                <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-850 flex items-start space-x-3.5">
                  <Clock className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-extrabold text-slate-100 uppercase tracking-wide">Automatic Spaced Repetition Scheduling</p>
                    <p className="text-slate-400 leading-normal">Our system automatically constructs review tasks 1, 3, 7, and 15 days out based on the completion of topics, helping you preserve optimal retention rates dynamically.</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    id="setup-btn-back-2"
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-sm cursor-pointer flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Go Back</span>
                  </button>
                  
                  <button
                    id="setup-btn-next-2"
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white font-semibold text-sm cursor-pointer flex items-center space-x-1.5 shadow active:scale-95 transition-all"
                  >
                    <span>Choose Syllabus Mode</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* STEP 3: SYLLABUS SPLIT */}
            {step === 3 && (
              <div className="space-y-6">
                
                {/* Selection between AI generation and Manual input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    How would you like to compile your Syllabus?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      id="method-ai-btn"
                      type="button"
                      onClick={() => setSyllabusMethod("ai")}
                      className={`p-5 rounded-2xl border cursor-pointer text-left transition-all ${
                        syllabusMethod === "ai"
                          ? "bg-indigo-600/10 border-indigo-500 text-white shadow"
                          : "bg-slate-950 border-slate-855 text-slate-400 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2.5">
                        <span className={`p-1.5 rounded-lg border ${syllabusMethod === "ai" ? "bg-indigo-500/15 text-indigo-400" : "bg-slate-900 text-slate-500"}`}>
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                        </span>
                        <span className="text-xs font-black">AI Curriculum Generator</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Let Gemini-3.5 design standard modules, study priorities, and due dates suited for <b>{examName || goalType}</b> automatically.
                      </p>
                    </button>

                    <button
                      id="method-manual-btn"
                      type="button"
                      onClick={() => setSyllabusMethod("manual")}
                      className={`p-5 rounded-2xl border cursor-pointer text-left transition-all ${
                        syllabusMethod === "manual"
                          ? "bg-indigo-600/10 border-indigo-500 text-white shadow"
                          : "bg-slate-950 border-slate-855 text-slate-400 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2.5">
                        <span className={`p-1.5 rounded-lg border ${syllabusMethod === "manual" ? "bg-indigo-500/15 text-indigo-400" : "bg-slate-900 text-slate-505"}`}>
                          <Layers className="w-4 h-4 text-indigo-400" />
                        </span>
                        <span className="text-xs font-black">Manual Custom Entry</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Hand-write your specific subjects, chapters, and sub-topics to organize a custom-fit study timeline yourself.
                      </p>
                    </button>
                  </div>
                </div>

                {syllabusMethod === "manual" ? (
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-850/80 animate-fade-in">
                    <div>
                      <div className="flex justify-between">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Subjects (comma-separated list)
                        </label>
                        <span className="text-[9px] text-slate-500 font-mono">Example: Chemistry, Physics, Quant</span>
                      </div>
                      <textarea
                        id="setup-subjects"
                        rows={2}
                        value={subjects}
                        onChange={(e) => setSubjects(e.target.value)}
                        placeholder={goalPlaceholders[goalType].subjects}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none text-xs font-medium resize-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Chapters (comma-separated list)
                        </label>
                        <span className="text-[9px] text-slate-500 font-mono">Example: Chapter 1, Chapter 2</span>
                      </div>
                      <textarea
                        id="setup-chapters"
                        rows={2}
                        value={chapters}
                        onChange={(e) => setChapters(e.target.value)}
                        placeholder={goalPlaceholders[goalType].chapters}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none text-xs font-medium resize-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Specific Core Topics / Tasks (comma-separated list)
                        </label>
                        <span className="text-[9px] text-slate-500 font-mono">Each topic spawns an active review task</span>
                      </div>
                      <textarea
                        id="setup-topics"
                        rows={3}
                        value={topics}
                        onChange={(e) => setTopics(e.target.value)}
                        placeholder={goalPlaceholders[goalType].topics}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none text-xs font-medium resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/10 text-xs space-y-3 leading-relaxed animate-fade-in relative z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex items-center space-x-2.5 text-indigo-300 font-extrabold uppercase">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Gemini AI Synthesis Engine Summary</span>
                    </div>
                    <div className="text-slate-400 space-y-1.5">
                      <p>We will construct a comprehensive syllabus customized exactly for: <b className="text-slate-205">"{examName}"</b>.</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-405 text-[11px]">
                        <li>Researches major syllabus sub-categories of type <b>{goalType}</b>.</li>
                        <li>Configures a perfect 4-stage active review cycle leading to the target date of <b>{examDate}</b>.</li>
                        <li>Allocates realistic workloads fitted exactly to <b>{dailyHours}h daily budget</b>.</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-800/60 flex justify-between items-center">
                  <button
                    id="setup-btn-back-3"
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold text-sm cursor-pointer flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Go Back</span>
                  </button>

                  <button
                    id="setup-btn-generate-ai"
                    type="button"
                    onClick={handleGeneratePlan}
                    className="px-8 py-4.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-650 to-blue-650 hover:brightness-110 text-white font-bold text-sm cursor-pointer shadow-lg shadow-indigo-600/15 flex items-center space-x-2 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4.5 h-4.5 text-white" />
                    <span>Create My AI Study Plan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
