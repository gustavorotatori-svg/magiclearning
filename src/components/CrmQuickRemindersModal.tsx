import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Clock,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  Edit3,
  X,
  Search,
  Filter,
  DollarSign,
  Smartphone,
  Mail,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Calendar,
  Check,
  ChevronRight
} from "lucide-react";

export interface ScheduledReminderItem {
  id: string;
  studentId?: string;
  studentName: string;
  avatar?: string;
  parentName: string;
  phone?: string;
  email?: string;
  cobrancaId?: string;
  cobrancaTitle: string;
  amount: number;
  scheduledDate: string;
  scheduledTime: string;
  channel: "whatsapp" | "email" | "sms" | "ambos";
  customMessage: string;
  status: "agendado" | "enviado" | "cancelado";
  createdAt: string;
}

interface CrmQuickRemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
  onAddNotification?: (title: string, body: string, type?: string) => void;
  onNavigateToCrm?: () => void;
}

const DEFAULT_INITIAL_REMINDERS: ScheduledReminderItem[] = [
  {
    id: "sch-1",
    studentId: "est-1",
    studentName: "Lucas Silva",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150",
    parentName: "Roberto Silva",
    phone: "(11) 98765-4321",
    email: "roberto.silva@email.com",
    cobrancaId: "cob-1",
    cobrancaTitle: "Mensalidade Escolar Julho",
    amount: 1450.00,
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "09:00",
    channel: "whatsapp",
    customMessage: "Olá Roberto, lembrete amigável referente à mensalidade escolar de Lucas Silva (R$ 1.450,00). Acesse seu portal para emitir a 2ª via PIX.",
    status: "agendado",
    createdAt: "28/07/2026"
  },
  {
    id: "sch-2",
    studentId: "est-2",
    studentName: "Mariana Costa",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    parentName: "Juliana Costa",
    phone: "(11) 97654-3210",
    email: "juliana.costa@email.com",
    cobrancaId: "cob-2",
    cobrancaTitle: "Taxa de Material Didático Bilingue",
    amount: 380.00,
    scheduledDate: new Date().toISOString().split("T")[0],
    scheduledTime: "14:30",
    channel: "email",
    customMessage: "Prezada Juliana, o lembrete de pagamento do material didático de Mariana foi agendado. Confira o boleto em anexo.",
    status: "agendado",
    createdAt: "29/07/2026"
  },
  {
    id: "sch-3",
    studentId: "est-3",
    studentName: "Enzo Gabriel Santos",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    parentName: "Carlos Santos",
    phone: "(11) 96543-2109",
    email: "carlos.santos@email.com",
    cobrancaId: "cob-3",
    cobrancaTitle: "Atividade Extracurricular de Robótica",
    amount: 220.00,
    scheduledDate: "2026-08-05",
    scheduledTime: "10:00",
    channel: "whatsapp",
    customMessage: "Olá Carlos, lembrete da mensalidade da Oficina de Robótica do Enzo.",
    status: "enviado",
    createdAt: "25/07/2026"
  }
];

export const CrmQuickRemindersModal: React.FC<CrmQuickRemindersModalProps> = ({
  isOpen,
  onClose,
  onToast,
  onAddNotification,
  onNavigateToCrm
}) => {
  const [reminders, setReminders] = useState<ScheduledReminderItem[]>(() => {
    try {
      const saved1 = localStorage.getItem("school_scheduled_billing_reminders");
      if (saved1) return JSON.parse(saved1);

      const saved2 = localStorage.getItem("school_scheduled_reminders");
      if (saved2) {
        const parsed = JSON.parse(saved2);
        return parsed.map((item: any) => ({
          id: item.id || `sch-${Date.now()}`,
          studentName: item.cobrancaTitle || "Aluno",
          parentName: "Responsável Financeiro",
          cobrancaTitle: item.cobrancaTitle || "Cobrança Escolar",
          amount: item.amount || 0,
          scheduledDate: item.dueDate || new Date().toISOString().split("T")[0],
          scheduledTime: "09:00",
          channel: item.channel || "whatsapp",
          customMessage: `Lembrete agendado de cobrança no valor de R$ ${(item.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          status: item.status || "agendado",
          createdAt: new Date().toLocaleDateString("pt-BR")
        }));
      }
    } catch (e) {
      console.warn("Failed loading scheduled reminders:", e);
    }
    return DEFAULT_INITIAL_REMINDERS;
  });

  const [filterTab, setFilterTab] = useState<"pendentes" | "enviados" | "todos">("pendentes");
  const [channelFilter, setChannelFilter] = useState<"todos" | "whatsapp" | "email" | "sms">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExecutingAll, setIsExecutingAll] = useState(false);
  const [executingId, setExecutingId] = useState<string | null>(null);

  // New Reminder Form Toggle & States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newParentName, setNewParentName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("09:00");
  const [newChannel, setNewChannel] = useState<"whatsapp" | "email" | "sms" | "ambos">("whatsapp");
  const [newMessage, setNewMessage] = useState("");

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editMessage, setEditMessage] = useState("");

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("school_scheduled_billing_reminders", JSON.stringify(reminders));
    } catch (e) {
      console.warn("Error saving scheduled reminders:", e);
    }
  }, [reminders]);

  // Sync window storage events
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("school_scheduled_billing_reminders");
        if (saved) setReminders(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const pendingCount = reminders.filter((r) => r.status === "agendado").length;
  const sentCount = reminders.filter((r) => r.status === "enviado").length;
  const pendingTotalValue = reminders
    .filter((r) => r.status === "agendado")
    .reduce((acc, r) => acc + (r.amount || 0), 0);

  // Filter logic
  const filteredReminders = reminders.filter((item) => {
    if (filterTab === "pendentes" && item.status !== "agendado") return false;
    if (filterTab === "enviados" && item.status !== "enviado") return false;
    if (channelFilter !== "todos" && item.channel !== channelFilter && item.channel !== "ambos") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchStudent = item.studentName.toLowerCase().includes(q);
      const matchParent = item.parentName.toLowerCase().includes(q);
      const matchTitle = item.cobrancaTitle.toLowerCase().includes(q);
      return matchStudent || matchParent || matchTitle;
    }
    return true;
  });

  // Execute single reminder immediately
  const handleExecuteNow = (id: string) => {
    setExecutingId(id);
    const item = reminders.find((r) => r.id === id);

    setTimeout(() => {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "enviado" as const } : r))
      );
      setExecutingId(null);

      if (item) {
        onToast(`⚡ Lembrete para ${item.studentName} disparado com sucesso via ${item.channel.toUpperCase()}!`, "success");
        if (onAddNotification) {
          onAddNotification(
            `⚡ Disparo CRM Concluído: ${item.cobrancaTitle}`,
            `Lembrete financeiro de R$ ${item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} enviado para ${item.parentName}.`,
            "faturamento"
          );
        }
      }
    }, 800);
  };

  // Execute all pending reminders in batch
  const handleExecuteAllPending = () => {
    const pendingItems = reminders.filter((r) => r.status === "agendado");
    if (pendingItems.length === 0) {
      onToast("Não existem lembretes pendentes para execução imediata.", "info");
      return;
    }

    setIsExecutingAll(true);
    setTimeout(() => {
      setReminders((prev) =>
        prev.map((r) => (r.status === "agendado" ? { ...r, status: "enviado" as const } : r))
      );
      setIsExecutingAll(false);
      onToast(`🚀 Disparo em Lote: ${pendingItems.length} lembrete(s) CRM financeiros executados!`, "success");

      if (onAddNotification) {
        onAddNotification(
          "🚀 Disparo em Lote CRM Finalizado",
          `Todos os ${pendingItems.length} lembretes financeiros pendentes foram transmitidos com sucesso aos responsáveis.`,
          "faturamento"
        );
      }
    }, 1400);
  };

  // Delete item
  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    onToast("Lembrete agendado removido.", "info");
  };

  // Create new reminder
  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newTitle.trim() || !newAmount) {
      onToast("Por favor, preencha os campos obrigatórios.", "error");
      return;
    }

    const newItem: ScheduledReminderItem = {
      id: `sch-${Date.now()}`,
      studentName: newStudentName.trim(),
      parentName: newParentName.trim() || "Responsável",
      cobrancaTitle: newTitle.trim(),
      amount: parseFloat(newAmount) || 0,
      scheduledDate: newDate,
      scheduledTime: newTime,
      channel: newChannel,
      customMessage: newMessage.trim() || `Lembrete referente a ${newTitle.trim()} no valor de R$ ${parseFloat(newAmount).toFixed(2)}.`,
      status: "agendado",
      createdAt: new Date().toLocaleDateString("pt-BR")
    };

    setReminders((prev) => [newItem, ...prev]);
    setShowCreateForm(false);
    setNewStudentName("");
    setNewParentName("");
    setNewTitle("");
    setNewAmount("");
    setNewMessage("");
    onToast("Novo lembrete financeiro adicionado à fila do CRM!", "success");
  };

  // Start editing
  const handleStartEdit = (item: ScheduledReminderItem) => {
    setEditingId(item.id);
    setEditDate(item.scheduledDate);
    setEditTime(item.scheduledTime);
    setEditMessage(item.customMessage);
  };

  // Save editing
  const handleSaveEdit = (id: string) => {
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              scheduledDate: editDate,
              scheduledTime: editTime,
              customMessage: editMessage
            }
          : r
      )
    );
    setEditingId(null);
    onToast("Agendamento atualizado com sucesso!", "success");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white flex items-center justify-between border-b border-indigo-900/50 relative">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 shrink-0 shadow-xs">
                <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-black text-base sm:text-lg text-white tracking-wide">
                    Lembretes Financeiros do CRM
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/30 text-[10px] font-bold font-mono uppercase tracking-wider">
                    Execução Imediata
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200/80 mt-0.5">
                  Gerencie e meça disparos agendados de cobranças educacionais.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Fechar Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats & Action Banner */}
          <div className="bg-slate-50 dark:bg-slate-950/50 p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
              <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pendentes</span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                  {pendingCount} item(ns)
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Enviados</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {sentCount} disparado(s)
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Valor Pendente</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  R$ {pendingTotalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExecuteAllPending}
                disabled={isExecutingAll || pendingCount === 0}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  pendingCount > 0
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold border border-amber-400 hover:scale-102 active:scale-98"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isExecutingAll ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>Executando...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                    <span>Disparar {pendingCount} Pendente(s)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agendar Novo</span>
              </button>
            </div>
          </div>

          {/* Creation Form Accordion */}
          <AnimatePresence>
            {showCreateForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateReminder}
                className="bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-200 dark:border-indigo-900/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Agendar Novo Lembrete Financeiro no CRM</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Nome do Aluno *</label>
                    <input
                      type="text"
                      placeholder="Ex: Pedro Henrique"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Responsável</label>
                    <input
                      type="text"
                      placeholder="Ex: Maria Fernandes"
                      value={newParentName}
                      onChange={(e) => setNewParentName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Título da Cobrança *</label>
                    <input
                      type="text"
                      placeholder="Ex: Mensalidade Agosto"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Valor (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="1450.00"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Data Agendada</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Horário</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Canal de Transmissão</label>
                    <select
                      value={newChannel}
                      onChange={(e: any) => setNewChannel(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="whatsapp">📱 WhatsApp</option>
                      <option value="email">✉️ E-mail</option>
                      <option value="sms">💬 SMS</option>
                      <option value="ambos">✨ Todos os canais</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Mensagem Personalizada</label>
                  <textarea
                    rows={2}
                    placeholder="Olá, lembrete amigável referente à mensalidade escolar..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Salvar na Fila do CRM
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Filter Bar */}
          <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
              <button
                onClick={() => setFilterTab("pendentes")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === "pendentes"
                    ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Pendentes ({pendingCount})
              </button>
              <button
                onClick={() => setFilterTab("enviados")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === "enviados"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Enviados ({sentCount})
              </button>
              <button
                onClick={() => setFilterTab("todos")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === "todos"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Todos ({reminders.length})
              </button>
            </div>

            {/* Search and Channel */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por aluno ou cobrança..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 w-44 sm:w-56 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={channelFilter}
                onChange={(e: any) => setChannelFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300"
              >
                <option value="todos">Todos Canais</option>
                <option value="whatsapp">📱 WhatsApp</option>
                <option value="email">✉️ E-mail</option>
                <option value="sms">💬 SMS</option>
              </select>
            </div>
          </div>

          {/* List of Scheduled Reminders */}
          <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2.5">
            {filteredReminders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500">
                <Clock className="w-10 h-10 mx-auto mb-2 opacity-40 animate-pulse" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nenhum lembrete financeiro encontrado
                </p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                  Utilize o botão "Agendar Novo" acima ou acesse o CRM de cobranças para agendar avisos automáticos aos pais.
                </p>
              </div>
            ) : (
              filteredReminders.map((item) => {
                const isPending = item.status === "agendado";
                const isEditingThis = editingId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isPending
                        ? "bg-amber-50/20 dark:bg-amber-950/10 border-amber-200/80 dark:border-amber-900/40 hover:border-amber-300"
                        : "bg-slate-50/50 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-90"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Info */}
                      <div className="flex items-start gap-3 min-w-0">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.studentName}
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-amber-300 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300">
                            {item.studentName.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 truncate">
                              {item.studentName}
                            </h4>
                            <span className="text-[10px] text-slate-400">({item.parentName})</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono border ${
                                isPending
                                  ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800"
                                  : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800"
                              }`}
                            >
                              {isPending ? "Agendado" : "Disparado ✓"}
                            </span>
                          </div>

                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {item.cobrancaTitle} —{" "}
                            <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                              R$ {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-600" />
                              {item.scheduledDate} às {item.scheduledTime}
                            </span>

                            <span className="flex items-center gap-1 uppercase font-semibold">
                              {item.channel === "whatsapp" && <Smartphone className="w-3 h-3 text-emerald-600" />}
                              {item.channel === "email" && <Mail className="w-3 h-3 text-indigo-600" />}
                              {item.channel === "sms" && <MessageSquare className="w-3 h-3 text-amber-600" />}
                              {item.channel === "ambos" && <Sparkles className="w-3 h-3 text-amber-500" />}
                              {item.channel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {isPending && (
                          <button
                            onClick={() => handleExecuteNow(item.id)}
                            disabled={executingId === item.id}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
                            title="Disparar este lembrete agora"
                          >
                            {executingId === item.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                            )}
                            <span>Disparar Agora</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Editar Agendamento"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteReminder(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Excluir Lembrete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Editor */}
                    {isEditingThis && (
                      <div className="mt-3 p-3 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Nova Data</label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Novo Horário</label>
                            <input
                              type="time"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Mensagem</label>
                          <textarea
                            rows={2}
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                            className="w-full text-xs p-1.5 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-xs text-slate-500 hover:underline cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Salvar Alterações
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Sincronizado automaticamente com o CRM financeiro e régua de cobrança.
            </span>

            {onNavigateToCrm && (
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCrm();
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                Abrir Painel Completo do CRM <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
