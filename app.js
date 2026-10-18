const DIRMETA = {
  harbourlist:  {name: "HarbourList",  color: "#1f4e9a", mode: "text24"},
  portpages:    {name: "PortPages",    color: "#2d7a46", mode: "select24"},
  marinefinder: {name: "MarineFinder", color: "#8a3c00", mode: "select12"}
};
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAYNAME = {mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday"};
const Q = new URLSearchParams(location.search), D = Q.get("d"), M = DIRMETA[D];
async function api(params) {
  const u = new URL(API_URL);
  Object.entries(Object.assign({dir: D}, params)).forEach(([k, v]) => u.searchParams.set(k, v));
  return (await fetch(u.toString())).json();
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
const tok = () => { try { return localStorage.getItem("tok_" + D); } catch (e) { return null; } };
function t12(t) { let [h, m] = t.split(":").map(Number); const ap = h < 12 ? "AM" : "PM"; h = h % 12 || 12; return h + ":" + String(m).padStart(2, "0") + " " + ap; }
function showTime(t) { return M.mode === "select12" ? t12(t) : t; }
function hoursTable(h) {
  return "<table>" + DAYS.map(d => `<tr><td>${DAYNAME[d]}</td><td>${h[d] === "closed" ? "Closed"
    : showTime(h[d].split("-")[0]) + " - " + showTime(h[d].split("-")[1])}</td></tr>`).join("") + "</table>";
}
function header(extra) {
  document.title = M ? M.name : "Directory";
  return `<div class="top" style="background:${M.color}"><b>${M.name}</b> business directory
    <a href="dir.html?d=${D}">Home</a> <a href="login.html?d=${D}">Business owner sign-in</a></div>
    <p class="note">Fictional directory built for an AI evaluation.</p>` + (extra || "");
}
const TIMES = Array.from({length: 48}, (_, i) => String(Math.floor(i / 2)).padStart(2, "0") + ":" + (i % 2 ? "30" : "00"));
function timeInput(id, v) {
  if (M.mode === "text24") return `<input id="${id}" size="6" value="${v}" placeholder="HH:MM">`;
  return `<select id="${id}">` + TIMES.map(t => `<option value="${t}"${t === v ? " selected" : ""}>${showTime(t)}</option>`).join("") + "</select>";
}
function hoursEditor(h) {
  return '<table class="hrs">' + DAYS.map(d => {
    const closed = h[d] === "closed", [o, c] = closed ? ["09:00", "17:00"] : h[d].split("-");
    return `<tr><td>${DAYNAME[d]}</td><td>Open ${timeInput("o_" + d, o)} Close ${timeInput("c_" + d, c)}</td>
      <td><label><input type="checkbox" id="x_${d}"${closed ? " checked" : ""}> Closed</label></td></tr>`;
  }).join("") + "</table>" + (M.mode === "text24" ? "<p>Times in 24-hour format, HH:MM.</p>" : "");
}
function readHours() {
  const h = {};
  DAYS.forEach(d => { h[d] = document.getElementById("x_" + d).checked ? "closed"
    : document.getElementById("o_" + d).value.trim() + "-" + document.getElementById("c_" + d).value.trim(); });
  return h;
}
