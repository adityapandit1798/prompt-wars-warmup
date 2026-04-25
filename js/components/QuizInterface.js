/**
 * Quiz Interface Component.
 * @module components/QuizInterface
 */
import { analyzeAnswer, generateHint, generateELI5, generateFollowUpQuestion } from '../services/geminiService.js';
import { calculateSkillLevel } from '../adaptationLogic.js';
import { sanitizeInput } from '../utils.js';
import { store } from '../store.js';
import { localQuestions } from '../../data/questions.js';

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'skip') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.2);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.2);
        }
    } catch (e) {
    }
}

export function createQuizInterface(container, lessonId) {
    let state = {
        lessonId,
        topicName: '',
        userName: 'Learner',
        loading: true,
        quiz: null,
        selectedOption: null,
        isAnswered: false,
        isAnalyzing: false,
        startTime: Date.now(),
        timeSpent: 0,
        timeLimit: 60,
        timeOut: false,
        currentLevel: 1,
        masteryScore: 0,
        analysisResult: null,
        showXpAnim: false,
        gameOver: false,
        showConfetti: false,
        stylePref: 'visual',
        pacePref: 'medium',
        pacePref: 'medium',
        owlMessage: '',
        explanationBox: null,
        isFollowUp: false,
        skipsRemaining: 3
    };
    let element = container;
    let timerInterval;

    async function init() {
        const globalState = store.getState();
        const topic = globalState.topics.find(t => t.id === lessonId);
        state.topicName = topic ? topic.name : lessonId;
        state.masteryScore = topic ? topic.progress : 0;
        
        const hearts = globalState.history.hearts ?? 5;
        if (false && hearts <= 0) { // Disabled for hackathon demo
            state.gameOver = true;
            state.loading = false;
            render();
            return;
        }
        
        const profile = globalState.userProfile;
        state.userName = profile.name || 'Learner';
        state.stylePref = (profile.learningPreferences && profile.learningPreferences[0]) || 'visual';
        state.pacePref = profile.paceSettings || 'medium';
        
        state.currentLevel = state.masteryScore > 70 ? 3 : (state.masteryScore > 30 ? 2 : 1);
        
        await loadQuestion();
    }

    async function loadQuestion() {
        state.loading = true;
        render();
        
        const history = store.getState().history.events || [];
        const difficultyStr = state.currentLevel === 3 ? 'advanced' : (state.currentLevel === 2 ? 'intermediate' : 'beginner');
        
        if (!state.isFollowUp) {
            let available = [];
            
            if (state.lessonId === 'review') {
                state.topicName = 'Daily Review';
                const history = store.getState().history;
                const skippedIds = history.skippedQuestions ? history.skippedQuestions.map(q => q.id) : [];
                available = localQuestions.filter(q => skippedIds.includes(q.id));
                if (available.length === 0) available = localQuestions; // Fallback
            } else if (state.lessonId === 'weak_areas') {
                state.topicName = 'Weak Areas';
                const history = store.getState().history;
                const weakTopicIds = history.weakTopics ? history.weakTopics.map(t => t.topic) : [];
                available = localQuestions.filter(q => weakTopicIds.includes(q.topic));
                if (available.length === 0) available = localQuestions.filter(q => q.difficulty === 'advanced'); // Fallback
            } else {
                available = localQuestions.filter(q => q.difficulty === difficultyStr && state.topicName.toLowerCase().includes(q.topic.toLowerCase()));
                if (available.length === 0) available = localQuestions.filter(q => q.difficulty === difficultyStr); // Fallback to any topic
                if (available.length === 0) available = localQuestions; // Ultimate fallback
            }
            
            const randomIndex = Math.floor(Math.random() * available.length);
            state.quiz = available[randomIndex];
        }
        // If it IS follow up, state.quiz is already populated by Gemini
        
        state.quiz.correctAnswer = state.quiz.correctAnswer || "A";
        
        state.correctIndex = state.quiz.options.findIndex(o => o === state.quiz.correctAnswer || (typeof o === 'string' && o.startsWith(state.quiz.correctAnswer)));
        if (state.correctIndex === -1) state.correctIndex = 0; 
        
        state.selectedOption = null;
        state.isAnswered = false;
        state.isAnalyzing = false;
        state.showXpAnim = false;
        state.showConfetti = false;
        state.timeOut = false;
        state.timeSpent = 0;
        state.analysisResult = null;
        if (!state.isFollowUp) {
            state.owlMessage = state.quiz.question;
            state.explanationBox = null;
        }
        state.loading = false;
        state.startTime = Date.now();
        startTimer();
        render();
    }

    function startTimer() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (!state.isAnswered && !state.isAnalyzing) {
                state.timeSpent = Math.floor((Date.now() - state.startTime) / 1000);
                if (state.timeSpent >= state.timeLimit) {
                    state.timeOut = true;
                    submitAnswer(true);
                }
            }
        }, 1000);
    }

    async function submitAnswer(isTimeout = false) {
        if (state.isAnswered || state.isAnalyzing) return;
        
        state.isAnalyzing = true;
        clearInterval(timerInterval);
        if (isTimeout) state.selectedOption = null;
        
        render(); 
        
        const userAnswer = isTimeout ? 'No answer provided (Timeout)' : state.quiz.options[state.selectedOption];
        const isCorrect = state.selectedOption !== null && 
            (state.quiz.options[state.selectedOption] === state.quiz.correctAnswer || 
             (typeof state.quiz.options[state.selectedOption] === 'string' && state.quiz.options[state.selectedOption].startsWith(state.quiz.correctAnswer)));
        
        state.isAnalyzing = false;
        
        if (isCorrect) {
        } else {
        }
        
        const appState = store.getState();
        let historyObj = appState.history;
        
        let hearts = historyObj.hearts ?? 5;
        let dailyXp = historyObj.dailyXp ?? 0;
        let currentStreak = historyObj.streak || 0;
        
        // Track advanced stats for Weak Areas Dashboard
        let weakTopic = historyObj.weakTopics.find(t => t.topic === state.lessonId);
        if (!weakTopic) {
            const tObj = appState.topics.find(t => t.id === state.lessonId);
            weakTopic = { topic: state.lessonId, name: tObj ? tObj.name : state.lessonId, wrongCount: 0, skipCount: 0, totalAttempts: 0, correctCount: 0, lastAttempted: Date.now(), accuracy: 100 };
            historyObj.weakTopics.push(weakTopic);
        }
        weakTopic.totalAttempts = (weakTopic.totalAttempts || 0) + 1;
        weakTopic.lastAttempted = Date.now();
        if (isCorrect) weakTopic.correctCount = (weakTopic.correctCount || 0) + 1;
        else weakTopic.wrongCount = (weakTopic.wrongCount || 0) + 1;
        
        weakTopic.accuracy = Math.round(((weakTopic.correctCount || 0) / Math.max(1, weakTopic.totalAttempts)) * 100);
        if (weakTopic.accuracy >= 70 && weakTopic.totalAttempts >= 3) {
            // Mastered! Reset negative flags so it drops off the weak areas board
            weakTopic.wrongCount = 0;
            weakTopic.skipCount = 0;
        }
        
        historyObj.sessionStats.totalQuestions++;
        
        if (isCorrect) {
            historyObj.sessionStats.correct++;
            playSound('correct');
            state.showXpAnim = true;
            let xpGained = state.isFollowUp ? 5 : 10;
            dailyXp += xpGained;
            currentStreak += 1;
            state.owlMessage = xpGained === 10 ? `🎉 Awesome! +10 XP. You're a ${state.topicName} master!` : `🎉 Awesome! +5 XP. You got the follow-up right!`;
            
            state.isAnswered = true;
            state.isFollowUp = false;
            state.explanationBox = null;
        } else {
            historyObj.sessionStats.wrong++;
            playSound('wrong');
            currentStreak = 0;
            
            if (state.isFollowUp) {
                state.owlMessage = "Still not quite right. Let's try an easier concept next time.";
                state.currentLevel = Math.max(1, state.currentLevel - 1);
                state.isAnswered = true;
                state.isFollowUp = false;
                state.explanationBox = null;
            } else {
                state.isAnalyzing = true;
                state.owlMessage = "Oopsieee! Wrong answer 😅 Let me explain...";
                render();
                
                const userAnswer = state.quiz.options[state.selectedOption];
                const followUpResult = await generateFollowUpQuestion(state.quiz.question, userAnswer, state.quiz.correctAnswer);
                
                state.explanationBox = followUpResult.explanation;
                
                state.quiz = {
                    question: followUpResult.followUpQuestion,
                    options: followUpResult.followUpOptions,
                    correctAnswer: followUpResult.followUpCorrect,
                    explanation: followUpResult.explanation
                };
                
                state.owlMessage = `Oopsieee! Wrong answer 😅 Try this follow-up question:<br><br><strong>${state.quiz.question}</strong>`;
                
                state.isFollowUp = true;
                state.selectedOption = null;
                state.isAnswered = false;
                state.isAnalyzing = false;
                
                state.correctIndex = state.quiz.options.findIndex(o => o === state.quiz.correctAnswer || (typeof o === 'string' && o.startsWith(state.quiz.correctAnswer)));
                if (state.correctIndex === -1) state.correctIndex = 0; 
                
                // Keep them on the question screen to try the new follow up
                render();
                return;
            }
        }
        
        // if (hearts === 0) state.gameOver = true; // Disabled for demo
        
        const qRecord = { topic: state.lessonId, difficulty: state.currentLevel, correct: isCorrect, timeSpent: state.timeSpent, timestamp: Date.now() };
        const allQuestions = [...(historyObj.questionHistory || []), qRecord];
        
        const recentTopicAnswers = allQuestions.filter(q => q.topic === state.lessonId).slice(-5);
        if (recentTopicAnswers.length >= 5) {
            const recentCorrects = recentTopicAnswers.filter(q => q.correct).length;
            if (recentCorrects >= 4) state.currentLevel = Math.min(3, state.currentLevel + 1);
            else if (recentCorrects <= 2) state.currentLevel = Math.max(1, state.currentLevel - 1);
        }
        const topicHistory = allQuestions.filter(q => q.topic === state.lessonId);
        
        const corrects = topicHistory.filter(q => q.correct).length;
        const wrongs = topicHistory.filter(q => !q.correct).length;
        const avgTime = topicHistory.reduce((acc, q) => acc + q.timeSpent, 0) / Math.max(1, topicHistory.length);
        
        state.masteryScore = calculateSkillLevel(state.lessonId, corrects, wrongs, avgTime);
        
        if (state.masteryScore > 80 && isCorrect) state.showConfetti = true;
        
        const topics = [...appState.topics];
        const topicIndex = topics.findIndex(t => t.id === state.lessonId);
        if (topicIndex !== -1) topics[topicIndex].progress = state.masteryScore;
        
        let completed = historyObj.completedConcepts || [];
        if (state.masteryScore > 80 && !completed.includes(state.lessonId)) completed = [...completed, state.lessonId];
        
        store.setState({
            topics,
            history: {
                ...historyObj, streak: currentStreak, hearts, dailyXp,
                timeSpentSeconds: historyObj.timeSpentSeconds + state.timeSpent,
                completedConcepts: completed,
                lastStudied: { ...(historyObj.lastStudied || {}), [state.lessonId]: Date.now() },
                questionHistory: allQuestions,
                events: [...(historyObj.events || []), { type: 'quiz_answer', data: { answer: state.quiz.options[state.selectedOption], correct: isCorrect } }]
            }
        });
        
        render();
    }

    async function handleHint() {
        if (state.isAnalyzing || state.isAnswered) return;
        state.isAnalyzing = true;
        render();
        const res = await generateHint(state.quiz.question, state.stylePref, state.userName);
        state.explanationBox = res.hint;
        state.isAnalyzing = false;
        render();
    }

    async function handleELI5() {
        if (state.isAnalyzing || state.isAnswered) return;
        state.isAnalyzing = true;
        render();
        const res = await generateELI5(state.topicName, state.userName);
        // Format bullet points visually
        state.explanationBox = res.explanation.replace(/\n/g, '<br>');
        state.isAnalyzing = false;
        render();
    }


    
    async function handleSkip() {
        if (state.skipsRemaining <= 0 || state.isAnswered || state.isAnalyzing) return;
        state.skipsRemaining--;
        playSound('skip');
        
        const appState = store.getState();
        let historyObj = appState.history;
        
        historyObj.sessionStats.skipped++;
        historyObj.sessionStats.totalQuestions++;
        
        historyObj.skippedQuestions.push({
            id: state.quiz.id,
            topic: state.lessonId,
            difficulty: state.currentLevel,
            timestamp: Date.now()
        });
        
        let weakTopic = historyObj.weakTopics.find(t => t.topic === state.lessonId);
        if (!weakTopic) {
            const tObj = appState.topics.find(t => t.id === state.lessonId);
            weakTopic = { topic: state.lessonId, name: tObj ? tObj.name : state.lessonId, wrongCount: 0, skipCount: 0, totalAttempts: 0, correctCount: 0, lastAttempted: Date.now(), accuracy: 100 };
            historyObj.weakTopics.push(weakTopic);
        }
        weakTopic.skipCount = (weakTopic.skipCount || 0) + 1;
        weakTopic.totalAttempts = (weakTopic.totalAttempts || 0) + 1;
        weakTopic.lastAttempted = Date.now();
        weakTopic.accuracy = Math.round(((weakTopic.correctCount || 0) / Math.max(1, weakTopic.totalAttempts)) * 100);
        
        historyObj.dailyXp = Math.max(0, (historyObj.dailyXp || 0) - 5);
        
        store.setState({ history: historyObj });
        
        state.isAnswered = true;
        state.explanationBox = null;
        state.owlMessage = "No worries! We'll review this later 📚";
        render();
        
        setTimeout(() => {
            if (state.showConfetti) window.location.hash = `/dashboard`;
            else loadQuestion();
        }, 1500);
    }
    
    function render() {
        if (state.gameOver) {
            element.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 6rem; margin-bottom: 1rem;">💔</div>
                    <h2 style="color: var(--danger); font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem;">Game Over!</h2>
                    <p style="color: var(--text-muted); font-size: 1.2rem; margin-bottom: 3rem;">You ran out of hearts. Take a break or practice older concepts to earn more.</p>
                    <button id="btn-close" class="btn-duo">RETURN TO TOPICS</button>
                </div>
            `;
            return;
        }

        if (state.loading) {
            element.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem; color: var(--text-muted);" role="status" aria-live="polite">
                    <div class="character-mascot" style="font-size: 4rem; animation: float 1s ease-in-out infinite;" aria-hidden="true">🦉</div>
                    <h2 style="margin-top: 1rem; color: var(--text-main);">Loading lesson...</h2>
                </div>
            `;
            return;
        }
        
        let character = '🦉';
        let charAnim = 'float 3s ease-in-out infinite';
        
        const isCorrect = state.selectedOption !== null && state.isAnswered &&
            (state.quiz.options[state.selectedOption] === state.quiz.correctAnswer || 
             (typeof state.quiz.options[state.selectedOption] === 'string' && state.quiz.options[state.selectedOption].startsWith(state.quiz.correctAnswer)));
        
        if (state.isAnswered) {
            if (isCorrect) {
                character = '🥳';
                charAnim = 'bounce 1s ease infinite';
            } else {
                character = '😿';
                charAnim = 'shake 0.5s ease';
            }
        } else if (state.isAnalyzing) {
            character = '🤔';
            charAnim = 'float 1s ease infinite';
        }

        // [Efficiency] Defer heavy DOM paints to the next animation frame
        requestAnimationFrame(() => {
            element.innerHTML = `
                ${state.showConfetti ? `<div style="position: fixed; inset: 0; pointer-events: none; background: url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><circle cx=\\'50\\' cy=\\'50\\' r=\\'10\\' fill=\\'%2358CC02\\'/></svg>') space; opacity: 0.8; animation: fall 4s linear infinite; z-index: 9999;"></div><style>@keyframes fall { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }</style>` : ''}
                ${state.showXpAnim ? `<div style="position: absolute; color: var(--warning); font-size: 2.5rem; font-weight: 900; animation: floatUpFade 1.5s forwards; pointer-events: none; z-index: 1000; left: 50%; top: 40%; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">+10 XP</div>` : ''}

                <div class="quiz-container" style="max-width: 600px; margin: 0 auto; outline: none; padding-bottom: 2rem;" tabindex="-1">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <span class="material-icons" style="color: var(--border-dark); cursor: pointer; font-size: 2rem;" id="btn-close">close</span>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <span style="font-weight: 800; color: var(--text-muted); font-size: 0.9rem;">${state.quiz ? (state.quiz.difficulty === 'advanced' ? '⭐⭐⭐ Hard' : (state.quiz.difficulty === 'intermediate' ? '⭐⭐ Medium' : '⭐ Easy')) : ''}</span>
                            <span style="font-weight: 800; color: var(--secondary); background: var(--secondary-light); padding: 4px 12px; border-radius: 999px; font-size: 0.9rem; text-transform: uppercase;">${state.topicName}</span>
                            <div class="circular-progress" style="--progress: ${state.masteryScore}">
                                <div class="circular-progress-val">${state.masteryScore}%</div>
                            </div>
                        </div>
                    </div>
                
                <div style="display: flex; gap: 1.5rem; align-items: flex-end; margin-bottom: 2rem;">
                    <div class="character-mascot" style="font-size: 6rem; animation: ${charAnim}; transform-origin: bottom center;" aria-hidden="true">${character}</div>
                    <div class="speech-bubble" style="max-height: 120px; overflow-y: auto;" aria-live="polite" aria-atomic="true">
                        ${state.owlMessage}
                    </div>
                </div>
                
                ${state.explanationBox ? `
                    <style>@keyframes fadeInBox { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }</style>
                    <div style="background: var(--primary-light); color: var(--primary-dark); padding: 1.5rem; border-radius: 16px; margin-bottom: 2rem; border-left: 6px solid var(--primary); animation: fadeInBox 0.5s ease; font-weight: 600;" aria-live="polite">
                        ${state.explanationBox}
                    </div>
                ` : ''}
                
                ${!state.isAnswered ? `
                    <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1.5rem;">
                        <button type="button" class="btn-duo btn-secondary" style="padding: 8px 16px; font-size: 0.8rem; border-radius: 999px; width: auto; box-shadow: 0 3px 0 var(--border-color);" id="btn-hint">
                            <span class="material-icons" style="font-size: 1rem; vertical-align: middle;">lightbulb</span> HINT
                        </button>
                        <button type="button" class="btn-duo btn-secondary" style="padding: 8px 16px; font-size: 0.8rem; border-radius: 999px; width: auto; box-shadow: 0 3px 0 var(--border-color);" id="btn-eli5">
                            <span class="material-icons" style="font-size: 1rem; vertical-align: middle;">menu_book</span> EXPLAIN
                        </button>
                    </div>

                    <form id="quiz-form">
                        <fieldset style="border: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 2rem;">
                            <legend class="sr-only">Select an answer</legend>
                            ${state.quiz.options.map((opt, idx) => {
                                let labelClass = 'option-label';
                                if (state.selectedOption === idx) labelClass += ' selected';
                                if (state.isAnswered && state.analysisResult) {
                                    if (idx === state.correctIndex) labelClass += ' correct';
                                    else if (idx === state.selectedOption) labelClass += ' incorrect';
                                }
                                // [Security] Sanitize dynamically loaded AI content before rendering
                                const safeOpt = sanitizeInput(opt);
                                return `
                                <label class="${labelClass}">
                                    <input type="radio" name="quiz_option" value="${idx}" ${state.selectedOption === idx ? 'checked' : ''} style="display: none;" aria-label="Option ${idx + 1}: ${safeOpt}">
                                    <div style="width: 30px; height: 30px; border: 2px solid ${state.selectedOption === idx ? 'var(--secondary)' : 'var(--border-dark)'}; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 1rem; font-weight: 800; color: ${state.selectedOption === idx ? 'var(--secondary)' : 'var(--text-muted)'}; background: ${state.selectedOption === idx ? 'white' : 'transparent'};" aria-hidden="true">
                                        ${idx + 1}
                                    </div>
                                    <span style="flex-grow: 1;">${safeOpt}</span>
                                </label>
                                `;
                            }).join('')}
                        </fieldset>
                    </form>
                ` : ''}

            </div>
            
            ${(!state.isAnswered && !state.isAnalyzing) ? `
                <div class="bottom-bar">
                    <div class="bottom-bar-content">
                        <button type="button" class="btn-duo btn-secondary" style="width: auto; padding: 14px 30px;" id="btn-skip" ${state.skipsRemaining <= 0 ? 'disabled title="Out of skips!"' : ''}>SKIP (${state.skipsRemaining})</button>
                        <button type="button" class="btn-duo" id="btn-submit" ${state.selectedOption === null ? 'disabled' : ''} style="width: auto; padding: 14px 40px; background: ${(state.lessonId === 'review' || state.lessonId === 'weak_areas') ? '#9333ea' : 'var(--primary)'}; box-shadow: 0 4px 0 ${(state.lessonId === 'review' || state.lessonId === 'weak_areas') ? '#7e22ce' : 'var(--primary-dark)'};">
                            Submit Answer
                        </button>
                    </div>
                </div>
            ` : ''}
            
            ${(state.isAnswered) ? `
                <div class="bottom-bar" style="background: ${isCorrect ? 'var(--primary-light)' : 'var(--danger-light)'}; border-top-color: ${isCorrect ? '#bbf7d0' : '#fecaca'};">
                    <div class="bottom-bar-content" style="align-items: center;">
                        <div>
                            <h2 style="margin: 0 0 0.5rem; color: ${isCorrect ? 'var(--primary-dark)' : 'var(--danger-dark)'}; display: flex; align-items: center; gap: 0.5rem; font-weight: 900; font-size: 1.6rem;">
                                <span class="material-icons" style="background: white; border-radius: 50%; padding: 4px; font-size: 1.8rem;">${isCorrect ? 'check' : 'close'}</span>
                                ${isCorrect ? 'Excellent!' : 'Keep Practicing!'}
                            </h2>
                        </div>
                        <button id="btn-next-q" class="btn-duo" style="width: auto; padding: 14px 40px; background: ${isCorrect ? 'var(--primary)' : 'var(--danger)'}; box-shadow: 0 4px 0 ${isCorrect ? 'var(--primary-dark)' : 'var(--danger-dark)'};">
                            Next Question
                        </button>
                    </div>
                </div>
            ` : ''}
        `;
        });
    }

    function handleChange(e) {
        if (e.target.name === 'quiz_option' && !state.isAnswered && !state.isAnalyzing) {
            state.selectedOption = parseInt(e.target.value, 10);
            render();
        }
    }

    function handleEvent(e) {
        if (e.type === 'click') {
            if (e.target.closest('#btn-hint')) return handleHint();
            if (e.target.closest('#btn-eli5')) return handleELI5();
            
            const btnSubmit = e.target.closest('#btn-submit');
            if (btnSubmit && !btnSubmit.disabled) return submitAnswer(false);
            
            const btnClose = e.target.closest('#btn-close');
            if (btnClose) return window.location.hash = `/topics`;
            
            const btnSkip = e.target.closest('#btn-skip');
            if (btnSkip) return handleSkip(); 
            
            const btnNextQ = e.target.closest('#btn-next-q');
            if (btnNextQ) {
                if (state.showConfetti) window.location.hash = `/dashboard`;
                else loadQuestion(); 
                return;
            }
        } else if (e.type === 'keydown' && !state.isAnswered && !state.loading && !state.isAnalyzing) {
            if (e.key === 'Enter' && state.selectedOption !== null) {
                e.preventDefault();
                submitAnswer(false);
            }
        }
    }

    element.addEventListener('change', handleChange);
    element.addEventListener('click', handleEvent);
    element.addEventListener('keydown', handleEvent);
    init();

    return {
        render,
        destroy: () => {
            clearInterval(timerInterval);
            element.removeEventListener('change', handleChange);
            element.removeEventListener('click', handleEvent);
            element.removeEventListener('keydown', handleEvent);
            element.innerHTML = '';
        }
    };
}
