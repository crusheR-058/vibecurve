/**
 * Brand fonts, loaded the Remotion way (each loadFont() registers a
 * delayRender handle so the renderer waits for the webfont before painting).
 * Mirrors the app: Instrument Serif for display, Inter for everything else.
 */
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";

const { fontFamily: interFamily } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const { fontFamily: serifFamily } = loadInstrumentSerif("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const SANS = interFamily;
export const SERIF = serifFamily;
