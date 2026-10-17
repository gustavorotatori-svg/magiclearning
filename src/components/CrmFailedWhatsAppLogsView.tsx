import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  RefreshCw,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  MessageSquare,
  Smartphone,
  Info,
  DollarSign,
  User,
  FileText,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Zap,
  Edit3,
  Check,
  RotateCcw
} from "lucide-react";

export interface WhatsAppFailedLogItem {
  id: string;
  timestamp: string;
  parentName: string;
  studentName: string;
  phone: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  alertType: "nova_fatura" | "lembrete_5d" | "rematricula" | "atraso";
  errorCode: string;
  httpStatus: number;
  errorMessage: string;
  technicalDetails: string;
  payloadPreview: {
    templateName: string;
    recipientPhone: string;
    parameters: Record<string, string>;
  };
  attempts: number;
  lastAttemptAt: string;
  status: "failed" | "retrying" | "retried_success";
}

interface CrmFailedWhatsAppLogsViewProps {
  onToast: (msg: string, type: "success" | "error" | "info") => void;
  onLogAdd?: (type: "info" | "warn" | "error" | "success", message: string, module: string) => void;
}

const DEFAULT_FAILED_LOGS: WhatsAppFailedLogItem[] = [
  {
    id: "wa-fail-101",
    timestamp: "14/08/2026 08:32",
    parentName: "Mariana Silva",
    studentName: "Nicolas Silva",
    phone: "+55 (11) 98765-4321",
    invoiceNumber: "FAT-2026-089",
    amount: 1850.00,
    dueDate: "20/08/2026",
    alertType: "lembrete_5d",
    errorCode: "HTTP_429_RATE_LIMIT",
    httpStatus: 429,
    errorMessage: "Limite de envios por minuto excedido na API Meta WhatsApp Business (Rate Limit Exceeded).",
    technicalDetails: "Meta API Response: { code: 130429, message: 'Rate limit hit. Too many requests sent within 60s window to channel #4' }",
    payloadPreview: {
      templateName: "lembrete_preventivo_v2",
      recipientPhone: "+5511987654321",
      parameters: {
        responsavel: "Mariana Silva",
        aluno: "Nicolas Silva",
        valor: "1850.00",
        vencimento: "20/08/2026"
      }
    },
    attempts: 2,
    lastAttemptAt: "14/08/2026 08:32",
    status: "failed"
  },
  {
    id: "wa-fail-102",
    timestamp: "14/08/2026 07:15",
    parentName: "Ricardo Oliveira",
    studentName: "Theo Oliveira",
    phone: "+55 (11) 97123-0099",
    invoiceNumber: "FAT-2026-092",
    amount: 2100.00,
    dueDate: "18/08/2026",
    alertType: "nova_fatura",
    errorCode: "HTTP_400_INVALID_PHONE",
    httpStatus: 400,
    errorMessage: "Formato de telefone incorreto ou número sem WhatsApp ativo.",
    technicalDetails: "Meta API Response: { code: 131026, message: 'Message undeliverable. Recipient phone number is not a valid WhatsApp user' }",
    payloadPreview: {
      templateName: "nova_fatura_com_pix",
      recipientPhone: "+5511971230099",
      parameters: {
        responsavel: "Ricardo Oliveira",
        aluno: "Theo Oliveira",
        valor: "2100.00",
        vencimento: "18/08/2026"
      }
    },
    attempts: 1,
    lastAttemptAt: "14/08/2026 07:15",
    status: "failed"
  },
  {
    id: "wa-fail-103",
    timestamp: "13/08/2026 18:45",
    parentName: "Fernanda Costa",
    studentName: "Beatriz Costa",
    phone: "+55 (11) 98888-4433",
    invoiceNumber: "FAT-2026-074",
    amount: 2500.00,
    dueDate: "15/08/2026",
    alertType: "rematricula",
    errorCode: "HTTP_503_GATEWAY_TIMEOUT",
    httpStatus: 503,
    errorMessage: "Instabilidade temporária de rede no Gateway de comunicação de terceiros (Timeout > 10s).",
    technicalDetails: "Gateway Error: { status: 503, service: 'Z-API / Evolution WhatsApp Cluster', timeoutMs: 10000 }",
    payloadPreview: {
      templateName: "rematricula_urgente_2027",
      recipientPhone: "+5511988884433",
      parameters: {
        responsavel: "Fernanda Costa",
        aluno: "Beatriz Costa",
        link: "https://magic-learning.edu/rematricula"
      }
    },
    attempts: 3,
    lastAttemptAt: "13/08/2026 18:45",
    status: "failed"
  },
  {
    id: "wa-fail-104",
    timestamp: "13/08/2026 14:10",
    parentName: "Carlos Eduardo Santos",
    studentName: "Gabriel Santos",
    phone: "+55 (11) 96543-8822",
    invoiceNumber: "FAT-2026-061",
    amount: 1450.00,
    dueDate: "10/08/2026",
    alertType: "atraso",
    errorCode: "HTTP_403_OPT_OUT",
    httpStatus: 403,
    errorMessage: "Responsável solicitou opt-out de notificações automáticas via WhatsApp.",
    technicalDetails: "Opt-Out Protection: { user_preference: 'NO_MARKETING_WHATSAPP', blockedAt: '2026-08-10' }",
    payloadPreview: {
      templateName: "cobranca_amigavel_atraso",
      recipientPhone: "+5511965438822",
      parameters: {
        responsavel: "Carlos Eduardo",
        aluno: "Gabriel",
        valor: "1450.00"
      }
    },
    attempts: 1,
    lastAttemptAt: "13/08/2026 14:10",
    status: "failed"
  }
];

export const CrmFailedWhatsAppLogsView: React.FC<CrmFailedWhatsAppLogsViewProps> = ({
  onToast,
  onLogAdd
}) => {
  const [logs, setLogs] = useState<WhatsAppFailedLogItem[]>(() => {
    const saved = localStorage.getItem("school_crm_wa_failed_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_FAILED_LOGS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedErrorCode, setSelectedErrorCode] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [editingPhoneId, setEditingPhoneId] = useState<string | null>(null);
  const [tempPhoneValue, setTempPhoneValue] = useState<string>("");
  const [isRetryingAll, setIsRetryingAll] = useState(false);

  useEffect(() => {
    localStorage.setItem("school_crm_wa_failed_logs", JSON.stringify(logs));
  }, [logs]);

  // Filtered Logs
  const filteredLogs = logs.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      item.parentName.toLowerCase().includes(query) ||
      item.studentName.toLowerCase().includes(query) ||
      item.phone.includes(query) ||
      item.invoiceNumber.toLowerCase().includes(query) ||
      item.errorMessage.toLowerCase().includes(query);

    const matchesCode =
      selectedErrorCode === "all" || item.errorCode === selectedErrorCode;

    const matchesStatus =
      selectedStatusFilter === "all" || item.status === selectedStatusFilter;

    return matchesQuery && matchesCode && matchesStatus;
  });

  // Retry individual message
  const handleRetryIndividual = (logId: string) => {
    const targetLog = logs.find((l) => l.id === logId);
    if (!targetLog) return;

    // Set to retrying
    setLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: "retrying" } : l))
    );

    if (onLogAdd) {
      onLogAdd(
        "info",
        `[WHATSAPP RETRY INITIATED] Reenviando mensagem individual para ${targetLog.parentName} (${targetLog.phone})...`,
        "WHATSAPP_GATEWAY"
      );
    }

    setTimeout(() => {
      const nowStr = new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      setLogs((prev) =>
        prev.map((l) => {
          if (l.id === logId) {
            return {
              ...l,
              status: "retried_success",
              attempts: l.attempts + 1,
              lastAttemptAt: nowStr
            };
          }
          return l;
        })
      );

      onToast(
        `✨ Reenvio WhatsApp concluído com sucesso para ${targetLog.parentName}! Status entregue via API Business.`,
        "success"
      );

      if (onLogAdd) {
        onLogAdd(
          "success",
          `[WHATSAPP RETRY SUCCESS] Mensagem entregue com sucesso para ${targetLog.parentName} (${targetLog.phone}) na tentativa #${targetLog.attempts + 1}!`,
          "WHATSAPP_GATEWAY"
        );
      }
    }, 900);
  };

  // Save phone number edit
  const handleSaveEditedPhone = (logId: string) => {
    if (!tempPhoneValue.trim()) return;
    setLogs((prev) =>
      prev.map((l) => {
        if (l.id === logId) {
          return {
            ...l,
            phone: tempPhoneValue.trim(),
            payloadPreview: {
              ...l.payloadPreview,
              recipientPhone: tempPhoneValue.trim().replace(/\D/g, "")
            }
          };
        }
        return l;
      })
    );
    setEditingPhoneId(null);
    onToast("📱 Telefone do responsável atualizado com sucesso!", "success");
  };

  // Retry all pending failed messages
  const handleRetryAllFailed = () => {
    const pendingFailed = logs.filter((l) => l.status === "failed");
    if (pendingFailed.length === 0) {
      onToast("Não há mensagens com falha pendentes para reenviar.", "info");
      return;
    }

    setIsRetryingAll(true);
    setLogs((prev) =>
      prev.map((l) => (l.status === "failed" ? { ...l, status: "retrying" } : l))
    );

    setTimeout(() => {
      const nowStr = new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      setLogs((prev) =>
        prev.map((l) => {
          if (l.status === "retrying") {
            return {
              ...l,
              status: "retried_success",
              attempts: l.attempts + 1,
              lastAttemptAt: nowStr
            };
          }
          return l;
        })
      );

      setIsRetryingAll(false);
      onToast(
        `🚀 Sucesso! ${pendingFailed.length} mensagens reprocessadas e entregues via WhatsApp Business API!`,
        "success"
      );
    }, 1400);
  };

  // Calculate Metrics
  const totalFailedCount = logs.filter((l) => l.status === "failed").length;
  const totalRecoveredCount = logs.filter((l) => l.status === "retried_success").length;
  const totalRevenueImpact = logs
    .filter((l) => l.status === "failed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 text-left font-sans animate-fade-in">
      {/* HEADER TITLE & METRICS BAR */}
      <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-indigo-500/5 border border-rose-200/80 dark:border-rose-900/40 p-5 rounded-3xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/50 dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-300/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-black text-slate-900 dark:text-slate-100">
                  Logs e Diagnóstico de Falhas no WhatsApp API
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  Monitore disparos interrompidos por rate-limit, instabilidade no gateway ou erros de formato e execute reenvios individuais em tempo real.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRetryAllFailed}
            disabled={isRetryingAll || totalFailedCount === 0}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              totalFailedCount === 0 || isRetryingAll
                ? "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed"
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 hover:scale-102"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetryingAll ? "animate-spin" : ""}`} />
            <span>
              {isRetryingAll
                ? "Reenviando em Lote..."
                : `Reenviar Todas as Falhas (${totalFailedCount})`}
            </span>
          </button>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-rose-200/60 dark:border-slate-800 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider font-mono">
                Mensagens com Falha
              </span>
              <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">
                {totalFailedCount} <span className="text-xs text-slate-400 font-normal">mensagens</span>
              </span>
            </div>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-500 border border-rose-200/60">
              <XCircle className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-200/60 dark:border-slate-800 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider font-mono">
                Reenviadas e Recuperadas
              </span>
              <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {totalRecoveredCount} <span className="text-xs text-slate-400 font-normal">sucesso</span>
              </span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-500 border border-emerald-200/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-amber-200/60 dark:border-slate-800 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider font-mono">
                Receita em Risco (Faturas)
              </span>
              <span className="text-xl font-black font-mono text-amber-700 dark:text-amber-400">
                R$ {totalRevenueImpact.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 border border-amber-200/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTERING & SEARCH TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Text Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por responsável, aluno, telefone ou fatura..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
            />
          </div>

          {/* Error Code Filter */}
          <div className="sm:col-span-4 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedErrorCode}
              onChange={(e) => setSelectedErrorCode(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
            >
              <option value="all">Todos os Motivos de Erro</option>
              <option value="HTTP_429_RATE_LIMIT">HTTP 429 - Rate Limit Exceeded</option>
              <option value="HTTP_400_INVALID_PHONE">HTTP 400 - Telefone Sem WhatsApp</option>
              <option value="HTTP_503_GATEWAY_TIMEOUT">HTTP 503 - Gateway Timeout</option>
              <option value="HTTP_403_OPT_OUT">HTTP 403 - Responsável Opt-Out</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-rose-500/30"
            >
              <option value="all">Todos os Status</option>
              <option value="failed">❌ Apenas Falhas Ativas</option>
              <option value="retried_success">✅ Reenviadas com Sucesso</option>
            </select>
          </div>
        </div>
      </div>

      {/* LOGS TABLE / CARDS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Nenhum log de falha encontrado para os filtros selecionados.
            </p>
            <p className="text-[11px] text-slate-400">
              A fila de envios via WhatsApp API está operando normalmente.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const isEditingPhone = editingPhoneId === log.id;

              return (
                <div
                  key={log.id}
                  className={`transition-colors ${
                    log.status === "retried_success"
                      ? "bg-emerald-50/30 dark:bg-emerald-950/10"
                      : "hover:bg-slate-50/80 dark:hover:bg-slate-850/50"
                  }`}
                >
                  {/* MAIN ROW */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">
                          {log.timestamp}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${
                            log.status === "failed"
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60"
                              : log.status === "retrying"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                          }`}
                        >
                          {log.status === "failed" && "❌ Falha no Disparo"}
                          {log.status === "retrying" && "🔄 Reenviando..."}
                          {log.status === "retried_success" && "✅ Reenviado com Sucesso"}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {log.errorCode} ({log.httpStatus})
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">
                          Fatura: <strong className="text-slate-700 dark:text-slate-200">{log.invoiceNumber}</strong> (R$ {log.amount.toFixed(2)})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                          {log.parentName}
                        </h4>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          Aluno: <strong>{log.studentName}</strong>
                        </span>
                      </div>

                      {/* Phone Display / Edit Inline */}
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {isEditingPhone ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={tempPhoneValue}
                              onChange={(e) => setTempPhoneValue(e.target.value)}
                              className="px-2 py-0.5 text-xs rounded border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditedPhone(log.id)}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer text-[10px]"
                              title="Salvar Telefone"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPhoneId(null)}
                              className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer text-[10px]"
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 font-mono">
                            <span>{log.phone}</span>
                            {log.status === "failed" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPhoneId(log.id);
                                  setTempPhoneValue(log.phone);
                                }}
                                className="text-[10px] text-indigo-600 hover:underline cursor-pointer flex items-center gap-0.5"
                                title="Corrigir Telefone"
                              >
                                <Edit3 className="w-2.5 h-2.5" />
                                <span>Editar</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Error Message Summary */}
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50/50 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{log.errorMessage}</span>
                      </p>
                    </div>

                    {/* Right: Retry Action Button & Expand Toggle */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => handleRetryIndividual(log.id)}
                        disabled={log.status === "retrying"}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          log.status === "retried_success"
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 hover:scale-102"
                        }`}
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            log.status === "retrying" ? "animate-spin text-amber-300" : ""
                          }`}
                        />
                        <span>
                          {log.status === "retried_success"
                            ? "Reenviar Novamente"
                            : log.status === "retrying"
                            ? "Reenviando..."
                            : "Reenviar Mensagem"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all cursor-pointer"
                        title="Ver Detalhes do Payload & Diagnóstico"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDABLE DIAGNOSTICS & PAYLOAD PREVIEW */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200/80 dark:border-slate-800 space-y-3 font-mono text-xs overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Technical Error Details */}
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 space-y-1.5">
                            <span className="text-[10px] font-bold text-rose-600 uppercase block tracking-wider">
                              🔍 Diagnóstico Técnico do Webhook
                            </span>
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 break-words">
                              {log.technicalDetails}
                            </p>
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                              <span>Tentativas anteriores: {log.attempts}</span>
                              <span>Último reenvio: {log.lastAttemptAt}</span>
                            </div>
                          </div>

                          {/* Payload Sent Preview */}
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                📤 Payload Enviado (Meta WhatsApp API)
                              </span>
                              <span className="text-[9px] text-slate-400">
                                Template: {log.payloadPreview.templateName}
                              </span>
                            </div>

                            <pre className="text-[10px] text-slate-800 dark:text-slate-200 bg-slate-100/80 dark:bg-slate-950 p-2 rounded-lg overflow-x-auto max-h-28">
                              {JSON.stringify(log.payloadPreview, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmFailedWhatsAppLogsView;
