import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { ClassroomPhoto } from "../types";

interface DeletePhotoConfirmationModalProps {
  isOpen: boolean;
  photo: ClassroomPhoto | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeletePhotoConfirmationModal({
  isOpen,
  photo,
  onClose,
  onConfirm
}: DeletePhotoConfirmationModalProps) {
  if (!isOpen || !photo) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-110 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
        onClick={onClose}
        id="delete-photo-modal-backdrop"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5"
          id="delete-photo-modal"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-black text-lg text-slate-900 dark:text-slate-100">
                Excluir Foto da Galeria?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Esta ação necessita de confirmação
              </p>
            </div>
          </div>

          {/* Photo preview card */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <img 
              src={photo.imageUrl} 
              alt={photo.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-800"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <span className="inline-block text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {photo.badge || "Foto Coletiva"}
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {photo.title}
              </h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {photo.teacherName} • {photo.date}
              </p>
            </div>
          </div>

          {/* Description warning text */}
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            Tem certeza de que deseja remover permanentemente esta foto da galeria escolar? A imagem deixará de ficar visível no mural e no portfólio dos pais.
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              id="confirm-delete-photo-btn"
            >
              <Trash2 className="w-4 h-4" />
              <span>Sim, Excluir Foto</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
