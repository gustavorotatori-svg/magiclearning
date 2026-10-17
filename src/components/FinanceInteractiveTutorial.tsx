import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  DollarSign, 
  BadgePercent, 
  Handshake, 
  Bell, 
  Check, 
  Copy, 
  Calendar, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Smartphone, 
  Mail, 
  SlidersHorizontal, 
  Printer, 
  Receipt, 
  ShieldCheck, 
  AlertCircle,
  Clock,
  ExternalLink,
  MessageSquare
} from "lucide-react";

export type FinanceTutorialStep = "boletos" | "renegociacao" | "alertas_erp";

interface FinanceInteractiveTutorialProps {
  onNavigateToTab?: (tabName: string) => void;
  onCloseParentModal?: () => void;
  userRole?: "pais" | "escola" | "aluno" | "landing";
}

export function FinanceInteractiveTutorial({
  onNavigateToTab,
  onCloseParentModal,
  userRole = "pais"
}: FinanceInteractiveTutorialProps) {
  const [activeStep, setActiveStep] = useState<FinanceTutorialStep>("boletos");
  const [completedSteps, setCompletedSteps] = useState<Record<FinanceTutorialStep, boolean>>({
    boletos: false,
    renegociacao: false,
    alertas_erp: false
  });

  // --- STAGE 1: BOLETOS STATE ---
  const [selectedBoletoType, setSelectedBoletoType] = useState<"mensalidade" | "material" | "extracurricular">("mensalidade");
  const [includeEarlyDiscount, setIncludeEarlyDiscount] = useState<boolean>(true);
  const [copiedBarcode, setCopiedBarcode] = useState<boolean>(false);
  const [boletoSimulatedStatus, setBoletoSimulatedStatus] = useState<"emitido" | "liquidado">("emitido");
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // --- STAGE 2: RENEGOTIATION STATE ---
  const [selectedDebts, setSelectedDebts] = useState<string[]>(["deb-nov-2025", "deb-dez-2025"]);
  const [installments, setInstallments] = useState<number>(3);
  const [couponCode, setCouponCode] = useState<string>("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discountPct: number } | null>(null);
  const [couponError, setCouponError] = useState<string>("");
  const [responsibleCpf, setResponsibleCpf] = useState<string>("123.456.789-00");
  const [agreementAgreed, setAgreementAgreed] = useState<boolean>(false);
  const [negotiationSuccess, setNegotiationSuccess] = useState<boolean>(false);

  // --- STAGE 3: ERP ALERTS STATE ---
  const [alertDaysBefore, setAlertDaysBefore] = useState<number>(3);
  const [channels, setChannels] = useState<{ whatsapp: boolean; push: boolean; email: boolean; sms: boolean }>({
    whatsapp: true,
    push: true,
    email: true,
    sms: false
  });
  const [alertTemplate, setAlertTemplate] = useState<"amigavel" | "vencimento_hoje" | "tolerancia">("amigavel");
  const [alertTriggered, setAlertTriggered] = useState<boolean>(false);
  const [alertToast, setAlertToast] = useState<string | null>(null);

  // --- BOLETO CALCULATION ---
  const boletoData = useMemo(() => {
    switch (selectedBoletoType) {
      case "material":
        return {
          title: "Taxa Anual de Material Didático & Bilíngue 2026",
          baseAmount: 920.0,
          discountAmount: 46.0,
          dueDay: "15/04/2026",
          docNum: "DOC-2026-MAT-049",
          barcodeRaw: "00190000090123456789012345678901198760000092000",
          digitableLine: "00190.00009 01234.567890 12345.678901 1 98760000092000"
        };
      case "extracurricular":
        return {
          title: "Robótica & Oficina Maker — Mensalidade Abril/2026",
          baseAmount: 380.0,
          discountAmount: 20.0,
          dueDay: "10/04/2026",
          docNum: "DOC-2026-ROB-112",
          barcodeRaw: "00190000090123456789012345678901198760000038000",
          digitableLine: "00190.00009 01234.567890 12345.678901 1 98760000038000"
        };
      case "mensalidade":
      default:
        return {
          title: "Mensalidade Escolar Regular — Ensino Fundamental I",
          baseAmount: 1850.0,
          discountAmount: 92.5,
          dueDay: "10/04/2026",
          docNum: "DOC-2026-MENS-003",
          barcodeRaw: "00190000090123456789012345678901198760000185000",
          digitableLine: "00190.00009 01234.567890 12345.678901 1 98760000185000"
        };
    }
  }, [selectedBoletoType]);

  const finalBoletoAmount = includeEarlyDiscount 
    ? boletoData.baseAmount - boletoData.discountAmount 
    : boletoData.baseAmount;

  const handleCopyBarcode = () => {
    navigator.clipboard.writeText(boletoData.digitableLine);
    setCopiedBarcode(true);
    setCompletedSteps(prev => ({ ...prev, boletos: true }));
    setTimeout(() => setCopiedBarcode(false), 2500);
  };

  const handleSimulatePayment = () => {
    setBoletoSimulatedStatus("liquidado");
    setCompletedSteps(prev => ({ ...prev, boletos: true }));
  };

  // --- RENEGOTIATION CALCULATION ---
  const DEBT_ITEMS = [
    { id: "deb-nov-2025", title: "Mensalidade Novembro/2025", originalAmount: 1750.0, daysLate: 120 },
    { id: "deb-dez-2025", title: "Mensalidade Dezembro/2025", originalAmount: 1750.0, daysLate: 90 },
    { id: "deb-remat-2026", title: "Taxa de Renovação Contratual 2026", originalAmount: 450.0, daysLate: 45 }
  ];

  const selectedDebtObjects = DEBT_ITEMS.filter(d => selectedDebts.includes(d.id));
  const totalPrincipal = selectedDebtObjects.reduce((acc, d) => acc + d.originalAmount, 0);
  
  // Multa de 2% + Juros de 1.5% ao mês proporcionais
  const calculatedFine = totalPrincipal > 0 ? totalPrincipal * 0.02 : 0;
  const calculatedInterest = totalPrincipal > 0 ? totalPrincipal * 0.045 : 0;
  const grossTotal = totalPrincipal + calculatedFine + calculatedInterest;

  // Desconto de renegociação: 100% de isenção de multa e juros se à vista, ou 50% se parcelado
  const waiverPercent = installments === 1 ? 1.0 : 0.5;
  const feeDiscount = (calculatedFine + calculatedInterest) * waiverPercent;
  
  // Cupom de diretoria
  const couponDiscount = couponApplied ? totalPrincipal * (couponApplied.discountPct / 100) : 0;
  const totalDiscounts = feeDiscount + couponDiscount;
  const netTotal = Math.max(0, grossTotal - totalDiscounts);
  const installmentValue = installments > 0 ? netTotal / installments : netTotal;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const clean = couponCode.trim().toUpperCase();
    if (clean === "DIRETORIA10") {
      setCouponApplied({ code: "DIRETORIA10", discountPct: 10 });
    } else if (clean === "DIRETORIA15" || clean === "PONTUAL2026") {
      setCouponApplied({ code: clean, discountPct: 15 });
    } else {
      setCouponError("Cupom não reconhecido. Experimente 'DIRETORIA10' ou 'PONTUAL2026'.");
    }
  };

  const handleToggleDebt = (id: string) => {
    setSelectedDebts(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExecuteAgreement = () => {
    if (!agreementAgreed) return;
    setNegotiationSuccess(true);
    setCompletedSteps(prev => ({ ...prev, renegociacao: true }));
  };

  // --- ERP ALERTS CALCULATION ---
  const handleTriggerSimulatedAlert = () => {
    setAlertTriggered(true);
    setAlertToast("📲 Notificação de teste enviada com sucesso para WhatsApp e Push do responsável!");
    setCompletedSteps(prev => ({ ...prev, alertas_erp: true }));
    setTimeout(() => {
      setAlertToast(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header with Purpose */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-mono text-[11px] uppercase tracking-wider font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Manual Prático de Gestão Financeira Escolar</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
              Fluxo Financeiro: Boletos, Descontos & Régua ERP
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
              Aprenda de ponta a ponta como funciona a emissão de títulos registrados, a aplicação de descontos por pontualidade e renegociação de mensalidades, e como configurar a régua automatizada de avisos do ERP escolar.
            </p>
          </div>

          {/* Quick Real Navigation */}
          {onNavigateToTab && (
            <button
              onClick={() => {
                if (onCloseParentModal) onCloseParentModal();
                onNavigateToTab("cobrancas");
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-center"
              title="Ir para o Extrato Financeiro Real do Aluno"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Ver Minhas Cobranças Reais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Step Navigation Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5">
          {[
            {
              id: "boletos" as FinanceTutorialStep,
              title: "1. Boletos Bancários & Linha Digitável",
              desc: "Emissão FEBRABAN e Desconto Pontualidade",
              icon: FileText
            },
            {
              id: "renegociacao" as FinanceTutorialStep,
              title: "2. Renegociação & Abatimentos",
              desc: "Isenção de multas, juros e parcelamento",
              icon: Handshake
            },
            {
              id: "alertas_erp" as FinanceTutorialStep,
              title: "3. Régua de Alertas do ERP",
              desc: "Avisos D-5, WhatsApp, Push e tolerância",
              icon: Bell
            }
          ].map((step) => {
            const isActive = activeStep === step.id;
            const isDone = completedSteps[step.id];
            const StepIcon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isActive
                    ? "bg-amber-50/70 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600/80 shadow-xs"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  isActive 
                    ? "bg-amber-800 text-white" 
                    : isDone 
                    ? "bg-emerald-600 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                }`}>
                  {isDone ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold truncate ${isActive ? "text-amber-950 dark:text-amber-200" : "text-slate-850 dark:text-slate-200"}`}>
                      {step.title}
                    </span>
                    {isDone && (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        ✓ Testado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {step.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          STEP 1: BOLETOS & LINHA DIGITÁVEL
          ======================================================== */}
      {activeStep === "boletos" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Conceptual & Technical Explanation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1 space-y-4">
              <div className="p-4 rounded-2xl bg-[#faf8f5] dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono text-amber-900 dark:text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Como funciona a emissão</span>
                </div>
                <h4 className="font-serif font-black text-sm text-slate-900 dark:text-white">
                  Registro Bancário & Validação CIP
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                  Todos os boletos emitidos pela aplicação são registrados instantaneamente na Câmara Interbancária de Pagamentos (CIP) através da API do ERP (TOTVS ou Asaas).
                </p>
                
                <div className="pt-2 border-t border-amber-200/60 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-amber-800 dark:text-amber-400 font-bold">•</span>
                    <span><strong>Desconto de Pontualidade:</strong> Deduzido automaticamente até o dia limite estipulado no calendário escolar.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-amber-800 dark:text-amber-400 font-bold">•</span>
                    <span><strong>Prazo de Liquidação:</strong> Boletos compensam em 24h a 48h úteis. Caso precise de baixa instantânea, utilize a chave Pix copiada no mesmo documento.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-amber-800 dark:text-amber-400 font-bold">•</span>
                    <span><strong>Sem Segunda Via Manual:</strong> O boleto vencido pode ser pago no mesmo código em até 30 dias com cálculo automático de juros pelo banco recebedor.</span>
                  </div>
                </div>
              </div>

              {/* Selector Controls */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase font-mono text-slate-400 block">
                  Simular Tipo de Título
                </span>
                <div className="flex flex-col gap-1.5">
                  {[
                    { id: "mensalidade", label: "Mensalidade Regular", val: "R$ 1.850,00" },
                    { id: "material", label: "Material & Livros", val: "R$ 920,00" },
                    { id: "extracurricular", label: "Curso Extracurricular", val: "R$ 380,00" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedBoletoType(item.id as any);
                        setBoletoSimulatedStatus("emitido");
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border ${
                        selectedBoletoType === item.id
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-750 hover:bg-slate-100"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-[11px]">{item.val}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeEarlyDiscount}
                      onChange={(e) => setIncludeEarlyDiscount(e.target.checked)}
                      className="rounded border-slate-300 text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Simular pagamento até a data limite (Aplica desconto de 5%)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Interactive Ficha de Compensação FEBRABAN */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 font-sans">
                {/* Header of the slip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-amber-800 text-white font-mono font-black text-sm rounded-lg tracking-wider">
                      001-9
                    </div>
                    <div>
                      <h5 className="font-serif font-black text-slate-900 dark:text-white text-base">
                        Banco Integrado ERP • Secretaria Escolar
                      </h5>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Convênio Escolar: 349182 • Carteira 17/019
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-full ${
                      boletoSimulatedStatus === "liquidado"
                        ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300"
                        : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300"
                    }`}>
                      {boletoSimulatedStatus === "liquidado" ? "Liquidado no ERP ✓" : "Registrado na CIP"}
                    </span>
                  </div>
                </div>

                {/* Digitable line box with copy button */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                      Linha Digitável FEBRABAN (47 Dígitos)
                    </span>
                    <button
                      onClick={handleCopyBarcode}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      {copiedBarcode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copiado para o clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Linha</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-black text-slate-850 dark:text-slate-100 tracking-wider break-all select-all">
                    {boletoData.digitableLine}
                  </div>
                </div>

                {/* Realistic Bill Fields Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Beneficiário</span>
                    <strong className="text-slate-800 dark:text-slate-200 block truncate font-sans">Instituição de Ensino LTDA</strong>
                    <span className="text-[10px] text-slate-400 font-mono">CNPJ: 12.345.678/0001-90</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Vencimento</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono text-xs block">{boletoData.dueDay}</strong>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Pontualidade até dia {boletoData.dueDay.split("/")[0]}</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Documento</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono text-xs block truncate">{boletoData.docNum}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">Espécie: DM / R$</span>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Valor a Cobrar</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono text-sm block">
                      R$ {finalBoletoAmount.toFixed(2).replace(".", ",")}
                    </strong>
                    {includeEarlyDiscount && (
                      <span className="text-[10px] text-slate-400 line-through font-mono">
                        R$ {boletoData.baseAmount.toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1 bg-[#fffdf9] dark:bg-slate-950/80">
                  <span className="font-mono text-[10px] uppercase font-bold text-amber-900 dark:text-amber-400 block">
                    Instruções de Responsabilidade do Beneficiário:
                  </span>
                  <p>• Pagável em qualquer agência bancária ou internet banking até o vencimento.</p>
                  <p>• {includeEarlyDiscount ? `Desconto de R$ ${boletoData.discountAmount.toFixed(2).replace(".", ",")} aplicado pela pontualidade contratual.` : "Após o vencimento cobrar multa de 2% e juros de mora de 1,5% ao mês."}</p>
                  <p>• Não receber após 30 dias de vencido. Aluno: Miguel Rotatori de Oliveira • Matrícula 2024-0012</p>
                </div>

                {/* Authentic FEBRABAN Barcode Visual Simulation */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Código de Barras Óptico FEBRABAN
                  </span>
                  <div className="h-14 w-full max-w-md bg-white p-2 rounded flex items-center justify-between border border-slate-200">
                    {/* Simulated barcode stripes with mathematical rhythm */}
                    {Array.from({ length: 58 }).map((_, idx) => {
                      const isWide = (idx % 3 === 0 || idx % 7 === 0);
                      const isExtraWide = (idx % 11 === 0);
                      return (
                        <div
                          key={idx}
                          className={`bg-slate-900 h-full ${
                            isExtraWide ? "w-1.5" : isWide ? "w-1" : "w-0.5"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Practical Interactive Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPrintModal(true)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Visualizar Impressão / PDF</span>
                    </button>
                    <button
                      onClick={handleCopyBarcode}
                      className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Código</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSimulatePayment}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      boletoSimulatedStatus === "liquidado"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300"
                        : "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{boletoSimulatedStatus === "liquidado" ? "Título Quitado no Simulador" : "Simular Pagamento no Internet Banking"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 2: RENEGOTIAÇÃO & ABATIMENTOS DE MULTAS/JUROS
          ======================================================== */}
      {activeStep === "renegociacao" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Context & Policy Information */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-4 rounded-2xl bg-[#faf8f5] dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono text-amber-900 dark:text-amber-300">
                  <Handshake className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Política de Conciliação</span>
                </div>
                <h4 className="font-serif font-black text-sm text-slate-900 dark:text-white">
                  Acordos Diretos & Descontos Negociais
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                  A escola oferece repactuação imediata pelo portal para evitar negativação em órgãos de proteção ao crédito (SPC/Serasa) e interrupção contratual.
                </p>

                <div className="pt-2 border-t border-amber-200/60 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">•</span>
                    <span><strong>Quitação à Vista:</strong> Isenção integral (100%) de multas e juros moratórios acumulados.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">•</span>
                    <span><strong>Parcelamento em até 6x:</strong> 50% de redução nas taxas de encargos moratórios e parcelas fixas no carnê.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">•</span>
                    <span><strong>Cupons da Diretoria:</strong> Casos com autorização prévia da coordenação podem aplicar descontos adicionais diretamente no painel.</span>
                  </div>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase font-mono text-slate-400 block">
                  Autorização / Cupom de Negociação
                </span>
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Ex: DIRETORIA10 ou PONTUAL2026"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponApplied && (
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                      <span>✓ Cupom {couponApplied.code} ativo ({couponApplied.discountPct}% off)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCouponApplied(null);
                          setCouponCode("");
                        }}
                        className="text-emerald-700 hover:underline text-[10px] font-bold"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      {couponError}
                    </p>
                  )}
                </form>
              </div>
            </div>

            {/* Interactive Calculator and Simulator */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <h5 className="font-serif font-black text-slate-900 dark:text-white text-base">
                      Simulador Dinâmico de Repactuação
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Selecione as mensalidades pendentes e ajuste a forma de pagamento desejada.
                    </p>
                  </div>
                </div>

                {/* Overdue Items List with Checkboxes */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Mensalidades Pendentes de Acordo
                  </span>
                  <div className="space-y-1.5">
                    {DEBT_ITEMS.map((item) => {
                      const isSelected = selectedDebts.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleDebt(item.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/80"
                              : "bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by parent div
                              className="rounded border-slate-300 text-amber-800 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <div>
                              <strong className="text-xs font-bold text-slate-850 dark:text-slate-100 block">
                                {item.title}
                              </strong>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Vencida há {item.daysLate} dias • Cobrança Judicial Suspensa
                              </span>
                            </div>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            R$ {item.originalAmount.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Installments Slider */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Plano de Parcelamento Escolhido:
                    </span>
                    <strong className="font-mono text-sm text-amber-800 dark:text-amber-400">
                      {installments === 1 ? "1x à Vista (Isenção Total de Multas)" : `${installments}x de R$ ${installmentValue.toFixed(2).replace(".", ",")} / mês`}
                    </strong>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={6}
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full accent-amber-800 dark:accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1x (À vista)</span>
                    <span>2x</span>
                    <span>3x</span>
                    <span>4x</span>
                    <span>5x</span>
                    <span>6x (Máximo)</span>
                  </div>
                </div>

                {/* Mathematical Summary Breakdown Table */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#fffdfa] dark:bg-slate-900/60 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Valor Principal Original:</span>
                    <span className="font-mono">R$ {totalPrincipal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Multa Acumulada (2%) + Juros de Mora (1.5% a.m.):</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400">+ R$ {(calculatedFine + calculatedInterest).toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400">
                    <span>Desconto Negocial Concedido ({installments === 1 ? "100%" : "50%"} de isenção de multas {couponApplied ? `+ ${couponApplied.discountPct}% cupom` : ""}):</span>
                    <span className="font-mono">- R$ {totalDiscounts.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-900 dark:text-white font-serif">Total Consolidado do Acordo:</span>
                    <strong className="text-base font-mono text-emerald-800 dark:text-emerald-300">
                      R$ {netTotal.toFixed(2).replace(".", ",")}
                    </strong>
                  </div>
                </div>

                {/* Terms Agreement & Signature */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="agreement-checkbox"
                      checked={agreementAgreed}
                      onChange={(e) => setAgreementAgreed(e.target.checked)}
                      className="rounded border-slate-300 text-amber-800 focus:ring-amber-500 w-4 h-4 cursor-pointer shrink-0"
                    />
                    <label htmlFor="agreement-checkbox" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      Li e concordo com o <strong>Termo de Confissão de Dívida e Repactuação Extrajudicial</strong> perante a instituição de ensino e autorizo a emissão das novas parcelas no ERP.
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">CPF do Titular:</span>
                      <input
                        type="text"
                        value={responsibleCpf}
                        onChange={(e) => setResponsibleCpf(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono w-36"
                      />
                    </div>

                    <button
                      onClick={handleExecuteAgreement}
                      disabled={!agreementAgreed || totalPrincipal === 0}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        negotiationSuccess
                          ? "bg-emerald-600 text-white"
                          : agreementAgreed && totalPrincipal > 0
                          ? "bg-amber-800 hover:bg-amber-900 text-white shadow-md"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{negotiationSuccess ? "Acordo Formalizado com Sucesso!" : "Formalizar Acordo & Gerar Novos Boletos"}</span>
                    </button>
                  </div>

                  {negotiationSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs space-y-1 animate-fadeIn">
                      <strong>✓ Sincronização com o ERP Realizada!</strong>
                      <p>Os {selectedDebts.length} títulos antigos foram baixados por repactuação e {installments} novo(s) boleto(s) de R$ {installmentValue.toFixed(2).replace(".", ",")} foram gerados no cronograma de cobranças.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          STEP 3: ALERTAS DE VENCIMENTO DO ERP
          ======================================================== */}
      {activeStep === "alertas_erp" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Context & Policy Information */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-4 rounded-2xl bg-[#faf8f5] dark:bg-slate-900 border border-amber-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase font-mono text-amber-900 dark:text-amber-300">
                  <Bell className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Régua Preventiva</span>
                </div>
                <h4 className="font-serif font-black text-sm text-slate-900 dark:text-white">
                  Como o ERP Notifica os Responsáveis
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                  Estudos escolares demonstram que mais de 85% dos atrasos decorrem de esquecimento da data de corte. A régua inteligente dispara avisos antecipados com o link Pix direto para evitar qualquer atrito.
                </p>

                <div className="pt-2 border-t border-amber-200/60 dark:border-slate-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-amber-800 dark:text-amber-400 font-bold">•</span>
                    <span><strong>WhatsApp Oficial:</strong> 98% de taxa de abertura em menos de 15 minutos, entregando a fatura em PDF e a chave Pix em 1 clique.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-amber-800 dark:text-amber-400 font-bold">•</span>
                    <span><strong>Notificação Push:</strong> Alerta discreto na barra de notificações do celular do pai/mãe.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-amber-800 dark:text-amber-400 font-bold">•</span>
                    <span><strong>Período de Tolerância:</strong> Mensagem cordial no dia útil seguinte com link para pagamento antes do lançamento de encargos bancários.</span>
                  </div>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase font-mono text-slate-400 block">
                  Canais de Notificação Ativos no ERP
                </span>
                <div className="space-y-2">
                  {[
                    { id: "whatsapp", label: "WhatsApp Oficial (API Verificada)", icon: MessageSquare },
                    { id: "push", label: "Push Notification no Aplicativo", icon: Smartphone },
                    { id: "email", label: "E-mail com Fatura em Anexo (PDF)", icon: Mail },
                    { id: "sms", label: "SMS de Contingência", icon: Bell }
                  ].map((ch) => {
                    const isChecked = (channels as any)[ch.id];
                    const ChIcon = ch.icon;
                    return (
                      <label
                        key={ch.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 cursor-pointer hover:bg-slate-100/80 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <ChIcon className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">{ch.label}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setChannels(prev => ({ ...prev, [ch.id]: e.target.checked }))}
                          className="rounded border-slate-300 text-amber-800 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Interactive Configuration Bench & Live Phone Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <h5 className="font-serif font-black text-slate-900 dark:text-white text-base">
                      Laboratório de Régua de Vencimento
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure a antecedência do disparo e visualize a mensagem como ela chega no celular do responsável.
                    </p>
                  </div>
                </div>

                {/* Days Before Slider */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Antecedência do Disparo:
                    </span>
                    <strong className="font-mono text-xs text-amber-900 dark:text-amber-300 font-black">
                      {alertDaysBefore === 0 
                        ? "No Dia do Vencimento (D-0)" 
                        : alertDaysBefore === 1 
                        ? "1 dia antes (Véspera D-1)" 
                        : `${alertDaysBefore} dias antes do vencimento (D-${alertDaysBefore})`}
                    </strong>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={7}
                    value={alertDaysBefore}
                    onChange={(e) => setAlertDaysBefore(Number(e.target.value))}
                    className="w-full accent-amber-800 dark:accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>D-0 (Hoje)</span>
                    <span>D-1</span>
                    <span>D-3 (Recomendado)</span>
                    <span>D-5</span>
                    <span>D-7</span>
                  </div>
                </div>

                {/* Template Preset Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Modelo de Mensagem da Régua
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: "amigavel", label: "Lembrete Preventivo", desc: "Aviso de desconto pontualidade" },
                      { id: "vencimento_hoje", label: "Vence Hoje", desc: "Último dia sem juros" },
                      { id: "tolerancia", label: "Tolerância Pós-Vencimento", desc: "Aviso cordial pós-data" }
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => setAlertTemplate(tpl.id as any)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          alertTemplate === tpl.id
                            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-900 dark:text-amber-200 shadow-xs"
                            : "bg-slate-50/70 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <strong className="text-xs font-bold block">{tpl.label}</strong>
                        <span className="text-[10px] opacity-80 block">{tpl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Realistic Phone / WhatsApp Preview Mockup */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
                    Prévia em Tempo Real no Celular do Responsável
                  </span>

                  <div className="max-w-md mx-auto rounded-3xl bg-slate-900 p-3 shadow-xl border-4 border-slate-800 text-white">
                    {/* Phone Top Notch */}
                    <div className="flex justify-between items-center px-4 py-1 text-[10px] font-mono text-slate-400 border-b border-slate-800 mb-2">
                      <span>09:41</span>
                      <div className="w-16 h-2.5 bg-slate-800 rounded-full" />
                      <span>5G • 100%</span>
                    </div>

                    {/* WhatsApp Header */}
                    <div className="flex items-center gap-2 px-2 py-1.5 bg-[#075e54] rounded-t-xl">
                      <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-serif font-black flex items-center justify-center text-xs">
                        E
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <strong className="text-xs font-bold truncate">Secretaria Escolar Financeira</strong>
                          <span className="text-[9px] bg-emerald-400 text-slate-900 px-1 rounded-sm font-bold">✓</span>
                        </div>
                        <span className="text-[10px] text-emerald-200 block">Conta Comercial Oficial</span>
                      </div>
                    </div>

                    {/* WhatsApp Message Bubble */}
                    <div className="bg-[#0b141a] p-3 rounded-b-xl space-y-2 text-xs">
                      <div className="bg-[#1f2c34] p-3 rounded-xl rounded-tl-none border-l-2 border-emerald-500 space-y-2 text-slate-200">
                        <p className="font-semibold text-white">
                          Olá, Gustavo! Tudo bem? 👋
                        </p>

                        {alertTemplate === "amigavel" && (
                          <p className="text-[11px] leading-relaxed text-slate-300">
                            Lembramos que a <strong>Mensalidade de Abril/2026</strong> do aluno <strong>Miguel</strong> vence em <strong>{alertDaysBefore} dias</strong> (10/04/2026). Pague até a data limite para garantir o <strong>desconto de pontualidade de R$ 92,50</strong>.
                          </p>
                        )}

                        {alertTemplate === "vencimento_hoje" && (
                          <p className="text-[11px] leading-relaxed text-slate-300">
                            Aviso rápido: Hoje (10/04/2026) é o último dia para o pagamento da <strong>Mensalidade Escolar</strong> sem cobrança de encargos e com o desconto contratual de pontualidade.
                          </p>
                        )}

                        {alertTemplate === "tolerancia" && (
                          <p className="text-[11px] leading-relaxed text-slate-300">
                            Constatamos que a mensalidade de Abril venceu ontem. Se já efetuou o pagamento, favor desconsiderar. Caso contrário, você pode quitar hoje via Pix sem incidência de juros moratórios!
                          </p>
                        )}

                        <div className="p-2 rounded-lg bg-[#111b21] border border-slate-700/80 space-y-1 font-mono text-[10px]">
                          <div className="flex justify-between text-slate-400">
                            <span>Valor com Desconto:</span>
                            <strong className="text-emerald-400 text-xs">R$ 1.757,50</strong>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Chave Pix:</span>
                            <span className="truncate">pix.financeiro@escola.edu.br</span>
                          </div>
                        </div>

                        {/* WhatsApp Fast Interactive Action Buttons */}
                        <div className="pt-2 border-t border-slate-700/80 space-y-1.5">
                          <button
                            type="button"
                            onClick={handleTriggerSimulatedAlert}
                            className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <span>Copiar Pix Copia e Cola</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPrintModal(true)}
                            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Abrir Boleto em PDF</span>
                          </button>
                        </div>

                        <span className="text-[9px] text-slate-400 text-right block pt-1">
                          09:41 • Entregue ✓✓
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practical Testing Trigger Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Testar Disparo da Régua no Simulador
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Simula o disparo de webhook pelo ERP e valida a entrega nos canais selecionados.
                    </span>
                  </div>

                  <button
                    onClick={handleTriggerSimulatedAlert}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Disparar Notificação Teste</span>
                  </button>
                </div>

                {alertToast && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{alertToast}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Printable PDF Modal */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-800" />
                  <h4 className="font-serif font-black text-base">Ficha de Compensação Registrada • Prévia de Impressão</h4>
                </div>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 text-xs font-bold"
                >
                  ✕ Fechar
                </button>
              </div>

              <div className="border border-slate-300 p-4 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span><strong>Instituição de Ensino LTDA</strong> • CNPJ 12.345.678/0001-90</span>
                  <span>Vencimento: {boletoData.dueDay}</span>
                </div>
                <div>
                  <p><strong>Sacado:</strong> Gustavo Rotatori • CPF: {responsibleCpf}</p>
                  <p><strong>Referência:</strong> {boletoData.title}</p>
                  <p><strong>Documento:</strong> {boletoData.docNum}</p>
                  <p className="text-emerald-700 font-bold"><strong>Valor Líquido:</strong> R$ {finalBoletoAmount.toFixed(2).replace(".", ",")}</p>
                </div>
                <div className="p-2 bg-slate-50 border border-dashed border-slate-300 text-[11px]">
                  <strong>Linha Digitável:</strong><br />
                  {boletoData.digitableLine}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold"
                >
                  Fechar Prévia
                </button>
                <button
                  onClick={() => {
                    setShowPrintModal(false);
                    try {
                      window.print();
                    } catch (e) {}
                  }}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold"
                >
                  Imprimir Documento
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
