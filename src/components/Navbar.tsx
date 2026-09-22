import React from 'react';
import { 
  Award, 
  Moon, 
  Sun, 
  BookOpen, 
  AlertCircle, 
  PlayCircle,
  BarChart3,
  Flame
} from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'quiz' | 'result' | 'caderno_erros';
  onNavigate: (view: 'dashboard' | 'caderno_erros') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  errorCount: number;
  hasActiveSession: boolean;
  onResumeSession?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
  errorCount,
  hasActiveSession,
  onResumeSession
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b transition-colors shadow-sm bg-[#39005E] text-white border-purple-950/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
          id="nav-brand-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F8AB08] to-amber-300 flex items-center justify-center text-[#39005E] font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                PREPARA<span className="text-[#F8AB08]">CURITIBA</span>
              </span>
              <span className="text-[10px] uppercase font-bold bg-[#F8AB08] text-[#39005E] px-1.5 py-0.5 rounded tracking-wider">
                FAFIPA
              </span>
            </div>
            <p className="text-xs text-purple-200/80 -mt-1 hidden sm:block">
              Agente Administrativo • Edital 2026
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasActiveSession && currentView !== 'quiz' && onResumeSession && (
            <button
              onClick={onResumeSession}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-[#F8AB08] hover:bg-[#e09a05] text-[#39005E] px-3 py-1.5 rounded-lg shadow-sm animate-pulse transition-colors"
              id="nav-btn-resume"
              title="Continuar simulado em andamento"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Continuar</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
              currentView === 'dashboard' 
                ? 'bg-white/15 text-white font-semibold' 
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
            id="nav-btn-dashboard"
          >
            <BarChart3 className="w-4 h-4 text-[#F8AB08]" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('caderno_erros')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors relative ${
              currentView === 'caderno_erros'
                ? 'bg-white/15 text-white font-semibold'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
            id="nav-btn-errors"
            title="Caderno de Questões Erradas"
          >
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Caderno de Erros</span>
            {errorCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow">
                {errorCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-amber-300 transition-colors border border-purple-800/50"
            id="nav-btn-theme-toggle"
            aria-label="Alternar Modo Escuro / Claro"
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
