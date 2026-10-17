import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  QrCode, 
  Camera, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  Clock, 
  Volume2, 
  VolumeX, 
  Zap, 
  Key, 
  Smartphone, 
  Download,
  AlertTriangle,
  RotateCw
} from "lucide-react";
import { Estudante, SchoolBranding } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { PortariaQrScanner } from "./PortariaQrScanner";
import { triggerGoldenConfettiForPortaria } from "../utils/goldenConfetti";

interface QrCodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudantes: Estudante[];
  selectedStudentId: string;
  branding: SchoolBranding;
  parentQrStatus: "pronto" | "escaneando" | "erro";
  successfulScansCount: number;
  continuousScanning: boolean;
  setContinuousScanning: (val: boolean) => void;
  onStudentCheckIn?: (studentName: string) => void;
  qrSoundType?: "synthesized" | "system_beep";
  onToast: (msg: string, type: "success" | "error" | "info") => void;
}

export const QrCodeScannerModal: React.FC<QrCodeScannerModalProps> = ({
  isOpen,
  onClose,
  estudantes,
  selectedStudentId,
  branding,
  parentQrStatus,
  successfulScansCount,
  continuousScanning,
  setContinuousScanning,
  onStudentCheckIn,
  qrSoundType = "synthesized",
  onToast
}) => {
  const [activeModalTab, setActiveModalTab] = useState<"passe" | "scanner">("passe");
  const [scannerSensitivity, setScannerSensitivity] = useState<"alta" | "normal" | "precisao">("alta");
  const [scannerEntryMode, setScannerEntryMode] = useState<"camera" | "manual">("camera");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showScanFlash, setShowScanFlash] = useState(false);
  const prevScansCountRef = useRef(successfulScansCount);

  const triggerFlash = () => {
    setShowScanFlash(true);
    const timer = setTimeout(() => {
      setShowScanFlash(false);
    }, 800);
    return () => clearTimeout(timer);
  };

  // Immediate visual flash overlay on successful scan detection
  useEffect(() => {
    if (successfulScansCount > prevScansCountRef.current || parentQrStatus === "pronto") {
      if (successfulScansCount > 0) {
        triggerFlash();
      }
    }
    prevScansCountRef.current = successfulScansCount;
  }, [successfulScansCount, parentQrStatus]);

  // Active student calculation
  const activeStudent = estudantes.find((e) => e.id === selectedStudentId) || estudantes[0];

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="qr-code-scanner-modal-wrapper"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          {/* 1. Backdrop overlay with soft blur & fade transition */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 dark:bg-slate-950/85 cursor-pointer"
          />

          {/* 2. Main Modal Container matching the premium tab entrance curve */}
          <motion.div
            key="qr-scanner-modal-card"
            initial={{ opacity: 0, y: 14, scale: 0.985, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, scale: 0.985, filter: "blur(4px)" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-sans"
          >
            {/* 📸 Visual 'Flash' Overlay Effect on QR Modal upon Successful Scan 📸 */}
            <AnimatePresence>
              {showScanFlash && (
                <motion.div
                  key="qr-scan-modal-flash-overlay"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className="pointer-events-none absolute inset-0 z-50 rounded-3xl overflow-hidden flex items-center justify-center bg-white/75 dark:bg-emerald-950/80 backdrop-blur-[2px]"
                  aria-hidden="true"
                >
                  {/* Radiant emerald green flash border & radial shockwave */}
                  <motion.div
                    initial={{ scale: 0.45, opacity: 1 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute w-80 h-80 rounded-full bg-radial from-emerald-400/85 via-emerald-500/40 to-transparent blur-md"
                  />
                  <div className="absolute inset-0 border-4 border-emerald-400 dark:border-emerald-300 rounded-3xl animate-pulse" />

                  {/* Centered instantaneous confirmation feedback badge */}
                  <motion.div
                    initial={{ scale: 0.65, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                    className="relative z-10 flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xl border border-emerald-300/60 font-bold text-sm"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-100 animate-bounce" />
                    <span className="tracking-wider font-mono text-xs uppercase">Leitura Realizada com Sucesso!</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modal Header */}
            <div className="px-3.5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-inner shrink-0">
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 font-mono truncate">
                      Portaria & Acesso Inteligente
                    </span>
                    <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" /> Criptografia 256-bit
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-white leading-snug truncate">
                    {activeModalTab === "passe" ? "Passe Digital de Acesso Escolar" : "Leitor Óptico & Validador de QR Code"}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-navigation Tabs inside modal */}
            <div className="flex items-center justify-between px-3.5 sm:px-6 py-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalTab("passe")}
                  className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeModalTab === "passe"
                      ? "bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-500/40"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Meu Passe Digital (Família)</span>
                  <span className="sm:hidden">Passe Digital</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab("scanner")}
                  className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeModalTab === "scanner"
                      ? "bg-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-500/40"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Scanner de Portaria (Câmera)</span>
                  <span className="sm:hidden">Scanner Câmera</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Atualização dinâmica em tempo real</span>
              </div>
            </div>

            {/* Modal Body with Animated View Switching */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-6">
              <AnimatePresence mode="wait">
                {activeModalTab === "passe" ? (
                  <motion.div
                    key="modal-tab-passe"
                    initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(3px)" }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-6"
                  >
                    {/* Digital Badge Card */}
                    <div className="max-w-md mx-auto bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 border-2 border-amber-400/40 shadow-2xl relative overflow-hidden text-center space-y-4">
                      {/* Holographic header stripe */}
                      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400" />
                      
                      {/* School Name & Shield */}
                      <div className="flex items-center justify-between pb-2 border-b border-indigo-900/60">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span className="font-extrabold text-xs tracking-wider text-amber-200 uppercase font-serif">
                            {branding.schoolName || "Magic Learning Academy"}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                          Ano Letivo 2026
                        </span>
                      </div>

                      {/* Student Info */}
                      <div className="flex items-center gap-4 bg-slate-900/60 p-3.5 rounded-2xl border border-indigo-900/40 text-left">
                        <img
                          src={activeStudent?.avatar || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"}
                          alt={activeStudent?.name || "Estudante"}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white truncate">
                            {activeStudent?.name || "Arthur Silva"}
                          </h4>
                          <p className="text-[11px] text-amber-300/90 font-medium">
                            {activeStudent?.grade || "3º Ano B - Ensino Fundamental"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Matrícula: {activeStudent?.id || "MAT-2026-089"}
                          </p>
                        </div>
                      </div>

                      {/* Animated QR Code Graphic Box */}
                      <div className="relative inline-block p-4 bg-white rounded-2xl shadow-xl mx-auto border-4 border-amber-400/80">
                        <div className="relative w-44 h-44 flex items-center justify-center">
                          {/* SVG QR Code representation */}
                          <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                            {/* Outer QR Corner Anchors */}
                            <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                            <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                            <rect x="13" y="13" width="10" height="10" rx="1" fill="#0f172a" />

                            <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                            <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                            <rect x="77" y="13" width="10" height="10" rx="1" fill="#0f172a" />

                            <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
                            <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
                            <rect x="13" y="77" width="10" height="10" rx="1" fill="#0f172a" />

                            {/* Data points grid pattern */}
                            <rect x="36" y="8" width="6" height="6" rx="1" fill="#0f172a" />
                            <rect x="46" y="8" width="8" height="6" rx="1" fill="#0f172a" />
                            <rect x="58" y="8" width="6" height="6" rx="1" fill="#0f172a" />
                            
                            <rect x="36" y="18" width="8" height="6" rx="1" fill="#0f172a" />
                            <rect x="48" y="18" width="6" height="6" rx="1" fill="#0f172a" />
                            <rect x="58" y="18" width="8" height="6" rx="1" fill="#0f172a" />

                            <rect x="8" y="36" width="6" height="6" rx="1" fill="#0f172a" />
                            <rect x="18" y="36" width="8" height="6" rx="1" fill="#0f172a" />
                            <rect x="8" y="46" width="8" height="8" rx="1" fill="#0f172a" />
                            <rect x="18" y="48" width="6" height="6" rx="1" fill="#0f172a" />

                            <rect x="36" y="36" width="28" height="28" rx="2" fill="#0284c7" />
                            <rect x="40" y="40" width="20" height="20" rx="1" fill="#ffffff" />
                            <rect x="44" y="44" width="12" height="12" rx="1" fill="#0284c7" />

                            <rect x="68" y="36" width="8" height="6" rx="1" fill="#0f172a" />
                            <rect x="80" y="36" width="12" height="8" rx="1" fill="#0f172a" />
                            <rect x="68" y="48" width="10" height="8" rx="1" fill="#0f172a" />
                            <rect x="82" y="48" width="8" height="6" rx="1" fill="#0f172a" />

                            <rect x="36" y="68" width="8" height="8" rx="1" fill="#0f172a" />
                            <rect x="48" y="68" width="16" height="6" rx="1" fill="#0f172a" />
                            <rect x="36" y="80" width="12" height="10" rx="1" fill="#0f172a" />
                            <rect x="52" y="78" width="12" height="12" rx="1" fill="#0f172a" />

                            <rect x="68" y="68" width="10" height="10" rx="1" fill="#0f172a" />
                            <rect x="82" y="68" width="8" height="8" rx="1" fill="#0f172a" />
                            <rect x="72" y="82" width="18" height="8" rx="1" fill="#0f172a" />
                          </svg>

                          {/* Scanner sweep laser animation matching reader */}
                          <motion.div
                            animate={{ y: [-75, 75, -75] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_#10b981] pointer-events-none"
                          />
                        </div>
                      </div>

                      {/* Status indicator bar */}
                      <div className="flex items-center justify-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          parentQrStatus === "escaneando"
                            ? "bg-amber-400 animate-ping"
                            : parentQrStatus === "erro"
                            ? "bg-rose-500"
                            : "bg-emerald-400"
                        }`} />
                        <span className="text-xs font-bold text-slate-200">
                          {parentQrStatus === "escaneando"
                            ? "Leitor detectado: Processando validação..."
                            : parentQrStatus === "erro"
                            ? "Aguardando reposicionamento"
                            : "Status: Ativo & Autorizado para Entrada/Saída"}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Apresente esta tela na câmera do totem ou catraca da portaria para liberação imediata.
                      </p>
                    </div>

                    {/* Authorized Caregivers list preview */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Responsáveis Autorizados no Passe
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {activeStudent?.authorizedPickups?.length || 2} cadastrados
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {(activeStudent?.authorizedPickups || [
                          { id: "1", name: "Mariana Silva (Mãe)", relationship: "Mãe", phone: "(11) 98765-4321" },
                          { id: "2", name: "Carlos Eduardo Silva (Pai)", relationship: "Pai", phone: "(11) 97654-3210" }
                        ]).map((p: any) => (
                          <div key={p.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{p.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                              ✓ Válido
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="modal-tab-scanner"
                    initial={{ opacity: 0, y: 12, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(3px)" }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="space-y-4"
                  >
                    <PortariaQrScanner
                      estudantes={estudantes}
                      branding={branding}
                      onCheckIn={(studentId) => {
                        const stud = estudantes.find(e => e.id === studentId);
                        const studName = stud?.name || "Arthur Silva";
                        triggerFlash();
                        triggerGoldenConfettiForPortaria("btn-parent-qrcode");
                        onStudentCheckIn?.(studName);
                        onToast(`Check-in de ENTRADA confirmado para ${studName}!`, "success");
                      }}
                      onCheckOut={(studentId) => {
                        const stud = estudantes.find(e => e.id === studentId);
                        const studName = stud?.name || "Arthur Silva";
                        triggerFlash();
                        triggerGoldenConfettiForPortaria("btn-parent-qrcode");
                        onStudentCheckIn?.(studName);
                        onToast(`Check-out de SAÍDA confirmado para ${studName}!`, "info");
                      }}
                      onToast={onToast}
                      continuousScanning={continuousScanning}
                      setContinuousScanning={setContinuousScanning}
                      qrSoundType={qrSoundType}
                      scannerSensitivity={scannerSensitivity}
                      onSensitivityChange={setScannerSensitivity}
                      scannerEntryMode={scannerEntryMode}
                      onEntryModeChange={setScannerEntryMode}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Pressione <strong>ESC</strong> ou clique fora para fechar</span>
              </span>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold transition-all cursor-pointer shadow-xs"
              >
                Concluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
