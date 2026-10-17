import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Lightbulb, 
  Bell, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Check, 
  Sparkles, 
  ChevronRight, 
  Info,
  Clock,
  ArrowRight,
  MessageSquare,
  Mail,
  Smartphone,
  Sliders,
  Send,
  CheckCircle2,
  Zap,
  RefreshCw
} from "lucide-react";
import { Cobranca } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

interface DicasFinanceirasModalProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancas: Cobranca[];
  onConfigureReminder: (cob: Cobranca) => void;
  onSimulateThreeDaysDue: () => void;
  isDarkMode: boolean;
  branding?: {
    primaryColor?: string;
  };
}

const EMPTY_COBRANCAS: Cobranca[] = [];

export const DicasFinanceirasModal: React.FC<DicasFinanceirasModalProps> = ({
  isOpen,
  onClose,
  cobrancas = EMPTY_COBRANCAS,
  onConfigureReminder,
  onSimulateThreeDaysDue,
  isDarkMode,
  branding
}) => {
  const primaryColor = branding?.primaryColor || "#3b82f6";

  // Form states
  const [selectedChannel, setSelectedChannel] = useState<"whatsapp" | "email" | "sms" | "push">("whatsapp");
  const [selectedCobIds, setSelectedCobIds] = useState<string[]>([]);
  const [dispatchTime, setDispatchTime] = useState<string>("09:00");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculate pending invoices that mature/expire in <= 3 days (0 to 3 days inclusively)
  const pendingInvoices3Days = useMemo(() => {
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

      // Vencem em até 3 dias (0 a 3 dias inclusos)
      return diffDays >= 0 && diffDays <= 3;
    });
  }, [cobrancas]);

  // Sync selected IDs when pending list changes
  useEffect(() => {
    if (!isOpen) return;
    const newIds = pendingInvoices3Days.map(c => c.id);
    setSelectedCobIds(prev => {
      if (prev.length === newIds.length && prev.every((id, idx) => id === newIds[idx])) {
        return prev;
      }
      return newIds;
    });
  }, [isOpen, pendingInvoices3Days]);

  // Other near due invoices (between 4 and 5 days) for completeness
  const otherNearDueInvoices = useMemo(() => {
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

      return diffDays > 3 && diffDays <= 5;
    });
  }, [cobrancas]);

  // Toggle single billing selection
  const handleToggleInvoice = (id: string) => {
    if (selectedCobIds.includes(id)) {
      setSelectedCobIds(selectedCobIds.filter(item => item !== id));
    } else {
      setSelectedCobIds([...selectedCobIds, id]);
    }
  };

  // Submit quick alert alerts to CRM
  const handleConfigureCRMAlerts = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCobIds.length === 0) {
      setToastMessage("Selecione ao menos uma fatura para configurar.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsSubmitting(true);

    // Simulate CRM transmission and local calendar scheduling
    setTimeout(() => {
      selectedCobIds.forEach(id => {
        const cob = pendingInvoices3Days.find(c => c.id === id);
        if (cob) {
          // Trigger original reminder configuration
          onConfigureReminder(cob);
        }
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      // Save custom scheduler config to localStorage
      const customReminders = selectedCobIds.map(id => {
        const cob = pendingInvoices3Days.find(c => c.id === id);
        return {
          id: `crm-3d-${id}-${Date.now()}`,
          cobrancaId: id,
          cobrancaTitle: cob?.title || "Fatura Escolar",
          dueDate: cob?.dueDate || "",
          amount: cob?.amount || 0,
          channel: selectedChannel,
          daysBefore: 3,
          scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
          status: "agendado" as const
        };
      });

      try {
        const existingStr = localStorage.getItem("school_scheduled_reminders");
        const existing = existingStr ? JSON.parse(existingStr) : [];
        localStorage.setItem("school_scheduled_reminders", JSON.stringify([...customReminders, ...existing]));
      } catch (e) {
        // ignore
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }, 1500);
  };

  // Healthy financial tips
  const tips = [
    {
      id: "tip-1",
      title: "Desconto por Pontualidade 📉",
      description: "A instituição concede desconto de 5% em mensalidades quitadas até o 5º dia útil do mês. Programe os alertas para reter o benefício!",
      icon: TrendingUp,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      id: "tip-2",
      title: "Alertas Automáticos no WhatsApp 📱",
      description: "Deixar o CRM configurado para disparar no WhatsApp aumenta as taxas de adimplência em até 84%, mantendo pais informados sem desgaste.",
      icon: Bell,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-y-auto" 
          id="dicas-financeiras-modal"
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 bg-[#fdfcf7] dark:bg-slate-900 border border-amber-200/40 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left"
          >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-slate-950 dark:to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-white/15 text-amber-250">
              <Lightbulb className="w-5 h-5 text-amber-350 animate-pulse" />
            </span>
            <div>
              <span className="text-[9px] font-black tracking-widest uppercase text-amber-250 font-mono block">Inteligência de Caixa</span>
              <h2 className="text-base sm:text-lg font-serif font-black flex items-center gap-1.5">
                <span>Dicas & Alertas Rápidos (3 Dias)</span>
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-white/80 hover:text-white"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TOAST NOTIFICATION FOR VALIDATION */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-rose-600 text-white p-3 rounded-xl text-xs font-bold text-center"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* DYNAMIC SUCCESS STATUS */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-5 rounded-2xl text-center space-y-3"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Alerta Configurado no CRM!</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal max-w-sm mx-auto mt-1">
                    Os agendamentos foram integrados com sucesso. Os responsáveis pedagógicos receberão lembretes automáticos sobre estes vencimentos {selectedChannel === "whatsapp" ? "via WhatsApp" : `via ${selectedChannel.toUpperCase()}`} em até 3 dias antes.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSuccess && (
            <>
              {/* PRIMARY PANEL: INTERACTIVE CRM 3-DAY REMINDER CONFIG */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Alertas Rápidos (Vencimento nos Próximos 3 Dias)
                  </h3>
                  <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black uppercase font-mono border border-indigo-100 dark:border-indigo-900/40">
                    CRM Ativo
                  </span>
                </div>

                {pendingInvoices3Days.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl text-center space-y-4">
                    <div className="max-w-md mx-auto space-y-1.5">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-400">
                        <Info className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum vencimento nos próximos 3 dias</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-light">
                        Não detectamos nenhuma cobrança pendente que vença nos próximos 3 dias. Excelente! Caso deseje simular um vencimento curto para testar a interface do CRM, utilize o botão de simulação rápida abaixo.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-150 dark:border-slate-850/60 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={onSimulateThreeDaysDue}
                        className="bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-amber-900 dark:text-amber-300 px-4 py-2 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Simular Vencimento em 3 Dias 🧪</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleConfigureCRMAlerts} className="bg-[#fafbfd] dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl space-y-4 shadow-3xs">
                    
                    {/* Invoice checklists */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Selecione as cobranças pendentes</label>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {pendingInvoices3Days.map((cob) => {
                          const isChecked = selectedCobIds.includes(cob.id);
                          return (
                            <div 
                              key={cob.id}
                              onClick={() => handleToggleInvoice(cob.id)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                                isChecked 
                                  ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-250 dark:border-indigo-900" 
                                  : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-850 hover:border-slate-250"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                                  isChecked 
                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                }`}>
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <div className="min-w-0">
                                  <strong className="font-bold text-slate-850 dark:text-slate-100 truncate block">
                                    {cob.title}
                                  </strong>
                                  <span className="text-[10px] text-slate-450 dark:text-slate-400 block mt-0.5">
                                    Valor: R$ {cob.amount.toFixed(2)} • Vencimento: {cob.dueDate}
                                  </span>
                                </div>
                              </div>

                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shrink-0">
                                Vence em breve ⏳
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Channel selection and time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Select CRM Channel */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Canal do CRM</label>
                        <div className="grid grid-cols-2 xs:grid-cols-4 gap-1">
                          {[
                            { id: "whatsapp", icon: <MessageSquare className="w-3.5 h-3.5" />, title: "Whats" },
                            { id: "email", icon: <Mail className="w-3.5 h-3.5" />, title: "Email" },
                            { id: "sms", icon: <Smartphone className="w-3.5 h-3.5" />, title: "SMS" },
                            { id: "push", icon: <Bell className="w-3.5 h-3.5" />, title: "App" },
                          ].map(ch => (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => setSelectedChannel(ch.id as any)}
                              className={`py-2 rounded-lg text-[9.5px] font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                                selectedChannel === ch.id 
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-3xs" 
                                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                              }`}
                            >
                              {ch.icon}
                              <span>{ch.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dispatch time preference */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Horário de Envio Recomendado</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                          <input 
                            type="time" 
                            value={dispatchTime}
                            onChange={(e) => setDispatchTime(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl p-2 pl-9 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <span className="text-[8px] text-slate-400 block leading-tight">
                          Disparos programados para horários úteis para maximizar visualização dos pais.
                        </span>
                      </div>

                    </div>

                    {/* Integrated feedback information */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-150 dark:border-slate-850 text-[10px] text-slate-500 flex items-start gap-2 leading-relaxed">
                      <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>
                        Este alerta disparará uma mensagem personalizada via <strong>{selectedChannel.toUpperCase()}</strong> no dia selecionado com o código Pix, instruindo o pagamento imediato e registrando a interação no histórico do CRM.
                      </span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || selectedCobIds.length === 0}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400/70 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sincronizando com CRM...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Ativar Alerta Automático no CRM ({selectedCobIds.length})</span>
                        </>
                      )}
                    </button>

                  </form>
                )}
              </div>

              {/* LIST OF INVOICES WITH > 3 AND <= 5 DAYS LEFT */}
              {otherNearDueInvoices.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Outras faturas vencendo em breve (4 a 5 Dias)
                  </h4>
                  <div className="space-y-1.5">
                    {otherNearDueInvoices.map((cob) => (
                      <div 
                        key={cob.id}
                        className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <strong className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                            {cob.title}
                          </strong>
                          <span className="text-[9.5px] text-slate-400 block font-mono">
                            R$ {cob.amount.toFixed(2)} • Vence em {cob.dueDate}
                          </span>
                        </div>
                        <button
                          onClick={() => onConfigureReminder(cob)}
                          className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950 text-slate-650 dark:text-slate-300 font-bold px-2.5 py-1.5 rounded-lg text-[9.5px] transition-colors cursor-pointer"
                        >
                          Lembrar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HISTORICAL DELINQUENCY CHART */}
              <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 space-y-3 shadow-3xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-800 dark:text-slate-200 tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                      Taxa de Inadimplência Recente
                    </h3>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">
                      Impacto positivo do disparo de avisos e integração com o CRM.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-extrabold px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                    -70.8% este mês 🎉
                  </span>
                </div>

                <div className="h-32 w-full font-mono text-[9px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { mes: "Maio", taxa: 7.2 },
                        { mes: "Junho", taxa: 4.8 },
                        { mes: "Julho (Atual)", taxa: 2.1 }
                      ]}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis 
                        dataKey="mes" 
                        stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        unit="%"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
                          border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
                          borderRadius: "12px",
                          fontSize: "10px",
                          color: isDarkMode ? "#f8fafc" : "#0f172a"
                        }}
                        formatter={(value: any) => [`${value}%`, "Taxa"]}
                      />
                      <Bar 
                        dataKey="taxa" 
                        fill={primaryColor} 
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                      >
                        {[
                          { mes: "Maio", taxa: 7.2 },
                          { mes: "Junho", taxa: 4.8 },
                          { mes: "Julho (Atual)", taxa: 2.1 }
                        ].map((entry, index) => {
                          // Green for current, orange/red for older
                          const fill = index === 2 
                            ? "#10b981" 
                            : index === 1 
                            ? "#f59e0b" 
                            : "#f43f5e";
                          return <Cell key={`cell-${index}`} fill={fill} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-150 dark:border-slate-850/80 text-[9.5px] text-slate-500 flex items-center justify-between font-sans">
                  <span>Maio (S/ CRM): <strong>7.2%</strong></span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>Junho (Pré-CRM): <strong>4.8%</strong></span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span>Julho (Com CRM): <strong className="text-emerald-600 dark:text-emerald-400 font-bold">2.1%</strong></span>
                </div>
              </div>

              {/* EDUCATIONAL TIPS */}
              <div className="space-y-2 pt-1">
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> Dicas da Coordenação Financeira
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tips.map((tip) => (
                    <div 
                      key={tip.id} 
                      className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl p-3.5 flex items-start gap-2.5 shadow-3xs"
                    >
                      <div className={`p-1.5 rounded-lg ${tip.color} shrink-0`}>
                        <tip.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {tip.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal font-light">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-150 dark:border-slate-850 flex items-center justify-between shrink-0">
          <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono">
            Disparos em conformidade com LGPD.
          </span>
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-extrabold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Entendido ✓
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};
