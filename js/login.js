const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');

initDB().then(() => console.log("Database initialized"))
  .catch(error => console.error("Database error:", error));

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const user = await getUser(username);
    if (user && user.password === password) {
      localStorage.setItem('currentUser', username);
      window.location.href = 'todo.html';
    } else {
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    console.error("Login error:", error);
    errorDiv.classList.remove('hidden');
  }
});
