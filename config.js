/* =====================================================================
   CONFIGURATION DU PROCESS — modifiable sans toucher à app.js
   Accompagnement à la rédaction du projet de santé · FEMAS HDF · Tremplin
   ===================================================================== */

/* Trois portes d'entrée, un même cap (process FEMAS, novembre 2026).
   Lettres conservées pour la compatibilité des dossiers : A = autonome, B = accéléré, C = standard.
   Mêmes outils, même exigence à l'arrivée : un projet conforme et fidèle à l'équipe. */
const PROFILS = {
  A: {
    nom: "Équipe autonome",
    court: "Autonome",
    format: "Trame à compléter, 1 ou 2 points d'étape, relecture FEMAS",
    resume: "L'équipe a déjà rédigé ses axes. On part de l'existant et on guide par questions.",
    principes: [
      "Envoyer la trame à compléter avec le diagnostic FEMAS intégré.",
      "1 ou 2 points d'étape, en présentiel ou en visio, au lieu des 5 ateliers.",
      "Valoriser d'abord : la FEMAS relit et met en forme, elle ne fait pas à la place de l'équipe.",
      "Vérifier les décisions socle (coordination, SI, périmètre, association loi 1901) dès le premier point."
    ]
  },
  B: {
    nom: "Parcours accéléré",
    court: "Accéléré",
    format: "Ateliers 1 et 2 fusionnés, 4 rencontres",
    resume: "Équipe soudée, avec une coordination déjà réelle : cadrage et diagnostic dans la même rencontre.",
    principes: [
      "Première rencontre : cadrage, diagnostic et voix de l'usager, axes à confirmer à la rencontre suivante.",
      "Garder les intersessions outillées : relevé sous 48 h à 1 semaine.",
      "Respecter quand même les 6 mois minimum exigés par l'ARS entre la première rencontre et le dépôt.",
      "Animation possible sans matériel, avec des votes à l'écran."
    ]
  },
  C: {
    nom: "Parcours standard",
    court: "Standard",
    format: "5 ateliers de 1 h 30 et des intersessions outillées",
    resume: "Équipe qui démarre, sans habitude de travail collectif : un atelier produit une partie écrite du projet.",
    principes: [
      "5 dates projetées et bloquées dès le départ, idéalement 1 mois entre chaque atelier.",
      "Relevé de décisions et trame à jour sous 48 h à 1 semaine après chaque atelier.",
      "Si mobilisation fragile (peu d'implication médicale, multisite) : entretien préalable avec les médecins, viser 2 axes et valoriser l'existant.",
      "Groupe ressources (CA et salariés) et doublon salarié pour la continuité."
    ]
  }
};

/* Questionnaire d'orientation : score 0-2 par question. Score bas = équipe autonome (A), moyen = accéléré (B), élevé = standard (C).
   force : une réponse à ce niveau oriente directement vers le parcours standard. */
const QUESTIONS = [
  { id: "q1", label: "Implication des médecins dans la démarche", opts: ["Forte, ils portent le projet", "Partielle", "Faible ou absente"], force: 2 },
  { id: "q2", label: "Configuration des sites", opts: ["Un seul site", "2 sites proches", "Multisite éclaté"], force: 2 },
  { id: "q3", label: "Le projet est-il déjà en partie rédigé (axes, fiches actions) ?", opts: ["Oui, les axes sont rédigés", "Quelques éléments", "Non, tout est à construire"] },
  { id: "q4", label: "Habitude du travail collectif (réunions, protocoles, CPTS…)", opts: ["Équipe soudée, déjà en place", "Quelques pratiques", "Peu ou pas"] },
  { id: "q5", label: "Temps de coordination disponible", opts: ["Coordination déjà réelle", "Temps partiel / en recrutement", "Aucune pour l'instant"] }
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
  voteEcran: { s: "s1", nom: "Votes à l'écran", duree: "5-10 min", reco: "ABC", desc: "Sans matériel : sondage projeté (Wooclap, Forms) pour recueillir attentes, priorités ou validations en direct." },
  meteo: { s: "s1", nom: "Météo d'équipe", duree: "5 min", reco: "C", desc: "Soleil / nuage / orage : prendre la température de l'adhésion sans débat." },
  // S2
  chiffreSurprise: { s: "s2", nom: "« Le chiffre qui m'a surpris »", duree: "10 min", reco: "ABC", desc: "Chacun partage un chiffre du diagnostic lu en inter-séance. Point de départ, sans re-présenter le diagnostic." },
  colleDetonne: { s: "s2", nom: "Ce qui colle / ce qui détonne", duree: "20 min", reco: "ABC", desc: "Sous-groupes : confrontation des données FEMAS au vécu de terrain, mise en commun." },
  verbatims: { s: "s2", nom: "Nuage de verbatims usagers", duree: "15 min", reco: "BC", desc: "Lecture à voix haute des verbatims recueillis, regroupement en besoins exprimés." },
  persona: { s: "s2", nom: "Persona patient", duree: "20 min", reco: "BC", desc: "Construire 2-3 patients types du territoire (âge, pathologies, freins) pour incarner les besoins." },
  arbreProblemes: { s: "s2", nom: "Arbre à problèmes", duree: "20 min", reco: "AB", desc: "Racines (causes) / tronc (problème) / branches (conséquences) pour un besoin majeur." },
  matrice: { s: "s2", nom: "Matrice impact / faisabilité", duree: "20 min", reco: "ABC", desc: "Les thématiques candidates placées sur 2 axes ; on retient le quadrant « fort impact / faisable »." },
  scoring: { s: "s2", nom: "Priorisation objectivée (scoring)", duree: "20 min", reco: "ABC", desc: "Chaque thématique notée de 1 à 3 sur impact, patientèle concernée, coût et faisabilité ; la faisabilité est notée par l'équipe pour une priorisation démocratique." },
  gommettes: { s: "s2", nom: "Vote pondéré aux gommettes", duree: "10 min", reco: "BC", desc: "3 gommettes par personne sur les thématiques ; resserrer sur 2-3 axes." },
  // S3
  worldCafe: { s: "s3", nom: "World café", duree: "45 min", reco: "ABC", desc: "Un groupe par axe démarre la fiche, rotation toutes les 15 min pour enrichir les autres fiches." },
  gabaritA3: { s: "s3", nom: "Gabarit fiche-action A3", duree: "—", reco: "ABC", desc: "Le gabarit imprimé en grand, une feuille par axe, rempli au feutre puis capté par Upmeet." },
  qqoqccp: { s: "s3", nom: "QQOQCCP", duree: "20 min", reco: "BC", desc: "Qui ? Quoi ? Où ? Quand ? Comment ? Combien ? Pourquoi ? pour dérouler une action sans oubli." },
  smart: { s: "s3", nom: "Atelier « rendre SMART »", duree: "15 min", reco: "BC", desc: "Reformuler les objectifs en Spécifique, Mesurable, Atteignable, Réaliste, Temporel." },
  cartoPart: { s: "s3", nom: "Cartographie des partenaires", duree: "15 min", reco: "ABC", desc: "Cercles concentriques : MSP / proximité / territoire (CPTS, hôpital, social, autres MSP)." },
  parcoursPatient: { s: "s3", nom: "Parcours patient en frise", duree: "20 min", reco: "C", desc: "Dérouler le parcours d'un patient type et repérer où chaque professionnel intervient : rend concret l'intérêt du collectif." },
  existantNouveau: { s: "s3", nom: "Existant / nouveau", duree: "10 min", reco: "C", desc: "Deux colonnes : ce qu'on fait déjà (à valoriser) et ce qu'on lance. Rassure les équipes peu mobilisées." },
  // S4
  moteur: { s: "s4", nom: "Moteur à 4 rouages", duree: "5 min", reco: "ABC", desc: "Visuel : Système d'information · Coordination-RCP · SISA & ACI · Démarche qualité." },
  ateliersTournants: { s: "s4", nom: "Ateliers tournants par rouage", duree: "40 min", reco: "ABC", desc: "4 tables thématiques, chacun choisit sa table selon son expertise ; restitution flash." },
  raci: { s: "s4", nom: "Tableau « qui fait quoi » (RACI)", duree: "20 min", reco: "BC", desc: "Missions de coordination × personnes : réalise / décide / est consulté / est informé." },
  inventaireSI: { s: "s4", nom: "Inventaire SI", duree: "15 min", reco: "ABC", desc: "Tour des logiciels utilisés, labellisation Ségur/ANS, messageries sécurisées, DMP." },
  semaineType: { s: "s4", nom: "Semaine type", duree: "15 min", reco: "BC", desc: "Grille horaires × professionnels pour visualiser amplitude, soins non programmés et continuité." },
  logigramme: { s: "s4", nom: "Logigramme de protocole", duree: "20 min", reco: "BC", desc: "Formaliser un premier protocole pluripro (fiche d'identité + logigramme + qui/quoi/quand)." },
  // S5
  relectureCroisee: { s: "s5", nom: "Relecture en binômes croisés", duree: "15 min", reco: "ABC", desc: "Chaque binôme relit une partie qu'il n'a pas rédigée et note les manques." },
  pouce: { s: "s5", nom: "Tour de validation « pouce »", duree: "15 min", reco: "BC", desc: "Pouce levé / à l'horizontale / baissé par axe : on traite les réserves avant signature." },
  pitch: { s: "s5", nom: "Pitch 3 minutes", duree: "20 min", reco: "ABC", desc: "Construire le fil de la présentation : le sens, les axes, l'organisation, le calendrier." },
  jeuRoleARS: { s: "s5", nom: "Jeu de rôle « l'ARS vous interroge »", duree: "20 min", reco: "ABC", desc: "L'animateur joue l'ARS : questions sur indicateurs, financement, calendrier, place des usagers." },
  trajectoire: { s: "s5", nom: "Frise de la trajectoire MSP", duree: "10 min", reco: "ABC", desc: "Les 5 étapes : mise en dynamique, projet de santé, label-SISA-ACI, 6 mois avec un coordinateur expert, vie d'équipe. Montrer ce qui vient après le dépôt." },
  retroplanning: { s: "s5", nom: "Rétroplanning de montée en charge", duree: "10 min", reco: "ABC", desc: "Frise : action / référent / échéance jusqu'au point d'étape à 12 mois." }
};

/* Séances : s0 = préparation FEMAS, s1-s5 = ateliers */
const SEANCES = [
  {
    id: "s0", num: "0", titre: "Préparation", long: "Préparation — diagnostic territorial FEMAS", couleur: "var(--c0)",
    objectif: "Choisir le parcours avec l'équipe, cadrer le périmètre territorial, bloquer les dates et réaliser le diagnostic territorial FEMAS (INSEE, CartoSanté, Rezone CPTS).",
    livrable: "Parcours choisi, périmètre territorial cadré, 5 dates bloquées, diagnostic territorial mis en forme, CPTS informée.",
    trame: "2. Diagnostic (données de cadrage)",
    materiel: ["Charte d'engagement (signée par chacun en atelier 1)", "Gabarit de diagnostic territorial", "Ligne de la MSP créée au tableau de bord multi-MSP et dossier SharePoint créé", "Questionnaire d'orientation (choix du parcours) rempli avec le porteur", "Fiche express de présentation de la démarche"],
    deroule: [],
    recup: ["Parcours choisi : standard, accéléré ou équipe autonome (onglet Dossier)", "Périmètre territorial cadré AVANT le diagnostic : communes couvertes et communes limitrophes", "Les 5 dates projetées et bloquées dès le départ, idéalement 1 mois d'écart (6 mois minimum exigés par l'ARS entre la 1ʳᵉ rencontre et le dépôt)", "Diagnostic territorial réalisé (INSEE, CartoSanté, Rezone CPTS)", "CPTS et ses responsables informés de l'accompagnement", "Binôme d'animation constitué (salariée porteuse + professionnel du territoire), doublon salarié et groupe ressources identifiés", "Support de recueil de la voix des usagers imprimé pour l'atelier 1"],
    fields: [
      { k: "s0_perimetre", label: "Territoire de rayonnement", sec: "2.1", help: "À cadrer avant le diagnostic : communes couvertes, communes limitrophes, zonage (ZIP/ZAC), CPTS de rattachement." },
      { k: "s0_demo", label: "Chiffres clés démographie", sec: "2.1", help: "Population, évolution, structure d'âge, densité." },
      { k: "s0_sante", label: "Chiffres clés santé & socio-économie", sec: "2.2", help: "ALD, mortalité, dépistages, précarité, CSS…" },
      { k: "s0_offre", label: "Offre de soins (données)", sec: "2.4", help: "Densités par profession, âge des médecins, APL, établissements." },
      { k: "s0_lien", label: "Lien vers le diagnostic complet", type: "text", help: "URL du PDF partagé avec l'équipe." }
    ],
    vigilance: ["Si une première réunion est organisée par la mairie ou un partenaire, elle compte comme atelier 1 (cadrage) : ne pas commencer par le diagnostic.", "Cadrer le périmètre territorial avant de lancer le diagnostic, pas après.", "Standardiser le diagnostic (gabarit, requêtes types) : c'est le facteur limitant de la capacité multi-MSP.", "Le diagnostic est une matière à s'approprier, pas une vérité figée.", "La même salariée suit tout l'accompagnement ; le pilotage FEMAS reste distinct de l'animation."],
    interseance: [],
    profilTips: {
      A: "Envoyer la trame à compléter avec le diagnostic FEMAS déjà intégré ; caler 1 ou 2 points d'étape.",
      B: "Préparer une synthèse visuelle d'une page (5 chiffres clés) : la première rencontre couvre cadrage ET diagnostic.",
      C: "Si mobilisation fragile, planifier un entretien préalable avec les médecins avant de fixer l'atelier 1 ; vérifier la disponibilité de chaque site."
    }
  },
  {
    id: "s1", num: "1", titre: "Cadrage", long: "Atelier 1 — Cadrage, sens & diagnostic partagé", couleur: "var(--c1)",
    objectif: "Créer la cohésion, faire émerger le « pourquoi » (pourquoi ensemble, pourquoi maintenant), partager le cadre MSP / ACI, présenter le diagnostic FEMAS et poser les décisions socle : système d'information, association loi 1901, trajectoire après le label.",
    livrable: "Note de cadrage avec code couleur (vert = validé, jaune = à compléter, rouge = absent), référents désignés, calendrier validé, diagnostic remis, recueil usagers lancé, charte d'engagement signée.",
    trame: "1. Préambule · 1.2 Gouvernance",
    materiel: ["Diagnostic FEMAS : KPI et chiffres forts présentés (document complet remis ensuite)", "Charte d'engagement à signer par chacun + tableau nom, prénom, profession, adresse mail", "Check-list association loi 1901 (pièces à fournir, modalités de dépôt)", "Glossaire des acronymes (MSP, CPTS, ACI, SISA, FIR…)", "Recueil usagers : questionnaire, boîte à idées, affiche", "Vidéoprojecteur ou votes à l'écran, paperboard, post-its 2 couleurs", "Upmeet ouvert (équipe informée de l'enregistrement)", "Autorisation de communication (presse possible)"],
    deroule: [[0, 10, "Accueil & tour de table", "Les attentes en un mot."], [10, 22, "Le « pourquoi »", "Post-its regroupés par thème : pourquoi ensemble, pourquoi maintenant, élément déclencheur."], [22, 38, "Le cadre MSP / ACI", "Quiz vrai/faux, glossaire, trajectoire après le label. Annonce de l'association loi 1901 avec la check-list. Question socle : quel système d'information aujourd'hui ?"], [38, 58, "Gouvernance", "Pilote, coordination, référents de thématiques. Vocabulaire aligné avec PACTE (porteur de projet)."], [58, 76, "Diagnostic FEMAS", "KPI et chiffres forts, réactions à chaud."], [76, 88, "Feuille de route & usagers", "Calendrier validé, lancement du recueil usagers, charte d'engagement signée."], [88, 90, "Engagements & clôture", "Chacun nomme une action d'ici l'atelier 2."]],
    recup: ["L'histoire et la dynamique de l'équipe (le « pourquoi »)", "2 à 3 objectifs de la création du projet de santé et de la MSP", "Le nom du pilote, du coordinateur et la répartition des rôles", "Les ambitions d'évolution (locaux, nouveaux professionnels, projets)", "La composition complète de l'équipe (dont tous les infirmiers avec qui les médecins travaillent) : nom, prénom, profession, adresse mail pour créer le projet Plexus", "Association loi 1901 : check-list remise, porteur de la démarche identifié", "Système d'information : logiciels utilisés aujourd'hui (question socle)", "Le calendrier validé des 4 ateliers suivants (délai ARS : 6 mois minimum entre la 1ʳᵉ rencontre et le dépôt)", "Le diagnostic FEMAS remis et le mode de recueil de la voix des usagers choisi", "Charte d'engagement signée par chacun et autorisation de communication"],
    fields: [
      { k: "s1_histoire", label: "Histoire et genèse du regroupement", sec: "1.1", help: "Le « pourquoi » de créer la MSP ensemble, en quelques phrases." },
      { k: "s1_motivations", label: "Attentes et motivations de chacun", sec: "1.1", help: "Synthèse des post-its, regroupés par thème." },
      { k: "s1_objectifs", label: "Objectifs du projet de santé et de la MSP (2-3)", sec: "1.1" },
      { k: "s1_ambitions", label: "Ambitions et projets", sec: "1.1", help: "Locaux, nouveaux professionnels, périmètre de la MSP…" },
      { k: "s1_pilote", label: "Pilote du projet", sec: "1.2", type: "text" },
      { k: "s1_coordinateur", label: "Coordinateur / coordinatrice", sec: "1.2", type: "text" },
      { k: "s1_roles", label: "Organigramme projet et répartition des rôles", sec: "1.2", help: "Facilitateur, référents par futur axe, missions de coordination." },
      { k: "s1_juridique", label: "Structure juridique : association loi 1901 et perspective SISA", sec: "4.3", help: "L'ARS exige une association loi 1901 préalable (c'est elle qui obtient le n° FINESS). Membres de l'association, futurs associés SISA, calendrier." },
      { k: "s1_usagers_mode", label: "Mode de recueil de la voix des usagers retenu", sec: "2.3", help: "Questionnaire papier / QR, boîte à idées, verbatims, durée du recueil." },
      { k: "s1_si", label: "Système d'information : logiciels utilisés aujourd'hui", sec: "4.4", help: "Question socle posée dès l'atelier 1, vérifiée aux ateliers suivants et validée à l'atelier 4 (éditeur, Ségur 2)." }
    ],
    vigilance: ["Équipe qui se constitue : soigner l'interconnaissance.", "Présenter les KPI du diagnostic, sans remettre tout le document en séance.", "Poser dès maintenant les sujets socle : système d'information, association loi 1901, trajectoire après le label.", "Acter noir sur blanc pilote et coordination ; verrouiller les dates.", "Lancer concrètement le recueil usagers : sans support distribué ce soir-là, il ne démarrera pas.", "Ne pas lancer la CPTS avant la labellisation : les documents peuvent être préparés, le démarrage attend (bénéfice du FIR)."],
    interseance: ["Chaque professionnel lit le diagnostic : noter « le chiffre qui me surprend » et ce qui colle / détonne avec le terrain.", "Déployer le recueil de la voix des usagers (questionnaire, boîte à idées, affiche) pendant 2-3 semaines.", "Lancer la création de l'association loi 1901 avec la check-list.", "FEMAS : créer le projet Plexus de l'équipe et y déposer les outils (profil Pro de santé temporaire)."],
    pros: true,
    pj: ["Diagnostic territorial FEMAS", "Charte d'accompagnement et calendrier", "Recueil usagers : questionnaire, boîte à idées, affiche", "Check-list association loi 1901", "Glossaire des acronymes", "Relevé de décisions de l'atelier 1"],
    profilTips: {
      A: "Point d'étape 1 : partir de ce que l'équipe a rédigé, guider par questions et vérifier les décisions socle.",
      B: "Rencontre fusionnée ateliers 1 et 2 : raccourcir le cadre, enchaîner sur le diagnostic et la voix de l'usager ; axes à confirmer à la rencontre suivante.",
      C: "Prendre le temps du quiz vrai/faux. Si mobilisation fragile : météo d'équipe et frise, se contenter d'un pilote et d'une coordination."
    }
  },
  {
    id: "s2", num: "2", titre: "Axes", long: "Atelier 2 — Diagnostic, voix de l'usager & axes", couleur: "var(--c2)",
    objectif: "Confronter le diagnostic au terrain, vérifier le périmètre réel, intégrer la voix des usagers, choisir 2 à 3 axes prioritaires et identifier la coordination (décision socle).",
    livrable: "Diagnostic enrichi du vécu et des usagers, périmètre territorial vérifié, 2 à 3 axes validés collectivement, un référent par axe, coordination identifiée.",
    trame: "2. Diagnostic · 3.1 Axes prioritaires",
    materiel: ["Retours du recueil usagers (questionnaires, verbatims) prêts à projeter", "Synthèse du diagnostic FEMAS réaffichée", "Matrice impact / faisabilité ou grille de scoring (impact, patientèle, coût, faisabilité), ou votes à l'écran", "Carte du périmètre et des communes limitrophes", "Upmeet ouvert"],
    deroule: [[0, 10, "Rappel & retours", "« Le chiffre qui m'a surpris »."], [10, 30, "Données vs terrain", "Sous-groupes : ce qui colle / ce qui détonne."], [30, 45, "La voix de l'usager", "Restitution du recueil, lecture des verbatims."], [45, 70, "Priorisation", "Matrice impact / faisabilité ou scoring ; la faisabilité est notée par l'équipe. Resserrer sur 2-3 axes."], [70, 85, "Validation & coordination", "Accord explicite sur les axes et leur justification. Qui prend la coordination ? Formation PACTE."], [85, 90, "Clôture", "Un référent par axe pour préparer l'atelier 3."]],
    recup: ["3 à 5 constats du diagnostic validés par l'équipe", "Les besoins de santé prioritaires ressentis, au-delà des chiffres", "La voix des usagers : besoins et attentes exprimés", "Les forces et les manques de l'offre de soins locale", "Les 2 à 3 axes prioritaires retenus et la justification du choix", "Un référent désigné par axe", "Le périmètre territorial réel d'intervention (communes limitrophes vérifiées)", "La personne qui prendra la coordination et son inscription à la formation PACTE"],
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
      { k: "s2_referents", label: "Référents désignés par axe", sec: "3.2", type: "text" },
      { k: "s2_perimetre", label: "Périmètre territorial réel (communes limitrophes vérifiées)", sec: "2.1" },
      { k: "s2_coordination", label: "Coordination : personne identifiée, formation PACTE", sec: "4.2", help: "Décision socle visée dès l'atelier 2 : elle conditionne le dépôt et l'ACI." }
    ],
    vigilance: ["L'équipe a lu le diagnostic : ne pas le re-présenter, partir de ses réactions.", "Donner un vrai poids à la voix de l'usager : attendu fort de l'ARS.", "L'enjeu est de choisir : tenir le cap des 2-3 axes et faire justifier.", "Priorisation démocratique : faire noter la faisabilité par l'équipe pour qu'aucun participant n'impose ses priorités.", "Éviter les axes « fourre-tout » : un axe = un objectif clair.", "Ne pas repartir sans la coordination identifiée."],
    interseance: ["Chaque référent d'axe rassemble ce qui se fait déjà sur sa thématique (actions existantes, partenaires).", "Poursuivre le recueil de la voix des usagers, ciblé sur les axes retenus.", "Chiffrer la file active de chaque axe (requête logiciel métier).", "Le coordinateur reçoit un gabarit de fiche-action pré-rempli avec l'intitulé de chaque axe."],
    pj: ["Synthèse du diagnostic : cartes et chiffres clés", "Retours du recueil usagers", "Matrice impact / faisabilité", "Trame : diagnostic, voix de l'usager, axes", "Gabarit de fiche action pré-rempli par axe", "Relevé de décisions de l'atelier 2"],
    profilTips: {
      A: "Relire les axes déjà rédigés au regard du diagnostic et de la voix des usagers ; faire préciser la justification.",
      B: "Fusionné avec l'atelier 1 : confirmer les axes et la coordination à la rencontre suivante.",
      C: "Utiliser la matrice ou le scoring ; si mobilisation fragile, limiter à 2 axes où l'équipe agit déjà."
    }
  },
  {
    id: "s3", num: "3", titre: "Actions", long: "Atelier 3 — Définition des actions", couleur: "var(--c3)",
    objectif: "Transformer les axes en actions (protocoles pluriprofessionnels, santé publique, partenariats territoriaux, ouverture vers l'extérieur) : une fiche action complète par axe, avec objectifs et indicateurs SMART.",
    livrable: "Une fiche-action structurée par axe, avec indicateurs de suivi et référent désigné.",
    trame: "3.2 Fiches-actions par axe",
    materiel: ["Gabarit de fiche action en A3, un par axe", "Guide de formalisation des protocoles et exemple prérempli", "Cartographie des partenaires", "Groupes constitués (un par axe) pour le world café", "Upmeet ouvert"],
    deroule: [[0, 10, "Rappel des axes", "Affichage des axes retenus en séance 2."], [10, 25, "Présentation du gabarit", "Objectifs, public, implication usagers, partenaires, indicateurs."], [25, 70, "Construction des fiches", "World café : un groupe par axe, 3 rotations de 15 min."], [70, 85, "Restitution croisée", "Lecture de chaque fiche, partenaires manquants, cartographie."], [85, 90, "Porteurs", "Un référent par fiche et un premier jalon."]],
    recup: ["Objectif général et objectifs opérationnels (pour chaque axe)", "Public cible et modalités d'implication des usagers", "Professionnels de la MSP concernés et partenaires extérieurs", "Actions concrètes : existantes à poursuivre / nouvelles à lancer", "Au moins un indicateur de suivi par fiche, objectifs SMART, effets de seuil", "Modalités d'évaluation et d'amélioration annuelle (démarche qualité)", "Référent / porteur et calendrier prévisionnel"],
    fields: [
      { k: "s3_carto", label: "Cartographie des partenaires à mobiliser", sec: "3.2", help: "Secteur social, hôpital, CPTS, autres MSP, associations…" }
    ],
    fiches: true,
    vigilance: ["Garder des actions réalistes : distinguer « existant à poursuivre » et « nouveau à lancer ».", "Exiger au moins un indicateur par fiche, objectifs SMART.", "Faire apparaître la place de l'usager dans chaque action.", "Chaque action a un porteur nommé ; minuter strictement les rotations.", "Couvrir les 4 types d'actions : protocoles, santé publique, partenariats, ouverture vers l'extérieur."],
    interseance: ["Les porteurs complètent leur fiche-action (indicateurs chiffrés, calendrier, premier jalon).", "Le coordinateur rassemble : liste des professionnels (RPPS / ADELI), statuts, outils du système d'information.", "Recenser les protocoles pluripro déjà formalisés et ceux à formaliser."],
    pj: ["Gabarit de fiche action, un par axe", "Cartographie des partenaires", "Guide de formalisation des protocoles et exemple prérempli", "Trame : fiches actions", "Relevé de décisions de l'atelier 3"],
    profilTips: {
      A: "Relire les fiches rédigées par l'équipe : challenger indicateurs, calendrier et place des usagers.",
      B: "Laisser les groupes autonomes ; l'animateur passe de table en table pour challenger les indicateurs.",
      C: "Pré-remplir les fiches (intitulé, existant) ; si mobilisation fragile, travail en plénière axe par axe."
    }
  },
  {
    id: "s4", num: "4", titre: "Organisation", long: "Atelier 4 — Organisation : juridique, coordination, SI & protocoles", couleur: "var(--c4)",
    objectif: "Construire le moteur interne : structuration juridique et volet financier, coordination, système d'information (validation), relecture des protocoles, qualité et accès aux soins.",
    livrable: "Volets « projet professionnel » et « organisation des soins » consolidés, rédactions attribuées.",
    trame: "4. Projet professionnel · 5. Organisation de la prise en charge",
    materiel: ["Liste des professionnels (RPPS / ADELI) récupérée en amont", "Statuts actuels, informations SI", "Schéma « moteur à 4 rouages »", "Modèles de tableaux : professionnels, horaires", "Check-list SISA pour l'expert-comptable", "Check-list de structuration : associés, RPPS, RCP, horaires, fonctionnement", "Upmeet ouvert"],
    deroule: [[0, 10, "Rappel & météo", "Avancée des fiches-actions."], [10, 30, "Système d'information", "Validation : éditeur, engagement, conformité Ségur 2, déclenchement à la labellisation. Licences payées par la SISA, pas par le FIR."], [30, 50, "Coordination & protocoles", "Coordinateur et formation PACTE, RCP (rythme, trace écrite), relecture des protocoles produits."], [50, 68, "Juridique & financier", "SISA : associés, régime, clé de répartition, fonds publics (FIR). Statuts ≠ règlement intérieur."], [68, 85, "Qualité & accès aux soins", "DPC, étudiants, qualité ; horaires, SNP, continuité."], [85, 90, "Attribution & chantiers", "Qui rédige quoi ; check-list SISA ; temps règlement intérieur."]],
    recup: ["Liste des professionnels (profession, RPPS / ADELI) et référents", "Rythme des RCP et protocoles à formaliser", "Outil SI partagé et outils de partage de données", "SISA : associés fondateurs, régime, financements ACI", "Horaires, RDV, visites à domicile, soins non programmés, continuité, accessibilité", "Santé publique, crises, accueil d'étudiants, démarche qualité"],
    pros: true,
    fields: [
      { k: "s4_adresses", label: "Adresse(s) de la MSP, référents, vacations", sec: "4.1" },
      { k: "s4_coordination", label: "Répartition des missions de coordination", sec: "4.2" },
      { k: "s4_temps_coord", label: "Temps de coordination estimés", sec: "4.2", type: "text" },
      { k: "s4_sisa", label: "SISA : associés fondateurs pressentis, régime, principes", sec: "4.3" },
      { k: "s4_aci", label: "Financements ACI visés", sec: "4.3" },
      { k: "s4_sisa_ec", label: "Points renvoyés à l'expert-comptable & calendrier de constitution", sec: "4.3" },
      { k: "s4_financier", label: "Volet financier : FIR, budget, clé de répartition", sec: "4.3", help: "Le FIR finance les éléments fléchés et justifiés (expert-comptable, statuts…), pas les licences du SI." },
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
    vigilance: ["Séance dense et technique : répartir les sujets, ne pas tout traiter en plénière.", "SISA : trancher les grandes orientations seulement ; statuts en asynchrone avec l'expert-comptable.", "Distinguer statuts SISA (juridique) et règlement intérieur (fonctionnement, décisions, gouvernance, révisable en AG) ; le RI n'est pas traité ici.", "Modèles de décision différents entre SISA, SCM et parts : attention aux conseils d'expert-comptable raisonnant comme pour une SCI.", "Les licences du SI relèvent de la SISA, pas du FIR.", "Noter qui rédige quoi, s'appuyer sur l'existant."],
    interseance: ["Chantier SISA en asynchrone avec l'expert-comptable, guidé par la check-list (statuts, capital, répartition).", "Option : temps d'animation dédié au règlement intérieur.", "Rédaction des volets attribués ; le coordinateur consolide le projet complet.", "Envoyer le projet de santé (sans le règlement intérieur) au chargé de territoire ARS pour une première lecture et l'identification des points de blocage."],
    pj: ["Check-list SISA", "Calculette d'estimation de l'enveloppe ACI", "Liste des logiciels labellisés Ségur"],
    profilTips: {
      A: "Point d'étape 2 : vérifier le socle (SI, coordination, juridique) et attribuer les dernières rédactions.",
      B: "Ateliers tournants par rouage : chacun va là où il est expert, restitution flash.",
      C: "Pré-remplir les tableaux (professionnels, horaires) ; si besoin, scinder en deux temps et traiter la SISA avec les médecins en petit comité."
    }
  },
  {
    id: "s5", num: "5", titre: "Restitution", long: "Atelier 5 — Finalisation & préparation de la commission", couleur: "var(--c5)",
    objectif: "Le projet est finalisé à 95 % : intégrer les retours du chargé de territoire ARS, valider, recueillir les signatures et préparer la présentation aux institutions.",
    livrable: "Projet de santé signé, support de présentation approprié par l'équipe, plan de restitution, bilan de fin d'accompagnement.",
    trame: "6. Signatures · 7. Annexes",
    materiel: ["Projet consolidé (onglet « Projet de santé »)", "Retours du chargé de territoire ARS", "Grille de conformité ARS vérifiée", "Tableau des signatures", "Support de présentation transmis à l'équipe en amont", "Calendrier de montée en charge", "Bilan de fin d'accompagnement"],
    deroule: [[0, 15, "Relecture & retours ARS", "Lecture partie par partie, points remontés par le chargé de territoire."], [15, 40, "Validation & signatures", "Tour de validation axe par axe, signatures."], [40, 65, "Préparation de la présentation", "Fil de la présentation, prises de parole."], [65, 85, "Répétition", "L'animateur joue l'ARS, l'équipe répond."], [85, 90, "Calendrier & clôture", "Dépôt, présentation en visio avant commission, bilan, célébration."]],
    recup: ["Validation finale de chaque partie et corrections de dernière minute", "Signatures de l'ensemble des professionnels engagés", "Plan d'action consolidé (action / référent / calendrier)", "Date de transmission à l'ARS et modalités de suivi", "Fil de la présentation institutionnelle et prises de parole"],
    signatures: true,
    fields: [
      { k: "s5_retours_ars", label: "Retours du chargé de territoire ARS et corrections apportées", sec: "6" },
      { k: "s5_validation", label: "Validations et corrections de dernière minute", sec: "6" },
      { k: "s5_date_ars", label: "Date de transmission à l'ARS visée", sec: "7.1", type: "date" },
      { k: "s5_suivi", label: "Modalités de suivi de la mise en œuvre", sec: "7.1", help: "Suivi des indicateurs, point d'étape à 6-12 mois." },
      { k: "s5_fil", label: "Fil de la présentation ARS / CPAM / CDSEC", sec: "7.2" },
      { k: "s5_paroles", label: "Répartition des prises de parole", sec: "7.2" },
      { k: "s5_questions", label: "Questions anticipées et réponses", sec: "7.2" }
    ],
    vigilance: ["Vérifier que toutes les zones sont remplies avant de faire signer (onglet Conformité ARS).", "Les signatures engagent : s'assurer de l'adhésion de chacun.", "Anticiper les questions sur indicateurs, financement et calendrier.", "Célébrer l'aboutissement !"],
    interseance: ["Dépôt du projet à l'ARS ; proposer une présentation officielle en visio avant la commission pour mettre l'équipe en confiance.", "Envoyer le bilan de fin d'accompagnement : il sert de passage de relais vers l'étape suivante.", "Étape suivante : label, SISA et ACI, puis 6 mois de coordination accompagnée (formation PACTE).", "Suivi des indicateurs avec « Faire vivre son projet de santé », point d'étape à 6 ou 12 mois."],
    pj: ["Projet de santé consolidé", "Grille de conformité ARS", "Tableau des signatures", "Calendrier de montée en charge", "Bilan de fin d'accompagnement"],
    profilTips: {
      A: "Relecture finale FEMAS et conformité ; l'équipe présente elle-même, l'animateur joue l'ARS.",
      B: "Faire présenter par l'équipe ; l'animateur se limite au jeu de rôle ARS.",
      C: "Préparer le fil de présentation en amont, le faire répéter ; au moins deux médecins à la commission."
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

/* Composition de l'équipe : une fiche par professionnel (outil FEMAS, préparation équipe, export Word) */
const PRO_CHAMPS = [
  ["nom", "Nom", "text"],
  ["prenom", "Prénom", "text"],
  ["profession", "Fonction / profession", "text"],
  ["rpps", "N° RPPS / ADELI", "text"],
  ["adresse", "Adresse d'exercice", "text"],
  ["horaires", "Jours et horaires de travail", "text"],
  ["specialites", "Spécialités / maître de stage (MSU)", "text"],
  ["secteur", "Secteur conventionnel", "select", ["", "Secteur 1", "Secteur 2 OPTAM", "Secteur 2 hors OPTAM", "Non concerné"]],
  ["tarif", "Tarif de la consultation (€)", "text"],
  ["role", "Rôle dans le projet", "text"]
];
const proNom = (p) => [p.prenom, p.nom].filter((x) => x && String(x).trim()).join(" ");
const proFormHTML = (p, i, escf, delAttr) => `<div class="pro-card" style="border:1px solid #dde1ea;border-radius:10px;padding:10px 12px;margin-bottom:10px">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b>${escf(proNom(p) || "Professionnel " + (i + 1))}</b><button class="btn sm ghost noprint" ${delAttr}="${i}">✕ Retirer</button></div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px">${PRO_CHAMPS.map(([k, l, ty, opts]) => `<label style="display:flex;flex-direction:column;font-size:12.5px;gap:3px">${escf(l)}${ty === "select" ? `<select data-pro="${i}.${k}" style="padding:8px;border:1px solid #d6dae3;border-radius:8px;font:inherit;background:#fff">${opts.map((o) => `<option value="${escf(o)}" ${String(p[k] || "") === o ? "selected" : ""}>${escf(o || "—")}</option>`).join("")}</select>` : `<input type="text" data-pro="${i}.${k}" value="${escf(p[k] || "")}">`}</label>`).join("")}</div></div>`;

/* Kit FEMAS (documents du projet) */
const KIT = [
  ["Cadre & pilotage", ["Charte d'accompagnement", "Mode d'emploi du kit", "Fiche express", "Tableau de bord multi-MSP", "Bilan de fin d'accompagnement"]],
  ["Animation", ["Présentation des 5 ateliers", "Synchronisation des 3 outils", "Guide du binôme", "Fiches animateur"]],
  ["Livrable & recueil", ["Trame du projet de santé", "Recueil de la voix des usagers", "Relevé de décisions", "Gabarit de diagnostic"]],
  ["Sécurisation & suite", ["Check-list SISA", "Grille de conformité ARS", "Faire vivre son projet de santé"]],
  ["Nés du terrain", ["Check-list association loi 1901", "Guide de formalisation des protocoles", "Trame à compléter pour équipe autonome"]]
];

/* Réception des envois : formulaires Jotform (serveurs UE), notification e-mail aux référentes FEMAS */
const JOTFORM = { id: "262886164559372", submit: "https://eu-submit.jotform.com/submit/262886164559372/" };
const JOTFORM_EMARG = { id: "263013829432353", submit: "https://eu-submit.jotform.com/submit/263013829432353/" };
/* Captation des séances : espace Upmeet de la FEMAS (enregistrement lancé depuis Upmeet, pas depuis l'outil) */
const UPMEET_URL = "https://app.upmeet.ai/meetings";
/* Émargement individuel par QR code : chaque professionnel saisit nom, prénom, profession et signe sur son téléphone */
const JOTFORM_PRESENCE = { id: "263154049776364", url: "https://eu.jotform.com/263154049776364" };
const JOTFORM_EQUIPE = { id: "263096396809371", submit: "https://eu-submit.jotform.com/submit/263096396809371/" };

/* =====================================================================
   PRÉPARATION PAR L'ÉQUIPE (page equipe.html, à remplir avant chaque séance)
   k = rubrique de la trame alimentée · q = question posée à l'équipe
   ===================================================================== */
const EQUIPE = {
  s1: {
    intro: "Avant notre première rencontre, prenez quelques minutes en équipe pour répondre à ces questions. Quelques phrases suffisent : nous les retravaillerons ensemble en séance.",
    questions: [
      { k: "s1_histoire", q: "Comment est né votre projet de regroupement ?", help: "Racontez en quelques phrases l'histoire de votre équipe et ce qui vous a donné envie de travailler ensemble." },
      { k: "s1_motivations", q: "Qu'est-ce qui motive chacun d'entre vous ? Qu'attendez-vous du collectif ?", help: "Vous pouvez faire un rapide tour de table et noter les idées de chacun." },
      { k: "s1_objectifs", q: "Quels sont, selon vous, les 2 ou 3 objectifs principaux de votre maison de santé ?" },
      { k: "s1_ambitions", q: "Avez-vous des projets d'évolution ?", help: "Locaux, arrivée de nouveaux professionnels, nouveaux services…" },
      { k: "s1_pilote", q: "Qui pilote le projet ?", type: "text" },
      { k: "s1_coordinateur", q: "Qui assure (ou assurera) la coordination ?", type: "text" },
      { k: "s1_si", q: "Quels logiciels utilisez-vous aujourd'hui ? Sont-ils partagés entre les professionnels ?", help: "Le système d'information partagé est un des socles de la maison de santé : nous le vérifierons au fil des ateliers." },
      { k: "s1_roles", q: "Comment envisagez-vous la répartition des rôles dans le projet ?", help: "Qui s'occupe de quoi : organisation, lien avec les partenaires, suivi des thématiques…" },
      { k: "s1_juridique", q: "Où en êtes-vous de la création de l'association loi 1901 ?", help: "L'ARS demande de créer d'abord une association loi 1901 : c'est elle qui obtient le numéro FINESS indispensable à la reconnaissance de la maison de santé. La SISA viendra ensuite. Indiquez si l'association est créée ou en projet, qui en fera partie, et qui envisage d'entrer dans la future SISA. La FEMAS vous transmet un modèle de statuts." }
    ],
    pros: true,
    prosHelp: "Une fiche par professionnel qui participe au projet, y compris les infirmiers et les autres professionnels avec qui vous travaillez habituellement. Indiquez le numéro RPPS / ADELI, l'adresse d'exercice, les jours et horaires, les spécialités ou l'agrément de maître de stage (MSU), le secteur et le tarif de consultation. Dans « Rôle dans le projet », précisez par exemple : membre de l'association, futur associé SISA, signataire.",
    apporter: ["Vos agendas, pour bloquer les dates des 5 rencontres, idéalement à un mois d'écart. L'ARS impose au moins 6 mois entre la première rencontre et le dépôt du projet.", "Le modèle de statuts d'association transmis par la FEMAS, si vous l'avez déjà parcouru"]
  },
  s2: {
    intro: "Vous avez reçu le diagnostic de votre territoire. Lisez-le, échangez entre vous et notez vos réactions : elles serviront de point de départ à la séance.",
    questions: [
      { k: "s2_territoire", q: "Quel chiffre du diagnostic vous a le plus surpris ? Pourquoi ?" },
      { k: "s2_constats", q: "Qu'est-ce qui correspond à ce que vous vivez au quotidien ? Qu'est-ce qui vous semble décalé ?", help: "Regardez en particulier les 5 premières pathologies (ALD) du diagnostic : les retrouvez-vous dans votre patientèle ? Manque-t-il un problème de santé que vous rencontrez souvent ?" },
      { k: "s2_besoins", q: "Quels sont, selon vous, les besoins de santé prioritaires de vos patients ?" },
      { k: "s2_usagers", q: "Que disent vos patients ?", help: "Résultats du questionnaire, idées de la boîte à idées, remarques entendues au cabinet (sans nom ni information permettant d'identifier un patient)." },
      { k: "s2_offre", q: "Quelles sont les forces et les manques de l'offre de soins autour de vous ?" },
      { k: "s2_partenaires", q: "Avec quels partenaires travaillez-vous déjà ou aimeriez-vous travailler ?", help: "Hôpital, CPTS, services sociaux, associations, autres MSP…" },
      { k: "s2_axe1", q: "Première thématique que vous aimeriez retenir", type: "text" },
      { k: "s2_axe2", q: "Deuxième thématique", type: "text" },
      { k: "s2_axe3", q: "Troisième thématique (facultatif)", type: "text" },
      { k: "s2_perimetre", q: "Quelles communes votre maison de santé couvre-t-elle réellement, y compris les communes limitrophes ?" },
      { k: "s2_coordination", q: "Qui pourrait prendre la coordination de la maison de santé ?", help: "Nous en déciderons ensemble à cette séance. Une formation (PACTE) est prévue pour la personne qui coordonnera." }
    ],
    apporter: ["Le diagnostic territorial annoté", "Les questionnaires patients et les idées de la boîte à idées"]
  },
  s3: {
    intro: "Pour chacune de vos thématiques prioritaires, notez ce qui se fait déjà et vos premières idées d'actions. Même incomplet, ce travail nous fera gagner beaucoup de temps en séance.",
    fiches: [
      ["axe", "Thématique", "text"],
      ["existant", "Ce que vous faites déjà sur ce sujet", "area"],
      ["nouveau", "Vos idées d'actions nouvelles", "area"],
      ["public", "Quels patients sont concernés ? Combien, à peu près ?", "area"],
      ["pros", "Quels professionnels de la MSP seraient impliqués ?", "area"],
      ["partenaires", "Quels partenaires extérieurs ?", "area"],
      ["usagers", "Comment associer les patients ?", "area"],
      ["referents", "Qui pourrait porter cette action ?", "text"]
    ],
    questions: [
      { k: "s3_carto", q: "Autres partenaires à mobiliser (toutes thématiques confondues)" }
    ],
    apporter: ["Les actions déjà menées sur vos thématiques (affiches, comptes rendus…)", "Une estimation du nombre de patients concernés par chaque thématique (requête dans votre logiciel)"]
  },
  s4: {
    intro: "Cette séance porte sur l'organisation de votre maison de santé. Rassemblez ces informations pratiques à l'avance : c'est la partie du projet la plus facile à préparer seul.",
    pros: true,
    questions: [
      { k: "s4_adresses", q: "Adresse(s) de la maison de santé et professionnels qui viennent en vacation" },
      { k: "s4_si", q: "Quel logiciel utilisez-vous ? Est-il partagé entre les professionnels ?" },
      { k: "s4_partage", q: "Comment échangez-vous les informations sur les patients ?", help: "Messagerie sécurisée, DMP, réunions, cahier de liaison…" },
      { k: "s4_rcp", q: "Vous réunissez-vous déjà pour parler de patients ? À quel rythme ?" },
      { k: "s4_protocoles", q: "Avez-vous des protocoles communs, écrits ou non ?", help: "Par exemple : suivi du diabète, plaies, chutes…" },
      { k: "s4_coordination", q: "Qui assure aujourd'hui les tâches de coordination ? Combien de temps cela représente-t-il ?" },
      { k: "s4_horaires", q: "Horaires d'ouverture, prise de rendez-vous, visites à domicile" },
      { k: "s4_snp", q: "Comment répondez-vous aux demandes de soins urgents (le jour même) ? Comment s'organise la continuité des soins (congés, gardes) ?" },
      { k: "s4_accessibilite", q: "Accessibilité de la MSP : accès handicapés, transports, dépassements d'honoraires…" },
      { k: "s4_dpc", q: "Accueillez-vous des étudiants ? Faites-vous des formations en commun ?" },
      { k: "s4_sisa", q: "Projet de SISA : qui seront les associés fondateurs ? Quels principes de fonctionnement envisagez-vous ?", help: "L'association loi 1901 doit être créée avant la SISA. Tous les membres de l'association ne sont pas obligés d'entrer dans la SISA." },
      { k: "s4_aci", q: "Connaissez-vous les financements ACI que vous visez ?", help: "Si vous ne savez pas, laissez vide : nous en parlerons en séance." },
      { k: "s4_financier", q: "Avez-vous déjà réfléchi au budget et à la répartition des financements entre associés ?", help: "Si vous avez un expert-comptable, notez ses premières recommandations." },
      { k: "s4_qualite", q: "Avez-vous une démarche qualité ou des actions pour associer les patients à la vie de la MSP ?" },
      { k: "s4_santepub", q: "Menez-vous des actions de prévention ou de santé publique (dépistages, ateliers, campagnes) ?" }
    ],
    apporter: ["Numéros RPPS / ADELI de chaque professionnel", "Statuts actuels de l'association ou de la SISA, s'ils existent", "Nom et version de votre logiciel", "Protocoles déjà écrits, même partiels"]
  },
  s5: {
    intro: "Le projet de santé est presque terminé et l'ARS en a fait une première lecture. Relisez-le en équipe avant la dernière séance et notez vos remarques : la séance servira à intégrer les retours de l'ARS, valider, signer et préparer la présentation.",
    questions: [
      { k: "s5_validation", q: "Après relecture, quelles corrections ou précisions souhaitez-vous apporter ?", help: "Indiquez la partie concernée (ex. : « Fiche-action 2 : ajouter la diététicienne »)." },
      { k: "s5_suivi", q: "Comment comptez-vous suivre la mise en œuvre du projet ?", help: "Qui suit les indicateurs ? Quand ferez-vous un premier point d'étape ?" },
      { k: "s5_date_ars", q: "Date souhaitée de transmission à l'ARS", type: "date" },
      { k: "s5_paroles", q: "Qui présentera le projet aux institutions (ARS, CPAM) ?", help: "Idéalement au moins deux médecins et un autre professionnel." },
      { k: "s5_questions", q: "Quelles questions l'ARS pourrait-elle vous poser ? Comment y répondriez-vous ?" }
    ],
    apporter: ["Le projet de santé relu et annoté", "La liste des professionnels qui signeront", "Les éventuels documents à joindre en annexe (protocoles, questionnaire usagers)"]
  }
};
