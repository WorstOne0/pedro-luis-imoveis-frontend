import type { Metadata } from "next";
// Components
import PageView from "@/app/_components/page_view";
import ContactForm from "./_components/contact_form";
// Config
import { CONTACT, whatsappLink } from "@/lib/site";
// Icons
import { FaWhatsapp, FaInstagram, FaFacebookF } from "react-icons/fa";
import { MdOutlineEmail, MdOutlineLocationOn } from "react-icons/md";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Pedro Luis Imóveis em Cascavel/PR pelo WhatsApp, e-mail ou pelo formulário. Atendimento em Cascavel e região.",
};

export default function Contact() {
  const channels = [
    { Icon: FaWhatsapp, label: "WhatsApp", value: CONTACT.whatsappDisplay, href: whatsappLink(), tone: "text-green-600" },
    { Icon: MdOutlineEmail, label: "E-mail", value: CONTACT.email, href: `mailto:${CONTACT.email}`, tone: "text-primary" },
    { Icon: MdOutlineLocationOn, label: "Endereço", value: CONTACT.city, href: null, tone: "text-primary" },
  ];

  const socials = [
    { Icon: FaInstagram, href: CONTACT.instagram, label: "Instagram" },
    { Icon: FaFacebookF, href: CONTACT.facebook, label: "Facebook" },
    { Icon: FaWhatsapp, href: whatsappLink(), label: "WhatsApp" },
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-diagonal">
      <PageView page="Contact" route="/contact" />

      {/* min-h-full + my-auto centres the block vertically when it is shorter
          than the viewport, and collapses to normal flow when it is taller.
          justify-center would clip the top edge on overflow instead. */}
      {/* pt matches the height the fixed navbar overlays, and there is no
          bottom padding — that makes my-auto split the *visible* space evenly
          instead of centring against the full viewport and sitting high.
          Breathing room for the overflow case comes from the child's py. */}
      <div className="min-h-full flex flex-col pt-[8.2rem]">
        <div className="my-auto w-full lg:w-[80%] max-w-[192rem] mx-auto px-[2rem] py-[3rem]">
        <span className="text-[1.3rem] font-bold tracking-[0.15em] text-primary uppercase">Contato</span>

        <h1 className="text-[3.4rem] md:text-[4rem] font-extrabold leading-[1.15] mt-[1.2rem]">Vamos conversar sobre o seu imóvel</h1>

        <p className="text-[1.6rem] text-muted-foreground mt-[1.2rem] max-w-[62rem]">
          Atendimento em Cascavel e região. Fale pelo WhatsApp para uma resposta rápida ou envie uma mensagem pelo formulário.
        </p>

        <div className="w-full flex flex-col lg:flex-row gap-[3rem] mt-[3.6rem]">
          {/* Channels */}
          <div className="w-full lg:w-[46rem] shrink-0 flex flex-col gap-[1.2rem]">
            {channels.map(({ Icon, label, value, href, tone }) => {
              const inner = (
                <>
                  <span className="h-[4.4rem] w-[4.4rem] shrink-0 rounded-[0.8rem] bg-muted flex items-center justify-center">
                    <Icon size={20} className={tone} />
                  </span>
                  <span className="min-w-0 flex flex-col">
                    <span className="text-[1.3rem] text-muted-foreground">{label}</span>
                    <span className="text-[1.7rem] font-bold truncate">{value}</span>
                  </span>
                </>
              );

              const className =
                "w-full flex items-center gap-[1.4rem] border border-border rounded-[1rem] px-[1.6rem] py-[1.4rem] bg-card transition-colors hover:border-primary";

              // Address has nowhere to link to, so it stays a plain block.
              return href ? (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={className}>
                  {inner}
                </a>
              ) : (
                <div key={label} className={className}>
                  {inner}
                </div>
              );
            })}

            <div className="flex items-center gap-[1rem] mt-[1.2rem]">
              <span className="text-[1.4rem] text-muted-foreground">Redes:</span>

              {socials.map(({ Icon, href, label }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="h-[4rem] w-[4rem] flex items-center justify-center rounded-[0.8rem] border border-border bg-card hover:border-primary hover:text-primary transition-colors"
                  >
                    <Icon size={17} />
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Form */}
          <div className="min-w-0 grow">
            <ContactForm />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
