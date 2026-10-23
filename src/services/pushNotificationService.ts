// Push Notification Service with Web Push, Service Worker, Web Audio Chime, and Preferences Management
import { NotificationItem, UserPreferences } from "../types";

export type PushPermissionState = "granted" | "denied" | "default" | "unsupported";

export type NotificationEventCategory = 
  | "new_message" 
  | "deadline" 
  | "promotion" 
  | "security" 
  | "academic" 
  | "financial";

export interface PushNotificationPreferences {
  masterEnabled: boolean;
  browserPushEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  // Key event categories
  notifyNewMessages: boolean;
  notifyDeadlines: boolean;
  notifyPromotions: boolean;
  // Additional categories
  notifySecurity: boolean;
  notifyAcademic: boolean;
  notifyFinancial: boolean;
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g. "22:00"
  quietHoursEnd: string;   // e.g. "07:00"
  bypassQuietHoursForUrgent: boolean;
}

export const DEFAULT_PUSH_PREFERENCES: PushNotificationPreferences = {
  masterEnabled: true,
  browserPushEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  notifyNewMessages: true,
  notifyDeadlines: true,
  notifyPromotions: true,
  notifySecurity: true,
  notifyAcademic: true,
  notifyFinancial: true,
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  bypassQuietHoursForUrgent: true,
};

const PREFERENCES_STORAGE_KEY = "magic_learning_push_preferences_v2";
const NOTIFICATIONS_STORAGE_KEY = "school_push_notifications";

type NotificationListener = (item: NotificationItem) => void;
type BannerListener = (item: NotificationItem | null) => void;

class PushNotificationService {
  private listeners: Set<NotificationListener> = new Set();
  private bannerListeners: Set<BannerListener> = new Set();
  private swRegistration: ServiceWorkerRegistration | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.initServiceWorker();
  }

  /**
   * Initializes the Service Worker if supported
   */
  public async initServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      this.swRegistration = reg;
      return reg;
    } catch (err) {
      console.warn("[PushService] Service worker registration notice:", err);
      return null;
    }
  }

  /**
   * Check browser Notification permission status
   */
  public getPermissionStatus(): PushPermissionState {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission as PushPermissionState;
  }

  /**
   * Request browser permission to show native push notifications
   */
  public async requestBrowserPermission(): Promise<PushPermissionState> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await this.initServiceWorker();
        // Update browserPushEnabled preference to true
        const prefs = this.getPreferences();
        prefs.browserPushEnabled = true;
        this.savePreferences(prefs);
      }
      return permission as PushPermissionState;
    } catch (err) {
      console.error("[PushService] Error requesting notification permission:", err);
      return this.getPermissionStatus();
    }
  }

  /**
   * Load user push notification preferences from localStorage
   */
  public getPreferences(): PushNotificationPreferences {
    if (typeof window === "undefined") {
      return DEFAULT_PUSH_PREFERENCES;
    }
    try {
      const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_PUSH_PREFERENCES, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn("[PushService] Failed to read stored preferences:", e);
    }
    return { ...DEFAULT_PUSH_PREFERENCES };
  }

  /**
   * Save user push notification preferences
   */
  public savePreferences(prefs: Partial<PushNotificationPreferences>): PushNotificationPreferences {
    const updated: PushNotificationPreferences = {
      ...this.getPreferences(),
      ...prefs,
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("[PushService] Failed to persist preferences:", e);
      }
    }
    return updated;
  }

  /**
   * Sync preferences with UserPreferences from UserProfile
   */
  public syncFromUserProfile(userPrefs?: UserPreferences): void {
    if (!userPrefs) return;
    const current = this.getPreferences();
    const updated: PushNotificationPreferences = {
      ...current,
      masterEnabled: userPrefs.notifications !== false,
      notifyNewMessages: userPrefs.notifyNewMessages ?? current.notifyNewMessages,
      notifyDeadlines: userPrefs.notifyDeadlines ?? current.notifyDeadlines,
      notifyPromotions: userPrefs.notifyPromotions ?? current.notifyPromotions,
      soundEnabled: userPrefs.notifySoundEnabled ?? current.soundEnabled,
      vibrationEnabled: userPrefs.notifyVibrationEnabled ?? current.vibrationEnabled,
      notifyAcademic: userPrefs.notifyGrades ?? current.notifyAcademic,
      notifyFinancial: userPrefs.notifyFinancial ?? current.notifyFinancial,
      notifySecurity: userPrefs.notifyPortaria ?? current.notifySecurity,
      quietHoursEnabled: userPrefs.quietHoursEnabled ?? current.quietHoursEnabled,
      quietHoursStart: userPrefs.quietHoursStart || current.quietHoursStart,
      quietHoursEnd: userPrefs.quietHoursEnd || current.quietHoursEnd,
    };
    this.savePreferences(updated);
  }

  /**
   * Check if quiet hours are currently in effect
   */
  public isQuietHoursActive(): boolean {
    const prefs = this.getPreferences();
    if (!prefs.quietHoursEnabled) return false;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = (prefs.quietHoursStart || "22:00").split(":").map(Number);
    const [endH, endM] = (prefs.quietHoursEnd || "07:00").split(":").map(Number);

    const startMinutes = (startH || 0) * 60 + (startM || 0);
    const endMinutes = (endH || 0) * 60 + (endM || 0);

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Crosses midnight (e.g. 22:00 to 07:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

  /**
   * Plays a pleasant harmonic two-note chime using Web Audio API
   */
  public playChimeSound(): void {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext || this.audioContext.state === "closed") {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      const ctx = this.audioContext;
      const now = ctx.currentTime;

      // Note 1: 587.33 Hz (D5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.36);

      // Note 2: 880 Hz (A5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.001, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.66);
    } catch (e) {
      console.warn("[PushService] Audio chime notice:", e);
    }
  }

  /**
   * Triggers device vibration on mobile devices
   */
  public triggerVibration(pattern: number[] = [80, 40, 80]): void {
    if (typeof window === "undefined") return;
    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore vibration restrictions
      }
    }
  }

  /**
   * Core dispatch method that respects preferences, quiet hours, and sends notifications
   */
  public async sendNotification(params: {
    title: string;
    body: string;
    category: NotificationEventCategory;
    targetTab: "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso";
    iconType?: "announcement" | "occurrence" | "chat" | "calendar" | "faturamento" | "message" | "deadline" | "promotion";
    studentName?: string;
    priority?: "low" | "normal" | "high" | "urgent";
    actionLabel?: string;
    actionUrl?: string;
    forceBrowserPush?: boolean;
  }): Promise<{ delivered: boolean; reason?: string; notification: NotificationItem }> {
    const prefs = this.getPreferences();

    // 1. Check Master Switch
    if (!prefs.masterEnabled) {
      return {
        delivered: false,
        reason: "As notificações estão desativadas nas preferências do usuário.",
        notification: this.createNotificationItem(params),
      };
    }

    // 2. Check Event Category Filter
    let categoryAllowed = true;
    switch (params.category) {
      case "new_message":
        categoryAllowed = prefs.notifyNewMessages;
        break;
      case "deadline":
        categoryAllowed = prefs.notifyDeadlines;
        break;
      case "promotion":
        categoryAllowed = prefs.notifyPromotions;
        break;
      case "academic":
        categoryAllowed = prefs.notifyAcademic;
        break;
      case "financial":
        categoryAllowed = prefs.notifyFinancial;
        break;
      case "security":
        categoryAllowed = prefs.notifySecurity;
        break;
    }

    if (!categoryAllowed) {
      return {
        delivered: false,
        reason: `A categoria "${params.category}" está desabilitada nas preferências.`,
        notification: this.createNotificationItem(params),
      };
    }

    // 3. Check Quiet Hours
    const isQuiet = this.isQuietHoursActive();
    const isUrgent = params.priority === "urgent";
    const allowDuringQuiet = prefs.bypassQuietHoursForUrgent && isUrgent;

    const notifItem = this.createNotificationItem(params);

    // Save to history in localStorage
    this.saveNotificationToHistory(notifItem);

    // Notify in-app subscribers (navbar badge, list, etc.)
    this.listeners.forEach((listener) => {
      try {
        listener(notifItem);
      } catch (e) {
        console.error(e);
      }
    });

    // Notify banner subscribers
    this.bannerListeners.forEach((listener) => {
      try {
        listener(notifItem);
      } catch (e) {
        console.error(e);
      }
    });

    // Sound alert
    if (prefs.soundEnabled && (!isQuiet || allowDuringQuiet)) {
      this.playChimeSound();
    }

    // Vibration alert
    if (prefs.vibrationEnabled && (!isQuiet || allowDuringQuiet)) {
      this.triggerVibration([80, 50, 80]);
    }

    // 4. Native Browser Push Notification
    if (prefs.browserPushEnabled && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted" || params.forceBrowserPush) {
        this.displayNativeBrowserNotification(notifItem);
      }
    }

    return { delivered: true, notification: notifItem };
  }

  /**
   * Helper to construct a NotificationItem
   */
  private createNotificationItem(params: {
    title: string;
    body: string;
    category: NotificationEventCategory;
    targetTab: "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso";
    iconType?: "announcement" | "occurrence" | "chat" | "calendar" | "faturamento" | "message" | "deadline" | "promotion";
    studentName?: string;
    priority?: "low" | "normal" | "high" | "urgent";
    actionLabel?: string;
    actionUrl?: string;
  }): NotificationItem {
    return {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: params.title,
      body: params.body,
      timestamp: Date.now(),
      read: false,
      targetTab: params.targetTab,
      iconType: params.iconType || (params.category === "new_message" ? "message" : params.category === "deadline" ? "deadline" : params.category === "promotion" ? "promotion" : "announcement"),
      category: params.category,
      studentName: params.studentName,
      priority: params.priority || "normal",
      actionLabel: params.actionLabel || "Abrir Detalhes",
      actionUrl: params.actionUrl,
    };
  }

  /**
   * Shows native OS browser notification via Service Worker or Notification constructor
   */
  private async displayNativeBrowserNotification(item: NotificationItem): Promise<void> {
    try {
      const iconUrl = "/favicon.ico";
      const options: NotificationOptions = {
        body: item.body,
        icon: iconUrl,
        badge: iconUrl,
        tag: `magic-notif-${item.id}`,
        data: {
          url: "/",
          targetTab: item.targetTab,
          notificationId: item.id,
        },
      };

      if (this.swRegistration && "showNotification" in this.swRegistration) {
        await this.swRegistration.showNotification(item.title, options);
      } else if ("Notification" in window) {
        const notif = new Notification(item.title, options);
        notif.onclick = () => {
          window.focus();
          notif.close();
          this.bannerListeners.forEach((l) => l(item));
        };
      }
    } catch (e) {
      console.warn("[PushService] Could not display native notification:", e);
    }
  }

  /**
   * Saves notification to stored history list
   */
  private saveNotificationToHistory(item: NotificationItem): void {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const existing: NotificationItem[] = raw ? JSON.parse(raw) : [];
      const updated = [item, ...existing.filter((n) => n.id !== item.id)].slice(0, 100);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("[PushService] Error updating notification storage:", e);
    }
  }

  /**
   * Get all notifications from history
   */
  public getHistory(): NotificationItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Mark single notification as read
   */
  public markAsRead(id: string): NotificationItem[] {
    const list = this.getHistory().map((n) => (n.id === id ? { ...n, read: true } : n));
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): NotificationItem[] {
    const list = this.getHistory().map((n) => ({ ...n, read: true }));
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  }

  /**
   * Delete single notification from history
   */
  public deleteNotification(id: string): NotificationItem[] {
    const list = this.getHistory().filter((n) => n.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    }
    return list;
  }

  /**
   * Clear all notifications history
   */
  public clearAll(): NotificationItem[] {
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
    }
    return [];
  }

  // -------------------------------------------------------------
  // KEY EVENT TRIGGERS (Required by user brief)
  // -------------------------------------------------------------

  /**
   * 1. KEY EVENT: New Message Notification (Novas Mensagens)
   */
  public async triggerNewMessage(options?: {
    sender?: string;
    message?: string;
    role?: string;
    studentName?: string;
    targetTab?: "comunicados" | "diaadia" | "academico";
  }) {
    const sender = options?.sender || "Coordenação Pedagógica";
    const body = options?.message || "Reunião de alinhamento individual do 4º bimestre agendada para 28 de Outubro.";
    const studentName = options?.studentName || "Nicolas Nogueira";

    return this.sendNotification({
      title: `💬 Nova Mensagem de ${sender}`,
      body,
      category: "new_message",
      targetTab: options?.targetTab || "comunicados",
      iconType: "message",
      studentName,
      priority: "normal",
      actionLabel: "Abrir Mensagem",
    });
  }

  /**
   * 2. KEY EVENT: Upcoming Deadline Notification (Prazos & Vencimentos)
   */
  public async triggerUpcomingDeadline(options?: {
    title?: string;
    deadline?: string;
    daysRemaining?: number;
    amount?: number;
    targetTab?: "cobrancas" | "academico" | "comunicados";
  }) {
    const days = options?.daysRemaining ?? 3;
    const title = options?.title || "Fatura Escolar Novembro/2026";
    const amountStr = options?.amount ? ` de R$ ${options.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "";
    const body = `Atenção: Vencimento da parcela${amountStr} em ${days} dias. Garanta o desconto de pontualidade efetuando o pagamento via Pix.`;

    return this.sendNotification({
      title: `⏳ Prazo Próximo: ${title}`,
      body,
      category: "deadline",
      targetTab: options?.targetTab || "cobrancas",
      iconType: "deadline",
      priority: "high",
      actionLabel: "Ver Fatura & Pix",
    });
  }

  /**
   * 3. KEY EVENT: Special Promotion Notification (Promoções & Oportunidades Especiais)
   */
  public async triggerSpecialPromotion(options?: {
    title?: string;
    description?: string;
    discountPercent?: number;
    code?: string;
    targetTab?: "cobrancas" | "comunicados";
  }) {
    const promoTitle = options?.title || "Campanha Rematrícula Antecipada 2027";
    const discount = options?.discountPercent || 20;
    const body = options?.description || `Garanta ${discount}% de desconto na 1ª mensalidade de 2027 e isenção da taxa de material didático ao confirmar até 31 de Outubro.`;

    return this.sendNotification({
      title: `🎁 Oferta Especial: ${promoTitle}`,
      body,
      category: "promotion",
      targetTab: options?.targetTab || "cobrancas",
      iconType: "promotion",
      priority: "normal",
      actionLabel: "Aproveitar Desconto",
    });
  }

  // -------------------------------------------------------------
  // SUBSCRIPTION LISTENERS
  // -------------------------------------------------------------

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeBanner(listener: BannerListener): () => void {
    this.bannerListeners.add(listener);
    return () => {
      this.bannerListeners.delete(listener);
    };
  }
}

export const pushNotificationService = new PushNotificationService();
