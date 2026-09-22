import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, Target, CheckCircle2 } from 'lucide-react';

interface CountdownBannerProps {
  theme: 'light' | 'dark';
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeRemaining(targetDate: Date): TimeRemaining {
  const diff = targetDate.getTime() - new Date().getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, isPast: false };
}

export const CountdownBanner: React.FC<CountdownBannerProps> = ({ theme }) => {
  // Concurso Agente Administrativo FAFIPA
  // Inscrições até 05/11/2026 23:59:59
  // Prova Objetiva em 13/12/2026 08:00:00
  const inscricoesDate = new Date('2026-11-05T23:59:59');
  const provaDate = new Date('2026-12-13T08:00:00');

  const [inscricoesTime, setInscricoesTime] = useState<TimeRemaining>(() => calculateTimeRemaining(inscricoesDate));
  const [provaTime, setProvaTime] = useState<TimeRemaining>(() => calculateTimeRemaining(provaDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setInscricoesTime(calculateTimeRemaining(inscricoesDate));
      setProvaTime(calculateTimeRemaining(provaDate));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cardBg = theme === 'dark' 
    ? 'bg-gradient-to-r from-purple-950 via-[#39005E] to-purple-900 border-purple-800/60 text-white' 
    : 'bg-gradient-to-r from-purple-50 via-amber-50/50 to-white border-purple-200 text-slate-800';

  return (
    <div className={`w-full border rounded-2xl p-4 sm:p-5 shadow-sm mb-6 ${cardBg}`} id="countdown-banner">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Concurso Context */}
        <div className="flex items-start gap-3 max-w-xl">
          <div className="w-11 h-11 rounded-xl bg-[#F8AB08] text-[#39005E] flex items-center justify-center font-black shrink-0 shadow-md">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-base sm:text-lg tracking-tight">
                Concurso Prefeitura de Curitiba
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#F8AB08]/20 text-[#F8AB08] border border-[#F8AB08]/30">
                Banca FAFIPA
              </span>
            </div>
            <p className={`text-xs sm:text-sm mt-0.5 ${theme === 'dark' ? 'text-purple-200' : 'text-slate-600'}`}>
              Cargo: <strong className="text-[#F8AB08]">Agente Administrativo</strong> • Sistema de níveis com nota mínima de <strong className="underline decoration-[#F8AB08] decoration-2">61 pontos</strong> para avançar e 60 pontos na prova geral.
            </p>
          </div>
        </div>

        {/* Right: Timers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
          {/* Inscrições Card */}
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${
            theme === 'dark' ? 'bg-purple-900/40 border-purple-700/50' : 'bg-white border-purple-100 shadow-xs'
          }`}>
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#F8AB08]" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold block text-amber-400">
                Fim das Inscrições (05/11/2026)
              </span>
              <div className="text-sm sm:text-base font-extrabold font-mono tracking-tight text-white flex items-center gap-1">
                {inscricoesTime.isPast ? (
                  <span className="text-rose-400 font-semibold text-xs">Inscrições encerradas</span>
                ) : (
                  <span>
                    {inscricoesTime.days}d {inscricoesTime.hours}h {inscricoesTime.minutes}m {inscricoesTime.seconds}s
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Prova Card */}
          <div className={`p-3 rounded-xl border flex items-center gap-3 ${
            theme === 'dark' ? 'bg-purple-900/40 border-purple-700/50' : 'bg-white border-purple-100 shadow-xs'
          }`}>
            <div className="w-9 h-9 rounded-lg bg-[#F8AB08]/20 text-[#F8AB08] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold block text-[#F8AB08]">
                Data da Prova (13/12/2026)
              </span>
              <div className="text-sm sm:text-base font-extrabold font-mono tracking-tight text-white flex items-center gap-1">
                {provaTime.isPast ? (
                  <span className="text-emerald-400 font-semibold text-xs">Prova realizada</span>
                ) : (
                  <span>
                    {provaTime.days}d {provaTime.hours}h {provaTime.minutes}m {provaTime.seconds}s
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
