/**
 * Gemini API Service for intelligent adaptive learning.
 * @module services/geminiService
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

if (typeof window !== 'undefined') {
    window.monitorAPI = true; // Toggle to false to suppress Gemini call logging
}

let genAI = null;

function getModel() {
    if (!genAI) {
        if (!config.api.GEMINI_API_KEY || config.api.GEMINI_API_KEY === 'YOUR_KEY_HERE') {
            console.warn('Gemini API key is missing. Using fallback mock data.');
            return null;
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
    } catch (e) {
        console.error('Gemini API Error:', e);
        return fallback;
    }
}

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

export async function generateHint(question, learningStyle, userName) {
    if (typeof window !== 'undefined' && window.monitorAPI) console.log(" Gemini called for:", "💡 Hint");
    const prompt = `Give a subtle hint for this question without revealing the answer: ${question}`;
    
    return safeGenerateJSON(prompt, { hint: `[MOCK OWL] Psst, look closely at the core concept!` });
}

export async function generateELI5(concept, userName) {
    if (typeof window !== 'undefined' && window.monitorAPI) console.log(" Gemini called for:", "📖 Explain");
    const prompt = `Explain ${concept} in 3 simple bullet points for a beginner`;
    
    return safeGenerateJSON(prompt, { explanation: `[MOCK OWL] \n• Point 1\n• Point 2\n• Point 3` });
}

export async function generateFollowUpQuestion(question, userAnswer, correctAnswer) {
    if (typeof window !== 'undefined' && window.monitorAPI) console.log(" Gemini called for:", "❌ Wrong Answer Follow-up");
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

export async function generateMascotGreeting(userName, weakAreas) {
    // API Call disabled per user request to limit Gemini
    return { message: `Hi ${userName}! Ready to crush some lessons? 🦉` };
}

export async function generatePersonalizedFeedback(topic, userMistake, learningStyle) {
    const prompt = `Generate personalized feedback for a learner studying ${topic}. They made this mistake: ${userMistake}. Their learning style is ${learningStyle}.
    Return strictly JSON: {"feedback": "...", "hint": "...", "nextStep": "..."}`;
    
    return safeGenerateJSON(prompt, {
        feedback: `[MOCK AI] It seems you are struggling with ${topic} regarding ${userMistake}.`,
        hint: `Think about how ${topic} applies visually in real life.`,
        nextStep: "Let's review the foundational concepts again."
    });
}
