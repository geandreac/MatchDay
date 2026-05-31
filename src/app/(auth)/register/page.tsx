"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validarCPF } from "@/lib/validations";
import { csrfFetch } from "@/lib/csrf-client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", cpf: "", birthDate: "",
    password: "", confirmPassword: "", role: "CLIENT",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "cpf") {
      formatted = value.replace(/\D/g, "").slice(0, 11);
      if (formatted.length > 9) {
        formatted = `${formatted.slice(0, 3)}.${formatted.slice(3, 6)}.${formatted.slice(6, 9)}-${formatted.slice(9)}`;
      } else if (formatted.length > 6) {
        formatted = `${formatted.slice(0, 3)}.${formatted.slice(3, 6)}.${formatted.slice(6)}`;
      } else if (formatted.length > 3) {
        formatted = `${formatted.slice(0, 3)}.${formatted.slice(3)}`;
      }
    }
    setForm((prev) => ({ ...prev, [name]: formatted }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.cpf || !form.birthDate || !form.password) {
      setError("Todos os campos são obrigatórios."); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem."); return;
    }
    if (form.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres."); return;
    }
    if (!validarCPF(form.cpf.replace(/\D/g, ""))) {
      setError("CPF inválido. Verifique os dígitos."); return;
    }

    setLoading(true);
    try {
      const res = await csrfFetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email,
          cpf: form.cpf.replace(/\D/g, ""),
          birthDate: form.birthDate, password: form.password,
          role: form.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push("/login");
    } catch {
      setError("Erro ao conectar com o servidor."); setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold gradient-text">Criar Conta</h1>
        <p className="mt-1 text-sm text-text-3">Preencha os dados para se cadastrar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="glass rounded-xl px-4 py-3 text-sm text-danger border border-danger/20 animate-fade-in" role="alert" id="register-error">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="name">Nome Completo</label>
          <input id="name" name="name" type="text" value={form.name} onChange={handleChange} className="input-base" placeholder="Seu nome completo" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="input-base" placeholder="seu@email.com" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="cpf">CPF</label>
          <input id="cpf" name="cpf" type="text" value={form.cpf} onChange={handleChange} className="input-base" placeholder="000.000.000-00" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="birthDate">Data de Nascimento</label>
          <input id="birthDate" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} className="input-base" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} className="input-base" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-2" htmlFor="confirmPassword">Confirmar Senha</label>
          <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} className="input-base" placeholder="Repita a senha" required />
        </div>

        <label className="flex items-start gap-3 card p-3 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.role === "FIELD_OWNER"}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.checked ? "FIELD_OWNER" : "CLIENT" }))}
            className="mt-0.5 h-4 w-4 rounded border-border bg-surface-2 text-primary focus:ring-primary"
          />
          <div className="text-sm">
            <span className="font-medium text-text-2">Sou dono de campo</span>
            <p className="text-text-3 text-xs mt-0.5">Quero cadastrar meus campos para receber reservas.</p>
          </div>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Cadastrando...
            </span>
          ) : "Criar Conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-3">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-dark transition-colors">Entrar</Link>
      </p>
    </div>
  );
}

