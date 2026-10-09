const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Groq client
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Interview Preparation System API is running!"
    });
});

// ===============================
// AI INTERVIEW QUESTION GENERATION
// ===============================

app.post("/api/interview/question", async (req, res) => {
    try {
        const { role, skills, interviewType } = req.body;

        if (!role || !skills || !interviewType) {
            return res.status(400).json({
                success: false,
                error: "role, skills and interviewType are required"
            });
        }

        const prompt = `
You are an expert interviewer conducting an interview for a fresher.

Candidate Role: ${role}
Candidate Skills: ${skills}
Interview Type: ${interviewType}

Generate ONE interview question.

Rules:
- Ask only one question.
- Do not provide the answer.
- Keep the difficulty suitable for a fresher.
- For Technical interviews, focus on the candidate's skills.
- For HR interviews, ask a relevant HR question.
- Make the question clear and concise.

Return only the interview question.
`;

        const completion = await client.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7
        });

        console.log(
            "Question AI Response:",
            JSON.stringify(completion, null, 2)
        );

        const question =
            completion.choices?.[0]?.message?.content ||
            completion.choices?.[0]?.message?.reasoning ||
            "No question was generated.";

        res.json({
            success: true,
            question: question.trim()
        });

    } catch (error) {
        console.error("Question Generation Error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===============================
// AI ANSWER EVALUATION
// ===============================

app.post("/api/interview/evaluate", async (req, res) => {
    try {
        const { question, answer } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                success: false,
                error: "question and answer are required"
            });
        }

        const prompt = `
You are an expert interviewer evaluating a fresher's interview answer.

Interview Question:
${question}

Candidate Answer:
${answer}

Evaluate the candidate's answer.

Provide the evaluation in exactly this format:

Score: X/10

Strengths:
- Point 1
- Point 2

Weaknesses:
- Point 1
- Point 2

Feedback:
Give clear and constructive feedback about the candidate's answer.

Improved Answer:
Give an example of a better answer that a fresher could give.

Rules:
- Be constructive and encouraging.
- Keep the evaluation easy to understand.
- Give a score between 0 and 10.
- Do not evaluate anything other than the candidate's answer.
`;

        const completion = await client.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3,
            max_tokens: 1000
        });

        console.log(
            "Evaluation AI Response:",
            JSON.stringify(completion, null, 2)
        );

        const message = completion.choices?.[0]?.message;

        const evaluation =
            message?.content ||
            message?.reasoning ||
            "No evaluation was generated.";

        res.json({
            success: true,
            evaluation: evaluation.trim()
        });

    } catch (error) {
        console.error("Evaluation Error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});