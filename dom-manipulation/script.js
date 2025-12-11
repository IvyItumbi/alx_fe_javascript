let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "motivational" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "Success is not final, failure is not fatal.", category: "success" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

function saveQuotes() {
  localStorage.setItem("userQuotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("userQuotes");
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

function saveLastViewedQuote(quote) {
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

function showLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const q = JSON.parse(last);
    displayQuote(q);
  }
}

function displayQuote(quote) {
  quoteDisplay.innerHTML = "";

  const textEl = document.createElement("p");
  textEl.textContent = `"${quote.text}"`;

  const catEl = document.createElement("p");
  catEl.textContent = `— ${quote.category}`;
  catEl.style.fontWeight = "bold";

  quoteDisplay.appendChild(textEl);
  quoteDisplay.appendChild(catEl);

  saveLastViewedQuote(quote);
}

function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p><em>No quotes available. Add or import some!</em></p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  displayQuote(quotes[randomIndex]);
}

function createAddQuoteForm() {
  const container = document.createElement("div");
  container.style.marginTop = "30px";

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCat = document.createElement("input");
  inputCat.type = "text";
  inputCat.id = "newQuoteCategory";
  ";
  inputCat.placeholder = "Category (e.g. wisdom)";

  const btn = document.createElement("button");
  btn.textContent = "Add Quote";

  container.appendChild(inputText);
  container.appendChild(inputCat);
  container.appendChild(btn);

  document.body.appendChild(container);

  btn.addEventListener("click", addQuote);
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const catInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = catInput.value.trim() || "general";

  if (!text) {
    alert("Please enter a quote!");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes(); 

  textInput.value = "";
  catInput.value = "";

  alert("Quote added!");
  showRandomQuote();
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "my-quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) throw new Error("Not a valid quotes array");

      imported.forEach(q => {
        if (!q.text) throw new Error("One or more quotes missing 'text'");
        q.category = q.category || "general";
      });

      imported.forEach(newQuote => {
        if (!quotes.some(q => q.text === newQuote.text)) {
          quotes.push(newQuote);
        }
      });

      saveQuotes();
      alert(`Imported ${imported.length} quotes successfully!`);
      showRandomQuote();
    } catch (err) {
      alert("Invalid JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportToJsonFile);
importFile.addEventListener("change", importFromJsonFile);

loadQuotes();           
createAddQuoteForm();   
showRandomQuote();      
showLastViewedQuote();  