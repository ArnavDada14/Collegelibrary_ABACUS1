// ============================================
// AUTHENTICATION HANDLER
// ============================================

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleBtn = document.getElementById('toggleBtn');
const toggleText = document.getElementById('toggleText');

// LOGIN FORM ELEMENTS
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');

// REGISTER FORM ELEMENTS
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const registerStudentId = document.getElementById('registerStudentId');
const registerRole = document.getElementById('registerRole');
const registerSubmitBtn = document.getElementById('registerSubmitBtn');

let isLoginMode = true;

/**
 * Initialize Authentication Page
 */
function initAuthPage() {
  // Check if already logged in
  if (isAuthenticated()) {
    const user = getCurrentUser();
    redirectBasedOnRole(user);
  }

  // Add event listeners
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  toggleBtn.addEventListener('click', toggleAuthMode);
}

/**
 * Toggle Between Login and Register Modes
 */
function toggleAuthMode(e) {
  e.preventDefault();
  isLoginMode = !isLoginMode;

  if (isLoginMode) {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    toggleText.innerHTML = "Don't have an account? <button type=\"button\" id=\"toggleBtn\">Register here</button>";
    document.getElementById('toggleBtn').addEventListener('click', toggleAuthMode);
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    toggleText.innerHTML = "Already have an account? <button type=\"button\" id=\"toggleBtn\">Sign in here</button>";
    document.getElementById('toggleBtn').addEventListener('click', toggleAuthMode);
  }

  // Clear forms and errors
  clearFormErrors(isLoginMode ? 'registerForm' : 'loginForm');
}

/**
 * Validate Login Form
 */
function validateLoginForm() {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  let isValid = true;

  // Clear previous errors
  clearFormErrors('loginForm');

  // Validate email
  if (!email) {
    setFieldError('loginEmail', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    setFieldError('loginEmail', 'Please enter a valid email');
    isValid = false;
  }

  // Validate password
  if (!password) {
    setFieldError('loginPassword', 'Password is required');
    isValid = false;
  }

  return isValid;
}

/**
 * Validate Register Form
 */
function validateRegisterForm() {
  const name = registerName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();
  const confirmPassword = registerConfirmPassword.value.trim();
  const studentId = registerStudentId.value.trim();
  const role = registerRole.value.trim();
  let isValid = true;

  // Clear previous errors
  clearFormErrors('registerForm');

  // Validate name
  if (!name) {
    setFieldError('registerName', 'Full name is required');
    isValid = false;
  } else if (name.length < 2) {
    setFieldError('registerName', 'Name must be at least 2 characters');
    isValid = false;
  }

  // Validate email
  if (!email) {
    setFieldError('registerEmail', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    setFieldError('registerEmail', 'Please enter a valid email');
    isValid = false;
  }

  // Validate student ID
  if (!studentId) {
    setFieldError('registerStudentId', 'Student ID is required');
    isValid = false;
  }

  // Validate password
  if (!password) {
    setFieldError('registerPassword', 'Password is required');
    isValid = false;
  } else if (!isValidPassword(password)) {
    setFieldError('registerPassword', 'Password must be at least 6 characters');
    isValid = false;
  }

  // Validate confirm password
  if (!confirmPassword) {
    setFieldError('registerConfirmPassword', 'Please confirm your password');
    isValid = false;
  } else if (password !== confirmPassword) {
    setFieldError('registerConfirmPassword', 'Passwords do not match');
    isValid = false;
  }

  // Validate role
  if (!role) {
    setFieldError('registerRole', 'Please select a role');
    isValid = false;
  }

  return isValid;
}

/**
 * Handle Login
 */
async function handleLogin(e) {
  e.preventDefault();

  if (!validateLoginForm()) {
    showToast('Please fix the errors above', 'error');
    return;
  }

  setButtonLoading('loginSubmitBtn', true);

  try {
    const loginData = {
      email: loginEmail.value.trim(),
      password: loginPassword.value.trim()
    };

    const response = await apiCall('/auth/login', 'POST', loginData);

    // Store token and user info
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    showToast('Login successful!', 'success', 2000);

    // Redirect based on role
    setTimeout(() => {
      redirectBasedOnRole(response.user);
    }, 1000);
  } catch (error) {
    console.error('Login error:', error);
    const message = error.message || 'Login failed. Please check your credentials.';
    showToast(message, 'error');
  } finally {
    setButtonLoading('loginSubmitBtn', false);
  }
}

/**
 * Handle Register
 */
async function handleRegister(e) {
  e.preventDefault();

  if (!validateRegisterForm()) {
    showToast('Please fix the errors above', 'error');
    return;
  }

  setButtonLoading('registerSubmitBtn', true);

  try {
    const registerData = {
      name: registerName.value.trim(),
      email: registerEmail.value.trim(),
      password: registerPassword.value.trim(),
      studentId: registerStudentId.value.trim(),
      role: registerRole.value.trim()
    };

    const response = await apiCall('/auth/register', 'POST', registerData);

    // Auto-login after registration
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    showToast('Registration successful! Welcome to the Library System', 'success', 2000);

    // Redirect based on role
    setTimeout(() => {
      redirectBasedOnRole(response.user);
    }, 1500);
  } catch (error) {
    console.error('Register error:', error);
    let message = error.message || 'Registration failed. Please try again.';
    
    // Handle specific error messages
    if (error.message && error.message.includes('already exists')) {
      message = 'Email already registered. Please login or use a different email.';
      setFieldError('registerEmail', message);
    }
    
    showToast(message, 'error');
  } finally {
    setButtonLoading('registerSubmitBtn', false);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthPage);
} else {
  initAuthPage();
}
