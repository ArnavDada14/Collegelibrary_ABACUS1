// ============================================
// STUDENT CATALOG FUNCTIONALITY
// ============================================

// Global State
let currentBooks = [];
let currentIssues = [];
let authToken = localStorage.getItem('token');

// DOM Elements
const studentNameEl = document.getElementById('studentName');
const booksGridEl = document.getElementById('booksGrid');
const emptyBooksEl = document.getElementById('emptyBooks');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const availableCheckbox = document.getElementById('availableCheckbox');
const issuesTableBody = document.getElementById('issuesTableBody');
const emptyIssuesEl = document.getElementById('emptyIssues');
const totalFineSection = document.getElementById('totalFineSection');
const totalFineEl = document.getElementById('totalFine');
const logoutBtn = document.getElementById('logoutBtn');

/**
 * Initialize Catalog Page
 */
async function initCatalog() {
  // Check authentication
  if (!isAuthenticated()) {
    window.location.href = '/index.html';
    return;
  }

  const user = getCurrentUser();
  if (!user || user.role !== 'student') {
    window.location.href = '/index.html';
    return;
  }

  // Display student name
  studentNameEl.textContent = user.name;

  // Add event listeners
  searchInput.addEventListener('input', debounce(filterAndRenderBooks, 300));
  categoryFilter.addEventListener('change', filterAndRenderBooks);
  sortFilter.addEventListener('change', filterAndRenderBooks);
  availableCheckbox.addEventListener('change', filterAndRenderBooks);
  logoutBtn.addEventListener('click', logout);

  // Load initial data
  showLoading();
  try {
    await Promise.all([fetchBooks(), fetchMyIssues()]);
    filterAndRenderBooks();
    renderIssuesTable();
  } catch (error) {
    console.error('Failed to load catalog:', error);
    showToast('Failed to load catalog. Please refresh the page.', 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Fetch All Books
 */
async function fetchBooks() {
  try {
    const response = await apiCall('/books');
    currentBooks = response.books || [];
    console.log('Books loaded:', currentBooks.length);
  } catch (error) {
    console.error('Failed to fetch books:', error);
    throw error;
  }
}

/**
 * Fetch Student's Issued Books
 */
async function fetchMyIssues() {
  try {
    const response = await apiCall('/issues');
    currentIssues = response.issues || [];
    console.log('Issues loaded:', currentIssues.length);
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    throw error;
  }
}

/**
 * Apply Filters and Render Books
 */
function filterAndRenderBooks() {
  let filtered = [...currentBooks];

  // Search filter
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    filtered = searchArray(filtered, searchTerm, ['title', 'author']);
  }

  // Category filter
  const category = categoryFilter.value;
  if (category) {
    filtered = filterBy(filtered, 'category', category);
  }

  // Available only filter
  if (availableCheckbox.checked) {
    filtered = filtered.filter(book => book.availableCopies > 0);
  }

  // Sort
  const sortBy_ = sortFilter.value;
  if (sortBy_ === 'title') {
    filtered = sortBy(filtered, 'title', true);
  } else if (sortBy_ === 'author') {
    filtered = sortBy(filtered, 'author', true);
  } else if (sortBy_ === 'newest') {
    filtered = sortBy(filtered, 'addedAt', false);
  }

  renderBookGrid(filtered);
}

/**
 * Render Book Grid
 */
function renderBookGrid(books) {
  booksGridEl.innerHTML = '';

  if (books.length === 0) {
    emptyBooksEl.classList.remove('hidden');
    return;
  }

  emptyBooksEl.classList.add('hidden');

  books.forEach(book => {
    const isAvailable = book.availableCopies > 0;
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.innerHTML = `
      <div class="book-cover">
        ${book.coverImage ? `<img src="${book.coverImage}" alt="${book.title}">` : '📕'}
      </div>
      <div class="book-info">
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">${book.author}</p>
        <span class="book-category">${book.category}</span>
        <p class="book-availability ${isAvailable ? 'available' : 'unavailable'}">
          ${isAvailable ? `Available: ${book.availableCopies} copies` : 'Unavailable'}
        </p>
        <button class="btn btn-primary btn-sm btn-block mt-2" 
                onclick="issueBook('${book._id}')" 
                ${!isAvailable ? 'disabled' : ''}>
          ${isAvailable ? 'Issue Book' : 'Not Available'}
        </button>
      </div>
    `;
    booksGridEl.appendChild(bookCard);
  });
}

/**
 * Issue Book
 */
async function issueBook(bookId) {
  try {
    const response = await apiCall('/issues', 'POST', { bookId });
    showToast('Book issued successfully!', 'success');
    
    // Refresh data
    await Promise.all([fetchBooks(), fetchMyIssues()]);
    filterAndRenderBooks();
    renderIssuesTable();
  } catch (error) {
    console.error('Failed to issue book:', error);
    const message = error.message || 'Failed to issue book. Please try again.';
    showToast(message, 'error');
  }
}

/**
 * Fetch and Render My Issues
 */
async function renderIssuesTable() {
  const activeIssues = currentIssues.filter(issue => issue.status !== 'returned');

  if (activeIssues.length === 0) {
    issuesTableBody.innerHTML = '';
    emptyIssuesEl.classList.remove('hidden');
    totalFineSection.classList.add('hidden');
    return;
  }

  emptyIssuesEl.classList.add('hidden');

  let totalFine = 0;
  issuesTableBody.innerHTML = activeIssues.map(issue => {
    const daysOverdue = calculateDaysOverdue(issue.dueDate);
    const fine = calculateFine(issue);
    totalFine += fine;

    const statusBadge = getStatusBadge(issue.status);
    const fineDisplay = fine > 0 ? `<span class="text-danger font-bold">₹${fine}</span>` : `₹${fine}`;
    const overdueDisplay = daysOverdue > 0 ? `<span class="text-danger font-bold">${daysOverdue} days</span>` : `${daysOverdue} days`;

    return `
      <tr>
        <td>${issue.bookId?.title || 'Unknown Book'}</td>
        <td>${formatDate(issue.issueDate)}</td>
        <td>${formatDate(issue.dueDate)}</td>
        <td>${statusBadge}</td>
        <td>${overdueDisplay}</td>
        <td>${fineDisplay}</td>
      </tr>
    `;
  }).join('');

  // Show total fine
  if (totalFine > 0) {
    totalFineSection.classList.remove('hidden');
    totalFineEl.textContent = `₹${totalFine}`;
  } else {
    totalFineSection.classList.add('hidden');
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCatalog);
} else {
  initCatalog();
}
