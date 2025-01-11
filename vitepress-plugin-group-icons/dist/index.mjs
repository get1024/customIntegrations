import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFilter } from 'vite';
import { createRequire } from 'node:module';
import { encodeSvgForCss, getIconData, iconToSVG, iconToHTML } from '@iconify/utils';

function localIconLoader(url, path) {
  return readFileSync(resolve(dirname(fileURLToPath(url)), path), "utf-8");
}

function groupIconMdPlugin(md, options) {
  const _options = options || { titleBar: { includeSnippet: false } };
  const labelRE = /<label\b(?![^>]+\bdata-title\b)[^>]*>(.*?)<\/label>/g;
  const codeGroupOpenRule = md.renderer.rules["container_code-group_open"];
  if (codeGroupOpenRule) {
    md.renderer.rules["container_code-group_open"] = (...args) => {
      return codeGroupOpenRule(...args).replace(
        labelRE,
        (match, label) => `<label data-title="${md.utils.escapeHtml(label)}"${match.slice(6)}`
      );
    };
  }
  const fenceRule = md.renderer.rules.fence;
  if (fenceRule) {
    md.renderer.rules.fence = (...args) => {
      const [tokens, idx] = args;
      const token = tokens[idx];
      let isOnCodeGroup = false;
      for (let i = idx - 1; i >= 0; i--) {
        if (tokens[i].type === "container_code-group_open") {
          isOnCodeGroup = true;
          break;
        }
        if (tokens[i].type === "container_code-group_close") {
          break;
        }
      }
      const title = token.info.match(/\[(.*?)\]/);
      const isIncludedSnippet = _options.titleBar.includeSnippet;
      if (!isOnCodeGroup && title && (!token.src || isIncludedSnippet)) {
        return `<div class="vp-code-block-title">
      <div class="vp-code-block-title-bar">
          <span class="vp-code-block-title-text" data-title="${md.utils.escapeHtml(title[1])}">${title[1]}</span>
      </div>
        ${fenceRule(...args)}
      </div>
      `;
      }
      return fenceRule(...args);
    };
  }
}

const builtinIcons = {
  // package managers
  // 包管理器
  "pnpm": "vscode-icons:file-type-light-pnpm",
  "npm": "vscode-icons:file-type-npm",
  "yarn": "vscode-icons:file-type-yarn",
  "bun": "vscode-icons:file-type-bun",
  "deno": "vscode-icons:file-type-light-deno",
  "pip": "vscode-icons:file-type-pip",
  // frameworks
  // 框架
  "vue": "vscode-icons:file-type-vue",
  "svelte": "vscode-icons:file-type-svelte",
  "angular": "vscode-icons:file-type-angular",
  "react": "vscode-icons:file-type-reactjs",
  "next": "vscode-icons:file-type-light-next",
  "nuxt": "vscode-icons:file-type-nuxt",
  "solid": "logos:solidjs-icon",
  "astro": "vscode-icons:file-type-light-astro",
  "docker":"vscode-icons:file-type-docker2",
  // bundlers
  // 打包器
  "rollup": "vscode-icons:file-type-rollup",
  "webpack": "vscode-icons:file-type-webpack",
  "vite": "vscode-icons:file-type-vite",
  "esbuild": "vscode-icons:file-type-esbuild",
  // configuration files
  // 配置文件
  "package.json": "vscode-icons:file-type-node",
  "tsconfig.json": "vscode-icons:file-type-tsconfig",
  ".npmrc": "vscode-icons:file-type-npm",
  ".editorconfig": "vscode-icons:file-type-editorconfig",
  ".eslintrc": "vscode-icons:file-type-eslint",
  ".eslintignore": "vscode-icons:file-type-eslint",
  "eslint.config": "vscode-icons:file-type-eslint",
  ".gitignore": "vscode-icons:file-type-git",
  ".gitattributes": "vscode-icons:file-type-git",
  ".env": "vscode-icons:file-type-dotenv",
  ".env.example": "vscode-icons:file-type-dotenv",
  ".vscode": "vscode-icons:file-type-vscode",
  "tailwind.config": "vscode-icons:file-type-tailwind",
  "uno.config": "vscode-icons:file-type-unocss",
  // filename extensions
  // 文件扩展名
  ".ts": "vscode-icons:file-type-typescript",
  ".tsx": "vscode-icons:file-type-typescript",
  ".mjs": "vscode-icons:file-type-js",
  ".cjs": "vscode-icons:file-type-js",
  ".json": "vscode-icons:file-type-json",
  ".js": "vscode-icons:file-type-js",
  ".jsx": "vscode-icons:file-type-js",
  ".md": "vscode-icons:file-type-markdown",
  ".py": "vscode-icons:file-type-python",
  ".cpp":"vscode-icons:file-type-cpp",
  ".ico": "vscode-icons:file-type-favicon",
  ".html": "vscode-icons:file-type-html",
  ".css": "vscode-icons:file-type-css",
  ".yml": "vscode-icons:file-type-light-yaml",
  ".yaml": "vscode-icons:file-type-light-yaml",
  // 自增
  "c++":"vscode-icons:file-type-cpp",

  "git":"vscode-icons:file-type-git",

  "powershell":"vscode-icons:file-type-powershell",
  "pwsh":"vscode-icons:file-type-powershell",
  "shell":"vscode-icons:file-type-shell",
  "sh":"vscode-icons:file-type-shell",
};

async function generateCSS(labels, options) {
  const baseCSS = `
.vp-code-block-title [data-title]::before,
.vp-code-group [data-title]::before {
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.5em;
  margin-bottom: -0.2em;
  background: var(--icon) no-repeat center / contain;
}

.vp-code-block-title-bar {
  position: relative;
  margin: 16px -24px 0 -24px;
  background-color: var(--vp-code-block-bg);
  overflow-x: auto;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-code-tab-text-color);
  white-space: nowrap;
  transition: background-color 0.5s;
  border-radius: 8px 8px 0 0;
  padding:0 12px;
  box-shadow: inset 0 -1px var(--vp-code-tab-divider);
}

.custom-block .vp-code-block-title-bar {
  margin: 16px 0 0 0;
}

@media (min-width: 640px) {
  .vp-code-block-title-bar {
    margin: 16px 0 0 0;
  }
}

.vp-code-block-title-text {
  padding: 0 12px;
  line-height: 48px;
}


.vp-code-block-title div[class*=language-] {
  margin-top: 0 !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}
`;
  const mergedIcons = { ...builtinIcons, ...options.customIcon };
  const matched = getMatchedLabels(labels, mergedIcons);
  const css = baseCSS + await generateIconCSS(matched);
  return { css };
}
function getMatchedLabels(labels, icons) {
  const matched = {};
  const sortedKeys = Object.keys(icons).sort((a, b) => b.length - a.length);
  for (const label of labels) {
    const key = sortedKeys.find((k) => label?.toLowerCase().includes(k));
    if (key) {
      matched[icons[key]] = (matched[icons[key]] || []).concat(label);
    }
  }
  return matched;
}
async function generateIconCSS(matched) {
  const iconCSS = await Promise.all(Object.entries(matched).map(async ([icon, labels]) => {
    const svg = await getSVG(icon);
    const selector = labels.map((label) => `[data-title='${label}']::before`).join(",");
    return `
${selector} {
  content: '';
  --icon: url("data:image/svg+xml,${svg}");
}`;
  }));
  return iconCSS.join("");
}
async function getSVG(icon) {
  if (icon.startsWith("<svg")) {
    return encodeSvgForCss(icon);
  }
  if (/^https?:\/\//.test(icon)) {
    try {
      const raw = await fetch(icon);
      const iconContent = await raw.text();
      return encodeSvgForCss(iconContent);
    } catch {
      console.warn(`[vitepress-plugin-group-icons]: Failed to fetch icon: ${icon}`);
      return "";
    }
  }
  const [collection, iconName] = icon.split(":");
  try {
    const { icons } = createRequire(import.meta.url)(`@iconify-json/${collection}`);
    const iconData = getIconData(icons, iconName);
    if (iconData) {
      const { attributes, body } = iconToSVG(iconData);
      const svg = iconToHTML(body, attributes);
      return encodeSvgForCss(svg);
    }
    return "";
  } catch {
    console.warn(`[vitepress-plugin-group-icons]: Icon set \`${collection}\` not found. Please install \`@iconify-json/${collection}\` first`);
    return "";
  }
}

function isSetEqual(set1, set2) {
  try {
    if (set1.size !== set2.size) {
      return false;
    }
    for (const item of set1) {
      if (!set2.has(item)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

const filter = createFilter(
  [/\.md$/, /\.md\?vue/, /\.md\?v=/]
);
function groupIconVitePlugin(options) {
  const virtualCssId = "virtual:group-icons.css";
  const resolvedVirtualCssId = `\0${virtualCssId}`;
  const combinedRegex = /\bdata-title=\\"([^"]*)\\"|\bdata-title="([^"]*)"|"data-title":\s*"([^"]*)"/g;
  const matches = /* @__PURE__ */ new Set();
  let oldMatches;
  let server;
  options = options || { customIcon: {} };
  function handleUpdateModule() {
    const mod = server?.moduleGraph.getModuleById(resolvedVirtualCssId);
    if (mod) {
      server.moduleGraph.invalidateModule(mod);
      server.reloadModule(mod);
    }
  }
  return {
    name: "vitepress-plugin-group-icons",
    enforce: "post",
    resolveId(id) {
      if (id === virtualCssId) {
        return resolvedVirtualCssId;
      }
      return void 0;
    },
    configureServer(_server) {
      server = _server;
    },
    async load(id) {
      if (id === resolvedVirtualCssId) {
        const { css } = await generateCSS(matches, options);
        oldMatches = new Set(matches);
        return css;
      }
      return void 0;
    },
    transform(code, id) {
      if (!filter(id))
        return;
      while (true) {
        const match = combinedRegex.exec(code);
        if (!match)
          break;
        matches.add(match[1] || match[2] || match[3]);
      }
      if (!isSetEqual(matches, oldMatches)) {
        handleUpdateModule();
      }
    }
  };
}

export { groupIconMdPlugin, groupIconVitePlugin, localIconLoader };