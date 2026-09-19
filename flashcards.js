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

/* render() is responsible for making the page match
  the current state. Called whenever state changes */
function render() {
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
}

// Event listeners connect user actions to state changes 
// Clicking the card flips between term and definition
cardEl.addEventListener("click", function () {
  showingDefinition = !showingDefinition;
  render();
});

// "Next" moves forward one card and resets to showing the term
nextBtn.addEventListener("click", function () {
  if (currentIndex < flashcards.length - 1) {
    currentIndex = currentIndex + 1;
    showingDefinition = false;
    render();
  }
});

// "Previous" moves back one card and resets to showing the term
prevBtn.addEventListener("click", function () {
  if (currentIndex > 0) {
    currentIndex = currentIndex - 1;
    showingDefinition = false;
    render();
  }
});

// Draw the very first card when the page loads
render();