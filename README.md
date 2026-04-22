# Outline VPN Premium Guide

A premium, “Notebook-style” static guide for setting up **DigitalOcean + Outline VPN**, with a modern UI, bilingual navigation (ENG/MYM), and copy-to-clipboard command cards.

> **Live Demo**: [https://KarKarLay15.github.io/outline-vpn-guide/](https://KarKarLay15.github.io/outline-vpn-guide/)

## 📸 Preview

<p align="center">
  <img alt="Outline VPN Premium Guide — passcode login preview" src="https://github.com/user-attachments/assets/867a758d-4d10-444e-bd74-223a471c33e9" width="92%" />
</p>

## Features

- **Premium UI**: dark/light theme, glass panels, responsive layout (mobile + desktop)
- **Bilingual experience**: **ENG / MYM** language toggle (guide content; login UI stays English)
- **Passcode gate**: client-side passcode with lockout + persistence (intended for casual protection, not a replacement for real authentication)
- **Step-by-step guide**: free credit, droplet setup, server prep/BBR, Outline install, firewall options, admin UI, dynamic keys
- **Command cards**: bash snippets in dark code blocks with **Copy** buttons
- **Outline Admin section**: screenshot gallery + click-to-expand preview

## Tech Stack

- **React** + **TypeScript** (Vite)
- **Tailwind CSS**
- **lucide-react** icons

## Setup Instructions (Local)

### Prerequisites

- **Node.js** (LTS recommended)
- **npm** (comes with Node)

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open the local URL Vite prints (commonly `http://localhost:5173/`).

### Production Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure (high level)

- `src/App.tsx`: main page content + language/auth/ui logic
- `src/index.css`: Tailwind entry + small global utilities
- `vite.config.ts`: Vite configuration

## Notes

- The passcode in this demo is a **frontend-only gate**. If you need real security, add server-side auth and hosting controls.
