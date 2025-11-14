# 🛠️ yl – Your Lightweight File Generator

**yl** is a global Node.js CLI tool for quickly scaffolding files and folders from customizable templates — perfect for React components, configs, utilities, or any structure you need repeatedly.

---

## 🚀 Features

* ⚡ Instant scaffolding from reusable templates
* 🌍 Global CLI – usable from any project
* 🧩 Dynamic placeholders (NAME, NAMEPASCAL, DATE, FILEINDEX, etc.)
* 📁 Full recursive folder copying
* 🧠 Overrideable config via `ylconfig.json`
* 🗂 Optional custom template directory
* 📦 "No wrapper" mode (output files directly without NAME folder)
* 🔧 Automatic file modifications via `modify.json`

---

## 📦 Installation

```bash
git clone https://github.com/yourusername/yl.git
cd yl
npm install
npm link
```

Now you can run `yl` from anywhere 🎉

---

## 🧰 Usage

### Basic Example

```bash
yl react-component ./src/components --name Header
```

This will:

* Load the template: `templates/react-component/`
* Replace placeholders like `__NAME__`
* Create: `./src/components/Header/`

---

## 🔧 Config File Support (`ylconfig.json`)

You can skip CLI arguments by adding a config file in your project root:

```json
{
  "template": "react-component",
  "output": "./src/components",
  "nowrapper": false,
  "templateDir": "./custom-templates"
}
```

If a value is provided both via CLI and config, **CLI always wins**.

---

## 🏗 Template Structure

```
templates/
└── react-component/
    ├── __NAME__.tsx
    ├── __NAME__.less
    ├── __NAME__.spec.js
    ├── __NAME__.stories.tsx
    └── modify.json  (optional)
```

You may add **any number of template types**, including nested folders.

---

## 🧩 Available Placeholders

| Placeholder      | Description                                      |
| ---------------- | ------------------------------------------------ |
| `__NAME__`       | Raw name from `--name`                           |
| `__NAMEPASCAL__` | Name converted to PascalCase                     |
| `__DATE__`       | Local date string                                |
| `__FILEINDEX__`  | Sequential number based on existing output files |

Example: `my-button` → `MyButton` via `NAMEPASCAL`.

---

## 📁 Optional: "No Wrapper" Mode

Usually templates output into:

```
/output/NAME/
```

But if you run:

```bash
yl react-component ./src --name Header --nowrapper
```

Your files go **directly into `src/`**.

---

## 🛠 Modifications via `modify.json`

Templates can include a `modify.json` file to patch *existing* project files after generation.

Example `modify.json`:

```json
[
  {
    "file": "index.ts",
    "action": "insertAfter",
    "target": "// IMPORTS",
    "text": "import __NAME__ from './__NAME__';"
  }
]
```

Supported actions:

* `insertAfter`
* `insertBefore`
* `append`
* `replace`

This allows templates to automatically update:

* barrels (`index.ts`)
* routing tables
* Redux stores
* component registries

---

## 📁 Example Output

```
src/
└── components/
    └── Header/
        ├── Header.tsx
        ├── Header.less
        ├── Header.spec.js
        └── Header.stories.tsx
```

---

## ⚙️ Custom Template Directory

You can store templates outside the repo:

```bash
yl comp ./src --name Box --templateDir ./my-templates
```

The CLI will search:

1. Custom folder (if provided)
2. Default `/templates` directory

---

## ⚠️ Common Issues

### "Command not found: yl"

Run `npm link` again.

### "Template not found"

Check the folder structure:

```
templates/<template-name>/
```

Check `templateDir` if using it.

### Permission errors

Ensure your entry script is executable:

```bash
chmod +x main.js
```

---

## 🧱 Development

Run locally:

```bash
node main.js react-component ./output --name Test
```

Or auto‑reload with nodemon:

```bash
nodemon main.js react-component ./output --name Test
```

---

## 💡 Future Ideas

* Interactive mode (no flags needed)
* Template configuration via `template.json`
* Shared template packs on npm
* Live preview before writing files
* Better diffing for `modify.json`

---

## 📜 License

MIT © 2025 MAALWINMUSIC

Contributions welcome! ❤️
