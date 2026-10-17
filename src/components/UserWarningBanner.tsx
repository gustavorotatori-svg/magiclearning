import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldAlert, AlertTriangle, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { UserWarning } from "../types";

export interface UserWarningBannerProps {
  /** Global or localized warnings list */
  warnings?: UserWarning[];
  userWarnings?: UserWarning[];
  warning?: UserWarning;

  /** Current logged in user context */
  currentUser?: {
    uid?: string;
    displayName?: string;
    role?: string;
  };
  currentUserId?: string;
  currentUserName?: string;
  currentUserRole?: string;

  /** Callback fired when user acknowledges a specific warning */
  onAcknowledge: (warningId: string) => void;

  /** Optional custom container classes */
  className?: string;
}

export const UserWarningBanner: React.FC<UserWarningBannerProps> = ({
  warnings,
  userWarnings,
  warning,
  currentUser,
  currentUserId,
  currentUserName,
  currentUserRole,
  onAcknowledge,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize warning sources
  const allWarnings = useMemo(() => {
    if (warnings && warnings.length > 0) return warnings;
    if (userWarnings && userWarnings.length > 0) return userWarnings;
    if (warning) return [warning];
    return [];
  }, [warnings, userWarnings, warning]);

  const activeUserId = currentUserId || currentUser?.uid;
  const activeUserName = currentUserName || currentUser?.displayName;
  const activeUserRole = currentUserRole || currentUser?.role;

  // Filter unacknowledged warnings directed to or relevant for current user
  const unacknowledgedWarnings = useMemo(() => {
    if (warning && !warning.acknowledged) {
      return [warning];
    }

    return allWarnings.filter((w) => {
      // Must not be already acknowledged
      if (w.acknowledged) return false;

      // 1. Direct user ID match
      if (activeUserId && w.userId) {
        if (w.userId === activeUserId || w.userId === "all" || w.userId === "*") {
          return true;
        }
      }

      // 2. Direct user name or community group match
      if (activeUserName && w.userName) {
        const warningName = w.userName.trim().toLowerCase();
        const currentName = activeUserName.trim().toLowerCase();
        if (
          warningName === currentName ||
          currentName.includes(warningName) ||
          warningName.includes(currentName) ||
          warningName === "todos" ||
          warningName === "comunidade escolar" ||
          warningName === "família do aluno"
        ) {
          return true;
        }
      }

      // 3. User role match (e.g. 'pais', 'aluno', 'escola')
      if (activeUserRole && w.userRole) {
        if (w.userRole === activeUserRole || w.userRole === "all") {
          return true;
        }
      }

      // 4. Fallback for demo session without strict login
      if (!activeUserId || activeUserId === "user-demo" || activeUserId === "parent-1") {
        if (!w.userRole || w.userRole === "pais" || w.userId === "user-demo" || w.userId === "user-anon-88") {
          return true;
        }
      }

      return false;
    });
  }, [allWarnings, warning, activeUserId, activeUserName, activeUserRole]);

  // Adjust active index if count changes
  const activeWarning = unacknowledgedWarnings[Math.min(currentIndex, Math.max(0, unacknowledgedWarnings.length - 1))];

  if (!activeWarning || unacknowledgedWarnings.length === 0) {
    return null;
  }

  const getSeverityConfig = (severity: UserWarning["severity"]) => {
    switch (severity) {
      case "grave":
        return {
          bg: "bg-rose-50/90 dark:bg-rose-950/40",
          border: "border-rose-300 dark:border-rose-900/70",
          text: "text-rose-950 dark:text-rose-100",
          subtext: "text-rose-900/80 dark:text-rose-200/80",
          badgeBg: "bg-rose-600 text-white",
          iconBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
          btn: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus:ring-rose-500",
          label: "Gravidade Alta"
        };
      case "moderada":
        return {
          bg: "bg-amber-50/90 dark:bg-amber-950/40",
          border: "border-amber-300 dark:border-amber-900/70",
          text: "text-amber-950 dark:text-amber-100",
          subtext: "text-amber-900/80 dark:text-amber-200/80",
          badgeBg: "bg-amber-600 text-white",
          iconBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
          btn: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white focus:ring-amber-500",
          label: "Gravidade Moderada"
        };
      case "leve":
      default:
        return {
          bg: "bg-blue-50/90 dark:bg-blue-950/40",
          border: "border-blue-300 dark:border-blue-900/70",
          text: "text-blue-950 dark:text-blue-100",
          subtext: "text-blue-900/80 dark:text-blue-200/80",
          badgeBg: "bg-blue-600 text-white",
          iconBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
          btn: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500",
          label: "Orientação / Leve"
        };
    }
  };

  const style = getSeverityConfig(activeWarning.severity);
  const totalCount = unacknowledgedWarnings.length;

  return (
    <div id="global-user-warning-banner" className={`w-full mb-6 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeWarning.id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`rounded-2xl border ${style.border} ${style.bg} p-4 sm:p-5 shadow-xs transition-colors`}
          role="alert"
          aria-live="polite"
        >
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            {/* Left Column: Icon + Warning Details */}
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${style.iconBg}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>

              <div className="space-y-2 min-w-0 flex-1">
                {/* Header Labels & Severity Badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase font-mono tracking-wider text-slate-800 dark:text-slate-200">
                    Notificação Institucional de Moderação & Convivência
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${style.badgeBg}`}>
                    {style.label}
                  </span>
                  {totalCount > 1 && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Aviso {currentIndex + 1} de {totalCount}
                    </span>
                  )}
                </div>

                {/* Reason Title */}
                <h4 className={`text-sm sm:text-base font-bold leading-snug ${style.text}`}>
                  {activeWarning.reason}
                </h4>

                {/* Detailed Guidance Message */}
                <p className={`text-xs sm:text-[13px] leading-relaxed ${style.subtext}`}>
                  "{activeWarning.message}"
                </p>

                {/* Quoted Excerpt if associated with a comment or report */}
                {activeWarning.relatedContentSnippet && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 mt-1.5 leading-relaxed">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-0.5 font-mono text-[10px] uppercase">
                      Conteúdo vinculado à análise:
                    </span>
                    <span className="italic">"{activeWarning.relatedContentSnippet}"</span>
                  </div>
                )}

                {/* Issuer & Timestamp metadata */}
                <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 flex flex-wrap items-center gap-2 font-mono">
                  <span>Autoridade: <strong className="text-slate-700 dark:text-slate-300">{activeWarning.issuedBy}</strong></span>
                  <span>•</span>
                  <span>Emitido em: {new Date(activeWarning.issuedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  {activeWarning.userName && (
                    <>
                      <span>•</span>
                      <span>Destinatário: {activeWarning.userName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Actions (Acknowledge & Pagination) */}
            <div className="shrink-0 flex flex-row md:flex-col items-end sm:items-center md:items-end justify-between sm:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/50 dark:border-slate-800/50">
              {/* Pagination controls if multiple warnings exist */}
              {totalCount > 1 && (
                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalCount - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Aviso anterior"
                    aria-label="Aviso anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1 text-slate-500">
                    {currentIndex + 1}/{totalCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => (prev < totalCount - 1 ? prev + 1 : 0))}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Próximo aviso"
                    aria-label="Próximo aviso"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Primary Acknowledge Button */}
              <button
                type="button"
                id={`btn-ack-warning-${activeWarning.id}`}
                onClick={() => onAcknowledge(activeWarning.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-3xs cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[40px] whitespace-nowrap ${style.btn}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Ciência</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
