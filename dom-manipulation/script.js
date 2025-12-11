// script.js

// Fixed the array declaration + added a few more starter quotes
let quotes = [
  { text: "Success doesn’t arrive — you build it, brick by brick, on days you don’t feel like working.", category: "success" },
  { text: "We have the Boldness to speak up", category: "courage" },
  { text: "Start small, stay consistent, and the impossible becomes normal.", category: "motivation" },
  { text: "You outgrow people the moment you stop shrinking yourself to fit them.", category: "self-growth" },
  { text: "The only way to do great work is to love what you do.", category: "motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "wisdom" }
];

// DOM elements
const quoteDisplay      = document.getElementById("quoteDisplay");
const newQuoteBtn       = document.getElementById("newQuote");
const categorySelect    = document.getElementById("categorySelect");
const newQuoteText     = document.getElementById("newQuoteText");
const newQuoteCategory  = document.getElementById("newQuoteCategory");
const addQuoteBtn       = document.getElementById("addQuoteBtn");

// Populate the category dropdown with unique categories
function populateCategories() {
  const categories = new Set();
  quotes.forEach(q => categories.add(q.category));

  // Clear previous options except "All"
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;

  // Add each unique category
  [...categories]
    .sort()
    .forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categorySelect.appendChild(opt);
    });
}

// Show a random quote (respecting the selected category)
function showRandomQuote() {
  {
  const selected = categorySelect.value;

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p><em>No quotes in this category yet.</em></p>`;
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  // Build the quote with nice formatting using only DOM (no innerHTML strings if you prefer, but it's fine here)
  quoteDisplay.innerHTML = `
    <blockquote>"${quote.text}"</blockquote>
    <p><strong>— ${quote.category.charAt(0).toUpperCase() + quote.category.slice(1)}</strong></p>
  `;
}

// Add a new quote from the form
function addQuote() {
  const text = newQuoteText.value.trim();
  let category = newQuoteCategory.value.trim().toLowerCase();

  if (!text) {
    alert("Please enter a quote text.");
    return;
  }

  if (!category) category = "general"; // default category

  quotes.push({ text, category });

  // Reset form
  newQuoteText.value = "";
  newQuoteCategory.value = "";

  // Update UI
  populateCategories();
  alert("Quote added successfully!");
  showRandomQuote(); // optional: show a new random quote immediately
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);
categorySelect.addEventListener("change", showRandomQuote);

// Initial load
populateCategories();
showRandomQuote();