# Site MODULIS

Site vitrine de MODULIS, agence de transformation digitale. *Construisons ensemble vos solutions.*
HTML, CSS et JavaScript sans étape de compilation : le dossier se met en ligne tel quel.

## Structure

```
index.html                  la page (contenu et structure)
assets/css/style.css        le design (couleurs, typographie, mise en page, responsive)
assets/js/main.js           les interactions (animations, laboratoire, formulaire)
assets/brand/logo-mark.svg  le logo M redessiné en vectoriel
assets/brand/favicon.svg    l'icône de l'onglet
assets/brand/*.png          vos fichiers de logo d'origine
```

## Bibliothèques utilisées (chargées depuis un CDN)

- **GSAP 3.12.5 + ScrollTrigger** : animations, défilement horizontal des expertises.
- **Lenis 1.1.13** : défilement fluide.
- **Archivo** (Google Fonts) : police variable dont la largeur est animée.

Si un CDN ne répond pas, le site reste entièrement lisible.

## Interactions incluses

- Écran d'ouverture : le logo se dessine (une seule fois par visite).
- Accueil : grille de modules réactive à la souris, logo animé dont les points suivent le curseur.
- Les cinq expertises défilent à l'horizontale sur **tous les écrans** (téléphone, tablette, ordinateur),
  avec parallaxe des visuels, titres qui s'élargissent et légère inclinaison selon la vitesse.
- Bandeau défilant dont la vitesse et le sens suivent le défilement.
- Curseur personnalisé (ordinateur), barre de progression de lecture, bouton retour en haut avec anneau.
- Laboratoire : carte NFC en 3D personnalisable, calculateur d'heures gagnées, halo qui suit la souris.

Si le visiteur a demandé à réduire les animations, tout devient statique et lisible.
Testé de 320 × 568 (petit téléphone) à 1920 × 1080, sans débordement.

## Tester en local

Ouvrez `index.html` dans un navigateur, ou lancez `npx serve .`

## Mettre en ligne

- **Netlify** ou **Vercel** : glissez le dossier dans l'interface.
- **cPanel / hébergement classique** : envoyez le contenu du dossier dans `public_html`.

## À compléter avant la mise en ligne

1. **Formulaire** : dans `assets/js/main.js`, renseignez `FORM_ENDPOINT`
   (par exemple `https://formspree.io/f/xxxxxxx`). Tant qu'il est vide, le formulaire invite à écrire ou appeler.
2. **Réseaux sociaux** : dans `index.html`, section contact, remplacez `<span>LinkedIn</span>` etc. par des liens `<a href="https://...">`.
3. **Politique de confidentialité** : créez la page et liez-la.
4. **Engagements et FAQ** : relisez-les, ce sont des promesses faites aux clients.
5. **Image de partage** : ajoutez une image 1200 × 630 px et la balise `og:image`.
6. **Logo** : si vous avez le fichier vectoriel officiel (SVG ou AI) du logo, remplacez le symbole `#mk`
   et le logo animé de l'accueil (`#heroMark`) dans `index.html`.

## Couleurs

Tout est dans le bloc `:root` en haut de `style.css`. Les couleurs du logo :
sarcelle `#0A7F7D`, turquoise `#17BDBB`, sarcelle profond `#075E5E`, corail `#FD6552`.
