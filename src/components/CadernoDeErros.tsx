import React, { useState } from 'react';
import { UserPerformance, Question, SubjectId } from '../types';
import { QUESTIONS_BY_ID, SUBJECTS_META } from '../data/questionsLoader';
import { 
  AlertCircle, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Trash2, 
  BookOpen, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  Filter
} from 'lucide-react';

interface CadernoDeErrosProps {
  performance: UserPerformance;
  theme: 'light' | 'dark';
  onStartErrorsQuiz: (questionIds: string[]) => void;
  onClearErrors: () => void;
  onBackToDashboard: () => void;
}

export const CadernoDeErros: React.FC<CadernoDeErrosProps> = ({
  performance,
  theme,
  onStartErrorsQuiz,
  onClearErrors,
  onBackToDashboard
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const errorIds = performance.errorQuestionIds || [];
  const errorQuestions: Question[] = errorIds
    .map(id => QUESTIONS_BY_ID[id])
    .filter(Boolean);

  const filteredErrors = errorQuestions.filter(q => {
    if (selectedSubject === 'all') return true;
    return q.subject === selectedSubject;
  });

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const cardBg = theme === 'dark' 
    ? 'bg-purple-950/40 border-purple-800/40 text-white' 
    : 'bg-white border-slate-200 text-slate-900 shadow-xs';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6" id="caderno-erros-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onBackToDashboard}
            className={`flex items-center gap-1.5 text-xs font-bold mb-2 transition-colors ${
              theme === 'dark' ? 'text-purple-300 hover:text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Painel Principal
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Caderno de Erros Inteligente
              </h2>
              <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-slate-600'}`}>
                {errorQuestions.length} questões erradas aguardando revisão e fixação.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action */}
        {errorQuestions.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStartErrorsQuiz(filteredErrors.map(q => q.id))}
              className="px-4 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-[#F8AB08] hover:bg-amber-400 text-[#39005E] flex items-center gap-2 shadow-md shadow-amber-500/20"
              id="btn-train-all-errors"
            >
              <Play className="w-4 h-4 fill-current" />
              Treinar {filteredErrors.length} Questões
            </button>
            <button
              onClick={onClearErrors}
              className="p-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs"
              title="Limpar caderno de erros"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Subject Filter Bar */}
      {errorQuestions.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedSubject === 'all'
                ? 'bg-[#F8AB08] text-[#39005E]'
                : 'bg-purple-900/30 text-purple-200 hover:bg-purple-800/50'
            }`}
          >
            Todas ({errorQuestions.length})
          </button>
          {SUBJECTS_META.map(sub => {
            const count = errorQuestions.filter(q => q.subject === sub.id).length;
            if (count === 0) return null;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedSubject === sub.id
                    ? 'bg-[#F8AB08] text-[#39005E]'
                    : 'bg-purple-900/30 text-purple-200 hover:bg-purple-800/50'
                }`}
              >
                {sub.shortName} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {errorQuestions.length === 0 ? (
        <div className={`p-10 rounded-3xl border text-center ${cardBg}`}>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black tracking-tight mb-1">
            Nenhuma questão no caderno de erros!
          </h3>
          <p className={`text-xs sm:text-sm max-w-md mx-auto mb-4 ${theme === 'dark' ? 'text-purple-200' : 'text-slate-600'}`}>
            Excelente desempenho! Conforme você realiza simulados e níveis, as questões que eventualmente errar serão salvas automaticamente aqui para você treinar até acertar.
          </p>
          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 rounded-xl bg-[#F8AB08] text-[#39005E] font-bold text-xs"
          >
            Voltar para o Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredErrors.map((q, idx) => {
            const isExpanded = expandedItems[q.id] ?? false;

            return (
              <div 
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${cardBg}`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      Questão {idx + 1}
                    </span>
                    <span className="text-xs text-[#F8AB08] font-bold">
                      {q.subtopic}
                    </span>
                    <span className={`text-[11px] ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
                      • {q.examBoard} {q.year} • Nível {q.levelNumber}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-900/60 text-purple-200">
                    Gabarito: {q.correctOption}
                  </span>
                </div>

                {/* Statement */}
                <p className="text-sm font-medium leading-relaxed mb-4 whitespace-pre-line">
                  {q.statement}
                </p>

                {/* Toggle details */}
                <button
                  onClick={() => toggleExpand(q.id)}
                  className="text-xs font-bold text-[#F8AB08] hover:underline flex items-center gap-1 mb-2"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{isExpanded ? 'Ocultar Justificativa Pedagógica' : 'Ver Justificativa Pedagógica'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {isExpanded && (
                  <div className="mt-2 p-3.5 rounded-xl bg-purple-900/30 border border-amber-500/30 text-xs sm:text-sm text-purple-100 animate-fadeIn">
                    <p className="font-extrabold text-[#F8AB08] mb-1 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-[#F8AB08]" /> Resposta Correta • Letra {q.correctOption} (Gabarito Oficial {q.examBoard}):
                    </p>
                    <p className="leading-relaxed text-slate-100">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
