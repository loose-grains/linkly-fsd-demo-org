const boardEl = document.getElementById("board");
const form = document.getElementById("create");
const titleInput = document.getElementById("title");

async function loadBoard() {
  const res = await fetch("/api/board");
  const data = await res.json();
  boardEl.replaceChildren(...data.columns.map(renderColumn));
}

function renderColumn(column) {
  const el = document.createElement("section");
  el.className = "column";
  el.innerHTML = `
    <div class="column-header">
      <h2><span class="swatch ${column.status}"></span>${column.label}</h2>
      <span class="count">${column.issues.length}</span>
    </div>
  `;
  for (const issue of column.issues) {
    el.append(renderCard(issue, column.status));
  }
  return el;
}

function renderCard(issue, currentStatus) {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <h3>#${issue.id} ${escapeHtml(issue.title)}</h3>
    <p>${escapeHtml(issue.body || "No description")}</p>
    <div class="meta">
      <span>${issue.assignee ? `@${escapeHtml(issue.assignee)}` : "Unassigned"}</span>
    </div>
  `;
  const select = document.createElement("select");
  select.setAttribute("aria-label", `Move issue ${issue.id}`);
  for (const status of ["backlog", "in_progress", "review", "done"]) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status.replace("_", " ");
    option.selected = status === currentStatus;
    select.append(option);
  }
  select.addEventListener("change", async () => {
    await fetch(`/api/issues/${issue.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: select.value }),
    });
    await loadBoard();
  });
  card.querySelector(".meta").append(select);
  return card;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  await fetch("/api/issues", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title }),
  });
  titleInput.value = "";
  await loadBoard();
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

loadBoard();
