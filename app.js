// --- DOM Elements ---
const bookForm = document.getElementById('book-form');
const titleInput = document.getElementById('book-title');
const authorInput = document.getElementById('book-author');
const statusSelect = document.getElementById('book-status');
const bookList = document.getElementById('book-list');

const titleError = document.getElementById('title-error');
const authorError = document.getElementById('author-error');

// In-memory list of books
const books = [];

// --- Render Function ---
// Renders the list of books to the page
function renderBooks() {
  // Clear existing items
  bookList.textContent = '';

  // Display empty state message when there are no books
  if (books.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.id = 'empty-state';
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No books added yet. Add your first book above!';
    bookList.appendChild(emptyState);
    return;
  }

  // Render each book (newest on top)
  books.forEach((book) => {
    // Card container
    const card = document.createElement('div');
    card.className = 'book-item';

    // Info wrapper for title and author
    const info = document.createElement('div');
    info.className = 'book-info';

    // Book title (safely set via textContent)
    const titleEl = document.createElement('h3');
    titleEl.className = 'book-title';
    titleEl.textContent = book.title;

    // Book author (safely set via textContent)
    const authorEl = document.createElement('p');
    authorEl.className = 'book-author';
    authorEl.textContent = 'by ' + book.author;

    info.appendChild(titleEl);
    info.appendChild(authorEl);

    // Status badge (safely set via textContent)
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge status-' + book.status.toLowerCase().replace(/\s+/g, '-');
    statusBadge.textContent = book.status;

    // Assemble card
    card.appendChild(info);
    card.appendChild(statusBadge);

    bookList.appendChild(card);
  });
}

// --- Live Validation Listeners ---
// Clear error message when the user types a valid value
titleInput.addEventListener('input', () => {
  if (titleInput.value.trim() !== '') {
    titleError.textContent = '';
    titleInput.classList.remove('input-error');
  }
});

authorInput.addEventListener('input', () => {
  if (authorInput.value.trim() !== '') {
    authorError.textContent = '';
    authorInput.classList.remove('input-error');
  }
});

// --- Form Submission Handler ---
bookForm.addEventListener('submit', (event) => {
  // Prevent page refresh
  event.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const status = statusSelect.value;

  let isValid = true;

  // Validate title
  if (title === '') {
    titleError.textContent = 'Please enter a title';
    titleInput.classList.add('input-error');
    isValid = false;
  } else {
    titleError.textContent = '';
    titleInput.classList.remove('input-error');
  }

  // Validate author
  if (author === '') {
    authorError.textContent = 'Please enter an author';
    authorInput.classList.add('input-error');
    isValid = false;
  } else {
    authorError.textContent = '';
    authorInput.classList.remove('input-error');
  }

  // Stop if inputs are invalid
  if (!isValid) {
    return;
  }

  // Create book object with unique ID and timestamp
  const newBook = {
    id: Date.now().toString(),
    title: title,
    author: author,
    status: status,
    createdAt: Date.now()
  };

  // Add new book to the start of the array (newest first)
  books.unshift(newBook);

  // Update the UI
  renderBooks();

  // Reset form inputs
  bookForm.reset();
});

// Initial render to show empty state
renderBooks();
