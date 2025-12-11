let quotes = [];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn  = document.getElementById("newQuote");
const exportBtn    = document.getElementById("exportBtn");
const importFile   = document.getElementById("importFile");

// Save & Load from localStorage
function saveQuotes() {
  localStorage.setItem("userQuotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const saved = localStorage.getItem("userQuotes");
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    // Default quotes if nothing in storage
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "motivational" },
      { text: "Life is what happens when you're busy making other plans.", category: "life" },
      { text: "Success doesn’t arrive — you build it.", category: "success" }
    ];
  }
}

// Session Storage: last viewed quote
function saveLastViewedQuote(quote) {
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Display quote
function displayQuote(quote) {
  quoteDisplay.innerHTML = "";
  const p1 = document.createElement("p");
  p1.textContent = `"${quote.text}"`;
  p1.categoryContent = `"${quote.category}"`;
  p1.style.fontStyle = "italic";
  quoteDisplay.appendChild(p1);

  saveLastViewedQuote(quote);
}

function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes yet. Add or import some!</p>";
    return;
  }
  const i = Math.floor(Math.random() * quotes.length);
  displayQuote(quotes[i]);
}

// Required by Task 0: createAddQuoteForm
function createAddQuoteForm() {
  const div = document.createElement("div");
  div.style.marginTop = "30px";

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCat = document.createElement("input");
  inputCat.type = "text";
  inputCat.id = "newQuoteCategory";
  inputCat.placeholder = "Category";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";

  div.appendChild(inputText);
  div.appendChild(inputCat);
  div.appendChild(btn);
  document.body.appendChild(div);

  btn.onclick = addQuote;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const cat  = document.getElementById("newQuoteCategory").value.trim() || "general";

  if (!text) {
    alert("Quote cannot be empty!");
    return;
  }

  quotes.push({ text, category: cat });
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added!");
  showRandomQuote();
}

// Export to JSON
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

// Import from JSON
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw "Not an array";

      imported.forEach(q => {
        if (q.text) {
          q.category = q.category || "general";
          if (!quotes.some(existing => existing.text === q.text)) {
            quotes.push(q);
          }
        }
      });

      saveQuotes();
      alert("Quotes imported successfully!");
      showRandomQuote();
    } catch (err) {
      alert("Invalid JSON file!");
    }
  };
  reader.readAsText(file);
}

// Event Listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

// Init
loadQuotes();
createAddQuoteForm();
showRandomQuote();