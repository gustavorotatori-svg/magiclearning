import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Bell,
  MessageSquare,
  Clock,
  Tag,
  DollarSign,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Settings,
} from "lucide-react";
import { NotificationItem } from "../types";

interface PushNotificationToastProps {
  notification: NotificationItem | null;
  onClose: () => void;
  onNavigateToTab?: (tab: "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso", notificationId?: string) => void;
  onOpenPreferences?: () => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notification,
  onClose,
  onNavigateToTab,
  onOpenPreferences,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!notification || isHovered) return;

    const timer = setTimeout(() => {
      onClose();
    }, 7000);

    return () => clearTimeout(timer);
  }, [notification, isHovered, onClose]);

  if (!notification) return null;

  // Category Icon & Accent Color
  const getIconAndStyle = () => {
    switch (notification.iconType) {
      case "message":
        return {
          icon: MessageSquare,
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          tagLabel: "Nova Mensagem",
          tagBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
        };
      case "deadline":
        return {
          icon: Clock,
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          tagLabel: "Prazo / Vencimento",
          tagBg: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        };
      case "promotion":
        return {
          icon: Tag,
          bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          tagLabel: "Promoção Especial",
          tagBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
        };
      case "faturamento":
        return {
          icon: DollarSign,
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          tagLabel: "Faturamento & Pix",
          tagBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
        };
      case "occurrence":
        return {
          icon: ShieldCheck,
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          tagLabel: "Segurança & Portaria",
          tagBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
        };
      default:
        return {
          icon: Bell,
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          tagLabel: "Aviso Escolar",
          tagBg: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
        };
    }
  };

  const style = getIconAndStyle();
  const IconComponent = style.icon;

  const handleActionClick = () => {
    if (onNavigateToTab && notification.targetTab) {
      onNavigateToTab(notification.targetTab, notification.id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        key={notification.id}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed z-50 top-3 inset-x-3 sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-5 sm:w-96 max-w-full"
        role="alert"
        aria-live="assertive"
      >
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 overflow-hidden backdrop-blur-md">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl border ${style.bg} shrink-0`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${style.tagBg}`}>
                  {style.tagLabel}
                </span>
                <span className="text-[10px] text-slate-500 font-mono ml-2">
                  Agora
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {onOpenPreferences && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenPreferences();
                    onClose();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Configurar Notificações"
                  aria-label="Configurar Notificações"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fechar Notificação"
                aria-label="Fechar Notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-1 mb-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
              {notification.title}
            </h4>
            <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
              {notification.body}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 truncate">
              {notification.studentName || "Magic Learning"}
            </span>

            <button
              type="button"
              onClick={handleActionClick}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <span>{notification.actionLabel || "Abrir no App"}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
