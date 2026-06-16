import React, { useState } from "react";
import { 
  Sparkles, 
  BrainCircuit, 
  Flame, 
  Calendar, 
  BookOpen, 
  ChevronRight, 
  Award, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  HelpCircle,
  Play,
  Sun,
  Moon
} from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../ThemeContext";

interface LandingPageProps {
  onStartPlanning: () => void;
  onSeeDemo: () => void;
  isLoggedIn?: boolean;
}

export default function LandingPage({ onStartPlanning, onSeeDemo, isLoggedIn }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6 text-indigo-400" />,
      title: "AI Cognitive Planning",
      description: "Generates custom study plans tailored to target exam date, remaining chapters, and daily availability. No more rigid templates."
    },
    {
      icon: <Flame className="w-6 h-6 text-amber-500" />,
      title: "Gamified Habit Triggers",
      description: "Earn experience points (XP), streak multipliers, level badges, and keep absolute high consistency with daily study streaks."
    },
    {
      icon: <Clock className="w-6 h-6 text-emerald-400" />,
      title: "Durable Spaced Repetition",
      description: "Automatically schedules revisions 1, 3, 7, 15, and 30 days after topic completion based on active retention performance."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
      title: "AI Brain Break Mini Games",
      description: "Immediately launches rapid, lightweight memory challenges or logic puzzles to alleviate neural fatigue and boost compliance."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Input Exam Details",
      desc: "Specify your target goal (UPSC, Professional Board, Certification, College finals), subjects, remaining syllabus chapters, and daily study hour budget."
    },
    {
      number: "02",
      title: "Generate AI Schedule",
      desc: "Our Gemini-powered engine instantly constructs a custom daily roadmap, micro milestones, and optimal chronological paths."
    },
    {
      number: "03",
      title: "Study with Active Recall",
      desc: "Launch distraction-free focus rooms, run dynamic mock quizzes, digest AI-generated bullet summaries, and earn streak XP points."
    },
    {
      number: "04",
      title: "Adaptive Self-Optimization",
      desc: "Missed a session? StudyFlow intelligently reschedules remaining workloads dynamically without punishing or overworking you."
    }
  ];

  const pricingPlans = [
    {
      name: "Struggling Student",
      price: "Free",
      period: "forever",
      desc: "For individual learners seeking structured direction.",
      features: [
        "1 Generated Exam Planner",
        "Standard Interactive Kanban Tasks",
        "Lightweight Pomodoro Focus Tracker",
        "Basic Daily Streak Rewards System",
        "Local Storage Client Save Engine"
      ],
      cta: "Plan My Syllabus Now",
      popular: false
    },
    {
      name: "StudyFlow Pro",
      price: "$9",
      period: "month",
      desc: "For rigorous competitive candidates demanding perfect preparedness.",
      features: [
        "Unlimited Exam Planners & Schedules",
        "Deep Gemini-Powered Quizzes & Checks",
        "Dynamic Topic Summary Generators",
        "Revision Spaced Repetition Alerts",
        "Full AI Study Coach Chat Bot Proxy",
        "Interactive Brain-Refresh Mini Challenges"
      ],
      cta: "Create My AI Study Plan",
      popular: true
    },
    {
      name: "Summit Institute",
      price: "$29",
      period: "month",
      desc: "For cohorts, study partners, and educational teams.",
      features: [
        "Everything in Pro Plan package",
        "Collaborative Real-time Leaderboards",
        "Batch Upload of Syllabus Documents",
        "Weekly Cohort Analytics & Goal Digests",
        "API Integration Channels"
      ],
      cta: "Contact Sales Division",
      popular: false
    }
  ];

  const faqs = [
    {
      q: "How does StudyFlow protect me from academic burnout?",
      a: "Unlike brutal spreadsheets, StudyFlow implements 'AI Brain Refresh' - a lightweight 30-60 second brain teaser immediately following task completion. Combined with adaptive rescheduling, it prevents the cognitive overloads that break most studying strategies."
    },
    {
      q: "Does it support professional certifications, competitive exams (UPSC, JEE, etc.) or college courses?",
      a: "Yes! Any exam with specific subjects and chapters can be input. The generative engine organizes topics by priority matrices and places high-yield content in appropriate study blocks before the countdown expires."
    },
    {
      q: "How does the Spaced Repetition System schedule revision?",
      a: "Every completed topic is classified. Depending on your score in the AI Knowledge check, StudyFlow auto-stamps target review milestones (1, 3, 7 days). If performance is red or yellow, it accelerates the loop to ensure high neural retention."
    },
    {
      q: "Is there a real database or is everything saved locally?",
      a: "StudyFlow AI is built with an Offline-First approach. It syncs to local storage so you never lose your planners, data, streaks, and notes even if you close the tab. Full-stack connections securely proxy AI queries behind Node.js."
    }
  ];

  const stats = [
    { val: "94.8%", label: "Streak Consistency Rate" },
    { val: "2.8 Hours", label: "Average Saved on Weekly Planning" },
    { val: "40%+", label: "Academic Retention Improvement" },
    { val: "15,000+", label: "Happy Global Students" }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-900/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Modern Navigation Header */}
      <header className="border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 pointer-events-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                StudyFlow
              </span>
              <span className="text-xs font-semibold ml-1.5 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 uppercase tracking-widest border border-indigo-500/25">
                AI Agent
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <button 
                id="landing-see-demo-nav"
                onClick={onSeeDemo}
                className="text-sm font-medium text-slate-300 hover:text-white transition-all cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-900"
              >
                See Demo Layout
              </button>
            ) : (
              <button 
                id="landing-dashboard-nav"
                onClick={onSeeDemo}
                className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer px-3 py-1.5 rounded-lg hover:bg-slate-900/45"
              >
                Go to Dashboard
              </button>
            )}
            <button
              id="landing-theme-toggle"
              onClick={toggleTheme}
              className="p-2 ml-1 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-amber-400 border border-slate-805 transition-all cursor-pointer flex items-center justify-center"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-505" />}
            </button>
            <button
              id="landing-plan-now-nav"
              onClick={onStartPlanning}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:translate-y-[1px] transition-all cursor-pointer flex items-center space-x-1"
            >
              <span>{isLoggedIn ? "Access Workspace" : "Get Started"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-32 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/50 border border-indigo-800/40 text-xs font-medium text-indigo-300 mb-8 px-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Intelligent Spaced Repetition & Adaptive Scheduling Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6">
            Ditch rigid calendars.<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Study like an Elite Athlete.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-10">
            StudyFlow is the intelligent, gamified study assistant that builds adaptive syllabus timelines, tests recall via live AI Quizzes, prevents fatigue, and maximizes success.
          </p>
        </motion.div>

        {/* Core Actions */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <button
            id="landing-cta-primary"
            onClick={onStartPlanning}
            className="w-full sm:w-auto px-8 py-4.5 rounded-xl text-lg font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:brightness-110 text-white shadow-xl shadow-indigo-600/15 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <span>Create My AI Study Plan</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            id="landing-cta-secondary"
            onClick={onSeeDemo}
            className="w-full sm:w-auto px-8 py-4.5 rounded-xl text-lg font-semibold bg-slate-900 hover:bg-slate-850 text-slate-100 border border-slate-800 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 text-slate-400 fill-slate-400" />
            <span>Interactive Demo</span>
          </button>
        </motion.div>

        {/* Glassmorphic Mockup Preview */}
        <motion.div
          className="relative max-w-4xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3 mb-4 text-xs text-slate-500">
            <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
            <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
            <span className="pl-2 font-mono">studyflow-ai-dashboard-v1.0.exe</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div className="md:col-span-1 rounded-xl bg-slate-950/80 p-4 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-xs text-slate-400 tracking-wider font-semibold uppercase mb-1">Weekly Streak</div>
                <div className="text-3xl font-extrabold text-amber-400 flex items-center gap-1">
                  <Flame className="w-6 h-6 fill-amber-500 stroke-amber-400" />
                  <span>14 Days</span>
                </div>
              </div>
              <div className="mt-6">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">My Rank</div>
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold">Gold III</div>
                  <span className="text-xs text-slate-300">Level 8 (420/550 XP)</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 rounded-xl bg-slate-950/80 p-4 border border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Interactive Timeline & Active Checklists</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Today: 3 Completed</span>
              </div>
              <div className="space-y-2 font-sans">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="text-xs font-medium text-white">Dynamic Routing Protocols (OSPF vs BGP)</div>
                      <div className="text-[10px] text-slate-400">Networking, Chapter 4 • Priority: High</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">🟢 Passed Quiz</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">+50 XP</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 opacity-60">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-slate-600" />
                    <div>
                      <div className="text-xs font-medium text-slate-300">Subnet Aggregations & Routing Tables</div>
                      <div className="text-[10px] text-slate-400">Networking, Chapter 4 • Priority: Medium</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded">Scheduled Review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Success Metrics Section */}
      <section className="bg-slate-900/50 border-y border-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((st, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl md:text-4xl font-extrabold text-indigo-400 font-mono tracking-tight">{st.val}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works System */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
            How StudyFlow Directs Your Learning Paths
          </h2>
          <p className="text-slate-400">
            A precise structured cognitive algorithm built to guide you from initial planning to exam mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((st, i) => (
            <div key={i} className="relative bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="text-xs font-black text-indigo-400 tracking-wider mb-2 uppercase">Step</div>
                <div className="text-4xl font-black text-indigo-500/30 mb-4">{st.number}</div>
                <h3 className="text-lg font-bold text-slate-100 mb-2">{st.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Cards Grid */}
      <section className="bg-slate-900/20 py-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
              Engineered to Maximize Your Cognitive Recall
            </h2>
            <p className="text-slate-400">
              StudyFlow combines neuro-principles, gamification, and AI insights so study logs translate into real marks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((ft, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between transition-all hover:border-indigo-500/20">
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 inline-block">
                    {ft.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">{ft.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{ft.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
            Hear from Successful Candidates
          </h2>
          <p className="text-slate-400">Join thousands of students and career professionals studying smarter with AI coaching.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center">AJ</div>
              <div>
                <div className="text-sm font-semibold text-white">Aniket Joshi</div>
                <div className="text-[10px] text-slate-400 font-mono">Professional Certification Aspirant</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 italic leading-relaxed">
              "The adaptive scheduler is fantastic. When I missed my trees and heaps session on Wednesday due to health reasons, it restructured my workload dynamically. The Brain Break keeps me focused and happy across 4 hours of code logic!"
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center">SR</div>
              <div>
                <div className="text-sm font-semibold text-white">Sanya Roy</div>
                <div className="text-[10px] text-slate-400 font-mono">UPSC CSE Professional Candidate</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 italic leading-relaxed">
              "UPSC syllabus is colossal. The hierarchical system of Subject-&gt;Chapter-&gt;Topic is perfectly designed, and the automatically triggered Spaced Repetition reviews ensured high retention of key historical acts."
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center">MK</div>
              <div>
                <div className="text-sm font-semibold text-white">Michael K.</div>
                <div className="text-[10px] text-slate-400 font-mono">Senior DevOps & Certification Student</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 italic leading-relaxed">
              "Completing a topic and immediately facing 5 quick conceptual questions from the AI quiz keeps me completely honest. I actually understand the concepts instead of just memorizing slides!"
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section className="bg-slate-900/30 border-t border-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
              Sane Pricing Models for Smart Students
            </h2>
            <p className="text-slate-400">Choose the path that fits your goals. Try risk-free.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((pl, i) => (
              <div 
                key={i} 
                className={`p-8 rounded-3xl bg-slate-900/50 border relative flex flex-col justify-between ${
                  pl.popular ? "border-indigo-500 shadow-xl shadow-indigo-505/5" : "border-slate-800"
                }`}
              >
                {pl.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                    Most Popular Choice
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{pl.name}</h3>
                  <div className="flex items-baseline space-x-1.5 mb-2">
                    <span className="text-4xl font-extrabold text-white">{pl.price}</span>
                    <span className="text-slate-400 text-sm">/{pl.period}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">{pl.desc}</p>
                  
                  <div className="space-y-3.5 border-t border-slate-800/80 pt-6 mb-8">
                    {pl.features.map((ft, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <CheckCircle className="w-4 h-4 text-indigo-400 mt-0.5" />
                        <span>{ft}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  id={`pricing-${i}-cta`}
                  onClick={onStartPlanning}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-center cursor-pointer active:scale-95 transition-all ${
                    pl.popular 
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15" 
                      : "bg-slate-800 hover:bg-slate-750 text-slate-200"
                  }`}
                >
                  {pl.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-900">
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-10 text-center">
          Frequently Answered Queries
        </h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div 
              key={i} 
              className="border border-slate-800/60 rounded-xl bg-slate-900/20 overflow-hidden transition-all"
            >
              <button
                id={`faq-toggle-${i}`}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full text-left px-6 py-5 flex justify-between items-center bg-slate-900/40 hover:bg-indigo-950/10 cursor-pointer focus:outline-none"
              >
                <span className="font-semibold text-slate-100 pr-4">{f.q}</span>
                <span className="text-indigo-400 font-mono text-lg">{activeFaq === i ? "−" : "+"}</span>
              </button>
              {activeFaq === i && (
                <div className="px-6 py-5 text-sm text-slate-400 border-t border-slate-800/60 bg-slate-900/10 leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Form */}
      <section className="text-center py-20 px-6 max-w-4xl mx-auto">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px]" />
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">
            Ready to study smart and boost consistency?
          </h2>
          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto mb-8 font-light">
            Generate your personalized syllabus planner, access active recall quizzes, and unlock your real potential today.
          </p>
          <button
            id="landing-footer-cta"
            onClick={onStartPlanning}
            className="px-8 py-4 rounded-xl text-md font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/20 cursor-pointer active:scale-95 transition-all"
          >
            Create My AI Study Plan
          </button>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="border-t border-slate-900/80 py-8 text-center text-xs text-slate-500">
        <p>© 2026 StudyFlow AI Technologies. Built with Gemini Cognitive Intelligence. All rights reserved.</p>
      </footer>
    </div>
  );
}
