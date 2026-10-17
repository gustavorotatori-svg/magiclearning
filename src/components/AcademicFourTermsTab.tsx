import React, { useState } from "react";
import { motion } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Award,
  Sparkles,
  Info,
  ChevronRight,
  Download,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  Activity,
  ArrowLeft
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import { Estudante, SchoolBranding } from "../types";

interface AcademicFourTermsTabProps {
  activeStudent: Estudante;
  masteryThreshold: number;
  branding: SchoolBranding;
  onBack?: () => void;
}

// Custom pulsing dot for the Natural Trend likely landing points
const RenderProjectedDot = (props: any) => {
  const { cx, cy, index, stroke } = props;
  if (typeof cx !== "number" || typeof cy !== "number" || index !== 3) return null;
  return (
    <g key={`proj-dot-${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={10} fill={stroke} fillOpacity={0.2} className="animate-pulse" />
      <circle cx={cx} cy={cy} r={7} fill={stroke} fillOpacity={0.4} className="animate-ping" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      <circle cx={cx} cy={cy} r={5} fill={stroke} stroke="#ffffff" strokeWidth={1.5} />
    </g>
  );
};

// Custom premium activeDot for highlights on hover
const RenderActiveDot = (props: any) => {
  const { cx, cy, stroke } = props;
  if (typeof cx !== "number" || typeof cy !== "number") return null;
  return (
    <g key={`active-dot-${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={12} fill={stroke} fillOpacity={0.15} className="animate-pulse" />
      <circle cx={cx} cy={cy} r={8} fill={stroke} fillOpacity={0.3} className="animate-ping" style={{ transformOrigin: `${cx}px ${cy}px` }} />
      <circle cx={cx} cy={cy} r={6} fill={stroke} stroke="#ffffff" strokeWidth={2} />
    </g>
  );
};

export function AcademicFourTermsTab({
  activeStudent,
  masteryThreshold,
  branding,
  onBack,
}: AcademicFourTermsTabProps) {
  const subjects = activeStudent.grades;
  const totalSubjects = subjects.length;

  // Calculate Natural Trend for all subjects
  // Formula: slope = B2 - B1.
  // Projections: B3 = clamp(B2 + slope), B4 = clamp(B3 + slope).
  const calculateNaturalTrendForSubject = (g: any) => {
    const slope = g.secondBimester - g.firstBimester;
    const thirdNatural = Math.max(1, Math.min(10, Math.round((g.secondBimester + slope) * 10) / 10));
    const fourthNatural = Math.max(1, Math.min(10, Math.round((thirdNatural + slope) * 10) / 10));
    const annualNaturalAvg = (g.firstBimester + g.secondBimester + thirdNatural + fourthNatural) / 4;
    return {
      slope,
      thirdNatural,
      fourthNatural,
      annualNaturalAvg,
    };
  };

  // Initialize simulated third and fourth bimester grades for each subject
  const [projectedGrades, setProjectedGrades] = useState<Record<string, { third: number; fourth: number }>>(() => {
    const initial: Record<string, { third: number; fourth: number }> = {};
    activeStudent.grades.forEach((g) => {
      // Default simulated values to natural trend values so the UI starts with realistic, data-informed projections!
      const trend = calculateNaturalTrendForSubject(g);
      initial[g.subject] = {
        third: trend.thirdNatural,
        fourth: trend.fourthNatural,
      };
    });
    return initial;
  });

  const handleSliderChange = (subject: string, field: "third" | "fourth", val: number) => {
    setProjectedGrades((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: parseFloat(val.toFixed(1)),
      },
    }));
  };

  const handleResetSimulations = () => {
    const reset: Record<string, { third: number; fourth: number }> = {};
    activeStudent.grades.forEach((g) => {
      // Set to static baseline
      reset[g.subject] = {
        third: Math.min(10, Math.round(g.secondBimester * 10) / 10),
        fourth: Math.min(10, Math.round(Math.min(10, g.secondBimester + 0.3) * 10) / 10),
      };
    });
    setProjectedGrades(reset);
  };

  const handleApplyNaturalTrend = () => {
    const trendConfig: Record<string, { third: number; fourth: number }> = {};
    activeStudent.grades.forEach((g) => {
      const trend = calculateNaturalTrendForSubject(g);
      trendConfig[g.subject] = {
        third: trend.thirdNatural,
        fourth: trend.fourthNatural,
      };
    });
    setProjectedGrades(trendConfig);
  };

  // Calculate projected averages per subject (Interactive manual simulation)
  const subjectAverages = subjects.map((g) => {
    const b1 = g.firstBimester;
    const b2 = g.secondBimester;
    const b3 = projectedGrades[g.subject]?.third ?? g.secondBimester;
    const b4 = projectedGrades[g.subject]?.fourth ?? Math.min(10, g.secondBimester + 0.3);
    const avg = (b1 + b2 + b3 + b4) / 4;
    return {
      subject: g.subject,
      b1,
      b2,
      b3,
      b4,
      avg,
    };
  });

  // Calculate natural averages (No-intervention projection)
  const naturalSubjectAverages = subjects.map((g) => {
    const trend = calculateNaturalTrendForSubject(g);
    return {
      subject: g.subject,
      b1: g.firstBimester,
      b2: g.secondBimester,
      b3: trend.thirdNatural,
      b4: trend.fourthNatural,
      avg: trend.annualNaturalAvg,
      slope: trend.slope,
    };
  });

  // Calculate overall projected annual average
  const totalProjectedAverage =
    subjectAverages.reduce((sum, item) => sum + item.avg, 0) / (totalSubjects || 1);

  // Calculate overall natural annual average
  const totalNaturalAverage =
    naturalSubjectAverages.reduce((sum, item) => sum + item.avg, 0) / (totalSubjects || 1);

  const reachesMasteryProjected = totalProjectedAverage >= masteryThreshold;
  const reachesMasteryNatural = totalNaturalAverage >= masteryThreshold;

  // Recharts formatted chart data including BOTH simulated & natural trend series
  const chartData = [
    {
      name: "1º Bimestre",
      ...subjects.reduce((acc, curr) => {
        acc[curr.subject] = curr.firstBimester;
        // Natural trend starts projecting from 2nd term onwards, so we keep 1st term empty for natural lines
        return acc;
      }, {} as any),
    },
    {
      name: "2º Bimestre",
      ...subjects.reduce((acc, curr) => {
        acc[curr.subject] = curr.secondBimester;
        acc[`${curr.subject}_natural`] = curr.secondBimester; // connect trend line from real 2nd term grade
        return acc;
      }, {} as any),
    },
    {
      name: "3º Bimestre",
      ...subjects.reduce((acc, curr) => {
        const proj = projectedGrades[curr.subject] || { third: curr.secondBimester, fourth: curr.secondBimester };
        acc[curr.subject] = proj.third;
        const trend = calculateNaturalTrendForSubject(curr);
        acc[`${curr.subject}_natural`] = trend.thirdNatural;
        return acc;
      }, {} as any),
    },
    {
      name: "4º Bimestre",
      ...subjects.reduce((acc, curr) => {
        const proj = projectedGrades[curr.subject] || { third: curr.secondBimester, fourth: curr.secondBimester };
        acc[curr.subject] = proj.fourth;
        const trend = calculateNaturalTrendForSubject(curr);
        acc[`${curr.subject}_natural`] = trend.fourthNatural;
        return acc;
      }, {} as any),
    },
  ];

  const subjectColors = ["#047857", "#b45309", "#415a77", "#be123c", "#5c4033", "#6b21a8", "#0369a1"];

  // Download simulation data as JSON
  const handleExportSim = () => {
    const dataToExport = {
      studentName: activeStudent.name,
      studentId: activeStudent.id,
      grade: activeStudent.grade,
      simulationTimestamp: new Date().toISOString(),
      masteryThreshold,
      overallProjectedAverage: parseFloat(totalProjectedAverage.toFixed(2)),
      overallNaturalAverage: parseFloat(totalNaturalAverage.toFixed(2)),
      reachesMasteryProjected,
      reachesMasteryNatural,
      performanceData: subjects.map((g) => {
        const trend = calculateNaturalTrendForSubject(g);
        const sim = projectedGrades[g.subject] || { third: g.secondBimester, fourth: g.secondBimester + 0.3 };
        const simAvg = (g.firstBimester + g.secondBimester + sim.third + sim.fourth) / 4;
        return {
          subject: g.subject,
          historical: { term1: g.firstBimester, term2: g.secondBimester },
          naturalTrendProjection: {
            term3: trend.thirdNatural,
            term4: trend.fourthNatural,
            projectedAnnualAverage: parseFloat(trend.annualNaturalAvg.toFixed(2)),
            reachesMastery: trend.annualNaturalAvg >= masteryThreshold,
          },
          userSimulation: {
            term3: sim.third,
            term4: sim.fourth,
            simulatedAnnualAverage: parseFloat(simAvg.toFixed(2)),
            reachesMastery: simAvg >= masteryThreshold,
          }
        };
      }),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `projeccao_diagnostico_4termos_${activeStudent.name.toLowerCase().replace(/\s+/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" id="four-terms-mastery-tab">
      
      {onBack && (
        <div className="flex items-center justify-between pb-2">
          <button
            onClick={onBack}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Voltar ao Boletim Acadêmico"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        </div>
      )}
      
      {/* Comparative Overview Card: Simulated vs. Natural Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Natural Trend Projection */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/60 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Activity className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-black uppercase tracking-wider font-mono">Tendência Natural</span>
            </div>
            <h4 className="text-xs font-serif font-black text-slate-800 dark:text-slate-200">Projeção Sem Intervenção</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Baseado exclusivamente no rendimento do 1º e 2º bimestre ({activeStudent.name.split(" ")[0]} mantém ritmo linear atual).
            </p>
          </div>
          <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 mt-3 flex items-baseline justify-between">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-slate-400">MÉDIA ANUAL NATURAL</span>
              <strong className="text-lg font-mono font-black text-slate-700 dark:text-slate-300">
                {totalNaturalAverage.toFixed(2)}
              </strong>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              reachesMasteryNatural 
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400" 
                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}>
              {reachesMasteryNatural ? "🏆 Alça Maestria" : "📈 Sem Maestria"}
            </span>
          </div>
        </div>

        {/* User Simulated Plan */}
        <div className={`col-span-1 lg:col-span-2 p-4.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
          reachesMasteryProjected
            ? "bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white dark:from-emerald-950/20 dark:to-teal-950/10 border-emerald-300 dark:border-emerald-900"
            : "bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white dark:from-amber-950/20 dark:to-orange-950/10 border-amber-250 dark:border-amber-900"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                {reachesMasteryProjected ? (
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-amber-600 animate-pulse" />
                )}
                <span className="text-[10px] font-black uppercase tracking-wider font-mono">Meta Simulada Manual</span>
              </div>
              <h4 className="text-xs font-serif font-black text-slate-850 dark:text-white">
                {reachesMasteryProjected 
                  ? "🎉 Plano de Excelência Definido"
                  : "🎯 Desenhando a Rota para o Sucesso"
                }
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal font-light">
                {reachesMasteryProjected
                  ? `Com esta simulação, o rendimento geral alcançará ${totalProjectedAverage.toFixed(2)}, conquistando com louvor o selo de Maestria (meta ≥ ${masteryThreshold.toFixed(1)}).`
                  : `Seu plano atual resulta em ${totalProjectedAverage.toFixed(2)}. Arraste os seletores abaixo ou clique em "Sincronizar Tendência" para ajustar as metas pedagógicas.`
                }
              </p>
            </div>
            
            <div className="text-right shrink-0 mt-2 sm:mt-0 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end border-t sm:border-t-0 border-slate-200/40 pt-2 sm:pt-0">
              <span className="text-[8px] font-mono text-slate-450 dark:text-slate-500 uppercase block">MÉDIA ANUAL PROJETADA</span>
              <strong className={`text-2xl font-mono font-black ${reachesMasteryProjected ? "text-emerald-600 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"}`}>
                {totalProjectedAverage.toFixed(2)}
              </strong>
              <span className="text-[9px] text-slate-400 block font-sans">Meta Geral: ≥ {masteryThreshold.toFixed(1)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Chart Card */}
      <div className="bg-[#fcfaf3] dark:bg-slate-950 border border-amber-200/70 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-black text-[#423326] dark:text-amber-100 uppercase font-serif tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
              <span>Trajetória Acadêmica Comparativa (4 Termos)</span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Linha Contínua: <strong className="text-slate-700 dark:text-slate-200">Plano Simulado</strong> • Linha Tracejada: <strong className="text-slate-700 dark:text-slate-200">Tendência Natural</strong> com <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 align-middle ml-0.5 animate-pulse" /> ponto de chegada provável.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleApplyNaturalTrend}
              className="px-2.5 py-1 text-[9px] font-bold text-amber-900 bg-amber-100/40 hover:bg-amber-100/80 dark:text-amber-300 dark:bg-slate-900 dark:hover:bg-slate-855 border border-amber-200/60 dark:border-slate-800 rounded-lg transition-all cursor-pointer"
              title="Carregar a tendência natural do aluno no simulador"
            >
              📊 Sincronizar Tendência
            </button>
            <button
              onClick={handleResetSimulations}
              className="px-2.5 py-1 text-[9px] font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:shadow-3xs transition-all cursor-pointer"
              title="Restaurar valores de simulação básicos"
            >
              🔄 Limpar Simulação
            </button>
            <button
              onClick={handleExportSim}
              className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100/30 dark:hover:bg-slate-850 border border-amber-200/60 dark:border-slate-800 rounded-lg transition-all cursor-pointer"
              title="Exportar plano e diagnóstico completo em JSON"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Exportar Diagnóstico</span>
            </button>
          </div>
        </div>

        {/* RECHARTS CHART with DASHED Mastery Threshold Reference Line */}
        <div className="h-[310px] w-full pt-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 12, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6d2" />
              
              {/* Dashed Target reference line representing Mastery Threshold */}
              <ReferenceLine
                y={masteryThreshold}
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: `Meta de Maestria (${masteryThreshold.toFixed(1)}) 🏆`,
                  position: "insideBottomLeft",
                  fill: "#b45309",
                  fontSize: 10,
                  fontWeight: "black",
                  offset: 8
                }}
              />

              <XAxis dataKey="name" stroke="#5c4a3b" style={{ fontSize: "10px", fontWeight: "bold" }} />
              <YAxis domain={[5, 10]} stroke="#5c4a3b" style={{ fontSize: "10px", fontWeight: "bold" }} />
              
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const bimesters = ["1º Bimestre", "2º Bimestre", "3º Bimestre", "4º Bimestre"];
                    const currentIdx = bimesters.indexOf(label);
                    const prevLabel = currentIdx > 0 ? bimesters[currentIdx - 1] : null;
                    const prevData = prevLabel ? chartData.find(d => d.name === prevLabel) : null;
                    const firstBimesterData = chartData.find(d => d.name === "1º Bimestre");

                    return (
                      <div className="bg-[#fffdf9] dark:bg-slate-900 border-2 border-amber-500 rounded-2xl p-4 shadow-xl w-80 space-y-3 text-slate-800 dark:text-slate-100 z-50">
                        <div className="border-b border-amber-100 dark:border-slate-800 pb-2.5 flex justify-between items-center">
                          <span className="font-serif font-black text-xs text-[#3e2e28] dark:text-amber-100 uppercase tracking-wider">{label}</span>
                          <span className="text-[7.5px] px-2 py-0.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold rounded-full font-mono uppercase tracking-wider">
                            Métricas de Evolução
                          </span>
                        </div>
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {payload.map((p: any) => {
                            const val = Number(p.value);
                            const meetsMastery = val >= masteryThreshold;
                            const isNaturalTrend = p.dataKey.endsWith("_natural");
                            const cleanName = p.name.replace(" (Tendência)", "");
                            
                            // Growth compared to previous bimester
                            const prevVal = prevData ? Number(prevData[p.dataKey]) : undefined;
                            const growthDelta = prevVal !== undefined ? (val - prevVal) : undefined;

                            // Cumulative growth since 1º Bimestre
                            const baselineVal = firstBimesterData ? Number(firstBimesterData[p.dataKey]) : undefined;
                            const cumulativeGrowth = (baselineVal !== undefined && label !== "1º Bimestre") ? (val - baselineVal) : undefined;

                            return (
                              <div key={p.dataKey} className="border-b border-amber-50/50 dark:border-slate-800/40 pb-2.5 last:border-0 last:pb-0 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <div className="flex items-center gap-1.5 truncate max-w-[210px]">
                                    <span className="w-2 h-2 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: p.color }} />
                                    <span className="font-extrabold text-[#3e2e28] dark:text-amber-50 truncate">
                                      {cleanName}
                                    </span>
                                    <span className="text-[7.5px] text-slate-400 dark:text-slate-500 font-black font-mono shrink-0">
                                      {isNaturalTrend ? "📈 PROVÁVEL" : "🎯 SIMULADO"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 font-mono">
                                    <strong className={`text-xs ${isNaturalTrend ? "text-rose-600 dark:text-rose-450 font-black" : "text-slate-900 dark:text-white font-black"}`}>
                                      {val.toFixed(1)}
                                    </strong>
                                    <span className="text-[9px]" title={meetsMastery ? "Atinge meta de maestria!" : "Abaixo da meta"}>
                                      {meetsMastery ? "🏆" : "⚡"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pl-3.5 text-[9px] font-mono">
                                  {growthDelta !== undefined && (
                                    <span className={`inline-flex items-center gap-0.5 font-bold ${
                                      growthDelta > 0 
                                        ? "text-emerald-600 dark:text-emerald-400" 
                                        : growthDelta < 0 
                                          ? "text-rose-600 dark:text-rose-450" 
                                          : "text-slate-400"
                                    }`}>
                                      {growthDelta > 0 ? "▲" : growthDelta < 0 ? "▼" : "─"} 
                                      {growthDelta > 0 ? `+${growthDelta.toFixed(1)}` : growthDelta.toFixed(1)}
                                    </span>
                                  )}

                                  {cumulativeGrowth !== undefined && cumulativeGrowth !== 0 && (
                                    <span className="inline-flex items-center gap-0.5 font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1 rounded-sm">
                                      Evol: {cumulativeGrowth > 0 ? `+${cumulativeGrowth.toFixed(1)}` : cumulativeGrowth.toFixed(1)} 🚀
                                    </span>
                                  )}

                                  <span className="text-slate-405 dark:text-slate-500">
                                    Meta: {(val - masteryThreshold) >= 0 ? `+${(val - masteryThreshold).toFixed(1)}` : `${(val - masteryThreshold).toFixed(1)}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              <Legend 
                verticalAlign="bottom" 
                height={32} 
                iconType="circle"
                wrapperStyle={{ fontSize: "10px", color: "#3e2e28", paddingTop: "8px" }}
              />

              {/* Render Lines for each subject */}
              {subjects.map((g, idx) => {
                const color = subjectColors[idx % subjectColors.length];
                const simVal = projectedGrades[g.subject]?.third || 0; // to force re-render when slider changes
                return (
                  <React.Fragment key={g.subject}>
                    {/* 1. SOLID LINE: Simulated projection / Interactive */}
                    <Line
                      key={`${g.subject}-sim-${simVal}`}
                      type="monotone"
                      dataKey={g.subject}
                      name={g.subject.split(" (")[0]}
                      stroke={color}
                      strokeWidth={3}
                      activeDot={<RenderActiveDot />}
                      dot={{ strokeWidth: 2, r: 4 }}
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />

                    {/* 2. DASHED LINE: Natural trend performance trajectory (Likely path) */}
                    <Line
                      key={`${g.subject}-natural`}
                      type="monotone"
                      dataKey={`${g.subject}_natural`}
                      name={`${g.subject.split(" (")[0]} (Tendência)`}
                      stroke={color}
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      opacity={0.45}
                      connectNulls={true}
                      dot={<RenderProjectedDot />}
                      activeDot={<RenderActiveDot />}
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                  </React.Fragment>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Sliders & Trend Diagnostics Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Sliders Panel */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-slate-850 rounded-2xl p-5 space-y-4 shadow-3xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-[#423326] dark:text-amber-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Lightbulb className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
                <span>Simulador Interativo de Metas Pedagógicas</span>
              </h4>
              <p className="text-[10px] text-slate-550 dark:text-slate-400 font-sans mt-0.5">
                Altere os seletores de nota planejada (3º e 4º Bimestre) e veja a meta anual mudar dinamicamente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((g, idx) => {
              const currentSim = projectedGrades[g.subject] || { third: g.secondBimester, fourth: g.secondBimester + 0.3 };
              const currentSubjectAverage = (g.firstBimester + g.secondBimester + currentSim.third + currentSim.fourth) / 4;
              const subjectReachesMastery = currentSubjectAverage >= masteryThreshold;

              return (
                <div 
                  key={g.subject}
                  className="bg-[#fdfaf3]/50 dark:bg-slate-950/40 border border-amber-200/25 dark:border-slate-850 p-4 rounded-xl space-y-3 shadow-3xs hover:border-amber-300 dark:hover:border-slate-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-dashed border-slate-150 dark:border-slate-850 pb-1.5">
                    <div className="min-w-0">
                      <h5 className="font-serif font-black text-xs text-[#3e2e28] dark:text-amber-100 truncate">{g.subject}</h5>
                      <span className="text-[8.5px] text-slate-450 dark:text-slate-500 font-mono">Consolidado Corrente (B1 e B2): {((g.firstBimester + g.secondBimester) / 2).toFixed(2)}</span>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-[8px] text-slate-400 uppercase tracking-tight block font-mono">MÉDIA ANUAL</span>
                      <strong className={`text-xs font-mono font-black ${subjectReachesMastery ? "text-emerald-700 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400"}`}>
                        {currentSubjectAverage.toFixed(2)}
                      </strong>
                      <span className="text-[8px] font-bold block">
                        {subjectReachesMastery ? "🏆 Mastery Ok" : "📈 Pendente"}
                      </span>
                    </div>
                  </div>

                  {/* Term 3 Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">3º Bimestre (Simulado):</span>
                      <strong className="text-slate-700 dark:text-amber-200 font-mono font-extrabold">{currentSim.third.toFixed(1)} <span className="text-[8px] text-slate-400">/ 10</span></strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-slate-400 font-mono">5.0</span>
                      <input 
                        type="range"
                        min="5"
                        max="10"
                        step="0.1"
                        value={currentSim.third}
                        onChange={(e) => handleSliderChange(g.subject, "third", parseFloat(e.target.value))}
                        className="flex-1 accent-amber-700 dark:accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-[9px] text-slate-400 font-mono">10.0</span>
                    </div>
                  </div>

                  {/* Term 4 Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-slate-400 font-bold">4º Bimestre (Simulado):</span>
                      <strong className="text-slate-700 dark:text-amber-200 font-mono font-extrabold">{currentSim.fourth.toFixed(1)} <span className="text-[8px] text-slate-400">/ 10</span></strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-slate-400 font-mono">5.0</span>
                      <input 
                        type="range"
                        min="5"
                        max="10"
                        step="0.1"
                        value={currentSim.fourth}
                        onChange={(e) => handleSliderChange(g.subject, "fourth", parseFloat(e.target.value))}
                        className="flex-1 accent-amber-700 dark:accent-amber-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-[9px] text-slate-400 font-mono">10.0</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictive Diagnostics Panel */}
        <div className="bg-[#fcfaf3]/60 dark:bg-slate-900 border border-amber-200/50 dark:border-slate-850 rounded-2xl p-5 space-y-4">
          <div>
            <h4 className="text-xs font-black text-[#423326] dark:text-amber-100 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FileCheck className="w-4.5 h-4.5 text-rose-500" />
              <span>Diagnóstico de Crescimento</span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Taxa de variação entre os Bimestres consolidados e diagnóstico preventivo de Maestria.
            </p>
          </div>

          <div className="space-y-3.5 divide-y divide-amber-100 dark:divide-slate-800">
            {naturalSubjectAverages.map((item, idx) => {
              const trendColor = item.slope > 0 ? "text-emerald-600 dark:text-emerald-400" : item.slope < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500";
              const meetsMastery = item.avg >= masteryThreshold;
              
              return (
                <div key={item.subject} className={`pt-3 ${idx === 0 ? "pt-0 border-t-0" : ""}`}>
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-serif font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{item.subject.split(" (")[0]}</span>
                    <span className={`text-[10px] font-mono font-bold ${trendColor} shrink-0`}>
                      {item.slope > 0 ? `▲ +${item.slope.toFixed(1)}` : item.slope < 0 ? `▼ ${item.slope.toFixed(1)}` : "● Estável"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>Média anual provável:</span>
                    <strong className={`font-mono ${meetsMastery ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-amber-500"}`}>{item.avg.toFixed(2)}</strong>
                  </div>

                  {/* Recommendation action pill */}
                  <div className="mt-1.5 flex items-center justify-between gap-2 bg-white/40 dark:bg-slate-950/40 p-1.5 rounded-lg border border-slate-150 dark:border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase tracking-tight font-mono">RECOMENDAÇÃO:</span>
                    <span className={`text-[9.5px] font-bold ${
                      meetsMastery 
                        ? "text-emerald-700 dark:text-emerald-400" 
                        : item.slope < 0 
                        ? "text-rose-700 dark:text-rose-400 animate-pulse" 
                        : "text-amber-700 dark:text-amber-400"
                    }`}>
                      {meetsMastery 
                        ? "Excelente! Manter ritmo" 
                        : item.slope < 0 
                        ? "🚨 Atenção: Recomenda-se Plantão" 
                        : "Reforçar nos trabalhos (B3)"
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Mastery Plan Callout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#fcfaf3]/80 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl flex gap-3 items-start">
          <div className="p-1.5 bg-amber-500/10 text-amber-800 rounded-lg">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <h5 className="text-[10px] font-black uppercase text-amber-900 dark:text-amber-400 font-mono">1. Dica de Aprendizado</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-normal">
              Foque nas provas do 3º bimestre! Elas pesam 60% da nota oficial e consolidam conceitos de transição curricular.
            </p>
          </div>
        </div>

        <div className="bg-[#fcfaf3]/80 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl flex gap-3 items-start">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-700 rounded-lg">
            <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-0.5">
            <h5 className="text-[10px] font-black uppercase text-indigo-900 dark:text-indigo-400 font-mono">2. Trabalhos Práticos</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-normal">
              Entregar todas as missões e diários de casa garante os 4.0 pontos inteiros reservados a trabalhos complementares!
            </p>
          </div>
        </div>

        <div className="bg-[#fcfaf3]/80 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-xl flex gap-3 items-start">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-700 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-0.5">
            <h5 className="text-[10px] font-black uppercase text-emerald-900 dark:text-emerald-400 font-mono">3. Acompanhamento</h5>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-normal">
              Agende um bate-papo pedagógico rápido com a coordenação na aba de Agenda caso queira suporte especializado de reforço.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
