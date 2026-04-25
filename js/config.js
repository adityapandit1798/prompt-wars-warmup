/**
 * Application configuration settings and feature flags.
 * @module config
 */

export const config = {
    api: {
        GEMINI_API_KEY: 'AIzaSyD23gbk9ORvxMfd4s5S-DMV0CEM0RPI78o', // Placeholder for actual API key
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
