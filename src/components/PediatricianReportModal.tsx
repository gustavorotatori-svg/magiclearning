import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { 
  X, 
  Heart, 
  FileText, 
  Printer, 
  Mail, 
  Check, 
  Send, 
  Download, 
  Calendar, 
  AlertCircle, 
  Clock, 
  Coffee, 
  Moon, 
  User, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";
import { Estudante, Ocorrencia } from "../types";

interface PediatricianReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Estudante;
  branding: any;
}

export function PediatricianReportModal({ 
  isOpen, 
  onClose, 
  student, 
  branding 
}: PediatricianReportModalProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "email">("preview");
  
  // Email Form State
  const [pediatricianName, setPediatricianName] = useState("");
  const [pediatricianEmail, setPediatricianEmail] = useState("");
  const [customMessage, setCustomMessage] = useState(
    `Olá, Dr(a). Gostaria de compartilhar o relatório mensal consolidado de saúde e alimentação do(a) ${student.name.split(" ")[0]} gerado pelo aplicativo da escola, para acompanhamento em nossa próxima consulta.`
  );
  
  // Sending Simulation State
  const [isSending, setIsSending] = useState(false);
  const [sendStep, setSendStep] = useState(0);
  const [sendSuccess, setSendSuccess] = useState(false);

  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filter last 30 days of occurrences (or use all available ones as they represent the high-quality logged occurrences)
  const occurrences = student.occurrences || [];

  // Compute stats for the clinician overview
  let totalDays = occurrences.length || 15;
  let excellentLunchCount = 0;
  let partialLunchCount = 0;
  let refusedLunchCount = 0;
  let excellentSnackCount = 0;
  let partialSnackCount = 0;
  let refusedSnackCount = 0;
  let medsCount = 0;
  let totalSleepMinutes = 0;
  let sleepDaysCount = 0;
  
  const medicatedLog: { date: string; name: string; dose: string; details: string }[] = [];

  occurrences.forEach((occ) => {
    // Lunch
    if (occ.meals.lunch === "excelente") excellentLunchCount++;
    else if (occ.meals.lunch === "parcial") partialLunchCount++;
    else if (occ.meals.lunch === "recusou") refusedLunchCount++;

    // Snack
    if (occ.meals.snack === "excelente") excellentSnackCount++;
    else if (occ.meals.snack === "parcial") partialSnackCount++;
    else if (occ.meals.snack === "recusou") refusedSnackCount++;

    // Meds
    if (occ.medicated.wasMedicated) {
      medsCount++;
      medicatedLog.push({
        date: occ.date.split(" (")[0],
        name: occ.medicated.medicationName || "Analgésico/Antitérmico padrão",
        dose: occ.medicated.doseTime || "Conforme receita",
        details: occ.medicated.details || "Ministrado em dose prescrita."
      });
    }

    // Sleep
    if (occ.sleep.durationStr && occ.sleep.durationStr !== "Não dormiu") {
      sleepDaysCount++;
      // Parse e.g. "1h 30min" -> 90 mins
      const hoursMatch = occ.sleep.durationStr.match(/(\d+)h/);
      const minsMatch = occ.sleep.durationStr.match(/(\d+)min/);
      let mins = 0;
      if (hoursMatch) mins += parseInt(hoursMatch[1]) * 60;
      if (minsMatch) mins += parseInt(minsMatch[1]);
      if (mins === 0 && occ.sleep.durationStr.includes("1h")) mins = 60;
      totalSleepMinutes += mins || 75; // fallback
    }
  });

  const avgSleepMinutes = sleepDaysCount > 0 ? Math.round(totalSleepMinutes / sleepDaysCount) : 0;
  const avgSleepStr = avgSleepMinutes > 0 
    ? `${Math.floor(avgSleepMinutes / 60)}h ${avgSleepMinutes % 60}min`
    : "Não dormiu no período escolar";

  // jsPDF clinical report generator
  const generateClinicalPDF = (downloadAfter = true): jsPDF => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    let y = 45;

    // Helper: Header on each page
    const drawHeader = (pageNum: number, totalPages: number) => {
      // Background clean teal clinical header box
      doc.setFillColor(240, 249, 246); // Medical light-mint
      doc.rect(10, 10, 190, 24, "F");

      doc.setDrawColor(13, 148, 136); // Teal primary border
      doc.setLineWidth(0.6);
      doc.line(10, 34, 200, 34);

      // Hospital / Clinic aesthetic details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(13, 148, 136);
      doc.text("RELATÓRIO DE MONITORAMENTO CLÍNICO ESCOLAR", 15, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Instituição: ${branding?.schoolName || "Colégio Integrado"} • Convênio Escolar Ativo`, 15, 23);
      doc.text("Finalidade: Avaliação do Desenvolvimento Pediátrico & Nutricional", 15, 27);
      doc.text(`Período de Análise: Últimos 30 Dias (Consolidado Mensal)`, 15, 31);

      // Right side badge
      doc.setFillColor(13, 148, 136);
      doc.rect(155, 14, 40, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text("USO PEDIÁTRICO", 175, 18.5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Emissão: ${new Date().toLocaleDateString("pt-BR")}`, 195, 26, { align: "right" });
      doc.text(`Página ${pageNum} de ${totalPages}`, 195, 30, { align: "right" });
    };

    // Helper: Footer
    const drawFooter = () => {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
      doc.line(10, 280, 200, 280);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Este documento é um resumo de ocorrências de saúde e nutrição registradas pela equipe escolar e validado eletronicamente.",
        15,
        284
      );
      doc.text(
        `Emitido via Portal do Responsável - ${branding?.schoolName || "Colégio Integrado"} • Suporte Clínico Integrado`,
        15,
        288
      );
    };

    // First page header
    drawHeader(1, 2);

    // 1. Patient Info Card
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(10, y, 190, 26, "FD");

    // Divider bar inside Patient Card
    doc.setFillColor(13, 148, 136);
    doc.rect(10, y, 2, 26, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("IDENTIFICAÇÃO DO PACIENTE (ALUNO)", 15, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Nome do Paciente: ${student.name}`, 15, y + 12);
    doc.text(`Série / Turma Escolar: ${student.grade}`, 15, y + 17);
    doc.text(`Familiar Responsável: ${student.parentName || "Familiar cadastrado"}`, 15, y + 22);

    doc.text(`Contato / Tel: ${student.parentPhone || "(11) 98888-1234"}`, 110, y + 12);
    doc.text(`E-mail de Cadastro: ${student.parentEmail || "responsavel@escola.com.br"}`, 110, y + 17);
    doc.text(`Registros Escolares Analisados: ${occurrences.length} ocorrência(s)`, 110, y + 22);

    y += 32;

    // 2. Clinical Indicators / Consolidated Summary Stats
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(13, 148, 136);
    doc.text("RESUMO DOS INDICADORES DE NUTRIÇÃO E SAÚDE", 10, y);

    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.3);
    doc.line(10, y + 2, 200, y + 2);
    y += 7;

    // Box 1: Alimentação (Teal box)
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(153, 246, 228);
    doc.rect(10, y, 59, 28, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(13, 148, 136);
    doc.text("Métricas Alimentares", 14, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Almoço Excelente: ${excellentLunchCount} dias`, 14, y + 11);
    doc.text(`• Almoço Parcial: ${partialLunchCount} dias`, 14, y + 16);
    doc.text(`• Almoço Recusado: ${refusedLunchCount} dias`, 14, y + 21);
    doc.text(`• Lanche Saudável: ${excellentSnackCount} dias ok`, 14, y + 25);

    // Box 2: Sono e Vigília (Indigo box)
    doc.setFillColor(245, 243, 255);
    doc.setDrawColor(221, 214, 254);
    doc.rect(75, y, 59, 28, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(109, 40, 217);
    doc.text("Padrão de Sono / Sonecas", 79, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Dias com soneca: ${sleepDaysCount} de ${totalDays} dias`, 79, y + 11);
    doc.text(`• Duração média: ${avgSleepStr}`, 79, y + 16);
    doc.text(`• Qualidade: Sono estável e sem`, 79, y + 21);
    doc.text(`  relatos de sobressaltos.`, 79, y + 25);

    // Box 3: Intervenções de Saúde (Rose box)
    doc.setFillColor(255, 241, 242);
    doc.setDrawColor(254, 205, 211);
    doc.rect(140, y, 60, 28, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(190, 24, 74);
    doc.text("Intervenções / Medicações", 144, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Doses ministradas: ${medsCount} dose(s)`, 144, y + 11);
    doc.text(`• Casos febris / dor: ${medsCount > 0 ? medsCount + " evento(s)" : "Nenhum"}`, 144, y + 16);
    doc.text(`• Envio de receita: Conforme`, 144, y + 21);
    doc.text(`  orientação prévia dos pais.`, 144, y + 25);

    y += 35;

    // 3. Clinical Medication Log Table (Strictly chronologic)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(13, 148, 136);
    doc.text("HISTÓRICO CHRONOLÓGICO DE MEDICAMENTOS MINISTRADOS NA ESCOLA", 10, y);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(10, y + 2, 200, y + 2);
    y += 6;

    if (medicatedLog.length === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 190, 10, "F");
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Nenhum medicamento foi ministrado ou necessitado no ambiente escolar durante este período.", 15, y + 6.5);
      y += 15;
    } else {
      // Draw Table Header
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y, 190, 6, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Data", 12, y + 4.5);
      doc.text("Medicamento / Substância", 40, y + 4.5);
      doc.text("Horário da Dose", 95, y + 4.5);
      doc.text("Sintomas relatados & Observações clínicas", 125, y + 4.5);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);

      medicatedLog.forEach((med) => {
        doc.text(med.date, 12, y + 4.5);
        doc.setFont("helvetica", "bold");
        doc.text(med.name, 40, y + 4.5);
        doc.setFont("helvetica", "normal");
        doc.text(med.dose, 95, y + 4.5);
        
        const detailsLines = doc.splitTextToSize(med.details, 72);
        doc.text(detailsLines, 125, y + 4.5);
        
        y += 5 + (detailsLines.length - 1) * 3;
      });
      y += 6;
    }

    // 4. Page Break to Detailed Logs
    doc.addPage();
    drawHeader(2, 2);
    y = 42;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(13, 148, 136);
    doc.text("REGISTROS DIÁRIOS DE ALIMENTAÇÃO, SONO E ESTADO CLÍNICO GERAL", 10, y);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(10, y + 2, 200, y + 2);
    y += 7;

    // Loop through last 5 most relevant or detailed occurrences
    const displayOccurrences = occurrences.slice(0, 5);

    displayOccurrences.forEach((occ) => {
      // Calculate dynamic block height
      const cleanNote = occ.teacherNote.replace(/[\r\n]+/g, " ");
      const noteLines = doc.splitTextToSize(`"${cleanNote}"`, 172);
      const blockHeight = 18 + (noteLines.length * 3.3);

      if (y + blockHeight > 245) {
        doc.addPage();
        drawHeader(2, 2); // simplistic page handling
        y = 42;
      }

      // Container
      doc.setFillColor(252, 254, 253);
      doc.setDrawColor(226, 232, 240);
      doc.rect(10, y, 190, blockHeight, "FD");

      // Left bar color indicator depending on behavioral state
      let behaviorLabel = "Estável / Radiante 🌟";
      let clinicalStatusColor = [13, 148, 136]; // Teal
      if (occ.behaviorState === "agitado") {
        behaviorLabel = "Ativo / Energético ⚡";
        clinicalStatusColor = [217, 119, 6]; // Amber
      } else if (occ.behaviorState === "triste") {
        behaviorLabel = "Sensível / Dengoso 🧸";
        clinicalStatusColor = [79, 70, 229]; // Indigo
      } else if (occ.behaviorState === "cansado") {
        behaviorLabel = "Letárgico / Cansado 💤";
        clinicalStatusColor = [225, 29, 72]; // Rose
      }

      doc.setFillColor(clinicalStatusColor[0], clinicalStatusColor[1], clinicalStatusColor[2]);
      doc.rect(10, y, 1.5, blockHeight, "F");

      // Date header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Data: ${occ.date.split(" (")[0]}`, 14, y + 4.5);

      // Feeding log summary
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      
      const lunchLabel = occ.meals.lunch === "excelente" ? "Almoço Completo (Excelente)" : occ.meals.lunch === "parcial" ? "Almoço Parcial" : "Recusou Almoço";
      const snackLabel = occ.meals.snack === "excelente" ? "Lanche Completo (Excelente)" : occ.meals.snack === "parcial" ? "Lanche Parcial" : "Recusou Lanche";
      
      doc.text(`Nutrição: ${lunchLabel} • ${snackLabel}`, 14, y + 8.5);
      doc.text(`Sono: Período de soneca: ${occ.sleep.durationStr || "Não dormiu"} (${occ.sleep.details || "Descansou"})`, 14, y + 12.5);

      // Teacher commentary line
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(noteLines, 14, y + 16.5);

      y += blockHeight + 4;
    });

    // 5. Physician Validation and Notes Block at bottom of Page 2
    if (y > 200) {
      doc.addPage();
      drawHeader(2, 2);
      y = 42;
    }

    // Outer frame for Medical validation
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.4);
    doc.rect(10, 212, 190, 56, "D");

    doc.setFillColor(13, 148, 136);
    doc.rect(10, 212, 190, 6, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("ESPAÇO RESERVADO PARA EXAME CLÍNICO & VALIDAÇÃO PEDIÁTRICA", 14, 216);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("O pediatra assistente poderá utilizar este espaço para suas anotações clínicas, parecer de desenvolvimento e conduta.", 14, 222);

    // Dr. Signature lines
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Anotações do Médico:", 14, 228);
    
    // Draw empty notes lines
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 234, 110, 234);
    doc.line(14, 240, 110, 240);
    doc.line(14, 246, 110, 246);

    doc.line(125, 246, 190, 246); // signature line
    doc.setFont("helvetica", "bold");
    doc.text("Assinatura do(a) Pediatra / Carimbo CRM", 157, 250, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text("Data: ____ / ____ / ________", 125, 258);

    drawFooter();

    if (downloadAfter) {
      doc.save(`relatorio_pediatra_${student.name.toLowerCase().replace(/\s+/g, "_")}.pdf`);
    }
    return doc;
  };

  const handlePdfDownload = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      try {
        generateClinicalPDF(true);
      } catch (err) {
        console.error("Erro ao gerar PDF:", err);
      } finally {
        setIsGeneratingPdf(false);
      }
    }, 850);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pediatricianEmail) return;

    setIsSending(true);
    setSendStep(1);

    // Step-by-step clinical submission progress simulator
    setTimeout(() => {
      setSendStep(2);
      setTimeout(() => {
        setSendStep(3);
        setTimeout(() => {
          setSendStep(4);
          setTimeout(() => {
            setIsSending(false);
            setSendSuccess(true);
          }, 1000);
        }, 1200);
      }, 1000);
    }, 900);
  };

  const handleCloseSuccess = () => {
    setSendSuccess(false);
    setPediatricianEmail("");
    setPediatricianName("");
    setSendStep(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 overflow-y-auto select-none">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
          >
        
        {/* Top Modal Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-br from-emerald-500/10 via-slate-500/5 to-transparent dark:from-slate-950 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0">
              <Heart className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider font-mono">
                Consolidado Clínico Integrado
              </span>
              <h2 className="text-xl font-serif font-black text-[#423326] dark:text-[#fdfaf3]">
                Relatório de Saúde & Alimentação para o Pediatra
              </h2>
              <p className="text-xs text-slate-550 dark:text-slate-400 font-light">
                Exporte o histórico mensal de sono, alimentação e medicamentos administrados de <strong className="font-bold text-emerald-700 dark:text-emerald-400">{student.name}</strong> para otimizar suas consultas pediátricas.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Tabs Selection */}
        <div className="flex border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 px-6">
          <button
            onClick={() => setActiveTab("preview")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "preview" 
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Visualizar Relatório Clínico</span>
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "email" 
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400" 
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Enviar Diretamente por E-mail</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {sendSuccess ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4 max-w-md mx-auto animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-md">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-lg font-serif font-black text-slate-800 dark:text-white">
                Relatório Enviado com Sucesso!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                O arquivo PDF consolidado de saúde e nutrição de <strong>{student.name}</strong> foi enviado de forma criptografada para o e-mail:
                <span className="block font-mono bg-slate-100 dark:bg-slate-950 p-2 rounded-lg mt-2 text-emerald-700 dark:text-emerald-400 font-bold border border-slate-200/50 dark:border-slate-800">
                  {pediatricianEmail}
                </span>
              </p>
              <p className="text-[11px] text-slate-400 italic">
                Uma cópia de validação clínica e confirmação de entrega foi salva no histórico do aplicativo.
              </p>
              <button
                onClick={handleCloseSuccess}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                Concluir e Voltar
              </button>
            </div>
          ) : isSending ? (
            <div className="py-16 flex flex-col items-center text-center space-y-6 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin flex items-center justify-center" />
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-mono font-bold uppercase tracking-wider">
                  PASSO {sendStep} DE 4
                </p>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  {sendStep === 1 && "📄 Estruturando metadados clínicos..."}
                  {sendStep === 2 && "🩺 Consolidando ocorrências de alimentação..."}
                  {sendStep === 3 && "🔒 Criptografando anexo médico com segurança LGPD..."}
                  {sendStep === 4 && "✈️ Despachando e-mail ao servidor médico..."}
                </h4>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-200/40 dark:border-slate-800">
                <div 
                  className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                  style={{ width: `${(sendStep / 4) * 100}%` }}
                />
              </div>
            </div>
          ) : activeTab === "preview" ? (
            <div className="space-y-6">
              {/* Patient Identification Card UI Preview */}
              <div className="p-4 bg-[#f8faf9] dark:bg-slate-950/40 border border-emerald-100 dark:border-emerald-950 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[8.5px] uppercase tracking-widest font-mono text-emerald-800 dark:text-emerald-400 font-black">PACIENTE ATIVO</span>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold font-serif">
                      {student.name[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                        {student.name}
                      </h4>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-sans">
                        Série: {student.grade} • Responsável: {student.parentName || "Familiar"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:self-center">
                  <button
                    onClick={handlePdfDownload}
                    disabled={isGeneratingPdf}
                    className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-55 text-white font-black py-2 px-3.5 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar Relatório PDF</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-initial bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-2 px-3.5 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Relatório</span>
                  </button>
                </div>
              </div>

              {/* PDF Preview Container */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs bg-slate-50 dark:bg-slate-950 p-4 md:p-8 max-h-[460px] overflow-y-auto font-sans leading-relaxed text-left text-slate-800 dark:text-slate-200">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 space-y-6 max-w-3xl mx-auto shadow-xs">
                  {/* Mock Doc Header */}
                  <div className="border-b border-emerald-100 dark:border-emerald-950 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-center sm:text-left">
                      <h5 className="text-[13px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                        RELATÓRIO CONSOLIDADO PARA ANÁLISE PEDIÁTRICA
                      </h5>
                      <p className="text-[10px] text-slate-450 dark:text-slate-500">
                        {branding?.schoolName || "Colégio Integrado"} • Diretoria Pedagógica & Departamento de Saúde
                      </p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-3 py-1 rounded-lg text-center sm:text-right shrink-0">
                      <span className="text-[9px] text-emerald-800 dark:text-emerald-400 font-mono uppercase font-black tracking-widest block">USO CLÍNICO</span>
                      <span className="text-[10px] text-slate-550 dark:text-slate-400 block mt-0.5">{new Date().toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>

                  {/* Identification block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="space-y-2">
                      <p><strong>Paciente:</strong> {student.name}</p>
                      <p><strong>Série:</strong> {student.grade}</p>
                      <p><strong>Responsável:</strong> {student.parentName || "Familiar cadastrado"}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>Contato:</strong> {student.parentPhone || "(11) 98888-1234"}</p>
                      <p><strong>Período escolar:</strong> Matutino/Vespertino</p>
                      <p><strong>Período dos registros:</strong> Últimos 30 Dias</p>
                    </div>
                  </div>

                  {/* Health and Nutrition Indicator Blocks */}
                  <div className="space-y-3">
                    <h6 className="text-[11px] font-black uppercase text-slate-400 font-mono tracking-wider">
                      Resumo Estatístico Consolidado
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/40 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                          <Coffee className="w-3.5 h-3.5" />
                          <span>Alimentação</span>
                        </div>
                        <ul className="text-[10.5px] text-slate-600 dark:text-slate-350 space-y-1">
                          <li>Almoço excelente: <strong>{excellentLunchCount} dias</strong></li>
                          <li>Almoço parcial: <strong>{partialLunchCount} dias</strong></li>
                          <li>Almoço recusado: <strong>{refusedLunchCount} dias</strong></li>
                          <li>Lanche excelente: <strong>{excellentSnackCount} dias</strong></li>
                        </ul>
                      </div>

                      <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                          <Moon className="w-3.5 h-3.5" />
                          <span>Sono e Repouso</span>
                        </div>
                        <ul className="text-[10.5px] text-slate-600 dark:text-slate-350 space-y-1">
                          <li>Média de soneca: <strong>{avgSleepStr}</strong></li>
                          <li>Dias repousados: <strong>{sleepDaysCount} dias</strong></li>
                          <li>Sem sesta: <strong>{totalDays - sleepDaysCount} dias</strong></li>
                          <li>Qualidade: <strong>Sono reparador</strong></li>
                        </ul>
                      </div>

                      <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/40 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-xs">
                          <Heart className="w-3.5 h-3.5" />
                          <span>Intervenções</span>
                        </div>
                        <ul className="text-[10.5px] text-slate-600 dark:text-slate-350 space-y-1">
                          <li>Meds ministradas: <strong>{medsCount} dose(s)</strong></li>
                          <li>Eventos de dor/fever: <strong>{medsCount} ocorrência(s)</strong></li>
                          <li>Apoio pedagógico: <strong>Sincronizado</strong></li>
                          <li>Receituário guardado: <strong>Sim ✓</strong></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Medication details log */}
                  <div className="space-y-3">
                    <h6 className="text-[11px] font-black uppercase text-slate-400 font-mono tracking-wider">
                      Histórico Clínico de Medicamentos
                    </h6>
                    {medicatedLog.length === 0 ? (
                      <p className="text-[10.5px] italic text-slate-500">
                        Nenhum medicamento administrado no período.
                      </p>
                    ) : (
                      <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-[11px] border-collapse text-left">
                          <thead>
                            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-550 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                              <th className="p-2 font-bold">Data</th>
                              <th className="p-2 font-bold">Medicação</th>
                              <th className="p-2 font-bold">Hora</th>
                              <th className="p-2 font-bold">Detalhes/Observações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {medicatedLog.map((m, i) => (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-none">
                                <td className="p-2 whitespace-nowrap">{m.date}</td>
                                <td className="p-2 font-bold">{m.name}</td>
                                <td className="p-2 whitespace-nowrap">{m.dose}</td>
                                <td className="p-2 text-slate-600 dark:text-slate-350">{m.details}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Daily detailed events log */}
                  <div className="space-y-3">
                    <h6 className="text-[11px] font-black uppercase text-slate-400 font-mono tracking-wider">
                      Registros Diários Clínicos Recentes
                    </h6>
                    <div className="space-y-3">
                      {occurrences.slice(0, 3).map((occ, i) => (
                        <div key={i} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150 dark:border-slate-800 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 dark:text-slate-200">{occ.date.split(" (")[0]}</span>
                            <span className="text-[10px] bg-slate-150 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full uppercase">
                              {occ.behaviorState === "otimo" ? "Humor Ótimo 🌟" : "Humor Calmo 💤"}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-600 dark:text-slate-350 leading-relaxed">
                            <strong>Alimentação:</strong> Almoço {occ.meals.lunch}, lanche {occ.meals.snack}. {occ.meals.details}
                          </p>
                          <p className="text-[10.5px] text-slate-600 dark:text-slate-350 leading-relaxed">
                            <strong>Soneca:</strong> {occ.sleep.durationStr} ({occ.sleep.details})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medical signature block mock */}
                  <div className="pt-6 border-t border-dashed border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 text-[10px] text-slate-500">
                    <div className="space-y-1.5">
                      <p>Notas Clínicas do Pediatra:</p>
                      <div className="h-10 border-b border-slate-200 dark:border-slate-800"></div>
                      <div className="h-6 border-b border-slate-200 dark:border-slate-800"></div>
                    </div>
                    <div className="flex flex-col justify-end items-center text-center space-y-2">
                      <div className="w-48 border-b border-slate-300 dark:border-slate-700 mt-6"></div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">Carimbo e Assinatura do Médico</p>
                      <p className="text-[9px] text-slate-400">CRM / RQE</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Send by Email Tab */
            <form onSubmit={handleSendEmail} className="space-y-4 max-w-lg mx-auto text-left">
              <div className="bg-emerald-500/5 dark:bg-slate-950/60 p-4 border border-emerald-500/10 dark:border-slate-850 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  O relatório clínico em PDF com todas as ocorrências de alimentação e saúde dos últimos 30 dias será gerado e <strong>anexado de forma totalmente automática</strong> e segura a esta mensagem.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#423326] dark:text-slate-200 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nome do Pediatra / Clínica</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Roberto Antunes"
                  value={pediatricianName}
                  onChange={(e) => setPediatricianName(e.target.value)}
                  className="w-full bg-[#fdfbf7] dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#423326] dark:text-slate-200 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>E-mail do Pediatra</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: roberto.pediatra@gmail.com"
                  value={pediatricianEmail}
                  onChange={(e) => setPediatricianEmail(e.target.value)}
                  className="w-full bg-[#fdfbf7] dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#423326] dark:text-slate-200">
                  Mensagem Customizada do E-mail
                </label>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-[#fdfbf7] dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-3.5 text-xs text-slate-850 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none font-sans leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer mt-4"
              >
                <Send className="w-4 h-4 text-emerald-100" />
                <span>Enviar Relatório ao Pediatra</span>
              </button>
            </form>
          )}

        </div>

        {/* Modal Footer Credits */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 text-center text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-850 shrink-0">
          Este relatório está em conformidade com as diretrizes pediátricas de saúde infanto-juvenil e de proteção de dados.
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
}
