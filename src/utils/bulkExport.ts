import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { Estudante, Ocorrencia } from "../types";

/**
 * Normalizes text to be safe for filenames.
 */
function safeFilename(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9_]/g, "_")    // replace spaces/symbols with underscore
    .replace(/__+/g, "_")           // deduplicate underscores
    .trim();
}

/**
 * Generates the performance PDF (Boletim) for a student using jsPDF.
 */
export function generatePerformancePDF(student: Estudante, schoolName: string): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [66, 51, 38]; // #423326
  const accentColor = [180, 83, 9]; // #B45309 (amber-700)
  const textDark = [51, 65, 85]; // slate-700

  // Page styling / border
  doc.setDrawColor(229, 211, 178); // cream border
  doc.setLineWidth(1);
  doc.rect(5, 5, 200, 287);
  doc.rect(7, 7, 196, 283);

  // Header Layout
  doc.setFillColor(252, 248, 238); // warm soft cream background for header
  doc.rect(8, 8, 194, 40, "F");

  // Decorative corner lines
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.5);
  doc.line(12, 12, 22, 12);
  doc.line(12, 12, 12, 22);
  doc.line(198, 12, 188, 12);
  doc.line(198, 12, 198, 22);

  // School Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(schoolName.toUpperCase(), 15, 23);

  // Document Title
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("BOLETIM DE DESEMPENHO PEDAGÓGICO OFICIAL", 15, 29);
  doc.line(15, 31, 195, 31);

  // School Subtitle / Year
  doc.setFontSize(8);
  doc.setTextColor(112, 128, 144);
  doc.text("Ano Letivo de Referência: 2026 • Ciclo Integrado Acadêmico", 15, 37);

  // Quick stats on the right of the header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(142, 14, 52, 28);
  doc.text("MÉDIA GERAL", 146, 20);

  // Calculate overall average
  const gradesCount = student.grades.length;
  const gradesSum = student.grades.reduce((sum, g) => sum + (g.firstBimester + g.secondBimester) / 2, 0);
  const averageGrade = gradesCount > 0 ? gradesSum / gradesCount : 0;

  doc.setFontSize(16);
  doc.setTextColor(16, 185, 129); // emerald green
  doc.text(averageGrade.toFixed(2), 146, 27);

  doc.setFontSize(8);
  doc.setTextColor(112, 128, 144);
  doc.setFont("helvetica", "normal");
  doc.text("Situação: Aprovado Direto", 146, 33);
  doc.text("Frequência Parcial: 98.4%", 146, 37);

  // Student info block
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(10, 52, 190, 24, "F");
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(10, 52, 190, 24, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("ESTUDANTE:", 14, 59);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(student.name, 45, 59);

  doc.setFont("helvetica", "bold");
  doc.text("SÉRIE/TURMA:", 14, 65);
  doc.setFont("helvetica", "normal");
  doc.text(student.grade, 45, 65);

  doc.setFont("helvetica", "bold");
  doc.text("EMISSÃO:", 14, 71);
  doc.setFont("helvetica", "normal");
  const emissionDate = new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR");
  doc.text(emissionDate, 45, 71);

  // Authenticity Code
  const docCode = "AUT-" + student.id.toUpperCase() + "-" + Date.now().toString().slice(-6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Doc Autenticidade: ${docCode}`, 144, 71);

  // Subjects Grid
  let yCoord = 84;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("DETALHAMENTO DE NOTAS POR DISCIPLINA", 10, yCoord);
  doc.line(10, yCoord + 2, 200, yCoord + 2);
  yCoord += 8;

  // Table Header
  doc.setFillColor(66, 51, 38);
  doc.rect(10, yCoord, 190, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Disciplina", 14, yCoord + 5.5);
  doc.text("1º Bim", 85, yCoord + 5.5);
  doc.text("2º Bim", 110, yCoord + 5.5);
  doc.text("Média", 135, yCoord + 5.5);
  doc.text("Resultado", 160, yCoord + 5.5);
  yCoord += 8;

  // Render Each Subject
  student.grades.forEach((g) => {
    const subAvg = (g.firstBimester + g.secondBimester) / 2;

    // Rows
    doc.setFillColor(254, 253, 251);
    doc.rect(10, yCoord, 190, 10, "F");
    doc.setDrawColor(241, 245, 249);
    doc.rect(10, yCoord, 190, 10, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(g.subject, 14, yCoord + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(g.firstBimester.toFixed(1), 85, yCoord + 6.5);
    doc.text(g.secondBimester.toFixed(1), 110, yCoord + 6.5);

    doc.setFont("helvetica", "bold");
    doc.text(subAvg.toFixed(1), 135, yCoord + 6.5);

    if (subAvg >= 7.0) {
      doc.setTextColor(16, 185, 129); // emerald
      doc.text("Aprovado", 160, yCoord + 6.5);
    } else {
      doc.setTextColor(180, 83, 9); // amber
      doc.text("Atenção", 160, yCoord + 6.5);
    }

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    yCoord += 11;

    // Feedback / Orientation Text (Wrapped neatly)
    doc.setFillColor(250, 248, 242);
    doc.rect(14, yCoord - 1, 182, 10, "F");

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);

    const textFeedback = `Parecer Pedagógico: "${g.feedback}"`;
    const wrappedFeedback = doc.splitTextToSize(textFeedback, 178);
    doc.text(wrappedFeedback, 16, yCoord + 3.5);

    yCoord += (wrappedFeedback.length * 4) + 2;
  });

  // Pedagogic Final Consolation Box
  if (yCoord > 240) {
    doc.addPage();
    doc.setDrawColor(229, 211, 178);
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287);
    doc.rect(7, 7, 196, 283);
    yCoord = 20;
  } else {
    yCoord += 6;
  }

  // Consolidate Message
  doc.setFillColor(253, 250, 244);
  doc.rect(10, yCoord, 190, 28, "F");
  doc.setDrawColor(217, 119, 6);
  doc.rect(10, yCoord, 190, 28, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text("CONSIDERAÇÕES DA COORDENAÇÃO PEDAGÓGICA GERAL", 14, yCoord + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const commentGeneral =
    "O aluno demonstra forte engajamento nas dinâmicas pedagógicas cotidianas e respeito impecável às diretrizes do colégio. Os resultados consolidados refletem excelente absorção dos conteúdos apresentados e engajamento acima da média no portfólio institucional de projetos práticos.";
  const wrappedComment = doc.splitTextToSize(commentGeneral, 182);
  doc.text(wrappedComment, 14, yCoord + 12);

  // Signatures row
  let sigY = yCoord + 45;
  if (sigY > 270) {
    doc.addPage();
    doc.setDrawColor(229, 211, 178);
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287);
    doc.rect(7, 7, 196, 283);
    sigY = 50;
  }

  // Draw signature lines
  doc.setDrawColor(180, 83, 9);
  doc.setLineWidth(0.5);
  doc.line(25, sigY, 90, sigY);
  doc.line(120, sigY, 185, sigY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("Direção e Coordenação Escolar", 28, sigY + 4);
  doc.text(`Profissional Docente Mestre`, 128, sigY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Selo de Autenticidade Digital Unificada", 28, sigY + 8);
  doc.text("Plataforma White-Label Integrada", 128, sigY + 8);

  // Footer brand details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(112, 128, 144);
  doc.text(`Emitido pelo canal de Responsáveis da escola ${schoolName} via Portal de Integração`, 10, 276);

  return doc;
}

/**
 * Generates student performance as a CSV string.
 */
export function generatePerformanceCSV(student: Estudante): string {
  const csvRows: string[] = [];
  // CSV Header
  csvRows.push(["Aluno", "Turma", "Materia", "1º Bimestre", "2º Bimestre", "Variacao", "Parecer"].join(";"));

  student.grades.forEach((g) => {
    const b2 = g.secondBimester;
    const b1 = g.firstBimester;
    const diff = b2 - b1;
    const variationSign = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);

    const row = [
      `"${student.name.replace(/"/g, '""')}"`,
      `"${student.grade.replace(/"/g, '""')}"`,
      `"${g.subject.replace(/"/g, '""')}"`,
      b1.toFixed(1).replace(".", ","),
      b2.toFixed(1).replace(".", ","),
      `"${variationSign.replace(".", ",")}"`,
      `"${g.feedback.replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(";"));
  });

  return "\uFEFF" + csvRows.join("\n");
}

/**
 * Generates the occurrences PDF report for a student using jsPDF.
 */
export function generateOccurrencesPDF(student: Estudante, occurrences: Ocorrencia[], schoolName: string, periodLabel: string): jsPDF {
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
    doc.setTextColor(66, 51, 38);
    doc.text(`${schoolName.toUpperCase()} - PORTAL DO RESPONSÁVEL`, 15, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115);
    doc.text("Acompanhamento Pedagógico Diário Integrado", 15, 23);
    doc.text(`Período do Relatório: ${periodLabel}`, 15, 28);

    // Right side details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9);
    doc.text("RELATÓRIO DE DIA-A-DIA", 195, 18, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(115, 115, 115);
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
      `Este relatório é um informativo interno da escola ${schoolName} para acompanhamento da rotina diária dos alunos pelos pais.`,
      15,
      286
    );
    doc.text(
      `${schoolName} • Sistema de Gestão de Convivência Escolar Integrado`,
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
  doc.text(`Nome do Estudante: ${student.name}`, 15, y + 12);
  doc.text(`Série / Turma: ${student.grade}`, 15, y + 17);
  doc.text(`Responsável Cadastrado: ${student.parentName || "Familiar Responsável"}`, 15, y + 22);

  doc.text(`Registros Processados: ${occurrences.length} ocorrência(s)`, 115, y + 12);
  doc.text(`Total Medicamentos Recebidos: ${medsCount} dose(s)`, 115, y + 17);
  const mainMood =
    humorStats.otimo >= humorStats.agitado &&
    humorStats.otimo >= humorStats.triste &&
    humorStats.otimo >= humorStats.cansado
      ? "Radiante / Ótimo 🌟"
      : humorStats.agitado >= humorStats.triste && humorStats.agitado >= humorStats.cansado
      ? "Super Ativo ⚡"
      : humorStats.triste >= humorStats.cansado
      ? "Dengoso / Saudades 🧸"
      : "Cansadinho 💤";
  doc.text(`Clima Emocional Predominante: ${mainMood}`, 115, y + 22);

  y += 32;

  // Statistics block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(66, 51, 38);
  doc.text("RESUMO DE ALIMENTAÇÃO E COMPORTAMENTO DO PERÍODO", 10, y);

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  doc.line(10, y + 2, 200, y + 2);
  y += 8;

  // Stats columns header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text("Almoço Escolar", 12, y);
  doc.text("Lanche da Tarde", 72, y);
  doc.text("Humor & Estado de Espírito", 132, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`• Consumo Excelente: ${excellentLunchCount} dia(s)`, 12, y);
  doc.text(`• Consumo Excelente: ${excellentSnackCount} dia(s)`, 72, y);
  doc.text(`• Radiante / Ótimo: ${humorStats.otimo || 0} dia(s)`, 132, y);

  y += 4;
  doc.text(`• Consumo Parcial: ${partialLunchCount} dia(s)`, 12, y);
  doc.text(`• Consumo Parcial: ${partialSnackCount} dia(s)`, 72, y);
  doc.text(`• Super Ativo: ${humorStats.agitado || 0} dia(s)`, 132, y);

  y += 4;
  doc.text(`• Recusou Refeição: ${refusedLunchCount} dia(s)`, 12, y);
  doc.text(`• Recusou Refeição: ${refusedSnackCount} dia(s)`, 72, y);
  doc.text(`• Dengoso / Saudades: ${humorStats.triste || 0} dia(s)`, 132, y);

  y += 4;
  doc.text("", 12, y);
  doc.text("", 72, y);
  doc.text(`• Cansadinho: ${humorStats.cansado || 0} dia(s)`, 132, y);

  y += 12;

  // Detailed occurrences section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(66, 51, 38);
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
    const notePrefix = "Anotação da Educadora: ";
    const cleanNote = occ.teacherNote.replace(/[\r\n]+/g, " ");
    const noteLines = doc.splitTextToSize(`"${cleanNote}"`, 172);

    // Calculate dynamic height for this occurrence block
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
    let behaviorLabel = "Radiante / Ótimo 🌟";
    if (occ.behaviorState === "agitado") {
      stripeColor = [245, 158, 11]; // Amber
      behaviorLabel = "Super Ativo ⚡";
    } else if (occ.behaviorState === "triste") {
      stripeColor = [99, 102, 241]; // Indigo
      behaviorLabel = "Dengoso / Saudades 🧸";
    } else if (occ.behaviorState === "cansado") {
      stripeColor = [239, 68, 68]; // Red
      behaviorLabel = "Cansadinho 💤";
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
      doc.text(line, 17 + (idx === 0 ? doc.getTextWidth(notePrefix) - 1.5 : 0), y + 3.5 + idx * lineHeight);
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

  return doc;
}

/**
 * Generates occurrences as a CSV string.
 */
export function generateOccurrencesCSV(student: Estudante): string {
  const csvRows: string[] = [];
  // CSV Headers
  csvRows.push([
    "Aluno",
    "Data",
    "Humor",
    "Almoco",
    "Lanche",
    "Refeicao Detalhes",
    "Sono Duracao",
    "Sono Detalhes",
    "Medicamento Recebido",
    "Medicamento Nome",
    "Medicamento Hora",
    "Medicamento Detalhes",
    "Anotacao Educadora"
  ].join(";"));

  student.occurrences.forEach((occ) => {
    const row = [
      `"${student.name.replace(/"/g, '""')}"`,
      `"${occ.date}"`,
      `"${occ.behaviorState}"`,
      `"${occ.meals.lunch}"`,
      `"${occ.meals.snack}"`,
      `"${occ.meals.details.replace(/"/g, '""')}"`,
      `"${occ.sleep.durationStr}"`,
      `"${occ.sleep.details.replace(/"/g, '""')}"`,
      occ.medicated.wasMedicated ? "Sim" : "Nao",
      `"${(occ.medicated.medicationName || "").replace(/"/g, '""')}"`,
      `"${(occ.medicated.doseTime || "").replace(/"/g, '""')}"`,
      `"${occ.medicated.details.replace(/"/g, '""')}"`,
      `"${occ.teacherNote.replace(/[\r\n]+/g, " ").replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(";"));
  });

  return "\uFEFF" + csvRows.join("\n");
}

/**
 * High-performance bulk generator function that bundles all PDFs and CSVs into a single ZIP.
 */
export async function generateBulkExportZip(
  students: Estudante[],
  schoolName: string,
  onProgress?: (index: number, total: number, name: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  const total = students.length;

  for (let i = 0; i < total; i++) {
    const student = students[i];
    const folderName = `${safeFilename(student.grade)}_${safeFilename(student.name)}`;
    const studentFolder = zip.folder(folderName);

    if (studentFolder) {
      if (onProgress) {
        onProgress(i + 1, total, student.name);
      }

      // 1. Performance (Boletim) PDF
      const performancePdf = generatePerformancePDF(student, schoolName);
      const perfPdfBytes = performancePdf.output("arraybuffer");
      const cleanName = safeFilename(student.name);
      studentFolder.file(`boletim_escolar_${cleanName}.pdf`, perfPdfBytes);

      // 2. Performance (Boletim) CSV
      const performanceCsv = generatePerformanceCSV(student);
      studentFolder.file(`boletim_escolar_${cleanName}.csv`, performanceCsv);

      // 3. Occurrences (Dia-a-dia) PDF
      const occurrencesPdf = generateOccurrencesPDF(student, student.occurrences || [], schoolName, "Semestre Atual");
      const occPdfBytes = occurrencesPdf.output("arraybuffer");
      studentFolder.file(`relatorio_dia_dia_${cleanName}.pdf`, occPdfBytes);

      // 4. Occurrences (Dia-a-dia) CSV
      const occurrencesCsv = generateOccurrencesCSV(student);
      studentFolder.file(`relatorio_dia_dia_${cleanName}.csv`, occurrencesCsv);
    }
  }

  return zip.generateAsync({ type: "blob" });
}
