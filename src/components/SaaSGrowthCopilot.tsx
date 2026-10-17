import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  DollarSign, 
  CheckSquare, 
  MessageSquare, 
  RefreshCw, 
  ChevronRight, 
  HelpCircle, 
  Bell, 
  ArrowRight, 
  ChevronDown, 
  User, 
  Lightbulb, 
  Award, 
  Smile, 
  Clock, 
  Lock, 
  Briefcase, 
  Target, 
  BookOpen, 
  Info,
  CheckCircle,
  FileText
} from "lucide-react";

interface SaaSGrowthCopilotProps {
  currentRole: string; // "landing" | "pais" | "escola"
  onToggleRole: (role: "landing" | "pais" | "escola") => void;
  onTriggerNotification: (info: { title: string; body: string; targetTab: "cobrancas" | "comunicados" | "academico" | "diaadia" | "acesso"; iconType: "announcement" | "occurrence" }) => void;
  onAutofillAuth: (gate: "escola" | "pais", tab: "login" | "signup") => void;
  onOpenCreateAnnouncement?: () => void;
  onTriggerCheckIn?: () => void;
  isDarkMode: boolean;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function SaaSGrowthCopilot({
  currentRole,
  onToggleRole,
  onTriggerNotification,
  onAutofillAuth,
  onOpenCreateAnnouncement,
  onTriggerCheckIn,
  isDarkMode,
  onToast
}: SaaSGrowthCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"advisor" | "calculator" | "journey" | "crm">("journey");

  // ROI Calculator states
  const [students, setStudents] = useState(300);
  const [tuition, setTuition] = useState(1200);
  const [reductionRate, setReductionRate] = useState(35); // 35% reduction in delinquency
  const [retentionRate, setRetentionRate] = useState(5); // 5% increase in retention

  // Saved Draft simulation
  const [simulatedDraft, setSimulatedDraft] = useState<string>("");
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);

  // Auto-save simulation
  useEffect(() => {
    if (!simulatedDraft) return;
    setIsDraftSaving(true);
    const timer = setTimeout(() => {
      setIsDraftSaving(false);
      setDraftSavedTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      localStorage.setItem("school_simulated_draft", simulatedDraft);
    }, 800);
    return () => clearTimeout(timer);
  }, [simulatedDraft]);

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("school_simulated_draft");
    if (saved) {
      setSimulatedDraft(saved);
      setDraftSavedTime("Recuperado");
    }
  }, []);

  // Calculate financial benefits
  const annualTuitionRevenue = students * tuition * 12;
  const standardDelinquencyRevenue = annualTuitionRevenue * 0.08; // 8% default delinquency
  const recoveredDelinquency = standardDelinquencyRevenue * (reductionRate / 100);
  const retainedStudentsRevenue = (students * (retentionRate / 100)) * tuition * 12;
  const totalAnnualGain = recoveredDelinquency + retainedStudentsRevenue;
  const monthlyGain = totalAnnualGain / 12;

  // Experts list
  const experts = [
    {
      role: "SaaS Product Manager",
      name: "Mariana Mendes",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
      insight: "O funil de ativação do Magic Learning foca no primeiro valor rápido. Substituímos o dashboard vazio pelo 'Guia de Boas-Vindas' em 3 etapas para que o usuário execute tarefas reais de imediato."
    },
    {
      role: "Growth Product Manager",
      name: "Rodrigo Lins",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
      insight: "Adotamos a 'Entrada sem Fricção': qualquer visitante pode testar o sistema instantaneamente pela Landing Page com 1-clique (Portais Demo), experimentando o valor antes de se registrar."
    },
    {
      role: "UX Designer",
      name: "Juliana Frota",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
      insight: "A identidade visual herda a paleta do colégio dinamicamente no onboarding. O design utiliza tipografia refinada, transições suaves via Motion e contraste perfeito para reduzir o cansaço ocular."
    },
    {
      role: "Conversion Specialist (CRO)",
      name: "Bruno Costa",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
      insight: "Reduzimos as etapas de cadastro para menos de 60s, coletando informações adicionais progressivamente. Se a rede falhar, a Sandbox local assume de forma transparente."
    },
    {
      role: "Onboarding Specialist",
      name: "Alice Vieira",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
      insight: "Ensino por contexto: sem tours chatos ou vídeos obrigatórios. Orientamos o usuário a criar um aviso ou assinar autorizações na hora, ativando os gatilhos neurais de realização rápida."
    },
    {
      role: "CRM & Retention Expert",
      name: "Felipe Guedes",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
      insight: "Implementamos uma régua de comunicação não invasiva. Lembretes automáticos no WhatsApp e e-mail ajudam o responsável a recuperar o progresso de onde parou."
    },
    {
      role: "Customer Success Lead",
      name: "Camila Nogueira",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150",
      insight: "Apoio humanizado integrado de 2-cliques. O portal de ajuda previne cancelamentos ao resolver dúvidas administrativas diretamente na tela em que o gestor se encontra."
    },
    {
      role: "Senior Full Stack Dev",
      name: "Lucas Pinheiro",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
      insight: "Arquitetura limpa em React 18 e Firestore. Desenvolvemos sincronismo de filas offline persistente no LocalStorage, garantindo que nenhum dado de portaria seja perdido por sinal fraco."
    },
    {
      role: "Product Data Analyst",
      name: "Sandra Schmidt",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
      insight: "Analisamos o funil de ativação: 84% dos usuários que sinalizam a portaria pela primeira vez tornam-se promotores fiéis do produto. O valor do produto é evidente no dia-a-dia."
    }
  ];

  const handleTriggerSimulatedCRM = (type: "incomplete" | "announcement" | "invoice") => {
    if (type === "incomplete") {
      onTriggerNotification({
        title: "🎒 Portal da Família • Continue seu cadastro",
        body: "Olá! Identificamos que você iniciou o cadastro de seu filho. Clique aqui para concluir o perfil em 30 segundos e liberar o boletim.",
        targetTab: "diaadia",
        iconType: "occurrence"
      });
      onToast("Lembrete de cadastro incompleto enviado com sucesso!", "success");
    } else if (type === "announcement") {
      onTriggerNotification({
        title: "📣 Comunicado Importante • Atividades de Artes",
        body: "Veja novas fotos de atividades integradas de colagem e pintura do maternal. Progresso salvo!",
        targetTab: "comunicados",
        iconType: "announcement"
      });
      onToast("Notificação de circular pedagógica disparada!", "success");
    } else if (type === "invoice") {
      onTriggerNotification({
        title: "💸 Ficha de Rematrícula Pendente",
        body: "O período de rematrículas antecipadas com 10% de desconto expira em breve. Clique para renegociar e pagar via PIX.",
        targetTab: "diaadia",
        iconType: "occurrence"
      });
      onToast("Notificação CRM de rematrícula enviada com sucesso!", "success");
    }
  };

  return (
    <>
      {/* Floating Growth Copilot Toggle Badge */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-slate-800 transition-all cursor-pointer border border-slate-800"
          id="growth-copilot-button"
        >
          <div className="relative">
            <Brain className="w-5 h-5 text-amber-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider font-sans">
            Growth HUD
          </span>
        </motion.button>
      </div>

      {/* Side Slide-out Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] shadow-2xl flex flex-col border-l transition-colors duration-200 ${
              isDarkMode 
                ? "bg-slate-950 border-slate-900 text-slate-100" 
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between transition-colors ${
              isDarkMode ? "bg-slate-900/50 border-slate-900" : "bg-white border-slate-250/65"
            }`}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-sm tracking-tight">Comitê de Sucesso Comercial</h3>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-widest leading-none mt-1">9 Experts SaaS & Retenção</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Navigation Tabs */}
            <div className={`grid grid-cols-4 text-center text-[10px] font-bold border-b transition-colors ${
              isDarkMode ? "bg-slate-900/20 border-slate-900" : "bg-white border-slate-250/50"
            }`}>
              <button 
                onClick={() => setActiveTab("journey")}
                className={`py-3 transition-all cursor-pointer border-b-2 ${
                  activeTab === "journey" 
                    ? "border-amber-500 text-amber-500 font-extrabold" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Jornada
              </button>
              <button 
                onClick={() => setActiveTab("calculator")}
                className={`py-3 transition-all cursor-pointer border-b-2 ${
                  activeTab === "calculator" 
                    ? "border-amber-500 text-amber-500 font-extrabold" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Calculadora ROI
              </button>
              <button 
                onClick={() => setActiveTab("crm")}
                className={`py-3 transition-all cursor-pointer border-b-2 ${
                  activeTab === "crm" 
                    ? "border-amber-500 text-amber-500 font-extrabold" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Régua CRM
              </button>
              <button 
                onClick={() => setActiveTab("advisor")}
                className={`py-3 transition-all cursor-pointer border-b-2 ${
                  activeTab === "advisor" 
                    ? "border-amber-500 text-amber-500 font-extrabold" 
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Insights (9)
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-grow overflow-y-auto p-5 space-y-5">

              {/* TAB 1: ACTIVATION JOURNEY */}
              {activeTab === "journey" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <h4 className="text-xs font-serif font-black text-amber-600 dark:text-amber-400">Jornada de Ativação do Usuário</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Acompanhe o funil de experiência ideal do produto. Execute as etapas principais abaixo para testar as métricas de conversão.
                    </p>
                  </div>

                  {/* Step list */}
                  <div className="space-y-3">
                    
                    {/* Step 1: Understand ROI */}
                    <div className={`p-3.5 rounded-2xl border flex gap-3 transition-all ${
                      activeTab === "calculator" ? "border-amber-300 bg-amber-50/10" : "border-slate-200/50 dark:border-slate-900 bg-white dark:bg-slate-900"
                    }`}>
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black font-mono text-xs shrink-0 mt-0.5">1</div>
                      <div className="space-y-1.5 flex-1">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Entender a Proposta (Visualizar ROI)</span>
                        <p className="text-[10.5px] text-slate-500 leading-normal">
                          O gestor compreende o retorno financeiro do sistema de forma instantânea usando nossa calculadora.
                        </p>
                        <button 
                          onClick={() => setActiveTab("calculator")}
                          className="text-[10px] bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-extrabold px-3 py-1.5 rounded-lg border dark:border-slate-800 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>Calcular ROI do Colégio</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Step 2: Frictionless Tryout */}
                    <div className="p-3.5 rounded-2xl border flex gap-3 bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-900">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black font-mono text-xs shrink-0 mt-0.5">2</div>
                      <div className="space-y-1.5 flex-1">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Experimentar sem Senha (Demos Rápidas)</span>
                        <p className="text-[10.5px] text-slate-500 leading-normal">
                          Permitimos que o usuário use o sistema completo sem precisar preencher um cadastro no primeiro contato.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <button 
                            onClick={() => {
                              onToggleRole("pais");
                              setIsOpen(false);
                            }}
                            className="text-[10px] bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-extrabold px-2.5 py-1.5 rounded-lg border border-amber-500/20 transition-all cursor-pointer"
                          >
                            Demo Família 🎒
                          </button>
                          <button 
                            onClick={() => {
                              onToggleRole("escola");
                              setIsOpen(false);
                            }}
                            className="text-[10px] bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 font-extrabold px-2.5 py-1.5 rounded-lg border border-indigo-500/20 transition-all cursor-pointer"
                          >
                            Demo Escola 🏫
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Fast Registration */}
                    <div className="p-3.5 rounded-2xl border flex gap-3 bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-900">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black font-mono text-xs shrink-0 mt-0.5">3</div>
                      <div className="space-y-1.5 flex-1">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Cadastrar em 60 Segundos</span>
                        <p className="text-[10.5px] text-slate-500 leading-normal">
                          Quando o cadastro é solicitado, ele ocorre em tela única com preenchimento inteligente e sandbox local segura.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <button 
                            onClick={() => {
                              onToggleRole("landing");
                              onAutofillAuth("pais", "signup");
                              setIsOpen(false);
                            }}
                            className="text-[10px] bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-extrabold px-3 py-1.5 rounded-lg border dark:border-slate-800 transition-all cursor-pointer"
                          >
                            Cadastro Expresso Família
                          </button>
                          <button 
                            onClick={() => {
                              onToggleRole("landing");
                              onAutofillAuth("escola", "signup");
                              setIsOpen(false);
                            }}
                            className="text-[10px] bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-extrabold px-3 py-1.5 rounded-lg border dark:border-slate-800 transition-all cursor-pointer"
                          >
                            Cadastro Expresso Escola
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: First Action of Value */}
                    <div className="p-3.5 rounded-2xl border flex gap-3 bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-900">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black font-mono text-xs shrink-0 mt-0.5">4</div>
                      <div className="space-y-1.5 flex-1">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Ação de Valor Rápida (Onboarding)</span>
                        <p className="text-[10.5px] text-slate-500 leading-normal">
                          Conclua o primeiro resultado de utilidade real imediatamente após entrar, gerando engajamento.
                        </p>
                        {currentRole === "escola" ? (
                          <button 
                            onClick={() => {
                              onOpenCreateAnnouncement?.();
                              setIsOpen(false);
                            }}
                            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Disparar Comunicado / Circular 📣</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : currentRole === "pais" ? (
                          <button 
                            onClick={() => {
                              onTriggerCheckIn?.();
                              setIsOpen(false);
                            }}
                            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Sinalizar Chegada na Portaria 🚗</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <p className="text-[10px] italic text-amber-600">Acesse qualquer Demo para habilitar atalhos de utilidade rápida!</p>
                        )}
                      </div>
                    </div>

                    {/* Step 5: Draft & Auto-save */}
                    <div className="p-3.5 rounded-2xl border flex gap-3 bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-900">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black font-mono text-xs shrink-0 mt-0.5">5</div>
                      <div className="space-y-2 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100">Salvamento Automático (Autosave)</span>
                          {isDraftSaving ? (
                            <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Salvando...
                            </span>
                          ) : draftSavedTime ? (
                            <span className="text-[9px] bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-md">
                              ✓ Salvo {draftSavedTime}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-normal">
                          Escreva qualquer rascunho de nota ou recado escolar abaixo para testar o sistema de salvamento automático do portal:
                        </p>
                        <input 
                          type="text"
                          placeholder="Digite algo para simular autosave..."
                          value={simulatedDraft}
                          onChange={(e) => setSimulatedDraft(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {/* Step 6: Easy Return */}
                    <div className="p-3.5 rounded-2xl border flex gap-3 bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-900">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black font-mono text-xs shrink-0 mt-0.5">6</div>
                      <div className="space-y-1.5 flex-1">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Retorno Recorrente & PWA</span>
                        <p className="text-[10.5px] text-slate-500 leading-normal">
                          Retomar as tarefas requer zero esforço. O webapp suporta instalação PWA e carrega de imediato de onde o responsável parou.
                        </p>
                        <button 
                          onClick={() => {
                            onToast("Portal sincronizado com os dados salvos locais no navegador!", "success");
                          }}
                          className="text-[10px] bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-extrabold px-3 py-1.5 rounded-lg border dark:border-slate-800 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <span>🔄 Simular Carregamento de Sessão</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: ROI CALCULATOR */}
              {activeTab === "calculator" && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h4 className="text-xs font-serif font-black text-amber-600 dark:text-amber-400">Calculadora de ROI do Colégio</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Mostre aos donos de escolas quanto eles poupam reduzindo inadimplência e melhorando a retenção de alunos com o Magic Learning.
                    </p>
                  </div>

                  {/* Range Sliders */}
                  <div className="space-y-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-3xs">
                    
                    {/* Students range */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Número de Alunos:</span>
                        <span className="text-amber-600 font-mono">{students} alunos</span>
                      </div>
                      <input 
                        type="range"
                        min="50"
                        max="1200"
                        step="10"
                        value={students}
                        onChange={(e) => setStudents(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Average Tuition range */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Mensalidade Média:</span>
                        <span className="text-amber-600 font-mono">R$ {tuition.toLocaleString("pt-BR")}</span>
                      </div>
                      <input 
                        type="range"
                        min="400"
                        max="4500"
                        step="50"
                        value={tuition}
                        onChange={(e) => setTuition(Number(e.target.value))}
                        className="w-full accent-amber-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Reduction rate in delinquency */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Redução da Inadimplência:</span>
                        <span className="text-indigo-600 font-mono">{reductionRate}% de melhora</span>
                      </div>
                      <input 
                        type="range"
                        min="10"
                        max="70"
                        step="5"
                        value={reductionRate}
                        onChange={(e) => setReductionRate(Number(e.target.value))}
                        className="w-full accent-indigo-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Retention Increase rate */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Aumento na Retenção Escolar:</span>
                        <span className="text-emerald-600 font-mono">+{retentionRate}% retidos</span>
                      </div>
                      <input 
                        type="range"
                        min="1"
                        max="15"
                        step="1"
                        value={retentionRate}
                        onChange={(e) => setRetentionRate(Number(e.target.value))}
                        className="w-full accent-emerald-500 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                  </div>

                  {/* Live Results Panel */}
                  <div className="bg-gradient-to-br from-amber-500/10 to-indigo-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block font-sans">Resultado de ROI Comercial Estimado</span>
                    
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] text-slate-500 block">Economia Mensal:</span>
                        <span className="text-base sm:text-lg font-black text-slate-800 dark:text-white block font-mono">R$ {monthlyGain.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] text-slate-500 block">Retorno Anual Estimado:</span>
                        <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 block font-mono">R$ {totalAnnualGain.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-500 leading-normal flex items-start gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <p>
                        A economia baseia-se em reduzir a taxa padrão de inadimplência escolar de 8% e evitar a perda de alunos para colégios rivais devido a atrasos de portaria.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CRM AND REMINDERS */}
              {activeTab === "crm" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1">
                    <h4 className="text-xs font-serif font-black text-amber-600 dark:text-amber-400">Régua de Comunicação do CRM</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Conforme os tópicos 9 e 10 do master prompt, os lembretes automáticos trazem o usuário de volta de forma inteligente, respeitando a privacidade.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    
                    {/* Alerta 1: Cadastro Iniciado e Não Concluído */}
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-amber-600 block">1. Cadastro Incompleto</span>
                        <span className="text-[10px] text-slate-400 block">Abandono no onboarding guiado</span>
                      </div>
                      <button 
                        onClick={() => handleTriggerSimulatedCRM("incomplete")}
                        className="text-[10px] bg-slate-850 dark:bg-slate-800 hover:bg-slate-900 text-white font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1 shrink-0"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-400" />
                        <span>Disparar Alerta</span>
                      </button>
                    </div>

                    {/* Alerta 2: Circular de Atividades Pedagógicas */}
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-emerald-600 block">2. Nova Entrega de Valor</span>
                        <span className="text-[10px] text-slate-400 block">Novas fotos ou circulares pedagógicas</span>
                      </div>
                      <button 
                        onClick={() => handleTriggerSimulatedCRM("announcement")}
                        className="text-[10px] bg-slate-850 dark:bg-slate-800 hover:bg-slate-900 text-white font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1 shrink-0"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-400" />
                        <span>Disparar Alerta</span>
                      </button>
                    </div>

                    {/* Alerta 3: Boleto pendente ou rematrícula abandonada */}
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-3xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-indigo-600 block">3. Pendência / Boleto Próximo</span>
                        <span className="text-[10px] text-slate-400 block">Aviso financeiro ou taxa promocional</span>
                      </div>
                      <button 
                        onClick={() => handleTriggerSimulatedCRM("invoice")}
                        className="text-[10px] bg-slate-850 dark:bg-slate-800 hover:bg-slate-900 text-white font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1 shrink-0"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-400" />
                        <span>Disparar Alerta</span>
                      </button>
                    </div>

                  </div>

                  {/* Informational security banner */}
                  <div className="bg-slate-100 dark:bg-slate-900/60 p-3 rounded-xl border dark:border-slate-800 text-[10px] text-slate-500 leading-normal flex items-start gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>Garantia LGPD & Opt-In:</strong> O colégio respeita o consentimento. Pais gerenciam suas categorias de notificações a qualquer momento no perfil unificado.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: EXPERTS LIST */}
              {activeTab === "advisor" && (
                <div className="space-y-3 animate-fade-in pr-1">
                  <div className="space-y-1">
                    <h4 className="text-xs font-serif font-black text-amber-600 dark:text-amber-400">Time de Crescimento & Conversão</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Toque em qualquer especialista para ler os principais conselhos aplicados nesta atualização do Magic Learning.
                    </p>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto">
                    {experts.map((exp, idx) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-2xl border flex gap-3 transition-colors ${
                          isDarkMode 
                            ? "bg-slate-900/30 border-slate-900 hover:bg-slate-900/50" 
                            : "bg-white border-slate-200/60 hover:bg-slate-50"
                        }`}
                      >
                        <img 
                          src={exp.avatar} 
                          alt={exp.name} 
                          className="w-10 h-10 rounded-full border-2 border-amber-500/20 shrink-0 object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1 flex-grow">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-[11px] text-slate-800 dark:text-slate-200">{exp.name}</span>
                            <span className="text-[8.5px] font-black uppercase text-amber-600 dark:text-amber-400 font-mono tracking-wider">{exp.role}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">
                            "{exp.insight}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Panel CTA - Upgrade Path */}
            <div className={`p-4 border-t text-center space-y-2 transition-colors ${
              isDarkMode ? "bg-slate-900/40 border-slate-900" : "bg-white border-slate-250/50"
            }`}>
              <div className="flex justify-between items-center text-[10.5px]">
                <span className="text-slate-500">Magic Learning SaaS:</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">R$ 1,99 / aluno ao mês</span>
              </div>
              <button 
                onClick={() => {
                  onToast("Upgrade de plano simulado! Nossa equipe de CS entrará em contato para agendar o onboard corporativo. Obrigado!", "success");
                }}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Contratar Licença Corporativa</span>
                <Brain className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
