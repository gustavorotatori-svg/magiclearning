import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Bell,
  BellRing,
  BellOff,
  Volume2,
  Smartphone,
  MessageSquare,
  Clock,
  Tag,
  ShieldCheck,
  GraduationCap,
  DollarSign,
  Moon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";
import {
  pushNotificationService,
  PushNotificationPreferences,
  PushPermissionState,
} from "../services/pushNotificationService";
import { NotificationItem } from "../types";

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationTriggered?: (item: NotificationItem) => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  onNotificationTriggered,
}) => {
  const [preferences, setPreferences] = useState<PushNotificationPreferences>(() =>
    pushNotificationService.getPreferences()
  );
  const [permissionState, setPermissionState] = useState<PushPermissionState>(() =>
    pushNotificationService.getPermissionStatus()
  );
  const [testStatusMessage, setTestStatusMessage] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreferences(pushNotificationService.getPreferences());
      setPermissionState(pushNotificationService.getPermissionStatus());
      setTestStatusMessage(null);
    }
  }, [isOpen]);

  const handleUpdate = (updates: Partial<PushNotificationPreferences>) => {
    const updated = pushNotificationService.savePreferences(updates);
    setPreferences(updated);
  };

  const handleRequestBrowserPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const state = await pushNotificationService.requestBrowserPermission();
      setPermissionState(state);
      if (state === "granted") {
        setTestStatusMessage("Permissão concedida pelo navegador! Notificações push ativadas.");
      } else if (state === "denied") {
        setTestStatusMessage("O navegador bloqueou as notificações. Desbloqueie no ícone de cadeado da barra de endereço.");
      }
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleTestChime = () => {
    pushNotificationService.playChimeSound();
    setTestStatusMessage("Sino sutil reproduzido com sucesso via Web Audio.");
    setTimeout(() => setTestStatusMessage(null), 3000);
  };

  // Live event simulations
  const handleTestNewMessage = async () => {
    const res = await pushNotificationService.triggerNewMessage({
      sender: "Coordenação Pedagógica",
      message: "Nova mensagem: Reunião bimestral de alinhamento com a família agendada para sexta-feira às 15h.",
    });
    if (res.delivered) {
      setTestStatusMessage("Notificação de 'Nova Mensagem' enviada com sucesso!");
      onNotificationTriggered?.(res.notification);
    } else {
      setTestStatusMessage(`Não entregue: ${res.reason}`);
    }
    setTimeout(() => setTestStatusMessage(null), 4000);
  };

  const handleTestUpcomingDeadline = async () => {
    const res = await pushNotificationService.triggerUpcomingDeadline({
      title: "Mensalidade Escolar Novembro/2026",
      daysRemaining: 3,
      amount: 1480.0,
    });
    if (res.delivered) {
      setTestStatusMessage("Notificação de 'Prazo Próximo' enviada com sucesso!");
      onNotificationTriggered?.(res.notification);
    } else {
      setTestStatusMessage(`Não entregue: ${res.reason}`);
    }
    setTimeout(() => setTestStatusMessage(null), 4000);
  };

  const handleTestSpecialPromotion = async () => {
    const res = await pushNotificationService.triggerSpecialPromotion({
      title: "Campanha Rematrícula Antecipada 2027",
      discountPercent: 20,
      description: "Garanta 20% de desconto e isenção da taxa de matrícula antecipada confirmando sua vaga até o fim do mês.",
    });
    if (res.delivered) {
      setTestStatusMessage("Notificação de 'Promoção Especial' enviada com sucesso!");
      onNotificationTriggered?.(res.notification);
    } else {
      setTestStatusMessage(`Não entregue: ${res.reason}`);
    }
    setTimeout(() => setTestStatusMessage(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Preferências de Notificações Push
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Personalize canais, categorias de eventos e horários de silêncio
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-slate-100">
            {/* 1. Browser Native Push Status Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Status no Navegador
                  </span>
                  {permissionState === "granted" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Permitido & Ativo
                    </span>
                  )}
                  {permissionState === "denied" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Bloqueado pelo Navegador
                    </span>
                  )}
                  {permissionState === "default" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <BellOff className="w-3.5 h-3.5" />
                      Aguardando Permissão
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {permissionState === "granted"
                    ? "Notificações na área de trabalho e tela de bloqueio estão autorizadas para este dispositivo."
                    : permissionState === "denied"
                    ? "Para receber avisos fora do aplicativo, clique no cadeado da barra de endereço e autorize notificações."
                    : "Autorize o navegador para receber avisos imediatos mesmo com o aplicativo em segundo plano."}
                </p>
              </div>

              {permissionState !== "granted" && (
                <button
                  type="button"
                  onClick={handleRequestBrowserPermission}
                  disabled={isRequestingPermission}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 text-center flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>{isRequestingPermission ? "Solicitando..." : "Habilitar no Navegador"}</span>
                </button>
              )}
            </div>

            {/* 2. Master & Delivery Channels */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Serviço Geral de Notificações
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Ativa ou pausa todos os alertas do sistema simultaneamente
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdate({ masterEnabled: !preferences.masterEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    preferences.masterEnabled ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  aria-label="Ativar Notificações Globais"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      preferences.masterEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Delivery Channels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Browser Push */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <div>
                      <span className="text-xs font-bold block text-slate-900 dark:text-white">Push no Navegador</span>
                      <span className="text-[10px] text-slate-500">Alertas no sistema</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.browserPushEnabled}
                    onChange={(e) => handleUpdate({ browserPushEnabled: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                  />
                </div>

                {/* Sound Chime */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <span className="text-xs font-bold block text-slate-900 dark:text-white">Alerta Sonoro</span>
                      <span className="text-[10px] text-slate-500">Sino suave Web Audio</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleTestChime}
                      className="p-1 rounded text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer"
                      title="Testar som"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <input
                      type="checkbox"
                      checked={preferences.soundEnabled}
                      onChange={(e) => handleUpdate({ soundEnabled: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                    />
                  </div>
                </div>

                {/* Mobile Vibration */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold block text-slate-900 dark:text-white">Vibração Móvel</span>
                      <span className="text-[10px] text-slate-500">Feedback tátil celular</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.vibrationEnabled}
                    onChange={(e) => handleUpdate({ vibrationEnabled: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* 3. KEY EVENT CATEGORIES (Directly requested by user) */}
            <div className="space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Eventos Principais & Categorias de Aviso
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Selecione exatamente os tipos de mensagens e novidades que deseja receber
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* KEY EVENT 1: New Messages */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifyNewMessages}
                        onChange={(e) => handleUpdate({ notifyNewMessages: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Novas Mensagens</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Recados de professores, comunicados da secretaria e coordenação pedagógica.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestNewMessage}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <Play className="w-3 h-3" />
                    Testar Nova Mensagem
                  </button>
                </div>

                {/* KEY EVENT 2: Upcoming Deadlines */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifyDeadlines}
                        onChange={(e) => handleUpdate({ notifyDeadlines: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Prazos & Vencimentos</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Lembretes de faturas e boletos a vencer, entregas de trabalhos e encerramento de prazos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestUpcomingDeadline}
                    className="text-[10px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <Play className="w-3 h-3" />
                    Testar Prazo Próximo
                  </button>
                </div>

                {/* KEY EVENT 3: Special Promotions */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Tag className="w-4 h-4" />
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.notifyPromotions}
                        onChange={(e) => handleUpdate({ notifyPromotions: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                      />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Promoções Especiais</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      Descontos de rematrícula antecipada, condições especiais de pontualidade e eventos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestSpecialPromotion}
                    className="text-[10px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <Play className="w-3 h-3" />
                    Testar Promoção
                  </button>
                </div>
              </div>

              {/* Additional Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Portaria & QR Code</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifySecurity}
                    onChange={(e) => handleUpdate({ notifySecurity: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Boletim & Notas</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifyAcademic}
                    onChange={(e) => handleUpdate({ notifyAcademic: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Faturamento & Pix</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifyFinancial}
                    onChange={(e) => handleUpdate({ notifyFinancial: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer accent-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* 4. Quiet Hours (Horário de Silêncio) */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Horário de Silêncio</h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Silencia alertas sonoros e notificações durante seu descanso
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdate({ quietHoursEnabled: !preferences.quietHoursEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    preferences.quietHoursEnabled ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                  aria-label="Ativar Horário de Silêncio"
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      preferences.quietHoursEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {preferences.quietHoursEnabled && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Início:</span>
                      <input
                        type="time"
                        value={preferences.quietHoursStart}
                        onChange={(e) => handleUpdate({ quietHoursStart: e.target.value })}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Término:</span>
                      <input
                        type="time"
                        value={preferences.quietHoursEnd}
                        onChange={(e) => handleUpdate({ quietHoursEnd: e.target.value })}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.bypassQuietHoursForUrgent}
                      onChange={(e) => handleUpdate({ bypassQuietHoursForUrgent: e.target.checked })}
                      className="w-3.5 h-3.5 text-amber-600 rounded accent-amber-600"
                    />
                    <span>Permitir notificações urgentes da escola mesmo durante o silêncio</span>
                  </label>
                </div>
              )}
            </div>

            {/* Test Status Feedback Banner */}
            {testStatusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center justify-between"
              >
                <span>{testStatusMessage}</span>
                <button
                  type="button"
                  onClick={() => setTestStatusMessage(null)}
                  className="text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={() => {
                const defaults = pushNotificationService.savePreferences({
                  masterEnabled: true,
                  browserPushEnabled: true,
                  soundEnabled: true,
                  vibrationEnabled: true,
                  notifyNewMessages: true,
                  notifyDeadlines: true,
                  notifyPromotions: true,
                  notifySecurity: true,
                  notifyAcademic: true,
                  notifyFinancial: true,
                  quietHoursEnabled: false,
                });
                setPreferences(defaults);
                setTestStatusMessage("Preferências restauradas para o padrão recomendado.");
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Concluir & Salvar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
