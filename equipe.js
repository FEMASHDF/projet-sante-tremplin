/* =====================================================================
   Fiche de préparation des séances, remplie par l'équipe MSP en amont
   Lien : equipe.html?s=s1&msp=...&d=<id dossier>&c=<commune>&date=AAAA-MM-JJ&axes=A|B
   ===================================================================== */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const filled = (v) => v != null && String(v).trim() !== "";
  const P = new URLSearchParams(location.search);
  const sid = P.get("s");
  const SEQ = Object.fromEntries(SEANCES.map((s) => [s.id, s]));
  const app = $("#app");

  /* ---------- Sans séance : liste des fiches ---------- */
  if (!sid || !EQUIPE[sid]) {
    const qs = new URLSearchParams(P); qs.delete("s");
    app.innerHTML = `<div class="hero" style="--c:var(--violet)"><div class="k">Projet de santé${P.get("msp") ? " — " + esc(P.get("msp")) : ""}</div><h1>Fiches de préparation des séances</h1>
      <p>Avant chaque réunion d'accompagnement, prenez un moment en équipe pour remplir la fiche correspondante. Même partiellement : ce qui manque sera travaillé ensemble en séance.</p></div>
      <div class="list">${Object.keys(EQUIPE).map((k) => { const s = SEQ[k]; qs.set("s", k); return `<a href="?${qs.toString()}"><span class="n" style="background:${s.couleur}">${s.num}</span><span><b>${esc(s.long)}</b><br><span class="muted" style="font-size:13.5px">${esc(s.objectif)}</span></span></a>`; }).join("")}</div>`;
    return;
  }

  const S = SEQ[sid], E = EQUIPE[sid];
  const KEY = "tremplin_equipe_" + (P.get("d") || P.get("msp") || "msp") + "_" + sid;
  let data;
  try { data = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { data = null; }
  if (!data) {
    data = { msp: P.get("msp") || "", commune: P.get("c") || "", expediteur: "", email: "", f: {}, fiches: [], pros: [] };
    if (E.fiches) (P.get("axes") || "").split("|").map((a) => a.trim()).filter(Boolean).forEach((axe) => data.fiches.push({ axe }));
    if (E.fiches && !data.fiches.length) data.fiches.push({}, {});
    if (E.pros) data.pros.push({}, {}, {});
  }
  let t = null;
  const save = () => { clearTimeout(t); t = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(data)); $("#saved").textContent = "Brouillon enregistré sur cet ordinateur"; } catch (e) {} }, 300); progress(); };

  const field = (q) => {
    const v = data.f[q.k] || "";
    const input = q.type === "text" ? `<input type="text" data-k="${q.k}" value="${esc(v)}">`
      : q.type === "date" ? `<input type="date" data-k="${q.k}" value="${esc(v)}">`
      : `<textarea data-k="${q.k}">${esc(v)}</textarea>`;
    return `<div class="f ${filled(v) ? "filled" : ""}"><label>${esc(q.q)}</label>${q.help ? `<span class="help">${esc(q.help)}</span>` : ""}${input}</div>`;
  };
  const fichesHTML = () => data.fiches.map((fi, i) => `<div class="fiche"><h3>Thématique ${i + 1}${fi.axe ? " — " + esc(fi.axe) : ""}<button class="btn sm ghost noprint" data-del-fiche="${i}">Retirer</button></h3>
    ${E.fiches.map(([k, l, ty]) => `<div class="f ${filled(fi[k]) ? "filled" : ""}"><label>${esc(l)}</label>${ty === "text" ? `<input type="text" data-fiche="${i}.${k}" value="${esc(fi[k] || "")}">` : `<textarea data-fiche="${i}.${k}" style="min-height:70px">${esc(fi[k] || "")}</textarea>`}</div>`).join("")}</div>`).join("");
  const prosHTML = () => `<table><thead><tr><th>Nom et prénom</th><th>Profession</th><th>RPPS / ADELI</th><th>Rôle dans le projet</th><th></th></tr></thead><tbody>
    ${data.pros.map((p, i) => `<tr>${["nom", "profession", "rpps", "role"].map((k) => `<td><input type="text" data-pro="${i}.${k}" value="${esc(p[k] || "")}"></td>`).join("")}<td><button class="btn sm ghost noprint" data-del-pro="${i}">✕</button></td></tr>`).join("")}</tbody></table>`;

  function render() {
    const date = P.get("date");
    app.innerHTML = `
    <div class="hero" style="--c:${S.couleur}"><div class="k">Fiche de préparation${data.msp ? " — " + esc(data.msp) : ""}</div>
      <h1>${esc(S.long)}</h1><p>${date ? "Réunion prévue le " + esc(new Date(date + "T12:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })) + ". " : ""}${esc(E.intro)}</p></div>
    <div class="cols" style="margin-bottom:16px">
      <div class="box bleu"><h3>Ce que nous ferons en séance</h3>${esc(S.objectif)}</div>
      <div class="box jaune"><h3>À préparer ou apporter</h3><ul>${(E.apporter || ["Vos réponses à cette fiche"]).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
    </div>
    <div class="card"><h2>Votre maison de santé</h2>
      <div class="cols"><div class="f"><label>Nom de la MSP</label><input type="text" data-d="msp" value="${esc(data.msp)}"></div>
      <div class="f"><label>Commune</label><input type="text" data-d="commune" value="${esc(data.commune)}"></div>
      <div class="f"><label>Rempli par (nom, fonction)</label><input type="text" data-d="expediteur" value="${esc(data.expediteur)}"></div>
      <div class="f"><label>E-mail</label><input type="email" data-d="email" value="${esc(data.email)}"></div></div></div>
    ${E.pros ? `<div class="card"><h2>Les professionnels de la MSP</h2><p class="muted" style="margin-top:0;font-size:13.5px">${esc(E.prosHelp || "Une ligne par professionnel. Le numéro RPPS / ADELI est indispensable pour le dossier ARS.")}</p><div id="pros">${prosHTML()}</div><button class="btn sm ghost noprint" data-add-pro style="margin-top:10px">+ Ajouter un professionnel</button></div>` : ""}
    ${E.fiches ? `<div class="card"><h2>Vos thématiques prioritaires</h2><div id="fiches">${fichesHTML()}</div><button class="btn sm ghost noprint" data-add-fiche>+ Ajouter une thématique</button></div>` : ""}
    <div class="card"><h2>${E.fiches ? "Pour compléter" : "Vos réponses"}</h2>${E.questions.map(field).join("")}</div>
    <div class="sticky noprint"><div class="wrap">
      <div style="flex:1;min-width:200px"><b id="prog"></b><div class="bar"><i id="progbar"></i></div><span class="save" id="saved"></span></div>
      <button class="btn ghost" onclick="window.print()">🖨 Imprimer</button>
      <button class="btn rose" id="send">📨 Envoyer à la FEMAS</button>
    </div><div class="wrap"><span id="msg"></span></div></div>`;
    progress();
  }
  function counts() {
    let tot = E.questions.length, ok = E.questions.filter((q) => filled(data.f[q.k])).length;
    if (E.fiches) data.fiches.forEach((fi) => { tot += E.fiches.length; ok += E.fiches.filter(([k]) => filled(fi[k])).length; });
    if (E.pros) { tot += 1; if (data.pros.some((p) => filled(p.nom))) ok += 1; }
    return { tot, ok, pct: tot ? Math.round((ok / tot) * 100) : 0 };
  }
  function progress() { const c = counts(); const a = $("#prog"), b = $("#progbar"); if (a) a.textContent = c.ok + " / " + c.tot + " réponses renseignées"; if (b) b.style.width = c.pct + "%"; }

  app.addEventListener("input", (e) => {
    const t = e.target, d = t.dataset;
    if (d.k) data.f[d.k] = t.value;
    else if (d.d) data[d.d] = t.value;
    else if (d.fiche) { const [i, k] = d.fiche.split("."); data.fiches[+i][k] = t.value; }
    else if (d.pro) { const [i, k] = d.pro.split("."); data.pros[+i][k] = t.value; }
    else return;
    const box = t.closest(".f"); if (box) box.classList.toggle("filled", filled(t.value));
    save();
  });
  app.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return; const d = b.dataset;
    if (d.addFiche != null) { data.fiches.push({}); save(); render(); }
    else if (d.delFiche != null) { if (confirm("Retirer cette thématique ?")) { data.fiches.splice(+d.delFiche, 1); save(); render(); } }
    else if (d.addPro != null) { data.pros.push({}); save(); render(); }
    else if (d.delPro != null) { data.pros.splice(+d.delPro, 1); save(); render(); }
    else if (b.id === "send") send(b);
  });

  function lisible() {
    const L = [];
    if (E.pros) { const ps = data.pros.filter((p) => filled(p.nom)); if (ps.length) L.push("PROFESSIONNELS\n" + ps.map((p) => "- " + [p.nom, p.profession, p.rpps, p.role].filter(Boolean).join(" · ")).join("\n")); }
    if (E.fiches) data.fiches.forEach((fi, i) => { const lines = E.fiches.filter(([k]) => filled(fi[k])).map(([k, l]) => l + " : " + fi[k]); if (lines.length) L.push("THÉMATIQUE " + (i + 1) + "\n" + lines.join("\n")); });
    E.questions.forEach((q) => { if (filled(data.f[q.k])) L.push(q.q.toUpperCase() + "\n" + data.f[q.k]); });
    return L.join("\n\n") || "(aucune réponse)";
  }
  async function send(btn) {
    const msg = $("#msg");
    if (!filled(data.msp)) { msg.innerHTML = `<span style="color:var(--err)">Indiquez le nom de votre MSP.</span>`; return; }
    if (!filled(data.expediteur)) { msg.innerHTML = `<span style="color:var(--err)">Indiquez votre nom.</span>`; return; }
    btn.disabled = true; msg.textContent = "Envoi en cours…";
    const c = counts();
    const payload = { type: "tremplin-equipe", version: 1, seance: sid, dossierId: P.get("d") || "", msp: data.msp, commune: data.commune, expediteur: data.expediteur, email: data.email, date: new Date().toISOString(), f: data.f, fiches: data.fiches.filter((fi) => Object.values(fi).some(filled)), pros: data.pros.filter((p) => filled(p.nom)) };
    const id = JOTFORM_EQUIPE.id, fd = new FormData();
    fd.append("formID", id); fd.append("simple_spc", id + "-" + id); fd.append("submitSource", "form"); fd.append("buildDate", String(Date.now()));
    fd.append("q2_msp", data.msp); fd.append("q3_commune", data.commune || ""); fd.append("q4_seance", S.long);
    fd.append("q5_expediteur", data.expediteur); fd.append("q6_email", data.email || ""); fd.append("q7_dossierId", P.get("d") || "");
    fd.append("q8_avancement", c.ok + " / " + c.tot + " réponses"); fd.append("q9_reponses", lisible());
    const slug = data.msp.replace(/[^\w-]+/g, "-");
    fd.append("q10_fichier[]", new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), "preparation-S" + S.num + "-" + slug + ".json");
    try {
      await fetch(JOTFORM_EQUIPE.submit, { method: "POST", body: fd, mode: "no-cors" });
      data.sent = new Date().toISOString(); save();
      msg.innerHTML = `<span style="color:var(--ok)">✓ Merci ! Vos réponses ont été transmises à la FEMAS. Vous pouvez encore les compléter et les renvoyer avant la séance.</span>`;
    } catch (e) { msg.innerHTML = `<span style="color:var(--err)">Envoi impossible : vérifiez votre connexion et réessayez. Vos réponses restent enregistrées.</span>`; }
    btn.disabled = false;
  }

  document.title = "Préparer la " + S.long.split(" — ")[0].toLowerCase() + " · Projet de santé";
  render();
  if (data.sent) $("#msg").innerHTML = `<span class="muted">Dernier envoi à la FEMAS : ${new Date(data.sent).toLocaleString("fr-FR")}</span>`;
})();
