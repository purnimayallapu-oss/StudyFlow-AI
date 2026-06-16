import React, { useState } from "react";
import { 
  CheckCircle, 
  Flame, 
  Award, 
  TrendingUp, 
  Clock, 
  Search, 
  Filter, 
  BookOpen, 
  ArrowRight, 
  Zap, 
  HelpCircle,
  Play,
  Calendar,
  Layers,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Plus,
  Trash,
  X,
  Edit3,
  Save,
  Brain
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { Exam, StudyTask, Milestone, UserProfile } from "../types";
import CustomStudyTables from "./CustomStudyTables";
import VisualLearningJourney from "./VisualLearningJourney";

interface DashboardProps {
  exam: Exam | null;
  tasks: StudyTask[];
  profile: UserProfile;
  onTaskCompletedToggle: (task: StudyTask) => void;
  onLaunchBreak: (task: StudyTask) => void;
  onLaunchQuiz: (task: StudyTask) => void;
  onLaunchSummary: (task: StudyTask) => void;
  onStartFocus: () => void;
  onRescheduleUnfinished: () => void;
  onAddTask?: (task: StudyTask) => void;
  onUpdateTask?: (task: StudyTask) => void;
  onDeleteTask?: (taskId: string) => void;
  onXpUpdate?: (amount: number) => void;
}

export default function Dashboard({
  exam,
  tasks,
  profile,
  onTaskCompletedToggle,
  onLaunchBreak,
  onLaunchQuiz,
  onLaunchSummary,
  onStartFocus,
  onRescheduleUnfinished,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onXpUpdate
}: DashboardProps) {
  const [viewMode, setViewMode] = useState<"AI_PLAN" | "CUSTOM_TABLES">("AI_PLAN");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [weeklyReviewOpen, setWeeklyReviewOpen] = useState(false);

  // CRUD MODAL STATE ENGINE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);

  // Hardcode representative visual study hours mapping for charts
  const studyData = [
    { name: "Mon", Hours: 3.5, Quizzes: 2 },
    { name: "Tue", Hours: 4.0, Quizzes: 3 },
    { name: "Wed", Hours: 2.5, Quizzes: 1 },
    { name: "Thu", Hours: 5.0, Quizzes: 4 },
    { name: "Fri", Hours: 4.5, Quizzes: 3 },
    { name: "Sat", Hours: 5.5, Quizzes: 5 },
    { name: "Sun", Hours: 3.0, Quizzes: 2 }
  ];

  // Unique subjects list for filters
  const subjectsInTasks = Array.from(new Set(tasks.map((t) => t.subject)));

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "ALL" || t.subject === selectedSubject;
    const matchesPriority = selectedPriority === "ALL" || t.priority === selectedPriority;
    
    let matchesStatus = true;
    if (selectedStatus === "COMPLETED") matchesStatus = t.status === "COMPLETED";
    else if (selectedStatus === "PENDING") matchesStatus = t.status !== "COMPLETED";
    
    return matchesSearch && matchesSubject && matchesPriority && matchesStatus;
  });

  const completedToday = tasks.filter(t => t.status === "COMPLETED").length;
  const revisionsCount = tasks.filter(t => t.revisionCount > 0 || t.confidenceLevel === "NEEDS_REVISION").length;

  const handleCheckboxClick = (task: StudyTask) => {
    onTaskCompletedToggle(task);
  };

  const handleOpenEditModal = (task: StudyTask) => {
    setEditingTask({ ...task });
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    // Defaults with realistic placeholders
    const defaultExamId = exam?.id || "exam_custom";
    const defaultDate = new Date().toISOString().split("T")[0];
    const newTemplate: StudyTask = {
      id: "t_new_" + Date.now(),
      examId: defaultExamId,
      subject: tasks[0]?.subject || "New Subject",
      chapter: "Core Module",
      topic: "Identify Key Theorems",
      priority: "MEDIUM",
      estimatedHours: 2.0,
      dueDate: defaultDate,
      status: "NOT_STARTED",
      revisionCount: 0
    };
    setEditingTask(newTemplate);
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!editingTask) return;
    if (!editingTask.topic.trim()) {
      return;
    }
    if (!editingTask.subject.trim()) {
      return;
    }

    if (isCreateMode) {
      if (onAddTask) {
        onAddTask(editingTask);
      }
    } else {
      if (onUpdateTask) {
        onUpdateTask(editingTask);
      }
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTaskModal = (taskId: string) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleRowClick = (e: React.MouseEvent, t: StudyTask) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("select") ||
      target.classList.contains("no-modal-trigger")
    ) {
      return;
    }
    handleOpenEditModal(t);
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto px-6 py-4">
      
      {/* 1. TOP DOCKS: GENERAL SUMMARY STATISTICS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak element */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between backdrop-blur-sm relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Habit Streak</span>
            <div className="text-2xl font-black text-amber-400 flex items-center gap-1.5 font-mono">
              <Flame className="w-6 h-6 fill-amber-500 stroke-amber-400 animate-bounce" />
              <span>{profile.streak} Days</span>
            </div>
            <p className="text-[9px] text-slate-500 font-medium">Daily commitment multiplier active</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 select-none">STREAK_STABLE</span>
        </div>

        {/* Accumulated XP Levels */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">XP Progression</span>
            <span className="text-xs font-bold text-slate-300 font-mono">Lvl {Math.floor(profile.xp / 100) + 1}</span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-700" 
              style={{ width: `${profile.xp % 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 font-medium mt-2">
            <span>{profile.xp} Total XP</span>
            <span>{(Math.floor(profile.xp / 100) + 1) * 100} XP Next Level</span>
          </div>
        </div>

        {/* Focus Hours timer tracker */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between backdrop-blur-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Focus Hours</span>
            <div className="text-2xl font-black text-white font-mono flex items-center gap-1">
              <Clock className="w-5.5 h-5.5 text-purple-400" />
              <span>{(profile.totalFocusMinutes / 60).toFixed(1)} Hrs</span>
            </div>
            <p className="text-[9px] text-slate-500 font-medium">{profile.totalFocusMinutes} minutes of deep study logged</p>
          </div>

          {/* Elegant Circular Focus Progress Indicator */}
          <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="3.5" fill="transparent" />
              <circle 
                cx="24" 
                cy="24" 
                r="20" 
                stroke="#a855f7" 
                strokeWidth="3.5" 
                fill="transparent" 
                strokeDasharray="126"
                strokeDashoffset={126 - (126 * Math.min(100, Math.round((profile.totalFocusMinutes / ((exam?.dailyHoursGoal || 4) * 60)) * 100))) / 100}
                style={{
                  transition: "stroke-dashoffset 0.5s ease"
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
              {Math.min(100, Math.round((profile.totalFocusMinutes / ((exam?.dailyHoursGoal || 4) * 60)) * 100))}%
            </div>
          </div>

          <button
            id="dash-quick-pomodoro"
            onClick={onStartFocus}
            className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white transition-all cursor-pointer border border-purple-500/15"
            title="Start Pomodoro Timer"
          >
            <Play className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Productivity Rate (Task counts) */}
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between backdrop-blur-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Syllabus Completion</span>
            <div className="text-2xl font-black text-white font-mono">
              {tasks.length > 0 ? Math.round((completedToday / tasks.length) * 100) : 0}%
            </div>
            <p className="text-[9px] text-slate-500 font-medium">{completedToday}/{tasks.length} topics covered</p>
          </div>
          <span className="p-2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/15 uppercase font-mono">
            {revisionsCount} REVISIONS DUE
          </span>
        </div>

      </section>

      {/* RE-ALIGNMENT BANNER FOR MISSED SESSIONS */}
      <section className="bg-gradient-to-r from-indigo-950/40 to-slate-950 border border-indigo-900/30 p-4.5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">Adaptive Rescheduling Engine</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed pr-2">
              Missed yesterday's milestone? Click below to recalculate dates and level out remaining workload. StudyFlow never punishes lapses!
            </p>
          </div>
        </div>
        <button
          id="dash-reschedule-btn"
          onClick={onRescheduleUnfinished}
          className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg active:scale-95 transition-all cursor-pointer shadow whitespace-nowrap shrink-0"
        >
          Optimize Syllabus Schedule
        </button>
      </section>

      {/* VIEW SELECTOR TAB SWITCHER */}
      <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-800 max-w-md">
        <button
          onClick={() => setViewMode("AI_PLAN")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
            viewMode === "AI_PLAN"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/20"
          }`}
        >
          🔮 AI Study Plan View
        </button>
        <button
          onClick={() => setViewMode("CUSTOM_TABLES")}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
            viewMode === "CUSTOM_TABLES"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/20"
          }`}
        >
          📋 Custom Table View
        </button>
      </div>

      {viewMode === "CUSTOM_TABLES" ? (
        <CustomStudyTables />
      ) : (
        <>
          {/* 2. CORE WORKSPACE GRID: STUDY PLAN TABLE (MAIN FEATURE) & GRAPH CONTROLS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TASK MATRIX PLAN TABLE (SPAN 2 COLS) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm shadow-xl space-y-4 overflow-hidden">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <span>Study Calendar Tracker</span>
                </h3>
                <p className="text-xs text-slate-400">Interactive task checklists inspired by Linear & Notion</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-[11px] font-mono font-bold bg-slate-950 border border-slate-850 px-3 py-1.5 rounded text-slate-400 shrink-0">
                  Today's Coverage: {completedToday} / {tasks.length} Elements
                </div>
                <button
                  id="add-new-topic-btn"
                  onClick={handleOpenCreateModal}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-[11px] font-bold text-white cursor-pointer transition-all flex items-center gap-1 shadow whitespace-nowrap active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Topic</span>
                </button>
              </div>
            </div>

            {/* FILTER CONSOLE */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 border-t border-b border-slate-805/60 py-3 text-xs">
              
              {/* Search text query */}
              <div className="relative sm:col-span-1">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  id="dashboard-search-tasks"
                  type="text"
                  placeholder="Query topics/chapters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-300 placeholder-slate-650 pl-8 pr-2.5 py-1.5 rounded-lg outline-none text-[11px] font-medium"
                />
              </div>

              {/* Subject selectors */}
              <select
                id="dash-filter-subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-slate-400 rounded-lg p-1.5 focus:border-indigo-505 outline-none font-semibold cursor-pointer text-[11px]"
              >
                <option value="ALL">All Subjects</option>
                {subjectsInTasks.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>

              {/* Priority levels */}
              <select
                id="dash-filter-priority"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-slate-400 rounded-lg p-1.5 focus:border-indigo-505 outline-none font-semibold cursor-pointer text-[11px]"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>

              {/* Status checkboxes */}
              <select
                id="dash-filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-950 border border-slate-850 text-slate-400 rounded-lg p-1.5 focus:border-indigo-505 outline-none font-semibold cursor-pointer text-[11px]"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Syllabus</option>
                <option value="COMPLETED">Completed syllabus</option>
              </select>

            </div>

            {/* SYLLABUS MATRIX LIST TABLE */}
            <div className="overflow-x-auto rounded-xl border border-slate-850 h-[400px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                
                {/* Sticky Header */}
                <thead className="bg-slate-950 text-slate-400 uppercase text-[9px] tracking-wider font-extrabold sticky top-0 z-10 border-b border-slate-805/60 select-none">
                  <tr>
                    <th className="py-3.5 px-3 w-12 text-center">Done</th>
                    <th className="py-3.5 px-3">Subject / Chapter</th>
                    <th className="py-3.5 px-3 min-w-[160px]">Topic</th>
                    <th className="py-3.5 px-3 w-28 text-center">Priority</th>
                    <th className="py-3.5 px-3 w-20 text-center">Est. Time</th>
                    <th className="py-3.5 px-3 w-32 text-center">Due Date</th>
                    <th className="py-3.5 px-3 w-32 text-center">Status</th>
                    <th className="py-3.5 px-3 text-center min-w-[130px]">Actions / Audit</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-850/60 bg-slate-900/10">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500 font-medium">
                        No study topics found matching filter selection parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((t, idx) => {
                      const completed = t.status === "COMPLETED";
                      return (
                        <tr 
                          key={t.id}
                          id={`dash-task-row-${idx}`}
                          onClick={(e) => handleRowClick(e, t)}
                          className={`hover:bg-slate-850/40 transition-all cursor-pointer ${
                            completed ? "opacity-75 bg-slate-955/20" : ""
                          }`}
                        >
                          {/* Active completion checkbox */}
                          <td className="py-2 px-3 text-center no-modal-trigger">
                            <input
                              id={`dash-chk-complete-${t.id}`}
                              type="checkbox"
                              checked={completed}
                              onChange={() => handleCheckboxClick(t)}
                              className="w-4 h-4 cursor-pointer accent-indigo-600 rounded focus:ring-0 checked:bg-indigo-600 outline-none"
                              title="Toggle completion status"
                            />
                          </td>

                          {/* Subject & Chapter path */}
                          <td className="py-2 px-3 font-medium max-w-[150px] truncate">
                            <span className="block text-slate-100 font-bold tracking-tight">{t.subject}</span>
                            <span className="block text-[10px] text-slate-400 font-mono italic">{t.chapter}</span>
                          </td>

                          {/* Specific topic title - inline editable input element */}
                          <td className="py-2 px-3 no-modal-trigger">
                            <input
                              type="text"
                              value={t.topic}
                              onChange={(e) => {
                                if (onUpdateTask) {
                                  onUpdateTask({ ...t, topic: e.target.value });
                                }
                              }}
                              className="w-full bg-transparent border-none text-slate-200 font-semibold uppercase tracking-tight text-[11px] outline-none focus:ring-1 focus:ring-indigo-500/30 rounded px-1.5 py-1 focus:bg-slate-950/80 transition-all font-sans"
                              title="Double click to type title change"
                              placeholder="Study topic name"
                            />
                          </td>

                          {/* Priority badges - inline dropdown selector */}
                          <td className="py-2 px-3 text-center no-modal-trigger">
                            <select
                              value={t.priority}
                              onChange={(e) => {
                                if (onUpdateTask) {
                                  onUpdateTask({ ...t, priority: e.target.value as any });
                                }
                              }}
                              className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold bg-transparent outline-none cursor-pointer focus:ring-1 focus:ring-indigo-550/30 ${
                                t.priority === "HIGH" ? "text-red-400 border-red-500/20 bg-red-500/10" :
                                t.priority === "MEDIUM" ? "text-amber-400 border-amber-500/20 bg-amber-500/10" :
                                "text-indigo-400 border-indigo-500/20 bg-indigo-500/10"
                              }`}
                            >
                              <option value="HIGH" className="bg-slate-950 text-red-400">High</option>
                              <option value="MEDIUM" className="bg-slate-950 text-amber-400">Medium</option>
                              <option value="LOW" className="bg-slate-950 text-indigo-400">Low</option>
                            </select>
                          </td>

                          {/* Time budget - inline number scroll hours */}
                          <td className="py-2 px-3 text-center no-modal-trigger">
                            <div className="flex items-center justify-center gap-0.5">
                              <input
                                type="number"
                                step="0.5"
                                min="0.5"
                                max="100"
                                value={t.estimatedHours}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val) && onUpdateTask) {
                                    onUpdateTask({ ...t, estimatedHours: val });
                                  }
                                }}
                                className="bg-transparent border-none focus:bg-slate-950/80 focus:ring-1 focus:ring-indigo-500/30 rounded text-center w-11 text-xs text-slate-100 font-mono font-bold"
                                title="Scroll to tweak estimated study hours"
                              />
                              <span className="text-[10px] text-slate-500 font-bold">h</span>
                            </div>
                          </td>

                          {/* Due date - inline calendar selection */}
                          <td className="py-2 px-3 text-center no-modal-trigger">
                            <input
                              type="date"
                              value={t.dueDate}
                              onChange={(e) => {
                                if (onUpdateTask) {
                                  onUpdateTask({ ...t, dueDate: e.target.value });
                                }
                              }}
                              className="bg-transparent border-none focus:bg-slate-950/80 focus:ring-1 focus:ring-indigo-500/30 rounded text-center text-[10px] font-mono text-slate-300 outline-none cursor-pointer w-28 hover:text-white"
                              title="Tweak target deadline calendar"
                            />
                          </td>

                          {/* Status - inline dropdown status changer */}
                          <td className="py-2 px-3 text-center no-modal-trigger">
                            <select
                              value={t.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as any;
                                const updated = { ...t, status: newStatus };
                                if (newStatus === "COMPLETED") {
                                  updated.completedDate = new Date().toISOString().split("T")[0];
                                } else {
                                  updated.completedDate = undefined;
                                }
                                if (onUpdateTask) {
                                  onUpdateTask(updated);
                                }
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] bg-transparent font-black border text-center outline-none cursor-pointer focus:ring-1 focus:ring-indigo-550/30 uppercase tracking-tight ${
                                t.status === "COMPLETED" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" :
                                t.status === "IN_PROGRESS" ? "text-sky-400 border-sky-500/20 bg-sky-500/10" :
                                "text-slate-400 border-slate-500/20 bg-slate-500/10"
                              }`}
                            >
                              <option value="NOT_STARTED" className="bg-slate-950 text-slate-400">Not Started</option>
                              <option value="IN_PROGRESS" className="bg-slate-950 text-sky-400">In Progress</option>
                              <option value="COMPLETED" className="bg-slate-950 text-emerald-400">Completed</option>
                            </select>
                          </td>

                          {/* Action portals and quick interactive toggles */}
                          <td className="py-2 px-3 text-center no-modal-trigger">
                            <div className="flex justify-center items-center gap-1.5">
                              
                              {/* Launch complete details edit modal */}
                              <button
                                onClick={() => handleOpenEditModal(t)}
                                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer transition-all border border-slate-850/50"
                                title="Open full edit topic dialog card"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {completed ? (
                                <div className="flex justify-center items-center gap-1">
                                  <button
                                    onClick={() => onLaunchBreak(t)}
                                    className="px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-505/15 cursor-pointer transition-all shrink-0"
                                    title="Take 60s Game Break"
                                  >
                                    Break
                                  </button>
                                  <button
                                    onClick={() => onLaunchQuiz(t)}
                                    className="px-1.5 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-550/20 text-indigo-400 text-[10px] font-bold border border-indigo-505/15 cursor-pointer transition-all shrink-0"
                                    title="AI Recalls practice test"
                                  >
                                    Quiz
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you absolutely sure you want to delete topic "${t.topic}"?`)) {
                                      if (onDeleteTask) onDeleteTask(t.id);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-red-500/10 rounded text-slate-500 hover:text-red-400 cursor-pointer transition-all border border-slate-850/50"
                                  title="Delete this study topic"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              )}

                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* SIDEBAR BLOCK: COGNITIVE CHARTS & WEEKLY REVIEWS */}
        <div className="lg:col-span-1 space-y-4">
          
          <VisualLearningJourney
            tasks={tasks}
            onTaskCompletedToggle={onTaskCompletedToggle}
            onLaunchBreak={onLaunchBreak}
            onLaunchQuiz={onLaunchQuiz}
            onLaunchSummary={onLaunchSummary}
            onXpUpdate={onXpUpdate || (() => {})}
          />
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5.5 backdrop-blur-sm shadow-xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Cognitive Performance Log
            </h3>
            
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--slate-500)" fontSize={9} fontStyle="bold" tickLine={false} />
                  <YAxis stroke="var(--slate-500)" fontSize={9} fontStyle="bold" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "var(--slate-900)", border: "1px solid var(--slate-800)", borderRadius: "10px" }}
                    labelStyle={{ color: "var(--slate-300)", fontSize: "10px" }}
                    itemStyle={{ color: "var(--slate-100)", fontSize: "11px" }}
                  />
                  <Bar dataKey="Hours" fill="var(--color-indigo-500, #6366f1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-805/40">
              <span>Goal: 4.0h Average daily study</span>
              <span className="text-indigo-400 font-bold">Passed Quizzes: 16</span>
            </div>
          </div>

          {/* GITHUB-STYLE STUDY HEATMAP MOCK */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5.5 backdrop-blur-sm shadow-xl space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Active Syllabus Heatmap
            </h3>
            <div className="grid grid-cols-12 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-850">
              {Array.from({ length: 36 }).map((_, i) => {
                let colClass = "bg-slate-900";
                if (i % 6 === 0) colClass = "bg-indigo-600";
                else if (i % 5 === 0) colClass = "bg-indigo-950";
                else if (i % 3 === 0) colClass = "bg-indigo-400";
                return (
                  <div 
                    key={i} 
                    className={`w-full aspect-square rounded ${colClass} text-[7px] text-transparent hover:text-white font-mono hover:bg-opacity-80 transition-all flex items-center justify-center`}
                    title="Active Study session logged"
                  >
                    •
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-medium font-sans">
              <span>Less effort</span>
              <span>Advanced consistency</span>
            </div>
          </div>

          {/* COGNITIVE REFRESH HUB ANALYTICS & BRAIN BADGES */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5.5 backdrop-blur-sm shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5 font-sans">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Cognitive Focus Analytics</span>
              </h3>
              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">Core Stats</span>
            </div>

            {/* Basic metrics grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                <div className="text-[13px] font-black text-slate-200 font-mono">
                  {typeof window !== "undefined" ? (localStorage.getItem("studyflow_games_played") || "4") : "4"}
                </div>
                <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5 font-sans">Played</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                <div className="text-[13px] font-black text-emerald-400 font-mono">
                  {typeof window !== "undefined" ? (localStorage.getItem("studyflow_completion_rate") || "96") : "96"}%
                </div>
                <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5 font-sans">Comp. Rate</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                <div className="text-[13px] font-black text-amber-500 font-mono">
                  {typeof window !== "undefined" ? (localStorage.getItem("studyflow_best_reaction") || "265") : "265"}ms
                </div>
                <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5 font-sans">Reaction</div>
              </div>
            </div>

            {/* Cognitive Strengths meters */}
            <div className="space-y-2 pt-1 border-t border-slate-850/60 font-sans">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Cognitive Strengths</span>
              
              {(() => {
                const strengths = typeof window !== "undefined" && localStorage.getItem("studyflow_cognitive_strengths")
                  ? JSON.parse(localStorage.getItem("studyflow_cognitive_strengths")!)
                  : { logic: 85, memory: 75, speed: 90, vocab: 80 };

                return (
                  <div className="space-y-1.5">
                    {[
                      { label: "Deduction & Logic", val: strengths.logic, color: "bg-emerald-500" },
                      { label: "Memory Retention", val: strengths.memory, color: "bg-indigo-500" },
                      { label: "Reaction Speed", val: strengths.speed, color: "bg-rose-500" },
                      { label: "Technical Vocab", val: strengths.vocab, color: "bg-amber-500" }
                    ].map((st, i) => (
                      <div key={i} className="text-[10px] space-y-0.5">
                        <div className="flex justify-between font-medium text-slate-400">
                          <span>{st.label}</span>
                          <span className="font-mono text-slate-300 font-bold">{st.val}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                          <div className={`${st.color} h-full rounded-full`} style={{ width: `${st.val}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Brain Trophy Badges Row */}
            <div className="space-y-2 pt-2 border-t border-slate-850/60 font-sans">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono font-sans">Brain Training Badges</span>
              
              {(() => {
                const cogBadgesArr: string[] = typeof window !== "undefined" && localStorage.getItem("studyflow_cognitive_badges")
                  ? JSON.parse(localStorage.getItem("studyflow_cognitive_badges")!)
                  : ["b_puzzle_master", "b_focus_ninja"];

                const badgeTypes = [
                  { id: "b_puzzle_master", icon: "🧩", name: "Puzzle Master", desc: "For Zip Connect" },
                  { id: "b_crossword", icon: "🔠", name: "Word Hero", desc: "For Word Builder" },
                  { id: "b_memory_expert", icon: "🧠", name: "Memory Expert", desc: "For Matching Pairs" },
                  { id: "b_focus_ninja", icon: "⚡", name: "Focus Ninja", desc: "Reaction <350ms" },
                  { id: "b_logic_legend", icon: "⚖️", name: "Logic Legend", desc: "Logic challenges" }
                ];

                return (
                  <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                    {badgeTypes.map((b) => {
                      const isUnlocked = cogBadgesArr.includes(b.id);
                      return (
                        <div 
                          key={b.id}
                          className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all ${
                            isUnlocked 
                              ? "bg-indigo-600/10 border-indigo-500/30 text-slate-200" 
                              : "bg-slate-955 border-slate-850 text-slate-600 opacity-40"
                          }`}
                          title={`${b.name}: ${b.desc} (${isUnlocked ? "Unlocked!" : "Locked"})`}
                        >
                          <span className="text-sm filter saturate-100">{b.icon}</span>
                          <span className="text-[7px] font-bold tracking-tight font-sans truncate w-full mt-0.5 block">{b.name.split(" ")[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* WEEKLY REVIEWS & ANALYTICS DIGEST */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5.5 backdrop-blur-sm shadow-xl space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Sunday Weekly Review</span>
            </h3>
            <p className="text-xs text-slate-400 leading-normal pr-1">
              Every Sunday at midnight, our analytical engine consolidates your tasks to suggest next week's adjustments.
            </p>

            <button
              id="weekly-review-trigger"
              onClick={() => setWeeklyReviewOpen(true)}
              className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 hover:border-slate-700 border border-slate-850 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer shadow"
            >
              Analyze Weekly Progress
            </button>
          </div>

        </div>

      </div>

    </>
  )}

      {/* WEEKLY REVIEW MODAL */}
      {weeklyReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6.5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-805/40 mb-4">
              <span className="text-xs font-bold text-slate-150 uppercase tracking-widest font-mono">Cognitive Audit Digest</span>
              <button 
                id="close-weekly-btn"
                onClick={() => setWeeklyReviewOpen(false)} 
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center font-bold text-[13px] text-slate-100 flex items-center justify-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                <span>AI Syllabus Suggestions for Next Cycles</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Total Covered Tasks:</span>
                  <span className="font-mono text-emerald-400 font-bold">{completedToday}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Weekly Hours Budget Met:</span>
                  <span className="font-mono text-indigo-400 font-bold">18.5 Hrs</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex justify-between">
                  <span className="text-slate-400">Streak Status:</span>
                  <span className="font-mono text-amber-500 font-bold">🟢 Active Streak</span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-850/80 p-4 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2">
                <p className="font-bold text-slate-200">🤖 AI Insight Summary:</p>
                <div className="space-y-1.5 pl-3 border-l border-indigo-500/40 text-[11px] text-slate-400">
                  <p>• Your conceptual retention of **{tasks[0]?.subject || "core topics"}** scored excellent. Keep current pace metrics.</p>
                  <p>• Revision triggers on **spaced repetition intervals** are coming up. Do not postpone OSPF and CPU scheduling sessions.</p>
                  <p>• Warning: Focus sessions indicate high cognitive fatigue towards hour 4. Keep breaks limited to 5 minutes so transition cycles stay clean.</p>
                </div>
              </div>

              <button
                id="weekly-review-close-btn"
                onClick={() => setWeeklyReviewOpen(false)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl active:scale-95 transition-all cursor-pointer shadow"
              >
                Close Analytical Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / CREATE CRITICAL TOPIC MODAL */}
      {isModalOpen && editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-850 rounded-3xl p-6.5 shadow-2xl relative overflow-hidden text-slate-200">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-5 text-slate-100">
              <span className="text-xs font-black uppercase tracking-widest font-mono text-indigo-400">
                {isCreateMode ? "✨ Create Study Topic" : "✏️ Edit Study Topic"}
              </span>
              <button 
                id="close-edit-modal-btn"
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-white text-xs cursor-pointer bg-slate-850 hover:bg-slate-800 p-1 rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4 text-xs">
              
              {/* Topic Title */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topic Title</label>
                <input
                  id="modal-topic-title"
                  type="text"
                  value={editingTask.topic}
                  onChange={(e) => setEditingTask({ ...editingTask, topic: e.target.value })}
                  placeholder="e.g. Traversal algorithms"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-505 font-bold uppercase"
                />
              </div>

              {/* Subject details & chapter info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject Name</label>
                  <input
                    id="modal-subject-name"
                    type="text"
                    value={editingTask.subject}
                    onChange={(e) => setEditingTask({ ...editingTask, subject: e.target.value })}
                    placeholder="e.g. Data Structures"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-505 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chapter / Module</label>
                  <input
                    id="modal-chapter-name"
                    type="text"
                    value={editingTask.chapter}
                    onChange={(e) => setEditingTask({ ...editingTask, chapter: e.target.value })}
                    placeholder="e.g. Arrays & Lists"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-505 font-bold"
                  />
                </div>
              </div>

              {/* Exam & Availability Selection */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Target Plan / Exam ID</label>
                <input
                  id="modal-exam-id"
                  type="text"
                  value={editingTask.examId}
                  onChange={(e) => setEditingTask({ ...editingTask, examId: e.target.value })}
                  placeholder="e.g. exam_gate_2027"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-505 font-mono"
                />
                <p className="text-[9px] text-slate-500 font-medium">Mapped target course: <span className="text-slate-400 font-bold">{exam?.name || profile?.course || "Primary Exam Course"}</span></p>
              </div>

              {/* Priority, Estimated Time, and Due Date row */}
              <div className="grid grid-cols-3 gap-2.5">
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                  <select
                    id="modal-priority-select"
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-505 font-bold cursor-pointer font-sans"
                  >
                    <option value="HIGH">🔥 High</option>
                    <option value="MEDIUM">⚡ Medium</option>
                    <option value="LOW">🔵 Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Budget Hours</label>
                  <input
                    id="modal-budget-hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={editingTask.estimatedHours}
                    onChange={(e) => setEditingTask({ ...editingTask, estimatedHours: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-505 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Syllabus Status</label>
                  <select
                    id="modal-status-select"
                    value={editingTask.status}
                    onChange={(e) => {
                      const st = e.target.value as any;
                      setEditingTask({
                        ...editingTask,
                        status: st,
                        completedDate: st === "COMPLETED" ? new Date().toISOString().split("T")[0] : undefined
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-505 font-bold cursor-pointer font-sans"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

              </div>

              {/* Due Date row */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Target Completion Deadline</label>
                <input
                  id="modal-due-date"
                  type="date"
                  value={editingTask.dueDate}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-505 font-mono"
                />
              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2.5">
              
              {/* Show delete only in Edit mode */}
              {!isCreateMode ? (
                <button
                  id="modal-delete-btn"
                  onClick={() => handleDeleteTaskModal(editingTask.id)}
                  className="px-4 py-2.5 bg-red-650 hover:bg-red-600 border border-red-500/20 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow"
                  title="Remove permanently from data storage"
                >
                  <Trash className="w-3.5 h-3.5 text-white" />
                  <span>Delete Topic</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  id="modal-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  id="modal-save-btn"
                  onClick={handleSaveTask}
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all active:translate-y-[1px] shadow-lg shadow-indigo-600/10"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isCreateMode ? "Add Entry" : "Save Changes"}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
