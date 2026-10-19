import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Kanban,
  Clock,
  PhoneCall,
  CheckCircle2,
  Award,
  Search,
  Filter,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  User,
  Send,
  Sparkles,
  GripVertical,
  Check,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Smartphone,
  Sliders,
  BarChart3,
  Percent,
  Copy,
  Target,
  X
} from "lucide-react";
import { Estudante } from "../types";
import { triggerCelebrationConfetti } from "../utils/goldenConfetti";

export interface CrmKanbanBoardProps {
  estudantes: Estudante[];
  onUpdateStudentStage: (
    studentId: string,
    newStage: "pendente" | "em_analise" | "concluido",
    previousStage?: "pendente" | "em_analise" | "concluido"
  ) => void;
  onTriggerDirectMessage?: (phone: string, text: string) => void;
  onTriggerPushNotification?: (info: any) => void;
  onToast: (toast: { message: string; type: "success" | "error" | "info" | "warning" }) => void;
  onSelectStudent?: (student: Estudante) => void;
}

type ReEnrollmentStage = "pendente" | "em_analise" | "concluido";

interface ColumnDef {
  id: ReEnrollmentStage;
  title: string;
  subtitle: string;
  headerColor: string;
  badgeColor: string;
  borderColor: string;
  hoverBorder: string;
  dropBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COLUMNS: ColumnDef[] = [
  {
    id: "pendente",
    title: "Pendente",
    subtitle: "Aguardando contato ou sem resposta inicial",
    headerColor: "text-amber-700 dark:text-amber-400",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    borderColor: "border-amber-200/80 dark:border-amber-900/50",
    hoverBorder: "border-amber-400 dark:border-amber-600",
    dropBg: "bg-amber-50/70 dark:bg-amber-950/20",
    icon: Clock
  },
  {
    id: "em_analise",
    title: "Em Negociação",
    subtitle: "Atendimento comercial ativo e proposta enviada",
    headerColor: "text-blue-700 dark:text-blue-400",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
    borderColor: "border-blue-200/80 dark:border-blue-900/50",
    hoverBorder: "border-blue-400 dark:border-blue-600",
    dropBg: "bg-blue-50/70 dark:bg-blue-950/20",
    icon: PhoneCall
  },
  {
    id: "concluido",
    title: "Contrato Aceito",
    subtitle: "Rematrícula confirmada e contrato assinado",
    headerColor: "text-emerald-700 dark:text-emerald-400",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    borderColor: "border-emerald-200/80 dark:border-emerald-900/50",
    hoverBorder: "border-emerald-400 dark:border-emerald-600",
    dropBg: "bg-emerald-50/70 dark:bg-emerald-950/20",
    icon: CheckCircle2
  }
];

export const CrmKanbanBoard: React.FC<CrmKanbanBoardProps> = ({
  estudantes,
  onUpdateStudentStage,
  onTriggerDirectMessage,
  onTriggerPushNotification,
  onToast,
  onSelectStudent
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState<ReEnrollmentStage | "all">("all");
  const [statsViewMode, setStatsViewMode] = useState<"base" | "funnel">("base");
  const [draggedStudentId, setDraggedStudentId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ReEnrollmentStage | null>(null);
  const [recentlyMovedStudentId, setRecentlyMovedStudentId] = useState<string | null>(null);
  const [recentlyMovedStage, setRecentlyMovedStage] = useState<ReEnrollmentStage | null>(null);

  // Quick WhatsApp message modal state
  const [quickMsgStudent, setQuickMsgStudent] = useState<Estudante | null>(null);
  const [quickMsgText, setQuickMsgText] = useState("");

  // Extract unique grades for filter
  const uniqueGrades = useMemo(() => {
    const set = new Set<string>();
    estudantes.forEach((e) => {
      if (e.grade) set.add(e.grade);
    });
    return Array.from(set).sort();
  }, [estudantes]);

  // Filter students based on search, grade, and stage
  const filteredStudents = useMemo(() => {
    return estudantes.filter((est) => {
      if (selectedGradeFilter !== "all" && est.grade !== selectedGradeFilter) {
        return false;
      }
      if (stageFilter !== "all") {
        const studentStage = est.reEnrollmentStatus || "pendente";
        if (studentStage !== stageFilter) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = est.name.toLowerCase().includes(q);
        const matchesParent = (est.parentName || "").toLowerCase().includes(q);
        const matchesGrade = est.grade.toLowerCase().includes(q);
        const matchesPhone = (est.parentPhone || "").includes(q);
        if (!matchesName && !matchesParent && !matchesGrade && !matchesPhone) {
          return false;
        }
      }
      return true;
    });
  }, [estudantes, searchQuery, selectedGradeFilter, stageFilter]);

  // Group students by stage
  const studentsByStage = useMemo(() => {
    const map: Record<ReEnrollmentStage, Estudante[]> = {
      pendente: [],
      em_analise: [],
      concluido: []
    };

    filteredStudents.forEach((student) => {
      const stage: ReEnrollmentStage =
        student.reEnrollmentStatus === "concluido"
          ? "concluido"
          : student.reEnrollmentStatus === "em_analise"
          ? "em_analise"
          : "pendente";
      map[stage].push(student);
    });

    return map;
  }, [filteredStudents]);

  // Comprehensive conversion statistics per stage
  const conversionStats = useMemo(() => {
    const total = estudantes.length;
    const pendentes = estudantes.filter((e) => (e.reEnrollmentStatus || "pendente") === "pendente").length;
    const emAnalise = estudantes.filter((e) => e.reEnrollmentStatus === "em_analise").length;
    const concluidos = estudantes.filter((e) => e.reEnrollmentStatus === "concluido").length;

    // Standard school monthly fee benchmark: R$ 1.850,00 (anualizado R$ 22.200,00 por aluno)
    const TICKET_MENSAL = 1850;
    const TICKET_ANUAL = TICKET_MENSAL * 12;

    // Base shares (% of total enrolled cohort)
    const sharePendente = total > 0 ? (pendentes / total) * 100 : 0;
    const shareEmAnalise = total > 0 ? (emAnalise / total) * 100 : 0;
    const shareConcluido = total > 0 ? (concluidos / total) * 100 : 0;

    // Funnel progression rates:
    // 1. Initial activation: % of students that moved beyond 'pendente' into active negotiation or accepted
    const advancedBeyondPendente = emAnalise + concluidos;
    const passThroughPendenteToAnalise = total > 0 ? (advancedBeyondPendente / total) * 100 : 0;

    // 2. Negotiation closing rate: % of negotiated leads that successfully completed contracts
    const totalInNegotiation = emAnalise + concluidos;
    const passThroughAnaliseToConcluido =
      totalInNegotiation > 0 ? (concluidos / totalInNegotiation) * 100 : 0;

    // 3. Final Overall Conversion rate
    const overallConversion = total > 0 ? (concluidos / total) * 100 : 0;

    // School benchmark target: 85% retention rate
    const targetGoal = 85;
    const goalPacing = targetGoal > 0 ? (overallConversion / targetGoal) * 100 : 0;

    // Financial values
    const receitaGarantida = concluidos * TICKET_ANUAL;
    const receitaEmNegociacao = emAnalise * TICKET_ANUAL;
    const receitaPendente = pendentes * TICKET_ANUAL;
    const receitaTotalPotencial = total * TICKET_ANUAL;

    // Operational bottleneck detection
    let bottleneckStage: ReEnrollmentStage = "pendente";
    let bottleneckReason = `${pendentes} estudantes aguardando primeiro contato institucional.`;
    if (emAnalise > pendentes && emAnalise >= concluidos) {
      bottleneckStage = "em_analise";
      bottleneckReason = `${emAnalise} propostas comerciais abertas necessitando de follow-up ativo.`;
    } else if (concluidos >= pendentes && concluidos >= emAnalise) {
      bottleneckStage = "concluido";
      bottleneckReason = `Ritmo acelerado: ${concluidos} contratos já confirmados para o ano letivo.`;
    }

    return {
      total,
      pendentes,
      emAnalise,
      concluidos,
      sharePendente,
      shareEmAnalise,
      shareConcluido,
      passThroughPendenteToAnalise,
      passThroughAnaliseToConcluido,
      overallConversion,
      targetGoal,
      goalPacing,
      receitaGarantida,
      receitaEmNegociacao,
      receitaPendente,
      receitaTotalPotencial,
      bottleneckStage,
      bottleneckReason
    };
  }, [estudantes]);

  // Backward compatibility alias for existing metrics consumers
  const metrics = useMemo(() => ({
    total: conversionStats.total,
    pendentes: conversionStats.pendentes,
    emAnalise: conversionStats.emAnalise,
    concluidos: conversionStats.concluidos,
    conversionRate: conversionStats.overallConversion.toFixed(1)
  }), [conversionStats]);

  // Handle stage transition
  const handleMoveStage = useCallback(
    (studentId: string, newStage: ReEnrollmentStage) => {
      const student = estudantes.find((e) => e.id === studentId);
      if (!student) return;

      const currentStage: ReEnrollmentStage =
        student.reEnrollmentStatus === "concluido"
          ? "concluido"
          : student.reEnrollmentStatus === "em_analise"
          ? "em_analise"
          : "pendente";

      if (currentStage === newStage) {
        return;
      }

      onUpdateStudentStage(studentId, newStage, currentStage);

      // Trigger visual feedback: glowing border & scale animation on moved card
      setRecentlyMovedStudentId(studentId);
      setRecentlyMovedStage(newStage);
      setTimeout(() => {
        setRecentlyMovedStudentId((prev) => (prev === studentId ? null : prev));
        setRecentlyMovedStage((prev) => (prev === newStage ? null : prev));
      }, 2400);

      const stageLabels: Record<ReEnrollmentStage, string> = {
        pendente: "Pendente",
        em_analise: "Em Negociação",
        concluido: "Contrato Aceito"
      };

      if (newStage === "concluido") {
        triggerCelebrationConfetti(`kanban-card-${studentId}`);
        onToast({
          message: `🎉 Parabéns! Rematrícula de ${student.name} confirmada (Contrato Aceito)!`,
          type: "success"
        });
      } else {
        onToast({
          message: `${student.name} movido para "${stageLabels[newStage]}" com sucesso!`,
          type: "info"
        });
      }
    },
    [estudantes, onUpdateStudentStage, onToast]
  );

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, studentId: string) => {
    setDraggedStudentId(studentId);
    e.dataTransfer.setData("text/plain", studentId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedStudentId(null);
    setDragOverColumn(null);
  };

  const handleDragOverColumn = (e: React.DragEvent<HTMLDivElement>, stageId: ReEnrollmentStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== stageId) {
      setDragOverColumn(stageId);
    }
  };

  const handleDragLeaveColumn = (e: React.DragEvent<HTMLDivElement>, stageId: ReEnrollmentStage) => {
    e.preventDefault();
    if (dragOverColumn === stageId) {
      setDragOverColumn(null);
    }
  };

  const handleDropOnColumn = (e: React.DragEvent<HTMLDivElement>, stageId: ReEnrollmentStage) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData("text/plain") || draggedStudentId;
    if (studentId) {
      handleMoveStage(studentId, stageId);
    }
    setDraggedStudentId(null);
    setDragOverColumn(null);
  };

  // Open quick message modal
  const handleOpenQuickMessage = (student: Estudante) => {
    setQuickMsgStudent(student);
    const stage = student.reEnrollmentStatus || "pendente";
    let defaultMsg = `Olá, ${student.parentName || "família"}! Aqui é da coordenação pedagógica do colégio sobre a rematrícula de ${student.name}.`;
    if (stage === "pendente") {
      defaultMsg = `Olá, ${student.parentName || "família"}! Tudo bem? As vagas para o ano letivo de 2027 já estão abertas com condições exclusivas para rematrícula de ${student.name}. Gostaria de tirar alguma dúvida sobre o contrato digital?`;
    } else if (stage === "em_analise") {
      defaultMsg = `Olá, ${student.parentName || "família"}! Segue o link com a proposta especial de rematrícula de ${student.name} com o plano negociado. O link de assinatura digital expira em 48h. Podemos ajudar a finalizar?`;
    } else if (stage === "concluido") {
      defaultMsg = `Olá, ${student.parentName || "família"}! Confirmamos com alegria a rematrícula de ${student.name}! O contrato já foi arquivado e a vaga garantida com sucesso. Conte sempre conosco!`;
    }
    setQuickMsgText(defaultMsg);
  };

  const handleSendQuickMessage = () => {
    if (!quickMsgStudent) return;
    const phone = quickMsgStudent.parentPhone || "(11) 98888-1234";
    if (onTriggerDirectMessage) {
      onTriggerDirectMessage(phone, quickMsgText);
    }
    onToast({
      message: `Mensagem enviada com sucesso para ${quickMsgStudent.parentName || quickMsgStudent.name}!`,
      type: "success"
    });
    setQuickMsgStudent(null);
  };

  const handleCopySummary = useCallback(() => {
    const text = `📊 Resumo de Conversão - Rematrícula Escolar
• Total de Estudantes: ${conversionStats.total}
• 01. Pendente: ${conversionStats.pendentes} (${conversionStats.sharePendente.toFixed(1)}%) - R$ ${(conversionStats.receitaPendente).toLocaleString("pt-BR")}
• 02. Em Negociação: ${conversionStats.emAnalise} (${conversionStats.shareEmAnalise.toFixed(1)}%) - R$ ${(conversionStats.receitaEmNegociacao).toLocaleString("pt-BR")}
• 03. Contrato Aceito: ${conversionStats.concluidos} (${conversionStats.overallConversion.toFixed(1)}%) - R$ ${(conversionStats.receitaGarantida).toLocaleString("pt-BR")}
Taxa Global de Rematrícula: ${conversionStats.overallConversion.toFixed(1)}% (Meta Escolar: ${conversionStats.targetGoal}%)`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      onToast({
        message: "Estatísticas de conversão copiadas para a área de transferência!",
        type: "success"
      });
    } else {
      onToast({
        message: "Resumo gerado com sucesso!",
        type: "info"
      });
    }
  }, [conversionStats, onToast]);

  return (
    <div className="space-y-5 text-left" id="crm-kanban-board-root">
      {/* 1. Header with Title & Operational Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Pipeline Comercial & Esteira de Retenção
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Quadro Kanban de Rematrícula</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open_ltv_mastery_modal"))}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            title="Ajustar thresholds de LTV Mastery e réguas de engajamento do CRM"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Configurar Réguas & LTV</span>
          </button>

          {/* Global Conversion Badge */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-mono">
                Conversão Geral
              </span>
              <strong className="text-slate-900 dark:text-slate-100 font-mono font-bold text-sm">
                {metrics.conversionRate}%
              </strong>
              <span className="text-slate-400 text-[11px] font-mono ml-1">
                ({metrics.concluidos}/{metrics.total})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Painel de Estatísticas Rápidas de Conversão de Rematrícula por Estágio */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
        {/* Painel Header: Título enxuto + Alternadores & Ações */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/60 dark:bg-slate-850/60">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide font-sans">
                Estatísticas Rápidas de Conversão por Estágio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle: Proporção da Base vs Funil de Avanço */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
              <button
                type="button"
                onClick={() => setStatsViewMode("base")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  statsViewMode === "base"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
                title="Exibir taxas como proporção do total de alunos"
              >
                % da Base
              </button>
              <button
                type="button"
                onClick={() => setStatsViewMode("funnel")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  statsViewMode === "funnel"
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
                title="Exibir eficiência de passagem e avanço entre etapas"
              >
                Funil de Avanço
              </button>
            </div>

            {/* Quick Copy Summary Button */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer"
              title="Copiar resumo de taxas de conversão para a área de transferência"
            >
              <Copy className="w-3 h-3 text-slate-500" />
              <span className="hidden sm:inline">Copiar Resumo</span>
            </button>
          </div>
        </div>

        {/* Três Estágios da Esteira de Rematrícula (Pendente -> Negociação -> Aceito) */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Estágio 1: Pendente */}
          <div
            className={`p-4 transition-colors ${
              stageFilter === "pendente"
                ? "bg-amber-50/40 dark:bg-amber-950/20"
                : "hover:bg-slate-50/60 dark:hover:bg-slate-850/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-700 dark:text-amber-400">
                  Estágio 01
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Pendente / Triagem
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setStageFilter(stageFilter === "pendente" ? "all" : "pendente")}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer border ${
                  stageFilter === "pendente"
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100"
                }`}
                title="Filtrar quadro Kanban para este estágio"
              >
                {stageFilter === "pendente" ? "Foco Ativo ✕" : "Filtrar"}
              </button>
            </div>

            {/* Taxa de Rematrícula do Estágio 1 */}
            <div className="my-2 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                  {statsViewMode === "base"
                    ? `${conversionStats.sharePendente.toFixed(1)}%`
                    : `${conversionStats.passThroughPendenteToAnalise.toFixed(1)}%`}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans ml-1.5">
                  {statsViewMode === "base"
                    ? `da base (${conversionStats.pendentes} alunos)`
                    : `ativados (${conversionStats.emAnalise + conversionStats.concluidos}/${conversionStats.total})`}
                </span>
              </div>
            </div>

            {/* Barra Linear de Conversão */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    statsViewMode === "base"
                      ? conversionStats.sharePendente
                      : conversionStats.passThroughPendenteToAnalise
                  )}%`
                }}
              />
            </div>

            {/* Detalhes operacionais e ticket */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2 font-mono">
              <span>Pipeline em risco:</span>
              <strong className="text-amber-700 dark:text-amber-400">
                R$ {conversionStats.receitaPendente.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </strong>
            </div>
          </div>

          {/* Estágio 2: Em Negociação */}
          <div
            className={`p-4 transition-colors ${
              stageFilter === "em_analise"
                ? "bg-blue-50/40 dark:bg-blue-950/20"
                : "hover:bg-slate-50/60 dark:hover:bg-slate-850/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400">
                  Estágio 02
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Em Negociação
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setStageFilter(stageFilter === "em_analise" ? "all" : "em_analise")}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer border ${
                  stageFilter === "em_analise"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900/60 hover:bg-blue-100"
                }`}
                title="Filtrar quadro Kanban para este estágio"
              >
                {stageFilter === "em_analise" ? "Foco Ativo ✕" : "Filtrar"}
              </button>
            </div>

            {/* Taxa de Rematrícula do Estágio 2 */}
            <div className="my-2 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                  {statsViewMode === "base"
                    ? `${conversionStats.shareEmAnalise.toFixed(1)}%`
                    : `${conversionStats.passThroughAnaliseToConcluido.toFixed(1)}%`}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans ml-1.5">
                  {statsViewMode === "base"
                    ? `da base (${conversionStats.emAnalise} alunos)`
                    : `fechamento de propostas`}
                </span>
              </div>
            </div>

            {/* Barra Linear de Conversão */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    statsViewMode === "base"
                      ? conversionStats.shareEmAnalise
                      : conversionStats.passThroughAnaliseToConcluido
                  )}%`
                }}
              />
            </div>

            {/* Detalhes operacionais e ticket */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2 font-mono">
              <span>Propostas em aberto:</span>
              <strong className="text-blue-700 dark:text-blue-400">
                R$ {conversionStats.receitaEmNegociacao.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </strong>
            </div>
          </div>

          {/* Estágio 3: Contrato Aceito */}
          <div
            className={`p-4 transition-colors ${
              stageFilter === "concluido"
                ? "bg-emerald-50/40 dark:bg-emerald-950/20"
                : "hover:bg-slate-50/60 dark:hover:bg-slate-850/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
                  Estágio 03 · Final
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Contrato Aceito
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setStageFilter(stageFilter === "concluido" ? "all" : "concluido")}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors cursor-pointer border ${
                  stageFilter === "concluido"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-100"
                }`}
                title="Filtrar quadro Kanban para este estágio"
              >
                {stageFilter === "concluido" ? "Foco Ativo ✕" : "Filtrar"}
              </button>
            </div>

            {/* Taxa de Rematrícula do Estágio 3 */}
            <div className="my-2 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {conversionStats.overallConversion.toFixed(1)}%
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans ml-1.5">
                  rematriculados ({conversionStats.concluidos}/{conversionStats.total})
                </span>
              </div>
            </div>

            {/* Barra Linear de Conversão */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, conversionStats.overallConversion)}%` }}
              />
            </div>

            {/* Detalhes operacionais e ticket */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2 font-mono">
              <span>Receita assegurada:</span>
              <strong className="text-emerald-700 dark:text-emerald-400">
                R$ {conversionStats.receitaGarantida.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </strong>
            </div>
          </div>
        </div>

        {/* Faixa Operacional de Diagnóstico e Ação de Gargalo */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-sans text-[11px]">
              <strong>Diagnóstico do Funil:</strong> {conversionStats.bottleneckReason}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {stageFilter !== "all" ? (
              <button
                type="button"
                onClick={() => setStageFilter("all")}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Limpar filtro de estágio (ver todos os {conversionStats.total})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStageFilter(conversionStats.bottleneckStage)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
              >
                <span>Focar no gargalo ({conversionStats.bottleneckStage === "pendente" ? "Pendentes" : conversionStats.bottleneckStage === "em_analise" ? "Negociação" : "Aceitos"})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Search, Filter & Quick Metrics Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por estudante, responsável, turma ou telefone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Grade Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedGradeFilter}
            onChange={(e) => setSelectedGradeFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Todas as Turmas ({estudantes.length})</option>
            {uniqueGrades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        {/* Counter Pills Bar */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono border-l border-slate-200 dark:border-slate-800 pl-3">
          <button
            type="button"
            onClick={() => setStageFilter(stageFilter === "pendente" ? "all" : "pendente")}
            className={`cursor-pointer transition-all ${
              stageFilter === "pendente" ? "font-bold underline text-amber-700 dark:text-amber-300" : "text-amber-600 dark:text-amber-400 hover:opacity-80"
            }`}
            title="Clique para alternar o foco em Pendentes"
          >
            Pendentes: <strong>{conversionStats.pendentes}</strong> ({conversionStats.sharePendente.toFixed(0)}%)
          </button>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <button
            type="button"
            onClick={() => setStageFilter(stageFilter === "em_analise" ? "all" : "em_analise")}
            className={`cursor-pointer transition-all ${
              stageFilter === "em_analise" ? "font-bold underline text-blue-700 dark:text-blue-300" : "text-blue-600 dark:text-blue-400 hover:opacity-80"
            }`}
            title="Clique para alternar o foco em Negociação"
          >
            Negociação: <strong>{conversionStats.emAnalise}</strong> ({conversionStats.shareEmAnalise.toFixed(0)}%)
          </button>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <button
            type="button"
            onClick={() => setStageFilter(stageFilter === "concluido" ? "all" : "concluido")}
            className={`cursor-pointer transition-all ${
              stageFilter === "concluido" ? "font-bold underline text-emerald-700 dark:text-emerald-300" : "text-emerald-600 dark:text-emerald-400 hover:opacity-80"
            }`}
            title="Clique para alternar o foco em Aceitos"
          >
            Aceitos: <strong>{conversionStats.concluidos}</strong> ({conversionStats.overallConversion.toFixed(0)}%)
          </button>
        </div>
      </div>

      {/* 4. The 3 Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 items-start">
        {COLUMNS.map((column) => {
          const columnStudents = studentsByStage[column.id] || [];
          const isOver = dragOverColumn === column.id;
          const isFocusedStage = stageFilter === column.id;
          const isDimmed = stageFilter !== "all" && stageFilter !== column.id;
          const Icon = column.icon;

          return (
            <motion.div
              key={column.id}
              onDragOver={(e) => handleDragOverColumn(e, column.id)}
              onDragLeave={(e) => handleDragLeaveColumn(e, column.id)}
              onDrop={(e) => handleDropOnColumn(e, column.id)}
              animate={{
                scale: isOver ? 1.015 : 1
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`rounded-2xl border transition-all duration-200 flex flex-col min-h-[520px] ${
                column.borderColor
              } ${
                isOver
                  ? `${column.dropBg} ${column.hoverBorder} ring-2 ring-indigo-400/50 shadow-md`
                  : isFocusedStage
                  ? "bg-white dark:bg-slate-900 ring-2 ring-indigo-500/80 dark:ring-indigo-400/80 shadow-xs"
                  : isDimmed
                  ? "bg-slate-50/40 dark:bg-slate-900/40 opacity-70 hover:opacity-100"
                  : "bg-slate-50/60 dark:bg-slate-900/60"
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${column.badgeColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className={`text-xs font-bold uppercase tracking-wider font-sans ${column.headerColor}`}>
                        {column.title}
                      </h3>
                      {isFocusedStage && (
                        <span className="text-[9px] font-mono font-bold uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 px-1.5 py-0.2 rounded">
                          Foco Ativo
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-sans block leading-tight font-medium">
                      {column.subtitle}
                    </span>
                  </div>
                </div>

                {/* Count badge */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${column.badgeColor}`}
                  >
                    {columnStudents.length}
                  </span>
                </div>
              </div>

              {/* Cards Container with Animated Drop Indicator */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[680px]">
                {/* Visual Drop Slot Indicator during drag over */}
                <AnimatePresence>
                  {isOver && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: "auto", scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className={`border-2 border-dashed ${column.hoverBorder} ${column.dropBg} rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-inner`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                      <span>Solte o estudante para mover para {column.title}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {columnStudents.length === 0 ? (
                  <div
                    className={`h-36 rounded-xl border border-dashed flex flex-col items-center justify-center text-center p-4 transition-colors ${
                      isOver
                        ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300"
                        : "border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-1.5 opacity-70" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {isDimmed ? "Estágio com foco desativado" : "Nenhum estudante nesta etapa"}
                    </span>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                      {isDimmed ? (
                        <button
                          type="button"
                          onClick={() => setStageFilter(column.id)}
                          className="text-indigo-600 dark:text-indigo-400 underline font-semibold cursor-pointer"
                        >
                          Focar nesta etapa ou ver todas
                        </button>
                      ) : (
                        "Arraste um cartão para cá"
                      )}
                    </span>
                  </div>
                ) : (
                  columnStudents.map((student) => {
                    const isBeingDragged = draggedStudentId === student.id;
                    const isJustMoved = recentlyMovedStudentId === student.id;

                    // Glow border & background effect depending on move status
                    let cardBorderGlow = "border-slate-200 dark:border-slate-750 hover:border-slate-400 dark:hover:border-slate-600";
                    if (isJustMoved) {
                      if (recentlyMovedStage === "concluido") {
                        cardBorderGlow = "ring-2 ring-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/25 bg-emerald-50/30 dark:bg-emerald-950/30";
                      } else if (recentlyMovedStage === "em_analise") {
                        cardBorderGlow = "ring-2 ring-blue-500 border-blue-500 shadow-lg shadow-blue-500/25 bg-blue-50/30 dark:bg-blue-950/30";
                      } else {
                        cardBorderGlow = "ring-2 ring-amber-500 border-amber-500 shadow-lg shadow-amber-500/25 bg-amber-50/30 dark:bg-amber-950/30";
                      }
                    } else if (isBeingDragged) {
                      cardBorderGlow = "border-dashed border-indigo-500 ring-2 ring-indigo-400/60 shadow-xl shadow-indigo-500/25 opacity-60";
                    }

                    return (
                      <motion.div
                        layout="position"
                        key={student.id}
                        id={`kanban-card-${student.id}`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, student.id)}
                        onDragEnd={handleDragEnd}
                        whileHover={
                          !isBeingDragged
                            ? {
                                y: -3,
                                scale: 1.018,
                                transition: { type: "spring", stiffness: 400, damping: 22 }
                              }
                            : {}
                        }
                        whileTap={{ scale: 0.97 }}
                        animate={
                          isJustMoved
                            ? {
                                scale: [1, 1.045, 1],
                                transition: { type: "spring", stiffness: 450, damping: 16 }
                              }
                            : isBeingDragged
                            ? {
                                scale: 0.95,
                                rotate: -1,
                                transition: { duration: 0.15 }
                              }
                            : {
                                scale: 1,
                                rotate: 0,
                                transition: { type: "spring", stiffness: 350, damping: 25 }
                              }
                        }
                        className={`group bg-white dark:bg-slate-850 rounded-xl p-3.5 border shadow-2xs hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing relative select-none ${cardBorderGlow}`}
                      >
                        {/* Status Updated Floating Pill */}
                        <AnimatePresence>
                          {isJustMoved && (
                            <motion.div
                              initial={{ opacity: 0, y: -8, scale: 0.85 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.85 }}
                              transition={{ duration: 0.2 }}
                              className={`absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shadow-xs flex items-center gap-1 z-10 ${
                                recentlyMovedStage === "concluido"
                                  ? "bg-emerald-600 text-white"
                                  : recentlyMovedStage === "em_analise"
                                  ? "bg-blue-600 text-white"
                                  : "bg-amber-500 text-slate-950"
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Etapa Atualizada</span>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Drag Handle & Top Row */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                              <img
                                src={
                                  student.avatar ||
                                  `https://api.dicebear.com/7.x/bottts/svg?seed=${student.id}`
                                }
                                alt={student.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-950 dark:text-white truncate font-sans">
                                {student.name}
                              </h4>
                              <span className="text-[10px] text-slate-700 dark:text-slate-300 font-sans block truncate font-medium">
                                {student.grade}
                              </span>
                            </div>
                          </div>

                          <div className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                            <GripVertical className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Responsible and Contact metadata */}
                        <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-0.5 border-t border-slate-100 dark:border-slate-800 pt-2 mb-2.5 font-sans">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Responsável:</span>
                            <strong className="text-slate-900 dark:text-slate-100 truncate max-w-[130px] font-bold">
                              {student.parentName || "Não cadastrado"}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Contato:</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                              {student.parentPhone || "(11) 98888-1234"}
                            </span>
                          </div>
                        </div>

                        {/* Actions Row: Quick WhatsApp & Stage Direction Controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                          {/* WhatsApp button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenQuickMessage(student);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2 py-1 rounded-md transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800/60"
                            title="Disparar mensagem no WhatsApp do responsável"
                          >
                            <Smartphone className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </button>

                          {/* Quick Arrow Movers (Accessibility fallback for touch/keyboard) */}
                          <div className="flex items-center gap-1">
                            {column.id !== "pendente" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const prevStage =
                                    column.id === "concluido" ? "em_analise" : "pendente";
                                  handleMoveStage(student.id, prevStage);
                                }}
                                className="p-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Mover para a etapa anterior"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}

                            {column.id !== "concluido" && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStage =
                                    column.id === "pendente" ? "em_analise" : "concluido";
                                  handleMoveStage(student.id, nextStage);
                                }}
                                className="p-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Avançar para a próxima etapa"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 4. Quick WhatsApp Messenger Modal */}
      {quickMsgStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                    Enviar WhatsApp para {quickMsgStudent.parentName || "Responsável"}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Estudante: {quickMsgStudent.name} ({quickMsgStudent.grade})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickMsgStudent(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Mensagem Personalizada:
              </label>
              <textarea
                value={quickMsgText}
                onChange={(e) => setQuickMsgText(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickMsgStudent(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendQuickMessage}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Disparar Mensagem</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
