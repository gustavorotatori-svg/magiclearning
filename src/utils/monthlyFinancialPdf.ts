import { jsPDF } from "jspdf";
import { Cobranca, SchoolBranding } from "../types";

export interface GeneratePdfOptions {
  cobrancas: Cobranca[];
  monthFilter: string; // e.g., "2026-10", "2026-09", "all"
  statusFilter: "todos" | "pago" | "pendente" | "vencido";
  schoolBranding?: SchoolBranding;
  studentName?: string;
  studentGrade?: string;
  responsibleName?: string;
  responsibleCpf?: string;
  includeIrpfDeclaration?: boolean;
}

export function formatCurrencyBRL(value: number): string {
  return "R$ " + value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function getMonthLabel(monthKey: string): string {
  if (monthKey === "all") return "Consolidado Geral (Ano Letivo 2026)";
  const [year, month] = monthKey.split("-");
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const mIndex = parseInt(month, 10) - 1;
  const name = monthNames[mIndex] || month;
  return `${name} de ${year}`;
}

export function generateMonthlyFinancialPdf(options: GeneratePdfOptions): jsPDF {
  const {
    cobrancas,
    monthFilter,
    statusFilter,
    schoolBranding,
    studentName = "Nicolas Nogueira",
    studentGrade = "3º Ano B - Ensino Fundamental",
    responsibleName = "Mariana Silva Nogueira",
    responsibleCpf = "123.456.789-00",
    includeIrpfDeclaration = true,
  } = options;

  // Filter items
  const filteredItems = cobrancas.filter((cob) => {
    // Status filter
    if (statusFilter !== "todos") {
      if (statusFilter === "vencido") {
        if (cob.status !== "vencido" && (cob.status as string) !== "atrasado") return false;
      } else if (cob.status !== statusFilter) {
        return false;
      }
    }

    // Month filter
    if (monthFilter !== "all" && cob.dueDate) {
      const parts = cob.dueDate.split("/");
      if (parts.length === 3) {
        const itemMonthKey = `${parts[2]}-${parts[1].padStart(2, "0")}`;
        if (itemMonthKey !== monthFilter) return false;
      }
    }

    return true;
  });

  // Calculate totals
  const totalAmount = filteredItems.reduce((acc, c) => acc + c.amount, 0);
  const paidItems = filteredItems.filter((c) => c.status === "pago");
  const paidAmount = paidItems.reduce((acc, c) => acc + c.amount, 0);
  const pendingItems = filteredItems.filter((c) => c.status === "pendente");
  const pendingAmount = pendingItems.reduce((acc, c) => acc + c.amount, 0);
  const overdueItems = filteredItems.filter((c) => c.status === "vencido" || (c.status as string) === "atrasado");
  const overdueAmount = overdueItems.reduce((acc, c) => acc + c.amount, 0);
  const adimplenciaRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 100;

  // Initialize jsPDF A4 portrait
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  let currentY = 14;

  const schoolName = schoolBranding?.schoolName || "Colégio Magic Learning";
  const periodTitle = getMonthLabel(monthFilter);

  // 1. TOP HEADER BAND
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(marginX, currentY, contentWidth, 22, "F");

  // Accent line on bottom of banner
  doc.setFillColor(0, 119, 192); // brand primary blue
  doc.rect(marginX, currentY + 20.5, contentWidth, 1.5, "F");

  // Header Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(schoolName.toUpperCase(), marginX + 6, currentY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text("SISTEMA DE GESTÃO ESCOLAR INTEGRADA & PORTARIA", marginX + 6, currentY + 13);
  doc.text("CNPJ: 12.345.678/0001-90 • Inscrição Municipal: 9.876.543-2", marginX + 6, currentY + 17.5);

  // Right side of Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("RELATÓRIO FINANCEIRO MENSAL", marginX + contentWidth - 6, currentY + 8, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(203, 213, 225);
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR") + " às " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  doc.text(`Emissão: ${dateStr}`, marginX + contentWidth - 6, currentY + 13, { align: "right" });
  doc.text("Autenticação Eletrônica LGPD", marginX + contentWidth - 6, currentY + 17.5, { align: "right" });

  currentY += 27;

  // 2. DOCUMENT TITLE & SCOPE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("DEMONSTRATIVO CONSOLIDADO DE COBRANÇAS E QUITAÇÃO", marginX, currentY);

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Referência: ${periodTitle} • Filtro de Status: ${statusFilter.toUpperCase()}`, marginX, currentY);

  currentY += 6;

  // 3. STUDENT & RESPONSIBLE DETAILS CARD
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.rect(marginX, currentY, contentWidth, 20, "FD");

  // Metadata Columns
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("ESTUDANTE / BENEFICIÁRIO", marginX + 5, currentY + 5.5);
  doc.text("SÉRIE & TURMA", marginX + 68, currentY + 5.5);
  doc.text("RESPONSÁVEL FINANCEIRO", marginX + 118, currentY + 5.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(studentName, marginX + 5, currentY + 11);
  doc.text(studentGrade, marginX + 68, currentY + 11);
  doc.text(responsibleName, marginX + 118, currentY + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Matrícula: MAT-2026-0492", marginX + 5, currentY + 16);
  doc.text("Turno: Integral", marginX + 68, currentY + 16);
  doc.text(`CPF: ${responsibleCpf}`, marginX + 118, currentY + 16);

  currentY += 24;

  // 4. EXECUTIVE FINANCIAL KPIS SUMMARY (4 columns)
  const colWidth = (contentWidth - 6) / 4;

  // Card 1: Total
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, colWidth, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL FATURADO", marginX + 4, currentY + 5);
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formatCurrencyBRL(totalAmount), marginX + 4, currentY + 11);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(`${filteredItems.length} faturas registradas`, marginX + 4, currentY + 14.5);

  // Card 2: Liquidado (Pago)
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.rect(marginX + colWidth + 2, currentY, colWidth, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text("TOTAL LIQUIDADO", marginX + colWidth + 6, currentY + 5);
  doc.setFontSize(9.5);
  doc.setTextColor(4, 120, 87);
  doc.text(formatCurrencyBRL(paidAmount), marginX + colWidth + 6, currentY + 11);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(`${paidItems.length} faturas quitadas`, marginX + colWidth + 6, currentY + 14.5);

  // Card 3: A Vencer (Pendente)
  doc.setFillColor(254, 243, 199); // amber-50
  doc.rect(marginX + (colWidth + 2) * 2, currentY, colWidth, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text("A VENCER (PENDENTE)", marginX + (colWidth + 2) * 2 + 4, currentY + 5);
  doc.setFontSize(9.5);
  doc.setTextColor(146, 64, 14);
  doc.text(formatCurrencyBRL(pendingAmount), marginX + (colWidth + 2) * 2 + 4, currentY + 11);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(`${pendingItems.length} faturas no prazo`, marginX + (colWidth + 2) * 2 + 4, currentY + 14.5);

  // Card 4: Em Atraso / Adimplência
  const hasOverdue = overdueAmount > 0;
  if (hasOverdue) {
    doc.setFillColor(254, 242, 242); // rose-50
  } else {
    doc.setFillColor(240, 249, 255); // sky-50
  }
  doc.rect(marginX + (colWidth + 2) * 3, currentY, colWidth, 16, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  if (hasOverdue) {
    doc.setTextColor(225, 29, 72);
  } else {
    doc.setTextColor(3, 105, 161);
  }
  doc.text(hasOverdue ? "EM ATRASO" : "ÍNDICE DE QUITAÇÃO", marginX + (colWidth + 2) * 3 + 4, currentY + 5);

  doc.setFontSize(9.5);
  if (hasOverdue) {
    doc.setTextColor(190, 18, 60);
  } else {
    doc.setTextColor(2, 132, 199);
  }
  doc.text(hasOverdue ? formatCurrencyBRL(overdueAmount) : `${adimplenciaRate.toFixed(1)}%`, marginX + (colWidth + 2) * 3 + 4, currentY + 11);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(hasOverdue ? `${overdueItems.length} fatura(s) vencida(s)` : "100% adimplente", marginX + (colWidth + 2) * 3 + 4, currentY + 14.5);

  currentY += 21;

  // 5. INVOICES TABLE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("DISCRIMINAÇÃO DETALHADA DAS FATURAS E MENSALIDADES", marginX, currentY);

  currentY += 4.5;

  // Table Column Headers
  doc.setFillColor(241, 245, 249);
  doc.rect(marginX, currentY, contentWidth, 7, "F");
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.2);
  doc.line(marginX, currentY + 7, marginX + contentWidth, currentY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);

  const colXDoc = marginX + 3;
  const colXTitle = marginX + 24;
  const colXCat = marginX + 88;
  const colXDue = marginX + 120;
  const colXStatus = marginX + 142;
  const colXAmount = marginX + contentWidth - 3;

  doc.text("DOCUMENTO", colXDoc, currentY + 4.5);
  doc.text("DISCRIMINAÇÃO DO SERVIÇO / PRODUTO", colXTitle, currentY + 4.5);
  doc.text("CATEGORIA", colXCat, currentY + 4.5);
  doc.text("VENCIMENTO", colXDue, currentY + 4.5);
  doc.text("STATUS", colXStatus, currentY + 4.5);
  doc.text("VALOR NOMINAL", colXAmount, currentY + 4.5, { align: "right" });

  currentY += 7;

  // Table Body Rows
  if (filteredItems.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("Nenhuma cobrança localizada para os filtros selecionados no período.", marginX + 10, currentY + 8);
    currentY += 15;
  } else {
    filteredItems.forEach((item, index) => {
      // Check if page overflow
      if (currentY > pageHeight - 55) {
        doc.addPage();
        currentY = 16;
      }

      const isEven = index % 2 === 0;
      if (isEven) {
        doc.setFillColor(250, 250, 252);
        doc.rect(marginX, currentY, contentWidth, 7, "F");
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);

      // Doc ID
      doc.setFont("helvetica", "bold");
      doc.text(item.documentId || item.id, colXDoc, currentY + 4.8);

      // Title
      doc.setFont("helvetica", "normal");
      const titleTruncated = item.title.length > 38 ? item.title.substring(0, 36) + "..." : item.title;
      doc.text(titleTruncated, colXTitle, currentY + 4.8);

      // Category
      const catText = item.category || "Educação";
      doc.text(catText.substring(0, 16), colXCat, currentY + 4.8);

      // Due Date
      doc.text(item.dueDate, colXDue, currentY + 4.8);

      // Status
      const isPaid = item.status === "pago";
      const isOverdue = item.status === "vencido" || (item.status as string) === "atrasado";

      if (isPaid) {
        doc.setTextColor(5, 150, 105);
        doc.setFont("helvetica", "bold");
        doc.text("LIQUIDADO", colXStatus, currentY + 4.8);
      } else if (isOverdue) {
        doc.setTextColor(225, 29, 72);
        doc.setFont("helvetica", "bold");
        doc.text("VENCIDO", colXStatus, currentY + 4.8);
      } else {
        doc.setTextColor(217, 119, 6);
        doc.setFont("helvetica", "bold");
        doc.text("EM ABERTO", colXStatus, currentY + 4.8);
      }

      // Amount
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(formatCurrencyBRL(item.amount), colXAmount, currentY + 4.8, { align: "right" });

      currentY += 7;
    });

    // Total Row
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY, marginX + contentWidth, currentY);

    currentY += 2;
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, currentY, contentWidth, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text("TOTALIZADOR GERAL DO PERÍODO:", colXDoc, currentY + 5);
    doc.text(formatCurrencyBRL(totalAmount), colXAmount, currentY + 5, { align: "right" });

    currentY += 10;
  }

  // 6. DECLARAÇÃO DE QUITAÇÃO ANUAL / IRPF (SE APLICÁVEL)
  if (includeIrpfDeclaration && paidItems.length > 0) {
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 16;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(marginX, currentY, contentWidth, 24, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text("DECLARAÇÃO OFICIAL DE QUITAÇÃO PARA FINS FISCAIS E IRPF (LEI FEDERAL Nº 12.007/2009)", marginX + 4, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const legalText = `Declaramos, para os devidos fins de direito e comprovação de despesas com instrução no Imposto de Renda da Pessoa Física (Art. 8º da Lei nº 9.250/1995), que o(a) responsável financeiro(a) ${responsibleName} quitou junto a esta instituição as parcelas indicadas como LIQUIDADAS no valor consolidado de ${formatCurrencyBRL(paidAmount)}, referente ao aluno(a) ${studentName}. Documento válido como quitação anual.`;
    const splitLegal = doc.splitTextToSize(legalText, contentWidth - 8);
    doc.text(splitLegal, marginX + 4, currentY + 9.5);

    currentY += 28;
  }

  // 7. SIGNATURES & AUTHENTICATION SEAL
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 16;
  }

  const sigWidth = 75;
  const sigY = currentY + 12;

  // School Signature Line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(marginX + 10, sigY, marginX + 10 + sigWidth, sigY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text("TESOURARIA & DEPARTAMENTO FINANCEIRO", marginX + 10 + sigWidth / 2, sigY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(schoolName, marginX + 10 + sigWidth / 2, sigY + 7.5, { align: "center" });

  // Responsible Signature Line
  const respSigX = marginX + contentWidth - 10 - sigWidth;
  doc.line(respSigX, sigY, respSigX + sigWidth, sigY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text("RESPONSÁVEL FINANCEIRO", respSigX + sigWidth / 2, sigY + 4, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(responsibleName, respSigX + sigWidth / 2, sigY + 7.5, { align: "center" });

  // 8. PAGE FOOTER WITH AUDIT TRAIL
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 12, marginX + contentWidth, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Autenticação Digital: ML-AUTH-${now.getFullYear()}-F8B2-99AC • Emissão oficial gerada via Magic Learning Platform • Conforme Lei Geral de Proteção de Dados (LGPD).`,
      marginX,
      pageHeight - 8
    );
    doc.text(`Página ${i} de ${pageCount}`, marginX + contentWidth, pageHeight - 8, { align: "right" });
  }

  return doc;
}
