// ============================================
// ADMIN DASHBOARD FUNCTIONALITY
// ============================================

// Global State
let allBooks = [];
let allStudents = [];
let allIssues = [];
let selectedNav = 'dashboard';
let selectedBookId = null;
let selectedStudentId = null;
let currentIssuesFilter = 'all';

// DOM Elements
const adminNameEl = document.getElementById('adminName');
const logoutBtn = document.getElementById('logoutBtn');
const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
const navLinks = document.querySelectorAll('.nav-link');

// Dashboard Elements
const statsGrid = document.getElementById('statsGrid');

// Manage Books Elements
const addBookBtn = document.getElementById('addBookBtn');
const booksTable = document.getElementById('booksTable');
const booksTableBody = document.getElementById('booksTableBody');
const emptyBooks = document.getElementById('emptyBooks');
const bookModal = document.getElementById('bookModal');
const bookForm = document.getElementById('bookForm');

// Issue Book Elements
const issueBookForm = document.getElementById('issueBookForm');
const studentSelect = document.getElementById('studentSelect');
const bookSearch = document.getElementById('bookSearch');
const bookSearchDropdown = document.getElementById('bookSearchDropdown');
const selectedBookIdInput = document.getElementById('selectedBookId');

// Issued Log Elements
const tabButtons = document.querySelectorAll('.tab-button');
const issuesLogTableBody = document.getElementById('issuesLogTableBody');
const emptyIssuesLog = document.getElementById('emptyIssuesLog');

// Overdue Elements
const overdueList = document.getElementById('overdueList');
const emptyOverdue = document.getElementById('emptyOverdue');
const totalFinesSection = document.getElementById('totalFinesSection');
const totalFines = document.getElementById('totalFines');

/**
 * Initialize Admin Dashboard
 */
async function initAdmin() {
  // Check authentication
  if (!isAuthenticated()) {
    window.location.href = '/index.html';
    return;
  }

  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = '/index.html';
    return;
  }

  // Display admin name
  adminNameEl.textContent = user.name;

  // Add event listeners
  navLinks.forEach(link => {
    link.addEventListener('click', handleNavClick);
  });

  addBookBtn.addEventListener('click', openAddBookModal);
  bookForm.addEventListener('submit', submitBookForm);
  logoutBtn.addEventListener('click', logout);
  sidebarLogoutBtn.addEventListener('click', logout);

  // Issue book form
  issueBookForm.addEventListener('submit', submitIssueForm);
  bookSearch.addEventListener('input', debounce(searchBooks, 300));

  // Filter tabs
  tabButtons.forEach(btn => {
    btn.addEventListener('click', handleFilterTab);
  });

  // Load initial data
  showLoading();
  try {
    await Promise.all([
      fetchAllBooks(),
      fetchAllStudents(),
      fetchAllIssues()
    ]);
    
    // Load dashboard by default
    loadDashboard();
  } catch (error) {
    console.error('Failed to initialize admin:', error);
    showToast('Failed to load admin dashboard. Please refresh.', 'error');
  } finally {
    hideLoading();
  }
}

/**
 * Handle Navigation Click
 */
function handleNavClick(e) {
  e.preventDefault();
  
  const section = e.target.getAttribute('data-section');
  
  // Update active nav
  navLinks.forEach(link => link.classList.remove('active'));
  e.target.classList.add('active');

  // Hide all sections
  document.querySelectorAll('[id$="Section"]').forEach(el => {
    el.classList.add('hidden');
  });

  // Show selected section
  selectedNav = section;
  const sectionEl = document.getElementById(`${section}Section`);
  if (sectionEl) {
    sectionEl.classList.remove('hidden');
  }

  // Load section-specific data
  if (section === 'dashboard') {
    loadDashboard();
  } else if (section === 'manage-books') {
    loadManageBooks();
  } else if (section === 'issue-book') {
    loadIssueBook();
  } else if (section === 'issued-log') {
    loadIssuedLog();
  } else if (section === 'overdue') {
    loadOverdue();
  }
}

/**
 * DASHBOARD SECTION
 */
async function loadDashboard() {
  try {
    renderStats();
  } catch (error) {
    console.error('Failed to load dashboard:', error);
    showToast('Failed to load dashboard', 'error');
  }
}

async function fetchStats() {
  try {
    const booksResponse = await apiCall('/books');
    const issuesResponse = await apiCall('/issues');
    
    const books = booksResponse.books || [];
    const issues = issuesResponse.issues || [];
    
    const today = new Date().toISOString().split('T')[0];
    const issuedToday = issues.filter(issue => 
      issue.issueDate && issue.issueDate.split('T')[0] === today
    ).length;
    
    const overdueCount = issues.filter(issue => issue.status === 'overdue').length;
    
    // Count active students
    const activeStudentIds = new Set(
      issues
        .filter(issue => issue.status !== 'returned')
        .map(issue => issue.userId?._id)
        .filter(Boolean)
    );
    
    return {
      totalBooks: books.length,
      activeStudents: activeStudentIds.size,
      issuedToday,
      overdueBooks: overdueCount
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return { totalBooks: 0, activeStudents: 0, issuedToday: 0, overdueBooks: 0 };
  }
}

function renderStats() {
  const stats = [
    { icon: '📚', label: 'Total Books', value: allBooks.length, color: 'green' },
    { icon: '👨‍🎓', label: 'Active Students', value: getActiveStudentsCount(), color: 'blue' },
    { icon: '✏️', label: 'Issued Today', value: getIssuedTodayCount(), color: 'gold' },
    { icon: '⏰', label: 'Overdue Books', value: getOverdueBooksCount(), color: 'red' }
  ];

  statsGrid.innerHTML = stats.map(stat => `
    <div class="stat-card ${stat.color}">
      <div class="stat-icon">${stat.icon}</div>
      <div class="stat-label">${stat.label}</div>
      <div class="stat-value">${stat.value}</div>
    </div>
  `).join('');
}

function getActiveStudentsCount() {
  const activeIds = new Set(
    allIssues
      .filter(issue => issue.status !== 'returned')
      .map(issue => issue.userId?._id)
      .filter(Boolean)
  );
  return activeIds.size;
}

function getIssuedTodayCount() {
  const today = new Date().toISOString().split('T')[0];
  return allIssues.filter(issue => 
    issue.issueDate && issue.issueDate.split('T')[0] === today
  ).length;
}

function getOverdueBooksCount() {
  return allIssues.filter(issue => issue.status === 'overdue').length;
}

/**
 * MANAGE BOOKS SECTION
 */
async function loadManageBooks() {
  renderBooksTable();
}

async function fetchAllBooks() {
  try {
    const response = await apiCall('/books');
    allBooks = response.books || [];
  } catch (error) {
    console.error('Failed to fetch books:', error);
    showToast('Failed to load books', 'error');
  }
}

function renderBooksTable() {
  if (allBooks.length === 0) {
    booksTableBody.innerHTML = '';
    emptyBooks.classList.remove('hidden');
    booksTable.parentElement.style.display = 'none';
    return;
  }

  emptyBooks.classList.add('hidden');
  booksTable.parentElement.style.display = 'block';

  booksTableBody.innerHTML = allBooks.map(book => `
    <tr>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td><span class="badge badge-blue">${book.category}</span></td>
      <td>${book.availableCopies}/${book.totalCopies}</td>
      <td class="table-actions">
        <button class="btn btn-sm btn-secondary" onclick="openEditBookModal('${book._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteBook('${book._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddBookModal() {
  selectedBookId = null;
  clearFormErrors('bookForm');
  document.getElementById('bookModalTitle').textContent = 'Add New Book';
  document.getElementById('bookForm').reset();
  bookModal.classList.add('show');
}

function openEditBookModal(bookId) {
  selectedBookId = bookId;
  const book = allBooks.find(b => b._id === bookId);
  
  if (!book) return;

  clearFormErrors('bookForm');
  document.getElementById('bookModalTitle').textContent = 'Edit Book';
  
  document.getElementById('bookTitle').value = book.title;
  document.getElementById('bookAuthor').value = book.author;
  document.getElementById('bookISBN').value = book.isbn;
  document.getElementById('bookCategory').value = book.category;
  document.getElementById('bookTotalCopies').value = book.totalCopies;
  document.getElementById('bookDescription').value = book.description || '';
  document.getElementById('bookCoverImage').value = book.coverImage || '';
  
  bookModal.classList.add('show');
}

function closeBookModal() {
  bookModal.classList.remove('show');
  selectedBookId = null;
}

async function submitBookForm(e) {
  e.preventDefault();

  const formData = {
    title: document.getElementById('bookTitle').value.trim(),
    author: document.getElementById('bookAuthor').value.trim(),
    isbn: document.getElementById('bookISBN').value.trim(),
    category: document.getElementById('bookCategory').value,
    totalCopies: parseInt(document.getElementById('bookTotalCopies').value),
    description: document.getElementById('bookDescription').value.trim(),
    coverImage: document.getElementById('bookCoverImage').value.trim()
  };

  const submitBtn = bookForm.querySelector('button[type="submit"]');
  const spinner = submitBtn.querySelector('.spinner');
  const text = submitBtn.querySelector('span:first-child');
  
  submitBtn.disabled = true;
  spinner.classList.remove('hidden');
  text.classList.add('hidden');

  try {
    if (selectedBookId) {
      // Edit book
      await apiCall(`/books/${selectedBookId}`, 'PUT', formData);
      showToast('Book updated successfully!', 'success');
    } else {
      // Add new book
      await apiCall('/books', 'POST', formData);
      showToast('Book added successfully!', 'success');
    }

    closeBookModal();
    await fetchAllBooks();
    renderBooksTable();
  } catch (error) {
    console.error('Failed to save book:', error);
    showToast(error.message || 'Failed to save book', 'error');
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add('hidden');
    text.classList.remove('hidden');
  }
}

async function deleteBook(bookId) {
  if (!window.confirm('Are you sure you want to delete this book?')) {
    return;
  }

  try {
    await apiCall(`/books/${bookId}`, 'DELETE');
    showToast('Book deleted successfully!', 'success');
    await fetchAllBooks();
    renderBooksTable();
  } catch (error) {
    console.error('Failed to delete book:', error);
    showToast(error.message || 'Failed to delete book', 'error');
  }
}

/**
 * ISSUE BOOK SECTION
 */
async function loadIssueBook() {
  await loadStudents();
}

async function fetchAllStudents() {
  try {
    // Extract unique students from issues
    const studentMap = {};
    allIssues.forEach(issue => {
      if (issue.userId && issue.userId._id) {
        studentMap[issue.userId._id] = issue.userId;
      }
    });
    
    allStudents = Object.values(studentMap);
    
    // If no students found in issues, we'll still be able to load students
    // when the issue book form is opened
  } catch (error) {
    console.error('Failed to fetch students:', error);
    allStudents = [];
  }
}

function loadStudents() {
  studentSelect.innerHTML = '<option value="">Choose a student...</option>';
  
  allStudents.forEach(student => {
    const option = document.createElement('option');
    option.value = student._id;
    option.textContent = `${student.name} (${student.studentId || 'N/A'})`;
    studentSelect.appendChild(option);
  });

  studentSelect.addEventListener('change', (e) => {
    selectedStudentId = e.target.value;
  });
}

function searchBooks(query) {
  if (!query.trim()) {
    bookSearchDropdown.style.display = 'none';
    return;
  }

  const filtered = allBooks.filter(book => 
    (book.title.toLowerCase().includes(query.toLowerCase()) ||
     book.author.toLowerCase().includes(query.toLowerCase())) &&
    book.availableCopies > 0
  );

  if (filtered.length === 0) {
    bookSearchDropdown.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-light);">No available books found</div>';
    bookSearchDropdown.style.display = 'block';
    return;
  }

  bookSearchDropdown.innerHTML = filtered.map(book => `
    <div style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer;" 
         onclick="selectBook('${book._id}', '${book.title.replace(/'/g, "\\'")}')">
      <strong>${book.title}</strong> - ${book.author} (${book.availableCopies} available)
    </div>
  `).join('');
  bookSearchDropdown.style.display = 'block';
}

function selectBook(bookId, bookTitle) {
  selectedBookIdInput.value = bookId;
  bookSearch.value = bookTitle;
  bookSearchDropdown.style.display = 'none';
}

async function submitIssueForm(e) {
  e.preventDefault();

  if (!selectedStudentId) {
    setFieldError('studentSelect', 'Please select a student');
    return;
  }

  if (!selectedBookIdInput.value) {
    setFieldError('bookSearch', 'Please select a book');
    return;
  }

  const submitBtn = issueBookForm.querySelector('button[type="submit"]');
  const spinner = submitBtn.querySelector('.spinner');
  const text = submitBtn.querySelector('span:first-child');
  
  submitBtn.disabled = true;
  spinner.classList.remove('hidden');
  text.classList.add('hidden');

  try {
    await apiCall('/issues', 'POST', {
      studentId: selectedStudentId,
      bookId: selectedBookIdInput.value
    });

    showToast('Book issued successfully!', 'success');
    issueBookForm.reset();
    bookSearchDropdown.style.display = 'none';
    selectedBookIdInput.value = '';
    selectedStudentId = null;
    studentSelect.value = '';

    // Refresh data
    await Promise.all([fetchAllBooks(), fetchAllIssues()]);
  } catch (error) {
    console.error('Failed to issue book:', error);
    showToast(error.message || 'Failed to issue book', 'error');
  } finally {
    submitBtn.disabled = false;
    spinner.classList.add('hidden');
    text.classList.remove('hidden');
  }
}

/**
 * ISSUED LOG SECTION
 */
async function loadIssuedLog() {
  currentIssuesFilter = 'all';
  renderIssuesLog();
}

async function fetchAllIssues() {
  try {
    const response = await apiCall('/issues');
    allIssues = response.issues || [];
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    showToast('Failed to load issues', 'error');
  }
}

function handleFilterTab(e) {
  const filter = e.target.getAttribute('data-filter');
  currentIssuesFilter = filter;

  // Update active tab
  tabButtons.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');

  renderIssuesLog();
}

function renderIssuesLog() {
  let filtered = [...allIssues];

  if (currentIssuesFilter !== 'all') {
    filtered = filtered.filter(issue => issue.status === currentIssuesFilter);
  }

  if (filtered.length === 0) {
    issuesLogTableBody.innerHTML = '';
    emptyIssuesLog.classList.remove('hidden');
    document.getElementById('issuesLogTable').parentElement.style.display = 'none';
    return;
  }

  emptyIssuesLog.classList.add('hidden');
  document.getElementById('issuesLogTable').parentElement.style.display = 'block';

  issuesLogTableBody.innerHTML = filtered.map(issue => {
    const daysOverdue = calculateDaysOverdue(issue.dueDate);
    const fine = calculateFine(issue);
    const statusBadge = getStatusBadge(issue.status);

    const overdueDisplay = daysOverdue > 0 ? 
      `<span class="text-danger font-bold">${daysOverdue}</span>` : 
      `${daysOverdue}`;

    const fineDisplay = fine > 0 ? 
      `<span class="text-danger font-bold">₹${fine}</span>` : 
      `₹${fine}`;

    return `
      <tr>
        <td>${issue.userId?.name || 'Unknown'}</td>
        <td>${issue.bookId?.title || 'Unknown'}</td>
        <td>${formatDate(issue.issueDate)}</td>
        <td>${formatDate(issue.dueDate)}</td>
        <td>${statusBadge}</td>
        <td>${overdueDisplay}</td>
        <td>${fineDisplay}</td>
      </tr>
    `;
  }).join('');
}

/**
 * OVERDUE MANAGEMENT SECTION
 */
async function loadOverdue() {
  renderOverdueList();
}

function renderOverdueList() {
  const overdueIssues = allIssues.filter(issue => issue.status === 'overdue');

  if (overdueIssues.length === 0) {
    overdueList.innerHTML = '';
    emptyOverdue.classList.remove('hidden');
    totalFinesSection.classList.add('hidden');
    return;
  }

  emptyOverdue.classList.add('hidden');

  let totalFine = 0;
  overdueList.innerHTML = overdueIssues.map(issue => {
    const daysOverdue = calculateDaysOverdue(issue.dueDate);
    const fine = calculateFine(issue);
    totalFine += fine;

    const isHighFine = fine > 50;
    const cardStyle = isHighFine ? 'background-color: rgba(212, 160, 23, 0.1); border-left-color: var(--gold);' : '';

    return `
      <div class="card" style="${cardStyle}">
        <div class="card-header">
          <div>
            <h4>${issue.bookId?.title || 'Unknown Book'}</h4>
            <p class="text-muted">${issue.userId?.name || 'Unknown Student'}</p>
          </div>
        </div>
        <div class="card-body">
          <p><strong>Days Overdue:</strong> <span class="text-danger">${daysOverdue} days</span></p>
          <p><strong>Due Date:</strong> ${formatDate(issue.dueDate)}</p>
          <p><strong>Fine Amount:</strong> <span class="text-danger font-bold">₹${fine}</span></p>
        </div>
        <div class="card-footer">
          <button class="btn btn-sm btn-primary" onclick="markAsReturned('${issue._id}')">Mark as Returned</button>
        </div>
      </div>
    `;
  }).join('');

  // Show total fines
  totalFinesSection.classList.remove('hidden');
  totalFines.textContent = `₹${totalFine}`;
}

async function markAsReturned(issueId) {
  try {
    await apiCall(`/issues/${issueId}/return`, 'PUT');
    showToast('Book marked as returned!', 'success');
    await fetchAllIssues();
    renderOverdueList();
  } catch (error) {
    console.error('Failed to mark as returned:', error);
    showToast(error.message || 'Failed to mark as returned', 'error');
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
