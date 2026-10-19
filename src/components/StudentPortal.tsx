import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  Smile, 
  Trophy, 
  ArrowLeft, 
  Flame, 
  Check, 
  Plus,
  Play,
  Pause,
  RotateCcw,
  Target,
  ListTodo,
  CalendarDays,
  HelpCircle,
  BellRing,
  BookMarked,
  Layers,
  ChevronDown,
  Camera,
  Compass,
  Heart,
  ShieldAlert
} from "lucide-react";
import StudentPhotoCameraModal from "./StudentPhotoCameraModal";
import { Estudante, SchoolBranding, Comunicado } from "../types";
import { RecommendationEngineWidget } from "./RecommendationEngineWidget";
import { trackUserActivity } from "../services/recommendationEngine";
import TextAdventureGame from "./TextAdventureGame";
import { ThemeSelector } from "./ThemeSelector";
import { LanguageSelector } from "./LanguageSelector";
import { SupportedLocale } from "../utils/i18n";
import { ThemePreference } from "../utils/themeManager";

export interface HomeworkTask {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  dueTime: string;
  estimatedMinutes: number;
  instructions: string;
  materials: string[];
  isCompleted: boolean;
  priority: "alta" | "media" | "normal";
}

export interface LearningGoal {
  id: string;
  subject: string;
  goalText: string;
  successCriteria: string;
  isAchieved: boolean;
  isDailyFocus?: boolean;
}

interface StudentPortalProps {
  estudante: Estudante;
  branding: SchoolBranding;
  comunicados: Comunicado[];
  activeTab?: string;
  onSelectTab?: (tab: "simplificada" | "horarios" | "conquistas" | "completa") => void;
  onBackToParents?: () => void;
  onGoToLanding?: () => void;
  onToast: (msg: string, type: "success" | "info" | "warning" | "error") => void;
  onUpdateStudentPhoto?: (studentId: string, photoUrl: string) => void;
  locale?: SupportedLocale;
  themePreference?: ThemePreference;
  onSelectThemePreference?: (pref: ThemePreference) => void;
  onSelectLocale?: (loc: SupportedLocale) => void;
}

const INITIAL_HOMEWORK_TASKS: HomeworkTask[] = [
  {
    id: "hw-1",
    title: "Exercícios de Fixação: Frações Equivalentes e Simplificação",
    subject: "Matemática",
    teacher: "Prof. Ricardo",
    dueTime: "Hoje às 17:30",
    estimatedMinutes: 30,
    instructions: "Resolver as questões de 1 a 6 da página 52 do livro didático. Deixar todos os cálculos das divisões e frações intermediárias registrados no caderno.",
    materials: ["Livro de Matemática (Pág. 52)", "Caderno de Exercícios", "Lápis e Borracha"],
    isCompleted: false,
    priority: "alta"
  },
  {
    id: "hw-2",
    title: "Leitura Interpretativa: Capítulo 4 de Literatura",
    subject: "Língua Portuguesa",
    teacher: "Profª. Camila",
    dueTime: "Hoje às 18:00",
    estimatedMinutes: 25,
    instructions: "Ler o Capítulo 4 ('A Descoberta no Quintal') e redigir no caderno um parágrafo reflexivo sobre a escolha feita pelo personagem principal.",
    materials: ["Livro 'Aventuras na Floresta' (Cap. 4)", "Caderno de Produção de Texto"],
    isCompleted: true,
    priority: "media"
  },
  {
    id: "hw-3",
    title: "Observação do Experimento: Condensação e Evaporação",
    subject: "Ciências da Natureza",
    teacher: "Profª. Luciana",
    dueTime: "Hoje às 19:00",
    estimatedMinutes: 15,
    instructions: "Observar as gotas de condensação na tampa do recipiente preparado em laboratório e preencher a tabela de registros da página 31.",
    materials: ["Apostila de Ciências (Pág. 31)", "Recipiente do Experimento"],
    isCompleted: false,
    priority: "normal"
  },
  {
    id: "hw-4",
    title: "Esboço no Caderno Maker: Conexões do Sensor Ultrassônico",
    subject: "Robótica & Maker",
    teacher: "Prof. Marcos",
    dueTime: "Amanhã às 07:30",
    estimatedMinutes: 20,
    instructions: "Desenhar as 4 portas de conexão do sensor de proximidade (VCC, Trig, Echo, GND) para agilizar a montagem no Lab Maker amanhã.",
    materials: ["Caderno Maker", "Régua"],
    isCompleted: false,
    priority: "normal"
  }
];

const INITIAL_LEARNING_GOALS: LearningGoal[] = [
  {
    id: "goal-1",
    subject: "Matemática",
    goalText: "Compreender como encontrar frações equivalentes multiplicando ou dividindo numerador e denominador.",
    successCriteria: "Resolver com segurança pelo menos 4 frações de exemplo sem consultar o gabarito.",
    isAchieved: false,
    isDailyFocus: true
  },
  {
    id: "goal-2",
    subject: "Língua Portuguesa",
    goalText: "Identificar adjetivos qualificadores e figuras de linguagem descritivas no Capítulo 4.",
    successCriteria: "Transcrever 3 frases expressivas do livro destacando os adjetivos.",
    isAchieved: true,
    isDailyFocus: false
  },
  {
    id: "goal-3",
    subject: "Língua Inglesa",
    goalText: "Memorizar e pronunciar 5 verbos relacionados à rotina matinal escolar.",
    successCriteria: "Criar 3 frases no Simple Present sobre horários de estudos.",
    isAchieved: false,
    isDailyFocus: false
  },
  {
    id: "goal-4",
    subject: "Ciências da Natureza",
    goalText: "Explicar com clareza a diferença entre os processos de evaporação e condensação da água.",
    successCriteria: "Escrever a explicação de 2 linhas na tabela do diário científico.",
    isAchieved: false,
    isDailyFocus: false
  }
];

export const StudentPortal: React.FC<StudentPortalProps> = ({
  estudante,
  branding,
  comunicados,
  activeTab = "simplificada",
  onSelectTab,
  onBackToParents,
  onGoToLanding,
  onToast,
  onUpdateStudentPhoto,
  locale = "pt",
  themePreference,
  onSelectThemePreference,
  onSelectLocale,
}) => {
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Visual Mode: "simplificada" (Lições & Metas) vs "completa" (Horários e Notas) vs "aventura" (RPG Textual)
  const [viewMode, setViewMode] = useState<"simplificada" | "completa" | "aventura">(() => {
    if (activeTab === "horarios" || activeTab === "conquistas" || activeTab === "completa") {
      return "completa";
    }
    return "simplificada";
  });

  // Homework Tasks state
  const [tasks, setTasks] = useState<HomeworkTask[]>(() => {
    const saved = localStorage.getItem(`student_tasks_${estudante.id}`);
    return saved ? JSON.parse(saved) : INITIAL_HOMEWORK_TASKS;
  });

  // Daily Learning Goals state
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>(() => {
    const saved = localStorage.getItem(`student_goals_${estudante.id}`);
    return saved ? JSON.parse(saved) : INITIAL_LEARNING_GOALS;
  });

  // Task Filter: todas | pendentes | concluidas
  const [taskFilter, setTaskFilter] = useState<"todas" | "pendentes" | "concluidas">("todas");

  // Study Focus Timer (Pomodoro 25 min)
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);
  const [focusedTaskTitle, setFocusedTaskTitle] = useState<string>("Estudo Geral");

  // Mood check-in state
  const [selectedMood, setSelectedMood] = useState<"animado" | "focado" | "tranquilo">("focado");

  // Add Task Modal & Add Goal Modal
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("Matemática");
  const [newTaskTime, setNewTaskTime] = useState("Hoje às 18:30");
  const [newTaskInstructions, setNewTaskInstructions] = useState("");

  const [newGoalSubject, setNewGoalSubject] = useState("Matemática");
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCriteria, setNewGoalCriteria] = useState("");

  // Sync with prop activeTab if changed from parent
  useEffect(() => {
    if (activeTab === "horarios" || activeTab === "conquistas" || activeTab === "completa") {
      setViewMode("completa");
    } else if (activeTab === "simplificada" || activeTab === "tarefas") {
      setViewMode("simplificada");
    }
  }, [activeTab]);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem(`student_tasks_${estudante.id}`, JSON.stringify(tasks));
  }, [tasks, estudante.id]);

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem(`student_goals_${estudante.id}`, JSON.stringify(learningGoals));
  }, [learningGoals, estudante.id]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      onToast(`Parabéns! Você completou 25 minutos de foco em: "${focusedTaskTitle}"! 🎉`, "success");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft, focusedTaskTitle, onToast]);

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.isCompleted;
          if (nextState) {
            onToast(`Lição "${t.title}" concluída com sucesso! ⭐`, "success");
            trackUserActivity({
              userId: "user-current",
              role: "aluno",
              type: "complete_homework",
              title: `Concluiu lição de ${t.subject}`,
              entityId: t.id,
              entityTitle: t.title,
              metadata: { priority: t.priority, estimatedMinutes: t.estimatedMinutes },
            });
          }
          return { ...t, isCompleted: nextState };
        }
        return t;
      })
    );
  };

  // Toggle learning goal achievement
  const handleToggleGoal = (goalId: string) => {
    setLearningGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const nextState = !g.isAchieved;
          if (nextState) {
            onToast(`Meta de aprendizado atingida! Excelente dedicação em ${g.subject}! 🚀`, "success");
            trackUserActivity({
              userId: "user-current",
              role: "aluno",
              type: "achieve_goal",
              title: `Conquistou meta em ${g.subject}`,
              entityId: g.id,
              entityTitle: g.goalText,
            });
          }
          return { ...g, isAchieved: nextState };
        }
        return g;
      })
    );
  };

  // Start study block on a specific task
  const handleStartFocusOnTask = (task: HomeworkTask) => {
    setFocusedTaskTitle(task.title);
    setTimerSecondsLeft(25 * 60);
    setIsTimerRunning(true);
    onToast(`Bloco de 25 minutos iniciado para: "${task.title}". Bons estudos! ⏳`, "info");
  };

  // Add custom task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: HomeworkTask = {
      id: `hw-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      teacher: "Anotação Pessoal",
      dueTime: newTaskTime.trim() || "Hoje",
      estimatedMinutes: 20,
      instructions: newTaskInstructions.trim() || "Revisar anotações no caderno e exercitar o conteúdo.",
      materials: ["Caderno"],
      isCompleted: false,
      priority: "normal"
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setNewTaskInstructions("");
    setShowAddTaskModal(false);
    onToast("Nova lição de estudo adicionada à sua lista de hoje!", "success");
  };

  // Add custom goal
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    const newGoal: LearningGoal = {
      id: `goal-${Date.now()}`,
      subject: newGoalSubject,
      goalText: newGoalText.trim(),
      successCriteria: newGoalCriteria.trim() || "Compreender e aplicar o conteúdo com autonomia.",
      isAchieved: false,
      isDailyFocus: false
    };

    setLearningGoals([...learningGoals, newGoal]);
    setNewGoalText("");
    setNewGoalCriteria("");
    setShowAddGoalModal(false);
    onToast("Nova meta de aprendizado do dia registrada com sucesso!", "success");
  };

  // Metrics calculations
  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const pendingTasksCount = totalTasks - completedTasksCount;

  const totalGoals = learningGoals.length;
  const achievedGoalsCount = learningGoals.filter((g) => g.isAchieved).length;

  const filteredTasks = useMemo(() => {
    if (taskFilter === "pendentes") return tasks.filter((t) => !t.isCompleted);
    if (taskFilter === "concluidas") return tasks.filter((t) => t.isCompleted);
    return tasks;
  }, [tasks, taskFilter]);

  const dailyFocusGoal = learningGoals.find((g) => g.isDailyFocus) || learningGoals[0];

  // Daily Schedule & Badges for the Expanded View
  const dailySchedule = [
    { time: "07:30 - 08:20", subject: "Língua Portuguesa", teacher: "Profª. Camila", room: "Sala 14 - Bloco A" },
    { time: "08:20 - 09:10", subject: "Matemática Aplicada", teacher: "Prof. Ricardo", room: "Sala 14 - Bloco A" },
    { time: "09:10 - 09:30", subject: "Intervalo & Convivência", teacher: "Pátio Central", room: "Área de Convivência" },
    { time: "09:30 - 10:20", subject: "Robótica & Maker", teacher: "Prof. Marcos", room: "Laboratório Maker" },
    { time: "10:20 - 11:10", subject: "Ciências da Natureza", teacher: "Profª. Luciana", room: "Laboratório de Ciências" },
    { time: "11:10 - 12:00", subject: "Educação Física", teacher: "Prof. Diego", room: "Quadra Poliesportiva" }
  ];

  const badges = [
    { id: "b1", title: "Explorador Curioso", desc: "Completou 5 leituras extras no bimestre", unlocked: true },
    { id: "b2", title: "Mestre da Lógica", desc: "Nota máxima nas últimas listas de matemática", unlocked: true },
    { id: "b3", title: "Colaboração Maker", desc: "Destaque colaborativo no projeto de robótica", unlocked: true },
    { id: "b4", title: "Pontualidade Nota 10", desc: "Zero atrasos na entrada nas últimas 3 semanas", unlocked: false }
  ];

  // Format timer display
  const minutes = Math.floor(timerSecondsLeft / 60);
  const seconds = timerSecondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto pb-16 font-sans">
      
      {/* 1. CABEÇALHO DO ESTUDANTE & ALTERNADOR DE MODO (Visualização Simplificada vs Visão Completa) */}
      <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Identificação do Estudante */}
          <div className="flex items-center gap-3.5">
            <div className="relative group shrink-0">
              <img
                src={estudante.avatar || "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&q=80&w=150"}
                alt={estudante.name}
                className="w-13 h-13 rounded-xl object-cover border border-amber-300 dark:border-amber-700/60"
              />
              <button
                type="button"
                onClick={() => setIsCameraModalOpen(true)}
                className="absolute inset-0 bg-black/50 text-white rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer shadow-sm"
                title="Tirar nova foto com a câmera"
                aria-label="Tirar nova foto de perfil"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                  {locale === "en" ? "Hello, " : "Olá, "}{estudante.name.split(" ")[0]}!
                </h1>
                <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-400/30 px-2 py-0.5 rounded-md">
                  {estudante.grade}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-750 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={locale === "en" ? "Update profile photo" : "Atualizar foto de perfil"}
                >
                  <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{locale === "en" ? "Photo" : "Foto"}</span>
                </button>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-0.5">
                {branding.schoolName}
              </p>
            </div>
          </div>

          {/* Alternador de Modo de Visualização & Controles de Tema/Idioma */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Theme & Language Selectors */}
            <div className="flex items-center gap-1.5 shrink-0">
              {themePreference && onSelectThemePreference && (
                <ThemeSelector
                  themePreference={themePreference}
                  onSelectTheme={onSelectThemePreference}
                  variant="compact"
                  locale={locale}
                />
              )}
              {onSelectLocale && (
                <LanguageSelector
                  currentLocale={locale}
                  onSelectLocale={onSelectLocale}
                  variant="compact"
                  showLabel={true}
                />
              )}
            </div>

            <div className="inline-flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700 text-xs">
              <button
                type="button"
                id="btn-modo-simplificado"
                onClick={() => {
                  setViewMode("simplificada");
                  if (onSelectTab) onSelectTab("simplificada");
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "simplificada"
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
                title={locale === "en" ? "Tasks" : "Tarefas"}
              >
                <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{locale === "en" ? "Tasks" : "Tarefas"}</span>
              </button>

              <button
                type="button"
                id="btn-visao-completa"
                onClick={() => {
                  setViewMode("completa");
                  if (onSelectTab) onSelectTab("completa");
                }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "completa"
                    ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs border border-slate-300 dark:border-slate-700"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
                title={locale === "en" ? "Overview" : "Visão geral"}
              >
                <Layers className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span>{locale === "en" ? "Overview" : "Geral"}</span>
              </button>

              <button
                type="button"
                id="btn-tab-aventura-rpg"
                onClick={() => setViewMode("aventura")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "aventura"
                    ? "bg-amber-500 text-slate-950 font-black shadow-xs border border-amber-400"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                }`}
                title={locale === "en" ? "RPG" : "RPG"}
              >
                <Compass className="w-3.5 h-3.5 text-amber-500" />
                <span>{locale === "en" ? "RPG" : "RPG"}</span>
              </button>
            </div>

            {onBackToParents && (
              <button
                type="button"
                onClick={onBackToParents}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-[0.98]"
                title={locale === "en" ? "Back" : "Voltar"}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span>{locale === "en" ? "Back" : "Voltar"}</span>
              </button>
            )}
          </div>
        </div>
      </header>


      {/* 🧠 MOTOR DE RECOMENDAÇÕES DO ESTUDANTE & MISSÕES DE APRENDIZADO */}
      <RecommendationEngineWidget
        role="aluno"
        student={estudante}
        comunicados={comunicados}
        onExecuteAction={(rec) => {
          if (rec.actionType === "navigate_tab" && rec.actionPayload?.tab) {
            const targetTab = rec.actionPayload.tab;
            if (targetTab === "tarefas" || targetTab === "simplificada") {
              setViewMode("simplificada");
              if (onSelectTab) onSelectTab("simplificada");
            } else if (targetTab === "horarios") {
              setViewMode("completa");
              if (onSelectTab) onSelectTab("horarios");
            } else if (targetTab === "conquistas") {
              setViewMode("completa");
              if (onSelectTab) onSelectTab("conquistas");
            }
          }
        }}
        onToast={onToast}
      />

      {/* =========================================================================
          2. VISUALIZAÇÃO SIMPLIFICADA (Foco em Lições de Casa e Metas de Aprendizado)
          ========================================================================= */}
      {viewMode === "simplificada" && (
        <div className="space-y-6">

          {/* 🏰 BANNER DE ACESSO AO JOGO DE AVENTURA TEXTUAL COM SISTEMA DE VIDA */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/70 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Desafio Pedagógico & RPG
                  </span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.2 rounded-full font-mono font-bold flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 fill-rose-400" />
                    <span>Sistema de Vida & Perigos Ativo</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight mt-0.5">
                  A Cripta do Conhecimento Perdido (Aventura Textual)
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Decisões imprudentes causam perda de pontos de vida (HP) por armadilhas e perigos. Escolhas sábias e bálsamos curam sua integridade vital até alcançar o Códice!
                </p>
              </div>
            </div>
            <button
              type="button"
              id="btn-iniciar-aventura-banner"
              onClick={() => setViewMode("aventura")}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>Jogar Aventura</span>
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>

          {/* BARRA DE PROGRESSO & INDICADORES DO DIA */}
          <section aria-label="Progresso do Dia" className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                  Progresso Diário de Aprendizado
                </span>
                <h2 className="font-serif text-base sm:text-lg font-bold text-slate-950 dark:text-white mt-0.5">
                  Suas Conquistas de Hoje
                </h2>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-700 dark:text-slate-300 block text-xs font-semibold">Lições Feitas</span>
                  <span className="font-mono font-bold text-slate-950 dark:text-white text-sm">
                    {completedTasksCount} de {totalTasks}
                  </span>
                </div>
                <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
                <div>
                  <span className="text-slate-700 dark:text-slate-300 block text-xs font-semibold">Metas Atingidas</span>
                  <span className="font-mono font-bold text-amber-800 dark:text-amber-300 text-sm">
                    {achievedGoalsCount} de {totalGoals}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de progresso linear contínua */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${
                    totalTasks + totalGoals > 0
                      ? Math.round(((completedTasksCount + achievedGoalsCount) / (totalTasks + totalGoals)) * 100)
                      : 0
                  }%`
                }}
              />
            </div>
          </section>

          {/* DESTAQUE EDITORIAL: META PRINCIPAL DE FOCO DO DIA */}
          {dailyFocusGoal && (
            <section
              aria-label="Meta de Foco do Dia"
              className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-2xl p-5 sm:p-6 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/70 dark:border-amber-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-amber-950 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/80 px-2.5 py-0.5 rounded">
                    Meta Principal de Foco • {dailyFocusGoal.subject}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleToggleGoal(dailyFocusGoal.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    dailyFocusGoal.isAchieved
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{dailyFocusGoal.isAchieved ? "Meta Concluída!" : "Concluir Meta"}</span>
                </button>
              </div>

              <div className="mt-3.5">
                <p className="font-serif text-base sm:text-lg font-bold text-slate-950 dark:text-amber-100 leading-snug">
                  "{dailyFocusGoal.goalText}"
                </p>
                <p className="text-xs text-slate-800 dark:text-slate-200 mt-2 font-medium">
                  <strong className="text-slate-950 dark:text-white">Critério de Sucesso do Professor:</strong> {dailyFocusGoal.successCriteria}
                </p>
              </div>
            </section>
          )}

          {/* GRID: METAS DE APRENDIZADO DO DIA & CRONÔMETRO DE ESTUDO */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Coluna 1 (7 cols): Metas de Aprendizado do Dia */}
            <section
              aria-label="Metas de Aprendizado"
              className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h2 className="font-serif text-base font-bold text-slate-950 dark:text-white">
                      Metas de Aprendizado de Hoje
                    </h2>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-0.5">
                      Objetivos conceituais que você vai dominar ao terminar os estudos
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddGoalModal(true)}
                    className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Adicionar meta própria de aprendizado"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nova Meta</span>
                  </button>
                </div>

                {/* Lista estruturada de metas */}
                <div className="space-y-3">
                  {learningGoals.map((goal) => {
                    return (
                      <div
                        key={goal.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          goal.isAchieved
                            ? "bg-slate-50/60 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-80"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleGoal(goal.id)}
                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              goal.isAchieved
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300 dark:border-slate-700 hover:border-amber-400"
                            }`}
                            aria-label={`Marcar meta como ${goal.isAchieved ? "não atingida" : "atingida"}`}
                          >
                            {goal.isAchieved && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold uppercase text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                                {goal.subject}
                              </span>
                              {goal.isDailyFocus && (
                                <span className="text-[10px] font-mono font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700">
                                  Foco Principal
                                </span>
                              )}
                            </div>

                            <p className={`text-xs sm:text-sm font-semibold mt-1.5 leading-relaxed ${
                              goal.isAchieved ? "line-through text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"
                            }`}>
                              {goal.goalText}
                            </p>

                            <p className="text-xs text-slate-800 dark:text-slate-200 mt-1.5 font-medium">
                              <strong className="text-slate-950 dark:text-white">Critério:</strong> {goal.successCriteria}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dica de estudo */}
              <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2 font-medium">
                <BookMarked className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Ao atingir uma meta, revise o raciocínio mental antes de passar para a próxima lição.</span>
              </div>
            </section>

            {/* Coluna 2 (5 cols): Cronômetro de Estudo Focado (Pomodoro 25 min) */}
            <section
              aria-label="Cronômetro de Foco"
              className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h2 className="font-serif text-base font-bold text-slate-950 dark:text-white">
                      Bloco de Foco (25 min)
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    Método Pomodoro
                  </span>
                </div>

                <div className="text-center py-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-slate-950 dark:text-white block">
                    {formattedTime}
                  </span>
                  <span className="text-xs text-slate-800 dark:text-slate-200 mt-2 block truncate px-4 font-semibold">
                    Foco: <strong className="text-slate-950 dark:text-white">{focusedTaskTitle}</strong>
                  </span>
                </div>

                {/* Controles do Timer */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isTimerRunning
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950 hover:opacity-90"
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isTimerRunning ? "Pausar Estudo" : "Iniciar Foco"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSecondsLeft(25 * 60);
                    }}
                    className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    title="Reiniciar 25 minutos"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Humor e Disposição para o Estudo */}
              <div className="mt-6 pt-3.5 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-850 dark:text-slate-100 block mb-2">
                  Como está sua energia para estudar hoje?
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: "animado", label: "Animado 🌟" },
                    { id: "focado", label: "Focado 🧠" },
                    { id: "tranquilo", label: "Tranquilo 🌿" }
                  ].map((mood) => {
                    const isSelected = selectedMood === mood.id;
                    return (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => {
                          setSelectedMood(mood.id as any);
                          onToast(`Disposição registrada: ${mood.label}. Bons estudos!`, "success");
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border text-center ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-500 text-amber-950 dark:text-amber-200"
                            : "bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {mood.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

          </div>

          {/* =========================================================================
              SEÇÃO PRINCIPAL: LIÇÕES DE CASA DO DIA (Tarefas e Atividades Escolares)
              ========================================================================= */}
          <section aria-label="Lições de Casa" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                    Lições de Casa de Hoje
                  </h2>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                  Atividades enviadas pelos professores para reforçar o aprendizado em casa
                </p>
              </div>

              {/* Filtro de Tarefas & Botão Adicionar */}
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setTaskFilter("todas")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                      taskFilter === "todas"
                        ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:text-slate-950"
                    }`}
                  >
                    Todas ({totalTasks})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter("pendentes")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                      taskFilter === "pendentes"
                        ? "bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-200 shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:text-slate-950"
                    }`}
                  >
                    Pendentes ({pendingTasksCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskFilter("concluidas")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                      taskFilter === "concluidas"
                        ? "bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:text-slate-950"
                    }`}
                  >
                    Feitas ({completedTasksCount})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 text-white dark:bg-amber-500 dark:text-slate-950 text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Lição</span>
                </button>
              </div>
            </div>

            {/* LISTA ESTRUTURADA DE LIÇÕES */}
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-700 dark:text-slate-300 text-xs font-semibold">
                Nenhuma lição encontrada para o filtro selecionado.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredTasks.map((task) => {
                  return (
                    <article
                      key={task.id}
                      className={`py-4 first:pt-0 last:pb-0 transition-all ${
                        task.isCompleted ? "opacity-75" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        
                        {/* Checkbox Amplo de Conclusão */}
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            task.isCompleted
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-400 dark:border-slate-600 hover:border-amber-500 bg-white dark:bg-slate-950"
                          }`}
                          aria-label={`Marcar ${task.title} como ${task.isCompleted ? "pendente" : "concluída"}`}
                        >
                          {task.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          
                          {/* Metadados: Disciplina, Professor, Prazo e Tempo Estimado */}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                              {task.subject}
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 font-semibold">
                              {task.teacher}
                            </span>
                            <span className="text-slate-400 dark:text-slate-600">•</span>
                            <span className="font-mono text-amber-800 dark:text-amber-300 font-bold">
                              {task.dueTime}
                            </span>
                            <span className="text-slate-400 dark:text-slate-600">•</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              Estimado: {task.estimatedMinutes} min
                            </span>
                          </div>

                          {/* Título da Lição */}
                          <h3 className={`font-bold text-sm sm:text-base mt-1.5 ${
                            task.isCompleted ? "line-through text-slate-500 dark:text-slate-400" : "text-slate-950 dark:text-white"
                          }`}>
                            {task.title}
                          </h3>

                          {/* Instruções Detalhadas */}
                          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-1.5 leading-relaxed font-normal">
                            {task.instructions}
                          </p>

                          {/* Materiais Necessários */}
                          {task.materials && task.materials.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                              <span className="text-xs uppercase font-mono text-slate-700 dark:text-slate-300 font-bold">
                                Materiais:
                              </span>
                              {task.materials.map((mat, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-medium"
                                >
                                  {mat}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Ações Rápidas */}
                          <div className="flex items-center gap-2 mt-3 pt-2">
                            {!task.isCompleted ? (
                              <button
                                type="button"
                                onClick={() => handleStartFocusOnTask(task)}
                                className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300/80 dark:border-amber-800/80 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Focar nesta Lição (25 min)</span>
                              </button>
                            ) : (
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Concluída com dedicação!</span>
                              </span>
                            )}
                          </div>

                        </div>

                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      )}

      {/* =========================================================================
          3. VISÃO COMPLETA (Horário de Aulas, Notas Bimestrais e Conquistas)
          ========================================================================= */}
      {viewMode === "completa" && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-300 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              Você está na <strong>Visão Completa</strong> do Aluno com quadro de horários e boletim.
            </span>
            <button
              type="button"
              onClick={() => setViewMode("simplificada")}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black hover:bg-amber-600 cursor-pointer shadow-2xs"
            >
              Voltar ao Modo Foco
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Horário de Aulas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-amber-500" />
                  <h2 className="font-serif text-base font-bold text-slate-950 dark:text-white">
                    Grade Horária de Hoje
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  Turno Manhã
                </span>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {dailySchedule.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {item.subject}
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {item.teacher} • {item.room}
                      </span>
                    </div>
                    <span className="font-mono text-slate-800 dark:text-slate-200 text-xs font-bold">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medalhas e Conquistas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <h2 className="font-serif text-base font-bold text-slate-950 dark:text-white">
                    Conquistas & Destaques
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300">
                  3 Desbloqueadas
                </span>
              </div>

              <div className="space-y-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      b.unlocked
                        ? "border-amber-300 dark:border-amber-800 bg-amber-500/10 dark:bg-amber-950/30"
                        : "border-slate-300 dark:border-slate-800 opacity-60"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-950 dark:text-white block">
                        {b.title}
                      </span>
                      <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                        {b.desc}
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      b.unlocked ? "bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-100" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}>
                      {b.unlocked ? "Ativa" : "Bloqueada"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. VISUALIZAÇÃO DA AVENTURA TEXTUAL (RPG COM SISTEMA DE VIDA E PERIGOS)
          ========================================================================= */}
      {viewMode === "aventura" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setViewMode("simplificada")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>{locale === "en" ? "Back to Student Tasks" : "Voltar ao Painel de Lições do Aluno"}</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 dark:text-slate-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{locale === "en" ? "Gamified Quest Active" : "Ambiente Gamificado Ativo"}</span>
            </div>
          </div>

          <TextAdventureGame
            playerName={estudante.name}
            onToast={onToast}
            locale={locale}
          />
        </div>
      )}

      {/* =========================================================================
          MODAIS: ADICIONAR LIÇÃO E ADICIONAR META PESSOAL
          ========================================================================= */}
      
      {/* Modal Adicionar Lição */}
      <AnimatePresence>
        {showAddTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-serif text-base font-bold text-slate-950 dark:text-white">
                  Adicionar Lição de Casa / Tarefa
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Disciplina
                  </label>
                  <select
                    value={newTaskSubject}
                    onChange={(e) => setNewTaskSubject(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Matemática">Matemática</option>
                    <option value="Língua Portuguesa">Língua Portuguesa</option>
                    <option value="Ciências da Natureza">Ciências da Natureza</option>
                    <option value="História & Geografia">História & Geografia</option>
                    <option value="Língua Inglesa">Língua Inglesa</option>
                    <option value="Robótica & Maker">Robótica & Maker</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Título da Tarefa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Exercícios da página 45"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Instruções ou páginas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Instruções para a realização..."
                    value={newTaskInstructions}
                    onChange={(e) => setNewTaskInstructions(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Prazo de Entrega
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Hoje às 18:00"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTaskModal(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black cursor-pointer shadow-2xs"
                  >
                    Salvar Lição
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Adicionar Meta de Aprendizado */}
      <AnimatePresence>
        {showAddGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="font-serif text-base font-bold text-slate-950 dark:text-white">
                  Nova Meta de Aprendizado do Dia
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Disciplina
                  </label>
                  <select
                    value={newGoalSubject}
                    onChange={(e) => setNewGoalSubject(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Matemática">Matemática</option>
                    <option value="Língua Portuguesa">Língua Portuguesa</option>
                    <option value="Ciências da Natureza">Ciências da Natureza</option>
                    <option value="História & Geografia">História & Geografia</option>
                    <option value="Língua Inglesa">Língua Inglesa</option>
                    <option value="Robótica & Maker">Robótica & Maker</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    O que você quer aprender / dominar hoje?
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ex: Compreender multiplicação com decimais..."
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                    Critério para saber se aprendeu
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Resolver 3 exercícios sem errar"
                    value={newGoalCriteria}
                    onChange={(e) => setNewGoalCriteria(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddGoalModal(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black cursor-pointer shadow-2xs"
                  >
                    Registrar Meta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Camera Capture Modal for Student Profile Picture */}
      <StudentPhotoCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        student={estudante}
        onPhotoCaptured={(studentId, photoDataUrl) => {
          if (onUpdateStudentPhoto) {
            onUpdateStudentPhoto(studentId, photoDataUrl);
          }
          setIsCameraModalOpen(false);
        }}
        onToast={(msg, type) => onToast(msg, type)}
      />

    </div>
  );
};
