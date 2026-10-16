# Projet de santé — Accompagnement TREMPLIN

Outil en ligne d'accompagnement à la rédaction du projet de santé des MSP
(FEMAS Hauts-de-France · Territoire Tremplin).

## Le process
Préparation (diagnostic FEMAS) → 5 séances de 1h30 → dépôt ARS.
Pour chaque séance, 5 onglets :

1. **Préparer** : objectif, livrable, matériel, briefing du binôme, conseil selon le profil d'équipe, boîte à outils d'animation (★ = recommandé pour le profil).
2. **En séance** : chrono du déroulé minuté, check-list « À récupérer », saisie directe dans la trame (fiches-actions en S3, professionnels en S4, signatures en S5).
3. **Relevé de décisions** : décisions, actions priorisées (1-2-3), points en suspens, export Word.
4. **Avec Claude** : on colle la captation Upmeet, l'outil génère le prompt ; on colle la réponse JSON de Claude et la trame se remplit.
5. **Note d'inter-séance** : générée automatiquement (format de la note Pont-à-Vendin), export Word / copie pour e-mail.

Vues transverses : **Dossier MSP** (identité, binôme, calendrier, questionnaire de profil A/B/C, tableau de bord multi-MSP), **Projet** (projet de santé compilé, export Word / PDF), **ARS** (grille de conformité calculée automatiquement), **Outils** (export / import JSON, kit).

## Profils d'accompagnement
- **A** — Équipe dynamique et autonome (format allégé)
- **B** — Équipe dynamique, besoin d'orientation et de guidance (format standard)
- **C** — Équipe plus complexe : peu d'implication médicale, multisite… (format renforcé)

## Modifier le contenu
Tout le contenu métier (séances, déroulés, check-lists, rubriques, outils d'animation, profils) est dans `config.js`.
La logique est dans `app.js`. Aucun serveur, aucune dépendance.

## Données
Enregistrement automatique dans le navigateur (localStorage). Export/import JSON pour partager un dossier entre salariées.
Ne saisir aucune donnée identifiant un patient.

## Publication
GitHub Pages : Settings → Pages → Deploy from branch → `main` / root.
