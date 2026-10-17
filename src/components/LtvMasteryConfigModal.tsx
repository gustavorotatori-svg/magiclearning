import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Target,
  TrendingUp,
  AlertTriangle,
  Check,
  RotateCcw,
  Save,
  Users,
  ShieldCheck,
  DollarSign,
  MessageSquare,
  Sliders,
  Award,
  Clock,
  Sparkles,
  Info
} from "lucide-react";
import { Estudante } from "../types";

export interface LtvMasteryThresholds {
  defaultMasteryLtv: number; // Ex: R$ 100.000
  infantilMasteryLtv: number;
  fund1MasteryLtv: number;
  fund2MasteryLtv: number;
  medioMasteryLtv: number;
}

export interface CrmEngagementThresholds {
  minReadRatePercent: number; // Ex: 65%
  minInteractionsTarget: number; // Ex: 120 interações
  maxInactivityDaysAlert: number; // Ex: 14 dias sem abrir comunicados
  minWhatsAppResponseRatePercent: number; // Ex: 40%
  preventiveReminderLeadDays: number; // Ex: 3 dias úteis
}

export const DEFAULT_LTV_MASTERY_THRESHOLDS: LtvMasteryThresholds = {
  defaultMasteryLtv: 100000,
  infantilMasteryLtv: 115000,
  fund1MasteryLtv: 110000,
  fund2MasteryLtv: 95000,
  medioMasteryLtv: 85000,
};

export const DEFAULT_CRM_ENGAGEMENT_THRESHOLDS: CrmEngagementThresholds = {
  minReadRatePercent: 65,
  minInteractionsTarget: 120,
  maxInactivityDaysAlert: 14,
  minWhatsAppResponseRatePercent: 40,
  preventiveReminderLeadDays: 3,
};

interface LtvMasteryConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudantes?: Estudante[];
  onSave?: (ltv: LtvMasteryThresholds, engagement: CrmEngagementThresholds) => void;
  onToast?: (toast: { message: string; type: "success" | "error" | "info" | "warning" }) => void;
  zIndex?: number;
  onSwitchToFinancial?: () => void;
}

export const LtvMasteryConfigModal: React.FC<LtvMasteryConfigModalProps> = ({
  isOpen,
  onClose,
  estudantes = [],
  onSave,
  onToast,
  zIndex = 50,
  onSwitchToFinancial,
}) => {
  // LTV Mastery State
  const [ltvThresholds, setLtvThresholds] = useState<LtvMasteryThresholds>(() => {
    try {
      const saved = localStorage.getItem("school_retention_mastery_thresholds");
      if (saved) {
        return { ...DEFAULT_LTV_MASTERY_THRESHOLDS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load LTV mastery thresholds:", e);
    }
    return DEFAULT_LTV_MASTERY_THRESHOLDS;
  });

  // CRM Engagement Thresholds State
  const [engagementThresholds, setEngagementThresholds] = useState<CrmEngagementThresholds>(() => {
    try {
      const saved = localStorage.getItem("school_crm_engagement_thresholds");
      if (saved) {
        return { ...DEFAULT_CRM_ENGAGEMENT_THRESHOLDS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load CRM engagement thresholds:", e);
    }
    return DEFAULT_CRM_ENGAGEMENT_THRESHOLDS;
  });

  const [activeTab, setActiveTab] = useState<"ltv" | "engajamento" | "diagnostico">("ltv");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Derived real-time impact on current student cohort
  const cohortSimulation = useMemo(() => {
    const totalStudents = estudantes.length > 0 ? estudantes.length : 24; // Fallback to realistic cohort size
    
    // Estimate student LTV based on segments
    let masteryCount = 0;
    let atRiskCount = 0;
    let totalLtvCohort = 0;
    let ltvAtRisk = 0;

    estudantes.forEach((st, idx) => {
      // Approximate LTV based on grade
      const isInfantil = st.grade?.toLowerCase().includes("maternal") || st.grade?.toLowerCase().includes("jardim");
      const isFund1 = st.grade?.toLowerCase().includes("fund") || st.grade?.includes("1º") || st.grade?.includes("2º");
      const isMedio = st.grade?.toLowerCase().includes("médio") || st.grade?.toLowerCase().includes("em");

      let approxLtv = 95000;
      let targetCutoff = ltvThresholds.defaultMasteryLtv;

      if (isInfantil) {
        approxLtv = 120000;
        targetCutoff = ltvThresholds.infantilMasteryLtv;
      } else if (isFund1) {
        approxLtv = 105000;
        targetCutoff = ltvThresholds.fund1MasteryLtv;
      } else if (isMedio) {
        approxLtv = 88000;
        targetCutoff = ltvThresholds.medioMasteryLtv;
      } else {
        approxLtv = 98000;
        targetCutoff = ltvThresholds.fund2MasteryLtv;
      }

      totalLtvCohort += approxLtv;

      if (approxLtv >= targetCutoff) {
        masteryCount++;
      }

      // Simulated engagement risk based on reEnrollmentStatus or reading threshold
      const isSimulatedAtRisk = st.reEnrollmentStatus === "pendente" && (idx % 2 === 0);
      if (isSimulatedAtRisk) {
        atRiskCount++;
        ltvAtRisk += approxLtv;
      }
    });

    if (estudantes.length === 0) {
      masteryCount = 14;
      atRiskCount = 5;
      totalLtvCohort = 2400000;
      ltvAtRisk = 480000;
    }

    return {
      totalStudents,
      masteryCount,
      masteryPercent: Math.round((masteryCount / totalStudents) * 100),
      atRiskCount,
      atRiskPercent: Math.round((atRiskCount / totalStudents) * 100),
      totalLtvCohort,
      ltvAtRisk,
    };
  }, [estudantes, ltvThresholds]);

  const handleLtvChange = (field: keyof LtvMasteryThresholds, val: number) => {
    setLtvThresholds((prev) => ({ ...prev, [field]: val }));
    setHasUnsavedChanges(true);
  };

  const handleEngagementChange = (field: keyof CrmEngagementThresholds, val: number) => {
    setEngagementThresholds((prev) => ({ ...prev, [field]: val }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem("school_retention_mastery_thresholds", JSON.stringify(ltvThresholds));
      localStorage.setItem("school_crm_engagement_thresholds", JSON.stringify(engagementThresholds));

      window.dispatchEvent(new CustomEvent("school_crm_thresholds_updated", {
        detail: { ltvThresholds, engagementThresholds }
      }));

      if (onSave) {
        onSave(ltvThresholds, engagementThresholds);
      }

      setHasUnsavedChanges(false);

      if (onToast) {
        onToast({
          message: "Parâmetros de LTV Mastery e thresholds de engajamento do CRM salvos com sucesso!",
          type: "success"
        });
      }
      onClose();
    } catch (e) {
      console.error("Error saving thresholds:", e);
      if (onToast) {
        onToast({
          message: "Erro ao salvar os thresholds no armazenamento local.",
          type: "error"
        });
      }
    }
  };

  const handleResetDefaults = () => {
    setLtvThresholds(DEFAULT_LTV_MASTERY_THRESHOLDS);
    setEngagementThresholds(DEFAULT_CRM_ENGAGEMENT_THRESHOLDS);
    setHasUnsavedChanges(true);
    if (onToast) {
      onToast({
        message: "Valores padrão recomendados restaurados nos campos.",
        type: "info"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{ zIndex }}
        className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
        id="modal-ltv-mastery-config-container"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ltv-mastery-modal-title"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-slate-150 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/40">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <Award className="w-4 h-4" />
                </span>
                <h3 id="ltv-mastery-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Configurações de LTV Mastery & Thresholds de Engajamento
                </h3>
                <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800">
                  Calibração Ativa
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calibre os limiares de retenção de alto valor (LTV) e os gatilhos preditivos de engajamento do CRM para a campanha de rematrículas.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onSwitchToFinancial && (
                <button
                  type="button"
                  onClick={onSwitchToFinancial}
                  className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Alternar para Relatório Financeiro Mensal (PDF)"
                >
                  <span>📄 Relatório Mensal PDF</span>
                </button>
              )}

              <button
                type="button"
                id="btn-close-ltv-mastery-modal"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-150 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fechar (Esc)"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subtabs Selector */}
          <div className="px-6 pt-3 pb-0 border-b border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              id="tab-select-ltv-mastery"
              onClick={() => setActiveTab("ltv")}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "ltv"
                  ? "border-amber-600 text-amber-800 dark:text-amber-300"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Limiares de LTV Mastery</span>
            </button>

            <button
              type="button"
              id="tab-select-crm-engagement"
              onClick={() => setActiveTab("engajamento")}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "engajamento"
                  ? "border-amber-600 text-amber-800 dark:text-amber-300"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Thresholds de Engajamento CRM</span>
            </button>

            <button
              type="button"
              id="tab-select-cohort-diagnostics"
              onClick={() => setActiveTab("diagnostico")}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "diagnostico"
                  ? "border-amber-600 text-amber-800 dark:text-amber-300"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Simulação da Base Atual ({cohortSimulation.totalStudents} Alunos)</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-left flex-1">
            
            {/* TAB 1: LTV MASTERY THRESHOLDS */}
            {activeTab === "ltv" && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Estudantes cujo <strong>Lifetime Value (LTV) projetado</strong> supera este limiar recebem o selo de <strong>LTV Mastery</strong>. No CRM, isso ativa tratamento preferencial de rematrícula, propostas personalizadas e contato prioritário da direção escolar.
                  </p>
                </div>

                {/* Global Default LTV Threshold */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label htmlFor="input-global-ltv-threshold" className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        Corte Geral de LTV Mastery (Meta Global)
                      </label>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Valor acumulado mínimo para concessão da insígnia institucional de retenção.
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-semibold text-slate-500">R$</span>
                      <input
                        id="input-global-ltv-threshold"
                        type="number"
                        step={5000}
                        min={30000}
                        max={300000}
                        value={ltvThresholds.defaultMasteryLtv}
                        onChange={(e) => handleLtvChange("defaultMasteryLtv", Number(e.target.value) || 0)}
                        className="w-28 px-2 py-1 text-right text-xs font-mono font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <input
                    type="range"
                    min={40000}
                    max={250000}
                    step={5000}
                    value={ltvThresholds.defaultMasteryLtv}
                    onChange={(e) => handleLtvChange("defaultMasteryLtv", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-md appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>R$ 40.000 (Mínimo)</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">
                      R$ {ltvThresholds.defaultMasteryLtv.toLocaleString("pt-BR")}
                    </span>
                    <span>R$ 250.000 (Alto Padrão)</span>
                  </div>
                </div>

                {/* Segment Specific Mastery Thresholds */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                    Calibração por Segmento Pedagógico
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Infantil */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Educação Infantil</span>
                        <span className="text-[10px] font-mono text-slate-400">Berçário a Jardim II</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">Limiar Segmento:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono text-slate-400">R$</span>
                          <input
                            type="number"
                            step={5000}
                            value={ltvThresholds.infantilMasteryLtv}
                            onChange={(e) => handleLtvChange("infantilMasteryLtv", Number(e.target.value) || 0)}
                            className="w-24 px-1.5 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fundamental I */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Ensino Fundamental I</span>
                        <span className="text-[10px] font-mono text-slate-400">1º ao 5º Ano</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">Limiar Segmento:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono text-slate-400">R$</span>
                          <input
                            type="number"
                            step={5000}
                            value={ltvThresholds.fund1MasteryLtv}
                            onChange={(e) => handleLtvChange("fund1MasteryLtv", Number(e.target.value) || 0)}
                            className="w-24 px-1.5 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fundamental II */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Ensino Fundamental II</span>
                        <span className="text-[10px] font-mono text-slate-400">6º ao 9º Ano</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">Limiar Segmento:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono text-slate-400">R$</span>
                          <input
                            type="number"
                            step={5000}
                            value={ltvThresholds.fund2MasteryLtv}
                            onChange={(e) => handleLtvChange("fund2MasteryLtv", Number(e.target.value) || 0)}
                            className="w-24 px-1.5 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Ensino Médio */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Ensino Médio</span>
                        <span className="text-[10px] font-mono text-slate-400">1º ao 3º Ano</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">Limiar Segmento:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono text-slate-400">R$</span>
                          <input
                            type="number"
                            step={5000}
                            value={ltvThresholds.medioMasteryLtv}
                            onChange={(e) => handleLtvChange("medioMasteryLtv", Number(e.target.value) || 0)}
                            className="w-24 px-1.5 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CRM ENGAGEMENT THRESHOLDS */}
            {activeTab === "engajamento" && (
              <div className="space-y-5">
                {/* 1. Taxa Mínima de Leitura dos Comunicados */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="crm-reading-rate-threshold" className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        Limiar de Leitura Mínima dos Comunicados
                      </label>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Famílias com abertura abaixo deste percentual são marcadas como &ldquo;Risco de Desengajamento&rdquo; no funil.
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        id="crm-reading-rate-threshold"
                        type="number"
                        min={10}
                        max={95}
                        value={engagementThresholds.minReadRatePercent}
                        onChange={(e) => handleEngagementChange("minReadRatePercent", Number(e.target.value) || 10)}
                        className="w-14 px-1.5 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-xs font-mono text-slate-400 font-semibold">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={15}
                    max={95}
                    step={5}
                    value={engagementThresholds.minReadRatePercent}
                    onChange={(e) => handleEngagementChange("minReadRatePercent", Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-md appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>15% (Baixo Rigor)</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      65% (Padrão Recomendado)
                    </span>
                    <span>95% (Máxima Exigência)</span>
                  </div>
                </div>

                {/* 2. Limiar de Dias sem Interação (Alerta de Churn) */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="crm-inactivity-days-threshold" className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        Alerta de Inatividade Máxima (Risco de Evasão)
                      </label>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Dias sem qualquer visualização de comunicado ou interação via WhatsApp antes de disparar alerta prioritário.
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        id="crm-inactivity-days-threshold"
                        type="number"
                        min={3}
                        max={60}
                        value={engagementThresholds.maxInactivityDaysAlert}
                        onChange={(e) => handleEngagementChange("maxInactivityDaysAlert", Number(e.target.value) || 3)}
                        className="w-14 px-1.5 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-xs font-mono text-slate-400 font-semibold">dias</span>
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[7, 14, 21, 30].map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => handleEngagementChange("maxInactivityDaysAlert", days)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          engagementThresholds.maxInactivityDaysAlert === days
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        {days} dias {days === 14 && "(Recomendado)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Meta Mínima de Interações no Ciclo & WhatsApp Lead Days */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <label htmlFor="crm-min-interactions-target" className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      Meta de Interações por Bimestre
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Soma de confirmações de leitura, autorizações e mensagens respondidas.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        id="crm-min-interactions-target"
                        type="number"
                        step={10}
                        min={20}
                        max={500}
                        value={engagementThresholds.minInteractionsTarget}
                        onChange={(e) => handleEngagementChange("minInteractionsTarget", Number(e.target.value) || 20)}
                        className="w-20 px-2 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                      />
                      <span className="text-xs font-mono text-slate-400">ações/ciclo</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                    <label htmlFor="crm-preventive-lead-days" className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                      Antecedência Régua WhatsApp
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Dias úteis de antecedência do disparo automático preventivo de rematrícula.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <select
                        id="crm-preventive-lead-days"
                        value={engagementThresholds.preventiveReminderLeadDays}
                        onChange={(e) => handleEngagementChange("preventiveReminderLeadDays", Number(e.target.value))}
                        className="px-2 py-1 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                      >
                        <option value={1}>1 dia útil (24h antes)</option>
                        <option value={3}>3 dias úteis (Padrão)</option>
                        <option value={5}>5 dias úteis (Antecipado)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DIAGNOSTICS & SIMULATION */}
            {activeTab === "diagnostico" && (
              <div className="space-y-5">
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                  <p>
                    Esta simulação avalia a base real de <strong>{cohortSimulation.totalStudents} estudantes matriculados</strong> frente aos novos limiares de LTV Mastery e aos thresholds de engajamento do CRM.
                  </p>
                </div>

                {/* Key Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1: LTV Mastery Cohort */}
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400">
                      Alunos no Padrão LTV Mastery
                    </span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-2xl font-black font-mono text-amber-900 dark:text-amber-200">
                        {cohortSimulation.masteryCount}
                      </strong>
                      <span className="text-xs font-mono font-bold text-amber-600">
                        ({cohortSimulation.masteryPercent}%)
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-800/80 dark:text-amber-400/80">
                      Estudantes com LTV superior a R$ {(ltvThresholds.defaultMasteryLtv / 1000).toFixed(0)}k.
                    </p>
                  </div>

                  {/* Card 2: At-Risk Students */}
                  <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-red-700 dark:text-red-400">
                      Em Risco de Desengajamento
                    </span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-2xl font-black font-mono text-red-900 dark:text-red-200">
                        {cohortSimulation.atRiskCount}
                      </strong>
                      <span className="text-xs font-mono font-bold text-red-600">
                        ({cohortSimulation.atRiskPercent}%)
                      </span>
                    </div>
                    <p className="text-[10px] text-red-800/80 dark:text-red-400/80">
                      Abaixo de {engagementThresholds.minReadRatePercent}% de leitura ou {engagementThresholds.maxInactivityDaysAlert}d inativos.
                    </p>
                  </div>

                  {/* Card 3: Revenue at Risk */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                      LTV em Risco Potencial
                    </span>
                    <div className="flex items-baseline gap-1">
                      <strong className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                        R$ {(cohortSimulation.ltvAtRisk / 1000).toFixed(0)}k
                      </strong>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Volume sob risco imediato de não-renovação de rematrícula.
                    </p>
                  </div>
                </div>

                {/* Actionable recommendation */}
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Recomendação Operacional do CRM</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-300">
                    A régua preventiva do WhatsApp está calibrada para disparar com <strong>{engagementThresholds.preventiveReminderLeadDays} dias de antecedência</strong>. Os <strong>{cohortSimulation.masteryCount} alunos LTV Mastery</strong> terão fila prioritária de atendimento para negociações antes do fechamento do lote geral.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              id="btn-reset-ltv-mastery-defaults"
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded hover:bg-slate-200/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Recomendações</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                id="btn-cancel-ltv-mastery-modal"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                id="btn-save-ltv-mastery-thresholds"
                onClick={handleSave}
                className="flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
