import React, { useState, useMemo } from "react";
import { D3CorrelationChart } from "./D3CorrelationChart";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ReferenceArea
} from "recharts";
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
  PieChartIcon,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  ArrowLeft,
  Search,
  UserCheck,
  ShieldAlert,
  Info,
  PhoneCall,
  Check,
  Target,
  Compass,
  Layers,
  HelpCircle,
  RotateCcw,
  ArrowUpDown,
  ArrowRightLeft
} from "lucide-react";

// Mock Data for School Dashboard (Aggregated Statistics for entire school)
const classOptions = [
  { id: "all", label: "Geral (Todas as Turmas)" },
  { id: "1ano", label: "1º Ano Ensino Fundamental" },
  { id: "5ano", label: "5º Ano Ensino Fundamental" },
  { id: "9ano", label: "9º Ano Ensino Fundamental" },
  { id: "3medio", label: "3º Ano Ensino Médio" }
];

export type PeriodOption = "7d" | "30d" | "90d";

export interface PeriodConfig {
  id: PeriodOption;
  label: string;
  badgeLabel: string;
  chartTitle: string;
  chartSubtitle: string;
  description: string;
  unitLabel: string;
}

export const periodOptions = [
  { id: "7d" as const, label: "7d", fullLabel: "7 dias", desc: "Últimos 7 dias (granularidade diária: tarefas formativas e quizzes)" },
  { id: "30d" as const, label: "30d", fullLabel: "30 dias", desc: "Últimos 30 dias (granularidade semanal: testes modulares)" },
  { id: "90d" as const, label: "90d", fullLabel: "90 dias", desc: "Últimos 90 dias (granularidade quinzenal: trimestre letivo)" }
];

export const periodConfigMap: Record<PeriodOption, PeriodConfig> = {
  "7d": {
    id: "7d",
    label: "7d",
    badgeLabel: "Últimos 7 Dias",
    chartTitle: "Evolução Diária de Rendimento Pedagógico",
    chartSubtitle: "Média diária ponderada de tarefas formativas, quizzes e engajamento em sala",
    description: "Visão granular de 7 dias com base em entregas diárias e avaliações contínuas",
    unitLabel: "vs dia anterior"
  },
  "30d": {
    id: "30d",
    label: "30d",
    badgeLabel: "Últimos 30 Dias",
    chartTitle: "Tendência Semanal de Rendimento (Mês Atual)",
    chartSubtitle: "Média semanal ponderada de testes modulares, redações e projetos",
    description: "Visão semanal consolidada do último mês letivo",
    unitLabel: "vs semana anterior"
  },
  "90d": {
    id: "90d",
    label: "90d",
    badgeLabel: "Últimos 90 Dias (Trimestre)",
    chartTitle: "Curva Pedagógica Consolidada do Trimestre",
    chartSubtitle: "Evolução quinzenal de notas acumuladas contra a meta oficial do colégio (7.0)",
    description: "Visão trimestral com fechamento de ciclos avaliativos",
    unitLabel: "vs quinzena anterior"
  }
};

export interface PedagogicalProgressPoint {
  cycle: string;
  average: number;
  target: number;
  activityCount?: number;
}

export interface SubjectDataPoint {
  subject: string;
  average: number;
  passedRate: number;
}

// 1. Pedagogical Data across 7d, 30d, and 90d periods
export const pedagogicalDataByPeriod: Record<PeriodOption, Record<string, PedagogicalProgressPoint[]>> = {
  "7d": {
    all: [
      { cycle: "26/Set", average: 7.9, target: 7.0, activityCount: 14 },
      { cycle: "27/Set", average: 8.0, target: 7.0, activityCount: 18 },
      { cycle: "28/Set", average: 8.1, target: 7.0, activityCount: 12 },
      { cycle: "29/Set", average: 8.3, target: 7.0, activityCount: 22 },
      { cycle: "30/Set", average: 8.2, target: 7.0, activityCount: 16 },
      { cycle: "01/Out", average: 8.4, target: 7.0, activityCount: 20 },
      { cycle: "02/Out", average: 8.6, target: 7.0, activityCount: 25 }
    ],
    "1ano": [
      { cycle: "26/Set", average: 8.4, target: 7.0, activityCount: 8 },
      { cycle: "27/Set", average: 8.6, target: 7.0, activityCount: 10 },
      { cycle: "28/Set", average: 8.7, target: 7.0, activityCount: 7 },
      { cycle: "29/Set", average: 8.8, target: 7.0, activityCount: 12 },
      { cycle: "30/Set", average: 8.9, target: 7.0, activityCount: 9 },
      { cycle: "01/Out", average: 9.0, target: 7.0, activityCount: 11 },
      { cycle: "02/Out", average: 9.2, target: 7.0, activityCount: 14 }
    ],
    "5ano": [
      { cycle: "26/Set", average: 7.9, target: 7.0, activityCount: 12 },
      { cycle: "27/Set", average: 8.1, target: 7.0, activityCount: 15 },
      { cycle: "28/Set", average: 8.0, target: 7.0, activityCount: 10 },
      { cycle: "29/Set", average: 8.3, target: 7.0, activityCount: 18 },
      { cycle: "30/Set", average: 8.4, target: 7.0, activityCount: 14 },
      { cycle: "01/Out", average: 8.5, target: 7.0, activityCount: 16 },
      { cycle: "02/Out", average: 8.7, target: 7.0, activityCount: 20 }
    ],
    "9ano": [
      { cycle: "26/Set", average: 7.1, target: 7.0, activityCount: 14 },
      { cycle: "27/Set", average: 7.3, target: 7.0, activityCount: 16 },
      { cycle: "28/Set", average: 7.4, target: 7.0, activityCount: 12 },
      { cycle: "29/Set", average: 7.6, target: 7.0, activityCount: 19 },
      { cycle: "30/Set", average: 7.5, target: 7.0, activityCount: 15 },
      { cycle: "01/Out", average: 7.8, target: 7.0, activityCount: 18 },
      { cycle: "02/Out", average: 8.0, target: 7.0, activityCount: 22 }
    ],
    "3medio": [
      { cycle: "26/Set", average: 7.4, target: 7.0, activityCount: 15 },
      { cycle: "27/Set", average: 7.6, target: 7.0, activityCount: 18 },
      { cycle: "28/Set", average: 7.8, target: 7.0, activityCount: 14 },
      { cycle: "29/Set", average: 7.9, target: 7.0, activityCount: 21 },
      { cycle: "30/Set", average: 8.1, target: 7.0, activityCount: 17 },
      { cycle: "01/Out", average: 8.2, target: 7.0, activityCount: 20 },
      { cycle: "02/Out", average: 8.4, target: 7.0, activityCount: 24 }
    ]
  },
  "30d": {
    all: [
      { cycle: "Semana 1", average: 7.7, target: 7.0 },
      { cycle: "Semana 2", average: 8.0, target: 7.0 },
      { cycle: "Semana 3", average: 8.2, target: 7.0 },
      { cycle: "Semana 4", average: 8.5, target: 7.0 }
    ],
    "1ano": [
      { cycle: "Semana 1", average: 8.4, target: 7.0 },
      { cycle: "Semana 2", average: 8.7, target: 7.0 },
      { cycle: "Semana 3", average: 8.9, target: 7.0 },
      { cycle: "Semana 4", average: 9.1, target: 7.0 }
    ],
    "5ano": [
      { cycle: "Semana 1", average: 7.8, target: 7.0 },
      { cycle: "Semana 2", average: 8.1, target: 7.0 },
      { cycle: "Semana 3", average: 8.3, target: 7.0 },
      { cycle: "Semana 4", average: 8.6, target: 7.0 }
    ],
    "9ano": [
      { cycle: "Semana 1", average: 7.1, target: 7.0 },
      { cycle: "Semana 2", average: 7.4, target: 7.0 },
      { cycle: "Semana 3", average: 7.6, target: 7.0 },
      { cycle: "Semana 4", average: 7.9, target: 7.0 }
    ],
    "3medio": [
      { cycle: "Semana 1", average: 7.3, target: 7.0 },
      { cycle: "Semana 2", average: 7.6, target: 7.0 },
      { cycle: "Semana 3", average: 7.9, target: 7.0 },
      { cycle: "Semana 4", average: 8.3, target: 7.0 }
    ]
  },
  "90d": {
    all: [
      { cycle: "Jul (Q1)", average: 7.4, target: 7.0 },
      { cycle: "Jul (Q2)", average: 7.6, target: 7.0 },
      { cycle: "Ago (Q1)", average: 7.9, target: 7.0 },
      { cycle: "Ago (Q2)", average: 8.1, target: 7.0 },
      { cycle: "Set (Q1)", average: 8.3, target: 7.0 },
      { cycle: "Set (Q2)", average: 8.5, target: 7.0 }
    ],
    "1ano": [
      { cycle: "Jul (Q1)", average: 8.2, target: 7.0 },
      { cycle: "Jul (Q2)", average: 8.5, target: 7.0 },
      { cycle: "Ago (Q1)", average: 8.7, target: 7.0 },
      { cycle: "Ago (Q2)", average: 8.8, target: 7.0 },
      { cycle: "Set (Q1)", average: 9.0, target: 7.0 },
      { cycle: "Set (Q2)", average: 9.2, target: 7.0 }
    ],
    "5ano": [
      { cycle: "Jul (Q1)", average: 7.6, target: 7.0 },
      { cycle: "Jul (Q2)", average: 7.8, target: 7.0 },
      { cycle: "Ago (Q1)", average: 8.0, target: 7.0 },
      { cycle: "Ago (Q2)", average: 8.2, target: 7.0 },
      { cycle: "Set (Q1)", average: 8.4, target: 7.0 },
      { cycle: "Set (Q2)", average: 8.6, target: 7.0 }
    ],
    "9ano": [
      { cycle: "Jul (Q1)", average: 6.9, target: 7.0 },
      { cycle: "Jul (Q2)", average: 7.1, target: 7.0 },
      { cycle: "Ago (Q1)", average: 7.3, target: 7.0 },
      { cycle: "Ago (Q2)", average: 7.6, target: 7.0 },
      { cycle: "Set (Q1)", average: 7.8, target: 7.0 },
      { cycle: "Set (Q2)", average: 8.0, target: 7.0 }
    ],
    "3medio": [
      { cycle: "Jul (Q1)", average: 7.1, target: 7.0 },
      { cycle: "Jul (Q2)", average: 7.3, target: 7.0 },
      { cycle: "Ago (Q1)", average: 7.6, target: 7.0 },
      { cycle: "Ago (Q2)", average: 7.9, target: 7.0 },
      { cycle: "Set (Q1)", average: 8.1, target: 7.0 },
      { cycle: "Set (Q2)", average: 8.4, target: 7.0 }
    ]
  }
};

export const subjectAveragesByPeriod: Record<PeriodOption, Record<string, SubjectDataPoint[]>> = {
  "7d": {
    all: [
      { subject: "Matemática", average: 7.8, passedRate: 88 },
      { subject: "Português", average: 8.6, passedRate: 96 },
      { subject: "Ciências", average: 8.3, passedRate: 93 },
      { subject: "História", average: 8.1, passedRate: 91 },
      { subject: "Geografia", average: 8.0, passedRate: 90 },
      { subject: "Inglês", average: 8.8, passedRate: 97 }
    ],
    "1ano": [
      { subject: "Matemática", average: 8.7, passedRate: 94 },
      { subject: "Português", average: 9.1, passedRate: 98 },
      { subject: "Ciências", average: 8.8, passedRate: 97 },
      { subject: "História", average: 8.9, passedRate: 95 },
      { subject: "Geografia", average: 8.6, passedRate: 92 },
      { subject: "Inglês", average: 9.3, passedRate: 99 }
    ],
    "5ano": [
      { subject: "Matemática", average: 8.1, passedRate: 90 },
      { subject: "Português", average: 8.7, passedRate: 95 },
      { subject: "Ciências", average: 8.4, passedRate: 94 },
      { subject: "História", average: 8.2, passedRate: 92 },
      { subject: "Geografia", average: 8.1, passedRate: 91 },
      { subject: "Inglês", average: 8.9, passedRate: 97 }
    ],
    "9ano": [
      { subject: "Matemática", average: 7.2, passedRate: 80 },
      { subject: "Português", average: 7.9, passedRate: 92 },
      { subject: "Ciências", average: 7.7, passedRate: 88 },
      { subject: "História", average: 7.5, passedRate: 86 },
      { subject: "Geografia", average: 7.4, passedRate: 85 },
      { subject: "Inglês", average: 8.2, passedRate: 93 }
    ],
    "3medio": [
      { subject: "Matemática", average: 7.5, passedRate: 84 },
      { subject: "Português", average: 8.2, passedRate: 94 },
      { subject: "Ciências", average: 8.3, passedRate: 93 },
      { subject: "História", average: 8.0, passedRate: 90 },
      { subject: "Geografia", average: 7.8, passedRate: 88 },
      { subject: "Inglês", average: 8.6, passedRate: 95 }
    ]
  },
  "30d": {
    all: [
      { subject: "Matemática", average: 7.5, passedRate: 85 },
      { subject: "Português", average: 8.2, passedRate: 94 },
      { subject: "Ciências", average: 8.0, passedRate: 91 },
      { subject: "História", average: 7.9, passedRate: 89 },
      { subject: "Geografia", average: 7.7, passedRate: 88 },
      { subject: "Inglês", average: 8.4, passedRate: 95 }
    ],
    "1ano": [
      { subject: "Matemática", average: 8.4, passedRate: 92 },
      { subject: "Português", average: 8.8, passedRate: 96 },
      { subject: "Ciências", average: 8.5, passedRate: 95 },
      { subject: "História", average: 8.6, passedRate: 93 },
      { subject: "Geografia", average: 8.3, passedRate: 90 },
      { subject: "Inglês", average: 9.0, passedRate: 98 }
    ],
    "5ano": [
      { subject: "Matemática", average: 7.8, passedRate: 88 },
      { subject: "Português", average: 8.4, passedRate: 94 },
      { subject: "Ciências", average: 8.1, passedRate: 92 },
      { subject: "História", average: 8.0, passedRate: 90 },
      { subject: "Geografia", average: 7.9, passedRate: 89 },
      { subject: "Inglês", average: 8.5, passedRate: 96 }
    ],
    "9ano": [
      { subject: "Matemática", average: 6.8, passedRate: 76 },
      { subject: "Português", average: 7.6, passedRate: 90 },
      { subject: "Ciências", average: 7.4, passedRate: 85 },
      { subject: "História", average: 7.3, passedRate: 84 },
      { subject: "Geografia", average: 7.2, passedRate: 83 },
      { subject: "Inglês", average: 7.9, passedRate: 91 }
    ],
    "3medio": [
      { subject: "Matemática", average: 7.1, passedRate: 80 },
      { subject: "Português", average: 7.9, passedRate: 92 },
      { subject: "Ciências", average: 8.0, passedRate: 91 },
      { subject: "História", average: 7.8, passedRate: 88 },
      { subject: "Geografia", average: 7.6, passedRate: 86 },
      { subject: "Inglês", average: 8.3, passedRate: 93 }
    ]
  },
  "90d": {
    all: [
      { subject: "Matemática", average: 7.3, passedRate: 82 },
      { subject: "Português", average: 8.0, passedRate: 92 },
      { subject: "Ciências", average: 7.8, passedRate: 89 },
      { subject: "História", average: 7.7, passedRate: 87 },
      { subject: "Geografia", average: 7.5, passedRate: 85 },
      { subject: "Inglês", average: 8.2, passedRate: 93 }
    ],
    "1ano": [
      { subject: "Matemática", average: 8.2, passedRate: 90 },
      { subject: "Português", average: 8.6, passedRate: 94 },
      { subject: "Ciências", average: 8.3, passedRate: 93 },
      { subject: "História", average: 8.4, passedRate: 91 },
      { subject: "Geografia", average: 8.1, passedRate: 88 },
      { subject: "Inglês", average: 8.8, passedRate: 96 }
    ],
    "5ano": [
      { subject: "Matemática", average: 7.6, passedRate: 86 },
      { subject: "Português", average: 8.2, passedRate: 92 },
      { subject: "Ciências", average: 7.9, passedRate: 90 },
      { subject: "História", average: 7.8, passedRate: 88 },
      { subject: "Geografia", average: 7.7, passedRate: 87 },
      { subject: "Inglês", average: 8.3, passedRate: 94 }
    ],
    "9ano": [
      { subject: "Matemática", average: 6.6, passedRate: 73 },
      { subject: "Português", average: 7.4, passedRate: 88 },
      { subject: "Ciências", average: 7.2, passedRate: 83 },
      { subject: "História", average: 7.1, passedRate: 82 },
      { subject: "Geografia", average: 7.0, passedRate: 80 },
      { subject: "Inglês", average: 7.7, passedRate: 89 }
    ],
    "3medio": [
      { subject: "Matemática", average: 6.9, passedRate: 77 },
      { subject: "Português", average: 7.7, passedRate: 90 },
      { subject: "Ciências", average: 7.8, passedRate: 89 },
      { subject: "História", average: 7.6, passedRate: 86 },
      { subject: "Geografia", average: 7.4, passedRate: 84 },
      { subject: "Inglês", average: 8.1, passedRate: 91 }
    ]
  }
};

// 2. Financial Data
const monthlyCashFlowData = [
  { month: "Jan", inflows: 145000, outflows: 95000, defaultRate: 3.5 },
  { month: "Fev", inflows: 162000, outflows: 110000, defaultRate: 4.2 },
  { month: "Mar", inflows: 158000, outflows: 105000, defaultRate: 4.8 },
  { month: "Abr", inflows: 171000, outflows: 108000, defaultRate: 5.1 },
  { month: "Mai", inflows: 185000, outflows: 112000, defaultRate: 3.9 },
  { month: "Jun", inflows: 195000, outflows: 115000, defaultRate: 3.2 }
];

const paymentStatusData = [
  { name: "Liquidados", value: 72, color: "#10b981", desc: "Pagos no prazo ou Pix" },
  { name: "Em Aberto", value: 16, color: "#3b82f6", desc: "A vencer no mês corrente" },
  { name: "Atrasados", value: 7, color: "#ef4444", desc: "Vencidos (cobrança ativa)" },
  { name: "Renegociados", value: 5, color: "#8b5cf6", desc: "Acordo de parcelamento" }
];

// Custom Tooltip for Pedagogical Progress (Line Chart)
const CustomPedagogicalTooltip = ({ active, payload, label, period = "30d" }: { active?: boolean; payload?: any[]; label?: string; period?: PeriodOption }) => {
  if (active && payload && payload.length) {
    const avg = Number(payload.find(p => p.dataKey === "average")?.value ?? payload[0]?.value);
    const target = Number(payload.find(p => p.dataKey === "target")?.value ?? 7.0);
    const delta = Number((avg - target).toFixed(2));
    const isAbove = delta >= 0;
    const activityCount = payload[0]?.payload?.activityCount;

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950 text-white p-3 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-sm font-sans text-xs min-w-[200px] space-y-2 transition-all">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 font-mono text-[10px] text-slate-400">
          <span className="font-bold text-slate-200">{label}</span>
          <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${isAbove ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60" : "bg-rose-950/80 text-rose-400 border border-rose-800/60"}`}>
            {isAbove ? `+${delta} meta` : `${delta} meta`}
          </span>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-sans">Média Alunos:</span>
            <span className="font-black text-sky-400">{avg.toFixed(1)} / 10</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Meta do Colégio:</span>
            <span className="text-slate-300">{target.toFixed(1)}</span>
          </div>
          {activityCount !== undefined && (
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-sans">Entregas Avaliadas:</span>
              <span className="text-amber-400 font-bold">{activityCount} tarefas</span>
            </div>
          )}
        </div>
        <div className="pt-1.5 border-t border-slate-800/80 text-[10px] font-sans flex items-center justify-between">
          <span className={isAbove ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
            {isAbove ? "✓ Desempenho dentro do padrão" : "⚠️ Requer reforço pontual"}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {period === "7d" ? "Diário" : period === "30d" ? "Semanal" : "Trimestral"}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Subject Performance (Bar Chart)
const CustomSubjectTooltip = ({ active, payload, label, period = "30d" }: { active?: boolean; payload?: any[]; label?: string; period?: PeriodOption }) => {
  if (active && payload && payload.length) {
    const avg = Number(payload.find(p => p.dataKey === "average")?.value ?? payload[0]?.value);
    const passed = payload[0]?.payload?.passedRate;
    const isExcellence = avg >= 8.5;
    const isGood = avg >= 7.0;

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950 text-white p-3 rounded-2xl border border-slate-700/80 shadow-xl backdrop-blur-sm font-sans text-xs min-w-[180px] space-y-2 transition-all">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
          <span className="font-bold text-slate-100 text-xs">{label}</span>
          <span className="text-[10px] font-mono text-slate-400">
            {period === "7d" ? "Últimos 7 dias" : period === "30d" ? "Últimos 30 dias" : "Últimos 90 dias"}
          </span>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-sans">Média no Período:</span>
            <span className={`font-black ${isExcellence ? "text-emerald-400" : isGood ? "text-sky-400" : "text-amber-400"}`}>
              {avg.toFixed(1)} / 10
            </span>
          </div>
          {passed !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-sans">Aprovação:</span>
              <span className="font-black text-emerald-400">{passed}%</span>
            </div>
          )}
        </div>
        <div className="pt-1.5 border-t border-slate-800/80 text-[10px] font-sans">
          {isExcellence ? (
            <span className="text-emerald-400">Alto rendimento curricular</span>
          ) : isGood ? (
            <span className="text-slate-300">Progresso dentro do esperado</span>
          ) : (
            <span className="text-rose-400">Disciplina prioritária para tutoria</span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// -------------------------------------------------------------
// SCATTER PLOT: REMATRÍCULA VS. ATRASOS FINANCEIROS (RISCO POR ESTUDANTE)
// -------------------------------------------------------------
export type RiskTier = "critical" | "warning_financial" | "warning_pedagogical" | "safe";

export interface StudentRiskDataPoint {
  id: string;
  name: string;
  classId: "1ano" | "5ano" | "9ano" | "3medio";
  className: string;
  delayDays: number; // Eixo X: Histórico de atrasos financeiros (dias médios de vencimento)
  reEnrollmentRate: number; // Eixo Y: Probabilidade / taxa de rematrícula (%)
  tuition: number; // Valor da mensalidade (porte do ponto)
  responsibleName: string;
  responsibleContact: string;
  riskTier: RiskTier;
  recommendedAction: string;
  academicAverage: number;
}

export const isStudentHighRisk = (student: StudentRiskDataPoint): boolean => {
  return student.delayDays > 15 && student.reEnrollmentRate < 75;
};

export const studentScatterData: StudentRiskDataPoint[] = [
  {
    id: "st-01",
    name: "Nicolas Nogueira",
    classId: "5ano",
    className: "5º Ano EF",
    delayDays: 0,
    reEnrollmentRate: 98,
    tuition: 1650,
    responsibleName: "Mariana Silva Nogueira",
    responsibleContact: "(11) 98765-4321",
    riskTier: "safe",
    recommendedAction: "Fidelizado. Enviar convite de pré-matrícula com benefício de pontualidade.",
    academicAverage: 8.9
  },
  {
    id: "st-02",
    name: "Isabella Santos",
    classId: "9ano",
    className: "9º Ano EF",
    delayDays: 4,
    reEnrollmentRate: 94,
    tuition: 1850,
    responsibleName: "Carlos Eduardo Santos",
    responsibleContact: "(11) 97654-3210",
    riskTier: "safe",
    recommendedAction: "Alto engajamento familiar e pedagógico. Manter fluxo padrão.",
    academicAverage: 9.1
  },
  {
    id: "st-03",
    name: "Beatriz Lima",
    classId: "1ano",
    className: "1º Ano EF",
    delayDays: 7,
    reEnrollmentRate: 88,
    tuition: 1450,
    responsibleName: "Renata Lima",
    responsibleContact: "(11) 96543-2109",
    riskTier: "safe",
    recommendedAction: "Atrasos irrelevantes pontuais. Rematrícula provável confirmada.",
    academicAverage: 8.5
  },
  {
    id: "st-04",
    name: "Lucas Rocha",
    classId: "9ano",
    className: "9º Ano EF",
    delayDays: 29,
    reEnrollmentRate: 38,
    tuition: 1850,
    responsibleName: "Rodrigo Rocha",
    responsibleContact: "(11) 95432-1098",
    riskTier: "critical",
    recommendedAction: "Prioridade Máxima: Agendar conferência mista (Financeiro + Coordenação Pedagógica).",
    academicAverage: 6.2
  },
  {
    id: "st-05",
    name: "Gabriel Alves",
    classId: "5ano",
    className: "5º Ano EF",
    delayDays: 34,
    reEnrollmentRate: 42,
    tuition: 1650,
    responsibleName: "Patrícia Alves",
    responsibleContact: "(11) 94321-0987",
    riskTier: "critical",
    recommendedAction: "Propor acordo Pix parcelado para débitos em aberto e suporte em matemática.",
    academicAverage: 6.5
  },
  {
    id: "st-06",
    name: "Larissa Ribeiro",
    classId: "3medio",
    className: "3º Ano EM",
    delayDays: 22,
    reEnrollmentRate: 85,
    tuition: 2250,
    responsibleName: "Fernando Ribeiro",
    responsibleContact: "(11) 93210-9876",
    riskTier: "warning_financial",
    recommendedAction: "Família com forte compromisso com terceirão. Enviar lembrete no WhatsApp pré-vencimento.",
    academicAverage: 8.4
  },
  {
    id: "st-07",
    name: "Matheus Costa",
    classId: "1ano",
    className: "1º Ano EF",
    delayDays: 24,
    reEnrollmentRate: 81,
    tuition: 1450,
    responsibleName: "Juliana Costa",
    responsibleContact: "(11) 92109-8765",
    riskTier: "warning_financial",
    recommendedAction: "Inadimplência de fluxo. Oferecer alteração da data de vencimento da mensalidade.",
    academicAverage: 8.0
  },
  {
    id: "st-08",
    name: "Sofia Martins",
    classId: "5ano",
    className: "5º Ano EF",
    delayDays: 5,
    reEnrollmentRate: 48,
    tuition: 1650,
    responsibleName: "Marcelo Martins",
    responsibleContact: "(11) 91098-7654",
    riskTier: "warning_pedagogical",
    recommendedAction: "Pagamentos em dia, porém risco de evasão por dificuldades de integração na turma.",
    academicAverage: 6.9
  },
  {
    id: "st-09",
    name: "Arthur Pereira",
    classId: "9ano",
    className: "9º Ano EF",
    delayDays: 8,
    reEnrollmentRate: 52,
    tuition: 1850,
    responsibleName: "Aline Pereira",
    responsibleContact: "(11) 90987-6543",
    riskTier: "warning_pedagogical",
    recommendedAction: "Adimplente. Sondagem revelou dúvida sobre transição para o Novo Ensino Médio.",
    academicAverage: 7.2
  },
  {
    id: "st-10",
    name: "Manuela Carvalho",
    classId: "3medio",
    className: "3º Ano EM",
    delayDays: 41,
    reEnrollmentRate: 31,
    tuition: 2250,
    responsibleName: "Jorge Carvalho",
    responsibleContact: "(11) 99876-5432",
    riskTier: "critical",
    recommendedAction: "Inadimplência crônica e baixa frequência. Disparo imediato de comitê de retenção.",
    academicAverage: 5.8
  },
  {
    id: "st-11",
    name: "Enzo Silva",
    classId: "1ano",
    className: "1º Ano EF",
    delayDays: 2,
    reEnrollmentRate: 96,
    tuition: 1450,
    responsibleName: "Camila Silva",
    responsibleContact: "(11) 98765-1122",
    riskTier: "safe",
    recommendedAction: "Excelente desempenho e adimplência. Família promotora (NPS 10).",
    academicAverage: 9.3
  },
  {
    id: "st-12",
    name: "Valentina Costa",
    classId: "5ano",
    className: "5º Ano EF",
    delayDays: 19,
    reEnrollmentRate: 86,
    tuition: 1650,
    responsibleName: "Fábio Costa",
    responsibleContact: "(11) 97654-2233",
    riskTier: "warning_financial",
    recommendedAction: "Atrasos pontuais no meio do mês. Família deseja manter aluno na instituição.",
    academicAverage: 8.6
  },
  {
    id: "st-13",
    name: "Bernardo Souza",
    classId: "9ano",
    className: "9º Ano EF",
    delayDays: 32,
    reEnrollmentRate: 44,
    tuition: 1850,
    responsibleName: "Cristina Souza",
    responsibleContact: "(11) 96543-3344",
    riskTier: "critical",
    recommendedAction: "Risco de transferência. Apresentar proposta com bolsa social condicionada.",
    academicAverage: 6.4
  },
  {
    id: "st-14",
    name: "Helena Oliveira",
    classId: "3medio",
    className: "3º Ano EM",
    delayDays: 3,
    reEnrollmentRate: 97,
    tuition: 2250,
    responsibleName: "Vanessa Oliveira",
    responsibleContact: "(11) 95432-4455",
    riskTier: "safe",
    recommendedAction: "Aluna foco pré-vestibular Medicina. Fidelizada e pontual.",
    academicAverage: 9.6
  },
  {
    id: "st-15",
    name: "Davi Ferreira",
    classId: "1ano",
    className: "1º Ano EF",
    delayDays: 6,
    reEnrollmentRate: 91,
    tuition: 1450,
    responsibleName: "Lucas Ferreira",
    responsibleContact: "(11) 94321-5566",
    riskTier: "safe",
    recommendedAction: "Adaptação no 1º Ano bem-sucedida. Enviar boletim personalizado de mérito.",
    academicAverage: 8.8
  },
  {
    id: "st-16",
    name: "Alice Rodrigues",
    classId: "5ano",
    className: "5º Ano EF",
    delayDays: 10,
    reEnrollmentRate: 59,
    tuition: 1650,
    responsibleName: "Cláudia Rodrigues",
    responsibleContact: "(11) 93210-6677",
    riskTier: "warning_pedagogical",
    recommendedAction: "Queda de notas em Língua Portuguesa provocou insegurança dos pais. Oferecer plantão.",
    academicAverage: 6.7
  },
  {
    id: "st-17",
    name: "Pedro Henrique",
    classId: "9ano",
    className: "9º Ano EF",
    delayDays: 26,
    reEnrollmentRate: 83,
    tuition: 1850,
    responsibleName: "Paulo Henrique",
    responsibleContact: "(11) 92109-7788",
    riskTier: "warning_financial",
    recommendedAction: "Atraso no fechamento do cartão familiar. Renegociar para Pix recorrente.",
    academicAverage: 7.9
  },
  {
    id: "st-18",
    name: "Laura Mendes",
    classId: "3medio",
    className: "3º Ano EM",
    delayDays: 45,
    reEnrollmentRate: 27,
    tuition: 2250,
    responsibleName: "Marcos Mendes",
    responsibleContact: "(11) 91098-8899",
    riskTier: "critical",
    recommendedAction: "Débitos de 3 mensalidades consecutivas. Contato telefônico urgente da diretoria.",
    academicAverage: 5.6
  },
  {
    id: "st-19",
    name: "Samuel Barbosa",
    classId: "1ano",
    className: "1º Ano EF",
    delayDays: 18,
    reEnrollmentRate: 77,
    tuition: 1450,
    responsibleName: "Tatiane Barbosa",
    responsibleContact: "(11) 90987-9900",
    riskTier: "warning_financial",
    recommendedAction: "Atrasos moderados resolvidos no fim do mês. Estabilidade assegurada.",
    academicAverage: 8.2
  },
  {
    id: "st-20",
    name: "Giovanna Dias",
    classId: "5ano",
    className: "5º Ano EF",
    delayDays: 9,
    reEnrollmentRate: 53,
    tuition: 1650,
    responsibleName: "Bruno Dias",
    responsibleContact: "(11) 99876-0011",
    riskTier: "warning_pedagogical",
    recommendedAction: "Família avaliando mudança residencial. Apresentar opções de transporte parceiro.",
    academicAverage: 7.4
  },
  {
    id: "st-21",
    name: "Theo Moreira",
    classId: "9ano",
    className: "9º Ano EF",
    delayDays: 1,
    reEnrollmentRate: 95,
    tuition: 1850,
    responsibleName: "Letícia Moreira",
    responsibleContact: "(11) 98765-2211",
    riskTier: "safe",
    recommendedAction: "Aluno monitor de turma. Perfil líder fidelizado para o Ensino Médio.",
    academicAverage: 9.4
  },
  {
    id: "st-22",
    name: "Maria Eduarda",
    classId: "3medio",
    className: "3º Ano EM",
    delayDays: 12,
    reEnrollmentRate: 91,
    tuition: 2250,
    responsibleName: "Eduardo Souza",
    responsibleContact: "(11) 97654-3322",
    riskTier: "safe",
    recommendedAction: "Engajada e adimplente. Convite para cerimônia de formatura já aceito.",
    academicAverage: 8.7
  },
  {
    id: "st-23",
    name: "Caio Vinicius",
    classId: "1ano",
    className: "1º Ano EF",
    delayDays: 31,
    reEnrollmentRate: 36,
    tuition: 1450,
    responsibleName: "Viviane Ramos",
    responsibleContact: "(11) 96543-4433",
    riskTier: "critical",
    recommendedAction: "Família com queixas de adaptação e boletos vencidos. Ativar acolhimento pedagógico.",
    academicAverage: 6.1
  },
  {
    id: "st-24",
    name: "Lorena Castro",
    classId: "5ano",
    className: "5º Ano EF",
    delayDays: 28,
    reEnrollmentRate: 84,
    tuition: 1650,
    responsibleName: "Guilherme Castro",
    responsibleContact: "(11) 95432-5544",
    riskTier: "warning_financial",
    recommendedAction: "Sazonalidade financeira familiar. Aceita plano anual com flexibilização de data.",
    academicAverage: 8.8
  },
  {
    id: "st-25",
    name: "Felipe Guimarães",
    classId: "9ano",
    className: "9º Ano EF",
    delayDays: 11,
    reEnrollmentRate: 46,
    tuition: 1850,
    responsibleName: "Sílvia Guimarães",
    responsibleContact: "(11) 94321-6655",
    riskTier: "warning_pedagogical",
    recommendedAction: "Desmotivação pós-avaliações. Agendar mentoria com o professor orientador.",
    academicAverage: 6.8
  },
  {
    id: "st-26",
    name: "Luiza Duarte",
    classId: "3medio",
    className: "3º Ano EM",
    delayDays: 37,
    reEnrollmentRate: 39,
    tuition: 2250,
    responsibleName: "Danilo Duarte",
    responsibleContact: "(11) 93210-7766",
    riskTier: "critical",
    recommendedAction: "Risco alto de inadimplência terminal. Oferecer quitação com isenção de multas.",
    academicAverage: 6.0
  },
  {
    id: "st-27",
    name: "Rafael Ramos",
    classId: "1ano",
    className: "1º Ano EF",
    delayDays: 0,
    reEnrollmentRate: 99,
    tuition: 1450,
    responsibleName: "Beatriz Ramos",
    responsibleContact: "(11) 92109-8877",
    riskTier: "safe",
    recommendedAction: "Pagamento antecipado efetuado. Satisfação plena comprovada.",
    academicAverage: 9.7
  },
  {
    id: "st-28",
    name: "Yasmin Farias",
    classId: "5ano",
    className: "5º Ano EF",
    delayDays: 35,
    reEnrollmentRate: 41,
    tuition: 1650,
    responsibleName: "Rodrigo Farias",
    responsibleContact: "(11) 91098-9988",
    riskTier: "critical",
    recommendedAction: "Pendência documental somada a atraso financeiro. Centralizar atendimento.",
    academicAverage: 6.3
  }
];

// Custom Tooltip for Student Risk Scatter Plot
const CustomScatterRiskTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    const data: StudentRiskDataPoint = payload[0]?.payload;
    if (!data) return null;

    const tierLabels = {
      critical: { label: "Zona Crítica (Alto Risco)", color: "text-rose-400", bg: "bg-rose-950/80 border-rose-800" },
      warning_financial: { label: "Inadimplência Transitória", color: "text-amber-400", bg: "bg-amber-950/80 border-amber-800" },
      warning_pedagogical: { label: "Risco Pedagógico", color: "text-sky-400", bg: "bg-sky-950/80 border-sky-800" },
      safe: { label: "Zona Segura & Fidelizada", color: "text-emerald-400", bg: "bg-emerald-950/80 border-emerald-800" }
    };
    const tier = tierLabels[data.riskTier] || tierLabels.safe;

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950 text-white p-3.5 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md font-sans text-xs min-w-[240px] max-w-[280px] space-y-2.5 transition-all">
        <div className="flex items-start justify-between border-b border-slate-700/60 pb-2">
          <div>
            <h5 className="font-bold text-slate-100 text-sm">{data.name}</h5>
            <p className="text-[10px] text-slate-400 font-mono">{data.className} • Resp: {data.responsibleName}</p>
          </div>
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${tier.bg} ${tier.color}`}>
            {data.reEnrollmentRate}% rematrícula
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-800/50 p-2 rounded-xl">
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Atraso Médio</span>
            <strong className={`text-xs ${data.delayDays > 15 ? "text-rose-400" : "text-emerald-400"}`}>
              {data.delayDays} dias
            </strong>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Média Notas</span>
            <strong className="text-xs text-slate-200">
              {data.academicAverage.toFixed(1)} / 10
            </strong>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Mensalidade</span>
            <strong className="text-xs text-slate-200">
              R$ {data.tuition.toLocaleString()}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Classificação</span>
            <span className={`text-[10px] font-bold ${tier.color}`}>
              {tier.label.split(" ")[0]}
            </span>
          </div>
        </div>

        <div className="text-[10.5px] leading-relaxed pt-1 border-t border-slate-800 text-slate-300">
          <strong className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Ação Recomendada:</strong>
          <span className="text-slate-200">{data.recommendedAction}</span>
        </div>

        {isStudentHighRisk(data) && (
          <div className="pt-1.5 border-t border-rose-900/60 flex items-center gap-1.5 text-[10px] font-bold text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <span>⚠️ Diagnóstico: Alto Risco de Evasão (Atraso &gt; 15d e Remat &lt; 75%)</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

interface SchoolMetricsDashboardProps {
  onBack?: () => void;
}

export function SchoolMetricsDashboard({ onBack }: SchoolMetricsDashboardProps = {}) {
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>("30d");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("Atualizado agora mesmo");
  const [showExportToast, setShowExportToast] = useState(false);

  // Scatter plot state (Rematrícula vs. Histórico de Atrasos Financeiros)
  const [scatterTierFilter, setScatterTierFilter] = useState<"all" | "critical" | "warning_financial" | "warning_pedagogical" | "safe">("all");
  const [scatterSearchQuery, setScatterSearchQuery] = useState("");
  const [selectedScatterStudent, setSelectedScatterStudent] = useState<StudentRiskDataPoint | null>(null);
  const [scatterClassScope, setScatterClassScope] = useState<string>("inherit");
  const [actionFeedbackMessage, setActionFeedbackMessage] = useState<string | null>(null);

  // Interactive Axis Legend state
  const [activeAxisLegendTab, setActiveAxisLegendTab] = useState<"axes" | "students" | "quadrants">("axes");
  const [activeAxisBand, setActiveAxisBand] = useState<"all" | "y_high" | "y_mid" | "y_low" | "x_safe" | "x_warn" | "x_crit">("all");
  const [isHighRiskHighlightActive, setIsHighRiskHighlightActive] = useState(false);

  // Active class filter for Scatter Plot: inherit global selectedClass or allow specific drilldown
  const activeScatterClassId = scatterClassScope === "inherit" ? selectedClass : scatterClassScope;

  const axisCounts = useMemo(() => {
    const inScope = studentScatterData.filter(s => activeScatterClassId === "all" || s.classId === activeScatterClassId);
    return {
      yHigh: inScope.filter(s => s.reEnrollmentRate >= 75).length,
      yMid: inScope.filter(s => s.reEnrollmentRate >= 50 && s.reEnrollmentRate < 75).length,
      yLow: inScope.filter(s => s.reEnrollmentRate < 50).length,
      xSafe: inScope.filter(s => s.delayDays <= 5).length,
      xWarn: inScope.filter(s => s.delayDays > 5 && s.delayDays <= 15).length,
      xCrit: inScope.filter(s => s.delayDays > 15).length,
    };
  }, [activeScatterClassId]);

  const filteredScatterStudents = useMemo(() => {
    return studentScatterData.filter((student) => {
      // Class filter
      if (activeScatterClassId !== "all" && student.classId !== activeScatterClassId) {
        return false;
      }
      // Risk Tier filter
      if (scatterTierFilter !== "all" && student.riskTier !== scatterTierFilter) {
        return false;
      }
      // Interactive Axis Band filter (when manager clicks on an axis segment)
      if (activeAxisBand === "y_high" && student.reEnrollmentRate < 75) return false;
      if (activeAxisBand === "y_mid" && (student.reEnrollmentRate < 50 || student.reEnrollmentRate >= 75)) return false;
      if (activeAxisBand === "y_low" && student.reEnrollmentRate >= 50) return false;
      if (activeAxisBand === "x_safe" && student.delayDays > 5) return false;
      if (activeAxisBand === "x_warn" && (student.delayDays <= 5 || student.delayDays > 15)) return false;
      if (activeAxisBand === "x_crit" && student.delayDays <= 15) return false;

      // Search text
      if (scatterSearchQuery.trim()) {
        const query = scatterSearchQuery.toLowerCase();
        return (
          student.name.toLowerCase().includes(query) ||
          student.responsibleName.toLowerCase().includes(query) ||
          student.className.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [activeScatterClassId, scatterTierFilter, activeAxisBand, scatterSearchQuery]);

  // Aggregate Scatter metrics in scope
  const scatterStats = useMemo(() => {
    const inScope = studentScatterData.filter(s => activeScatterClassId === "all" || s.classId === activeScatterClassId);
    const criticalCount = inScope.filter(s => s.riskTier === "critical").length;
    const warningFinCount = inScope.filter(s => s.riskTier === "warning_financial").length;
    const warningPedCount = inScope.filter(s => s.riskTier === "warning_pedagogical").length;
    const safeCount = inScope.filter(s => s.riskTier === "safe").length;
    const atRiskAnnualRevenue = inScope.filter(s => s.riskTier === "critical").reduce((acc, s) => acc + (s.tuition * 12), 0);
    const avgRetention = inScope.length > 0 ? (inScope.reduce((acc, s) => acc + s.reEnrollmentRate, 0) / inScope.length) : 0;
    const avgDelay = inScope.length > 0 ? (inScope.reduce((acc, s) => acc + s.delayDays, 0) / inScope.length) : 0;

    return {
      total: inScope.length,
      criticalCount,
      warningFinCount,
      warningPedCount,
      safeCount,
      atRiskAnnualRevenue,
      avgRetention: avgRetention.toFixed(1),
      avgDelay: avgDelay.toFixed(1)
    };
  }, [activeScatterClassId]);

  // Identificação dos estudantes de Alto Risco de Evasão (Atraso Financeiro > 15 dias E Rematrícula < 75%)
  const highRiskStudentsInScope = useMemo(() => {
    return studentScatterData.filter(
      (s) =>
        (activeScatterClassId === "all" || s.classId === activeScatterClassId) &&
        isStudentHighRisk(s)
    );
  }, [activeScatterClassId]);

  // Função principal para identificar e realçar visualmente no gráfico de dispersão os alunos com 'alto risco' de evasão
  const identifyAndHighlightHighRisk = () => {
    if (isHighRiskHighlightActive) {
      setIsHighRiskHighlightActive(false);
      setActionFeedbackMessage("Modo de realce desativado. Visualização normal dos eixos restaurada.");
      return;
    }

    setIsHighRiskHighlightActive(true);

    if (highRiskStudentsInScope.length > 0) {
      // Ordena estudantes por menor probabilidade de rematrícula (maior severidade de churn)
      const sortedCritical = [...highRiskStudentsInScope].sort((a, b) => {
        if (a.reEnrollmentRate !== b.reEnrollmentRate) {
          return a.reEnrollmentRate - b.reEnrollmentRate;
        }
        return b.delayDays - a.delayDays;
      });

      setSelectedScatterStudent(sortedCritical[0]);
      setActiveAxisLegendTab("students");
    }

    const totalLoss = highRiskStudentsInScope.reduce((acc, s) => acc + s.tuition * 12, 0);

    setActionFeedbackMessage(
      `Identificados ${highRiskStudentsInScope.length} alunos com alto risco de evasão (atraso > 15d e rematrícula < 75%). Realce ativado no gráfico com indicador de quadrante crítico (R$ ${totalLoss.toLocaleString()} de anuidade sob risco).`
    );
  };

  const handleSelectNextHighRiskStudent = () => {
    if (highRiskStudentsInScope.length === 0) return;
    const currentIndex = selectedScatterStudent
      ? highRiskStudentsInScope.findIndex((s) => s.id === selectedScatterStudent.id)
      : -1;
    const nextIndex = (currentIndex + 1) % highRiskStudentsInScope.length;
    setSelectedScatterStudent(highRiskStudentsInScope[nextIndex]);
    setActiveAxisLegendTab("students");
  };

  const handleSelectPreviousHighRiskStudent = () => {
    if (highRiskStudentsInScope.length === 0) return;
    const currentIndex = selectedScatterStudent
      ? highRiskStudentsInScope.findIndex((s) => s.id === selectedScatterStudent.id)
      : 0;
    const prevIndex = (currentIndex - 1 + highRiskStudentsInScope.length) % highRiskStudentsInScope.length;
    setSelectedScatterStudent(highRiskStudentsInScope[prevIndex]);
    setActiveAxisLegendTab("students");
  };

  // Dynamic pedagogical data resolved by current period and class
  const currentDataset = pedagogicalDataByPeriod[selectedPeriod][selectedClass] || pedagogicalDataByPeriod["30d"]["all"];
  const currentSubjects = subjectAveragesByPeriod[selectedPeriod][selectedClass] || subjectAveragesByPeriod["30d"]["all"];
  const periodMeta = periodConfigMap[selectedPeriod];

  // Stats calculation based on selected class and period
  const lastIdx = currentDataset.length - 1;
  const classAvg = currentDataset[lastIdx].average;
  const previousClassAvg = lastIdx > 0 ? currentDataset[lastIdx - 1].average : classAvg;
  const avgDelta = (classAvg - previousClassAvg).toFixed(2);
  const isAvgUp = parseFloat(avgDelta) >= 0;

  const handleSyncData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setLastSyncTime(`Sincronizado às ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
    }, 1200);
  };

  const handleExportData = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  // Renderizador visual personalizado dos nós no gráfico de dispersão com realce para Alto Risco de Evasão
  const renderScatterNode = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || cx === undefined || cy === undefined) return null;
    const isSelected = selectedScatterStudent?.id === payload.id;
    const isHighRisk = isStudentHighRisk(payload);

    if (isHighRiskHighlightActive) {
      if (isHighRisk) {
        return (
          <g
            key={`scatter-node-${payload.id}`}
            className="cursor-pointer"
            onClick={() => {
              setSelectedScatterStudent(payload);
              setActiveAxisLegendTab("students");
            }}
          >
            {/* Animated Pulsing Outer Warning Ring */}
            <circle
              cx={cx}
              cy={cy}
              r={isSelected ? 16 : 13}
              fill="#fee2e2"
              fillOpacity={0.7}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="3 3"
              className="animate-pulse"
            />
            {/* Middle Warning Aura */}
            <circle
              cx={cx}
              cy={cy}
              r={isSelected ? 11 : 9}
              fill="#f43f5e"
              fillOpacity={0.85}
            />
            {/* Core Node */}
            <circle
              cx={cx}
              cy={cy}
              r={isSelected ? 7 : 5.5}
              fill="#991b1b"
              stroke={isSelected ? "#0f172a" : "#ffffff"}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
          </g>
        );
      } else {
        // Softened & dimmed background point
        return (
          <g
            key={`scatter-node-${payload.id}`}
            className="cursor-pointer opacity-30 hover:opacity-80 transition-opacity"
            onClick={() => {
              setSelectedScatterStudent(payload);
              setActiveAxisLegendTab("students");
            }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={isSelected ? 5.5 : 4}
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth={0.5}
              fillOpacity={0.25}
            />
          </g>
        );
      }
    }

    // Normal mode (Sem realce ativo)
    const color =
      payload.riskTier === "critical"
        ? "#ef4444"
        : payload.riskTier === "warning_financial"
        ? "#f59e0b"
        : payload.riskTier === "warning_pedagogical"
        ? "#6366f1"
        : "#10b981";

    return (
      <g
        key={`scatter-node-${payload.id}`}
        className="cursor-pointer"
        onClick={() => {
          setSelectedScatterStudent(payload);
        }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 8.5 : 6}
          fill={color}
          stroke={isSelected ? "#0f172a" : color}
          strokeWidth={isSelected ? 3 : 1.5}
          fillOpacity={isSelected ? 1 : 0.85}
        />
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* HEADER CONTROLS CARD */}
      <div className="bg-white/95 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-1 rounded-xl text-xs transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer shrink-0 shadow-xs mr-1"
                  title="Voltar ao Painel da Escola"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
              )}
              <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                Métricas & Analytics
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                {lastSyncTime}
              </span>
            </div>
            <h2 className="font-serif font-black text-xl text-slate-850 dark:text-[#fdfaf3]">
              Dashboard Pedagógico e Financeiro Geral
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              Visão consolidada de desempenho acadêmico, controle de caixa de mensalidades e monitoramento de inadimplência.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Period Selector (Header) */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shrink-0">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 ml-1.5 hidden sm:inline" />
              <div className="flex items-center gap-0.5">
                {periodOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPeriod(opt.id)}
                    className={`px-2 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                      selectedPeriod === opt.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                    }`}
                    title={opt.desc}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter class dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {classOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="text-slate-800 dark:bg-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Force Sync button */}
            <button
              onClick={handleSyncData}
              disabled={isSyncing}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-300 hover:scale-103 active:scale-97 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
              title="Recarregar dados do ERP escolar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="text-xs font-bold hidden md:inline">Sincronizar ERP</span>
            </button>

            {/* Export data */}
            <button
              onClick={handleExportData}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs hover:scale-103 active:scale-97 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Exportar dados consolidados em planilha"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-xs font-bold hidden md:inline">Exportar Planilha</span>
            </button>
          </div>
        </div>
      </div>

      {/* GENERAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: General Class Average */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white/95 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Média Pedagógica ({selectedPeriod.toUpperCase()})
            </span>
            <div className="flex items-baseline gap-2">
              <motion.span
                key={`${classAvg}-${selectedPeriod}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-2xl font-black text-slate-850 dark:text-slate-100 font-mono"
              >
                {classAvg.toFixed(1)} <span className="text-xs font-normal text-slate-400 font-sans">/ 10</span>
              </motion.span>
              <motion.span
                key={`delta-${classAvg}-${selectedPeriod}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-mono ${isAvgUp ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700" : "bg-rose-50 dark:bg-rose-950 text-rose-700"}`}
              >
                {isAvgUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {isAvgUp ? `+${avgDelta}` : avgDelta}
              </motion.span>
            </div>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 font-sans">
              {periodMeta.unitLabel}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
        </motion.div>

        {/* KPI 2: Estimated Billing Monthly */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white/95 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Inflow Mensal (Caixa)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-850 dark:text-slate-100">
                R$ 195k
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 flex items-center gap-0.5">
                <ArrowUpRight className="w-2.5 h-2.5" />
                +5.4%
              </span>
            </div>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 font-sans">
              Arrecadação consolidada Junho
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </motion.div>

        {/* KPI 3: Defaulting / Inadimplência */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white/95 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Inadimplência Média
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-850 dark:text-slate-100">
                3.2%
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 flex items-center">
                Queda de -0.7%
              </span>
            </div>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 font-sans">
              Otimizado após renegociações
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-650 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </motion.div>

        {/* KPI 4: Total active students */}
        <motion.div
          whileHover={{ y: -3 }}
          className="bg-white/95 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Matrículas Ativas
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-850 dark:text-slate-100">
                420
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 flex items-center">
                Metas 2026 Batidas
              </span>
            </div>
            <p className="text-[10px] text-slate-550 dark:text-slate-400 font-sans">
              Sem abandonos reportados
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </motion.div>
      </div>

      {/* CHARTS GRID 1: PEDAGOGICAL METRICS */}
      <div className="space-y-4">
        {/* Pedagogical Class & Period Selector Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white/95 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl p-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Class buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Turma:
              </span>
              <div className="flex flex-wrap items-center gap-1">
                {classOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedClass(opt.id)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedClass === opt.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {opt.label.replace(" (Todas as Turmas)", "").replace(" Ensino", "")}
                  </button>
                ))}
              </div>
            </div>

            {/* Period buttons */}
            <div className="flex items-center gap-1.5 pl-0 lg:pl-3 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-2 lg:pt-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Período:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                {periodOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedPeriod(opt.id)}
                    className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                      selectedPeriod === opt.id
                        ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/80 dark:border-slate-700"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                    title={opt.desc}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Status:</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isAvgUp ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" : "bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
            }`}>
              {isAvgUp ? "▲ Rendimento Ascendente" : "▼ Atenção Necessária"}
              <span>({isAvgUp ? `+${avgDelta}` : avgDelta} {periodMeta.unitLabel})</span>
            </span>
          </div>
        </div>

        <motion.div
          key={`pedagogical-grid-${selectedClass}-${selectedPeriod}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Line Chart: Progress over cycle / period */}
          <div className="bg-white/95 dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <div>
                  <h4 className="font-serif font-black text-sm text-slate-850 dark:text-slate-100">
                    {periodMeta.chartTitle}
                  </h4>
                  <p className="text-[10px] text-slate-500">{periodMeta.chartSubtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                  {periodMeta.badgeLabel}
                </span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono hidden sm:inline">
                  {classOptions.find(c => c.id === selectedClass)?.label.replace(" (Todas as Turmas)", "")}
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full font-mono text-[10px]">
              <ResponsiveContainer key={`rc-line-${selectedClass}-${selectedPeriod}`} width="100%" height="100%">
                <LineChart
                  data={currentDataset}
                  margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="cycle" stroke="#94a3b8" />
                  <YAxis domain={[5, 10]} stroke="#94a3b8" />
                  <Tooltip content={<CustomPedagogicalTooltip period={selectedPeriod} />} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }} />
                  
                  <Line
                    type="monotone"
                    name="Média da Turma"
                    dataKey="average"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    activeDot={{ r: 7, stroke: "#1d4ed8", strokeWidth: 2 }}
                    dot={{ r: 4.5, strokeWidth: 2, fill: "#ffffff" }}
                    isAnimationActive={true}
                    animationDuration={950}
                    animationEasing="ease-out"
                    animationBegin={80}
                  />
                  <Line
                    type="monotone"
                    name="Meta Oficial (7.0)"
                    dataKey="target"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-out"
                    animationBegin={220}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Subject breakdown */}
          <div className="bg-white/95 dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm lg:col-span-5 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h4 className="font-serif font-black text-sm text-slate-850 dark:text-slate-100">
                  Desempenho por Matéria
                </h4>
                <p className="text-[10px] text-slate-500">
                  {selectedPeriod === "7d"
                    ? "Média de entregas e quizzes nos últimos 7 dias"
                    : selectedPeriod === "30d"
                    ? "Média de avaliações modulares nos últimos 30 dias"
                    : "Média consolidada do trimestre letivo (90 dias)"}
                </p>
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200/50 dark:border-slate-800">
                {periodMeta.label}
              </span>
            </div>

            <div className="h-64 sm:h-72 w-full font-mono text-[10px]">
              <ResponsiveContainer key={`rc-bar-${selectedClass}-${selectedPeriod}`} width="100%" height="100%">
                <BarChart
                  data={currentSubjects}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="subject" stroke="#94a3b8" />
                  <YAxis domain={[0, 10]} stroke="#94a3b8" />
                  <Tooltip content={<CustomSubjectTooltip period={selectedPeriod} />} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif' }} />
                  
                  <Bar
                    name="Média Nota"
                    dataKey="average"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={900}
                    animationEasing="ease-out"
                    animationBegin={120}
                  >
                    {currentSubjects.map((entry, index) => (
                      <Cell
                        key={`cell-sub-${index}`}
                        fill={entry.average >= 8.5 ? "#10b981" : entry.average >= 7.0 ? "#3b82f6" : "#f59e0b"}
                      />
                    ))}
                  </Bar>
                  <Bar
                    name="% Aprovados"
                    dataKey="passedRate"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    hide // Hide this from the primary bar viewport to focus on notes, but keep in dataset tooltip
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Supplemental Subject legend badges */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {currentSubjects.slice(0, 4).map((sub, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-850">
                  <span className="text-[10px] font-bold text-slate-650 dark:text-slate-400 truncate">{sub.subject}</span>
                  <span className="text-[11px] font-black text-emerald-600 font-mono">{sub.passedRate}% aprovação</span>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      </div>

      {/* SCATTER PLOT: REMATRÍCULA VS. ATRASOS FINANCEIROS (RISCO POR ESTUDANTE) */}
      <div id="section-scatter-rematricula-risco" className="bg-white/95 dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-black text-base text-slate-850 dark:text-slate-100 flex items-center gap-2">
                  Matriz de Dispersão: Taxa de Rematrícula vs. Histórico de Atrasos Financeiros
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cruzamento preditivo para diagnóstico precoce de risco de evasão escolar e inadimplência crônica por estudante
                </p>
              </div>
            </div>
          </div>

          {/* Quick Search & Class Filter */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* High Risk Highlight Action Button */}
            <button
              type="button"
              id="btn-toggle-high-risk-highlight"
              onClick={identifyAndHighlightHighRisk}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isHighRiskHighlightActive
                  ? "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/50 shadow-sm"
                  : "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800"
              }`}
              title="Identificar e realçar visualmente no gráfico os estudantes em risco crítico de evasão escolar (atraso > 15d e rematrícula < 75%)"
            >
              <ShieldAlert className={`w-3.5 h-3.5 ${isHighRiskHighlightActive ? "text-white animate-pulse" : "text-rose-500 dark:text-rose-300"}`} />
              <span>{isHighRiskHighlightActive ? "Desativar Realce" : "Realçar Alto Risco"}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-black ${
                isHighRiskHighlightActive ? "bg-white/20 text-white" : "bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-100"
              }`}>
                {highRiskStudentsInScope.length}
              </span>
            </button>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={scatterSearchQuery}
                onChange={(e) => setScatterSearchQuery(e.target.value)}
                placeholder="Buscar aluno ou responsável..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-44 sm:w-52"
              />
              {scatterSearchQuery && (
                <button
                  type="button"
                  onClick={() => setScatterSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Scope Badge */}
            <div className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              Escopo: <strong className="text-slate-800 dark:text-slate-200">{classOptions.find(c => c.id === activeScatterClassId)?.label.replace(" (Todas as Turmas)", "")}</strong>
            </div>
          </div>
        </div>

        {/* Filter Bar & Risk Tier Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1">Filtrar Risco:</span>
            
            <button
              type="button"
              onClick={() => setScatterTierFilter("all")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                scatterTierFilter === "all"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Todos ({scatterStats.total})
            </button>

            <button
              type="button"
              onClick={() => setScatterTierFilter("critical")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                scatterTierFilter === "critical"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Zona Crítica ({scatterStats.criticalCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setScatterTierFilter("warning_financial")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                scatterTierFilter === "warning_financial"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900 hover:bg-amber-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Inadimplência Transitória ({scatterStats.warningFinCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setScatterTierFilter("warning_pedagogical")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                scatterTierFilter === "warning_pedagogical"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Risco Pedagógico ({scatterStats.warningPedCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setScatterTierFilter("safe")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                scatterTierFilter === "safe"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Zona Segura ({scatterStats.safeCount})</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Exibindo <strong className="text-slate-800 dark:text-slate-200">{filteredScatterStudents.length}</strong> de {scatterStats.total} alunos
          </div>
        </div>

        {/* Action feedback message */}
        {actionFeedbackMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
            <span className="font-semibold">{actionFeedbackMessage}</span>
            <button
              type="button"
              onClick={() => setActionFeedbackMessage(null)}
              className="text-[11px] font-bold underline cursor-pointer ml-3"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Main Grid: Chart + Diagnostic Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Scatter Chart (Col 8) */}
          <div className="lg:col-span-8 bg-slate-50/70 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            
            {/* High Risk Evasion Alert & Navigation Bar */}
            {isHighRiskHighlightActive && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs animate-fade-in shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldAlert className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="font-bold text-rose-950 dark:text-rose-100 text-xs">
                        MODO REALCE: ALTO RISCO DE EVASÃO
                      </strong>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-200/90 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold">
                        {highRiskStudentsInScope.length} alunos identificados
                      </span>
                      <span className="text-[9.5px] font-mono text-rose-600 dark:text-rose-400">
                        (Atraso &gt; 15d • Rematrícula &lt; 75%)
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                      Pontos realçados com halos e anéis vermelhos pulsantes no gráfico. Receita anual sob risco:{" "}
                      <strong className="font-mono font-black text-rose-950 dark:text-rose-100">
                        R$ {highRiskStudentsInScope.reduce((a, s) => a + s.tuition * 12, 0).toLocaleString()}
                      </strong>
                    </p>
                  </div>
                </div>

                {/* Navigation Carousel for High Risk Students */}
                <div className="flex items-center gap-2 shrink-0">
                  {highRiskStudentsInScope.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-rose-200 dark:border-rose-900">
                      <button
                        type="button"
                        onClick={handleSelectPreviousHighRiskStudent}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                        title="Aluno de risco anterior"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 font-bold px-1 whitespace-nowrap">
                        {selectedScatterStudent && isStudentHighRisk(selectedScatterStudent)
                          ? `${highRiskStudentsInScope.findIndex((s) => s.id === selectedScatterStudent.id) + 1} de ${highRiskStudentsInScope.length}`
                          : `1 de ${highRiskStudentsInScope.length}`}
                      </span>

                      <button
                        type="button"
                        onClick={handleSelectNextHighRiskStudent}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                        title="Próximo aluno de risco"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setScatterTierFilter("critical");
                      setActiveAxisLegendTab("students");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    Filtrar Apenas Risco
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHighRiskHighlightActive(false)}
                    className="px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Desativar
                  </button>
                </div>
              </div>
            )}

            {/* Quadrant Legend Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block">Q1: Zona Segura</span>
                <span className="text-[9px] text-emerald-600/90 font-sans block">Atraso ≤ 15d • Remat ≥ 75%</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-200/70 dark:border-amber-900/60 text-amber-800 dark:text-amber-300">
                <span className="font-bold block">Q2: Inadimplente Leal</span>
                <span className="text-[9px] text-amber-600/90 font-sans block">Atraso &gt; 15d • Remat ≥ 75%</span>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                <span className="font-bold block">Q3: Risco Pedagógico</span>
                <span className="text-[9px] text-indigo-600/90 font-sans block">Atraso ≤ 15d • Remat &lt; 75%</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-200/70 dark:border-rose-900/60 text-rose-800 dark:text-rose-300">
                <span className="font-bold block">Q4: Zona Crítica</span>
                <span className="text-[9px] text-rose-600/90 font-sans block">Atraso &gt; 15d • Remat &lt; 75%</span>
              </div>
            </div>

            {/* Scatter Canvas */}
            <div className="h-80 sm:h-96 w-full font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.7} />
                  
                  <XAxis
                    type="number"
                    dataKey="delayDays"
                    name="Atraso Médio"
                    unit=" dias"
                    domain={[0, 48]}
                    tickCount={7}
                    stroke="#94a3b8"
                    label={{
                      value: "Histórico de Atrasos Financeiros (Dias Médios de Vencimento)",
                      position: "insideBottom",
                      offset: -16,
                      style: { fontSize: 10, fill: "#64748b", fontFamily: "sans-serif" }
                    }}
                  />
                  
                  <YAxis
                    type="number"
                    dataKey="reEnrollmentRate"
                    name="Taxa de Rematrícula"
                    unit="%"
                    domain={[20, 100]}
                    tickCount={6}
                    stroke="#94a3b8"
                    label={{
                      value: "Probabilidade / Taxa de Rematrícula (%)",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      style: { fontSize: 10, fill: "#64748b", fontFamily: "sans-serif" }
                    }}
                  />

                  <ZAxis type="number" dataKey="tuition" range={isHighRiskHighlightActive ? [90, 260] : [80, 240]} name="Mensalidade" />

                  <Tooltip content={<CustomScatterRiskTooltip />} />

                  {/* Reference Threshold Lines */}
                  <ReferenceLine
                    x={15}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Limiar Tolerância (15d)",
                      position: "top",
                      fill: "#ef4444",
                      fontSize: 10,
                      fontWeight: "bold"
                    }}
                  />

                  <ReferenceLine
                    y={75}
                    stroke="#3b82f6"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Meta Rematrícula (75%)",
                      position: "right",
                      fill: "#3b82f6",
                      fontSize: 10,
                      fontWeight: "bold"
                    }}
                  />

                  {/* High Risk Evasion Reference Area Highlight */}
                  {isHighRiskHighlightActive && (
                    <ReferenceArea
                      {...({
                        x1: 15,
                        x2: 48,
                        y1: 20,
                        y2: 75,
                        fill: "#f43f5e",
                        fillOpacity: 0.14,
                        stroke: "#ef4444",
                        strokeWidth: 1.5,
                        strokeDasharray: "4 4",
                        label: {
                          value: "⚠️ ZONA DE ALTO RISCO DE EVASÃO (Atraso > 15d • Remat < 75%)",
                          position: "insideTopLeft",
                          fill: "#be123c",
                          fontSize: 10,
                          fontWeight: "bold"
                        }
                      } as any)}
                    />
                  )}

                  <Scatter
                    name="Estudantes"
                    data={filteredScatterStudents}
                    shape={renderScatterNode}
                    onClick={(entry) => setSelectedScatterStudent(entry.payload || entry)}
                    cursor="pointer"
                    isAnimationActive={true}
                    animationDuration={950}
                    animationEasing="ease-out"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1.5 border-t border-slate-200/60 dark:border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAxisLegendTab("axes");
                    setActiveAxisBand("all");
                  }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowUpDown className="w-3 h-3 text-blue-500" />
                  <span>Eixo Y: Rematrícula (0-100%)</span>
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAxisLegendTab("axes");
                    setActiveAxisBand("all");
                  }}
                  className="hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowRightLeft className="w-3 h-3 text-rose-500" />
                  <span>Eixo X: Atrasos (0-48d)</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400">Clique nos pontos para detalhes do estudante</span>
            </div>
          </div>

          {/* Diagnostic & Interactive Legend Side Panel (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Retenção Média</span>
                <strong className="text-base font-mono font-black text-slate-900 dark:text-slate-100 block mt-0.5">
                  {scatterStats.avgRetention}%
                </strong>
                <span className="text-[10px] text-slate-500">Meta anual: 80%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Atraso Médio</span>
                <strong className="text-base font-mono font-black text-slate-900 dark:text-slate-100 block mt-0.5">
                  {scatterStats.avgDelay} dias
                </strong>
                <span className="text-[10px] text-slate-500">Tolerância: 15d</span>
              </div>
            </div>

            {/* Side Panel Tabs: Guia dos Eixos vs. Alunos & Foco vs. 4 Quadrantes */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveAxisLegendTab("axes")}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeAxisLegendTab === "axes"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs border border-slate-200/80 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Legenda dos Eixos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAxisLegendTab("students")}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeAxisLegendTab === "students"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs border border-slate-200/80 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Alunos & Foco</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAxisLegendTab("quadrants")}
                className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeAxisLegendTab === "quadrants"
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs border border-slate-200/80 dark:border-slate-700"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Quadrantes</span>
              </button>
            </div>

            {/* TAB 1: COMPONENTE DE LEGENDA INTERATIVA DOS EIXOS */}
            {activeAxisLegendTab === "axes" && (
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-4 text-xs animate-fade-in">
                
                {/* Legend Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 block">
                      Guia de Interpretação dos Eixos
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      O que cada dimensão representa
                    </h5>
                  </div>

                  {activeAxisBand !== "all" && (
                    <button
                      type="button"
                      onClick={() => setActiveAxisBand("all")}
                      className="px-2 py-1 text-[10px] font-mono font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 transition-all cursor-pointer"
                      title="Remover filtro de faixa do eixo"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Limpar Filtro</span>
                    </button>
                  )}
                </div>

                {/* EIXO Y: TAXA DE REMATRÍCULA */}
                <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <strong className="text-slate-800 dark:text-slate-200 text-xs font-serif">
                        Eixo Y (Vertical): Taxa de Rematrícula
                      </strong>
                    </div>
                    <span className="text-[9px] font-mono font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                      0% a 100%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    Representa o <strong>índice preditivo de permanência</strong> do estudante para o próximo ano letivo, projetado a partir de assiduidade escolar, engajamento familiar nos boletins e pesquisa de intenção.
                  </p>

                  <div className="pt-1.5 border-t border-slate-150 dark:border-slate-800 space-y-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                      Faixas Interpretativas (Clique para Filtrar):
                    </span>

                    {/* Band Y >= 75 */}
                    <button
                      type="button"
                      onClick={() => setActiveAxisBand(activeAxisBand === "y_high" ? "all" : "y_high")}
                      className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        activeAxisBand === "y_high"
                          ? "bg-emerald-500/15 border-emerald-500 dark:border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-2xs"
                          : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/70 dark:border-slate-800 hover:border-emerald-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-[11px] block">≥ 75% • Retenção Segura (Meta)</span>
                        <span className="text-[9.5px] text-slate-500 block leading-tight font-sans">Famílias fidelizadas com alta intenção de renovação.</span>
                      </div>
                      <span className="text-[10px] font-mono font-black shrink-0 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {axisCounts.yHigh} alunos
                      </span>
                    </button>

                    {/* Band Y 50-74 */}
                    <button
                      type="button"
                      onClick={() => setActiveAxisBand(activeAxisBand === "y_mid" ? "all" : "y_mid")}
                      className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        activeAxisBand === "y_mid"
                          ? "bg-amber-500/15 border-amber-500 dark:border-amber-500 text-amber-950 dark:text-amber-200 shadow-2xs"
                          : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/70 dark:border-slate-800 hover:border-amber-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-[11px] block">50% a 74% • Zona de Atenção</span>
                        <span className="text-[9.5px] text-slate-500 block leading-tight font-sans">Dúvidas sobre transição curricular, logística ou custos.</span>
                      </div>
                      <span className="text-[10px] font-mono font-black shrink-0 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {axisCounts.yMid} alunos
                      </span>
                    </button>

                    {/* Band Y < 50 */}
                    <button
                      type="button"
                      onClick={() => setActiveAxisBand(activeAxisBand === "y_low" ? "all" : "y_low")}
                      className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        activeAxisBand === "y_low"
                          ? "bg-rose-500/15 border-rose-500 dark:border-rose-500 text-rose-950 dark:text-rose-200 shadow-2xs"
                          : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/70 dark:border-slate-800 hover:border-rose-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-[11px] block">&lt; 50% • Risco Crítico de Evasão</span>
                        <span className="text-[9.5px] text-slate-500 block leading-tight font-sans">Famílias em vias de transferência. Ação imediata requerida.</span>
                      </div>
                      <span className="text-[10px] font-mono font-black shrink-0 px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                        {axisCounts.yLow} alunos
                      </span>
                    </button>
                  </div>
                </div>

                {/* EIXO X: HISTÓRICO DE ATRASOS FINANCEIROS */}
                <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      <strong className="text-slate-800 dark:text-slate-200 text-xs font-serif">
                        Eixo X (Horizontal): Histórico de Atrasos
                      </strong>
                    </div>
                    <span className="text-[9px] font-mono font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                      0 a 48 dias
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    Calcula a <strong>média móvel de dias de inadimplência</strong> entre a data estipulada de vencimento das parcelas escolares e a liquidação bancária das faturas no ano letivo.
                  </p>

                  <div className="pt-1.5 border-t border-slate-150 dark:border-slate-800 space-y-1.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
                      Faixas Interpretativas (Clique para Filtrar):
                    </span>

                    {/* Band X 0-5 */}
                    <button
                      type="button"
                      onClick={() => setActiveAxisBand(activeAxisBand === "x_safe" ? "all" : "x_safe")}
                      className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        activeAxisBand === "x_safe"
                          ? "bg-emerald-500/15 border-emerald-500 dark:border-emerald-500 text-emerald-950 dark:text-emerald-200 shadow-2xs"
                          : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/70 dark:border-slate-800 hover:border-emerald-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-[11px] block">0 a 5 dias • Adimplência Plena</span>
                        <span className="text-[9.5px] text-slate-500 block leading-tight font-sans">Pontualidade exemplar ou atraso técnico de compensação bancária.</span>
                      </div>
                      <span className="text-[10px] font-mono font-black shrink-0 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {axisCounts.xSafe} alunos
                      </span>
                    </button>

                    {/* Band X 6-15 */}
                    <button
                      type="button"
                      onClick={() => setActiveAxisBand(activeAxisBand === "x_warn" ? "all" : "x_warn")}
                      className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        activeAxisBand === "x_warn"
                          ? "bg-amber-500/15 border-amber-500 dark:border-amber-500 text-amber-950 dark:text-amber-200 shadow-2xs"
                          : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/70 dark:border-slate-800 hover:border-amber-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-[11px] block">6 a 15 dias • Tolerância Regular</span>
                        <span className="text-[9.5px] text-slate-500 block leading-tight font-sans">Oscilações salariais resolvidas no mesmo mês sem quebra de contrato.</span>
                      </div>
                      <span className="text-[10px] font-mono font-black shrink-0 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {axisCounts.xWarn} alunos
                      </span>
                    </button>

                    {/* Band X > 15 */}
                    <button
                      type="button"
                      onClick={() => setActiveAxisBand(activeAxisBand === "x_crit" ? "all" : "x_crit")}
                      className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        activeAxisBand === "x_crit"
                          ? "bg-rose-500/15 border-rose-500 dark:border-rose-500 text-rose-950 dark:text-rose-200 shadow-2xs"
                          : "bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/70 dark:border-slate-800 hover:border-rose-300 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-[11px] block">&gt; 15 dias • Inadimplência Crônica</span>
                        <span className="text-[9.5px] text-slate-500 block leading-tight font-sans">Acúmulo de encargos e risco elevado de perda do aluno.</span>
                      </div>
                      <span className="text-[10px] font-mono font-black shrink-0 px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                        {axisCounts.xCrit} alunos
                      </span>
                    </button>
                  </div>
                </div>

                {/* EIXO Z: PORTE DA MENSALIDADE */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs font-serif">
                      Eixo Z (Porte do Ponto): Valor do Contrato
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">R$ 1.450 a R$ 2.250</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed font-sans">
                    O diâmetro dos círculos é proporcional ao valor da anuidade/mensalidade. Círculos maiores representam contratos com maior peso financeiro no faturamento geral.
                  </p>
                </div>

              </div>
            )}

            {/* TAB 2: MATRIZ DOS 4 QUADRANTES */}
            {activeAxisLegendTab === "quadrants" && (
              <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 space-y-3 text-xs animate-fade-in">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-600 dark:text-rose-400 block">
                    Matriz Estratégica Bivariada
                  </span>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    Diretrizes de Ação por Quadrante
                  </h5>
                </div>

                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-850">
                    <strong className="text-emerald-800 dark:text-emerald-300 block text-[11px]">
                      Q1: Zona Segura (Alta Rematrícula + Baixo Atraso)
                    </strong>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Famílias promotoras. Ação: Enviar convite antecipado de pré-matrícula com desconto pontualidade e solicitar indicação de novos alunos (NPS).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-850">
                    <strong className="text-amber-800 dark:text-amber-300 block text-[11px]">
                      Q2: Inadimplente Leal (Alta Rematrícula + Alto Atraso)
                    </strong>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Família tem alto apego à escola, mas enfrenta restrição temporária de liquidez. Ação: Negociação preventiva amigável no Pix e ajuste na data de vencimento.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-850">
                    <strong className="text-indigo-800 dark:text-indigo-300 block text-[11px]">
                      Q3: Risco Pedagógico / Evasão Silenciosa (Baixa Rematrícula + Baixo Atraso)
                    </strong>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Família paga em dia, mas cogita sair por insatisfação pedagógica ou adaptação do aluno. Ação: Agendar reunião de escuta imediata com a coordenação pedagógica.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-850">
                    <strong className="text-rose-800 dark:text-rose-300 block text-[11px]">
                      Q4: Zona Crítica (Baixa Rematrícula + Alto Atraso)
                    </strong>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Evasão iminente combinada com inadimplência consolidada. Ação: Intervenção de diretoria mista (direção executiva + pedagógica) com plano de bolsa ou acordo estruturado.
                    </p>
                    <button
                      type="button"
                      onClick={identifyAndHighlightHighRisk}
                      className="mt-2 w-full py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10.5px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{isHighRiskHighlightActive ? "Desativar Realce no Gráfico" : "Realçar Alunos Q4 no Gráfico"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ESTUDANTES EM FOCO & LISTA PRIORITÁRIA */}
            {activeAxisLegendTab === "students" && (
              <div className="space-y-4 animate-fade-in">
                {/* Financial at Risk Banner */}
                <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-rose-700 dark:text-rose-400">
                      Receita Anual em Risco Crítico
                    </span>
                    <span className="text-[10px] font-mono font-black text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded">
                      {highRiskStudentsInScope.length} alunos
                    </span>
                  </div>
                  <strong className="text-lg font-mono font-black text-rose-800 dark:text-rose-200 block">
                    R$ {scatterStats.atRiskAnnualRevenue.toLocaleString()}
                  </strong>
                  <p className="text-[10px] text-rose-600/90 leading-tight">
                    Anuidades somadas de estudantes que combinam inadimplência crônica &gt;15 dias com probabilidade de rematrícula inferior a 75%.
                  </p>
                  <button
                    type="button"
                    onClick={identifyAndHighlightHighRisk}
                    className="mt-1 py-1 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer w-fit shadow-2xs"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    <span>{isHighRiskHighlightActive ? "Desativar Realce" : "Realçar Alunos de Alto Risco"}</span>
                  </button>
                </div>

                {/* Selected Student Card OR Priority List */}
                {selectedScatterStudent ? (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/60 dark:border-indigo-400 shadow-md space-y-3 animate-fade-in text-xs">
                    <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
                          Estudante em Foco
                        </span>
                        <h5 className="font-bold text-slate-900 dark:text-white text-sm">{selectedScatterStudent.name}</h5>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {selectedScatterStudent.className} • Resp: {selectedScatterStudent.responsibleName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedScatterStudent(null)}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                        title="Fechar foco"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] font-sans text-slate-400 block">Atraso Médio:</span>
                        <strong className={selectedScatterStudent.delayDays > 15 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                          {selectedScatterStudent.delayDays} dias
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-sans text-slate-400 block">Rematrícula:</span>
                        <strong className={selectedScatterStudent.reEnrollmentRate < 75 ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                          {selectedScatterStudent.reEnrollmentRate}%
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-sans text-slate-400 block">Média Acadêmica:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          {selectedScatterStudent.academicAverage.toFixed(1)} / 10
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] font-sans text-slate-400 block">Mensalidade:</span>
                        <strong className="text-slate-800 dark:text-slate-200">
                          R$ {selectedScatterStudent.tuition.toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-650 dark:text-slate-300 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
                      <strong className="text-[10px] uppercase font-mono text-amber-800 dark:text-amber-300 block mb-0.5">
                        Diagnóstico de Ação:
                      </strong>
                      {selectedScatterStudent.recommendedAction}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActionFeedbackMessage(`Contato prioritário registrado para ${selectedScatterStudent.name} (${selectedScatterStudent.responsibleName}). Notificação de acolhimento disparada via CRM.`);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-xs text-center"
                      >
                        Acionar CRM Preventivo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionFeedbackMessage(`Simulação de renegociação Pix sem juros gerada para ${selectedScatterStudent.responsibleName}. Link enviado.`);
                        }}
                        className="py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
                        title="Simular proposta financeira facilitada"
                      >
                        Renegociar Pix
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Priority Students Quick List */
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Estudantes Prioritários de Evasão
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Top Casos</span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {studentScatterData
                        .filter(s => (activeScatterClassId === "all" || s.classId === activeScatterClassId) && (s.riskTier === "critical" || s.riskTier === "warning_pedagogical"))
                        .slice(0, 5)
                        .map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedScatterStudent(item)}
                            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 cursor-pointer transition-all flex items-center justify-between gap-2"
                          >
                            <div className="truncate min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono truncate">{item.className} • Atraso {item.delayDays}d</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className={`text-[10px] font-mono font-black ${item.reEnrollmentRate < 50 ? "text-rose-600" : "text-amber-600"}`}>
                                {item.reEnrollmentRate}%
                              </span>
                              <span className="text-[8px] text-slate-400 block font-mono">rematrícula</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* CHARTS GRID 2: FINANCIAL METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Area/Bar Chart: Cash Flow */}
        <div className="bg-white/95 dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
            <div>
              <h4 className="font-serif font-black text-sm text-slate-850 dark:text-slate-100">
                Fluxo de Caixa Mensal Consolidado (1º Semestre)
              </h4>
              <p className="text-[10px] text-slate-500">Inflows (arrecadação das mensalidades) vs Outflows (folhas + operacional)</p>
            </div>
            
            {/* Legend indicators */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#10b981]" />
                <span className="text-[10px] text-slate-500">Receitas</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#ef4444]" />
                <span className="text-[10px] text-slate-500">Despesas</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyCashFlowData}
                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorInflows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  formatter={(value) => `R$ ${Number(value).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "12px",
                    border: "none",
                    color: "#f8fafc"
                  }}
                />
                
                <Area
                  type="monotone"
                  name="Receitas"
                  dataKey="inflows"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorInflows)"
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  animationBegin={80}
                />
                <Area
                  type="monotone"
                  name="Despesas"
                  dataKey="outflows"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOutflows)"
                  isAnimationActive={true}
                  animationDuration={1000}
                  animationEasing="ease-out"
                  animationBegin={220}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Payment Collection Status */}
        <div className="bg-white/95 dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm lg:col-span-4 space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="font-serif font-black text-sm text-slate-850 dark:text-slate-100">
              Eficácia de Cobrança
            </h4>
            <p className="text-[10px] text-slate-500">Status de liquidação de mensalidades do mês atual</p>
          </div>

          <div className="h-44 sm:h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={1100}
                  animationEasing="ease-out"
                  animationBegin={150}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}% das faturas`} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner absolute content */}
            <div className="absolute text-center">
              <span className="text-xl font-black text-[#423326] dark:text-white block">91.2%</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Liquidez</span>
            </div>
          </div>

          {/* Pie chart legends list */}
          <div className="space-y-2 pt-1">
            {paymentStatusData.map((item, index) => (
              <div key={index} className="flex items-start justify-between text-xs border-b border-slate-50 dark:border-slate-850 pb-1.5 last:border-none">
                <div className="flex gap-2 items-center">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block leading-tight">{item.name}</span>
                    <span className="text-[8.5px] text-slate-400 block leading-none">{item.desc}</span>
                  </div>
                </div>
                <span className="font-mono font-black text-slate-800 dark:text-slate-200">{item.value}%</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* WIDGET: INADIMPLÊNCIA POR CLASSE (B2B FINANCEIRO) */}
      <div id="widget-inadimplencia-classes" className="bg-white/95 dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
          <div className="space-y-0.5">
            <span className="bg-rose-500/10 dark:bg-rose-950 text-rose-700 dark:text-rose-400 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider">
              Controle de Adimplência ERP
            </span>
            <h4 className="font-serif font-black text-sm text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
              ⚠️ Inadimplência Total por Classe vs. Meta do ERP
            </h4>
            <p className="text-[10px] text-slate-500">
              Comparação direta entre as metas de recebimento faturadas pelo ERP escolar e os valores efetivamente liquidados pelas famílias neste mês.
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-xs self-start sm:self-center font-mono">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#6366f1]" />
              <span className="text-[10px] text-slate-500 font-sans">Meta de Faturamento (ERP)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#10b981]" />
              <span className="text-[10px] text-slate-500 font-sans">Valor Efetivamente Liquidado</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Chart Section */}
          <div className="lg:col-span-7 h-64 sm:h-72 w-full font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { className: "1º Ano EF", Meta: 85000, Liquidado: 82500 },
                  { className: "5º Ano EF", Meta: 92000, Liquidado: 85100 },
                  { className: "9º Ano EF", Meta: 104000, Liquidado: 93600 },
                  { className: "3º Ano EM", Meta: 120000, Liquidado: 116400 }
                ]}
                margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="className" stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `R$ ${v/1000}k`} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value) => `R$ ${Number(value).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "12px",
                    border: "none",
                    color: "#f8fafc"
                  }}
                />
                <Legend />
                <Bar
                  name="Meta ERP (Faturamento)"
                  dataKey="Meta"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={950}
                  animationEasing="ease-out"
                  animationBegin={100}
                />
                <Bar
                  name="Liquidado (Efetivo)"
                  dataKey="Liquidado"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={950}
                  animationEasing="ease-out"
                  animationBegin={220}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown / Warning Section */}
          <div className="lg:col-span-5 space-y-3">
            <h5 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider font-mono">Destaques e Análise de Turmas</h5>
            <div className="space-y-2.5">
              {[
                { name: "1º Ano Ensino Fundamental", meta: 85000, liquidado: 82500, rate: 2.9, delay: 2550, label: "🟢 Adimplência Saudável" },
                { name: "5º Ano Ensino Fundamental", meta: 92000, liquidado: 85100, rate: 7.5, delay: 6900, label: "🟡 Atraso Moderado (Revisar)" },
                { name: "9º Ano Ensino Fundamental", meta: 104000, liquidado: 93600, rate: 10.0, delay: 10400, label: "🔴 ALTA INADIMPLÊNCIA (Crítico)" },
                { name: "3º Ano Ensino Médio", meta: 120000, liquidado: 116400, rate: 3.0, delay: 3600, label: "🟢 Adimplência Saudável" }
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-2xl border flex flex-col gap-1.5 transition-all ${
                  item.rate >= 10.0 ? "bg-rose-50/40 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900" :
                  item.rate >= 5.0 ? "bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900" :
                  "bg-slate-50/50 dark:bg-slate-950/30 border-slate-100 dark:border-slate-850"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate pr-2">{item.name}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      item.rate >= 10.0 ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400" :
                      item.rate >= 5.0 ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    }`}>
                      {item.rate.toFixed(1)}% atraso
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="text-slate-500">
                      Meta: <span className="font-bold text-slate-700 dark:text-slate-300">R$ {item.meta.toLocaleString()}</span>
                    </div>
                    <div className="text-slate-500">
                      Liquidado: <span className="font-bold text-slate-700 dark:text-slate-300">R$ {item.liquidado.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-150/50 dark:border-slate-800/80 pt-1.5 mt-0.5">
                    <span className="text-slate-400 italic">{item.label}</span>
                    <span className={`font-black ${item.rate >= 5.0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500"}`}>
                      Deficit: R$ {item.delay.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* D3 CORRELATION ENGINE: COMUNICADOS ENVIADOS VS TAXA DE INTERAÇÃO DAS FAMÍLIAS */}
      <D3CorrelationChart />

      {/* QUICK INSIGHTS & EXECUTIONS BANNER */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/85 p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center flex-none">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h5 className="font-black text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">Inisghts Inteligentes Recomendados</h5>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 font-sans mt-0.5">
              O índice de inadimplência reduziu <strong>18%</strong> após a ativação do módulo de renegociação financeira parcelada no Pix. O engajamento com os boletins aumentou em <strong>42%</strong>.
            </p>
          </div>
        </div>
        <div className="bg-amber-100/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 px-3.5 py-2 rounded-2xl text-[10.5px] font-extrabold flex items-center gap-1 border border-amber-200/50 dark:border-amber-900/60 select-none shrink-0 self-end md:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Controle Operacional Eficiente</span>
        </div>
      </div>

      {/* Export feedback toast */}
      {showExportToast && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>✓ Planilha consolidada de Relatório de Métricas exportada com sucesso!</span>
        </div>
      )}
    </div>
  );
}
