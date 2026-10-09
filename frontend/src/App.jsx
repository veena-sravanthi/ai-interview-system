import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [role, setRole] = useState("");
    const [skills, setSkills] = useState("");
    const [interviewType, setInterviewType] = useState("Technical");

    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");

    const [evaluation, setEvaluation] = useState("");

    const [loadingQuestion, setLoadingQuestion] = useState(false);
    const [loadingEvaluation, setLoadingEvaluation] = useState(false);

    const [error, setError] = useState("");

    // Generate interview question
    const startInterview = async () => {
        if (!role || !skills) {
            setError("Please enter your role and skills.");
            return;
        }

        setError("");
        setQuestion("");
        setAnswer("");
        setEvaluation("");

        try {
            setLoadingQuestion(true);

            const response = await axios.post(
                "http://localhost:5000/api/interview/question",
                {
                    role: role,
                    skills: skills,
                    interviewType: interviewType
                }
            );

            setQuestion(response.data.question);

        } catch (error) {
            console.error(error);
            setError("Failed to generate interview question.");
        } finally {
            setLoadingQuestion(false);
        }
    };

    // Evaluate candidate answer
    const submitAnswer = async () => {
        if (!answer.trim()) {
            setError("Please enter your answer.");
            return;
        }

        setError("");

        try {
            setLoadingEvaluation(true);

            const response = await axios.post(
                "http://localhost:5000/api/interview/evaluate",
                {
                    question: question,
                    answer: answer
                }
            );

            setEvaluation(response.data.evaluation);

        } catch (error) {
            console.error(error);
            setError("Failed to evaluate your answer.");
        } finally {
            setLoadingEvaluation(false);
        }
    };

    return (
        <div className="app">

            {/* Header */}
            <header className="header">
                <h1>AI Interview Preparation System</h1>
                <p>
                    Practice interviews with an AI-powered virtual interviewer
                </p>
            </header>

            <main className="container">

                {/* Candidate Information */}
                <section className="card">

                    <h2>Interview Setup</h2>

                    <div className="form-group">
                        <label>Job Role</label>

                        <input
                            type="text"
                            placeholder="Example: Software Developer"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Skills</label>

                        <input
                            type="text"
                            placeholder="Example: Java, SQL, React"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Interview Type</label>

                        <select
                            value={interviewType}
                            onChange={(e) =>
                                setInterviewType(e.target.value)
                            }
                        >
                            <option value="Technical">
                                Technical
                            </option>

                            <option value="HR">
                                HR
                            </option>
                        </select>
                    </div>

                    <button
                        className="primary-button"
                        onClick={startInterview}
                        disabled={loadingQuestion}
                    >
                        {loadingQuestion
                            ? "Generating Question..."
                            : "Start Interview"}
                    </button>

                </section>

                {/* Error */}
                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                {/* Question */}
                {question && (
                    <section className="card">

                        <h2>Interview Question</h2>

                        <div className="question-box">
                            {question}
                        </div>

                        <div className="form-group">

                            <label>Your Answer</label>

                            <textarea
                                rows="8"
                                placeholder="Type your answer here..."
                                value={answer}
                                onChange={(e) =>
                                    setAnswer(e.target.value)
                                }
                            />

                        </div>

                        <button
                            className="primary-button"
                            onClick={submitAnswer}
                            disabled={loadingEvaluation}
                        >
                            {loadingEvaluation
                                ? "Evaluating Answer..."
                                : "Submit Answer"}
                        </button>

                    </section>
                )}

                {/* Evaluation */}
                {evaluation && (
                    <section className="card">

                        <h2>AI Evaluation</h2>

                        <div className="evaluation">
                            {evaluation}
                        </div>

                        <button
                            className="secondary-button"
                            onClick={startInterview}
                        >
                            Next Question
                        </button>

                    </section>
                )}

            </main>

            <footer>
                <p>AI Interview Preparation System</p>
            </footer>

        </div>
    );
}

export default App;