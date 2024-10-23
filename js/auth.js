// Shared authentication logic
function checkAuth() {
  const username = localStorage.getItem('currentUser');
  if (!username) {
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 100);
    return false;
  }
  return username;
}

function logout() {
  localStorage.removeItem('currentUser');
  // Add a small delay to ensure smooth transition
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 100);
}

// Check if user is already logged in on login/register pages
function checkAlreadyLoggedIn() {
  const username = localStorage.getItem('currentUser');
  if (username && (window.location.pathname.endsWith('index.html') || 
                   window.location.pathname.endsWith('register.html'))) {
    window.location.href = 'todo.html';
    return true;
  }
  return false;
}

// Run check on login/register pages
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAlreadyLoggedIn);
} else {
  checkAlreadyLoggedIn();
}