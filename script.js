const passwordInput = document.getElementById('password');
const togglePasswordButton = document.getElementById('toggle-password');
const checkStrengthButton = document.getElementById('check-strength');
const strengthLabel = document.getElementById('strength-label');
const strengthBar = document.getElementById('strength-bar');
const scoreElement = document.getElementById('score');
const feedbackList = document.getElementById('feedback-list');
const suggestionsList = document.getElementById('suggestions-list');
const meterTrack = document.querySelector('.meter__track');

const lengthInput = document.getElementById('length');
const lengthValue = document.getElementById('length-value');
const useUppercase = document.getElementById('use-uppercase');
const useLowercase = document.getElementById('use-lowercase');
const useNumbers = document.getElementById('use-numbers');
const useSymbols = document.getElementById('use-symbols');
const generatedPasswordInput = document.getElementById('generated-password');
const generatePasswordButton = document.getElementById('generate-password');
const copyPasswordButton = document.getElementById('copy-password');
const copyStatus = document.getElementById('copy-status');

const commonPasswords = new Set([
  'password',
  'password123',
  'admin',
  'qwerty',
  '123456',
  'letmein',
  'welcome',
  'iloveyou',
  'abc123'
]);

const sequentialStrings = ['abcdefghijklmnopqrstuvwxyz', '0123456789', 'qwertyuiopasdfghjklzxcvbnm'];

const strengthLevels = [
  { label: 'Very Weak', color: '#ff3b30', min: 0 },
  { label: 'Weak', color: '#ff9500', min: 25 },
  { label: 'Medium', color: '#ffd60a', min: 45 },
  { label: 'Strong', color: '#9ef01a', min: 65 },
  { label: 'Very Strong', color: '#39ff14', min: 85 }
];

function containsSequentialPattern(password) {
  const lowered = password.toLowerCase();
  for (const sequence of sequentialStrings) {
    for (let i = 0; i <= sequence.length - 3; i += 1) {
      const chunk = sequence.slice(i, i + 3);
      if (lowered.includes(chunk)) {
        return true;
      }
    }
  }

  for (let i = 0; i <= lowered.length - 3; i += 1) {
    const a = lowered.charCodeAt(i);
    const b = lowered.charCodeAt(i + 1);
    const c = lowered.charCodeAt(i + 2);
    if (b === a + 1 && c === b + 1) {
      return true;
    }
  }

  return false;
}

function evaluatePassword(password) {
  let score = 0;

  const checks = {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9\s]/.test(password),
    isLongEnough: password.length >= 8,
    noSpaces: !/\s/.test(password),
    repeatedCharacters: /(.)\1+/.test(password),
    commonPassword: commonPasswords.has(password.toLowerCase()),
    sequential: containsSequentialPattern(password)
  };

  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (checks.hasUppercase) score += 12;
  if (checks.hasLowercase) score += 12;
  if (checks.hasNumber) score += 12;
  if (checks.hasSpecial) score += 16;
  if (checks.noSpaces && password.length > 0) score += 8;

  if (!checks.noSpaces) score -= 15;
  if (checks.repeatedCharacters) score -= 14;
  if (checks.commonPassword) score -= 35;
  if (checks.sequential) score -= 16;

  score = Math.min(100, Math.max(0, score));

  return {
    score,
    checks
  };
}

function getStrengthLevel(score) {
  for (let i = strengthLevels.length - 1; i >= 0; i -= 1) {
    if (score >= strengthLevels[i].min) {
      return strengthLevels[i];
    }
  }
  return strengthLevels[0];
}

function buildFeedback(checks) {
  return [
    [checks.hasUppercase, 'Contains uppercase letters'],
    [checks.hasLowercase, 'Contains lowercase letters'],
    [checks.hasNumber, 'Contains numbers'],
    [checks.hasSpecial, 'Contains special characters'],
    [checks.isLongEnough, 'At least 8 characters long'],
    [checks.noSpaces, 'No spaces used'],
    [!checks.commonPassword, 'Avoid common passwords'],
    [!checks.repeatedCharacters, 'Avoid repeated characters'],
    [!checks.sequential, 'Avoid sequential patterns']
  ];
}

function buildSuggestions(checks) {
  const suggestions = [];
  if (!checks.isLongEnough) suggestions.push('Increase length to at least 8 characters (12+ recommended).');
  if (!checks.hasUppercase) suggestions.push('Add uppercase letters (A-Z).');
  if (!checks.hasLowercase) suggestions.push('Add lowercase letters (a-z).');
  if (!checks.hasNumber) suggestions.push('Add numbers (0-9).');
  if (!checks.hasSpecial) suggestions.push('Add symbols like !@#$%^&*.');
  if (!checks.noSpaces) suggestions.push('Remove spaces from your password.');
  if (checks.commonPassword) suggestions.push('Avoid common passwords and predictable variants.');
  if (checks.repeatedCharacters) suggestions.push('Avoid repeated character patterns like aaa or 111.');
  if (checks.sequential) suggestions.push('Avoid sequences like abc, 123, or qwerty.');

  if (!suggestions.length) {
    suggestions.push('Great password! Keep using unique passwords for every account.');
  }

  return suggestions;
}

function renderChecklist(listElement, items) {
  listElement.innerHTML = '';
  items.forEach(([passed, text]) => {
    const item = document.createElement('li');
    item.className = passed ? 'ok' : 'fail';
    item.textContent = `${passed ? '✓' : '✗'} ${text}`;
    listElement.appendChild(item);
  });
}

function renderSuggestions(suggestions) {
  suggestionsList.innerHTML = '';
  suggestions.forEach((suggestion) => {
    const item = document.createElement('li');
    item.textContent = suggestion;
    suggestionsList.appendChild(item);
  });
}

function updateStrength() {
  const password = passwordInput.value;
  const { score, checks } = evaluatePassword(password);
  const level = getStrengthLevel(score);

  scoreElement.textContent = String(score);
  strengthLabel.textContent = level.label;
  strengthBar.style.width = `${score}%`;
  strengthBar.style.backgroundColor = level.color;
  meterTrack.setAttribute('aria-valuenow', String(score));

  renderChecklist(feedbackList, buildFeedback(checks));
  renderSuggestions(buildSuggestions(checks));
}

function getRandomInt(max) {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return values[0] % max;
}

function shuffle(text) {
  const chars = text.split('');
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = getRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function generatePassword() {
  const selectedSets = [];
  if (useUppercase.checked) selectedSets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if (useLowercase.checked) selectedSets.push('abcdefghijklmnopqrstuvwxyz');
  if (useNumbers.checked) selectedSets.push('0123456789');
  if (useSymbols.checked) selectedSets.push('!@#$%^&*()_+-=[]{}|;:,.<>?');

  if (!selectedSets.length) {
    copyStatus.textContent = 'Select at least one character set.';
    return;
  }

  const length = Number(lengthInput.value);
  const allChars = selectedSets.join('');
  let generated = '';

  selectedSets.forEach((set) => {
    generated += set[getRandomInt(set.length)];
  });

  while (generated.length < length) {
    generated += allChars[getRandomInt(allChars.length)];
  }

  generated = shuffle(generated).slice(0, length);
  generatedPasswordInput.value = generated;
  copyStatus.textContent = 'Password generated.';
  passwordInput.value = generated;
  updateStrength();
}

async function copyPassword() {
  const text = generatedPasswordInput.value;
  if (!text) {
    copyStatus.textContent = 'Generate a password first.';
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = 'Password copied to clipboard.';
  } catch (error) {
    generatedPasswordInput.select();
    document.execCommand('copy');
    copyStatus.textContent = 'Password copied using fallback copy.';
  }
}

lengthInput.addEventListener('input', () => {
  lengthValue.textContent = lengthInput.value;
});

passwordInput.addEventListener('input', updateStrength);
checkStrengthButton.addEventListener('click', updateStrength);

togglePasswordButton.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  togglePasswordButton.textContent = isHidden ? 'Hide' : 'Show';
  togglePasswordButton.setAttribute('aria-pressed', String(isHidden));
});

generatePasswordButton.addEventListener('click', generatePassword);
copyPasswordButton.addEventListener('click', copyPassword);

updateStrength();
