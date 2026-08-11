# MODULIS — Site Vitrine

Site web vitrine professionnel de l'agence digitale **MODULIS** : communication & marketing, branding, développement web & app, automatisation.

## Stack

- **Vite 6** — bundler de développement
- **SCSS** — design system maison (variables, mixins, layout responsive)
- **GSAP + ScrollTrigger** — animations premium (intro hero, reveals, compteurs, timeline, spotlight)
- **Lenis** — smooth scrolling
- 100% front-end : aucun backend, aucune base de données

## Démarrage

```bash
npm install
npm run dev        # serveur de développement (http://localhost:5173)
npm run build      # build de production dans /dist
npm run preview    # prévisualisation du build
```

## Structure

```
├── index.html              # Structure sémantique complète (single-page)
├── public/
│   └── favicon.svg         # Logo MODULIS
├── scripts/
│   ├── verify.mjs          # Suite de tests e2e (Playwright + Chrome local)
│   └── screenshot.mjs      # Captures des sections
└── src/
    ├── main.js             # Point d'entrée JS
    ├── js/
    │   ├── smooth.js       # Lenis + coordination GSAP ScrollTrigger
    │   ├── preloader.js    # Chargement d'entrée + compteur 0→100
    │   ├── cursor.js       # Curseur personnalisé (desktop uniquement)
    │   ├── nav.js          # Navigation + menu mobile + ancres smooth
    │   ├── animations.js   # Intro hero, reveals, compteurs, parallax, timeline, spotlight
    │   ├── modules.js      # Grille modulaire signature (le "M" de MODULIS)
    │   ├── work.js         # Filtres du portfolio
    │   └── contact.js      # Validation du formulaire
    └── styles/
        ├── main.scss       # Point d'entrée CSS
        └── _*.scss         # Design system + sections
```

## Sections

1. **Hero** — intro typographique animée, grille de fond, halos dégradés, spotlight interactif au curseur, badge rotatif, chips d'expertises flottants
2. **Marquee** — bandeau défilant des expertises
3. **Services** — 4 offres (Communication, Branding, Web/App, Automatisation) avec numéros filigrane au survol
4. **À propos** — grille modulaire signature : 36 cellules forment le "M" de MODULIS en cascade animée
5. **Méthode** — timeline verticale avec ligne dégradée dessinée au scroll
6. **Réalisations** — portfolio filtrable (Tous / Branding / Web / Marketing / Automatisation), hover cinématique
7. **Témoignages** — notes 5 étoiles, citations décoratives
8. **Contact** — formulaire validé côté client + coordonnées
9. **Footer** — marquee géant "MODULIS" en typographie XXL

## Design system

- Palette : noir profond `#06060B`, dégradé signature violet `#7C5CFF` → cyan `#22D3EE`
- Typographie : Space Grotesk (titres), Inter (texte), JetBrains Mono (labels)
- Texture grain cinématique globale, barre de progression du scroll
- Curseur personnalisé avec état "Voir" sur les projets (mix-blend difference)

## Accessibilité & performance

- Support `prefers-reduced-motion` (animations désactivées à la demande)
- Fallback `<noscript>` (contenu toujours visible sans JS)
- Navigation clavier + focus visibles
- Sémantique ARIA sur les composants interactifs
- Curseur personnalisé désactivé sur écrans tactiles
- Build minifié : ~54 kB JS gzippé, ~8 kB CSS gzippé
- Responsive validé sur 8 largeurs (375 → 1920px) + émulation tactile iPhone
