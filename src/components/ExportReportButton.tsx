import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { FileText } from "lucide-react";
import { Ocorrencia, Estudante } from "../types";

interface ExportReportButtonProps {
  activeStudent: Estudante;
  occurrences: Ocorrencia[];
  periodLabel: string;
}

export function ExportReportButton({ activeStudent, occurrences, periodLabel }: ExportReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = () => {
    setIsGenerating(true);

    try {
      // Create new standard portrait, mm-scaled A4 document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      let y = 40;

      const addHeader = (pageNum: number, totalPages: number) => {
        // Background banner band
        doc.setFillColor(248, 246, 240);
        doc.rect(10, 10, 190, 22, "F");

        doc.setDrawColor(180, 83, 9); // Amber line
        doc.setLineWidth(0.6);
        doc.line(10, 32, 200, 32);

        // Header Text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text("COLÉGIO INTEGRADO - PORTAL DO RESPONSÁVEL", 15, 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Acompanhamento Pedagógico Diário Integrado", 15, 23);
        doc.text(`Período do Relatório: ${periodLabel}`, 15, 28);

        // Right side details
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text("RELATÓRIO DE DIA-A-DIA", 195, 18, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 195, 23, { align: "right" });
        doc.text(`Página ${pageNum} de ${totalPages}`, 195, 28, { align: "right" });
      };

      const addFooter = () => {
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.2);
        doc.line(10, 282, 200, 282);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(156, 163, 175);
        doc.text(
          "Este relatório é um informativo institucional para acompanhamento da rotina escolar e desenvolvimento do aluno pelos responsáveis.",
          15,
          286
        );
        doc.text(
          "Colégio Integrado • Av. Paulista, 1000 • Sistema de Gestão e Comunicação Escolar",
          15,
          290
        );
      };

      // Gather statistics
      let excellentLunchCount = 0;
      let partialLunchCount = 0;
      let refusedLunchCount = 0;

      let excellentSnackCount = 0;
      let partialSnackCount = 0;
      let refusedSnackCount = 0;

      let medsCount = 0;

      const humorStats = {
        otimo: 0,
        agitado: 0,
        triste: 0,
        cansado: 0,
      };

      occurrences.forEach((occ) => {
        humorStats[occ.behaviorState] = (humorStats[occ.behaviorState] || 0) + 1;
        if (occ.meals.lunch === "excelente") excellentLunchCount++;
        else if (occ.meals.lunch === "parcial") partialLunchCount++;
        else if (occ.meals.lunch === "recusou") refusedLunchCount++;

        if (occ.meals.snack === "excelente") excellentSnackCount++;
        else if (occ.meals.snack === "parcial") partialSnackCount++;
        else if (occ.meals.snack === "recusou") refusedSnackCount++;

        if (occ.medicated.wasMedicated) medsCount++;
      });

      // Write Student Details block
      doc.setFillColor(254, 252, 243);
      doc.setDrawColor(245, 230, 200);
      doc.setLineWidth(0.3);
      doc.rect(10, y, 190, 24, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(66, 51, 38);
      doc.text("INFORMAÇÕES GERAIS DO ALUNO", 15, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(`Nome do Estudante: ${activeStudent.name}`, 15, y + 12);
      doc.text(`Série / Turma: ${activeStudent.grade}`, 15, y + 17);
      doc.text(`Responsável Cadastrado: ${activeStudent.parentName || "Familiar Responsável"}`, 15, y + 22);

      doc.text(`Registros Processados: ${occurrences.length} ocorrência(s)`, 115, y + 12);
      doc.text(`Total Medicamentos Recebidos: ${medsCount} dose(s)`, 115, y + 17);
      const mainMood = humorStats.otimo >= humorStats.agitado && humorStats.otimo >= humorStats.triste && humorStats.otimo >= humorStats.cansado
        ? "Excelente Disposição"
        : humorStats.agitado >= humorStats.triste && humorStats.agitado >= humorStats.cansado
        ? "Muito Ativo / Energético"
        : humorStats.triste >= humorStats.cansado
        ? "Necessitou de Acolhimento"
        : "Sonolento / Repouso";
      doc.text(`Clima Emocional Predominante: ${mainMood}`, 115, y + 22);

      y += 32;

      // Statistics block
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text("RESUMO DE ALIMENTAÇÃO E COMPORTAMENTO DO PERÍODO", 10, y);

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.line(10, y + 2, 200, y + 2);
      y += 8;

      // Stats columns header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Almoço Escolar", 12, y);
      doc.text("Lanche da Tarde", 72, y);
      doc.text("Disposição & Convivência", 132, y);

      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text(`• Consumo Excelente: ${excellentLunchCount} dia(s)`, 12, y);
      doc.text(`• Consumo Excelente: ${excellentSnackCount} dia(s)`, 72, y);
      doc.text(`• Excelente Disposição: ${humorStats.otimo || 0} dia(s)`, 132, y);

      y += 4;
      doc.text(`• Consumo Parcial: ${partialLunchCount} dia(s)`, 12, y);
      doc.text(`• Consumo Parcial: ${partialSnackCount} dia(s)`, 72, y);
      doc.text(`• Muito Ativo: ${humorStats.agitado || 0} dia(s)`, 132, y);

      y += 4;
      doc.text(`• Recusou Refeição: ${refusedLunchCount} dia(s)`, 12, y);
      doc.text(`• Recusou Refeição: ${refusedSnackCount} dia(s)`, 72, y);
      doc.text(`• Necessitou Acolhimento: ${humorStats.triste || 0} dia(s)`, 132, y);

      y += 4;
      doc.text("", 12, y);
      doc.text("", 72, y);
      doc.text(`• Sonolento / Repouso: ${humorStats.cansado || 0} dia(s)`, 132, y);

      y += 12;

      // Detailed occurrences section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text("REGISTROS DIÁRIOS DETALHADOS", 10, y);

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.line(10, y + 2, 200, y + 2);
      y += 8;

      // Loop over occurrences
      occurrences.forEach((occ) => {
        // Prepare Teacher Note lines
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        const notePrefix = "Anotação Pedagógica: ";
        const cleanNote = occ.teacherNote.replace(/[\r\n]+/g, " ");
        const noteLines = doc.splitTextToSize(`"${cleanNote}"`, 172);
        
        // Calculate dynamic height for this occurrence block
        // Block baseline is about 22mm + note lines height
        const lineHeight = 3.6;
        const noteHeight = (noteLines.length + 1) * lineHeight;
        const blockHeight = 22 + noteHeight;

        // If it exceeds remaining space, push to next page
        if (y + blockHeight > 268) {
          doc.addPage();
          y = 42;
        }

        // Draw occurrence backdrop container card
        doc.setFillColor(253, 252, 248);
        doc.setDrawColor(234, 229, 219);
        doc.setLineWidth(0.25);
        doc.rect(10, y, 190, blockHeight, "FD");

        // Sub-stripe left border indicator of behavior state
        let stripeColor = [16, 185, 129]; // Emerald (otimo)
        let behaviorLabel = "Excelente Disposição";
        if (occ.behaviorState === "agitado") {
          stripeColor = [245, 158, 11]; // Amber
          behaviorLabel = "Muito Ativo";
        } else if (occ.behaviorState === "triste") {
          stripeColor = [99, 102, 241]; // Indigo
          behaviorLabel = "Necessitou Acolhimento";
        } else if (occ.behaviorState === "cansado") {
          stripeColor = [239, 68, 68]; // Red
          behaviorLabel = "Sonolento";
        }

        doc.setFillColor(stripeColor[0], stripeColor[1], stripeColor[2]);
        doc.rect(10, y, 1.2, blockHeight, "F");

        // Heading: Date & Humor state
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(66, 51, 38);
        doc.text(`Ocorrência de: ${occ.date}`, 15, y + 6);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(stripeColor[0], stripeColor[1], stripeColor[2]);
        doc.text(`Humor: ${behaviorLabel}`, 195, y + 6, { align: "right" });

        // Line 1: Nutrition meals
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(115, 115, 115);
        doc.text("Alimentação:", 15, y + 11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(`Almoço: ${occ.meals.lunch.toUpperCase()}   |   Lanche: ${occ.meals.snack.toUpperCase()}`, 33, y + 11);

        // Meal details sentence
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        doc.text(`"${occ.meals.details}"`, 15, y + 14.5);

        // Line 2: Sleep & Medications
        doc.setFont("helvetica", "bold");
        doc.setTextColor(115, 115, 115);
        doc.text("Sono/Repouso:", 15, y + 19);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(`${occ.sleep.durationStr} (${occ.sleep.details})`, 35, y + 19);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(115, 115, 115);
        doc.text("Medicação:", 110, y + 19);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const medicationSummary = occ.medicated.wasMedicated
          ? `${occ.medicated.medicationName} às ${occ.medicated.doseTime} - ${occ.medicated.details}`
          : "Nenhum medicamento ministrado hoje";
        doc.text(medicationSummary, 126, y + 19);

        // Teacher note section inside a subtle card
        y += 22;
        doc.setFillColor(245, 245, 240);
        doc.rect(14, y, 182, noteHeight - 1, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(115, 115, 115);
        doc.text(notePrefix, 17, y + 3.5);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(80, 80, 80);
        noteLines.forEach((line: string, idx: number) => {
          doc.text(line, 17 + (idx === 0 ? doc.getTextWidth(notePrefix) - 1.5 : 0), y + 3.5 + (idx * lineHeight));
        });

        y += noteHeight + 4; // Add spacer to start next block
      });

      // Post-process Headers & Footers across all generated pages
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addHeader(i, totalPages);
        addFooter();
      }

      // Download the PDF with clean filename
      const formattedStudentName = activeStudent.name.replace(/\s+/g, "_");
      const formattedPeriod = periodLabel.replace(/\s+/g, "_");
      doc.save(`Relatorio_Mensal_DiaDia_${formattedStudentName}_${formattedPeriod}.pdf`);
    } catch (err) {
      console.error("Erro na geração de PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isGenerating || occurrences.length === 0}
      className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
        occurrences.length === 0
          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
          : "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white border-slate-900 dark:border-slate-100"
      }`}
    >
      {isGenerating ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Gerando Relatório...</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          <span>Exportar Relatório Mensal (PDF)</span>
        </>
      )}
    </button>
  );
}
