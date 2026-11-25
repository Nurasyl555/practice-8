import fs from "fs";
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function cosmodexPwaPlugin() {
  let outDir = "dist";

  const collectFiles = (dir, baseDir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let results = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Keep public API JSON endpoints in runtime Network-First API cache
        const relDir = path.relative(baseDir, fullPath).replace(/\\/g, "/");
        if (relDir === "api") continue;
        results = results.concat(collectFiles(fullPath, baseDir));
      } else {
        const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
        if (
          relPath === "sw.js" ||
          relPath === "404.html" ||
          relPath.endsWith(".map")
        ) {
          continue;
        }
        results.push(`./${relPath}`);
      }
    }
    return results;
  };

  return {
    name: "cosmodex-pwa-precache",
    configResolved(config) {
      outDir = config.build.outDir || "dist";
    },
    closeBundle() {
      const distPath = path.resolve(outDir);
      const swPath = path.join(distPath, "sw.js");
      if (!fs.existsSync(swPath)) return;

      const shellAssets = ["./", ...collectFiles(distPath, distPath)];
      const uniqueAssets = [...new Set(shellAssets)];
      const version = `v7-${Date.now()}`;

      let swCode = fs.readFileSync(swPath, "utf-8");
      swCode = swCode.replace("__SW_VERSION__", version);
      swCode = swCode.replace(
        /\/\*__PRECACHE_URLS__\*\/[\s\S]*?\/\*__END_PRECACHE_URLS__\*\//,
        JSON.stringify(uniqueAssets, null, 2)
      );

      fs.writeFileSync(swPath, swCode, "utf-8");
      console.log(`[cosmodex-pwa] Injected ${uniqueAssets.length} precache assets into sw.js (${version})`);
    }
  };
}

export default defineConfig({
  plugins: [react(), cosmodexPwaPlugin()],
  base: process.env.NODE_ENV === "production" ? "/practice-8/" : "/"
});
