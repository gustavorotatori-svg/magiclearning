import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, SlidersHorizontal, Check, Bell, BellOff, MessageSquare, AlertCircle, ShieldCheck, CheckCircle2, Activity, Zap, Flame, Sun, Sparkles, Eye, Layers, Moon } from "lucide-react";
import OccurrenceGlowConfigPanel, { OccurrenceGlowConfig } from "./OccurrenceGlowConfigPanel";

export type PulseSpeedMode = "lento" | "medio" | "emergencial";

interface AlertsConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertsEnabled: boolean;
  alertReadThreshold: number;
  alertEngagementThreshold: number;
  crmWaReminderDays: number;
  pulseSpeedMode?: PulseSpeedMode;
  pulseSpeedSeconds?: number;
  pulseGlowOpacity?: number;
  pulseGlowIntensity?: number;
  pulseInsetIntensity?: number;
  onSave: (settings: {
    alertsEnabled: boolean;
    alertReadThreshold: number;
    alertEngagementThreshold: number;
    crmWaReminderDays: number;
    pulseSpeedMode?: PulseSpeedMode;
    pulseSpeedSeconds?: number;
    pulseGlowOpacity?: number;
    pulseGlowIntensity?: number;
    pulseInsetIntensity?: number;
  }) => void;
}

const SPEED_PRESETS: Record<PulseSpeedMode, { label: string; speed: number; description: string; tag: string }> = {
  lento: { label: "Lento", speed: 4.5, description: "Pulsação suave e relaxada (4.5s)", tag: "Suave" },
  medio: { label: "Médio", speed: 2.5, description: "Pulsação equilibrada padrão (2.5s)", tag: "Padrão" },
  emergencial: { label: "Emergencial", speed: 0.8, description: "Pulsação acelerada de alta urgência (0.8s)", tag: "Crítico" },
};

export default function AlertsConfigurationModal({
  isOpen,
  onClose,
  alertsEnabled: initialAlertsEnabled,
  alertReadThreshold: initialAlertReadThreshold,
  alertEngagementThreshold: initialAlertEngagementThreshold,
  crmWaReminderDays: initialCrmWaReminderDays,
  pulseSpeedMode: initialPulseSpeedMode,
  pulseSpeedSeconds: initialPulseSpeedSeconds,
  pulseGlowOpacity: initialPulseGlowOpacity,
  pulseGlowIntensity: initialPulseGlowIntensity,
  pulseInsetIntensity: initialPulseInsetIntensity,
  onSave,
}: AlertsConfigurationModalProps) {
  // Local state to prevent expensive root re-renders during slider drag
  const [enabled, setEnabled] = useState(initialAlertsEnabled);
  const [readThreshold, setReadThreshold] = useState(initialAlertReadThreshold);
  const [engagementThreshold, setEngagementThreshold] = useState(initialAlertEngagementThreshold);
  const [crmDays, setCrmDays] = useState(initialCrmDays(initialCrmWaReminderDays));

  // Pulse animation & glow state
  const [pulseMode, setPulseMode] = useState<PulseSpeedMode>(() => {
    if (initialPulseSpeedMode) return initialPulseSpeedMode;
    const saved = localStorage.getItem("occurrence_pulse_mode") as PulseSpeedMode;
    return saved && SPEED_PRESETS[saved] ? saved : "medio";
  });

  const [pulseSeconds, setPulseSeconds] = useState<number>(() => {
    if (initialPulseSpeedSeconds) return initialPulseSpeedSeconds;
    const savedSec = localStorage.getItem("occurrence_pulse_speed");
    if (savedSec) {
      const parsed = parseFloat(savedSec);
      if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 6) return parsed;
    }
    return SPEED_PRESETS.medio.speed;
  });

  const [pulseGlowOpacity, setPulseGlowOpacity] = useState<number>(() => {
    if (initialPulseGlowOpacity !== undefined) return initialPulseGlowOpacity;
    const saved = localStorage.getItem("occurrence_glow_opacity");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.2 && parsed <= 2.5) return parsed;
    }
    return 1.0;
  });

  const [pulseGlowIntensity, setPulseGlowIntensity] = useState<number>(() => {
    if (initialPulseGlowIntensity !== undefined) return initialPulseGlowIntensity;
    const saved = localStorage.getItem("occurrence_glow_intensity");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 3.5) return parsed;
    }
    return 1.0;
  });

  const [pulseInsetIntensity, setPulseInsetIntensity] = useState<number>(() => {
    if (initialPulseInsetIntensity !== undefined) return initialPulseInsetIntensity;
    const saved = localStorage.getItem("occurrence_inset_intensity");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.3 && parsed <= 3.5) return parsed;
    }
    return 1.0;
  });

  const [isSaved, setIsSaved] = useState(false);

  function initialCrmDays(val: number) {
    return [1, 3, 5].includes(val) ? val : 3;
  }

  // Update CSS variables in documentElement for live preview
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--occurrence-pulse-speed", `${pulseSeconds}s`);
      document.documentElement.style.setProperty("--occurrence-glow-opacity", `${pulseGlowOpacity}`);
      document.documentElement.style.setProperty("--occurrence-glow-intensity", `${pulseGlowIntensity}`);
      document.documentElement.style.setProperty("--occurrence-inset-intensity", `${pulseInsetIntensity}`);
    }
  }, [pulseSeconds, pulseGlowOpacity, pulseGlowIntensity, pulseInsetIntensity]);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setEnabled(initialAlertsEnabled);
      setReadThreshold(initialAlertReadThreshold);
      setEngagementThreshold(initialAlertEngagementThreshold);
      setCrmDays(initialCrmDays(initialCrmWaReminderDays));
      const savedMode = (localStorage.getItem("occurrence_pulse_mode") as PulseSpeedMode) || initialPulseSpeedMode || "medio";
      const savedSec = parseFloat(localStorage.getItem("occurrence_pulse_speed") || "") || initialPulseSpeedSeconds || SPEED_PRESETS[savedMode]?.speed || 2.5;
      const savedOpacity = parseFloat(localStorage.getItem("occurrence_glow_opacity") || "") || (initialPulseGlowOpacity ?? 1.0);
      const savedIntensity = parseFloat(localStorage.getItem("occurrence_glow_intensity") || "") || (initialPulseGlowIntensity ?? 1.0);
      const savedInset = parseFloat(localStorage.getItem("occurrence_inset_intensity") || "") || (initialPulseInsetIntensity ?? 1.0);

      setPulseMode(savedMode);
      setPulseSeconds(savedSec);
      setPulseGlowOpacity(savedOpacity);
      setPulseGlowIntensity(savedIntensity);
      setPulseInsetIntensity(savedInset);
      setIsSaved(false);
    }
  }, [isOpen, initialAlertsEnabled, initialAlertReadThreshold, initialAlertEngagementThreshold, initialCrmWaReminderDays, initialPulseSpeedMode, initialPulseSpeedSeconds, initialPulseGlowOpacity, initialPulseGlowIntensity, initialPulseInsetIntensity]);

  // Keyboard shortcut: close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleGlowConfigChange = useCallback((cfg: OccurrenceGlowConfig) => {
    setPulseMode(cfg.pulseSpeedMode);
    setPulseSeconds(cfg.pulseSpeedSeconds);
    setPulseGlowOpacity(cfg.glowOpacity);
    setPulseGlowIntensity(cfg.glowIntensity);
    setPulseInsetIntensity(cfg.insetIntensity);
  }, []);

  const handleSave = () => {
    // Persist to localStorage
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("occurrence_pulse_mode", pulseMode);
      localStorage.setItem("occurrence_pulse_speed", `${pulseSeconds}s`);
      localStorage.setItem("occurrence_glow_opacity", `${pulseGlowOpacity}`);
      localStorage.setItem("occurrence_glow_intensity", `${pulseGlowIntensity}`);
      localStorage.setItem("occurrence_inset_intensity", `${pulseInsetIntensity}`);
    }

    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--occurrence-pulse-speed", `${pulseSeconds}s`);
      document.documentElement.style.setProperty("--occurrence-glow-opacity", `${pulseGlowOpacity}`);
      document.documentElement.style.setProperty("--occurrence-glow-intensity", `${pulseGlowIntensity}`);
      document.documentElement.style.setProperty("--occurrence-inset-intensity", `${pulseInsetIntensity}`);
    }

    onSave({
      alertsEnabled: enabled,
      alertReadThreshold: readThreshold,
      alertEngagementThreshold: engagementThreshold,
      crmWaReminderDays: crmDays,
      pulseSpeedMode: pulseMode,
      pulseSpeedSeconds: pulseSeconds,
      pulseGlowOpacity: pulseGlowOpacity,
      pulseGlowIntensity: pulseGlowIntensity,
      pulseInsetIntensity: pulseInsetIntensity,
    });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
      setIsSaved(false);
    }, 450);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="alerts-configuration-dialog" 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
        {/* Subtle backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Parâmetros de Alerta e Notificações
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajuste os critérios de monitoramento de engajamento escolar e régua de cobrança CRM.
              </p>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
            {/* Global Monitoring Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {enabled ? <Bell className="w-3.5 h-3.5 text-amber-600" /> : <BellOff className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Monitoramento Ativo em Tempo Real</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sinaliza divergências nas taxas de visualização e engajamento dos comunicados.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  enabled ? "bg-amber-600 dark:bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                    enabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* ================================================================= */}
            {/* OCCURRENCE CRITICAL PULSE & GLOW INSET CONFIGURATION */}
            {/* ================================================================= */}
            <OccurrenceGlowConfigPanel
              initialConfig={{
                pulseSpeedMode: pulseMode,
                pulseSpeedSeconds: pulseSeconds,
                glowOpacity: pulseGlowOpacity,
                glowIntensity: pulseGlowIntensity,
                insetIntensity: pulseInsetIntensity,
              }}
              onChange={handleGlowConfigChange}
              showCardPreview={true}
            />

            {/* Threshold 1: Minimum Read Rate */}
            <div className={`space-y-2.5 p-4 rounded-xl border transition-all ${
              enabled 
                ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" 
                : "opacity-40 pointer-events-none bg-slate-50/50 dark:bg-slate-950/30 border-slate-150 dark:border-slate-850"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="read-threshold-input" className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Limiar de Leitura Mínima
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dispara sinalização visual quando a taxa média for inferior ao valor
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    id="read-threshold-input"
                    type="number"
                    min={10}
                    max={100}
                    value={readThreshold}
                    onChange={(e) => {
                      const val = Math.max(10, Math.min(100, Number(e.target.value) || 10));
                      setReadThreshold(val);
                    }}
                    className="w-12 px-1.5 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-xs font-mono text-slate-400 font-semibold">%</span>
                </div>
              </div>

              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={readThreshold}
                onChange={(e) => setReadThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-md appearance-none cursor-pointer accent-amber-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <span>10% (Flexível)</span>
                <span>65% (Padrão)</span>
                <span>100% (Rigoroso)</span>
              </div>
            </div>

            {/* Threshold 2: Interaction Target */}
            <div className={`space-y-2.5 p-4 rounded-xl border transition-all ${
              enabled 
                ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800" 
                : "opacity-40 pointer-events-none bg-slate-50/50 dark:bg-slate-950/30 border-slate-150 dark:border-slate-850"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="engagement-threshold-input" className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                    Meta de Interações por Comunicado
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Soma de confirmações de leitura e reações dos responsáveis
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    id="engagement-threshold-input"
                    type="number"
                    min={10}
                    max={1000}
                    value={engagementThreshold}
                    onChange={(e) => {
                      const val = Math.max(10, Math.min(1000, Number(e.target.value) || 10));
                      setEngagementThreshold(val);
                    }}
                    className="w-16 px-1.5 py-1 text-right text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <span className="text-xs font-mono text-slate-400 font-semibold">ações</span>
                </div>
              </div>

              <input
                type="range"
                min={10}
                max={1000}
                step={10}
                value={engagementThreshold}
                onChange={(e) => setEngagementThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-md appearance-none cursor-pointer accent-amber-600"
              />

              <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <span>10</span>
                <span>150 (Recomendado)</span>
                <span>1000</span>
              </div>
            </div>

            {/* CRM WhatsApp Follow-up Schedule */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span>Régua de Cobrança WhatsApp (Pré-Vencimento)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Define a antecedência padrão para o envio automático de lembrete de faturas.
                  </p>
                </div>
              </div>

              {/* Segmented Selector */}
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Intervalo de disparo CRM">
                {[
                  { days: 1, label: "1 dia útil", detail: "24h de antecedência" },
                  { days: 3, label: "3 dias úteis", detail: "Recomendado", badge: "Padrão" },
                  { days: 5, label: "5 dias úteis", detail: "Maior prazo" },
                ].map((opt) => {
                  const isSelected = crmDays === opt.days;
                  return (
                    <button
                      key={opt.days}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setCrmDays(opt.days)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-500 dark:border-amber-600 text-amber-900 dark:text-amber-200 ring-1 ring-amber-500/20"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold">{opt.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {opt.detail}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diagnostic State Summary */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100/60 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                {enabled
                  ? `Notificações configuradas para disparar com taxa inferior a ${readThreshold}% ou com meta de ${engagementThreshold} interações.`
                  : "Monitoramento de alertas desativado. Nenhuma sinalização será emitida no painel."}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaved}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Salvo com sucesso</span>
                </>
              ) : (
                <span>Salvar Configurações</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
