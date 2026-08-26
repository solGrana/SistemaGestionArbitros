// theme.js — modo oscuro/claro

function applyThemeIcon() {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  });
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
  applyThemeIcon();
}

document.addEventListener('DOMContentLoaded', applyThemeIcon);
