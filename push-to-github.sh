#!/usr/bin/env bash
set -e

REPO_URL="https://github.com/salvatoredymond/joowifi-cloud.git"

echo "========================================================"
echo "  JOOWIFI CLOUD — Déploiement vers GitHub"
echo "  Dépôt cible : $REPO_URL"
echo "========================================================"

if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

if git remote | grep -q "^origin$"; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

git add -A
git commit -m "feat(joowifi): complete Phases 1-4 SaaS & PWA (Frontend, Backend API Heartbeat 45s, RouterOS .rsc, Mobile Money & RAG AI)" || true
git push -u origin main

echo "✅ Code poussé avec succès sur $REPO_URL !"
