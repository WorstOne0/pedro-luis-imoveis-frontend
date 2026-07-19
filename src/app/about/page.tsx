import type { Metadata } from "next";
// Components
import PageView from "@/app/_components/page_view";
// Config
import { BROKER } from "@/lib/site";
// Icons
import { FiClock, FiShield, FiBriefcase, FiImage } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Sobre",
  description: `${BROKER.name}, corretor responsável da ${BROKER.company} em Cascavel/PR. 30 anos de experiência, avaliador imobiliário inscrito no CNAI.`,
};

const HIGHLIGHTS = [
  { Icon: FiClock, title: "30 anos", subtitle: "de experiência" },
  { Icon: FiShield, title: "CNAI", subtitle: "avaliador imobiliário" },
  { Icon: FiBriefcase, title: "Regularização", subtitle: "incorporação e condomínios" },
];

export default function About() {
  return (
    <div className="h-full w-full overflow-y-auto bg-diagonal">
      <PageView page="About" route="/about" />

      {/* min-h-full + my-auto centres the block vertically when it is shorter
          than the viewport, and collapses to normal flow when it is taller.
          justify-center would clip the top edge on overflow instead. */}
      {/* pt matches the height the fixed navbar overlays, and there is no
          bottom padding — that makes my-auto split the *visible* space evenly
          instead of centring against the full viewport and sitting high.
          Breathing room for the overflow case comes from the child's py. */}
      <div className="min-h-full flex flex-col pt-[8.2rem]">
        <div className="my-auto w-full lg:w-[80%] max-w-[192rem] mx-auto px-[2rem] py-[3rem]">
        <div className="w-full flex flex-col lg:flex-row gap-[4rem] lg:gap-[6rem]">
          {/* Text */}
          <div className="min-w-0 grow flex flex-col">
            <span className="text-[1.3rem] font-bold tracking-[0.15em] text-primary uppercase">Sobre</span>

            <h1 className="text-[4rem] md:text-[4.8rem] font-extrabold leading-[1.1] mt-[1.2rem]">{BROKER.name}</h1>

            <p className="text-[1.5rem] text-muted-foreground mt-[1.2rem]">CRECI — {BROKER.creci}</p>

            <p className="text-[1.7rem] leading-[1.75] text-muted-foreground mt-[2.4rem] max-w-[68rem]">
              A <strong className="font-bold text-foreground">{BROKER.company}</strong> tem como corretor responsável {BROKER.name}, profissional
              com 30 anos de aprendizado que conduzem a experiência. Avaliador imobiliário inscrito no CNAI, conhecedor da documentação para a
              adequada regularização imobiliária, incorporação e instituição de condomínios — conhecimento e experiência a serviço da realização do
              seu sonho.
            </p>

            {/* Highlights */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-[1.2rem] mt-[3.2rem] max-w-[72rem]">
              {HIGHLIGHTS.map(({ Icon, title, subtitle }) => (
                <div key={title} className="flex items-center gap-[1.2rem] border border-border rounded-[1rem] px-[1.6rem] py-[1.4rem]">
                  <span className="h-[3.6rem] w-[3.6rem] shrink-0 rounded-[0.8rem] bg-primary/10 flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </span>
                  <span className="min-w-0 flex flex-col">
                    <span className="text-[1.8rem] font-bold leading-tight">{title}</span>
                    <span className="text-[1.3rem] text-muted-foreground">{subtitle}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Portrait */}
          <div className="w-full lg:w-[42rem] shrink-0 flex flex-col gap-[1.2rem]">
            {/* Placeholder until a real photo exists — drop the file in public/
                and swap this block for an <img>. */}
            <div className="w-full aspect-[3/4] rounded-[1.2rem] border-2 border-dashed border-border bg-muted/40 flex flex-col items-center justify-center gap-[0.8rem] text-muted-foreground">
              <FiImage size={26} />
              <span className="text-[1.4rem]">Foto do Pedro Luis</span>
            </div>

            <span className="text-[1.3rem] text-muted-foreground text-center">{BROKER.role}</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
