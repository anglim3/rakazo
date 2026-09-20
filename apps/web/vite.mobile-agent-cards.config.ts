import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const webDir = path.dirname(fileURLToPath(import.meta.url));
const mobileRoot = path.resolve(webDir, "../mobile");
const workspaceRoot = path.resolve(webDir, "../..");
const rnWeb = path.resolve(mobileRoot, "node_modules/react-native-web/dist/index.js");
const stubs = path.resolve(mobileRoot, "e2e/fixtures/stubs");

const SKIP_CJS = ["/react-native-web/dist/", "/.vite/", "/react-dom/", "/react/"];

function namedCjsExports(code: string): string[] {
  const names = new Set<string>();
  for (const match of code.matchAll(/\bexports\.([A-Za-z_$][\w$]*)\s*=/g)) {
    if (match[1] !== "default") names.add(match[1]);
  }
  for (const match of code.matchAll(/\bexports\[\s*['"]([A-Za-z_$][\w$]*)['"]\s*\]\s*=/g)) {
    if (match[1] !== "default") names.add(match[1]);
  }
  return [...names];
}

function wrapCjsModules(): Plugin {
  return {
    name: "wrap-cjs-modules",
    enforce: "pre",
    transform(code, id) {
      const file = id.split("?")[0];
      if (!file.includes("node_modules")) return;
      if (SKIP_CJS.some((marker) => file.includes(marker))) return;
      if (file.endsWith(".mjs") || file.endsWith(".json")) return;
      if (/\bexport\s+(?:default|async|function|class|const|let|var|\{|\*)/.test(code)) return;
      if (
        !/\bmodule\.exports\b/.test(code) &&
        !/\bexports\.\w+\s*=/.test(code) &&
        !/\brequire\s*\(/.test(code)
      ) {
        return;
      }

      const shim = code.match(
        /^(?:(?:\/\*[\s\S]*?\*\/|\/\/[^\n]*|\s|'use strict';|"use strict";)*)module\.exports\s*=\s*require\((['"])([^'"]+)\1\)\s*;?\s*$/,
      );
      if (shim) {
        const spec = JSON.stringify(shim[2]);
        return {
          code: `export { default } from ${spec};\nexport * from ${spec};\n`,
          map: null,
        };
      }

      const imports: string[] = [];
      const body = code.replace(
        /\brequire\s*\(\s*(['"])([^'"]+)\1\s*\)/g,
        (_match, _quote, spec: string) => {
          const name = `__cjsreq_${imports.length}`;
          imports.push(`import * as ${name} from ${JSON.stringify(spec)};`);
          return `(${name}.default ?? ${name})`;
        },
      );
      const named = namedCjsExports(code)
        .map((name) => `export const ${name} = module.exports.${name};`)
        .join("\n");

      return {
        code: `${imports.join("\n")}
const exports = {};
const module = { exports };
(function (module, exports) {
${body}
})(module, exports);
export default module.exports?.default ?? module.exports;
${named}
`,
        map: null,
      };
    },
  };
}

export default defineConfig({
  root: mobileRoot,
  plugins: [react(), wrapCjsModules()],
  define: {
    global: "globalThis",
    __DEV__: "true",
  },
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: path.join(stubs, "react-native.ts") },
      { find: /^react-native-web$/, replacement: rnWeb },
      {
        find: "expo-secure-store",
        replacement: path.join(stubs, "expo-secure-store.ts"),
      },
      {
        find: "expo-clipboard",
        replacement: path.join(stubs, "expo-clipboard.ts"),
      },
      {
        find: "expo-symbols",
        replacement: path.join(stubs, "expo-symbols.tsx"),
      },
      {
        find: "expo-modules-core",
        replacement: path.join(stubs, "expo-modules-core.ts"),
      },
      {
        find: "@react-native-vector-icons/ionicons",
        replacement: path.join(stubs, "ionicons.tsx"),
      },
    ],
    dedupe: ["react", "react-dom"],
    extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  assetsInclude: ["**/*.ttf"],
  server: {
    host: "127.0.0.1",
    port: 5188,
    strictPort: true,
    fs: { allow: [workspaceRoot] },
  },
  optimizeDeps: {
    include: ["react-native-web"],
    exclude: ["react-native", "expo-modules-core"],
  },
});
