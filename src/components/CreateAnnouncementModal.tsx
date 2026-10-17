import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Sparkles, Bell, Tag, Users } from "lucide-react";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (announcement: { 
    title: string; 
    category: string; 
    content: string; 
    targetAudience?: string; 
    isUrgent?: boolean 
  }) => void;
  primaryColor?: string;
}

export default function CreateAnnouncementModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  primaryColor = "#0077C0" 
}: CreateAnnouncementModalProps) {
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Comunicados Formais");
  const [formAudience, setFormAudience] = useState("Toda a Escola");
  const [formContent, setFormContent] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    onCreate({
      title: formTitle.trim(),
      category: formCategory,
      content: formContent.trim(),
      targetAudience: formAudience,
      isUrgent
    });

    // Reset Form
    setFormTitle("");
    setFormCategory("Comunicados Formais");
    setFormAudience("Toda a Escola");
    setFormContent("");
    setIsUrgent(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
          />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-colors duration-300"
            id="create-announcement-modal"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-black text-base text-slate-900 dark:text-slate-100 tracking-tight">
                    Novo Comunicado Escolar
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transmissão instantânea para o aplicativo dos pais
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Título do Comunicado</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Confirmação de uniforme para aula de Balé / Saída pedagógica"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  id="announcement-title-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Categoria</span>
                  </label>
                  <select 
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-slate-100 transition-all cursor-pointer"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    id="announcement-category-select"
                  >
                    <option value="Comunicados Formais">Comunicados Formais</option>
                    <option value="Diretrizes Acadêmicas">Diretrizes Acadêmicas</option>
                    <option value="Eventos & Celebrações">Eventos & Celebrações</option>
                    <option value="Secretaria & Financeiro">Secretaria & Financeiro</option>
                    <option value="Cardápio & Saúde">Cardápio & Saúde</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Público Alvo</span>
                  </label>
                  <select 
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-slate-100 transition-all cursor-pointer"
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value)}
                    id="announcement-audience-select"
                  >
                    <option value="Toda a Escola">Toda a Escola (Geral)</option>
                    <option value="Berçário">Berçário I e II</option>
                    <option value="Maternal">Maternal (1 a 3 anos)</option>
                    <option value="Educação Infantil">Educação Infantil</option>
                    <option value="Ensino Fundamental">Ensino Fundamental I e II</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Mensagem Completa</span>
                  <span className="text-rose-500">*</span>
                </label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Descreva as orientações, horários e informações importantes para os responsáveis..."
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all resize-none leading-relaxed"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  id="announcement-message-input"
                />
              </div>

              {/* Priority toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🚨</span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Prioridade Urgente com Notificação Push
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Dispara alerta destacado e solicita confirmação de leitura imediata
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-10 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-rose-500"></div>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl font-bold text-xs text-white flex items-center gap-2 transition-all shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-98 cursor-pointer"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar no Mural</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
