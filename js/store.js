/**
 * State management system for the application.
 * @module store
 */

import { config } from './config.js';

const initialState = {
    topics: [
        {id: 'js-basics', name: 'JavaScript Basics', difficulty: 'beginner', progress: 0},
        {id: 'js-promises', name: 'Async/Await & Promises', difficulty: 'intermediate', progress: 0},
        {id: 'python-basics', name: 'Python Fundamentals', difficulty: 'beginner', progress: 0},
        {id: 'react-hooks', name: 'React Hooks', difficulty: 'advanced', progress: 0}
    ],
    userProfile: {
        name: 'Learner',
        learningPreferences: ['visual'], // Options: visual, analogical, textual
        paceSettings: config.constants.defaultPace, // Options: fast, medium, slow
        interests: ['technology', 'coding']
    },
    learningSession: {
        currentTopic: null,
        difficultyLevel: 'beginner',
        progress: 0
    },
    history: {
        completedConcepts: [],
        timeSpentSeconds: 0, 
        confusionEvents: [], 
        events: [],
        questionHistory: [], 
        streak: 0, 
        lastStudied: {},
        hearts: 5,
        dailyXp: 0,
        dailyGoal: 50,
        skippedQuestions: [],
        weakTopics: [],
        reviewHistory: [],
        sessionStats: { totalQuestions: 0, correct: 0, wrong: 0, skipped: 0, avgTime: 0 }
    }
};

class Store {
    constructor() {
        this.state = this.loadFromLocalStorage() || JSON.parse(JSON.stringify(initialState));
        this.listeners = [];
        
        // Legacy migration
        if (this.state.history) {
            if (typeof this.state.history.streak === 'undefined') this.state.history.streak = 0;
            if (typeof this.state.history.hearts === 'undefined') this.state.history.hearts = 5;
            if (typeof this.state.history.dailyXp === 'undefined') this.state.history.dailyXp = 0;
            if (typeof this.state.history.dailyGoal === 'undefined') this.state.history.dailyGoal = 50;
            if (!this.state.history.skippedQuestions) this.state.history.skippedQuestions = [];
            if (!this.state.history.weakTopics) this.state.history.weakTopics = [];
            if (!this.state.history.reviewHistory) this.state.history.reviewHistory = [];
            if (!this.state.history.sessionStats) this.state.history.sessionStats = { totalQuestions: 0, correct: 0, wrong: 0, skipped: 0, avgTime: 0 };
        }
    }

    getState() {
        return JSON.parse(JSON.stringify(this.state));
    }

    setState(newState) {
        const merge = (target, source) => {
            for (const key of Object.keys(source)) {
                if (source[key] instanceof Object && !Array.isArray(source[key])) {
                    target[key] = target[key] || {};
                    Object.assign(target[key], merge(target[key], source[key]));
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        };

        this.state = merge(this.getState(), newState);
        this.persistToLocalStorage();
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        const stateCopy = this.getState();
        for (const listener of this.listeners) {
            listener(stateCopy);
        }
    }

    persistToLocalStorage() {
        try {
            const serializedState = JSON.stringify(this.state);
            localStorage.setItem(config.constants.storageKey, serializedState);
        } catch (err) {
            console.error('Could not save state to local storage', err);
        }
    }

    loadFromLocalStorage() {
        try {
            const serializedState = localStorage.getItem(config.constants.storageKey);
            if (serializedState === null) return null;
            return JSON.parse(serializedState);
        } catch (err) {
            return null;
        }
    }
}

export const store = new Store();
