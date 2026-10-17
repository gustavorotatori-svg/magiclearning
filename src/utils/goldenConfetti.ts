/**
 * Motor nativo de partículas e confetes dourados para feedback imediato na portaria e ações de sucesso.
 * Totalmente autônomo, sem dependência de bibliotecas externas ou Web Workers com OffscreenCanvas,
 * eliminando permanentemente erros de "canvas.getBoundingClientRect is not a function".
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  shape: "circle" | "square" | "star";
}

let activeCanvas: HTMLCanvasElement | null = null;
let activeCtx: CanvasRenderingContext2D | null = null;
let activeParticles: Particle[] = [];
let animFrameId: number | null = null;
let activeTimers: NodeJS.Timeout[] = [];

// Paleta rica de dourados nobres (Gold, Amber, Solar, Champagne)
const GOLD_PALETTE = [
  "#FFD700", // Ouro Puro
  "#FFA500", // Âmbar Vibrante
  "#F59E0B", // Âmbar Profundo
  "#FBBF24", // Dourado Solar
  "#D97706", // Ouro Nobre
  "#EAB308", // Dourado Intenso
  "#FFE082", // Ouro Claro / Champanhe
  "#FFF8E1", // Brilho Estelar
  "#FCD34D"  // Dourado Sedoso
];

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function ensureCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return null;
  }

  if (activeCanvas && document.body.contains(activeCanvas) && activeCtx) {
    return { canvas: activeCanvas, ctx: activeCtx };
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.id = "golden-confetti-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "999999";

    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.scale(dpr, dpr);

    document.body.appendChild(canvas);
    activeCanvas = canvas;
    activeCtx = ctx;

    return { canvas, ctx };
  } catch {
    return null;
  }
}

function cleanupCanvas(): void {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  activeTimers.forEach(clearTimeout);
  activeTimers = [];
  activeParticles = [];

  if (activeCanvas && activeCanvas.parentNode) {
    activeCanvas.parentNode.removeChild(activeCanvas);
  }
  activeCanvas = null;
  activeCtx = null;
}

function runAnimationLoop(): void {
  if (!activeCanvas || !activeCtx) {
    cleanupCanvas();
    return;
  }

  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Clear previous frame
  activeCtx.clearRect(0, 0, width, height);

  const remainingParticles: Particle[] = [];

  for (let i = 0; i < activeParticles.length; i++) {
    const p = activeParticles[i];

    // Physics update
    p.x += p.vx + Math.sin(p.wobble) * 0.7;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.wobble += p.wobbleSpeed;
    p.rotation += p.rotationSpeed;
    p.alpha -= p.decay;

    // Filter out dead particles
    if (p.alpha <= 0.01 || p.y > height + 80) {
      continue;
    }

    remainingParticles.push(p);

    // Render particle with 3D wobble simulation
    activeCtx.save();
    activeCtx.translate(p.x, p.y);
    activeCtx.rotate(p.rotation);
    // 3D paper flutter effect
    const scaleX = Math.cos(p.wobble);
    activeCtx.scale(scaleX, 1);

    activeCtx.fillStyle = p.color;
    activeCtx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

    if (p.shape === "circle") {
      activeCtx.beginPath();
      activeCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      activeCtx.fill();
    } else if (p.shape === "star") {
      drawStar(activeCtx, 0, 0, 5, p.size * 0.9, p.size * 0.4);
    } else {
      // "square" / ribbon
      activeCtx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);
    }

    activeCtx.restore();
  }

  activeParticles = remainingParticles;

  if (activeParticles.length > 0) {
    animFrameId = requestAnimationFrame(runAnimationLoop);
  } else {
    cleanupCanvas();
  }
}

function spawnWave(
  originX: number,
  originY: number,
  count: number,
  shapes: ("circle" | "square" | "star")[],
  palette: string[],
  spreadAngle: number,
  velocityBase: number
): void {
  const env = ensureCanvas();
  if (!env) return;

  const halfSpread = (spreadAngle * Math.PI) / 360;

  for (let i = 0; i < count; i++) {
    // Angle focused upwards (-Math.PI / 2) with spread
    const angle = -Math.PI / 2 + (Math.random() * halfSpread * 2 - halfSpread);
    const speed = velocityBase * (0.65 + Math.random() * 0.7);

    activeParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.38 + Math.random() * 0.18,
      drag: 0.965,
      color: palette[Math.floor(Math.random() * palette.length)],
      alpha: 1,
      decay: 0.007 + Math.random() * 0.006,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.22,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.08 + Math.random() * 0.12,
      shape: shapes[Math.floor(Math.random() * shapes.length)]
    });
  }

  if (animFrameId === null) {
    animFrameId = requestAnimationFrame(runAnimationLoop);
  }
}

/**
 * Dispara uma animação refinada de partículas (confete dourado)
 * originando diretamente do elemento (por padrão #btn-parent-qrcode)
 * ou do centro superior da tela para fornecer feedback visual imediato ao pai ao chegar na portaria.
 */
export function triggerGoldenConfettiForPortaria(sourceElementId: string = "btn-parent-qrcode"): void {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    let originX = window.innerWidth * 0.5;
    let originY = Math.max(80, window.innerHeight * 0.28);

    const element = document.getElementById(sourceElementId);
    if (element && typeof element.getBoundingClientRect === "function") {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
      }
    }

    // Clamp coordinates to current viewport
    originX = Math.max(20, Math.min(window.innerWidth - 20, originX));
    originY = Math.max(20, Math.min(window.innerHeight - 20, originY));

    // 1º Disparo: Explosão inicial densa de confetes dourados circulares e retangulares
    spawnWave(originX, originY, 65, ["square", "circle"], GOLD_PALETTE, 80, 15);

    // 2º Disparo: Estrelas cintilantes douradas e champanhe com dispersão mais ampla (120ms)
    const t1 = setTimeout(() => {
      spawnWave(
        originX,
        originY - 10,
        45,
        ["star", "circle"],
        ["#FFD700", "#FFF8E1", "#F59E0B", "#FBBF24", "#FEF08A"],
        100,
        17
      );
    }, 120);
    activeTimers.push(t1);

    // 3º Disparo: Chuva suave de brilhos em cascata (260ms)
    const t2 = setTimeout(() => {
      spawnWave(
        originX,
        originY - 15,
        35,
        ["circle", "star"],
        ["#FFD700", "#FBBF24", "#FDE047", "#D97706"],
        65,
        12
      );
    }, 260);
    activeTimers.push(t2);
  } catch (err) {
    console.warn("Golden confetti notice:", err);
  }
}

const CELEBRATION_PALETTE = [
  "#10B981", // Esmeralda / Sucesso
  "#34D399", // Menta Claro
  "#2563EB", // Azul Real
  "#3B82F6", // Azul Vibrante
  "#F59E0B", // Âmbar Dourado
  "#FFD700", // Ouro Puro
  "#06B6D4", // Ciano
  "#6366F1", // Índigo
  "#818CF8"  // Lavanda Suave
];

/**
 * Dispara confetes festivos para confirmação de ações de sucesso,
 * como envio de e-mail de recuperação de senha ou redefinição concluída.
 */
export function triggerCelebrationConfetti(
  sourceElementId?: string,
  options?: {
    palette?: string[];
    count?: number;
    spread?: number;
  }
): void {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    let originX = window.innerWidth * 0.5;
    let originY = window.innerHeight * 0.4;

    if (sourceElementId) {
      const element = document.getElementById(sourceElementId);
      if (element && typeof element.getBoundingClientRect === "function") {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          originX = rect.left + rect.width / 2;
          originY = rect.top + rect.height / 2;
        }
      }
    }

    // Clamp coordinates to current viewport
    originX = Math.max(20, Math.min(window.innerWidth - 20, originX));
    originY = Math.max(20, Math.min(window.innerHeight - 20, originY));

    const palette = options?.palette || CELEBRATION_PALETTE;
    const baseCount = options?.count || 55;
    const spread = options?.spread || 85;

    // 1ª Onda: explosão vigorosa com estrelas e retângulos comemorativos
    spawnWave(originX, originY, baseCount, ["square", "star", "circle"], palette, spread, 16);

    // 2ª Onda: dispersão mais ampla e suave após 100ms
    const t1 = setTimeout(() => {
      spawnWave(
        originX,
        originY - 8,
        Math.floor(baseCount * 0.7),
        ["circle", "star"],
        palette,
        spread + 20,
        14
      );
    }, 100);
    activeTimers.push(t1);

    // 3ª Onda: cascata sutil de partículas cintilantes após 220ms
    const t2 = setTimeout(() => {
      spawnWave(
        originX,
        originY - 12,
        Math.floor(baseCount * 0.5),
        ["star", "square"],
        palette,
        spread - 10,
        11
      );
    }, 220);
    activeTimers.push(t2);
  } catch (err) {
    console.warn("Celebration confetti notice:", err);
  }
}


