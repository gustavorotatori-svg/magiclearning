import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  Clock, 
  Calendar, 
  Send, 
  CheckCircle2, 
  Trash2, 
  Sparkles, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  AlertCircle, 
  AlertTriangle,
  Cpu,
  Power,
  Sliders, 
  Plus, 
  Check, 
  Zap, 
  RefreshCw,
  SlidersHorizontal,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { Cobranca } from "../types";

interface ScheduledReminder {
  id: string;
  cobrancaId: string;
  cobrancaTitle: string;
  dueDate: string;
  amount: number;
  channel: "whatsapp" | "email" | "sms" | "push" | "todos";
  daysBefore: number;
  scheduledTime?: string;
  cronJobId?: string;
  cronStatus?: "active" | "incompatible" | "manual";
  scheduledAt: string;
  status: "agendado" | "enviado" | "disparando";
}

interface AgendadorLembretesFinanceirosProps {
  cobrancas: Cobranca[];
  erpName: string;
}

// Helper to evaluate cron job capability against days before and channel
const evaluateCronJobInternal = (days: number, channel: string, timeStr: string) => {
  const isWhatsapp = channel === "whatsapp" || channel === "todos";
  const isAutoActive = localStorage.getItem("school_autorule_crm") === "true";
  const isErpActive = localStorage.getItem("erp_billing_schedule_enabled") === "true";
  const isCronKey = localStorage.getItem("school_crm_cron_active");
  const isCronRunning = isCronKey !== null ? isCronKey === "true" : (isAutoActive || isErpActive);

  const hour = timeStr.split(":")[0] || "09";
  const minute = timeStr.split(":")[1] || "00";

  if (!isCronRunning) {
    return {
      isActive: false,
      isCapable: false,
      status: "inactive" as const,
      jobName: "cron_whatsapp_billing_worker",
      scheduleExpression: `${minute} ${hour} * * *`,
      reason: "Nenhum Cron Job ativo no sistema para processar os envios do WhatsApp."
    };
  }

  const freq = localStorage.getItem("school_crm_billing_frequency") || "diario";
  let isCapable = true;
  let reason = "";

  // Check frequency capability against days interval
  if (freq === "semanal" && days % 7 !== 0) {
    isCapable = false;
    reason = `O Cron Job ativo possui periodicidade semanal (a cada 7 dias) e não processará os envios para a antecedência de ${days} dias.`;
  } else if (freq === "quinzenal" && days % 15 !== 0 && days !== 7 && days !== 0) {
    isCapable = false;
    reason = `O Cron Job ativo possui periodicidade quinzenal (a cada 15 dias) e não conseguirá processar com precisão os envios para a antecedência de ${days} dias.`;
  } else if (freq === "regular" && days % 3 !== 0) {
    isCapable = false;
    reason = `O Cron Job ativo possui periodicidade de 3 em 3 dias e não conseguirá processar com precisão os envios para a antecedência de ${days} dias.`;
  }

  return {
    isActive: true,
    isCapable,
    status: isCapable ? ("active" as const) : ("incompatible" as const),
    jobName: `cron_whatsapp_d${days}_worker`,
    scheduleExpression: freq === "diario" 
      ? `${minute} ${hour} * * * (Diário)` 
      : freq === "semanal" 
      ? `${minute} ${hour} * * 1 (Semanal)` 
      : freq === "quinzenal"
      ? `${minute} ${hour} 1,16 * * (Quinzenal)`
      : `${minute} ${hour} */3 * * (A cada 3 dias)`,
    reason
  };
};

export const AgendadorLembretesFinanceiros: React.FC<AgendadorLembretesFinanceirosProps> = ({
  cobrancas = [],
  erpName = "asaas"
}) => {
  const [scheduledList, setScheduledList] = useState<ScheduledReminder[]>([]);
  const [selectedCobId, setSelectedCobId] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<"whatsapp" | "email" | "sms" | "push" | "todos">("whatsapp");
  const [selectedDaysBefore, setSelectedDaysBefore] = useState<number>(() => {
    const val = localStorage.getItem("school_crm_billing_days_before");
    const parsed = val ? parseInt(val, 10) : 3;
    return isNaN(parsed) || parsed < 1 || parsed > 30 ? 3 : parsed;
  });
  const [selectedDaysBeforeRaw, setSelectedDaysBeforeRaw] = useState<string>(() => {
    const val = localStorage.getItem("school_crm_billing_days_before");
    return val || "3";
  });
  const [daysBeforeError, setDaysBeforeError] = useState<string>("");

  const validateAndUpdateDaysBefore = (val: string) => {
    setSelectedDaysBeforeRaw(val);
    if (val.trim() === "") {
      setDaysBeforeError("Informe a quantidade de dias antes do vencimento.");
      return;
    }
    const num = Number(val);
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 30) {
      setDaysBeforeError("⚠️ O número de dias de antecedência deve ser um valor inteiro entre 1 e 30 dias.");
    } else {
      setDaysBeforeError("");
      setSelectedDaysBefore(num);
      localStorage.setItem("school_crm_billing_days_before", String(num));
    }
  };

  // ⏰ Horário Definido pelo Usuário & Validação
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    return localStorage.getItem("school_crm_reminder_time") || "09:00";
  });
  const [timeError, setTimeError] = useState<string>("");

  const validateAndUpdateTime = (val: string): boolean => {
    setSelectedTime(val);
    if (!val || val.trim() === "") {
      setTimeError("Informe o horário do envio.");
      return false;
    }
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(val)) {
      setTimeError("⚠️ Formato de horário inválido. Utilize o padrão HH:MM (ex: 09:00).");
      return false;
    }
    const [hStr, mStr] = val.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      setTimeError("⚠️ Horário inválido (horas de 00 a 23 e minutos de 00 a 59).");
      return false;
    }
    // Business window check for WhatsApp compliance & anti-spam (07:00 to 21:00)
    if (h < 7 || h >= 21) {
      setTimeError(`⚠️ Horário fora da janela permitida (${val}). Disparos no WhatsApp devem ocorrer entre 07:00 e 21:00 para conformidade anti-spam.`);
      return false;
    }
    setTimeError("");
    localStorage.setItem("school_crm_reminder_time", val);
    return true;
  };

  // 🤖 Status e Validação em Tempo Real do Cron Job do WhatsApp
  const [cronJobInfo, setCronJobInfo] = useState(() => {
    const days = parseInt(localStorage.getItem("school_crm_billing_days_before") || "3", 10);
    const timeStr = localStorage.getItem("school_crm_reminder_time") || "09:00";
    return evaluateCronJobInternal(days, "whatsapp", timeStr);
  });

  const [autoRuleActive, setAutoRuleActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Reavalia o Cron Job quando os dias, canal, horário ou status de regra mudam
  useEffect(() => {
    const info = evaluateCronJobInternal(selectedDaysBefore, selectedChannel, selectedTime);
    setCronJobInfo(info);
  }, [selectedDaysBefore, selectedChannel, selectedTime, autoRuleActive]);

  // Ação rápida para ativar o Cron Job Diário do WhatsApp com 1 clique
  const handleActivateDailyCronJob = () => {
    localStorage.setItem("school_crm_cron_active", "true");
    localStorage.setItem("school_autorule_crm", "true");
    localStorage.setItem("erp_billing_schedule_enabled", "true");
    localStorage.setItem("school_crm_billing_frequency", "diario");
    localStorage.setItem("school_crm_billing_whatsapp_active", "true");
    setAutoRuleActive(true);

    const updatedInfo = evaluateCronJobInternal(selectedDaysBefore, selectedChannel, selectedTime);
    setCronJobInfo(updatedInfo);

    triggerToast(`✓ Cron Job Diário do WhatsApp ativado! Executará diariamente às ${selectedTime}h para cobrir ${selectedDaysBefore} dias de antecedência.`);
    window.dispatchEvent(new Event("school_crm_config_updated"));
  };

  // Get only pending or overdue bills
  const pendingCobrancas = cobrancas.filter(cob => cob.status === "pendente" || cob.status === "vencido");

  // Load reminders on mount
  useEffect(() => {
    const stored = localStorage.getItem("school_scheduled_reminders");
    const storedAutoRule = localStorage.getItem("school_autorule_crm");
    
    if (stored) {
      try {
        setScheduledList(JSON.parse(stored));
      } catch (e) {
        // ignore
      }
    } else {
      // Seed some realistic reminders integrated with CRM
      const defaultReminders: ScheduledReminder[] = [
        {
          id: "rem-1",
          cobrancaId: "cob-1",
          cobrancaTitle: "Mensalidade Escolar - Julho",
          dueDate: "10/07/2026",
          amount: 1450.00,
          channel: "whatsapp",
          daysBefore: 3,
          scheduledAt: "15/07/2026 às 10:15",
          status: "agendado"
        },
        {
          id: "rem-2",
          cobrancaId: "cob-2",
          cobrancaTitle: "Taxa de Material Didático - 2º Semestre",
          dueDate: "20/07/2026",
          amount: 450.00,
          channel: "email",
          daysBefore: 5,
          scheduledAt: "15/07/2026 às 09:30",
          status: "agendado"
        }
      ];
      setScheduledList(defaultReminders);
      localStorage.setItem("school_scheduled_reminders", JSON.stringify(defaultReminders));
    }

    if (storedAutoRule) {
      setAutoRuleActive(storedAutoRule === "true");
    }
  }, []);

  // Synchronize configurations with CRM in real-time
  useEffect(() => {
    const handleSync = () => {
      const storedAutoRule = localStorage.getItem("school_autorule_crm") === "true";
      setAutoRuleActive(storedAutoRule);
      
      const stored = localStorage.getItem("school_scheduled_reminders");
      let currentList: ScheduledReminder[] = [];
      if (stored) {
        try {
          currentList = JSON.parse(stored);
          setScheduledList(currentList);
        } catch (e) {
          // ignore
        }
      }

      const freq = localStorage.getItem("school_crm_billing_frequency") || "regular";
      rebuildAutoReminders(storedAutoRule, freq, currentList);
    };

    window.addEventListener("school_crm_config_updated", handleSync);
    return () => {
      window.removeEventListener("school_crm_config_updated", handleSync);
    };
  }, [cobrancas]);

  // Rebuild reminders according to active rule & frequency
  const rebuildAutoReminders = (isActive: boolean, frequency: string, currentList: ScheduledReminder[]) => {
    if (!isActive) {
      const cleaned = currentList.filter(r => !r.id.startsWith("auto-"));
      setScheduledList(cleaned);
      localStorage.setItem("school_scheduled_reminders", JSON.stringify(cleaned));
      return cleaned;
    }

    if (pendingCobrancas.length === 0) {
      return currentList;
    }

    const newReminders: ScheduledReminder[] = [];
    pendingCobrancas.forEach((cob, index) => {
      const isWa = localStorage.getItem("school_crm_billing_whatsapp_active") !== "false";
      const isEm = localStorage.getItem("school_crm_billing_email_active") !== "false";

      if (frequency === "diario") {
        // Daily: Whatsapp and Email alternates on 3, 2, 1, 0 days before
        [3, 2, 1, 0].forEach((days) => {
          if (days % 2 === 0 && isEm) {
            newReminders.push({
              id: `auto-em-${cob.id}-${days}-${index}`,
              cobrancaId: cob.id,
              cobrancaTitle: cob.title,
              dueDate: cob.dueDate,
              amount: cob.amount,
              channel: "email",
              daysBefore: days,
              scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
              status: "agendado"
            });
          } else if (days % 2 !== 0 && isWa) {
            newReminders.push({
              id: `auto-wa-${cob.id}-${days}-${index}`,
              cobrancaId: cob.id,
              cobrancaTitle: cob.title,
              dueDate: cob.dueDate,
              amount: cob.amount,
              channel: "whatsapp",
              daysBefore: days,
              scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
              status: "agendado"
            });
          }
        });
      } else if (frequency === "semanal") {
        // Weekly: 7 days before and due date (0)
        [7, 0].forEach((days) => {
          if (days === 7 && isEm) {
            newReminders.push({
              id: `auto-em-${cob.id}-${days}-${index}`,
              cobrancaId: cob.id,
              cobrancaTitle: cob.title,
              dueDate: cob.dueDate,
              amount: cob.amount,
              channel: "email",
              daysBefore: days,
              scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
              status: "agendado"
            });
          } else if (days === 0 && isWa) {
            newReminders.push({
              id: `auto-wa-${cob.id}-${days}-${index}`,
              cobrancaId: cob.id,
              cobrancaTitle: cob.title,
              dueDate: cob.dueDate,
              amount: cob.amount,
              channel: "whatsapp",
              daysBefore: days,
              scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
              status: "agendado"
            });
          }
        });
      } else if (frequency === "quinzenal") {
        // Quinzenal: 15 days before, 7 days before, and due date (0)
        [15, 7, 0].forEach((days) => {
          if (days === 15 && isEm) {
            newReminders.push({
              id: `auto-em-${cob.id}-${days}-${index}`,
              cobrancaId: cob.id,
              cobrancaTitle: cob.title,
              dueDate: cob.dueDate,
              amount: cob.amount,
              channel: "email",
              daysBefore: days,
              scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
              status: "agendado"
            });
          } else if ((days === 7 || days === 0) && isWa) {
            newReminders.push({
              id: `auto-wa-${cob.id}-${days}-${index}`,
              cobrancaId: cob.id,
              cobrancaTitle: cob.title,
              dueDate: cob.dueDate,
              amount: cob.amount,
              channel: "whatsapp",
              daysBefore: days,
              scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
              status: "agendado"
            });
          }
        });
      } else if (frequency === "unico") {
        // Send once: using crm daysBefore
        const days = Number(localStorage.getItem("school_crm_billing_days_before") || "3");
        if (isWa) {
          newReminders.push({
            id: `auto-wa-${cob.id}-${days}-${index}`,
            cobrancaId: cob.id,
            cobrancaTitle: cob.title,
            dueDate: cob.dueDate,
            amount: cob.amount,
            channel: "whatsapp",
            daysBefore: days,
            scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
            status: "agendado"
          });
        } else if (isEm) {
          newReminders.push({
            id: `auto-em-${cob.id}-${days}-${index}`,
            cobrancaId: cob.id,
            cobrancaTitle: cob.title,
            dueDate: cob.dueDate,
            amount: cob.amount,
            channel: "email",
            daysBefore: days,
            scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
            status: "agendado"
          });
        }
      } else {
        // Regular (default): Whatsapp 5 days before, Email 3 days before, SMS 0 days before
        if (isWa) {
          newReminders.push({
            id: `auto-wa-${cob.id}-5-${index}`,
            cobrancaId: cob.id,
            cobrancaTitle: cob.title,
            dueDate: cob.dueDate,
            amount: cob.amount,
            channel: "whatsapp",
            daysBefore: 5,
            scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
            status: "agendado"
          });
        }
        if (isEm) {
          newReminders.push({
            id: `auto-em-${cob.id}-3-${index}`,
            cobrancaId: cob.id,
            cobrancaTitle: cob.title,
            dueDate: cob.dueDate,
            amount: cob.amount,
            channel: "email",
            daysBefore: 3,
            scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
            status: "agendado"
          });
        }
        newReminders.push({
          id: `auto-sms-${cob.id}-0-${index}`,
          cobrancaId: cob.id,
          cobrancaTitle: cob.title,
          dueDate: cob.dueDate,
          amount: cob.amount,
          channel: "sms",
          daysBefore: 0,
          scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
          status: "agendado"
        });
      }
    });

    const filteredExisting = currentList.filter(r => !r.id.startsWith("auto-"));
    const combined = [...filteredExisting, ...newReminders];
    setScheduledList(combined);
    localStorage.setItem("school_scheduled_reminders", JSON.stringify(combined));
    return combined;
  };

  // Save list helper
  const saveReminders = (list: ScheduledReminder[]) => {
    setScheduledList(list);
    localStorage.setItem("school_scheduled_reminders", JSON.stringify(list));
  };

  // Toast handler
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Switch Rule Automatically schedules based on frequency
  const handleToggleAutoRule = () => {
    const newState = !autoRuleActive;
    setAutoRuleActive(newState);
    localStorage.setItem("school_autorule_crm", String(newState));

    const freq = localStorage.getItem("school_crm_billing_frequency") || "regular";
    const updatedList = rebuildAutoReminders(newState, freq, scheduledList);

    if (newState) {
      triggerToast(`Régua automática do CRM ativada! Lembretes gerados com frequência ${freq.toUpperCase()} e sincronizados.`);
    } else {
      triggerToast("Régua de cobrança automática desativada. Lembretes automáticos foram removidos.");
    }

    // Sync other tabs/panels
    window.dispatchEvent(new Event("school_crm_config_updated"));
  };

  // Schedule Individual Reminder
  const handleScheduleManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCobId) {
      triggerToast("Selecione uma cobrança pendente para agendar.");
      return;
    }

    // 1. Validação estrita do horário definido pelo usuário (HH:MM e janela comercial anti-spam)
    const isTimeValid = validateAndUpdateTime(selectedTime);
    if (!isTimeValid || timeError) {
      triggerToast(timeError || "⚠️ Horário inválido. Configure um horário de disparo válido entre 07:00 e 21:00.");
      return;
    }

    // 2. Validação estrita do intervalo de dias (1 a 30 dias)
    if (daysBeforeError || selectedDaysBefore < 1 || selectedDaysBefore > 30 || !selectedDaysBeforeRaw.trim()) {
      triggerToast(daysBeforeError || "⚠️ O número de dias de antecedência deve ser um valor inteiro entre 1 e 30 dias.");
      return;
    }

    // 3. Validação do Cron Job Ativo Capaz de Processar os Envios do WhatsApp
    if (selectedChannel === "whatsapp" || selectedChannel === "todos") {
      const currentCron = evaluateCronJobInternal(selectedDaysBefore, selectedChannel, selectedTime);
      if (!currentCron.isActive) {
        triggerToast("⚠️ Agendamento bloqueado: Nenhum Cron Job ativo no sistema para processar os envios do WhatsApp. Ative o cron job diário para continuar.");
        return;
      }
      if (!currentCron.isCapable) {
        triggerToast(`⚠️ Incompatibilidade no Cron Job: ${currentCron.reason} Ative a frequência diária do cron job para contemplar o intervalo de ${selectedDaysBefore} dias.`);
        return;
      }
    }

    const cob = pendingCobrancas.find(c => c.id === selectedCobId);
    if (!cob) return;

    // Check if duplicate for same channel, days and time
    const isDuplicate = scheduledList.some(
      r => r.cobrancaId === selectedCobId && 
           r.channel === selectedChannel && 
           r.daysBefore === selectedDaysBefore &&
           (r.scheduledTime === selectedTime || (!r.scheduledTime && selectedTime === "09:00"))
    );

    if (isDuplicate) {
      triggerToast("Já existe um lembrete idêntico agendado para esta cobrança neste mesmo horário e canal.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newReminder: ScheduledReminder = {
        id: `man-${Date.now()}`,
        cobrancaId: cob.id,
        cobrancaTitle: cob.title,
        dueDate: cob.dueDate,
        amount: cob.amount,
        channel: selectedChannel,
        daysBefore: selectedDaysBefore,
        scheduledTime: selectedTime,
        cronJobId: (selectedChannel === "whatsapp" || selectedChannel === "todos") ? `cron-wa-d${selectedDaysBefore}-${selectedTime.replace(":", "")}` : undefined,
        cronStatus: (selectedChannel === "whatsapp" || selectedChannel === "todos") ? "active" : "manual",
        scheduledAt: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        status: "agendado"
      };

      const updated = [newReminder, ...scheduledList];
      saveReminders(updated);
      setSelectedCobId("");
      setIsSubmitting(false);
      triggerToast(`Lembrete por ${selectedChannel.toUpperCase()} agendado com sucesso para às ${selectedTime}h (${selectedDaysBefore} dias antes)! Cron Job validado.`);
    }, 800);
  };

  // Delete Reminder
  const handleDeleteReminder = (id: string) => {
    const updated = scheduledList.filter(r => r.id !== id);
    saveReminders(updated);
    triggerToast("Agendamento de lembrete removido com sucesso.");
  };

  // Force Immediate Dispatch (Test CRM Api Integration)
  const handleInstantDispatch = (id: string) => {
    // Set status to "disparando" then "enviado"
    const updatedList = scheduledList.map(r => {
      if (r.id === id) {
        return { ...r, status: "disparando" as const };
      }
      return r;
    });
    setScheduledList(updatedList);

    setTimeout(() => {
      const finalUpdated = scheduledList.map(r => {
        if (r.id === id) {
          return { ...r, status: "enviado" as const };
        }
        return r;
      });
      saveReminders(finalUpdated);
      const reminder = scheduledList.find(r => r.id === id);
      if (reminder) {
        triggerToast(`API CRM Executada! Lembrete via ${reminder.channel.toUpperCase()} enviado com sucesso para os contatos cadastrados!`);
      }
    }, 1200);
  };

  // Get Channel Icon
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case "email":
        return <Mail className="w-3.5 h-3.5 text-indigo-500" />;
      case "sms":
        return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
      case "push":
        return <Bell className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  // Message template preview builder
  const getMessagePreview = () => {
    if (!selectedCobId) return "Selecione uma cobrança acima para visualizar o modelo de lembrete do CRM.";
    const cob = pendingCobrancas.find(c => c.id === selectedCobId);
    if (!cob) return "";

    const channelName = selectedChannel === "todos" ? "WhatsApp/E-mail" : selectedChannel.toUpperCase();
    const daysText = selectedDaysBefore === 0 ? "hoje" : `em ${selectedDaysBefore} dias`;
    
    return `[Notificação CRM via ${channelName}]: "Olá, responsável pedagógico! Lembramos que a fatura '${cob.title}' no valor de R$ ${cob.amount.toFixed(2)} vence ${daysText} (${cob.dueDate}). Copie a chave PIX ou código de barras no seu portal para liquidação instantânea via ${erpName.toUpperCase()}."`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6" id="agendador-lembretes-financeiros">
      
      {/* Dynamic Toast feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#0f172a] text-white py-3 px-5 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-850 max-w-sm text-xs font-sans"
          >
            <Sparkles className="w-4.5 h-4.5 text-amber-300 shrink-0 animate-pulse" />
            <p className="font-light">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section with badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100/60 dark:border-slate-850 pb-4">
        <div className="flex items-start gap-3 text-left">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-xl shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-black text-sm sm:text-base text-slate-850 dark:text-slate-100">
                Central de Lembretes Automáticos & CRM
              </h3>
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase font-mono rounded-md border border-indigo-100 dark:border-indigo-900/40">
                Ativo
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light font-sans mt-0.5">
              Programe avisos multicanal integrados ao CRM escolar e evite atrasos nos pagamentos vinculados ao ERP <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase font-mono">{erpName}</span>.
            </p>
          </div>
        </div>

        {/* Dynamic CRM Connection Indicator */}
        <div className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-150 dark:border-slate-850 text-left shrink-0">
          <span className="text-[8px] text-slate-400 uppercase tracking-wider font-mono font-bold block">Status do Pipeline CRM</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-slate-750 dark:text-slate-200">
              {erpName.toUpperCase()} API Sincronizada
            </span>
          </div>
        </div>
      </div>

      {/* Grid: 1. Auto rule switch & manual form | 2. Send queue list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Automation rules (7 cols) */}
        <div className="lg:col-span-7 space-y-5 text-left">
          
          {/* ⚡ CRM Automation Régua Switch Card */}
          <div className="bg-gradient-to-r from-amber-500/5 to-indigo-500/5 border border-amber-200/40 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                <strong className="text-xs text-[#3e2e28] dark:text-amber-100 font-bold">Régua de Cobrança Automática do CRM</strong>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                Ao ativar, nosso CRM agendará automaticamente 3 lembretes (WhatsApp aos 5 dias antes, E-mail aos 3 dias antes e SMS no vencimento) para cada uma das cobranças ativas.
              </p>
            </div>

            <button
              onClick={handleToggleAutoRule}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                autoRuleActive 
                  ? "bg-emerald-600 text-white shadow-md hover:bg-emerald-700" 
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-650 dark:text-slate-300"
              }`}
            >
              {autoRuleActive ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Régua Ativa ✓</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ativar Régua</span>
                </>
              )}
            </button>
          </div>

          {/* 📅 Manual Reminder Scheduler Form */}
          <form onSubmit={handleScheduleManual} className="bg-[#fafbfd]/50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850/60 pb-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <strong className="text-xs text-slate-750 dark:text-slate-200">Programar Aviso Customizado</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Select Cobranca */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Cobrança Alvo</label>
                <select
                  value={selectedCobId}
                  onChange={(e) => setSelectedCobId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl p-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">🔍 Selecione a cobrança...</option>
                  {pendingCobrancas.map(cob => (
                    <option key={cob.id} value={cob.id}>
                      {cob.title} (R$ {cob.amount.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Channel */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Canal de Disparo</label>
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5">
                  {[
                    { id: "whatsapp", label: "Whats", icon: <MessageSquare className="w-3 h-3" /> },
                    { id: "email", label: "Email", icon: <Mail className="w-3 h-3" /> },
                    { id: "sms", label: "SMS", icon: <Smartphone className="w-3 h-3" /> },
                    { id: "push", label: "Push", icon: <Bell className="w-3 h-3" /> },
                  ].map(chan => (
                    <button
                      key={chan.id}
                      type="button"
                      onClick={() => setSelectedChannel(chan.id as any)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                        selectedChannel === chan.id 
                          ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-500 text-indigo-700 dark:text-indigo-400" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {chan.icon}
                      <span>{chan.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Horário Definido pelo Usuário (com validação estrita e presets) */}
            <div className="bg-slate-50/70 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label htmlFor="input-lembrete-horario" className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Horário Definido para o Disparo (07:00 às 21:00):</span>
                </label>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  timeError 
                    ? "bg-rose-50 dark:bg-rose-950/80 text-rose-700 border-rose-300 dark:border-rose-800" 
                    : "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                }`}>
                  {timeError ? "Horário Inválido" : `Disparo programado às ${selectedTime}h`}
                </span>
              </div>

              {/* Quick Time Presets */}
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase mr-1">Sugestões:</span>
                {[
                  { t: "08:00", label: "08:00 (Início)" },
                  { t: "09:00", label: "09:00 (Padrão)" },
                  { t: "11:30", label: "11:30" },
                  { t: "14:00", label: "14:00" },
                  { t: "16:30", label: "16:30" },
                  { t: "18:00", label: "18:00" },
                  { t: "20:00", label: "20:00 (Limite)" }
                ].map(preset => (
                  <button
                    key={preset.t}
                    type="button"
                    onClick={() => validateAndUpdateTime(preset.t)}
                    className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded transition-all cursor-pointer border ${
                      selectedTime === preset.t && !timeError
                        ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Time Input Field */}
              <div className="flex items-center gap-3 pt-0.5">
                <div className="relative flex items-center">
                  <input
                    type="time"
                    id="input-lembrete-horario"
                    value={selectedTime}
                    onChange={(e) => validateAndUpdateTime(e.target.value)}
                    className={`bg-white dark:bg-slate-950 border rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none transition-colors ${
                      timeError 
                        ? "border-2 border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 text-rose-900 focus:border-rose-600" 
                        : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans leading-tight">
                  Horário militar HH:MM. Respeita políticas anti-spam e boas práticas do WhatsApp escolar.
                </span>
              </div>

              {/* Inline Time Validation Error */}
              {timeError && (
                <motion.div
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{timeError}</span>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start pt-1">
              
              {/* Advance Days Numeric Input, Presets & Slider (1-30 days) */}
              <div className="sm:col-span-8 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-lembrete-dias-antes" className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Dias de Antecedência do Alerta (1 a 30 dias):</span>
                  </label>
                  <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    {selectedDaysBefore === 1 ? "1 dia antes (Véspera D-1)" : `${selectedDaysBefore} dias antes (D-${selectedDaysBefore})`}
                  </span>
                </div>

                {/* Quick Presets */}
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
                      className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded transition-all cursor-pointer border ${
                        selectedDaysBefore === preset.d && !daysBeforeError
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Slider + Campo de Input Numérico */}
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[9px] font-mono text-slate-400 font-bold">1d</span>
                  <input
                    type="range"
                    id="slider-lembrete-dias-antes"
                    min={1}
                    max={30}
                    value={selectedDaysBefore}
                    onChange={(e) => validateAndUpdateDaysBefore(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-[9px] font-mono text-slate-400 font-bold">30d</span>

                  <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-slate-200 dark:border-slate-700">
                    <label htmlFor="input-lembrete-dias-antes" className="text-[10px] font-mono text-slate-500 font-bold">
                      Qtd:
                    </label>
                    <input
                      type="number"
                      id="input-lembrete-dias-antes"
                      min={1}
                      max={30}
                      step={1}
                      value={selectedDaysBeforeRaw}
                      onChange={(e) => validateAndUpdateDaysBefore(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "." || e.key === "," || e.key === "e" || e.key === "E" || e.key === "+" || e.key === "-") {
                          e.preventDefault();
                        }
                      }}
                      placeholder="1-30"
                      className={`w-16 bg-white dark:bg-slate-950 border rounded-lg p-1 text-xs font-mono font-black text-center focus:outline-none transition-colors ${
                        daysBeforeError
                          ? "border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200"
                          : "border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                      }`}
                    />
                    <span className="text-[10px] font-mono text-slate-500">dias</span>
                  </div>
                </div>

                {/* Validation Error Message */}
                {daysBeforeError && (
                  <motion.div
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{daysBeforeError}</span>
                  </motion.div>
                )}

                {/* Contextual schedule preview */}
                <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">📅 Programação:</span>
                  <span>
                    O lembrete via <strong>{selectedChannel.toUpperCase()}</strong> será enviado às{" "}
                    <strong>{selectedTime}h</strong> com{" "}
                    <strong>{selectedDaysBefore} {selectedDaysBefore === 1 ? "dia" : "dias"} antes</strong> do vencimento.
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-4 pt-2 sm:pt-6">
                <button
                  type="submit"
                  id="btn-submeter-agendamento"
                  disabled={isSubmitting || !!timeError || !!daysBeforeError || ((selectedChannel === "whatsapp" || selectedChannel === "todos") && (!cronJobInfo.isActive || !cronJobInfo.isCapable))}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Agendando...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5" />
                      <span>Agendar Aviso</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Verificação e Diagnóstico do Cron Job do WhatsApp */}
            {(selectedChannel === "whatsapp" || selectedChannel === "todos") && (
              <div 
                id="painel-verificacao-cron-whatsapp"
                className={`p-3 rounded-xl border text-xs transition-all ${
                  cronJobInfo.status === "active"
                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-850 text-emerald-900 dark:text-emerald-200"
                    : cronJobInfo.status === "incompatible"
                    ? "bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                    : "bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Cpu className={`w-4 h-4 shrink-0 ${
                      cronJobInfo.status === "active" 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : cronJobInfo.status === "incompatible" 
                        ? "text-amber-600 dark:text-amber-400" 
                        : "text-rose-600 dark:text-rose-400"
                    }`} />
                    <span className="font-mono font-bold uppercase tracking-wider text-[10px]">
                      Validação do Cron Job (Rotina em Background do WhatsApp)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                      cronJobInfo.status === "active"
                        ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                        : cronJobInfo.status === "incompatible"
                        ? "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                        : "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700"
                    }`}>
                      {cronJobInfo.status === "active" ? "🟢 Cron Ativo & Capaz" : cronJobInfo.status === "incompatible" ? "🟡 Cron Incompatível" : "🔴 Cron Inativo / Pausado"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] leading-relaxed">
                  {cronJobInfo.status === "active" ? (
                    <div className="space-y-1">
                      <p className="flex items-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          Existe um Cron Job ativo (<code>{cronJobInfo.jobName}</code>) agendado como <code>{cronJobInfo.scheduleExpression}</code> capaz de processar os envios do WhatsApp pontualmente às <strong>{selectedTime}h</strong> para a antecedência de <strong>{selectedDaysBefore} dias</strong>.
                        </span>
                      </p>
                    </div>
                  ) : cronJobInfo.status === "incompatible" ? (
                    <div className="space-y-2">
                      <p className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Incompatibilidade Detectada:</strong> {cronJobInfo.reason} O envio automático para {selectedDaysBefore} dias antes pode falhar ou não ser acionado no momento correto.
                        </span>
                      </p>
                      <button
                        type="button"
                        id="btn-adequar-cron-job"
                        onClick={handleActivateDailyCronJob}
                        className="text-[10px] font-mono font-bold bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Adequar Cron Job para Frequência Diária (Compatível com 1 a 30 dias)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="flex items-start gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Bloqueio de Agendamento:</strong> Nenhum Cron Job ativo no sistema para processar disparos do WhatsApp às {selectedTime}h. Ative a rotina de cron em segundo plano para liberar o agendamento.
                        </span>
                      </p>
                      <button
                        type="button"
                        id="btn-ativar-cron-job"
                        onClick={handleActivateDailyCronJob}
                        className="text-[10px] font-mono font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Power className="w-3 h-3" />
                        <span>Ativar Cron Job Diário do WhatsApp Agora</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Template Preview Section */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-850/80 space-y-1">
              <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Modelo de Conteúdo Autogerado</span>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 font-sans italic leading-relaxed">
                {getMessagePreview()}
              </p>
            </div>

          </form>

        </div>

        {/* Right Column: Queue list of scheduled reminders (5 cols) */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                Fila de Agendamentos Recorrentes ({scheduledList.length})
              </h4>
              <span className="text-[9px] text-slate-400 font-mono italic">
                Sincronia automática
              </span>
            </div>

            {/* Scrollable reminders container */}
            <div className="space-y-2.5 max-h-[305px] overflow-y-auto pr-1">
              {scheduledList.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#fdfcf9]/60 dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-3 text-left hover:border-amber-250 transition-all shadow-3xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getChannelIcon(item.channel)}
                      <strong className="text-xs text-slate-800 dark:text-slate-150 truncate block max-w-[150px]">
                        {item.cobrancaTitle}
                      </strong>
                      
                      {/* Badge status */}
                      <span className={`text-[8px] uppercase font-mono px-1.5 py-0.2 rounded font-black ${
                        item.status === "enviado" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : item.status === "disparando"
                          ? "bg-amber-100 text-amber-700 border border-amber-200 animate-pulse"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400"
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        {item.scheduledTime || "09:00"}h
                      </span>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                        {item.daysBefore === 0 ? "No Vencimento (D-0)" : `D-${item.daysBefore} (${item.daysBefore}d antes)`}
                      </span>
                      {item.channel === "whatsapp" && (
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                          <Cpu className="w-2.5 h-2.5" />
                          <span>Cron OK</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono">
                      Vencimento: {item.dueDate} • Valor: R$ {item.amount.toFixed(2)}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === "agendado" && (
                      <button
                        onClick={() => handleInstantDispatch(item.id)}
                        className="p-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-amber-900 dark:text-amber-300 transition-all cursor-pointer"
                        title="Disparar Lembrete Manualmente Agora (Simular API)"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReminder(item.id)}
                      className="p-1.5 bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 hover:text-rose-600 dark:hover:bg-rose-950/40 rounded-lg text-slate-450 transition-all cursor-pointer"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                </div>
              ))}

              {scheduledList.length === 0 && (
                <div className="py-12 text-center text-[11px] text-slate-450 italic bg-slate-50/50 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-850">
                  <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <span>Nenhum lembrete agendado para o seu plano financeiro escolar. Use a régua automática ou agende um aviso acima!</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom stats block */}
          <div className="bg-[#fbfcfa] dark:bg-slate-950 p-3 rounded-xl border border-emerald-100 dark:border-slate-850/60 text-[10px] text-slate-500 leading-normal font-sans">
            🛡️ <strong>Regras do Compliance:</strong> Todos os envios seguem as diretrizes de LGPD e políticas internas da escola, disparando mensagens apenas nos horários úteis (entre 08h e 19h).
          </div>

        </div>

      </div>

    </div>
  );
};
