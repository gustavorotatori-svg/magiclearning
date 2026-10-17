import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Send,
  User,
  Sliders,
  History,
  Smartphone,
  ChevronRight,
  RefreshCw,
  Award,
  Search,
  Filter,
  FileText,
  Check,
  Layers,
  Calendar,
  Eye,
  Download,
  Users,
  Target,
  PhoneCall
} from "lucide-react";
import { Estudante, NotificationItem } from "../types";

export interface PipelineTransitionLog {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  parentName: string;
  stageFrom: "pendente" | "em_analise" | "concluido";
  stageTo: "pendente" | "em_analise" | "concluido";
  timestamp: number;
  dateFormatted: string;
  pushSent: boolean;
  author: string;
  notes?: string;
}

export interface CrmPipelineAlertsModuleProps {
  estudantes: Estudante[];
  onUpdateStudentStage: (
    studentId: string,
    newStage: "pendente" | "em_analise" | "concluido",
    previousStage?: "pendente" | "em_analise" | "concluido"
  ) => void;
  onTriggerPushNotification: (info: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
  onToast: (toast: { message: string; type: "success" | "error" | "info" | "warning" }) => void;
  className?: string;
  focusModePendente?: boolean;
  onToggleFocusMode?: (enabled: boolean) => void;
}

const DEFAULT_TRANSITIONS_SEED: PipelineTransitionLog[] = [
  {
    id: "trans-1",
    studentId: "1",
    studentName: "Nicolas Silva",
    studentGrade: "1º Ano B (Fund. I)",
    parentName: "Roberto Silva",
    stageFrom: "em_analise",
    stageTo: "concluido",
    timestamp: Date.now() - 1000 * 60 * 18,
    dateFormatted: "Hoje às 10:42",
    pushSent: true,
    author: "Portal do Responsável (Aceite Digital)",
    notes: "Contrato de rematrícula assinado eletronicamente via Super-App."
  },
  {
    id: "trans-2",
    studentId: "2",
    studentName: "Lucas Silva",
    studentGrade: "2º Ano A (Fund. I)",
    parentName: "Juliana Silva",
    stageFrom: "pendente",
    stageTo: "em_analise",
    timestamp: Date.now() - 1000 * 60 * 55,
    dateFormatted: "Hoje às 10:05",
    pushSent: true,
    author: "Coordenação Pedagógica (Prof. Helena)",
    notes: "Família solicitou proposta de desconto progressivo para segundo irmão."
  },
  {
    id: "trans-3",
    studentId: "3",
    studentName: "Beatriz Santos",
    studentGrade: "Maternal II",
    parentName: "Carlos Santos",
    stageFrom: "em_analise",
    stageTo: "concluido",
    timestamp: Date.now() - 1000 * 60 * 130,
    dateFormatted: "Hoje às 08:50",
    pushSent: true,
    author: "Secretaria Escolar (Atendente Mariana)",
    notes: "Taxa de reserva de vaga compensada via PIX instantâneo."
  },
  {
    id: "trans-4",
    studentId: "4",
    studentName: "Gabriel Ferreira",
    studentGrade: "9º Ano A (Fund. II)",
    parentName: "Fernanda Ferreira",
    stageFrom: "pendente",
    stageTo: "em_analise",
    timestamp: Date.now() - 1000 * 60 * 240,
    dateFormatted: "Ontem às 16:30",
    pushSent: true,
    author: "Gestor Comercial (WhatsApp Integrado)",
    notes: "Agendada reunião presencial de alinhamento com a diretoria."
  },
  {
    id: "trans-5",
    studentId: "5",
    studentName: "Manuela Costa",
    studentGrade: "3º Ano Médio",
    parentName: "Paulo Costa",
    stageFrom: "em_analise",
    stageTo: "concluido",
    timestamp: Date.now() - 1000 * 60 * 380,
    dateFormatted: "Ontem às 14:15",
    pushSent: true,
    author: "Portal do Responsável (Aceite Digital)",
    notes: "Termo de adesão ao Terceirão 2027 validado com biometria facial."
  }
];

export const CrmPipelineAlertsModule: React.FC<CrmPipelineAlertsModuleProps> = ({
  estudantes,
  onUpdateStudentStage,
  onTriggerPushNotification,
  onToast,
  className = "",
  focusModePendente,
  onToggleFocusMode
}) => {
  // Navigation tab: "config" (Gatilhos & Simulador) or "history" (Histórico de Transições)
  const [activeTab, setActiveTab] = useState<"config" | "history">("config");

  // Focus Mode state (Dashboard de Foco Comercial - Ocultar tudo exceto Pendente)
  const [internalFocusMode, setInternalFocusMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("crm_pipeline_focus_mode_pendente");
    return saved !== null ? saved === "true" : false;
  });

  const isFocusModeActive = focusModePendente !== undefined ? focusModePendente : internalFocusMode;

  const handleToggleFocusMode = () => {
    const next = !isFocusModeActive;
    setInternalFocusMode(next);
    localStorage.setItem("crm_pipeline_focus_mode_pendente", String(next));
    if (onToggleFocusMode) {
      onToggleFocusMode(next);
    }
    onToast({
      message: next
        ? "🎯 Modo 'Dashboard de Foco' ativado: Ocultando categorias do funil e priorizando contatos pendentes de conversão!"
        : "👁️ Modo de visualização completa do funil restaurado.",
      type: next ? "success" : "info"
    });
  };

  // Settings persisted in localStorage
  const [pushAlertsEnabled, setPushAlertsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("crm_pipeline_push_alerts_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [notifyOnAccepted, setNotifyOnAccepted] = useState<boolean>(() => {
    const saved = localStorage.getItem("crm_pipeline_notify_accepted");
    return saved !== null ? saved === "true" : true;
  });

  const [notifyOnNegotiation, setNotifyOnNegotiation] = useState<boolean>(() => {
    const saved = localStorage.getItem("crm_pipeline_notify_negotiation");
    return saved !== null ? saved === "true" : true;
  });

  const [notifyOnReversion, setNotifyOnReversion] = useState<boolean>(() => {
    const saved = localStorage.getItem("crm_pipeline_notify_reversion");
    return saved !== null ? saved === "true" : true;
  });

  // History of transitions
  const [transitionLogs, setTransitionLogs] = useState<PipelineTransitionLog[]>(() => {
    const saved = localStorage.getItem("crm_pipeline_transition_logs");
    return saved ? JSON.parse(saved) : DEFAULT_TRANSITIONS_SEED;
  });

  // Author statistics (for auditing who is processing most re-enrollments)
  const authorStats = useMemo(() => {
    const stats: Record<string, { total: number; concluidos: number; em_analise: number; pendentes: number }> = {};
    transitionLogs.forEach((log) => {
      const author = log.author || "Outro Operador";
      if (!stats[author]) {
        stats[author] = { total: 0, concluidos: 0, em_analise: 0, pendentes: 0 };
      }
      stats[author].total += 1;
      if (log.stageTo === "concluido") stats[author].concluidos += 1;
      else if (log.stageTo === "em_analise") stats[author].em_analise += 1;
      else if (log.stageTo === "pendente") stats[author].pendentes += 1;
    });
    return stats;
  }, [transitionLogs]);

  const uniqueAuthorsList = useMemo(() => {
    return Object.keys(authorStats).sort((a, b) => authorStats[b].total - authorStats[a].total);
  }, [authorStats]);

  // Simulator Form State
  const [simSelectedStudentId, setSimSelectedStudentId] = useState<string>(
    estudantes[0]?.id || "1"
  );
  const [simTargetStage, setSimTargetStage] = useState<"pendente" | "em_analise" | "concluido">(
    "concluido"
  );
  const [simAuthor, setSimAuthor] = useState<string>("Coordenação Pedagógica");
  const [simNote, setSimNote] = useState<string>("Aceite eletrônico do contrato realizado pelos pais.");
  const [isSimulating, setIsSimulating] = useState(false);

  // Filters for the History Tab
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [pushFilter, setPushFilter] = useState<string>("all");

  // Toggle Push Alerts
  const handleTogglePushAlerts = () => {
    const next = !pushAlertsEnabled;
    setPushAlertsEnabled(next);
    localStorage.setItem("crm_pipeline_push_alerts_enabled", next.toString());
    onToast({
      message: next
        ? "🔔 Alertas Push de Pipeline ativados para o administrador!"
        : "⏸️ Alertas Push de Pipeline silenciados.",
      type: next ? "success" : "info"
    });
  };

  const getStageLabel = (stage: "pendente" | "em_analise" | "concluido") => {
    switch (stage) {
      case "concluido":
        return {
          label: "Contrato Aceito 🎉",
          short: "Aceito",
          color: "text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700"
        };
      case "em_analise":
        return {
          label: "Em Negociação 💬",
          short: "Em Análise",
          color: "text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700"
        };
      case "pendente":
        return {
          label: "Sem Contato / Pendente ⏳",
          short: "Pendente",
          color: "text-orange-700 dark:text-orange-300 bg-orange-100/80 dark:bg-orange-950/60 border-orange-300 dark:border-orange-700"
        };
    }
  };

  // Execute Pipeline Transition & Trigger Real Push Alert
  const executeStageTransition = (
    studentId: string,
    newStage: "pendente" | "em_analise" | "concluido",
    customAuthor = "Simulador do Gestor CRM"
  ) => {
    const student = estudantes.find((e) => e.id === studentId);
    if (!student) return;

    const oldStage = student.reEnrollmentStatus || "pendente";
    if (oldStage === newStage) {
      onToast({
        message: `O aluno ${student.name} já se encontra na etapa "${getStageLabel(newStage).label}".`,
        type: "info"
      });
      return;
    }

    // 1. Update Student Stage in Parent State & LocalStorage
    onUpdateStudentStage(studentId, newStage, oldStage);

    // 2. Determine if push notification should be dispatched based on settings
    let shouldPush = pushAlertsEnabled;
    if (newStage === "concluido" && !notifyOnAccepted) shouldPush = false;
    if (newStage === "em_analise" && !notifyOnNegotiation) shouldPush = false;
    if (newStage === "pendente" && !notifyOnReversion) shouldPush = false;

    const stageFromInfo = getStageLabel(oldStage);
    const stageToInfo = getStageLabel(newStage);

    if (shouldPush) {
      onTriggerPushNotification({
        title: `🎯 Funil de Rematrícula: ${student.name}`,
        body: `Aluno avançou para "${stageToInfo.label}". Resp: ${student.parentName} (${student.grade}).`,
        targetTab: "academico",
        iconType: newStage === "concluido" ? "faturamento" : "announcement",
        studentName: student.name
      });
    }

    // 3. Save to Pipeline Transition Log
    const newLog: PipelineTransitionLog = {
      id: "trans-" + Date.now(),
      studentId: student.id,
      studentName: student.name,
      studentGrade: student.grade,
      parentName: student.parentName,
      stageFrom: oldStage,
      stageTo: newStage,
      timestamp: Date.now(),
      dateFormatted: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      pushSent: shouldPush,
      author: customAuthor,
      notes: simNote || `Transição registrada no CRM escolar.`
    };

    setTransitionLogs((prev) => {
      const updated = [newLog, ...prev.slice(0, 39)];
      localStorage.setItem("crm_pipeline_transition_logs", JSON.stringify(updated));
      return updated;
    });

    onToast({
      message: `🚀 Transição de ${student.name} para "${stageToInfo.label}" concluída com push disparado ao gestor!`,
      type: "success"
    });
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    executeStageTransition(simSelectedStudentId, simTargetStage, simAuthor || "Simulador de Alertas CRM");
    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  const currentSimStudent = estudantes.find((e) => e.id === simSelectedStudentId) || estudantes[0];

  // Filtered logs for the "Histórico de Transições" tab with Author Filter logic
  const filteredLogs = useMemo(() => {
    return transitionLogs.filter((log) => {
      // Search text
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesName = log.studentName.toLowerCase().includes(query);
        const matchesParent = log.parentName.toLowerCase().includes(query);
        const matchesAuthor = log.author.toLowerCase().includes(query);
        const matchesNotes = log.notes?.toLowerCase().includes(query) || false;
        const matchesGrade = log.studentGrade.toLowerCase().includes(query);
        if (!matchesName && !matchesParent && !matchesAuthor && !matchesNotes && !matchesGrade) {
          return false;
        }
      }
      // Stage filter
      if (stageFilter !== "all" && log.stageTo !== stageFilter) {
        return false;
      }
      // Push filter
      if (pushFilter === "push_only" && !log.pushSent) return false;
      if (pushFilter === "no_push" && log.pushSent) return false;

      // Author Filter (Responsável pela Alteração)
      if (authorFilter !== "all") {
        const authorLower = log.author.toLowerCase();
        const targetLower = authorFilter.toLowerCase();
        if (authorLower !== targetLower && !authorLower.includes(targetLower)) {
          return false;
        }
      }

      return true;
    });
  }, [transitionLogs, searchFilter, stageFilter, authorFilter, pushFilter]);

  // Export audit report
  const handleExportAuditJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transitionLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `auditoria_transicoes_rematricula_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onToast({
      message: "📄 Relatório de auditoria de transições exportado com sucesso!",
      type: "success"
    });
  };

  // Pending students for Focus Mode
  const pendingStudentsList = useMemo(() => {
    return estudantes.filter((e) => (e.reEnrollmentStatus || "pendente") === "pendente");
  }, [estudantes]);

  return (
    <div
      id="crm-pipeline-alerts-module"
      className={`CrmPipelineAlertsModule bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6 text-left ${className}`}
    >
      {/* 1. Top Header with Title, Push Status, Focus Mode & Tab Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 shrink-0">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-black text-base text-slate-900 dark:text-slate-100">
                Auditoria & Alertas do Funil CRM (Rematrículas)
              </h3>
              <span
                className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  pushAlertsEnabled
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
                }`}
              >
                {pushAlertsEnabled ? "● Push Ativo ao Gestor" : "○ Push Silenciado"}
              </span>
              {isFocusModeActive && (
                <span className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 flex items-center gap-1">
                  <Target className="w-2.5 h-2.5" />
                  <span>Modo Foco Comercial Ativo</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-sans">
              Controle de gatilhos automáticos, rastreabilidade de operadores e auditoria completa de mudanças de etapa.
            </p>
          </div>
        </div>

        {/* Action Buttons & Tabs Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* LTV Mastery Config Modal Trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open_ltv_mastery_modal"))}
            id="btn-crm-pipeline-ltv-thresholds"
            className="px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30"
            title="Ajustar limiares de LTV Mastery e thresholds de engajamento do CRM"
          >
            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>LTV Mastery</span>
          </button>

          {/* Dashboard de Foco Toggle Button */}
          <button
            type="button"
            onClick={handleToggleFocusMode}
            id="btn-crm-focus-mode"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
              isFocusModeActive
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-600 font-black ring-2 ring-amber-400/40"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300"
            }`}
            title="Ocultar categorias concluídas do funil e priorizar contatos que ainda não foram convertidos"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isFocusModeActive ? "🎯 Foco: Só Pendentes" : "🎯 Dashboard de Foco"}</span>
          </button>

          {/* Main Module Tabs Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold font-sans">
            <button
              type="button"
              onClick={() => setActiveTab("config")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "config"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Gatilhos & Testes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "history"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <History className="w-3.5 h-3.5 text-amber-500" />
              <span>Histórico de Transições</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full">
                {transitionLogs.length}
              </span>
            </button>
          </div>

          {/* Master Push Toggle Button */}
          <button
            type="button"
            onClick={handleTogglePushAlerts}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
              pushAlertsEnabled
                ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{pushAlertsEnabled ? "Push Ligado" : "Ligar Push"}</span>
          </button>
        </div>
      </div>

      {/* 🎯 PROMINENT "DASHBOARD DE FOCO" BANNER (WHEN ACTIVE) */}
      <AnimatePresence>
        {isFocusModeActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm"
            id="crm-pipeline-focus-mode-dashboard"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 dark:border-amber-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0 shadow-xs">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-100 font-sans flex items-center gap-2">
                    <span>Dashboard de Foco Comercial: Priorização de Alunos Pendentes</span>
                    <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono px-2 py-0.5 rounded-full font-bold">
                      {pendingStudentsList.length} não convertidos
                    </span>
                  </h4>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-tight">
                    Todas as categorias de alunos já homologados ('Contrato Aceito') ou em negociação foram ocultadas para acelerar a conversão dos contatos pendentes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    pendingStudentsList.forEach((st, idx) => {
                      setTimeout(() => {
                        onTriggerPushNotification({
                          title: `🎯 Lembrete Comercial: ${st.name}`,
                          body: `Rematrícula pendente para ${st.name} (${st.grade}). Contate o responsável ${st.parentName}.`,
                          targetTab: "academico",
                          iconType: "faturamento",
                          studentName: st.name
                        });
                      }, idx * 250);
                    });
                    onToast({
                      message: `🚀 Disparados ${pendingStudentsList.length} alertas push de lembrete para os alunos pendentes!`,
                      type: "success"
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Notificar Pendentes ({pendingStudentsList.length})</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFocusMode}
                  className="text-xs text-amber-800 dark:text-amber-300 hover:underline font-bold px-2 py-1 cursor-pointer"
                >
                  Sair do Modo Foco ✕
                </button>
              </div>
            </div>

            {/* List of Pending Students (Unconverted contacts priority list) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-amber-900 dark:text-amber-200 font-bold">
                <span>Fila de Prioridade Comercial ({pendingStudentsList.length} alunos)</span>
                <span>Ações Rápidas de Conversão & Follow-up</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {pendingStudentsList.length === 0 ? (
                  <div className="col-span-2 p-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200">
                    🎉 Parabéns! Nenhum aluno com rematrícula pendente. Todas as vagas foram convertidas!
                  </div>
                ) : (
                  pendingStudentsList.map((st) => (
                    <div
                      key={st.id}
                      className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 shadow-2xs space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
                            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                              {st.name}
                            </h5>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {st.grade} • Resp: {st.parentName || "Não informado"}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono font-black bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded border border-orange-200 dark:border-orange-800 shrink-0">
                          ⏳ Pendente
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onToast({
                                message: `📱 Abrindo WhatsApp para contato de rematrícula de ${st.name}...`,
                                type: "info"
                              });
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              executeStageTransition(st.id, "em_analise", "Equipe Comercial (Modo Foco)");
                            }}
                            className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowRight className="w-2.5 h-2.5" />
                            <span>Em Negociação</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            executeStageTransition(st.id, "concluido", "Equipe Comercial (Modo Foco)");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Check className="w-2.5 h-2.5" />
                          <span>Aceitar Contrato 🎉</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* TAB 1: GATILHOS, REGRAS E SIMULADOR */}
      {/* ========================================================================= */}
      {activeTab === "config" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Notification Rules & Triggers (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50/70 dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase font-mono text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Gatilhos de Notificação Push</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Regras do CRM</span>
              </div>

              <div className="space-y-2.5">
                {/* Rule 1: Accepted / Concluido */}
                <label className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-emerald-300 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Contrato Aceito / Homologado</span>
                    </span>
                    <p className="text-[10.5px] text-slate-500 leading-tight">
                      Disparar push prioritário quando o contrato for assinado ou compensado.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnAccepted}
                    onChange={(e) => {
                      setNotifyOnAccepted(e.target.checked);
                      localStorage.setItem("crm_pipeline_notify_accepted", e.target.checked.toString());
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-0.5 cursor-pointer"
                  />
                </label>

                {/* Rule 2: Negotiation / Em Analise */}
                <label className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-300 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                      <span>Entrada em Negociação / Análise</span>
                    </span>
                    <p className="text-[10.5px] text-slate-500 leading-tight">
                      Notificar quando a família solicitar proposta ou atendimento personalizado.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnNegotiation}
                    onChange={(e) => {
                      setNotifyOnNegotiation(e.target.checked);
                      localStorage.setItem("crm_pipeline_notify_negotiation", e.target.checked.toString());
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-0.5 cursor-pointer"
                  />
                </label>

                {/* Rule 3: Reversion to Pendente */}
                <label className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-orange-300 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      <span>Reversão para Sem Contato / Pendente</span>
                    </span>
                    <p className="text-[10.5px] text-slate-500 leading-tight">
                      Alertar a coordenação caso uma renovação retorne para pendente.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnReversion}
                    onChange={(e) => {
                      setNotifyOnReversion(e.target.checked);
                      localStorage.setItem("crm_pipeline_notify_reversion", e.target.checked.toString());
                    }}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 mt-0.5 cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Canais Integrados:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Push App • Toast • Badge</span>
              </div>
            </div>

            {/* Right Column: Interactive Stage Transition Simulator (7 cols) */}
            <div className="lg:col-span-7 bg-indigo-50/40 dark:bg-slate-950/40 border border-indigo-200/70 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold uppercase font-mono text-slate-800 dark:text-slate-200">
                    Simulador & Testador de Transição de Etapas
                  </h4>
                </div>
                <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300/50">
                  Auditável em Tempo Real
                </span>
              </div>

              <form onSubmit={handleSimulateSubmit} className="space-y-3">
                {/* Student Picker & Target Stage */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Selecionar Aluno:
                    </label>
                    <select
                      value={simSelectedStudentId}
                      onChange={(e) => setSimSelectedStudentId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    >
                      {estudantes.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.grade}) - Atual: {e.reEnrollmentStatus || "pendente"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Nova Etapa no Funil:
                    </label>
                    <select
                      value={simTargetStage}
                      onChange={(e) => setSimTargetStage(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="concluido">🎉 Contrato Aceito / Confirmado</option>
                      <option value="em_analise">💬 Em Negociação / Análise</option>
                      <option value="pendente">⏳ Sem Contato / Pendente</option>
                    </select>
                  </div>
                </div>

                {/* Operator / Author & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Responsável pela Alteração (Autor):
                    </label>
                    <input
                      type="text"
                      value={simAuthor}
                      onChange={(e) => setSimAuthor(e.target.value)}
                      placeholder="Ex: Coordenação Pedagógica / Portal do Responsável"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Justificativa / Observação do Atendimento:
                    </label>
                    <input
                      type="text"
                      value={simNote}
                      onChange={(e) => setSimNote(e.target.value)}
                      placeholder="Ex: Contrato digital validado com sucesso."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="text-[10px] text-slate-500 font-sans">
                    Status Atual:{" "}
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {currentSimStudent?.reEnrollmentStatus || "pendente"}
                    </span>{" "}
                    → Destino:{" "}
                    <span className="font-bold text-emerald-600">
                      {simTargetStage}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isSimulating ? "Disparando..." : "Mudar Etapa & Registrar Auditoria"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Stream Preview of recent 3 items */}
          <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <History className="w-4 h-4 text-indigo-500" />
                <span>Auditoria de Transições Ativa ({transitionLogs.length} eventos gravados)</span>
              </span>
              <p className="text-[11px] text-slate-500">
                Acesse a aba <strong>Histórico de Transições</strong> para filtrar por operador, aluno ou justificativa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Ver Histórico Completo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HISTÓRICO DE TRANSIÇÕES (AUDITORIA COMPLETA) */}
      {/* ========================================================================= */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {/* 1. Header & Metric Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Total de Transições
              </span>
              <span className="text-lg font-black font-mono text-slate-800 dark:text-slate-100">
                {transitionLogs.length}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50">
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold block">
                Aceites Confirmados
              </span>
              <span className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-300">
                {transitionLogs.filter((l) => l.stageTo === "concluido").length}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50">
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase font-bold block">
                Em Negociação
              </span>
              <span className="text-lg font-black font-mono text-amber-700 dark:text-amber-300">
                {transitionLogs.filter((l) => l.stageTo === "em_analise").length}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50">
              <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-400 uppercase font-bold block">
                Push Disparados
              </span>
              <span className="text-lg font-black font-mono text-indigo-700 dark:text-indigo-300">
                {transitionLogs.filter((l) => l.pushSent).length}
              </span>
            </div>
          </div>

          {/* 🌟 Equipe & Produtividade: Filtro Rápido por Responsável pela Alteração */}
          <div className="bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Produtividade por Responsável pela Alteração:</span>
              </span>
              <span className="text-slate-400 text-[10px]">
                {authorFilter !== "all" ? `Filtrando por: "${authorFilter}"` : "Exibindo todos os operadores"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAuthorFilter("all")}
                className={`text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  authorFilter === "all"
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs font-black"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                }`}
              >
                Todos ({transitionLogs.length})
              </button>

              {uniqueAuthorsList.map((authorName) => {
                const stat = authorStats[authorName];
                const isSelected = authorFilter.toLowerCase() === authorName.toLowerCase();
                return (
                  <button
                    key={authorName}
                    type="button"
                    onClick={() => setAuthorFilter(isSelected ? "all" : authorName)}
                    className={`text-[10.5px] font-mono font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs font-black ring-2 ring-indigo-400/30"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                    }`}
                  >
                    <User className="w-2.5 h-2.5 text-indigo-400" />
                    <span>{authorName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                        isSelected
                          ? "bg-indigo-800 text-white"
                          : "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                      }`}
                    >
                      {stat.total}
                    </span>
                    {stat.concluidos > 0 && (
                      <span className="text-[8.5px] text-emerald-500 font-black">
                        ({stat.concluidos} ✓)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Search & Filters Bar */}
          <div className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              {/* Search Bar */}
              <div className="sm:col-span-5 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Buscar por aluno, responsável, autor ou motivo..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Stage Filter */}
              <div className="sm:col-span-3">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="all">Todas as Etapas (Destino)</option>
                  <option value="concluido">🎉 Contrato Aceito</option>
                  <option value="em_analise">💬 Em Negociação</option>
                  <option value="pendente">⏳ Sem Contato / Pendente</option>
                </select>
              </div>

              {/* Author Filter (Responsável pela Alteração) */}
              <div className="sm:col-span-2">
                <select
                  id="select-author-filter"
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="all">Todos os Responsáveis ({transitionLogs.length})</option>
                  {uniqueAuthorsList.map((auth) => (
                    <option key={auth} value={auth}>
                      {auth} ({authorStats[auth]?.total || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="sm:col-span-2 flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={handleExportAuditJson}
                  title="Exportar JSON de Auditoria"
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exportar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTransitionLogs(DEFAULT_TRANSITIONS_SEED);
                    localStorage.setItem("crm_pipeline_transition_logs", JSON.stringify(DEFAULT_TRANSITIONS_SEED));
                    setSearchFilter("");
                    setStageFilter("all");
                    setAuthorFilter("all");
                    onToast({ message: "Histórico de auditoria restaurado com sucesso.", type: "info" });
                  }}
                  title="Restaurar padrão"
                  className="p-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Transition Logs Audit Feed / Table */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Nenhum registro de transição encontrado para os filtros selecionados.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchFilter("");
                    setStageFilter("all");
                    setAuthorFilter("all");
                  }}
                  className="text-xs text-indigo-600 hover:underline font-medium cursor-pointer"
                >
                  Limpar filtros de busca
                </button>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const from = getStageLabel(log.stageFrom);
                const to = getStageLabel(log.stageTo);

                return (
                  <div
                    key={log.id}
                    className="p-4 sm:p-4.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-850/40 transition-colors"
                  >
                    {/* Left: Student info & Transition stages */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-indigo-100 dark:border-indigo-900">
                        {log.studentName.charAt(0)}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {log.studentName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({log.studentGrade}) • Resp: {log.parentName}
                          </span>
                        </div>

                        {/* Transition Route */}
                        <div className="flex items-center gap-1.5 text-[10.5px] font-mono flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold ${from.color}`}>
                            {from.label}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold ${to.color}`}>
                            {to.label}
                          </span>
                        </div>

                        {/* Justification & Author Notes */}
                        {log.notes && (
                          <div className="pt-0.5">
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans">
                              "{log.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Operator / Author, Push Status & Timestamp */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <User className="w-2.5 h-2.5 text-indigo-500" />
                          <span>{log.author}</span>
                        </span>

                        {log.pushSent ? (
                          <span className="text-[8.5px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-200/50 flex items-center gap-1">
                            <Smartphone className="w-2.5 h-2.5" />
                            <span>Push Enviado</span>
                          </span>
                        ) : (
                          <span className="text-[8.5px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                            Push Silenciado
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400">
                        {log.dateFormatted}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};

