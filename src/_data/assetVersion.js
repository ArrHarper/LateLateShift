// Global data: short content hash of css/js, for ?v= cache-busting in base.njk.
// The hash itself lives in scripts/asset-version.mjs (shared with the config).
import { assetVersion } from "../../scripts/asset-version.mjs";

export default function () {
  return assetVersion();
}
