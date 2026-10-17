import React, { memo } from "react";
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Coffee,
  DollarSign,
  FileText,
  GraduationCap,
  Heart,
  Info,
  Moon,
  QrCode,
  ShieldCheck,
  Smile,
  TrendingUp,
  CheckCircle,
  Camera,
  Bell
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";
import { Estudante, Cobranca, Comunicado, Momento, Evento, SchoolBranding } from "../types";
import { DEFAULT_FEED_MODULE_ORDER } from "../utils/whiteLabelDefaults";
import { DailyGoalsSection } from "./DailyGoalsSection";
import { ComunicadosList } from "./ComunicadosList";
import { MomentosList } from "./MomentosList";

interface ParentDashboardFeedProps {
  activeStudent: Estudante;
  branding?: SchoolBranding;
  todayOccurrence: any;
  onNavigateToTab: (tab: "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso") => void;
  onOpenPediatraModal: () => void;
  moodTimeline: Array<{
    date: string;
    score: number;
    state: string;
    label: string;
    note: string;
    isReal: boolean;
  }>;
  wellnessIndex: number;
  dominantLabel: string;
  pendingCobranca?: Cobranca;
  eventos: Evento[];
  latestAnnouncement?: Comunicado;
  comunicados?: Comunicado[];
  momentos?: Momento[];
  CustomTooltip: React.ComponentType<any>;
}

export const ParentDashboardFeed = memo(function ParentDashboardFeed({
  activeStudent,
  branding,
  todayOccurrence,
  onNavigateToTab,
  onOpenPediatraModal,
  moodTimeline,
  wellnessIndex,
  dominantLabel,
  pendingCobranca,
  eventos,
  latestAnnouncement,
  comunicados = [],
  momentos = [],
  CustomTooltip
}: ParentDashboardFeedProps) {
  const isModuleEnabled = (modId: string) => {
    if (!branding?.enabledModules) return true;
    return branding.enabledModules[modId] !== false;
  };

  const effectiveFeedOrder =
    branding?.feedModuleOrder && branding.feedModuleOrder.length > 0
      ? branding.feedModuleOrder
      : DEFAULT_FEED_MODULE_ORDER;

  const renderModuleBlock = (moduleId: string) => {
    if (!isModuleEnabled(moduleId)) return null;

    switch (moduleId) {
      case "metas":
        return (
          <div key="feed-metas" className="w-full">
            <DailyGoalsSection student={activeStudent} branding={branding} />
          </div>
        );

      case "diaadia":
        return (
          <div
            key="feed-diaadia"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                <div>
                  <h3 className="font-sans font-bold text-sm text-slate-950 dark:text-white">
                    Resumo Diário da Rotina Escolar
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">Atualizado pela equipe pedagógica</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab("diaadia")}
                className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Ver diário completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Visual Operational Status Grid with Progress Bars */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-1">
              {/* Metric 1: Meals */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-800 dark:text-slate-200 uppercase font-bold">Alimentação</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <strong className="text-xs text-slate-950 dark:text-white font-bold block">
                  {todayOccurrence.meals?.lunch === "excelente"
                    ? "100% Consumido"
                    : todayOccurrence.meals?.lunch === "parcial"
                    ? "Parcial (60%)"
                    : "Recusa"}
                </strong>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: todayOccurrence.meals?.lunch === "excelente" ? "100%" : "60%" }}
                  />
                </div>
              </div>

              {/* Metric 2: Sleep */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-800 dark:text-slate-200 uppercase font-bold">Repouso</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <strong className="text-xs text-slate-950 dark:text-white font-bold block">
                  {todayOccurrence.sleep?.durationStr || "1h 15min"}
                </strong>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: "85%" }} />
                </div>
              </div>

              {/* Metric 3: Behavior / Mood */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-800 dark:text-slate-200 uppercase font-bold">Disposição</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <strong className="text-xs text-slate-950 dark:text-white font-bold block">
                  {todayOccurrence.behaviorState === "otimo"
                    ? "Radiante & Focado"
                    : "Ativo & Brincalhão"}
                </strong>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "95%" }} />
                </div>
              </div>

              {/* Metric 4: Medication */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-800 dark:text-slate-200 uppercase font-bold">Medicação</span>
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                </div>
                <strong className="text-xs text-slate-950 dark:text-white font-bold block">
                  {activeStudent.occurrences?.[0]?.medicated?.wasMedicated ? "Administrada" : "Sem Prescrição"}
                </strong>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>

            {/* Visual Routine Timeline Stepper (Régua da Jornada) */}
            <div className="pt-2">
              <span className="text-xs font-mono text-slate-800 dark:text-slate-200 uppercase font-bold block mb-2">
                Jornada do Estudante Hoje:
              </span>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold">
                  <span className="block font-mono text-[10px] text-emerald-700 dark:text-emerald-400">07:45</span>
                  <span>Entrada ✔️</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold">
                  <span className="block font-mono text-[10px] text-emerald-700 dark:text-emerald-400">09:30</span>
                  <span>Lanche ✔️</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold">
                  <span className="block font-mono text-[10px] text-emerald-700 dark:text-emerald-400">12:00</span>
                  <span>Almoço ✔️</span>
                </div>
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-bold animate-pulse">
                  <span className="block font-mono text-[10px] text-blue-700 dark:text-blue-400">14:00</span>
                  <span>Oficina ⚡</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                  <span className="block font-mono text-[10px] text-slate-700 dark:text-slate-400">17:15</span>
                  <span>Portaria 🚗</span>
                </div>
              </div>
            </div>

            {/* Teacher note (Concise) */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-2">
              <span className="text-xs text-slate-850 dark:text-slate-100 font-medium italic">
                "{todayOccurrence.teacherNote}"
              </span>
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold shrink-0">Coordenação Pedagógica</span>
            </div>
          </div>
        );

      case "engajamento":
        return (
          <div
            key="feed-engajamento"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-950 dark:text-white">
                  Evolução do Engajamento e Bem-estar
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                  Acompanhamento contínuo dos últimos 15 dias · Índice Positivo: <strong className="text-slate-950 dark:text-white font-mono">{wellnessIndex}%</strong> ({dominantLabel})
                </p>
              </div>

              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold self-start sm:self-auto">
                ● 15 dias monitorados
              </div>
            </div>

            {/* Trend Area Chart */}
            <div className="h-44 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={moodTimeline}
                  margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="parentMoodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={branding?.primaryColor || "#0284c7"}
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor={branding?.primaryColor || "#0284c7"}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(148, 163, 184, 0.12)"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "currentColor", opacity: 0.6, fontSize: 9, fontFamily: "monospace" }}
                  />
                  <YAxis
                    domain={[0.5, 4.5]}
                    ticks={[1, 2, 3, 4]}
                    tickFormatter={(val) => {
                      if (val === 4) return "Excelente";
                      if (val === 3) return "Engajado";
                      if (val === 2) return "Calmo";
                      if (val === 1) return "Acolhimento";
                      return "";
                    }}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "currentColor", opacity: 0.6, fontSize: 9, fontWeight: "bold" }}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={branding?.primaryColor || "#0284c7"}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#parentMoodGradient)"
                    activeDot={{
                      r: 5,
                      stroke: branding?.primaryColor || "#0284c7",
                      strokeWidth: 2,
                      fill: "#fff"
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case "academico":
        return (
          <div
            key="feed-academico"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-950 dark:text-white">
                  Desempenho Acadêmico
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">Médias do 2º bimestre corrente</p>
              </div>
              <button
                onClick={() => onNavigateToTab("academico")}
                className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Boletim Completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {activeStudent.grades.slice(0, 3).map((g, idx) => {
                const score = g.secondBimester || g.firstBimester || 8.0;
                const percent = score * 10;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {g.subject.split(" (")[0]}
                      </span>
                      <strong className="font-mono text-slate-950 dark:text-white text-xs">
                        {score.toFixed(1)} <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">/ 10</span>
                      </strong>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          score >= 9.0 ? "bg-emerald-600" : score >= 8.0 ? "bg-amber-600" : "bg-rose-600"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "cobrancas":
      case "financeiro":
        return (
          <div
            key="feed-cobrancas"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-950 dark:text-white">Status Financeiro</h3>
                <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">Mensalidades e serviços escolares</p>
              </div>
              <button
                onClick={() => onNavigateToTab("cobrancas")}
                className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Extrato</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingCobranca ? (
              <div className="bg-slate-50/70 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 font-mono">
                      Aguardando Pagamento · Vencimento: {pendingCobranca.dueDate}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pendingCobranca.title}</h4>
                  </div>
                  <strong className="text-sm font-bold text-slate-950 dark:text-white font-mono">
                    R$ {pendingCobranca.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToTab("cobrancas")}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-2 rounded-xl text-xs uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pagar via Pix</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Situação Financeira Regularizada</span>
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Nenhuma fatura em aberto</span>
              </div>
            )}
          </div>
        );

      case "agenda":
        return eventos && eventos.length > 0 ? (
          <div
            key="feed-agenda"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                <div>
                  <h3 className="font-sans font-bold text-sm text-slate-950 dark:text-white">
                    Próximos Eventos do Calendário
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">Compromissos e datas comemorativas</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab("diaadia")}
                className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Calendário</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eventos.slice(0, 2).map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-1"
                >
                  <span className="text-[10px] font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200">
                    {ev.dateStr}
                  </span>
                  <h5 className="text-xs font-bold text-slate-950 dark:text-white">{ev.title}</h5>
                  <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-1 font-medium">{ev.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "comunicados": {
        const commItems = (comunicados && comunicados.length > 0)
          ? comunicados.slice(0, 2)
          : (latestAnnouncement ? [latestAnnouncement] : []);
        return commItems.length > 0 ? (
          <div
            key="feed-comunicados"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider font-mono">
                    Comunicados & Avisos Oficiais
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                    Informações e circulares emitidas pela escola para a família
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab("comunicados")}
                className="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Mural Completo →
              </button>
            </div>
            <ComunicadosList
              items={commItems}
              compact={true}
              onSelect={() => onNavigateToTab("comunicados")}
            />
          </div>
        ) : null;
      }

      case "momentos":
        return momentos && momentos.length > 0 ? (
          <div
            key="feed-momentos"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-950 dark:text-white uppercase tracking-wider font-mono">
                    Registros Pedagógicos & Momentos
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                    Vivências e aprendizados registrados em sala de aula
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab("diaadia")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Ver Galeria →
              </button>
            </div>
            <MomentosList
              items={momentos}
              limit={2}
              compact={true}
              onSelect={() => onNavigateToTab("diaadia")}
            />
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {effectiveFeedOrder.map((sectionId) => renderModuleBlock(sectionId))}
    </div>
  );
});
