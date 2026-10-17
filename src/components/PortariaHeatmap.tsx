import React, { useState } from "react";
import { 
  Clock, 
  Users, 
  Flame, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  TrendingUp, 
  Sliders, 
  UserCheck, 
  TrendingDown,
  Calendar,
  Grid,
  BarChart2
} from "lucide-react";
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip as RechartsTooltip, 
  Cell 
} from "recharts";
import { motion } from "motion/react";

// Days of the week in Portuguese
const DAYS = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"];

// Time slots for Entry vs Exit
const ENTRY_TIMES = ["07:00", "07:15", "07:30", "07:45", "08:00", "08:15", "12:30", "12:45", "13:00", "13:15"];
const EXIT_TIMES = ["11:45", "12:00", "12:15", "12:30", "13:00", "17:00", "17:15", "17:30", "17:45", "18:00"];

// Static heat map values (representing percentage of maximum capacity / traffic flow)
// Rows: Days, Cols: Time slots
const ENTRY_HEAT_DATA = [
  [15, 45, 95, 80, 40, 10, 20, 60, 85, 30], // Mon
  [20, 50, 98, 85, 35, 15, 25, 65, 90, 25], // Tue
  [18, 40, 92, 75, 30, 8,  15, 55, 80, 20], // Wed
  [22, 55, 96, 88, 45, 12, 30, 70, 95, 35], // Thu
  [12, 35, 85, 65, 25, 5,  18, 50, 75, 15], // Fri
];

const EXIT_HEAT_DATA = [
  [30, 85, 60, 20, 10, 45, 80, 95, 50, 15], // Mon
  [35, 90, 65, 25, 15, 50, 85, 98, 55, 20], // Tue
  [25, 75, 55, 15, 8,  40, 75, 90, 45, 10], // Wed
  [40, 95, 70, 30, 18, 55, 90, 96, 60, 25], // Thu
  [45, 99, 50, 10, 5,  60, 95, 80, 35, 5],  // Fri
];

export function PortariaHeatmap({ onToast }: { onToast?: (msg: string, type: "success" | "error" | "info") => void } = {}) {
  const [flowType, setFlowType] = useState<"entrada" | "saida">("entrada");
  const [period, setPeriod] = useState<"hoje" | "7d" | "mes">("mes");
  const [viewMode, setViewMode] = useState<"grid" | "recharts">("grid");
  const [selectedCell, setSelectedCell] = useState<{ day: number; col: number } | null>({ day: 0, col: 2 });
  const [staffCount, setStaffCount] = useState<number>(3); // 1-5 gate agents
  const [isScaleApplied, setIsScaleApplied] = useState(false);

  const rawHeatData = flowType === "entrada" ? ENTRY_HEAT_DATA : EXIT_HEAT_DATA;
  const timeSlots = flowType === "entrada" ? ENTRY_TIMES : EXIT_TIMES;

  // Apply dynamic scaling based on selected period
  const getPeriodAdjustedValue = (baseVal: number, dayIdx: number) => {
    if (period === "hoje") {
      // Tuesday is active "Hoje" in this simulation (dayIdx === 1)
      if (dayIdx === 1) {
        return Math.min(100, Math.max(10, baseVal + 5)); // slightly higher live flow
      }
      return Math.max(5, Math.round(baseVal * 0.4)); // significantly low reference for other days since it's "Hoje"
    }
    if (period === "7d") {
      return Math.min(100, Math.max(10, Math.round(baseVal * 0.92))); // 7-day average
    }
    return baseVal; // Monthly averages (default)
  };

  // Get active heat matrix with period adjustments applied
  const heatData = rawHeatData.map((row, rIdx) => 
    row.map((val) => getPeriodAdjustedValue(val, rIdx))
  );

  // Selected cell helper details
  const getCellDetails = () => {
    if (!selectedCell) return null;
    const { day, col } = selectedCell;
    const percentage = heatData[day]?.[col] ?? 50;
    const time = timeSlots[col];
    const dayName = DAYS[day];
    
    // Estimate student count based on typical enrollment and percentage
    const maxStudentsPer15Min = 180;
    const estStudents = Math.round((percentage / 100) * maxStudentsPer15Min);
    
    // Project wait times depending on staff count and volume
    const throughputPerStaffPerMin = 8; // 8 students/min processed
    const totalThroughput = staffCount * throughputPerStaffPerMin * 15; // total that can be handled in 15 mins
    
    let avgWaitTime = 1.0;
    if (estStudents > totalThroughput) {
      // Overload situation
      avgWaitTime = 1.5 + ((estStudents - totalThroughput) / (staffCount * throughputPerStaffPerMin));
    } else {
      avgWaitTime = Math.max(0.8, (estStudents / (staffCount * throughputPerStaffPerMin)) * 0.3);
    }
    
    // Safety Risk score
    let safetyLevel: "Mínimo" | "Moderado" | "Alerta" = "Mínimo";
    if (percentage > 82 && staffCount <= 2) safetyLevel = "Alerta";
    else if (percentage > 65 && staffCount <= 3) safetyLevel = "Moderado";

    return {
      dayName,
      time,
      percentage,
      estStudents,
      avgWaitTime: avgWaitTime.toFixed(1),
      safetyLevel,
      requiredStaff: percentage > 80 ? 4 : percentage > 55 ? 3 : 2
    };
  };

  const details = getCellDetails();

  // Color scale mapper based on percentage value
  const getCellBgColor = (val: number) => {
    if (val < 15) return "bg-slate-100 dark:bg-slate-900 text-slate-400";
    if (val < 45) return "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/30";
    if (val < 70) return "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-150/40";
    if (val < 85) return "bg-indigo-200 dark:bg-indigo-850 text-indigo-950 dark:text-indigo-200";
    return "bg-rose-500 dark:bg-rose-950 text-white dark:text-rose-200 font-extrabold animate-pulse duration-1000";
  };

  // Recharts specific color mapping
  const getRechartsColor = (val: number) => {
    if (val < 15) return "#94a3b8"; // slate-400
    if (val < 45) return "#10b981"; // emerald-500
    if (val < 70) return "#6366f1"; // indigo-500
    if (val < 85) return "#4338ca"; // indigo-700
    return "#f43f5e"; // rose-500
  };

  // Prepare formatted dataset for Recharts Scatter Heatmap
  const rechartsData = DAYS.flatMap((dayName, rIdx) => {
    return timeSlots.map((time, cIdx) => {
      const density = heatData[rIdx][cIdx];
      return {
        day: dayName.split("-")[0], // E.g. "Segunda"
        dayIdx: rIdx,
        time: time,
        timeIdx: cIdx,
        density: density,
        students: Math.round((density / 100) * 180),
      };
    });
  });

  return (
    <div className="bg-white/95 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 text-left animate-fadeIn" id="portaria-heatmap-root">
      
      {/* Upper Filters Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-750 dark:text-indigo-400 shrink-0">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-serif font-black text-sm text-slate-850 dark:text-slate-150">
                Planejamento de Portaria & Fluxo de Alunos
              </h4>
              <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase font-mono tracking-wider border border-emerald-200/20">
                B2B Command Center
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Escalabilidade de inspetores de pátio baseada em densidades de tráfego histórico e em tempo real.
            </p>
          </div>
        </div>

        {/* 🗓️ PERIOD FILTERS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800 text-xs">
            <button
              onClick={() => {
                setPeriod("hoje");
                setSelectedCell({ day: 1, col: 2 }); // focus Tuesday
              }}
              className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase font-mono transition-all cursor-pointer ${
                period === "hoje"
                  ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-3xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Hoje (Ao Vivo) ⚡
            </button>
            <button
              onClick={() => setPeriod("7d")}
              className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase font-mono transition-all cursor-pointer ${
                period === "7d"
                  ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-3xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setPeriod("mes")}
              className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase font-mono transition-all cursor-pointer ${
                period === "mes"
                  ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-3xs"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Mês Atual
            </button>
          </div>

          {/* Flow toggle */}
          <div className="flex bg-slate-150 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800 text-xs">
            <button
              onClick={() => {
                setFlowType("entrada");
                setSelectedCell({ day: 0, col: 2 });
              }}
              className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase font-mono transition-all flex items-center gap-1 cursor-pointer ${
                flowType === "entrada"
                  ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-3xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>Entrada</span>
            </button>
            <button
              onClick={() => {
                setFlowType("saida");
                setSelectedCell({ day: 0, col: 7 });
              }}
              className={`px-3 py-1.5 rounded-lg text-[9.5px] font-black uppercase font-mono transition-all flex items-center gap-1 cursor-pointer ${
                flowType === "saida"
                  ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-3xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>Saída</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Switcher (Interactive Grid vs Recharts Scatter Plot) */}
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 p-2 rounded-2xl border border-slate-150 dark:border-slate-850">
        <div className="text-[10.5px] text-slate-500 font-sans flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span>
            {period === "hoje" ? (
              <span className="text-amber-700 dark:text-amber-400 font-bold">● Modo ao Vivo Ativo: Exibindo volume real do dia letivo de terça-feira.</span>
            ) : period === "7d" ? (
              <span>Exibindo médias ponderadas de tráfego dos últimos 7 dias úteis.</span>
            ) : (
              <span>Análise histórica de fluxo consolidada de todo o mês corrente.</span>
            )}
          </span>
        </div>

        <div className="flex bg-slate-200/60 dark:bg-slate-900 p-0.5 rounded-lg text-xs shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-2.5 py-1 rounded-md text-[9.5px] font-black uppercase font-mono transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === "grid"
                ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-4xs"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Grid className="w-3 h-3" />
            <span>Matriz</span>
          </button>
          <button
            onClick={() => setViewMode("recharts")}
            className={`px-2.5 py-1 rounded-md text-[9.5px] font-black uppercase font-mono transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === "recharts"
                ? "bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-4xs"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Recharts 2D</span>
          </button>
        </div>
      </div>

      {/* Main Grid & Interactive Panel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Visualizer Pane */}
        <div className="lg:col-span-8 space-y-4">
          
          {viewMode === "grid" ? (
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                <span>Matriz de Horários e Dias</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 bg-slate-100 dark:bg-slate-900 rounded-xs border border-slate-200/30" /> Baixo
                  <span className="inline-block w-2.5 h-2.5 bg-emerald-100 dark:bg-emerald-900 rounded-xs" /> Médio
                  <span className="inline-block w-2.5 h-2.5 bg-indigo-200 dark:bg-indigo-850 rounded-xs" /> Alto
                  <span className="inline-block w-2.5 h-2.5 bg-rose-500 rounded-xs animate-pulse" /> Pico Crítico
                </span>
              </div>

              <div className="overflow-x-auto pb-1.5">
                <div className="min-w-[620px] space-y-2">
                  {/* Table Column Headers (Times) */}
                  <div className="grid grid-cols-12 gap-1.5 pl-24 text-center">
                    {timeSlots.map((time, idx) => (
                      <div 
                        key={idx} 
                        className={`text-[9.5px] font-black font-mono tracking-tight text-slate-500 py-1 rounded-md ${
                          details?.time === time ? "text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 font-extrabold border border-indigo-100/30" : ""
                        }`}
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  {DAYS.map((dayName, rIdx) => {
                    const isTodayRow = period === "hoje" && rIdx === 1;
                    return (
                      <div 
                        key={rIdx} 
                        className={`grid grid-cols-12 gap-1.5 items-center p-0.5 rounded-xl transition-all ${
                          isTodayRow ? "bg-amber-500/5 border border-amber-500/20 shadow-4xs" : ""
                        }`}
                      >
                        {/* Day Label */}
                        <div className="col-span-2 text-[10px] font-bold text-slate-700 dark:text-slate-300 pr-2 truncate text-right flex items-center justify-end gap-1">
                          {isTodayRow && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping shrink-0" />}
                          <span>{dayName.split("-")[0]}</span>
                          {isTodayRow && <span className="text-[8.5px] text-amber-600 font-mono font-black">(HOJE)</span>}
                        </div>

                        {/* Heatmap cells */}
                        <div className="col-span-10 grid grid-cols-10 gap-1.5">
                          {heatData[rIdx].map((val, cIdx) => {
                            const isSelected = selectedCell?.day === rIdx && selectedCell?.col === cIdx;
                            return (
                              <button
                                key={cIdx}
                                onClick={() => setSelectedCell({ day: rIdx, col: cIdx })}
                                className={`h-11 rounded-xl transition-all duration-150 relative group cursor-pointer flex flex-col justify-center items-center text-[11px] font-mono select-none ${getCellBgColor(val)} ${
                                  isSelected 
                                    ? "ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900 scale-[1.04] z-10" 
                                    : "hover:scale-[1.02] hover:shadow-3xs"
                                }`}
                              >
                                <span className="font-bold">{val}%</span>
                                <span className="text-[7.5px] opacity-70 block mt-0.5">
                                  {val > 80 ? "🔥" : val > 50 ? "👥" : "✓"}
                                </span>

                                {/* Hover tooltip hint */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-950 text-white text-[9px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 font-sans shadow-md border border-slate-800">
                                  <strong>{val}% de Fluxo</strong>
                                  <span className="block text-slate-400 font-mono mt-0.5">Clique p/ simular escala</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                <span>Check-ins Heatmap 2D (Recharts Scatter plot)</span>
                <span className="text-slate-400 font-sans">Tamanho da bolha representa volume de alunos</span>
              </div>

              {/* Recharts 2D Scatter Heatmap visualization */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 p-4 rounded-3xl h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 0, left: 10 }}
                  >
                    <XAxis 
                      type="category" 
                      dataKey="time" 
                      name="Horário" 
                      interval={0}
                      tick={{ fontSize: 9, fill: "#64748b", fontFamily: "monospace" }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="day" 
                      name="Dia" 
                      tick={{ fontSize: 9, fill: "#64748b", fontWeight: "bold" }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />
                    <ZAxis 
                      type="number" 
                      dataKey="density" 
                      range={[50, 450]} 
                    />
                    <RechartsTooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-950 border border-slate-800 text-white rounded-2xl p-3 shadow-lg text-xs space-y-1">
                              <span className="font-serif font-black text-slate-150 block">{data.dayName} • {data.time}</span>
                              <div className="font-mono space-y-0.5 text-[10.5px]">
                                <p className="text-indigo-300">Densidade de Fluxo: <strong className="text-white text-xs">{data.density}%</strong></p>
                                <p className="text-emerald-400">Alunos Estimados: <strong className="text-white text-xs">{data.students}</strong></p>
                              </div>
                              <span className="text-[9px] text-slate-400 block pt-1 border-t border-slate-800">Clique na matriz para simular portões</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Frequência de Portaria" data={rechartsData} onClick={(node) => {
                      if (node) {
                        setSelectedCell({ day: node.dayIdx, col: node.timeIdx });
                      }
                    }}>
                      {rechartsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getRechartsColor(entry.density)} 
                          className="cursor-pointer hover:opacity-80 transition-all"
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Bottom helper tip banner */}
          <div className="bg-indigo-50/40 dark:bg-slate-950/30 border border-indigo-100/50 dark:border-slate-850 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-2.5 text-slate-650 dark:text-slate-450 leading-relaxed">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>Quadro Recomendado</strong>: Sempre certifique-se de ter pelo menos <strong>3 porteiros</strong> nos horários de entrada crítica (07:30 - 07:45) para evitar congestionamentos na rua principal do colégio.
              </span>
            </div>
            <button 
              onClick={() => {
                // Find Friday and peak column (column 1 for Friday has 99%)
                if (flowType === "saida") setSelectedCell({ day: 4, col: 1 });
                else setFlowType("saida");
              }}
              className="text-indigo-700 dark:text-indigo-400 hover:underline font-extrabold text-[10px] uppercase font-mono tracking-wider shrink-0 cursor-pointer"
            >
              Focar Horário Pico
            </button>
          </div>
        </div>

        {/* Dynamic Simulation / Action Panel (Right) */}
        <div className="lg:col-span-4 bg-[#fcfbfa] dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col justify-between space-y-4 shadow-3xs">
          {details ? (
            <div className="space-y-4">
              <div className="border-b border-slate-150 dark:border-slate-800 pb-3">
                <span className="text-[8.5px] uppercase tracking-widest font-mono text-indigo-700 dark:text-indigo-400 font-black">
                  Análise de Escala Ativa
                </span>
                <h5 className="text-sm font-black text-slate-850 dark:text-slate-100 font-serif leading-tight mt-1">
                  {details.dayName} às {details.time}
                </h5>
                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">
                  Intervalo dinâmico de tráfego de portaria
                </p>
              </div>

              {/* Traffic details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 p-2.5 border border-slate-150 dark:border-slate-850 rounded-xl">
                  <span className="text-[8.5px] text-slate-400 font-mono block uppercase">Volume Estimado</span>
                  <strong className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-baseline gap-1 mt-0.5">
                    {details.estStudents} 
                    <span className="text-[9px] font-normal text-slate-450">alunos</span>
                  </strong>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2.5 border border-slate-150 dark:border-slate-850 rounded-xl">
                  <span className="text-[8.5px] text-slate-400 font-mono block uppercase">Densidade de Fluxo</span>
                  <strong className={`text-sm font-black flex items-baseline gap-1 mt-0.5 ${
                    details.percentage > 80 ? "text-rose-600" : details.percentage > 55 ? "text-indigo-700 dark:text-indigo-400" : "text-emerald-600"
                  }`}>
                    {details.percentage}%
                    <span className="text-[8.5px] font-mono text-slate-450">da cap.</span>
                  </strong>
                </div>
              </div>

              {/* Staff interactive slider simulation */}
              <div className="bg-white dark:bg-slate-900 p-3 border border-slate-150 dark:border-slate-850 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-650" />
                    <span>Inspetores Alocados</span>
                  </label>
                  <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-black text-xs px-2 py-0.5 rounded-md border border-indigo-100/30">
                    {staffCount} {staffCount === 1 ? "porteiro" : "porteiros"}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={staffCount}
                  onChange={(e) => setStaffCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />

                {/* Simulated wait times results */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-450">Espera Pátio/Carro:</span>
                    <strong className={`font-mono font-bold flex items-center gap-0.5 ${
                      parseFloat(details.avgWaitTime) > 2.8 ? "text-rose-600" : "text-slate-700 dark:text-slate-300"
                    }`}>
                      {parseFloat(details.avgWaitTime) > 2.8 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5 text-emerald-650" />}
                      ~{details.avgWaitTime} min
                    </strong>
                  </div>

                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-450">Risco de Congestionamento:</span>
                    <strong className={`font-bold uppercase tracking-tight text-[9px] ${
                      details.safetyLevel === "Alerta" ? "text-rose-600 animate-pulse" :
                      details.safetyLevel === "Moderado" ? "text-amber-600" : "text-emerald-600"
                    }`}>
                      {details.safetyLevel === "Alerta" && "⚠️ Crítico"}
                      {details.safetyLevel === "Moderado" && "⚡ Moderado"}
                      {details.safetyLevel === "Mínimo" && "✓ Sob Controle"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action recommendation box */}
              <div className={`p-3 rounded-xl border flex gap-2.5 items-start text-[10.5px] leading-relaxed text-left transition-all ${
                staffCount < details.requiredStaff
                  ? "bg-rose-50/50 dark:bg-rose-950/15 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-400"
                  : "bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400"
              }`}>
                {staffCount < details.requiredStaff ? (
                  <>
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      <strong>Sub-dimensionado!</strong> O pico atual requer no mínimo <strong>{details.requiredStaff} inspetores</strong> para manter o tempo de liberação abaixo de 1.5 minutos e evitar sobrecarga na calçada.
                    </p>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      <strong>Quadro Excelente!</strong> A alocação de {staffCount} porteiros é suficiente para dar vazão à demanda com total segurança e conforto para os alunos e carros.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 text-slate-400">
              <Clock className="w-8 h-8 stroke-[1.5]" />
              <p className="text-xs">Selecione uma célula do mapa de calor para simular escalas.</p>
            </div>
          )}

          {/* Quick automation / save button */}
          <button
            onClick={() => {
              setIsScaleApplied(true);
              if (onToast) {
                onToast("Escala de inspetores otimizada e salva no sistema ERP com sucesso!", "success");
              }
              setTimeout(() => setIsScaleApplied(false), 4000);
            }}
            className={`w-full font-black py-2.5 rounded-xl text-[10px] uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
              isScaleApplied
                ? "bg-emerald-600 text-white"
                : "bg-indigo-700 hover:bg-indigo-850 active:scale-98 text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isScaleApplied ? "✓ Escala Otimizada e Aplicada!" : "Aplicar Escala Otimizada"}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
