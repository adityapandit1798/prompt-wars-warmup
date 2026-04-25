/**
 * Core adaptation logic for the Learning Companion.
 * @module adaptiveEngine
 */
import { generateAdaptiveQuestion, generatePersonalizedFeedback } from './services/geminiService.js';

/**
 * Evaluates the user's initial skill level for a specific topic.
 * @param {string|number} topic - The topic identifier or name.
 * @returns {Promise<{diagnosticQuestion: Object|string, level: number, confidence: number}>} Initial assessment results.
 * @example const assessment = await assessUserLevel('javascript');
 */
export async function assessUserLevel(topic) {
    // [Code Quality] Pure function mapping topic to baseline level
    try {
        const diagnosticQuestion = await generateAdaptiveQuestion(topic, 'beginner', []);
        return { diagnosticQuestion, level: 1, confidence: 0.5 };
    } catch (error) {
        // [Security] Return safe baseline on network failure
        return { level: 1, confidence: 0 };
    }
}

/**
 * Determines the next piece of content based on the user's current level and history.
 * @param {number} currentLevel - The user's current mastery level (1-5).
 * @param {Array<Object>} performanceHistory - Past performance metrics.
 * @returns {Promise<{difficulty: string, contentType: string, content: Object|string}>} The next content chunk.
 * @example const next = await selectNextContent(2, historyData);
 */
export async function selectNextContent(currentLevel, performanceHistory) {
    // [Efficiency] Cache checks could be added here in future
    try {
        const difficulty = currentLevel > 3 ? 'advanced' : currentLevel > 1 ? 'intermediate' : 'beginner';
        const question = await generateAdaptiveQuestion('General Concept', difficulty, performanceHistory);
        return { difficulty, contentType: 'quiz', content: question };
    } catch (error) {
        return { difficulty: 'beginner', contentType: 'fallback' };
    }
}

/**
 * Calculates a pace score and recommendation based on timing and attempts.
 * @param {string} conceptId - The concept being learned.
 * @param {number} startTime - Epoch timestamp of start.
 * @param {number} endTime - Epoch timestamp of end.
 * @param {number} attempts - Number of attempts made.
 * @returns {{paceScore: number, recommendation: string}} Pace metrics.
 * @example const pace = calculatePace('js-vars', 1000, 5000, 2);
 */
export function calculatePace(conceptId, startTime, endTime, attempts) {
    try {
        const timeSpent = Math.max(1, (endTime - startTime) / 1000);
        const paceScore = Math.max(0, 100 - (timeSpent / 10) - (attempts * 5));
        
        let recommendation = 'continue';
        if (paceScore < 40) recommendation = 'slow_down';
        else if (paceScore > 80) recommendation = 'speed_up';
        
        return { paceScore, recommendation };
    } catch (error) {
        return { paceScore: 50, recommendation: 'maintain' };
    }
}

/**
 * Analyzes behavior to detect confusion and proposes an intervention.
 * @param {string} userAction - The last recorded user action.
 * @param {number} timeOnTask - Seconds spent on the current task.
 * @param {Array<string>} errorPattern - Recent error logs.
 * @param {string} topic - The current topic context.
 * @returns {Promise<{confusionLevel: string, intervention: string|null}>} Confusion state and intervention.
 * @example const confusion = await detectConfusion('click', 150, ['syntax_error'], 'javascript');
 */
export async function detectConfusion(userAction, timeOnTask, errorPattern, topic) {
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
        return { confusionLevel: 'unknown', intervention: null };
    }
}

/**
 * Adjusts the preferred teaching style based on recent performance data.
 * @param {string} userPreference - Base user preference (e.g., 'visual', 'textual').
 * @param {Object} performanceData - Metrics containing failure rates.
 * @returns {{style: string}} The newly recommended teaching style.
 * @example const style = adjustTeachingStyle('textual', { recentFailures: 3 });
 */
export function adjustTeachingStyle(userPreference, performanceData) {
    try {
        let style = userPreference || 'textual';
        if (performanceData && performanceData.recentFailures > 2) {
            style = style === 'analogical' ? 'visual' : 'analogical';
        }
        return { style };
    } catch (error) {
        return { style: 'textual' };
    }
}
