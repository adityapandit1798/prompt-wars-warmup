/**
 * Progress Dashboard Component.
 * @module components/ProgressDashboard
 */
import { store } from '../store.js';

export function createProgressDashboard(container) {
    let element = container;

    function render() {
        const appState = store.getState();
        const streak = appState.history.streak || 0;
        const completedCount = appState.history.completedConcepts.length;
        const totalXp = Math.floor(appState.history.timeSpentSeconds / 10); // Fake XP metric based on time

        element.innerHTML = `
            <div class="dashboard" style="max-width: 600px; margin: 0 auto; padding-top: 2rem;">
                
                <div style="display: flex; align-items: center; gap: 1.5rem; border-bottom: 2px solid var(--border-color); padding-bottom: 2rem; margin-bottom: 2rem;">
                    <div style="width: 100px; height: 100px; background: var(--secondary-light); border: 2px solid var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 3rem;">
                        😎
                    </div>
                    <div>
                        <h2 style="margin: 0 0 0.5rem; font-size: 2rem; font-weight: 800; color: var(--text-main);">${appState.userProfile.name}</h2>
                        <p style="margin: 0; color: var(--text-muted); font-weight: 700;">Joined just now</p>
                    </div>
                </div>
                
                <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; color: var(--text-main);">Statistics</h3>
                
                <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 3rem;">
                    <div style="border: 2px solid var(--border-color); border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                        <div style="font-size: 2rem; color: var(--warning);">🔥</div>
                        <div>
                            <h3 style="margin: 0; font-size: 1.5rem; font-weight: 800;">${streak}</h3>
                            <div style="font-weight: 700; color: var(--text-muted); font-size: 0.9rem;">Day Streak</div>
                        </div>
                    </div>
                    
                    <div style="border: 2px solid var(--border-color); border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem;">
                        <div style="font-size: 2rem; color: var(--warning);">👑</div>
                        <div>
                            <h3 style="margin: 0; font-size: 1.5rem; font-weight: 800;">${completedCount}</h3>
                            <div style="font-weight: 700; color: var(--text-muted); font-size: 0.9rem;">Crowns</div>
                        </div>
                    </div>
                    
                    <div style="border: 2px solid var(--border-color); border-radius: 16px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; grid-column: 1 / -1;">
                        <div style="font-size: 2rem; color: var(--secondary);">⚡</div>
                        <div>
                            <h3 style="margin: 0; font-size: 1.5rem; font-weight: 800;">${totalXp} XP</h3>
                            <div style="font-weight: 700; color: var(--text-muted); font-size: 0.9rem;">Total XP</div>
                        </div>
                    </div>
                </div>

                <div class="mastery-section">
                    <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; color: var(--text-main);">Topic Mastery</h3>
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        ${appState.topics.map(t => `
                            <div>
                                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.5rem;">
                                    <span style="font-weight: 800; color: var(--text-main); font-size: 1.1rem;">${t.name}</span>
                                    <span style="font-weight: 700; color: var(--text-muted);">${t.progress}%</span>
                                </div>
                                <div style="height: 16px; background: var(--border-color); border-radius: 8px; overflow: hidden;">
                                    <div style="height: 100%; width: ${t.progress}%; background: ${t.progress > 80 ? 'var(--warning)' : 'var(--primary)'}; border-radius: 8px; position: relative;">
                                        <div style="height: 4px; width: 90%; background: rgba(255,255,255,0.3); margin: 2px auto; border-radius: 2px;"></div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    render();

    return {
        render,
        destroy: () => {
            element.innerHTML = '';
        }
    };
}
