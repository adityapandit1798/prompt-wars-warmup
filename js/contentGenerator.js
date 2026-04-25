/**
 * Content generator mapping to Gemini integration.
 * @module contentGenerator
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

let genAI = null;

function getModel() {
    if (!genAI) {
        if (!config.api.GEMINI_API_KEY || config.api.GEMINI_API_KEY === 'YOUR_KEY_HERE') return null;
        genAI = new GoogleGenerativeAI(config.api.GEMINI_API_KEY);
    }
    return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

async function safeGenerateJSON(prompt, fallback) {
    const model = getModel();
    if (!model) return fallback;
    try {
        const result = await model.generateContent(prompt);
        let text = result.response.text();
        const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (jsonMatch) text = jsonMatch[1];
        return JSON.parse(text);
    } catch (e) {
        console.error('Gemini API Error:', e);
        return fallback;
    }
}

export async function generateExplanation(topic, difficulty, style) {
    console.time('generateExplanation');
    const prompt = `Explain ${topic} at a ${difficulty} level using a ${style} approach.
    Return strictly JSON: { "explanation": "Detailed paragraph", "examples": ["Code/real example"], "analogies": ["Analogy"], "simplified": "A very simple 1-sentence version" }`;
    
    try {
        return await safeGenerateJSON(prompt, {
            explanation: `[MOCK AI] ${difficulty} explanation of ${topic} tailored for a ${style} learner.`,
            simplified: `[MOCK AI] ${topic} is basically a useful concept.`,
            examples: [`// Example of ${topic}\nconsole.log('Action');`],
            analogies: [`Think of ${topic} like a multi-tool.`]
        });
    } finally {
        console.timeEnd('generateExplanation');
    }
}

export async function generateQuizQuestion(topic, difficulty) {
    console.time('generateQuizQuestion');
    const prompt = `Generate a ${difficulty} multiple-choice question about ${topic}.
    Return strictly JSON: {"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "...", "explanation": "..."}`;
    
    try {
        return await safeGenerateJSON(prompt, {
            question: `[MOCK AI] What defines ${topic} best?`,
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'A',
            explanation: 'Mock: A is the standard answer.'
        });
    } finally {
        console.timeEnd('generateQuizQuestion');
    }
}

export async function generateAnalogy(concept, userInterest) {
    console.time('generateAnalogy');
    const prompt = `Explain ${concept} using an analogy related to ${userInterest}.
    Return strictly JSON: {"analogy": "...", "mapping": {"source": "...", "target": "..."}}`;
    
    try {
        return await safeGenerateJSON(prompt, {
            analogy: `[MOCK AI] ${concept} is like ${userInterest}.`,
            mapping: { source: userInterest, target: concept }
        });
    } finally {
        console.timeEnd('generateAnalogy');
    }
}
