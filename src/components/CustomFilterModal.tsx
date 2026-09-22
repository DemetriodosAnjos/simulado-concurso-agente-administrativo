import React, { useState, useMemo } from 'react';
import { SubjectId, DifficultyLevel, Question } from '../types';
import { 
  ALL_QUESTIONS, 
  SUBJECTS_META, 
  getAvailableExamBoards, 
  getAvailableYears 
} from '../data/questionsLoader';
import { 
  Filter, 
  X, 
  Play, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  GraduationCap, 
  Layers 
} from 'lucide-react';

interface CustomFilterModalProps {
  theme: 'light' | 'dark';
  isOpen: boolean;
  onClose: () => void;
  onStartCustomQuiz: (
    filteredQuestions: Question[],
    title: string,
    isPracticeMode: boolean
  ) => void;
}

export const CustomFilterModal: React.FC<CustomFilterModalProps> = ({
  theme,
  isOpen,
  onClose,
  onStartCustomQuiz
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(true);

  const availableBoards = useMemo(() => getAvailableExamBoards(), []);
  const availableYears = useMemo(() => getAvailableYears(), []);

  // Compute matched questions
  const matchedQuestions = useMemo(() => {
    return ALL_QUESTIONS.filter(q => {
      if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
      if (selectedBoard !== 'all' && q.examBoard !== selectedBoard) return false;
      if (selectedYear !== 'all' && q.year.toString() !== selectedYear) return false;
      return true;
    });
  }, [selectedSubject, selectedDifficulty, selectedBoard, selectedYear]);

  if (!isOpen) return null;

  const handleStart = () => {
    if (matchedQuestions.length === 0) return;
    
    // Shuffle and pick up to questionCount
    const shuffled = [...matchedQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    let title = 'Treino Personalizado';
    if (selectedSubject !== 'all') {
      const s = SUBJECTS_META.find(x => x.id === selectedSubject);
      title = s ? s.shortName : title;
    }
    if (selectedBoard !== 'all') {
      title += ` • ${selectedBoard}`;
    }

    onStartCustomQuiz(selected, title, isPracticeMode);
    onClose();
  };

  const cardBg = theme === 'dark' 
    ? 'bg-purple-950/95 border-purple-800/60 text-white' 
    : 'bg-white border-slate-200 text-slate-900 shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`w-full max-w-lg p-5 sm:p-6 rounded-3xl border shadow-2xl ${cardBg}`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/30 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#F8AB08]/20 text-[#F8AB08] flex items-center justify-center font-bold">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg tracking-tight">
                Filtro Avançado de Questões
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-purple-300' : 'text-slate-500'}`}>
                Crie um caderno de treino sob medida
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-purple-900/40 text-purple-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* 1. Disciplina */}
          <div>
            <label className="text-xs uppercase font-extrabold text-[#F8AB08] block mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" /> Disciplina / Matéria
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-purple-800/60 bg-purple-900/40 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F8AB08]"
            >
              <option value="all">Todas as Disciplinas (300 Questões)</option>
              {SUBJECTS_META.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>

          {/* 2. Dificuldade */}
          <div>
            <label className="text-xs uppercase font-extrabold text-[#F8AB08] block mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Nível de Dificuldade
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-purple-800/60 bg-purple-900/40 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F8AB08]"
            >
              <option value="all">Todos os Níveis</option>
              <option value="basico">Nível I - Básico</option>
              <option value="intermediario">Nível II - Intermediário</option>
              <option value="avancado">Nível III - Avançado</option>
            </select>
          </div>

          {/* 3. Banca & Ano */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase font-extrabold text-[#F8AB08] block mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Banca
              </label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-800/60 bg-purple-900/40 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F8AB08]"
              >
                <option value="all">Todas as Bancas</option>
                {availableBoards.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase font-extrabold text-[#F8AB08] block mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Ano da Prova
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-purple-800/60 bg-purple-900/40 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#F8AB08]"
              >
                <option value="all">Todos os Anos</option>
                {availableYears.map(y => (
                  <option key={y} value={y.toString()}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Quantidade de Questões */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs uppercase font-extrabold text-[#F8AB08]">
                Quantidade de Questões
              </label>
              <span className="text-xs font-mono font-bold text-amber-300">
                {Math.min(questionCount, matchedQuestions.length)} selecionada(s)
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 15, 20, 30].map(cnt => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-1.5 rounded-xl font-mono text-xs font-bold border transition-colors ${
                    questionCount === cnt
                      ? 'bg-[#F8AB08] text-[#39005E] border-[#F8AB08]'
                      : 'bg-purple-900/30 text-purple-200 border-purple-800'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Modo de Resposta */}
          <div className="pt-2 border-t border-purple-900/30 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold block">Feedback Imediato ao Errar</span>
              <span className="text-[11px] text-purple-300">Mostra a justificativa logo após marcar</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPracticeMode(!isPracticeMode)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isPracticeMode ? 'bg-[#F8AB08]' : 'bg-purple-950 border border-purple-700'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white block transition-transform absolute top-1 ${
                isPracticeMode ? 'left-6 bg-[#39005E]' : 'left-1 bg-purple-400'
              }`} />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-purple-900/30 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-emerald-400">
            {matchedQuestions.length} questões encontradas
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-bold text-purple-300 hover:text-white"
            >
              Cancelar
            </button>
            <button
              disabled={matchedQuestions.length === 0}
              onClick={handleStart}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md ${
                matchedQuestions.length === 0
                  ? 'opacity-40 cursor-not-allowed bg-purple-900 text-purple-400'
                  : 'bg-[#F8AB08] hover:bg-amber-400 text-[#39005E]'
              }`}
              id="btn-start-custom-filter"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Iniciar Treino
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
