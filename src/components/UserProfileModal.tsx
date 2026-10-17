import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowLeft } from "lucide-react";
import { UserProfile, Estudante } from "../types";
import UserProfilePage from "./UserProfilePage";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
  onShowToast: (msg: string, type: "success" | "error" | "info") => void;
  onLogout?: () => void;
  userRole?: "pais" | "escola" | "aluno";
  students?: Estudante[];
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  initialSection?: "info" | "achievements" | "activity" | "settings" | "security" | "students";
  onUpdateStudentPhoto?: (studentId: string, photoUrl: string) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdated,
  onShowToast,
  onLogout,
  userRole = "pais",
  students = [],
  isDarkMode = false,
  onToggleDarkMode,
  initialSection = "info",
  onUpdateStudentPhoto,
}: UserProfileModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto z-10 p-4 sm:p-6"
        >
          {/* Header Back & Close Buttons */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              title="Voltar ao Painel"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Voltar ao Painel</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <UserProfilePage
            userProfile={userProfile}
            onProfileUpdated={(updated) => {
              onProfileUpdated(updated);
            }}
            onShowToast={onShowToast}
            onLogout={() => {
              if (onLogout) onLogout();
              onClose();
            }}
            userRole={userRole}
            students={students}
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
            initialSection={initialSection}
            onUpdateStudentPhoto={onUpdateStudentPhoto}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
