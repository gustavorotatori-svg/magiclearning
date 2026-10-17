import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ErpWhatsAppInvoiceAlertConfig } from "./ErpWhatsAppInvoiceAlertConfig";
import { CrmFailedWhatsAppLogsView } from "./CrmFailedWhatsAppLogsView";
import { CrmLtvConfigPanel } from "./CrmLtvConfigPanel";
import { 
  AlertOctagon, 
  Clock, 
  FileWarning, 
  Filter, 
  MessageSquare, 
  Send, 
  CheckCircle2,
  Settings,
  Mail,
  Bell,
  Sparkles,
  Smartphone,
  Check,
  Zap,
  Sliders,
  RefreshCw,
  DollarSign,
  HelpCircle,
  Calendar,
  CalendarClock,
  Plus,
  Phone,
  Trash2,
  UserCheck,
  X,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  RotateCw,
  Info,
  Repeat
} from "lucide-react";
import { Estudante, Cobranca } from "../types";

interface AutomatedRemindersCrmProps {
  estudantes: Estudante[];
  cobrancas?: Cobranca[];
  onSelectStudent: (studentId: string) => void;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

interface ReminderItem {
  id: string;
  studentId: string;
  studentName: string;
  avatar: string;
  grade: string;
  type: "rematricula" | "financeiro" | "faturamento";
  message: string;
  urgency: "critical" | "high" | "medium";
  details: string;
  cobrancaAmount?: number;
  cobrancaDueDate?: string;
  cobrancaId?: string;
}

export interface ScheduledReminder {
  id: string;
  studentId: string;
  studentName: string;
  avatar: string;
  parentName: string;
  phone: string;
  email: string;
  cobrancaId?: string;
  cobrancaTitle: string;
  amount: number;
  scheduledDate: string;
  scheduledTime: string;
  channel: "whatsapp" | "email" | "sms" | "ambos";
  customMessage: string;
  status: "agendado" | "enviado" | "cancelado";
  createdAt: string;
  frequency?: "unico" | "diario" | "semanal" | "quinzenal";
}

export interface GlobalReminderConfig {
  frequency: "diario" | "semanal" | "quinzenal" | "regular" | "unico";
  daysBefore: number;
  frequencyLabel: string;
  lastSyncTime: string;
  version: string;
}

export const AutomatedRemindersCrm: React.FC<AutomatedRemindersCrmProps> = ({
  estudantes,
  cobrancas = [],
  onSelectStudent,
  onToast
}) => {
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "critical" | "high" | "medium">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "rematricula" | "financeiro" | "faturamento">("all");

  // CRM Billing Auto Reminder Settings
  const [whatsappActive, setWhatsappActive] = useState<boolean>(() => {
    const val = localStorage.getItem("school_crm_billing_whatsapp_active");
    return val === null ? true : val === "true";
  });
  const [emailActive, setEmailActive] = useState<boolean>(() => {
    const val = localStorage.getItem("school_crm_billing_email_active");
    return val === null ? true : val === "true";
  });
  const [daysBefore, setDaysBefore] = useState<number>(() => {
    const val = localStorage.getItem("school_crm_billing_days_before");
    const parsed = val ? parseInt(val, 10) : 3;
    return isNaN(parsed) || parsed < 1 || parsed > 30 ? 3 : parsed;
  });
  const [daysBeforeRaw, setDaysBeforeRaw] = useState<string>(() => {
    const val = localStorage.getItem("school_crm_billing_days_before");
    return val || "3";
  });
  const [daysBeforeError, setDaysBeforeError] = useState<string>("");

  const validateAndUpdateDaysBefore = (val: string) => {
    setDaysBeforeRaw(val);
    if (val.trim() === "") {
      setDaysBeforeError("O número de dias não pode ficar em branco.");
      return;
    }
    const num = Number(val);
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 30) {
      setDaysBeforeError("⚠️ O número de dias de antecedência deve ser um valor inteiro entre 1 e 30 dias.");
    } else {
      setDaysBeforeError("");
      setDaysBefore(num);
      localStorage.setItem("school_crm_billing_days_before", String(num));
    }
  };
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>(() => {
    const val = localStorage.getItem("school_crm_billing_whatsapp_template");
    return val || "Olá, {responsavel}! Lembramos que a mensalidade de {aluno} (vencimento em {vencimento}) no valor de R$ {valor} está disponível para pagamento via PIX/Boleto. Evite multas clicando no link: {link_pagamento}. Obrigado!";
  });
  const [emailTemplate, setEmailTemplate] = useState<string>(() => {
    const val = localStorage.getItem("school_crm_billing_email_template");
    return val || "Prezado(a) {responsavel},\n\nEsperamos que este e-mail o encontre bem. Gostaríamos de lembrar que a fatura referente aos serviços educacionais de {aluno}, no valor de R$ {valor}, vencerá em {vencimento}.\n\nPara facilitar o pagamento, você pode utilizar o PIX Copia e Cola ou boleto anexado em seu portal da família.\n\nAtenciosamente,\nSetor Financeiro - {escola}";
  });

  // Frequency and active state configurations
  const [autoRuleActive, setAutoRuleActive] = useState<boolean>(() => {
    return localStorage.getItem("school_autorule_crm") === "true";
  });
  const [billingFrequency, setBillingFrequency] = useState<"diario" | "semanal" | "quinzenal" | "regular" | "unico">(() => {
    const val = localStorage.getItem("school_crm_billing_frequency");
    return (val as any) || "diario";
  });

  // Global Configuration Reference
  const [globalConfig, setGlobalConfig] = useState<GlobalReminderConfig>(() => {
    const raw = localStorage.getItem("school_global_reminder_config");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    const freq = (localStorage.getItem("school_crm_billing_frequency") as any) || "diario";
    const days = Number(localStorage.getItem("school_crm_billing_days_before") || "3");
    const freqLabels: Record<string, string> = {
      diario: "Diário (a cada 24h)",
      semanal: "Semanal (a cada 7 dias)",
      quinzenal: "Quinzenal (a cada 15 dias)",
      regular: "3 dias (A cada 3 dias)",
      unico: `${days} dias antes (Único)`
    };
    return {
      frequency: freq,
      daysBefore: days,
      frequencyLabel: freqLabels[freq] || "Diário (a cada 24h)",
      lastSyncTime: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      version: "2.4.0"
    };
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Helper to map frequency to human readable label
  const getFrequencyText = useCallback((freq: "diario" | "semanal" | "quinzenal" | "regular" | "unico", days: number) => {
    switch (freq) {
      case "diario":
        return "Diário (a cada 24h)";
      case "semanal":
        return "Semanal (a cada 7 dias)";
      case "quinzenal":
        return "Quinzenal (a cada 15 dias)";
      case "regular":
        return "A cada 3 dias (Regra padrão)";
      case "unico":
        return `${days} ${days === 1 ? "dia" : "dias"} (Disparo Único)`;
      default:
        return `${days} dias`;
    }
  }, []);

  // Validation: Consistency between local state and Global Reminder Settings
  const syncValidation = useMemo(() => {
    const isFreqMatch = billingFrequency === globalConfig.frequency;
    const isDaysMatch = daysBefore === globalConfig.daysBefore;
    const isConsistent = isFreqMatch && isDaysMatch;

    let status: "synced" | "divergent" | "syncing" = isConsistent ? "synced" : "divergent";
    if (isSyncing) status = "syncing";

    const localLabel = getFrequencyText(billingFrequency, daysBefore);
    const globalLabel = globalConfig.frequencyLabel || getFrequencyText(globalConfig.frequency, globalConfig.daysBefore);

    return {
      status,
      isConsistent,
      localLabel,
      globalLabel,
      lastSyncTime: globalConfig.lastSyncTime,
      expectedDays: globalConfig.daysBefore,
      message: isConsistent
        ? `Frequência da régua ERP alinhada com a diretriz global (${globalLabel})`
        : `Divergência detectada: Local (${localLabel}) vs Global (${globalLabel})`
    };
  }, [billingFrequency, daysBefore, globalConfig, isSyncing, getFrequencyText]);

  // Synchronize local settings with global settings
  const handleForceGlobalSync = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      // Re-read latest global state or enforce standard baseline
      const raw = localStorage.getItem("school_global_reminder_config");
      let targetFreq: "diario" | "semanal" | "quinzenal" | "regular" | "unico" = "diario";
      let targetDays = 3;

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          targetFreq = parsed.frequency || "diario";
          targetDays = parsed.daysBefore ?? 3;
        } catch (e) {}
      } else {
        targetFreq = (localStorage.getItem("school_crm_billing_frequency") as any) || "diario";
        targetDays = Number(localStorage.getItem("school_crm_billing_days_before") || "3");
      }

      setBillingFrequency(targetFreq);
      setDaysBefore(targetDays);

      const updatedGlobal: GlobalReminderConfig = {
        frequency: targetFreq,
        daysBefore: targetDays,
        frequencyLabel: getFrequencyText(targetFreq, targetDays),
        lastSyncTime: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        version: "2.4.0"
      };

      setGlobalConfig(updatedGlobal);
      localStorage.setItem("school_global_reminder_config", JSON.stringify(updatedGlobal));
      localStorage.setItem("school_crm_billing_frequency", targetFreq);
      localStorage.setItem("school_crm_billing_days_before", String(targetDays));

      window.dispatchEvent(new Event("school_crm_config_updated"));
      setIsSyncing(false);
      onToast(`✓ Frequência sincronizada com a configuração global: ${updatedGlobal.frequencyLabel}!`, "success");
    }, 400);
  }, [getFrequencyText, onToast]);

  // Scheduling View Mode & Scheduled Reminders State
  const [viewMode, setViewMode] = useState<"reminders" | "scheduled" | "erp_whatsapp" | "failed_whatsapp" | "ltv_config">("reminders");
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>(() => {
    const saved = localStorage.getItem("school_scheduled_billing_reminders");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
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
        scheduledDate: "2026-08-01",
        scheduledTime: "09:00",
        channel: "whatsapp",
        customMessage: "Olá Roberto, lembrete amigável referente à mensalidade escolar de Lucas Silva (R$ 1.450,00). Acesse seu portal para emitir a 2ª via PIX.",
        status: "agendado",
        createdAt: "28/07/2026"
      }
    ];
  });

  // Schedule modal form inputs
  const [selectedStudentForSchedule, setSelectedStudentForSchedule] = useState<string>(estudantes[0]?.id || "");
  const [selectedCobrancaForSchedule, setSelectedCobrancaForSchedule] = useState<string>("");
  const [schedDate, setSchedDate] = useState<string>(() => new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]);
  const [schedTime, setSchedTime] = useState<string>("09:00");
  const [schedChannel, setSchedChannel] = useState<"whatsapp" | "email" | "sms" | "ambos">("whatsapp");
  const [schedRecurrence, setSchedRecurrence] = useState<"unico" | "diario" | "semanal" | "quinzenal">("unico");
  const [schedMessage, setSchedMessage] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("school_scheduled_billing_reminders", JSON.stringify(scheduledReminders));
  }, [scheduledReminders]);

  // Synchronize state across tabs/views in real-time
  useEffect(() => {
    const handleSync = () => {
      setAutoRuleActive(localStorage.getItem("school_autorule_crm") === "true");
      
      const freq = localStorage.getItem("school_crm_billing_frequency");
      if (freq) setBillingFrequency(freq as any);

      setWhatsappActive(localStorage.getItem("school_crm_billing_whatsapp_active") !== "false");
      setEmailActive(localStorage.getItem("school_crm_billing_email_active") !== "false");
      setDaysBefore(Number(localStorage.getItem("school_crm_billing_days_before") || "3"));

      const rawGlobal = localStorage.getItem("school_global_reminder_config");
      if (rawGlobal) {
        try {
          const parsed = JSON.parse(rawGlobal);
          setGlobalConfig(parsed);
        } catch (e) {}
      }
    };

    window.addEventListener("school_crm_config_updated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("school_crm_config_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);
  const [isSimulatingBatch, setIsSimulatingBatch] = useState<boolean>(false);

  // Helper for opening schedule modal
  const handleOpenScheduleModal = (studentId?: string, cobrancaId?: string) => {
    const targetStudentId = studentId || estudantes[0]?.id || "";
    setSelectedStudentForSchedule(targetStudentId);
    setSchedRecurrence("unico");
    
    const targetStudent = estudantes.find(e => e.id === targetStudentId);
    const matchedCobranca = cobrancas.find(c => c.id === cobrancaId) || cobrancas.find(c => c.status === "pendente" || c.status === "vencido") || cobrancas[0];
    
    if (matchedCobranca) {
      setSelectedCobrancaForSchedule(matchedCobranca.id);
      setSchedMessage(`Prezado(a) ${targetStudent?.parentName || "Responsável"}, notificamos que o lembrete de cobrança referente a "${matchedCobranca.title}" de ${targetStudent?.name || "Aluno"} (R$ ${matchedCobranca.amount.toFixed(2)}) foi agendado. Acesse seu portal para visualizar os detalhes.`);
    } else {
      setSelectedCobrancaForSchedule("");
      setSchedMessage(`Prezado(a) ${targetStudent?.parentName || "Responsável"}, lembramos sobre pendências financeiras e contratuais ativas de ${targetStudent?.name || "Aluno"}. Dúvidas, contate a secretaria.`);
    }

    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const student = estudantes.find(e => e.id === selectedStudentForSchedule);
    if (!student) {
      onToast("Selecione um aluno/contato válido do CRM.", "error");
      return;
    }

    const cob = cobrancas.find(c => c.id === selectedCobrancaForSchedule);
    const newScheduledItem: ScheduledReminder = {
      id: "sch-" + Date.now(),
      studentId: student.id,
      studentName: student.name,
      avatar: student.avatar,
      parentName: student.parentName || "Responsável Legal",
      phone: student.parentPhone || "(11) 99876-5432",
      email: student.parentEmail || "responsavel@email.com",
      cobrancaId: cob?.id,
      cobrancaTitle: cob?.title || "Mensalidade Escolar",
      amount: cob?.amount || 1450.00,
      scheduledDate: schedDate,
      scheduledTime: schedTime,
      channel: schedChannel,
      customMessage: schedMessage || `Lembrete de cobrança agendado para os responsáveis de ${student.name}.`,
      status: "agendado",
      createdAt: new Date().toLocaleDateString("pt-BR"),
      frequency: schedRecurrence
    };

    setScheduledReminders(prev => [newScheduledItem, ...prev]);
    setShowScheduleModal(false);
    setViewMode("scheduled");
    const freqDesc = schedRecurrence === "diario" ? "com recorrência Diária" : schedRecurrence === "semanal" ? "com recorrência Semanal" : schedRecurrence === "quinzenal" ? "com recorrência Quinzenal" : "de disparo único";
    onToast(`📅 Lembrete de cobrança (${freqDesc}) agendado com sucesso para ${student.parentName || student.name} em ${schedDate.split("-").reverse().join("/")} às ${schedTime}!`, "success");
  };

  const handleTriggerScheduledNow = (id: string) => {
    setScheduledReminders(prev => prev.map(s => s.id === id ? { ...s, status: "enviado" as const } : s));
    const item = scheduledReminders.find(s => s.id === id);
    if (item) {
      onToast(`⚡ Lembrete agendado disparado com sucesso para ${item.parentName} (${item.studentName}) via ${item.channel.toUpperCase()}!`, "success");
    }
  };

  const handleCancelScheduled = (id: string) => {
    setScheduledReminders(prev => prev.filter(s => s.id !== id));
    onToast("🗑️ Agendamento de cobrança cancelado com sucesso.", "info");
  };

  // Dynamically generate reminder items based on current estudantes and cobrancas list
  const reminders: ReminderItem[] = [];

  estudantes.forEach(est => {
    // 1. Re-enrollment Status check
    if (est.reEnrollmentStatus === "pendente") {
      reminders.push({
        id: `rem-remat-${est.id}`,
        studentId: est.id,
        studentName: est.name,
        avatar: est.avatar,
        grade: est.grade,
        type: "rematricula",
        message: "Rematrícula 2027 Atrasada",
        urgency: "critical",
        details: "Nenhum retorno recebido após 15 dias de abertura do período."
      });
    } else if (est.reEnrollmentStatus === "em_analise") {
      reminders.push({
        id: `rem-remat-analise-${est.id}`,
        studentId: est.id,
        studentName: est.name,
        avatar: est.avatar,
        grade: est.grade,
        type: "rematricula",
        message: "Rematrícula sob Negociação",
        urgency: "medium",
        details: "Contrato aguardando aprovação da taxa de desconto personalizada."
      });
    }

    // 2. Financial Documentation check
    if (est.id === "est-1") {
      reminders.push({
        id: `rem-doc-fiador-${est.id}`,
        studentId: est.id,
        studentName: est.name,
        avatar: est.avatar,
        grade: est.grade,
        type: "financeiro",
        message: "Falta Fiador / Residência",
        urgency: "high",
        details: "Comprovante de residência do fiador ausente no dossiê financeiro."
      });
    } else if (est.id === "est-2") {
      reminders.push({
        id: `rem-doc-renda-${est.id}`,
        studentId: est.id,
        studentName: est.name,
        avatar: est.avatar,
        grade: est.grade,
        type: "financeiro",
        message: "Falta Comprovante de Renda",
        urgency: "medium",
        details: "Pendente entrega do último holerite autenticado."
      });
    } else if (est.reEnrollmentStatus === "pendente") {
      reminders.push({
        id: `rem-doc-geral-${est.id}`,
        studentId: est.id,
        studentName: est.name,
        avatar: est.avatar,
        grade: est.grade,
        type: "financeiro",
        message: "Documentação Geral Pendente",
        urgency: "high",
        details: "Certidão de nascimento e cópias de RG do responsável financeiro não entregues."
      });
    }
  });

  // 3. Faturas prestes a vencer
  if (cobrancas && cobrancas.length > 0) {
    cobrancas.forEach((cob, index) => {
      if (cob.status === "pendente" || cob.status === "vencido") {
        let targetStudent = estudantes[0];
        if (cob.id === "cob-3" || cob.title.toLowerCase().includes("passeio")) {
          targetStudent = estudantes.find(e => e.id === "est-2") || estudantes[0];
        } else if (cob.id === "cob-2" || cob.title.toLowerCase().includes("mensalidade")) {
          targetStudent = estudantes.find(e => e.id === "est-1") || estudantes[0];
        } else {
          // Associação inteligente
          const idx = Math.abs(cob.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % estudantes.length;
          targetStudent = estudantes[idx] || estudantes[0];
        }

        if (targetStudent) {
          const parts = cob.dueDate.split("/");
          let diffDays = 0;
          if (parts.length === 3) {
            const [d, m, y] = parts.map(Number);
            const due = new Date(y, m - 1, d);
            due.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffTime = due.getTime() - today.getTime();
            diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }

          // Ativa se for vencida ou se estiver prestes a vencer dentro da margem configurada
          const isPrestesAVencer = diffDays >= 0 && diffDays <= daysBefore;
          const isVencido = cob.status === "vencido" || diffDays < 0;

          if (isPrestesAVencer || isVencido) {
            let urgency: "critical" | "high" | "medium" = "medium";
            if (isVencido) {
              urgency = "critical";
            } else if (diffDays <= 1) {
              urgency = "high";
            }

            const channels = [];
            if (whatsappActive) channels.push("WhatsApp");
            if (emailActive) channels.push("E-mail");
            const channelsStr = channels.length > 0 ? channels.join(" e ") : "Nenhum canal ativo";

            reminders.push({
              id: `rem-fat-${cob.id}`,
              studentId: targetStudent.id,
              studentName: targetStudent.name,
              avatar: targetStudent.avatar,
              grade: targetStudent.grade,
              type: "faturamento",
              message: isVencido 
                ? `Fatura Vencida: ${cob.title}` 
                : `Fatura Vencendo em ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}: ${cob.title}`,
              urgency: urgency,
              details: `Régua de cobrança ativa: Envio automático via ${channelsStr} configurado para ${daysBefore} dias antes do vencimento.`,
              cobrancaAmount: cob.amount,
              cobrancaDueDate: cob.dueDate,
              cobrancaId: cob.id
            });
          }
        }
      }
    });
  }

  // Filter reminders
  const filteredReminders = reminders.filter(rem => {
    const matchesUrgency = urgencyFilter === "all" || rem.urgency === urgencyFilter;
    const matchesType = typeFilter === "all" || rem.type === typeFilter;
    return matchesUrgency && matchesType;
  });

  const handleSaveConfig = () => {
    localStorage.setItem("school_crm_billing_whatsapp_active", String(whatsappActive));
    localStorage.setItem("school_crm_billing_email_active", String(emailActive));
    localStorage.setItem("school_crm_billing_days_before", String(daysBefore));
    localStorage.setItem("school_crm_billing_whatsapp_template", whatsappTemplate);
    localStorage.setItem("school_crm_billing_email_template", emailTemplate);
    localStorage.setItem("school_autorule_crm", String(autoRuleActive));
    localStorage.setItem("school_crm_billing_frequency", billingFrequency);

    const updatedGlobal: GlobalReminderConfig = {
      frequency: billingFrequency,
      daysBefore: daysBefore,
      frequencyLabel: getFrequencyText(billingFrequency, daysBefore),
      lastSyncTime: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      version: "2.4.0"
    };

    setGlobalConfig(updatedGlobal);
    localStorage.setItem("school_global_reminder_config", JSON.stringify(updatedGlobal));

    // Trigger sync event so scheduler and crm stay aligned in real time
    window.dispatchEvent(new Event("school_crm_config_updated"));

    onToast(`✓ Configurações do CRM e régua global sincronizadas com sucesso! Frequência ativa: ${updatedGlobal.frequencyLabel}.`, "success");
    setShowConfigPanel(false);
  };

  const handleNotify = (rem: ReminderItem) => {
    if (rem.type === "faturamento") {
      const student = estudantes.find(e => e.id === rem.studentId);
      const responsavelName = student?.parentName || "Responsável";
      const studentName = rem.studentName;
      const dueDate = rem.cobrancaDueDate || "05/08/2026";
      const amountStr = rem.cobrancaAmount ? rem.cobrancaAmount.toFixed(2) : "0,00";

      let msgWhatsApp = whatsappTemplate
        .replace("{responsavel}", responsavelName)
        .replace("{aluno}", studentName)
        .replace("{vencimento}", dueDate)
        .replace("{valor}", amountStr)
        .replace("{link_pagamento}", "https://escola.faturas.com/pay-" + rem.id)
        .replace("{escola}", "Colégio Integrado");

      const activeChannels = [];
      if (whatsappActive) activeChannels.push("WhatsApp");
      if (emailActive) activeChannels.push("E-mail");

      if (activeChannels.length === 0) {
        onToast("⚠️ Alerta: Ative pelo menos um canal de envio (WhatsApp ou E-mail) nas configurações da régua!", "error");
        return;
      }

      onToast(
        `🚀 CRM escolar disparou lembrete via ${activeChannels.join(" & ")} para os pais de ${studentName}!\n` +
        `Notificação: "${msgWhatsApp.substring(0, 85)}..."`, 
        "success"
      );
    } else {
      onToast(`🔔 Notificação de CRM enviada com sucesso para os pais de ${rem.studentName}!`, "success");
    }
  };

  const handleSimulateBatchDispatches = () => {
    setIsSimulatingBatch(true);
    const faturamentoReminders = reminders.filter(r => r.type === "faturamento");
    
    setTimeout(() => {
      setIsSimulatingBatch(false);
      if (faturamentoReminders.length === 0) {
        onToast("Nenhuma fatura se enquadra na régua do CRM no momento.", "info");
        return;
      }
      onToast(`✨ Sucesso! Disparados em lote ${faturamentoReminders.length} lembretes automáticos de faturamento via CRM (WhatsApp/E-mail)!`, "success");
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-amber-200/40 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Title with Options buttons and Synchronization Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h5 className="text-xs font-serif font-black text-[#423326] dark:text-white flex items-center gap-1.5">
              <AlertOctagon className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
              <span>Painel Inteligente do CRM Escolar</span>
            </h5>

            {/* 🏷️ GLOBAL SYNCHRONIZATION STATUS BADGE */}
            <div 
              id="crm-sync-status-badge"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-all ${
                syncValidation.status === "synced"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                  : syncValidation.status === "syncing"
                  ? "bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60"
                  : "bg-amber-50 text-amber-850 border-amber-300/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/60"
              }`}
              title={`Frequência ativa: ${syncValidation.localLabel}. Configuração Global: ${syncValidation.globalLabel}.`}
            >
              {syncValidation.status === "synced" ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Sincronizado • {syncValidation.globalLabel}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                </>
              ) : syncValidation.status === "syncing" ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                  <span>Desalinhado ({syncValidation.localLabel})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleForceGlobalSync();
                    }}
                    className="ml-1 px-1.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[9px] font-sans font-bold uppercase transition-colors cursor-pointer"
                  >
                    Alinhar
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Mapeamento dinâmico e régua de cobrança automática para inadimplência zero.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Seletor Rápido de Frequência da Régua ERP (Diário, Semanal, Quinzenal) */}
          <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[10px]">
            <span className="text-slate-500 dark:text-slate-400 px-1.5 flex items-center gap-1 font-mono uppercase text-[9px] font-bold">
              <Repeat className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Frequência:</span>
            </span>
            {(["diario", "semanal", "quinzenal"] as const).map((freq) => {
              const isSelected = billingFrequency === freq;
              const labels = {
                diario: "Diário",
                semanal: "Semanal",
                quinzenal: "Quinzenal"
              };
              return (
                <button
                  key={freq}
                  type="button"
                  onClick={() => {
                    setBillingFrequency(freq);
                    localStorage.setItem("school_crm_billing_frequency", freq);
                    const updatedGlobal: GlobalReminderConfig = {
                      frequency: freq,
                      daysBefore: daysBefore,
                      frequencyLabel: getFrequencyText(freq, daysBefore),
                      lastSyncTime: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                      version: "2.4.0"
                    };
                    setGlobalConfig(updatedGlobal);
                    localStorage.setItem("school_global_reminder_config", JSON.stringify(updatedGlobal));
                    window.dispatchEvent(new Event("school_crm_config_updated"));
                    onToast(`Frequência da régua ERP definida para: ${labels[freq]} (${getFrequencyText(freq, daysBefore)})`, "info");
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[9.5px] font-mono uppercase font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  title={`Alternar automação da régua para frequência ${labels[freq]}`}
                >
                  {labels[freq]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleOpenScheduleModal()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Agendar Lembrete</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateBatchDispatches}
            disabled={isSimulatingBatch}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
          >
            {isSimulatingBatch ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
                <span>Disparar Régua</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center gap-1 cursor-pointer ${
              showConfigPanel 
                ? "bg-amber-600 text-white border-amber-600" 
                : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-850 hover:bg-slate-50"
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>Configurar Régua</span>
          </button>
        </div>
      </div>

      {/* 🔄 VIEW MODE SWITCHER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 bg-slate-100/80 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-850 text-left">
        <button
          type="button"
          onClick={() => setViewMode("reminders")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-[10.5px] font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === "reminders"
              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs border border-slate-200/50 dark:border-slate-800"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
          <span>Régua e Mapeamento ({filteredReminders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("scheduled")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-[10.5px] font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === "scheduled"
              ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/50 dark:border-slate-800"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Agendados ({scheduledReminders.filter(s => s.status === "agendado").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("erp_whatsapp")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-[10.5px] font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === "erp_whatsapp"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>WhatsApp ERP</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("failed_whatsapp")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-[10.5px] font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === "failed_whatsapp"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
          <span>⚠️ Falhas WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("ltv_config")}
          className={`flex-1 py-1.5 px-3 rounded-xl text-[10.5px] font-black uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === "ltv_config"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
          <span>⚙️ Parametrização LTV</span>
        </button>
      </div>

      {/* ⚙️ CONFIGURATION PANEL */}
      {showConfigPanel && (
        <div className="bg-gradient-to-br from-amber-500/5 to-indigo-500/5 border border-amber-200/50 dark:border-slate-800 p-4 rounded-2xl space-y-4 text-left animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 dark:border-slate-800/80 pb-2">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-600" />
              <strong className="text-xs text-[#423326] dark:text-white">Configuração da Régua de Lembretes Financeiros</strong>
            </div>

            {/* SYNC STATUS MONITOR INSIDE PANEL */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold border ${
                syncValidation.status === "synced"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                  : "bg-amber-50 text-amber-850 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700"
              }`}>
                {syncValidation.status === "synced" ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Consistente com Diretriz Global</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Frequência Desalinhada</span>
                  </>
                )}
              </span>

              <button
                type="button"
                onClick={handleForceGlobalSync}
                disabled={isSyncing}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 rounded text-[9.5px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer"
                title="Forçar sincronização de frequência com a diretriz global do colégio"
              >
                <RotateCw className={`w-2.5 h-2.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>Sincronizar</span>
              </button>
            </div>
          </div>

          {/* Validation Notice Banner */}
          <div className={`p-2.5 rounded-xl border text-[10.5px] leading-relaxed flex items-start gap-2 ${
            syncValidation.status === "synced"
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300"
              : "bg-amber-50/80 border-amber-300 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-200"
          }`}>
            {syncValidation.status === "synced" ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
            )}
            <div className="flex-1">
              <span className="font-bold block">
                {syncValidation.status === "synced" 
                  ? "Validação de Frequência Aprovada" 
                  : "Atenção: Validação de Frequência Divergente"}
              </span>
              <p className="text-[10px] opacity-90 mt-0.5">
                {syncValidation.message}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5 space-y-3">
              <div className="bg-slate-100/60 dark:bg-slate-900/40 p-2.5 rounded-xl border border-amber-100/40 dark:border-slate-800 space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-850 dark:text-amber-400 uppercase block">Régua Automática Geral</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-750 dark:text-slate-200">
                    <input 
                      type="checkbox" 
                      checked={autoRuleActive}
                      onChange={(e) => setAutoRuleActive(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Habilitar Disparos Automáticos</span>
                  </label>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono flex items-center gap-1.5">
                      <Repeat className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Frequência da Régua de Cobrança ERP</span>
                    </label>
                    <span className="text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {billingFrequency === "diario" ? "Diário (24h)" : billingFrequency === "semanal" ? "Semanal (7d)" : billingFrequency === "quinzenal" ? "Quinzenal (15d)" : billingFrequency === "regular" ? "A cada 3d" : "Único"}
                    </span>
                  </div>

                  {/* 3 Botões Principais: Diário, Semanal, Quinzenal */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "diario", label: "Diário", badge: "24h", hint: "Varredura contínua" },
                      { id: "semanal", label: "Semanal", badge: "7d", hint: "D-7 e vencimento" },
                      { id: "quinzenal", label: "Quinzenal", badge: "15d", hint: "D-15 e D-0 corte ERP" },
                    ].map((item) => {
                      const isSelected = billingFrequency === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBillingFrequency(item.id as any)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-500 text-amber-950 dark:text-amber-100 shadow-2xs font-bold"
                              : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-800"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] font-black">{item.label}</span>
                            <span className="text-[9px] font-mono opacity-80">{item.badge}</span>
                          </div>
                          <span className="text-[8.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">{item.hint}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explicação contextual da cadência selecionada */}
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/80 text-[10px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {billingFrequency === "diario" && (
                      <span>
                        ⚡ <strong>Régua Diária:</strong> Varredura e envio automatizado a cada 24 horas para pendências ativas e faturas próximas ao vencimento, com alternância de canais (WhatsApp e E-mail).
                      </span>
                    )}
                    {billingFrequency === "semanal" && (
                      <span>
                        📆 <strong>Régua Semanal:</strong> Disparos programados com cadência de 7 dias (D-7 e no vencimento), reduzindo custos de API e evitando sobrecarga aos pais.
                      </span>
                    )}
                    {billingFrequency === "quinzenal" && (
                      <span>
                        🗓️ <strong>Régua Quinzenal:</strong> Disparos a cada 15 dias (D-15 e D-0 da data de corte do ERP), ideal para conciliação contábil e mensalidades regulares.
                      </span>
                    )}
                    {billingFrequency === "regular" && (
                      <span>
                        🔄 <strong>A cada 3 dias:</strong> Régua padrão intercalada a cada 72 horas para cobranças gerais.
                      </span>
                    )}
                    {billingFrequency === "unico" && (
                      <span>
                        🎯 <strong>Disparo Único:</strong> Disparo exclusivo no marco de {daysBefore} dias antes do vencimento.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Canais de Envio Ativos</span>
                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={whatsappActive}
                      onChange={(e) => setWhatsappActive(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Mensagem instantânea via WhatsApp</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input 
                      type="checkbox" 
                      checked={emailActive}
                      onChange={(e) => setEmailActive(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <div className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>E-mail formal com boleto PDF</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-500" />
                    <span>Antecedência do Disparo (1-30 dias)</span>
                  </span>
                  <span className="text-xs font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    {daysBefore === 1 ? "1 dia antes (Véspera)" : `${daysBefore} dias antes`}
                  </span>
                </div>

                {/* Fast Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1">
                  {[
                    { d: 1, label: "1d (Véspera)" },
                    { d: 2, label: "2d" },
                    { d: 3, label: "3d (Padrão)" },
                    { d: 5, label: "5d" },
                    { d: 7, label: "7d (1 sem.)" },
                    { d: 10, label: "10d" },
                    { d: 15, label: "15d" },
                    { d: 20, label: "20d" },
                    { d: 30, label: "30d (Máx)" }
                  ].map((preset) => (
                    <button
                      key={preset.d}
                      type="button"
                      onClick={() => validateAndUpdateDaysBefore(String(preset.d))}
                      className={`text-[9.5px] font-mono px-2 py-0.5 rounded-md border font-bold transition-all cursor-pointer ${
                        daysBefore === preset.d && !daysBeforeError
                          ? "bg-amber-500 text-slate-950 border-amber-600 font-black shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-amber-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Slider + Number Input */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono text-slate-400">1d</span>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={daysBefore}
                    onChange={(e) => validateAndUpdateDaysBefore(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <span className="text-[10px] font-mono text-slate-400">30d</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={daysBeforeRaw}
                      onChange={(e) => validateAndUpdateDaysBefore(e.target.value)}
                      className={`w-14 bg-white dark:bg-slate-950 border rounded-lg p-1 text-xs font-mono font-black text-center focus:outline-none ${
                        daysBeforeError
                          ? "border-rose-500 text-rose-600 bg-rose-50"
                          : "border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                      }`}
                    />
                    <span className="text-[9px] font-mono text-slate-400">dias</span>
                  </div>
                </div>

                {/* Validation error */}
                {daysBeforeError && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                    {daysBeforeError}
                  </p>
                )}

                {/* Dynamic Preview */}
                <div className="bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/40 text-[10px] text-amber-900 dark:text-amber-200">
                  <span>📅 Disparo WhatsApp automático programado para <strong>{daysBefore} {daysBefore === 1 ? "dia" : "dias"} antes</strong> do vencimento da fatura no ERP.</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-emerald-500" />
                  <span>Template WhatsApp</span>
                </label>
                <textarea
                  rows={2}
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl p-2 text-[10px] font-sans text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-500" />
                  <span>Template E-mail</span>
                </label>
                <textarea
                  rows={3}
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-xl p-2 text-[10px] font-sans text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowConfigPanel(false)}
              className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveConfig}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-all flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Configuração</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 1: ALERTAS AUTOMÁTICOS */}
      {viewMode === "reminders" && (
        <>
          {/* Filter cluster */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-850 text-left">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Gravidade / Urgência:</span>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setUrgencyFilter("all")}
                  className={`px-2 py-1 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                    urgencyFilter === "all"
                      ? "bg-slate-800 text-white"
                      : "bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setUrgencyFilter("critical")}
                  className={`px-2 py-1 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                    urgencyFilter === "critical"
                      ? "bg-rose-600 text-white"
                      : "bg-white dark:bg-slate-900 text-rose-600 border border-rose-200 dark:border-rose-950 hover:bg-rose-50"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                  Altíssima (Crítica)
                </button>
                <button
                  onClick={() => setUrgencyFilter("high")}
                  className={`px-2 py-1 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                    urgencyFilter === "high"
                      ? "bg-orange-600 text-white"
                      : "bg-white dark:bg-slate-900 text-orange-600 border border-orange-200 dark:border-orange-950 hover:bg-orange-50"
                  }`}
                >
                  Alta
                </button>
                <button
                  onClick={() => setUrgencyFilter("medium")}
                  className={`px-2 py-1 rounded-lg text-[9.5px] font-black uppercase transition-all cursor-pointer ${
                    urgencyFilter === "medium"
                      ? "bg-amber-500 text-white"
                      : "bg-white dark:bg-slate-900 text-amber-600 border border-amber-200 dark:border-amber-950 hover:bg-amber-50"
                  }`}
                >
                  Média
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-slate-200/50 dark:border-slate-850">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Origem do Alerta:</span>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold transition-all cursor-pointer ${
                    typeFilter === "all" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTypeFilter("rematricula")}
                  className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold transition-all cursor-pointer ${
                    typeFilter === "rematricula" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Rematrícula
                </button>
                <button
                  onClick={() => setTypeFilter("financeiro")}
                  className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold transition-all cursor-pointer ${
                    typeFilter === "financeiro" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Ficha Documental
                </button>
                <button
                  onClick={() => setTypeFilter("faturamento")}
                  className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold transition-all cursor-pointer ${
                    typeFilter === "faturamento" ? "bg-indigo-650 text-white flex items-center gap-1" : "text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  }`}
                >
                  <DollarSign className="w-2.5 h-2.5" />
                  <span>Cobranças Vencendo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reminder cards list */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredReminders.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-2xl text-[10.5px] text-slate-400 italic">
                Nenhum alerta automático ativo nesta gravidade. Tudo limpo! ✓
              </div>
            ) : (
              filteredReminders.map(rem => {
                const urgencyStyles = {
                  critical: "bg-rose-50 border-rose-200 text-rose-750 dark:bg-rose-950/20 dark:border-rose-900/40",
                  high: "bg-orange-50 border-orange-200 text-orange-750 dark:bg-orange-950/20 dark:border-orange-900/40",
                  medium: "bg-amber-50 border-amber-200 text-amber-750 dark:bg-amber-950/20 dark:border-amber-900/40"
                }[rem.urgency];

                const urgencyLabel = {
                  critical: "💥 Crítica",
                  high: "⚠️ Alta",
                  medium: "⏳ Média"
                }[rem.urgency];

                return (
                  <div 
                    key={rem.id}
                    onClick={() => onSelectStudent(rem.studentId)}
                    className="p-3.5 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer text-left relative space-y-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-3xs hover:shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                      <div className="flex items-center gap-2">
                        <img 
                          src={rem.avatar} 
                          alt="Avatar" 
                          className="w-7 h-7 rounded-full border border-slate-200" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <strong className="text-xs font-bold text-slate-800 dark:text-slate-100 block leading-tight">{rem.studentName}</strong>
                          <span className="text-[9px] text-slate-400 block truncate">{rem.grade}</span>
                        </div>
                      </div>
                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${urgencyStyles}`}>
                        {urgencyLabel}
                      </span>
                    </div>

                    <div className="text-[10.5px]">
                      <div className="flex items-center gap-1.5 font-bold text-slate-750 dark:text-slate-200">
                        {rem.type === "rematricula" && <Clock className="w-3.5 h-3.5 text-blue-550 shrink-0" />}
                        {rem.type === "financeiro" && <FileWarning className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                        {rem.type === "faturamento" && <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        <span>{rem.message}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 font-sans leading-normal">
                        {rem.details}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                      <span className="text-[8px] text-slate-400 font-mono">ID: {rem.studentId.toUpperCase()}</span>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenScheduleModal(rem.studentId, rem.cobrancaId);
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 rounded-lg text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <CalendarClock className="w-2.5 h-2.5" />
                          <span>Agendar</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotify(rem);
                          }}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold transition-all hover:scale-103 cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>Cobrar Agora</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* VIEW 2: LEMBRETES AGENDADOS */}
      {viewMode === "scheduled" && (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 text-left">
          {scheduledReminders.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-950 border border-slate-150 rounded-2xl text-[10.5px] text-slate-400 space-y-2">
              <CalendarClock className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Nenhum lembrete de cobrança agendado no CRM.</p>
              <button
                type="button"
                onClick={() => handleOpenScheduleModal()}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                + Agendar Novo Lembrete
              </button>
            </div>
          ) : (
            scheduledReminders.map(sch => (
              <div 
                key={sch.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-3xs space-y-2.5 relative"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <div className="flex items-center gap-2">
                    <img 
                      src={sch.avatar} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full border border-slate-200" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <strong className="text-xs font-bold text-slate-800 dark:text-slate-100 block leading-tight">{sch.studentName}</strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <UserCheck className="w-3 h-3 text-blue-500" />
                        <span>Resp: {sch.parentName} ({sch.phone})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {sch.frequency && (
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        sch.frequency === "diario"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300"
                          : sch.frequency === "semanal"
                          ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300"
                          : sch.frequency === "quinzenal"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
                          : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        <Repeat className="w-2.5 h-2.5" />
                        <span>{sch.frequency === "diario" ? "Diário" : sch.frequency === "semanal" ? "Semanal" : sch.frequency === "quinzenal" ? "Quinzenal" : "Único"}</span>
                      </span>
                    )}
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                      sch.status === "agendado"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      <CalendarClock className="w-3 h-3" />
                      <span>{sch.status === "agendado" ? "Agendado" : "Disparado"}</span>
                    </span>
                  </div>
                </div>

                {/* Details & Schedule execution timestamp */}
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1.5 text-[10.5px]">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{sch.cobrancaTitle}</span>
                    </span>
                    <span className="font-mono text-emerald-600 font-extrabold">R$ {sch.amount.toFixed(2)}</span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 italic text-[10px] leading-relaxed">
                    "{sch.customMessage}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-850/80 text-[9px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                      <Calendar className="w-3 h-3" />
                      <span>Data do disparo: {sch.scheduledDate.split("-").reverse().join("/")} às {sch.scheduledTime}</span>
                    </span>
                    <span className="uppercase font-bold text-slate-500">
                      Canal: {sch.channel}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[8px] font-mono text-slate-400">Criado em: {sch.createdAt}</span>
                  <div className="flex items-center gap-1.5">
                    {sch.status === "agendado" && (
                      <button
                        type="button"
                        onClick={() => handleTriggerScheduledNow(sch.id)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-bold cursor-pointer transition-all flex items-center gap-1"
                      >
                        <Zap className="w-2.5 h-2.5" />
                        <span>Disparar Agora</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCancelScheduled(sch.id)}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 rounded-lg text-[9px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 📱 VIEW 3: ALERTAS AUTOMÁTICOS WHATSAPP (INTEGRAÇÃO ERP) */}
      {viewMode === "erp_whatsapp" && (
        <ErpWhatsAppInvoiceAlertConfig
          estudantes={estudantes}
          onToast={onToast}
        />
      )}

      {/* ⚠️ VIEW 4: LOGS DE FALHAS DE ENTREGA WHATSAPP API */}
      {viewMode === "failed_whatsapp" && (
        <CrmFailedWhatsAppLogsView
          onToast={onToast}
        />
      )}

      {/* ⚙️ VIEW 5: PARAMETRIZAÇÃO DE LTV POR PERFIL DE ALUNO */}
      {viewMode === "ltv_config" && (
        <CrmLtvConfigPanel
          onToast={onToast}
        />
      )}

      {/* 📅 INTERACTIVE SCHEDULE BILLING REMINDER MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Agendar Lembrete de Cobrança</h4>
                  <p className="text-[10px] text-slate-500">Integração direta com o cadastro de contatos e faturas pendentes do CRM.</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmSchedule} className="space-y-3 text-xs">
              {/* Select Student / Contact */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                  Contato / Aluno Cadastrado no CRM
                </label>
                <select
                  value={selectedStudentForSchedule}
                  onChange={(e) => {
                    setSelectedStudentForSchedule(e.target.value);
                    const st = estudantes.find(s => s.id === e.target.value);
                    if (st) {
                      setSchedMessage(`Prezado(a) ${st.parentName || "Responsável"}, lembramos que a fatura de ${st.name} possui vencimento próximo. Dúvidas, contate o setor financeiro.`);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                >
                  {estudantes.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.name} — Resp: {est.parentName || "Responsável"} ({est.grade})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Pending Invoice */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                  Fatura Pendente Associada
                </label>
                <select
                  value={selectedCobrancaForSchedule}
                  onChange={(e) => {
                    setSelectedCobrancaForSchedule(e.target.value);
                    const cob = cobrancas.find(c => c.id === e.target.value);
                    const st = estudantes.find(s => s.id === selectedStudentForSchedule);
                    if (cob && st) {
                      setSchedMessage(`Prezado(a) ${st.parentName || "Responsável"}, lembramos que a cobrança referente a "${cob.title}" de ${st.name} (no valor de R$ ${cob.amount.toFixed(2)}) vence em ${cob.dueDate}. Clique para gerar seu código PIX.`);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
                >
                  <option value="">Nenhuma (Notificação Geral de Inadimplência)</option>
                  {cobrancas.map(cob => (
                    <option key={cob.id} value={cob.id}>
                      {cob.title} — R$ {cob.amount.toFixed(2)} (Venc: {cob.dueDate}) [{cob.status.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                    Data do Disparo
                  </label>
                  <input
                    type="date"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                    Horário
                  </label>
                  <input
                    type="time"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Frequência / Recorrência da Cobrança */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block flex items-center justify-between">
                  <span>Frequência da Automação ERP</span>
                  <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {schedRecurrence === "diario" ? "Diário (24h)" : schedRecurrence === "semanal" ? "Semanal (7d)" : schedRecurrence === "quinzenal" ? "Quinzenal (15d)" : "Disparo Único"}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "unico", label: "Único", sub: "1 disparo" },
                    { id: "diario", label: "Diário", sub: "a cada 24h" },
                    { id: "semanal", label: "Semanal", sub: "a cada 7d" },
                    { id: "quinzenal", label: "Quinzenal", sub: "a cada 15d" },
                  ].map(f => {
                    const isSel = schedRecurrence === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSchedRecurrence(f.id as any)}
                        className={`p-2 rounded-xl border text-[10px] cursor-pointer flex flex-col items-center gap-0.5 transition-all ${
                          isSel
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-black shadow-2xs"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        <span className="font-bold">{f.label}</span>
                        <span className="text-[8px] opacity-75 font-mono">{f.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channel choice */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                  Canal de Notificação
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                    { id: "email", label: "E-mail", icon: Mail },
                    { id: "sms", label: "SMS", icon: Smartphone },
                    { id: "ambos", label: "Todos", icon: Zap }
                  ].map(ch => {
                    const Icon = ch.icon;
                    const isSel = schedChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setSchedChannel(ch.id as any)}
                        className={`p-2 rounded-xl border text-[10px] font-extrabold cursor-pointer flex flex-col items-center gap-1 transition-all ${
                          isSel 
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Message */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">
                  Mensagem Personalizada do Agendamento
                </label>
                <textarea
                  rows={3}
                  value={schedMessage}
                  onChange={(e) => setSchedMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans text-[11px]"
                  placeholder="Escreva a mensagem do lembrete..."
                  required
                />
              </div>

              {/* Validation / Compliance Notice */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center justify-between gap-2 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Régua Global: <strong>{syncValidation.globalLabel}</strong></span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                  syncValidation.status === "synced"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                }`}>
                  {syncValidation.status === "synced" ? "✓ Em Conformidade" : "⚠️ Requer Alinhamento"}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm transition-all flex items-center gap-1"
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>Confirmar Agendamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
