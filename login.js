// login.js — handles login form behavior

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMsg = document.getElementById('errorMsg');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const username = form.username.value.trim();
    const password = form.password.value.trim();
    errorMsg.textContent = '';

    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        errorMsg.textContent = data.message || 'Login failed.';
        return;
      }

      console.log('Login response:', data);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/pages/homepage.html';
    } catch (err) {
      console.error(err);
      errorMsg.textContent = 'Network error. Try again.';
    }
  });
});