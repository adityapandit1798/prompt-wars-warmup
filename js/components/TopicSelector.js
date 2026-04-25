/**
 * Topic Selector Component.
 * @module components/TopicSelector
 */
import { store } from '../store.js';
import { generateMascotGreeting } from '../services/geminiService.js';

export function createTopicSelector(container) {
    let state = {
        topics: store.getState().topics,
        greetingMessage: 'What do you want to learn today?',
        isGreetingLoading: true
    };
    let element = container;
    
    async function init() {
        render(); // Initial load
        
        const appState = store.getState();
        const userName = appState.userProfile.name || 'Learner';
        const weakAreas = appState.topics.filter(t => t.progress < 40 && t.progress > 0).map(t => t.name);
        
        const res = await generateMascotGreeting(userName, weakAreas);
        if (res && res.message) {
            state.greetingMessage = res.message;
        }
        state.isGreetingLoading = false;
        render();
    }

    function render() {
        const quotes = ["Every expert was once a beginner.", "Small steps every day.", "Syntax errors are just learning opportunities!"];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        element.innerHTML = `
            <div class="topic-selector" style="width: 100%; padding-top: 1rem;">
                
                <div class="daily-banner">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="material-icons" style="font-size: 2.2rem; color: var(--warning);">emoji_events</span>
                        <div>
                            <div style="font-size: 1.2rem;">Daily Challenge</div>
                            <div style="font-size: 0.95rem; font-weight: 600; opacity: 0.9;">Complete 3 lessons today to earn a chest!</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.2); padding: 8px 16px; border-radius: 999px;">
                        <span class="material-icons">timer</span> <span style="font-variant-numeric: tabular-nums;">12:45:00</span>
                    </div>
                </div>

                <div style="text-align: center; margin-bottom: 3rem; display: flex; flex-direction: column; align-items: center;">
                    <div style="display: flex; gap: 1rem; align-items: flex-end;">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div class="character-mascot" style="font-size: 6rem; animation: float 3s ease-in-out infinite;">🦉</div>
                            <div style="background: var(--warning); color: white; font-size: 0.75rem; font-weight: 900; padding: 4px 10px; border-radius: 999px; margin-top: -15px; z-index: 10; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">DUO - YOUR AI TUTOR</div>
                        </div>
                        <div class="speech-bubble" style="margin-bottom: 2rem; max-width: 300px; text-align: left; position: relative;">
                            ${state.isGreetingLoading ? '<span class="material-icons" style="animation: spin 1s linear infinite;">hourglass_empty</span> Thinking...' : state.greetingMessage}
                            <span class="material-icons" style="position: absolute; top: 8px; right: 8px; color: var(--border-dark); cursor: pointer; font-size: 1.2rem;" title="Mute/Unmute">volume_up</span>
                        </div>
                    </div>
                    <div style="color: var(--text-muted); font-weight: 700; font-style: italic; margin-top: 1.5rem; font-size: 1.1rem;">"${randomQuote}"</div>
                </div>
                
                <h2 style="font-weight: 900; font-size: 1.8rem; margin-bottom: 1.5rem; color: var(--text-main);">Jump back in</h2>
                
                <div class="topic-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                    ${state.topics.map((t) => {
                        const progressLevel = t.progress || 0;
                        const isMastered = progressLevel >= 80;
                        
                        let bgColor, bgDark, emoji, desc;
                        const name = t.name.toLowerCase();
                        if (name.includes('javascript') || name.includes('js')) { bgColor = '#f7df1e'; bgDark = '#d4be10'; emoji = '🟨'; desc = "Master variables, loops, and async logic."; }
                        else if (name.includes('python')) { bgColor = '#3776ab'; bgDark = '#255a85'; emoji = '🐍'; desc = "Learn Python syntax and data structures."; }
                        else if (name.includes('html') || name.includes('css')) { bgColor = '#e34f26'; bgDark = '#b33d1d'; emoji = '🎨'; desc = "Build and style the web."; }
                        else if (name.includes('git')) { bgColor = '#f05032'; bgDark = '#bd3d25'; emoji = '🐙'; desc = "Version control and collaboration."; }
                        else { bgColor = isMastered ? 'var(--warning)' : 'var(--primary)'; bgDark = isMastered ? 'var(--warning-dark)' : 'var(--primary-dark)'; emoji = isMastered ? '👑' : '⭐'; desc = "Level up your programming skills."; }
                        
                        const textColor = name.includes('javascript') ? '#333333' : 'white';
                        const barFillColor = name.includes('javascript') ? '#333333' : 'white';
                        const btnBgColor = name.includes('javascript') ? 'white' : 'rgba(255,255,255,0.2)';
                        
                        return `
                            <button class="topic-card" data-id="${t.id}" style="text-align: left; background: ${bgColor}; border: none; border-radius: 20px; padding: 0; color: ${textColor}; cursor: pointer; box-shadow: 0 6px 0 ${bgDark}; display: flex; flex-direction: column; outline: none; font-family: inherit; overflow: hidden; height: 100%;">
                                <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 16px; width: 100%;">
                                    <div style="margin-bottom: 16px;">
                                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                                            <span style="font-size: 2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">${emoji}</span>
                                            <h3 style="margin: 0; font-size: 1.4rem; font-weight: 900; letter-spacing: 0.5px; line-height: 1.2;">${t.name}</h3>
                                        </div>
                                        <p style="margin: 0; font-size: 0.95rem; font-weight: 700; opacity: 0.85;">${desc}</p>
                                    </div>
                                    
                                    <div style="margin-top: auto;">
                                        <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                                            <div style="flex: 1;">
                                                <div class="card-progress-bar" style="background: rgba(0,0,0,0.1); height: 10px; margin-top: 0;">
                                                    <div class="card-progress-fill" style="background: ${barFillColor}; width: ${progressLevel}%;"></div>
                                                </div>
                                            </div>
                                            <span style="font-size: 0.9rem; font-weight: 800;">${Math.floor(progressLevel/10)}/10</span>
                                        </div>
                                        
                                        <div style="background: ${btnBgColor}; color: ${textColor}; border-radius: 12px; padding: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; text-align: center; width: 100%;">
                                            ${progressLevel > 0 ? 'Continue' : 'Start'}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
            <style>
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            </style>
        `;
    }

    function handleEvent(e) {
        const card = e.target.closest('.topic-card');
        if (card) {
            if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                e.preventDefault();
                window.location.hash = `/quiz/${card.dataset.id}`;
            }
        }
    }

    element.addEventListener('click', handleEvent);
    element.addEventListener('keydown', handleEvent);
    
    init();

    return {
        render,
        destroy: () => {
            element.removeEventListener('click', handleEvent);
            element.removeEventListener('keydown', handleEvent);
            element.innerHTML = '';
        }
    };
}
