export interface Ocorrencia {
  id: string;
  date: string; // e.g., "Hoje", "Ontem"
  meals: {
    lunch: "excelente" | "parcial" | "recusou" | "nao_se_aplica";
    snack: "excelente" | "parcial" | "recusou" | "nao_se_aplica";
    details: string;
  };
  medicated: {
    wasMedicated: boolean;
    medicationName?: string;
    doseTime?: string;
    details: string;
  };
  sleep: {
    durationStr: string; // e.g., "1h 30min", "Não dormiu"
    details: string;
  };
  behaviorState: "otimo" | "agitado" | "triste" | "cansado";
  teacherNote: string;
}

export interface DisciplinaNota {
  subject: string;
  firstBimester: number;
  secondBimester: number;
  feedback: string;
}

export interface AutorizacaoRetirada {
  id: string;
  name: string;
  relationship: string; // Avó, Tio, Motorista Particular, etc.
  rg: string;
  isAuthorized: boolean;
  photo?: string;
}

export interface Estudante {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  occurrences: Ocorrencia[];
  grades: DisciplinaNota[];
  withdrawalRules: AutorizacaoRetirada[];
  reEnrollmentStatus: "pendente" | "concluido" | "em_analise";
  pickupQueueStatus?: "em_casa" | "fila_espera" | "liberado_chamado" | "saiu";
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  pickupQueueStatusUpdatedAt?: string;
}

export interface SchoolBranding {
  schoolId: string;
  schoolName: string;
  schoolSlogan?: string;
  logoType?: "preset" | "custom_url" | "upload";
  logoPreset: "magic_hat" | "classic_oz" | "emerald_shield" | "magic_wand" | "rainbow_unicorn" | "academic_crest" | "modern_monogram" | "open_book";
  customLogoUrl?: string;
  primaryColor: string; // Hex color e.g. #0077C0
  secondaryColor: string; // Hex color e.g. #C4CED4
  accentColor?: string; // Hex color e.g. #D97706
  themePreset: "magic_purple" | "fairy_emerald" | "wizard_indigo" | "classic_oz" | "orlando_magic" | "oxford_blue" | "bordeaux_tradition" | "slate_minimal" | "amber_warm" | "custom";
  fontPreset?: "sans" | "serif" | "mono";
  borderRadius?: "compact" | "rounded" | "curved";
  enableStarsBackground: boolean;
  // White-label enabled modules toggle (which modules are available in the app)
  enabledModules?: Record<string, boolean>;
  // White-label feed sequence (order in which modules appear on the dashboard feed)
  feedModuleOrder?: string[];
}

export interface CommentItem {
  id: string;
  authorName: string;
  text: string;
  timestamp: number;
}

export interface Comunicado {
  id: string;
  title: string;
  date: string; // display string
  timestamp?: number; // Sorting/filtering
  previewText: string;
  content: string;
  category: string;
  image?: string;
  authorName?: string;
  tags?: string[];
  likesCount?: number;
  dislikesCount?: number;
  comments?: CommentItem[];
  seenByParent?: string[];
}

export interface Momento {
  id: string;
  title: string;
  description: string;
  date: string;
  timestamp?: number;
  image: string; // Base64 or URL
  originalPrompt?: string;
  modelUsed?: string;
  sizeSpecified?: string;
  isUserGenerated?: boolean;
  tags?: string[];
}

export interface Evento {
  id: string;
  title: string;
  dateStr: string; // e.g. "27 Jun"
  dayOfWeek: string; // e.g. "Sábado"
  timestamp?: number;
  time: string; // e.g. "10:00 - 18:00"
  description: string;
  location: string;
  isJoined?: boolean;
  tags?: string[];
}

export interface Cobranca {
  id: string;
  title: string;
  dueDate: string; // e.g. "05/07/2026"
  timestamp?: number;
  amount: number;
  status: "pago" | "pendente" | "vencido";
  documentId: string;
  category: string;
  tags?: string[];
}

export interface UserActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  dateFormatted?: string;
  category: "auth" | "settings" | "security" | "financial" | "academic" | "communication" | "portaria";
  status?: "success" | "warning" | "info" | "neutral";
  deviceInfo?: string;
  ipAddress?: string;
}

export interface UserPreferences {
  studentName: string;
  studentGrade: string;
  themeColor: "default" | "royal" | "emerald" | "amber";
  notificationCategory: "todos" | "formais" | "urgentes";
  notifyMeals?: boolean;
  notifyGrades?: boolean;
  notifyEvents?: boolean;
  notifyFinancial?: boolean;
  notifyPortaria?: boolean;
  notifyWhatsApp?: boolean;
  notifyEmailDaily?: boolean;
  notifySmsEmergency?: boolean;
  twoFactorEnabled?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  language?: "pt-BR" | "en" | "es";
  uiDensity?: "comfortable" | "compact";
  phone?: string;
  relationshipRole?: string;
  notifications?: boolean;
  compactMode?: boolean;
  highContrast?: boolean;
  reducedMotion?: boolean;
  emailDigest?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  preferences: UserPreferences;
  savedComunicadoIds: string[];
  savedMomentoIds: string[];
  joinedEventoIds: string[];
  selectedStudentId?: string;
  students?: Estudante[];
  username?: string;
  photoURL?: string;
  bio?: string;
  activityHistory?: UserActivityItem[];
  unlockedBadgeIds?: string[];
  magicCoins?: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  targetTab: "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso";
  iconType: "announcement" | "occurrence" | "chat" | "calendar" | "faturamento";
  studentName?: string;
  nextCrmContactDate?: string;
  nextCrmContactTime?: string;
  nextCrmContactNote?: string;
}

export interface ClassroomPhoto {
  id: string;
  title: string;
  grade: string;
  date: string;
  timestamp: number;
  imageUrl: string;
  teacherName: string;
  badge: string;
  taggedStudentIds?: string[];
  likes?: number;
  likedByCurrentUser?: boolean;
  tags?: string[];
}

export interface ChatMessage {
  id: string;
  sender: "parent" | "secretaria";
  text: string;
  timestamp: number;
}

export interface ScheduledReminder {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  type: "material" | "reuniao" | "outro";
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  active: boolean;
}

export interface ChartAnnotation {
  id: string;
  studentId: string;
  bimester: string; // "1º Bimestre" | "2º Bimestre"
  subject: string; // "Todas" or specific subject
  category: string; // e.g. "Project Week", "Exam Period", "Recovery", "Custom"
  note: string;
  author: string;
  createdAt: string;
}

export interface RoutineChartAnnotation {
  id: string;
  studentId: string;
  dayKey: string; // e.g. "Ter", "Qua", "Qui", "Sex", "Dom", "Seg", "Sáb"
  dateLabel: string; // e.g. "04/08/2026"
  eventTitle: string; // e.g. "Mudança de Medicação" / "Semana de Avaliações"
  category: "medication" | "assessment" | "pedagogical" | "diet" | "behavioral" | "custom";
  description: string; // e.g. "Ajuste na dosagem matutina com monitoramento de reflexos."
  authorName: string; // e.g. "Dra. Helena (Enfermaria)" ou "Coord. Lúcia"
  authorRole: "admin" | "educator" | "health_nurse" | "coordinator";
  createdAt: string;
  impactObserved?: string; // e.g. "Aumento temporário de agitação no meio da manhã"
}

export interface QrCheckInLog {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  avatar: string;
  timestamp: string;
  status: "entrada" | "saida" | "tentativa_invalida";
  method: "qr_code" | "manual" | "biometria";
  details?: string;
  teacherName?: string;
  shift?: "manha" | "tarde" | "integral";
}

export interface DailyGoalItem {
  id: string;
  studentId?: string;
  title: string;
  category: "rotina" | "pedagogico" | "saude" | "organizacao" | "socioemocional";
  completed: boolean;
  completedAt?: string;
  timeOfDay?: "manha" | "tarde" | "noite" | "dia_todo";
  notes?: string;
  isCustom?: boolean;
}

export type ContentReportReason =
  | "inappropriate_content"
  | "minor_privacy"
  | "bullying_harassment"
  | "spam_advertising"
  | "misinformation"
  | "other";

export type ReportedContentType =
  | "comunicado"
  | "comment"
  | "photo"
  | "occurrence"
  | "message";

export type ReportStatus =
  | "pending"
  | "under_review"
  | "resolved_removed"
  | "resolved_warned"
  | "dismissed";

export interface UserWarning {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  reason: string;
  severity: "leve" | "moderada" | "grave";
  message: string;
  issuedBy: string;
  issuedAt: number;
  acknowledged: boolean;
  acknowledgedAt?: number;
  relatedReportId?: string;
  relatedContentSnippet?: string;
}

export interface ContentReport {
  id: string;
  contentType: ReportedContentType;
  contentId: string;
  contentTitle?: string;
  contentSnippet: string;
  contentAuthorName?: string;
  contentAuthorId?: string;
  contentImageUrl?: string;
  contentParentId?: string; // e.g. comunicadoId or photoId if comment
  reporterUserId: string;
  reporterName: string;
  reporterRole: "pais" | "escola" | "aluno" | "anonimo";
  reason: ContentReportReason;
  reasonDetails?: string;
  timestamp: number;
  status: ReportStatus;
  reviewedAt?: number;
  reviewedBy?: string;
  moderatorNotes?: string;
  actionTaken?: "removed" | "warned" | "removed_and_warned" | "dismissed" | "none";
  warningIssued?: UserWarning;
}
