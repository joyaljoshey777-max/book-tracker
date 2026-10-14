# Book Tracker

A simple, lightweight web app to track the books you want to read, are reading, and have finished.

## Live Demo

<LIVE LINK HERE>

## Features

- **Add a Book**: Add books with a title, author, and status (*To read*, *Reading*, or *Finished*). Title and author are required, and author names must contain at least one letter.
- **Newest First**: Books are automatically sorted so the newest ones appear at the top.
- **Search**: Filter books in real time by title or author, ignoring capital letters.
- **Change Status**: Update any book's reading status directly from its card using a color-coded dropdown.
- **Delete Books**: Delete any book with a confirmation dialog to prevent accidental removal.
- **Book Counts**: A live summary line showing the count of books in each status across your entire library.
- **Persistent Storage**: All books are saved to browser `localStorage` and stay intact after page reloads.
- **Mobile Friendly**: Clean, responsive layout that works smoothly on phones (around 375px wide) with comfortable tap targets (at least 44px tall).

## How to Run It

No installation, build tools, or web server required.

1. Download or clone this repository.
2. Open `index.html` directly in any web browser.

## Tech Used

- **HTML5**: Semantic markup with accessible labels.
- **CSS3**: Vanilla CSS with modern layout, soft color badges, and mobile media queries.
- **JavaScript**: Vanilla JS for state management, safe DOM rendering (using `textContent` to prevent XSS), and `localStorage` synchronization.

## How I Built It

This project was built step by step in collaboration with AI (Antigravity). Each feature was implemented and tested individually before moving to the next. You can view the full prompt log and review notes in [PROMPTS.md](PROMPTS.md).

## Known Limitations

- All data is saved only in this specific browser and device using `localStorage`.
- Data is not synced across different devices or browsers.
- Clearing your browser's site data or cache will erase all saved books.
