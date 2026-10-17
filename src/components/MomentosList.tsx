import React, { memo } from "react";
import { Camera, Calendar, Tag, Trash2, Share2, Sparkles, User, Image as ImageIcon } from "lucide-react";
import { Momento } from "../types";

export interface MomentoListItemProps {
  item: Momento;
  onSelect?: (item: Momento) => void;
  onDelete?: (id: string) => void;
  onShare?: (item: Momento) => void;
  compact?: boolean;
}

/**
 * Memoized single item component for pedagogical moments and media recordings.
 */
export const MomentoListItem = memo(function MomentoListItem({
  item,
  onSelect,
  onDelete,
  onShare,
  compact = false
}: MomentoListItemProps) {
  const [imgError, setImgError] = React.useState(false);

  if (compact) {
    return (
      <article
        onClick={() => onSelect?.(item)}
        className="group relative flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer text-left overflow-hidden"
      >
        <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative flex items-center justify-center">
          {item.image && !imgError ? (
            <img
              src={item.image}
              alt={item.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
          </div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {item.title}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {item.description}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
      {/* Visual Frame */}
      <div
        onClick={() => onSelect?.(item)}
        className="aspect-video sm:aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden cursor-pointer"
      >
        {item.image && !imgError ? (
          <img
            src={item.image}
            alt={item.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
            <Camera className="w-7 h-7 stroke-1" />
            <span className="text-xs font-sans">Registro Pedagógico</span>
          </div>
        )}

        {/* Date Tag Overlay */}
        <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
          {item.date}
        </div>
      </div>

      {/* Info & Description */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <h3
            onClick={() => onSelect?.(item)}
            className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer line-clamp-1"
          >
            {item.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        {/* Tags & Action Strip */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1">
            {item.tags?.slice(0, 2).map((t) => (
              <span
                key={t}
                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                #{t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(item)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Compartilhar registro com família"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                title="Excluir momento"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

export interface MomentosListProps {
  items: Momento[];
  onSelect?: (item: Momento) => void;
  onDelete?: (id: string) => void;
  onShare?: (item: Momento) => void;
  compact?: boolean;
  emptyMessage?: string;
  limit?: number;
  columns?: 2 | 3 | 4;
}

/**
 * Primary memoized list component for Momentos.
 * Prevents re-renders during high-frequency interactions in the school panel.
 */
export const MomentosList = memo(function MomentosList({
  items,
  onSelect,
  onDelete,
  onShare,
  compact = false,
  emptyMessage = "Nenhum momento pedagógico registrado até o momento.",
  limit,
  columns = 3
}: MomentosListProps) {
  const displayItems = limit ? items.slice(0, limit) : items;

  if (!displayItems || displayItems.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <Camera className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-60" />
        <p className="text-xs text-slate-500 font-sans">{emptyMessage}</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {displayItems.map((item) => (
          <MomentoListItem
            key={item.id}
            item={item}
            onSelect={onSelect}
            onDelete={onDelete}
            onShare={onShare}
            compact={true}
          />
        ))}
      </div>
    );
  }

  const gridColsClass =
    columns === 2
      ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
      : columns === 4
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";

  return (
    <div className={gridColsClass}>
      {displayItems.map((item) => (
        <MomentoListItem
          key={item.id}
          item={item}
          onSelect={onSelect}
          onDelete={onDelete}
          onShare={onShare}
          compact={false}
        />
      ))}
    </div>
  );
});
