const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');

// Initialize the database when the page loads
initDB().then(() => {
  console.log("Database initialized successfully");
}).catch((error) => {
  console.error("Error initializing database:", error);
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const user = await getUser(username);
    if (user && user.password === password) {
      window.location.href = 'todo.html';
    } else {
      errorDiv.classList.remove('hidden');
    }
  } catch (error) {
    console.error("Error during login:", error);
    errorDiv.classList.remove('hidden');
  }
});