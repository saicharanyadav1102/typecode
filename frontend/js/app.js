/* ============================================
   GLOBAL APP — typeCode
   Theme toggle, navbar, auth state, toast system
   ============================================ */

const App = (function () {
  'use strict';

  // ============================================
  // THEME MANAGEMENT (dark / light)
  // ============================================
  const THEME_TOGGLE_SVGS = `
    <!-- Moon Icon (Dark Mode) -->
    <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <!-- Sun Icon (Light Mode) -->
    <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  `;

  function initTheme() {
    var saved = localStorage.getItem('tc_theme') || localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tc_theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      if (!btn.querySelector('.moon-icon') || !btn.querySelector('.sun-icon')) {
        btn.innerHTML = THEME_TOGGLE_SVGS;
      }
      btn.setAttribute('aria-label', theme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode');
    });
  }

  // ============================================
  // NAVBAR — auth state, mobile menu
  // ============================================
  function initNavbar() {
    // Theme toggle
    document.querySelectorAll('.theme-toggle').forEach(function (themeBtn) {
      themeBtn.addEventListener('click', toggleTheme);
    });

    // Mobile menu
    var menuBtn = document.querySelector('.mobile-menu-btn');
    var nav = document.querySelector('.app-navbar-nav');
    if (menuBtn && nav) {
      menuBtn.addEventListener('click', function () {
        nav.classList.toggle('mobile-open');
        menuBtn.textContent = nav.classList.contains('mobile-open') ? '✕' : '☰';
      });
    }

    // Update navbar based on auth state
    updateNavAuth();

    // User dropdown
    var avatar = document.querySelector('.user-avatar');
    var dropdown = document.querySelector('.user-dropdown');
    if (avatar && dropdown) {
      avatar.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
      document.addEventListener('click', function () {
        dropdown.classList.remove('active');
      });
    }

    // Logout button
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof API !== 'undefined') API.logout();
      });
    }
  }

  function updateNavAuth() {
    var user = null;
    if (typeof API !== 'undefined') user = API.getUser();

    var guestActions = document.querySelector('.nav-guest-actions');
    var userActions = document.querySelector('.nav-user-actions');
    var avatarEl = document.querySelector('.user-avatar');

    if (user) {
      if (guestActions) guestActions.style.display = 'none';
      if (userActions) userActions.style.display = 'flex';
      if (avatarEl) avatarEl.textContent = user.username.charAt(0).toUpperCase();
    } else {
      if (guestActions) guestActions.style.display = 'flex';
      if (userActions) userActions.style.display = 'none';
    }
  }

  // ============================================
  // TOAST NOTIFICATION SYSTEM
  // ============================================
  function showToast(message, type) {
    type = type || 'info';
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    var icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || '') + '</span>' +
                      '<span class="toast-msg">' + message + '</span>';

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(function () { toast.remove(); }, 300);
    }, 4000);
  }

  // ============================================
  // PAGE GUARD (require auth)
  // ============================================
  function requireAuth() {
    if (typeof API !== 'undefined' && !API.isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  function requireAdmin() {
    var user = typeof API !== 'undefined' ? API.getUser() : null;
    if (!user || user.role !== 'admin') {
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  }

  // ============================================
  // UTILITY HELPERS
  // ============================================
  function formatDate(dateStr) {
    var d = parseDateTime(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  function formatDateTime(dateStr) {
    var d = parseDateTime(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function timeAgo(dateStr) {
    var diff = Date.now() - parseDateTime(dateStr).getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    var days = Math.floor(hrs / 24);
    if (days < 30) return days + 'd ago';
    return formatDate(dateStr);
  }

  function parseDateTime(dateStr) {
    if (!dateStr) return new Date(NaN);

    // Backend timestamps are UTC. Older responses may be missing the trailing Z,
    // so normalize ISO strings without a timezone before the browser parses them.
    var hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(dateStr);
    return new Date(hasTimezone ? dateStr : dateStr + 'Z');
  }

  // ============================================
  // INTERACTIVE CARD MOUSE SPOTLIGHT (Editorial Blueprint)
  // ============================================
  function initMouseSpotlight() {
    document.querySelectorAll('.interactive-card, .card, .feature-card, .quick-action-card, .stat-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
    });
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    initTheme();
    initNavbar();
    initMouseSpotlight();
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public interface
  return {
    toggleTheme: toggleTheme,
    showToast: showToast,
    requireAuth: requireAuth,
    requireAdmin: requireAdmin,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    formatTime: formatTime,
    timeAgo: timeAgo,
    updateNavAuth: updateNavAuth,
    initMouseSpotlight: initMouseSpotlight,
  };

})();
