import React, { useState, useMemo, useCallback } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  LineChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  FileText,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  SlidersHorizontal,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  DollarSign
} from "lucide-react";
import { Cobranca } from "../types";

export interface ErpMonthlyDelinquencyChartProps {
  cobrancas: Cobranca[];
  erpSyncStatus?: "disconnected" | "sync_testing" | "connected";
  erpLastSyncTime?: string;
  onTriggerSync?: () => void;
  onNavigateToErp?: () => void;
  onNavigateToRematricula?: () => void;
  targetDelinquencyRate?: number; // default 3.0%
  schoolName?: string;
  onOpenReportModal?: () => void;
}

export type DelinquencyChartMode = "composto" | "taxa" | "montante" | "recuperacao";
export type DelinquencyTimeframe = "6m" | "ano_letivo" | "12m";

export interface MonthlyDelinquencyRecord {
  sortKey: string;
  label: string;
  fullMonth: string;
  totalFaturado: number;
  totalLiquidado: number;
  saldoPendente: number;
  saldoVencido: number;
  taxaInadimplencia: number;
  taxaRecuperacao: number;
  meta: number;
  deltaMeta: number;
  statusMeta: "dentro" | "acima";
  invoicesCount: number;
  overdueInvoicesCount: number;
  recuperadoCrm: number;
  isSimulated?: boolean;
}

const formatCurrencyBRL = (val: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
};

const formatPercent = (val: number): string => {
  return `${val.toFixed(2)}%`;
};

// Institutional ERP Delinquency Matrix Archetype (12-month baseline synced with TOTVS/Asaas/SAP)
const INSTITUTIONAL_ERP_DELINQUENCY_BASE: MonthlyDelinquencyRecord[] = [
  {
    sortKey: "2025-11",
    label: "Nov/25",
    fullMonth: "Novembro de 2025",
    totalFaturado: 418000,
    totalLiquidado: 404200,
    saldoPendente: 0,
    saldoVencido: 13800,
    taxaInadimplencia: 3.3,
    taxaRecuperacao: 89.4,
    meta: 3.0,
    deltaMeta: 0.3,
    statusMeta: "acima",
    invoicesCount: 220,
    overdueInvoicesCount: 8,
    recuperadoCrm: 11200
  },
  {
    sortKey: "2025-12",
    label: "Dez/25",
    fullMonth: "Dezembro de 2025",
    totalFaturado: 422000,
    totalLiquidado: 409760,
    saldoPendente: 0,
    saldoVencido: 12240,
    taxaInadimplencia: 2.9,
    taxaRecuperacao: 91.2,
    meta: 3.0,
    deltaMeta: -0.1,
    statusMeta: "dentro",
    invoicesCount: 224,
    overdueInvoicesCount: 7,
    recuperadoCrm: 10800
  },
  {
    sortKey: "2026-01",
    label: "Jan/26",
    fullMonth: "Janeiro de 2026",
    totalFaturado: 432000,
    totalLiquidado: 419040,
    saldoPendente: 0,
    saldoVencido: 12960,
    taxaInadimplencia: 3.0,
    taxaRecuperacao: 93.5,
    meta: 3.0,
    deltaMeta: 0.0,
    statusMeta: "dentro",
    invoicesCount: 230,
    overdueInvoicesCount: 8,
    recuperadoCrm: 11500
  },
  {
    sortKey: "2026-02",
    label: "Fev/26",
    fullMonth: "Fevereiro de 2026",
    totalFaturado: 440000,
    totalLiquidado: 426800,
    saldoPendente: 0,
    saldoVencido: 13200,
    taxaInadimplencia: 3.0,
    taxaRecuperacao: 94.2,
    meta: 3.0,
    deltaMeta: 0.0,
    statusMeta: "dentro",
    invoicesCount: 236,
    overdueInvoicesCount: 8,
    recuperadoCrm: 11900
  },
  {
    sortKey: "2026-03",
    label: "Mar/26",
    fullMonth: "Março de 2026",
    totalFaturado: 448000,
    totalLiquidado: 436352,
    saldoPendente: 0,
    saldoVencido: 11648,
    taxaInadimplencia: 2.6,
    taxaRecuperacao: 95.8,
    meta: 3.0,
    deltaMeta: -0.4,
    statusMeta: "dentro",
    invoicesCount: 240,
    overdueInvoicesCount: 6,
    recuperadoCrm: 10600
  },
  {
    sortKey: "2026-04",
    label: "Abr/26",
    fullMonth: "Abril de 2026",
    totalFaturado: 452000,
    totalLiquidado: 441152,
    saldoPendente: 0,
    saldoVencido: 10848,
    taxaInadimplencia: 2.4,
    taxaRecuperacao: 96.5,
    meta: 3.0,
    deltaMeta: -0.6,
    statusMeta: "dentro",
    invoicesCount: 242,
    overdueInvoicesCount: 5,
    recuperadoCrm: 10100
  },
  {
    sortKey: "2026-05",
    label: "Mai/26",
    fullMonth: "Maio de 2026",
    totalFaturado: 455000,
    totalLiquidado: 444535,
    saldoPendente: 0,
    saldoVencido: 10465,
    taxaInadimplencia: 2.3,
    taxaRecuperacao: 97.1,
    meta: 3.0,
    deltaMeta: -0.7,
    statusMeta: "dentro",
    invoicesCount: 244,
    overdueInvoicesCount: 5,
    recuperadoCrm: 9800
  },
  {
    sortKey: "2026-06",
    label: "Jun/26",
    fullMonth: "Junho de 2026",
    totalFaturado: 458500,
    totalLiquidado: 441077,
    saldoPendente: 0,
    saldoVencido: 17423,
    taxaInadimplencia: 3.8,
    taxaRecuperacao: 92.4,
    meta: 3.0,
    deltaMeta: 0.8,
    statusMeta: "acima",
    invoicesCount: 246,
    overdueInvoicesCount: 11,
    recuperadoCrm: 13200
  },
  {
    sortKey: "2026-07",
    label: "Jul/26",
    fullMonth: "Julho de 2026",
    totalFaturado: 460000,
    totalLiquidado: 447580,
    saldoPendente: 0,
    saldoVencido: 12420,
    taxaInadimplencia: 2.7,
    taxaRecuperacao: 96.0,
    meta: 3.0,
    deltaMeta: -0.3,
    statusMeta: "dentro",
    invoicesCount: 247,
    overdueInvoicesCount: 7,
    recuperadoCrm: 11400
  },
  {
    sortKey: "2026-08",
    label: "Ago/26",
    fullMonth: "Agosto de 2026",
    totalFaturado: 463200,
    totalLiquidado: 452083,
    saldoPendente: 0,
    saldoVencido: 11117,
    taxaInadimplencia: 2.4,
    taxaRecuperacao: 96.8,
    meta: 3.0,
    deltaMeta: -0.6,
    statusMeta: "dentro",
    invoicesCount: 248,
    overdueInvoicesCount: 6,
    recuperadoCrm: 10400
  },
  {
    sortKey: "2026-09",
    label: "Set/26",
    fullMonth: "Setembro de 2026",
    totalFaturado: 465000,
    totalLiquidado: 455235,
    saldoPendente: 0,
    saldoVencido: 9765,
    taxaInadimplencia: 2.1,
    taxaRecuperacao: 97.4,
    meta: 3.0,
    deltaMeta: -0.9,
    statusMeta: "dentro",
    invoicesCount: 249,
    overdueInvoicesCount: 5,
    recuperadoCrm: 9200
  },
  {
    sortKey: "2026-10",
    label: "Out/26",
    fullMonth: "Outubro de 2026 (Atual)",
    totalFaturado: 468000,
    totalLiquidado: 442260,
    saldoPendente: 16850,
    saldoVencido: 8890,
    taxaInadimplencia: 1.9,
    taxaRecuperacao: 98.2,
    meta: 3.0,
    deltaMeta: -1.1,
    statusMeta: "dentro",
    invoicesCount: 250,
    overdueInvoicesCount: 4,
    recuperadoCrm: 8100
  }
];

export const ErpMonthlyDelinquencyChart: React.FC<ErpMonthlyDelinquencyChartProps> = ({
  cobrancas,
  erpSyncStatus = "connected",
  erpLastSyncTime,
  onTriggerSync,
  onNavigateToErp,
  onNavigateToRematricula,
  targetDelinquencyRate = 3.0,
  schoolName = "Colégio Magic Learning",
  onOpenReportModal
}) => {
  const [chartMode, setChartMode] = useState<DelinquencyChartMode>("composto");
  const [timeframe, setTimeframe] = useState<DelinquencyTimeframe>("ano_letivo");
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Compute aggregated ERP monthly dataset integrating live cobrancas
  const fullMonthlyData = useMemo<MonthlyDelinquencyRecord[]>(() => {
    // Clone baseline dataset
    const baseMap = new Map<string, MonthlyDelinquencyRecord>();
    INSTITUTIONAL_ERP_DELINQUENCY_BASE.forEach((item) => {
      baseMap.set(item.sortKey, { ...item, meta: targetDelinquencyRate });
    });

    // Merge real cobrancas if present
    cobrancas.forEach((cob) => {
      if (!cob.dueDate) return;
      const parts = cob.dueDate.split("/");
      if (parts.length === 3) {
        const year = parts[2];
        const monthNum = parts[1].padStart(2, "0");
        const sortKey = `${year}-${monthNum}`;

        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const mIdx = parseInt(monthNum, 10) - 1;
        const label = `${monthNames[mIdx] || "Mês"}/${year.slice(2)}`;

        const existing = baseMap.get(sortKey);
        if (existing) {
          // Augment or adjust according to real records
          if (cob.status === "vencido") {
            existing.saldoVencido += cob.amount * 0.1; // proportional real adjustment
            existing.overdueInvoicesCount += 1;
          } else if (cob.status === "pago") {
            existing.totalLiquidado += cob.amount * 0.1;
          }
          existing.totalFaturado = existing.totalLiquidado + existing.saldoPendente + existing.saldoVencido;
          existing.taxaInadimplencia = parseFloat(((existing.saldoVencido / existing.totalFaturado) * 100).toFixed(2));
          existing.deltaMeta = parseFloat((existing.taxaInadimplencia - targetDelinquencyRate).toFixed(2));
          existing.statusMeta = existing.taxaInadimplencia <= targetDelinquencyRate ? "dentro" : "acima";
        } else {
          // New month created from real dynamic cobranca
          const total = cob.amount;
          const vencido = cob.status === "vencido" ? cob.amount : 0;
          const pago = cob.status === "pago" ? cob.amount : 0;
          const pendente = cob.status === "pendente" ? cob.amount : 0;
          const taxa = total > 0 ? (vencido / total) * 100 : 0;
          baseMap.set(sortKey, {
            sortKey,
            label,
            fullMonth: `${label}`,
            totalFaturado: total,
            totalLiquidado: pago,
            saldoPendente: pendente,
            saldoVencido: vencido,
            taxaInadimplencia: parseFloat(taxa.toFixed(2)),
            taxaRecuperacao: 94.0,
            meta: targetDelinquencyRate,
            deltaMeta: parseFloat((taxa - targetDelinquencyRate).toFixed(2)),
            statusMeta: taxa <= targetDelinquencyRate ? "dentro" : "acima",
            invoicesCount: 1,
            overdueInvoicesCount: vencido > 0 ? 1 : 0,
            recuperadoCrm: 0
          });
        }
      }
    });

    return Array.from(baseMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [cobrancas, targetDelinquencyRate]);

  // Filter dataset by selected timeframe
  const filteredData = useMemo<MonthlyDelinquencyRecord[]>(() => {
    if (timeframe === "6m") {
      return fullMonthlyData.slice(-6);
    }
    if (timeframe === "ano_letivo") {
      // 2026 months (Jan/26 onwards)
      const year2026 = fullMonthlyData.filter((d) => d.sortKey.startsWith("2026"));
      return year2026.length > 0 ? year2026 : fullMonthlyData.slice(-10);
    }
    return fullMonthlyData; // 12m
  }, [fullMonthlyData, timeframe]);

  // Key performance indicators calculated over the visible timeframe
  const kpis = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        mediaTaxa: 0,
        ultimaTaxa: 0,
        totalVencidoAcumulado: 0,
        mesCritico: null,
        mesMelhor: null,
        taxaRecuperacaoMedia: 0,
        desvioMeta: 0
      };
    }

    const sumTaxa = filteredData.reduce((acc, d) => acc + d.taxaInadimplencia, 0);
    const mediaTaxa = sumTaxa / filteredData.length;
    const ultima = filteredData[filteredData.length - 1];
    const totalVencido = filteredData.reduce((acc, d) => acc + d.saldoVencido, 0);

    let mesCritico = filteredData[0];
    let mesMelhor = filteredData[0];
    filteredData.forEach((d) => {
      if (d.taxaInadimplencia > mesCritico.taxaInadimplencia) mesCritico = d;
      if (d.taxaInadimplencia < mesMelhor.taxaInadimplencia) mesMelhor = d;
    });

    const sumRecup = filteredData.reduce((acc, d) => acc + d.taxaRecuperacao, 0);
    const mediaRecuperacao = sumRecup / filteredData.length;

    return {
      mediaTaxa: parseFloat(mediaTaxa.toFixed(2)),
      ultimaTaxa: ultima.taxaInadimplencia,
      totalVencidoAcumulado: totalVencido,
      mesCritico,
      mesMelhor,
      taxaRecuperacaoMedia: parseFloat(mediaRecuperacao.toFixed(1)),
      desvioMeta: parseFloat((ultima.taxaInadimplencia - targetDelinquencyRate).toFixed(2))
    };
  }, [filteredData, targetDelinquencyRate]);

  // Selected or active month detail
  const activeRecord = useMemo(() => {
    if (selectedMonthKey) {
      const found = filteredData.find((d) => d.sortKey === selectedMonthKey);
      if (found) return found;
    }
    return filteredData[filteredData.length - 1] || null;
  }, [filteredData, selectedMonthKey]);

  // Trigger simulated sync
  const handleSyncClick = useCallback(() => {
    setIsSyncing(true);
    if (onTriggerSync) {
      onTriggerSync();
    }
    setTimeout(() => {
      setIsSyncing(false);
    }, 900);
  }, [onTriggerSync]);

  // Custom Recharts Tooltip for rich executive inspection
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: MonthlyDelinquencyRecord = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-900/95 text-slate-100 p-3.5 rounded-lg shadow-lg border border-slate-700/80 text-xs font-sans max-w-xs space-y-2.5 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-750 pb-1.5">
          <span className="font-bold text-slate-100 text-xs font-serif">{data.fullMonth || label}</span>
          <span
            className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              data.statusMeta === "dentro" ? "bg-emerald-950 text-emerald-300" : "bg-rose-950 text-rose-300"
            }`}
          >
            {data.statusMeta === "dentro" ? "Dentro da Meta" : "Acima da Meta"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Taxa Inadimplência</span>
            <strong className="text-rose-400 text-sm font-bold">{formatPercent(data.taxaInadimplencia)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Meta do ERP</span>
            <span className="text-slate-300 text-sm font-bold">{formatPercent(data.meta)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Saldo Vencido</span>
            <strong className="text-rose-300 font-bold">{formatCurrencyBRL(data.saldoVencido)}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Liquidado</span>
            <span className="text-emerald-400 font-bold">{formatCurrencyBRL(data.totalLiquidado)}</span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-300 flex items-center justify-between font-sans">
          <span>Eficácia Régua WhatsApp:</span>
          <span className="font-mono text-emerald-300 font-semibold">{formatPercent(data.taxaRecuperacao)}</span>
        </div>

        <div className="text-[10px] text-slate-400 font-sans italic">
          Clique na barra para detalhar as faturas deste mês.
        </div>
      </div>
    );
  };

  return (
    <div
      id="erp-delinquency-visual-module"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* 1. Header & Institutional Alignment */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              Módulo Financeiro Integrado · ERP TOTVS / Asaas / SAP
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 dark:text-slate-100">
            Histórico Mensal de Inadimplência Escolar
          </h3>
          <p className="text-xs text-slate-500 font-sans max-w-2xl">
            Série histórica de títulos vencidos, taxa relativa e eficácia das notificações automáticas de conciliação bancária.
          </p>
        </div>

        {/* Action Controls & Sync metadata */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Real-time ERP Sync Indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                erpSyncStatus === "connected"
                  ? "bg-emerald-500 animate-pulse"
                  : erpSyncStatus === "sync_testing"
                  ? "bg-amber-500 animate-spin"
                  : "bg-slate-400"
              }`}
            />
            <span className="font-mono text-[11px]">
              {erpSyncStatus === "connected" ? "ERP Conectado" : "Sincronizando"}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {erpLastSyncTime || "Hoje às 10:45"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSyncClick}
            disabled={isSyncing}
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            title="Sincronizar faturas e títulos vencidos com a base do ERP"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-blue-600" : ""}`} />
            <span>Atualizar</span>
          </button>

          {onOpenReportModal && (
            <button
              type="button"
              onClick={onOpenReportModal}
              className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Gerar Relatório Financeiro Consolidado em PDF"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
              <span>Relatório PDF</span>
            </button>
          )}

          {onNavigateToErp && (
            <button
              type="button"
              onClick={onNavigateToErp}
              className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Régua ERP</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Executive Metric Strip (Quiet unboxed indicators, no decorative pills) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-3.5 bg-slate-50 dark:bg-slate-850/50 rounded-lg border border-slate-100 dark:border-slate-800/80">
        <div>
          <span className="text-[11px] font-sans text-slate-500 uppercase tracking-wider block">
            Taxa Média do Período
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatPercent(kpis.mediaTaxa)}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              (meta: {formatPercent(targetDelinquencyRate)})
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-sans text-slate-500 uppercase tracking-wider block">
            Taxa Último Fechamento
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={`text-lg sm:text-xl font-bold font-mono ${
                kpis.ultimaTaxa <= targetDelinquencyRate
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatPercent(kpis.ultimaTaxa)}
            </span>
            <span
              className={`text-[11px] font-mono font-medium ${
                kpis.desvioMeta <= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {kpis.desvioMeta <= 0 ? `${kpis.desvioMeta} p.p.` : `+${kpis.desvioMeta} p.p.`}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-sans text-slate-500 uppercase tracking-wider block">
            Vencido no Período
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {formatCurrencyBRL(kpis.totalVencidoAcumulado)}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-sans text-slate-500 uppercase tracking-wider block">
            Recuperação via Régua
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatPercent(kpis.taxaRecuperacaoMedia)}
            </span>
            <span className="text-[11px] font-sans text-slate-500">acordos</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Chart Controls (Mode and Timeframe Segmented Switchers) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Mode switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setChartMode("composto")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              chartMode === "composto"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Visão Composta (Dual-Axis)
          </button>
          <button
            type="button"
            onClick={() => setChartMode("taxa")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              chartMode === "taxa"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Curva de Taxa (%)
          </button>
          <button
            type="button"
            onClick={() => setChartMode("montante")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              chartMode === "montante"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Volume Vencido (R$)
          </button>
          <button
            type="button"
            onClick={() => setChartMode("recuperacao")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              chartMode === "recuperacao"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Eficácia da Régua
          </button>
        </div>

        {/* Timeframe switcher */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setTimeframe("6m")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              timeframe === "6m"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            6 Meses
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("ano_letivo")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              timeframe === "ano_letivo"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Ano Letivo 2026
          </button>
          <button
            type="button"
            onClick={() => setTimeframe("12m")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              timeframe === "12m"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            12 Meses
          </button>
        </div>
      </div>

      {/* 4. Main Recharts Plotting Canvas */}
      <div className="h-80 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === "composto" ? (
            <ComposedChart
              data={filteredData}
              margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  const clicked = e.activePayload[0].payload as MonthlyDelinquencyRecord;
                  setSelectedMonthKey(clicked.sortKey);
                }
              }}
            >
              <defs>
                <linearGradient id="delinquencyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              {/* Left YAxis: Delinquency Rate % */}
              <YAxis
                yAxisId="left"
                domain={[0, (dataMax: number) => Math.max(5, Math.ceil(dataMax + 0.5))]}
                tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              {/* Right YAxis: Overdue Amount R$ */}
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#94a3b8", fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                tickFormatter={(val) => `R$ ${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
              />
              <Tooltip content={renderCustomTooltip} />
              <Legend
                verticalAlign="top"
                height={32}
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", fontFamily: "sans-serif" }}
              />
              <ReferenceLine
                yAxisId="left"
                y={targetDelinquencyRate}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Meta ERP (${targetDelinquencyRate}%)`,
                  position: "insideTopRight",
                  fill: "#64748b",
                  fontSize: 10,
                  fontFamily: "monospace"
                }}
              />
              {/* Bars: Overdue Amount in R$ */}
              <Bar
                yAxisId="right"
                name="Montante Vencido (R$)"
                dataKey="saldoVencido"
                fill="#fca5a5"
                radius={[3, 3, 0, 0]}
                maxBarSize={30}
              >
                {filteredData.map((entry) => (
                  <Cell
                    key={`bar-${entry.sortKey}`}
                    fill={entry.sortKey === activeRecord?.sortKey ? "#f87171" : "#fca5a5"}
                  />
                ))}
              </Bar>
              {/* Line: Delinquency Rate in % */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="taxaInadimplencia"
                name="Taxa de Inadimplência (%)"
                stroke="#e11d48"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#e11d48" }}
                activeDot={{ r: 6, fill: "#be123c" }}
              />
            </ComposedChart>
          ) : chartMode === "taxa" ? (
            <AreaChart
              data={filteredData}
              margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  const clicked = e.activePayload[0].payload as MonthlyDelinquencyRecord;
                  setSelectedMonthKey(clicked.sortKey);
                }
              }}
            >
              <defs>
                <linearGradient id="areaRateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(5, Math.ceil(dataMax + 0.5))]}
                tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={renderCustomTooltip} />
              <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              <ReferenceLine
                y={targetDelinquencyRate}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Meta Institucional (${targetDelinquencyRate}%)`,
                  position: "insideTopRight",
                  fill: "#64748b",
                  fontSize: 10,
                  fontFamily: "monospace"
                }}
              />
              <Area
                type="monotone"
                dataKey="taxaInadimplencia"
                name="Taxa de Inadimplência (%)"
                stroke="#e11d48"
                fillOpacity={1}
                fill="url(#areaRateGrad)"
                strokeWidth={2.5}
              />
            </AreaChart>
          ) : chartMode === "montante" ? (
            <BarChart
              data={filteredData}
              margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  const clicked = e.activePayload[0].payload as MonthlyDelinquencyRecord;
                  setSelectedMonthKey(clicked.sortKey);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={renderCustomTooltip} />
              <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              <Bar name="Liquidado (Recebido)" dataKey="totalLiquidado" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={30} />
              <Bar name="Montante Vencido" dataKey="saldoVencido" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={30}>
                {filteredData.map((entry) => (
                  <Cell
                    key={`bar-montante-${entry.sortKey}`}
                    fill={entry.sortKey === activeRecord?.sortKey ? "#dc2626" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart
              data={filteredData}
              margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  const clicked = e.activePayload[0].payload as MonthlyDelinquencyRecord;
                  setSelectedMonthKey(clicked.sortKey);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <YAxis
                domain={[80, 100]}
                tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={renderCustomTooltip} />
              <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
              <ReferenceLine
                y={95}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{
                  value: "Meta Eficácia (95%)",
                  position: "insideTopRight",
                  fill: "#10b981",
                  fontSize: 10,
                  fontFamily: "monospace"
                }}
              />
              <Line
                type="monotone"
                dataKey="taxaRecuperacao"
                name="Taxa de Eficácia de Recuperação (%)"
                stroke="#059669"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#059669" }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 5. Selected Month Deep-Dive Drawer / Panel */}
      {activeRecord && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50/70 dark:bg-slate-850/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans">
                Detalhamento da Competência: <span className="font-serif">{activeRecord.fullMonth}</span>
              </h4>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  activeRecord.statusMeta === "dentro"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                }`}
              >
                {activeRecord.statusMeta === "dentro"
                  ? `Dentro da meta (${activeRecord.deltaMeta} p.p.)`
                  : `Acima da meta (+${activeRecord.deltaMeta} p.p.)`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-sans text-slate-500">
              <span>{activeRecord.invoicesCount} faturas processadas</span>
              <span>·</span>
              <strong className="text-slate-700 dark:text-slate-300 font-mono">
                {activeRecord.overdueInvoicesCount} inadimplentes
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block uppercase">Faturamento Bruto</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatCurrencyBRL(activeRecord.totalFaturado)}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block uppercase">Arrecadação Liquidada</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrencyBRL(activeRecord.totalLiquidado)}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block uppercase">Montante em Atraso</span>
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {formatCurrencyBRL(activeRecord.saldoVencido)}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block uppercase">Recuperado via Régua</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {formatCurrencyBRL(activeRecord.recuperadoCrm)} ({formatPercent(activeRecord.taxaRecuperacao)})
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-sans">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>
                Regra contábil: títulos com atraso superior a 5 dias são classificados em inadimplência e entram na régua de WhatsApp com link Pix.
              </span>
            </div>

            {onNavigateToRematricula && (
              <button
                type="button"
                onClick={onNavigateToRematricula}
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1 self-start sm:self-auto shrink-0"
              >
                <span>Cruzar com Rematrícula</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
