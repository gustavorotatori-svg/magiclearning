import React, { useState, useEffect, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Edit, 
  Share2, 
  Check, 
  X, 
  Maximize2, 
  Heart, 
  Trash2, 
  Flag,
  Download,
  ZoomIn,
  ZoomOut,
  User,
  Calendar,
  Tag
} from "lucide-react";
import { ClassroomPhoto } from "../types";

export interface ClassroomPhotoCardProps {
  key?: React.Key;
  photo: ClassroomPhoto;
  userRole?: string;
  onClick?: () => void;
  onEditCaption?: (photoId: string, newTitle: string) => void;
  onDelete?: (photo: ClassroomPhoto) => void;
  onLike?: (photoId: string) => void;
  onReport?: (photo: ClassroomPhoto) => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
  activeStudentId?: string;
  activeStudentName?: string;
  onTagClick?: (tag: string) => void;
}

function ClassroomPhotoCardComponent({ 
  photo, 
  userRole = "pais", 
  onClick, 
  onEditCaption,
  onDelete,
  onLike,
  onReport,
  onToast,
  activeStudentId,
  activeStudentName,
  onTagClick
}: ClassroomPhotoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(photo.title);
  const [lastTap, setLastTap] = useState(0);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Keep local edited title in sync if photo prop title updates
  useEffect(() => {
    setEditedTitle(photo.title);
  }, [photo.title]);

  // Lock body scroll and listen for Escape key when lightbox is open
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen]);

  const handleStartEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedTitle(photo.title);
    setIsEditing(false);
  }, [photo.title]);

  const handleSaveEdit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editedTitle.trim()) return;
    if (onEditCaption) {
      onEditCaption(photo.id, editedTitle);
    }
    setIsEditing(false);
    if (onToast) {
      onToast("✓ Legenda da foto atualizada!", "success");
    }
  }, [editedTitle, onEditCaption, onToast, photo.id]);

  const handleLikeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Only show big center heart if we are liking the photo (not unliking)
    if (!photo.likedByCurrentUser) {
      setShowBigHeart(true);
      setTimeout(() => setShowBigHeart(false), 800);
      if (onToast) {
        onToast("❤️ Você curtiu esta foto!", "info");
      }
    } else {
      if (onToast) {
        onToast("💔 Curtida removida", "info");
      }
    }

    if (onLike) {
      onLike(photo.id);
    }
  }, [onLike, onToast, photo.id, photo.likedByCurrentUser]);

  const handleImageTap = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // Double tap!
      handleLikeClick(e);
    } else {
      setLastTap(now);
    }
  }, [handleLikeClick, lastTap]);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: photo.title,
      text: `Confira essa atividade escolar: "${photo.title}" no diário da escola!`,
      url: photo.imageUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (onToast) onToast("✓ Foto compartilhada!", "success");
      } catch (err) {
        console.error("Erro ao compartilhar", err);
      }
    } else {
      // Fallback: Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(photo.imageUrl);
        if (onToast) {
          onToast("📋 Link da foto copiado para transferência!", "success");
        }
      } catch (err) {
        console.error("Erro ao copiar link", err);
      }
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const link = document.createElement("a");
      link.href = photo.imageUrl;
      link.download = `${photo.title.replace(/[^a-zA-Z0-9_-]/g, "_") || "foto-escolar"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (onToast) onToast("📥 Foto salva com sucesso!", "success");
    } catch {
      window.open(photo.imageUrl, "_blank");
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    setIsLightboxOpen(true);
    if (onClick) onClick();
  };

  const isTeacher = userRole === "escola";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        layout
        whileHover={{ 
          y: -6, 
          scale: 1.01, 
          boxShadow: "0px 10px 20px rgba(66, 51, 38, 0.12)" 
        }}
        whileTap={{ scale: 0.99 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 24,
          opacity: { duration: 0.2 }
        }}
        onClick={handleCardClick}
        className="group bg-[#fcfaf3] dark:bg-slate-900 border border-amber-150/55 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs cursor-pointer flex flex-col relative transition-all duration-300 select-none"
        id={`photo-card-${photo.id}`}
      >
        <div 
          onClick={handleImageTap}
          className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800"
        >
          {/* Shimmer loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] flex items-center justify-center">
              <div className="flex flex-col items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <Camera className="w-6 h-6 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest uppercase">Carregando...</span>
              </div>
            </div>
          )}

          <img 
            src={photo.imageUrl} 
            alt={photo.title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-103 transition-all duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            referrerPolicy="no-referrer"
          />

          {/* Double-tap Giant Heart Pop Animation Overlay */}
          <AnimatePresence>
            {showBigHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0.3, 1.3, 1], opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-white/15 dark:bg-black/25 backdrop-blur-3xs p-5 rounded-full shadow-lg">
                  <Heart className="w-16 h-16 text-rose-500 fill-rose-500 filter drop-shadow-[0_4px_12px_rgba(244,63,94,0.4)]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top left badge */}
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 flex-wrap max-w-[80%]">
            <span className="bg-amber-950/85 backdrop-blur-xs text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-amber-200/20">
              {photo.badge}
            </span>
            {activeStudentId && (photo.taggedStudentIds?.includes(activeStudentId) || (activeStudentName && photo.title.toLowerCase().includes(activeStudentName.toLowerCase()))) && (
              <span className="bg-amber-500/90 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-amber-300/50 backdrop-blur-xs">
                <span>★ {activeStudentName ? activeStudentName.split(" ")[0] : "Aluno"}</span>
              </span>
            )}
          </div>

          {/* Action icons in the corner of image for quick interaction */}
          <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            {isTeacher && !isEditing && (
              <button
                type="button"
                onClick={handleStartEdit}
                className="p-1.5 bg-amber-800/90 hover:bg-amber-900 text-white rounded-lg border border-amber-700/30 backdrop-blur-xs shadow-xs transition-colors cursor-pointer"
                title="Editar Legenda"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(photo);
                }}
                className="p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg border border-rose-500/30 backdrop-blur-xs shadow-xs transition-colors cursor-pointer"
                title="Excluir Foto da Galeria"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onReport && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReport(photo);
                }}
                className="p-1.5 bg-slate-900/70 hover:bg-rose-600 text-white rounded-lg border border-white/20 backdrop-blur-xs shadow-xs transition-colors cursor-pointer"
                title="Denunciar Foto à Moderação"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 bg-indigo-650/90 hover:bg-indigo-700 text-white rounded-lg border border-indigo-500/30 backdrop-blur-xs shadow-xs transition-colors cursor-pointer"
              title="Compartilhar Atividade"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
                if (onClick) onClick();
              }}
              className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg border border-white/20 backdrop-blur-xs shadow-xs transition-colors cursor-pointer"
              title="Visualizar em Tela Cheia (Lightbox)"
              aria-label="Abrir foto em tela cheia"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 bg-[#fdfaf5] dark:bg-slate-900/60">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-2 w-full" onClick={(e) => e.stopPropagation()}>
              <textarea
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-amber-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-sans font-medium outline-none resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-[10px] font-bold flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" />
                  <span>Cancelar</span>
                </button>
                <button
                  type="submit"
                  className="p-1 bg-amber-800 hover:bg-amber-900 text-white rounded-md text-[10px] font-bold flex items-center gap-0.5"
                >
                  <Check className="w-3 h-3" />
                  <span>Salvar</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-1">
              <h4 className="text-xs sm:text-xs.5 font-serif font-black text-[#423326] dark:text-amber-100 leading-snug group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">
                {photo.title}
              </h4>
              {photo.tags && photo.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  {photo.tags.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTagClick?.(tag);
                      }}
                      className="text-[9px] font-mono font-bold text-amber-900/80 dark:text-amber-300/80 hover:text-amber-950 dark:hover:text-amber-100 bg-amber-100/60 hover:bg-amber-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                      title={`Filtrar por #${tag}`}
                    >
                      #{tag}
                    </button>
                  ))}
                  {photo.tags.length > 4 && (
                    <span className="text-[8.5px] font-mono text-slate-400 font-semibold">
                      +{photo.tags.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-amber-200/30 dark:border-slate-800 gap-2">
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[#423326] dark:text-amber-200 truncate">{photo.teacherName}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500">{photo.date}</span>
            </div>

            <button
              type="button"
              onClick={handleLikeClick}
              className={`flex items-center gap-1 px-2.5 py-1 sm:py-1 rounded-full border transition-all duration-200 cursor-pointer text-xs font-bold shrink-0 ${
                photo.likedByCurrentUser
                  ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 shadow-2xs"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/20 dark:hover:bg-rose-950/10"
              }`}
              title={photo.likedByCurrentUser ? "Remover curtida" : "Curtir foto"}
            >
              <motion.div
                animate={{ scale: photo.likedByCurrentUser ? [1, 1.35, 0.95, 1.05, 1] : 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    photo.likedByCurrentUser 
                      ? "fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400" 
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                />
              </motion.div>
              <span className="font-mono text-[11px] font-bold select-none">
                {photo.likes || 0}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Lightbox Modal Rendered in Portal */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isLightboxOpen && (
            <motion.div
              id={`classroom-photo-lightbox-${photo.id}`}
              role="dialog"
              aria-modal="true"
              aria-label={`Foto em tela cheia: ${photo.title}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between overflow-hidden select-none"
              onClick={() => {
                setIsLightboxOpen(false);
                setIsZoomed(false);
              }}
            >
              {/* Lightbox Header Bar */}
              <div 
                className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-black/50 border-b border-white/10 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="bg-amber-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                    {photo.badge}
                  </span>
                  <span className="text-xs text-slate-300 font-mono hidden sm:inline-block truncate">
                    {photo.grade}
                  </span>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={handleLikeClick}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      photo.likedByCurrentUser
                        ? "bg-rose-600/90 border-rose-500 text-white shadow-xs"
                        : "bg-white/10 hover:bg-white/20 border-white/15 text-slate-200"
                    }`}
                    title={photo.likedByCurrentUser ? "Remover curtida" : "Curtir foto"}
                  >
                    <Heart className={`w-3.5 h-3.5 ${photo.likedByCurrentUser ? "fill-white" : ""}`} />
                    <span className="font-mono text-xs">{photo.likes || 0}</span>
                  </button>

                  {/* Zoom Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 transition-colors cursor-pointer"
                    title={isZoomed ? "Ajustar à tela" : "Aumentar zoom (125%)"}
                    aria-label={isZoomed ? "Reduzir zoom" : "Aumentar zoom"}
                  >
                    {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                  </button>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 transition-colors cursor-pointer"
                    title="Compartilhar foto"
                    aria-label="Compartilhar foto"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 transition-colors cursor-pointer"
                    title="Baixar foto original"
                    aria-label="Baixar foto"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLightboxOpen(false);
                      setIsZoomed(false);
                    }}
                    className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 border border-rose-500/40 text-white transition-colors cursor-pointer ml-1"
                    title="Fechar (Esc)"
                    aria-label="Fechar visualização em tela cheia"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lightbox Center Image Stage */}
              <div 
                className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden relative"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setIsZoomed(false);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: isZoomed ? 1.25 : 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageTap(e);
                  }}
                  className={`max-w-full max-h-[75vh] flex items-center justify-center transition-transform duration-300 ${
                    isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="max-h-[72vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>

              {/* Lightbox Footer Details Panel with Creator and Date */}
              <div 
                className="bg-slate-900/90 border-t border-white/10 p-4 sm:p-5 text-white z-20 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight leading-snug">
                      {photo.title}
                    </h3>
                    
                    {/* Detalhes de quem postou e data */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300 font-sans">
                      {/* Quem postou */}
                      <div className="flex items-center gap-1.5 font-medium text-amber-200">
                        <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Postado por: <strong className="text-white font-bold">{photo.teacherName}</strong></span>
                      </div>

                      {/* Data */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Data: <strong className="text-slate-100 font-semibold">{photo.date}</strong></span>
                      </div>

                      {/* Turma */}
                      <div className="hidden md:inline-flex items-center gap-1 text-slate-400 text-[11px]">
                        <span>Turma:</span>
                        <span className="text-slate-300 font-medium">{photo.grade}</span>
                      </div>
                    </div>

                    {/* Tags da Foto */}
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-amber-400/80 font-mono flex items-center gap-1">
                          <Tag className="w-3 h-3 text-amber-400" />
                          Tags:
                        </span>
                        {photo.tags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsLightboxOpen(false);
                              onTagClick?.(tag);
                            }}
                            className="text-[10px] font-mono bg-white/10 hover:bg-amber-600/40 text-amber-200 px-2 py-0.5 rounded-md border border-white/15 transition-colors cursor-pointer"
                            title={`Pesquisar por #${tag}`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Alunos Marcados */}
                  {(activeStudentName || (photo.taggedStudentIds && photo.taggedStudentIds.length > 0)) && (
                    <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                      <span className="text-[11px] text-slate-400 font-mono">Presente:</span>
                      <span className="bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                        <span>⭐</span>
                        <span>{activeStudentName || "Aluno da turma"}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

const ClassroomPhotoCard = memo(ClassroomPhotoCardComponent);
export default ClassroomPhotoCard;
