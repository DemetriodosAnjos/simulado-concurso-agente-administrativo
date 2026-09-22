import React from 'react';
import { 
  UserPerformance, 
  SubjectId, 
  DifficultyLevel, 
  ActiveSession,
  QuizResultSummary 
} from '../types';
import { SUBJECTS_META } from '../data/questionsLoader';
import { CountdownBanner } from './CountdownBanner';
import { 
  BookOpen, 
  Brain, 
  Laptop, 
  Scale, 
  FolderCheck, 
  Lock, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Flame, 
  Target, 
  Filter, 
  FileText, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface DashboardProps {
  performance: UserPerformance;
  activeSession: ActiveSession | null;
  theme: 'light' | 'dark';
  onStartLevelQuiz: (subjectId: SubjectId, levelNumber: 1 | 2 | 3) => void;
  onStartGeneralExam: () => void;
  onOpenCustomFilter: () => void;
  onOpenCadernoErros: () => void;
  onResumeActiveSession: () => void;
  onDiscardActiveSession: () => void;
  onViewResultSummary: (summary: QuizResultSummary) => void;
  onResetAllProgress: () => void;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-5 h-5" />,
  Brain: <Brain className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
  Scale: <Scale className="w-5 h-5" />,
  FolderCheck: <FolderCheck className="w-5 h-5" />
};

export const Dashboard: React.FC<DashboardProps> = ({
  performance,
  activeSession,
  theme,
  onStartLevelQuiz,
  onStartGeneralExam,
  onOpenCustomFilter,
  onOpenCadernoErros,
  onResumeActiveSession,
  onDiscardActiveSession,
  onViewResultSummary,
  onResetAllProgress
}) => {
  // Compute overall stats
  const totalRounds = performance.history.length;
  let totalQuestionsAnswered = 0;
  let totalCorrect = 0;

  performance.history.forEach(h => {
    totalQuestionsAnswered += h.totalQuestions;
    totalCorrect += h.correctAnswersCount;
  });

  const overallAccuracy = totalQuestionsAnswered > 0 
    ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) 
    : 0;

  let totalUnlockedLevels = 0;
  SUBJECTS_META.forEach(sub => {
    totalUnlockedLevels += performance.unlockedLevels[sub.id] || 1;
  });
  const maxPossibleLevels = SUBJECTS_META.length * 3; // 15 total

  const cardBg = theme === 'dark' 
    ? 'bg-purple-950/40 border-purple-800/40 text-white' 
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  const subCardBg = theme === 'dark' 
    ? 'bg-purple-900/30 border-purple-800/30 hover:border-purple-700/60' 
    : 'bg-slate-50/80 border-slate-200 hover:border-purple-300';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6" id="dashboard-view">
      {/* Countdown & Context Banner */}
      <CountdownBanner theme={theme} />

      {/* Resume Active Session Alert */}
      {activeSession && (
        <div 
          className="mb-6 p-4 rounded-2xl border bg-gradient-to-r from-amber-500/20 via-[#F8AB08]/15 to-purple-900/20 border-[#F8AB08]/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn"
          id="resume-session-banner"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8AB08] text-[#39005E] flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-[#F8AB08] flex items-center gap-2">
                Simulado Pausado: {activeSession.title}
              </h4>
              <p className={`text-xs ${theme === 'dark' ? 'text-purple-200' : 'text-slate-600'}`}>
                Questão {activeSession.currentIndex + 1} de {activeSession.questionIds.length} • Tempo restante: {Math.floor(activeSession.timeRemainingSeconds / 60)}m {activeSession.timeRemainingSeconds % 60}s
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onDiscardActiveSession}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                theme === 'dark' 
                  ? 'border-purple-700/60 hover:bg-purple-800/40 text-purple-300' 
                  : 'border-slate-300 hover:bg-slate-100 text-slate-600'
              }`}
            >
              Descartar
            </button>
            <button
              onClick={onResumeActiveSession}
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#F8AB08] hover:bg-amber-400 text-[#39005E] flex items-center gap-1.5 shadow transition-transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Retomar Agora
            </button>
          </div>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Stat 1: Níveis Desbloqueados */}
        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
              Progresso por Nível
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F8AB08]/15 text-[#F8AB08] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-[#F8AB08] font-mono">
              {totalUnlockedLevels}
            </span>
            <span className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
              /{maxPossibleLevels} níveis
            </span>
          </div>
          <div className="w-full bg-purple-900/30 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-[#F8AB08] h-full rounded-full transition-all duration-500" 
              style={{ width: `${(totalUnlockedLevels / maxPossibleLevels) * 100}%` }}
            />
          </div>
        </div>

        {/* Stat 2: Taxa de Acerto */}
        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
              Taxa de Acertos
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {overallAccuracy}%
            </span>
            <span className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
              geral
            </span>
          </div>
          <p className={`text-[11px] mt-2 ${overallAccuracy >= 61 ? 'text-emerald-400 font-semibold' : 'text-amber-400'}`}>
            {overallAccuracy >= 61 ? '✓ Acima da nota de corte (61)' : '• Meta de corte: 61 pontos'}
          </p>
        </div>

        {/* Stat 3: Questões Feitas */}
        <div className={`p-4 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
              Resolvidas
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
              {totalQuestionsAnswered}
            </span>
            <span className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
              questões
            </span>
          </div>
          <p className={`text-[11px] mt-2 ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
            {totalRounds} rodadas finalizadas
          </p>
        </div>

        {/* Stat 4: Caderno de Erros */}
        <div 
          onClick={onOpenCadernoErros}
          className={`p-4 rounded-2xl border cursor-pointer hover:border-rose-400/60 transition-all group ${cardBg}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
              Caderno de Erros
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
              {performance.errorQuestionIds?.length || 0}
            </span>
            <span className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
              para revisar
            </span>
          </div>
          <p className="text-[11px] mt-2 text-rose-400 flex items-center gap-1 font-semibold">
            Treinar erros agora <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </p>
        </div>
      </div>

      {/* Main Special Actions (Simulado Geral & Filtro Avançado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Simulado Geral FAFIPA */}
        <div className={`p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-between ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-purple-900/60 via-purple-950/70 to-[#39005E]/80 border-purple-700/60' 
            : 'bg-gradient-to-br from-purple-50 via-white to-amber-50/40 border-purple-200 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-[#F8AB08] text-[#39005E]">
                Simulado Oficial FAFIPA
              </span>
              {performance.generalExamHighScore > 0 && (
                <span className="text-xs font-mono font-bold text-amber-300">
                  Melhor Nota: {performance.generalExamHighScore}/100
                </span>
              )}
            </div>
            <h3 className="text-lg font-black tracking-tight mb-1 text-white">
              Simulado Geral Agente Administrativo
            </h3>
            <p className={`text-xs sm:text-sm mb-4 ${theme === 'dark' ? 'text-purple-200' : 'text-slate-600'}`}>
              40 questões balanceadas (Português: 5, RLM: 5, Informática: 5, Legislação: 5 e Específicos: 20) • Valor: <strong>2,50 pontos por questão</strong> (100 pts) • Nota de corte: 60 pontos.
            </p>
          </div>
          <button
            onClick={onStartGeneralExam}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#F8AB08] hover:bg-amber-400 text-[#39005E] flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
            id="btn-start-general-exam"
          >
            <Play className="w-4 h-4 fill-current" />
            Iniciar Simulado Geral Completo
          </button>
        </div>

        {/* Filtro Avançado por Banca e Ano */}
        <div className={`p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-between ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-purple-950/70 via-purple-900/40 to-slate-900/50 border-purple-800/40' 
            : 'bg-gradient-to-br from-amber-50/50 via-white to-slate-50 border-amber-200/70 shadow-sm'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Filtros Personalizados
              </span>
              <span className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
                300 Questões no Banco
              </span>
            </div>
            <h3 className={`text-lg font-black tracking-tight mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Treino por Banca e Ano Específico
            </h3>
            <p className={`text-xs sm:text-sm mb-4 ${theme === 'dark' ? 'text-purple-200' : 'text-slate-600'}`}>
              Filtre questões por Banca Organizadora (FAFIPA e similares), Ano da Prova (2023, 2024), matéria e quantidade de perguntas desejadas.
            </p>
          </div>
          <button
            onClick={onOpenCustomFilter}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm border flex items-center justify-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-purple-600 bg-purple-900/50 hover:bg-purple-800 text-purple-100'
                : 'border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900'
            }`}
            id="btn-open-custom-filter"
          >
            <Filter className="w-4 h-4 text-[#F8AB08]" />
            Abrir Filtro Avançado de Questões
          </button>
        </div>
      </div>

      {/* Disciplines Section with Level Progression */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-lg sm:text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              Disciplinas do Edital • Sistema de Níveis
            </h3>
            <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-purple-300' : 'text-slate-600'}`}>
              Alcance no mínimo <strong>61 pontos</strong> no Nível I para liberar o Nível II, e 61 pontos no Nível II para o Nível III.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {SUBJECTS_META.map((sub) => {
            const currentUnlocked = performance.unlockedLevels[sub.id] || 1;
            const lvl1Key = `${sub.id}_lvl1`;
            const lvl2Key = `${sub.id}_lvl2`;
            const lvl3Key = `${sub.id}_lvl3`;
            const scoreLvl1 = performance.levelHighScores[lvl1Key] || 0;
            const scoreLvl2 = performance.levelHighScores[lvl2Key] || 0;
            const scoreLvl3 = performance.levelHighScores[lvl3Key] || 0;

            return (
              <div 
                key={sub.id} 
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${cardBg}`}
                id={`subject-card-${sub.id}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Subject Info */}
                  <div className="flex items-start gap-3.5 max-w-lg">
                    <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/60 text-[#F8AB08] flex items-center justify-center shrink-0">
                      {ICONS_MAP[sub.iconName] || <BookOpen className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-base tracking-tight">
                          {sub.name}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-purple-900/40 text-purple-300 border border-purple-800">
                          Nível Atual: {currentUnlocked === 1 ? 'I (Básico)' : currentUnlocked === 2 ? 'II (Intermediário)' : 'III (Avançado)'}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 line-clamp-2 ${theme === 'dark' ? 'text-purple-200/80' : 'text-slate-600'}`}>
                        {sub.description}
                      </p>
                    </div>
                  </div>

                  {/* Level Progression Buttons */}
                  <div className="grid grid-cols-3 gap-2 shrink-0 w-full md:w-auto">
                    {/* Level 1 Button */}
                    <button
                      onClick={() => onStartLevelQuiz(sub.id, 1)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                        scoreLvl1 >= 61
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'border-purple-600 bg-purple-900/40 text-purple-200 hover:bg-purple-800/60'
                      }`}
                      id={`btn-${sub.id}-lvl1`}
                      title="Nível I - Básico (20 questões • 100 pts • Feedback detalhado)"
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black">Nível I</span>
                        {scoreLvl1 >= 61 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-[11px] font-mono font-bold">
                        {scoreLvl1 > 0 ? `${scoreLvl1} pts` : 'Iniciar'}
                      </span>
                    </button>

                    {/* Level 2 Button */}
                    <button
                      disabled={currentUnlocked < 2}
                      onClick={() => onStartLevelQuiz(sub.id, 2)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                        currentUnlocked < 2
                          ? 'opacity-40 cursor-not-allowed border-purple-900/30 bg-purple-950/20 text-purple-400'
                          : scoreLvl2 >= 61
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-[#F8AB08]/60 bg-[#F8AB08]/10 text-[#F8AB08] hover:bg-[#F8AB08]/20'
                      }`}
                      id={`btn-${sub.id}-lvl2`}
                      title={currentUnlocked < 2 ? 'Bloqueado: Faça 61+ pontos no Nível I para liberar' : 'Nível II - Intermediário'}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black">Nível II</span>
                        {currentUnlocked < 2 ? (
                          <Lock className="w-3 h-3 text-purple-400" />
                        ) : scoreLvl2 >= 61 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : null}
                      </div>
                      <span className="text-[11px] font-mono font-bold">
                        {currentUnlocked < 2 ? '61 pts Nível I' : scoreLvl2 > 0 ? `${scoreLvl2} pts` : 'Iniciar'}
                      </span>
                    </button>

                    {/* Level 3 Button */}
                    <button
                      disabled={currentUnlocked < 3}
                      onClick={() => onStartLevelQuiz(sub.id, 3)}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                        currentUnlocked < 3
                          ? 'opacity-40 cursor-not-allowed border-purple-900/30 bg-purple-950/20 text-purple-400'
                          : scoreLvl3 >= 61
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'border-[#F8AB08]/60 bg-[#F8AB08]/10 text-[#F8AB08] hover:bg-[#F8AB08]/20'
                      }`}
                      id={`btn-${sub.id}-lvl3`}
                      title={currentUnlocked < 3 ? 'Bloqueado: Faça 61+ pontos no Nível II para liberar' : 'Nível III - Avançado'}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black">Nível III</span>
                        {currentUnlocked < 3 ? (
                          <Lock className="w-3 h-3 text-purple-400" />
                        ) : scoreLvl3 >= 61 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : null}
                      </div>
                      <span className="text-[11px] font-mono font-bold">
                        {currentUnlocked < 3 ? '61 pts Nível II' : scoreLvl3 > 0 ? `${scoreLvl3} pts` : 'Iniciar'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History of Completed Tests */}
      {performance.history.length > 0 && (
        <div className={`p-5 rounded-2xl border ${cardBg}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-base tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F8AB08]" />
              Histórico de Rodadas Finalizadas
            </h3>
            <button
              onClick={onResetAllProgress}
              className={`text-xs hover:text-rose-400 underline transition-colors ${theme === 'dark' ? 'text-purple-400' : 'text-slate-400'}`}
              title="Zerar estatísticas e começar do zero"
            >
              Zerar progresso
            </button>
          </div>

          <div className="divide-y divide-purple-900/30">
            {performance.history.slice(0, 5).map((item) => (
              <div 
                key={item.id} 
                className="py-3 flex items-center justify-between gap-3 hover:bg-purple-900/10 px-2 rounded-lg transition-colors cursor-pointer"
                onClick={() => onViewResultSummary(item)}
              >
                <div>
                  <h5 className="font-bold text-sm text-white">
                    {item.title}
                  </h5>
                  <p className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
                    {item.correctAnswersCount} de {item.totalQuestions} acertos ({Math.round((item.correctAnswersCount / item.totalQuestions) * 100)}%) • {new Date(item.completedAt).toLocaleDateString('pt-BR')} às {new Date(item.completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-sm font-black font-mono block ${item.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.score} / 100
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                      item.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {item.passed ? 'Aprovado' : 'Refazer'}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
