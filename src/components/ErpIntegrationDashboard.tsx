import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ErpWhatsAppInvoiceAlertConfig } from "./ErpWhatsAppInvoiceAlertConfig";
import InvoiceWhatsAppReminderModal from "./InvoiceWhatsAppReminderModal";
import { ErpQuickWebhooksModal } from "./ErpQuickWebhooksModal";
import { SyncSettingsConfig } from "./SyncSettingsConfig";
import { AutomatedBillingSchedulePanel } from "./AutomatedBillingSchedulePanel";
import { AgendadorLembretesFinanceiros } from "./AgendadorLembretesFinanceiros";
import { Cobranca } from "../types";
import { 
  Layers, 
  RefreshCw, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  Play, 
  Save, 
  Code, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Trash2, 
  Search, 
  ArrowRight, 
  Database,
  Sliders,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  Zap,
  Clock,
  BellRing,
  RotateCcw,
  X,
  ExternalLink,
  Repeat,
  Filter,
} from "lucide-react";

interface ErpIntegrationDashboardProps {
  erpName: "asaas" | "sap" | "totvs" | "iugu";
  setErpName: (val: "asaas" | "sap" | "totvs" | "iugu") => void;
  erpApiKey: string;
  setErpApiKey: (val: string) => void;
  erpWebhookUrl: string;
  setErpWebhookUrl: (val: string) => void;
  erpSyncStatus: "disconnected" | "sync_testing" | "connected";
  setErpSyncStatus: (val: "disconnected" | "sync_testing" | "connected") => void;
  erpLastSyncTime: string;
  setErpLastSyncTime: (val: string) => void;
  estudantes: any[];
  cobrancas?: Cobranca[];
  setToast: (toast: { message: string; type: "success" | "error" | "info" } | null) => void;
  onBack?: () => void;
  onOpenInvoiceReminderModal?: (invoice?: Cobranca | null) => void;
}

interface SyncHistoryItem {
  id: string;
  timestamp: string;
  module: "secretaria" | "academico" | "financeiro" | "completo";
  status: "success" | "partial" | "failed";
  recordsProcessed: number;
  durationMs: number;
  payloadMock: any;
}

interface LogItem {
  id: string;
  timestamp: string;
  type: "info" | "warn" | "error" | "success";
  message: string;
  module: string;
}

interface SyncAttemptLog {
  id: string;
  timestamp: string;
  module: string;
  endpoint: string;
  status: "success" | "failed";
  details: string;
  code: number;
}

export interface ErpMonitoredInvoice {
  id: string;
  student: string;
  guardian: string;
  days: number;
  amount: string;
  status: "PENDING" | "OVERDUE" | "PAID";
  dueDate: string;
  barcode?: string;
  pixKey?: string;
  isFromApi?: boolean;
}

const INITIAL_DEFAULT_INVOICES: ErpMonitoredInvoice[] = [
  { id: "FAT-101", student: "Ana Souza", guardian: "Reginaldo S.", days: 22, amount: "1.850", status: "OVERDUE", dueDate: "18/08/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000185000" },
  { id: "FAT-102", student: "Carlos Eduardo", guardian: "Marta E.", days: 17, amount: "2.100", status: "OVERDUE", dueDate: "23/08/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000210000" },
  { id: "FAT-103", student: "Beatriz Santos", guardian: "Fábio S.", days: 8, amount: "1.850", status: "OVERDUE", dueDate: "01/09/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000185000" },
  { id: "FAT-104", student: "Mariana Costa", guardian: "Aline C.", days: 31, amount: "2.450", status: "OVERDUE", dueDate: "09/08/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000245000" },
  { id: "FAT-105", student: "Guilherme Reis", guardian: "Juliana R.", days: 14, amount: "1.950", status: "OVERDUE", dueDate: "26/08/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000195000" },
];

const FRESH_API_PENDING_INVOICES: ErpMonitoredInvoice[] = [
  { id: "FAT-101", student: "Ana Souza", guardian: "Reginaldo S.", days: 22, amount: "1.850", status: "OVERDUE", dueDate: "18/08/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000185000", isFromApi: true },
  { id: "FAT-102", student: "Carlos Eduardo", guardian: "Marta E.", days: 17, amount: "2.100", status: "OVERDUE", dueDate: "23/08/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000210000", isFromApi: true },
  { id: "FAT-103", student: "Beatriz Santos", guardian: "Fábio S.", days: 8, amount: "1.850", status: "OVERDUE", dueDate: "01/09/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000185000", isFromApi: true },
  { id: "FAT-104", student: "Mariana Costa", guardian: "Aline C.", days: 31, amount: "2.450", status: "OVERDUE", dueDate: "09/08/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000245000", isFromApi: true },
  { id: "FAT-105", student: "Guilherme Reis", guardian: "Juliana R.", days: 14, amount: "1.950", status: "OVERDUE", dueDate: "26/08/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000195000", isFromApi: true },
  { id: "FAT-106", student: "Lucas Penteado", guardian: "Renata P.", days: 6, amount: "1.750", status: "OVERDUE", dueDate: "03/09/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000175000", isFromApi: true },
  { id: "FAT-107", student: "Sofia Marinho", guardian: "Marcos M.", days: 27, amount: "2.250", status: "OVERDUE", dueDate: "13/08/2026", barcode: "34191.79001 01043.510047 91020.150008 5 94500000225000", isFromApi: true },
];

export function ErpIntegrationDashboard({
  erpName,
  setErpName,
  erpApiKey,
  setErpApiKey,
  erpWebhookUrl,
  setErpWebhookUrl,
  erpSyncStatus,
  setErpSyncStatus,
  erpLastSyncTime,
  setErpLastSyncTime,
  estudantes,
  cobrancas,
  setToast,
  onBack,
  onOpenInvoiceReminderModal,
}: ErpIntegrationDashboardProps) {
  // Local States
  const [isLocalInvoiceModalOpen, setIsLocalInvoiceModalOpen] = useState(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Cobranca | null>(null);

  const handleTriggerInvoiceAlertModal = (invoice?: Cobranca | null) => {
    if (invoice) setSelectedInvoiceForModal(invoice);
    if (onOpenInvoiceReminderModal) {
      onOpenInvoiceReminderModal(invoice);
    } else {
      setIsLocalInvoiceModalOpen(true);
    }
  };

  const [showApiKey, setShowApiKey] = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState(15);
  const [sslVerification, setSslVerification] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState<"realtime" | "hourly" | "daily" | "manual">("daily");
  const [pollingIntervalMinutes, setPollingIntervalMinutes] = useState<number>(() => {
    const saved = localStorage.getItem("erp_polling_interval_minutes");
    return saved ? parseInt(saved, 10) : 15;
  });
  const [pollingEnabled, setPollingEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("erp_polling_enabled");
    return saved !== null ? saved === "true" : true;
  });
  const [isQuickWebhooksModalOpen, setIsQuickWebhooksModalOpen] = useState(false);

  // Forced Synchronization & Invoices Cache State
  const [monitoredInvoices, setMonitoredInvoices] = useState<ErpMonitoredInvoice[]>(() => {
    try {
      const cached = localStorage.getItem("erp_invoices_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.invoices) && parsed.invoices.length > 0) {
          return parsed.invoices;
        }
      }
    } catch (e) {
      console.warn("Falha ao ler erp_invoices_cache:", e);
    }
    return INITIAL_DEFAULT_INVOICES;
  });

  const [invoiceCacheInfo, setInvoiceCacheInfo] = useState<{
    isCached: boolean;
    cachedAt: string;
    source: "CACHE_LOCAL" | "API_DIRETA";
  }>(() => {
    try {
      const cached = localStorage.getItem("erp_invoices_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          isCached: true,
          cachedAt: parsed.cachedAt ? new Date(parsed.cachedAt).toLocaleTimeString("pt-BR") : "Há instantes",
          source: parsed.source || "CACHE_LOCAL",
        };
      }
    } catch {}
    return {
      isCached: true,
      cachedAt: "Sessão anterior",
      source: "CACHE_LOCAL",
    };
  });

  const [isForcingSync, setIsForcingSync] = useState(false);
  const [forceSyncProgress, setForceSyncProgress] = useState(0);
  const [forceSyncStage, setForceSyncStage] = useState<
    "idle" | "clearing_cache" | "connecting_api" | "downloading_invoices" | "updating_cache" | "completed"
  >("idle");
  const [showForceSyncModal, setShowForceSyncModal] = useState(false);
  const [forceSyncStats, setForceSyncStats] = useState<{
    invoicesCount: number;
    totalAmount: string;
    durationMs: number;
    apiEndpoint: string;
  } | null>(null);

  // Automated Billing Schedule & Reminder Criteria State in ERP Dashboard
  const [inlineScheduleActive, setInlineScheduleActive] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_schedule_enabled");
    return val === null ? true : val === "true";
  });
  const [inlineScheduleTime, setInlineScheduleTime] = useState<string>(() => {
    return localStorage.getItem("erp_billing_schedule_time") || "09:00";
  });
  const [inlineScheduleFrequency, setInlineScheduleFrequency] = useState<"diario" | "semanal" | "quinzenal">(() => {
    const val = localStorage.getItem("erp_billing_schedule_frequency") || localStorage.getItem("school_crm_billing_frequency");
    if (val === "diario" || val === "semanal" || val === "quinzenal") return val;
    return "diario";
  });
  const [inlineDaysBefore, setInlineDaysBefore] = useState<number>(() => {
    const val = localStorage.getItem("erp_billing_schedule_days_before");
    const parsed = val ? parseInt(val, 10) : 5;
    return isNaN(parsed) || parsed < 1 || parsed > 30 ? 5 : parsed;
  });
  const [inlineDueDayEnabled, setInlineDueDayEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_stage_due_day_enabled");
    return val === null ? true : val === "true";
  });
  const [inlinePostDueEnabled, setInlinePostDueEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_stage_post_enabled");
    return val === null ? true : val === "true";
  });
  const [inlineDaysAfter, setInlineDaysAfter] = useState<number>(() => {
    const val = localStorage.getItem("erp_billing_stage_post_days");
    const parsed = val ? parseInt(val, 10) : 3;
    return isNaN(parsed) || parsed < 1 || parsed > 30 ? 3 : parsed;
  });
  const [inlineMinValue, setInlineMinValue] = useState<number>(() => {
    const val = localStorage.getItem("erp_billing_criteria_min_value");
    return val ? parseFloat(val) : 50;
  });

  // Keep state synchronized with other components and storage events
  useEffect(() => {
    const handleSyncConfig = () => {
      const active = localStorage.getItem("erp_billing_schedule_enabled");
      if (active !== null) setInlineScheduleActive(active === "true");
      const time = localStorage.getItem("erp_billing_schedule_time");
      if (time) setInlineScheduleTime(time);
      const freq = localStorage.getItem("erp_billing_schedule_frequency") || localStorage.getItem("school_crm_billing_frequency");
      if (freq === "diario" || freq === "semanal" || freq === "quinzenal") setInlineScheduleFrequency(freq);
      const daysB = localStorage.getItem("erp_billing_schedule_days_before");
      if (daysB) setInlineDaysBefore(parseInt(daysB, 10) || 5);
      const dueD = localStorage.getItem("erp_billing_stage_due_day_enabled");
      if (dueD !== null) setInlineDueDayEnabled(dueD === "true");
      const postD = localStorage.getItem("erp_billing_stage_post_enabled");
      if (postD !== null) setInlinePostDueEnabled(postD === "true");
      const daysA = localStorage.getItem("erp_billing_stage_post_days");
      if (daysA) setInlineDaysAfter(parseInt(daysA, 10) || 3);
      const minV = localStorage.getItem("erp_billing_criteria_min_value");
      if (minV) setInlineMinValue(parseFloat(minV) || 50);
    };
    window.addEventListener("school_crm_config_updated", handleSyncConfig);
    window.addEventListener("storage", handleSyncConfig);
    return () => {
      window.removeEventListener("school_crm_config_updated", handleSyncConfig);
      window.removeEventListener("storage", handleSyncConfig);
    };
  }, []);

  const handleSaveInlineScheduleConfig = (
    newActive?: boolean,
    newTime?: string,
    newFreq?: "diario" | "semanal" | "quinzenal",
    newDaysBefore?: number,
    newDueDay?: boolean,
    newPostDue?: boolean,
    newDaysAfter?: number,
    newMinVal?: number
  ) => {
    const active = newActive !== undefined ? newActive : inlineScheduleActive;
    const time = newTime !== undefined ? newTime : inlineScheduleTime;
    const freq = newFreq !== undefined ? newFreq : inlineScheduleFrequency;
    const daysB = newDaysBefore !== undefined ? newDaysBefore : inlineDaysBefore;
    const dueD = newDueDay !== undefined ? newDueDay : inlineDueDayEnabled;
    const postD = newPostDue !== undefined ? newPostDue : inlinePostDueEnabled;
    const daysA = newDaysAfter !== undefined ? newDaysAfter : inlineDaysAfter;
    const minVal = newMinVal !== undefined ? newMinVal : inlineMinValue;

    setInlineScheduleActive(active);
    setInlineScheduleTime(time);
    setInlineScheduleFrequency(freq);
    setInlineDaysBefore(daysB);
    setInlineDueDayEnabled(dueD);
    setInlinePostDueEnabled(postD);
    setInlineDaysAfter(daysA);
    setInlineMinValue(minVal);

    localStorage.setItem("erp_billing_schedule_enabled", String(active));
    localStorage.setItem("erp_billing_schedule_time", time);
    localStorage.setItem("erp_billing_schedule_frequency", freq);
    localStorage.setItem("school_crm_billing_frequency", freq);
    localStorage.setItem("erp_billing_schedule_days_before", String(daysB));
    localStorage.setItem("erp_billing_stage_due_day_enabled", String(dueD));
    localStorage.setItem("erp_billing_stage_post_enabled", String(postD));
    localStorage.setItem("erp_billing_stage_post_days", String(daysA));
    localStorage.setItem("erp_billing_criteria_min_value", String(minVal));

    // Compatibilidade com chaves legadas
    localStorage.setItem("erp_auto_reminder_days_before", String(daysB));
    localStorage.setItem("erp_auto_reminder_time", time);
    localStorage.setItem("erp_auto_reminder_frequency", freq);
    localStorage.setItem("erp_auto_reminder_5d_enabled", String(active));

    window.dispatchEvent(new Event("school_crm_config_updated"));
    addLog("success", `Régua ERP atualizada: Disparo às ${time}h (${freq.toUpperCase()}), D-${daysB}, D-0, D+${daysA}, Min R$ ${minVal}`, "BILLING_SCHEDULE");
    setToast({
      message: `✓ Critérios da Régua ERP salvos! Disparo às ${time}h (${freq.toUpperCase()}) com D-${daysB} ativo.`,
      type: "success"
    });
  };
  
  // TOTVS-specific configurations
  const [totvsApiVersion, setTotvsApiVersion] = useState<string>("v3.0-core");
  const [totvsBatchInterval, setTotvsBatchInterval] = useState<string>("15");
  
  // Loading states for individual modules
  const [loadingModule, setLoadingModule] = useState<"secretaria" | "academico" | "financeiro" | "completo" | null>(null);
  
  // Custom headers
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([
    { key: "Content-Type", value: "application/json" },
    { key: "X-Client-Version", value: "3.2.0" }
  ]);
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderVal, setNewHeaderVal] = useState("");

  // DB Field mapping state
  const [fieldMappings, setFieldMappings] = useState({
    studentId: "external_id",
    studentName: "full_name",
    parentEmail: "guardian_email",
    grades: "academic_bimester_grades",
    billingStatus: "invoice_payment_status",
    registrationCode: "school_enrollment_code",
  });

  // Billing Configuration Wizard State
  const [isWizardActive, setIsWizardActive] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardErp, setWizardErp] = useState<"totvs" | "sap" | "asaas" | "iugu">(erpName);
  const [wizardInvoiceTrigger, setWizardInvoiceTrigger] = useState<"creation" | "payment">("payment");
  const [wizardAggregated, setWizardAggregated] = useState<"grouped" | "individual">("individual");
  const [wizardWebhookActive, setWizardWebhookActive] = useState(true);
  const [isSimulatingWizard, setIsSimulatingWizard] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState<string[]>([]);
  const [simulationSuccess, setSimulationSuccess] = useState(false);

  const [billingMappings, setBillingMappings] = useState({
    amount: "valor_original",
    dueDate: "data_vencimento_original",
    payerName: "nome_completo_pagador",
    payerDocument: "documento_identidade_pagador",
    paymentStatus: "status_cobranca_boleto",
    invoiceId: "id_referencia_fatura",
    issTaxRate: "aliquota_iss_municipio",
    municipalServiceCode: "codigo_servico_aula",
    serviceDescription: "descritivo_servicos_educacionais",
    invoiceEmail: "email_disparar_nota_fiscal",
    fineAndInterest: "juros_multas_descontos",
  });

  // Helper to load presets
  const loadErpPreset = (selectedErp: "totvs" | "sap" | "asaas" | "iugu") => {
    if (selectedErp === "totvs") {
      setBillingMappings({
        amount: "VALOR_SERVICO",
        dueDate: "DATA_VENC",
        payerName: "NOME_RESP_FINANC",
        payerDocument: "CPF_CNPJ_RESP",
        paymentStatus: "STATUS_BOLETO",
        invoiceId: "ID_LANCAMENTO_FISCAL",
        issTaxRate: "ALIQ_ISS_EDUC",
        municipalServiceCode: "COD_SERV_MUNICIPAL",
        serviceDescription: "DESCR_SERVICO_EDUC",
        invoiceEmail: "EMAIL_NFE_DEST",
        fineAndInterest: "DESCONTO_PONTUALIDADE_MULTA",
      });
    } else if (selectedErp === "sap") {
      setBillingMappings({
        amount: "DocTotal",
        dueDate: "DocDueDate",
        payerName: "CardName",
        payerDocument: "LicTradNum",
        paymentStatus: "DocStatus",
        invoiceId: "DocEntry",
        issTaxRate: "TaxCode",
        municipalServiceCode: "ServiceCode",
        serviceDescription: "Dscription",
        invoiceEmail: "E_Mail",
        fineAndInterest: "DiscPrcnt",
      });
    } else if (selectedErp === "asaas") {
      setBillingMappings({
        amount: "value",
        dueDate: "dueDate",
        payerName: "customer.name",
        payerDocument: "customer.cpfCnpj",
        paymentStatus: "status",
        invoiceId: "id",
        issTaxRate: "taxes.iss",
        municipalServiceCode: "taxes.municipalServiceCode",
        serviceDescription: "description",
        invoiceEmail: "customer.email",
        fineAndInterest: "fine.value",
      });
    } else {
      setBillingMappings({
        amount: "amount_cents",
        dueDate: "due_date",
        payerName: "payer.name",
        payerDocument: "payer.cpf_cnpj",
        paymentStatus: "status",
        invoiceId: "id",
        issTaxRate: "iss_rate",
        municipalServiceCode: "service_type",
        serviceDescription: "invoice_description",
        invoiceEmail: "payer.email",
        fineAndInterest: "early_payment_discount",
      });
    }
  };

  // Log level filter and search
  const [logFilter, setLogFilter] = useState<"all" | "info" | "warn" | "error" | "success">("all");
  const [logSearch, setLogSearch] = useState("");

  // Logs state
  const [logs, setLogs] = useState<LogItem[]>([
    { id: "log-1", timestamp: "17:10:05", type: "info", message: "Inicializando conexão com barramento de integração escolar...", module: "SISTEMA" },
    { id: "log-2", timestamp: "17:10:06", type: "success", message: `Handshake de comunicação bem sucedido com ERP ${erpName.toUpperCase()}`, module: "NETWORK" },
    { id: "log-3", timestamp: "17:10:07", type: "info", message: "Verificando consistência das tabelas acadêmicas locais...", module: "DATABASE" },
    { id: "log-4", timestamp: "17:10:08", type: "warn", message: "Identificado 2 alunos sem CPF mapeado no ERP. Sincronia parcial permitida.", module: "VALIDACAO" },
    { id: "log-5", timestamp: "17:10:10", type: "success", message: "Sincronizado: 450 alunos ativos integrados com sucesso.", module: "SECRETARIA" },
    { id: "log-6", timestamp: "17:10:11", type: "error", message: "Erro: fatura boleto_012 não encontrada no ERP. Verifique o mapeamento de ID da cobrança.", module: "FINANCEIRO" },
    { id: "log-7", timestamp: "17:10:14", type: "info", message: "Iniciando verificação de rematrículas deferidas via webhook...", module: "CRM" },
    { id: "log-8", timestamp: "17:10:15", type: "success", message: "Sincronizado: 12 novos contratos de rematrícula processados no ERP.", module: "SISTEMA" },
  ]);

  // Audit logs of synchronization attempts (last 5 attempts)
  const [syncAttempts, setSyncAttempts] = useState<SyncAttemptLog[]>([
    {
      id: "att-5",
      timestamp: "20/07/2026 13:08:42",
      module: "FINANCEIRO",
      endpoint: "/api/v2/payments/sync",
      status: "success",
      details: "Sincronização concluída com sucesso. 124 faturas integradas.",
      code: 200,
    },
    {
      id: "att-4",
      timestamp: "20/07/2026 11:15:20",
      module: "SECRETARIA",
      endpoint: "/api/v2/students/bulk",
      status: "failed",
      details: "Falha na resposta da API externa: Timeout de rede excedido (45s).",
      code: 504,
    },
    {
      id: "att-3",
      timestamp: "20/07/2026 09:30:15",
      module: "ACADÊMICO",
      endpoint: "/api/v2/grades/export",
      status: "success",
      details: "Boletins consolidados exportados com sucesso para 432 turmas.",
      code: 200,
    },
    {
      id: "att-2",
      timestamp: "19/07/2026 18:22:05",
      module: "FINANCEIRO",
      endpoint: "/api/v2/payments/sync",
      status: "failed",
      details: "Chave API Inválida (Unauthorized). Credencial temporariamente revogada.",
      code: 401,
    },
    {
      id: "att-1",
      timestamp: "19/07/2026 14:05:59",
      module: "GERAL",
      endpoint: "/api/v2/system/full-dump",
      status: "success",
      details: "Carga atômica de dados concluída de forma consistente.",
      code: 200,
    },
  ]);

  // Sync History
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([
    {
      id: "sh-1",
      timestamp: "05/07/2026 16:30:11",
      module: "completo",
      status: "success",
      recordsProcessed: 450,
      durationMs: 1420,
      payloadMock: {
        sync_type: "full_database_dump",
        records_total: 450,
        provider: erpName,
        status: "COMMITTED",
        updated_entities: ["students", "grades", "billing", "withdrawals"],
        response: { code: 200, message: "Transaction successful" }
      }
    },
    {
      id: "sh-2",
      timestamp: "05/07/2026 12:00:00",
      module: "financeiro",
      status: "success",
      recordsProcessed: 124,
      durationMs: 820,
      payloadMock: {
        sync_type: "billing_invoices",
        records_total: 124,
        provider: erpName,
        status: "COMMITTED",
        updated_entities: ["invoices", "payments"],
        response: { code: 200, invoice_sync_count: 124 }
      }
    },
    {
      id: "sh-3",
      timestamp: "04/07/2026 18:45:30",
      module: "academico",
      status: "partial",
      recordsProcessed: 432,
      durationMs: 1150,
      payloadMock: {
        sync_type: "academic_grades",
        records_total: 450,
        unmatched_records: 18,
        reason: "Missing academic registration in ERP for 18 recent transfers",
        provider: erpName,
        status: "PARTIAL_COMMIT",
        response: { code: 206, warnings: "18 student records skipped due to non-existent ERP ID" }
      }
    },
    {
      id: "sh-4",
      timestamp: "03/07/2026 09:15:12",
      module: "secretaria",
      status: "failed",
      recordsProcessed: 0,
      durationMs: 5000,
      payloadMock: {
        sync_type: "student_roster",
        error: "Gateway Timeout 504",
        details: "The integration middleware failed to receive a timely response from ERP backend server.",
        destination_url: erpWebhookUrl,
        response: { code: 504, error_class: "GATEWAY_TIMEOUT" }
      }
    }
  ]);

  // Selected history item to display payload modal
  const [selectedHistoryPayload, setSelectedHistoryPayload] = useState<SyncHistoryItem | null>(null);

  // Active configuration tab within ERP
  const [erpActiveSubTab, setErpActiveSubTab] = useState<"painel" | "sincronizacao" | "agendador" | "mapeamento" | "headers" | "logs" | "alertas" | "alertas_whatsapp" | "regua_cobranca">(() => {
    const saved = localStorage.getItem("erp_active_subtab");
    if (saved && ["painel", "sincronizacao", "agendador", "mapeamento", "headers", "logs", "alertas", "alertas_whatsapp", "regua_cobranca"].includes(saved)) {
      return saved as any;
    }
    return "painel";
  });

  useEffect(() => {
    const checkTab = () => {
      const saved = localStorage.getItem("erp_active_subtab");
      if (saved && ["painel", "sincronizacao", "agendador", "mapeamento", "headers", "logs", "alertas", "alertas_whatsapp", "regua_cobranca"].includes(saved)) {
        setErpActiveSubTab(saved as any);
      }
    };
    window.addEventListener("erp_switch_subtab", checkTab);
    return () => window.removeEventListener("erp_switch_subtab", checkTab);
  }, []);

  // Webhook Alert Configurations for 15 days overdue
  const [daysOverdueThreshold, setDaysOverdueThreshold] = useState(15);
  const [delinquencyTarget, setDelinquencyTarget] = useState(4.5); // meta de inadimplência configurada (%)
  const [currentSchoolDelinquency, setCurrentSchoolDelinquency] = useState(5.8); // inadimplência calculada atual (%)
  const [enableEmailAlert, setEnableEmailAlert] = useState(true);
  const [enableSmsAlert, setEnableSmsAlert] = useState(true);
  const [emailAlertWebhookUrl, setEmailAlertWebhookUrl] = useState("https://api.escola.edu/webhooks/alerts-email");
  const [smsAlertWebhookUrl, setSmsAlertWebhookUrl] = useState("https://api.escola.edu/webhooks/alerts-sms");
  const [emailTemplate, setEmailTemplate] = useState("Prezados pais de {aluno}, informamos que a mensalidade venceu há {dias} dias. Solicitamos regularização para evitar encargos adicionais integrados no ERP. Atenciosamente, Coordenação Financeira.");
  const [smsTemplate, setSmsTemplate] = useState("Escola: Olá, a fatura de {aluno} está em atraso há {dias} dias (R$ {valor}). Por favor, regularize via aplicativo ou entre em contato.");
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Regras automáticas da coordenação baseadas na meta de inadimplência
  const [autoTriggerAboveTarget, setAutoTriggerAboveTarget] = useState(true);
  const [autoScaleSeverity, setAutoScaleSeverity] = useState(true);
  const [channelSelectionBasedOnTarget, setChannelSelectionBasedOnTarget] = useState(true);
  const [alertFrequencyMode, setAlertFrequencyMode] = useState<"dynamic" | "fixed">("dynamic");

  // Terminal scroll reference
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Add Log Helper
  const addLog = (type: "info" | "warn" | "error" | "success", message: string, module: string) => {
    const timeStr = new Date().toLocaleTimeString("pt-BR");
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: timeStr,
        type,
        message,
        module: module.toUpperCase(),
      }
    ]);
  };

  // Header helpers
  const handleAddHeader = () => {
    if (!newHeaderKey.trim() || !newHeaderVal.trim()) return;
    setHeaders(prev => [...prev, { key: newHeaderKey.trim(), value: newHeaderVal.trim() }]);
    addLog("info", `Adicionado cabeçalho HTTP personalizado: ${newHeaderKey}`, "CONFIG");
    setNewHeaderKey("");
    setNewHeaderVal("");
  };

  const handleRemoveHeader = (idx: number) => {
    const key = headers[idx].key;
    setHeaders(prev => prev.filter((_, i) => i !== idx));
    addLog("info", `Removido cabeçalho HTTP: ${key}`, "CONFIG");
  };

  // Trigger modular synchronizations
  const handleTriggerSync = (moduleType: "secretaria" | "academico" | "financeiro" | "completo") => {
    if (loadingModule) return;
    setLoadingModule(moduleType);
    setErpSyncStatus("sync_testing");
    
    addLog("info", `Iniciando rotina de sincronização: MÓDULO ${moduleType.toUpperCase()}...`, "JOB");
    addLog("info", `Enviando requisição POST para endpoint: ${erpWebhookUrl}`, "NETWORK");
    addLog("info", `Autenticando via SSL [Verification=${sslVerification ? "Ativa" : "Inativa"}] com timeout de ${timeoutSeconds}s...`, "SECURITY");

    // Add HTTP headers info
    headers.forEach(h => {
      addLog("info", `HTTP Header >> ${h.key}: ${h.key.toLowerCase().includes("key") || h.key.toLowerCase().includes("secret") || h.key.toLowerCase().includes("token") ? "******" : h.value}`, "NETWORK");
    });

    setTimeout(() => {
      const nowStr = new Date().toLocaleString("pt-BR");
      const duration = Math.floor(400 + Math.random() * 1200);
      let newSyncResult: SyncHistoryItem;
      
      if (moduleType === "secretaria") {
        addLog("success", `Handshake aceito pelo ERP ${erpName.toUpperCase()}. Sincronizando fichas cadastrais dos alunos...`, "SECRETARIA");
        addLog("success", `Concluído: 450 fichas de alunos validadas e atualizadas no ERP.`, "SECRETARIA");
        addLog("success", `✓ Sincronização da Secretaria finalizada em ${duration}ms com zero falhas!`, "JOB");
        
        newSyncResult = {
          id: `sh-${Date.now()}`,
          timestamp: nowStr,
          module: "secretaria",
          status: "success",
          recordsProcessed: 450,
          durationMs: duration,
          payloadMock: {
            sync_type: "secretaria_roster_sync",
            records_total: 450,
            provider: erpName,
            status: "COMMITTED",
            payload_data_excerpt: estudantes.map(s => ({ id: s.id, name: s.name, grade: s.grade, parent_email: s.parentEmail })),
            response: { code: 200, status: "OK", transaction_id: `tx-sec-${Math.floor(Math.random() * 100000)}` }
          }
        };
      } else if (moduleType === "academico") {
        addLog("success", `Exportando boletins consolidados, médias de bimestre e históricos...`, "ACADEMICO");
        addLog("warn", `Aviso: Aluna 'Luna Feérica' possui notas atualizadas recentemente que geraram reajuste no Quadro de Honra.`, "ACADEMICO");
        addLog("success", `Concluído: Notas de disciplinas mapeadas vinculadas com sucesso para as turmas escolares.`, "ACADEMICO");
        addLog("success", `✓ Sincronização Acadêmica finalizada em ${duration}ms.`, "JOB");

        newSyncResult = {
          id: `sh-${Date.now()}`,
          timestamp: nowStr,
          module: "academico",
          status: "success",
          recordsProcessed: estudantes.length * 3, // mock grade count
          durationMs: duration,
          payloadMock: {
            sync_type: "academic_grades_sync",
            records_total: estudantes.length * 3,
            provider: erpName,
            status: "COMMITTED_WITH_WARNINGS",
            warnings: ["Luna Feérica adjusted general average above cutoff"],
            response: { code: 200, success: true, processed_grades: estudantes.length * 3 }
          }
        };
      } else if (moduleType === "financeiro") {
        addLog("success", `Consultando faturas e recebimentos no provedor financeiro ${erpName.toUpperCase()}...`, "FINANCEIRO");
        addLog("success", `Verificando conciliação bancária de mensalidades escolares pendentes...`, "FINANCEIRO");
        addLog("success", `Concluído: Sincronia de faturamento de boleto emitido para as famílias finalizada.`, "FINANCEIRO");
        addLog("success", `✓ Sincronização Financeira finalizada em ${duration}ms.`, "JOB");

        newSyncResult = {
          id: `sh-${Date.now()}`,
          timestamp: nowStr,
          module: "financeiro",
          status: "success",
          recordsProcessed: 124,
          durationMs: duration,
          payloadMock: {
            sync_type: "financial_billing_sync",
            records_total: 124,
            provider: erpName,
            status: "COMMITTED",
            synced_invoices: [
              { invoice_id: "doc-102", amount: 1550, status: "PAID" },
              { invoice_id: "doc-103", amount: 1550, status: "PENDING" }
            ],
            response: { code: 200, status: "CONCILIATED", total_amount_brl: 192200 }
          }
        };
      } else {
        // Completo
        addLog("success", `Iniciando varredura global em massa para ERP corporativo...`, "DATABASE");
        addLog("success", `Tabelas sincronizadas de forma atômica e consistente com ${erpName.toUpperCase()}!`, "JOB");
        addLog("success", `✓ Sincronização Geral Completa concluída com sucesso.`, "JOB");

        newSyncResult = {
          id: `sh-${Date.now()}`,
          timestamp: nowStr,
          module: "completo",
          status: "success",
          recordsProcessed: 450,
          durationMs: duration,
          payloadMock: {
            sync_type: "full_database_dump",
            records_total: 450,
            provider: erpName,
            status: "COMMITTED",
            response: { code: 200, message: "Full system database synchronized consistently with standard API schema" }
          }
        };
      }

      const newAttempt: SyncAttemptLog = {
        id: `att-${Date.now()}`,
        timestamp: nowStr,
        module: moduleType.toUpperCase(),
        endpoint: moduleType === "secretaria" ? "/api/v2/students/bulk" :
                  moduleType === "academico" ? "/api/v2/grades/export" :
                  moduleType === "financeiro" ? "/api/v2/payments/sync" : "/api/v2/system/full-dump",
        status: "success",
        details: `Sincronização modular do módulo ${moduleType.toUpperCase()} concluída com sucesso.`,
        code: 200
      };

      setSyncHistory(prev => [newSyncResult, ...prev]);
      setSyncAttempts(prev => [newAttempt, ...prev.slice(0, 4)]);
      setErpSyncStatus("connected");
      setErpLastSyncTime(nowStr);
      setLoadingModule(null);

      setToast({
        message: `Sincronia modular [${moduleType.toUpperCase()}] concluída com êxito!`,
        type: "success"
      });
    }, 1500);
  };

  // Test ERP endpoint connection and add log to audit log
  const handleTestConnection = () => {
    if (erpSyncStatus === "sync_testing") return;
    setErpSyncStatus("sync_testing");
    addLog("info", `Iniciando teste de handshake com endpoint ERP: ${erpWebhookUrl}`, "NETWORK");
    
    setTimeout(() => {
      const nowStr = new Date().toLocaleString("pt-BR");
      // 80% success chance for a highly dynamic experience, showing failure logs as requested
      const isSuccess = Math.random() > 0.2;
      const responseCode = isSuccess ? 200 : (Math.random() > 0.5 ? 504 : 401);
      
      const newAttempt: SyncAttemptLog = {
        id: `att-${Date.now()}`,
        timestamp: nowStr,
        module: "PING_TEST",
        endpoint: "/api/v2/ping",
        status: isSuccess ? "success" : "failed",
        details: isSuccess 
          ? `Ping bem sucedido. Handshake aceito com sucesso pelo provedor ${erpName.toUpperCase()}.`
          : responseCode === 504 
            ? "Falha no teste de conexão: Timeout de rede excedido (Gateway Timeout)."
            : "Falha no teste de conexão: Credencial inválida ou token expirado (Unauthorized).",
        code: responseCode,
      };

      if (isSuccess) {
        addLog("success", `✓ Handshake bem sucedido com provedor ${erpName.toUpperCase()}!`, "NETWORK");
        setErpSyncStatus("connected");
        setErpLastSyncTime(nowStr);
        setToast({ message: "Conexão estabelecida com sucesso!", type: "success" });
      } else {
        addLog("error", `✗ Erro no teste de comunicação: Código HTTP ${responseCode}`, "NETWORK");
        setErpSyncStatus("disconnected");
        setToast({ message: "Falha na comunicação com o ERP escolar.", type: "error" });
      }

      setSyncAttempts(prev => [newAttempt, ...prev.slice(0, 4)]);
    }, 1500);
  };

  // Forçar Sincronização: Limpa cache local de faturas e busca pendências mais recentes diretamente da API
  const handleForceSync = () => {
    if (isForcingSync) return;
    setIsForcingSync(true);
    setShowForceSyncModal(true);
    setForceSyncProgress(10);
    setForceSyncStage("clearing_cache");
    setForceSyncStats(null);

    addLog("info", "Iniciando 'Forçar Sincronização': Limpando cache local de faturas...", "CACHE");

    // Etapa 1: Limpando cache local (localStorage e memória)
    setTimeout(() => {
      localStorage.removeItem("erp_invoices_cache");
      setInvoiceCacheInfo({
        isCached: false,
        cachedAt: "Cache Limpo",
        source: "API_DIRETA",
      });
      setForceSyncProgress(35);
      setForceSyncStage("connecting_api");
      addLog("info", "Cache local de faturas removido do localStorage com sucesso.", "CACHE");
      addLog("info", `Estabelecendo handshake TLS e conexão direta com a API ${erpName.toUpperCase()} [${erpWebhookUrl || "https://api.erp.colegio.br/v2"}]...`, "NETWORK");

      // Etapa 2: Handshake e conexão segura com a API
      setTimeout(() => {
        setForceSyncProgress(65);
        setForceSyncStage("downloading_invoices");
        addLog("info", `Autenticação Bearer aceita pelo ERP ${erpName.toUpperCase()}. Enviando GET /api/v2/invoices/pending...`, "FINANCEIRO");

        // Etapa 3: Download de pendências de faturas diretamente da API
        setTimeout(() => {
          setForceSyncProgress(88);
          setForceSyncStage("updating_cache");
          addLog("success", `✓ Resposta HTTP 200 recebida da API ${erpName.toUpperCase()}. 7 títulos em atraso e pendências financeiras obtidos!`, "FINANCEIRO");

          // Etapa 4: Reconciliação e renovação do cache local
          setTimeout(() => {
            const nowStr = new Date().toLocaleString("pt-BR");
            const timeOnly = new Date().toLocaleTimeString("pt-BR");

            // Atualiza faturas no estado com dados novos e flag isFromApi
            setMonitoredInvoices(FRESH_API_PENDING_INVOICES);

            // Grava novo cache com timestamp e metadados
            try {
              localStorage.setItem("erp_invoices_cache", JSON.stringify({
                cachedAt: new Date().toISOString(),
                source: "API_DIRETA",
                erpProvider: erpName,
                invoices: FRESH_API_PENDING_INVOICES,
              }));
            } catch (err) {
              console.error("Erro ao persistir novo cache:", err);
            }

            setInvoiceCacheInfo({
              isCached: true,
              cachedAt: timeOnly,
              source: "API_DIRETA",
            });

            setForceSyncStats({
              invoicesCount: FRESH_API_PENDING_INVOICES.length,
              totalAmount: "R$ 13.400,00",
              durationMs: 1480,
              apiEndpoint: `${erpWebhookUrl || "https://api.erp.colegio.br/v2"}/invoices/pending`,
            });

            const newAttempt: SyncAttemptLog = {
              id: `att-force-${Date.now()}`,
              timestamp: nowStr,
              module: "FINANCEIRO_API",
              endpoint: "/api/v2/invoices/pending",
              status: "success",
              details: `Forçar Sincronização: Cache invalidado e ${FRESH_API_PENDING_INVOICES.length} faturas pendentes obtidas diretamente da API ${erpName.toUpperCase()}.`,
              code: 200,
            };
            setSyncAttempts(prev => [newAttempt, ...prev.slice(0, 4)]);

            const newHistoryItem: SyncHistoryItem = {
              id: `sh-force-${Date.now()}`,
              timestamp: nowStr,
              module: "financeiro",
              status: "success",
              recordsProcessed: FRESH_API_PENDING_INVOICES.length,
              durationMs: 1480,
              payloadMock: {
                sync_type: "forced_api_invoices_sync",
                cache_cleared: true,
                source: "DIRECT_API",
                records_total: FRESH_API_PENDING_INVOICES.length,
                provider: erpName,
                endpoint: "/api/v2/invoices/pending",
                synced_invoices: FRESH_API_PENDING_INVOICES.map(f => ({
                  id: f.id,
                  student: f.student,
                  amount: f.amount,
                  days_overdue: f.days,
                  status: f.status,
                  due_date: f.dueDate,
                })),
                response: { code: 200, status: "CACHE_RENEWED", total_amount: "R$ 13.400,00" }
              }
            };
            setSyncHistory(prev => [newHistoryItem, ...prev]);

            setErpSyncStatus("connected");
            setErpLastSyncTime(timeOnly);
            setForceSyncProgress(100);
            setForceSyncStage("completed");
            setIsForcingSync(false);

            addLog("success", `✓ Sincronização Forçada Concluída: 7 faturas pendentes carregadas diretamente da API sem cache prévio.`, "JOB");

            setToast({
              message: `Cache limpo e faturas mais recentes sincronizadas diretamente da API ${erpName.toUpperCase()}!`,
              type: "success",
            });
          }, 450);
        }, 500);
      }, 500);
    }, 450);
  };

  // Save schema fields mappings
  const handleSaveMappings = () => {
    addLog("success", "Novo esquema de mapeamento de banco de dados gravado no JSON de configuração do ERP.", "CONFIG");
    setToast({
      message: "Configuração de mapeamento de banco de dados do ERP salva com sucesso!",
      type: "success"
    });
  };

  // Run simulation inside billing mapping wizard
  const runBillingSimulation = () => {
    setIsSimulatingWizard(true);
    setSimulationSuccess(false);
    setSimulationProgress([]);
    
    const steps = [
      "Iniciando rotina de homologação para o ERP " + wizardErp.toUpperCase() + "...",
      "Validando credenciais e cabeçalhos de autenticação HTTPS...",
      "Mapeando chaves do Magic Learning para o payload do ERP...",
      "Checando integridade de campos de Nota Fiscal de Serviços (Alíquota ISS e Código de Serviço)...",
      "Simulando emissão de NF-e na prefeitura via ambiente de testes...",
      "Sincronizando regras de juros, multas e descontos para faturamento...",
      "Verificando rota de webhook para retorno de liquidação de boletos...",
      "Payload JSON validado com sucesso! Comunicação homologada de ponta-a-ponta."
    ];

    steps.forEach((msg, i) => {
      setTimeout(() => {
        setSimulationProgress(prev => [...prev, msg]);
        addLog("info", `[WIZARD-TEST] ${msg}`, "WIZARD");
        if (i === steps.length - 1) {
          setIsSimulatingWizard(false);
          setSimulationSuccess(true);
          addLog("success", `✓ Homologação de faturamento concluída com sucesso para ${wizardErp.toUpperCase()}!`, "WIZARD");
          setToast({
            message: "Mapeamento validado e homologado com sucesso!",
            type: "success"
          });
        }
      }, (i + 1) * 600);
    });
  };

  // Save wizard configuration
  const handleSaveWizardResults = () => {
    // Save configurations
    setErpName(wizardErp);
    addLog("success", `Configuração completa do assistente gravada. ERP ativo alterado para ${wizardErp.toUpperCase()}.`, "WIZARD");
    setErpSyncStatus("connected");
    
    // Close wizard
    setIsWizardActive(false);
    setWizardStep(1);
    setSimulationSuccess(false);
    setSimulationProgress([]);

    setToast({
      message: `Configurações de faturamento e NF-e do ${wizardErp.toUpperCase()} salvas!`,
      type: "success"
    });
  };

  // Filtered Logs
  const filteredLogs = logs.filter(l => {
    const matchesFilter = logFilter === "all" || l.type === logFilter;
    const matchesSearch = l.message.toLowerCase().includes(logSearch.toLowerCase()) || 
                          l.module.toLowerCase().includes(logSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Real-time Connection Card */}
      <div className="bg-white/95 dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-amber-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-2 rounded-xl text-xs transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer shrink-0 shadow-xs mr-1"
                title="Voltar ao Painel da Escola"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            )}
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-indigo-700 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-lg sm:text-xl text-[#423326] dark:text-amber-100">Portal de Integração ERP & APIs</h2>
                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-900/60 uppercase">
                  v3.2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">Sincronize matrículas, boletins escolares e fluxo de faturamento do colégio com o ERP corporativo.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-950/50 p-2 rounded-2xl border border-slate-150 dark:border-slate-850">
            <div className="px-3 py-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-3xs flex items-center gap-2 relative overflow-hidden group">
              {erpSyncStatus === "sync_testing" ? (
                <div className="relative flex items-center justify-center w-3 h-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-amber-450 opacity-75 animate-ping" />
                  <RefreshCw className="w-3 h-3 text-amber-500 animate-spin shrink-0 relative z-10" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  {erpSyncStatus === "connected" && (
                    <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  )}
                  <span className={`w-2 h-2 rounded-full shrink-0 relative ${
                    erpSyncStatus === "connected" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-400"
                  }`} />
                </div>
              )}
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 dark:text-slate-300 font-black flex items-center gap-1.5">
                {erpSyncStatus === "connected" && (
                  <span className="text-emerald-600 dark:text-emerald-400">Ativo e Conectado</span>
                )}
                {erpSyncStatus === "sync_testing" && (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <span>Efetuando Handshake</span>
                    <span className="inline-flex gap-0.5">
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </span>
                )}
                {erpSyncStatus === "disconnected" && "Offline / Desconectado"}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 dark:text-slate-400 px-3 py-1 font-sans flex items-center gap-1">
              <span>Última Sincronização:</span>
              <span className="font-mono font-bold text-[#423326] dark:text-amber-200 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200/40">
                {erpLastSyncTime}
              </span>
            </div>

            <button
              type="button"
              id="btn-open-invoice-alerts-modal-erp-header"
              onClick={() => handleTriggerInvoiceAlertModal()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold font-sans flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Abrir modal de configuração de alertas automáticos de WhatsApp para faturas com vencimento em até 30 dias"
            >
              <MessageSquare className="w-3 h-3 text-emerald-200" />
              <span>Alertas WhatsApp de Faturas (1-30d)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsQuickWebhooksModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold font-sans flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Zap className="w-3 h-3 text-indigo-200 animate-pulse" />
              <span>Configuração Rápida de Webhooks</span>
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={erpSyncStatus === "sync_testing"}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-750 dark:text-indigo-350 rounded-xl border border-indigo-200 dark:border-indigo-900 text-[10px] font-bold font-sans flex items-center gap-1.5 transition-all shadow-3xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 text-indigo-600 dark:text-indigo-400 ${erpSyncStatus === "sync_testing" ? "animate-spin" : ""}`} />
              <span>Testar Conexão</span>
            </button>

            <button
              type="button"
              id="btn-force-sync-erp-header"
              onClick={handleForceSync}
              disabled={isForcingSync}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[10px] font-black font-sans flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Limpa o cache local de faturas e busca as pendências mais recentes diretamente da API"
            >
              <RotateCcw className={`w-3 h-3 text-slate-950 ${isForcingSync ? "animate-spin" : ""}`} />
              <span>Forçar Sincronização</span>
              <span className="text-[8px] uppercase tracking-wider bg-slate-950/15 text-slate-950 px-1 py-0.5 rounded font-mono font-black">
                Bypass Cache
              </span>
            </button>
          </div>
        </div>

        {/* Sync Quick Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-[#fcfaf5] dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-3xs">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              Alunos Sincronizados
            </div>
            <p className="text-lg sm:text-2xl font-serif font-black text-[#423326] dark:text-amber-100 mt-1">450 / 450</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                <span className="bg-indigo-600 block h-full rounded-full" style={{ width: "100%" }} />
              </span>
              <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">100%</span>
            </div>
          </div>

          <div className="bg-[#fcfaf5] dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-3xs">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-amber-500" />
              Boletos no Mês
            </div>
            <p className="text-lg sm:text-2xl font-serif font-black text-[#423326] dark:text-amber-100 mt-1">124 Emitidos</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Todos com Registro ERP
            </p>
          </div>

          <div className="bg-[#fcfaf5] dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-3xs">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 text-emerald-500" />
              Campos Mapeados
            </div>
            <p className="text-lg sm:text-2xl font-serif font-black text-[#423326] dark:text-amber-100 mt-1">6 / 6 Campos</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
              Esquema de banco verificado
            </p>
          </div>

          <div className="bg-[#fcfaf5] dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 shadow-3xs">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Taxa de Sucesso API
            </div>
            <p className="text-lg sm:text-2xl font-serif font-black text-[#423326] dark:text-amber-100 mt-1">99.8%</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
              Últimas 10 mil requisições
            </p>
          </div>
        </div>
      </div>

      {/* Main Configurations & Interactive Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: API Settings & Field Mapping */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Navigation Sub-Tabs inside ERP Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 flex gap-1.5 shadow-2xs overflow-x-auto">
            <button
              onClick={() => setErpActiveSubTab("painel")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                erpActiveSubTab === "painel"
                  ? "bg-indigo-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Parâmetros e Endpoints
            </button>
            <button
              id="subtab-regua-cobranca"
              onClick={() => {
                setErpActiveSubTab("regua_cobranca");
                localStorage.setItem("erp_active_subtab", "regua_cobranca");
              }}
              className={`py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                erpActiveSubTab === "regua_cobranca"
                  ? "bg-amber-500 text-slate-950 font-black shadow-xs ring-2 ring-amber-400/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950"
              }`}
              title="Configurar horários, frequência e critérios da régua de cobrança automática do ERP"
            >
              <BellRing className={`w-3.5 h-3.5 ${erpActiveSubTab === "regua_cobranca" ? "text-slate-950" : "text-amber-500"}`} />
              <span>Horários & Critérios da Régua</span>
              <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-950 dark:bg-amber-950 dark:text-amber-300">
                Auto ERP
              </span>
            </button>
            <button
              onClick={() => setErpActiveSubTab("sincronizacao")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                erpActiveSubTab === "sincronizacao"
                  ? "bg-indigo-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Sincronização & Polling
            </button>
            <button
              id="subtab-agendador-lembretes"
              onClick={() => {
                setErpActiveSubTab("agendador");
                localStorage.setItem("erp_active_subtab", "agendador");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                erpActiveSubTab === "agendador"
                  ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-400/40"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Agendador & Disparos</span>
              <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                1-30d
              </span>
            </button>
            <button
              onClick={() => {
                setErpActiveSubTab("alertas_whatsapp");
                localStorage.setItem("erp_active_subtab", "alertas_whatsapp");
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                erpActiveSubTab === "alertas_whatsapp"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Alertas WhatsApp
            </button>
            <button
              onClick={() => setErpActiveSubTab("mapeamento")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                erpActiveSubTab === "mapeamento"
                  ? "bg-indigo-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Mapeamento DB
            </button>
            <button
              onClick={() => setErpActiveSubTab("headers")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                erpActiveSubTab === "headers"
                  ? "bg-indigo-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              HTTP Headers
            </button>
            <button
              onClick={() => setErpActiveSubTab("logs")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                erpActiveSubTab === "logs"
                  ? "bg-indigo-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Logs Console
            </button>
            <button
              onClick={() => setErpActiveSubTab("alertas")}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                erpActiveSubTab === "alertas"
                  ? "bg-indigo-700 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950"
              }`}
            >
              <span className="text-sm">🔔</span>
              Regras Gerais
            </button>
          </div>

          {/* Sub-tab: Painel (API Connection configuration) */}
          {erpActiveSubTab === "painel" && (
            <div className="bg-white/95 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100/50 dark:border-slate-850 pb-2.5">
                <h3 className="font-serif font-black text-sm uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-600" /> Configuração do Webhook e Endpoints
                </h3>
                <button
                  type="button"
                  onClick={() => setIsQuickWebhooksModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <Zap className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Configuração Rápida de Webhooks</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-sans">
                      Provedor do Sistema Escolar (ERP):
                    </label>
                    <select
                      value={erpName}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setErpName(val);
                        addLog("info", `Provedor do ERP alterado para: ${val.toUpperCase()}`, "SISTEMA");
                        setToast({ message: `ERP alterado para ${val.toUpperCase()}!`, type: "info" });
                      }}
                      className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-amber-250 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="totvs">TOTVS Escolar Core 🏢</option>
                      <option value="sap">SAP Business One ⚙️</option>
                      <option value="asaas">Asaas Cobranças Automáticas 💰</option>
                      <option value="iugu">Iugu Sandbox APIs 💳</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-sans">
                      Frequência de Sincronia Geral:
                    </label>
                    <select
                      value={syncFrequency}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setSyncFrequency(val);
                        addLog("info", `Frequência de sincronia automática atualizada: ${val}`, "SCHEDULER");
                      }}
                      className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-amber-250 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="realtime">Webhook em Tempo Real + Polling ⚡</option>
                      <option value="hourly">A cada hora (Recorrente) 🕐</option>
                      <option value="daily">Diária (Todas as noites às 02h) 📅</option>
                      <option value="manual">Apenas Manual (Sob demanda) 🛠️</option>
                    </select>
                  </div>
                </div>

                {/* Configurações Rápidas de Sincronização & Polling Automático */}
                <div className="bg-slate-50/80 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/50 dark:border-slate-850 pb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-[#423326] dark:text-amber-100 uppercase tracking-wide font-mono">
                        Intervalo Automático de Polling de Boletos & Pagamentos
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErpActiveSubTab("sincronizacao")}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <span>Abrir Configurações Completas</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Consulta periódica na fila do ERP para novos boletos emitidos e liquidações via webhook.
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-mono">
                          Ciclo atual: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{pollingIntervalMinutes} min</strong> (~{Math.round(1440 / (pollingIntervalMinutes || 15))} req/dia)
                        </span>
                        <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                          pollingEnabled 
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }`}>
                          {pollingEnabled ? "● Polling Ativo" : "○ Polling Pausado"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.max(1, pollingIntervalMinutes - 5);
                          setPollingIntervalMinutes(next);
                          localStorage.setItem("erp_polling_interval_minutes", next.toString());
                          addLog("info", `Intervalo de polling reajustado para ${next} minutos.`, "SCHEDULER");
                        }}
                        className="w-8 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm flex items-center justify-center cursor-pointer shadow-3xs"
                        title="Reduzir 5 minutos"
                      >
                        -
                      </button>

                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          value={pollingIntervalMinutes}
                          onChange={(e) => {
                            const val = Math.max(1, Math.min(1440, parseInt(e.target.value, 10) || 1));
                            setPollingIntervalMinutes(val);
                            localStorage.setItem("erp_polling_interval_minutes", val.toString());
                          }}
                          className="w-20 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 rounded-lg px-2.5 py-1.5 text-center text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="absolute right-2 text-[9px] text-slate-400 pointer-events-none font-mono">
                          min
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.min(1440, pollingIntervalMinutes + 5);
                          setPollingIntervalMinutes(next);
                          localStorage.setItem("erp_polling_interval_minutes", next.toString());
                          addLog("info", `Intervalo de polling reajustado para ${next} minutos.`, "SCHEDULER");
                        }}
                        className="w-8 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-sm flex items-center justify-center cursor-pointer shadow-3xs"
                        title="Aumentar 5 minutos"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Preset quick pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[9.5px] font-mono text-slate-400 font-bold mr-1">Atalhos:</span>
                    {[
                      { l: "5 min", v: 5 },
                      { l: "15 min", v: 15 },
                      { l: "30 min", v: 30 },
                      { l: "60 min (1h)", v: 60 },
                      { l: "360 min (6h)", v: 360 },
                      { l: "1440 min (24h)", v: 1440 }
                    ].map(p => (
                      <button
                        key={p.v}
                        type="button"
                        onClick={() => {
                          setPollingIntervalMinutes(p.v);
                          localStorage.setItem("erp_polling_interval_minutes", p.v.toString());
                          setToast({ message: `Intervalo de polling ajustado para ${p.v} min.`, type: "info" });
                          addLog("info", `Intervalo de polling rápido selecionado: ${p.v} minutos.`, "SCHEDULER");
                        }}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                          pollingIntervalMinutes === p.v
                            ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 font-bold"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        {p.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PAINEL DE CONFIGURAÇÃO: HORÁRIOS E CRITÉRIOS DE ENVIO (RÉGUA DE COBRANÇA ERP) */}
                <div 
                  id="panel-config-regua-cobranca-erp" 
                  className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-amber-300/80 dark:border-amber-900/60 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 dark:border-slate-800 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300/70 dark:border-amber-800 flex items-center gap-1.5">
                          <BellRing className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          <span>Régua de Cobrança ERP</span>
                        </span>
                        <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                          inlineScheduleActive 
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" 
                            : "bg-slate-100 dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800"
                        }`}>
                          {inlineScheduleActive ? "● Automação Ativa" : "○ Automação Pausada"}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        Horários e Critérios de Envio dos Lembretes Automáticos
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Configure a cadência temporal, horário do robô e critérios de elegibilidade das faturas a vencer/vencidas do ERP.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const next = !inlineScheduleActive;
                          handleSaveInlineScheduleConfig(next);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          inlineScheduleActive
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                            : "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                        }`}
                        title="Ativar ou pausar a rotina automática"
                      >
                        {inlineScheduleActive ? "Pausar Rotina" : "Ativar Rotina"}
                      </button>

                      <button
                        type="button"
                        id="btn-goto-full-regua-panel"
                        onClick={() => {
                          setErpActiveSubTab("regua_cobranca");
                          localStorage.setItem("erp_active_subtab", "regua_cobranca");
                        }}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        title="Abrir central avançada com simulação em tempo real e testes"
                      >
                        <span>Painel Completo & Simulação</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Operational Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Coluna 1: Horários & Frequência */}
                    <div className="bg-slate-50/70 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                        <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          1. Horário de Disparo & Frequência
                        </span>
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                          {inlineScheduleTime}h
                        </span>
                      </div>

                      {/* Horário Input e Presets */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-500 block uppercase">
                          Horário do Disparo Diário:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={inlineScheduleTime}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleSaveInlineScheduleConfig(undefined, e.target.value);
                              }
                            }}
                            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex items-center gap-1 flex-wrap">
                            {["08:00", "09:00", "10:30", "14:00", "18:00"].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => handleSaveInlineScheduleConfig(undefined, t)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border transition-all ${
                                  inlineScheduleTime === t
                                    ? "bg-indigo-600 text-white font-bold border-indigo-700"
                                    : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Frequência da Régua (Diário, Semanal, Quinzenal) */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
                            <Repeat className="w-3 h-3 text-amber-500" />
                            <span>Frequência da Régua ERP:</span>
                          </label>
                          <span className="text-[9.5px] font-mono font-bold text-amber-700 dark:text-amber-400">
                            {inlineScheduleFrequency === "diario" ? "Diário (24h)" : inlineScheduleFrequency === "semanal" ? "Semanal (7d)" : "Quinzenal (15d)"}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: "diario", label: "Diário", badge: "24h", desc: "Varredura contínua" },
                            { id: "semanal", label: "Semanal", badge: "7d", desc: "A cada 7 dias" },
                            { id: "quinzenal", label: "Quinzenal", badge: "15d", desc: "Ciclo quinzenal" },
                          ].map((f) => {
                            const isSel = inlineScheduleFrequency === f.id;
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => handleSaveInlineScheduleConfig(undefined, undefined, f.id as any)}
                                className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                                  isSel
                                    ? "bg-amber-500/20 border-amber-500 text-amber-950 dark:text-amber-100 font-bold"
                                    : "bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-amber-300"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-black">{f.label}</span>
                                  <span className="text-[8.5px] font-mono opacity-80">{f.badge}</span>
                                </div>
                                <span className="text-[8.5px] text-slate-400 block mt-0.5 leading-tight">{f.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Coluna 2: Critérios da Régua de Cobrança */}
                    <div className="bg-slate-50/70 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-2">
                        <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
                          <Filter className="w-3.5 h-3.5 text-emerald-500" />
                          2. Critérios da Régua & Estágios
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                          Min: R$ {inlineMinValue.toFixed(2)}
                        </span>
                      </div>

                      {/* Estágios da Régua */}
                      <div className="space-y-2">
                        {/* Pré-vencimento D-X */}
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                              Pré-Vencimento (Preventivo)
                            </span>
                            <span className="text-[9.5px] text-slate-400 block">
                              Envia código PIX antes do vencimento
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="number"
                              min={1}
                              max={30}
                              value={inlineDaysBefore}
                              onChange={(e) => {
                                const val = Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 5));
                                handleSaveInlineScheduleConfig(undefined, undefined, undefined, val);
                              }}
                              className="w-14 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-center text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                            />
                            <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400">
                              D-{inlineDaysBefore} dias
                            </span>
                          </div>
                        </div>

                        {/* Dia do Vencimento D-0 */}
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                              No Dia do Vencimento (D-0)
                            </span>
                            <span className="text-[9.5px] text-slate-400 block">
                              Alerta matinal cordial no vencimento
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSaveInlineScheduleConfig(undefined, undefined, undefined, undefined, !inlineDueDayEnabled)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer border ${
                              inlineDueDayEnabled
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                                : "bg-slate-100 text-slate-500 border-slate-300"
                            }`}
                          >
                            {inlineDueDayEnabled ? "Ativo (D-0)" : "Desativado"}
                          </button>
                        </div>

                        {/* Pós-Vencimento D+X */}
                        <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                              Pós-Vencimento (Atraso)
                            </span>
                            <span className="text-[9.5px] text-slate-400 block">
                              Aviso com encargos e regularização
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <input
                              type="number"
                              min={1}
                              max={15}
                              value={inlineDaysAfter}
                              onChange={(e) => {
                                const val = Math.max(1, Math.min(15, parseInt(e.target.value, 10) || 3));
                                handleSaveInlineScheduleConfig(undefined, undefined, undefined, undefined, undefined, true, val);
                              }}
                              className="w-14 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-center text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                            />
                            <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400">
                              D+{inlineDaysAfter} dias
                            </span>
                          </div>
                        </div>

                        {/* Valor Mínimo */}
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-mono">Valor Mínimo da Fatura:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 font-mono">R$</span>
                            <input
                              type="number"
                              min={1}
                              step={5}
                              value={inlineMinValue}
                              onChange={(e) => {
                                const val = Math.max(1, parseFloat(e.target.value) || 50);
                                handleSaveInlineScheduleConfig(undefined, undefined, undefined, undefined, undefined, undefined, undefined, val);
                              }}
                              className="w-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-0.5 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback footer */}
                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Faturas quitadas no ERP são automaticamente excluídas da régua. Telefones validados via webhook.</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSaveInlineScheduleConfig()}
                      className="px-3 py-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity self-end sm:self-auto"
                    >
                      Salvar Critérios da Régua
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-sans">
                    URL Base / API Endpoint do ERP:
                  </label>
                  <input 
                    type="text"
                    className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-amber-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-indigo-600"
                    value={erpWebhookUrl}
                    onChange={(e) => {
                      setErpWebhookUrl(e.target.value);
                    }}
                  />
                  <p className="text-[9px] text-slate-400 italic">As requisições REST/HTTPS contendo payloads JSON serão disparadas para este destino.</p>
                </div>

                {erpName === "totvs" && (
                  <div className="bg-indigo-50/55 dark:bg-slate-950/45 p-4 rounded-2xl border border-indigo-150 dark:border-slate-800 space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2 border-b border-indigo-100/50 dark:border-slate-800 pb-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                      <span className="text-xs font-black uppercase text-indigo-950 dark:text-indigo-300 font-serif tracking-wide">
                        Parâmetros Exclusivos - TOTVS Escolar Core
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* API Versioning */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-sans">
                          Versão da API (TOTVS REST):
                        </label>
                        <select
                          value={totvsApiVersion}
                          onChange={(e) => {
                            setTotvsApiVersion(e.target.value);
                            addLog("info", `Versão da API TOTVS atualizada para: ${e.target.value}`, "SISTEMA");
                            setToast({ message: `API TOTVS configurada para ${e.target.value}`, type: "success" });
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-indigo-150 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                        >
                          <option value="v1.0-legacy">v1.0 (REST Legacy/SOAP)</option>
                          <option value="v2.0-rpc">v2.0 (RPC Batch Processing)</option>
                          <option value="v3.0-core">v3.0-core (RESTful JSON - Recomendado)</option>
                          <option value="v4.0-graphql">v4.0 (GraphQL Schema)</option>
                        </select>
                      </div>

                      {/* Batch Processing Interval */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-sans">
                          Intervalo do Lote de Processamento (Batch Interval):
                        </label>
                        <select
                          value={totvsBatchInterval}
                          onChange={(e) => {
                            setTotvsBatchInterval(e.target.value);
                            addLog("info", `Intervalo de lote TOTVS atualizado para: ${e.target.value} minutos`, "SCHEDULER");
                            setToast({ message: `Intervalo de lote TOTVS definido para ${e.target.value} minutos`, type: "success" });
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-indigo-150 dark:border-slate-800 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                        >
                          <option value="5">A cada 5 minutos (Quase Tempo Real)</option>
                          <option value="15">A cada 15 minutos (Padrão Sincronia)</option>
                          <option value="30">A cada 30 minutos (Recomendado)</option>
                          <option value="60">A cada 1 hora (Alta performance)</option>
                          <option value="360">A cada 6 horas (Agrupado)</option>
                          <option value="1440">Diário (Apenas de Madrugada)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-sans">
                    Token Bearer Privado (Access JWT Secret Key):
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 text-slate-450 w-4 h-4" />
                    <input 
                      type={showApiKey ? "text" : "password"}
                      placeholder="Insira a chave secreta de integração fornecida pelo ERP..."
                      className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-amber-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-indigo-600"
                      value={erpApiKey}
                      onChange={(e) => {
                        setErpApiKey(e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-indigo-600 focus:outline-none"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-350 uppercase">Timeout da Requisição:</span>
                      <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400">{timeoutSeconds} segundos</span>
                    </div>
                    <input 
                      type="range"
                      min="5"
                      max="30"
                      step="5"
                      value={timeoutSeconds}
                      onChange={(e) => {
                        setTimeoutSeconds(parseInt(e.target.value));
                        addLog("info", `Timeout de conexão configurado para ${e.target.value} segundos.`, "SISTEMA");
                      }}
                      className="w-full accent-indigo-600 bg-indigo-100 dark:bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-850 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-350 uppercase block">Verificação de SSL:</span>
                      <span className="text-[9px] text-slate-400">Requer certificado SSL válido no ERP</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={sslVerification} 
                        onChange={(e) => {
                          setSslVerification(e.target.checked);
                          addLog("warn", `Segurança SSL alterada para: ${e.target.checked ? "Verificação Estrita" : "Modo Flexível (Inseguro)"}`, "SECURITY");
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-[#fdfaf3] dark:bg-slate-950 p-4 rounded-xl border border-amber-100 dark:border-slate-850 flex gap-3 text-[11px] text-slate-600 dark:text-slate-350">
                  <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-slate-800 dark:text-amber-100 mb-0.5">Instrução de Integração Remota:</span>
                    Certifique-se de configurar a porta do servidor do ERP e dar permissão de CORS para o domínio da sua aplicação escolar de modo a garantir o handshake RESTful seguro de ponta-a-ponta.
                  </div>
                </div>

                {/* REAL-TIME SYNC LOG PANEL FOR TI MONITORING */}
                <div id="live-ti-log-console" className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        📟 Painel de Logs de Sincronização em Tempo Real (TI)
                      </h4>
                      <p className="text-[9.5px] text-slate-450">Canal ativo com barramento ERP. Logs técnicos e monitoramento de webhooks.</p>
                    </div>

                    <div className="flex gap-1.5 text-[9px] font-mono font-bold flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date().toLocaleTimeString();
                          setLogs(prev => [
                            ...prev,
                            { id: `log-sim-${Date.now()}-1`, timestamp: now, type: "success", message: "Sincronizado: 450 alunos ativos integrados com sucesso.", module: "SECRETARIA" }
                          ]);
                          setToast({ message: "Simulado: Sincronizado 450 alunos!", type: "success" });
                        }}
                        className="bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-md cursor-pointer"
                      >
                        + Sync Alunos
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date().toLocaleTimeString();
                          setLogs(prev => [
                            ...prev,
                            { id: `log-sim-${Date.now()}-2`, timestamp: now, type: "error", message: "Erro: fatura boleto_012 não encontrada no ERP. Verifique o mapeamento.", module: "FINANCEIRO" }
                          ]);
                          setToast({ message: "Simulado: Erro de fatura boleto_012!", type: "error" });
                        }}
                        className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 rounded-md cursor-pointer"
                      >
                        + Erro Boleto
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLogs([]);
                          setToast({ message: "Console limpo", type: "info" });
                        }}
                        className="bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-850 px-2 py-0.5 rounded-md cursor-pointer"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  {/* Terminal Screen inside Painel sub-tab */}
                  <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl font-mono text-[10px] leading-relaxed max-h-48 overflow-y-auto space-y-1 text-slate-300 shadow-inner">
                    {logs.length === 0 ? (
                      <p className="text-slate-550 italic text-center py-6">Nenhum evento registrado no buffer. Use os botões de simulação.</p>
                    ) : (
                      logs.slice(-6).map((log) => (
                        <div key={log.id} className="flex items-start gap-2 border-b border-slate-900/40 pb-0.5 last:border-0">
                          <span className="text-slate-550 shrink-0">[{log.timestamp}]</span>
                          <span className={`px-1 py-0.2 rounded text-[8px] font-black uppercase shrink-0 ${
                            log.type === "success" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" :
                            log.type === "error" ? "bg-rose-950 text-rose-400 border border-rose-900/50" :
                            log.type === "warn" ? "bg-amber-950 text-amber-400 border border-amber-900/50" :
                            "bg-blue-950 text-blue-400 border border-blue-900/50"
                          }`}>
                            {log.module}
                          </span>
                          <span className={
                            log.type === "error" ? "text-rose-400 font-bold" :
                            log.type === "success" ? "text-emerald-300 font-bold" :
                            log.type === "warn" ? "text-amber-300" : "text-slate-200"
                          }>
                            {log.message}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab: Alertas (Webhook and Overdue Rules Configuration) */}
          {erpActiveSubTab === "alertas" && (
            <div className="bg-white/95 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6" id="erp-alerts-panel">
              <div className="flex items-center justify-between border-b border-amber-100/50 dark:border-slate-850 pb-3">
                <h3 className="font-serif font-black text-sm uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-2">
                  <span className="text-sm">🔔</span> Regras de Alertas Automáticos por Atraso
                </h3>
                <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/40 uppercase">
                  Coordenação Ativa
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Defina o limiar de atraso e configure os canais de webhooks para enviar notificações automáticas de cobrança. As regras de disparo e a frequência de alertas são ajustadas com base na comparação da inadimplência atual frente à meta institucional.
                </p>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* CONFIGURAÇÃO E WEBHOOKS - COLSPAN 7 */}
                  <div className="xl:col-span-7 space-y-6">
                    {/* Thresholds & Target */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Overdue Threshold */}
                      <div className="bg-slate-50/50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-sans">
                          Dias de Atraso para Alerta (Gatilho):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="90"
                            value={daysOverdueThreshold}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 15;
                              setDaysOverdueThreshold(val);
                              addLog("info", `Gatilho de atraso alterado para ${val} dias.`, "ALERTA");
                            }}
                            className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-amber-250 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                          <span className="text-xs text-slate-500 font-sans whitespace-nowrap">dias (Recomendado: 15)</span>
                        </div>
                      </div>

                      {/* Delinquency Target */}
                      <div className="bg-slate-50/50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-sans">
                          Meta de Inadimplência Configurada (%):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0.5"
                            max="15"
                            value={delinquencyTarget}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 4.5;
                              setDelinquencyTarget(val);
                              addLog("info", `Meta de inadimplência reajustada para ${val}%.`, "ALERTA");
                            }}
                            className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-amber-250 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                          />
                          <span className="text-xs text-slate-500 font-sans whitespace-nowrap">% (Controle institucional)</span>
                        </div>
                      </div>
                    </div>

                    {/* Webhooks config */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 font-sans tracking-widest border-b border-slate-100 dark:border-slate-850 pb-1 flex items-center gap-1.5">
                        <span>🔗</span> Canais de Webhooks e Gatilhos
                      </h4>

                      {/* Email Webhook */}
                      <div className="bg-slate-50/50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="enable-email-alert-check"
                              checked={enableEmailAlert}
                              onChange={(e) => {
                                setEnableEmailAlert(e.target.checked);
                                addLog("info", `Alerta via e-mail webhook ${e.target.checked ? "habilitado" : "desabilitado"}.`, "ALERTA");
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="enable-email-alert-check" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                              Disparar Webhook de E-mail ✉️
                            </label>
                          </div>
                          <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-md uppercase ${enableEmailAlert ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30" : "text-slate-400 bg-slate-100 dark:bg-slate-900"}`}>
                            {enableEmailAlert ? "Ativo" : "Inativo"}
                          </span>
                        </div>

                        {enableEmailAlert && (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <span className="text-[9px] text-slate-400 block font-mono">ENDPOINT HTTP (POST):</span>
                              <input
                                type="url"
                                value={emailAlertWebhookUrl}
                                onChange={(e) => setEmailAlertWebhookUrl(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600"
                                placeholder="https://api.escola.edu/webhooks/alerts-email"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[9px] text-slate-400 block font-mono">CORPO DO E-MAIL (TEMPLATE):</span>
                              <textarea
                                rows={3}
                                value={emailTemplate}
                                onChange={(e) => setEmailTemplate(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-sans text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600"
                              />
                              <div className="flex flex-wrap gap-1">
                                {["{aluno}", "{responsavel}", "{dias}", "{valor}", "{fatura}"].map(tag => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setEmailTemplate(prev => prev + " " + tag)}
                                    className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SMS Webhook */}
                      <div className="bg-slate-50/50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="enable-sms-alert-check"
                              checked={enableSmsAlert}
                              onChange={(e) => {
                                setEnableSmsAlert(e.target.checked);
                                addLog("info", `Alerta via SMS webhook ${e.target.checked ? "habilitado" : "desabilitado"}.`, "ALERTA");
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="enable-sms-alert-check" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                              Disparar Webhook de SMS / WhatsApp 📱
                            </label>
                          </div>
                          <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-md uppercase ${enableSmsAlert ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30" : "text-slate-400 bg-slate-100 dark:bg-slate-900"}`}>
                            {enableSmsAlert ? "Ativo" : "Inativo"}
                          </span>
                        </div>

                        {enableSmsAlert && (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <span className="text-[9px] text-slate-400 block font-mono">ENDPOINT HTTP (POST):</span>
                              <input
                                type="url"
                                value={smsAlertWebhookUrl}
                                onChange={(e) => setSmsAlertWebhookUrl(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600"
                                placeholder="https://api.escola.edu/webhooks/alerts-sms"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[9px] text-slate-400 block font-mono">CORPO DO SMS (MENSAGEM):</span>
                              <textarea
                                rows={2}
                                value={smsTemplate}
                                onChange={(e) => setSmsTemplate(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-sans text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600"
                              />
                              <div className="flex flex-wrap gap-1">
                                {["{aluno}", "{responsavel}", "{dias}", "{valor}"].map(tag => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setSmsTemplate(prev => prev + " " + tag)}
                                    className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded transition-all cursor-pointer"
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PAINEL DE REGRAS DE AUTOMATIZAÇÃO DA COORDENAÇÃO (BASEADO NA META) */}
                      <div className="bg-gradient-to-br from-indigo-50/40 to-purple-50/20 dark:from-indigo-950/20 dark:to-purple-950/10 border border-indigo-150 dark:border-indigo-900/40 rounded-3xl p-5 space-y-4 shadow-3xs animate-fade-in">
                        <div className="flex items-center gap-2 border-b border-indigo-100/60 dark:border-indigo-900/30 pb-2.5">
                          <span className="text-base">⚙️</span>
                          <div>
                            <h4 className="text-xs font-black uppercase text-[#423326] dark:text-amber-100 font-sans tracking-wider">
                              Painel de Regras da Coordenação (Meta de Inadimplência)
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                              Defina regras de ação automática com base na meta de {delinquencyTarget}% de inadimplência.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3.5">
                          {/* Regra 1: Ativação Inteligente */}
                          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-3xs">
                            <input
                              type="checkbox"
                              id="auto-trigger-above-target"
                              checked={autoTriggerAboveTarget}
                              onChange={(e) => {
                                setAutoTriggerAboveTarget(e.target.checked);
                                addLog("info", `Regra 'Disparar apenas se acima da meta' alterada para ${e.target.checked ? "Ativa" : "Inativa"}.`, "ALERTA");
                              }}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <label htmlFor="auto-trigger-above-target" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                                Disparar Alertas Apenas se Ultrapassar a Meta 📈
                              </label>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                                Se ativo, os disparos automáticos via webhook serão temporariamente pausados caso a taxa atual ({currentSchoolDelinquency}%) esteja abaixo da meta ({delinquencyTarget}%).
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded ${
                                  autoTriggerAboveTarget 
                                    ? (currentSchoolDelinquency > delinquencyTarget ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")
                                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                }`}>
                                  {autoTriggerAboveTarget 
                                    ? (currentSchoolDelinquency > delinquencyTarget ? "Status: Bloqueio Inativo (Disparando porque estourou!)" : "Status: Bloqueio Ativo (Abaixo da meta - Webhook suspenso)")
                                    : "Status: Desativado (Sempre disparar)"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Regra 2: Intensificação de Severidade */}
                          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-3xs">
                            <input
                              type="checkbox"
                              id="auto-scale-severity"
                              checked={autoScaleSeverity}
                              onChange={(e) => {
                                setAutoScaleSeverity(e.target.checked);
                                addLog("info", `Regra 'Intensificação de Severidade' alterada para ${e.target.checked ? "Ativa" : "Inativa"}.`, "ALERTA");
                              }}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <label htmlFor="auto-scale-severity" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                                Antecipação Inteligente de Atraso Crítico ⚡
                              </label>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                                Se a taxa de inadimplência estourar a meta, reduzir automaticamente de <strong>{daysOverdueThreshold} dias</strong> para <strong>{Math.max(5, daysOverdueThreshold - 5)} dias</strong> o limite de carência de faturas em atraso monitoradas, antecipando os alertas via webhook.
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded ${
                                  autoScaleSeverity && currentSchoolDelinquency > delinquencyTarget
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse"
                                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                }`}>
                                  {autoScaleSeverity && currentSchoolDelinquency > delinquencyTarget
                                    ? `Regra Ativa: Limiar dinâmico reduzido para ${Math.max(5, daysOverdueThreshold - 5)} dias de atraso!`
                                    : `Atraso mínimo de faturas: ${daysOverdueThreshold} dias`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Regra 3: Escalonamento de Canais */}
                          <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-3xs">
                            <input
                              type="checkbox"
                              id="channel-selection-based-on-target"
                              checked={channelSelectionBasedOnTarget}
                              onChange={(e) => {
                                setChannelSelectionBasedOnTarget(e.target.checked);
                                addLog("info", `Regra 'Escalonamento de Canais' alterada para ${e.target.checked ? "Ativa" : "Inativa"}.`, "ALERTA");
                              }}
                              className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="space-y-1">
                              <label htmlFor="channel-selection-based-on-target" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                                Restrição por Canal de Custo (SMS Inteligente) 📱
                              </label>
                              <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-normal">
                                Enviar alertas SMS (custo elevado) apenas se a inadimplência ultrapassar a meta. Caso a escola esteja dentro da meta, disparar apenas o e-mail preventivo (custo zero).
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded ${
                                  channelSelectionBasedOnTarget 
                                    ? (currentSchoolDelinquency > delinquencyTarget ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")
                                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                }`}>
                                  {channelSelectionBasedOnTarget
                                    ? (currentSchoolDelinquency > delinquencyTarget ? "Status: Inadimplência ALTA -> SMS habilitado" : "Status: Inadimplência OK -> SMS suspenso (Apenas E-mail)")
                                    : "Status: Desativado (Ambos canais ativos se selecionados acima)"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Regra 4: Frequência Dinâmica */}
                          <div className="space-y-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-3xs">
                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block font-sans">
                              Frequência Dinâmica de Envio dos Alertas:
                            </label>
                            <div className="flex items-center gap-3">
                              <select
                                value={alertFrequencyMode}
                                onChange={(e) => {
                                  const val = e.target.value as any;
                                  setAlertFrequencyMode(val);
                                  addLog("info", `Frequência de disparo de alertas alterada para modo: ${val}`, "ALERTA");
                                }}
                                className="bg-[#fdfaf3] dark:bg-slate-950 border border-amber-250 dark:border-slate-800 rounded-xl p-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none flex-1"
                              >
                                <option value="dynamic">Frequência Dinâmica baseada na Meta 🔄</option>
                                <option value="fixed">Frequência Fixa Diária 📅</option>
                              </select>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                              {alertFrequencyMode === "dynamic"
                                ? (currentSchoolDelinquency > delinquencyTarget
                                    ? "Inadimplência ACIMA da meta: Disparar webhooks de faturas atrasadas a cada 24h (Urgência máxima)."
                                    : "Inadimplência DENTRO da meta: Disparar webhooks semanalmente a cada 7 dias (Modo preventivo).")
                                : "Disparar webhooks de faturas atrasadas diariamente, independente da meta."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VISUALIZAÇÃO E METAS - COLSPAN 5 */}
                  <div className="xl:col-span-5 space-y-6">
                    {/* Meta vs. Inadimplência Atual Card */}
                    <div className={`p-5 rounded-3xl border shadow-3xs flex flex-col justify-between space-y-4 ${
                      currentSchoolDelinquency > delinquencyTarget
                        ? "bg-rose-500/5 border-rose-300/30 text-rose-950 dark:text-rose-100"
                        : "bg-emerald-500/5 border-emerald-300/30 text-emerald-950 dark:text-emerald-100"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider font-sans">
                          Métrica de Controle ERP
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-full uppercase ${
                          currentSchoolDelinquency > delinquencyTarget
                            ? "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
                        }`}>
                          {currentSchoolDelinquency > delinquencyTarget ? "Alerta Ativo ⚠️" : "Dentro da Meta ✓"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center py-2">
                        <div className="border-r border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Meta Máxima</span>
                          <span className="text-2xl font-serif font-black text-[#423326] dark:text-amber-100">{delinquencyTarget}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">Taxa Corrente</span>
                          <span className={`text-2xl font-serif font-black ${
                            currentSchoolDelinquency > delinquencyTarget ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                          }`}>{currentSchoolDelinquency}%</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-550 dark:text-slate-400 leading-relaxed">
                        {currentSchoolDelinquency > delinquencyTarget
                          ? `A inadimplência atual de ${currentSchoolDelinquency}% excede a meta estabelecida pela coordenação (${delinquencyTarget}%). Regras de Webhook aplicarão disparos automatizados de alerta.`
                          : `A inadimplência atual de ${currentSchoolDelinquency}% está sob controle, abaixo do limite estabelecido (${delinquencyTarget}%). Notificações operam em regime preventivo moderado.`}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-150 dark:border-slate-850">
                        <span className="text-[10px] text-slate-400">Ajustar taxa de simulação:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={currentSchoolDelinquency}
                            onChange={(e) => {
                              setCurrentSchoolDelinquency(parseFloat(e.target.value));
                              addLog("info", `Inadimplência de teste ajustada para ${e.target.value}%`, "SISTEMA");
                            }}
                            className="w-24 h-1 bg-indigo-100 dark:bg-slate-800 rounded-lg cursor-pointer accent-indigo-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Faturas de Aluno em Atraso Table */}
                    <div className="bg-slate-50/50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl p-4 space-y-3">
                      {(() => {
                        const isOverTarget = currentSchoolDelinquency > delinquencyTarget;
                        const effectiveThreshold = (autoScaleSeverity && isOverTarget)
                          ? Math.max(5, daysOverdueThreshold - 5)
                          : daysOverdueThreshold;

                        const invoiceList = monitoredInvoices.map(inv => ({
                          ...inv,
                          isTarget: inv.days > effectiveThreshold
                        }));

                        return (
                          <>
                            <div className="flex flex-col gap-1.5 border-b border-slate-200/50 dark:border-slate-850 pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-slate-500 uppercase font-mono">
                                    Faturas sob Monitoramento ({invoiceList.length})
                                  </span>
                                  {invoiceCacheInfo.source === "API_DIRETA" ? (
                                    <span className="text-[8px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>API Direta • {invoiceCacheInfo.cachedAt}</span>
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                      Cache Local • {invoiceCacheInfo.cachedAt}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={handleForceSync}
                                    disabled={isForcingSync}
                                    className="text-[9px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900/70 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Limpar cache local e buscar faturas mais recentes na API"
                                  >
                                    <RotateCcw className={`w-2.5 h-2.5 ${isForcingSync ? "animate-spin" : ""}`} />
                                    <span>Forçar Sincronização</span>
                                  </button>
                                  <span className="text-[9px] text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded font-black font-mono">
                                    &gt; {effectiveThreshold}d
                                  </span>
                                </div>
                              </div>
                              {autoScaleSeverity && isOverTarget && (
                                <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                                  ⚠️ Redução de carência ativa (-5 dias) por estouro de meta!
                                </span>
                              )}
                            </div>

                            {/* Simple student invoice table */}
                            <div className="space-y-2 max-h-[220px] overflow-y-auto">
                              {invoiceList.map((inv) => (
                                <div
                                  key={inv.id}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left transition-all ${
                                    inv.isTarget
                                      ? "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 font-medium"
                                      : "bg-white dark:bg-slate-900 border-slate-150 dark:border-slate-850"
                                  }`}
                                >
                                  <div className="space-y-0.5 truncate flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {inv.student}
                                      </span>
                                      <span className="text-[8px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 rounded">
                                        {inv.id}
                                      </span>
                                      {inv.isFromApi && (
                                        <span className="text-[7px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-1 py-0.2 rounded">
                                          API DIRETA
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[9px] text-slate-400 block truncate">
                                      Resp: {inv.guardian} • Mensalidade: R$ {inv.amount}
                                    </span>
                                  </div>

                                  <div className="flex flex-col items-end shrink-0">
                                    <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md ${
                                      inv.isTarget
                                        ? "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                    }`}>
                                      {inv.days} dias
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase font-mono">
                                      {inv.isTarget ? "Notificar ⚠️" : "Abaixo Limiar"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Actions & Simulator */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => {
                      addLog("success", "Salvas configurações automáticas de réguas de cobrança baseadas em metas.", "CONFIG");
                      setToast({
                        message: `Configurações de alerta salvas com sucesso!`,
                        type: "success"
                      });
                    }}
                    className="w-full sm:w-auto bg-indigo-700 hover:bg-indigo-850 active:scale-98 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Salvar Configurações</span>
                  </button>

                  <button
                    type="button"
                    disabled={isTestingWebhook}
                    onClick={() => {
                      setIsTestingWebhook(true);
                      addLog("info", "Iniciando verificação manual de inadimplência de faturas...", "WEBHOOK");
                      
                      // Calculate effective threshold based on rules
                      const isOverTarget = currentSchoolDelinquency > delinquencyTarget;
                      const effectiveThreshold = (autoScaleSeverity && isOverTarget)
                        ? Math.max(5, daysOverdueThreshold - 5)
                        : daysOverdueThreshold;

                      addLog("info", `Gatilho de carência configurado: faturas com mais de ${daysOverdueThreshold} dias de atraso.`, "ALERTA");
                      
                      if (autoScaleSeverity && isOverTarget) {
                        addLog("warn", `[REGRA COORDENAÇÃO] Inadimplência atual (${currentSchoolDelinquency}%) excede a meta (${delinquencyTarget}%). Reduzindo carência para ${effectiveThreshold} dias automaticamente!`, "ALERTA");
                      } else {
                        addLog("info", `[REGRA COORDENAÇÃO] Limiar mantido em ${effectiveThreshold} dias (inadimplência dentro da meta ou regra inativa).`, "ALERTA");
                      }
                      
                      setTimeout(() => {
                        const targets = monitoredInvoices
                          .map(f => ({ ...f, amount: `R$ ${f.amount}` }))
                          .filter(f => f.days > effectiveThreshold);

                        // Check blocking rule
                        const shouldBlockDisparos = autoTriggerAboveTarget && !isOverTarget;

                        if (shouldBlockDisparos) {
                          addLog("warn", `[REGRA COORDENAÇÃO] Inadimplência (${currentSchoolDelinquency}%) está DENTRO ou IGUAL à meta (${delinquencyTarget}%). Disparos automáticos via webhook SUSPENSOS por segurança.`, "ALERTA");
                          addLog("info", `Nenhum webhook enviado para as ${targets.length} faturas elegíveis devido à conformidade com a meta.`, "WEBHOOK");
                        } else {
                          if (autoTriggerAboveTarget && isOverTarget) {
                            addLog("success", `[REGRA COORDENAÇÃO] Inadimplência acima da meta. Disparos via webhook AUTORIZADOS.`, "ALERTA");
                          }

                          if (targets.length === 0) {
                            addLog("warn", `Nenhuma fatura excede o limiar de ${effectiveThreshold} dias. Nenhum alerta pendente.`, "ALERTA");
                          } else {
                            addLog("warn", `Identificadas ${targets.length} faturas elegíveis para notificações automáticas.`, "ALERTA");
                            
                            targets.forEach(f => {
                              if (enableEmailAlert) {
                                const emailMsg = emailTemplate
                                  .replace("{aluno}", f.student)
                                  .replace("{responsavel}", f.guardian)
                                  .replace("{dias}", f.days.toString())
                                  .replace("{valor}", f.amount)
                                  .replace("{fatura}", f.id);
                                addLog("success", `E-mail enviado para ${f.guardian}: "${emailMsg.substring(0, 50)}..." [POST -> ${emailAlertWebhookUrl}]`, "NETWORK");
                              }
                              
                              // Check SMS rules
                              const smsAllowedByRule = !channelSelectionBasedOnTarget || isOverTarget;

                              if (enableSmsAlert) {
                                if (smsAllowedByRule) {
                                  const smsMsg = smsTemplate
                                    .replace("{aluno}", f.student)
                                    .replace("{responsavel}", f.guardian)
                                    .replace("{dias}", f.days.toString())
                                    .replace("{valor}", f.amount);
                                  addLog("success", `SMS enviado para ${f.student}: "${smsMsg}" [POST -> ${smsAlertWebhookUrl}]`, "NETWORK");
                                } else {
                                  addLog("info", `[REGRA CANAL] Alerta SMS para ${f.student} SUSPENSO (Custo Alto). Enviando apenas e-mail gratuito pois a taxa está na meta.`, "ALERTA");
                                }
                              }
                            });
                          }
                        }

                        setTimeout(() => {
                          const modeText = alertFrequencyMode === "dynamic"
                            ? (isOverTarget ? "Diário (Frequência Alta - Acima da Meta)" : "Semanal (Frequência Moderada - Dentro da Meta)")
                            : "Diário Permanente (Frequência Fixa)";

                          addLog("success", `✓ Webhook de Alerta processado com sucesso [Meta=${delinquencyTarget}% | Atual=${currentSchoolDelinquency}% | Limiar Efetivo=${effectiveThreshold} dias | Faturas=${shouldBlockDisparos ? 0 : targets.length}]`, "NETWORK");
                          setIsTestingWebhook(false);
                          
                          if (shouldBlockDisparos) {
                            setToast({
                              message: `Simulação concluída! Disparos bloqueados de forma inteligente pela meta de inadimplência sob controle.`,
                              type: "info"
                            });
                          } else {
                            setToast({
                              message: `Simulação concluída! ${targets.length} faturas com atraso acima de ${effectiveThreshold} dias notificadas conforme regras de canais.`,
                              type: "success"
                            });
                          }
                        }, 800);

                      }, 600);
                    }}
                    className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 animate-fade-in"
                  >
                    <Play className={`w-3.5 h-3.5 ${isTestingWebhook ? "animate-pulse" : ""}`} />
                    <span>{isTestingWebhook ? "Processando..." : "Testar Webhooks Agora (Simulação)"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab: Mapeamento (Data mapping) */}
          {erpActiveSubTab === "mapeamento" && (
            <div className="space-y-6">
              
              {/* WIZARD ACTIVE DISPLAY */}
              {isWizardActive ? (
                <div className="bg-white/95 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
                  
                  {/* Wizard Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border border-indigo-200/50">
                          Passo {wizardStep} de 5
                        </span>
                        <h3 className="font-serif font-black text-[#423326] dark:text-amber-100 text-base sm:text-lg">
                          Assistente de Vínculo de Faturamento
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                        Mapeamento inteligente de dados de notas fiscais (NF-e) e conciliação bancária de pagamentos.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsWizardActive(false);
                        addLog("info", "Administrador cancelou o assistente guiado de faturamento.", "WIZARD");
                      }}
                      className="text-slate-500 hover:text-rose-600 font-mono font-black text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 cursor-pointer self-start sm:self-auto transition-all"
                    >
                      ← Mapeamento Manual
                    </button>
                  </div>

                  {/* Stepper horizontal tracker */}
                  <div className="py-2 overflow-x-auto">
                    <div className="flex items-center min-w-[600px] justify-between text-center relative px-2">
                      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
                      
                      {[
                        { num: 1, label: "Provedor & Regras" },
                        { num: 2, label: "Dados Cobrança" },
                        { num: 3, label: "Nota Fiscal (NF-e)" },
                        { num: 4, label: "Retorno & Conciliação" },
                        { num: 5, label: "Validação & Envio" }
                      ].map((st) => (
                        <div key={st.num} className="flex-1 flex flex-col items-center relative z-10">
                          <button
                            disabled={st.num > 5} // Allow navigating back or forward if already initialized
                            onClick={() => setWizardStep(st.num)}
                            className={`w-8 h-8 rounded-full font-mono font-black text-xs flex items-center justify-center border transition-all ${
                              wizardStep === st.num
                                ? "bg-indigo-700 text-white border-indigo-700 shadow-sm scale-110"
                                : wizardStep > st.num
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            {wizardStep > st.num ? "✓" : st.num}
                          </button>
                          <span className={`text-[9.5px] mt-1.5 font-sans font-bold tracking-tight block ${
                            wizardStep === st.num 
                              ? "text-indigo-700 dark:text-indigo-400 font-extrabold" 
                              : "text-slate-400"
                          }`}>
                            {st.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STEP 1: ERP Selection & Rules */}
                  {wizardStep === 1 && (
                    <div className="space-y-6 pt-2 animate-fade-in">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 font-mono uppercase tracking-wider block">
                          Etapa 1: Selecione o ERP Escolar de Destino
                        </span>
                        <p className="text-xs text-slate-500">
                          Escolha o sistema ERP ou intermediador de pagamentos que receberá os dados. Aplicaremos mapeamentos recomendados automaticamente.
                        </p>
                      </div>

                      {/* ERP Cards Selector */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: "totvs", label: "Totvs Educacional 🏢", desc: "Fluxo formal de faturamento acadêmico, geração de boletas e envio para prefeituras brasileiras.", preset: "totvs" },
                          { id: "sap", label: "SAP Business One ⚙️", desc: "Integração via Service Layer. Notas fiscais geradas como rascunho de contas a receber no ERP.", preset: "sap" },
                          { id: "asaas", label: "Asaas Finanças 💰", desc: "Integração simplificada direta para geração de boletos pix/cartão, régua de cobrança automática e webhook.", preset: "asaas" }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const val = item.id as any;
                              setWizardErp(val);
                              loadErpPreset(val);
                              addLog("info", `Wizard: Carregado preset de campos de faturamento recomendados para o ERP ${val.toUpperCase()}`, "WIZARD");
                            }}
                            className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-40 ${
                              wizardErp === item.id
                                ? "bg-[#fcfaf5] dark:bg-slate-950 border-indigo-500 shadow-3xs ring-1 ring-indigo-500"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-850 hover:border-slate-350"
                            }`}
                          >
                            <div>
                              <strong className="text-xs font-serif font-black text-slate-800 dark:text-amber-100 block mb-1">
                                {item.label}
                              </strong>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                                {item.desc}
                              </p>
                            </div>
                            <span className={`text-[9px] font-mono font-bold uppercase ${
                              wizardErp === item.id ? "text-indigo-700 dark:text-indigo-400" : "text-slate-400"
                            }`}>
                              {wizardErp === item.id ? "✓ Selecionado" : "Usar este Provedor"}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Billing Rules Trigger Setup */}
                      <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-4">
                        <strong className="text-xs text-slate-700 dark:text-slate-350 block">Regras de Gatilho de Faturamento</strong>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Rule A */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                              Momento de Emissão da Nota Fiscal:
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setWizardInvoiceTrigger("creation")}
                                className={`flex-1 p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                  wizardInvoiceTrigger === "creation"
                                    ? "bg-white dark:bg-slate-900 border-indigo-600 text-indigo-700 dark:text-indigo-400 shadow-3xs"
                                    : "bg-[#fdfaf3]/50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-white"
                                }`}
                              >
                                Emitir no Fechamento do Boleto 📝
                              </button>
                              <button
                                type="button"
                                onClick={() => setWizardInvoiceTrigger("payment")}
                                className={`flex-1 p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                  wizardInvoiceTrigger === "payment"
                                    ? "bg-white dark:bg-slate-900 border-indigo-600 text-indigo-700 dark:text-indigo-400 shadow-3xs"
                                    : "bg-[#fdfaf3]/50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-white"
                                }`}
                              >
                                Emitir na Confirmação do Pagamento 💰
                              </button>
                            </div>
                            <span className="text-[9.5px] text-slate-400 block leading-tight">
                              Selecione se o RPS (Recibo Provisório de Serviços) deve ser gerado antes ou após a liquidação financeira.
                            </span>
                          </div>

                          {/* Rule B */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                              Agrupamento de Mensalidades por Família:
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setWizardAggregated("individual")}
                                className={`flex-1 p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                  wizardAggregated === "individual"
                                    ? "bg-white dark:bg-slate-900 border-indigo-600 text-indigo-700 dark:text-indigo-400 shadow-3xs"
                                    : "bg-[#fdfaf3]/50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-white"
                                }`}
                              >
                                Cobranças Separadas por Aluno 🧑‍🎓
                              </button>
                              <button
                                type="button"
                                onClick={() => setWizardAggregated("grouped")}
                                className={`flex-1 p-3 rounded-xl border text-center text-xs font-bold cursor-pointer transition-all ${
                                  wizardAggregated === "grouped"
                                    ? "bg-white dark:bg-slate-900 border-indigo-600 text-indigo-700 dark:text-indigo-400 shadow-3xs"
                                    : "bg-[#fdfaf3]/50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-white"
                                }`}
                              >
                                Cobrança Consolidada por CPF 🏠
                              </button>
                            </div>
                            <span className="text-[9.5px] text-slate-400 block leading-tight">
                              Pais com mais de um filho matriculado recebem faturas apartadas ou um único boleto unificado mensalmente.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Basic Billing Data Mapping */}
                  {wizardStep === 2 && (
                    <div className="space-y-6 pt-2 animate-fade-in">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 font-mono uppercase tracking-wider block">
                          Etapa 2: Mapeamento de Dados de Cobrança e Responsável
                        </span>
                        <p className="text-xs text-slate-500">
                          Vincule os campos internos de cobrança do Magic Learning ao objeto JSON esperado pela API do ERP {wizardErp.toUpperCase()}.
                        </p>
                      </div>

                      <div className="bg-[#fcfaf5] dark:bg-slate-950 p-4 rounded-2xl border border-amber-100 dark:border-slate-850 text-[11.5px] text-[#423326] dark:text-amber-200">
                        💡 <strong>Sugestão Recomendada:</strong> Pré-carregamos o padrão de chaves do <strong>{wizardErp.toUpperCase()}</strong>. Você pode alterar as chaves caso possua campos customizados (UDFs) em seu banco de dados ERP.
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Box 1 */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                          <strong className="text-xs text-indigo-700 dark:text-indigo-400 block font-serif">Mapeamento de Valores</strong>
                          
                          <div className="space-y-3.5">
                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">Valor da Mensalidade Escolar:</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: valor_mensalidade</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.amount}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, amount: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">Data de Vencimento do Boleto:</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: data_vencimento</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.dueDate}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, dueDate: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Box 2 */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                          <strong className="text-xs text-indigo-700 dark:text-indigo-400 block font-serif">Dados do Pagador (Fisico/Jurídico)</strong>
                          
                          <div className="space-y-3.5">
                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">Nome Completo do Responsável:</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: nome_pagador</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.payerName}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, payerName: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">CPF/CNPJ para Cadastro e Boleto:</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: documento_pagador</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.payerDocument}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, payerDocument: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Invoice / Nota Fiscal settings (NF-e) */}
                  {wizardStep === 3 && (
                    <div className="space-y-6 pt-2 animate-fade-in">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 font-mono uppercase tracking-wider block">
                          Etapa 3: Mapeamento de Parâmetros Fiscais (Nota Fiscal Eletrônica de Serviços - NFS-e)
                        </span>
                        <p className="text-xs text-slate-500">
                          Vincule os atributos regulatórios e de alíquotas de imposto exigidos pelas prefeituras municipais para emissão automática das notas de ensino.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Fiscal Mapping */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3.5 col-span-1">
                          <strong className="text-xs text-indigo-700 dark:text-indigo-400 block font-serif">Alíquotas e Enquadramento Fiscal</strong>
                          
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">Alíquota de ISS Municipal (Ensino):</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: aliquota_iss</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.issTaxRate}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, issTaxRate: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">Código de Atividade / Serviço Municipal:</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: codigo_servico</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.municipalServiceCode}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, municipalServiceCode: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Invoice Dispatch fields */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3.5 col-span-1">
                          <strong className="text-xs text-indigo-700 dark:text-indigo-400 block font-serif">Textos de Envio & Distribuição de NF-e</strong>
                          
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">Discriminação dos Serviços Prestados:</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: descricao_servico</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.serviceDescription}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, serviceDescription: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">E-mail para Disparo de NF-e Emitida:</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: email_nota_fiscal</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.invoiceEmail}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, invoiceEmail: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-amber-50 dark:bg-slate-950/80 p-4 rounded-xl border border-amber-100 dark:border-slate-850 text-xs text-[#523d1c] dark:text-amber-250 flex gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Nota de Homologação de Impostos Escolares:</strong> Geralmente, serviços de ensino básico e médio enquadram-se sob o código nacional de serviços <strong>1.05</strong> (Serviços de ensino, instrução, treinamento, orientação pedagógica). Alíquotas de ISS variam municipalmente de 2% a 5% de acordo com as leis locais.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Reconciliation, Webhook, return data */}
                  {wizardStep === 4 && (
                    <div className="space-y-6 pt-2 animate-fade-in">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 font-mono uppercase tracking-wider block">
                          Etapa 4: Configuração de Retorno de Pagamento & Conciliação Financeira
                        </span>
                        <p className="text-xs text-slate-500">
                          Configure as chaves e rotas de webhook que atualizam automaticamente o status das cobranças no Magic Learning quando um pagamento é efetuado no ERP parceiro.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        {/* Mapping Inputs */}
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3.5">
                          <strong className="text-xs text-indigo-700 dark:text-indigo-400 block font-serif">Mapeamento de Status & IDs</strong>
                          
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">ID Único da Cobrança / Código Barras:</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: id_fatura</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.invoiceId}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, invoiceId: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">Status do Pagamento:</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: status_pagamento</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.paymentStatus}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, paymentStatus: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9.5px] font-bold text-slate-500 block">Diferença de Valores (Juros, Multa, Desconto):</label>
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1.5 text-[10px] font-mono rounded-lg shrink-0">Magic: desconto_juros_multa</span>
                                <span className="text-slate-400">➔</span>
                                <input
                                  type="text"
                                  value={billingMappings.fineAndInterest}
                                  onChange={(e) => setBillingMappings({ ...billingMappings, fineAndInterest: e.target.value })}
                                  className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs font-mono text-slate-800 dark:text-slate-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Webhook Configuration Panel */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-4">
                          <div className="flex items-center justify-between">
                            <strong className="text-xs text-[#423326] dark:text-amber-100 block font-serif">Regra de Callback Ativa</strong>
                            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-mono px-2 py-0.5 rounded border border-emerald-200">Recomendado</span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-xl">
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 block">Habilitar Webhook de Retorno</span>
                                <p className="text-[9.5px] text-slate-400">O ERP avisará o Magic instantaneamente sobre quitações.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={wizardWebhookActive} 
                                  onChange={(e) => setWizardWebhookActive(e.target.checked)}
                                  className="sr-only peer" 
                                />
                                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                              </label>
                            </div>

                            <div className="space-y-1.5 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 rounded-xl text-xs text-indigo-950 dark:text-indigo-300">
                              <span className="font-bold block mb-0.5">Endereço de Webhook gerado:</span>
                              <code className="text-[10px] font-mono bg-white dark:bg-slate-950 p-1.5 border border-indigo-150 rounded block truncate text-indigo-700 dark:text-indigo-400">
                                {`https://magic-api.school/v1/integrations/${wizardErp}/webhook?key=mag_live_k7a4`}
                              </code>
                              <span className="text-[9.5px] block text-slate-500 italic mt-1">Copie esta URL e cole nas configurações de Webhooks do painel do {wizardErp.toUpperCase()}.</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* STEP 5: Final Validation, Simulation & Generated Payload Inspector */}
                  {wizardStep === 5 && (
                    <div className="space-y-6 pt-2 animate-fade-in">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 font-mono uppercase tracking-wider block">
                          Etapa 5: Validação da Integração Escolar e Carga Útil (Payload JSON)
                        </span>
                        <p className="text-xs text-slate-500">
                          Efetue uma simulação completa de envio. Geraremos uma cobrança escolar fictícia com o seu novo mapeamento de atributos e validaremos no servidor de testes.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        
                        {/* Simulation trigger / steps */}
                        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-850 flex flex-col justify-between space-y-4">
                          <div className="space-y-3">
                            <strong className="text-xs text-[#423326] dark:text-amber-100 font-serif block">Validador de Handshake</strong>
                            
                            <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-[9.5px] leading-relaxed">
                              {simulationProgress.length === 0 ? (
                                <p className="text-slate-450 italic text-center py-10 font-sans text-xs">
                                  Nenhum teste de comunicação executado para o novo mapeamento. Clique no botão abaixo para simular.
                                </p>
                              ) : (
                                <div className="space-y-1.5">
                                  {simulationProgress.map((p, idx) => (
                                    <div key={idx} className="flex gap-1.5 text-emerald-600 dark:text-emerald-400">
                                      <span>✔</span>
                                      <span className="text-slate-750 dark:text-slate-300">{p}</span>
                                    </div>
                                  ))}
                                  {isSimulatingWizard && (
                                    <div className="flex gap-1.5 items-center text-indigo-600 animate-pulse">
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>Aguardando resposta do ERP...</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isSimulatingWizard}
                            onClick={runBillingSimulation}
                            className="w-full bg-[#423326] hover:bg-slate-850 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                          >
                            {isSimulatingWizard ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Homologando no {wizardErp.toUpperCase()}...
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" /> Executar Simulação Completa ⚡
                              </>
                            )}
                          </button>
                        </div>

                        {/* Generated JSON Payload side */}
                        <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-3 flex flex-col">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-widest block">Payload de Faturamento Gerado (Mock JSON)</span>
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-900/50 text-[8.5px] font-mono px-2 py-0.5 rounded">REST POST/HTTPS</span>
                          </div>

                          <div className="flex-1 min-h-64 overflow-auto rounded-xl border border-slate-850 p-3 bg-slate-950">
                            <pre className="text-[10.5px] font-mono text-emerald-400 leading-relaxed whitespace-pre overflow-x-auto">
{JSON.stringify({
  api_version: wizardErp === "totvs" ? totvsApiVersion : "2026-v3",
  metadata: {
    integration_type: "billing_wizard_magic_learning",
    school_identifier: "magic-school-sp-brazil",
    created_at: "2026-07-05T18:10:00Z",
    ...(wizardErp === "totvs" ? { 
      totvs_api_version: totvsApiVersion,
      totvs_batch_processing_interval_minutes: totvsBatchInterval 
    } : {})
  },
  transaction: {
    [billingMappings.invoiceId]: "FAT-2026-41908",
    [billingMappings.amount]: 1550.00,
    [billingMappings.dueDate]: "2026-07-10",
    "invoice_rules": {
      "trigger_moment": wizardInvoiceTrigger === "creation" ? "upon_invoice_creation" : "upon_payment_settlement",
      "aggregation_type": wizardAggregated === "grouped" ? "grouped_by_guardian" : "individual_per_student"
    }
  },
  payer: {
    [billingMappings.payerName]: "Gustavo Rotatori",
    [billingMappings.payerDocument]: "123.456.789-00",
    [billingMappings.invoiceEmail]: "gustavorotatori@gmail.com"
  },
  fiscal_nota_fiscal: {
    [billingMappings.issTaxRate]: 2.0,
    [billingMappings.municipalServiceCode]: "1.05",
    [billingMappings.serviceDescription]: "Mensalidade Escolar Ensino Fundamental II - Magic Learning - Turma 8º Ano A"
  },
  financial_returns_rules: {
    [billingMappings.paymentStatus]: "PAID_COMMITTED_IN_BANK",
    [billingMappings.fineAndInterest]: "FINE_2_PERCENT_INTEREST_1_PERCENT_PER_MONTH",
    "callback_webhook": {
      "url": `https://magic-api.school/v1/integrations/${wizardErp}/webhook?key=mag_live_k7a4`,
      "ssl_required": true,
      "webhook_enabled": wizardWebhookActive
    }
  }
}, null, 2)}
                            </pre>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Wizard Navigation Footer */}
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5 mt-2">
                    <button
                      type="button"
                      disabled={wizardStep === 1 || isSimulatingWizard}
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 disabled:opacity-30 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>

                    {wizardStep < 5 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setWizardStep(prev => prev + 1);
                          addLog("info", `Wizard: Avançou para a etapa ${wizardStep + 1}`, "WIZARD");
                        }}
                        className="bg-indigo-700 hover:bg-indigo-850 text-white font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-xs cursor-pointer transition-all hover:scale-102"
                      >
                        Avançar <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSimulatingWizard || !simulationSuccess}
                        onClick={handleSaveWizardResults}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-102"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> Homologar & Salvar Configurações
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                
                // STANDARD MANUALLY CONFIGURABLE DISPLAY (With Wizard Promotion Banner at the top!)
                <div className="space-y-6">
                  
                  {/* Banner promoting the Wizard */}
                  <div className="bg-gradient-to-r from-amber-50 to-[#faf7f0] dark:from-indigo-950/20 dark:to-slate-900 border border-amber-250 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 dark:bg-indigo-900/60 rounded-2xl flex items-center justify-center shrink-0 text-amber-700 dark:text-indigo-400 border border-amber-200 dark:border-indigo-850">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <strong className="font-serif font-black text-sm text-[#423326] dark:text-amber-100 block">
                          Assistente de Vínculo de Faturamento (Wizard) disponível!
                        </strong>
                        <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-sans max-w-xl">
                          Associe os dados fiscais e financeiros de mensalidades do Magic Learning para seu ERP (<strong className="capitalize">{erpName}</strong>) de maneira guiada e amigável em 5 passos rápidos.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsWizardActive(true);
                        setWizardStep(1);
                        setWizardErp(erpName);
                        loadErpPreset(erpName);
                        addLog("info", "Iniciou o assistente de vinculação de faturamento interativo (Wizard)", "WIZARD");
                      }}
                      className="bg-[#423326] hover:bg-[#5c4938] text-white font-black text-[11px] uppercase tracking-wider font-mono py-2.5 px-4 rounded-xl shadow-xs transition-all hover:scale-102 shrink-0 cursor-pointer"
                    >
                      Iniciar Assistente ⚡
                    </button>
                  </div>

                  {/* Manual Data Fields Mapping form */}
                  <div className="bg-white/95 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5">
                      <h3 className="font-serif font-black text-sm uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-2">
                        <Database className="w-4 h-4 text-indigo-600" /> Esquema de Mapeamento Geral do Banco de Dados
                      </h3>
                      <button
                        onClick={handleSaveMappings}
                        className="bg-[#423326] hover:bg-slate-850 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-3xs cursor-pointer transition-all"
                      >
                        <Save className="w-3.5 h-3.5" /> Salvar Esquema
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Associe as propriedades internas do banco de dados local com as chaves correspondentes esperadas na API REST do seu ERP parceiro de modo manual abaixo.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">ID Único do Estudante:</label>
                        <input
                          type="text"
                          value={fieldMappings.studentId}
                          onChange={(e) => setFieldMappings({ ...fieldMappings, studentId: e.target.value })}
                          className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Nome Completo do Aluno:</label>
                        <input
                          type="text"
                          value={fieldMappings.studentName}
                          onChange={(e) => setFieldMappings({ ...fieldMappings, studentName: e.target.value })}
                          className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">E-mail do Responsável:</label>
                        <input
                          type="text"
                          value={fieldMappings.parentEmail}
                          onChange={(e) => setFieldMappings({ ...fieldMappings, parentEmail: e.target.value })}
                          className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Vetor de Notas e Boletim:</label>
                        <input
                          type="text"
                          value={fieldMappings.grades}
                          onChange={(e) => setFieldMappings({ ...fieldMappings, grades: e.target.value })}
                          className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Status da Cobrança Financeira:</label>
                        <input
                          type="text"
                          value={fieldMappings.billingStatus}
                          onChange={(e) => setFieldMappings({ ...fieldMappings, billingStatus: e.target.value })}
                          className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase font-mono">Código de Matrícula Interno:</label>
                        <input
                          type="text"
                          value={fieldMappings.registrationCode}
                          onChange={(e) => setFieldMappings({ ...fieldMappings, registrationCode: e.target.value })}
                          className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 p-4 rounded-xl flex gap-3 text-[11px] text-indigo-950 dark:text-indigo-300">
                      <Code className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block">Exemplo do Payload JSON de Estudante gerado:</span>
                        <pre className="mt-1.5 text-[9px] font-mono bg-slate-950 text-emerald-400 p-2.5 rounded border border-slate-800 overflow-x-auto">
{`{
  "${fieldMappings.registrationCode}": "STU-2026-0041",
  "${fieldMappings.studentName}": "Luna Nogueira Silva",
  "${fieldMappings.parentEmail}": "responsavel@familia.com.br",
  "${fieldMappings.grades}": [ { "subject": "Math", "avg": 9.8 } ]
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* Sub-tab: Headers (Advanced API Headers) */}
          {erpActiveSubTab === "headers" && (
            <div className="bg-white/95 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-serif font-black text-sm uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-2 border-b border-amber-100/50 dark:border-slate-850 pb-2.5">
                <Sliders className="w-4 h-4 text-indigo-600" /> Cabeçalhos HTTP Personalizados (Custom Headers)
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Defina cabeçalhos adicionais que serão anexados a cada requisição enviada ao ERP parceiro, úteis para controle de inquilino (Tenant) ou proxies adicionais.
              </p>

              <div className="space-y-4">
                {headers.length === 0 ? (
                  <p className="text-xs italic text-slate-400 py-4 text-center">Nenhum cabeçalho customizado inserido ainda.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {headers.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 px-3 py-2 rounded-xl text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-[#423326] dark:text-amber-100 font-bold">{h.key}</span>
                          <span className="text-slate-400">:</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{h.value}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveHeader(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Header Inputs */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <input
                    type="text"
                    placeholder="Chave (ex: X-School-Token)"
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Valor (ex: sec_prod_abc123)"
                    value={newHeaderVal}
                    onChange={(e) => setNewHeaderVal(e.target.value)}
                    className="flex-1 bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                  <button
                    onClick={handleAddHeader}
                    className="bg-indigo-700 hover:bg-indigo-850 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab: Logs (Dynamic Terminal Console Output) */}
          {erpActiveSubTab === "logs" && (
            <div className="bg-white/95 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
                <h3 className="font-serif font-black text-sm uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-600" /> Terminal de Log de Transações em Tempo Real
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setLogs([]);
                      setToast({ message: "Console de logs limpo!", type: "info" });
                    }}
                    className="text-slate-500 hover:text-rose-600 font-bold px-2 py-1 text-[10px] border border-slate-200 dark:border-slate-800 rounded-md flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-950"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Limpar Console
                  </button>
                </div>
              </div>

              {/* Terminal search & levels controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar nos registros de console..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full bg-[#fdfaf3] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850 overflow-x-auto shrink-0">
                  {(["all", "info", "success", "warn", "error"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setLogFilter(level)}
                      className={`px-2.5 py-1 rounded-lg text-[9px] uppercase font-mono font-black tracking-wider transition-all ${
                        logFilter === level
                          ? level === "all" ? "bg-[#423326] text-white" :
                            level === "info" ? "bg-blue-600 text-white" :
                            level === "success" ? "bg-emerald-600 text-white" :
                            level === "warn" ? "bg-amber-600 text-[#301c05]" : "bg-rose-600 text-white"
                          : "text-slate-500 hover:bg-white dark:hover:bg-slate-900"
                      }`}
                    >
                      {level === "all" ? "Todos" : level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output screen */}
              <div className="bg-slate-950 text-emerald-400 p-4.5 rounded-2xl border border-slate-850 font-mono text-[11px] h-96 overflow-y-auto space-y-2 shadow-inner relative">
                <div className="absolute top-2 right-2 text-[9px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded uppercase tracking-widest border border-indigo-900 select-none">
                  Live Stream
                </div>
                
                {filteredLogs.length === 0 ? (
                  <div className="text-slate-500 italic py-24 text-center text-[10px] font-sans">
                    Nenhum registro de log encontrado para os filtros atuais.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredLogs.map((l) => (
                      <p key={l.id} className="leading-relaxed">
                        <span className="text-slate-500">[{l.timestamp}]</span>{" "}
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] mr-1.5 ${
                          l.type === "info" ? "bg-blue-950/80 text-blue-400 border border-blue-900/60" :
                          l.type === "success" ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900/60" :
                          l.type === "warn" ? "bg-amber-950/80 text-amber-400 border border-amber-900/60" :
                          "bg-rose-950/80 text-rose-400 border border-rose-900/60"
                        }`}>
                          {l.module}
                        </span>{" "}
                        <span className={
                          l.type === "error" ? "text-rose-400" : 
                          l.type === "warn" ? "text-amber-400" :
                          l.type === "success" ? "text-emerald-300" : "text-slate-300"
                        }>
                          {l.message}
                        </span>
                      </p>
                    ))}
                    <div ref={terminalBottomRef} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-tab: Configurações de Sincronização & Polling Automático */}
          {erpActiveSubTab === "sincronizacao" && (
            <SyncSettingsConfig
              erpName={erpName}
              pollingInterval={pollingIntervalMinutes}
              setPollingInterval={(val) => {
                setPollingIntervalMinutes(val);
                localStorage.setItem("erp_polling_interval_minutes", val.toString());
              }}
              pollingEnabled={pollingEnabled}
              setPollingEnabled={(enabled) => {
                setPollingEnabled(enabled);
                localStorage.setItem("erp_polling_enabled", enabled.toString());
              }}
              syncFrequency={syncFrequency}
              setSyncFrequency={setSyncFrequency}
              baseUrl={erpWebhookUrl}
              onToast={(msg, type) => setToast({ message: msg, type })}
              onLogAdd={addLog}
            />
          )}

          {/* Sub-tab: Régua de Cobrança Automática WhatsApp */}
          {erpActiveSubTab === "regua_cobranca" && (
            <AutomatedBillingSchedulePanel
              erpName={erpName}
              estudantes={estudantes}
              onToast={(msg, type) => setToast({ message: msg, type })}
              onLogAdd={addLog}
              onOpenInvoiceReminderModal={() => handleTriggerInvoiceAlertModal()}
            />
          )}

          {/* Sub-tab: Alertas WhatsApp ERP */}
          {erpActiveSubTab === "alertas_whatsapp" && (
            <div className="space-y-4">
              {/* Quick Action Banner to open the dedicated full-screen/modal Invoice Reminder configuration */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-amber-950/20 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 font-mono flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Modal de Alertas & Régua de Vencimento WhatsApp
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-200">
                      1 a 30 dias
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Defina lembretes automáticos com pré-visualização em tempo real de mensagens, agendamento e modelos personalizáveis para os responsáveis.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-open-modal-alertas-whatsapp-subtab"
                  onClick={() => handleTriggerInvoiceAlertModal()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Abrir Modal de Alertas de Faturas</span>
                </button>
              </div>

              <ErpWhatsAppInvoiceAlertConfig
                erpName={erpName}
                estudantes={estudantes}
                onToast={(msg, type) => setToast({ message: msg, type })}
                onLogAdd={addLog}
              />
            </div>
          )}

          {/* Sub-tab: Agendador de Lembretes & Disparos WhatsApp com Validação de Cron */}
          {erpActiveSubTab === "agendador" && (
            <div className="space-y-4">
              <AgendadorLembretesFinanceiros
                cobrancas={
                  cobrancas && cobrancas.length > 0 
                    ? cobrancas 
                    : [
                        { id: "cob-1", title: "Mensalidade Setembro - Ensino Fundamental", dueDate: "25/09/2026", amount: 1450.0, status: "pendente", documentId: "FAT-2026-09", category: "mensalidade" },
                        { id: "cob-2", title: "Material Didático & Bilíngue 2026", dueDate: "30/09/2026", amount: 680.0, status: "pendente", documentId: "FAT-2026-MAT", category: "material" },
                        { id: "cob-3", title: "Taxa Extracurricular (Robótica & Artes)", dueDate: "10/10/2026", amount: 320.0, status: "pendente", documentId: "FAT-2026-EXT", category: "servico" },
                        { id: "cob-4", title: "Mensalidade Agosto (Em atraso)", dueDate: "25/08/2026", amount: 1450.0, status: "vencido", documentId: "FAT-2026-08", category: "mensalidade" },
                        { id: "cob-5", title: "Mensalidade Julho", dueDate: "25/07/2026", amount: 1450.0, status: "pago", documentId: "FAT-2026-07", category: "mensalidade" },
                      ]
                }
                erpName={erpName}
              />
            </div>
          )}

        </div>

        {/* Right Column: Module triggers & Sync History */}
        <div className="space-y-6">
          
          {/* Quick Manual Execution triggers */}
          <div className="bg-white/95 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-black text-xs uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-1.5 border-b border-amber-100/50 dark:border-slate-850 pb-2.5">
              <Play className="w-4 h-4 text-indigo-600" /> Sincronizações Manuais (Módulos)
            </h3>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Execute tarefas de sincronização sob demanda para módulos de dados específicos sem a necessidade de esperar pelo gatilho diário automático.
            </p>

            <div className="space-y-3 pt-1">
              {/* Job 1: Secretaria */}
              <button
                type="button"
                disabled={loadingModule !== null}
                onClick={() => handleTriggerSync("secretaria")}
                className="w-full text-left bg-[#fdfaf3] hover:bg-indigo-50/40 dark:bg-slate-950/40 dark:hover:bg-indigo-950/20 border border-slate-200/70 dark:border-slate-850 p-3 rounded-2xl flex items-center justify-between transition-all group disabled:opacity-50 cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-black text-indigo-700 dark:text-indigo-400 block uppercase">Modulo Secretaria</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-amber-100 block">Sincronizar Alunos & Turmas</span>
                  <span className="text-[9px] text-slate-400 block">Fichas cadastrais, idades e turmas</span>
                </div>
                <div className="w-8 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-700 group-hover:text-white transition-all shadow-3xs">
                  {loadingModule === "secretaria" ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-slate-500 group-hover:text-white" />
                  )}
                </div>
              </button>

              {/* Job 2: Academico */}
              <button
                type="button"
                disabled={loadingModule !== null}
                onClick={() => handleTriggerSync("academico")}
                className="w-full text-left bg-[#fdfaf3] hover:bg-emerald-50/40 dark:bg-slate-950/40 dark:hover:bg-emerald-950/20 border border-slate-200/70 dark:border-slate-850 p-3 rounded-2xl flex items-center justify-between transition-all group disabled:opacity-50 cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-black text-emerald-700 dark:text-emerald-400 block uppercase">Modulo Academico</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-amber-100 block">Sincronizar Boletim e Notas</span>
                  <span className="text-[9px] text-slate-400 block">Exportar notas bimestrais p/ diário oficial</span>
                </div>
                <div className="w-8 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-3xs">
                  {loadingModule === "academico" ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-slate-500 group-hover:text-white" />
                  )}
                </div>
              </button>

              {/* Job 3: Financeiro */}
              <button
                type="button"
                disabled={loadingModule !== null}
                onClick={() => handleTriggerSync("financeiro")}
                className="w-full text-left bg-[#fdfaf3] hover:bg-amber-50/40 dark:bg-slate-950/40 dark:hover:bg-amber-950/20 border border-slate-200/70 dark:border-slate-850 p-3 rounded-2xl flex items-center justify-between transition-all group disabled:opacity-50 cursor-pointer"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-black text-amber-700 dark:text-amber-400 block uppercase">Modulo Financeiro</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-amber-100 block">Conciliação de Boletos</span>
                  <span className="text-[9px] text-slate-400 block">Status de pagamentos e parcelamentos</span>
                </div>
                <div className="w-8 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-3xs">
                  {loadingModule === "financeiro" ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-slate-500 group-hover:text-white" />
                  )}
                </div>
              </button>

              {/* Job Especial: Forçar Sincronização de Faturas (Bypass de Cache) */}
              <button
                type="button"
                id="btn-force-sync-erp-sidebar"
                disabled={isForcingSync || loadingModule !== null}
                onClick={handleForceSync}
                className="w-full text-left bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 border border-amber-300/80 dark:border-amber-800/80 p-3.5 rounded-2xl flex items-center justify-between transition-all group disabled:opacity-50 cursor-pointer shadow-3xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-black text-amber-800 dark:text-amber-400 uppercase">
                      Faturas & Pendências
                    </span>
                    <span className="text-[8px] font-mono font-black bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-1 py-0.2 rounded uppercase">
                      Bypass Cache
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900 dark:text-amber-100 block">
                    Forçar Sincronização
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
                    Limpa cache local e baixa dados frescos da API
                  </span>
                </div>
                <div className="w-8 h-8 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center shrink-0 shadow-3xs group-hover:scale-105 transition-transform">
                  <RotateCcw className={`w-4 h-4 ${isForcingSync ? "animate-spin" : ""}`} />
                </div>
              </button>

              {/* Job 4: Completo */}
              <button
                type="button"
                disabled={loadingModule !== null}
                onClick={() => handleTriggerSync("completo")}
                className="w-full bg-indigo-700 hover:bg-indigo-850 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loadingModule === "completo" ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sincronizando Banco Completo...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Sincronia Geral Forçada ⚡</span>
                  </>
                )}
              </button>

              {/* Ação Direta: Régua de Cobrança ERP (Horários & Critérios de Envio) */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  id="btn-open-regua-schedule-sidebar"
                  onClick={() => {
                    setErpActiveSubTab("regua_cobranca");
                    localStorage.setItem("erp_active_subtab", "regua_cobranca");
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-3.5 rounded-2xl text-xs shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
                  title="Configurar horários, frequência e critérios de envio da régua de cobrança automática"
                >
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-slate-950 shrink-0" />
                    <div className="text-left">
                      <span className="block text-xs font-black">Régua de Cobrança ERP</span>
                      <span className="block text-[10px] text-slate-900/80 font-normal">Horários ({inlineScheduleTime}h), {inlineScheduleFrequency} & critérios</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>

                <button
                  type="button"
                  id="btn-open-invoice-alerts-sidebar"
                  onClick={() => handleTriggerInvoiceAlertModal()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-3.5 rounded-2xl text-xs shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
                  title="Abrir modal de configuração de alertas automáticos de WhatsApp para faturas com vencimento em até 30 dias"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-200 shrink-0" />
                    <div className="text-left">
                      <span className="block text-xs font-black">Alertas WhatsApp de Faturas</span>
                      <span className="block text-[10px] text-emerald-100/90 font-normal">Régua preventiva de 1 a 30 dias</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Audit Log Card: Ultimas 5 tentativas (sucesso/falha) */}
          <div className="bg-white/95 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-black text-xs uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center justify-between border-b border-amber-100/50 dark:border-slate-850 pb-2.5">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Log de Auditoria da API (Últimos 5 Disparos)
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">
                Real-time Audit
              </span>
            </h3>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Histórico rastreável e auditado das últimas requisições HTTP enviadas ao endpoint do ERP escolar. Útil para diagnósticos de conectividade e segurança.
            </p>

            <div className="space-y-3">
              {syncAttempts.map((attempt) => (
                <div 
                  key={attempt.id} 
                  className={`p-3 rounded-2xl border flex flex-col gap-2 transition-all ${
                    attempt.status === "success" 
                      ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-100/60 dark:border-emerald-900/30" 
                      : "bg-rose-50/40 dark:bg-rose-950/10 border-rose-100/60 dark:border-rose-900/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        attempt.status === "success" ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"
                      }`} />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        {attempt.module}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-mono text-slate-400 font-bold">
                      {attempt.timestamp}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <code className="text-[10px] font-mono bg-white dark:bg-slate-950 p-1 border border-slate-150 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 block truncate max-w-[180px] sm:max-w-[260px]">
                        POST {attempt.endpoint}
                      </code>
                      <p className="text-[10px] text-slate-555 dark:text-slate-400 font-sans leading-tight">
                        {attempt.details}
                      </p>
                    </div>

                    <span className={`px-2 py-1 rounded-lg text-[10px] font-mono font-black border uppercase tracking-wider shrink-0 ${
                      attempt.status === "success" 
                        ? "bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200/40" 
                        : "bg-rose-100/80 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200/40"
                    }`}>
                      {attempt.code} {attempt.status === "success" ? "OK" : attempt.code === 401 ? "UNAUTH" : "ERR"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync History Logs List */}
          <div className="bg-white/95 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-black text-xs uppercase tracking-wider text-[#423326] dark:text-amber-100 flex items-center gap-1.5 border-b border-amber-100/50 dark:border-slate-850 pb-2.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Histórico Recente de Sincronia
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {syncHistory.map((sh) => (
                <div key={sh.id} className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-2 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{sh.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider ${
                      sh.status === "success" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200/40" :
                      sh.status === "partial" ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200/40" :
                      "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200/40"
                    }`}>
                      {sh.status === "success" && "Sucesso"}
                      {sh.status === "partial" && "Parcial"}
                      {sh.status === "failed" && "Falha"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-[#423326] dark:text-amber-100 capitalize">
                        Módulo {sh.module}
                      </span>
                      <span className="text-[9.5px] text-slate-550 dark:text-slate-400 block">
                        {sh.recordsProcessed} registros processados em {sh.durationMs}ms
                      </span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedHistoryPayload(sh);
                        addLog("info", `Aberto inspetor de payload JSON para sincronização ID ${sh.id}`, "USER");
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 shadow-3xs flex items-center justify-center cursor-pointer hover:border-indigo-200"
                      title="Ver Payload JSON"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* JSON Payload Inspector Dialog Modal */}
      {selectedHistoryPayload && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl">
                  <Code className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-serif font-black text-sm uppercase tracking-wider text-[#423326] dark:text-amber-100">
                    Inspetor de Carga útil JSON (Payload)
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Sincronia ID: {selectedHistoryPayload.id} • Executado em {selectedHistoryPayload.timestamp}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                selectedHistoryPayload.status === "success" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" :
                selectedHistoryPayload.status === "partial" ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300" :
                "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
              }`}>
                {selectedHistoryPayload.status}
              </span>
            </div>

            {/* Modal Body / Codeblock */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-950">
              <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(selectedHistoryPayload.payloadMock, null, 2)}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setSelectedHistoryPayload(null)}
                className="bg-[#423326] dark:bg-amber-950/20 hover:bg-slate-850 text-white dark:text-amber-300 font-bold px-5 py-2 rounded-xl text-xs shadow-3xs cursor-pointer transition-all"
              >
                Fechar Visualizador
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Quick Webhooks Configuration Modal */}
      <ErpQuickWebhooksModal
        isOpen={isQuickWebhooksModalOpen}
        onClose={() => setIsQuickWebhooksModalOpen(false)}
        erpName={erpName}
        baseUrl={erpWebhookUrl}
        setToast={setToast}
        addLog={addLog}
      />

      {/* Modal de Alertas WhatsApp de Faturas (ERP) */}
      {!onOpenInvoiceReminderModal && isLocalInvoiceModalOpen && (
        <InvoiceWhatsAppReminderModal
          isOpen={isLocalInvoiceModalOpen}
          onClose={() => setIsLocalInvoiceModalOpen(false)}
          selectedInvoice={selectedInvoiceForModal}
          allInvoices={cobrancas}
          students={estudantes}
          defaultDaysBefore={5}
          onToast={(msg, type) => setToast({ message: msg, type })}
        />
      )}

      {/* Modal de Progresso: Forçar Sincronização de Faturas */}
      <AnimatePresence>
        {showForceSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                    forceSyncStage === "completed"
                      ? "bg-emerald-500/10 border-emerald-300/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 border-amber-300/40 text-amber-600 dark:text-amber-400"
                  }`}>
                    <RotateCcw className={`w-5 h-5 ${isForcingSync ? "animate-spin" : ""}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-black text-sm sm:text-base text-slate-900 dark:text-amber-100">
                        Forçar Sincronização de Faturas
                      </h3>
                      <span className="text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300/60 dark:border-amber-800/60 uppercase">
                        Bypass Cache
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                      Consulta direta ao endpoint financeiro do provedor {erpName.toUpperCase()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForceSyncModal(false)}
                  disabled={isForcingSync}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                
                {/* Progress Bar & Status Info */}
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                      {forceSyncStage === "clearing_cache" && "1/4 • Limpando Cache Local de Faturas..."}
                      {forceSyncStage === "connecting_api" && `2/4 • Conectando à API ${erpName.toUpperCase()}...`}
                      {forceSyncStage === "downloading_invoices" && "3/4 • Baixando Pendências Mais Recentes..."}
                      {forceSyncStage === "updating_cache" && "4/4 • Reconciliando Títulos e Renovando Cache..."}
                      {forceSyncStage === "completed" && "✓ Sincronização Concluída com Sucesso!"}
                      {forceSyncStage === "idle" && "Aguardando início..."}
                    </span>
                    <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                      {forceSyncProgress}%
                    </span>
                  </div>

                  {/* Progress track */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${
                        forceSyncStage === "completed" ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${forceSyncProgress}%` }}
                      transition={{ ease: "easeInOut", duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Steps Checklist */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Etapas de Processamento
                  </span>

                  <div className="space-y-1.5 font-sans">
                    {/* Step 1 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-850/80 bg-white dark:bg-slate-900 text-xs">
                      <div className="flex items-center gap-2">
                        {forceSyncProgress >= 35 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : forceSyncStage === "clearing_cache" ? (
                          <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                        )}
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          1. Invalidação e Limpeza do Cache Local de Cobrança
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {forceSyncProgress >= 35 ? "OK" : forceSyncStage === "clearing_cache" ? "Executando" : "Pendente"}
                      </span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-850/80 bg-white dark:bg-slate-900 text-xs">
                      <div className="flex items-center gap-2">
                        {forceSyncProgress >= 65 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : forceSyncStage === "connecting_api" ? (
                          <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                        )}
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          2. Handshake Seguro SSL & Autenticação Bearer ({erpName.toUpperCase()})
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {forceSyncProgress >= 65 ? "OK" : forceSyncStage === "connecting_api" ? "Executando" : "Pendente"}
                      </span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-850/80 bg-white dark:bg-slate-900 text-xs">
                      <div className="flex items-center gap-2">
                        {forceSyncProgress >= 88 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : forceSyncStage === "downloading_invoices" ? (
                          <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                        )}
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          3. Busca de Pendências e Títulos Não Conciliados (/api/v2/invoices/pending)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {forceSyncProgress >= 88 ? "OK" : forceSyncStage === "downloading_invoices" ? "Executando" : "Pendente"}
                      </span>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-850/80 bg-white dark:bg-slate-900 text-xs">
                      <div className="flex items-center gap-2">
                        {forceSyncProgress >= 100 ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : forceSyncStage === "updating_cache" ? (
                          <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                        )}
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          4. Reconstrução do Cache Local com Dados em Tempo Real
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {forceSyncProgress >= 100 ? "OK" : forceSyncStage === "updating_cache" ? "Executando" : "Pendente"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Telemetry Box */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    Telemetria da Requisição Direta
                  </span>
                  <div className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed border border-slate-800 space-y-1 overflow-x-auto">
                    <p className="text-slate-500">
                      $ curl -X GET "{erpWebhookUrl || "https://api.erp.colegio.br/v2"}/invoices/pending" \
                    </p>
                    <p className="text-slate-500">
                      &nbsp;&nbsp;-H "Authorization: Bearer [REDACTED]" -H "X-Cache-Bypass: true"
                    </p>
                    {forceSyncProgress >= 35 && (
                      <p className="text-amber-400">
                        [CACHE] Chave 'erp_invoices_cache' removida. Limpeza concluída.
                      </p>
                    )}
                    {forceSyncProgress >= 65 && (
                      <p className="text-sky-400">
                        [NETWORK] TLS Handshake aceito por api.{erpName}.com.br (TLS 1.3, AES-256-GCM).
                      </p>
                    )}
                    {forceSyncProgress >= 88 && (
                      <p className="text-emerald-400">
                        [HTTP/1.1 200 OK] 7 faturas em atraso/pendentes retornadas no payload.
                      </p>
                    )}
                    {forceSyncProgress >= 100 && (
                      <p className="text-emerald-300 font-bold">
                        [SUCCESS] Novo cache salvo em localStorage. Dashboard e alertas atualizados!
                      </p>
                    )}
                  </div>
                </div>

                {/* Completion Summary Stats */}
                {forceSyncStats && (
                  <div className="bg-emerald-500/10 border border-emerald-300/40 dark:border-emerald-800/40 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs font-sans">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Dados Atualizados Diretamente do Provedor</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200/50 dark:border-slate-800">
                        <span className="text-[9px] font-mono text-slate-400 block uppercase">Faturas</span>
                        <span className="text-sm font-serif font-black text-slate-800 dark:text-emerald-100">
                          {forceSyncStats.invoicesCount} itens
                        </span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200/50 dark:border-slate-800">
                        <span className="text-[9px] font-mono text-slate-400 block uppercase">Total Aberto</span>
                        <span className="text-sm font-serif font-black text-slate-800 dark:text-emerald-100">
                          {forceSyncStats.totalAmount}
                        </span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200/50 dark:border-slate-800">
                        <span className="text-[9px] font-mono text-slate-400 block uppercase">Latência</span>
                        <span className="text-sm font-serif font-black text-slate-800 dark:text-emerald-100">
                          {forceSyncStats.durationMs}ms
                        </span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-200/50 dark:border-slate-800">
                        <span className="text-[9px] font-mono text-slate-400 block uppercase">Origem</span>
                        <span className="text-sm font-serif font-black text-emerald-700 dark:text-emerald-300 uppercase">
                          API Direta
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans text-center sm:text-left">
                  {isForcingSync 
                    ? "Operação atômica em andamento. Não feche a janela."
                    : "Cache atualizado e gravado localmente para navegação rápida."}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {!isForcingSync && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForceSyncModal(false);
                        setErpActiveSubTab("alertas");
                      }}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold font-sans cursor-pointer transition-colors"
                    >
                      Ver Faturas Monitoradas
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowForceSyncModal(false)}
                    disabled={isForcingSync}
                    className="px-5 py-2 bg-[#423326] dark:bg-amber-950/40 hover:bg-slate-850 text-white dark:text-amber-200 rounded-xl text-xs font-bold font-sans cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isForcingSync ? "Processando..." : "Concluir"}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
