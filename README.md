# ⚡ KiCad Master Guide

> A complete interactive PCB design reference for electrical engineers learning KiCad — built with React + Vite.

🔗 **Live Site:** [https://krishnavamsi333.github.io/kicad-guide/](https://krishnavamsi333.github.io/kicad-guide/)

---

## 📦 Features

| Tab | What's Inside |
|---|---|
| **Workflow** | 11-step KiCad process from project creation to ordering |
| **Schematic** | Eeschema tools, best practices, common traps |
| **PCB Layout** | Layer guide, routing tips, copper pour reference |
| **Shortcuts** | Searchable shortcut list with copy-to-clipboard |
| **Design Rules** | Trace width, clearance, via size tables (IPC-2221) |
| **Export & Fab** | Gerber export steps + fab house comparison |
| **✓ Checklist** | Interactive pre-fab checklist with progress bar |
| **⚡ Calculators** | Trace width · Via current · Ohm's Law · SMD sizes |
| **Resources** | Best YouTube channels, tools, forums |

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/kicad-guide.git
cd kicad-guide

# Install dependencies
npm install

# Run dev server
npm run dev -- --host
```

Then open `http://localhost:5173` in your browser.

---

## 🏗️ Build & Deploy

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

Deployment to GitHub Pages is **automatic** via GitHub Actions on every push to `main`.

### First-time GitHub Pages setup:
1. Push your code to GitHub
2. Go to **Settings → Pages**
3. Set Source to **GitHub Actions**
4. Push to `main` — the workflow deploys automatically

---

## 🗂️ Project Structure

```
src/
├── App.jsx                      # Root component, tab state
├── App.css                      # All shared component styles
├── index.css                    # CSS variables, body, animations
├── main.jsx                     # React entry point
└── components/
    ├── Header.jsx               # Title + theme toggle
    ├── Tabs.jsx                 # Navigation tab bar
    ├── Footer.jsx               # Bottom bar
    ├── Workflow.jsx             # 11-step workflow
    ├── Schematic.jsx            # Schematic editor guide
    ├── Layout.jsx               # PCB layout guide
    ├── ShortcutSearch.jsx       # Searchable shortcuts + copy
    ├── Rules.jsx                # Design rules tables
    ├── Export.jsx               # Gerber export + fab comparison
    ├── InteractiveChecklist.jsx # Clickable checklist + progress
    ├── TraceCalculator.jsx      # Calculator hub (sub-tabs)
    ├── OhmCalculator.jsx        # V=IR solver
    ├── SMDReference.jsx         # SMD package size visual
    ├── ThemeToggle.jsx          # Dark / Light mode
    └── Resources.jsx            # Learning resources
```

---

## 🛠️ Tech Stack

- **React 18** — UI components and state
- **Vite 7** — Build tool and dev server
- **CSS Variables** — Theming (dark/light mode)
- **IPC-2221** — Standard used for trace/via calculations
- **GitHub Actions** — Auto-deploy on push to main

---

## 📐 Calculators

All calculations follow **IPC-2221** standard:

- **Trace Width:** `W = A / (T × 25.4)` where `A = (I / (0.048 × ΔT^0.44))^(1/0.725)`
- **Via Current:** `I = 0.048 × ΔT^0.44 × A^0.725` where `A = π × d × t`
- **Ohm's Law:** `V = IR`, `I = V/R`, `R = V/I`, `P = VI`

Always add **20–30% safety margin** to calculated values.

---

## 📄 License

MIT — free to use, modify, and share.

---

*Built for electrical engineers stepping into PCB design with KiCad 7/8.*
