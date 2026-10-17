import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 🛡️ Trust the proxy headers (e.g. Cloud Run, Nginx load balancer) to ensure correct IP parsing for rate limiters
  app.set("trust proxy", 1);

  // 🛡️ Disable X-Powered-By header to prevent technology footprinting
  app.disable("x-powered-by");

  // 🛡️ Basic HTTP Security Headers compatible with iframe dev environments in AI Studio
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // 🛡️ Global Rate Limiter applied specifically to /api routes to avoid throttling Vite dev module requests
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 300 API requests per 15 minutes
    message: { error: "Muitas requisições deste IP. Por favor, tente novamente mais tarde." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", globalLimiter);

  // 🛡️ Dedicated Strict Rate Limiter for expensive AI/Image Generation operations
  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 image generations per 15 minutes
    message: { error: "Limite de geração de imagem excedido para este IP. Tente novamente em 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // 🛡️ Rate limiter for Veo video generation operations
  const videoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 video generations per 15 minutes
    message: { error: "Limite de geração de vídeo excedido para este IP. Tente novamente em alguns minutos." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Set up body parsers with limits for handling base64 uploads cleanly
  app.use(express.json({ limit: "20mb" })); // Safe lower threshold for payload
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // Lazy-initialize client to prevent crashing on boot if the key is not set
  const getAiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but was not found.");
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API endpoint for image generation and image editing (secured with aiLimiter)
  app.post("/api/generate-image", aiLimiter, async (req, res) => {
    try {
      const { prompt, model, aspectRatio, size, base64Image, mimeType } = req.body;

      // 🛡️ Input Validation & Sanitization
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "O prompt é obrigatório e deve ser uma string de texto válida." });
      }

      if (prompt.length > 800) {
        return res.status(400).json({ error: "O prompt é muito longo. O limite de segurança é de 800 caracteres." });
      }

      // Check if prompt looks like direct malicious injection or instructions overwrite
      const promptLower = prompt.toLowerCase();
      if (promptLower.includes("ignore previous") || promptLower.includes("system prompt") || promptLower.includes("override instructions")) {
        console.warn(`[Blocked Input Injection]: Attempt detected on prompt string.`);
        return res.status(400).json({ error: "Entrada recusada por conter padrões de injeção de instruções de segurança." });
      }

      // Base64 file size constraint check (verify length is not excessively large)
      if (base64Image && base64Image.length > 12 * 1024 * 1024) { // ~9MB decoded limit
        return res.status(400).json({ error: "A imagem enviada é muito grande. O limite máximo é de 8MB." });
      }

      const ai = getAiClient();

      // Resolve the model. Supporting 'gemini-3.1-flash-image-preview' and 'gemini-3-pro-image-preview'
      const selectedModel = model === "gemini-3-pro-image-preview"
        ? "gemini-3-pro-image-preview"
        : "gemini-3.1-flash-image-preview";

      console.log(`Request matching model "${selectedModel}" with prompt length ${prompt.length}, size: "${size}"`);

      const parts: any[] = [];

      if (base64Image) {
        // Image editing request: clean base64 prefix
        const cleanedBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: {
            data: cleanedBase64,
            mimeType: mimeType || "image/png",
          },
        });
        parts.push({ text: prompt });
      } else {
        parts.push({ text: prompt });
      }

      const config: any = {};

      // Configure image output configurations
      if (aspectRatio || size) {
        config.imageConfig = {};
        if (aspectRatio) {
          config.imageConfig.aspectRatio = aspectRatio;
        }
        if (size) {
          config.imageConfig.imageSize = size; // "1K", "2K", "4K"
        }
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: { parts },
        config,
      });

      if (!response.candidates?.[0]?.content?.parts) {
        return res.status(500).json({ error: "O modelo de IA não retornou imagens candidatas válidas." });
      }

      let generatedBase64 = "";
      let helperText = "";

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedBase64 = part.inlineData.data;
          break;
        } else if (part.text) {
          helperText += part.text + " ";
        }
      }

      if (!generatedBase64) {
        return res.status(500).json({
          error: helperText ? `Resposta do modelo: ${helperText.trim()}` : "Os dados da imagem não foram retornados.",
        });
      }

      res.json({
        success: true,
        base64: generatedBase64,
        mimeType: "image/png",
        modelUsed: selectedModel,
      });

    } catch (err: any) {
      console.error("Express backend Gemini call error:", err);
      // 🛡️ Do not leak raw/internal backend stack traces to the client for privacy and security
      res.status(500).json({
        error: "Ocorreu um erro interno de processamento durante a geração de imagem. Tente novamente em breve.",
      });
    }
  });

  // API endpoint for generating custom descriptive pedagogical reports with Gemini
  app.post("/api/generate-pedagogical-report", aiLimiter, async (req, res) => {
    try {
      const { studentName, grade, grades, occurrences, focusArea } = req.body;

      // 🛡️ Helper function to scan inputs for prompt injection vectors
      const checkInjection = (text: string): boolean => {
        const lower = text.toLowerCase();
        return (
          lower.includes("ignore previous") ||
          lower.includes("system prompt") ||
          lower.includes("override instructions") ||
          lower.includes("ignore system instructions") ||
          lower.includes("you are now a") ||
          lower.includes("jailbreak")
        );
      };

      // 🛡️ Rigorous Input Validation & Sanitization
      if (!studentName || typeof studentName !== "string") {
        return res.status(400).json({ error: "O nome do estudante é obrigatório e deve ser um texto válido." });
      }
      if (studentName.length > 100) {
        return res.status(400).json({ error: "O nome do estudante é muito longo. O limite de segurança é de 100 caracteres." });
      }
      if (checkInjection(studentName)) {
        return res.status(400).json({ error: "Entrada recusada por conter padrões de injeção de instruções de segurança." });
      }

      if (grade && (typeof grade !== "string" || grade.length > 50)) {
        return res.status(400).json({ error: "Série escolar inválida ou muito longa (limite de 50 caracteres)." });
      }
      if (grade && checkInjection(grade)) {
        return res.status(400).json({ error: "Entrada recusada por conter padrões de injeção de instruções de segurança." });
      }

      if (focusArea && (typeof focusArea !== "string" || focusArea.length > 200)) {
        return res.status(400).json({ error: "O foco específico solicitado é muito longo (limite de 200 caracteres)." });
      }
      if (focusArea && checkInjection(focusArea)) {
        return res.status(400).json({ error: "Entrada recusada por conter padrões de injeção de instruções de segurança." });
      }

      // Check grades size & content
      const gradesStr = grades ? JSON.stringify(grades) : "";
      if (gradesStr.length > 4000) {
        return res.status(400).json({ error: "As notas e feedbacks fornecidos excedem o tamanho máximo permitido de segurança." });
      }
      if (checkInjection(gradesStr)) {
        return res.status(400).json({ error: "Entrada recusada por conter padrões de injeção de instruções de segurança." });
      }

      // Check occurrences size & content
      const occurrencesStr = occurrences ? JSON.stringify(occurrences) : "";
      if (occurrencesStr.length > 4000) {
        return res.status(400).json({ error: "As ocorrências fornecidas excedem o tamanho máximo permitido de segurança." });
      }
      if (checkInjection(occurrencesStr)) {
        return res.status(400).json({ error: "Entrada recusada por conter padrões de injeção de instruções de segurança." });
      }

      const ai = getAiClient();

      const prompt = `
        Você é o Coordenador Pedagógico sênior de um colégio de alto padrão (Magic Learning) e deve redigir um parecer pedagógico descritivo e humanizado do rendimento semestral para os pais do(a) aluno(a) "${studentName}", que está no "${grade}".

        Aqui estão as notas do boletim e os feedbacks cadastrados pelos professores nas disciplinas:
        ${JSON.stringify(grades, null, 2)}

        Aqui estão as ocorrências de comportamento e rotina diária preenchidas:
        ${JSON.stringify(occurrences, null, 2)}

        O foco específico solicitado para este parecer é: "${focusArea || "Desenvolvimento Geral (Cognitivo, Socioemocional e Rotina)"}".

        Instruções estritas de formatação e tom:
        1. Tom acolhedor, empático, altamente profissional e pautado na pedagogia positiva. Mostre parceria escola-família.
        2. Linguagem clara e envolvente, sem jargões corporativos vazios.
        3. Formate a resposta usando parágrafos estruturados de HTML (use <p> e <strong class="text-amber-800"> para destacar seções importantes). NÃO use títulos grandes com # ou markdown pesado, apenas parágrafos limpos.
        4. Divida obrigatoriamente a resposta em 3 seções:
           - <p><strong class="text-indigo-800">1. Desempenho e Evolução Acadêmica:</strong> [Fale do rendimento, elogie pontos fortes com notas >= 8 e incentive melhorias onde nota < 7 com propostas de carinho]</p>
           - <p><strong class="text-emerald-800">2. Convivência, Socioemocional e Rotina:</strong> [Sintetize como se alimenta, dorme e se comporta na escola com base nas ocorrências]</p>
           - <p><strong class="text-amber-900">3. Plano de Apoio e Metas Compartilhadas:</strong> [Indique 2 ações práticas para casa e escola ajudarem o desenvolvimento]</p>
        5. Escreva inteiramente em português do Brasil (pt-BR).
        6. O texto deve ter de 150 a 300 palavras. Seja conciso e impactante.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const generatedText = response.text || "Não foi possível gerar o parecer no momento.";

      res.json({
        success: true,
        report: generatedText,
      });

    } catch (err: any) {
      console.error("Error generating pedagogical report:", err);
      res.status(500).json({
        error: "Ocorreu um erro interno de processamento ao gerar o relatório pedagógico. Tente novamente em breve.",
      });
    }
  });

  // 🎬 API endpoint for Veo video generation from school photos
  app.post("/api/generate-video", videoLimiter, async (req, res) => {
    try {
      const { prompt, base64Image, mimeType, aspectRatio } = req.body;

      if (prompt && typeof prompt === "string" && prompt.length > 800) {
        return res.status(400).json({ error: "O prompt é muito longo (limite de 800 caracteres)." });
      }

      if (base64Image && base64Image.length > 15 * 1024 * 1024) {
        return res.status(400).json({ error: "A imagem é muito grande. Limite de 10MB." });
      }

      const ai = getAiClient();
      const targetAspectRatio = aspectRatio === "9:16" ? "9:16" : "16:9";
      const modelToUse = "veo-3.1-fast-generate-preview";

      const cleanedBase64 = base64Image ? base64Image.replace(/^data:image\/\w+;base64,/, "") : null;
      const defaultPrompt = "Cinematic slow-motion shot of this school setting, gentle natural breeze, pupils and educators interacting with warmth and dedication, bright sunlight filtering through windows, smooth atmospheric camera glide.";
      const finalPrompt = prompt && typeof prompt === "string" && prompt.trim() ? prompt.trim() : defaultPrompt;

      console.log(`[Veo Video] Starting generation with model: ${modelToUse}, aspect ratio: ${targetAspectRatio}, hasImage: ${Boolean(cleanedBase64)}`);

      let operation: any;
      try {
        operation = await ai.models.generateVideos({
          model: modelToUse,
          prompt: finalPrompt,
          image: cleanedBase64 ? {
            imageBytes: cleanedBase64,
            mimeType: mimeType || "image/jpeg",
          } : undefined,
          config: {
            numberOfVideos: 1,
            aspectRatio: targetAspectRatio,
            resolution: "720p",
          },
        });
      } catch (fastErr: any) {
        console.warn(`[Veo Video] ${modelToUse} error (${fastErr.message}), trying veo-3.1-lite-generate-preview fallback...`);
        operation = await ai.models.generateVideos({
          model: "veo-3.1-lite-generate-preview",
          prompt: finalPrompt,
          image: cleanedBase64 ? {
            imageBytes: cleanedBase64,
            mimeType: mimeType || "image/jpeg",
          } : undefined,
          config: {
            numberOfVideos: 1,
            aspectRatio: targetAspectRatio,
            resolution: "720p",
          },
        });
      }

      if (!operation || !operation.name) {
        return res.status(500).json({ error: "Falha ao inicializar a operação com o modelo Veo." });
      }

      console.log(`[Veo Video] Operation initiated successfully: ${operation.name}`);
      res.json({
        success: true,
        operationName: operation.name,
        aspectRatio: targetAspectRatio,
      });
    } catch (err: any) {
      console.error("[Veo Video] Error generating video:", err);
      res.status(500).json({
        error: err.message || "Erro ao processar geração de vídeo com Veo. Verifique a chave de API e tente novamente.",
      });
    }
  });

  // 🎬 API endpoint to poll video generation status
  app.post("/api/video-status", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName || typeof operationName !== "string") {
        return res.status(400).json({ error: "operationName é obrigatório." });
      }

      const ai = getAiClient();
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      res.json({
        done: Boolean(updated.done),
        error: updated.error || null,
      });
    } catch (err: any) {
      console.error("[Veo Video] Error checking video status:", err);
      res.status(500).json({ error: err.message || "Erro ao consultar status da geração de vídeo." });
    }
  });

  // 🎬 API endpoint to download video stream securely
  app.post("/api/video-download", async (req, res) => {
    try {
      const { operationName } = req.body;
      if (!operationName || typeof operationName !== "string") {
        return res.status(400).json({ error: "operationName é obrigatório." });
      }

      const ai = getAiClient();
      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
      if (!uri) {
        return res.status(404).json({ error: "Vídeo ainda não disponível ou link de download não retornado." });
      }

      const key = process.env.GEMINI_API_KEY;
      const videoRes = await fetch(uri, {
        headers: { "x-goog-api-key": key || "" },
      });

      if (!videoRes.ok) {
        return res.status(videoRes.status).json({ error: `Erro ao transferir vídeo da fonte: ${videoRes.statusText}` });
      }

      const arrayBuffer = await videoRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Length", buffer.length);
      res.setHeader("Content-Disposition", 'inline; filename="escola_veo_animada.mp4"');
      res.send(buffer);
    } catch (err: any) {
      console.error("[Veo Video] Error downloading video:", err);
      res.status(500).json({ error: err.message || "Erro ao fazer download do vídeo gerado." });
    }
  });

  // Provide a quick server health status
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", time: new Date().toISOString() });
  });

  // Serve Vite assets in development or build outputs in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
