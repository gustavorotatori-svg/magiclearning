import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  Users, 
  UserPlus, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  Info,
  Layers,
  BookOpen,
  MapPin,
  RefreshCw,
  ArrowLeft
} from "lucide-react";

export interface TimetableEntry {
  id: string;
  gradeId: string;
  day: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta";
  period: "08:00 - 08:50" | "08:50 - 09:40" | "10:00 - 10:50" | "10:50 - 11:40";
  subject: string;
  teacher: string;
  classroom: string;
}

const GRADES = [
  { id: "maternal-1", name: "Berçário das Estrelas (Maternal I)" },
  { id: "maternal-2", name: "Mundo Encantado (Maternal II)" },
  { id: "jardim-1", name: "Alfabetização Criativa (Jardim I)" },
  { id: "fundamental-1", name: "Exploradores Cósmicos (1º Ano)" }
];

const DAYS: Array<"Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta"> = [
  "Segunda", "Terça", "Quarta", "Quinta", "Sexta"
];

const PERIODS: Array<"08:00 - 08:50" | "08:50 - 09:40" | "10:00 - 10:50" | "10:50 - 11:40"> = [
  "08:00 - 08:50", "08:50 - 09:40", "10:00 - 10:50", "10:50 - 11:40"
];

const SUBJECTS_POOL = [
  "Psicomotricidade 🤸‍♀️",
  "Artes Visuais 🎨",
  "Musicalização Infantil 🎵",
  "Inglês Imersivo 🇬🇧",
  "Contação de Histórias 📖",
  "Robótica Recreativa 🤖",
  "Natureza e Sociedade 🌱",
  "Raciocínio Lógico 🔢"
];

const TEACHERS_POOL = [
  "Priscila Mendes",
  "Camila Rocha",
  "Prof. Gabriel",
  "Miss Sharon",
  "Carla Dias",
  "Felipe Castanhari",
  "Marina Godoy"
];

const CLASSROOMS_POOL = [
  "Ateliê de Criação",
  "Espaço Sonoro 1",
  "Sala Estelar 1",
  "Arena de Movimento",
  "Laboratório Maker",
  "Biblioteca Viva"
];

// Seed initial entries with some double booking conflicts to highlight the smart scanner feature!
const INITIAL_TIMETABLE_ENTRIES: TimetableEntry[] = [
  // Maternal I
  {
    id: "tt-1",
    gradeId: "maternal-1",
    day: "Segunda",
    period: "08:00 - 08:50",
    subject: "Psicomotricidade 🤸‍♀️",
    teacher: "Priscila Mendes",
    classroom: "Arena de Movimento"
  },
  {
    id: "tt-2",
    gradeId: "maternal-1",
    day: "Segunda",
    period: "08:50 - 09:40",
    subject: "Musicalização Infantil 🎵",
    teacher: "Prof. Gabriel",
    classroom: "Espaço Sonoro 1"
  },
  {
    id: "tt-3",
    gradeId: "maternal-1",
    day: "Terça",
    period: "10:00 - 10:50",
    subject: "Artes Visuais 🎨",
    teacher: "Camila Rocha",
    classroom: "Ateliê de Criação"
  },
  {
    id: "tt-4",
    gradeId: "maternal-1",
    day: "Quarta",
    period: "10:50 - 11:40",
    subject: "Inglês Imersivo 🇬🇧",
    teacher: "Miss Sharon",
    classroom: "Sala Estelar 1"
  },

  // Maternal II
  {
    id: "tt-5",
    gradeId: "maternal-2",
    day: "Segunda",
    period: "08:00 - 08:50",
    subject: "Contação de Histórias 📖",
    teacher: "Priscila Mendes", // CONFLICT: Priscila is in Maternal I and Maternal II at the same time!
    classroom: "Biblioteca Viva"
  },
  {
    id: "tt-6",
    gradeId: "maternal-2",
    day: "Segunda",
    period: "10:00 - 10:50",
    subject: "Robótica Recreativa 🤖",
    teacher: "Felipe Castanhari",
    classroom: "Laboratório Maker"
  },
  {
    id: "tt-7",
    gradeId: "maternal-2",
    day: "Quarta",
    period: "08:50 - 09:40",
    subject: "Artes Visuais 🎨",
    teacher: "Camila Rocha",
    classroom: "Ateliê de Criação"
  },

  // Jardim I
  {
    id: "tt-8",
    gradeId: "jardim-1",
    day: "Segunda",
    period: "08:50 - 09:40",
    subject: "Natureza e Sociedade 🌱",
    teacher: "Prof. Gabriel", // CONFLICT: Gabriel is in Maternal I and Jardim I at the same time!
    classroom: "Sala Estelar 1"
  },
  {
    id: "tt-9",
    gradeId: "jardim-1",
    day: "Quinta",
    period: "10:00 - 10:50",
    subject: "Raciocínio Lógico 🔢",
    teacher: "Marina Godoy",
    classroom: "Sala Estelar 1"
  }
];

interface TimetablePlannerProps {
  onBack?: () => void;
}

export function TimetablePlanner({ onBack }: TimetablePlannerProps = {}) {
  const [selectedGradeId, setSelectedGradeId] = useState<string>("maternal-1");
  const [entries, setEntries] = useState<TimetableEntry[]>(INITIAL_TIMETABLE_ENTRIES);
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<"Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta">("Segunda");
  const [selectedPeriod, setSelectedPeriod] = useState<"08:00 - 08:50" | "08:50 - 09:40" | "10:00 - 10:50" | "10:50 - 11:40">("08:00 - 08:50");
  
  // Selection fields for custom schedule
  const [subjectInput, setSubjectInput] = useState(SUBJECTS_POOL[0]);
  const [teacherInput, setTeacherInput] = useState(TEACHERS_POOL[0]);
  const [classroomInput, setClassroomInput] = useState(CLASSROOMS_POOL[0]);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper to find a specific entry in the timetable matrix
  const getEntryAt = (gradeId: string, day: string, period: string) => {
    return entries.find(e => e.gradeId === gradeId && e.day === day && e.period === period);
  };

  // Conflict Checking Engine
  // Checks if a teacher is double-booked on the same day and period in another grade
  const checkTeacherConflict = (entry: TimetableEntry) => {
    return entries.filter(e => 
      e.id !== entry.id && 
      e.teacher === entry.teacher && 
      e.day === entry.day && 
      e.period === entry.period
    );
  };

  // Checks if a classroom is double-booked at the same day/period
  const checkClassroomConflict = (entry: TimetableEntry) => {
    return entries.filter(e => 
      e.id !== entry.id && 
      e.classroom === entry.classroom && 
      e.day === entry.day && 
      e.period === entry.period
    );
  };

  // Handle open creation modal for specific slot
  const handleOpenSlotModal = (day: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta", period: "08:00 - 08:50" | "08:50 - 09:40" | "10:00 - 10:50" | "10:50 - 11:40") => {
    setSelectedDay(day);
    setSelectedPeriod(period);
    
    // Autofill with existing slot data if it already exists
    const existing = getEntryAt(selectedGradeId, day, period);
    if (existing) {
      setSubjectInput(existing.subject);
      setTeacherInput(existing.teacher);
      setClassroomInput(existing.classroom);
    } else {
      setSubjectInput(SUBJECTS_POOL[0]);
      setTeacherInput(TEACHERS_POOL[0]);
      setClassroomInput(CLASSROOMS_POOL[0]);
    }
    setIsModalOpen(true);
  };

  // Save changes to current slot
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    
    const existing = getEntryAt(selectedGradeId, selectedDay, selectedPeriod);
    const updatedEntries = [...entries];

    const tempEntry: TimetableEntry = {
      id: existing ? existing.id : `tt-${Date.now()}`,
      gradeId: selectedGradeId,
      day: selectedDay,
      period: selectedPeriod,
      subject: subjectInput,
      teacher: teacherInput,
      classroom: classroomInput
    };

    // Calculate conflict beforehand to warn the user
    const teacherConflicts = checkTeacherConflict(tempEntry);
    const roomConflicts = checkClassroomConflict(tempEntry);

    if (existing) {
      // Update entry
      const idx = entries.findIndex(e => e.id === existing.id);
      updatedEntries[idx] = tempEntry;
    } else {
      // Create new entry
      updatedEntries.push(tempEntry);
    }

    setEntries(updatedEntries);
    setIsModalOpen(false);

    // Dynamic warning feedback
    if (teacherConflicts.length > 0) {
      const conflictGrades = teacherConflicts.map(c => GRADES.find(g => g.id === c.gradeId)?.name || c.gradeId).join(", ");
      showToast(`⚠️ Professor(a) ${teacherInput} alocado, mas possui conflito simultâneo com: ${conflictGrades}!`, "error");
    } else if (roomConflicts.length > 0) {
      const conflictGrades = roomConflicts.map(c => GRADES.find(g => g.id === c.gradeId)?.name || c.gradeId).join(", ");
      showToast(`⚠️ Sala '${classroomInput}' reservada, mas possui conflito com: ${conflictGrades}!`, "error");
    } else {
      showToast(`✓ Horário salvo com sucesso para ${GRADES.find(g => g.id === selectedGradeId)?.name}!`, "success");
    }
  };

  // Delete a slotted entry
  const handleDeleteSlot = (entryId: string) => {
    setEntries(prev => prev.filter(e => e.id !== entryId));
    showToast("✓ Horário removido com sucesso.", "success");
  };

  // Quick action: clear whole schedule for current class
  const handleClearGradeSchedule = () => {
    if (window.confirm("Deseja realmente limpar toda a grade horária desta turma?")) {
      setEntries(prev => prev.filter(e => e.gradeId !== selectedGradeId));
      showToast("✓ Toda a grade horária desta turma foi redefinida.", "info");
    }
  };

  // Count total conflicts in the school to show in the header badge
  const totalSchoolConflicts = entries.reduce((acc, current) => {
    const tConflicts = checkTeacherConflict(current);
    const rConflicts = checkClassroomConflict(current);
    if (tConflicts.length > 0 || rConflicts.length > 0) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="bg-white/95 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6" id="timetable-planner-module">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer shrink-0 shadow-xs mr-1"
              title="Voltar ao Painel da Escola"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
            <Calendar className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-black text-base text-[#423326] dark:text-amber-100">
                Grade Horária & Alocação Inteligente
              </h3>
              <span className="bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/30 px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono tracking-wider">
                Novo Recurso 🚀
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-sans mt-0.5">
              Organize as disciplinas pedagógicas, salas de aula e detecte choques de horário de professores em tempo real.
            </p>
          </div>
        </div>

        {/* Global conflicts detector banner */}
        <div className="flex items-center gap-2">
          {totalSchoolConflicts > 0 ? (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-400 px-3.5 py-1.5 rounded-xl text-[10.5px] font-sans font-bold flex items-center gap-1.5 shadow-3xs">
              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Conflitos Identificados: <strong>{totalSchoolConflicts} choque(s)</strong></span>
            </div>
          ) : (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 px-3.5 py-1.5 rounded-xl text-[10.5px] font-sans font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Sistemas de Alocação Conciliados</span>
            </div>
          )}
        </div>
      </div>

      {/* OPERATIONS ROW */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/65 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 font-mono flex items-center gap-1 select-none">
            <Layers className="w-3.5 h-3.5 text-slate-400" /> Selecionar Turma:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {GRADES.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGradeId(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGradeId === g.id
                    ? "bg-amber-800 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-750 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800"
                }`}
              >
                {g.name.split(" (")[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleClearGradeSchedule}
            className="bg-white hover:bg-rose-50 text-rose-700 dark:bg-slate-900 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-800 font-bold px-3 py-1.5 rounded-xl text-[10.5px] uppercase font-mono tracking-wider transition-all"
          >
            Limpar Turma
          </button>
        </div>
      </div>

      {/* TIMETABLE GRID MATRIX */}
      <div className="overflow-x-auto border border-slate-150 dark:border-slate-850 rounded-2xl">
        <table className="w-full min-w-[700px] border-collapse bg-[#fffdfa] dark:bg-slate-900 text-left">
          <thead>
            <tr className="bg-[#423326] text-white border-b border-amber-900 text-[10.5px] font-black uppercase tracking-wider font-mono">
              <th className="py-3 px-4 w-[130px] border-r border-[#524336] text-center">Horário</th>
              {DAYS.map((day) => (
                <th key={day} className="py-3 px-3 w-[150px] border-r border-[#524336] text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-slate-850">
            {PERIODS.map((period) => (
              <tr key={period} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                
                {/* Time Indicator column */}
                <td className="py-4 px-3 font-mono text-[10px] text-center bg-slate-50 dark:bg-slate-950/60 border-r border-slate-150 dark:border-slate-850 font-bold text-slate-500">
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-550" />
                    <span>{period}</span>
                  </div>
                </td>

                {/* Days of week columns */}
                {DAYS.map((day) => {
                  const entry = getEntryAt(selectedGradeId, day, period);
                  const isTeacherConflicting = entry ? checkTeacherConflict(entry).length > 0 : false;
                  const isRoomConflicting = entry ? checkClassroomConflict(entry).length > 0 : false;
                  const hasConflict = isTeacherConflicting || isRoomConflicting;

                  return (
                    <td key={`${day}-${period}`} className="p-2 border-r border-slate-150 dark:border-slate-850 relative align-middle h-24">
                      {entry ? (
                        <div 
                          className={`group/slot relative h-full rounded-xl p-2.5 border flex flex-col justify-between transition-all duration-200 ${
                            hasConflict 
                              ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900 shadow-3xs" 
                              : "bg-[#fefefe] dark:bg-slate-950 border-[#eadfc8]/50 dark:border-slate-850 shadow-2xs hover:border-amber-400"
                          }`}
                        >
                          {/* Subject & Quick actions */}
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[11.5px] font-black text-[#423326] dark:text-amber-100 font-sans tracking-tight leading-tight block truncate">
                              {entry.subject}
                            </span>
                            
                            <div className="opacity-0 group-hover/slot:opacity-100 flex items-center gap-1 transition-all duration-150 shrink-0">
                              <button
                                onClick={() => handleOpenSlotModal(day, period)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                                title="Editar"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteSlot(entry.id)}
                                className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Allocation Info */}
                          <div className="space-y-0.5 mt-2">
                            <div className="flex items-center gap-1 text-[9.5px] text-slate-500 font-medium">
                              <Users className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{entry.teacher}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[9.5px] text-slate-450 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{entry.classroom}</span>
                            </div>
                          </div>

                          {/* Alerts Badges */}
                          {hasConflict && (
                            <div className="absolute -bottom-1.5 -right-1.5 bg-rose-600 text-white p-1 rounded-full shadow-lg border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-white" />
                            </div>
                          )}

                          {/* Hover tooltip detailing conflict */}
                          {hasConflict && (
                            <div className="hidden group-hover/slot:block absolute z-20 top-full left-0 right-0 mt-1 bg-slate-950 text-white p-2.5 rounded-xl text-[9.5px] font-sans leading-relaxed shadow-xl border border-slate-800">
                              <span className="font-bold text-rose-400 block mb-1">⚠️ Choque de Reserva Coletiva:</span>
                              {isTeacherConflicting && (
                                <p className="block">• Professor(a) <strong>{entry.teacher}</strong> já está alocado(a) em outra sala neste mesmo período.</p>
                              )}
                              {isRoomConflicting && (
                                <p className="block">• A sala <strong>{entry.classroom}</strong> está reservada para outra turma no mesmo período.</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenSlotModal(day, period)}
                          className="w-full h-full rounded-xl border border-dashed border-[#e6decb]/60 dark:border-slate-800 hover:border-amber-400/80 bg-slate-50/25 hover:bg-[#fcfaf3] dark:hover:bg-slate-850/40 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-amber-800 transition-all cursor-pointer group"
                        >
                          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] font-mono tracking-wider uppercase font-black">Agendar</span>
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QUICK ASSISTANCE INFO CARD */}
      <div className="bg-[#fcfaf5] dark:bg-slate-950 p-4 rounded-2xl border border-[#eadfc8]/45 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <strong className="text-slate-800 dark:text-slate-200 block font-bold">Como funciona a Alocação Inteligente?</strong>
          <p className="text-slate-500 leading-normal">
            O algoritmo verifica dinamicamente todo o barramento escolar. Se você alocar o mesmo professor ou a mesma sala em turmas diferentes no mesmo dia e horário, a interface exibirá um aviso vermelho piscante e gerará alertas de inconsistência para evitar erros de logística antes de publicar os quadros no mural dos pais.
          </p>
        </div>
      </div>

      {/* MODAL EDIT / CREATE DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-3xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-[#e6decb] dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#fdfbf6] dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-[#423326] dark:text-white text-sm">
                      Alocação de Período Acadêmico
                    </h4>
                    <p className="text-[9.5px] text-slate-450 font-mono mt-0.5">
                      {selectedDay} • {selectedPeriod}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveSlot} className="p-5 space-y-4">
                
                {/* Subject Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block font-mono">
                    Disciplina Pedagógica:
                  </label>
                  <select
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-205 dark:border-slate-850 bg-[#fefefe] dark:bg-slate-950 font-bold dark:text-slate-250 outline-none"
                  >
                    {SUBJECTS_POOL.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Teacher Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block font-mono">
                    Professor(a) Responsável:
                  </label>
                  <select
                    value={teacherInput}
                    onChange={(e) => setTeacherInput(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-205 dark:border-slate-850 bg-[#fefefe] dark:bg-slate-950 font-bold dark:text-slate-250 outline-none"
                  >
                    {TEACHERS_POOL.map((teach) => (
                      <option key={teach} value={teach}>{teach}</option>
                    ))}
                  </select>
                </div>

                {/* Classroom Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 block font-mono">
                    Sala / Ambiente Físico:
                  </label>
                  <select
                    value={classroomInput}
                    onChange={(e) => setClassroomInput(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-205 dark:border-slate-850 bg-[#fefefe] dark:bg-slate-950 font-bold dark:text-slate-250 outline-none"
                  >
                    {CLASSROOMS_POOL.map((room) => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                {/* Confirmations & actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Horário</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Floater Toast notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 max-w-sm p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-fade-in ${
          toast.type === "success" 
            ? "bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 border-emerald-250" 
            : toast.type === "error"
            ? "bg-rose-50 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100 border-rose-250"
            : "bg-blue-50 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100 border-blue-250"
        }`}>
          <div className="text-xs font-bold leading-relaxed">
            {toast.message}
          </div>
        </div>
      )}

    </div>
  );
}
