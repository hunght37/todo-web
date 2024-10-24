// Initialize variables
const registerForm = document.getElementById('registerForm');
const errorDiv = document.getElementById('error');
let isLoading = false;
let dbInitialized = false;

class RegistrationError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'RegistrationError';
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
    '<span class="spinner mr-2"></span> Creating account...' : 
    'Create Account';
}

// Validate registration input
function validateRegistrationInput(username, password, confirmPassword) {
  if (!username) {
    throw new RegistrationError('Username is required', 'MISSING_USERNAME');
  }
  if (!password) {
    throw new RegistrationError('Password is required', 'MISSING_PASSWORD');
  }
  if (!confirmPassword) {
    throw new RegistrationError('Please confirm your password', 'MISSING_CONFIRM_PASSWORD');
  }
  if (username.length < 3) {
    throw new RegistrationError('Username must be at least 3 characters long', 'INVALID_USERNAME');
  }
  if (password.length < 8) {
    throw new RegistrationError('Password must be at least 8 characters long', 'INVALID_PASSWORD');
  }
  if (password !== confirmPassword) {
    throw new RegistrationError('Passwords do not match', 'PASSWORD_MISMATCH');
  }
}

// Main registration handler
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  if (isLoading) return;
  
  if (!dbInitialized) {
    showError('Please wait for database initialization');
    return;
  }

  const submitButton = registerForm.querySelector('button[type="submit"]');
  const username = DOMPurify.sanitize(document.getElementById('username').value.trim());
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  try {
    isLoading = true;
    clearError();
    updateButtonState(submitButton, true);

    // Validate input
    validateRegistrationInput(username, password, confirmPassword);

    // Check if user already exists
    const existingUser = await getUser(username);
    if (existingUser) {
      throw new RegistrationError('Username already exists', 'USERNAME_EXISTS');
    }

    // Add new user with proper error handling
    await addUser(username, password);
    
    // Show success message and redirect
    showError('Account created successfully! Redirecting to login...');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);

  } catch (error) {
    const errorMessage = error instanceof RegistrationError || error instanceof DatabaseError ? 
      error.message : 
      'An unexpected error occurred. Please try again.';
    
    showError(errorMessage);
    console.error('Registration error:', {
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
['username', 'password', 'confirmPassword'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', clearError);
});

// Initialize password strength checker
document.getElementById('password')?.addEventListener('input', updatePasswordStrength);