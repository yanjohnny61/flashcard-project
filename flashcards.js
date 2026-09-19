// Describes current state of app
let currentIndex = 0;        // which flashcard we're on
let showingDefinition = false; // whether showing term or definition

// Grabs HTML elements to be modified with JS 
const cardEl = document.querySelector("#card");
const cardLabelEl = document.querySelector("#cardLabel");
const cardTextEl = document.querySelector("#cardText");
const progressEl = document.querySelector("#progress");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");

const addCardForm = document.querySelector("#addCardForm");
const termInput = document.querySelector("#termInput");
const definitionInput = document.querySelector("#definitionInput");

/* Saves custom cards in localStorage under STORAGE_KEY */
const STORAGE_KEY = "customFlashcards";
 
function loadCustomCards() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return []; // nothing saved yet
 
  try {
    return JSON.parse(raw);
  } catch (e) {
    // Fail safe if data cannot be read
    return [];
  }
}
 
function saveCustomCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}
 
// Loads user's own cards on startup
let customCards = loadCustomCards();
 
/* Adds custom cards to hardcoded cards */
let allFlashcards = flashcards.concat(customCards);

/* render() is responsible for making the page match
  the current state. Called whenever state changes */
function render() {
  const card = allFlashcards[currentIndex];

  if (showingDefinition) {
    cardLabelEl.textContent = "DEFINITION";
    cardTextEl.textContent = card.definition;
    cardEl.classList.add("is-definition");
  } else {
    cardLabelEl.textContent = "TERM";
    cardTextEl.textContent = card.term;
    cardEl.classList.remove("is-definition");
  }

  progressEl.textContent = `Card ${currentIndex + 1} of ${allFlashcards.length}`;

  // Disable "Previous" on the first card and "Next" on the last card
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === allFlashcards.length - 1;
}

// Clicking the card flips between term and definition
function flipCard() {
  showingDefinition = !showingDefinition;
  render();
}

// "Next" moves forward one card and resets to showing the term
function goNext() {
  if (currentIndex < allFlashcards.length - 1) {
    currentIndex = currentIndex + 1;
    showingDefinition = false;
    render();
  }
}

// "Previous" moves back one card and resets to showing the term
function goPrev() {
  if (currentIndex > 0) {
    currentIndex = currentIndex - 1;
    showingDefinition = false;
    render();
  }
}

// Event listeners connect user actions to state changes 
cardEl.addEventListener("click", flipCard);
nextBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);

/* ============================================================
   NEW: handling the "add a custom card" form submission
 
   Forms fire a "submit" event when the button is clicked OR
   when Enter is pressed inside one of their inputs — using
   the form's submit event (rather than a click listener on
   just the button) gives us both for free.
   ============================================================ */
addCardForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stops browser default reload
 
  const term = termInput.value.trim();
  const definition = definitionInput.value.trim();
 
  // Don't add a blank card if either field is empty
  if (term === "" || definition === "") return;
 
  const newCard = { term: term, definition: definition };
 
  customCards.push(newCard);       // add to the custom list
  saveCustomCards(customCards);    // persist that list to localStorage
  allFlashcards.push(newCard);     // add to the "everything" list the app displays
 
  // Clear the form for the next entry
  termInput.value = "";
  definitionInput.value = "";
 
  // Jump straight to the newly added card
  currentIndex = allFlashcards.length - 1;
  showingDefinition = false;
  render();
});

// Keyboard support
document.addEventListener("keydown", function (event) {

  const tag = event.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return; // exits if typing

  if (event.key === "ArrowRight") {
    goNext();
  } else if (event.key === "ArrowLeft") {
    goPrev();
  } else if (event.key === " ") {
    event.preventDefault();
    flipCard();
  }
});

// Draw the very first card when the page loads
render();