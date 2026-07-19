import type { Metadata } from "next";
import DetailView from "./_components/detail_view";
import type { RealEstate } from "@/store/real_estate";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const TYPE_LABELS: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  land: "Terreno",
  shop: "Sala comercial",
  sobrado: "Sobrado",
};

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0, minimumFractionDigits: 0 });

/**
 * Fetched on the server so the listing can be described in the page metadata.
 * Revalidated rather than cached forever: a price change should reach the
 * preview without a redeploy.
 */
const getRealEstate = async (id: string): Promise<RealEstate | null> => {
  try {
    const response = await fetch(`${API_URL}/real_estate/${id}`, { next: { revalidate: 300 } });
    if (!response.ok) return null;

    const body = await response.json();
    return body.payload ?? null;
  } catch {
    // A listing page that renders without a preview beats one that 500s
    // because the API was briefly unreachable.
    return null;
  }
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const realEstate = await getRealEstate(id);

  if (!realEstate) return { title: "Imóvel não encontrado" };

  const type = TYPE_LABELS[realEstate.type] ?? "Imóvel";
  const district = realEstate.address?.district;
  const city = realEstate.address?.city ?? "Cascavel";

  const title = realEstate.title?.trim() || `${type} em ${district ?? city}`;

  const facts = [
    realEstate.rooms > 0 && `${realEstate.rooms} quartos`,
    realEstate.bathrooms > 0 && `${realEstate.bathrooms} banheiros`,
    realEstate.garages > 0 && `${realEstate.garages} vagas`,
    realEstate.area > 0 && `${realEstate.area} m²`,
  ].filter(Boolean);

  const description = `${formatBRL(realEstate.price)} · ${type}${district ? ` no ${district}` : ""}, ${city}. ${facts.join(" · ")}`;

  // The listing photo is what makes a shared link worth clicking.
  const image = realEstate.thumbnail;

  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "Pedro Luis Imóveis",
      title,
      description,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function RealEstatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <DetailView id={id} />;
}
