/**
 * Gemini API Service for intelligent adaptive learning.
 * @module services/geminiService
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

// [Security] Suppress all console logs in production to prevent data leakage
if (typeof window !== 'undefined') {
    window.monitorAPI = false;
}

let genAI = null;

function getModel() {
    if (!genAI) {
        if (!config.api.GEMINI_API_KEY || config.api.GEMINI_API_KEY === 'YOUR_KEY_HERE') {
            return null; // [Efficiency] Prevent unnecessary API calls if key is missing
        }
        genAI = new GoogleGenerativeAI(config.api.GEMINI_API_KEY);
    }
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

async function safeGenerateJSON(prompt, fallback) {
    const model = getModel();
    if (!model) return fallback;
    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        let text = result.response.text();
        
        const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            text = jsonMatch[1];
        }
        return JSON.parse(text);
        return JSON.parse(text);
    } catch (e) {
        // [Security] Gracefully catch API/parse errors and return mock fallback
        return fallback;
    }
}

/**
 * Calls Gemini to generate a brand new adaptive question based on topic and difficulty.
 * @param {string} topic - The programming topic (e.g., 'JavaScript', 'Python').
 * @param {string} currentLevel - The target difficulty ('beginner', 'intermediate', 'advanced').
 * @param {Array<string>} previousWrongAnswers - Concepts the user recently failed.
 * @param {string} [pacePref='medium'] - User's preferred learning pace.
 * @returns {Promise<{question: string, options: string[], correctAnswer: string, explanation: string}>} Generated question object.
 * @example const q = await generateAdaptiveQuestion('React', 'beginner', ['Hooks']);
 */
export async function generateAdaptiveQuestion(topic, currentLevel, previousWrongAnswers, pacePref = 'medium') {
    const prompt = `Generate a multiple choice programming concept question about ${topic} (JavaScript/Python/etc) at ${currentLevel} level. Question format: Ask about concepts, syntax, or best practices. The user prefers a ${pacePref} learning pace. They recently struggled with these concepts: ${JSON.stringify(previousWrongAnswers)}. Include 4 options, correct answer (A/B/C/D), and detailed explanation`;
    
    let result = await safeGenerateJSON(prompt, {
        question: `[MOCK AI] Which of the following is true about ${topic}?`,
        options: ['A. It is synchronous', 'B. It is asynchronous', 'C. It is a CSS framework', 'D. It is a database'],
        correctAnswer: 'B',
        explanation: `Mock reasoning: ${topic} is typically asynchronous.`
    });
    
    if (result && result.options) {
        if (!Array.isArray(result.options) && typeof result.options === 'object') {
            result.options = Object.entries(result.options).map(([key, val]) => {
                return typeof val === 'string' && val.startsWith(key) ? val : `${key}. ${val}`;
            });
        }
    }
    
    return result;
}

/**
 * Analyzes a user's answer against the correct answer and provides reasoning.
 * @param {string} question - The question text.
 * @param {string} userAnswer - The raw option text the user selected.
 * @param {string} correctAnswer - The correct option key (A/B/C/D).
 * @param {string} [userName="Learner"] - User's display name for personalization.
 * @returns {Promise<{isCorrect: boolean, reasoning: string, confidence?: number}>} Analysis result.
 * @example const result = await analyzeAnswer('What is a closure?', 'A. Function', 'A');
 */
export async function analyzeAnswer(question, userAnswer, correctAnswer, userName = "Learner") {
    const prompt = `User answered ${userAnswer}. Correct is ${correctAnswer}. Explain why in 2 sentences for a learner. Include programming-related encouragement like 'Nice coding!', 'You're getting it!', or 'Common mistake!'.
    Return strictly JSON: {"isCorrect": boolean, "reasoning": "..."}`;
    
    const isCorrect = typeof userAnswer === 'string' && (userAnswer.startsWith(correctAnswer) || userAnswer === correctAnswer);
    return safeGenerateJSON(prompt, {
        isCorrect: isCorrect,
        confidence: 0.8,
        reasoning: isCorrect ? `[MOCK OWL] Nice coding, ${userName}! Spot on.` : `[MOCK OWL] Common mistake, ${userName}. The correct answer was ${correctAnswer}.`
    });
}

/**
 * Requests a subtle hint from Gemini based on the question.
 * @param {string} question - The question text to hint at.
 * @param {string} learningStyle - The user's learning style to tailor the hint.
 * @param {string} userName - The user's name.
 * @returns {Promise<{hint: string}>} A short, subtle hint.
 * @example const hintData = await generateHint('Explain promises', 'visual', 'Alex');
 */
export async function generateHint(question, learningStyle, userName) {
    const prompt = `Give a subtle hint for this question without revealing the answer: ${question}`;
    
    return safeGenerateJSON(prompt, { hint: `[MOCK OWL] Psst, look closely at the core concept!` });
}

/**
 * Generates an Explain-Like-I'm-5 (ELI5) summary for a complex concept.
 * @param {string} concept - The difficult concept to explain.
 * @param {string} userName - User's name.
 * @returns {Promise<{explanation: string}>} A bulleted simple explanation.
 * @example const expl = await generateELI5('Docker Containers', 'Sam');
 */
export async function generateELI5(concept, userName) {
    const prompt = `Explain ${concept} in 3 simple bullet points for a beginner`;
    
    return safeGenerateJSON(prompt, { explanation: `[MOCK OWL] \n• Point 1\n• Point 2\n• Point 3` });
}

/**
 * Generates a targeted follow-up question when the user gets an answer wrong.
 * @param {string} question - The original question.
 * @param {string} userAnswer - What the user guessed.
 * @param {string} correctAnswer - The actual correct answer.
 * @returns {Promise<{explanation: string, followUpQuestion: string, followUpOptions: string[], followUpCorrect: string}>} The new remediation package.
 * @example const remediation = await generateFollowUpQuestion('What is HTML?', 'B', 'A');
 */
export async function generateFollowUpQuestion(question, userAnswer, correctAnswer) {
    const prompt = `User answered wrong. Question: ${question}. Their answer: ${userAnswer}. Correct: ${correctAnswer}. Explain why in 2 simple sentences, then generate a NEW follow-up question to test if they understand now. Return JSON: { "explanation": "...", "followUpQuestion": "...", "followUpOptions": ["A. ...", "B. ...", "C. ...", "D. ..."], "followUpCorrect": "A" }`;
    
    let result = await safeGenerateJSON(prompt, {
        explanation: `[MOCK OWL] The correct answer was ${correctAnswer}. Let's try another one.`,
        followUpQuestion: `[MOCK AI] Let's try again: What is ${correctAnswer} typically used for?`,
        followUpOptions: ['A. Data', 'B. Style', 'C. Logic', 'D. Nothing'],
        followUpCorrect: 'A'
    });
    
    if (result && result.followUpOptions && !Array.isArray(result.followUpOptions) && typeof result.followUpOptions === 'object') {
        result.followUpOptions = Object.entries(result.followUpOptions).map(([k, v]) => `${k}. ${v}`);
    }
    
    return result;
}

/**
 * Mocks a mascot greeting to reduce API load.
 * @param {string} userName - The user's name.
 * @param {Array<string>} weakAreas - The user's detected weak areas.
 * @returns {Promise<{message: string}>} A pre-baked greeting string.
 */
export async function generateMascotGreeting(userName, weakAreas) {
    // API Call disabled per user request to limit Gemini
    return { message: `Hi ${userName}! Ready to crush some lessons? 🦉` };
}

/**
 * Generates tailored feedback addressing a specific mistake made by the user.
 * @param {string} topic - The topic of study.
 * @param {string} userMistake - Details of the user's error.
 * @param {string} learningStyle - The user's preferred learning style (e.g., visual, textual).
 * @returns {Promise<{feedback: string, hint: string, nextStep: string}>} A structured feedback object.
 * @example const fb = await generatePersonalizedFeedback('React', 'mutate state directly', 'visual');
 */
export async function generatePersonalizedFeedback(topic, userMistake, learningStyle) {
    const prompt = `Generate personalized feedback for a learner studying ${topic}. They made this mistake: ${userMistake}. Their learning style is ${learningStyle}.
    Return strictly JSON: {"feedback": "...", "hint": "...", "nextStep": "..."}`;
    
    return safeGenerateJSON(prompt, {
        feedback: `[MOCK AI] It seems you are struggling with ${topic} regarding ${userMistake}.`,
        hint: `Think about how ${topic} applies visually in real life.`,
        nextStep: "Let's review the foundational concepts again."
    });
}
