import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  RotateCcw, 
  Check, 
  X, 
  Upload, 
  SwitchCamera, 
  Timer, 
  AlertCircle
} from "lucide-react";
import { Estudante } from "../types";

interface StudentPhotoCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Estudante | null;
  onPhotoCaptured: (studentId: string, photoDataUrl: string) => void;
  onToast?: (message: string, type: "success" | "error" | "info") => void;
}

export default function StudentPhotoCameraModal({
  isOpen,
  onClose,
  student,
  onPhotoCaptured,
  onToast,
}: StudentPhotoCameraModalProps) {
  const [cameraPermission, setCameraPermission] = useState<"idle" | "granted" | "denied" | "unsupported">("idle");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [useTimer, setUseTimer] = useState<boolean>(false);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop video stream helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start camera stream
  const startCamera = useCallback(async (mode: "user" | "environment") => {
    stopCameraStream();
    setCapturedPhoto(null);
    setCountdown(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermission("unsupported");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraPermission("granted");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn("Camera stream access issue:", err);
      // If requested facingMode failed, try generic video constraint
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        setCameraPermission("granted");
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.setAttribute("playsinline", "true");
          await videoRef.current.play().catch(() => {});
        }
      } catch (fallbackErr) {
        setCameraPermission("denied");
      }
    }
  }, [stopCameraStream]);

  // Handle open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      setCameraPermission("idle");
      startCamera(facingMode);
    } else {
      stopCameraStream();
      setCapturedPhoto(null);
      setCountdown(null);
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, facingMode, startCamera, stopCameraStream]);

  // Take the snapshot from the video stream
  const takeSnapshot = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual flash
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 180);

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Crop center square for high fidelity profile avatar
    const squareSize = Math.min(videoWidth, videoHeight);
    const startX = (videoWidth - squareSize) / 2;
    const startY = (videoHeight - squareSize) / 2;

    const canvas = document.createElement("canvas");
    const outputSize = 512; // Crisp resolution for avatar
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // If using front camera, mirror horizontally for natural mirror feel
      if (facingMode === "user") {
        ctx.translate(outputSize, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(
        video,
        startX,
        startY,
        squareSize,
        squareSize,
        0,
        0,
        outputSize,
        outputSize
      );

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedPhoto(dataUrl);
      stopCameraStream();
    }
  }, [facingMode, stopCameraStream]);

  // Trigger capture with optional countdown
  const handleCaptureClick = () => {
    if (useTimer) {
      setCountdown(3);
      const timerInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerInterval);
            takeSnapshot();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      takeSnapshot();
    }
  };

  // Switch facing mode
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Discard preview and retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(facingMode);
  };

  // Save photo and update student
  const handleConfirmSave = () => {
    if (!capturedPhoto || !student) return;
    setIsProcessing(true);

    try {
      onPhotoCaptured(student.id, capturedPhoto);
      if (onToast) {
        onToast(`Foto de perfil de ${student.name} atualizada com sucesso!`, "success");
      }
      onClose();
    } catch {
      if (onToast) {
        onToast("Erro ao salvar foto do estudante.", "error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Fallback: upload from file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
          setCapturedPhoto(dataUrl);
          stopCameraStream();
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!isOpen || !student) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Tirar Foto do Estudante
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {student.name} • {student.grade}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Viewfinder / Capture Canvas Container */}
          <div className="relative bg-slate-950 flex flex-col items-center justify-center overflow-hidden aspect-square w-full max-h-[380px]">
            {/* Visual Flash effect */}
            {flashActive && (
              <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150 pointer-events-none" />
            )}

            {/* LIVE CAMERA MODE */}
            {!capturedPhoto ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === "user" ? "scale-x-[-1]" : ""
                  }`}
                />

                {/* Aperture framing overlay guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                  {/* Framing circular guide */}
                  <div className="w-56 h-56 min-[380px]:w-64 min-[380px]:h-64 sm:w-72 sm:h-72 rounded-full border-2 border-white/60 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] relative">
                    {/* Top alignment notch */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white/70" />
                    {/* Bottom alignment notch */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-white/70" />
                  </div>
                </div>

                {/* Countdown banner */}
                {countdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30 pointer-events-none">
                    <span className="text-7xl font-mono font-black text-white drop-shadow-md animate-ping">
                      {countdown}
                    </span>
                  </div>
                )}

                {/* Camera Permission / Error fallback state */}
                {cameraPermission === "denied" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-white z-20 space-y-3">
                    <AlertCircle className="w-10 h-10 text-amber-400" />
                    <h4 className="text-sm font-bold">Câmera bloqueada ou indisponível</h4>
                    <p className="text-xs text-slate-300 max-w-xs">
                      Permita o acesso à câmera no seu navegador ou selecione uma foto salva no dispositivo.
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Selecionar Arquivo</span>
                    </button>
                  </div>
                )}

                {/* Guidance text bar */}
                <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none">
                  <span className="bg-black/60 text-white/90 text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-xs">
                    Centralize o rosto do estudante no círculo
                  </span>
                </div>
              </>
            ) : (
              /* PHOTO PREVIEW MODE */
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                <img
                  src={capturedPhoto}
                  alt="Pré-visualização da foto"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                  <span>Foto capturada</span>
                </div>
              </div>
            )}
          </div>

          {/* Hidden File Input for fallback uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Controls Footer */}
          <div className="p-3 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            {!capturedPhoto ? (
              /* LIVE CONTROLS */
              <div className="flex items-center justify-between gap-1.5 sm:gap-3">
                {/* Timer toggle */}
                <button
                  type="button"
                  onClick={() => setUseTimer(!useTimer)}
                  className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border shrink-0 ${
                    useTimer
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                  title={useTimer ? "Temporizador ativado (3 segundos)" : "Temporizador desligado"}
                >
                  <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{useTimer ? "3s" : "0s"}</span>
                </button>

                {/* Primary Shutter Button */}
                <button
                  type="button"
                  onClick={handleCaptureClick}
                  disabled={cameraPermission === "denied"}
                  className="px-3.5 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer flex-1 sm:flex-initial"
                >
                  <Camera className="w-4 h-4 shrink-0" />
                  <span className="truncate">{countdown !== null ? `Capturando (${countdown})...` : "Tirar Foto"}</span>
                </button>

                {/* Switch Camera / Upload Alternate */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title={facingMode === "user" ? "Alternar para câmera traseira" : "Alternar para câmera frontal"}
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    title="Carregar foto do dispositivo"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* CONFIRMATION CONTROLS */
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tirar Outra</span>
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSave}
                    disabled={isProcessing}
                    className="px-3.5 sm:px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
