#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# zkCAP — Local Development Setup Script
# ──────────────────────────────────────────────

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "╔══════════════════════════════════════╗"
echo "║       zkCAP — Setup Script           ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── Backend ──────────────────────────────────
echo "→ Setting up backend..."
cd "$ROOT_DIR/backend"

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "  ✓ Created .env from .env.example"
else
    echo "  ○ .env already exists, skipping"
fi

echo "  → Installing Python dependencies..."
pip install -r requirements.txt
echo "  ✓ Backend dependencies installed"

# ── Frontend ─────────────────────────────────
echo ""
echo "→ Setting up frontend..."
cd "$ROOT_DIR/frontend"

echo "  → Installing Node.js dependencies..."
npm install
echo "  ✓ Frontend dependencies installed"

# ── Done ─────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════╗"
echo "║           Setup Complete!            ║"
echo "╠══════════════════════════════════════╣"
echo "║                                      ║"
echo "║  Start backend:                      ║"
echo "║    cd backend                        ║"
echo "║    uvicorn main:app --reload         ║"
echo "║                                      ║"
echo "║  Start frontend:                     ║"
echo "║    cd frontend                       ║"
echo "║    npm run dev                       ║"
echo "║                                      ║"
echo "╚══════════════════════════════════════╝"
