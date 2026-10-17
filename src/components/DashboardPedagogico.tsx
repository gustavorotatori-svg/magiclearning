import React, { useState, useEffect } from "react";
import { D3CorrelationChart } from "./D3CorrelationChart";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Brain, 
  Palette, 
  Users, 
  Rocket, 
  Compass, 
  Award, 
  CheckCircle, 
  TrendingUp, 
  MessageSquare, 
  BookOpen, 
  Star, 
  ArrowRight, 
  ArrowLeft,
  Calendar, 
  Filter, 
  Plus, 
  ChevronRight, 
  HelpCircle, 
  GraduationCap, 
  History, 
  Activity,
  ThumbsUp,
  Sliders,
  Check,
  X,
  Bell,
  Phone,
  Send,
  Smartphone,
  Mail,
  Clock,
  Save,
  ShieldCheck
} from "lucide-react";

interface StudentScatterPoint {
  id: string;
  name: string;
  grade: string;
  portalUsage: number; // 15% to 98%
  consolidatedScore: number; // 5.2 to 9.8
  sessionsPerMonth: number;
  completedTasks: number;
  category: string;
  avatar: string;
}

const scatterStudentsList: StudentScatterPoint[] = [
  { id: "s1", name: "Nicolas Silva", grade: "3º Ano A", portalUsage: 94, consolidatedScore: 9.6, sessionsPerMonth: 88, completedTasks: 42, category: "Alto Engajamento", avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150" },
  { id: "s2", name: "Beatriz Silva", grade: "1º Ano A", portalUsage: 88, consolidatedScore: 9.2, sessionsPerMonth: 72, completedTasks: 36, category: "Alto Engajamento", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" },
  { id: "s3", name: "Gabriel Souza", grade: "2º Ano C", portalUsage: 78, consolidatedScore: 8.7, sessionsPerMonth: 60, completedTasks: 28, category: "Alto Engajamento", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { id: "s4", name: "Sofia Mendes", grade: "3º Ano A", portalUsage: 92, consolidatedScore: 9.5, sessionsPerMonth: 82, completedTasks: 40, category: "Alto Engajamento", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
  { id: "s5", name: "Lucas Ferreira", grade: "4º Ano B", portalUsage: 65, consolidatedScore: 7.9, sessionsPerMonth: 44, completedTasks: 22, category: "Engajamento Médio", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
  { id: "s6", name: "Mariana Costa", grade: "3º Ano A", portalUsage: 85, consolidatedScore: 8.9, sessionsPerMonth: 68, completedTasks: 31, category: "Alto Engajamento", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" },
  { id: "s7", name: "Felipe Ramos", grade: "2º Ano C", portalUsage: 42, consolidatedScore: 6.8, sessionsPerMonth: 24, completedTasks: 14, category: "Engajamento Médio", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  { id: "s8", name: "Alice Duarte", grade: "1º Ano A", portalUsage: 96, consolidatedScore: 9.8, sessionsPerMonth: 94, completedTasks: 48, category: "Alto Engajamento", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
  { id: "s9", name: "Enzo Gabriel", grade: "4º Ano B", portalUsage: 35, consolidatedScore: 6.1, sessionsPerMonth: 18, completedTasks: 9, category: "Baixo Engajamento", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150" },
  { id: "s10", name: "Helena Ribeiro", grade: "2º Ano C", portalUsage: 72, consolidatedScore: 8.3, sessionsPerMonth: 50, completedTasks: 25, category: "Engajamento Médio", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150" },
  { id: "s11", name: "Pedro Henrique", grade: "4º Ano B", portalUsage: 28, consolidatedScore: 5.8, sessionsPerMonth: 12, completedTasks: 6, category: "Baixo Engajamento", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150" },
  { id: "s12", name: "Isabela Martins", grade: "1º Ano A", portalUsage: 90, consolidatedScore: 9.4, sessionsPerMonth: 78, completedTasks: 38, category: "Alto Engajamento", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" }
];

interface Student {
  id: string;
  name: string;
  avatar?: string;
  grade?: string;
  grades?: Array<{
    subject: string;
    firstBimester: number;
    secondBimester: number;
    feedback: string;
  }>;
}

interface DashboardPedagogicoProps {
  activeStudent?: Student | null;
  completedQuests?: string[];
  studentCheckedReminders?: string[];
  magicCoins?: number;
  onBack?: () => void;
}

export const DashboardPedagogico: React.FC<DashboardPedagogicoProps> = ({
  activeStudent = null,
  completedQuests = [],
  studentCheckedReminders = [],
  magicCoins = 0,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<"visao_geral" | "evolucao" | "pareceres" | "autoavaliacao" | "correlacao_d3" | "dispersao_portal" | "config_lembretes">("visao_geral");
  const [scatterGradeFilter, setScatterGradeFilter] = useState<string>("all");
  const [selectedCompetencyFilter, setSelectedCompetencyFilter] = useState<string>("all");
  const [selectedCompForSelfEval, setSelectedCompForSelfEval] = useState<string>("Lógica & Raciocínio");
  const [selfEvalSliderValue, setSelfEvalSliderValue] = useState<number>(8);
  const [selfEvalText, setSelfEvalText] = useState<string>("");
  const [selectedCompetencyDetails, setSelectedCompetencyDetails] = useState<any | null>(null);

  // Reminder Settings State
  const [rematriculaDaysBefore, setRematriculaDaysBefore] = useState<number>(() => {
    const saved = localStorage.getItem("pedagogico_rematricula_days_before");
    return saved ? parseInt(saved, 10) : 3;
  });
  const [rematriculaFrequency, setRematriculaFrequency] = useState<"diario" | "a_cada_3_dias" | "semanal" | "pontual">(() => {
    return (localStorage.getItem("pedagogico_rematricula_freq") as any) || "a_cada_3_dias";
  });
  const [rematriculaChannels, setRematriculaChannels] = useState<{ whatsapp: boolean; push: boolean; email: boolean }>({
    whatsapp: true,
    push: true,
    email: false
  });
  const [reuniaoPaisDaysBefore, setReuniaoPaisDaysBefore] = useState<number>(() => {
    const saved = localStorage.getItem("pedagogico_reuniao_days_before");
    return saved ? parseInt(saved, 10) : 3;
  });
  const [reuniaoPaisHoursBefore, setReuniaoPaisHoursBefore] = useState<number>(2);
  const [reuniaoPaisChannels, setReuniaoPaisChannels] = useState<{ whatsapp: boolean; push: boolean; email: boolean }>({
    whatsapp: true,
    push: true,
    email: true
  });
  const [rematriculaMessageTemplate, setRematriculaMessageTemplate] = useState<string>(
    "Olá {{nome_responsavel}}, tudo bem? Lembramos que o período de rematrícula de {{nome_aluno}} para o Ano Letivo 2027 encerra em {{dias_restantes}} dias. Garanta a vaga e as condições especiais pelo link: {{link_rematricula}}"
  );
  const [reuniaoMessageTemplate, setReuniaoMessageTemplate] = useState<string>(
    "Olá {{nome_responsavel}}! Convidamos você para a Reunião de Pais e Mestres da turma {{turma_aluno}} no dia {{data_reuniao}} às {{horario_reuniao}}. Por favor, confirme sua presença pelo link: {{link_confirmacao}}"
  );
  const [reminderToast, setReminderToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Auto-dismiss reminder toast
  useEffect(() => {
    if (reminderToast) {
      const timer = setTimeout(() => setReminderToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [reminderToast]);

  const handleSaveReminderSettings = () => {
    localStorage.setItem("pedagogico_rematricula_days_before", rematriculaDaysBefore.toString());
    localStorage.setItem("pedagogico_rematricula_freq", rematriculaFrequency);
    localStorage.setItem("pedagogico_reuniao_days_before", reuniaoPaisDaysBefore.toString());
    setReminderToast({
      message: "Configurações de lembretes automáticos salvas com sucesso no servidor escolar!",
      type: "success"
    });
  };

  const handleSimulateWhatsAppReminder = (type: "rematricula" | "reuniao") => {
    const targetLabel = type === "rematricula" ? "Rematrícula 2027" : "Reunião de Pais";
    setReminderToast({
      message: `Simulação de disparo WhatsApp (${targetLabel}) executada com sucesso! Prévia de mensagem validada.`,
      type: "success"
    });
  };

  // Toggle visible lines in the Evolution Chart
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    "Lógica & Raciocínio": true,
    "Criatividade & Expressão": true,
    "Colaboração & Social": true,
    "Foco & Empenho": true,
    "Curiosidade Científica": true,
  });

  // Local storage self reflections state
  const [selfReflections, setSelfReflections] = useState<Array<{
    id: string;
    studentId: string;
    competency: string;
    score: number;
    text: string;
    date: string;
  }>>([]);

  // Load self reflections on mount
  useEffect(() => {
    const studentId = activeStudent?.id || "default";
    const stored = localStorage.getItem(`auto_avaliacoes_${studentId}`);
    if (stored) {
      setSelfReflections(JSON.parse(stored));
    } else {
      // Default initial reflections for rich mockup
      const defaults = [
        {
          id: "sr-1",
          studentId,
          competency: "Colaboração & Social",
          score: 9,
          text: "Melhorei bastante no trabalho em equipe durante a feira de ciências. Aprendi a ouvir a opinião dos meus colegas e dividir as tarefas do projeto.",
          date: "Ontem às 14:30"
        },
        {
          id: "sr-2",
          studentId,
          competency: "Lógica & Raciocínio",
          score: 8,
          text: "Pratiquei bastante com os desafios semanais de lógica. A construção dos algoritmos de robótica na aula prática ajudou bastante.",
          date: "Há 4 dias"
        }
      ];
      setSelfReflections(defaults);
      localStorage.setItem(`auto_avaliacoes_${studentId}`, JSON.stringify(defaults));
    }
  }, [activeStudent]);

  // Handle saving new self-reflection
  const handleSaveSelfReflection = () => {
    if (!selfEvalText.trim()) return;
    const studentId = activeStudent?.id || "default";
    const newReflection = {
      id: `sr-${Date.now()}`,
      studentId,
      competency: selectedCompForSelfEval,
      score: selfEvalSliderValue,
      text: selfEvalText,
      date: `Hoje às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
    };

    const updated = [newReflection, ...selfReflections];
    setSelfReflections(updated);
    localStorage.setItem(`auto_avaliacoes_${studentId}`, JSON.stringify(updated));
    setSelfEvalText("");
    
    // Notification / Toast in app
    setReminderToast({
      message: "🌟 Autoavaliação registrada com sucesso no seu histórico pedagógico!",
      type: "success"
    });
  };

  // Dynamic Grades fetcher from Student Model
  const getGradeByKeywords = (keywords: string[], defaultVal: number) => {
    if (!activeStudent?.grades || activeStudent.grades.length === 0) return defaultVal;
    const found = activeStudent.grades.find(g => 
      keywords.some(k => g.subject.toLowerCase().includes(k.toLowerCase()))
    );
    if (found) {
      // Average first and second bimester if both exist and are numbers
      const f = typeof found.firstBimester === "number" ? found.firstBimester : defaultVal;
      const s = typeof found.secondBimester === "number" ? found.secondBimester : defaultVal;
      return parseFloat(((f + s) / 2).toFixed(1));
    }
    return defaultVal;
  };

  // Integrated academic grades
  const gradeMath = getGradeByKeywords(["matematica", "logica"], 9.5);
  const gradeSciences = getGradeByKeywords(["ciencia", "natureza", "laboratorio"], 9.3);
  const gradePortuguese = getGradeByKeywords(["linguagem", "redacao", "portugues"], 8.8);
  const gradeArts = getGradeByKeywords(["artes", "corporal", "projetos"], 9.4);
  const gradeSocial = getGradeByKeywords(["social", "historia", "geografia"], 9.1);

  // Compute competencies on a scale of 0 - 100 based on academic performance and app events
  const logicVal = Math.round(((gradeMath * 0.45) + (gradeSciences * 0.35) + 9.0 * 0.2) * 10);
  const creativityVal = Math.round(((gradeArts * 0.5) + (gradePortuguese * 0.3) + (completedQuests.includes("quest-1") ? 10.0 : 8.5) * 0.2) * 10);
  const socialVal = Math.round(((gradeSocial * 0.4) + (studentCheckedReminders.length / 8 * 10 * 0.3) + 9.0 * 0.3) * 10);
  
  // Focus based on finished tasks and reminders
  const totalTasksCount = 3 + 8; // 3 quests + 8 reminders
  const completedTasksCount = completedQuests.length + studentCheckedReminders.length;
  const focusVal = Math.round(50 + (completedTasksCount / totalTasksCount) * 50);

  // Curiosity based on science grades and coins
  const curiosityVal = Math.round(((gradeSciences * 0.5) + (gradeMath * 0.2) + Math.min(magicCoins / 400 * 10, 10) * 0.3) * 10);

  // Combined metrics
  const averageCompetency = Math.round((logicVal + creativityVal + socialVal + focusVal + curiosityVal) / 5);

  const radarData = [
    { subject: "Lógica & Raciocínio", value: logicVal, fullMark: 100 },
    { subject: "Criatividade & Expressão", value: creativityVal, fullMark: 100 },
    { subject: "Colaboração & Social", value: socialVal, fullMark: 100 },
    { subject: "Foco & Empenho", value: focusVal, fullMark: 100 },
    { subject: "Curiosidade Científica", value: curiosityVal, fullMark: 100 },
  ];

  // Recharts Evolution timeline dataset (by bimesters)
  const evolutionData = [
    {
      name: "1º Bimestre",
      "Lógica & Raciocínio": Math.round(logicVal * 0.88),
      "Criatividade & Expressão": Math.round(creativityVal * 0.85),
      "Colaboração & Social": Math.round(socialVal * 0.86),
      "Foco & Empenho": Math.round(focusVal * 0.80),
      "Curiosidade Científica": Math.round(curiosityVal * 0.84),
    },
    {
      name: "2º Bimestre",
      "Lógica & Raciocínio": Math.round(logicVal * 0.94),
      "Criatividade & Expressão": Math.round(creativityVal * 0.91),
      "Colaboração & Social": Math.round(socialVal * 0.92),
      "Foco & Empenho": Math.round(focusVal * 0.90),
      "Curiosidade Científica": Math.round(curiosityVal * 0.92),
    },
    {
      name: "3º Bimestre (Atual)",
      "Lógica & Raciocínio": logicVal,
      "Criatividade & Expressão": creativityVal,
      "Colaboração & Social": socialVal,
      "Foco & Empenho": focusVal,
      "Curiosidade Científica": curiosityVal,
    },
    {
      name: "4º Bimestre (Meta)",
      "Lógica & Raciocínio": Math.min(100, Math.round(logicVal * 1.05)),
      "Criatividade & Expressão": Math.min(100, Math.round(creativityVal * 1.06)),
      "Colaboração & Social": Math.min(100, Math.round(socialVal * 1.04)),
      "Foco & Empenho": Math.min(100, Math.round(focusVal * 1.08)),
      "Curiosidade Científica": Math.min(100, Math.round(curiosityVal * 1.05)),
    }
  ];

  // Competencies details mapping
  const competencies = [
    {
      name: "Lógica & Raciocínio",
      value: logicVal,
      icon: <Brain className="w-5 h-5 text-indigo-500" />,
      description: "Formula soluções estruturadas, compreende sequências complexas e soluciona enigmas lógicos com precisão matemática.",
      badge: logicVal >= 93 ? "Arquiteto da Lógica 🧠" : logicVal >= 83 ? "Solucionador Mestre 🔍" : "Explorador da Lógica ✏️",
      color: "border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/10 text-indigo-900 dark:text-indigo-200",
      gradeBreakdown: [
        { subject: "Matemática", grade: gradeMath, weight: "50%" },
        { subject: "Ciências Naturais", grade: gradeSciences, weight: "35%" },
        { subject: "Desafios de Código (Quests)", grade: 9.0, weight: "15%" },
      ],
      recommendations: [
        "Experimente os desafios de nível Lendário na Seção de Quests de Robótica.",
        "Discuta as teorias do Planetário no próximo fórum escolar com seus colegas de classe."
      ]
    },
    {
      name: "Criatividade & Expressão",
      value: creativityVal,
      icon: <Palette className="w-5 h-5 text-pink-500" />,
      description: "Originalidade em redações lúdicas, pensamento lateral em artes e desenvolvimento de soluções fora da caixa.",
      badge: creativityVal >= 92 ? "Ilustrador Arcano 🎨" : creativityVal >= 82 ? "Inventor Visual ✨" : "Pintor Aprendiz 🖌️",
      color: "border-pink-100 dark:border-pink-950/60 bg-pink-50/40 dark:bg-pink-950/10 text-pink-900 dark:text-pink-200",
      gradeBreakdown: [
        { subject: "Artes & Expressão", grade: gradeArts, weight: "50%" },
        { subject: "Língua Portuguesa (Poética)", grade: gradePortuguese, weight: "30%" },
        { subject: "Histórias e Aventuras (Quests)", grade: completedQuests.includes("quest-1") ? 10.0 : 8.5, weight: "20%" },
      ],
      recommendations: [
        "Escreva um diário fictício de bordo sobre a última visita cultural para exercitar a criatividade textual.",
        "Integre paletas de cores quentes e texturas naturais nos seus próximos painéis artísticos."
      ]
    },
    {
      name: "Colaboração & Social",
      value: socialVal,
      icon: <Users className="w-5 h-5 text-emerald-500" />,
      description: "Habilidade de trabalhar em equipe, praticar empatia diária, mediar diálogos e apoiar os colegas.",
      badge: socialVal >= 90 ? "Mediador Exemplar 🤝" : socialVal >= 80 ? "Parceiro Cooperativo 💬" : "Membro da Guilda 🎒",
      color: "border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/10 text-emerald-900 dark:text-emerald-200",
      gradeBreakdown: [
        { subject: "Estudos Sociais (História/Geografia)", grade: gradeSocial, weight: "40%" },
        { subject: "Presença e Atividades Sociais", grade: 9.0, weight: "30%" },
        { subject: "Confirmação de Eventos (Agenda)", grade: parseFloat(((studentCheckedReminders.length / 8) * 10).toFixed(1)), weight: "30%" },
      ],
      recommendations: [
        "Participe dos comitês de apoio aos eventos institucionais e acolhimento aos novos colegas.",
        "Participe ativamente das discussões em grupo, promovendo a escuta ativa de cada ideia."
      ]
    },
    {
      name: "Foco & Empenho",
      value: focusVal,
      icon: <Rocket className="w-5 h-5 text-amber-500" />,
      description: "Consistência e determinação para gerenciar a rotina, realizar checagens e completar tarefas escolares sugeridas.",
      badge: focusVal >= 90 ? "Foco de Diamante 💎" : focusVal >= 75 ? "Defensor da Rotina 🛡️" : "Iniciante Focado 🎯",
      color: "border-amber-100 dark:border-amber-950/60 bg-amber-50/40 dark:bg-amber-950/10 text-amber-900 dark:text-amber-200",
      gradeBreakdown: [
        { subject: "Gincanas Práticas & Gerais", grade: 9.2, weight: "30%" },
        { subject: "Conclusão de Quests Diárias", grade: parseFloat(((completedQuests.length / 3) * 10).toFixed(1)), weight: "35%" },
        { subject: "Checagem de Lembretes Escolares", grade: parseFloat(((studentCheckedReminders.length / 8) * 10).toFixed(1)), weight: "35%" },
      ],
      recommendations: [
        "Tente manter uma sequência de 5 dias seguidos marcando os avisos da coordenação para consolidar sua rotina.",
        "Divida grandes tarefas de casa em blocos menores de 25 minutos para aumentar a eficiência de concentração."
      ]
    },
    {
      name: "Curiosidade Científica",
      value: curiosityVal,
      icon: <Compass className="w-5 h-5 text-purple-500" />,
      description: "Desejo de formular perguntas investigativas ao universo, pesquisar e desvendar as leis da natureza.",
      badge: curiosityVal >= 93 ? "Explorador Cósmico 🌌" : curiosityVal >= 83 ? "Cientista Aprendiz 🔬" : "Observador Curioso 🔭",
      color: "border-purple-100 dark:border-purple-950/60 bg-purple-50/40 dark:bg-purple-950/10 text-purple-900 dark:text-purple-200",
      gradeBreakdown: [
        { subject: "Ciências Naturais & Laboratório", grade: gradeSciences, weight: "50%" },
        { subject: "Matemática Aplicada", grade: gradeMath, weight: "20%" },
        { subject: "Engajamento & Atividades", grade: parseFloat((Math.min(magicCoins / 400 * 10, 10)).toFixed(1)), weight: "30%" },
      ],
      recommendations: [
        "Anote três dúvidas sobre o funcionamento das plantas e apresente-as na horta comunitária na próxima aula.",
        "Aproveite os pontos acadêmicos no acervo escolar para acessar leituras recomendadas de ciências."
      ]
    },
  ];

  // Qualitative tutor feedbacks matching the student
  const tutorFeedbacks = [
    {
      id: "f-1",
      teacher: "Prof. Camila Mendes",
      subject: "Matemática & Raciocínio",
      competency: "Lógica & Raciocínio",
      avatarColor: "bg-blue-500",
      role: "Professora Titular",
      text: `Demonstra uma rapidez fantástica para resolver problemas aplicados e padrões geométricos. A evolução no raciocínio analítico de ${activeStudent?.name || "estudante"} é evidente no segundo bimestre.`,
      date: "05 de Junho de 2026",
      sentiment: "Excelente 🌟"
    },
    {
      id: "f-2",
      teacher: "Prof. Ricardo Santos",
      subject: "Robótica & Inovação",
      competency: "Criatividade & Expressão",
      avatarColor: "bg-purple-500",
      role: "Coordenador de Maker Lab",
      text: `${activeStudent?.name || "O estudante"} aplicou conceitos do laboratório de inovação para construir pontes de gravidade de forma totalmente inovadora, revelando refinada habilidade estética e criatividade.`,
      date: "14 de Junho de 2026",
      sentiment: "Inovador 🤖"
    },
    {
      id: "f-3",
      teacher: "Profa. Letícia Neves",
      subject: "Língua Portuguesa & Artes",
      competency: "Colaboração & Social",
      avatarColor: "bg-pink-500",
      role: "Orientadora de Linguagens",
      text: `Sempre muito solícito(a) no trabalho em grupo. Nas apresentações escolares, ${activeStudent?.name || "estudante"} mediou conflitos e ajudou a organizar o roteiro com excelente empatia.`,
      date: "28 de Junho de 2026",
      sentiment: "Cooperativo 🤝"
    },
    {
      id: "f-4",
      teacher: "Prof. Alan Cunha",
      subject: "Educação Física & Desafios",
      competency: "Foco & Empenho",
      avatarColor: "bg-emerald-500",
      role: "Tutor de Educação Física",
      text: `Mostra incrível foco durante as gincanas práticas. Mantém-se focado nos treinos e não desiste facilmente perante os obstáculos físicos apresentados.`,
      date: "10 de Julho de 2026",
      sentiment: "Focado 🎯"
    },
    {
      id: "f-5",
      teacher: "Profa. Beatriz Costa",
      subject: "Ciências Naturais",
      competency: "Curiosidade Científica",
      avatarColor: "bg-amber-500",
      role: "Pesquisadora Escolar",
      text: `Investiga fenômenos da horta escolar e da biologia com perguntas brilhantes. ${activeStudent?.name || "O estudante"} tem espírito científico genuíno e sempre quer saber os 'porquês' de cada reação.`,
      date: "12 de Julho de 2026",
      sentiment: "Explorador 🔬"
    }
  ];

  // Advice dynamic logic
  const getDynamicAdvice = () => {
    if (completedQuests.length === 0) {
      return "Seu mapa de talentos está pronto para florescer! Comece completando sua primeira Missão Diária de Robótica ou Ciências para aumentar seus níveis de Lógica e Curiosidade.";
    }
    if (completedQuests.length < 3) {
      return "Incrível progresso! Você está fortalecendo sua mente. Conclua as quests que restam para ver seu gráfico de Lógica e Empenho se expandir rumo ao nível máximo!";
    }
    return "Espetacular! Você completou todas as missões disponíveis hoje. Seu gráfico de radar está super expandido, coroando você com excelente Foco & Empenho!";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
      id="dashboard-pedagogico-view"
    >
      {/* 🚀 Top Header with branding & stats */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-indigo-950">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1 rounded-xl text-xs transition-all border border-white/20 flex items-center gap-1 cursor-pointer mr-2 shadow-xs"
                  title="Voltar ao Painel Principal"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
              )}
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/30">
                Metodologia Magic Learning
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono text-purple-200">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> Radar Multidimensional
              </span>
            </div>

            <h2 className="font-serif font-black text-xl sm:text-2xl text-amber-100 leading-tight">
              Seu Painel de Competências Pedagógicas 🛡️
            </h2>
            <p className="text-xs text-purple-100 max-w-xl font-light leading-relaxed">
              Olá, <strong className="text-white font-bold">{activeStudent?.name || "Estudante"}</strong>! Este painel dinâmico mapeia suas notas, pareceres e rotinas ativas em competências fundamentais para o desenvolvimento acadêmico.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-indigo-200 font-mono">Pontuação Média</span>
              <div className="text-2xl font-serif font-black text-amber-300">{averageCompetency}%</div>
              <p className="text-[9px] text-indigo-100">Desempenho Geral</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-200 font-mono">Autoavaliações</span>
              <div className="text-2xl font-serif font-black text-emerald-300">{selfReflections.length}</div>
              <p className="text-[9px] text-emerald-100">Registradas</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 Tabs Controller */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-850 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab("visao_geral")}
          className={`flex-1 min-w-[120px] text-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === "visao_geral"
              ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-150 dark:border-slate-800"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Visão Geral (Radar)</span>
        </button>

        <button
          onClick={() => setActiveTab("evolucao")}
          className={`flex-1 min-w-[120px] text-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === "evolucao"
              ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-150 dark:border-slate-800"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Evolução Temporal</span>
        </button>

        <button
          onClick={() => setActiveTab("pareceres")}
          className={`flex-1 min-w-[120px] text-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === "pareceres"
              ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-150 dark:border-slate-800"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Notas & Pareceres</span>
        </button>

        <button
          onClick={() => setActiveTab("autoavaliacao")}
          className={`flex-1 min-w-[120px] text-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === "autoavaliacao"
              ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-150 dark:border-slate-800"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Autoavaliação</span>
        </button>

        <button
          onClick={() => setActiveTab("correlacao_d3")}
          className={`flex-1 min-w-[160px] text-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === "correlacao_d3"
              ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-150 dark:border-slate-800"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Activity className="w-4 h-4 text-indigo-500" />
          <span>Correlação D3 (Engajamento)</span>
        </button>

        <button
          onClick={() => setActiveTab("dispersao_portal")}
          className={`flex-1 min-w-[170px] text-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === "dispersao_portal"
              ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-150 dark:border-slate-800"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Dispersão (Notas x Portal)</span>
        </button>

        <button
          onClick={() => setActiveTab("config_lembretes")}
          className={`flex-1 min-w-[190px] text-center py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
            activeTab === "config_lembretes"
              ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-150 dark:border-slate-800"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          <Sliders className="w-4 h-4 text-amber-500" />
          <span>Configurações de Lembretes</span>
        </button>
      </div>

      {/* 🔮 Active Tab Content with Framer Motion transitions */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: VISÃO GERAL (RADAR & LISTA) */}
        {activeTab === "visao_geral" && (
          <motion.div
            key="tab-visao"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Radar Chart Panel */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-1 text-left">
                <h3 className="font-serif font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span>Escudo de Habilidades</span>
                </h3>
                <p className="text-[10.5px] text-slate-400">
                  Veja graficamente o equilíbrio das suas competências e áreas de desenvolvimento.
                </p>
              </div>

              {/* Chart container */}
              <div className="h-64 sm:h-72 w-full flex items-center justify-center py-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: '#94a3b8', fontSize: 9 }}
                    />
                    <Radar
                      name="Nível"
                      dataKey="value"
                      stroke="#4f46e5"
                      fill="#818cf8"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '12px', 
                        border: 'none', 
                        color: '#fff', 
                        fontSize: '11px', 
                        fontFamily: 'sans-serif' 
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Advice */}
              <div className="bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 p-4 rounded-2xl text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <strong className="text-[11px] font-black uppercase tracking-wider font-sans">
                    Conselho do Oráculo
                  </strong>
                </div>
                <p className="text-[11px] text-slate-650 dark:text-slate-400 leading-relaxed font-light font-sans">
                  {getDynamicAdvice()}
                </p>
              </div>
            </div>

            {/* List Details */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  Detalhamento de Forças & Conquistas
                </h4>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded font-mono">
                  Atualizado em tempo real
                </span>
              </div>

              <div className="space-y-3">
                {competencies.map((comp) => (
                  <div
                    key={comp.name}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3.5 text-left shadow-3xs hover:shadow-2xs transition-all relative group"
                  >
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl shrink-0">
                      {comp.icon}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-black text-slate-850 dark:text-slate-150">
                          {comp.name}
                        </h5>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                            {comp.value}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-500"
                          style={{ width: `${comp.value}%` }}
                        />
                      </div>

                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal font-sans font-light">
                        {comp.description}
                      </p>

                      <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
                        <div className="flex items-center gap-1 text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider font-mono">
                          <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>Selo: {comp.badge}</span>
                        </div>

                        <button
                          onClick={() => setSelectedCompetencyDetails(comp)}
                          className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                        >
                          Análise Acadêmica <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: EVOLUÇÃO TEMPORAL (LINE CHART) */}
        {activeTab === "evolucao" && (
          <motion.div
            key="tab-evolucao"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
                <div className="text-left space-y-1">
                  <h3 className="font-serif font-black text-sm text-slate-850 dark:text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4.5 h-4.5 text-indigo-600" />
                    <span>Curva de Evolução ao Longo do Ano Escolar</span>
                  </h3>
                  <p className="text-[10.5px] text-slate-400">
                    Acompanhe o desenvolvimento das suas competências ao longo dos bimestres letivos e confira as metas.
                  </p>
                </div>

                {/* Trend Info Badge */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-2 rounded-xl text-left shrink-0">
                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black font-mono">Tendência Geral</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-emerald-300 font-serif">+12% Crescimento Médio</div>
                </div>
              </div>

              {/* Toggles to hide/show lines on Chart */}
              <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 flex flex-wrap items-center justify-start gap-4">
                <span className="text-[9.5px] font-black uppercase text-slate-450 font-mono tracking-wider">Filtro de Comparação:</span>
                <div className="flex flex-wrap items-center gap-3">
                  {Object.keys(visibleLines).map((lineName) => {
                    const colors: Record<string, string> = {
                      "Lógica & Raciocínio": "text-indigo-600 border-indigo-200 dark:text-indigo-400",
                      "Criatividade & Expressão": "text-pink-600 border-pink-200 dark:text-pink-400",
                      "Colaboração & Social": "text-emerald-600 border-emerald-200 dark:text-emerald-400",
                      "Foco & Empenho": "text-amber-600 border-amber-200 dark:text-amber-400",
                      "Curiosidade Científica": "text-purple-600 border-purple-200 dark:text-purple-400",
                    };
                    const isVisible = visibleLines[lineName];
                    return (
                      <button
                        key={lineName}
                        onClick={() => setVisibleLines({ ...visibleLines, [lineName]: !isVisible })}
                        className={`px-3 py-1.5 rounded-xl text-[10.5px] font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isVisible 
                            ? "bg-white dark:bg-slate-900 shadow-3xs " + colors[lineName]
                            : "bg-slate-200/50 dark:bg-slate-800/40 border-transparent text-slate-400"
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          lineName === "Lógica & Raciocínio" ? "bg-indigo-600" :
                          lineName === "Criatividade & Expressão" ? "bg-pink-500" :
                          lineName === "Colaboração & Social" ? "bg-emerald-500" :
                          lineName === "Foco & Empenho" ? "bg-amber-500" : "bg-purple-500"
                        }`} />
                        <span>{lineName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Line Chart container */}
              <div className="h-72 sm:h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolutionData} margin={{ top: 10, right: 25, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      domain={[50, 100]} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderRadius: '12px', 
                        border: 'none', 
                        color: '#fff', 
                        fontSize: '11px', 
                        fontFamily: 'sans-serif' 
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    
                    {visibleLines["Lógica & Raciocínio"] && (
                      <Line 
                        type="monotone" 
                        dataKey="Lógica & Raciocínio" 
                        stroke="#4f46e5" 
                        strokeWidth={3} 
                        activeDot={{ r: 8 }} 
                      />
                    )}
                    {visibleLines["Criatividade & Expressão"] && (
                      <Line 
                        type="monotone" 
                        dataKey="Criatividade & Expressão" 
                        stroke="#ec4899" 
                        strokeWidth={3} 
                      />
                    )}
                    {visibleLines["Colaboração & Social"] && (
                      <Line 
                        type="monotone" 
                        dataKey="Colaboração & Social" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                      />
                    )}
                    {visibleLines["Foco & Empenho"] && (
                      <Line 
                        type="monotone" 
                        dataKey="Foco & Empenho" 
                        stroke="#f59e0b" 
                        strokeWidth={3} 
                      />
                    )}
                    {visibleLines["Curiosidade Científica"] && (
                      <Line 
                        type="monotone" 
                        dataKey="Curiosidade Científica" 
                        stroke="#8b5cf6" 
                        strokeWidth={3} 
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Projections Insight banner */}
              <div className="bg-indigo-50/40 dark:bg-slate-950 p-4 rounded-2xl border border-indigo-100/50 dark:border-slate-850 flex flex-col sm:flex-row items-center gap-3.5 text-left">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">Meta Projetada para o Fim do Ano</h4>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-normal">
                    As metas de 4º Bimestre são baseadas no seu ritmo de estudo atual e no cumprimento das atividades pedagógicas. Ao manter a consistência, os resultados acadêmicos serão consolidados com excelência!
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 3: NOTAS E PARECERES INTEGRADOS */}
        {activeTab === "pareceres" && (
          <motion.div
            key="tab-pareceres"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Grades Link and Teacher Feedbacks View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Grade contributors list */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="space-y-1 text-left">
                  <h4 className="font-serif font-black text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                    Integração de Notas Acadêmicas
                  </h4>
                  <p className="text-[10px] text-slate-450 leading-normal">
                    Veja como suas notas escolares nutrem as competências pedagógicas diretamente:
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  {[
                    { name: "Matemática & Lógica", grade: gradeMath, target: "Lógica & Raciocínio", icon: <Brain className="w-3.5 h-3.5 text-indigo-500" /> },
                    { name: "Ciências Naturais & Alquimia", grade: gradeSciences, target: "Curiosidade Científica", icon: <Compass className="w-3.5 h-3.5 text-purple-500" /> },
                    { name: "Artes & Expressão Corporal", grade: gradeArts, target: "Criatividade & Expressão", icon: <Palette className="w-3.5 h-3.5 text-pink-500" /> },
                    { name: "Língua Portuguesa (Poética)", grade: gradePortuguese, target: "Criatividade", icon: <BookOpen className="w-3.5 h-3.5 text-blue-500" /> },
                    { name: "Magia Social (História/Geografia)", grade: gradeSocial, target: "Colaboração & Social", icon: <Users className="w-3.5 h-3.5 text-emerald-500" /> },
                  ].map((gItem) => (
                    <div
                      key={gItem.name}
                      className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-150 dark:border-slate-850 flex items-center justify-between text-left gap-3"
                    >
                      <div className="flex items-center gap-2">
                        {gItem.icon}
                        <div>
                          <strong className="text-xs text-slate-750 dark:text-slate-200 block">{gItem.name}</strong>
                          <span className="text-[9px] text-slate-450 font-sans block">Alimenta: {gItem.target}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                          {gItem.grade.toFixed(1)} / 10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-[10px] text-slate-600 dark:text-slate-400 text-left leading-normal font-sans">
                  💡 <strong>Critério Avaliativo:</strong> A pontuação de competências correlaciona o desempenho acadêmico formal e a entrega contínua de atividades práticas e projetos propostos.
                </div>
              </div>

              {/* Right Column: Teacher feedbacks list with filtration */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Filtration Headings */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                    Feedbacks Qualitativos dos Tutores
                  </h4>
                  
                  {/* Selector */}
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-150 dark:border-slate-850 shrink-0">
                    <Filter className="w-3 h-3 text-slate-400 ml-1.5" />
                    <select
                      value={selectedCompetencyFilter}
                      onChange={(e) => setSelectedCompetencyFilter(e.target.value)}
                      className="text-[10px] bg-transparent text-slate-750 dark:text-slate-200 border-none focus:ring-0 cursor-pointer font-bold font-sans"
                    >
                      <option value="all">🔍 Todas Habilidades</option>
                      <option value="Lógica & Raciocínio">Lógica & Raciocínio</option>
                      <option value="Criatividade & Expressão">Criatividade</option>
                      <option value="Colaboração & Social">Colaboração</option>
                      <option value="Foco & Empenho">Foco & Empenho</option>
                      <option value="Curiosidade Científica">Curiosidade</option>
                    </select>
                  </div>
                </div>

                {/* Feedbacks Loop */}
                <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                  {tutorFeedbacks
                    .filter(f => selectedCompetencyFilter === "all" || f.competency === selectedCompetencyFilter)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-3 text-left shadow-3xs"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8.5 h-8.5 rounded-xl ${item.avatarColor} text-white flex items-center justify-center font-black text-xs shrink-0 shadow-3xs`}>
                              {item.teacher.split(" ").slice(-1)[0][0]}
                            </div>
                            <div>
                              <strong className="text-xs text-slate-800 dark:text-slate-150 block">{item.teacher}</strong>
                              <span className="text-[9.5px] text-slate-400 block font-sans">{item.role} • {item.subject}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="inline-block bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                              {item.sentiment}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-sans font-light bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-850/60">
                          "{item.text}"
                        </p>

                        <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400 font-mono">
                          <span>Refere-se a: <strong className="text-indigo-600 dark:text-indigo-400">{item.competency}</strong></span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    ))}

                  {tutorFeedbacks.filter(f => selectedCompetencyFilter === "all" || f.competency === selectedCompetencyFilter).length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl text-slate-400 text-xs italic">
                      Nenhum feedback pedagógico encontrado para esta competência específica.
                    </div>
                  )}
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 4: AUTOAVALIAÇÃO E REFLEXÃO DO ALUNO */}
        {activeTab === "autoavaliacao" && (
          <motion.div
            key="tab-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column: Form to post self reflection */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5.5 shadow-xs space-y-4">
              <div className="space-y-1 text-left">
                <h4 className="font-serif font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>Cadastrar Autoavaliação</span>
                </h4>
                <p className="text-[10.5px] text-slate-400 leading-normal">
                  Reflita sobre suas habilidades, atribua uma nota interna de empenho e registre suas percepções pedagógicas.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9.5px] font-black uppercase text-slate-400 mb-1.5 font-mono">
                    Selecione a Competência
                  </label>
                  <select
                    value={selectedCompForSelfEval}
                    onChange={(e) => setSelectedCompForSelfEval(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 cursor-pointer font-sans"
                  >
                    <option value="Lógica & Raciocínio">Lógica & Raciocínio 🧠</option>
                    <option value="Criatividade & Expressão">Criatividade & Expressão 🎨</option>
                    <option value="Colaboração & Social">Colaboração & Social 🤝</option>
                    <option value="Foco & Empenho">Foco & Empenho 🚀</option>
                    <option value="Curiosidade Científica">Curiosidade Científica 🔬</option>
                  </select>
                </div>

                {/* Slider score selection */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9.5px] font-black uppercase text-slate-400 font-mono">
                      Nota de Empenho (1 a 10)
                    </label>
                    <span className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                      {selfEvalSliderValue} / 10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={selfEvalSliderValue}
                    onChange={(e) => setSelfEvalSliderValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-0.5">
                    <span>Iniciante</span>
                    <span>Moderado</span>
                    <span>Excelente</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[9.5px] font-black uppercase text-slate-400 mb-1.5 font-mono">
                    Escreva sua Reflexão / Descobertas
                  </label>
                  <textarea
                    rows={3}
                    value={selfEvalText}
                    onChange={(e) => setSelfEvalText(e.target.value)}
                    placeholder="Ex: No último projeto, notei que consegui aplicar os códigos de lógica com muito mais velocidade e ajudei meus colegas no refeitório..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  onClick={handleSaveSelfReflection}
                  disabled={!selfEvalText.trim()}
                  className="w-full bg-indigo-700 hover:bg-indigo-850 disabled:opacity-50 text-white font-black text-xs py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  Salvar Autoavaliação →
                </button>
              </div>
            </div>

            {/* Right Column: Historical feedback pipeline */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  Histórico de Autoavaliações & Reflexões
                </h4>
                <span className="text-[9px] text-slate-400 font-mono">Total de Notas: {selfReflections.length}</span>
              </div>

              <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                {selfReflections.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl text-slate-400 text-xs italic">
                    Nenhuma autoavaliação registrada ainda. Crie seu primeiro registro ao lado!
                  </div>
                ) : (
                  selfReflections.map((ref) => (
                    <div
                      key={ref.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5 text-left relative shadow-3xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-850 dark:text-slate-150">
                          {ref.competency}
                        </span>
                        <span className="text-[9px] text-slate-450 font-mono">{ref.date}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 font-black uppercase px-2 py-0.5 rounded font-mono">
                          Auto-Pontuação: {ref.score}/10
                        </span>
                        <span className="text-[9.5px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Registrada na ficha de bordo
                        </span>
                      </div>

                      <p className="text-xs text-slate-650 dark:text-slate-3.5 leading-relaxed font-sans font-light italic">
                        "{ref.text}"
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3.5 bg-purple-50/40 dark:bg-slate-950 border border-purple-100/40 dark:border-purple-900/40 rounded-xl text-[10px] text-slate-500 leading-normal font-sans text-left flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Sua Voz Importa:</strong> Suas reflexões de autoavaliação são anexadas automaticamente à ficha pedagógica de acompanhamento bimestral e podem ser lidas por seus tutores e pais para embasamento de feedbacks conjuntos.
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 5: CORRELAÇÃO D3 (COMUNICADOS VS ENGAJAMENTO) */}
        {activeTab === "correlacao_d3" && (
          <motion.div
            key="tab-correlacao-d3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <D3CorrelationChart />
          </motion.div>
        )}

        {/* TAB 6: GRÁFICO DE DISPERSÃO (NOTAS CONSOLIDADAS VS PORTAL DO ALUNO) */}
        {activeTab === "dispersao_portal" && (
          <motion.div
            key="tab-dispersao-portal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 text-left"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      📊 Cruzamento Analítico de Engajamento
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      • Portal do Aluno x Desempenho Escolar
                    </span>
                  </div>
                  <h3 className="font-serif font-black text-xl text-slate-900 dark:text-slate-100">
                    Dispersão: Uso do Portal do Aluno vs. Notas Consolidadas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Análise correlacional entre o percentual de acesso às ferramentas digitais do portal e a média das notas acadêmicas no bimestre.
                  </p>
                </div>

                {/* Grade / Turma Selector */}
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Turma:</span>
                  <select
                    value={scatterGradeFilter}
                    onChange={(e) => setScatterGradeFilter(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="all">Todas as Turmas (1º ao 4º Ano)</option>
                    <option value="1º Ano A">1º Ano Fundamental A</option>
                    <option value="2º Ano C">2º Ano Fundamental C</option>
                    <option value="3º Ano A">3º Ano Fundamental A</option>
                    <option value="4º Ano B">4º Ano B</option>
                  </select>
                </div>
              </div>

              {/* Correlation KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400">
                    Coeficiente de Correlação (R)
                  </span>
                  <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 font-mono">
                    +0.84 <span className="text-xs font-normal text-emerald-600">(Forte Positiva)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Estudantes com &gt;80% de uso do portal apresentam nota média 31% maior.
                  </p>
                </div>

                <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
                    Média de Alunos Ativos no Portal
                  </span>
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                    9.2 <span className="text-xs font-normal text-slate-500">/ 10.0</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Média das notas de quem realiza &gt;50 sessões mensais no portal.
                  </p>
                </div>

                <div className="bg-amber-50/50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                    Média de Alunos Ocasionais
                  </span>
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono">
                    6.4 <span className="text-xs font-normal text-slate-500">/ 10.0</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Média de notas de quem usa &lt;40% dos recursos digitais.
                  </p>
                </div>
              </div>

              {/* RECHARTS SCATTER PLOT */}
              <div className="bg-slate-50/60 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 font-mono text-[11px]">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    Gráfico de Dispersão (Eixo X: Taxa de Uso % | Eixo Y: Nota Média)
                  </span>
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Alto Engajamento (&gt;75%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Engajamento Médio (40%-75%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Baixo Engajamento (&lt;40%)
                    </span>
                  </div>
                </div>

                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis 
                        type="number" 
                        dataKey="portalUsage" 
                        name="Taxa de Uso do Portal" 
                        unit="%" 
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        label={{ value: 'Taxa de Uso do Portal do Aluno (%)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="consolidatedScore" 
                        name="Nota Consolidação" 
                        domain={[0, 10]}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        label={{ value: 'Nota Média Consolidação (0 - 10)', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 11 }}
                      />
                      <ZAxis type="number" dataKey="sessionsPerMonth" range={[60, 400]} name="Sessões/Mês" />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5 font-sans">
                                <div className="flex items-center gap-2">
                                  <img src={data.avatar} alt="" className="w-6 h-6 rounded-full border border-white/30" referrerPolicy="no-referrer" />
                                  <strong className="text-amber-300 block">{data.name}</strong>
                                </div>
                                <div className="text-[10px] text-slate-300 font-mono">Turma: {data.grade}</div>
                                <div className="pt-1 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px]">
                                  <div>
                                    <span className="text-slate-400 block">Nota Média:</span>
                                    <span className="font-extrabold text-emerald-400 text-sm">{data.consolidatedScore}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block">Uso do Portal:</span>
                                    <span className="font-extrabold text-indigo-300 text-sm">{data.portalUsage}%</span>
                                  </div>
                                </div>
                                <div className="text-[9px] text-slate-400 font-mono pt-1">
                                  Sessões mensais: {data.sessionsPerMonth} | Tarefas: {data.completedTasks}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter name="Estudantes" data={
                        scatterGradeFilter === "all"
                          ? scatterStudentsList
                          : scatterStudentsList.filter(s => s.grade === scatterGradeFilter)
                      }>
                        {(scatterGradeFilter === "all" ? scatterStudentsList : scatterStudentsList.filter(s => s.grade === scatterGradeFilter)).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.portalUsage >= 75 ? '#10b981' : entry.portalUsage >= 40 ? '#6366f1' : '#f43f5e'
                            } 
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* List of Plotted Students with Metrics */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  Lista Detalhada de Alunos Plotados na Análise
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(scatterGradeFilter === "all" ? scatterStudentsList : scatterStudentsList.filter(s => s.grade === scatterGradeFilter)).map((st) => (
                    <div 
                      key={st.id}
                      className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-full border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <strong className="text-xs font-bold text-slate-800 dark:text-slate-100 block truncate">{st.name}</strong>
                          <span className="text-[10px] text-slate-400 block font-mono">{st.grade}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                          Nota {st.consolidatedScore}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">
                          Portal {st.portalUsage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 7: CONFIGURAÇÕES DE LEMBRETES AUTOMÁTICOS (REMATRÍCULA & REUNIÕES) */}
        {activeTab === "config_lembretes" && (
          <motion.div
            key="tab-config-lembretes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header & Alert Toast */}
            {reminderToast && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border border-slate-800 flex items-center justify-between shadow-lg"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold">{reminderToast.message}</span>
                </div>
                <button
                  onClick={() => setReminderToast(null)}
                  className="text-xs font-mono opacity-60 hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                      <Bell className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-serif font-black text-slate-900 dark:text-slate-50">
                      Automação de Lembretes Pedagógicos & Rematrículas
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans max-w-2xl leading-relaxed">
                    Configure os períodos automáticos de envio prévio (ex: 3 dias antes), canais integrados via WhatsApp/Push e modelos de mensagens para garantir máxima adesão das famílias.
                  </p>
                </div>

                <button
                  onClick={handleSaveReminderSettings}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Automações</span>
                </button>
              </div>

              {/* Grid with 2 Main Automation Modules */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* MODULE 1: REMATRÍCULAS AUTOMÁTICAS */}
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                          1. Régua de Rematrícula 2027
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-200/60">
                        Ativação Automática
                      </span>
                    </div>

                    {/* Antecedence Period Selector (Ex: 3 dias antes) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-sans">
                        Período de Envio Prévio do Lembrete:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { days: 15, label: "15 dias antes" },
                          { days: 7, label: "7 dias antes" },
                          { days: 3, label: "3 dias antes (Padrão)" },
                          { days: 1, label: "1 dia antes" }
                        ].map((item) => (
                          <button
                            key={item.days}
                            type="button"
                            onClick={() => setRematriculaDaysBefore(item.days)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                              rematriculaDaysBefore === item.days
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold"
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Re-send Frequency */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-sans">
                        Frequência de Reenvio / Recorrência:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "diario", label: "Diário" },
                          { id: "a_cada_3_dias", label: "A cada 3 dias" },
                          { id: "semanal", label: "Semanal" }
                        ].map((freq) => (
                          <button
                            key={freq.id}
                            type="button"
                            onClick={() => setRematriculaFrequency(freq.id as any)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-colors cursor-pointer border ${
                              rematriculaFrequency === freq.id
                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-white font-bold"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            {freq.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Integrated Channels */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-sans">
                        Canais de Disparo Ativos:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setRematriculaChannels(prev => ({ ...prev, whatsapp: !prev.whatsapp }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            rematriculaChannels.whatsapp
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                              : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60"
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp CRM (Oficial)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRematriculaChannels(prev => ({ ...prev, push: !prev.push }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            rematriculaChannels.push
                              ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                              : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60"
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Notificação Push App</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRematriculaChannels(prev => ({ ...prev, email: !prev.email }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            rematriculaChannels.email
                              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                              : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60"
                          }`}
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>E-mail com Contrato</span>
                        </button>
                      </div>
                    </div>

                    {/* Template Message Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                          Texto do Modelo WhatsApp:
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">Variáveis suportadas</span>
                      </div>
                      <textarea
                        value={rematriculaMessageTemplate}
                        onChange={(e) => setRematriculaMessageTemplate(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Live Preview Simulation Box */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="bg-emerald-950/10 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-3.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-emerald-800 dark:text-emerald-300">
                        <span className="font-bold">Prévia do WhatsApp • Disparo programado {rematriculaDaysBefore} dias antes</span>
                        <span>09:15</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                        Olá <strong>Roberto</strong>! Lembramos que o período de rematrícula de <strong>Nicolas Silva</strong> encerra em <strong>{rematriculaDaysBefore} dias</strong>. Garanta a vaga e as condições especiais pelo link seguro.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSimulateWhatsAppReminder("rematricula")}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Simular Envio WhatsApp Teste</span>
                    </button>
                  </div>
                </div>

                {/* MODULE 2: REUNIÕES DE PAIS & PLANTÃO PEDAGÓGICO */}
                <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                          2. Lembretes de Reuniões de Pais
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md border border-blue-200/60">
                        Confirmação RSVP
                      </span>
                    </div>

                    {/* First Notice Antecedence */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-sans">
                        Primeiro Convite (Dias de Antecedência):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { days: 7, label: "7 dias antes" },
                          { days: 5, label: "5 dias antes" },
                          { days: 3, label: "3 dias antes (Padrão)" },
                          { days: 1, label: "24h antes" }
                        ].map((item) => (
                          <button
                            key={item.days}
                            type="button"
                            onClick={() => setReuniaoPaisDaysBefore(item.days)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                              reuniaoPaisDaysBefore === item.days
                                ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-bold"
                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Same-Day Reinforcement */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-sans">
                        Alerta de Reforço no Dia da Reunião:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { hours: 3, label: "3 horas antes" },
                          { hours: 2, label: "2 horas antes" },
                          { hours: 1, label: "1 hora antes" }
                        ].map((item) => (
                          <button
                            key={item.hours}
                            type="button"
                            onClick={() => setReuniaoPaisHoursBefore(item.hours)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-colors cursor-pointer border ${
                              reuniaoPaisHoursBefore === item.hours
                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-white font-bold"
                                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Integrated Channels */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-sans">
                        Canais de Notificação:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setReuniaoPaisChannels(prev => ({ ...prev, whatsapp: !prev.whatsapp }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            reuniaoPaisChannels.whatsapp
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                              : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60"
                          }`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>WhatsApp com Botão RSVP</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReuniaoPaisChannels(prev => ({ ...prev, push: !prev.push }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            reuniaoPaisChannels.push
                              ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                              : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60"
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Push no App</span>
                        </button>
                      </div>
                    </div>

                    {/* Template Message Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-sans">
                          Texto do Convite & Confirmação:
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">Variáveis suportadas</span>
                      </div>
                      <textarea
                        value={reuniaoMessageTemplate}
                        onChange={(e) => setReuniaoMessageTemplate(e.target.value)}
                        rows={3}
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Live Preview Box */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="bg-blue-950/10 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 p-3.5 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-blue-800 dark:text-blue-300">
                        <span className="font-bold">Prévia do WhatsApp • Disparo {reuniaoPaisDaysBefore} dias antes + {reuniaoPaisHoursBefore}h no dia</span>
                        <span>14:00</span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                        Olá <strong>Família Silva</strong>! Convidamos você para a Reunião de Pais e Mestres do <strong>3º Ano A</strong> na próxima quinta-feira às 19h00. Confirme sua presença com 1 clique.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSimulateWhatsAppReminder("reuniao")}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Simular Envio WhatsApp Teste</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔮 Interactive details dialog for specific competencies (Análise Acadêmica modal) */}
      <AnimatePresence>
        {selectedCompetencyDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-indigo-150 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-150 dark:border-slate-850 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg">
                    {selectedCompetencyDetails.icon}
                  </span>
                  <div>
                    <h3 className="text-xs font-black text-[#423326] dark:text-indigo-300 font-serif">
                      Análise Detalhada: {selectedCompetencyDetails.name}
                    </h3>
                    <p className="text-[9.5px] text-slate-400 font-sans">
                      Composição métrica e sugestões para melhoria contínua.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCompetencyDetails(null)} 
                  className="p-1 rounded-lg hover:bg-slate-150 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto flex-1 text-left">
                
                {/* Description */}
                <div className="space-y-1.5">
                  <h4 className="text-[9.5px] font-black uppercase text-slate-400 font-mono">Definição Operacional</h4>
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-sans font-light">
                    {selectedCompetencyDetails.description}
                  </p>
                </div>

                {/* Contribution metric slider */}
                <div className="space-y-2.5">
                  <h4 className="text-[9.5px] font-black uppercase text-slate-400 font-mono">Composição e Peso de Notas</h4>
                  <div className="space-y-2">
                    {selectedCompetencyDetails.gradeBreakdown.map((item: any) => (
                      <div key={item.subject} className="bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850/60 flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-700 dark:text-slate-250 font-sans font-light">{item.subject}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9.5px] text-slate-400 font-mono">Peso: {item.weight}</span>
                          <span className="font-mono font-black text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded">
                            {item.grade}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action recommendations items */}
                <div className="space-y-2">
                  <h4 className="text-[9.5px] font-black uppercase text-slate-400 font-mono">Recomendações Práticas dos Tutores</h4>
                  <ul className="space-y-2">
                    {selectedCompetencyDetails.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-sans font-light bg-indigo-50/20 dark:bg-indigo-950/10 p-2.5 rounded-xl border border-indigo-100/30 dark:border-indigo-900/10">
                        <span className="text-indigo-600 font-black shrink-0 mt-0.5">✦</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-850 flex justify-end">
                <button
                  onClick={() => setSelectedCompetencyDetails(null)}
                  className="bg-indigo-700 hover:bg-indigo-850 text-white text-xs font-black px-4 py-2 rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  Entendi, Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
