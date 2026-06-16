import React, { useState } from "react";
import { User, Mail, Lock, BookOpen, GraduationCap, ArrowRight, ShieldCheck, Smile } from "lucide-react";
import { UserProfile } from "../types";

interface AuthAreaProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthArea({ onLoginSuccess }: AuthAreaProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Registration and Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [course, setCourse] = useState("Computer Science & Engineering");
  const [academicYear, setAcademicYear] = useState("3rd Year Undergraduate");
  const [targetExamName, setTargetExamName] = useState("UNIVERSITY SEMESTER EXAM");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing accounts or initialize
  const getRegisteredUsers = (): Array<{ profile: UserProfile; passwordHash: string }> => {
    const raw = localStorage.getItem("studyflow_registered_users");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const saveRegisteredUsers = (users: Array<{ profile: UserProfile; passwordHash: string }>) => {
    localStorage.setItem("studyflow_registered_users", JSON.stringify(users));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please fill in all security fields.");
      return;
    }

    const users = getRegisteredUsers();
    const match = users.find(u => u.profile.email.toLowerCase() === email.toLowerCase());

    if (!match) {
      // Allow fallback login as demo user for convenient instant previewing
      if (email.toLowerCase() === "alex@university.edu") {
        const demoProfile: UserProfile = {
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
        setSuccessMsg("Logged in successfully via Demo Access!");
        setTimeout(() => {
          onLoginSuccess(demoProfile);
        }, 1000);
        return;
      }
      setErrorMsg("Account does not exist. Try registering or use Guest Login!");
      return;
    }

    if (match.passwordHash !== password) {
      setErrorMsg("Incorrect Password validation. Please try again.");
      return;
    }

    setSuccessMsg(`Welcome Back, ${match.profile.name}!`);
    setTimeout(() => {
      onLoginSuccess(match.profile);
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name || !email || !password) {
      setErrorMsg("All core registration credentials are required.");
      return;
    }

    if (password.length < 5) {
      setErrorMsg("Password security must be at least 5 characters.");
      return;
    }

    const users = getRegisteredUsers();
    const exists = users.some(u => u.profile.email.toLowerCase() === email.toLowerCase()) || email.toLowerCase() === "alex@university.edu";

    if (exists) {
      setErrorMsg("This authorized email address has already been claimed.");
      return;
    }

    // Creating profile structure
    const newProfile: UserProfile = {
      name,
      email,
      course,
      academicYear,
      targetExamName,
      xp: 50, // Starter registration bonus!
      level: 1,
      streak: 1,
      dailyGoalHours: 4,
      preferredHours: "06:00 PM - 10:00 PM",
      totalFocusMinutes: 0
    };

    const updatedUsers = [...users, { profile: newProfile, passwordHash: password }];
    saveRegisteredUsers(updatedUsers);

    setSuccessMsg("Aesthetic profile created successfully!");
    setTimeout(() => {
      onLoginSuccess(newProfile);
    }, 1200);
  };

  // Instant Guest Quick Access function
  const handleGuestAccess = () => {
    const guestUser: UserProfile = {
      name: "Guest Scholar",
      email: "guest@studyflow.edu",
      course: "General Studies & Exploration",
      academicYear: "Undergraduate",
      targetExamName: "Syllabus Milestone Target",
      xp: 15,
      level: 1,
      streak: 1,
      dailyGoalHours: 3,
      preferredHours: "07:00 PM - 10:00 PM",
      totalFocusMinutes: 0
    };
    onLoginSuccess(guestUser);
  };

  // Populate Alex Mercer (Original Demo User Data)
  const handleDemoAccess = () => {
    const demoProfile: UserProfile = {
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
    onLoginSuccess(demoProfile);
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-8 font-sans">
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6.5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        
        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-12 h-12 bg-indigo-600/15 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/20 mx-auto mb-3.5 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Access StudyFlow</h2>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            Secure client authentication. Enjoy progress persistence & XP multipliers.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-850/80 mb-5 relative z-10">
          <button
            id="auth-tab-signin"
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              !isSignUp ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            id="auth-tab-[#register]"
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isSignUp ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/15" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts Block */}
        {errorMsg && (
          <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-2xl text-[11px] text-red-400 mb-4 animate-shake leading-relaxed">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-[11px] text-emerald-400 mb-4 flex items-center gap-1.5 leading-relaxed">
            <Smile className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Forms Render */}
        <form onSubmit={isSignUp ? handleRegister : handleLogin} className="space-y-4 relative z-10">
          
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="auth-input-name"
                  type="text"
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="auth-input-email"
                type="email"
                placeholder="alex@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secure Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="auth-input-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Registration Extended Profile Parameters */}
          {isSignUp && (
            <div className="space-y-4 pt-2 border-t border-slate-850/60">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Course Major</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <input
                    id="auth-input-course"
                    type="text"
                    placeholder="e.g. Applied Business, Cloud Solutions"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Year</label>
                  <select
                    id="auth-select-year"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-350 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="1st Year Undergraduate">1st Year Undergrad</option>
                    <option value="2nd Year Undergraduate">2nd Year Undergrad</option>
                    <option value="3rd Year Undergraduate">3rd Year Undergrad</option>
                    <option value="4th Year Undergraduate">4th Year Undergrad</option>
                    <option value="Graduate Masters">Graduate Masters</option>
                    <option value="Doctoral Candidate">Ph.D. Candidate</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Exam Target</label>
                  <input
                    id="auth-input-examkey"
                    type="text"
                    placeholder="e.g. AWS Solutions Architect, UPSC IAS Prelims"
                    value={targetExamName}
                    onChange={(e) => setTargetExamName(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full py-3 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>{isSignUp ? "Register Account" : "Access Planner console"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick alternative access shortcuts */}
        <div className="mt-5 pt-4 border-t border-slate-850/60 text-center relative z-10 space-y-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            — Or Quick Guest Trials —
          </div>
          
          <div className="grid grid-cols-2 gap-3 pb-1">
            <button
              id="auth-demo-alex"
              type="button"
              onClick={handleDemoAccess}
              className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-350 hover:text-white font-semibold text-[10px] transition-all cursor-pointer flex items-center justify-center space-x-1"
              title="Loads the premium original CSE computer science dataset instantly!"
            >
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import Demo User</span>
            </button>
            <button
              id="auth-guest-quick"
              type="button"
              onClick={handleGuestAccess}
              className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-350 hover:text-white font-semibold text-[10px] transition-all cursor-pointer flex items-center justify-center space-x-1"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guest Account</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
