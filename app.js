/* =====================================================================
   Accompagnement à la rédaction du projet de santé — logique
   Données stockées localement (localStorage) · export / import JSON
   ===================================================================== */
(function () {
  "use strict";

  const LS_KEY = "tremplin_pds_v1";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nl2br = (s) => esc(s).replace(/\n/g, "<br>");
  const filled = (v) => v != null && String(v).trim() !== "";
  const SEQ = Object.fromEntries(SEANCES.map((s) => [s.id, s]));

  /* ---------------- STORE ---------------- */
  function blankDossier(nom) {
    return {
      id: "msp_" + Date.now().toString(36),
      created: new Date().toISOString(),
      m: { msp: nom || "", commune: "", adresse: "", coord: "", email: "", porteuse: "", coanim: "", profil: "", q: {}, dates: {}, statut: "En cours" },
      f: {}, c: {}, o: {}, r: {},
      fiches: [],
      pros: [],
      conf: {}
    };
  }
  let store;
  try { store = JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch (e) { store = null; }
  if (!store || !store.dossiers || !Object.keys(store.dossiers).length) {
    const d = blankDossier("");
    store = { current: d.id, dossiers: { [d.id]: d } };
  }
  if (!store.dossiers[store.current]) store.current = Object.keys(store.dossiers)[0];
  let st = store.dossiers[store.current];

  let saveT = null;
  function save(now) {
    const pill = $("#savepill");
    pill.textContent = "Enregistrement…"; pill.classList.add("wait");
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(store)); pill.textContent = "Enregistré"; }
      catch (e) { pill.textContent = "Non enregistré !"; }
      pill.classList.remove("wait");
    }, now ? 0 : 400);
  }
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 2200); }

  /* ---------------- PROFIL ---------------- */
  function computeProfil(q) {
    const answered = QUESTIONS.filter((x) => q[x.id] != null);
    if (answered.length < QUESTIONS.length) return null;
    let score = 0, forceC = false;
    QUESTIONS.forEach((x) => { const v = +q[x.id]; score += v; if (x.force != null && v >= x.force) forceC = true; });
    if (forceC || score >= 7) return "C";
    if (score >= 4) return "B";
    return "A";
  }
  const profil = () => st.m.profil || computeProfil(st.m.q || {}) || "";

  /* ---------------- PROGRESSION ---------------- */
  function ficheFilledCount(fi) { return FICHE_CHAMPS.filter(([k]) => filled(fi[k])).length; }
  function progress(sid) {
    const s = SEQ[sid]; let tot = 0, ok = 0;
    s.fields.forEach((f) => { tot++; if (filled(st.f[f.k])) ok++; });
    s.recup.forEach((_, i) => { tot++; if (st.c[sid + "_r" + i]) ok++; });
    if (s.fiches) { const n = Math.max(st.fiches.length, 2); tot += n * FICHE_CHAMPS.length; st.fiches.forEach((fi) => ok += ficheFilledCount(fi)); }
    if (s.pros) { tot += 2; if (st.pros.length) ok++; if (st.pros.length && st.pros.every((p) => filled(p.rpps))) ok++; }
    if (s.signatures) { tot += 1; if (st.pros.length && st.pros.every((p) => p.signe)) ok++; }
    if (sid === "s0") { tot += 2; if (st.m.dates && st.m.dates.s1) ok++; if (profil()) ok++; }
    return tot ? Math.round((ok / tot) * 100) : 0;
  }

  /* ---------------- NAV ---------------- */
  const VIEWS = [["accueil", "⌂", ""], ["dossier", "Dossier", ""]]
    .concat(SEANCES.map((s) => [s.id, s.id === "s0" ? "Prépa" : s.titre, s.num, s.couleur]))
    .concat([["projet", "📄 Projet", ""], ["conformite", "✓ ARS", ""], ["outils", "Outils", ""]]);

  function renderNav() {
    const cur = (location.hash || "#accueil").slice(1).split("/")[0];
    $("#navsteps").innerHTML = VIEWS.map(([id, label, num, col]) => {
      const p = num !== "" ? progress(id) : 0;
      return `<a href="#${id}" class="${cur === id ? "on" : ""}" style="--c:${col || "var(--bleu)"}">${num !== "" ? `<span class="n ${p >= 100 ? "done" : ""}">${p >= 100 ? "✓" : num}</span>` : ""}${esc(label)}</a>`;
    }).join("");
    const sel = $("#dossierSel");
    sel.innerHTML = Object.values(store.dossiers).map((d) => `<option value="${d.id}" ${d.id === store.current ? "selected" : ""}>${esc(d.m.msp || "MSP sans nom")}</option>`).join("");
  }

  /* ---------------- HELPERS RENDU ---------------- */
  function fieldHTML(f) {
    const v = st.f[f.k] || "";
    const input = f.type === "text" ? `<input type="text" data-k="${f.k}" value="${esc(v)}">`
      : f.type === "date" ? `<input type="date" data-k="${f.k}" value="${esc(v)}">`
      : `<textarea data-k="${f.k}" rows="3">${esc(v)}</textarea>`;
    return `<div class="f ${filled(v) ? "filled" : ""}"><label>${f.sec ? `<span class="sec">${esc(f.sec)}</span>` : ""}${esc(f.label)}</label>${f.help ? `<span class="help">${esc(f.help)}</span>` : ""}${input}</div>`;
  }
  function checklist(sid, items, prefix) {
    return `<ul class="chk">${items.map((it, i) => { const k = sid + "_" + prefix + i; return `<li class="${st.c[k] ? "done" : ""}"><input type="checkbox" data-c="${k}" ${st.c[k] ? "checked" : ""}><span>${esc(it)}</span></li>`; }).join("")}</ul>`;
  }
  function stephead(s) {
    const p = progress(s.id);
    return `<div class="stephead" style="--c:${s.couleur}"><div class="num">${s.num}</div><div><div style="opacity:.85;font-size:13px;font-weight:600">${esc(s.trame)}</div><h2>${esc(s.long)}</h2><p>${esc(s.objectif)}</p></div>
      <div class="prog"><b id="prog-${s.id}">${p} %</b><div class="bar"><i id="progbar-${s.id}" style="width:${p}%"></i></div><small>${st.m.dates && st.m.dates[s.id] ? "📅 " + fmtDate(st.m.dates[s.id]) : ""}</small></div></div>`;
  }
  function fmtDate(d) { if (!d) return ""; try { return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); } catch (e) { return d; } }
  function profilPill(p) { return p ? `<span class="pill ${p}">Profil ${p} · ${esc(PROFILS[p].court)}</span>` : `<span class="pill">Profil non défini</span>`; }

  /* ---------------- VUES ---------------- */
  function viewAccueil() {
    const p = profil();
    const steps = SEANCES.map((s) => `<a class="pstep" href="#${s.id}" style="--c:${s.couleur}"><b>${s.id === "s0" ? "Prépa" : "Séance " + s.num}</b><span>${esc(s.titre)}</span><small style="opacity:.85">${st.m.dates && st.m.dates[s.id] ? new Date(st.m.dates[s.id] + "T12:00").toLocaleDateString("fr-FR") : ""}</small><div class="bar"><i style="width:${progress(s.id)}%"></i></div></a>`).join("");
    return `
    <div class="hero">
      <div>
        <div class="eyebrow">Territoire Tremplin · FEMAS Hauts-de-France</div>
        <h1>Le projet de santé, séance après séance.</h1>
        <p>Un seul outil pour préparer, animer et capter chaque réunion d'accompagnement : la trame se remplit au fil des 5 ateliers, Claude rédige à partir de la captation Upmeet, et le dossier part à l'ARS conforme.</p>
        <div class="cta">
          <a class="btn rose huge" href="#dossier">${st.m.msp ? "Reprendre « " + esc(st.m.msp) + " »" : "Démarrer un accompagnement"}</a>
          <a class="btn ghost huge" href="#projet">Voir le projet de santé</a>
        </div>
      </div>
      <div class="logo"><img src="logo-tremplin.png" alt="Territoire Tremplin"></div>
    </div>
    <div class="process">${steps}<a class="pstep light" href="#conformite"><b>Après</b><span>Dépôt ARS</span><div class="bar"><i style="width:${confScore().pct}%"></i></div></a></div>
    <div class="grid g2">
      <div class="card">
        <div class="eyebrow">MSP en cours</div>
        <h3>${esc(st.m.msp || "Aucune MSP renseignée")}</h3>
        <p class="muted">${esc(st.m.commune || "")}</p>
        <p>${profilPill(p)}</p>
        ${p ? `<p><b>${esc(PROFILS[p].format)}</b> — ${esc(PROFILS[p].resume)}</p>` : `<p class="muted">Répondez aux 5 questions d'orientation dans le dossier pour adapter le parcours.</p>`}
        <p><b>Prochaine étape :</b> ${nextStep()}</p>
      </div>
      <div class="card">
        <div class="eyebrow">Le principe</div>
        <h3>1 atelier = 1 partie du projet écrite</h3>
        <ul class="plain">
          <li><b>Avant</b> : fiche animateur, briefing du binôme, outils d'animation choisis selon le profil d'équipe.</li>
          <li><b>Pendant</b> : chrono du déroulé, check-list « à récupérer », saisie directe dans la trame.</li>
          <li><b>Après</b> : transcription Upmeet → Claude → réponse importée en 1 clic ; relevé de décisions et note d'inter-séance générés automatiquement.</li>
          <li><b>À la fin</b> : projet de santé exporté en Word et grille de conformité ARS calculée.</li>
        </ul>
      </div>
    </div>
    <h2 style="margin-top:28px">Pourquoi un outil en ligne ?</h2>
    <div class="why">
      <div><b>Zéro ressaisie.</b>Ce qui est capté en séance alimente directement la trame, la note d'inter-séance et la grille ARS.</div>
      <div><b>Le temps humain préservé.</b>On anime en séance, on rédige entre les séances avec Claude.</div>
      <div><b>Adapté à chaque équipe.</b>3 profils d'accompagnement, des outils d'animation recommandés pour chacun.</div>
      <div><b>Rien ne se perd.</b>Continuité entre salariées : tout le dossier est exportable et réimportable.</div>
    </div>`;
  }

  function nextStep() {
    if (!st.m.msp) return `<a href="#dossier">renseigner la MSP</a>`;
    if (!profil()) return `<a href="#dossier">identifier le profil d'équipe</a>`;
    for (const s of SEANCES) { if (progress(s.id) < 80) return `<a href="#${s.id}">${esc(s.long)}</a> (${progress(s.id)} %)`; }
    return `<a href="#conformite">vérifier la conformité et transmettre à l'ARS</a>`;
  }

  function viewDossier() {
    const m = st.m, p = computeProfil(m.q || {});
    const eff = profil();
    const qs = QUESTIONS.map((q) => `<div class="q"><b>${esc(q.label)}</b><div class="opts">${q.opts.map((o, i) => `<label><input type="radio" name="${q.id}" data-q="${q.id}" value="${i}" ${String(m.q[q.id]) === String(i) ? "checked" : ""}><span>${esc(o)}</span></label>`).join("")}</div></div>`).join("");
    const pr = eff ? PROFILS[eff] : null;
    return `
    <div class="stephead" style="--c:var(--violet)"><div class="num">✎</div><div><h2>Dossier de la MSP</h2><p>Identité, binôme d'animation, calendrier et profil d'accompagnement.</p></div></div>
    <div class="grid g2">
      <div class="card">
        <h3>Votre maison de santé</h3>
        <div class="f"><label>Nom de la MSP</label><input type="text" data-m="msp" value="${esc(m.msp)}"></div>
        <div class="cols2">
          <div class="f"><label>Commune</label><input type="text" data-m="commune" value="${esc(m.commune)}"></div>
          <div class="f"><label>Statut</label><select data-m="statut">${["En cours", "En pause", "Projet déposé", "Terminé"].map((x) => `<option ${m.statut === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
          <div class="f"><label>Coordinateur·rice MSP</label><input type="text" data-m="coord" value="${esc(m.coord)}"></div>
          <div class="f"><label>E-mail de contact</label><input type="email" data-m="email" value="${esc(m.email)}"></div>
          <div class="f"><label>Salariée FEMAS porteuse</label><input type="text" data-m="porteuse" value="${esc(m.porteuse)}"></div>
          <div class="f"><label>Professionnel·le co-animateur</label><input type="text" data-m="coanim" value="${esc(m.coanim)}"></div>
        </div>
        <h3 style="margin-top:8px">Calendrier des séances</h3>
        <div class="cols2">${SEANCES.map((s) => `<div class="f"><label>${esc(s.id === "s0" ? "Lancement / prépa" : "Séance " + s.num + " — " + s.titre)}</label><input type="date" data-date="${s.id}" value="${esc(m.dates[s.id] || "")}"></div>`).join("")}</div>
      </div>
      <div class="card">
        <h3>Quel accompagnement pour cette équipe ?</h3>
        <p class="muted">5 questions · 2 minutes. Le profil adapte les conseils d'animation, les outils recommandés et la note d'inter-séance.</p>
        ${qs}
        <div class="profil-res ${eff || "none"}">
          ${pr ? `<div style="font-size:12px;opacity:.85;font-weight:600;text-transform:uppercase">Profil ${eff}${m.profil ? " (choisi manuellement)" : " (calculé)"}</div><h3 style="margin:.2em 0">${esc(pr.nom)}</h3><b>${esc(pr.format)}</b><ul class="plain">${pr.principes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<b>Répondez aux 5 questions pour obtenir le profil.</b>`}
        </div>
        <div class="f" style="margin-top:12px"><label>Forcer un profil (facultatif)</label>
          <select data-m="profil"><option value="">— Profil calculé${p ? " : " + p : ""} —</option>${Object.entries(PROFILS).map(([k, v]) => `<option value="${k}" ${m.profil === k ? "selected" : ""}>${k} · ${esc(v.nom)}</option>`).join("")}</select></div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <h3>Tableau de bord multi-MSP</h3>
      ${dashboard()}
    </div>`;
  }

  function dashboard() {
    const rows = Object.values(store.dossiers).map((d) => {
      const keep = st; st = d;
      const pr = profil();
      const cells = SEANCES.map((s) => { const p = progress(s.id); return `<td><span class="mini"><i style="width:${p}%"></i></span>${p}%</td>`; }).join("");
      const next = SEANCES.slice(1).find((s) => d.m.dates[s.id] && d.m.dates[s.id] >= new Date().toISOString().slice(0, 10));
      const conf = confScore().pct;
      st = keep;
      return `<tr><td><a href="#dossier" data-open="${d.id}"><b>${esc(d.m.msp || "MSP sans nom")}</b></a><br><small class="muted">${esc(d.m.commune || "")}</small></td><td>${pr ? `<span class="pill ${pr}">${pr}</span>` : "—"}</td><td>${esc(d.m.statut || "")}</td>${cells}<td>${conf}%</td><td>${next ? new Date(d.m.dates[next.id] + "T12:00").toLocaleDateString("fr-FR") + " (S" + next.num + ")" : "—"}</td></tr>`;
    }).join("");
    return `<div class="tblwrap"><table class="t dash"><thead><tr><th>MSP</th><th>Profil</th><th>Statut</th>${SEANCES.map((s) => `<th>${s.id === "s0" ? "Prépa" : "S" + s.num}</th>`).join("")}<th>ARS</th><th>Prochain RDV</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="muted" style="font-size:13px">Les dossiers sont stockés dans ce navigateur. Pour les partager entre salariées : <a href="#outils">exporter / importer</a>.</p>`;
  }

  /* --- Séance --- */
  function viewSeance(sid, tab) {
    const s = SEQ[sid];
    const tabs = sid === "s0"
      ? [["prep", "Préparer"], ["saisie", "Diagnostic"], ["claude", "Avec Claude"]]
      : [["prep", "① Préparer"], ["seance", "② En séance"], ["releve", "③ Relevé de décisions"], ["claude", "④ Avec Claude"], ["note", "⑤ Note d'inter-séance"]];
    tab = tab && tabs.some((t) => t[0] === tab) ? tab : tabs[0][0];
    return `${stephead(s)}
    <div class="tabs" style="--c:${s.couleur}">${tabs.map(([id, l]) => `<button class="tab ${tab === id ? "on" : ""}" data-tab="${sid}/${id}">${l}</button>`).join("")}</div>
    <div style="--c:${s.couleur}">${{ prep: panePrep, seance: paneSeance, saisie: paneSaisie, releve: paneReleve, claude: paneClaude, note: paneNote }[tab](s)}</div>`;
  }

  function panePrep(s) {
    const p = profil();
    const tools = Object.entries(OUTILS).filter(([, t]) => t.s === s.id);
    const chosen = st.o[s.id] || [];
    const briefing = ["Fiche animateur transmise au co-animateur", "Rappel de l'objectif de remplissage et de l'encadré « À récupérer »", "Répartition des prises de parole et des temps d'animation", "Points de vigilance spécifiques à l'équipe", "Logistique vérifiée (salle, matériel, Upmeet, imprimés)"];
    return `
    <div class="grid g2">
      <div>
        <div class="box bleu"><h4>Objectif de la séance</h4>${esc(s.objectif)}<br><br><b>Livrable :</b> ${esc(s.livrable)}</div>
        ${p ? `<div class="box rose"><h4>Conseil profil ${p} · ${esc(PROFILS[p].court)}</h4>${esc(s.profilTips[p])}</div>` : `<div class="box rose"><h4>Profil d'équipe</h4>Non défini — <a href="#dossier">répondre aux 5 questions</a> pour des conseils adaptés.</div>`}
        <div class="card"><h4>Préparation & matériel</h4>${checklist(s.id, s.materiel, "m")}</div>
      </div>
      <div>
        ${s.id !== "s0" ? `<div class="card" style="margin-bottom:16px"><h4>Briefing du binôme (15-20 min avant)</h4>${checklist(s.id, briefing, "b")}<p class="muted" style="font-size:13px;margin-bottom:0">Binôme : ${esc(st.m.porteuse || "salariée porteuse")} + ${esc(st.m.coanim || "co-animateur")} · Captation : ${esc(st.m.coord || "coordinateur MSP")}</p></div>` : ""}
        <div class="box jaune"><h4>Points de vigilance</h4><ul class="plain">${s.vigilance.map((v) => `<li>${esc(v)}</li>`).join("")}</ul></div>
      </div>
    </div>
    ${tools.length ? `<h3 style="margin-top:20px">Boîte à outils d'animation <span class="muted" style="font-size:14px;font-weight:400">— cliquez pour composer votre séance (★ = recommandé pour le profil ${p || "?"})</span></h3>
    <div class="tools">${tools.map(([id, t]) => `<div class="tool ${chosen.includes(id) ? "sel" : ""}" data-tool="${s.id}:${id}">${p && t.reco.includes(p) ? `<span class="reco">★ ${p}</span>` : ""}<h5>${esc(t.nom)}</h5><div class="meta">⏱ ${esc(t.duree)} · profils ${t.reco.split("").join(" / ")}</div><p>${esc(t.desc)}</p>${chosen.includes(id) ? `<span class="tick">✓ retenu</span>` : ""}</div>`).join("")}</div>` : ""}`;
  }

  function paneSaisie(s) {
    return `<div class="grid g2"><div class="card">${s.fields.map(fieldHTML).join("")}</div><div><div class="box bleu"><h4>À réaliser / vérifier</h4>${checklist(s.id, s.recup, "r")}</div>
      <div class="box vert"><h4>Astuce</h4>Collez les extraits du diagnostic PDF dans l'onglet « Avec Claude » : il les résume dans les bonnes rubriques.</div></div></div>`;
  }

  function paneSeance(s) {
    const tl = timer.sid === s.id;
    return `
    <div class="timer noprint">
      <div class="clock" id="clock">${fmtClock(tl ? elapsed() : 0)}</div>
      <div class="now" id="clocknow"><small>Séquence en cours</small>${tl && timer.running ? "" : "Chrono à l'arrêt"}</div>
      <button class="btn sm ${tl && timer.running ? "ghost" : "vert"}" data-timer="${s.id}">${tl && timer.running ? "⏸ Pause" : "▶ Démarrer"}</button>
      <button class="btn sm ghost" data-timer-reset="${s.id}">↺</button>
    </div>
    <div class="tblwrap card" style="padding:8px;margin-bottom:16px"><table class="t" id="deroule"><thead><tr><th>Temps</th><th>Séquence</th><th>Méthode</th></tr></thead><tbody>
      ${s.deroule.map(([a, b, seq, met], i) => `<tr data-row="${i}" data-a="${a}" data-b="${b}"><td><b>${a}–${b}</b></td><td><b>${esc(seq)}</b></td><td>${esc(met)}</td></tr>`).join("")}
    </tbody></table>${(st.o[s.id] || []).length ? `<p style="margin:8px"><b>Outils retenus :</b> ${(st.o[s.id]).map((id) => esc(OUTILS[id].nom)).join(" · ")}</p>` : ""}</div>
    <div class="grid seancegrid">
      <div>
        ${s.fiches ? fichesHTML() : ""}
        ${s.pros ? prosHTML() : ""}
        ${s.signatures ? signaturesHTML() : ""}
        <div class="card"><h4>Zone à compléter <span class="muted" style="font-weight:400">— trame ${esc(s.trame)}</span></h4>${s.fields.map(fieldHTML).join("")}</div>
      </div>
      <div class="side">
        <div class="box bleu"><h4>À récupérer en séance</h4>${checklist(s.id, s.recup, "r")}</div>
        <div class="box jaune"><h4>Vigilance</h4><ul class="plain" style="font-size:13.5px">${s.vigilance.map((v) => `<li>${esc(v)}</li>`).join("")}</ul></div>
      </div>
    </div>`;
  }

  function fichesHTML() {
    if (!st.fiches.length) seedFiches();
    return `<div class="card" style="margin-bottom:16px"><div class="row" style="justify-content:space-between"><h4 style="margin:0">Fiches-actions (une par axe)</h4><button class="btn sm" data-add-fiche>+ Ajouter une fiche</button></div><p class="muted" style="font-size:13px">Les intitulés d'axes sont repris de la séance 2.</p>
    ${st.fiches.map((fi, i) => `<div class="fiche"><div class="fh"><h4>Fiche-action n° ${i + 1} ${fi.axe ? "— " + esc(fi.axe) : ""}</h4><span class="pill">${ficheFilledCount(fi)}/${FICHE_CHAMPS.length}</span><button class="btn sm ghost" data-del-fiche="${i}" title="Supprimer">✕</button></div>
      <div class="cols2">${FICHE_CHAMPS.map(([k, l, t]) => `<div class="f ${filled(fi[k]) ? "filled" : ""}"><label>${esc(l)}</label>${t === "text" ? `<input type="text" data-fiche="${i}.${k}" value="${esc(fi[k] || "")}">` : `<textarea rows="2" data-fiche="${i}.${k}">${esc(fi[k] || "")}</textarea>`}</div>`).join("")}</div></div>`).join("")}</div>`;
  }
  function seedFiches() {
    ["s2_axe1", "s2_axe2", "s2_axe3"].forEach((k) => { if (filled(st.f[k])) st.fiches.push({ axe: st.f[k] }); });
    if (!st.fiches.length) st.fiches.push({}, {});
  }
  function prosHTML() {
    return `<div class="card" style="margin-bottom:16px"><div class="row" style="justify-content:space-between"><h4 style="margin:0">Professionnels de la MSP</h4><button class="btn sm" data-add-pro>+ Ajouter</button></div>
      <div class="tblwrap"><table class="t"><thead><tr><th>Nom et prénom</th><th>Profession</th><th>RPPS / ADELI</th><th>Rôle / référent</th><th></th></tr></thead><tbody>
      ${st.pros.map((p, i) => `<tr>${["nom", "profession", "rpps", "role"].map((k) => `<td><input type="text" data-pro="${i}.${k}" value="${esc(p[k] || "")}"></td>`).join("")}<td><button class="btn sm ghost" data-del-pro="${i}">✕</button></td></tr>`).join("") || `<tr><td colspan="5" class="muted">Aucun professionnel saisi.</td></tr>`}
      </tbody></table></div></div>`;
  }
  function signaturesHTML() {
    return `<div class="card" style="margin-bottom:16px"><h4>Signatures des professionnels engagés</h4>
      <div class="tblwrap"><table class="t"><thead><tr><th>Nom et prénom</th><th>Profession</th><th>Signé</th></tr></thead><tbody>
      ${st.pros.map((p, i) => `<tr><td>${esc(p.nom)}</td><td>${esc(p.profession)}</td><td><input type="checkbox" data-pro-sign="${i}" ${p.signe ? "checked" : ""}></td></tr>`).join("") || `<tr><td colspan="3" class="muted">Renseignez les professionnels en <a href="#s4/seance">séance 4</a>.</td></tr>`}
      </tbody></table></div>
      <h4 style="margin-top:14px">Plan d'action consolidé (généré depuis les fiches-actions)</h4>${planTable()}</div>`;
  }
  function planTable() {
    if (!st.fiches.length) return `<p class="muted">Aucune fiche-action.</p>`;
    return `<div class="tblwrap"><table class="t"><thead><tr><th>Action</th><th>Référent</th><th>Calendrier</th><th>Indicateurs</th></tr></thead><tbody>${st.fiches.map((fi) => `<tr><td><b>${esc(fi.axe || "")}</b>${fi.intitule ? "<br>" + esc(fi.intitule) : ""}</td><td>${esc(fi.referents || "")}</td><td>${nl2br(fi.calendrier || "")}</td><td>${nl2br(fi.indicateurs || "")}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function paneReleve(s) {
    const r = relev(s.id);
    return `<div class="card">
      <div class="cols2">
        <div class="f"><label>Date</label><input type="date" data-r="${s.id}.date" value="${esc(r.date || st.m.dates[s.id] || "")}"></div>
        <div class="f"><label>Animateur·rices</label><input type="text" data-r="${s.id}.animateur" value="${esc(r.animateur || [st.m.porteuse, st.m.coanim].filter(Boolean).join(" + "))}"></div>
        <div class="f"><label>Présents</label><textarea rows="2" data-r="${s.id}.presents">${esc(r.presents || "")}</textarea></div>
        <div class="f"><label>Excusés</label><textarea rows="2" data-r="${s.id}.excuses">${esc(r.excuses || "")}</textarea></div>
      </div>
      <div class="f"><label>Décisions prises</label><span class="help">Une décision par ligne.</span><textarea rows="5" data-r="${s.id}.decisions">${esc(r.decisions || "")}</textarea></div>
      <div class="row" style="justify-content:space-between"><h4 style="margin:0">Actions à mener</h4><button class="btn sm" data-add-act="${s.id}">+ Action</button></div>
      <div class="tblwrap"><table class="t"><thead><tr><th>Priorité</th><th>Quoi</th><th>Qui</th><th>Pour quand</th><th>Fait</th><th></th></tr></thead><tbody>
      ${(r.actions || []).map((a, i) => `<tr><td style="width:90px"><select data-act="${s.id}.${i}.prio">${[1, 2, 3].map((n) => `<option ${String(a.prio || 1) === String(n) ? "selected" : ""}>${n}</option>`).join("")}</select></td><td><input type="text" data-act="${s.id}.${i}.quoi" value="${esc(a.quoi || "")}"></td><td><input type="text" data-act="${s.id}.${i}.qui" value="${esc(a.qui || "")}"></td><td><input type="text" data-act="${s.id}.${i}.quand" value="${esc(a.quand || "")}"></td><td><input type="checkbox" data-act-done="${s.id}.${i}" ${a.fait ? "checked" : ""}></td><td><button class="btn sm ghost" data-del-act="${s.id}.${i}">✕</button></td></tr>`).join("") || `<tr><td colspan="6" class="muted">Aucune action.</td></tr>`}
      </tbody></table></div>
      <div class="cols2" style="margin-top:12px">
        <div class="f"><label>Points en suspens</label><textarea rows="3" data-r="${s.id}.suspens">${esc(r.suspens || "")}</textarea></div>
        <div class="f"><label>Prochaine séance (date)</label><input type="date" data-r="${s.id}.prochaine" value="${esc(r.prochaine || nextDate(s.id))}"></div>
      </div>
      <div class="row"><button class="btn" data-export-releve="${s.id}">⬇ Relevé en Word</button><a class="btn ghost" href="#${s.id}/note">Générer la note d'inter-séance →</a></div>
    </div>`;
  }
  function relev(sid) { if (!st.r[sid]) st.r[sid] = { actions: [] }; if (!st.r[sid].actions) st.r[sid].actions = []; return st.r[sid]; }
  function nextDate(sid) { const i = SEANCES.findIndex((s) => s.id === sid); const n = SEANCES[i + 1]; return n && st.m.dates[n.id] ? st.m.dates[n.id] : ""; }

  /* --- Claude --- */
  function claudeKeys(s) {
    const o = {};
    s.fields.forEach((f) => { o[f.k] = f.label + (f.help ? " (" + f.help + ")" : ""); });
    return o;
  }
  function buildPrompt(s) {
    const p = profil();
    const keys = claudeKeys(s);
    const current = {};
    s.fields.forEach((f) => { if (filled(st.f[f.k])) current[f.k] = st.f[f.k]; });
    const schema = { ...Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, "texte — " + v])) };
    if (s.fiches) schema.fiches = [Object.fromEntries(FICHE_CHAMPS.map(([k, l]) => [k, l]))];
    if (s.pros) schema.pros = [{ nom: "Nom et prénom", profession: "Profession", rpps: "RPPS/ADELI si cité, sinon vide", role: "Rôle / référent" }];
    if (s.id !== "s0") schema.releve = { decisions: "une décision par ligne", actions: [{ prio: "1, 2 ou 3", quoi: "action", qui: "responsable", quand: "échéance" }], suspens: "points en suspens" };
    const ctx = [];
    if (st.f.s1_objectifs) ctx.push("Objectifs de la MSP : " + st.f.s1_objectifs);
    ["s2_axe1", "s2_axe2", "s2_axe3"].forEach((k, i) => { if (st.f[k]) ctx.push("Axe " + (i + 1) + " : " + st.f[k]); });
    if (s.fiches && st.fiches.length) current.fiches = st.fiches;
    if (s.pros && st.pros.length) current.pros = st.pros;
    return `Tu es l'assistant de rédaction du projet de santé de la MSP « ${st.m.msp || "[nom de la MSP]"} »${st.m.commune ? " (" + st.m.commune + ")" : ""}, accompagnée par la FEMAS Hauts-de-France dans le cadre de la démarche Territoire Tremplin.

CONTEXTE
- Étape : ${s.long}
- Objectif de l'étape : ${s.objectif}
- Sections de la trame concernées : ${s.trame}
- Profil d'accompagnement de l'équipe : ${p ? p + " — " + PROFILS[p].nom : "non défini"}
${ctx.length ? ctx.map((c) => "- " + c).join("\n") + "\n" : ""}- Informations à récupérer : ${s.recup.join(" ; ")}.

TA MISSION
1. Lis la transcription / les notes ci-dessous (captation Upmeet de la séance${s.id === "s0" ? " ou extraits du diagnostic territorial" : ""}).
2. Rédige chaque rubrique en français, dans un style clair et professionnel adapté à un projet de santé déposé à l'ARS : phrases complètes, fidèles à ce qui a été dit, sans rien inventer. Si une information manque, écris « À compléter : … » en précisant ce qui manque.
3. Conserve et enrichis le contenu déjà saisi (fourni plus bas) plutôt que de l'écraser.
4. Ne mentionne aucune donnée identifiant un patient.

FORMAT DE RÉPONSE OBLIGATOIRE
Réponds UNIQUEMENT avec un objet JSON valide (sans texte autour), avec exactement ces clés :
${JSON.stringify(schema, null, 2)}

CONTENU DÉJÀ SAISI
${Object.keys(current).length ? JSON.stringify(current, null, 2) : "(rien pour l'instant)"}

TRANSCRIPTION / NOTES DE LA SÉANCE
"""
${st.f["_transcript_" + s.id] || "[colle ici la transcription Upmeet ou tes notes]"}
"""`;
  }
  function paneClaude(s) {
    return `<div class="grid g2">
      <div class="card">
        <h4>1 · Collez la captation Upmeet (ou vos notes)</h4>
        <textarea rows="10" data-k="_transcript_${s.id}" placeholder="Transcription ou synthèse Upmeet de la séance…">${esc(st.f["_transcript_" + s.id] || "")}</textarea>
        <h4 style="margin-top:14px">2 · Copiez le prompt et envoyez-le à Claude</h4>
        <div class="row" style="margin-bottom:8px"><button class="btn" data-copy-prompt="${s.id}">📋 Copier le prompt</button><a class="btn ghost" href="https://claude.ai/new" target="_blank" rel="noopener">Ouvrir Claude ↗</a></div>
        <details><summary class="muted" style="cursor:pointer">Voir le prompt généré</summary><pre class="prompt" id="promptbox">${esc(buildPrompt(s))}</pre></details>
        <p class="muted" style="font-size:13px">Astuce : dans le projet Claude « Accompagnement TREMPLIN », la trame et les exemples sont déjà disponibles comme contexte.</p>
      </div>
      <div class="card">
        <h4>3 · Collez la réponse JSON de Claude</h4>
        <textarea rows="12" id="claudeResp" placeholder='{ "${s.fields[0] ? s.fields[0].k : "cle"}": "…" }'></textarea>
        <label class="row" style="margin:10px 0;font-size:14px"><input type="checkbox" id="claudeOverwrite"> Remplacer le contenu déjà saisi (sinon, seules les rubriques vides sont remplies)</label>
        <button class="btn vert" data-import-claude="${s.id}">⬇ Importer dans la trame</button>
        <div id="importRes" class="muted" style="margin-top:10px;font-size:13.5px"></div>
      </div>
    </div>`;
  }
  function importClaude(sid) {
    const s = SEQ[sid];
    const raw = $("#claudeResp").value;
    const over = $("#claudeOverwrite").checked;
    let data;
    try {
      const a = raw.indexOf("{"), b = raw.lastIndexOf("}");
      data = JSON.parse(raw.slice(a, b + 1));
    } catch (e) { $("#importRes").innerHTML = `<span style="color:var(--err)">JSON illisible : vérifiez que vous avez copié toute la réponse de Claude.</span>`; return; }
    let n = 0;
    s.fields.forEach((f) => { const v = data[f.k]; if (filled(v) && (over || !filled(st.f[f.k]))) { st.f[f.k] = Array.isArray(v) ? v.join("\n") : String(v); n++; } });
    if (s.fiches && Array.isArray(data.fiches)) {
      data.fiches.forEach((fi, i) => {
        if (!st.fiches[i]) st.fiches[i] = {};
        FICHE_CHAMPS.forEach(([k]) => { const v = fi[k]; if (filled(v) && (over || !filled(st.fiches[i][k]))) { st.fiches[i][k] = Array.isArray(v) ? v.join("\n") : String(v); n++; } });
      });
    }
    if (s.pros && Array.isArray(data.pros)) {
      data.pros.forEach((p) => {
        if (!filled(p.nom)) return;
        const ex = st.pros.find((x) => (x.nom || "").toLowerCase().trim() === p.nom.toLowerCase().trim());
        if (ex) { ["profession", "rpps", "role"].forEach((k) => { if (filled(p[k]) && (over || !filled(ex[k]))) ex[k] = p[k]; }); }
        else st.pros.push({ nom: p.nom, profession: p.profession || "", rpps: p.rpps || "", role: p.role || "" });
        n++;
      });
    }
    if (data.releve && sid !== "s0") {
      const r = relev(sid), d = data.releve;
      if (filled(d.decisions) && (over || !filled(r.decisions))) { r.decisions = Array.isArray(d.decisions) ? d.decisions.join("\n") : d.decisions; n++; }
      if (filled(d.suspens) && (over || !filled(r.suspens))) { r.suspens = Array.isArray(d.suspens) ? d.suspens.join("\n") : d.suspens; n++; }
      if (Array.isArray(d.actions)) { d.actions.forEach((a) => { if (filled(a.quoi)) { r.actions.push({ prio: a.prio || 1, quoi: a.quoi, qui: a.qui || "", quand: a.quand || "" }); n++; } }); }
    }
    save(true);
    $("#importRes").innerHTML = `<span style="color:var(--ok);font-weight:600">✓ ${n} élément(s) importé(s).</span> <a href="#${sid}/${sid === "s0" ? "saisie" : "seance"}">Relire dans la trame →</a>`;
    renderNav(); updateProgress();
  }

  /* --- Note d'inter-séance --- */
  function noteHTML(s) {
    const r = relev(s.id);
    const i = SEANCES.findIndex((x) => x.id === s.id), next = SEANCES[i + 1];
    const p = profil();
    const decisions = (r.decisions || "").split("\n").map((x) => x.trim()).filter(Boolean);
    const acts = (r.actions || []).filter((a) => filled(a.quoi) && !a.fait);
    const byPrio = [1, 2, 3].map((n) => acts.filter((a) => String(a.prio || 1) === String(n)));
    const prioLbl = ["Priorité 1 — ce qui débloque le dossier", "Priorité 2 — à formaliser", "Priorité 3 — à anticiper"];
    const nextLabel = next ? (next.id === "s5" ? "Séance 5 — Restitution" : "Atelier " + next.num + " — " + next.titre) : "Dépôt du projet de santé";
    const dateNext = r.prochaine || (next && st.m.dates[next.id]);
    return `
      <p style="color:#646a82;font-size:12px;margin:0">FEMAS Hauts-de-France · Territoire Tremplin</p>
      <h2 style="color:#2150b5;margin:.2em 0">NOTE D'INTER-SESSION</h2>
      <h3 style="margin:0 0 .6em">${s.id === "s5" ? "Après la restitution" : "Atelier " + s.num + " → " + (next ? "Atelier " + next.num : "suite")} — ${esc(st.m.msp || "MSP")}</h3>
      <p>Bonjour à tous, merci pour cet atelier ${esc(s.num)}. Vous trouverez ci-dessous ce qui a été acté, ce qu'il reste à faire d'ici ${next ? "l'atelier " + next.num : "la suite"}, et les documents joints. Rien n'est un point de blocage : ce sont les jalons normaux de la création, et nous restons en appui.</p>
      <h3 style="color:#2150b5">1. Décisions actées en atelier ${esc(s.num)}</h3>
      ${decisions.length ? `<ul>${decisions.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` : `<p><i>À compléter dans l'onglet « Relevé de décisions ».</i></p>`}
      <h3 style="color:#2150b5">2. À faire d'ici ${next ? "l'atelier " + next.num : "la suite"}</h3>
      ${byPrio.map((list, k) => list.length ? `<p><b>${prioLbl[k]} :</b></p><ul>${list.map((a) => `<li>☐ <b>${esc(a.quoi)}</b>${a.qui ? " — " + esc(a.qui) : ""}${a.quand ? " (pour le " + esc(a.quand) + ")" : ""}</li>`).join("")}</ul>` : "").join("")}
      <p><b>Pour maintenir la dynamique :</b></p><ul>${s.interseance.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      ${p === "C" ? `<p><i>Nous proposons un court point téléphonique avec le pilote d'ici une quinzaine de jours pour faire le point ensemble.</i></p>` : p === "B" ? `<p><i>Nous vous transmettrons la trame pré-remplie avant la prochaine séance.</i></p>` : ""}
      ${r.suspens ? `<p><b>Points en suspens :</b><br>${nl2br(r.suspens)}</p>` : ""}
      <h3 style="color:#2150b5">3. Pièces jointes</h3>
      <ul>${(s.pj || []).map((x) => `<li>${esc(x)}</li>`).join("")}<li>Relevé de décisions de l'atelier ${esc(s.num)}</li></ul>
      <h3 style="color:#2150b5">4. Prochain rendez-vous</h3>
      <p><b>${esc(nextLabel)}</b>${dateNext ? " : " + esc(fmtDate(dateNext)) : " : date à confirmer"}.${next ? " " + esc(next.objectif) : ""}</p>
      <p><i>Comme d'habitude, nous reprenons tout ce qui a été dit pour alimenter et mettre en forme le projet de santé : vous n'avez qu'à nous transmettre les éléments ci-dessus. N'hésitez pas à revenir vers nous entre-temps. Belle continuation à l'équipe !</i></p>
      <p>${esc(st.m.porteuse || "")}${st.m.porteuse ? " — " : ""}FEMAS Hauts-de-France</p>`;
  }
  function paneNote(s) {
    return `<div class="row noprint" style="margin-bottom:12px">
        <button class="btn" data-export-note="${s.id}">⬇ Note en Word</button>
        <button class="btn ghost" data-copy-note="${s.id}">📋 Copier (pour un e-mail)</button>
        <a class="btn ghost" href="mailto:${esc(st.m.email || "")}?subject=${encodeURIComponent("Note d'inter-session — atelier " + s.num + " — MSP " + (st.m.msp || ""))}">✉ Préparer l'e-mail</a>
        <a class="btn ghost" href="#${s.id}/releve">← Compléter le relevé</a>
      </div>
      <div class="note-preview" id="notebox">${noteHTML(s)}</div>`;
  }

  /* --- Projet de santé compilé --- */
  function T(k, fallback) { return filled(st.f[k]) ? `<p>${nl2br(st.f[k])}</p>` : `<p style="color:#b45309"><i>${esc(fallback || "À compléter")}</i></p>`; }
  function projetHTML(forWord) {
    const m = st.m;
    const logo = new URL("logo-tremplin.png", location.href).href;
    const fiches = st.fiches.map((fi, i) => `<h3>Fiche-action n° ${i + 1}${fi.axe ? " — " + esc(fi.axe) : ""}</h3>
      <table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%">${FICHE_CHAMPS.map(([k, l]) => `<tr><td style="width:32%;background:#eef1f8"><b>${esc(l)}</b></td><td>${nl2br(fi[k] || "")}</td></tr>`).join("")}</table>`).join("");
    const pros = st.pros.length ? `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%"><tr style="background:#eef1f8"><th>Nom et prénom</th><th>Profession</th><th>RPPS / ADELI</th><th>Rôle / référent</th></tr>${st.pros.map((p) => `<tr><td>${esc(p.nom)}</td><td>${esc(p.profession)}</td><td>${esc(p.rpps)}</td><td>${esc(p.role)}</td></tr>`).join("")}</table>` : `<p style="color:#b45309"><i>Liste des professionnels à compléter</i></p>`;
    const sign = `<table border="1" cellspacing="0" cellpadding="10" style="border-collapse:collapse;width:100%"><tr style="background:#eef1f8"><th>Nom et prénom</th><th>Profession</th><th style="width:35%">Signature</th></tr>${(st.pros.length ? st.pros : [{}, {}, {}, {}]).map((p) => `<tr><td>${esc(p.nom || "")}</td><td>${esc(p.profession || "")}</td><td>&nbsp;<br>&nbsp;</td></tr>`).join("")}</table>`;
    const axes = ["s2_axe1", "s2_axe2", "s2_axe3"].filter((k) => filled(st.f[k])).map((k) => `<li>${esc(st.f[k])}</li>`).join("");
    return `
      <div style="text-align:center">
        <img src="${logo}" width="120" height="120" alt="" style="width:120px">
        <p style="color:#646a82;letter-spacing:.1em">MAISON DE SANTÉ PLURIPROFESSIONNELLE</p>
        <h1 style="color:#2150b5;font-size:28pt;margin:.2em 0">${esc(m.msp || "[Nom de la MSP]")}</h1>
        <p style="font-size:14pt">${esc(m.commune || "")}</p>
        <h2 style="color:#e61a7c">PROJET DE SANTÉ</h2>
        <p>${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</p>
        <p style="color:#646a82"><i>Démarche accompagnée par la FEMAS Hauts-de-France — Territoire Tremplin</i></p>
      </div>
      ${forWord ? '<br clear="all" style="page-break-before:always">' : "<hr>"}
      <h1>1. Préambule</h1>
      <h2>1.1 Contexte, émergence et objectifs du projet</h2>
      <h3>Histoire et genèse du regroupement</h3>${T("s1_histoire")}
      <h3>Attentes et motivations</h3>${T("s1_motivations")}
      <h3>Objectifs du projet de santé</h3>${T("s1_objectifs")}
      <h3>Ambitions et projets</h3>${T("s1_ambitions")}
      <h2>1.2 Gouvernance et pilotage du projet</h2>
      <p><b>Pilote :</b> ${esc(st.f.s1_pilote || "à compléter")}<br><b>Coordination :</b> ${esc(st.f.s1_coordinateur || m.coord || "à compléter")}</p>${T("s1_roles")}
      <h1>2. Diagnostic du territoire et besoins de santé</h1>
      <p><i>Le diagnostic territorial a été réalisé par la FEMAS Hauts-de-France (INSEE, CartoSanté, Rezone CPTS) puis confronté au vécu de l'équipe et à la voix des usagers.</i></p>
      <h2>2.1 Territoire de rayonnement de la MSP</h2>${T("s0_perimetre")}${T("s0_demo", "Données démographiques à compléter")}<h3>Regard de l'équipe</h3>${T("s2_territoire")}
      <h2>2.2 Caractéristiques de la patientèle et besoins de santé</h2>${T("s0_sante", "Données de santé à compléter")}<h3>Constats partagés</h3>${T("s2_constats")}<h3>Besoins de santé prioritaires</h3>${T("s2_besoins")}
      <h2>2.3 La voix de l'usager</h2>${filled(st.f.s1_usagers_mode) ? `<p><b>Modalités du recueil :</b> ${nl2br(st.f.s1_usagers_mode)}</p>` : ""}${T("s2_usagers")}<h3>Pistes d'amélioration suggérées</h3>${T("s2_usagers_pistes")}<h3>Implication des usagers</h3>${T("s2_usagers_implication")}
      <h2>2.4 Offre de soins du territoire</h2>${T("s0_offre", "Données d'offre de soins à compléter")}${T("s2_offre")}<h3>Partenaires et ressources mobilisables</h3>${T("s2_partenaires")}
      <h1>3. Objectifs et axes prioritaires</h1>
      <h2>3.1 Objectifs généraux et axes retenus</h2>${axes ? `<ol>${axes}</ol>` : `<p style="color:#b45309"><i>Axes à compléter</i></p>`}<h3>Méthode de priorisation</h3>${T("s2_priorisation")}<h3>Justification du choix des axes</h3>${T("s2_justif")}
      <h2>3.2 Fiches-actions par axe</h2>${fiches || `<p style="color:#b45309"><i>Fiches-actions à compléter</i></p>`}<h3>Partenaires à mobiliser</h3>${T("s3_carto")}
      <h1>4. Projet professionnel</h1>
      <h2>4.1 Référents et offre de services</h2>${pros}${T("s4_adresses")}
      <h2>4.2 Coordination et management de la structure</h2>${T("s4_coordination")}${filled(st.f.s4_temps_coord) ? `<p><b>Temps de coordination :</b> ${esc(st.f.s4_temps_coord)}</p>` : ""}
      <h2>4.3 Structure juridique (SISA) et financements ACI</h2>${T("s4_sisa")}<h3>Financements ACI</h3>${T("s4_aci")}<h3>Calendrier de constitution</h3>${T("s4_sisa_ec")}
      <h2>4.4 Organisation de la pluriprofessionnalité</h2><h3>Réunions de concertation pluriprofessionnelle</h3>${T("s4_rcp")}<h3>Protocoles pluriprofessionnels</h3>${T("s4_protocoles")}<h3>Système d'information partagé</h3>${T("s4_si")}<h3>Partage des données et information du patient</h3>${T("s4_partage")}
      <h2>4.5 Développement professionnel continu et démarche qualité</h2>${T("s4_dpc")}${T("s4_qualite")}
      <h1>5. Projet d'organisation de la prise en charge</h1>
      <h2>5.1 Accès aux soins</h2><h3>Horaires, rendez-vous, visites à domicile</h3>${T("s4_horaires")}<h3>Soins non programmés, continuité et permanence des soins</h3>${T("s4_snp")}<h3>Accessibilité</h3>${T("s4_accessibilite")}
      <h2>5.2 Qualité de la prise en charge et réponse aux crises</h2><h3>Actions de santé publique</h3>${T("s4_santepub")}<h3>Réponse aux crises sanitaires graves</h3>${T("s4_crises")}
      <h1>6. Signature des professionnels de santé</h1>${sign}
      <h1>7. Annexes</h1>
      <h2>7.1 Calendrier prévisionnel de montée en charge</h2>${planTable().replace(/class="tblwrap"/g, "").replace(/class="t"/g, 'border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%"')}
      <p><b>Transmission à l'ARS :</b> ${esc(st.f.s5_date_ars ? fmtDate(st.f.s5_date_ars) : "date à fixer")}</p>${T("s5_suivi")}`;
  }
  function viewProjet() {
    const sc = confScore();
    return `<div class="stephead" style="--c:var(--bleu)"><div class="num">📄</div><div><h2>Projet de santé — ${esc(st.m.msp || "MSP")}</h2><p>Compilé automatiquement à partir de toutes les séances, dans la structure de la trame FEMAS. Les zones orange restent à compléter.</p></div><div class="prog"><b>${sc.pct} %</b><div class="bar"><i style="width:${sc.pct}%"></i></div><small>conformité ARS</small></div></div>
    <div class="row noprint" style="margin-bottom:12px"><button class="btn" data-export-projet>⬇ Télécharger en Word</button><button class="btn ghost" onclick="window.print()">🖨 Imprimer / PDF</button><a class="btn ghost" href="#conformite">Vérifier la conformité →</a></div>
    <div class="card note-preview" style="max-height:none">${projetHTML(false)}</div>`;
  }

  /* --- Conformité ARS --- */
  const allF = (...ks) => ks.every((k) => filled(st.f[k]));
  const fichesOk = (fn) => st.fiches.length > 0 && st.fiches.every(fn);
  const CONF = [
    ["1. Préambule et objectifs", [
      ["Contexte, genèse du regroupement et objectifs de la MSP", () => allF("s1_histoire", "s1_objectifs"), "s1"],
      ["Périmètre et ambitions du projet", () => allF("s1_ambitions"), "s1"]]],
    ["2. Diagnostic et axes prioritaires", [
      ["Diagnostic territorial (démographie, besoins, offre de soins)", () => (filled(st.f.s0_demo) || filled(st.f.s2_territoire)) && filled(st.f.s2_besoins) && (filled(st.f.s0_offre) || filled(st.f.s2_offre)), "s2"],
      ["Voix de l'usager prise en compte", () => allF("s2_usagers"), "s2"],
      ["2 à 3 axes prioritaires retenus ET justifiés", () => allF("s2_axe1", "s2_axe2", "s2_justif"), "s2"]]],
    ["3. Fiches-actions (qualité)", [
      ["Objectif général et objectifs opérationnels (SMART)", () => fichesOk((f) => filled(f.objGen) && filled(f.objOp)), "s3"],
      ["Public cible et implication des usagers précisés", () => fichesOk((f) => filled(f.public) && filled(f.usagers)), "s3"],
      ["Professionnels concernés et partenaires identifiés", () => fichesOk((f) => filled(f.pros) && filled(f.partenaires)), "s3"],
      ["Au moins un indicateur de suivi par action", () => fichesOk((f) => filled(f.indicateurs)), "s3"],
      ["Un porteur et un calendrier pour chaque action", () => fichesOk((f) => filled(f.referents) && filled(f.calendrier)), "s3"]]],
    ["4. Projet professionnel", [
      ["Liste des professionnels avec RPPS / ADELI et référents", () => st.pros.length > 0 && st.pros.every((p) => filled(p.rpps)), "s4"],
      ["Coordination et fonction de coordination décrites", () => allF("s4_coordination"), "s4"],
      ["Réunions de concertation pluripro et protocoles", () => allF("s4_rcp", "s4_protocoles"), "s4"],
      ["Système d'information partagé labellisé ANS", () => allF("s4_si"), "s4"],
      ["Structure juridique (SISA) constituée ou en cours, financements ACI", () => allF("s4_sisa", "s4_aci"), "s4"],
      ["Développement professionnel continu et accueil d'étudiants", () => allF("s4_dpc"), "s4"]]],
    ["5. Organisation de la prise en charge", [
      ["Horaires, prise de RDV, visites à domicile", () => allF("s4_horaires"), "s4"],
      ["Soins non programmés, continuité et permanence des soins", () => allF("s4_snp"), "s4"],
      ["Accessibilité physique et financière", () => allF("s4_accessibilite"), "s4"],
      ["Réponse aux crises sanitaires graves", () => allF("s4_crises"), "s4"]]],
    ["6. Usagers, qualité et finalisation", [
      ["Démarche qualité et implication des usagers formalisées", () => allF("s4_qualite") && (filled(st.f.s2_usagers_implication) || fichesOk((f) => filled(f.usagers))), "s4"],
      ["Signatures de l'ensemble des professionnels", () => st.pros.length > 0 && st.pros.every((p) => p.signe), "s5"],
      ["Calendrier prévisionnel de montée en charge", () => fichesOk((f) => filled(f.calendrier)) && allF("s5_date_ars"), "s5"]]]
  ];
  function confScore() {
    let tot = 0, pres = 0, conf = 0;
    CONF.forEach(([, items]) => items.forEach(([l, fn], j) => { tot++; const ok = fn(); if (ok) pres++; if (ok && st.conf[l]) conf++; }));
    return { tot, pres, conf, pct: tot ? Math.round((pres / tot) * 100) : 0 };
  }
  function viewConformite() {
    const sc = confScore();
    const green = sc.conf === sc.tot;
    return `<div class="stephead" style="--c:var(--vert)"><div class="num">✓</div><div><h2>Grille de conformité ARS</h2><p>« Présent » est calculé automatiquement à partir de la trame. Cochez « Conforme » lorsque la qualité est suffisante.</p></div><div class="prog"><b>${sc.pres}/${sc.tot} présents</b><div class="bar"><i style="width:${sc.pct}%"></i></div><small>${sc.conf}/${sc.tot} conformes</small></div></div>
    ${CONF.map(([titre, items]) => `<div class="card" style="margin-bottom:14px"><h4>${esc(titre)}</h4><div class="tblwrap"><table class="t conf"><thead><tr><th>Élément attendu</th><th>Statut</th><th>Conforme</th><th></th></tr></thead><tbody>
      ${items.map(([l, fn, sid]) => { const ok = fn(); return `<tr><td>${esc(l)}</td><td class="st"><span class="dot ${ok ? "ok" : "ko"}"></span>${ok ? "Présent" : "À compléter"}</td><td><input type="checkbox" data-conf="${esc(l)}" ${st.conf[l] ? "checked" : ""} ${ok ? "" : "disabled"}></td><td><a href="#${sid}/${sid === "s0" ? "saisie" : "seance"}">Compléter →</a></td></tr>`; }).join("")}
    </tbody></table></div></div>`).join("")}
    <div class="card" style="border:2px solid ${green ? "var(--vert)" : "var(--line)"}">
      <h3>${green ? "🟢 Feu vert pour la transmission" : "Feu vert pour la transmission"}</h3>
      <p>${green ? "Toutes les rubriques sont conformes : le projet est prêt à être transmis à l'ARS." : `Encore ${sc.tot - sc.conf} rubrique(s) à rendre conforme(s) avant transmission.`}</p>
      <div class="cols2"><div class="f"><label>Date de transmission visée</label><input type="date" data-k="s5_date_ars" value="${esc(st.f.s5_date_ars || "")}"></div><div class="f"><label>Vérifié par</label><input type="text" data-k="_verif" value="${esc(st.f._verif || "")}"></div></div>
      <div class="row"><a class="btn" href="#projet">Voir / exporter le projet de santé</a><button class="btn ghost" data-export-conf>⬇ Grille en Word</button></div>
    </div>
    <div class="box vert" style="margin-top:16px"><h4>Après la démarche — faire vivre le projet</h4><ul class="plain">${SEQ.s5.interseance.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
  }

  /* --- Outils --- */
  function viewOutils() {
    const bySeance = SEANCES.filter((s) => s.id !== "s0").map((s) => `<div class="card"><h4 style="color:${s.couleur}">Séance ${s.num} — ${esc(s.titre)}</h4><ul class="plain">${Object.values(OUTILS).filter((t) => t.s === s.id).map((t) => `<li><b>${esc(t.nom)}</b> <span class="muted">(${esc(t.duree)} · ${t.reco.split("").join("/")})</span> — ${esc(t.desc)}</li>`).join("")}</ul></div>`).join("");
    return `<div class="stephead" style="--c:var(--ink)"><div class="num">🧰</div><div><h2>Outils, sauvegarde & partage</h2><p>Exportez un dossier pour le transmettre à une collègue (continuité, doublon de salariée) ou le sauvegarder.</p></div></div>
    <div class="grid g3">
      <div class="card"><h4>Sauvegarder / partager</h4>
        <p class="muted" style="font-size:13.5px">Les données sont enregistrées automatiquement dans ce navigateur. Exportez-les pour les conserver ou les partager.</p>
        <div class="row"><button class="btn" data-export-json="one">⬇ Cette MSP (.json)</button><button class="btn ghost" data-export-json="all">⬇ Toutes les MSP</button></div>
        <h4 style="margin-top:14px">Importer</h4><input type="file" id="importFile" accept=".json,application/json"><p class="muted" style="font-size:13px">Un dossier importé s'ajoute à la liste (ou remplace celui qui porte le même identifiant).</p>
      </div>
      <div class="card"><h4>Les 14 outils du kit FEMAS</h4>${KIT.map(([g, l]) => `<p style="margin:.4em 0"><b>${esc(g)}</b><br><span class="muted" style="font-size:13.5px">${l.map(esc).join(" · ")}</span></p>`).join("")}</div>
      <div class="card"><h4>Gérer le dossier</h4>
        <p><b>${esc(st.m.msp || "MSP sans nom")}</b></p>
        <div class="row"><button class="btn ghost" data-dup>Dupliquer</button><button class="btn ghost" data-del-dossier style="color:var(--err)">Supprimer ce dossier</button></div>
        <h4 style="margin-top:14px">Confidentialité</h4><p class="muted" style="font-size:13.5px">Aucune donnée n'est envoyée sur un serveur. Ne saisissez aucune donnée identifiant un patient (verbatims anonymisés).</p>
      </div>
    </div>
    <h3 style="margin-top:22px">Catalogue des outils d'animation</h3><div class="grid g2">${bySeance}</div>`;
  }

  /* ---------------- EXPORTS ---------------- */
  function downloadDoc(name, body) {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${esc(name)}</title>
    <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
    <style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.4}h1{color:#2150b5;font-size:18pt;border-bottom:2px solid #2150b5;padding-bottom:4pt;margin-top:18pt}h2{color:#e61a7c;font-size:14pt;margin-top:14pt}h3{color:#23273a;font-size:12pt;margin-top:10pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #9aa3bd;padding:5pt;vertical-align:top;font-size:10.5pt}th{background:#eef1f8}</style></head><body>${body}</body></html>`;
    const blob = new Blob(["﻿", html], { type: "application/msword" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name.replace(/[\\/:*?"<>|]/g, "-") + ".doc"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function downloadJSON(name, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name + ".json"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function releveHTML(sid) {
    const s = SEQ[sid], r = relev(sid);
    return `<h1>Relevé de décisions</h1><h2>${esc(s.long)} — MSP ${esc(st.m.msp || "")}</h2>
      <table><tr><td><b>Date</b></td><td>${esc(fmtDate(r.date || st.m.dates[sid]))}</td></tr><tr><td><b>Animateur</b></td><td>${esc(r.animateur || "")}</td></tr><tr><td><b>Présents</b></td><td>${nl2br(r.presents || "")}</td></tr><tr><td><b>Excusés</b></td><td>${nl2br(r.excuses || "")}</td></tr></table>
      <h3>Décisions prises</h3><ul>${(r.decisions || "").split("\n").filter((x) => x.trim()).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <h3>Actions à mener</h3><table><tr><th>Priorité</th><th>Quoi</th><th>Qui</th><th>Pour quand</th></tr>${(r.actions || []).map((a) => `<tr><td>${esc(a.prio || 1)}</td><td>${esc(a.quoi)}</td><td>${esc(a.qui)}</td><td>${esc(a.quand)}</td></tr>`).join("")}</table>
      <h3>Points en suspens</h3><p>${nl2br(r.suspens || "")}</p><p><b>Prochaine séance :</b> ${esc(fmtDate(r.prochaine || nextDate(sid)))}</p>`;
  }
  async function copyRich(html, text) {
    try {
      if (window.ClipboardItem) { await navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })]); }
      else await navigator.clipboard.writeText(text);
      toast("Copié dans le presse-papiers");
    } catch (e) { toast("Copie impossible — utilisez l'export Word"); }
  }

  /* ---------------- TIMER ---------------- */
  const timer = { sid: null, running: false, start: 0, acc: 0, iv: null };
  const elapsed = () => timer.acc + (timer.running ? Date.now() - timer.start : 0);
  const fmtClock = (ms) => { const t = Math.floor(ms / 1000); return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0"); };
  function tick() {
    const c = $("#clock"); if (!c || timer.sid !== currentSid()) return;
    const ms = elapsed(); c.textContent = fmtClock(ms);
    const min = ms / 60000; let cur = null;
    $$("#deroule tr[data-row]").forEach((tr) => { const a = +tr.dataset.a, b = +tr.dataset.b; tr.classList.toggle("now", min >= a && min < b); tr.classList.toggle("past", min >= b); if (min >= a && min < b) cur = tr; });
    const n = $("#clocknow");
    if (n) n.innerHTML = cur ? `<small>Séquence en cours · reste ${Math.max(0, Math.ceil(+cur.dataset.b - min))} min</small><b>${esc(cur.children[1].textContent)}</b>` : min >= 90 ? "<small>Séance terminée</small><b>Clôture !</b>" : `<small>Séquence en cours</small>${timer.running ? "" : "Chrono à l'arrêt"}`;
  }
  const currentSid = () => (location.hash || "").slice(1).split("/")[0];

  /* ---------------- ROUTER ---------------- */
  function render() {
    const [view, tab] = (location.hash || "#accueil").slice(1).split("/");
    let html;
    if (view === "dossier") html = viewDossier();
    else if (SEQ[view]) html = viewSeance(view, tab);
    else if (view === "projet") html = viewProjet();
    else if (view === "conformite") html = viewConformite();
    else if (view === "outils") html = viewOutils();
    else html = viewAccueil();
    $("#app").innerHTML = html;
    renderNav();
    if (SEQ[view]) tick();
  }
  function rerender(keepScroll) { const y = window.scrollY; render(); if (keepScroll) window.scrollTo(0, y); }
  function updateProgress() {
    SEANCES.forEach((s) => { const p = progress(s.id); const a = $("#prog-" + s.id), b = $("#progbar-" + s.id); if (a) a.textContent = p + " %"; if (b) b.style.width = p + "%"; });
  }
  window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });

  /* ---------------- ÉVÉNEMENTS ---------------- */
  const app = $("#app");
  app.addEventListener("input", (e) => {
    const t = e.target, d = t.dataset;
    if (d.k) { st.f[d.k] = t.value; const box = t.closest(".f"); if (box) box.classList.toggle("filled", filled(t.value)); if (d.k.startsWith("_transcript_")) { const pb = $("#promptbox"); if (pb) pb.textContent = buildPrompt(SEQ[d.k.replace("_transcript_", "")]); } }
    else if (d.m) { st.m[d.m] = t.value; if (d.m === "msp") renderNav(); if (d.m === "profil") return rerender(true); }
    else if (d.date) { st.m.dates[d.date] = t.value; }
    else if (d.r) { const [sid, prop] = d.r.split("."); relev(sid)[prop] = t.value; }
    else if (d.fiche) { const [i, k] = d.fiche.split("."); st.fiches[+i][k] = t.value; const box = t.closest(".f"); if (box) box.classList.toggle("filled", filled(t.value)); }
    else if (d.pro) { const [i, k] = d.pro.split("."); st.pros[+i][k] = t.value; }
    else if (d.act) { const [sid, i, k] = d.act.split("."); relev(sid).actions[+i][k] = t.value; }
    else return;
    save(); updateProgress();
  });
  app.addEventListener("change", (e) => {
    const t = e.target, d = t.dataset;
    if (d.c) { st.c[d.c] = t.checked; t.closest("li").classList.toggle("done", t.checked); }
    else if (d.q) { st.m.q[d.q] = t.value; save(); return rerender(true); }
    else if (d.proSign != null) { st.pros[+d.proSign].signe = t.checked; }
    else if (d.actDone) { const [sid, i] = d.actDone.split("."); relev(sid).actions[+i].fait = t.checked; }
    else if (d.conf) { st.conf[d.conf] = t.checked; save(); return rerender(true); }
    else if (t.id === "importFile") { return importFile(t.files[0]); }
    else if (d.m || d.date || d.r || d.act) { save(); if (d.m === "statut") rerender(true); return; }
    else return;
    save(); updateProgress(); renderNav();
  });
  app.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab],[data-tool],[data-add-fiche],[data-del-fiche],[data-add-pro],[data-del-pro],[data-add-act],[data-del-act],[data-timer],[data-timer-reset],[data-copy-prompt],[data-import-claude],[data-export-note],[data-copy-note],[data-export-releve],[data-export-projet],[data-export-conf],[data-export-json],[data-del-dossier],[data-dup],[data-open]");
    if (!b) return;
    const d = b.dataset;
    if (d.tab) { location.hash = d.tab; return; }
    if (d.open) { switchTo(d.open); return; }
    if (d.tool) { const [sid, id] = d.tool.split(":"); const a = st.o[sid] = st.o[sid] || []; const i = a.indexOf(id); i >= 0 ? a.splice(i, 1) : a.push(id); save(); return rerender(true); }
    if (d.addFiche != null) { st.fiches.push({}); save(); return rerender(true); }
    if (d.delFiche != null) { if (confirm("Supprimer cette fiche-action ?")) { st.fiches.splice(+d.delFiche, 1); save(); rerender(true); } return; }
    if (d.addPro != null) { st.pros.push({ nom: "", profession: "", rpps: "", role: "" }); save(); return rerender(true); }
    if (d.delPro != null) { st.pros.splice(+d.delPro, 1); save(); return rerender(true); }
    if (d.addAct) { relev(d.addAct).actions.push({ prio: 1, quoi: "", qui: "", quand: "" }); save(); return rerender(true); }
    if (d.delAct) { const [sid, i] = d.delAct.split("."); relev(sid).actions.splice(+i, 1); save(); return rerender(true); }
    if (d.timer) {
      if (timer.sid !== d.timer) { timer.sid = d.timer; timer.acc = 0; timer.running = false; }
      if (timer.running) { timer.acc += Date.now() - timer.start; timer.running = false; } else { timer.start = Date.now(); timer.running = true; }
      clearInterval(timer.iv); if (timer.running) timer.iv = setInterval(tick, 1000);
      b.textContent = timer.running ? "⏸ Pause" : "▶ Reprendre"; b.classList.toggle("vert", !timer.running); b.classList.toggle("ghost", timer.running); tick(); return;
    }
    if (d.timerReset) { clearInterval(timer.iv); timer.sid = d.timerReset; timer.acc = 0; timer.running = false; return rerender(true); }
    if (d.copyPrompt) { const txt = buildPrompt(SEQ[d.copyPrompt]); navigator.clipboard.writeText(txt).then(() => toast("Prompt copié — collez-le dans Claude"), () => toast("Copie impossible")); return; }
    if (d.importClaude) { importClaude(d.importClaude); return; }
    if (d.exportNote) { downloadDoc("Note inter-session atelier " + SEQ[d.exportNote].num + " - " + (st.m.msp || "MSP"), noteHTML(SEQ[d.exportNote])); return; }
    if (d.copyNote) { const box = $("#notebox"); copyRich(box.innerHTML, box.innerText); return; }
    if (d.exportReleve) { downloadDoc("Releve de decisions S" + SEQ[d.exportReleve].num + " - " + (st.m.msp || "MSP"), releveHTML(d.exportReleve)); return; }
    if (d.exportProjet != null) { downloadDoc("Projet de sante - " + (st.m.msp || "MSP"), projetHTML(true)); return; }
    if (d.exportConf != null) { downloadDoc("Grille conformite ARS - " + (st.m.msp || "MSP"), confWord()); return; }
    if (d.exportJson) { const slug = (st.m.msp || "msp").replace(/\s+/g, "-"); if (d.exportJson === "one") downloadJSON("projet-sante-" + slug + "-" + new Date().toISOString().slice(0, 10), { version: 1, dossiers: { [st.id]: st } }); else downloadJSON("projets-sante-toutes-MSP-" + new Date().toISOString().slice(0, 10), { version: 1, dossiers: store.dossiers }); return; }
    if (d.dup != null) { const c = JSON.parse(JSON.stringify(st)); c.id = "msp_" + Date.now().toString(36); c.m.msp = (c.m.msp || "MSP") + " (copie)"; store.dossiers[c.id] = c; switchTo(c.id); return; }
    if (d.delDossier != null) {
      if (!confirm("Supprimer définitivement le dossier « " + (st.m.msp || "MSP sans nom") + " » ? Pensez à l'exporter avant.")) return;
      delete store.dossiers[st.id];
      if (!Object.keys(store.dossiers).length) { const n = blankDossier(""); store.dossiers[n.id] = n; }
      switchTo(Object.keys(store.dossiers)[0]); return;
    }
  });
  function confWord() {
    return `<h1>Grille de conformité ARS</h1><h2>MSP ${esc(st.m.msp || "")}</h2>${CONF.map(([t, items]) => `<h3>${esc(t)}</h3><table><tr><th>Élément attendu</th><th>Présent</th><th>Conforme</th></tr>${items.map(([l, fn]) => `<tr><td>${esc(l)}</td><td>${fn() ? "☑" : "☐ à compléter"}</td><td>${fn() && st.conf[l] ? "☑" : "☐"}</td></tr>`).join("")}</table>`).join("")}<p><b>Date de transmission visée :</b> ${esc(fmtDate(st.f.s5_date_ars))} — <b>Vérifié par :</b> ${esc(st.f._verif || "")}</p>`;
  }
  function importFile(file) {
    if (!file) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const data = JSON.parse(rd.result); const ds = data.dossiers || (data.m ? { [data.id || "msp_" + Date.now().toString(36)]: data } : null);
        if (!ds) throw new Error();
        let last; Object.values(ds).forEach((d) => { if (!d.id) d.id = "msp_" + Math.random().toString(36).slice(2); ["f", "c", "o", "r", "conf"].forEach((k) => d[k] = d[k] || {}); d.fiches = d.fiches || []; d.pros = d.pros || []; d.m.q = d.m.q || {}; d.m.dates = d.m.dates || {}; store.dossiers[d.id] = d; last = d.id; });
        switchTo(last); toast(Object.keys(ds).length + " dossier(s) importé(s)");
      } catch (e) { toast("Fichier non reconnu"); }
    };
    rd.readAsText(file);
  }
  function switchTo(id) { store.current = id; st = store.dossiers[id]; save(true); rerender(); }

  $("#dossierSel").addEventListener("change", (e) => switchTo(e.target.value));
  $("#newDossier").addEventListener("click", () => {
    const nom = prompt("Nom de la nouvelle MSP accompagnée :"); if (nom == null) return;
    const d = blankDossier(nom.trim()); store.dossiers[d.id] = d; switchTo(d.id); location.hash = "dossier";
  });

  render();
})();
