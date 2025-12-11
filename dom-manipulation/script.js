let quotes = [];

// DOM Elements
const quoteDisplay   = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const addQuoteBtn = document.getElementById("addQuoteBtn");
const exportBtn   = document.getElementById("exportBtn");
const importFile  = document.getElementById("importFile");
const syncStatus  = document.getElementById("syncStatus");

// MOCK SERVER URL
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ==================== REQUIRED FUNCTION: fetchQuotesFromServer ====================
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const posts = await response.json();

    // Convert fake posts → our quote format
    return posts.slice(0, 20).map(post => ({
      text: post.title.charAt(0).toUpperCase() + post.title.slice(1),
      category: post.body.split(" ")[0].toLowerCase() || "general",
      serverId: post.id
    }));
  } catch (error) {
    updateSyncStatus("Failed to reach server", "red");
    return [];
  }
}

// ==================== REQUIRED FUNCTION: syncQuotes ====================
async function syncQuotes() {
  updateSyncStatus("Syncing with server...", "blue");

  const serverQuotes = await fetchQuotesFromServer();

  if (serverQuotes.length === 0) {
    updateSyncStatus("Sync failed – no server data", "red");
    return;
  }

  let hasNewFromServer = false;

  // CONFLICT RESOLUTION: Server wins if same text exists, otherwise add new ones
  serverQuotes.forEach(serverQuote => {
    const localIndex = quotes.findIndex(q => q.text === serverQuote.text);

    if (localIndex === -1) {
      // New quote from server → add it
      quotes.push(serverQuote);
      hasNewFromServer = true;
    }
    // If exists → server wins (overwrite local version)
    else if (quotes[localIndex].serverId) {
      quotes[localIndex] = serverQuote;
      hasNewFromServer = true;
    }
  });

  // POST local quotes that don't have serverId (simulate sending to server)
  for (const q of quotes) {
    if (!q.serverId) {
      try {
        await fetch(SERVER_URL, {
          method: "POST",
          body: JSON.stringify({ title: q.text, body: q.category }),
          headers: { "Content-type": "application/json; charset=UTF-8" }
        });
      } catch (e) {}
    }
  }

  // Save and refresh UI
  saveQuotes();
  populateCategories();

  if (hasNewFromServer) {
    updateSyncStatus("New quotes synced from server!", "green");
    setTimeout(() => updateSyncStatus("All quotes up to date", "green"), 4000);
  } else {
    updateSyncStatus("Already up to date", "green");
  }

  filterQuotes();
}

// ==================== UI NOTIFICATION ====================
function updateSyncStatus(message, color = "green") {
  syncStatus.textContent = message;
  syncStatus.style.color = color;
  syncStatus.style.fontWeight = "bold";
}

// ==================== PERIODIC SYNC (every 25 seconds) ====================
setInterval(syncQuotes, 25000);

// ==================== LOCAL STORAGE ====================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const saved = localStorage.getItem("quotes");
  if (saved) {
    quotes = JSON.parse(saved);
  }
}

// ==================== CATEGORY POPULATION & FILTERING ====================
function populateCategories() {
  const cats = [...new Set(quotes.map(q => q.category))].sort();
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c.charAt(0).toUpperCase() + c.slice(1);
    categoryFilter.appendChild(opt);
  });
  const lastFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = lastFilter;
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);

  const list = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  showRandomQuoteFrom(list);
}

categoryFilter.addEventListener("change", filterQuotes);

// ==================== SHOW RANDOM QUOTE ===
function showRandomQuoteFrom(list) {
  if (list.length === 0) {
    quote.innerHTML = "<p><em>No quotes in this category yet.</em></p>";
    return;
  }
  const i = Math.floor(Math.random() * list.length);
  const q = list[i];

  quote.innerHTML = `
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
  const cat  = document.getElementById("newQuoteCategory").value.trim() || "general";

  if (!text) return alert("Please enter a quote!");

  quotes.push({ text, category: cat });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added!");
  filterQuotes();
}

// ==================== EXPORT & IMPORT (kept from previous tasks) ====================
function exportToJsonFile() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (Array.isArray(imported)) {
        imported.forEach(q => {
          if (q.text && !quotes.some(ex => ex.text === q.text)) {
            quotes.push({ text: q.text, category: q.category || "general" });
          }
        });
        saveQuotes();
        populateCategories();
        alert("Imported successfully!");
        filterQuotes();
      }
    } catch { alert("Invalid file"); }
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
syncQuotes();           // First sync
filterQuotes();