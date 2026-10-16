/* =====================================================================
   CONFIGURATION DU PROCESS — modifiable sans toucher à app.js
   Accompagnement à la rédaction du projet de santé · FEMAS HDF · Tremplin
   ===================================================================== */

const PROFILS = {
  A: {
    nom: "Équipe dynamique et autonome",
    court: "Autonome",
    format: "Format allégé",
    resume: "L'équipe avance seule entre les séances. La FEMAS cadre, relit et sécurise la conformité.",
    principes: [
      "Séances recentrées sur les arbitrages : la rédaction se fait en inter-séance par l'équipe.",
      "Gabarits transmis vierges : l'équipe rédige, la FEMAS relit (Claude en appui).",
      "Possibilité de fusionner S4 et S5 si les volets organisation sont déjà en place.",
      "Relances légères : un point mail entre chaque séance suffit."
    ]
  },
  B: {
    nom: "Équipe dynamique, besoin d'orientation et de guidance",
    court: "Guidance",
    format: "Format standard",
    resume: "L'équipe est motivée mais a besoin d'un cadre, de gabarits pré-remplis et de relances.",
    principes: [
      "Parcours complet en 5 séances de 1h30.",
      "Gabarits pré-remplis par la FEMAS (à partir de la captation Upmeet + Claude) avant chaque séance.",
      "Note d'inter-séance systématique sous 48 h avec priorités 1-2-3.",
      "Point téléphonique à mi-parcours avec le coordinateur."
    ]
  },
  C: {
    nom: "Équipe plus complexe (peu d'implication médicale, multisite…)",
    court: "Complexe",
    format: "Format renforcé",
    resume: "Mobilisation fragile ou dispersée : on sécurise l'adhésion avant d'écrire.",
    principes: [
      "Entretien préalable avec les médecins (individuel ou en petit groupe) avant la séance 1.",
      "Co-animateur médecin privilégié pour la légitimité de pair.",
      "Séances alternées entre sites ou en hybride ; captation Upmeet systématique.",
      "Viser 2 axes (pas 3) et des actions « existantes à valoriser » d'abord.",
      "Séance intermédiaire possible (S2 bis / S4 bis) ; mobiliser le groupe ressources tôt."
    ]
  }
};

/* Questionnaire d'orientation : score 0-2 par question, plus la réponse est élevée plus l'équipe est « complexe » */
const QUESTIONS = [
  { id: "q1", label: "Implication des médecins dans la démarche", opts: ["Forte, ils portent le projet", "Partielle", "Faible ou absente"], force: 2 },
  { id: "q2", label: "Configuration des sites", opts: ["Un seul site", "2 sites proches", "Multisite éclaté"], force: 2 },
  { id: "q3", label: "Un pilote identifié et reconnu par l'équipe ?", opts: ["Oui", "En cours", "Non"] },
  { id: "q4", label: "Habitude du travail coordonné (réunions, protocoles, CPTS…)", opts: ["Déjà en place", "Quelques pratiques", "Peu ou pas"] },
  { id: "q5", label: "Temps de coordination disponible", opts: ["Coordinateur en place", "Temps partiel / en recrutement", "Aucun pour l'instant"] }
];

/* Boîte à outils d'animation : les outils ne sont pas figés, on en choisit 2-4 par séance.
   reco = profils pour lesquels l'outil est recommandé */
const OUTILS = {
  // S1
  motTable: { s: "s1", nom: "Tour de table « un mot »", duree: "10 min", reco: "ABC", desc: "Chacun dit en un mot ce qu'il attend de la démarche. Noté au paperboard, relu en séance 5." },
  postitPourquoi: { s: "s1", nom: "Post-its du « pourquoi »", duree: "12 min", reco: "ABC", desc: "« Ce qui me motive à créer cette MSP / ce que j'attends du collectif » : 2 couleurs, regroupement par thème." },
  cercleSens: { s: "s1", nom: "Cercle du sens", duree: "15 min", reco: "BC", desc: "Pourquoi ? Pour qui ? Comment ? Trois cercles concentriques complétés ensemble pour faire émerger la raison d'être." },
  frise: { s: "s1", nom: "Frise de l'histoire d'équipe", duree: "15 min", reco: "C", desc: "Chacun place sur une ligne du temps son arrivée et les moments forts : crée l'interconnaissance, utile en multisite." },
  quizMSP: { s: "s1", nom: "Quiz vrai / faux MSP-ACI", duree: "12 min", reco: "BC", desc: "8 affirmations sur le modèle MSP, l'ACI et les attendus du projet de santé, débriefées en mini-apport." },
  organigramme: { s: "s1", nom: "Organigramme projet au paperboard", duree: "20 min", reco: "ABC", desc: "Pilote, coordinateur, référents par futur axe : on acte noir sur blanc qui fait quoi." },
  meteo: { s: "s1", nom: "Météo d'équipe", duree: "5 min", reco: "C", desc: "Soleil / nuage / orage : prendre la température de l'adhésion sans débat." },
  // S2
  chiffreSurprise: { s: "s2", nom: "« Le chiffre qui m'a surpris »", duree: "10 min", reco: "ABC", desc: "Chacun partage un chiffre du diagnostic lu en inter-séance. Point de départ, sans re-présenter le diagnostic." },
  colleDetonne: { s: "s2", nom: "Ce qui colle / ce qui détonne", duree: "20 min", reco: "ABC", desc: "Sous-groupes : confrontation des données FEMAS au vécu de terrain, mise en commun." },
  verbatims: { s: "s2", nom: "Nuage de verbatims usagers", duree: "15 min", reco: "BC", desc: "Lecture à voix haute des verbatims recueillis, regroupement en besoins exprimés." },
  persona: { s: "s2", nom: "Persona patient", duree: "20 min", reco: "B", desc: "Construire 2-3 patients types du territoire (âge, pathologies, freins) pour incarner les besoins." },
  arbreProblemes: { s: "s2", nom: "Arbre à problèmes", duree: "20 min", reco: "A", desc: "Racines (causes) / tronc (problème) / branches (conséquences) pour un besoin majeur." },
  matrice: { s: "s2", nom: "Matrice impact / faisabilité", duree: "20 min", reco: "ABC", desc: "Les thématiques candidates placées sur 2 axes ; on retient le quadrant « fort impact / faisable »." },
  gommettes: { s: "s2", nom: "Vote pondéré aux gommettes", duree: "10 min", reco: "BC", desc: "3 gommettes par personne sur les thématiques ; resserrer sur 2-3 axes." },
  // S3
  worldCafe: { s: "s3", nom: "World café", duree: "45 min", reco: "AB", desc: "Un groupe par axe démarre la fiche, rotation toutes les 15 min pour enrichir les autres fiches." },
  gabaritA3: { s: "s3", nom: "Gabarit fiche-action A3", duree: "—", reco: "ABC", desc: "Le gabarit imprimé en grand, une feuille par axe, rempli au feutre puis capté par Upmeet." },
  qqoqccp: { s: "s3", nom: "QQOQCCP", duree: "20 min", reco: "BC", desc: "Qui ? Quoi ? Où ? Quand ? Comment ? Combien ? Pourquoi ? pour dérouler une action sans oubli." },
  smart: { s: "s3", nom: "Atelier « rendre SMART »", duree: "15 min", reco: "B", desc: "Reformuler les objectifs en Spécifique, Mesurable, Atteignable, Réaliste, Temporel." },
  cartoPart: { s: "s3", nom: "Cartographie des partenaires", duree: "15 min", reco: "ABC", desc: "Cercles concentriques : MSP / proximité / territoire (CPTS, hôpital, social, autres MSP)." },
  parcoursPatient: { s: "s3", nom: "Parcours patient en frise", duree: "20 min", reco: "C", desc: "Dérouler le parcours d'un patient type et repérer où chaque professionnel intervient : rend concret l'intérêt du collectif." },
  existantNouveau: { s: "s3", nom: "Existant / nouveau", duree: "10 min", reco: "C", desc: "Deux colonnes : ce qu'on fait déjà (à valoriser) et ce qu'on lance. Rassure les équipes peu mobilisées." },
  // S4
  moteur: { s: "s4", nom: "Moteur à 4 rouages", duree: "5 min", reco: "ABC", desc: "Visuel : Système d'information · Coordination-RCP · SISA & ACI · Démarche qualité." },
  ateliersTournants: { s: "s4", nom: "Ateliers tournants par rouage", duree: "40 min", reco: "AB", desc: "4 tables thématiques, chacun choisit sa table selon son expertise ; restitution flash." },
  raci: { s: "s4", nom: "Tableau « qui fait quoi » (RACI)", duree: "20 min", reco: "BC", desc: "Missions de coordination × personnes : réalise / décide / est consulté / est informé." },
  inventaireSI: { s: "s4", nom: "Inventaire SI", duree: "15 min", reco: "ABC", desc: "Tour des logiciels utilisés, labellisation Ségur/ANS, messageries sécurisées, DMP." },
  semaineType: { s: "s4", nom: "Semaine type", duree: "15 min", reco: "BC", desc: "Grille horaires × professionnels pour visualiser amplitude, soins non programmés et continuité." },
  logigramme: { s: "s4", nom: "Logigramme de protocole", duree: "20 min", reco: "B", desc: "Formaliser un premier protocole pluripro (fiche d'identité + logigramme + qui/quoi/quand)." },
  // S5
  relectureCroisee: { s: "s5", nom: "Relecture en binômes croisés", duree: "15 min", reco: "ABC", desc: "Chaque binôme relit une partie qu'il n'a pas rédigée et note les manques." },
  pouce: { s: "s5", nom: "Tour de validation « pouce »", duree: "15 min", reco: "BC", desc: "Pouce levé / à l'horizontale / baissé par axe : on traite les réserves avant signature." },
  pitch: { s: "s5", nom: "Pitch 3 minutes", duree: "20 min", reco: "AB", desc: "Construire le fil de la présentation : le sens, les axes, l'organisation, le calendrier." },
  jeuRoleARS: { s: "s5", nom: "Jeu de rôle « l'ARS vous interroge »", duree: "20 min", reco: "ABC", desc: "L'animateur joue l'ARS : questions sur indicateurs, financement, calendrier, place des usagers." },
  retroplanning: { s: "s5", nom: "Rétroplanning de montée en charge", duree: "10 min", reco: "ABC", desc: "Frise : action / référent / échéance jusqu'au point d'étape à 12 mois." }
};

/* Séances : s0 = préparation FEMAS, s1-s5 = ateliers */
const SEANCES = [
  {
    id: "s0", num: "0", titre: "Préparation", long: "Préparation — diagnostic territorial FEMAS", couleur: "var(--c0)",
    objectif: "La FEMAS réalise le diagnostic territorial (INSEE, CartoSanté, Rezone CPTS) et prépare le lancement avec l'équipe.",
    livrable: "Diagnostic territorial mis en forme, charte signée, dates des 5 séances calées, profil d'équipe identifié.",
    trame: "2. Diagnostic (données de cadrage)",
    materiel: ["Charte d'accompagnement à faire signer", "Gabarit de diagnostic territorial", "Ligne de la MSP créée au tableau de bord multi-MSP", "Questionnaire d'orientation (profil d'équipe) rempli avec le porteur"],
    deroule: [],
    recup: ["Charte d'accompagnement signée", "Dates des 5 séances calées (onglet Dossier)", "Profil d'équipe identifié (onglet Dossier)", "Diagnostic territorial réalisé (INSEE, CartoSanté, Rezone CPTS)", "Support de recueil de la voix des usagers imprimé pour la séance 1", "Binôme d'animation constitué (salariée + professionnel co-animateur)"],
    fields: [
      { k: "s0_perimetre", label: "Territoire de rayonnement", sec: "2.1", help: "Communes couvertes, zonage (ZIP/ZAC), CPTS de rattachement." },
      { k: "s0_demo", label: "Chiffres clés démographie", sec: "2.1", help: "Population, évolution, structure d'âge, densité." },
      { k: "s0_sante", label: "Chiffres clés santé & socio-économie", sec: "2.2", help: "ALD, mortalité, dépistages, précarité, CSS…" },
      { k: "s0_offre", label: "Offre de soins (données)", sec: "2.4", help: "Densités par profession, âge des médecins, APL, établissements." },
      { k: "s0_lien", label: "Lien vers le diagnostic complet", type: "text", help: "URL du PDF partagé avec l'équipe." }
    ],
    vigilance: ["Facteur limitant principal de la capacité multi-MSP : standardiser le diagnostic (gabarit, requêtes types).", "Le diagnostic est une matière à s'approprier, pas une vérité figée."],
    interseance: [],
    profilTips: {
      A: "Envoyer le diagnostic dès qu'il est prêt : l'équipe peut l'annoter avant la séance 1.",
      B: "Préparer une synthèse visuelle d'une page (5 chiffres clés) pour la séance 1.",
      C: "Planifier l'entretien préalable avec les médecins avant de fixer la séance 1 ; vérifier la disponibilité de chaque site."
    }
  },
  {
    id: "s1", num: "1", titre: "Cadrage", long: "Séance 1 — Cadrage, sens & planification", couleur: "var(--c1)",
    objectif: "Faire connaissance et créer la cohésion, faire émerger le « pourquoi », partager le cadre MSP / ACI, présenter le diagnostic FEMAS et fixer la feuille de route.",
    livrable: "Note de cadrage, référents désignés, calendrier validé, diagnostic remis et recueil de la voix des usagers lancé.",
    trame: "1. Préambule · 1.2 Gouvernance",
    materiel: ["Diagnostic FEMAS mis en forme (présentation + remise)", "Salle en îlots ou en U, paperboard, post-its 2 couleurs, gommettes", "Vidéoprojecteur + support d'animation séance 1", "Upmeet ouvert (captation)", "Imprimés : trombinoscope, calendrier, questionnaire voix des usagers", "Accueil café : la 1ʳᵉ séance crée le lien"],
    deroule: [[0, 10, "Accueil & tour de table", "Chacun dit en un mot ce qu'il attend de la démarche."], [10, 22, "Le « pourquoi »", "Post-its motivations / attentes, regroupement par thème."], [22, 38, "Le cadre MSP / ACI", "Rappel du modèle, de l'ACI et des attendus du projet de santé. Quiz vrai/faux."], [38, 58, "Gouvernance", "Qui pilote, qui coordonne, référents par futur axe. Organigramme."], [58, 76, "Diagnostic territorial FEMAS", "Présentation-synthèse, premières réactions à chaud."], [76, 88, "Feuille de route & usagers", "Validation du calendrier, remise du diagnostic, lancement du recueil usagers."], [88, 90, "Engagements & clôture", "Chacun nomme une action d'ici la prochaine séance."]],
    recup: ["L'histoire et la dynamique de l'équipe (le « pourquoi »)", "2 à 3 objectifs de la création du projet de santé et de la MSP", "Le nom du pilote, du coordinateur et la répartition des rôles", "Les ambitions d'évolution (locaux, nouveaux professionnels, projets)", "Le calendrier validé des 4 séances suivantes", "Le diagnostic FEMAS remis et le mode de recueil de la voix des usagers choisi"],
    fields: [
      { k: "s1_histoire", label: "Histoire et genèse du regroupement", sec: "1.1", help: "Le « pourquoi » de créer la MSP ensemble, en quelques phrases." },
      { k: "s1_motivations", label: "Attentes et motivations de chacun", sec: "1.1", help: "Synthèse des post-its, regroupés par thème." },
      { k: "s1_objectifs", label: "Objectifs du projet de santé et de la MSP (2-3)", sec: "1.1" },
      { k: "s1_ambitions", label: "Ambitions et projets", sec: "1.1", help: "Locaux, nouveaux professionnels, périmètre de la MSP…" },
      { k: "s1_pilote", label: "Pilote du projet", sec: "1.2", type: "text" },
      { k: "s1_coordinateur", label: "Coordinateur / coordinatrice", sec: "1.2", type: "text" },
      { k: "s1_roles", label: "Organigramme projet et répartition des rôles", sec: "1.2", help: "Facilitateur, référents par futur axe, missions de coordination." },
      { k: "s1_usagers_mode", label: "Mode de recueil de la voix des usagers retenu", sec: "2.3", help: "Questionnaire papier / QR, boîte à idées, verbatims, durée du recueil." }
    ],
    vigilance: ["Équipe qui se constitue : soigner l'interconnaissance.", "Tenir le minutage : le diagnostic est présenté, pas co-produit.", "Annoncer que le diagnostic sera confronté au terrain en séance 2.", "Acter noir sur blanc pilote et coordinateur ; verrouiller les dates.", "Lancer concrètement le recueil usagers : sans support distribué ce soir-là, il ne démarrera pas."],
    interseance: ["Chaque professionnel s'approprie le diagnostic : noter « le chiffre qui me surprend » et ce qui colle / détonne avec le terrain.", "Déployer le recueil de la voix des usagers (questionnaire, boîte à idées, verbatims) pendant 2-3 semaines.", "Garder un canal d'échange ouvert (messagerie d'équipe)."],
    pj: ["Diagnostic territorial FEMAS", "Questionnaire « voix de l'usager » + affiche + bulletins boîte à idées", "Calendrier des séances"],
    profilTips: {
      A: "Raccourcir l'apport sur le cadre (l'équipe le connaît) et consacrer le temps gagné à la gouvernance.",
      B: "Prendre le temps du quiz vrai/faux : il lève les idées reçues sur l'ACI et rassure.",
      C: "Commencer par la météo d'équipe et la frise ; ne pas forcer les référents d'axe ce soir, se contenter d'un pilote et d'un coordinateur."
    }
  },
  {
    id: "s2", num: "2", titre: "Diagnostic", long: "Séance 2 — Diagnostic territorial & thématiques", couleur: "var(--c2)",
    objectif: "Confronter le diagnostic FEMAS au vécu de terrain, intégrer la voix des usagers et faire émerger 2 à 3 axes prioritaires.",
    livrable: "Diagnostic enrichi du vécu et des usagers, 2 à 3 axes prioritaires validés et justifiés.",
    trame: "2. Diagnostic · 3.1 Axes prioritaires",
    materiel: ["Retours du recueil usagers (questionnaires, verbatims) prêts à projeter", "Synthèse du diagnostic FEMAS réaffichée", "Post-its, gommettes, matrice impact/faisabilité au paperboard", "Upmeet ouvert"],
    deroule: [[0, 10, "Rappel & retours", "« Le chiffre qui m'a surpris »."], [10, 30, "Données vs terrain", "Sous-groupes : ce qui colle / ce qui détonne."], [30, 45, "La voix de l'usager", "Restitution du recueil, lecture des verbatims."], [45, 70, "Priorisation", "Thématiques candidates, matrice ou vote pondéré, resserrer sur 2-3 axes."], [70, 85, "Validation", "Accord explicite sur les axes et leur justification."], [85, 90, "Clôture", "Référents par axe pour préparer la séance 3."]],
    recup: ["3 à 5 constats du diagnostic validés par l'équipe", "Les besoins de santé prioritaires ressentis, au-delà des chiffres", "La voix des usagers : besoins et attentes exprimés", "Les forces et les manques de l'offre de soins locale", "Les 2 à 3 axes prioritaires retenus et la justification du choix", "Un référent désigné par axe"],
    fields: [
      { k: "s2_territoire", label: "Commentaires de l'équipe sur le territoire", sec: "2.1", help: "Réactions aux données démographiques, « le chiffre qui m'a surpris »." },
      { k: "s2_constats", label: "Constats validés (3 à 5)", sec: "2.2", help: "Ce qui colle au terrain / ce qui détonne." },
      { k: "s2_besoins", label: "Besoins de santé prioritaires identifiés", sec: "2.2" },
      { k: "s2_usagers", label: "Voix de l'usager : besoins et attentes exprimés", sec: "2.3", help: "Résultats du questionnaire, verbatims (anonymes)." },
      { k: "s2_usagers_pistes", label: "Pistes d'amélioration suggérées par les usagers", sec: "2.3" },
      { k: "s2_usagers_implication", label: "Modalités d'implication des usagers pour la suite", sec: "2.3" },
      { k: "s2_offre", label: "Offre de soins : forces et manques ressentis", sec: "2.4" },
      { k: "s2_partenaires", label: "Partenaires et ressources mobilisables", sec: "2.4" },
      { k: "s2_priorisation", label: "Méthode et résultat de la priorisation", sec: "3.1", help: "Matrice impact/faisabilité ou résultats du vote." },
      { k: "s2_axe1", label: "Axe prioritaire 1", sec: "3.1", type: "text" },
      { k: "s2_axe2", label: "Axe prioritaire 2", sec: "3.1", type: "text" },
      { k: "s2_axe3", label: "Axe prioritaire 3 (facultatif)", sec: "3.1", type: "text" },
      { k: "s2_justif", label: "Justification du choix des axes", sec: "3.1", help: "Vécu + données + usagers : l'ARS y est attentive." },
      { k: "s2_referents", label: "Référents désignés par axe", sec: "3.2", type: "text" }
    ],
    vigilance: ["L'équipe a lu le diagnostic : ne pas le re-présenter, partir de ses réactions.", "Donner un vrai poids à la voix de l'usager : attendu fort de l'ARS.", "L'enjeu est de choisir : tenir le cap des 2-3 axes et faire justifier.", "Éviter les axes « fourre-tout » : un axe = un objectif clair."],
    interseance: ["Chaque référent d'axe rassemble ce qui se fait déjà sur sa thématique (actions existantes, partenaires).", "Poursuivre le recueil de la voix des usagers, ciblé sur les axes retenus.", "Chiffrer la file active de chaque axe (requête logiciel métier).", "Le coordinateur reçoit un gabarit de fiche-action pré-rempli avec l'intitulé de chaque axe."],
    pj: ["Trame du projet de santé (version 2)", "Gabarit de fiche-action pré-rempli par axe"],
    profilTips: {
      A: "Aller vite sur les constats et donner du temps à la justification des axes : c'est ce que l'ARS lira.",
      B: "Utiliser la matrice impact/faisabilité : elle rend le choix visible et partagé.",
      C: "Limiter à 2 axes ; privilégier des thématiques où l'équipe agit déjà (valoriser l'existant)."
    }
  },
  {
    id: "s3", num: "3", titre: "Actions", long: "Séance 3 — Définition des actions", couleur: "var(--c3)",
    objectif: "Passer de l'idée à la planification opérationnelle : une fiche-action complète par axe (Pourquoi ? Pour qui ? Comment ?).",
    livrable: "Une fiche-action structurée par axe, avec indicateurs de suivi et référent désigné.",
    trame: "3.2 Fiches-actions par axe",
    materiel: ["Gabarit de fiche-action en A3, un par axe", "Stylos, post-its, feutres", "Groupes constitués (un par axe) pour le world café", "Upmeet ouvert"],
    deroule: [[0, 10, "Rappel des axes", "Affichage des axes retenus en séance 2."], [10, 25, "Présentation du gabarit", "Objectifs, public, implication usagers, partenaires, indicateurs."], [25, 70, "Construction des fiches", "World café : un groupe par axe, 3 rotations de 15 min."], [70, 85, "Restitution croisée", "Lecture de chaque fiche, partenaires manquants, cartographie."], [85, 90, "Porteurs", "Un référent par fiche et un premier jalon."]],
    recup: ["Objectif général et objectifs opérationnels (pour chaque axe)", "Public cible et modalités d'implication des usagers", "Professionnels de la MSP concernés et partenaires extérieurs", "Actions concrètes : existantes à poursuivre / nouvelles à lancer", "Au moins un indicateur de suivi par fiche", "Référent / porteur et calendrier prévisionnel"],
    fields: [
      { k: "s3_carto", label: "Cartographie des partenaires à mobiliser", sec: "3.2", help: "Secteur social, hôpital, CPTS, autres MSP, associations…" }
    ],
    fiches: true,
    vigilance: ["Garder des actions réalistes : distinguer « existant à poursuivre » et « nouveau à lancer ».", "Exiger au moins un indicateur par fiche, objectifs SMART.", "Faire apparaître la place de l'usager dans chaque action.", "Chaque action a un porteur nommé ; minuter strictement les rotations."],
    interseance: ["Les porteurs complètent leur fiche-action (indicateurs chiffrés, calendrier, premier jalon).", "Le coordinateur rassemble : liste des professionnels (RPPS / ADELI), statuts, outils du système d'information.", "Recenser les protocoles pluripro déjà formalisés et ceux à formaliser."],
    pj: ["Fiches-actions consolidées", "Guide de formalisation des protocoles pluripro"],
    profilTips: {
      A: "Laisser les groupes autonomes ; l'animateur passe de table en table pour challenger les indicateurs.",
      B: "Pré-remplir les fiches (intitulé, existant) avant la séance ; prévoir l'atelier « rendre SMART ».",
      C: "Remplacer le world café par un travail en plénière axe par axe ; commencer par la colonne « existant »."
    }
  },
  {
    id: "s4", num: "4", titre: "Organisation", long: "Séance 4 — Organisation opérationnelle & outils", couleur: "var(--c4)",
    objectif: "Construire le moteur interne de la MSP : système d'information, coordination, structure juridique (SISA), démarche qualité et accès aux soins.",
    livrable: "Volets « projet professionnel » et « organisation des soins » consolidés, rédactions attribuées.",
    trame: "4. Projet professionnel · 5. Organisation de la prise en charge",
    materiel: ["Liste des professionnels (RPPS / ADELI) récupérée en amont", "Statuts actuels, informations SI", "Schéma « moteur à 4 rouages »", "Modèles de tableaux : professionnels, horaires", "Check-list SISA à remettre", "Upmeet ouvert"],
    deroule: [[0, 10, "Rappel & météo", "Avancée des fiches-actions."], [10, 30, "Système d'information", "Outil labellisé ANS/Ségur, messageries sécurisées, DMP."], [30, 50, "Coordination", "RCP (rythme), protocoles, fonction de coordination, temps estimés."], [50, 68, "SISA — grandes lignes", "Associés fondateurs (min. 2 médecins + 1 auxiliaire), régime, ACI."], [68, 85, "Qualité & accès aux soins", "DPC, étudiants, qualité ; horaires, SNP, continuité."], [85, 90, "Attribution & chantiers", "Qui rédige quoi ; check-list SISA ; temps règlement intérieur."]],
    recup: ["Liste des professionnels (profession, RPPS / ADELI) et référents", "Rythme des RCP et protocoles à formaliser", "Outil SI partagé et outils de partage de données", "SISA : associés fondateurs, régime, financements ACI", "Horaires, RDV, visites à domicile, soins non programmés, continuité, accessibilité", "Santé publique, crises, accueil d'étudiants, démarche qualité"],
    pros: true,
    fields: [
      { k: "s4_adresses", label: "Adresse(s) de la MSP, référents, vacations", sec: "4.1" },
      { k: "s4_coordination", label: "Répartition des missions de coordination", sec: "4.2" },
      { k: "s4_temps_coord", label: "Temps de coordination estimés", sec: "4.2", type: "text" },
      { k: "s4_sisa", label: "SISA : associés fondateurs pressentis, régime, principes", sec: "4.3" },
      { k: "s4_aci", label: "Financements ACI visés", sec: "4.3" },
      { k: "s4_sisa_ec", label: "Points renvoyés à l'expert-comptable & calendrier de constitution", sec: "4.3" },
      { k: "s4_rcp", label: "Réunions de concertation pluriprofessionnelle", sec: "4.4", help: "Rythme, modalités, cas complexes / vie d'équipe." },
      { k: "s4_protocoles", label: "Protocoles pluripro existants / à formaliser", sec: "4.4" },
      { k: "s4_si", label: "Système d'information partagé (labellisé ANS / Ségur)", sec: "4.4" },
      { k: "s4_partage", label: "Partage des données et information du patient", sec: "4.4", help: "MSSanté, DMP, consentement, outils de messagerie." },
      { k: "s4_dpc", label: "Formations, DPC, accueil d'étudiants", sec: "4.5" },
      { k: "s4_qualite", label: "Démarche qualité et implication des usagers", sec: "4.5" },
      { k: "s4_horaires", label: "Horaires d'ouverture, prise de RDV, visites à domicile", sec: "5.1" },
      { k: "s4_snp", label: "Soins non programmés, continuité et permanence des soins", sec: "5.1" },
      { k: "s4_accessibilite", label: "Accessibilité physique et financière", sec: "5.1" },
      { k: "s4_santepub", label: "Actions de santé publique, activités innovantes", sec: "5.2" },
      { k: "s4_crises", label: "Réponse aux crises sanitaires graves", sec: "5.2" }
    ],
    vigilance: ["Séance dense et technique : répartir les sujets, ne pas tout traiter en plénière.", "SISA : trancher les grandes orientations seulement ; statuts en asynchrone avec l'expert-comptable.", "Le règlement intérieur n'est PAS traité ici (temps dédié, optionnel).", "Noter qui rédige quoi, s'appuyer sur l'existant."],
    interseance: ["Chantier SISA en asynchrone avec l'expert-comptable, guidé par la check-list (statuts, capital, répartition).", "Option : temps d'animation dédié au règlement intérieur.", "Rédaction des volets attribués ; le coordinateur consolide le projet complet pour la relecture."],
    pj: ["Check-list SISA", "Calculette d'estimation de l'enveloppe ACI", "Liste des logiciels labellisés Ségur"],
    profilTips: {
      A: "Ateliers tournants par rouage : chacun va là où il est expert, restitution flash.",
      B: "Pré-remplir les tableaux (professionnels, horaires) et se concentrer sur les décisions.",
      C: "Scinder en deux temps (S4 et S4 bis) ; traiter la SISA avec les médecins en petit comité si besoin."
    }
  },
  {
    id: "s5", num: "5", titre: "Restitution", long: "Séance 5 — Restitution & support de présentation", couleur: "var(--c5)",
    objectif: "Valider collectivement le projet finalisé, recueillir les signatures et préparer la présentation aux institutions (ARS, CPAM, CDSEC).",
    livrable: "Projet de santé finalisé et signé, support de présentation, plan de restitution.",
    trame: "6. Signatures · 7. Annexes",
    materiel: ["Projet consolidé imprimé ou projeté (onglet « Projet de santé »)", "Tableau des signatures", "Plan d'action consolidé", "Grille de conformité ARS vérifiée"],
    deroule: [[0, 15, "Relecture", "Lecture du projet partie par partie, derniers manques."], [15, 40, "Validation & signatures", "Tour de validation axe par axe, signatures."], [40, 65, "Préparation de la présentation", "Fil de la présentation, prises de parole."], [65, 85, "Répétition", "L'animateur joue l'ARS, l'équipe répond."], [85, 90, "Calendrier & clôture", "Date de transmission, suivi, célébration."]],
    recup: ["Validation finale de chaque partie et corrections de dernière minute", "Signatures de l'ensemble des professionnels engagés", "Plan d'action consolidé (action / référent / calendrier)", "Date de transmission à l'ARS et modalités de suivi", "Fil de la présentation institutionnelle et prises de parole"],
    signatures: true,
    fields: [
      { k: "s5_validation", label: "Validations et corrections de dernière minute", sec: "6" },
      { k: "s5_date_ars", label: "Date de transmission à l'ARS visée", sec: "7.1", type: "date" },
      { k: "s5_suivi", label: "Modalités de suivi de la mise en œuvre", sec: "7.1", help: "Suivi des indicateurs, point d'étape à 6-12 mois." },
      { k: "s5_fil", label: "Fil de la présentation ARS / CPAM / CDSEC", sec: "7.2" },
      { k: "s5_paroles", label: "Répartition des prises de parole", sec: "7.2" },
      { k: "s5_questions", label: "Questions anticipées et réponses", sec: "7.2" }
    ],
    vigilance: ["Vérifier que toutes les zones sont remplies avant de faire signer (onglet Conformité ARS).", "Les signatures engagent : s'assurer de l'adhésion de chacun.", "Anticiper les questions sur indicateurs, financement et calendrier.", "Célébrer l'aboutissement !"],
    interseance: ["Transmettre le projet de santé à l'ARS et, le cas échéant, le présenter en CDSEC.", "Mettre en place le suivi des indicateurs et le calendrier de montée en charge.", "Prévoir un point d'étape à 6-12 mois pour actualiser les actions et la voix des usagers."],
    pj: ["Projet de santé signé", "Support de présentation", "Grille de conformité ARS"],
    profilTips: {
      A: "Faire présenter par l'équipe elle-même ; l'animateur se limite au jeu de rôle ARS.",
      B: "Préparer le fil de présentation en amont et le faire répéter.",
      C: "S'assurer de la présence d'au moins deux médecins à la restitution institutionnelle."
    }
  }
];

/* Rubriques d'une fiche-action (trame 08) */
const FICHE_CHAMPS = [
  ["axe", "Intitulé de l'axe", "text"],
  ["intitule", "Intitulé de l'action", "text"],
  ["referents", "Référents de l'action", "text"],
  ["pros", "Professionnels de la MSP concernés", "area"],
  ["partenaires", "Acteurs hors MSP / partenaires", "area"],
  ["objGen", "Objectif général", "area"],
  ["objOp", "Objectifs opérationnels (SMART)", "area"],
  ["public", "Public cible (et file active estimée)", "area"],
  ["usagers", "Implication des usagers", "area"],
  ["outils", "Outils de coordination", "area"],
  ["existant", "Actions existantes à poursuivre", "area"],
  ["nouveau", "Actions nouvelles à lancer", "area"],
  ["indicateurs", "Indicateurs de suivi", "area"],
  ["calendrier", "Calendrier prévisionnel / premier jalon", "area"]
];

/* Kit FEMAS (documents du projet) */
const KIT = [
  ["Cadre & pilotage", ["Charte d'accompagnement", "Mode d'emploi du kit", "Tableau de bord multi-MSP", "Bilan de fin d'accompagnement"]],
  ["Animation", ["Présentation d'animation des 5 ateliers", "Synchronisation des 3 outils en séance", "Guide d'animation en binôme", "Fiches animateur"]],
  ["Livrable & recueil", ["Trame du projet de santé", "Recueil de la voix des usagers", "Relevé de décisions"]],
  ["Sécurisation & suite", ["Check-list SISA", "Grille de conformité ARS", "Faire vivre son projet de santé"]]
];

/* Réception des envois : formulaire Jotform (serveurs UE) → SharePoint */
const JOTFORM = { id: "262886164559372", submit: "https://eu-submit.jotform.com/submit/262886164559372/" };
