function checkPasswordStrength(password) {
  let score = 0;
  let feedback = [];

  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += password.length > 12 ? 2 : 1;
  }

  // Complexity checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Add numbers');
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  } else {
    feedback.push('Add special characters');
  }

  // Repeated characters
  if (/(.)\1{2,}/.test(password)) {
    score--;
    feedback.push('Avoid repeated characters');
  }

  // Common patterns
  if (/^(?:123|abc|qwe)/i.test(password)) {
    score--;
    feedback.push('Avoid common patterns');
  }

  return {
    score: Math.max(0, Math.min(5, score)),
    feedback: feedback.join(', ') || 'Password strength is good'
  };
}

function updatePasswordStrength() {
  const password = document.getElementById('password').value;
  const strengthMeter = document.querySelector('.password-strength');
  const feedbackElement = document.getElementById('password-feedback');
  
  const { score, feedback } = checkPasswordStrength(password);
  
  // Update strength meter
  strengthMeter.className = 'password-strength';
  strengthMeter.style.width = `${(score / 5) * 100}%`;
  
  if (score <= 1) {
    strengthMeter.classList.add('weak');
  } else if (score <= 3) {
    strengthMeter.classList.add('medium');
  } else {
    strengthMeter.classList.add('strong');
  }

  // Update feedback
  feedbackElement.textContent = feedback;
}

// Add event listener
document.getElementById('password')?.addEventListener('input', updatePasswordStrength);