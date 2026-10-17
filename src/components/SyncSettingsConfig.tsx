import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Sliders,
  Play,
  Save,
  Check,
  ShieldCheck,
  Activity,
  ArrowRight,
  Database,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info
} from "lucide-react";

export interface SyncSettingsConfigProps {
  erpName: "asaas" | "sap" | "totvs" | "iugu";
  pollingInterval: number; // in minutes
  setPollingInterval: (minutes: number) => void;
  pollingEnabled: boolean;
  setPollingEnabled: (enabled: boolean) => void;
  syncFrequency: "realtime" | "hourly" | "daily" | "manual";
  setSyncFrequency: (freq: "realtime" | "hourly" | "daily" | "manual") => void;
  baseUrl: string;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
  onLogAdd?: (type: "info" | "warn" | "error" | "success", message: string, module: string) => void;
  onTriggerImmediatePoll?: () => void;
}

interface PollingCycleLog {
  id: string;
  timestamp: string;
  invoicesPolled: number;
  paymentsPolled: number;
  durationMs: number;
  status: "success" | "warning" | "error";
  details: string;
}

export const SyncSettingsConfig: React.FC<SyncSettingsConfigProps> = ({
  erpName,
  pollingInterval,
  setPollingInterval,
  pollingEnabled,
  setPollingEnabled,
  syncFrequency,
  setSyncFrequency,
  baseUrl,
  onToast,
  onLogAdd,
  onTriggerImmediatePoll
}) => {
  // Local state for interval input (allows typed changes before commit)
  const [localInterval, setLocalInterval] = useState<number>(pollingInterval);
  const [isSaving, setIsSaving] = useState(false);
  const [isPollingNow, setIsPollingNow] = useState(false);

  // Scope toggles
  const [pollNewInvoices, setPollNewInvoices] = useState<boolean>(() => {
    const saved = localStorage.getItem("erp_poll_new_invoices");
    return saved !== null ? saved === "true" : true;
  });
  const [pollPayments, setPollPayments] = useState<boolean>(() => {
    const saved = localStorage.getItem("erp_poll_payments");
    return saved !== null ? saved === "true" : true;
  });
  const [pollCancellations, setPollCancellations] = useState<boolean>(() => {
    const saved = localStorage.getItem("erp_poll_cancellations");
    return saved !== null ? saved === "true" : true;
  });
  const [hybridWebhookFallback, setHybridWebhookFallback] = useState<boolean>(() => {
    const saved = localStorage.getItem("erp_poll_hybrid_webhook");
    return saved !== null ? saved === "true" : true;
  });

  // Advanced Options
  const [batchSize, setBatchSize] = useState<number>(() => {
    const saved = localStorage.getItem("erp_poll_batch_size");
    return saved ? parseInt(saved, 10) : 50;
  });
  const [nightEcoMode, setNightEcoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("erp_poll_night_mode");
    return saved !== null ? saved === "true" : true;
  });
  const [autoRetryOnFail, setAutoRetryOnFail] = useState<boolean>(true);
  const [notifyOnNewPayments, setNotifyOnNewPayments] = useState<boolean>(true);

  // Simulated Polling history
  const [cycleLogs, setCycleLogs] = useState<PollingCycleLog[]>([
    {
      id: "poll-log-1",
      timestamp: "Hoje às 14:30:22",
      invoicesPolled: 8,
      paymentsPolled: 3,
      durationMs: 94,
      status: "success",
      details: "Varredura executada. 8 novos boletos e 3 pagamentos reconciliados."
    },
    {
      id: "poll-log-2",
      timestamp: "Hoje às 14:15:20",
      invoicesPolled: 0,
      paymentsPolled: 1,
      durationMs: 78,
      status: "success",
      details: "Varredura executada. 1 liquidação de mensalidade confirmada via PIX."
    },
    {
      id: "poll-log-3",
      timestamp: "Hoje às 14:00:15",
      invoicesPolled: 12,
      paymentsPolled: 6,
      durationMs: 142,
      status: "success",
      details: "Ciclo periódico concluído. Lote de faturas bimestrais sincronizado."
    }
  ]);

  // Dynamic calculations
  const dailyRequests = localInterval > 0 ? Math.round(1440 / localInterval) : 0;
  const erpLoadLevel =
    dailyRequests > 250
      ? { label: "Alta Frequência", color: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900" }
      : dailyRequests > 60
      ? { label: "Carga Equilibrada", color: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900" }
      : { label: "Baixo Consumo", color: "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" };

  // Sync internal state when parent props change
  useEffect(() => {
    setLocalInterval(pollingInterval);
  }, [pollingInterval]);

  // Interval quick presets
  const presets = [
    { label: "5 min", value: 5, tag: "Quase Real-Time", desc: "Varredura constante" },
    { label: "10 min", value: 10, tag: "Rápido", desc: "Alta agilidade" },
    { label: "15 min", value: 15, tag: "Recomendado", desc: "Equilíbrio ideal" },
    { label: "30 min", value: 30, tag: "Moderado", desc: "Uso corporativo" },
    { label: "60 min", value: 60, tag: "1 Hora", desc: "Ciclo padrão" },
    { label: "360 min", value: 360, tag: "6 Horas", desc: "Agrupado" },
    { label: "1440 min", value: 1440, tag: "Diário", desc: "Apenas 1x ao dia" },
  ];

  const handleApplyPreset = (value: number) => {
    setLocalInterval(value);
    setPollingInterval(value);
    if (value <= 10) {
      setSyncFrequency("realtime");
    } else if (value <= 60) {
      setSyncFrequency("hourly");
    } else if (value >= 1440) {
      setSyncFrequency("daily");
    }
    onToast(`Intervalo de polling reajustado para ${value} minutos.`, "info");
    if (onLogAdd) {
      onLogAdd("info", `Intervalo automático de polling do ERP atualizado para ${value} minutos.`, "SCHEDULER");
    }
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    const sanitizedInterval = Math.max(1, Math.min(1440, localInterval || 15));
    setPollingInterval(sanitizedInterval);
    setLocalInterval(sanitizedInterval);

    // Save persistences
    localStorage.setItem("erp_polling_interval_minutes", sanitizedInterval.toString());
    localStorage.setItem("erp_poll_new_invoices", pollNewInvoices.toString());
    localStorage.setItem("erp_poll_payments", pollPayments.toString());
    localStorage.setItem("erp_poll_cancellations", pollCancellations.toString());
    localStorage.setItem("erp_poll_hybrid_webhook", hybridWebhookFallback.toString());
    localStorage.setItem("erp_poll_batch_size", batchSize.toString());
    localStorage.setItem("erp_poll_night_mode", nightEcoMode.toString());

    setTimeout(() => {
      setIsSaving(false);
      onToast(`Configurações de sincronização do ${erpName.toUpperCase()} salvas com sucesso!`, "success");
      if (onLogAdd) {
        onLogAdd(
          "success",
          `Configurações de sincronização gravadas: Polling a cada ${sanitizedInterval} min | Lote: ${batchSize} faturas | Status: ${pollingEnabled ? "Ativo" : "Pausado"}.`,
          "SCHEDULER"
        );
      }
    }, 450);
  };

  const handleTriggerImmediatePolling = () => {
    setIsPollingNow(true);
    if (onLogAdd) {
      onLogAdd("info", `Iniciando requisição de polling imediato no endpoint /webhooks/polling do ${erpName.toUpperCase()}...`, "POLLING");
    }

    setTimeout(() => {
      const invoicesFound = Math.floor(Math.random() * 6) + 1;
      const paymentsFound = Math.floor(Math.random() * 4) + 1;
      const latency = Math.floor(Math.random() * 60) + 70;

      const newLog: PollingCycleLog = {
        id: `poll-log-${Date.now()}`,
        timestamp: `Hoje às ${new Date().toLocaleTimeString("pt-BR")}`,
        invoicesPolled: invoicesFound,
        paymentsPolled: paymentsFound,
        durationMs: latency,
        status: "success",
        details: `Varredura manual concluída em ${latency}ms. Encontrados ${invoicesFound} novos boletos e ${paymentsFound} liquidações confirmadas.`
      };

      setCycleLogs(prev => [newLog, ...prev.slice(0, 4)]);
      setIsPollingNow(false);

      onToast(`Polling concluído: ${invoicesFound} boletos e ${paymentsFound} pagamentos identificados (${latency}ms).`, "success");
      if (onLogAdd) {
        onLogAdd("success", `Polling concluído com sucesso: ${invoicesFound} boletos e ${paymentsFound} pagamentos capturados no ERP (${latency}ms).`, "POLLING");
      }

      if (onTriggerImmediatePoll) {
        onTriggerImmediatePoll();
      }
    }, 1100);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Status and Polling Summary */}
      <div className="bg-white/95 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/60 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif font-black text-base sm:text-lg text-[#423326] dark:text-amber-100">
                  Configurações de Sincronização & Polling Automático
                </h3>
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900 uppercase">
                  {erpName.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Defina o ciclo de consulta periódica (polling em minutos) para capturar novos boletos emitidos e atualizações de liquidação de pagamentos via webhook do ERP escolar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 bg-[#fcfaf5] dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
              <span className={`w-2.5 h-2.5 rounded-full ${pollingEnabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" : "bg-slate-400"}`} />
              <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                {pollingEnabled ? `Polling Ativo (${pollingInterval} min)` : "Polling Pausado"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !pollingEnabled;
                setPollingEnabled(next);
                onToast(`Polling automático ${next ? "ativado" : "pausado"}.`, next ? "success" : "info");
                if (onLogAdd) {
                  onLogAdd("info", `Polling automático em background ${next ? "habilitado" : "desabilitado"} pelo usuário.`, "SCHEDULER");
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs ${
                pollingEnabled
                  ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{pollingEnabled ? "Pausar Polling" : "Ativar Polling"}</span>
            </button>
          </div>
        </div>

        {/* Real-time Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="bg-[#fcfaf5] dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850">
            <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold block">
              Intervalo Configurado
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl sm:text-2xl font-serif font-black text-[#423326] dark:text-amber-100">
                {localInterval}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">minutos / ciclo</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Equivale a ~{dailyRequests} varreduras a cada 24 horas
            </span>
          </div>

          <div className="bg-[#fcfaf5] dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850">
            <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold block">
              Impacto de Carga no ERP
            </span>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg border uppercase ${erpLoadLevel.color}`}>
                {erpLoadLevel.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1.5">
              {dailyRequests > 200 ? "Recomendado para servidores dedicados" : "Excelente desempenho e baixo consumo de quota"}
            </span>
          </div>

          <div className="bg-[#fcfaf5] dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850">
            <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold block">
              Redundância & Fallback
            </span>
            <div className="flex items-center gap-1.5 mt-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Híbrido: Webhook + Polling</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {hybridWebhookFallback ? "Proteção ativa contra perda de eventos" : "Operando apenas via polling periódico"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Configuration Grid: Stepper + Presets + Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interval Stepper, Range & Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white/95 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-3">
              <h4 className="font-serif font-black text-sm uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Intervalo de Polling Automático (em minutos)
              </h4>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                1 min a 1440 min
              </span>
            </div>

            {/* Stepper + Big Numeric Input */}
            <div className="bg-[#fdfaf3] dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-sans">
                  Tempo entre varreduras automáticas:
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  A cada ciclo, o motor consulta novos boletos emitidos e liquidações quitadas.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const next = Math.max(1, localInterval - 5);
                    setLocalInterval(next);
                  }}
                  className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-base flex items-center justify-center transition-all shadow-3xs cursor-pointer active:scale-95"
                  title="Diminuir 5 minutos"
                >
                  -
                </button>

                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    step="1"
                    value={localInterval || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setLocalInterval(isNaN(val) ? 0 : val);
                    }}
                    onBlur={() => {
                      if (!localInterval || localInterval < 1) {
                        setLocalInterval(15);
                      } else if (localInterval > 1440) {
                        setLocalInterval(1440);
                      }
                    }}
                    className="w-24 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-xl px-3 py-2 text-center text-lg font-serif font-black text-[#423326] dark:text-amber-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="absolute right-2.5 text-[9px] font-mono text-slate-400 pointer-events-none">
                    min
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = Math.min(1440, localInterval + 5);
                    setLocalInterval(next);
                  }}
                  className="w-9 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-base flex items-center justify-center transition-all shadow-3xs cursor-pointer active:scale-95"
                  title="Aumentar 5 minutos"
                >
                  +
                </button>
              </div>
            </div>

            {/* Slider visual control */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>1 min (Tempo Real)</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-400">{localInterval} minutos selecionados</span>
                <span>1440 min (24 Horas)</span>
              </div>
              <input
                type="range"
                min="1"
                max="120"
                step="1"
                value={Math.min(120, localInterval)}
                onChange={(e) => setLocalInterval(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-[10px] text-slate-400 italic">
                * Para intervalos superiores a 120 minutos (ex: 360 ou 1440 min), utilize os atalhos rápidos abaixo ou digite diretamente no campo numérico.
              </p>
            </div>

            {/* Quick Presets Grid */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-sans">
                Atalhos Rápidos de Frequência:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets.map((preset) => {
                  const isSelected = localInterval === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handleApplyPreset(preset.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-3xs"
                          : "bg-slate-50/60 dark:bg-slate-950 border-slate-200/60 dark:border-slate-850 hover:bg-slate-100/70 dark:hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold font-mono ${isSelected ? "text-indigo-800 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"}`}>
                          {preset.label}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                      </div>
                      <span className={`text-[9px] font-medium mt-1 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>
                        {preset.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/95 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <div className="space-y-0.5 text-left w-full sm:w-auto">
              <span className="text-xs font-bold text-[#423326] dark:text-amber-100 block">
                Salvar Regras de Polling
              </span>
              <p className="text-[10px] text-slate-400">
                Aplica o novo intervalo ao agendador de sincronização do {erpName.toUpperCase()}.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleTriggerImmediatePolling}
                disabled={isPollingNow}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-3xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPollingNow ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
                <span>{isPollingNow ? "Executando..." : "Testar Polling Agora"}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-700 hover:bg-indigo-850 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Gravar Intervalo</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Polling Targets Scope & Advanced Resiliency (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Polling Targets Scope Card */}
          <div className="bg-white/95 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="font-serif font-black text-sm uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-2 border-b border-slate-150 dark:border-slate-850 pb-2.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              Eventos Alvo do Polling & Webhook
            </h4>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecione quais fluxos financeiros serão consultados periodicamente na fila do ERP:
            </p>

            <div className="space-y-3 pt-1">
              
              {/* Target 1: New Invoices */}
              <div className="flex items-start justify-between gap-3 p-3 bg-slate-50/70 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-850">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Novos Boletos e Carnês Emitidos
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Captura mensalidades e contratos recém-gerados pela secretaria escolar.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={pollNewInvoices}
                    onChange={(e) => setPollNewInvoices(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Target 2: Payment Confirmations */}
              <div className="flex items-start justify-between gap-3 p-3 bg-slate-50/70 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-850">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Confirmações de Pagamento (PIX / Boleto)
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Reconcilia faturas liquidadas no banco e quita automaticamente a mensalidade.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={pollPayments}
                    onChange={(e) => setPollPayments(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Target 3: Cancellations */}
              <div className="flex items-start justify-between gap-3 p-3 bg-slate-50/70 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-850">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    Cancelamentos e Baixas Financeiras
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Sincroniza estornos de títulos renegociados ou cancelados pela tesouraria.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={pollCancellations}
                    onChange={(e) => setPollCancellations(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Target 4: Hybrid Fallback */}
              <div className="flex items-start justify-between gap-3 p-3 bg-indigo-50/40 dark:bg-indigo-950/20 rounded-2xl border border-indigo-150 dark:border-indigo-900/50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-300 block flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Modo Híbrido: Webhook + Polling Redundante
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Garante entrega mesmo se a conexão HTTP de webhook falhar temporariamente.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={hybridWebhookFallback}
                    onChange={(e) => setHybridWebhookFallback(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

            </div>
          </div>

          {/* Advanced Resiliency and Batch Controls */}
          <div className="bg-white/95 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h4 className="font-serif font-black text-sm uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-2 border-b border-slate-150 dark:border-slate-850 pb-2.5">
              <Database className="w-4 h-4 text-indigo-600" />
              Parâmetros de Lote & Resiliência
            </h4>

            <div className="space-y-3.5">
              {/* Batch size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase font-mono">
                    Tamanho Máximo do Lote (Batch Limit):
                  </label>
                  <span className="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-400">
                    {batchSize} faturas / requisição
                  </span>
                </div>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value, 10))}
                  className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                >
                  <option value={25}>25 faturas por requisição (Mais leve)</option>
                  <option value={50}>50 faturas por requisição (Padrão sugerido)</option>
                  <option value={100}>100 faturas por requisição (Escolas de médio porte)</option>
                  <option value={250}>250 faturas por requisição (Carga densa / Alta capacidade)</option>
                </select>
              </div>

              {/* Night Eco Mode toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-850">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Economia Noturna de Requisições 🌙
                  </span>
                  <p className="text-[9.5px] text-slate-400">
                    Reduz a frequência entre 22h e 06h para preservar quotas de API.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={nightEcoMode}
                    onChange={(e) => setNightEcoMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Recent Polling Activity Log */}
      <div className="bg-white/95 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-850 pb-2.5">
          <h4 className="font-serif font-black text-sm uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Histórico das Últimas Execuções de Polling
          </h4>
          <span className="text-[9.5px] font-mono text-slate-400 uppercase font-bold">
            Monitoramento Automático
          </span>
        </div>

        <div className="space-y-2.5">
          {cycleLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:bg-slate-100/60 dark:hover:bg-slate-900"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Ciclo de Polling Concluído
                    </span>
                    <span className="text-[9.5px] font-mono text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-800">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {log.details}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-mono text-[10px]">
                <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-1 rounded-lg border border-indigo-150 dark:border-indigo-900/40">
                  +{log.invoicesPolled} boletos
                </span>
                <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-1 rounded-lg border border-emerald-150 dark:border-emerald-900/40">
                  +{log.paymentsPolled} pagos
                </span>
                <span className="text-slate-400 font-medium">
                  {log.durationMs}ms
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
