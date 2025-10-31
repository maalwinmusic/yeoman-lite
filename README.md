const readme = `

# 🛠️ yl – Your Lightweight File Generator

**yl** is a global Node.js CLI tool that helps you quickly scaffold files and folders from templates — perfect for React components, configuration files, or any code structure you use repeatedly.

---

## 🚀 Features

- ⚡ Instant scaffolding from reusable templates
- 🌍 Global CLI – usable from any project
- 🧩 Dynamic placeholders (**NAME**, **AUTHOR**, **DATE**, etc.)
- 📁 Nested folder support (recursive copy)
- 🧠 Simple config via CLI flags

---

## 📦 Installation

First, clone the repo:

\`\`\`bash
git clone https://github.com/yourusername/yl.git
cd yl
npm install
\`\`\`

Then link it globally:

\`\`\`bash
npm link
\`\`\`

Now you can use it anywhere on your machine 🎉

---

## 🧰 Usage

### Basic Example

\`\`\`bash
yl react-component ./src/components --name Header
\`\`\`

This will:

- Copy everything from \`templates/react-component/\`
- Replace every **NAME** placeholder with \`Header\`
- Output the generated files to \`./src/components/Header/\`

---

### Full Example with Multiple Flags

\`\`\`bash
yl react-component ./src/components --name Button --author "Jane Doe" --type component
\`\`\`

Inside your templates you can now use placeholders:

\`\`\`tsx
// **NAME**.tsx
// Author: **AUTHOR**
// Type: **TYPE**
\`\`\`

Result:

\`\`\`tsx
// Button.tsx
// Author: Jane Doe
// Type: component
\`\`\`

---

## 🏗 Template Structure

Your templates live in the \`templates/\` folder, organized by type:

\`\`\`
templates/
└── react-component/
├── **NAME**.tsx
├── **NAME**.less
├── **NAME**.spec.js
└── **NAME**.stories.tsx
\`\`\`

You can add as many template types as you like — for example:

\`\`\`
templates/api-endpoint/
templates/hook/
templates/context/
\`\`\`

---

## 🧩 Placeholders

Anywhere in your file names or contents, you can use placeholders wrapped in double underscores:

| Placeholder        | Description                           | Example Result |
| ------------------ | ------------------------------------- | -------------- |
| \***\*NAME\*\***   | The name provided via \`--name\` flag | Header         |
| \***\*AUTHOR\*\*** | Author name (optional)                | John Doe       |
| \***\*DATE\*\***   | Date of generation                    | 31/10/2025     |
| \***\*TYPE\*\***   | Optional custom field                 | component      |

---

## 📁 Output Example

Running:

\`\`\`bash
yl react-component ./src/components --name Header
\`\`\`

Creates:

\`\`\`
src/
└── components/
└── Header/
├── Header.tsx
├── Header.less
├── Header.spec.js
└── Header.stories.tsx
\`\`\`

---

## 🧠 How It Works

1. The CLI reads the selected template folder.
2. It recursively copies all files and folders.
3. It replaces all placeholder patterns (**NAME**, etc.) in:
   - File names
   - Folder names
   - File contents
4. It outputs the generated result into your chosen destination folder.

---

## ⚠️ Common Issues & Fixes

### ❌ Command not found: yl

You need to link the tool globally first:

\`\`\`bash
npm link
\`\`\`

If you’ve done that and it still fails, try reinstalling Node’s global bin path:

\`\`\`bash
npm uninstall -g yl && npm link
\`\`\`

---

### ❌ Permission denied (macOS/Linux)

Make sure your script is executable:

\`\`\`bash
chmod +x main.js
\`\`\`

---

### ❌ “Template not found”

Double-check your template folder structure:

\`\`\`
templates/<template-name>/
\`\`\`

…and that you’re spelling the <template-name> correctly in your CLI command.

---

## 🧱 Development

Want to hack on it? Run it locally without linking:

\`\`\`bash
node main.js react-component ./output --name Test
\`\`\`

Or watch for changes:

\`\`\`bash
nodemon main.js react-component ./output --name Test
\`\`\`

---

## 💡 Ideas for the Future

- Add interactive prompts (no flags needed)
- Support config files per template (template.json)
- Publish templates to npm for team sharing
- Colorized console output
- Live preview mode (generate → view → confirm)

---

## 📜 License

MIT © 2025 MAALWINMUSIC  
Contributions welcome! ❤️
