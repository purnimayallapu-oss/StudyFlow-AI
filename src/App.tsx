import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Layers, 
  Flame, 
  Award, 
  Clock, 
  BookOpen, 
  Bot, 
  FileText, 
  User, 
  CheckCircle,
  Bell, 
  ChevronRight, 
  LogOut, 
  Smile,
  Zap,
  Target,
  Sun,
  Moon
} from "lucide-react";

// Components
import LandingPage from "./components/LandingPage";
import PlanGenerator from "./components/PlanGenerator";
import Dashboard from "./components/Dashboard";
import SyllabusTracker from "./components/SyllabusTracker";
import FocusMode from "./components/FocusMode";
import AICoachChat from "./components/AICoachChat";
import NotesManager from "./components/NotesManager";
import BrainBreakChallenge from "./components/BrainBreakChallenge";
import KnowledgeCheck from "./components/KnowledgeCheck";
import MicroSummary from "./components/MicroSummary";
import AuthArea from "./components/AuthArea";

// Types
import { Exam, StudyTask, Note, UserProfile, NotificationItem, Badge } from "./types";
import { useTheme } from "./ThemeContext";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"LANDING" | "PLAN_SETUP" | "DASHBOARD" | "SYLLABUS" | "FOCUS" | "NOTES" | "COACH" | "PROFILE">("LANDING");
  
  // Local Authentication States
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem("studyflow_authenticated_user");
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return null; }
    }
    return null;
  });

  // App States
  const [exam, setExam] = useState<Exam | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: "Alex Mercer",
    email: "alex@university.edu",
    course: "Computer Science & Engineering",
    academicYear: "3rd Year Undergraduate",
    targetExamName: "UNIVERSITY SEMESTER EXAM",
    xp: 285,
    level: 3,
    streak: 2,
    dailyGoalHours: 4,
    preferredHours: "06:00 PM - 10:00 PM",
    totalFocusMinutes: 0
  });

  // Modal Workflows
  const [completedTopicWorkflowTask, setCompletedTopicWorkflowTask] = useState<StudyTask | null>(null);
  const [activeWorkflowModal, setActiveWorkflowModal] = useState<"BREAK" | "QUIZ" | "SUMMARY" | "RECOMMENDATION" | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [badgeUnlockedMsg, setBadgeUnlockedMsg] = useState<string | null>(null);

  // In-app notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n_1",
      title: "🔥 Streak Multiplier Active!",
      description: "You've studied 6 days in a row. Maintain your streak tomorrow to earn +50 bonus XP!",
      type: "STREAK",
      timestamp: "Today, 09:12 AM",
      read: false
    },
    {
      id: "n_2",
      title: "📚 Revision alert",
      description: "OSPF Routing Tables are due for active spaced repetition review today.",
      type: "REVISION",
      timestamp: "Today, 06:10 AM",
      read: false
    }
  ]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Gamified Badges matrix
  const [badges, setBadges] = useState<Badge[]>([
    { id: "b_1", title: "Syllabus Architect", description: "Set your first exam study planner target", iconName: "Target", xpRequired: 50, unlockedAt: "2026-06-11" },
    { id: "b_2", title: "Focus Champion", description: "Accumulate at least 120 minutes of focus Pomodoro", iconName: "Clock", xpRequired: 150, unlockedAt: "2026-06-14" },
    { id: "b_3", title: "Streak Master", description: "Build a 7-day consecutive study habit streak", iconName: "Flame", xpRequired: 300 },
    { id: "b_4", title: "Recall Scholar", description: "Score a perfect 100% on any AI recall test", iconName: "Award", xpRequired: 500 }
  ]);

  // Load configuration offline-first from localStorage
  useEffect(() => {
    const savedExam = localStorage.getItem("studyflow_exam");
    const savedTasks = localStorage.getItem("studyflow_tasks");
    const savedNotes = localStorage.getItem("studyflow_notes");
    const savedProfile = localStorage.getItem("studyflow_profile");
    const savedBadges = localStorage.getItem("studyflow_badges");

    let loadedExam = null;
    if (savedExam) {
      try {
        loadedExam = JSON.parse(savedExam);
      } catch (e) {}
    }

    if (loadedExam && loadedExam.name === "UNIVERSITY SEMESTER EXAM") {
      setExam(loadedExam);
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      if (savedProfile) setProfile(JSON.parse(savedProfile));
      if (savedBadges) setBadges(JSON.parse(savedBadges));
    } else {
      prepopulateBaselinePlanner();
    }
  }, []);

  const prepopulateBaselinePlanner = () => {
    const defaultExamId = "exam_university_semester_exam";
    const defaultExam: Exam = {
      id: defaultExamId,
      name: "UNIVERSITY SEMESTER EXAM",
      goalType: "Academic",
      targetDate: "2026-12-15",
      dailyHoursGoal: 4,
      currentSkillLevel: "Intermediate",
      weeklyAvailability: ["Monday", "Wednesday", "Thursday", "Friday", "Saturday"],
      estimatedCompletionDate: "2026-11-30",
      totalExpectedHours: 52,
      milestones: [
        { id: "m_1", title: "Mid-Term Review Prep", targetDate: "2026-10-10", description: "Complete all primary lecture summaries and problem-set guides.", completed: true },
        { id: "m_2", title: "Lab Project & Viva Submission", targetDate: "2026-11-05", description: "Finish structural testing suites and presentation notes.", completed: false },
        { id: "m_3", title: "Semester Pre-Boards Finals", targetDate: "2026-12-01", description: "Complete past year exams and active spacing recall cards.", completed: false }
      ]
    };

    const defaultTasks: StudyTask[] = [
      { id: "t_1", examId: defaultExamId, subject: "Data Structures", chapter: "Asymptotic Analysis", topic: "Big-O Time Complexity", priority: "HIGH", estimatedHours: 2.0, dueDate: "2026-06-20", status: "COMPLETED", revisionCount: 1, confidenceLevel: "STRONG" },
      { id: "t_2", examId: defaultExamId, subject: "Data Structures", chapter: "Linked Lists", topic: "Singly & Doubly Deletions", priority: "HIGH", estimatedHours: 3.5, dueDate: "2026-06-22", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_3", examId: defaultExamId, subject: "Data Structures", chapter: "Binary Search Trees", topic: "In-order Successor Tracing", priority: "MEDIUM", estimatedHours: 3.0, dueDate: "2026-06-25", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_4", examId: defaultExamId, subject: "Operating Systems", chapter: "CPU Scheduling", topic: "Preemptive SJF Scheduling", priority: "HIGH", estimatedHours: 4.0, dueDate: "2026-06-28", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_5", examId: defaultExamId, subject: "Operating Systems", chapter: "Memory Management", topic: "Page Replacement LRU", priority: "MEDIUM", estimatedHours: 3.5, dueDate: "2026-07-02", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_6", examId: defaultExamId, subject: "Operating Systems", chapter: "Deadlocks", topic: "Banker's Safety Algorithm", priority: "MEDIUM", estimatedHours: 2.5, dueDate: "2026-07-05", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_7", examId: defaultExamId, subject: "Computer Networks", chapter: "IP Routing", topic: "Subnet Masking Calculations", priority: "HIGH", estimatedHours: 3.5, dueDate: "2026-07-09", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_8", examId: defaultExamId, subject: "Computer Networks", chapter: "Transport Layer", topic: "TCP Three-Way Handshake", priority: "MEDIUM", estimatedHours: 3.0, dueDate: "2026-07-12", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_9", examId: defaultExamId, subject: "Database Systems", chapter: "Normalization", topic: "Boyce-Codd Normal Form (BCNF)", priority: "HIGH", estimatedHours: 3.0, dueDate: "2026-07-16", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_10", examId: defaultExamId, subject: "Database Systems", chapter: "Transaction Control", topic: "Strict 2-Phase Locking", priority: "LOW", estimatedHours: 2.5, dueDate: "2026-07-20", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_11", examId: defaultExamId, subject: "Automata Theory", chapter: "Regular Languages", topic: "DFA Minimization Equivalence", priority: "HIGH", estimatedHours: 4.0, dueDate: "2026-07-25", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_12", examId: defaultExamId, subject: "Compiler Design", chapter: "Syntax Analysis", topic: "LL(1) Parse Table Build", priority: "MEDIUM", estimatedHours: 3.5, dueDate: "2026-07-30", status: "NOT_STARTED", revisionCount: 0 },
      { id: "t_13", examId: defaultExamId, subject: "Software Engineering", chapter: "Agile Methodologies", topic: "Scrum Sprints Velocity", priority: "LOW", estimatedHours: 2.0, dueDate: "2026-08-04", status: "NOT_STARTED", revisionCount: 0 }
    ];

    const defaultNotes: Note[] = [
      {
        id: "note_1",
        title: "Dijkstra's Algorithm Cheatsheet",
        subject: "Data Structures",
        content: `• Shortest path finder for a graph with non-negative edge weights.
• Time Complexity: O((V + E) log V) using a binary heap priority queue.
• Fail-case: Cannot handle negative cycles. For negative weights, use Bellman-Ford (O(VE)).`,
        pinned: true,
        createdAt: "2026-06-14T10:11:00Z"
      }
    ];

    const defaultProfile: UserProfile = {
      name: "Alex Mercer",
      email: "alex@university.edu",
      course: "Computer Science & Engineering",
      academicYear: "3rd Year Undergraduate",
      targetExamName: "UNIVERSITY SEMESTER EXAM",
      xp: 285,
      level: 3,
      streak: 2,
      dailyGoalHours: 4,
      preferredHours: "06:00 PM - 10:00 PM",
      totalFocusMinutes: 0
    };

    setExam(defaultExam);
    setTasks(defaultTasks);
    setNotes(defaultNotes);
    setProfile(defaultProfile);

    localStorage.setItem("studyflow_exam", JSON.stringify(defaultExam));
    localStorage.setItem("studyflow_tasks", JSON.stringify(defaultTasks));
    localStorage.setItem("studyflow_notes", JSON.stringify(defaultNotes));
    localStorage.setItem("studyflow_profile", JSON.stringify(defaultProfile));
  };

  const handleStartPlanningWizard = () => {
    setActiveTab("PLAN_SETUP");
  };

  const handlePlanGenerated = (newExam: Exam, newTasks: StudyTask[]) => {
    setExam(newExam);
    setTasks(newTasks);
    
    // Clear old data is appropriate on re-generation
    localStorage.setItem("studyflow_exam", JSON.stringify(newExam));
    localStorage.setItem("studyflow_tasks", JSON.stringify(newTasks));

    // Grant Architect Badge
    setProfile(prev => {
      const nextXp = prev.xp + 50;
      const updated = {
        ...prev,
        xp: nextXp,
        targetExamName: newExam.name
      };
      localStorage.setItem("studyflow_profile", JSON.stringify(updated));
      return updated;
    });

    // Alert User
    const systemAlert: NotificationItem = {
      id: "n_setup_" + Date.now(),
      title: "🚀 Syallbus Planner Generated!",
      description: `Intelligent timelines calculated for ${newTasks.length} study topics successfully.`,
      type: "SYSTEM",
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [systemAlert, ...prev]);

    setActiveTab("DASHBOARD");
  };

  // MULTI-STEP TOPIC COMPLETION WORKFLOW
  const handleTaskCompletedToggle = (task: StudyTask) => {
    const isNowComplete = task.status !== "COMPLETED";
    
    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          status: isNowComplete ? "COMPLETED" : "NOT_STARTED",
          completedDate: isNowComplete ? new Date().toISOString().split("T")[0] : undefined
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    localStorage.setItem("studyflow_tasks", JSON.stringify(updatedTasks));

    if (isNowComplete) {
      // Award XP
      setProfile((prev) => {
        const nextXp = prev.xp + 50;
        let nextStreak = prev.streak;
        
        // Extend streak simply on complete
        const lastActive = prev.lastActiveDate;
        const todayStr = new Date().toISOString().split("T")[0];
        if (lastActive !== todayStr) {
          nextStreak += 1;
        }

        const updatedProfile = {
          ...prev,
          xp: nextXp,
          streak: nextStreak,
          lastActiveDate: todayStr
        };
        localStorage.setItem("studyflow_profile", JSON.stringify(updatedProfile));
        return updatedProfile;
      });

      // Celebration Trigger
      setShowCelebration(true);
      setCompletedTopicWorkflowTask(task);
      setActiveWorkflowModal("BREAK"); // Default stage: launch Mini Game Break

      // Trigger Badge Unlock Check
      checkBadgeUnlocks();
    }
  };

  const handleAddTask = (newTask: StudyTask) => {
    const updated = [...tasks, newTask];
    setTasks(updated);
    localStorage.setItem("studyflow_tasks", JSON.stringify(updated));

    // Refreshes statistics and triggers achievement checking simply
    const addAlert: NotificationItem = {
      id: "n_add_" + Date.now(),
      title: "📋 Topic Addition Registered",
      description: `Added "${newTask.topic}" - ${newTask.estimatedHours}h estimated.`,
      type: "SYSTEM",
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [addAlert, ...prev]);
  };

  const handleUpdateTask = (updatedTask: StudyTask) => {
    const updated = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updated);
    localStorage.setItem("studyflow_tasks", JSON.stringify(updated));
  };

  const handleDeleteTask = (deletedTaskId: string) => {
    const deletedTask = tasks.find(t => t.id === deletedTaskId);
    const updated = tasks.filter(t => t.id !== deletedTaskId);
    setTasks(updated);
    localStorage.setItem("studyflow_tasks", JSON.stringify(updated));

    if (deletedTask) {
      const delAlert: NotificationItem = {
        id: "n_del_" + Date.now(),
        title: "🗑️ Topic Excised",
        description: `Successfully removed "${deletedTask.topic}" from curriculum.`,
        type: "SYSTEM",
        timestamp: "Just now",
        read: false
      };
      setNotifications(prev => [delAlert, ...prev]);
    }
  };

  const checkBadgeUnlocks = () => {
    const updatedBadges = badges.map(b => {
      const satisfiesXp = profile.xp + 50 >= b.xpRequired;
      if (satisfiesXp && !b.unlockedAt) {
        const todayStr = new Date().toISOString().split("T")[0];
        setBadgeUnlockedMsg(`Achievements Unlocked: "${b.title}"! +${b.xpRequired} level multipliers active!`);
        return { ...b, unlockedAt: todayStr };
      }
      return b;
    });
    setBadges(updatedBadges);
    localStorage.setItem("studyflow_badges", JSON.stringify(updatedBadges));
  };

  // POMODORO FOCUS LOGGING
  const handleFocusMinutesLogged = (minutes: number, xpAwarded: number) => {
    setProfile(prev => {
      const nextMins = prev.totalFocusMinutes + minutes;
      const nextXp = prev.xp + xpAwarded;
      const updated = {
        ...prev,
        totalFocusMinutes: nextMins,
        xp: nextXp
      };
      localStorage.setItem("studyflow_profile", JSON.stringify(updated));
      return updated;
    });

    // Alert Notification
    const alert: NotificationItem = {
      id: "n_focus_" + Date.now(),
      title: "⏱️ Deep Work Session Locked!",
      description: `Completed 25 minutes pomodoro interval successfully. Earned +${xpAwarded} XP.`,
      type: "FOCUS",
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [alert, ...prev]);
  };

  // MANUAL MODAL TRIGGER WORKFLOWS
  const handleLaunchBreak = (task: StudyTask) => {
    setCompletedTopicWorkflowTask(task);
    setActiveWorkflowModal("BREAK");
  };

  const handleLaunchQuiz = (task: StudyTask) => {
    setCompletedTopicWorkflowTask(task);
    setActiveWorkflowModal("QUIZ");
  };

  const handleLaunchSummary = (task: StudyTask) => {
    setCompletedTopicWorkflowTask(task);
    setActiveWorkflowModal("SUMMARY");
  };

  // WORKFLOW: Brain Break completed
  const handleBreakChallengeCompleted = (bonusXp: number) => {
    setProfile((prev) => {
      const updated = { ...prev, xp: prev.xp + bonusXp };
      localStorage.setItem("studyflow_profile", JSON.stringify(updated));
      return updated;
    });

    // Advance modal workflow sequentially: Break -> Quiz
    setActiveWorkflowModal("QUIZ");
  };

  // WORKFLOW: Knowledge quiz check completed
  const handleQuizCompleted = (scorePercent: number, confidenceLevel: "STRONG" | "NEEDS_REVISION" | "REVISIT") => {
    // Log confidence outputs
    if (completedTopicWorkflowTask) {
      const updated = tasks.map(t => {
        if (t.id === completedTopicWorkflowTask.id) {
          return {
            ...t,
            confidenceScore: scorePercent,
            confidenceLevel: confidenceLevel,
            revisionCount: t.revisionCount + 1,
            revisionScheduledDate: getNextRevisionDate(confidenceLevel)
          };
        }
        return t;
      });
      setTasks(updated);
      localStorage.setItem("studyflow_tasks", JSON.stringify(updated));
    }

    // Award bonus test XP
    const testBonus = scorePercent >= 80 ? 40 : scorePercent >= 40 ? 20 : 10;
    setProfile((prev) => {
      const updated = { ...prev, xp: prev.xp + testBonus };
      localStorage.setItem("studyflow_profile", JSON.stringify(updated));
      return updated;
    });

    // Advance modal workflow sequentially: Quiz -> Summary
    setActiveWorkflowModal("SUMMARY");
  };

  const getNextRevisionDate = (confidence: "STRONG" | "NEEDS_REVISION" | "REVISIT") => {
    const today = new Date();
    let daysToAdd = 7;
    if (confidence === "STRONG") daysToAdd = 15;
    else if (confidence === "REVISIT") daysToAdd = 1;

    const reviewDate = new Date(today.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return reviewDate.toISOString().split("T")[0];
  };

  // WORKFLOW: Recap summary closed
  const handleSummaryCompleted = () => {
    // Final step: display smart next topic recommendations
    setActiveWorkflowModal("RECOMMENDATION");
  };

  const handleRecommendationAction = (topicTask: StudyTask | null) => {
    setActiveWorkflowModal(null);
    setCompletedTopicWorkflowTask(null);
    setShowCelebration(false);

    if (topicTask) {
      // Direct student to Pomodoro mode immediately for next topic
      setActiveTab("FOCUS");
    }
  };

  // NOTES UTILITIES
  const handleAddNote = (noteObj: Omit<Note, "id" | "createdAt">) => {
    const newNote: Note = {
      ...noteObj,
      id: "note_" + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem("studyflow_notes", JSON.stringify(updated));
  };

  const handleUpdateNote = (noteObj: Note) => {
    const updated = notes.map((n) => n.id === noteObj.id ? noteObj : n);
    setNotes(updated);
    localStorage.setItem("studyflow_notes", JSON.stringify(updated));
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem("studyflow_notes", JSON.stringify(updated));
  };

  // INTELLECTUAL MULTI-STEP SYLLABUS SCHEDULER ALGO
  const handleRescheduleUnfinished = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    const updated = tasks.map(t => {
      if (t.status !== "COMPLETED" && new Date(t.dueDate) < new Date(todayStr)) {
        // Shift missed tasks forward by 3 days in schedule space
        const adjustedDate = new Date(new Date().getTime() + 3 * 24 * 60 * 65 * 1000);
        return {
          ...t,
          dueDate: adjustedDate.toISOString().split("T")[0]
        };
      }
      return t;
    });

    setTasks(updated);
    localStorage.setItem("studyflow_tasks", JSON.stringify(updated));

    // Trigger notification
    const rescheduleNotification: NotificationItem = {
      id: "n_engine_" + Date.now(),
      title: "⚙️ Syllabus Schedule Optimized!",
      description: "Missed deadlines automatically adjusted forward by 3 days. Exam completion pathways intact.",
      type: "SYSTEM",
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [rescheduleNotification, ...prev]);
  };

  const handleLoginSuccess = (userProfile: UserProfile) => {
    setAuthenticatedUser(userProfile);
    setProfile(userProfile);
    localStorage.setItem("studyflow_authenticated_user", JSON.stringify(userProfile));
    localStorage.setItem("studyflow_profile", JSON.stringify(userProfile));
    
    // Trigger successful notification alert
    const welcomeNotif: NotificationItem = {
      id: "n_welcome_" + Date.now(),
      title: `⚡ Authenticated successfully`,
      description: `Welcome back to your personalized study deck, ${userProfile.name}!`,
      type: "SYSTEM",
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [welcomeNotif, ...prev]);
    setActiveTab("DASHBOARD");
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    localStorage.removeItem("studyflow_authenticated_user");
    
    // Clear state or retain cached values for general preview
    setActiveTab("LANDING");
  };

  const handleToggleMilestone = (id: string) => {
    if (!exam) return;
    const updatedMilestones = exam.milestones.map(m => {
      if (m.id === id) {
        return { ...m, completed: !m.completed };
      }
      return m;
    });
    const updatedExam = { ...exam, milestones: updatedMilestones };
    setExam(updatedExam);
    localStorage.setItem("studyflow_exam", JSON.stringify(updatedExam));
  };

  const toggleNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // SMART RECOMMENDER LOGIC
  const getNextRecommendedTopic = (): StudyTask | null => {
    const pending = tasks.filter(t => t.status !== "COMPLETED");
    if (pending.length === 0) return null;

    // Prioritize HIGH priority tasks first
    const highs = pending.filter(t => t.priority === "HIGH");
    if (highs.length > 0) return highs[0];

    return pending[0];
  };

  const recommendationTopic = getNextRecommendedTopic();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* SIDEBAR NAVIGATION CONTROLLER */}
      {activeTab !== "LANDING" && (
        <aside className="w-full md:w-64 bg-slate-910/60 border-r border-slate-900/80 p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-7">
            
            {/* Branding launcher */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center shadow">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-md font-extrabold tracking-tight text-white block">StudyFlow AI</span>
                <span className="text-[9px] font-bold text-slate-400 capitalize">Elite Study Coach</span>
              </div>
            </div>

            {/* Quick stats on vertical layout */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Student Level</span>
                <span className="font-bold text-indigo-400">Idx {Math.floor(profile.xp / 100) + 1}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{profile.streak} Study Streak</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-405">{profile.xp} XP</span>
              </div>
            </div>

            {/* Tab Menu Options */}
            <nav className="space-y-1.5 text-xs font-semibold">
              <button 
                id="tab-dashboard"
                onClick={() => { setActiveTab("DASHBOARD"); setShowCelebration(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2.5 ${
                  activeTab === "DASHBOARD" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Study Planner Table</span>
              </button>

              <button 
                id="tab-syllabus"
                onClick={() => { setActiveTab("SYLLABUS"); setShowCelebration(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2.5 ${
                  activeTab === "SYLLABUS" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Syllabus Directory</span>
              </button>

              <button 
                id="tab-focus"
                onClick={() => { setActiveTab("FOCUS"); setShowCelebration(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2.5 ${
                  activeTab === "FOCUS" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pomodoro Focus Room</span>
              </button>

              <button 
                id="tab-notes"
                onClick={() => { setActiveTab("NOTES"); setShowCelebration(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2.5 ${
                  activeTab === "NOTES" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Study Notes Deck</span>
              </button>

              <button 
                id="tab-coach"
                onClick={() => { setActiveTab("COACH"); setShowCelebration(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2.5 ${
                  activeTab === "COACH" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>Coach Chat AI</span>
              </button>

              <button 
                id="tab-profile"
                onClick={() => { setActiveTab("PROFILE"); setShowCelebration(false); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2.5 ${
                  activeTab === "PROFILE" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-950"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile & Badges</span>
              </button>
            </nav>

          </div>

          {/* Sidebar Footer Option */}
          <div className="pt-6 border-t border-slate-905 space-y-2">
            {authenticatedUser ? (
              <button
                id="sidebar-sign-out"
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-550/10 flex items-center space-x-2 cursor-pointer transition-all"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Secure Sign Out</span>
              </button>
            ) : (
              <button
                id="sidebar-sign-out"
                onClick={() => setActiveTab("LANDING")}
                className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-550 hover:text-white hover:bg-slate-950 flex items-center space-x-2 cursor-pointer transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Back to Public View</span>
              </button>
            )}
          </div>
        </aside>
      )}

      {/* PRIMARY WORK AREA COMPONENT CONTAINER */}
      <main className="flex-1 min-h-screen overflow-y-auto flex flex-col justify-between">
        
        {/* TOP DOCK BAR CONTROLS (ONLY GUEST VIEWS EXCLUDED) */}
        {activeTab !== "LANDING" && (
          <header className="border-b border-slate-900/60 backdrop-blur-md sticky top-0 z-30 bg-slate-950/80 px-6 py-4.5 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Exam target:</span>
              <span className="text-xs font-bold text-white uppercase tracking-tight">{profile.targetExamName}</span>
            </div>

            <div className="flex items-center space-x-4">
              
              {/* Theme Toggle Button */}
              <button
                id="header-theme-toggle"
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-850 text-slate-400 hover:text-amber-400 transition-all cursor-pointer flex items-center justify-center"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-550" />}
              </button>

              {/* Notification Center */}
              <div className="relative">
                <button
                  id="header-notification-bell"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 hover:text-indigo-400 border border-slate-850 text-slate-400 transition-all cursor-pointer relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                  )}
                </button>

                {/* Notifications Panel overlay */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-805/40 mb-3">
                      <span className="font-bold text-slate-200">Alert Center</span>
                      <button 
                        id="panel-notif-clear"
                        onClick={() => setNotificationsOpen(false)} 
                        className="text-[10px] text-slate-500 hover:text-slate-350"
                      >
                        Close
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-0.5">
                      {notifications.map(n => (
                        <div 
                          key={n.id}
                          className={`p-3 rounded-lg border flex flex-col justify-between gap-1 transition-all ${
                            n.read ? "bg-slate-950/40 border-slate-900" : "bg-indigo-600/10 border-indigo-500/20"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-slate-105">{n.title}</span>
                            {!n.read && (
                              <button 
                                id={`notif-read-btn-${n.id}`}
                                onClick={() => toggleNotificationRead(n.id)}
                                className="text-[9px] hover:underline text-indigo-400 font-bold"
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal font-light">{n.description}</p>
                          <span className="text-[9px] text-slate-500 font-mono text-right font-medium">{n.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Course indicators */}
              <div className="p-1 px-3 text-xs font-semibold rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-300">
                {profile.course || "Study Plan Course"}
              </div>

            </div>
          </header>
        )}

        {/* COMPONENT OUTLET SWITCH */}
        <div className="flex-1 pb-12">
          
          {/* Landing Tour view */}
          {activeTab === "LANDING" && (
            <LandingPage 
              onStartPlanning={handleStartPlanningWizard} 
              onSeeDemo={() => { setActiveTab("DASHBOARD"); }} 
              isLoggedIn={!!authenticatedUser}
            />
          )}

          {/* Secure Intercept check: if unauthenticated, mount the AuthArea for private tabs */}
          {activeTab !== "LANDING" && !authenticatedUser && (
            <div className="flex items-center justify-center min-h-[70vh] py-12">
              <AuthArea onLoginSuccess={handleLoginSuccess} />
            </div>
          )}

          {/* New Syllabus schedule wizard builder */}
          {activeTab === "PLAN_SETUP" && authenticatedUser && (
            <PlanGenerator onPlanGenerated={handlePlanGenerated} />
          )}

          {/* Dashboard console */}
          {activeTab === "DASHBOARD" && authenticatedUser && (
            <Dashboard 
              exam={exam}
              tasks={tasks}
              profile={profile}
              onTaskCompletedToggle={handleTaskCompletedToggle}
              onLaunchBreak={handleLaunchBreak}
              onLaunchQuiz={handleLaunchQuiz}
              onLaunchSummary={handleLaunchSummary}
              onStartFocus={() => { setActiveTab("FOCUS"); }}
              onRescheduleUnfinished={handleRescheduleUnfinished}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onXpUpdate={(amount) => {
                setProfile(prev => {
                  const updated = { ...prev, xp: prev.xp + amount };
                  localStorage.setItem("studyflow_profile", JSON.stringify(updated));
                  return updated;
                });
              }}
            />
          )}

          {/* Syllabus view nested tree coverage */}
          {activeTab === "SYLLABUS" && authenticatedUser && (
            <SyllabusTracker 
              exam={exam} 
              tasks={tasks} 
              onToggleMilestone={handleToggleMilestone} 
            />
          )}

          {/* Immersive Focus Mode workspace */}
          {activeTab === "FOCUS" && authenticatedUser && (
            <FocusMode onFocusSessionLogged={handleFocusMinutesLogged} />
          )}

          {/* Syllabus revision notes block */}
          {activeTab === "NOTES" && authenticatedUser && (
            <NotesManager 
              notes={notes} 
              onAddNote={handleAddNote} 
              onUpdateNote={handleUpdateNote} 
              onDeleteNote={handleDeleteNote}
              subjects={Array.from(new Set(tasks.map((t) => t.subject)))}
            />
          )}

          {/* Dedicated chat panel portal with coach */}
          {activeTab === "COACH" && authenticatedUser && (
            <AICoachChat 
              currentXP={profile.xp}
              streakDays={profile.streak}
              completedTasksCount={tasks.filter(t => t.status === "COMPLETED").length}
              totalTasksCount={tasks.length}
              examName={exam?.name || "Target Exams"}
            />
          )}

          {/* User profile achievements badges matrices */}
          {activeTab === "PROFILE" && authenticatedUser && (
            <div className="max-w-3xl mx-auto px-6 py-6 font-sans space-y-6">
              
              {/* Profile details */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6.5 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-blue-500 text-white font-black text-xl flex items-center justify-center shadow-lg uppercase leading-none">
                    AM
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-white">{profile.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">{profile.course} | {profile.academicYear}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Authorized login account: {profile.email}</p>
                  </div>
                </div>

                <div className="space-y-1.5 shrink-0 w-full md:w-auto bg-slate-950 p-4 rounded-2xl border border-slate-850 text-xs">
                  <div className="flex justify-between md:gap-8">
                    <span className="text-slate-400 font-semibold">Study Intervals Preference:</span>
                    <span className="font-bold text-slate-200">{profile.preferredHours}</span>
                  </div>
                  <div className="flex justify-between md:gap-8">
                    <span className="text-slate-400 font-semibold">Scheduled Hours Daily Goal:</span>
                    <span className="font-bold text-indigo-400">{profile.dailyGoalHours} Hrs</span>
                  </div>
                </div>
              </div>

              {/* Achievements matrix panels */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6.5 backdrop-blur-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-indigo-405 fill-indigo-505/10" />
                  <span>Student Honors & Unlocked Badges</span>
                </h3>
                <p className="text-xs text-slate-405 leading-relaxed">
                  Earn bonus XP multipliers by checking syllabus parameters, logging focus sessions, and resolving perfect daily quizzes.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {badges.map((b) => {
                    const unlocked = !!b.unlockedAt;
                    return (
                      <div 
                        key={b.id}
                        className={`p-4 rounded-2xl border flex items-center space-x-3.5 transition-all ${
                          unlocked 
                            ? "bg-slate-900 border-indigo-500/25 shadow-sm shadow-indigo-500/5 text-slate-100" 
                            : "bg-slate-950/60 border-slate-900 text-slate-500 opacity-60"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          unlocked 
                            ? "bg-indigo-500/10 border-indigo-500/25 text-indigo-400" 
                            : "bg-slate-900 border-slate-805 text-slate-600"
                        }`}>
                          {b.iconName === "Target" && <Target className="w-5 h-5" />}
                          {b.iconName === "Clock" && <Clock className="w-5 h-5" />}
                          {b.iconName === "Flame" && <Flame className="w-5 h-5" />}
                          {b.iconName === "Award" && <Award className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold flex items-center gap-1.5">
                            <span>{b.title}</span>
                            {unlocked && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300">UNLOCKED</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 pr-2 leading-relaxed font-light">{b.description}</p>
                          {unlocked && (
                            <span className="block text-[9px] text-slate-500 font-mono mt-1 font-semibold">Unlocked on {b.unlockedAt}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* FLOATING SUCCESS BADGE NOTIFICATIONS */}
      {badgeUnlockedMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4.5 rounded-2xl bg-slate-900 border border-indigo-500 shadow-2xl flex items-start gap-3.5 max-w-sm animate-bounce">
          <div className="w-9 h-9 rounded-xl bg-indigo-505/15 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">Honors Earned!</h4>
            <p className="text-[11px] text-slate-300 leading-normal pr-1">{badgeUnlockedMsg}</p>
            <button
              id="notif-close-msg"
              onClick={() => setBadgeUnlockedMsg(null)}
              className="text-[10px] text-indigo-400 font-bold hover:underline"
            >
              Keep learning
            </button>
          </div>
        </div>
      )}

      {/* MULTI-STAGE SEQUENTIAL COMPLETE FLOW MODALS */}
      {showCelebration && completedTopicWorkflowTask && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-[80px]" />
            
            {/* Step navigation wizard header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-805/40 text-xs font-semibold text-slate-400">
              <span className="text-[10px] tracking-widest text-indigo-400 uppercase font-bold">Chronological Learning Workflow</span>
              <button 
                id="close-celebrate-btn"
                onClick={() => { setShowCelebration(false); setCompletedTopicWorkflowTask(null); }} 
                className="text-slate-500 hover:text-white"
              >
                Skip Walkthrough
              </button>
            </div>

            {/* CELEBRATORY MULTIPLIER POPUP */}
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 animate-pulse">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-md font-bold text-white">✓ Topic Marked Covered!</h4>
                <p className="text-xs text-indigo-300 font-semibold mt-0.5">Syllabus progression nodes updated.</p>
              </div>
              <div className="flex justify-center items-center gap-1.5 text-xs text-amber-500 font-mono font-bold py-1 bg-slate-955 p-3 rounded-xl border border-slate-850 w-fit mx-auto shadow-sm">
                <Flame className="w-4 h-4 fill-amber-550 shrink-0" />
                <span>+50 Base XP Extended • Multiplier Multiplied</span>
              </div>
            </div>

            {/* Sequential Options layout */}
            <div className="space-y-2 text-xs">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Recommended Sequence:</div>
              
              <button
                id="seq-btn-game"
                onClick={() => handleLaunchBreak(completedTopicWorkflowTask)}
                className="w-full text-left p-3 rounded-xl border border-amber-505/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400 font-semibold transition-all flex items-center justify-between"
              >
                <span>Step 1: AI Brain Game (30s mini logic refresh)</span>
                <span className="text-[10px] font-mono">+15 Bonus XP</span>
              </button>

              <button
                id="seq-btn-quiz"
                onClick={() => handleLaunchQuiz(completedTopicWorkflowTask)}
                className="w-full text-left p-3 rounded-xl border border-indigo-505/25 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 font-semibold transition-all flex items-center justify-between"
              >
                <span>Step 2: Check Active Recall (5 conceptual MCQs)</span>
                <span className="text-[10px] font-mono">+30 Bonus XP</span>
              </button>

              <button
                id="seq-btn-sum"
                onClick={() => handleLaunchSummary(completedTopicWorkflowTask)}
                className="w-full text-left p-3 rounded-xl border border-slate-805 bg-slate-950 hover:bg-slate-850 text-slate-300 font-semibold transition-all flex items-center justify-between"
              >
                <span>Step 3: Read AI Bullet Summary Card</span>
                <span className="text-[10px] font-mono">Exam Focus insights</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONDITIONAL SUBMODAL RENDER CHANNELS */}
      {activeWorkflowModal === "BREAK" && completedTopicWorkflowTask && (
        <BrainBreakChallenge 
          topicName={completedTopicWorkflowTask.topic} 
          onChallengeCompleted={handleBreakChallengeCompleted} 
        />
      )}

      {activeWorkflowModal === "QUIZ" && completedTopicWorkflowTask && (
        <KnowledgeCheck 
          task={completedTopicWorkflowTask} 
          skillLevel={exam?.currentSkillLevel || "Medium"} 
          onCheckCompleted={handleQuizCompleted} 
          onClose={() => { setActiveWorkflowModal(null); setShowCelebration(false); }}
        />
      )}

      {activeWorkflowModal === "SUMMARY" && completedTopicWorkflowTask && (
        <MicroSummary 
          task={completedTopicWorkflowTask} 
          onFinished={handleSummaryCompleted} 
        />
      )}

      {/* CHRONOLOGICAL NEXT SYLLABUS STEP RECOMMENDATION */}
      {activeWorkflowModal === "RECOMMENDATION" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md px-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6.5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px]" />
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-805/40 mb-4">
              <span className="text-xs font-bold text-slate-350 tracking-widest font-mono uppercase">Timeline Continuity Optimization</span>
              <button 
                id="close-recommend-btn"
                onClick={() => handleRecommendationAction(null)} 
                className="text-slate-550 hover:text-white text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>

            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-540/15 text-indigo-400 flex items-center justify-center border border-indigo-500/25 mx-auto">
                <Target className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-md font-bold text-white">Recommended Next Syllabus Step</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-normal">
                  Our scheduler advises keeping consistent pace metrics. Let's tackle the next syllabus module chronologically to optimize time availability.
                </p>
              </div>

              {recommendationTopic ? (
                <div className="bg-slate-950 p-4.5 rounded-2xl text-left border border-slate-850/80 space-y-2.5 max-w-sm mx-auto shadow-sm">
                  <div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono font-bold border border-indigo-500/20 uppercase">
                      {recommendationTopic.subject}
                    </span>
                    <h5 className="font-bold text-slate-205 text-sm uppercase mt-1.5">{recommendationTopic.topic}</h5>
                  </div>
                  <p className="text-[10px] text-slate-500">Estimated duration: **{recommendationTopic.estimatedHours} Hours** • Deadline: **{recommendationTopic.dueDate}**</p>
                </div>
              ) : (
                <p className="text-xs text-emerald-400 font-bold">🎉 Outstanding! You have complete coverage of all planned chapter topics!</p>
              )}

              <div className="pt-2 flex gap-3 text-xs">
                <button
                  id="rec-action-later"
                  onClick={() => handleRecommendationAction(null)}
                  className="flex-1 py-3 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 font-bold rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  Schedule Later
                </button>
                <button
                  id="rec-action-now"
                  disabled={!recommendationTopic}
                  onClick={() => handleRecommendationAction(recommendationTopic)}
                  className={`flex-1 py-3 font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center space-x-1 ${
                    recommendationTopic 
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow shadow-indigo-600/15 cursor-pointer" 
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <span>Start Topic Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
