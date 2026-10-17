/* =====================================================================
   Export du projet de santé en .docx (charte de la trame FEMAS HDF)
   Utilise la librairie docx (chargée depuis jsDelivr).
   ===================================================================== */
(function () {
  "use strict";
  const BLEU = "385AA1", ROSE = "E61D7B", VERT = "61BDA6", VIOLET = "524B99", JAUNE = "FBB718", CIEL = "1D9DDA";
  const GRIS = "595959", BLEUCL = "DCE3F1", ORANGE = "B45309", FONT = "Arial";
  const W = 9638; // largeur utile A4, marges 2 cm

  async function loadImage(urls, maxW, maxH) {
    for (const url of [].concat(urls)) {
      try {
        const r = await fetch(url, { cache: "no-cache" }); if (!r.ok) continue;
        const blob = await r.blob(); let w = maxW, h = maxH;
        try { const bm = await createImageBitmap(blob); const k = Math.min(maxW / bm.width, maxH / bm.height); w = Math.round(bm.width * k); h = Math.round(bm.height * k); } catch (e) {}
        return { data: new Uint8Array(await blob.arrayBuffer()), w, h };
      } catch (e) {}
    }
    return null;
  }

  window.buildProjetDocx = async function (ctx) {
    const D = window.docx;
    if (!D) throw new Error("Librairie docx non chargée");
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType,
      HeadingLevel, ImageRun, Header, Footer, PageNumber, BorderStyle, LevelFormat, PageBreak, TabStopType } = D;
    const { st, FICHE_CHAMPS, fmtDate } = ctx;
    const f = st.f || {}, m = st.m || {};
    const has = (v) => v != null && String(v).trim() !== "";

    const run = (text, o = {}) => new TextRun({ text: String(text), font: FONT, size: o.size || 21, bold: o.bold, italics: o.it, color: o.color });
    const para = (text, o = {}) => new Paragraph({ children: Array.isArray(text) ? text : [run(text, o)], spacing: { after: o.after ?? 120, before: o.before || 0 }, alignment: o.align, keepNext: o.keepNext });
    const lines = (v) => String(v).split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const todo = (label) => para("À compléter" + (label ? " : " + label : ""), { it: true, color: ORANGE });
    const text = (k, label) => has(f[k]) ? lines(f[k]).map((l) => /^[-•*]\s+/.test(l)
      ? new Paragraph({ numbering: { reference: "puces", level: 0 }, children: [run(l.replace(/^[-•*]\s+/, ""))], spacing: { after: 60 } })
      : para(l)) : [todo(label)];
    const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun({ text: t, font: FONT, size: 32, bold: true, color: BLEU })], spacing: { after: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: BLEU, space: 4 } } });
    const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t, font: FONT, size: 25, bold: true, color: ROSE })], spacing: { before: 240, after: 120 }, keepNext: true });
    const h3 = (t) => new Paragraph({ children: [run(t, { bold: true, color: BLEU, size: 21 })], spacing: { before: 160, after: 80 }, keepNext: true });
    const src = (t) => para(t, { it: true, color: GRIS, size: 18 });
    const bord = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
    const borders = { top: bord, bottom: bord, left: bord, right: bord };
    const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
    const cell = (content, w, o = {}) => new TableCell({
      width: { size: w, type: WidthType.DXA }, borders, columnSpan: o.span,
      shading: o.fill ? { type: ShadingType.CLEAR, color: "auto", fill: o.fill } : undefined,
      margins: { top: 70, bottom: 70, left: 110, right: 110 },
      children: (Array.isArray(content) ? content : [content]).map((c) => typeof c === "string"
        ? new Paragraph({ children: [run(c, { bold: o.bold, color: o.color, size: o.size || 19, it: o.it })] }) : c)
    });
    const multiline = (v, o = {}) => has(v) ? lines(v).map((l) => new Paragraph({ children: [run(l, { size: 19 })], spacing: { after: 40 } })) : [new Paragraph({ children: [run(o.empty || "", { size: 19, it: true, color: ORANGE })] })];
    const table = (widths, head, rows, hfill = BLEU) => new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: widths,
      rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, widths[i], { fill: hfill, bold: true, color: "FFFFFF" })) })]
        .concat(rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i])) })))
    });
    const colorBar = () => new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: Array(6).fill(Math.floor(W / 6)),
      rows: [new TableRow({ height: { value: 90, rule: "exact" }, children: [BLEU, CIEL, VERT, JAUNE, ROSE, VIOLET].map((c) => new TableCell({
        width: { size: Math.floor(W / 6), type: WidthType.DXA }, borders: { top: none, bottom: none, left: none, right: none },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: c }, children: [new Paragraph({ children: [] })] })) })]
    });
    const spacer = () => new Paragraph({ children: [], spacing: { after: 120 } });

    const [femas, tremplin] = await Promise.all([loadImage(["femas-logo.jpg", "Logo FEMAS HDF.png"], 170, 170), loadImage("logo-tremplin.png", 130, 130)]);
    const logos = [];
    if (femas) logos.push(new ImageRun({ data: femas.data, transformation: { width: femas.w, height: femas.h } }));
    if (femas && tremplin) logos.push(run("      "));
    if (tremplin) logos.push(new ImageRun({ data: tremplin.data, transformation: { width: tremplin.w, height: tremplin.h } }));

    const C = [];
    /* ---- Couverture ---- */
    C.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 900, after: 300 }, children: logos.length ? logos : [run("FEMAS Hauts-de-France", { bold: true, color: BLEU, size: 36 })] }));
    C.push(colorBar());
    C.push(para("MAISON DE SANTÉ PLURIPROFESSIONNELLE", { align: AlignmentType.CENTER, bold: true, color: GRIS, size: 20, before: 600 }));
    C.push(para(m.msp || "[Nom de la MSP]", { align: AlignmentType.CENTER, bold: true, color: BLEU, size: 52 }));
    if (has(m.commune)) C.push(para(m.commune, { align: AlignmentType.CENTER, color: GRIS, size: 26 }));
    C.push(para("PROJET DE SANTÉ", { align: AlignmentType.CENTER, bold: true, color: ROSE, size: 40, before: 400 }));
    C.push(para(new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }), { align: AlignmentType.CENTER, color: GRIS, size: 24 }));
    C.push(para("Démarche accompagnée par la FEMAS Hauts-de-France — Territoire Tremplin", { align: AlignmentType.CENTER, it: true, color: BLEU, size: 19, before: 1200 }));

    /* ---- Sommaire ---- */
    C.push(new Paragraph({ pageBreakBefore: true, children: [run("Sommaire", { bold: true, color: BLEU, size: 32 })], spacing: { after: 240 } }));
    ["Préambule", "Diagnostic du territoire et besoins de santé", "Objectifs et axes prioritaires", "Projet professionnel", "Projet d'organisation de la prise en charge", "Signature des professionnels de santé", "Annexes"]
      .forEach((t, i) => C.push(new Paragraph({ spacing: { after: 140 }, children: [run((i + 1) + ".  ", { bold: true, color: ROSE, size: 24 }), run(t, { size: 24 })] })));

    /* ---- 1. Préambule ---- */
    C.push(h1("1. Préambule"));
    C.push(h2("1.1 Contexte, émergence et objectifs du projet"));
    C.push(h3("Histoire et genèse du regroupement"), ...text("s1_histoire"));
    C.push(h3("Attentes et motivations de l'équipe"), ...text("s1_motivations"));
    C.push(h3("Objectifs du projet de santé"), ...text("s1_objectifs"));
    C.push(h3("Ambitions et projets"), ...text("s1_ambitions"));
    C.push(h2("1.2 Gouvernance et pilotage du projet"));
    C.push(table([3000, 6638], ["Fonction", "Personne(s)"], [
      ["Pilote du projet", multiline(f.s1_pilote, { empty: "À compléter" })],
      ["Coordination", multiline(f.s1_coordinateur || m.coord, { empty: "À compléter" })],
      ["Accompagnement FEMAS", multiline([m.porteuse, m.coanim].filter(Boolean).join(" et "), { empty: "—" })]]));
    C.push(spacer(), h3("Organisation et répartition des rôles"), ...text("s1_roles"));

    /* ---- 2. Diagnostic ---- */
    C.push(h1("2. Diagnostic du territoire et besoins de santé"));
    C.push(src("Le diagnostic territorial a été réalisé par la FEMAS Hauts-de-France (INSEE, CartoSanté, Rezone CPTS), puis confronté au vécu de l'équipe et à la voix des usagers."));
    C.push(h2("2.1 Territoire de rayonnement de la MSP"), ...text("s0_perimetre", "communes couvertes"), h3("Données démographiques"), ...text("s0_demo"), h3("Regard de l'équipe"), ...text("s2_territoire"));
    C.push(h2("2.2 Caractéristiques de la patientèle et besoins de santé"), h3("Données de santé et socio-économiques"), ...text("s0_sante"), h3("Constats partagés par l'équipe"), ...text("s2_constats"), h3("Besoins de santé prioritaires"), ...text("s2_besoins"));
    C.push(h2("2.3 La voix de l'usager"));
    if (has(f.s1_usagers_mode)) C.push(h3("Modalités du recueil"), ...text("s1_usagers_mode"));
    C.push(h3("Besoins et attentes exprimés"), ...text("s2_usagers"), h3("Pistes d'amélioration suggérées"), ...text("s2_usagers_pistes"), h3("Implication des usagers dans la suite"), ...text("s2_usagers_implication"));
    C.push(h2("2.4 Offre de soins du territoire"), ...text("s0_offre", "données d'offre de soins"), h3("Forces et manques ressentis"), ...text("s2_offre"), h3("Partenaires et ressources mobilisables"), ...text("s2_partenaires"));

    /* ---- 3. Axes et fiches-actions ---- */
    C.push(h1("3. Objectifs et axes prioritaires du projet de santé"));
    C.push(h2("3.1 Objectifs généraux et axes retenus"));
    const axes = ["s2_axe1", "s2_axe2", "s2_axe3"].filter((k) => has(f[k]));
    if (axes.length) axes.forEach((k, i) => C.push(new Paragraph({ spacing: { after: 80 }, children: [run("Axe " + (i + 1) + " — ", { bold: true, color: ROSE }), run(f[k], { bold: true })] })));
    else C.push(todo("axes prioritaires"));
    C.push(h3("Méthode de priorisation"), ...text("s2_priorisation"), h3("Justification du choix des axes"), ...text("s2_justif"));
    C.push(h2("3.2 Fiches-actions par axe"));
    if (!st.fiches || !st.fiches.length) C.push(todo("fiches-actions"));
    (st.fiches || []).forEach((fi, i) => {
      C.push(new Table({
        width: { size: W, type: WidthType.DXA }, columnWidths: [3100, 6538],
        rows: [new TableRow({ tableHeader: true, children: [cell("FICHE-ACTION N° " + (i + 1) + (fi.axe ? " — " + fi.axe : ""), W, { fill: ROSE, bold: true, color: "FFFFFF", size: 21, span: 2 })] })]
          .concat(FICHE_CHAMPS.map(([k, l]) => new TableRow({ cantSplit: true, children: [cell(l, 3100, { fill: BLEUCL, bold: true, color: BLEU }), cell(multiline(fi[k], { empty: "À compléter" }), 6538)] })))
      }));
      C.push(spacer());
    });
    C.push(h3("Cartographie des partenaires à mobiliser"), ...text("s3_carto"));

    /* ---- 4. Projet professionnel ---- */
    C.push(h1("4. Projet professionnel"));
    C.push(h2("4.1 Référents et offre de services"));
    const pros = (st.pros || []).filter((p) => has(p.nom));
    C.push(pros.length ? table([2900, 2300, 2000, 2438], ["Nom et prénom", "Profession", "RPPS / ADELI", "Rôle / référent"], pros.map((p) => [p.nom || "", p.profession || "", p.rpps || "", p.role || ""])) : todo("liste des professionnels"));
    C.push(spacer(), ...text("s4_adresses", "adresse(s), référents, vacations"));
    C.push(h2("4.2 Coordination et management de la structure"), ...text("s4_coordination"));
    if (has(f.s4_temps_coord)) C.push(para([run("Temps de coordination estimé : ", { bold: true }), run(f.s4_temps_coord)]));
    C.push(h2("4.3 Structure juridique (SISA) et financements ACI"), h3("SISA"), ...text("s4_sisa"), h3("Financements ACI"), ...text("s4_aci"), h3("Calendrier de constitution"), ...text("s4_sisa_ec"));
    C.push(h2("4.4 Organisation de la pluriprofessionnalité"), h3("Réunions de concertation pluriprofessionnelle"), ...text("s4_rcp"), h3("Protocoles pluriprofessionnels"), ...text("s4_protocoles"), h3("Système d'information partagé"), ...text("s4_si"), h3("Partage des données et information du patient"), ...text("s4_partage"));
    C.push(h2("4.5 Développement professionnel continu et démarche qualité"), h3("Formation et accueil d'étudiants"), ...text("s4_dpc"), h3("Démarche qualité et implication des usagers"), ...text("s4_qualite"));

    /* ---- 5. Organisation de la prise en charge ---- */
    C.push(h1("5. Projet d'organisation de la prise en charge"));
    C.push(h2("5.1 Accès aux soins"), h3("Horaires, prise de rendez-vous, visites à domicile"), ...text("s4_horaires"), h3("Soins non programmés, continuité et permanence des soins"), ...text("s4_snp"), h3("Accessibilité"), ...text("s4_accessibilite"));
    C.push(h2("5.2 Qualité de la prise en charge et réponse aux crises"), h3("Actions de santé publique"), ...text("s4_santepub"), h3("Réponse aux crises sanitaires graves"), ...text("s4_crises"));

    /* ---- 6. Signatures ---- */
    C.push(h1("6. Signature des professionnels de santé"));
    C.push(para("Les professionnels de santé soussignés s'engagent à mettre en œuvre le présent projet de santé."));
    const sig = pros.length ? pros : [{}, {}, {}, {}, {}, {}];
    C.push(new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: [3600, 2800, 3238],
      rows: [new TableRow({ tableHeader: true, children: ["Nom et prénom", "Profession", "Signature"].map((h, i) => cell(h, [3600, 2800, 3238][i], { fill: BLEU, bold: true, color: "FFFFFF" })) })]
        .concat(sig.map((p) => new TableRow({ height: { value: 700, rule: "atLeast" }, cantSplit: true, children: [cell(p.nom || "", 3600), cell(p.profession || "", 2800), cell("", 3238)] })))
    }));

    /* ---- 7. Annexes ---- */
    C.push(h1("7. Annexes"));
    C.push(h2("7.1 Calendrier prévisionnel de montée en charge"));
    const fiches = (st.fiches || []).filter((fi) => has(fi.axe) || has(fi.intitule));
    C.push(fiches.length ? table([2900, 2100, 2400, 2238], ["Action", "Référent", "Calendrier", "Indicateurs"], fiches.map((fi) => [
      [new Paragraph({ children: [run(fi.axe || "", { bold: true, size: 19 })] })].concat(has(fi.intitule) ? [new Paragraph({ children: [run(fi.intitule, { size: 19 })] })] : []),
      fi.referents || "", multiline(fi.calendrier), multiline(fi.indicateurs)])) : todo("plan d'action"));
    C.push(spacer(), para([run("Transmission à l'ARS : ", { bold: true }), run(has(f.s5_date_ars) ? fmtDate(f.s5_date_ars) : "date à fixer")]));
    C.push(h3("Suivi de la mise en œuvre"), ...text("s5_suivi"));

    const doc = new Document({
      creator: "FEMAS Hauts-de-France", title: "Projet de santé — " + (m.msp || "MSP"),
      styles: {
        default: { document: { run: { font: FONT, size: 21 } } },
        paragraphStyles: [
          { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 32, bold: true, color: BLEU }, paragraph: { outlineLevel: 0 } },
          { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: FONT, size: 25, bold: true, color: ROSE }, paragraph: { outlineLevel: 1 } }]
      },
      numbering: { config: [{ reference: "puces", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 240 } } } }] }] },
      sections: [{
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } }, titlePage: true },
        headers: {
          default: new Header({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: W }], border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF", space: 4 } }, children: [run("Projet de santé — " + (m.msp || "MSP"), { size: 16, color: GRIS }), run("\tFEMAS Hauts-de-France", { size: 16, color: BLEU, bold: true })] })] }),
          first: new Header({ children: [new Paragraph({ children: [] })] })
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ tabStops: [{ type: TabStopType.CENTER, position: Math.floor(W / 2) }, { type: TabStopType.RIGHT, position: W }], children: [run("FEMAS Hauts-de-France", { size: 16, bold: true, color: BLEU }), new TextRun({ children: ["\tPage ", PageNumber.CURRENT, " / ", PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: GRIS }), run("\tTerritoire Tremplin", { size: 16, color: ROSE })] })] }),
          first: new Footer({ children: [new Paragraph({ children: [] })] })
        },
        children: C
      }]
    });
    return Packer.toBlob(doc);
  };
})();
