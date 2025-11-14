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

function copyTemplate(
  src: string,
  dest: string,
  replacements: Record<string, string>,
  modify: Modification[] | null = null,
  modTargets: Set<string> | null = null,
  isTopLevel: boolean = true
) {
  const files = fs.readdirSync(src, { withFileTypes: true });

  // Only check for modify.json at TOP LEVEL
  if (isTopLevel) {
    const modifyJSON = files.find(f => f.name === "modify.json");

    if (modifyJSON) {
      modify = JSON.parse(
        fs.readFileSync(path.join(src, modifyJSON.name), "utf8")
      ) as Modification[];

      modTargets = new Set(
        modify.map(m => path.basename(replacePlaceholders(m.file, replacements)))
      );
    }
  }

  for (const file of files) {
    // Skip modify.json everywhere, but only allowed at top level
    if (file.name === "modify.json") {
      if (!isTopLevel) {
        console.warn(`⚠️ Ignored nested modify.json at: ${src}`);
      }
      continue;
    }

    const srcPath = path.join(src, file.name);
    const destName = replacePlaceholders(file.name, replacements);
    const destPath = path.join(dest, destName);

    if (file.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTemplate(srcPath, destPath, replacements, modify, modTargets, false);
      continue;
    }

    // Handle "skip if we will modify later"
    // if (modTargets) {
    //   const shouldModify = modTargets.has(destName);
    //   const existsAlready = fs.existsSync(destPath);

    //   if (shouldModify && existsAlready) {
    //     console.log(`↪️ Skipped writing ${destName} (will be modified)`);
    //     continue;
    //   }
    // }
    if (modTargets && modTargets.has(destName)) {
      const existsAlready = fs.existsSync(destPath);
      if (existsAlready) {
        console.log(`↪️ Skipped writing ${destName} (will be modified)`);
        continue;
      }
    }

    const content = fs.readFileSync(srcPath, "utf8");
    const replaced = replacePlaceholders(content, replacements);

    fs.writeFileSync(destPath, replaced);
    console.log(`📄 Created: ${destPath}`);
  }

  // Only apply modification at top level (once)
  if (isTopLevel && modify) {
    applyModifications(dest, modify, replacements);
  }
}

function applyModifications(
  projectRoot: string,
  modifications: Array<Modification>,
  replacements: Record<string, string>
) {
  for (const mod of modifications) {
    const targetPath = path.join(projectRoot, mod.file);

    if (!fs.existsSync(targetPath)) {
      console.warn(`⚠️ Modification skipped. File not found: ${targetPath}`);
      continue;
    }

    let content = fs.readFileSync(targetPath, "utf8");
    const replacedText = replacePlaceholders(mod.text, replacements);

    switch (mod.action) {
      case "insertAfter": {
        if (!mod.target) throw new Error("insertAfter requires a target");
        const idx = content.indexOf(mod.target);
        if (idx === -1) {
          console.warn(`⚠️ Target not found in ${mod.file}: "${mod.target}"`);
          break;
        }
        const insertPos = content.indexOf("\n", idx) + 1;
        content = content.slice(0, insertPos) + replacedText + "\n" + content.slice(insertPos);
        break;
      }

      case "insertBefore": {
        if (!mod.target) throw new Error("insertBefore requires a target");
        const idx = content.indexOf(mod.target);
        if (idx === -1) {
          console.warn(`⚠️ Target not found in ${mod.file}: "${mod.target}"`);
          break;
        }
        content = content.slice(0, idx) + replacedText + "\n" + content.slice(idx);
        break;
      }

      case "append": {
        content += "\n" + replacedText;
        break;
      }

      case "replace": {
        if (!mod.target) throw new Error("replace requires a target");
        const regex = new RegExp(mod.target, "g");
        content = content.replace(regex, replacedText);
        break;
      }
    }

    fs.writeFileSync(targetPath, content);
    console.log(`✏️ Modified ${mod.file}`);
  }
}

copyTemplate(foundTemplateDir, absOutputPath, replacements);
console.log(`✨ Done! Created "${name}" using template "${template}".`);

type Modification = {
  file: string;
  action: "insertAfter" | "insertBefore" | "append" | "replace";
  target?: string;
  text: string;
};