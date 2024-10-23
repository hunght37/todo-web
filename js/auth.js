// Shared authentication logic
function checkAuth() {
  const username = localStorage.getItem('currentUser');
  if (!username) {
    window.location.href = 'index.html';
    return false;
  }
  return username;
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}
