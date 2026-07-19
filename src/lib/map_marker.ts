import { PROPERTY_GLYPHS } from "./property_glyphs";

/**
 * Builds a map marker as a self-contained SVG data URI.
 *
 * The original icons were coloured discs with black line art, but sat straight
 * on the tiles with nothing separating them from the map. This keeps the disc
 * colours exactly as they were and adds the dark ring and shadow they were
 * missing.
 *
 * It has to be one self-contained document: an <image href> pointing at a file
 * in /public is blocked inside a data: URI, so the glyph travels inline.
 */

// Sampled from the original public/*_icon.png discs, so the map keeps the
// colour coding the listings already used.
const DISC_COLORS: Record<string, string> = {
  apartment: "#e3b775",
  house: "#e47b7b",
  land: "#8cda8b",
  shop: "#8d7adc",
  sobrado: "#7d8fee",
};

const RING = "#111827";
const SELECTED_RING = "#003b8f";

export const MARKER_SIZE = 52;

export const buildMarkerIcon = ({ type, isSelected = false }: { type: string; isSelected?: boolean }) => {
  const glyph = PROPERTY_GLYPHS[type] ?? PROPERTY_GLYPHS.apartment;
  const disc = DISC_COLORS[type] ?? DISC_COLORS.apartment;

  // Selection thickens and recolours the ring rather than tinting the disc:
  // the disc colour is the type, and overriding it would lose that.
  const ring = isSelected ? SELECTED_RING : RING;
  const ringWidth = isSelected ? 4 : 2.5;

  // The glyph is inset so the ring never clips it, and nested <svg> does the
  // scaling from the source viewBox for us. 11 keeps it roughly the share of
  // the disc it filled in the original icons.
  const inset = 11;
  const glyphSize = MARKER_SIZE - inset * 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MARKER_SIZE}" height="${MARKER_SIZE}" viewBox="0 0 ${MARKER_SIZE} ${MARKER_SIZE}">
<defs><filter id="s" x="-50%" y="-50%" width="200%" height="200%">
<feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.35"/>
</filter></defs>
<circle cx="26" cy="26" r="22" fill="${disc}" stroke="${ring}" stroke-width="${ringWidth}" filter="url(#s)"/>
<svg x="${inset}" y="${inset}" width="${glyphSize}" height="${glyphSize}" viewBox="${glyph.viewBox}" color="#000000">${glyph.body}</svg>
</svg>`;

  // encodeURIComponent, not base64: it keeps the URI readable in devtools and
  // avoids the btoa unicode pitfall.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
