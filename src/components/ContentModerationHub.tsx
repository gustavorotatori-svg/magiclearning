import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  ShieldCheck,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  MessageSquare,
  Camera,
  Trash2,
  AlertOctagon,
  Eye,
  UserX,
  History,
  Download,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  Check,
  Send,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  BookOpen
} from "lucide-react";
import {
  ContentReport,
  ContentReportReason,
  ReportedContentType,
  ReportStatus,
  UserWarning
} from "../types";

interface ContentModerationHubProps {
  reports: ContentReport[];
  userWarnings: UserWarning[];
  onUpdateReportStatus: (
    reportId: string,
    status: ReportStatus,
    moderatorNotes?: string,
    actionTaken?: "removed" | "warned" | "removed_and_warned" | "dismissed" | "none",
    warningData?: Omit<UserWarning, "id" | "issuedAt" | "acknowledged">
  ) => void;
  onRemoveContent: (contentType: ReportedContentType, contentId: string, contentParentId?: string) => void;
  onRestoreContent?: (contentType: ReportedContentType, contentId: string, contentParentId?: string) => void;
  onIssueWarning: (warning: Omit<UserWarning, "id" | "issuedAt" | "acknowledged">) => void;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
  branding?: any;
}

const REASON_LABELS: Record<ContentReportReason, { label: string; badgeClass: string }> = {
  minor_privacy: {
    label: "Privacidade de Menor (LGPD)",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
  },
  bullying_harassment: {
    label: "Bullying / Ofensa",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800"
  },
  inappropriate_content: {
    label: "Conteúdo Impróprio",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800"
  },
  spam_advertising: {
    label: "Spam / Publicidade",
    badgeClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800"
  },
  misinformation: {
    label: "Desinformação / Boato",
    badgeClass: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800"
  },
  other: {
    label: "Outros Motivos",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
  }
};

const WARNING_TEMPLATES = [
  {
    title: "Violação do Código de Convivência (Ofensa ou Ataque)",
    severity: "moderada" as const,
    reason: "Conduta desrespeitosa e linguagem agressiva no mural coletivo",
    message:
      "Prezado(a) responsável, seu comentário recente foi removido por infringir as diretrizes de cordialidade e respeito do Colégio Magic Learning. Lembramos que os canais digitais da escola são espaços colaborativos educativos. A reincidência poderá acarretar a suspensão de comentários na plataforma."
  },
  {
    title: "Uso Não Autorizado de Imagem de Menor (LGPD)",
    severity: "grave" as const,
    reason: "Exposição de imagem ou dados privados de aluno sem consentimento",
    message:
      "A publicação foi removida em conformidade com o Artigo 14 da Lei Geral de Proteção de Dados (LGPD) e o Estatuto da Criança e do Adolescente (ECA). É vedada a veiculação pública de fotografias identificáveis de alunos sem autorização expressa dos respectivos responsáveis."
  },
  {
    title: "Divulgação Comercial / Spam Não Autorizado",
    severity: "leve" as const,
    reason: "Publicidade externa ou vendas no mural institucional",
    message:
      "Orientamos que os canais de avisos e comunicados da escola destinam-se exclusivamente a matérias de natureza pedagógica e institucional. Divulgações de produtos, serviços particulares ou links externos não são permitidas."
  },
  {
    title: "Divulgação de Dados Sensíveis ou Privados",
    severity: "moderada" as const,
    reason: "Compartilhamento indevido de telefones, endereços ou prontuários",
    message:
      "Por razões estritas de segurança da comunidade escolar, seu registro foi retirado por expor dados de contato ou informações pessoais restritas. Pedimos que questões de cunho individual sejam tratadas diretamente com a secretaria."
  }
];

export const ContentModerationHub: React.FC<ContentModerationHubProps> = ({
  reports,
  userWarnings,
  onUpdateReportStatus,
  onRemoveContent,
  onRestoreContent,
  onIssueWarning,
  onToast,
  branding
}) => {
  const [activeTab, setActiveTab] = useState<"queue" | "warnings" | "guidelines">("queue");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "under_review" | "resolved" | "dismissed">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | ReportedContentType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);

  // Warning Composer Modal state
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningReportTarget, setWarningReportTarget] = useState<ContentReport | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<"leve" | "moderada" | "grave">("moderada");
  const [warningReason, setWarningReason] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [alsoRemoveContent, setAlsoRemoveContent] = useState(true);

  // Inspector action notes
  const [moderatorNotes, setModeratorNotes] = useState("");

  // Metrics computation
  const metrics = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === "pending").length;
    const resolved = reports.filter((r) => r.status.startsWith("resolved")).length;
    const dismissed = reports.filter((r) => r.status === "dismissed").length;
    const removedCount = reports.filter(
      (r) => r.actionTaken === "removed" || r.actionTaken === "removed_and_warned"
    ).length;
    const warningsCount = userWarnings.length;

    return { total, pending, resolved, dismissed, removedCount, warningsCount };
  }, [reports, userWarnings]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Status filter
      if (statusFilter === "pending" && report.status !== "pending") return false;
      if (statusFilter === "under_review" && report.status !== "under_review") return false;
      if (statusFilter === "resolved" && !report.status.startsWith("resolved")) return false;
      if (statusFilter === "dismissed" && report.status !== "dismissed") return false;

      // Type filter
      if (typeFilter !== "all" && report.contentType !== typeFilter) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inSnippet = report.contentSnippet.toLowerCase().includes(query);
        const inAuthor = (report.contentAuthorName || "").toLowerCase().includes(query);
        const inReporter = report.reporterName.toLowerCase().includes(query);
        const inTitle = (report.contentTitle || "").toLowerCase().includes(query);
        if (!inSnippet && !inAuthor && !inReporter && !inTitle) return false;
      }

      return true;
    });
  }, [reports, statusFilter, typeFilter, searchQuery]);

  // Open inspection
  const handleOpenInspect = (report: ContentReport) => {
    setSelectedReport(report);
    setModeratorNotes(report.moderatorNotes || "");
  };

  // Quick Action: Remove Content
  const handleQuickRemove = (report: ContentReport) => {
    onRemoveContent(report.contentType, report.contentId, report.contentParentId);
    onUpdateReportStatus(
      report.id,
      "resolved_removed",
      "Conteúdo removido diretamente pelo moderador por descumprimento das regras institucionais.",
      "removed"
    );
    onToast("✓ Conteúdo removido da plataforma e denúncia resolvida.", "success");
    if (selectedReport?.id === report.id) {
      setSelectedReport({
        ...report,
        status: "resolved_removed",
        actionTaken: "removed",
        moderatorNotes: "Conteúdo removido diretamente pelo moderador."
      });
    }
  };

  // Quick Action: Dismiss Report
  const handleQuickDismiss = (report: ContentReport) => {
    onUpdateReportStatus(
      report.id,
      "dismissed",
      "Denúncia avaliada como improcedente. O conteúdo cumpre as diretrizes da escola.",
      "dismissed"
    );
    onToast("Denúncia descartada como improcedente.", "info");
    if (selectedReport?.id === report.id) {
      setSelectedReport({
        ...report,
        status: "dismissed",
        actionTaken: "dismissed",
        moderatorNotes: "Denúncia avaliada como improcedente."
      });
    }
  };

  // Open Warning Composer
  const handleOpenWarningComposer = (report: ContentReport) => {
    setWarningReportTarget(report);
    const defTemplate = WARNING_TEMPLATES[0];
    setSelectedSeverity(defTemplate.severity);
    setWarningReason(defTemplate.reason);
    setWarningMessage(defTemplate.message);
    setAlsoRemoveContent(true);
    setIsWarningModalOpen(true);
  };

  // Submit Warning
  const handleConfirmIssueWarning = () => {
    if (!warningReportTarget || !warningMessage.trim()) return;

    const targetUserId = warningReportTarget.contentAuthorId || "user-reported";
    const targetUserName = warningReportTarget.contentAuthorName || "Autor da publicação";

    const warningData: Omit<UserWarning, "id" | "issuedAt" | "acknowledged"> = {
      userId: targetUserId,
      userName: targetUserName,
      reason: warningReason.trim() || "Violação das regras de convivência",
      severity: selectedSeverity,
      message: warningMessage.trim(),
      issuedBy: "Coordenação de Convivência & Moderação",
      relatedReportId: warningReportTarget.id,
      relatedContentSnippet: warningReportTarget.contentSnippet.slice(0, 120)
    };

    if (alsoRemoveContent) {
      onRemoveContent(
        warningReportTarget.contentType,
        warningReportTarget.contentId,
        warningReportTarget.contentParentId
      );
    }

    onUpdateReportStatus(
      warningReportTarget.id,
      "resolved_warned",
      moderatorNotes || `Advertência formal (${selectedSeverity}) enviada ao usuário.`,
      alsoRemoveContent ? "removed_and_warned" : "warned",
      warningData
    );

    setIsWarningModalOpen(false);
    onToast(`✓ Advertência formal (${selectedSeverity}) emitida para ${targetUserName}.`, "success");

    if (selectedReport?.id === warningReportTarget.id) {
      setSelectedReport(null);
    }
  };

  // Export audit log
  const handleExportAuditLog = () => {
    const dataStr = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        institution: branding?.name || "Colégio Magic Learning",
        totalReports: reports.length,
        reportsQueue: reports,
        issuedWarnings: userWarnings
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-moderacao-escola-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast("Arquivo de auditoria de moderação exportado.", "info");
  };

  const formatElapsed = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Há ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Há ${days} d`;
  };

  const getAuthorWarningCount = (authorId?: string) => {
    if (!authorId) return 0;
    return userWarnings.filter((w) => w.userId === authorId).length;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Operational Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Central de Moderação & Segurança Comunitária
                </h1>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                  LGPD & ECA
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Supervisão de publicações, comentários de responsáveis e conformidade com o Código de Convivência e proteção integral a menores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              type="button"
              id="btn-export-moderation-audit"
              onClick={handleExportAuditLog}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Auditoria (LGPD)</span>
            </button>
          </div>
        </div>

        {/* Operational Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block">
              Denúncias Pendentes
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-700 dark:text-amber-400">
                {metrics.pending}
              </span>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/70">
                requerem ação
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
            <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 block">
              Casos Resolvidos
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {metrics.resolved}
              </span>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70">
                análises concluídas
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
            <span className="text-[11px] font-bold text-rose-900 dark:text-rose-300 block">
              Conteúdos Removidos
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-rose-700 dark:text-rose-400">
                {metrics.removedCount}
              </span>
              <span className="text-[10px] text-rose-600/80 dark:text-rose-400/70">
                intervenções pontuais
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-900/40">
            <span className="text-[11px] font-bold text-violet-900 dark:text-violet-300 block">
              Advertências Emitidas
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-violet-700 dark:text-violet-400">
                {metrics.warningsCount}
              </span>
              <span className="text-[10px] text-violet-600/80 dark:text-violet-400/70">
                registros de conduta
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="tab-moderation-queue"
            onClick={() => setActiveTab("queue")}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "queue"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Fila de Denúncias</span>
            {metrics.pending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                {metrics.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            id="tab-moderation-warnings"
            onClick={() => setActiveTab("warnings")}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "warnings"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>Advertências Formais ({userWarnings.length})</span>
          </button>

          <button
            type="button"
            id="tab-moderation-guidelines"
            onClick={() => setActiveTab("guidelines")}
            className={`px-4 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "guidelines"
                ? "border-amber-500 text-amber-600 dark:text-amber-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Diretrizes & Código de Convivência</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MODERATION QUEUE */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Status Filter Buttons */}
              {[
                { id: "all", label: "Todas", count: metrics.total },
                { id: "pending", label: "Pendentes", count: metrics.pending },
                { id: "resolved", label: "Resolvidas", count: metrics.resolved },
                { id: "dismissed", label: "Descartadas", count: metrics.dismissed }
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setStatusFilter(filter.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === filter.id
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-3xs"
                      : "bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70"
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      statusFilter === filter.id
                        ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              ))}

              {/* Type Filter Dropdown */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400">Tipo:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="bg-slate-100 dark:bg-slate-800 border-none text-xs rounded-xl px-2.5 py-1.5 font-bold text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="comment">Comentários</option>
                  <option value="photo">Fotos & Galeria</option>
                  <option value="comunicado">Comunicados</option>
                  <option value="occurrence">Ocorrências</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por texto, autor ou motivo..."
                className="w-full text-xs pl-8.5 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Reports Table/Queue */}
          {filteredReports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Nenhuma denúncia na fila com estes filtros
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                O ambiente está em conformidade com as políticas da escola e não há novos relatórios pendentes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => {
                const reasonInfo = REASON_LABELS[report.reason] || REASON_LABELS.other;
                const authorWarnings = getAuthorWarningCount(report.contentAuthorId);
                const isPending = report.status === "pending";

                return (
                  <div
                    key={report.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-4.5 ${
                      isPending
                        ? "border-amber-300 dark:border-amber-900/60 shadow-3xs"
                        : "border-slate-200/90 dark:border-slate-800 opacity-90"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Content Information */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status Badge */}
                          {report.status === "pending" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/80 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Pendente de Análise
                            </span>
                          )}
                          {report.status === "resolved_removed" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/80 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Conteúdo Removido
                            </span>
                          )}
                          {report.status === "resolved_warned" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-800/80 flex items-center gap-1">
                              <UserX className="w-3 h-3" />
                              Autor Advertido
                            </span>
                          )}
                          {report.status === "dismissed" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Descartada (Improcedente)
                            </span>
                          )}

                          {/* Reason Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${reasonInfo.badgeClass}`}
                          >
                            {reasonInfo.label}
                          </span>

                          {/* Content Type Badge */}
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            {report.contentType === "comment" && <MessageSquare className="w-3 h-3" />}
                            {report.contentType === "photo" && <Camera className="w-3 h-3" />}
                            {report.contentType === "comunicado" && <FileText className="w-3 h-3" />}
                            <span className="capitalize">{report.contentType}</span>
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatElapsed(report.timestamp)}
                          </span>
                        </div>

                        {/* Title or Parent reference */}
                        {report.contentTitle && (
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Origem: {report.contentTitle}
                          </div>
                        )}

                        {/* Snippet / Image */}
                        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                          {report.contentImageUrl && (
                            <img
                              src={report.contentImageUrl}
                              alt="Conteúdo denunciado"
                              className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="space-y-1 min-w-0">
                            <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                              "{report.contentSnippet}"
                            </p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                              <span>
                                Autor:{" "}
                                <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                                  {report.contentAuthorName || "Não identificado"}
                                </strong>
                              </span>
                              {authorWarnings > 0 && (
                                <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  {authorWarnings} advertência(s) anterior(es)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reporter Details */}
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            Denunciante:{" "}
                            <strong className="text-slate-700 dark:text-slate-300">
                              {report.reporterName}
                            </strong>{" "}
                            ({report.reporterRole})
                          </span>
                          {report.reasonDetails && (
                            <span className="text-slate-500">
                              Justificativa: "{report.reasonDetails}"
                            </span>
                          )}
                        </div>

                        {/* Moderator notes if already handled */}
                        {report.moderatorNotes && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50/40 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/40 dark:border-amber-900/40">
                            <strong>Parecer da Moderação:</strong> {report.moderatorNotes}
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => handleOpenInspect(report)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Analisar Caso</span>
                        </button>

                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenWarningComposer(report)}
                              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Advertir Autor</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickRemove(report)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remover</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleQuickDismiss(report)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                            >
                              Descartar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ISSUED WARNINGS LOG */}
      {activeTab === "warnings" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Histórico de Advertências e Notificações Institucionais
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Registro de medidas disciplinares e pedagógicas aplicadas aos membros da comunidade escolar.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              Total: {userWarnings.length} registro(s)
            </span>
          </div>

          {userWarnings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              Nenhuma advertência formal foi emitida até o momento.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {userWarnings.map((warning) => (
                <div key={warning.id} className="py-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {warning.userName}
                      </strong>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                          warning.severity === "grave"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : warning.severity === "moderada"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}
                      >
                        Gravidade {warning.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{new Date(warning.issuedAt).toLocaleDateString("pt-BR")}</span>
                      {warning.acknowledged ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Ciente pelo usuário
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pendente de ciência
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    Motivo: <span className="font-normal text-slate-600 dark:text-slate-400">{warning.reason}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 leading-relaxed italic">
                    "{warning.message}"
                  </p>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Emitido por: {warning.issuedBy}</span>
                    {warning.relatedContentSnippet && (
                      <span className="truncate max-w-sm">
                        Snippet: "{warning.relatedContentSnippet}"
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GUIDELINES & BYLAWS */}
      {activeTab === "guidelines" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Diretrizes de Moderação Pedagógica & Conformidade Legal
            </h2>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
              Base normativa aplicável aos canais digitais do Colégio Magic Learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>1. Proteção de Dados de Menores (LGPD - Art. 14)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                O tratamento de dados pessoais de crianças e adolescentes deve ser realizado em seu melhor interesse. É estritamente proibido publicar fotos sem termo de consentimento vigente, revelar notas individuais ou informações de saúde em áreas públicas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>2. Combate ao Bullying & Agressões Verbais (Lei 13.185)</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Intimidação sistemática, xingamentos, apelidos depreciativos ou discussões agressivas entre responsáveis em comentários resultam em remoção imediata e advertência com registro na ficha da família.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>3. Finalidade Pedagógica Exclusiva</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Os murais e galerias são espaços pedagógicos. Não é permitida a veiculação de propaganda comercial de produtos, serviços particulares, campanhas político-partidárias ou correntes de WhatsApp.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                <History className="w-4 h-4 text-amber-600" />
                <span>4. Escala de Aplicação de Medidas</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong>1ª Infração Leve:</strong> Orientação privada por escrito.<br />
                <strong>2ª Infração / Moderada:</strong> Advertência formal e remoção do conteúdo.<br />
                <strong>3ª Infração / Grave:</strong> Suspensão temporária do recurso de comentários e convocação presencial.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INSPECTION MODAL */}
      <AnimatePresence>
        {selectedReport && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-auto"
            >
              <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Inspeção do Relatório #{selectedReport.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Content Details */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Conteúdo Objeto da Denúncia
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Tipo: <strong className="text-slate-800 dark:text-slate-200 uppercase">{selectedReport.contentType}</strong></span>
                      <span>Autor: <strong className="text-slate-800 dark:text-slate-200">{selectedReport.contentAuthorName}</strong></span>
                    </div>
                    {selectedReport.contentImageUrl && (
                      <img
                        src={selectedReport.contentImageUrl}
                        alt="Visualização"
                        className="max-h-48 rounded-lg object-contain mx-auto"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800">
                      "{selectedReport.contentSnippet}"
                    </p>
                  </div>
                </div>

                {/* Reporter Justification */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Fundamento da Denúncia
                  </label>
                  <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-900/50 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900 dark:text-amber-200">
                        {REASON_LABELS[selectedReport.reason]?.label || selectedReport.reason}
                      </span>
                      <span className="text-amber-700 dark:text-amber-400 text-[11px]">
                        Relator: {selectedReport.reporterName}
                      </span>
                    </div>
                    {selectedReport.reasonDetails && (
                      <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                        "{selectedReport.reasonDetails}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Parecer Oficial da Moderação
                  </label>
                  <textarea
                    rows={2}
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    placeholder="Adicione um parecer interno sobre a análise..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>

                {/* Actions Grid */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDismiss(selectedReport)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Descartar Denúncia
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const rep = selectedReport;
                      setSelectedReport(null);
                      handleOpenWarningComposer(rep);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Advertir Autor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickRemove(selectedReport)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Conteúdo</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WARNING COMPOSER MODAL */}
      <AnimatePresence>
        {isWarningModalOpen && warningReportTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
            onClick={() => setIsWarningModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden my-auto"
            >
              <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-violet-50/50 dark:bg-violet-950/30">
                <div className="flex items-center gap-2.5">
                  <UserX className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Emitir Notificação Disciplinar / Advertência
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Destinatário: <strong>{warningReportTarget.contentAuthorName}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWarningModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Severity Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Nível de Gravidade
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "leve", label: "Leve (Orientação)", color: "border-blue-500 bg-blue-50/50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
                      { id: "moderada", label: "Moderada (Regimento)", color: "border-amber-500 bg-amber-50/50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
                      { id: "grave", label: "Grave (Suspensão)", color: "border-rose-500 bg-rose-50/50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300" }
                    ].map((sev) => (
                      <button
                        key={sev.id}
                        type="button"
                        onClick={() => setSelectedSeverity(sev.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          selectedSeverity === sev.id
                            ? `${sev.color} ring-2 ring-violet-500`
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Predefined Templates */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Modelos Institucionais Recomendados
                  </label>
                  <div className="space-y-1.5">
                    {WARNING_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedSeverity(tmpl.severity);
                          setWarningReason(tmpl.reason);
                          setWarningMessage(tmpl.message);
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-xs space-y-0.5 cursor-pointer"
                      >
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {tmpl.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {tmpl.message}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Reason & Message */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Motivo Formal
                  </label>
                  <input
                    type="text"
                    value={warningReason}
                    onChange={(e) => setWarningReason(e.target.value)}
                    placeholder="Ex: Conduta desrespeitosa e linguagem inadequada"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase font-mono">
                    Mensagem Notificada ao Usuário
                  </label>
                  <textarea
                    rows={4}
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none leading-relaxed"
                  />
                </div>

                {/* Checkbox: Also remove content */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alsoRemoveContent}
                    onChange={(e) => setAlsoRemoveContent(e.target.checked)}
                    className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Remover imediatamente a publicação/comentário
                    </span>
                    <span className="text-[11px] text-slate-500">
                      O conteúdo não será mais visível aos demais pais e membros da escola.
                    </span>
                  </div>
                </label>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsWarningModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmIssueWarning}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar e Emitir Advertência</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
