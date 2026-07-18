/* ============================================
   GLOBAL APP — typeCode
   Theme toggle, navbar, auth state, toast system
   ============================================ */

const App = (function () {
  'use strict';

  // ============================================
  // THEME MANAGEMENT (dark / light)
  // ============================================
  function initTheme() {
    var saved = localStorage.getItem('tc_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tc_theme', next);
    updateThemeIcon(next);
  }

  function updateThemeIcon(theme) {
    var btn = document.querySelector('.theme-toggle');
    if (btn) btn.innerHTML = theme === 'dark' ? '<span style="font-size:1rem; opacity:0.85;">☀️</span>' : '<span style="font-size:1rem; opacity:0.85;">🌙</span>';
  }

  // ============================================
  // NAVBAR — auth state, mobile menu
  // ============================================
  function initNavbar() {
    // Theme toggle
    var themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

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

    var icons = {
      success: '<span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:rgba(16,185,129,0.2);color:#10b981;font-weight:800;font-size:12px;">✓</span>',
      error: '<span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:rgba(244,63,94,0.2);color:#f43f5e;font-weight:800;font-size:12px;">✕</span>',
      info: '<span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:rgba(56,189,248,0.2);color:#38bdf8;font-weight:800;font-size:12px;">i</span>',
      warning: '<span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:rgba(245,158,11,0.2);color:#f59e0b;font-weight:800;font-size:12px;">!</span>'
    };

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span class="toast-icon">' + (icons[type] || '') + '</span>' +
                      '<span class="toast-msg" style="line-height:1.4;">' + message + '</span>';

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px) scale(0.92)';
      toast.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(function () { toast.remove(); }, 350);
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
  // INIT
  // ============================================
  function init() {
    initTheme();
    initNavbar();
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
  };

})();
