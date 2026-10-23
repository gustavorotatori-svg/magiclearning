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
  Moon,
  QrCode,
  ShieldCheck,
  Smile,
  CheckCircle,
  Bell
} from "lucide-react";
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
  CustomTooltip?: React.ComponentType<any>;
}

export const ParentDashboardFeed = memo(function ParentDashboardFeed({
  activeStudent,
  branding,
  todayOccurrence,
  onNavigateToTab,
  moodTimeline,
  wellnessIndex,
  dominantLabel,
  pendingCobranca,
  eventos,
  comunicados = [],
  momentos = []
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
        // Only render if explicitly enabled in branding
        return (
          <div key="feed-metas" className="w-full">
            <DailyGoalsSection student={activeStudent} branding={branding} />
          </div>
        );

      case "diaadia":
        return (
          <div
            key="feed-diaadia"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h2 className="font-serif font-black text-lg text-slate-950 dark:text-white tracking-tight">
                  Rotina Escolar de Hoje
                </h2>
                <p className="text-xs text-slate-500 font-sans">
                  Acompanhamento pedagógico e bem-estar em tempo real
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToTab("diaadia")}
                className="text-xs font-semibold text-slate-650 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Histórico completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Core Status Indicators - Quiet Typography, Zero Artificial Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-1">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Alimentação
                </span>
                <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                  {todayOccurrence.meals?.lunch === "excelente"
                    ? "Almoço 100% consumido"
                    : todayOccurrence.meals?.lunch === "parcial"
                    ? "Refeição parcial (60%)"
                    : "Cardápio do dia servido"}
                </strong>
                <p className="text-xs text-slate-500">
                  {todayOccurrence.meals?.details || "Alimentou-se com bom apetite."}
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-100 dark:sm:border-slate-800/80 sm:pl-6">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Descanso & Repouso
                </span>
                <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                  {todayOccurrence.sleep?.durationStr || "1h 15min de sono"}
                </strong>
                <p className="text-xs text-slate-500">
                  {todayOccurrence.sleep?.details || "Descansou de forma tranquila."}
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-slate-100 dark:sm:border-slate-800/80 sm:pl-6">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Disposição & Bem-estar
                </span>
                <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                  {todayOccurrence.behaviorState === "otimo" ? "Radiante & Focado" : "Ativo e participativo"}
                </strong>
                <p className="text-xs text-slate-500">
                  Excelente interação com colegas e professores.
                </p>
              </div>
            </div>

            {/* Daily Chronological Progression - Clean & Compact */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Momentos do Dia
              </span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800">
                  <span className="font-mono text-slate-500">07:45</span>
                  <span>Entrada confirmada</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">→</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800">
                  <span className="font-mono text-slate-500">12:00</span>
                  <span>Almoço</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">→</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-emerald-700 dark:text-emerald-400">14:00</span>
                  <span>Oficina Pedagógica</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">→</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-slate-500 border border-slate-200/50 dark:border-slate-800">
                  <span className="font-mono">17:15</span>
                  <span>Previsão de Saída</span>
                </span>
              </div>
            </div>

            {/* Teacher note */}
            {todayOccurrence.teacherNote && (
              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Observação da Coordenação Pedagógica
                </span>
                <p className="text-slate-700 dark:text-slate-300 italic font-serif text-sm">
                  "{todayOccurrence.teacherNote}"
                </p>
              </div>
            )}
          </div>
        );

      case "engajamento":
        // Quiet engagement pill instead of huge chart
        return (
          <div
            key="feed-engajamento"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h3 className="font-serif font-black text-base text-slate-950 dark:text-white">
                Índice de Adaptação & Bem-estar
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhamento contínuo dos últimos 15 dias letivos
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-lg font-serif font-black text-slate-950 dark:text-white">
                  {wellnessIndex}%
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                  {dominantLabel}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToTab("diaadia")}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Ver histórico
              </button>
            </div>
          </div>
        );

      case "academico":
        return (
          <div
            key="feed-academico"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-serif font-black text-base text-slate-950 dark:text-white">
                  Desempenho Acadêmico Recente
                </h3>
                <p className="text-xs text-slate-500">Médias avaliativas do 2º bimestre</p>
              </div>
              <button
                onClick={() => onNavigateToTab("academico")}
                className="text-xs font-semibold text-slate-650 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Boletim completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeStudent.grades.slice(0, 3).map((g, idx) => {
                const score = g.secondBimester || g.firstBimester || 8.0;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate pr-2">
                      {g.subject.split(" (")[0]}
                    </span>
                    <strong className="text-xs font-mono font-bold text-slate-950 dark:text-white shrink-0">
                      {score.toFixed(1)} / 10
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "cobrancas":
      case "financeiro":
        if (!pendingCobranca) return null; // Never clutter screen if all is paid!
        return (
          <div
            key="feed-cobrancas"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block">
                Fatura Escolar Aberta · Vencimento: {pendingCobranca.dueDate}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {pendingCobranca.title}
              </h3>
              <strong className="text-lg font-serif font-black text-slate-950 dark:text-white block">
                R$ {pendingCobranca.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </strong>
            </div>

            <button
              onClick={() => onNavigateToTab("cobrancas")}
              className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              <span>Pagar com Pix Instantâneo</span>
            </button>
          </div>
        );

      case "agenda":
        return eventos && eventos.length > 0 ? (
          <div
            key="feed-agenda"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-black text-base text-slate-950 dark:text-white">
                Próximos Eventos do Calendário
              </h3>
              <button
                onClick={() => onNavigateToTab("diaadia")}
                className="text-xs font-semibold text-slate-650 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {eventos.slice(0, 2).map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] font-bold text-slate-500">
                      {ev.dateStr}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {ev.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {ev.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "comunicados":
        return comunicados && comunicados.length > 0 ? (
          <div
            key="feed-comunicados"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-serif font-black text-base text-slate-950 dark:text-white">
                  Comunicados Oficiais
                </h3>
                <p className="text-xs text-slate-500">Circulares recentes da coordenação</p>
              </div>
              <button
                onClick={() => onNavigateToTab("comunicados")}
                className="text-xs font-semibold text-slate-650 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Ver circulares</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {comunicados.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigateToTab("comunicados")}
                  className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 max-w-md">
                    <span className="text-[10px] font-mono text-slate-400">
                      {c.date} · {c.category || "Geral"}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">
                      {c.title}
                    </h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "momentos":
        return momentos && momentos.length > 0 ? (
          <div
            key="feed-momentos"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-black text-base text-slate-950 dark:text-white">
                Mural de Atividades da Turma
              </h3>
              <button
                onClick={() => onNavigateToTab("diaadia")}
                className="text-xs font-semibold text-slate-650 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Ver fotos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {momentos.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 dark:border-slate-800 group"
                >
                  <img
                    src={m.image}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                    <span className="text-[10px] text-white font-medium truncate">
                      {m.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {effectiveFeedOrder.map((modId) => renderModuleBlock(modId))}
    </div>
  );
});
