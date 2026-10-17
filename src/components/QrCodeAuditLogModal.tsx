import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { 
  X, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  LogOut, 
  LogIn,
  AlertTriangle,
  FileSpreadsheet,
  BarChart3,
  Download
} from "lucide-react";
import { QrCheckInLog } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from "recharts";

interface QrCodeAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: QrCheckInLog[];
  onClearLogs?: () => void;
  selectedStudentFilter?: string;
  onToggleStatus?: (logId: string, newStatus: "entrada" | "saida") => void;
}

export const QrCodeAuditLogModal: React.FC<QrCodeAuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  selectedStudentFilter,
  onToggleStatus
}) => {
  const [togglingAction, setTogglingAction] = useState<{ id: string; type: "entrada" | "saida" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "entrada" | "saida" | "tentativa_invalida">("all");
  const [methodFilter, setMethodFilter] = useState<"all" | "qr_code" | "manual">("all");
  const [dateFilter, setDateFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [chartTab, setChartTab] = useState<"daily" | "hourly">("daily");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Helper to parse DD/MM/YYYY into a normalized string or date
  const parseLogDateStr = (timestamp: string): string => {
    if (!timestamp) return "";
    const datePart = timestamp.split(" ")[0]; // "DD/MM/YYYY" or "D/M/YYYY"
    if (!datePart.includes("/")) return "";
    const parts = datePart.split("/");
    if (parts.length !== 3) return "";
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${d}/${m}/${y}`;
  };

  // Generate last 7 days in "DD/MM" format and "DD/MM/YYYY" keys
  const chartDataLast7Days = React.useMemo(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      
      const key = `${day}/${month}/${year}`;
      const displayLabel = `${day}/${month}`;
      dates.push({ key, label: displayLabel, checkIns: 0, checkOuts: 0 });
    }
    
    // Fill values from logs
    logs.forEach(log => {
      const logDateNorm = parseLogDateStr(log.timestamp);
      if (!logDateNorm) return;
      
      const matched = dates.find(d => d.key === logDateNorm);
      if (matched) {
        if (log.status === "entrada") {
          matched.checkIns += 1;
        } else if (log.status === "saida") {
          matched.checkOuts += 1;
        }
      }
    });
    
    return dates;
  }, [logs]);

  // Hourly distribution of accesses in the last 7 days
  const chartDataHourly = React.useMemo(() => {
    const hours = Array.from({ length: 13 }, (_, i) => {
      const hr = i + 7; // From 07:00 to 19:00
      const hrStr = String(hr).padStart(2, '0') + ":00";
      return { hourNum: hr, label: hrStr, checkIns: 0, checkOuts: 0 };
    });

    // Helper to check if a log's normalized date is within the last 7 days
    const isWithinLast7Days = (timestamp: string): boolean => {
      const norm = parseLogDateStr(timestamp);
      if (!norm) return false;
      const [day, month, year] = norm.split("/").map(Number);
      const logDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      return logDate >= sevenDaysAgo && logDate <= today;
    };

    logs.forEach(log => {
      if (!isWithinLast7Days(log.timestamp)) return;
      
      if (!log.timestamp) return;
      const parts = log.timestamp.split(" ");
      if (parts.length < 2) return;
      const timePart = parts[1];
      const hourNum = Number(timePart.split(":")[0]);
      
      if (isNaN(hourNum)) return;
      const matched = hours.find(h => h.hourNum === hourNum);
      if (matched) {
        if (log.status === "entrada") {
          matched.checkIns += 1;
        } else if (log.status === "saida") {
          matched.checkOuts += 1;
        }
      }
    });

    return hours;
  }, [logs]);

  // Filter logs in real-time by student name, grade, status, method, specific date, teacher or details
  const filteredLogs = logs.filter(log => {
    const query = searchTerm.toLowerCase().trim();
    
    // Normalize status string for search matching
    const statusText = log.status === "entrada" 
      ? "entrada check-in" 
      : log.status === "saida" 
      ? "saida saída check-out" 
      : "tentativa invalida inválida rejeitado erro falha";

    const methodText = log.method === "qr_code" ? "qr code qrcode" : "manual";

    const matchesSearch = !query || 
      log.studentName.toLowerCase().includes(query) || 
      log.studentGrade.toLowerCase().includes(query) ||
      statusText.includes(query) ||
      methodText.includes(query) ||
      (log.details && log.details.toLowerCase().includes(query)) ||
      (log.teacherName && log.teacherName.toLowerCase().includes(query));

    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesMethod = methodFilter === "all" || log.method === methodFilter;

    // Date specific filter (input YYYY-MM-DD matched against log.timestamp DD/MM/YYYY)
    let matchesDate = true;
    if (dateFilter) {
      const parts = dateFilter.split("-");
      if (parts.length === 3) {
        const [y, m, d] = parts;
        const targetDateStr = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
        const logDateNorm = parseLogDateStr(log.timestamp);
        matchesDate = logDateNorm === targetDateStr;
      }
    }

    // Teacher specific filter
    let matchesTeacher = true;
    if (teacherFilter) {
      const teacherQuery = teacherFilter.toLowerCase().trim();
      const teacherInLog = (log.teacherName || log.details || "").toLowerCase();
      matchesTeacher = teacherInLog.includes(teacherQuery);
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesDate && matchesTeacher;
  });

  const totalEntradas = logs.filter(l => l.status === "entrada").length;
  const totalSaidas = logs.filter(l => l.status === "saida").length;
  const totalErros = logs.filter(l => l.status === "tentativa_invalida").length;

  // Export filtered logs as CSV directly in browser
  const handleExportCSV = (onlyStudentFiltered: boolean = false) => {
    const headers = ["ID", "Estudante", "Série", "Data/Hora", "Status", "Método", "Detalhes / Segurança"];
    
    // Determine logs to export
    let logsToExport = filteredLogs;
    if (onlyStudentFiltered && selectedStudentFilter && selectedStudentFilter !== "todos") {
      logsToExport = logs.filter(log => log.studentName.toLowerCase() === selectedStudentFilter.toLowerCase());
    }

    const rows = logsToExport.map(log => [
      log.id,
      log.studentName,
      log.studentGrade,
      log.timestamp,
      log.status === "entrada" ? "ENTRADA" : log.status === "saida" ? "SAÍDA" : "FALHA / REJEITADO",
      log.method === "qr_code" ? "QR Code" : "Manual",
      log.details || ""
    ]);

    // UTF-8 BOM prefix for proper Portuguese accent support in Excel
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileSuffix = (onlyStudentFiltered && selectedStudentFilter && selectedStudentFilter !== "todos")
      ? `aluno_${selectedStudentFilter.toLowerCase().replace(/\s+/g, "_")}`
      : "filtrado";
    link.setAttribute("download", `audit_log_portaria_${fileSuffix}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export filtered logs as PDF directly in browser using jsPDF
  const handleExportPDF = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const logsToExport = filteredLogs;
      const totalCount = logsToExport.length;
      const entradasCount = logsToExport.filter(l => l.status === "entrada").length;
      const saidasCount = logsToExport.filter(l => l.status === "saida").length;
      const errosCount = logsToExport.filter(l => l.status === "tentativa_invalida").length;

      let y = 38;

      const addHeader = (pageNum: number, totalPages: number) => {
        // Header Banner Background
        doc.setFillColor(15, 23, 42); // dark slate #0f172a
        doc.rect(10, 10, 190, 22, "F");

        doc.setDrawColor(245, 158, 11); // Amber accent line
        doc.setLineWidth(0.8);
        doc.line(10, 32, 200, 32);

        // Header Text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text("ESCOLA MÁGICA DE OZ • AUDITORIA DE PORTARIA", 15, 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(203, 213, 225); // Slate 300
        doc.text(`Relatório de Acessos e Passagens por QR Code`, 15, 24);
        doc.text(`Filtros: ${statusFilter !== "all" ? `Status: ${statusFilter.toUpperCase()} | ` : ""}${searchTerm ? `Busca: "${searchTerm}" | ` : ""}Total: ${totalCount} registro(s)`, 15, 28);

        // Right side
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(245, 158, 11);
        doc.text("LOG DE AUDITORIA", 195, 18, { align: "right" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(203, 213, 225);
        doc.text(`Emissão: ${new Date().toLocaleString("pt-BR")}`, 195, 23, { align: "right" });
        doc.text(`Página ${pageNum} de ${totalPages}`, 195, 28, { align: "right" });
      };

      const addFooter = () => {
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.2);
        doc.line(10, 282, 200, 282);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(
          "Documento oficial de auditoria emitido pelo Módulo de Segurança e Portaria Integrada. Rastreabilidade ativa.",
          15,
          286
        );
        doc.text(
          "Colégio Integrado • Registro de Entradas e Saídas em Tempo Real",
          15,
          290
        );
      };

      // Summary Card Block
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(10, y, 190, 18, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("RESUMO DOS REGISTROS EXIBIDOS:", 14, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Total: ${totalCount}`, 14, y + 12);
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text(`Entradas: ${entradasCount}`, 60, y + 12);
      doc.setTextColor(59, 130, 246); // Blue
      doc.text(`Saídas: ${saidasCount}`, 105, y + 12);
      doc.setTextColor(225, 29, 72); // Rose
      doc.text(`Rejeitados/Erros: ${errosCount}`, 145, y + 12);

      y += 24;

      // Table Header
      const drawTableHeader = (curY: number) => {
        doc.setFillColor(30, 41, 59); // Slate 800
        doc.rect(10, curY, 190, 7, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text("ESTUDANTE / SÉRIE", 14, curY + 4.8);
        doc.text("DATA & HORA", 70, curY + 4.8);
        doc.text("OPERAÇÃO", 108, curY + 4.8);
        doc.text("MÉTODO", 138, curY + 4.8);
        doc.text("DETALHES / SEGURANÇA", 160, curY + 4.8);
      };

      drawTableHeader(y);
      y += 7;

      if (logsToExport.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Nenhum registro encontrado para os filtros selecionados.", 14, y + 8);
      } else {
        logsToExport.forEach((log, index) => {
          const rowHeight = 7.5;
          if (y + rowHeight > 275) {
            doc.addPage();
            y = 38;
            drawTableHeader(y);
            y += 7;
          }

          // Alternating background
          if (index % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(10, y, 190, rowHeight, "F");
          }

          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.15);
          doc.line(10, y + rowHeight, 200, y + rowHeight);

          // Student Name & Grade
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          const nameClean = log.studentName.length > 25 ? log.studentName.substring(0, 23) + ".." : log.studentName;
          doc.text(nameClean, 14, y + 4.5);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          const gradeClean = log.studentGrade ? `(${log.studentGrade})` : "";
          doc.text(gradeClean, 14 + doc.getTextWidth(nameClean) + 1.5, y + 4.5);

          // Timestamp
          doc.setFont("courier", "normal");
          doc.setFontSize(7);
          doc.setTextColor(71, 85, 105);
          doc.text(log.timestamp || "-", 70, y + 4.5);

          // Status
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          if (log.status === "entrada") {
            doc.setTextColor(16, 185, 129);
            doc.text("✓ ENTRADA", 108, y + 4.5);
          } else if (log.status === "saida") {
            doc.setTextColor(59, 130, 246);
            doc.text("➔ SAÍDA", 108, y + 4.5);
          } else {
            doc.setTextColor(225, 29, 72);
            doc.text("✕ REJEITADO", 108, y + 4.5);
          }

          // Method
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7);
          doc.setTextColor(71, 85, 105);
          doc.text(log.method === "qr_code" ? "QR Code" : "Manual", 138, y + 4.5);

          // Details
          doc.setFont("helvetica", "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(100, 116, 139);
          const detailsClean = log.details ? (log.details.length > 30 ? log.details.substring(0, 28) + ".." : log.details) : "-";
          doc.text(detailsClean, 160, y + 4.5);

          y += rowHeight;
        });
      }

      // Headers & Footers across pages
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addHeader(i, totalPages);
        addFooter();
      }

      const fileDate = new Date().toISOString().slice(0, 10);
      doc.save(`audit_log_portaria_filtrado_${fileDate}.pdf`);
    } catch (err) {
      console.error("Erro na geração do PDF de auditoria:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-y-auto" id="qr-audit-log-modal">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, y: 14, scale: 0.985, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, scale: 0.985, filter: "blur(4px)" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 bg-[#fdfcf7] dark:bg-slate-900 border border-amber-250/30 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-750/95 to-indigo-800/95 dark:from-slate-950 dark:to-slate-900 border-b border-amber-100/10 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-amber-300 font-mono block">Módulo de Auditoria e Segurança</span>
            <h2 className="text-xl font-serif font-black flex items-center gap-2">
              <span>🔍 Histórico Geral de Portaria (QR Code & Acessos)</span>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-850">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-500 font-mono block">TOTAL DE REGISTROS</span>
            <strong className="text-2xl font-sans font-black text-slate-800 dark:text-slate-100 block mt-0.5">{logs.length}</strong>
            <span className="text-[10px] text-slate-400 block mt-0.5">Auditorias ativas na sessão</span>
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 font-mono block">ENTRADAS</span>
            <strong className="text-2xl font-sans font-black text-emerald-700 dark:text-emerald-300 block mt-0.5">{totalEntradas}</strong>
            <span className="text-[10px] text-emerald-500/80 block mt-0.5">Estudantes em sala de aula</span>
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400 font-mono block">SAÍDAS</span>
            <strong className="text-2xl font-sans font-black text-blue-700 dark:text-blue-300 block mt-0.5">{totalSaidas}</strong>
            <span className="text-[10px] text-blue-500/80 block mt-0.5">Estudantes liberados</span>
          </div>

          <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-3.5 shadow-2xs">
            <span className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 font-mono block">FALHAS / NEGADOS</span>
            <strong className="text-2xl font-sans font-black text-rose-700 dark:text-rose-300 block mt-0.5">{totalErros}</strong>
            <span className="text-[10px] text-rose-500/80 block mt-0.5">Tentativas inválidas</span>
          </div>
        </div>

        {/* Visual Analytics Section */}
        <div className="mx-6 mt-4 p-4 bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-indigo-550/10 text-indigo-600 dark:text-indigo-400">
                <BarChart3 className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                  Distribuição de Acessos (Últimos 7 Dias)
                </h4>
                <p className="text-[9px] text-slate-400">
                  Análise temporal de picos de entradas e saídas de alunos
                </p>
              </div>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200/40 dark:border-slate-800/40 text-[9px] font-black font-mono">
              <button
                onClick={() => setChartTab("daily")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  chartTab === "daily"
                    ? "bg-white dark:bg-slate-850 text-indigo-650 dark:text-indigo-400 shadow-3xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                POR DIA
              </button>
              <button
                onClick={() => setChartTab("hourly")}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  chartTab === "hourly"
                    ? "bg-white dark:bg-slate-850 text-indigo-650 dark:text-indigo-400 shadow-3xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                POR HORÁRIO
              </button>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-[140px] w-full text-slate-600 dark:text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartTab === "daily" ? chartDataLast7Days : chartDataHourly}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.6, fontSize: 8, fontFamily: "monospace" }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.6, fontSize: 8 }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "8px",
                    fontSize: "10px",
                    color: "#fff"
                  }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ fontWeight: "bold", color: "#cbd5e1", fontSize: "9px" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "9px" }} />
                <Bar dataKey="checkIns" name="Check-ins (Entradas)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="checkOuts" name="Check-outs (Saídas)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Real-time Search Input */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  id="qr-audit-log-search-input"
                  type="text"
                  placeholder="Buscar por nome, série, status (entrada, saída, erro)..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Limpar busca"
                    aria-label="Limpar campo de busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Selector */}
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    statusFilter === "all" 
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-850"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter("entrada")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    statusFilter === "entrada" 
                      ? "bg-emerald-650 text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-850"
                  }`}
                >
                  Entradas
                </button>
                <button
                  onClick={() => setStatusFilter("saida")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    statusFilter === "saida" 
                      ? "bg-blue-650 text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-850"
                  }`}
                >
                  Saídas
                </button>
                <button
                  onClick={() => setStatusFilter("tentativa_invalida")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    statusFilter === "tentativa_invalida" 
                      ? "bg-rose-650 text-white shadow-xs" 
                      : "text-slate-500 hover:text-slate-850"
                  }`}
                >
                  Erros
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Export CSV Button */}
              <button
                onClick={() => handleExportCSV(false)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-xs active:scale-97 cursor-pointer"
                title={`Exportar ${filteredLogs.length} registro(s) exibido(s) em planilha CSV`}
                id="btn-export-csv-audit"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar CSV ({filteredLogs.length})</span>
              </button>

              {/* Export PDF Button */}
              <button
                onClick={handleExportPDF}
                disabled={isGeneratingPdf}
                className={`flex items-center gap-1.5 font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-xs active:scale-97 cursor-pointer text-white ${
                  isGeneratingPdf
                    ? "bg-amber-600/70 cursor-wait"
                    : "bg-amber-600 hover:bg-amber-700 active:scale-97"
                }`}
                title={`Exportar ${filteredLogs.length} registro(s) exibido(s) em documento PDF formatado`}
                id="btn-export-pdf-audit"
              >
                {isGeneratingPdf ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gerando PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Exportar PDF</span>
                  </>
                )}
              </button>

              {/* Student Specific Filtered CSV Button if student is selected */}
              {selectedStudentFilter && selectedStudentFilter !== "todos" && (
                <button
                  onClick={() => handleExportCSV(true)}
                  className="flex items-center gap-1.5 font-bold py-2 px-3 rounded-xl text-xs transition-all shadow-xs active:scale-97 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500"
                  title={`Exportar CSV exclusivamente para ${selectedStudentFilter}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV ({selectedStudentFilter.split(" ")[0]})</span>
                </button>
              )}
              
              {onClearLogs && (
                <button
                  onClick={() => {
                    if (confirm("Deseja realmente limpar o histórico local de auditorias de portaria?")) {
                      onClearLogs();
                    }
                  }}
                  className="flex items-center gap-1.5 bg-slate-150 hover:bg-rose-50 text-slate-600 hover:text-rose-650 border border-slate-200 dark:border-slate-850 font-bold py-2 px-3 rounded-xl text-xs transition-all cursor-pointer"
                  title="Limpar logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          {/* SECONDARY ROW: SPECIFIC DATE AND TEACHER FILTERS */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-150/60 dark:border-slate-850">
            {/* Specific Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono uppercase">
                Data Específica:
              </span>
              <input
                id="qr-audit-date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
              />
              {dateFilter && (
                <button
                  type="button"
                  onClick={() => setDateFilter("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  title="Limpar filtro de data"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Teacher Name Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-850 flex-1 min-w-[200px]">
              <Filter className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono uppercase shrink-0">
                Professor / Responsável:
              </span>
              <input
                id="qr-audit-teacher-filter"
                type="text"
                placeholder="Ex: Profª Helena Ramos, Prof. Carlos..."
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              {teacherFilter && (
                <button
                  type="button"
                  onClick={() => setTeacherFilter("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer shrink-0"
                  title="Limpar filtro de professor"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Active Filters Summary & Reset */}
            {(dateFilter || teacherFilter || searchTerm || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter("");
                  setTeacherFilter("");
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 cursor-pointer flex items-center gap-1"
              >
                <span>Resetar Filtros</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 italic text-xs space-y-2">
              <div>Nenhum registro de acesso corresponde aos filtros aplicados.</div>
              {(dateFilter || teacherFilter) && (
                <div className="text-[11px] text-slate-500 font-mono">
                  Filtros ativos: {dateFilter ? `Data: ${dateFilter}` : ""} {teacherFilter ? `Professor: ${teacherFilter}` : ""}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-slate-200/60 dark:border-slate-850 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-950 text-slate-550 dark:text-slate-400 font-bold border-b border-slate-200/60 dark:border-slate-850">
                    <th className="p-3.5">Estudante</th>
                    <th className="p-3.5">Data & Hora</th>
                    <th className="p-3.5">Professor / Turno</th>
                    <th className="p-3.5">Operação</th>
                    <th className="p-3.5">Método</th>
                    <th className="p-3.5">Detalhes / Detecção de Segurança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {filteredLogs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-amber-50/10 dark:hover:bg-slate-850/40 transition-colors bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                    >
                      {/* Student info */}
                      <td className="p-3.5 flex items-center gap-2.5">
                        <img 
                          src={log.avatar} 
                          alt="Avatar" 
                          className="w-8 h-8 rounded-full border border-slate-200" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <strong className="text-slate-800 dark:text-slate-100 block font-bold leading-tight">{log.studentName}</strong>
                          <span className="text-[10px] text-slate-450 dark:text-slate-500 block mt-0.5">{log.studentGrade}</span>
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono font-medium whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      {/* Teacher / Shift Column */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                            {log.teacherName || "Prof. Plantonista / Inspetor"}
                          </span>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 inline-block">
                            {log.shift === "manha" ? "Turno Manhã" : log.shift === "tarde" ? "Turno Tarde" : "Turno Integral"}
                          </span>
                        </div>
                      </td>

                      {/* Operation Status - Interactive Check-in / Check-out Toggle with Smooth Scaling */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.92 }}
                            animate={
                              togglingAction?.id === log.id && togglingAction?.type === "entrada"
                                ? { scale: [1, 1.2, 0.96, 1], transition: { duration: 0.38, ease: "easeOut" } }
                                : { scale: 1 }
                            }
                            transition={{ type: "spring", stiffness: 450, damping: 22 }}
                            onClick={() => {
                              setTogglingAction({ id: log.id, type: "entrada" });
                              setTimeout(() => setTogglingAction(null), 450);
                              if (onToggleStatus) onToggleStatus(log.id, "entrada");
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors cursor-pointer border ${
                              log.status === "entrada"
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 shadow-2xs ring-1 ring-emerald-500/20"
                                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 border-slate-200 dark:border-slate-700"
                            }`}
                            title="Alternar para Entrada"
                          >
                            <CheckCircle2 className={`w-3 h-3 ${log.status === "entrada" ? "text-emerald-550" : "text-slate-400"} shrink-0`} />
                            <span>Entrada</span>
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.92 }}
                            animate={
                              togglingAction?.id === log.id && togglingAction?.type === "saida"
                                ? { scale: [1, 1.2, 0.96, 1], transition: { duration: 0.38, ease: "easeOut" } }
                                : { scale: 1 }
                            }
                            transition={{ type: "spring", stiffness: 450, damping: 22 }}
                            onClick={() => {
                              setTogglingAction({ id: log.id, type: "saida" });
                              setTimeout(() => setTogglingAction(null), 450);
                              if (onToggleStatus) onToggleStatus(log.id, "saida");
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-colors cursor-pointer border ${
                              log.status === "saida"
                                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-2xs ring-1 ring-blue-500/20"
                                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 border-slate-200 dark:border-slate-700"
                            }`}
                            title="Alternar para Saída"
                          >
                            <LogOut className={`w-3 h-3 ${log.status === "saida" ? "text-blue-550" : "text-slate-400"} shrink-0`} />
                            <span>Saída</span>
                          </motion.button>

                          {log.status === "tentativa_invalida" && (
                            <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase">
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-550" />
                              <span>Erro</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Method */}
                      <td className="p-3.5 font-semibold text-[11px]">
                        {log.method === "qr_code" ? (
                          <span className="text-indigo-650 dark:text-indigo-400">📲 QR Code</span>
                        ) : (
                          <span className="text-slate-500">🖥️ Manual</span>
                        )}
                      </td>

                      {/* Details */}
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 leading-normal max-w-xs truncate" title={log.details}>
                        {log.details || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-150 dark:border-slate-850 flex items-center justify-between">
          <p className="text-[10px] text-slate-450 dark:text-slate-500">
            Selo de Conformidade Digital • Protocolo de Encriptação & Auditoria
          </p>
          <button 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-5 rounded-xl text-xs transition-all cursor-pointer"
          >
            Fechar Auditoria
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};
