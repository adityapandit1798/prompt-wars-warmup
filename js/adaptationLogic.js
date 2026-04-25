/**
 * Duolingo-style adaptation algorithm and spaced repetition logic.
 * @module adaptationLogic
 */

/**
 * Calculates a mastery score (0-100) based on accuracy and average response time.
 */
export function calculateSkillLevel(topic, correctAnswers, wrongAnswers, avgTime) {
    const total = correctAnswers + wrongAnswers;
    if (total === 0) return 0;
    
    // Base accuracy (0-100)
    let accuracy = (correctAnswers / total) * 100;
    
    // Time penalty/bonus: Target optimal time is around 15s.
    let timeFactor = 1.0;
    if (avgTime < 10) timeFactor = 1.1; // Fast, bonus
    else if (avgTime > 30) timeFactor = 0.9; // Slow, slight penalty
    
    let masteryScore = Math.round(accuracy * timeFactor);
    return Math.max(0, Math.min(100, masteryScore));
}

/**
 * Determines the next recommended action based on user state.
 */
export function determineNextAction(masteryScore, streak, confusionCount) {
    if (confusionCount > 2) {
        return { action: 'review', reason: 'High confusion detected. Back to basics.' };
    }
    
    if (masteryScore >= 80 && streak >= 3) {
        return { action: 'advance', reason: 'Mastery achieved and streak is high. Time to level up!' };
    }
    
    if (masteryScore < 40 || streak === 0) {
        return { action: 'practice', reason: 'Keep practicing to build consistency.' };
    }
    
    return { action: 'practice', reason: 'Steady progress. Reinforce the concepts.' };
}

/**
 * SuperMemo-2 inspired simple spaced repetition scheduler.
 */
export function spacedRepetitionScheduler(lastStudiedTimestamp, masteryLevel) {
    if (!lastStudiedTimestamp) return { shouldReview: true, optimalInterval: 0, daysOverdue: 1 };
    
    let baseIntervalDays = 1;
    if (masteryLevel > 80) baseIntervalDays = 7;
    else if (masteryLevel > 50) baseIntervalDays = 3;
    
    const now = Date.now();
    const daysSinceLast = (now - lastStudiedTimestamp) / (1000 * 60 * 60 * 24);
    const daysOverdue = daysSinceLast - baseIntervalDays;
    
    return {
        shouldReview: daysOverdue >= 0,
        optimalInterval: baseIntervalDays,
        daysOverdue: Math.max(0, daysOverdue)
    };
}
