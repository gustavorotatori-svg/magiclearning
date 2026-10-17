import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { motion } from "motion/react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ReferenceArea
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Calendar,
  Filter,
  Info,
  Activity,
  Zap,
  BarChart2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Users,
  DollarSign,
  Search,
  ShieldAlert,
  PhoneCall,
  Check,
  Send,
  HelpCircle,
  Compass,
  ArrowUpDown,
  ArrowRightLeft
} from "lucide-react";

// -------------------------------------------------------------
// D3 DATA TYPES (Volume de Comunicados vs Interação Diária)
// -------------------------------------------------------------
export interface DailyCorrelationPoint {
  dayIndex: number; // 1 to 30
  dateStr: string; // "01/Jul"
  fullDateStr: string; // "2026-07-01"
  announcementsCount: number; // e.g. 1 - 8
  interactionRate: number; // e.g. 42% - 96%
  totalInteractions: number; // e.g. 120 - 480
  topCategory: string; // "Pedagógico", "Eventos", "Aviso Urgente", "Rotina"
  categoryBreakdown: {
    pedagogico: number;
    eventos: number;
    urgente: number;
    geral: number;
  };
}

// -------------------------------------------------------------
// RECHARTS DATA TYPES (Frequência de Leitura vs Inadimplência)
// -------------------------------------------------------------
export type RiskTier = "safe" | "warning_read" | "warning_finance" | "critical";

export interface EngagementFinancialDataPoint {
  id: string;
  name: string; // Turma / Coorte
  segment: "Infantil" | "Fundamental I" | "Fundamental II" | "Médio";
  readRate: number; // Eixo X: Frequência de Leitura dos Comunicados (%)
  defaultRate: number; // Eixo Y: Taxa de Inadimplência Financeira (%)
  avgResponseTimeHours: number; // Tempo médio até abertura do comunicado (horas)
  totalFamilies: number; // Eixo Z: Total de responsáveis na turma
  annualRevenueAtRisk: number; // Valor financeiro em aberto (R$)
  openInvoicesCount: number; // Boletos em atraso
  riskTier: RiskTier;
  actionRecommendation: string;
}

// Generate deterministic 30 days dataset with realistic correlation for D3
function generate30DaysData(): DailyCorrelationPoint[] {
  const categories = ["Pedagógico", "Eventos", "Aviso Urgente", "Rotina"];
  const baseDates: DailyCorrelationPoint[] = [];
  const startDate = new Date(2026, 6, 1); // July 1, 2026

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

    let count = isWeekend
      ? Math.floor(Math.random() * 2) + 1
      : Math.floor(Math.random() * 4) + 2;

    if (i === 7 || i === 18 || i === 25) {
      count = 7;
    }

    let rate = 50 + count * 6.5 + (Math.sin(i / 2) * 8);
    if (count >= 7) rate -= 8;
    rate = Math.min(98, Math.max(35, Math.round(rate * 10) / 10));

    const totalInteractions = Math.round(count * rate * 1.8 + 120);
    const dayPad = String(currentDate.getDate()).padStart(2, "0");
    const monthPad = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dateStr = `${dayPad}/${monthPad}`;
    const fullDateStr = `${currentDate.getFullYear()}-${monthPad}-${dayPad}`;
    const catIndex = (i + count) % categories.length;

    baseDates.push({
      dayIndex: i + 1,
      dateStr,
      fullDateStr,
      announcementsCount: count,
      interactionRate: rate,
      totalInteractions,
      topCategory: categories[catIndex],
      categoryBreakdown: {
        pedagogico: Math.ceil(count * 0.4),
        eventos: Math.floor(count * 0.3),
        urgente: count > 5 ? 2 : 0,
        geral: Math.max(1, Math.floor(count * 0.3))
      }
    });
  }

  return baseDates;
}

// Dataset: Frequência de Leitura dos Comunicados vs. Inadimplência Financeira por Turma / Coorte
export const mockEngagementFinancialData: EngagementFinancialDataPoint[] = [
  {
    id: "ef-01",
    name: "1º Ano A (Integral)",
    segment: "Fundamental I",
    readRate: 96,
    defaultRate: 1.5,
    avgResponseTimeHours: 1.8,
    totalFamilies: 28,
    annualRevenueAtRisk: 1200,
    openInvoicesCount: 1,
    riskTier: "safe",
    actionRecommendation: "Engajamento exemplar. Manter envio regular de fotos e boletins semanais."
  },
  {
    id: "ef-02",
    name: "1º Ano B (Manhã)",
    segment: "Fundamental I",
    readRate: 92,
    defaultRate: 2.2,
    avgResponseTimeHours: 2.5,
    totalFamilies: 30,
    annualRevenueAtRisk: 1950,
    openInvoicesCount: 1,
    riskTier: "safe",
    actionRecommendation: "Alta lealdade. Famílias respondem prontamente às autorizações e comunicados."
  },
  {
    id: "ef-03",
    name: "2º Ano A (Manhã)",
    segment: "Fundamental I",
    readRate: 89,
    defaultRate: 2.8,
    avgResponseTimeHours: 3.1,
    totalFamilies: 27,
    annualRevenueAtRisk: 2100,
    openInvoicesCount: 2,
    riskTier: "safe",
    actionRecommendation: "Padrão de adimplência saudável e boa recepção das mensagens do diário."
  },
  {
    id: "ef-04",
    name: "2º Ano B (Tarde)",
    segment: "Fundamental I",
    readRate: 85,
    defaultRate: 3.4,
    avgResponseTimeHours: 4.2,
    totalFamilies: 29,
    annualRevenueAtRisk: 2900,
    openInvoicesCount: 2,
    riskTier: "safe",
    actionRecommendation: "Atrasos irrelevantes de compensação. Fluxo de comunicação normal."
  },
  {
    id: "ef-05",
    name: "3º Ano A (Manhã)",
    segment: "Fundamental I",
    readRate: 87,
    defaultRate: 3.1,
    avgResponseTimeHours: 3.5,
    totalFamilies: 31,
    annualRevenueAtRisk: 2800,
    openInvoicesCount: 2,
    riskTier: "safe",
    actionRecommendation: "Excelente canal com os representantes de turma. Continuidade garantida."
  },
  {
    id: "ef-06",
    name: "3º Ano B (Tarde)",
    segment: "Fundamental I",
    readRate: 81,
    defaultRate: 4.6,
    avgResponseTimeHours: 5.0,
    totalFamilies: 26,
    annualRevenueAtRisk: 3600,
    openInvoicesCount: 3,
    riskTier: "safe",
    actionRecommendation: "Leitura consolidada dentro da meta institucional de 70%."
  },
  {
    id: "ef-07",
    name: "4º Ano A (Manhã)",
    segment: "Fundamental I",
    readRate: 84,
    defaultRate: 4.2,
    avgResponseTimeHours: 4.5,
    totalFamilies: 32,
    annualRevenueAtRisk: 3900,
    openInvoicesCount: 3,
    riskTier: "safe",
    actionRecommendation: "Boa resposta às notificações push no smartphone."
  },
  {
    id: "ef-08",
    name: "4º Ano B (Tarde)",
    segment: "Fundamental I",
    readRate: 78,
    defaultRate: 5.5,
    avgResponseTimeHours: 6.2,
    totalFamilies: 28,
    annualRevenueAtRisk: 4500,
    openInvoicesCount: 4,
    riskTier: "warning_finance",
    actionRecommendation: "Famílias engajadas mas com oscilação no fechamento bancário. Ofertar Pix recorrente."
  },
  {
    id: "ef-09",
    name: "5º Ano A (Bilíngue)",
    segment: "Fundamental I",
    readRate: 91,
    defaultRate: 2.5,
    avgResponseTimeHours: 2.9,
    totalFamilies: 30,
    annualRevenueAtRisk: 2250,
    openInvoicesCount: 2,
    riskTier: "safe",
    actionRecommendation: "Comunidade engajada no aplicativo. Pré-matrícula antecipada confirmada."
  },
  {
    id: "ef-10",
    name: "5º Ano B (Regular)",
    segment: "Fundamental I",
    readRate: 74,
    defaultRate: 6.2,
    avgResponseTimeHours: 7.5,
    totalFamilies: 32,
    annualRevenueAtRisk: 5800,
    openInvoicesCount: 4,
    riskTier: "warning_finance",
    actionRecommendation: "Monitorar débitos pontuais com envio de resumo financeiro amigável no WhatsApp."
  },
  {
    id: "ef-11",
    name: "6º Ano A (Manhã)",
    segment: "Fundamental II",
    readRate: 79,
    defaultRate: 5.1,
    avgResponseTimeHours: 5.8,
    totalFamilies: 34,
    annualRevenueAtRisk: 5100,
    openInvoicesCount: 4,
    riskTier: "warning_finance",
    actionRecommendation: "Transição para Fundamental II com boa adaptação familiar."
  },
  {
    id: "ef-12",
    name: "6º Ano B (Tarde)",
    segment: "Fundamental II",
    readRate: 63,
    defaultRate: 11.8,
    avgResponseTimeHours: 12.4,
    totalFamilies: 33,
    annualRevenueAtRisk: 11800,
    openInvoicesCount: 8,
    riskTier: "critical",
    actionRecommendation: "Queda na leitura precede atrasos de mensalidades. Agendar plantão de alinhamento."
  },
  {
    id: "ef-13",
    name: "7º Ano A (Manhã)",
    segment: "Fundamental II",
    readRate: 72,
    defaultRate: 6.9,
    avgResponseTimeHours: 8.1,
    totalFamilies: 35,
    annualRevenueAtRisk: 7200,
    openInvoicesCount: 5,
    riskTier: "warning_finance",
    actionRecommendation: "Inadimplência intermediária com boa receptividade a acordos parcelados."
  },
  {
    id: "ef-14",
    name: "7º Ano B (Tarde)",
    segment: "Fundamental II",
    readRate: 58,
    defaultRate: 14.2,
    avgResponseTimeHours: 15.6,
    totalFamilies: 31,
    annualRevenueAtRisk: 13200,
    openInvoicesCount: 9,
    riskTier: "critical",
    actionRecommendation: "Alto percentual de comunicados não lidos. Ativar canal alternativo SMS/WhatsApp."
  },
  {
    id: "ef-15",
    name: "8º Ano A (Manhã)",
    segment: "Fundamental II",
    readRate: 69,
    defaultRate: 8.1,
    avgResponseTimeHours: 9.5,
    totalFamilies: 33,
    annualRevenueAtRisk: 8000,
    openInvoicesCount: 6,
    riskTier: "warning_finance",
    actionRecommendation: "Leitura limítrofe. Reforçar avisos com banners visuais no portal."
  },
  {
    id: "ef-16",
    name: "8º Ano B (Tarde)",
    segment: "Fundamental II",
    readRate: 51,
    defaultRate: 16.5,
    avgResponseTimeHours: 18.2,
    totalFamilies: 29,
    annualRevenueAtRisk: 14500,
    openInvoicesCount: 10,
    riskTier: "critical",
    actionRecommendation: "Desengajamento crônico da comunicação. Enviar alerta de cobrança preventivo à diretoria."
  },
  {
    id: "ef-17",
    name: "9º Ano A (Avançado)",
    segment: "Fundamental II",
    readRate: 93,
    defaultRate: 1.8,
    avgResponseTimeHours: 2.1,
    totalFamilies: 36,
    annualRevenueAtRisk: 2200,
    openInvoicesCount: 2,
    riskTier: "safe",
    actionRecommendation: "Famílias atentas à preparação para o Ensino Médio. Retenção assegurada."
  },
  {
    id: "ef-18",
    name: "9º Ano B (Regular)",
    segment: "Fundamental II",
    readRate: 46,
    defaultRate: 18.9,
    avgResponseTimeHours: 21.0,
    totalFamilies: 32,
    annualRevenueAtRisk: 18200,
    openInvoicesCount: 11,
    riskTier: "critical",
    actionRecommendation: "Grave descompasso entre avisos e leitura. Risco elevado de evasão ao fim do 9º Ano."
  },
  {
    id: "ef-19",
    name: "1º Ano EM - Alpha",
    segment: "Médio",
    readRate: 82,
    defaultRate: 4.5,
    avgResponseTimeHours: 4.8,
    totalFamilies: 35,
    annualRevenueAtRisk: 4900,
    openInvoicesCount: 3,
    riskTier: "safe",
    actionRecommendation: "Novo Ensino Médio com boa aderência das famílias aos itinerários formativos."
  },
  {
    id: "ef-20",
    name: "1º Ano EM - Beta",
    segment: "Médio",
    readRate: 55,
    defaultRate: 15.4,
    avgResponseTimeHours: 16.4,
    totalFamilies: 30,
    annualRevenueAtRisk: 13800,
    openInvoicesCount: 9,
    riskTier: "critical",
    actionRecommendation: "Inadimplência de três parcelas. Solicitar atendimento presencial com a tesouraria."
  },
  {
    id: "ef-21",
    name: "2º Ano EM - Exatas",
    segment: "Médio",
    readRate: 86,
    defaultRate: 3.8,
    avgResponseTimeHours: 3.9,
    totalFamilies: 34,
    annualRevenueAtRisk: 4100,
    openInvoicesCount: 3,
    riskTier: "safe",
    actionRecommendation: "Famílias com alto engajamento em simulados e notas pedagógicas."
  },
  {
    id: "ef-22",
    name: "2º Ano EM - Humanas",
    segment: "Médio",
    readRate: 42,
    defaultRate: 20.5,
    avgResponseTimeHours: 24.5,
    totalFamilies: 28,
    annualRevenueAtRisk: 17200,
    openInvoicesCount: 12,
    riskTier: "critical",
    actionRecommendation: "Alunos com baixa frequência nos comunicados e pendências de rematrícula."
  },
  {
    id: "ef-23",
    name: "3º Ano EM - Medicina/Vestibular",
    segment: "Médio",
    readRate: 95,
    defaultRate: 1.2,
    avgResponseTimeHours: 1.5,
    totalFamilies: 38,
    annualRevenueAtRisk: 1800,
    openInvoicesCount: 1,
    riskTier: "safe",
    actionRecommendation: "Fidelização máxima. Leitura quase instantânea de relatórios de desempenho."
  },
  {
    id: "ef-24",
    name: "3º Ano EM - Noturno/EJA",
    segment: "Médio",
    readRate: 39,
    defaultRate: 22.8,
    avgResponseTimeHours: 26.0,
    totalFamilies: 27,
    annualRevenueAtRisk: 18500,
    openInvoicesCount: 14,
    riskTier: "critical",
    actionRecommendation: "Prioridade máxima de renegociação: oferecer plano de parcelamento sem juros no cartão."
  }
];

// Tooltip para o Gráfico de Dispersão Recharts (Leitura vs Inadimplência)
const CustomEngagementFinancialTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (active && payload && payload.length) {
    const data: EngagementFinancialDataPoint = payload[0]?.payload;
    if (!data) return null;

    const tierLabels = {
      safe: { label: "Q1: Zona Modelo (Saudável)", color: "text-emerald-400", bg: "bg-emerald-950/80 border-emerald-800" },
      critical: { label: "Q2: Risco Crítico de Evasão", color: "text-rose-400", bg: "bg-rose-950/80 border-rose-800" },
      warning_finance: { label: "Q3: Inadimplente Engajado", color: "text-amber-400", bg: "bg-amber-950/80 border-amber-800" },
      warning_read: { label: "Q4: Desengajamento Silencioso", color: "text-sky-400", bg: "bg-sky-950/80 border-sky-800" }
    };
    const tier = tierLabels[data.riskTier] || tierLabels.safe;

    return (
      <div className="bg-slate-900/95 dark:bg-slate-950 text-white p-3.5 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md font-sans text-xs min-w-[260px] max-w-[300px] space-y-2.5 transition-all pointer-events-none z-50">
        <div className="flex items-start justify-between border-b border-slate-700/60 pb-2">
          <div>
            <h5 className="font-bold text-slate-100 text-sm">{data.name}</h5>
            <p className="text-[10px] text-slate-400 font-mono">{data.segment} • {data.totalFamilies} famílias</p>
          </div>
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${tier.bg} ${tier.color}`}>
            {tier.label.split(":")[0]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-800/50 p-2 rounded-xl">
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Freq. Leitura</span>
            <strong className={`text-xs ${data.readRate >= 70 ? "text-emerald-400" : "text-rose-400"}`}>
              {data.readRate}%
            </strong>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Inadimplência</span>
            <strong className={`text-xs ${data.defaultRate <= 5 ? "text-emerald-400" : "text-rose-400"}`}>
              {data.defaultRate.toFixed(1)}%
            </strong>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Tempo de Leitura</span>
            <strong className="text-xs text-slate-200">
              ~{data.avgResponseTimeHours}h após envio
            </strong>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block font-sans">Receita em Risco</span>
            <strong className="text-xs text-amber-300">
              R$ {data.annualRevenueAtRisk.toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="text-[10.5px] leading-relaxed pt-1 border-t border-slate-800 text-slate-300">
          <strong className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">Diretriz Recomendada:</strong>
          <span>{data.actionRecommendation}</span>
        </div>
      </div>
    );
  }
  return null;
};

export interface D3CorrelationChartProps {
  initialMode?: "combo" | "scatter" | "recharts_financial";
}

export const D3CorrelationChart: React.FC<D3CorrelationChartProps> = ({
  initialMode = "recharts_financial"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // States
  const [data] = useState<DailyCorrelationPoint[]>(generate30DaysData());
  const [financialData] = useState<EngagementFinancialDataPoint[]>(mockEngagementFinancialData);
  const [viewMode, setViewMode] = useState<"combo" | "scatter" | "recharts_financial">(initialMode);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("todas");
  const [dayRangeFilter, setDayRangeFilter] = useState<number>(30); // 7, 15, 30
  const [hoveredPoint, setHoveredPoint] = useState<DailyCorrelationPoint | null>(null);

  // Recharts Scatter filters and selection state
  const [financialSegmentFilter, setFinancialSegmentFilter] = useState<string>("todos");
  const [financialRiskFilter, setFinancialRiskFilter] = useState<string>("todos");
  const [financialSearchQuery, setFinancialSearchQuery] = useState<string>("");
  const [selectedFinancialPoint, setSelectedFinancialPoint] = useState<EngagementFinancialDataPoint | null>(null);
  const [actionToastMessage, setActionToastMessage] = useState<string | null>(null);

  // Filtered D3 dataset
  const filteredData = useMemo(() => {
    let sliced = data.slice(30 - dayRangeFilter);
    if (selectedCategoryFilter !== "todas") {
      sliced = sliced.filter(
        (d) => d.topCategory.toLowerCase() === selectedCategoryFilter.toLowerCase()
      );
    }
    return sliced;
  }, [data, dayRangeFilter, selectedCategoryFilter]);

  // Filtered Recharts Engagement-Financial dataset
  const filteredFinancialData = useMemo(() => {
    return financialData.filter((item) => {
      if (financialSegmentFilter !== "todos" && item.segment !== financialSegmentFilter) {
        return false;
      }
      if (financialRiskFilter !== "todos" && item.riskTier !== financialRiskFilter) {
        return false;
      }
      if (financialSearchQuery.trim()) {
        const q = financialSearchQuery.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.segment.toLowerCase().includes(q);
      }
      return true;
    });
  }, [financialData, financialSegmentFilter, financialRiskFilter, financialSearchQuery]);

  // Pearson Correlation Coefficient calculation for D3
  const correlationStats = useMemo(() => {
    if (filteredData.length < 2) {
      return { r: 0, rSquared: 0, interpretation: "Dados insuficientes", slope: 0, intercept: 0, avgVolume: "0.0", avgRate: "0.0", maxRatePoint: null };
    }

    const n = filteredData.length;
    const x = filteredData.map((d) => d.announcementsCount);
    const y = filteredData.map((d) => d.interactionRate);

    const sumX = d3.sum(x);
    const sumY = d3.sum(y);
    const sumX2 = d3.sum(x, (d: number) => d * d);
    const sumY2 = d3.sum(y, (d: number) => d * d);
    const sumXY = d3.sum(filteredData, (d: DailyCorrelationPoint) => d.announcementsCount * d.interactionRate);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = denominator === 0 ? 0 : numerator / denominator;
    const rSquared = r * r;

    const meanX = sumX / n;
    const meanY = sumY / n;
    const slope =
      sumX2 - n * meanX * meanX === 0
        ? 0
        : (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
    const intercept = meanY - slope * meanX;

    let interpretation = "Correlação Neutra";
    if (r > 0.7) interpretation = "Forte Correlação Positiva 🚀";
    else if (r > 0.4) interpretation = "Moderada Correlação Positiva 📈";
    else if (r > 0) interpretation = "Leve Correlação Positiva 🔹";
    else if (r < -0.4) interpretation = "Correlação Negativa (Saturação) ⚠️";

    const avgVolume = (sumX / n).toFixed(1);
    const avgRate = (sumY / n).toFixed(1);
    const maxRatePoint = [...filteredData].sort((a, b) => b.interactionRate - a.interactionRate)[0];

    return {
      r: Math.round(r * 100) / 100,
      rSquared: Math.round(rSquared * 100) / 100,
      interpretation,
      slope,
      intercept,
      avgVolume,
      avgRate,
      maxRatePoint
    };
  }, [filteredData]);

  // Statistical calculations for Recharts Scatter (Frequência de Leitura vs. Inadimplência)
  const financialStats = useMemo(() => {
    if (filteredFinancialData.length < 2) {
      return {
        r: 0,
        rSquared: 0,
        interpretation: "Dados insuficientes",
        avgReadRate: "0.0",
        avgDefaultRate: "0.0",
        totalRevenueAtRisk: 0,
        totalFamilies: 0,
        avgDefaultHighRead: "0.0",
        avgDefaultLowRead: "0.0"
      };
    }

    const n = filteredFinancialData.length;
    const x = filteredFinancialData.map((d) => d.readRate);
    const y = filteredFinancialData.map((d) => d.defaultRate);

    const sumX = d3.sum(x);
    const sumY = d3.sum(y);
    const sumX2 = d3.sum(x, (d: number) => d * d);
    const sumY2 = d3.sum(y, (d: number) => d * d);
    const sumXY = d3.sum(filteredFinancialData, (d: EngagementFinancialDataPoint) => d.readRate * d.defaultRate);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = denominator === 0 ? 0 : numerator / denominator;
    const rSquared = r * r;

    const avgReadRate = (sumX / n).toFixed(1);
    const avgDefaultRate = (sumY / n).toFixed(1);
    const totalRevenueAtRisk = filteredFinancialData.reduce((acc, d) => acc + d.annualRevenueAtRisk, 0);
    const totalFamilies = filteredFinancialData.reduce((acc, d) => acc + d.totalFamilies, 0);

    const highReadGroup = filteredFinancialData.filter((d) => d.readRate >= 70);
    const lowReadGroup = filteredFinancialData.filter((d) => d.readRate < 70);

    const avgDefaultHighRead = highReadGroup.length > 0
      ? (highReadGroup.reduce((a, b) => a + b.defaultRate, 0) / highReadGroup.length).toFixed(1)
      : "0.0";
    const avgDefaultLowRead = lowReadGroup.length > 0
      ? (lowReadGroup.reduce((a, b) => a + b.defaultRate, 0) / lowReadGroup.length).toFixed(1)
      : "0.0";

    return {
      r: Math.round(r * 100) / 100,
      rSquared: Math.round(rSquared * 100) / 100,
      interpretation: r < -0.6 ? "Forte Correlação Inversa (Leitura Previne Inadimplência) 🛡️" : "Correlação Inversa Moderada",
      avgReadRate,
      avgDefaultRate,
      totalRevenueAtRisk,
      totalFamilies,
      avgDefaultHighRead,
      avgDefaultLowRead
    };
  }, [filteredFinancialData]);

  // Render D3 Chart dynamically on SVG
  useEffect(() => {
    if (viewMode === "recharts_financial") return;
    if (!svgRef.current || !containerRef.current || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const containerWidth = containerRef.current.clientWidth || 700;
    const width = containerWidth;
    const height = 360;
    const margin = { top: 25, right: 35, bottom: 40, left: 45 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    chartGroup
      .append("g")
      .attr("class", "grid")
      .attr("opacity", 0.08)
      .call(d3.axisLeft(d3.scaleLinear().domain([0, 100]).range([innerHeight, 0])).tickSize(-innerWidth).tickFormat(() => ""));

    if (viewMode === "combo") {
      const xScale = d3
        .scaleBand()
        .domain(filteredData.map((d) => d.dateStr))
        .range([0, innerWidth])
        .padding(0.28);

      const maxAnnouncements = d3.max(filteredData, (d: DailyCorrelationPoint) => d.announcementsCount) || 8;

      const yAnnouncementsScale = d3
        .scaleLinear()
        .domain([0, maxAnnouncements])
        .nice()
        .range([innerHeight, 0]);

      const yInteractionScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([innerHeight, 0]);

      chartGroup
        .selectAll(".bar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d: any) => xScale(d.dateStr) || 0)
        .attr("y", (d: any) => yAnnouncementsScale(d.announcementsCount))
        .attr("width", xScale.bandwidth())
        .attr("height", (d: any) => innerHeight - yAnnouncementsScale(d.announcementsCount))
        .attr("fill", "#6366f1")
        .attr("rx", 3)
        .attr("opacity", 0.85);

      const lineGenerator = d3
        .line<DailyCorrelationPoint>()
        .x((d) => (xScale(d.dateStr) || 0) + xScale.bandwidth() / 2)
        .y((d) => yInteractionScale(d.interactionRate))
        .curve(d3.curveMonotoneX);

      chartGroup
        .append("path")
        .datum(filteredData)
        .attr("fill", "none")
        .attr("stroke", "#10b981")
        .attr("stroke-width", 2.5)
        .attr("d", lineGenerator);

      chartGroup
        .selectAll(".dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", (d: any) => (xScale(d.dateStr) || 0) + xScale.bandwidth() / 2)
        .attr("cy", (d: any) => yInteractionScale(d.interactionRate))
        .attr("r", 4)
        .attr("fill", "#10b981")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("mouseenter", (_, d: any) => setHoveredPoint(d))
        .on("mouseleave", () => setHoveredPoint(null));

      const xAxis = d3.axisBottom(xScale).tickValues(
        xScale.domain().filter((_, i) => i % Math.ceil(filteredData.length / 10) === 0)
      );

      chartGroup
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("fill", "#64748b");

      const yAxisLeft = d3.axisLeft(yAnnouncementsScale).ticks(5);
      chartGroup
        .append("g")
        .call(yAxisLeft)
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("fill", "#6366f1");

      const yAxisRight = d3.axisRight(yInteractionScale).ticks(5).tickFormat((d) => `${d}%`);
      chartGroup
        .append("g")
        .attr("transform", `translate(${innerWidth},0)`)
        .call(yAxisRight)
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("fill", "#10b981");
    } else if (viewMode === "scatter") {
      const maxCount = (d3.max(filteredData, (d: DailyCorrelationPoint) => d.announcementsCount) || 8) + 1;
      const xScale = d3
        .scaleLinear()
        .domain([0, maxCount])
        .nice()
        .range([0, innerWidth]);

      const yScale = d3.scaleLinear().domain([30, 100]).range([innerHeight, 0]);

      if (correlationStats.r !== 0) {
        const x1 = 0;
        const y1 = correlationStats.slope * x1 + correlationStats.intercept;
        const x2 = maxCount;
        const y2 = correlationStats.slope * x2 + correlationStats.intercept;

        chartGroup
          .append("line")
          .attr("x1", xScale(x1))
          .attr("y1", yScale(Math.max(30, Math.min(100, y1))))
          .attr("x2", xScale(x2))
          .attr("y2", yScale(Math.max(30, Math.min(100, y2))))
          .attr("stroke", "#f59e0b")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4")
          .attr("opacity", 0.85);
      }

      chartGroup
        .selectAll(".scatter-dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "scatter-dot")
        .attr("cx", (d: any) => xScale(d.announcementsCount))
        .attr("cy", (d: any) => yScale(d.interactionRate))
        .attr("r", 5.5)
        .attr("fill", "#6366f1")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.8)
        .attr("opacity", 0.9)
        .style("cursor", "pointer")
        .on("mouseenter", (_, d: any) => setHoveredPoint(d))
        .on("mouseleave", () => setHoveredPoint(null));

      const xAxis = d3.axisBottom(xScale).ticks(8);
      chartGroup
        .append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("fill", "#6366f1");

      const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat((d) => `${d}%`);
      chartGroup
        .append("g")
        .call(yAxis)
        .selectAll("text")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("fill", "#10b981");
    }
  }, [filteredData, viewMode, correlationStats]);

  // Render custom node for Recharts Scatter Plot
  const renderEngagementFinancialPoint = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || cx === undefined || cy === undefined) return null;
    const isSelected = selectedFinancialPoint?.id === payload.id;
    const isCritical = payload.riskTier === "critical";

    const color =
      payload.riskTier === "critical"
        ? "#ef4444"
        : payload.riskTier === "warning_finance"
        ? "#f59e0b"
        : payload.riskTier === "warning_read"
        ? "#6366f1"
        : "#10b981";

    return (
      <g
        key={`financial-node-${payload.id}`}
        className="cursor-pointer transition-transform"
        onClick={() => setSelectedFinancialPoint(payload)}
      >
        {isCritical && (
          <circle
            cx={cx}
            cy={cy}
            r={isSelected ? 16 : 13}
            fill="#fee2e2"
            fillOpacity={0.65}
            stroke="#ef4444"
            strokeWidth={1.8}
            strokeDasharray="3 3"
            className="animate-pulse"
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 9 : 7}
          fill={color}
          stroke={isSelected ? "#0f172a" : "#ffffff"}
          strokeWidth={isSelected ? 3 : 1.8}
          fillOpacity={0.9}
        />
      </g>
    );
  };

  const activeFocusPoint = selectedFinancialPoint || (filteredFinancialData.length > 0 ? filteredFinancialData[0] : null);

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6"
      id="engagement-metrics-correlation-panel"
    >
      {/* HEADER WITH TITLE & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1">
              <Activity className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Painel de Métricas de Engajamento</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {viewMode === "recharts_financial"
                ? "• Cruzamento Bivariado Recharts (24 Turmas Monitoradas)"
                : "• Algoritmo D3 de Correlação Temporal"}
            </span>
          </div>

          <h3 className="font-serif font-black text-lg text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>
              {viewMode === "recharts_financial"
                ? "Dispersão Recharts: Frequência de Leitura vs. Taxa de Inadimplência"
                : "Correlação: Comunicados vs. Engajamento Familiar"}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {viewMode === "recharts_financial"
              ? "Cruzamento analítico entre a taxa de leitura dos comunicados pelas famílias e o índice de inadimplência financeira das mensalidades por turma."
              : "Análise matemática utilizando algoritmo D3 de regressão linear para medir o impacto do volume de avisos pedagógicos no engajamento familiar."}
          </p>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-50/80 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          
          {/* Mode Selector */}
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-750 flex-wrap gap-1">
            <button
              onClick={() => setViewMode("recharts_financial")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "recharts_financial"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Gráfico de Dispersão Recharts (Leitura de Comunicados vs. Taxa de Inadimplência)"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Leitura x Inadimplência (Recharts)</span>
            </button>

            <button
              onClick={() => setViewMode("combo")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "combo"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Visão Temporal (Barras + Linha D3)"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Linha do Tempo (D3)</span>
            </button>

            <button
              onClick={() => setViewMode("scatter")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "scatter"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Gráfico de Dispersão Volume vs. Interação (D3)"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Volume x Interação (D3)</span>
            </button>
          </div>

          {/* Contextual Filters for Recharts Scatter */}
          {viewMode === "recharts_financial" ? (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Segment Selector */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-extrabold uppercase text-slate-500 dark:text-slate-400 font-mono">
                  Segmento
                </label>
                <select
                  value={financialSegmentFilter}
                  onChange={(e) => setFinancialSegmentFilter(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-750 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 outline-hidden font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="todos">Todos Segmentos</option>
                  <option value="Fundamental I">Fundamental I</option>
                  <option value="Fundamental II">Fundamental II</option>
                  <option value="Médio">Ensino Médio</option>
                </select>
              </div>

              {/* Risk Filter */}
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-extrabold uppercase text-slate-500 dark:text-slate-400 font-mono">
                  Classificação
                </label>
                <select
                  value={financialRiskFilter}
                  onChange={(e) => setFinancialRiskFilter(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-750 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 outline-hidden font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="todos">Todos os Riscos</option>
                  <option value="safe">Q1: Zona Modelo (Saudável)</option>
                  <option value="critical">Q2: Risco Crítico</option>
                  <option value="warning_finance">Q3: Inadimplente Engajado</option>
                </select>
              </div>
            </div>
          ) : (
            /* Contextual Filters for D3 */
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-extrabold uppercase text-slate-500 dark:text-slate-400 font-mono">
                  Período
                </label>
                <select
                  value={dayRangeFilter}
                  onChange={(e) => setDayRangeFilter(Number(e.target.value))}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-750 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 outline-hidden font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={30}>Últimos 30 dias</option>
                  <option value={15}>Últimos 15 dias</option>
                  <option value={7}>Últimos 7 dias</option>
                </select>
              </div>

              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] font-extrabold uppercase text-slate-500 dark:text-slate-400 font-mono">
                  Categoria
                </label>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-750 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 outline-hidden font-medium focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="todas">Todas Categorias</option>
                  <option value="pedagógico">Pedagógico</option>
                  <option value="eventos">Eventos</option>
                  <option value="aviso urgente">Aviso Urgente</option>
                  <option value="rotina">Rotina</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* METRICS & STATISTICAL SUMMARY STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {viewMode === "recharts_financial" ? (
          <>
            {/* Metric 1: Pearson r (Leitura vs Inadimplência) */}
            <div className="bg-slate-50/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Coeficiente r (Pearson)
                </span>
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {financialStats.r}
              </div>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 truncate">
                {financialStats.interpretation}
              </p>
            </div>

            {/* Metric 2: R² Determinação */}
            <div className="bg-slate-50/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Determinação R²
                </span>
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-50 font-mono">
                {(financialStats.rSquared * 100).toFixed(0)}%
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Variação de inadimplência explicada pelo hábito de leitura
              </p>
            </div>

            {/* Metric 3: Inadimplência em Leitoras Assíduas (≥70%) */}
            <div className="bg-slate-50/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Inadimplência (Leitura ≥ 70%)
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {financialStats.avgDefaultHighRead}%
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Média nas turmas com alta leitura regular
              </p>
            </div>

            {/* Metric 4: Inadimplência em Baixa Leitura (<70%) */}
            <div className="bg-slate-50/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Inadimplência (Leitura &lt; 70%)
                </span>
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {financialStats.avgDefaultLowRead}%
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                R$ {financialStats.totalRevenueAtRisk.toLocaleString()} em risco sob baixa leitura
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Metric 1: Pearson r D3 */}
            <div className="bg-slate-50/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Coeficiente r (Pearson)
                </span>
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-50 font-mono">
                {correlationStats.r > 0 ? `+${correlationStats.r}` : correlationStats.r}
              </div>
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                {correlationStats.interpretation}
              </p>
            </div>

            {/* Metric 2: R² Determinação D3 */}
            <div className="bg-slate-50/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Determinação R²
                </span>
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-50 font-mono">
                {(correlationStats.rSquared * 100).toFixed(0)}%
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Explicabilidade do engajamento pelo volume
              </p>
            </div>

            {/* Metric 3: Média de Avisos por Dia */}
            <div className="bg-slate-50/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Média de Avisos / Dia
                </span>
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {correlationStats.avgVolume}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Volume diário recomendado: 2 a 4
              </p>
            </div>

            {/* Metric 4: Média de Engajamento */}
            <div className="bg-slate-50/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-slate-400">
                  Taxa Média de Engajamento
                </span>
                <Users className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {correlationStats.avgRate}%
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Pico de {correlationStats.maxRatePoint?.interactionRate}% no dia {correlationStats.maxRatePoint?.dateStr}
              </p>
            </div>
          </>
        )}
      </div>

      {/* ACTION FEEDBACK MESSAGE */}
      {actionToastMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{actionToastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionToastMessage(null)}
            className="text-[11px] font-bold underline cursor-pointer ml-3 text-emerald-700 hover:text-emerald-900"
          >
            Fechar
          </button>
        </div>
      )}

      {/* MAIN CANVAS AREA: RECHARTS SCATTER PLOT vs D3 */}
      {viewMode === "recharts_financial" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Recharts Scatter Chart (Col 8) */}
          <div className="lg:col-span-8 bg-slate-50/70 dark:bg-slate-950/50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            {/* Quadrant Legend Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block">Q1: Zona Modelo</span>
                <span className="text-[9px] text-emerald-600/90 font-sans block">Leitura ≥ 70% • Inadim ≤ 5%</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-200/70 dark:border-amber-900/60 text-amber-800 dark:text-amber-300">
                <span className="font-bold block">Q3: Inadimplente Engajado</span>
                <span className="text-[9px] text-amber-600/90 font-sans block">Leitura ≥ 70% • Inadim &gt; 5%</span>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                <span className="font-bold block">Q4: Desengajado Silencioso</span>
                <span className="text-[9px] text-indigo-600/90 font-sans block">Leitura &lt; 70% • Inadim ≤ 5%</span>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-200/70 dark:border-rose-900/60 text-rose-800 dark:text-rose-300">
                <span className="font-bold block">Q2: Risco Crítico</span>
                <span className="text-[9px] text-rose-600/90 font-sans block">Leitura &lt; 70% • Inadim &gt; 5%</span>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="h-80 sm:h-96 w-full font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.7} />

                  <XAxis
                    type="number"
                    dataKey="readRate"
                    name="Frequência de Leitura"
                    unit="%"
                    domain={[25, 100]}
                    tickCount={8}
                    stroke="#94a3b8"
                    label={{
                      value: "Frequência de Leitura dos Comunicados Escolares (%)",
                      position: "insideBottom",
                      offset: -16,
                      style: { fontSize: 10, fill: "#64748b", fontFamily: "sans-serif" }
                    }}
                  />

                  <YAxis
                    type="number"
                    dataKey="defaultRate"
                    name="Taxa de Inadimplência"
                    unit="%"
                    domain={[0, 26]}
                    tickCount={7}
                    stroke="#94a3b8"
                    label={{
                      value: "Taxa de Inadimplência Financeira das Famílias (%)",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      style: { fontSize: 10, fill: "#64748b", fontFamily: "sans-serif" }
                    }}
                  />

                  <ZAxis type="number" dataKey="totalFamilies" range={[90, 260]} name="Famílias" />

                  <RechartsTooltip content={<CustomEngagementFinancialTooltip />} />

                  {/* Reference Lines */}
                  <ReferenceLine
                    x={70}
                    stroke="#3b82f6"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Meta de Leitura (70%)",
                      position: "top",
                      fill: "#3b82f6",
                      fontSize: 10,
                      fontWeight: "bold"
                    }}
                  />

                  <ReferenceLine
                    y={5}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Teto Inadimplência (5%)",
                      position: "right",
                      fill: "#ef4444",
                      fontSize: 10,
                      fontWeight: "bold"
                    }}
                  />

                  {/* Reference Areas */}
                  <ReferenceArea
                    {...({
                      x1: 70,
                      x2: 100,
                      y1: 0,
                      y2: 5,
                      fill: "#10b981",
                      fillOpacity: 0.08,
                      stroke: "#10b981",
                      strokeDasharray: "3 3",
                      label: {
                        value: "✓ Q1: ZONA MODELO (Alta Leitura & Adimplência)",
                        position: "insideBottomRight",
                        fill: "#047857",
                        fontSize: 9.5,
                        fontWeight: "bold"
                      }
                    } as any)}
                  />

                  <ReferenceArea
                    {...({
                      x1: 25,
                      x2: 70,
                      y1: 5,
                      y2: 26,
                      fill: "#ef4444",
                      fillOpacity: 0.08,
                      stroke: "#ef4444",
                      strokeDasharray: "3 3",
                      label: {
                        value: "⚠️ Q2: RISCO CRÍTICO (Baixa Leitura & Inadimplência)",
                        position: "insideTopLeft",
                        fill: "#b91c1c",
                        fontSize: 9.5,
                        fontWeight: "bold"
                      }
                    } as any)}
                  />

                  <Scatter
                    name="Turmas / Coortes"
                    data={filteredFinancialData}
                    shape={renderEngagementFinancialPoint}
                    onClick={(entry) => setSelectedFinancialPoint(entry.payload || entry)}
                    cursor="pointer"
                    isAnimationActive={true}
                    animationDuration={900}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1.5 border-t border-slate-200/60 dark:border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <ArrowRightLeft className="w-3 h-3 text-blue-500" />
                  <span>Eixo X: Taxa de Leitura (%)</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <ArrowUpDown className="w-3 h-3 text-rose-500" />
                  <span>Eixo Y: Taxa de Inadimplência (%)</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                {filteredFinancialData.length} turmas mapeadas • Clique nos pontos para diagnóstico
              </span>
            </div>
          </div>

          {/* Diagnostic Sidebar & Action Center (Col 4) */}
          <div className="lg:col-span-4 space-y-4">
            {activeFocusPoint ? (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/60 dark:border-indigo-400 shadow-md space-y-3.5 text-xs animate-fade-in">
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
                      Turma em Diagnóstico
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">{activeFocusPoint.name}</h5>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {activeFocusPoint.segment} • {activeFocusPoint.totalFamilies} famílias cadastradas
                    </p>
                  </div>
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                    activeFocusPoint.riskTier === "critical"
                      ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900"
                      : activeFocusPoint.riskTier === "warning_finance"
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                      : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                  }`}>
                    {activeFocusPoint.riskTier === "critical" ? "Crítico" : activeFocusPoint.riskTier === "warning_finance" ? "Atenção" : "Saudável"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Frequência Leitura:</span>
                    <strong className={activeFocusPoint.readRate >= 70 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                      {activeFocusPoint.readRate}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Inadimplência:</span>
                    <strong className={activeFocusPoint.defaultRate <= 5 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                      {activeFocusPoint.defaultRate.toFixed(1)}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Tempo Médio Resposta:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      ~{activeFocusPoint.avgResponseTimeHours}h
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-sans text-slate-400 block">Receita em Risco:</span>
                    <strong className="text-amber-600 dark:text-amber-400">
                      R$ {activeFocusPoint.annualRevenueAtRisk.toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-650 dark:text-slate-300 leading-relaxed bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
                  <strong className="text-[10px] uppercase font-mono text-amber-800 dark:text-amber-300 block mb-0.5">
                    Diretriz Pedagógico-Financeira:
                  </strong>
                  {activeFocusPoint.actionRecommendation}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActionToastMessage(`Lembrete amigável de leitura e aviso de vencimento disparados via WhatsApp para as famílias da turma "${activeFocusPoint.name}".`);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Lembrete WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActionToastMessage(`Notificação com link Pix de liquidação facilitada gerada para os responsáveis inadimplentes de "${activeFocusPoint.name}".`);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Regularização Pix sem Juros</span>
                  </button>
                </div>
              </div>
            ) : null}

            {/* Strategic Directive Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                Regra de Ouro da Gestão
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                A queda da frequência de leitura dos comunicados escolares é o <strong>primeiro sinal visível de risco de inadimplência e evasão</strong>. O hábito de leitura diária fortalece a fidelização da família e antecipa soluções preventivas.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* D3 CANVAS AREA */
        <div className="relative bg-slate-50/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[380px]">
          <div ref={containerRef} className="w-full relative">
            <svg ref={svgRef} className="w-full h-auto overflow-visible" />
          </div>

          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl backdrop-blur-md text-xs space-y-2 pointer-events-none max-w-xs z-20"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {hoveredPoint.dateStr} (Dia {hoveredPoint.dayIndex})
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {hoveredPoint.topCategory}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-1.5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/30">
                  <span className="text-[9px] text-slate-400 block font-sans">Comunicados</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-black">
                    {hoveredPoint.announcementsCount} enviados
                  </strong>
                </div>
                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/30">
                  <span className="text-[9px] text-slate-400 block font-sans">Interação Familiar</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-black">
                    {hoveredPoint.interactionRate}%
                  </strong>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1">
                Total de <strong>{hoveredPoint.totalInteractions}</strong> leituras e reações registradas pelas famílias.
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* PEDAGOGICAL / FINANCIAL INSIGHTS & RECOMMENDATION FOOTER */}
      <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40 rounded-2xl space-y-2 text-left">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <h4 className="text-xs font-black uppercase tracking-wider font-mono">
            {viewMode === "recharts_financial"
              ? "Diagnóstico Estratégico: Leitura de Comunicados vs. Saúde Financeira"
              : "Conclusão Pedagógica dos Dados"}
          </h4>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          {viewMode === "recharts_financial" ? (
            <>
              A análise estatística bivariada comprova uma <strong>forte correlação negativa</strong> (r = {financialStats.r}). Turmas com taxa de leitura de comunicados igual ou superior a 70% registram inadimplência média de apenas <strong>{financialStats.avgDefaultHighRead}%</strong>, enquanto turmas com baixa leitura chegam a <strong>{financialStats.avgDefaultLowRead}%</strong>. Recomenda-se automação de lembretes via WhatsApp pré-vencimento para as famílias não-leitoras.
            </>
          ) : (
            <>
              A análise estatística D3 indica uma <strong>{correlationStats.interpretation}</strong> (r = {correlationStats.r}). Enviar entre <strong>2 e 4 comunicados por dia</strong> com fotos e atualizações pedagógicas estimula o engajamento diário das famílias sem causar fadiga de notificações.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
