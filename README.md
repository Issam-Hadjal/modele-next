# Modèle Next.js

Le point de départ des projets Next.js : Next.js 16, React 19, TypeScript,
Tailwind CSS 4, des tests unitaires (Vitest), de bout en bout et d’accessibilité
(Playwright et axe), et la CI du pipeline. Un projet naît de ce dépôt par
« Use this template », puis suit la procédure d’ouverture.

Les consignes des agents, la pile et les commandes sont dans [AGENTS.md](AGENTS.md),
qui se complète à l’ouverture du projet.

## Tenu à jour

Dependabot propose chaque lundi les mises à jour des paquets, les mineures
regroupées en une pull request. La CI doit être verte ; bot-busquets donne son
avis ; le propriétaire fusionne. La version de Node (`.nvmrc`, `engines`,
`@types/node`) change à la main, jamais par Dependabot.

`dependabot.yml` ne sert qu’au modèle : il est retiré à l’ouverture d’un projet.
`.github/workflows/ci.yml` est la copie du gabarit de CI du pipeline : il change
avec lui, jamais seul.

## En local

```bash
npm ci
npm run dev
```

Puis ouvrir http://localhost:3000. Les tests :

```bash
npm test
npx playwright install chromium   # une fois
npm run build && npm run test:e2e
```
