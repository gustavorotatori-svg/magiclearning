import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Award,
  TrendingUp,
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Users,
  Check
} from "lucide-react";
import { Estudante } from "../types";

export interface PipelineProgressSealProps {
  estudantes: Estudante[];
  onNavigateToPipeline?: () => void;
  onNavigateToFunnelStats?: () => void;
  targetGoalPercent?: number;
  recentAlertCount?: number;
  lastTransition?: {
    studentName: string;
    stageTo: string;
    timestamp: string;
  } | null;
  className?: string;
}

export const PipelineProgressSeal: React.FC<PipelineProgressSealProps> = ({
  estudantes,
  onNavigateToPipeline,
  onNavigateToFunnelStats,
  targetGoalPercent = 85,
  recentAlertCount = 0,
  lastTransition = null,
  className = ""
}) => {
  const total = estudantes.length || 1;
  const concluidos = estudantes.filter((e) => e.reEnrollmentStatus === "concluido").length;
  const emAnalise = estudantes.filter((e) => e.reEnrollmentStatus === "em_analise").length;
  const pendentes = estudantes.filter((e) => e.reEnrollmentStatus === "pendente" || !e.reEnrollmentStatus).length;

  const currentPercent = Math.round((concluidos / total) * 1000) / 10;
  const progressRatio = Math.min(100, Math.round((currentPercent / targetGoalPercent) * 100));

  // Track previous accepted count and lastTransition to trigger pop animation
  const prevConcluidosRef = useRef(concluidos);
  const prevTransitionRef = useRef<string | null>(lastTransition?.timestamp || null);
  const [triggerPop, setTriggerPop] = useState(false);
  const [popMessage, setPopMessage] = useState<string | null>(null);

  // Radial Glow Framer-Motion Variants (Expanding Outward from Blue to Gold)
  const radialGlowVariants = {
    idle: {
      opacity: 0,
      scale: 0.7,
      background: "radial-gradient(circle, rgba(59,130,246,0) 0%, rgba(245,158,11,0) 70%)",
      boxShadow: "0 0 0 0 rgba(245,158,11,0)"
    },
    glowing: {
      opacity: [0, 0.9, 0.95, 0.6, 0],
      scale: [0.7, 1.4, 1.85, 2.2, 2.5],
      background: [
        "radial-gradient(circle, rgba(59,130,246,0.7) 0%, rgba(99,102,241,0.4) 40%, rgba(245,158,11,0) 70%)",
        "radial-gradient(circle, rgba(99,102,241,0.85) 0%, rgba(245,158,11,0.7) 50%, rgba(251,191,36,0) 75%)",
        "radial-gradient(circle, rgba(245,158,11,0.95) 0%, rgba(251,191,36,0.75) 45%, rgba(217,119,6,0) 80%)",
        "radial-gradient(circle, rgba(251,191,36,0.6) 0%, rgba(245,158,11,0.3) 60%, rgba(245,158,11,0) 85%)",
        "radial-gradient(circle, rgba(245,158,11,0) 0%, rgba(245,158,11,0) 100%)"
      ],
      boxShadow: [
        "0 0 12px 3px rgba(59, 130, 246, 0.4)",
        "0 0 28px 10px rgba(99, 102, 241, 0.55)",
        "0 0 50px 18px rgba(245, 158, 11, 0.65)",
        "0 0 24px 6px rgba(251, 191, 36, 0.35)",
        "0 0 0 0 rgba(245, 158, 11, 0)"
      ],
      transition: {
        duration: 2.2,
        ease: "easeOut"
      }
    }
  };

  const sealPopVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      borderColor: "rgba(226, 232, 240, 1)",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    },
    pop: {
      scale: [1, 1.03, 0.99, 1.015, 1],
      borderColor: [
        "#94a3b8",
        "#3b82f6",
        "#6366f1",
        "#f59e0b",
        "#fbbf24",
        "#e2e8f0"
      ],
      boxShadow: [
        "0 1px 3px rgba(0,0,0,0.05)",
        "0 10px 28px rgba(59, 130, 246, 0.3)",
        "0 14px 36px rgba(245, 158, 11, 0.4)",
        "0 2px 6px rgba(0,0,0,0.05)"
      ],
      transition: { duration: 1.4, ease: "easeInOut" }
    }
  };

  useEffect(() => {
    const isNewAcceptedTransition =
      lastTransition &&
      lastTransition.timestamp !== prevTransitionRef.current &&
      (lastTransition.stageTo.toLowerCase().includes("aceito") ||
        lastTransition.stageTo.toLowerCase().includes("concluido"));

    const countIncreased = concluidos > prevConcluidosRef.current;

    if (isNewAcceptedTransition || countIncreased) {
      setTriggerPop(true);
      if (lastTransition?.studentName) {
        setPopMessage(`🎉 Contrato Aceito: ${lastTransition.studentName}`);
      }
      const timer = setTimeout(() => {
        setTriggerPop(false);
        setPopMessage(null);
      }, 2600);
      prevConcluidosRef.current = concluidos;
      prevTransitionRef.current = lastTransition?.timestamp || null;
      return () => clearTimeout(timer);
    }

    prevConcluidosRef.current = concluidos;
    prevTransitionRef.current = lastTransition?.timestamp || null;
  }, [concluidos, lastTransition]);

  // Determine Badge Tier based on retention progress
  const getBadgeTier = () => {
    if (currentPercent >= targetGoalPercent) {
      return {
        label: "Selo Ouro de Retenção",
        level: "Meta Batida! 🏆",
        color: "text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700",
        ringColor: "#f59e0b",
        glow: "shadow-amber-500/10"
      };
    }
    if (currentPercent >= targetGoalPercent * 0.75) {
      return {
        label: "Selo Prata de Retenção",
        level: "Reta Final 🚀",
        color: "text-emerald-700 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700",
        ringColor: "#10b981",
        glow: "shadow-emerald-500/10"
      };
    }
    return {
      label: "Selo Bronze de Retenção",
      level: "Em Aceleração 📈",
      color: "text-indigo-700 dark:text-indigo-300 bg-indigo-100/90 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700",
      ringColor: "#6366f1",
      glow: "shadow-indigo-500/10"
    };
  };

  const tier = getBadgeTier();

  return (
    <motion.div
      id="crm-pipeline-progress-seal"
      variants={sealPopVariants}
      animate={triggerPop ? "pop" : "idle"}
      className={`PipelineProgressSeal relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all overflow-hidden ${className}`}
    >
      {/* Radial Glow Layer Expanding Outwards via Framer Motion Variants */}
      <motion.div
        variants={radialGlowVariants}
        initial="idle"
        animate={triggerPop ? "glowing" : "idle"}
        className="pointer-events-none absolute left-10 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full z-10"
      />

      {/* Floating Pop Celebration Pill (Animated Blue to Gold) */}
      <AnimatePresence>
        {triggerPop && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.75 }}
            animate={{
              opacity: 1,
              y: -14,
              scale: [0.75, 1.1, 0.97, 1.03, 1],
              backgroundColor: ["#2563eb", "#4f46e5", "#f59e0b", "#d97706"],
              borderColor: ["#60a5fa", "#818cf8", "#fde047", "#f59e0b"]
            }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="absolute -top-3.5 right-6 z-30 text-white font-mono text-[10.5px] font-black px-3 py-1 rounded-full shadow-xl flex items-center gap-1.5 border"
          >
            <motion.div
              animate={{ rotate: [0, 180, 360], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            </motion.div>
            <span>{popMessage || "🎉 Contrato Aceito: Selo Atualizado!"}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-20">
        
        {/* Left: Medal / Seal & Main Metrics */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Circular SVG Gauge / Seal with Smooth Pop Effect & Blue-to-Gold Chromatic Transition */}
          <motion.div
            animate={
              triggerPop
                ? {
                    scale: [1, 1.25, 0.94, 1.1, 1],
                    rotate: [0, -8, 8, -4, 0]
                  }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="relative w-16 h-16 shrink-0 flex items-center justify-center"
          >
            {/* Secondary radial glow backing ring */}
            <motion.div
              animate={
                triggerPop
                  ? {
                      scale: [1, 1.6, 2.0, 1],
                      opacity: [0, 0.8, 0.4, 0]
                    }
                  : { scale: 1, opacity: 0 }
              }
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-radial from-amber-400/50 via-indigo-500/20 to-transparent pointer-events-none"
            />

            <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 36 36">
              {/* Background circle */}
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Progress arc with Blue to Gold chromatic animation */}
              <motion.path
                initial={{ strokeDasharray: "0, 100" }}
                animate={{
                  strokeDasharray: `${currentPercent}, 100`,
                  stroke: triggerPop
                    ? ["#3b82f6", "#6366f1", "#eab308", "#f59e0b", "#d97706"]
                    : tier.ringColor
                }}
                transition={{
                  strokeDasharray: { duration: 1.2, ease: "easeOut" },
                  stroke: { duration: 1.8, ease: "easeInOut" }
                }}
                strokeWidth={triggerPop ? "4.4" : "3.5"}
                strokeDasharray={`${currentPercent}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
              <motion.div
                animate={
                  triggerPop
                    ? {
                        scale: [1, 1.4, 0.95, 1.2, 1],
                        color: ["#3b82f6", "#6366f1", "#f59e0b", "#d97706"]
                      }
                    : { scale: 1, color: tier.ringColor }
                }
                transition={{ duration: 1.4, ease: "easeInOut" }}
              >
                <Award className="w-5 h-5" />
              </motion.div>
              <span className="text-[10px] font-black font-mono leading-none text-slate-800 dark:text-slate-100 mt-0.5">
                {currentPercent}%
              </span>
            </div>
          </motion.div>

          {/* Details */}
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <motion.span
                animate={
                  triggerPop
                    ? {
                        scale: [1, 1.08, 1],
                        borderColor: ["#93c5fd", "#fde047", "#f59e0b"]
                      }
                    : { scale: 1 }
                }
                transition={{ duration: 1.2 }}
                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${tier.color} flex items-center gap-1`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{tier.label}</span>
              </motion.span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                Meta: {targetGoalPercent}% ({progressRatio}% atingida)
              </span>
            </div>
            
            <h4 className="text-sm font-serif font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Progresso do Funil de Rematrículas 2027</span>
              <span className="text-[11px] font-mono font-normal text-emerald-600 dark:text-emerald-400 font-sans">
                ({tier.level})
              </span>
            </h4>

            {/* Micro pipeline distribution pills */}
            <div className="flex items-center gap-2 pt-0.5 text-[11px] font-mono flex-wrap">
              <motion.span
                animate={
                  triggerPop
                    ? {
                        scale: [1, 1.18, 0.96, 1.08, 1],
                        backgroundColor: [
                          "rgba(239, 246, 255, 1)",
                          "rgba(254, 243, 199, 1)",
                          "rgba(236, 253, 245, 1)"
                        ]
                      }
                    : { scale: 1 }
                }
                transition={{ duration: 1.4 }}
                className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/40"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{concluidos} Aceitos</span>
              </motion.span>
              <span className="text-amber-700 dark:text-amber-300 font-bold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/40">
                <MessageSquare className="w-3 h-3 text-amber-600" />
                <span>{emAnalise} Em Negociação</span>
              </span>
              <span className="text-orange-700 dark:text-orange-300 font-bold flex items-center gap-1 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-200/50 dark:border-orange-800/40">
                <Clock className="w-3 h-3 text-orange-600" />
                <span>{pendentes} Pendentes</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Live Push Alerts Status & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 lg:border-l lg:border-slate-100 lg:dark:border-slate-800 lg:pl-4">
          
          {/* Last Transition Ticker or Push Alert Badge */}
          {lastTransition ? (
            <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 py-1.5 text-left max-w-xs">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold block">
                Última Atualização
              </span>
              <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold truncate">
                {lastTransition.studentName} → <span className="text-emerald-600 dark:text-emerald-400">{lastTransition.stageTo}</span>
              </p>
              <span className="text-[9px] text-slate-400 font-mono block">
                {lastTransition.timestamp}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Notificações ativas para o funil</span>
            </div>
          )}

          {/* Action to Jump to Conversion Funnel Stats */}
          {onNavigateToFunnelStats && (
            <button
              type="button"
              id="btn-nav-whatsapp-funnel-stats"
              onClick={onNavigateToFunnelStats}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-sans transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Acessar painel de estatísticas de conversão no WhatsApp vs leitura de comunicados"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Funil WhatsApp</span>
            </button>
          )}

          {/* Action to Jump to CRM Pipeline */}
          {onNavigateToPipeline && (
            <button
              type="button"
              onClick={onNavigateToPipeline}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-sans transition-all shadow-xs hover:shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Gerenciar Funil</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
};


