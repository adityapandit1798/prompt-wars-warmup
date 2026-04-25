/**
 * Core adaptation logic for the Learning Companion.
 * @module adaptiveEngine
 */
import { generateAdaptiveQuestion, generatePersonalizedFeedback } from './services/geminiService.js';

export async function assessUserLevel(topic) {
    console.time('assessUserLevel');
    try {
        const diagnosticQuestion = await generateAdaptiveQuestion(topic, 'beginner', []);
        return { diagnosticQuestion, level: 1, confidence: 0.5 };
    } catch (error) {
        console.error('Error in assessUserLevel:', error);
        return { level: 1, confidence: 0 };
    } finally {
        console.timeEnd('assessUserLevel');
    }
}

export async function selectNextContent(currentLevel, performanceHistory) {
    console.time('selectNextContent');
    try {
        const difficulty = currentLevel > 3 ? 'advanced' : currentLevel > 1 ? 'intermediate' : 'beginner';
        const question = await generateAdaptiveQuestion('General Concept', difficulty, performanceHistory);
        return { difficulty, contentType: 'quiz', content: question };
    } catch (error) {
        console.error('Error in selectNextContent:', error);
        return { difficulty: 'beginner', contentType: 'fallback' };
    } finally {
        console.timeEnd('selectNextContent');
    }
}

export function calculatePace(conceptId, startTime, endTime, attempts) {
    console.time('calculatePace');
    try {
        const timeSpent = Math.max(1, (endTime - startTime) / 1000);
        const paceScore = Math.max(0, 100 - (timeSpent / 10) - (attempts * 5));
        
        let recommendation = 'continue';
        if (paceScore < 40) recommendation = 'slow_down';
        else if (paceScore > 80) recommendation = 'speed_up';
        
        return { paceScore, recommendation };
    } catch (error) {
        console.error('Error in calculatePace:', error);
        return { paceScore: 50, recommendation: 'maintain' };
    } finally {
        console.timeEnd('calculatePace');
    }
}

export async function detectConfusion(userAction, timeOnTask, errorPattern, topic) {
    console.time('detectConfusion');
    try {
        let confusionLevel = 'low';
        let intervention = null;
        
        if (timeOnTask > 120 || (errorPattern && errorPattern.length > 2)) {
            confusionLevel = 'high';
            const feedback = await generatePersonalizedFeedback(topic, errorPattern.join(', '), 'visual');
            intervention = feedback.feedback;
        } else if (timeOnTask > 60 || (errorPattern && errorPattern.length > 0)) {
            confusionLevel = 'medium';
            intervention = 'Offer Hint';
        }
        
        return { confusionLevel, intervention };
    } catch (error) {
        console.error('Error in detectConfusion:', error);
        return { confusionLevel: 'unknown', intervention: null };
    } finally {
        console.timeEnd('detectConfusion');
    }
}

export function adjustTeachingStyle(userPreference, performanceData) {
    console.time('adjustTeachingStyle');
    try {
        let style = userPreference || 'textual';
        if (performanceData && performanceData.recentFailures > 2) {
            style = style === 'analogical' ? 'visual' : 'analogical';
        }
        return { style };
    } catch (error) {
        console.error('Error in adjustTeachingStyle:', error);
        return { style: 'textual' };
    } finally {
        console.timeEnd('adjustTeachingStyle');
    }
}
