function checkPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.match(/[a-z]+/)) strength++;
  if (password.match(/[A-Z]+/)) strength++;
  if (password.match(/[0-9]+/)) strength++;
  if (password.match(/[$@#&!]+/)) strength++;
  return strength;
}

function updatePasswordStrength() {
  const password = document.getElementById('password').value;
  const strengthMeter = document.getElementById('password-strength');
  const strength = checkPasswordStrength(password);
  
  strengthMeter.className = 'mt-1 h-2 w-full rounded-full';
  switch (strength) {
    case 0:
    case 1:
      strengthMeter.classList.add('bg-red-500');
      break;
    case 2:
    case 3:
      strengthMeter.classList.add('bg-yellow-500');
      break;
    case 4:
    case 5:
      strengthMeter.classList.add('bg-green-500');
      break;
  }
}
