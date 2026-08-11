# MODULIS — Site Vitrine

Site web vitrine professionnel de l'agence digitale **MODULIS** : communication & marketing, branding, développement web & app, automatisation.

## Stack

- **Vite 6** — bundler de développement
- **SCSS** — design system maison (variables, mixins, layout responsive)
- **GSAP + ScrollTrigger** — animations premium (intro hero, reveals au scroll, compteurs)
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
└── src/
    ├── main.js             # Point d'entrée JS
    ├── js/
    │   ├── smooth.js       # Lenis + coordination GSAP ScrollTrigger
    │   ├── preloader.js    # Chargement d'entrée
    │   ├── cursor.js       # Curseur personnalisé (desktop)
    │   ├── nav.js          # Navigation + menu mobile
    │   ├── animations.js   # Intro hero, reveals, compteurs, parallax
    │   └── contact.js      # Validation du formulaire
    └── styles/
        ├── main.scss       # Point d'entrée CSS
        └── _*.scss         # Design system + sections
```

## Sections

1. **Hero** — intro typographique animée, grille de fond, halos dégradés
2. **Marquee** — bandeau défilant des expertises
3. **Services** — 4 offres (Communication, Branding, Web/App, Automatisation)
4. **À propos** — positionnement studio + valeurs + statistiques animées
5. **Méthode** — processus en 4 étapes
6. **Réalisations** — portfolio avec visuels abstraits générés en CSS
7. **Témoignages** — preuve sociale
8. **Contact** — formulaire validé côté client + coordonnées

## Accessibilité & performance

- Support `prefers-reduced-motion` (animations désactivées à la demande)
- Fallback `<noscript>` (contenu toujours visible sans JS)
- Navigation clavier + focus visibles
- Sémantique ARIA sur les composants interactifs
- Build minifié : ~53 kB JS gzippé, ~6 kB CSS gzippé
