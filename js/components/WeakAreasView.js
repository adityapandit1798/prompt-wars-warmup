/**
 * Weak Areas Dashboard Component.
 * @module components/WeakAreasView
 */
import { store } from '../store.js';

export function createWeakAreasView(container) {
    let state = {
        weakAreas: []
    };
    let element = container;

    function analyzeWeakAreas() {
        const history = store.getState().history;
        const topicStats = history.weakTopics || [];
        
        // Flag topic as "weak" if: accuracy < 60% OR skippedCount >= 2 OR wrongAnswers >= 3
        const flagged = topicStats.filter(t => t.accuracy < 60 || t.skipCount >= 2 || t.wrongCount >= 3);
        
        // Sort by lowest accuracy first, then most skipped
        flagged.sort((a, b) => {
            if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
            return b.skipCount - a.skipCount;
        });
        
        state.weakAreas = flagged;
    }

    function render() {
        analyzeWeakAreas();
        
        if (state.weakAreas.length === 0) {
            element.innerHTML = `
                <div style="text-align: center; padding: 5rem 2rem; max-width: 600px; margin: 0 auto; animation: fadeIn 0.5s ease;">
                    <div style="font-size: 6rem; margin-bottom: 1rem; animation: bounce 2s infinite;">🎉</div>
                    <h2 style="font-size: 2.2rem; font-weight: 900; color: var(--text-main); margin-bottom: 1rem;">No weak spots!</h2>
                    <p style="font-size: 1.2rem; color: var(--text-muted); font-weight: 700; margin-bottom: 2rem;">You're absolutely crushing it. Keep practicing your regular topics!</p>
                    <button class="btn-duo" onclick="window.location.hash='/topics'" style="width: auto; padding: 14px 40px;">Back to Topics</button>
                    
                    <style>@keyframes fall { 0% { transform: translateY(-100vh) rotate(0deg); } 100% { transform: translateY(100vh) rotate(360deg); } }</style>
                    <div style="position: fixed; inset: 0; pointer-events: none; background: url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><circle cx=\\'50\\' cy=\\'50\\' r=\\'10\\' fill=\\'%2358CC02\\'/></svg>') space; opacity: 0.6; animation: fall 4s linear infinite; z-index: -1;"></div>
                </div>
            `;
            return;
        }

        element.innerHTML = `
            <div style="width: 100%; padding-top: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
                    <div>
                        <h2 style="font-size: 2rem; font-weight: 900; color: var(--text-main); margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 12px;">
                            <span class="material-icons" style="color: var(--danger); font-size: 2.5rem;">fitness_center</span> 
                            Weak Areas
                        </h2>
                        <p style="color: var(--text-muted); font-weight: 700; margin: 0; font-size: 1.1rem;">Topics that need a little extra love.</p>
                    </div>
                    <button id="btn-refresh" class="btn-duo btn-secondary" style="width: auto; padding: 10px 20px; font-size: 0.9rem; display: flex; align-items: center; gap: 8px;">
                        <span class="material-icons" style="font-size: 1.2rem;">refresh</span> Recalculate
                    </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    ${state.weakAreas.map(topic => {
                        let barColor = 'var(--danger)';
                        if (topic.accuracy >= 80) barColor = 'var(--primary)';
                        else if (topic.accuracy >= 50) barColor = 'var(--warning)';
                        
                        const daysAgo = Math.floor((Date.now() - (topic.lastAttempted || Date.now())) / (1000 * 60 * 60 * 24));
                        const timeStr = daysAgo === 0 ? 'Today' : `${daysAgo} days ago`;
                        
                        return `
                            <div class="topic-card" style="background: white; border: 2px solid var(--border-color); border-radius: 20px; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: transform 0.2s, box-shadow 0.2s;">
                                <div style="flex: 1; margin-right: 2rem;">
                                    <h3 style="margin: 0 0 0.5rem 0; font-size: 1.4rem; font-weight: 800; color: var(--text-main);">${topic.name || topic.topic}</h3>
                                    
                                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700; color: var(--text-muted);">
                                        <span style="color: var(--danger); display: flex; align-items: center; gap: 4px;"><span class="material-icons" style="font-size: 1.1rem;">close</span> ${topic.wrongCount} wrong</span>
                                        <span style="display: flex; align-items: center; gap: 4px;"><span class="material-icons" style="font-size: 1.1rem;">redo</span> ${topic.skipCount} skipped</span>
                                        <span style="display: flex; align-items: center; gap: 4px;"><span class="material-icons" style="font-size: 1.1rem;">schedule</span> ${timeStr}</span>
                                    </div>
                                    
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="flex: 1; max-width: 250px;">
                                            <div class="card-progress-bar" style="background: var(--border-color); height: 10px; margin: 0;">
                                                <div class="card-progress-fill" style="background: ${barColor}; width: ${topic.accuracy}%;"></div>
                                            </div>
                                        </div>
                                        <span style="font-size: 0.95rem; font-weight: 800; color: ${barColor};">${topic.accuracy}% Accuracy</span>
                                    </div>
                                </div>
                                
                                <button class="btn-duo btn-practice" data-topic="${topic.topic}" style="width: auto; padding: 12px 24px; font-size: 1rem; background: var(--secondary); box-shadow: 0 4px 0 var(--secondary-dark);">
                                    Practice Now
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            <style>
                .topic-card:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.06) !important; border-color: var(--border-dark); }
                .btn-practice:active { transform: translateY(4px); box-shadow: 0 0 0 transparent !important; }
            </style>
        `;
    }

    function handleEvent(e) {
        if (e.target.closest('#btn-refresh')) {
            render();
        }
        
        const practiceBtn = e.target.closest('.btn-practice');
        if (practiceBtn) {
            const topicId = practiceBtn.dataset.topic;
            // Launch specific topic to strengthen it
            window.location.hash = `/quiz/${topicId}`;
        }
    }

    element.addEventListener('click', handleEvent);
    render();

    return {
        render,
        destroy: () => {
            element.removeEventListener('click', handleEvent);
            element.innerHTML = '';
        }
    };
}
