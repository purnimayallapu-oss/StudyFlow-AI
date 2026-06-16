import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client with user agent for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper validation for Gemini Key
const checkGeminiKey = (): boolean => {
  return !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
};

// API: Generate Custom Study Plan
app.post("/api/generate-plan", async (req, res) => {
  try {
    if (!checkGeminiKey()) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Please set your Gemini key in the AI Studio Secrets panel.",
      });
    }

    const {
      examName,
      goalType,
      examDate,
      subjects,
      chapters,
      topics,
      dailyHours,
      weeklyAvailability,
      currentSkillLevel,
    } = req.body;

    // Helper flag if template is fully custom or requires dynamic AI curriculum generation
    const isAiGeneratedCurriculum = !subjects || subjects.length === 0 || !topics || topics.length === 0;

    let prompt = "";
    if (isAiGeneratedCurriculum) {
      prompt = `Create a master study plan and dynamically design a comprehensive, standard, high-fidelity curriculum for the exam/learning goal: "${examName}" (Goal Type: "${goalType || "Certification/Professional"}"), occurring on target date: "${examDate}".
Since no manual syllabus is specified, you must dynamically research and generate appropriate:
1. Core subjects/modules (at least 3 typical subjects or domains required for this goal)
2. Conceptual chapters within those subjects (at least 2 chapters per subject)
3. Essential trackable study topics within those chapters (at least 2 topics per chapter, e.g. 8-12 total tasks)

User profile metrics:
- Daily study hours budget: ${dailyHours} hours/day
- Weekly availability: ${JSON.stringify(weeklyAvailability)}
- Current Skill Level: ${currentSkillLevel}

You must construct a detailed, realistic, task-by-task chronological roadmap breakdown table, estimated timeline milestones, and expected completion date. Ensure all due dates are beautifully distributed before the exam target date ${examDate}. Priority should be assigned strategically (HIGH, MEDIUM, LOW).`;
    } else {
      prompt = `Create a master study plan for the exam/learning goal: "${examName}" (Goal Type: "${goalType || "Custom"}"), occurring on date: "${examDate}".
The user wants to cover the following topics/structure:
Subjects: ${JSON.stringify(subjects)}
Chapters: ${JSON.stringify(chapters)}
Topics: ${JSON.stringify(topics)}

User parameters:
- Daily study hours budget: ${dailyHours} hours/day
- Weekly availability: ${JSON.stringify(weeklyAvailability)}
- Current Skill Level: ${currentSkillLevel}

Generate a detailed task-by-task breakdown table, roadmap estimated completion, milestones, and daily study items. Ensure due dates fit before the exam date. Calculate total hours realistically.`;
    }

    const planSchema = {
      type: Type.OBJECT,
      properties: {
        syllabusStartDate: { type: Type.STRING },
        syllabusEndDate: { type: Type.STRING },
        estimatedCompletionDate: { type: Type.STRING },
        totalExpectedHours: { type: Type.INTEGER },
        milestones: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              targetDate: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["title", "targetDate", "description"],
          },
        },
        tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              chapter: { type: Type.STRING },
              topic: { type: Type.STRING },
              priority: { type: Type.STRING, description: "HIGH, MEDIUM, or LOW" },
              estimatedHours: { type: Type.NUMBER },
              dueDate: { type: Type.STRING },
            },
            required: ["subject", "chapter", "topic", "priority", "estimatedHours", "dueDate"],
          },
        },
      },
      required: [
        "syllabusStartDate",
        "syllabusEndDate",
        "estimatedCompletionDate",
        "totalExpectedHours",
        "tasks",
        "milestones",
      ],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite academic planner and SaaS EdTech scheduler. Generate a hyper-realistic, organized, and motivating study schedule based on user exam date and availability.",
        responseMimeType: "application/json",
        responseSchema: planSchema,
      },
    });

    const resultText = response.text ? response.text.trim() : "";
    const parsedData = JSON.parse(resultText);

    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in /api/generate-plan:", error);
    res.status(500).json({ error: error.message || "Failed to generate study plan" });
  }
});

// API: Generate Topic Practice Quiz (Knowledge Check)
app.post("/api/generate-quiz", async (req, res) => {
  try {
    if (!checkGeminiKey()) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    const { subject, chapter, topic, skillLevel } = req.body;

    const quizResponseSchema = {
      type: Type.OBJECT,
      properties: {
        quizTitle: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              questionText: { type: Type.STRING },
              questionType: { type: Type.STRING, description: "MCQ, TRUE_FALSE, or FILL_BLANK" },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 4 options for MCQ, 'True', 'False' for TRUE_FALSE, or blank empty array for FILL_BLANK",
              },
              correctAnswer: { type: Type.STRING, description: "The exact matching correct answer from options or correct phrase" },
              explanation: { type: Type.STRING },
            },
            required: ["id", "questionText", "questionType", "options", "correctAnswer", "explanation"],
          },
        },
      },
      required: ["quizTitle", "questions"],
    };

    const prompt = `Generate a 5-question high-fidelity quiz to recall, test concept comprehension of the academic topic: "${topic}" in chapter: "${chapter}" of the subject: "${subject}". 
Current difficulty/target level: "${skillLevel || "Medium"}".
Include:
- 3 Multiple Choice Questions (MCQ)
- 1 True/False question
- 1 Concept understanding Fill-in-the-blank or short concept answer.
Provide correct answer verification and an insightful explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an adaptive academic cognitive tester. Generate high-quality challenging questions that strengthen retrieval practice.",
        responseMimeType: "application/json",
        responseSchema: quizResponseSchema,
      },
    });

    const resultText = response.text ? response.text.trim() : "";
    const parsedQuiz = JSON.parse(resultText);

    res.json(parsedQuiz);
  } catch (error: any) {
    console.error("Error in /api/generate-quiz:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI Quiz" });
  }
});

// API: Generate Topic Micro-Summary
app.post("/api/generate-summary", async (req, res) => {
  try {
    if (!checkGeminiKey()) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured.",
      });
    }

    const { subject, topic } = req.body;

    const summarySchema = {
      type: Type.OBJECT,
      properties: {
        bullets: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        formulasOrDefinitions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        examInsights: { type: Type.STRING },
        commonMistakes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["bullets", "formulasOrDefinitions", "examInsights", "commonMistakes"],
    };

    const prompt = `Provide an elegant, concise, student-friendly micro-summary of "${topic}" under the subject path: "${subject}". Use max 5 high-impact bullet items, key definitions/formulas, special exam focus insights, and common pitfalls to prevent.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior academic tutor summarizing complex subjects into elegant memory triggers.",
        responseMimeType: "application/json",
        responseSchema: summarySchema,
      },
    });

    const resultText = response.text ? response.text.trim() : "";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/generate-summary:", error);
    res.status(500).json({ error: error.message || "Failed to generate summary" });
  }
});

// API: AI Study Coach Chat Bot
app.post("/api/coach-chat", async (req, res) => {
  try {
    if (!checkGeminiKey()) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Please set your Gemini key in the AI Studio Secrets panel.",
      });
    }

    const { messages } = req.body; // Array of { role: "user" | "model", text: string }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    // Map to standard Gemini parts format
    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `You are the ultimate human-like personal StudyFlow AI Coach. 
Your responsibilities:
1. Actively guide students with scheduling advice, exam strategy, concentration hacks, and motivation.
2. Undergo burnout hazard checks: if they study too much, tell them to take an AI Brain Refresh!
3. Be friendly, energetic, clear, concise, and structured. Use bullet points for easy scanning!
4. Directly support questions like 'What should I study today?', 'Which concepts need review?', and 'Am I on track?' based on hypothetical or provided details. Keep replies actionable.`,
      },
    });

    res.json({ text: response.text || "I'm listening! Tell me more about your revision goals." });
  } catch (error: any) {
    console.error("Error in /api/coach-chat:", error);
    res.status(500).json({ error: error.message || "Failed to get AI Coach feedback" });
  }
});

// Check if Gemini key is set globally
app.get("/api/gemini-status", (req, res) => {
  res.json({ configured: checkGeminiKey() });
});

// Initialize Express + Vite Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyFlow AI server is live on http://localhost:${PORT}`);
  });
}

startServer();
