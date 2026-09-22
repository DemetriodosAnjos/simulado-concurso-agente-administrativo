import React, { useState, useEffect } from 'react';
import { 
  UserPerformance, 
  ActiveSession, 
  QuizResultSummary, 
  SubjectId, 
  Question, 
  DifficultyLevel 
} from './types';
import { 
  loadUserPerformance, 
  saveUserPerformance, 
  loadActiveSession, 
  saveActiveSession, 
  clearActiveSession, 
  recordQuizCompletion, 
  updateCadernoDeErros, 
  resetAllUserProgress 
} from './services/storageService';
import { 
  ALL_QUESTIONS, 
  QUESTIONS_BY_ID, 
  SUBJECTS_META, 
  getQuestionsBySubjectAndLevel, 
  getQuestionsForFullExam 
} from './data/questionsLoader';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { QuizPlayer } from './components/QuizPlayer';
import { QuizResult } from './components/QuizResult';
import { CadernoDeErros } from './components/CadernoDeErros';
import { CustomFilterModal } from './components/CustomFilterModal';

export default function App() {
  const [performance, setPerformance] = useState<UserPerformance>(() => loadUserPerformance());
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() => loadActiveSession());
  const [currentView, setCurrentView] = useState<'dashboard' | 'quiz' | 'result' | 'caderno_erros'>('dashboard');
  const [selectedResult, setSelectedResult] = useState<QuizResultSummary | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Sync theme changes to html element
  useEffect(() => {
    if (performance.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#180026';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [performance.theme]);

  const handleToggleTheme = () => {
    const nextTheme = performance.theme === 'dark' ? 'light' : 'dark';
    const updated: UserPerformance = {
      ...performance,
      theme: nextTheme
    };
    setPerformance(updated);
    saveUserPerformance(updated);
  };

  // Start Level Quiz
  const handleStartLevelQuiz = (subjectId: SubjectId, levelNumber: 1 | 2 | 3) => {
    const questions = getQuestionsBySubjectAndLevel(subjectId, levelNumber);
    if (questions.length === 0) return;

    const diffMap: Record<number, DifficultyLevel> = {
      1: 'basico',
      2: 'intermediario',
      3: 'avancado'
    };
    const diff = diffMap[levelNumber];
    const subjectMeta = SUBJECTS_META.find(s => s.id === subjectId);
    const levelLabel = levelNumber === 1 ? 'Nível I (Básico)' : levelNumber === 2 ? 'Nível II (Intermediário)' : 'Nível III (Avançado)';

    const session: ActiveSession = {
      id: `sess-${Date.now()}`,
      type: 'level',
      title: `${subjectMeta?.shortName || 'Matéria'} • ${levelLabel}`,
      subjectId,
      difficulty: diff,
      levelNumber,
      questionIds: questions.map(q => q.id),
      userAnswers: {},
      flaggedQuestionIds: {},
      currentIndex: 0,
      timeRemainingSeconds: 1800, // 30 minutes
      totalTimeSeconds: 1800,
      isPracticeMode: true,
      startedAt: new Date().toISOString()
    };

    setActiveSession(session);
    saveActiveSession(session);
    setCurrentView('quiz');
  };

  // Start Full General Exam (Simulado Geral)
  const handleStartGeneralExam = () => {
    const questions = getQuestionsForFullExam();
    const session: ActiveSession = {
      id: `sess-${Date.now()}`,
      type: 'exam',
      title: 'Simulado Geral Oficial • Agente Administrativo',
      questionIds: questions.map(q => q.id),
      userAnswers: {},
      flaggedQuestionIds: {},
      currentIndex: 0,
      timeRemainingSeconds: 10800, // 3 hours
      totalTimeSeconds: 10800,
      isPracticeMode: false,
      startedAt: new Date().toISOString()
    };

    setActiveSession(session);
    saveActiveSession(session);
    setCurrentView('quiz');
  };

  // Start Custom Filter Quiz
  const handleStartCustomQuiz = (
    questions: Question[],
    title: string,
    isPracticeMode: boolean
  ) => {
    if (questions.length === 0) return;
    const allocatedTime = questions.length * 120; // 2 minutes per question

    const session: ActiveSession = {
      id: `sess-${Date.now()}`,
      type: 'custom_filter',
      title: `Treino: ${title}`,
      questionIds: questions.map(q => q.id),
      userAnswers: {},
      flaggedQuestionIds: {},
      currentIndex: 0,
      timeRemainingSeconds: allocatedTime,
      totalTimeSeconds: allocatedTime,
      isPracticeMode,
      startedAt: new Date().toISOString()
    };

    setActiveSession(session);
    saveActiveSession(session);
    setCurrentView('quiz');
  };

  // Start Errors Notebook Quiz
  const handleStartErrorsQuiz = (questionIds: string[]) => {
    if (questionIds.length === 0) return;
    const allocatedTime = questionIds.length * 120;

    const session: ActiveSession = {
      id: `sess-${Date.now()}`,
      type: 'errors_review',
      title: 'Revisão: Caderno de Questões Erradas',
      questionIds,
      userAnswers: {},
      flaggedQuestionIds: {},
      currentIndex: 0,
      timeRemainingSeconds: allocatedTime,
      totalTimeSeconds: allocatedTime,
      isPracticeMode: true,
      startedAt: new Date().toISOString()
    };

    setActiveSession(session);
    saveActiveSession(session);
    setCurrentView('quiz');
  };

  // Resume active session
  const handleResumeActiveSession = () => {
    if (activeSession) {
      setCurrentView('quiz');
    }
  };

  // Discard active session
  const handleDiscardActiveSession = () => {
    clearActiveSession();
    setActiveSession(null);
  };

  // Quiz Finish Handler
  const handleFinishQuiz = (summary: QuizResultSummary) => {
    // Determine which questions were missed and which were correctly solved
    const wrongIds: string[] = [];
    const correctIds: string[] = [];

    summary.questionIds.forEach(id => {
      const q = QUESTIONS_BY_ID[id];
      if (q) {
        if (summary.answers[id] === q.correctOption) {
          correctIds.push(id);
        } else {
          wrongIds.push(id);
        }
      }
    });

    // 1. Record quiz completion in performance
    let updatedPerf = recordQuizCompletion(summary, performance);

    // 2. Update caderno de erros (add new wrongs, remove successfully solved)
    updatedPerf = updateCadernoDeErros(wrongIds, correctIds, updatedPerf);

    setPerformance(updatedPerf);
    setActiveSession(null);
    setSelectedResult(summary);
    setCurrentView('result');
  };

  // Clear all errors from caderno
  const handleClearErrors = () => {
    const updated: UserPerformance = {
      ...performance,
      errorQuestionIds: []
    };
    setPerformance(updated);
    saveUserPerformance(updated);
  };

  // Reset all progress
  const handleResetAllProgress = () => {
    if (window.confirm('Tem certeza que deseja zerar todo o seu histórico e níveis desbloqueados?')) {
      const reset = resetAllUserProgress();
      setPerformance(reset);
      setActiveSession(null);
      setCurrentView('dashboard');
    }
  };

  // Current session questions loader
  const currentSessionQuestions: Question[] = activeSession
    ? activeSession.questionIds.map(id => QUESTIONS_BY_ID[id]).filter(Boolean)
    : [];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      performance.theme === 'dark' 
        ? 'bg-[#180026] text-white selection:bg-[#F8AB08] selection:text-[#39005E]' 
        : 'bg-slate-50 text-slate-900 selection:bg-purple-200'
    }`}>
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        theme={performance.theme}
        onToggleTheme={handleToggleTheme}
        errorCount={performance.errorQuestionIds?.length || 0}
        hasActiveSession={!!activeSession}
        onResumeSession={handleResumeActiveSession}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-12">
        {currentView === 'dashboard' && (
          <Dashboard
            performance={performance}
            activeSession={activeSession}
            theme={performance.theme}
            onStartLevelQuiz={handleStartLevelQuiz}
            onStartGeneralExam={handleStartGeneralExam}
            onOpenCustomFilter={() => setIsFilterModalOpen(true)}
            onOpenCadernoErros={() => setCurrentView('caderno_erros')}
            onResumeActiveSession={handleResumeActiveSession}
            onDiscardActiveSession={handleDiscardActiveSession}
            onViewResultSummary={(summary) => {
              setSelectedResult(summary);
              setCurrentView('result');
            }}
            onResetAllProgress={handleResetAllProgress}
          />
        )}

        {currentView === 'quiz' && activeSession && (
          <QuizPlayer
            session={activeSession}
            questions={currentSessionQuestions}
            theme={performance.theme}
            onUpdateSession={(updated) => {
              setActiveSession(updated);
              saveActiveSession(updated);
            }}
            onFinishQuiz={handleFinishQuiz}
            onExitToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'result' && selectedResult && (
          <QuizResult
            summary={selectedResult}
            theme={performance.theme}
            onRestartLevel={(subjectId, lvl) => handleStartLevelQuiz(subjectId, lvl)}
            onRestartSession={(summary) => {
              if (summary.type === 'level' && summary.subjectId && summary.levelNumber) {
                handleStartLevelQuiz(summary.subjectId, summary.levelNumber as 1 | 2 | 3);
              } else if (summary.type === 'exam') {
                handleStartGeneralExam();
              } else {
                handleStartGeneralExam();
              }
            }}
            onNextLevel={(subjectId, nextLvl) => handleStartLevelQuiz(subjectId, nextLvl)}
            onGoToDashboard={() => setCurrentView('dashboard')}
            onGoToCadernoErros={() => setCurrentView('caderno_erros')}
          />
        )}

        {currentView === 'caderno_erros' && (
          <CadernoDeErros
            performance={performance}
            theme={performance.theme}
            onStartErrorsQuiz={handleStartErrorsQuiz}
            onClearErrors={handleClearErrors}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Custom Filter Modal */}
      <CustomFilterModal
        theme={performance.theme}
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onStartCustomQuiz={handleStartCustomQuiz}
      />

      {/* Footer */}
      <footer className={`border-t py-4 text-center text-xs ${
        performance.theme === 'dark' 
          ? 'border-purple-950 bg-[#12001d] text-purple-400' 
          : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <p>
          Prepara Curitiba 2026 • Simulado Preparatório para o Concurso de Agente Administrativo (FAFIPA)
        </p>
        <p className="text-[11px] opacity-75 mt-0.5">
          Modo offline ativo • 300 questões fundamentadas com gabarito pedagógico e controle de níveis
        </p>
      </footer>
    </div>
  );
}
