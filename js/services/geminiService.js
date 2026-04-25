/**
 * Gemini API Service for intelligent adaptive learning.
 * @module services/geminiService
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config.js';

let genAI = null;

function getModel() {
    if (!genAI) {
        if (!config.api.GEMINI_API_KEY || config.api.GEMINI_API_KEY === 'YOUR_KEY_HERE') {
            console.warn('Gemini API key is missing. Using fallback mock data.');
            return null;
        }
        genAI = new GoogleGenerativeAI(config.api.GEMINI_API_KEY);
    }
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

async function safeGenerateJSON(prompt, fallback) {
    const model = getModel();
    if (!model) return fallback;
    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Try extracting JSON from markdown fences
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

export async function generateAdaptiveQuestion(topic, currentLevel, previousAnswers) {
    const prompt = `Generate a ${currentLevel} difficulty multiple choice question about "${topic}".
    The user's recent answers on this topic were: ${JSON.stringify(previousAnswers)}. Avoid repeating questions.
    Return strictly as a JSON object: {"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "...", "explanation": "..."}`;
    
    return safeGenerateJSON(prompt, {
        question: `[MOCK AI] Which of the following is true about ${topic}?`,
        options: ['It is synchronous', 'It is asynchronous', 'It is a CSS framework', 'It is a database'],
        correctAnswer: 'It is asynchronous',
        explanation: `Mock reasoning: ${topic} is typically asynchronous.`
    });
}

export async function analyzeAnswer(question, userAnswer, correctAnswer) {
    const prompt = `Analyze the learner's answer.
    Question: "${question}"
    Correct answer: "${correctAnswer}"
    User chose: "${userAnswer}"
    
    Determine if it is conceptually correct.
    Return strictly JSON: {"isCorrect": boolean, "confidence": number (0-1), "reasoning": "Explain why they might have chosen this, and gently correct them if wrong, or praise if correct."}`;
    
    const isCorrect = userAnswer === correctAnswer;
    return safeGenerateJSON(prompt, {
        isCorrect: isCorrect,
        confidence: 0.8,
        reasoning: isCorrect ? `[MOCK AI] Spot on! You understand the concept perfectly.` : `[MOCK AI] Not quite. You chose "${userAnswer}", but the correct answer is "${correctAnswer}".`
    });
}

export function adjustDifficulty(currentLevel, performance) {
    let newLevel = currentLevel;
    // performance.recentScore is between 0 and 1
    if (performance.recentScore > 0.8) {
        newLevel = Math.min(3, currentLevel + 1); // Max level 3
    } else if (performance.recentScore < 0.4) {
        newLevel = Math.max(1, currentLevel - 1); // Min level 1
    }
    
    return {
        newLevel,
        shouldIncrease: newLevel > currentLevel,
        shouldDecrease: newLevel < currentLevel
    };
}

export async function generatePersonalizedFeedback(topic, userMistake, learningStyle) {
    const prompt = `Generate personalized feedback for a learner studying ${topic}. They made this mistake: ${userMistake}. Their learning style is ${learningStyle}.
    Return strictly JSON: {"feedback": "...", "hint": "...", "nextStep": "..."}`;
    
    return safeGenerateJSON(prompt, {
        feedback: `[MOCK AI] It seems you are struggling with ${topic} regarding ${userMistake}.`,
        hint: `Think about how ${topic} applies visually in real life.`,
        nextStep: 'Let\'s review the foundational concepts again.'
    });
}
