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
  .argument("<template>", "Template name (e.g. react-template)")
  .argument("<output>", "Output path (relative or absolute)")
  .requiredOption("--name <name>", "Component or file name")
  .option("--nowrapper", "Don't wrap the template in a folder named after the component")
  .parse(process.argv);

const [template, outputPath] = program.args;
const { name, nowrapper } = program.opts<{ name: string; nowrapper?: boolean }>();

const templateDir = path.join(__dirname, "../templates", template);
if (!fs.existsSync(templateDir)) {
  console.error(`❌ Template "${template}" not found.`);
  process.exit(1);
}

const absOutputPath = nowrapper
  ? path.resolve(process.cwd(), outputPath)
  : path.resolve(process.cwd(), outputPath, name);

fs.mkdirSync(absOutputPath, { recursive: true });
const replacements = {
  NAME: name,
  NAMEPASCAL: name
    .split("-")
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(""),
  DATE: new Date().toLocaleDateString(),
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

copyTemplate(templateDir, absOutputPath, replacements);
console.log(`✨ Done! Created "${name}" using template "${template}".`);