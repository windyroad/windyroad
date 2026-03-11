/**
 * c4-lib.mjs — Portable C4 model builder (pure Node.js, no npm deps).
 * Shared by c4-generate.mjs and c4-check.mjs.
 */

import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Source root detection
// ---------------------------------------------------------------------------

export function detectSourceRoot(projectRoot) {
  // 1. Try tsconfig.json
  const tsconfigPath = path.join(projectRoot, "tsconfig.json");
  if (fs.existsSync(tsconfigPath)) {
    try {
      const raw = fs.readFileSync(tsconfigPath, "utf8");
      // Strip single-line comments for lenient JSON parse
      const stripped = raw.replace(/\/\/.*$/gm, "");
      const tsconfig = JSON.parse(stripped);
      const rootDir = tsconfig?.compilerOptions?.rootDir;
      if (rootDir) {
        const candidate = path.resolve(projectRoot, rootDir);
        if (fs.existsSync(candidate)) return candidate;
      }
      const includes = tsconfig?.include;
      if (Array.isArray(includes) && includes.length > 0) {
        // Strip glob suffixes like /**/*
        const first = includes[0].replace(/\/\*.*$/, "");
        const candidate = path.resolve(projectRoot, first);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) return candidate;
      }
    } catch {
      // Fall through to probing
    }
  }

  // 2. Probe common directories
  for (const probe of ["app/src", "src", "lib"]) {
    const candidate = path.join(projectRoot, probe);
    if (fs.existsSync(candidate)) return candidate;
  }

  // 3. Fall back to project root
  const fallback = projectRoot;

  // 4. Verify .ts/.tsx files exist somewhere
  if (!hasFilesWithExtension(fallback, ".ts") && !hasFilesWithExtension(fallback, ".tsx")) {
    for (const [ext, lang] of [[".py", "Python"], [".go", "Go"], [".rs", "Rust"], [".java", "Java"]]) {
      if (hasFilesWithExtension(fallback, ext)) {
        throw new Error(`C4 generation does not yet support ${lang} projects`);
      }
    }
    throw new Error("No TypeScript source files found");
  }

  return fallback;
}

function hasFilesWithExtension(dir, ext) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (hasFilesWithExtension(full, ext)) return true;
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        return true;
      }
    }
  } catch {
    // Directory not readable
  }
  return false;
}

// ---------------------------------------------------------------------------
// C1: System Context detection
// ---------------------------------------------------------------------------

const PACKAGE_TO_EXTERNAL = [
  { patterns: ["netlify-cli", "@netlify/"], id: "netlify", name: "Netlify", desc: "Hosting & CDN", rel: "Deployed to", cat: "hosting" },
  { patterns: ["@vercel/", "vercel"], id: "vercel", name: "Vercel", desc: "Hosting & CDN", rel: "Deployed to", cat: "hosting" },
  { patterns: ["aws-sdk", "@aws-sdk/"], id: "aws", name: "AWS", desc: "Cloud infrastructure", rel: "Hosted on", cat: "hosting" },
  { patterns: ["@azure/"], id: "azure", name: "Azure", desc: "Cloud infrastructure", rel: "Hosted on", cat: "hosting" },
  { patterns: ["firebase", "firebase-admin"], id: "firebase", name: "Firebase", desc: "Backend services", rel: "Stores data in", cat: "service" },
  { patterns: ["@supabase/"], id: "supabase", name: "Supabase", desc: "Backend services", rel: "Stores data in", cat: "service" },
  { patterns: ["stripe"], id: "stripe", name: "Stripe", desc: "Payment processing", rel: "Processes payments via", cat: "service" },
  { patterns: ["@sendgrid/", "nodemailer"], id: "email", name: "Email Service", desc: "Transactional email", rel: "Sends email via", cat: "service" },
  { patterns: ["@auth0/"], id: "auth0", name: "Auth0", desc: "Authentication", rel: "Authenticates via", cat: "service" },
  { patterns: ["@clerk/"], id: "clerk", name: "Clerk", desc: "Authentication", rel: "Authenticates via", cat: "service" },
];

const CONFIG_TO_EXTERNAL = [
  { check: (root) => fs.existsSync(path.join(root, ".github", "workflows")), id: "github_actions", name: "GitHub Actions", desc: "CI/CD pipeline", rel: "Built by", cat: "ci" },
  { check: (root) => fs.existsSync(path.join(root, ".claude")), id: "claude_code", name: "Claude Code", desc: "AI coding assistant", rel: "Assists development of", cat: "tooling" },
  { check: (root) => fs.existsSync(path.join(root, "netlify.toml")), id: "netlify", name: "Netlify", desc: "Hosting & CDN", rel: "Deployed to", cat: "hosting" },
  { check: (root) => fs.existsSync(path.join(root, "vercel.json")), id: "vercel", name: "Vercel", desc: "Hosting & CDN", rel: "Deployed to", cat: "hosting" },
  { check: (root) => fs.existsSync(path.join(root, "Dockerfile")) || fs.existsSync(path.join(root, "docker-compose.yml")), id: "docker", name: "Docker", desc: "Container runtime", rel: "Containerised with", cat: "infra" },
  { check: (root) => fs.existsSync(path.join(root, ".circleci")), id: "circleci", name: "CircleCI", desc: "CI/CD pipeline", rel: "Built by", cat: "ci" },
];

const DB_PACKAGES = ["pg", "mysql2", "mongodb", "mongoose", "@prisma/client", "prisma", "better-sqlite3", "knex", "typeorm", "drizzle-orm"];

const FRAMEWORK_DETECT = [
  { patterns: ["next"], id: "nextjs", name: "Next.js", tech: "React/Next.js" },
  { patterns: ["nuxt"], id: "nuxt", name: "Nuxt", tech: "Vue/Nuxt" },
  { patterns: ["@angular/core"], id: "angular", name: "Angular", tech: "Angular" },
  { patterns: ["express"], id: "express", name: "Express", tech: "Node.js/Express" },
  { patterns: ["fastify"], id: "fastify", name: "Fastify", tech: "Node.js/Fastify" },
  { patterns: ["hono"], id: "hono", name: "Hono", tech: "Hono" },
];

function readPackageJson(projectRoot) {
  const pkgPath = path.join(projectRoot, "package.json");
  if (!fs.existsSync(pkgPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  } catch {
    return null;
  }
}

function allDepNames(pkg) {
  if (!pkg) return [];
  return [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
}

function matchesAny(depName, patterns) {
  return patterns.some((p) => p.endsWith("/") ? depName.startsWith(p) : depName === p);
}

export function buildC1Model(projectRoot) {
  const pkg = readPackageJson(projectRoot);
  const deps = allDepNames(pkg);
  const systemName = pkg?.name || path.basename(projectRoot);
  const systemDesc = pkg?.description || "Application";

  const externals = new Map();

  // Detect from package deps
  for (const mapping of PACKAGE_TO_EXTERNAL) {
    if (deps.some((d) => matchesAny(d, mapping.patterns))) {
      externals.set(mapping.id, { name: mapping.name, desc: mapping.desc, rel: mapping.rel, cat: mapping.cat });
    }
  }

  // Detect from config/directories
  for (const mapping of CONFIG_TO_EXTERNAL) {
    if (mapping.check(projectRoot)) {
      externals.set(mapping.id, { name: mapping.name, desc: mapping.desc, rel: mapping.rel, cat: mapping.cat });
    }
  }

  // Detect database
  if (deps.some((d) => DB_PACKAGES.includes(d))) {
    externals.set("database", { name: "Database", desc: "Data persistence", rel: "Stores data in", cat: "service" });
  }

  return {
    system: { id: "system", name: systemName, desc: systemDesc },
    externals: [...externals.entries()].map(([id, v]) => ({ id, ...v })),
  };
}

// ---------------------------------------------------------------------------
// C2: Container detection
// ---------------------------------------------------------------------------

const CONTENT_DIRS = ["articles", "posts", "content", "blog", "pages", "docs"];

export function buildC2Model(projectRoot) {
  const pkg = readPackageJson(projectRoot);
  const deps = allDepNames(pkg);
  const containers = [];

  // Detect main framework/app container
  let framework = null;
  for (const fw of FRAMEWORK_DETECT) {
    if (deps.some((d) => matchesAny(d, fw.patterns))) {
      framework = fw;
      break;
    }
  }
  if (framework) {
    containers.push({ id: "webapp", name: "Web App", tech: framework.tech, desc: "User interface" });
  } else if (deps.includes("react") || deps.includes("vue") || deps.includes("svelte")) {
    containers.push({ id: "webapp", name: "Web App", tech: "SPA", desc: "User interface" });
  }

  // Detect content store
  const srcDir = path.join(projectRoot, "src");
  const rootDir = projectRoot;
  for (const dir of CONTENT_DIRS) {
    const inSrc = path.join(srcDir, dir);
    const inRoot = path.join(rootDir, dir);
    if (fs.existsSync(inSrc) || fs.existsSync(inRoot)) {
      containers.push({ id: "content", name: "Content", tech: "Markdown/MDX", desc: "Articles & pages" });
      break;
    }
  }

  // Detect database container
  if (deps.some((d) => DB_PACKAGES.includes(d))) {
    const dbTech = deps.includes("pg") ? "PostgreSQL" :
      deps.includes("mysql2") ? "MySQL" :
      deps.includes("mongodb") || deps.includes("mongoose") ? "MongoDB" :
      deps.includes("better-sqlite3") ? "SQLite" : "SQL";
    containers.push({ id: "database", name: "Database", tech: dbTech, desc: "Data persistence" });
  }

  // Detect static output
  const nextConfigPath = path.join(projectRoot, "next.config.mjs");
  const nextConfigTsPath = path.join(projectRoot, "next.config.ts");
  let hasStaticExport = false;
  for (const cfgPath of [nextConfigPath, nextConfigTsPath]) {
    if (fs.existsSync(cfgPath)) {
      try {
        const content = fs.readFileSync(cfgPath, "utf8");
        if (content.includes("output") && content.includes("export")) hasStaticExport = true;
      } catch { /* ignore */ }
    }
  }
  if (hasStaticExport) {
    containers.push({ id: "static_output", name: "Static Output", tech: "HTML/CSS/JS", desc: "Built files" });
  }

  // Derive relationships
  const rels = [];
  const ids = new Set(containers.map((c) => c.id));
  if (ids.has("webapp") && ids.has("content")) rels.push({ from: "webapp", to: "content", label: "Reads" });
  if (ids.has("webapp") && ids.has("database")) rels.push({ from: "webapp", to: "database", label: "Reads/writes" });
  if (ids.has("webapp") && ids.has("static_output")) rels.push({ from: "webapp", to: "static_output", label: "Builds into" });

  return { containers, rels };
}

// ---------------------------------------------------------------------------
// C1/C2 Mermaid generation
// ---------------------------------------------------------------------------

function sanitizeId(id) {
  return id.replace(/[^a-zA-Z0-9_]/g, "_");
}

function escapeLabel(text) {
  return text.replace(/"/g, "'");
}

export function toC1Mermaid(c1Model) {
  const lines = ["C4Context"];
  lines.push(`    title System Context Diagram`);
  lines.push("");
  lines.push(`    Person(user, "User", "End user of the system")`);
  lines.push(`    System(${sanitizeId(c1Model.system.id)}, "${escapeLabel(c1Model.system.name)}", "${escapeLabel(c1Model.system.desc)}")`);
  lines.push("");
  for (const ext of c1Model.externals) {
    lines.push(`    System_Ext(${sanitizeId(ext.id)}, "${escapeLabel(ext.name)}", "${escapeLabel(ext.desc)}")`);
  }
  lines.push("");
  lines.push(`    Rel(user, ${sanitizeId(c1Model.system.id)}, "Uses")`);
  for (const ext of c1Model.externals) {
    if (ext.cat === "tooling") {
      // Dev tools act on the system, not the reverse
      lines.push(`    Rel(${sanitizeId(ext.id)}, ${sanitizeId(c1Model.system.id)}, "${escapeLabel(ext.rel || "Assists")}")`);
    } else {
      lines.push(`    Rel(${sanitizeId(c1Model.system.id)}, ${sanitizeId(ext.id)}, "${escapeLabel(ext.rel || "Uses")}")`);
    }
  }
  lines.push("");
  return lines.join("\n") + "\n";
}

export function toC2Mermaid(c2Model) {
  const lines = ["C4Container"];
  lines.push(`    title Container Diagram`);
  lines.push("");
  lines.push(`    Person(user, "User", "End user of the system")`);
  lines.push("");
  for (const c of c2Model.containers) {
    if (c.id === "database") {
      lines.push(`    ContainerDb(${sanitizeId(c.id)}, "${escapeLabel(c.name)}", "${escapeLabel(c.tech)}", "${escapeLabel(c.desc)}")`);
    } else {
      lines.push(`    Container(${sanitizeId(c.id)}, "${escapeLabel(c.name)}", "${escapeLabel(c.tech)}", "${escapeLabel(c.desc)}")`);
    }
  }
  // Add bridged external systems
  if (c2Model.externals) {
    lines.push("");
    for (const ext of c2Model.externals) {
      lines.push(`    System_Ext(${sanitizeId(ext.id)}, "${escapeLabel(ext.name)}", "${escapeLabel(ext.desc)}")`);
    }
  }
  lines.push("");
  // User connects to first container (the app)
  if (c2Model.containers.length > 0) {
    lines.push(`    Rel(user, ${sanitizeId(c2Model.containers[0].id)}, "Visits")`);
  }
  for (const rel of c2Model.rels) {
    lines.push(`    Rel(${sanitizeId(rel.from)}, ${sanitizeId(rel.to)}, "${escapeLabel(rel.label)}")`);
  }
  lines.push("");
  return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// File walking
// ---------------------------------------------------------------------------

function walk(dir, out) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (!entry.isFile()) continue;
    const name = entry.name;
    const isTsLike = name.endsWith(".ts") || name.endsWith(".tsx");
    const isTest = name.endsWith(".test.ts") || name.endsWith(".test.tsx") || name.endsWith(".spec.ts") || name.endsWith(".spec.tsx");
    if (!isTsLike || isTest) continue;
    out.push(full);
  }
}

// ---------------------------------------------------------------------------
// tsconfig path alias resolution
// ---------------------------------------------------------------------------

function loadPathAliases(projectRoot) {
  const tsconfigPath = path.join(projectRoot, "tsconfig.json");
  if (!fs.existsSync(tsconfigPath)) return [];
  try {
    const raw = fs.readFileSync(tsconfigPath, "utf8");
    const stripped = raw.replace(/\/\/.*$/gm, "");
    const tsconfig = JSON.parse(stripped);
    const paths = tsconfig?.compilerOptions?.paths;
    if (!paths) return [];
    const aliases = [];
    for (const [pattern, targets] of Object.entries(paths)) {
      if (!Array.isArray(targets) || targets.length === 0) continue;
      // Convert "prefix/*" to { prefix: "prefix/", target: "target/" }
      const prefix = pattern.replace(/\*$/, "");
      const target = targets[0].replace(/\*$/, "");
      aliases.push({ prefix, targetDir: path.resolve(projectRoot, target) });
    }
    return aliases;
  } catch {
    return [];
  }
}

let _cachedAliases = null;
let _cachedProjectRoot = null;

function getPathAliases(projectRoot) {
  if (_cachedProjectRoot === projectRoot && _cachedAliases) return _cachedAliases;
  _cachedAliases = loadPathAliases(projectRoot);
  _cachedProjectRoot = projectRoot;
  return _cachedAliases;
}

// ---------------------------------------------------------------------------
// Import parsing & resolution
// ---------------------------------------------------------------------------

function parseImports(text) {
  const specs = [];
  const importRe = /import\s+[^"']*?["']([^"']+)["']/g;
  const dynamicRe = /import\(\s*["']([^"']+)["']\s*\)/g;
  const requireRe = /require\(\s*["']([^"']+)["']\s*\)/g;
  let match;
  while ((match = importRe.exec(text)) !== null) specs.push(match[1]);
  while ((match = dynamicRe.exec(text)) !== null) specs.push(match[1]);
  while ((match = requireRe.exec(text)) !== null) specs.push(match[1]);
  return specs;
}

function resolveFilePath(base) {
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

function resolveImport(fromFile, spec, srcRoot, projectRoot) {
  // 1. Relative imports
  if (spec.startsWith(".")) {
    const stripped = spec.replace(/\.js$/, "");
    const base = path.resolve(path.dirname(fromFile), stripped);
    return resolveFilePath(base);
  }

  // 2. Path alias imports (e.g. @/components-next/Hero)
  if (projectRoot) {
    const aliases = getPathAliases(projectRoot);
    for (const { prefix, targetDir } of aliases) {
      if (spec.startsWith(prefix)) {
        const rest = spec.slice(prefix.length);
        const base = path.resolve(targetDir, rest);
        const resolved = resolveFilePath(base);
        if (resolved) return resolved;
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Model building
// ---------------------------------------------------------------------------

function relToSrc(absPath, srcRoot) {
  return path.relative(srcRoot, absPath).split(path.sep).join("/");
}

function componentIdForRel(rel) {
  const [first] = rel.split("/");
  if (!first || !rel.includes("/")) return "app";
  return first;
}

export function buildModel(srcRoot, projectRoot) {
  const files = [];
  walk(srcRoot, files);

  const componentFiles = new Map();
  const dependencies = new Map();
  const fileDeps = [];

  for (const absFile of files) {
    const fromRel = relToSrc(absFile, srcRoot);
    const fromComp = componentIdForRel(fromRel);

    if (!componentFiles.has(fromComp)) componentFiles.set(fromComp, new Set());
    componentFiles.get(fromComp).add(fromRel);

    if (!dependencies.has(fromComp)) dependencies.set(fromComp, new Set());

    const text = fs.readFileSync(absFile, "utf8");
    const specs = parseImports(text);
    for (const spec of specs) {
      const resolved = resolveImport(absFile, spec, srcRoot, projectRoot || process.cwd());
      if (!resolved) continue;
      const toRel = relToSrc(resolved, srcRoot);
      const toComp = componentIdForRel(toRel);
      fileDeps.push({ from: fromRel, to: toRel });
      if (toComp !== fromComp) dependencies.get(fromComp).add(toComp);
    }
  }

  // Detect layout wrapping: layout.tsx wraps page.tsx in same/child dirs
  for (const absFile of files) {
    const name = path.basename(absFile);
    if (name !== "layout.tsx" && name !== "layout.ts") continue;
    const layoutDir = path.dirname(absFile);
    const layoutRel = relToSrc(absFile, srcRoot);
    for (const other of files) {
      const otherName = path.basename(other);
      if (otherName !== "page.tsx" && otherName !== "page.ts") continue;
      const otherDir = path.dirname(other);
      // Page must be in same dir or a subdirectory of the layout
      if (!otherDir.startsWith(layoutDir)) continue;
      if (other === absFile) continue;
      const otherRel = relToSrc(other, srcRoot);
      fileDeps.push({ from: layoutRel, to: otherRel, label: "wraps" });
    }
  }

  // Filter phantom components (deps referenced but containing no .ts/.tsx files)
  const realComponentIds = new Set(componentFiles.keys());

  const components = [...componentFiles.keys()]
    .sort()
    .map((id) => ({
      id,
      name: id === "app" ? "app-entry" : id,
      kind: "generated",
      files: [...(componentFiles.get(id) || [])].sort(),
      depends_on: [...(dependencies.get(id) || [])].filter((d) => realComponentIds.has(d)).sort(),
    }));

  // Filter out file deps pointing to non-existent components
  const validFileDeps = fileDeps.filter((d) => {
    const toComp = componentIdForRel(d.to);
    return realComponentIds.has(toComp);
  });

  return {
    generator_version: "1",
    source_root: path.relative(process.cwd(), srcRoot).split(path.sep).join("/") || ".",
    components,
    fileDeps: validFileDeps,
  };
}

// ---------------------------------------------------------------------------
// Mermaid generation
// ---------------------------------------------------------------------------

export function toC3Mermaid(model, c2Model) {
  const lines = ["flowchart LR"];
  const codeIds = new Set(model.components.map((c) => c.id));

  for (const component of model.components) {
    lines.push(`  ${component.id}["${component.name}"]`);
  }

  // Bridge non-code C2 containers as grey nodes
  const bridgedContainers = [];
  if (c2Model) {
    for (const c of c2Model.containers) {
      if (c.id === "webapp" || codeIds.has(c.id)) continue;
      bridgedContainers.push(c);
      lines.push(`  ${sanitizeId(c.id)}["${escapeLabel(c.name)}"]:::c2`);
    }
  }

  for (const component of model.components) {
    for (const to of component.depends_on) {
      lines.push(`  ${component.id} --> ${to}`);
    }
  }

  // Draw C2 relationships between code components and non-code containers
  if (c2Model) {
    const c2Rels = c2Model.rels || [];
    for (const rel of c2Rels) {
      const fromIsCode = codeIds.has(rel.from) || rel.from === "webapp";
      const toIsBridged = bridgedContainers.some((c) => c.id === rel.to);
      if (fromIsCode && toIsBridged) {
        const fromId = rel.from === "webapp" ? "app" : rel.from;
        if (codeIds.has(fromId)) {
          lines.push(`  ${fromId} -.-> ${sanitizeId(rel.to)}`);
        }
      }
    }
  }

  if (bridgedContainers.length > 0) {
    lines.push(`  classDef c2 fill:#f0f0f0,stroke:#999,stroke-dasharray:5 5`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function fileNodeId(relPath) {
  return relPath.replace(/[/.\\[\]-]/g, "_").replace(/\.tsx?$/, "");
}

function fileLabel(relPath) {
  const base = path.basename(relPath).replace(/\.tsx?$/, "");
  if (base === "index" || base === "page" || base === "layout" || base === "route") {
    const parent = path.basename(path.dirname(relPath));
    return parent ? `${parent}/${base}` : base;
  }
  return base;
}

function isStyleImport(relPath) {
  return /\.(s?css|less|styl)$/.test(relPath);
}

const FAN_OUT_THRESHOLD = 5;
const IMPORT_ORDER_THRESHOLD = 5;

export function toC4Mermaid(model) {
  const sections = [];

  for (const component of model.components) {
    // Skip components with fewer than 2 files (show note instead)
    if (component.files.length < 2) {
      sections.push(`### ${component.name}\n\n_Single file, see C3 view._`);
      continue;
    }

    const lines = ["flowchart LR"];
    const fileSet = new Set(component.files);

    for (const file of component.files) {
      lines.push(`  ${fileNodeId(file)}["${fileLabel(file)}"]`);
    }

    const externalNodes = new Set();
    const edges = new Set();
    let hasStyleDeps = false;
    const styleEdgeSources = new Set();

    // Collect cross-component deps per source file for fan-out collapsing
    const extDepsPerSource = new Map();

    for (const dep of model.fileDeps) {
      if (!fileSet.has(dep.from)) continue;
      const edgeKey = `${dep.from}|${dep.to}`;
      if (edges.has(edgeKey)) continue;
      edges.add(edgeKey);

      // Group style imports into a single node
      if (isStyleImport(dep.to)) {
        hasStyleDeps = true;
        styleEdgeSources.add(dep.from);
        continue;
      }

      if (fileSet.has(dep.to)) {
        // Render "wraps" edges with dotted line, normal edges with solid
        if (dep.label === "wraps") {
          lines.push(`  ${fileNodeId(dep.from)} -. "wraps" .-> ${fileNodeId(dep.to)}`);
        } else {
          lines.push(`  ${fileNodeId(dep.from)} --> ${fileNodeId(dep.to)}`);
        }
      } else {
        const toCompId = componentIdForRel(dep.to);
        const toComp = toCompId === "app" ? "app-entry" : toCompId;
        if (!extDepsPerSource.has(dep.from)) extDepsPerSource.set(dep.from, new Map());
        const compMap = extDepsPerSource.get(dep.from);
        if (!compMap.has(toComp)) compMap.set(toComp, []);
        compMap.get(toComp).push(dep.to);
      }
    }

    // Render cross-component deps with fan-out collapsing
    for (const [fromRel, compMap] of extDepsPerSource) {
      for (const [toComp, targets] of compMap) {
        if (targets.length > FAN_OUT_THRESHOLD) {
          // Collapse into a single cluster node
          const clusterId = `_${sanitizeId(toComp)}_cluster_`;
          if (!externalNodes.has(clusterId)) {
            externalNodes.add(clusterId);
            lines.push(`  ${clusterId}["${toComp} (${targets.length} files)"]:::ext`);
          }
          lines.push(`  ${fileNodeId(fromRel)} -.-> ${clusterId}`);
        } else {
          // Render individually; add import-order numbers if at threshold
          const useNumbers = targets.length >= IMPORT_ORDER_THRESHOLD;
          targets.forEach((to, idx) => {
            const extId = fileNodeId(to);
            if (!externalNodes.has(to)) {
              externalNodes.add(to);
              lines.push(`  ${extId}["${toComp}/${fileLabel(to)}"]:::ext`);
            }
            if (useNumbers) {
              lines.push(`  ${fileNodeId(fromRel)} -.->|"${idx + 1}"| ${extId}`);
            } else {
              lines.push(`  ${fileNodeId(fromRel)} -.-> ${extId}`);
            }
          });
        }
      }
    }

    // Add grouped styles node
    if (hasStyleDeps) {
      lines.push(`  _styles_["styles"]:::ext`);
      for (const src of styleEdgeSources) {
        lines.push(`  ${fileNodeId(src)} -.-> _styles_`);
      }
    }

    if (externalNodes.size > 0 || hasStyleDeps) {
      lines.push(`  classDef ext fill:#f0f0f0,stroke:#999,stroke-dasharray:5 5`);
    }

    lines.push("");
    sections.push(`### ${component.name}\n\n\`\`\`mermaid\n${lines.join("\n")}\n\`\`\``);
  }

  return sections.join("\n\n");
}

export function toJson(model) {
  return `${JSON.stringify(model, null, 2)}\n`;
}
