import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  HelpCircle,
  LayoutDashboard,
  Sparkles,
  Smile,
  GraduationCap,
  Key,
  DollarSign,
  Sun,
  Moon,
  Clock,
  RotateCcw,
  Check
} from "lucide-react";
import { ThemePreference, isNightTimeSchedule } from "../utils/themeManager";
import { ThemeSelector } from "./ThemeSelector";

export interface TourStep {
  title: { pt: string; en: string };
  description: { pt: string; en: string };
  tab?: "dashboard" | "comunicados" | "diaadia" | "academico" | "acesso" | "cobrancas";
  targetId?: string;
  mobileTargetId?: string;
  badge: { pt: string; en: string };
  icon: React.ReactNode;
  isThemeStep?: boolean;
}

export interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: "dashboard" | "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso") => void;
  activeTab: string;
  onOpenHelpCenter?: () => void;
  locale?: string;
  themePreference?: ThemePreference;
  onSelectTheme?: (pref: ThemePreference) => void;
  schoolName?: string;
}

export const TOUR_STORAGE_KEY = "school_guided_tour_dismissed_v2";

export function GuidedTour({ 
  isOpen, 
  onClose, 
  onNavigateTab, 
  activeTab, 
  onOpenHelpCenter,
  locale = "pt",
  themePreference = "system",
  onSelectTheme,
  schoolName = "Escola"
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightCoords, setHighlightCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const isEn = locale === "en";
  const isNight = isNightTimeSchedule();

  const steps: TourStep[] = [
    {
      title: {
        pt: "Painel Geral & Mural",
        en: "Dashboard & Notices"
      },
      description: {
        pt: `Visão geral de ${schoolName}: resumo em tempo real da rotina escolar, tarefas pendentes, avisos prioritários e acesso rápido às funções.`,
        en: `Overview of ${schoolName}: real-time student routine, pending tasks, priority notices, and quick access to core functions.`
      },
      tab: "dashboard",
      targetId: "tour-nav-dashboard",
      mobileTargetId: "tour-mob-dashboard",
      badge: { pt: "Mural", en: "Overview" },
      icon: <LayoutDashboard className="w-4 h-4 text-slate-800 dark:text-slate-200" />
    },
    {
      title: {
        pt: "Tema Inteligente & Agendamento",
        en: "Smart Theme Schedule"
      },
      description: {
        pt: "O portal altera automaticamente: Modo Claro das 6h às 18h e Modo Escuro das 18h às 24h. Você também pode escolher manualmente a qualquer momento.",
        en: "The app shifts automatically: Light Mode (6 AM - 6 PM) and Dark Mode (6 PM - Midnight). You can also override and switch manually anytime."
      },
      badge: { pt: "6h às 18h / 18h às 24h", en: "Auto Schedule" },
      icon: isNight ? (
        <Moon className="w-4 h-4 text-indigo-400" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500" />
      ),
      isThemeStep: true
    },
    {
      title: {
        pt: "Portaria Segura & QR Code",
        en: "Gate Access & Student QR"
      },
      description: {
        pt: "Notifique sua chegada pelo celular para organizar a fila e apresente o passe QR Code dinâmico do aluno para liberação rápida.",
        en: "Signal your arrival via mobile to organize the queue, and present the student dynamic QR Code for fast gate clearance."
      },
      tab: "acesso",
      targetId: "tour-nav-acesso",
      mobileTargetId: "tour-mob-acesso",
      badge: { pt: "Segurança", en: "Gate" },
      icon: <Key className="w-4 h-4 text-slate-800 dark:text-slate-200" />
    },
    {
      title: {
        pt: "Boletim & Acompanhamento",
        en: "Grades & Academic Life"
      },
      description: {
        pt: "Consulte notas bimestrais, controle de faltas, calendário de avaliações e observações pedagógicas dos professores.",
        en: "Check term grades, attendance records, exam schedules, and teacher pedagogical observations."
      },
      tab: "academico",
      targetId: "tour-nav-academico",
      mobileTargetId: "tour-mob-academico",
      badge: { pt: "Acadêmico", en: "Academic" },
      icon: <GraduationCap className="w-4 h-4 text-slate-800 dark:text-slate-200" />
    },
    {
      title: {
        pt: "Mensalidades & Pix Instantâneo",
        en: "Tuition & Instant Pix"
      },
      description: {
        pt: "Acesse boletos bancários com código de barras, pague via Pix instantâneo com baixa imediata e simule acordos de renegociação.",
        en: "Access bank slips, pay instantly via official Pix with automated clearance, and review payment simulations."
      },
      tab: "cobrancas",
      targetId: "tour-nav-cobrancas",
      mobileTargetId: "tour-mob-cobrancas",
      badge: { pt: "Financeiro", en: "Finance" },
      icon: <DollarSign className="w-4 h-4 text-slate-800 dark:text-slate-200" />
    },
    {
      title: {
        pt: "Alternador de Alunos & Replay",
        en: "Student Switcher & Replay"
      },
      description: {
        pt: "Alterne entre filhos cadastrados no seletor superior. Você pode rever este tutorial quando quiser clicando em 'Tutorial'.",
        en: "Switch between enrolled students using the top selector. Replay this walkthrough anytime using the 'Tutorial' button."
      },
      badge: { pt: "Navegação", en: "Navigation" },
      icon: <RotateCcw className="w-4 h-4 text-slate-800 dark:text-slate-200" />
    }
  ];

  // Auto navigate to the tab explained in the current step
  useEffect(() => {
    if (isOpen) {
      const step = steps[currentStep];
      if (step && step.tab) {
        onNavigateTab(step.tab);
      }
    }
  }, [currentStep, isOpen]);

  // Recalculate target position to draw subtle indicator
  useEffect(() => {
    if (!isOpen) {
      setHighlightCoords(null);
      return;
    }

    const updateHighlight = () => {
      const step = steps[currentStep];
      if (!step || !step.targetId) {
        setHighlightCoords(null);
        return;
      }

      const isMobile = window.innerWidth < 640;
      const targetId = isMobile ? step.mobileTargetId : step.targetId;
      if (!targetId) {
        setHighlightCoords(null);
        return;
      }

      const element = document.getElementById(targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      } else {
        setHighlightCoords(null);
      }
    };

    const timeout = setTimeout(updateHighlight, 200);
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight);
    };
  }, [currentStep, isOpen, activeTab]);

  // Keyboard navigation & ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight") {
        if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
        else handleSkip();
      } else if (e.key === "ArrowLeft") {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const currentTour = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleSkip = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    onClose();
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSkip();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Dimmed backdrop - subtle opacity without excessive blur */}
      <div 
        className="fixed inset-0 bg-slate-950/60 transition-opacity cursor-pointer" 
        onClick={handleSkip} 
        aria-label="Fechar tutorial"
      />

      {/* Subtle border outline over target button (no glowing neon halos) */}
      {highlightCoords && (
        <div
          className="absolute z-50 pointer-events-none rounded-xl border-2 border-indigo-500/80 transition-all duration-200"
          style={{
            top: highlightCoords.top - 4,
            left: highlightCoords.left - 4,
            width: highlightCoords.width + 8,
            height: highlightCoords.height + 8,
          }}
        />
      )}

      {/* Main Centered Tour Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl max-w-md w-full pointer-events-auto text-slate-900 dark:text-slate-100 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-300">
                {currentTour.icon}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 block tracking-wider">
                  {isEn ? `Step ${currentStep + 1} of ${steps.length}` : `Passo ${currentStep + 1} de ${steps.length}`}
                </span>
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 block">
                  {isEn ? currentTour.badge.en : currentTour.badge.pt}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={handleSkip}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={isEn ? "Close" : "Fechar"}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 text-left">
            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {isEn ? currentTour.title.en : currentTour.title.pt}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {isEn ? currentTour.description.en : currentTour.description.pt}
            </p>
          </div>

          {/* Interactive Widget for Smart Theme Step */}
          {currentTour.isThemeStep && onSelectTheme && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-left">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Test theme toggle:" : "Experimente o seletor agora:"}
                </span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  {isNight ? (isEn ? "18h-24h (Dark)" : "18h-24h (Escuro)") : (isEn ? "6h-18h (Light)" : "6h-18h (Claro)")}
                </span>
              </div>
              <div className="pt-0.5">
                <ThemeSelector
                  themePreference={themePreference}
                  onSelectTheme={onSelectTheme}
                  variant="segmented"
                  locale={locale}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {isEn 
                  ? "Auto schedule: light (6am-6pm) / dark (6pm-24h). Click Light or Dark for manual choice."
                  : "Regra do sistema: claro das 6h às 18h / escuro das 18h às 24h. Escolha manual tem efeito imediato."}
              </p>
            </div>
          )}

          {/* Step Progress indicators */}
          <div className="flex justify-center items-center gap-1.5 pt-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStep 
                    ? "w-5 bg-slate-900 dark:bg-slate-100" 
                    : "w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300"
                }`}
                aria-label={`Passo ${idx + 1}`}
              />
            ))}
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                {isEn ? "Skip" : "Pular"}
              </button>
              {onOpenHelpCenter && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHelpCenter();
                  }}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer ml-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>{isEn ? "Help" : "Ajuda"}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-1.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{isEn ? "Back" : "Anterior"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-1.5 px-3.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <span>{isLast ? (isEn ? "Finish" : "Concluir") : (isEn ? "Next" : "Avançar")}</span>
                {isLast ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
