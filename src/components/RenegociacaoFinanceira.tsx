import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Check, 
  Handshake, 
  FileText, 
  ArrowRight, 
  Calendar, 
  TrendingUp, 
  BadgePercent, 
  Signature, 
  Database,
  Printer,
  ChevronRight,
  Sparkles,
  Info,
  ArrowLeft
} from "lucide-react";
import { Cobranca } from "../types";

interface RenegociacaoFinanceiraProps {
  cobrancas: Cobranca[];
  erpName: string;
  onNegotiationCompleted: (acordoCobIds: string[], newInstallments: Cobranca[]) => void;
  onOpenFinancialTutorial?: () => void;
}

export default function RenegociacaoFinanceira({ cobrancas, erpName, onNegotiationCompleted, onOpenFinancialTutorial }: RenegociacaoFinanceiraProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Overdue/unpaid charges list
  const outstandingList = cobrancas.filter(c => c.status === "vencido" || c.status === "pendente");

  // Selected charges IDs for agreement
  const [selectedCobIds, setSelectedCobIds] = useState<string[]>(
    outstandingList.map(c => c.id) // pre-select all overdue by default
  );

  // Installments selected (default is 2 installments)
  const [installmentsCount, setInstallmentsCount] = useState<number>(2);

  const [responsibleName, setResponsibleName] = useState("");
  const [responsibleCpf, setResponsibleCpf] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPrintableTerm, setShowPrintableTerm] = useState(false);

  if (outstandingList.length === 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-250 dark:border-emerald-900/60 p-4.5 rounded-2xl text-[#1a3d24] dark:text-emerald-400 flex items-center gap-3.5">
        <Check className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="space-y-0.5">
          <strong className="text-xs font-serif font-black block">Nenhuma pendência financeira em aberto!</strong>
          <span className="text-[11px] text-emerald-800 dark:text-emerald-500 font-light font-sans">
            Seu cadastro no ERP escolar <strong>{erpName.toUpperCase()}</strong> está 100% regularizado e adimplente.
          </span>
        </div>
      </div>
    );
  }

  // Mathematics: Sum of absolute values
  const totalOriginal = outstandingList
    .filter(c => selectedCobIds.includes(c.id))
    .reduce((sum, c) => sum + c.amount, 0);

  // Penalties simulated: 2% generic delay penalty + 1% interest per month
  const multaAtraso = totalOriginal > 0 ? totalOriginal * 0.02 : 0;
  const jurosMora = totalOriginal > 0 ? totalOriginal * 0.015 : 0;
  const totalAgreemnt = totalOriginal + multaAtraso + jurosMora;

  // Installment dynamic calculation
  const installmentValue = totalAgreemnt > 0 ? totalAgreemnt / installmentsCount : 0;

  const handleToggleSelect = (id: string) => {
    if (selectedCobIds.includes(id)) {
      setSelectedCobIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedCobIds(prev => [...prev, id]);
    }
  };

  const handleApplyAgreement = () => {
    if (!responsibleName || !responsibleCpf || !termsAccepted) return;
    setSubmitting(true);

    setTimeout(() => {
      // Create new dynamic billing items
      const newItems: Cobranca[] = [];
      const now = new Date();

      for (let i = 1; i <= installmentsCount; i++) {
        const dueDate = new Date();
        dueDate.setDate(now.getDate() + (30 * i)); // each installment spaced 30 days
        const dateStr = dueDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });

        newItems.push({
          id: `acordo-${Date.now()}-${i}`,
          title: `Acordo Fin. ${i}/${installmentsCount} • Ref: Dívida Renegociada`,
          dueDate: dateStr,
          timestamp: dueDate.getTime(),
          amount: installmentValue,
          status: "pendente",
          documentId: `AC-${String(Math.floor(10000 + Math.random() * 90000))}-${i}`,
          category: "Acordo Extrajudicial",
          tags: ["acordo", "financiamento", `parcela-${i}`]
        });
      }

      onNegotiationCompleted(selectedCobIds, newItems);
      setSubmitting(false);
      setStep(1);
      setIsOpen(false);
    }, 1500);
  };

  const currentErpDisplayName = 
    erpName === "asaas" ? "ASAAS Core" : 
    erpName === "totvs" ? "TOTVS Educacional" : 
    erpName === "sap" ? "SAP Campus" : "iugu Recorrência Escolar";

  return (
    <div className="space-y-4">
      <div className="bg-[#fcfbf7] dark:bg-slate-900 border border-amber-305/70 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 relative overflow-hidden transition-colors duration-300">
        {/* Background abstract decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-400 font-bold text-xs uppercase font-mono tracking-wider">
              <Handshake className="w-4 h-4 text-amber-700 animate-pulse" />
              <span>Canal de Renegociação de Débitos Síncronos</span>
            </div>
            <h4 className="font-serif font-black text-sm text-[#423326] dark:text-slate-100">
              Ajuste de Financiamento & Quitação Online
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xl">
              Evite multas acumulativas e juros bancários. Refabrique suas mensalidades vencidas diretamente pelo portal de forma homologada via API com o <strong>{currentErpDisplayName}</strong> da escola.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenFinancialTutorial && (
              <button
                type="button"
                onClick={onOpenFinancialTutorial}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-400 hover:underline px-2 py-1 cursor-pointer"
                title="Ver tutorial de cálculo de descontos e parcelamento"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Como funciona o cálculo?</span>
              </button>
            )}

            <button
              onClick={() => setIsOpen(true)}
              className="bg-amber-750 hover:bg-amber-850 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Renegociar Pendências</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-amber-250 dark:border-slate-800 text-[#423326] dark:text-slate-100 flex flex-col max-h-[92vh] transition-colors duration-300"
            >
              {/* HEADER */}
              <div className="bg-[#fdfbf6] dark:bg-slate-950 border-b border-amber-100 dark:border-slate-800 p-4.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-amber-800 dark:text-amber-500" />
                  <div>
                    <span className="font-serif font-black text-sm block text-amber-950 dark:text-slate-100">Ajuste de Conta Extrajudicial</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">Gateway ERP: {currentErpDisplayName}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setStep(1);
                  }}
                  className="p-1 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* FLOATING CHROME WIZARD PROGRESS BAR */}
              <div className="bg-amber-50/45 dark:bg-slate-900 px-6 py-2 border-b border-amber-100/50 dark:border-slate-800 flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                <span className={step === 1 ? "text-amber-850 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400 font-extrabold"}>1. Seleção</span>
                <span className="text-slate-300 dark:text-slate-600">➔</span>
                <span className={step === 2 ? "text-amber-850 dark:text-amber-400" : step === 3 ? "text-emerald-700 dark:text-emerald-400 font-extrabold" : "text-slate-400 dark:text-slate-600"}>2. Parcelamento</span>
                <span className="text-slate-300 dark:text-slate-600">➔</span>
                <span className={step === 3 ? "text-amber-850 dark:text-amber-400" : "text-slate-400 dark:text-slate-600"}>3. Assinatura</span>
              </div>

              {/* MODAL WRAPPERS BODY */}
              <div className="p-6 overflow-y-auto flex-1 space-y-5">
                {/* STEP 1: SELECT CHARGES */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passo 1: Selecionar faturas para o acordo</h4>
                      <p className="text-[11px] text-slate-400">Escolha quais débitos pendentes deseja unificar e recalcular.</p>
                    </div>

                    <div className="space-y-2">
                      {outstandingList.map((cob) => {
                        const isSelected = selectedCobIds.includes(cob.id);
                        return (
                          <div
                            key={cob.id}
                            onClick={() => handleToggleSelect(cob.id)}
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-amber-50/50 dark:bg-slate-800/50 border-amber-400 dark:border-amber-500 font-bold"
                                : "bg-white dark:bg-slate-950 border-amber-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-amber-50/20 dark:hover:bg-slate-900"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isSelected ? "bg-amber-700 border-amber-700 text-white" : "border-amber-300 dark:border-slate-700"
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-xs text-[#423326] dark:text-slate-100 block leading-tight">{cob.title}</span>
                                <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500">Ref: {cob.documentId} • Vencimento original: {cob.dueDate}</span>
                              </div>
                            </div>
                            <span className="font-mono text-xs text-amber-950 dark:text-amber-400 font-bold">
                              R$ {cob.amount.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {selectedCobIds.length === 0 && (
                      <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg font-bold text-center">
                        ⚠️ Você precisa selecionar no mínimo 1 (uma) fatura para renegociar.
                      </div>
                    )}

                    <div className="bg-[#fdfaf1] dark:bg-slate-950 p-3 rounded-xl border border-amber-100 dark:border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-[#423326] dark:text-slate-300">Faturas selecionadas ({selectedCobIds.length}):</span>
                      <strong className="font-mono font-black text-amber-950 dark:text-amber-400 text-sm">R$ {totalOriginal.toFixed(2)}</strong>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => selectedCobIds.length > 0 && setStep(2)}
                        disabled={selectedCobIds.length === 0}
                        className="w-full bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-40 font-bold text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Próximo Passo: Simular Planos</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: PLAN SIMULATION AND AMORTIZATION */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passo 2: Financiamento e Parcelamento</h4>
                      <p className="text-[11px] text-slate-400">Opções regulamentadas conforme políticas internas e taxas do ERP escolar.</p>
                    </div>

                    {/* Breakdown Calculation display */}
                    <div className="bg-[#fbf9f4] dark:bg-slate-950 rounded-2xl border border-amber-200/60 dark:border-slate-800 p-4 space-y-3">
                      <div className="flex justify-between text-xs border-b border-amber-100/50 dark:border-slate-800 pb-2 text-slate-600 dark:text-slate-300">
                        <span>Soma original das dívidas:</span>
                        <span className="font-mono font-semibold">R$ {totalOriginal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-amber-100/50 dark:border-slate-800 pb-2 text-slate-600 dark:text-slate-300 items-center">
                        <span className="flex items-center gap-1.5">
                          <BadgePercent className="w-4 h-4 text-amber-600" />
                          <span>Multa de mora consolidada (2.0%):</span>
                        </span>
                        <span className="font-mono text-amber-800 dark:text-amber-400 font-semibold">+ R$ {multaAtraso.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-amber-100/50 dark:border-slate-800 pb-2 text-slate-600 dark:text-slate-300 items-center">
                        <span className="flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span>Amortização compensatória (1.5% ao mês):</span>
                        </span>
                        <span className="font-mono text-amber-800 dark:text-amber-400 font-semibold">+ R$ {jurosMora.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1.5 items-center">
                        <span className="font-serif font-bold text-sm text-[#423326] dark:text-slate-200">Montante de Acordo:</span>
                        <span className="font-mono font-black text-amber-900 dark:text-amber-400 text-base">R$ {totalAgreemnt.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Installments count selector slider */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Parcelar valor acordado em:</label>
                      <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((num) => (
                          <button
                            key={num}
                            onClick={() => setInstallmentsCount(num)}
                            className={`py-3.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                              installmentsCount === num
                                ? "bg-amber-700 border-amber-700 text-white shadow-sm"
                                : "bg-white dark:bg-slate-950 border-amber-150 dark:border-slate-800 text-[#423326] dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-900"
                            }`}
                          >
                            <span className="block text-sm">{num}x</span>
                            <span className="block text-[8px] opacity-75 font-mono">
                              R$ {(totalAgreemnt / num).toFixed(2)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Simulated payments schedule details */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Cronograma das Parcelas do Acordo:</span>
                      <div className="space-y-1.5 bg-amber-50/20 dark:bg-slate-950/45 p-3 rounded-xl border border-amber-100 dark:border-slate-800">
                        {Array.from({ length: installmentsCount }).map((_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() + (30 * (i + 1)));
                          return (
                            <div key={i} className="flex justify-between items-center text-xs pb-1 last:pb-0 font-sans">
                              <span className="text-slate-500 dark:text-slate-400">Parcela {i + 1}/{installmentsCount} (Venc. {date.toLocaleDateString("pt-BR")}):</span>
                              <strong className="font-mono text-slate-800 dark:text-slate-200 font-bold">R$ {installmentValue.toFixed(2)}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions footer buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="bg-white dark:bg-slate-950 hover:bg-amber-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 border border-amber-250 dark:border-slate-800 py-2.5 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar Faturas</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="bg-amber-700 hover:bg-amber-800 text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer text-center shadow-md flex items-center justify-center gap-1"
                      >
                        <span>Próximo Passo</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: DIGITAL SIGNATURE & TERM VALIDATION */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passo 3: Chancelamento & Termo Digital</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Assinatura eletrônica com arquivamento direto no banco de dados da escola.</p>
                    </div>

                    {/* Legal text block terms of agreement */}
                    <div className="bg-[#fdfcf6] dark:bg-slate-950 p-3.5 rounded-xl border border-amber-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans scrollbar-thin max-h-36 overflow-y-auto space-y-2">
                      <p className="font-bold uppercase text-[#423326] dark:text-slate-100">INSTRUMENTO PARTICULAR DE ACORDO DE DÍVIDA E CONFISSÃO DE DÉBITO</p>
                      <p>
                        Pelo presente instrumento, o Responsável Legal concorda expressamente em compensar a quantia inadimplente consolidada no valor de <strong>R$ {totalOriginal.toFixed(2)}</strong> acrescida de multas estatutárias vigentes no total de <strong>R$ {(multaAtraso + jurosMora).toFixed(2)}</strong>.
                      </p>
                      <p>
                        O pagamento integral far-se-á em <strong>{installmentsCount} parcela(s) com vencimento direto a cada 30 dias</strong> de valor individual igual a <strong>R$ {installmentValue.toFixed(2)}</strong>. O inadimplemento de qualquer destas parcelas ocasionará o cancelamento automático deste acordo com reintegração integral dos débitos vencidos anteriormente de forma síncrona.
                      </p>
                      <p>
                        Este ato é integrado via API Webhook diretamente no banco de dados e registros financeiros do sistema {currentErpDisplayName} da instituição de ensino.
                      </p>
                    </div>

                    {/* Inputs form */}
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Nome do Responsável Legal:</label>
                        <input
                           type="text"
                           placeholder="Digite seu nome completo como consta no contrato"
                           className="w-full bg-white dark:bg-slate-950 border border-amber-150 dark:border-slate-800 rounded-xl p-2.5 text-xs text-[#423326] dark:text-slate-100 focus:outline-none placeholder-slate-300 dark:placeholder-slate-600"
                           value={responsibleName}
                           onChange={(e) => setResponsibleName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">CPF do Titular Sacado:</label>
                        <input
                           type="text"
                           placeholder="Ex: 000.000.000-00"
                           className="w-full bg-white dark:bg-slate-950 border border-amber-150 dark:border-slate-800 rounded-xl p-2.5 text-xs text-[#423326] dark:text-slate-100 focus:outline-none placeholder-slate-300 dark:placeholder-slate-600"
                           value={responsibleCpf}
                           onChange={(e) => setResponsibleCpf(e.target.value)}
                        />
                      </div>

                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          type="checkbox"
                          id="agree-terms"
                          className="mt-0.5 rounded border-amber-300 accent-amber-500 cursor-pointer"
                          checked={termsAccepted}
                          onChange={(e) => setTermsAccepted(e.target.checked)}
                        />
                        <label htmlFor="agree-terms" className="text-[10.5px] leading-snug text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                          Li e concordo integralmente com os termos do Acordo de Confissão de Dívida e autorizo o fracionamento e emissão dos novos boletos e pix pelo {currentErpDisplayName}.
                        </label>
                      </div>
                    </div>

                    {/* Trigger apply agreement */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setStep(2)}
                        className="bg-white dark:bg-slate-950 hover:bg-amber-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 border border-amber-250 dark:border-slate-800 py-2.5 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar à Simulação</span>
                      </button>

                      <button
                        type="button"
                        disabled={!responsibleName || !responsibleCpf || !termsAccepted || submitting}
                        onClick={handleApplyAgreement}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45 text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer text-center shadow-md flex items-center justify-center gap-1.5"
                      >
                        {submitting ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processando...</span>
                          </>
                        ) : (
                          <>
                            <Signature className="w-4 h-4 text-emerald-100" />
                            <span>Assinar & Ativar Acordo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
