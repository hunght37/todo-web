// Initialize variables
const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');
let isLoading = false;
let dbInitialized = false;

class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

// Initialize database when page loads
initDB().then(() => {
  dbInitialized = true;
  console.log("Database initialized");
}).catch(error => {
  showError(error.message || "Database initialization failed");
  console.error("Database error:", error);
});

// Helper function to show error messages
function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

// Helper function to clear error messages
function clearError() {
  errorDiv.textContent = '';
  errorDiv.classList.add('hidden');
}

// Helper function to update button state
function updateButtonState(button, loading) {
  button.disabled = loading;
  button.innerHTML = loading ? 
    '<span class="spinner mr-2"></span> Logging in...' : 
    'Login';
}

// Validate login input
function validateLoginInput(username, password) {
  if (!username) {
    throw new AuthError('Username is required', 'MISSING_USERNAME');
  }
  if (!password) {
    throw new AuthError('Password is required', 'MISSING_PASSWORD');
  }
  if (username.length < 3) {
    throw new AuthError('Username must be at least 3 characters long', 'INVALID_USERNAME');
  }
  if (password.length < 8) {
    throw new AuthError('Password must be at least 8 characters long', 'INVALID_PASSWORD');
  }
}

// Main login handler
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  if (isLoading) return;
  
  if (!dbInitialized) {
    showError('Please wait for database initialization');
    return;
  }

  const submitButton = loginForm.querySelector('button[type="submit"]');
  const username = DOMPurify.sanitize(document.getElementById('username').value.trim());
  const password = document.getElementById('password').value;

  try {
    isLoading = true;
    clearError();
    updateButtonState(submitButton, true);

    // Validate input
    validateLoginInput(username, password);

    // Check rate limiting
    const canLogin = await checkRateLimit(username);
    if (!canLogin) {
      throw new AuthError('Too many login attempts. Please try again in 15 minutes.', 'RATE_LIMIT');
    }

    // Get user and verify credentials
    const user = await getUser(username);
    if (!user) {
      throw new AuthError('Invalid username or password', 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await updateLoginAttempts(username);
      throw new AuthError('Invalid username or password', 'INVALID_CREDENTIALS');
    }

    // Successful login
    await updateLoginAttempts(username, true);
    localStorage.setItem('currentUser', username);
    
    window.location.href = 'todo.html';

  } catch (error) {
    const errorMessage = error instanceof AuthError ? 
      error.message : 
      'An unexpected error occurred. Please try again.';
    
    showError(errorMessage);
    console.error('Login error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  } finally {
    isLoading = false;
    updateButtonState(submitButton, false);
  }
});

// Clear error when user starts typing
['username', 'password'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', clearError);
});