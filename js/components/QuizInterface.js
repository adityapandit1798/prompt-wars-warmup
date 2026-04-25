/**
 * Quiz Interface Component.
 * @module components/QuizInterface
 */
import { generateAdaptiveQuestion, analyzeAnswer } from '../services/geminiService.js';
import { calculateSkillLevel } from '../adaptationLogic.js';
import { store } from '../store.js';

// Web Audio API helper for sound effects
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
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.3);
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
        console.warn('Audio play failed', e);
    }
}

export function createQuizInterface(container, lessonId) {
    let state = {
        lessonId,
        topicName: '',
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
        pacePref: 'medium'
    };
    let element = container;
    let timerInterval;

    async function init() {
        const globalState = store.getState();
        const topic = globalState.topics.find(t => t.id === lessonId);
        state.topicName = topic ? topic.name : lessonId;
        state.masteryScore = topic ? topic.progress : 0;
        
        const hearts = globalState.history.hearts ?? 5;
        if (hearts <= 0) {
            state.gameOver = true;
            state.loading = false;
            render();
            return;
        }
        
        const profile = globalState.userProfile;
        state.stylePref = (profile.learningPreferences && profile.learningPreferences[0]) || 'visual';
        state.pacePref = profile.paceSettings || 'medium';
        
        state.currentLevel = state.masteryScore > 70 ? 3 : (state.masteryScore > 30 ? 2 : 1);
        
        await loadQuestion();
    }

    async function loadQuestion() {
        state.loading = true;
        render();
        
        const history = store.getState().history.events || [];
        const prevAnswers = history.slice(-3).map(e => e.data?.answer || '');
        
        const difficultyStr = state.currentLevel === 3 ? 'advanced' : (state.currentLevel === 2 ? 'intermediate' : 'beginner');
        const topicWithInstructions = `${state.topicName}. SYSTEM REQUIREMENT: Provide friendly, casual feedback.`;
        
        state.quiz = await generateAdaptiveQuestion(topicWithInstructions, difficultyStr, prevAnswers);
        
        state.correctIndex = state.quiz.options.indexOf(state.quiz.correctAnswer);
        if (state.correctIndex === -1) state.correctIndex = 0; 
        
        state.selectedOption = null;
        state.isAnswered = false;
        state.isAnalyzing = false;
        state.showXpAnim = false;
        state.showConfetti = false;
        state.timeOut = false;
        state.timeSpent = 0;
        state.analysisResult = null;
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
        state.analysisResult = await analyzeAnswer(state.quiz.question, userAnswer, state.quiz.correctAnswer);
        
        state.isAnalyzing = false;
        state.isAnswered = true;
        
        const isCorrect = state.analysisResult.isCorrect;
        const appState = store.getState();
        let historyObj = appState.history;
        
        let hearts = historyObj.hearts ?? 5;
        let dailyXp = historyObj.dailyXp ?? 0;
        let currentStreak = historyObj.streak || 0;
        
        if (isCorrect) {
            playSound('correct');
            state.showXpAnim = true;
            dailyXp += 10;
            currentStreak += 1;
            state.currentLevel = Math.min(3, state.currentLevel + 1);
        } else {
            playSound('wrong');
            hearts = Math.max(0, hearts - 1);
            currentStreak = 0;
            state.currentLevel = Math.max(1, state.currentLevel - 1);
        }
        
        if (hearts === 0) state.gameOver = true;
        
        const qRecord = { topic: state.lessonId, difficulty: state.currentLevel, correct: isCorrect, timeSpent: state.timeSpent, timestamp: Date.now() };
        const allQuestions = [...(historyObj.questionHistory || []), qRecord];
        const topicHistory = allQuestions.filter(q => q.topic === state.lessonId);
        
        const corrects = topicHistory.filter(q => q.correct).length;
        const wrongs = topicHistory.filter(q => !q.correct).length;
        const avgTime = topicHistory.reduce((acc, q) => acc + q.timeSpent, 0) / Math.max(1, topicHistory.length);
        
        state.masteryScore = calculateSkillLevel(state.lessonId, corrects, wrongs, avgTime);
        
        if (state.masteryScore > 80 && isCorrect) {
            state.showConfetti = true; // Lesson complete milestone
        }
        
        const topics = [...appState.topics];
        const topicIndex = topics.findIndex(t => t.id === state.lessonId);
        if (topicIndex !== -1) topics[topicIndex].progress = state.masteryScore;
        
        let completed = historyObj.completedConcepts || [];
        if (state.masteryScore > 80 && !completed.includes(state.lessonId)) {
            completed = [...completed, state.lessonId];
        }
        
        store.setState({
            topics,
            history: {
                ...historyObj,
                streak: currentStreak,
                hearts,
                dailyXp,
                timeSpentSeconds: historyObj.timeSpentSeconds + state.timeSpent,
                completedConcepts: completed,
                lastStudied: { ...(historyObj.lastStudied || {}), [state.lessonId]: Date.now() },
                questionHistory: allQuestions,
                events: [...(historyObj.events || []), { type: 'quiz_answer', data: { answer: userAnswer, correct: isCorrect } }]
            }
        });
        
        render();
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
                <div style="text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                    <div class="character-mascot" style="font-size: 4rem; animation: float 1s ease-in-out infinite;">🦉</div>
                    <h2 style="margin-top: 1rem; color: var(--text-main);">Loading lesson...</h2>
                </div>
            `;
            return;
        }
        
        let character = '🦉';
        let charAnim = 'float 3s ease-in-out infinite';
        let owlMessage = state.quiz.question;
        
        if (state.isAnswered && state.analysisResult) {
            if (state.analysisResult.isCorrect) {
                character = '🥳';
                charAnim = 'bounce 1s ease infinite';
                const quotes = ["Great job!", "You got this!", "Keep going!", "Awesome!", "Spot on!"];
                owlMessage = quotes[Math.floor(Math.random() * quotes.length)];
            } else {
                character = '😿';
                charAnim = 'shake 0.5s ease';
                owlMessage = "Oh no! Let's review that.";
            }
        } else if (state.isAnalyzing) {
            character = '🤔';
            charAnim = 'float 1s ease infinite';
            owlMessage = "Hmm, let me think...";
        }

        element.innerHTML = `
            ${state.showConfetti ? `<div style="position: fixed; inset: 0; pointer-events: none; background: url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><circle cx=\\'50\\' cy=\\'50\\' r=\\'10\\' fill=\\'%2358CC02\\'/></svg>') space; opacity: 0.8; animation: fall 4s linear infinite; z-index: 9999;"></div><style>@keyframes fall { 0% { transform: translateY(-100vh); } 100% { transform: translateY(100vh); } }</style>` : ''}
            
            ${state.showXpAnim ? `<div style="position: absolute; color: var(--warning); font-size: 2.5rem; font-weight: 900; animation: floatUpFade 1.5s forwards; pointer-events: none; z-index: 1000; left: 50%; top: 40%; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">+10 XP</div>` : ''}

            <div class="quiz-container" style="max-width: 600px; margin: 0 auto; outline: none; padding-bottom: 2rem;" tabindex="-1">
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <span class="material-icons" style="color: var(--border-dark); cursor: pointer; font-size: 2rem;" id="btn-close">close</span>
                    
                    <div class="circular-progress" style="--progress: ${state.masteryScore}">
                        <div class="circular-progress-val">${state.masteryScore}%</div>
                    </div>
                </div>
                
                <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 2rem; color: var(--text-main);">${!state.isAnswered ? 'Select the correct translation' : 'Review the feedback'}</h2>
                
                <div style="display: flex; gap: 1.5rem; align-items: flex-end; margin-bottom: 2rem;">
                    <div class="character-mascot" style="font-size: 6rem; animation: ${charAnim}; transform-origin: bottom center;">${character}</div>
                    <div class="speech-bubble">
                        ${owlMessage}
                    </div>
                </div>
                
                ${!state.isAnswered ? `
                    <form id="quiz-form">
                        <fieldset style="border: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 2rem;">
                            <legend class="sr-only">Select an answer</legend>
                            ${state.quiz.options.map((opt, idx) => `
                                <label class="option-label">
                                    <input type="radio" name="quiz_option" value="${idx}" ${state.selectedOption === idx ? 'checked' : ''} style="display: none;">
                                    <div style="width: 30px; height: 30px; border: 2px solid ${state.selectedOption === idx ? 'var(--secondary)' : 'var(--border-dark)'}; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 1rem; font-weight: 800; color: ${state.selectedOption === idx ? 'var(--secondary)' : 'var(--text-muted)'}; background: ${state.selectedOption === idx ? 'white' : 'transparent'};">
                                        ${idx + 1}
                                    </div>
                                    <span style="flex-grow: 1;">${opt}</span>
                                </label>
                            `).join('')}
                        </fieldset>
                    </form>
                ` : ''}

            </div>
            
            ${(!state.isAnswered && !state.isAnalyzing) ? `
                <div class="bottom-bar">
                    <div class="bottom-bar-content">
                        <button type="button" class="btn-duo btn-secondary" style="width: auto; padding: 14px 30px;" id="btn-skip">SKIP</button>
                        <button type="button" class="btn-duo" id="btn-submit" disabled="${state.selectedOption === null ? 'true' : 'false'}" style="width: auto; padding: 14px 40px;">
                            CHECK
                        </button>
                    </div>
                </div>
            ` : ''}
            
            ${state.isAnalyzing ? `
                <div class="bottom-bar" style="background: var(--border-color); border-top-color: var(--border-dark);">
                    <div class="bottom-bar-content" style="justify-content: center;">
                        <h2 style="margin: 0; color: var(--text-main); font-weight: 800;">Thinking...</h2>
                    </div>
                </div>
            ` : ''}
            
            ${(state.isAnswered && state.analysisResult) ? `
                <div class="bottom-bar" style="background: ${state.analysisResult.isCorrect ? 'var(--primary-light)' : 'var(--danger-light)'}; border-top-color: ${state.analysisResult.isCorrect ? '#bbf7d0' : '#fecaca'};">
                    <div class="bottom-bar-content" style="align-items: center;">
                        <div>
                            <h2 style="margin: 0 0 0.5rem; color: ${state.analysisResult.isCorrect ? 'var(--primary-dark)' : 'var(--danger-dark)'}; display: flex; align-items: center; gap: 0.5rem; font-weight: 900; font-size: 1.6rem;">
                                <span class="material-icons" style="background: white; border-radius: 50%; padding: 4px; font-size: 1.8rem;">${state.analysisResult.isCorrect ? 'check' : 'close'}</span>
                                ${state.analysisResult.isCorrect ? 'Excellent!' : 'Correct solution:'}
                            </h2>
                            ${!state.analysisResult.isCorrect ? `<p style="margin: 0 0 0.5rem; font-weight: 800; color: var(--danger-dark); font-size: 1.1rem;">${state.quiz.correctAnswer}</p>` : ''}
                            <p style="margin: 0; color: ${state.analysisResult.isCorrect ? 'var(--primary-dark)' : 'var(--danger-dark)'}; font-size: 1rem; max-width: 450px; font-weight: 600;">${state.analysisResult.reasoning}</p>
                        </div>
                        <button id="btn-next-q" class="btn-duo" style="width: auto; padding: 14px 40px; background: ${state.analysisResult.isCorrect ? 'var(--primary)' : 'var(--danger)'}; box-shadow: 0 4px 0 ${state.analysisResult.isCorrect ? 'var(--primary-dark)' : 'var(--danger-dark)'};">
                            CONTINUE
                        </button>
                    </div>
                </div>
            ` : ''}
        `;
    }

    function handleChange(e) {
        if (e.target.name === 'quiz_option' && !state.isAnswered && !state.isAnalyzing) {
            state.selectedOption = parseInt(e.target.value, 10);
            render();
        }
    }

    function handleEvent(e) {
        if (e.type === 'click') {
            const btnSubmit = e.target.closest('#btn-submit');
            if (btnSubmit && !btnSubmit.disabled) {
                submitAnswer(false);
                return;
            }
            
            const btnClose = e.target.closest('#btn-close');
            if (btnClose) {
                window.location.hash = `/topics`;
                return;
            }
            
            const btnSkip = e.target.closest('#btn-skip');
            if (btnSkip) {
                submitAnswer(true); 
                return;
            }
            
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
