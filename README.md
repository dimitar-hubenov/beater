# Beater

### Beater — Chase portable activators with confidence

**Beater** is a modern web application for radio amateurs who participate in portable activation programs such as POTA, SOTA, WWFF, and similar schemes.

It focuses on fast spot visualization, smart filtering, and practical information that helps hunters and activators make better decisions in real time.

---

## Why Beater?

Most spotting tools show raw lists of spots.

Beater goes a step further by adding context, classification, and meaning to each spot:

- What band is it on?
- How far is it from me?
- Is this likely a local contact, medium-range, or long-haul?
- Which programs are currently active?

The goal is to reduce noise and surface what actually matters.

---

## Key Features

### Smart Spot Table

- Live display of spots from multiple programs  
- Clear, compact table layout  
- Human-friendly formatting for frequency and distance  

### Band Detection

- Automatic band detection from frequency  
- Support for HF, VHF, and UHF bands  
- Fallback band for unknown or unsupported frequencies  

### Distance & Propagation Zones

Each spot is classified into distance zones per band:

- **Skip** – first-hop skip zone  
- **Near** – easy / local contacts  
- **Medium** – moderate distance  
- **Far** – long-distance / DX  

Color-coded visualization makes interpretation instant.

### Band Toggles

- Bands grouped into logical toggles  
- Enable/disable entire groups with one click  
- Keeps UI clean even with many bands  

### Localization (i18n)

- Built-in localization system  
- Currently supports:
  - English  
  - Bulgarian  

Easy to extend with additional languages.

### User Settings

- Preferred language  
- Distance unit (km / mi)  
- Persistently stored  

---

## Getting Started

```bash
npm install
npm run dev
```

Then open:
```bash
http://localhost:5173
```

---

## Contributing

Contributions are welcome!

If you want to help:

1. Fork the repository

2. Create a feature branch

3. Add tests where appropriate

4. Open a pull request

## License

**Beater** is licensed under the GNU General Public License v3.0.

You are free to use, study, modify, and distribute this software under
the terms of the GPL-3.0 license.

See the LICENSE file for details.

## Philosophy

**Beater** is built by a radio amateur, for radio amateurs.

It aims to stay:

- Lightweight

- Transparent

- Practical

No ads. No tracking. Just radio.