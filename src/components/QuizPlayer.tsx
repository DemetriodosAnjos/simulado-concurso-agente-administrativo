import React, { useState, useEffect, useRef } from 'react';
import { 
  Question, 
  ActiveSession, 
  QuizResultSummary 
} from '../types';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Flag, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  PauseCircle, 
  Grid, 
  Sparkles,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  X
} from 'lucide-react';

interface QuizPlayerProps {
  session: ActiveSession;
  questions: Question[];
  theme: 'light' | 'dark';
  onUpdateSession: (updated: ActiveSession) => void;
  onFinishQuiz: (summary: QuizResultSummary) => void;
  onExitToDashboard: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  session,
  questions,
  theme,
  onUpdateSession,
  onFinishQuiz,
  onExitToDashboard
}) => {
  const [currentIndex, setCurrentIndex] = useState(session.currentIndex || 0);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>(session.userAnswers || {});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>(session.flaggedQuestionIds || {});
  const [timeRemaining, setTimeRemaining] = useState(session.timeRemainingSeconds);
  const [isPracticeMode, setIsPracticeMode] = useState(session.isPracticeMode ?? true);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState(false);

  const currentQuestion = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;

  // Timer reference
  const timeRef = useRef(timeRemaining);
  timeRef.current = timeRemaining;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinish(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Sync back to parent/localStorage periodically
  useEffect(() => {
    const updated: ActiveSession = {
      ...session,
      currentIndex,
      userAnswers,
      flaggedQuestionIds: flaggedQuestions,
      timeRemainingSeconds: timeRemaining,
      isPracticeMode
    };
    onUpdateSession(updated);
  }, [currentIndex, userAnswers, flaggedQuestions, timeRemaining, isPracticeMode]);

  // Keyboard navigation & answering support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const keyMap: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'> = {
          '1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E'
        };
        handleSelectOption(keyMap[e.key]);
      } else if (['a', 'b', 'c', 'd', 'e', 'A', 'B', 'C', 'D', 'E'].includes(e.key)) {
        handleSelectOption(e.key.toUpperCase() as 'A' | 'B' | 'C' | 'D' | 'E');
      } else if (e.key === 'ArrowRight' && currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, currentQuestion]);

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D' | 'E') => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  const handleFinish = (forcedByTimeout: boolean = false) => {
    // Calculate final scores
    let correctCount = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctOption) {
        correctCount += 1;
      }
    });

    // Score logic:
    // Simulado Geral (40 questões): cada questão vale 2,50 pontos (40 * 2,50 = 100 pontos)
    // Nível por Matéria (20 questões): cada questão vale 5,00 pontos (20 * 5,00 = 100 pontos)
    // Outros filtros personalizados: (correctCount / totalQuestions) * 100
    let pointsPerQuestion = 2.5;
    if (session.type === 'level') {
      pointsPerQuestion = 5.0;
    } else if (session.type === 'exam') {
      pointsPerQuestion = 2.5;
    } else {
      pointsPerQuestion = totalQuestions > 0 ? 100 / totalQuestions : 0;
    }

    const calculatedScore = Number((correctCount * pointsPerQuestion).toFixed(2));
    const finalScore = Math.min(100, calculatedScore);

    // Min score logic:
    // Level advance: 61 points
    // General exam approval: 60 points
    const minScoreNeeded = session.type === 'level' ? 61 : 60;
    const passed = finalScore >= minScoreNeeded;

    const timeSpent = session.totalTimeSeconds - timeRemaining;

    const summary: QuizResultSummary = {
      id: `res-${Date.now()}`,
      title: session.title,
      type: session.type,
      subjectId: session.subjectId,
      difficulty: session.difficulty,
      levelNumber: session.levelNumber,
      totalQuestions,
      correctAnswersCount: correctCount,
      score: finalScore,
      passed,
      minScoreNeeded,
      timeSpentSeconds: Math.max(1, timeSpent),
      completedAt: new Date().toISOString(),
      answers: userAnswers,
      questionIds: questions.map(q => q.id)
    };

    onFinishQuiz(summary);
  };

  // Format timer mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedAnswer = userAnswers[currentQuestion.id];

  const cardBg = theme === 'dark' 
    ? 'bg-purple-950/40 border-purple-800/40 text-white' 
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6" id="quiz-player-view">
      {/* Quiz Header Bar */}
      <div className={`p-4 rounded-2xl border mb-4 flex flex-col gap-3 ${cardBg}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#F8AB08] text-[#39005E]">
                {session.title}
              </span>
              <span className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
                Questão <strong>{currentIndex + 1}</strong> de {totalQuestions}
              </span>
            </div>
            <span className="text-xs font-semibold text-[#F8AB08] block mt-0.5">
              {currentQuestion.subtopic} • {currentQuestion.examBoard} {currentQuestion.year}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Timer Badge */}
            <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono font-bold text-sm ${
              timeRemaining < 300 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse' 
                : 'bg-purple-900/40 border-purple-700/50 text-amber-300'
            }`}>
              <Clock className="w-4 h-4 text-[#F8AB08]" />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            {/* Questions Grid Button */}
            <button
              onClick={() => setIsGridOpen(true)}
              className="p-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 text-purple-200 border border-purple-700/40"
              title="Ver grade de questões"
              id="btn-quiz-grid"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Pause / Exit */}
            <button
              onClick={onExitToDashboard}
              className="p-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 text-purple-200 border border-purple-700/40"
              title="Pausar e voltar ao Dashboard"
              id="btn-quiz-pause"
            >
              <PauseCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-purple-900/40 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#F8AB08] to-amber-300 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Info & Flag Toolbar */}
        <div className="flex items-center justify-between pt-1 border-t border-purple-900/20 text-xs">
          <span className={`text-[11px] ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
            Valor por questão: <strong>{session.type === 'exam' ? '2,50 pts' : session.type === 'level' ? '5,00 pts' : `${(100 / totalQuestions).toFixed(2)} pts`}</strong> • Feedback completo no resultado final
          </span>

          <button
            onClick={handleToggleFlag}
            className={`flex items-center gap-1 font-semibold px-2 py-1 rounded-lg transition-colors ${
              flaggedQuestions[currentQuestion.id]
                ? 'bg-amber-500/20 text-[#F8AB08]'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${flaggedQuestions[currentQuestion.id] ? 'fill-current' : ''}`} />
            <span>{flaggedQuestions[currentQuestion.id] ? 'Marcada para Revisar' : 'Marcar'}</span>
          </button>
        </div>
      </div>

      {/* Main Question Card */}
      <div className={`p-5 sm:p-7 rounded-2xl border mb-4 shadow-sm ${cardBg}`} id="question-card">
        {/* Statement */}
        <div className="mb-6">
          <p className="text-base sm:text-lg font-medium leading-relaxed tracking-wide select-text whitespace-pre-line">
            {currentQuestion.statement}
          </p>
        </div>

        {/* Options (5 alternatives A, B, C, D, E) */}
        {/* States: default, hover, ativo (sem sinalizar certo/errado, apenas que foi escolhida!) */}
        <div className="space-y-3" role="radiogroup">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedAnswer === opt.id;

            // Mode default / hover / ativo (SEM sinalizar certo ou errado!)
            let optionStyle = '';
            if (isSelected) {
              // ATIVO: apenas sinalizando que foi escolhida a opção
              optionStyle = theme === 'dark'
                ? 'border-[#F8AB08] bg-[#F8AB08]/15 text-[#F8AB08] ring-2 ring-[#F8AB08]/40 shadow-sm font-semibold'
                : 'border-[#F8AB08] bg-amber-500/15 text-[#39005E] ring-2 ring-[#F8AB08]/50 shadow-sm font-semibold';
            } else {
              // DEFAULT + HOVER
              optionStyle = theme === 'dark'
                ? 'border-purple-800/40 bg-purple-900/25 text-purple-100 hover:border-[#F8AB08]/60 hover:bg-purple-900/40'
                : 'border-slate-200 bg-white text-slate-800 hover:border-[#F8AB08]/80 hover:bg-amber-50/40';
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full min-h-[52px] p-3.5 sm:p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all text-sm sm:text-base cursor-pointer ${optionStyle}`}
                id={`option-btn-${opt.id}`}
                aria-checked={isSelected}
                role="radio"
              >
                {/* Option Letter Badge */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-colors ${
                  isSelected
                    ? 'bg-[#F8AB08] text-[#39005E] font-black shadow-xs'
                    : theme === 'dark' 
                      ? 'bg-purple-900/60 text-purple-200' 
                      : 'bg-slate-100 text-slate-700'
                }`}>
                  {opt.id}
                </div>

                {/* Option Text */}
                <span className="flex-1 pt-0.5 leading-snug">
                  {opt.text}
                </span>

                {/* Selected Indicator (neutral confirmation, without revealing correctness) */}
                {isSelected && (
                  <div className="shrink-0 mt-1 flex items-center gap-1.5 text-xs font-bold text-[#F8AB08]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F8AB08] ring-4 ring-[#F8AB08]/20" />
                    <span className="hidden sm:inline text-[11px] uppercase tracking-wider">Escolhida</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-2 ${cardBg}`}>
        {/* Previous Button */}
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors ${
            currentIndex === 0
              ? 'opacity-30 cursor-not-allowed text-purple-400'
              : 'text-purple-200 hover:text-white hover:bg-purple-900/50'
          }`}
          id="btn-quiz-prev"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden xs:inline">Anterior</span>
        </button>

        {/* Center Progress Quick Text */}
        <div className="text-center">
          <span className="text-xs font-bold text-[#F8AB08]">
            {answeredCount} de {totalQuestions} respondidas
          </span>
        </div>

        {/* Next / Finish Button */}
        {currentIndex < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-900/60 hover:bg-purple-800 text-white border border-purple-700/60 flex items-center gap-1.5 transition-colors"
            id="btn-quiz-next"
          >
            <span>Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => setShowConfirmFinishModal(true)}
            className="px-5 py-2.5 rounded-xl font-extrabold text-sm bg-[#F8AB08] hover:bg-amber-400 text-[#39005E] flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            id="btn-quiz-finish"
          >
            <Send className="w-4 h-4" />
            <span>Finalizar Simulado</span>
          </button>
        )}
      </div>

      {/* Question Grid Modal / Drawer */}
      {isGridOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-5 rounded-2xl border shadow-2xl ${cardBg}`}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-purple-900/30">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Grid className="w-5 h-5 text-[#F8AB08]" />
                Grade Geral de Questões
              </h3>
              <button 
                onClick={() => setIsGridOpen(false)}
                className="p-1.5 rounded-lg hover:bg-purple-900/40 text-purple-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-[60vh] overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;
                const isFlagged = flaggedQuestions[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsGridOpen(false);
                    }}
                    className={`p-2.5 rounded-xl font-mono text-xs font-bold relative border transition-all flex flex-col items-center justify-center ${
                      isCurrent
                        ? 'border-amber-400 ring-2 ring-amber-400/50 bg-amber-400/20 text-amber-300'
                        : isAnswered
                          ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                          : 'border-purple-800 bg-purple-950/40 text-purple-300 hover:bg-purple-900/40'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F8AB08] absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500" /> Respondida
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-2.5 h-2.5 rounded bg-purple-950/40 border border-purple-800" /> Pendente
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-[#F8AB08]" /> Marcada
                </span>
              </div>
              <button
                onClick={() => setIsGridOpen(false)}
                className="px-3 py-1 bg-[#F8AB08] text-[#39005E] font-bold rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Finish */}
      {showConfirmFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl text-center ${cardBg}`}>
            <div className="w-12 h-12 rounded-2xl bg-[#F8AB08]/20 text-[#F8AB08] flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="font-black text-lg sm:text-xl tracking-tight mb-1">
              Finalizar Simulado?
            </h3>
            <p className={`text-xs sm:text-sm mb-4 ${theme === 'dark' ? 'text-purple-200' : 'text-slate-600'}`}>
              Você respondeu <strong className="text-[#F8AB08]">{answeredCount}</strong> de <strong>{totalQuestions}</strong> questões.
              {answeredCount < totalQuestions && (
                <span className="block text-rose-400 font-semibold mt-1">
                  Aviso: restam {totalQuestions - answeredCount} questão(ões) sem resposta!
                </span>
              )}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowConfirmFinishModal(false)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs border ${
                  theme === 'dark' ? 'border-purple-700 hover:bg-purple-900/50 text-purple-200' : 'border-slate-300 text-slate-700'
                }`}
              >
                Voltar e Revisar
              </button>
              <button
                onClick={() => {
                  setShowConfirmFinishModal(false);
                  handleFinish();
                }}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-[#F8AB08] hover:bg-amber-400 text-[#39005E] shadow-md shadow-amber-500/20"
                id="btn-confirm-final-submit"
              >
                Sim, Enviar Respostas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
