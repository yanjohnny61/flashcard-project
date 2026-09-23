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
const deleteBtn = document.querySelector("#deleteBtn");
const shuffleBtn = document.querySelector("#shuffleBtn");

const masterySegments = document.querySelectorAll("#masteryBar .mastery-segment");
const knowBtn = document.querySelector("#knowBtn");
const dontKnowBtn = document.querySelector("#dontKnowBtn");

const addCardForm = document.querySelector("#addCardForm");
const termInput = document.querySelector("#termInput");
const definitionInput = document.querySelector("#definitionInput");

// Saves custom cards in localStorage under STORAGE_KEY
const STORAGE_KEY = "customFlashcards";

const MAX_MASTERY = 3;

function loadFlashcards() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return []; // nothing saved yet

  try {
    const cards = JSON.parse(raw);
    // Uses 0 if no mastery available
    return cards.map(function (card) {
      return { term: card.term, definition: card.definition, mastery: card.mastery ?? 0 };
    });
  } catch (e) {
    // Fail safe if data cannot be read
    return [];
  }
}

function saveFlashcards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

// Loads flashcards on start
let flashcards = loadFlashcards();

// Fisher-Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
 
    // Swap array[i] and array[j]
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
 
function shuffleCards() {
  shuffleArray(flashcards);
  currentIndex = 0;         // start from the top of the new order
  showingDefinition = false;
  render();
}

// Fills in segments based on mastery
function renderMasteryBar(mastery) {
  masterySegments.forEach(function (segment, index) {
    if (index < mastery) {
      segment.classList.add("filled");
    } else {
      segment.classList.remove("filled");
    }
  });
}

/* render() is responsible for making the page match
  the current state. Called whenever state changes */
function render() {

  // Handles empty deck
  if (flashcards.length === 0) {
    cardLabelEl.textContent = "EMPTY";
    cardTextEl.textContent = "No cards yet — add one below.";
    cardEl.classList.remove("is-definition");
    progressEl.textContent = "0 cards";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    deleteBtn.disabled = true;
    shuffleBtn.disabled = true;
    knowBtn.disabled = true;
    dontKnowBtn.disabled = true;
    renderMasteryBar(0); // no card = no filled segments
    return;
  }

  const card = flashcards[currentIndex];

  if (showingDefinition) {
    cardLabelEl.textContent = "DEFINITION";
    cardTextEl.textContent = card.definition;
    cardEl.classList.add("is-definition");
  } else {
    cardLabelEl.textContent = "TERM";
    cardTextEl.textContent = card.term;
    cardEl.classList.remove("is-definition");
  }

  progressEl.textContent = `Card ${currentIndex + 1} of ${flashcards.length}`;

  // Disable "Previous" on the first card and "Next" on the last card
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === flashcards.length - 1;

  // Need multiple cards to shuffle
  shuffleBtn.disabled = flashcards.length <= 1;

  deleteBtn.disabled = false;
  knowBtn.disabled = false;
  dontKnowBtn.disabled = false;
  renderMasteryBar(card.mastery); // draw card's mastery level
}

// Clicking the card flips between term and definition
function flipCard() {
  showingDefinition = !showingDefinition;
  render();
}

// "Next" moves forward one card and resets to showing the term
function goNext() {
  if (currentIndex < flashcards.length - 1) {
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

// Raises mastery by one
function markKnow() {
  const card = flashcards[currentIndex];
  card.mastery = Math.min(card.mastery + 1, MAX_MASTERY); // math.min prevents > 3
  saveFlashcards(flashcards);
  render();
}

// Lowers mastery by one 
function markDontKnow() {
  const card = flashcards[currentIndex];
  card.mastery = Math.max(card.mastery - 1, 0); // math.max prevents < 0
  saveFlashcards(flashcards);
  render();
}

// Handles deleting cards
function deleteCurrentCard() {
  if (flashcards.length === 0) return; // nothing to delete

  // Confirm deletion
  const card = flashcards[currentIndex];
  const confirmed = confirm(`Delete "${card.term}"?`);
  if (!confirmed) return;

  flashcards.splice(currentIndex, 1);
  saveFlashcards(flashcards);

  // Shifts index down upon deleting card
  if (currentIndex >= flashcards.length) {
    currentIndex = flashcards.length - 1;
  }

  showingDefinition = false;
  render();
}

// Event listeners connect user actions to state changes 
cardEl.addEventListener("click", flipCard);
nextBtn.addEventListener("click", goNext);
prevBtn.addEventListener("click", goPrev);
deleteBtn.addEventListener("click", deleteCurrentCard);
shuffleBtn.addEventListener("click", shuffleCards);
knowBtn.addEventListener("click", markKnow);
dontKnowBtn.addEventListener("click", markDontKnow);

// Handles form for adding cards 
addCardForm.addEventListener("submit", function (event) {
  event.preventDefault(); // stops browser default reload

  const term = termInput.value.trim();
  const definition = definitionInput.value.trim();

  // Don't add a blank card if either field is empty
  if (term === "" || definition === "") return;

  const newCard = { term: term, definition: definition, mastery: 0 };

  flashcards.push(newCard);
  saveFlashcards(flashcards);

  // Clear the form for the next entry
  termInput.value = "";
  definitionInput.value = "";

  // Jump straight to the newly added card
  currentIndex = flashcards.length - 1;
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