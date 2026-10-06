// ---------- 1. Data ----------
// students: [{ id: 1, name: "Riya" }]
// records:  { "2026-10-06": { 1: "P", 2: "A" } }   (P = present, A = absent)
let students = JSON.parse(localStorage.getItem("students")) || [];
let records = JSON.parse(localStorage.getItem("records")) || {};

// ---------- 2. Page elements ----------
const nameInput = document.getElementById("studentName");
const addBtn = document.getElementById("addBtn");
const dateInput = document.getElementById("dateInput");
const tableBody = document.getElementById("tableBody");
const summary = document.getElementById("summary");
const emptyMsg = document.getElementById("emptyMsg");

// Default date = today
dateInput.value = new Date().toISOString().slice(0, 10);

// ---------- 3. Save to browser ----------
function save() {
  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("records", JSON.stringify(records));
}

// ---------- 4. Add a student ----------
function addStudent() {
  const name = nameInput.value.trim();
  if (name === "") {
    alert("Please enter a student name.");
    return;
  }
  students.push({ id: Date.now(), name: name });
  nameInput.value = "";
  save();
  render();
}

// ---------- 5. Mark attendance ----------
function mark(id, status) {
  const date = dateInput.value;
  if (!records[date]) records[date] = {};
  records[date][id] = status;
  save();
  render();
}

// ---------- 6. Remove a student ----------
function removeStudent(id) {
  if (!confirm("Remove this student and their attendance?")) return;
  students = students.filter(s => s.id !== id);
  for (const date in records) delete records[date][id];
  save();
  render();
}

// ---------- 7. Attendance percentage ----------
function percentage(id) {
  let present = 0, total = 0;
  for (const date in records) {
    if (records[date][id]) {
      total++;
      if (records[date][id] === "P") present++;
    }
  }
  if (total === 0) return null;
  return Math.round((present / total) * 100);
}

// ---------- 8. Draw the table ----------
function render() {
  const date = dateInput.value;
  const today = records[date] || {};
  tableBody.innerHTML = "";
  emptyMsg.style.display = students.length === 0 ? "block" : "none";

  let p = 0, a = 0;

  students.forEach(s => {
    const status = today[s.id];
    if (status === "P") p++;
    if (status === "A") a++;

    const pct = percentage(s.id);
    let pctText = "-";
    let pctClass = "";
    if (pct !== null) {
      pctText = pct + "%";
      pctClass = pct < 75 ? "low" : "good"; // below 75% = warning
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.name}</td>
      <td>
        <div class="mark">
          <button class="${status === "P" ? "on-present" : ""}" onclick="mark(${s.id}, 'P')">Present</button>
          <button class="${status === "A" ? "on-absent" : ""}" onclick="mark(${s.id}, 'A')">Absent</button>
        </div>
      </td>
      <td class="${pctClass}">${pctText}</td>
      <td><button class="remove" onclick="removeStudent(${s.id})">Remove</button></td>
    `;
    tableBody.appendChild(row);
  });

  summary.textContent = students.length === 0
    ? ""
    : `On ${date}: ${p} present, ${a} absent, ${students.length - p - a} not marked.`;
}

// ---------- 9. Events ----------
addBtn.addEventListener("click", addStudent);
nameInput.addEventListener("keydown", e => { if (e.key === "Enter") addStudent(); });
dateInput.addEventListener("change", render);

render();
