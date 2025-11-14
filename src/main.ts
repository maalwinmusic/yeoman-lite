#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name("yl")
  .description("Your personal scaffolding CLI")
  .argument("[template]", "Template name (e.g. react-template)")
  .argument("[output]", "Output path (relative or absolute)")
  .requiredOption("-n, --name <name>", "Component or file name")
  .option("--nowrapper", "Don't wrap the template in a folder named after the component")
  .option("--templateDir <path>", "Optional custom template directory to search first")
  .parse(process.argv);

const cwd = process.cwd();
const configPath = path.join(cwd, "ylconfig.json");
let config: Partial<{
  template: string;
  output: string;
  nowrapper: boolean;
  templateDir: string;
}> = {};

if (fs.existsSync(configPath)) {
  try {
    const content = fs.readFileSync(configPath, "utf8");
    config = JSON.parse(content);
    console.log(`🧩 Using configuration from ylconfig.json`);
  } catch (err) {
    console.error(`⚠️ Failed to parse ylconfig.json: ${(err as Error).message}`);
    process.exit(1);
  }
}

const [argTemplate, argOutput] = program.args;
const { name, nowrapper, templateDir } = program.opts<{
  name: string;
  nowrapper?: boolean;
  templateDir?: string;
}>();

// Prefer CLI arguments over config file
const template = argTemplate ?? config.template;
const outputPath = argOutput ?? config.output;
const useNoWrapper = nowrapper ?? config.nowrapper ?? false;
const customTemplateDir = templateDir ?? config.templateDir;

if (!template || !outputPath) {
  console.error(
    `❌ Missing required arguments. Either pass <template> and <output> directly, or define them in ylconfig.json.`
  );
  process.exit(1);
}

const defaultTemplateDir = path.join(__dirname, "../templates");
const searchPaths = customTemplateDir
  ? [path.resolve(cwd, customTemplateDir), defaultTemplateDir]
  : [defaultTemplateDir];

// Find first existing template
let foundTemplateDir: string | null = null;
for (const dir of searchPaths) {
  const candidate = path.join(dir, template);
  if (fs.existsSync(candidate)) {
    foundTemplateDir = candidate;
    break;
  }
}

if (!foundTemplateDir) {
  console.error(`❌ Template "${template}" not found in:`);
  for (const dir of searchPaths) console.error(`   - ${dir}`);
  process.exit(1);
}

const absOutputPath = useNoWrapper
  ? path.resolve(cwd, outputPath)
  : path.resolve(cwd, outputPath, name);

fs.mkdirSync(absOutputPath, { recursive: true });
const replacements = {
  NAME: name,
  NAMEPASCAL: name
    .split("-")
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(""),
  DATE: new Date().toLocaleDateString(),
  FILEINDEX: `${fs.readdirSync(absOutputPath).length + 1}`
};

function replacePlaceholders(str: string, replacements: Record<string, string>): string {
  return Object.entries(replacements).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`__${key}__`, "g"), value),
    str
  );
}

function copyTemplate(src: string, dest: string, replacements: Record<string, string>) {
  const files = fs.readdirSync(src, { withFileTypes: true });

  for (const file of files) {
    const srcPath = path.join(src, file.name);
    const destName = replacePlaceholders(file.name, replacements);
    const destPath = path.join(dest, destName);

    if (file.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTemplate(srcPath, destPath, replacements);
    } else {
      const content = fs.readFileSync(srcPath, "utf8");
      const replaced = replacePlaceholders(content, replacements);
      fs.writeFileSync(destPath, replaced);
      console.log(`✅ ${destPath}`);
    }
  }
}

copyTemplate(foundTemplateDir, absOutputPath, replacements);
console.log(`✨ Done! Created "${name}" using template "${template}".`);