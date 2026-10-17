import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  Clock,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  Save,
  Sliders,
  Sparkles,
  RefreshCw,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  Layers,
  ArrowRight,
  Check,
  Send,
  SlidersHorizontal,
  BellRing,
  Filter,
  Mail,
  Repeat,
  RotateCcw,
  UserCheck,
  Eye,
  FileText
} from "lucide-react";

export interface AutomatedBillingSchedulePanelProps {
  erpName?: "asaas" | "sap" | "totvs" | "iugu" | "generic";
  estudantes?: any[];
  onToast: (msg: string, type: "success" | "error" | "info") => void;
  onLogAdd?: (type: "info" | "warn" | "error" | "success", message: string, module: string) => void;
  onOpenInvoiceReminderModal?: () => void;
}

interface ScheduleDispatchLog {
  id: string;
  timestamp: string;
  parentName: string;
  studentName: string;
  amount: number;
  dueDate: string;
  daysBeforeSent: number;
  timeSent: string;
  status: "read" | "delivered" | "sent" | "failed";
  phone: string;
  invoiceId: string;
  stage: "pre" | "due_day" | "post";
}

interface MockInvoiceItem {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  amount: number;
  dueDate: string;
  daysDiff: number;
  category: "mensalidade" | "material" | "rematricula" | "extracurricular";
  isPaid: number | boolean;
  hasValidPhone: boolean;
}

export const AutomatedBillingSchedulePanel: React.FC<AutomatedBillingSchedulePanelProps> = ({
  erpName = "asaas",
  estudantes = [],
  onToast,
  onLogAdd,
  onOpenInvoiceReminderModal,
}) => {
  // Navigation inside this panel: horarios | criterios | simulacao
  const [activePanelTab, setActivePanelTab] = useState<"horarios" | "criterios" | "simulacao">("horarios");

  // 1. Activation & Overall Frequency
  const [isScheduleActive, setIsScheduleActive] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_schedule_enabled");
    return val === null ? true : val === "true";
  });

  const [scheduleFrequency, setScheduleFrequency] = useState<"diario" | "semanal" | "quinzenal">(() => {
    const val = localStorage.getItem("erp_billing_schedule_frequency") || localStorage.getItem("school_crm_billing_frequency");
    if (val === "diario" || val === "semanal" || val === "quinzenal") return val;
    return "diario";
  });

  // 2. Horários de Envio
  const [dispatchTime, setDispatchTime] = useState<string>(() => {
    return localStorage.getItem("erp_billing_schedule_time") || "09:00";
  });

  const [retryTimeWindow, setRetryTimeWindow] = useState<"none" | "4h" | "18h" | "next_day">(() => {
    return (localStorage.getItem("erp_billing_schedule_retry_window") as any) || "4h";
  });

  const [weekendPolicy, setWeekendPolicy] = useState<"anticipate_friday" | "postpone_monday" | "exact_day">(() => {
    return (localStorage.getItem("erp_billing_schedule_weekend_policy") as any) || "anticipate_friday";
  });

  const [onlyBusinessHours, setOnlyBusinessHours] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_schedule_business_hours");
    return val === null ? true : val === "true";
  });

  const [timePickerMode, setTimePickerMode] = useState<"preset" | "clock">("preset");
  const currentHour = parseInt(dispatchTime.split(":")[0], 10) || 9;
  const currentMinute = parseInt(dispatchTime.split(":")[1], 10) || 0;

  // 3. Estágios da Régua de Cobrança ERP (Critérios Temporais)
  // Estágio 1: Pré-Vencimento (Preventivo)
  const [stagePreDueEnabled, setStagePreDueEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_stage_pre_enabled");
    return val === null ? true : val === "true";
  });
  const [daysBeforeDue, setDaysBeforeDue] = useState<number>(() => {
    const val = localStorage.getItem("erp_billing_schedule_days_before");
    const parsed = val ? parseInt(val, 10) : 5;
    return isNaN(parsed) || parsed < 1 || parsed > 30 ? 5 : parsed;
  });
  const [daysBeforeRaw, setDaysBeforeRaw] = useState<string>(() => {
    const val = localStorage.getItem("erp_billing_schedule_days_before");
    return val || "5";
  });
  const [daysError, setDaysError] = useState<string>("");

  // Estágio 2: Dia do Vencimento (D-0)
  const [stageDueDayEnabled, setStageDueDayEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_stage_due_day_enabled");
    return val === null ? true : val === "true";
  });

  // Estágio 3: Pós-Vencimento (Atraso / Inadimplência)
  const [stagePostDueEnabled, setStagePostDueEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_stage_post_enabled");
    return val === null ? true : val === "true";
  });
  const [daysAfterDue, setDaysAfterDue] = useState<number>(() => {
    const val = localStorage.getItem("erp_billing_stage_post_days");
    const parsed = val ? parseInt(val, 10) : 3;
    return isNaN(parsed) || parsed < 1 || parsed > 30 ? 3 : parsed;
  });

  // 4. Critérios de Segmentação Financeira
  const [minInvoiceValue, setMinInvoiceValue] = useState<number>(() => {
    const val = localStorage.getItem("erp_billing_criteria_min_value");
    return val ? parseFloat(val) : 50;
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("erp_billing_criteria_categories");
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return ["mensalidade", "material", "rematricula", "extracurricular"];
  });

  const [excludePaidInvoices, setExcludePaidInvoices] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_schedule_exclude_paid");
    return val === null ? true : val === "true";
  });

  const [onlyVerifiedPhone, setOnlyVerifiedPhone] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_criteria_verified_phone");
    return val === null ? true : val === "true";
  });

  const [maxRemindersPerInvoice, setMaxRemindersPerInvoice] = useState<number>(() => {
    const val = localStorage.getItem("erp_billing_criteria_max_attempts");
    return val ? parseInt(val, 10) : 3;
  });

  // 5. Canais Ativos
  const [channelWhatsapp, setChannelWhatsapp] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_channel_whatsapp");
    return val === null ? true : val === "true";
  });
  const [channelEmail, setChannelEmail] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_channel_email");
    return val === null ? true : val === "true";
  });
  const [channelSms, setChannelSms] = useState<boolean>(() => {
    const val = localStorage.getItem("erp_billing_channel_sms");
    return val === "true";
  });

  // 6. Templates de Mensagem por Estágio
  const defaultPreTemplate =
    "Olá, {NOME_RESPONSAVEL}! 👋\nLembramos que a mensalidade de *{NOME_ALUNO}* referente ao mês de *{MES_REFERENCIA}* vencerá em breve no dia *{DATA_VENCIMENTO}* (faltam *{DIAS_RESTANTES} dias*).\n\n💰 *Valor:* R$ {VALOR_FATURA}\n\nPara facilitar o pagamento, utilize a chave PIX Copia e Cola:\n`{CODIGO_PIX_COPIA_COLA}`\n\n🔗 Link da Fatura: {LINK_PIX}\n_Caso já tenha efetuado o pagamento no ERP {ERP_NOME}, por favor desconsidere._\nAtenciosamente, Financeiro *{NOME_ESCOLA}*";

  const defaultDueDayTemplate =
    "Prezado(a) {NOME_RESPONSAVEL}! 🔔\nHoje ({DATA_VENCIMENTO}) é o dia de vencimento da mensalidade de *{NOME_ALUNO}* no valor de R$ {VALOR_FATURA}.\n\nPague sem filas e com confirmação instantânea via PIX Copia e Cola:\n`{CODIGO_PIX_COPIA_COLA}`\n\n🔗 Boleto e 2ª via: {LINK_PIX}\nObrigado pela pontualidade e parceria com a {NOME_ESCOLA}!";

  const defaultPostDueTemplate =
    "Prezado(a) {NOME_RESPONSAVEL},\nIdentificamos que a fatura de *{NOME_ALUNO}* no valor de R$ {VALOR_FATURA} venceu em {DATA_VENCIMENTO} (atraso de {DIAS_ATRASO} dias).\n\nEvite juros moratórios e suspensão de serviços regularizando pelo link seguro:\n🔗 {LINK_PIX}\n\n`{CODIGO_PIX_COPIA_COLA}`\nDúvidas? Responda a esta mensagem para falar com a tesouraria da {NOME_ESCOLA}.";

  const [messageTemplatePre, setMessageTemplatePre] = useState<string>(() => {
    return localStorage.getItem("erp_billing_schedule_template") || defaultPreTemplate;
  });
  const [messageTemplateDueDay, setMessageTemplateDueDay] = useState<string>(() => {
    return localStorage.getItem("erp_billing_template_due_day") || defaultDueDayTemplate;
  });
  const [messageTemplatePostDue, setMessageTemplatePostDue] = useState<string>(() => {
    return localStorage.getItem("erp_billing_template_post_due") || defaultPostDueTemplate;
  });

  const [selectedPreviewStage, setSelectedPreviewStage] = useState<"pre" | "due_day" | "post">("pre");

  // 7. Simulation & Candidate Invoices
  const [isSimulatingDispatch, setIsSimulatingDispatch] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<{
    invoicesFound: number;
    dispatchesCount: number;
    scheduledFor: string;
    stagesExecuted: string[];
  } | null>(null);

  const mockErpInvoices: MockInvoiceItem[] = useMemo(() => [
    {
      id: "FAT-8812",
      studentName: "Arthur Costa Mendes",
      parentName: "Juliana Costa Mendes",
      phone: "+55 (11) 98765-4321",
      amount: 1450.0,
      dueDate: "15/08/2026",
      daysDiff: 5, // Vence em 5 dias -> Estágio Pré
      category: "mensalidade",
      isPaid: false,
      hasValidPhone: true
    },
    {
      id: "FAT-8815",
      studentName: "Manuela Nogueira",
      parentName: "Rodrigo Ferraz Nogueira",
      phone: "+55 (11) 99123-7744",
      amount: 1680.0,
      dueDate: "10/08/2026",
      daysDiff: 0, // Vence Hoje -> Estágio Dia do Vencimento
      category: "mensalidade",
      isPaid: false,
      hasValidPhone: true
    },
    {
      id: "FAT-8820",
      studentName: "Pedro Silveira Duarte",
      parentName: "Camila Silveira Duarte",
      phone: "+55 (11) 97654-3210",
      amount: 320.0,
      dueDate: "07/08/2026",
      daysDiff: -3, // Venceu há 3 dias -> Estágio Pós (Atraso)
      category: "material",
      isPaid: false,
      hasValidPhone: true
    },
    {
      id: "FAT-8824",
      studentName: "Beatriz Nogueira Fontes",
      parentName: "Marcelo Fontes",
      phone: "+55 (11) 99144-8899",
      amount: 35.0, // Abaixo do valor mínimo de R$ 50
      dueDate: "15/08/2026",
      daysDiff: 5,
      category: "extracurricular",
      isPaid: false,
      hasValidPhone: true
    },
    {
      id: "FAT-8830",
      studentName: "Gustavo Siqueira Castro",
      parentName: "Helena Siqueira Castro",
      phone: "+55 (11) 98833-2211",
      amount: 2150.0,
      dueDate: "10/08/2026",
      daysDiff: 0,
      category: "rematricula",
      isPaid: true, // Já paga -> Bloqueada pelo critério de exclusão
      hasValidPhone: true
    },
  ], []);

  // Filter candidate invoices by active criteria
  const eligibleInvoices = useMemo(() => {
    return mockErpInvoices.map(inv => {
      const matchMinVal = inv.amount >= minInvoiceValue;
      const matchCat = selectedCategories.includes(inv.category);
      const matchNotPaid = excludePaidInvoices ? !inv.isPaid : true;
      const matchPhone = onlyVerifiedPhone ? inv.hasValidPhone : true;

      let matchedStage: "pre" | "due_day" | "post" | null = null;
      if (stagePreDueEnabled && inv.daysDiff === daysBeforeDue) {
        matchedStage = "pre";
      } else if (stageDueDayEnabled && inv.daysDiff === 0) {
        matchedStage = "due_day";
      } else if (stagePostDueEnabled && inv.daysDiff === -daysAfterDue) {
        matchedStage = "post";
      }

      const isEligible = matchMinVal && matchCat && matchNotPaid && matchPhone && matchedStage !== null;

      let reason = "Elegível para envio";
      if (!matchMinVal) reason = `Valor abaixo do mínimo (R$ ${minInvoiceValue})`;
      else if (!matchCat) reason = `Categoria "${inv.category}" não habilitada`;
      else if (!matchNotPaid) reason = "Fatura já quitada no ERP";
      else if (!matchPhone) reason = "Telefone não verificado no ERP";
      else if (matchedStage === null) reason = "Fora dos marcos de dias ativos da régua";

      return {
        ...inv,
        matchedStage,
        isEligible,
        reason
      };
    });
  }, [
    mockErpInvoices,
    minInvoiceValue,
    selectedCategories,
    excludePaidInvoices,
    onlyVerifiedPhone,
    stagePreDueEnabled,
    daysBeforeDue,
    stageDueDayEnabled,
    stagePostDueEnabled,
    daysAfterDue
  ]);

  // 8. Logs de Auditoria
  const [dispatchLogs, setDispatchLogs] = useState<ScheduleDispatchLog[]>([
    {
      id: "sch-log-1",
      timestamp: "Hoje, 09:00",
      parentName: "Juliana Costa Mendes",
      studentName: "Arthur Costa Mendes",
      amount: 1450.0,
      dueDate: "15/08/2026",
      daysBeforeSent: 5,
      timeSent: "09:00",
      status: "read",
      phone: "+55 (11) 98765-4321",
      invoiceId: "FAT-2026-8812",
      stage: "pre"
    },
    {
      id: "sch-log-2",
      timestamp: "Hoje, 09:00",
      parentName: "Rodrigo Ferraz Nogueira",
      studentName: "Manuela Nogueira",
      amount: 1680.0,
      dueDate: "10/08/2026",
      daysBeforeSent: 0,
      timeSent: "09:00",
      status: "delivered",
      phone: "+55 (11) 99123-7744",
      invoiceId: "FAT-2026-8815",
      stage: "due_day"
    }
  ]);

  // Validate Days
  const validateAndUpdateDays = (val: string) => {
    setDaysBeforeRaw(val);
    if (val.trim() === "") {
      setDaysError("Informe a quantidade de dias de antecedência.");
      return;
    }
    const num = Number(val);
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 30) {
      setDaysError("⚠️ O número de dias deve ser um número inteiro positivo entre 1 e 30 dias.");
    } else {
      setDaysError("");
      setDaysBeforeDue(num);
      localStorage.setItem("erp_billing_schedule_days_before", String(num));
    }
  };

  const setHourAndMinute = (hour: number, minute: number) => {
    const formattedHour = hour.toString().padStart(2, "0");
    const formattedMinute = minute.toString().padStart(2, "0");
    const newTime = `${formattedHour}:${formattedMinute}`;
    setDispatchTime(newTime);
    localStorage.setItem("erp_billing_schedule_time", newTime);
  };

  // Preset Time Slots
  const timePresets = [
    {
      title: "Manhã (07:30 - 11:00)",
      icon: Sun,
      color: "text-amber-500",
      slots: [
        { time: "07:30", label: "07:30", popular: false },
        { time: "08:00", label: "08:00", popular: false },
        { time: "09:00", label: "09:00 🔥", popular: true },
        { time: "10:30", label: "10:30", popular: false },
      ],
    },
    {
      title: "Tarde (12:00 - 17:00)",
      icon: Sunset,
      color: "text-orange-500",
      slots: [
        { time: "12:00", label: "12:00", popular: false },
        { time: "14:00", label: "14:00 🔥", popular: true },
        { time: "15:30", label: "15:30", popular: false },
        { time: "17:00", label: "17:00", popular: false },
      ],
    },
    {
      title: "Noite Comercial (18:00 - 20:00)",
      icon: Moon,
      color: "text-indigo-400",
      slots: [
        { time: "18:00", label: "18:00", popular: false },
        { time: "19:00", label: "19:00", popular: true },
        { time: "20:00", label: "20:00", popular: false },
      ],
    },
  ];

  // Save All Settings
  const handleSaveAll = () => {
    localStorage.setItem("erp_billing_schedule_enabled", String(isScheduleActive));
    localStorage.setItem("erp_billing_schedule_frequency", scheduleFrequency);
    localStorage.setItem("school_crm_billing_frequency", scheduleFrequency);

    // Horários
    localStorage.setItem("erp_billing_schedule_time", dispatchTime);
    localStorage.setItem("erp_billing_schedule_retry_window", retryTimeWindow);
    localStorage.setItem("erp_billing_schedule_weekend_policy", weekendPolicy);
    localStorage.setItem("erp_billing_schedule_business_hours", String(onlyBusinessHours));

    // Estágios
    localStorage.setItem("erp_billing_stage_pre_enabled", String(stagePreDueEnabled));
    localStorage.setItem("erp_billing_schedule_days_before", String(daysBeforeDue));
    localStorage.setItem("erp_billing_stage_due_day_enabled", String(stageDueDayEnabled));
    localStorage.setItem("erp_billing_stage_post_enabled", String(stagePostDueEnabled));
    localStorage.setItem("erp_billing_stage_post_days", String(daysAfterDue));

    // Critérios
    localStorage.setItem("erp_billing_criteria_min_value", String(minInvoiceValue));
    localStorage.setItem("erp_billing_criteria_categories", JSON.stringify(selectedCategories));
    localStorage.setItem("erp_billing_schedule_exclude_paid", String(excludePaidInvoices));
    localStorage.setItem("erp_billing_criteria_verified_phone", String(onlyVerifiedPhone));
    localStorage.setItem("erp_billing_criteria_max_attempts", String(maxRemindersPerInvoice));

    // Canais
    localStorage.setItem("erp_billing_channel_whatsapp", String(channelWhatsapp));
    localStorage.setItem("erp_billing_channel_email", String(channelEmail));
    localStorage.setItem("erp_billing_channel_sms", String(channelSms));

    // Templates
    localStorage.setItem("erp_billing_schedule_template", messageTemplatePre);
    localStorage.setItem("erp_billing_template_due_day", messageTemplateDueDay);
    localStorage.setItem("erp_billing_template_post_due", messageTemplatePostDue);

    // Compatibilidade com chaves legadas
    localStorage.setItem("erp_auto_reminder_days_before", String(daysBeforeDue));
    localStorage.setItem("erp_auto_reminder_time", dispatchTime);
    localStorage.setItem("erp_auto_reminder_frequency", scheduleFrequency);
    localStorage.setItem("erp_auto_reminder_5d_enabled", String(isScheduleActive));

    window.dispatchEvent(new Event("school_crm_config_updated"));

    if (onLogAdd) {
      onLogAdd(
        "success",
        `[RÉGUA ERP ATUALIZADA] Horários (${dispatchTime}h), frequência (${scheduleFrequency.toUpperCase()}) e critérios da régua salvos com sucesso no ERP ${erpName.toUpperCase()}.`,
        "BILLING_SCHEDULE"
      );
    }

    onToast(
      `✓ Configurações da Régua de Cobrança ERP salvas! Disparo às ${dispatchTime}h (${scheduleFrequency.toUpperCase()}) com critérios validados.`,
      "success"
    );
  };

  // Simulate Execution Routine
  const handleSimulateScheduleRoutine = () => {
    if (isSimulatingDispatch) return;
    setIsSimulatingDispatch(true);

    onToast(
      `🔍 Executando varredura no ERP (${erpName.toUpperCase()}) aplicando critérios de envio e régua de cobrança...`,
      "info"
    );

    setTimeout(() => {
      const candidates = eligibleInvoices.filter(i => i.isEligible);
      const stagesFired: string[] = [];
      if (stagePreDueEnabled) stagesFired.push(`Preventivo D-${daysBeforeDue}`);
      if (stageDueDayEnabled) stagesFired.push("Vencimento D-0");
      if (stagePostDueEnabled) stagesFired.push(`Atraso D+${daysAfterDue}`);

      const newEntries: ScheduleDispatchLog[] = candidates.map((item, idx) => ({
        id: `sch-sim-${Date.now()}-${idx}`,
        timestamp: `Hoje, ${dispatchTime}`,
        parentName: item.parentName,
        studentName: item.studentName,
        amount: item.amount,
        dueDate: item.dueDate,
        daysBeforeSent: item.daysDiff,
        timeSent: dispatchTime,
        status: "read",
        phone: item.phone,
        invoiceId: item.id,
        stage: item.matchedStage || "pre"
      }));

      setDispatchLogs(prev => [...newEntries, ...prev]);
      setSimulationResult({
        invoicesFound: mockErpInvoices.length,
        dispatchesCount: candidates.length,
        scheduledFor: `${dispatchTime}h`,
        stagesExecuted: stagesFired
      });
      setIsSimulatingDispatch(false);

      if (onLogAdd) {
        onLogAdd(
          "success",
          `[SIMULAÇÃO DISPARO] Régua executou com sucesso: ${candidates.length} de ${mockErpInvoices.length} faturas atenderam aos critérios de envio no ERP.`,
          "BILLING_SCHEDULE"
        );
      }

      onToast(
        `🚀 Simulação concluída! ${candidates.length} faturas enquadradas nos critérios da régua foram processadas para às ${dispatchTime}h!`,
        "success"
      );
    }, 1200);
  };

  // Formatter for Preview
  const getFormattedMessage = (stage: "pre" | "due_day" | "post") => {
    let tpl = messageTemplatePre;
    if (stage === "due_day") tpl = messageTemplateDueDay;
    if (stage === "post") tpl = messageTemplatePostDue;

    return tpl
      .replace(/{NOME_RESPONSAVEL}/g, "Mariana Silva")
      .replace(/{NOME_ESCOLA}/g, "Colégio Modelo")
      .replace(/{NOME_ALUNO}/g, "Bernardo Silva")
      .replace(/{MES_REFERENCIA}/g, "Agosto/2026")
      .replace(/{DATA_VENCIMENTO}/g, "15/08/2026")
      .replace(/{DIAS_RESTANTES}/g, String(daysBeforeDue))
      .replace(/{DIAS_ATRASO}/g, String(daysAfterDue))
      .replace(/{VALOR_FATURA}/g, "1.450,00")
      .replace(/{HORARIO_DISPARO}/g, dispatchTime)
      .replace(/{ERP_NOME}/g, erpName.toUpperCase())
      .replace(/{LINK_PIX}/g, "https://colegio.edu.br/fatura/pix-8812")
      .replace(
        /{CODIGO_PIX_COPIA_COLA}/g,
        "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654071450.005802BR"
      );
  };

  return (
    <div className="space-y-6" id="automated-billing-schedule-panel">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/70 dark:border-amber-800/80 flex items-center gap-1.5">
                <BellRing className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Régua de Cobrança ERP</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                • Conexão ativa com {erpName.toUpperCase()}
              </span>
            </div>

            <h3 className="font-serif font-black text-xl text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span>Painel de Horários e Critérios de Envio da Régua</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Defina os <strong>horários de disparo diário</strong>, as <strong>regras de reenvio</strong> e os <strong>critérios de elegibilidade</strong> (valores mínimos, categorias e estágios temporais) dos lembretes automáticos de vencimento de faturas do ERP.
            </p>
          </div>

          {/* ACTIVE TOGGLE & MODAL TRIGGER */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenInvoiceReminderModal && (
              <button
                type="button"
                id="btn-open-invoice-reminder-modal-from-schedule"
                onClick={onOpenInvoiceReminderModal}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                title="Abrir modal de lembrete avulso"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Lembrete Rápido Avulso</span>
              </button>
            )}

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Automação da Régua
                </span>
                <span
                  className={`text-[10px] font-mono font-black ${
                    isScheduleActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                  }`}
                >
                  {isScheduleActive ? "ATIVA NO ERP" : "PAUSADA"}
                </span>
              </div>
              <button
                type="button"
                id="toggle-schedule-active"
                onClick={() => {
                  const nextVal = !isScheduleActive;
                  setIsScheduleActive(nextVal);
                  localStorage.setItem("erp_billing_schedule_enabled", String(nextVal));
                  onToast(
                    nextVal
                      ? `🔔 Régua de cobrança ativada às ${dispatchTime}h!`
                      : "⏸️ Régua de cobrança pausada.",
                    nextVal ? "success" : "info"
                  );
                }}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none cursor-pointer ${
                  isScheduleActive ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
                title="Ativar ou pausar a régua de cobrança automática"
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 left-1 ${
                    isScheduleActive ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* SUMMARY BADGES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 p-3 rounded-2xl space-y-0.5">
            <span className="text-[10px] font-mono font-black text-indigo-700 dark:text-indigo-400 uppercase block">
              Horário do Disparo
            </span>
            <div className="text-base font-black text-indigo-900 dark:text-indigo-200 font-mono flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{dispatchTime}h</span>
            </div>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 p-3 rounded-2xl space-y-0.5">
            <span className="text-[10px] font-mono font-black text-amber-700 dark:text-amber-400 uppercase block">
              Frequência da Régua
            </span>
            <div className="text-base font-black text-amber-900 dark:text-amber-200 font-mono flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-amber-600" />
              <span>{scheduleFrequency === "diario" ? "Diário (24h)" : scheduleFrequency === "semanal" ? "Semanal (7d)" : "Quinzenal (15d)"}</span>
            </div>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 p-3 rounded-2xl space-y-0.5">
            <span className="text-[10px] font-mono font-black text-emerald-700 dark:text-emerald-400 uppercase block">
              Estágios Ativos
            </span>
            <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 font-mono flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{[stagePreDueEnabled && `D-${daysBeforeDue}`, stageDueDayEnabled && "D-0", stagePostDueEnabled && `D+${daysAfterDue}`].filter(Boolean).join(" • ") || "Nenhum"}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl space-y-0.5">
            <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase block">
              Critério de Corte
            </span>
            <div className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono flex items-center gap-1.5 mt-0.5">
              <Filter className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Min: R$ {minInvoiceValue.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB-TABS INTERNAS DO PAINEL */}
      <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActivePanelTab("horarios")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activePanelTab === "horarios"
              ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>1. Horários & Políticas de Disparo</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePanelTab("criterios")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activePanelTab === "criterios"
              ? "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>2. Critérios da Régua de Cobrança ERP</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePanelTab("simulacao")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activePanelTab === "simulacao"
              ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
          }`}
        >
          <Play className="w-4 h-4" />
          <span>3. Simulação & Prévia de Disparos</span>
        </button>
      </div>

      {/* 3. CONTEÚDO DAS SUB-ABAS */}
      {/* ===================== TAB 1: HORÁRIOS & POLÍTICAS ===================== */}
      {activePanelTab === "horarios" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Time Picker */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Horário Principal do Disparo Diário
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Momento em que o robô do ERP inicia a rotina de envio aos responsáveis.
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTimePickerMode("preset")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer ${
                      timePickerMode === "preset"
                        ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs"
                        : "text-slate-500"
                    }`}
                  >
                    Grade de Turnos
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimePickerMode("clock")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer ${
                      timePickerMode === "clock"
                        ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs"
                        : "text-slate-500"
                    }`}
                  >
                    Relógio Interativo
                  </button>
                </div>
              </div>

              {/* Display do horário ativo */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-mono font-black text-lg shadow-md shrink-0">
                    {dispatchTime}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-indigo-950 dark:text-indigo-200 block">
                      Disparo Programado: {dispatchTime}h
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Janela comercial validada anti-spam (08:00 às 20:00).
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[10px] font-mono font-bold text-slate-500">Ajuste Livre:</label>
                  <input
                    type="time"
                    value={dispatchTime}
                    onChange={(e) => {
                      if (e.target.value) {
                        setDispatchTime(e.target.value);
                        localStorage.setItem("erp_billing_schedule_time", e.target.value);
                      }
                    }}
                    className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Mode Presets */}
              {timePickerMode === "preset" ? (
                <div className="space-y-3 pt-1">
                  {timePresets.map((group) => {
                    const IconComp = group.icon;
                    return (
                      <div key={group.title} className="bg-slate-50/60 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-150 dark:border-slate-850 space-y-2">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 font-mono">
                          <IconComp className={`w-3.5 h-3.5 ${group.color}`} />
                          {group.title}
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {group.slots.map((slot) => {
                            const isSelected = dispatchTime === slot.time;
                            return (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => {
                                  setDispatchTime(slot.time);
                                  localStorage.setItem("erp_billing_schedule_time", slot.time);
                                  onToast(`⏰ Horário configurado para às ${slot.time}h!`, "info");
                                }}
                                className={`p-2 rounded-xl border text-center text-xs font-mono font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-indigo-600 text-white border-indigo-700 shadow-xs font-black ring-2 ring-indigo-400/40"
                                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                                }`}
                              >
                                {slot.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Interactive Clock */
                <div className="bg-slate-50/80 dark:bg-slate-950/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="text-[10px] font-mono font-black text-slate-500 uppercase block">Horas (07h às 21h):</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHourAndMinute(h, currentMinute)}
                        className={`p-1.5 rounded-xl text-center text-xs font-mono font-bold cursor-pointer border ${
                          currentHour === h
                            ? "bg-indigo-600 text-white border-indigo-700 shadow-xs font-black"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200"
                        }`}
                      >
                        {h.toString().padStart(2, "0")}h
                      </button>
                    ))}
                  </div>

                  <label className="text-[10px] font-mono font-black text-slate-500 uppercase block pt-2">Minutos:</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 15, 30, 45].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setHourAndMinute(currentHour, m)}
                        className={`p-1.5 rounded-xl text-center text-xs font-mono font-bold cursor-pointer border ${
                          currentMinute === m
                            ? "bg-amber-500 text-slate-950 border-amber-600 shadow-xs font-black"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200"
                        }`}
                      >
                        :{m.toString().padStart(2, "0")}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Políticas de Envio & Finais de Semana */}
            <div className="lg:col-span-5 space-y-4">
              {/* Janela de Reenvio / Segunda Tentativa */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                  <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                  Segunda Tentativa / Reenvio
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Caso a mensagem não seja entregue ou lida, o sistema pode tentar novo disparo:
                </p>

                <div className="space-y-1.5">
                  {[
                    { id: "none", label: "Não reenviar automaticamente", hint: "Apenas 1 tentativa por marco" },
                    { id: "4h", label: "Reenviar após 4 horas", hint: "Ideal para mensagens disparadas pela manhã" },
                    { id: "18h", label: "Reenviar no fim da tarde (18:00h)", hint: "Horário em que pais chegam em casa" },
                    { id: "next_day", label: "Reenviar no dia seguinte às 09:00h", hint: "Re-tentativa no turno seguinte" },
                  ].map((opt) => {
                    const isSelected = retryTimeWindow === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setRetryTimeWindow(opt.id as any);
                          localStorage.setItem("erp_billing_schedule_retry_window", opt.id);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-100 font-bold shadow-2xs"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{opt.label}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{opt.hint}</span>
                        </div>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Finais de Semana & Horário Comercial */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Políticas Anti-Spam & Finais de Semana
                </h4>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Vencimentos em Sábados, Domingos ou Feriados:
                  </label>
                  <select
                    value={weekendPolicy}
                    onChange={(e) => setWeekendPolicy(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="anticipate_friday">Antecipar envio para Sexta-feira anterior (Recomendado)</option>
                    <option value="postpone_monday">Postergar envio para Segunda-feira útil</option>
                    <option value="exact_day">Enviar na data exata (inclusive fim de semana)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-850 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyBusinessHours}
                      onChange={(e) => setOnlyBusinessHours(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Bloqueio estrito fora do Horário Comercial (08h às 20h)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: CRITÉRIOS DA RÉGUA DE COBRANÇA ===================== */}
      {activePanelTab === "criterios" && (
        <div className="space-y-6">
          {/* Estágios da Régua de Cobrança */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                  <Layers className="w-4 h-4 text-amber-500" />
                  Estágios Ativos da Régua de Cobrança ERP
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Habilite e personalize os marcos temporais de envio dos lembretes automáticos.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded">
                Três Etapas de Cobrança
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Estágio 1: Pré-Vencimento Preventivo */}
              <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                stagePreDueEnabled
                  ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    1. Preventivo (Pré-Vencimento)
                  </span>
                  <input
                    type="checkbox"
                    checked={stagePreDueEnabled}
                    onChange={(e) => setStagePreDueEnabled(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Antecedência (Dias):</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={daysBeforeDue}
                      disabled={!stagePreDueEnabled}
                      onChange={(e) => validateAndUpdateDays(e.target.value)}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer accent-amber-500"
                    />
                    <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                      D-{daysBeforeDue}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Envia lembrete cordial com código PIX Copia e Cola <strong>{daysBeforeDue} {daysBeforeDue === 1 ? "dia antes" : "dias antes"}</strong> do vencimento.
                </p>
              </div>

              {/* Estágio 2: Dia do Vencimento */}
              <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                stageDueDayEnabled
                  ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    2. No Vencimento (D-0)
                  </span>
                  <input
                    type="checkbox"
                    checked={stageDueDayEnabled}
                    onChange={(e) => setStageDueDayEnabled(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-200/80 text-[10px] text-slate-600 dark:text-slate-300 font-mono">
                  Marco Fixo: Dia Exato (D-0) às {dispatchTime}h
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Disparo matinal no dia de hoje para lembrar a família antes do fechamento bancário diário.
                </p>
              </div>

              {/* Estágio 3: Pós-Vencimento (Atraso) */}
              <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
                stagePostDueEnabled
                  ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    3. Atraso (Pós-Vencimento)
                  </span>
                  <input
                    type="checkbox"
                    checked={stagePostDueEnabled}
                    onChange={(e) => setStagePostDueEnabled(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase block">Dias após vencimento:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={daysAfterDue}
                      disabled={!stagePostDueEnabled}
                      onChange={(e) => setDaysAfterDue(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer accent-amber-500"
                    />
                    <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                      D+{daysAfterDue}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Notificação amigável de fatura em aberto com cálculo atualizado de encargos no ERP.
                </p>
              </div>
            </div>
          </div>

          {/* Frequência & Critérios de Segmentação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Frequência da Régua */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                <Repeat className="w-4 h-4 text-indigo-500" />
                Frequência de Execução da Régua
              </h4>
              <p className="text-[11px] text-slate-500">
                Cadência com que o motor de automação realiza a varredura nas faturas do ERP:
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "diario", title: "Diário", badge: "24h", desc: "Varredura contínua" },
                  { id: "semanal", title: "Semanal", badge: "7d", desc: "A cada 7 dias" },
                  { id: "quinzenal", title: "Quinzenal", badge: "15d", desc: "Ciclo quinzenal ERP" },
                ].map((f) => {
                  const isSel = scheduleFrequency === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setScheduleFrequency(f.id as any)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSel
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-xs font-bold"
                          : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{f.title}</span>
                        <span className={`text-[8.5px] font-mono px-1 py-0.5 rounded ${isSel ? "bg-indigo-800 text-indigo-100" : "bg-slate-200 text-slate-600"}`}>
                          {f.badge}
                        </span>
                      </div>
                      <span className={`text-[9.5px] block mt-1 ${isSel ? "text-indigo-200" : "text-slate-400"}`}>
                        {f.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtros de Valor e Categorias */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                <Filter className="w-4 h-4 text-emerald-500" />
                Filtros e Critérios de Segmentação
              </h4>

              {/* Valor Mínimo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Valor Mínimo da Fatura para Disparo:
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    R$ {minInvoiceValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0, 20, 50, 100, 200].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMinInvoiceValue(val)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer ${
                        minInvoiceValue === val
                          ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 text-slate-600"
                      }`}
                    >
                      {val === 0 ? "Sem Mínimo" : `R$ ${val}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorias Habilitadas */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Categorias de Faturamento Habilitadas no ERP:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "mensalidade", label: "Mensalidades" },
                    { id: "material", label: "Material Didático" },
                    { id: "rematricula", label: "Rematrículas" },
                    { id: "extracurricular", label: "Atividades Extras" },
                  ].map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id);
                    return (
                      <label key={cat.id} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories(prev => [...prev, cat.id]);
                            } else {
                              setSelectedCategories(prev => prev.filter(c => c !== cat.id));
                            }
                          }}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Anti-fadiga & Exclusões */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludePaidInvoices}
                    onChange={(e) => setExcludePaidInvoices(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Excluir faturas já liquidadas / compensadas no ERP</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyVerifiedPhone}
                    onChange={(e) => setOnlyVerifiedPhone(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Disparar apenas para responsáveis com telefone verificado</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: SIMULAÇÃO & PRÉVIA ===================== */}
      {activePanelTab === "simulacao" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Template Editor and Stage Preview Switcher */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 font-mono">
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      Editor de Mensagem da Régua
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Personalize a mensagem para cada estágio da régua de cobrança.
                    </p>
                  </div>

                  {/* Stage Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold">
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewStage("pre")}
                      className={`px-2 py-1 rounded-lg cursor-pointer ${
                        selectedPreviewStage === "pre"
                          ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs font-black"
                          : "text-slate-500"
                      }`}
                    >
                      D-{daysBeforeDue}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewStage("due_day")}
                      className={`px-2 py-1 rounded-lg cursor-pointer ${
                        selectedPreviewStage === "due_day"
                          ? "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-2xs font-black"
                          : "text-slate-500"
                      }`}
                    >
                      D-0
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewStage("post")}
                      className={`px-2 py-1 rounded-lg cursor-pointer ${
                        selectedPreviewStage === "post"
                          ? "bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-2xs font-black"
                          : "text-slate-500"
                      }`}
                    >
                      D+{daysAfterDue}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={
                    selectedPreviewStage === "pre"
                      ? messageTemplatePre
                      : selectedPreviewStage === "due_day"
                      ? messageTemplateDueDay
                      : messageTemplatePostDue
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (selectedPreviewStage === "pre") setMessageTemplatePre(val);
                    else if (selectedPreviewStage === "due_day") setMessageTemplateDueDay(val);
                    else setMessageTemplatePostDue(val);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 text-xs font-sans text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-600 font-medium"
                />

                {/* Variáveis Dinâmicas */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { tag: "{NOME_RESPONSAVEL}", label: "Responsável" },
                    { tag: "{NOME_ALUNO}", label: "Aluno" },
                    { tag: "{VALOR_FATURA}", label: "Valor R$" },
                    { tag: "{DATA_VENCIMENTO}", label: "Vencimento" },
                    { tag: "{CODIGO_PIX_COPIA_COLA}", label: "PIX Copia/Cola" },
                    { tag: "{LINK_PIX}", label: "Link Seguro" },
                    { tag: "{NOME_ESCOLA}", label: "Colégio" },
                  ].map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => {
                        if (selectedPreviewStage === "pre") setMessageTemplatePre(prev => prev + " " + v.tag);
                        else if (selectedPreviewStage === "due_day") setMessageTemplateDueDay(prev => prev + " " + v.tag);
                        else setMessageTemplatePostDue(prev => prev + " " + v.tag);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[10px] font-mono text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      + {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela de Faturas Elegíveis no ERP com base nos critérios */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    Faturas no Alvo dos Critérios ({eligibleInvoices.filter(i => i.isEligible).length} Elegíveis)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Total avaliado: {mockErpInvoices.length}</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {eligibleInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                        inv.isEligible
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-850"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-70"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 dark:text-slate-100">{inv.studentName}</strong>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {inv.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Resp: {inv.parentName} • Vencimento: {inv.dueDate}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-black text-slate-900 dark:text-slate-100 block">
                          R$ {inv.amount.toFixed(2)}
                        </span>
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                          inv.isEligible
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                            : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {inv.isEligible ? `Elegível (${inv.matchedStage?.toUpperCase()})` : inv.reason}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Smartphone Mockup & Trigger Button */}
            <div className="lg:col-span-5 space-y-4">
              {/* Smartphone Mockup */}
              <div className="bg-slate-950 p-4 rounded-[2.5rem] border-4 border-slate-800 shadow-2xl space-y-3 relative overflow-hidden">
                <div className="flex justify-center items-center pb-2">
                  <div className="w-20 h-3 bg-slate-800 rounded-full flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                    <div className="w-6 h-1 rounded-full bg-slate-700" />
                  </div>
                </div>

                <div className="bg-[#075e54] text-white p-3 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-[10px] font-bold text-amber-300">
                      ML
                    </div>
                    <div>
                      <span className="text-xs font-bold block leading-tight">Colégio Modelo Oficial ✓</span>
                      <span className="text-[8px] text-emerald-200 font-mono">Conta Verificada</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-100">{dispatchTime}</span>
                </div>

                <div className="bg-[#efeae2] dark:bg-[#0b141a] p-3 rounded-2xl min-h-[260px] flex flex-col justify-end space-y-2 border border-slate-700/50">
                  <div className="text-center my-0.5">
                    <span className="text-[8.5px] bg-white/80 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md font-mono">
                      HOJE • {dispatchTime}
                    </span>
                  </div>

                  <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 p-3 rounded-2xl rounded-tr-xs shadow-xs text-[11px] leading-relaxed space-y-2">
                    <p className="whitespace-pre-line font-sans">{getFormattedMessage(selectedPreviewStage)}</p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-slate-500 dark:text-emerald-200 font-mono">
                      <span>{dispatchTime}</span>
                      <CheckCircle2 className="w-3 h-3 text-sky-500" />
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-slate-900 rounded-xl text-[9.5px] text-slate-400 font-mono text-center border border-slate-800">
                  Prévia: Estágio <strong>{selectedPreviewStage === "pre" ? "Preventivo (D-N)" : selectedPreviewStage === "due_day" ? "Dia do Vencimento (D-0)" : "Atraso (D+N)"}</strong>
                </div>
              </div>

              {/* Botão Testar Disparo da Régua */}
              <button
                type="button"
                id="btn-simulate-billing-schedule"
                disabled={isSimulatingDispatch}
                onClick={handleSimulateScheduleRoutine}
                className="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
              >
                <Play className={`w-4 h-4 ${isSimulatingDispatch ? "animate-spin" : ""}`} />
                <span>{isSimulatingDispatch ? "Consultando ERP & Processando..." : "Testar Disparo da Régua Agora"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FOOTER PRINCIPAL COM BOTÃO DE SALVAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Configurações sincronizadas em tempo real com o motor financeiro e CRM escolar.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSaveAll}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Horários & Critérios da Régua</span>
          </button>
        </div>
      </div>
    </div>
  );
};
