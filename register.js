// public/js/register.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const errorBox = document.getElementById('registerError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.textContent = '';

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        errorBox.textContent = result.message || 'Registration failed.';
        return;
      }

      alert('Registration successful! You may now log in.');
      window.location.href = '/pages/login.html';
    } catch (err) {
      console.error(err);
      errorBox.textContent = 'Network error. Please try again.';
    }
  });
});