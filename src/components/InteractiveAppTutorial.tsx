import React, { useState, useEffect } from "react";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Compass, 
  RotateCcw,
  Sun,
  Moon,
  Clock,
  QrCode,
  CreditCard,
  GraduationCap,
  Users,
  LayoutDashboard
} from "lucide-react";
import { ThemePreference, isNightTimeSchedule } from "../utils/themeManager";
import { ThemeSelector } from "./ThemeSelector";

export interface TutorialStep {
  id: string;
  badge: { pt: string; en: string };
  title: { pt: string; en: string };
  description: { pt: string; en: string };
  actionLabel?: { pt: string; en: string };
  targetTab?: string;
  icon: React.ReactNode;
}

interface InteractiveAppTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  themePreference: ThemePreference;
  onSelectTheme: (pref: ThemePreference) => void;
  onNavigateTab?: (tabId: string) => void;
  currentRole: "pais" | "escola" | "aluno";
  schoolName: string;
}

export const TUTORIAL_STORAGE_KEY = "school_app_interactive_tutorial_completed";

export const InteractiveAppTutorial: React.FC<InteractiveAppTutorialProps> = ({
  isOpen,
  onClose,
  locale = "pt",
  themePreference,
  onSelectTheme,
  onNavigateTab,
  schoolName,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const isNight = isNightTimeSchedule();

  const isEn = locale === "en";

  const steps: TutorialStep[] = [
    {
      id: "overview",
      badge: { pt: "Passo 1: Visão Geral", en: "Step 1: Overview" },
      title: { pt: "MagicLearning OS", en: "MagicLearning OS" },
      description: {
        pt: `Ambiente unificado de ${schoolName}. Aqui você acompanha a rotina escolar, notas, avisos em tempo real e operações do dia a dia em um só lugar.`,
        en: `Unified workspace for ${schoolName}. Track academic progress, daily routines, instant notices, and school operations in one place.`
      },
      actionLabel: { pt: "Ir para Mural", en: "Go to Dashboard" },
      targetTab: "dashboard",
      icon: <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    },
    {
      id: "theme_schedule",
      badge: { pt: "Passo 2: Tema Inteligente", en: "Step 2: Smart Theme" },
      title: { pt: "Claro de Dia, Escuro à Noite", en: "Light by Day, Dark at Night" },
      description: {
        pt: "O sistema alterna sozinho: Modo Claro das 6h às 18h e Modo Escuro das 18h às 24h. Se preferir, você pode definir manualmente seu modo favorito a qualquer momento.",
        en: "Automatic schedule: Light Mode from 6 AM to 6 PM and Dark Mode from 6 PM to midnight. You can also override and choose manual light or dark anytime."
      },
      icon: isNight ? (
        <Moon className="w-5 h-5 text-indigo-400" />
      ) : (
        <Sun className="w-5 h-5 text-amber-500" />
      )
    },
    {
      id: "portaria",
      badge: { pt: "Passo 3: Portaria Síncrona", en: "Step 3: Gate Access" },
      title: { pt: "Entrada, Saída & QR Code", en: "Check-in & Student QR" },
      description: {
        pt: "Avise a aproximação pelo app para organizar a saída e utilize o QR Code dinâmico do aluno para liberação rápida e segura na portaria.",
        en: "Notify your arrival through the app to expedite pickup, and use the dynamic student QR Code for secure gate clearance."
      },
      actionLabel: { pt: "Ver Portaria", en: "Open Gate Access" },
      targetTab: "portaria",
      icon: <QrCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    },
    {
      id: "academic",
      badge: { pt: "Passo 4: Vida Escolar", en: "Step 4: Academic Life" },
      title: { pt: "Boletim, Agenda & Recados", en: "Report Card & Daily Agenda" },
      description: {
        pt: "Acompanhe tarefas, frequência, notas bimestrais e recados dos professores sem burocracia ou perda de comunicados em papel.",
        en: "Access homework, attendance, term grades, and teacher messages without delays or lost paper slips."
      },
      actionLabel: { pt: "Ver Boletim", en: "Open Grades" },
      targetTab: "boletim",
      icon: <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    },
    {
      id: "finance",
      badge: { pt: "Passo 5: Financeiro", en: "Step 5: Tuition & Payments" },
      title: { pt: "Boletos, Pix & Renegociação", en: "Invoices, Pix & Terms" },
      description: {
        pt: "Consulte cobranças em aberto, realize pagamento instantâneo por Pix com baixa automática e acesse a simulação de parcelamentos.",
        en: "Check open invoices, pay instantly via Pix with automatic settlement, and explore installment simulations."
      },
      actionLabel: { pt: "Ver Financeiro", en: "Open Finance" },
      targetTab: "cobrancas",
      icon: <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
    },
    {
      id: "students",
      badge: { pt: "Passo 6: Conclusão", en: "Step 6: Ready to Go" },
      title: { pt: "Alternância de Alunos & Tour", en: "Student Switcher & Replay" },
      description: {
        pt: "Famílias com mais de um dependente podem alternar o perfil no topo. Este tutorial pode ser reaberto a qualquer momento pelo botão 'Tutorial'.",
        en: "Switch between registered children at the top selector anytime. You can replay this interactive guide at any moment."
      },
      icon: <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
    }
  ];

  const currentStep = steps[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === steps.length - 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight" && !isLast) {
        setCurrentStepIndex(prev => Math.min(prev + 1, steps.length - 1));
      } else if (e.key === "ArrowLeft" && !isFirst) {
        setCurrentStepIndex(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex, isFirst, isLast]);

  if (!isOpen) return null;

  const handleSkip = () => {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    onClose();
  };

  const handleNext = () => {
    if (isLast) {
      handleSkip();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleAction = () => {
    if (currentStep.targetTab && onNavigateTab) {
      onNavigateTab(currentStep.targetTab);
    }
    if (!isLast) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleSkip();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-slate-100">
        
        {/* Top Progress & Header Bar */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
                {isEn ? currentStep.badge.en : currentStep.badge.pt}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {isEn ? `Step ${currentStepIndex + 1} of ${steps.length}` : `Etapa ${currentStepIndex + 1} de ${steps.length}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Step Dots */}
            <div className="hidden sm:flex items-center gap-1">
              {steps.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIndex
                      ? "w-5 bg-indigo-600 dark:bg-indigo-400"
                      : idx < currentStepIndex
                      ? "w-2 bg-slate-300 dark:bg-slate-700"
                      : "w-1.5 bg-slate-200 dark:bg-slate-800"
                  }`}
                  aria-label={`Ir para etapa ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isEn ? "Skip tutorial" : "Pular tutorial"}
              aria-label="Fechar tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
              {currentStep.icon}
            </div>
            <div className="space-y-1">
              <h2 id="tutorial-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {isEn ? currentStep.title.en : currentStep.title.pt}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isEn ? currentStep.description.en : currentStep.description.pt}
              </p>
            </div>
          </div>

          {/* Special Interactive Widget for Step 2: Theme Selector */}
          {currentStep.id === "theme_schedule" && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? "Test theme switcher right now:" : "Teste o alternador de tema agora:"}
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold">
                  {isNight ? (isEn ? "18h-24h (Dark)" : "18h-24h (Escuro)") : (isEn ? "6h-18h (Light)" : "6h-18h (Claro)")}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ThemeSelector
                  themePreference={themePreference}
                  onSelectTheme={onSelectTheme}
                  variant="segmented"
                  locale={locale}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {isEn 
                  ? "• Sistema: claro das 6h às 18h, escuro das 18h às 24h. Escolha manual tem prioridade imediata."
                  : "• Sistema: claro das 6h às 18h, escuro das 18h às 24h. Escolha manual tem prioridade imediata."}
              </p>
            </div>
          )}

          {/* Interactive shortcut button if step targets a specific tab */}
          {currentStep.actionLabel && currentStep.targetTab && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs">
              <span className="text-indigo-900 dark:text-indigo-200 font-medium">
                {isEn ? "Preview module in real time:" : "Experimentar este módulo em tempo real:"}
              </span>
              <button
                type="button"
                onClick={handleAction}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{isEn ? currentStep.actionLabel.en : currentStep.actionLabel.pt}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium cursor-pointer"
          >
            {isEn ? "Skip Tour" : "Pular Tutorial"}
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{isEn ? "Back" : "Anterior"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>
                {isLast 
                  ? (isEn ? "Got it! Start Using" : "Concluir") 
                  : (isEn ? "Next" : "Próximo")}
              </span>
              {isLast ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
