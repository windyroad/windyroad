#!/usr/bin/env node

/**
 * c4-generate.mjs — Regenerate C4 architecture diagrams from source code.
 * Portable, self-contained (no npm deps). Run via: node c4-generate.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { detectSourceRoot, buildModel, buildC1Model, buildC2Model, toC1Mermaid, toC2Mermaid, toC3Mermaid, toC4Mermaid, toJson } from "./c4-lib.mjs";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "docs", "architecture", "generated");
const OUT_JSON = path.join(OUT_DIR, "components.json");
const OUT_MERMAID = path.join(OUT_DIR, "components.mmd");
const C4_MODEL = path.join(ROOT, "docs", "architecture", "C4_MODEL.md");

const C1_START = "<!-- c1:generated:start -->";
const C1_END = "<!-- c1:generated:end -->";
const C2_START = "<!-- c2:generated:start -->";
const C2_END = "<!-- c2:generated:end -->";
const C3_START = "<!-- c3:generated:start -->";
const C3_END = "<!-- c3:generated:end -->";
const C4_START = "<!-- c4:generated:start -->";
const C4_END = "<!-- c4:generated:end -->";

const C4_SCAFFOLD = `# C4 Architecture Model

All four C4 levels are generated from source code and project configuration.

## C1: System Context (Generated)

Shows the system, its users, and external dependencies detected from package.json and project configuration.

${C1_START}

${C1_END}

## C2: Container View (Generated)

Shows the major containers (applications, data stores, content) detected from the project structure.

${C2_START}

${C2_END}

## C3: Component View (Generated)

${C3_START}

${C3_END}

## C4: Code View (Generated)

File-level dependency diagrams per component. Dashed arrows indicate cross-component imports. Grey nodes are external files.

${C4_START}

${C4_END}

Regenerate: \`/c4\`
Check freshness: \`/c4-check\`
`;

function bridgeC1C2(c1Model, c2Model) {
  const extIds = new Set(c1Model.externals.map((e) => e.id));
  const containerIds = new Set(c2Model.containers.map((c) => c.id));
  const existingRels = new Set(c2Model.rels.map((r) => `${r.from}|${r.to}`));

  // Hosting external -> static_output or webapp
  const hostingIds = ["netlify", "vercel", "aws", "azure"];
  for (const hid of hostingIds) {
    if (!extIds.has(hid)) continue;
    const ext = c1Model.externals.find((e) => e.id === hid);
    const target = containerIds.has("static_output") ? "static_output" : containerIds.has("webapp") ? "webapp" : null;
    if (target && !existingRels.has(`${target}|${hid}`)) {
      c2Model.rels.push({ from: target, to: hid, label: ext?.rel || "Deployed to" });
      // Add as external system in C2
      if (!containerIds.has(hid)) {
        c2Model.externals = c2Model.externals || [];
        c2Model.externals.push({ id: hid, name: ext.name, desc: ext.desc });
      }
    }
  }

  // CI and tooling externals -> webapp
  for (const ext of c1Model.externals) {
    if (ext.cat !== "ci" && ext.cat !== "tooling") continue;
    if (!containerIds.has("webapp")) continue;
    const key = ext.cat === "tooling" ? `${ext.id}|webapp` : `webapp|${ext.id}`;
    if (existingRels.has(key)) continue;
    c2Model.externals = c2Model.externals || [];
    const alreadyAdded = c2Model.externals.some((e) => e.id === ext.id);
    if (!alreadyAdded) {
      c2Model.externals.push({ id: ext.id, name: ext.name, desc: ext.desc });
    }
    if (ext.cat === "tooling") {
      c2Model.rels.push({ from: ext.id, to: "webapp", label: ext.rel || "Assists" });
    } else {
      c2Model.rels.push({ from: "webapp", to: ext.id, label: ext.rel || "Built by" });
    }
  }
}

function inlineGenerated(startMarker, endMarker, content) {
  if (!fs.existsSync(C4_MODEL)) return;
  const doc = fs.readFileSync(C4_MODEL, "utf8");
  const startIdx = doc.indexOf(startMarker);
  const endIdx = doc.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) return;

  const before = doc.slice(0, startIdx + startMarker.length);
  const after = doc.slice(endIdx);
  const updated = `${before}\n\n${content}\n\n${after}`;
  fs.writeFileSync(C4_MODEL, updated);
}

function main() {
  const srcRoot = detectSourceRoot(ROOT);

  // C1/C2: project-level detection
  const c1Model = buildC1Model(ROOT);
  const c2Model = buildC2Model(ROOT);

  // Bridge C1 externals to C2 containers
  bridgeC1C2(c1Model, c2Model);

  const c1Mermaid = toC1Mermaid(c1Model);
  const c2Mermaid = toC2Mermaid(c2Model);

  // C3/C4: source code analysis
  const model = buildModel(srcRoot, ROOT);
  const json = toJson(model);
  const c3Mermaid = toC3Mermaid(model, c2Model);
  const c4Mermaid = toC4Mermaid(model);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Create scaffold if C4_MODEL.md doesn't exist
  if (!fs.existsSync(C4_MODEL)) {
    fs.mkdirSync(path.dirname(C4_MODEL), { recursive: true });
    fs.writeFileSync(C4_MODEL, C4_SCAFFOLD);
  }

  fs.writeFileSync(OUT_JSON, json);
  fs.writeFileSync(OUT_MERMAID, c3Mermaid);
  inlineGenerated(C1_START, C1_END, `\`\`\`mermaid\n${c1Mermaid.trimEnd()}\n\`\`\``);
  inlineGenerated(C2_START, C2_END, `\`\`\`mermaid\n${c2Mermaid.trimEnd()}\n\`\`\``);
  inlineGenerated(C3_START, C3_END, `\`\`\`mermaid\n${c3Mermaid.trimEnd()}\n\`\`\``);
  inlineGenerated(C4_START, C4_END, c4Mermaid);

  // Render mermaid diagrams to SVG and PNG
  const diagrams = [
    { name: "c1-context", mermaid: c1Mermaid },
    { name: "c2-container", mermaid: c2Mermaid },
    { name: "c3-components", mermaid: c3Mermaid },
  ];

  // Extract individual C4 code view diagrams
  const c4Sections = c4Mermaid.split(/^### /m).filter(Boolean);
  for (const section of c4Sections) {
    const nameEnd = section.indexOf("\n");
    const compName = section.slice(0, nameEnd).trim();
    const mmdMatch = section.match(/```mermaid\n([\s\S]*?)```/);
    if (mmdMatch) {
      diagrams.push({ name: `c4-${compName.replace(/[^a-zA-Z0-9-]/g, "-")}`, mermaid: mmdMatch[1] });
    }
  }

  const rendered = renderDiagrams(diagrams, OUT_DIR);

  // Embed PNGs in C4_MODEL.md (replace mermaid blocks with images + details)
  if (rendered > 0) {
    embedPngs(C4_MODEL, OUT_DIR, path.dirname(C4_MODEL));
  }

  console.log("PASS: C4 artifacts generated:");
  console.log(`- ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`- ${path.relative(ROOT, OUT_MERMAID)}`);
  console.log(`- ${path.relative(ROOT, C4_MODEL)} (C1 + C2 + C3 + C4 sections updated)`);
  if (rendered > 0) {
    console.log(`- ${rendered} diagram(s) rendered to SVG + PNG in ${path.relative(ROOT, OUT_DIR)}/`);
  }
}

function embedPngs(modelPath, outDir, modelDir) {
  if (!fs.existsSync(modelPath)) return;
  let doc = fs.readFileSync(modelPath, "utf8");
  const relOutDir = path.relative(modelDir, outDir).split(path.sep).join("/");

  // Map section markers to PNG names
  const sections = [
    { start: C1_START, end: C1_END, png: "c1-context.png", alt: "C1 System Context Diagram" },
    { start: C2_START, end: C2_END, png: "c2-container.png", alt: "C2 Container Diagram" },
    { start: C3_START, end: C3_END, png: "c3-components.png", alt: "C3 Component Diagram" },
  ];

  for (const { start, end, png, alt } of sections) {
    const pngPath = path.join(outDir, png);
    if (!fs.existsSync(pngPath)) continue;

    const startIdx = doc.indexOf(start);
    const endIdx = doc.indexOf(end);
    if (startIdx === -1 || endIdx === -1) continue;

    const before = doc.slice(0, startIdx + start.length);
    const between = doc.slice(startIdx + start.length, endIdx);
    const after = doc.slice(endIdx);

    // Extract mermaid source from existing content
    const mmdMatch = between.match(/```mermaid\n([\s\S]*?)```/);
    const mmdSource = mmdMatch ? mmdMatch[1].trimEnd() : "";

    const imgRef = `![${alt}](${relOutDir}/${png})`;
    const details = mmdSource
      ? `\n\n<details>\n<summary>Mermaid source</summary>\n\n\`\`\`mermaid\n${mmdSource}\n\`\`\`\n\n</details>`
      : "";

    doc = `${before}\n\n${imgRef}${details}\n\n${after}`;
  }

  // Handle C4 code views (multiple sub-diagrams)
  const c4StartIdx = doc.indexOf(C4_START);
  const c4EndIdx = doc.indexOf(C4_END);
  if (c4StartIdx !== -1 && c4EndIdx !== -1) {
    const c4Before = doc.slice(0, c4StartIdx + C4_START.length);
    const c4Between = doc.slice(c4StartIdx + C4_START.length, c4EndIdx);
    const c4After = doc.slice(c4EndIdx);

    // Replace each ### section's mermaid block with PNG + details
    const replaced = c4Between.replace(/### (.+)\n\n```mermaid\n([\s\S]*?)```/g, (match, name, source) => {
      const pngName = `c4-${name.trim().replace(/[^a-zA-Z0-9-]/g, "-")}.png`;
      const pngFile = path.join(outDir, pngName);
      if (!fs.existsSync(pngFile)) return match;
      const imgRef = `![C4 ${name.trim()} Code View](${relOutDir}/${pngName})`;
      return `### ${name}\n\n${imgRef}\n\n<details>\n<summary>Mermaid source</summary>\n\n\`\`\`mermaid\n${source.trimEnd()}\n\`\`\`\n\n</details>`;
    });

    doc = `${c4Before}${replaced}${c4After}`;
  }

  fs.writeFileSync(modelPath, doc);
}

function renderDiagrams(diagrams, outDir) {
  const mmdc = "npx -y @mermaid-js/mermaid-cli";
  const TIMEOUT = 120000; // 2 minutes per render (first run downloads puppeteer)

  // Write all .mmd files first
  for (const { name, mermaid } of diagrams) {
    fs.writeFileSync(path.join(outDir, `${name}.mmd`), mermaid);
  }

  // Test mmdc availability with the first diagram
  const first = diagrams[0];
  const testMmd = path.join(outDir, `${first.name}.mmd`);
  const testSvg = path.join(outDir, `${first.name}.svg`);
  try {
    execSync(`${mmdc} -i "${testMmd}" -o "${testSvg}" -b transparent`, { stdio: "pipe", timeout: TIMEOUT });
  } catch {
    console.log("NOTE: @mermaid-js/mermaid-cli not available. Skipping SVG/PNG rendering.");
    console.log("      Install with: npm i -D @mermaid-js/mermaid-cli");
    return 0;
  }

  // First SVG succeeded, now render its PNG and the rest
  let count = 0;
  for (const { name } of diagrams) {
    const mmdPath = path.join(outDir, `${name}.mmd`);
    const svgPath = path.join(outDir, `${name}.svg`);
    const pngPath = path.join(outDir, `${name}.png`);

    try {
      // Skip SVG for first diagram (already rendered above)
      if (name !== first.name) {
        execSync(`${mmdc} -i "${mmdPath}" -o "${svgPath}" -b transparent`, { stdio: "pipe", timeout: TIMEOUT });
      }
      execSync(`${mmdc} -i "${mmdPath}" -o "${pngPath}" -b white`, { stdio: "pipe", timeout: TIMEOUT });
      count++;
    } catch (err) {
      console.log(`WARNING: Failed to render ${name}: ${err.message}`);
    }
  }
  return count;
}

main();
