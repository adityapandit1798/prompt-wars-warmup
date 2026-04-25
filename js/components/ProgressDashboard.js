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
            <div class="dashboard" style="width: 100%; padding-top: 2rem;">
                
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

                <style>.dashboard-split { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; } @media (max-width: 768px) { .dashboard-split { grid-template-columns: 1fr; } }</style>
                <div class="dashboard-split">
                    <div class="mastery-section">
                        <h3 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;"><span class="material-icons" style="color: var(--primary);">emoji_events</span> Achievements</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                            <div style="border: 2px solid var(--warning); background: var(--warning-light, #FFF8E1); border-radius: 16px; padding: 1rem; display: flex; align-items: center; gap: 1rem; opacity: ${streak >= 7 ? '1' : '0.5'}; filter: ${streak >= 7 ? 'none' : 'grayscale(1)'};">
                                <span style="font-size: 2.5rem;">🔥</span>
                                <div><div style="font-weight: 800;">7-Day Streak</div><div style="font-size: 0.8rem; color: var(--text-muted);">Study 7 days in a row</div></div>
                            </div>
                            <div style="border: 2px solid var(--secondary); background: var(--secondary-light, #E1F5FE); border-radius: 16px; padding: 1rem; display: flex; align-items: center; gap: 1rem; opacity: ${totalXp >= 100 ? '1' : '0.5'}; filter: ${totalXp >= 100 ? 'none' : 'grayscale(1)'};">
                                <span style="font-size: 2.5rem;">⚡</span>
                                <div><div style="font-weight: 800;">XP Earner</div><div style="font-size: 0.8rem; color: var(--text-muted);">Earn 100+ Total XP</div></div>
                            </div>
                            <div style="border: 2px solid var(--primary); background: var(--primary-light, #E8F5E9); border-radius: 16px; padding: 1rem; display: flex; align-items: center; gap: 1rem; opacity: ${appState.history.sessionStats?.skipped === 0 && appState.history.sessionStats?.correct > 0 ? '1' : '0.5'}; filter: ${appState.history.sessionStats?.skipped === 0 && appState.history.sessionStats?.correct > 0 ? 'none' : 'grayscale(1)'};">
                                <span style="font-size: 2.5rem;">🛡️</span>
                                <div><div style="font-weight: 800;">No Skips</div><div style="font-size: 0.8rem; color: var(--text-muted);">Complete a quiz without skipping</div></div>
                            </div>
                            <div style="border: 2px solid #9c27b0; background: #f3e5f5; border-radius: 16px; padding: 1rem; display: flex; align-items: center; gap: 1rem; opacity: ${appState.topics.some(t => t.name.includes('JavaScript') && t.progress >= 80) ? '1' : '0.5'}; filter: ${appState.topics.some(t => t.name.includes('JavaScript') && t.progress >= 80) ? 'none' : 'grayscale(1)'};">
                                <span style="font-size: 2.5rem;">🟨</span>
                                <div><div style="font-weight: 800;">JS Master</div><div style="font-size: 0.8rem; color: var(--text-muted);">Reach 80% mastery in JS</div></div>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <h3 style="font-size: 1.5rem; font-weight: 800; margin: 0; color: var(--text-main); display: flex; align-items: center; gap: 8px;"><span class="material-icons" style="color: var(--secondary);">analytics</span> Topic Mastery</h3>
                            <button class="btn-duo btn-secondary" style="width: auto; padding: 8px 16px; font-size: 0.9rem; display: flex; align-items: center; gap: 4px;" onclick="window.location.hash='/weak-areas'"><span class="material-icons" style="font-size: 1.1rem;">fitness_center</span> Practice Weak Areas</button>
                        </div>
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
                    
                    <div class="leaderboard-section">
                        <div style="border: 2px solid var(--border-color); border-radius: 20px; padding: 1.5rem; background: white;">
                            <h3 style="margin-top: 0; margin-bottom: 1rem; font-weight: 800; color: var(--warning); display: flex; align-items: center; gap: 8px;"><span class="material-icons">leaderboard</span> Top Learners</h3>
                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                <div style="display: flex; align-items: center; justify-content: space-between; font-weight: 800; background: var(--primary-light); padding: 8px 12px; border-radius: 12px; border: 2px solid var(--primary);">
                                    <div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 1.5rem;">🥇</span> <span>AlexDev</span></div>
                                    <span style="color: var(--primary-dark);">4,250 XP</span>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-between; font-weight: 800; padding: 8px 12px;">
                                    <div style="display: flex; align-items: center; gap: 8px;"><span style="font-size: 1.5rem;">🥈</span> <span>Sarah_Codes</span></div>
                                    <span style="color: var(--text-muted);">3,900 XP</span>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-between; font-weight: 800; padding: 8px 12px; border: 2px dashed var(--secondary); border-radius: 12px; background: var(--secondary-light);">
                                    <div style="display: flex; align-items: center; gap: 8px;"><span style="color: var(--secondary); font-weight: 900;">#3</span> <span>${appState.userProfile.name}</span></div>
                                    <span style="color: var(--secondary-dark);">${totalXp} XP</span>
                                </div>
                                <div style="display: flex; align-items: center; justify-content: space-between; font-weight: 800; padding: 8px 12px;">
                                    <div style="display: flex; align-items: center; gap: 8px;"><span style="color: var(--text-muted); font-weight: 900;">#4</span> <span>CodeNinja</span></div>
                                    <span style="color: var(--text-muted);">2,100 XP</span>
                                </div>
                            </div>
                        </div>
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
