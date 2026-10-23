import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Home,
  Calendar,
  Heart,
  FileText,
  HelpCircle,
  Gift,
  Menu,
  ArrowLeft,
  Sparkles,
  Brain,
  Image as ImageIcon,
  Check,
  Clock,
  X,
  Upload,
  Download,
  RefreshCw,
  RotateCcw,
  Send,
  Lock,
  DollarSign,
  ExternalLink,
  QrCode,
  Compass,
  Copy,
  FileCheck,
  Palette,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  ChevronDown,
  Info,
  Sliders,
  Maximize2,
  Minimize2,
  Bookmark,
  User as UserIcon,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Loader2,
  XCircle,
  FolderSync,
  Baby,
  Smile,
  Utensils,
  Moon,
  Pill,
  GraduationCap,
  Layers,
  Key,
  Car,
  Settings,
  Flame,
  Award,
  Coins,
  Star,
  UserCheck,
  BookOpen,
  LayoutDashboard,
  Mic,
  MicOff,
  Radio,
  Kanban,
  Globe
} from "lucide-react";

import { jsPDF } from "jspdf";

import { Comunicado, Momento, Evento, Cobranca, UserProfile, UserPreferences, Estudante, SchoolBranding, NotificationItem, ClassroomPhoto, ChatMessage, ScheduledReminder, ChartAnnotation, QrCheckInLog, AutorizacaoRetirada, ContentReport, UserWarning, ReportedContentType, ReportStatus } from "./types";
import { InstitutionalLanding } from "./components/InstitutionalLanding";
import { InstitutionalFooter } from "./components/InstitutionalFooter";
import {
  initialComunicados,
  initialMomentos,
  initialEventos,
  initialCobrancas,
  initialEstudantes,
  initialModerationReports,
  initialUserWarnings
} from "./seeds";

// Recharts components and supplemental icons
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceDot, ReferenceLine } from "recharts";
import { Bell, BellRing, Camera, FileSpreadsheet, TrendingUp, TrendingDown, Sun, MessageSquare, Trash2, BellOff, Accessibility, History, Pin, Tag, Pencil, Apple, Lightbulb, WifiOff, Smartphone, Crop, Mail, LogOut, Zap, ArrowUpRight, ArrowDownRight, ZoomIn, ZoomOut, Building2, Users, ShieldAlert, Flag } from "lucide-react";

// Firebase initialization
import { db, auth, handleFirestoreError, OperationType } from "./lib/firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";

// Applet Configuration
import { APPLET_CONFIG } from "./config/appletConfig";

// Modular Components
import AuthSection from "./components/AuthSection";
import CreateAnnouncementModal from "./components/CreateAnnouncementModal";
import BillingInvoiceModal from "./components/BillingInvoiceModal";
import { MonthlyFinancialReportModal } from "./components/MonthlyFinancialReportModal";
import { ReportContentModal, ReportTarget } from "./components/ReportContentModal";
import { ContentModerationHub } from "./components/ContentModerationHub";
import { UserWarningBanner } from "./components/UserWarningBanner";
import InvoiceWhatsAppReminderModal from "./components/InvoiceWhatsAppReminderModal";
import { triggerGoldenConfettiForPortaria } from "./utils/goldenConfetti";
import LayersAtalhosHub from "./components/LayersAtalhosHub";
import RenegociacaoFinanceira from "./components/RenegociacaoFinanceira";
import { StudentDailyRoutineTab } from "./components/StudentDailyRoutineTab";
import ClassroomPhotoCard from "./components/ClassroomPhotoCard";
import UserProfileModal from "./components/UserProfileModal";
import UserProfilePage from "./components/UserProfilePage";
import { PortariaQrScanner } from "./components/PortariaQrScanner";
import { SchoolMetricsDashboard } from "./components/SchoolMetricsDashboard";
import { ParentDashboard } from "./components/ParentDashboard";
import { SchoolDashboard } from "./components/SchoolDashboard";
import { ComunicadosList } from "./components/ComunicadosList";
import { MomentosList } from "./components/MomentosList";
import { ErpIntegrationDashboard } from "./components/ErpIntegrationDashboard";
import { AcademicFourTermsTab } from "./components/AcademicFourTermsTab";
import { GuidedTour } from "./components/GuidedTour";
import { CrmLtvConfigPanel } from "./components/CrmLtvConfigPanel";
import { EmotionalDashboard } from "./components/EmotionalDashboard";
import { ExportReportButton } from "./components/ExportReportButton";
import { QrCodeAuditLogModal } from "./components/QrCodeAuditLogModal";
import { QrCodeScannerModal } from "./components/QrCodeScannerModal";
import { InvoiceWarningQuickPeek } from "./components/InvoiceWarningQuickPeek";
import { DicasFinanceirasModal } from "./components/DicasFinanceirasModal";
import { AutomatedRemindersCrm } from "./components/AutomatedRemindersCrm";
import { CrmQuickRemindersModal } from "./components/CrmQuickRemindersModal";
import { AgendadorLembretesFinanceiros } from "./components/AgendadorLembretesFinanceiros";
import { TimetablePlanner } from "./components/TimetablePlanner";
import { AppleNotionSchoolAccessHub } from "./components/AppleNotionSchoolAccessHub";
import { MarketIntelligenceHub } from "./components/MarketIntelligenceHub";
import { MagicalSubtleBackground } from "./components/MagicalSubtleBackground";
import { DashboardPedagogico } from "./components/DashboardPedagogico";
import { AchievementsWidget } from "./components/AchievementsWidget";
import DeletePhotoConfirmationModal from "./components/DeletePhotoConfirmationModal";
import AlertsConfigurationModal from "./components/AlertsConfigurationModal";
import { HelpCenterModal, HelpCenterTab } from "./components/HelpCenterModal";
import { MagicLearningBrandLogo } from "./components/MagicLearningBrandLogo";
import { GlobalSearchModal, SearchTarget } from "./components/GlobalSearchModal";
import { SearchBar } from "./components/SearchBar";
import { AppBreadcrumbsNav } from "./components/AppBreadcrumbsNav";
import { StudentPortal } from "./components/StudentPortal";
import { CrmPipelineAlertsModule } from "./components/CrmPipelineAlertsModule";
import { CrmConversionAnalyticsPanel } from "./components/CrmConversionAnalyticsPanel";
import { CrmKanbanBoard } from "./components/CrmKanbanBoard";
import { LtvMasteryConfigModal } from "./components/LtvMasteryConfigModal";
import { PipelineProgressSeal } from "./components/PipelineProgressSeal";
import { WhiteLabelCustomizerModal } from "./components/WhiteLabelCustomizerModal";
import StudentPhotoCameraModal from "./components/StudentPhotoCameraModal";
import { StudentManageModal } from "./components/StudentManageModal";
import { PortariaHeatmap } from "./components/PortariaHeatmap";
import TextAdventureGame from "./components/TextAdventureGame";
import { getDefaultBranding, applyBrandingToCssVariables } from "./utils/whiteLabelDefaults";
import { trackUserActivity } from "./services/recommendationEngine";

// Translations
import { translations } from "./translations";
import { 
  ThemePreference, 
  isNightTimeSchedule, 
  resolveTheme, 
  getStoredThemePreference, 
  setStoredThemePreference 
} from "./utils/themeManager";
import { 
  SupportedLocale, 
  getPortalText, 
  getStoredLocale, 
  setStoredLocale,
  getTabLabel,
  getTabDescription,
  SUPPORTED_LANGUAGES
} from "./utils/i18n";
import { ThemeSelector } from "./components/ThemeSelector";
import { LanguageSelector } from "./components/LanguageSelector";
import { pushNotificationService, NotificationEventCategory } from "./services/pushNotificationService";
import { NotificationPreferencesModal } from "./components/NotificationPreferencesModal";
import { PushNotificationToast } from "./components/PushNotificationToast";

// Static Seed Data for Photos and Notifications
const initialNotificationsSeed: NotificationItem[] = [
  {
    id: "notif-seed-1",
    title: "🔔 Novo Comunicado Postado",
    body: "Festividades de Festa Junina: Confirmação de horários e trajes típicos para as apresentações.",
    timestamp: Date.now() - 3600000 * 2,
    read: false,
    targetTab: "comunicados",
    iconType: "announcement"
  },
  {
    id: "notif-seed-2",
    title: "📝 Diário de Classe Publicado",
    body: "Diário de rotina atualizado! Veja os detalhes de alimentação, sono e comportamento de hoje.",
    timestamp: Date.now() - 3600000 * 5,
    read: false,
    targetTab: "diaadia",
    iconType: "occurrence"
  },
  {
    id: "notif-seed-3",
    title: "📊 Boletim do 2º Bimestre Disponível",
    body: "Confira as notas e relatórios de progresso do aluno consolidados pela coordenação pedagógica.",
    timestamp: Date.now() - 3600000 * 24 * 2,
    read: true,
    targetTab: "academico",
    iconType: "occurrence"
  }
];

const initialClassroomPhotosSeed: ClassroomPhoto[] = [
  {
    id: "photo-seed-1",
    title: "Explorando texturas e cores na aula de guache e argila",
    grade: "Berçário das Estrelas (Maternal I)",
    date: "Hoje, 10:30",
    timestamp: Date.now() - 1000 * 60 * 30,
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600",
    teacherName: "Profa. Juliana Mendes",
    badge: "Artes 🎨",
    taggedStudentIds: ["est-2"],
    likes: 8,
    likedByCurrentUser: false,
    tags: ["artes", "guache", "argila", "texturas", "cores", "criatividade"]
  },
  {
    id: "photo-seed-2",
    title: "Montagem prática com circuitos simples e motores de robô",
    grade: "4º Ano - Ensino Fundamental (Turma B)",
    date: "Hoje, 09:15",
    timestamp: Date.now() - 1000 * 60 * 120,
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600",
    teacherName: "Prof. Rafael Rodrigues",
    badge: "Robótica 🤖",
    taggedStudentIds: ["est-1"],
    likes: 12,
    likedByCurrentUser: true,
    tags: ["robotica", "circuitos", "motores", "stem", "tecnologia", "maker"]
  },
  {
    id: "photo-seed-3",
    title: "Piquenique pedagógico e plantio de sementes de girassol",
    grade: "Maternal I e 4º Ano Coletivo",
    date: "Ontem, 14:00",
    timestamp: Date.now() - 1000 * 60 * 60 * 20,
    imageUrl: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=600",
    teacherName: "Profa. Heloísa Sampaio",
    badge: "Horta 🌿",
    taggedStudentIds: ["est-1", "est-2"],
    likes: 5,
    likedByCurrentUser: false,
    tags: ["horta", "plantio", "natureza", "piquenique", "girassol", "meio-ambiente"]
  },
  {
    id: "photo-seed-4",
    title: "Mapeamento Estelar: Projetor e Lanternas no Planetário Inflável",
    grade: "4º Ano - Ensino Fundamental (Turma B)",
    date: "Anteontem, 11:15",
    timestamp: Date.now() - 1000 * 60 * 60 * 45,
    imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=600",
    teacherName: "Prof. Rafael Rodrigues",
    badge: "Ciências 🔬",
    taggedStudentIds: ["est-1"],
    likes: 14,
    likedByCurrentUser: false,
    tags: ["ciencias", "planetario", "astronomia", "lanternas", "espaco"]
  },
  {
    id: "photo-seed-5",
    title: "Oficina de Jardinagem: Germinação de Feijões e Mudas de Hortelã",
    grade: "Maternal I e 4º Ano Coletivo",
    date: "Anteontem, 15:30",
    timestamp: Date.now() - 1000 * 60 * 60 * 50,
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=600",
    teacherName: "Profa. Heloísa Sampaio",
    badge: "Horta 🌿",
    taggedStudentIds: ["est-1", "est-2"],
    likes: 9,
    likedByCurrentUser: false,
    tags: ["horta", "jardinagem", "feijao", "mudas", "sustentabilidade", "biologia"]
  },
  {
    id: "photo-seed-6",
    title: "Teatro de Sombras: Contação de Histórias com Lanternas e Silhuetas",
    grade: "Berçário das Estrelas (Maternal I)",
    date: "3 dias atrás",
    timestamp: Date.now() - 1000 * 60 * 60 * 75,
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600",
    teacherName: "Profa. Juliana Mendes",
    badge: "Artes 🎨",
    taggedStudentIds: ["est-2"],
    likes: 18,
    likedByCurrentUser: true,
    tags: ["artes", "teatro", "sombras", "historias", "leitura", "expressao"]
  }
];

const initialAnnotationsSeed: ChartAnnotation[] = [
  {
    id: "ann-1",
    studentId: "est-1",
    bimester: "1º Bimestre",
    subject: "Todas",
    category: "Semana de Projetos 🚀",
    note: "Foco em desenvolvimento prático interativo e apresentação de trabalhos em equipes multidisciplinares.",
    author: "Coordenação Pedagógica",
    createdAt: "15/03/2026"
  },
  {
    id: "ann-2",
    studentId: "est-1",
    bimester: "2º Bimestre",
    subject: "Todas",
    category: "Período de Provas 📝",
    note: "Semana de diagnósticos cognitivos consolidados e avaliações formativas do bimestre.",
    author: "Profa. Heloísa Sampaio",
    createdAt: "22/05/2026"
  },
  {
    id: "ann-3",
    studentId: "est-2",
    bimester: "1º Bimestre",
    subject: "Todas",
    category: "Semana de Adaptação 🌱",
    note: "Período inicial focado na socialização e no mapeamento de interesses cognitivos e afetivos.",
    author: "Coordenação Pedagógica",
    createdAt: "10/03/2026"
  }
];

// Custom premium activeDot for highlights on hover
const RenderActiveDot = (props: any) => {
  const { cx, cy, stroke } = props;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  return (
    <g key={`active-dot-${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={12} fill={stroke} fillOpacity={0.15} className="animate-pulse" />
      <circle cx={cx} cy={cy} r={8} fill={stroke} fillOpacity={0.3} className="animate-ping" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      <circle cx={cx} cy={cy} r={6} fill={stroke} stroke="#ffffff" strokeWidth={2} />
    </g>
  );
};

// 🔮 Dynamic Web Audio Synthesizer for school-parent portal signature sounds
class SensorySoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;
  public qrSoundType: "synthesized" | "system_beep" = "synthesized";
  public volume: number = 0.8;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public playQrScan(type: "success" | "error", soundTypeOverride?: "synthesized" | "system_beep") {
    if (!this.enabled) return;
    const mode = soundTypeOverride || this.qrSoundType;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      if (mode === "system_beep") {
        if (type === "success") {
          // Sharp single-frequency barcode scanner system beep (2093 Hz / C7)
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(masterGain);

          osc.type = "sine";
          osc.frequency.setValueAtTime(2093, now);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

          osc.start(now);
          osc.stop(now + 0.08);
        } else {
          // Harsh low double buzz system error beep
          [220, 180].forEach((freq, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(masterGain);

            osc.type = "square";
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            gain.gain.setValueAtTime(0.07, now + idx * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.09);

            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.09);
          });
        }
      } else {
        // Use standard synthesized chimes / drops
        this.play(type);
      }
    } catch (e) {
      console.warn("SensorySoundEngine playQrScan error:", e);
    }
  }

  public play(type: "click" | "sparkle" | "success" | "error") {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(this.ctx.destination);

      if (type === "click") {
        // High-end, soft damped tactile click (simulates smartphone taptic engine)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const lowpass = this.ctx.createBiquadFilter();

        osc.connect(lowpass);
        lowpass.connect(gain);
        gain.connect(masterGain);

        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(350, now);

        osc.type = "sine";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.025);

        gain.gain.setValueAtTime(0.015, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

        masterGain.gain.setValueAtTime(1.0, now);

        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === "sparkle") {
        // Celestial rising high-frequency minor chord
        const frequencies = [1200, 1500, 1800, 2200];
        frequencies.forEach((f, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(masterGain);

          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + i * 0.012);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.003, now + i * 0.012 + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.012 + 0.08);

          osc.start(now + i * 0.012);
          osc.stop(now + i * 0.012 + 0.1);
        });
      } else if (type === "success") {
        // Premium, warm pentatonic chime sequence
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(masterGain);

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.035);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.006, now + idx * 0.035 + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.035 + 0.18);

          osc.start(now + idx * 0.035);
          osc.stop(now + idx * 0.035 + 0.22);
        });
      } else if (type === "error") {
        // Deep double-thud drop warning
        [125, 90].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(masterGain);

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.012, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.07);

          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.09);
        });
      }
    } catch (e) {
      console.warn("SensorySoundEngine error:", e);
    }
  }
}

const sensorySoundEngine = new SensorySoundEngine();

export function App() {
  // 🌐 Detect Firebase Firestore Connection Online / Offline Status
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // User Authentication & Firestore Synced Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("school_portal_user_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // User Profile Button click ripple effect
  const [profileRipples, setProfileRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  // 📥 Offline Synchronization Queue States
  const [offlineQueue, setOfflineQueue] = useState<{ id: string; entity: string; action: string; timestamp: number; data: any }[]>(() => {
    try {
      const saved = localStorage.getItem("school_offline_sync_queue");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Helper to add operations to the queue when offline
  const trackOfflineOperation = (entity: string, action: string, data: any) => {
    const newOp = {
      id: "sync_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11),
      entity,
      action,
      timestamp: Date.now(),
      data
    };
    const updatedQueue = [...offlineQueue, newOp];
    setOfflineQueue(updatedQueue);
    localStorage.setItem("school_offline_sync_queue", JSON.stringify(updatedQueue));
    
    setToast({
      message: `Alteração salva localmente em Modo Offline. Sincronizaremos com a nuvem quando a conexão voltar!`,
      type: "info"
    });
  };

  useEffect(() => {
    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
      return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("offline-timeout")), ms);
        promise
          .then((value) => {
            clearTimeout(timer);
            resolve(value);
          })
          .catch((err) => {
            clearTimeout(timer);
            reject(err);
          });
      });
    };

    const handleOnline = async () => {
      try {
        const res = await withTimeout(fetch("/api/health"), 1800);
        setIsOffline(!res.ok);
      } catch (error: any) {
        setIsOffline(!navigator.onLine);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const checkConnection = async () => {
      if (!navigator.onLine) {
        setIsOffline(true);
        return;
      }
      try {
        const res = await withTimeout(fetch("/api/health"), 1800);
        if (res.ok) {
          setIsOffline(false);
        } else {
          setIsOffline(!navigator.onLine);
        }
      } catch (error: any) {
        setIsOffline(!navigator.onLine);
      }
    };

    // Initial check
    checkConnection();

    const intervalId = setInterval(checkConnection, 25000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // 🔄 Synchronization Engine: Sync offline data to Firestore when online
  useEffect(() => {
    const syncOfflineData = async () => {
      if (isOffline) return;
      const savedQueue = localStorage.getItem("school_offline_sync_queue");
      if (!savedQueue) return;
      
      try {
        const parsedQueue = JSON.parse(savedQueue);
        if (parsedQueue.length === 0) return;

        setIsSyncing(true);
        setSyncProgress(0);
        
        setToast({
          message: `Conexão restaurada! Sincronizando ${parsedQueue.length} alteração(ões) pendente(s) com o sistema...`,
          type: "info"
        });

        // Loop through all queue operations and save to Firestore
        for (let i = 0; i < parsedQueue.length; i++) {
          const op = parsedQueue[i];
          
          // Write log/operation to firebase collection
          const opRef = doc(db, "offline_sync_logs", op.id);
          await setDoc(opRef, {
            entity: op.entity,
            action: op.action,
            timestamp: op.timestamp,
            data: JSON.stringify(op.data),
            userUid: userProfile?.uid || "anonymous_portal_user",
            userEmail: userProfile?.email || "anonymous_user",
            synchronizedAt: Date.now()
          });

          // Simulate progress delay for smooth UX transition
          setSyncProgress(Math.round(((i + 1) / parsedQueue.length) * 100));
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Successfully synchronized!
        setOfflineQueue([]);
        localStorage.removeItem("school_offline_sync_queue");
        
        setToast({
          message: `✨ Sincronização concluída! ${parsedQueue.length} alterações foram jogadas no sistema com sucesso.`,
          type: "success"
        });
      } catch (err) {
        console.error("Erro na sincronização de dados offline:", err);
        setToast({
          message: `⚠️ Alguns dados locais estão salvos, mas não puderam ser sincronizados ainda. Tentaremos novamente em instantes.`,
          type: "error"
        });
      } finally {
        setIsSyncing(false);
        setSyncProgress(0);
      }
    };

    syncOfflineData();
  }, [isOffline, userProfile]);

  // 🔐 Real-Time Firebase Auth & Firestore Profile State Synchronization
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const profile: UserProfile = {
              uid: currentUser.uid,
              displayName: data.displayName || currentUser.displayName || "Usuário",
              username: data.username || currentUser.email?.split("@")[0] || "usuario",
              email: currentUser.email || data.email,
              photoURL: data.photoURL || currentUser.photoURL || "",
              bio: data.bio || "Membro da comunidade escolar.",
              preferences: data.preferences || {
                studentName: "Estudante",
                studentGrade: "Ensino Fundamental",
                themeColor: "default",
                notificationCategory: "todos",
                notifications: true,
                compactMode: false,
                highContrast: false,
                reducedMotion: false,
                emailDigest: "weekly"
              },
              selectedStudentId: data.selectedStudentId,
              savedComunicadoIds: data.savedComunicadoIds || [],
              savedMomentoIds: data.savedMomentoIds || [],
              joinedEventoIds: data.joinedEventoIds || [],
              activityHistory: data.activityHistory || []
            };
            setUserProfile(profile);
            localStorage.setItem("school_portal_user_profile", JSON.stringify(profile));
          } else {
            const fallbackProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || "Usuário",
              username: currentUser.email?.split("@")[0] || "usuario",
              email: currentUser.email || "",
              photoURL: currentUser.photoURL || "",
              bio: "Membro da comunidade escolar.",
              preferences: {
                studentName: "Estudante",
                studentGrade: "Ensino Fundamental",
                themeColor: "default",
                notificationCategory: "todos",
                notifications: true,
                compactMode: false,
                highContrast: false,
                reducedMotion: false,
                emailDigest: "weekly"
              },
              savedComunicadoIds: [],
              savedMomentoIds: [],
              joinedEventoIds: [],
              activityHistory: []
            };
            setUserProfile(fallbackProfile);
            localStorage.setItem("school_portal_user_profile", JSON.stringify(fallbackProfile));
          }
        } catch (err) {
          console.warn("Could not sync Firestore profile from auth state:", err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync user profile state changes to localStorage
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem("school_portal_user_profile", JSON.stringify(userProfile));
    } else {
      localStorage.removeItem("school_portal_user_profile");
    }
  }, [userProfile]);

  // Portal user type role state & school tabs
  const [userRole, setUserRole] = useState<"landing" | "pais" | "escola" | "aluno">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (roleParam === "escola" || roleParam === "pais" || roleParam === "aluno" || roleParam === "landing") {
        return roleParam;
      }
    }
    return "landing";
  });
  const [showAuthSection, setShowAuthSection] = useState<boolean>(false);

  // 🔮 Sensory Signature Premium Engine State 🔮
  const [sensoryAudioEnabled, setSensoryAudioEnabled] = useState(() => {
    return localStorage.getItem("school_portal_sensory_audio_enabled") === "true";
  });
  const [sensoryHapticsEnabled, setSensoryHapticsEnabled] = useState(() => {
    return localStorage.getItem("school_portal_sensory_haptics_enabled") !== "false";
  });
  const [sensoryFocusGlowEnabled, setSensoryFocusGlowEnabled] = useState(() => {
    return localStorage.getItem("school_portal_sensory_focus_glow") !== "false";
  });
  const [qrSoundType, setQrSoundType] = useState<"synthesized" | "system_beep">(() => {
    return (localStorage.getItem("school_portal_qr_sound_type") as "synthesized" | "system_beep") || "synthesized";
  });
  const [qrSoundMenuOpen, setQrSoundMenuOpen] = useState(false);
  const [sensoryVolume, setSensoryVolume] = useState<number>(() => {
    const saved = localStorage.getItem("school_portal_sensory_volume");
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [sensoryPanelOpen, setSensoryPanelOpen] = useState(false);

  // ♿ Accessibility High Contrast Preference State ♿
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem("school_high_contrast") === "true";
  });
  const [isHighContrastBadgeHovered, setIsHighContrastBadgeHovered] = useState(false);
  const [hcBadgeAutoHide, setHcBadgeAutoHide] = useState<boolean>(() => {
    return localStorage.getItem("school_hc_badge_autohide") === "true";
  });
  const [hcBadgePosition, setHcBadgePosition] = useState<"top-right" | "top-left" | "bottom-right" | "bottom-left">(
    () => (localStorage.getItem("school_hc_badge_position") as "top-right" | "top-left" | "bottom-right" | "bottom-left") || "top-right"
  );
  const [hcBadgeGlowDuration, setHcBadgeGlowDuration] = useState<string>(() => {
    return localStorage.getItem("school_hc_badge_glow_duration") || APPLET_CONFIG.highContrastDefaults.hcGlowDuration;
  });
  const [hcBadgeGlowColor, setHcBadgeGlowColor] = useState<string>(() => {
    return localStorage.getItem("school_hc_badge_glow_color") || APPLET_CONFIG.highContrastDefaults.hcGlowColor;
  });
  const [hcBadgeGlowOpacity, setHcBadgeGlowOpacity] = useState<number>(() => {
    const saved = localStorage.getItem("school_hc_badge_glow_opacity");
    return saved !== null ? parseFloat(saved) : APPLET_CONFIG.highContrastDefaults.hcGlowOpacity;
  });
  const [isHcBadgeVisible, setIsHcBadgeVisible] = useState(true);
  const [showGlowResetTooltip, setShowGlowResetTooltip] = useState(false);
  const [isGlowResetAnimating, setIsGlowResetAnimating] = useState(false);
  const [isAdvancedHcModalOpen, setIsAdvancedHcModalOpen] = useState(false);
  const [hcBadgeEntryEffect, setHcBadgeEntryEffect] = useState<"slide-in" | "fade" | "bounce">(
    () => (localStorage.getItem("school_hc_badge_entry_effect") as "slide-in" | "fade" | "bounce") || "slide-in"
  );
  const [glowResetHistory, setGlowResetHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("school_hc_glow_reset_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [autoHcScheduleEnabled, setAutoHcScheduleEnabled] = useState<boolean>(() => {
    return localStorage.getItem("school_auto_hc_schedule_enabled") === "true";
  });
  const [autoHcStartHour, setAutoHcStartHour] = useState<number>(() => {
    const saved = localStorage.getItem("school_auto_hc_start_hour");
    return saved !== null ? parseInt(saved, 10) : 18;
  });
  const [autoHcEndHour, setAutoHcEndHour] = useState<number>(() => {
    const saved = localStorage.getItem("school_auto_hc_end_hour");
    return saved !== null ? parseInt(saved, 10) : 6;
  });

  const resetGlowConfig = () => {
    const defaultDuration = APPLET_CONFIG.highContrastDefaults.hcGlowDuration;
    const defaultOpacity = APPLET_CONFIG.highContrastDefaults.hcGlowOpacity;
    const defaultColor = APPLET_CONFIG.highContrastDefaults.hcGlowColor;
    setHcBadgeGlowDuration(defaultDuration);
    setHcBadgeGlowOpacity(defaultOpacity);
    setHcBadgeGlowColor(defaultColor);
    setHcBadgeEntryEffect("slide-in");
    setAutoHcScheduleEnabled(false);
    setAutoHcStartHour(18);
    setAutoHcEndHour(6);
    localStorage.setItem("school_hc_badge_glow_duration", defaultDuration);
    localStorage.setItem("school_hc_badge_glow_opacity", String(defaultOpacity));
    localStorage.setItem("school_hc_badge_glow_color", defaultColor);
    localStorage.setItem("school_hc_badge_entry_effect", "slide-in");
    localStorage.setItem("school_auto_hc_schedule_enabled", "false");
    localStorage.setItem("school_auto_hc_start_hour", "18");
    localStorage.setItem("school_auto_hc_end_hour", "6");

    // Save timestamp to history log (keep max 3)
    const now = new Date();
    const formatted = `${now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
    setGlowResetHistory((prev) => {
      const updated = [formatted, ...prev].slice(0, 3);
      localStorage.setItem("school_hc_glow_reset_history", JSON.stringify(updated));
      return updated;
    });

    // Trigger rotation & pulse animation
    setIsGlowResetAnimating(true);
    setShowGlowResetTooltip(true);
    setTimeout(() => setIsGlowResetAnimating(false), 700);
    setTimeout(() => setShowGlowResetTooltip(false), 2600);

    sensorySoundEngine.play("click");
    setToast({
      message: `Brilho resetado para os padrões do applet (--hc-glow-duration: ${defaultDuration}, --hc-glow-opacity: ${defaultOpacity}).`,
      type: "info",
    });
  };

  useEffect(() => {
    localStorage.setItem("school_hc_badge_autohide", String(hcBadgeAutoHide));
  }, [hcBadgeAutoHide]);

  useEffect(() => {
    localStorage.setItem("school_hc_badge_position", hcBadgePosition);
  }, [hcBadgePosition]);

  useEffect(() => {
    localStorage.setItem("school_hc_badge_glow_duration", hcBadgeGlowDuration);
  }, [hcBadgeGlowDuration]);

  useEffect(() => {
    localStorage.setItem("school_hc_badge_glow_color", hcBadgeGlowColor);
  }, [hcBadgeGlowColor]);

  useEffect(() => {
    localStorage.setItem("school_hc_badge_glow_opacity", String(hcBadgeGlowOpacity));
  }, [hcBadgeGlowOpacity]);

  useEffect(() => {
    localStorage.setItem("school_auto_hc_schedule_enabled", String(autoHcScheduleEnabled));
    localStorage.setItem("school_auto_hc_start_hour", String(autoHcStartHour));
    localStorage.setItem("school_auto_hc_end_hour", String(autoHcEndHour));
  }, [autoHcScheduleEnabled, autoHcStartHour, autoHcEndHour]);

  useEffect(() => {
    if (!autoHcScheduleEnabled) return;

    const checkSchedule = () => {
      const currentHour = new Date().getHours();
      let shouldBeHighContrast = false;

      if (autoHcStartHour > autoHcEndHour) {
        // Overnight interval, e.g., 18:00 to 06:00
        shouldBeHighContrast = currentHour >= autoHcStartHour || currentHour < autoHcEndHour;
      } else if (autoHcStartHour < autoHcEndHour) {
        // Daytime interval, e.g., 08:00 to 18:00
        shouldBeHighContrast = currentHour >= autoHcStartHour && currentHour < autoHcEndHour;
      } else {
        // Equal, 24h active
        shouldBeHighContrast = true;
      }

      setIsHighContrast((prev) => {
        if (prev !== shouldBeHighContrast) {
          localStorage.setItem("school_high_contrast", String(shouldBeHighContrast));
          return shouldBeHighContrast;
        }
        return prev;
      });
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [autoHcScheduleEnabled, autoHcStartHour, autoHcEndHour]);

  // 5-second inactivity timer for high contrast indicator badge if autohide is enabled
  useEffect(() => {
    if (!isHighContrast) {
      setIsHcBadgeVisible(true);
      return;
    }
    if (!hcBadgeAutoHide) {
      setIsHcBadgeVisible(true);
      return;
    }

    setIsHcBadgeVisible(true);
    const timer = setTimeout(() => {
      setIsHcBadgeVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isHighContrast, hcBadgeAutoHide]);

  // Sync state to sensory sound engine singleton
  useEffect(() => {
    sensorySoundEngine.enabled = sensoryAudioEnabled;
    sensorySoundEngine.qrSoundType = qrSoundType;
    sensorySoundEngine.volume = sensoryVolume;
  }, [sensoryAudioEnabled, qrSoundType, sensoryVolume]);

  const [schoolActiveTab, setSchoolActiveTab] = useState<"dashboard" | "agenda" | "retiradas" | "comunicados" | "erp" | "alunos" | "metricas" | "planejador" | "premium_hub" | "benchmarking" | "perfil" | "moderacao">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("schoolTab");
      if (tabParam) return tabParam as any;
    }
    return "alunos";
  });

  // Student Portal gamification / simulation states
  const [studentActiveTab, setStudentActiveTab] = useState<"simplificada" | "dashboard" | "horarios" | "tarefas" | "conquistas" | "completa">("simplificada");
  const [studentCheckedReminders, setStudentCheckedReminders] = useState<string[]>(() => {
    const saved = localStorage.getItem("school_student_checked_reminders");
    return saved ? JSON.parse(saved) : [];
  });
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [magicCoins, setMagicCoins] = useState<number>(250);
  const [studentLoginId, setStudentLoginId] = useState<string>("");
  const [studentLoginPassword, setStudentLoginPassword] = useState<string>("");

  // Navigation tabs of parents portal
  const [activeTab, setActiveTab] = useState<"dashboard" | "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso" | "premium_hub" | "perfil">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // School Portal state fields for teacher occurrences logger
  const [logStudentId, setLogStudentId] = useState<string>("est-1");
  const [logLunch, setLogLunch] = useState<"excelente" | "parcial" | "recusou" | "nao_se_aplica">("excelente");
  const [logSnack, setLogSnack] = useState<"excelente" | "parcial" | "recusou" | "nao_se_aplica">("excelente");
  const [logMealDetails, setLogMealDetails] = useState("");
  const [logWasMedicated, setLogWasMedicated] = useState(false);
  const [logMedicationName, setLogMedicationName] = useState("");
  const [logDoseTime, setLogDoseTime] = useState("");
  const [logMedicationDetails, setLogMedicationDetails] = useState("");
  const [logSleepDuration, setLogSleepDuration] = useState("1h 15min");
  const [logSleepDetails, setLogSleepDetails] = useState("");
  const [logBehaviorState, setLogBehaviorState] = useState<"otimo" | "agitado" | "triste" | "cansado">("otimo");
  const [logTeacherNote, setLogTeacherNote] = useState("");

  // Speech Dictation States for Teacher Note (Relatório Pedagógico)
  const [isDictatingNote, setIsDictatingNote] = useState(false);
  const [dictationTranscript, setDictationTranscript] = useState("");
  const [dictationError, setDictationError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Core Data States
  const [comunicados, setComunicados] = useState<Comunicado[]>(initialComunicados);
  const [momentos, setMomentos] = useState<Momento[]>(initialMomentos);
  const [eventos, setEventos] = useState<Evento[]>(initialEventos);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>(initialCobrancas);
  
  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Active student pickup tracking simulated ETA (in seconds)
  const [pickupEtaSec, setPickupEtaSec] = useState<number>(240);

  // Auto clean toast after 4s & play matching sensory sound cue
  useEffect(() => {
    if (toast) {
      if (toast.type === "success") {
        sensorySoundEngine.play("success");
      } else if (toast.type === "error") {
        sensorySoundEngine.play("error");
      } else {
        sensorySoundEngine.play("click");
      }
      
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Available extracurricular optional payments
  const [opcoesExtras] = useState([
    { id: "opt-1", title: "Viagem Cultural ao Planetário & Observatório de OZ", amount: 120.00, dueDate: "10/07/2026", cat: "Passeios Culturais" },
    { id: "opt-2", title: "Curso Intensivo de Robótica Educativa & IoT de Sábados", amount: 85.00, dueDate: "05/08/2026", cat: "Aulas Complementares" },
    { id: "opt-3", title: "Teatro Exclusivo de Fantoches e Histórias na Floresta", amount: 45.00, dueDate: "15/07/2026", cat: "Atividades Lúdicas" }
  ]);
  
  // Multi-Student & Access control rules
  const [estudantes, setEstudantes] = useState<Estudante[]>(initialEstudantes);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("est-1");
  const [cameraModalStudent, setCameraModalStudent] = useState<Estudante | null>(null);
  const [selectedBulkStudentIds, setSelectedBulkStudentIds] = useState<string[]>([]);
  
  // Student CRM Management & Portaria Mode States
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<"todos" | "concluido" | "em_analise" | "pendente">("todos");
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Estudante | null>(null);
  const [portariaViewMode, setPortariaViewMode] = useState<"scanner" | "heatmap">("scanner");

  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [isMonthlyReportModalOpen, setIsMonthlyReportModalOpen] = useState(false);
  const [activeModalFocus, setActiveModalFocus] = useState<"financial_report" | "ltv_config">("ltv_config");
  const [isMetricsTrendOpen, setIsMetricsTrendOpen] = useState(false);
  const [metricsTrendRange, setMetricsTrendRange] = useState<"7d" | "30d" | "90d">("30d");
  const [alertConfigOpen, setAlertConfigOpen] = useState(false);
  const [inlineAlertConfigOpen, setInlineAlertConfigOpen] = useState(false);
  const [quickConfigModalOpen, setQuickConfigModalOpen] = useState(false);
  const [quickConfigSaveStatus, setQuickConfigSaveStatus] = useState<"idle" | "saving" | "success">("idle");
  const [crmWaReminderDays, setCrmWaReminderDays] = useState<number>(() => {
    const saved = localStorage.getItem("crmWaReminderDays");
    return saved ? parseInt(saved, 10) : 3;
  });
  const [alertReadThreshold, setAlertReadThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("alertReadThreshold");
    return saved ? parseInt(saved, 10) : 65;
  });
  const [alertEngagementThreshold, setAlertEngagementThreshold] = useState<number>(() => {
    const saved = localStorage.getItem("alertEngagementThreshold");
    return saved ? parseInt(saved, 10) : 150;
  });
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("alertsEnabled");
    return saved !== null ? saved === "true" : true;
  });
  const [alertGlowIntensity, setAlertGlowIntensity] = useState<number>(() => {
    const saved = localStorage.getItem("alertGlowIntensity");
    return saved ? parseInt(saved, 10) : 50;
  });

  useEffect(() => {
    localStorage.setItem("alertReadThreshold", String(alertReadThreshold));
  }, [alertReadThreshold]);

  useEffect(() => {
    localStorage.setItem("alertEngagementThreshold", String(alertEngagementThreshold));
  }, [alertEngagementThreshold]);

  useEffect(() => {
    localStorage.setItem("alertsEnabled", String(alertsEnabled));
  }, [alertsEnabled]);

  useEffect(() => {
    localStorage.setItem("alertGlowIntensity", String(alertGlowIntensity));
  }, [alertGlowIntensity]);

  useEffect(() => {
    localStorage.setItem("crmWaReminderDays", String(crmWaReminderDays));
  }, [crmWaReminderDays]);

  // Calculation of alert active status for sensorySoundEngine trigger
  const computedIsAlertActive = (() => {
    const totalEst = estudantes.length || 24;
    let totalReads = 0;
    let totalLikes = 0;
    let totalComments = 0;
    (comunicados || []).forEach(c => {
      totalReads += c.seenByParent?.length || 0;
      totalLikes += c.likesCount || 0;
      totalComments += c.comments?.length || 0;
    });
    const avgReadRate = (comunicados || []).length > 0 ? Math.round((totalReads / (comunicados.length * totalEst)) * 100) : 0;
    const totalInteractions = totalLikes + totalComments;
    return alertsEnabled && (avgReadRate < alertReadThreshold || totalInteractions >= alertEngagementThreshold);
  })();

  const prevComputedAlertStateRef = useRef<boolean>(false);
  const [alertHistory, setAlertHistory] = useState<{ id: string; timestamp: string; readRate: number; interactions: number }[]>(() => {
    const saved = localStorage.getItem("alertHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [alertHistoryOpen, setAlertHistoryOpen] = useState(false);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);

  // Helper to parse dates in pt-BR locale format
  const parsePtBrDate = (str: string) => {
    try {
      const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (match) {
        const [_, day, month, year] = match;
        return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
      }
    } catch (e) {
      // ignore
    }
    return new Date();
  };

  const getAlertHistoryStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const alertsLastWeek = alertHistory.filter(item => {
      const itemDate = parsePtBrDate(item.timestamp);
      return itemDate >= oneWeekAgo;
    }).length;

    const dailyAvg = Number((alertsLastWeek / 7).toFixed(2));
    return { alertsLastWeek, dailyAvg };
  };

  const { alertsLastWeek, dailyAvg } = getAlertHistoryStats();

  const handleExportAlertsPDF = () => {
    try {
      sensorySoundEngine.play("click");
    } catch (e) {
      // safe fallback
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const now = new Date();
    let daysToKeep = 7;
    if (metricsTrendRange === "30d") daysToKeep = 30;
    else if (metricsTrendRange === "90d") daysToKeep = 90;

    const limitDate = new Date(now.getTime() - daysToKeep * 24 * 60 * 60 * 1000);
    limitDate.setHours(0, 0, 0, 0);

    const filteredAlerts = alertHistory.filter(item => {
      const itemDate = parsePtBrDate(item.timestamp);
      return itemDate >= limitDate;
    });

    // Color Palette Constants
    const primaryColor = [66, 51, 38]; // #423326 (Warm Dark)
    const accentColor = [244, 63, 94];  // #f43f5e (Rose-500)
    const neutralDark = [51, 65, 85];   // #334155 (slate-700)
    const neutralLight = [248, 250, 252]; // #f8fafc (slate-50)
    const borderLight = [226, 232, 240];  // #e2e8f0 (slate-200)

    // PDF Page Width and Margin
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    let y = margin;

    // 1. Header Section
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, "F");

    // Title in header
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text((branding?.schoolName || "PORTAL ESCOLAR").toUpperCase(), margin, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Relatorio de Alertas de Engajamento e Comunicacao Familiar", margin, 25);
    doc.text(`Periodo Selecionado: Ultimos ${daysToKeep} dias`, margin, 31);

    // Date and Time on the right
    doc.setFontSize(9);
    doc.text(`Gerado em: ${now.toLocaleString("pt-BR")}`, pageWidth - margin - 60, 18);
    doc.text("Sistema de Gestao Escolar", pageWidth - margin - 60, 24);

    y = 52; // resume content below header

    // 2. Summary Cards / Quick Stats
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Resumo Executivo do Periodo", margin, y);
    y += 6;

    // Draw grey background card for stats
    doc.setFillColor(neutralLight[0], neutralLight[1], neutralLight[2]);
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.roundedRect(margin, y, contentWidth, 24, 3, 3, "FD");

    // Quick stats texts
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Alertas Ativos no Periodo:", margin + 8, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(`${filteredAlerts.length} ocorrencia(s)`, margin + 8, y + 15);

    const avgReadRateVal = filteredAlerts.length > 0 
      ? Math.round(filteredAlerts.reduce((acc, curr) => acc + curr.readRate, 0) / filteredAlerts.length)
      : 0;

    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Media de Taxa de Leitura:", margin + 65, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${avgReadRateVal}%`, margin + 65, y + 15);

    const avgInteractionsVal = filteredAlerts.length > 0
      ? Math.round(filteredAlerts.reduce((acc, curr) => acc + curr.interactions, 0) / filteredAlerts.length)
      : 0;

    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Media de Interacoes:", margin + 120, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`${avgInteractionsVal} interacoes`, margin + 120, y + 15);

    y += 36;

    // 3. Alerts Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Historico Detalhado de Alertas Registrados", margin, y);
    y += 6;

    // Table Headers
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, contentWidth, 8, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("No", margin + 5, y + 5.5);
    doc.text("Data / Hora do Registro", margin + 15, y + 5.5);
    doc.text("Taxa de Leitura Media", margin + 75, y + 5.5);
    doc.text("Interacoes (Likes/Comments)", margin + 125, y + 5.5);

    y += 8;

    // Table Body rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    if (filteredAlerts.length === 0) {
      doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
      doc.line(margin, y, margin + contentWidth, y);
      doc.setTextColor(120, 120, 120);
      doc.text("Nenhum alerta de engajamento registrado no periodo selecionado.", margin + 10, y + 8);
      y += 12;
    } else {
      filteredAlerts.forEach((item, idx) => {
        // Background shading for zebra striping
        if (idx % 2 === 1) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, y, contentWidth, 8, "F");
        }
        doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
        doc.line(margin, y + 8, margin + contentWidth, y + 8);

        doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
        doc.text(`#${filteredAlerts.length - idx}`, margin + 5, y + 5.5);
        doc.text(item.timestamp, margin + 15, y + 5.5);

        // Highlight alert read rate in red if very low
        if (item.readRate < alertReadThreshold) {
          doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
          doc.setFont("helvetica", "bold");
        }
        doc.text(`${item.readRate}%`, margin + 75, y + 5.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);

        doc.text(`${item.interactions}`, margin + 125, y + 5.5);

        y += 8;

        // Handle pagination if table goes too long
        if (y > pageHeight - margin - 35) {
          doc.addPage();
          y = margin;
        }
      });
    }

    y += 12;

    // 4. Recommendation & Diagnostics
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Acoes Recomendadas para Re-engajamento:", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    
    const recs = [
      "1. Enviar notificacoes em lote para pais que nao leram os comunicados importantes.",
      "2. Agendar postagens de comunicados criticos para os horarios de pico (inicio/fim das aulas).",
      "3. Oferecer canais alternativos de contato em casos recorrentes de ausencia de resposta.",
      "4. Revisar se os limiares de alerta configurados estao em conformidade com o plano pedagogico."
    ];

    recs.forEach(rec => {
      doc.text(rec, margin + 3, y);
      y += 5.5;
    });

    // Footer page markings
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`${branding?.schoolName || "Plataforma Escolar"} - Relatorio Confidencial de Gestao Pedagogica`, margin, pageHeight - 10);
    doc.text("Pagina 1 de 1", pageWidth - margin - 20, pageHeight - 10);

    // Save the PDF
    doc.save(`Relatorio_Alertas_Engajamento_${daysToKeep}d.pdf`);
  };

  useEffect(() => {
    if (computedIsAlertActive && !prevComputedAlertStateRef.current) {
      const totalEst = estudantes.length || 24;
      let totalReads = 0;
      let totalLikes = 0;
      let totalComments = 0;
      (comunicados || []).forEach(c => {
        totalReads += c.seenByParent?.length || 0;
        totalLikes += c.likesCount || 0;
        totalComments += c.comments?.length || 0;
      });
      const avgReadRate = (comunicados || []).length > 0 ? Math.round((totalReads / (comunicados.length * totalEst)) * 100) : 0;
      const totalInteractions = totalLikes + totalComments;

      const newEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleString("pt-BR"),
        readRate: avgReadRate,
        interactions: totalInteractions
      };

      setAlertHistory(prev => {
        const updated = [newEntry, ...prev].slice(0, 10);
        localStorage.setItem("alertHistory", JSON.stringify(updated));
        return updated;
      });
    }
    prevComputedAlertStateRef.current = computedIsAlertActive;
  }, [computedIsAlertActive, estudantes, comunicados]);
  const [compareStudentIdA, setCompareStudentIdA] = useState("est-1");
  const [compareStudentIdB, setCompareStudentIdB] = useState("est-2");
  const [chartAnnotations, setChartAnnotations] = useState<ChartAnnotation[]>(initialAnnotationsSeed);
  const [annFormOpen, setAnnFormOpen] = useState(false);
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [annBimester, setAnnBimester] = useState("1º Bimestre");
  const [annSubject, setAnnSubject] = useState("Todas");
  const [annCategory, setAnnCategory] = useState("Semana de Projetos 🚀");
  const [annTitle, setAnnTitle] = useState("");
  const [annNote, setAnnNote] = useState("");
  const [annDate, setAnnDate] = useState("2026-07-03");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("todas");
  const [academicSubTab, setAcademicSubTab] = useState<"current" | "four_terms" | "emotional">("current");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [helpCenterInitialTab, setHelpCenterInitialTab] = useState<HelpCenterTab>("features");
  const [helpCenterSearchQuery, setHelpCenterSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<"recent" | "july" | "june" | "all">("recent");
  const [dismissedCobrancaSuggestions, setDismissedCobrancaSuggestions] = useState<string[]>([]);
  const [photoTeacherFilter, setPhotoTeacherFilter] = useState<string>("todos");
  const [photoSortOrder, setPhotoSortOrder] = useState<"recent" | "name_asc" | "name_desc">("recent");
  const [projectedGrades, setProjectedGrades] = useState<Record<string, { third: number; fourth: number }>>({});
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);

  // --- SCHOOL PORTAL ERP ENHANCEMENTS STATE ---
  const [alunosSubTab, setAlunosSubTab] = useState<
    "funil_estatisticas" | "kanban" | "rematricula" | "fichas" | "disparos" | "acesso" | "clinico" | "parecer"
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crm_alunos_active_subtab");
      if (saved === "kanban" || saved === "rematricula" || saved === "funil_estatisticas" || saved === "fichas" || saved === "disparos") {
        return saved as any;
      }
    }
    return "kanban";
  });
  const [rematriculaWhatsAppFreq, setRematriculaWhatsAppFreq] = useState<"diario" | "3_dias" | "semanal" | "quinzenal" | "inteligente">(() => {
    return (localStorage.getItem("rematricula_crm_whatsapp_freq") as any) || "3_dias";
  });
  const [rematriculaAutoSendEnabled, setRematriculaAutoSendEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("rematricula_crm_auto_send_enabled");
    return saved !== null ? saved === "true" : true;
  });
  const [logType, setLogType] = useState<"individual" | "coletivo">("individual");
  const [selectedBulkLogStudentIds, setSelectedBulkLogStudentIds] = useState<string[]>([]);
  const [isPublishingLog, setIsPublishingLog] = useState<boolean>(false);
  const [publishLogSuccess, setPublishLogSuccess] = useState<boolean>(false);
  const [publishedDocInfo, setPublishedDocInfo] = useState<{ id: string; name: string } | null>(null);
  const [showLtvConfigInRematricula, setShowLtvConfigInRematricula] = useState<boolean>(false);
  const [showPipelineAlertsInRematricula, setShowPipelineAlertsInRematricula] = useState<boolean>(true);
  const [lastPipelineTransition, setLastPipelineTransition] = useState<{
    studentName: string;
    stageTo: string;
    timestamp: string;
  } | null>(() => {
    try {
      const logs = localStorage.getItem("crm_pipeline_transition_logs");
      if (logs) {
        const parsed = JSON.parse(logs);
        if (parsed && parsed.length > 0) {
          const first = parsed[0];
          const stageMap: Record<string, string> = {
            concluido: "Contrato Aceito",
            em_analise: "Em Negociação",
            pendente: "Pendente"
          };
          return {
            studentName: first.studentName,
            stageTo: stageMap[first.stageTo] || first.stageTo,
            timestamp: first.dateFormatted || "Recente"
          };
        }
      }
    } catch (e) {
      // ignore
    }
    return {
      studentName: "Nicolas Silva",
      stageTo: "Contrato Aceito",
      timestamp: "Hoje às 10:42"
    };
  });
  const [activeMenuDay, setActiveMenuDay] = useState<"segunda" | "terca" | "quarta" | "quinta" | "sexta">("segunda");
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [weeklyMenu, setWeeklyMenu] = useState<Record<string, { lunch: string; snack: string }>>({
    "segunda": { lunch: "Espaguete à Bolonhesa caseiro, cenouras cozidas no vapor e purê rústico de batatas.", snack: "Salada de frutas tropicais (manga, banana, maçã) com mel e aveia." },
    "terca": { lunch: "Arroz integral, feijão preto temperado, tirinhas de frango grelhado e brócolis cozido.", snack: "Iogurte de morango fresco com aveia e biscoito de polvilho assado." },
    "quarta": { lunch: "Risoto de legumes (cenoura, ervilha e milho), cubinhos de carne magra e salada de tomate.", snack: "Pão de queijo quentinho com suco de uva integral." },
    "quinta": { lunch: "Feijoada light escolar, arroz branco, couve refogada e rodelas de laranja.", snack: "Sanduíche natural de frango com requeijão e suco de maracujá." },
    "sexta": { lunch: "Nhoque artesanal ao molho de tomate fresco, almôndegas assadas e mix de folhas verdes.", snack: "Bolo simples de cenoura fofinho feito na escola com chá de camomila." }
  });

  // --- AI PEDAGOGICAL REPORT (PARECER IA) STATE ---
  const [parecerStudentId, setParecerStudentId] = useState<string>("est-1");
  const [parecerFocusArea, setParecerFocusArea] = useState<string>("Desenvolvimento Geral (Cognitivo, Socioemocional e Rotina)");
  const [parecerTone, setParecerTone] = useState<string>("Acolhedor & Empático");
  const [generatedParecer, setGeneratedParecer] = useState<string>("");
  const [isGeneratingParecer, setIsGeneratingParecer] = useState<boolean>(false);

  const handleExportMetricsCSV = () => {
    const data7d = [
      { name: "14/07", leitura: 58, interacoes: 45, enviados: 3, status: "Abaixo" },
      { name: "15/07", leitura: 64, interacoes: 52, enviados: 4, status: "Regular" },
      { name: "16/07", leitura: 61, interacoes: 48, enviados: 2, status: "Regular" },
      { name: "17/07", leitura: 70, interacoes: 78, enviados: 5, status: "Excelente" },
      { name: "18/07", leitura: 73, interacoes: 92, enviados: 3, status: "Excelente" },
      { name: "19/07", leitura: 68, interacoes: 85, enviados: 2, status: "Bom" },
      { name: "20/07", leitura: 78, interacoes: 112, enviados: 4, status: "Excelente" },
    ];

    const data30d = [
      { name: "22/06", leitura: 55, interacoes: 120, enviados: 10, status: "Abaixo" },
      { name: "25/06", leitura: 59, interacoes: 140, enviados: 12, status: "Regular" },
      { name: "28/06", leitura: 62, interacoes: 135, enviados: 8, status: "Regular" },
      { name: "01/07", leitura: 60, interacoes: 155, enviados: 15, status: "Regular" },
      { name: "04/07", leitura: 64, interacoes: 172, enviados: 11, status: "Bom" },
      { name: "07/07", leitura: 63, interacoes: 180, enviados: 9, status: "Bom" },
      { name: "10/07", leitura: 67, interacoes: 210, enviados: 14, status: "Bom" },
      { name: "13/07", leitura: 65, interacoes: 198, enviados: 10, status: "Bom" },
      { name: "16/07", leitura: 68, interacoes: 230, enviados: 13, status: "Excelente" },
      { name: "20/07", leitura: 78, interacoes: 280, enviados: 16, status: "Excelente" },
    ];

    const data90d = [
      { name: "Sem 1", leitura: 52, interacoes: 350, enviados: 22, status: "Abaixo" },
      { name: "Sem 2", leitura: 54, interacoes: 380, enviados: 25, status: "Abaixo" },
      { name: "Sem 3", leitura: 56, interacoes: 410, enviados: 28, status: "Regular" },
      { name: "Sem 4", leitura: 55, interacoes: 390, enviados: 20, status: "Regular" },
      { name: "Sem 5", leitura: 58, interacoes: 430, enviados: 24, status: "Regular" },
      { name: "Sem 6", leitura: 60, interacoes: 460, enviados: 31, status: "Bom" },
      { name: "Sem 7", leitura: 61, interacoes: 480, enviados: 29, status: "Bom" },
      { name: "Sem 8", leitura: 63, interacoes: 510, enviados: 26, status: "Bom" },
      { name: "Sem 9", leitura: 64, interacoes: 540, enviados: 32, status: "Bom" },
      { name: "Sem 10", leitura: 66, interacoes: 580, enviados: 30, status: "Excelente" },
      { name: "Sem 11", leitura: 68, interacoes: 610, enviados: 27, status: "Excelente" },
      { name: "Sem 12", leitura: 72, interacoes: 690, enviados: 35, status: "Excelente" },
    ];

    const currentData = metricsTrendRange === "7d" ? data7d : metricsTrendRange === "30d" ? data30d : data90d;

    // Use semicolon separation for typical Excel compatibility in PT-BR environments
    const headers = "Data/Intervalo;Taxa de Leitura (%);Interações (Likes + Comentários);Comunicados Enviados;Status Geral\n";
    const rows = currentData
      .map(
        (item) =>
          `"${item.name}";"${item.leitura}%";"${item.interacoes}";"${item.enviados}";"${item.status}"`
      )
      .join("\n");

    const csvContent = "\uFEFF" + headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_engajamento_${metricsTrendRange}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [studentClinicalNotes, setStudentClinicalNotes] = useState<Record<string, {
    allergies: string[];
    dietaryRestrictions: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    bloodType: string;
    medsAuthorized: boolean;
  }>>({
    "est-1": {
      allergies: ["Paracetamol (sensibilidade)", "Frutos do Mar"],
      dietaryRestrictions: "Evitar alimentos com excesso de corantes artificiais.",
      emergencyContactName: "Mariana Silva (Mãe)",
      emergencyContactPhone: "(11) 98888-1234",
      bloodType: "O+",
      medsAuthorized: true
    },
    "est-2": {
      allergies: ["Lactose (intolerância leve)", "Picada de Abelha"],
      dietaryRestrictions: "Consumir papinhas bem amassadas, sem pedaços grandes.",
      emergencyContactName: "Mariana Silva (Mãe)",
      emergencyContactPhone: "(11) 98888-1234",
      bloodType: "A+",
      medsAuthorized: false
    }
  });

  const [studentCrmNotes, setStudentCrmNotes] = useState<Record<string, {
    historyLogs: Array<{ date: string; note: string; author: string }>;
    nextFollowUpDate: string;
    parentSentiment: "positivo" | "indeciso" | "preocupado" | "indiferente";
    financialAgreement?: string;
  }>>({
    "est-1": {
      historyLogs: [
        { date: "01/07/2026", note: "Conversado com a mãe. Ela informou que pretende renovar mas solicitou desconto na taxa de material.", author: "Clara (Comercial)" },
        { date: "03/07/2026", note: "Enviado cupom de 5% de desconto promocional para fechamentos na primeira quinzena de Julho.", author: "Clara (Comercial)" }
      ],
      nextFollowUpDate: "10/07/2026",
      parentSentiment: "indeciso",
      financialAgreement: "Bolsa Pontualidade 5%"
    },
    "est-2": {
      historyLogs: [
        { date: "25/06/2026", note: "Mãe confirmou rematrícula com imenso entusiasmo! Disse estar extremamente satisfeita com o berçário.", author: "Coord. Mariana" }
      ],
      nextFollowUpDate: "--",
      parentSentiment: "positivo",
      financialAgreement: "Tabela Padrão"
    }
  });

  const [newAllergy, setNewAllergy] = useState("");
  const [editingClinicalId, setEditingClinicalId] = useState<string | null>(null);
  const [newCrmLogText, setNewCrmLogText] = useState("");
  const [selectedSentiment, setSelectedSentiment] = useState<"positivo" | "indeciso" | "preocupado" | "indiferente">("indeciso");
  const [nextFollowUpDateInput, setNextFollowUpDateInput] = useState("");

  // Student Retention Mastery Custom Thresholds
  const [retentionMasteryThresholds, setRetentionMasteryThresholds] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("school_retention_mastery_thresholds");
      return saved ? JSON.parse(saved) : { default: 100000 };
    } catch {
      return { default: 100000 };
    }
  });
  const [isRetentionMasteryConfigOpen, setIsRetentionMasteryConfigOpen] = useState(false);
  const [retentionMasteryInputVal, setRetentionMasteryInputVal] = useState<string>("");
  const [isLtvSparklineExpanded, setIsLtvSparklineExpanded] = useState(false);
  const [ltvSparklineZoom, setLtvSparklineZoom] = useState<number>(6);

  useEffect(() => {
    const handleOpenLtvMasteryModal = () => {
      setIsRetentionMasteryConfigOpen(true);
      setActiveModalFocus("ltv_config");
    };
    const handleOpenMonthlyReportModal = () => {
      setIsMonthlyReportModalOpen(true);
      setActiveModalFocus("financial_report");
    };
    window.addEventListener("open_ltv_mastery_modal", handleOpenLtvMasteryModal);
    window.addEventListener("open_monthly_financial_report_modal", handleOpenMonthlyReportModal);
    return () => {
      window.removeEventListener("open_ltv_mastery_modal", handleOpenLtvMasteryModal);
      window.removeEventListener("open_monthly_financial_report_modal", handleOpenMonthlyReportModal);
    };
  }, []);


  // Daily Summary Broadcaster States
  const [isDailySummaryModalOpen, setIsDailySummaryModalOpen] = useState(false);
  const [isDailySummarySending, setIsDailySummarySending] = useState(false);
  const [dailySummarySent, setDailySummarySent] = useState(false);
  const [dailySummarySendingStep, setDailySummarySendingStep] = useState<string>("");

  // White-label Customization State (dynamic preset customizer)
  const [branding, setBranding] = useState<SchoolBranding>(() => {
    try {
      const cached = localStorage.getItem("magic_school_branding");
      if (cached) {
        const parsed = JSON.parse(cached);
        const defaults = getDefaultBranding();
        return {
          ...defaults,
          ...parsed,
          enabledModules: {
            ...defaults.enabledModules,
            ...(parsed.enabledModules || {})
          },
          feedModuleOrder: parsed.feedModuleOrder && parsed.feedModuleOrder.length > 0
            ? parsed.feedModuleOrder
            : defaults.feedModuleOrder
        };
      }
    } catch (e) {
      console.error("Error reading saved branding", e);
    }
    return getDefaultBranding();
  });

  // Apply Orlando Magic theme CSS variables dynamically
  useEffect(() => {
    applyBrandingToCssVariables(branding);
  }, [branding]);

  // White-label Customizer Modal state (closed by default; accessible via Settings and Customizer buttons)
  const [isWhiteLabelModalOpen, setIsWhiteLabelModalOpen] = useState(false);

  // Custom branding customizer sidebar toggle
  const [showBrandingPanel, setShowBrandingPanel] = useState(false);
  
  // Dynamic Mastery Badge Threshold Configuration
  const [masteryThreshold, setMasteryThreshold] = useState<number>(9.5);
  const [masteryInputVal, setMasteryInputVal] = useState<string>("9.5");
  const [masteryInputError, setMasteryInputError] = useState<string | null>(null);
  
  // Custom sub-view for landing: "site" (the landing page itself) vs "portais" (portal entry selection)
  const [landingSubView, setLandingSubView] = useState<"site" | "portais">("site");

  // Smooth instant navigation transition
  const [magicTransitionActive, setMagicTransitionActive] = useState(false);
  const [magicTransitionType, setMagicTransitionType] = useState<"spell_sweep" | "sparkle_flash" | "dust_burst">("spell_sweep");

  const triggerMagicalTransition = (action: () => void) => {
    // Instant execution to prevent UI freezing and provide snappy, professional responsiveness
    action();
  };

  const changeUserRoleWithMagic = (newRole: "landing" | "pais" | "escola" | "aluno") => {
    setUserRole(newRole);
  };

  // Secure User Logout Handler (Firebase Authentication + State Reset)
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Erro ao encerrar sessão no Firebase Auth:", err);
    }
    setUserProfile(null);
    setShowAuthSection(false);
    setIsProfileModalOpen(false);
    setSidebarOpen(false);
    triggerMagicalTransition(() => {
      setUserRole("landing");
      setLandingSubView("site");
    });
    setToast({
      message: "Sessão encerrada com sucesso. Até logo!",
      type: "info"
    });
  };

  // Navigation State History Controller (True router-level back history tracking)
  interface NavigationHistoryItem {
    userRole: "landing" | "pais" | "escola" | "aluno";
    landingSubView: "site" | "portais";
    showAuthSection: boolean;
    activeTab: "dashboard" | "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso" | "premium_hub" | "perfil";
    schoolActiveTab: "dashboard" | "agenda" | "retiradas" | "comunicados" | "erp" | "alunos" | "metricas" | "planejador" | "premium_hub" | "benchmarking" | "perfil" | "moderacao";
    studentActiveTab: "simplificada" | "dashboard" | "horarios" | "tarefas" | "conquistas" | "completa";
  }

  const [navigationHistory, setNavigationHistory] = useState<NavigationHistoryItem[]>([]);
  const isNavigatingBackRef = React.useRef(false);

  useEffect(() => {
    if (isNavigatingBackRef.current) {
      isNavigatingBackRef.current = false;
      return;
    }

    const state: NavigationHistoryItem = {
      userRole,
      landingSubView,
      showAuthSection,
      activeTab,
      schoolActiveTab,
      studentActiveTab,
    };

    setNavigationHistory((prev) => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        if (
          last.userRole === state.userRole &&
          last.landingSubView === state.landingSubView &&
          last.showAuthSection === state.showAuthSection &&
          last.activeTab === state.activeTab &&
          last.schoolActiveTab === state.schoolActiveTab &&
          last.studentActiveTab === state.studentActiveTab
        ) {
          return prev;
        }
      }
      return [...prev.slice(-29), state];
    });
  }, [userRole, landingSubView, showAuthSection, activeTab, schoolActiveTab, studentActiveTab]);

  const handleGoBack = () => {
    if (navigationHistory.length <= 1) {
      if (userRole !== "landing" || landingSubView !== "site") {
        triggerMagicalTransition(() => {
          setUserRole("landing");
          setLandingSubView("site");
          setShowAuthSection(false);
        });
      }
      return;
    }

    isNavigatingBackRef.current = true;
    const historyCopy = [...navigationHistory];
    historyCopy.pop(); // Pop current state
    const previousState = historyCopy[historyCopy.length - 1];

    triggerMagicalTransition(() => {
      setUserRole(previousState.userRole);
      setLandingSubView(previousState.landingSubView);
      setShowAuthSection(previousState.showAuthSection);
      setActiveTab(previousState.activeTab);
      setSchoolActiveTab(previousState.schoolActiveTab);
      setStudentActiveTab(previousState.studentActiveTab);
      setNavigationHistory(historyCopy);
    });
  };

  // Synchronize browser history and popstate for true fluid back-forward navigation
  useEffect(() => {
    const handlePopState = () => {
      handleGoBack();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigationHistory]);

  // Synchronize browser history entry
  useEffect(() => {
    if (!isNavigatingBackRef.current && typeof window !== "undefined" && window.history) {
      try {
        window.history.pushState({ step: navigationHistory.length }, "");
      } catch (err) {
        // Safe fallback
      }
    }
  }, [navigationHistory.length]);

  // Keyboard shortcut: Alt + ArrowLeft to navigate back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handleGoBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigationHistory, userRole, showAuthSection]);

  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeActiveTabWithMagic = (newTab: "dashboard" | "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso" | "premium_hub" | "perfil") => {
    triggerMagicalTransition(() => setActiveTab(newTab));
    if (newTab === "cobrancas") {
      trackUserActivity({
        userId: "user-current",
        role: "pais",
        type: "view_invoice",
        title: "Acessou Painel Financeiro & Boletos Pix",
        entityTitle: "Faturas do Semestre",
      });
    } else if (newTab === "academico") {
      trackUserActivity({
        userId: "user-current",
        role: "pais",
        type: "view_report_card",
        title: "Consultou Boletim Escolar & Notas",
        entityTitle: "Desempenho Bimestral",
      });
    } else if (newTab === "diaadia") {
      trackUserActivity({
        userId: "user-current",
        role: "pais",
        type: "view_routine",
        title: "Consultou Diário de Rotina e Refeições",
        entityTitle: "Rotina da Sala",
      });
    } else if (newTab === "comunicados") {
      trackUserActivity({
        userId: "user-current",
        role: "pais",
        type: "view_announcement",
        title: "Acessou Mural de Comunicados",
        entityTitle: "Comunicados Escolares",
      });
    } else if (newTab === "acesso") {
      trackUserActivity({
        userId: "user-current",
        role: "pais",
        type: "view_gatekeeper",
        title: "Acessou Portaria & Autorizações de Retirada",
        entityTitle: "Pessoas Autorizadas",
      });
    }
  };

  const changeSchoolActiveTabWithMagic = (newTab: "dashboard" | "agenda" | "retiradas" | "comunicados" | "erp" | "alunos" | "metricas" | "planejador" | "premium_hub" | "benchmarking" | "perfil") => {
    triggerMagicalTransition(() => setSchoolActiveTab(newTab));
    if (newTab === "erp") {
      trackUserActivity({
        userId: "user-current",
        role: "escola",
        type: "view_erp",
        title: "Acessou Painel de Integração ERP & Régua WhatsApp",
        entityTitle: "Sincronização ERP",
      });
    } else if (newTab === "alunos") {
      trackUserActivity({
        userId: "user-current",
        role: "escola",
        type: "view_student_crm",
        title: "Consultou Base de Alunos & Funil de Retenção",
        entityTitle: "Gestão de Estudantes",
      });
    } else if (newTab === "metricas") {
      trackUserActivity({
        userId: "user-current",
        role: "escola",
        type: "view_metrics",
        title: "Consultou BI & Desempenho Pedagógico",
        entityTitle: "Gráficos de Correlação",
      });
    } else if (newTab === "planejador") {
      trackUserActivity({
        userId: "user-current",
        role: "escola",
        type: "view_planner",
        title: "Acessou Grade Curricular e Horários",
        entityTitle: "Planejador de Turmas",
      });
    } else if (newTab === "retiradas") {
      trackUserActivity({
        userId: "user-current",
        role: "escola",
        type: "view_gatekeeper",
        title: "Acessou Portaria & Fila de Retiradas",
        entityTitle: "Controle de Portaria",
      });
    }
  };

  const changeLandingSubViewWithMagic = (newSubView: "site" | "portais") => {
    triggerMagicalTransition(() => setLandingSubView(newSubView));
  };

  // Selected FAQ Category & FAQ Search Query for improved Parent communication
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<"todos" | "financeiro" | "academico" | "portaria">("todos");
  const [faqSearchQuery, setFaqSearchQuery] = useState("");

  // New authorized person form
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonRelationship, setNewPersonRelationship] = useState("Parente");
  const [newPersonRg, setNewPersonRg] = useState("");

  // User Authentication & Firestore Synced Profile
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileModalInitialSection, setProfileModalInitialSection] = useState<
    "info" | "achievements" | "activity" | "settings" | "security" | "students"
  >("info");
  const [authSectionInitialGate, setAuthSectionInitialGate] = useState<"escola" | "pais">("escola");
  const [authSectionInitialTab, setAuthSectionInitialTab] = useState<"login" | "signup" | "recover" | "emailConfirm" | "redefine">("login");

  // Local Offline fallback saved states
  const [localSavedComms, setLocalSavedComms] = useState<string[]>([]);
  const [localSavedMoms, setLocalSavedMoms] = useState<string[]>([]);

  // Theme state: "system" | "light" | "dark"
  // Default is ALWAYS "system" (6h às 18h claro, 18h às 6h escuro)
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    return getStoredThemePreference();
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return isNightTimeSchedule();
  });

  // Calculate if the active view should be dark mode:
  // "system" strictly follows 6h-18h claro, 18h-6h escuro
  const isDarkMode = themePreference === "system" ? systemIsDark : themePreference === "dark";

  // Setter function backwards-compatible with all components and toggles
  const setIsDarkMode = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextDark = typeof val === "function" ? val(isDarkMode) : val;
    const nextPref: ThemePreference = nextDark ? "dark" : "light";
    setThemePreference(nextPref);
    setStoredThemePreference(nextPref);
  };

  const handleSetThemePreference = (pref: ThemePreference) => {
    setThemePreference(pref);
    setStoredThemePreference(pref);
    if (pref === "system") {
      setSystemIsDark(isNightTimeSchedule());
    }
  };

  useEffect(() => {
    const updateTheme = () => {
      setSystemIsDark(isNightTimeSchedule());
    };
    updateTheme(); // Initial check
    // Re-check every 30 seconds so transition across 6h or 18h happens smoothly
    const interval = setInterval(updateTheme, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Locale State: "pt" | "en" | "es" | "fr" | "ja" | "de" | "zh" | "ar" | "it" | "ru" | "ko" | "hi"
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    return getStoredLocale();
  });

  const handleSetLocale = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    setStoredLocale(newLocale);
  };

  // Calculate descriptive back label dynamically
  const previousState = navigationHistory.length > 1 ? navigationHistory[navigationHistory.length - 2] : null;
  const previousBackLabel = React.useMemo(() => {
    if (!previousState) {
      return userRole === "landing" ? "Início" : "Site Institucional";
    }
    if (previousState.userRole === "landing") {
      return "Site Institucional";
    }
    if (previousState.userRole === "pais") {
      return getTabLabel("pais", previousState.activeTab, locale) || "Painel da Família";
    }
    if (previousState.userRole === "escola") {
      return getTabLabel("escola", previousState.schoolActiveTab, locale) || "Painel da Escola";
    }
    if (previousState.userRole === "aluno") {
      return "Início do Aluno";
    }
    return "Voltar";
  }, [previousState, userRole, locale]);

  // Simulated call state
  const [simulatedCallStudent, setSimulatedCallStudent] = useState<Estudante | null>(null);
  const [simulatedCallTime, setSimulatedCallTime] = useState<number>(0);
  const [isSimulatedCallMuted, setIsSimulatedCallMuted] = useState<boolean>(false);
  const [isSimulatedSpeakerOn, setIsSimulatedSpeakerOn] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (simulatedCallStudent) {
      setSimulatedCallTime(0);
      interval = setInterval(() => {
        setSimulatedCallTime((prev) => prev + 1);
      }, 1000);
    } else {
      setSimulatedCallTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulatedCallStudent]);

  useEffect(() => {
    localStorage.setItem("school_portal_dark_mode", String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Apply sensory preferences as HTML classes for unified global behaviors
  useEffect(() => {
    const root = document.documentElement;
    if (sensoryHapticsEnabled) {
      root.classList.add("sensory-haptics-active");
    } else {
      root.classList.remove("sensory-haptics-active");
    }
  }, [sensoryHapticsEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    if (sensoryFocusGlowEnabled) {
      root.classList.add("sensory-focus-glow-active");
    } else {
      root.classList.remove("sensory-focus-glow-active");
    }
  }, [sensoryFocusGlowEnabled]);

  // Apply High Contrast Accessibility class to document root & body
  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add("high-contrast");
      document.body.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
      document.body.classList.remove("high-contrast");
    }
    localStorage.setItem("school_high_contrast", String(isHighContrast));
  }, [isHighContrast]);

  // Guided tour is triggered on-demand via the Help Center or button, avoiding disruptive popups on page open
  const handleCloseTour = () => {
    setIsTourOpen(false);
    localStorage.setItem("magic_learning_parent_tour_completed", "true");
  };

  // ⌨️ Keyboard shortcut listener for 'M' key to toggle sidebar menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "m" || e.key === "M") {
        const activeElement = document.activeElement;
        const isInput = activeElement && (
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          (activeElement as HTMLElement).isContentEditable
        );
        if (!isInput) {
          e.preventDefault();
          setSidebarOpen(prev => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Live Chat and Reminders States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("school_chat_messages");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "msg-1",
        sender: "secretaria",
        text: "Olá! Seja bem-vindo ao Atendimento Digital da Escola. Como podemos te ajudar hoje com suas dúvidas, entregas de materiais ou agendamentos?",
        timestamp: Date.now() - 3600000 * 2 // 2 hours ago
      }
    ];
  });

  const [reminders, setReminders] = useState<ScheduledReminder[]>(() => {
    const saved = localStorage.getItem("school_scheduled_reminders");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "rem-1",
        studentId: "est-1",
        studentName: "Davi de Oliveira",
        title: "Entrega da maquete de Ciências",
        type: "material",
        date: "2026-06-25",
        time: "07:30",
        notes: "Levar papel paraná e guache verde para o saguão principal",
        active: true
      },
      {
        id: "rem-2",
        studentId: "est-1",
        studentName: "Davi de Oliveira",
        title: "Reunião Individual com Professora Helena",
        type: "reuniao",
        date: "2026-06-28",
        time: "14:30",
        notes: "Saguão do Bloco B - de volta com as lições do 2º bimestre",
        active: true
      }
    ];
  });

  const [comSubTab, setComSubTab] = useState<"mural" | "chat" | "lembretes">("mural");
  const [chatInput, setChatInput] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderType, setReminderType] = useState<"material" | "reuniao" | "outro">("material");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderNotes, setReminderNotes] = useState("");
  const [bulkNotificationType, setBulkNotificationType] = useState<"material" | "atraso">("material");
  const [bulkNotes, setBulkNotes] = useState("");
  const [billingFilter, setBillingFilter] = useState<"all" | "pending" | "urgente">("all");

  // Simulated Push Notification states
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activePushBanner, setActivePushBanner] = useState<NotificationItem | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [isPushPreferencesOpen, setIsPushPreferencesOpen] = useState(false);
  const [notifDropdownCategory, setNotifDropdownCategory] = useState<"todos" | "mensagens" | "prazos" | "promocoes" | "financeiro">("todos");
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [dicasFinanceirasOpen, setDicasFinanceirasOpen] = useState(false);
  const [shakeBell, setShakeBell] = useState(false);
  const [crmQuickRemindersModalOpen, setCrmQuickRemindersModalOpen] = useState(false);

  // Quick Action Forms inside #btn-navbar-notifications modal
  const [quickNotificationForm, setQuickNotificationForm] = useState<null | "push" | "cobranca" | "erp_test" | "rematricula_push">(null);
  const [isTestingErpConnectivity, setIsTestingErpConnectivity] = useState(false);
  const [isReconnectingErp, setIsReconnectingErp] = useState(false);
  const [erpConnectionFailed, setErpConnectionFailed] = useState(false);
  const [hoveredErpLogId, setHoveredErpLogId] = useState<string | null>(null);

  // States for Rematrícula Push Notifications Configuration
  const [crmPushReminderDaysRaw, setCrmPushReminderDaysRaw] = useState<string>(() => {
    const saved = localStorage.getItem("crmWaReminderDays");
    return saved || "3";
  });
  const [crmPushReminderDaysError, setCrmPushReminderDaysError] = useState<string>("");
  const [crmPushEnabled, setCrmPushEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("crm_pipeline_push_alerts_enabled");
    return saved !== null ? saved === "true" : true;
  });
  const [crmPushHour, setCrmPushHour] = useState<string>(() => {
    return localStorage.getItem("crm_push_reminder_hour") || "09:00";
  });
  const [crmPushTargetStage, setCrmPushTargetStage] = useState<"pendente" | "em_analise" | "todos">(() => {
    return (localStorage.getItem("crm_push_target_stage") as any) || "pendente";
  });
  const [isSendingTestRematriculaPush, setIsSendingTestRematriculaPush] = useState(false);

  const validateAndUpdateCrmPushReminderDays = (inputVal: string) => {
    setCrmPushReminderDaysRaw(inputVal);
    if (inputVal.trim() === "") {
      setCrmPushReminderDaysError("O número de dias de antecedência não pode ficar em branco.");
      return;
    }
    const num = Number(inputVal);
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 30) {
      setCrmPushReminderDaysError("⚠️ O número de dias de antecedência para rematrícula deve ser um valor inteiro positivo entre 1 e 30 dias.");
    } else {
      setCrmPushReminderDaysError("");
      setCrmWaReminderDays(num);
      localStorage.setItem("crmWaReminderDays", String(num));
    }
  };
  const [erpSyncHistoryLogs, setErpSyncHistoryLogs] = useState<Array<{
    id: string;
    time: string;
    status: "success" | "error";
    title: string;
    details: string;
    latency: string;
    payload: Record<string, any>;
  }>>([
    {
      id: "hs-105",
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "success",
      title: "Handshake Automatizado",
      details: "Gateway ERP: Resposta 200 OK",
      latency: "24ms",
      payload: { status: 200, event: "handshake.autoverify", erp: "ASAAS", signature_valid: true, webhook_id: "wh_991823", mode: "realtime" }
    },
    {
      id: "hs-104",
      time: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "success",
      title: "Validação de Payload",
      details: "Fatura FAT-2026-9921 parsed e validada",
      latency: "18ms",
      payload: { status: 200, event: "invoice.parsed", invoice_id: "FAT-2026-9921", amount: 1450.00, pix_qr: "00020126580014BR.GOV.BCB.PIX...", whatsapp_queue: "DISPATCHED" }
    },
    {
      id: "hs-103",
      time: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "success",
      title: "Sincronização de Tokens",
      details: "Token Bearer renovado com sucesso",
      latency: "31ms",
      payload: { status: 200, event: "token.refresh", auth_type: "Bearer JWT", expires_in: "24h", status_code: "HEALTHY" }
    },
    {
      id: "hs-102",
      time: new Date(Date.now() - 1000 * 60 * 90).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "success",
      title: "Ping de Conectividade",
      details: "Endpoint /api/webhooks/erp/invoice OK",
      latency: "12ms",
      payload: { status: 200, event: "ping", endpoint: "/api/webhooks/erp/invoice", ssl: "TLS_1_3", tls_cipher: "AES_256_GCM" }
    },
    {
      id: "hs-101",
      time: new Date(Date.now() - 1000 * 60 * 180).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      status: "success",
      title: "Abertura de Sessão ERP",
      details: "Conexão inicial estabelecida",
      latency: "42ms",
      payload: { status: 200, event: "session.open", erp_version: "v2.4", tenant_id: "tenant_esc_9012", active_triggers: ["invoice.created", "payment.confirmed"] }
    },
  ]);
  const [erpTestSteps, setErpTestSteps] = useState<string[]>([]);
  const [quickPushTitle, setQuickPushTitle] = useState("");
  const [quickPushMessage, setQuickPushMessage] = useState("");
  const [quickPushStudent, setQuickPushStudent] = useState("Todos os Alunos");
  const [quickPushCategory, setQuickPushCategory] = useState<"comunicado" | "occurrence" | "chat" | "faturamento">("comunicado");

  const [quickCobrancaId, setQuickCobrancaId] = useState("");
  const [quickCobrancaChannel, setQuickCobrancaChannel] = useState<"whatsapp" | "email" | "sms" | "ambos">("whatsapp");
  const [quickCobrancaNote, setQuickCobrancaNote] = useState("");
  const [quickCobrancaSubTab, setQuickCobrancaSubTab] = useState<"imediato" | "regua_erp">("imediato");
  const [quickReminderDaysBefore, setQuickReminderDaysBefore] = useState<number>(() => {
    const saved = localStorage.getItem("erp_auto_reminder_days_before");
    const parsed = saved ? parseInt(saved, 10) : 5;
    return isNaN(parsed) || parsed < 1 || parsed > 30 ? 5 : parsed;
  });
  const [quickReminderDaysRaw, setQuickReminderDaysRaw] = useState<string>(() => {
    const saved = localStorage.getItem("erp_auto_reminder_days_before");
    return saved || "5";
  });
  const [quickReminderDaysError, setQuickReminderDaysError] = useState<string>("");

  const validateAndUpdateQuickReminderDays = (inputVal: string) => {
    setQuickReminderDaysRaw(inputVal);
    if (inputVal.trim() === "") {
      setQuickReminderDaysError("O número de dias de antecedência não pode ficar em branco.");
      return;
    }
    const num = Number(inputVal);
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 30) {
      setQuickReminderDaysError("⚠️ O número de dias de antecedência deve ser um valor inteiro positivo entre 1 e 30 dias.");
    } else {
      setQuickReminderDaysError("");
      setQuickReminderDaysBefore(num);
      localStorage.setItem("erp_auto_reminder_days_before", String(num));
    }
  };

  const [quickAutoReminderEnabled, setQuickAutoReminderEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_auto_reminder_5d_enabled");
    return val === null ? true : val === "true";
  });
  const [quickReminderTime, setQuickReminderTime] = useState<string>(() => {
    return localStorage.getItem("erp_auto_reminder_time") || "09:00";
  });

  // Helper to find the next upcoming invoice by due date
  const getNextUpcomingInvoice = (items: Cobranca[] = cobrancas): Cobranca | null => {
    const parseBrDate = (d?: string) => {
      if (!d) return 0;
      const parts = d.split("/").map(Number);
      return new Date(parts[2] || 2026, (parts[1] || 1) - 1, parts[0] || 1).getTime();
    };
    const pending = items
      .filter(c => c.status === "pendente")
      .sort((a, b) => parseBrDate(a.dueDate) - parseBrDate(b.dueDate));
    if (pending.length > 0) return pending[0];
    const vencidos = items.filter(c => c.status === "vencido");
    if (vencidos.length > 0) return vencidos[0];
    return items[0] || null;
  };

  // Invoice-scoped WhatsApp Reminder Modal
  const [isInvoiceReminderModalOpen, setIsInvoiceReminderModalOpen] = useState(false);
  const [selectedInvoiceForReminder, setSelectedInvoiceForReminder] = useState<Cobranca | null>(() => {
    return getNextUpcomingInvoice(initialCobrancas);
  });

  const handleOpenInvoiceReminderModal = (invoice?: Cobranca | null) => {
    if (invoice) {
      setSelectedInvoiceForReminder(invoice);
    } else {
      const upcoming = cobrancas.find(c => c.status === "pendente") || getNextUpcomingInvoice(cobrancas);
      setSelectedInvoiceForReminder(upcoming);
    }
    setIsInvoiceReminderModalOpen(true);
  };

  // Determine if any invoice reminder is currently due or impending (pending/vencido)
  const isInvoiceReminderDue = useMemo(() => {
    return cobrancas.some(c => c.status === "pendente" || c.status === "vencido");
  }, [cobrancas]);

  // Quick-Peek Tooltip hover state for #btn-quick-charge-reminder
  const [isHoveringInvoiceReminder, setIsHoveringInvoiceReminder] = useState(false);
  const invoiceHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInvoiceReminderMouseEnter = () => {
    if (invoiceHoverTimeoutRef.current) {
      clearTimeout(invoiceHoverTimeoutRef.current);
      invoiceHoverTimeoutRef.current = null;
    }
    setIsHoveringInvoiceReminder(true);
  };

  const handleInvoiceReminderMouseLeave = () => {
    if (invoiceHoverTimeoutRef.current) {
      clearTimeout(invoiceHoverTimeoutRef.current);
    }
    invoiceHoverTimeoutRef.current = setTimeout(() => {
      setIsHoveringInvoiceReminder(false);
    }, 240);
  };

  // Notification Details Modal & Próximo Contato CRM state
  const [selectedNotificationDetail, setSelectedNotificationDetail] = useState<NotificationItem | null>(null);
  const [detailNextContactDate, setDetailNextContactDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [detailNextContactTime, setDetailNextContactTime] = useState("09:00");
  const [detailNextContactNote, setDetailNextContactNote] = useState("");

  const [quickNextContactDate, setQuickNextContactDate] = useState("");
  const [quickNextContactTime, setQuickNextContactTime] = useState("09:00");

  const handleOpenNotificationDetail = (notif: NotificationItem) => {
    setSelectedNotificationDetail(notif);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDetailNextContactDate(notif.nextCrmContactDate || tomorrow.toISOString().split("T")[0]);
    setDetailNextContactTime(notif.nextCrmContactTime || "09:00");
    setDetailNextContactNote(notif.nextCrmContactNote || `Olá! Lembrete de acompanhamento CRM referente a: "${notif.title}". Por favor, confirme o recebimento.`);
    
    // Mark notification as read
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notif.id ? { ...n, read: true } : n);
      try {
        localStorage.setItem("school_push_notifications", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleScheduleCrmFollowupWhatsapp = (
    notifTitle: string,
    studentName: string,
    targetDate: string,
    targetTime: string,
    noteText: string,
    notifId?: string
  ) => {
    if (!targetDate) {
      setToast({ message: "Por favor, selecione a data do 'Próximo Contato CRM'.", type: "error" });
      return;
    }

    const finalNote = noteText.trim() || `Lembrete de follow-up referente a: ${notifTitle}`;

    // 1. Create a scheduled item in CRM billing reminders store
    const newScheduledItem = {
      id: `sch-crm-${Date.now()}`,
      studentName: studentName || "Aluno",
      parentName: "Responsável",
      cobrancaTitle: `Follow-up CRM: ${notifTitle}`,
      amount: 0,
      scheduledDate: targetDate,
      scheduledTime: targetTime || "09:00",
      channel: "whatsapp" as const,
      customMessage: finalNote,
      status: "agendado" as const,
      createdAt: new Date().toLocaleDateString("pt-BR")
    };

    try {
      const existing = JSON.parse(localStorage.getItem("school_scheduled_billing_reminders") || "[]");
      localStorage.setItem("school_scheduled_billing_reminders", JSON.stringify([newScheduledItem, ...existing]));
    } catch (e) {}

    // 2. Update notification if notifId provided
    if (notifId) {
      setNotifications(prev => {
        const updated = prev.map(n => n.id === notifId ? {
          ...n,
          nextCrmContactDate: targetDate,
          nextCrmContactTime: targetTime || "09:00",
          nextCrmContactNote: finalNote
        } : n);
        try {
          localStorage.setItem("school_push_notifications", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      if (selectedNotificationDetail && selectedNotificationDetail.id === notifId) {
        setSelectedNotificationDetail(prev => prev ? {
          ...prev,
          nextCrmContactDate: targetDate,
          nextCrmContactTime: targetTime || "09:00",
          nextCrmContactNote: finalNote
        } : null);
      }
    }

    setToast({
      message: `📱 Lembrete de Follow-up WhatsApp agendado para ${targetDate} às ${targetTime || '09:00'}!`,
      type: "success"
    });

    // 3. Open WhatsApp Web with prefilled message
    const waSchool = branding?.schoolName || "Portal Escolar";
    const waText = encodeURIComponent(`*Lembrete de Follow-up CRM - ${waSchool}*\n\n📌 *Assunto:* ${notifTitle}\n👤 *Aluno:* ${studentName}\n📅 *Próximo Contato:* ${targetDate} às ${targetTime}\n💬 *Mensagem:* ${finalNote}`);
    window.open(`https://api.whatsapp.com/send?text=${waText}`, "_blank");
  };

  const handleSendQuickPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPushTitle.trim() || !quickPushMessage.trim()) {
      setToast({ message: "Por favor, preencha o título e a mensagem da notificação.", type: "error" });
      return;
    }

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: quickPushTitle.trim(),
      body: quickPushMessage.trim(),
      timestamp: Date.now(),
      read: false,
      studentName: quickPushStudent || "Todos os Alunos",
      targetTab: "comunicados",
      iconType: quickPushCategory as any,
      nextCrmContactDate: quickNextContactDate || undefined,
      nextCrmContactTime: quickNextContactTime || "09:00"
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      try {
        localStorage.setItem("school_push_notifications", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // If quickNextContactDate is filled, schedule the CRM follow-up via WhatsApp
    if (quickNextContactDate) {
      handleScheduleCrmFollowupWhatsapp(
        quickPushTitle.trim(),
        quickPushStudent || "Todos os Alunos",
        quickNextContactDate,
        quickNextContactTime || "09:00",
        `Aviso Push Disparado: ${quickPushMessage.trim()}`,
        newNotif.id
      );
    }

    setShakeBell(true);
    setTimeout(() => setShakeBell(false), 1200);

    setToast({ message: `📣 Notificação push enviada para: ${quickPushStudent}!`, type: "success" });
    setQuickPushTitle("");
    setQuickPushMessage("");
    setQuickNextContactDate("");
    setQuickNotificationForm(null);
  };

  const handleExecuteQuickCobranca = (e: React.FormEvent) => {
    e.preventDefault();
    const cobTarget = cobrancas.find(c => c.id === quickCobrancaId) || cobrancas[0];
    if (!cobTarget) {
      setToast({ message: "Selecione uma cobrança válida.", type: "error" });
      return;
    }

    const newScheduledItem = {
      id: `sch-${Date.now()}`,
      studentName: "Lucas Silva",
      parentName: "Responsável Financeiro",
      cobrancaTitle: cobTarget.title,
      amount: cobTarget.amount,
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: quickCobrancaChannel,
      customMessage: quickCobrancaNote.trim() || `Lembrete amigável referente à cobrança: ${cobTarget.title} (R$ ${cobTarget.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}).`,
      status: "enviado" as const,
      createdAt: new Date().toLocaleDateString("pt-BR")
    };

    try {
      const existing = JSON.parse(localStorage.getItem("school_scheduled_billing_reminders") || "[]");
      localStorage.setItem("school_scheduled_billing_reminders", JSON.stringify([newScheduledItem, ...existing]));
    } catch (e) {}

    // Add push notification as well
    const notifItem: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `⚡ Disparo Imediato: ${cobTarget.title}`,
      body: `Lembrete financeiro de R$ ${cobTarget.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} transmitido via ${quickCobrancaChannel.toUpperCase()}.`,
      timestamp: Date.now(),
      read: false,
      targetTab: "cobrancas",
      iconType: "faturamento" as any,
      nextCrmContactDate: quickNextContactDate || undefined,
      nextCrmContactTime: quickNextContactTime || "09:00"
    };

    setNotifications(prev => {
      const updated = [notifItem, ...prev];
      try {
        localStorage.setItem("school_push_notifications", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (quickNextContactDate) {
      handleScheduleCrmFollowupWhatsapp(
        `Cobrança ${cobTarget.title}`,
        "Lucas Silva",
        quickNextContactDate,
        quickNextContactTime || "09:00",
        `Acompanhamento de cobrança R$ ${cobTarget.amount.toFixed(2)}`,
        notifItem.id
      );
    }

    setToast({ message: `⚡ Execução imediata disparada para cobrança: ${cobTarget.title}!`, type: "success" });
    setQuickNextContactDate("");
    setQuickNotificationForm(null);
  };

  // Photos of the Day states
  const [classroomPhotos, setClassroomPhotos] = useState<ClassroomPhoto[]>([]);
  const [selectedClassroomPhoto, setSelectedClassroomPhoto] = useState<ClassroomPhoto | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<ClassroomPhoto | null>(null);

  const handleConfirmDeletePhoto = () => {
    if (!photoToDelete) return;
    const id = photoToDelete.id;
    const updated = classroomPhotos.filter(p => p.id !== id);
    setClassroomPhotos(updated);
    localStorage.setItem("school_classroom_photos", JSON.stringify(updated));

    if (selectedClassroomPhoto?.id === id) {
      setSelectedClassroomPhoto(null);
    }
    if (portfolioLightboxPhoto?.id === id) {
      setPortfolioLightboxPhoto(null);
    }

    setPhotoToDelete(null);
    setToast({
      message: "🗑️ Foto removida da galeria com sucesso!",
      type: "success"
    });
  };

  // Student Portfolio gallery states
  const [portfolioLightboxPhoto, setPortfolioLightboxPhoto] = useState<ClassroomPhoto | null>(null);
  const [portfolioCategoryFilter, setPortfolioCategoryFilter] = useState<string>("todos");
  const [portfolioSearchQuery, setPortfolioSearchQuery] = useState<string>("");

  // Teacher Classroom Photo Upload form states
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoClass, setPhotoClass] = useState("Berçário das Estrelas (Maternal I)");
  const [photoTag, setPhotoTag] = useState("Artes 🎨");
  const [photoTaggedStudentIds, setPhotoTaggedStudentIds] = useState<string[]>([]);
  const [selectedPhotoBase64, setSelectedPhotoBase64] = useState<string | null>(null);
  
  // Crop Tool States
  const [originalPhotoBase64, setOriginalPhotoBase64] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropRotate, setCropRotate] = useState(0);
  const [cropAspect, setCropAspect] = useState<number>(16 / 9); // default to 16:9
  const [cropPan, setCropPan] = useState({ x: 0, y: 0 });
  const [cropFrameStyle, setCropFrameStyle] = useState<"rounded" | "classic" | "polaroid" | "gold" | "minimal" >("rounded");
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editFirstBimester, setEditFirstBimester] = useState<number>(0);
  const [editSecondBimester, setEditSecondBimester] = useState<number>(0);
  const [editFeedback, setEditFeedback] = useState<string>("");
  const [celebratedStudents, setCelebratedStudents] = useState<string[]>([]);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStartCrop, setDragStartCrop] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);

  // Trigger push notification helper via PushNotificationService
  const triggerPushNotification = (info: Omit<NotificationItem, "id" | "timestamp" | "read">) => {
    let category: NotificationEventCategory = "new_message";
    if (info.iconType === "faturamento") category = "financial";
    else if (info.iconType === "occurrence") category = "security";
    else if (info.iconType === "deadline") category = "deadline";
    else if (info.iconType === "promotion") category = "promotion";
    else if (info.iconType === "chat" || info.iconType === "message") category = "new_message";
    else if (info.category) category = info.category as any;

    pushNotificationService.sendNotification({
      title: info.title,
      body: info.body,
      category,
      targetTab: info.targetTab,
      iconType: info.iconType,
      studentName: info.studentName,
      priority: info.priority || "normal",
      actionLabel: info.actionLabel,
      actionUrl: info.actionUrl,
    });
  };

  // Pipeline stage change & push alert dispatcher for School CRM
  const handleStudentPipelineStageChange = (
    studentId: string,
    newStage: "pendente" | "em_analise" | "concluido",
    previousStage?: "pendente" | "em_analise" | "concluido",
    customAuthor = "Gestor Escolar (CRM)",
    customNotes?: string
  ) => {
    const student = estudantes.find((e) => e.id === studentId);
    if (!student) return;

    const oldStage = previousStage || student.reEnrollmentStatus || "pendente";
    
    // 1. Update student in list and save
    const updatedList = estudantes.map((e) =>
      e.id === studentId ? { ...e, reEnrollmentStatus: newStage } : e
    );
    saveEstudantesList(updatedList);

    const stageLabels: Record<string, string> = {
      concluido: "Contrato Aceito 🎉",
      em_analise: "Em Negociação 💬",
      pendente: "Sem Contato / Pendente ⏳"
    };

    const targetLabel = stageLabels[newStage] || newStage;
    const now = new Date();
    const nowTimeStr = `Hoje às ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

    // 2. Update last transition for Progress Seal in dashboard
    setLastPipelineTransition({
      studentName: student.name,
      stageTo: targetLabel,
      timestamp: nowTimeStr
    });

    // 3. Check push alert settings from localStorage
    const pushEnabled = localStorage.getItem("crm_pipeline_push_alerts_enabled") !== "false";
    const notifyAccepted = localStorage.getItem("crm_pipeline_notify_accepted") !== "false";
    const notifyNegotiation = localStorage.getItem("crm_pipeline_notify_negotiation") !== "false";
    const notifyReversion = localStorage.getItem("crm_pipeline_notify_reversion") !== "false";

    let shouldPush = pushEnabled;
    if (newStage === "concluido" && !notifyAccepted) shouldPush = false;
    if (newStage === "em_analise" && !notifyNegotiation) shouldPush = false;
    if (newStage === "pendente" && !notifyReversion) shouldPush = false;

    if (shouldPush) {
      triggerPushNotification({
        title: `🎯 Funil de Rematrícula: ${student.name}`,
        body: `Aluno avançou para "${targetLabel}". Resp: ${student.parentName} (${student.grade}).`,
        targetTab: "academico",
        iconType: newStage === "concluido" ? "faturamento" : "announcement",
        studentName: student.name
      });
    }

    // 4. Record transition log in localStorage
    try {
      const existingLogsStr = localStorage.getItem("crm_pipeline_transition_logs");
      const existingLogs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
      const newLog = {
        id: "trans-" + Date.now(),
        studentId: student.id,
        studentName: student.name,
        studentGrade: student.grade,
        parentName: student.parentName,
        stageFrom: oldStage,
        stageTo: newStage,
        timestamp: Date.now(),
        dateFormatted: nowTimeStr,
        pushSent: shouldPush,
        author: customAuthor,
        notes: customNotes || (newStage === "concluido" ? "Contrato de rematrícula aceito e confirmado." : newStage === "em_analise" ? "Aluno transferido para atendimento de negociação." : "Status retornado para pendente.")
      };
      const updatedLogs = [newLog, ...existingLogs.slice(0, 19)];
      localStorage.setItem("crm_pipeline_transition_logs", JSON.stringify(updatedLogs));
    } catch (err) {
      console.error("Failed to save transition log", err);
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notif.id ? { ...n, read: true } : n);
      localStorage.setItem("school_push_notifications", JSON.stringify(updated));
      return updated;
    });
    setBellOpen(false);
    if (userRole !== "pais") {
      setUserRole("pais");
    }
    if (notif.targetTab) {
      setActiveTab(notif.targetTab as any);
      setToast({
        message: `Navegando para: ${notif.title}`,
        type: "info"
      });
    }
  };

  // Process uploaded image files and convert them to Base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setToast({ message: "⚠️ Por favor, selecione apenas arquivos de imagem válidos.", type: "error" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setOriginalPhotoBase64(e.target.result);
        setSelectedPhotoBase64(e.target.result);
        setCropZoom(1);
        setCropRotate(0);
        setCropPan({ x: 0, y: 0 });
        setIsCropModalOpen(true);
        setToast({ message: "📸 Imagem carregada! Ajuste o corte e o enquadramento na tela.", type: "success" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Crop drag/panning handlers with strict bounding limits
  const getBoundedPan = (newX: number, newY: number) => {
    if (!cropContainerRef.current || !cropImageRef.current) {
      return { x: newX, y: newY };
    }

    const containerRect = cropContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const naturalWidth = cropImageRef.current.naturalWidth || containerWidth;
    const naturalHeight = cropImageRef.current.naturalHeight || containerHeight;

    const isRotated90 = Math.abs(cropRotate % 180) === 90;
    const actualWidth = isRotated90 ? naturalHeight : naturalWidth;
    const actualHeight = isRotated90 ? naturalWidth : naturalHeight;

    const scaleX = containerWidth / actualWidth;
    const scaleY = containerHeight / actualHeight;
    const baseScale = Math.max(scaleX, scaleY);

    const displayedWidth = actualWidth * baseScale;
    const displayedHeight = actualHeight * baseScale;

    const zoomedWidth = displayedWidth * cropZoom;
    const zoomedHeight = displayedHeight * cropZoom;

    const maxPanX = Math.max(0, (zoomedWidth - containerWidth) / 2);
    const maxPanY = Math.max(0, (zoomedHeight - containerHeight) / 2);

    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY))
    };
  };

  // Clamp pan when zoom, aspect ratio or rotation changes to prevent black boundaries
  useEffect(() => {
    if (isCropModalOpen && originalPhotoBase64) {
      const bounded = getBoundedPan(cropPan.x, cropPan.y);
      if (bounded.x !== cropPan.x || bounded.y !== cropPan.y) {
        setCropPan(bounded);
      }
    }
  }, [cropZoom, cropAspect, cropRotate, isCropModalOpen]);

  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (!isCropModalOpen) return;
    setIsDraggingCrop(true);
    setDragStartCrop({ x: e.clientX - cropPan.x, y: e.clientY - cropPan.y });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCrop) return;
    const rawX = e.clientX - dragStartCrop.x;
    const rawY = e.clientY - dragStartCrop.y;
    setCropPan(getBoundedPan(rawX, rawY));
  };

  const handleCropMouseUpOrLeave = () => {
    setIsDraggingCrop(false);
  };

  const handleCropTouchStart = (e: React.TouchEvent) => {
    if (!isCropModalOpen || e.touches.length === 0) return;
    setIsDraggingCrop(true);
    const touch = e.touches[0];
    setDragStartCrop({ x: touch.clientX - cropPan.x, y: touch.clientY - cropPan.y });
  };

  const handleCropTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingCrop || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rawX = touch.clientX - dragStartCrop.x;
    const rawY = touch.clientY - dragStartCrop.y;
    setCropPan(getBoundedPan(rawX, rawY));
  };

  const handleSaveCrop = () => {
    if (!originalPhotoBase64) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = originalPhotoBase64;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const targetWidth = 1200;
      const targetHeight = targetWidth / cropAspect;
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      ctx.clearRect(0, 0, targetWidth, targetHeight);
      ctx.save();
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((cropRotate * Math.PI) / 180);

      // Sizing logic matching our container box of 400px width
      const uiBoxWidth = 400;
      const uiBoxHeight = 400 / cropAspect;
      const scaleX = uiBoxWidth / image.width;
      const scaleY = uiBoxHeight / image.height;
      const baseScale = Math.max(scaleX, scaleY);

      const canvasScale = (targetWidth / uiBoxWidth) * baseScale * cropZoom;
      const panScaleFactor = targetWidth / uiBoxWidth;
      ctx.translate(cropPan.x * panScaleFactor, cropPan.y * panScaleFactor);

      const drawWidth = image.width * canvasScale;
      const drawHeight = image.height * canvasScale;
      ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      try {
        const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
        setSelectedPhotoBase64(croppedBase64);
        setIsCropModalOpen(false);
        setToast({ message: "✂️ Foto enquadrada e recortada com sucesso!", type: "success" });
      } catch (err) {
        console.error(err);
        setToast({ message: "⚠️ Erro ao processar o enquadramento.", type: "error" });
      }
    };
    image.onerror = () => {
      setToast({ message: "⚠️ Falha ao carregar arquivo de imagem.", type: "error" });
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleSaveClassroomPhoto = () => {
    if (!photoTitle.trim()) {
      setToast({
        message: "Por favor, adicione uma legenda ou descrição para a foto.",
        type: "error"
      });
      return;
    }
    if (!selectedPhotoBase64) {
      setToast({
        message: "Por favor, selecione ou envie uma imagem antes de publicar.",
        type: "error"
      });
      return;
    }

    const newPhoto: ClassroomPhoto = {
      id: "photo-" + Date.now(),
      title: photoTitle.trim(),
      grade: photoClass,
      date: "Hoje, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      imageUrl: selectedPhotoBase64,
      teacherName: userProfile?.displayName || "Profa. Eliana Costa (Coordenadora)",
      badge: photoTag,
      taggedStudentIds: photoTaggedStudentIds.length > 0 ? photoTaggedStudentIds : ["est-1", "est-2"]
    };

    const updated = [newPhoto, ...classroomPhotos];
    setClassroomPhotos(updated);
    localStorage.setItem("school_classroom_photos", JSON.stringify(updated));

    // Also trigger simulated push notification!
    triggerPushNotification({
      title: `📸 Nova Foto do Dia Disponível (${photoTag.split(" ")[0]})`,
      body: `Confira a nova imagem de "${photoTitle.trim()}" publicada para a turma ${photoClass}!`,
      targetTab: "diaadia",
      iconType: "occurrence"
    });

    // Reset Form
    setPhotoTitle("");
    setSelectedPhotoBase64(null);
    setPhotoTaggedStudentIds([]);
    setToast({
      message: "🎉 Foto do dia publicada aos pais e integrada ao diário com sucesso!",
      type: "success"
    });
  };

  const handleDownloadAsWallpaper = async (imageUrl: string, title: string) => {
    try {
      setToast({
        message: "⏳ Processando imagem e adaptando ao formato da sua tela...",
        type: "info"
      });

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        const screenWidth = window.screen.width || 1080;
        const screenHeight = window.screen.height || 1920;
        const screenRatio = screenWidth / screenHeight;

        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const imgRatio = imgWidth / imgHeight;

        let sWidth = imgWidth;
        let sHeight = imgHeight;
        let sx = 0;
        let sy = 0;

        if (imgRatio > screenRatio) {
          sWidth = imgHeight * screenRatio;
          sx = (imgWidth - sWidth) / 2;
        } else {
          sHeight = imgWidth / screenRatio;
          sy = (imgHeight - sHeight) / 2;
        }

        const targetWidth = 1440;
        const targetHeight = Math.round(1440 / screenRatio);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Enable high-quality image smoothing to prevent resizing artifacts
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

        canvas.toBlob((blob) => {
          if (!blob) throw new Error("Blob failed");
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `wallpaper-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setToast({
            message: `📱 Papel de parede adaptado gerado com sucesso! (${targetWidth}x${targetHeight})`,
            type: "success"
          });
        }, "image/png");
      };

      img.onerror = () => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.target = "_blank";
        link.download = `wallpaper-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({
          message: "📱 Imagem salva no tamanho original devido a restrições de CORS do navegador.",
          type: "success"
        });
      };
    } catch (e) {
      console.error(e);
      setToast({
        message: "❌ Erro ao processar. Baixando imagem original.",
        type: "error"
      });
    }
  };

  const loadMockPhotoTemplate = (type: string) => {
    let url = "";
    let caption = "";
    let tag = "";
    let taggedIds: string[] = [];
    if (type === "arts") {
      url = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600";
      caption = "Oficina Criativa: Pintando com as Pontas dos Dedos";
      tag = "Artes 🎨";
      taggedIds = ["est-2"];
    } else if (type === "robotics") {
      url = "https://images.unsplash.com/photo-1504164996022-09080787b6b3?auto=format&fit=crop&q=80&w=600";
      caption = "Introdução aos Robôs: Construção de Garras Elétricas";
      tag = "Robótica 🤖";
      taggedIds = ["est-1"];
    } else if (type === "playtime") {
      url = "https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=600";
      caption = "Recreio Orientado: Jogos Cooperativos ao Ar Livre";
      tag = "Recreação ☀️";
      taggedIds = ["est-1", "est-2"];
    } else if (type === "sports") {
      url = "https://images.unsplash.com/photo-1561706240-621aa0f94857?auto=format&fit=crop&q=80&w=600";
      caption = "Atividade de Educação Física: Circuito de Equilíbrio";
      tag = "Esportes ⚽";
      taggedIds = ["est-1", "est-2"];
    }
    setSelectedPhotoBase64(url);
    setOriginalPhotoBase64(url);
    setPhotoTitle(caption);
    setPhotoTag(tag);
    setPhotoTaggedStudentIds(taggedIds);
    setToast({
      message: `📸 Template "${tag}" carregado! Toque em "Publicar Foto" para enviar.`,
      type: "info"
    });
  };

  // Advanced Search & Interactive Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedDateFilter, setSelectedDateFilter] = useState("todos");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [onlySaved, setOnlySaved] = useState(false);

  // Global Search Modal State
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Content Moderation System States
  const [moderationReports, setModerationReports] = useState<ContentReport[]>(() => {
    const saved = localStorage.getItem("school_moderation_reports");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar denúncias salvas:", e);
      }
    }
    return initialModerationReports;
  });

  const [userWarnings, setUserWarnings] = useState<UserWarning[]>(() => {
    const saved = localStorage.getItem("school_user_warnings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar advertências salvas:", e);
      }
    }
    return initialUserWarnings;
  });

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [expandedComunicadoComments, setExpandedComunicadoComments] = useState<Record<string, boolean>>({});
  const [quickCommentTexts, setQuickCommentTexts] = useState<Record<string, string>>({});

  // Modals & detail drawer states
  const [selectedComunicado, setSelectedComunicado] = useState<Comunicado | null>(null);
  const [newAnnouncementModal, setNewAnnouncementModal] = useState(false);
  const [billingDetail, setBillingDetail] = useState<Cobranca | null>(null);
  const [crmSuggestionCob, setCrmSuggestionCob] = useState<Cobranca | null>(null);
  const [crmReminderTitle, setCrmReminderTitle] = useState("");
  const [crmReminderDate, setCrmReminderDate] = useState("");
  const [crmReminderTime, setCrmReminderTime] = useState("09:00");
  const [crmReminderChannel, setCrmReminderChannel] = useState<"whatsapp" | "email" | "sms" | "push">("whatsapp");
  const [crmReminderNotes, setCrmReminderNotes] = useState("");
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [isTextAdventureModalOpen, setIsTextAdventureModalOpen] = useState(false);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);
  const [selectedCaregiverForQr, setSelectedCaregiverForQr] = useState<{ rule: AutorizacaoRetirada; student: Estudante } | null>(null);
  const [parentQrStatus, setParentQrStatus] = useState<"escaneando" | "pronto" | "erro">("pronto");
  // Diagnostics & Troubleshooting error log record for QR Code scanner
  interface QrScanErrorRecord {
    id: string;
    timestamp: string;
    code: string;
    reason: string;
    deviceInfo: string;
    studentHint?: string;
    tips: Array<{ title: string; desc: string }>;
  }

  const [lastQrScanError, setLastQrScanError] = useState<QrScanErrorRecord | null>(null);
  const [showQrErrorLogPopup, setShowQrErrorLogPopup] = useState(false);
  const [showQrErrorIndicator, setShowQrErrorIndicator] = useState(false);
  const [troubleshootDismissCountdown, setTroubleshootDismissCountdown] = useState<number | null>(null);
  const [isTroubleshootDismissing, setIsTroubleshootDismissing] = useState(false);
  const [qrScanErrorCount, setQrScanErrorCount] = useState(0);
  const [accessibleReadingMode, setAccessibleReadingMode] = useState(false);
  const [continuousScanning, setContinuousScanning] = useState(false);
  const [lastSuccessfulScan, setLastSuccessfulScan] = useState<{ studentName: string; time: string } | null>(null);
  const [continuousCheckinCount, setContinuousCheckinCount] = useState(0);
  const [successfulScansCount, setSuccessfulScansCount] = useState(0);
  const [showQrFloatingTooltip, setShowQrFloatingTooltip] = useState(false);
  const [isScanSuccessAnimating, setIsScanSuccessAnimating] = useState(false);
  const qrButtonHoldTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showQrDrawer, setShowQrDrawer] = useState(false);
  const [showSparklesBurst, setShowSparklesBurst] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<Array<{ id: string; time: string; type: "entrada" | "saída"; studentName: string }>>([
    { id: "c-1", time: "07:15:32", type: "entrada", studentName: "Arthur" },
    { id: "c-2", time: "12:10:45", type: "saída", studentName: "Arthur" },
    { id: "c-3", time: "13:05:12", type: "entrada", studentName: "Arthur" }
  ]);
  const [portariaStudentFilter, setPortariaStudentFilter] = useState<string>("todos");

  const handleGlobalSearchResultSelect = (target: SearchTarget) => {
    if (target.studentId) {
      setSelectedStudentId(target.studentId);
    }

    if (target.id === "feat-conquistas") {
      setProfileModalInitialSection("achievements");
      setIsProfileModalOpen(true);
      setToast({
        message: `🏆 Abrindo painel de Conquistas & Mérito Formativo!`,
        type: "success"
      });
      return;
    }

    if (target.id === "feat-central-ajuda" || target.actionKey === "open_help_center") {
      setHelpCenterInitialTab("features");
      setHelpCenterSearchQuery("");
      setIsHelpCenterOpen(true);
      return;
    }

    if (target.id === "feat-tour-interativo" || target.actionKey === "start_guided_tour") {
      setIsTourOpen(true);
      setToast({
        message: "🧭 Iniciando tour guiado interativo pela aplicação!",
        type: "info"
      });
      return;
    }

    if (target.id === "feat-guia-portaria" || target.actionKey === "open_help_portaria") {
      setHelpCenterInitialTab("use_cases");
      setHelpCenterSearchQuery("portaria");
      setIsHelpCenterOpen(true);
      return;
    }

    if (target.id === "feat-guia-pix" || target.actionKey === "open_help_pix") {
      setHelpCenterInitialTab("use_cases");
      setHelpCenterSearchQuery("pix");
      setIsHelpCenterOpen(true);
      return;
    }

    if (
      target.id === "feat-tutorial-financeiro" || 
      target.id === "feat-tutorial-renegociacao" || 
      target.id === "feat-tutorial-alertas-erp" || 
      target.actionKey === "open_help_finance_flow"
    ) {
      setHelpCenterInitialTab("finance_flow");
      setHelpCenterSearchQuery("");
      setIsHelpCenterOpen(true);
      setToast({
        message: "💰 Abrindo Tutorial Interativo do Fluxo Financeiro!",
        type: "info"
      });
      return;
    }

    if (target.id === "feat-perfil" || target.targetTab === "perfil") {
      setProfileModalInitialSection("info");
      setIsProfileModalOpen(true);
      setToast({
        message: `👤 Abrindo configurações do Perfil do Usuário!`,
        type: "info"
      });
      return;
    }

    if (userRole === "escola" && target.schoolSubTab) {
      changeSchoolActiveTabWithMagic(target.schoolSubTab);
    } else if (target.targetTab) {
      changeActiveTabWithMagic(target.targetTab);
    }

    if (target.actionKey === "open_whatsapp_config") {
      setQuickNotificationForm("cobranca");
      setQuickCobrancaSubTab("regua_erp");
    } else if (target.actionKey === "compare_students") {
      setCompareStudentIdA(estudantes[0]?.id || "est-1");
      setCompareStudentIdB(estudantes[1]?.id || "est-2");
      setCompareModalOpen(true);
    } else if (target.actionKey === "open_qr_modal") {
      setQrCodeModalOpen(true);
    } else if (target.actionKey === "toggle_accessible_mode") {
      setAccessibleReadingMode((prev) => {
        const next = !prev;
        setToast({
          message: next
            ? "👁️ Modo de Leitura Acessível ativado (alto contraste)!"
            : "👁️ Modo de Leitura Padrão ativado.",
          type: "success"
        });
        return next;
      });
      return;
    } else if (target.actionKey === "toggle_dark_mode") {
      setIsDarkMode((prev) => {
        const next = !prev;
        setToast({
          message: next ? "🌙 Modo Escuro ativado." : "☀️ Modo Claro ativado.",
          type: "info"
        });
        return next;
      });
      return;
    } else if (target.actionKey === "open_sensory_panel") {
      setSensoryPanelOpen(true);
    } else if (target.actionKey === "open_qr_drawer") {
      setShowQrDrawer(true);
    } else if (target.actionKey === "open_branding") {
      setShowBrandingPanel(true);
    } else if (target.actionKey === "new_announcement") {
      if (userRole === "escola") {
        setNewAnnouncementModal(true);
      } else {
        changeActiveTabWithMagic("comunicados");
      }
    }

    setToast({
      message: `🔍 Navegado para: "${target.title}"`,
      type: "info"
    });
  };

  const handleExportCheckinsPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // Slate-800
      doc.text(branding?.schoolName || "Magic Learning", 14, 22);
      
      doc.setFontSize(13);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text("Relatório de Portaria e Controle de Acessos", 14, 29);
      
      // Decorative line
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.5);
      doc.line(14, 34, 196, 34);
      
      // Report metadata
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // Slate-400
      const now = new Date().toLocaleString("pt-BR");
      doc.text(`Gerado em: ${now}`, 14, 40);
      doc.text(`Total de registros: ${recentCheckins.length}`, 14, 45);
      
      // Table Header Background
      doc.setFillColor(241, 245, 249); // Slate-100
      doc.rect(14, 52, 182, 8, "F");
      
      // Table Headers
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85); // Slate-700
      doc.text("Código do Check-in", 18, 57);
      doc.text("Nome do Aluno", 55, 57);
      doc.text("Operação de Acesso", 115, 57);
      doc.text("Horário Local", 165, 57);
      
      // Table Rows
      let currentY = 66;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      
      recentCheckins.forEach((check, index) => {
        // Alternating background
        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252); // Slate-50
          doc.rect(14, currentY - 5, 182, 7, "F");
        }
        
        doc.setTextColor(100, 116, 139);
        doc.text(check.id, 18, currentY);
        
        doc.setTextColor(30, 41, 59);
        doc.text(check.studentName, 55, currentY);
        
        // Type badge coloring
        if (check.type === "entrada") {
          doc.setTextColor(16, 185, 129); // Emerald-500
          doc.text("ENTRADA", 115, currentY);
        } else {
          doc.setTextColor(59, 130, 246); // Blue-500
          doc.text("SAIDA", 115, currentY);
        }
        
        doc.setTextColor(100, 116, 139);
        doc.text(check.time, 165, currentY);
        
        currentY += 8;
      });
      
      // Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 275, 196, 275);
      
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Magic Portal - Solução Corporativa de Portaria Digital Integrada", 14, 281);
      doc.text("Página 1 de 1", 175, 281);
      
      // Download
      doc.save(`Relatorio_Acessos_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setToast({
        message: "📄 Relatório PDF administrativo gerado com sucesso!",
        type: "success"
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      setToast({
        message: "❌ Falha ao exportar relatório PDF.",
        type: "error"
      });
    }
  };

  const handleExportCheckinsCSV = (onlyFiltered: boolean = true) => {
    try {
      const csvRows = [];
      // CSV Header
      csvRows.push(["ID do Registro", "Nome do Aluno", "Tipo de Operação", "Horário Local"].join(";"));

      const filtered = recentCheckins.filter(check => {
        if (!onlyFiltered || portariaStudentFilter === "todos") return true;
        return check.studentName.toLowerCase() === portariaStudentFilter.toLowerCase();
      });

      filtered.forEach((check) => {
        const row = [
          `"${check.id.replace(/"/g, '""')}"`,
          `"${check.studentName.replace(/"/g, '""')}"`,
          `"${check.type.toUpperCase()}"`,
          `"${check.time.replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(";"));
      });

      const csvContent = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const filterSuffix = (onlyFiltered && portariaStudentFilter !== "todos") ? portariaStudentFilter.toLowerCase() : "todos";
      const fileName = `historico_portaria_${filterSuffix}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setToast({
        message: onlyFiltered && portariaStudentFilter !== "todos"
          ? `🚙 CSV Filtrado (${portariaStudentFilter}) exportado com sucesso!`
          : "🚙 CSV Geral da Portaria exportado com sucesso!",
        type: "success"
      });
    } catch (error) {
      console.error(error);
      setToast({
        message: "Houve um erro ao gerar o arquivo CSV da Portaria. Por favor tente novamente.",
        type: "error"
      });
    }
  };

  // Comment input state for announcement drawer
  const [commentText, setCommentText] = useState("");

  // ERP Integration configuration wizard
  const [erpName, setErpName] = useState<"asaas" | "sap" | "totvs" | "iugu">("asaas");
  const [erpApiKey, setErpApiKey] = useState("");
  const [erpWebhookUrl, setErpWebhookUrl] = useState("https://api.magiclearning.com.br/hooks/white-label/erp-sync");
  const [erpSyncStatus, setErpSyncStatus] = useState<"disconnected" | "sync_testing" | "connected">("disconnected");
  const [erpLastSyncTime, setErpLastSyncTime] = useState<string>("02/07/2026 05:30:12");

  // Sync health stale check helper
  const isSyncStale = (() => {
    try {
      if (!erpLastSyncTime) return true;
      const [datePart, timePart] = erpLastSyncTime.split(" ");
      const [day, month, year] = datePart.split("/").map(Number);
      const [hours, minutes, seconds] = timePart.split(":").map(Number);
      const syncDate = new Date(year, month - 1, day, hours, minutes, seconds);
      const diffMs = Date.now() - syncDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return diffHours > 4;
    } catch (e) {
      return true;
    }
  })();

  // QR Code access audit logs state
  const [qrCheckInLogs, setQrCheckInLogs] = useState<QrCheckInLog[]>(() => {
    const saved = localStorage.getItem("school_qr_checkin_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: "log-1",
        studentId: "est-1",
        studentName: "Nicolas Silva",
        studentGrade: "3º Ano Fundamental (Sala 4B)",
        avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150",
        timestamp: "08/07/2026 07:45:12",
        status: "entrada",
        method: "qr_code",
        details: "Entrada autorizada via QR Code do Responsável",
        teacherName: "Profª Helena Ramos",
        shift: "manha"
      },
      {
        id: "log-2",
        studentId: "est-2",
        studentName: "Beatriz Silva",
        studentGrade: "1º Ano Fundamental (Sala 2A)",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        timestamp: "08/07/2026 07:48:33",
        status: "entrada",
        method: "qr_code",
        details: "Entrada autorizada via QR Code do Responsável",
        teacherName: "Prof. Carlos Silva",
        shift: "manha"
      },
      {
        id: "log-3",
        studentId: "est-1",
        studentName: "Nicolas Silva",
        studentGrade: "3º Ano Fundamental (Sala 4B)",
        avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150",
        timestamp: "07/07/2026 17:30:15",
        status: "saida",
        method: "qr_code",
        details: "Saída autorizada via QR Code de Portaria",
        teacherName: "Profª Helena Ramos",
        shift: "tarde"
      },
      {
        id: "log-4",
        studentId: "est-2",
        studentName: "Beatriz Silva",
        studentGrade: "1º Ano Fundamental (Sala 2A)",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        timestamp: "07/07/2026 17:32:00",
        status: "saida",
        method: "manual",
        details: "Liberado manualmente pela coordenação",
        teacherName: "Prof. Carlos Silva",
        shift: "tarde"
      },
      {
        id: "log-5",
        studentId: "est-3",
        studentName: "Gabriel Souza",
        studentGrade: "2º Ano Fundamental (Sala 3C)",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        timestamp: "07/07/2026 08:05:44",
        status: "tentativa_invalida",
        method: "qr_code",
        details: "QR Code vencido ou de outro dia letivo",
        teacherName: "Profª Mariana Castro",
        shift: "manha"
      }
    ];
  });

  const [qrAuditLogModalOpen, setQrAuditLogModalOpen] = useState(false);
  const [activeCrmSubSection, setActiveCrmSubSection] = useState<"details" | "automated_reminders">("automated_reminders");

  const addQrCheckInLog = (studentId: string, status: "entrada" | "saida" | "tentativa_invalida", details: string, method: "qr_code" | "manual" = "qr_code") => {
    const student = estudantes.find(e => e.id === studentId);
    if (!student) return;
    const newLog: QrCheckInLog = {
      id: `log-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      studentGrade: student.grade,
      avatar: student.avatar,
      timestamp: new Date().toLocaleDateString('pt-BR') + " " + new Date().toLocaleTimeString('pt-BR'),
      status,
      method,
      details
    };
    setQrCheckInLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem("school_qr_checkin_logs", JSON.stringify(updated));
      return updated;
    });
  };

  // Additional school-portal specific states
  const [alertLoudspeakerText, setAlertLoudspeakerText] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<string[] | null>(null);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnCategory, setNewAnnCategory] = useState<"geral" | "evento" | "urgente" | "financeiro" | "nutricao">("geral");
  const [newAnnContent, setNewAnnContent] = useState("");

  // AI Image Generation States (kept for legacy magical moments feature)
  const [aiModel, setAiModel] = useState<"gemini-3.1-flash-image-preview" | "gemini-3-pro-image-preview">("gemini-3.1-flash-image-preview");
  const [aiPrompt, setAiPrompt] = useState("");
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "512px">("1K");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "4:3">("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessageIdx, setLoadingMessageIdx] = useState(0);
  const [generatedImg, setGeneratedImg] = useState<{ base64: string; prompt: string; model: string; size?: string } | null>(null);

  // Simulate parent QR code reader/scanner status changes when the modal is open or continuous scanning is active
  useEffect(() => {
    // Dynamically retrieve active student to avoid using block-scoped variable before declaration
    const getActiveStudentName = () => {
      const activeStud = estudantes.find((e) => e.id === selectedStudentId) || estudantes[0] || initialEstudantes[0];
      return activeStud?.name?.split(" ")[0] || "Arthur";
    };

    if (continuousScanning) {
      // Loop simulator when continuous scanning is active
      const interval = setInterval(() => {
        setParentQrStatus("escaneando");
        
        const scanTimer = setTimeout(() => {
          // Success rate 90% in continuous mode
          const isError = Math.random() < 0.10;
          if (isError) {
            setParentQrStatus("erro");
            try {
              sensorySoundEngine.playQrScan("error");
            } catch (err) {
              console.warn("Audio play warning:", err);
            }
            setToast({
              message: "⚠️ [Contínuo] Erro na leitura automática do QR code.",
              type: "error"
            });
          } else {
            setParentQrStatus("pronto");
            try {
              sensorySoundEngine.playQrScan("success");
            } catch (err) {
              console.warn("Audio play warning:", err);
            }
            setSuccessfulScansCount(prev => prev + 1);
            const type = Math.random() < 0.5 ? "entrada" : "saída";
            const currentStudentName = getActiveStudentName();
            const newCheckin = {
              id: "check-" + Date.now().toString().slice(-6),
              time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
              type: type as "entrada" | "saída",
              studentName: currentStudentName
            };
            setRecentCheckins(prev => [newCheckin, ...prev.slice(0, 2)]);
            setContinuousCheckinCount(prev => prev + 1);
            setLastSuccessfulScan({
              studentName: newCheckin.studentName,
              time: newCheckin.time
            });
            setToast({
              message: `🔄 [Contínuo] ${newCheckin.studentName} realizou ${type === "entrada" ? "ENTRADA" : "SAÍDA"} automática às ${newCheckin.time}!`,
              type: "success"
            });
          }
        }, 2000);

        return () => clearTimeout(scanTimer);
      }, 5500);

      return () => clearInterval(interval);
    }

    if (!qrCodeModalOpen) {
      setParentQrStatus("pronto");
      return;
    }

    // Modal was opened! Let's set it to "pronto"
    setParentQrStatus("pronto");

    // After 2.5 seconds, simulate a reader device detecting it and changing to "escaneando"
    const timer1 = setTimeout(() => {
      setParentQrStatus("escaneando");
      
      // After 3 seconds of scanning, change to either "pronto" (success) or "erro"
      const timer2 = setTimeout(() => {
        // 80% chance of success (pronto), 20% chance of error
        const isError = Math.random() < 0.20;
        if (isError) {
          setParentQrStatus("erro");
          try {
            sensorySoundEngine.playQrScan("error");
          } catch (err) {
            console.warn("Audio play warning:", err);
          }
          setToast({
            message: "⚠️ Erro na leitura do QR code. Por favor tente novamente.",
            type: "error"
          });
        } else {
          setParentQrStatus("pronto");
          try {
            sensorySoundEngine.playQrScan("success");
          } catch (err) {
            console.warn("Audio play warning:", err);
          }
          setSuccessfulScansCount(prev => prev + 1);
          const type = Math.random() < 0.5 ? "entrada" : "saída";
          const currentStudentName = getActiveStudentName();
          const newCheckin = {
            id: "check-" + Date.now().toString().slice(-6),
            time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            type: type as "entrada" | "saída",
            studentName: currentStudentName
          };
          setRecentCheckins(prev => [newCheckin, ...prev.slice(0, 2)]);
          setLastSuccessfulScan({
            studentName: newCheckin.studentName,
            time: newCheckin.time
          });
          setToast({
            message: "📲 QR Code escaneado com sucesso! Acesso à portaria autorizado.",
            type: "success"
          });
        }
      }, 3000);

      return () => clearTimeout(timer2);
    }, 2500);

    return () => clearTimeout(timer1);
  }, [qrCodeModalOpen, continuousScanning, estudantes, selectedStudentId]);

  // Reset continuous scan counter when deactivating continuous mode
  useEffect(() => {
    if (!continuousScanning) {
      setContinuousCheckinCount(0);
    }
  }, [continuousScanning]);

  // Sparkle burst & golden confetti feedback trigger on QR Code verification success
  const prevParentQrStatusRef = useRef<"escaneando" | "pronto" | "erro">(parentQrStatus);
  useEffect(() => {
    const prevStatus = prevParentQrStatusRef.current;
    prevParentQrStatusRef.current = parentQrStatus;

    if (parentQrStatus === "pronto" && prevStatus !== "pronto") {
      setShowSparklesBurst(true);
      setIsScanSuccessAnimating(true);
      triggerGoldenConfettiForPortaria("btn-parent-qrcode");
      const timer = setTimeout(() => {
        setShowSparklesBurst(false);
        setIsScanSuccessAnimating(false);
      }, 1800);
      return () => clearTimeout(timer);
    } else if (parentQrStatus === "erro" && prevStatus !== "erro") {
      // Automatic error diagnostic registration and troubleshooting popup display when status transitions to 'erro'
      const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const currentStudentName = estudantes.find((e) => e.id === selectedStudentId)?.name || "Arthur Silva";

      const newErrorRecord: QrScanErrorRecord = {
        id: `ERR-QR-${Date.now().toString().slice(-5)}`,
        timestamp: timeStr,
        code: "ERR_PORTARIA_DECODE_TIMEOUT",
        reason: "Reflexos de luz ou contraste insuficiente impediram a decodificação imediata do QR code na câmera da portaria.",
        deviceInfo: "Sensor Óptico Integrado / Câmera da Portaria (HD)",
        studentHint: currentStudentName,
        tips: [
          {
            title: "Elevar Brilho da Tela",
            desc: "Aumente o brilho do smartphone para 70%+ e desative temporariamente o filtro de luz amarela ou Modo Noturno."
          },
          {
            title: "Desviar Reflexos de Lâmpadas",
            desc: "Incline o smartphone em cerca de 15° para desviar o reflexo direto das lâmpadas do teto da portaria sobre a câmera."
          },
          {
            title: "Distância Focal (15 a 20 cm)",
            desc: "Mantenha o aparelho celular estável a cerca de um palmo de distância da lente da câmera, sem movimentos bruscos."
          },
          {
            title: "Enquadramento dos 3 Cantos",
            desc: "Certifique-se de que os 3 quadrados nos cantos do QR code estejam integralmente visíveis no quadro, sem dedos cobrindo."
          },
          {
            title: "Atualizar Token do QR Code",
            desc: "Caso o código seja de um print antigo, toque em 'Atualizar QR Code' para gerar um token de liberação dinâmico e válido."
          }
        ]
      };

      setLastQrScanError(newErrorRecord);
      setShowQrErrorIndicator(true);
      setShowQrErrorLogPopup(true);
      setQrScanErrorCount(prev => prev + 1);
    }
  }, [parentQrStatus, estudantes, selectedStudentId]);

  // ⏱️ Timer que oculta automaticamente a lista de dicas de troubleshooting após 10 segundos
  // caso o status do scanner retorne para 'pronto' ou 'escaneando', aplicando animação suave de fade-out e slide-up
  useEffect(() => {
    let dismissInterval: NodeJS.Timeout | null = null;
    let dismissTimeout: NodeJS.Timeout | null = null;
    let fadeOutTimeout: NodeJS.Timeout | null = null;

    if ((parentQrStatus === "pronto" || parentQrStatus === "escaneando") && (showQrErrorLogPopup || showQrErrorIndicator)) {
      setTroubleshootDismissCountdown(10);
      setIsTroubleshootDismissing(false);

      dismissInterval = setInterval(() => {
        setTroubleshootDismissCountdown((prev) => {
          if (prev === null || prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Ao término de 10 segundos (10000ms), inicia a animação suave de fade-out e slide-up
      dismissTimeout = setTimeout(() => {
        setIsTroubleshootDismissing(true);

        // Aguarda 450ms da transição de slide-up e fade-out antes de desmontar o componente
        fadeOutTimeout = setTimeout(() => {
          setShowQrErrorLogPopup(false);
          setShowQrErrorIndicator(false);
          setTroubleshootDismissCountdown(null);
          setIsTroubleshootDismissing(false);
        }, 450);
      }, 10000);
    } else {
      setTroubleshootDismissCountdown(null);
      setIsTroubleshootDismissing(false);
    }

    return () => {
      if (dismissInterval) clearInterval(dismissInterval);
      if (dismissTimeout) clearTimeout(dismissTimeout);
      if (fadeOutTimeout) clearTimeout(fadeOutTimeout);
    };
  }, [parentQrStatus, showQrErrorLogPopup, showQrErrorIndicator]);

  // Função auxiliar para fechamento manual suave com fade-out e slide-up
  const handleCloseTroubleshootWithSlideUp = () => {
    setIsTroubleshootDismissing(true);
    setTimeout(() => {
      setShowQrErrorLogPopup(false);
      setShowQrErrorIndicator(false);
      setTroubleshootDismissCountdown(null);
      setIsTroubleshootDismissing(false);
    }, 450);
  };

  // Temporary scan-success state & golden confetti trigger for #btn-parent-qrcode
  useEffect(() => {
    if (successfulScansCount > 0) {
      setIsScanSuccessAnimating(true);
      triggerGoldenConfettiForPortaria("btn-parent-qrcode");
      const timer = setTimeout(() => {
        setIsScanSuccessAnimating(false);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [successfulScansCount]);

  // Load Initial mock data & setup Local Storage
  useEffect(() => {
    const localComms = localStorage.getItem("school_comunicados");
    setComunicados(localComms ? JSON.parse(localComms) : initialComunicados);

    const localMoms = localStorage.getItem("school_momentos");
    setMomentos(localMoms ? JSON.parse(localMoms) : initialMomentos);

    const localEvts = localStorage.getItem("school_eventos");
    setEventos(localEvts ? JSON.parse(localEvts) : initialEventos);

    const localCobs = localStorage.getItem("school_cobrancas");
    setCobrancas(localCobs ? JSON.parse(localCobs) : initialCobrancas);

    const localEsts = localStorage.getItem("school_estudantes");
    if (localEsts) {
      try {
        const parsed: Estudante[] = JSON.parse(localEsts);
        // Migrate student grades to reach the new target of 9.5 or above
        const migrated = parsed.map(est => {
          if (est.id === "est-1") {
            return {
              ...est,
              grades: [
                { subject: "Matemática & Raciocínio Lógico", firstBimester: 9.0, secondBimester: 9.5, feedback: "Excelente raciocínio lógico na resolução de problemas e geometria espacial." },
                { subject: "Ciências da Natureza & Experimentação", firstBimester: 8.8, secondBimester: 9.5, feedback: "Muito participativo nas aulas de laboratório. Cuidadoso e rigoroso no manuseio de vidrarias." },
                { subject: "Língua Portuguesa & Produção Textual", firstBimester: 9.0, secondBimester: 9.5, feedback: "Escreve redações coerentes, com vocabulário rico e excelente estrutura argumentativa." },
                { subject: "Ciências Humanas (História & Geografia)", firstBimester: 9.1, secondBimester: 9.5, feedback: "Excelente compreensão das dinâmicas sociais e respeito histórico nas apresentações." }
              ]
            };
          } else if (est.id === "est-2") {
            return {
              ...est,
              grades: [
                { subject: "Expressão Corporal e Movimento", firstBimester: 9.0, secondBimester: 9.5, feedback: "Luna adora as atividades em roda e demonstra ótima coordenação motora." },
                { subject: "Artes Visuais e Exploração Sensorial", firstBimester: 9.2, secondBimester: 9.6, feedback: "Explora com curiosidade diferentes texturas e materiais pedagógicos." },
                { subject: "Natureza e Sociedade", firstBimester: 9.1, secondBimester: 9.5, feedback: "Interage ativamente com as atividades no jardim e demonstra carinho pelos colegas." }
              ]
            };
          }
          return est;
        });
        setEstudantes(migrated);
        localStorage.setItem("school_estudantes", JSON.stringify(migrated));
      } catch (e) {
        setEstudantes(initialEstudantes);
      }
    } else {
      setEstudantes(initialEstudantes);
    }

    const savedLComms = localStorage.getItem("guest_saved_comunicados");
    if (savedLComms) setLocalSavedComms(JSON.parse(savedLComms));

    const savedLMoms = localStorage.getItem("guest_saved_momentos");
    if (savedLMoms) setLocalSavedMoms(JSON.parse(savedLMoms));

    const savedBranding = localStorage.getItem("magic_school_branding");
    if (savedBranding) {
      try {
        const parsed = JSON.parse(savedBranding);
        // Force the authentic Wizard's Hat logo
        if (!parsed.logoPreset || parsed.logoPreset === "rainbow_unicorn") {
          parsed.logoPreset = "magic_hat";
        }
        // Clean legacy placeholder names (e.g. Magno de Oz, Castelo do Saber) to keep it professional
        if (parsed && parsed.schoolName && (
          parsed.schoolName.toLowerCase().includes("oz") || 
          parsed.schoolName.toLowerCase().includes("castelo") || 
          parsed.schoolName.toLowerCase().includes("magno")
        )) {
          parsed.schoolName = "Magic Learning";
        }
        setBranding({ ...parsed, logoPreset: parsed.logoPreset || "magic_hat" });
      } catch (e) {
        console.error("Error parsing saved branding", e);
      }
    }

    // Hydrate simulated notifications and daily classroom photos
    const localNotifs = localStorage.getItem("school_push_notifications");
    setNotifications(localNotifs ? JSON.parse(localNotifs) : initialNotificationsSeed);

    const localPhotos = localStorage.getItem("school_classroom_photos");
    setClassroomPhotos(localPhotos ? JSON.parse(localPhotos) : initialClassroomPhotosSeed);

    const localCoins = localStorage.getItem("school_magic_coins");
    if (localCoins) setMagicCoins(Number(localCoins));

    const localQuests = localStorage.getItem("school_completed_quests");
    if (localQuests) setCompletedQuests(JSON.parse(localQuests));

    const localAnns = localStorage.getItem("school_chart_annotations");
    setChartAnnotations(localAnns ? JSON.parse(localAnns) : initialAnnotationsSeed);
  }, []);

  // Push Notification Service sync and listeners
  useEffect(() => {
    if (userProfile?.preferences) {
      pushNotificationService.syncFromUserProfile(userProfile.preferences);
    }
  }, [userProfile?.preferences]);

  useEffect(() => {
    const unsubNotif = pushNotificationService.subscribe((newItem) => {
      setNotifications((prev) => [newItem, ...prev.filter((n) => n.id !== newItem.id)]);
      setShakeBell(true);
      setTimeout(() => setShakeBell(false), 1200);
    });

    const unsubBanner = pushNotificationService.subscribeBanner((bannerItem) => {
      setActivePushBanner(bannerItem);
    });

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.type === "NAVIGATE_TO_TAB" && event.data.tab) {
          if (userRole === "pais") {
            setActiveTab(event.data.tab);
          } else if (userRole === "escola") {
            setSchoolActiveTab(event.data.tab === "comunicados" ? "comunicados" : "dashboard");
          }
        }
      };
      navigator.serviceWorker.addEventListener("message", handleSwMessage);
      return () => {
        unsubNotif();
        unsubBanner();
        navigator.serviceWorker.removeEventListener("message", handleSwMessage);
      };
    }

    return () => {
      unsubNotif();
      unsubBanner();
    };
  }, [userRole]);

  // Persist gamification progress to localStorage when modified
  useEffect(() => {
    if (magicCoins !== 250) {
      localStorage.setItem("school_magic_coins", String(magicCoins));
    }
  }, [magicCoins]);

  useEffect(() => {
    if (completedQuests.length > 0) {
      localStorage.setItem("school_completed_quests", JSON.stringify(completedQuests));
    }
  }, [completedQuests]);

  // Save changes helper utilities
  const saveComunicadosList = (data: Comunicado[]) => {
    setComunicados(data);
    localStorage.setItem("school_comunicados", JSON.stringify(data));
    if (isOffline) {
      trackOfflineOperation("comunicados", "save_list", data);
    }
  };

  const saveEstudantesList = (data: Estudante[]) => {
    setEstudantes(data);
    localStorage.setItem("school_estudantes", JSON.stringify(data));
    if (isOffline) {
      trackOfflineOperation("estudantes", "save_list", data);
    }
  };

  const handleUpdateStudentPhoto = (studentId: string, photoDataUrl: string) => {
    const updated = estudantes.map((est) => {
      if (est.id === studentId) {
        return { ...est, avatar: photoDataUrl };
      }
      return est;
    });
    saveEstudantesList(updated);

    const target = updated.find((e) => e.id === studentId);
    setToast({
      message: `Foto de perfil de ${target?.name || "estudante"} atualizada com sucesso!`,
      type: "success"
    });
  };

  const handleOpenCreateStudent = () => {
    setStudentToEdit(null);
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: Estudante) => {
    setStudentToEdit(student);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (data: Partial<Estudante>) => {
    if (studentToEdit) {
      const updated = estudantes.map((est) => {
        if (est.id === studentToEdit.id) {
          return {
            ...est,
            ...data,
            name: data.name || est.name,
            grade: data.grade || est.grade,
            parentName: data.parentName || est.parentName,
            parentPhone: data.parentPhone || est.parentPhone,
            parentEmail: data.parentEmail || est.parentEmail,
            reEnrollmentStatus: data.reEnrollmentStatus || est.reEnrollmentStatus
          };
        }
        return est;
      });
      saveEstudantesList(updated);
      setToast({
        message: `Ficha cadastral de ${data.name || studentToEdit.name} atualizada com sucesso!`,
        type: "success"
      });
    } else {
      const newId = `est-${Date.now()}`;
      const newStudent: Estudante = {
        id: newId,
        name: data.name || "Novo Estudante",
        grade: data.grade || "1º Ano Fundamental A",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=" + newId,
        occurrences: [],
        grades: [
          { subject: "Língua Portuguesa 📚", firstBimester: 9.0, secondBimester: 9.2, feedback: "Excelente adaptação inicial." },
          { subject: "Matemática Aplicada 📐", firstBimester: 8.5, secondBimester: 9.0, feedback: "Boa participação lógica." }
        ],
        withdrawalRules: [
          { id: `wr-${Date.now()}`, name: data.parentName || "Responsável Oficial", relationship: "Responsável", rg: "12.345.678-9", isAuthorized: true }
        ],
        reEnrollmentStatus: data.reEnrollmentStatus || "pendente",
        pickupQueueStatus: "em_casa",
        parentName: data.parentName || "Responsável",
        parentPhone: data.parentPhone || "(11) 98765-4321",
        parentEmail: data.parentEmail || "responsavel@familia.edu.br",
        pickupQueueStatusUpdatedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      };
      saveEstudantesList([...estudantes, newStudent]);
      setToast({
        message: `🎉 Estudante ${newStudent.name} matriculado(a) com sucesso!`,
        type: "success"
      });
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = estudantes.find((e) => e.id === studentId);
    if (!student) return;
    const confirmed = window.confirm ? confirm(`Deseja realmente remover a matrícula de ${student.name}?`) : true;
    if (confirmed) {
      const updated = estudantes.filter((e) => e.id !== studentId);
      saveEstudantesList(updated);
      if (selectedStudentId === studentId) {
        setSelectedStudentId(updated[0]?.id || "");
      }
      setToast({
        message: `Matrícula de ${student.name} removida do sistema!`,
        type: "info"
      });
    }
  };

  const handleDeleteComunicado = (id: string) => {
    const updated = comunicados.filter((c) => c.id !== id);
    saveComunicadosList(updated);
    setToast({
      message: "Comunicado removido do mural com sucesso!",
      type: "info"
    });
  };

  const handleCheckInStudent = (studentId: string) => {
    const updated = estudantes.map((est) => {
      if (est.id === studentId) {
        return {
          ...est,
          pickupQueueStatus: "fila_espera" as const,
          pickupQueueStatusUpdatedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        };
      }
      return est;
    });
    saveEstudantesList(updated);
    const target = updated.find((e) => e.id === studentId);
    setToast({
      message: `🔔 Check-in confirmado: ${target?.name || "Aluno"} aguardando na portaria!`,
      type: "success"
    });
  };

  const handleCheckOutStudent = (studentId: string) => {
    const updated = estudantes.map((est) => {
      if (est.id === studentId) {
        return {
          ...est,
          pickupQueueStatus: "saiu" as const,
          pickupQueueStatusUpdatedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        };
      }
      return est;
    });
    saveEstudantesList(updated);
    const target = updated.find((e) => e.id === studentId);
    setToast({
      message: `👋 Saída liberada: ${target?.name || "Aluno"} retirado com sucesso!`,
      type: "success"
    });
  };

  const saveAnnotationsList = (data: ChartAnnotation[]) => {
    setChartAnnotations(data);
    localStorage.setItem("school_chart_annotations", JSON.stringify(data));
    if (isOffline) {
      trackOfflineOperation("chart_annotations", "save_list", data);
    }
  };

  const saveMomentosList = (data: Momento[]) => {
    setMomentos(data);
    localStorage.setItem("school_momentos", JSON.stringify(data));
    if (isOffline) {
      trackOfflineOperation("momentos", "save_list", data);
    }
  };

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) {
      setToast({
        message: "Por favor, insira um título para a anotação.",
        type: "error"
      });
      return;
    }
    if (!annNote.trim()) {
      setToast({
        message: "Por favor, insira a nota de descrição.",
        type: "error"
      });
      return;
    }

    let formattedDate = annDate;
    if (annDate) {
      try {
        const [year, month, day] = annDate.split("-");
        if (year && month && day) {
          formattedDate = `${day}/${month}/${year}`;
        }
      } catch (err) {}
    }

    const newAnn: ChartAnnotation = {
      id: `ann-${Date.now()}`,
      studentId: activeStudent.id,
      bimester: annBimester,
      subject: annSubject,
      category: annTitle.trim(),
      note: annNote.trim(),
      author: userRole === "escola" ? "Coordenação Pedagógica" : "Professor Responsável",
      createdAt: formattedDate
    };

    const updated = [...chartAnnotations, newAnn];
    saveAnnotationsList(updated);

    setAnnTitle("");
    setAnnNote("");
    setAnnDate("2026-07-03");
    setIsAnnotationModalOpen(false);

    setToast({
      message: "Anotação de contexto pedagógico pinada no gráfico!",
      type: "success"
    });
  };

  const handleExportChartData = () => {
    try {
      const studentAnns = chartAnnotations.filter(
        (ann) => ann.studentId === activeStudent.id
      );

      const exportData = {
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        grade: activeStudent.grade,
        exportedAt: new Date().toISOString(),
        academicRecord: activeStudent.grades.map((g) => {
          const improvement = g.secondBimester - g.firstBimester;
          const improvementSign = improvement > 0 ? "+" : "";
          return {
            subject: g.subject,
            firstBimesterGrade: g.firstBimester,
            secondBimesterGrade: g.secondBimester,
            evolution: `${improvementSign}${improvement.toFixed(1)}`,
            pedagogicalFeedback: g.feedback || "Sem feedback cadastrado."
          };
        }),
        pinnedChartAnnotations: studentAnns.map((ann) => ({
          id: ann.id,
          bimester: ann.bimester,
          subject: ann.subject,
          title: ann.category,
          note: ann.note,
          author: ann.author,
          createdAt: ann.createdAt
        }))
      };

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(exportData, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      
      const safeName = activeStudent.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
      downloadAnchor.setAttribute(
        "download",
        `boletim_grafico_${safeName}_${new Date().getFullYear()}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setToast({
        message: "Dados do gráfico exportados com sucesso!",
        type: "success"
      });
    } catch (err) {
      console.error(err);
      setToast({
        message: "Erro ao exportar os dados do gráfico.",
        type: "error"
      });
    }
  };

  const saveBrandingData = (data: SchoolBranding) => {
    setBranding(data);
    localStorage.setItem("magic_school_branding", JSON.stringify(data));
  };

  const resetBrandingToDefault = () => {
    const defaultBranding = getDefaultBranding();
    saveBrandingData(defaultBranding);
  };

  const handleProfileSynced = (profile: UserProfile | null) => {
    setUserProfile(profile);
  };

  // Switch between students safely with absolute fallback to initial values
  const activeStudent = estudantes.find((e) => e.id === selectedStudentId) || estudantes[0] || initialEstudantes[0];

  const activeStudentAverage = activeStudent.grades.length > 0
    ? activeStudent.grades.reduce((sum, g) => sum + (g.firstBimester + g.secondBimester) / 2, 0) / activeStudent.grades.length
    : 0;
  const hasActiveMastery = activeStudentAverage >= masteryThreshold;

  // Celebrate student reaching Mastery
  useEffect(() => {
    if (!activeStudent) return;
    if (activeStudentAverage >= masteryThreshold) {
      setCelebratedStudents(prev => {
        if (prev.includes(activeStudent.id)) return prev;
        setToast({
          message: `🏆 PARABÉNS! ${activeStudent.name} alcançou o padrão de excelência acadêmica com Média Geral ${activeStudentAverage.toFixed(2)} e conquistou o prestigiado Selo de Mastery Elite! ✨🎉`,
          type: "mastery"
        });
        return [...prev, activeStudent.id];
      });
    }
  }, [activeStudent?.id, activeStudentAverage, masteryThreshold]);

  // Simulated active pick up ETA countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeStudent?.pickupQueueStatus === "liberado_chamado" && pickupEtaSec > 0) {
      timer = setInterval(() => {
        setPickupEtaSec((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeStudent?.pickupQueueStatus, pickupEtaSec]);

  // Whitelabel Pre-selected Themes
  const brandingPresets = {
    floresta_magica: {
      name: "Esmeralda Pedagógico",
      desc: "Tons Verdes",
      logo: "magic_hat",
      primary: "#059669", // Emerald green
      secondary: "#10b981", // Light emerald
      bgGradient: "from-emerald-50/60 to-green-50/20 dark:from-slate-950 dark:to-emerald-950/20",
      accentDot: "bg-emerald-600",
      accentText: "text-emerald-800 dark:text-emerald-400",
      accentBadge: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-200/50 dark:border-emerald-800/40",
      accentPrimaryClass: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500",
      accentSecondaryClass: "text-[#10b981] hover:text-emerald-900"
    },
    castelo_ouro: {
      name: "Âmbar Institucional",
      desc: "Tons Dourados",
      logo: "magic_hat",
      primary: "#d97706", // Amber 600 / Gold
      secondary: "#f59e0b", // Gold / Amber 500
      bgGradient: "from-amber-50/60 to-yellow-50/20 dark:from-slate-950 dark:to-amber-950/20",
      accentDot: "bg-amber-600",
      accentText: "text-amber-800 dark:text-amber-400",
      accentBadge: "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-200/50 dark:border-amber-800/40",
      accentPrimaryClass: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500",
      accentSecondaryClass: "text-[#f59e0b] hover:text-amber-900"
    },
    cosmos_oz: {
      name: "Violeta Contemporâneo",
      desc: "Tons Roxos",
      logo: "magic_hat",
      primary: "#7e22ce", // Purple 700
      secondary: "#a855f7", // Purple 500
      bgGradient: "from-purple-50/60 to-violet-50/20 dark:from-slate-950 dark:to-purple-950/20",
      accentDot: "bg-purple-600",
      accentText: "text-purple-800 dark:text-purple-400",
      accentBadge: "bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 border-purple-200/50 dark:border-purple-800/40",
      accentPrimaryClass: "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500",
      accentSecondaryClass: "text-[#a855f7] hover:text-purple-900"
    },
    orlando_magic: {
      name: "Azul Executivo",
      desc: "Tons Azuis",
      logo: "magic_hat",
      primary: "#0077C0", // Royal Blue
      secondary: "#C4CED4", // Metallic Silver
      bgGradient: "from-blue-50/60 to-slate-100/20 dark:from-slate-950 dark:to-slate-900",
      accentDot: "bg-blue-600",
      accentText: "text-blue-800 dark:text-blue-400",
      accentBadge: "bg-blue-50 dark:bg-slate-900 text-blue-900 dark:text-blue-200 border-blue-200/50 dark:border-blue-900/40",
      accentPrimaryClass: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
      accentSecondaryClass: "text-[#C4CED4] hover:text-slate-400"
    }
  };

  const activeThemePreset = (brandingPresets as any)[branding.themePreset] || brandingPresets.orlando_magic;

  // Real-time custom style overrides
  const customPrimaryBg = { backgroundColor: branding.primaryColor };
  const customPrimaryTextColor = { color: branding.primaryColor };
  const customPrimaryBorderColor = { borderColor: branding.primaryColor };
  const customSecondaryBg = { backgroundColor: branding.secondaryColor };
  const customSecondaryText = { color: branding.secondaryColor };

  // Toggle bookmarking state for a Comunicado
  const handleToggleSaveComunicado = async (id: string) => {
    const isSaved = localSavedComms.includes(id);
    const updated = isSaved
      ? localSavedComms.filter((cId) => cId !== id)
      : [...localSavedComms, id];
    setLocalSavedComms(updated);
    localStorage.setItem("guest_saved_comunicados", JSON.stringify(updated));

    if (userProfile) {
      try {
        const userRef = doc(db, "users", userProfile.uid);
        try {
          await setDoc(userRef, { savedComunicadoIds: updated }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, "users/" + userProfile.uid);
        }
      } catch (err) {
        console.error("Erro ao sincronizar com Firestore:", err);
      }
    }
  };

  // Open Announcement and record read receipt
  const handleOpenComunicado = useCallback((item: Comunicado) => {
    setSelectedComunicado(item);
    
    if (userRole === "pais" && activeStudent) {
      const studentId = activeStudent.id;
      const seen = item.seenByParent || [];
      if (!seen.includes(studentId) || !seen.includes("parent-1")) {
        const updatedSeen = Array.from(new Set([...seen, studentId, "parent-1"]));
        const updatedComms = comunicados.map((c) => {
          if (c.id === item.id) {
            return { ...c, seenByParent: updatedSeen };
          }
          return c;
        });
        saveComunicadosList(updatedComms);
        setSelectedComunicado({ ...item, seenByParent: updatedSeen });
      }
    }
  }, [userRole, activeStudent, comunicados]);

  // Reactions: Like / Dislike Communication Announcements (Parent interactive)
  const handleAnnouncementReaction = useCallback((id: string, type: "like" | "dislike") => {
    const updated = comunicados.map((item) => {
      if (item.id === id) {
        if (type === "like") {
          return { ...item, likesCount: (item.likesCount || 0) + 1 };
        } else {
          return { ...item, dislikesCount: (item.dislikesCount || 0) + 1 };
        }
      }
      return item;
    });
    saveComunicadosList(updated);
    
    // Update selected in-drawer state so reactions feel snappy
    if (selectedComunicado?.id === id) {
      if (type === "like") {
        setSelectedComunicado({
          ...selectedComunicado,
          likesCount: (selectedComunicado.likesCount || 0) + 1
        });
      } else {
        setSelectedComunicado({
          ...selectedComunicado,
          dislikesCount: (selectedComunicado.dislikesCount || 0) + 1
        });
      }
    }
  }, [comunicados, selectedComunicado]);

  // Add Comment on an Announcement (Parent interactive)
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedComunicado) return;

    const newComment = {
      id: "comment-" + Date.now(),
      authorName: userProfile?.displayName || "Responsável de " + activeStudent.name,
      text: commentText.trim(),
      timestamp: Date.now()
    };

    const updated = comunicados.map((item) => {
      if (item.id === selectedComunicado.id) {
        return {
          ...item,
          comments: [...(item.comments || []), newComment]
        };
      }
      return item;
    });

    saveComunicadosList(updated);
    setSelectedComunicado({
      ...selectedComunicado,
      comments: [...(selectedComunicado.comments || []), newComment]
    });
    setCommentText("");
  };

  // Content Moderation System Handlers
  const saveModerationReports = (reports: ContentReport[]) => {
    setModerationReports(reports);
    localStorage.setItem("school_moderation_reports", JSON.stringify(reports));
  };

  const saveUserWarnings = (warnings: UserWarning[]) => {
    setUserWarnings(warnings);
    localStorage.setItem("school_user_warnings", JSON.stringify(warnings));
  };

  const handleOpenReportModal = (target: ReportTarget) => {
    setReportTarget(target);
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = (reportData: Omit<ContentReport, "id" | "timestamp" | "status">) => {
    const newReport: ContentReport = {
      ...reportData,
      id: "rep-" + Date.now(),
      timestamp: Date.now(),
      status: "pending"
    };

    const updated = [newReport, ...moderationReports];
    saveModerationReports(updated);
    setIsReportModalOpen(false);
    setToast({
      message: "✓ Denúncia enviada com sucesso! A equipe de moderação analisará a ocorrência com discrição.",
      type: "success"
    });
  };

  const handleUpdateReportStatus = (
    reportId: string,
    status: ReportStatus,
    moderatorNotes?: string,
    actionTaken?: "removed" | "warned" | "removed_and_warned" | "dismissed" | "none",
    warningData?: Omit<UserWarning, "id" | "issuedAt" | "acknowledged">
  ) => {
    let updatedWarnings = [...userWarnings];
    let createdWarning: UserWarning | undefined;

    if (warningData) {
      createdWarning = {
        ...warningData,
        id: "warn-" + Date.now(),
        issuedAt: Date.now(),
        acknowledged: false
      };
      updatedWarnings = [createdWarning, ...updatedWarnings];
      saveUserWarnings(updatedWarnings);
    }

    const updatedReports = moderationReports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          status,
          moderatorNotes: moderatorNotes !== undefined ? moderatorNotes : r.moderatorNotes,
          actionTaken: actionTaken || r.actionTaken,
          reviewedBy: userProfile?.displayName || "Diretoria & Moderação",
          reviewedAt: Date.now(),
          warningIssued: createdWarning || r.warningIssued
        };
      }
      return r;
    });

    saveModerationReports(updatedReports);
  };

  const handleRemoveContentByModerator = (
    contentType: ReportedContentType,
    contentId: string,
    contentParentId?: string
  ) => {
    if (contentType === "comment" && contentParentId) {
      const updatedComms = comunicados.map((item) => {
        if (item.id === contentParentId && item.comments) {
          return {
            ...item,
            comments: item.comments.filter((c) => c.id !== contentId)
          };
        }
        return item;
      });
      saveComunicadosList(updatedComms);
      setToast({
        message: "Comentário removido da visualização pública da comunidade escolar.",
        type: "info"
      });
    } else if (contentType === "photo") {
      const updatedPhotos = classroomPhotos.filter((p) => p.id !== contentId);
      setClassroomPhotos(updatedPhotos);
      localStorage.setItem("school_classroom_photos", JSON.stringify(updatedPhotos));
      setToast({
        message: "Foto removida da galeria em conformidade com as diretrizes de moderação.",
        type: "info"
      });
    } else if (contentType === "comunicado") {
      const updatedComms = comunicados.filter((c) => c.id !== contentId);
      saveComunicadosList(updatedComms);
      setToast({
        message: "Comunicado arquivado/removido pelo moderador.",
        type: "info"
      });
    }
  };

  const handleRestoreContentByModerator = (
    _contentType: ReportedContentType,
    _contentId: string,
    _contentParentId?: string
  ) => {
    setToast({
      message: "Conteúdo revalidado nos registros da instituição.",
      type: "info"
    });
  };

  const handleIssueWarningByModerator = (warningData: Omit<UserWarning, "id" | "issuedAt" | "acknowledged">) => {
    const newWarning: UserWarning = {
      ...warningData,
      id: "warn-" + Date.now(),
      issuedAt: Date.now(),
      acknowledged: false
    };
    saveUserWarnings([newWarning, ...userWarnings]);
    setToast({
      message: `Advertência emitida com sucesso para ${warningData.userName}.`,
      type: "success"
    });
  };

  const handleAcknowledgeWarning = (warningId: string) => {
    const updated = userWarnings.map((w) => {
      if (w.id === warningId) {
        return {
          ...w,
          acknowledged: true,
          acknowledgedAt: Date.now()
        };
      }
      return w;
    });
    saveUserWarnings(updated);
    setToast({
      message: "Ciência registrada. O aviso foi arquivado em seu histórico.",
      type: "success"
    });
  };

  const handleSendQuickComment = useCallback((comunicadoId: string) => {
    const text = quickCommentTexts[comunicadoId]?.trim();
    if (!text) return;

    const newComment = {
      id: "comment-" + Date.now(),
      authorName: userProfile?.displayName || (activeStudent ? "Família de " + activeStudent.name : "Responsável"),
      text,
      timestamp: Date.now()
    };

    const updated = comunicados.map((item) => {
      if (item.id === comunicadoId) {
        return {
          ...item,
          comments: [...(item.comments || []), newComment]
        };
      }
      return item;
    });

    saveComunicadosList(updated);
    setQuickCommentTexts((prev) => ({ ...prev, [comunicadoId]: "" }));
    setToast({
      message: "Comentário publicado no mural!",
      type: "success"
    });
  }, [quickCommentTexts, userProfile, activeStudent, comunicados]);

  const handleToggleComunicadoComments = useCallback((id: string) => {
    setExpandedComunicadoComments((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  const handleQuickCommentChange = useCallback((id: string, text: string) => {
    setQuickCommentTexts((prev) => ({ ...prev, [id]: text }));
  }, []);

  const handleOpenReportForComunicado = useCallback((item: Comunicado) => {
    handleOpenReportModal({
      contentType: "comunicado",
      contentId: item.id,
      contentTitle: item.title,
      contentSnippet: item.content.slice(0, 160),
      contentAuthorName: item.authorName || "Coordenação Pedagógica"
    });
  }, []);

  const pendingModerationReportsCount = useMemo(() => {
    return moderationReports.filter((r) => r.status === "pending").length;
  }, [moderationReports]);

  const activeUserWarning = useMemo(() => {
    return userWarnings.find((w) => !w.acknowledged);
  }, [userWarnings]);

  // Simulate ERP integration tests
  const handleTestErpConnection = () => {
    if (!erpApiKey.trim()) {
      setToast({
        message: "Por favor, preencha a Chave de API / Token do seu ERP Financeiro para conectar.",
        type: "error"
      });
      return;
    }
    setErpSyncStatus("sync_testing");
    setTimeout(() => {
      setErpSyncStatus("connected");
      setToast({
        message: "Conexão estabelecida com sucesso! Webhook gerado. Magic Learning sincronizará os pagamentos, notas fiscais e pendências automaticamente com o ERP escolhido.",
        type: "success"
      });
    }, 2000);
  };

  // Access Control: Authorize/Revoke grandma or driver
  const handleToggleAuthorizationStatus = (relativeId: string) => {
    const updatedEstudantes = estudantes.map((est) => {
      if (est.id === selectedStudentId) {
        return {
          ...est,
          withdrawalRules: est.withdrawalRules.map((rule) => {
            if (rule.id === relativeId) {
              return { ...rule, isAuthorized: !rule.isAuthorized };
            }
            return rule;
          })
        };
      }
      return est;
    });
    saveEstudantesList(updatedEstudantes);
  };

  // Access Control: Insert New Relative
  const handleAddNewAuthorizedPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim() || !newPersonRg.trim()) return;

    const newPerson = {
      id: "pick-" + Date.now(),
      name: newPersonName.trim(),
      relationship: newPersonRelationship,
      rg: newPersonRg.trim(),
      isAuthorized: true
    };

    const updatedEstudantes = estudantes.map((est) => {
      if (est.id === selectedStudentId) {
        return {
          ...est,
          withdrawalRules: [...est.withdrawalRules, newPerson]
        };
      }
      return est;
    });

    saveEstudantesList(updatedEstudantes);
    setNewPersonName("");
    setNewPersonRg("");
    setToast({
      message: `${newPersonName} adicionado à lista de pessoas autorizadas para retirada!`,
      type: "success"
    });
  };

  // Express Pickup Queue Simulator (Estou a caminho!)
  const handleTriggerPickupSignal = () => {
    const updatedEstudantes = estudantes.map((est) => {
      if (est.id === selectedStudentId) {
        return {
          ...est,
          pickupQueueStatus: "liberado_chamado" as const,
          pickupQueueStatusUpdatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      }
      return est;
    });
    saveEstudantesList(updatedEstudantes);
    setPickupEtaSec(240); // Reset simulation ETA to 4 minutes (240 seconds)
    setToast({
      message: `🚗 Sinal emitido com sucesso! A portaria e a tutora do(a) ${activeStudent.name} foram notificadas. Acompanhe a aproximação pelo rastreamento ativo abaixo.`,
      type: "success"
    });
  };

  // Settle single bill
  const updateCobrancasState = (newCobrancasList: Cobranca[]) => {
    setCobrancas(newCobrancasList);
    localStorage.setItem("school_cobrancas", JSON.stringify(newCobrancasList));
    if (isOffline) {
      trackOfflineOperation("cobrancas", "save_list", newCobrancasList);
    }
  };

  const getCobrancaReminderSuggestions = () => {
    return cobrancas.filter((cob) => {
      if (cob.status !== "pendente") return false;
      
      const isMensalidade = 
        cob.category?.toLowerCase().includes("mensalidade") || 
        cob.title?.toLowerCase().includes("mensalidade");
      if (!isMensalidade) return false;

      // Parse cob.dueDate (DD/MM/YYYY)
      const parts = cob.dueDate.split("/");
      if (parts.length !== 3) return false;
      const [day, month, year] = parts.map(Number);
      const due = new Date(year, month - 1, day);
      due.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Is it exactly 3 days away?
      if (diffDays !== 3) return false;

      // Has a reminder already been created for this cobranca?
      const alreadyHasReminder = reminders.some(
        (rem) => rem.notes?.includes(`ID da Cobrança: ${cob.id}`)
      );

      // Was it dismissed?
      const wasDismissed = dismissedCobrancaSuggestions.includes(cob.id);

      return !alreadyHasReminder && !wasDismissed;
    });
  };

  const getInvoicesVencendoEmMenosDeCincoDias = () => {
    return cobrancas.filter((cob) => {
      if (cob.status !== "pendente") return false;
      const parts = cob.dueDate.split("/");
      if (parts.length !== 3) return false;
      const [day, month, year] = parts.map(Number);
      const due = new Date(year, month - 1, day);
      due.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 5;
    });
  };

  const handleSimulateThreeDaysDue = () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const day = String(threeDaysFromNow.getDate()).padStart(2, "0");
    const month = String(threeDaysFromNow.getMonth() + 1).padStart(2, "0");
    const year = threeDaysFromNow.getFullYear();
    const simulatedDueDate = `${day}/${month}/${year}`;

    const updatedCobs = cobrancas.map((cob) => {
      if (cob.id === "cob-2") {
        return {
          ...cob,
          dueDate: simulatedDueDate,
          status: "pendente" as const,
        };
      }
      return cob;
    });

    updateCobrancasState(updatedCobs);
    setToast({
      message: "🧪 Mensalidade de Julho ajustada para vencer em exatamente 3 dias! A sugestão de lembrete automático agora está ativa.",
      type: "success"
    });
  };

  const handleCreateReminderFromSuggestion = (cob: Cobranca) => {
    const [dayStr, monthStr, yearStr] = cob.dueDate.split("/");
    const reminderDateIso = `${yearStr}-${monthStr}-${dayStr}`;
    const studentObj = activeStudent || estudantes.find(e => e.id === selectedStudentId) || estudantes[0];

    const newRem: ScheduledReminder = {
      id: "rem-auto-cobranca-" + cob.id + "-" + Date.now(),
      studentId: studentObj?.id || "est-1",
      studentName: studentObj?.name || "Nicolas Nogueira",
      title: `⚠️ Vencimento de ${cob.title}`,
      type: "outro",
      date: reminderDateIso,
      time: "09:00",
      notes: `Lembrete de vencimento da mensalidade escolar. ID da Cobrança: ${cob.id}. Valor: R$ ${cob.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Por favor, evite juros efetuando o pagamento até ${cob.dueDate}.`,
      active: true
    };

    const updated = [newRem, ...reminders];
    setReminders(updated);
    localStorage.setItem("school_scheduled_reminders", JSON.stringify(updated));

    setToast({
      message: `🔔 Lembrete de pagamento agendado para o dia ${cob.dueDate}!`,
      type: "success"
    });

    triggerPushNotification({
      title: `Lembrete Criado: Vencimento de ${cob.title}`,
      body: `Agendado com sucesso para o dia ${cob.dueDate}.`,
      targetTab: "comunicados",
      iconType: "calendar",
      studentName: studentObj?.name || "Estudante"
    });
  };

  const handleOpenCrmReminderSuggestion = (cob: Cobranca) => {
    setCrmSuggestionCob(cob);
    setCrmReminderTitle(`⚠️ Lembrete CRM: Vencimento de ${cob.title}`);
    
    // Parse cob.dueDate (DD/MM/YYYY) to YYYY-MM-DD
    const parts = cob.dueDate.split("/");
    if (parts.length === 3) {
      const [dayStr, monthStr, yearStr] = parts;
      setCrmReminderDate(`${yearStr}-${monthStr}-${dayStr}`);
    } else {
      setCrmReminderDate("");
    }
    setCrmReminderTime("09:00");
    setCrmReminderChannel("whatsapp");
    setCrmReminderNotes(`Olá, responsável pedagógico! Lembramos que a fatura '${cob.title}' no valor de R$ ${cob.amount.toFixed(2)} vence em ${cob.dueDate}. Copie a chave PIX ou o código de barras no seu portal para liquidação instantânea via ERP.`);
  };

  const handleCreateReminderFromInvoice = (invoice: Cobranca) => {
    if (!invoice) return;
    
    // Extracting id, amount, and dueDate as requested
    const { id, amount, dueDate } = invoice;
    
    // Pre-fill and open CRM Reminder Suggestion
    handleOpenCrmReminderSuggestion(invoice);

    // Switch/trigger CRM view (where AutomatedRemindersCrm resides)
    setUserRole("escola");
    setSchoolActiveTab("alunos");
    setAlunosSubTab("rematricula");
    setActiveCrmSubSection("automated_reminders");

    setToast({
      message: `🎯 Iniciando agendamento CRM de R$ ${amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (Vencimento: ${dueDate})`,
      type: "info"
    });
  };

  const handleSaveCrmReminderSuggestion = () => {
    if (!crmSuggestionCob) return;

    const studentObj = activeStudent || estudantes.find(e => e.id === selectedStudentId) || estudantes[0];

    // Calculate daysBefore
    let calculatedDaysBefore = 3;
    const parts = crmSuggestionCob.dueDate.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      const due = new Date(year, month - 1, day);
      due.setHours(0,0,0,0);
      const remParts = crmReminderDate.split("-").map(Number);
      if (remParts.length === 3) {
        const [ryear, rmonth, rday] = remParts;
        const rem = new Date(ryear, rmonth - 1, rday);
        rem.setHours(0,0,0,0);
        const diff = due.getTime() - rem.getTime();
        calculatedDaysBefore = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      }
    }

    // Build the hybrid CRM & Agenda reminder object
    const newRem: any = {
      id: "rem-auto-crm-" + crmSuggestionCob.id + "-" + Date.now(),
      studentId: studentObj?.id || "est-1",
      studentName: studentObj?.name || "Nicolas Nogueira",
      title: crmReminderTitle,
      type: "outro" as const,
      date: crmReminderDate,
      time: crmReminderTime,
      notes: crmReminderNotes,
      active: true,

      // CRM specific fields:
      cobrancaId: crmSuggestionCob.id,
      cobrancaTitle: crmSuggestionCob.title,
      dueDate: crmSuggestionCob.dueDate,
      amount: crmSuggestionCob.amount,
      channel: crmReminderChannel,
      daysBefore: calculatedDaysBefore,
      scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
      status: "agendado" as const
    };

    const updated = [newRem, ...reminders];
    setReminders(updated);
    localStorage.setItem("school_scheduled_reminders", JSON.stringify(updated));

    setToast({
      message: `🔔 Lembrete CRM para ${crmSuggestionCob.title} agendado por ${crmReminderChannel.toUpperCase()} com sucesso!`,
      type: "success"
    });

    triggerPushNotification({
      title: `Lembrete CRM Criado: ${crmSuggestionCob.title}`,
      body: `Agendado via ${crmReminderChannel.toUpperCase()} para o dia ${crmReminderDate.split("-").reverse().join("/")} às ${crmReminderTime}.`,
      targetTab: "comunicados",
      iconType: "calendar",
      studentName: studentObj?.name || "Estudante"
    });

    setCrmSuggestionCob(null);
  };

  const handleSimulatePayment = (cobId: string) => {
    const updated = cobrancas.map((cob) => {
      if (cob.id === cobId) return { ...cob, status: "pago" as const };
      return cob;
    });
    updateCobrancasState(updated);
    if (billingDetail?.id === cobId) {
      setBillingDetail({ ...billingDetail, status: "pago" });
    }
    setToast({
      message: "🎯 Pagamento registrado e liquidado com sucesso no ERP escolar! Recibo gerado.",
      type: "success"
    });
  };

  const handlePurchaseExtra = (opt: typeof opcoesExtras[0]) => {
    // Check if duplicate purchase
    const alreadyPurchased = cobrancas.some(c => c.title.includes(opt.title));
    if (alreadyPurchased) {
      setToast({
        message: `⚠️ Atividade "${opt.title}" já se encontra em sua lista de faturas escolares.`,
        type: "error"
      });
      return;
    }

    const newCob: Cobranca = {
      id: `ext-${Date.now()}`,
      title: `${opt.title} (Contratado via Super-App)`,
      dueDate: opt.dueDate,
      timestamp: Date.now(),
      amount: opt.amount,
      status: "pendente",
      documentId: `TX-${String(Math.floor(10000 + Math.random() * 90000))}-X`,
      category: opt.cat,
      tags: ["extra-curricular", "opcional", "pago-via-app"]
    };

    const updated = [newCob, ...cobrancas];
    updateCobrancasState(updated);
    setToast({
      message: `🎉 "${opt.title}" contratado! Cobrança integrada ao ERP com sucesso.`,
      type: "success"
    });
  };

  const handleNegotiationCompleted = (acordoCobIds: string[], newInstallments: Cobranca[]) => {
    const updated = cobrancas.map((cob) => {
      if (acordoCobIds.includes(cob.id)) {
        return { ...cob, status: "pago" as const, title: cob.title + " (Acordado/Substituído)" };
      }
      return cob;
    });
    const finalCobs = [...updated, ...newInstallments];
    updateCobrancasState(finalCobs);
    setToast({
      message: `🤝 Acordo de parcelamento ativado! ${newInstallments.length} parcelas integradas ao ERP escolar.`,
      type: "success"
    });
  };

  const handleRegenerateBoleto = (cob: Cobranca) => {
    const todayStr = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    // Compute updated fees if expired (vencido)
    let extraFee = 0;
    if (cob.status === "vencido") {
      extraFee = (cob.amount * 0.02) + 3.50; // 2% penalty + 2nd copy emit fee
    }

    const updatedCobs = cobrancas.map((item) => {
      if (item.id === cob.id) {
        return {
          ...item,
          dueDate: todayStr,
          amount: item.amount + extraFee,
          title: item.title.includes("2ª Via Atualizada") ? item.title : item.title + " (2ª Via Atualizada)"
        };
      }
      return item;
    });

    updateCobrancasState(updatedCobs);

    // Open detail of the updated charge
    const updatedTarget = updatedCobs.find(x => x.id === cob.id) || cob;
    setBillingDetail(updatedTarget);

    setToast({
      message: `📄 Segunda via gerada com sucesso! Vencimento estendido para hoje (${todayStr}) com correção de encargos integrada ao ERP.`,
      type: "success"
    });
  };

  // Magical Re-enrollment processor (Rematrícula)
  const handleProcessReEnrollment = () => {
    const updatedEstudantes = estudantes.map((est) => {
      if (est.id === selectedStudentId) {
        return {
          ...est,
          reEnrollmentStatus: "concluido" as const
        };
      }
      return est;
    });
    saveEstudantesList(updatedEstudantes);
    setToast({
      message: `Parabéns! Rematrícula realizada para ${activeStudent.name}! O contrato para o ano letivo de 2027 foi assinado eletronicamente e sincronizado ao ERP financeiro de sua escola principal.`,
      type: "success"
    });
  };

  // Toggle microphone dictation for Relatório Pedagógico in Diário de Rotina
  const toggleDictationNote = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      if (isDictatingNote) {
        setIsDictatingNote(false);
        setToast({ message: "Ditado por voz pausado.", type: "info" });
      } else {
        setIsDictatingNote(true);
        setDictationError(null);
        setToast({ message: "🎙️ Microfone ativado! Fale as observações pedagógicas...", type: "info" });

        // High-fidelity simulated audio dictation fallback
        const samplePhrases = [
          " Aluno apresentou excelente participação nas dinâmicas de sala hoje.",
          " Demonstrou ótimo raciocínio e boa interação com os colegas de turma.",
          " Manteve-se focado, calmo e receptivo durante todo o expediente."
        ];
        let idx = 0;
        const timer = setInterval(() => {
          if (idx < samplePhrases.length) {
            setLogTeacherNote((prev) => prev + samplePhrases[idx]);
            idx++;
          } else {
            clearInterval(timer);
            setIsDictatingNote(false);
            setToast({ message: "Ditado por voz concluído com sucesso!", type: "success" });
          }
        }, 1800);
      }
      return;
    }

    if (isDictatingNote) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Speech recognition stop warning:", e);
        }
      }
      setIsDictatingNote(false);
      setToast({ message: "Ditado por voz pausado.", type: "info" });
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "pt-BR";

        recognition.onstart = () => {
          setIsDictatingNote(true);
          setDictationError(null);
          setToast({ message: "🎙️ Microfone ativo! Fale agora para ditar o relatório pedagógico...", type: "info" });
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setLogTeacherNote((prev) => (prev ? prev + " " + transcript.trim() : transcript.trim()));
            } else {
              currentTranscript += transcript;
            }
          }
          setDictationTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsDictatingNote(false);
          if (event.error === "not-allowed" || event.error === "permission-denied") {
            setDictationError("Permissão de acesso ao microfone negada no navegador. Habilite o microfone para utilizar o ditado.");
            setToast({ message: "Acesso ao microfone foi bloqueado no navegador.", type: "error" });
          } else if (event.error === "no-speech") {
            setDictationError("Nenhuma fala detectada. Fale mais perto do microfone e tente novamente.");
          } else {
            setDictationError(`Aviso de áudio (${event.error}). O ditado por voz foi interrompido.`);
          }
        };

        recognition.onend = () => {
          setIsDictatingNote(false);
          setDictationTranscript("");
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setIsDictatingNote(false);
        setDictationError("Não foi possível acessar o microfone. Verifique o dispositivo de entrada.");
      }
    }
  };

  // Teacher/School-authored student logger update (supports Individual & Bulk Class Logging)
  const handleSaveOccurrenceByTeacher = () => {
    if (logType === "coletivo" && selectedBulkLogStudentIds.length === 0) {
      setToast({
        message: "Selecione pelo menos um estudante na lista abaixo para o lançamento coletivo em massa!",
        type: "error"
      });
      return;
    }

    setIsPublishingLog(true);
    setPublishLogSuccess(false);

    const currentWeekday = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
    const formattedDate = "Hoje (" + currentWeekday.charAt(0).toUpperCase() + currentWeekday.slice(1) + ")";
    const firestoreGeneratedDocId = "occ-firestore-" + Date.now();

    setTimeout(() => {
      if (logType === "coletivo") {
        const updated = estudantes.map((est) => {
          if (selectedBulkLogStudentIds.includes(est.id)) {
            const newOcc = {
              id: firestoreGeneratedDocId + "-" + est.id,
              date: formattedDate,
              meals: {
                lunch: logLunch,
                snack: logSnack,
                details: logMealDetails.trim() || "Teve uma ótima refeição monitorada pelos instrutores."
              },
              medicated: {
                wasMedicated: logWasMedicated,
                medicationName: logWasMedicated ? logMedicationName.trim() : undefined,
                doseTime: logWasMedicated ? logDoseTime.trim() : undefined,
                details: logWasMedicated ? logMedicationDetails.trim() || "Prescrição administrada corretamente." : "Nenhum medicamento necessário."
              },
              sleep: {
                durationStr: logSleepDuration,
                details: logSleepDetails.trim() || "Dormiu tranquilamente durante o período de repouso."
              },
              behaviorState: logBehaviorState,
              teacherNote: logTeacherNote.trim() || "Excelente envolvimento durante as dinâmicas coletivas da turma!"
            };

            // Simulate push notification for each student
            triggerPushNotification({
              title: `📝 Nova Rotina Escolar: ${est.name}`,
              body: `Relatório em massa publicado: ${logTeacherNote.trim() || "Consulte alimentação e recado da coordenação."}`,
              targetTab: "diaadia",
              iconType: "occurrence",
              studentName: est.name
            });

            return {
              ...est,
              occurrences: [newOcc, ...est.occurrences]
            };
          }
          return est;
        });

        saveEstudantesList(updated);
        setPublishedDocInfo({
          id: firestoreGeneratedDocId,
          name: `${selectedBulkLogStudentIds.length} estudantes`
        });

        setToast({
          message: `🔥 Sucesso! Diário de classe publicado em lote no Firebase Firestore para ${selectedBulkLogStudentIds.length} alunos simultaneamente!`,
          type: "success"
        });

      } else {
        const targetStudent = estudantes.find((e) => e.id === logStudentId);
        if (!targetStudent) {
          setIsPublishingLog(false);
          return;
        }

        const newOcc = {
          id: firestoreGeneratedDocId,
          date: formattedDate,
          meals: {
            lunch: logLunch,
            snack: logSnack,
            details: logMealDetails.trim() || "Teve uma ótima refeição monitorada pelos instrutores."
          },
          medicated: {
            wasMedicated: logWasMedicated,
            medicationName: logWasMedicated ? logMedicationName.trim() : undefined,
            doseTime: logWasMedicated ? logDoseTime.trim() : undefined,
            details: logWasMedicated ? logMedicationDetails.trim() || "Prescrição administrada corretamente." : "Nenhum medicamento necessário."
          },
          sleep: {
            durationStr: logSleepDuration,
            details: logSleepDetails.trim() || "Dormiu tranquilamente durante o período de repouso."
          },
          behaviorState: logBehaviorState,
          teacherNote: logTeacherNote.trim() || "Excelente envolvimento durante o expediente escolar!"
        };

        const updated = estudantes.map((est) => {
          if (est.id === logStudentId) {
            return {
              ...est,
              occurrences: [newOcc, ...est.occurrences]
            };
          }
          return est;
        });

        saveEstudantesList(updated);
        setPublishedDocInfo({
          id: firestoreGeneratedDocId,
          name: targetStudent.name
        });
        
        triggerPushNotification({
          title: `📝 Nova Rotina Escolar: ${targetStudent.name}`,
          body: `Relatório diário de hoje publicado: ${logTeacherNote.trim() || "Consulte alimentação, sono e recado da coordenação."}`,
          targetTab: "diaadia",
          iconType: "occurrence",
          studentName: targetStudent.name
        });
        
        setToast({
          message: `Diário de classe publicado com sucesso para ${targetStudent.name}! Os pais já podem acessar essa informação de forma sincronizada via Firebase.`,
          type: "success"
        });
      }

      setIsPublishingLog(false);
      setPublishLogSuccess(true);

      setTimeout(() => {
        setPublishLogSuccess(false);
      }, 4500);

      // Reset form fields & stop microphone dictation if active
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      setIsDictatingNote(false);
      setDictationTranscript("");
      setLogTeacherNote("");
      setLogMealDetails("");
      setLogMedicationName("");
      setLogDoseTime("");
      setLogMedicationDetails("");
      setLogSleepDetails("");
      setLogWasMedicated(false);
    }, 750);
  };

  // Daily Summary Broadcaster Handlers
  const handleSendDailySummaryBroadcast = () => {
    setIsDailySummarySending(true);
    setDailySummarySendingStep("Agrupando relatórios de hoje...");
    
    setTimeout(() => {
      setDailySummarySendingStep("Gerando compilação estruturada (HTML + JSON)...");
      
      setTimeout(() => {
        setDailySummarySendingStep("Formatando disparo para canais de push e WhatsApp...");
        
        setTimeout(() => {
          setDailySummarySendingStep("Disparando notificações em tempo real...");
          
          setTimeout(() => {
            let sentCount = 0;
            estudantes.forEach((est) => {
              const todayOcc = est.occurrences.find((occ) => occ.date && occ.date.startsWith("Hoje"));
              if (todayOcc) {
                sentCount++;
                triggerPushNotification({
                  title: `📢 Resumo do Dia de ${est.name}`,
                  body: `O diário de hoje de ${est.name} foi finalizado e enviado aos responsáveis com sucesso!`,
                  targetTab: "diaadia",
                  iconType: "occurrence",
                  studentName: est.name
                });
              }
            });

            setIsDailySummarySending(false);
            setDailySummarySent(true);
            setToast({
              message: `📢 Resumo diário consolidado enviado com sucesso para os pais de ${sentCount} alunos!`,
              type: "success"
            });
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const handleCloseDailySummaryModal = () => {
    setIsDailySummaryModalOpen(false);
    setIsDailySummarySending(false);
    setDailySummarySent(false);
    setDailySummarySendingStep("");
  };

  const handleCreateAnnouncementByTeacher = () => {
    if (!newAnnTitle.trim() || !newAnnContent.trim()) {
      setToast({
        message: "Por favor, preencha o título e o conteúdo do comunicado.",
        type: "error"
      });
      return;
    }

    const newComm: Comunicado = {
      id: "comm-" + Date.now(),
      title: newAnnTitle.trim(),
      date: "Hoje (" + new Date().toLocaleDateString("pt-BR") + ")",
      timestamp: Date.now(),
      previewText: newAnnContent.trim().substring(0, 80) + "...",
      content: newAnnContent.trim(),
      category: newAnnCategory,
      authorName: "Secretaria Escolar",
      likesCount: 0,
      dislikesCount: 0,
      comments: [],
      tags: [newAnnCategory.toUpperCase(), "OFICIAL"]
    };

    const updated = [newComm, ...comunicados];
    saveComunicadosList(updated);
    
    // Simulate push notification dispatch
    triggerPushNotification({
      title: `🔔 Novo Comunicado: ${newAnnTitle.trim()}`,
      body: newAnnContent.trim().length > 100 
        ? newAnnContent.trim().substring(0, 100) + "..." 
        : newAnnContent.trim(),
      targetTab: "comunicados",
      iconType: "announcement"
    });
    
    setToast({
      message: "Comunicado publicado com sucesso no mural escolar de todos os responsáveis!",
      type: "success"
    });
    
    // Reset fields
    setNewAnnTitle("");
    setNewAnnContent("");
  };

  const handleTestErpSync = () => {
    setSyncLoading(true);
    setSyncResult(null);

    // Simulate standard connection latency representing real-time API response!
    setTimeout(() => {
      const nowStr = new Date().toLocaleString("pt-BR");
      setSyncLoading(false);
      setSyncResult([
        `[${new Date().toLocaleTimeString()}] Conectando ao servidor: ${erpWebhookUrl}`,
        `[${new Date().toLocaleTimeString()}] Handshake SSL estabelecido com sucesso...`,
        `[${new Date().toLocaleTimeString()}] Validando Token Bearer JWT: *******${erpApiKey.substring(Math.max(0, erpApiKey.length - 4)) || "TOKEN_DEFAULT"} (Válido)`,
        `[${new Date().toLocaleTimeString()}] Sincronizando com ${erpName.toUpperCase()}:`,
        `  >> [Boletos] Baixando faturas pendentes de mensalidades... Sincronização completa.`,
        `  >> [Alunos] Sincronizando boletins e fichas cadastrais de 450 alunos... OK.`,
        `  >> [Notas] Sincronizando avaliações e boletins curriculares... OK.`,
        `[${new Date().toLocaleTimeString()}] ✓ Sincronização Concluída com Sucesso! 0 erros, 0 avisos.`
      ]);
      setErpSyncStatus("connected");
      setErpLastSyncTime(nowStr);
    }, 1200);
  };

  const handleGenerateParecer = async () => {
    const student = estudantes.find(e => e.id === parecerStudentId);
    if (!student) {
      setToast({ message: "Selecione um estudante válido.", type: "error" });
      return;
    }

    setIsGeneratingParecer(true);
    setGeneratedParecer("");

    try {
      const response = await fetch("/api/generate-pedagogical-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: student.name,
          grade: student.grade,
          grades: student.grades,
          occurrences: student.occurrences,
          focusArea: `${parecerFocusArea} (Tom: ${parecerTone})`
        })
      });

      if (!response.ok) {
        throw new Error("Falha na requisição ao servidor.");
      }

      const data = await response.json();
      if (data.success && data.report) {
        setGeneratedParecer(data.report);
        setToast({ message: `Parecer descritivo gerado com sucesso para ${student.name}!`, type: "success" });
      } else {
        throw new Error(data.error || "Ocorreu um erro ao gerar o parecer.");
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        message: err.message || "Erro de conexão ao servidor de IA.",
        type: "error"
      });
    } finally {
      setIsGeneratingParecer(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const primaryColor = [66, 51, 38]; // #423326
      const accentColor = [180, 83, 9]; // #B45309 (amber-700)
      const textDark = [51, 65, 85]; // slate-700
      
      // Page styling / border
      doc.setDrawColor(229, 211, 178); // cream border
      doc.setLineWidth(1);
      doc.rect(5, 5, 200, 287);
      doc.rect(7, 7, 196, 283);

      // Header Layout
      doc.setFillColor(252, 248, 238); // warm soft cream background for header
      doc.rect(8, 8, 194, 40, 'F');
      
      // Decorative corner lines
      doc.setDrawColor(180, 83, 9);
      doc.setLineWidth(0.5);
      doc.line(12, 12, 22, 12);
      doc.line(12, 12, 12, 22);
      doc.line(198, 12, 188, 12);
      doc.line(198, 12, 198, 22);
      
      // School Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      const schoolTitle = branding.schoolName.toUpperCase();
      doc.text(schoolTitle, 15, 23);
      
      // Document Title
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("BOLETIM DE DESEMPENHO PEDAGÓGICO OFICIAL", 15, 29);
      doc.line(15, 31, 195, 31);

      // School Subtitle / Year
      doc.setFontSize(8);
      doc.setTextColor(112, 128, 144);
      doc.text("Ano Letivo de Referência: 2026 • Ciclo Integrado Acadêmico", 15, 37);
      
      // Quick stats on the right of the header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(142, 14, 52, 28);
      doc.text("MÉDIA GERAL", 146, 20);
      
      // Calculate overall average
      const gradesCount = activeStudent.grades.length;
      const gradesSum = activeStudent.grades.reduce((sum, g) => sum + (g.firstBimester + g.secondBimester) / 2, 0);
      const averageGrade = gradesCount > 0 ? gradesSum / gradesCount : 0;
      
      doc.setFontSize(16);
      doc.setTextColor(16, 185, 129); // emerald green
      doc.text(averageGrade.toFixed(2), 146, 27);
      
      doc.setFontSize(8);
      doc.setTextColor(112, 128, 144);
      doc.setFont("helvetica", "normal");
      doc.text("Situação: Aprovado Direto", 146, 33);
      doc.text("Frequência Parcial: 98.4%", 146, 37);

      // Student info block
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(10, 52, 190, 24, 'F');
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(10, 52, 190, 24, 'D');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("ESTUDANTE:", 14, 59);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(activeStudent.name, 45, 59);

      doc.setFont("helvetica", "bold");
      doc.text("SÉRIE/TURMA:", 14, 65);
      doc.setFont("helvetica", "normal");
      doc.text(activeStudent.grade, 45, 65);

      doc.setFont("helvetica", "bold");
      doc.text("EMISSÃO:", 14, 71);
      doc.setFont("helvetica", "normal");
      const emissionDate = new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR");
      doc.text(emissionDate, 45, 71);

      // Authenticity Code
      const docCode = "AUT-" + activeStudent.id.toUpperCase() + "-" + Date.now().toString().slice(-6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Doc Autenticidade: ${docCode}`, 144, 71);

      // Subjects Grid
      let yCoord = 84;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("DETALHAMENTO DE NOTAS POR DISCIPLINA", 10, yCoord);
      doc.line(10, yCoord + 2, 200, yCoord + 2);
      yCoord += 8;

      // Table Header
      doc.setFillColor(66, 51, 38);
      doc.rect(10, yCoord, 190, 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Disciplina", 14, yCoord + 5.5);
      doc.text("1º Bim", 85, yCoord + 5.5);
      doc.text("2º Bim", 110, yCoord + 5.5);
      doc.text("Média", 135, yCoord + 5.5);
      doc.text("Resultado", 160, yCoord + 5.5);
      yCoord += 8;

      // Render Each Subject
      activeStudent.grades.forEach((g) => {
        const subAvg = (g.firstBimester + g.secondBimester) / 2;
        
        // Rows
        doc.setFillColor(254, 253, 251);
        doc.rect(10, yCoord, 190, 10, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.rect(10, yCoord, 190, 10, 'D');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(g.subject, 14, yCoord + 6.5);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(g.firstBimester.toFixed(1), 85, yCoord + 6.5);
        doc.text(g.secondBimester.toFixed(1), 110, yCoord + 6.5);
        
        doc.setFont("helvetica", "bold");
        doc.text(subAvg.toFixed(1), 135, yCoord + 6.5);

        if (subAvg >= 7.0) {
          doc.setTextColor(16, 185, 129); // emerald
          doc.text("Aprovado", 160, yCoord + 6.5);
        } else {
          doc.setTextColor(180, 83, 9); // amber
          doc.text("Atenção", 160, yCoord + 6.5);
        }
        
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        yCoord += 11;

        // Feedback / Orientation Text (Wrapped neatly)
        doc.setFillColor(250, 248, 242);
        doc.rect(14, yCoord - 1, 182, 10, 'F');
        
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        
        const textFeedback = `Parecer Pedagógico: "${g.feedback}"`;
        const wrappedFeedback = doc.splitTextToSize(textFeedback, 178);
        doc.text(wrappedFeedback, 16, yCoord + 3.5);
        
        yCoord += (wrappedFeedback.length * 4) + 2;
      });

      // Pedagogic Final Consolation Box
      if (yCoord > 240) {
        doc.addPage();
        doc.setDrawColor(229, 211, 178);
        doc.setLineWidth(1);
        doc.rect(5, 5, 200, 287);
        doc.rect(7, 7, 196, 283);
        yCoord = 20;
      } else {
        yCoord += 6;
      }

      // Consolidate Message
      doc.setFillColor(253, 250, 244);
      doc.rect(10, yCoord, 190, 28, 'F');
      doc.setDrawColor(217, 119, 6);
      doc.rect(10, yCoord, 190, 28, 'D');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("CONSIDERAÇÕES DA COORDENAÇÃO PEDAGÓGICA GERAL", 14, yCoord + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const commentGeneral = "O aluno demonstra forte engajamento nas dinâmicas pedagógicas cotidianas e respeito impecável às diretrizes do colégio. Os resultados consolidados refletem excelente absorção dos conteúdos apresentados e engajamento acima da média no portfólio institucional de projetos práticos.";
      const wrappedComment = doc.splitTextToSize(commentGeneral, 182);
      doc.text(wrappedComment, 14, yCoord + 12);

      // Signatures row
      let sigY = yCoord + 45;
      if (sigY > 270) {
        doc.addPage();
        doc.setDrawColor(229, 211, 178);
        doc.setLineWidth(1);
        doc.rect(5, 5, 200, 287);
        doc.rect(7, 7, 196, 283);
        sigY = 50;
      }

      // Draw signature lines
      doc.setDrawColor(180, 83, 9);
      doc.setLineWidth(0.5);
      doc.line(25, sigY, 90, sigY);
      doc.line(120, sigY, 185, sigY);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text("Direção e Coordenação Escolar", 28, sigY + 4);
      doc.text(`Profissional Docente Mestre`, 128, sigY + 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("Selo de Autenticidade Digital Unificada", 28, sigY + 8);
      doc.text("Plataforma White-Label Integrada", 128, sigY + 8);

      // Footer brand details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(112, 128, 144);
      doc.text(`Emitido pelo canal de Responsáveis da escola ${branding.schoolName} via Portal de Integração`, 10, 276);

      doc.save(`boletim_escolar_${activeStudent.name.toLowerCase().replace(/\s+/g, "_")}_2026.pdf`);
    } catch (e) {
      console.error(e);
      setToast({
        message: "Houve um problema ao processar seu PDF. Por favor, tente novamente.",
        type: "error"
      });
    }
  };

  const handleExportCSV = () => {
    try {
      if (!activeStudent) {
        setToast({
          message: "Nenhum estudante ativo selecionado.",
          type: "error"
        });
        return;
      }
      
      const csvRows = [];
      // CSV Header
      csvRows.push(["Aluno", "Turma", "Materia", "1º Bimestre", "2º Bimestre", "Variacao", "Parecer"].join(";"));

      activeStudent.grades.forEach((g) => {
        const b2 = g.secondBimester;
        const b1 = g.firstBimester;
        const diff = b2 - b1;
        const variationSign = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
        
        const row = [
          `"${activeStudent.name.replace(/"/g, '""')}"`,
          `"${activeStudent.grade.replace(/"/g, '""')}"`,
          `"${g.subject.replace(/"/g, '""')}"`,
          b1.toFixed(1).replace(".", ","),
          b2.toFixed(1).replace(".", ","),
          `"${variationSign.replace(".", ",")}"`,
          `"${g.feedback.replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(";"));
      });

      const csvContent = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const fileName = `boletim_${activeStudent.name.toLowerCase().replace(/\s+/g, "_")}_2026.csv`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setToast({
        message: "📈 CSV exportado com sucesso!",
        type: "success"
      });
    } catch (error) {
      console.error(error);
      setToast({
        message: "Houve um erro ao gerar o arquivo CSV. Por favor tente novamente.",
        type: "error"
      });
    }
  };

  // Filter content
  const filteredComunicados = comunicados.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.previewText.toLowerCase().includes(q) ||
      (item.authorName && item.authorName.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === "todos" || item.category === selectedCategory;

    let matchesDate = true;
    if (item.timestamp) {
      const delta = Date.now() - item.timestamp;
      const d = 24 * 60 * 60 * 1000;
      if (selectedDateFilter === "hoje") matchesDate = delta <= d;
      else if (selectedDateFilter === "3dias") matchesDate = delta <= 3 * d;
      else if (selectedDateFilter === "semana") matchesDate = delta <= 7 * d;
      else if (selectedDateFilter === "mes") matchesDate = delta <= 30 * d;
    }

    const matchesTags = selectedTags.length === 0 || 
      (item.tags && selectedTags.some((tag) => item.tags?.includes(tag)));

    const isFav = localSavedComms.includes(item.id);
    const matchesSaved = !onlySaved || isFav;

    return matchesSearch && matchesCategory && matchesDate && matchesTags && matchesSaved;
  });

  const getUniqueTagsOfCurrentTab = (): string[] => {
    const list: string[] = [];
    comunicados.forEach((c) => c.tags && list.push(...c.tags));
    return Array.from(new Set(list));
  };
  const currentTabUniqueTags = getUniqueTagsOfCurrentTab();

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("todos");
    setSelectedDateFilter("todos");
    setSelectedTags([]);
    setOnlySaved(false);
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Prefilled helper suggestion descriptions for legacy AI generated moments
  const prefilledPrompts = [
    { title: "Festa Cultural", txt: "Crianças em trajes típicos comemorando a festa folclórica escolar em um pátio ensolarado, estilo aquarela" },
    { title: "Atividade Sensorial", txt: "Crianças pequenas no berçário explorando blocos geométricos e livros ilustrados, arte acolhedora 3D" },
    { title: "Laboratório de Ciências", txt: "Alunos do ensino fundamental com jaleco branco explorando plantas e microscópio em sala de aula iluminada" }
  ];

  // Request AI image proxy (for legacy visual moments gallery)
  const handleAiGenerationImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImg(null);

    try {
      const payload = {
        prompt: aiPrompt,
        model: aiModel,
        aspectRatio: aspectRatio,
        size: aiModel === "gemini-3-pro-image-preview" ? imageSize : undefined
      };

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success && data.base64) {
        setGeneratedImg({
          base64: `data:image/png;base64,${data.base64}`,
          prompt: aiPrompt,
          model: data.modelUsed,
          size: imageSize
        });
      } else {
        setToast({
          message: data.error || "Não foi possível gerar a imagem artística no momento. Verifique a configuração da GEMINI_API_KEY no servidor.",
          type: "error"
        });
      }
    } catch (err: any) {
      console.error(err);
      setToast({
        message: "Não foi possível acessar o serviço de ilustração. Verifique as configurações.",
        type: "error"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToMoments = () => {
    if (!generatedImg) return;
    const newMoment: Momento = {
      id: "mom-custom-" + Date.now(),
      title: "Arte: " + (generatedImg.prompt.length > 25 ? generatedImg.prompt.substring(0, 25) + "..." : generatedImg.prompt),
      description: generatedImg.prompt,
      date: "Ilustração Digital",
      timestamp: Date.now(),
      image: generatedImg.base64,
      tags: ["ilustracao", "recordacao"]
    };
    const updated = [newMoment, ...momentos];
    saveMomentosList(updated);
    setGeneratedImg(null);
    setAiPrompt("");
    setToast({
      message: "Ilustração adicionada aos Momentos com sucesso! Disponível em sua Galeria.",
      type: "success"
    });
  };

  // Create customized new poster/announcement
  const handleCreateAnnouncement = (formObj: { title: string; category: string; content: string }) => {
    const newComm: Comunicado = {
      id: "com-custom-" + Date.now(),
      title: formObj.title,
      date: "Hoje às " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      previewText: formObj.content.length > 80 ? formObj.content.substring(0, 80) + "..." : formObj.content,
      content: formObj.content,
      category: formObj.category,
      authorName: userProfile?.displayName || "Responsável do Aluno",
      tags: ["postagem-interna", "mural"],
      likesCount: 0,
      dislikesCount: 0,
      comments: []
    };

    const updated = [newComm, ...comunicados];
    saveComunicadosList(updated);
    
    // Simulate push notification dispatch
    triggerPushNotification({
      title: `🔔 Novo Mural: ${formObj.title}`,
      body: formObj.content.length > 100 
        ? formObj.content.substring(0, 100) + "..." 
        : formObj.content,
      targetTab: "comunicados",
      iconType: "announcement"
    });
    
    setNewAnnouncementModal(false);
  };

  const handleSendChatMessage = (customText?: string) => {
    const textToSend = (customText || chatInput).trim();
    if (!textToSend) return;
    
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "parent",
      text: textToSend,
      timestamp: Date.now()
    };
    
    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    localStorage.setItem("school_chat_messages", JSON.stringify(updated));
    const query = textToSend.toLowerCase();
    
    if (!customText) {
      setChatInput("");
    }
    
    // Secretary dynamic replies simulation
    setTimeout(() => {
      let secretaryReplyText = "Olá, responsável! Sou a Sandra, secretária de atendimento. Recebemos sua mensagem e já estamos verificando com a equipe de coordenação. Retornamos em poucos instantes!";
      
      if (query.includes("nota") || query.includes("boletim") || query.includes("prova")) {
        secretaryReplyText = "Olá! Sobre notas e boletins: as notas de todas as matérias já estão consolidadas no portal. Você pode inclusive gerar a planilha completa de desempenho clicando em 'Exportar CSV' na aba Notas e Desempenho Acadêmico!";
      } else if (query.includes("mensalidade") || query.includes("financeiro") || query.includes("boleto") || query.includes("taxas") || query.includes("fees") || query.includes("cobranca") || query.includes("cobrança")) {
        secretaryReplyText = "Olá! Referente a mensalidades e taxas financeiras: você pode conferir o status detalhado de todas as faturas na aba 'Mensalidades e Rematrícula'. Oferecemos opções de renegociação de débitos pendentes e pagamento facilitado via Pix com desconto instantâneo!";
      } else if (query.includes("rematricula") || query.includes("rematrícula") || query.includes("contrato") || query.includes("vaga")) {
        secretaryReplyText = "Olá! A rematrícula para o ano letivo de 2027 já está ativa no sistema! Você pode assinar o termo eletronicamente e sincronizar direto ao sistema financeiro na aba 'Mensalidades e Rematrícula'.";
      } else if (query.includes("atraso") || query.includes("entrega") || query.includes("material") || query.includes("agenda")) {
        secretaryReplyText = "Olá! Entendido sobre os horários e materiais. No menu ao lado do chat, você pode agendar lembretes customizados para receber avisos automáticos sobre as datas de entrega de trabalhos e reuniões do estudante!";
      } else if (query.includes("retirada") || query.includes("buscar") || query.includes("autorizacao") || query.includes("autoriza")) {
        secretaryReplyText = "Olá! Para autorizar novas pessoas a retirarem o estudante da escola, por favor utilize a aba 'Autorizações de Retirada'. As fotos e RGs cadastrados são disponibilizados instantaneamente para os monitores da portaria.";
      }
      
      const adminMsg: ChatMessage = {
        id: "msg-" + Date.now() + "-reply",
        sender: "secretaria",
        text: secretaryReplyText,
        timestamp: Date.now()
      };
      
      setChatMessages((prev) => {
        const finalMsgs = [...prev, adminMsg];
        localStorage.setItem("school_chat_messages", JSON.stringify(finalMsgs));
        return finalMsgs;
      });
      
      // Also trigger a push notification banner in the portal so the parent sees it live!
      triggerPushNotification({
        title: "Atendimento Escolar (Sandra)",
        body: secretaryReplyText.substring(0, 75) + "...",
        targetTab: "comunicados",
        iconType: "chat",
        studentName: activeStudent?.name || "Estudante"
      });
    }, 1200);
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTitle.trim() || !reminderDate || !reminderTime) {
      setToast({
        message: "Por favor, preencha o assunto, data e horário do lembrete.",
        type: "error"
      });
      return;
    }
    
    const newRem: ScheduledReminder = {
      id: "rem-" + Date.now(),
      studentId: activeStudent?.id || "est-1",
      studentName: activeStudent?.name || "Estudante",
      title: reminderTitle,
      type: reminderType,
      date: reminderDate,
      time: reminderTime,
      notes: reminderNotes,
      active: true
    };
    
    const updated = [newRem, ...reminders];
    setReminders(updated);
    localStorage.setItem("school_scheduled_reminders", JSON.stringify(updated));
    
    // Reset fields
    setReminderTitle("");
    setReminderType("material");
    setReminderDate("");
    setReminderTime("");
    setReminderNotes("");
    
    setToast({
      message: "🔔 Lembrete agendado com sucesso para " + (activeStudent?.name || "o estudante") + "!",
      type: "success"
    });
    
    // Queue a simulated reminder alert to trigger close to the date
    triggerPushNotification({
      title: `Lembrete Agendado: ${newRem.title}`,
      body: `Dúvidas ou pendências relativas à entrega/reunião de ${activeStudent?.name || "o estudante"}.`,
      targetTab: "comunicados",
      iconType: "calendar",
      studentName: activeStudent?.name || "Estudante"
    });
  };

  const handleToggleReminderActive = (id: string) => {
    const updated = reminders.map((r) => r.id === id ? { ...r, active: !r.active } : r);
    setReminders(updated);
    localStorage.setItem("school_scheduled_reminders", JSON.stringify(updated));
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    localStorage.setItem("school_scheduled_reminders", JSON.stringify(updated));
    setToast({
      message: "Lembrete removido com sucesso.",
      type: "info"
    });
  };

  const handleToggleStudentReminder = (reminderId: string, reward: number = 20) => {
    const isAlreadyChecked = studentCheckedReminders.includes(reminderId);
    let updated: string[];
    if (isAlreadyChecked) {
      updated = studentCheckedReminders.filter(id => id !== reminderId);
      // Deduct coins if they uncheck
      setMagicCoins(prev => Math.max(0, prev - reward));
      setToast({
        message: "Atividade marcada como pendente. Moedas ajustadas!",
        type: "info"
      });
    } else {
      updated = [...studentCheckedReminders, reminderId];
      // Reward points
      setMagicCoins(prev => prev + reward);
      setToast({
        message: `Parabéns! Você completou a atividade com sucesso (+${reward} pontos)!`,
        type: "success"
      });
    }
    setStudentCheckedReminders(updated);
    localStorage.setItem("school_student_checked_reminders", JSON.stringify(updated));
  };

  const handleSendBulkAlert = () => {
    if (selectedBulkStudentIds.length === 0) {
      setToast({
        message: "Por favor, selecione pelo menos um aluno na lista.",
        type: "error"
      });
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const nowTimeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const newReminders: ScheduledReminder[] = [];
    
    selectedBulkStudentIds.forEach((studentId) => {
      const student = estudantes.find((est) => est.id === studentId);
      if (!student) return;

      const title = bulkNotificationType === "material" 
        ? "Falta de Material Escolar 📦" 
        : "Registro de Atraso Escolar ⏰";
      
      const defaultNotes = bulkNotificationType === "material"
        ? "Por favor, envie o material escolar pendente indicado na agenda."
        : "Aluno registrou entrada com atraso hoje. Por favor, verifique.";

      const finalNotes = bulkNotes.trim() || defaultNotes;

      const newRem: ScheduledReminder = {
        id: "rem-bulk-" + studentId + "-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
        studentId: studentId,
        studentName: student.name,
        title: title,
        type: bulkNotificationType === "material" ? "material" : "outro",
        date: todayStr,
        time: nowTimeStr,
        notes: finalNotes,
        active: true
      };

      newReminders.push(newRem);

      triggerPushNotification({
        title: `${student.name}: ${title}`,
        body: finalNotes,
        targetTab: "comunicados",
        iconType: bulkNotificationType === "material" ? "announcement" : "occurrence",
        studentName: student.name
      });
    });

    const updatedReminders = [...newReminders, ...reminders];
    setReminders(updatedReminders);
    localStorage.setItem("school_scheduled_reminders", JSON.stringify(updatedReminders));

    setToast({
      message: `🔔 Avisos disparados com sucesso para os pais de ${selectedBulkStudentIds.length} alunos!`,
      type: "success"
    });

    setSelectedBulkStudentIds([]);
    setBulkNotes("");
  };

  return (
    <div 
      className={`min-h-screen font-sans flex flex-col antialiased relative overflow-x-hidden transition-colors duration-300 ${
        isDarkMode 
          ? "bg-slate-950 text-slate-100 selection:bg-blue-900 selection:text-white" 
          : "bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900"
      }`}
    >
      <style>{`
        .brand-primary-bg { background-color: ${branding.primaryColor || "#0077C0"} !important; }
        .brand-primary-text { color: ${branding.primaryColor || "#0077C0"} !important; }
        .brand-primary-border { border-color: ${branding.primaryColor || "#0077C0"} !important; }
        .brand-secondary-bg { background-color: ${branding.secondaryColor || "#C4CED4"} !important; }
        .brand-secondary-text { color: ${branding.secondaryColor || "#C4CED4"} !important; }
        
        .brand-hover-primary-text:hover { color: ${branding.primaryColor || "#0077C0"} !important; }
        .brand-hover-primary-bg:hover { background-color: ${branding.primaryColor || "#0077C0"} !important; opacity: 0.9; }
        
        .brand-glow {
          box-shadow: 0 0 25px ${(branding.primaryColor || "#0077C0")}25 !important;
        }
        .brand-glow-border {
          border-color: ${(branding.primaryColor || "#0077C0")}30 !important;
        }
        .brand-glow-border:hover {
          border-color: ${(branding.primaryColor || "#0077C0")}70 !important;
          box-shadow: 0 0 15px ${(branding.primaryColor || "#0077C0")}20 !important;
        }
      `}</style>

      {/* Magical subtle background effect (floats ambiently in landing and logged-in system screens) */}
      <MagicalSubtleBackground 
        primaryColor={branding.primaryColor} 
        secondaryColor={branding.secondaryColor} 
      />
      
      {/* Dynamic Animated Floating Toast Messages (Smooth Slide-In) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -75, scale: 0.94, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: -50, scale: 0.95, x: "-50%" }}
            transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.8 }}
            className={`fixed top-6 left-1/2 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-lg border text-xs font-bold leading-normal max-w-[90vw] sm:max-w-md ${
              toast.type === "mastery"
                ? "bg-amber-600 text-white border-amber-500 shadow-md"
                : toast.type === "success" 
                ? "bg-emerald-50 text-emerald-950 border-emerald-300 dark:bg-emerald-950/95 dark:text-emerald-100 dark:border-emerald-800" 
                : toast.type === "error"
                ? "bg-rose-50 text-rose-950 border-rose-300 animate-shake dark:bg-rose-950/95 dark:text-rose-100 dark:border-rose-800"
                : "bg-amber-50 text-amber-950 border-amber-300 dark:bg-slate-900/95 dark:text-amber-100 dark:border-slate-800"
            }`}
          >
            {toast.type === "mastery" && <Sparkles className="w-5 h-5 text-amber-200 shrink-0" />}
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />}
            <span className={`flex-1 ${toast.type === "mastery" ? "text-white font-extrabold" : "text-[#3e2e28] dark:text-slate-100"}`}>{toast.message}</span>
            <button onClick={() => setToast(null)} className="p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile System Configuration Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onProfileUpdated={(updatedProfile) => setUserProfile(updatedProfile)}
        onShowToast={(message, type) => setToast({ message, type })}
        onLogout={handleLogout}
        userRole={userRole === "escola" ? "escola" : "pais"}
        students={estudantes}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        initialSection={profileModalInitialSection}
        onUpdateStudentPhoto={handleUpdateStudentPhoto}
      />

      {/* Global Student Photo Camera Modal */}
      <StudentPhotoCameraModal
        isOpen={!!cameraModalStudent}
        onClose={() => setCameraModalStudent(null)}
        student={cameraModalStudent}
        onPhotoCaptured={(studentId, photoDataUrl) => {
          handleUpdateStudentPhoto(studentId, photoDataUrl);
        }}
        onToast={(msg, type) => setToast({ message: msg, type })}
      />

      {/* 🎨 White-Label 100% Customization Modal (Logo, Cores, Módulos & Ordem do Feed) */}
      <WhiteLabelCustomizerModal
        isOpen={isWhiteLabelModalOpen}
        onClose={() => setIsWhiteLabelModalOpen(false)}
        branding={branding}
        onSaveBranding={saveBrandingData}
        onToast={(msg, type) => setToast({ message: msg, type: type === "mastery" ? "success" : type })}
      />

      {/* QR Code Audit Log Modal */}
      <QrCodeAuditLogModal
        isOpen={qrAuditLogModalOpen}
        onClose={() => setQrAuditLogModalOpen(false)}
        logs={qrCheckInLogs}
        selectedStudentFilter={portariaStudentFilter}
        onClearLogs={() => {
          setQrCheckInLogs([]);
          localStorage.removeItem("school_qr_checkin_logs");
          setToast({ message: "Histórico de auditoria limpo com sucesso!", type: "info" });
        }}
        onToggleStatus={(logId, newStatus) => {
          setQrCheckInLogs(prev => {
            const updated = prev.map(l => {
              if (l.id === logId) {
                return {
                  ...l,
                  status: newStatus,
                  details: newStatus === "entrada" 
                    ? "Status alternado para Entrada" 
                    : "Status alternado para Saída"
                };
              }
              return l;
            });
            localStorage.setItem("school_qr_checkin_logs", JSON.stringify(updated));
            return updated;
          });
          setToast({
            message: `Status atualizado para ${newStatus === "entrada" ? "Entrada" : "Saída"}!`,
            type: "info"
          });
        }}
      />

      {/* Dicas Financeiras Modal */}
      <AnimatePresence>
        {dicasFinanceirasOpen && (
          <DicasFinanceirasModal
            isOpen={dicasFinanceirasOpen}
            onClose={() => setDicasFinanceirasOpen(false)}
            cobrancas={cobrancas}
            onConfigureReminder={handleCreateReminderFromSuggestion}
            onSimulateThreeDaysDue={handleSimulateThreeDaysDue}
            isDarkMode={isDarkMode}
            branding={branding}
          />
        )}
      </AnimatePresence>

      {/* ⚡ CRM Scheduled Financial Reminders Quick Access Modal (Execução Imediata) */}
      {crmQuickRemindersModalOpen && (
        <CrmQuickRemindersModal
          isOpen={crmQuickRemindersModalOpen}
          onClose={() => setCrmQuickRemindersModalOpen(false)}
          estudantes={estudantes}
          onToast={(msg, type) => setToast({ message: msg, type })}
          onSendReminder={(studentId, message) => {
            setToast({
              message: `Lembrete agendado com sucesso para o aluno!`,
              type: "success"
            });
          }}
          onAddNotification={(title, body, type) => {
            const newNotif: NotificationItem = {
              id: `notif-${Date.now()}`,
              title,
              body,
              timestamp: Date.now(),
              read: false,
              targetTab: "cobrancas",
              iconType: (type as any) || "occurrence"
            };
            setNotifications(prev => {
              const updated = [newNotif, ...prev];
              try {
                localStorage.setItem("school_push_notifications", JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          }}
          onNavigateToCrm={() => {
            setSchoolActiveTab("erp");
            setTimeout(() => {
              const crmTab = document.getElementById("tab-crm-reminders");
              if (crmTab) crmTab.click();
            }, 100);
          }}
        />
      )}

      {/* 📱 Modal de Detalhes da Notificação & Próximo Contato CRM (Follow-up WhatsApp) */}
      <AnimatePresence>
        {selectedNotificationDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedNotificationDetail(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white flex items-center justify-between border-b border-indigo-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                    <Bell className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">
                      Detalhes da Notificação & CRM
                    </h3>
                    <p className="text-[10px] text-indigo-200/80">
                      Configure o próximo contato e dispare o follow-up via WhatsApp.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNotificationDetail(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Notification Info Box */}
                <div className="p-3 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                      {selectedNotificationDetail.targetTab || "comunicados"}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(selectedNotificationDetail.timestamp).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                    {selectedNotificationDetail.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedNotificationDetail.body}
                  </p>
                  {selectedNotificationDetail.studentName && (
                    <div className="pt-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                      <span>👤 Destinatário / Aluno:</span>
                      <span className="font-extrabold">{selectedNotificationDetail.studentName}</span>
                    </div>
                  )}
                </div>

                {/* CRM Next Contact Field Section */}
                <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Agendar 'Próximo Contato CRM' (WhatsApp)</span>
                    </h4>
                    <span className="text-[9px] font-mono font-bold bg-emerald-200/60 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                      Follow-Up Automático
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 block mb-1">
                        Próximo Contato CRM *
                      </label>
                      <input
                        type="date"
                        value={detailNextContactDate}
                        onChange={(e) => setDetailNextContactDate(e.target.value)}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 block mb-1">
                        Horário do Contato
                      </label>
                      <input
                        type="time"
                        value={detailNextContactTime}
                        onChange={(e) => setDetailNextContactTime(e.target.value)}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 block mb-1">
                      Mensagem do Lembrete de Follow-Up
                    </label>
                    <textarea
                      rows={2.5}
                      value={detailNextContactNote}
                      onChange={(e) => setDetailNextContactNote(e.target.value)}
                      placeholder="Digite a mensagem de follow-up que será enviada via WhatsApp..."
                      className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {selectedNotificationDetail.nextCrmContactDate && (
                    <div className="p-2 bg-emerald-100/80 dark:bg-emerald-900/40 rounded-xl text-[10px] text-emerald-800 dark:text-emerald-200 font-bold flex items-center justify-between">
                      <span>✓ Agendado no CRM para:</span>
                      <span className="font-mono">{selectedNotificationDetail.nextCrmContactDate} às {selectedNotificationDetail.nextCrmContactTime || "09:00"}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      handleScheduleCrmFollowupWhatsapp(
                        selectedNotificationDetail.title,
                        selectedNotificationDetail.studentName || "Aluno",
                        detailNextContactDate,
                        detailNextContactTime,
                        detailNextContactNote,
                        selectedNotificationDetail.id
                      );
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-101 active:scale-99"
                  >
                    <Smartphone className="w-4 h-4 text-white" />
                    <span>Disparar Lembrete Follow-Up via WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedNotificationDetail(null)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:underline cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Magical Starry Background Particles when toggled */}
      {branding.enableStarsBackground && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute top-12 left-1/4 w-3.5 h-3.5 text-amber-500 animate-star-pulse" />
          <div className="absolute top-24 right-1/4 w-2.5 h-2.5 text-orange-400 animate-star-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-10 w-4 h-4 text-purple-400 animate-float-star" />
          <div className="absolute top-1/3 right-10 w-3 h-3 text-emerald-500 animate-star-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-20 left-1/3 w-3.5 h-3.5 text-rose-400 animate-star-pulse" />
          <div className="absolute bottom-40 right-20 w-4 h-4 text-amber-500 animate-float-star" style={{ animationDelay: "2s" }} />
          
          {/* Soft fairytale warm vignette background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_75%,rgba(253,244,228,0.35))] pointer-events-none" />
        </div>
      )}

      {/* ==================== LANDING PAGE VIEW ==================== */}
      {userRole === "landing" && (
        !showAuthSection ? (
          <InstitutionalLanding
            isOffline={isOffline}
            branding={branding}
            activeThemePreset={activeThemePreset}
            locale={locale}
            onLocaleChanged={(loc) => handleSetLocale(loc)}
            onEnterPortals={() => setShowAuthSection(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            themePreference={themePreference}
            onSelectThemePreference={handleSetThemePreference}
            translations={translations}
            onOpenWhiteLabel={() => setIsWhiteLabelModalOpen(true)}
            onOpenAuth={(gate, tab) => {
              setAuthSectionInitialGate(gate);
              setAuthSectionInitialTab(tab);
              setShowAuthSection(true);
            }}
            estudantes={estudantes}
            selectedStudentId={selectedStudentId}
            onSelectStudent={(id) => setSelectedStudentId(id)}
            onEnterDemoPortal={(role) => {
              const targetRole = role === "pais" ? "pais" : role === "aluno" ? "aluno" : "escola";
              setUserRole(targetRole);
              if (targetRole === "pais") {
                setActiveTab("dashboard");
              } else if (targetRole === "aluno") {
                setStudentActiveTab("simplificada");
              } else {
                setSchoolActiveTab("dashboard");
              }
              setToast({
                message: `Portal ${targetRole === "escola" ? "do Gestor" : targetRole === "pais" ? "da Família" : "do Estudante"} carregado em modo Demonstração!`,
                type: "success"
              });
            }}
            onSelectCampus={(campus) => {
              setBranding({
                ...branding,
                schoolName: campus.name,
                themePreset: campus.theme as any,
                primaryColor: campus.primaryColor
              });
              setToast({
                message: `Identidade Visual atualizada para: ${campus.name}`,
                type: "success"
              });
            }}
          />
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center py-10 px-4 max-w-4xl w-full mx-auto relative z-10">
            {/* Back Button */}
            <div className="w-full max-w-md mb-6 flex justify-start">
              <button 
                onClick={() => setShowAuthSection(false)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Voltar</span>
              </button>
            </div>

            <AuthSection 
              key={`${authSectionInitialGate}-${authSectionInitialTab}`}
              initialGate={authSectionInitialGate}
              initialTab={authSectionInitialTab}
              schoolName={branding.schoolName}
              branding={branding}
              onBack={() => setShowAuthSection(false)}
              onProfileSynced={(profile, gate) => {
                setUserProfile(profile);
                if (profile) {
                  // User signed in or completed onboarding
                  const name = profile.preferences?.studentName || "Nicolas Nogueira";
                  const grade = profile.preferences?.studentGrade || "3º Ano B - Ensino Fundamental";
                  
                  // Dynamically insert or select student
                  const studentExists = estudantes.some(est => est.name === name);
                  if (!studentExists) {
                    const newStudentId = "est-" + (estudantes.length + 1);
                    const newStudent: Estudante = {
                      id: newStudentId,
                      name: name,
                      grade: grade,
                      avatar: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&q=80&w=150",
                      parentName: profile.displayName || "Mariana Silva Nogueira",
                      parentPhone: "(11) 98888-1234",
                      pickupQueueStatus: "fila_espera",
                      pickupQueueStatusUpdatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                      reEnrollmentStatus: "pendente",
                      grades: [
                        { subject: "Língua Portuguesa 📚", firstBimester: 9.0, secondBimester: 9.5, feedback: "Excelente dedicação e progresso em sala." },
                        { subject: "Matemática Aplicada 📐", firstBimester: 8.8, secondBimester: 9.5, feedback: "Muito participativo nas discussões lógicas." },
                        { subject: "Robótica e Algoritmos 🤖", firstBimester: 9.2, secondBimester: 9.6, feedback: "Destaca-se pelo espírito inovador e trabalho em equipe." },
                      ],
                      occurrences: [
                        { 
                          id: "occ-new-1", 
                          date: "Hoje", 
                          meals: { lunch: "excelente", snack: "excelente", details: "Almoçou toda a refeição com gosto." },
                          medicated: { wasMedicated: false, details: "" },
                          sleep: { durationStr: "1h 30min", details: "Dormiu tranquilamente durante o período de repouso." },
                          behaviorState: "otimo",
                          teacherNote: "Teve uma participação exemplar e engajada nas dinâmicas cooperativas de hoje."
                        }
                      ],
                      withdrawalRules: [
                        { id: "wr-1", name: profile.displayName || "Responsável Oficial", relationship: "Responsável", rg: "12.345.678-9", isAuthorized: true }
                      ]
                    };
                    saveEstudantesList([...estudantes, newStudent]);
                    setSelectedStudentId(newStudentId);
                  }
                  
                  const targetRole = gate === "escola" ? "escola" : "pais";
                  setUserRole(targetRole);
                  if (targetRole === "pais") {
                    setActiveTab("dashboard");
                  } else {
                    setSchoolActiveTab("dashboard");
                  }
                  setShowAuthSection(false);
                  
                  setToast({
                    message: `Bem-vindo(a), ${profile.displayName || "Usuário"}! Portal ${targetRole === "escola" ? "do Gestor" : "da Família"} carregado com sucesso.`,
                    type: "success"
                  });
                }
              }}
              currentTheme={
                branding.themePreset === "royal" || branding.themePreset === "orlando_magic" ? "royal" :
                branding.themePreset === "emerald" || branding.themePreset === "emerald_school" ? "emerald" :
                branding.themePreset === "amber" || branding.themePreset === "amber_bright" ? "amber" : "default"
              }
              onThemeChanged={(color) => {
                let preset: "orlando_magic" | "magic_purple" | "emerald_school" | "amber_bright" = "orlando_magic";
                if (color === "royal") preset = "orlando_magic";
                else if (color === "emerald") preset = "emerald_school";
                else if (color === "amber") preset = "amber_bright";
                else preset = "magic_purple";

                setBranding({
                  ...branding,
                  themePreset: preset,
                  primaryColor: color === "royal" ? "#0077C0" : color === "emerald" ? "#10b981" : color === "amber" ? "#f59e0b" : "#6d28d9"
                });
              }}
            />
          </div>
        )
      )}


      {/* ==================== PORTALS VIEW SHELL ==================== */}
      {userRole !== "landing" && (
        <>
          {/* MOBILE SIDEBAR/DRAWER */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-black z-[65] md:hidden"
                />

                {/* Sidebar Pane */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] p-5 z-[70] flex flex-col justify-between border-r shadow-2xl md:hidden overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100"
                >
                  <div className="space-y-6">
                    {/* Header branding in drawer */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSidebarOpen(false); changeUserRoleWithMagic("landing"); }}>
                        <MagicLearningBrandLogo
                          size="sm"
                          schoolName={branding.schoolName}
                          primaryColor={branding.primaryColor}
                          secondaryColor={branding.secondaryColor}
                          logoPreset={branding.logoPreset}
                          subtitle={userRole === "pais" ? "Portal da Família" : "Diretoria Executiva"}
                        />
                      </div>
                      <button 
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-xl transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Fechar menu"
                        aria-label="Fechar menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Info */}
                    <div className="space-y-1 p-3 rounded-xl border bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] uppercase block font-bold font-mono text-slate-500 dark:text-slate-400">Modo de Acesso:</span>
                      <strong className="text-xs uppercase text-slate-800 dark:text-slate-200 font-bold block">
                        {userRole === "pais" ? "Portal do Responsável 👨‍👩‍👦" : "Gestão Interna 🏫"}
                      </strong>
                    </div>

                    {/* Site da Escola Shortcut in Mobile Drawer */}
                    <button
                      type="button"
                      onClick={() => {
                        setSidebarOpen(false);
                        changeUserRoleWithMagic("landing");
                        setToast({
                          message: "Página institucional da escola aberta.",
                          type: "info"
                        });
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Site da Escola</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Público ↗</span>
                    </button>

                    {/* Student Selector inside Drawer if role is Parents */}
                    {userRole === "pais" && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Selecionar Estudante:</span>
                        <div className="space-y-1.5">
                          {estudantes.map((est) => {
                            const isSelected = est.id === selectedStudentId;
                            return (
                              <button
                                key={est.id}
                                onClick={() => {
                                  setSelectedStudentId(est.id);
                                  setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                                  isSelected
                                    ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-200 font-bold shadow-xs"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                              >
                                <span className={`w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>
                                  {est.name.substring(0, 1)}
                                </span>
                                <div className="text-xs truncate">
                                  <span className="block font-semibold leading-none mb-0.5">{est.name}</span>
                                  <span className="block text-[9px] uppercase font-mono text-slate-400">{est.grade}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Swap Role Section */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">Alternar Portais:</span>
                      <button
                        onClick={() => {
                          triggerMagicalTransition(() => {
                            setUserRole(userRole === "pais" ? "escola" : "pais");
                            setSidebarOpen(false);
                          });
                        }}
                        className="w-full border p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Mudar para {userRole === "pais" ? "Portal da Escola" : "Portal dos Pais"}</span>
                      </button>
                    </div>

                    {/* Configure branding direct link if role is Escolar */}
                    {userRole === "escola" && (
                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsWhiteLabelModalOpen(true);
                            setSidebarOpen(false);
                          }}
                          className="w-full bg-amber-500/15 hover:bg-amber-500/25 dark:bg-amber-500/20 text-slate-900 dark:text-amber-200 border border-amber-500/40 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Customização 100% White-Label</span>
                        </button>
                        <button
                          onClick={() => {
                            setShowBrandingPanel(!showBrandingPanel);
                            setSidebarOpen(false);
                          }}
                          className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/45 dark:hover:bg-blue-900/40 text-blue-900 dark:text-blue-300 border border-blue-250 dark:border-blue-800 p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Tema Rápido</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveModalFocus("financial_report");
                            setIsMonthlyReportModalOpen(true);
                            setSidebarOpen(false);
                          }}
                          className="w-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{getPortalText("monthlyPdfReport", locale) || "Relatório PDF"} Consolidado</span>
                        </button>
                      </div>
                    )}

                    {/* ♿ Preferências de Acessibilidade ♿ */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${userRole === "escola" ? "text-slate-500 dark:text-slate-400" : "text-amber-850"}`}>
                        <Accessibility className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Acessibilidade & Visão:</span>
                      </span>
                      <div className={`p-3 rounded-xl border transition-all ${
                        isHighContrast 
                          ? "bg-slate-900 text-white border-slate-950 dark:bg-slate-100 dark:text-slate-900 dark:border-white shadow-md" 
                          : userRole === "escola"
                          ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                          : "bg-white border-amber-200/70 text-[#5c4033]"
                      }`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold leading-tight flex items-center gap-1">
                              Modo Alto Contraste
                              {isHighContrast && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-blue-600 text-white font-extrabold uppercase">
                                  Ativo
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              Aumenta contraste de botões e textos críticos para máxima leitura.
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const next = !isHighContrast;
                              setIsHighContrast(next);
                              sensorySoundEngine.play("click");
                              setToast({
                                message: next ? "Modo de Alto Contraste Ativado ♿" : "Modo de Alto Contraste Desativado.",
                                type: "info"
                              });
                            }}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              isHighContrast ? "bg-blue-600 dark:bg-blue-500" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                            role="switch"
                            aria-checked={isHighContrast}
                            title="Ativar ou Desativar Modo de Alto Contraste"
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                isHighContrast ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Theme Selector (Dia / Noite / Sistema) */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">
                        Tema:
                      </span>
                      <ThemeSelector
                        themePreference={themePreference}
                        onSelectTheme={handleSetThemePreference}
                        variant="segmented"
                        locale={locale}
                      />
                    </div>

                    {/* Language Selector */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">
                        {getPortalText("selectLanguage", locale)}:
                      </span>
                      <LanguageSelector
                        currentLocale={locale}
                        onSelectLocale={handleSetLocale}
                        variant="pills"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4 border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setSidebarOpen(false);
                        setIsTourOpen(true);
                      }}
                      className="w-full font-bold p-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 cursor-pointer"
                    >
                      <Compass className="w-4 h-4" />
                      <span>{locale === "en" ? "Interactive Tutorial Tour" : "Tutorial Interativo"}</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full font-bold p-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{getPortalText("logout", locale)}</span>
                    </button>
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-mono">v1.4</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <LanguageSelector
                          currentLocale={locale}
                          onSelectLocale={handleSetLocale}
                          variant="compact"
                          showLabel={true}
                        />
                      </div>
                      <p className="text-[9px] text-center text-slate-400">{getPortalText("versionLabel", locale)}</p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* 1. TOP BRAND HEADER - CLEAN, INTUITIVE & RESPONSIVE */}
          <header 
            className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-xs transition-all duration-200 ${
              isDarkMode ? "bg-slate-950/95 border-slate-800 text-slate-100" : "bg-white/95 border-slate-200/80 text-slate-900"
            }`}
            style={{ zIndex: sidebarOpen ? 60 : 40 }}
          >
            {/* LEFT: Sidebar Toggle (Mobile) + Universal Back Button + School Logo + Student Switcher (Desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button 
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl md:hidden text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                title="Menu Principal"
                aria-label="Abrir Menu"
                id="btn-sidebar-menu"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Universal Back Button in Top Navbar */}
              <button
                type="button"
                onClick={handleGoBack}
                id="btn-navbar-universal-back"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
                title={`Voltar (${previousBackLabel}) • Atalho: Alt + ←`}
                aria-label={`Voltar para ${previousBackLabel}`}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
                <span className="font-sans hidden sm:inline">Voltar</span>
              </button>

              <div 
                className="flex items-center gap-2.5 select-none cursor-pointer" 
                onClick={() => changeUserRoleWithMagic("landing")}
                title="Ir para a página institucional"
              >
                <MagicLearningBrandLogo
                  size="sm"
                  showText={false}
                  schoolName={branding.schoolName}
                  primaryColor={branding.primaryColor}
                  secondaryColor={branding.secondaryColor}
                  logoPreset={branding.logoPreset}
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-serif font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
                    {branding.schoolName}
                  </span>
                  <span className="text-[10px] text-slate-700 dark:text-slate-300 font-mono tracking-wider uppercase font-semibold">
                    {userRole === "pais" ? "Portal da Família" : userRole === "aluno" ? "Portal do Estudante" : "Diretoria Executiva"}
                  </span>
                </div>
              </div>

              {/* Desktop Student Switcher (shown on lg+) */}
              {(userRole === "pais" || userRole === "escola") && (
                <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 px-1.5 py-1 rounded-full text-xs ml-2">
                  <div className="flex gap-1 items-center">
                    {estudantes.map((est) => {
                      const isSelected = est.id === selectedStudentId;
                      return (
                        <button
                          key={est.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(est.id);
                            setToast({
                              message: `${est.name.split(" ")[0]} selecionado`,
                              type: "info"
                            });
                          }}
                          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-600 text-white shadow-xs"
                              : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                          }`}
                        >
                          <span>{est.name.split(" ")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* CENTER: Desktop Search Bar (md+) */}
            {(userRole === "pais" || userRole === "escola" || userRole === "aluno") && (
              <div className="hidden md:block flex-1 max-w-xs lg:max-w-md mx-3">
                <SearchBar
                  id="navbar-search-bar"
                  placeholder="Buscar..."
                  compact={true}
                  comunicados={comunicados}
                  estudantes={estudantes}
                  cobrancas={cobrancas}
                  eventos={eventos}
                  portfolioPhotos={classroomPhotos}
                  onSelectResult={handleGlobalSearchResultSelect}
                  onOpenFullSearch={() => setIsGlobalSearchOpen(true)}
                  showCategoryFilters={true}
                  userRole={userRole}
                />
              </div>
            )}

            {/* RIGHT: Portaria QR (Parents), Search (Mobile), WhiteLabel (Desktop), Theme, Notifications, User */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Portaria QR Code Quick Button for Parents with Standby Pulse & Success Glow */}
              {userRole === "pais" && (
                <button
                  type="button"
                  id="btn-parent-qrcode"
                  onClick={() => setQrCodeModalOpen(true)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer select-none transition-all duration-300 text-white ${
                    isScanSuccessAnimating
                      ? "is-success animate-qrcode-success bg-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.85)] ring-2 ring-emerald-300 scale-105"
                      : "is-standby animate-qrcode-standby bg-emerald-600 hover:bg-emerald-700 shadow-xs ring-1 ring-emerald-400/50"
                  }`}
                  title={
                    isScanSuccessAnimating
                      ? "✅ QR Code Validado com Sucesso na Portaria!"
                      : "QR Code Portaria (Standby ativo - clique para abrir)"
                  }
                  aria-label="QR Code Portaria"
                >
                  {isScanSuccessAnimating ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-white animate-bounce" />
                  ) : (
                    <span className="relative flex h-2 w-2 mr-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
                    </span>
                  )}
                  <QrCode className={`w-4 h-4 shrink-0 transition-transform ${isScanSuccessAnimating ? "rotate-12" : ""}`} />
                  <span className="hidden sm:inline font-sans">
                    {isScanSuccessAnimating ? "Validado!" : "Portaria"}
                  </span>
                </button>
              )}

              {/* Mobile Search Button */}
              <button
                type="button"
                id="btn-global-search-mobile"
                onClick={() => setIsGlobalSearchOpen(true)}
                className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                title="Buscar"
                aria-label="Buscar"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Site da Escola Shortcut */}
              <button
                type="button"
                id="btn-navbar-external-view"
                onClick={() => {
                  changeUserRoleWithMagic("landing");
                  setToast({
                    message: "Página institucional da escola aberta.",
                    type: "info"
                  });
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Acessar Página Institucional da Escola"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="hidden sm:inline font-sans">Site da Escola</span>
              </button>

              {/* Unified Institutional Resources & Tools Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  id="btn-navbar-tools-menu"
                  onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Recursos e Ferramentas"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300 shrink-0" />
                  <span className="hidden sm:inline font-sans">Recursos</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${toolsMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {toolsMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-64 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 space-y-1 text-left"
                    >
                      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-600 dark:text-slate-400">
                          Recursos & Módulos
                        </span>
                      </div>

                      {userRole === "escola" && (
                        <button
                          type="button"
                          id="btn-open-whitelabel-modal"
                          onClick={() => {
                            setIsWhiteLabelModalOpen(true);
                            setToolsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                        >
                          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <span className="block font-bold">Personalização White-Label</span>
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Identidade, cores e brasão</span>
                          </div>
                        </button>
                      )}

                      <button
                        type="button"
                        id="btn-navbar-monthly-pdf"
                        onClick={() => {
                          setActiveModalFocus("financial_report");
                          setIsMonthlyReportModalOpen(true);
                          setToolsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                      >
                        <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <span className="block font-bold">Relatório Executivo PDF</span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Demonstrativo e conciliação</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        id="btn-navbar-text-adventure"
                        onClick={() => {
                          setIsTextAdventureModalOpen(true);
                          setToolsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                      >
                        <Compass className="w-4 h-4 text-amber-500 shrink-0" />
                        <div>
                          <span className="block font-bold">Aventura Textual (RPG)</span>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Gamificação pedagógica com HP</span>
                        </div>
                      </button>

                      {userRole === "escola" && (
                        <button
                          type="button"
                          id="btn-navbar-ltv-config"
                          onClick={() => {
                            setActiveModalFocus("ltv_config");
                            setIsRetentionMasteryConfigOpen(true);
                            setToolsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                        >
                          <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <div>
                            <span className="block font-bold">Metas CRM & Retenção LTV</span>
                            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Régua de rematrículas</span>
                          </div>
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Smart Recommendations Jump Button */}
              {(userRole === "pais" || userRole === "escola" || userRole === "aluno") && (
                <button
                  type="button"
                  id="btn-navbar-recommendations"
                  onClick={() => {
                    const el = document.getElementById("recommendation-engine-container");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else {
                      if (userRole === "pais") changeActiveTabWithMagic("dashboard");
                      else if (userRole === "escola") changeSchoolActiveTabWithMagic("dashboard");
                    }
                  }}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/70 hover:bg-indigo-100/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors cursor-pointer"
                  title="Ações sugeridas"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-sans">Ações</span>
                </button>
              )}

              {/* Theme Selector (Dia / Noite / Sistema) */}
              <ThemeSelector
                themePreference={themePreference}
                onSelectTheme={handleSetThemePreference}
                variant="compact"
                locale={locale}
              />

              {/* Language Selector */}
              <LanguageSelector
                currentLocale={locale}
                onSelectLocale={handleSetLocale}
                variant="dropdown"
                showLabel={true}
              />

              {/* Notification Bell */}
              <div className="relative">
                {(() => {
                  const unreadNotifs = notifications.filter(n => !n.read).length;
                  return (
                    <button
                      type="button"
                      onClick={() => setBellOpen(!bellOpen)}
                      className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-colors cursor-pointer relative ${
                        unreadNotifs > 0
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800"
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                      title="Notificações e Avisos"
                      id="btn-navbar-notifications"
                      aria-label="Notificações"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadNotifs > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 rounded-full bg-rose-500 text-[9px] font-black text-white items-center justify-center font-mono shadow-xs">
                          {unreadNotifs}
                        </span>
                      )}
                    </button>
                  );
                })()}

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {bellOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="fixed inset-x-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 max-w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 text-left"
                    >
                      {/* Top Header */}
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                              Central de Notificações
                            </h3>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Push Service Conectado" />
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {notifications.filter(n => !n.read).length} não lidas
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsPushPreferencesOpen(true);
                              setBellOpen(false);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Personalizar Preferências de Notificação"
                            aria-label="Preferências"
                          >
                            <Settings className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          </button>

                          {notifications.length > 0 && (
                            <div className="flex gap-1.5 items-center text-[10px]">
                              <button
                                type="button"
                                onClick={() => {
                                  setNotifications(prev => {
                                    const updated = prev.map(n => ({ ...n, read: true }));
                                    localStorage.setItem("school_push_notifications", JSON.stringify(updated));
                                    return updated;
                                  });
                                  setToast({ message: "Notificações marcadas como lidas!", type: "success" });
                                }}
                                className="font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 cursor-pointer"
                              >
                                Lidas
                              </button>
                              <span className="text-slate-300 dark:text-slate-700">|</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setNotifications([]);
                                  localStorage.setItem("school_push_notifications", JSON.stringify([]));
                                  setToast({ message: "Histórico de notificações limpo!", type: "success" });
                                }}
                                className="font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer"
                              >
                                Limpar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Event Simulation Bar */}
                      <div className="px-3 py-2 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 shrink-0">
                          Disparo:
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => pushNotificationService.triggerNewMessage()}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                            title="Simular Nova Mensagem"
                          >
                            💬 Mensagem
                          </button>
                          <button
                            type="button"
                            onClick={() => pushNotificationService.triggerUpcomingDeadline()}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                            title="Simular Prazo de Fatura / Trabalho"
                          >
                            ⏳ Prazo
                          </button>
                          <button
                            type="button"
                            onClick={() => pushNotificationService.triggerSpecialPromotion()}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                            title="Simular Promoção Especial"
                          >
                            🎁 Promoção
                          </button>
                        </div>
                      </div>

                      {/* Category Filter Chips */}
                      <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 flex items-center gap-1 overflow-x-auto no-scrollbar">
                        {[
                          { id: "todos", label: "Todos" },
                          { id: "mensagens", label: "Mensagens" },
                          { id: "prazos", label: "Prazos" },
                          { id: "promocoes", label: "Promoções" },
                          { id: "financeiro", label: "Finanças" },
                        ].map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setNotifDropdownCategory(cat.id as any)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                              notifDropdownCategory === cat.id
                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>

                      {/* Notification Items List */}
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {(() => {
                          const filtered = notifications.filter((notif) => {
                            if (notifDropdownCategory === "todos") return true;
                            if (notifDropdownCategory === "mensagens") return notif.category === "new_message" || notif.iconType === "chat" || notif.iconType === "message";
                            if (notifDropdownCategory === "prazos") return notif.category === "deadline" || notif.iconType === "deadline";
                            if (notifDropdownCategory === "promocoes") return notif.category === "promotion" || notif.iconType === "promotion";
                            if (notifDropdownCategory === "financeiro") return notif.category === "financial" || notif.iconType === "faturamento";
                            return true;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="px-4 py-8 text-center text-slate-400">
                                <BellOff className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sem notificações nesta categoria</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Clique em um dos botões de disparo acima para testar.</p>
                              </div>
                            );
                          }

                          return filtered.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 ${
                                !notif.read ? "bg-amber-50/25 dark:bg-amber-950/15" : ""
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                                notif.iconType === "message"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                                  : notif.iconType === "deadline"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                                  : notif.iconType === "promotion"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                                  : notif.iconType === "faturamento"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                  : "bg-amber-100/60 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              }`}>
                                <Bell className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate block">
                                    {notif.title}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono shrink-0">
                                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal line-clamp-2">
                                  {notif.body}
                                </p>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPushPreferencesOpen(true);
                            setBellOpen(false);
                          }}
                          className="text-[10px] font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 py-1 px-2 cursor-pointer flex items-center gap-1"
                        >
                          <Settings className="w-3 h-3" />
                          <span>Preferências Push</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBellOpen(false);
                            if (userRole === "escola") {
                              setSchoolActiveTab("comunicados");
                            } else {
                              setActiveTab("comunicados");
                            }
                          }}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white py-1 px-2 cursor-pointer"
                        >
                          Ver todos comunicados →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Interactive Tutorial Replay Button */}
              <button
                type="button"
                onClick={() => setIsTourOpen(true)}
                className="hidden lg:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer items-center gap-1.5"
                title={locale === "en" ? "Interactive Tutorial Tour" : "Tutorial Interativo do Aplicativo"}
                id="btn-tutorial-replay-header"
              >
                <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Tutorial</span>
              </button>

              {/* Help & FAQs Button (Desktop only) */}
              <button
                type="button"
                onClick={() => {
                  setHelpCenterInitialTab("features");
                  setHelpCenterSearchQuery("");
                  setIsHelpCenterOpen(true);
                }}
                className="hidden xl:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer items-center gap-1.5"
                title="Central de Ajuda e Tutoriais"
                id="btn-help-center-header"
              >
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Ajuda</span>
              </button>

              {/* User Profile Avatar / Logout */}
              {userProfile ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (userRole === "pais") {
                        changeActiveTabWithMagic("perfil");
                      } else {
                        changeSchoolActiveTabWithMagic("perfil");
                      }
                    }}
                    className="flex items-center gap-1.5 p-1 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Acessar Perfil"
                    id="btn-user-profile"
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-amber-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {userProfile.photoURL ? (
                        <img src={userProfile.photoURL} alt={userProfile.displayName || "Perfil"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-amber-800 dark:text-amber-200" />
                      )}
                    </div>
                    <span className="hidden md:inline text-xs font-bold text-slate-800 dark:text-slate-200 pr-1 max-w-[90px] truncate">
                      {userProfile.displayName?.split(" ")[0] || "Perfil"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="hidden sm:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-rose-50 hover:border-rose-300 dark:bg-slate-900 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                    title="Sair da Conta"
                    id="btn-header-logout"
                    aria-label="Sair da Conta"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="btn-header-login"
                  onClick={() => {
                    setAuthSectionInitialGate(userRole === "escola" ? "escola" : "pais");
                    setAuthSectionInitialTab("login");
                    setShowAuthSection(true);
                    changeLandingSubViewWithMagic("portais");
                    setUserRole("landing");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer shrink-0"
                  title="Entrar no Portal"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </button>
              )}
            </div>
          </header>

          {/* 3. BRANDING INTERACTIVE ADJUSTMENTS SIDEBAR PANEL (Only for School Team) */}
          <AnimatePresence>
            {showBrandingPanel && userRole === "escola" && (
              <motion.div 
                initial={{ opacity: 0, x: 260 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 260 }}
                className="fixed top-0 right-0 h-full w-80 bg-slate-950 border-l border-indigo-950 z-50 p-6 shadow-2xl overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-indigo-900 pb-4 mb-4">
                  <span className="text-sm font-bold font-serif text-white flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-amber-400" />
                    Customização da Escola
                  </span>
                  <button 
                    onClick={() => setShowBrandingPanel(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 font-light mb-4">
                  Defina os logotípos, cores e temas institucionais da escola sob demanda.
                </p>

                {/* Full White-label Customizer Launcher */}
                <button
                  type="button"
                  id="btn-sidebar-open-whitelabel-modal"
                  onClick={() => {
                    setIsWhiteLabelModalOpen(true);
                    setShowBrandingPanel(false);
                  }}
                  className="w-full mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 border border-amber-400/50 hover:border-amber-300 text-white font-bold text-xs flex items-center justify-between transition-all group cursor-pointer shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="text-[11px] font-black text-amber-300">Customização 100% White-Label</div>
                      <div className="text-[9px] text-slate-300 font-normal">Logo, Cores, Módulos & Feed</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="space-y-4 text-xs">
                  
                  {/* Presets switcher */}
                  <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-indigo-900/80">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1 font-sans">
                        <Palette className="w-3.5 h-3.5 text-amber-400" />
                        <span>Temas Institucionais Pré-definidos</span>
                      </label>
                      <span className="text-[9px] text-slate-400 font-mono">Troca Instantânea</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(brandingPresets).map(([key, item]) => {
                        const isSelected =
                          branding.themePreset === key ||
                          (branding.primaryColor === item.primary && branding.secondaryColor === item.secondary);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              saveBrandingData({
                                ...branding,
                                themePreset: key as any,
                                logoPreset: item.logo as any,
                                primaryColor: item.primary,
                                secondaryColor: item.secondary,
                              });
                              setToast({
                                message: `🎨 Tema "${item.name}" (${item.desc}) aplicado com sucesso!`,
                                type: "success",
                              });
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-indigo-950/80 border-amber-400/80 text-white shadow-md ring-1 ring-amber-400/40"
                                : "bg-slate-900/50 border-indigo-950 text-slate-300 hover:bg-slate-900 hover:border-indigo-800"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Swatch circles */}
                              <div className="flex items-center -space-x-1 shrink-0">
                                <span
                                  className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
                                  style={{ backgroundColor: item.primary }}
                                  title={`Primária: ${item.primary}`}
                                />
                                <span
                                  className="w-4 h-4 rounded-full border border-white/40 shadow-xs"
                                  style={{ backgroundColor: item.secondary }}
                                  title={`Secundária: ${item.secondary}`}
                                />
                              </div>
                              <div>
                                <span className="font-extrabold text-xs block text-white">{item.name}</span>
                                <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                              </div>
                            </div>

                            <span
                              className={`text-[9.5px] px-2 py-0.5 rounded-full font-extrabold transition-all ${
                                isSelected
                                  ? "bg-amber-400 text-slate-950 shadow-xs"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {isSelected ? "Ativo ✓" : "Aplicar"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                                    <hr className="border-indigo-950" />

                  {/* Editable School Name */}
     <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-indigo-900/80">
                    <label className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block font-sans">
                      Nome da Escola
                    </label>
                    <input
                      type="text"
                      value={branding.schoolName}
                      onChange={(e) => {
                        saveBrandingData({ ...branding, schoolName: e.target.value });
                      }}
                      placeholder="Ex: Magic Learning Academy"
                      className="w-full bg-slate-950 border border-indigo-900 rounded-lg p-2 text-xs text-white focus:outline-hidden focus:border-amber-400 font-sans"
                    />
                  </div>

                  {/* Colors */}
                  <div className="space-y-3 bg-slate-900/80 p-3 rounded-xl border border-indigo-900/80">
                    <label className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block font-sans">
                      Paleta de Cores Customizada
                    </label>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-xs">Cor Primária</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={branding.primaryColor}
                          onChange={(e) => {
                            saveBrandingData({ ...branding, primaryColor: e.target.value });
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-[11px] font-mono text-slate-400">{branding.primaryColor}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 text-xs">Cor Secundária</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={branding.secondaryColor}
                          onChange={(e) => {
                            saveBrandingData({ ...branding, secondaryColor: e.target.value });
                          }}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-[11px] font-mono text-slate-400">{branding.secondaryColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reset Defaults button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetBrandingToDefault();
                        setToast({
                          message: "Identidade visual restaurada para o padrão oficial.",
                          type: "info"
                        });
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-indigo-900/60 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar Padrão do Sistema</span>
                    </button>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 4. MAIN NAVIGATION TABS BAR */}
          <nav className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-14 z-30 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between overflow-x-auto no-scrollbar py-2">
                
                {/* Parents Portal Navigation Tabs */}
                {userRole === "pais" && (
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    {[
                      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: undefined, moduleKey: undefined },
                      { id: "diaadia", label: "Agenda & Diário", icon: Calendar, badge: undefined, moduleKey: "diario" },
                      { id: "academico", label: "Boletim Pedagógico", icon: GraduationCap, badge: undefined, moduleKey: "boletim" },
                      { id: "comunicados", label: "Mural de Avisos", icon: Bell, badge: comunicados.filter(c => !c.seenByParent?.includes("parent-1")).length || undefined, moduleKey: "comunicados" },
                      { id: "cobrancas", label: "Financeiro & Pix", icon: DollarSign, badge: cobrancas.filter(c => c.status === "pendente" || c.status === "atrasado").length || undefined, moduleKey: "financeiro" },
                      { id: "acesso", label: "Portaria & QR", icon: QrCode, badge: undefined, moduleKey: "portaria" },
                      { id: "premium_hub", label: "Hub de Conquistas", icon: Sparkles, badge: undefined, moduleKey: "gamificacao" },
                      { id: "perfil", label: "Meu Perfil", icon: UserIcon, badge: undefined, moduleKey: undefined }
                    ]
                      .filter((tabItem) => !tabItem.moduleKey || branding.enabledModules?.[tabItem.moduleKey as keyof typeof branding.enabledModules] !== false)
                      .map((tabItem) => {
                        const isActive = activeTab === tabItem.id;
                        const IconComponent = tabItem.icon;
                        return (
                          <motion.button
                            key={tabItem.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => changeActiveTabWithMagic(tabItem.id as any)}
                            className={`relative px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none ${
                              isActive
                                ? "text-slate-900 dark:text-slate-100 bg-amber-500/10 dark:bg-amber-500/10 shadow-3xs border border-amber-500/30"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-transparent"
                            }`}
                          >
                            <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"}`} />
                            <span>{getTabLabel("pais", tabItem.id, locale) || tabItem.label}</span>
                            
                            {tabItem.badge !== undefined && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black ml-1 bg-rose-500 text-white">
                                {tabItem.badge}
                              </span>
                            )}

                            {isActive && (
                              <motion.div
                                layoutId="active-tab-indicator-bar"
                                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                                style={{ backgroundColor: branding.primaryColor || "#D97706" }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                              />
                            )}
                          </motion.button>
                        );
                      })}
                  </div>
                )}

                {/* School Portal Navigation Tabs */}
                {userRole === "escola" && (
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    {[
                      { id: "dashboard", label: "Painel Geral", icon: LayoutDashboard, badge: undefined, moduleKey: undefined },
                      { id: "agenda", label: "Diário de Turmas", icon: Calendar, badge: undefined, moduleKey: "diario" },
                      { id: "retiradas", label: "Portaria & Fila", icon: Car, badge: undefined, moduleKey: "portaria" },
                      { id: "comunicados", label: "Envio de Comunicados", icon: BellRing, badge: undefined, moduleKey: "comunicados" },
                      { id: "erp", label: "Integração ERP", icon: Layers, badge: undefined, moduleKey: "erp" },
                      { id: "alunos", label: "Alunos & CRM", icon: Users, badge: undefined, moduleKey: "crm" },
                      { id: "metricas", label: "BI & Desempenho", icon: TrendingUp, badge: undefined, moduleKey: "bi" },
                      { id: "planejador", label: "Grade Curricular", icon: Clock, badge: undefined, moduleKey: "planejador" },
                      { id: "benchmarking", label: "Benchmarking & ROI", icon: Award, badge: undefined, moduleKey: "benchmarking" },
                      { id: "premium_hub", label: "Hub de Acessos", icon: Sparkles, badge: undefined, moduleKey: "gamificacao" },
                      { id: "moderacao", label: "Moderação & Ouvidoria", icon: ShieldAlert, badge: pendingModerationReportsCount > 0 ? pendingModerationReportsCount : undefined, moduleKey: undefined },
                      { id: "perfil", label: "Perfil Institucional", icon: UserIcon, badge: undefined, moduleKey: undefined }
                    ]
                      .filter((tabItem) => !tabItem.moduleKey || branding.enabledModules?.[tabItem.moduleKey as keyof typeof branding.enabledModules] !== false)
                      .map((tabItem) => {
                      const isActive = schoolActiveTab === tabItem.id;
                      const IconComponent = tabItem.icon;
                      return (
                        <motion.button
                          key={tabItem.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => changeSchoolActiveTabWithMagic(tabItem.id as any)}
                          className={`relative px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none ${
                            isActive
                              ? "text-slate-900 dark:text-slate-100 bg-amber-500/10 dark:bg-amber-500/10 shadow-3xs border border-amber-500/30"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 border border-transparent"
                          }`}
                        >
                          <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-400 dark:text-slate-500"}`} />
                          <span>{getTabLabel("escola", tabItem.id, locale) || tabItem.label}</span>

                          {tabItem.badge !== undefined && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-black bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 ml-1">
                              {tabItem.badge}
                            </span>
                          )}

                          {isActive && (
                            <motion.div
                              layoutId="school-active-tab-indicator-bar"
                              className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                              style={{ backgroundColor: branding.primaryColor || "#D97706" }}
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Student Portal Navigation Tabs */}
                {userRole === "aluno" && (
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    {[
                      { id: "simplificada", label: "Lições & Metas", icon: CheckCircle2 },
                      { id: "horarios", label: "Horário de Aulas", icon: Clock },
                      { id: "conquistas", label: "Conquistas", icon: Award },
                      { id: "completa", label: "Visão Geral", icon: Sparkles },
                    ].map((tabItem) => {
                      const isActive =
                        studentActiveTab === tabItem.id ||
                        (tabItem.id === "simplificada" && studentActiveTab === "dashboard");
                      const IconComponent = tabItem.icon;
                      return (
                        <button
                          key={tabItem.id}
                          type="button"
                          onClick={() => setStudentActiveTab(tabItem.id as any)}
                          className={`relative px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap select-none cursor-pointer ${
                            isActive
                              ? "text-slate-900 dark:text-slate-100 bg-amber-500/15 dark:bg-amber-500/20 border border-amber-400/40 dark:border-amber-500/40"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`} />
                          <span>{tabItem.label}</span>
                          {isActive && (
                            <div
                              className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-amber-500"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>
          </nav>

          {/* 5. MAIN CONTENT AREA WITH 'MAGIC LEARNING' SMOOTH TRANSITION ANIMATIONS */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
            {/* GLOBAL INSTITUTIONAL WARNING BANNER: Checks for current user's unacknowledged warnings */}
            <UserWarningBanner
              warnings={userWarnings}
              currentUser={{
                uid: userProfile?.uid || "user-demo",
                displayName: userProfile?.displayName || (activeStudent ? `Família de ${activeStudent.name}` : "Responsável"),
                role: userRole
              }}
              onAcknowledge={handleAcknowledgeWarning}
            />

            {/* CONTEXTUAL BREADCRUMBS & NAVIGATION HEADER */}
            {userRole === "pais" && (
              <AppBreadcrumbsNav
                userRole="pais"
                activeTab={activeTab}
                primaryColor={branding.primaryColor}
                tabLabel={getTabLabel("pais", activeTab, locale)}
                tabDescription={getTabDescription("pais", activeTab, locale)}
                studentName={activeStudent?.name}
                onGoBack={handleGoBack}
                onGoHome={() => changeActiveTabWithMagic("dashboard")}
                onGoToLanding={() => {
                  triggerMagicalTransition(() => {
                    setUserRole("landing");
                    setLandingSubView("site");
                  });
                }}
                backTargetLabel={previousBackLabel}
              />
            )}

            {userRole === "escola" && (
              <AppBreadcrumbsNav
                userRole="escola"
                activeTab={schoolActiveTab}
                primaryColor={branding.primaryColor}
                tabLabel={getTabLabel("escola", schoolActiveTab, locale)}
                tabDescription={
                  getTabDescription("escola", schoolActiveTab, locale) ||
                  (schoolActiveTab === "dashboard" ? "Visão executiva e indicadores operacionais da instituição" :
                  schoolActiveTab === "agenda" ? "Gestão diária de turmas, registros de frequência e ocorrências" :
                  schoolActiveTab === "retiradas" ? "Controle de fluxo de alunos na portaria e leitor QR Code" :
                  schoolActiveTab === "comunicados" ? "Envio de comunicados em massa, segmentação e engajamento" :
                  schoolActiveTab === "erp" ? "Sincronização bidirecional em tempo real com o ERP escolar" :
                  schoolActiveTab === "alunos" ? "Base de estudantes, rematrícula, LTV e régua de retenção" :
                  schoolActiveTab === "metricas" ? "Gráficos de correlação, aproveitamento e relatórios analíticos" :
                  schoolActiveTab === "planejador" ? "Organização de horários de aulas e alocação de professores" :
                  schoolActiveTab === "benchmarking" ? "Comparativo de mercado, ROI e inteligência competitiva" :
                  schoolActiveTab === "premium_hub" ? "Central de ferramentas avançadas e recursos institucionais" :
                  schoolActiveTab === "moderacao" ? "Triagem de denúncias, análise de comentários e fotos, aplicação de advertências e salvaguarda das normas" :
                  schoolActiveTab === "perfil" ? "Dados da instituição, marca e configurações de sistema" : "")
                }
                onGoBack={handleGoBack}
                onGoHome={() => changeSchoolActiveTabWithMagic("dashboard")}
                onGoToLanding={() => {
                  triggerMagicalTransition(() => {
                    setUserRole("landing");
                    setLandingSubView("site");
                  });
                }}
                backTargetLabel={previousBackLabel}
              />
            )}

            {userRole === "aluno" && (
              <AppBreadcrumbsNav
                userRole="aluno"
                activeTab={studentActiveTab}
                primaryColor={branding.primaryColor}
                tabLabel={
                  studentActiveTab === "simplificada" || studentActiveTab === "tarefas"
                    ? "Lições & Metas do Dia (Visão Simplificada)"
                    : studentActiveTab === "horarios"
                    ? "Horário de Aulas"
                    : studentActiveTab === "conquistas"
                    ? "Minhas Conquistas"
                    : "Meu Espaço de Aprendizado"
                }
                tabDescription={
                  studentActiveTab === "simplificada" || studentActiveTab === "tarefas"
                    ? "Foco exclusivo em lições de casa e metas de aprendizado do dia sem distrações"
                    : "Horários de hoje, tarefas escolares, notas e medalhas de conquista"
                }
                studentName={activeStudent?.name}
                onGoBack={handleGoBack}
                onGoHome={() => {
                  setStudentActiveTab("simplificada");
                }}
                onGoToLanding={() => {
                  triggerMagicalTransition(() => {
                    setUserRole("landing");
                    setLandingSubView("site");
                  });
                }}
                backTargetLabel={previousBackLabel}
              />
            )}

            <AnimatePresence mode="wait">
              {/* PARENTS PORTAL ACTIVE TAB VIEWS WITH MAGIC TRANSITION */}
              {userRole === "pais" && (
                <motion.div
                  key={`pais-${activeTab}-${selectedStudentId}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="w-full"
                >
                  {activeTab === "dashboard" && (
                    <ParentDashboard
                      estudantes={estudantes}
                      selectedStudentId={selectedStudentId}
                      comunicados={comunicados}
                      momentos={momentos}
                      eventos={eventos}
                      cobrancas={cobrancas}
                      branding={branding}
                      onNavigateToTab={(tab: any) => changeActiveTabWithMagic(tab)}
                      onOpenQrCode={() => setQrCodeModalOpen(true)}
                      onStartTour={() => setIsTourOpen(true)}
                      onOpenFullSearch={() => setIsGlobalSearchOpen(true)}
                      onSelectSearchResult={handleGlobalSearchResultSelect}
                      onUpdateStudentPhoto={handleUpdateStudentPhoto}
                      onToast={(msg, type) => setToast({ message: msg, type })}
                    />
                  )}

                  {activeTab === "diaadia" && (
                    <StudentDailyRoutineTab
                      activeStudent={activeStudent}
                      estudantes={estudantes}
                      selectedPeriod={selectedPeriod}
                      setSelectedPeriod={setSelectedPeriod}
                      classroomPhotos={classroomPhotos}
                      setClassroomPhotos={setClassroomPhotos}
                      photoTeacherFilter={photoTeacherFilter}
                      setPhotoTeacherFilter={setPhotoTeacherFilter}
                      photoSortOrder={photoSortOrder}
                      setPhotoSortOrder={setPhotoSortOrder}
                      setSelectedClassroomPhoto={setSelectedClassroomPhoto}
                      setPhotoToDelete={setPhotoToDelete}
                      userRole={userRole}
                      branding={branding}
                      onToast={(msg, type) => setToast({ message: msg, type })}
                      onReportPhoto={(photo) => {
                        handleOpenReportModal({
                          contentType: "photo",
                          contentId: photo.id,
                          contentTitle: photo.title,
                          contentSnippet: `Foto postada pelo professor(a) ${photo.teacherName} em ${photo.date}`,
                          contentAuthorName: photo.teacherName,
                          contentImageUrl: photo.imageUrl
                        });
                      }}
                    />
                  )}

                  {activeTab === "academico" && (
                    <AcademicFourTermsTab
                      activeStudent={activeStudent}
                      masteryThreshold={masteryThreshold}
                      branding={branding}
                      onBack={() => changeActiveTabWithMagic("dashboard")}
                    />
                  )}

                  {activeTab === "comunicados" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                        <div>
                          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Mural de Comunicados Oficiais
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Acompanhe circulares, reuniões pedagógicas e informativos da escola em tempo real.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800">
                            {comunicados.length} Informativos Publicados
                          </span>
                        </div>
                      </div>

                      <ComunicadosList
                        items={comunicados}
                        isSchoolView={false}
                        onSelect={handleOpenComunicado}
                        onToggleReaction={handleAnnouncementReaction}
                        onReport={handleOpenReportForComunicado}
                        expandedCommentIds={expandedComunicadoComments}
                        onToggleComments={handleToggleComunicadoComments}
                        quickCommentTexts={quickCommentTexts}
                        onQuickCommentChange={handleQuickCommentChange}
                        onSubmitQuickComment={handleSendQuickComment}
                      />
                    </div>
                  )}

                  {activeTab === "cobrancas" && (
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            Extrato Financeiro & Mensalidades
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Consulte boletos, comprovantes, Pix copia e cola e acordos com transparência.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setIsMonthlyReportModalOpen(true)}
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all cursor-pointer shadow-3xs flex items-center gap-2 shrink-0"
                            id="btn-export-monthly-financial-report"
                            title="Exportar Relatório Financeiro Mensal consolidado em PDF com validade fiscal e quitação"
                          >
                            <FileText className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                            <span>Exportar Relatório Mensal (PDF)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setHelpCenterInitialTab("finance_flow");
                              setHelpCenterSearchQuery("");
                              setIsHelpCenterOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-3xs flex items-center gap-2 shrink-0"
                            title="Abrir Tutorial Interativo do Fluxo Financeiro (Boletos, Descontos & Alertas ERP)"
                            id="btn-tutorial-financeiro-cobrancas"
                          >
                            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Tutorial ERP</span>
                          </button>
                        </div>
                      </div>

                      {/* Invoices List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cobrancas.map((cob) => (
                          <div
                            key={cob.id}
                            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">{cob.id}</span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  cob.status === "pago"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                                    : cob.status === "atrasado"
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                                }`}>
                                  {cob.status === "pago" ? "Liquidado ✓" : cob.status === "atrasado" ? "Vencido" : "Em Aberto"}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">{cob.title}</h4>
                              <p className="text-xs text-slate-500">Vencimento: <strong className="text-slate-700 dark:text-slate-300 font-mono">{cob.dueDate}</strong></p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor</span>
                                <strong className="text-base font-mono font-black text-slate-900 dark:text-slate-100">
                                  R$ {cob.amount.toFixed(2).replace(".", ",")}
                                </strong>
                              </div>
                              <button
                                onClick={() => setBillingDetail(cob)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                              >
                                Ver Detalhes / Pix
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Renegotiation Section */}
                      <RenegociacaoFinanceira
                        cobrancas={cobrancas}
                        erpName={erpName}
                        onOpenFinancialTutorial={() => {
                          setHelpCenterInitialTab("finance_flow");
                          setHelpCenterSearchQuery("");
                          setIsHelpCenterOpen(true);
                        }}
                        onNegotiationCompleted={(acordoCobIds, newInstallments) => {
                          setToast({
                            message: "🤝 Proposta de Acordo formalizada com sucesso!",
                            type: "success"
                          });
                        }}
                      />
                    </div>
                  )}

                  {activeTab === "acesso" && (
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                            <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Portaria Segura & Autorizações de Retirada
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Crachá dinâmico de liberação e cadastro de responsáveis autorizados.
                          </p>
                        </div>
                        <button
                          onClick={() => setQrCodeModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Abrir Crachá Digital</span>
                        </button>
                      </div>

                      {/* Caregiver Authorizations List */}
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                          Pessoas Autorizadas para Retirada de {activeStudent.name}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {activeStudent.autorizacoes?.map((auth) => (
                            <div
                              key={auth.id}
                              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <strong className="text-xs font-bold text-slate-850 dark:text-slate-100">{auth.name}</strong>
                                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold">
                                  {auth.relationship}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono">CPF: {auth.document}</p>
                              <p className="text-[11px] text-slate-500 font-mono">Tel: {auth.phone}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "premium_hub" && (
                    <div className="space-y-6">
                      <EmotionalDashboard activeStudent={activeStudent} branding={branding} />
                      <AchievementsWidget activeStudent={activeStudent} />
                    </div>
                  )}

                  {activeTab === "perfil" && (
                    <UserProfilePage
                      userProfile={userProfile}
                      onProfileUpdated={(updated) => {
                        setUserProfile(updated);
                        localStorage.setItem("school_portal_user_profile", JSON.stringify(updated));
                        setToast({
                          message: "Perfil atualizado com sucesso!",
                          type: "success"
                        });
                      }}
                      onShowToast={(msg, type) => setToast({ message: msg, type })}
                      onLogout={() => {
                        setUserRole("landing");
                        setLandingSubView("site");
                      }}
                      userRole="pais"
                      students={estudantes}
                      isDarkMode={isDarkMode}
                      onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                      themePreference={themePreference}
                      onSelectThemePreference={handleSetThemePreference}
                      locale={locale}
                      onLocaleChanged={handleSetLocale}
                      onUpdateStudentPhoto={handleUpdateStudentPhoto}
                      onOpenPushPreferences={() => setIsPushPreferencesOpen(true)}
                    />
                  )}
                </motion.div>
              )}

              {/* SCHOOL PORTAL ACTIVE TAB VIEWS WITH MAGIC TRANSITION */}
              {userRole === "escola" && (
                <motion.div
                  key={`escola-${schoolActiveTab}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="w-full"
                >
                  {schoolActiveTab === "dashboard" && (
                    <SchoolDashboard
                      estudantes={estudantes}
                      comunicados={comunicados}
                      momentos={momentos}
                      cobrancas={cobrancas}
                      schoolName={branding.schoolName}
                      lastPipelineTransition={lastPipelineTransition}
                      masteryThreshold={masteryThreshold}
                      erpSyncStatus={erpSyncStatus}
                      erpLastSyncTime={erpLastSyncTime}
                      onTriggerSync={() => {
                        handleTestErpConnection();
                      }}
                      onNavigateToTab={(tab: any) => changeSchoolActiveTabWithMagic(tab)}
                      onNavigateToRematricula={() => {
                        setAlunosSubTab("rematricula");
                        changeSchoolActiveTabWithMagic("alunos");
                      }}
                      onNavigateToFunnelStats={() => {
                        setAlunosSubTab("funil_estatisticas");
                        changeSchoolActiveTabWithMagic("alunos");
                      }}
                      onSelectSearchResult={handleGlobalSearchResultSelect}
                      onOpenFullSearch={() => setIsGlobalSearchOpen(true)}
                      pendingReportsCount={pendingModerationReportsCount}
                    />
                  )}

                  {schoolActiveTab === "agenda" && (
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Diário de Classe & Registro Pedagógico
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Lance ocorrências diárias, alimentação, repouso, medicação e comunicados para as famílias.
                          </p>
                        </div>
                      </div>

                      <StudentDailyRoutineTab
                        activeStudent={activeStudent}
                        estudantes={estudantes}
                        selectedPeriod={selectedPeriod}
                        setSelectedPeriod={setSelectedPeriod}
                        classroomPhotos={classroomPhotos}
                        setClassroomPhotos={setClassroomPhotos}
                        photoTeacherFilter={photoTeacherFilter}
                        setPhotoTeacherFilter={setPhotoTeacherFilter}
                        photoSortOrder={photoSortOrder}
                        setPhotoSortOrder={setPhotoSortOrder}
                        setSelectedClassroomPhoto={setSelectedClassroomPhoto}
                        setPhotoToDelete={setPhotoToDelete}
                        userRole={userRole}
                        branding={branding}
                        onToast={(msg, type) => setToast({ message: msg, type })}
                      />
                    </div>
                  )}

                  {schoolActiveTab === "retiradas" && (
                    <div className="space-y-6">
                      <PortariaQrScanner
                        estudantes={estudantes}
                        branding={branding}
                        onCheckIn={handleCheckInStudent}
                        onCheckOut={handleCheckOutStudent}
                        onToast={(msg, type) => setToast({ message: msg, type })}
                        onSuccessScan={(studName) => {
                          setToast({
                            message: `✅ Passe validado para: ${studName}`,
                            type: "success"
                          });
                        }}
                      />
                    </div>
                  )}

                  {schoolActiveTab === "comunicados" && (
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                            <BellRing className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Central de Disparo de Avisos & Comunicados
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Envie notificações por push, aplicativo e WhatsApp para turmas ou responsáveis específicos.
                          </p>
                        </div>
                        <button
                          onClick={() => setIsCreateAnnouncementOpen(true)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Novo Comunicado</span>
                        </button>
                      </div>

                      <ComunicadosList
                        items={comunicados}
                        isSchoolView={true}
                        onSelect={handleOpenComunicado}
                        emptyMessage="Nenhum comunicado cadastrado na central escolar."
                      />
                    </div>
                  )}

                  {schoolActiveTab === "erp" && (
                    <ErpIntegrationDashboard
                      erpName={erpName}
                      setErpName={setErpName}
                      erpApiKey={erpApiKey}
                      setErpApiKey={setErpApiKey}
                      erpWebhookUrl={erpWebhookUrl}
                      setErpWebhookUrl={setErpWebhookUrl}
                      erpSyncStatus={erpSyncStatus}
                      setErpSyncStatus={setErpSyncStatus}
                      erpLastSyncTime={erpLastSyncTime}
                      setErpLastSyncTime={setErpLastSyncTime}
                      estudantes={estudantes}
                      cobrancas={cobrancas}
                      setToast={setToast}
                      onBack={() => changeSchoolActiveTabWithMagic("dashboard")}
                      onOpenInvoiceReminderModal={handleOpenInvoiceReminderModal}
                    />
                  )}

                  {schoolActiveTab === "alunos" && (
                    <div className="space-y-6">
                      {/* Sub-navegação do CRM Escolar */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                          <button
                            type="button"
                            id="tab-crm-kanban"
                            onClick={() => {
                              setAlunosSubTab("kanban");
                              localStorage.setItem("crm_alunos_active_subtab", "kanban");
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                              alunosSubTab === "kanban"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <Kanban className="w-3.5 h-3.5" />
                            <span>Quadro Kanban</span>
                          </button>

                          <button
                            type="button"
                            id="tab-crm-funil-conversao"
                            onClick={() => {
                              setAlunosSubTab("funil_estatisticas");
                              localStorage.setItem("crm_alunos_active_subtab", "funil_estatisticas");
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                              alunosSubTab === "funil_estatisticas"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Estatísticas de Conversão & WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            id="tab-crm-pipeline-rematricula"
                            onClick={() => {
                              setAlunosSubTab("rematricula");
                              localStorage.setItem("crm_alunos_active_subtab", "rematricula");
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                              alunosSubTab === "rematricula"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>Esteira de Rematrícula</span>
                          </button>

                          <button
                            type="button"
                            id="tab-crm-fichas-alunos"
                            onClick={() => {
                              setAlunosSubTab("fichas");
                              localStorage.setItem("crm_alunos_active_subtab", "fichas");
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                              alunosSubTab === "fichas" || alunosSubTab === "acesso"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Fichas dos Estudantes ({estudantes.length})</span>
                          </button>

                          <button
                            type="button"
                            id="tab-crm-disparos-lembretes"
                            onClick={() => {
                              setAlunosSubTab("disparos");
                              localStorage.setItem("crm_alunos_active_subtab", "disparos");
                            }}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                              alunosSubTab === "disparos"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Lembretes & Disparos</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            id="btn-open-ltv-mastery-modal"
                            onClick={() => setIsRetentionMasteryConfigOpen(true)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                            title="Ajustar limiares de LTV Mastery e thresholds de engajamento do CRM"
                          >
                            <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>LTV Mastery & Thresholds</span>
                          </button>

                          <div className="hidden sm:flex items-center gap-2 px-2 text-[11px] font-mono text-slate-400">
                            <span>WhatsApp API Conectado</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      </div>

                      {/* Visão 0: Quadro Kanban Interativo de Rematrícula */}
                      {alunosSubTab === "kanban" && (
                        <CrmKanbanBoard
                          estudantes={estudantes}
                          onUpdateStudentStage={(studentId, newStage, prev) => {
                            handleStudentPipelineStageChange(studentId, newStage, prev);
                          }}
                          onTriggerDirectMessage={(phone, text) => {
                            setToast({
                              message: `Mensagem via WhatsApp enviada com sucesso para ${phone}!`,
                              type: "success"
                            });
                          }}
                          onTriggerPushNotification={triggerPushNotification}
                          onToast={(t) => setToast(t)}
                        />
                      )}

                      {/* Visão 1: Painel Novo de Estatísticas de Conversão & Leitura WhatsApp */}
                      {alunosSubTab === "funil_estatisticas" && (
                        <CrmConversionAnalyticsPanel
                          estudantes={estudantes}
                          comunicados={comunicados}
                          onTriggerDirectMessage={(phone, text) => {
                            setToast({
                              message: `Mensagem via WhatsApp enviada com sucesso para ${phone}!`,
                              type: "success"
                            });
                          }}
                          onUpdateStudentStage={(studentId, newStage) => {
                            handleStudentPipelineStageChange(studentId, newStage);
                          }}
                          onToast={(t) => setToast(t)}
                        />
                      )}

                      {/* Visão 2: Esteira / Pipeline de Rematrícula */}
                      {alunosSubTab === "rematricula" && (
                        <div className="space-y-6">
                          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <Kanban className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans">
                                  Prefere o gerenciamento visual por arrastar e soltar?
                                </h4>
                                <p className="text-[11px] text-slate-500 font-sans">
                                  Acesse o Quadro Kanban para mover os cartões de estudantes diretamente entre Pendente, Em Negociação e Contrato Aceito.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAlunosSubTab("kanban");
                                localStorage.setItem("crm_alunos_active_subtab", "kanban");
                              }}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto transition-colors"
                            >
                              <span>Abrir Quadro Kanban</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <CrmPipelineAlertsModule
                            estudantes={estudantes}
                            onUpdateStudentStage={(studentId, newStage, prev) => {
                              handleStudentPipelineStageChange(studentId, newStage, prev);
                            }}
                            onTriggerPushNotification={triggerPushNotification}
                            onToast={(t) => setToast(t)}
                          />
                        </div>
                      )}

                      {/* Visão 3: Fichas & Cadastros dos Alunos */}
                      {(alunosSubTab === "fichas" || alunosSubTab === "acesso") && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {estudantes.map((est) => (
                              <div
                                key={est.id}
                                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 group">
                                    <img
                                      src={est.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + est.id}
                                      alt={est.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setCameraModalStudent(est)}
                                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                                      title={`Tirar foto de ${est.name} com a câmera`}
                                    >
                                      <Camera className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100 truncate">{est.name}</h4>
                                    <span className="text-xs text-slate-500 block truncate">{est.grade}</span>
                                  </div>
                                </div>
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                                  <p>Turma: <strong className="text-slate-700 dark:text-slate-300">{est.classRoom || est.grade}</strong></p>
                                  <p>Responsável: <strong className="text-slate-700 dark:text-slate-300">{est.parentName}</strong></p>
                                  <p>
                                    Rematrícula:{" "}
                                    <span className={`font-bold ${
                                      est.reEnrollmentStatus === "concluido" 
                                        ? "text-emerald-600" 
                                        : est.reEnrollmentStatus === "em_analise" 
                                        ? "text-amber-600" 
                                        : "text-slate-500"
                                    }`}>
                                      {est.reEnrollmentStatus === "concluido" 
                                        ? "Contrato Aceito" 
                                        : est.reEnrollmentStatus === "em_analise" 
                                        ? "Em Negociação" 
                                        : "Pendente"}
                                    </span>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setCameraModalStudent(est)}
                                  className="w-full py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  title={`Tirar foto de ${est.name} com a câmera`}
                                >
                                  <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                  <span>Tirar Foto com Câmera</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Visão 4: Lembretes & Disparos Automatizados */}
                      {alunosSubTab === "disparos" && (
                        <div className="space-y-4">
                          <AutomatedRemindersCrm
                            estudantes={estudantes}
                            cobrancas={cobrancas}
                            onSelectStudent={(id) => setSelectedStudentId(id)}
                            onToast={(msg, type) => setToast({ message: msg, type })}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {schoolActiveTab === "metricas" && (
                    <SchoolMetricsDashboard onBack={() => changeSchoolActiveTabWithMagic("dashboard")} />
                  )}

                  {schoolActiveTab === "planejador" && (
                    <TimetablePlanner />
                  )}

                  {schoolActiveTab === "benchmarking" && (
                    <MarketIntelligenceHub onBack={() => changeSchoolActiveTabWithMagic("dashboard")} />
                  )}

                  {schoolActiveTab === "premium_hub" && (
                    <AppleNotionSchoolAccessHub />
                  )}

                  {schoolActiveTab === "perfil" && (
                    <UserProfilePage
                      userProfile={userProfile}
                      onProfileUpdated={(updated) => {
                        setUserProfile(updated);
                        localStorage.setItem("school_portal_user_profile", JSON.stringify(updated));
                        setToast({
                          message: "Perfil institucional atualizado!",
                          type: "success"
                        });
                      }}
                      onShowToast={(msg, type) => setToast({ message: msg, type })}
                      onLogout={() => {
                        setUserRole("landing");
                        setLandingSubView("site");
                      }}
                      userRole="escola"
                      students={estudantes}
                      isDarkMode={isDarkMode}
                      onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                      themePreference={themePreference}
                      onSelectThemePreference={handleSetThemePreference}
                      locale={locale}
                      onLocaleChanged={handleSetLocale}
                      onUpdateStudentPhoto={handleUpdateStudentPhoto}
                      onOpenPushPreferences={() => setIsPushPreferencesOpen(true)}
                    />
                  )}

                  {schoolActiveTab === "moderacao" && (
                    <ContentModerationHub
                      reports={moderationReports}
                      userWarnings={userWarnings}
                      onUpdateReportStatus={handleUpdateReportStatus}
                      onRemoveContent={handleRemoveContentByModerator}
                      onRestoreContent={handleRestoreContentByModerator}
                      onIssueWarning={handleIssueWarningByModerator}
                      onToast={(msg, type) => setToast({ message: msg, type })}
                      branding={branding}
                    />
                  )}
                </motion.div>
              )}

              {/* STUDENT PORTAL ACTIVE VIEW WITH MAGIC TRANSITION */}
              {userRole === "aluno" && (
                <motion.div
                  key={`aluno-${activeStudent.id}`}
                  initial={{ opacity: 0, y: 14, scale: 0.995, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -14, scale: 0.995, filter: "blur(4px)" }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full"
                >
                  <StudentPortal
                    estudante={activeStudent}
                    branding={branding}
                    comunicados={comunicados}
                    activeTab={studentActiveTab}
                    onSelectTab={(tab) => setStudentActiveTab(tab as any)}
                    onBackToParents={() => {
                      triggerMagicalTransition(() => setUserRole("pais"));
                      setToast({ message: "Retornado ao Portal da Família!", type: "info" });
                    }}
                    onGoToLanding={() => {
                      triggerMagicalTransition(() => {
                        setUserRole("landing");
                        setLandingSubView("site");
                      });
                    }}
                    onToast={(msg, type) => setToast({ message: msg, type })}
                    onUpdateStudentPhoto={handleUpdateStudentPhoto}
                    locale={locale}
                    onSelectLocale={handleSetLocale}
                    themePreference={themePreference}
                    onSelectThemePreference={handleSetThemePreference}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Highly Professional Multi-Column Institutional Footer */}
            <div className="mt-12 -mx-4 sm:-mx-6 lg:-mx-8">
              <InstitutionalFooter
                schoolName={branding.schoolName}
                primaryColor={branding.primaryColor}
                onNavigateToExternal={() => {
                  changeUserRoleWithMagic("landing");
                  setToast({
                    message: "Página institucional da escola aberta.",
                    type: "info"
                  });
                }}
                onNavigateToDemo={(role) => {
                  setUserRole(role);
                  setToast({
                    message: `Portal ${role === "escola" ? "do Gestor" : role === "pais" ? "da Família" : "do Aluno"} carregado.`,
                    type: "info"
                  });
                }}
              />
            </div>
          </main>

          {/* GLOBAL MODALS */}
          <BillingInvoiceModal
            billingDetail={billingDetail}
            onClose={() => setBillingDetail(null)}
            onSimulatePayment={(cobId) => {
              setCobrancas(prev => prev.map(c => c.id === cobId ? { ...c, status: "pago" } : c));
              if (billingDetail?.id === cobId) {
                setBillingDetail({ ...billingDetail, status: "pago" });
              }
              setToast({
                message: "Pagamento simulado e confirmado via Pix com sucesso!",
                type: "success"
              });
            }}
          />

          <CreateAnnouncementModal
            isOpen={isCreateAnnouncementOpen}
            onClose={() => setIsCreateAnnouncementOpen(false)}
            onCreate={(newAnn) => {
              const fullAnn: Comunicado = {
                id: `com-${Date.now()}`,
                title: newAnn.title,
                previewText: newAnn.content.slice(0, 80) + "...",
                content: newAnn.content,
                category: newAnn.category,
                date: new Date().toLocaleDateString("pt-BR"),
                authorName: "Coordenação Pedagógica",
                seenByParent: []
              };
              setComunicados([fullAnn, ...comunicados]);
              setToast({
                message: "Comunicado publicado com sucesso para todas as famílias!",
                type: "success"
              });
              setIsCreateAnnouncementOpen(false);
            }}
            primaryColor={branding.primaryColor}
          />

          {/* QR CODE SCANNER & DIGITAL PASS MODAL WITH FRAMER MOTION ENTRANCE */}
          <QrCodeScannerModal
            isOpen={qrCodeModalOpen}
            onClose={() => setQrCodeModalOpen(false)}
            estudantes={estudantes}
            selectedStudentId={selectedStudentId}
            branding={branding}
            parentQrStatus={parentQrStatus}
            successfulScansCount={successfulScansCount}
            continuousScanning={continuousScanning}
            setContinuousScanning={setContinuousScanning}
            onStudentCheckIn={(studName) => {
              setParentQrStatus("pronto");
              setSuccessfulScansCount(prev => prev + 1);
              const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              setLastSuccessfulScan({
                studentName: studName,
                time: timeStr
              });
              triggerGoldenConfettiForPortaria("btn-parent-qrcode");
              setToast({
                message: `✅ Check-in validado com sucesso para ${studName}!`,
                type: "success"
              });
            }}
            qrSoundType={qrSoundType}
            onToast={(msg, type) => setToast({ message: msg, type })}
          />

          {/* ⚡ Configuração de Disparo Automático WhatsApp de Faturas (Régua ERP 1 a 30 dias) */}
          {isInvoiceReminderModalOpen && (
            <InvoiceWhatsAppReminderModal
              isOpen={isInvoiceReminderModalOpen}
              onClose={() => setIsInvoiceReminderModalOpen(false)}
              selectedInvoice={selectedInvoiceForReminder}
              allInvoices={cobrancas}
              students={estudantes}
              defaultDaysBefore={5}
              initialRuleContext="5_day_pre_due"
              onToast={(msg, type) => setToast({ message: msg, type })}
              onSaveRule={(invoiceId, daysBefore, time, messageTemplate, frequency, intervalDays) => {
                setQuickReminderDaysBefore(daysBefore);
                setQuickReminderDaysRaw(String(daysBefore));
                setQuickReminderTime(time);
                setQuickAutoReminderEnabled(true);
                localStorage.setItem("erp_auto_reminder_days_before", String(daysBefore));
                localStorage.setItem("erp_auto_reminder_time", time);
                localStorage.setItem("erp_auto_reminder_5d_enabled", "true");
                if (frequency) {
                  localStorage.setItem("erp_auto_reminder_frequency", frequency);
                }
                if (intervalDays) {
                  localStorage.setItem("erp_auto_reminder_interval_days", String(intervalDays));
                }
                setToast({
                  message: `✨ Regra de lembrete automático configurada para ${daysBefore} dias antes do vencimento às ${time}h!`,
                  type: "success"
                });
              }}
              onSimulateSend={(invoice, message, phone) => {
                setToast({
                  message: `📲 Lembrete WhatsApp enviado para ${phone} referente a ${invoice.title}!`,
                  type: "success"
                });
              }}
            />
          )}

          {isGlobalSearchOpen && (
            <GlobalSearchModal
              isOpen={isGlobalSearchOpen}
              onClose={() => setIsGlobalSearchOpen(false)}
              comunicados={comunicados}
              estudantes={estudantes}
              cobrancas={cobrancas}
              eventos={eventos}
              portfolioPhotos={classroomPhotos}
              onSelectResult={handleGlobalSearchResultSelect}
            />
          )}

          {/* 🏰 JOGO DE AVENTURA TEXTUAL COM SISTEMA DE VIDA & PERIGOS */}
          <AnimatePresence>
            {isTextAdventureModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="w-full max-w-4xl my-auto"
                >
                  <TextAdventureGame
                    onClose={() => setIsTextAdventureModalOpen(false)}
                    onToast={(msg, type) => setToast({ message: msg, type })}
                    playerName={estudantes.find(e => e.id === selectedStudentId)?.name || "Explorador(a)"}
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <DeletePhotoConfirmationModal
            photo={photoToDelete}
            isOpen={!!photoToDelete}
            onClose={() => setPhotoToDelete(null)}
            onConfirm={() => {
              if (photoToDelete) {
                setClassroomPhotos(prev => prev.filter(p => p.id !== photoToDelete.id));
                setPhotoToDelete(null);
                setToast({
                  message: "Foto removida do portfólio.",
                  type: "info"
                });
              }
            }}
          />

          <AlertsConfigurationModal
            isOpen={alertConfigOpen}
            onClose={() => setAlertConfigOpen(false)}
            alertsEnabled={alertsEnabled}
            alertReadThreshold={alertReadThreshold}
            alertEngagementThreshold={alertEngagementThreshold}
            crmWaReminderDays={crmWaReminderDays}
            onSave={(settings) => {
              setAlertsEnabled(settings.alertsEnabled);
              setAlertReadThreshold(settings.alertReadThreshold);
              setAlertEngagementThreshold(settings.alertEngagementThreshold);
              setCrmWaReminderDays(settings.crmWaReminderDays);
              setAlertConfigOpen(false);
              setToast({
                message: "Configurações de alerta atualizadas!",
                type: "success"
              });
            }}
          />

          <LtvMasteryConfigModal
            isOpen={isRetentionMasteryConfigOpen}
            onClose={() => setIsRetentionMasteryConfigOpen(false)}
            estudantes={estudantes}
            onSave={(ltv, engagement) => {
              setRetentionMasteryThresholds(ltv as any);
              setToast({
                message: "Thresholds de LTV Mastery e Engajamento do CRM salvos com sucesso!",
                type: "success"
              });
            }}
            onToast={(t) => setToast(t)}
            zIndex={activeModalFocus === "ltv_config" ? 95 : 60}
            onSwitchToFinancial={() => {
              setActiveModalFocus("financial_report");
              setIsMonthlyReportModalOpen(true);
            }}
          />

          {/* MOBILE STICKY BOTTOM NAVIGATION BAR */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 md:hidden px-3 py-1.5 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))] shadow-lg select-none">
            <div className="flex items-center justify-around max-w-md mx-auto">
              {userRole === "pais" ? (
                <>
                  <button
                    type="button"
                    onClick={() => changeActiveTabWithMagic("dashboard")}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      activeTab === "dashboard"
                        ? "text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/70 dark:bg-blue-950/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                    aria-label="Ir para o Início"
                  >
                    <LayoutDashboard className="w-4 h-4 mb-0.5" />
                    <span>Início</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => changeActiveTabWithMagic("diaadia")}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      activeTab === "diaadia"
                        ? "text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/70 dark:bg-blue-950/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                    aria-label="Ir para o Diário"
                  >
                    <Calendar className="w-4 h-4 mb-0.5" />
                    <span>Diário</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => changeActiveTabWithMagic("comunicados")}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer relative ${
                      activeTab === "comunicados"
                        ? "text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/70 dark:bg-blue-950/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                    aria-label="Ir para Avisos"
                  >
                    <Bell className="w-4 h-4 mb-0.5" />
                    <span>Avisos</span>
                    {comunicados.filter(c => !c.seenByParent?.includes("parent-1")).length > 0 && (
                      <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => changeActiveTabWithMagic("cobrancas")}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      activeTab === "cobrancas"
                        ? "text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/70 dark:bg-blue-950/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                    aria-label="Ir para Financeiro"
                  >
                    <DollarSign className="w-4 h-4 mb-0.5" />
                    <span>Pix</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 cursor-pointer"
                    aria-label="Abrir Menu Lateral"
                  >
                    <Menu className="w-4 h-4 mb-0.5" />
                    <span>Menu</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => changeSchoolActiveTabWithMagic("dashboard")}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      schoolActiveTab === "dashboard"
                        ? "text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/70 dark:bg-blue-950/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                    aria-label="Ir para Painel Geral"
                  >
                    <LayoutDashboard className="w-4 h-4 mb-0.5" />
                    <span>Painel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => changeSchoolActiveTabWithMagic("agenda")}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      schoolActiveTab === "agenda"
                        ? "text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/70 dark:bg-blue-950/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                    aria-label="Ir para Turmas"
                  >
                    <Calendar className="w-4 h-4 mb-0.5" />
                    <span>Turmas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => changeSchoolActiveTabWithMagic("retiradas")}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      schoolActiveTab === "retiradas"
                        ? "text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/70 dark:bg-blue-950/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                    aria-label="Ir para Portaria"
                  >
                    <Car className="w-4 h-4 mb-0.5" />
                    <span>Portaria</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => changeSchoolActiveTabWithMagic("alunos")}
                    className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      schoolActiveTab === "alunos"
                        ? "text-blue-600 dark:text-blue-400 font-extrabold bg-blue-50/70 dark:bg-blue-950/50"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                    }`}
                    aria-label="Ir para Gestão de Alunos"
                  >
                    <Users className="w-4 h-4 mb-0.5" />
                    <span>CRM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 cursor-pointer"
                    aria-label="Abrir Menu Lateral"
                  >
                    <Menu className="w-4 h-4 mb-0.5" />
                    <span>Menu</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </>
      )}

      {/* Comprehensive Help Center & Interactive Tutorials */}
      <HelpCenterModal
        isOpen={isHelpCenterOpen}
        onClose={() => setIsHelpCenterOpen(false)}
        userRole={userRole}
        initialTab={helpCenterInitialTab}
        initialSearchQuery={helpCenterSearchQuery}
        onNavigateToTab={(tab) => {
          if (userRole === "escola") {
            const validSchoolTabs: Record<string, "retiradas" | "alunos" | "erp" | "comunicados" | "agenda" | "metricas" | "perfil" | "dashboard" | "premium_hub" | "planejador" | "benchmarking"> = {
              acesso: "retiradas",
              retiradas: "retiradas",
              alunos: "alunos",
              erp: "erp",
              comunicados: "comunicados",
              agenda: "agenda",
              diaadia: "agenda",
              metricas: "metricas",
              perfil: "perfil",
              dashboard: "dashboard",
              planejador: "planejador",
              benchmarking: "benchmarking"
            };
            const targetSchoolTab = validSchoolTabs[tab] || "dashboard";
            changeSchoolActiveTabWithMagic(targetSchoolTab);
          } else {
            const validParentTabs: Record<string, "cobrancas" | "acesso" | "academico" | "diaadia" | "comunicados" | "perfil" | "dashboard" | "premium_hub"> = {
              cobrancas: "cobrancas",
              acesso: "acesso",
              academico: "academico",
              diaadia: "diaadia",
              comunicados: "comunicados",
              perfil: "perfil",
              dashboard: "dashboard",
              premium_hub: "premium_hub"
            };
            const targetParentTab = validParentTabs[tab] || "dashboard";
            changeActiveTabWithMagic(targetParentTab);
          }
        }}
        onStartGuidedTour={() => setIsTourOpen(true)}
      />

      {/* Guided Tour for New & Returning Users */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => changeActiveTabWithMagic(tab)}
        activeTab={activeTab}
        onOpenHelpCenter={() => {
          setHelpCenterInitialTab("features");
          setHelpCenterSearchQuery("");
          setIsHelpCenterOpen(true);
        }}
        locale={locale}
        themePreference={themePreference}
        onSelectTheme={handleSetThemePreference}
        schoolName={branding.schoolName}
      />

      {/* Content Reporting Modal */}
      <ReportContentModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportTarget(null);
        }}
        target={reportTarget}
        onSubmitReport={handleSubmitReport}
        currentUser={{
          uid: userProfile?.uid || "user-demo",
          displayName: userProfile?.displayName || (activeStudent ? `Família de ${activeStudent.name}` : "Responsável"),
          role: userRole as any
        }}
        onToast={(msg, type) => setToast({ message: msg, type })}
      />

      {/* Global Consolidated Monthly Financial Report Modal */}
      <MonthlyFinancialReportModal
        isOpen={isMonthlyReportModalOpen}
        onClose={() => setIsMonthlyReportModalOpen(false)}
        cobrancas={cobrancas}
        branding={branding}
        studentName={estudantes.find(e => e.id === selectedStudentId)?.name || "Nicolas Nogueira"}
        studentGrade={estudantes.find(e => e.id === selectedStudentId)?.grade || "3º Ano B - Ensino Fundamental"}
        responsibleName={userProfile?.displayName || "Mariana Silva Nogueira"}
        onToast={(msg, type) => setToast({ message: msg, type: type === "warning" ? "info" : type })}
        zIndex={activeModalFocus === "financial_report" ? 80 : 70}
        onSwitchToLtv={() => {
          setActiveModalFocus("ltv_config");
          setIsRetentionMasteryConfigOpen(true);
        }}
      />

      {/* OS-Style Floating Push Notification Toast */}
      <PushNotificationToast
        notification={activePushBanner}
        onClose={() => setActivePushBanner(null)}
        onNavigateToTab={(targetTab) => {
          if (userRole === "pais") {
            changeActiveTabWithMagic(targetTab);
          } else if (userRole === "escola") {
            setSchoolActiveTab(targetTab === "comunicados" ? "comunicados" : "dashboard");
          }
        }}
        onOpenPreferences={() => setIsPushPreferencesOpen(true)}
      />

      {/* Push Notification Preferences & Key Events Modal */}
      <NotificationPreferencesModal
        isOpen={isPushPreferencesOpen}
        onClose={() => setIsPushPreferencesOpen(false)}
        onNotificationTriggered={(item) => setActivePushBanner(item)}
      />

      {/* 6. RESPONSIVE MOBILE BOTTOM NAVIGATION BAR (md:hidden) */}
      {(userRole === "pais" || userRole === "escola" || userRole === "aluno") && (
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xl px-2 py-1.5 flex items-center justify-around safe-bottom"
          aria-label="Navegação Principal Mobile"
        >
          {userRole === "pais" && (
            <>
              <button
                type="button"
                onClick={() => changeActiveTabWithMagic("dashboard")}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  activeTab === "dashboard"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mb-0.5" />
                <span>Painel</span>
              </button>

              <button
                type="button"
                onClick={() => changeActiveTabWithMagic("diaadia")}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  activeTab === "diaadia"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4 mb-0.5" />
                <span>Diário</span>
              </button>

              <button
                type="button"
                onClick={() => changeActiveTabWithMagic("academico")}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  activeTab === "academico"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4 mb-0.5" />
                <span>Boletim</span>
              </button>

              <button
                type="button"
                onClick={() => changeActiveTabWithMagic("comunicados")}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none relative ${
                  activeTab === "comunicados"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Bell className="w-4 h-4 mb-0.5" />
                <span>Avisos</span>
                {comunicados.filter(c => !c.seenByParent?.includes("parent-1")).length > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => changeActiveTabWithMagic("cobrancas")}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none relative ${
                  activeTab === "cobrancas"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <DollarSign className="w-4 h-4 mb-0.5" />
                <span>Finanças</span>
                {cobrancas.filter(c => c.status === "pendente" || c.status === "atrasado").length > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            </>
          )}

          {userRole === "escola" && (
            <>
              <button
                type="button"
                onClick={() => changeSchoolActiveTabWithMagic("dashboard")}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  schoolActiveTab === "dashboard"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mb-0.5" />
                <span>Painel</span>
              </button>

              <button
                type="button"
                onClick={() => changeSchoolActiveTabWithMagic("agenda")}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  schoolActiveTab === "agenda"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4 mb-0.5" />
                <span>Turmas</span>
              </button>

              <button
                type="button"
                onClick={() => changeSchoolActiveTabWithMagic("retiradas")}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  schoolActiveTab === "retiradas"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Car className="w-4 h-4 mb-0.5" />
                <span>Portaria</span>
              </button>

              <button
                type="button"
                onClick={() => changeSchoolActiveTabWithMagic("comunicados")}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  schoolActiveTab === "comunicados"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BellRing className="w-4 h-4 mb-0.5" />
                <span>Avisos</span>
              </button>

              <button
                type="button"
                onClick={() => changeSchoolActiveTabWithMagic("alunos")}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  schoolActiveTab === "alunos"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Users className="w-4 h-4 mb-0.5" />
                <span>CRM</span>
              </button>
            </>
          )}

          {userRole === "aluno" && (
            <>
              <button
                type="button"
                onClick={() => setStudentActiveTab("simplificada")}
                className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  studentActiveTab === "simplificada" || studentActiveTab === "dashboard"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mb-0.5" />
                <span>Lições</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentActiveTab("horarios")}
                className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  studentActiveTab === "horarios"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Clock className="w-4 h-4 mb-0.5" />
                <span>Horários</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentActiveTab("conquistas")}
                className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  studentActiveTab === "conquistas"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Award className="w-4 h-4 mb-0.5" />
                <span>Conquistas</span>
              </button>

              <button
                type="button"
                onClick={() => setStudentActiveTab("completa")}
                className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-bold transition-colors cursor-pointer select-none ${
                  studentActiveTab === "completa"
                    ? "text-amber-600 dark:text-amber-400 font-extrabold"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                <Sparkles className="w-4 h-4 mb-0.5" />
                <span>Geral</span>
              </button>
            </>
          )}
        </nav>
      )}

    </div>
  );
}

export default App;
