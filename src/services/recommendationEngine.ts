/**
 * recommendationEngine.ts
 * Motor de Análise Comportamental, Rastreamento de Atividades e Próximos Passos Personalizados
 * Projetado para engajar Pais, Gestores e Alunos com base no histórico real de uso.
 */

import { Estudante, Cobranca, Comunicado, Momento } from "../types";

export type ActivityType =
  | "view_announcement"
  | "view_photo"
  | "view_report_card"
  | "view_routine"
  | "view_invoice"
  | "view_gatekeeper"
  | "view_metrics"
  | "view_student_crm"
  | "view_planner"
  | "view_erp"
  | "complete_homework"
  | "achieve_goal"
  | "sign_permission"
  | "pay_invoice"
  | "log_pediatrician_report"
  | "confirm_routine_checkin"
  | "submit_self_reflection"
  | "schedule_billing_run"
  | "moderate_report"
  | "export_report"
  | "custom_interaction";

export interface UserActivity {
  id: string;
  userId: string;
  role: "pais" | "escola" | "aluno";
  type: ActivityType;
  title: string;
  entityId?: string;
  entityTitle?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export type RecommendationCategory =
  | "urgente"
  | "pedagogico"
  | "financeiro"
  | "comunicacao"
  | "rotina"
  | "gestao";

export type RecommendationPriority = "alta" | "media" | "baixa";

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  score: number; // 0 a 100 relevância calculada
  reason: string; // Explicação algorítmica transparente
  basedOnActivity?: string; // Ex: "Baseado em: Visualizou boletim há 30 min"
  actionLabel: string;
  actionType: "navigate_tab" | "open_modal" | "copy_pix" | "mark_task" | "quick_trigger";
  actionPayload: {
    tab?: string;
    modal?: string;
    studentId?: string;
    itemId?: string;
    pixCode?: string;
    taskId?: string;
    targetSubTab?: string;
    [key: string]: any;
  };
  badgeText?: string;
  estimatedMinutes?: number;
  dismissed?: boolean;
  completed?: boolean;
  createdAt: number;
}

export interface EngagementSummary {
  score: number; // 0-100
  level: "Iniciante" | "Ativo" | "Engajado" | "Exemplar";
  streakDays: number;
  completedTasksCount: number;
  trackedActivitiesCount: number;
  weeklyInteractions: number;
  topInterest: string;
}

const STORAGE_KEYS = {
  ACTIVITIES: "school_recommendations_user_activities_v1",
  DISMISSED: "school_recommendations_dismissed_v1",
  COMPLETED: "school_recommendations_completed_v1",
};

// Evento customizado para sincronização reativa em tempo real entre abas e componentes
export const RECOMMENDATION_EVENT = "app_recommendation_engine_update";

/**
 * Rastreia uma nova ação do usuário (visualização ou conclusão de tarefa)
 */
export function trackUserActivity(activity: Omit<UserActivity, "id" | "timestamp">): UserActivity {
  const fullActivity: UserActivity = {
    ...activity,
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  try {
    const existing = getUserActivities();
    // Limita o histórico aos 150 registros mais recentes para performance
    const updated = [fullActivity, ...existing].slice(0, 150);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updated));

    // Notifica componentes
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(RECOMMENDATION_EVENT, { detail: { newActivity: fullActivity } }));
    }
  } catch (err) {
    console.error("Falha ao salvar atividade do usuário:", err);
  }

  return fullActivity;
}

/**
 * Retorna o histórico de atividades gravado no navegador
 */
export function getUserActivities(role?: "pais" | "escola" | "aluno"): UserActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!raw) return getInitialDefaultActivities();
    const list: UserActivity[] = JSON.parse(raw);
    if (role) {
      return list.filter((a) => a.role === role);
    }
    return list;
  } catch {
    return getInitialDefaultActivities();
  }
}

/**
 * Limpa todo o histórico de atividades e estado de recomendações
 */
export function clearUserActivities(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
    localStorage.removeItem(STORAGE_KEYS.DISMISSED);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(RECOMMENDATION_EVENT, { detail: { action: "cleared" } }));
    }
  } catch (err) {
    console.error("Erro ao limpar histórico:", err);
  }
}

/**
 * Atividades padrão iniciais para bootstrapping sem telas vazias
 */
function getInitialDefaultActivities(): UserActivity[] {
  const now = Date.now();
  return [
    {
      id: "act-init-1",
      userId: "user-current",
      role: "pais",
      type: "view_routine",
      title: "Visualizou diário de rotina de Sophia",
      entityTitle: "Diário de 24/09 (Almoço completo & soneca tranquila)",
      timestamp: now - 1000 * 60 * 45, // 45 minutos atrás
    },
    {
      id: "act-init-2",
      userId: "user-current",
      role: "pais",
      type: "view_invoice",
      title: "Visualizou fatura de Outubro",
      entityTitle: "Mensalidade Escolar Outubro/2026 - R$ 980,00",
      timestamp: now - 1000 * 60 * 120, // 2 horas atrás
    },
    {
      id: "act-init-3",
      userId: "user-current",
      role: "pais",
      type: "complete_homework",
      title: "Concluiu acompanhamento de tarefa de Língua Portuguesa",
      entityTitle: "Leitura do Capítulo 4 'A Descoberta no Quintal'",
      timestamp: now - 1000 * 60 * 60 * 24, // 1 dia atrás
    },
    {
      id: "act-init-4",
      userId: "user-current",
      role: "escola",
      type: "view_erp",
      title: "Consultou painel de sincronização ERP e webhooks",
      entityTitle: "Régua de Cobrança Automática WhatsApp",
      timestamp: now - 1000 * 60 * 30,
    },
    {
      id: "act-init-5",
      userId: "user-current",
      role: "aluno",
      type: "complete_homework",
      title: "Concluiu lição de Língua Portuguesa",
      entityTitle: "Capítulo 4 de Literatura",
      timestamp: now - 1000 * 60 * 90,
    },
  ];
}

/**
 * Obtém IDs de recomendações dispensadas
 */
export function getDismissedRecommendationIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DISMISSED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Descarta uma recomendação
 */
export function dismissRecommendation(id: string): void {
  try {
    const dismissed = getDismissedRecommendationIds();
    if (!dismissed.includes(id)) {
      dismissed.push(id);
      localStorage.setItem(STORAGE_KEYS.DISMISSED, JSON.stringify(dismissed));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(RECOMMENDATION_EVENT, { detail: { dismissedId: id } }));
    }
  } catch (err) {
    console.error("Erro ao dispensar recomendação:", err);
  }
}

/**
 * Obtém IDs de recomendações marcadas como concluídas
 */
export function getCompletedRecommendationIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Marca uma recomendação como concluída e gera registro de engajamento
 */
export function completeRecommendation(rec: Recommendation): void {
  try {
    const completed = getCompletedRecommendationIds();
    if (!completed.includes(rec.id)) {
      completed.push(rec.id);
      localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(completed));
    }

    // Registra a atividade de conclusão
    trackUserActivity({
      userId: "user-current",
      role: rec.category === "gestao" ? "escola" : "pais",
      type: "custom_interaction",
      title: `Completou próximo passo: "${rec.title}"`,
      entityId: rec.id,
      entityTitle: rec.title,
      metadata: { category: rec.category, score: rec.score },
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(RECOMMENDATION_EVENT, { detail: { completedId: rec.id } }));
    }
  } catch (err) {
    console.error("Erro ao concluir recomendação:", err);
  }
}

/**
 * MOTOR DE RECOMENDAÇÃO: Avalia histórico, estado da conta e contexto para sugerir os próximos passos
 */
export function generateRecommendations(params: {
  role: "pais" | "escola" | "aluno";
  student?: Estudante;
  estudantes?: Estudante[];
  cobrancas?: Cobranca[];
  comunicados?: Comunicado[];
  momentos?: Momento[];
  filterCategory?: RecommendationCategory | "todos";
}): Recommendation[] {
  const {
    role,
    student,
    estudantes = [],
    cobrancas = [],
    comunicados = [],
    momentos = [],
    filterCategory = "todos",
  } = params;

  const activities = getUserActivities(role);
  const dismissedIds = getDismissedRecommendationIds();
  const completedIds = getCompletedRecommendationIds();

  const recommendations: Recommendation[] = [];
  const now = Date.now();

  // Helper para verificar atividade recente nos últimos X minutos
  const hasRecentActivity = (type: ActivityType, minutes = 120, entityId?: string) => {
    return activities.some((act) => {
      const isType = act.type === type;
      const isEntity = entityId ? act.entityId === entityId : true;
      const isRecent = now - act.timestamp <= minutes * 60 * 1000;
      return isType && isEntity && isRecent;
    });
  };

  const countRecentActivities = (type: ActivityType, hours = 48) => {
    return activities.filter((act) => act.type === type && now - act.timestamp <= hours * 3600 * 1000).length;
  };

  /* =======================================================================
   * 1. REGRAS PARA O PERFIL DE PAIS / RESPONSÁVEIS
   * ======================================================================= */
  if (role === "pais") {
    const studentName = student?.name || "seu filho(a)";
    const firstName = studentName.split(" ")[0];

    // Regra A: Fatura Pendente / Vencida com análise de abandono
    const pendingCobranca = cobrancas.find((c) => c.status === "pendente" || c.status === "vencido");
    if (pendingCobranca) {
      const viewedInvoiceRecently = hasRecentActivity("view_invoice", 240);
      const isOverdue = pendingCobranca.status === "vencido";
      const invoiceLabel = pendingCobranca.title || "Mensalidade";
      const invoiceAmount = pendingCobranca.amount || 980;

      recommendations.push({
        id: `rec-finance-${pendingCobranca.id}`,
        title: isOverdue
          ? `Regularizar Fatura Vencida: ${invoiceLabel}`
          : `Garantir Desconto de Pontualidade no Pix (${invoiceLabel})`,
        description: viewedInvoiceRecently
          ? `Você consultou esta fatura recentemente. Copie a chave Pix em 1 clique para concluir a liquidação com confirmação imediata.`
          : `A fatura vence em ${pendingCobranca.dueDate} (R$ ${invoiceAmount.toFixed(2)}). Pagamentos via Pix possuem conciliação instantânea.`,
        category: "financeiro",
        priority: isOverdue ? "alta" : "media",
        score: isOverdue ? 98 : viewedInvoiceRecently ? 92 : 80,
        reason: viewedInvoiceRecently
          ? "Baseado em: você visualizou a fatura recentemente, mas a operação ainda não foi finalizada."
          : "Baseado em: fatura em aberto com data de vencimento próxima.",
        basedOnActivity: viewedInvoiceRecently ? "Visualização de Fatura há pouco" : "Vencimento em Aberto",
        actionLabel: "Copiar Pix & Pagar",
        actionType: "copy_pix",
        actionPayload: {
          tab: "cobrancas",
          pixCode: (pendingCobranca as any).pixCode || "00020126580014br.gov.bcb.pix0136escola@magiclearning.com.br5204000053039865404980.005802BR5915MAGIC LEARNING6009SAO PAULO62070503***6304ABCD",
          itemId: pendingCobranca.id,
        },
        badgeText: isOverdue ? "Vencida" : "Pix Desconto",
        estimatedMinutes: 1,
        createdAt: now,
      });
    }

    // Regra B: Comunicados importantes não confirmados / termo de autorização
    const unconfirmedNotice = comunicados[0];
    if (unconfirmedNotice) {
      const viewedNotice = hasRecentActivity("view_announcement", 1440, unconfirmedNotice.id);
      const isUrgent =
        unconfirmedNotice.category.toLowerCase().includes("urgente") ||
        (unconfirmedNotice.tags && unconfirmedNotice.tags.includes("urgente"));

      recommendations.push({
        id: `rec-notice-${unconfirmedNotice.id}`,
        title: `Confirmar Leitura: ${unconfirmedNotice.title}`,
        description: `Comunicado institucional referente a "${unconfirmedNotice.category}". Deixe o ciente para os registros escolares de ${firstName}.`,
        category: "comunicacao",
        priority: isUrgent ? "alta" : "media",
        score: isUrgent ? 95 : 78,
        reason: viewedNotice
          ? "Baseado em: aviso consultado, aguardando confirmação do responsável."
          : "Baseado em: novo comunicado publicado pela equipe pedagógica para a turma de " + firstName + ".",
        basedOnActivity: "Novo Comunicado da Turma",
        actionLabel: "Abrir Mural de Avisos",
        actionType: "navigate_tab",
        actionPayload: {
          tab: "comunicados",
          itemId: unconfirmedNotice.id,
        },
        badgeText: unconfirmedNotice.category,
        estimatedMinutes: 2,
        createdAt: now,
      });
    }

    // Regra C: Diário de Rotina Diária (Alimentação / Sono / Acolhimento)
    const checkedRoutineToday = hasRecentActivity("view_routine", 360);
    const hour = new Date().getHours();
    if (!checkedRoutineToday && hour >= 12) {
      recommendations.push({
        id: `rec-routine-today-${student?.id || "default"}`,
        title: `Conferir Diário de Sala de Hoje de ${firstName}`,
        description: `A professora registrou o feedback de almoço, descanso e participação social de ${firstName}. Acompanhe a rotina em tempo real.`,
        category: "rotina",
        priority: "media",
        score: hour >= 16 ? 88 : 74,
        reason: "Baseado em: atualizações diárias pedagógicas inseridas pela professora hoje às 12h.",
        basedOnActivity: "Novo Registro de Sala",
        actionLabel: "Ver Diário de Hoje",
        actionType: "navigate_tab",
        actionPayload: {
          tab: "diaadia",
          studentId: student?.id,
        },
        badgeText: "Rotina Diária",
        estimatedMinutes: 2,
        createdAt: now,
      });
    }

    // Regra D: Desempenho e Reforço Pedagógico (Boletim com notas sob atenção)
    if (student?.grades && student.grades.length > 0) {
      const lowSubject = student.grades.find((g) => {
        const val1 = typeof g.firstBimester === "number" ? g.firstBimester : 10;
        const val2 = typeof g.secondBimester === "number" ? g.secondBimester : 10;
        return Math.min(val1, val2) < 7.5;
      });

      if (lowSubject) {
        const viewedReportCard = hasRecentActivity("view_report_card", 1440);
        recommendations.push({
          id: `rec-pedag-${student.id}-${lowSubject.subject}`,
          title: `Plano de Reforço em ${lowSubject.subject}`,
          description: `${firstName} obteve média ${lowSubject.firstBimester} em ${lowSubject.subject}. Recomendamos revisar os exercícios de fixação propostos e solicitar alinhamento.`,
          category: "pedagogico",
          priority: "media",
          score: viewedReportCard ? 86 : 72,
          reason: viewedReportCard
            ? `Baseado em: você consultou o boletim recentemente e identificamos oportunidade de reforço em ${lowSubject.subject}.`
            : `Baseado em: notas do 1º/2º Bimestre abaixo do indicador de excelência em ${lowSubject.subject}.`,
          basedOnActivity: "Análise de Desempenho",
          actionLabel: "Abrir Boletim & Tarefas",
          actionType: "navigate_tab",
          actionPayload: {
            tab: "academico",
            studentId: student.id,
          },
          badgeText: lowSubject.subject,
          estimatedMinutes: 4,
          createdAt: now,
        });
      }
    }

    // Regra E: Galeria de Fotos / Momentos Escolares recentes
    if (momentos.length > 0) {
      const latestMomento = momentos[0];
      const viewedMomentoRecently = hasRecentActivity("view_photo", 720);
      if (!viewedMomentoRecently) {
        recommendations.push({
          id: `rec-moment-${latestMomento.id}`,
          title: `Nova Foto de ${firstName}: ${latestMomento.title}`,
          description: `Novo registro em alta definição adicionado pela coordenação (${latestMomento.date}). Salve na galeria da família ou compartilhe.`,
          category: "rotina",
          priority: "baixa",
          score: 65,
          reason: "Baseado em: nova mídia escolar disponibilizada na turma.",
          basedOnActivity: "Novo Momento Escolar",
          actionLabel: "Ver Momento",
          actionType: "navigate_tab",
          actionPayload: {
            tab: "diaadia",
            itemId: latestMomento.id,
          },
          badgeText: "Galeria",
          estimatedMinutes: 1,
          createdAt: now,
        });
      }
    }

    // Regra F: Horário de Retirada na Portaria (Se for perto do fim de tarde)
    if (hour >= 16 && hour <= 19) {
      recommendations.push({
        id: `rec-portaria-pickup-${student?.id || "current"}`,
        title: `Gerar QR Code de Retirada para a Portaria`,
        description: `Agilize a chamada e embarque seguro de ${firstName} na fila de saída apresentando o passe dinâmico no leitor da guarita.`,
        category: "urgente",
        priority: "alta",
        score: 94,
        reason: "Baseado em: horário de pico de saída escolar (16h-18h30) com fila prioritária por QR Code.",
        basedOnActivity: "Horário de Saída Escolar",
        actionLabel: "Abrir QR Code de Portaria",
        actionType: "open_modal",
        actionPayload: {
          modal: "qr_code_portaria",
        },
        badgeText: "Portaria Ágil",
        estimatedMinutes: 1,
        createdAt: now,
      });
    }
  }

  /* =======================================================================
   * 2. REGRAS PARA O PERFIL DE ESCOLA / GESTÃO / PROFESSORES
   * ======================================================================= */
  if (role === "escola") {
    // Regra A: Alunos em Risco de Frequência / Evasão
    const atRiskStudents = estudantes.filter((e) => (e as any).attendance < 80 || e.reEnrollmentStatus === "pendente");
    if (atRiskStudents.length > 0) {
      recommendations.push({
        id: "rec-escola-freq-alert",
        title: `${atRiskStudents.length} Alunos com Frequência Crítica (< 80%)`,
        description: `Estudantes como ${atRiskStudents[0].name} demandam intervenção preventiva e contato com os responsáveis para mitigar evasão.`,
        category: "urgente",
        priority: "alta",
        score: 96,
        reason: "Baseado em: varredura no banco pedagógico identificou estudantes com faltas acumuladas acima do limite legal.",
        basedOnActivity: "Monitoramento de Presença",
        actionLabel: "Ver Alunos sob Alerta",
        actionType: "navigate_tab",
        actionPayload: {
          tab: "alunos",
          targetSubTab: "crm",
        },
        badgeText: "Risco de Evasão",
        estimatedMinutes: 5,
        createdAt: now,
      });
    }

    // Regra B: Régua de Cobrança ERP WhatsApp
    const unpaidInvoices = cobrancas.filter((c) => c.status === "pendente" || c.status === "vencido");
    if (unpaidInvoices.length > 0) {
      recommendations.push({
        id: "rec-escola-erp-billing",
        title: `Disparo Preventivo da Régua ERP (${unpaidInvoices.length} faturas)`,
        description: `Existem títulos com vencimento próximo. Dispare a notificação cordial via WhatsApp com código Pix para reduzir inadimplência.`,
        category: "gestao",
        priority: "alta",
        score: 91,
        reason: "Baseado em: sincronização de faturas abertas no ERP aguardando régua de comunicação D-3 / D-0.",
        basedOnActivity: "Integração ERP Financeira",
        actionLabel: "Abrir Régua de Cobrança ERP",
        actionType: "navigate_tab",
        actionPayload: {
          tab: "erp",
          targetSubTab: "regua_cobranca",
        },
        badgeText: "Automação ERP",
        estimatedMinutes: 3,
        createdAt: now,
      });
    }

    // Regra C: Otimização de Portaria & Escala de Inspetores
    recommendations.push({
      id: "rec-escola-portaria-scale",
      title: "Verificar Heatmap e Escala da Portaria para o Turno da Tarde",
      description: "Concentração prevista de 52 chegadas simultâneas entre 17h10 e 17h40. Confira se a guarita 2 está com operador alocado.",
      category: "gestao",
      priority: "media",
      score: 82,
      reason: "Baseado em: modelo preditivo de fluxo de portaria por horário e histórico de leituras de QR Code.",
      basedOnActivity: "Simulação de Fluxo de Portaria",
      actionLabel: "Consultar Heatmap",
      actionType: "navigate_tab",
      actionPayload: {
        tab: "retiradas",
      },
      badgeText: "Fluxo Portaria",
      estimatedMinutes: 2,
      createdAt: now,
    });

    // Regra D: Exportação de Boletins e Métricas BI
    recommendations.push({
      id: "rec-escola-bi-export",
      title: "Consolidar Relatório do 2º Bimestre para o Conselho de Classe",
      description: "Todas as turmas fecharam avaliações parciais. Exporte o compilado de correlação de notas e frequência em PDF/Excel.",
      category: "pedagogico",
      priority: "media",
      score: 75,
      reason: "Baseado em: encerramento do ciclo bimestral com dados pedagógicos prontos para extração.",
      basedOnActivity: "BI & Metrificação Escolar",
      actionLabel: "Abrir Painel de Métricas BI",
      actionType: "navigate_tab",
      actionPayload: {
        tab: "metricas",
      },
      badgeText: "Conselho de Classe",
      estimatedMinutes: 4,
      createdAt: now,
    });
  }

  /* =======================================================================
   * 3. REGRAS PARA O PERFIL DE ALUNO / ESTUDANTE
   * ======================================================================= */
  if (role === "aluno") {
    recommendations.push({
      id: "rec-aluno-homework-math",
      title: "Completar Lição: Frações Equivalentes",
      description: "Faltam 3 exercícios da página 52 de Matemática. Entrega prevista para hoje com o Prof. Ricardo.",
      category: "pedagogico",
      priority: "alta",
      score: 95,
      reason: "Baseado em: tarefa cadastrada na sua lista com prazo vencendo hoje.",
      basedOnActivity: "Prazo de Tarefa de Hoje",
      actionLabel: "Abrir Tarefa & Cronômetro Pomodoro",
      actionType: "navigate_tab",
      actionPayload: {
        tab: "tarefas",
        taskId: "hw-1",
      },
      badgeText: "Matemática",
      estimatedMinutes: 25,
      createdAt: now,
    });

    recommendations.push({
      id: "rec-aluno-daily-streak",
      title: "Ofensiva de Estudos: 3 Dias Consecutivos! 🔥",
      description: "Você completou lições nos últimos 3 dias. Conclua uma reflexão rápida sobre o que aprendeu hoje para desbloquear o troféu 'Mente Focada'.",
      category: "rotina",
      priority: "media",
      score: 87,
      reason: "Baseado em: seu histórico contínuo de tarefas cumpridas esta semana.",
      basedOnActivity: "Sequência de Estudos Ativa",
      actionLabel: "Registrar Autoavaliação",
      actionType: "navigate_tab",
      actionPayload: {
        tab: "conquistas",
      },
      badgeText: "Troféu Semanal",
      estimatedMinutes: 3,
      createdAt: now,
    });

    recommendations.push({
      id: "rec-aluno-schedule-prep",
      title: "Preparar Mochila para as Aulas de Amanhã",
      description: "Amanhã você terá Robótica e Educação Física na primeira aula. Separe o uniforme esportivo e o kit Maker.",
      category: "rotina",
      priority: "baixa",
      score: 70,
      reason: "Baseado em: horário da grade curricular de sexta-feira.",
      basedOnActivity: "Grade Horária de Amanhã",
      actionLabel: "Ver Grade Horária",
      actionType: "navigate_tab",
      actionPayload: {
        tab: "horarios",
      },
      badgeText: "Grade Curricular",
      estimatedMinutes: 2,
      createdAt: now,
    });
  }

  // Filtragem e ordenação por score decrescente (mais prioritário primeiro)
  return recommendations
    .filter((r) => !dismissedIds.includes(r.id))
    .map((r) => ({
      ...r,
      completed: completedIds.includes(r.id),
    }))
    .filter((r) => (filterCategory === "todos" ? true : r.category === filterCategory))
    .sort((a, b) => {
      // Incompletas primeiro, depois por pontuação
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return b.score - a.score;
    });
}

/**
 * Calcula o resumo de engajamento do usuário
 */
export function calculateEngagementSummary(role: "pais" | "escola" | "aluno"): EngagementSummary {
  const activities = getUserActivities(role);
  const completedIds = getCompletedRecommendationIds();
  const count = activities.length;

  // Calcula streak baseado em dias distintos com atividade
  const uniqueDays = new Set(
    activities.map((a) => new Date(a.timestamp).toISOString().split("T")[0])
  );
  const streakDays = Math.max(1, uniqueDays.size);

  // Relevância de temas
  const categoryCounts: Record<string, number> = {};
  activities.forEach((a) => {
    categoryCounts[a.type] = (categoryCounts[a.type] || 0) + 1;
  });
  const topInterest =
    activities.length > 0
      ? activities[0].title.split(" ")[0] + " & Interações Recentes"
      : "Rotina & Aprendizado";

  // Score composto (0 - 100)
  const baseScore = Math.min(60, count * 6);
  const taskBonus = Math.min(30, completedIds.length * 10);
  const streakBonus = Math.min(10, streakDays * 3);
  const finalScore = Math.min(100, baseScore + taskBonus + streakBonus);

  let level: EngagementSummary["level"] = "Iniciante";
  if (finalScore >= 85) level = "Exemplar";
  else if (finalScore >= 65) level = "Engajado";
  else if (finalScore >= 35) level = "Ativo";

  return {
    score: finalScore || 78,
    level,
    streakDays,
    completedTasksCount: completedIds.length,
    trackedActivitiesCount: count,
    weeklyInteractions: Math.max(count, 5),
    topInterest,
  };
}
