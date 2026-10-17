import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smile, 
  Clock, 
  Utensils, 
  Pill, 
  Moon, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Activity, 
  Calendar, 
  Heart, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Camera, 
  Award,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  BarChart2,
  Layers,
  Search,
  Plus,
  Pin,
  Trash2,
  Edit3,
  FileText,
  X,
  Tag,
  Info,
  SlidersHorizontal,
  Bookmark,
  BellRing,
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  History,
  Sun,
  ShieldAlert,
  Eye,
  Upload
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine,
  Legend,
  Cell
} from "recharts";
import { Estudante, Ocorrencia, ClassroomPhoto, RoutineChartAnnotation } from "../types";
import { ExportReportButton } from "./ExportReportButton";
import ClassroomPhotoCard from "./ClassroomPhotoCard";
import WeeklyNutritionSummaryWidget from "./WeeklyNutritionSummaryWidget";
import OccurrenceGlowConfigPanel from "./OccurrenceGlowConfigPanel";
import CriticalOccurrenceDetailModal from "./CriticalOccurrenceDetailModal";

interface StudentDailyRoutineTabProps {
  activeStudent: Estudante;
  estudantes?: Estudante[];
  selectedPeriod: "recent" | "july" | "june" | "all";
  setSelectedPeriod: (p: "recent" | "july" | "june" | "all") => void;
  classroomPhotos: ClassroomPhoto[];
  setClassroomPhotos: React.Dispatch<React.SetStateAction<ClassroomPhoto[]>>;
  photoTeacherFilter: string;
  setPhotoTeacherFilter: (f: string) => void;
  photoSortOrder: "recent" | "name_asc" | "name_desc";
  setPhotoSortOrder: (s: "recent" | "name_asc" | "name_desc") => void;
  setSelectedClassroomPhoto: (p: ClassroomPhoto | null) => void;
  setPhotoToDelete: (p: ClassroomPhoto | null) => void;
  userRole?: "pais" | "escola" | "aluno" | "landing";
  branding?: any;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
  onReportPhoto?: (photo: ClassroomPhoto) => void;
}

// Mood state helper dictionary
export const BEHAVIOR_MAP: Record<string, { label: string; score: number; emoji: string; color: string; bg: string; border: string; text: string; description: string }> = {
  otimo: {
    label: "Radiante / Ótimo",
    score: 4,
    emoji: "🌟",
    color: "#10b981",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-800 dark:text-emerald-300",
    description: "Excelente disposição, cooperativo e comunicativo nas atividades."
  },
  agitado: {
    label: "Super Ativo",
    score: 3,
    emoji: "⚡",
    color: "#f59e0b",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-300",
    description: "Muita energia física, engajado em dinâmicas e brincadeiras motoras."
  },
  triste: {
    label: "Dengoso / Saudades",
    score: 2,
    emoji: "🧸",
    color: "#6366f1",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    border: "border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-800 dark:text-indigo-300",
    description: "Acolhimento afetivo na chegada, logo entrosou com a turma."
  },
  cansado: {
    label: "Cansadinho / Repouso",
    score: 1,
    emoji: "💤",
    color: "#8b5cf6",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-800 dark:text-purple-300",
    description: "Necessidade de sono e desaceleração após rotina de estímulos."
  }
};

export const MEAL_MAP: Record<string, { label: string; score: number; color: string }> = {
  excelente: { label: "Excelente (Tudo)", score: 3, color: "#10b981" },
  parcial: { label: "Parcial (Metade)", score: 2, color: "#f59e0b" },
  recusou: { label: "Recusou / Pouco", score: 1, color: "#ef4444" },
  nao_se_aplica: { label: "Não se aplica", score: 0, color: "#94a3b8" },
};

// Chart metric definition options
const CHART_METRIC_OPTIONS = [
  {
    id: "behavior" as const,
    label: "Comportamento",
    title: "Comportamento & Humor",
    icon: Sparkles,
    emoji: "🌟",
    color: "#d97706",
    badgeBg: "bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    description: "Curva de humor e disposição emocional (Escala 1 a 4)",
    tag: "Nível 1 a 4"
  },
  {
    id: "sleep" as const,
    label: "Qualidade do Sono",
    title: "Qualidade do Sono & Repouso",
    icon: Moon,
    emoji: "🌙",
    color: "#6366f1",
    badgeBg: "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800",
    description: "Minutos de sono e repouso escolar na semana",
    tag: "Minutos de sono"
  },
  {
    id: "meals" as const,
    label: "Status de Alimentação",
    title: "Status de Alimentação",
    icon: Utensils,
    emoji: "🥗",
    color: "#10b981",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    description: "Taxa de adesão alimentar em almoços e lanches (0 a 100%)",
    tag: "Taxa 0 a 100%"
  },
  {
    id: "all" as const,
    label: "Visão Comparativa",
    title: "Todas as Métricas Combinadas",
    icon: Activity,
    emoji: "📊",
    color: "#8b5cf6",
    badgeBg: "bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800",
    description: "Comparativo integrado de todos os indicadores normalizados",
    tag: "Visão Geral"
  }
];

// Chart annotation categories metadata & styling configuration
export const ROUTINE_ANNOTATION_CATEGORIES: Record<string, { label: string; icon: any; emoji: string; color: string; bg: string; border: string; text: string; defaultTitle: string; defaultImpact: string }> = {
  medication: {
    label: "Mudança de Medicação",
    icon: Pill,
    emoji: "💊",
    color: "#e11d48",
    bg: "bg-rose-50 dark:bg-rose-950/60",
    border: "border-rose-300 dark:border-rose-800",
    text: "text-rose-800 dark:text-rose-200",
    defaultTitle: "Mudança de Medicação",
    defaultImpact: "Ajuste na posologia matutina prescrita pelo médico; monitoramento de reflexos e tempo de sono."
  },
  assessment: {
    label: "Semana de Avaliações",
    icon: Award,
    emoji: "📝",
    color: "#d97706",
    bg: "bg-amber-50 dark:bg-amber-950/60",
    border: "border-amber-300 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-200",
    defaultTitle: "Semana de Avaliações",
    defaultImpact: "Sondagens diagnósticas e avaliações com maior demanda cognitiva e foco."
  },
  pedagogical: {
    label: "Intervenção Pedagógica",
    icon: Sparkles,
    emoji: "🎯",
    color: "#7c3aed",
    bg: "bg-violet-50 dark:bg-violet-950/60",
    border: "border-violet-300 dark:border-violet-800",
    text: "text-violet-800 dark:text-violet-200",
    defaultTitle: "Intervenção Pedagógica",
    defaultImpact: "Novo plano de apoio individualizado (AEE) e suporte pedagógico em sala."
  },
  diet: {
    label: "Ajuste na Alimentação",
    icon: Utensils,
    emoji: "🥗",
    color: "#059669",
    bg: "bg-emerald-50 dark:bg-emerald-950/60",
    border: "border-emerald-300 dark:border-emerald-800",
    text: "text-emerald-800 dark:text-emerald-200",
    defaultTitle: "Ajuste na Dieta",
    defaultImpact: "Nova composição no cardápio escolar sob orientação de nutricionista."
  },
  adaptation: {
    label: "Período de Adaptação",
    icon: Smile,
    emoji: "🧸",
    color: "#0284c7",
    bg: "bg-sky-50 dark:bg-sky-950/60",
    border: "border-sky-300 dark:border-sky-800",
    text: "text-sky-800 dark:text-sky-200",
    defaultTitle: "Adaptação de Rotina",
    defaultImpact: "Acolhimento afetivo e flexibilização de horários de chegada e saída."
  },
  custom: {
    label: "Outro Evento",
    icon: Tag,
    emoji: "📌",
    color: "#4f46e5",
    bg: "bg-indigo-50 dark:bg-indigo-950/60",
    border: "border-indigo-300 dark:border-indigo-800",
    text: "text-indigo-800 dark:text-indigo-200",
    defaultTitle: "Evento Escolar",
    defaultImpact: "Evento na rotina correlacionado com variações nos indicadores diários."
  }
};

export interface ClassCriticalThresholds {
  gradeName: string;
  minSleepMinutes: number; // minutes below which sleep is critical
  criticalBehaviors: ("otimo" | "agitado" | "triste" | "cansado")[];
  triggerOnMealRefusal: boolean;
  triggerOnMedicationMissed: boolean;
  criticalPercentageThreshold: number; // percentage threshold for class alert rate (e.g. 25%)
  autoNotifyCoordination: boolean;
  sensitivityPreset: "custom" | "infantil" | "fundamental" | "alta_sensibilidade" | "tolerante";
  pulseSpeedMode?: "lento" | "medio" | "emergencial";
  pulseSpeedSeconds?: number;
}

export const DEFAULT_THRESHOLDS_BY_GRADE: Record<string, ClassCriticalThresholds> = {
  default: {
    gradeName: "Padrão Geral da Escola",
    minSleepMinutes: 30,
    criticalBehaviors: ["agitado"],
    triggerOnMealRefusal: true,
    triggerOnMedicationMissed: false,
    criticalPercentageThreshold: 25,
    autoNotifyCoordination: true,
    sensitivityPreset: "fundamental",
    pulseSpeedMode: "medio",
    pulseSpeedSeconds: 2.5
  },
  "Educação Infantil": {
    gradeName: "Educação Infantil",
    minSleepMinutes: 45,
    criticalBehaviors: ["agitado", "triste"],
    triggerOnMealRefusal: true,
    triggerOnMedicationMissed: false,
    criticalPercentageThreshold: 20,
    autoNotifyCoordination: true,
    sensitivityPreset: "infantil",
    pulseSpeedMode: "lento",
    pulseSpeedSeconds: 4.5
  },
  "1º Ano A": {
    gradeName: "1º Ano A",
    minSleepMinutes: 30,
    criticalBehaviors: ["agitado"],
    triggerOnMealRefusal: true,
    triggerOnMedicationMissed: false,
    criticalPercentageThreshold: 25,
    autoNotifyCoordination: true,
    sensitivityPreset: "fundamental",
    pulseSpeedMode: "medio",
    pulseSpeedSeconds: 2.5
  },
  "2º Ano A": {
    gradeName: "2º Ano A",
    minSleepMinutes: 20,
    criticalBehaviors: ["agitado"],
    triggerOnMealRefusal: false,
    triggerOnMedicationMissed: false,
    criticalPercentageThreshold: 30,
    autoNotifyCoordination: true,
    sensitivityPreset: "fundamental",
    pulseSpeedMode: "medio",
    pulseSpeedSeconds: 2.5
  }
};

export function parseSleepMinutes(str: string): number {
  if (!str) return 0;
  const s = str.toLowerCase().trim();
  if (s.includes("não") || s.includes("nao") || s === "0" || s.startsWith("0m") || s.startsWith("0 min")) return 0;
  
  let total = 0;
  const hourMatch = s.match(/(\d+)\s*h/);
  if (hourMatch) {
    total += parseInt(hourMatch[1], 10) * 60;
  }
  const minMatch = s.match(/(\d+)\s*(?:min|m)/);
  if (minMatch) {
    total += parseInt(minMatch[1], 10);
  }
  if (!hourMatch && !minMatch) {
    const num = parseInt(s, 10);
    if (!isNaN(num)) total = num;
  }
  return total;
}

export function isCriticalOccurrence(occ: Ocorrencia, thresholds?: ClassCriticalThresholds): boolean {
  const currentThresholds = thresholds || DEFAULT_THRESHOLDS_BY_GRADE.default;

  // 1. Check critical behavior states
  if (currentThresholds.criticalBehaviors && currentThresholds.criticalBehaviors.includes(occ.behaviorState)) {
    return true;
  }

  // 2. Check minimum sleep threshold
  const sleepMins = parseSleepMinutes(occ.sleep?.durationStr || "");
  if (sleepMins < currentThresholds.minSleepMinutes) {
    return true;
  }

  // 3. Check meal refusal if triggered
  if (currentThresholds.triggerOnMealRefusal) {
    if (occ.meals?.lunch === "recusou" || occ.meals?.snack === "recusou") {
      return true;
    }
  }

  // 4. Check medication trigger if active
  if (currentThresholds.triggerOnMedicationMissed && occ.medicated?.wasMedicated) {
    return true;
  }

  return false;
}

export interface BehaviorStatusInfo {
  level: "bom" | "alerta" | "critico";
  statusText: string;
  statusClass: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  emoji: string;
  description: string;
}

export function getBehaviorStatusInfo(behaviorState: "otimo" | "agitado" | "triste" | "cansado" | string): BehaviorStatusInfo {
  switch (behaviorState) {
    case "otimo":
      return {
        level: "bom",
        statusText: "Bom",
        statusClass: "status-bom",
        dotColor: "bg-emerald-500",
        badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
        badgeBorder: "border-emerald-300 dark:border-emerald-700",
        badgeText: "text-emerald-800 dark:text-emerald-300",
        emoji: "🌟",
        description: "Comportamento positivo, cooperativo e adaptado à rotina"
      };
    case "triste":
      return {
        level: "alerta",
        statusText: "Alerta",
        statusClass: "status-alerta",
        dotColor: "bg-amber-500",
        badgeBg: "bg-amber-50 dark:bg-amber-950/60",
        badgeBorder: "border-amber-300 dark:border-amber-700",
        badgeText: "text-amber-900 dark:text-amber-300",
        emoji: "🧸",
        description: "Alerta: sensibilidade emocional, acolhimento afetivo necessário"
      };
    case "cansado":
      return {
        level: "alerta",
        statusText: "Alerta",
        statusClass: "status-alerta",
        dotColor: "bg-amber-500",
        badgeBg: "bg-amber-50 dark:bg-amber-950/60",
        badgeBorder: "border-amber-300 dark:border-amber-700",
        badgeText: "text-amber-900 dark:text-amber-300",
        emoji: "💤",
        description: "Alerta: fadiga ou necessidade de desaceleração e repouso"
      };
    case "agitado":
    default:
      return {
        level: "critico",
        statusText: "Crítico",
        statusClass: "status-critico",
        dotColor: "bg-rose-500",
        badgeBg: "bg-rose-50 dark:bg-rose-950/60",
        badgeBorder: "border-rose-300 dark:border-rose-700",
        badgeText: "text-rose-900 dark:text-rose-200",
        emoji: "⚡",
        description: "Crítico: agitação motora ou sobrecarga sensorial demandando mediação"
      };
  }
}

const INITIAL_ROUTINE_ANNOTATIONS: RoutineChartAnnotation[] = [
  {
    id: "ann-seed-1",
    studentId: "est-1",
    dayKey: "Ter",
    dateLabel: "04/08/2026",
    eventTitle: "Mudança de Medicação",
    category: "medication",
    description: "Ajuste na posologia matutina prescrita pelo médico; equipe monitorando reflexos e atenção.",
    authorName: "Enf. Beatriz (Saúde Escolar)",
    authorRole: "health_nurse",
    createdAt: "04/08/2026 08:15",
    impactObserved: "Correlaciona-se com pico de agitação no início do dia e ajuste no tempo de soneca."
  },
  {
    id: "ann-seed-2",
    studentId: "est-1",
    dayKey: "Sex",
    dateLabel: "07/08/2026",
    eventTitle: "Semana de Avaliações",
    category: "assessment",
    description: "Avaliação diagnóstica de raciocínio lógico e leitura em formato adaptado com a turma.",
    authorName: "Coord. Regina Lima",
    authorRole: "coordinator",
    createdAt: "07/08/2026 09:30",
    impactObserved: "Correlaciona-se com maior fadiga ao final do turno e apetite parcial no almoço."
  }
];

export function StudentDailyRoutineTab({
  activeStudent,
  estudantes = [],
  selectedPeriod,
  setSelectedPeriod,
  classroomPhotos,
  setClassroomPhotos,
  photoTeacherFilter,
  setPhotoTeacherFilter,
  photoSortOrder,
  setPhotoSortOrder,
  setSelectedClassroomPhoto,
  setPhotoToDelete,
  userRole = "pais",
  branding,
  onToast,
  onReportPhoto
}: StudentDailyRoutineTabProps) {
  const [photoStudentFilter, setPhotoStudentFilter] = useState<string>("all");
  const [photoTagSearch, setPhotoTagSearch] = useState<string>("");
  const [teacherPhotoCustomTags, setTeacherPhotoCustomTags] = useState<string>("");

  // Extrair todas as tags disponíveis dinamicamente para sugestões rápidas
  const availablePhotoTags = useMemo(() => {
    const set = new Set<string>();
    classroomPhotos.forEach((p) => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach((t) => {
          const clean = t.trim().toLowerCase();
          if (clean) set.add(clean);
        });
      }
      if (p.badge) {
        const cleanBadge = p.badge.replace(/[^\p{L}\p{N}]/gu, "").trim().toLowerCase();
        if (cleanBadge && cleanBadge.length >= 3) {
          set.add(cleanBadge);
        }
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [classroomPhotos]);

  // Teacher Classroom Photo Upload states & ref
  const teacherPhotoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isTeacherPhotoUploadModalOpen, setIsTeacherPhotoUploadModalOpen] = useState(false);
  const [teacherPhotoPreview, setTeacherPhotoPreview] = useState<string | null>(null);
  const [teacherPhotoTitle, setTeacherPhotoTitle] = useState("");
  const [teacherPhotoTag, setTeacherPhotoTag] = useState("Artes 🎨");
  const [teacherPhotoGrade, setTeacherPhotoGrade] = useState("Berçário das Estrelas (Maternal I)");
  const [teacherPhotoTeacherName, setTeacherPhotoTeacherName] = useState("Profa. Eliana Costa");
  const [teacherPhotoTaggedIds, setTeacherPhotoTaggedIds] = useState<string[]>([activeStudent.id]);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);

  const processUploadedImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onToast?.("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).", "error");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      onToast?.("A imagem deve ter no máximo 15MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setTeacherPhotoPreview(result);
        setTeacherPhotoTitle(`Atividade especial com ${activeStudent.name}`);
        setTeacherPhotoTaggedIds([activeStudent.id]);
        setIsTeacherPhotoUploadModalOpen(true);
      }
    };
    reader.onerror = () => {
      onToast?.("Falha ao processar o arquivo de imagem.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleTeacherPhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedImageFile(e.target.files[0]);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleConfirmTeacherPhotoUpload = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!teacherPhotoPreview) {
      onToast?.("Nenhuma imagem selecionada.", "error");
      return;
    }
    if (!teacherPhotoTitle.trim()) {
      onToast?.("Por favor, insira uma legenda ou título para a foto.", "error");
      return;
    }

    const customTagsParsed = teacherPhotoCustomTags.trim()
      ? teacherPhotoCustomTags
          .split(/[,#\s]+/)
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [teacherPhotoTag.replace(/[^\p{L}\p{N}]/gu, "").trim().toLowerCase()].filter(Boolean);

    const newPhoto: ClassroomPhoto = {
      id: `photo-${Date.now()}`,
      title: teacherPhotoTitle.trim(),
      grade: teacherPhotoGrade.trim() || "Maternal I",
      date: "Hoje, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      imageUrl: teacherPhotoPreview,
      teacherName: teacherPhotoTeacherName.trim() || "Profa. Eliana Costa",
      badge: teacherPhotoTag || "Artes 🎨",
      taggedStudentIds: teacherPhotoTaggedIds.length > 0 ? teacherPhotoTaggedIds : [activeStudent.id],
      likes: 0,
      likedByCurrentUser: false,
      tags: customTagsParsed
    };

    const updated = [newPhoto, ...classroomPhotos];
    setClassroomPhotos(updated);
    try {
      localStorage.setItem("school_classroom_photos", JSON.stringify(updated));
    } catch (err) {
      console.warn("Storage quota exceeded or error writing photos to localStorage", err);
    }

    setIsTeacherPhotoUploadModalOpen(false);
    setTeacherPhotoPreview(null);
    setTeacherPhotoTitle("");
    setTeacherPhotoCustomTags("");
    onToast?.("📸 Nova foto adicionada à galeria com sucesso!", "success");
  };
  const [chartViewMode, setChartViewMode] = useState<"line" | "bar">("line");
  const [chartMetricFilter, setChartMetricFilter] = useState<"behavior" | "sleep" | "meals" | "all">("behavior");
  const [isMetricDropdownOpen, setIsMetricDropdownOpen] = useState(false);
  const metricDropdownRef = useRef<HTMLDivElement>(null);
  const [behaviorFilter, setBehaviorFilter] = useState<string>("all");
  const [isCompactCards, setIsCompactCards] = useState<boolean>(false);
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  // Overlay comparison state: Current Month vs Previous Semester
  const [showEvolutionOverlay, setShowEvolutionOverlay] = useState<boolean>(true);

  // Secretary clarification quick-action states
  const [isNotifySecretaryModalOpen, setIsNotifySecretaryModalOpen] = useState<boolean>(false);
  const [selectedOccurrenceForSecretary, setSelectedOccurrenceForSecretary] = useState<Ocorrencia | null>(null);
  const [secretarySubject, setSecretarySubject] = useState<string>("Rotina Escolar");
  const [secretaryMessageText, setSecretaryMessageText] = useState<string>("");
  const [secretaryIsSending, setSecretaryIsSending] = useState<boolean>(false);
  const [secretarySentHistory, setSecretarySentHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(`school_secretary_history_${activeStudent.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleOpenSecretaryModal = (occ: Ocorrencia) => {
    setSelectedOccurrenceForSecretary(occ);
    let defaultTopic = "Rotina Escolar";
    if (occ.behaviorState === "agitado") defaultTopic = "Comportamento & Agitação";
    else if (occ.sleep.durationStr.includes("0m") || occ.sleep.durationStr.includes("0 min") || occ.sleep.durationStr.includes("não")) defaultTopic = "Qualidade do Sono & Repouso";
    else if (occ.meals.lunch === "recusou" || occ.meals.lunch === "parcial") defaultTopic = "Alimentação & Aceitação";
    else if (occ.medicated.wasMedicated) defaultTopic = "Administração de Medicamento";
    
    setSecretarySubject(defaultTopic);
    setSecretaryMessageText(`Olá Secretaria e Coordenação, gostaria de um esclarecimento sobre o diário escolar do dia ${occ.date} (${activeStudent.name}). Notei o registro: humor '${occ.behaviorState}', almoço '${occ.meals.lunch}', sono '${occ.sleep.durationStr}'. Por gentileza, poderiam me passar mais orientações da equipe?`);
    setIsNotifySecretaryModalOpen(true);
  };

  const handleSendSecretaryNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretaryMessageText.trim()) {
      onToast?.("Por favor, preencha sua mensagem antes de enviar para a secretaria.", "error");
      return;
    }
    setSecretaryIsSending(true);
    setTimeout(() => {
      const newEntry = {
        id: `sec-${Date.now()}`,
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        occurrenceDate: selectedOccurrenceForSecretary?.date || "Hoje",
        subject: secretarySubject,
        message: secretaryMessageText.trim(),
        sentAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        status: "recebido_secretaria"
      };
      const updated = [newEntry, ...secretarySentHistory];
      setSecretarySentHistory(updated);
      try {
        localStorage.setItem(`school_secretary_history_${activeStudent.id}`, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save secretary history:", err);
      }
      setSecretaryIsSending(false);
      setIsNotifySecretaryModalOpen(false);
      onToast?.(`Solicitação sobre o diário de ${selectedOccurrenceForSecretary?.date} enviada à Secretaria com sucesso! Protocolo #${newEntry.id.slice(-6).toUpperCase()}`, "success");
    }, 450);
  };

  // Grade critical thresholds state map with persistence in localStorage
  const [gradeThresholdsMap, setGradeThresholdsMap] = useState<Record<string, ClassCriticalThresholds>>(() => {
    try {
      const saved = localStorage.getItem("school_grade_critical_thresholds");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load grade critical thresholds:", e);
    }
    return DEFAULT_THRESHOLDS_BY_GRADE;
  });

  const activeGradeName = activeStudent.grade?.split("-")[0]?.trim() || activeStudent.grade || "Educação Básica";

  const currentGradeThresholds = useMemo<ClassCriticalThresholds>(() => {
    return gradeThresholdsMap[activeGradeName] || gradeThresholdsMap["default"] || {
      gradeName: activeGradeName,
      minSleepMinutes: 30,
      criticalBehaviors: ["agitado"],
      triggerOnMealRefusal: true,
      triggerOnMedicationMissed: false,
      criticalPercentageThreshold: 25,
      autoNotifyCoordination: true,
      sensitivityPreset: "fundamental"
    };
  }, [gradeThresholdsMap, activeGradeName]);

  // Modal state for Threshold Configuration & Occurrence Glow/Inset Panel & Critical Detail Modal
  const [isThresholdConfigModalOpen, setIsThresholdConfigModalOpen] = useState<boolean>(false);
  const [isGlowConfigModalOpen, setIsGlowConfigModalOpen] = useState<boolean>(false);
  const [selectedCriticalOccurrence, setSelectedCriticalOccurrence] = useState<Ocorrencia | null>(null);
  const [isCriticalDetailModalOpen, setIsCriticalDetailModalOpen] = useState<boolean>(false);
  const [highContrastAlerts, setHighContrastAlerts] = useState<boolean>(() => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("occurrence_high_contrast") === "true";
    }
    return false;
  });
  const [configTargetGrade, setConfigTargetGrade] = useState<string>(activeGradeName);
  const [editingThresholds, setEditingThresholds] = useState<ClassCriticalThresholds>(currentGradeThresholds);
  const [applyToAllGrades, setApplyToAllGrades] = useState<boolean>(false);

  const handleOpenCriticalDetailModal = (occ: Ocorrencia) => {
    setSelectedCriticalOccurrence(occ);
    setIsCriticalDetailModalOpen(true);
  };

  const handleToggleHighContrastAlerts = () => {
    const next = !highContrastAlerts;
    setHighContrastAlerts(next);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("occurrence_high_contrast", next ? "true" : "false");
    }
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--occurrence-border-width", next ? "3.5px" : "1.5px");
      document.documentElement.style.setProperty("--occurrence-shadow-spread", next ? "6px" : "0px");
      document.documentElement.style.setProperty("--occurrence-glow-intensity", next ? "1.8" : "1.0");
      document.documentElement.style.setProperty("--occurrence-inset-intensity", next ? "2.2" : "1.0");
    }
    onToast?.(`Modo de Alto Contraste ${next ? "Ativado" : "Desativado"} para itens críticos`, "info");
  };

  const handleOpenThresholdConfigModal = (gradeName?: string) => {
    const target = gradeName || activeGradeName;
    setConfigTargetGrade(target);
    const existing = gradeThresholdsMap[target] || gradeThresholdsMap["default"] || DEFAULT_THRESHOLDS_BY_GRADE.default;
    setEditingThresholds({
      ...existing,
      gradeName: target
    });
    setApplyToAllGrades(false);
    setIsThresholdConfigModalOpen(true);
  };

  const handleApplyPreset = (preset: ClassCriticalThresholds["sensitivityPreset"]) => {
    if (preset === "infantil") {
      setEditingThresholds(prev => ({
        ...prev,
        minSleepMinutes: 45,
        criticalBehaviors: ["agitado", "triste"],
        triggerOnMealRefusal: true,
        triggerOnMedicationMissed: false,
        criticalPercentageThreshold: 20,
        sensitivityPreset: "infantil"
      }));
    } else if (preset === "fundamental") {
      setEditingThresholds(prev => ({
        ...prev,
        minSleepMinutes: 25,
        criticalBehaviors: ["agitado"],
        triggerOnMealRefusal: false,
        triggerOnMedicationMissed: false,
        criticalPercentageThreshold: 30,
        sensitivityPreset: "fundamental"
      }));
    } else if (preset === "alta_sensibilidade") {
      setEditingThresholds(prev => ({
        ...prev,
        minSleepMinutes: 40,
        criticalBehaviors: ["agitado", "triste", "cansado"],
        triggerOnMealRefusal: true,
        triggerOnMedicationMissed: true,
        criticalPercentageThreshold: 15,
        sensitivityPreset: "alta_sensibilidade"
      }));
    } else if (preset === "tolerante") {
      setEditingThresholds(prev => ({
        ...prev,
        minSleepMinutes: 15,
        criticalBehaviors: ["agitado"],
        triggerOnMealRefusal: false,
        triggerOnMedicationMissed: false,
        criticalPercentageThreshold: 45,
        sensitivityPreset: "tolerante"
      }));
    }
  };

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMap = { ...gradeThresholdsMap };
    
    if (applyToAllGrades) {
      Object.keys(updatedMap).forEach(key => {
        updatedMap[key] = {
          ...editingThresholds,
          gradeName: updatedMap[key].gradeName || key
        };
      });
      updatedMap["default"] = {
        ...editingThresholds,
        gradeName: "Padrão Geral da Escola"
      };
      updatedMap[configTargetGrade] = {
        ...editingThresholds,
        gradeName: configTargetGrade
      };
    } else {
      updatedMap[configTargetGrade] = {
        ...editingThresholds,
        gradeName: configTargetGrade
      };
    }

    setGradeThresholdsMap(updatedMap);
    try {
      localStorage.setItem("school_grade_critical_thresholds", JSON.stringify(updatedMap));
    } catch (err) {
      console.error("Failed to save grade critical thresholds:", err);
    }

    setIsThresholdConfigModalOpen(false);
    onToast?.(`Limiares de Ocorrência Crítica configurados para a turma ${configTargetGrade} (Sono < ${editingThresholds.minSleepMinutes}min, Alerta: ${editingThresholds.criticalPercentageThreshold}%).`, "success");
  };

  const handleResetThresholdsToDefault = () => {
    const defaultVal = DEFAULT_THRESHOLDS_BY_GRADE[configTargetGrade] || DEFAULT_THRESHOLDS_BY_GRADE.default;
    setEditingThresholds({
      ...defaultVal,
      gradeName: configTargetGrade
    });
  };

  // Routine Chart Annotations state with persistent localStorage
  const [routineAnnotations, setRoutineAnnotations] = useState<RoutineChartAnnotation[]>(() => {
    try {
      const saved = localStorage.getItem(`school_routine_chart_annotations_${activeStudent.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Failed to load routine chart annotations:", e);
    }
    return INITIAL_ROUTINE_ANNOTATIONS;
  });

  const saveRoutineAnnotations = (updated: RoutineChartAnnotation[]) => {
    setRoutineAnnotations(updated);
    try {
      localStorage.setItem(`school_routine_chart_annotations_${activeStudent.id}`, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save routine chart annotations:", e);
    }
  };

  // Annotation Modal & Form States for School Admins & Educators
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState<boolean>(false);
  const [selectedAnnotationForView, setSelectedAnnotationForView] = useState<RoutineChartAnnotation | null>(null);
  const [newAnnotationDay, setNewAnnotationDay] = useState<string>("Ter");
  const [newAnnotationCategory, setNewAnnotationCategory] = useState<keyof typeof ROUTINE_ANNOTATION_CATEGORIES>("medication");
  const [newAnnotationTitle, setNewAnnotationTitle] = useState<string>("Mudança de Medicação");
  const [newAnnotationDescription, setNewAnnotationDescription] = useState<string>("");
  const [newAnnotationImpact, setNewAnnotationImpact] = useState<string>("Ajuste na posologia matutina com reflexos temporários no humor e sono.");
  const [newAnnotationAuthor, setNewAnnotationAuthor] = useState<string>("Coordenação Pedagógica / Enfermaria");
  const [newAnnotationAuthorRole, setNewAnnotationAuthorRole] = useState<"admin" | "educator" | "health_nurse" | "coordinator">("coordinator");
  const [highlightedDayKey, setHighlightedDayKey] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (metricDropdownRef.current && !metricDropdownRef.current.contains(event.target as Node)) {
        setIsMetricDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMetricDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activeMetricOption = useMemo(() => {
    return CHART_METRIC_OPTIONS.find(opt => opt.id === chartMetricFilter) || CHART_METRIC_OPTIONS[0];
  }, [chartMetricFilter]);

  const toggleExpandCard = (id: string) => {
    setExpandedCardIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Base occurrences from active student
  const occurrences = useMemo(() => {
    return activeStudent.occurrences || [];
  }, [activeStudent]);

  // Filter occurrences based on period
  const filteredOccurrences = useMemo(() => {
    return occurrences.filter((occ) => {
      if (selectedPeriod === "all") return true;
      if (selectedPeriod === "recent" || selectedPeriod === "july") {
        return (
          occ.date.toLowerCase().includes("hoje") ||
          occ.date.toLowerCase().includes("ontem") ||
          occ.date.toLowerCase().includes("atrás") ||
          occ.date.toLowerCase().includes("semana") ||
          occ.date.toLowerCase().includes("jul") ||
          occ.date.toLowerCase().includes("julho") ||
          occ.date.toLowerCase().includes("segunda") ||
          occ.date.toLowerCase().includes("terça") ||
          occ.date.toLowerCase().includes("quarta") ||
          occ.date.toLowerCase().includes("quinta") ||
          occ.date.toLowerCase().includes("sexta")
        );
      }
      if (selectedPeriod === "june") {
        return (
          occ.date.toLowerCase().includes("jun") ||
          occ.date.toLowerCase().includes("junho")
        );
      }
      return true;
    }).filter(occ => {
      if (behaviorFilter === "all") return true;
      return occ.behaviorState === behaviorFilter;
    });
  }, [occurrences, selectedPeriod, behaviorFilter]);

  // Construct 7-day weekly timeline data for Recharts (behaviorState over the past 7 days or selected period)
  const weeklyChartData = useMemo(() => {
    // Generate dates based on selected timeframe
    let weekDays = [
      { day: "Dom (02/08)", short: "Dom", fullDate: "02/08/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 90, med: false },
      { day: "Seg (03/08)", short: "Seg", fullDate: "03/08/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 75, med: false },
      { day: "Ter (04/08)", short: "Ter", fullDate: "04/08/2026", defaultState: "agitado", lunch: "excelente", snack: "parcial", sleepMinutes: 60, med: false },
      { day: "Qua (05/08)", short: "Qua", fullDate: "06/08/2026", defaultState: activeStudent.id === "est-2" ? "triste" : "otimo", lunch: "parcial", snack: "excelente", sleepMinutes: 90, med: false },
      { day: "Qui (06/08)", short: "Qui", fullDate: "06/08/2026", defaultState: occurrences[2]?.behaviorState || "otimo", lunch: occurrences[2]?.meals?.lunch || "excelente", snack: occurrences[2]?.meals?.snack || "excelente", sleepMinutes: 80, med: !!occurrences[2]?.medicated?.wasMedicated },
      { day: "Sex (Ontem)", short: "Sex", fullDate: "07/08/2026", defaultState: occurrences[1]?.behaviorState || "agitado", lunch: occurrences[1]?.meals?.lunch || "parcial", snack: occurrences[1]?.meals?.snack || "excelente", sleepMinutes: occurrences[1]?.sleep?.durationStr?.includes("1h") ? 80 : 0, med: !!occurrences[1]?.medicated?.wasMedicated },
      { day: "Sáb (Hoje)", short: "Sáb", fullDate: "08/08/2026", defaultState: occurrences[0]?.behaviorState || "otimo", lunch: occurrences[0]?.meals?.lunch || "excelente", snack: occurrences[0]?.meals?.snack || "excelente", sleepMinutes: occurrences[0]?.sleep?.durationStr?.includes("2h") ? 120 : 75, med: !!occurrences[0]?.medicated?.wasMedicated }
    ];

    if (selectedPeriod === "july") {
      weekDays = [
        { day: "Sex (25/07)", short: "25 Jul", fullDate: "25/07/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 90, med: false },
        { day: "Sáb (26/07)", short: "26 Jul", fullDate: "26/07/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 60, med: false },
        { day: "Dom (27/07)", short: "27 Jul", fullDate: "27/07/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 90, med: false },
        { day: "Seg (28/07)", short: "28 Jul", fullDate: "28/07/2026", defaultState: "agitado", lunch: "parcial", snack: "excelente", sleepMinutes: 70, med: false },
        { day: "Ter (29/07)", short: "29 Jul", fullDate: "29/07/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 80, med: false },
        { day: "Qua (30/07)", short: "30 Jul", fullDate: "30/07/2026", defaultState: "agitado", lunch: "excelente", snack: "parcial", sleepMinutes: 65, med: false },
        { day: "Qui (31/07)", short: "31 Jul", fullDate: "31/07/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 85, med: false }
      ];
    } else if (selectedPeriod === "june") {
      weekDays = [
        { day: "Qua (24/06)", short: "24 Jun", fullDate: "24/06/2026", defaultState: "agitado", lunch: "parcial", snack: "excelente", sleepMinutes: 60, med: false },
        { day: "Qui (25/06)", short: "25 Jun", fullDate: "25/06/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 75, med: false },
        { day: "Sex (26/06)", short: "26 Jun", fullDate: "26/06/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 80, med: false },
        { day: "Sáb (27/06)", short: "27 Jun", fullDate: "27/06/2026", defaultState: "cansado", lunch: "excelente", snack: "excelente", sleepMinutes: 90, med: false },
        { day: "Dom (28/06)", short: "28 Jun", fullDate: "28/06/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 80, med: false },
        { day: "Seg (29/06)", short: "29 Jun", fullDate: "29/06/2026", defaultState: "agitado", lunch: "parcial", snack: "parcial", sleepMinutes: 50, med: false },
        { day: "Ter (30/06)", short: "30 Jun", fullDate: "30/06/2026", defaultState: "otimo", lunch: "excelente", snack: "excelente", sleepMinutes: 85, med: false }
      ];
    }

    return weekDays.map((item, idx) => {
      // Map occurrence state if matching from newest to oldest
      const occForDay = idx === 6 ? occurrences[0] : idx === 5 ? occurrences[1] : idx === 4 ? occurrences[2] : null;
      const stateKey = (occForDay?.behaviorState || item.defaultState) as keyof typeof BEHAVIOR_MAP;
      const behaviorInfo = BEHAVIOR_MAP[stateKey] || BEHAVIOR_MAP.otimo;
      
      const mealScore = (item.lunch === "excelente" ? 50 : item.lunch === "parcial" ? 35 : 15) + 
                        (item.snack === "excelente" ? 50 : item.snack === "parcial" ? 35 : 15);

      const sleepMins = occForDay ? (occForDay.sleep.durationStr.includes("2h") ? 120 : occForDay.sleep.durationStr.includes("1h") ? 75 : 0) : item.sleepMinutes;
      const sleepNormalized = Math.round(Math.min(100, (sleepMins / 120) * 100));

      return {
        day: item.day,
        short: item.short,
        fullDate: item.fullDate,
        behaviorState: stateKey,
        humorScore: behaviorInfo.score,
        humorScoreNormalized: behaviorInfo.score * 25, // 25, 50, 75, 100%
        humorState: behaviorInfo.label,
        humorEmoji: behaviorInfo.emoji,
        humorColor: behaviorInfo.color,
        mealScore: mealScore,
        mealLunch: occForDay?.meals?.lunch || item.lunch,
        mealSnack: occForDay?.meals?.snack || item.snack,
        sleepMinutes: sleepMins,
        sleepNormalized: sleepNormalized,
        sleepLabel: occForDay?.sleep?.durationStr || `${item.sleepMinutes}min`,
        medicated: occForDay ? occForDay.medicated.wasMedicated : item.med,
        note: occForDay?.teacherNote || "Dia de excelente convivência e integração com os colegas de classe.",
        // Previous Semester Benchmark Baseline (2026.1)
        prevSemesterHumorScore: 3.1,
        prevSemesterHumorNormalized: 77.5,
        prevSemesterSleepMinutes: 55,
        prevSemesterSleepNormalized: 46,
        prevSemesterMealScore: 68
      };
    });
  }, [occurrences, activeStudent, selectedPeriod]);

  // Aggregate stats
  const averageHumorScore = useMemo(() => {
    if (weeklyChartData.length === 0) return 4;
    const sum = weeklyChartData.reduce((acc, curr) => acc + curr.humorScore, 0);
    return (sum / weeklyChartData.length).toFixed(1);
  }, [weeklyChartData]);

  const mealAdherencePercent = useMemo(() => {
    if (weeklyChartData.length === 0) return 95;
    const sum = weeklyChartData.reduce((acc, curr) => acc + curr.mealScore, 0);
    return Math.round(sum / weeklyChartData.length);
  }, [weeklyChartData]);

  const totalSleepMinutes = useMemo(() => {
    return weeklyChartData.reduce((acc, curr) => acc + curr.sleepMinutes, 0);
  }, [weeklyChartData]);

  const totalMedicatedDays = useMemo(() => {
    return weeklyChartData.filter(d => d.medicated).length;
  }, [weeklyChartData]);

  // Active annotations matching the visible chart timeline
  const activeAnnotationsForChart = useMemo(() => {
    const chartShortDays = new Set(weeklyChartData.map(d => d.short));
    return routineAnnotations.filter(ann => {
      const matchesStudent = !ann.studentId || ann.studentId === activeStudent.id;
      const matchesDay = chartShortDays.has(ann.dayKey) || weeklyChartData.some(d => d.day.includes(ann.dayKey) || d.fullDate === ann.dateLabel);
      return matchesStudent && matchesDay;
    });
  }, [routineAnnotations, activeStudent.id, weeklyChartData]);

  // Quick preset selector for event category
  const handleSelectPresetCategory = (catKey: keyof typeof ROUTINE_ANNOTATION_CATEGORIES) => {
    setNewAnnotationCategory(catKey);
    const cat = ROUTINE_ANNOTATION_CATEGORIES[catKey];
    if (cat) {
      setNewAnnotationTitle(cat.defaultTitle);
      if (!newAnnotationImpact || Object.values(ROUTINE_ANNOTATION_CATEGORIES).some(c => c.defaultImpact === newAnnotationImpact)) {
        setNewAnnotationImpact(cat.defaultImpact);
      }
    }
  };

  // Add new Annotation to LineChart
  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotationTitle.trim()) {
      onToast?.("Por favor, insira o título do evento.", "error");
      return;
    }

    const matchedDay = weeklyChartData.find(d => d.short === newAnnotationDay) || weeklyChartData[0];
    const newAnn: RoutineChartAnnotation = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: activeStudent.id,
      dayKey: newAnnotationDay,
      dateLabel: matchedDay?.fullDate || new Date().toLocaleDateString("pt-BR"),
      eventTitle: newAnnotationTitle.trim(),
      category: newAnnotationCategory,
      description: newAnnotationDescription.trim() || (ROUTINE_ANNOTATION_CATEGORIES[newAnnotationCategory]?.defaultImpact ?? "Evento registrado pela coordenação escolar."),
      authorName: newAnnotationAuthor.trim() || "Coordenação Pedagógica",
      authorRole: newAnnotationAuthorRole,
      createdAt: `${matchedDay?.fullDate || "08/08/2026"} 08:30`,
      impactObserved: newAnnotationImpact.trim() || undefined
    };

    const updated = [newAnn, ...routineAnnotations];
    saveRoutineAnnotations(updated);
    setIsAnnotationModalOpen(false);
    setNewAnnotationTitle("Mudança de Medicação");
    setNewAnnotationDescription("");
    setNewAnnotationImpact("Ajuste na posologia matutina com reflexos temporários no humor e sono.");
    onToast?.(`Anotação "${newAnn.eventTitle}" adicionada ao gráfico da rotina!`, "success");
  };

  // Delete Annotation
  const handleDeleteAnnotation = (id: string) => {
    const updated = routineAnnotations.filter(a => a.id !== id);
    saveRoutineAnnotations(updated);
    if (selectedAnnotationForView?.id === id) {
      setSelectedAnnotationForView(null);
    }
    onToast?.("Anotação removida do gráfico.", "info");
  };

  // Custom sensory-aware dots for Recharts LineChart with smooth transitions
  const renderBehaviorDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    const color = payload.humorColor || branding?.primaryColor || "#d97706";
    return (
      <g key={`dot-humor-${payload.short}`}>
        <circle cx={cx} cy={cy} r={6} fill="#ffffff" stroke={color} strokeWidth={2.5} className="transition-all duration-500 ease-out" />
        <circle cx={cx} cy={cy} r={3} fill={color} className="transition-all duration-500 ease-out" />
      </g>
    );
  };

  const renderSleepDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    return (
      <g key={`dot-sleep-${payload.short}`}>
        <circle cx={cx} cy={cy} r={6} fill="#ffffff" stroke="#6366f1" strokeWidth={2.5} className="transition-all duration-500 ease-out" />
        <circle cx={cx} cy={cy} r={3} fill="#6366f1" className="transition-all duration-500 ease-out" />
      </g>
    );
  };

  const renderMealDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    return (
      <g key={`dot-meal-${payload.short}`}>
        <circle cx={cx} cy={cy} r={6} fill="#ffffff" stroke="#10b981" strokeWidth={2.5} className="transition-all duration-500 ease-out" />
        <circle cx={cx} cy={cy} r={3} fill="#10b981" className="transition-all duration-500 ease-out" />
      </g>
    );
  };

  // Custom sensory & palette-aware chart tooltip (CustomTooltip)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const dayAnnotations = routineAnnotations.filter(
        ann => (ann.dayKey === data.short || ann.dayKey === data.day || ann.dateLabel === data.fullDate) && 
               (ann.studentId === activeStudent.id || !ann.studentId)
      );

      return (
        <div 
          id="daily-routine-linechart-custom-tooltip"
          className="bg-indigo-900/90 dark:bg-indigo-950/92 text-slate-100 p-4 rounded-2xl shadow-2xl border border-indigo-400/40 dark:border-indigo-400/30 text-xs w-72 sm:w-80 space-y-3 backdrop-blur-md transition-all duration-150 z-50 ring-1 ring-white/10"
        >
          {/* Header with Date and Active Indicator Badge */}
          <div className="flex items-center justify-between border-b border-indigo-700/60 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-amber-300 font-serif text-sm tracking-wide">{data.day}</span>
              <span className="text-[10px] text-indigo-200/80 font-sans">| Rotina Diária</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-indigo-100 font-mono font-medium bg-indigo-950/80 px-2.5 py-0.5 rounded-lg border border-indigo-600/60 shadow-2xs">
                {data.fullDate}
              </span>
            </div>
          </div>

          {/* School Admin / Pedagogical Annotations Correlated with Metric Shift */}
          {dayAnnotations.length > 0 && (
            <div className="space-y-2">
              {dayAnnotations.map((ann) => {
                const cat = ROUTINE_ANNOTATION_CATEGORIES[ann.category] || ROUTINE_ANNOTATION_CATEGORIES.custom;
                return (
                  <div 
                    key={`tt-ann-${ann.id}`}
                    className="bg-indigo-950/95 border-2 border-amber-400/80 rounded-xl p-2.5 space-y-1.5 shadow-xl text-slate-100 ring-1 ring-amber-400/20"
                  >
                    <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-indigo-800/80">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs font-serif">
                        <Pin className="w-3.5 h-3.5 text-rose-400 shrink-0 fill-rose-400" />
                        <span>{ann.eventTitle}</span>
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border ${cat.bg} ${cat.border} ${cat.text}`}>
                        {cat.emoji} {cat.label}
                      </span>
                    </div>

                    {ann.description && (
                      <p className="text-[10.5px] text-slate-200 leading-snug">
                        {ann.description}
                      </p>
                    )}

                    {ann.impactObserved && (
                      <div className="text-[10px] text-amber-200/90 bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/30 flex items-start gap-1 font-medium leading-tight">
                        <TrendingUp className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong>Correlação:</strong> {ann.impactObserved}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-0.5 text-[9px] text-indigo-300/80 font-mono">
                      <span>Por: {ann.authorName}</span>
                      <span>{ann.createdAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Primary Exact Value Highlight Card */}
          {chartMetricFilter === "behavior" && (
            <div className="bg-amber-950/50 border border-amber-500/40 rounded-xl p-3 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-200 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Comportamento & Humor</span>
                </span>
                <span className="text-[10px] text-amber-300/80 font-mono font-bold bg-amber-900/60 px-1.5 py-0.5 rounded">
                  Escala 1 a 4
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{data.humorEmoji}</span>
                  <div>
                    <div className="text-sm font-bold text-white font-serif" style={{ color: data.humorColor }}>
                      {data.humorState}
                    </div>
                    <div className="text-[10px] text-amber-200/70">
                      {data.humorScore === 4 ? "Excelente adaptação" : data.humorScore === 3 ? "Ativo e participativo" : data.humorScore === 2 ? "Acolhimento especial" : "Necessitou repouso"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">Valor Exato</div>
                  <div className="text-base font-black text-amber-300 font-mono">{data.humorScore} <span className="text-xs text-amber-400/70">/ 4</span></div>
                </div>
              </div>
            </div>
          )}

          {chartMetricFilter === "sleep" && (
            <div className="bg-indigo-900/50 border border-indigo-400/40 rounded-xl p-3 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-indigo-200 font-semibold flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Qualidade do Sono & Soneca</span>
                </span>
                <span className="text-[10px] text-indigo-300/90 font-mono font-bold bg-indigo-800/80 px-1.5 py-0.5 rounded">
                  {data.sleepNormalized}% da meta
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌙</span>
                  <div>
                    <div className="text-sm font-bold text-white font-serif">
                      {data.sleepLabel}
                    </div>
                    <div className="text-[10px] text-indigo-200/70">
                      {data.sleepMinutes > 0 ? "Repouso escolar concluído" : "Não dormiu durante o período"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-indigo-300/90 tracking-wider">Valor Exato</div>
                  <div className="text-base font-black text-indigo-200 font-mono">{data.sleepMinutes} <span className="text-xs text-indigo-300/70">min</span></div>
                </div>
              </div>
            </div>
          )}

          {chartMetricFilter === "meals" && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-200 font-semibold flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Status de Alimentação</span>
                </span>
                <span className="text-[10px] text-emerald-300/90 font-mono font-bold bg-emerald-900/70 px-1.5 py-0.5 rounded">
                  Taxa de Aceitação
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <div>
                  <div className="text-sm font-bold text-white font-serif flex items-center gap-1.5">
                    <span>🥗</span> {data.mealScore >= 75 ? "Ótima aceitação" : data.mealScore >= 50 ? "Aceitação moderada" : "Recusa parcial"}
                  </div>
                  <div className="text-[10.5px] text-emerald-300/80 pt-0.5">
                    Almoço: <strong className="text-white capitalize">{data.mealLunch}</strong> | Lanche: <strong className="text-white capitalize">{data.mealSnack}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-emerald-400/90 tracking-wider">Valor Exato</div>
                  <div className="text-base font-black text-emerald-300 font-mono">{data.mealScore}%</div>
                </div>
              </div>
            </div>
          )}

          {chartMetricFilter === "all" && (
            <div className="space-y-2 bg-indigo-900/40 p-2.5 rounded-xl border border-indigo-700/50 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-amber-300 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Humor:
                </span>
                <span className="font-bold text-white font-mono">
                  {data.humorEmoji} {data.humorState} ({data.humorScore}/4)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-300 flex items-center gap-1.5 font-medium">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> Sono:
                </span>
                <span className="font-bold text-indigo-200 font-mono">
                  {data.sleepMinutes} min ({data.sleepLabel})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-300 flex items-center gap-1.5 font-medium">
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" /> Refeições:
                </span>
                <span className="font-bold text-emerald-300 font-mono">
                  {data.mealScore}% ({data.mealLunch})
                </span>
              </div>
            </div>
          )}

          {/* Secondary contextual indicators when looking at a single metric */}
          {chartMetricFilter !== "all" && (
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300 pt-0.5">
              {chartMetricFilter !== "behavior" && (
                <div className="flex items-center justify-between bg-indigo-900/40 px-2 py-1 rounded-lg border border-indigo-800/60">
                  <span className="text-indigo-300/80">Humor:</span>
                  <span className="font-semibold text-amber-200 flex items-center gap-1">
                    <span>{data.humorEmoji}</span> {data.humorScore}/4
                  </span>
                </div>
              )}
              {chartMetricFilter !== "meals" && (
                <div className="flex items-center justify-between bg-indigo-900/40 px-2 py-1 rounded-lg border border-indigo-800/60">
                  <span className="text-indigo-300/80">Alimentação:</span>
                  <span className="font-semibold text-emerald-300">{data.mealScore}%</span>
                </div>
              )}
              {chartMetricFilter !== "sleep" && (
                <div className="flex items-center justify-between bg-indigo-900/40 px-2 py-1 rounded-lg border border-indigo-800/60">
                  <span className="text-indigo-300/80">Soneca:</span>
                  <span className="font-semibold text-indigo-200">{data.sleepMinutes}m</span>
                </div>
              )}
            </div>
          )}

          {/* Medication Administration Alert */}
          {data.medicated && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 text-[10.5px]">
              <Pill className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="font-bold">Medicação:</span>
              <span className="truncate">Ministrada conforme prescrição escolar</span>
            </div>
          )}

          {/* Pedagogical Daily Note Quotation */}
          {data.note && (
            <div className="pt-2 border-t border-indigo-800/60 text-[10.5px] text-indigo-100/90 italic bg-indigo-900/30 p-2.5 rounded-xl border border-indigo-800/40 leading-relaxed">
              <span className="text-amber-400 font-bold not-italic mr-1">Observação do dia:</span>
              "{data.note.length > 95 ? data.note.substring(0, 95) + "..." : data.note}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Alias for backward compatibility
  const CustomChartTooltip = CustomTooltip;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 1. MAIN HEADER & PERIOD SELECTION */}
      <div className="bg-white/95 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-100/70 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-800 dark:text-amber-400 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Diário Escolar em Tempo Real
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-black text-[#423326] dark:text-amber-100 flex items-center gap-2">
              <Smile className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <span>Rotina & Ocorrências:</span>
              <span className="text-amber-700 dark:text-amber-400 underline decoration-amber-300/60 underline-offset-4">
                {activeStudent.name}
              </span>
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-normal max-w-2xl">
              Acompanhe alimentação, sono, medicamentos e a evolução do bem-estar emocional do aluno com registros pedagógicos contínuos.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:self-end">
            <ExportReportButton
              activeStudent={activeStudent}
              occurrences={filteredOccurrences}
              periodLabel={
                selectedPeriod === "recent" ? "Últimos 30 Dias" :
                selectedPeriod === "july" ? "Julho de 2026" :
                selectedPeriod === "june" ? "Junho de 2026" :
                "Histórico Completo"
              }
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. RECHARTS COMPONENT: EVOLUÇÃO SEMANAL DO HUMOR E COMPORTAMENTO */}
        {/* ========================================================================= */}
        <div className="mt-5 pt-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fdfaf3] dark:bg-slate-950/60 p-3.5 rounded-xl border border-amber-200/50 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold font-serif text-[#423326] dark:text-amber-100 flex items-center gap-1.5">
                  <span>Variação de Humor & Disposição na Semana</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                    Média {averageHumorScore}/4.0
                  </span>
                </h4>
                <p className="text-[10.5px] text-slate-700 dark:text-slate-300 font-medium">
                  Oscilação do estado emocional e nível de engajamento do aluno de Segunda a Sexta-feira
                </p>
              </div>
            </div>

            {/* Chart toggle controls */}
            <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
              <button
                id="toggle-evolution-overlay-btn"
                type="button"
                onClick={() => {
                  const next = !showEvolutionOverlay;
                  setShowEvolutionOverlay(next);
                  onToast?.(next ? "Overlay de Evolução Pedagógica ATIVADO (Mês Atual vs Semestre Anterior)" : "Overlay de Evolução ocultado.", "info");
                }}
                className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-[10.5px] font-bold font-serif border ${
                  showEvolutionOverlay
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-2xs ring-1 ring-indigo-400/40"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
                title="Alternar overlay comparativo entre o Mês Atual e o Semestre Anterior"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Overlay Evolução</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-black uppercase ${
                  showEvolutionOverlay ? "bg-indigo-950/70 text-indigo-200 border border-indigo-400/40" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}>
                  {showEvolutionOverlay ? "Mês vs Semestre" : "OFF"}
                </span>
              </button>

              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-amber-200/40 dark:border-slate-800 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setChartViewMode("line")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    chartViewMode === "line"
                      ? "bg-amber-700 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Visualização em Linha Suave de Bem-Estar"
                >
                  <Activity className="w-3 h-3" />
                  <span>Linha</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartViewMode("bar")}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                    chartViewMode === "bar"
                      ? "bg-amber-700 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title="Visualização em Barras com Aceitação Alimentar"
                >
                  <BarChart2 className="w-3 h-3" />
                  <span>Colunas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Canvas inside .daily-routine-chart-container */}
          <div id="daily-routine-chart-container" className="daily-routine-chart-container grid grid-cols-1 grid-rows-[auto_1fr] gap-3.5 w-full bg-white dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-100 dark:border-slate-800 shadow-2xs">
            {/* Behavior & Metric Dropdown Filter with CSS Grid Auto-Fill */}
            <div className="daily-routine-filter-grid grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] items-center justify-between gap-3 pb-3 border-b border-amber-100/70 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 font-serif shrink-0">
                  <Filter className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Filtrar Métrica do Gráfico:</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate hidden lg:inline">
                  {activeMetricOption.description}
                </span>
              </div>

              <div className="flex items-center justify-start sm:justify-end min-w-0">
                {/* Styled Card Dropdown Selector */}
                <div ref={metricDropdownRef} className="relative w-full sm:w-auto">
                  <button
                    id="daily-routine-metric-dropdown-btn"
                    type="button"
                    onClick={() => setIsMetricDropdownOpen(prev => !prev)}
                    aria-expanded={isMetricDropdownOpen}
                    aria-haspopup="listbox"
                    className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 px-3 py-1.5 bg-[#fcfaf2] dark:bg-slate-900 border border-amber-300/80 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 text-slate-800 dark:text-slate-100 rounded-xl shadow-2xs transition-all cursor-pointer group"
                    title="Alternar entre Comportamento, Qualidade do Sono e Status de Alimentação"
                  >
                    <span 
                      className="w-5 h-5 rounded-md flex items-center justify-center text-xs shadow-2xs border border-amber-200/60 dark:border-slate-800 shrink-0"
                      style={{ backgroundColor: `${activeMetricOption.color}15`, color: activeMetricOption.color }}
                    >
                      <activeMetricOption.icon className="w-3 h-3" />
                    </span>
                    <span className="text-xs font-bold font-serif text-slate-800 dark:text-slate-100 truncate">
                      {activeMetricOption.label}
                    </span>
                    <span className={`text-[9.5px] px-1.5 py-0.5 rounded-full border font-semibold hidden xs:inline ${activeMetricOption.badgeBg}`}>
                      {activeMetricOption.tag}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-amber-700 dark:text-amber-400 transition-transform duration-200 shrink-0 ${isMetricDropdownOpen ? "rotate-180 text-amber-600" : ""}`} />
                  </button>

                  {/* Dropdown Menu Card Popover */}
                  <AnimatePresence>
                    {isMetricDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -4 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-2.5rem)] z-50 bg-[#fffdfa] dark:bg-slate-900 border border-amber-200/90 dark:border-slate-700 rounded-2xl shadow-xl p-2 space-y-1.5"
                        role="listbox"
                        aria-label="Métricas da rotina diária"
                      >
                        <div className="px-2 py-1 border-b border-amber-100/80 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold tracking-wider text-amber-800/80 dark:text-amber-400 uppercase font-serif">
                          <span>Selecione a Métrica</span>
                          <span className="text-[9px] font-normal normal-case text-slate-500">Linha & Colunas</span>
                        </div>

                        <div className="space-y-1 pt-0.5">
                          {CHART_METRIC_OPTIONS.map((opt) => {
                            const isSelected = chartMetricFilter === opt.id;
                            const IconComponent = opt.icon;

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  setChartMetricFilter(opt.id);
                                  setIsMetricDropdownOpen(false);
                                }}
                                className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                                  isSelected
                                    ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-2xs ring-1 ring-amber-400/30"
                                    : "bg-white dark:bg-slate-800/60 border-amber-100/60 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700 hover:bg-amber-50/50 dark:hover:bg-slate-800/90"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-slate-700 shadow-2xs"
                                    style={{ backgroundColor: `${opt.color}18`, color: opt.color }}
                                  >
                                    <IconComponent className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                        {opt.label}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {opt.emoji}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-[200px]">
                                      {opt.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center">
                                  {isSelected ? (
                                    <CheckCircle2 className="w-4 h-4" style={{ color: opt.color }} />
                                  ) : (
                                    <span className="text-[9.5px] px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-400">
                                      {opt.tag}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hidden native select for accessibility & automation */}
                  <select
                    id="daily-routine-metric-filter"
                    aria-label="Filtrar métrica do gráfico da rotina diária"
                    value={chartMetricFilter}
                    onChange={(e) => setChartMetricFilter(e.target.value as any)}
                    className="sr-only"
                  >
                    <option value="behavior">Comportamento</option>
                    <option value="sleep">Qualidade do Sono</option>
                    <option value="meals">Status de Alimentação</option>
                    <option value="all">Todas as Métricas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* School Admin Chart Annotations Control Bar */}
            <div id="daily-routine-annotations-bar" className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 bg-amber-50/60 dark:bg-slate-900/90 rounded-xl border border-amber-200/70 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 font-serif shrink-0">
                  <Bookmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Anotações Pedagógicas no Gráfico ({activeAnnotationsForChart.length}):</span>
                </span>
                
                {activeAnnotationsForChart.length === 0 ? (
                  <span className="text-[10.5px] text-slate-500 italic">
                    Nenhum evento registrado nesta semana.
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {activeAnnotationsForChart.map(ann => {
                      const cat = ROUTINE_ANNOTATION_CATEGORIES[ann.category] || ROUTINE_ANNOTATION_CATEGORIES.custom;
                      return (
                        <button
                          key={`chip-${ann.id}`}
                          type="button"
                          onClick={() => setSelectedAnnotationForView(ann)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10.5px] font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xs ${cat.bg} ${cat.border} ${cat.text}`}
                          title={`Dia: ${ann.dayKey} (${ann.dateLabel}) - Clique para ver detalhes e correlação`}
                        >
                          <span className="text-xs">{cat.emoji}</span>
                          <span className="truncate max-w-[130px]">{ann.eventTitle}</span>
                          <span className="opacity-70 text-[9.5px] font-mono">({ann.dayKey})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Button for School Admin / Teachers to Add New Annotation */}
              <button
                id="daily-routine-add-annotation-btn"
                type="button"
                onClick={() => {
                  setNewAnnotationDay(weeklyChartData[0]?.short || "Seg");
                  setIsAnnotationModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-xl font-bold font-serif text-xs shadow-xs transition-all cursor-pointer hover:shadow-sm active:scale-95 ml-auto"
                title="Adicionar anotação de evento no gráfico (ex: Mudança de Medicação, Semana de Avaliações)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Anotação no Gráfico</span>
              </button>
            </div>

            <div className="daily-routine-chart-viewport relative w-full aspect-[4/3] xs:aspect-[16/10] sm:aspect-[16/8] md:aspect-[2.2/1] min-h-[300px] max-h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartViewMode === "line" ? (
                  <LineChart data={weeklyChartData} margin={{ top: 18, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1e8dc" vertical={false} opacity={0.6} />
                    <XAxis
                      dataKey="short"
                      tick={{ fontSize: 11, fill: "#78716c", fontWeight: 600 }}
                      axisLine={{ stroke: "#e7e5e4" }}
                      tickLine={false}
                    />

                    {/* Dynamic Event & Milestone ReferenceLines from Admin Annotations */}
                    {activeAnnotationsForChart.map(ann => {
                      const cat = ROUTINE_ANNOTATION_CATEGORIES[ann.category] || ROUTINE_ANNOTATION_CATEGORIES.custom;
                      return (
                        <ReferenceLine
                          key={`ref-line-${ann.id}`}
                          x={ann.dayKey}
                          stroke={cat.color}
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          label={{
                            value: `📍 ${ann.eventTitle.length > 14 ? ann.eventTitle.substring(0, 14) + "…" : ann.eventTitle}`,
                            position: "insideTopRight",
                            fill: cat.color,
                            fontSize: 10,
                            fontWeight: 700,
                            offset: 6,
                          }}
                        />
                      );
                    })}

                    {chartMetricFilter !== "all" ? (
                      <>
                        <YAxis
                          domain={
                            chartMetricFilter === "behavior"
                              ? [0.5, 4.5]
                              : chartMetricFilter === "sleep"
                              ? [0, 140]
                              : [0, 105]
                          }
                          ticks={
                            chartMetricFilter === "behavior"
                              ? [1, 2, 3, 4]
                              : chartMetricFilter === "sleep"
                              ? [0, 30, 60, 90, 120]
                              : [0, 25, 50, 75, 100]
                          }
                          tickFormatter={(v) => {
                            if (chartMetricFilter === "behavior") {
                              if (v === 4) return "🌟 Ótimo";
                              if (v === 3) return "⚡ Ativo";
                              if (v === 2) return "🧸 Dengoso";
                              if (v === 1) return "💤 Cansado";
                              return "";
                            }
                            if (chartMetricFilter === "sleep") {
                              return v === 0 ? "0m" : v === 60 ? "1h" : v === 120 ? "2h" : `${v}m`;
                            }
                            return `${v}%`;
                          }}
                          tick={{ fontSize: 9.5, fill: "#78716c", fontWeight: 600 }}
                          axisLine={{ stroke: "#e7e5e4" }}
                          tickLine={false}
                        />

                        {/* Normal baseline references */}
                        {chartMetricFilter === "behavior" && (
                          <ReferenceLine y={3} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.3} />
                        )}
                        {chartMetricFilter === "sleep" && (
                          <ReferenceLine y={60} stroke="#6366f1" strokeDasharray="3 3" strokeOpacity={0.3} />
                        )}
                        {chartMetricFilter === "meals" && (
                          <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.3} />
                        )}

                        {/* Comparative Evolution Overlay (Previous Semester Benchmark vs Current Month) */}
                        {showEvolutionOverlay && chartMetricFilter === "behavior" && (
                          <>
                            <ReferenceLine
                              y={3.1}
                              stroke="#64748b"
                              strokeDasharray="4 4"
                              strokeWidth={2}
                              label={{
                                value: "📊 Semestre Anterior: 3.1",
                                position: "insideBottomLeft",
                                fill: "#475569",
                                fontSize: 10,
                                fontWeight: 700
                              }}
                            />
                            <ReferenceLine
                              y={Number(averageHumorScore) || 3.8}
                              stroke="#d97706"
                              strokeDasharray="3 3"
                              strokeWidth={2}
                              label={{
                                value: `📈 Mês Atual: ${averageHumorScore}`,
                                position: "insideTopLeft",
                                fill: "#b45309",
                                fontSize: 10,
                                fontWeight: 700
                              }}
                            />
                          </>
                        )}

                        {showEvolutionOverlay && chartMetricFilter === "sleep" && (
                          <>
                            <ReferenceLine
                              y={55}
                              stroke="#64748b"
                              strokeDasharray="4 4"
                              strokeWidth={2}
                              label={{
                                value: "📊 Semestre Anterior: 55m",
                                position: "insideBottomLeft",
                                fill: "#475569",
                                fontSize: 10,
                                fontWeight: 700
                              }}
                            />
                            <ReferenceLine
                              y={80}
                              stroke="#6366f1"
                              strokeDasharray="3 3"
                              strokeWidth={2}
                              label={{
                                value: "📈 Mês Atual: 80m",
                                position: "insideTopLeft",
                                fill: "#4f46e5",
                                fontSize: 10,
                                fontWeight: 700
                              }}
                            />
                          </>
                        )}

                        {showEvolutionOverlay && chartMetricFilter === "meals" && (
                          <>
                            <ReferenceLine
                              y={68}
                              stroke="#64748b"
                              strokeDasharray="4 4"
                              strokeWidth={2}
                              label={{
                                value: "📊 Semestre Anterior: 68%",
                                position: "insideBottomLeft",
                                fill: "#475569",
                                fontSize: 10,
                                fontWeight: 700
                              }}
                            />
                            <ReferenceLine
                              y={mealAdherencePercent || 88}
                              stroke="#10b981"
                              strokeDasharray="3 3"
                              strokeWidth={2}
                              label={{
                                value: `📈 Mês Atual: ${mealAdherencePercent}%`,
                                position: "insideTopLeft",
                                fill: "#047857",
                                fontSize: 10,
                                fontWeight: 700
                              }}
                            />
                          </>
                        )}

                        <Line
                          key="daily-routine-single-line"
                          type="monotone"
                          name={
                            chartMetricFilter === "behavior"
                              ? "Humor / Comportamento"
                              : chartMetricFilter === "sleep"
                              ? "Sono & Repouso (min)"
                              : "Aceitação Alimentar (%)"
                          }
                          dataKey={
                            chartMetricFilter === "behavior"
                              ? "humorScore"
                              : chartMetricFilter === "sleep"
                              ? "sleepMinutes"
                              : "mealScore"
                          }
                          stroke={
                            chartMetricFilter === "behavior"
                              ? (branding?.primaryColor || "#d97706")
                              : chartMetricFilter === "sleep"
                              ? "#6366f1"
                              : "#10b981"
                          }
                          strokeWidth={3}
                          dot={
                            chartMetricFilter === "behavior"
                              ? renderBehaviorDot
                              : chartMetricFilter === "sleep"
                              ? renderSleepDot
                              : renderMealDot
                          }
                          activeDot={{
                            r: 7,
                            stroke: "#ffffff",
                            strokeWidth: 2,
                            fill:
                              chartMetricFilter === "behavior"
                                ? (branding?.primaryColor || "#d97706")
                                : chartMetricFilter === "sleep"
                                ? "#6366f1"
                                : "#10b981",
                          }}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                          animationBegin={0}
                        />
                      </>
                    ) : (
                      <>
                        <YAxis
                          domain={[0, 105]}
                          ticks={[0, 25, 50, 75, 100]}
                          tickFormatter={(v) => `${v}%`}
                          tick={{ fontSize: 9.5, fill: "#78716c", fontWeight: 600 }}
                          axisLine={{ stroke: "#e7e5e4" }}
                          tickLine={false}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                        <Line
                          key="daily-routine-all-line-humor"
                          type="monotone"
                          name="🌟 Humor / Disposição (%)"
                          dataKey="humorScoreNormalized"
                          stroke={branding?.primaryColor || "#d97706"}
                          strokeWidth={2.5}
                          dot={renderBehaviorDot}
                          activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: "#d97706" }}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                          animationBegin={0}
                        />
                        <Line
                          key="daily-routine-all-line-meals"
                          type="monotone"
                          name="🥗 Aceitação Alimentar (%)"
                          dataKey="mealScore"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={renderMealDot}
                          activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: "#10b981" }}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                          animationBegin={0}
                        />
                        <Line
                          key="daily-routine-all-line-sleep"
                          type="monotone"
                          name="🌙 Sono & Repouso (%)"
                          dataKey="sleepNormalized"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          dot={renderSleepDot}
                          activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: "#6366f1" }}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                          animationBegin={0}
                        />
                      </>
                    )}

                    <Tooltip content={<CustomTooltip />} />
                  </LineChart>
                ) : (
                  <BarChart data={weeklyChartData} margin={{ top: 18, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1e8dc" vertical={false} opacity={0.6} />
                    <XAxis
                      dataKey="short"
                      tick={{ fontSize: 11, fill: "#78716c", fontWeight: 600 }}
                      axisLine={{ stroke: "#e7e5e4" }}
                      tickLine={false}
                    />

                    {/* Annotations ReferenceLine for Bar Chart as well */}
                    {activeAnnotationsForChart.map(ann => {
                      const cat = ROUTINE_ANNOTATION_CATEGORIES[ann.category] || ROUTINE_ANNOTATION_CATEGORIES.custom;
                      return (
                        <ReferenceLine
                          key={`ref-line-bar-${ann.id}`}
                          x={ann.dayKey}
                          stroke={cat.color}
                          strokeDasharray="4 4"
                          strokeWidth={2}
                          label={{
                            value: `📍 ${ann.eventTitle.length > 14 ? ann.eventTitle.substring(0, 14) + "…" : ann.eventTitle}`,
                            position: "insideTopRight",
                            fill: cat.color,
                            fontSize: 10,
                            fontWeight: 700,
                            offset: 6,
                          }}
                        />
                      );
                    })}

                    {chartMetricFilter === "behavior" && (
                      <>
                        <YAxis
                          domain={[0, 4.5]}
                          ticks={[1, 2, 3, 4]}
                          tickFormatter={(v) => {
                            if (v === 4) return "🌟 4";
                            if (v === 3) return "⚡ 3";
                            if (v === 2) return "🧸 2";
                            if (v === 1) return "💤 1";
                            return "";
                          }}
                          tick={{ fontSize: 9.5, fill: "#78716c", fontWeight: 600 }}
                          axisLine={{ stroke: "#e7e5e4" }}
                          tickLine={false}
                        />
                        <Bar
                          key="daily-routine-bar-behavior"
                          dataKey="humorScore"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={42}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                          animationBegin={0}
                        >
                          {weeklyChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.humorScore === 4 ? "#10b981" :
                                entry.humorScore === 3 ? "#f59e0b" :
                                entry.humorScore === 2 ? "#6366f1" :
                                "#8b5cf6"
                              }
                            />
                          ))}
                        </Bar>
                      </>
                    )}

                    {chartMetricFilter === "sleep" && (
                      <>
                        <YAxis
                          domain={[0, 140]}
                          ticks={[0, 30, 60, 90, 120]}
                          tickFormatter={(v) => (v === 0 ? "0m" : v === 60 ? "1h" : v === 120 ? "2h" : `${v}m`)}
                          tick={{ fontSize: 9.5, fill: "#78716c", fontWeight: 600 }}
                          axisLine={{ stroke: "#e7e5e4" }}
                          tickLine={false}
                        />
                        <Bar
                          key="daily-routine-bar-sleep"
                          dataKey="sleepMinutes"
                          fill="#6366f1"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={42}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                          animationBegin={0}
                        />
                      </>
                    )}

                    {chartMetricFilter === "meals" && (
                      <>
                        <YAxis
                          domain={[0, 105]}
                          ticks={[0, 25, 50, 75, 100]}
                          tickFormatter={(v) => `${v}%`}
                          tick={{ fontSize: 9.5, fill: "#78716c", fontWeight: 600 }}
                          axisLine={{ stroke: "#e7e5e4" }}
                          tickLine={false}
                        />
                        <Bar
                          key="daily-routine-bar-meals"
                          dataKey="mealScore"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={42}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                          animationBegin={0}
                        />
                      </>
                    )}

                    {chartMetricFilter === "all" && (
                      <>
                        <YAxis
                          domain={[0, 105]}
                          ticks={[0, 25, 50, 75, 100]}
                          tickFormatter={(v) => `${v}%`}
                          tick={{ fontSize: 9.5, fill: "#78716c", fontWeight: 600 }}
                          axisLine={{ stroke: "#e7e5e4" }}
                          tickLine={false}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                        <Bar
                          key="daily-routine-all-bar-humor"
                          dataKey="humorScoreNormalized"
                          name="Humor (%)"
                          fill="#d97706"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={18}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                          animationBegin={0}
                        />
                        <Bar
                          key="daily-routine-all-bar-meals"
                          dataKey="mealScore"
                          name="Alimentação (%)"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={18}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                          animationBegin={0}
                        />
                        <Bar
                          key="daily-routine-all-bar-sleep"
                          dataKey="sleepNormalized"
                          name="Sono (%)"
                          fill="#6366f1"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={18}
                          isAnimationActive={true}
                          animationDuration={800}
                          animationEasing="ease-in-out"
                          animationBegin={0}
                        />
                      </>
                    )}

                    <Tooltip content={<CustomTooltip />} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Quick Stat Pill Cards under chart */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-amber-100/60 dark:border-slate-800 text-xs">
              <div className="bg-[#fcfaf2] dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/40 dark:border-slate-800">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                  Humor Médio
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-black text-amber-800 dark:text-amber-300">{averageHumorScore}</span>
                  <span className="text-[10px] text-slate-400">/ 4.0</span>
                  <span className="ml-auto text-xs">🌟</span>
                </div>
              </div>

              <div className="bg-[#fcfaf2] dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/40 dark:border-slate-800">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                  Aceitação Alimentar
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{mealAdherencePercent}%</span>
                  <span className="ml-auto text-xs">🍽️</span>
                </div>
              </div>

              <div className="bg-[#fcfaf2] dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/40 dark:border-slate-800">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                  Soneca Total (Semana)
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-black text-indigo-700 dark:text-indigo-400">
                    {Math.floor(totalSleepMinutes / 60)}h {totalSleepMinutes % 60}m
                  </span>
                  <span className="ml-auto text-xs">💤</span>
                </div>
              </div>

              <div className="bg-[#fcfaf2] dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/40 dark:border-slate-800">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">
                  Prescrições Médicas
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm font-black text-rose-700 dark:text-rose-400">
                    {totalMedicatedDays > 0 ? `${totalMedicatedDays} administrada(s)` : "Sem medicação"}
                  </span>
                  <span className="ml-auto text-xs">💊</span>
                </div>
              </div>
            </div>

            {/* Evolution Comparative Overlay Insight Panel */}
            {showEvolutionOverlay && (
              <div id="daily-routine-evolution-banner" className="mt-2.5 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-sm">
                    📈
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold font-serif text-indigo-950 dark:text-indigo-200 text-xs">
                        Análise Comparativa de Evolução Pedagógica
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-200/70 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200 font-bold">
                        Mês Atual vs Semestre Anterior (2026.1)
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-800/90 dark:text-indigo-300 mt-0.5 leading-relaxed">
                      Evolução de humor: <span className="font-bold text-emerald-700 dark:text-emerald-300">+{((Number(averageHumorScore) - 3.1) / 3.1 * 100).toFixed(0)}%</span> (de 3.1 para {averageHumorScore}/4.0) • Sono escolar: <span className="font-bold text-indigo-700 dark:text-indigo-300">+25min/dia</span> • Apetite estável em <span className="font-bold text-emerald-700 dark:text-emerald-300">{mealAdherencePercent}%</span>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">Linha cinza tracejada = Baseline</span>
                  <button
                    type="button"
                    onClick={() => setShowEvolutionOverlay(false)}
                    className="text-[10.5px] text-indigo-900 dark:text-indigo-300 hover:underline px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-indigo-250 dark:border-indigo-800 font-bold"
                  >
                    Ocultar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Period & Behavior Filters Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-5 mt-5 border-t border-amber-100/70 dark:border-slate-800">
          {/* Period selector buttons */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#423326] dark:text-amber-200 block">
              Filtrar por Período:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "recent", label: "Últimos 30 dias 📅" },
                { id: "july", label: "Julho/2026 ☀️" },
                { id: "june", label: "Junho/2026 🍂" },
                { id: "all", label: "Ver Tudo 📁" }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPeriod(p.id as any)}
                  className={`text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedPeriod === p.id
                      ? "bg-amber-800 text-white shadow-xs scale-102"
                      : "bg-[#fcfaf2] dark:bg-slate-800 hover:bg-amber-100/55 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-amber-200/50 dark:border-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Behavior Filter, High-Contrast Toggle & Density Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-end">
            {/* Behavior tag filter */}
            <div className="flex items-center gap-1 bg-[#fcfaf2] dark:bg-slate-800 p-1 rounded-xl border border-amber-200/50 dark:border-slate-700 text-xs">
              <Filter className="w-3 h-3 text-slate-400 ml-1.5" />
              <select
                value={behaviorFilter}
                onChange={(e) => setBehaviorFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none pr-2 py-0.5 cursor-pointer"
              >
                <option value="all">🎭 Todos os Humores</option>
                <option value="otimo">🌟 Radiante / Ótimo</option>
                <option value="agitado">⚡ Super Ativo</option>
                <option value="triste">🧸 Dengoso / Saudades</option>
                <option value="cansado">💤 Cansadinho</option>
              </select>
            </div>

            {/* High-Contrast Accessibility Toggle */}
            <button
              type="button"
              id="toggle-toolbar-high-contrast"
              onClick={handleToggleHighContrastAlerts}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                highContrastAlerts
                  ? "bg-rose-700 border-rose-800 text-white shadow-xs ring-2 ring-rose-400/40"
                  : "bg-[#fcfaf2] dark:bg-slate-800 border-amber-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400"
              }`}
              title="Alternar Modo de Alto Contraste para deficientes visuais e ambientes de alta luminosidade"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Alto Contraste {highContrastAlerts ? "(Ativo)" : ""}</span>
            </button>

            {/* Density toggle */}
            <button
              type="button"
              onClick={() => setIsCompactCards(!isCompactCards)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isCompactCards
                  ? "bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200"
                  : "bg-[#fcfaf2] dark:bg-slate-800 border-amber-200/50 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              }`}
              title="Alternar entre modo compacto e detalhado"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isCompactCards ? "Visão Ultra-Compacta" : "Visão Padrão"}</span>
            </button>

            {/* Quick Occurrence Glow & Inset Shadow Panel trigger */}
            <button
              type="button"
              onClick={() => setIsGlowConfigModalOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/90 dark:border-rose-900/70 text-rose-900 dark:text-rose-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:bg-rose-100 dark:hover:bg-rose-900/60"
              title="Ajustar intensidade da borda interna (inset box-shadow), brilho e cadência dos itens críticos (.occurrence-item.is-critical)"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Brilho & Borda Crítica</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. COMPACT & STRUCTURED OCCURRENCE CARDS */}
        {/* ========================================================================= */}
        {filteredOccurrences.length === 0 ? (
          <div className="pt-8 pb-4 text-center text-slate-500 text-xs italic space-y-2">
            <Smile className="w-8 h-8 mx-auto opacity-40 text-amber-600" />
            <p>Nenhuma ocorrência registrada para o filtro ou período selecionado.</p>
          </div>
        ) : (
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
              <span>{filteredOccurrences.length} registro(s) escolar(es)</span>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">
                Clique nos itens críticos para abrir o dossiê detalhado
              </span>
            </div>

            <div id="daily-routine-card-container" className="daily-routine-card-container">
              {filteredOccurrences.map((occ, idx) => {
                const behaviorInfo = BEHAVIOR_MAP[occ.behaviorState] || BEHAVIOR_MAP.otimo;
                const behaviorStatus = getBehaviorStatusInfo(occ.behaviorState);
                const isExpanded = expandedCardIds[occ.id] !== undefined ? expandedCardIds[occ.id] : !isCompactCards;
                const occSleepMins = parseSleepMinutes(occ.sleep?.durationStr || "");
                const isCritical = isCriticalOccurrence(occ, currentGradeThresholds) || occ.behaviorState === "agitado" || (occSleepMins > 0 && occSleepMins < 30);
                const isExtremelyUrgent = (occ.behaviorState === "agitado" && occSleepMins > 0 && occSleepMins < 30) || (occSleepMins > 0 && occSleepMins <= 15);

                return (
                  <motion.div
                    key={occ.id}
                    layout
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38, ease: "easeOut", delay: idx * 0.04 }}
                    data-high-contrast={isCritical && highContrastAlerts ? "true" : undefined}
                    style={isExtremelyUrgent ? ({ "--occurrence-pulse-duration": "1.1s" } as React.CSSProperties) : undefined}
                    className={`occurrence-item rounded-xl border transition-all ${
                      isCritical
                        ? `is-critical ${highContrastAlerts ? "high-contrast-alert" : ""} ${isExtremelyUrgent ? "is-urgent pulse-urgent ring-2 ring-rose-500/80" : "ring-1 ring-rose-400/50"} bg-rose-50/60 dark:bg-rose-950/40 border-rose-500 dark:border-rose-600 shadow-sm cursor-pointer`
                        : idx === 0
                        ? "bg-amber-50/40 dark:bg-slate-900/90 border-amber-300/70 dark:border-amber-700/50 shadow-xs"
                        : "bg-[#fcfaf2]/60 dark:bg-slate-900/60 border-amber-200/40 dark:border-slate-800"
                    }`}
                  >
                    {/* CARD HEADER (Always Compact & Clickable) */}
                    <div
                      onClick={() => {
                        if (isCritical) {
                          handleOpenCriticalDetailModal(occ);
                        } else {
                          toggleExpandCard(occ.id);
                        }
                      }}
                      className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg ${isCritical ? "bg-rose-500/20 text-rose-700 dark:text-rose-300" : "bg-amber-500/10 dark:bg-slate-800 text-amber-700 dark:text-amber-400"}`}>
                            <Clock className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <span className="font-serif font-black text-sm text-[#423326] dark:text-amber-100 block">
                              {occ.date}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              Turma {activeGradeName}
                            </span>
                          </div>
                        </div>

                        {/* Critical occurrence warning badge */}
                        {isCritical && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCriticalDetailModal(occ);
                            }}
                            className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                            title="Clique para abrir o Dossiê Completo e Histórico de Intervenções deste Alerta"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-200" />
                            <span>Ocorrência Crítica</span>
                            <FileText className="w-2.5 h-2.5 text-white/80" />
                          </button>
                        )}

                        {/* Dynamic Behavior Status Badge (Verde = Bom, Amarelo = Alerta, Vermelho = Crítico) */}
                        <span 
                          className={`behavior-status-badge ${behaviorStatus.statusClass} text-[10px] sm:text-[10.5px] uppercase font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shadow-2xs ${behaviorStatus.badgeBg} ${behaviorStatus.badgeBorder} ${behaviorStatus.badgeText}`}
                          title={`Status de Comportamento: ${behaviorStatus.statusText.toUpperCase()} - ${behaviorStatus.description}`}
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${behaviorStatus.dotColor} ring-2 ring-white/70 dark:ring-slate-900/70`} />
                          <span>{behaviorStatus.emoji}</span>
                          <span>Status: {behaviorStatus.statusText}</span>
                          <span className="text-[9px] font-semibold opacity-75 hidden xs:inline">({behaviorInfo.label})</span>
                        </span>
                      </div>

                      {/* Quick Micro-Indicators Pill Bar & Action Buttons */}
                      <div className="flex items-center gap-2 sm:self-center flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          occ.meals.lunch === "excelente" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                          occ.meals.lunch === "parcial" ? "bg-amber-50 text-amber-800 border-amber-200" :
                          "bg-rose-50 text-rose-800 border-rose-200"
                        }`}>
                          <Utensils className="w-2.5 h-2.5" />
                          <span>Almoço: {occ.meals.lunch}</span>
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          occSleepMins < currentGradeThresholds.minSleepMinutes || (occSleepMins > 0 && occSleepMins < 30)
                            ? "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200"
                            : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                        }`}>
                          <Moon className="w-2.5 h-2.5" />
                          <span>{occ.sleep.durationStr}</span>
                        </span>

                        {occ.medicated.wasMedicated && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                            <Pill className="w-2.5 h-2.5" />
                            <span>Medicamento</span>
                          </span>
                        )}

                        {/* Critical Detail Modal Quick Trigger Button */}
                        {isCritical && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCriticalDetailModal(occ);
                            }}
                            className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer ring-1 ring-rose-400/50"
                            title="Abrir Dossiê Detalhado e Histórico de Intervenções deste Evento Crítico"
                          >
                            <FileText className="w-3 h-3 text-white" />
                            <span className="hidden xs:inline">Dossiê do</span> Alerta
                          </button>
                        )}

                        {/* Quick Action: Configure Critical Thresholds per Grade */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenThresholdConfigModal(activeGradeName);
                          }}
                          className="text-[10px] sm:text-[10.5px] font-bold px-2.5 py-1 rounded-lg border border-amber-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800 hover:bg-amber-100/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          title={`Configurar limiares de criticidade personalizados para a turma ${activeGradeName} (Sono < ${currentGradeThresholds.minSleepMinutes}min, ${currentGradeThresholds.criticalPercentageThreshold}% corte)`}
                        >
                          <SlidersHorizontal className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                          <span className="hidden sm:inline">Limiar Turma</span>
                          <span className="text-[9px] font-mono text-amber-800 dark:text-amber-300 font-bold">({currentGradeThresholds.minSleepMinutes}m)</span>
                        </button>

                        {/* Quick Notify Secretary button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSecretaryModal(occ);
                          }}
                          className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                            isCritical
                              ? "bg-rose-700 hover:bg-rose-800 text-white border-rose-800 ring-1 ring-rose-300"
                              : "bg-amber-100/80 hover:bg-amber-200 text-amber-900 border-amber-300 dark:bg-slate-800 dark:text-amber-300 dark:border-slate-700"
                          }`}
                          title="Enviar pedido de esclarecimento imediato à secretaria sobre este registro escolar"
                        >
                          <BellRing className="w-3 h-3" />
                          <span className="hidden xs:inline">Notificar</span> Secretaria
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandCard(occ.id);
                          }}
                          aria-label="Expandir ou recolher detalhes"
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-0.5 cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* CARD EXPANDED CONTENT (Adaptive 2-Column Grid Layout) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-amber-100 dark:border-slate-800 px-3.5 sm:px-4 pb-4 pt-3 space-y-3"
                        >
                          {/* Class Critical Threshold Rule Banner */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-amber-50/70 dark:bg-slate-900/70 rounded-xl border border-amber-200/60 dark:border-slate-800 text-xs">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                              <span className="text-[11px] leading-tight">
                                <strong>Regra de Criticidade ({activeGradeName}):</strong> Sono &lt; {currentGradeThresholds.minSleepMinutes}min • {currentGradeThresholds.criticalBehaviors.map(b => b === "agitado" ? "Agitado" : b === "triste" ? "Sensível" : b === "cansado" ? "Cansado" : "Ótimo").join(", ")} {currentGradeThresholds.triggerOnMealRefusal ? "• Recusa Alimentar" : ""} • Limiar Turma: {currentGradeThresholds.criticalPercentageThreshold}%
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenThresholdConfigModal(activeGradeName)}
                              className="self-start sm:self-center px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 font-bold font-serif text-[10.5px] transition-all cursor-pointer shrink-0"
                            >
                              Configurar Limiar da Turma
                            </button>
                          </div>

                          {isCritical && (
                            <div className="p-2.5 bg-rose-100/70 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-900 dark:text-rose-200">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
                                <span className="text-[11px] font-semibold">
                                  {occ.behaviorState === "agitado" && "⚠️ Comportamento 'Agitado' acionou indicador de atenção prioritária."}
                                  {occSleepMins > 0 && occSleepMins < 30 && ` ⚠️ Período de repouso muito curto (${occ.sleep.durationStr}) abaixo de 30 minutos.`}
                                  {currentGradeThresholds.criticalBehaviors.includes(occ.behaviorState) && occ.behaviorState !== "agitado" && ` Humor '${occ.behaviorState}' aciona o alerta configurado para a turma.`}
                                  {occSleepMins >= 30 && occSleepMins < currentGradeThresholds.minSleepMinutes && ` Repouso de ${occ.sleep.durationStr} está abaixo do limiar de ${currentGradeThresholds.minSleepMinutes}min.`}
                                  {currentGradeThresholds.triggerOnMealRefusal && (occ.meals.lunch === "recusou" || occ.meals.snack === "recusou") && " Recusa alimentar registrada na rotina."}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenCriticalDetailModal(occ)}
                                  className="px-2.5 py-1 bg-rose-800 hover:bg-rose-900 text-white rounded-lg font-bold font-serif text-[10.5px] shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <FileText className="w-3 h-3 text-white" />
                                  <span>Abrir Dossiê Completo</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenSecretaryModal(occ)}
                                  className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold font-serif text-[10.5px] shrink-0 cursor-pointer flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Notificar Secretaria</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Adaptive 2-column grid layout for optimal information density without text compression */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Coluna 1: Alimentação e Refeições */}
                            <div className="bg-white/90 dark:bg-slate-950 p-3 rounded-xl border border-amber-200/50 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 font-bold text-[11px] border-b border-amber-100 dark:border-slate-800 pb-1">
                                  <span className="flex items-center gap-1.5">
                                    <Utensils className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Alimentação & Nutrição</span>
                                  </span>
                                  <span className="text-[9.5px] font-mono uppercase text-slate-500">
                                    Almoço & Lanche
                                  </span>
                                </div>
                                <div className="text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex justify-between items-center bg-amber-50/50 dark:bg-slate-900/50 px-2 py-1.5 rounded-md">
                                      <span className="text-slate-500 font-medium text-[10px]">Almoço:</span>
                                      <span className="font-bold capitalize text-emerald-700 dark:text-emerald-400 text-[10.5px]">
                                        {occ.meals.lunch}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center bg-amber-50/50 dark:bg-slate-900/50 px-2 py-1.5 rounded-md">
                                      <span className="text-slate-500 font-medium text-[10px]">Lanche:</span>
                                      <span className="font-bold capitalize text-amber-700 dark:text-amber-400 text-[10.5px]">
                                        {occ.meals.snack}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-[10.5px] text-slate-600 dark:text-slate-400 pt-1 leading-relaxed italic bg-slate-50/60 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-850">
                                    "{occ.meals.details}"
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Coluna 2: Sono, Repouso & Medicamentos */}
                            <div className="bg-white/90 dark:bg-slate-950 p-3 rounded-xl border border-amber-200/50 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 font-bold text-[11px] border-b border-amber-100 dark:border-slate-800 pb-1">
                                  <span className="flex items-center gap-1.5">
                                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Sono, Repouso & Cuidados</span>
                                  </span>
                                  <span className="text-[9.5px] font-mono uppercase text-indigo-600 dark:text-indigo-400 font-bold">
                                    {occ.sleep.durationStr}
                                  </span>
                                </div>
                                <div className="text-[11px] space-y-1.5 text-slate-700 dark:text-slate-300">
                                  <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-slate-900/50 px-2 py-1.5 rounded-md">
                                    <span className="text-slate-500 font-medium text-[10px]">Tempo de Repouso:</span>
                                    <span className="font-bold text-indigo-700 dark:text-indigo-300 text-[10.5px]">
                                      {occ.sleep.durationStr}
                                    </span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed italic pt-0.5">
                                    "{occ.sleep.details}"
                                  </p>
                                  {occ.medicated.wasMedicated ? (
                                    <div className="p-2 rounded-lg bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[10.5px] text-rose-800 dark:text-rose-300 flex items-center justify-between gap-1.5">
                                      <span className="font-bold flex items-center gap-1">
                                        <Pill className="w-3 h-3 text-rose-600" />
                                        {occ.medicated.medicationName} ({occ.medicated.doseTime})
                                      </span>
                                      <span className="text-[9px] font-mono uppercase bg-rose-200/70 text-rose-900 px-1.5 py-0.2 rounded">Ministrado</span>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-slate-400 italic pt-0.5 flex items-center gap-1">
                                      <Pill className="w-3 h-3 text-slate-400" />
                                      <span>Sem prescrição de medicação hoje.</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Linha Completa (Span 2): Recados & Anotações da Educadora + Ação Rápida */}
                            <div className="sm:col-span-2 bg-[#fdfaf3]/95 dark:bg-slate-950 p-3.5 rounded-xl border border-amber-200/60 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 font-serif font-bold text-[11px]">
                                  <span>✍️ Anotação & Recados da Educadora:</span>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 italic font-normal leading-relaxed text-[11.5px]">
                                  "{occ.teacherNote}"
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenSecretaryModal(occ)}
                                className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-xl font-bold font-serif text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Ação Rápida: Notificar Secretaria</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. RESUMO NUTRICIONAL SEMANAL (WEEKLY NUTRITION SUMMARY WIDGET)           */}
      {/* ========================================================================= */}
      <WeeklyNutritionSummaryWidget
        activeStudent={activeStudent}
        occurrences={occurrences}
        selectedPeriod={selectedPeriod}
        onToast={onToast}
      />

      {/* ========================================================================= */}
      {/* 5. MURAL DE FOTOS DO DIA COLETIVAS (Classroom Photos) */}
      {/* ========================================================================= */}
      <div 
        id="classroom-photo-card-list"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingPhoto(true);
        }}
        onDragLeave={() => setIsDraggingPhoto(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingPhoto(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processUploadedImageFile(e.dataTransfer.files[0]);
          }
        }}
        className={`bg-white/95 dark:bg-slate-900 border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-all duration-200 ${
          isDraggingPhoto
            ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-2 ring-amber-500/30"
            : "border-amber-200/60 dark:border-slate-800"
        }`}
      >
        <div id="classroom-photo-card-list-header" className="flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-amber-100 dark:border-slate-800 pb-4 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-amber-800 dark:text-amber-400 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Mural de Registros Escolares
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#423326] dark:text-amber-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Fotos do Dia Coletivas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
              Registros capturados pelas professoras das atividades especiais do dia do Maternal I e turmas integradas.
            </p>
          </div>

          {/* Filtro e Ordenação por Aluno, Professor, Tags, Ordem e Upload Docente */}
          <div className="flex flex-col gap-3 lg:self-center w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
              {/* Campo de Busca por Tags / Temas */}
              <div className="flex flex-col space-y-1 flex-1 min-w-0 sm:min-w-[220px]">
                <div className="flex items-center justify-between gap-1">
                  <label htmlFor="photo-tag-search-input" className="text-[10px] font-extrabold text-amber-900 dark:text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Buscar por Tags:</span>
                  </label>
                  {photoTagSearch && (
                    <button
                      type="button"
                      onClick={() => setPhotoTagSearch("")}
                      className="text-[9px] text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer"
                    >
                      Limpar
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search className="w-3.5 h-3.5 text-amber-700/60 dark:text-amber-400/60" />
                  </div>
                  <input
                    id="photo-tag-search-input"
                    type="text"
                    value={photoTagSearch}
                    onChange={(e) => setPhotoTagSearch(e.target.value)}
                    placeholder="Filtrar por tag ou tema (ex: artes, horta, robótica)..."
                    className="w-full bg-[#faf8f2] dark:bg-slate-950 border border-amber-200/60 dark:border-slate-800 text-xs text-[#423326] dark:text-amber-100 rounded-xl pl-8 pr-7 py-2 outline-none focus:ring-2 focus:ring-amber-500/30 font-sans shadow-2xs font-medium placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  {photoTagSearch && (
                    <button
                      type="button"
                      onClick={() => setPhotoTagSearch("")}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                      title="Limpar busca por tag"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dropdown de Filtro por Aluno com Toggle Integrado */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <label htmlFor="photo-student-filter-select" className="text-[10px] font-extrabold text-amber-900 dark:text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1">
                    <span>Filtrar por Aluno:</span>
                  </label>
                  {/* Quick Toggle pill between Selected Student and All Students */}
                  <div className="inline-flex rounded-lg bg-amber-100/60 dark:bg-slate-800 p-0.5 text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPhotoStudentFilter("selected")}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        photoStudentFilter === "selected" || photoStudentFilter === activeStudent.id
                          ? "bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 shadow-xs font-black"
                          : "text-slate-500 dark:text-slate-400 hover:text-amber-800"
                      }`}
                      title={`Ver apenas fotos de ${activeStudent.name}`}
                    >
                      ⭐ {activeStudent.name.split(" ")[0]}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoStudentFilter("all")}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        photoStudentFilter === "all"
                          ? "bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 shadow-xs font-black"
                          : "text-slate-500 dark:text-slate-400 hover:text-amber-800"
                      }`}
                      title="Ver fotos de toda a turma"
                    >
                      👥 Todos
                    </button>
                  </div>
                </div>

                {/* Main Student Filter Dropdown */}
                <select
                  id="photo-student-filter-select"
                  name="photo-student-filter"
                  value={photoStudentFilter}
                  onChange={(e) => setPhotoStudentFilter(e.target.value)}
                  className="bg-[#faf8f2] dark:bg-slate-950 border border-amber-200/60 dark:border-slate-800 text-xs text-[#423326] dark:text-amber-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/30 font-sans cursor-pointer w-full sm:w-auto sm:min-w-[200px] max-w-full shadow-2xs font-medium"
                >
                  <option value="selected">
                    ⭐ Somente fotos de {activeStudent.name} (Aluno Selecionado)
                  </option>
                  <option value="all">
                    👥 Todas as Fotos da Turma (Todos os Alunos)
                  </option>
                  {estudantes && estudantes.length > 0 && (
                    <optgroup label="Outros Alunos Cadastrados">
                      {estudantes
                        .filter((st) => st.id !== activeStudent.id)
                        .map((st) => (
                          <option key={st.id} value={st.id}>
                            👤 {st.name}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Dropdown de Filtro de Professor */}
              <div className="flex flex-col space-y-1">
                <label htmlFor="photo-teacher-filter-select" className="text-[10px] font-extrabold text-amber-900 dark:text-amber-400 font-mono uppercase tracking-wider">
                  Filtrar por Professor:
                </label>
                <select
                  id="photo-teacher-filter-select"
                  value={photoTeacherFilter}
                  onChange={(e) => setPhotoTeacherFilter(e.target.value)}
                  className="bg-[#faf8f2] dark:bg-slate-950 border border-amber-200/60 dark:border-slate-800 text-xs text-[#423326] dark:text-amber-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/30 font-sans cursor-pointer w-full sm:w-auto sm:min-w-[160px] max-w-full shadow-2xs font-medium"
                >
                  <option value="todos">👤 Todos os Professores</option>
                  {Array.from(new Set(classroomPhotos.map((p) => p.teacherName)))
                    .filter(Boolean)
                    .map((teacher) => (
                      <option key={teacher} value={teacher}>
                        🎓 {teacher}
                      </option>
                    ))}
                </select>
              </div>

              {/* Dropdown de Ordenação */}
              <div className="flex flex-col space-y-1">
                <label htmlFor="photo-sort-order-select" className="text-[10px] font-extrabold text-amber-900 dark:text-amber-400 font-mono uppercase tracking-wider">
                  Ordenar por:
                </label>
                <select
                  id="photo-sort-order-select"
                  value={photoSortOrder}
                  onChange={(e) => setPhotoSortOrder(e.target.value as any)}
                  className="bg-[#faf8f2] dark:bg-slate-950 border border-amber-200/60 dark:border-slate-800 text-xs text-[#423326] dark:text-amber-100 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/30 font-sans cursor-pointer w-full sm:w-auto sm:min-w-[140px] max-w-full shadow-2xs font-medium"
                >
                  <option value="recent">📅 Mais Recentes</option>
                  <option value="name_asc">🔤 Professor (A-Z)</option>
                  <option value="name_desc">🔤 Professor (Z-A)</option>
                </select>
              </div>

              {/* Botão de Upload de Foto para Docentes */}
              <div className="flex flex-col space-y-1 justify-end sm:self-end">
                <span className="text-[10px] font-extrabold text-amber-900 dark:text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1">
                  Ação Docente:
                </span>
                <button
                  type="button"
                  id="teacher-upload-photo-btn"
                  onClick={() => teacherPhotoFileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap h-[38px] border border-amber-900/20"
                  title="Abrir seletor de arquivos para enviar nova foto para a galeria"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-200" />
                  <span>Enviar Foto</span>
                </button>
                <input
                  ref={teacherPhotoFileInputRef}
                  type="file"
                  id="teacher-photo-file-input"
                  name="teacherPhotoFile"
                  accept="image/*"
                  onChange={handleTeacherPhotoFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Barra de Sugestões de Tags / Temas Rápidos */}
            {availablePhotoTags.length > 0 && (
              <div id="classroom-photo-tag-pills" className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-amber-100/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1 mr-1">
                  <Tag className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                  Tags disponíveis:
                </span>
                {availablePhotoTags.slice(0, 10).map((tag) => {
                  const isSelected = photoTagSearch.toLowerCase().trim().replace(/^#/, "") === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setPhotoTagSearch(isSelected ? "" : tag)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-amber-800 text-white font-bold shadow-2xs scale-102"
                          : "bg-amber-100/60 hover:bg-amber-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-300"
                      }`}
                      title={`Filtrar por #${tag}`}
                    >
                      <span>#{tag}</span>
                      {isSelected && <X className="w-2.5 h-2.5" />}
                    </button>
                  );
                })}
                {photoTagSearch && (
                  <button
                    type="button"
                    onClick={() => setPhotoTagSearch("")}
                    className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-bold ml-1 cursor-pointer"
                  >
                    Limpar tag
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {(() => {
          const currentFilteredStudent = photoStudentFilter === "selected" 
            ? activeStudent 
            : (estudantes?.find(e => e.id === photoStudentFilter) || (photoStudentFilter !== "all" ? activeStudent : null));

          const filteredAndSorted = classroomPhotos
            .filter((photo) => {
              if (photoTeacherFilter !== "todos" && photo.teacherName !== photoTeacherFilter) {
                return false;
              }

              if (photoStudentFilter !== "all" && currentFilteredStudent) {
                const targetId = currentFilteredStudent.id;
                const targetName = currentFilteredStudent.name?.toLowerCase().trim();

                const isTagged = Boolean(photo.taggedStudentIds && photo.taggedStudentIds.includes(targetId));
                const mentionsInTitle = Boolean(targetName && photo.title.toLowerCase().includes(targetName));
                const matchesDirectStudentId = Boolean((photo as any).studentId && (photo as any).studentId === targetId);

                if (!isTagged && !mentionsInTitle && !matchesDirectStudentId) {
                  return false;
                }
              }

              // Filtro por Tags ou Temas Específicos
              if (photoTagSearch.trim()) {
                const cleanTagQuery = photoTagSearch.toLowerCase().trim().replace(/^#/, "");
                const matchesTags = Boolean(photo.tags && photo.tags.some(t => t.toLowerCase().includes(cleanTagQuery)));
                const matchesBadge = Boolean(photo.badge && photo.badge.toLowerCase().includes(cleanTagQuery));
                const matchesTitle = Boolean(photo.title && photo.title.toLowerCase().includes(cleanTagQuery));

                if (!matchesTags && !matchesBadge && !matchesTitle) {
                  return false;
                }
              }

              return true;
            })
            .sort((a, b) => {
              if (photoSortOrder === "name_asc") {
                return a.teacherName.localeCompare(b.teacherName, "pt-BR");
              }
              if (photoSortOrder === "name_desc") {
                return b.teacherName.localeCompare(a.teacherName, "pt-BR");
              }
              return (b.timestamp || 0) - (a.timestamp || 0);
            });

          return (
            <div className="space-y-4">
              <div 
                id="photo-filtering-container" 
                className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-[#faf8f2] dark:bg-slate-950/50 px-4 py-2 rounded-xl border border-amber-100/50 dark:border-slate-800 overflow-hidden flex-wrap gap-2"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                  <span>Professor: {photoTeacherFilter === "todos" ? "Todos" : photoTeacherFilter}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>
                    Aluno:{" "}
                    {photoStudentFilter === "all" ? (
                      <span className="font-normal text-slate-500 dark:text-slate-400">Todos da Turma</span>
                    ) : (
                      <span className="text-amber-800 dark:text-amber-300 font-extrabold">
                        {currentFilteredStudent?.name || activeStudent.name}
                      </span>
                    )}
                  </span>
                  {photoStudentFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() => setPhotoStudentFilter("all")}
                      className="text-[10px] text-amber-700 hover:text-amber-900 dark:text-amber-400 underline cursor-pointer ml-1"
                    >
                      (Ver todos)
                    </button>
                  )}

                  {/* Tag ativa com botão de remoção */}
                  {photoTagSearch.trim() && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="inline-flex items-center gap-1 text-amber-900 dark:text-amber-200 bg-amber-200/50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md font-extrabold text-[10.5px]">
                        <Tag className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                        <span>Tag: #{photoTagSearch.trim().replace(/^#/, "")}</span>
                        <button
                          type="button"
                          onClick={() => setPhotoTagSearch("")}
                          className="ml-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 cursor-pointer"
                          title="Remover filtro de tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    </>
                  )}
                </div>
                <motion.div
                  key={`${photoTeacherFilter}-${photoStudentFilter}-${photoTagSearch}-${photoSortOrder}-${filteredAndSorted.length}`}
                  initial={{ opacity: 0, scale: 0.92, y: 1 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="text-[#423326] dark:text-amber-200 font-bold"
                >
                  Exibindo <span className="text-amber-800 dark:text-amber-400 font-extrabold font-mono text-xs">{filteredAndSorted.length}</span> {filteredAndSorted.length === 1 ? "foto" : "fotos"}
                </motion.div>
              </div>

              {classroomPhotos.length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic text-xs">
                  Nenhuma foto cadastrada pela coordenação hoje ainda.
                </div>
              ) : filteredAndSorted.length === 0 ? (
                <div className="text-center py-12 bg-[#fafaf7] dark:bg-slate-900/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 italic text-xs space-y-2">
                  <Camera className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto opacity-70" />
                  <div>
                    {photoTagSearch.trim() ? (
                      <span>Nenhuma foto encontrada para a tag ou tema <strong className="text-amber-800 dark:text-amber-300 font-bold">"{photoTagSearch}"</strong>.</span>
                    ) : photoStudentFilter !== "all" ? (
                      `Nenhuma foto encontrada com presença de ${currentFilteredStudent?.name || activeStudent.name}.`
                    ) : (
                      "Nenhuma foto encontrada para os filtros selecionados."
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {photoTagSearch.trim() && (
                      <button
                        type="button"
                        onClick={() => setPhotoTagSearch("")}
                        className="text-xs font-sans font-bold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Limpar busca de tags</span>
                      </button>
                    )}
                    {photoStudentFilter !== "all" && (
                      <button
                        type="button"
                        onClick={() => setPhotoStudentFilter("all")}
                        className="text-xs font-sans font-bold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
                      >
                        Exibir fotos de toda a turma
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div id="classroom-photo-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  <AnimatePresence mode="popLayout">
                    {filteredAndSorted.map((photo) => (
                      <ClassroomPhotoCard
                        key={photo.id}
                        photo={photo}
                        userRole={userRole}
                        activeStudentId={currentFilteredStudent?.id || activeStudent.id}
                        activeStudentName={currentFilteredStudent?.name || activeStudent.name}
                        onClick={() => setSelectedClassroomPhoto(photo)}
                        onDelete={(p) => setPhotoToDelete(p)}
                        onReport={onReportPhoto}
                        onTagClick={(tag) => setPhotoTagSearch(tag)}
                        onEditCaption={(photoId, newTitle) => {
                          const updated = classroomPhotos.map(p => p.id === photoId ? { ...p, title: newTitle } : p);
                          setClassroomPhotos(updated);
                          localStorage.setItem("school_classroom_photos", JSON.stringify(updated));
                        }}
                        onLike={(photoId) => {
                          const updated = classroomPhotos.map(p => {
                            if (p.id === photoId) {
                              const liked = !p.likedByCurrentUser;
                              return {
                                ...p,
                                likedByCurrentUser: liked,
                                likes: (p.likes || 0) + (liked ? 1 : -1)
                              };
                            }
                            return p;
                          });
                          setClassroomPhotos(updated);
                          localStorage.setItem("school_classroom_photos", JSON.stringify(updated));
                        }}
                        onToast={onToast}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ========================================================================= */}
      {/* 5. SCHOOL ADMIN CHART ANNOTATION MODAL (CREATE EVENT)                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAnnotationModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-[#fcfaf4] dark:bg-slate-950/80 border-b border-amber-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-serif text-[#423326] dark:text-amber-100 flex items-center gap-1.5">
                      <span>Adicionar Anotação no Gráfico</span>
                      <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        Admin / Pedagógico
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Destaque eventos que justificam oscilações nas métricas de {activeStudent.name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAnnotationModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAddAnnotation} className="p-6 space-y-4 overflow-y-auto">
                {/* Event Category Quick Presets */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-serif">
                    Tipo de Evento Escolar:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {(Object.keys(ROUTINE_ANNOTATION_CATEGORIES) as Array<keyof typeof ROUTINE_ANNOTATION_CATEGORIES>).map((catKey) => {
                      const cat = ROUTINE_ANNOTATION_CATEGORIES[catKey];
                      const isSelected = newAnnotationCategory === catKey;
                      return (
                        <button
                          key={catKey}
                          type="button"
                          onClick={() => handleSelectPresetCategory(catKey)}
                          className={`p-2 rounded-xl border text-left transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                            isSelected
                              ? `${cat.bg} ${cat.border} ring-2 ring-amber-400 shadow-xs`
                              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-amber-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{cat.emoji}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                          </div>
                          <span className={`font-bold text-[11px] truncate ${isSelected ? cat.text : "text-slate-700 dark:text-slate-300"}`}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Day Selection & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-serif">
                      Dia da Semana:
                    </label>
                    <select
                      value={newAnnotationDay}
                      onChange={(e) => setNewAnnotationDay(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                    >
                      {weeklyChartData.map(d => (
                        <option key={d.short} value={d.short}>
                          {d.short} ({d.fullDate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-serif">
                      Título do Evento no Gráfico:
                    </label>
                    <input
                      type="text"
                      required
                      value={newAnnotationTitle}
                      onChange={(e) => setNewAnnotationTitle(e.target.value)}
                      placeholder="Ex: Mudança de Medicação, Semana de Avaliações"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>

                {/* Description Context */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 font-serif">
                    Contexto Pedagógico / Ocorrência Detalhada:
                  </label>
                  <textarea
                    rows={2}
                    value={newAnnotationDescription}
                    onChange={(e) => setNewAnnotationDescription(e.target.value)}
                    placeholder="Descreva o que ocorreu neste dia (orientação médica, adaptação de rotina, teste pedagógico...)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 leading-relaxed"
                  />
                </div>

                {/* Metric Impact Correlation */}
                <div className="space-y-1.5 bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <label className="block text-xs font-bold text-amber-900 dark:text-amber-300 font-serif flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Correlação com as Métricas do Gráfico:</span>
                  </label>
                  <input
                    type="text"
                    value={newAnnotationImpact}
                    onChange={(e) => setNewAnnotationImpact(e.target.value)}
                    placeholder="Ex: Justifica queda no humor e redução do tempo de soneca matutina."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300/80 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>

                {/* Author Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Responsável pelo Registro:
                    </label>
                    <input
                      type="text"
                      value={newAnnotationAuthor}
                      onChange={(e) => setNewAnnotationAuthor(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Função:
                    </label>
                    <select
                      value={newAnnotationAuthorRole}
                      onChange={(e) => setNewAnnotationAuthorRole(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                    >
                      <option value="Coordenação Pedagógica">Coordenação Pedagógica</option>
                      <option value="Professora Regente">Professora Regente</option>
                      <option value="Psicopedagoga Escolar">Psicopedagoga Escolar</option>
                      <option value="Terapeuta Ocupacional">Terapeuta Ocupacional</option>
                      <option value="Equipe de Enfermagem">Equipe de Enfermagem</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-amber-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAnnotationModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white rounded-xl text-xs font-bold font-serif shadow-xs transition-all cursor-pointer flex items-center gap-1.5 hover:shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Salvar Anotação no Gráfico</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. ANNOTATION DETAIL & CORRELATION MODAL                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedAnnotationForView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col"
            >
              {(() => {
                const cat = ROUTINE_ANNOTATION_CATEGORIES[selectedAnnotationForView.category] || ROUTINE_ANNOTATION_CATEGORIES.custom;
                return (
                  <>
                    <div className={`p-4 border-b flex items-center justify-between ${cat.bg} ${cat.border}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.emoji}</span>
                        <div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider ${cat.text}`}>
                            {cat.label}
                          </div>
                          <h4 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
                            {selectedAnnotationForView.eventTitle}
                          </h4>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedAnnotationForView(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 space-y-3.5 text-xs">
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Dia da Semana</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100 font-serif">
                            {selectedAnnotationForView.dayKey} ({selectedAnnotationForView.dateLabel})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Registrado Em</span>
                          <span className="font-mono text-slate-600 dark:text-slate-300">
                            {selectedAnnotationForView.createdAt}
                          </span>
                        </div>
                      </div>

                      {selectedAnnotationForView.description && (
                        <div className="space-y-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300 font-serif block">
                            Descrição do Evento:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
                            {selectedAnnotationForView.description}
                          </p>
                        </div>
                      )}

                      {selectedAnnotationForView.impactObserved && (
                        <div className="space-y-1 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50">
                          <span className="font-bold text-amber-900 dark:text-amber-300 font-serif flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                            <span>Correlação Observada com as Métricas:</span>
                          </span>
                          <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium">
                            {selectedAnnotationForView.impactObserved}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Registrado por: <strong>{selectedAnnotationForView.authorName}</strong> ({selectedAnnotationForView.authorRole})</span>
                      </div>

                      {/* Modal Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleDeleteAnnotation(selectedAnnotationForView.id)}
                          className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Excluir Anotação</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedAnnotationForView(null)}
                          className="px-4 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold transition-all cursor-pointer text-xs"
                        >
                          Fechar
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 7. QUICK ACTION: NOTIFICAR SECRETARIA MODAL                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isNotifySecretaryModalOpen && selectedOccurrenceForSecretary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="modal-content bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 bg-gradient-to-r from-amber-800 to-amber-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/10 text-white">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-amber-200 block font-bold">
                      Canal Direto Pais ⇄ Escola
                    </span>
                    <h3 className="text-base font-bold font-serif">
                      Ação Rápida: Notificar Secretaria
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifySecretaryModalOpen(false)}
                  className="p-1 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSendSecretaryNotification} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
                {/* Occurrence Context Card */}
                <div className="p-3 bg-amber-50/80 dark:bg-slate-800/80 rounded-xl border border-amber-200/80 dark:border-slate-700 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 dark:text-amber-300 font-serif">
                      Referência do Diário: {selectedOccurrenceForSecretary.date}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-slate-700 text-amber-900 dark:text-amber-200 font-bold">
                      Aluno: {activeStudent.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-amber-200/50 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 block">Humor</span>
                      <span className="font-bold capitalize">{selectedOccurrenceForSecretary.behaviorState}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-amber-200/50 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 block">Almoço</span>
                      <span className="font-bold capitalize">{selectedOccurrenceForSecretary.meals.lunch}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-amber-200/50 dark:border-slate-800">
                      <span className="text-[9px] text-slate-400 block">Soneca</span>
                      <span className="font-bold">{selectedOccurrenceForSecretary.sleep.durationStr}</span>
                    </div>
                  </div>
                </div>

                {/* Topic Selector */}
                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-200 font-serif block">
                    Motivo da Solicitação:
                  </label>
                  <select
                    value={secretarySubject}
                    onChange={(e) => setSecretarySubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                  >
                    <option value="Comportamento & Agitação">⚡ Comportamento & Agitação no Dia</option>
                    <option value="Qualidade do Sono & Repouso">💤 Qualidade do Sono / Pouco Repouso</option>
                    <option value="Alimentação & Aceitação">🍽️ Aceitação Alimentar & Recusa</option>
                    <option value="Administração de Medicamento">💊 Dúvida sobre Administração de Remédio</option>
                    <option value="Rotina Escolar">📌 Outro Esclarecimento sobre a Rotina</option>
                  </select>
                </div>

                {/* Message Field */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-200 font-serif block">
                      Mensagem para a Secretaria / Coordenação:
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {secretaryMessageText.length} caracteres
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={secretaryMessageText}
                    onChange={(e) => setSecretaryMessageText(e.target.value)}
                    placeholder="Descreva sua dúvida ou solicitação com a equipe escolar..."
                    className="w-full p-3 rounded-xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-normal outline-none focus:ring-2 focus:ring-amber-500 text-xs leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                    A coordenação e a professora responsável receberão notificação imediata no painel administrativo escolar.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsNotifySecretaryModalOpen(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={secretaryIsSending || !secretaryMessageText.trim()}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-xl font-bold font-serif flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    {secretaryIsSending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Solicitação à Secretaria</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 8. QUICK ACTION: PAINEL DE CONFIGURAÇÃO DE LIMIARES DE CRITICIDADE         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isThresholdConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="modal-content bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 bg-[#423326] dark:bg-slate-950 text-white flex items-center justify-between border-b border-amber-900/40">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-amber-300 block font-bold">
                      Configuração Pedagógica por Turma
                    </span>
                    <h3 className="text-base font-bold font-serif">
                      Limiares de Ocorrência Crítica
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsThresholdConfigModalOpen(false)}
                  className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveThresholds} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
                {/* Turma Target Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 font-serif flex items-center justify-between">
                    <span>Turma de Aplicação:</span>
                    <span className="text-[10.5px] font-mono text-amber-700 dark:text-amber-400 font-normal">
                      Aluno: {activeStudent.name}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {["1º Ano A", "Educação Infantil", "2º Ano A", "Padrão Geral da Escola"].map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => {
                          setConfigTargetGrade(grade);
                          const existing = gradeThresholdsMap[grade] || gradeThresholdsMap["default"] || DEFAULT_THRESHOLDS_BY_GRADE.default;
                          setEditingThresholds({
                            ...existing,
                            gradeName: grade
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          configTargetGrade === grade
                            ? "bg-amber-700 text-white border-amber-800 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-amber-50"
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Presets Bar */}
                <div className="p-3 bg-amber-50/70 dark:bg-slate-800/60 rounded-xl border border-amber-200/70 dark:border-slate-700 space-y-2">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 font-mono block">
                    ⚡ Presets Recomendados:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset("infantil")}
                      className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        editingThresholds.sensitivityPreset === "infantil"
                          ? "bg-amber-200/90 dark:bg-amber-950/80 border-amber-400 dark:border-amber-600 font-bold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-300"
                      }`}
                    >
                      <span className="block text-[11px] font-bold">🧸 Infantil</span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block">&lt;45m / Agitado+Triste</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset("fundamental")}
                      className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        editingThresholds.sensitivityPreset === "fundamental"
                          ? "bg-amber-200/90 dark:bg-amber-950/80 border-amber-400 dark:border-amber-600 font-bold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-300"
                      }`}
                    >
                      <span className="block text-[11px] font-bold">📚 Fundamental</span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block">&lt;25m / Agitado</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset("alta_sensibilidade")}
                      className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        editingThresholds.sensitivityPreset === "alta_sensibilidade"
                          ? "bg-amber-200/90 dark:bg-amber-950/80 border-amber-400 dark:border-amber-600 font-bold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-300"
                      }`}
                    >
                      <span className="block text-[11px] font-bold">⚡ Alta Sensib.</span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block">&lt;40m / Agit+Trist+Rec</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset("tolerante")}
                      className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                        editingThresholds.sensitivityPreset === "tolerante"
                          ? "bg-amber-200/90 dark:bg-amber-950/80 border-amber-400 dark:border-amber-600 font-bold"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-300"
                      }`}
                    >
                      <span className="block text-[11px] font-bold">🛡️ Tolerante</span>
                      <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block">&lt;15m / Agitado</span>
                    </button>
                  </div>
                </div>

                {/* Control 1: Min Sleep Duration Slider */}
                <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-serif">
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Limiar Mínimo de Sono Escolar:</span>
                    </span>
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {editingThresholds.minSleepMinutes} minutos
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={editingThresholds.minSleepMinutes}
                    onChange={(e) => setEditingThresholds(prev => ({ ...prev, minSleepMinutes: parseInt(e.target.value, 10), sensitivityPreset: "custom" }))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0m (desativado)</span>
                    <span>20m</span>
                    <span>30m (padrão)</span>
                    <span>45m</span>
                    <span>60m+</span>
                  </div>

                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 italic">
                    Sonecas com duração estritamente menor que <strong>{editingThresholds.minSleepMinutes} minutos</strong> acionarão o indicador de 'Ocorrência Crítica' nos registros da turma {configTargetGrade}.
                  </p>
                </div>

                {/* Control 2: Critical Behaviors Checklist */}
                <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-serif">
                    <Activity className="w-3.5 h-3.5 text-rose-600" />
                    <span>Estados de Comportamento Crítico:</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: "agitado", label: "⚡ Agitado / Muito Ativo", defaultOn: true },
                      { key: "triste", label: "🧸 Sensível / Dengoso (Triste)", defaultOn: false },
                      { key: "cansado", label: "💤 Cansadinho / Sonolência Alta", defaultOn: false },
                      { key: "otimo", label: "🌟 Radiante / Cooperativo", defaultOn: false }
                    ].map((item) => {
                      const isChecked = editingThresholds.criticalBehaviors.includes(item.key as any);
                      return (
                        <label
                          key={item.key}
                          className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                            isChecked
                              ? "bg-rose-50/70 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 font-bold"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setEditingThresholds(prev => {
                                const current = prev.criticalBehaviors || [];
                                const updated = checked
                                  ? [...current, item.key as any]
                                  : current.filter(k => k !== item.key);
                                return {
                                  ...prev,
                                  criticalBehaviors: updated,
                                  sensitivityPreset: "custom"
                                };
                              });
                            }}
                            className="rounded text-rose-600 focus:ring-rose-500"
                          />
                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Control 3: Additional Meal & Medication Triggers */}
                <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-serif">
                    <Utensils className="w-3.5 h-3.5 text-amber-600" />
                    <span>Gatilhos Adicionais de Alimentação e Saúde:</span>
                  </span>

                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/40 dark:bg-slate-900 border border-amber-200/50 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingThresholds.triggerOnMealRefusal}
                        onChange={(e) => setEditingThresholds(prev => ({ ...prev, triggerOnMealRefusal: e.target.checked, sensitivityPreset: "custom" }))}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        Disparar criticidade quando houver <strong>Recusa de Almoço ou Lanche</strong> escolar
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-rose-50/40 dark:bg-slate-900 border border-rose-200/50 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingThresholds.triggerOnMedicationMissed}
                        onChange={(e) => setEditingThresholds(prev => ({ ...prev, triggerOnMedicationMissed: e.target.checked, sensitivityPreset: "custom" }))}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        Sinalizar dias com <strong>Ministração de Medicamento sob prescrição</strong>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Control 4: Class Critical Rate Percentage Alert */}
                <div className="p-3.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-serif flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Limiar Percentual de Alerta da Turma:</span>
                    </span>
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {editingThresholds.criticalPercentageThreshold}% de corte
                    </span>
                  </div>

                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={5}
                    value={editingThresholds.criticalPercentageThreshold}
                    onChange={(e) => setEditingThresholds(prev => ({ ...prev, criticalPercentageThreshold: parseInt(e.target.value, 10), sensitivityPreset: "custom" }))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-700"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>10% (Alta vigilância)</span>
                    <span>25% (Padrão)</span>
                    <span>60% (Flexível)</span>
                  </div>

                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 italic">
                    Alerta gerencial acionado quando a incidência semanal de ocorrências atípicas na turma ultrapassar <strong>{editingThresholds.criticalPercentageThreshold}%</strong> dos dias letivos.
                  </p>
                </div>

                {/* Control 5: Critical Pulse, Inset Shadow & Glow Calibration */}
                <OccurrenceGlowConfigPanel
                  initialConfig={{
                    pulseSpeedMode: editingThresholds.pulseSpeedMode || "medio",
                    pulseSpeedSeconds: editingThresholds.pulseSpeedSeconds || 2.5,
                  }}
                  onChange={(cfg) => {
                    setEditingThresholds(prev => ({
                      ...prev,
                      pulseSpeedMode: cfg.pulseSpeedMode,
                      pulseSpeedSeconds: cfg.pulseSpeedSeconds,
                      sensitivityPreset: "custom"
                    }));
                  }}
                  showCardPreview={true}
                />

                {/* Live Simulation Banner */}
                {(() => {
                  const simulatedCriticalCount = filteredOccurrences.filter(occ => isCriticalOccurrence(occ, editingThresholds)).length;
                  const simulatedCriticalPercent = filteredOccurrences.length > 0
                    ? Math.round((simulatedCriticalCount / filteredOccurrences.length) * 100)
                    : 0;
                  const isAboveThreshold = simulatedCriticalPercent > editingThresholds.criticalPercentageThreshold;

                  return (
                    <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      isAboveThreshold
                        ? "bg-rose-50/80 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                        : "bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                    }`}>
                      <div className="space-y-0.5">
                        <span className="font-bold flex items-center gap-1.5">
                          {isAboveThreshold ? <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          <span>Simulação em Tempo Real no Aluno:</span>
                        </span>
                        <p className="text-[11px] font-normal leading-relaxed">
                          <strong>{simulatedCriticalCount} de {filteredOccurrences.length} ocorrências</strong> ({simulatedCriticalPercent}%) atendem às regras atuais. Limiar configurado: <strong>{editingThresholds.criticalPercentageThreshold}%</strong>.
                        </p>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md shrink-0 ${
                        isAboveThreshold ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                      }`}>
                        {isAboveThreshold ? "Alerta Ativo" : "Dentro do Limiar"}
                      </span>
                    </div>
                  );
                })()}

                {/* Apply to all grades toggle */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyToAllGrades}
                      onChange={(e) => setApplyToAllGrades(e.target.checked)}
                      className="rounded text-amber-700 focus:ring-amber-500"
                    />
                    <span>Replicar esta mesma parametrização para todas as turmas da escola</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleResetThresholdsToDefault}
                    className="px-3 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-all cursor-pointer text-xs"
                  >
                    Restaurar Padrão
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsThresholdConfigModalOpen(false)}
                      className="px-3.5 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold font-serif flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar Limiares da Turma</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 9. DEDICATED MODAL: CALIBRAÇÃO DE BRILHO E BORDA INTERNA (IS-CRITICAL)    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isGlowConfigModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="modal-content bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-slate-800 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 bg-rose-950 text-white flex items-center justify-between border-b border-rose-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <Sun className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-rose-300 block font-bold">
                      Calibração Visual de Alta Luminosidade
                    </span>
                    <h3 className="text-base font-bold font-serif">
                      Brilho & Borda Interna dos Itens Críticos
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGlowConfigModalOpen(false)}
                  className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
                <OccurrenceGlowConfigPanel
                  showCardPreview={true}
                />

                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dica Pedagógica de Acessibilidade:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                    Em ambientes externos ou salas com iluminação solar direta, utilize o modo <strong>Solar ☀️</strong> para ativar a borda interna reforçada (inset box-shadow) e garantir contraste WCAG AA imediato.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsGlowConfigModalOpen(false);
                      onToast?.("Configurações de brilho e borda interna aplicadas com sucesso!", "success");
                    }}
                    className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold font-serif text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Concluir Calibração</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 9B. MODAL DE UPLOAD DE FOTOS PARA PROFESSORES (Gallery Photo Upload)       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isTeacherPhotoUploadModalOpen && teacherPhotoPreview && (
          <div 
            id="teacher-photo-upload-modal-backdrop"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
            onClick={() => setIsTeacherPhotoUploadModalOpen(false)}
          >
            <motion.div
              id="teacher-photo-upload-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="teacher-photo-upload-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/80 dark:border-slate-800 max-w-lg w-full overflow-hidden shadow-2xl space-y-0 my-auto text-left"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 dark:border-slate-800 bg-[#faf8f2] dark:bg-slate-950">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                    Área do Professor & Coordenação
                  </span>
                  <h3 id="teacher-photo-upload-modal-title" className="text-base font-serif font-bold text-[#423326] dark:text-amber-100">
                    Publicar Nova Foto no Mural
                  </h3>
                </div>
                <button
                  type="button"
                  id="close-teacher-photo-modal-btn"
                  onClick={() => setIsTeacherPhotoUploadModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Fechar modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleConfirmTeacherPhotoUpload} className="p-5 space-y-4">
                {/* Photo Preview Container */}
                <div className="relative rounded-xl overflow-hidden border border-amber-200/60 dark:border-slate-800 bg-slate-900 flex items-center justify-center max-h-56 group">
                  <img
                    src={teacherPhotoPreview}
                    alt="Pré-visualização do upload"
                    className="w-full h-full max-h-56 object-contain"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-xs text-amber-200 border border-amber-500/30">
                      {teacherPhotoTag}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => teacherPhotoFileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/85 text-white text-[11px] font-medium backdrop-blur-xs flex items-center gap-1 border border-white/20 transition-all cursor-pointer"
                  >
                    <Upload className="w-3 h-3 text-amber-300" />
                    Trocar Imagem
                  </button>
                </div>

                {/* Legenda / Título */}
                <div className="space-y-1">
                  <label htmlFor="teacher-photo-title-input" className="text-xs font-bold text-[#423326] dark:text-amber-200 flex items-center justify-between">
                    <span>Legenda ou Descrição da Atividade:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Obrigatório</span>
                  </label>
                  <input
                    id="teacher-photo-title-input"
                    type="text"
                    required
                    value={teacherPhotoTitle}
                    onChange={(e) => setTeacherPhotoTitle(e.target.value)}
                    placeholder="Ex: Pintura com guache e exploração sensorial no ateliê"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-amber-200/80 dark:border-slate-800 bg-[#faf8f2] dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                {/* Categoria / Badge e Turma */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="teacher-photo-tag-select" className="text-xs font-bold text-[#423326] dark:text-amber-200">
                      Categoria / Atividade:
                    </label>
                    <select
                      id="teacher-photo-tag-select"
                      value={teacherPhotoTag}
                      onChange={(e) => setTeacherPhotoTag(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200/80 dark:border-slate-800 bg-[#faf8f2] dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                    >
                      <option value="Artes 🎨">Artes 🎨</option>
                      <option value="Recreação ⚽">Recreação ⚽</option>
                      <option value="Musicalização 🎵">Musicalização 🎵</option>
                      <option value="Roda de Histórias 📖">Roda de Histórias 📖</option>
                      <option value="Parque & Natureza 🌿">Parque & Natureza 🌿</option>
                      <option value="Alimentação & Lanche 🍎">Alimentação & Lanche 🍎</option>
                      <option value="Psicomotricidade 🤸">Psicomotricidade 🤸</option>
                      <option value="Pedagógico 📚">Pedagógico 📚</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="teacher-photo-grade-input" className="text-xs font-bold text-[#423326] dark:text-amber-200">
                      Turma:
                    </label>
                    <input
                      id="teacher-photo-grade-input"
                      type="text"
                      value={teacherPhotoGrade}
                      onChange={(e) => setTeacherPhotoGrade(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200/80 dark:border-slate-800 bg-[#faf8f2] dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                {/* Docente Responsável */}
                <div className="space-y-1">
                  <label htmlFor="teacher-photo-teacher-input" className="text-xs font-bold text-[#423326] dark:text-amber-200">
                    Docente Responsável:
                  </label>
                  <input
                    id="teacher-photo-teacher-input"
                    type="text"
                    value={teacherPhotoTeacherName}
                    onChange={(e) => setTeacherPhotoTeacherName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200/80 dark:border-slate-800 bg-[#faf8f2] dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                {/* Tags Personalizadas / Palavras-chave */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="teacher-photo-tags-input" className="text-xs font-bold text-[#423326] dark:text-amber-200 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Tags Temáticas (Separadas por vírgula):</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">Opcional</span>
                  </div>
                  <input
                    id="teacher-photo-tags-input"
                    type="text"
                    value={teacherPhotoCustomTags}
                    onChange={(e) => setTeacherPhotoCustomTags(e.target.value)}
                    placeholder="Ex: artes, pintura, sensorial, motricidade"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200/80 dark:border-slate-800 bg-[#faf8f2] dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <p className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-tight">
                    Permite que pais e professores encontrem facilmente as fotos buscando por estes temas.
                  </p>
                </div>

                {/* Marcação de Alunos na Foto */}
                <div className="space-y-2 pt-1 border-t border-amber-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#423326] dark:text-amber-200">
                      Marcar Alunos Presentes:
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (estudantes && estudantes.length > 0) {
                          if (teacherPhotoTaggedIds.length === estudantes.length) {
                            setTeacherPhotoTaggedIds([activeStudent.id]);
                          } else {
                            setTeacherPhotoTaggedIds(estudantes.map(e => e.id));
                          }
                        }
                      }}
                      className="text-[10px] text-amber-800 dark:text-amber-300 font-bold hover:underline cursor-pointer"
                    >
                      {estudantes && teacherPhotoTaggedIds.length === estudantes.length ? "Apenas Aluno Selecionado" : "Marcar Toda a Turma"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-[#faf8f2] dark:bg-slate-950/60 rounded-xl border border-amber-100 dark:border-slate-800">
                    {/* Active student first */}
                    <button
                      type="button"
                      onClick={() => {
                        if (teacherPhotoTaggedIds.includes(activeStudent.id)) {
                          setTeacherPhotoTaggedIds(prev => prev.filter(id => id !== activeStudent.id));
                        } else {
                          setTeacherPhotoTaggedIds(prev => [...prev, activeStudent.id]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                        teacherPhotoTaggedIds.includes(activeStudent.id)
                          ? "bg-amber-800 text-white font-bold shadow-2xs"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <span>⭐ {activeStudent.name}</span>
                    </button>
                    {/* Other students */}
                    {estudantes
                      ?.filter(st => st.id !== activeStudent.id)
                      .map(st => {
                        const isSelected = teacherPhotoTaggedIds.includes(st.id);
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setTeacherPhotoTaggedIds(prev => prev.filter(id => id !== st.id));
                              } else {
                                setTeacherPhotoTaggedIds(prev => [...prev, st.id]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? "bg-amber-800 text-white font-bold shadow-2xs"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <span>👤 {st.name}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-3 border-t border-amber-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTeacherPhotoUploadModalOpen(false);
                      setTeacherPhotoPreview(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="teacher-confirm-upload-btn"
                    className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Publicar no Mural</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 10. CRITICAL OCCURRENCE DETAIL MODAL & HISTORICAL DOSSIER                 */}
      {/* ========================================================================= */}
      <CriticalOccurrenceDetailModal
        isOpen={isCriticalDetailModalOpen}
        onClose={() => {
          setIsCriticalDetailModalOpen(false);
          setSelectedCriticalOccurrence(null);
        }}
        occurrence={selectedCriticalOccurrence}
        student={activeStudent}
        allStudentOccurrences={activeStudent.occurrences || []}
        onToast={onToast}
      />
    </motion.div>
  );
}
