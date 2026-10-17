import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  X,
  Send,
  Lock,
  EyeOff,
  UserCheck,
  Info,
  CheckCircle2,
  FileText,
  MessageSquare,
  Camera,
  AlertOctagon
} from "lucide-react";
import { ContentReport, ContentReportReason, ReportedContentType } from "../types";

export interface ReportTarget {
  contentType: ReportedContentType;
  contentId: string;
  contentTitle?: string;
  contentSnippet: string;
  contentAuthorName?: string;
  contentAuthorId?: string;
  contentImageUrl?: string;
  contentParentId?: string;
}

interface ReportContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: ReportTarget | null;
  onSubmitReport: (reportData: Omit<ContentReport, "id" | "timestamp" | "status">) => void;
  currentUser?: {
    uid: string;
    displayName: string | null;
    role: "pais" | "escola" | "aluno" | "anonimo";
  } | null;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

const REPORT_REASONS: Array<{
  id: ContentReportReason;
  title: string;
  description: string;
}> = [
  {
    id: "minor_privacy",
    title: "Privacidade e Imagem de Menores (LGPD)",
    description: "Exposição de imagem de aluno sem consentimento, menção a dados sensíveis ou endereço."
  },
  {
    id: "bullying_harassment",
    title: "Bullying, Agressão ou Ofensa",
    description: "Comentários depreciativos, ataques verbais, intimidação ou discriminação."
  },
  {
    id: "inappropriate_content",
    title: "Linguagem ou Conteúdo Impróprio",
    description: "Vocabulário inadequado para o contexto escolar, temas adultos ou violência."
  },
  {
    id: "spam_advertising",
    title: "Spam ou Propaganda Comercial",
    description: "Venda de produtos, serviços externos ou correntes sem autorização institucional."
  },
  {
    id: "misinformation",
    title: "Informação Falsa ou Enganosa",
    description: "Boatos ou informações imprecisas sobre calendário, saúde ou rotina da escola."
  },
  {
    id: "other",
    title: "Outro Motivo",
    description: "Situação que necessita de intervenção da equipe pedagógica e de convivência."
  }
];

export const ReportContentModal: React.FC<ReportContentModalProps> = ({
  isOpen,
  onClose,
  target,
  onSubmitReport,
  currentUser,
  onToast
}) => {
  const [selectedReason, setSelectedReason] = useState<ContentReportReason>("minor_privacy");
  const [details, setDetails] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen || !target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;

    setIsSubmitting(true);

    const reporterName = isAnonymous
      ? "Membro Anônimo da Comunidade"
      : currentUser?.displayName || "Responsável Escolar";

    const reportData: Omit<ContentReport, "id" | "timestamp" | "status"> = {
      contentType: target.contentType,
      contentId: target.contentId,
      contentTitle: target.contentTitle,
      contentSnippet: target.contentSnippet,
      contentAuthorName: target.contentAuthorName || "Autor da publicação",
      contentAuthorId: target.contentAuthorId,
      contentImageUrl: target.contentImageUrl,
      contentParentId: target.contentParentId,
      reporterUserId: isAnonymous ? "anon-" + Date.now() : (currentUser?.uid || "user-guest"),
      reporterName,
      reporterRole: isAnonymous ? "anonimo" : (currentUser?.role || "pais"),
      reason: selectedReason,
      reasonDetails: details.trim() || undefined
    };

    setTimeout(() => {
      onSubmitReport(reportData);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      onToast("✓ Denúncia enviada com sucesso à equipe de moderação.", "success");

      setTimeout(() => {
        setSubmittedSuccess(false);
        setDetails("");
        setSelectedReason("minor_privacy");
        setIsAnonymous(false);
        onClose();
      }, 1600);
    }, 450);
  };

  const getContentTypeLabel = (type: ReportedContentType) => {
    switch (type) {
      case "comunicado":
        return "Comunicado Institucional";
      case "comment":
        return "Comentário em Publicação";
      case "photo":
        return "Foto de Atividade Pedagógica";
      case "occurrence":
        return "Registro de Diário Escolar";
      case "message":
        return "Mensagem / Conversa";
      default:
        return "Conteúdo Escolar";
    }
  };

  const getContentTypeIcon = (type: ReportedContentType) => {
    switch (type) {
      case "comunicado":
        return <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case "comment":
        return <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case "photo":
        return <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <AlertOctagon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shrink-0 mt-0.5 text-rose-700 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="report-modal-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight"
              >
                Denunciar Conteúdo à Equipe Pedagógica
              </h2>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                Ajude a preservar a convivência ética e a proteção de crianças e adolescentes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            id="btn-close-report-modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Denúncia Enviada com Sucesso
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              O relatório foi direcionado à fila de análise da coordenação. Conteúdos que violem o Código de Convivência ou a LGPD serão removidos com presteza.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Target Content Snapshot */}
            <div className="bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  {getContentTypeIcon(target.contentType)}
                  <span>{getContentTypeLabel(target.contentType)}</span>
                </span>
                {target.contentAuthorName && (
                  <span className="text-slate-500 font-medium">
                    Autor: <strong className="text-slate-800 dark:text-slate-200">{target.contentAuthorName}</strong>
                  </span>
                )}
              </div>

              {target.contentTitle && (
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {target.contentTitle}
                </div>
              )}

              <div className="flex items-start gap-3">
                {target.contentImageUrl && (
                  <img
                    src={target.contentImageUrl}
                    alt="Pré-visualização do conteúdo denunciado"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-3 leading-relaxed">
                  "{target.contentSnippet}"
                </p>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider">
                Motivo da Denúncia
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                {REPORT_REASONS.map((reason) => {
                  const isSelected = selectedReason === reason.id;
                  return (
                    <div
                      key={reason.id}
                      onClick={() => setSelectedReason(reason.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none text-left ${
                        isSelected
                          ? "bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 shadow-2xs"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`text-xs font-bold block ${
                              isSelected
                                ? "text-rose-900 dark:text-rose-200"
                                : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {reason.title}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 block">
                            {reason.description}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? "border-rose-600 bg-rose-600 dark:border-rose-500 dark:bg-rose-500 text-white"
                              : "border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label
                  htmlFor="report-details"
                  className="font-bold text-slate-900 dark:text-slate-100 uppercase font-mono tracking-wider"
                >
                  Esclarecimentos Adicionais (Opcional)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {details.length}/500
                </span>
              </div>
              <textarea
                id="report-details"
                rows={3}
                maxLength={500}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Detalhe o contexto da denúncia para auxiliar os coordenadores escolares na tomada de decisão..."
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
              />
            </div>

            {/* Anonymity Option */}
            <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                  {isAnonymous ? <EyeOff className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    Denúncia Anônima
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
                    {isAnonymous
                      ? "Seu nome e contato não constarão no relatório administrativo."
                      : `Enviando como: ${currentUser?.displayName || "Responsável Cadastrado"}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                id="toggle-anonymous-report"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-10 h-5.5 rounded-full transition-colors relative focus:outline-none cursor-pointer shrink-0 ${
                  isAnonymous ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
                aria-label="Alternar anonimato da denúncia"
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 shadow-xs ${
                    isAnonymous ? "translate-x-4.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Reassurance Footer */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 leading-snug">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                As denúncias são tratadas com sigilo pela equipe pedagógica. O autor do conteúdo não é informado sobre a identidade do relator.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                id="btn-cancel-report"
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                id="btn-submit-report"
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Enviando Denúncia..." : "Enviar Denúncia"}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
