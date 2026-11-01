const LS = {
  reviewed: "zalidiff2_reviewed",
  filter: "zalidiff2_filter",
  sort: "zalidiff2_sort",
  hide: "zalidiff2_hide",
};
function lsGet(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

let ROWS = [], REVIEWED = lsGet(LS.reviewed, {}), FILTER = lsGet(LS.filter, "all"), SORT = lsGet(LS.sort, "sp9"), HIDE = lsGet(LS.hide, false);

const STATUS_ORDER = { "content": 1, "only-sep": 2, "only-oct": 3, "punct": 4, "spacing": 5, "case": 6, "verify-visual": 7 };

function init() {
  const c = document.getElementById("filters");
  const counts = {};
  ROWS.forEach(r => counts[r.status] = (counts[r.status] || 0) + 1);
  const btns = [["all", "все · " + ROWS.length], ["content", "содержание · " + (counts.content || 0)],
    ["punct", "пунктуация · " + (counts.punct || 0)], ["spacing", "пробелы · " + (counts.spacing || 0)],
    ["case", "регистр · " + (counts.case || 0)], ["only-sep", "только в 09.2026 · " + (counts["only-sep"] || 0)],
    ["only-oct", "только в 22.10 · " + (counts["only-oct"] || 0)], ["verify-visual", "проверить визуально · " + (counts["verify-visual"] || 0)]];
  btns.forEach(([k, label]) => {
    const b = document.createElement("button");
    b.className = "fbtn"; b.dataset.k = k; b.textContent = label;
    b.onclick = () => { FILTER = k; lsSet(LS.filter, k); render(); };
    c.appendChild(b);
  });
  const sel = document.getElementById("sortsel");
  sel.value = SORT;
  sel.onchange = () => { SORT = sel.value; lsSet(LS.sort, SORT); render(); };
  const hid = document.getElementById("hidedone");
  hid.checked = HIDE;
  hid.onchange = () => { HIDE = hid.checked; lsSet(LS.hide, HIDE); render(); };
  document.getElementById("reset").onclick = () => {
    if (confirm("Сбросить все отметки «просмотрено»?")) { REVIEWED = {}; lsSet(LS.reviewed, REVIEWED); render(); }
  };
  render();
}

function visibleRows() {
  let list = ROWS.filter(r => FILTER === "all" || r.status === FILTER);
  if (HIDE) list = list.filter(r => !REVIEWED[r.id]);
  if (SORT === "sp9") list.sort((a, b) => (a.sp || a.op) - (b.sp || b.op));
  else if (SORT === "sp10") list.sort((a, b) => (a.op || a.sp) - (b.op || b.sp));
  else if (SORT === "status") list.sort((a, b) => (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) || (a.sp || a.op) - (b.sp || b.op));
  return list;
}

function esc(s) { return s; }

function render() {
  document.querySelectorAll(".fbtn").forEach(b => b.classList.toggle("active", b.dataset.k === FILTER));
  const list = visibleRows();
  const tb = document.getElementById("tbody");
  tb.innerHTML = "";
  list.forEach(r => {
    const done = !!REVIEWED[r.id];
    const tr = document.createElement("tr");
    tr.className = r.status + (done ? " done" : "");
    tr.innerHTML =
      `<td class="chk"><input type="checkbox" ${done ? "checked" : ""} aria-label="просмотрено"></td>` +
      `<td class="num">${r.n}</td>` +
      `<td class="pg">${r.sp || "—"}</td>` +
      `<td class="pg">${r.op || "—"}</td>` +
      `<td><span class="chip ${r.status}">${r.status_ru}</span></td>` +
      `<td class="txt s" title="${esc(r.full_s).replace(/"/g, "&quot;")}">${r.sh}</td>` +
      `<td class="txt o" title="${esc(r.full_o).replace(/"/g, "&quot;")}">${r.oh}</td>`;
    tr.querySelector("input").onchange = (e) => {
      if (e.target.checked) REVIEWED[r.id] = 1; else delete REVIEWED[r.id];
      lsSet(LS.reviewed, REVIEWED);
      tr.classList.toggle("done", e.target.checked);
      updateCount();
      if (HIDE) render();
    };
    tb.appendChild(tr);
  });
  updateCount();
  document.getElementById("shown").textContent = `показано ${list.length} из ${ROWS.length}`;
}

function updateCount() {
  document.getElementById("cnt").textContent = Object.keys(REVIEWED).length;
}

fetch("rows.json").then(r => r.json()).then(d => {
  ROWS = d.rows;
  document.getElementById("total").textContent = ROWS.length;
  init();
});
