let quotes = [];
let serverQuotes = []; // To detect changes from server

const quoteDisplay   = document.getElementById("quoteDisplay");
const newQuoteBtn    = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const addQuoteBtn    = document.getElementById("addQuoteBtn");
const exportBtn      = document.getElementById("exportBtn");
const importFile     = document.getElementById("importFile");
const syncStatus     = document.getElementById("syncStatus");
const forceSyncBtn   = document.getElementById("forceSyncBtn");

// ==================== SERVER SIMULATION USING JSONPLACEHOLDER ====================
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Fake "quotes" endpoint

// Fetch quotes from "server" (we use title = quote text, body = category)
async function fetchFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    // Map fake posts to our quote format
    const serverData = data.slice(0, 15).map(item => ({
      text: item.title,
      .replace(/^["'](.+(?=["']$))["']$/, '$1') // clean quotes
      .split(' ').slice(0, 12).join(' ') + "...", // shorten
      category: item.body.split(' ')[0].toLowerCase() || "general",
      serverId: item.id
    }));

    return serverData;
  } catch (err) {
    updateSyncStatus("Offline – using local data", "orange");
    return [];
  }
}

// ==================== SYNC LOGIC WITH CONFLICT RESOLUTION ====================
async function syncWithServer() {
  updateSyncStatus("Syncing with server...", "blue");

  const serverData = await fetchFromServer();

  if (serverData.length === 0) {
    updateSyncStatus("No server connection", "red");
    return;
  }

  let localChanged = false;

  // Conflict resolution: Server wins if quote text matches
  serverData.forEach(serverQuote => {
    const existsLocally = quotes.some(q => q.text === serverQuote.text);

    if (!existsLocally) {
      quotes.push(serverQuote);
      localChanged = true;
    }
  });

  // Also push local quotes that don't exist on server (simulate POST)
  for (const quote of quotes) {
    if (!quote.serverId && quote.text.length > 10) {
      try {
        await fetch(SERVER_URL, {
          method: "POST",
          body: JSON.stringify({ title: quote.text, body: quote.category }),
          headers: { "Content-type": "application/json" }
        });
      } catch (e) { /* ignore */ }
    }
  }

  if (localChanged) {
    saveQuotes();
    populateCategories();
    updateSyncStatus("Synced – New quotes from server!", "green");
    setTimeout(() => updateSyncStatus("All quotes up to date", "green"), 3000);
  } else {
    updateSyncStatus("All quotes up to date", "green");
  }

  filterQuotes(); // refresh view
}

// Auto sync every 30 seconds
setInterval(syncWithServer, 30000);

// Manual sync button
forceSyncBtn.addEventListener("click", syncWithServer);

// Update sync status message
function updateSyncStatus(message, color = "green") {
  syncStatus.textContent = message;
  syncStatus.style.color = color;
}

// ==================== LOCAL STORAGE ====================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// ==================== CATEGORY FILTERING (from Task 2) ====================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))].sort();
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(opt);
  });
  const saved = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = saved;
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);

  let filtered = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  showRandomQuoteFrom(filtered);
}

categoryFilter.addEventListener("change", filterQuotes);

// ==================== DISPLAY QUOTE ====================
function showRandomQuoteFrom(list) {
  if (list.length === 0) {
    quoteDisplay.innerHTML = "<p><em>No quotes in this category.</em></p>";
    return;
  }
  const i = Math.floor(Math.random() * list.length);
  const q = list[i];

  quoteDisplay.innerHTML = `
    <blockquote>"${q.text}"</blockquote>
    <p><strong>— ${q.category}</strong></p>
  `;

  sessionStorage.setItem("lastViewedQuote", JSON.stringify(q));
}

function showRandomQuote() {
  filterQuotes();
}

// ==================== ADD QUOTE ====================
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const cat = document.getElementById("newQuoteCategory").value.trim() || "general";

  if (!text) return alert("Quote cannot be empty!");

  quotes.push({ text, category: cat });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added locally!");
  filterQuotes();
}

// ==================== EXPORT / IMPORT (from Task 1) ====================
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!Array.isArray(imported)) throw "";
      imported.forEach(q => {
        if (q.text && !quotes.some(ex => ex.text === q.text)) {
          quotes.push({ text: q.text, category: q.category || "general" });
        }
      });
      saveQuotes();
      populateCategories();
      alert("Imported successfully!");
      filterQuotes();
    } catch {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(file);
}

// ==================== EVENT LISTENERS ====================
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

// ==================== ON LOAD ====================
loadQuotes();
populateCategories();
syncWithServer(); // First sync
filterQuotes();