/**
 * Application configuration settings and feature flags.
 * @module config
 */

export const config = {
    api: {
        GEMINI_API_KEY: 'AIzaSyAiml-u5D9oY5Z_xOZd2G8AKATckt_-Ibo', // Placeholder for actual API key
        timeoutMs: 15000
    },
    constants: {
        storageKey: 'learning_companion_state',
        maxHistoryItems: 100,
        defaultPace: 'medium'
    },
    features: {
        enableVoiceInput: false,
        enableAnalytics: true,
        experimentalSocraticMode: true
    }
};
