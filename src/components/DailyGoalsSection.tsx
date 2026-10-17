import React, { useState, useEffect, useMemo } from "react";
import {
  Target,
  Check,
  Plus,
  RotateCcw,
  Sparkles,
  BookOpen,
  Heart,
  Clock,
  Trash2,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Smile,
  X
} from "lucide-react";
import { DailyGoalItem, Estudante } from "../types";

interface DailyGoalsSectionProps {
  student: Estudante;
  branding?: any;
}

const DEFAULT_GOALS: Omit<DailyGoalItem, "id">[] = [
  {
    title: "Organizar mochila, estojo e verificar a agenda de recados",
    category: "rotina",
    completed: true,
    timeOfDay: "manha",
    notes: "Conferir se todos os cadernos do dia estão na mochila."
  },
  {
    title: "Consumir lanche saudável e manter a hidratação (garrafa cheia)",
    category: "saude",
    completed: true,
    timeOfDay: "manha",
    notes: "Fruta da estação e água fresca durante as aulas."
  },
  {
    title: "Leitura de 20 minutos do livro paradidático",
    category: "pedagogico",
    completed: false,
    timeOfDay: "tarde",
    notes: "Capítulo atual do livro de literatura infantojuvenil."
  },
  {
    title: "Concluir as lições de casa e atividades extraclasse",
    category: "pedagogico",
    completed: false,
    timeOfDay: "tarde",
    notes: "Exercícios de matemática e caderno de caligrafia."
  },
  {
    title: "Organizar a mesa de estudos e guardar os materiais utilizados",
    category: "organizacao",
    completed: false,
    timeOfDay: "noite",
    notes: "Manter o espaço de aprendizado limpo para o dia seguinte."
  },
  {
    title: "Rotina de relaxamento e sono no horário estipulado (mínimo 8h)",
    category: "saude",
    completed: false,
    timeOfDay: "noite",
    notes: "Desconectar das telas 30 minutos antes de deitar."
  }
];

export function DailyGoalsSection({ student, branding }: DailyGoalsSectionProps) {
  const studentFirstName = student.name.split(" ")[0];
  const storageKey = `school_daily_goals_${student.id}`;
  const streakKey = `school_goals_streak_${student.id}`;

  // Initialize goals from localStorage or defaults
  const [goals, setGoals] = useState<DailyGoalItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Erro ao carregar metas diárias:", e);
    }
    return DEFAULT_GOALS.map((g, idx) => ({
      ...g,
      id: `goal-${student.id}-${idx + 1}`,
      studentId: student.id
    }));
  });

  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<DailyGoalItem["category"]>("rotina");
  const [newTimeOfDay, setNewTimeOfDay] = useState<DailyGoalItem["timeOfDay"]>("tarde");
  const [newNotes, setNewNotes] = useState("");
  const [streakDays, setStreakDays] = useState(() => {
    try {
      const saved = localStorage.getItem(streakKey);
      return saved ? parseInt(saved, 10) : 4;
    } catch {
      return 4;
    }
  });

  // Save to localStorage when goals change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(goals));
    } catch (e) {
      console.error("Erro ao salvar metas diárias:", e);
    }
  }, [goals, storageKey]);

  // Handle student change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`school_daily_goals_${student.id}`);
      if (saved) {
        setGoals(JSON.parse(saved));
      } else {
        setGoals(
          DEFAULT_GOALS.map((g, idx) => ({
            ...g,
            id: `goal-${student.id}-${idx + 1}`,
            studentId: student.id
          }))
        );
      }
      const savedStreak = localStorage.getItem(`school_goals_streak_${student.id}`);
      setStreakDays(savedStreak ? parseInt(savedStreak, 10) : 4);
    } catch {
      // Fallback
    }
  }, [student.id]);

  // Statistics calculation
  const totalCount = goals.length;
  const completedCount = useMemo(() => goals.filter((g) => g.completed).length, [goals]);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  // Toggle goal completion
  const handleToggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextCompleted = !g.completed;
          return {
            ...g,
            completed: nextCompleted,
            completedAt: nextCompleted
              ? new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
              : undefined
          };
        }
        return g;
      })
    );
  };

  // Add new custom goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newGoal: DailyGoalItem = {
      id: `goal-${student.id}-${Date.now()}`,
      studentId: student.id,
      title: newTitle.trim(),
      category: newCategory,
      completed: false,
      timeOfDay: newTimeOfDay,
      notes: newNotes.trim() || undefined,
      isCustom: true
    };

    setGoals((prev) => [...prev, newGoal]);
    setNewTitle("");
    setNewNotes("");
    setIsAddModalOpen(false);
  };

  // Delete goal
  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Reset all goals for today
  const handleResetGoals = () => {
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        completed: false,
        completedAt: undefined
      }))
    );
  };

  // Mark all goals as complete
  const handleMarkAllComplete = () => {
    const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setGoals((prev) =>
      prev.map((g) => ({
        ...g,
        completed: true,
        completedAt: g.completedAt || timeStr
      }))
    );
  };

  // Filtered goals
  const filteredGoals = useMemo(() => {
    if (selectedCategory === "todas") return goals;
    return goals.filter((g) => g.category === selectedCategory);
  }, [goals, selectedCategory]);

  // Category labels and colors
  const getCategoryMeta = (cat: DailyGoalItem["category"]) => {
    switch (cat) {
      case "rotina":
        return { label: "Rotina", badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300" };
      case "pedagogico":
        return { label: "Pedagógico", badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300" };
      case "saude":
        return { label: "Saúde & Bem-estar", badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300" };
      case "organizacao":
        return { label: "Organização", badgeBg: "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300" };
      case "socioemocional":
        return { label: "Socioemocional", badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300" };
      default:
        return { label: "Geral", badgeBg: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" };
    }
  };

  const getTimeOfDayLabel = (time?: DailyGoalItem["timeOfDay"]) => {
    switch (time) {
      case "manha":
        return "Manhã";
      case "tarde":
        return "Tarde";
      case "noite":
        return "Noite";
      default:
        return "Dia Todo";
    }
  };

  // Formatted date string in Portuguese
  const todayFormatted = useMemo(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };
    const str = now.toLocaleDateString("pt-BR", options);
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);

  return (
    <div
      id="daily-goals-section"
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Header with Title and Streak Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider">
              Acompanhamento Diário
            </span>
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {todayFormatted}
            </span>
          </div>

          <h3 className="font-sans font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
            Metas Diárias de {studentFirstName}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Checklist de hábitos pedagógicos, rotina escolar e desenvolvimento integral do aluno.
          </p>
        </div>

        {/* Action Buttons & Streak pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Consistency Streak Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/60 dark:border-orange-900/40 text-xs font-semibold"
            title="Sequência de dias completando metas"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>{streakDays} dias seguidos</span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Meta</span>
          </button>
        </div>
      </div>

      {/* 📊 Interactive Progress Bar Block */}
      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 rounded-xl p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Progresso do Dia
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                isAllCompleted
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : progressPercent >= 50
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {isAllCompleted
                ? "Tudo Concluído! 🌟"
                : progressPercent >= 50
                ? "Em Andamento 🚀"
                : "Início do Dia"}
            </span>
          </div>

          <div className="text-right">
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
              {completedCount} de {totalCount}
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500 ml-1">
              ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* The Animated Progress Bar Track & Fill */}
        <div className="w-full h-3 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isAllCompleted
                ? "bg-emerald-500"
                : progressPercent >= 60
                ? "bg-amber-500"
                : "bg-slate-700 dark:bg-slate-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
          <span>
            {isAllCompleted
              ? `Parabéns! Todas as metas diárias de ${studentFirstName} foram cumpridas hoje.`
              : `${totalCount - completedCount} ${
                  totalCount - completedCount === 1 ? "meta restante" : "metas restantes"
                } para completar a rotina de hoje.`}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetGoals}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 hover:underline cursor-pointer"
              title="Desmarcar todas as metas"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reiniciar</span>
            </button>
            <button
              type="button"
              onClick={handleMarkAllComplete}
              className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
            >
              Concluir Todas
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: "todas", label: "Todas as Metas" },
          { id: "rotina", label: "Rotina" },
          { id: "pedagogico", label: "Pedagógico" },
          { id: "saude", label: "Saúde" },
          { id: "organizacao", label: "Organização" }
        ].map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Goals Checklist */}
      <div className="space-y-2" role="list" aria-label="Lista de metas diárias">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 space-y-2">
            <Smile className="w-6 h-6 mx-auto text-slate-400" />
            <p className="text-xs">Nenhuma meta cadastrada nesta categoria.</p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
            >
              + Adicionar meta para {studentFirstName}
            </button>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const meta = getCategoryMeta(goal.category);
            const timeLabel = getTimeOfDayLabel(goal.timeOfDay);

            return (
              <div
                key={goal.id}
                role="listitem"
                className={`group flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  goal.completed
                    ? "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-850 opacity-80"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {/* Checkbox & Text Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleGoal(goal.id)}
                    aria-label={`Marcar ${goal.title} como ${goal.completed ? "pendente" : "concluída"}`}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      goal.completed
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-800"
                    }`}
                  >
                    {goal.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`text-xs font-semibold cursor-pointer transition-colors ${
                          goal.completed
                            ? "text-slate-400 dark:text-slate-500 line-through"
                            : "text-slate-800 dark:text-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {goal.title}
                      </span>
                    </div>

                    {goal.notes && (
                      <p
                        className={`text-[11px] leading-relaxed ${
                          goal.completed
                            ? "text-slate-400 dark:text-slate-500"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {goal.notes}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded font-medium ${meta.badgeBg}`}>
                        {meta.label}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {timeLabel}
                      </span>
                      {goal.completed && goal.completedAt && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Feito às {goal.completedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-opacity cursor-pointer shrink-0"
                  title="Remover meta"
                  aria-label={`Remover meta ${goal.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add Goal Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-add-goal-title"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4.5 h-4.5 text-amber-600" />
                <h4 id="modal-add-goal-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Nova Meta para {studentFirstName}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Título da Meta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Treinar leitura de 15 minutos..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Categoria
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DailyGoalItem["category"])}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="rotina">Rotina</option>
                    <option value="pedagogico">Pedagógico</option>
                    <option value="saude">Saúde & Bem-estar</option>
                    <option value="organizacao">Organização</option>
                    <option value="socioemocional">Socioemocional</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Momento do Dia
                  </label>
                  <select
                    value={newTimeOfDay}
                    onChange={(e) => setNewTimeOfDay(e.target.value as DailyGoalItem["timeOfDay"])}
                    className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                    <option value="dia_todo">Dia Todo</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Instruções ou Observações (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Verificar página 42 do livro..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
