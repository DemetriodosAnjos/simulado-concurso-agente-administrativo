import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { QuizResultSummary, Question, SubjectId } from '../types';
import { QUESTIONS_BY_ID } from '../data/questionsLoader';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  ArrowRight, 
  AlertCircle, 
  Lightbulb, 
  Sparkles,
  BookOpen,
  Home,
  ArrowUp
} from 'lucide-react';

interface QuizResultProps {
  summary: QuizResultSummary;
  theme: 'light' | 'dark';
  onRestartLevel: (subjectId: SubjectId, levelNumber: 1 | 2 | 3) => void;
  onRestartSession?: (summary: QuizResultSummary) => void;
  onNextLevel: (subjectId: SubjectId, nextLevelNumber: 1 | 2 | 3) => void;
  onGoToDashboard: () => void;
  onGoToCadernoErros: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({
  summary,
  theme,
  onRestartLevel,
  onRestartSession,
  onNextLevel,
  onGoToDashboard,
  onGoToCadernoErros
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'errors' | 'correct'>('all');

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleRestartLevelOrSession = () => {
    if (onRestartSession) {
      onRestartSession(summary);
    } else if (summary.subjectId && summary.levelNumber) {
      onRestartLevel(summary.subjectId, summary.levelNumber as 1 | 2 | 3);
    } else {
      onGoToDashboard();
    }
  };

  useEffect(() => {
    // Trigger celebratory confetti if passed!
    if (summary.passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F8AB08', '#39005E', '#10B981', '#F59E0B']
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [summary.passed]);

  const questions: Question[] = summary.questionIds
    .map(id => QUESTIONS_BY_ID[id])
    .filter(Boolean);

  const filteredQuestions = questions.filter(q => {
    const isCorrect = summary.answers[q.id] === q.correctOption;
    if (filterMode === 'errors') return !isCorrect;
    if (filterMode === 'correct') return isCorrect;
    return true;
  });

  const accuracyPct = summary.totalQuestions > 0 
    ? Math.round((summary.correctAnswersCount / summary.totalQuestions) * 100) 
    : 0;

  const cardBg = theme === 'dark' 
    ? 'bg-purple-950/40 border-purple-800/40 text-white' 
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  const formatTimeSpent = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6" id="quiz-result-view">
      {/* Result Hero Card */}
      <div className={`p-6 sm:p-8 rounded-3xl border text-center relative overflow-hidden mb-6 ${
        summary.passed
          ? 'bg-gradient-to-b from-purple-950 via-[#39005E] to-purple-900 border-emerald-500/40 text-white'
          : 'bg-gradient-to-b from-purple-950 via-[#39005E] to-purple-900 border-rose-500/40 text-white'
      }`}>
        <div className="max-w-xl mx-auto">
          {/* Badge Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
            summary.passed
              ? 'bg-gradient-to-tr from-emerald-400 to-teal-200 text-[#39005E] ring-4 ring-emerald-500/30'
              : 'bg-gradient-to-tr from-amber-400 to-rose-300 text-[#39005E] ring-4 ring-rose-500/30'
          }`}>
            {summary.passed ? <Trophy className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            {summary.passed 
              ? (summary.type === 'level' ? 'Parabéns! Nível Concluído!' : 'Parabéns! Aprovado no Simulado Geral!') 
              : 'Resultado da Rodada'}
          </h2>

          <p className="text-sm sm:text-base text-purple-200 mb-6">
            {summary.passed ? (
              summary.type === 'level' && summary.levelNumber && summary.levelNumber < 3 ? (
                <span>Você atingiu a pontuação mínima de <strong className="text-[#F8AB08]">61 pontos</strong> e desbloqueou o <strong>Nível {summary.levelNumber + 1}</strong>!</span>
              ) : summary.type === 'level' && summary.levelNumber === 3 ? (
                <span>Você completou o nível máximo (Avançado) desta disciplina com maestria!</span>
              ) : (
                <span>Você atingiu pontuação superior à nota de corte do concurso FAFIPA (60 pontos).</span>
              )
            ) : (
              <span>
                Você obteve <strong>{summary.score} pontos</strong>. Para avançar de nível são necessários no mínimo <strong className="text-[#F8AB08]">61 pontos</strong>. Revise os erros abaixo e tente novamente!
              </span>
            )}
          </p>

          {/* Big Score Gauge */}
          <div className="inline-flex flex-col items-center bg-purple-900/60 border border-purple-700/60 px-8 py-4 rounded-2xl shadow-inner mb-6">
            <span className="text-xs uppercase tracking-widest font-extrabold text-[#F8AB08] mb-1">
              Pontuação Final
            </span>
            <div className="flex items-baseline gap-1 font-mono">
              <span className={`text-4xl sm:text-5xl font-black ${summary.passed ? 'text-emerald-400' : 'text-[#F8AB08]'}`}>
                {summary.score}
              </span>
              <span className="text-purple-300 text-lg">/ 100</span>
            </div>
            <span className="text-xs font-semibold text-purple-200 mt-1">
              {summary.correctAnswersCount} de {summary.totalQuestions} acertos ({accuracyPct}%)
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center mb-6">
            <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-800">
              <span className="text-[11px] text-purple-300 uppercase block font-bold">Tempo Total</span>
              <span className="text-sm font-mono font-bold text-white flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#F8AB08]" />
                {formatTimeSpent(summary.timeSpentSeconds)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-800">
              <span className="text-[11px] text-purple-300 uppercase block font-bold">Nota Mínima</span>
              <span className="text-sm font-mono font-bold text-white">
                {summary.minScoreNeeded} pontos
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-purple-300 uppercase block font-bold">Status</span>
              <span className={`text-sm font-bold uppercase ${summary.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {summary.passed ? '✓ Aprovado' : '✗ Reprovado'}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {summary.type === 'level' && summary.subjectId && summary.levelNumber && (
              <>
                {summary.passed && summary.levelNumber < 3 && (
                  <button
                    onClick={() => onNextLevel(summary.subjectId!, (summary.levelNumber! + 1) as 1 | 2 | 3)}
                    className="px-5 py-3 rounded-xl font-extrabold text-sm bg-[#F8AB08] hover:bg-amber-400 text-[#39005E] flex items-center gap-2 shadow-md shadow-amber-500/20 transition-transform active:scale-95"
                    id="btn-next-level"
                  >
                    <span>Ir para o Nível {summary.levelNumber + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => onRestartLevel(summary.subjectId!, summary.levelNumber as 1 | 2 | 3)}
                  className={`px-4 py-3 rounded-xl font-bold text-sm border flex items-center gap-2 transition-colors ${
                    summary.passed
                      ? 'border-purple-600 bg-purple-900/40 hover:bg-purple-800 text-purple-100'
                      : 'bg-[#F8AB08] hover:bg-amber-400 text-[#39005E] font-extrabold shadow-md'
                  }`}
                  id="btn-retry-level"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Refazer este Nível</span>
                </button>
              </>
            )}

            <button
              onClick={onGoToDashboard}
              className="px-4 py-3 rounded-xl font-bold text-sm border border-purple-700 bg-purple-900/40 hover:bg-purple-800 text-purple-200 flex items-center gap-2"
              id="btn-result-dashboard"
            >
              <Home className="w-4 h-4" />
              <span>Voltar ao Painel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className={`p-5 sm:p-6 rounded-3xl border mb-8 ${cardBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-purple-900/30">
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#F8AB08]" />
              Gabarito e Feedback Detalhado das Questões
            </h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
              Revise o fundamento de cada acerto e erro com as explicações oficiais da banca FAFIPA.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'all' 
                  ? 'bg-[#F8AB08] text-[#39005E]' 
                  : 'bg-purple-900/40 text-purple-200 hover:bg-purple-800/60'
              }`}
            >
              Todas ({questions.length})
            </button>
            <button
              onClick={() => setFilterMode('errors')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'errors' 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-purple-900/40 text-purple-200 hover:bg-purple-800/60'
              }`}
            >
              Erros ({questions.filter(q => summary.answers[q.id] !== q.correctOption).length})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterMode === 'correct' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-purple-900/40 text-purple-200 hover:bg-purple-800/60'
              }`}
            >
              Acertos ({questions.filter(q => summary.answers[q.id] === q.correctOption).length})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const userAnswer = summary.answers[q.id];
            const isCorrect = userAnswer === q.correctOption;

            return (
              <div 
                key={q.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-rose-500/40 bg-rose-500/5'
                }`}
                id={`review-question-${q.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-purple-900/50 text-purple-200">
                      Questão {idx + 1}
                    </span>
                    <span className="text-xs text-[#F8AB08] font-bold">
                      {q.subtopic}
                    </span>
                    <span className={`text-[11px] ${theme === 'dark' ? 'text-purple-400' : 'text-slate-500'}`}>
                      • {q.examBoard} {q.year}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Acertou
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-400">
                        <XCircle className="w-4 h-4" /> Errou
                      </span>
                    )}
                  </div>
                </div>

                {/* User Answer vs Official Key comparison box */}
                <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 ${
                  isCorrect 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center gap-4 flex-wrap text-xs sm:text-sm font-semibold">
                    {/* Vc respondeu: C (ícone - erro) */}
                    <div className="flex items-center gap-1.5">
                      <span className={theme === 'dark' ? 'text-purple-200' : 'text-slate-600'}>Vc respondeu:</span>
                      {userAnswer ? (
                        <span className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded text-xs ${
                          isCorrect 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}>
                          {userAnswer} {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-400 italic">Não respondida</span>
                      )}
                    </div>

                    {/* Resposta Correta: D (Icone - Check) */}
                    <div className="flex items-center gap-1.5">
                      <span className={theme === 'dark' ? 'text-purple-200' : 'text-slate-600'}>Resposta Correta:</span>
                      <span className="inline-flex items-center gap-1 font-black px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {q.correctOption} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-md shrink-0 w-fit ${
                    isCorrect ? 'bg-emerald-500 text-white shadow-xs' : 'bg-rose-500 text-white shadow-xs'
                  }`}>
                    {isCorrect ? '✓ Correta' : '✗ Incorreta'}
                  </span>
                </div>

                {/* Statement */}
                <p className="text-sm sm:text-base font-medium leading-relaxed mb-4 whitespace-pre-line">
                  {q.statement}
                </p>

                {/* Options summary */}
                <div className="space-y-2 mb-3">
                  {q.options.map(opt => {
                    const isUserChoice = userAnswer === opt.id;
                    const isGabarito = opt.id === q.correctOption;

                    let optBg = 'bg-transparent border-purple-900/30 text-slate-300';
                    if (isGabarito) {
                      optBg = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold';
                    } else if (isUserChoice && !isGabarito) {
                      optBg = 'bg-rose-500/20 border-rose-500/60 text-rose-300 line-through';
                    }

                    return (
                      <div 
                        key={opt.id}
                        className={`p-2.5 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${optBg}`}
                      >
                        <span className="font-bold shrink-0">{opt.id})</span>
                        <span className="flex-1">{opt.text}</span>
                        {isGabarito && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-white shrink-0">
                            Gabarito
                          </span>
                        )}
                        {isUserChoice && !isGabarito && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white shrink-0">
                            Sua escolha
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Resposta Correta: SEMPRE trazendo a explicação correta da questão */}
                <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl border border-amber-500/30 bg-purple-900/30 text-xs sm:text-sm leading-relaxed text-purple-100">
                  <div className="flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-[#F8AB08]" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-extrabold text-xs sm:text-sm text-[#F8AB08]">
                          Resposta Correta • Letra {q.correctOption}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          Fundamentação e Gabarito Oficial
                        </span>
                      </div>
                      <p className="opacity-95 leading-relaxed text-slate-100">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer com botões de ação e navegação */}
      <footer 
        className={`p-5 sm:p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${cardBg}`}
        id="result-footer"
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-[#F8AB08]/15 border border-[#F8AB08]/40 flex items-center justify-center text-[#F8AB08] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base tracking-tight">Finalização da Revisão</h4>
            <p className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
              Escolha sua próxima ação de estudo
            </p>
          </div>
        </div>

        {/* 1. Refazer nivel | 2. Voltar ao topo | 3. Voltar ao painel */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-stretch sm:justify-end">
          {/* 1. Refazer nivel */}
          <button
            onClick={handleRestartLevelOrSession}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl font-extrabold text-xs sm:text-sm bg-[#F8AB08] hover:bg-amber-400 text-[#39005E] flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            id="btn-footer-restart"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{summary.type === 'level' ? 'Refazer Nível' : 'Refazer Simulado'}</span>
          </button>

          {/* 2. Voltar ao topo */}
          <button
            onClick={scrollToTop}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl font-bold text-xs sm:text-sm border border-purple-700/60 bg-purple-900/40 hover:bg-purple-800 text-purple-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            id="btn-footer-scroll-top"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Voltar ao Topo</span>
          </button>

          {/* 3. Voltar ao painel */}
          <button
            onClick={onGoToDashboard}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl font-bold text-xs sm:text-sm border border-purple-600/50 bg-purple-800/40 hover:bg-purple-700 text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            id="btn-footer-dashboard"
          >
            <Home className="w-4 h-4" />
            <span>Voltar ao Painel</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
