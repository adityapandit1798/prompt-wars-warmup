/**
 * Learning analytics module.
 * @module analytics
 */

import { store } from './store.js';

/**
 * Tracks a learning event and logs it to the state and console.
 * @param {string} eventType - The type of event (e.g., 'concept_completed', 'quiz_failed').
 * @param {Object} metadata - Additional data regarding the event.
 */
export function trackEvent(eventType, metadata) {
    console.time('trackEvent');
    try {
        const event = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            timestamp: Date.now(),
            type: eventType,
            data: metadata
        };
        
        
        const state = store.getState();
        // Keep events trackable, limit size if needed
        const currentEvents = state.history.events || [];
        
        // Non-mutating update for the store
        store.setState({
            history: {
                ...state.history,
                events: [...currentEvents, event].slice(-100) // Keep last 100
            }
        });
    } catch (error) {
        console.error('Error tracking event:', error);
    } finally {
        console.timeEnd('trackEvent');
    }
}

/**
 * Computes learning metrics for a user.
 * @param {string} userId - The ID of the user.
 * @returns {{averagePace: string, confusionRate: number, masteryLevel: string}} Learning metrics.
 */
export function getLearningMetrics(userId) {
    console.time('getLearningMetrics');
    try {
        // Here we would typically aggregate data for the specific userId.
        // For demonstration, returning mock metrics.
        const averagePace = 'medium';
        const confusionRate = 0.15; // 15%
        const masteryLevel = 'intermediate';
        
        return { averagePace, confusionRate, masteryLevel };
    } catch (error) {
        console.error('Error calculating learning metrics:', error);
        return { averagePace: 'unknown', confusionRate: 0, masteryLevel: 'unknown' };
    } finally {
        console.timeEnd('getLearningMetrics');
    }
}

/**
 * Generates a comprehensive JSON progress report based on current state.
 * @returns {string} JSON formatted progress report.
 */
export function generateProgressReport() {
    console.time('generateProgressReport');
    try {
        const state = store.getState();
        const report = {
            generatedAt: new Date().toISOString(),
            metrics: getLearningMetrics('current_user'),
            completedConceptsCount: state.history.completedConcepts.length,
            timeSpentSeconds: state.history.timeSpentSeconds,
            confusionEvents: state.history.confusionEvents.length
        };
        
        return JSON.stringify(report, null, 2);
    } catch (error) {
        console.error('Error generating progress report:', error);
        return JSON.stringify({ error: 'Could not generate report' });
    } finally {
        console.timeEnd('generateProgressReport');
    }
}

/**
 * Renders progress charts into a specified DOM container.
 * @param {string} containerId - The ID of the DOM element to render into.
 * @returns {boolean} True if visualization succeeded, false otherwise.
 */
export function visualizeProgress(containerId) {
    console.time('visualizeProgress');
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found for visualization.`);
            return false;
        }
        
        // Mock visualization rendering
        container.innerHTML = `
            <div class="analytics-chart" style="margin-top: 1rem;">
                <h4 style="margin-bottom: 0.5rem; font-weight: 500;">Overall Progress</h4>
                <div style="width: 100%; height: 20px; background: var(--border-color, #e2e8f0); border-radius: 10px; overflow: hidden;">
                    <div style="width: 65%; height: 100%; background: var(--primary, #2563eb); transition: width 0.3s ease;"></div>
                </div>
                <p style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-muted);">65% Completion</p>
            </div>
        `;
        return true;
    } catch (error) {
        console.error('Error visualizing progress:', error);
        return false;
    } finally {
        console.timeEnd('visualizeProgress');
    }
}
