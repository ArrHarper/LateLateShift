// Content hash of the site's CSS/JS, used as a cache-busting ?v= on asset links.
// Consumed by src/_data/assetVersion.js (templated pages, via base.njk) and by
// the eleventy.after hook in eleventy.config.mjs (passthrough recap/review
// pages). GitHub Pages serves assets with max-age=600, so without this a
// stylesheet change can take up to ten minutes to reach a returning visitor.
// Stable across builds when nothing changed; changes when any listed file does.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export const ASSET_FILES = ["css/fonts.css", "css/tokens.css", "css/site.css", "js/lls-table.js", "js/nav.js"];

export function assetVersion() {
  const h = createHash("sha1");
  for (const f of ASSET_FILES) h.update(readFileSync(f));
  return h.digest("hex").slice(0, 8);
}
