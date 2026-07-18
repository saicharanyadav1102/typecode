/* ============================================
   AUTH — typeCode
   Login & Register form handling
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // LOGIN FORM
  // ============================================
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    // Redirect if already logged in
    if (API.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return;
    }

    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();

      var email = document.getElementById('login-email').value.trim();
      var password = document.getElementById('login-password').value;

      // Client-side validation
      var valid = true;
      if (!email || !isValidEmail(email)) {
        showFieldError('login-email', 'Please enter a valid email address');
        valid = false;
      }
      if (!password || password.length < 6) {
        showFieldError('login-password', 'Password must be at least 6 characters');
        valid = false;
      }
      if (!valid) return;

      // Submit
      var submitBtn = loginForm.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      try {
        await API.login(email, password);
        App.showToast('Welcome back!', 'success');
        setTimeout(function () {
          window.location.href = 'dashboard.html';
        }, 500);
      } catch (err) {
        App.showToast(err.message || 'Login failed', 'error');
        if (err.status === 401) {
          showFieldError('login-password', 'Invalid email or password');
        }
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }

  // ============================================
  // REGISTER FORM
  // ============================================
  var registerForm = document.getElementById('register-form');
  if (registerForm) {
    // Redirect if already logged in
    if (API.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return;
    }

    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();

      var username = document.getElementById('reg-username').value.trim();
      var email = document.getElementById('reg-email').value.trim();
      var password = document.getElementById('reg-password').value;
      var confirm = document.getElementById('reg-confirm').value;

      // Client-side validation
      var valid = true;
      if (!username || username.length < 3) {
        showFieldError('reg-username', 'Username must be at least 3 characters');
        valid = false;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        showFieldError('reg-username', 'Username can only contain letters, numbers, and underscores');
        valid = false;
      }
      var emailError = getRegistrationEmailError(email);
      if (emailError) {
        showFieldError('reg-email', emailError);
        valid = false;
      }

      var passwordErrors = getPasswordRuleErrors(password);
      if (passwordErrors.length > 0) {
        showFieldError('reg-password', 'Password must include ' + passwordErrors.join(', '));
        valid = false;
      }
      if (password !== confirm) {
        showFieldError('reg-confirm', 'Passwords do not match');
        valid = false;
      }
      if (!valid) return;

      // Submit
      var submitBtn = registerForm.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      try {
        await API.register(username, email, password);
        App.showToast('Account created! Welcome to typeCode', 'success');
        setTimeout(function () {
          window.location.href = 'dashboard.html';
        }, 500);
      } catch (err) {
        App.showToast(err.message || 'Registration failed', 'error');
        if (err.data && err.data.field) {
          showFieldError('reg-' + err.data.field, err.message);
        }
      } finally {
        setLoading(submitBtn, false);
      }
    });
  }

  // ============================================
  // PASSWORD VISIBILITY TOGGLE
  // ============================================
  document.querySelectorAll('.password-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = 'Hide';
      } else {
        input.type = 'password';
        btn.textContent = 'Show';
      }
    });
  });

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getRegistrationEmailError(email) {
    if (!email) return 'Email is required';
    var emailPattern = /^(?=.{6,254}$)(?!.*\.\.)[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
    if (!emailPattern.test(email)) {
      return 'Enter a valid email address, such as name@domain.com';
    }

    var parts = email.toLowerCase().split('@');
    var domain = parts[parts.length - 1];
    var blockedDomains = [
      'example.com',
      'example.net',
      'example.org',
      'mailinator.com',
      'tempmail.com',
      'temp-mail.org',
      '10minutemail.com',
      'guerrillamail.com',
      'yopmail.com',
      'fakeemail.com',
      'fakemail.com',
    ];

    var blockedSuffixes = ['.example', '.invalid', '.localhost', '.local', '.test'];
    if (blockedDomains.indexOf(domain) !== -1 ||
        blockedSuffixes.some(function (suffix) { return domain.endsWith(suffix); })) {
      return 'Use a real email domain, not a test or disposable email';
    }

    return null;
  }

  function getPasswordRuleErrors(password) {
    var errors = [];
    if (!password || password.length < 6) errors.push('at least 6 characters');
    if (!/[A-Z]/.test(password || '')) errors.push('one uppercase letter');
    if (!/\d/.test(password || '')) errors.push('one digit');
    if (!/[^A-Za-z0-9]/.test(password || '')) errors.push('one special character');
    return errors;
  }

  function showFieldError(fieldId, message) {
    var group = document.getElementById(fieldId);
    if (group) group = group.closest('.form-group');
    if (group) {
      group.classList.add('error');
      var err = group.querySelector('.form-error');
      if (err) err.textContent = message;
    }
  }

  function clearErrors() {
    document.querySelectorAll('.form-group.error').forEach(function (g) {
      g.classList.remove('error');
    });
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.innerHTML = '<span class="spinner"></span> Please wait...';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || 'Submit';
    }
  }

})();
