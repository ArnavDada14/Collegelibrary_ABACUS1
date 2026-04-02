// ============================================
// UTILITY FUNCTIONS - TOASTS, HELPERS, ETC
// ============================================

/**
 * Show Toast Notification
 * @param {string} message - Message to display
 * @param {string} type - success, error, info, warning
 * @param {number} duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
 */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const titleMap = {
    success: 'Success',
    error: 'Error',
    info: 'Info',
    warning: 'Warning'
  };
  
  toast.innerHTML = `
    <div class="toast-title">${titleMap[type] || 'Notification'}</div>
    <div class="toast-message">${message}</div>
  `;
  
  container.appendChild(toast);
  
  // Auto-dismiss
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  
  return toast;
}

/**
 * Show Loading Overlay
 */
function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.add('show');
  }
}

/**
 * Hide Loading Overlay
 */
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
}

/**
 * Show/Hide Spinner on Button
 */
function setButtonLoading(buttonId, isLoading) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  
  const spinner = btn.querySelector('.spinner');
  const text = btn.querySelector('span:first-child');
  
  if (isLoading) {
    btn.disabled = true;
    spinner?.classList.remove('hidden');
    if (text) text.classList.add('hidden');
  } else {
    btn.disabled = false;
    spinner?.classList.add('hidden');
    if (text) text.classList.remove('hidden');
  }
}

/**
 * Display Inline Form Error
 */
function setFieldError(fieldId, errorMessage) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(fieldId + 'Error');
  
  if (!errorElement) return;
  
  if (errorMessage) {
    field?.classList.add('error-field');
    errorElement.textContent = errorMessage;
    errorElement.classList.remove('hidden');
  } else {
    field?.classList.remove('error-field');
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
  }
}

/**
 * Clear all form errors
 */
function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  
  const errorElements = form.querySelectorAll('.form-error');
  errorElements.forEach(el => {
    el.textContent = '';
    el.classList.add('hidden');
  });
  
  const fields = form.querySelectorAll('[id$="Error"]');
  fields.forEach(el => el.classList.add('hidden'));
}

/**
 * Validate Email Format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Password (minimum 6 characters)
 */
function isValidPassword(password) {
  return password.length >= 6;
}

/**
 * Format Date (YYYY-MM-DD to DD/MM/YYYY)
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format Date for Display (full format)
 */
function formatDateFull(dateStr) {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

/**
 * Calculate Days Difference
 */
function calculateDaysDiff(date1Str, date2Str) {
  if (!date1Str || !date2Str) return 0;
  
  const date1 = new Date(date1Str);
  const date2 = new Date(date2Str);
  
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculate Days Overdue
 * Returns 0 if not overdue, else number of days past due
 */
function calculateDaysOverdue(dueDate) {
  if (!dueDate) return 0;
  
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Calculate Fine (₹2 per day)
 */
function calculateFine(issuedBook) {
  if (!issuedBook || !issuedBook.dueDate) return 0;
  
  const daysOverdue = calculateDaysOverdue(issuedBook.dueDate);
  return daysOverdue * 2; // ₹2 per day
}

/**
 * Get Greeting Based on Time
 */
function getGreeting() {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good Morning';
  } else if (hour < 18) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}

/**
 * Format Current Date
 */
function getCurrentDateFormatted() {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return today.toLocaleDateString('en-US', options);
}

/**
 * Get Status Badge HTML
 */
function getStatusBadge(status) {
  const badgeMap = {
    issued: { class: 'badge-blue', text: 'Issued' },
    returned: { class: 'badge-green', text: 'Returned' },
    overdue: { class: 'badge-red', text: 'Overdue' }
  };
  
  const badge = badgeMap[status] || badgeMap.issued;
  return `<span class="badge ${badge.class}">${badge.text}</span>`;
}

/**
 * Get Availability Badge
 */
function getAvailabilityBadge(available) {
  if (available > 0) {
    return `<span class="badge badge-green">Available: ${available}</span>`;
  } else {
    return `<span class="badge badge-red">Unavailable</span>`;
  }
}

/**
 * Make API Call with Auth Token
 */
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`/api${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'API Error',
        data
      };
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Check if User is Authenticated
 */
function isAuthenticated() {
  return !!localStorage.getItem('token');
}

/**
 * Get Current User from LocalStorage
 */
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

/**
 * Logout User
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

/**
 * Redirect Based on Role
 */
function redirectBasedOnRole(user) {
  if (user.role === 'admin') {
    window.location.href = '/admin.html';
  } else if (user.role === 'student') {
    window.location.href = '/catalog.html';
  }
}

/**
 * Confirm Dialog
 */
function confirm(message) {
  return window.confirm(message);
}

/**
 * Sort Array by Property
 */
function sortBy(array, property, ascending = true) {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
}

/**
 * Filter Array by Property
 */
function filterBy(array, property, value) {
  return array.filter(item => item[property] === value);
}

/**
 * Search in Array
 */
function searchArray(array, searchTerm, fields) {
  if (!searchTerm) return array;
  
  const term = searchTerm.toLowerCase();
  return array.filter(item => {
    return fields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    });
  });
}

/**
 * Debounce Function
 */
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Update Current Date in Header
 */
function updateCurrentDate() {
  const currentDateElement = document.getElementById('currentDate');
  if (currentDateElement) {
    currentDateElement.textContent = getCurrentDateFormatted();
  }
}

// Update date on page load and every minute
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updateCurrentDate);
} else {
  updateCurrentDate();
}

setInterval(updateCurrentDate, 60000);
