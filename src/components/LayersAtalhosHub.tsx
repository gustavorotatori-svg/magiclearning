import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  QrCode, 
  CreditCard, 
  Coffee, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  Clock, 
  ChevronRight, 
  AlertTriangle,
  Coins, 
  TrendingUp, 
  Fingerprint,
  CheckCircle2,
  Lock,
  Unlock,
  GraduationCap
} from "lucide-react";
import { Estudante } from "../types";

interface LayersAtalhosHubProps {
  activeStudent: Estudante;
  onNavigateTab: (tab: "comunicados" | "diaadia" | "academico" | "cobrancas" | "acesso") => void;
  schoolName?: string;
}

export default function LayersAtalhosHub({ activeStudent, onNavigateTab, schoolName = "Magic Learning" }: LayersAtalhosHubProps) {
  // Modal states
  const [activeModal, setActiveModal] = useState<"card" | "canteen" | "schedule" | null>(null);
  
  // Card customization stats
  const [isFlipped, setIsFlipped] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  // Canteen states
  const [canteenBalance, setCanteenBalance] = useState(74.50);
  const [addingValue, setAddingValue] = useState<number | null>(null);
  const [blockedItems, setBlockedItems] = useState<string[]>(["Refrigerantes", "Chocolates"]);
  const [successAdd, setSuccessAdd] = useState(false);

  // Quick snacks available for locking
  const snacksList = [
    { name: "Salgado de Presunto e Queijo", cat: "Salgados" },
    { name: "Suco Natural de Laranja", cat: "Bebidas" },
    { name: "Refrigerantes", cat: "Bebidas Carbonatadas" },
    { name: "Chocolates", cat: "Doces e Guloseimas" },
    { name: "Batata Frita Chips", cat: "Snacks" },
    { name: "Frutas Picadas", cat: "Saudável" }
  ];

  // Move effect for holographic card glare
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePos({ x, y });
  };

  const handleAddBalance = (val: number) => {
    setAddingValue(val);
    setTimeout(() => {
      setCanteenBalance(prev => prev + val);
      setAddingValue(null);
      setSuccessAdd(true);
      setTimeout(() => setSuccessAdd(false), 2500);
    }, 1200);
  };

  const toggleBlockSnack = (snack: string) => {
    if (blockedItems.includes(snack)) {
      setBlockedItems(prev => prev.filter(item => item !== snack));
    } else {
      setBlockedItems(prev => [...prev, snack]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-800 dark:text-amber-500 uppercase tracking-widest font-mono font-bold flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-amber-600" /> Super-App Unificado (Layers)
          </span>
          <h3 className="font-serif font-black text-[#423326] dark:text-slate-100 text-lg">Central de Atalhos Rápidos</h3>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 bg-amber-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-100 dark:border-slate-800 hidden sm:block font-mono">
          Modelado pós-Layers Hub
        </p>
      </div>

      {/* Bento Grid layout of Mini-Apps / Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Shortcut 1: Student Virtual ID */}
        <motion.button
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModal("card")}
          className="bg-gradient-to-br from-amber-500 to-amber-600 te-white text-white p-4.5 rounded-2xl flex flex-col justify-between text-left shadow-md hover:shadow-lg transition-all relative overflow-hidden h-36 cursor-pointer border border-amber-400"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-6 -mt-6" />
          <div className="flex justify-between items-start">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Fingerprint className="w-5 h-5 text-white" />
            </div>
            <span className="text-[8px] tracking-widest font-mono uppercase bg-amber-800/40 px-1.5 py-0.5 rounded text-amber-100">ATIVO</span>
          </div>
          <div className="space-y-1 z-10">
            <span className="text-[10px] text-amber-100 uppercase block font-medium leading-none">Carteirinha</span>
            <strong className="text-sm font-serif font-black block leading-tight">Digital Escolar</strong>
            <span className="text-[9px] text-amber-150 block truncate font-mono">Acesso rápido</span>
          </div>
        </motion.button>

        {/* Shortcut 2: Canteen Panel */}
        <motion.button
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModal("canteen")}
          className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between text-left shadow-xs hover:shadow-md transition-all relative overflow-hidden h-36 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="bg-[#fcfaf2] dark:bg-slate-950 p-2 rounded-xl border border-amber-100 dark:border-slate-800">
              <Coffee className="w-5 h-5 text-amber-700" />
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">R$ {canteenBalance.toFixed(2)}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block font-medium leading-none">Cantina Digital</span>
            <strong className="text-sm font-serif font-black text-[#423326] dark:text-slate-200 block leading-tight">Créditos & Nutrição</strong>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate">Bloqueios & Saldo</span>
          </div>
        </motion.button>

        {/* Shortcut 3: Timetable */}
        <motion.button
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModal("schedule")}
          className="bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between text-left shadow-xs hover:shadow-md transition-all relative overflow-hidden h-36 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="bg-[#fcfaf2] dark:bg-slate-950 p-2 rounded-xl border border-amber-100 dark:border-slate-800">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-[9px] font-mono bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/50 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-400 uppercase font-black">Ciclo 2026</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase block font-medium leading-none">Secretaria</span>
            <strong className="text-sm font-serif font-black text-[#423326] dark:text-slate-200 block leading-tight">Grelha de Horários</strong>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate">Cronograma Diário</span>
          </div>
        </motion.button>

        {/* Shortcut 4: Fast Navigation to Boletim */}
        <motion.button
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigateTab("academico")}
          className="bg-[#fdfaf3] dark:bg-slate-900 border border-amber-205/65 dark:border-slate-800 p-4.5 rounded-2xl flex flex-col justify-between text-left shadow-2xs hover:shadow-md transition-all relative overflow-hidden h-36 cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <div className="bg-amber-100/50 dark:bg-amber-950/30 p-2 rounded-xl">
              <GraduationCap className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
            <span className="text-[9px] font-mono bg-amber-200/40 dark:bg-amber-950/40 px-1.5 py-0.5 rounded text-amber-950 dark:text-amber-400 font-black">9.2 MEDIA</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-amber-800/80 uppercase block font-medium leading-none">Acadêmico</span>
            <strong className="text-sm font-serif font-black text-[#5c4033] dark:text-slate-200 block leading-tight">Boletim Pedagógico</strong>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 block truncate">Relatório de Notas</span>
          </div>
        </motion.button>
      </div>

      {/* MODALS RENDER WITH STUNNING ANIMATIONS */}
      <AnimatePresence>
        {/* 1. STUDENT DIGITAL CARD MODAL */}
        {activeModal === "card" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1c1917] text-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-stone-800 space-y-6 relative overflow-hidden"
            >
              {/* Abstract decorative shapes */}
              <div className="absolute top-0 right-0 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Carteira de Estudante Digital</span>
                </div>
                <button 
                  onClick={() => {
                    setActiveModal(null);
                    setIsFlipped(false);
                  }}
                  className="p-1 hover:bg-stone-800 rounded-full text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CARD CONTAINER WITH 3D FLIP */}
              <div className="perspective-1000 py-6 flex justify-center">
                <motion.div
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
                  className="w-[310px] h-[190px] relative cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                  onMouseMove={handleMouseMove}
                >
                  {/* FRONT SIDE */}
                  <div 
                    style={{ backfaceVisibility: "hidden" }}
                    className="absolute inset-0 bg-gradient-to-tr from-[#3b2d1e] via-[#5c442c] to-[#20150d] rounded-2xl border border-amber-400/40 p-4.5 flex flex-col justify-between shadow-xl overflow-hidden"
                  >
                    {/* Holographic light effect */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-[0.22]"
                      style={{
                        background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(251,191,36,0.85) 0%, transparent 60%)`
                      }}
                    />

                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-100">{schoolName.toUpperCase()}</span>
                      </div>
                      <span className="text-[8px] border border-amber-400 px-1.5 py-0.5 rounded text-amber-300 font-bold uppercase">Ciclo 2026</span>
                    </div>

                    <div className="flex items-center gap-3.5 pt-2">
                      <div className="w-14 h-14 rounded-xl border border-amber-400/30 overflow-hidden bg-stone-900 shadow-inner flex-shrink-0">
                        <img 
                          src={activeStudent.avatar} 
                          alt="Student photo" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover scale-110" 
                        />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-serif text-sm font-black text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[190px]">{activeStudent.name}</h4>
                        <p className="text-[9px] text-amber-200/80 font-mono italic max-w-[190px] truncate">{activeStudent.grade}</p>
                        <p className="text-[8px] font-mono text-stone-400">NASC: 14/11/2016 • RA: OZ-{activeStudent.id.toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/10 pt-2 text-[8px] font-mono text-stone-400">
                      <span>INTEGRAÇÃO UNIFICADA ATIVA</span>
                      <span className="text-amber-300 font-bold">SACADO / RESPONSÁVEL</span>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div 
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    className="absolute inset-0 bg-gradient-to-tr from-stone-900 to-stone-800 rounded-2xl border border-stone-800 p-4.5 flex flex-col justify-between shadow-xl"
                  >
                    {/* Magnetic black stripe */}
                    <div className="bg-stone-950 h-7 -mx-4.5 mt-1 border-y border-stone-900" />

                    <div className="flex items-center justify-between gap-2.5 px-1 pb-2">
                      <div className="space-y-1">
                        <span className="text-[7px] text-stone-500 font-mono block">INSTITUIÇÃO EMISSORA OFICIAL DO PORTAL</span>
                        <p className="text-[8px] text-stone-300 leading-normal font-sans">
                          Documento de identificação escolar provido digitalmente por canal de Responsáveis e integrado à catraca eletrônica da escola.
                        </p>
                      </div>
                      <div className="bg-white p-1 rounded-md shrink-0 border border-stone-750">
                        <QrCode className="w-12 h-12 text-black" />
                      </div>
                    </div>

                    <div className="text-[7px] text-center text-stone-500 font-mono">
                      Em caso de perdas ou re-emissão, atualize na secretaria. ID {activeStudent.id}
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="text-center space-y-1 bg-stone-900/45 p-3 rounded-2xl border border-stone-850">
                <p className="text-xs text-stone-300">
                  💡 <strong>Toque na carteirinha</strong> para virar e visualizar o QR Code para liberação direta de catraca e eventos escolares.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setIsFlipped(false);
                  }}
                  className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs py-2.5 rounded-xl transition-all"
                >
                  Fechar Carteirinha
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. CANTEEN NUTRI-PANEL MODAL */}
        {activeModal === "canteen" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 text-[#423326] dark:text-slate-100 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-amber-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto transition-colors duration-300"
            >
              <div className="flex justify-between items-center border-b border-amber-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-700" />
                  <span className="font-serif font-black text-sm text-[#423326] dark:text-slate-100">Cantina Nutricional Escolar</span>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-full text-stone-400 dark:text-stone-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Balance Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-amber-700 to-amber-800 text-white p-4 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-amber-150 uppercase tracking-widest block font-bold">Saldo pré-pago disponível</span>
                    <strong className="text-2xl font-mono block">R$ {canteenBalance.toFixed(2)}</strong>
                  </div>
                  <p className="text-[10px] text-amber-100 leading-normal">
                    Este saldo é gasto em lanches monitorados ou lancheiras planejadas. Os débitos caem em tempo real.
                  </p>
                </div>

                <div className="bg-amber-50/50 dark:bg-slate-950 p-4 rounded-2xl border border-amber-100 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Simular Recarga Rápida (PIX ERP):</span>
                    <p className="text-[11px] text-[#423326]/80 dark:text-slate-300 leading-relaxed pt-1">Adicione saldo ao cartão de consumo escolar instantaneamente.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-2">
                    {[20, 50, 100].map((val) => (
                      <button
                        key={val}
                        disabled={addingValue !== null}
                        onClick={() => handleAddBalance(val)}
                        className="bg-white dark:bg-slate-950 hover:bg-amber-100 dark:hover:bg-slate-900 border border-amber-200 dark:border-slate-800 text-[#423326] dark:text-slate-200 font-bold text-xs py-1.5 rounded-lg transition-all shadow-2xs cursor-pointer text-center"
                      >
                        {addingValue === val ? "Carregando..." : `+ R$ ${val}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Notification success alert */}
              {successAdd && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-850 dark:text-emerald-400 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Crédito adicionado e faturado via API com sucesso! Saldo atualizado.</span>
                </motion.div>
              )}

              {/* Dietary controls & Forbidden item toggle */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-[#423326] dark:text-slate-100 uppercase">Controles Alimentares e Bloqueios</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Gerencie a nutrição do seu filho. Itens bloqueados abaixo **não** serão vendidos pela cantina, emitindo um alerta no terminal de POS da escola.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {snacksList.map((snack) => {
                    const isBlocked = blockedItems.includes(snack.name);
                    return (
                      <div 
                        key={snack.name}
                        onClick={() => toggleBlockSnack(snack.name)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isBlocked 
                            ? "bg-rose-50 dark:bg-rose-950/20 border-rose-250 dark:border-rose-900/60 text-rose-900 dark:text-rose-400" 
                            : "bg-[#fcfaf1] dark:bg-slate-950 border-amber-100 dark:border-slate-800 text-[#423326] dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-900"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold leading-tight">{snack.name}</p>
                          <span className="text-[9px] uppercase font-mono text-slate-400 dark:text-slate-500">{snack.cat}</span>
                        </div>
                        <div>
                          {isBlocked ? (
                            <div className="flex items-center gap-0.5 bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                              <Lock className="w-3 h-3 shrink-0" /> Bloqueado
                            </div>
                          ) : (
                            <div className="flex items-center gap-0.5 bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                              <Unlock className="w-3 h-3 shrink-0" /> Liberado
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-[#fdf8ee] dark:bg-slate-950 text-[#423326] dark:text-slate-200 border border-amber-200 dark:border-slate-800 hover:bg-amber-100 dark:hover:bg-slate-900 font-bold text-xs py-2.5 rounded-xl transition-all block text-center"
                >
                  Salvar Diretrizes e Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. SCHOOL TIMETABLE / GRELHA ACADEMICA MODAL */}
        {activeModal === "schedule" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 text-[#423326] dark:text-slate-100 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-indigo-200 dark:border-indigo-950 space-y-5 max-h-[90vh] overflow-y-auto transition-colors duration-300"
            >
              <div className="flex justify-between items-center border-b border-indigo-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-700 animate-bounce" />
                  <span className="font-serif font-black text-sm text-indigo-950 dark:text-indigo-400">Cronograma de Aulas e Grade Completa</span>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full text-stone-400 dark:text-stone-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 bg-indigo-50/50 dark:bg-slate-950 p-3.5 rounded-2xl border border-indigo-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-indigo-850 dark:text-indigo-400 font-mono block">Turma Recomendada:</span>
                <p className="text-xs text-[#423326] dark:text-slate-300 leading-relaxed">
                  Estudante matriculado em <strong>{activeStudent.name}</strong> - {activeStudent.grade}. Calendário de grade integrada com ERP.
                </p>
              </div>

              {/* Day grids scheduling */}
              <div className="space-y-3">
                {[
                  { day: "Segunda-feira", code: "SEG", subjects: ["Matemática Computacional", "História Geral", "Artes integradas"] },
                  { day: "Terça-feira", code: "TER", subjects: ["Gramática Aplicada", "Física Curricular", "Ensino Científico"] },
                  { day: "Quarta-feira", code: "QUA", subjects: ["Ed. Física Prática", "Ciências Avançadas", "História e Robótica"] },
                  { day: "Quinta-feira", code: "QUI", subjects: ["Geografia Geopolítica", "Inglês Fluído", "Matemática Financeira"] },
                  { day: "Sexta-feira", code: "SEX", subjects: ["Redação Literária", "Filosofia Moderna", "Oficina Maker & Projetos"] }
                ].map((d) => (
                  <div key={d.day} className="flex border-b border-indigo-50 dark:border-slate-800 pb-2.5 last:border-0 last:pb-0 items-start gap-4">
                    <div className="bg-indigo-600 text-white font-mono font-black text-xs w-11 h-11 rounded-1.5xl flex items-center justify-center shrink-0 shadow-sm">
                      {d.code}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h5 className="text-xs font-bold text-indigo-950 dark:text-indigo-400 leading-none">{d.day}</h5>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {d.subjects.map((sub, idx) => (
                          <span key={idx} className="bg-[#f5f7fc] dark:bg-slate-950 border border-indigo-100/45 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-md">
                            {idx + 1}º Horário: {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-xs py-2.5 rounded-xl transition-all block text-center"
                >
                  Voltar ao Portal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
