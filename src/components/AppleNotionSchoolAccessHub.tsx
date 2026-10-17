import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  Layers, 
  Smartphone, 
  Database, 
  ShieldCheck, 
  Coffee, 
  Heart, 
  Activity, 
  Plus, 
  Check, 
  RefreshCw, 
  AlertTriangle, 
  ChevronRight, 
  Bookmark, 
  Sparkles, 
  FileText, 
  DollarSign, 
  Sliders, 
  FileCheck, 
  TrendingUp, 
  Clock, 
  Search,
  Bell,
  Fingerprint,
  Apple
} from "lucide-react";

// Types of school occurrences
export interface SchoolOccurrence {
  id: string;
  studentName: string;
  type: "Atraso" | "Elogio" | "Advertência" | "Ocorrência Médica" | "Suspensão" | "Saída Antecipada";
  date: string;
  severity: "Baixa" | "Média" | "Alta";
  description: string;
  registeredBy: string;
  status: "Registrada" | "Notificada aos Pais" | "Assinada/Lida";
}

// Initial Occurrences Seed
const INITIAL_OCCURRENCES: SchoolOccurrence[] = [
  {
    id: "oc-1",
    studentName: "Nicolas Mendes",
    type: "Elogio",
    date: "Hoje, 09:15",
    severity: "Baixa",
    description: "Demonstrou excelente espírito de cooperação ajudando os colegas a organizar os blocos de robótica no laboratório.",
    registeredBy: "Prof. Gabriel",
    status: "Assinada/Lida"
  },
  {
    id: "oc-2",
    studentName: "Nicolas Mendes",
    type: "Atraso",
    date: "Ontem, 08:25",
    severity: "Baixa",
    description: "Chegada após o fechamento do portão regulamentar. Tolerância de 15 minutos excedida.",
    registeredBy: "Portaria Central",
    status: "Notificada aos Pais"
  },
  {
    id: "oc-3",
    studentName: "Beatriz Rocha",
    type: "Ocorrência Médica",
    date: "07/07/2026, 11:30",
    severity: "Média",
    description: "Queixa de leve cefaleia. Temperatura aferida em 37.4°C. Ministrado repouso e acompanhamento no lactário.",
    registeredBy: "Enfermaria Marina",
    status: "Assinada/Lida"
  },
  {
    id: "oc-4",
    studentName: "Enzo Santos",
    type: "Advertência",
    date: "06/07/2026, 14:10",
    severity: "Média",
    description: "Uso inadequado de vocabulário hostil com colegas durante a partida de futebol no recreio.",
    registeredBy: "Coordenadora Priscila",
    status: "Notificada aos Pais"
  }
];

export interface MedicineRequest {
  id: string;
  studentName: string;
  medicineName: string;
  dosage: string;
  schedule: string;
  prescriptionUploaded: boolean;
  status: "Pendente" | "Administrado" | "Recusado";
  requestedAt: string;
}

const INITIAL_MED_REQUESTS: MedicineRequest[] = [
  {
    id: "med-1",
    studentName: "Nicolas Mendes",
    medicineName: "Ibuprofeno Infantil",
    dosage: "10 gotas",
    schedule: "11:30 (Caso febre acima de 37.8°C)",
    prescriptionUploaded: true,
    status: "Administrado",
    requestedAt: "Hoje, 07:30"
  },
  {
    id: "med-2",
    studentName: "Beatriz Rocha",
    medicineName: "Amoxicilina Suspensão",
    dosage: "5ml",
    schedule: "14:00 (Tratamento contínuo)",
    prescriptionUploaded: true,
    status: "Pendente",
    requestedAt: "Hoje, 08:00"
  }
];

export function AppleNotionSchoolAccessHub() {
  const [activeTab, setActiveTab] = useState<"notion-dashboard" | "erp-automation" | "canteen" | "medication" | "occurrences">("notion-dashboard");
  
  // Occurrences and Medicines states
  const [occurrences, setOccurrences] = useState<SchoolOccurrence[]>(INITIAL_OCCURRENCES);
  const [medicines, setMedicines] = useState<MedicineRequest[]>(INITIAL_MED_REQUESTS);
  
  // Form state for medicine request
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedSchedule, setNewMedSchedule] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("Nicolas Mendes");
  
  // Form state for occurrences
  const [occStudent, setOccStudent] = useState("Nicolas Mendes");
  const [occType, setOccType] = useState<SchoolOccurrence["type"]>("Elogio");
  const [occSeverity, setOccSeverity] = useState<SchoolOccurrence["severity"]>("Baixa");
  const [occDesc, setOccDesc] = useState("");

  // ERP State and simulated connections
  const [activeErps, setActiveErps] = useState<string[]>(["asaas", "totvs"]);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [canteenBalance, setCanteenBalance] = useState(135.50);
  const [autoTopupEnabled, setAutoTopupEnabled] = useState(true);
  const [autoTopupValue, setAutoTopupValue] = useState(100);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Add automated logs on load or toggle
  const logEvent = (msg: string) => {
    const time = new Date().toLocaleTimeString("pt-BR");
    setSyncLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  useEffect(() => {
    logEvent("Iniciando barramento de sincronia de dados inteligentes...");
    logEvent("Webhook conectado com sucesso ao Gateway Multi-ERP.");
  }, []);

  const handleToggleErp = (erp: string) => {
    if (activeErps.includes(erp)) {
      setActiveErps(prev => prev.filter(item => item !== erp));
      logEvent(`Conexão com ERP ${erp.toUpperCase()} desativada pelo administrador.`);
      showToast(`Integração com ${erp.toUpperCase()} suspensa.`, "info");
    } else {
      setActiveErps(prev => [...prev, erp]);
      logEvent(`Nova conexão de API estabelecida com ${erp.toUpperCase()} - Chave validada.`);
      showToast(`Integração com ${erp.toUpperCase()} ativada com sucesso!`, "success");
    }
  };

  const handleCreateMedicineRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim() || !newMedSchedule.trim()) {
      showToast("Preencha todos os campos do medicamento.", "error");
      return;
    }
    const newRequest: MedicineRequest = {
      id: `med-${Date.now()}`,
      studentName: selectedStudent,
      medicineName: newMedName,
      dosage: newMedDosage,
      schedule: newMedSchedule,
      prescriptionUploaded: true,
      status: "Pendente",
      requestedAt: "Agora mesmo"
    };

    setMedicines(prev => [newRequest, ...prev]);
    setNewMedName("");
    setNewMedDosage("");
    setNewMedSchedule("");
    showToast("Autorização enviada e registrada na caderneta do professor! 💊", "success");
    logEvent(`Solicitação de medicamento recebida para o aluno ${selectedStudent}.`);
  };

  const handleCreateOccurrence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!occDesc.trim()) {
      showToast("Insira a descrição da ocorrência escolar.", "error");
      return;
    }
    const newOcc: SchoolOccurrence = {
      id: `oc-${Date.now()}`,
      studentName: occStudent,
      type: occType,
      date: "Hoje, " + new Date().toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'}),
      severity: occSeverity,
      description: occDesc,
      registeredBy: "Coordenador Logístico",
      status: "Notificada aos Pais"
    };

    setOccurrences(prev => [newOcc, ...prev]);
    setOccDesc("");
    showToast(`Ocorrência de ${occType} registrada e notificada via Push e WhatsApp! 🔔`, "success");
    logEvent(`Ocorrência de ${occType} gravada para o estudante ${occStudent}.`);
  };

  const handleCanteenAddCredit = (val: number) => {
    setCanteenBalance(prev => prev + val);
    showToast(`Recarga de R$ ${val},00 autorizada via PIX integrado!`, "success");
    logEvent(`Recarga de Cantina R$ ${val},00 faturada automaticamente no ERP.`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl p-5 sm:p-7 shadow-xl space-y-7 transition-all duration-300" id="apple-notion-premium-hub">
      
      {/* BRANDING HEADER - APPLE/NOTION MINIMALIST DESIGN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200/60 dark:border-slate-900 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-100 shadow-sm shrink-0">
            <Apple className="w-6.5 h-6.5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] uppercase font-mono font-black tracking-widest text-indigo-650 dark:text-indigo-400">
                PROJETO ACESSO PREMIUM • COLÉGIO INTEGRADO
              </span>
              <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[8px] font-mono font-black px-1.5 py-0.5 rounded-md uppercase">
                v2.4 Live
              </span>
            </div>
            <h3 className="font-serif font-black text-xl text-slate-900 dark:text-slate-50">
              Ambiente de Gestão e Conexão Inteligente
            </h3>
            <p className="text-[11.5px] text-slate-500 font-sans mt-0.5 max-w-xl">
              Uma experiência fluida e visualmente refinada inspirada nas diretrizes estéticas da Apple e Notion, consolidando integrações multi-ERP e dados automáticos.
            </p>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-3xs shrink-0 self-start md:self-center">
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Status do Barramento</span>
            <span className="text-[10.5px] text-slate-850 dark:text-slate-200 font-extrabold flex items-center gap-1">
              {activeErps.length} ERPs Alimentando em Tempo Real
            </span>
          </div>
        </div>
      </div>

      {/* NOTION-STYLE SIDEBAR NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 pb-1 border-b border-slate-200/40 dark:border-slate-900/40">
        {[
          { id: "notion-dashboard", label: "Overview de Acesso", icon: Apple },
          { id: "erp-automation", label: "Barramento Multi-ERP", icon: Database },
          { id: "occurrences", label: "Ocorrências Escolares", icon: AlertTriangle },
          { id: "canteen", label: "Cantina Nutricional", icon: Coffee },
          { id: "medication", label: "Autorizar Medicamentos", icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                showToast(`Visualizando: ${tab.label}`, "info");
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
                  : "bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-350 border border-slate-200/60 dark:border-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC VIEWPORTS */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: OVERVIEW DASHBOARD */}
        {activeTab === "notion-dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Quick Status Cards - Left/Top Block */}
            <div className="md:col-span-8 space-y-6">
              
              {/* Apple Concept Banner */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-955 to-slate-950 text-white p-6 rounded-3xl relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-white/10 text-emerald-400">
                      <RefreshCw className="w-4 h-4 animate-spin-slow" style={{ animationDuration: '6s' }} />
                    </span>
                    <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-300">
                      Alimentação Automática Sem Digitação Manual
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-serif font-black tracking-tight leading-snug">
                    "Tudo é sincronizado. Sem ruídos ou ligações."
                  </h4>
                  
                  <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
                    As informações relevantes aos pais (pagamentos, notas de cantina, prescrições de medicação, e avisos de entrada e saída) são extraídas diretamente dos maiores ERPs e consolidadas no feed nativo.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                      <span className="text-[8.5px] uppercase font-mono tracking-widest text-slate-400 block">Mensalidades</span>
                      <strong className="text-xs text-emerald-400 block mt-0.5">Automático ✓</strong>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                      <span className="text-[8.5px] uppercase font-mono tracking-widest text-slate-400 block">Rematrículas</span>
                      <strong className="text-xs text-emerald-400 block mt-0.5">Assinatura Digital</strong>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                      <span className="text-[8.5px] uppercase font-mono tracking-widest text-slate-400 block">Cantina</span>
                      <strong className="text-xs text-indigo-400 block mt-0.5">Pix Direto</strong>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-center">
                      <span className="text-[8.5px] uppercase font-mono tracking-widest text-slate-400 block">Medicamentos</span>
                      <strong className="text-xs text-rose-400 block mt-0.5">Termo Médico</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Grid Concept in Notion Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Block 1: Active ERP Integrations summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-650 rounded-xl">
                      <Database className="w-5 h-5" />
                    </span>
                    <button 
                      onClick={() => setActiveTab("erp-automation")}
                      className="text-[10px] font-black uppercase text-indigo-650 tracking-wider hover:underline font-mono"
                    >
                      Gerenciar Hub
                    </button>
                  </div>
                  <div>
                    <h5 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100">
                      Integração Conectada
                    </h5>
                    <p className="text-[10.5px] text-slate-500 leading-normal mt-1">
                      Sua instituição de ensino está pareada com as APIs do <strong>{activeErps.map(e => e.toUpperCase()).join(", ")}</strong>. Cobranças automáticas são disparadas no ato de lançamento.
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl text-[9px] font-mono text-slate-500 max-h-20 overflow-hidden leading-relaxed">
                    Logs rápidos: {syncLogs[0] || "Sem transações nas últimas horas."}
                  </div>
                </div>

                {/* Block 2: Canteen limits */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-650 rounded-xl">
                      <Coffee className="w-5 h-5" />
                    </span>
                    <strong className="text-xs font-mono text-slate-900 dark:text-slate-100">
                      R$ {canteenBalance.toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <h5 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100">
                      Cantina & Nutrição
                    </h5>
                    <p className="text-[10.5px] text-slate-500 leading-normal mt-1">
                      A recarga via PIX e bloqueio de alimentos prejudiciais (como refrigerantes e açúcar) refletem imediatamente na carteirinha virtual do aluno.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCanteenAddCredit(20)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 rounded-lg text-center"
                    >
                      + R$ 20 PIX
                    </button>
                    <button 
                      onClick={() => setActiveTab("canteen")}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] px-3 py-1.5 rounded-lg"
                    >
                      Ajustes
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Sidebar widgets - Right Block */}
            <div className="md:col-span-4 space-y-6">
              
              {/* Medication widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-3xs">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-serif font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Medicamentos Ativos
                  </span>
                  <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded">
                    {medicines.filter(m => m.status === "Pendente").length} pendente(s)
                  </span>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {medicines.map((med) => (
                    <div key={med.id} className="border-b border-slate-100 dark:border-slate-850 pb-2 last:border-b-0">
                      <div className="flex justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        <span>{med.medicineName}</span>
                        <span className={`text-[8.5px] px-1.5 py-0.5 rounded uppercase font-mono ${
                          med.status === "Administrado" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>{med.status}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Dose: {med.dosage} • {med.schedule}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab("medication")}
                  className="w-full bg-[#fdfaf3] dark:bg-slate-950 hover:bg-amber-50 dark:hover:bg-slate-850 text-[#423326] dark:text-slate-200 border border-amber-150 dark:border-slate-850 text-[10px] font-bold py-2 rounded-xl text-center"
                >
                  Nova Autorização de Pais
                </button>
              </div>

              {/* Occurrences Quick Feed */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-3xs">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-serif font-black text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Ocorrências Escolares
                  </span>
                </div>

                <div className="space-y-3">
                  {occurrences.slice(0, 2).map((occ) => (
                    <div key={occ.id} className="text-[10.5px] leading-relaxed border-b border-slate-100 dark:border-slate-850 pb-2.5 last:border-0">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-800 dark:text-slate-200">{occ.studentName}</span>
                        <span className={`text-[8px] font-black uppercase font-mono px-1 rounded ${
                          occ.type === "Elogio" ? "bg-emerald-100 text-emerald-800" : occ.type === "Atraso" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>{occ.type}</span>
                      </div>
                      <p className="text-slate-500 mt-1 line-clamp-2">{occ.description}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab("occurrences")}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-[10px] font-bold py-2 rounded-xl text-center"
                >
                  Ver Todo Histórico de Ocorrências
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* VIEW 2: MULTI-ERP WEBHOOK & AUTO-FEED CONNECTOR */}
        {activeTab === "erp-automation" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Explanatory box */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-2">
              <h4 className="font-serif font-black text-sm text-amber-200">Suporte a Múltiplos ERPs & Sincronia de Alta Frequência</h4>
              <p className="text-xs text-slate-350 leading-relaxed">
                Centralize o fluxo financeiro e cadastral. Ative e pareie as chaves de API correspondentes de forma transparente. Com o barramento inteligente, o sistema importa e atualiza automaticamente faturas, contratos assinados e atividades extras diretamente no feed dos responsáveis, sem necessidade de digitação secundária.
              </p>
            </div>

            {/* ERP Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "asaas", name: "Asaas Finanças", desc: "Emissor integrado de PIX & boletos recorrentes", logo: "💳" },
                { id: "totvs", name: "TOTVS Protheus", desc: "Gestão escolar corporativa unificada", logo: "🏛️" },
                { id: "sap", name: "SAP Business One", desc: "Contabilidade em tempo real & faturamento", logo: "🌐" },
                { id: "iugu", name: "Iugu Hub", desc: "Split de pagamentos de atividades extras", logo: "🧩" },
                { id: "sponte", name: "Sponte Gestão", desc: "Portal acadêmico e emissor de contratos", logo: "🎓" },
                { id: "sophia", name: "Sophia Escolar", desc: "Secretaria automatizada e controle de vagas", logo: "📂" },
                { id: "alterdata", name: "Alterdata ERP", desc: "Integração contábil e de folha pedagógica", logo: "📈" },
                { id: "lyceum", name: "Lyceum Acadêmico", desc: "Sincronização de rematrícula e contratos", logo: "✍️" },
              ].map((erp) => {
                const isConnected = activeErps.includes(erp.id);
                return (
                  <div 
                    key={erp.id}
                    onClick={() => handleToggleErp(erp.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 ${
                      isConnected 
                        ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-900 shadow-sm" 
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl">{erp.logo}</span>
                        <span className={`text-[8px] font-black uppercase font-mono px-1.5 py-0.5 rounded-full ${
                          isConnected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-800"
                        }`}>
                          {isConnected ? "Ligado" : "Desconectado"}
                        </span>
                      </div>
                      <h5 className="font-sans font-bold text-xs text-slate-900 dark:text-slate-100">{erp.name}</h5>
                      <p className="text-[10px] text-slate-450 leading-snug">{erp.desc}</p>
                    </div>

                    <div className="text-[9px] font-mono font-bold text-indigo-700 dark:text-indigo-400">
                      {isConnected ? "✓ Webhook Sincronizado" : "+ Conectar API"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulated Live Logs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-3xs">
              <h5 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Terminal de Atividades Recentes de Sincronia (Mapeamento de Filas)
              </h5>
              
              <div className="bg-slate-950 text-emerald-400 font-mono text-[10px] p-4 rounded-2xl space-y-1 h-44 overflow-y-auto">
                {syncLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: CANTINA & DIGITAL PRE-PAID CREDITS */}
        {activeTab === "canteen" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Top-up panel */}
            <div className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-3xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-mono font-black text-slate-450 block">GERENCIADOR DE CRÉDITO</span>
                <h4 className="font-serif font-black text-base text-slate-900 dark:text-slate-50 mt-1">Carregar Saldo Pré-pago via PIX / ERP</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-1">
                  O valor entra imediatamente na carteira digital do estudante Nicolas Mendes para gastos com alimentação controlada.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 flex justify-between items-center">
                <div>
                  <span className="text-[9.5px] uppercase font-mono text-slate-400 block">Saldo Atual</span>
                  <strong className="text-2xl font-mono text-slate-900 dark:text-slate-50">R$ {canteenBalance.toFixed(2)}</strong>
                </div>
                <div className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-black px-2.5 py-1 rounded-full uppercase">
                  Saldo Ativo
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] uppercase font-mono font-black text-slate-400 block">Fazer Recarga Rápida:</span>
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => handleCanteenAddCredit(val)}
                      className="bg-white hover:bg-emerald-50 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer text-center shadow-3xs"
                    >
                      + R$ {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Automatic Recharge Settings */}
              <div className="pt-4 border-t border-slate-150 dark:border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-slate-800 dark:text-slate-200 block font-bold">Recarga Recorrente Automática</strong>
                    <p className="text-[10px] text-slate-400">Inserir saldo quando atingir menos de R$ 15,00</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={autoTopupEnabled}
                    onChange={(e) => {
                      setAutoTopupEnabled(e.target.checked);
                      showToast(e.target.checked ? "Recarga automática ativada!" : "Recarga automática suspensa.", "info");
                    }}
                    className="w-4.5 h-4.5 rounded border-slate-350 accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Food restriction panel */}
            <div className="md:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-3xs">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-mono font-black text-slate-450 block">BLOCKED ITEMS / DIETARY CONTROLS</span>
                <h4 className="font-serif font-black text-base text-slate-900 dark:text-slate-50 mt-1">Bloqueios & Alergias Alimentares</h4>
                <p className="text-[11px] text-slate-500 leading-normal mt-1">
                  Marque os alimentos proibidos abaixo. Caso o estudante tente adquiri-los, o sistema de caixa PDV da escola emitirá um alerta imediato impedindo a venda.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: "Refrigerantes / Bebidas de Açúcar", category: "Bebidas", blocked: true },
                  { name: "Frisantes / Chocolates Embalados", category: "Guloseimas", blocked: true },
                  { name: "Salgados Fritos (Coxinha de Massa)", category: "Salgados", blocked: false },
                  { name: "Bolachas Recheadas com Glúten", category: "Biscoitos", blocked: false }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-2xl">
                    <div>
                      <strong className="text-xs text-slate-850 dark:text-slate-200 block font-bold">{item.name}</strong>
                      <span className="text-[9px] font-mono uppercase text-slate-400 block">{item.category}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase ${
                      item.blocked ? "bg-rose-100 text-rose-800 dark:bg-rose-950/45" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/45"
                    }`}>
                      {item.blocked ? "🚫 Bloqueado" : "✓ Permitido"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: MEDICAL PRESCRIPTION & SIGNATURES */}
        {activeTab === "medication" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* New Medication request form */}
            <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-3xs">
              <div>
                <h4 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100">
                  Cadastrar Termo de Medicamento
                </h4>
                <p className="text-[10.5px] text-slate-500 mt-0.5">
                  Autorize a enfermaria ou professora regente a ministrar medicamentos durante as aulas.
                </p>
              </div>

              <form onSubmit={handleCreateMedicineRequest} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-black uppercase text-slate-400 block">Aluno Alvo:</label>
                  <select 
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 font-bold outline-none"
                  >
                    <option value="Nicolas Mendes">Nicolas Mendes</option>
                    <option value="Beatriz Rocha">Beatriz Rocha</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-black uppercase text-slate-400 block">Nome do Medicamento:</label>
                  <input
                    type="text"
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="Ex: Tylenol Bebê, Dipirona gotas"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 font-bold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono font-black uppercase text-slate-400 block">Dosagem:</label>
                    <input
                      type="text"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      placeholder="Ex: 5 ml, 8 gotas"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono font-black uppercase text-slate-400 block">Horário / Condição:</label>
                    <input
                      type="text"
                      value={newMedSchedule}
                      onChange={(e) => setNewMedSchedule(e.target.value)}
                      placeholder="Ex: 13:00, se febre"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="bg-amber-50/50 dark:bg-slate-950 border border-dashed border-amber-200 p-3 rounded-2xl text-center space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider font-black font-mono text-amber-800 block">Receita Médica Digital</span>
                  <p className="text-[10px] text-slate-500">Fotografe ou anexe o documento em PDF de prescrição clínica.</p>
                  <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100">
                    📎 receita_medica_nicolas.pdf (Adicionado)
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-850 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs py-2.5 rounded-xl text-center"
                >
                  Registrar e Assinar Digitalmente
                </button>
              </form>
            </div>

            {/* List and timeline of administration */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-3xs">
              <div>
                <h4 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100">
                  Caderneta de Ministração Escolar
                </h4>
                <p className="text-[10.5px] text-slate-450 mt-0.5">
                  Ocorrência em tempo real assinada pela equipe de enfermagem escolar.
                </p>
              </div>

              <div className="space-y-4">
                {medicines.map((med) => (
                  <div key={med.id} className="p-4 bg-[#fcfaf4] dark:bg-slate-950 border border-amber-100 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex gap-3">
                      <span className="text-2xl mt-0.5">💊</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-slate-850 dark:text-slate-250 font-bold">{med.medicineName}</strong>
                          <span className="bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[8px] font-mono font-bold px-1 py-0.5 rounded">
                            {med.studentName}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 mt-1">
                          Dosagem prescrita: <strong>{med.dosage}</strong> no período <strong>{med.schedule}</strong>.
                        </p>
                        <span className="text-[9px] font-mono text-slate-400 block mt-1">Registrado por responsável em: {med.requestedAt}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider font-mono ${
                        med.status === "Administrado" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}>
                        {med.status}
                      </span>
                      {med.status === "Pendente" && (
                        <button
                          onClick={() => {
                            setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, status: "Administrado" } : m));
                            showToast("Confirmado pelo enfermeiro de plantão! Dose registrada.", "success");
                            logEvent(`Medicamento ${med.medicineName} ministrado para ${med.studentName}.`);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] px-2.5 py-1 rounded-lg"
                        >
                          Confirmar Ministração
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 5: GENERAL OCCURRENCES PANEL */}
        {activeTab === "occurrences" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6"
          >
            {/* Occurrence log form */}
            <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-3xs">
              <div>
                <h4 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100">
                  Lançar Ocorrência Escolar
                </h4>
                <p className="text-[10.5px] text-slate-550 mt-0.5">
                  Preencha para registrar elogios, atrasos, ocorrências disciplinares ou comunicados importantes de comportamento.
                </p>
              </div>

              <form onSubmit={handleCreateOccurrence} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-black uppercase text-slate-400 block">Estudante Alvo:</label>
                  <select 
                    value={occStudent}
                    onChange={(e) => setOccStudent(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 font-bold outline-none"
                  >
                    <option value="Nicolas Mendes">Nicolas Mendes</option>
                    <option value="Beatriz Rocha">Beatriz Rocha</option>
                    <option value="Enzo Santos">Enzo Santos</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-black uppercase text-slate-400 block">Tipo de Ocorrência:</label>
                  <select 
                    value={occType}
                    onChange={(e) => setOccType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 font-bold outline-none"
                  >
                    <option value="Elogio">Elogio 🌟</option>
                    <option value="Atraso">Atraso ⏰</option>
                    <option value="Advertência">Advertência ⚠️</option>
                    <option value="Ocorrência Médica">Ocorrência Médica 🩺</option>
                    <option value="Suspensão">Suspensão 🛑</option>
                    <option value="Saída Antecipada">Saída Antecipada 🚗</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-black uppercase text-slate-400 block">Gravidade:</label>
                  <div className="flex gap-2">
                    {["Baixa", "Média", "Alta"].map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setOccSeverity(sev as any)}
                        className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                          occSeverity === sev
                            ? "bg-amber-800 text-white border-amber-800"
                            : "bg-slate-50 text-slate-600 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-black uppercase text-slate-400 block">Relato Detalhado:</label>
                  <textarea
                    value={occDesc}
                    onChange={(e) => setOccDesc(e.target.value)}
                    placeholder="Descreva detalhadamente o evento..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 font-bold outline-none resize-none"
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-850 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs py-2.5 rounded-xl text-center"
                >
                  Registrar e Notificar Responsáveis
                </button>
              </form>
            </div>

            {/* List of occurrences */}
            <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-3xs">
              <div>
                <h4 className="font-serif font-black text-sm text-slate-900 dark:text-slate-100">
                  Painel de Ocorrências e Monitoramento Contínuo
                </h4>
                <p className="text-[10.5px] text-slate-450 mt-0.5">
                  Auditório histórico de eventos coletados e assinados eletronicamente pelos responsáveis dos alunos.
                </p>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {occurrences.map((occ) => (
                  <div key={occ.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 rounded-2xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs text-slate-850 dark:text-slate-200">{occ.studentName}</strong>
                        <span className="text-[10px] text-slate-400">• {occ.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                          occ.type === "Elogio" ? "bg-emerald-100 text-emerald-800" : occ.type === "Atraso" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {occ.type}
                        </span>
                        <span className={`text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                          occ.severity === "Alta" ? "bg-rose-600 text-white" : occ.severity === "Média" ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350"
                        }`}>
                          Grau {occ.severity}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      "{occ.description}"
                    </p>

                    <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-mono border-t border-slate-200/40 dark:border-slate-900/40 pt-2">
                      <span>Registrado por: <strong>{occ.registeredBy}</strong></span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Status: {occ.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Floating alert/success Toast inside component */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 max-w-sm p-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fade-in ${
          toast.type === "success" 
            ? "bg-slate-900 text-white border-slate-800 dark:bg-white dark:text-slate-950 dark:border-slate-100" 
            : toast.type === "error"
            ? "bg-rose-50 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100 border-rose-250"
            : "bg-slate-900 text-white border-slate-800"
        }`}>
          <div className="text-xs font-black leading-relaxed">
            {toast.message}
          </div>
        </div>
      )}

    </div>
  );
}
