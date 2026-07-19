"use client";

import { useState } from "react";
import { RealEstate } from "@/store/real_estate";
import { Card, SaveButton } from "@/components";
import { FaWhatsapp } from "react-icons/fa";
import { MdShare, MdCheck } from "react-icons/md";

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0, minimumFractionDigits: 0 });

// Short, human-quotable reference derived from the uuid, so the broker and a
// caller can refer to the same listing over the phone.
const listingCode = (id: string) => id.replace(/-/g, "").slice(0, 6).toUpperCase();

export default function ContactCard({ realEstate }: { realEstate: RealEstate }) {
  const [isCopied, setIsCopied] = useState(false);

  const pricePerArea = realEstate.area > 0 ? realEstate.price / realEstate.area : null;

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const message = `Olá! Tenho interesse no imóvel ${listingCode(realEstate._id)} - ${realEstate.title || ""}`.trim();
  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}` : null;

  const share = async () => {
    const url = window.location.href;

    // The native sheet is the better experience on mobile; clipboard is the
    // fallback everywhere else (and when the user dismisses the sheet).
    if (navigator.share) {
      try {
        await navigator.share({ title: realEstate.title || "Imóvel", url });
        return;
      } catch {
        // Dismissed — fall through to copying.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Clipboard blocked; nothing useful to do.
    }
  };

  return (
    <Card className="w-full flex flex-col p-[2.4rem] rounded-[1.2rem]">
      <span className="text-[1.4rem] text-muted-foreground">Valor do imóvel</span>
      <span className="text-[3.4rem] font-extrabold leading-tight">{formatBRL(realEstate.price)}</span>

      {pricePerArea && <span className="text-[1.3rem] text-muted-foreground mt-[0.6rem]">≈ {formatBRL(pricePerArea)}/m²</span>}

      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-[5.4rem] w-full flex justify-center items-center gap-[1rem] rounded-[1rem] bg-[#25D366] text-white font-bold text-[1.7rem] mt-[1.8rem] hover:opacity-90"
        >
          <FaWhatsapp size={22} />
          Falar no WhatsApp
        </a>
      ) : (
        <div className="h-[5.4rem] w-full flex justify-center items-center rounded-[1rem] bg-muted text-muted-foreground text-[1.5rem] mt-[1.8rem] px-[1rem] text-center">
          Defina NEXT_PUBLIC_WHATSAPP
        </div>
      )}

      <div className="w-full flex gap-[1rem] mt-[1rem]">
        <button
          type="button"
          onClick={share}
          className="h-[4.6rem] min-w-0 grow flex justify-center items-center gap-[0.8rem] rounded-[1rem] border border-border text-[1.5rem] font-bold cursor-pointer hover:bg-muted"
        >
          {isCopied ? <MdCheck size={18} /> : <MdShare size={18} />}
          {isCopied ? "Link copiado" : "Compartilhar"}
        </button>

        <SaveButton realEstateId={realEstate._id} />
      </div>

      <div className="w-full flex items-center gap-[1.2rem] border-t border-border mt-[2.2rem] pt-[2rem]">
        <div className="h-[4.4rem] w-[4.4rem] rounded-full bg-primary flex justify-center items-center shrink-0">
          <span className="text-white font-bold text-[1.5rem]">PL</span>
        </div>
        <div className="min-w-0 flex flex-col">
          <span className="font-bold text-[1.6rem] truncate">Pedro Luis Imóveis</span>
          <span className="text-[1.3rem] text-muted-foreground">CRECI-PR · Resp. até 1h</span>
        </div>
      </div>

      <span className="text-[1.2rem] text-muted-foreground mt-[1.4rem]">
        {realEstate.createdAt ? `Criado em ${new Date(realEstate.createdAt).toLocaleDateString("pt-BR")} · ` : ""}
        Cód. {listingCode(realEstate._id)}
      </span>
    </Card>
  );
}
