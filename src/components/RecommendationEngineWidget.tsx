import React, { useState, useEffect, useMemo, memo } from "react";
import {
  Recommendation,
  UserActivity,
  RecommendationCategory,
  EngagementSummary,
  generateRecommendations,
  trackUserActivity,
  dismissRecommendation,
  completeRecommendation,
  getUserActivities,
  clearUserActivities,
  calculateEngagementSummary,
  RECOMMENDATION_EVENT
} from "../services/recommendationEngine";
import { Estudante, Cobranca, Comunicado, Momento } from "../types";
import {
  Sparkles,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  X,
  History,
  TrendingUp,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Eye,
  Zap,
  SlidersHorizontal,
  Flame,
  Filter
} from "lucide-react";

interface RecommendationEngineWidgetProps {
  role: "pais" | "escola" | "aluno";
  student?: Estudante;
  estudantes?: Estudante[];
  cobrancas?: Cobranca[];
  comunicados?: Comunicado[];
  momentos?: Momento[];
  onExecuteAction?: (recommendation: Recommendation) => void;
  onToast?: (message: string, type: "success" | "error" | "info" | "warning") => void;
  compact?: boolean;
}

export const RecommendationEngineWidget = memo(function RecommendationEngineWidget({
  role,
  student,
  estudantes = [],
  cobrancas = [],
  comunicados = [],
  momentos = [],
  onExecuteAction,
  onToast,
  compact = false,
}: RecommendationEngineWidgetProps) {
  const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory | "todos">("todos");
  const [expandedReasonId, setExpandedReasonId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Estados locais sincronizados via RECOMMENDATION_EVENT
  const [activities, setActivities] = useState<UserActivity[]>(() => getUserActivities(role));
  const [engagement, setEngagement] = useState<EngagementSummary>(() => calculateEngagementSummary(role));

  // Recarrega dados reativamente quando atividades ocorrem
  const reloadData = React.useCallback(() => {
    setActivities(getUserActivities(role));
    setEngagement(calculateEngagementSummary(role));
  }, [role]);

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener(RECOMMENDATION_EVENT, handleUpdate);
    return () => window.removeEventListener(RECOMMENDATION_EVENT, handleUpdate);
  }, [reloadData]);

  // Gera a lista de recomendações dinâmicas
  const recommendations = useMemo(() => {
    return generateRecommendations({
      role,
      student,
      estudantes,
      cobrancas,
      comunicados,
      momentos,
      filterCategory: selectedCategory,
    });
  }, [role, student, estudantes, cobrancas, comunicados, momentos, selectedCategory, activities]);

  // Próximas ações ativas (incompletas)
  const activeRecommendations = useMemo(() => {
    return recommendations.filter((r) => !r.completed);
  }, [recommendations]);

  const completedRecommendations = useMemo(() => {
    return recommendations.filter((r) => r.completed);
  }, [recommendations]);

  // Executa a ação da recomendação
  const handleAction = (rec: Recommendation) => {
    if (rec.actionType === "copy_pix" && rec.actionPayload?.pixCode) {
      try {
        navigator.clipboard.writeText(rec.actionPayload.pixCode);
        setCopiedPixId(rec.id);
        if (onToast) onToast("Código Pix Copia e Cola transferido para a área de transferência!", "success");
        setTimeout(() => setCopiedPixId(null), 3500);
      } catch {
        if (onToast) onToast("Chave Pix selecionada: " + rec.actionPayload.pixCode, "info");
      }
    }

    // Registra clique como atividade
    trackUserActivity({
      userId: "user-current",
      role,
      type: "custom_interaction",
      title: `Iniciou ação recomendada: "${rec.title}"`,
      entityId: rec.id,
      entityTitle: rec.title,
      metadata: { actionType: rec.actionType, category: rec.category },
    });

    if (onExecuteAction) {
      onExecuteAction(rec);
    }
  };

  // Marca como concluída
  const handleComplete = (rec: Recommendation, e: React.MouseEvent) => {
    e.stopPropagation();
    completeRecommendation(rec);
    if (onToast) {
      onToast(`✓ Passo "${rec.title}" marcado como concluído! Pontuação de engajamento atualizada.`, "success");
    }
  };

  // Descarta recomendação
  const handleDismiss = (rec: Recommendation, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissRecommendation(rec.id);
    if (onToast) {
      onToast(`Recomendação dispensada. Seu perfil de preferências foi ajustado.`, "info");
    }
  };

  // Simulador de atividades para teste interativo
  const handleSimulateAction = (type: "invoice" | "report_card" | "announcement" | "homework") => {
    if (type === "invoice") {
      trackUserActivity({
        userId: "user-current",
        role: "pais",
        type: "view_invoice",
        title: "Visualizou fatura de Outubro/2026",
        entityTitle: "Mensalidade do 2º Semestre (R$ 980,00)",
        metadata: { status: "pendente", valor: 980 },
      });
      if (onToast) onToast("Simulação: Visualização de fatura registrada. A prioridade de pagamento Pix subiu para 98%.", "info");
    } else if (type === "report_card") {
      trackUserActivity({
        userId: "user-current",
        role: "pais",
        type: "view_report_card",
        title: "Consultou boletim com nota 6.5 em Matemática",
        entityTitle: "Boletim do 2º Bimestre",
        metadata: { subject: "Matemática", grade: 6.5 },
      });
      if (onToast) onToast("Simulação: Consulta de boletim com atenção pedagógica registrada. Recomendação de reforço ativada.", "info");
    } else if (type === "announcement") {
      trackUserActivity({
        userId: "user-current",
        role: "pais",
        type: "view_announcement",
        title: "Abriu comunicado sobre Passeio Pedagógico ao Planetário",
        entityTitle: "Passeio ao Planetário - Requer termo de autorização",
        metadata: { requiresConfirmation: true },
      });
      if (onToast) onToast("Simulação: Acesso a aviso urgente gerado. Próximo passo de confirmação atualizado.", "info");
    } else if (type === "homework") {
      trackUserActivity({
        userId: "user-current",
        role: "aluno",
        type: "complete_homework",
        title: "Concluiu lição de Ciências",
        entityTitle: "Experimento de Condensação e Evaporação",
        metadata: { subject: "Ciências" },
      });
      if (onToast) onToast("Simulação: Lição de Ciências concluída. Ofensiva de estudos aumentada!", "success");
    }
  };

  const handleResetHistory = () => {
    clearUserActivities();
    reloadData();
    if (onToast) onToast("Histórico de atividades e preferências resetados para os valores padrão.", "info");
  };

  const categories: Array<{ id: RecommendationCategory | "todos"; label: string }> = [
    { id: "todos", label: "Todas as Ações" },
    { id: "urgente", label: "Urgentes" },
    { id: "pedagogico", label: "Pedagógico" },
    { id: "financeiro", label: "Financeiro" },
    { id: "rotina", label: "Rotina & Portaria" },
    ...(role === "escola" ? [{ id: "gestao" as const, label: "Gestão & ERP" }] : []),
  ];

  return (
    <div
      id="recommendation-engine-container"
      className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden"
    >
      {/* HEADER DA CENTRAL DE RECOMENDAÇÕES */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Motor Comportamental
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Baseado no seu uso real</span>
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-[10px] font-mono text-slate-400">
              {activities.length} ações rastreadas
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {role === "pais"
              ? `Próximos Passos Recomendados para Você`
              : role === "escola"
              ? "Próximas Decisões & Automações Recomendadas"
              : "Seu Roteiro de Estudos & Próximas Missões"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sugestões priorizadas para manter a rotina fluida, evitar pendências e potencializar o aprendizado.
          </p>
        </div>

        {/* CONTROLES RÁPIDOS DO MOTOR */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setShowSimulator(!showSimulator)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              showSimulator
                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                : "bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
            }`}
            title="Abrir simulador para testar o algoritmo de recomendação"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
            <span>Simulador de Hábitos</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHistoryModal(!showHistoryModal)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Ver histórico de interações que alimentam as recomendações"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Histórico ({activities.length})</span>
          </button>
        </div>
      </div>

      {/* PAINEL OPERACIONAL DE ENGAJAMENTO (SEM CARDS DIFUSOS / SEM SLOP) */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-850 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Índice de Engajamento</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              {engagement.score}%
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              · Nível {engagement.level}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Sequência Ativa</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
              {engagement.streakDays} {engagement.streakDays === 1 ? "dia" : "dias"}
            </span>
            <span className="text-[10px] text-slate-400">consecutivos</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Passos Pendentes</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {activeRecommendations.length}
            </span>
            <span className="text-[10px] text-slate-400">
              ({completedRecommendations.length} concluídos)
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Foco Comportamental</span>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block mt-0.5" title={engagement.topInterest}>
            {engagement.topInterest}
          </span>
        </div>
      </div>

      {/* SIMULADOR DE COMPORTAMENTO EXPANSÍVEL (PARA DEMONSTRAÇÃO E TESTES) */}
      {showSimulator && (
        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <strong className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                Laboratório Interativo do Motor de Recomendações
              </strong>
            </div>
            <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300">
              Clique para injetar interações e ver o cálculo em tempo real
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSimulateAction("invoice")}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors cursor-pointer"
            >
              + Simular Visualização de Fatura (Intenção de Pagamento)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateAction("report_card")}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors cursor-pointer"
            >
              + Simular Nota em Atenção no Boletim (Plano de Reforço)
            </button>
            <button
              type="button"
              onClick={() => handleSimulateAction("announcement")}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors cursor-pointer"
            >
              + Simular Novo Comunicado com Termo Pendente
            </button>
            <button
              type="button"
              onClick={() => handleSimulateAction("homework")}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors cursor-pointer"
            >
              + Simular Lição Concluída (Ofensiva de Estudos)
            </button>
            <button
              type="button"
              onClick={handleResetHistory}
              className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-medium hover:bg-rose-100 transition-colors cursor-pointer ml-auto"
            >
              Resetar Histórico
            </button>
          </div>
        </div>
      )}

      {/* BARRA DE FILTROS POR CATEGORIA (SEGMENTED CONTROL, NÃO PILLS GENÉRICAS) */}
      <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setIsRefreshing(true);
            reloadData();
            setTimeout(() => setIsRefreshing(false), 500);
          }}
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer shrink-0 ml-auto"
          title="Recalcular pesos do motor"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Recalcular</span>
        </button>
      </div>

      {/* LISTA ESTRUTURADA DE PRÓXIMOS PASSOS (COMPOSIÇÃO EDITORIAL, NÃO CARDS REPETITIVOS) */}
      <div className="divide-y divide-slate-100 dark:divide-slate-850">
        {recommendations.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto stroke-[1.5]" />
            <h4 className="text-sm font-bold text-slate-850 dark:text-white">
              Tudo em dia! Nenhuma pendência urgente detectada.
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Você concluiu as ações prioritárias. O motor continuará monitorando prazos, frequência e notas para sugerir os próximos passos quando necessário.
            </p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const isExpanded = expandedReasonId === rec.id;
            const isCompleted = rec.completed;

            return (
              <div
                key={rec.id}
                className={`p-4 sm:p-5 transition-colors ${
                  isCompleted
                    ? "bg-slate-50/50 dark:bg-slate-900/20 opacity-70"
                    : rec.priority === "alta"
                    ? "bg-amber-50/20 dark:bg-amber-950/10 hover:bg-amber-50/30"
                    : "hover:bg-slate-50/60 dark:hover:bg-slate-900/40"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* CONTEÚDO PRINCIPAL COM TIPOGRAFIA PURA */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Linha de Metadados Limpa (Regra Zero-Pill) */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className={`font-bold uppercase tracking-wider ${
                        rec.priority === "alta"
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-slate-600 dark:text-slate-400"
                      }`}>
                        {rec.priority === "alta" ? "Alta Prioridade" : "Prioridade Média"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Afinidade {rec.score}%</span>
                      {rec.estimatedMinutes && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>~{rec.estimatedMinutes} min</span>
                          </span>
                        </>
                      )}
                      {rec.basedOnActivity && (
                        <>
                          <span aria-hidden="true" className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline text-indigo-600 dark:text-indigo-400 truncate max-w-xs">
                            {rec.basedOnActivity}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Título & Descrição */}
                    <h4 className={`text-sm sm:text-base font-bold ${
                      isCompleted
                        ? "line-through text-slate-400 dark:text-slate-600"
                        : "text-slate-900 dark:text-slate-100"
                    }`}>
                      {rec.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {rec.description}
                    </p>

                    {/* Explicação Algorítmica Transparente ("Por que esta sugestão?") */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedReasonId(isExpanded ? null : rec.id)}
                        className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <HelpCircle className="w-3 h-3 text-indigo-500" />
                        <span>Por que o sistema sugeriu isto?</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3 bg-slate-100/70 dark:bg-slate-900/70 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span className="uppercase font-bold">Racional do Motor</span>
                            <span>Score: {rec.score}/100</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                            {rec.reason}
                          </p>
                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-800">
                            Ações concluídas aumentam o score e ajustam o modelo preditivo para não repetir tarefas já cumpridas.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AÇÕES OPERACIONAIS */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pt-1 sm:pt-0">
                    {/* Botão de Ação Primária */}
                    {!isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleAction(rec)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                          rec.category === "financeiro"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : rec.priority === "alta"
                            ? "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900"
                            : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {rec.actionType === "copy_pix" ? (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedPixId === rec.id ? "Código Copiado!" : rec.actionLabel}</span>
                          </>
                        ) : (
                          <>
                            <span>{rec.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 px-2.5 py-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Concluído</span>
                      </span>
                    )}

                    {/* Botão de Concluir Tarefa */}
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={(e) => handleComplete(rec, e)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Marcar como concluído"
                        aria-label="Marcar como concluído"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}

                    {/* Botão de Dispensar */}
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={(e) => handleDismiss(rec, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Dispensar recomendação"
                        aria-label="Dispensar recomendação"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL / DRAWER DE HISTÓRICO DE ATIVIDADES RASTREADAS */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" />
                  <span>Histórico de Atividades Rastreadas</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Ações que o motor utiliza para inferir contexto e recomendar os próximos passos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Nenhuma atividade recente registrada neste dispositivo.
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.map((act) => {
                    const dateStr = new Date(act.timestamp).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const dayStr = new Date(act.timestamp).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    });

                    return (
                      <div
                        key={act.id}
                        className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-850 dark:text-slate-100 block">
                            {act.title}
                          </span>
                          {act.entityTitle && (
                            <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                              {act.entityTitle}
                            </span>
                          )}
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 pt-0.5">
                            <span className="uppercase">{act.type.replace(/_/g, " ")}</span>
                            <span>·</span>
                            <span>{dayStr} às {dateStr}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                          {act.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Total de {activities.length} ações gravadas localmente.
              </span>
              <button
                type="button"
                onClick={handleResetHistory}
                className="text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
              >
                Limpar Histórico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
