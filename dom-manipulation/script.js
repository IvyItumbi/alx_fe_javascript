// quotes array with text and category properties
const quotes = [
  { text: "The only way to do great work is to love what you do.", category: "motivational" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "Success doesn’t arrive — you build it, brick by brick.", category: "success" },
  { text: "We have the boldness to speak up", category: "courage" },
  { text: "Start small, stay consistent.", category: "motivation" }
];

// DOM Elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Function to show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Clear previous content
  quoteDisplay.innerHTML = "";

  // Create and append quote paragraph
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  // Create and append category paragraph
  const quoteCategory = document.createElement("p");
  quoteCategory.textContent = `— ${quote.category}`;
  quoteCategory.style.fontWeight = "bold";
  quoteCategory.style.marginTop = "10px";

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// Function to dynamically create the "Add Quote" form
function createAddQuoteForm() {
  // Create form container
  const formContainer = document.createElement("div");

  // Quote input
  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  // Category input
  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "newQuoteCategory";
  inputCategory.placeholder = "Enter category";

  // Add button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.id = "addQuoteBtn";

  // Append inputs and button to container
  formContainer.appendChild(inputText);
  formContainer.appendChild(inputCategory);
  formContainer.appendChild(addButton);

  // Append form below the button
  document.body.appendChild(formContainer);

  // Add event listener to the button (after it exists in DOM)
  addButton.addEventListener("click", addQuote);
}

// Function to add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim() || "general";

  if (text === "") {
    alert("Quote text cannot be empty!");
    return;
  }

  // Add to quotes array
  quotes.push({ text, category });

  // Clear inputs
  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");

  // Optional: show a new random quote immediately
  showRandomQuote();
}

// Event listener for Show New Quote button
newQuoteBtn.addEventListener("click", showRandomQuote);

// Create the form and show first quote when page loads
createAddQuoteForm();
showRandomQuote();