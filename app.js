// --- DOM Elements ---
const bookForm = document.getElementById('book-form');
const titleInput = document.getElementById('book-title');
const authorInput = document.getElementById('book-author');
const statusSelect = document.getElementById('book-status');
const bookList = document.getElementById('book-list');
const searchInput = document.getElementById('search-input');
const bookCounts = document.getElementById('book-counts');

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
    // Ensure parsed data is an array
    if (Array.isArray(parsed)) {
      const validStatuses = ['To read', 'Reading', 'Finished'];
      // Keep only valid objects with string title, string author, and valid status
      const validBooks = parsed.filter((item) => {
        return (
          item !== null &&
          typeof item === 'object' &&
          typeof item.title === 'string' &&
          typeof item.author === 'string' &&
          validStatuses.includes(item.status)
        );
      });
      // Sort newest first by createdAt timestamp
      return validBooks.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
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

// Generate a unique book ID (crypto.randomUUID with fallback)
function generateBookId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// In-memory list of books initialized from localStorage
const books = loadBooks();

// --- Update Counts Function ---
// Updates the summary line with counts of all saved books
function updateCounts() {
  // If there are no books at all
  if (books.length === 0) {
    bookCounts.textContent = '0 books';
    return;
  }

  let finished = 0;
  let reading = 0;
  let toRead = 0;

  // Count all saved books (unaffected by active search query)
  books.forEach((book) => {
    if (book.status === 'Finished') {
      finished++;
    } else if (book.status === 'Reading') {
      reading++;
    } else if (book.status === 'To read') {
      toRead++;
    }
  });

  bookCounts.textContent = `${finished} finished, ${reading} reading, ${toRead} to read`;
}

// --- Render Function ---
// Renders the list of books to the page (with search filtering)
function renderBooks() {
  // Always update counts of all saved books
  updateCounts();

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

    // Action buttons container
    const actions = document.createElement('div');
    actions.className = 'book-actions';

    // Status dropdown (safely created and populated)
    const statusDropdown = document.createElement('select');
    statusDropdown.className = 'status-select status-' + book.status.toLowerCase().replace(/\s+/g, '-');
    statusDropdown.setAttribute('aria-label', 'Status for ' + book.title);

    // Exact status values to maintain compatibility
    const statusOptions = ['To read', 'Reading', 'Finished'];
    statusOptions.forEach((optionText) => {
      const option = document.createElement('option');
      option.value = optionText;
      option.textContent = optionText;
      if (optionText === book.status) {
        option.selected = true;
      }
      statusDropdown.appendChild(option);
    });

    // Update status, persist to localStorage, and re-render
    statusDropdown.addEventListener('change', (event) => {
      book.status = event.target.value;
      saveBooks();
      renderBooks();
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('aria-label', 'Delete ' + book.title);

    // Confirm and delete strictly by unique book.id
    deleteBtn.addEventListener('click', () => {
      const confirmed = window.confirm('Delete this book?');
      if (confirmed) {
        // Find index by unique id
        const index = books.findIndex((b) => b.id === book.id);
        if (index !== -1) {
          books.splice(index, 1);
          saveBooks();
          renderBooks();
        }
      }
    });

    actions.appendChild(statusDropdown);
    actions.appendChild(deleteBtn);

    // Assemble card
    card.appendChild(info);
    card.appendChild(actions);

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
    id: generateBookId(),
    title: title,
    author: String(author),
    status: status,
    createdAt: Date.now()
  };

  // Add new book to the start of the array (newest first)
  books.unshift(newBook);

  // Save updated list to localStorage
  saveBooks();

  // Clear search box so the full list and newly added book are visible
  searchInput.value = '';

  // Update the UI
  renderBooks();

  // Reset form inputs
  bookForm.reset();
});

// Initial render to show empty state
renderBooks();
