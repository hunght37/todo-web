const registerForm = document.getElementById('registerForm');
const errorDiv = document.getElementById('error');

// Initialize the database when the page loads
initDB().then(() => {
  console.log("Database initialized successfully");
}).catch((error) => {
  console.error("Error initializing database:", error);
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    errorDiv.textContent = 'Mật khẩu không khớp!';
    errorDiv.classList.remove('hidden');
  } else {
    try {
      await addUser(username, password);
      window.location.href = 'index.html';
    } catch (error) {
      errorDiv.textContent = 'Lỗi đăng ký: ' + error;
      errorDiv.classList.remove('hidden');
    }
  }
});