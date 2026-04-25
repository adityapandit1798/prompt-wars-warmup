/**
 * Lesson View Component.
 * @module components/LessonView
 */
import { generateExplanation } from '../contentGenerator.js';
import { store } from '../store.js';

export function createLessonView(container, lessonId) {
    let state = {
        lessonId,
        loading: true,
        content: null,
        isConfused: false,
        topic: null
    };
    let element = container;
    
    async function init() {
        const globalState = store.getState();
        state.topic = globalState.topics.find(t => t.id === lessonId);
        const topicName = state.topic ? state.topic.name : lessonId;
        const difficulty = state.topic ? state.topic.difficulty : 'beginner';
        
        render(); // render loading state
        
        const data = await generateExplanation(topicName, difficulty, 'textual');
        state.content = data;
        
        // Enhance with simulated "simplified" version for "I'm confused" state
        if (!state.content.simplified) {
            state.content.simplified = "Let's simplify: " + state.content.explanation.substring(0, 100) + "... It essentially helps you solve specific programming problems more easily.";
        }
        
        state.loading = false;
        render();
    }

    function getReadingTime(text) {
        const words = (text || '').split(/\s+/).length;
        const wpm = 200;
        return Math.max(1, Math.ceil(words / wpm));
    }

    function render() {
        if (state.loading) {
            element.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                    <div style="font-size: 2rem; margin-bottom: 1rem; animation: pulse 1.5s infinite;">⏳</div>
                    <p>Loading lesson content for ${state.topic ? state.topic.name : state.lessonId}...</p>
                </div>
                <style>@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } }</style>
            `;
            return;
        }

        const textToRead = state.isConfused ? state.content.simplified : state.content.explanation;
        const time = getReadingTime(textToRead);
        const topicName = state.topic ? state.topic.name : state.lessonId;
        
        element.innerHTML = `
            <div class="lesson-view" style="animation: fadeIn 0.4s ease; max-width: 800px; margin: 0 auto;">
                <button id="btn-back" style="background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; padding: 0;">
                    <span class="material-icons">arrow_back</span> Back to topics
                </button>
                
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 1.5rem;">
                    <h2 style="font-size: 2rem; margin: 0;">${topicName}</h2>
                    <span style="color: var(--text-muted); font-size: 0.9rem; background: var(--border-color); padding: 0.25rem 0.5rem; border-radius: 4px;">⏱ ~${time} min read</span>
                </div>
                
                <div aria-live="polite" class="explanation-content" style="font-size: 1.15rem; line-height: 1.7; margin-bottom: 2rem; color: var(--text-main);">
                    <p>${textToRead}</p>
                </div>
                
                ${state.content.examples && state.content.examples.length > 0 ? `
                <div class="example-box" style="background: var(--surface-color); padding: 1.5rem; border-left: 4px solid var(--primary); margin-bottom: 2rem; border-radius: 0 8px 8px 0;">
                    <h4 style="margin: 0 0 1rem; color: var(--primary);">Code Example</h4>
                    <pre style="background: #1e293b; color: #f8fafc; padding: 1rem; border-radius: 6px; overflow-x: auto; margin: 0; font-family: monospace;"><code>${state.content.examples[0]}</code></pre>
                </div>
                ` : ''}

                <div class="action-buttons" style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 3rem;">
                    <button id="btn-confused" style="padding: 0.75rem 1.25rem; border-radius: 6px; border: 1px solid #ef4444; color: ${state.isConfused ? 'white' : '#ef4444'}; background: ${state.isConfused ? '#ef4444' : 'transparent'}; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                        🤔 ${state.isConfused ? 'Back to detailed view' : "I'm confused"}
                    </button>
                    
                    <button id="btn-next" style="padding: 0.75rem 1.5rem; border-radius: 6px; border: none; background: #22c55e; color: white; font-weight: 600; cursor: pointer; margin-left: auto; transition: transform 0.2s; box-shadow: 0 4px 6px rgba(34,197,94,0.2);">
                        Take Quiz →
                    </button>
                </div>
            </div>
            <style>
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                button:hover { opacity: 0.9; }
                #btn-next:hover { transform: translateY(-2px); }
            </style>
        `;
    }

    function handleEvent(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        if (btn.id === 'btn-back') {
            window.location.hash = '/topics';
        } else if (btn.id === 'btn-confused') {
            state.isConfused = !state.isConfused;
            // Record confusion event
            if (state.isConfused) {
                const appState = store.getState();
                store.setState({
                    history: {
                        ...appState.history,
                        confusionEvents: [...appState.history.confusionEvents, { topic: state.lessonId, time: Date.now() }]
                    }
                });
            }
            render();
        } else if (btn.id === 'btn-next') {
            window.location.hash = `/quiz/${state.lessonId}`;
        }
    }

    element.addEventListener('click', handleEvent);
    init();

    return {
        render,
        destroy: () => {
            element.removeEventListener('click', handleEvent);
            element.innerHTML = '';
        }
    };
}
