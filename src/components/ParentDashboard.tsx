import React, { useState, memo } from "react";
import { PediatricianReportModal } from "./PediatricianReportModal";
import StudentPhotoCameraModal from "./StudentPhotoCameraModal";
import { DailyGoalsSection } from "./DailyGoalsSection";
import { ParentDashboardFeed } from "./ParentDashboardFeed";
import { SearchBar } from "./SearchBar";
import { SearchTarget } from "./GlobalSearchModal";
import { motion } from "motion/react";
import {
  Heart,
  Calendar,
  DollarSign,
  GraduationCap,
  Sparkles,
  Smile,
  Clock,
  ArrowRight,
  ChevronRight,
  QrCode,
  AlertCircle,
  Coffee,
  Moon,
  TrendingUp,
  Award,
  Phone,
  ShieldCheck,
  CheckCircle,
  FileText,
  Activity,
  BookOpen,
  Info,
  Camera
} from "lucide-react";
import { Estudante, Cobranca, Comunicado, Momento, Evento } from "../types";
import { DEFAULT_FEED_MODULE_ORDER } from "../utils/whiteLabelDefaults";
import { RecommendationEngineWidget } from "./RecommendationEngineWidget";
import { trackUserActivity } from "../services/recommendationEngine";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xl max-w-xs text-xs space-y-2 z-50">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 font-bold">{data.date}</span>
          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
            data.isReal 
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/30" 
              : "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200/30"
          }`}>
            {data.isReal ? "Registro Real" : "Histórico"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">🎭</span>
          <span className="font-black text-slate-850 dark:text-white text-xs">{data.label}</span>
        </div>
        <p className="text-[10px] text-slate-650 dark:text-slate-400 italic bg-slate-50/50 dark:bg-slate-950/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800 leading-normal">
          "{data.note}"
        </p>
      </div>
    );
  }
  return null;
};

interface ParentDashboardProps {
  estudantes: Estudante[];
  selectedStudentId: string;
  cobrancas: Cobranca[];
  comunicados: Comunicado[];
  momentos: Momento[];
  eventos: Evento[];
  onNavigateToTab: (tab: "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso") => void;
  onOpenQrCode: () => void;
  onStartTour?: () => void;
  onSelectSearchResult?: (target: SearchTarget) => void;
  onOpenFullSearch?: () => void;
  branding?: any;
  onUpdateStudentPhoto?: (studentId: string, photoUrl: string) => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export const ParentDashboard = memo(function ParentDashboard({
  estudantes,
  selectedStudentId,
  cobrancas,
  comunicados,
  momentos,
  eventos,
  onNavigateToTab,
  onOpenQrCode,
  onStartTour,
  onSelectSearchResult,
  onOpenFullSearch,
  branding,
  onUpdateStudentPhoto,
  onToast,
}: ParentDashboardProps) {
  const activeStudent = estudantes.find((e) => e.id === selectedStudentId) || estudantes[0];
  const [isPediatraModalOpen, setIsPediatraModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  if (!activeStudent) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
        <p className="text-slate-500 text-sm">Carregando dados do estudante...</p>
      </div>
    );
  }

  // Get today's occurrence or mock a highly aesthetic one
  const todayOccurrence = activeStudent.occurrences?.[0] || {
    meals: { lunch: "excelente", snack: "excelente", details: "Almoçou toda a refeição com gosto." },
    sleep: { durationStr: "1h 15min", details: "Dormiu tranquilamente." },
    behaviorState: "otimo",
    teacherNote: "Teve uma participação exemplar e engajada nas dinâmicas de hoje."
  };

  // Helper for deterministic seeded moods
  const getSeededMood = (studentId: string, dayIndex: number) => {
    const str = studentId + dayIndex.toString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const val = Math.abs(hash % 100);
    if (val < 45) {
      return { state: "otimo", score: 4, label: "Radiante 🌟", note: "Participativo, alegre e muito focado nas dinâmicas pedagógicas." };
    } else if (val < 80) {
      return { state: "agitado", score: 3, label: "Animado ⚡", note: "Super ativo, cheio de energia e interativo nas brincadeiras." };
    } else if (val < 93) {
      return { state: "cansado", score: 2, label: "Calmo 💤", note: "Ficou calmo, tranquilo e descansou bem no momento da soneca." };
    } else {
      return { state: "triste", score: 1, label: "Dengoso 🧸", note: "Sentiu um pouco de saudades de casa no início, mas se acalmou com carinho." };
    }
  };

  // Compile 15-day mood timeline (using real occurrences and deterministic seed data)
  const moodTimeline = React.useMemo(() => {
    const dates = [
      "24/06", "25/06", "26/06", "29/06", "30/06", 
      "01/07", "02/07", "03/07", "06/07", "07/07", 
      "08/07", "09/07", "10/07", "11/07", "12/07"
    ];
    
    const totalDays = dates.length;
    const realOccs = [...(activeStudent.occurrences || [])].reverse(); // oldest to newest
    const realCount = realOccs.length;
    
    return dates.map((date, index) => {
      const realIndex = index - (totalDays - realCount);
      if (realIndex >= 0 && realIndex < realCount) {
        const occ = realOccs[realIndex];
        const state = occ.behaviorState || "otimo";
        let score = 4;
        let label = "Radiante 🌟";
        if (state === "otimo") { score = 4; label = "Radiante 🌟"; }
        else if (state === "agitado") { score = 3; label = "Animado ⚡"; }
        else if (state === "cansado") { score = 2; label = "Calmo 💤"; }
        else if (state === "triste") { score = 1; label = "Dengoso 🧸"; }
        
        let displayDate = date;
        if (occ.date) {
          displayDate = occ.date.split(" (")[0];
        }
        
        return {
          date: displayDate,
          score,
          state,
          label,
          note: occ.teacherNote || "Participou muito bem da rotina escolar diária.",
          isReal: true
        };
      } else {
        const seeded = getSeededMood(activeStudent.id, index);
        return {
          date,
          score: seeded.score,
          state: seeded.state,
          label: seeded.label,
          note: seeded.note,
          isReal: false
        };
      }
    });
  }, [activeStudent]);

  // Compute stats for visualization
  const { wellnessIndex, dominantLabel, avgScore } = React.useMemo(() => {
    if (moodTimeline.length === 0) return { wellnessIndex: 100, dominantLabel: "Radiante 🌟", avgScore: 4.0 };
    
    const positiveDays = moodTimeline.filter(d => d.score >= 3).length;
    const wellness = Math.round((positiveDays / moodTimeline.length) * 100);
    
    const sum = moodTimeline.reduce((acc, curr) => acc + curr.score, 0);
    const avg = sum / moodTimeline.length;
    
    const counts = moodTimeline.reduce((acc, curr) => {
      acc[curr.state] = (acc[curr.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    let dominantState = "otimo";
    let maxCount = 0;
    Object.entries(counts).forEach(([state, count]) => {
      const numCount = count as number;
      if (numCount > maxCount) {
        maxCount = numCount;
        dominantState = state;
      }
    });
    
    const domLabel = dominantState === "otimo" ? "Excelente Disposição" : dominantState === "agitado" ? "Engajado e Ativo" : dominantState === "cansado" ? "Calmo e Focado" : "Acolhimento Pedagógico";
    
    return {
      wellnessIndex: wellness,
      dominantLabel: domLabel,
      avgScore: avg
    };
  }, [moodTimeline]);

  // Find pending payments
  const pendingCobranca = cobrancas.find((c) => c.status === "pendente" || c.status === "vencido");

  // Get latest communication
  const latestAnnouncement = comunicados[0];

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Bom dia";
    if (hours < 18) return "Boa tarde";
    return "Boa noite";
  };

  // Get active student queue status or ETA
  const isWaitingInQueue = activeStudent.pickupQueueStatus === "fila_espera";
  const isAuthorizedToLeave = activeStudent.pickupQueueStatus === "liberado_chamado";

  return (
    <div className="space-y-6" id="parent-dashboard-root">
      
      {/* OPERATIONAL STATUS HEADER - CALM, EDITORIAL & PURPOSEFUL */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Student Info */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0 group">
              <img
                src={activeStudent.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=nicolas"}
                alt={activeStudent.name}
                className="w-14 h-14 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="absolute inset-0 bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                title="Atualizar foto do estudante"
                aria-label="Atualizar foto do estudante"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {activeStudent.grade}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Presença confirmada hoje
                </span>
              </div>
              <h1 className="text-2xl font-serif font-black text-slate-950 dark:text-white tracking-tight">
                {getGreeting()}, Família de {activeStudent.name}
              </h1>
            </div>
          </div>

          {/* Clean Focused Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Primary Action: QR Code de Portaria with pulse standby & success glow */}
            <button
              id="btn-parent-qrcode"
              data-standby="true"
              onClick={() => {
                onOpenQrCode();
                trackUserActivity({
                  userId: "user-current",
                  role: "pais",
                  type: "view_gatekeeper",
                  title: "Abriu Passe QR Code da Portaria",
                  entityTitle: activeStudent.name,
                });
              }}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-400 dark:text-amber-600" />
              <span>Passe de Portaria QR</span>
            </button>

            {/* Secondary quiet actions */}
            <button
              type="button"
              onClick={() => onNavigateToTab("acesso")}
              className="px-3 py-2.5 rounded-xl text-xs font-medium text-slate-650 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            >
              Autorizações
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPediatraModalOpen(true);
                trackUserActivity({
                  userId: "user-current",
                  role: "pais",
                  type: "log_pediatrician_report",
                  title: "Consultou Ficha de Saúde Pediátrica",
                  entityTitle: activeStudent.name,
                });
              }}
              className="px-3 py-2.5 rounded-xl text-xs font-medium text-slate-650 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors cursor-pointer"
            >
              Ficha de Saúde
            </button>
          </div>
        </div>

        {/* Live Portaria Queue Notice when active */}
        {(isWaitingInQueue || isAuthorizedToLeave) && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full ${isAuthorizedToLeave ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {isAuthorizedToLeave 
                  ? "Estudante liberado na portaria principal pelo portão A." 
                  : "Chamada em andamento na sala de aula."}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
              isAuthorizedToLeave 
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" 
                : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
            }`}>
              {isAuthorizedToLeave ? "Liberado" : "Na Fila"}
            </span>
          </div>
        )}
      </div>

      {/* 🚀 DYNAMIC WHITE-LABEL FEED SECTIONS (ORDERED & TOGGLED VIA BRANDING CONFIG) */}
      <ParentDashboardFeed
        activeStudent={activeStudent}
        branding={branding}
        todayOccurrence={todayOccurrence}
        onNavigateToTab={onNavigateToTab}
        onOpenPediatraModal={() => setIsPediatraModalOpen(true)}
        moodTimeline={moodTimeline}
        wellnessIndex={wellnessIndex}
        dominantLabel={dominantLabel}
        pendingCobranca={pendingCobranca}
        eventos={eventos}
        latestAnnouncement={latestAnnouncement}
        comunicados={comunicados}
        momentos={momentos}
        CustomTooltip={CustomTooltip}
      />







      {/* Pediatrician Report Modal component */}
      <PediatricianReportModal
        isOpen={isPediatraModalOpen}
        onClose={() => setIsPediatraModalOpen(false)}
        student={activeStudent}
        branding={branding}
      />

      {/* Student Photo Camera Modal */}
      <StudentPhotoCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        student={activeStudent}
        onPhotoCaptured={(studentId, photoDataUrl) => {
          if (onUpdateStudentPhoto) {
            onUpdateStudentPhoto(studentId, photoDataUrl);
          }
        }}
        onToast={onToast}
      />

    </div>
  );
});
