// Initialize variables
const registerForm = document.getElementById('registerForm');
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
    '<span class="spinner mr-2"></span> Creating account...' : 
    'Register';
}

// Main registration handler
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  // Prevent multiple submissions
  if (isLoading) return;

  const submitButton = registerForm.querySelector('button[type="submit"]');
  const username = DOMPurify.sanitize(document.getElementById('username').value.trim());
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Basic validation
  if (!username || !password) {
    showError('Please enter both username and password');
    return;
  }

  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  if (password.length < 8) {
    showError('Password must be at least 8 characters long');
    return;
  }

  try {
    isLoading = true;
    clearError();
    updateButtonState(submitButton, true);

    // Check if user already exists
    const existingUser = await getUser(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Add new user
    await addUser(username, password);
    
    // Redirect to login page
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 100);

  } catch (error) {
    showError(error.message);
    console.error('Registration error:', error);
  } finally {
    isLoading = false;
    updateButtonState(submitButton, false);
  }
});

// Clear error when user starts typing
['username', 'password', 'confirmPassword'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', clearError);
});