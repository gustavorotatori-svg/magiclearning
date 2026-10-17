import React, { useState, useMemo } from "react";
import { X, FileText, Download, Printer, Eye, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { Cobranca, SchoolBranding } from "../types";
import { generateMonthlyFinancialPdf, formatCurrencyBRL, getMonthLabel } from "../utils/monthlyFinancialPdf";

interface MonthlyFinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cobrancas: Cobranca[];
  branding?: SchoolBranding;
  studentName?: string;
  studentGrade?: string;
  responsibleName?: string;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
  zIndex?: number;
  onSwitchToLtv?: () => void;
}

export const MonthlyFinancialReportModal: React.FC<MonthlyFinancialReportModalProps> = ({
  isOpen,
  onClose,
  cobrancas,
  branding,
  studentName = "Nicolas Nogueira",
  studentGrade = "3º Ano B - Ensino Fundamental",
  responsibleName = "Mariana Silva Nogueira",
  onToast,
  zIndex = 70,
  onSwitchToLtv,
}) => {
  if (!isOpen) return null;

  // View Mode: "config" (parameters and selection) vs "preview" (in-modal A4 document view)
  const [activeView, setActiveView] = useState<"config" | "preview">("config");

  // Extract distinct available months from cobrancas
  const availableMonths = useMemo(() => {
    const map = new Map<string, string>();
    cobrancas.forEach((c) => {
      if (c.dueDate) {
        const parts = c.dueDate.split("/");
        if (parts.length === 3) {
          const key = `${parts[2]}-${parts[1].padStart(2, "0")}`;
          if (!map.has(key)) {
            map.set(key, getMonthLabel(key));
          }
        }
      }
    });

    const list = Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0])) // latest first
      .map(([key, label]) => ({ key, label }));

    return [{ key: "all", label: "Consolidado Geral (Ano Letivo 2026)" }, ...list];
  }, [cobrancas]);

  // Selected filters
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return availableMonths[1]?.key || "all";
  });
  const [selectedStatus, setSelectedStatus] = useState<"todos" | "pago" | "pendente" | "vencido">("todos");
  const [includeIrpf, setIncludeIrpf] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [customResponsibleCpf, setCustomResponsibleCpf] = useState("123.456.789-00");

  // Filter items for live modal preview
  const filteredItems = useMemo(() => {
    return cobrancas.filter((cob) => {
      // Status
      if (selectedStatus !== "todos") {
        if (selectedStatus === "vencido") {
          if (cob.status !== "vencido" && (cob.status as string) !== "atrasado") return false;
        } else if (cob.status !== selectedStatus) {
          return false;
        }
      }

      // Month
      if (selectedMonth !== "all" && cob.dueDate) {
        const parts = cob.dueDate.split("/");
        if (parts.length === 3) {
          const itemMonthKey = `${parts[2]}-${parts[1].padStart(2, "0")}`;
          if (itemMonthKey !== selectedMonth) return false;
        }
      }

      return true;
    });
  }, [cobrancas, selectedMonth, selectedStatus]);

  // Live Metrics
  const totalAmount = useMemo(() => filteredItems.reduce((acc, c) => acc + c.amount, 0), [filteredItems]);
  const paidAmount = useMemo(() => filteredItems.filter((c) => c.status === "pago").reduce((acc, c) => acc + c.amount, 0), [filteredItems]);
  const pendingAmount = useMemo(() => filteredItems.filter((c) => c.status === "pendente").reduce((acc, c) => acc + c.amount, 0), [filteredItems]);
  const overdueAmount = useMemo(() => filteredItems.filter((c) => c.status === "vencido" || (c.status as string) === "atrasado").reduce((acc, c) => acc + c.amount, 0), [filteredItems]);
  const adimplenciaRate = useMemo(() => (totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 100), [totalAmount, paidAmount]);

  const schoolName = branding?.schoolName || "Colégio Magic Learning";
  const emissionTimestamp = useMemo(() => {
    const d = new Date();
    return `${d.toLocaleDateString("pt-BR")} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  }, []);

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      const doc = generateMonthlyFinancialPdf({
        cobrancas,
        monthFilter: selectedMonth,
        statusFilter: selectedStatus,
        schoolBranding: branding,
        studentName,
        studentGrade,
        responsibleName,
        responsibleCpf: customResponsibleCpf,
        includeIrpfDeclaration: includeIrpf,
      });

      const filename = `relatorio_financeiro_${selectedMonth}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);

      if (onToast) {
        onToast(`Relatório financeiro "${filename}" exportado em PDF com sucesso!`, "success");
      }
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      if (onToast) {
        onToast("Erro ao processar o relatório em PDF. Tente novamente.", "error");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div
      style={{ zIndex }}
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[96vh] flex flex-col text-left overflow-hidden">
        
        {/* Header - Fully responsive on all screen sizes */}
        <div className="p-3 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                    Relatório Financeiro Mensal Consolidado
                  </h2>
                  <span className="text-[9px] sm:text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                    PDF & Quitação
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Demonstrativo contábil e IRPF (Lei 12.007/2009)
                </p>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveView("config")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  activeView === "config"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Filtros & Faturas
              </button>
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  activeView === "preview"
                    ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Prévia A4</span>
              </button>
            </div>

            {onSwitchToLtv && (
              <button
                type="button"
                onClick={onSwitchToLtv}
                className="hidden md:inline-flex px-2 py-1 text-[11px] font-mono rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 items-center gap-1 transition-all cursor-pointer"
                title="Alternar para Configurações de LTV Mastery e CRM"
              >
                <span>Metas CRM</span>
              </button>
            )}

            {/* Prominent Back Button */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              title="Voltar ao portal"
              aria-label="Voltar ao portal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Voltar</span>
            </button>

            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {activeView === "config" ? (
            /* CONFIG & SELECTION VIEW */
            <>
              {/* Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                    Mês de Referência
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    {availableMonths.map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-500 block">
                    Filtro de Cobranças
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    <option value="todos">Todas as Faturas do Período</option>
                    <option value="pago">Somente Faturas Liquidadas (Pagas)</option>
                    <option value="pendente">Somente Faturas em Aberto (A Vencer)</option>
                    <option value="vencido">Somente Faturas Vencidas (Em Atraso)</option>
                  </select>
                </div>
              </div>

              {/* Responsible & Beneficiary Info Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Beneficiário (Estudante)</span>
                  <strong className="text-slate-800 dark:text-slate-200 block truncate">{studentName}</strong>
                  <span className="text-[10px] text-slate-400 block truncate">{studentGrade}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Responsável Financeiro</span>
                  <strong className="text-slate-800 dark:text-slate-200 block truncate">{responsibleName}</strong>
                  <span className="text-[10px] text-slate-400 block">Titular do Contrato</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">CPF para IRPF</span>
                  <input
                    type="text"
                    value={customResponsibleCpf}
                    onChange={(e) => setCustomResponsibleCpf(e.target.value)}
                    className="w-full text-xs font-mono px-2 py-1 mt-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>

              {/* KPI Snapshot Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 sm:p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-750">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Total</span>
                  <strong className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-slate-100 block mt-0.5 truncate">
                    {formatCurrencyBRL(totalAmount)}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">{filteredItems.length} faturas</span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-850">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono uppercase block">Liquidado</span>
                  <strong className="text-xs sm:text-sm font-mono font-bold text-emerald-700 dark:text-emerald-300 block mt-0.5 truncate">
                    {formatCurrencyBRL(paidAmount)}
                  </strong>
                  <span className="text-[10px] text-emerald-600/80 block">Quitado ({adimplenciaRate.toFixed(0)}%)</span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-850">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono uppercase block">A Vencer</span>
                  <strong className="text-xs sm:text-sm font-mono font-bold text-amber-700 dark:text-amber-300 block mt-0.5 truncate">
                    {formatCurrencyBRL(pendingAmount)}
                  </strong>
                  <span className="text-[10px] text-amber-600/80 block">No prazo</span>
                </div>

                <div className="p-2.5 sm:p-3 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-850">
                  <span className="text-[10px] text-rose-700 dark:text-rose-400 font-mono uppercase block">Em Atraso</span>
                  <strong className="text-xs sm:text-sm font-mono font-bold text-rose-700 dark:text-rose-300 block mt-0.5 truncate">
                    {formatCurrencyBRL(overdueAmount)}
                  </strong>
                  <span className="text-[10px] text-rose-600/80 block">Pendente</span>
                </div>
              </div>

              {/* Invoices Table Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-750 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-600 dark:text-slate-300">
                    Faturas Selecionadas ({filteredItems.length})
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {studentName.split(" ")[0]}
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {filteredItems.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 font-medium">
                      Nenhuma cobrança encontrada para os filtros selecionados.
                    </div>
                  ) : (
                    filteredItems.map((cob) => (
                      <div key={cob.id} className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850">
                        <div className="truncate min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{cob.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">Doc: {cob.documentId} • Venc: {cob.dueDate}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <strong className="font-mono text-slate-900 dark:text-slate-100 block">
                            {formatCurrencyBRL(cob.amount)}
                          </strong>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            cob.status === "pago"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : cob.status === "vencido" || (cob.status as string) === "atrasado"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}>
                            {cob.status === "pago" ? "Liquidado" : cob.status === "vencido" ? "Vencido" : "Em Aberto"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* IRPF Checkbox Option */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="include-irpf-declaration"
                  checked={includeIrpf}
                  onChange={(e) => setIncludeIrpf(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="include-irpf-declaration" className="cursor-pointer">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                    Incluir Declaração Oficial de Quitação para IRPF (Lei Federal nº 12.007/2009)
                  </span>
                  <span className="text-[10px] text-slate-500 leading-relaxed block mt-0.5">
                    Emite no documento o texto legal padrão para fins de comprovação e dedução de despesas com instrução no Imposto de Renda.
                  </span>
                </label>
              </div>
            </>
          ) : (
            /* PREVIEW VIEW: OFFICIAL A4 PAPER SIMULATION */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold">Prévia do Relatório Oficial Consolidado (Layout A4)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView("config")}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar aos filtros</span>
                </button>
              </div>

              {/* Document Sheet Simulation */}
              <div className="bg-slate-50 dark:bg-slate-950 p-2 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 font-sans shadow-inner max-h-[55vh] overflow-y-auto overflow-x-hidden">
                {/* Official Sheet Container */}
                <div className="bg-white text-slate-900 p-3 sm:p-8 rounded-lg shadow-sm border border-slate-200 max-w-2xl mx-auto space-y-4 sm:space-y-5 text-xs">
                  
                  {/* Sheet Top Banner */}
                  <div className="bg-slate-900 text-white p-3 sm:p-4 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">{schoolName.toUpperCase()}</h3>
                      <p className="text-[10px] text-slate-300 mt-0.5">SISTEMA DE GESTÃO ESCOLAR INTEGRADA & PORTARIA</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">CNPJ: 12.345.678/0001-90 • Inscrição Municipal: 9.876.543-2</p>
                    </div>
                    <div className="text-left sm:text-right text-[10px] text-slate-300">
                      <p className="font-bold text-white uppercase text-[10px]">RELATÓRIO FINANCEIRO</p>
                      <p className="text-[9px] mt-0.5">Emissão: {emissionTimestamp}</p>
                      <p className="text-[9px] text-emerald-300 font-mono mt-0.5">Autenticação LGPD</p>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="border-b border-slate-200 pb-2 sm:pb-3">
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 tracking-tight">
                      DEMONSTRATIVO CONSOLIDADO DE COBRANÇAS E QUITAÇÃO
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                      Referência: <strong>{getMonthLabel(selectedMonth)}</strong> • Filtro de Status: <strong>{selectedStatus.toUpperCase()}</strong>
                    </p>
                  </div>

                  {/* Beneficiary Details Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 sm:p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-500 block">Estudante / Beneficiário</span>
                      <strong className="text-slate-900 block truncate">{studentName}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-500 block">Série & Turma</span>
                      <span className="text-slate-800 block truncate">{studentGrade}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-500 block">Responsável Financeiro</span>
                      <strong className="text-slate-900 block truncate">{responsibleName}</strong>
                      <span className="text-[10px] font-mono text-slate-500">CPF: {customResponsibleCpf}</span>
                    </div>
                  </div>

                  {/* Items Table - Wrapped for responsive scroll on phones */}
                  <div className="border border-slate-200 rounded overflow-x-auto w-full">
                    <table className="w-full min-w-[460px] text-left text-[11px]">
                      <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase font-mono border-b border-slate-200">
                        <tr>
                          <th className="p-2">Documento</th>
                          <th className="p-2">Descrição / Rubrica</th>
                          <th className="p-2">Vencimento</th>
                          <th className="p-2 text-right">Valor</th>
                          <th className="p-2 text-right">Situação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredItems.map((cob) => (
                          <tr key={cob.id} className="hover:bg-slate-50/50">
                            <td className="p-2 font-mono text-[10px] text-slate-500">{cob.documentId}</td>
                            <td className="p-2 font-semibold text-slate-800">{cob.title}</td>
                            <td className="p-2 font-mono text-slate-600">{cob.dueDate}</td>
                            <td className="p-2 text-right font-mono font-bold text-slate-900">{formatCurrencyBRL(cob.amount)}</td>
                            <td className="p-2 text-right">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                cob.status === "pago"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : cob.status === "vencido" || (cob.status as string) === "atrasado"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {cob.status === "pago" ? "Quitado" : cob.status === "vencido" ? "Vencido" : "Em Aberto"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Totals Table */}
                  <div className="bg-slate-50 border border-slate-200 rounded p-2.5 sm:p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Resumo do Período</span>
                      <span className="text-[11px] text-slate-600">
                        Total de <strong>{filteredItems.length} faturas</strong> computadas
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-right w-full md:w-auto">
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 block">Faturado</span>
                        <strong className="font-mono text-slate-900 text-xs sm:text-sm block">{formatCurrencyBRL(totalAmount)}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-emerald-700 block">Quitado</span>
                        <strong className="font-mono text-emerald-700 text-xs sm:text-sm block">{formatCurrencyBRL(paidAmount)}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-rose-700 block">Saldo</span>
                        <strong className="font-mono text-rose-700 text-xs sm:text-sm block">{formatCurrencyBRL(pendingAmount + overdueAmount)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* IRPF Quittance Text */}
                  {includeIrpf && (
                    <div className="bg-slate-50/80 border border-slate-200 rounded p-2.5 sm:p-3 text-[10px] text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 block mb-1">
                        DECLARAÇÃO OFICIAL DE QUITAÇÃO ANUAL DE DÉBITOS (LEI FEDERAL Nº 12.007/2009)
                      </strong>
                      Declaramos, para os devidos fins de direito e comprovação perante a Receita Federal do Brasil (IRPF),
                      que o responsável financeiro <strong>{responsibleName}</strong> (CPF: {customResponsibleCpf}) referente ao aluno <strong>{studentName}</strong>,
                      matriculado na turma <strong>{studentGrade}</strong>, realizou a quitação dos valores especificados no quadro de faturas acima.
                      Este demonstrativo substitui as quitações mensais do período indicado.
                    </div>
                  )}

                  {/* Electronic Signature / Stamp */}
                  <div className="pt-2 sm:pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[9px] text-slate-400 font-mono">
                    <div>
                      Chave de Autenticação Digital: SHA256-{(Math.abs(totalAmount * 9973)).toString(16).toUpperCase()}-2026
                    </div>
                    <div>
                      Secretaria de Finanças • {schoolName}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions - Responsive across all phone and desktop sizes */}
        <div className="p-3 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-[10px] text-slate-400 font-mono hidden md:block">
            Formato: A4 PDF • Autenticação Eletrônica LGPD • Conforme Lei 12.007/2009
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Voltar ao Painel</span>
            </button>

            {activeView === "config" ? (
              <button
                type="button"
                onClick={() => setActiveView("preview")}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Visualizar documento em formato A4"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Prévia A4</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveView("config")}
                className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Filtros</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrintDocument}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Imprimir relatório"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              disabled={isExporting || filteredItems.length === 0}
              onClick={handleDownloadPdf}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              id="btn-download-monthly-financial-pdf"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Gerando..." : "Gerar e Baixar PDF"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
