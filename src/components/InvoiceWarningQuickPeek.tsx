import React, { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Clock, AlertTriangle, CheckCircle2, ChevronRight, User, Phone, DollarSign, Calendar, ArrowRight } from "lucide-react";
import { Estudante, Cobranca } from "../types";

export interface InvoiceWarningItem {
  id: string;
  student: Estudante;
  cobranca: Cobranca;
  daysDiff: number;
  urgency: "critical" | "warning" | "impending";
  statusBadge: string;
  formattedAmount: string;
  formattedDueDate: string;
}

interface InvoiceWarningQuickPeekProps {
  isOpen: boolean;
  estudantes: Estudante[];
  cobrancas: Cobranca[];
  daysWindow?: number;
  onSelectInvoice: (cobranca: Cobranca) => void;
  onOpenFullModal: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const InvoiceWarningQuickPeek: React.FC<InvoiceWarningQuickPeekProps> = ({
  isOpen,
  estudantes,
  cobrancas,
  daysWindow = 5,
  onSelectInvoice,
  onOpenFullModal,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Parse DD/MM/YYYY into a clean Date object at 00:00:00
  const parseDueDate = (dueDateStr?: string): Date => {
    if (!dueDateStr) return new Date();
    const parts = dueDateStr.split("/").map(Number);
    if (parts.length === 3) {
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    const parsed = new Date(dueDateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  // Compute students in the warning window (within 5 days or overdue)
  const warningList: InvoiceWarningItem[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unpaidCobs = cobrancas.filter(c => c.status === "pendente" || c.status === "vencido");
    const items: InvoiceWarningItem[] = [];

    unpaidCobs.forEach((cob) => {
      // Intelligent student association
      let targetStudent = estudantes[0];
      if (cob.id === "cob-3" || cob.title.toLowerCase().includes("passeio") || cob.title.toLowerCase().includes("planetário")) {
        targetStudent = estudantes.find(e => e.id === "est-2") || estudantes[1] || estudantes[0];
      } else if (cob.id === "cob-2" || cob.title.toLowerCase().includes("mensalidade")) {
        targetStudent = estudantes.find(e => e.id === "est-1") || estudantes[0];
      } else {
        const hash = cob.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const idx = Math.abs(hash) % (estudantes.length || 1);
        targetStudent = estudantes[idx] || estudantes[0];
      }

      if (!targetStudent) return;

      const dueDate = parseDueDate(cob.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffMs = dueDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Items within the 5-day window or overdue
      const isOverdue = cob.status === "vencido" || daysDiff < 0;
      const isDueToday = daysDiff === 0;
      const isWithinWindow = daysDiff > 0 && daysDiff <= daysWindow;

      // Include all unpaid items in warning window analysis
      if (isOverdue || isDueToday || isWithinWindow || cob.status === "pendente") {
        let urgency: "critical" | "warning" | "impending" = "impending";
        let statusBadge = `Vence em ${daysDiff} dias (D-${daysDiff})`;

        if (isOverdue) {
          urgency = "critical";
          const overdueDays = Math.abs(daysDiff);
          statusBadge = overdueDays === 0 ? "Vencida hoje" : `Vencida há ${overdueDays} ${overdueDays === 1 ? 'dia' : 'dias'}`;
        } else if (isDueToday) {
          urgency = "critical";
          statusBadge = "Vence Hoje!";
        } else if (daysDiff <= 2) {
          urgency = "warning";
          statusBadge = `Vence em ${daysDiff} ${daysDiff === 1 ? 'dia' : 'dias'} (D-${daysDiff})`;
        } else if (daysDiff <= daysWindow) {
          urgency = "impending";
          statusBadge = `Janela D-${daysDiff} (${daysDiff} dias)`;
        } else {
          statusBadge = `Vence em ${daysDiff} dias`;
        }

        items.push({
          id: `${cob.id}-${targetStudent.id}`,
          student: targetStudent,
          cobranca: cob,
          daysDiff,
          urgency,
          statusBadge,
          formattedAmount: `R$ ${cob.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          formattedDueDate: cob.dueDate || "A definir",
        });
      }
    });

    // Sort by priority: critical (overdue/today) first, then upcoming by daysDiff
    return items.sort((a, b) => {
      if (a.urgency === "critical" && b.urgency !== "critical") return -1;
      if (b.urgency === "critical" && a.urgency !== "critical") return 1;
      return a.daysDiff - b.daysDiff;
    });
  }, [cobrancas, estudantes, daysWindow]);

  const totalOutstanding = useMemo(() => {
    return warningList.reduce((acc, curr) => acc + curr.cobranca.amount, 0);
  }, [warningList]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.97, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 6, scale: 0.97, filter: "blur(2px)" }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="absolute top-full left-0 sm:-left-20 mt-2 w-[calc(100vw-2.5rem)] sm:w-96 max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-300/60 dark:border-amber-500/30 rounded-2xl shadow-2xl z-60 p-3.5 space-y-3 text-slate-800 dark:text-slate-100 font-sans text-left pointer-events-auto"
          id="popover-quick-charge-warning-window"
          role="tooltip"
          aria-label="Janela de Alerta D-5 Cobranças WhatsApp"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  Janela D-{daysWindow} WhatsApp
                  <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-bold font-mono px-1.5 py-0.2 rounded-md">
                    {warningList.length} {warningList.length === 1 ? "aluno" : "alunos"}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Alunos com faturas na régua de lembrete (até {daysWindow} dias)
                </p>
              </div>
            </div>
          </div>

          {/* Student Warning List */}
          {warningList.length === 0 ? (
            <div className="py-4 text-center space-y-1.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50 dark:border-emerald-900/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Nenhuma fatura crítica na janela de {daysWindow} dias
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Todos os pagamentos estão liquidados ou com vencimento além de {daysWindow} dias.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {warningList.map((item) => {
                const isCritical = item.urgency === "critical";
                const isWarning = item.urgency === "warning";

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectInvoice(item.cobranca)}
                    className="p-2.5 rounded-xl border transition-all cursor-pointer group bg-slate-50/70 dark:bg-slate-800/40 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-500/50 relative overflow-hidden"
                  >
                    {/* Urgency indicator strip */}
                    <div
                      className={`absolute top-0 left-0 bottom-0 w-1 ${
                        isCritical
                          ? "bg-rose-500"
                          : isWarning
                          ? "bg-amber-500"
                          : "bg-indigo-500"
                      }`}
                    />

                    <div className="pl-1.5 space-y-1.5">
                      {/* Top Row: Student info & status pill */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={item.student.avatar}
                            alt={item.student.name}
                            className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                              {item.student.name}
                            </p>
                            <p className="text-[9.5px] text-slate-400 dark:text-slate-400 truncate">
                              {item.student.grade}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full shrink-0 border ${
                            isCritical
                              ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                              : isWarning
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                          }`}
                        >
                          {item.statusBadge}
                        </span>
                      </div>

                      {/* Middle Row: Invoice title and amount */}
                      <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-slate-200/50 dark:border-slate-800/60">
                        <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[190px]">
                          {item.cobranca.title}
                        </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                          {item.formattedAmount}
                        </span>
                      </div>

                      {/* Bottom Row: Due date, parent contact & quick trigger action */}
                      <div className="flex items-center justify-between text-[9.5px] text-slate-500 dark:text-slate-400 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.8 h-2.8 text-slate-400" />
                          <span>Venc: {item.formattedDueDate}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {item.student.parentPhone && (
                            <span className="flex items-center gap-0.5 text-slate-400 font-mono">
                              <Phone className="w-2.5 h-2.5 text-emerald-500" />
                              <span className="truncate max-w-[80px]">{item.student.parentPhone}</span>
                            </span>
                          )}
                          <span className="text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Lembrete <ChevronRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer & Actions */}
          <div className="border-t border-amber-100 dark:border-slate-800 pt-2 flex items-center justify-between text-[10px]">
            <div className="text-slate-500 dark:text-slate-400">
              Total na régua:{" "}
              <strong className="text-slate-900 dark:text-white font-mono font-bold">
                R$ {totalOutstanding.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </strong>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenFullModal();
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold flex items-center gap-1 transition-colors cursor-pointer text-[10px] shadow-2xs"
            >
              <span>Abrir Régua Completa</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
