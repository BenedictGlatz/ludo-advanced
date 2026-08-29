/**
 * Generates 00-Meta/Documentation/notes/13-ai-index.md from the AI prompt log.
 *
 * Reads every 00-Meta/AI-Prompts/<github-username>/YYYY-MM-DD.json, sorts the entries by timestamp,
 * groups them by `topic` into the six subsections Chapter 13 defines, and writes the file.
 *
 * The prompt log is gitignored and kept per machine (decision of 2026-08-10), so a fresh clone has
 * nobody's entries but its own. Whoever regenerates the chapter has to collect the other
 * contributors' folders out of band first. This script says so when it finds fewer than two.
 *
 * It fails loudly on an unknown `topic` or `use` rather than dropping the entry, because a missing
 * prompt is the one defect this chapter cannot afford.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const LOG_ROOT = join("00-Meta", "AI-Prompts");
const OUTPUT = join("00-Meta", "Documentation", "notes", "13-ai-index.md");

const TOPICS = [
  ["concept-architecture", "13.1 Concept and architecture decisions"],
  ["game-logic", "13.2 Code generation and game logic"],
  ["frontend-ui", "13.3 UI/UX development and styling"],
  ["debugging", "13.4 Debugging and problem solving"],
  ["tooling-tests", "13.5 Code quality, refactoring and testing"],
  ["process-docs", "13.6 Documentation and process"],
];

const USE_LABELS = {
  informational: "Purely informational",
  research: "Research, purely informational",
  implementation: "Used for implementation",
  adopted: "Adopted verbatim",
  revised: "Adopted with revisions",
};

function fail(message) {
  console.error(`docs:ai-index: ${message}`);
  process.exit(1);
}

function readEntries() {
  if (!existsSync(LOG_ROOT)) fail(`${LOG_ROOT} does not exist. Nothing to generate from.`);

  const contributors = readdirSync(LOG_ROOT).filter((name) =>
    statSync(join(LOG_ROOT, name)).isDirectory()
  );
  if (contributors.length === 0) fail(`${LOG_ROOT} holds no contributor folders.`);

  const entries = [];
  for (const contributor of contributors) {
    const dir = join(LOG_ROOT, contributor);
    for (const file of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
      const path = join(dir, file);
      let parsed;
      try {
        parsed = JSON.parse(readFileSync(path, "utf8"));
      } catch (error) {
        fail(`${path} is not valid JSON: ${error.message}`);
      }
      if (!Array.isArray(parsed)) fail(`${path} must hold a JSON array.`);
      parsed.forEach((entry, index) => {
        const where = `${path} entry ${index + 1}`;
        if (!entry.timestamp) fail(`${where} has no timestamp.`);
        if (!entry.model) fail(`${where} has no model.`);
        if (!entry.prompt) fail(`${where} has no prompt.`);
        const use = entry.use ?? "implementation";
        if (!USE_LABELS[use]) fail(`${where} has an unknown use value: ${use}`);
        if (!TOPICS.some(([id]) => id === entry.topic)) {
          fail(`${where} has an unknown topic value: ${entry.topic}`);
        }
        entries.push({ ...entry, use, contributor });
      });
    }
  }
  return { entries, contributors };
}

function escapeCell(text) {
  return String(text).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function render(entries, contributors) {
  const sorted = [...entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const lines = [
    "# 13 AI index",
    "",
    "> **Generated. Do not edit by hand.**",
    ">",
    "> Source: `00-Meta/AI-Prompts/<github-username>/YYYY-MM-DD.json`",
    "> Command: `npm run docs:ai-index`",
    "",
    `Every prompt sent to an AI system during this project: **${sorted.length} entries** from ` +
      `**${contributors.length} contributor folder(s)** (${contributors.join(", ")}). Completeness ` +
      "is the point, so trivial prompts are in here too.",
    "",
  ];

  if (contributors.length < 2) {
    lines.push(
      "> **Incomplete.** Only one contributor's folder was present when this ran. The prompt log " +
        "is gitignored and kept per machine, so the others have to be collected out of band and " +
        "placed here before the chapter is complete.",
      ""
    );
  }

  for (const [topic, heading] of TOPICS) {
    const rows = sorted.filter((entry) => entry.topic === topic);
    lines.push(`## ${heading}`, "");
    if (rows.length === 0) {
      lines.push("*No prompts recorded under this topic.*", "");
      continue;
    }
    lines.push("| System | Prompt | Use |", "| --- | --- | --- |");
    for (const row of rows) {
      lines.push(
        `| \`${escapeCell(row.model)}\` | ${escapeCell(row.prompt)} | ${USE_LABELS[row.use]} |`
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

const { entries, contributors } = readEntries();
writeFileSync(OUTPUT, render(entries, contributors), "utf8");
console.log(
  `docs:ai-index: wrote ${OUTPUT} from ${entries.length} entries across ${contributors.length} contributor folder(s).`
);
