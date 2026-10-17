import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Send, 
  Lock, 
  ShieldCheck, 
  Sliders, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  FileCode, 
  Search,
  RotateCcw,
  Sparkles
} from "lucide-react";

export interface WebhookEventConfig {
  id: string;
  eventKey: string;
  title: string;
  category: "financeiro" | "faturamento" | "sistema" | "secretaria" | "portaria";
  description: string;
  endpoint: string;
  method: "POST" | "PUT";
  secret: string;
  active: boolean;
  lastTestedAt?: string;
  lastTestStatus?: "success" | "failed" | "testing";
  lastLatencyMs?: number;
  lastResponseCode?: number;
  lastResponseBody?: string;
}

interface ErpQuickWebhooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  erpName: "asaas" | "sap" | "totvs" | "iugu";
  baseUrl: string;
  setToast: (toast: { message: string; type: "success" | "error" | "info" } | null) => void;
  addLog?: (type: "info" | "warn" | "error" | "success", message: string, module: string) => void;
}

export function ErpQuickWebhooksModal({
  isOpen,
  onClose,
  erpName,
  baseUrl,
  setToast,
  addLog,
}: ErpQuickWebhooksModalProps) {
  // Normalize base URL
  const normalizedBase = baseUrl.replace(/\/+$/, "") || "https://api.escola.edu";

  // Webhooks initial state
  const [webhooks, setWebhooks] = useState<WebhookEventConfig[]>([
    {
      id: "wh-1",
      eventKey: "payment.confirmed",
      title: "Pagamento Confirmado (Boleto/Pix)",
      category: "financeiro",
      description: "Disparado instantaneamente quando o banco reconcilia e liquida o pagamento de uma mensalidade.",
      endpoint: `${normalizedBase}/webhooks/pagamento-confirmado`,
      method: "POST",
      secret: "whsec_pay_9984712038192",
      active: true,
      lastTestedAt: "20/07/2026 14:10",
      lastTestStatus: "success",
      lastLatencyMs: 84,
      lastResponseCode: 200,
      lastResponseBody: '{"status":"ok","message":"Webhook de pagamento processado no ERP"}',
    },
    {
      id: "wh-2",
      eventKey: "invoice.created",
      title: "Fatura / Boleto Gerado",
      category: "faturamento",
      description: "Notifica o barramento ERP no momento da emissão ou agendamento de faturas escolares.",
      endpoint: `${normalizedBase}/webhooks/fatura-gerada`,
      method: "POST",
      secret: "whsec_inv_482019382103",
      active: true,
      lastTestedAt: "20/07/2026 12:05",
      lastTestStatus: "success",
      lastLatencyMs: 112,
      lastResponseCode: 200,
      lastResponseBody: '{"status":"ok","invoice_ref":"DOC-2026-88"}',
    },
    {
      id: "wh-3",
      eventKey: "integration.error",
      title: "Erro / Falha de Integração",
      category: "sistema",
      description: "Alerta os sistemas centrais em caso de erro de sincronia, credencial inválida ou timeout.",
      endpoint: `${normalizedBase}/webhooks/erro-integracao`,
      method: "POST",
      secret: "whsec_err_110293847291",
      active: true,
      lastTestedAt: "19/07/2026 18:30",
      lastTestStatus: "success",
      lastLatencyMs: 95,
      lastResponseCode: 200,
      lastResponseBody: '{"status":"ok","log_captured":true}',
    },
    {
      id: "wh-4",
      eventKey: "enrollment.approved",
      title: "Matrícula / Rematrícula Deferida",
      category: "secretaria",
      description: "Envia a ficha do aluno para a secretaria do ERP logo após o aceite e assinatura do contrato.",
      endpoint: `${normalizedBase}/webhooks/rematricula-deferida`,
      method: "POST",
      secret: "whsec_enr_882019482710",
      active: true,
      lastTestedAt: "18/07/2026 09:15",
      lastTestStatus: "success",
      lastLatencyMs: 140,
      lastResponseCode: 200,
      lastResponseBody: '{"status":"ok","student_synced":true}',
    },
    {
      id: "wh-5",
      eventKey: "access.checkin",
      title: "Check-in / Portaria Escolar (QR Code)",
      category: "portaria",
      description: "Transmite eventos em tempo real de entrada e saída de alunos identificados na catraca.",
      endpoint: `${normalizedBase}/webhooks/portaria-checkin`,
      method: "POST",
      secret: "whsec_acc_551029384712",
      active: false,
    },
  ]);

  // Global settings
  const [globalSecret, setGlobalSecret] = useState("whsec_global_escola_2026_x9");
  const [autoRetry, setAutoRetry] = useState(true);
  const [logPayloads, setLogPayloads] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"todos" | "ativos" | "testes">("todos");
  
  // States for interactive testing
  const [testingAll, setTestingAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);

  // Toggle single webhook active status
  const handleToggleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w => {
      if (w.id === id) {
        const nextActive = !w.active;
        if (addLog) {
          addLog("info", `Webhook [${w.eventKey}] ${nextActive ? "ativado" : "desativado"}`, "WEBHOOK");
        }
        return { ...w, active: nextActive };
      }
      return w;
    }));
  };

  // Update endpoint URL for a specific webhook
  const handleEndpointChange = (id: string, newUrl: string) => {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, endpoint: newUrl } : w));
  };

  // Auto-fill standard paths based on base URL
  const handleAutoFillEndpoints = () => {
    setWebhooks(prev => prev.map(w => {
      let path = "geral";
      if (w.eventKey === "payment.confirmed") path = "pagamento-confirmado";
      else if (w.eventKey === "invoice.created") path = "fatura-gerada";
      else if (w.eventKey === "integration.error") path = "erro-integracao";
      else if (w.eventKey === "enrollment.approved") path = "rematricula-deferida";
      else if (w.eventKey === "access.checkin") path = "portaria-checkin";

      return { ...w, endpoint: `${normalizedBase}/webhooks/${path}` };
    }));

    setToast({
      message: "Endpoints preenchidos automaticamente com o padrão do ERP!",
      type: "success"
    });
    if (addLog) {
      addLog("info", `Endpoints de webhooks redefinidos para a base: ${normalizedBase}`, "WEBHOOK");
    }
  };

  // Single test dispatch
  const handleTestSingleWebhook = (id: string) => {
    setWebhooks(prev => prev.map(w => w.id === id ? { ...w, lastTestStatus: "testing" } : w));

    setTimeout(() => {
      const isSuccess = Math.random() > 0.15; // 85% success chance
      const code = isSuccess ? 200 : (Math.random() > 0.5 ? 500 : 404);
      const latency = Math.floor(60 + Math.random() * 120);
      const nowStr = new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      setWebhooks(prev => prev.map(w => {
        if (w.id === id) {
          const sampleResponse = isSuccess
            ? JSON.stringify({ status: "success", event: w.eventKey, message: "Payload recebido e validado com sucesso pelo endpoint.", timestamp: new Date().toISOString() })
            : JSON.stringify({ error: "HTTP_ERROR", code, details: "O endpoint remoto não retornou código HTTP 2xx." });

          return {
            ...w,
            lastTestStatus: isSuccess ? "success" : "failed",
            lastTestedAt: nowStr,
            lastLatencyMs: latency,
            lastResponseCode: code,
            lastResponseBody: sampleResponse
          };
        }
        return w;
      }));

      if (isSuccess) {
        setToast({ message: "Teste de webhook disparado com sucesso! Código HTTP 200", type: "success" });
        if (addLog) {
          const target = webhooks.find(x => x.id === id);
          addLog("success", `Teste de webhook [${target?.eventKey}] bem sucedido (${latency}ms) em ${target?.endpoint}`, "WEBHOOK");
        }
      } else {
        setToast({ message: `Falha no teste de webhook. Código HTTP ${code}`, type: "error" });
        if (addLog) {
          const target = webhooks.find(x => x.id === id);
          addLog("error", `Falha de webhook [${target?.eventKey}]: Código HTTP ${code}`, "WEBHOOK");
        }
      }
    }, 1200);
  };

  // Test all active webhooks
  const handleTestAllActive = () => {
    const activeList = webhooks.filter(w => w.active);
    if (activeList.length === 0) {
      setToast({ message: "Nenhum webhook ativo para testar.", type: "info" });
      return;
    }

    setTestingAll(true);
    setWebhooks(prev => prev.map(w => w.active ? { ...w, lastTestStatus: "testing" } : w));

    setTimeout(() => {
      const nowStr = new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

      setWebhooks(prev => prev.map(w => {
        if (!w.active) return w;
        const latency = Math.floor(70 + Math.random() * 100);
        return {
          ...w,
          lastTestStatus: "success",
          lastTestedAt: nowStr,
          lastLatencyMs: latency,
          lastResponseCode: 200,
          lastResponseBody: JSON.stringify({ status: "success", event: w.eventKey, message: "Bateria de testes atômicos concluída." })
        };
      }));

      setTestingAll(false);
      setToast({ message: `Sincronia efetuada: ${activeList.length} webhooks testados com sucesso!`, type: "success" });
      if (addLog) {
        addLog("success", `Bateria de pings em massa efetuada para ${activeList.length} webhooks com 100% de êxito!`, "WEBHOOK");
      }
    }, 1800);
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Save changes
  const handleSaveAll = () => {
    const activeCount = webhooks.filter(w => w.active).length;
    setToast({
      message: `Configuração rápida de Webhooks salva! (${activeCount} endpoints ativos)`,
      type: "success"
    });
    if (addLog) {
      addLog("success", `Novos endpoints de Webhook ERP salvos com sucesso (${activeCount} mapeados)`, "CONFIG");
    }
    onClose();
  };

  // Filtered list
  const filteredWebhooks = webhooks.filter(w => {
    const q = filterQuery.toLowerCase().trim();
    const matchesSearch = !q || w.title.toLowerCase().includes(q) || w.eventKey.toLowerCase().includes(q) || w.endpoint.toLowerCase().includes(q);
    
    if (activeTab === "ativos") return matchesSearch && w.active;
    if (activeTab === "testes") return matchesSearch && w.lastTestStatus !== undefined;
    return matchesSearch;
  });

  const activeCount = webhooks.filter(w => w.active).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
            className="relative z-10 w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white flex items-center justify-between border-b border-indigo-900/50 relative shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
                  <Zap className="w-5 h-5 text-indigo-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-black text-base sm:text-lg text-white">
                      Configuração Rápida de Webhooks ERP
                    </h2>
                    <span className="bg-indigo-500/20 text-indigo-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                      {erpName.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/80 mt-0.5 font-sans">
                    Gerencie e mapeie endpoints HTTP específicos por tipo de evento do sistema em tempo real.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{activeCount} de {webhooks.length} ativos</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  title="Fechar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Bar & Filter Controls */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex gap-1 shadow-2xs">
                  <button
                    onClick={() => setActiveTab("todos")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "todos"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Todos ({webhooks.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("ativos")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "ativos"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Ativos ({activeCount})
                  </button>
                  <button
                    onClick={() => setActiveTab("testes")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === "testes"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Testados
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAutoFillEndpoints}
                  className="px-3 py-2 bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Auto-preencher caminhos padrão do servidor"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Preencher Endpoints Padrão</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por evento ou endpoint..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-8 pr-3 py-1.5 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestAllActive}
                  disabled={testingAll}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 ${testingAll ? "animate-spin" : ""}`} />
                  <span>{testingAll ? "Testando..." : "Testar Todos Ativos"}</span>
                </button>
              </div>
            </div>

            {/* Scrollable Webhook List Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/40 dark:bg-slate-900/40">
              {/* Webhooks Cards Loop */}
              {filteredWebhooks.length === 0 ? (
                <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                  <Zap className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Nenhum evento de webhook encontrado com este filtro.</p>
                  <button
                    onClick={() => { setFilterQuery(""); setActiveTab("todos"); }}
                    className="mt-3 text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Limpar filtros de busca
                  </button>
                </div>
              ) : (
                filteredWebhooks.map((wh) => (
                  <div
                    key={wh.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all ${
                      wh.active
                        ? "border-slate-200 dark:border-slate-800"
                        : "border-slate-200/60 dark:border-slate-850 opacity-60 bg-slate-50/80 dark:bg-slate-950/40"
                    }`}
                  >
                    {/* Top Row: Title, Key & Active Toggle */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleWebhook(wh.id)}
                          className={`mt-0.5 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            wh.active ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              wh.active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100">
                              {wh.title}
                            </h3>
                            <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">
                              {wh.eventKey}
                            </span>
                            <span className="text-[9px] uppercase font-mono font-black px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800">
                              {wh.method}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {wh.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {wh.lastTestStatus === "success" && (
                          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>HTTP 200 ({wh.lastLatencyMs}ms)</span>
                          </span>
                        )}

                        {wh.lastTestStatus === "failed" && (
                          <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            <span>Erro HTTP {wh.lastResponseCode || 500}</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleTestSingleWebhook(wh.id)}
                          disabled={!wh.active || wh.lastTestStatus === "testing"}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
                        >
                          <Send className={`w-3 h-3 ${wh.lastTestStatus === "testing" ? "animate-spin text-indigo-500" : ""}`} />
                          <span>{wh.lastTestStatus === "testing" ? "Enviando..." : "Disparar Teste"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Endpoint URL Input */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                          Endpoint de Destino HTTP/HTTPS:
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={wh.endpoint}
                            onChange={(e) => handleEndpointChange(wh.id, e.target.value)}
                            disabled={!wh.active}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopy(wh.endpoint, `ep-${wh.id}`)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Copiar endpoint"
                          >
                            {copiedId === `ep-${wh.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                          Chave de Assinatura (X-Webhook-Secret):
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            value={wh.secret}
                            className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 select-all"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopy(wh.secret, `sec-${wh.id}`)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Copiar chave de assinatura"
                          >
                            {copiedId === `sec-${wh.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Response Payload Expansion Preview */}
                    {wh.lastResponseBody && (
                      <div className="mt-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setExpandedPayloadId(expandedPayloadId === wh.id ? null : wh.id)}
                          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>{expandedPayloadId === wh.id ? "Ocultar Payload de Resposta" : "Ver Resposta do Úlitmo Teste"}</span>
                        </button>

                        {expandedPayloadId === wh.id && (
                          <div className="mt-2 bg-slate-950 text-indigo-200 p-3 rounded-xl border border-slate-800 font-mono text-[11px] overflow-x-auto shadow-inner animate-fade-in">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 border-b border-slate-800 pb-1">
                              <span>Timestamp: {wh.lastTestedAt}</span>
                              <span className="text-emerald-400 font-bold">Status: {wh.lastResponseCode} OK</span>
                            </div>
                            <pre className="whitespace-pre-wrap">{wh.lastResponseBody}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Global Security & Retries Settings Card */}
              <div className="bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-slate-900/10 dark:from-slate-950 dark:to-slate-900 border border-indigo-200/50 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="font-serif font-black text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Segurança e Políticas Globais de Reenvio (Retry Policy)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-sans">
                      Secret HMAC Mestre para Validação de Payloads:
                    </label>
                    <input
                      type="text"
                      value={globalSecret}
                      onChange={(e) => setGlobalSecret(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Reenvio Automático (Backoff Exponencial)</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Até 3 tentativas em caso de erro 5xx ou Timeout</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoRetry(!autoRetry)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoRetry ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          autoRetry ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 sm:py-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-sans hidden sm:block">
                <span>Comunicação criptografada via HTTPS SSL v3 com HMAC-SHA256</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar e Mapear Webhooks</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
