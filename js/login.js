// Initialize variables
const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');
let isLoading = false;

// Initialize database when page loads
initDB().then(() => {
  console.log("Database initialized");
}).catch(error => {
  showError("Database initialization failed. Please refresh the page.");
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

// Main login handler
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  // Prevent multiple submissions
  if (isLoading) return;

  const submitButton = loginForm.querySelector('button[type="submit"]');
  const username = DOMPurify.sanitize(document.getElementById('username').value.trim());
  const password = document.getElementById('password').value;

  // Basic validation
  if (!username || !password) {
    showError('Please enter both username and password');
    return;
  }

  try {
    isLoading = true;
    clearError();
    updateButtonState(submitButton, true);

    // Check rate limiting
    if (!await checkRateLimit(username)) {
      throw new Error('Too many login attempts. Please try again in 15 minutes.');
    }

    // Get user and verify credentials
    const user = await getUser(username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      await updateLoginAttempts(username);
      throw new Error('Invalid username or password');
    }

    // Successful login
    await updateLoginAttempts(username, true); // Reset login attempts
    localStorage.setItem('currentUser', username);
    
    // Redirect with a slight delay to ensure localStorage is set
    setTimeout(() => {
      window.location.href = 'todo.html';
    }, 100);

  } catch (error) {
    showError(error.message);
    console.error('Login error:', error);
  } finally {
    isLoading = false;
    updateButtonState(submitButton, false);
  }
});

// Clear error when user starts typing
['username', 'password'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', clearError);
});