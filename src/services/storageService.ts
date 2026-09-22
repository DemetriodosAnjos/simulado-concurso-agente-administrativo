import { UserPerformance, QuizResultSummary, ActiveSession, SubjectId } from '../types';

const STORAGE_KEY_PERFORMANCE = 'concurso_curitiba_performance_v1';
const STORAGE_KEY_ACTIVE_SESSION = 'concurso_curitiba_active_session_v1';

export const DEFAULT_PERFORMANCE: UserPerformance = {
  unlockedLevels: {
    portugues: 1,
    raciocinio_logico: 1,
    informatica: 1,
    legislacao: 1,
    conhecimentos_especificos: 1,
  },
  levelHighScores: {},
  generalExamHighScore: 0,
  history: [],
  errorQuestionIds: [],
  theme: 'dark'
};

export function loadUserPerformance(): UserPerformance {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERFORMANCE);
    if (!raw) return DEFAULT_PERFORMANCE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PERFORMANCE,
      ...parsed,
      unlockedLevels: {
        ...DEFAULT_PERFORMANCE.unlockedLevels,
        ...(parsed.unlockedLevels || {})
      }
    };
  } catch (e) {
    console.error('Failed to load performance from localStorage', e);
    return DEFAULT_PERFORMANCE;
  }
}

export function saveUserPerformance(perf: UserPerformance): void {
  try {
    localStorage.setItem(STORAGE_KEY_PERFORMANCE, JSON.stringify(perf));
  } catch (e) {
    console.error('Failed to save performance to localStorage', e);
  }
}

export function loadActiveSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSession;
  } catch (e) {
    console.error('Failed to load active session from localStorage', e);
    return null;
  }
}

export function saveActiveSession(session: ActiveSession | null): void {
  try {
    if (!session) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(session));
    }
  } catch (e) {
    console.error('Failed to save active session to localStorage', e);
  }
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
  } catch (e) {
    console.error('Failed to clear active session', e);
  }
}

export function recordQuizCompletion(
  summary: QuizResultSummary,
  currentPerf: UserPerformance
): UserPerformance {
  const nextPerf = { ...currentPerf };
  
  // Add to history (newest first, max 100)
  nextPerf.history = [summary, ...nextPerf.history].slice(0, 100);

  // Update level high score if applicable
  if (summary.type === 'level' && summary.subjectId && summary.levelNumber) {
    const key = `${summary.subjectId}_lvl${summary.levelNumber}`;
    const previousHigh = nextPerf.levelHighScores[key] || 0;
    if (summary.score > previousHigh) {
      nextPerf.levelHighScores[key] = summary.score;
    }

    // Check level progression: 61 points or more unlocks next level (up to level 3)
    if (summary.passed && summary.levelNumber < 3) {
      const currentUnlocked = nextPerf.unlockedLevels[summary.subjectId] || 1;
      const nextLevel = summary.levelNumber + 1;
      if (nextLevel > currentUnlocked) {
        nextPerf.unlockedLevels[summary.subjectId] = nextLevel;
      }
    }
  } else if (summary.type === 'exam') {
    if (summary.score > nextPerf.generalExamHighScore) {
      nextPerf.generalExamHighScore = summary.score;
    }
  }

  saveUserPerformance(nextPerf);
  clearActiveSession();
  return nextPerf;
}

export function updateCadernoDeErros(
  wrongQuestionIds: string[],
  resolvedQuestionIds: string[],
  currentPerf: UserPerformance
): UserPerformance {
  const currentErrors = new Set(currentPerf.errorQuestionIds || []);
  
  // Add newly missed questions
  wrongQuestionIds.forEach(id => currentErrors.add(id));
  
  // Remove correctly answered questions
  resolvedQuestionIds.forEach(id => currentErrors.delete(id));

  const updated: UserPerformance = {
    ...currentPerf,
    errorQuestionIds: Array.from(currentErrors)
  };

  saveUserPerformance(updated);
  return updated;
}

export function resetAllUserProgress(): UserPerformance {
  const resetPerf = { ...DEFAULT_PERFORMANCE };
  saveUserPerformance(resetPerf);
  clearActiveSession();
  return resetPerf;
}
