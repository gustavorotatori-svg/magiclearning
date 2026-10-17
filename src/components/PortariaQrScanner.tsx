import React, { useState, useEffect, useRef } from "react";
import jsQR from "jsqr";
import { 
  Camera, 
  QrCode, 
  X, 
  Check, 
  AlertCircle, 
  RotateCw, 
  Sparkles, 
  UserCheck, 
  LogIn, 
  LogOut, 
  Volume2, 
  VolumeX,
  HelpCircle,
  Sun,
  Maximize2,
  Focus,
  Smartphone,
  CheckCircle2,
  Lightbulb,
  ShieldCheck,
  Zap,
  Info,
  RefreshCw
} from "lucide-react";
import { Estudante, SchoolBranding, AutorizacaoRetirada } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface PortariaQrScannerProps {
  estudantes: Estudante[];
  branding: SchoolBranding;
  onCheckIn: (studentId: string) => void;
  onCheckOut: (studentId: string) => void;
  onToast: (msg: string, type: "success" | "error" | "info") => void;
  continuousScanning?: boolean;
  setContinuousScanning?: (val: boolean) => void;
  onSuccessScan?: (studentName: string, time: string) => void;
  qrSoundType?: "synthesized" | "system_beep";
  scannerSensitivity?: "alta" | "normal" | "precisao";
  onSensitivityChange?: (s: "alta" | "normal" | "precisao") => void;
  scannerEntryMode?: "camera" | "manual";
  onEntryModeChange?: (m: "camera" | "manual") => void;
}

export const PortariaQrScanner: React.FC<PortariaQrScannerProps> = ({
  estudantes,
  branding,
  onCheckIn,
  onCheckOut,
  onToast,
  continuousScanning = false,
  setContinuousScanning,
  onSuccessScan,
  qrSoundType = "synthesized",
  scannerSensitivity,
  onSensitivityChange,
  scannerEntryMode,
  onEntryModeChange
}) => {
  const [internalSensitivity, setInternalSensitivity] = useState<"alta" | "normal" | "precisao">(() => {
    return (localStorage.getItem("school_portal_scanner_sensitivity") as any) || "alta";
  });
  const [internalEntryMode, setInternalEntryMode] = useState<"camera" | "manual">(() => {
    return (localStorage.getItem("school_portal_scanner_entry_mode") as any) || "camera";
  });
  const [manualCodeInput, setManualCodeInput] = useState("");
  const [isConfigMenuOpen, setIsConfigMenuOpen] = useState(false);

  const effectiveSensitivity = scannerSensitivity || internalSensitivity;
  const effectiveEntryMode = scannerEntryMode || internalEntryMode;

  const handleSetSensitivity = (s: "alta" | "normal" | "precisao") => {
    setInternalSensitivity(s);
    localStorage.setItem("school_portal_scanner_sensitivity", s);
    onSensitivityChange?.(s);
    onToast(
      s === "alta"
        ? "⚡ Sensibilidade Alta (Instantânea / 50ms) ativada!"
        : s === "normal"
        ? "⚖️ Sensibilidade Equilibrada (150ms) ativada!"
        : "🎯 Sensibilidade Alta Precisão (Filtro 300ms) ativada!",
      "info"
    );
  };

  const handleSetEntryMode = (m: "camera" | "manual") => {
    setInternalEntryMode(m);
    localStorage.setItem("school_portal_scanner_entry_mode", m);
    onEntryModeChange?.(m);
    onToast(
      m === "camera"
        ? "📷 Modo Câmera ao Vivo ativado para leitura óptica de QR Code!"
        : "⌨️ Modo Digitação Manual ativado para inserção direta de código/matrícula!",
      "info"
    );
  };

  const [isOpen, setIsOpen] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt" | "checking">("checking");
  const [isScanning, setIsScanning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGridGuide, setShowGridGuide] = useState(true);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<"distancia" | "brilho" | "angulo" | "validacao">("distancia");
  
  // Scanned active result overlays
  const [scannedStudent, setScannedStudent] = useState<Estudante | null>(null);
  const [scannedCaregiver, setScannedCaregiver] = useState<{ rule: AutorizacaoRetirada; student: Estudante } | null>(null);
  const [scanCooldown, setScanCooldown] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Continuous scanning feedback states
  const [isContinuousProcessing, setIsContinuousProcessing] = useState(false);
  const [lastScanName, setLastScanName] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScanFrameTimeRef = useRef<number>(0);

  // Play audio synthesize chime using Web Audio API
  const playBeep = (type: "success" | "error" | "click" = "success") => {
    if (!soundEnabled) return;
    try {
      const mode = qrSoundType || (localStorage.getItem("school_portal_qr_sound_type") as "synthesized" | "system_beep") || "synthesized";
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "success") {
        if (mode === "system_beep") {
          // Sharp single-frequency barcode scanner system beep (2093 Hz / C7)
          osc.type = "sine";
          osc.frequency.setValueAtTime(2093, ctx.currentTime);
          gain.gain.setValueAtTime(0.09, ctx.currentTime);
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
          osc.stop(ctx.currentTime + 0.08);
        } else {
          // High pitched pleasant synthesized chime (D5 -> A5)
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.stop(ctx.currentTime + 0.25);
        }
      } else if (type === "click") {
        // Subtle click sound
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.stop(ctx.currentTime + 0.05);
      } else {
        if (mode === "system_beep") {
          // Harsh low double buzz system error beep
          osc.type = "square";
          osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
          osc.stop(ctx.currentTime + 0.12);
        } else {
          // Low error chime
          osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          osc.start();
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.stop(ctx.currentTime + 0.35);
        }
      }
    } catch (e) {
      console.warn("Failed to play synthesizer beep:", e);
    }
  };

  // Safe browser haptic vibration feedback helper
  const triggerVibration = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (err) {
        console.warn("Vibration feedback failed or was blocked:", err);
      }
    }
  };

  // Start the camera video stream
  const startCamera = async () => {
    setIsScanning(true);
    setScannedStudent(null);
    setCameraPermission("checking");
    
    // Stop any existing stream
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } }
      });
      
      streamRef.current = stream;
      setCameraPermission("granted");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // critical for iOS
        videoRef.current.play();
        // Start the jsQR parsing loop
        animationFrameId.current = requestAnimationFrame(scanLoop);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraPermission("denied");
      setIsScanning(false);
      onToast("Não foi possível acessar a câmera. Usando simulador.", "info");
    }
  };

  // Stop video stream and loops
  const stopCamera = () => {
    setIsScanning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Frame scanner parsing loop
  const scanLoop = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) {
      animationFrameId.current = requestAnimationFrame(scanLoop);
      return;
    }

    // Dynamic scanning sensitivity throttle
    const now = performance.now();
    const interval = effectiveSensitivity === "alta" ? 45 : effectiveSensitivity === "normal" ? 140 : 290;
    if (now - lastScanFrameTimeRef.current < interval) {
      animationFrameId.current = requestAnimationFrame(scanLoop);
      return;
    }
    lastScanFrameTimeRef.current = now;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw frame to hidden canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: effectiveSensitivity === "precisao" ? "attemptBoth" : "dontInvert"
      });

      if (code && code.data && !scanCooldown && !scannedStudent) {
        handleQrDetected(code.data);
      }
    }

    animationFrameId.current = requestAnimationFrame(scanLoop);
  };

  // Handle detected QR text
  const handleQrDetected = (codeData: string) => {
    // If it's a Caregiver QR code (format: CARE_studentId_caregiverId)
    if (codeData.startsWith("CARE_")) {
      const parts = codeData.split("_");
      if (parts.length >= 3) {
        const studentId = parts[1];
        const caregiverId = parts[2];
        
        const student = estudantes.find((e) => e.id === studentId);
        if (student) {
          const rule = student.withdrawalRules?.find((r) => r.id === caregiverId);
          if (rule) {
            if (rule.isAuthorized) {
              if (continuousScanning) {
                playBeep("success");
                triggerVibration(40);
                
                const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                setLastScanName(`${rule.name} (Retirada de ${student.name})`);
                setIsContinuousProcessing(true);
                setScanCooldown(true);
                
                // Determine whether checking in or checking out
                const isCheckedIn = student.pickupQueueStatus === "fila_espera" || student.pickupQueueStatus === "liberado_chamado";
                if (isCheckedIn) {
                  onCheckOut(student.id);
                } else {
                  onCheckIn(student.id);
                }
                
                onSuccessScan?.(student.name, timeStr);

                setTimeout(() => {
                  setScanCooldown(false);
                  setIsContinuousProcessing(false);
                }, 1500);
                return;
              }

              playBeep("success");
              triggerVibration(40);
              setLastScanName(student.name);
              setScannedCaregiver({ rule, student });
              setScannedStudent(null);
              setScanCooldown(true);
              setShowCelebration(true);
              onToast(`Acompanhante Autorizado: ${rule.name} para ${student.name}`, "success");
            } else {
              playBeep("error");
              triggerVibration([150, 100, 150]);
              setLastScanName(student.name);
              setScannedCaregiver({ rule, student }); // Still set so they see the BLOQUEADO warning UI
              setScannedStudent(null);
              setScanCooldown(true);
              onToast(`Acompanhante BLOQUEADO/SEM PERMISSÃO: ${rule.name}`, "error");
            }
            
            setTimeout(() => {
              setScanCooldown(false);
            }, 3000);
            
            setTimeout(() => {
              setShowCelebration(false);
            }, 3500);
            return;
          }
        }
      }
      
      playBeep("error");
      triggerVibration([150, 100, 150]);
      onToast("Código de acompanhante inválido ou não cadastrado", "error");
      setScanCooldown(true);
      setTimeout(() => {
        setScanCooldown(false);
      }, 2500);
      return;
    }

    // Look for student matching the code
    const student = estudantes.find((e) => e.id === codeData);
    
    if (student) {
      setLastScanName(student.name);
      if (continuousScanning) {
        playBeep("success");
        triggerVibration(40);
        
        const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        setIsContinuousProcessing(true);
        setScanCooldown(true);
        
        // Determine whether checking in or checking out
        const isCheckedIn = student.pickupQueueStatus === "fila_espera" || student.pickupQueueStatus === "liberado_chamado";
        if (isCheckedIn) {
          onCheckOut(student.id);
        } else {
          onCheckIn(student.id);
        }

        onSuccessScan?.(student.name, timeStr);

        setTimeout(() => {
          setScanCooldown(false);
          setIsContinuousProcessing(false);
        }, 1500);
        return;
      }

      playBeep("success");
      triggerVibration(40); // Soft haptic pulse acknowledging camera detection
      setScannedStudent(student);
      setScannedCaregiver(null);
      setScanCooldown(true);
      setShowCelebration(true);
      onToast(`QR Code Escaneado: ${student.name}`, "success");
      
      // Set cooldown so we don't spam multiple scans
      setTimeout(() => {
        setScanCooldown(false);
      }, 3000);
      
      // Clear celebration after 3.5s so user can read validation confirmation
      setTimeout(() => {
        setShowCelebration(false);
      }, 3500);
    } else {
      // Unknown code detected
      playBeep("error");
      triggerVibration([150, 100, 150]); // Warning double vibration
      onToast("Código QR inválido ou aluno não encontrado", "error");
      setScanCooldown(true);
      setTimeout(() => {
        setScanCooldown(false);
      }, 2500);
    }
  };

  // Trigger simulated scan for sandbox test environments
  const triggerSimulatedScan = (studentId: string) => {
    playBeep("click");
    const student = estudantes.find((e) => e.id === studentId);
    if (student) {
      handleQrDetected(studentId);
    } else {
      onToast("Aluno não encontrado para simulação", "error");
    }
  };

  // Manual refresh: clears latest scan results and resets scanner UI state immediately
  const handleManualRefresh = () => {
    playBeep("click");
    triggerVibration(50);
    setScannedStudent(null);
    setScannedCaregiver(null);
    setShowCelebration(false);
    setIsContinuousProcessing(false);
    setScanCooldown(false);
    setLastScanName("");
    setManualCodeInput("");
    lastScanFrameTimeRef.current = 0;
    onToast("Scanner reiniciado: pronto para nova leitura!", "info");
  };

  // Execute quick actions
  const handleAction = (type: "checkin" | "checkout") => {
    if (!scannedStudent) return;
    
    playBeep("click");
    if (type === "checkin") {
      triggerVibration(120); // Nice 120ms single pulse for status update success
      onCheckIn(scannedStudent.id);
    } else {
      triggerVibration([80, 60, 120]); // Dual tactile pulse for checkout completion success
      onCheckOut(scannedStudent.id);
    }
    
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
    setScannedStudent(null);
  };

  return (
    <div className="bg-white/95 dark:bg-slate-950 border border-amber-200 dark:border-slate-800 rounded-2xl p-4 shadow-md space-y-4">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between border-b border-amber-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl transition-all duration-300 ${
            showCelebration 
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 scale-105" 
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}>
            <AnimatePresence mode="wait">
              {showCelebration ? (
                <motion.div
                  key="sparkle-active"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: [0.8, 1.15, 1] }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                </motion.div>
              ) : (
                <motion.div
                  key="qr-idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <QrCode className="w-5 h-5 animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div>
            <h3 className="font-serif font-black text-sm text-[#423326] dark:text-slate-100">
              Scanner QR
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Entrada e saída
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Entry Mode Switcher (Camera vs Manual) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[9px] font-bold">
            <button
              type="button"
              onClick={() => handleSetEntryMode("camera")}
              className={`px-1.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                effectiveEntryMode === "camera"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Câmera"
            >
              <Camera className="w-3 h-3" />
              <span className="hidden sm:inline">Câmera</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetEntryMode("manual")}
              className={`px-1.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                effectiveEntryMode === "manual"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Manual"
            >
              <span>⌨️</span>
              <span className="hidden sm:inline">Manual</span>
            </button>
          </div>

          {/* Sensitivity Selector Dropdown / Popover Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsConfigMenuOpen(!isConfigMenuOpen)}
              className={`px-2 py-1.5 rounded-lg border text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                effectiveSensitivity === "alta"
                  ? "bg-amber-500/10 border-amber-400/40 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20"
                  : effectiveSensitivity === "normal"
                  ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  : "bg-indigo-500/10 border-indigo-400/40 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-500/20"
              }`}
              title={`Sensibilidade: ${
                effectiveSensitivity === "alta" ? "Alta (50ms - 60 FPS)" : effectiveSensitivity === "normal" ? "Equilibrada (150ms)" : "Alta Precisão (300ms)"
              }. Clique para configurar o scanner.`}
            >
              <span>
                {effectiveSensitivity === "alta" ? "⚡ 50ms" : effectiveSensitivity === "normal" ? "⚖️ 150ms" : "🎯 300ms"}
              </span>
              <span className="text-[8px] opacity-60">▾</span>
            </button>

            {/* Quick Sensitivity Menu Popover */}
            <AnimatePresence>
              {isConfigMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsConfigMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute top-8 right-0 z-50 w-64 p-3 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-amber-500/30 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-extrabold text-[10px] uppercase tracking-wider text-amber-400 flex items-center gap-1 font-sans">
                        <span>⚙️ Configurar Scanner</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsConfigMenuOpen(false)}
                        className="text-slate-400 hover:text-white p-0.5 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Sensibilidade de Leitura:
                      </span>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleSetSensitivity("alta");
                            setIsConfigMenuOpen(false);
                          }}
                          className={`w-full p-1.5 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
                            effectiveSensitivity === "alta"
                              ? "bg-amber-500/25 border-amber-400 text-amber-200 font-bold"
                              : "bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] block font-bold">⚡ Alta / Instantânea (50ms)</span>
                            <span className="text-[8px] text-slate-400">Leitura ultrarrápida a 60 FPS</span>
                          </div>
                          {effectiveSensitivity === "alta" && <span className="text-amber-400 font-black">✓</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleSetSensitivity("normal");
                            setIsConfigMenuOpen(false);
                          }}
                          className={`w-full p-1.5 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
                            effectiveSensitivity === "normal"
                              ? "bg-slate-700 border-slate-400 text-white font-bold"
                              : "bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] block font-bold">⚖️ Equilibrada / Normal (150ms)</span>
                            <span className="text-[8px] text-slate-400">Estabilidade ideal e economia de energia</span>
                          </div>
                          {effectiveSensitivity === "normal" && <span className="text-emerald-400 font-black">✓</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleSetSensitivity("precisao");
                            setIsConfigMenuOpen(false);
                          }}
                          className={`w-full p-1.5 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-all ${
                            effectiveSensitivity === "precisao"
                              ? "bg-indigo-600/30 border-indigo-400 text-indigo-200 font-bold"
                              : "bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <div>
                            <span className="text-[10px] block font-bold">🎯 Alta Precisão (300ms)</span>
                            <span className="text-[8px] text-slate-400">Filtro anti-reflexo e dupla checagem</span>
                          </div>
                          {effectiveSensitivity === "precisao" && <span className="text-indigo-400 font-black">✓</span>}
                        </button>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-800">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Modo de Entrada:
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleSetEntryMode("camera");
                            setIsConfigMenuOpen(false);
                          }}
                          className={`p-1.5 rounded-lg border text-center cursor-pointer text-[9.5px] font-bold transition-all ${
                            effectiveEntryMode === "camera"
                              ? "bg-emerald-500/25 border-emerald-400 text-emerald-300"
                              : "bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          📷 Câmera ao Vivo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleSetEntryMode("manual");
                            setIsConfigMenuOpen(false);
                          }}
                          className={`p-1.5 rounded-lg border text-center cursor-pointer text-[9.5px] font-bold transition-all ${
                            effectiveEntryMode === "manual"
                              ? "bg-indigo-500/25 border-indigo-400 text-indigo-300"
                              : "bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          ⌨️ Digitação Manual
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Continuous Scanning Mode Toggle */}
          <button
            onClick={() => {
              if (setContinuousScanning) {
                setContinuousScanning(!continuousScanning);
                onToast(
                  !continuousScanning
                    ? "🔄 Modo Contínuo Ativado! O crachá será autovalidado em fila automática."
                    : "⏹️ Modo de Escaneamento Manual Ativado.",
                  "info"
                );
              }
            }}
            className={`px-2 py-1.5 rounded-lg border text-[9px] uppercase tracking-wider font-black transition-all flex items-center gap-1 cursor-pointer ${
              continuousScanning
                ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400"
            }`}
            title={continuousScanning ? "Mudar para Modo Manual" : "Mudar para Modo Contínuo"}
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Contínuo</span>
          </button>

          {/* Help & Tips Overlay Trigger Button */}
          <button
            onClick={() => {
              setShowHelpOverlay(true);
              playBeep("click");
            }}
            className="px-2 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-[9px] uppercase tracking-wider font-black transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Guia de Ajuda & Dicas de Alinhamento QR"
            id="btn-qr-help-overlay"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Ajuda</span>
          </button>

          {/* Manual Refresh & Clear Status Button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 text-[9px] uppercase tracking-wider font-black transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Reiniciar Scanner e limpar status imediatamente"
            aria-label="Reiniciar Scanner"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 cursor-pointer"
            title={soundEnabled ? "Mutar bip de confirmação" : "Ativar bip de confirmação"}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={() => {
              if (isOpen) {
                stopCamera();
                setIsOpen(false);
              } else {
                setIsOpen(true);
                startCamera();
              }
            }}
            style={{ backgroundColor: branding.primaryColor }}
            className="px-3 py-1.5 text-white text-[10px] uppercase font-black tracking-wider rounded-xl transition-all shadow-2xs hover:opacity-95 cursor-pointer flex items-center gap-1"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isOpen ? "Fechar Leitor" : "Iniciar Câmera"}</span>
          </button>
        </div>
      </div>

      {/* MANUAL CODE ENTRY MODE PANEL */}
      {effectiveEntryMode === "manual" && (
        <div className="bg-slate-900/95 dark:bg-slate-950 text-white rounded-2xl p-4 border border-indigo-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs">⌨️</span>
              <div>
                <h4 className="text-xs font-black text-white font-sans">Digitação Manual de Código</h4>
                <p className="text-[9.5px] text-slate-400">Insira a matrícula, ID ou código de resgate do aluno</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSetEntryMode("camera")}
              className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 rounded-lg text-[9px] font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Camera className="w-3 h-3" />
              <span>Alternar para Câmera</span>
            </button>
          </div>

          {/* Input & Validate Row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!manualCodeInput.trim()) return;
              handleQrDetected(manualCodeInput.trim());
              setManualCodeInput("");
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={manualCodeInput}
              onChange={(e) => setManualCodeInput(e.target.value)}
              placeholder="Ex: est-1, 2026-001 ou CARE_est-1_caregiver-1"
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-slate-500 outline-hidden"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Validar</span>
            </button>
          </form>

          {/* Quick Student Chips */}
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1.5 font-mono">
              Atalhos Rápidos de Alunos Registrados:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {estudantes.map((est) => (
                <button
                  key={est.id}
                  type="button"
                  onClick={() => {
                    handleQrDetected(est.id);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-[10px] text-slate-200 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                  title={`Validar código ${est.id} de ${est.name}`}
                >
                  <img
                    src={est.avatar}
                    alt={est.name}
                    className="w-3.5 h-3.5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="truncate max-w-[90px]">{est.name.split(" ")[0]}</span>
                  <span className="font-mono text-[8.5px] text-indigo-300 font-bold">({est.id})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BODY SCANNER SCREEN (CAMERA MODE) */}
      {isOpen && effectiveEntryMode === "camera" && (
        <div className="space-y-4">
          
          {/* CAMERA FEED OR SIMULATOR */}
          <div className="relative aspect-video max-w-md mx-auto rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            
            {/* Real Video Element */}
            {cameraPermission === "granted" && isScanning && (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                muted
              />
            )}

            {/* Hidden canvas for decoding frames */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Continuous Processing Feedback Screen */}
            <AnimatePresence>
              {isContinuousProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-emerald-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white p-4 space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: [0.75, 1.12, 1], opacity: 1 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-emerald-200 flex items-center justify-center text-slate-950 text-3xl font-black shadow-[0_0_28px_rgba(52,211,153,0.65)]"
                  >
                    <Check className="w-9 h-9 stroke-[3.5] text-slate-950" />
                  </motion.div>
                  
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                      Validação Contínua
                    </span>
                    <h4 className="text-sm font-black tracking-wide font-sans text-white mt-1">
                      {lastScanName}
                    </h4>
                    <p className="text-[10px] text-slate-300 font-mono">
                      Liberando portaria... Aguarde 1.5s
                    </p>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-48 h-1.5 bg-emerald-950 rounded-full overflow-hidden border border-emerald-500/30">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="h-full bg-emerald-400"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Interactive Visual Overlay Guide */}
            {cameraPermission === "granted" && isScanning && (
              <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3.5">
                
                {/* Top Overlay Bar with Interactive Controls */}
                <div className="flex items-center justify-between w-full pointer-events-auto bg-slate-900/90 backdrop-blur-xs p-2 rounded-xl border border-slate-800 text-white shadow-md">
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Alinhamento Inteligente</span>
                    <span className="text-[10px] text-slate-300 font-medium">Posicione o Passe QR</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* Grid Guide Toggle */}
                    <button
                      onClick={() => {
                        setShowGridGuide(!showGridGuide);
                        playBeep("click");
                      }}
                      className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                        showGridGuide
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                      title="Alternar grade de enquadramento"
                    >
                      Grade: {showGridGuide ? "SIM" : "NÃO"}
                    </button>
                    
                    {/* Help & Tips Modal Trigger Button */}
                    <button
                      onClick={() => {
                        setShowHelpOverlay(true);
                        playBeep("click");
                      }}
                      className="px-2 py-1 bg-amber-500/20 border border-amber-500/40 rounded text-[8px] font-black uppercase tracking-wider hover:bg-amber-500/30 text-amber-300 cursor-pointer flex items-center gap-0.5"
                      title="Abrir Guia Visual de Ajuda e Dicas"
                    >
                      <Lightbulb className="w-2.5 h-2.5 text-amber-400" />
                      <span>Guia Ajuda</span>
                    </button>

                    {/* Next Tip Button */}
                    <button
                      onClick={() => {
                        setActiveTipIndex((prev) => (prev + 1) % 4);
                        playBeep("click");
                      }}
                      className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-[8px] font-black uppercase tracking-wider hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                    >
                      Dica {activeTipIndex + 1}/4 💡
                    </button>

                    {/* Manual Refresh / Clear Status Button */}
                    <button
                      type="button"
                      onClick={handleManualRefresh}
                      className="px-2 py-1 bg-rose-500/20 border border-rose-500/40 rounded text-[8px] font-black uppercase tracking-wider hover:bg-rose-500/30 text-rose-300 cursor-pointer flex items-center gap-1"
                      title="Limpar leitura e reiniciar scanner agora"
                    >
                      <RefreshCw className="w-2.5 h-2.5 text-rose-400" />
                      <span>Limpar</span>
                    </button>
                  </div>
                </div>

                {/* Floating Scan Validation Confirmation Pop-over */}
                <AnimatePresence>
                  {showCelebration && (
                    <motion.div
                      key="floating-scan-success-banner"
                      initial={{ opacity: 0, y: -16, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: [0.92, 1.025, 1] }}
                      exit={{ opacity: 0, y: -12, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute top-14 inset-x-3 z-30 bg-emerald-950/95 border-2 border-emerald-400 text-white p-3 rounded-2xl shadow-[0_0_28px_rgba(16,185,129,0.55)] backdrop-blur-md flex items-center gap-3 pointer-events-auto"
                    >
                      <motion.div 
                        initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                        animate={{ scale: [0.7, 1.15, 1], opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
                        className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md font-black"
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                      </motion.div>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                            ✓ Validado
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-white truncate mt-0.5 font-sans">
                          {scannedStudent?.name || scannedCaregiver?.student.name || lastScanName}
                        </h4>
                        <p className="text-[9.5px] text-emerald-200/90 truncate font-mono">
                          Passe QR reconhecido e confirmado pela portaria
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Center Viewfinder Box */}
                <div className="relative flex-1 flex items-center justify-center">
                  
                  {/* Grid Lines if active */}
                  {showGridGuide && (
                    <div className="absolute inset-4 grid grid-cols-3 grid-rows-3 opacity-15 pointer-events-none">
                      <div className="border-r border-b border-white border-dashed" />
                      <div className="border-r border-b border-white border-dashed" />
                      <div className="border-b border-white border-dashed" />
                      <div className="border-r border-b border-white border-dashed" />
                      <div className="border-r border-b border-white border-dashed" />
                      <div className="border-b border-white border-dashed" />
                      <div className="border-r border-white border-dashed" />
                      <div className="border-r border-white border-dashed" />
                      <div className="border-none" />
                    </div>
                  )}

                  {/* Dark mask corners outside viewfinder */}
                  <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />

                  {/* Scanning Frame box with subtle motion and interactive frame feedback */}
                  <motion.div
                    animate={
                      showCelebration
                        ? { scale: [1, 1.06, 1.03], borderColor: "rgba(16,185,129,1)" }
                        : {
                            scale: [1, 1.018, 1],
                            borderColor: [
                              "rgba(52,211,153,0.65)",
                              "rgba(16,185,129,0.95)",
                              "rgba(52,211,153,0.65)"
                            ]
                          }
                    }
                    transition={{
                      duration: showCelebration ? 0.6 : 3.5,
                      repeat: showCelebration ? 0 : Infinity,
                      ease: "easeInOut"
                    }}
                    className={`w-52 h-52 border-2 rounded-3xl relative flex items-center justify-center bg-transparent transition-shadow duration-500 z-20 overflow-hidden ${
                      showCelebration
                        ? "shadow-[0_0_35px_rgba(16,185,129,0.55)] border-emerald-400"
                        : "shadow-[0_0_24px_rgba(16,185,129,0.2)]"
                    }`}
                  >
                    {/* Subtle sweeping radar gradient background */}
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-10 opacity-15 pointer-events-none bg-[conic-gradient(from_0deg_at_50%_50%,rgba(16,185,129,0.5)_0deg,transparent_60deg,transparent_360deg)]"
                    />

                    {/* Concentric subtle optical focus rings */}
                    <motion.div
                      animate={{ scale: [0.92, 1.05, 0.92], opacity: [0.25, 0.55, 0.25] }}
                      transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-4 rounded-2xl border border-emerald-400/40 pointer-events-none"
                    />
                    
                    {/* Center Crosshair Target & Micro reticle (visible when idle) */}
                    {!showCelebration && (
                      <>
                        <div className="absolute w-8 h-0.5 bg-emerald-400/40" />
                        <div className="absolute h-8 w-0.5 bg-emerald-400/40" />
                        <motion.div
                          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.85, 0.4] }}
                          transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
                          className="w-4 h-4 rounded-full border border-emerald-400/70 absolute flex items-center justify-center pointer-events-none"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                        </motion.div>
                      </>
                    )}

                    {/* Central Rewarding QR Code Scan Success Indicator for Parents & School Entry */}
                    <AnimatePresence>
                      {showCelebration && (
                        <motion.div
                          key="viewfinder-scan-success-indicator"
                          initial={{ opacity: 0, scale: 0.82 }}
                          animate={{ opacity: 1, scale: [0.82, 1.06, 1] }}
                          exit={{ opacity: 0, scale: 0.94 }}
                          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30 bg-emerald-950/80 backdrop-blur-[2px] rounded-3xl p-3"
                        >
                          {/* Radiant expanding circular pulse ring */}
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0.85 }}
                            animate={{ scale: 1.45, opacity: 0 }}
                            transition={{ duration: 0.75, ease: "easeOut" }}
                            className="absolute w-24 h-24 rounded-full bg-emerald-400/35 blur-xs pointer-events-none"
                          />

                          {/* Hero Checkmark Badge with spring scale-up and fade */}
                          <motion.div
                            initial={{ scale: 0.65, opacity: 0, y: 4 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.34, ease: [0.34, 1.56, 0.64, 1] }}
                            className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 flex items-center justify-center shadow-[0_0_28px_rgba(52,211,153,0.7)] border-2 border-emerald-200"
                          >
                            <Check className="w-7 h-7 stroke-[3.5] text-slate-950" />
                          </motion.div>

                          {/* Success textual feedback with staggered fade and scale-up */}
                          <motion.div
                            initial={{ opacity: 0, y: 6, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="mt-2 text-center max-w-full"
                          >
                            <span className="text-[9px] font-mono font-black uppercase tracking-widest text-emerald-300 block">
                              ✓ Entrada Autorizada
                            </span>
                            <span className="text-xs font-bold text-white font-sans truncate block max-w-[170px] drop-shadow-xs">
                              {scannedStudent?.name || scannedCaregiver?.student.name || lastScanName || "Aluno(a)"}
                            </span>
                            <span className="text-[8.5px] text-emerald-200/80 font-mono block mt-0.5">
                              Portaria Liberada com Sucesso
                            </span>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Bounding corners - dynamic animated reticle brackets with micro-shifts */}
                    <motion.div
                      animate={showCelebration ? { scale: 1.1 } : { x: [-1, 0, -1], y: [-1, 0, -1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className={`absolute top-0 left-0 w-7 h-7 border-t-[3.5px] border-l-[3.5px] -mt-0.5 -ml-0.5 rounded-tl-xl transition-colors duration-300 ${showCelebration ? "border-emerald-300" : "border-emerald-400"}`}
                    />
                    <motion.div
                      animate={showCelebration ? { scale: 1.1 } : { x: [1, 0, 1], y: [-1, 0, -1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className={`absolute top-0 right-0 w-7 h-7 border-t-[3.5px] border-r-[3.5px] -mt-0.5 -mr-0.5 rounded-tr-xl transition-colors duration-300 ${showCelebration ? "border-emerald-300" : "border-emerald-400"}`}
                    />
                    <motion.div
                      animate={showCelebration ? { scale: 1.1 } : { x: [-1, 0, -1], y: [1, 0, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className={`absolute bottom-0 left-0 w-7 h-7 border-b-[3.5px] border-l-[3.5px] -mb-0.5 -ml-0.5 rounded-bl-xl transition-colors duration-300 ${showCelebration ? "border-emerald-300" : "border-emerald-400"}`}
                    />
                    <motion.div
                      animate={showCelebration ? { scale: 1.1 } : { x: [1, 0, 1], y: [1, 0, 1] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className={`absolute bottom-0 right-0 w-7 h-7 border-b-[3.5px] border-r-[3.5px] -mb-0.5 -mr-0.5 rounded-br-xl transition-colors duration-300 ${showCelebration ? "border-emerald-300" : "border-emerald-400"}`}
                    />

                    {/* Smooth bidirectional laser scanning beam with soft gradient trail */}
                    <motion.div
                      animate={
                        showCelebration
                          ? { y: [-95, 95, -95], scaleY: [1, 2.8, 1], opacity: [0.9, 1, 0.9] }
                          : { y: [-95, 95, -95], opacity: [0.65, 0.95, 0.65] }
                      }
                      transition={{
                        duration: showCelebration ? 0.9 : 2.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-x-2 h-7 pointer-events-none z-10 flex flex-col items-center justify-center"
                    >
                      {/* Vertical gradient trail glow */}
                      <div className="w-full h-5 bg-gradient-to-t from-emerald-500/25 to-transparent pointer-events-none rounded-t" />
                      {/* High-intensity horizontal laser line */}
                      <div
                        className={`w-full h-0.5 rounded-full transition-all duration-300 ${
                          showCelebration
                            ? "bg-emerald-300 shadow-[0_0_18px_#34d399]"
                            : "bg-emerald-400 shadow-[0_0_10px_#10b981]"
                        }`}
                      />
                      <div className="w-full h-5 bg-gradient-to-b from-emerald-500/25 to-transparent pointer-events-none rounded-b" />
                    </motion.div>

                    {/* Pulse scanning rings */}
                    <div
                      className={`absolute inset-0 border rounded-3xl animate-pulse pointer-events-none ${
                        showCelebration ? "border-emerald-400/70" : "border-emerald-400/30"
                      }`}
                      style={{ animationDuration: showCelebration ? "0.7s" : "2.2s" }}
                    />

                    {/* Viewfinder Bottom Status Pill with subtle scale-up and fade */}
                    <AnimatePresence mode="wait">
                      {showCelebration ? (
                        <motion.div
                          key="celebration-footer-badge"
                          initial={{ opacity: 0, scale: 0.88, y: 4 }}
                          animate={{ opacity: 1, scale: [0.88, 1.04, 1], y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 2 }}
                          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                          className="bg-emerald-600/95 border border-emerald-300 text-white px-3.5 py-1.5 rounded-xl absolute bottom-2 tracking-wide font-black shadow-xl flex flex-col items-center justify-center text-center max-w-[92%] z-30 backdrop-blur-xs"
                        >
                          <div className="flex items-center gap-1 text-[9px] uppercase font-mono font-black text-emerald-200">
                            <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-300" />
                            <span>VALIDADO</span>
                          </div>
                          <span className="text-[10px] font-sans font-bold text-white truncate max-w-[155px]">
                            {scannedStudent?.name || scannedCaregiver?.student.name || lastScanName}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.span
                          key="waiting-qr-badge"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: [0.75, 1, 0.75], scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut" }}
                          className="text-[8px] font-mono uppercase text-emerald-300 bg-slate-950/90 border border-emerald-500/40 px-2.5 py-0.5 rounded-full absolute bottom-2 tracking-widest font-black shadow-md z-30 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>Aguardando Passe QR</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Bottom Instruction Panel */}
                <div className="w-full bg-slate-950/90 border border-emerald-500/20 backdrop-blur-xs px-3 py-2 rounded-xl text-center pointer-events-auto shadow-lg">
                  <p className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider mb-0.5 flex items-center justify-center gap-1">
                    <span>💡 Alinhamento de Portaria Segura</span>
                    <span className="text-[8px] bg-emerald-500/10 px-1.5 py-0.2 rounded font-mono">Dica {activeTipIndex + 1}/4</span>
                  </p>
                  <p className="text-[11px] text-white leading-snug font-sans tracking-tight">
                    {[
                      "Centralize o QR Code do Crachá Escolar dentro da mira principal.",
                      "Aproxime ou afaste o celular mantendo a distância ideal de 15cm.",
                      "Evite reflexos excessivos e aumente o brilho de tela do responsável.",
                      "Mantenha a câmera limpa e estável por 2 segundos para o check-in."
                    ][activeTipIndex]}
                  </p>
                </div>

              </div>
            )}

            {/* Checking or prompt placeholder */}
            {cameraPermission === "checking" && (
              <div className="text-center p-6 space-y-3 z-10">
                <RotateCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">Solicitando acesso à câmera...</p>
              </div>
            )}

            {/* Denied / Blocked placeholder */}
            {cameraPermission === "denied" && (
              <div className="text-center p-6 max-w-xs space-y-2 z-10">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                <h4 className="text-xs font-bold text-slate-100 font-sans">Acesso à câmera indisponível</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-light">
                  Como o aplicativo roda em um contêiner sandbox (iframe), as permissões de câmera do navegador podem estar bloqueadas localmente. 
                </p>
                <div className="pt-2">
                  <span className="inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                    ✓ Use o Simulador Rápido Abaixo!
                  </span>
                </div>
              </div>
            )}

            {/* Active scan result drawer / modal overlay */}
            <AnimatePresence>
              {scannedStudent && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="absolute inset-x-0 bottom-0 bg-slate-900/95 dark:bg-slate-950/95 border-t-2 border-emerald-500 p-4 text-white flex flex-col space-y-3 z-20 shadow-2xl rounded-t-2xl"
                >
                  {/* Animated Validado Confirmation Header with subtle scale-up and fade */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -6 }}
                    animate={{ opacity: 1, scale: [0.92, 1.025, 1], y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-emerald-950/90 border border-emerald-500/50 rounded-xl p-2.5 flex items-center justify-between text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.3)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <motion.div 
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: [0.7, 1.15, 1], opacity: 1 }}
                        transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
                        className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-sm"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </motion.div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider block text-emerald-400">
                          Validado com Sucesso
                        </span>
                        <span className="text-xs font-bold text-white leading-tight">
                          {scannedStudent.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                      ✓ Validado
                    </span>
                  </motion.div>

                  <div className="flex items-center gap-3">
                    <img 
                      src={scannedStudent.avatar} 
                      alt={scannedStudent.name} 
                      className="w-10 h-10 rounded-full border border-amber-400 object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] uppercase tracking-widest font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                          ALUNO DETECTADO
                        </span>
                      </div>
                      <h4 className="text-xs font-bold font-sans truncate text-white">{scannedStudent.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{scannedStudent.grade}</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleManualRefresh}
                        className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Reiniciar scanner e limpar status"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleManualRefresh}
                        className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Fechar e limpar status"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* DUAL ACTION BUTTONS WITH SMOOTH SCALING FEEDBACK */}
                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.93 }}
                      transition={{ type: "spring", stiffness: 450, damping: 22 }}
                      onClick={() => handleAction("checkin")}
                      className="bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer border border-sky-500 shadow-2xs"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Entrada</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.93 }}
                      transition={{ type: "spring", stiffness: 450, damping: 22 }}
                      onClick={() => handleAction("checkout")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer border border-emerald-500 shadow-2xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Saída</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {scannedCaregiver && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className={`absolute inset-x-0 bottom-0 border-t p-4 text-white flex flex-col space-y-3 z-20 shadow-2xl rounded-t-2xl ${
                    scannedCaregiver.rule.isAuthorized
                      ? "bg-slate-950/95 dark:bg-slate-950/95 border-emerald-500/40"
                      : "bg-rose-950/95 dark:bg-rose-950/95 border-rose-500/50 text-rose-100"
                  }`}
                >
                  {/* Animated Validado Confirmation Header for Caregiver */}
                  {scannedCaregiver.rule.isAuthorized && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -6 }}
                      animate={{ opacity: 1, scale: [0.92, 1.025, 1], y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="bg-emerald-950/90 border border-emerald-500/50 rounded-xl p-2.5 flex items-center justify-between text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.3)]"
                    >
                      <div className="flex items-center gap-2.5">
                        <motion.div 
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: [0.7, 1.15, 1], opacity: 1 }}
                          transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
                          className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-sm"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </motion.div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider block text-emerald-400">
                            Acompanhante Validado
                          </span>
                          <span className="text-xs font-bold text-white leading-tight">
                            {scannedCaregiver.student.name} (por {scannedCaregiver.rule.name})
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-black uppercase bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded-md">
                        ✓ Validado
                      </span>
                    </motion.div>
                  )}
                  <div className="flex items-start gap-3">
                    {/* Caregiver relationship icon or emoji */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm border shrink-0 ${
                      scannedCaregiver.rule.isAuthorized
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    }`}>
                      {scannedCaregiver.rule.relationship.toLowerCase().includes("avó") || scannedCaregiver.rule.relationship.toLowerCase().includes("avô") ? "👵🏼" :
                       scannedCaregiver.rule.relationship.toLowerCase().includes("tio") || scannedCaregiver.rule.relationship.toLowerCase().includes("tia") ? "👨🏽‍🦱" :
                       scannedCaregiver.rule.relationship.toLowerCase().includes("van") || scannedCaregiver.rule.relationship.toLowerCase().includes("motorista") ? "🚐" : "👤"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[8px] uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 rounded ${
                          scannedCaregiver.rule.isAuthorized
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/30 text-rose-200 animate-pulse"
                        }`}>
                          {scannedCaregiver.rule.isAuthorized ? "ACOMPANHANTE AUTORIZADO" : "✕ ACESSO BLOQUEADO"}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-black font-sans truncate mt-1">
                        {scannedCaregiver.rule.name}
                      </h4>
                      
                      <p className={`text-[9.5px] ${scannedCaregiver.rule.isAuthorized ? "text-slate-400" : "text-rose-300"} truncate`}>
                        {scannedCaregiver.rule.relationship} • RG: {scannedCaregiver.rule.rg}
                      </p>

                      {/* Associated Student card */}
                      <div className={`mt-2 p-1.5 rounded-xl border flex items-center gap-2 ${
                        scannedCaregiver.rule.isAuthorized
                          ? "bg-slate-900/60 border-slate-850"
                          : "bg-rose-900/20 border-rose-800/40"
                      }`}>
                        <img 
                          src={scannedCaregiver.student.avatar}
                          alt={scannedCaregiver.student.name}
                          className="w-5.5 h-5.5 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[7.5px] text-slate-400 block uppercase font-mono">Retirando o aluno(a):</p>
                          <p className="text-[10px] font-bold truncate leading-none">{scannedCaregiver.student.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={handleManualRefresh}
                        className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
                        title="Reiniciar scanner e limpar status"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleManualRefresh}
                        className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Fechar e limpar status"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ACTION TRIGGER BUTTONS FOR CAREGIVER */}
                  {scannedCaregiver.rule.isAuthorized ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.93 }}
                        transition={{ type: "spring", stiffness: 450, damping: 22 }}
                        onClick={() => {
                          playBeep("click");
                          triggerVibration(120);
                          onCheckIn(scannedCaregiver.student.id);
                          setShowCelebration(true);
                          setTimeout(() => setShowCelebration(false), 2000);
                          setScannedCaregiver(null);
                        }}
                        className="bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer border border-sky-500 shadow-2xs"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Entrada</span>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.93 }}
                        transition={{ type: "spring", stiffness: 450, damping: 22 }}
                        onClick={() => {
                          playBeep("click");
                          triggerVibration([80, 60, 120]);
                          onCheckOut(scannedCaregiver.student.id);
                          setShowCelebration(true);
                          setTimeout(() => setShowCelebration(false), 2000);
                          setScannedCaregiver(null);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer border border-emerald-500 shadow-2xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Retirar Aluno</span>
                      </motion.button>
                    </div>
                  ) : (
                    <div className="bg-rose-500/10 border border-rose-500/25 p-2 rounded-xl text-[9px] text-rose-300 leading-normal text-center flex items-center gap-1 justify-center font-mono font-bold">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
                      <span>RETIRADA BLOQUEADA: Requer autorização via app do pai/mãe.</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* SANDBOX QUICK SIMULATOR PANEL */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-900 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-[#423326] dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
                <span>Simulador de Passes de Pais (1-Clique)</span>
              </span>
              <span className="text-[9px] text-slate-400 font-sans italic">Testes em ambiente sandbox</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {estudantes.map((stud) => {
                const isAtGate = stud.pickupQueueStatus === "liberado_chamado";
                const isWaiting = stud.pickupQueueStatus === "fila_espera";
                const isOut = stud.pickupQueueStatus === "saiu";
                
                let badgeColor = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
                let statusLabel = "Em Casa / Ausente";
                if (isWaiting) {
                  badgeColor = "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-100 dark:border-sky-900/30";
                  statusLabel = "A Caminho 🚙";
                } else if (isAtGate) {
                  badgeColor = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30";
                  statusLabel = "No Portão 🚪";
                } else if (isOut) {
                  badgeColor = "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-100 dark:border-amber-900/30";
                  statusLabel = "Retirado ✓";
                }

                return (
                  <div
                    key={stud.id}
                    className="flex flex-col p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 hover:border-amber-300/60 transition-all text-left space-y-2 shadow-3xs"
                  >
                    {/* Student Clickable Area */}
                    <button
                      onClick={() => triggerSimulatedScan(stud.id)}
                      className="flex items-center gap-2 w-full text-left group cursor-pointer"
                      title="Simular escaneamento do QR Code do aluno"
                    >
                      <img
                        src={stud.avatar}
                        alt={stud.name}
                        className="w-7 h-7 rounded-full object-cover bg-slate-100 flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200 block truncate font-sans group-hover:text-amber-750 dark:group-hover:text-amber-400">
                          {stud.name.split(" ")[0]} {stud.name.split(" ").slice(-1)[0]}
                        </span>
                        <span className={`text-[8px] px-1 py-0.5 rounded-md inline-block font-bold mt-0.5 ${badgeColor}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </button>

                    {/* Caregivers / Terceiros List */}
                    {stud.withdrawalRules && stud.withdrawalRules.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-900 space-y-1">
                        <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">Acompanhantes:</span>
                        <div className="flex flex-wrap gap-1">
                          {stud.withdrawalRules.map((rule) => {
                            const iconEmoji = rule.relationship.toLowerCase().includes("avó") || rule.relationship.toLowerCase().includes("avô") ? "👵🏼" :
                                              rule.relationship.toLowerCase().includes("tio") || rule.relationship.toLowerCase().includes("tia") ? "👨🏽‍🦱" :
                                              rule.relationship.toLowerCase().includes("van") || rule.relationship.toLowerCase().includes("motorista") ? "🚐" : "👤";
                            return (
                              <button
                                key={rule.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playBeep("click");
                                  handleQrDetected(`CARE_${stud.id}_${rule.id}`);
                                }}
                                className={`text-[7.5px] font-semibold px-1.5 py-0.5 rounded-md transition-all flex items-center gap-0.5 cursor-pointer border ${
                                  rule.isAuthorized
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                                    : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                                }`}
                                title={`Simular escaneamento do Passe QR do acompanhante: ${rule.name} (${rule.relationship})`}
                              >
                                <span>{iconEmoji}</span>
                                <span className="truncate max-w-[55px]">{rule.name.split(" ")[0]}</span>
                                <span className={rule.isAuthorized ? "text-emerald-500" : "text-rose-500 font-bold"}>
                                  {rule.isAuthorized ? "✓" : "✕"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-sans leading-relaxed font-light text-center">
              💡 Clique em um aluno para simular o QR Code dele, ou nos pequenos botões abaixo para simular o <strong>Passe de Acompanhante/Terceiro</strong> com autorização segura!
            </p>
          </div>

        </div>
      )}

      {/* FOOTER MINI INSTRUCTION */}
      {!isOpen && (
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between gap-1.5 font-light">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Ative a câmera para utilizar o scanner físico de catraca ou use os simuladores integrados.</span>
          </div>
          <button
            onClick={() => {
              setShowHelpOverlay(true);
              playBeep("click");
            }}
            className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer shrink-0 flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Dicas de Leitura</span>
          </button>
        </div>
      )}

      {/* 💡 HELP & TIPS OVERLAY MODAL */}
      <AnimatePresence>
        {showHelpOverlay && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowHelpOverlay(false);
                playBeep("click");
              }
            }}
            id="modal-qr-help-tips-overlay"
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.985, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, scale: 0.985, filter: "blur(4px)" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-800 dark:text-slate-100 font-sans relative"
            >
              {/* MODAL HEADER */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <HelpCircle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono text-[9px] font-black uppercase tracking-wider border border-amber-300 dark:border-amber-800">
                        Guia de Alinhamento
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-0.5 font-mono">
                        <Zap className="w-3 h-3 fill-emerald-500 text-emerald-500" /> 100% Precisão
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-black text-slate-900 dark:text-white mt-0.5">
                      Como Alinhar o Passe QR na Portaria
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Orientações visuais de iluminação, distância e enquadramento para leitura ultrarrápida
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowHelpOverlay(false);
                    playBeep("click");
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Fechar Guia de Dicas"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* INTERACTIVE ALIGNMENT DEMO VISUAL BOX */}
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-white space-y-3 relative overflow-hidden shadow-inner">
                {/* Visual Tab Selectors */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest shrink-0 pr-1">
                    Simulação Visual:
                  </span>
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { id: "distancia", label: "📏 Distância (15-20cm)" },
                        { id: "brilho", label: "☀️ Brilho (100%)" },
                        { id: "angulo", label: "📐 Ângulo Reto" },
                        { id: "validacao", label: "🔔 Sinal Sonoro" }
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveHelpTab(tab.id);
                          playBeep("click");
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                          activeHelpTab === tab.id
                            ? "bg-amber-500 text-slate-950 font-black shadow-sm scale-105"
                            : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TAB CONTENT DEMO CANVAS */}
                {activeHelpTab === "distancia" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Perfect alignment card */}
                    <div className="bg-emerald-950/60 border-2 border-emerald-500/80 rounded-xl p-3 flex flex-col items-center text-center space-y-2 relative overflow-hidden">
                      <span className="text-[8px] font-mono font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/30 px-2 py-0.5 rounded-full border border-emerald-400/40">
                        ✓ Ideal (15–20 cm)
                      </span>
                      {/* Interactive Viewfinder graphic */}
                      <div className="w-20 h-20 border-2 border-emerald-400 rounded-2xl relative flex items-center justify-center bg-slate-900/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <QrCode className="w-10 h-10 text-emerald-400 animate-pulse" />
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                      </div>
                      <p className="text-[9.5px] text-emerald-200 leading-tight font-sans">
                        QR preenche 50% do quadrado. Leitura instantânea!
                      </p>
                    </div>

                    {/* Too Close card */}
                    <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-3 flex flex-col items-center text-center space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-mono font-black uppercase tracking-widest text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                        ✕ Muito Perto (&lt; 10 cm)
                      </span>
                      <div className="w-20 h-20 border border-dashed border-rose-500/50 rounded-2xl relative flex items-center justify-center bg-slate-900 overflow-hidden">
                        <QrCode className="w-24 h-24 text-rose-400/60 scale-125" />
                        <div className="absolute inset-0 bg-rose-950/40 flex items-center justify-center">
                          <span className="text-[8px] font-mono font-bold text-rose-300 bg-rose-950 px-1 rounded">Fora de foco</span>
                        </div>
                      </div>
                      <p className="text-[9.5px] text-rose-200/80 leading-tight font-sans">
                        O QR extrapola as bordas do leitor e perde nitidez.
                      </p>
                    </div>

                    {/* Too Far card */}
                    <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3 flex flex-col items-center text-center space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-mono font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        ✕ Muito Longe (&gt; 40 cm)
                      </span>
                      <div className="w-20 h-20 border border-dashed border-amber-500/50 rounded-2xl relative flex items-center justify-center bg-slate-900">
                        <QrCode className="w-4 h-4 text-amber-400/60" />
                        <div className="absolute bottom-1 text-[7.5px] font-mono text-amber-300">Pequeno demais</div>
                      </div>
                      <p className="text-[9.5px] text-amber-200/80 leading-tight font-sans">
                        Pixels do código ficam pequenos para os sensores da câmera.
                      </p>
                    </div>
                  </div>
                )}

                {activeHelpTab === "brilho" && (
                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                      <Sun className="w-8 h-8 animate-spin" style={{ animationDuration: "12s" }} />
                    </div>
                    <div className="space-y-1.5 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[8.5px] font-mono font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                          Recomendação de Tela
                        </span>
                        <span className="text-[9px] text-emerald-400 font-bold font-mono">100% Brilho</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">Aumente o Brilho do Smartphone ao Máximo</h4>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                        Telas de celular com brilho reduzido ou em modo de economia de energia refletem a iluminação do ambiente e reduzem o contraste dos pixels pretos do QR.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[9px] font-mono text-amber-200/90 pt-1">
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">💡 Desative o Modo Escuro Automático do cel se necessário</span>
                        <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">✨ Limpe a tela ou película engordurada</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeHelpTab === "angulo" && (
                  <div className="bg-slate-900/90 border border-sky-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
                      <Focus className="w-8 h-8 animate-pulse" />
                    </div>
                    <div className="space-y-1.5 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[8.5px] font-mono font-black uppercase tracking-widest bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-400/30">
                          Posicionamento Perpendicular
                        </span>
                        <span className="text-[9px] text-sky-300 font-bold font-mono">Ângulo de 90°</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">Mantenha o Dispositivo Paralelo à Câmera</h4>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                        Inclinações superiores a 40 graus distorcem os três marcadores quadrados dos cantos do QR Code. Segurar o crachá ou celular paralelo ao leitor garante decodificação instantânea.
                      </p>
                    </div>
                  </div>
                )}

                {activeHelpTab === "validacao" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-xl p-3 space-y-1 text-left">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[10px]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Bip Curto e Agudo (Sucesso)</span>
                      </div>
                      <p className="text-[9.5px] text-emerald-200/90 leading-tight">
                        Confirma que o aluno ou acompanhante possui autorização ativa no sistema. A liberação na fila ou portaria é instantânea.
                      </p>
                    </div>

                    <div className="bg-rose-950/60 border border-rose-500/50 rounded-xl p-3 space-y-1 text-left">
                      <div className="flex items-center gap-1.5 text-rose-400 font-mono font-bold text-[10px]">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>Bip Grave Duplo (Alerta/Bloqueio)</span>
                      </div>
                      <p className="text-[9.5px] text-rose-200/90 leading-tight">
                        Indica acompanhante não autorizado ou código QR expirado. A portaria exibirá o aviso vermelho de restrição de segurança.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 4 CORE TIPS CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tip 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-left transition-all hover:border-amber-300 dark:hover:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                        <Maximize2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        1. Distância de 15–20 cm
                      </h4>
                    </div>
                    <span className="text-[8px] font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Distância
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                    Mantenha o crachá ou smartphone a cerca de 20 cm da câmera. O código deve ficar dentro da mira central do quadrado verde.
                  </p>
                </div>

                {/* Tip 2 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-left transition-all hover:border-amber-300 dark:hover:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                        <Sun className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        2. Brilho no Máximo
                      </h4>
                    </div>
                    <span className="text-[8px] font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Iluminação
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                    Evite telas escuras ou reflexos de lâmpadas no vidro. Telas no brilho 100% aumentam o contraste e facilitam a leitura do sensor.
                  </p>
                </div>

                {/* Tip 3 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-left transition-all hover:border-amber-300 dark:hover:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                        <Focus className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        3. Firmeza por 1 Segundo
                      </h4>
                    </div>
                    <span className="text-[8px] font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Estabilidade
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                    Mantenha a mão estável sem tremer por 1 segundo. A linha de laser digital processa múltiplos quadros por segundo.
                  </p>
                </div>

                {/* Tip 4 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-left transition-all hover:border-amber-300 dark:hover:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
                        4. Passes de Acompanhante
                      </h4>
                    </div>
                    <span className="text-[8px] font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Segurança
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                    Passes QR de terceiros (avós, tios, motoristas) validam a autorização cadastrada pelos pais. Se estiver desativado, o acesso será bloqueado.
                  </p>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Dica: Use os simuladores rápidos abaixo da tela para testar sem câmera física.</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setShowHelpOverlay(false);
                      playBeep("click");
                      if (!isOpen) {
                        setIsOpen(true);
                        startCamera();
                      }
                    }}
                    style={{ backgroundColor: branding.primaryColor }}
                    className="w-full sm:w-auto px-4 py-2 text-white text-[10px] uppercase font-black tracking-wider rounded-xl transition-all shadow-md hover:opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Entendi, Iniciar Leitura ✓</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
