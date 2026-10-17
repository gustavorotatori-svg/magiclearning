import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, 
  X, 
  Clock, 
  Calendar, 
  User, 
  Utensils, 
  Moon, 
  Pill, 
  Smile, 
  FileText, 
  Eye, 
  Send, 
  CheckCircle2, 
  ShieldAlert, 
  History, 
  Share2, 
  Printer, 
  Sparkles,
  Layers,
  Activity,
  Sliders,
  MessageSquare
} from "lucide-react";
import { Ocorrencia, Estudante } from "../types";
import { BEHAVIOR_MAP, MEAL_MAP } from "./StudentDailyRoutineTab";
import OccurrenceGlowConfigPanel from "./OccurrenceGlowConfigPanel";

interface CriticalNoteHistory {
  id: string;
  occurrenceId: string;
  timestamp: string;
  author: string;
  role: string;
  actionTaken: string;
  note: string;
}

interface CriticalOccurrenceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  occurrence: Ocorrencia | null;
  student: Estudante | null;
  allStudentOccurrences?: Ocorrencia[];
  onToast?: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  onUpdateOccurrence?: (updated: Ocorrencia) => void;
}

export default function CriticalOccurrenceDetailModal({
  isOpen,
  onClose,
  occurrence,
  student,
  allStudentOccurrences = [],
  onToast,
  onUpdateOccurrence,
}: CriticalOccurrenceDetailModalProps) {
  const [newHistoricalNote, setNewHistoricalNote] = useState("");
  const [actionCategory, setActionCategory] = useState<string>("observacao");
  const [historyList, setHistoryList] = useState<CriticalNoteHistory[]>([]);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("occurrence_high_contrast") === "true";
    }
    return false;
  });
  const [showAppearanceControls, setShowAppearanceControls] = useState(false);

  // Load historical notes for this critical occurrence from localStorage
  useEffect(() => {
    if (!occurrence) return;
    try {
      const storageKey = `critical_history_${occurrence.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setHistoryList(JSON.parse(saved));
      } else {
        // Initial seeded history based on event context
        const initialSeed: CriticalNoteHistory[] = [
          {
            id: `seed-1-${occurrence.id}`,
            occurrenceId: occurrence.id,
            timestamp: `${occurrence.date} às 11:30`,
            author: "Profª Ana Lúcia",
            role: "Professora Titular",
            actionTaken: "Registro Inicial do Alerta",
            note: occurrence.teacherNote || "Condição crítica registrada no diário escolar para acompanhamento multidisciplinar.",
          }
        ];

        if (occurrence.medicated?.wasMedicated) {
          initialSeed.push({
            id: `seed-2-${occurrence.id}`,
            occurrenceId: occurrence.id,
            timestamp: `${occurrence.date} às ${occurrence.medicated.doseTime || "10:15"}`,
            author: "Enf. Roberta Mendes",
            role: "Enfermagem Escolar",
            actionTaken: "Administração de Medicamento",
            note: `Ministrado ${occurrence.medicated.medicationName || "medicamento prescrito"} conforme autorização dos responsáveis.`,
          });
        }

        setHistoryList(initialSeed);
        localStorage.setItem(storageKey, JSON.stringify(initialSeed));
      }
    } catch {
      // Fallback
    }
  }, [occurrence]);

  if (!isOpen || !occurrence || !student) return null;

  const behaviorInfo = BEHAVIOR_MAP[occurrence.behaviorState] || BEHAVIOR_MAP.otimo;
  const lunchInfo = MEAL_MAP[occurrence.meals.lunch] || MEAL_MAP.excelente;
  const snackInfo = MEAL_MAP[occurrence.meals.snack] || MEAL_MAP.excelente;

  // Add new pedagogical follow-up note
  const handleAddHistoricalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHistoricalNote.trim()) return;

    const actionLabels: Record<string, string> = {
      observacao: "Observação Pedagógica",
      contato_pais: "Contato com os Responsáveis",
      encaminhamento: "Encaminhamento à Coordenação",
      enfermagem: "Acompanhamento de Saúde",
    };

    const newEntry: CriticalNoteHistory = {
      id: `note-${Date.now()}`,
      occurrenceId: occurrence.id,
      timestamp: `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      author: "Coordenação Pedagógica",
      role: "Equipe Escolar",
      actionTaken: actionLabels[actionCategory] || "Acompanhamento",
      note: newHistoricalNote.trim(),
    };

    const updated = [newEntry, ...historyList];
    setHistoryList(updated);
    try {
      localStorage.setItem(`critical_history_${occurrence.id}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }

    setNewHistoricalNote("");
    onToast?.("Nota histórica de acompanhamento salva com sucesso!", "success");
  };

  const handleNotifySecretary = () => {
    const notifyEntry: CriticalNoteHistory = {
      id: `notify-${Date.now()}`,
      occurrenceId: occurrence.id,
      timestamp: `Hoje às ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      author: "Sistema Pedagógico",
      role: "Notificação Automática",
      actionTaken: "Aviso de Urgência à Secretaria",
      note: `Alerta prioritário enviado para a Secretaria e Coordenação Geral sobre a ocorrência crítica do aluno ${student.name}.`,
    };
    const updated = [notifyEntry, ...historyList];
    setHistoryList(updated);
    try {
      localStorage.setItem(`critical_history_${occurrence.id}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    onToast?.(`Notificação de urgência transmitida para a Secretaria Escolar!`, "success");
  };

  const handleToggleHighContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("occurrence_high_contrast", next ? "true" : "false");
    }
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--occurrence-border-width", next ? "3.5px" : "1.5px");
      document.documentElement.style.setProperty("--occurrence-shadow-spread", next ? "6px" : "0px");
      document.documentElement.style.setProperty("--occurrence-glow-intensity", next ? "1.8" : "1.0");
      document.documentElement.style.setProperty("--occurrence-inset-intensity", next ? "2.2" : "1.0");
    }
    onToast?.(`Modo de Alto Contraste ${next ? "Ativado" : "Desativado"} para itens críticos`, "info");
  };

  return (
    <div 
      id="critical-occurrence-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border ${
          isHighContrast 
            ? "border-rose-600 dark:border-rose-500 ring-4 ring-rose-500/30" 
            : "border-rose-200 dark:border-slate-800"
        } w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] my-auto`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white flex items-center justify-between border-b border-rose-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-md ring-2 ring-rose-400/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-700 text-rose-100">
                  Evento Crítico .occurrence-item.is-critical
                </span>
                <span className="text-xs text-rose-200 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {occurrence.date}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-white flex items-center gap-2 mt-0.5">
                <span>Dossiê & Contexto do Alerta: {student.name}</span>
                <span className="text-xs font-normal text-rose-300">({student.grade})</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleHighContrast}
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isHighContrast
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-white/10 text-rose-200 hover:bg-white/20"
              }`}
              title="Alternar Modo de Alto Contraste (Aumenta borda e sombras para baixa visão)"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Alto Contraste</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-rose-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Fechar dossiê"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick Alert Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isHighContrast
              ? "bg-rose-100 dark:bg-rose-950/80 border-rose-600 text-rose-950 dark:text-rose-100 font-medium"
              : "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/90 dark:border-rose-900/60 text-rose-900 dark:text-rose-200"
          }`}>
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-lg bg-rose-600 text-white font-bold shrink-0 mt-0.5">
                🚨
              </span>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold font-serif flex items-center gap-2">
                  <span>Motivos do Enquadramento Crítico</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-200/70 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold">
                    Prioridade Alta
                  </span>
                </h4>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  {occurrence.behaviorState === "agitado" && "• Estado comportamental muito ativo/agitado exigindo modulação da rotina. "}
                  {occurrence.behaviorState === "triste" && "• Estado sensível / choro prolongado ou saudades da família. "}
                  {occurrence.behaviorState === "cansado" && "• Fadiga acentuada ou sonolência fora do horário padrão. "}
                  {occurrence.sleep?.durationStr?.toLowerCase().includes("não") && "• Ausência total de repouso / soneca na escola. "}
                  {(occurrence.meals.lunch === "recusou" || occurrence.meals.snack === "recusou") && "• Recusa de alimentação relevante. "}
                  {occurrence.medicated?.wasMedicated && "• Aluno em uso de medicação controlada durante o período escolar. "}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handleNotifySecretary}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Notificar Secretaria</span>
              </button>
            </div>
          </div>

          {/* Section 1: Full Clinical & Pedagogical Context */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-serif flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-700 dark:text-amber-500" />
                <span>Contexto Completo da Ocorrência</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-500">ID: {occurrence.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Card 1: Comportamento / Humor */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-amber-600" />
                    <span>Humor & Emoção</span>
                  </span>
                  <span className="text-base">{behaviorInfo.emoji}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {behaviorInfo.label}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {behaviorInfo.description}
                </p>
              </div>

              {/* Card 2: Alimentação */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-600" />
                    <span>Alimentação</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                    Almoço + Lanche
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span>Almoço:</span>
                    <span className="font-bold">{lunchInfo.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lanche:</span>
                    <span className="font-bold">{snackInfo.label}</span>
                  </div>
                </div>
                {occurrence.meals.details && (
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 italic">
                    "{occurrence.meals.details}"
                  </p>
                )}
              </div>

              {/* Card 3: Soneca & Repouso */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Soneca & Sono</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200">
                    {occurrence.sleep.durationStr}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {occurrence.sleep.durationStr.toLowerCase().includes("não") ? "⚠️ Déficit de Sono Registrado" : "Repouso Registrado"}
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
                  {occurrence.sleep.details || "Sem intercorrências no período de repouso."}
                </p>
              </div>

              {/* Card 4: Medicamentos */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-rose-600" />
                    <span>Medicamentos</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    occurrence.medicated.wasMedicated 
                      ? "bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200" 
                      : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  }`}>
                    {occurrence.medicated.wasMedicated ? "Sim" : "Não"}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {occurrence.medicated.wasMedicated 
                    ? (occurrence.medicated.medicationName || "Medicamento Prescrito") 
                    : "Nenhuma medicação"}
                </div>
                {occurrence.medicated.wasMedicated && (
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                    Horário: {occurrence.medicated.doseTime || "11:00"} {occurrence.medicated.details ? `• ${occurrence.medicated.details}` : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Teacher's Full Observation */}
            {occurrence.teacherNote && (
              <div className="mt-3 p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-950 dark:text-amber-200">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900 dark:text-amber-300">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Observação Pedagógica Principal:</span>
                </div>
                <p className="leading-relaxed italic">
                  "{occurrence.teacherNote}"
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Historical Notes & Interventions for this Critical Event */}
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-serif flex items-center gap-2">
                <History className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                <span>Histórico de Intervenções & Notas do Evento ({historyList.length})</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Linha do tempo auditável</span>
            </div>

            {/* Timeline List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {historyList.map((item, idx) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-serif">
                        {item.actionTaken}
                      </span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 font-semibold">
                        {item.author} ({item.role})
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11.5px] leading-relaxed">
                      {item.note}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {item.timestamp}
                  </span>
                </div>
              ))}
            </div>

            {/* Form to Add New Historical Note */}
            <form onSubmit={handleAddHistoricalNote} className="mt-3.5 p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>Adicionar Nota de Acompanhamento / Despacho</span>
                </span>
                
                <select
                  value={actionCategory}
                  onChange={(e) => setActionCategory(e.target.value)}
                  className="text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="observacao">📝 Observação Pedagógica</option>
                  <option value="contato_pais">📞 Contato com os Responsáveis</option>
                  <option value="encaminhamento">🏛️ Encaminhamento à Coordenação</option>
                  <option value="enfermagem">🩺 Acompanhamento de Saúde</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHistoricalNote}
                  onChange={(e) => setNewHistoricalNote(e.target.value)}
                  placeholder="Descreva a ação tomada ou observação de evolução do aluno..."
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!newHistoricalNote.trim()}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Registrar</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 3: Fine Visual & Contrast Tuning */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAppearanceControls(!showAppearanceControls)}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:text-rose-700 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-rose-600" />
                <span>{showAppearanceControls ? "Ocultar Controles Visuais de Alerta" : "Calibrar Brilho, Box-Shadow & Velocidade"}</span>
              </button>

              <span className="text-[10.5px] text-slate-500 font-mono">
                Modo: {isHighContrast ? "Alto Contraste Ativo (3.5px)" : "Normal (1.5px)"}
              </span>
            </div>

            {showAppearanceControls && (
              <div className="mt-3">
                <OccurrenceGlowConfigPanel
                  initialConfig={{
                    highContrast: isHighContrast,
                  }}
                  onChange={(cfg) => {
                    setIsHighContrast(cfg.highContrast);
                  }}
                  showCardPreview={false}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Imprimir relatório deste evento"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir Dossiê</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold font-serif text-xs flex items-center gap-1.5 shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Concluir Revisão</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
