import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

// The card social platforms show when the site root is pasted. Generated
// rather than hand-drawn so the copy stays in sync with the metadata.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Pedro Luis Imóveis · Casas e apartamentos em Cascavel/PR";

export default async function OpengraphImage() {
  // Read from disk rather than fetching a URL: this runs at build time, when
  // the site is not yet serving.
  const logo = await fs.readFile(path.join(process.cwd(), "public/logo/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #003b8f 0%, #0a5bd3 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={110} height={110} alt="" style={{ borderRadius: "24px", background: "white" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1 }}>Pedro Luis Imóveis</span>
            <span style={{ fontSize: 30, opacity: 0.85 }}>Cascavel · Paraná</span>
          </div>
        </div>

        <span style={{ fontSize: 42, fontWeight: 600, marginTop: 56, lineHeight: 1.3, maxWidth: 900 }}>
          Casas, apartamentos, sobrados, terrenos e salas comerciais à venda
        </span>

        <span style={{ fontSize: 28, opacity: 0.8, marginTop: 24 }}>Busque no mapa por bairro, preço e área</span>
      </div>
    ),
    size
  );
}
