import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Film, 
  Upload, 
  Play, 
  Pause, 
  Download, 
  RefreshCw, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles, 
  Video, 
  Sliders, 
  Image as ImageIcon,
  CheckCircle2,
  Maximize2
} from "lucide-react";

interface VeoVideoAnimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPhotoUrl: string;
  onApplyVideoToHero: (videoUrl: string, aspectRatio: "16:9" | "9:16") => void;
}

export const VeoVideoAnimateModal: React.FC<VeoVideoAnimateModalProps> = ({
  isOpen,
  onClose,
  defaultPhotoUrl,
  onApplyVideoToHero,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(defaultPhotoUrl);
  const [isCustomUpload, setIsCustomUpload] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [promptPreset, setPromptPreset] = useState<string>("movimento_natural");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollingIntervalRef = useRef<any>(null);

  // Curated educational prompt presets designed for Veo
  const promptPresets: { id: string; title: string; description: string; prompt: string }[] = [
    {
      id: "movimento_natural",
      title: "Vida Escolar & Brisa Natural",
      description: "Movimento orgânico sutil, luz dourada entrando pelas janelas e alunos interagindo com serenidade.",
      prompt: "Cinematic slow-motion shot of this school setting, gentle natural breeze, pupils and educators interacting with warmth and dedication, bright daylight, smooth atmospheric camera glide.",
    },
    {
      id: "laboratorio_ativo",
      title: "Laboratório & Ciências",
      description: "Foco dinâmico nos experimentos práticos, curiosidade pedagógica e detalhes em alta definição.",
      prompt: "Dynamic slow-motion cinematic view of students actively engaged in discovery and science learning, soft natural light, shallow depth of field, authentic collegiate atmosphere.",
    },
    {
      id: "patio_recreio",
      title: "Convivência & Pátio",
      description: "Profundidade de campo cinematográfica com crianças socializando harmoniosamente nos espaços de convivência.",
      prompt: "Slow cinematic pan across school courtyard and study hall, happy children and attentive teachers, warm sunny morning atmosphere, subtle natural motion, photorealistic 4k quality.",
    },
  ];

  // Cleanup polling and video blob URLs on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Por favor, selecione um arquivo de imagem válido (PNG ou JPG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("A imagem selecionada excede o limite máximo de 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedPhoto(reader.result);
        setIsCustomUpload(true);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefaultPhoto = () => {
    setSelectedPhoto(defaultPhotoUrl);
    setIsCustomUpload(false);
    setErrorMsg(null);
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedVideoUrl(null);
    setIsApplied(false);
    setProgressPercent(10);
    setGenerationStep("Iniciando requisição ao modelo Veo (veo-3.1-fast-generate-preview)...");

    try {
      const activePreset = promptPresets.find(p => p.id === promptPreset);
      const finalPrompt = customPrompt.trim() 
        ? customPrompt.trim() 
        : (activePreset?.prompt || promptPresets[0].prompt);

      // 1. Iniciar geração no backend
      const startRes = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          base64Image: selectedPhoto,
          mimeType: selectedPhoto.startsWith("data:image/png") ? "image/png" : "image/jpeg",
          aspectRatio,
        }),
      });

      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({}));
        throw new Error(errData.error || "Falha ao iniciar processamento de vídeo com Veo.");
      }

      const { operationName } = await startRes.json();
      if (!operationName) {
        throw new Error("Identificador da operação não retornado pelo servidor.");
      }

      setGenerationStep("Sintetizando interpolação temporal de quadros com Google Veo...");
      setProgressPercent(30);

      // 2. Iniciar polling da operação
      let attempts = 0;
      const maxAttempts = 40; // ~2 a 3 minutos no total
      
      const poll = async () => {
        attempts++;
        const currentProgress = Math.min(30 + Math.round((attempts / maxAttempts) * 60), 92);
        setProgressPercent(currentProgress);

        if (attempts > 5 && attempts < 15) {
          setGenerationStep("Renderizando profundidade ótica e física de iluminação natural...");
        } else if (attempts >= 15 && attempts < 25) {
          setGenerationStep("Estabilizando taxa de quadros e aplicando modelo temporal Veo...");
        } else if (attempts >= 25) {
          setGenerationStep("Finalizando codificação do vídeo MP4...");
        }

        try {
          const statusRes = await fetch("/api/video-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operationName }),
          });

          if (!statusRes.ok) {
            throw new Error("Erro de comunicação ao consultar status da operação.");
          }

          const statusData = await statusRes.json();

          if (statusData.error) {
            throw new Error(statusData.error.message || "Erro retornado pela infraestrutura Veo.");
          }

          if (statusData.done) {
            clearInterval(pollingIntervalRef.current);
            setGenerationStep("Baixando arquivo de vídeo gerado...");
            setProgressPercent(98);

            // 3. Baixar vídeo final
            const downloadRes = await fetch("/api/video-download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ operationName }),
            });

            if (!downloadRes.ok) {
              const dlErr = await downloadRes.json().catch(() => ({}));
              throw new Error(dlErr.error || "Erro ao receber arquivo MP4 do servidor.");
            }

            const videoBlob = await downloadRes.blob();
            const blobUrl = URL.createObjectURL(videoBlob);

            setGeneratedVideoUrl(blobUrl);
            setProgressPercent(100);
            setGenerationStep("Vídeo gerado com sucesso!");
            setIsGenerating(false);
          } else if (attempts >= maxAttempts) {
            clearInterval(pollingIntervalRef.current);
            throw new Error("A geração demorou mais que o esperado. O processo continuará em background; por favor tente consultar em instantes.");
          }
        } catch (pollErr: any) {
          clearInterval(pollingIntervalRef.current);
          setIsGenerating(false);
          setErrorMsg(pollErr.message || "Ocorreu uma falha no processamento.");
        }
      };

      pollingIntervalRef.current = setInterval(poll, 4000);

    } catch (err: any) {
      setIsGenerating(false);
      setErrorMsg(err.message || "Erro inesperado ao gerar vídeo.");
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleApplyToHero = () => {
    if (!generatedVideoUrl) return;
    onApplyVideoToHero(generatedVideoUrl, aspectRatio);
    setIsApplied(true);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="veo-video-animate-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif font-bold text-slate-900 dark:text-white">
                  Animar Foto Escolar com Veo AI
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold uppercase tracking-wider border border-amber-300/40">
                  veo-3.1-fast-generate-preview
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Geração de vídeo de alta fidelidade a partir de fotos da comunidade escolar
              </p>
            </div>
          </div>

          <button
            id="btn-close-veo-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[78vh] overflow-y-auto">
          
          {/* Left Column: Visual Preview (Photo or Generated Video) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <ImageIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {generatedVideoUrl ? "Vídeo Gerado (Resultado)" : "Imagem de Origem"}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Proporção: {aspectRatio}
              </span>
            </div>

            {/* Display Canvas Frame */}
            <div className={`relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center ${
              aspectRatio === "16:9" ? "aspect-video" : "aspect-[9/16] max-h-[380px] mx-auto"
            }`}>
              
              {generatedVideoUrl ? (
                // Video Result Display
                <div className="relative w-full h-full group">
                  <video
                    ref={videoRef}
                    src={generatedVideoUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Video Overlay Controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <button
                      id="btn-toggle-play-video"
                      onClick={togglePlayPause}
                      className="p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white shadow hover:scale-105 transition-transform"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <a
                      id="btn-download-veo-video"
                      href={generatedVideoUrl}
                      download={`video_escola_veo_${aspectRatio.replace(":", "x")}.mp4`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-xs font-semibold text-slate-900 dark:text-white shadow hover:bg-white transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar MP4</span>
                    </a>
                  </div>
                </div>
              ) : (
                // Source Image Preview
                <div className="relative w-full h-full">
                  <img
                    src={selectedPhoto}
                    alt="Foto da escola selecionada"
                    className="w-full h-full object-cover"
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center p-6 text-center space-y-4 text-white">
                      <div className="relative">
                        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                      </div>
                      <div className="space-y-1 max-w-sm">
                        <p className="text-sm font-semibold">{generationStep}</p>
                        <p className="text-xs text-slate-400 font-mono">
                          Progresso estimado: {progressPercent}%
                        </p>
                      </div>
                      <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Photo Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                id="btn-upload-new-photo"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>{isCustomUpload ? "Trocar Imagem do Computador" : "Subir Foto da Minha Escola"}</span>
              </button>

              {isCustomUpload && (
                <button
                  id="btn-reset-default-photo"
                  type="button"
                  onClick={handleResetToDefaultPhoto}
                  disabled={isGenerating}
                  className="text-xs text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  Restaurar foto do Colégio
                </button>
              )}
            </div>

            {/* Outcome buttons if video is generated */}
            {generatedVideoUrl && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  id="btn-apply-hero-video"
                  onClick={handleApplyToHero}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                    isApplied 
                      ? "bg-emerald-600 text-white cursor-default" 
                      : "brand-primary-bg text-white hover:brightness-105 cursor-pointer"
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aplicado na Capa da Escola!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Exibir Vídeo na Capa da Landing Page</span>
                    </>
                  )}
                </button>

                <button
                  id="btn-regenerate-variation"
                  onClick={handleStartGeneration}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Gerar Nova Variação</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Parameters & Prompt Configuration */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                1. Proporção do Vídeo
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAspectRatio("16:9")}
                  disabled={isGenerating}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    aspectRatio === "16:9"
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white ring-1 ring-amber-500"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="font-mono text-xs font-bold">16:9</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Paisagem (Ideal para Capa e Desktop)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAspectRatio("9:16")}
                  disabled={isGenerating}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    aspectRatio === "9:16"
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white ring-1 ring-amber-500"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="font-mono text-xs font-bold">9:16</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Retrato (Ideal para Stories e Celular)</span>
                </button>
              </div>
            </div>

            {/* Cinematic Motion Preset */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                2. Estilo de Movimento Cinematográfico
              </label>
              <div className="space-y-2">
                {promptPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPromptPreset(preset.id);
                      setCustomPrompt("");
                    }}
                    disabled={isGenerating}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      promptPreset === preset.id && !customPrompt
                        ? "border-amber-500/80 bg-amber-50/40 dark:bg-amber-950/20 ring-1 ring-amber-500/40"
                        : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {preset.title}
                      </span>
                      {promptPreset === preset.id && !customPrompt && (
                        <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Toggle / Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block">
                Diretiva personalizada de animação (opcional):
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ex: Câmera em travelling suave pelo corredor, professores orientando alunos..."
                maxLength={500}
                rows={2}
                disabled={isGenerating}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Não foi possível concluir a geração:</p>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                id="btn-generate-veo-video-submit"
                type="button"
                onClick={handleStartGeneration}
                disabled={isGenerating}
                className="w-full py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-widest text-white brand-primary-bg brand-hover-primary-bg shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 border border-amber-300/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Gerando Vídeo Veo ({progressPercent}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Gerar Vídeo com Veo AI</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 mt-2 font-mono">
                Processamento assíncrono seguro via servidor dedicado • Resolução 720p HD
              </p>
            </div>

          </div>

        </div>

      </motion.div>
    </div>
  );
};
