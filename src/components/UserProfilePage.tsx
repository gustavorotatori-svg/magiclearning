import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User,
  AtSign,
  Mail,
  Phone,
  FileText,
  Camera,
  Check,
  Sparkles,
  ShieldCheck,
  Lock,
  Bell,
  Moon,
  Sun,
  Palette,
  LogOut,
  Save,
  Copy,
  ExternalLink,
  GraduationCap,
  Apple,
  Calendar,
  DollarSign,
  Send,
  AlertTriangle,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  Users,
  Key,
  Clock,
  Search,
  Filter,
  Laptop,
  Smartphone,
  Trash2,
  Shield,
  Eye,
  Settings,
  HelpCircle,
  ArrowUpRight,
  SlidersHorizontal,
  Globe,
  Radio,
  Car,
  Trophy,
  Award,
  Flame,
  UploadCloud,
  Image as ImageIcon,
  Star,
  Medal,
  CheckSquare
} from "lucide-react";
import StudentPhotoCameraModal from "./StudentPhotoCameraModal";
import { UserProfile, UserPreferences, Estudante, UserActivityItem } from "../types";
import { doc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import { AchievementsWidget } from "./AchievementsWidget";
import { ThemeSelector } from "./ThemeSelector";
import { LanguageSelector } from "./LanguageSelector";
import { ThemePreference } from "../utils/themeManager";
import { SupportedLocale } from "../utils/i18n";

interface UserProfilePageProps {
  userProfile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
  onLogout?: () => void;
  userRole?: "pais" | "escola" | "aluno";
  students?: Estudante[];
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  initialSection?: "info" | "achievements" | "activity" | "settings" | "security" | "students";
  onUpdateStudentPhoto?: (studentId: string, photoUrl: string) => void;
  themePreference?: ThemePreference;
  onSelectThemePreference?: (pref: ThemePreference) => void;
  locale?: SupportedLocale;
  onLocaleChanged?: (loc: SupportedLocale) => void;
  onOpenPushPreferences?: () => void;
}

const AVATAR_PRESETS = [
  { id: "1", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250", label: "Alegre", category: "Padrão" },
  { id: "2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250", label: "Determinado", category: "Padrão" },
  { id: "3", url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250", label: "Sorridente", category: "Padrão" },
  { id: "4", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250", label: "Moderno", category: "Padrão" },
  { id: "5", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250", label: "Inspirada", category: "Executivo" },
  { id: "6", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250", label: "Focada", category: "Executivo" },
  { id: "7", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250", label: "Clássico", category: "Executivo" },
  { id: "8", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250", label: "Líder", category: "Executivo" },
];

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  category: "Geral" | "Rotina & Portaria" | "Acadêmico" | "Tecnologia & Maker" | "Cidadania Escolar";
  points: number;
  iconName: "star" | "sparkles" | "trophy" | "award" | "shield" | "file" | "medal" | "check";
  unlockedByDefaultDate?: string;
}

const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: "badge-1",
    title: "Início da Jornada",
    description: "Primeiro acesso e verificação de perfil concluídos no portal educacional.",
    category: "Geral",
    points: 40,
    iconName: "star",
    unlockedByDefaultDate: "12 de Fevereiro de 2026",
  },
  {
    id: "badge-2",
    title: "Comunicação Familiar Ativa",
    description: "Leitura pontual de comunicados escolares e engajamento com murais pedagógicos.",
    category: "Cidadania Escolar",
    points: 50,
    iconName: "check",
    unlockedByDefaultDate: "18 de Fevereiro de 2026",
  },
  {
    id: "quest-1",
    title: "Robótica & Lógica Maker",
    description: "Conclusão com louvor da atividade prática de programação e raciocínio computacional.",
    category: "Tecnologia & Maker",
    points: 60,
    iconName: "sparkles",
    unlockedByDefaultDate: "25 de Fevereiro de 2026",
  },
  {
    id: "quest-2",
    title: "Laboratório de Ciências",
    description: "Participação ativa no experimento de botânica e registro em diário investigativo.",
    category: "Acadêmico",
    points: 90,
    iconName: "award",
    unlockedByDefaultDate: "02 de Março de 2026",
  },
  {
    id: "badge-portaria",
    title: "Portaria Segura & QR Code",
    description: "Emissão de crachá digital de portaria com confirmação de saída responsável.",
    category: "Rotina & Portaria",
    points: 45,
    iconName: "shield",
    unlockedByDefaultDate: "05 de Março de 2026",
  },
  {
    id: "badge-leitura",
    title: "Leitura Crítica & Literatura",
    description: "Finalização do livro do bimestre e entrega do roteiro de debate literário.",
    category: "Acadêmico",
    points: 70,
    iconName: "file",
  },
  {
    id: "badge-presenca",
    title: "Presença Nota 10",
    description: "Frequência escolar superior a 95% sem atrasos na portaria durante o ciclo.",
    category: "Rotina & Portaria",
    points: 80,
    iconName: "medal",
  },
  {
    id: "badge-curiosidade",
    title: "Mente Curiosa & Exploração",
    description: "Pesquisa autônoma e exploração de conteúdos complementares na biblioteca virtual.",
    category: "Tecnologia & Maker",
    points: 55,
    iconName: "trophy",
  }
];

const DEFAULT_INITIAL_ACTIVITIES: UserActivityItem[] = [
  {
    id: "act-1",
    title: "Login de Autenticação Realizado",
    description: "Sessão iniciada via autenticação segura com credenciais verificadas.",
    timestamp: Date.now() - 1000 * 60 * 15,
    dateFormatted: "Hoje às 12:15",
    category: "auth",
    status: "success",
    deviceInfo: "Chrome 128 • macOS",
    ipAddress: "189.40.122.84"
  },
  {
    id: "act-2",
    title: "Confirmação de Leitura de Diário",
    description: "Visualizou o diário de bordo e registro alimentar de Nicolas Nogueira.",
    timestamp: Date.now() - 1000 * 60 * 60 * 3,
    dateFormatted: "Hoje às 09:30",
    category: "academic",
    status: "info",
    deviceInfo: "App Mobile • iOS 17.5",
    ipAddress: "189.40.122.84"
  },
  {
    id: "act-3",
    title: "QR Code de Retirada Portaria Gerado",
    description: "Emissão de autorização temporária de saída para a portaria escolar.",
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    dateFormatted: "Ontem às 16:45",
    category: "portaria",
    status: "success",
    deviceInfo: "App Mobile • iOS 17.5",
    ipAddress: "189.40.122.84"
  },
  {
    id: "act-4",
    title: "Consulta de Fatura e Boleto PIX",
    description: "Acessou os detalhes da mensalidade FAT-2026-9921 com vencimento em 10/08.",
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    dateFormatted: "25 de Agosto, 14:10",
    category: "financial",
    status: "neutral",
    deviceInfo: "Chrome 128 • macOS",
    ipAddress: "177.18.230.12"
  },
  {
    id: "act-5",
    title: "Preferências de Notificação Atualizadas",
    description: "Ativou alertas WhatsApp proativos para avisos financeiros e de portaria.",
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    dateFormatted: "24 de Agosto, 10:05",
    category: "settings",
    status: "info",
    deviceInfo: "Chrome 128 • macOS",
    ipAddress: "177.18.230.12"
  },
  {
    id: "act-6",
    title: "Leitura de Comunicado Institucional",
    description: "Confirmou leitura do informativo 'Cronograma da Festa da Família 2026'.",
    timestamp: Date.now() - 1000 * 60 * 60 * 96,
    dateFormatted: "23 de Agosto, 18:20",
    category: "communication",
    status: "success",
    deviceInfo: "App Mobile • iOS 17.5",
    ipAddress: "189.40.122.84"
  },
  {
    id: "act-7",
    title: "Verificação de Segurança da Conta",
    description: "Sessão validada e chave de criptografia de ponta a ponta renovada.",
    timestamp: Date.now() - 1000 * 60 * 60 * 120,
    dateFormatted: "22 de Agosto, 08:00",
    category: "security",
    status: "success",
    deviceInfo: "Sistema • Gateway Escolar",
    ipAddress: "10.0.4.12"
  }
];

export default function UserProfilePage({
  userProfile,
  onProfileUpdated,
  onShowToast,
  onLogout,
  userRole = "pais",
  students = [],
  isDarkMode = false,
  onToggleDarkMode,
  initialSection = "info",
  onUpdateStudentPhoto,
  themePreference = "system",
  onSelectThemePreference,
  locale = "pt",
  onLocaleChanged,
}: UserProfilePageProps) {
  // Local state for taking student photo via camera
  const [studentForCamera, setStudentForCamera] = useState<Estudante | null>(null);

  // Local state for basic profile fields
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [username, setUsername] = useState(userProfile?.username || "");
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [phone, setPhone] = useState(userProfile?.preferences?.phone || "");
  const [relationshipRole, setRelationshipRole] = useState(userProfile?.preferences?.relationshipRole || (userRole === "escola" ? "Gestor Escolar" : "Mãe / Responsável Legal"));
  
  // Notification Channels & Toggles
  const [notifyMeals, setNotifyMeals] = useState(userProfile?.preferences?.notifyMeals ?? true);
  const [notifyGrades, setNotifyGrades] = useState(userProfile?.preferences?.notifyGrades ?? true);
  const [notifyEvents, setNotifyEvents] = useState(userProfile?.preferences?.notifyEvents ?? true);
  const [notifyFinancial, setNotifyFinancial] = useState(userProfile?.preferences?.notifyFinancial ?? true);
  const [notifyPortaria, setNotifyPortaria] = useState(userProfile?.preferences?.notifyPortaria ?? true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(userProfile?.preferences?.notifyWhatsApp ?? true);
  const [notifyEmailDaily, setNotifyEmailDaily] = useState(userProfile?.preferences?.notifyEmailDaily ?? true);
  const [notifySmsEmergency, setNotifySmsEmergency] = useState(userProfile?.preferences?.notifySmsEmergency ?? false);
  const [notifyNewMessages, setNotifyNewMessages] = useState(userProfile?.preferences?.notifyNewMessages ?? true);
  const [notifyDeadlines, setNotifyDeadlines] = useState(userProfile?.preferences?.notifyDeadlines ?? true);
  const [notifyPromotions, setNotifyPromotions] = useState(userProfile?.preferences?.notifyPromotions ?? true);
  const [notifyPushBrowser, setNotifyPushBrowser] = useState(userProfile?.preferences?.notifyPushBrowser ?? true);

  // Security & App Settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(userProfile?.preferences?.twoFactorEnabled ?? false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(userProfile?.preferences?.quietHoursEnabled ?? false);
  const [quietHoursStart, setQuietHoursStart] = useState(userProfile?.preferences?.quietHoursStart || "22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState(userProfile?.preferences?.quietHoursEnd || "07:00");
  const [language, setLanguage] = useState<"pt-BR" | "en" | "es">(userProfile?.preferences?.language || "pt-BR");
  const [uiDensity, setUiDensity] = useState<"comfortable" | "compact">(userProfile?.preferences?.uiDensity || "comfortable");
  const [themeColor, setThemeColor] = useState<"default" | "royal" | "emerald" | "amber">(
    userProfile?.preferences?.themeColor || "default"
  );
  
  // Activity History State
  const [activityList, setActivityList] = useState<UserActivityItem[]>(() => {
    const saved = localStorage.getItem("magiclearning_user_activities");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return userProfile?.activityHistory && userProfile.activityHistory.length > 0
      ? userProfile.activityHistory
      : DEFAULT_INITIAL_ACTIVITIES;
  });

  const [activitySearchQuery, setActivitySearchQuery] = useState("");
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>("all");

  // UI Tabs
  const [activeSection, setActiveSection] = useState<"info" | "achievements" | "activity" | "settings" | "security" | "students">(
    initialSection || "info"
  );

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);
  const [avatarTab, setAvatarTab] = useState<"upload" | "presets" | "custom">("upload");
  const [isSaving, setIsSaving] = useState(false);
  const [hasCopiedUsername, setHasCopiedUsername] = useState(false);

  // Achievements & Sparks
  const [magicCoins, setMagicCoins] = useState<number>(userProfile?.magicCoins ?? 240);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(
    userProfile?.unlockedBadgeIds ?? ["badge-1", "badge-2", "quest-1", "quest-2"]
  );
  const [badgeFilterCategory, setBadgeFilterCategory] = useState<string>("all");
  const [simulatedQuestSuccess, setSimulatedQuestSuccess] = useState(false);

  // File Upload Handling
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onShowToast("Selecione um arquivo de imagem válido (PNG, JPG, WEBP, GIF).", "error");
      return;
    }
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new (window as any).Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_DIM = 256;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
            setPhotoURL(dataUrl);
            onShowToast("Foto de perfil carregada! Clique em 'Salvar' para gravar no seu perfil.", "success");
            logActivity(
              "Foto de Perfil Atualizada",
              "Nova foto de perfil carregada via upload local.",
              "settings",
              "info"
            );
          }
        } catch (err) {
          console.error("Erro ao processar imagem:", err);
          onShowToast("Não foi possível otimizar a imagem selecionada.", "error");
        } finally {
          setIsProcessingImage(false);
        }
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        onShowToast("Falha ao abrir o arquivo de imagem.", "error");
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
      onShowToast("Falha ao carregar o arquivo.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    e.target.value = "";
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleRemovePhoto = () => {
    setPhotoURL("");
    onShowToast("Foto de perfil removida. As iniciais do seu nome serão exibidas.", "info");
    logActivity(
      "Foto de Perfil Removida",
      "Foto de perfil redefinida para avatar monograma padrão.",
      "settings",
      "neutral"
    );
  };

  const handleToggleBadgeUnlock = (badgeId: string) => {
    const isUnlocked = unlockedBadges.includes(badgeId);
    const badgeDef = BADGE_CATALOG.find((b) => b.id === badgeId);
    if (isUnlocked) {
      const updated = unlockedBadges.filter((id) => id !== badgeId);
      setUnlockedBadges(updated);
      setMagicCoins((prev) => Math.max(0, prev - (badgeDef?.points || 30)));
      onShowToast(`Selo "${badgeDef?.title || badgeId}" bloqueado.`, "info");
    } else {
      const updated = [...unlockedBadges, badgeId];
      setUnlockedBadges(updated);
      const addedPoints = badgeDef?.points || 40;
      setMagicCoins((prev) => prev + addedPoints);
      onShowToast(`Parabéns! Selo "${badgeDef?.title || badgeId}" conquistado! (+${addedPoints} Sparks) 🌟`, "success");
      logActivity(
        `Conquista Desbloqueada: ${badgeDef?.title || badgeId}`,
        `O estudante alcançou o marco "${badgeDef?.title}" acumulando mais ${addedPoints} Sparks formativos.`,
        "academic",
        "success"
      );
    }
  };

  const handleSimulateNewQuest = () => {
    const locked = BADGE_CATALOG.filter((b) => !unlockedBadges.includes(b.id));
    if (locked.length > 0) {
      const next = locked[0];
      handleToggleBadgeUnlock(next.id);
      setSimulatedQuestSuccess(true);
      setTimeout(() => setSimulatedQuestSuccess(false), 2500);
    } else {
      setMagicCoins((prev) => prev + 50);
      onShowToast("Todas as insígnias do ciclo já foram conquistadas! +50 Sparks de maestria concedidos! 🏆", "success");
      logActivity(
        "Sparks de Maestria Concedidos",
        "Bônus de 50 Sparks formativos adicionados ao saldo de mérito do estudante.",
        "academic",
        "success"
      );
    }
  };

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || "");
      setUsername(userProfile.username || "");
      setPhotoURL(userProfile.photoURL || "");
      setBio(userProfile.bio || "");
      if (userProfile.magicCoins !== undefined) setMagicCoins(userProfile.magicCoins);
      if (userProfile.unlockedBadgeIds) setUnlockedBadges(userProfile.unlockedBadgeIds);
      setPhone(userProfile.preferences?.phone || "");
      setRelationshipRole(userProfile.preferences?.relationshipRole || (userRole === "escola" ? "Gestor Escolar" : "Mãe / Responsável Legal"));
      setNotifyMeals(userProfile.preferences?.notifyMeals ?? true);
      setNotifyGrades(userProfile.preferences?.notifyGrades ?? true);
      setNotifyEvents(userProfile.preferences?.notifyEvents ?? true);
      setNotifyFinancial(userProfile.preferences?.notifyFinancial ?? true);
      setNotifyPortaria(userProfile.preferences?.notifyPortaria ?? true);
      setNotifyWhatsApp(userProfile.preferences?.notifyWhatsApp ?? true);
      setNotifyEmailDaily(userProfile.preferences?.notifyEmailDaily ?? true);
      setNotifySmsEmergency(userProfile.preferences?.notifySmsEmergency ?? false);
      setTwoFactorEnabled(userProfile.preferences?.twoFactorEnabled ?? false);
      setQuietHoursEnabled(userProfile.preferences?.quietHoursEnabled ?? false);
      setQuietHoursStart(userProfile.preferences?.quietHoursStart || "22:00");
      setQuietHoursEnd(userProfile.preferences?.quietHoursEnd || "07:00");
      setLanguage(userProfile.preferences?.language || "pt-BR");
      setUiDensity(userProfile.preferences?.uiDensity || "comfortable");
      setThemeColor(userProfile.preferences?.themeColor || "default");
    }
  }, [userProfile, userRole]);

  // Log activity helper
  const logActivity = (title: string, description: string, category: UserActivityItem["category"], status: UserActivityItem["status"] = "info") => {
    const newAct: UserActivityItem = {
      id: `act-${Date.now()}`,
      title,
      description,
      timestamp: Date.now(),
      dateFormatted: "Agora mesmo",
      category,
      status,
      deviceInfo: "Navegador Web • Sessão Ativa",
      ipAddress: "Sessão Atual"
    };
    const updated = [newAct, ...activityList].slice(0, 50);
    setActivityList(updated);
    localStorage.setItem("magiclearning_user_activities", JSON.stringify(updated));
  };

  const sanitizedUsername = username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "");

  const handleCopyUsername = () => {
    const handle = sanitizedUsername ? `@${sanitizedUsername}` : userProfile?.email || "usuario";
    navigator.clipboard.writeText(handle);
    setHasCopiedUsername(true);
    onShowToast(`Nome de usuário ${handle} copiado para a área de transferência!`, "info");
    setTimeout(() => setHasCopiedUsername(false), 2000);
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userProfile) return;

    if (!displayName.trim()) {
      onShowToast("O nome de exibição não pode ficar em branco.", "error");
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, "users", userProfile.uid);
      const updatedPreferences: UserPreferences = {
        studentName: userProfile.preferences?.studentName || "Nicolas Nogueira",
        studentGrade: userProfile.preferences?.studentGrade || "3º Ano B",
        themeColor,
        notificationCategory: userProfile.preferences?.notificationCategory || "todos",
        notifyMeals,
        notifyGrades,
        notifyEvents,
        notifyFinancial,
        notifyPortaria,
        notifyWhatsApp,
        notifyEmailDaily,
        notifySmsEmergency,
        notifyNewMessages,
        notifyDeadlines,
        notifyPromotions,
        notifyPushBrowser,
        twoFactorEnabled,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
        language,
        uiDensity,
        phone: phone.trim(),
        relationshipRole: relationshipRole.trim(),
      };

      const updatedFields = {
        displayName: displayName.trim(),
        username: sanitizedUsername,
        photoURL: photoURL.trim(),
        bio: bio.trim(),
        preferences: updatedPreferences,
        activityHistory: activityList,
        magicCoins,
        unlockedBadgeIds: unlockedBadges
      };

      await setDoc(userRef, updatedFields, { merge: true });

      const updatedProfile: UserProfile = {
        ...userProfile,
        ...updatedFields,
      };

      logActivity(
        "Perfil e Configurações Salvos",
        `Alterações salvas com sucesso para o usuário ${displayName.trim()} (@${sanitizedUsername}).`,
        "settings",
        "success"
      );

      onProfileUpdated(updatedProfile);
      onShowToast("Perfil e configurações atualizados com sucesso na nuvem! ✨", "success");
    } catch (err: any) {
      console.error("Erro ao salvar perfil:", err);
      onShowToast("Houve um erro ao sincronizar o perfil no banco de dados.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!userProfile?.email) {
      onShowToast("Nenhum e-mail vinculado ao perfil para redefinição.", "info");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, userProfile.email);
      logActivity(
        "Solicitação de Redefinição de Senha",
        `Link de troca de senha disparado para o e-mail cadastrado ${userProfile.email}.`,
        "security",
        "warning"
      );
      onShowToast(`Link de redefinição de senha enviado para ${userProfile.email}! Verifique sua caixa de entrada. 🔐`, "success");
    } catch (err: any) {
      console.warn("Password reset attempt error:", err);
      onShowToast(`Instruções de redefinição enviadas para ${userProfile.email}!`, "info");
    }
  };

  const handleExportData = () => {
    const exportPayload = {
      profile: userProfile,
      activities: activityList,
      exportTimestamp: new Date().toISOString(),
      version: "MagicLearning 2026.8"
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `perfil-completo-${sanitizedUsername || "usuario"}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    logActivity("Exportação de Dados Pessoais", "Backup completo exportado no formato JSON.", "settings", "neutral");
    onShowToast("Backup de dados e histórico exportado com sucesso! 📦", "info");
  };

  const handleExportActivityCsv = () => {
    const headers = "ID,Data/Hora,Categoria,Título,Descrição,Status,Dispositivo,IP\n";
    const rows = activityList.map(a => 
      `"${a.id}","${a.dateFormatted || new Date(a.timestamp).toLocaleString()}","${a.category}","${a.title}","${a.description.replace(/"/g, '""')}","${a.status || 'info'}","${a.deviceInfo || ''}","${a.ipAddress || ''}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `historico-atividades-${sanitizedUsername || "usuario"}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    onShowToast("Histórico de atividades exportado em CSV! 📊", "success");
  };

  const handleClearActivityHistory = () => {
    if (window.confirm("Deseja realmente limpar o histórico local de atividades recentes?")) {
      const cleared = [
        {
          id: `act-${Date.now()}`,
          title: "Histórico de Atividades Reiniciado",
          description: "Registros anteriores foram limpos localmente pelo usuário.",
          timestamp: Date.now(),
          dateFormatted: "Agora mesmo",
          category: "security" as const,
          status: "warning" as const,
          deviceInfo: "Sessão Atual",
          ipAddress: "Localhost"
        }
      ];
      setActivityList(cleared);
      localStorage.setItem("magiclearning_user_activities", JSON.stringify(cleared));
      onShowToast("Histórico de atividades reiniciado!", "info");
    }
  };

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activityList.filter(item => {
      const matchesCategory = activityCategoryFilter === "all" || item.category === activityCategoryFilter;
      const q = activitySearchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        (item.deviceInfo && item.deviceInfo.toLowerCase().includes(q)) ||
        (item.dateFormatted && item.dateFormatted.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activityList, activityCategoryFilter, activitySearchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in text-slate-800 dark:text-slate-100 font-sans">
      {/* ========================================================================= */}
      {/* 1. EDITORIAL HEADER & IDENTITY BANNER */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 text-white shadow-xl border border-slate-800">
        {/* Subtle architectural ambient texture */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="p-6 sm:p-8 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with Status Badge */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-white/20 bg-slate-800 shadow-2xl flex items-center justify-center relative">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName || "Perfil"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-12 h-12 text-slate-300" />
              )}
              <div
                onClick={() => setActiveSection("info")}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Alterar foto de perfil"
              >
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-slate-900 shadow-md" title="Conta Verificada e Ativa">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* User Overview Information */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
                {displayName || "Usuário da Plataforma"}
              </h1>
              <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full font-mono">
                {userRole === "escola" ? "Módulo Gestor" : userRole === "aluno" ? "Estudante" : "Portal da Família"}
              </span>
              <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Ativo
              </span>
            </div>

            {/* Username & Email details */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-300 text-xs font-mono">
              <button
                type="button"
                onClick={handleCopyUsername}
                className="inline-flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-xl border border-slate-700/60 transition-all cursor-pointer group"
                title="Clique para copiar seu @username"
              >
                <AtSign className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-slate-100">{sanitizedUsername ? `@${sanitizedUsername}` : "@usuario"}</span>
                {hasCopiedUsername ? (
                  <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 ml-0.5" />
                )}
              </button>

              <span className="flex items-center gap-1.5 text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-xl border border-slate-700/40">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-200">{userProfile?.email || "usuario@escola.com"}</span>
              </span>

              {phone && (
                <span className="flex items-center gap-1.5 text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-xl border border-slate-700/40">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-200">{phone}</span>
                </span>
              )}
            </div>

            {/* Bio summary */}
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed italic pt-1">
              {bio ? `"${bio}"` : "Nenhuma biografia informada. Adicione uma apresentação no formulário abaixo para personalizar seu perfil."}
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-[11px] text-slate-400 border-t border-slate-800/60 mt-2">
              <button
                type="button"
                onClick={() => setActiveSection("achievements")}
                className="flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-pointer"
                title="Ver painel de conquistas e pontos de mérito"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Conquistas: <strong className="text-amber-300 font-mono font-bold">{magicCoins} Sparks</strong></span>
              </button>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Última Atividade: <strong className="text-slate-200 font-mono">Hoje</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Vínculos: <strong className="text-slate-200">{students.length} Estudante(s)</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>2FA: <strong className={twoFactorEnabled ? "text-emerald-400" : "text-slate-400"}>{twoFactorEnabled ? "Habilitado" : "Opcional"}</strong></span>
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={isSaving}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
            </button>
            
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border border-rose-800/40 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sair da Conta</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION SELECTION NAVIGATION BAR */}
        <div className="px-4 sm:px-6 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSection("info")}
            className={`py-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSection === "info"
                ? "border-amber-400 text-amber-300 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Dados do Perfil</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("achievements")}
            className={`py-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSection === "achievements"
                ? "border-amber-400 text-amber-300 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Conquistas & Mérito ({unlockedBadges.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("activity")}
            className={`py-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSection === "activity"
                ? "border-amber-400 text-amber-300 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Histórico de Atividades ({activityList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("settings")}
            className={`py-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSection === "settings"
                ? "border-amber-400 text-amber-300 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações da Conta</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("security")}
            className={`py-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSection === "security"
                ? "border-amber-400 text-amber-300 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Segurança & Sessões</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("students")}
            className={`py-3 px-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSection === "students"
                ? "border-amber-400 text-amber-300 font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Estudantes Vinculados ({students.length})</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. TABBED CONTENT PANELS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xs">
        
        {/* ===================================================================== */}
        {/* TAB 1: EDIT PROFILE DETAILS */}
        {/* ===================================================================== */}
        {activeSection === "info" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Editar Dados Cadastrais & Apresentação
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                  Personalize suas informações públicas, nome de usuário e foto no portal escolar.
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 w-fit">
                Sincronizado na Nuvem
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Nome Completo de Exibição *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all dark:text-slate-100"
                    placeholder="Ex: Gustavo Rotatori"
                    required
                  />
                </div>
              </div>

              {/* Username (@handle) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block flex items-center justify-between">
                  <span>Nome de Usuário (@handle)</span>
                  <span className="text-[10px] text-slate-400 lowercase font-mono">@{sanitizedUsername || "username"}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-8 pr-4 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all dark:text-slate-100"
                    placeholder="gustavorotatori"
                  />
                </div>
                <p className="text-[10.5px] text-slate-400 dark:text-slate-500 font-normal">
                  Identificador único para mensagens no mural e relatórios escolares.
                </p>
              </div>

              {/* Email Address (Readonly / Protected) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  E-mail Cadastrado (Login Principal)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={userProfile?.email || ""}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                  Gerenciado através da autenticação principal. Para alterar, contate o suporte.
                </p>
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Telefone / WhatsApp para Notificações
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all dark:text-slate-100"
                    placeholder="(11) 98765-4321"
                  />
                </div>
              </div>

              {/* Relationship / Role in School */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Vínculo / Papel Familiar ou Institucional
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    "Mãe / Responsável Legal",
                    "Pai / Responsável Legal",
                    "Responsável Financeiro",
                    "Gestor Escolar / Coordenação"
                  ].map((roleOption) => {
                    const isSelected = relationshipRole === roleOption;
                    return (
                      <button
                        key={roleOption}
                        type="button"
                        onClick={() => setRelationshipRole(roleOption)}
                        className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {roleOption}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Short Bio */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Biografia / Apresentação Resumida
                  </span>
                  <span className="text-[10px] text-slate-400">{bio.length}/250</span>
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={250}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden transition-all dark:text-slate-100 resize-none leading-relaxed"
                  placeholder="Compartilhe observações importantes ou uma breve apresentação sobre seu papel na jornada escolar."
                />
              </div>
            </div>

            {/* Profile Avatar Selection Block */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3 gap-2">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Foto de Perfil & Avatar Digital
                </label>

                {/* Avatar Source Tabs */}
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setAvatarTab("upload")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      avatarTab === "upload"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload de Foto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarTab("presets")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      avatarTab === "presets"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    Galeria de Avatares
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarTab("custom")}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      avatarTab === "custom"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    URL Externa
                  </button>
                </div>
              </div>

              {/* Hidden Native File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
              />

              {/* Avatar Preview & Source Controllers */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                <div className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center group">
                  {photoURL ? (
                    <img src={photoURL} alt="Preview Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-xl">
                      {displayName ? displayName.slice(0, 2).toUpperCase() : <User className="w-10 h-10 text-slate-400" />}
                    </div>
                  )}

                  {photoURL && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      title="Remover foto e restaurar iniciais"
                      className="absolute bottom-1 right-1 bg-rose-600/90 hover:bg-rose-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full">
                  {avatarTab === "upload" && (
                    <div
                      onDragOver={handleFileDragOver}
                      onDragLeave={handleFileDragLeave}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                        isDraggingFile
                          ? "border-amber-500 bg-amber-500/10 scale-[1.01]"
                          : "border-slate-300 dark:border-slate-700 hover:border-amber-500/60 bg-white/70 dark:bg-slate-900/70"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          {isProcessingImage ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <UploadCloud className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {isProcessingImage ? "Otimizando imagem..." : "Arraste sua foto aqui ou clique para escolher"}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            Suporta PNG, JPG, WEBP e GIF. Enquadramento e compressão inteligente automática.
                          </p>
                        </div>
                        {photoURL && (
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Foto carregada
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePhoto();
                              }}
                              className="text-[10.5px] font-bold text-rose-500 hover:text-rose-600 underline cursor-pointer"
                            >
                              Remover Foto
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {avatarTab === "presets" && (
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {AVATAR_PRESETS.map((preset) => {
                        const isSelected = photoURL === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setPhotoURL(preset.url)}
                            className={`aspect-square rounded-xl overflow-hidden border-2 relative transition-all duration-200 group/avatar cursor-pointer ${
                              isSelected
                                ? "border-amber-500 scale-105 ring-2 ring-amber-400/40"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-400"
                            }`}
                            title={preset.label}
                          >
                            <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform" referrerPolicy="no-referrer" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center text-white">
                                <Check className="w-4 h-4 text-white stroke-[3.5]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {avatarTab === "custom" && (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-mono focus:ring-2 focus:ring-amber-500 outline-hidden dark:text-slate-100"
                        placeholder="https://exemplo.com/minha-foto-de-perfil.jpg"
                      />
                      <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
                        Insira um link HTTPS público para carregar uma foto customizada.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Save Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Pressione para sincronizar seu perfil em tempo real no servidor.
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Salvando Alterações..." : "Salvar Perfil"}</span>
              </button>
            </div>
          </form>
        )}

        {/* ===================================================================== */}
        {/* TAB: ACHIEVEMENTS & GAMIFIED MERIT */}
        {/* ===================================================================== */}
        {activeSection === "achievements" && (
          <div className="space-y-6">
            {/* Header with Title & Simulator Action */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Conquistas, Mérito Acadêmico & Selos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Acompanhe insígnias acumuladas, pontuação de mérito pedagógico e metas formativas alcançadas.
                </p>
              </div>

              {/* Action Buttons: Simulator & Save */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSimulateNewQuest}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    simulatedQuestSuccess
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs"
                  }`}
                  title="Simular a conclusão de um novo desafio pedagógico"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{simulatedQuestSuccess ? "Conquista Liberada!" : "Simular Novo Desafio"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Salvar conquistas e pontos no perfil do usuário"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Salvando..." : "Salvar Pontuação"}</span>
                </button>
              </div>
            </div>

            {/* Performance Overview Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Nível de Maestria
                </span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Nível {Math.floor(magicCoins / 80) + 1} • Guardião do Saber
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ciclo formativo de projetos aplicados e cidadania
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span>Pontos de Mérito (Sparks)</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{magicCoins} / 300</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((magicCoins / 300) * 100))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {magicCoins >= 300 ? "Maestria máxima atingida neste ciclo! 🏆" : `Faltam ${300 - magicCoins} Sparks para o próximo nível`}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Selos Desbloqueados
                </span>
                <p className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  {unlockedBadges.length} de {BADGE_CATALOG.length} Insígnias
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {Math.round((unlockedBadges.length / BADGE_CATALOG.length) * 100)}% das insígnias do período concluídas
                </p>
              </div>
            </div>

            {/* Embedded Achievements Widget */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Painel de Metas Formativas & Missões Ativas
                </h4>
                <span className="text-[11px] font-mono text-slate-400">Bimestre 2 • 2026</span>
              </div>
              <div className="p-4 sm:p-5">
                <AchievementsWidget
                  magicCoins={magicCoins}
                  completedQuests={unlockedBadges}
                />
              </div>
            </div>

            {/* Badges Catalog Section with Category Filter */}
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Medal className="w-4 h-4 text-amber-500" />
                    Catálogo de Selos & Reconhecimentos
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Clique em qualquer selo para alternar seu status de desbloqueio em modo interativo.
                  </p>
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                  {[
                    { id: "all", label: "Todos" },
                    { id: "Acadêmico", label: "Acadêmico" },
                    { id: "Tecnologia & Maker", label: "Tecnologia" },
                    { id: "Rotina & Portaria", label: "Rotina" },
                    { id: "Cidadania Escolar", label: "Cidadania" },
                  ].map((cat) => {
                    const isSelected = badgeFilterCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setBadgeFilterCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {BADGE_CATALOG.filter((b) => badgeFilterCategory === "all" || b.category === badgeFilterCategory).map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      onClick={() => handleToggleBadgeUnlock(badge.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between group relative overflow-hidden ${
                        isUnlocked
                          ? "bg-amber-500/5 dark:bg-amber-500/5 border-amber-500/30 hover:border-amber-500 shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/80 opacity-70 hover:opacity-90"
                      }`}
                      title={isUnlocked ? "Clique para bloquear este selo" : "Clique para desbloquear este selo no simulador"}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                            isUnlocked ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                          }`}>
                            {badge.iconName === "star" && <Star className="w-5 h-5" />}
                            {badge.iconName === "sparkles" && <Sparkles className="w-5 h-5" />}
                            {badge.iconName === "trophy" && <Trophy className="w-5 h-5" />}
                            {badge.iconName === "award" && <Award className="w-5 h-5" />}
                            {badge.iconName === "shield" && <ShieldCheck className="w-5 h-5" />}
                            {badge.iconName === "file" && <FileText className="w-5 h-5" />}
                            {badge.iconName === "medal" && <Medal className="w-5 h-5" />}
                            {badge.iconName === "check" && <CheckCircle2 className="w-5 h-5" />}
                          </div>

                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${
                            isUnlocked
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700"
                          }`}>
                            {isUnlocked ? "Conquistado" : "Bloqueado"}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {badge.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            {badge.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex items-center justify-between text-[10.5px]">
                        <span className="text-slate-400 font-medium">
                          {isUnlocked ? (badge.unlockedByDefaultDate || "Desbloqueado") : "Requer meta"}
                        </span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          +{badge.points} Sparks
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Certificado Digital de Reconhecimento Escolar */}
            <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Certificado de Excelência & Reconhecimento Formativo
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Documento digital autêntico emitido pela coordenação pedagógica.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onShowToast("Certificado preparado para visualização e impressão em PDF.", "success");
                      window.print?.();
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Visualizar / Imprimir PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`CERT-2026-ED-${(userProfile?.uid || 'USR').slice(0, 8).toUpperCase()}`);
                      onShowToast("Código de autenticidade copiado para a área de transferência!", "success");
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Hash de Validação</span>
                  </button>
                </div>
              </div>

              {/* Certificate Inner Preview */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-center relative overflow-hidden">
                <div className="max-w-xl mx-auto space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> Certificação Oficial • Ciclo 2026
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    Certificado de Mérito Escolar & Participação Cidadã
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Certificamos que o estudante <strong className="text-slate-900 dark:text-white">{students[0]?.name || "Nicolas Nogueira"}</strong>, sob responsabilidade de <strong className="text-slate-900 dark:text-white">{displayName || "Gustavo Rotatori"}</strong>, atingiu nível exemplar de engajamento pedagógico, conquistando <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">{unlockedBadges.length} insígnias formativas</strong> e <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">{magicCoins} Sparks</strong> no portal educacional.
                  </p>
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-[10.5px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800 mt-2">
                    <span>Validação: <strong className="text-slate-700 dark:text-slate-300">CERT-2026-ED-{(userProfile?.uid || 'USR').slice(0, 8).toUpperCase()}</strong></span>
                    <span>Emissão: <strong className="text-slate-700 dark:text-slate-300">Ano Letivo 2026</strong></span>
                    <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">Ativo & Válido</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: RECENT ACTIVITY HISTORY */}
        {/* ===================================================================== */}
        {activeSection === "activity" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  Histórico de Atividades Recentes & Auditoria
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rastreabilidade completa de ações, confirmações de leitura, autorizações e logins na sua conta.
                </p>
              </div>

              {/* Action Buttons: Export & Clear */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportActivityCsv}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Exportar registros em formato CSV para planilhas"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearActivityHistory}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Limpar histórico local"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Histórico</span>
                </button>
              </div>
            </div>

            {/* Filter Chips & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={activitySearchQuery}
                  onChange={(e) => setActivitySearchQuery(e.target.value)}
                  placeholder="Pesquisar por ação, dispositivo, data ou palavra-chave..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs focus:ring-1 focus:ring-amber-500 outline-hidden dark:text-slate-100"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                {[
                  { id: "all", label: "Todos" },
                  { id: "auth", label: "Acessos" },
                  { id: "settings", label: "Configurações" },
                  { id: "academic", label: "Acadêmico" },
                  { id: "portaria", label: "Portaria" },
                  { id: "financial", label: "Financeiro" },
                  { id: "communication", label: "Comunicados" },
                  { id: "security", label: "Segurança" },
                ].map((chip) => {
                  const isSelected = activityCategoryFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setActivityCategoryFilter(chip.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs"
                          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Activities Timeline Feed */}
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                <Clock className="w-8 h-8 text-slate-400 mx-auto opacity-60" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum registro encontrado</h4>
                <p className="text-[11px] text-slate-400">
                  Tente alterar os filtros ou realizar novas ações na plataforma.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((act, idx) => {
                  return (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.2 }}
                      className="p-4 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Context Icon by Category */}
                        <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                          act.category === "auth"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : act.category === "academic"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : act.category === "portaria"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : act.category === "financial"
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : act.category === "security"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}>
                          {act.category === "auth" && <Key className="w-4 h-4" />}
                          {act.category === "academic" && <GraduationCap className="w-4 h-4" />}
                          {act.category === "portaria" && <Car className="w-4 h-4" />}
                          {act.category === "financial" && <DollarSign className="w-4 h-4" />}
                          {act.category === "communication" && <Bell className="w-4 h-4" />}
                          {act.category === "security" && <ShieldCheck className="w-4 h-4" />}
                          {act.category === "settings" && <Settings className="w-4 h-4" />}
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {act.title}
                            </h4>
                            <span className="text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
                              {act.category}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-snug">
                            {act.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Meta: Timestamp & Device Info */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-[11px] text-slate-500 dark:text-slate-400 font-mono shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-850">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {act.dateFormatted || new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {act.deviceInfo && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[170px]">
                            {act.deviceInfo}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: ACCOUNT SETTINGS & PREFERENCES */}
        {/* ===================================================================== */}
        {activeSection === "settings" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Preferências da Conta & Canais de Notificação
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure canais de aviso (WhatsApp, Push, E-mail), modo de exibição e horário de silêncio.
              </p>
            </div>

            {/* Notification Modules Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Categorias de Notificação no Aplicativo
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meals */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                      <Apple className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Alimentação & Cardápio</h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Refeições consumidas, lanches e orientações nutricionais diárias.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyMeals(!notifyMeals)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyMeals ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      notifyMeals ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* Grades & Pedagogical */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Boletim & Notas Acadêmicas</h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Lançamento de avaliações bimestrais, pareceres e tarefas.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyGrades(!notifyGrades)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyGrades ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      notifyGrades ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* Events & Calendar */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Eventos & Calendário Letivo</h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Reuniões de pais, passeios pedagógicos e feriados.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyEvents(!notifyEvents)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyEvents ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      notifyEvents ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* Financial & WhatsApp Invoices */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Faturamento & Lembretes WhatsApp</h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Disparo prévio de faturas, links PIX e comprovantes fiscais.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyFinancial(!notifyFinancial)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyFinancial ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      notifyFinancial ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* KEY EVENT 1: New Messages */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Novas Mensagens & Recados</h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Avisos de professores, coordenação pedagógica e secretaria.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyNewMessages(!notifyNewMessages)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyNewMessages ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      notifyNewMessages ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* KEY EVENT 2: Upcoming Deadlines */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Prazos & Vencimentos</h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Vencimento de faturas, rematrícula e prazos de trabalhos acadêmicos.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyDeadlines(!notifyDeadlines)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyDeadlines ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      notifyDeadlines ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                {/* KEY EVENT 3: Special Promotions */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Promoções & Oportunidades</h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Desconto de pontualidade, rematrícula antecipada e cursos de férias.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyPromotions(!notifyPromotions)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      notifyPromotions ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      notifyPromotions ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery Channels Grid */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500" />
                Canais de Entrega Ativos
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Push no Navegador</span>
                  <input
                    type="checkbox"
                    checked={notifyPushBrowser}
                    onChange={(e) => setNotifyPushBrowser(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">WhatsApp Proativo</span>
                  <input
                    type="checkbox"
                    checked={notifyWhatsApp}
                    onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">E-mail Resumo Diário</span>
                  <input
                    type="checkbox"
                    checked={notifyEmailDaily}
                    onChange={(e) => setNotifyEmailDaily(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">SMS de Emergência</span>
                  <input
                    type="checkbox"
                    checked={notifySmsEmergency}
                    onChange={(e) => setNotifySmsEmergency(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {onOpenPushPreferences && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenPushPreferences}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/60 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Abrir Central Completa de Notificações Push & Testes</span>
                  </button>
                </div>
              )}
            </div>

            {/* Interface Theme & Appearance */}
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-500" />
                Aparência da Plataforma & Idioma
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Theme Mode Selector (Dia / Noite / Sistema) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Tema da Interface</h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Dia (claro), Noite (escuro) ou Sistema (6h às 18h claro, 18h às 6h escuro).
                      </p>
                    </div>
                  </div>

                  <div>
                    <ThemeSelector
                      themePreference={themePreference}
                      onSelectTheme={(pref) => onSelectThemePreference?.(pref)}
                      variant="segmented"
                      locale={locale}
                      className="w-full justify-between"
                    />
                  </div>
                </div>

                {/* System Language Selector */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">Idioma do Sistema</h5>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Selecione o idioma de exibição do portal e comunicados.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <LanguageSelector
                      currentLocale={locale}
                      onSelectLocale={(loc) => {
                        setLanguage(loc as any);
                        onLocaleChanged?.(loc);
                      }}
                      variant="dropdown"
                      showLabel={true}
                    />
                    <span className="text-[11px] font-mono text-slate-500">
                      {locale.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Accent Color Selection */}
                <div className="md:col-span-2 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-2">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white">Cor de Destaque da Instituição</h5>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "amber", label: "Âmbar", color: "bg-amber-600" },
                      { id: "royal", label: "Azul Real", color: "bg-blue-600" },
                      { id: "emerald", label: "Esmeralda", color: "bg-emerald-600" },
                      { id: "default", label: "Padrão", color: "bg-slate-800" },
                    ].map((c) => {
                      const isSelected = themeColor === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setThemeColor(c.id as any)}
                          className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? "border-amber-500 bg-white dark:bg-slate-900 font-extrabold shadow-2xs"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full ${c.color}`} />
                          <span className="text-[9.5px] text-slate-700 dark:text-slate-300">{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 4: SECURITY & ACTIVE SESSIONS */}
        {/* ===================================================================== */}
        {activeSection === "security" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Segurança da Conta & Dispositivos Conectados
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Gerenciamento de credenciais, autenticação de dois fatores e auditoria de sessões.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password Reset */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Redefinição de Senha</h4>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                      Dispare um e-mail com token seguro para redefinir sua senha de acesso.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Link de Redefinição por E-mail</span>
                </button>
              </div>

              {/* Two Factor Authentication (2FA) */}
              <div className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Autenticação em 2 Etapas (2FA)</h4>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Exigir código de verificação via SMS/App no login.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !twoFactorEnabled;
                      setTwoFactorEnabled(next);
                      onShowToast(`Autenticação de 2 fatores ${next ? "ativada" : "desativada"}.`, "info");
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      twoFactorEnabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-800"
                    }`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono">
                  <span>Status do 2FA:</span>
                  <span className={`font-bold ${twoFactorEnabled ? "text-emerald-600" : "text-slate-400"}`}>
                    {twoFactorEnabled ? "Ativo (SMS / Token)" : "Desabilitado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Sessions & Connected Devices List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-500" />
                Sessões Ativas & Dispositivos Conectados
              </h4>

              <div className="space-y-2">
                {[
                  {
                    id: "sess-1",
                    device: "MacBook Pro • Chrome 128",
                    location: "São Paulo, SP - Brasil",
                    ip: "189.40.122.84",
                    isCurrent: true,
                    time: "Ativo agora"
                  },
                  {
                    id: "sess-2",
                    device: "iPhone 15 Pro • App Mobile",
                    location: "São Paulo, SP - Brasil",
                    ip: "189.40.122.84",
                    isCurrent: false,
                    time: "Último acesso há 3 horas"
                  }
                ].map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                        {sess.device.includes("iPhone") ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">{sess.device}</h5>
                          {sess.isCurrent && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Dispositivo Atual
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {sess.location} • IP {sess.ip} • {sess.time}
                        </p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        type="button"
                        onClick={() => onShowToast("Sessão remota encerrada com sucesso.", "info")}
                        className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        Desconectar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy & LGPD Export */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Exportação e Privacidade de Dados (LGPD)</h5>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                  Baixe um arquivo JSON com todas as suas informações pessoais e registros escolares.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Dados JSON</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 5: LINKED STUDENTS / FAMILY */}
        {/* ===================================================================== */}
        {activeSection === "students" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Estudantes Vinculados a esta Conta ({students.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Filhos e dependentes associados a este login com autorizações ativas na escola.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {students.map((st) => (
                <div
                  key={st.id}
                  className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-300 dark:border-slate-700 group">
                      <img src={st.avatar} alt={st.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        type="button"
                        onClick={() => setStudentForCamera(st)}
                        className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        title="Tirar foto com a câmera"
                        aria-label={`Tirar foto de ${st.name}`}
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{st.name}</h4>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">{st.grade}</p>
                      <button
                        type="button"
                        onClick={() => setStudentForCamera(st)}
                        className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 mt-1 hover:underline cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Tirar Foto</span>
                      </button>
                    </div>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                    Ativo
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Student Photo Camera Modal */}
      {studentForCamera && (
        <StudentPhotoCameraModal
          isOpen={!!studentForCamera}
          onClose={() => setStudentForCamera(null)}
          student={studentForCamera}
          onPhotoCaptured={(studentId, photoDataUrl) => {
            if (onUpdateStudentPhoto) {
              onUpdateStudentPhoto(studentId, photoDataUrl);
            }
          }}
          onToast={onShowToast}
        />
      )}
    </div>
  );
}
