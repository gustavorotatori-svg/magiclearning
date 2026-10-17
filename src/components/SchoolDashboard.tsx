import React, { useState, useMemo, useCallback, useEffect, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SearchBar } from "./SearchBar";
import { SearchTarget } from "./GlobalSearchModal";
import { PipelineProgressSeal } from "./PipelineProgressSeal";
import { ComunicadosList } from "./ComunicadosList";
import { MomentosList } from "./MomentosList";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  GraduationCap,
  Users,
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  PieChart as PieChartIcon,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Car,
  Clock,
  ShieldCheck,
  ShieldAlert,
  FolderArchive,
  FileText,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Search,
  Layers,
  Send,
  Activity,
  FileSpreadsheet,
  ExternalLink,
  MessageSquare,
  BarChart3,
  Building2,
  SlidersHorizontal,
  Smartphone,
  Server,
  Database,
  Cpu,
  Bell,
  Camera
} from "lucide-react";
import { Estudante, Comunicado, Cobranca, Momento } from "../types";
import { generateBulkExportZip } from "../utils/bulkExport";
import { RecommendationEngineWidget } from "./RecommendationEngineWidget";
import { MonthlyFinancialReportModal } from "./MonthlyFinancialReportModal";
import { ErpMonthlyDelinquencyChart } from "./ErpMonthlyDelinquencyChart";
import { trackUserActivity } from "../services/recommendationEngine";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  AreaChart,
  Area
} from "recharts";

interface SchoolDashboardProps {
  estudantes: Estudante[];
  comunicados: Comunicado[];
  momentos?: Momento[];
  cobrancas: Cobranca[];
  onNavigateToTab: (tab: "agenda" | "retiradas" | "comunicados" | "erp" | "alunos" | "metricas" | "planejador" | "premium_hub" | "benchmarking" | "moderacao") => void;
  onNavigateToRematricula?: () => void;
  onNavigateToFunnelStats?: () => void;
  lastPipelineTransition?: {
    studentName: string;
    stageTo: string;
    timestamp: string;
  } | null;
  masteryThreshold?: number;
  erpSyncStatus?: "disconnected" | "sync_testing" | "connected";
  erpLastSyncTime?: string;
  onTriggerSync?: () => void;
  schoolName?: string;
  onSelectSearchResult?: (target: SearchTarget) => void;
  onOpenFullSearch?: () => void;
  pendingReportsCount?: number;
}

export const SchoolDashboard = memo(function SchoolDashboard({
  estudantes,
  comunicados,
  momentos = [],
  cobrancas,
  onNavigateToTab,
  onNavigateToRematricula,
  onNavigateToFunnelStats,
  lastPipelineTransition,
  masteryThreshold = 7.5,
  erpSyncStatus = "connected",
  erpLastSyncTime = "Hoje às 08:30",
  onTriggerSync,
  schoolName = "Colégio Integração",
  onSelectSearchResult,
  onOpenFullSearch,
  pendingReportsCount = 0
}: SchoolDashboardProps) {
  // Navigation & View Toggles
  const [activeView, setActiveView] = useState<"visao_geral" | "financeiro" | "pedagogico" | "operacao">("visao_geral");
  const [financialChartView, setFinancialChartView] = useState<"fluxo" | "inadimplencia" | "metodos">("fluxo");
  const [isFinancialReportModalOpen, setIsFinancialReportModalOpen] = useState(false);
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<string>("todos");
  const [pedagogicalSearchQuery, setPedagogicalSearchQuery] = useState("");
  const [financialSearchQuery, setFinancialSearchQuery] = useState("");

  // Memoized handlers for list interactions to prevent re-renders
  const handleSelectComunicado = useCallback((_item: Comunicado) => {
    onNavigateToTab("comunicados");
  }, [onNavigateToTab]);

  const handleSelectMomento = useCallback((_item: Momento) => {
    onNavigateToTab("agenda");
  }, [onNavigateToTab]);

  const handleCycleFilterChange = useCallback((cycleId: string) => {
    setSelectedCycleFilter(cycleId);
  }, []);

  const handlePedagogicalSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPedagogicalSearchQuery(e.target.value);
  }, []);

  const handleFinancialSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFinancialSearchQuery(e.target.value);
  }, []);

  // Sync and Export States
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBulkExporting, setIsBulkExporting] = useState(false);
  const [bulkExportProgress, setBulkExportProgress] = useState({ current: 0, total: 0, currentName: "" });
  const [toastMsg, setToastMsg] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // Memoized action handlers
  const handleScheduleTutoria = useCallback((studentName: string) => {
    setToastMsg({
      message: `Agendada reunião de tutoria e reforço para o aluno ${studentName}.`,
      type: "success"
    });
  }, []);

  const handleSendPixReminder = useCallback((parentName: string) => {
    setToastMsg({
      message: `Lembrete via WhatsApp disparado com sucesso para ${parentName}!`,
      type: "success"
    });
  }, []);

  // Currency Formatter
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }, []);

  // --- Financial Calculations & Monthly Evolution ---
  const monthlyFinancialData = useMemo(() => {
    const monthsMap: { [key: string]: { label: string; total: number; pago: number; pendente: number; vencido: number; percent: number; sortKey: string; crmRate: number } } = {};

    cobrancas.forEach((cob) => {
      if (!cob.dueDate) return;
      const parts = cob.dueDate.split("/");
      if (parts.length < 3) return;
      const month = parts[1];
      const year = parts[2];
      
      const sortKey = `${year}-${month}`;
      const monthNames = [
        "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
        "Jul", "Ago", "Set", "Out", "Nov", "Dez"
      ];
      const monthIndex = parseInt(month, 10) - 1;
      const monthLabel = monthNames[monthIndex] || `Mês ${month}`;
      const label = `${monthLabel}/${year.substring(2)}`;

      if (!monthsMap[sortKey]) {
        monthsMap[sortKey] = {
          label,
          total: 0,
          pago: 0,
          pendente: 0,
          vencido: 0,
          percent: 0,
          sortKey,
          crmRate: 92.5
        };
      }

      const amount = cob.amount || 0;
      monthsMap[sortKey].total += amount;
      if (cob.status === "pago") {
        monthsMap[sortKey].pago += amount;
      } else if (cob.status === "vencido") {
        monthsMap[sortKey].vencido += amount;
      } else if (cob.status === "pendente") {
        monthsMap[sortKey].pendente += amount;
      }
    });

    const list = Object.values(monthsMap);

    // High-density institutional baseline data
    if (list.length < 6) {
      const baseMonths = [
        { label: "Jan/26", total: 432000, pago: 419000, pendente: 0, vencido: 13000, percent: 3.0, sortKey: "2026-01", crmRate: 96.2 },
        { label: "Fev/26", total: 440000, pago: 426800, pendente: 0, vencido: 13200, percent: 3.0, sortKey: "2026-02", crmRate: 95.8 },
        { label: "Mar/26", total: 448000, pago: 432000, pendente: 4200, vencido: 11800, percent: 2.6, sortKey: "2026-03", crmRate: 97.4 },
        { label: "Abr/26", total: 452000, pago: 434500, pendente: 6500, vencido: 11000, percent: 2.4, sortKey: "2026-04", crmRate: 98.1 },
        { label: "Mai/26", total: 455000, pago: 436000, pendente: 8200, vencido: 10800, percent: 2.3, sortKey: "2026-05", crmRate: 97.9 },
        { label: "Jun/26", total: 458500, pago: 418200, pendente: 22800, vencido: 17500, percent: 3.8, sortKey: "2026-06", crmRate: 94.8 },
      ];

      baseMonths.forEach((bm) => {
        const foundIndex = list.findIndex(l => l.label.toLowerCase() === bm.label.toLowerCase());
        if (foundIndex === -1) {
          list.push(bm);
        }
      });
    }

    return list
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(m => {
        m.percent = m.total > 0 ? parseFloat(((m.vencido / m.total) * 100).toFixed(1)) : 0;
        return m;
      });
  }, [cobrancas]);

  // Payment Method Breakdown Data
  const paymentMethodsData = [
    { name: "Pix Automático / Dinâmico", value: 48, amount: 220080, color: "#10b981", code: "PIX-RECORRENTE" },
    { name: "Boleto Bancário Registrado", value: 34, amount: 155890, color: "#3b82f6", code: "CNAB-240" },
    { name: "Cartão de Crédito Recorrente", value: 14, amount: 64190, color: "#6366f1", code: "GATEWAY-REC" },
    { name: "TEF / Transferência Direta", value: 4, amount: 18340, color: "#94a3b8", code: "TED-PIX" }
  ];

  // Inadimplência Aging Matrix Data
  const agingDelinquencyData = [
    {
      faixa: "1 a 15 dias",
      description: "Cobrança amigável com link Pix no WhatsApp",
      invoicesCount: 8,
      totalAmount: 9450,
      action: "Régua Preventiva WhatsApp",
      statusBadge: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
    },
    {
      faixa: "16 a 30 dias",
      description: "Aviso formal de secretaria e reemissão de 2ª via",
      invoicesCount: 4,
      totalAmount: 4850,
      action: "Notificação Administrativa",
      statusBadge: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900"
    },
    {
      faixa: "31 a 60 dias",
      description: "Proposta de acordo e parcelamento sem juros",
      invoicesCount: 2,
      totalAmount: 3200,
      action: "Renegociação Direta",
      statusBadge: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
    }
  ];

  // Specific Delinquent Accounts List for Instant Manager Follow-up
  const delinquentAccounts = [
    {
      id: "del-1",
      studentName: "Lucas Mendonça Silva",
      grade: "5º Ano Ensino Fundamental B",
      parentName: "Roberto Mendonça",
      parentPhone: "(11) 98721-3344",
      amount: 1250,
      daysLate: 12,
      dueDate: "25/05/2026",
      status: "WhatsApp Enviado (Lido)"
    },
    {
      id: "del-2",
      studentName: "Beatriz Nogueira Duarte",
      grade: "1º Ano Ensino Fundamental A",
      parentName: "Camila Nogueira",
      parentPhone: "(11) 99342-8811",
      amount: 1100,
      daysLate: 24,
      dueDate: "10/05/2026",
      status: "Aguardando Confirmação Pix"
    },
    {
      id: "del-3",
      studentName: "Gabriel Ferreira Costa",
      grade: "9º Ano Ensino Fundamental A",
      parentName: "Marcos Ferreira",
      parentPhone: "(11) 97412-9090",
      amount: 1450,
      daysLate: 35,
      dueDate: "05/05/2026",
      status: "Proposta de Renegociação Enviada"
    },
    {
      id: "del-4",
      studentName: "Helena Carvalho Viana",
      grade: "3º Ano Ensino Médio",
      parentName: "Renata Carvalho",
      parentPhone: "(11) 98112-4455",
      amount: 1650,
      daysLate: 8,
      dueDate: "28/05/2026",
      status: "Lembrete 1 Disparado"
    }
  ];

  // --- Academic & Pedagogical Performance Matrix ---
  const classPerformanceGrid = [
    {
      id: "infantil-5",
      name: "Infantil V - Turma A",
      segment: "Educação Infantil",
      studentsCount: 22,
      bimester1: 9.1,
      bimester2: 9.3,
      currentAverage: 9.2,
      passRate: 100,
      attendanceRate: 98.4,
      alertCount: 0,
      status: "Consolidado"
    },
    {
      id: "fund1-1a",
      name: "1º Ano Fundamental - Turma A",
      segment: "Ensino Fundamental I",
      studentsCount: 26,
      bimester1: 8.4,
      bimester2: 8.7,
      currentAverage: 8.55,
      passRate: 96.2,
      attendanceRate: 97.5,
      alertCount: 1,
      status: "Estável"
    },
    {
      id: "fund1-3b",
      name: "3º Ano Fundamental - Turma B",
      segment: "Ensino Fundamental I",
      studentsCount: 28,
      bimester1: 8.1,
      bimester2: 8.4,
      currentAverage: 8.25,
      passRate: 92.8,
      attendanceRate: 96.8,
      alertCount: 2,
      status: "Estável"
    },
    {
      id: "fund1-5a",
      name: "5º Ano Fundamental - Turma A",
      segment: "Ensino Fundamental I",
      studentsCount: 30,
      bimester1: 7.8,
      bimester2: 8.2,
      currentAverage: 8.0,
      passRate: 93.3,
      attendanceRate: 96.1,
      alertCount: 2,
      status: "Estável"
    },
    {
      id: "fund2-7a",
      name: "7º Ano Fundamental - Turma A",
      segment: "Ensino Fundamental II",
      studentsCount: 32,
      bimester1: 7.4,
      bimester2: 7.8,
      currentAverage: 7.6,
      passRate: 87.5,
      attendanceRate: 95.2,
      alertCount: 4,
      status: "Atenção Pedagógica"
    },
    {
      id: "fund2-9a",
      name: "9º Ano Fundamental - Turma A",
      segment: "Ensino Fundamental II",
      studentsCount: 31,
      bimester1: 7.2,
      bimester2: 7.6,
      currentAverage: 7.4,
      passRate: 85.0,
      attendanceRate: 94.8,
      alertCount: 5,
      status: "Atenção Pedagógica"
    },
    {
      id: "medio-1a",
      name: "1º Ano Ensino Médio - Turma A",
      segment: "Ensino Médio",
      studentsCount: 34,
      bimester1: 7.6,
      bimester2: 8.0,
      currentAverage: 7.8,
      passRate: 91.2,
      attendanceRate: 96.5,
      alertCount: 3,
      status: "Estável"
    },
    {
      id: "medio-3a",
      name: "3º Ano Ensino Médio - Turma A",
      segment: "Ensino Médio",
      studentsCount: 35,
      bimester1: 7.9,
      bimester2: 8.3,
      currentAverage: 8.1,
      passRate: 94.3,
      attendanceRate: 97.2,
      alertCount: 2,
      status: "Consolidado"
    }
  ];

  // Subject Averages Matrix for Recharts
  const subjectAveragesData = [
    { subject: "Matemática", average: 7.6, target: masteryThreshold, passRate: 88.5 },
    { subject: "Português", average: 8.3, target: masteryThreshold, passRate: 94.2 },
    { subject: "Ciências / Biologia", average: 8.1, target: masteryThreshold, passRate: 92.0 },
    { subject: "História", average: 8.0, target: masteryThreshold, passRate: 91.5 },
    { subject: "Geografia", average: 7.9, target: masteryThreshold, passRate: 90.2 },
    { subject: "Inglês", average: 8.5, target: masteryThreshold, passRate: 96.0 },
    { subject: "Redação", average: 8.4, target: masteryThreshold, passRate: 93.8 }
  ];

  // Critical Students Pedagogical Alert Table (Below Threshold)
  const criticalPedagogicalStudents = useMemo(() => {
    return estudantes.map(est => {
      const gradesCount = est.grades?.length || 0;
      const avg = gradesCount > 0
        ? est.grades.reduce((acc, g) => acc + (g.firstBimester + g.secondBimester) / 2, 0) / gradesCount
        : 7.0;
      const lowSubjects = est.grades?.filter(g => (g.firstBimester + g.secondBimester) / 2 < masteryThreshold).map(g => g.subject) || [];
      return {
        id: est.id,
        name: est.name,
        grade: est.grade,
        average: parseFloat(avg.toFixed(2)),
        lowSubjects,
        parentName: est.parentName || "Responsável",
        parentPhone: est.parentPhone || "(11) 98888-0000",
        actionPlan: lowSubjects.length > 0 ? "Tutoria / Recuperação Paralela" : "Acompanhamento Regular"
      };
    }).filter(e => e.average < masteryThreshold || e.lowSubjects.length > 0);
  }, [estudantes, masteryThreshold]);

  // Operational Pick-up and Routine Summary
  const operationalStats = {
    totalStudents: estudantes.length || 450,
    dailyAttendancePercent: 97.4,
    gateMedianTimeMin: 2.1,
    peakHourVehicles: 312,
    rematriculaConfirmedPercent: 78.4,
    rematriculaCount: 353
  };

  // Trigger ERP Sync Action
  const handleSyncERP = () => {
    setIsSyncing(true);
    if (onTriggerSync) {
      onTriggerSync();
    }
    setTimeout(() => {
      setIsSyncing(false);
      setToastMsg({
        message: "Sincronização com o ERP concluída com sucesso! Tabelas acadêmicas e financeiras conciliadas.",
        type: "success"
      });
    }, 1200);
  };

  // Trigger Bulk Export
  const handleTriggerBulkExport = async () => {
    if (estudantes.length === 0) return;
    try {
      setIsBulkExporting(true);
      setBulkExportProgress({ current: 0, total: estudantes.length, currentName: "Iniciando compilação..." });

      const zipBlob = await generateBulkExportZip(
        estudantes,
        schoolName,
        (current, total, currentName) => {
          setBulkExportProgress({ current, total, currentName });
        }
      );

      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio_executivo_gestao_${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setToastMsg({
        message: "Exportação em lote gerada com sucesso! Arquivo ZIP baixado.",
        type: "success"
      });
    } catch (error) {
      setToastMsg({
        message: "Erro ao compilar relatórios em lote.",
        type: "error"
      });
    } finally {
      setIsBulkExporting(false);
    }
  };

  // Filtered Class Grid based on Cycle Selection
  const filteredClassGrid = useMemo(() => {
    return classPerformanceGrid.filter(item => {
      const matchesCycle = selectedCycleFilter === "todos" || item.segment === selectedCycleFilter;
      const matchesSearch = item.name.toLowerCase().includes(pedagogicalSearchQuery.toLowerCase());
      return matchesCycle && matchesSearch;
    });
  }, [selectedCycleFilter, pedagogicalSearchQuery]);

  // Filtered Delinquent Accounts
  const filteredDelinquentAccounts = useMemo(() => {
    return delinquentAccounts.filter(acc => {
      return (
        acc.studentName.toLowerCase().includes(financialSearchQuery.toLowerCase()) ||
        acc.parentName.toLowerCase().includes(financialSearchQuery.toLowerCase()) ||
        acc.grade.toLowerCase().includes(financialSearchQuery.toLowerCase())
      );
    });
  }, [financialSearchQuery]);

  return (
    <div className="space-y-6" id="school-manager-dashboard">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div
          role="alert"
          className={`fixed bottom-5 right-5 z-50 max-w-md p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all ${
            toastMsg.type === "success"
              ? "bg-slate-900 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900"
              : "bg-rose-900 text-white border-rose-800"
          }`}
        >
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold leading-relaxed font-sans">{toastMsg.message}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HEADER & CONTROL BAR */}
      {/* ========================================================================= */}
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded">
                Painel do Gestor Escolar
              </span>
              <button
                type="button"
                onClick={() => onNavigateToTab("erp")}
                title="Acessar Central de Integração ERP & Webhooks"
                className="text-[10px] font-mono text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${erpSyncStatus === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span>ERP: {erpSyncStatus === "connected" ? "Conciliado" : "Pendente"} ({erpLastSyncTime})</span>
                <span className="text-[9px] text-slate-400 font-sans">↗</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateToTab("moderacao")}
                title="Acessar Central de Moderação de Conteúdo"
                className={`text-[10px] font-mono px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                  pendingReportsCount > 0
                    ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 hover:bg-amber-100"
                    : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 hover:border-amber-300"
                }`}
              >
                <ShieldAlert className={`w-3.5 h-3.5 ${pendingReportsCount > 0 ? "text-amber-600 dark:text-amber-400 animate-pulse" : "text-slate-400"}`} />
                <span>Moderação: {pendingReportsCount > 0 ? `${pendingReportsCount} pendente(s)` : "Em dia"}</span>
                <span className="text-[9px] text-slate-400 font-sans">↗</span>
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-slate-50 tracking-tight">
              {schoolName} • <span className="font-sans text-lg font-semibold text-slate-500 dark:text-slate-400">Diretoria Executiva</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                450 Alunos Ativos
              </span>
              <span>•</span>
              <span>Exercício 2026</span>
              <span>•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">94.8% Ocupação</span>
            </div>
          </div>

          {/* Quick Global Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              id="btn-sync-erp-executive"
              onClick={handleSyncERP}
              disabled={isSyncing}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Conciliando..." : "Sincronizar ERP"}</span>
            </button>

            <button
              id="btn-export-bulk-reports"
              onClick={handleTriggerBulkExport}
              disabled={isBulkExporting || estudantes.length === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBulkExporting ? `Exportando (${bulkExportProgress.current}/${bulkExportProgress.total})` : "Exportar Relatórios"}</span>
            </button>
          </div>
        </div>

        {/* Sub-view Navigation Filter Strip */}
        <nav aria-label="Abas do Gestor" className="flex items-center gap-1.5 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
          <button
            id="tab-view-geral"
            onClick={() => setActiveView("visao_geral")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeView === "visao_geral"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Visão Geral
          </button>

          <button
            id="tab-view-financeiro"
            onClick={() => setActiveView("financeiro")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeView === "financeiro"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Financeiro</span>
          </button>

          <button
            id="tab-view-pedagogico"
            onClick={() => setActiveView("pedagogico")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeView === "pedagogico"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Pedagógico</span>
          </button>

          <button
            id="tab-view-operacao"
            onClick={() => setActiveView("operacao")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeView === "operacao"
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Operação & Portaria</span>
          </button>
        </nav>
      </header>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE 6-CARD HIGH-DENSITY KPI STRIP WITH VISUAL PROGRESS */}
      {/* ========================================================================= */}
      <section aria-label="Indicadores Principais" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* KPI 1: Matrículas e Ocupação */}
        <div 
          onClick={onNavigateToFunnelStats || onNavigateToRematricula}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
          title="Ver Estatísticas de Conversão do Funil de Rematrícula"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">Alunos Ativos</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">450</span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">94.8%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "94.8%" }} />
          </div>
          <p className="text-[11px] text-slate-500 font-sans">353 rematrículas confirmadas</p>
        </div>

        {/* KPI 2: Faturamento Previsto */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">Faturamento Previsto</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">R$ 458.500</span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">+3.2%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "96%" }} />
          </div>
          <p className="text-[11px] text-slate-500 font-sans">Competência Junho/2026</p>
        </div>

        {/* KPI 3: Arrecadação Liquidada */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">Valor Liquidado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">R$ 418.200</span>
            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">91.2%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: "91.2%" }} />
          </div>
          <p className="text-[11px] text-slate-500 font-sans">Meta de arrecadação batida</p>
        </div>

        {/* KPI 4: Inadimplência Consolidada */}
        <div 
          onClick={() => {
            setActiveView("financeiro");
            setFinancialChartView("inadimplencia");
            document.getElementById("erp-delinquency-visual-module")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2 cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
          title="Ver Histórico de Inadimplência Mensal do ERP"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">Inadimplência ERP</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">3.8%</span>
            <span className="text-[10px] font-mono text-amber-600 font-semibold">Teto: 3.0%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: "63%" }} />
          </div>
          <p className="text-[11px] text-slate-500 font-sans">14 faturas em acompanhamento</p>
        </div>

        {/* KPI 5: Média Pedagógica Institucional */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">Média Escolar</span>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">8.15</span>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">/ 10.0</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: "81.5%" }} />
          </div>
          <p className="text-[11px] text-slate-500 font-sans">94.6% taxa de aprovação</p>
        </div>

        {/* KPI 6: Eficiência Portaria e Presença */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">Fila Portaria</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">2.1 min</span>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold">ágil</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: "95%" }} />
          </div>
          <p className="text-[11px] text-slate-500 font-sans">97.4% frequência registrada</p>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 2.1 PAINEL VISUAL DE DECISÃO RÁPIDA (STUDENTS ACTION CARDS) */}
      {/* ========================================================================= */}
      <section aria-label="Painel de Decisão Rápida" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider font-sans text-slate-900 dark:text-slate-100">
              Painel Visual de Acompanhamento Rápido
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Ações Diretas sem Textos Longos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {estudantes.slice(0, 4).map((est, idx) => {
            const isLate = idx === 1;
            const isAlert = idx === 2;
            return (
              <div
                key={est.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={est.avatar || "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&q=80&w=150"}
                      alt={est.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                      isLate ? "bg-rose-500" : isAlert ? "bg-amber-500" : "bg-emerald-500"
                    }`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {est.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 block truncate">
                      {est.grade}
                    </span>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                      isLate
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                        : isAlert
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                    }`}>
                      {isLate ? "Fatura em Aberto" : isAlert ? "Recuperação Paralela" : "100% Em Dia"}
                    </span>
                  </div>
                </div>

                {/* 1-Click Visual Action Buttons */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleSendPixReminder(est.parentName || "Responsável")}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold transition-colors cursor-pointer text-center"
                    title="Disparar lembrete via WhatsApp"
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScheduleTutoria(est.name)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-[10px] font-semibold transition-colors cursor-pointer text-center"
                    title="Ver boletim e desempenho"
                  >
                    Boletim
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 🧠 MOTOR DE RECOMENDAÇÕES EXECUTIVAS & PRÓXIMAS DECISÕES */}
      <RecommendationEngineWidget
        role="escola"
        estudantes={estudantes}
        cobrancas={cobrancas}
        comunicados={comunicados}
        momentos={momentos}
        onExecuteAction={(rec) => {
          if (rec.actionType === "navigate_tab" && rec.actionPayload?.tab) {
            onNavigateToTab(rec.actionPayload.tab as any);
            trackUserActivity({
              userId: "user-current",
              role: "escola",
              type: "custom_interaction",
              title: `Gestor seguiu recomendação: "${rec.title}"`,
              entityId: rec.id,
              entityTitle: rec.title,
            });
          }
        }}
        onToast={(msg, type) => setToastMsg({ message: msg, type: type === "error" ? "error" : "success" })}
      />

      {/* ========================================================================= */}
      {/* 3. SECTION: FINANCIAL PERFORMANCE & HIGH-DENSITY LEDGER */}
      {/* (Rendered when in 'visao_geral' or 'financeiro') */}
      {/* ========================================================================= */}
      {(activeView === "visao_geral" || activeView === "financeiro") && (
        <div className="space-y-6">
          {/* Componente Visual Dedicado: Histórico de Inadimplência Mensal via Recharts & ERP */}
          <ErpMonthlyDelinquencyChart
            cobrancas={cobrancas}
            erpSyncStatus={erpSyncStatus}
            erpLastSyncTime={erpLastSyncTime}
            onTriggerSync={onTriggerSync}
            onNavigateToErp={() => {
              localStorage.setItem("erp_active_subtab", "regua_cobranca");
              onNavigateToTab("erp");
            }}
            onNavigateToRematricula={onNavigateToRematricula}
            targetDelinquencyRate={3.0}
            schoolName={schoolName}
            onOpenReportModal={() => setIsFinancialReportModalOpen(true)}
          />

          <section aria-labelledby="heading-financeiro" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 id="heading-financeiro" className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
                Demonstrativo de Fluxo de Caixa & Inadimplência
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setFinancialChartView("fluxo")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    financialChartView === "fluxo"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Fluxo Mensal
                </button>
                <button
                  onClick={() => setFinancialChartView("inadimplencia")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    financialChartView === "inadimplencia"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Inadimplência ERP
                </button>
                <button
                  onClick={() => setFinancialChartView("metodos")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    financialChartView === "metodos"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Meios de Pagamento
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  id="btn-export-financial-report-school"
                  onClick={() => setIsFinancialReportModalOpen(true)}
                  className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Exportar Relatório Financeiro Mensal Consolidado em PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                  <span>Relatório PDF</span>
                </button>

                <button
                  type="button"
                  id="btn-link-regua-erp"
                  onClick={() => {
                    localStorage.setItem("erp_active_subtab", "regua_cobranca");
                    onNavigateToTab("erp");
                  }}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                >
                  Régua Auto →
                </button>

                <button
                  type="button"
                  id="btn-link-agendador-whatsapp"
                  onClick={() => {
                    localStorage.setItem("erp_active_subtab", "agendador");
                    onNavigateToTab("erp");
                  }}
                  className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Agendador WhatsApp (1-30d)</span>
                  <span className="text-[10px]">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Chart Area */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {financialChartView === "fluxo" ? (
                <BarChart data={monthlyFinancialData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} tickFormatter={(val) => `R$ ${val >= 1000 ? (val / 1000) + 'k' : val}`} />
                  <Tooltip
                    formatter={(value: any, name: string) => [formatCurrency(Number(value)), name]}
                    contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", color: "#fff", borderRadius: "8px", border: "none", fontSize: "11px" }}
                  />
                  <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: "11px", fontFamily: "sans-serif" }} />
                  <Bar name="Liquidado (Recebido)" dataKey="pago" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={32} />
                  <Bar name="Pendente (A Vencer)" dataKey="pendente" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={32} />
                  <Bar name="Inadimplente (Vencido)" dataKey="vencido" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={32} />
                </BarChart>
              ) : financialChartView === "inadimplencia" ? (
                <ComposedChart data={monthlyFinancialData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                  <YAxis yAxisId="left" domain={[0, 6]} tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} tickFormatter={(val) => `${val}%`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} tickFormatter={(val) => `R$ ${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      name.includes("%") ? `${Number(value).toFixed(1)}%` : formatCurrency(Number(value)),
                      name
                    ]}
                    contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", color: "#fff", borderRadius: "8px", border: "none", fontSize: "11px" }}
                  />
                  <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: "11px", fontFamily: "sans-serif" }} />
                  <ReferenceLine yAxisId="left" y={3.0} stroke="#64748b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Meta ERP (3.0%)", position: "insideTopRight", fill: "#64748b", fontSize: 10 }} />
                  <Bar yAxisId="right" name="Inadimplência Vencida (R$)" dataKey="vencido" fill="#fca5a5" radius={[3, 3, 0, 0]} maxBarSize={30} />
                  <Line yAxisId="left" type="monotone" name="Taxa de Inadimplência (%)" dataKey="percent" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4, fill: "#e11d48" }} activeDot={{ r: 6 }} />
                </ComposedChart>
              ) : (
                <BarChart data={paymentMethodsData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} tickFormatter={(val) => `${val}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#334155", fontSize: 11 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} width={180} />
                  <Tooltip
                    formatter={(value: any, name: string, props: any) => [`${value}% (${formatCurrency(props.payload.amount)})`, "Participação"]}
                    contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", color: "#fff", borderRadius: "8px", border: "none", fontSize: "11px" }}
                  />
                  <Bar dataKey="value" name="Percentual de Liquidação" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={24}>
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* High-Density Monthly Breakdown Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                Extrato Consolidado por Mês de Competência
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Exercício Fiscal 2026</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Competência</th>
                    <th className="py-2.5 px-3 text-right">Faturamento Bruto</th>
                    <th className="py-2.5 px-3 text-right">Arrecadação Liquidada</th>
                    <th className="py-2.5 px-3 text-right">Saldo a Vencer</th>
                    <th className="py-2.5 px-3 text-right">Inadimplência Vencida</th>
                    <th className="py-2.5 px-3 text-center">Taxa Inadimplência</th>
                    <th className="py-2.5 px-3 text-center">Eficácia CRM WhatsApp</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {monthlyFinancialData.map((month) => (
                    <tr key={month.sortKey} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100 font-sans">{month.label}</td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">{formatCurrency(month.total)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">{formatCurrency(month.pago)}</td>
                      <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400">{formatCurrency(month.pendente)}</td>
                      <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-semibold">{formatCurrency(month.vencido)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          month.percent <= 3.0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}>
                          {month.percent}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">{month.crmRate}%</td>
                      <td className="py-2.5 px-3 text-center font-sans text-[10px]">
                        <span className="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Conciliado</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aging Matrix and Delinquent Accounts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            {/* Left: Aging Distribution */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                Matriz de Aging de Cobrança
              </h3>
              <div className="space-y-2">
                {agingDelinquencyData.map((item) => (
                  <div key={item.faixa} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{item.faixa}</span>
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">{formatCurrency(item.totalAmount)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-sans leading-tight">{item.description}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-400 font-mono">{item.invoicesCount} títulos</span>
                      <span className={`px-2 py-0.5 rounded font-medium border ${item.statusBadge}`}>{item.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Specific Delinquent Accounts for Instant Manager Follow-up */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                  Faturas em Atraso para Acompanhamento
                </h3>
                <div className="relative w-full sm:w-48">
                  <input
                    type="text"
                    value={financialSearchQuery}
                    onChange={handleFinancialSearchChange}
                    placeholder="Filtrar aluno/responsável..."
                    className="w-full text-[11px] px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Estudante / Turma</th>
                      <th className="py-2 px-3">Responsável Financeiro</th>
                      <th className="py-2 px-2.5 text-right">Valor Devido</th>
                      <th className="py-2 px-2 text-center">Dias Atraso</th>
                      <th className="py-2 px-3 text-right">Ação CRM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                    {filteredDelinquentAccounts.map((acc) => (
                      <tr key={acc.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50">
                        <td className="py-2 px-3 font-sans">
                          <strong className="block text-slate-900 dark:text-slate-100 text-xs font-semibold">{acc.studentName}</strong>
                          <span className="text-[10px] text-slate-500">{acc.grade}</span>
                        </td>
                        <td className="py-2 px-3 font-sans">
                          <span className="block text-slate-800 dark:text-slate-200 text-[11px]">{acc.parentName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{acc.parentPhone}</span>
                        </td>
                        <td className="py-2 px-2.5 text-right font-bold text-rose-600 dark:text-rose-400">{formatCurrency(acc.amount)}</td>
                        <td className="py-2 px-2 text-center">
                          <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {acc.daysLate}d
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-sans">
                          <button
                            onClick={() => handleSendPixReminder(acc.parentName)}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2 py-1 rounded transition-colors cursor-pointer"
                          >
                            <Send className="w-2.5 h-2.5" />
                            <span>Cobrar Pix</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTION: PEDAGOGICAL PERFORMANCE & HIGH-DENSITY CLASS MATRIX */}
      {/* (Rendered when in 'visao_geral' or 'pedagogico') */}
      {/* ========================================================================= */}
      {(activeView === "visao_geral" || activeView === "pedagogico") && (
        <section aria-labelledby="heading-pedagogico" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 id="heading-pedagogico" className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
                Matriz de Desempenho Pedagógico & Saúde Acadêmica
              </h2>
            </div>

            {/* Segment Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "todos", label: "Todos os Segmentos" },
                { id: "Educação Infantil", label: "Infantil" },
                { id: "Ensino Fundamental I", label: "Fundamental I" },
                { id: "Ensino Fundamental II", label: "Fundamental II" },
                { id: "Ensino Médio", label: "Ensino Médio" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleCycleFilterChange(filter.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    selectedCycleFilter === filter.id
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Average Comparison Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectAveragesData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
                  <Tooltip
                    formatter={(value: any, name: string) => [`${value} / 10.0`, name]}
                    contentStyle={{ backgroundColor: "rgba(15, 23, 42, 0.95)", color: "#fff", borderRadius: "8px", border: "none", fontSize: "11px" }}
                  />
                  <Legend verticalAlign="top" height={28} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <ReferenceLine y={masteryThreshold} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: `Meta: ${masteryThreshold}`, fill: "#b45309", fontSize: 10, position: "top" }} />
                  <Bar name="Média Geral da Disciplina" dataKey="average" fill="#4f46e5" radius={[3, 3, 0, 0]} maxBarSize={36}>
                    {subjectAveragesData.map((entry, index) => (
                      <Cell key={`cell-subj-${index}`} fill={entry.average >= masteryThreshold ? "#4f46e5" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Academic Summary Card */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] font-sans">
                Resumo de Maestria & Metas
              </h3>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-sans">Meta Institucional:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">≥ {masteryThreshold.toFixed(1)} / 10.0</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-sans">Disciplina Destaque:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Inglês (8.5)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 font-sans">Ponto de Atenção:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Matemática (7.6)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-sans">Alunos em Recuperação:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{criticalPedagogicalStudents.length} alunos</span>
                </div>
              </div>
            </div>
          </div>

          {/* High-Density Class-by-Class Grid Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
                Consolidado por Turma & Segmento
              </h3>
              <div className="relative w-64">
                <input
                  type="text"
                  value={pedagogicalSearchQuery}
                  onChange={handlePedagogicalSearchChange}
                  placeholder="Buscar turma..."
                  className="w-full text-xs px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Turma / Série</th>
                    <th className="py-2.5 px-3">Segmento</th>
                    <th className="py-2.5 px-2 text-center">Alunos</th>
                    <th className="py-2.5 px-2 text-center">1º Bim</th>
                    <th className="py-2.5 px-2 text-center">2º Bim</th>
                    <th className="py-2.5 px-2 text-center">Média Atual</th>
                    <th className="py-2.5 px-2 text-center">Aprovação</th>
                    <th className="py-2.5 px-2 text-center">Presença</th>
                    <th className="py-2.5 px-2 text-center">Em Alerta</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {filteredClassGrid.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100 font-sans">{cls.name}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">{cls.segment}</td>
                      <td className="py-2.5 px-2 text-center text-slate-700 dark:text-slate-300">{cls.studentsCount}</td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{cls.bimester1.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{cls.bimester2.toFixed(1)}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-slate-900 dark:text-slate-100">{cls.currentAverage.toFixed(2)}</td>
                      <td className="py-2.5 px-2 text-center text-emerald-600 dark:text-emerald-400">{cls.passRate}%</td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{cls.attendanceRate}%</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          cls.alertCount === 0 ? "text-slate-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}>
                          {cls.alertCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          cls.status === "Consolidado"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : cls.status === "Estável"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        }`}>
                          {cls.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Intervention Table for Students Below Threshold */}
          {criticalPedagogicalStudents.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-sans flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Alunos em Acompanhamento & Recuperação Paralela
                </h3>
                <span className="text-[11px] text-slate-500 font-sans">Meta de Nota: ≥ {masteryThreshold.toFixed(1)}</span>
              </div>

              <div className="overflow-x-auto border border-amber-200/60 dark:border-amber-900/40 rounded-lg">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead className="bg-amber-50/50 dark:bg-amber-950/30 text-slate-700 dark:text-slate-300 font-semibold border-b border-amber-200/60 dark:border-amber-900/40 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Estudante</th>
                      <th className="py-2 px-3">Série / Turma</th>
                      <th className="py-2 px-2 text-center">Média Atual</th>
                      <th className="py-2 px-3">Disciplinas Abaixo da Meta</th>
                      <th className="py-2 px-3">Contato Responsável</th>
                      <th className="py-2 px-3 text-right">Plano de Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 dark:divide-amber-900/20 font-mono text-[11px]">
                    {criticalPedagogicalStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-amber-50/20 dark:hover:bg-amber-950/10">
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 font-sans">{st.name}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans">{st.grade}</td>
                        <td className="py-2 px-2 text-center font-bold text-amber-600 dark:text-amber-400">{st.average}</td>
                        <td className="py-2 px-3 font-sans">
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            {st.lowSubjects.length > 0 ? st.lowSubjects.join(", ") : "Geral"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-500 font-sans">
                          {st.parentName} ({st.parentPhone})
                        </td>
                        <td className="py-2 px-3 text-right font-sans">
                          <button
                            onClick={() => handleScheduleTutoria(st.name)}
                            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            Agendar Tutoria →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. SECTION: OPERATION, GATE LOGISTICS & DAILY ROUTINE */}
      {/* (Rendered when in 'visao_geral' or 'operacao') */}
      {/* ========================================================================= */}
      {(activeView === "visao_geral" || activeView === "operacao") && (
        <section aria-labelledby="heading-operacao" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 id="heading-operacao" className="text-base font-serif font-bold text-slate-900 dark:text-slate-100">
                Logística de Portaria, Segurança & Presença
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateToTab("retiradas")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
              >
                Abrir Fila Virtual de Carros →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Box 1: Fila de Portaria */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">Tempo Médio de Embarque</span>
                <Clock className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">2.1 min</div>
              <p className="text-[11px] text-slate-500 font-sans">Pico de veículos: 11h45 e 17h30 (312 carros atendidos)</p>
            </div>

            {/* Box 2: Presença Diária */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">Presença nas Catracas</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">97.4%</div>
              <p className="text-[11px] text-slate-500 font-sans">438 presenças confirmadas hoje</p>
            </div>

            {/* Box 3: Rematrículas 2027 */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold uppercase tracking-wider font-sans">Rematrículas 2027</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">78.4%</div>
              <p className="text-[11px] text-slate-500 font-sans">353 contratos digitais assinados</p>
            </div>

          </div>

        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. SECTION: MURAL ESCOLAR — COMUNICADOS & MOMENTOS (MEMOIZED LISTS) */}
      {/* (Rendered when in 'visao_geral') */}
      {/* ========================================================================= */}
      {activeView === "visao_geral" && (
        <section aria-labelledby="heading-mural-escolar" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 id="heading-mural-escolar" className="text-base font-serif font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Mural Operacional: Comunicados & Evidências Pedagógicas</span>
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToTab("comunicados")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
              >
                Central de Comunicados ({comunicados.length}) →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Comunicados Recentes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  Últimos Comunicados Publicados
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Mais recentes</span>
              </div>
              <ComunicadosList
                items={comunicados}
                limit={3}
                compact={true}
                isSchoolView={true}
                onSelect={handleSelectComunicado}
                emptyMessage="Nenhum comunicado cadastrado na unidade escolar."
              />
            </div>

            {/* Column 2: Momentos Pedagógicos Recentes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  Momentos & Evidências Pedagógicas
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigateToTab("agenda")}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Ver Diário de Turmas →
                </button>
              </div>
              <MomentosList
                items={momentos}
                limit={3}
                compact={true}
                onSelect={handleSelectMomento}
                emptyMessage="Nenhum momento pedagógico publicado recentemente."
              />
            </div>
          </div>
        </section>
      )}

      {/* MODAL DE RELATÓRIO FINANCEIRO MENSAL EM PDF */}
      <MonthlyFinancialReportModal
        isOpen={isFinancialReportModalOpen}
        onClose={() => setIsFinancialReportModalOpen(false)}
        cobrancas={cobrancas}
        studentName="Turma Geral • Relatório Institucional"
        studentGrade="Ensino Fundamental e Médio"
        responsibleName="Diretoria & Controladoria Escolar"
        onToast={(msg, type) => setToastMsg({ message: msg, type: type === "error" ? "error" : "success" })}
      />

    </div>
  );
});
