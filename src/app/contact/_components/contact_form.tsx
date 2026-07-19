"use client";

import { useState } from "react";
import { CONTACT, whatsappLink } from "@/lib/site";
import { MdArrowForward } from "react-icons/md";

/** (45) 99999-9999 as the user types. */
const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;

  const split = rest.length > 8 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="w-full flex flex-col gap-[0.6rem]">
    <span className="text-[1.4rem] font-medium">{label}</span>
    {children}
  </label>
);

const inputClass =
  "h-[4.8rem] w-full rounded-[0.8rem] border border-border bg-background px-[1.4rem] text-[1.5rem] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors";

/**
 * There is no contact endpoint on the API, so the form composes a WhatsApp
 * message rather than pretending to send mail. Swap the submit handler for a
 * POST if a /contact route is ever added.
 */
export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.message.trim()) {
      setError("Informe seu nome e uma mensagem.");
      return;
    }

    const link = whatsappLink(
      [
        `Olá! Meu nome é ${form.name.trim()}.`,
        form.message.trim(),
        form.phone.trim() ? `Telefone: ${form.phone.trim()}` : "",
        form.email.trim() ? `E-mail: ${form.email.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n\n")
    );

    if (!link) {
      setError("Contato indisponível no momento. Defina NEXT_PUBLIC_WHATSAPP.");
      return;
    }

    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={onSubmit} className="w-full flex flex-col gap-[1.6rem] bg-card border border-border rounded-[1.2rem] p-[2.4rem] shadow-sm">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-[1.6rem]">
        <Field label="Nome">
          <input className={inputClass} value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="Seu nome" autoComplete="name" />
        </Field>

        <Field label="Telefone">
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => set("phone")(maskPhone(e.target.value))}
            placeholder="(45) 9____-____"
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>
      </div>

      <Field label="E-mail">
        <input
          className={inputClass}
          type="email"
          value={form.email}
          onChange={(e) => set("email")(e.target.value)}
          placeholder="voce@email.com"
          autoComplete="email"
        />
      </Field>

      <Field label="Mensagem">
        <textarea
          className={`${inputClass} h-auto min-h-[14rem] py-[1.2rem] resize-y`}
          value={form.message}
          onChange={(e) => set("message")(e.target.value)}
          placeholder="Conte o que procura — bairro, tipo de imóvel, faixa de preço…"
        />
      </Field>

      {error && <span className="text-[1.4rem] text-destructive">{error}</span>}

      <button
        type="submit"
        className="h-[5.2rem] w-full flex items-center justify-center gap-[1rem] rounded-[0.8rem] bg-primary text-white font-bold text-[1.6rem] hover:opacity-90 transition-opacity cursor-pointer"
      >
        Enviar mensagem
        <MdArrowForward size={20} />
      </button>

      <span className="text-[1.2rem] text-muted-foreground text-center">
        A mensagem abre no WhatsApp ({CONTACT.whatsappDisplay}) já preenchida.
      </span>
    </form>
  );
}
