import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Utensils,
  Apple,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Calendar,
  Sparkles,
  TrendingUp,
  Droplets,
  Heart,
  Filter,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  FileText,
  Award,
  Clock,
  ShieldCheck,
  X
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from "recharts";
import { Estudante, Ocorrencia } from "../types";

export interface WeeklyNutritionSummaryWidgetProps {
  activeStudent: Estudante;
  occurrences: Ocorrencia[];
  selectedPeriod?: "recent" | "july" | "june" | "all";
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export type MealStatusType = "excelente" | "parcial" | "recusou" | "nao_se_aplica";

export interface NutritionDayItem {
  id: string;
  day: string;
  shortDay: string;
  fullDate: string;
  dayName: string;
  lunchStatus: MealStatusType;
  snackStatus: MealStatusType;
  lunchMeal: string;
  snackMeal: string;
  hydrationMl: number;
  dietaryTags: string[];
  repeatedPlate: boolean;
  fruitsAccepted: boolean;
  notes: string;
  // Numerical mappings for Recharts stacked visualization
  // 1 unit each per meal (Lunch = 1, Snack = 1 => Total 2 units per day)
  excelenteUnits: number; // 0, 1, 2
  parcialUnits: number;   // 0, 1, 2
  recusouUnits: number;   // 0, 1, 2
  // Percentages (0 to 50% for lunch, 0 to 50% for snack => Total 100%)
  lunchPercent: number;   // 50 (excelente), 35 (parcial), 10 (recusou)
  snackPercent: number;   // 50 (excelente), 35 (parcial), 10 (recusou)
  totalPercent: number;   // 0 to 100%
  // Status breakdown score for stacked status view
  excelenteScore: number; // percentage contributed by excelente meals
  parcialScore: number;   // percentage contributed by parcial meals
  recusouScore: number;   // percentage contributed by recusou meals
}

// Visual status tokens (WCAG AA Compliant, warm editorial style)
export const NUTRITION_STATUS_CONFIG: Record<
  "excelente" | "parcial" | "recusou",
  {
    label: string;
    sublabel: string;
    score: number;
    color: string;
    fillColor: string;
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  excelente: {
    label: "Excelente",
    sublabel: "100% do Prato (Prato Limpo)",
    score: 100,
    color: "#059669",
    fillColor: "#059669",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-800 dark:text-emerald-300",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/60",
    badgeText: "text-emerald-900 dark:text-emerald-200",
    badgeBorder: "border-emerald-300 dark:border-emerald-700",
    icon: CheckCircle2,
    description: "Aceitação integral de todos os grupos alimentares servidos."
  },
  parcial: {
    label: "Parcial",
    sublabel: "50% a 75% da Refeição",
    score: 65,
    color: "#d97706",
    fillColor: "#d97706",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-300",
    badgeBg: "bg-amber-100 dark:bg-amber-900/60",
    badgeText: "text-amber-900 dark:text-amber-200",
    badgeBorder: "border-amber-300 dark:border-amber-700",
    icon: AlertCircle,
    description: "Comeu a porção principal ou frutas, deixando parte dos legumes/salada."
  },
  recusou: {
    label: "Recusou",
    sublabel: "0% a 25% (Baixo Apetite)",
    score: 20,
    color: "#e11d48",
    fillColor: "#e11d48",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-800 dark:text-rose-300",
    badgeBg: "bg-rose-100 dark:bg-rose-900/60",
    badgeText: "text-rose-900 dark:text-rose-200",
    badgeBorder: "border-rose-300 dark:border-rose-700",
    icon: XCircle,
    description: "Recusou o cardápio principal ou aceitou apenas líquidos/água."
  }
};

// Preset menu catalogue for school routine
const DEFAULT_LUNCH_MENUS = [
  "Arroz integral, feijão carioquinha, iscas de frango grelhado e cenourinha no vapor",
  "Arroz branco, feijão preto, filé de tilápia assada com ervas e purê de abóbora cabotiá",
  "Macarrãozinho ao molho de tomate caseiro, almôndegas artesanais e salada de alface e tomate",
  "Risoto de legumes com cubos de frango caipira, caldinho de feijão e brócolis cozido",
  "Arroz com cenoura, feijão carioca, carne moída refogada com mandioquinha e chuchu",
  "Feijão tropeiro suave (sem pimenta), arroz branco, sobrecoxa desossada e couve refogada",
  "Sopa nutritiva de legumes com macarrão letrinhas e carne desfiada com torradinhas"
];

const DEFAULT_SNACK_MENUS = [
  "Saladinha de frutas da estação (banana, maçã e melão) com aveia em flocos e suco de uva integral",
  "Pão de queijo artesanal da cantina, melancia em cubinhos e água de coco",
  "Bolo caseiro de banana sem açúcar, fatias de mamão formosa e leite morno com canela",
  "Iogurte natural batido com morango fresco e biscoitinhos de polvilho",
  "Sanduichinho natural de ricota com cenoura ralada, suco de tangerina e maçã fatiada",
  "Torta integral de legumes e queijo branco com cubos de abacaxi doce",
  "Vitamina de banana com mamão e aveia acompanhada de torrada integral com geleia 100% fruta"
];

export function WeeklyNutritionSummaryWidget({
  activeStudent,
  occurrences,
  selectedPeriod = "recent",
  onToast
}: WeeklyNutritionSummaryWidgetProps) {
  // Chart Display Mode Toggle
  const [chartMode, setChartMode] = useState<"status_stacked" | "meals_stacked" | "lunch_only" | "snack_only">("status_stacked");
  // Expandable Detailed Menu Drawer
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  // Selected Day for quick detail modal
  const [selectedDayDetail, setSelectedDayDetail] = useState<NutritionDayItem | null>(null);
  // Filter status for detail list
  const [statusFilter, setStatusFilter] = useState<"all" | "excelente" | "parcial" | "recusou">("all");
  // Quick Custom Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNoteDay, setNewNoteDay] = useState("Sáb");
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteAuthor, setNewNoteAuthor] = useState("Nutricionista Camila");

  // Construct 7-day Nutrition dataset based on student occurrences
  const nutrition7DaysData = useMemo<NutritionDayItem[]>(() => {
    // Generate dates based on selected timeframe
    let baseWeek = [
      { day: "Dom (02/08)", short: "Dom", fullDate: "02/08/2026", dayName: "Domingo", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 950, repeated: true, fruits: true },
      { day: "Seg (03/08)", short: "Seg", fullDate: "03/08/2026", dayName: "Segunda-feira", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 900, repeated: false, fruits: true },
      { day: "Ter (04/08)", short: "Ter", fullDate: "04/08/2026", dayName: "Terça-feira", defaultLunch: "excelente", defaultSnack: "parcial", hydration: 850, repeated: false, fruits: true },
      { day: "Qua (05/08)", short: "Qua", fullDate: "05/08/2026", dayName: "Quarta-feira", defaultLunch: activeStudent.id === "est-2" ? "recusou" : "parcial", defaultSnack: "excelente", hydration: 800, repeated: false, fruits: false },
      { day: "Qui (06/08)", short: "Qui", fullDate: "06/08/2026", dayName: "Quinta-feira", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 950, repeated: true, fruits: true },
      { day: "Sex (Ontem)", short: "Sex", fullDate: "07/08/2026", dayName: "Sexta-feira", defaultLunch: "parcial", defaultSnack: "excelente", hydration: 880, repeated: false, fruits: true },
      { day: "Sáb (Hoje)", short: "Sáb", fullDate: "08/08/2026", dayName: "Sábado", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 920, repeated: true, fruits: true }
    ];

    if (selectedPeriod === "july") {
      baseWeek = [
        { day: "Sex (25/07)", short: "25 Jul", fullDate: "25/07/2026", dayName: "Sexta-feira", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 900, repeated: true, fruits: true },
        { day: "Sáb (26/07)", short: "26 Jul", fullDate: "26/07/2026", dayName: "Sábado", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 850, repeated: false, fruits: true },
        { day: "Dom (27/07)", short: "27 Jul", fullDate: "27/07/2026", dayName: "Domingo", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 950, repeated: true, fruits: true },
        { day: "Seg (28/07)", short: "28 Jul", fullDate: "28/07/2026", dayName: "Segunda-feira", defaultLunch: "parcial", defaultSnack: "excelente", hydration: 800, repeated: false, fruits: true },
        { day: "Ter (29/07)", short: "29 Jul", fullDate: "29/07/2026", dayName: "Terça-feira", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 920, repeated: true, fruits: true },
        { day: "Qua (30/07)", short: "30 Jul", fullDate: "30/07/2026", dayName: "Quarta-feira", defaultLunch: "excelente", defaultSnack: "parcial", hydration: 860, repeated: false, fruits: true },
        { day: "Qui (31/07)", short: "31 Jul", fullDate: "31/07/2026", dayName: "Quinta-feira", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 950, repeated: true, fruits: true }
      ];
    } else if (selectedPeriod === "june") {
      baseWeek = [
        { day: "Qua (24/06)", short: "24 Jun", fullDate: "24/06/2026", dayName: "Quarta-feira", defaultLunch: "parcial", defaultSnack: "excelente", hydration: 820, repeated: false, fruits: true },
        { day: "Qui (25/06)", short: "25 Jun", fullDate: "25/06/2026", dayName: "Quinta-feira", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 900, repeated: true, fruits: true },
        { day: "Sex (26/06)", short: "26 Jun", fullDate: "26/06/2026", dayName: "Sexta-feira", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 920, repeated: true, fruits: true },
        { day: "Sáb (27/06)", short: "27 Jun", fullDate: "27/06/2026", dayName: "Sábado", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 870, repeated: false, fruits: true },
        { day: "Dom (28/06)", short: "28 Jun", fullDate: "28/06/2026", dayName: "Domingo", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 950, repeated: true, fruits: true },
        { day: "Seg (29/06)", short: "29 Jun", fullDate: "29/06/2026", dayName: "Segunda-feira", defaultLunch: "parcial", defaultSnack: "parcial", hydration: 750, repeated: false, fruits: false },
        { day: "Ter (30/06)", short: "30 Jun", fullDate: "30/06/2026", dayName: "Terça-feira", defaultLunch: "excelente", defaultSnack: "excelente", hydration: 910, repeated: true, fruits: true }
      ];
    }

    return baseWeek.map((item, idx) => {
      // Map occurrence state if available (from newest idx=6 to oldest)
      const occForDay = idx === 6 ? occurrences[0] : idx === 5 ? occurrences[1] : idx === 4 ? occurrences[2] : null;
      
      const lunchStatus: MealStatusType = occForDay?.meals?.lunch || (item.defaultLunch as MealStatusType);
      const snackStatus: MealStatusType = occForDay?.meals?.snack || (item.defaultSnack as MealStatusType);

      // Score calculation
      const lunchPts = lunchStatus === "excelente" ? 50 : lunchStatus === "parcial" ? 35 : 10;
      const snackPts = snackStatus === "excelente" ? 50 : snackStatus === "parcial" ? 35 : 10;
      const totalPct = lunchPts + snackPts;

      // Status Units calculation (how many meals in each status category on that day: 0, 1, or 2)
      let exUnits = 0;
      let paUnits = 0;
      let reUnits = 0;

      if (lunchStatus === "excelente") exUnits++;
      else if (lunchStatus === "parcial") paUnits++;
      else if (lunchStatus === "recusou") reUnits++;

      if (snackStatus === "excelente") exUnits++;
      else if (snackStatus === "parcial") paUnits++;
      else if (snackStatus === "recusou") reUnits++;

      // Status score distribution for percentage stack (0 to 100%)
      const exScore = (lunchStatus === "excelente" ? 50 : 0) + (snackStatus === "excelente" ? 50 : 0);
      const paScore = (lunchStatus === "parcial" ? 35 : 0) + (snackStatus === "parcial" ? 35 : 0);
      const reScore = (lunchStatus === "recusou" ? 15 : 0) + (snackStatus === "recusou" ? 15 : 0);

      const notes = occForDay?.meals?.details || 
        (lunchStatus === "excelente" && snackStatus === "excelente"
          ? `${activeStudent.name.split(" ")[0]} almoçou com excelente apetite, aceitou todos os legumes e consumiu as frutas do lanche com entusiasmo.`
          : lunchStatus === "parcial"
          ? `${activeStudent.name.split(" ")[0]} comeu a porção de proteína e carboidrato, mas deixou uma parte da salada. Lanche bem aceito.`
          : `${activeStudent.name.split(" ")[0]} apresentou menor apetite no almoço. Oferecido suporte com hidratação e lanche equilibrado.`);

      const dietaryTags: string[] = [
        "Cardápio Balanceado",
        item.fruits ? "Frutas Frescas" : "Adaptação de Fibras",
        item.repeated ? "Repetiu o Prato 🍲" : "Porção Adequada",
        item.hydration >= 900 ? "Hidratação Alta 💧" : "Hidratação Normal"
      ];

      return {
        id: `nutri-day-${idx}-${item.short}`,
        day: item.day,
        shortDay: item.short,
        fullDate: item.fullDate,
        dayName: item.dayName,
        lunchStatus,
        snackStatus,
        lunchMeal: DEFAULT_LUNCH_MENUS[idx % DEFAULT_LUNCH_MENUS.length],
        snackMeal: DEFAULT_SNACK_MENUS[idx % DEFAULT_SNACK_MENUS.length],
        hydrationMl: item.hydration,
        dietaryTags,
        repeatedPlate: item.repeated,
        fruitsAccepted: item.fruits,
        notes,
        excelenteUnits: exUnits,
        parcialUnits: paUnits,
        recusouUnits: reUnits,
        lunchPercent: lunchPts,
        snackPercent: snackPts,
        totalPercent: totalPct,
        excelenteScore: exScore,
        parcialScore: paScore,
        recusouScore: reScore
      };
    });
  }, [occurrences, activeStudent, selectedPeriod]);

  // Aggregate KPI Statistics
  const nutritionStats = useMemo(() => {
    let totalMeals = nutrition7DaysData.length * 2; // 7 days x 2 meals = 14 meals
    let excelenteCount = 0;
    let parcialCount = 0;
    let recusouCount = 0;
    let totalHydration = 0;
    let totalScoreSum = 0;

    nutrition7DaysData.forEach((d) => {
      if (d.lunchStatus === "excelente") excelenteCount++;
      else if (d.lunchStatus === "parcial") parcialCount++;
      else if (d.lunchStatus === "recusou") recusouCount++;

      if (d.snackStatus === "excelente") excelenteCount++;
      else if (d.snackStatus === "parcial") parcialCount++;
      else if (d.snackStatus === "recusou") recusouCount++;

      totalHydration += d.hydrationMl;
      totalScoreSum += d.totalPercent;
    });

    const excelentePercent = Math.round((excelenteCount / totalMeals) * 100);
    const parcialPercent = Math.round((parcialCount / totalMeals) * 100);
    const recusouPercent = Math.round((recusouCount / totalMeals) * 100);
    const avgScore = Math.round(totalScoreSum / nutrition7DaysData.length);
    const avgHydration = Math.round(totalHydration / nutrition7DaysData.length);

    return {
      totalMeals,
      excelenteCount,
      excelentePercent,
      parcialCount,
      parcialPercent,
      recusouCount,
      recusouPercent,
      avgScore,
      avgHydration
    };
  }, [nutrition7DaysData]);

  // Filtered detailed items for the modal or accordion
  const filteredDayItems = useMemo(() => {
    if (statusFilter === "all") return nutrition7DaysData;
    return nutrition7DaysData.filter(
      (d) => d.lunchStatus === statusFilter || d.snackStatus === statusFilter
    );
  }, [nutrition7DaysData, statusFilter]);

  // Custom Stacked Tooltip
  const CustomNutritionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: NutritionDayItem = payload[0].payload;
      const lunchConf = NUTRITION_STATUS_CONFIG[data.lunchStatus as keyof typeof NUTRITION_STATUS_CONFIG] || NUTRITION_STATUS_CONFIG.excelente;
      const snackConf = NUTRITION_STATUS_CONFIG[data.snackStatus as keyof typeof NUTRITION_STATUS_CONFIG] || NUTRITION_STATUS_CONFIG.excelente;

      return (
        <div
          id="nutrition-stacked-barchart-tooltip"
          className="bg-slate-950/95 text-slate-100 p-3.5 rounded-2xl shadow-2xl border border-amber-400/40 text-xs max-w-xs sm:max-w-sm space-y-2.5 backdrop-blur-md z-50 pointer-events-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-400">
                <Utensils className="w-3.5 h-3.5" />
              </span>
              <div>
                <span className="font-bold font-serif text-amber-200 text-sm block leading-none">
                  {data.day}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {data.dayName} • {data.fullDate}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-black text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800">
              {data.totalPercent}% Ingestão
            </span>
          </div>

          {/* Lunch Details */}
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <span>🍲 Almoço:</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border uppercase ${lunchConf.badgeBg} ${lunchConf.badgeText} ${lunchConf.badgeBorder}`}>
                {lunchConf.label}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-300 leading-snug line-clamp-2">
              {data.lunchMeal}
            </p>
          </div>

          {/* Snack Details */}
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                <span>🥪 Lanche da Tarde:</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border uppercase ${snackConf.badgeBg} ${snackConf.badgeText} ${snackConf.badgeBorder}`}>
                {snackConf.label}
              </span>
            </div>
            <p className="text-[10.5px] text-slate-300 leading-snug line-clamp-2">
              {data.snackMeal}
            </p>
          </div>

          {/* Hydration & Special Tags */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <span className="flex items-center gap-1 text-cyan-400 font-mono font-medium">
              <Droplets className="w-3 h-3" />
              <span>{data.hydrationMl} ml consumidos</span>
            </span>
            {data.repeatedPlate && (
              <span className="text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-700/50 text-[9px]">
                🍲 Repetiu Prato
              </span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Quick action: Add nutritional note / restriction
  const handleSaveNutritionalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) {
      onToast?.("Por favor, preencha a anotação nutricional.", "error");
      return;
    }
    setIsNoteModalOpen(false);
    onToast?.(`Anotação nutricional para ${newNoteDay} registrada com sucesso!`, "success");
    setNewNoteText("");
  };

  return (
    <div
      id="weekly-nutrition-summary-widget"
      className="bg-[#fffdfa] dark:bg-slate-900/95 border border-amber-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 transition-all"
    >
      {/* ========================================================================= */}
      {/* 1. HEADER & STUDENT CONTEXT                                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 border-b border-amber-100/90 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Apple className="w-3 h-3" />
              <span>Cardápio & Apetite Escolar</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              7 Dias Monitorados
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#423326] dark:text-amber-100 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Resumo Nutricional Semanal</span>
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-400 font-light leading-relaxed max-w-2xl">
            Acompanhamento do consumo de <strong>almoço</strong> e <strong>lanche</strong> de {activeStudent.name}, categorizado entre status <em>excelente</em>, <em>parcial</em> e <em>recusou</em>.
          </p>
        </div>

        {/* Action buttons & mode selectors */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {/* View Menu Detail Button */}
          <button
            id="nutrition-toggle-details-btn"
            type="button"
            onClick={() => setIsDetailsOpen(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fcfaf2] dark:bg-slate-800 hover:bg-amber-100/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-amber-200/70 dark:border-slate-700 rounded-xl text-xs font-bold font-serif transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            title="Ver cardápio diário e diário de aceitação"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>{isDetailsOpen ? "Ocultar Cardápio" : "Ver Cardápio dos 7 Dias"}</span>
            {isDetailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Note Button */}
          <button
            id="nutrition-add-note-btn"
            type="button"
            onClick={() => setIsNoteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold font-serif shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            title="Registrar observação dietética da nutricionista"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Obs. Nutricional</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KEY METRIC INDICATORS (KPIs)                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Excelente Pill */}
        <div className="bg-[#fcfaf2] dark:bg-slate-900/80 p-3 rounded-xl border border-emerald-200/60 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Excelente (Prato Limpo)</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 font-serif">
              {nutritionStats.excelentePercent}%
            </span>
            <span className="text-[10.5px] font-mono text-slate-500 font-semibold">
              {nutritionStats.excelenteCount} de {nutritionStats.totalMeals} refeições
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${nutritionStats.excelentePercent}%` }}
            />
          </div>
        </div>

        {/* Parcial Pill */}
        <div className="bg-[#fcfaf2] dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/60 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>Consumo Parcial</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-lg sm:text-xl font-black text-amber-700 dark:text-amber-400 font-serif">
              {nutritionStats.parcialPercent}%
            </span>
            <span className="text-[10.5px] font-mono text-slate-500 font-semibold">
              {nutritionStats.parcialCount} de {nutritionStats.totalMeals}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${nutritionStats.parcialPercent}%` }}
            />
          </div>
        </div>

        {/* Recusou Pill */}
        <div className="bg-[#fcfaf2] dark:bg-slate-900/80 p-3 rounded-xl border border-rose-200/60 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-600" />
              <span>Recusa / Baixo Apetite</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-lg sm:text-xl font-black text-rose-700 dark:text-rose-400 font-serif">
              {nutritionStats.recusouPercent}%
            </span>
            <span className="text-[10.5px] font-mono text-slate-500 font-semibold">
              {nutritionStats.recusouCount} de {nutritionStats.totalMeals}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${nutritionStats.recusouPercent}%` }}
            />
          </div>
        </div>

        {/* Hydration / Healthy Habits Pill */}
        <div className="bg-[#fcfaf2] dark:bg-slate-900/80 p-3 rounded-xl border border-cyan-200/60 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-400 flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-600" />
              <span>Hidratação Média</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-lg sm:text-xl font-black text-cyan-700 dark:text-cyan-400 font-serif">
              {nutritionStats.avgHydration} ml
            </span>
            <span className="text-[10.5px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
              Meta: 900ml/dia
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((nutritionStats.avgHydration / 1000) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RECHARTS STACKED BAR CHART SECTION                                     */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-1">
        {/* Chart Toolbar: View Mode Buttons & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fcfaf2] dark:bg-slate-950/60 p-2.5 rounded-xl border border-amber-200/50 dark:border-slate-800 text-xs">
          {/* Chart Mode Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#423326] dark:text-amber-200 font-serif mr-1">
              Modo do Gráfico:
            </span>
            {[
              { id: "status_stacked", label: "Distribuição por Status (Empilhado)", icon: Layers },
              { id: "meals_stacked", label: "Almoço + Lanche (Empilhados)", icon: Utensils },
              { id: "lunch_only", label: "Apenas Almoço", icon: CheckCircle2 },
              { id: "snack_only", label: "Apenas Lanche", icon: Apple }
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = chartMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setChartMode(mode.id as any)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-800 text-white shadow-2xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Legend Badges */}
          <div className="flex items-center gap-2 flex-wrap text-[10.5px]">
            <span className="flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#059669] inline-block" />
              <span>Excelente</span>
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#d97706] inline-block" />
              <span>Parcial</span>
            </span>
            <span className="flex items-center gap-1 font-bold text-rose-800 dark:text-rose-300">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#e11d48] inline-block" />
              <span>Recusou</span>
            </span>
          </div>
        </div>

        {/* RECHARTS STACKED BAR CHART CONTAINER */}
        <div className="relative w-full aspect-[4/3] xs:aspect-[16/10] sm:aspect-[16/8] md:aspect-[2.4/1] min-h-[240px] max-h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={nutrition7DaysData}
              margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1e8dc" vertical={false} opacity={0.6} />
              <XAxis
                dataKey="shortDay"
                tick={{ fontSize: 11, fill: "#78716c", fontWeight: 700 }}
                axisLine={{ stroke: "#e7e5e4" }}
                tickLine={false}
              />

              {/* Mode 1: Status Units Stacked (Total = 2 meals per day) */}
              {chartMode === "status_stacked" && (
                <>
                  <YAxis
                    domain={[0, 2]}
                    ticks={[0, 1, 2]}
                    tickFormatter={(v) => (v === 2 ? "2 ref." : v === 1 ? "1 ref." : "0")}
                    tick={{ fontSize: 10, fill: "#78716c", fontWeight: 600 }}
                    axisLine={{ stroke: "#e7e5e4" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomNutritionTooltip />} />
                  <ReferenceLine y={2} stroke="#059669" strokeDasharray="3 3" opacity={0.4} />

                  <Bar
                    dataKey="excelenteUnits"
                    name="Excelente (100% do prato)"
                    stackId="statusStack"
                    fill="#059669"
                    maxBarSize={38}
                    radius={[0, 0, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={700}
                  />
                  <Bar
                    dataKey="parcialUnits"
                    name="Parcial (50% a 75%)"
                    stackId="statusStack"
                    fill="#d97706"
                    maxBarSize={38}
                    radius={[0, 0, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={700}
                  />
                  <Bar
                    dataKey="recusouUnits"
                    name="Recusou (Baixa ingestão)"
                    stackId="statusStack"
                    fill="#e11d48"
                    maxBarSize={38}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={700}
                  />
                </>
              )}

              {/* Mode 2: Meals Stacked (Almoço + Lanche = 100%) */}
              {chartMode === "meals_stacked" && (
                <>
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 10, fill: "#78716c", fontWeight: 600 }}
                    axisLine={{ stroke: "#e7e5e4" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomNutritionTooltip />} />
                  <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />

                  <Bar
                    dataKey="lunchPercent"
                    name="Almoço (0-50%)"
                    stackId="mealStack"
                    fill="#059669"
                    maxBarSize={38}
                    radius={[0, 0, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={700}
                  />
                  <Bar
                    dataKey="snackPercent"
                    name="Lanche da Tarde (0-50%)"
                    stackId="mealStack"
                    fill="#10b981"
                    maxBarSize={38}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={700}
                  />
                </>
              )}

              {/* Mode 3: Lunch Only */}
              {chartMode === "lunch_only" && (
                <>
                  <YAxis
                    domain={[0, 55]}
                    ticks={[0, 10, 35, 50]}
                    tickFormatter={(v) => (v === 50 ? "Excelente" : v === 35 ? "Parcial" : v === 10 ? "Recusou" : "0")}
                    tick={{ fontSize: 9.5, fill: "#78716c", fontWeight: 600 }}
                    axisLine={{ stroke: "#e7e5e4" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomNutritionTooltip />} />
                  <Bar
                    dataKey="lunchPercent"
                    name="Almoço"
                    maxBarSize={42}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={700}
                  >
                    {nutrition7DaysData.map((entry, index) => {
                      const color =
                        entry.lunchStatus === "excelente"
                          ? "#059669"
                          : entry.lunchStatus === "parcial"
                          ? "#d97706"
                          : "#e11d48";
                      return <Cell key={`cell-lunch-${index}`} fill={color} />;
                    })}
                  </Bar>
                </>
              )}

              {/* Mode 4: Snack Only */}
              {chartMode === "snack_only" && (
                <>
                  <YAxis
                    domain={[0, 55]}
                    ticks={[0, 10, 35, 50]}
                    tickFormatter={(v) => (v === 50 ? "Excelente" : v === 35 ? "Parcial" : v === 10 ? "Recusou" : "0")}
                    tick={{ fontSize: 9.5, fill: "#78716c", fontWeight: 600 }}
                    axisLine={{ stroke: "#e7e5e4" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomNutritionTooltip />} />
                  <Bar
                    dataKey="snackPercent"
                    name="Lanche da Tarde"
                    maxBarSize={42}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={700}
                  >
                    {nutrition7DaysData.map((entry, index) => {
                      const color =
                        entry.snackStatus === "excelente"
                          ? "#059669"
                          : entry.snackStatus === "parcial"
                          ? "#d97706"
                          : "#e11d48";
                      return <Cell key={`cell-snack-${index}`} fill={color} />;
                    })}
                  </Bar>
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Nutritional Guidance Note below chart */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/70 dark:border-amber-900/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <p className="text-amber-950 dark:text-amber-200 text-[11px] leading-tight">
              <strong>Parecer Nutricional:</strong> {activeStudent.name} manteve excelente aceitação das refeições principais com boa diversidade de legumes e hidratação regular durante as atividades escolares.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-400 shrink-0">
            Nutricionista RT: CRN-3 48.912
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. EXPANDABLE 7-DAY NUTRITIONAL MENU & LOG DETAILS                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isDetailsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden space-y-4 pt-3 border-t border-amber-100 dark:border-slate-800"
          >
            {/* Filter Bar for Menu Items */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h4 className="text-sm font-bold font-serif text-[#423326] dark:text-amber-100">
                  Diário Nutricional & Cardápio dos 7 Dias
                </h4>
              </div>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Filtrar:</span>
                {[
                  { id: "all", label: "Todos (7 dias)" },
                  { id: "excelente", label: "🌟 Excelente" },
                  { id: "parcial", label: "⚠️ Parcial" },
                  { id: "recusou", label: "🚫 Recusou" }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                      statusFilter === f.id
                        ? "bg-amber-800 text-white shadow-2xs"
                        : "bg-[#fcfaf2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-amber-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of 7 Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDayItems.map((item) => {
                const lunchConf = NUTRITION_STATUS_CONFIG[item.lunchStatus as keyof typeof NUTRITION_STATUS_CONFIG] || NUTRITION_STATUS_CONFIG.excelente;
                const snackConf = NUTRITION_STATUS_CONFIG[item.snackStatus as keyof typeof NUTRITION_STATUS_CONFIG] || NUTRITION_STATUS_CONFIG.excelente;

                return (
                  <div
                    key={item.id}
                    className="bg-[#fcfaf2]/70 dark:bg-slate-950/60 p-3.5 rounded-xl border border-amber-200/60 dark:border-slate-800 space-y-2.5 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-2xs"
                  >
                    {/* Item Top Row */}
                    <div className="flex items-center justify-between border-b border-amber-100/80 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold font-serif text-xs">
                          {item.shortDay}
                        </span>
                        <div>
                          <span className="font-bold text-xs text-[#423326] dark:text-amber-100 font-serif block">
                            {item.day}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.dayName} • {item.fullDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          💧 {item.hydrationMl}ml
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedDayDetail(item)}
                          className="p-1 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Ver detalhes completos"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Almoço Row */}
                    <div className="space-y-1 bg-white/80 dark:bg-slate-900 p-2 rounded-lg border border-amber-100/60 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-[#423326] dark:text-amber-200 flex items-center gap-1 font-serif">
                          <span>🍲 Almoço:</span>
                        </span>
                        <span className={`text-[9.5px] font-bold px-2 py-0.2 rounded-full border uppercase ${lunchConf.badgeBg} ${lunchConf.badgeText} ${lunchConf.badgeBorder}`}>
                          {lunchConf.label}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-snug">
                        {item.lunchMeal}
                      </p>
                    </div>

                    {/* Lanche Row */}
                    <div className="space-y-1 bg-white/80 dark:bg-slate-900 p-2 rounded-lg border border-amber-100/60 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] text-[#423326] dark:text-amber-200 flex items-center gap-1 font-serif">
                          <span>🥪 Lanche:</span>
                        </span>
                        <span className={`text-[9.5px] font-bold px-2 py-0.2 rounded-full border uppercase ${snackConf.badgeBg} ${snackConf.badgeText} ${snackConf.badgeBorder}`}>
                          {snackConf.label}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-snug">
                        {item.snackMeal}
                      </p>
                    </div>

                    {/* Teacher/Nutri Note */}
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic pt-0.5 leading-snug line-clamp-2">
                      "{item.notes}"
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. QUICK NUTRITIONAL NOTE MODAL                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isNoteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 bg-[#fcfaf4] dark:bg-slate-950/80 border-b border-amber-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                    <Apple className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif text-[#423326] dark:text-amber-100">
                      Adicionar Observação Nutricional
                    </h3>
                    <p className="text-[10.5px] text-slate-500">
                      Registro dietético e de aceitação para {activeStudent.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveNutritionalNote} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-serif mb-1">
                    Dia Referente:
                  </label>
                  <select
                    value={newNoteDay}
                    onChange={(e) => setNewNoteDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none"
                  >
                    {nutrition7DaysData.map((d) => (
                      <option key={d.id} value={d.shortDay}>
                        {d.day} ({d.fullDate})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-serif mb-1">
                    Observação ou Ajuste de Cardápio:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Ex: Nicolas aceitou muito bem a salada de beterraba e pediu para repetir a porção de frutas no lanche da tarde."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Profissional Responsável:
                  </label>
                  <input
                    type="text"
                    value={newNoteAuthor}
                    onChange={(e) => setNewNoteAuthor(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNoteModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold font-serif shadow-xs cursor-pointer"
                  >
                    Salvar Observação
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. DAY DETAIL MODAL                                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedDayDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🥗</span>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 font-mono block">
                      Detalhamento Nutricional
                    </span>
                    <h4 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
                      {selectedDayDetail.day} ({selectedDayDetail.fullDate})
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDayDetail(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                {/* Almoço Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100 font-serif">
                      🍲 Cardápio do Almoço
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border uppercase ${
                      NUTRITION_STATUS_CONFIG[selectedDayDetail.lunchStatus as keyof typeof NUTRITION_STATUS_CONFIG]?.badgeBg
                    } ${
                      NUTRITION_STATUS_CONFIG[selectedDayDetail.lunchStatus as keyof typeof NUTRITION_STATUS_CONFIG]?.badgeText
                    }`}>
                      {selectedDayDetail.lunchStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedDayDetail.lunchMeal}
                  </p>
                </div>

                {/* Lanche Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-100 font-serif">
                      🥪 Cardápio do Lanche
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border uppercase ${
                      NUTRITION_STATUS_CONFIG[selectedDayDetail.snackStatus as keyof typeof NUTRITION_STATUS_CONFIG]?.badgeBg
                    } ${
                      NUTRITION_STATUS_CONFIG[selectedDayDetail.snackStatus as keyof typeof NUTRITION_STATUS_CONFIG]?.badgeText
                    }`}>
                      {selectedDayDetail.snackStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedDayDetail.snackMeal}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedDayDetail.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800 text-[10px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Notes */}
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/50 dark:border-amber-900/40 space-y-1">
                  <span className="text-[10.5px] font-bold text-amber-900 dark:text-amber-300 font-serif block">
                    Observações da Equipe Escolar:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 italic text-[11px] leading-relaxed">
                    "{selectedDayDetail.notes}"
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedDayDetail(null)}
                    className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold cursor-pointer text-xs"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WeeklyNutritionSummaryWidget;
