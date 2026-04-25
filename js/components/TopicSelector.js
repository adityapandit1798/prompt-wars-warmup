/**
 * Topic Selector Component.
 * @module components/TopicSelector
 */
import { store } from '../store.js';

export function createTopicSelector(container) {
    let state = {
        topics: store.getState().topics
    };
    let element = container;
    
    function render() {
        element.innerHTML = `
            <div class="topic-selector" style="max-width: 600px; margin: 0 auto; padding-top: 2rem;">
                
                <div style="text-align: center; margin-bottom: 3rem;">
                    <div class="character-mascot" style="font-size: 5rem; animation: float 3s ease-in-out infinite;">🦉</div>
                    <div class="speech-bubble" style="margin-top: 1rem;">
                        What do you want to learn today?
                    </div>
                </div>
                
                <div class="topic-grid" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    ${state.topics.map((t) => {
                        const isMastered = t.progress >= 80;
                        const bgColor = isMastered ? 'var(--warning)' : 'var(--primary)';
                        const bgDark = isMastered ? 'var(--warning-dark)' : 'var(--primary-dark)';
                        const icon = isMastered ? '👑' : '⭐';
                        
                        return `
                            <button class="topic-card" data-id="${t.id}" style="text-align: left; background: ${bgColor}; border: none; border-radius: 20px; padding: 1.5rem 2rem; color: white; cursor: pointer; box-shadow: 0 6px 0 ${bgDark}; transition: transform 0.1s, box-shadow 0.1s; display: flex; justify-content: space-between; align-items: center; outline: none; font-family: inherit;">
                                <div>
                                    <h3 style="margin: 0; font-size: 1.5rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${t.name}</h3>
                                    <div style="font-weight: 700; opacity: 0.9; margin-top: 0.5rem; font-size: 1.1rem;">Level: ${t.difficulty}</div>
                                </div>
                                
                                <div style="background: rgba(0,0,0,0.15); border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: inset 0 4px 0 rgba(0,0,0,0.1);">
                                    ${icon}
                                </div>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
            <style>
                .topic-card:active { transform: translateY(6px); box-shadow: 0 0 0 transparent !important; }
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
    
    render();

    return {
        render,
        destroy: () => {
            element.removeEventListener('click', handleEvent);
            element.removeEventListener('keydown', handleEvent);
            element.innerHTML = '';
        }
    };
}
