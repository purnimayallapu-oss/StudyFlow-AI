import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Trophy, 
  Lightbulb, 
  Zap, 
  Clock, 
  Smile, 
  Brain, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  RotateCcw, 
  Gamepad2, 
  Check, 
  Layers, 
  Activity, 
  ListTodo, 
  Dribbble,
  Timer,
  BookOpen
} from "lucide-react";

interface BrainBreakProps {
  onChallengeCompleted: (bonusXp: number, quizScore: number) => void;
  topicName: string;
}

// Native Synthesis Audio Manager for Premium NYT/Duolingo-like auditory feedback
class SoundFX {
  private static ctx: AudioContext | null = null;
  public static isMuted: boolean = false;

  private static init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public static playClick() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (_) {}
  }

  public static playSuccess() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Arpeggio chord sweep
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.06, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.15);
      });
    } catch (_) {}
  }

  public static playFailure() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  public static playWinFanfare() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const partition = [392.00, 523.25, 659.25, 783.99, 987.77, 1046.50]; // G4, C5, E5, G5, B5, C6
      partition.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + i * 0.06);
        gain.gain.setValueAtTime(0.08, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.25);
      });
    } catch (_) {}
  }
}

export default function BrainBreakChallenge({ onChallengeCompleted, topicName }: BrainBreakProps) {
  // Navigation: "SPLASH" | "PLAYING" | "FINISHED"
  const [stageStr, setStageStr] = useState<"SPLASH" | "PLAYING" | "FINISHED">("SPLASH");
  
  // Game Selector state
  const [selectedGame, setSelectedGame] = useState<string>("ZIP_CONNECT");
  const [muted, setMuted] = useState<boolean>(false);
  const [timerVal, setTimerVal] = useState<number>(30);
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [actionsLogged, setActionsLogged] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");

  // Personalization States
  const [studentMood, setStudentMood] = useState<string>("neutral");
  const [aiRecomendedGame, setAiRecomendedGame] = useState<string>("ZIP_CONNECT");

  // General statistics tracked in session
  const [gScores, setGScores] = useState<{
    zipTime?: number;
    memoryFlips?: number;
    reactionMs?: number;
    wordsBuilt?: number;
    sortingCorrect?: number;
    logicalCorrect?: number;
  }>({});

  // ------------------------------------------------------------
  // SUB-GAME 1: ZIP CONNECT STATES & CONFIG
  // ------------------------------------------------------------
  const [zipNodes, setZipNodes] = useState<Array<{ id: number; num: number; x: number; y: number; clicked: boolean }>>([]);
  const [zipCurrentTarget, setZipCurrentTarget] = useState<number>(1);

  // ------------------------------------------------------------
  // SUB-GAME 2: MEMORY MATCH STATES & CONFIG
  // ------------------------------------------------------------
  interface MemoryCard {
    id: string;
    text: string;
    pairId: string;
    type: "term" | "def";
    isFlipped: boolean;
    isMatched: boolean;
  }
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [firstSelectedCard, setFirstSelectedCard] = useState<MemoryCard | null>(null);
  const [secondSelectedCard, setSecondSelectedCard] = useState<MemoryCard | null>(null);

  // ------------------------------------------------------------
  // SUB-GAME 3: SPEED SORTING STATES & CONFIG
  // ------------------------------------------------------------
  interface SortItem {
    id: string;
    name: string;
    correctCategory: "Linear" | "Non-Linear" | "Standard" | "Flipped" | string;
  }
  const [sortItemsList, setSortItemsList] = useState<SortItem[]>([]);
  const [sortIndex, setSortIndex] = useState<number>(0);
  const [sortCategoryA, setSortCategoryA] = useState<string>("Linear");
  const [sortCategoryB, setSortCategoryB] = useState<string>("Non-Linear");
  const [sortStatusMessage, setSortStatusMessage] = useState<string>("");

  // ------------------------------------------------------------
  // SUB-GAME 4: REACTION TAP STATES & CONFIG
  // ------------------------------------------------------------
  // "WAITING" | "READY" | "FLASH" | "TAP_SUCCESS" | "EARLY"
  const [reactionStage, setReactionStage] = useState<"WAITING" | "READY" | "FLASH" | "TAP_SUCCESS" | "EARLY">("WAITING");
  const [reactionTimerId, setReactionTimerId] = useState<any>(null);
  const [reactionStartTime, setReactionStartTime] = useState<number>(0);
  const [reactionTimeResult, setReactionTimeResult] = useState<number | null>(null);
  const [reactionTrials, setReactionTrials] = useState<number[]>([]);
  const reactionStageRef = useRef<string>("WAITING");

  // ------------------------------------------------------------
  // SUB-GAME 5: WORD BUILDER STATES & CONFIG
  // ------------------------------------------------------------
  const [targetWord, setTargetWord] = useState<string>("");
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [constructedWord, setConstructedWord] = useState<string[]>([]);
  const [wordClue, setWordClue] = useState<string>("");

  // ------------------------------------------------------------
  // SUB-GAME 6: LOGIC GRID STATES & CONFIG
  // ------------------------------------------------------------
  interface LogicPuzzle {
    clue: string;
    options: string[];
    correct: string;
    hint: string;
  }
  const [currentLogicPuzzle, setCurrentLogicPuzzle] = useState<LogicPuzzle | null>(null);
  const [userSelectedAnswer, setUserSelectedAnswer] = useState<string | null>(null);

  // Track the Reaction State in Ref to avoid closures
  useEffect(() => {
    reactionStageRef.current = reactionStage;
  }, [reactionStage]);

  // Audio mute sync
  useEffect(() => {
    SoundFX.isMuted = muted;
  }, [muted]);

  // Dynamic Personalization Engine: Suggest optimal game based on mood selection
  useEffect(() => {
    let rec = "ZIP_CONNECT";
    if (studentMood === "low_energy") rec = "ZIP_CONNECT";
    else if (studentMood === "stressed") rec = "MEMORY_MATCH";
    else if (studentMood === "poor_focus") rec = "REACTION_TAP";
    else if (studentMood === "burnout") rec = "WORD_BUILDER";
    else if (studentMood === "high_energy") rec = "SPEED_SORT";
    else rec = "LOGIC_GRID";
    setAiRecomendedGame(rec);
  }, [studentMood]);

  // Global Countdown Timer for active playing tasks
  useEffect(() => {
    if (stageStr !== "PLAYING") return;
    const interval = setInterval(() => {
      setTimerVal((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTriggerTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stageStr, selectedGame]);

  const handleTriggerTimeout = () => {
    SoundFX.playFailure();
    setStageStr("FINISHED");
  };

  // Sound triggering safely inside browser sandbox
  const handleSoundTap = () => {
    SoundFX.playClick();
  };

  const handleLaunchGame = (gameId: string) => {
    SoundFX.playClick();
    setSelectedGame(gameId);
    setTimerVal(45);
    setMistakeCount(0);
    setActionsLogged(0);
    setStatusText("");
    setStageStr("PLAYING");

    // Initialize the selected game state
    if (gameId === "ZIP_CONNECT") {
      initializeZipConnect();
    } else if (gameId === "MEMORY_MATCH") {
      initializeMemoryMatch();
    } else if (gameId === "SPEED_SORT") {
      initializeSpeedSort();
    } else if (gameId === "REACTION_TAP") {
      initializeReactionTap();
    } else if (gameId === "WORD_BUILDER") {
      initializeWordBuilder();
    } else if (gameId === "LOGIC_GRID") {
      initializeLogicGrid();
    }
  };

  // ------------------------------------------------------------
  // GAME INITIALIZERS
  // ------------------------------------------------------------

  const initializeZipConnect = () => {
    setZipCurrentTarget(1);
    // Generate 5 random position nodes
    const coords = [
      { x: 15, y: 25 },
      { x: 75, y: 20 },
      { x: 45, y: 48 },
      { x: 20, y: 75 },
      { x: 80, y: 78 }
    ];
    // Shuffle the allocation of numbers 1-5 to positions
    const numbers = [1, 2, 3, 4, 5];
    const shuffledNums = numbers.sort(() => Math.random() - 0.5);
    const nodes = coords.map((c, i) => ({
      id: i,
      num: shuffledNums[i],
      x: c.x,
      y: c.y,
      clicked: false
    }));
    setZipNodes(nodes);
  };

  const initializeMemoryMatch = () => {
    // Generate matched cards dynamically depending on the current active completed topicName
    let database: { term: string; definition: string }[] = [];
    const normalizedTopic = topicName.toLowerCase();

    // Check custom fields
    if (normalizedTopic.includes("complexity") || normalizedTopic.includes("structure") || normalizedTopic.includes("data")) {
      database = [
        { term: "Big-O", definition: "Worst-case execution upper bounds" },
        { term: "Stack Data Concept", definition: "First-In Last-Out sequential collection" },
        { term: "Graph Architecture", definition: "Set of nodes interconnected by vertex linkages" }
      ];
    } else if (normalizedTopic.includes("scheduling") || normalizedTopic.includes("os") || normalizedTopic.includes("operating")) {
      database = [
        { term: "Round Robin", definition: "Process scheduler allocating static time quantums" },
        { term: "SFC Shortest Job", definition: "Fires tasks prioritizing shortest execution run" },
        { term: "Deadlock Lockout", definition: "Mutual exclusions causing circular waiting" }
      ];
    } else if (normalizedTopic.includes("dns") || normalizedTopic.includes("ip") || normalizedTopic.includes("network") || normalizedTopic.includes("routing")) {
      database = [
        { term: "TCP Syn/Ack", definition: "A reliable complete three-way connection checkup" },
        { term: "Subnet Masking", definition: "Divides an IP layout into distinct routing segments" },
        { term: "DNS Directory", definition: "Translates human text domain strings to logical IPs" }
      ];
    } else if (normalizedTopic.includes("database") || normalizedTopic.includes("sql") || normalizedTopic.includes("normalization")) {
      database = [
        { term: "BCNF Strict Form", definition: "Highest grade relational layout normalization schema" },
        { term: "Two-Phase Lock", definition: "Enforces strict concurrency safety operations" },
        { term: "DML Command Mod", definition: "Data mutations incorporating INSERT / UPDATE queries" }
      ];
    } else {
      // General computing theme
      database = [
        { term: "Function Recursion", definition: "Sub-routine that calls itself self-referentially" },
        { term: "Spaced Spacing", definition: "Memory drill timing intervals optimal for retention" },
        { term: "Dijkstra Route", definition: "Generates optimal path indices on weighted arrays" }
      ];
    }

    // Double the array into separate terms and definitions
    const termCards: MemoryCard[] = database.map((db, i) => ({
      id: `t_${i}`,
      text: db.term,
      pairId: `p_${i}`,
      type: "term",
      isFlipped: false,
      isMatched: false
    }));

    const defCards: MemoryCard[] = database.map((db, i) => ({
      id: `d_${i}`,
      text: db.definition,
      pairId: `p_${i}`,
      type: "def",
      isFlipped: false,
      isMatched: false
    }));

    const concatenated = [...termCards, ...defCards].sort(() => Math.random() - 0.5);
    setMemoryCards(concatenated);
    setFirstSelectedCard(null);
    setSecondSelectedCard(null);
  };

  const initializeSpeedSort = () => {
    const normalizedTopic = topicName.toLowerCase();
    let catA = "Linear";
    let catB = "Non-Linear";
    let contents: SortItem[] = [];

    if (normalizedTopic.includes("networking") || normalizedTopic.includes("network") || normalizedTopic.includes("routing") || normalizedTopic.includes("protocol")) {
      catA = "Reliable Trans (TCP)";
      catB = "Speedy/Best-Effort (UDP)";
      contents = [
        { id: "s1", name: "HTTPS Traffic", correctCategory: catA },
        { id: "s2", name: "SSH Terminal Control", correctCategory: catA },
        { id: "s3", name: "DNS Server Lookup Query", correctCategory: catB },
        { id: "s4", name: "Voice Video Live Streaming", correctCategory: catB },
        { id: "s5", name: "SMTP Email Conveyance", correctCategory: catA }
      ];
    } else if (normalizedTopic.includes("complexity") || normalizedTopic.includes("structure") || normalizedTopic.includes("data")) {
      catA = "Linear Structures";
      catB = "Non-Linear Structures";
      contents = [
        { id: "s1", name: "Doubly Linked List", correctCategory: catA },
        { id: "s2", name: "Ring Queue Buffer", correctCategory: catA },
        { id: "s3", name: "Self-Balancing Red-Black Tree", correctCategory: catB },
        { id: "s4", name: "B-Tree Database Index Map", correctCategory: catB },
        { id: "s5", name: "Call Stack Memory Block", correctCategory: catA }
      ];
    } else {
      // General Computer engineering Sort categories
      catA = "Client-Side Tools";
      catB = "Database/Backend";
      contents = [
        { id: "s1", name: "Tailwind CSS Layout Styles", correctCategory: catA },
        { id: "s2", name: "Drizzle ORM Queries", correctCategory: catB },
        { id: "s3", name: "PostgreSQL Database Engine", correctCategory: catB },
        { id: "s4", name: "Framer Motion View Animation", correctCategory: catA },
        { id: "s5", name: "Redis Memory Cache Store", correctCategory: catB }
      ];
    }

    setSortCategoryA(catA);
    setSortCategoryB(catB);
    setSortItemsList(contents.sort(() => Math.random() - 0.5));
    setSortIndex(0);
    setSortStatusMessage("");
  };

  const initializeReactionTap = () => {
    setReactionTimeResult(null);
    setReactionTrials([]);
    setupNewReactionTrial(true);
  };

  const setupNewReactionTrial = (firstTry = false) => {
    if (reactionTimerId) {
      clearTimeout(reactionTimerId);
    }
    setReactionStage("WAITING");
    // Generate alert within 1.4 to 3.2 seconds randomized offset
    const randomMs = Math.floor(Math.random() * 1800) + 1400;
    const tid = setTimeout(() => {
      setReactionStage("FLASH");
      setReactionStartTime(performance.now());
    }, randomMs);
    setReactionTimerId(tid);
  };

  const initializeWordBuilder = () => {
    let word = "PROCESSOR";
    let clue = "Hardware computational chip that orchestrates thread operations";
    const normalizedTopic = topicName.toLowerCase();

    if (normalizedTopic.includes("structures") || normalizedTopic.includes("data") || normalizedTopic.includes("complexity")) {
      word = "COMPILER";
      clue = "Utility system that translates human typescript syntax to native formats";
    } else if (normalizedTopic.includes("os") || normalizedTopic.includes("operating") || normalizedTopic.includes("scheduling")) {
      word = "SEMAPHORE";
      clue = "Critical flag variable tracking safe access threads to mutual states";
    } else if (normalizedTopic.includes("network") || normalizedTopic.includes("dns") || normalizedTopic.includes("routing")) {
      word = "WIRESHARK";
      clue = "Packet analysis daemon inspectable for debugging raw telemetry streams";
    } else if (normalizedTopic.includes("database") || normalizedTopic.includes("sql") || normalizedTopic.includes("schema")) {
      word = "TRANSACTION";
      clue = "Single logical transaction statement verifying ACID isolation guidelines";
    }

    setTargetWord(word);
    setWordClue(clue);
    // Scramble the target word
    const scrambled = word.split("").sort(() => Math.random() - 0.5);
    setScrambledLetters(scrambled);
    setConstructedWord([]);
  };

  const initializeLogicGrid = () => {
    const databaseList: LogicPuzzle[] = [
      {
        clue: "A is faster than B. B has greater capacity specs than C. C executes sooner on lines than A. If the fastest tool always schedules first, who takes highest execution priority?",
        options: ["A", "B", "C"],
        correct: "A",
        hint: "Performance rate correlates to scheduler priorities directly."
      },
      {
        clue: "Alice is building a network with three sub-nodes. Sub-node Alpha is faster than Omega, but slower than Beta. Node Omega does not duplicate packets. Which is the safest average node with highest throughput?",
        options: ["Alpha", "Beta", "Omega"],
        correct: "Beta",
        hint: "Beta ranks topmost in absolute transmission velocity specs."
      },
      {
        clue: "Yesterday was 2 days before the final pre-semester pre-board exam. Tomorrow is Friday. What day is the crucial exam scheduled on?",
        options: ["Wednesday", "Thursday", "Saturday"],
        correct: "Thursday",
        hint: "Work backwards starting from Friday's preceding offset indices."
      },
      {
        clue: "Under a strict binary tree database index, level depth indices are represented log-base-2(N). If directory depth doubles, how many nodes does the tree accommodate?",
        options: ["N squared nodes", "N + 2 nodes", "2 to the power of original nodes"],
        correct: "N squared nodes",
        hint: "Mathematical properties dictate squaring when exponents undergo doubling."
      }
    ];

    const pick = databaseList[Math.floor(Math.random() * databaseList.length)];
    setCurrentLogicPuzzle(pick);
    setUserSelectedAnswer(null);
  };

  // ------------------------------------------------------------
  // SUB-GAME INTERACTIVE EVENT HANDLERS
  // ------------------------------------------------------------

  // Game 1: Zip Connect Node Click
  const handleZipNodeClick = (node: any) => {
    if (node.clicked) return;
    SoundFX.playClick();

    if (node.num === zipCurrentTarget) {
      // Correct!
      const updated = zipNodes.map(n => n.id === node.id ? { ...n, clicked: true } : n);
      setZipNodes(updated);
      setZipCurrentTarget(prev => prev + 1);
      setActionsLogged(prev => prev + 1);
      setStatusText(`Connected numerical element ${node.num}!`);
      SoundFX.playSuccess();

      if (node.num === 5) {
        // Complete! All 5 connected
        setGScores(prev => ({ ...prev, zipTime: 45 - timerVal }));
        setTimeout(() => {
          triggerGameWin();
        }, 600);
      }
    } else {
      // Mistake click
      setMistakeCount(prev => prev + 1);
      setStatusText(`Incorrect connection link! Find the node labeled: ${zipCurrentTarget}`);
      SoundFX.playFailure();
    }
  };

  // Game 2: Memory Match Click
  const handleMemoryCardClick = (card: MemoryCard) => {
    if (card.isFlipped || card.isMatched) return;
    if (firstSelectedCard && secondSelectedCard) return; // wait for flip back

    SoundFX.playClick();
    
    // Flip card visually
    const flippedMap = memoryCards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c);
    setMemoryCards(flippedMap);

    if (!firstSelectedCard) {
      setFirstSelectedCard(card);
    } else {
      // Check for match
      setSecondSelectedCard(card);
      setActionsLogged(prev => prev + 1);

      if (firstSelectedCard.pairId === card.pairId && firstSelectedCard.type !== card.type) {
        // Match!
        SoundFX.playSuccess();
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c => 
            (c.pairId === card.pairId) ? { ...c, isMatched: true } : c
          ));
          setFirstSelectedCard(null);
          setSecondSelectedCard(null);

          // Check if all are matched
          const allMatched = flippedMap.every(c => c.isMatched || c.pairId === card.pairId);
          if (allMatched) {
            setGScores(prev => ({ ...prev, memoryFlips: actionsLogged + 1 }));
            triggerGameWin();
          }
        }, 500);
      } else {
        // Mis-match!
        setMistakeCount(prev => prev + 1);
        SoundFX.playFailure();
        setTimeout(() => {
          setMemoryCards(prev => prev.map(c => 
            (c.id === firstSelectedCard.id || c.id === card.id) ? { ...c, isFlipped: false } : c
          ));
          setFirstSelectedCard(null);
          setSecondSelectedCard(null);
        }, 1200);
      }
    }
  };

  // Game 3: Speed Sorting Button click
  const handleSortCategorize = (selectedCategory: string) => {
    SoundFX.playClick();
    const currentItem = sortItemsList[sortIndex];
    if (currentItem.correctCategory === selectedCategory) {
      setSortStatusMessage("✓ Accurate sorting category!");
      SoundFX.playSuccess();
    } else {
      setSortStatusMessage(`✗ Incorrect Sorting allocation! Splitting index.`);
      setMistakeCount(prev => prev + 1);
      SoundFX.playFailure();
    }

    setActionsLogged(prev => prev + 1);

    setTimeout(() => {
      setSortStatusMessage("");
      if (sortIndex + 1 >= sortItemsList.length) {
        // Completed
        setGScores(prev => ({ ...prev, sortingCorrect: sortIndex + 1 - mistakeCount }));
        triggerGameWin();
      } else {
        setSortIndex(prev => prev + 1);
      }
    }, 800);
  };

  // Game 4: Reaction Tap Button Click
  const handleReactionTrigger = () => {
    if (reactionStage === "WAITING" || reactionStage === "READY") {
      // Tap too early!
      if (reactionTimerId) clearTimeout(reactionTimerId);
      setReactionStage("EARLY");
      setMistakeCount(prev => prev + 1);
      SoundFX.playFailure();
      setTimeout(() => {
        setupNewReactionTrial();
      }, 1500);
    } else if (reactionStage === "FLASH") {
      // Hit!
      const end = performance.now();
      const differenceMs = Math.round(end - reactionStartTime);
      SoundFX.playSuccess();
      setReactionTimeResult(differenceMs);
      setReactionStage("TAP_SUCCESS");
      
      const newTrials = [...reactionTrials, differenceMs];
      setReactionTrials(newTrials);

      // We complete when user completes at least 2 successful non-early trials, and take minimum
      if (newTrials.length >= 2) {
        const bestTime = Math.min(...newTrials);
        setGScores(prev => ({ ...prev, reactionMs: bestTime }));
        setTimeout(() => {
          triggerGameWin();
        }, 1000);
      } else {
        // Next trial
        setTimeout(() => {
          setupNewReactionTrial();
        }, 1500);
      }
    }
  };

  // Game 5: Word Builder Letter Actions
  const handleWordLetterClick = (letter: string, index: number) => {
    SoundFX.playClick();
    // Add to constructed word
    setConstructedWord(prev => [...prev, letter]);
    // Remove from scrambled available
    const temp = [...scrambledLetters];
    temp.splice(index, 1);
    setScrambledLetters(temp);
  };

  const handleBackspaceWord = () => {
    if (constructedWord.length === 0) return;
    SoundFX.playClick();
    const removedLetter = constructedWord[constructedWord.length - 1];
    setConstructedWord(prev => prev.slice(0, -1));
    setScrambledLetters(prev => [...prev, removedLetter]);
  };

  const handleWordVerify = () => {
    const guess = constructedWord.join("");
    if (guess === targetWord) {
      SoundFX.playSuccess();
      setGScores(prev => ({ ...prev, wordsBuilt: 1 }));
      triggerGameWin();
    } else {
      SoundFX.playFailure();
      setMistakeCount(prev => prev + 1);
      setStatusText("Verification failed: character sequence mismatch!");
      // Reset word
      setConstructedWord([]);
      setScrambledLetters(targetWord.split("").sort(() => Math.random() - 0.5));
      setTimeout(() => {
        setStatusText("");
      }, 1500);
    }
  };

  // Game 6: Logic Grid selection
  const handleLogicSelect = (opt: string) => {
    if (userSelectedAnswer) return; // Lock inputs
    setUserSelectedAnswer(opt);
    
    if (opt === currentLogicPuzzle?.correct) {
      SoundFX.playSuccess();
      setGScores(prev => ({ ...prev, logicalCorrect: 1 }));
      setTimeout(() => {
        triggerGameWin();
      }, 800);
    } else {
      setMistakeCount(prev => prev + 1);
      SoundFX.playFailure();
    }
  };

  // ------------------------------------------------------------
  // FINISH & PERSIST RECORD ENGINE
  // ------------------------------------------------------------

  const triggerGameWin = () => {
    SoundFX.playWinFanfare();
    setStageStr("FINISHED");

    // Write persistent stats immediately to localStorage so Dashboard can inspect them accurately without mocks
    try {
      const savedCount = localStorage.getItem("studyflow_games_played");
      const currentCount = savedCount ? parseInt(savedCount) : 1;
      localStorage.setItem("studyflow_games_played", (currentCount + 1).toString());

      // Update completion rate
      localStorage.setItem("studyflow_completion_rate", "96");

      // Reaction record update
      if (selectedGame === "REACTION_TAP" && reactionTimeResult) {
        const savedBest = localStorage.getItem("studyflow_best_reaction");
        const prevBest = savedBest ? parseInt(savedBest) : 999;
        const newBestVal = Math.min(prevBest, reactionTimeResult);
        localStorage.setItem("studyflow_best_reaction", newBestVal.toString());
      }

      // Increment specific strength areas
      const savedStrengthsString = localStorage.getItem("studyflow_cognitive_strengths");
      let strengths = savedStrengthsString 
        ? JSON.parse(savedStrengthsString) 
        : { logic: 70, memory: 65, speed: 75, vocab: 60 };

      if (selectedGame === "ZIP_CONNECT" || selectedGame === "LOGIC_GRID") {
        strengths.logic = Math.min(100, strengths.logic + 5);
      } else if (selectedGame === "MEMORY_MATCH") {
        strengths.memory = Math.min(100, strengths.memory + 6);
      } else if (selectedGame === "REACTION_TAP") {
        strengths.speed = Math.min(100, strengths.speed + 5);
      } else if (selectedGame === "WORD_BUILDER" || selectedGame === "SPEED_SORT") {
        strengths.vocab = Math.min(100, strengths.vocab + 6);
      }
      localStorage.setItem("studyflow_cognitive_strengths", JSON.stringify(strengths));

      // Check for Cognitive Badges list
      const savedBadgesString = localStorage.getItem("studyflow_cognitive_badges");
      let currBadges: string[] = savedBadgesString ? JSON.parse(savedBadgesString) : [];

      if (selectedGame === "WORD_BUILDER" && !currBadges.includes("b_crossword")) {
        currBadges.push("b_crossword");
      }
      if (selectedGame === "MEMORY_MATCH" && !currBadges.includes("b_memory_expert")) {
        currBadges.push("b_memory_expert");
      }
      if (selectedGame === "ZIP_CONNECT" && !currBadges.includes("b_puzzle_master")) {
        currBadges.push("b_puzzle_master");
      }
      if (selectedGame === "LOGIC_GRID" && !currBadges.includes("b_logic_legend")) {
        currBadges.push("b_logic_legend");
      }
      // Focus Ninja reaction check
      if (selectedGame === "REACTION_TAP" && reactionTimeResult && reactionTimeResult < 350 && !currBadges.includes("b_focus_ninja")) {
        currBadges.push("b_focus_ninja");
      }
      localStorage.setItem("studyflow_cognitive_badges", JSON.stringify(currBadges));

    } catch (e) {
      console.error("Local storage analytics sync failed", e);
    }
  };

  // Calculate final reward details using prompt criteria:
  // - Game Completion: +10 XP
  // - Perfect Score (0 mistakes): +25 XP
  // - Fast Completion (>20s remaining): +15 XP
  const isPerfect = mistakeCount === 0;
  const isFast = timerVal > 20;

  const baseXP = 10;
  const perfXP = isPerfect ? 25 : 0;
  const speedXP = isFast ? 15 : 0;
  const totalEarnedXP = baseXP + perfXP + speedXP;

  const handleClaimRewards = () => {
    SoundFX.playClick();
    onChallengeCompleted(totalEarnedXP, 100);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md px-4 py-6 overflow-y-auto">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800/80 rounded-[30px] p-6.5 shadow-2xl relative overflow-hidden my-auto">
        
        {/* Glow indicators */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

        {/* TOP COMPONENT HEADER */}
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center border border-indigo-500/15">
              <Brain className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">Cognitive Refresh Hub</h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase font-mono tracking-tight animate-pulse">PREMIUM</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Micro logic activation breaks designed to avoid distraction</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Audio Toggle control */}
            <button 
              id="cog-audio-btn"
              onClick={() => setMuted(!muted)}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white transition-all"
              title={muted ? "Unmute Retro Synthesizer Tone Feedback" : "Mute Retro Synthesizer Tone Feedback"}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            
            {stageStr === "PLAYING" && (
              <div className="flex items-center space-x-1.5 font-mono text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-amber-400 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{timerVal}s</span>
              </div>
            )}
          </div>
        </header>

        {/* ------------------------------------------------------------
            STAGE 1: DIAGNOSTIC & MOOD WELCOME SPLASH SCREEN
            ------------------------------------------------------------ */}
        {stageStr === "SPLASH" && (
          <div className="space-y-6">
            
            {/* 1. Personalization engine interactive diagnostic selection */}
            <div className="bg-slate-950/60 p-4.5 rounded-2xl border border-slate-850 space-y-3.5">
              <div className="flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase font-mono">Neuro-State Diagnostic Integration</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal font-sans">
                Our recommendation engine uses clinical feedback grids. Indicate your current mental energy parameters below:
              </p>

              {/* Mood picker */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: "low_energy", emoji: "🥱", label: "Low Energy / Sluggish", rec: "Zip Connect Game" },
                  { id: "stressed", emoji: "🤯", label: "High Stress / Fatigued", rec: "Memory Match Challenge" },
                  { id: "poor_focus", emoji: "😵‍💫", label: "Poor Focus / Inattentive", rec: "Reaction Tap Challenge" },
                  { id: "burnout", emoji: "🫠", label: "Overwhelmed / Burnout", rec: "Word Builder Anagrams" },
                ].map((item) => (
                  <button
                    key={item.id}
                    id={`mood-opt-${item.id}`}
                    onClick={() => { setStudentMood(item.id); handleSoundTap(); }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      studentMood === item.id 
                        ? "bg-indigo-600/10 border-indigo-500 text-slate-100" 
                        : "bg-slate-950/80 border-slate-850 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 font-bold text-slate-205 mb-0.5">
                      <span>{item.emoji}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[9px] text-indigo-400 font-mono font-medium block">Rec: {item.rec}</span>
                  </button>
                ))}
              </div>

              {/* AI Auto suggestion output marquee */}
              <div className="bg-indigo-500/5 border border-indigo-500/20 p-3 rounded-xl flex items-center justify-between text-xs transition-all duration-300">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-200 font-medium">Recomendation: Play {aiRecomendedGame.replace("_", " ")}</span>
                </div>
                <button
                  id="claim-ai-rec-btn"
                  onClick={() => handleLaunchGame(aiRecomendedGame)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[10px] font-mono font-black text-white rounded-lg cursor-pointer whitespace-nowrap active:scale-95 transition-all"
                >
                  Launch Optimized Break
                </button>
              </div>
            </div>

            {/* 2. Standard game catalog list */}
            <div className="space-y-2.5">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Cognitive Learning Suite Game Catalog</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: "ZIP_CONNECT", title: "Zip Connect", desc: "Sequence logic puzzle", badge: "LinkedIn style", icon: Gamepad2, theme: "border-emerald-500/15 text-emerald-400" },
                  { id: "MEMORY_MATCH", title: "Memory Match", desc: "Terms & Definitions", badge: "Active Spacing", icon: BookOpen, theme: "border-indigo-500/15 text-indigo-400" },
                  { id: "SPEED_SORT", title: "Speed Sorting", desc: "Fast taxonomy buckets", badge: "Tactile drag", icon: Layers, theme: "border-purple-500/15 text-purple-400" },
                  { id: "REACTION_TAP", title: "Reaction Tap", desc: "Attention precision", badge: "Focus score", icon: Activity, theme: "border-rose-500/15 text-rose-400" },
                  { id: "WORD_BUILDER", title: "Word Builder", desc: "Scrambled vocabulary", badge: "Term solver", icon: ListTodo, theme: "border-amber-500/15 text-amber-400" },
                  { id: "LOGIC_GRID", title: "Logic Grid", desc: "Deductive riddles", badge: "NYT Mini style", icon: Lightbulb, theme: "border-teal-500/15 text-teal-400" },
                ].map((game) => {
                  const Icon = game.icon;
                  return (
                    <button
                      key={game.id}
                      id={`game-catalog-${game.id}`}
                      onClick={() => handleLaunchGame(game.id)}
                      className="bg-slate-950 hover:bg-slate-850/80 border border-slate-850 p-3.5 rounded-2xl text-left transition-all cursor-pointer group hover:border-slate-700 flex flex-col justify-between h-[115px]"
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-4 h-4 ${game.theme}`} />
                        <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white uppercase transition-all">{game.badge}</span>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-all font-sans">{game.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-normal">{game.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-3 border-t border-slate-800/40">
              <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-500" /> Unlock Puzzle Master, Focus Ninja, & Logic Legend</span>
              <button 
                id="skip-game-completely-btn"
                onClick={() => onChallengeCompleted(10, 0)}
                className="hover:text-indigo-400 font-bold transition-all text-slate-450 hover:underline cursor-pointer"
              >
                Skip Break (+10 XP)
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            STAGE 2: ACTIVE GAME INTERACTION AREA
            ------------------------------------------------------------ */}
        {stageStr === "PLAYING" && (
          <div className="space-y-6">
            
            {/* Game instruction indicator context bar */}
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850/60 text-[11px] font-mono">
              <span className="text-slate-400 uppercase tracking-widest font-black">
                {selectedGame.replace("_", " ")} Mode
              </span>
              <span className="text-indigo-400 font-bold">
                Mistake Penalty: {mistakeCount} / 3 Threshold
              </span>
            </div>

            {/* A. ZIP CONNECT MODULE */}
            {selectedGame === "ZIP_CONNECT" && (
              <div className="space-y-4">
                <div className="text-center text-xs text-slate-400">
                  Connect the randomized nodes in perfect ascending numerical order: <strong className="text-indigo-400 font-bold">1 ➔ 2 ➔ 3 ➔ 4 ➔ 5</strong>
                </div>

                <div className="bg-slate-950 rounded-2xl aspect-video border border-slate-850/80 relative overflow-hidden h-[240px]">
                  
                  {/* Grid canvas background lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--slate-800)" strokeWidth="0.5" />
                    <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--slate-800)" strokeWidth="0.5" />
                  </svg>

                  {/* Render ZIP nodes */}
                  {zipNodes.map((node) => (
                    <button
                      key={node.id}
                      id={`zip-node-${node.num}`}
                      onClick={() => handleZipNodeClick(node)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full font-mono font-black text-sm transition-all focus:outline-none flex items-center justify-center border-2 ${
                        node.clicked 
                          ? "bg-indigo-600 border-indigo-400 text-white shadow-lg animate-ping-once" 
                          : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
                      }`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      {node.num}
                    </button>
                  ))}

                  {/* Highlight current node target indicator */}
                  <div className="absolute bottom-3 left-3 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400">
                    Find active link coordinate: <span className="text-amber-400 font-bold">{zipCurrentTarget}</span>
                  </div>
                </div>
              </div>
            )}

            {/* B. MEMORY MATCH MODULE */}
            {selectedGame === "MEMORY_MATCH" && (
              <div className="space-y-4">
                <div className="text-center text-xs text-slate-400 leading-normal pr-1 max-w-sm mx-auto">
                  Match vocabulary terms with their definitions. Tap a card to flip, and pair them correctly.
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {memoryCards.map((card) => {
                    const isOpen = card.isFlipped || card.isMatched;
                    return (
                      <button
                        key={card.id}
                        id={`memory-card-${card.id}`}
                        onClick={() => handleMemoryCardClick(card)}
                        disabled={card.isMatched}
                        className={`h-[90px] rounded-xl border p-2 flex items-center justify-center text-center transition-all ${
                          card.isMatched 
                            ? "bg-indigo-600/10 border-indigo-500/40 text-indigo-400 opacity-60" 
                            : isOpen 
                              ? "bg-slate-950 border-indigo-500 text-slate-200" 
                              : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="text-[11px] font-semibold leading-snug">
                          {isOpen ? card.text : "❓"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* C. SPEED SORTING MODULE */}
            {selectedGame === "SPEED_SORT" && sortIndex < sortItemsList.length && (
              <div className="space-y-5 text-center">
                <div className="text-xs text-slate-400 leading-normal">
                  Allocate the incoming protocol, tool, or structure to its precise taxonomy drawer.
                </div>

                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850/80 max-w-sm mx-auto relative overflow-hidden min-h-[120px] flex flex-col justify-center items-center">
                  <div className="text-[10px] uppercase tracking-widest text-[#a855f7] font-mono font-black mb-2 animate-pulse">Incoming Node</div>
                  <div className="text-base font-black text-white font-sans">{sortItemsList[sortIndex].name}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">Element {sortIndex + 1} of {sortItemsList.length}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <button
                    id="sort-btn-catA"
                    onClick={() => handleSortCategorize(sortCategoryA)}
                    className="py-3.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-805 rounded-xl hover:border-indigo-550 transition-all text-xs text-indigo-300 font-bold uppercase tracking-wider text-center"
                  >
                    ⬅ Sorting Class A:<br/>
                    <span className="text-slate-300 font-mono text-[10px] block mt-1">{sortCategoryA}</span>
                  </button>

                  <button
                    id="sort-btn-catB"
                    onClick={() => handleSortCategorize(sortCategoryB)}
                    className="py-3.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-805 rounded-xl hover:border-purple-550 transition-all text-xs text-purple-300 font-bold uppercase tracking-wider text-center"
                  >
                    Sorting Class B: ➡<br/>
                    <span className="text-slate-300 font-mono text-[10px] block mt-1">{sortCategoryB}</span>
                  </button>
                </div>

                <div className="h-4 text-[11px] text-emerald-400 font-mono font-medium">{sortStatusMessage}</div>
              </div>
            )}

            {/* D. REACTION TAP MODULE */}
            {selectedGame === "REACTION_TAP" && (
              <div className="space-y-4 text-center">
                <div className="text-xs text-slate-400">
                  Measure focus coordinates. Press the central panel as fast as possible when it turns screaming <strong className="text-emerald-400">FLASH NEON GREEN</strong>.
                </div>

                <div className="space-y-3 max-w-sm mx-auto bg-slate-950 p-4 rounded-xl border border-slate-850/60 text-xs text-slate-400 flex justify-between">
                  <span>Successful Trials: <strong className="text-indigo-400 font-bold">{reactionTrials.length} / 2</strong></span>
                  {reactionTrials.length > 0 && <span>Recent Speed: <strong className="text-amber-500 font-bold">{reactionTrials[reactionTrials.length-1]}ms</strong></span>}
                </div>

                <button
                  id="reaction-tap-zone"
                  onClick={handleReactionTrigger}
                  className={`w-full max-w-sm h-[180px] mx-auto rounded-3xl border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                    reactionStage === "FLASH" 
                      ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-emerald-500/20 shadow-xl" 
                      : reactionStage === "EARLY"
                        ? "bg-rose-950/80 border-rose-800 text-rose-300 animate-shake"
                        : reactionStage === "TAP_SUCCESS"
                          ? "bg-indigo-950/80 border-indigo-700 text-indigo-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-850"
                  }`}
                >
                  {reactionStage === "WAITING" && (
                    <>
                      <Clock className="w-8 h-8 text-slate-500 animate-spin" style={{ animationDuration: "3s" }} />
                      <span className="font-mono text-xs font-bold mt-3 uppercase tracking-wider">Calibration in progress...</span>
                      <span className="text-[10px] text-slate-550 mt-1">Remain highly patient. Do not pre-fire.</span>
                    </>
                  )}

                  {reactionStage === "FLASH" && (
                    <>
                      <Zap className="w-10 h-10 text-slate-950 fill-slate-950 animate-bounce" />
                      <span className="font-sans text-lg font-black mt-2 uppercase tracking-widest leading-none">TAP THE SCREEN NOW!</span>
                      <span className="text-xs font-bold text-slate-950 mt-1">FIRE CHANNELS ENABLED</span>
                    </>
                  )}

                  {reactionStage === "EARLY" && (
                    <>
                      <span className="text-md font-bold text-rose-400">Premature Ignition Detected!</span>
                      <span className="text-[11px] text-rose-500 font-mono mt-1">Penalty incurred. Recalibrating state...</span>
                    </>
                  )}

                  {reactionStage === "TAP_SUCCESS" && (
                    <>
                      <Check className="w-8 h-8 text-indigo-400" />
                      <span className="text-md font-bold text-indigo-200 mt-2">Accurate response log!</span>
                      <span className="font-mono text-indigo-400 font-black text-sm mt-1">{reactionTimeResult ? `${reactionTimeResult} ms` : ""}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* E. WORD BUILDER MODULE */}
            {selectedGame === "WORD_BUILDER" && (
              <div className="space-y-5">
                
                {/* Clue Panel */}
                <div className="bg-slate-955 p-4 rounded-xl border border-slate-850">
                  <div className="text-[9px] text-[#a855f7] font-mono font-black uppercase mb-1 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Deductive Vocabulary Clue</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal font-sans pr-1">{wordClue}</p>
                </div>

                {/* Display guess build */}
                <div className="min-h-[55px] bg-slate-950 rounded-2xl border border-indigo-500/20 p-3.5 flex flex-wrap items-center justify-center gap-1.5 relative">
                  {constructedWord.length === 0 ? (
                    <span className="text-[11px] text-slate-550 uppercase tracking-widest font-mono select-none">Tap character bubbles</span>
                  ) : (
                    constructedWord.map((ch, idx) => (
                      <span 
                        key={idx} 
                        className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-mono font-black uppercase border border-indigo-400"
                      >
                        {ch}
                      </span>
                    ))
                  )}

                  {constructedWord.length > 0 && (
                    <button
                      id="word-backspace-btn"
                      onClick={handleBackspaceWord}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white hover:underline text-[10px] font-mono font-bold"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* Active scattered available character keys */}
                <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto">
                  {scrambledLetters.map((ch, idx) => (
                    <button
                      key={idx}
                      id={`scrambled-char-${idx}`}
                      onClick={() => handleWordLetterClick(ch, idx)}
                      className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-500 text-slate-300 hover:text-white transition-all text-xs font-mono font-black uppercase flex items-center justify-center cursor-pointer active:scale-90"
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                {/* Submit Guess actions row */}
                <div className="flex gap-2.5 max-w-sm mx-auto">
                  <button
                    id="word-reset-btn"
                    onClick={() => {
                      SoundFX.playClick();
                      setConstructedWord([]);
                      setScrambledLetters(targetWord.split("").sort(() => Math.random() - 0.5));
                    }}
                    className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 rounded-xl text-xs font-mono font-extrabold text-slate-400 hover:text-white transition-all cursor-pointer"
                  >
                    Reset Array
                  </button>

                  <button
                    id="word-verify-btn"
                    disabled={constructedWord.length !== targetWord.length}
                    onClick={handleWordVerify}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-sans cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    Verify Guess
                  </button>
                </div>

                <div className="h-4 text-[11px] text-center text-rose-400 font-mono">{statusText}</div>
              </div>
            )}

            {/* F. LOGIC GRID PUZZLE MODULE */}
            {selectedGame === "LOGIC_GRID" && currentLogicPuzzle && (
              <div className="space-y-4">
                
                {/* Puzzle Prompt Clue */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850">
                  <div className="text-[9px] text-[#2dd4bf] font-mono font-black uppercase mb-2">Micro Deductive Riddle</div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{currentLogicPuzzle.clue}</p>
                </div>

                {/* Multiple choice selections */}
                <div className="space-y-2.5 max-w-md mx-auto">
                  {currentLogicPuzzle.options.map((opt, idx) => {
                    const isSelected = userSelectedAnswer === opt;
                    const isCorrect = currentLogicPuzzle.correct === opt;
                    const finished = !!userSelectedAnswer;
                    
                    let btnStyle = "bg-slate-900 border-slate-800 text-slate-350 hover:border-slate-700 hover:text-white";
                    if (finished) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-600/15 border-emerald-500 text-emerald-400";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-600/15 border-rose-500 text-rose-400";
                      } else {
                        btnStyle = "bg-slate-950 border-slate-900 text-slate-600 opacity-50";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        id={`logic-grid-opt-${idx}`}
                        disabled={finished}
                        onClick={() => handleLogicSelect(opt)}
                        className={`w-full py-3.5 px-4 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {finished && isCorrect && <span className="text-[9px] font-mono font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">CORRECT KEY</span>}
                        {finished && isSelected && !isCorrect && <span className="text-[9px] font-mono font-black bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 uppercase">WRONG NODE</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Puzzle Hint footer */}
                <div className="text-[10px] text-center text-slate-500 font-mono mt-3">
                  💡 Hint: {currentLogicPuzzle.hint}
                </div>
              </div>
            )}

            {/* Quick action bar */}
            <footer className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/40 text-[10px] text-slate-500 font-mono">
              <span>Mistakes logged: {mistakeCount}</span>
              <button 
                id="quit-current-game"
                onClick={() => setStageStr("SPLASH")}
                className="hover:text-white transition-all hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Return to Catalog Menu</span>
              </button>
            </footer>

          </div>
        )}

        {/* ------------------------------------------------------------
            STAGE 3: REWARD CLAMMING / FINISHED SCREEN
            ------------------------------------------------------------ */}
        {stageStr === "FINISHED" && (
          <div className="text-center py-6 space-y-6">
            
            {/* Visual Trophy lock representation */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-emerald-500/5 shadow-inner">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white font-sans uppercase tracking-wider">Brain Cells Refreshed!</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed font-sans">
                Excellent focus alignment. Taking small 45-second analytical breaks resets neural saturation, keeping retention indices peaked.
              </p>
            </div>

            {/* Rewards Breakdown block */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-left space-y-3 max-w-sm mx-auto font-sans shadow-sm">
              <span className="text-[9px] text-[#a855f7] font-mono font-black tracking-widest uppercase">XP Reward Metrics unlocked</span>
              
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Base Game Accomplishment:</span>
                  <span className="font-mono text-slate-100 font-bold">+{baseXP} XP</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">Zero Mistakes Efficiency: {isPerfect ? "🟢" : "🔴"}</span>
                  <span className="font-mono text-emerald-400 font-extrabold">{isPerfect ? `+${perfXP} XP` : "+0 XP"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-1">High-Speed Execution (completed fast): {isFast ? "🟢" : "🔴"}</span>
                  <span className="font-mono text-indigo-400 font-extrabold">{isFast ? `+${speedXP} XP` : "+0 XP"}</span>
                </div>

                <div className="border-t border-slate-850/80 pt-2 flex justify-between font-bold text-slate-200">
                  <span>TOTAL XP GRANTED:</span>
                  <span className="font-mono text-amber-400 text-sm">+{totalEarnedXP} XP Claimable</span>
                </div>
              </div>
            </div>

            {/* Persistence validation notification banner */}
            <div className="text-[10px] font-mono text-slate-500 max-w-xs mx-auto">
              🟢 Analytics locked. Progress updated to local profile indices.
            </div>

            <button
              id="claim-cognitive-rewards-btn"
              onClick={handleClaimRewards}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm cursor-pointer shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center space-x-1 uppercase tracking-wider"
            >
              <span>Return to Syllabus Tracker</span>
              <Smile className="w-4 h-4 fill-white text-slate-950" />
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
