/**
 * Broker and contact details, in one place so the about page, contact page and
 * listing contact card cannot drift apart.
 *
 * The phone number comes from NEXT_PUBLIC_WHATSAPP (digits only, international
 * format) and is formatted for display here.
 */
const WHATSAPP_DIGITS = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

/** 5545999999999 -> (45) 99999-9999 */
const formatBrazilPhone = (digits: string) => {
  const local = digits.replace(/\D/g, "").replace(/^55/, "");
  if (local.length < 10) return "";

  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  const split = rest.length > 8 ? 5 : 4;

  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
};

export const BROKER = {
  name: "Pedro Luis dos Santos",
  company: "Pedro Luis Corretagem de Imóveis",
  creci: "F 17790/6ª Região · J 05992/6ª Região",
  role: "Corretor responsável · CRECI-PR",
};

export const CONTACT = {
  whatsappDigits: WHATSAPP_DIGITS,
  whatsappDisplay: formatBrazilPhone(WHATSAPP_DIGITS) || "(45) 99999-9999",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contato@pedroluisimoveis.com.br",
  city: "Cascavel · Paraná",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "https://instagram.com",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK ?? "https://facebook.com",
};

/** wa.me link with an optional prefilled message. */
export const whatsappLink = (message?: string) => {
  if (!CONTACT.whatsappDigits) return null;

  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${CONTACT.whatsappDigits}${query}`;
};
