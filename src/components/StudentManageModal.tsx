import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Phone, Mail, GraduationCap, CheckCircle2, AlertCircle } from "lucide-react";
import { Estudante } from "../types";

interface StudentManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Partial<Estudante>) => void;
  studentToEdit?: Estudante | null;
}

const GRADE_OPTIONS = [
  "Maternal I",
  "Maternal II",
  "Jardim I",
  "Jardim II",
  "1º Ano Fundamental A",
  "1º Ano Fundamental B",
  "2º Ano Fundamental A",
  "2º Ano Fundamental B",
  "3º Ano Fundamental A",
  "3º Ano Fundamental B",
  "4º Ano Fundamental A",
  "4º Ano Fundamental B",
  "5º Ano Fundamental A",
  "6º Ano Fundamental A",
  "7º Ano Fundamental A",
  "8º Ano Fundamental A",
  "9º Ano Fundamental A",
  "1º Ano Médio",
  "2º Ano Médio",
  "3º Ano Médio"
];

export const StudentManageModal: React.FC<StudentManageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit = null
}) => {
  const isEditing = !!studentToEdit;

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("1º Ano Fundamental A");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [reEnrollmentStatus, setReEnrollmentStatus] = useState<"pendente" | "em_analise" | "concluido">("pendente");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name || "");
      setGrade(studentToEdit.grade || "1º Ano Fundamental A");
      setParentName(studentToEdit.parentName || "");
      setParentPhone(studentToEdit.parentPhone || "");
      setParentEmail(studentToEdit.parentEmail || "");
      setReEnrollmentStatus(studentToEdit.reEnrollmentStatus || "pendente");
    } else {
      setName("");
      setGrade("1º Ano Fundamental A");
      setParentName("");
      setParentPhone("");
      setParentEmail("");
      setReEnrollmentStatus("pendente");
    }
    setErrors({});
  }, [studentToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Nome do estudante é obrigatório.";
    if (!parentName.trim()) newErrors.parentName = "Nome do responsável é obrigatório.";
    if (!parentPhone.trim()) newErrors.parentPhone = "Telefone do responsável é obrigatório.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: name.trim(),
      grade,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      parentEmail: parentEmail.trim() || `${name.trim().toLowerCase().replace(/\s+/g, ".")}@familia.edu.br`,
      reEnrollmentStatus
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{isEditing ? "Editar Ficha do Estudante" : "Cadastrar Novo Estudante"}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? "Atualize os dados cadastrais e de contato do aluno." : "Matricule um novo aluno na base do CRM escolar."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Student Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nome Completo do Aluno *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                }}
                placeholder="Ex: Pedro Henrique Nogueira"
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 ${
                  errors.name
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
                }`}
              />
              {errors.name && (
                <span className="text-[10px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </span>
              )}
            </div>

            {/* Grade */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span>Série / Turma *</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Parent Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Responsável Legal *
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => {
                  setParentName(e.target.value);
                  if (errors.parentName) setErrors(prev => ({ ...prev, parentName: "" }));
                }}
                placeholder="Ex: Juliana Nogueira"
                className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 ${
                  errors.parentName
                    ? "border-rose-400 focus:ring-rose-500"
                    : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
                }`}
              />
              {errors.parentName && (
                <span className="text-[10px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.parentName}
                </span>
              )}
            </div>

            {/* Phone & Email Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>WhatsApp / Telefone *</span>
                </label>
                <input
                  type="text"
                  value={parentPhone}
                  onChange={(e) => {
                    setParentPhone(e.target.value);
                    if (errors.parentPhone) setErrors(prev => ({ ...prev, parentPhone: "" }));
                  }}
                  placeholder="(11) 98765-4321"
                  className={`w-full px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 ${
                    errors.parentPhone
                      ? "border-rose-400 focus:ring-rose-500"
                      : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
                  }`}
                />
                {errors.parentPhone && (
                  <span className="text-[10px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.parentPhone}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>E-mail do Responsável</span>
                </label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="responsavel@email.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Status Rematricula */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Status na Esteira de Rematrícula
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "pendente", label: "Pendente" },
                  { id: "em_analise", label: "Em Negociação" },
                  { id: "concluido", label: "Contrato Aceito" }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setReEnrollmentStatus(st.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      reEnrollmentStatus === st.id
                        ? "bg-indigo-600 text-white border-indigo-700 font-bold shadow-2xs"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isEditing ? "Salvar Alterações" : "Concluir Matrícula"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
