import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Zap,
  Clock,
  MessageSquare,
  Send,
  Check,
  Copy,
  Calendar,
  AlertTriangle,
  FileText,
  Sliders,
  DollarSign,
  User,
  Phone,
  QrCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  Repeat,
  RefreshCw,
  AlertCircle,
  Edit3,
  Plus,
  Trash2,
  Tag,
  Bookmark,
  Layers,
  CopyCheck,
  HelpCircle,
  Filter
} from "lucide-react";
import { Cobranca, Estudante } from "../types";
import { ErpWhatsAppInvoiceAlertConfig } from "./ErpWhatsAppInvoiceAlertConfig";
import { triggerGoldenConfettiForPortaria } from "../utils/goldenConfetti";

export type ReminderDeliveryStatus = "Agendado" | "Enviado" | "Falha";

export interface InvoiceDeliveryRecord {
  status: ReminderDeliveryStatus;
  timestamp?: string;
  errorMessage?: string;
  retryCount?: number;
}

export interface InvoiceReminderRule {
  invoiceId: string;
  daysBefore: number;
  dispatchTime: string;
  frequency: ReminderFrequency;
  intervalDays: number;
  customMessage?: string;
  enabled: boolean;
  scheduledDate?: string;
  updatedAt?: string;
}

export type ReminderFrequency = 
  | "diario" 
  | "cada_3_dias" 
  | "semanal" 
  | "preventivo_unico" 
  | "regua_escalonada" 
  | "diario_pre_vencimento" 
  | "pos_vencimento_recorrente";

export const FREQUENCY_OPTIONS: { 
  id: ReminderFrequency; 
  label: string; 
  tag: string; 
  desc: string; 
  defaultInterval: number;
  iconName: string;
}[] = [
  { 
    id: "diario", 
    label: "Diária", 
    tag: "Todo dia",
    desc: "Disparos diários automáticos a partir da data de antecedência até a compensação da fatura", 
    defaultInterval: 1,
    iconName: "Calendar" 
  },
  { 
    id: "cada_3_dias", 
    label: "A cada 3 dias", 
    tag: "Recomendado",
    desc: "Disparos automáticos escalonados a cada 3 dias dentro da janela preventiva da régua ERP", 
    defaultInterval: 3,
    iconName: "RotateCcw" 
  },
  { 
    id: "semanal", 
    label: "Semanal", 
    tag: "A cada 7 dias",
    desc: "Disparo programado a cada 7 dias para acompanhamento financeiro contínuo", 
    defaultInterval: 7,
    iconName: "Clock" 
  },
  { 
    id: "preventivo_unico", 
    label: "Disparo Único", 
    tag: "1 Envio",
    desc: "Disparo preventivo único exatamente na data de antecedência configurada (5 dias antes)", 
    defaultInterval: 0,
    iconName: "Zap" 
  },
  { 
    id: "regua_escalonada", 
    label: "Régua Escalonada ERP", 
    tag: "Inteligente",
    desc: "Disparos graduais automatizados sincronizados com a política financeira da escola", 
    defaultInterval: 3,
    iconName: "Sliders" 
  }
];

export interface InvoiceWhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInvoice?: Cobranca | null;
  allInvoices?: Cobranca[];
  students?: Estudante[];
  defaultDaysBefore?: number;
  initialRuleContext?: "5_day_pre_due" | "custom";
  onToast?: (message: string, type: "success" | "error" | "info") => void;
  onSaveRule?: (
    invoiceId: string,
    daysBefore: number,
    time: string,
    messageTemplate: string,
    frequency?: ReminderFrequency,
    intervalDays?: number
  ) => void;
  onSimulateSend?: (invoice: Cobranca, message: string, phone: string) => void;
}

// Custom Message Template definition
export interface CustomMessageTemplate {
  id: string;
  name: string;
  template: string;
  isSystem?: boolean;
  category: "preventivo" | "vencimento" | "cobranca" | "personalizado";
  description?: string;
  updatedAt?: string;
}

// Dynamic placeholders metadata
export interface TemplatePlaceholderInfo {
  tag: string;
  label: string;
  example: string;
  description: string;
}

export const DYNAMIC_PLACEHOLDERS: TemplatePlaceholderInfo[] = [
  { tag: "{{aluno}}", label: "Nome do Aluno", example: "Lucas Silva", description: "Nome do estudante vinculado à fatura escolar" },
  { tag: "{{valor}}", label: "Valor da Cobrança", example: "1.250,00", description: "Valor em Reais (R$) formatado" },
  { tag: "{{responsavel}}", label: "Nome do Responsável", example: "Roberto Silva", description: "Nome completo do responsável financeiro" },
  { tag: "{{vencimento}}", label: "Data de Vencimento", example: "10/08/2026", description: "Data de vencimento do documento" },
  { tag: "{{titulo}}", label: "Título da Fatura", example: "Mensalidade Escolar", description: "Identificação da cobrança" },
  { tag: "{{documento}}", label: "Nº do Documento", example: "FAT-2026-08", description: "Identificador ERP da fatura" },
  { tag: "{{dias}}", label: "Prazo de Antecedência", example: "daqui a 5 dias", description: "Contagem regressiva até o vencimento" },
  { tag: "{{escola}}", label: "Nome da Escola", example: "Colégio Magic Learning", description: "Nome da instituição escolar" },
  { tag: "{{pix}}", label: "Chave PIX Copia & Cola", example: "000201...", description: "Bloco formatado com a chave PIX instantânea" },
  { tag: "{{link}}", label: "Link do Boleto / 2ª Via", example: "https://...", description: "Link direto para visualização e 2ª via" }
];

// Default built-in system templates supporting dynamic {{aluno}} and {{valor}}
export const DEFAULT_SYSTEM_TEMPLATES: CustomMessageTemplate[] = [
  {
    id: "amigavel",
    name: "Amigável (Padrão)",
    category: "preventivo",
    isSystem: true,
    description: "Tom cordial e leve, ideal para lembretes preventivos de 3 a 5 dias antes.",
    template: `Olá, *{{responsavel}}*! 👋

Passando para lembrar que a fatura *{{titulo}}* do(a) aluno(a) *{{aluno}}* vence em *{{vencimento}}* ({{dias}}).

💰 *Valor:* R$ {{valor}}
📄 *Documento:* {{documento}}

{{pix}}
{{link}}

Caso já tenha efetuado o pagamento, por favor desconsidere este aviso. Estamos à disposição na secretaria do {{escola}}! 🏫`
  },
  {
    id: "formal",
    name: "Formal / Corporativo",
    category: "cobranca",
    isSystem: true,
    description: "Comunicação objetiva e institucional com identificação contábil.",
    template: `Prezado(a) *{{responsavel}}*,

Informamos que o documento de cobrança *{{titulo}}* vinculado ao(à) estudante *{{aluno}}* possui vencimento programado para *{{vencimento}}*.

• *Valor Líquido:* R$ {{valor}}
• *Número do Documento:* {{documento}}
• *Situação:* Aguardando compensação bancária

{{pix}}
{{link}}

Atenciosamente,
*Departamento Financeiro — {{escola}}*`
  },
  {
    id: "urgente",
    name: "Véspera / Atenção",
    category: "vencimento",
    isSystem: true,
    description: "Mensagem de alerta para véspera ou dia do vencimento com foco na pontualidade.",
    template: `⚠️ *Lembrete de Vencimento — {{escola}}*

Olá, *{{responsavel}}*! 
A fatura *{{titulo}}* referente a *{{aluno}}* vence *{{dias}}* (*{{vencimento}}*).

💰 *Valor:* R$ {{valor}}
📄 *Documento:* {{documento}}

{{pix}}
{{link}}

Evite juros e encargos efetuando o pagamento até a data limite. Obrigado!`
  },
  {
    id: "desconto_pontualidade",
    name: "Benefício de Pontualidade",
    category: "preventivo",
    isSystem: true,
    description: "Destaca bonificações e descontos concedidos para pagamentos efetuados até a data limite.",
    template: `🌟 *Benefício de Pontualidade — {{escola}}*

Olá, *{{responsavel}}*!
Lembramos que a mensalidade de *{{aluno}}* tem vencimento em *{{vencimento}}*.

💰 *Valor:* R$ {{valor}}
✨ Pagando até o vencimento, você mantém ativa a bonificação de pontualidade da escola!

{{pix}}
{{link}}

Agradecemos a parceria com nossa comunidade escolar!`
  },
  {
    id: "direto_curto",
    name: "Notificação Direta (Curta)",
    category: "preventivo",
    isSystem: true,
    description: "Texto conciso e direto, perfeito para leitura instantânea no WhatsApp.",
    template: `{{escola}}: Olá, *{{responsavel}}*! A fatura de *{{aluno}}* no valor de R$ {{valor}} vence em *{{vencimento}}*.

Pague facilmente pelo PIX ou boleto:
{{pix}}
{{link}}`
  }
];

// Backwards-compatible legacy object
export const MESSAGE_TEMPLATES = {
  amigavel: {
    label: "Amigável (Padrão)",
    template: DEFAULT_SYSTEM_TEMPLATES[0].template
  },
  formal: {
    label: "Formal / Corporativo",
    template: DEFAULT_SYSTEM_TEMPLATES[1].template
  },
  urgente: {
    label: "Véspera / Atenção",
    template: DEFAULT_SYSTEM_TEMPLATES[2].template
  }
};

/**
 * Powerful interpolation engine supporting both {{aluno}}, {{valor}} double-curly
 * syntax, single-brace {aluno}, {valor}, and legacy uppercase {NOME_ALUNO}, {VALOR_FATURA}.
 */
export function interpolateWhatsAppTemplate(
  template: string,
  data: {
    studentName: string;
    parentName: string;
    invoiceTitle: string;
    dueDate: string;
    amountFormatted: string;
    docId: string;
    diasTexto: string;
    schoolName?: string;
    pixBlock?: string;
    linkBlock?: string;
  }
): string {
  if (!template) return "";
  let text = template;

  const school = data.schoolName || "Colégio Magic Learning";
  const pix = data.pixBlock || "";
  const link = data.linkBlock || "";

  // 1. Dynamic double-curly placeholders: {{aluno}}, {{valor}}, {{responsavel}}, etc.
  text = text.replace(/\{\{\s*aluno\s*\}\}/gi, data.studentName);
  text = text.replace(/\{\{\s*valor\s*\}\}/gi, data.amountFormatted);
  text = text.replace(/\{\{\s*responsavel\s*\}\}/gi, data.parentName);
  text = text.replace(/\{\{\s*vencimento\s*\}\}/gi, data.dueDate);
  text = text.replace(/\{\{\s*titulo\s*\}\}/gi, data.invoiceTitle);
  text = text.replace(/\{\{\s*documento\s*\}\}/gi, data.docId);
  text = text.replace(/\{\{\s*dias\s*\}\}/gi, data.diasTexto);
  text = text.replace(/\{\{\s*escola\s*\}\}/gi, school);
  text = text.replace(/\{\{\s*pix\s*\}\}/gi, pix);
  text = text.replace(/\{\{\s*link\s*\}\}/gi, link);

  // 2. Single-curly lowercase: {aluno}, {valor}, etc.
  text = text.replace(/\{\s*aluno\s*\}/gi, data.studentName);
  text = text.replace(/\{\s*valor\s*\}/gi, data.amountFormatted);
  text = text.replace(/\{\s*responsavel\s*\}/gi, data.parentName);
  text = text.replace(/\{\s*vencimento\s*\}/gi, data.dueDate);
  text = text.replace(/\{\s*titulo\s*\}/gi, data.invoiceTitle);
  text = text.replace(/\{\s*documento\s*\}/gi, data.docId);
  text = text.replace(/\{\s*dias\s*\}/gi, data.diasTexto);
  text = text.replace(/\{\s*escola\s*\}/gi, school);
  text = text.replace(/\{\s*pix\s*\}/gi, pix);
  text = text.replace(/\{\s*link\s*\}/gi, link);

  // 3. Legacy uppercase placeholders: {NOME_ALUNO}, {VALOR_FATURA}, etc.
  text = text.replace(/\{NOME_ALUNO\}/g, data.studentName);
  text = text.replace(/\{VALOR_FATURA\}/g, data.amountFormatted);
  text = text.replace(/\{NOME_RESPONSAVEL\}/g, data.parentName);
  text = text.replace(/\{DATA_VENCIMENTO\}/g, data.dueDate);
  text = text.replace(/\{TITULO_FATURA\}/g, data.invoiceTitle);
  text = text.replace(/\{DOC_ID\}/g, data.docId);
  text = text.replace(/\{DIAS_TEXTO\}/g, data.diasTexto);
  text = text.replace(/\{BLOCO_PIX\}/g, pix);
  text = text.replace(/\{BLOCO_LINK\}/g, link);

  return text.replace(/\n\s*\n\s*\n/g, "\n\n").trim();
}

/**
 * Helper to parse a "DD/MM/YYYY" string into a Date object
 */
function parseBrazilianDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day, 12, 0, 0);
    }
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Calculates the target dispatch date by subtracting N days from the due date
 */
function calculateDispatchDate(dueDateStr?: string, daysBefore: number = 5): { formatted: string; fullDate: string; isPast: boolean } {
  const dueDate = parseBrazilianDate(dueDateStr);
  const targetDate = new Date(dueDate.getTime());
  targetDate.setDate(targetDate.getDate() - daysBefore);

  const day = String(targetDate.getDate()).padStart(2, "0");
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const year = targetDate.getFullYear();

  const dayOfWeekNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const dayOfWeek = dayOfWeekNames[targetDate.getDay()];
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const monthName = monthNames[targetDate.getMonth()];

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkTarget = new Date(targetDate);
  checkTarget.setHours(0, 0, 0, 0);

  return {
    formatted: `${day}/${month}/${year}`,
    fullDate: `${dayOfWeek}, ${day} de ${monthName} de ${year}`,
    isPast: checkTarget.getTime() < now.getTime()
  };
}

/**
 * Generates an array of scheduled reminder dates based on due date, lead days, frequency, and interval
 */
function computeScheduleSteps(
  dueDateStr?: string,
  daysBefore: number = 5,
  frequency: ReminderFrequency = "cada_3_dias",
  intervalDays: number = 3
): { label: string; formatted: string; daysBeforeDue: number }[] {
  if (!dueDateStr) return [];
  const dueDate = parseBrazilianDate(dueDateStr);
  const steps: { label: string; formatted: string; daysBeforeDue: number }[] = [];

  if (frequency === "preventivo_unico" || intervalDays <= 0) {
    const d = new Date(dueDate.getTime());
    d.setDate(d.getDate() - daysBefore);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    steps.push({
      label: `Disparo Único (${daysBefore}d antes)`,
      formatted: `${day}/${month}/${year}`,
      daysBeforeDue: daysBefore
    });
    return steps;
  }

  let currentDays = daysBefore;
  let counter = 1;
  const effectiveInterval = Math.max(1, intervalDays);

  while (currentDays >= 0 && steps.length < 5) {
    const d = new Date(dueDate.getTime());
    d.setDate(d.getDate() - currentDays);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const label = currentDays === 0
      ? "Dia do Vencimento"
      : currentDays === 1
      ? "Véspera (1d antes)"
      : `${counter}º Envio (${currentDays}d antes)`;

    steps.push({
      label,
      formatted: `${day}/${month}/${year}`,
      daysBeforeDue: currentDays
    });

    currentDays -= effectiveInterval;
    counter++;
  }

  return steps;
}

const EMPTY_INVOICES: Cobranca[] = [];
const EMPTY_STUDENTS: any[] = [];

export default function InvoiceWhatsAppReminderModal({
  isOpen,
  onClose,
  selectedInvoice: initialSelectedInvoice,
  allInvoices = EMPTY_INVOICES,
  students = EMPTY_STUDENTS,
  defaultDaysBefore = 5,
  initialRuleContext = "5_day_pre_due",
  onToast,
  onSaveRule,
  onSimulateSend
}: InvoiceWhatsAppReminderModalProps) {
  // Modal view tabs: Focused custom invoice reminder vs. full ERP configuration component vs. Template Manager
  const [activeViewTab, setActiveViewTab] = useState<"regua_personalizada" | "componente_erp" | "modelos_personalizados">("regua_personalizada");

  // Invoices filter: "upcoming" (faturas a vencer) vs. "all" (todas)
  const [invoiceFilter, setInvoiceFilter] = useState<"upcoming" | "all">("upcoming");

  // Filter list of upcoming invoices (status pendente)
  const upcomingInvoices = useMemo(() => {
    return allInvoices.filter(c => c.status === "pendente");
  }, [allInvoices]);

  const displayedInvoices = useMemo(() => {
    if (invoiceFilter === "upcoming" && upcomingInvoices.length > 0) {
      return upcomingInvoices;
    }
    return allInvoices;
  }, [invoiceFilter, upcomingInvoices, allInvoices]);

  // Current active invoice
  const [activeInvoiceId, setActiveInvoiceId] = useState<string>(() => {
    return initialSelectedInvoice?.id || (upcomingInvoices.length > 0 ? upcomingInvoices[0].id : (allInvoices.length > 0 ? allInvoices[0].id : ""));
  });

  useEffect(() => {
    if (!isOpen) return;

    // Find candidate upcoming invoice (status: "pendente")
    const firstUpcoming = upcomingInvoices.length > 0 ? upcomingInvoices[0] : (allInvoices.find(c => c.status === "pendente") || allInvoices[0] || null);
    const targetInvoice = initialSelectedInvoice || firstUpcoming;
    
    if (targetInvoice) {
      setActiveInvoiceId(prev => (prev !== targetInvoice.id ? targetInvoice.id : prev));

      // Check if there is an existing stored rule for this invoice or configure 5-day pre-due rule
      if (typeof localStorage !== "undefined") {
        const rulesStr = localStorage.getItem("erp_invoice_reminder_rules");
        const rules = rulesStr ? JSON.parse(rulesStr) : {};
        const rule = rules[targetInvoice.id];

        if (rule && initialRuleContext !== "5_day_pre_due") {
          const ruleDays = rule.daysBefore ?? 5;
          setDaysBefore(prev => (prev !== ruleDays ? ruleDays : prev));
          setDaysBeforeRaw(prev => (prev !== String(ruleDays) ? String(ruleDays) : prev));
          setDispatchTime(prev => (prev !== (rule.dispatchTime ?? "09:00") ? (rule.dispatchTime ?? "09:00") : prev));
          setAutoReminderEnabled(prev => (prev !== (rule.enabled ?? true) ? (rule.enabled ?? true) : prev));
          if (rule.frequency) {
            setFrequency(prev => (prev !== rule.frequency ? rule.frequency : prev));
          }
          if (rule.intervalDays) {
            setIntervalDays(prev => (prev !== rule.intervalDays ? rule.intervalDays : prev));
          }
        } else {
          const d = defaultDaysBefore ?? 5;
          setDaysBefore(prev => (prev !== d ? d : prev));
          setDaysBeforeRaw(prev => (prev !== String(d) ? String(d) : prev));
          setDispatchTime(prev => (prev !== "09:00" ? "09:00" : prev));
          setAutoReminderEnabled(prev => (prev !== true ? true : prev));
          setFrequency(prev => (prev !== "cada_3_dias" ? "cada_3_dias" : prev));
          setIntervalDays(prev => (prev !== 3 ? 3 : prev));
        }
      } else {
        const d = defaultDaysBefore ?? 5;
        setDaysBefore(prev => (prev !== d ? d : prev));
        setDaysBeforeRaw(prev => (prev !== String(d) ? String(d) : prev));
        setAutoReminderEnabled(prev => (prev !== true ? true : prev));
        setDispatchTime(prev => (prev !== "09:00" ? "09:00" : prev));
      }
    }
    setDaysError(prev => (prev !== null ? null : prev));
    setSendSuccess(prev => (prev !== false ? false : prev));
    setCopiedPreview(prev => (prev !== false ? false : prev));
  }, [isOpen, initialSelectedInvoice?.id, defaultDaysBefore, initialRuleContext]);

  const activeInvoice: Cobranca | undefined = useMemo(() => {
    return allInvoices.find(c => c.id === activeInvoiceId) || initialSelectedInvoice || allInvoices[0];
  }, [activeInvoiceId, allInvoices, initialSelectedInvoice]);

  // Associated student
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  useEffect(() => {
    if (!isOpen) return;
    if (students && students.length > 0) {
      // Find matching student by invoice tags or name, else default to first student
      const matched = students.find(s => 
        activeInvoice?.title.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]) ||
        activeInvoice?.tags?.some(t => s.name.toLowerCase().includes(t.toLowerCase()))
      ) || students[0];
      if (matched && matched.id !== selectedStudentId) {
        setSelectedStudentId(matched.id);
      }
    }
  }, [isOpen, activeInvoice?.id, students]);

  const activeStudent = useMemo(() => {
    return students.find(s => s.id === selectedStudentId) || students[0] || {
      id: "est-default",
      name: "Lucas Silva",
      grade: "5º Ano A - Ensino Fundamental",
      parentName: "Roberto Silva",
      parentPhone: "(11) 98765-4321",
      parentEmail: "roberto.silva@email.com"
    };
  }, [selectedStudentId, students]);

  // Days before due date state
  const [daysBefore, setDaysBefore] = useState<number>(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("erp_auto_reminder_days_before");
      const parsed = saved ? parseInt(saved, 10) : 5;
      return !isNaN(parsed) && parsed >= 1 && parsed <= 30 ? parsed : 5;
    }
    return 5;
  });
  const [daysBeforeRaw, setDaysBeforeRaw] = useState<string>(String(daysBefore));
  const [daysError, setDaysError] = useState<string | null>(null);

  // Dispatch time
  const [dispatchTime, setDispatchTime] = useState<string>(() => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("erp_auto_reminder_time") || "09:00";
    }
    return "09:00";
  });

  // Automated schedule enabled toggle
  const [autoReminderEnabled, setAutoReminderEnabled] = useState<boolean>(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("erp_auto_reminder_5d_enabled");
      return saved === null ? true : saved === "true";
    }
    return true;
  });

  // Custom Message Templates state (persisted across sessions)
  const [customTemplates, setCustomTemplates] = useState<CustomMessageTemplate[]>(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("erp_whatsapp_custom_templates");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn("Failed to parse erp_whatsapp_custom_templates:", e);
      }
    }
    return DEFAULT_SYSTEM_TEMPLATES;
  });

  // Selected template id (defaults to 'amigavel')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("amigavel");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<"amigavel" | "formal" | "urgente">("amigavel");

  // Message template style & inclusions
  const [customMessage, setCustomMessage] = useState<string>(DEFAULT_SYSTEM_TEMPLATES[0].template);
  const [includePixKey, setIncludePixKey] = useState<boolean>(true);
  const [includeBoletoLink, setIncludeBoletoLink] = useState<boolean>(true);
  const [copiedPreview, setCopiedPreview] = useState<boolean>(false);
  const [isSendingSimulated, setIsSendingSimulated] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);

  // Reference to the active message textarea to allow exact cursor-position placeholder insertion
  const messageTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Template creation form state
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>("");
  const [newTemplateCategory, setNewTemplateCategory] = useState<"preventivo" | "vencimento" | "cobranca" | "personalizado">("personalizado");
  const [newTemplateDescription, setNewTemplateDescription] = useState<string>("");

  // Helper to persist custom templates to localStorage
  const persistTemplates = (templates: CustomMessageTemplate[]) => {
    setCustomTemplates(templates);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("erp_whatsapp_custom_templates", JSON.stringify(templates));
    }
  };

  // Select a template by ID
  const handleSelectTemplateById = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === "amigavel" || templateId === "formal" || templateId === "urgente") {
      setSelectedTemplateKey(templateId);
    }
    const found = customTemplates.find(t => t.id === templateId);
    if (found) {
      setCustomMessage(found.template);
      onToast?.(`Modelo "${found.name}" aplicado!`, "info");
    }
  };

  // Legacy selection helper
  const handleSelectTemplate = (key: "amigavel" | "formal" | "urgente") => {
    handleSelectTemplateById(key);
  };

  // Insert placeholder tag directly at textarea cursor position
  const handleInsertPlaceholder = (placeholderTag: string) => {
    const textarea = messageTextareaRef.current;
    if (!textarea) {
      setCustomMessage(prev => prev + " " + placeholderTag);
      onToast?.(`Tag ${placeholderTag} inserida na mensagem`, "info");
      return;
    }
    const start = textarea.selectionStart ?? customMessage.length;
    const end = textarea.selectionEnd ?? customMessage.length;
    const before = customMessage.substring(0, start);
    const after = customMessage.substring(end);
    const updated = `${before}${placeholderTag}${after}`;
    setCustomMessage(updated);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + placeholderTag.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 10);
    onToast?.(`Tag ${placeholderTag} inserida na mensagem`, "info");
  };

  // Save current message as a new named template
  const handleSaveAsNewTemplate = (
    name: string,
    description?: string,
    category: "preventivo" | "vencimento" | "cobranca" | "personalizado" = "personalizado"
  ) => {
    if (!name.trim()) {
      onToast?.("Por favor informe um nome para o novo modelo.", "error");
      return;
    }
    const id = `custom_${Date.now()}`;
    const newTemplate: CustomMessageTemplate = {
      id,
      name: name.trim(),
      template: customMessage,
      isSystem: false,
      category,
      description: description?.trim() || "Modelo personalizado configurado pelos usuários da escola.",
      updatedAt: new Date().toISOString()
    };
    const nextList = [...customTemplates, newTemplate];
    persistTemplates(nextList);
    setSelectedTemplateId(id);
    setIsCreatingNewTemplate(false);
    setNewTemplateName("");
    setNewTemplateDescription("");
    onToast?.(`✨ Novo modelo "${newTemplate.name}" salvo com sucesso!`, "success");
  };

  // Update an existing custom template
  const handleUpdateCurrentTemplate = () => {
    const current = customTemplates.find(t => t.id === selectedTemplateId);
    if (!current) return;
    if (current.isSystem) {
      setIsCreatingNewTemplate(true);
      setNewTemplateName(`${current.name} (Personalizado)`);
      onToast?.("Modelos do sistema são protegidos. Salve uma nova cópia personalizada.", "info");
      return;
    }
    const updatedList = customTemplates.map(t => {
      if (t.id === selectedTemplateId) {
        return {
          ...t,
          template: customMessage,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    persistTemplates(updatedList);
    onToast?.(`Modelo "${current.name}" atualizado com sucesso!`, "success");
  };

  // Delete a custom template
  const handleDeleteCustomTemplate = (id: string) => {
    const target = customTemplates.find(t => t.id === id);
    if (!target) return;
    if (target.isSystem) {
      onToast?.("Modelos originais do sistema não podem ser excluídos.", "error");
      return;
    }
    const filtered = customTemplates.filter(t => t.id !== id);
    persistTemplates(filtered);
    if (selectedTemplateId === id) {
      setSelectedTemplateId("amigavel");
      const fallback = filtered.find(t => t.id === "amigavel") || filtered[0];
      if (fallback) setCustomMessage(fallback.template);
    }
    onToast?.(`Modelo "${target.name}" removido com sucesso.`, "info");
  };

  // Duplicate a template to quickly tweak
  const handleDuplicateTemplate = (sourceTemplate: CustomMessageTemplate) => {
    const newId = `custom_${Date.now()}`;
    const duplicated: CustomMessageTemplate = {
      ...sourceTemplate,
      id: newId,
      name: `${sourceTemplate.name} (Cópia)`,
      isSystem: false,
      category: sourceTemplate.category || "personalizado",
      updatedAt: new Date().toISOString()
    };
    const nextList = [...customTemplates, duplicated];
    persistTemplates(nextList);
    setSelectedTemplateId(newId);
    setCustomMessage(duplicated.template);
    onToast?.(`Cópia criada: "${duplicated.name}"`, "success");
  };

  // Reset all templates to defaults
  const handleResetAllTemplatesToDefault = () => {
    persistTemplates(DEFAULT_SYSTEM_TEMPLATES);
    setSelectedTemplateId("amigavel");
    setCustomMessage(DEFAULT_SYSTEM_TEMPLATES[0].template);
    onToast?.("Todos os modelos foram restaurados para os padrões originais da escola.", "info");
  };

  // Dedicated Template Manager state
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<"todos" | "preventivo" | "vencimento" | "cobranca" | "personalizado">("todos");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState<string>("");
  const [editingTemplateContent, setEditingTemplateContent] = useState<string>("");
  const [editingTemplateCategory, setEditingTemplateCategory] = useState<"preventivo" | "vencimento" | "cobranca" | "personalizado">("personalizado");
  const [editingTemplateDesc, setEditingTemplateDesc] = useState<string>("");

  const handleStartEditTemplate = (tmpl: CustomMessageTemplate) => {
    setEditingTemplateId(tmpl.id);
    setEditingTemplateName(tmpl.name);
    setEditingTemplateContent(tmpl.template);
    setEditingTemplateCategory(tmpl.category || "personalizado");
    setEditingTemplateDesc(tmpl.description || "");
  };

  const handleCancelEditTemplate = () => {
    setEditingTemplateId(null);
    setEditingTemplateName("");
    setEditingTemplateContent("");
    setEditingTemplateDesc("");
  };

  const handleSaveEditedTemplate = () => {
    if (!editingTemplateId) return;
    if (!editingTemplateName.trim()) {
      onToast?.("O nome do modelo é obrigatório.", "error");
      return;
    }
    const updatedList = customTemplates.map(t => {
      if (t.id === editingTemplateId) {
        return {
          ...t,
          name: editingTemplateName.trim(),
          template: editingTemplateContent,
          category: editingTemplateCategory,
          description: editingTemplateDesc.trim(),
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });
    persistTemplates(updatedList);
    if (selectedTemplateId === editingTemplateId) {
      setCustomMessage(editingTemplateContent);
    }
    setEditingTemplateId(null);
    onToast?.(`Modelo "${editingTemplateName.trim()}" atualizado com sucesso!`, "success");
  };

  const handleApplyTemplateToCurrentInvoice = (tmpl: CustomMessageTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setCustomMessage(tmpl.template);
    setActiveViewTab("regua_personalizada");
    onToast?.(`✨ Modelo "${tmpl.name}" aplicado à régua da fatura atual!`, "success");
  };

  // Synchronize raw input when daysBefore changes externally
  useEffect(() => {
    if (!isOpen) return;
    setDaysBeforeRaw(prev => (prev !== String(daysBefore) ? String(daysBefore) : prev));
  }, [isOpen, daysBefore]);

  // Validate and update days before
  const handleDaysChange = (value: string) => {
    setDaysBeforeRaw(value);
    if (value === "") {
      setDaysError("Informe um valor entre 1 e 30 dias");
      return;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      setDaysError("Apenas números inteiros são permitidos");
    } else if (parsed < 1) {
      setDaysError("O prazo mínimo é de 1 dia antes do vencimento");
    } else if (parsed > 30) {
      setDaysError("O prazo máximo é de 30 dias de antecedência");
    } else {
      setDaysError(null);
      setDaysBefore(parsed);
    }
  };

  // Calculate schedule date
  const scheduleInfo = useMemo(() => {
    return calculateDispatchDate(activeInvoice?.dueDate, daysBefore);
  }, [activeInvoice?.dueDate, daysBefore]);

  // Interpolated live preview text with dynamic {{aluno}}, {{valor}}, {{responsavel}}, etc.
  const renderedMessage = useMemo(() => {
    if (!activeInvoice) return "";

    const parentName = activeStudent.parentName || "Responsável Financeiro";
    const studentName = activeStudent.name || "Aluno";
    const invoiceTitle = activeInvoice.title || "Mensalidade Escolar";
    const dueDate = activeInvoice.dueDate || "10/08/2026";
    const docId = activeInvoice.documentId || "FAT-2026-08";
    const amountFormatted = activeInvoice.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    const diasTexto = daysBefore === 1 ? "amanhã (Véspera)" : `daqui a ${daysBefore} dias`;

    const pixBlock = includePixKey
      ? `🔑 *Chave PIX Copia e Cola:*\n\`00020126580014br.gov.bcb.pix0136pix.magic.learning@escola.br5204000053039865802BR5920Magic Learning LTDA6009Sao Paulo62070503***6304E8A2\``
      : "";

    const linkBlock = includeBoletoLink
      ? `🔗 *Link Direto da Fatura & 2ª Via:*\nhttps://app.magiclearning.com.br/fatura/${docId}`
      : "";

    return interpolateWhatsAppTemplate(customMessage, {
      studentName,
      parentName,
      invoiceTitle,
      dueDate,
      amountFormatted,
      docId,
      diasTexto,
      schoolName: "Colégio Magic Learning",
      pixBlock,
      linkBlock
    });
  }, [activeInvoice, activeStudent, daysBefore, customMessage, includePixKey, includeBoletoLink]);

  // Copy preview to clipboard
  const handleCopyMessage = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(renderedMessage);
      setCopiedPreview(true);
      onToast?.("Mensagem copiada para a área de transferência!", "success");
      setTimeout(() => setCopiedPreview(false), 2500);
    }
  };

  // Periodicidade da régua de cobrança ERP
  const [frequency, setFrequency] = useState<ReminderFrequency>(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("erp_auto_reminder_frequency") as ReminderFrequency;
      if (saved && ["diario", "cada_3_dias", "semanal", "preventivo_unico", "regua_escalonada", "diario_pre_vencimento", "pos_vencimento_recorrente"].includes(saved)) {
        return saved;
      }
    }
    return "cada_3_dias";
  });

  // Intervalo de reenvio automático em dias (ex.: 1 para diária, 3 para a cada 3 dias, 7 para semanal)
  const [intervalDays, setIntervalDays] = useState<number>(() => {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem("erp_auto_reminder_interval_days");
      const parsed = saved ? parseInt(saved, 10) : 3;
      return !isNaN(parsed) && parsed >= 1 && parsed <= 30 ? parsed : 3;
    }
    return 3;
  });

  // Helper para alterar a frequência e sincronizar o intervalo padrão
  const handleSelectFrequency = (newFreq: ReminderFrequency) => {
    setFrequency(newFreq);
    const matchedOpt = FREQUENCY_OPTIONS.find(f => f.id === newFreq);
    const newInterval = matchedOpt?.defaultInterval ?? (newFreq === "diario" ? 1 : newFreq === "cada_3_dias" ? 3 : newFreq === "semanal" ? 7 : 3);
    
    if (newInterval > 0) {
      setIntervalDays(newInterval);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("erp_auto_reminder_interval_days", String(newInterval));
      }
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("erp_auto_reminder_frequency", newFreq);
    }
  };

  // Helper para alterar o intervalo em dias manualmente
  const handleIntervalChange = (val: number) => {
    const clamped = Math.max(1, Math.min(30, val));
    setIntervalDays(clamped);
    if (clamped === 1) {
      setFrequency("diario");
    } else if (clamped === 3) {
      setFrequency("cada_3_dias");
    } else if (clamped === 7) {
      setFrequency("semanal");
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("erp_auto_reminder_interval_days", String(clamped));
    }
  };

  // Projeção cronológica das etapas de disparo
  const scheduleSteps = useMemo(() => {
    return computeScheduleSteps(activeInvoice?.dueDate, daysBefore, frequency, intervalDays);
  }, [activeInvoice?.dueDate, daysBefore, frequency, intervalDays]);

  // Delivery status records map per invoice ID (stored in localStorage)
  const [deliveryRecords, setDeliveryRecords] = useState<Record<string, InvoiceDeliveryRecord>>(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("erp_invoice_reminder_delivery_records");
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Failed to parse erp_invoice_reminder_delivery_records:", e);
      }
    }
    return {};
  });

  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Derived current delivery record for active invoice
  const currentDelivery: InvoiceDeliveryRecord = useMemo(() => {
    if (!activeInvoice) {
      return { status: "Agendado", timestamp: `${scheduleInfo.formatted} às ${dispatchTime}h`, retryCount: 0 };
    }
    const existing = deliveryRecords[activeInvoice.id];
    if (existing) {
      return existing;
    }
    if (activeInvoice.status === "pago") {
      return {
        status: "Enviado",
        timestamp: "Compensada e Notificada",
        retryCount: 0
      };
    }
    return {
      status: "Agendado",
      timestamp: `${scheduleInfo.formatted} às ${dispatchTime}h`,
      retryCount: 0
    };
  }, [activeInvoice, deliveryRecords, scheduleInfo.formatted, dispatchTime]);

  // Set/update delivery status helper with persistence
  const handleSetDeliveryStatus = (newStatus: ReminderDeliveryStatus, customError?: string) => {
    if (!activeInvoice) return;
    const nowTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const updatedRecord: InvoiceDeliveryRecord = {
      status: newStatus,
      timestamp: newStatus === "Agendado"
        ? `${scheduleInfo.formatted} às ${dispatchTime}h`
        : newStatus === "Enviado"
        ? `Transmitido hoje às ${nowTime}`
        : `Tentativa falhou às ${nowTime}`,
      errorMessage: newStatus === "Falha"
        ? (customError || "Falha na entrega da notificação via WhatsApp. Motivo: Interrupção temporária na conexão com o gateway ou destinatário inacessível.")
        : undefined,
      retryCount: currentDelivery.retryCount || 0
    };

    setDeliveryRecords(prev => {
      const next = { ...prev, [activeInvoice.id]: updatedRecord };
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("erp_invoice_reminder_delivery_records", JSON.stringify(next));
      }
      return next;
    });

    onToast?.(
      `Status do lembrete alterado para "${newStatus}" (${activeInvoice.documentId}).`,
      newStatus === "Falha" ? "error" : "info"
    );
  };

  // Handle Manual Retry for failed reminder
  const handleManualRetry = () => {
    if (!activeInvoice) return;
    setIsRetrying(true);

    setTimeout(() => {
      setIsRetrying(false);
      const nowTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const updatedRecord: InvoiceDeliveryRecord = {
        status: "Enviado",
        timestamp: `Reenviado manualmente hoje às ${nowTime}`,
        retryCount: (currentDelivery.retryCount || 0) + 1
      };

      setDeliveryRecords(prev => {
        const next = { ...prev, [activeInvoice.id]: updatedRecord };
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("erp_invoice_reminder_delivery_records", JSON.stringify(next));
        }
        return next;
      });

      setSendSuccess(true);
      onToast?.(
        `✅ Lembrete WhatsApp reenviado com sucesso para ${activeStudent.parentPhone}!`,
        "success"
      );

      try {
        triggerGoldenConfettiForPortaria("btn-manual-retry-reminder");
      } catch (e) {
        console.warn("Confetti trigger warning:", e);
      }

      onSimulateSend?.(activeInvoice, renderedMessage, activeStudent.parentPhone || "");

      setTimeout(() => {
        setSendSuccess(false);
      }, 3500);
    }, 1100);
  };

  // Saved rules map per invoice ID (stored in localStorage)
  const [savedRules, setSavedRules] = useState<Record<string, InvoiceReminderRule>>(() => {
    if (typeof localStorage !== "undefined") {
      try {
        const saved = localStorage.getItem("erp_invoice_reminder_rules");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse erp_invoice_reminder_rules:", e);
      }
    }
    return {};
  });

  // State for quick editing of a specific rule
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [quickEditInterval, setQuickEditInterval] = useState<number>(3);
  const [quickEditMessage, setQuickEditMessage] = useState<string>("");

  // Select and load invoice config into the editor
  const handleSelectActiveInvoice = (newInvoiceId: string) => {
    setActiveInvoiceId(newInvoiceId);
    const rule = savedRules[newInvoiceId];
    if (rule) {
      if (rule.daysBefore) {
        setDaysBefore(rule.daysBefore);
        setDaysBeforeRaw(String(rule.daysBefore));
      }
      if (rule.dispatchTime) setDispatchTime(rule.dispatchTime);
      if (typeof rule.enabled === "boolean") setAutoReminderEnabled(rule.enabled);
      if (rule.frequency) setFrequency(rule.frequency);
      if (rule.intervalDays) setIntervalDays(rule.intervalDays);
      if (rule.customMessage) setCustomMessage(rule.customMessage);
    }
  };

  // Crucial helper: update intervalDays & customMessage WITHOUT removing the rule from localStorage
  const updateRuleWithoutRemoving = (
    invoiceId: string,
    updates: { intervalDays?: number; customMessage?: string; daysBefore?: number; frequency?: ReminderFrequency }
  ) => {
    const targetInvoice = allInvoices.find(c => c.id === invoiceId) || activeInvoice;
    const dueDate = targetInvoice?.dueDate || "10/08/2026";

    setSavedRules(prev => {
      const existing = prev[invoiceId] || {
        invoiceId,
        daysBefore: daysBefore ?? 5,
        dispatchTime: dispatchTime ?? "09:00",
        frequency: frequency ?? "cada_3_dias",
        intervalDays: intervalDays ?? 3,
        customMessage: customMessage || MESSAGE_TEMPLATES.amigavel.template,
        enabled: true,
        scheduledDate: calculateDispatchDate(dueDate, updates.daysBefore ?? daysBefore ?? 5).formatted,
        updatedAt: new Date().toISOString()
      };

      const updatedInterval = updates.intervalDays ?? existing.intervalDays;
      const updatedFreq = updates.frequency ?? (updatedInterval === 1 ? "diario" : updatedInterval === 3 ? "cada_3_dias" : updatedInterval === 7 ? "semanal" : existing.frequency);

      const updatedRule: InvoiceReminderRule = {
        ...existing,
        ...updates,
        intervalDays: updatedInterval,
        frequency: updatedFreq,
        customMessage: updates.customMessage ?? existing.customMessage,
        updatedAt: new Date().toISOString()
      };

      const next = { ...prev, [invoiceId]: updatedRule };
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("erp_invoice_reminder_rules", JSON.stringify(next));
      }
      return next;
    });

    // If currently focused on this invoice, sync modal inputs seamlessly
    if (activeInvoiceId === invoiceId) {
      if (typeof updates.intervalDays === "number") {
        setIntervalDays(updates.intervalDays);
      }
      if (typeof updates.customMessage === "string") {
        setCustomMessage(updates.customMessage);
      }
      if (updates.daysBefore) {
        setDaysBefore(updates.daysBefore);
      }
      if (updates.frequency) {
        setFrequency(updates.frequency);
      }
    }

    const effectiveInterval = updates.intervalDays ?? (savedRules[invoiceId]?.intervalDays ?? intervalDays);
    onToast?.(
      `✅ Regra atualizada com sucesso! Intervalo de ${effectiveInterval} dias e mensagem personalizada preservados.`,
      "success"
    );
  };

  const handleStartQuickEdit = (invId: string, currentInterval: number, currentMsg: string) => {
    setEditingRuleId(invId);
    setQuickEditInterval(currentInterval);
    setQuickEditMessage(currentMsg);
  };

  const handleSaveQuickEdit = (invId: string) => {
    updateRuleWithoutRemoving(invId, {
      intervalDays: quickEditInterval,
      customMessage: quickEditMessage
    });
    setEditingRuleId(null);
  };

  const handleCancelQuickEdit = () => {
    setEditingRuleId(null);
  };

  const handleQuickAdjustInterval = (invId: string, delta: number) => {
    const current = savedRules[invId]?.intervalDays ?? (invId === activeInvoiceId ? intervalDays : 3);
    const nextInterval = Math.max(1, Math.min(30, current + delta));
    updateRuleWithoutRemoving(invId, { intervalDays: nextInterval });
  };

  // Structured rules list for all displayed invoices
  const reminderRulesList = useMemo(() => {
    return displayedInvoices.map(inv => {
      const saved = savedRules[inv.id];
      const targetStudent = students.find(s => 
        inv.title.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]) ||
        inv.tags?.some(t => s.name.toLowerCase().includes(t.toLowerCase()))
      ) || students[0] || { name: "Aluno", parentPhone: "" };

      const ruleDays = saved?.daysBefore ?? (inv.id === activeInvoiceId ? daysBefore : 5);
      const ruleInterval = saved?.intervalDays ?? (inv.id === activeInvoiceId ? intervalDays : 3);
      const ruleFreq = saved?.frequency ?? (inv.id === activeInvoiceId ? frequency : "cada_3_dias");
      const ruleMsg = saved?.customMessage ?? (inv.id === activeInvoiceId ? customMessage : MESSAGE_TEMPLATES.amigavel.template);
      const ruleTime = saved?.dispatchTime ?? (inv.id === activeInvoiceId ? dispatchTime : "09:00");
      const ruleEnabled = saved?.enabled ?? true;
      const ruleSchedule = saved?.scheduledDate || calculateDispatchDate(inv.dueDate, ruleDays).formatted;
      const delivery = deliveryRecords[inv.id] || { status: (inv.status === "pago" ? "Enviado" : "Agendado") as ReminderDeliveryStatus };

      return {
        invoice: inv,
        student: targetStudent,
        daysBefore: ruleDays,
        intervalDays: ruleInterval,
        frequency: ruleFreq,
        customMessage: ruleMsg,
        dispatchTime: ruleTime,
        enabled: ruleEnabled,
        scheduledDate: ruleSchedule,
        deliveryStatus: delivery.status,
        isExplicitlySaved: Boolean(saved),
        updatedAt: saved?.updatedAt
      };
    });
  }, [displayedInvoices, savedRules, activeInvoiceId, daysBefore, intervalDays, frequency, customMessage, dispatchTime, students, deliveryRecords]);

  // Reset to School Defaults handler
  const handleResetDefaults = () => {
    setDaysBefore(5);
    setDaysBeforeRaw("5");
    setDaysError(null);
    setDispatchTime("09:00");
    setAutoReminderEnabled(true);
    setFrequency("cada_3_dias");
    setIntervalDays(3);
    setSelectedTemplateKey("amigavel");
    setCustomMessage(MESSAGE_TEMPLATES.amigavel.template);
    setIncludePixKey(true);
    setIncludeBoletoLink(true);

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("erp_auto_reminder_frequency", "cada_3_dias");
      localStorage.setItem("erp_auto_reminder_interval_days", "3");
      localStorage.setItem("erp_auto_reminder_days_before", "5");
      localStorage.setItem("erp_auto_reminder_time", "09:00");
      localStorage.setItem("erp_auto_reminder_5d_enabled", "true");
    }

    if (activeInvoice && typeof localStorage !== "undefined") {
      const existingRulesStr = localStorage.getItem("erp_invoice_reminder_rules");
      if (existingRulesStr) {
        try {
          const existingRules = JSON.parse(existingRulesStr);
          delete existingRules[activeInvoice.id];
          localStorage.setItem("erp_invoice_reminder_rules", JSON.stringify(existingRules));
          setSavedRules(existingRules);
        } catch (e) {}
      }
    }

    onToast?.("Configurações redefinidas para o padrão da escola (5 dias antes, 09:00h, a cada 3 dias, tom amigável).", "info");
  };

  // Save rule handler
  const handleSaveRule = () => {
    if (daysError || !activeInvoice) return;

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("erp_auto_reminder_days_before", String(daysBefore));
      localStorage.setItem("erp_auto_reminder_time", dispatchTime);
      localStorage.setItem("erp_auto_reminder_5d_enabled", String(autoReminderEnabled));
      localStorage.setItem("erp_auto_reminder_frequency", frequency);
      localStorage.setItem("erp_auto_reminder_interval_days", String(intervalDays));
      
      // Save specific rule for this invoice
      const existingRulesStr = localStorage.getItem("erp_invoice_reminder_rules");
      const existingRules = existingRulesStr ? JSON.parse(existingRulesStr) : {};
      existingRules[activeInvoice.id] = {
        invoiceId: activeInvoice.id,
        daysBefore,
        dispatchTime,
        frequency,
        intervalDays,
        customMessage,
        enabled: autoReminderEnabled,
        scheduledDate: scheduleInfo.formatted,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem("erp_invoice_reminder_rules", JSON.stringify(existingRules));
      setSavedRules(existingRules);
    }

    onSaveRule?.(activeInvoice.id, daysBefore, dispatchTime, customMessage, frequency, intervalDays);
    const freqLabel = FREQUENCY_OPTIONS.find(f => f.id === frequency)?.label || "Régua Personalizada";
    const intervalDesc = intervalDays > 0 ? `a cada ${intervalDays} dias` : "disparo único";
    onToast?.(
      `✨ Régua de cobrança configurada: ${daysBefore} dias antes (${freqLabel}, ${intervalDesc}) às ${dispatchTime}h`,
      "success"
    );

    // Efeito de confete dourado sutil após a configuração do lembrete de 5 dias ser salva com sucesso
    try {
      triggerGoldenConfettiForPortaria("btn-save-invoice-reminder-rule");
    } catch (e) {
      console.warn("Confetti trigger warning:", e);
    }

    onClose();
  };

  // Simulate immediate WhatsApp dispatch
  const handleSimulateDispatch = () => {
    if (!activeInvoice) return;
    setIsSendingSimulated(true);

    setTimeout(() => {
      setIsSendingSimulated(false);
      setSendSuccess(true);

      const nowTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      const updatedRecord: InvoiceDeliveryRecord = {
        status: "Enviado",
        timestamp: `Transmitido hoje às ${nowTime}`,
        retryCount: (currentDelivery.retryCount || 0) + 1
      };

      setDeliveryRecords(prev => {
        const next = { ...prev, [activeInvoice.id]: updatedRecord };
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("erp_invoice_reminder_delivery_records", JSON.stringify(next));
        }
        return next;
      });

      onToast?.(
        `📱 WhatsApp de lembrete transmitido com sucesso para ${activeStudent.parentPhone}!`,
        "success"
      );
      onSimulateSend?.(activeInvoice, renderedMessage, activeStudent.parentPhone || "");

      setTimeout(() => {
        setSendSuccess(false);
      }, 3500);
    }, 1200);
  };

  // Batch apply 5-day pre-due rule to all upcoming/pending invoices
  const handleApply5dToAllUpcoming = () => {
    if (typeof localStorage !== "undefined") {
      const existingRulesStr = localStorage.getItem("erp_invoice_reminder_rules");
      const existingRules = existingRulesStr ? JSON.parse(existingRulesStr) : {};

      upcomingInvoices.forEach(inv => {
        existingRules[inv.id] = {
          invoiceId: inv.id,
          daysBefore: 5,
          dispatchTime,
          frequency,
          intervalDays,
          enabled: true,
          scheduledDate: calculateDispatchDate(inv.dueDate, 5).formatted,
          updatedAt: new Date().toISOString()
        };
      });

      localStorage.setItem("erp_invoice_reminder_rules", JSON.stringify(existingRules));
      setSavedRules(existingRules);
      localStorage.setItem("erp_auto_reminder_days_before", "5");
      localStorage.setItem("erp_auto_reminder_time", dispatchTime);
      localStorage.setItem("erp_auto_reminder_5d_enabled", "true");
      localStorage.setItem("erp_auto_reminder_frequency", frequency);
      localStorage.setItem("erp_auto_reminder_interval_days", String(intervalDays));
    }

    setDaysBefore(5);
    setDaysBeforeRaw("5");
    setAutoReminderEnabled(true);

    // Efeito de confete dourado sutil após a configuração da regra de 5 dias ser salva para todas as faturas
    try {
      triggerGoldenConfettiForPortaria("btn-apply-5d-all-upcoming");
    } catch (e) {
      console.warn("Confetti trigger warning:", e);
    }

    onToast?.(
      `⚡ Regra de 5 dias pré-vencimento aplicada com sucesso a todas as ${upcomingInvoices.length} faturas a vencer!`,
      "success"
    );
  };

  // Direct WhatsApp URL
  const whatsappUrl = useMemo(() => {
    const rawPhone = (activeStudent.parentPhone || "11987654321").replace(/\D/g, "");
    const fullPhone = rawPhone.startsWith("55") ? rawPhone : `55${rawPhone}`;
    return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(renderedMessage)}`;
  }, [activeStudent.parentPhone, renderedMessage]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            id="invoice-whatsapp-reminder-modal-content"
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
          >
          {/* ========================================================================= */}
          {/* MODAL HEADER                                                              */}
          {/* ========================================================================= */}
          <div className="px-5 py-4 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-transparent border-b border-amber-200/60 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 border border-amber-500/40 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0">
                <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif">
                    Alertas Automáticos de Faturas (WhatsApp ERP)
                  </h3>
                  <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-2xs">
                    Régua de 1 a 30 Dias de Vencimento
                  </span>
                  {activeInvoice && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300">
                      {activeInvoice.documentId}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Defina lembretes automáticos de WhatsApp para faturas com vencimento em até 30 dias com prévia em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-reset-reminder-defaults-header"
                onClick={handleResetDefaults}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                title="Restaurar configurações padrão da escola (5 dias antes, 09:00h)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrões</span>
              </button>

              <button
                type="button"
                id="btn-close-invoice-reminder-modal"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Fechar (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SUB-HEADER TABS: Régua Personalizada (1 a 30 dias) vs. Componente ERP    */}
          {/* ========================================================================= */}
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border-b border-amber-200/60 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-amber-100/60 dark:bg-slate-800/80 rounded-xl border border-amber-200/60 dark:border-slate-700">
              <button
                type="button"
                id="tab-invoice-reminder-custom"
                onClick={() => setActiveViewTab("regua_personalizada")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewTab === "regua_personalizada"
                    ? "bg-amber-500 text-slate-950 shadow-2xs font-black"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Régua Personalizada (1 a 30 dias)</span>
              </button>
              <button
                type="button"
                id="tab-invoice-reminder-templates"
                onClick={() => setActiveViewTab("modelos_personalizados")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewTab === "modelos_personalizados"
                    ? "bg-amber-500 text-slate-950 shadow-2xs font-black"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Modelos de Mensagem</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-mono font-bold">
                  {customTemplates.length}
                </span>
              </button>
              <button
                type="button"
                id="tab-invoice-reminder-erp-config"
                onClick={() => setActiveViewTab("componente_erp")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeViewTab === "componente_erp"
                    ? "bg-amber-500 text-slate-950 shadow-2xs font-black"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Componente Oficial da Régua ERP</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="bg-amber-100/70 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-300/60 dark:border-amber-800 font-bold">
                {activeViewTab === "regua_personalizada"
                  ? `Janela: ${daysBefore}d antes`
                  : activeViewTab === "modelos_personalizados"
                  ? `${customTemplates.length} Modelos Configurados`
                  : "Módulo ERP Ativo"}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MODAL BODY (Two-column layout or ERP Alert Config Component)             */}
          {/* ========================================================================= */}
          {activeViewTab === "componente_erp" ? (
            <div className="flex-1 overflow-y-auto p-5">
              <ErpWhatsAppInvoiceAlertConfig
                erpName="asaas"
                estudantes={students}
                onToast={onToast || (() => {})}
              />
            </div>
          ) : activeViewTab === "modelos_personalizados" ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Header Editorial Banner for Templates */}
              <div className="p-4 bg-[#fcfaf2] dark:bg-slate-900/90 rounded-xl border border-amber-200/70 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 font-mono flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-600" />
                      Modelos de Mensagem WhatsApp da Escola
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 font-mono">
                      {customTemplates.length} Modelos Disponíveis
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl">
                    Configure os textos padrão utilizados nas mensagens automáticas de WhatsApp da régua de cobrança. Placeholders dinâmicos como <code className="font-mono text-amber-900 dark:text-amber-300 font-bold bg-amber-100/60 dark:bg-slate-800 px-1 py-0.5 rounded">{"{{aluno}}"}</code> e <code className="font-mono text-amber-900 dark:text-amber-300 font-bold bg-amber-100/60 dark:bg-slate-800 px-1 py-0.5 rounded">{"{{valor}}"}</code> são substituídos instantaneamente pelos dados reais de cada mensalidade.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    id="btn-create-new-template-page"
                    onClick={() => {
                      setIsCreatingNewTemplate(true);
                      setEditingTemplateId(null);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Criar Novo Modelo</span>
                  </button>

                  <button
                    type="button"
                    id="btn-reset-templates-page"
                    onClick={handleResetAllTemplatesToDefault}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Restaurar os 3 modelos de fábrica da escola"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Restaurar Originais</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Placeholders Guide / Cheatsheet */}
              <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    Tabela de Placeholders Dinâmicos Disponíveis
                  </span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Clique em qualquer tag para copiar ou inserir no modelo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {DYNAMIC_PLACEHOLDERS.map((ph) => {
                    const isCore = ph.tag === "{{aluno}}" || ph.tag === "{{valor}}";
                    return (
                      <button
                        key={ph.tag}
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(ph.tag);
                            onToast?.(`Tag ${ph.tag} copiada para a área de transferência!`, "info");
                          }
                        }}
                        className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                          isCore
                            ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 hover:border-amber-500"
                            : "bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                        }`}
                        title={`Clique para copiar a tag ${ph.tag}`}
                      >
                        <div className="flex items-center justify-between">
                          <code className="text-xs font-mono font-bold text-amber-900 dark:text-amber-300">
                            {ph.tag}
                          </code>
                          <Copy className="w-3 h-3 text-slate-400 opacity-60" />
                        </div>
                        <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {ph.label}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Ex: {ph.example}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form to Create New Template */}
              {isCreatingNewTemplate && (
                <div className="p-5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-amber-600" />
                        Criar Novo Modelo de Mensagem da Escola
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        O novo modelo ficará salvo e poderá ser selecionado em qualquer fatura ou régua.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewTemplate(false)}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                        Nome do Modelo:
                      </label>
                      <input
                        type="text"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="Ex.: Lembrete Especial com Desconto Pontualidade"
                        className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                        Categoria da Régua:
                      </label>
                      <select
                        value={newTemplateCategory}
                        onChange={(e) => setNewTemplateCategory(e.target.value as any)}
                        className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-medium"
                      >
                        <option value="preventivo">Preventivo (5 a 10 dias antes)</option>
                        <option value="vencimento">Vencimento (Dia ou Véspera)</option>
                        <option value="cobranca">Cobrança (Pós-Vencimento)</option>
                        <option value="personalizado">Personalizado da Escola</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                        Descrição Breve (Opcional):
                      </label>
                      <input
                        type="text"
                        value={newTemplateDescription}
                        onChange={(e) => setNewTemplateDescription(e.target.value)}
                        placeholder="Ex.: Texto suave com incentivo ao desconto até o dia 10"
                        className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Template text area with placeholders insertion buttons */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        Texto do Modelo (Insira placeholders dinâmicos):
                      </label>
                      <div className="flex items-center gap-1 flex-wrap">
                        {DYNAMIC_PLACEHOLDERS.slice(0, 6).map(ph => (
                          <button
                            key={ph.tag}
                            type="button"
                            onClick={() => setNewTemplateDescription(prev => prev)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const area = document.getElementById("textarea-create-new-template") as HTMLTextAreaElement | null;
                              if (area) {
                                const start = area.selectionStart ?? customMessage.length;
                                const end = area.selectionEnd ?? customMessage.length;
                                const val = area.value;
                                area.value = val.substring(0, start) + ph.tag + val.substring(end);
                                setCustomMessage(area.value);
                                setTimeout(() => {
                                  area.focus();
                                  area.setSelectionRange(start + ph.tag.length, start + ph.tag.length);
                                }, 10);
                              } else {
                                setCustomMessage(prev => prev + " " + ph.tag);
                              }
                            }}
                            className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-white dark:bg-slate-900 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                          >
                            +{ph.tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      id="textarea-create-new-template"
                      rows={5}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-mono text-[11px] leading-relaxed"
                      placeholder="Olá, *{{responsavel}}*! Passando para lembrar da mensalidade do(a) aluno(a) *{{aluno}}*..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewTemplate(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      id="btn-submit-save-new-template"
                      onClick={() => handleSaveAsNewTemplate(newTemplateName, newTemplateDescription, newTemplateCategory)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Salvar e Cadastrar Modelo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Form to Edit Existing Template */}
              {editingTemplateId && (
                <div className="p-5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-amber-600" />
                        Editar Modelo de Mensagem
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Altere o conteúdo e placeholders deste modelo diretamente na escola.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelEditTemplate}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                        Nome do Modelo:
                      </label>
                      <input
                        type="text"
                        value={editingTemplateName}
                        onChange={(e) => setEditingTemplateName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                        Categoria da Régua:
                      </label>
                      <select
                        value={editingTemplateCategory}
                        onChange={(e) => setEditingTemplateCategory(e.target.value as any)}
                        className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-medium"
                      >
                        <option value="preventivo">Preventivo (Pré-Vencimento)</option>
                        <option value="vencimento">Vencimento (Dia ou Véspera)</option>
                        <option value="cobranca">Cobrança (Pós-Vencimento)</option>
                        <option value="personalizado">Personalizado da Escola</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300 block mb-1">
                        Descrição:
                      </label>
                      <input
                        type="text"
                        value={editingTemplateDesc}
                        onChange={(e) => setEditingTemplateDesc(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-[11px] font-bold uppercase text-slate-700 dark:text-slate-300">
                        Conteúdo do Modelo:
                      </label>
                      <div className="flex items-center gap-1 flex-wrap">
                        {DYNAMIC_PLACEHOLDERS.slice(0, 6).map(ph => (
                          <button
                            key={ph.tag}
                            type="button"
                            onClick={() => setEditingTemplateContent(prev => prev + " " + ph.tag)}
                            className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-white dark:bg-slate-900 hover:bg-amber-100 text-amber-900 dark:text-amber-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                          >
                            +{ph.tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={5}
                      value={editingTemplateContent}
                      onChange={(e) => setEditingTemplateContent(e.target.value)}
                      className="w-full text-xs p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 font-mono text-[11px] leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelEditTemplate}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedTemplate}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Salvar Alterações no Modelo</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Filtrar:
                </span>
                {[
                  { id: "todos", label: "Todos os Modelos" },
                  { id: "preventivo", label: "Preventivos (Pré-Vencimento)" },
                  { id: "vencimento", label: "No Vencimento / Véspera" },
                  { id: "cobranca", label: "Cobrança / Atraso" },
                  { id: "personalizado", label: "Personalizados da Escola" }
                ].map((cat) => {
                  const isSelected = templateCategoryFilter === cat.id;
                  const count = cat.id === "todos"
                    ? customTemplates.length
                    : customTemplates.filter(t => t.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTemplateCategoryFilter(cat.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-mono">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Templates List */}
              <div className="space-y-4">
                {customTemplates
                  .filter(t => templateCategoryFilter === "todos" || t.category === templateCategoryFilter)
                  .map((tmpl) => {
                    const isCurrentActive = selectedTemplateId === tmpl.id;
                    const previewResolved = interpolateWhatsAppTemplate(tmpl.template, {
                      studentName: activeStudent.name || "Lucas Silva",
                      parentName: activeStudent.parentName || "Roberto Silva",
                      invoiceTitle: activeInvoice?.title || "Mensalidade Escolar",
                      dueDate: activeInvoice?.dueDate || "10/08/2026",
                      amountFormatted: activeInvoice?.amount ? activeInvoice.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "1.250,00",
                      docId: activeInvoice?.documentId || "FAT-2026-08",
                      diasTexto: `${daysBefore} dias`,
                      schoolName: "Colégio Magic Learning",
                      pixBlock: "🔑 *Chave PIX Copia e Cola:*\n`00020126580014br.gov.bcb.pix0136pix.magic.learning@escola.br5204000053039865802BR`",
                      linkBlock: "🔗 *Link Direto da Fatura & 2ª Via:*\nhttps://app.magiclearning.com.br/fatura/FAT-2026-08"
                    });

                    return (
                      <div
                        key={tmpl.id}
                        id={`template-card-${tmpl.id}`}
                        className={`p-4 rounded-xl border transition-all ${
                          isCurrentActive
                            ? "bg-amber-500/5 dark:bg-amber-950/20 border-amber-400 dark:border-amber-700 shadow-2xs"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          {/* Left: Template Info & Raw Text */}
                          <div className="space-y-2.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                                {tmpl.name}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                                  tmpl.isSystem
                                    ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                    : "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200"
                                }`}
                              >
                                {tmpl.isSystem ? "Padrão da Escola" : "Personalizado"}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase font-mono">
                                • {tmpl.category || "Geral"}
                              </span>
                              {isCurrentActive && (
                                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black font-mono">
                                  Ativo na Fatura Atual
                                </span>
                              )}
                            </div>

                            {tmpl.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {tmpl.description}
                              </p>
                            )}

                            {/* Raw template text with tag highlights */}
                            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                              {tmpl.template}
                            </div>
                          </div>

                          {/* Right: Live Resolved WhatsApp Simulation & Action Buttons */}
                          <div className="w-full lg:w-[380px] shrink-0 space-y-2">
                            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                Simulação com dados reais (WhatsApp):
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                Lucas Silva • R$ 1.250,00
                              </span>
                            </div>

                            <div className="p-3 bg-[#e7ffdb]/60 dark:bg-[#005c4b]/30 rounded-xl border border-emerald-300/60 dark:border-emerald-800/60 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-2xs font-sans">
                              {previewResolved}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-1 flex-wrap justify-end">
                              <button
                                type="button"
                                id={`btn-apply-template-${tmpl.id}`}
                                onClick={() => handleApplyTemplateToCurrentInvoice(tmpl)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                                title="Aplicar este modelo à régua da fatura atual"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Usar na Régua Desta Fatura</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicateTemplate(tmpl)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Duplicar modelo para criar uma variação"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Duplicar</span>
                              </button>

                              {!tmpl.isSystem && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditTemplate(tmpl)}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Editar nome ou texto do modelo"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Editar</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomTemplate(tmpl.id)}
                                    className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Excluir este modelo personalizado"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Excluir</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 1. Scoped Invoice Summary Card & Switcher */}
            <div className="p-4 bg-[#fcfaf2] dark:bg-slate-900/90 rounded-xl border border-amber-200/70 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400 font-mono">
                    Fatura Selecionada:
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      activeInvoice?.status === "pago"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : activeInvoice?.status === "vencido"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    }`}
                  >
                    {activeInvoice?.status || "Pendente"}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 flex-wrap">
                  <strong className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                    {activeInvoice?.title || "Fatura Escolar"}
                  </strong>
                  <span className="text-sm font-black font-mono text-amber-900 dark:text-amber-300">
                    R$ {activeInvoice?.amount ? activeInvoice.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "0,00"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap pt-0.5">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Vencimento: <strong className="text-slate-900 dark:text-slate-200">{activeInvoice?.dueDate || "10/08/2026"}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    Aluno: <strong className="text-slate-900 dark:text-slate-200">{activeStudent.name}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    {activeStudent.parentName} ({activeStudent.parentPhone})
                  </span>
                </div>
              </div>

              {/* Invoice Switcher dropdown & filter */}
              {allInvoices.length > 1 && (
                <div className="shrink-0 min-w-[220px] space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Faturas ({displayedInvoices.length}):
                    </label>
                    <div className="flex items-center gap-1 bg-amber-100/60 dark:bg-slate-800 p-0.5 rounded-md border border-amber-300/60 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setInvoiceFilter("upcoming")}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                          invoiceFilter === "upcoming"
                            ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        A Vencer ({upcomingInvoices.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setInvoiceFilter("all")}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                          invoiceFilter === "all"
                            ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        }`}
                      >
                        Todas
                      </button>
                    </div>
                  </div>
                  <select
                    value={activeInvoiceId}
                    onChange={(e) => handleSelectActiveInvoice(e.target.value)}
                    className="w-full text-xs p-2 bg-white dark:bg-slate-950 border border-amber-300/80 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-medium focus:ring-1 focus:ring-amber-500"
                  >
                    {displayedInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.status === "pendente" ? "⚡ [A Vencer] " : ""}{inv.title} — R$ {inv.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({inv.dueDate})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* INDICADOR VISUAL DE STATUS DE ENVIO DO LEMBRETE ESPECÍFICO               */}
            {/* ========================================================================= */}
            <div
              id="indicator-reminder-delivery-status"
              className={`p-4 rounded-xl border transition-all ${
                currentDelivery.status === "Agendado"
                  ? "bg-amber-500/10 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80"
                  : currentDelivery.status === "Enviado"
                  ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80"
                  : "bg-rose-500/10 dark:bg-rose-950/25 border-rose-300 dark:border-rose-800/80"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Status Header & Icon */}
                <div className="flex items-start md:items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      currentDelivery.status === "Agendado"
                        ? "bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                        : currentDelivery.status === "Enviado"
                        ? "bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                        : "bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 animate-pulse"
                    }`}
                  >
                    {currentDelivery.status === "Agendado" && <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                    {currentDelivery.status === "Enviado" && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                    {currentDelivery.status === "Falha" && <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Status de Envio ({activeInvoice?.documentId || "Fatura"}):
                      </span>

                      {/* Visual Status Badge */}
                      <span
                        id="badge-reminder-delivery-status"
                        className={`text-xs font-black px-2.5 py-0.5 rounded-md border font-mono tracking-wide flex items-center gap-1.5 ${
                          currentDelivery.status === "Agendado"
                            ? "bg-amber-200/80 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200 border-amber-400/80"
                            : currentDelivery.status === "Enviado"
                            ? "bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-950 dark:text-emerald-200 border-emerald-400/80"
                            : "bg-rose-200/90 dark:bg-rose-900/90 text-rose-950 dark:text-rose-200 border-rose-400/80"
                        }`}
                      >
                        {currentDelivery.status === "Agendado" && <Clock className="w-3.5 h-3.5" />}
                        {currentDelivery.status === "Enviado" && <CheckCheck className="w-3.5 h-3.5" />}
                        {currentDelivery.status === "Falha" && <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{currentDelivery.status}</span>
                      </span>

                      {currentDelivery.retryCount && currentDelivery.retryCount > 0 ? (
                        <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/70 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {currentDelivery.retryCount} {currentDelivery.retryCount === 1 ? "retry efetuado" : "retries efetuados"}
                        </span>
                      ) : null}
                    </div>

                    {/* Contextual Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {currentDelivery.status === "Agendado" && (
                        <>
                          Disparo programado para <strong>{currentDelivery.timestamp || `${scheduleInfo.formatted} às ${dispatchTime}h`}</strong> ({daysBefore}d antes do vencimento em {activeInvoice?.dueDate}).
                        </>
                      )}
                      {currentDelivery.status === "Enviado" && (
                        <>
                          Lembrete entregue com sucesso via WhatsApp ({currentDelivery.timestamp || "Transmitido"}). Destinatário: <strong>{activeStudent.parentPhone}</strong>.
                        </>
                      )}
                      {currentDelivery.status === "Falha" && (
                        <span className="text-rose-700 dark:text-rose-300 font-medium">
                          {currentDelivery.errorMessage || "Falha na entrega da notificação via WhatsApp. Motivo: Interrupção temporária na conexão com o gateway ou destinatário inacessível."}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions: Retry Manual Button and Test Selector */}
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Retry Manual Button in Case of Error / Falha */}
                  {currentDelivery.status === "Falha" && (
                    <button
                      type="button"
                      id="btn-manual-retry-reminder"
                      onClick={handleManualRetry}
                      disabled={isRetrying}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      title="Executar retry manual imediato do envio do lembrete via WhatsApp"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                      <span>{isRetrying ? "Reenviando WhatsApp..." : "Tentar Novamente (Retry Manual)"}</span>
                    </button>
                  )}

                  {/* Operational status toggle to test all 3 states */}
                  <div className="flex items-center gap-1 bg-white/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 text-[10px]">
                    <span className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1 font-mono">
                      Simular:
                    </span>
                    <button
                      type="button"
                      id="btn-status-toggle-agendado"
                      onClick={() => handleSetDeliveryStatus("Agendado")}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        currentDelivery.status === "Agendado"
                          ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Agendado
                    </button>
                    <button
                      type="button"
                      id="btn-status-toggle-enviado"
                      onClick={() => handleSetDeliveryStatus("Enviado")}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        currentDelivery.status === "Enviado"
                          ? "bg-emerald-600 text-white font-black shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      Enviado
                    </button>
                    <button
                      type="button"
                      id="btn-status-toggle-falha"
                      onClick={() => handleSetDeliveryStatus("Falha", "Falha de transmissão: Conexão interrompida com o gateway WhatsApp ou número temporariamente inacessível (Timeout 504).")}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        currentDelivery.status === "Falha"
                          ? "bg-rose-600 text-white font-black shadow-2xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      }`}
                    >
                      Falha
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* LISTA DE REGRAS DE LEMBRETE DE COBRANÇA (COM BOTÕES DE EDIÇÃO RÁPIDA)      */}
            {/* ========================================================================= */}
            <div
              id="section-invoice-reminder-rules-list"
              className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-amber-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Regras de Lembretes de Cobrança da Régua ({reminderRulesList.length})
                    </h4>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-300/60 dark:border-amber-800">
                      Régua Ativa ERP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Ajuste o intervalo de dias e a mensagem personalizada de cada regra de cobrança de forma rápida, sem remover a regra existente.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {reminderRulesList.filter(r => r.deliveryStatus === "Enviado").length} enviadas • {reminderRulesList.filter(r => r.deliveryStatus === "Agendado").length} agendadas
                  </span>
                </div>
              </div>

              {/* List of Rules */}
              <div className="space-y-2.5">
                {reminderRulesList.map((item) => {
                  const isSelected = item.invoice.id === activeInvoiceId;
                  const isEditingThisRule = editingRuleId === item.invoice.id;

                  return (
                    <div
                      key={item.invoice.id}
                      id={`rule-item-${item.invoice.id}`}
                      className={`p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-amber-500/5 dark:bg-amber-950/30 border-amber-400 dark:border-amber-700/80 shadow-2xs"
                          : "bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Left: Invoice & Rule Meta */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-serif truncate">
                              {item.invoice.title}
                            </span>
                            <span className="text-xs font-black font-mono text-amber-900 dark:text-amber-300">
                              R$ {item.invoice.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                            <span
                              className={`text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded font-mono ${
                                item.deliveryStatus === "Enviado"
                                  ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                                  : item.deliveryStatus === "Falha"
                                  ? "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300"
                                  : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                              }`}
                            >
                              {item.deliveryStatus}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black font-mono">
                                Ativa no Editor
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                            <span>
                              Aluno: <strong className="text-slate-800 dark:text-slate-200">{item.student.name}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Vencimento: <strong className="text-slate-800 dark:text-slate-200">{item.invoice.dueDate}</strong>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono text-amber-800 dark:text-amber-300 font-semibold">
                              <Calendar className="w-3 h-3 text-amber-600" />
                              Antecedência: {item.daysBefore}d antes ({item.scheduledDate})
                            </span>
                          </div>

                          {/* Interval Badge with Stepper & Message Preview */}
                          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                            {/* Interval display with quick step adjustment */}
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-mono">
                              <Repeat className="w-3 h-3 text-amber-600" />
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                Intervalo: {item.intervalDays} {item.intervalDays === 1 ? "dia" : "dias"}
                              </span>
                              {/* Quick step buttons beside the interval */}
                              <div className="flex items-center ml-1 border-l border-slate-200 dark:border-slate-700 pl-1 gap-0.5">
                                <button
                                  type="button"
                                  id={`btn-interval-dec-${item.invoice.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAdjustInterval(item.invoice.id, -1);
                                  }}
                                  disabled={item.intervalDays <= 1}
                                  className="w-4 h-4 rounded text-[10px] font-black flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                                  title="Diminuir intervalo sem remover a regra"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  id={`btn-interval-inc-${item.invoice.id}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAdjustInterval(item.invoice.id, 1);
                                  }}
                                  disabled={item.intervalDays >= 30}
                                  className="w-4 h-4 rounded text-[10px] font-black flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
                                  title="Aumentar intervalo sem remover a regra"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Message Preview Pill */}
                            <div
                              className="max-w-[340px] truncate text-[10.5px] text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-800/70 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                              title={item.customMessage}
                            >
                              <span className="font-semibold text-slate-600 dark:text-slate-300">Mensagem: </span>
                              "{item.customMessage.slice(0, 55)}..."
                            </div>
                          </div>
                        </div>

                        {/* Right: Quick Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          {!isSelected && (
                            <button
                              type="button"
                              id={`btn-select-rule-invoice-${item.invoice.id}`}
                              onClick={() => handleSelectActiveInvoice(item.invoice.id)}
                              className="px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:border-amber-400 transition-colors cursor-pointer"
                              title="Visualizar fatura no simulador de WhatsApp"
                            >
                              Visualizar
                            </button>
                          )}

                          {/* Quick Edit Button beside each rule */}
                          <button
                            type="button"
                            id={`btn-quick-edit-rule-${item.invoice.id}`}
                            onClick={() => {
                              if (isEditingThisRule) {
                                handleCancelQuickEdit();
                              } else {
                                handleStartQuickEdit(item.invoice.id, item.intervalDays, item.customMessage);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                              isEditingThisRule
                                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                                : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                            }`}
                            title="Alterar o intervalo de dias e a mensagem personalizada sem remover esta regra"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isEditingThisRule ? "Fechar Edição" : "Edição Rápida"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Inline Quick Editor Panel */}
                      {isEditingThisRule && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-amber-300/80 dark:border-amber-800/80 space-y-3 bg-amber-50/50 dark:bg-amber-950/30 p-3 rounded-xl"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                              Edição Rápida da Regra: {item.invoice.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Sem remover a regra existente
                            </span>
                          </div>

                          {/* 1. Interval Adjustment */}
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <Repeat className="w-3 h-3 text-amber-600" />
                              Intervalo de Envio Automático da Régua:
                            </label>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setQuickEditInterval(prev => Math.max(1, prev - 1))}
                                  disabled={quickEditInterval <= 1}
                                  className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                                  title="Diminuir intervalo"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  id={`input-quick-interval-${item.invoice.id}`}
                                  min={1}
                                  max={30}
                                  value={quickEditInterval}
                                  onChange={(e) => setQuickEditInterval(Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1)))}
                                  className="w-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1 text-xs font-mono font-black text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => setQuickEditInterval(prev => Math.max(1, Math.min(30, prev + 1)))}
                                  disabled={quickEditInterval >= 30}
                                  className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-xs flex items-center justify-center disabled:opacity-30 cursor-pointer"
                                  title="Aumentar intervalo"
                                >
                                  +
                                </button>
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium ml-1">
                                  {quickEditInterval === 1 ? "dia (Diário)" : `dias (a cada ${quickEditInterval}d)`}
                                </span>
                              </div>

                              {/* Quick Presets */}
                              <div className="flex items-center gap-1 ml-auto">
                                {[
                                  { d: 1, label: "1d (Diária)" },
                                  { d: 3, label: "3d (Padrão)" },
                                  { d: 7, label: "7d (Semanal)" }
                                ].map(p => (
                                  <button
                                    key={p.d}
                                    type="button"
                                    onClick={() => setQuickEditInterval(p.d)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                      quickEditInterval === p.d
                                        ? "bg-amber-500 text-slate-950 border-amber-600 font-black"
                                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* 2. Custom Personalized Message Editing */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between flex-wrap gap-1">
                              <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <FileText className="w-3 h-3 text-amber-600" />
                                Mensagem Personalizada do WhatsApp:
                              </label>

                              {/* Quick template selection */}
                              <div className="flex items-center gap-1 text-[10px] flex-wrap">
                                <span className="text-slate-400">Modelo:</span>
                                {customTemplates.slice(0, 4).map(t => (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setQuickEditMessage(t.template)}
                                    className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[9.5px] font-semibold cursor-pointer"
                                    title={t.name}
                                  >
                                    {t.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Quick insert placeholder chips */}
                            <div className="flex items-center gap-1 flex-wrap text-[10px]">
                              <span className="text-slate-400 text-[10px]">Inserir:</span>
                              {[
                                { tag: "{{aluno}}", label: "Aluno" },
                                { tag: "{{valor}}", label: "Valor" },
                                { tag: "{{responsavel}}", label: "Responsável" },
                                { tag: "{{vencimento}}", label: "Vencimento" },
                                { tag: "{{link}}", label: "Link" }
                              ].map(p => (
                                <button
                                  key={p.tag}
                                  type="button"
                                  onClick={() => setQuickEditMessage(prev => prev + " " + p.tag)}
                                  className="px-1.5 py-0.5 rounded font-mono font-bold bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-300 border border-slate-200 dark:border-slate-700 cursor-pointer text-[9.5px]"
                                  title={`Inserir tag ${p.tag}`}
                                >
                                  +{p.tag}
                                </button>
                              ))}
                            </div>

                            <textarea
                              id={`textarea-quick-message-${item.invoice.id}`}
                              rows={3}
                              value={quickEditMessage}
                              onChange={(e) => setQuickEditMessage(e.target.value)}
                              placeholder="Digite a mensagem com placeholders dinâmicos como {{aluno}} e {{valor}}..."
                              className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-[11px]"
                            />
                          </div>

                          {/* Actions: Salvar Alterações vs. Cancelar */}
                          <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              💡 A regra é atualizada diretamente no ERP sem remover o agendamento prévio.
                            </p>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                id={`btn-cancel-quick-rule-${item.invoice.id}`}
                                onClick={handleCancelQuickEdit}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              >
                                Cancelar
                              </button>

                              <button
                                type="button"
                                id={`btn-save-quick-rule-${item.invoice.id}`}
                                onClick={() => handleSaveQuickEdit(item.invoice.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Salvar Alterações</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* ========================================================================= */}
              {/* LEFT COLUMN: Configuration Parameters (7 cols)                           */}
              {/* ========================================================================= */}
              <div className="lg:col-span-6 space-y-4">
                {/* ⚡ Dedicated 5-Day Pre-Due Rule Management Banner for Upcoming Invoices */}
                <div className="p-3.5 bg-amber-500/10 dark:bg-amber-950/30 rounded-xl border border-amber-300 dark:border-amber-800/80 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
                      <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                        Régua Automática: 5 Dias Pré-Vencimento (5-Day Pre-Due)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                      {upcomingInvoices.length} {upcomingInvoices.length === 1 ? "Fatura a Vencer" : "Faturas a Vencer"}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                    Disparo automático via WhatsApp oficial ERP agendado exatamente <strong>5 dias antes da data de vencimento</strong> às <strong>{dispatchTime}h</strong>, com link do boleto e chave PIX para liquidação imediata dos títulos escolares a vencer.
                  </p>
                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      id="btn-apply-5d-all-upcoming"
                      onClick={handleApply5dToAllUpcoming}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Aplicar Regra de 5 Dias a Todas Faturas a Vencer</span>
                    </button>
                    <span className="text-[10px] text-amber-800 dark:text-amber-400 font-mono font-semibold">
                      Antecedência: 5 dias
                    </span>
                  </div>
                </div>

                {/* 1. Frequency / Periodicity Selection & Automatic Dispatch Interval */}
                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-amber-200/80 dark:border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-amber-600" />
                      Frequência & Intervalo de Envio Automático (Régua ERP)
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {FREQUENCY_OPTIONS.find(f => f.id === frequency)?.label || "Configurado"} • {intervalDays > 0 ? `a cada ${intervalDays}d` : "único"}
                    </span>
                  </div>

                  {/* Frequency Strategy Options (Diária, A cada 3 dias, Semanal, Disparo Único) */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Frequência de Envio da Régua:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {FREQUENCY_OPTIONS.map((opt) => {
                        const isSelected = frequency === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectFrequency(opt.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30"
                                : "bg-slate-50/60 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400"
                            } ${opt.id === "regua_escalonada" ? "sm:col-span-2" : ""}`}
                          >
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <span className={`text-xs font-bold ${isSelected ? "text-amber-950 dark:text-amber-200" : "text-slate-800 dark:text-slate-200"}`}>
                                {opt.label}
                              </span>
                              <span className={`text-[9px] font-black uppercase font-mono px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? "bg-amber-500 text-slate-950"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              }`}>
                                {opt.tag}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-snug">
                              {opt.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Configuração Específica do Intervalo de Envio Automático */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Repeat className="w-3.5 h-3.5 text-amber-600" />
                        Intervalo de Envio Automático:
                      </label>
                      <span className="font-mono font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-[11px]">
                        A cada {intervalDays} {intervalDays === 1 ? "dia" : "dias"}
                      </span>
                    </div>

                    {/* Predefinições Rápidas de Frequência e Intervalo */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 font-semibold mr-1">Predefinições:</span>
                      {[
                        { days: 1, label: "Diária (1d)", freq: "diario" as ReminderFrequency },
                        { days: 3, label: "A cada 3 dias (3d)", freq: "cada_3_dias" as ReminderFrequency },
                        { days: 7, label: "Semanal (7d)", freq: "semanal" as ReminderFrequency }
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() => {
                            handleSelectFrequency(preset.freq);
                            handleIntervalChange(preset.days);
                          }}
                          className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            intervalDays === preset.days && frequency === preset.freq
                              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-2xs font-black"
                              : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom Interval Stepper & Numeric Input */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleIntervalChange(intervalDays - 1)}
                          disabled={intervalDays <= 1}
                          className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-sm flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          title="Diminuir intervalo em 1 dia"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          id="input-reminder-interval-days"
                          min={1}
                          max={30}
                          value={intervalDays}
                          onChange={(e) => handleIntervalChange(parseInt(e.target.value, 10) || 1)}
                          className="w-14 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1 text-xs font-mono font-black text-center text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleIntervalChange(intervalDays + 1)}
                          disabled={intervalDays >= 30}
                          className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-sm flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          title="Aumentar intervalo em 1 dia"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                        Disparo automático realizado a cada <strong>{intervalDays} {intervalDays === 1 ? "dia" : "dias"}</strong> iniciando {daysBefore} dias antes até a confirmação de baixa do título.
                      </p>
                    </div>

                    {/* Projeção Cronológica dos Disparos da Régua */}
                    {scheduleSteps.length > 0 && (
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/70 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Projeção do Ciclo de Disparos da Régua ({scheduleSteps.length} {scheduleSteps.length === 1 ? "envio programado" : "envios programados"}):
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {scheduleSteps.map((step, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                            >
                              <span className="font-bold text-amber-700 dark:text-amber-300">{step.label}:</span>
                              <span className="text-slate-800 dark:text-slate-200 font-semibold">{step.formatted}</span>
                              {idx < scheduleSteps.length - 1 && (
                                <span className="text-slate-400 ml-1">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Automated switch & Days before due date setting */}
                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-amber-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Disparo Preventivo Pré-Vencimento
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Dispara o WhatsApp de lembrete antes da data de vencimento
                      </p>
                    </div>

                    <button
                      type="button"
                      id="toggle-modal-auto-reminder"
                      onClick={() => setAutoReminderEnabled(!autoReminderEnabled)}
                      className={`w-10 h-5.5 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                        autoReminderEnabled ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      title={autoReminderEnabled ? "Lembrete ativo" : "Lembrete desativado"}
                    >
                      <span
                        className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 ${
                          autoReminderEnabled ? "translate-x-4.5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Days Before Due Date Setting */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800 dark:text-slate-200">
                        Dias de Antecedência:
                      </label>
                      <span className="font-mono font-black text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-xs">
                        {daysBefore} {daysBefore === 1 ? "dia antes (Véspera)" : "dias antes"}
                      </span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { d: 1, label: "1d (Véspera)" },
                        { d: 2, label: "2d" },
                        { d: 3, label: "3d" },
                        { d: 5, label: "5d (Padrão)" },
                        { d: 7, label: "7d (1 sem.)" },
                        { d: 10, label: "10d" },
                        { d: 15, label: "15d" },
                        { d: 20, label: "20d" },
                        { d: 30, label: "30d (Máx)" },
                      ].map((preset) => (
                        <button
                          key={preset.d}
                          type="button"
                          onClick={() => handleDaysChange(String(preset.d))}
                          className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                            daysBefore === preset.d && !daysError
                              ? "bg-amber-500 text-slate-950 border-amber-600 font-black shadow-2xs"
                              : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Slider & Numeric Input Controls */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          id="slider-reminder-days"
                          min={1}
                          max={30}
                          value={daysBefore}
                          onChange={(e) => handleDaysChange(e.target.value)}
                          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            type="number"
                            id="input-reminder-days-number"
                            min={1}
                            max={30}
                            value={daysBeforeRaw}
                            onChange={(e) => handleDaysChange(e.target.value)}
                            className={`w-14 bg-white dark:bg-slate-900 border rounded-lg p-1.5 text-xs font-mono font-black text-center focus:outline-none transition-colors ${
                              daysError
                                ? "border-2 border-rose-500 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60"
                                : "border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-amber-500"
                            }`}
                          />
                          <span className="text-[11px] text-slate-500 font-medium">dias</span>
                        </div>
                      </div>

                      {daysError && (
                        <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {daysError}
                        </p>
                      )}
                    </div>

                    {/* Calculated Dispatch Date Banner */}
                    <div className="p-3 bg-amber-500/10 dark:bg-amber-950/40 rounded-xl border border-amber-200/80 dark:border-amber-900/60 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-950 dark:text-amber-200">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          Data Programada para Disparo:
                        </span>
                        <span className="font-mono text-sm font-black text-amber-900 dark:text-amber-300">
                          {scheduleInfo.formatted}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        📅 {scheduleInfo.fullDate} às <strong>{dispatchTime}h</strong> ({daysBefore} dias antes do vencimento em {activeInvoice?.dueDate}).
                      </p>
                    </div>

                    {/* Time Selector */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Horário de Disparo:
                        </label>
                        <select
                          value={dispatchTime}
                          onChange={(e) => setDispatchTime(e.target.value)}
                          className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                        >
                          <option value="08:00">08:00h da manhã</option>
                          <option value="09:00">09:00h da manhã (Recomendado)</option>
                          <option value="10:00">10:00h da manhã</option>
                          <option value="14:00">14:00h da tarde</option>
                          <option value="18:00">18:00h da tarde</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Aluno / Destinatário:
                        </label>
                        <select
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                        >
                          {students.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.name} ({st.parentName})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Message Customization & Dynamic Templates with Placeholders */}
                <div className="p-4 bg-white dark:bg-slate-950 rounded-xl border border-amber-200/80 dark:border-slate-800 space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-600" />
                        Modelos de Mensagem & Placeholders Dinâmicos
                      </span>
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                        Suporte a variáveis automáticas como <code className="font-mono text-amber-800 dark:text-amber-300 font-bold bg-amber-100/60 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">{"{{aluno}}"}</code> e <code className="font-mono text-amber-800 dark:text-amber-300 font-bold bg-amber-100/60 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">{"{{valor}}"}</code>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id="btn-new-template-inline"
                        onClick={() => setIsCreatingNewTemplate(prev => !prev)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Salvar a mensagem atual como um novo modelo reutilizável"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Novo Modelo</span>
                      </button>

                      <button
                        type="button"
                        id="btn-manage-templates-shortcut"
                        onClick={() => setActiveViewTab("modelos_personalizados")}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-slate-200 dark:border-slate-700"
                        title="Abrir a central completa de modelos da escola"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-600" />
                        <span>Gerenciar ({customTemplates.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline creation panel when user clicks "Novo Modelo" */}
                  {isCreatingNewTemplate && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1">
                          <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                          Salvar Mensagem Atual como Novo Modelo
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsCreatingNewTemplate(false)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 block mb-0.5">
                            Nome do Modelo:
                          </label>
                          <input
                            type="text"
                            id="input-new-template-name"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="Ex.: Lembrete Especial com Desconto..."
                            className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 block mb-0.5">
                            Categoria do Modelo:
                          </label>
                          <select
                            value={newTemplateCategory}
                            onChange={(e) => setNewTemplateCategory(e.target.value as any)}
                            className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                          >
                            <option value="preventivo">Preventivo (Pré-Vencimento)</option>
                            <option value="vencimento">Vencimento (Dia / Véspera)</option>
                            <option value="cobranca">Cobrança / Formal</option>
                            <option value="personalizado">Personalizado da Escola</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          💡 O texto digitado abaixo será armazenado e ficará disponível para todas as faturas.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setIsCreatingNewTemplate(false)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            id="btn-confirm-save-new-template"
                            onClick={() => handleSaveAsNewTemplate(newTemplateName, newTemplateDescription, newTemplateCategory)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Salvar Modelo</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Template Selector Pills */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-amber-600" />
                        Modelos Disponíveis:
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Clique para carregar o modelo
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {customTemplates.map((tmpl) => {
                        const isSelected = selectedTemplateId === tmpl.id;
                        return (
                          <button
                            key={tmpl.id}
                            type="button"
                            id={`btn-select-template-${tmpl.id}`}
                            onClick={() => handleSelectTemplateById(tmpl.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-amber-500 text-slate-950 border-amber-600 shadow-2xs font-black"
                                : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400"
                            }`}
                            title={tmpl.description || tmpl.name}
                          >
                            <span>{tmpl.name}</span>
                            {!tmpl.isSystem && (
                              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-900/10 dark:bg-amber-100/10 font-mono">
                                Criado
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic Placeholders Toolbar with 1-Click Cursor Insertion */}
                  <div className="space-y-1.5 pt-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        Placeholders Dinâmicos (Clique para Inserir no Cursor):
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Substituídos automaticamente no disparo
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 p-2 bg-amber-50/50 dark:bg-slate-900/90 rounded-lg border border-amber-200/50 dark:border-slate-800">
                      {DYNAMIC_PLACEHOLDERS.map((ph) => {
                        const isMainRequired = ph.tag === "{{aluno}}" || ph.tag === "{{valor}}";
                        return (
                          <button
                            key={ph.tag}
                            type="button"
                            id={`btn-insert-placeholder-${ph.tag.replace(/[{}]/g, "")}`}
                            onClick={() => handleInsertPlaceholder(ph.tag)}
                            title={`${ph.description} • Exemplo: ${ph.example}`}
                            className={`px-2 py-1 rounded-md text-[10.5px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs border ${
                              isMainRequired
                                ? "bg-amber-100/80 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 hover:bg-amber-200"
                                : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <span className="text-amber-600 dark:text-amber-400 font-black">+</span>
                            <span>{ph.tag}</span>
                            <span className="text-[9px] font-sans text-slate-400 dark:text-slate-500 font-normal hidden sm:inline">
                              ({ph.label})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Editable text area with ref for exact cursor insertion */}
                  <div className="space-y-1.5">
                    <textarea
                      ref={messageTextareaRef}
                      id="textarea-custom-invoice-reminder-message"
                      rows={5}
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Escreva a estrutura da mensagem com {{aluno}}, {{valor}}, {{responsavel}}, {{vencimento}}, {{documento}}..."
                      className="w-full text-xs p-3 bg-[#fdfcf8] dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-[11px] leading-relaxed"
                    />

                    {/* Detected tags verification indicator */}
                    <div className="flex items-center justify-between flex-wrap gap-2 text-[10.5px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Tags no texto:</span>
                        {["{{aluno}}", "{{valor}}", "{{responsavel}}", "{{vencimento}}"].map(tag => {
                          const simple = tag.replace(/[{}]/g, "");
                          const present =
                            customMessage.includes(tag) ||
                            customMessage.includes(`{${simple}}`) ||
                            customMessage.toLowerCase().includes(simple);
                          return (
                            <span
                              key={tag}
                              className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                                present
                                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              {present ? `✓ ${tag}` : tag}
                            </span>
                          );
                        })}
                      </div>

                      {/* Template edit / save buttons */}
                      <div className="flex items-center gap-1.5">
                        {customTemplates.find(t => t.id === selectedTemplateId)?.isSystem ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingNewTemplate(true);
                              const current = customTemplates.find(t => t.id === selectedTemplateId);
                              setNewTemplateName(current ? `${current.name} (Personalizado)` : "Meu Novo Modelo");
                            }}
                            className="text-[10.5px] text-amber-700 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Bookmark className="w-3 h-3" />
                            <span>Salvar Cópia Personalizada</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleUpdateCurrentTemplate}
                              className="text-[10.5px] text-emerald-700 dark:text-emerald-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Salvar no Modelo Ativo</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomTemplate(selectedTemplateId)}
                              className="text-[10.5px] text-rose-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional message inclusion toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includePixKey}
                        onChange={(e) => setIncludePixKey(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span>Incluir Chave PIX Copia & Cola ({"{{pix}}"})</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeBoletoLink}
                        onChange={(e) => setIncludeBoletoLink(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span>Incluir Link da 2ª Via ({"{{link}}"})</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* RIGHT COLUMN: WhatsApp Live Preview & Chat Bubble (6 cols)                */}
              {/* ========================================================================= */}
              <div className="lg:col-span-6 space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    Pré-visualização em Tempo Real (WhatsApp)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPreview ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPreview ? "Copiado!" : "Copiar Texto"}</span>
                  </button>
                </div>

                {/* WhatsApp Chat Device Frame Simulation */}
                <div className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden flex flex-col shadow-inner min-h-[360px]">
                  {/* WhatsApp Chat Top Bar */}
                  <div className="px-3.5 py-2.5 bg-[#008069] dark:bg-[#1f2c34] text-white flex items-center justify-between shrink-0 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                        🏫
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold leading-tight">Colégio Magic Learning</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-300 fill-emerald-300" />
                        </div>
                        <span className="text-[10px] text-emerald-100/90 leading-none">
                          Conta Oficial Verificada • WhatsApp ERP
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded text-white/90 font-mono">
                      {activeStudent.parentPhone || "(11) 98765-4321"}
                    </span>
                  </div>

                  {/* WhatsApp Conversation Scroll Area */}
                  <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[radial-gradient(#d1d7db_1px,transparent_1px)] dark:bg-[radial-gradient(#202c33_1px,transparent_1px)] [background-size:16px_16px]">
                    {/* Timestamp Bubble & Status Pill */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full shadow-2xs font-mono">
                        {scheduleInfo.formatted} • {dispatchTime}
                      </span>
                      <span
                        className={`text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                          currentDelivery.status === "Agendado"
                            ? "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                            : currentDelivery.status === "Enviado"
                            ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            : "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                        }`}
                      >
                        Status: {currentDelivery.status}
                      </span>
                    </div>

                    {/* Outgoing WhatsApp Bubble */}
                    <div className="flex justify-end">
                      <div className="relative max-w-[90%] bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 p-3 rounded-xl rounded-tr-xs shadow-xs border border-emerald-300/40 dark:border-emerald-700/40 space-y-2">
                        {/* Message content */}
                        <div className="text-[11.5px] leading-relaxed whitespace-pre-wrap font-sans break-words select-text">
                          {renderedMessage}
                        </div>

                        {/* WhatsApp Message Metadata Footer */}
                        <div className="flex items-center justify-end gap-1 text-[9.5px] text-slate-500 dark:text-emerald-200/70 pt-1 font-mono">
                          <span>{dispatchTime}</span>
                          {currentDelivery.status === "Falha" ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" title="Não entregue" />
                          ) : (
                            <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Failure alert card with direct manual retry button */}
                    {currentDelivery.status === "Falha" && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2.5 bg-rose-50 dark:bg-rose-950/90 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <div>
                            <span className="font-bold text-[11px] block">Falha de Envio do Lembrete</span>
                            <span className="text-[10px] text-rose-700 dark:text-rose-300 block">
                              {currentDelivery.errorMessage || "Não foi possível transmitir a mensagem."}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          id="btn-chat-retry-reminder"
                          onClick={handleManualRetry}
                          disabled={isRetrying}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10.5px] flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-2xs"
                          title="Executar retry manual agora"
                        >
                          <RefreshCw className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
                          <span>{isRetrying ? "Reenviando..." : "Retry Manual"}</span>
                        </button>
                      </motion.div>
                    )}

                    {/* Simulated Success Message banner */}
                    {sendSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-sm"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold">
                          Lembrete de teste disparado com sucesso para o WhatsApp do responsável!
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Quick actions for testing & WhatsApp Web */}
                <div className="flex items-center gap-2 pt-1">
                  {currentDelivery.status === "Falha" ? (
                    <button
                      type="button"
                      id="btn-action-retry-reminder"
                      onClick={handleManualRetry}
                      disabled={isRetrying}
                      className="flex-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                      <span>{isRetrying ? "Reenviando WhatsApp..." : "Tentar Novamente (Retry Manual)"}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSimulateDispatch}
                      disabled={isSendingSimulated}
                      className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className={`w-3.5 h-3.5 ${isSendingSimulated ? "animate-spin" : ""}`} />
                      <span>{isSendingSimulated ? "Transmitindo..." : "Testar Disparo Imediato"}</span>
                    </button>
                  )}

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 transition-all"
                    title="Abrir no WhatsApp Web"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WhatsApp Web</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL FOOTER ACTIONS                                                      */}
          {/* ========================================================================= */}
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-amber-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>
                Disparo 100% integrado com o motor financeiro e régua automática do ERP
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                id="btn-reset-reminder-defaults"
                onClick={handleResetDefaults}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Redefinir para o padrão (5 dias antes, 09:00h)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Restaurar Padrões</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                id="btn-save-invoice-reminder-rule"
                onClick={handleSaveRule}
                disabled={Boolean(daysError)}
                className={`px-5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  daysError
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Salvar Régua ({daysBefore}d antes)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
