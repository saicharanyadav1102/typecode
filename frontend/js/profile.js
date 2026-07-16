/* ============================================
   PROFILE JS — typeCode
   ============================================ */
(function () {
  'use strict';

  // Load profile data
  async function loadProfile() {
    var user = API.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    // Set display values
    setVal('profile-username', user.username || 'User');
    setVal('profile-email', user.email || '');
    setVal('profile-avatar', (user.username || 'U').charAt(0).toUpperCase());
    setVal('profile-joined', user.created_at ? App.formatDate(user.created_at) : '—');

    // Fill form
    var nameInput = document.getElementById('profile-name-input');
    var bioInput = document.getElementById('profile-bio-input');
    if (nameInput) nameInput.value = user.username || '';
    if (bioInput) bioInput.value = user.bio || '';

    // Try to get fresh data from API
    try {
      var data = await API.getProfile();
      if (data && data.data) {
        var p = data.data;
        setVal('profile-username', p.username);
        setVal('profile-email', p.email);
        if (nameInput) nameInput.value = p.username;
        if (bioInput) bioInput.value = p.bio || '';
        API.setUser(p);
      }
    } catch (e) {
      console.log('Profile: API unavailable, using cached data');
    }
  }

  // Edit profile form
  var profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var username = document.getElementById('profile-name-input').value.trim();
      var bio = document.getElementById('profile-bio-input').value.trim();

      try {
        await API.updateProfile({ username: username, bio: bio });
        App.showToast('Profile updated!', 'success');
        var user = API.getUser();
        user.username = username;
        user.bio = bio;
        API.setUser(user);
        setVal('profile-username', username);
        setVal('profile-avatar', username.charAt(0).toUpperCase());
      } catch (err) {
        App.showToast(err.message || 'Update failed', 'error');
      }
    });
  }

  // Change password form
  var passwordForm = document.getElementById('password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var current = document.getElementById('current-password').value;
      var newPw = document.getElementById('new-password').value;
      var confirm = document.getElementById('confirm-new-password').value;

      var passwordErrors = getPasswordRuleErrors(newPw);
      if (passwordErrors.length > 0) {
        App.showToast('Password must include ' + passwordErrors.join(', '), 'error');
        return;
      }
      if (newPw !== confirm) {
        App.showToast('Passwords do not match', 'error');
        return;
      }

      try {
        await API.changePassword({ current_password: current, new_password: newPw });
        App.showToast('Password changed!', 'success');
        passwordForm.reset();
      } catch (err) {
        App.showToast(err.message || 'Password change failed', 'error');
      }
    });
  }

  // Logout
  var logoutBtn = document.getElementById('profile-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      API.logout();
    });
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function getPasswordRuleErrors(password) {
    var errors = [];
    if (!password || password.length < 6) errors.push('at least 6 characters');
    if (!/[A-Z]/.test(password || '')) errors.push('one uppercase letter');
    if (!/\d/.test(password || '')) errors.push('one digit');
    if (!/[^A-Za-z0-9]/.test(password || '')) errors.push('one special character');
    return errors;
  }

  loadProfile();
})();
