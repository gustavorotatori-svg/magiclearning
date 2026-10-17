import React, { memo } from "react";
import { Flag, MessageSquare, ThumbsUp, ThumbsDown, Calendar, Tag, Bell, User, CheckCircle2, Trash2 } from "lucide-react";
import { Comunicado } from "../types";

export interface ComunicadoListItemProps {
  item: Comunicado;
  isSchoolView?: boolean;
  onSelect?: (item: Comunicado) => void;
  onDelete?: (id: string) => void;
  onToggleReaction?: (id: string, type: "like" | "dislike") => void;
  onReport?: (item: Comunicado) => void;
  isCommentsOpen?: boolean;
  onToggleComments?: (id: string) => void;
  quickCommentText?: string;
  onQuickCommentChange?: (id: string, text: string) => void;
  onSubmitQuickComment?: (id: string) => void;
  compact?: boolean;
}

/**
 * Memoized single item component to prevent cascading re-renders
 * when parent dashboards or siblings update during user typing/filtering.
 */
export const ComunicadoListItem = memo(function ComunicadoListItem({
  item,
  isSchoolView = false,
  onSelect,
  onDelete,
  onToggleReaction,
  onReport,
  isCommentsOpen = false,
  onToggleComments,
  quickCommentText = "",
  onQuickCommentChange,
  onSubmitQuickComment,
  compact = false
}: ComunicadoListItemProps) {
  const commentList = item.comments || [];
  const readCount = item.seenByParent?.length || 0;

  if (compact) {
    return (
      <article
        onClick={() => onSelect?.(item)}
        className="group p-3.5 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-700 transition-colors cursor-pointer text-left space-y-1.5"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono">
              {item.category || "Geral"}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-medium">{item.date}</span>
          </div>
          {readCount > 0 && (
            <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {readCount} leituras
            </span>
          )}
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {item.title}
        </h4>
        <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed font-normal">
          {item.previewText || item.content}
        </p>
      </article>
    );
  }

  return (
    <article className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono">
              {item.category || "Geral"}
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              {item.date}
            </span>
            {item.authorName && (
              <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                {item.authorName}
              </span>
            )}
            {isSchoolView && readCount > 0 && (
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                {readCount} pais confirmaram leitura
              </span>
            )}
          </div>
          <h3
            onClick={() => onSelect?.(item)}
            className="text-base font-bold text-slate-950 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {item.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isSchoolView && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm ? confirm("Deseja realmente remover este comunicado?") : true) {
                  onDelete(item.id);
                }
              }}
              className="text-xs font-semibold text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1 cursor-pointer"
              title="Excluir comunicado"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Excluir</span>
            </button>
          )}

          {onReport && (
            <button
              type="button"
              onClick={() => onReport(item)}
              className="text-xs font-semibold text-slate-700 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Sinalizar conteúdo à ouvidoria"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Denunciar</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Text with WCAG AAA Contrast */}
      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line font-normal">
        {item.content}
      </p>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer Actions (Reactions & Comments) */}
      <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {onToggleReaction && (
            <>
              <button
                type="button"
                onClick={() => onToggleReaction(item.id, "like")}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span className="font-mono text-xs">{item.likesCount || 0}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleReaction(item.id, "dislike")}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <ThumbsDown className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span className="font-mono text-xs">{item.dislikesCount || 0}</span>
              </button>
            </>
          )}

          {onToggleComments && (
            <button
              type="button"
              onClick={() => onToggleComments(item.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              <span className="font-mono text-xs font-bold">{commentList.length}</span>
              <span className="hidden sm:inline text-xs">comentários</span>
            </button>
          )}
        </div>

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(item)}
            className="text-xs font-bold text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Ver Detalhes do Comunicado →
          </button>
        )}
      </div>

      {/* Expandable Comments Drawer */}
      {isCommentsOpen && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {commentList.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {commentList.map((comm) => (
                <div
                  key={comm.id}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-2"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {comm.authorName}
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-mono font-medium">
                        {new Date(comm.timestamp).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-100 text-xs leading-relaxed font-normal">{comm.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-700 dark:text-slate-300 italic font-medium">Nenhum comentário registrado ainda.</p>
          )}

          {onSubmitQuickComment && onQuickCommentChange && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmitQuickComment(item.id);
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={quickCommentText}
                onChange={(e) => onQuickCommentChange(item.id, e.target.value)}
                placeholder="Escreva um comentário público com respeito..."
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500 font-medium"
              />
              <button
                type="submit"
                disabled={!quickCommentText.trim()}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
              >
                Enviar
              </button>
            </form>
          )}
        </div>
      )}
    </article>
  );
});

export interface ComunicadosListProps {
  items: Comunicado[];
  isSchoolView?: boolean;
  onSelect?: (item: Comunicado) => void;
  onDelete?: (id: string) => void;
  onToggleReaction?: (id: string, type: "like" | "dislike") => void;
  onReport?: (item: Comunicado) => void;
  expandedCommentId?: string | null;
  expandedCommentIds?: Record<string, boolean>;
  onToggleComments?: (id: string) => void;
  quickCommentTexts?: Record<string, string>;
  onQuickCommentChange?: (id: string, text: string) => void;
  onSubmitQuickComment?: (id: string) => void;
  compact?: boolean;
  emptyMessage?: string;
  limit?: number;
}

/**
 * Primary memoized list component for Comunicados.
 * Prevents re-renders of the list unless items or state specifically change.
 */
export const ComunicadosList = memo(function ComunicadosList({
  items,
  isSchoolView = false,
  onSelect,
  onDelete,
  onToggleReaction,
  onReport,
  expandedCommentId,
  expandedCommentIds,
  onToggleComments,
  quickCommentTexts = {},
  onQuickCommentChange,
  onSubmitQuickComment,
  compact = false,
  emptyMessage = "Nenhum comunicado disponível no momento.",
  limit
}: ComunicadosListProps) {
  const displayItems = limit ? items.slice(0, limit) : items;

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
        <Bell className="w-6 h-6 text-slate-500 dark:text-slate-400 mx-auto mb-2 opacity-80" />
        <p className="text-xs text-slate-800 dark:text-slate-200 font-sans font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-2.5" : "grid grid-cols-1 gap-4"}>
      {displayItems.map((item) => (
        <ComunicadoListItem
          key={item.id}
          item={item}
          isSchoolView={isSchoolView}
          onSelect={onSelect}
          onDelete={onDelete}
          onToggleReaction={onToggleReaction}
          onReport={onReport}
          isCommentsOpen={
            expandedCommentIds
              ? !!expandedCommentIds[item.id]
              : expandedCommentId === item.id
          }
          onToggleComments={onToggleComments}
          quickCommentText={quickCommentTexts[item.id] || ""}
          onQuickCommentChange={onQuickCommentChange}
          onSubmitQuickComment={onSubmitQuickComment}
          compact={compact}
        />
      ))}
    </div>
  );
});
