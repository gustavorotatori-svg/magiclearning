import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check, QrCode, Copy, Sparkles, FileText, Download, ArrowLeft } from "lucide-react";
import { jsPDF } from "jspdf";
import { Cobranca } from "../types";

interface BillingInvoiceModalProps {
  billingDetail: Cobranca | null;
  onClose: () => void;
  onSimulatePayment: (cobId: string) => void;
}

export default function BillingInvoiceModal({ billingDetail, onClose, onSimulatePayment }: BillingInvoiceModalProps) {
  const [showPixCode, setShowPixCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // We can draw headers, rect, text:
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(66, 51, 38); // rich brand color
      doc.text("MAGIC LEARNING S/C LTDA", 20, 25);

      // Add details:
      doc.setFontSize(9);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text("CNPJ: 12.345.678/0001-90", 20, 31);
      doc.text("Endereço: Av. dos Três Poderes, 1200 - São Paulo, SP", 20, 36);

      // Separator
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 42, 190, 42);

      // Title
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("DEMONSTRATIVO DE COBRANÇA ESCOLAR", 20, 52);

      // Meta box
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 58, 170, 30, "F");

      doc.setFontSize(8);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("NÚMERO DO DOCUMENTO", 25, 65);
      doc.text("VENCIMENTO", 85, 65);
      doc.text("STATUS", 145, 65);

      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(billingDetail.documentId, 25, 72);
      doc.text(billingDetail.dueDate, 85, 72);
      doc.text(billingDetail.status.toUpperCase(), 145, 72);

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(20, 95, 170, 8, "F");
      doc.setFontSize(9);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(71, 85, 105);
      doc.text("DESCRIÇÃO DO SERVIÇO / PRODUTO", 25, 100);
      doc.text("VALOR (R$)", 155, 100);

      // Table body
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(billingDetail.title, 25, 112);
      doc.text("R$ " + billingDetail.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 }), 155, 112);

      // Line under table body
      doc.line(20, 118, 190, 118);

      // Summary
      doc.setFont("Helvetica", "bold");
      doc.text("TOTAL LÍQUIDO DO DOCUMENTO:", 90, 126);
      doc.text(`R$ ${billingDetail.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 155, 126);

      // Instructions
      doc.setFontSize(8);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Chave Pix de Destino: pix.magic.learning@escola.br", 25, 142);
      doc.text("Instruções de Pagamento: Compensação automática em até 10 minutos após o pagamento.", 25, 147);

      // Barcode line drawing (visual simulation of barcode)
      doc.text("LINHA DIGITÁVEL DO BOLETO PARA LEITURA BANCÁRIA:", 25, 162);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("34191.79001 01043.513184 91020.150008 7 90020000035000", 25, 167);

      // Draw mock barcode
      doc.setDrawColor(0, 0, 0);
      let startX = 25;
      for (let i = 0; i < 50; i++) {
        let width = Math.random() > 0.5 ? 1.2 : 0.4;
        doc.setFillColor(0, 0, 0);
        doc.rect(startX, 172, width, 14, "F");
        startX += width + (Math.random() > 0.5 ? 0.8 : 0.4);
      }

      // Add a cool stamp
      doc.setDrawColor(180, 180, 180);
      doc.rect(130, 210, 45, 20);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text("AUTENTICAÇÃO MECÂNICA", 133, 216);
      
      if (billingDetail.status === "pago") {
        doc.setTextColor(16, 185, 129);
        doc.text("LIQUIDADO / COMPROVADO", 133, 222);
        doc.setFontSize(7);
        doc.text("ID: " + billingDetail.documentId + "-PAID", 133, 227);
      } else {
        doc.setTextColor(245, 158, 11);
        doc.text("AGUARDANDO PAGAMENTO", 133, 222);
      }

      // Footer signature
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Este documento é um demonstrativo auxiliar de faturamento escolar.", 20, 275);
      doc.text("Magic Learning S/C Ltda - Departamento Tesouraria", 20, 280);

      doc.save(`fatura_${billingDetail.documentId}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
    }
  };

  return (
    <AnimatePresence>
      {billingDetail && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal content */}
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-300"
          >
          {/* Modal Header */}
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-800 dark:text-slate-200 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-850">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-[0.98] cursor-pointer"
                title="Voltar ao portal"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Voltar</span>
              </button>
              <span className="font-sans font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{localeText().invoiceTitle}</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" id="billing-close-btn" aria-label="Fechar">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-5">
            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block">{localeText().billingLabel}</span>
              <p className="text-2xl sm:text-3xl font-mono font-black text-indigo-600 dark:text-indigo-400">
                R$ {billingDetail.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Ref: {billingDetail.documentId} • {localeText().dueLabel}: {billingDetail.dueDate}
              </p>
            </div>

            <hr className="border-slate-100 dark:border-slate-850" />

            {/* Details list */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{localeText().descLabel}:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{billingDetail.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{localeText().categoryLabel}:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">{billingDetail.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{localeText().payeeLabel}:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 text-right">Magic Learning S/C Ltda</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">{localeText().payerDocLabel}:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400 text-right">***.621.558-**</span>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-850" />

            {/* Preview PDF Action Button with visual prominence */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/40 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 py-3 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-dashed border-indigo-200 dark:border-indigo-900/60 shadow-3xs hover:border-indigo-400 dark:hover:border-indigo-600"
            >
              <FileText className="w-4.5 h-4.5 text-indigo-500" />
              <span>📄 {localeText().previewPdfBtn}</span>
            </button>

            {billingDetail.status !== "pago" ? (
              <div className="space-y-3 pt-1">
                {/* QR Code Container with Perfect Light/Dark Contrast */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/60 dark:border-slate-850 text-center space-y-2.5">
                  <div className="flex justify-center p-2.5 bg-white rounded-lg inline-block mx-auto border border-slate-200 dark:border-slate-800">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                    {localeText().qrCodeInstructions}
                  </span>
                </div>

                {copied && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 p-2 text-[10px] text-center rounded border border-emerald-200 dark:border-emerald-900/40 animate-pulse font-semibold">
                    ✓ {localeText().pixCopied}
                  </div>
                )}

                <button 
                  onClick={() => {
                    setCopied(true);
                    setShowPixCode(true);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white py-2 rounded-xl text-center text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{localeText().copyBtn}</span>
                </button>

                {showPixCode && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 text-[10px] font-mono rounded break-all border border-slate-200/80 dark:border-slate-850 overflow-x-auto text-slate-600 dark:text-slate-400 max-h-16">
                    00020101021226870014br.gov.bcb.pix2565pix.magic.learning/cobranca/{billingDetail.documentId}A53039865407{billingDetail.amount}BR5925MAGIC_LEARNING
                  </div>
                )}

                <button
                  onClick={() => {
                    onSimulatePayment(billingDetail.id);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-center text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-100" />
                  <span>{localeText().simulateBtn}</span>
                </button>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl text-center border border-emerald-200 dark:border-emerald-900/30 space-y-1 mt-3">
                <Check className="w-7 h-7 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">{localeText().invoicePaid}</p>
                <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-mono">
                  {localeText().comprovanteLabel}: {billingDetail.documentId}-PAID
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Side-Drawer overlay with beautiful entrance sliding effects */}
      <AnimatePresence>
        {isPreviewOpen && (
          <>
            {/* Backdrop of the drawer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-3xs z-[60] cursor-pointer"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg md:max-w-xl bg-[#f8fafc] dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-slate-800 h-full z-[70] flex flex-col"
            >
              {/* Drawer Header */}
              <div className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100 uppercase tracking-tight">Pré-visualização do Boleto</h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono font-bold">Ref: {billingDetail.documentId} • {billingDetail.status.toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-2xs active:scale-[0.98] cursor-pointer"
                    title="Voltar aos detalhes da fatura"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>Voltar</span>
                  </button>

                  <button
                    onClick={handleDownloadPDF}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-3xs"
                    title="Baixar PDF Oficial completo"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar PDF</span>
                  </button>
                  
                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Fechar pré-visualização"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body - A4 Document Sheet Representation */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="bg-white dark:bg-slate-900 shadow-xl border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 sm:p-8 max-w-lg mx-auto text-slate-800 dark:text-slate-200 relative overflow-hidden font-sans">
                  
                  {/* Status Stamp Watermark - Looks highly professional */}
                  <div className="absolute top-16 right-16 transform rotate-12 opacity-[0.08] dark:opacity-[0.14] pointer-events-none select-none">
                    {billingDetail.status === "pago" ? (
                      <div className="border-8 border-emerald-600 text-emerald-600 font-sans font-black text-4xl px-4 py-2 rounded-xl">PAGO</div>
                    ) : billingDetail.status === "vencido" ? (
                      <div className="border-8 border-rose-600 text-rose-600 font-sans font-black text-4xl px-4 py-2 rounded-xl">VENCIDO</div>
                    ) : (
                      <div className="border-8 border-amber-600 text-amber-600 font-sans font-black text-4xl px-4 py-2 rounded-xl">PENDENTE</div>
                    )}
                  </div>

                  {/* School Invoice Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-serif font-black text-[#423326] dark:text-amber-100 tracking-wider">MAGIC LEARNING</span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono leading-relaxed">
                        Magic Learning S/C Ltda • CNPJ 12.345.678/0001-90<br />
                        Av. dos Três Poderes, 1200 • Morumbi, São Paulo - SP
                      </p>
                    </div>
                    
                    <div className="text-left sm:text-right space-y-0.5">
                      <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        DEMONSTRATIVO DE COBRANÇA
                      </span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">Documento Nº {billingDetail.documentId}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Emissão: 01/07/2026</p>
                    </div>
                  </div>

                  {/* Customer Information (Payer/Sacado) */}
                  <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                      <h4 className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Dados do Pagador / Sacado</h4>
                      <p className="font-bold text-slate-800 dark:text-slate-150">Responsável Financeiro</p>
                      <p className="text-slate-600 dark:text-slate-400">CPF: ***.621.558-**</p>
                      <p className="text-slate-600 dark:text-slate-400">Aluno: Guilherme Rotatori</p>
                    </div>
                    <div className="space-y-1 sm:text-right">
                      <h4 className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Dados do Vencimento</h4>
                      <p className="font-bold text-slate-800 dark:text-slate-150">Vencimento: {billingDetail.dueDate}</p>
                      <p className="text-slate-600 dark:text-slate-400 font-mono">Valor Original: R$ {(billingDetail.amount * 0.98).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      {billingDetail.status === "vencido" && (
                        <p className="text-rose-500 font-mono font-bold">Multas/Encargos: + R$ {(billingDetail.amount * 0.02).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                      )}
                    </div>
                  </div>

                  {/* Invoice Line Items */}
                  <div className="py-4 space-y-3">
                    <h4 className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Detalhamento dos Lançamentos</h4>
                    <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[9px] uppercase">
                            <th className="p-3">Item / Serviço</th>
                            <th className="p-3 text-right">Preço Un.</th>
                            <th className="p-3 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          <tr>
                            <td className="p-3">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">{billingDetail.title}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-sans">Período de Referência: Junho/Julho de 2026</span>
                            </td>
                            <td className="p-3 text-right font-mono text-slate-600 dark:text-slate-400">
                              R$ {billingDetail.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                              R$ {billingDetail.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                          <tr className="bg-slate-50/50 dark:bg-slate-950/30 text-[10px] text-slate-500 dark:text-slate-400">
                            <td className="p-2 pl-3">
                              Taxa Administrativa (Manutenção de Portal do Aluno)
                            </td>
                            <td className="p-2 text-right font-mono">
                              R$ 0,00
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ISENTO
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Total Summary */}
                  <div className="py-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150/50 dark:border-slate-800/40 flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      <span>Subtotal Geral:</span>
                      <span>R$ {billingDetail.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      <span>Descontos / Isenções:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">- R$ 0,00</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-800 dark:text-slate-100 font-serif font-black text-sm border-t border-dashed border-slate-200 dark:border-slate-850 pt-2 mt-1">
                      <span>VALOR TOTAL DO BOLETO:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black text-sm sm:text-base">
                        R$ {billingDetail.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Payment Instructions / Stamps */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5 text-center">
                    {billingDetail.status === "pago" ? (
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-lg border border-emerald-150 dark:border-emerald-900/20 text-emerald-800 dark:text-emerald-400 flex items-center justify-center gap-2 text-left">
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
                        <div>
                          <p className="text-xs font-bold">Comprovante de Pagamento Eletrônico</p>
                          <p className="text-[9.5px] text-emerald-600/80 dark:text-emerald-400/80 font-mono leading-tight">Liquidado via PIX em 03/07/2026 às 19:40 • ID: {billingDetail.documentId}-PAID</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-left">
                        <h4 className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">Instruções para Liquidação</h4>
                        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-mono">
                          • Pagamento aceito via PIX (QR Code no painel de detalhes) com compensação imediata.<br />
                          • Em caso de dúvidas, contate a tesouraria escolar pelo chat integrado de secretaria.<br />
                          • Evite atrasos para garantir a manutenção de descontos pontuais de convênios.
                        </p>
                      </div>
                    )}

                    {/* Simulated Barcode at the bottom of sheet */}
                    <div className="pt-4 space-y-2">
                      <p className="text-[8.5px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider font-mono">Código de Barras para Leitura Bancária (Representação Linear)</p>
                      <p className="text-[10px] sm:text-[11px] font-mono font-bold tracking-tight text-slate-700 dark:text-slate-300 break-all select-all cursor-pointer" title="Clique para selecionar">
                        34191.79001 01043.513184 91020.150008 7 90020000035000
                      </p>
                      <div className="h-10 w-full flex items-center justify-center gap-[1px] sm:gap-0.5 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded border border-slate-100 dark:border-slate-800/60 max-w-sm mx-auto">
                        {Array.from({ length: 42 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-850 dark:bg-slate-300 h-full"
                            style={{
                              width: idx % 5 === 0 ? "3px" : idx % 3 === 0 ? "1px" : "1.5px",
                              opacity: idx % 7 === 0 ? 0.35 : 0.95
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border border-slate-200/50 dark:border-slate-800"
                >
                  Fechar Visualização
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Boleto Oficial (PDF)</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )}
</AnimatePresence>
  );

  // Fallback localized labels (English as default fallback inside component helper)
  function localeText() {
    return {
      invoiceTitle: "Demonstrativo de Faturamento / Invoice Detail",
      billingLabel: "Valor Líquido de Cobrança / Billing Amount",
      dueLabel: "Vencimento / Due Date",
      descLabel: "Descrição / Description",
      categoryLabel: "Classificação / Category",
      payeeLabel: "Favorecido / Payee",
      payerDocLabel: "Documento Sacado / Payer ID",
      qrCodeInstructions: "Escaneie o QR Code PIX no app do seu banco / Scan PIX QR Code inside banking app",
      pixCopied: "Código Pix copiado! / Pix code copied!",
      copyBtn: "Copiar Código Pix / Copy Pix Code",
      simulateBtn: "Dar Baixa de Pagamento (Simulação) / Simulate Payment Clearance",
      invoicePaid: "Esta Cobrança Está Paga! / Invoice Paid Successfully!",
      comprovanteLabel: "Comprovante eletrônico / E-Receipt",
      previewPdfBtn: "Visualizar e Baixar PDF (Boleto)"
    };
  }
}
