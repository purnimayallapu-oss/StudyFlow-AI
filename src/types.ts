export interface StudyTask {
  id: string;
  examId: string;
  subject: string;
  chapter: string;
  topic: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedHours: number;
  dueDate: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedDate?: string;
  confidenceScore?: number; // 0 to 100
  confidenceLevel?: "STRONG" | "NEEDS_REVISION" | "REVISIT";
  revisionScheduledDate?: string;
  revisionCount: number;
  xpAwarded?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  description: string;
  completed: boolean;
}

export interface Exam {
  id: string;
  name: string;
  goalType?: string; // Academic, Competitive, Placement, Certification, Skill, Custom
  targetDate: string;
  dailyHoursGoal: number;
  currentSkillLevel: "Beginner" | "Intermediate" | "Advanced";
  weeklyAvailability: string[]; // ['Monday', 'Wednesday'...]
  estimatedCompletionDate?: string;
  totalExpectedHours?: number;
  milestones: Milestone[];
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  content: string; // Markdown text
  pinned: boolean;
  createdAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  xpRequired: number;
  unlockedAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  course: string;
  academicYear: string;
  targetExamName: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: string;
  dailyGoalHours: number;
  preferredHours: string;
  totalFocusMinutes: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "STREAK" | "REVISION" | "GOAL" | "FOCUS" | "SYSTEM";
  timestamp: string;
  read: boolean;
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  questionType: "MCQ" | "TRUE_FALSE" | "FILL_BLANK";
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GeneratedQuiz {
  quizTitle: string;
  questions: QuizQuestion[];
}

export interface MicroSummaryData {
  bullets: string[];
  formulasOrDefinitions: string[];
  examInsights: string;
  commonMistakes: string[];
}

export type CustomColumnType = 'Text' | 'Checkbox' | 'Number' | 'Date' | 'Status' | 'Priority' | 'Progress';

export interface CustomColumn {
  id: string;
  name: string;
  type: CustomColumnType;
}

export interface CustomChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface CustomRow {
  id: string;
  cells: Record<string, any>; // columnId -> cell value (string, number, boolean)
  checklist: CustomChecklistItem[];
  deadline: string;
  notes: string;
}

export interface CustomTable {
  id: string;
  name: string;
  columns: CustomColumn[];
  rows: CustomRow[];
}
