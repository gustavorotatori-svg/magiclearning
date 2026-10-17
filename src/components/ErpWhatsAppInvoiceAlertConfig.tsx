import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CrmFailedWhatsAppLogsView } from "./CrmFailedWhatsAppLogsView";
import {
  MessageSquare,
  Smartphone,
  Zap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  Settings,
  Database,
  Filter,
  Copy,
  Clock,
  Sparkles,
  Send,
  RefreshCw,
  Sliders,
  DollarSign,
  FileText,
  ShieldCheck,
  Calendar,
  Check,
  ChevronRight,
  Info,
  Layers,
  Bell,
  BellRing,
  RotateCcw,
  Tag,
  Repeat
} from "lucide-react";

export interface ErpWhatsAppInvoiceAlertConfigProps {
  erpName?: "asaas" | "sap" | "totvs" | "iugu" | "generic";
  estudantes?: any[];
  onToast: (msg: string, type: "success" | "error" | "info") => void;
  onLogAdd?: (type: "info" | "warn" | "error" | "success", message: string, module: string) => void;
}

interface SimulatedDispatchLog {
  id: string;
  timestamp: string;
  parentName: string;
  studentName: string;
  amount: number;
  dueDate: string;
  erpSource: string;
  invoiceNumber: string;
  whatsappStatus: "delivered" | "read" | "pending" | "failed";
  phone: string;
  alertType?: "nova_fatura" | "lembrete_5d" | "atraso";
}

export const ErpWhatsAppInvoiceAlertConfig: React.FC<ErpWhatsAppInvoiceAlertConfigProps> = ({
  erpName = "asaas",
  estudantes = [],
  onToast,
  onLogAdd
}) => {
  const [activeLogTab, setActiveLogTab] = useState<"success_history" | "failed_logs">("success_history");

  // Config States - New Invoices
  const [activeAlert, setActiveAlert] = useState<boolean>(() => {
    const val = localStorage.getItem("school_erp_wa_active");
    return val === null ? true : val === "true";
  });

  const [selectedErpSource, setSelectedErpSource] = useState<string>(erpName);
  const [triggerCondition, setTriggerCondition] = useState<"instant" | "business_hours" | "delayed_30m">("instant");
  const [minInvoiceValue, setMinInvoiceValue] = useState<number>(0);
  const [invoiceCategoryFilter, setInvoiceCategoryFilter] = useState<"all" | "mensalidade" | "material" | "rematricula">("all");
  
  // WhatsApp Message Customization - New Invoices
  const [waTemplate, setWaTemplate] = useState<string>(() => {
    const saved = localStorage.getItem("school_erp_wa_template");
    return (
      saved ||
      "Olá, {NOME_RESPONSAVEL}! 👋\nA escola {NOME_ESCOLA} informa que a fatura de {NOME_ALUNO} referente ao mês de {MES_REFERENCIA} (Vencimento: {DATA_VENCIMENTO}) no valor de R$ {VALOR_FATURA} já foi lançada no sistema.\n\nPara sua comodidade, utilize o Código PIX Copia e Cola abaixo ou acesse o boleto completo pelo link:\n🔗 {LINK_PIX}\n\nAgradecemos a parceria!"
    );
  });

  const [includePixCopyPaste, setIncludePixCopyPaste] = useState<boolean>(true);
  const [includePdfButton, setIncludePdfButton] = useState<boolean>(true);
  const [onlyValidatedPhones, setOnlyValidatedPhones] = useState<boolean>(true);

  // AUTOMATED PRE-DUE REMINDER CONFIGURATION (< 5 DIAS DO VENCIMENTO)
  const [autoReminder5dEnabled, setAutoReminder5dEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_auto_reminder_5d_enabled");
    return val === null ? true : val === "true";
  });

  const [reminderDaysBefore, setReminderDaysBefore] = useState<number>(() => {
    const val = localStorage.getItem("erp_auto_reminder_days_before");
    const parsed = val ? parseInt(val, 10) : 5;
    return isNaN(parsed) || parsed < 1 || parsed > 30 ? 5 : parsed;
  });
  const [reminderDaysRaw, setReminderDaysRaw] = useState<string>(() => {
    const val = localStorage.getItem("erp_auto_reminder_days_before");
    return val || "5";
  });
  const [reminderDaysError, setReminderDaysError] = useState<string>("");

  const validateAndUpdateReminderDays = (inputVal: string) => {
    setReminderDaysRaw(inputVal);
    if (inputVal.trim() === "") {
      setReminderDaysError("O número de dias de antecedência não pode ficar em branco.");
      return;
    }
    const num = Number(inputVal);
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 30) {
      setReminderDaysError("⚠️ O número de dias de antecedência deve ser um valor inteiro positivo entre 1 e 30 dias.");
    } else {
      setReminderDaysError("");
      setReminderDaysBefore(num);
      localStorage.setItem("erp_auto_reminder_days_before", String(num));
    }
  };

  const defaultReminderTemplate = "Olá, {NOME_RESPONSAVEL}! 👋\nLembramos que a fatura de {NOME_ALUNO} referente ao mês de {MES_REFERENCIA} vencerá em breve no dia {DATA_VENCIMENTO} (faltam apenas {DIAS_RESTANTES} dias).\n\n💰 Valor: R$ {VALOR_FATURA}\n\nPara facilitar o pagamento e evitar encargos adicionais, utilize o link com código PIX Copia e Cola ou boleto:\n🔗 {LINK_PIX}\n\nCaso o pagamento já tenha sido realizado no ERP, por favor desconsidere este aviso. Agradecemos a parceria com a {NOME_ESCOLA}!";

  const [autoReminder5dTemplate, setAutoReminder5dTemplate] = useState<string>(() => {
    const saved = localStorage.getItem("erp_auto_reminder_5d_template");
    return saved || defaultReminderTemplate;
  });

  const [autoReminderTime, setAutoReminderTime] = useState<string>(() => {
    return localStorage.getItem("erp_auto_reminder_time") || "09:00";
  });

  const [erpReminderFrequency, setErpReminderFrequency] = useState<"diario" | "semanal" | "quinzenal">(() => {
    const val = localStorage.getItem("erp_auto_reminder_frequency") || localStorage.getItem("school_crm_billing_frequency");
    if (val === "diario" || val === "semanal" || val === "quinzenal") return val;
    return "diario";
  });

  const [autoReminderExcludePaid, setAutoReminderExcludePaid] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_auto_reminder_exclude_paid");
    return val === null ? true : val === "true";
  });

  // Preview Mode for interactive smartphone mockup
  const [previewMode, setPreviewMode] = useState<"new_invoice" | "reminder_5d" | "overdue">("reminder_5d");

  // WhatsApp Business API Shortcuts for Recurring Overdue Invoices
  const [selectedOverdueTemplateId, setSelectedOverdueTemplateId] = useState<string>("friendly_3d");
  const [autoSendOverdue, setAutoSendOverdue] = useState<boolean>(true);
  const [overdueTriggerDays, setOverdueTriggerDays] = useState<number>(5);

  // Simulation & Logs State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isSimulatingReminder, setIsSimulatingReminder] = useState<boolean>(false);
  const [dispatchLogs, setDispatchLogs] = useState<SimulatedDispatchLog[]>([
    {
      id: "log-wa-101",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      parentName: "Mariana Silva",
      studentName: "Bernardo Silva",
      amount: 1450.0,
      dueDate: "15/08/2026",
      erpSource: selectedErpSource.toUpperCase(),
      invoiceNumber: "FAT-2026-9921",
      whatsappStatus: "read",
      phone: "+55 (11) 98822-4411",
      alertType: "lembrete_5d"
    },
    {
      id: "log-wa-102",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      parentName: "Carlos Eduardo Mendes",
      studentName: "Sofia Mendes",
      amount: 1320.5,
      dueDate: "14/08/2026",
      erpSource: selectedErpSource.toUpperCase(),
      invoiceNumber: "FAT-2026-9922",
      whatsappStatus: "delivered",
      phone: "+55 (11) 97711-3388",
      alertType: "lembrete_5d"
    },
    {
      id: "log-wa-103",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      parentName: "Fernanda Lima",
      studentName: "Gabriel Lima",
      amount: 1890.0,
      dueDate: "20/08/2026",
      erpSource: selectedErpSource.toUpperCase(),
      invoiceNumber: "FAT-2026-9915",
      whatsappStatus: "read",
      phone: "+55 (11) 99123-8877",
      alertType: "nova_fatura"
    }
  ]);

  // Save Settings
  const handleSaveSettings = () => {
    localStorage.setItem("school_erp_wa_active", String(activeAlert));
    localStorage.setItem("school_erp_wa_template", waTemplate);
    localStorage.setItem("erp_auto_reminder_5d_enabled", String(autoReminder5dEnabled));
    localStorage.setItem("erp_auto_reminder_days_before", String(reminderDaysBefore));
    localStorage.setItem("erp_auto_reminder_5d_template", autoReminder5dTemplate);
    localStorage.setItem("erp_auto_reminder_time", autoReminderTime);
    localStorage.setItem("erp_auto_reminder_exclude_paid", String(autoReminderExcludePaid));
    localStorage.setItem("erp_auto_reminder_frequency", erpReminderFrequency);
    localStorage.setItem("school_crm_billing_frequency", erpReminderFrequency);
    window.dispatchEvent(new Event("school_crm_config_updated"));
    
    if (onLogAdd) {
      onLogAdd(
        "success",
        `Configurações de alerta e lembretes automáticos (< ${reminderDaysBefore} dias) do ERP salvas. Status Lembrete: ${autoReminder5dEnabled ? "ATIVO" : "INATIVO"}`,
        "WHATSAPP_ERP"
      );
    }

    onToast("✨ Configurações de Lembrete Automático e Alertas ERP salvas com sucesso!", "success");
  };

  // Tag Inserter Helpers
  const handleInsertTag = (tag: string) => {
    setWaTemplate((prev) => prev + " " + tag);
  };

  const handleInsertReminderTag = (tag: string) => {
    setAutoReminder5dTemplate((prev) => prev + " " + tag);
  };

  // Generate Sample Message Preview with replacements
  const getFormattedPreview = () => {
    return waTemplate
      .replace(/{NOME_RESPONSAVEL}/g, "Mariana Silva")
      .replace(/{NOME_ESCOLA}/g, "Colégio Integrado")
      .replace(/{NOME_ALUNO}/g, "Bernardo Silva")
      .replace(/{MES_REFERENCIA}/g, "Agosto/2026")
      .replace(/{DATA_VENCIMENTO}/g, "10/08/2026")
      .replace(/{VALOR_FATURA}/g, "1.450,00")
      .replace(/{LINK_PIX}/g, "https://escola.edu.br/p/pix-9921")
      .replace(/{CODIGO_PIX_COPIA_COLA}/g, "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654071450.005802BR5913EscolaOnline6009SAO PAULO62070503***6304D1B2")
      .replace(/{NUMERO_DOC_ERP}/g, "FAT-2026-9921");
  };

  // Generate Reminder Message Preview (< 5 days) with replacements
  const getFormattedReminderPreview = () => {
    return autoReminder5dTemplate
      .replace(/{NOME_RESPONSAVEL}/g, "Mariana Silva")
      .replace(/{NOME_ESCOLA}/g, "Colégio Integrado")
      .replace(/{NOME_ALUNO}/g, "Bernardo Silva")
      .replace(/{MES_REFERENCIA}/g, "Agosto/2026")
      .replace(/{DATA_VENCIMENTO}/g, "15/08/2026")
      .replace(/{DIAS_RESTANTES}/g, String(reminderDaysBefore || 5))
      .replace(/{VALOR_FATURA}/g, "1.450,00")
      .replace(/{LINK_PIX}/g, "https://escola.edu.br/p/pix-9921")
      .replace(/{CODIGO_PIX_COPIA_COLA}/g, "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654071450.005802BR5913EscolaOnline6009SAO PAULO62070503***6304D1B2")
      .replace(/{NUMERO_DOC_ERP}/g, "FAT-2026-9921");
  };

  // Get active text according to previewMode
  const getActivePreviewContent = () => {
    if (previewMode === "reminder_5d") {
      return getFormattedReminderPreview();
    }
    if (previewMode === "overdue") {
      const selected = [
        {
          id: "friendly_3d",
          template: "Olá, {NOME_RESPONSAVEL}! Identificamos que a fatura de {NOME_ALUNO} no valor de R$ {VALOR_FATURA} venceu em {DATA_VENCIMENTO} e ainda consta como aberta. Utilize o PIX para baixar o título sem juros adicionais: {LINK_PIX}"
        },
        {
          id: "recurring_15d",
          template: "Prezado(a) {NOME_RESPONSAVEL}, notamos que o boleto de {NOME_ALUNO} ref. a {MES_REFERENCIA} está pendente há mais de 15 dias. Acesse nosso portal para renegociar com condições facilitadas: {LINK_PIX}"
        },
        {
          id: "urgent_30d",
          template: "Aviso da Tesouraria Escolar: Para manter o acesso ilimitado aos serviços do portal de {NOME_ALUNO}, solicitamos a regularização do débito pendente (R$ {VALOR_FATURA}). Código PIX: {LINK_PIX}"
        }
      ].find(t => t.id === selectedOverdueTemplateId);

      return (selected ? selected.template : waTemplate)
        .replace(/{NOME_RESPONSAVEL}/g, "Mariana Silva")
        .replace(/{NOME_ESCOLA}/g, "Colégio Integrado")
        .replace(/{NOME_ALUNO}/g, "Bernardo Silva")
        .replace(/{MES_REFERENCIA}/g, "Agosto/2026")
        .replace(/{DATA_VENCIMENTO}/g, "10/08/2026")
        .replace(/{VALOR_FATURA}/g, "1.450,00")
        .replace(/{LINK_PIX}/g, "https://escola.edu.br/p/pix-9921");
    }
    return getFormattedPreview();
  };

  // Trigger ERP Simulation for New Invoices
  const handleSimulateErpWebhook = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    onToast("⚡ Recebendo payload de nova fatura pendente do ERP...", "info");

    if (onLogAdd) {
      onLogAdd("info", `[SIMULAÇÃO ERP] Webhook recebido POST /api/webhooks/erp/invoice.created (Payload: FAT-2026-${Math.floor(Math.random() * 8999 + 1000)})`, "ERP_EVENT");
    }

    setTimeout(() => {
      const parentNames = ["Luciana Ramos", "Roberto Almeida", "Patrícia Souza", "Marcelo Duarte"];
      const studentNames = ["Felipe Ramos", "Beatriz Almeida", "Lucas Souza", "Alice Duarte"];
      const randIdx = Math.floor(Math.random() * parentNames.length);
      const randInvoiceNum = `FAT-2026-${Math.floor(Math.random() * 8999 + 1000)}`;
      const randAmount = Math.floor(Math.random() * 800 + 1100);

      const newLog: SimulatedDispatchLog = {
        id: `log-wa-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        parentName: parentNames[randIdx],
        studentName: studentNames[randIdx],
        amount: randAmount,
        dueDate: "10/08/2026",
        erpSource: selectedErpSource.toUpperCase(),
        invoiceNumber: randInvoiceNum,
        whatsappStatus: "delivered",
        phone: `+55 (11) 9${Math.floor(Math.random() * 8999 + 1000)}-${Math.floor(Math.random() * 8999 + 1000)}`,
        alertType: "nova_fatura"
      };

      setDispatchLogs((prev) => [newLog, ...prev]);
      setIsSimulating(false);

      if (onLogAdd) {
        onLogAdd("success", `[WHATSAPP DISPACHED] Alerta enviado via WhatsApp API para ${newLog.parentName} (${newLog.phone}) referente à fatura ${randInvoiceNum}`, "WHATSAPP_GATEWAY");
      }

      onToast(`📱 Alerta WhatsApp enviado com sucesso para ${newLog.parentName} (Fatura R$ ${randAmount},00)!`, "success");
    }, 1200);
  };

  // Trigger Pre-Due Reminder Simulation (< 5 days)
  const handleSimulatePreDueReminder = () => {
    if (isSimulatingReminder) return;
    setIsSimulatingReminder(true);

    onToast(`🔔 Executando varredura no ERP para faturas vencendo em menos de ${reminderDaysBefore} dias...`, "info");

    if (onLogAdd) {
      onLogAdd(
        "info",
        `[ROUTINE SCHEDULER] Varrendo base do ERP ${selectedErpSource.toUpperCase()}: localizadas 14 faturas com vencimento em < ${reminderDaysBefore} dias.`,
        "REMINDER_5D"
      );
    }

    setTimeout(() => {
      const parentNames = ["Juliana Costa", "Rodrigo Nogueira", "Camila Ferraz", "Eduardo Silveira"];
      const studentNames = ["Arthur Costa", "Manuela Nogueira", "Pedro Ferraz", "Helena Silveira"];
      const randIdx = Math.floor(Math.random() * parentNames.length);
      const randInvoiceNum = `FAT-2026-${Math.floor(Math.random() * 8999 + 1000)}`;
      const randAmount = Math.floor(Math.random() * 650 + 1250);

      const newLog: SimulatedDispatchLog = {
        id: `log-rem-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        parentName: parentNames[randIdx],
        studentName: studentNames[randIdx],
        amount: randAmount,
        dueDate: "15/08/2026",
        erpSource: selectedErpSource.toUpperCase(),
        invoiceNumber: randInvoiceNum,
        whatsappStatus: "read",
        phone: `+55 (11) 9${Math.floor(Math.random() * 8999 + 1000)}-${Math.floor(Math.random() * 8999 + 1000)}`,
        alertType: "lembrete_5d"
      };

      setDispatchLogs((prev) => [newLog, ...prev]);
      setIsSimulatingReminder(false);
      setPreviewMode("reminder_5d");

      if (onLogAdd) {
        onLogAdd(
          "success",
          `[LEMBRETE ENVIADO] Mensagem preventiva de vencimento enviada para ${newLog.parentName} (${newLog.studentName}) - Faltam ${reminderDaysBefore} dias para 15/08/2026.`,
          "REMINDER_5D"
        );
      }

      onToast(`🔔 Lembrete preventivo (< ${reminderDaysBefore} dias) enviado para ${newLog.parentName} com sucesso!`, "success");
    }, 1200);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6" id="erp-whatsapp-alert-config-view">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Gatilho Automático ERP → WhatsApp</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              • Régua Preventiva & Cobrança em Tempo Real
            </span>
          </div>

          <h3 className="font-serif font-black text-lg text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>Alertas e Lembretes Automáticos ERP</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure disparos automáticos para novas faturas emitidas e lembretes personalizados para faturas a vencer com antecedência configurável (1 a 30 dias) via WhatsApp ({selectedErpSource.toUpperCase()}).
          </p>
        </div>

        {/* ACTIVE SWITCH TOGGLE */}
        <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
              Gatilho Global de Alertas
            </span>
            <span className={`text-[10px] font-mono font-black ${activeAlert ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>
              {activeAlert ? "ATIVO (DISPARANDO)" : "PAUSADO (INATIVO)"}
            </span>
          </div>
          <button
            onClick={() => setActiveAlert(!activeAlert)}
            className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
              activeAlert ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 left-1 ${
                activeAlert ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* KPI METRICS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400">
            Faturas ERP Integradas
          </span>
          <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
            1.248 <span className="text-[10px] font-normal text-slate-400">este mês</span>
          </div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
          <span className="text-[10px] font-mono font-black uppercase text-emerald-700 dark:text-emerald-400">
            Lembretes & Alertas
          </span>
          <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">
            1.210 <span className="text-[10px] font-normal text-emerald-600">(97%)</span>
          </div>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-1">
          <span className="text-[10px] font-mono font-black uppercase text-amber-700 dark:text-amber-400">
            Preventivos ({reminderDaysBefore}d antes)
          </span>
          <div className="text-lg font-black text-amber-700 dark:text-amber-300 font-mono">
            342 <span className="text-[10px] font-normal text-amber-600">enviados</span>
          </div>
        </div>

        <div className="bg-slate-50/80 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-mono font-black uppercase text-slate-500 dark:text-slate-400">
            Conversão Pix D0/D1
          </span>
          <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
            68.4% <span className="text-[10px] font-normal text-slate-400">sem atrasos</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: CONFIGURATION & SMARTPHONE LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: RULES & TEMPLATE FORM (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* SECTION 1: REGRA DE DISPARO E FILTROS */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 font-mono">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              1. Regras de Entrada e Horário do Disparo
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Provedor ERP */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Origem do ERP Educacional
                </label>
                <select
                  value={selectedErpSource}
                  onChange={(e) => setSelectedErpSource(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="asaas">ASAAS (Gestão Financeira)</option>
                  <option value="totvs">TOTVS Educacional (RM/Datasul)</option>
                  <option value="sap">SAP Business One</option>
                  <option value="iugu">Iugu Payments</option>
                  <option value="generic">Webhook ERP Genérico / API</option>
                </select>
              </div>

              {/* Janela de Horário */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Janela de Horário do Envio
                </label>
                <select
                  value={triggerCondition}
                  onChange={(e) => setTriggerCondition(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="instant">⚡ Imediatamente (24 horas)</option>
                  <option value="business_hours">⏰ Horário Comercial (08h às 20h)</option>
                  <option value="delayed_30m">⏳ Cortesia (30 min pós-emissão)</option>
                </select>
              </div>
            </div>

            {/* Additional Filter Checkboxes */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyValidatedPhones}
                  onChange={(e) => setOnlyValidatedPhones(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Enviar apenas para telefones (+55) validados</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePixCopyPaste}
                  onChange={(e) => setIncludePixCopyPaste(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Incluir Chave Pix Copia e Cola na mensagem</span>
              </label>
            </div>
          </div>

          {/* SECTION 2: MODELO DA MENSAGEM DO WHATSAPP (NOVA FATURA) */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 font-mono">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                2. Mensagem de Nova Fatura Emitida (Lançamento)
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                {waTemplate.length} caracteres
              </span>
            </div>

            <textarea
              rows={4}
              value={waTemplate}
              onChange={(e) => setWaTemplate(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-600"
              placeholder="Digite a mensagem padrão do WhatsApp para faturas recém-emitidas..."
            />

            {/* DYNAMIC TAG BUTTONS */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase font-mono block">
                Inserir Variáveis Dinâmicas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: "{NOME_RESPONSAVEL}", label: "Nome Responsável" },
                  { tag: "{NOME_ALUNO}", label: "Nome Aluno" },
                  { tag: "{VALOR_FATURA}", label: "Valor R$" },
                  { tag: "{DATA_VENCIMENTO}", label: "Vencimento" },
                  { tag: "{MES_REFERENCIA}", label: "Mês Ref." },
                  { tag: "{LINK_PIX}", label: "Link Pix" },
                  { tag: "{NOME_ESCOLA}", label: "Escola" }
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTag(item.tag)}
                    className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: LEMBRETE AUTOMÁTICO (FATURAS VENCENDO EM X DIAS) */}
          <div 
            id="erp-whatsapp-reminder-config" 
            className="bg-amber-50/40 dark:bg-amber-950/20 p-5 rounded-2xl border-2 border-amber-300/80 dark:border-amber-700/60 space-y-4 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 dark:border-amber-900/60 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black uppercase bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                    Pré-Vencimento Automático
                  </span>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">
                    Régua Preventiva de Boletos ERP
                  </span>
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                  <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  3. Lembrete Automático para Faturas Vencendo em {reminderDaysBefore} {reminderDaysBefore === 1 ? "Dia" : "Dias"}
                </h4>
              </div>

              {/* TOGGLE LEMBRETE DIAS ANTES */}
              <div className="flex items-center gap-2 shrink-0 bg-white/80 dark:bg-slate-900 p-1.5 px-3 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {autoReminder5dEnabled ? `Lembrete Ativo (${reminderDaysBefore}d)` : "Desativado"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !autoReminder5dEnabled;
                    setAutoReminder5dEnabled(nextVal);
                    localStorage.setItem("erp_auto_reminder_5d_enabled", String(nextVal));
                    onToast(
                      nextVal 
                        ? `🔔 Lembrete preventivo ativado para ${reminderDaysBefore} dias antes do vencimento!` 
                        : "⏸️ Lembrete preventivo pausado.",
                      nextVal ? "success" : "info"
                    );
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                    autoReminder5dEnabled ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  title="Ativar ou pausar régua de lembrete preventivo no WhatsApp"
                >
                  <span
                    className={`block w-3.5 h-3.5 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 ${
                      autoReminder5dEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Dispara automaticamente uma notificação preventiva personalizada via WhatsApp aos pais e responsáveis quando a fatura no ERP estiver com vencimento próximo (<strong>{reminderDaysBefore} {reminderDaysBefore === 1 ? "dia" : "dias"} antes</strong>), reduzindo o esquecimento e inadimplência involuntária.
            </p>

            {/* CONFIGURATION CONTROLS (DAYS & SCHEDULE) */}
            <div className="bg-white/80 dark:bg-slate-900/90 p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/60 space-y-3.5">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase font-mono">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Número de Dias Antes do Vencimento</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-700 dark:text-amber-400 font-mono bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-800">
                      {reminderDaysBefore} {reminderDaysBefore === 1 ? "dia antes (Véspera)" : "dias antes"}
                    </span>
                  </div>
                </div>

                {/* FAST PRESET BUTTONS */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {[
                    { days: 1, label: "1d (Véspera)" },
                    { days: 2, label: "2 dias" },
                    { days: 3, label: "3 dias" },
                    { days: 5, label: "⭐ 5 dias (Padrão)" },
                    { days: 7, label: "7 dias (1 sem.)" },
                    { days: 10, label: "10 dias" },
                    { days: 15, label: "15 dias" },
                    { days: 20, label: "20 dias" },
                    { days: 30, label: "30 dias (Máx)" }
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => {
                        validateAndUpdateReminderDays(String(preset.days));
                        onToast(`📅 Antecedência ajustada para ${preset.days} dias antes do vencimento!`, "info");
                      }}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer border ${
                        reminderDaysBefore === preset.days && !reminderDaysError
                          ? "bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs"
                          : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* RANGE SLIDER + NUMERIC INPUT WITH VALIDATION */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="sm:col-span-8 flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400">1d</span>
                      <input
                        type="range"
                        min={1}
                        max={30}
                        value={reminderDaysBefore}
                        onChange={(e) => validateAndUpdateReminderDays(e.target.value)}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <span className="text-[10px] font-mono text-slate-400">30d</span>
                    </div>

                    <div className="sm:col-span-4 flex items-center justify-end gap-2">
                      <label className="text-[10px] font-bold text-slate-500 shrink-0">Ajuste fino:</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          id="input-erp-config-reminder-days"
                          min={1}
                          max={30}
                          step={1}
                          value={reminderDaysRaw}
                          onChange={(e) => validateAndUpdateReminderDays(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "." || e.key === "," || e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                              e.preventDefault();
                            }
                          }}
                          placeholder="1-30"
                          className={`w-16 bg-white dark:bg-slate-950 border rounded-lg p-1.5 text-xs font-mono font-black text-center focus:outline-none transition-colors ${
                            reminderDaysError
                              ? "border-2 border-rose-500 dark:border-rose-500 focus:ring-2 focus:ring-rose-500/40 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 shadow-2xs shadow-rose-500/20"
                              : "border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-amber-500"
                          }`}
                        />
                        <span className="text-[10px] font-mono text-slate-500">dias</span>
                      </div>
                    </div>
                  </div>

                  {/* ⚠️ Error message display */}
                  {reminderDaysError && (
                    <motion.div
                      initial={{ opacity: 0, y: -2, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -2, scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="p-2.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center gap-2 shadow-2xs"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>{reminderDaysError}</span>
                    </motion.div>
                  )}
                </div>

                {/* DYNAMIC TIMING EXPLANATION */}
                <div className="bg-amber-100/50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Cálculo do Disparo:</strong> Para um boleto que vence no dia <strong>15/08</strong>, o WhatsApp preventivo será enviado no dia <strong>{Math.max(1, 15 - reminderDaysBefore)}/08</strong> às <strong>{autoReminderTime}h</strong> (exatamente <strong>{reminderDaysBefore} {reminderDaysBefore === 1 ? "dia" : "dias"} antes</strong>).
                  </span>
                </div>
              </div>

              {/* SELETOR DE FREQUÊNCIA DA RÉGUA DE COBRANÇA ERP */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono uppercase">
                    <Repeat className="w-3.5 h-3.5 text-amber-600" />
                    <span>Frequência da Automação da Régua ERP</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-800">
                    {erpReminderFrequency === "diario" ? "📅 Diário (24h)" : erpReminderFrequency === "semanal" ? "📆 Semanal (7d)" : "🗓️ Quinzenal (15d)"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: "diario",
                      title: "Diário",
                      subtitle: "A cada 24h",
                      desc: "Varredura contínua e lembretes diários",
                      badge: "Alta Conversão"
                    },
                    {
                      id: "semanal",
                      title: "Semanal",
                      subtitle: "A cada 7 dias",
                      desc: "Disparos no D-7 e no vencimento",
                      badge: "Anti-Fadiga"
                    },
                    {
                      id: "quinzenal",
                      title: "Quinzenal",
                      subtitle: "A cada 15 dias",
                      desc: "Ciclo quinzenal e mensal do ERP",
                      badge: "ERP Integrado"
                    }
                  ].map((freq) => {
                    const isSelected = erpReminderFrequency === freq.id;
                    return (
                      <button
                        key={freq.id}
                        type="button"
                        onClick={() => {
                          setErpReminderFrequency(freq.id as any);
                          localStorage.setItem("erp_auto_reminder_frequency", freq.id);
                          localStorage.setItem("school_crm_billing_frequency", freq.id);
                          window.dispatchEvent(new Event("school_crm_config_updated"));
                          onToast(`Frequência da régua ERP atualizada para: ${freq.title}!`, "info");
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-100 shadow-2xs font-bold"
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-700"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-black">{freq.title}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            isSelected
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                          }`}>
                            {freq.badge}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 mt-1">
                          {freq.subtitle}
                        </span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {freq.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {erpReminderFrequency === "diario" && (
                    <span>
                      ⚙️ <strong>Modo Diário:</strong> O motor de automação consulta as faturas do ERP todos os dias às <strong>{autoReminderTime}h</strong> e envia avisos para todas as mensalidades que entrarem na janela de {reminderDaysBefore} dias.
                    </span>
                  )}
                  {erpReminderFrequency === "semanal" && (
                    <span>
                      ⚙️ <strong>Modo Semanal:</strong> Disparos agrupados a cada 7 dias e na véspera do vencimento, permitindo previsibilidade de fluxo de caixa sem mensagens excessivas.
                    </span>
                  )}
                  {erpReminderFrequency === "quinzenal" && (
                    <span>
                      ⚙️ <strong>Modo Quinzenal:</strong> Régua programada a cada 15 dias (D-15 e corte ERP), com conciliação automática com o status de liquidação bancária via PIX/Boleto.
                    </span>
                  )}
                </div>
              </div>

              {/* SCHEDULE TIME SELECTOR VISUAL */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono uppercase">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Horário do Disparo Diário ({autoReminderTime}h)</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-800">
                    {parseInt(autoReminderTime.split(":")[0]) < 12 ? "☀️ Turno Manhã" : parseInt(autoReminderTime.split(":")[0]) < 18 ? "🌤️ Turno Tarde" : "🌙 Turno Noite"}
                  </span>
                </div>

                {/* Visual Time Slot Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { time: "08:00", label: "08:00h", popular: false },
                    { time: "09:00", label: "09:00h 🔥", popular: true },
                    { time: "10:00", label: "10:00h", popular: false },
                    { time: "11:30", label: "11:30h", popular: false },
                    { time: "14:00", label: "14:00h 🔥", popular: true },
                    { time: "18:00", label: "18:00h", popular: false }
                  ].map((slot) => {
                    const isSelected = autoReminderTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => {
                          setAutoReminderTime(slot.time);
                          localStorage.setItem("erp_auto_reminder_time", slot.time);
                          localStorage.setItem("erp_billing_schedule_time", slot.time);
                          onToast(`⏰ Horário de disparo ajustado para ${slot.time}h!`, "info");
                        }}
                        className={`p-2 rounded-xl text-center text-xs font-mono font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs ring-2 ring-amber-400/40"
                            : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-600 dark:text-slate-300">Outro horário:</span>
                    <input
                      type="time"
                      value={autoReminderTime}
                      onChange={(e) => {
                        if (e.target.value) {
                          setAutoReminderTime(e.target.value);
                          localStorage.setItem("erp_auto_reminder_time", e.target.value);
                          localStorage.setItem("erp_billing_schedule_time", e.target.value);
                        }
                      }}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>WhatsApp Business API Verified ✓</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CUSTOM REMINDER TEXTAREA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>Mensagem Personalizada do Lembrete ({reminderDaysBefore} {reminderDaysBefore === 1 ? "dia antes" : "dias antes"})</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAutoReminder5dTemplate(defaultReminderTemplate);
                      onToast("Template padrão de lembrete preventivo restaurado!", "info");
                    }}
                    className="text-[10px] font-mono text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restaurar Padrão
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {autoReminder5dTemplate.length} caracteres
                  </span>
                </div>
              </div>

              <textarea
                rows={5}
                value={autoReminder5dTemplate}
                onChange={(e) => setAutoReminder5dTemplate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl p-3 text-xs font-sans text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500"
                placeholder={`Escreva aqui a mensagem personalizada enviada para faturas com vencimento em ${reminderDaysBefore} dias...`}
              />

              {/* DYNAMIC TAG BUTTONS FOR REMINDER */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 uppercase font-mono block">
                  Inserir Tags Dinâmicas no Lembrete:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: "{NOME_RESPONSAVEL}", label: "Nome Responsável" },
                    { tag: "{NOME_ALUNO}", label: "Nome Aluno" },
                    { tag: "{VALOR_FATURA}", label: "Valor R$" },
                    { tag: "{DATA_VENCIMENTO}", label: "Data Vencimento" },
                    { tag: "{DIAS_RESTANTES}", label: "Dias Restantes" },
                    { tag: "{MES_REFERENCIA}", label: "Mês Referência" },
                    { tag: "{LINK_PIX}", label: "Link Pix / Boleto" },
                    { tag: "{NOME_ESCOLA}", label: "Nome Escola" }
                  ].map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertReminderTag(item.tag)}
                      className="text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-950/60 px-2 py-1 rounded-lg transition-all cursor-pointer shadow-2xs"
                    >
                      + {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PREVENTIVE RULES CHECKBOXES */}
            <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/60 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoReminderExcludePaid}
                  onChange={(e) => {
                    setAutoReminderExcludePaid(e.target.checked);
                    localStorage.setItem("erp_auto_reminder_exclude_paid", String(e.target.checked));
                  }}
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Excluir automaticamente faturas já baixadas/pagas no ERP</span>
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                <span>Gerar log de auditoria no painel financeiro escolar</span>
              </label>
            </div>
          </div>

          {/* SECTION 4: ATALHOS DE AUTOMACÃO DE ATRASO / INADIMPLÊNCIA (15+ DIAS) */}
          <div className="bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                4. Modelos de Notificação Pós-Vencimento (Atrasos Acumulados)
              </h4>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                HSM Meta Verified ✓
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Modelos pré-aprovados da WhatsApp Business API para acionar em casos de títulos que já ultrapassaram o vencimento.
            </p>

            <div className="grid grid-cols-1 space-y-2">
              {[
                {
                  id: "friendly_3d",
                  title: "Lembrete Amigável (D+3 a D+5 de Atraso)",
                  template: "Olá, {NOME_RESPONSAVEL}! Identificamos que a fatura de {NOME_ALUNO} no valor de R$ {VALOR_FATURA} venceu em {DATA_VENCIMENTO} e ainda consta como aberta. Utilize o PIX para baixar o título sem juros adicionais: {LINK_PIX}",
                  tag: "Pouco Atraso",
                  color: "border-blue-200 bg-blue-50/50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-900/40"
                },
                {
                  id: "recurring_15d",
                  title: "Aviso de Atraso Recorrente (15 dias de Vencido)",
                  template: "Prezado(a) {NOME_RESPONSAVEL}, notamos que o boleto de {NOME_ALUNO} ref. a {MES_REFERENCIA} está pendente há mais de 15 dias. Acesse nosso portal para renegociar com condições facilitadas: {LINK_PIX}",
                  tag: "Recorrente",
                  color: "border-amber-200 bg-amber-50/50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900/40"
                },
                {
                  id: "urgent_30d",
                  title: "Notificação Prioritária de Regularização (30+ dias)",
                  template: "Aviso da Tesouraria Escolar: Para manter o acesso ilimitado aos serviços do portal de {NOME_ALUNO}, solicitamos a regularização do débito pendente (R$ {VALOR_FATURA}). Código PIX: {LINK_PIX}",
                  tag: "Urgente",
                  color: "border-rose-200 bg-rose-50/50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900/40"
                }
              ].map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setSelectedOverdueTemplateId(tmpl.id);
                    setPreviewMode("overdue");
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    selectedOverdueTemplateId === tmpl.id && previewMode === "overdue"
                      ? "ring-2 ring-emerald-500 border-emerald-500 bg-white dark:bg-slate-900 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                        {tmpl.title}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${tmpl.color}`}>
                        {tmpl.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 font-mono">
                      "{tmpl.template}"
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWaTemplate(tmpl.template);
                      setSelectedOverdueTemplateId(tmpl.id);
                      setPreviewMode("overdue");
                      onToast(`✨ Modelo "${tmpl.title}" aplicado ao preview do WhatsApp!`, "success");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold shrink-0 transition-all cursor-pointer shadow-2xs"
                  >
                    Visualizar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ACTION BUTTONS: SAVE & SIMULATE */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulatePreDueReminder}
                disabled={isSimulatingReminder}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSimulatingReminder ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Bell className="w-3.5 h-3.5" />
                )}
                <span>Simular Lembrete Preventivo ({reminderDaysBefore}d antes)</span>
              </button>

              <button
                type="button"
                onClick={handleSimulateErpWebhook}
                disabled={isSimulating}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSimulating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                )}
                <span>Simular Entrada Nova Fatura</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Regras & Lembretes ERP</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: REALISTIC SMARTPHONE PREVIEW (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-3">
          
          {/* PREVIEW SWITCHER TABS */}
          <div className="w-full flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setPreviewMode("reminder_5d")}
              className={`flex-1 py-1.5 px-2 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                previewMode === "reminder_5d"
                  ? "bg-amber-500 text-slate-950 shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BellRing className="w-3 h-3" />
              <span>Lembrete {reminderDaysBefore}d Antes</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewMode("new_invoice")}
              className={`flex-1 py-1.5 px-2 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                previewMode === "new_invoice"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Nova Fatura</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewMode("overdue")}
              className={`flex-1 py-1.5 px-2 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                previewMode === "overdue"
                  ? "bg-indigo-600 text-white shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Atraso</span>
            </button>
          </div>

          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            Visualização em Tempo Real (WhatsApp do Responsável)
          </span>

          {/* SMARTPHONE FRAME */}
          <div className="w-full max-w-[320px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 relative space-y-2">
            
            {/* Phone Notch */}
            <div className="w-28 h-4 bg-slate-950 rounded-b-xl mx-auto flex items-center justify-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
              <div className="w-2 h-2 bg-indigo-900 rounded-full" />
            </div>

            {/* WhatsApp App Header */}
            <div className="bg-[#075e54] text-white px-3 py-2 rounded-t-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">
                  CI
                </div>
                <div>
                  <h5 className="text-[11px] font-bold leading-tight">Colégio Integrado</h5>
                  <span className="text-[9px] opacity-80 block font-mono">
                    {previewMode === "reminder_5d" ? "Lembrete Preventivo • ERP" : "Conta Comercial Oficial • ERP"}
                  </span>
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            </div>

            {/* Chat Body Wallpaper */}
            <div className="bg-[#efeae2] dark:bg-slate-950 p-3 rounded-b-2xl min-h-[320px] flex flex-col justify-between space-y-2 font-sans">
              
              {/* Date Badge */}
              <div className="text-center">
                <span className="bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 text-[9px] px-2 py-0.5 rounded-md font-mono shadow-2xs">
                  {previewMode === "reminder_5d" ? `HOJE (FALTAM ${reminderDaysBefore} ${reminderDaysBefore === 1 ? "DIA" : "DIAS"})` : "HOJE"}
                </span>
              </div>

              {/* Message Bubble */}
              <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 rounded-xl rounded-tl-none shadow-sm space-y-2 border border-slate-200/60 dark:border-slate-800 text-[11px] leading-relaxed relative">
                
                {/* Header Tag in chat */}
                {previewMode === "reminder_5d" && (
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[9px] font-bold font-mono">
                    <BellRing className="w-2.5 h-2.5" />
                    <span>Lembrete de Vencimento</span>
                  </div>
                )}

                <p className="whitespace-pre-line font-sans">
                  {getActivePreviewContent()}
                </p>

                {/* Pix Code Snippet Box */}
                {includePixCopyPaste && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                    <span className="text-[9px] font-mono font-extrabold text-emerald-700 dark:text-emerald-300 block">
                      ⚡ Código Pix Copia e Cola:
                    </span>
                    <div className="bg-white dark:bg-slate-900 p-1.5 rounded border border-emerald-200 dark:border-emerald-800 font-mono text-[8px] text-slate-500 break-all select-all">
                      00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3...
                    </div>
                  </div>
                )}

                {/* Timestamp & Read Indicator */}
                <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono pt-1">
                  <span>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-emerald-500 font-bold">✓✓</span>
                </div>
              </div>

              {/* WhatsApp Quick Action Button */}
              {includePdfButton && (
                <div className="bg-white dark:bg-slate-900 border border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] text-center py-1.5 px-2 rounded-xl shadow-xs flex items-center justify-center gap-1">
                  <FileText className="w-3 h-3 text-emerald-500" />
                  <span>📄 Acessar Boleto & Extrato em PDF</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCH AUDIT LOG TABLE & FAILED LOGS SECTION */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100/80 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveLogTab("success_history")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeLogTab === "success_history"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200 dark:border-slate-800"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-500" />
            <span>Histórico de Entregas Ativas ({dispatchLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLogTab("failed_logs")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeLogTab === "failed_logs"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-300" />
            <span>⚠️ Logs de Falhas & Reenvio Individual</span>
          </button>
        </div>

        {activeLogTab === "success_history" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Histórico de Alertas e Lembretes Disparados no WhatsApp
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                Últimos disparos em tempo real
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-mono text-[9px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Horário</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Responsável</th>
                    <th className="p-3">Aluno</th>
                    <th className="p-3">Valor Fatura</th>
                    <th className="p-3">Vencimento</th>
                    <th className="p-3">Status WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {dispatchLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="p-3 font-mono text-slate-500">{log.timestamp}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                          log.alertType === "lembrete_5d"
                            ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/60"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                        }`}>
                          {log.alertType === "lembrete_5d" ? `🔔 Lembrete (${reminderDaysBefore}d)` : "⚡ Nova Fatura"}
                        </span>
                      </td>
                      <td className="p-3 text-slate-900 dark:text-slate-100 font-bold">{log.parentName}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{log.studentName}</td>
                      <td className="p-3 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        R$ {log.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">{log.dueDate}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{log.whatsappStatus === "read" ? "Entregue & Lido" : "Entregue no WhatsApp"}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <CrmFailedWhatsAppLogsView onToast={onToast} onLogAdd={onLogAdd} />
        )}
      </div>
    </div>
  );
};
