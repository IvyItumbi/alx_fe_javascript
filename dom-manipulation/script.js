let quotes = [];

// DOM Elements
const quoteDisplay     = document.getElementById("quoteDisplay");
const newQuoteBtn      = document.getElementById("newQuote");
const categoryFilter   = document.getElementById("categoryFilter");
const addQuoteBtn      = document.getElementById("addQuoteBtn");
const exportBtn        = document.getElementById("exportBtn");
const importFile       = document.getElementById("importFile");

// ===================== LOCAL STORAGE =====================
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    // Default quotes if nothing in storage
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "motivational" },
      { text: "Life is what happens when you're busy making other plans.", category: "life" },
      { text: "Success is not final, failure is not fatal.", category: "success" },
      { text: "Stay hungry, stay foolish.", category: "inspirational" }
    ];
  }
  populateCategories();
}

// Save selected filter to localStorage
function saveFilterPreference(category) {
  localStorage.setItem("selectedCategory", category);
}

function loadFilterPreference() {
  const saved = localStorage.getItem("selectedCategory");
  if (saved && quotes.some(q => q.category === saved)) {
    categoryFilter.value = saved;
  } else {
    categoryFilter.value = "all";
  }
}

// ===================== POPULATE CATEGORIES (REQUIRED FUNCTION NAME) =====================
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))].sort();

  // Keep "All Categories" option
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });

  // Restore last filter after repopulating
  loadFilterPreference();
}

// ===================== FILTER & DISPLAY QUOTES =====================
function filterQuotes() {
  const selected = categoryFilter.value;
  saveFilterPreference(selected);

  let filtered = quotes;
  if (selected !== "all") {
    filtered = quotes.filter(q => q.category === selected);
  }

  showRandomQuoteFrom(filtered);
}

function showRandomQuoteFrom(list = quotes) {
  if (list.length === 0) {
    quoteDisplay.innerHTML = "<p><em>No quotes in this category yet.</em></p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * list.length);
  const quote = list[randomIndex];

  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><strong>— <strong>${quote.category}</strong></p>
  `;

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

// Wrapper for button
function showRandomQuote() {
  filterQuotes();
}

// ===================== ADD QUOTE =====================
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim() || "general";

  if (!text) {
    alert("Please enter a quote!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();  // Update dropdown if new category

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
  filterQuotes(); // Refresh view with new quote
}

// ===================== EXPORT =====================
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

// ===================== IMPORT =====================
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");

      imported.forEach(q => {
        const text = q.text?.trim();
        const cat = (q.category?.trim() || "general");
        if (text && !quotes.some(existing => existing.text === text)) {
          quotes.push({ text, category: cat });
        }
      });

      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
      filterQuotes();
    } catch (err) {
      alert("Invalid JSON file!");
    }
  };
  reader.readAsText(file);
}

// ===================== EVENT LISTENERS =====================
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categoryFilter.addEventListener("change", filterQuotes);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

// ===================== ON LOAD =====================
loadQuotes();
populateCategories();
filterQuotes(); // Show quotes with saved filter

// Optional: restore last viewed quote from sessionStorage
const lastQuote = sessionStorage.getItem("lastViewedQuote");
if (lastQuote) {
  const q = JSON.parse(lastQuote);
  quoteDisplay.innerHTML = `
    <blockquote>"${q.text}"</blockquote>
    <p><strong>— ${q.category}</strong></p>
  `;
}