import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  DollarSign,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Award,
  Sliders,
  Settings,
  RefreshCw,
  BarChart3,
  FileText,
  ThumbsUp,
  ShieldAlert,
  HelpCircle,
  MessageSquare,
  Users,
  Smartphone,
  CheckCircle,
  Lock,
  ArrowLeft
} from "lucide-react";

interface MarketIntelligenceHubProps {
  onNotifyParentBilling?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onBack?: () => void;
}

export function MarketIntelligenceHub({ onNotifyParentBilling, onNavigateToTab, onBack }: MarketIntelligenceHubProps) {
  // Active sub-tab inside Benchmarking
  const [activeSubTab, setActiveSubTab] = useState<"comparison" | "roi" | "upgrades">("comparison");

  // State for ROI Simulator
  const [numStudents, setNumStudents] = useState<number>(350);
  const [avgMonthlyFee, setAvgMonthlyFee] = useState<number>(1200);
  const [currentInadimplencia, setCurrentInadimplencia] = useState<number>(8.5); // %
  const [teacherHoursSpent, setTeacherHoursSpent] = useState<number>(15); // hours/student/year typing report cards

  // Calculos ROI
  const calculatedSavings = {
    revenueSaved: Math.round((numStudents * avgMonthlyFee * 12) * ((currentInadimplencia - 1.8) / 100)),
    hoursSaved: Math.round(numStudents * (teacherHoursSpent - 3)),
    efficiencyGain: Math.round((numStudents * 22) / 60), // days saved in gate queue operations
    totalFinancialBenefit: 0,
  };
  calculatedSavings.totalFinancialBenefit = calculatedSavings.revenueSaved + (calculatedSavings.hoursSaved * 45); // Assuming R$45/hour cost

  // State for interactive features
  const [upgradesState, setUpgradesState] = useState({
    friendlyBilling: {
      enabled: true,
      triggerDays: [1, 5, 10],
      discountRate: 5,
      whatsappSync: true,
      lastSimulatedTrigger: "",
    },
    aiPedagogicalCopilot: {
      enabled: true,
      creativity: "balanced",
      tone: "acolhedor",
      length: "medio",
      customInstructions: "Focar em habilidades socioemocionais e pontos fortes do aluno.",
    },
    predictiveGate: {
      enabled: true,
      proximityRadius: 800, // meters
      autoSort: true,
      smsAlerts: false,
    },
    enrollmentCRM: {
      enabled: false,
      pipelineSteps: ["Fila de Interesse", "Visita Agendada", "Documentação", "Financeiro", "Rematriculado"],
      autoFollowUp: true,
    }
  });

  // Simulator Logs for actions
  const [billingLogs, setBillingLogs] = useState<string[]>([
    "Configurações iniciais carregadas.",
    "Regra ativa: Notificação amigável 3 dias antes do vencimento.",
  ]);

  const [aiReportOutput, setAiReportOutput] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [selectedStudentForAi, setSelectedStudentForAi] = useState<string>("Alice Souza");

  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  const triggerBillingSimulation = () => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    const newLogs = [
      `[${timestamp}] 🤖 Regra Disparada: Mensagens amigáveis geradas para faturas pendentes.`,
      `[${timestamp}] 💬 WhatsApp enviado para Mariana Silva (Mãe do Nicolas): link Pix Copia-e-Cola gerado com 5% de desconto de pontualidade.`,
      `[${timestamp}] 💬 WhatsApp enviado para Ricardo Oliveira (Pai do Theo): lembrete de vencimento amigável enviado.`,
      `[${timestamp}] ✅ Conciliação em lote: 2 pendências liquidadas instantaneamente via Pix síncrono.`,
      ...billingLogs
    ].slice(0, 10);
    setBillingLogs(newLogs);
    setSimulationResult("Regra de Cobrança simulada com sucesso! Verifique os logs operacionais abaixo.");
    setTimeout(() => setSimulationResult(null), 4000);
  };

  const simulateAiReportGeneration = () => {
    setIsGeneratingAi(true);
    setAiReportOutput("");
    setTimeout(() => {
      setIsGeneratingAi(false);
      const reports: Record<string, string> = {
        "Alice Souza": `Alice demonstrou excelente evolução pedagógica neste trimestre. Destaca-se por sua liderança natural nas atividades de ciências e artes. Apresenta ótima socialização, colaborando ativamente com os colegas. Em matemática, obteve nota 9.5, refletindo esforço e dedicação. Recomendamos continuar incentivando a leitura em casa para consolidação de vocabulário complementar.`,
        "Nicolas Nogueira": `Nicolas demonstrou um engajamento exemplar nas aulas de história e geografia. Destacou-se nas atividades práticas e demonstra forte interesse em esportes e cooperação. Em língua portuguesa, obteve média 8.2 e demonstrou excelente desenvoltura nas rodas de conversa. Sua atenção às instruções tem evoluído de maneira sólida e constante.`,
        "Theo Oliveira": `Theo tem se mostrado um aluno extremamente curioso e focado em experimentos científicos e raciocínio lógico. Seu desempenho em matemática atingiu a nota máxima 10.0, demonstrando maestria absoluta. Apresenta comportamento colaborativo e muito proativo. Sugerimos manter o incentivo com leituras de ficção científica para potencializar a criatividade escrita.`
      };
      setAiReportOutput(reports[selectedStudentForAi] || reports["Alice Souza"]);
    }, 1500);
  };

  return (
    <div className="space-y-6" id="market-intel-root">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-indigo-950 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1 rounded-xl text-xs transition-all border border-white/20 flex items-center gap-1 cursor-pointer shrink-0 shadow-xs mr-1"
                  title="Voltar ao Painel da Escola"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
              )}
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest font-mono inline-block">
                Inteligência Competitiva & Gestão de Elite
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight leading-tight">
              Como Superar a Concorrência Escolar?
            </h1>
            <p className="text-xs text-slate-350 max-w-xl leading-relaxed">
              Descubra os gargalos das plataformas tradicionais do mercado (Sponte, ClipEscola, Agenda Edu) e veja como nosso ecossistema de marca própria posiciona sua escola em um nível premium de experiência e eficiência.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-800/80 backdrop-blur-xs border border-slate-750 p-4 rounded-2xl text-center">
              <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">Potencial de Economia</p>
              <p className="text-xl font-black text-emerald-400 font-mono">
                R$ {(calculatedSavings.totalFinancialBenefit).toLocaleString("pt-BR")}
              </p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">anuais estimados</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveSubTab("comparison")}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "comparison"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
          <span>📊 Comparativo de Mercado</span>
        </button>
        <button
          onClick={() => setActiveSubTab("roi")}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "roi"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>💰 Simulador de ROI & Eficiência</span>
        </button>
        <button
          onClick={() => setActiveSubTab("upgrades")}
          className={`pb-3 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "upgrades"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-blue-500" />
          <span>⚙️ Ativar Melhorias no App</span>
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: COMPARATIVE MATRIX */}
        {activeSubTab === "comparison" && (
          <motion.div
            key="comparison-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Context Summary */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-3">
              <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                <strong>O Diagnóstico de Mercado:</strong> Aplicativos genéricos de comunicação criam atrito ao forçar a escola em ambientes de terceiros, sem sua identidade visual própria, com cobranças frias que geram inadimplência e portarias lentas. Abaixo, entenda como nossa plataforma white-label reverte esses gargalos operacionais e eleva o valor intangível de sua marca.
              </p>
            </div>

            {/* Matrix Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Branding & Value Perceived */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">
                      1. Identidade de Marca (White-Label)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">Vs. Agenda Edu / ClipEscola</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850">
                    <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider font-mono">Concorrência Tradicional</p>
                    <p className="text-[11.5px] text-slate-600 dark:text-slate-400 mt-1">
                      A escola é inserida em um aplicativo "guarda-chuva" com as cores do player de tecnologia. Menos valor percebido e menor sensação de exclusividade para as famílias de alto padrão.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-[10.5px] font-black text-emerald-600 uppercase tracking-wider font-mono flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Nossa Solução White-Label
                    </p>
                    <p className="text-[11.5px] text-slate-700 dark:text-slate-300 mt-1 font-medium">
                      O aplicativo leva o nome, cores oficiais e ícone da sua escola diretamente na App Store/Google Play. A tecnologia serve para chancelar a excelência institucional da escola, não do intermediário.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Pedagogical Reports */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">
                      2. Parecer Descritivo e Redação IA
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">Vs. Totvs / Sponte / ClassDojo</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850">
                    <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider font-mono">Concorrência Tradicional</p>
                    <p className="text-[11.5px] text-slate-600 dark:text-slate-400 mt-1">
                      Professores passam de 15 a 30 horas por semestre digitando relatórios qualitativos do zero para cada aluno, gerando exaustão física e risco de redações burocráticas ou repetitivas.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-[10.5px] font-black text-emerald-600 uppercase tracking-wider font-mono flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Copiloto Inteligente Integrado
                    </p>
                    <p className="text-[11.5px] text-slate-700 dark:text-slate-300 mt-1 font-medium">
                      O professor seleciona conquistas qualitativas rápidas no diário. Nossa IA integrada (com Gemini SDK) redige rascunhos pedagógicos perfeitamente estruturados e éticos em segundos, economizando até 80% do tempo de digitação.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Financial Delinquency Management */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">
                      3. Cobrança e Régua Amigável (Finanças)
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">Vs. Sistemas ERP de Prateleira</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850">
                    <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider font-mono">Concorrência Tradicional</p>
                    <p className="text-[11.5px] text-slate-600 dark:text-slate-400 mt-1">
                      Envio frio de PDF de boletos por e-mail ou SMS. Nenhum incentivo à pontualidade, além de processos de renegociação frios e burocráticos que abalam a relação de confiança família-escola.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-[10.5px] font-black text-emerald-600 uppercase tracking-wider font-mono flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Régua Inteligente e Pix Copia-e-Cola
                    </p>
                    <p className="text-[11.5px] text-slate-700 dark:text-slate-300 mt-1 font-medium">
                      Notificações instantâneas e discretas no WhatsApp com botões interativos para pagamento via Pix em 1 clique. Descontos automáticos parametrizados e canal amigável de parcelamento reduzem a inadimplência média para menos de 2%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Gate Operations & Safety */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">
                      4. Portaria e Trânsito Inteligente
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">Vs. Sistemas Manuais ou Simples Avisos</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850">
                    <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider font-mono">Concorrência Tradicional</p>
                    <p className="text-[11.5px] text-slate-600 dark:text-slate-400 mt-1">
                      Os pais chegam de surpresa, buzinando ou aguardando nas calçadas. Funcionários precisam procurar os alunos nas salas no grito ou por interfone interno, causando caos de tráfego urbano e riscos à segurança.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-[10.5px] font-black text-emerald-600 uppercase tracking-wider font-mono flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Fila Preditiva Georreferenciada
                    </p>
                    <p className="text-[11.5px] text-slate-700 dark:text-slate-300 mt-1 font-medium">
                      O app detecta de forma síncrona a aproximação geográfica do carro do responsável por telemetria segura e coloca a foto do aluno no telão da portaria em ordem exata física, reduzindo a espera de 25 min para apenas 3 min.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* US & ISRAEL EDTECH BENCHMARKING GRID */}
            <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Sparkles className="w-4 h-4 animate-spin-slow" style={{ animationDuration: "10s" }} />
                </span>
                <div>
                  <span className="text-[9px] font-mono font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest block">BENCHMARK GLOBAL DE SUCESSO</span>
                  <h3 className="text-sm font-black text-[#423326] dark:text-amber-100 uppercase tracking-tight">O Que os Líderes nos EUA e Israel Estão Fazendo?</h3>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Nossa arquitetura de comunicação e engajamento foi projetada inspirando-se nos maiores casos de sucesso globais de EdTech, oferecendo o que há de mais moderno em gamificação, tradução automática e acompanhamento pedagógico preditivo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Benchmark Card 1: ClassDojo (US) */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono uppercase">🟢 ClassDojo • EUA</span>
                    <span className="text-[10px] font-bold text-slate-400">Gamificação</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Reforço Comportamental Positivo síncrono</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Distribuição ágil de selos de engajamento no diário escolar com alertas em tempo real no app dos pais, elevando o sentimento de conquista diária e orgulho familiar.
                  </p>
                </div>

                {/* Benchmark Card 2: ParentSquare (US) */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-mono uppercase">🔵 ParentSquare • EUA</span>
                    <span className="text-[10px] font-bold text-slate-400">Tradução Global</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Comunicação Unificada e Autorizações com TLS</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tradução bidirecional síncrona para o idioma preferido de cada família e assinatura com chaves digitais seguras para autorizações de eventos e passeios curriculares externos.
                  </p>
                </div>

                {/* Benchmark Card 3: Mashov (Israel) */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-mono uppercase">🔴 Mashov • Israel</span>
                    <span className="text-[10px] font-bold text-slate-400">Dados Preditivos</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Mapeamento Imediato de Gaps de Rendimento</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Identificação estatística preditiva de oscilações abruptas em avaliações e quedas de frequência com disparo síncrono para a coordenação pedagógica intervir imediatamente.
                  </p>
                </div>

                {/* Benchmark Card 4: Class.me (Israel) */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full font-mono uppercase">🟣 Class.me • Israel</span>
                    <span className="text-[10px] font-bold text-slate-400">Colaboração 24h</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Grupos de Dever de Casa e Mentoria Integrada</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Criação ágil de grupos de chat baseados em tarefas de casa com tutoria síncrona e respostas rápidas guiadas por IA para solucionar dúvidas de estudos sem atritos em casa.
                  </p>
                </div>
              </div>
            </div>

            {/* Strategic Upgrade Action Box */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 p-6 rounded-3xl border border-indigo-150 dark:border-indigo-900/40 text-center space-y-4">
              <h3 className="font-serif font-black text-slate-900 dark:text-white text-base">
                🚀 Pronto para implementar estas melhorias na sua escola?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
                Navegue pelas abas acima para simular a economia financeira exata (ROI) e ativar as regras inteligentes diretamente na base de dados da sua demonstração escolar.
              </p>
              <div className="flex justify-center gap-2.5">
                <button
                  onClick={() => setActiveSubTab("roi")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-[10.5px] uppercase tracking-wider font-mono cursor-pointer transition-all hover:scale-103 shadow-md"
                >
                  Calcular Meu Retorno
                </button>
                <button
                  onClick={() => setActiveSubTab("upgrades")}
                  className="bg-indigo-750 hover:bg-indigo-850 text-white font-black px-4 py-2 rounded-xl text-[10.5px] uppercase tracking-wider font-mono cursor-pointer transition-all hover:scale-103 shadow-md"
                >
                  Configurar Motores
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ROI SIMULATOR */}
        {activeSubTab === "roi" && (
          <motion.div
            key="roi-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Inputs Form Column */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
                    Parâmetros da Escola
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Insira os dados da sua instituição para calcular a eficiência potencial:
                  </p>
                </div>

                {/* Range Input 1: Students */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Número de Alunos Ativos:</span>
                    <span className="font-mono text-indigo-650 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-md font-black">{numStudents}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="1500"
                    step="10"
                    value={numStudents}
                    onChange={(e) => setNumStudents(Number(e.target.value))}
                    className="w-full accent-indigo-650 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                </div>

                {/* Range Input 2: Avg Ticket */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Mensalidade Média:</span>
                    <span className="font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-md font-black">R$ {avgMonthlyFee}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="5000"
                    step="50"
                    value={avgMonthlyFee}
                    onChange={(e) => setAvgMonthlyFee(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                </div>

                {/* Range Input 3: Current Inadimplência */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Taxa de Inadimplência Média (%):</span>
                    <span className="font-mono text-rose-600 bg-rose-50 dark:bg-rose-950 px-2.5 py-0.5 rounded-md font-black">{currentInadimplencia}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="0.5"
                    value={currentInadimplencia}
                    onChange={(e) => setCurrentInadimplencia(Number(e.target.value))}
                    className="w-full accent-rose-650 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                </div>

                {/* Range Input 4: Hours Spent on report cards */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Horas anuais de digitação de Boletim/Parecer (por aluno):</span>
                    <span className="font-mono text-purple-600 bg-purple-50 dark:bg-purple-950 px-2.5 py-0.5 rounded-md font-black">{teacherHoursSpent}h</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={teacherHoursSpent}
                    onChange={(e) => setTeacherHoursSpent(Number(e.target.value))}
                    className="w-full accent-purple-650 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
                  />
                </div>

                {/* ROI Note */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 space-y-1">
                  <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider font-mono block">Projeção Comparativa</span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Assumimos redução da inadimplência para <strong>1.8%</strong> e economia média de <strong>12 horas/aluno/ano</strong> na digitação qualitativa com o uso do nosso Copiloto IA integrado. Cost-hour docente estimado em R$ 45,00.
                  </p>
                </div>
              </div>

              {/* Financial Dashboard Column */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
                
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
                    Retorno Operacional e Financeiro Estimado
                  </h3>
                  
                  {/* Results cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Saving 1 */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-center">
                      <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Recuperado</p>
                      <p className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1">
                        R$ {calculatedSavings.revenueSaved.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-[9px] text-slate-450 mt-1">de faturamento outrora perdido em atrasos</p>
                    </div>

                    {/* Saving 2 */}
                    <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-center">
                      <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Tempo Salvo</p>
                      <p className="text-base font-black text-purple-700 dark:text-purple-400 font-mono mt-1">
                        {calculatedSavings.hoursSaved.toLocaleString("pt-BR")}h
                      </p>
                      <p className="text-[9px] text-slate-450 mt-1">de digitação de relatórios docentes anuais</p>
                    </div>

                    {/* Saving 3 */}
                    <div className="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/30 text-center">
                      <Zap className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Fila Portaria</p>
                      <p className="text-base font-black text-sky-700 dark:text-sky-400 font-mono mt-1">
                        {calculatedSavings.efficiencyGain} dias
                      </p>
                      <p className="text-[9px] text-slate-450 mt-1">de tempo de espera e emissão de gases evitados</p>
                    </div>

                  </div>

                  {/* Summary Box with Total Value */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-950 text-white space-y-2">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider font-mono text-indigo-300">Benefício Financeiro Total</span>
                      <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full font-mono">Upgrade de Elite</span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-2xl font-black font-mono text-emerald-400">
                        R$ {(calculatedSavings.totalFinancialBenefit).toLocaleString("pt-BR")}
                      </span>
                      <span className="text-[10px] text-indigo-200">anuais em ganho de produtividade + fluxo de caixa</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-normal pt-1 italic">
                      "Investir no aplicativo próprio da escola não é um custo, mas um ativo financeiro direto que gera retenção e reduz inadimplência de forma drástica."
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveSubTab("upgrades")}
                    className="w-full bg-indigo-700 hover:bg-indigo-850 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest font-mono cursor-pointer transition-all hover:scale-101 text-center shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Configurar e Ativar Estes Motores de ROI Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 3: UPGRADES ENGINE CONFIGURATION */}
        {activeSubTab === "upgrades" && (
          <motion.div
            key="upgrades-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Simulation Status Message */}
            {simulationResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>{simulationResult}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Toggles and Configuration sliders */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* Engine 1: Friendly Billing */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <DollarSign className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 uppercase tracking-tight">
                          Régua de Cobrança Amigável via Pix
                        </h4>
                        <p className="text-[10px] text-slate-400">Automatização de faturas sem estresse</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={upgradesState.friendlyBilling.enabled}
                        onChange={(e) => setUpgradesState({
                          ...upgradesState,
                          friendlyBilling: { ...upgradesState.friendlyBilling, enabled: e.target.checked }
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600" />
                    </label>
                  </div>

                  {upgradesState.friendlyBilling.enabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-850"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider font-mono block">Desconto Pontualidade:</label>
                          <select 
                            value={upgradesState.friendlyBilling.discountRate}
                            onChange={(e) => setUpgradesState({
                              ...upgradesState,
                              friendlyBilling: { ...upgradesState.friendlyBilling, discountRate: Number(e.target.value) }
                            })}
                            className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 font-bold"
                          >
                            <option value="0">Sem Desconto</option>
                            <option value="2">2% de Desconto</option>
                            <option value="5">5% de Desconto</option>
                            <option value="10">10% de Desconto</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider font-mono block">Canal Principal:</label>
                          <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>WhatsApp Integrado</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={triggerBillingSimulation}
                        className="w-full bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-mono font-black text-[9.5px] py-2 rounded-xl uppercase tracking-wider transition-all"
                      >
                        ⚡ Simular Disparo de Cobrança Amigável
                      </button>
                    </motion.div>
                  )}
                </div>

                {/* Engine 2: AI Pedagogical Copilot */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <Sparkles className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 uppercase tracking-tight">
                          Copiloto IA de Parecer Descritivo
                        </h4>
                        <p className="text-[10px] text-slate-400">Geração ética de relatórios de desempenho</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={upgradesState.aiPedagogicalCopilot.enabled}
                        onChange={(e) => setUpgradesState({
                          ...upgradesState,
                          aiPedagogicalCopilot: { ...upgradesState.aiPedagogicalCopilot, enabled: e.target.checked }
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600" />
                    </label>
                  </div>

                  {upgradesState.aiPedagogicalCopilot.enabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-850"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider font-mono block">Tom de Voz:</label>
                          <select 
                            value={upgradesState.aiPedagogicalCopilot.tone}
                            onChange={(e) => setUpgradesState({
                              ...upgradesState,
                              aiPedagogicalCopilot: { ...upgradesState.aiPedagogicalCopilot, tone: e.target.value }
                            })}
                            className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 font-bold"
                          >
                            <option value="acolhedor">Acolhedor & Empático</option>
                            <option value="tecnico">Técnico & Acadêmico</option>
                            <option value="objetivo">Focado em Metas</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-450 uppercase tracking-wider font-mono block">Extensão do Texto:</label>
                          <select 
                            value={upgradesState.aiPedagogicalCopilot.length}
                            onChange={(e) => setUpgradesState({
                              ...upgradesState,
                              aiPedagogicalCopilot: { ...upgradesState.aiPedagogicalCopilot, length: e.target.value }
                            })}
                            className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 font-bold"
                          >
                            <option value="curto">Sucinto (1 parágrafo)</option>
                            <option value="medio">Equilibrado (2 parágrafos)</option>
                            <option value="longo">Completo (Avaliação Ampla)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-450 uppercase tracking-wider font-mono block">Instruções Customizadas para a IA:</label>
                        <input 
                          type="text" 
                          value={upgradesState.aiPedagogicalCopilot.customInstructions}
                          onChange={(e) => setUpgradesState({
                            ...upgradesState,
                            aiPedagogicalCopilot: { ...upgradesState.aiPedagogicalCopilot, customInstructions: e.target.value }
                          })}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-700"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Engine 3: Predictive Gate */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                        <Clock className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-850 dark:text-slate-100 uppercase tracking-tight">
                          Portaria Preditiva & Sinal Síncrono
                        </h4>
                        <p className="text-[10px] text-slate-400">Ordenamento automático da fila de aproximação</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={upgradesState.predictiveGate.enabled}
                        onChange={(e) => setUpgradesState({
                          ...upgradesState,
                          predictiveGate: { ...upgradesState.predictiveGate, enabled: e.target.checked }
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-sky-650" />
                    </label>
                  </div>

                  {upgradesState.predictiveGate.enabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-850"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-650 font-mono">
                          <span>Raio de Ativação do Sinal:</span>
                          <span className="text-sky-650 font-black">{upgradesState.predictiveGate.proximityRadius} metros</span>
                        </div>
                        <input
                          type="range"
                          min="200"
                          max="2000"
                          step="100"
                          value={upgradesState.predictiveGate.proximityRadius}
                          onChange={(e) => setUpgradesState({
                            ...upgradesState,
                            predictiveGate: { ...upgradesState.predictiveGate, proximityRadius: Number(e.target.value) }
                          })}
                          className="w-full accent-sky-650 cursor-pointer h-1.2"
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
                        <span>Ordenação física em tempo real:</span>
                        <span className="text-[10px] font-black bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md">Ativa (Ordenada por ETA)</span>
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>

              {/* Right Column: Live Testing Playground (Parecer Generator Preview & Billing Logs) */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* AI Copilot Test-Drive box */}
                {upgradesState.aiPedagogicalCopilot.enabled && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xs">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4.5 h-4.5 text-purple-600 animate-pulse" />
                      <h4 className="text-xs font-black text-[#423326] dark:text-amber-100 uppercase tracking-wider font-sans">
                        Test-Drive: Copiloto de Parecer Descritivo
                      </h4>
                    </div>
                    
                    <p className="text-[11px] text-slate-500">
                      Gere um rascunho de parecer descritivo para um aluno com base na sua parametrização acima:
                    </p>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-xs font-semibold text-slate-600">Selecione o Aluno:</span>
                      {["Alice Souza", "Nicolas Nogueira", "Theo Oliveira"].map((student) => (
                        <button
                          key={student}
                          onClick={() => setSelectedStudentForAi(student)}
                          className={`text-[10.5px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider border transition-all cursor-pointer ${
                            selectedStudentForAi === student
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {student}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl min-h-[120px] flex flex-col justify-between">
                      {isGeneratingAi ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2">
                          <span className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-mono text-purple-600 animate-pulse">Consultando cérebro pedagógico IA...</span>
                        </div>
                      ) : aiReportOutput ? (
                        <div className="space-y-3">
                          <p className="text-[11.5px] text-slate-700 dark:text-slate-300 italic leading-relaxed">
                            "{aiReportOutput}"
                          </p>
                          <div className="flex justify-between items-center border-t border-slate-200/50 pt-2 text-[9.5px] text-slate-400 font-mono">
                            <span>Foco: {upgradesState.aiPedagogicalCopilot.customInstructions}</span>
                            <span className="flex items-center gap-1 text-purple-600 font-bold">
                              <ThumbsUp className="w-3 h-3" />
                              Pronto para usar
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 text-xs py-8 italic">
                          Nenhum parecer gerado ainda. Clique no botão abaixo para testar!
                        </div>
                      )}
                    </div>

                    <button
                      onClick={simulateAiReportGeneration}
                      disabled={isGeneratingAi}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-mono font-black text-[10.5px] py-2.5 rounded-xl uppercase tracking-wider transition-all hover:scale-101 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gerar Parecer com Copiloto IA ✦</span>
                    </button>
                  </div>
                )}

                {/* Billing Operation Console Logs */}
                {upgradesState.friendlyBilling.enabled && (
                  <div className="bg-slate-950 text-emerald-400 p-5 rounded-3xl border border-slate-800 space-y-3 font-mono shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Console de Conciliação de Cobrança
                      </span>
                      <span className="text-[8.5px] text-slate-500">v1.2 // Sandbox</span>
                    </div>

                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto text-[10px] leading-relaxed scrollbar-none">
                      {billingLogs.map((log, index) => (
                        <div key={index} className="opacity-90 border-l border-slate-800 pl-2">
                          {log}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Status: Ouvindo Webhooks Pix...</span>
                      <button 
                        onClick={() => setBillingLogs(["[Console limpo] Pronto para novos disparos."])}
                        className="text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Limpar Console
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* QUICK ROADMAP WIDGET */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">
          Próximos Passos de Integração e Implantação Escolar
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div>
              <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight leading-none">Branding & Cores</p>
              <p className="text-[9.5px] text-slate-450 mt-1 leading-normal">Carregue sua identidade visual na aba principal do site da escola.</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div>
              <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight leading-none">Sincronia do ERP</p>
              <p className="text-[9.5px] text-slate-450 mt-1 leading-normal">Mapeie as turmas e alunos usando nossa API REST síncrona na aba Sincronia.</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <div>
              <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight leading-none">Homologar Contas</p>
              <p className="text-[9.5px] text-slate-450 mt-1 leading-normal">Configure seu Gateway de Pagamento Pix para conciliação bancária instantânea.</p>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-start">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
            <div>
              <p className="text-[11px] font-black uppercase text-slate-800 tracking-tight leading-none">Publicar nas Lojas</p>
              <p className="text-[9.5px] text-slate-450 mt-1 leading-normal">Disparamos o build e publicamos na App Store de forma white-label em 15 dias.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
