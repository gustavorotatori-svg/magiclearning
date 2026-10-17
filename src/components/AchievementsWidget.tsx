import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Sparkles, Check, Flame, Trophy } from "lucide-react";

interface AchievementsWidgetProps {
  magicCoins: number;
  completedQuests: string[];
}

export const AchievementsWidget: React.FC<AchievementsWidgetProps> = ({
  magicCoins,
  completedQuests
}) => {
  const [simulateMastery, setSimulateMastery] = useState<boolean>(false);
  const masteryTarget = 300;
  const isMasteryReached = magicCoins >= masteryTarget || simulateMastery;
  const currentProgress = Math.min((magicCoins / masteryTarget) * 100, 100);

  // Define badges
  const badges = [
    {
      id: "badge-1",
      title: "Início da Jornada",
      description: "Iniciou sua trajetória no portal",
      emoji: "🌟",
      unlocked: magicCoins >= 100,
      req: "Acumular 100 pontos de participação"
    },
    {
      id: "badge-2",
      title: "Robótica & Lógica",
      description: "Concluiu a atividade prática",
      emoji: "🤖",
      unlocked: completedQuests.includes("quest-2"),
      req: "Completar Atividade de Robótica"
    },
    {
      id: "badge-3",
      title: "Leitura Crítica",
      description: "Concluiu a leitura recomendada",
      emoji: "📖",
      unlocked: completedQuests.includes("quest-1"),
      req: "Completar Atividade de Leitura"
    },
    {
      id: "badge-4",
      title: "Ciências Aplicadas",
      description: "Concluiu o módulo de laboratório",
      emoji: "🔬",
      unlocked: completedQuests.includes("quest-3"),
      req: "Completar Módulo de Ciências"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Achievements Widget Card */}
      <motion.div
        className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 space-y-4 shadow-xs transition-all relative overflow-hidden ${
          isMasteryReached 
            ? "border-amber-400/80 bg-gradient-to-b from-amber-50/20 to-white dark:from-slate-950/40 dark:to-slate-900" 
            : "border-slate-200 dark:border-slate-800"
        }`}
      >
        {/* Title */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
            <Trophy className={`w-3.5 h-3.5 ${isMasteryReached ? "text-amber-500" : "text-slate-400"}`} />
            <span>Mérito & Conquistas Pedagógicas</span>
          </h4>
          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md font-mono">
            CERTIFICAÇÃO
          </span>
        </div>

        {/* School Target Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-normal flex items-center gap-1">
              Meta do Período: <strong className="font-bold text-slate-700 dark:text-slate-300">{masteryTarget} Pontos</strong>
            </span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">
              {magicCoins} / {masteryTarget}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden relative">
            <motion.div 
              className={`h-full rounded-full ${
                isMasteryReached 
                  ? "bg-amber-500" 
                  : "bg-slate-700 dark:bg-slate-300"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${currentProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          {isMasteryReached ? (
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-lg justify-center">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Meta de Desempenho Bimestral Atingida</span>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal text-center">
              Realize as atividades do plano de estudos para acumular pontos de participação.
            </p>
          )}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {badges.map((badge) => {
            const unlocked = badge.unlocked;
            return (
              <motion.div
                key={badge.id}
                whileHover={{ y: -2 }}
                className={`p-2.5 rounded-2xl border text-center relative flex flex-col items-center justify-center space-y-1 transition-all ${
                  unlocked
                    ? isMasteryReached
                      ? "border-amber-400/60 bg-gradient-to-b from-amber-500/5 to-amber-500/15 dark:from-amber-950/20 dark:to-amber-900/10 shadow-xs"
                      : "border-purple-100 bg-purple-50/15 dark:border-slate-800/80 dark:bg-slate-950/40"
                    : "border-slate-100 bg-slate-50/50 dark:border-slate-850 dark:bg-slate-950/10 opacity-55"
                }`}
              >
                {/* Golden aura sparkle effect when mastery is reached and badge is unlocked */}
                {isMasteryReached && unlocked && (
                  <motion.div 
                    className="absolute inset-0 border-2 border-amber-400/40 rounded-2xl pointer-events-none"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                )}

                <div className="relative">
                  <span className={`text-2xl block select-none ${unlocked ? "" : "grayscale contrast-50"}`}>
                    {badge.emoji}
                  </span>
                  {unlocked && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white dark:border-slate-900">
                      <Check className="w-2 h-2 stroke-[4]" />
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-black text-slate-700 dark:text-slate-300 truncate max-w-full">
                    {badge.title}
                  </h5>
                  <p className="text-[8px] text-slate-400 leading-tight">
                    {unlocked ? badge.description : badge.req}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Manual simulator toggle for teachers/evaluators */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[9px] text-slate-400 font-mono">SIMULAR TESTES</span>
          <label className="relative inline-flex items-center cursor-pointer select-none scale-90 origin-right">
            <input 
              type="checkbox" 
              checked={simulateMastery} 
              onChange={() => setSimulateMastery(!simulateMastery)}
              className="sr-only peer"
            />
            <div className="w-7 h-4 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="ml-1 text-[9px] text-slate-400 font-bold uppercase">Ativar Maestria</span>
          </label>
        </div>
      </motion.div>
    </div>
  );
};
