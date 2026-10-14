// --- DOM Elements ---
const bookForm = document.getElementById('book-form');
const titleInput = document.getElementById('book-title');
const authorInput = document.getElementById('book-author');
const statusSelect = document.getElementById('book-status');
const bookList = document.getElementById('book-list');
const searchInput = document.getElementById('search-input');

const titleError = document.getElementById('title-error');
const authorError = document.getElementById('author-error');

// LocalStorage key
const STORAGE_KEY = 'bookTracker.books';

// Load books from localStorage with safe fallback for missing/corrupted data
function loadBooks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }
    const parsed = JSON.parse(data);
    // Ensure parsed data is an array and sort newest first by createdAt timestamp
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    return [];
  } catch (error) {
    // Return empty list if data is corrupted or invalid JSON
    console.error('Failed to load books from localStorage:', error);
    return [];
  }
}

// Save current books array to localStorage
function saveBooks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (error) {
    console.error('Failed to save books to localStorage:', error);
  }
}

// In-memory list of books initialized from localStorage
const books = loadBooks();

// --- Render Function ---
// Renders the list of books to the page (with search filtering)
function renderBooks() {
  // Clear existing items
  bookList.textContent = '';

  // If there are no books at all
  if (books.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.id = 'empty-state';
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No books yet. Add your first one above.';
    bookList.appendChild(emptyState);
    return;
  }

  // Filter books by title or author (case-insensitive, trimming outer spaces)
  const query = searchInput.value.trim().toLowerCase();
  const filteredBooks = books.filter((book) => {
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  // If search returns no results
  if (filteredBooks.length === 0) {
    const noResults = document.createElement('p');
    noResults.className = 'empty-state';
    noResults.textContent = 'No books found';
    bookList.appendChild(noResults);
    return;
  }

  // Render each matching book (newest on top)
  filteredBooks.forEach((book) => {
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
  const currentVal = authorInput.value.trim();
  // Clear error once author has non-empty text with at least one letter
  if (currentVal !== '' && /[a-zA-Z\p{L}]/u.test(currentVal)) {
    authorError.textContent = '';
    authorInput.classList.remove('input-error');
  }
});

// --- Search Listener ---
// Filter book list live as the user types
searchInput.addEventListener('input', () => {
  renderBooks();
});

// --- Form Submission Handler ---
bookForm.addEventListener('submit', (event) => {
  // Prevent page refresh
  event.preventDefault();

  const title = titleInput.value.trim();
  // Ensure author is strictly a trimmed string
  const author = String(authorInput.value).trim();
  const status = statusSelect.value;

  let isValid = true;

  // Validate title (required, allows numbers like "1984")
  if (title === '') {
    titleError.textContent = 'Please enter a title';
    titleInput.classList.add('input-error');
    isValid = false;
  } else {
    titleError.textContent = '';
    titleInput.classList.remove('input-error');
  }

  // Validate author (required and must contain at least one letter)
  if (author === '') {
    authorError.textContent = 'Please enter an author';
    authorInput.classList.add('input-error');
    isValid = false;
  } else if (!/[a-zA-Z\p{L}]/u.test(author)) {
    authorError.textContent = 'Please enter a valid author name';
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

  // Create book object with unique ID and timestamp (author stored as string)
  const newBook = {
    id: Date.now().toString(),
    title: title,
    author: String(author),
    status: status,
    createdAt: Date.now()
  };

  // Add new book to the start of the array (newest first)
  books.unshift(newBook);

  // Save updated list to localStorage
  saveBooks();

  // Update the UI
  renderBooks();

  // Reset form inputs
  bookForm.reset();
});

// Initial render to show empty state
renderBooks();
