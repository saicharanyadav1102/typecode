/* ============================================
   ADMIN JS — typeCode
   Admin panel: tab switching, analytics, CRUD
   ============================================ */
(function () {
  'use strict';

  // ---- Tab switching ----
  document.querySelectorAll('#admin-tabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#admin-tabs .tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('.admin-section').forEach(function (s) { s.classList.remove('active'); });
      tab.classList.add('active');
      var section = document.getElementById('section-' + tab.dataset.section);
      if (section) section.classList.add('active');
    });
  });

  // ---- Analytics ----
  async function loadAnalytics() {
    try {
      var data = await API.adminGetAnalytics();
      if (data && data.data) {
        var d = data.data;
        setVal('admin-total-users', d.total_users);
        setVal('admin-new-users', d.new_users_this_week);
        setVal('admin-total-tests', d.total_tests);
        setVal('admin-avg-wpm', d.avg_wpm);
        setVal('admin-tests-week', d.tests_this_week);
        setVal('admin-total-content', (d.total_texts || 0) + (d.total_snippets || 0));
      }
    } catch (e) {
      console.log('Admin analytics unavailable');
    }
  }

  // ---- Users ----
  async function loadUsers() {
    try {
      var data = await API.adminGetUsers({ page: 1, limit: 50 });
      if (data && data.data) renderUsers(data.data);
    } catch (e) { console.log('Admin users unavailable'); }
  }

  function renderUsers(users) {
    var tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    users.forEach(function (u) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + u.id + '</td>' +
        '<td style="font-weight:600;">' + u.username + '</td>' +
        '<td>' + u.email + '</td>' +
        '<td><span class="badge ' + (u.role === 'admin' ? 'badge-warning' : 'badge-accent') + '">' + u.role + '</span></td>' +
        '<td><span class="badge ' + (u.is_active ? 'badge-success' : 'badge-error') + '">' + (u.is_active ? 'Active' : 'Banned') + '</span></td>' +
        '<td class="content-actions">' +
          '<button class="btn btn-ghost btn-sm toggle-ban-btn" data-id="' + u.id + '" data-active="' + u.is_active + '">' +
            (u.is_active ? '🚫' : '✅') +
          '</button>' +
        '</td>';
      tbody.appendChild(tr);
    });

    // Ban/unban handlers
    document.querySelectorAll('.toggle-ban-btn').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.dataset.id;
        var isActive = btn.dataset.active === 'true';
        try {
          await API.adminUpdateUser(id, { is_active: !isActive });
          App.showToast('User updated', 'success');
          loadUsers();
        } catch (e) { App.showToast('Update failed', 'error'); }
      });
    });
  }

  // ---- Add Text Form ----
  var textForm = document.getElementById('add-text-form');
  if (textForm) {
    textForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var content = document.getElementById('text-content').value.trim();
      if (!content) { App.showToast('Content is required', 'error'); return; }
      try {
        await API.adminAddText({
          content: content,
          difficulty: document.getElementById('text-difficulty').value,
          category: document.getElementById('text-category').value,
        });
        App.showToast('Text added!', 'success');
        textForm.reset();
      } catch (e) { App.showToast('Failed to add text', 'error'); }
    });
  }

  // ---- Add Snippet Form ----
  var snippetForm = document.getElementById('add-snippet-form');
  if (snippetForm) {
    snippetForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var content = document.getElementById('snippet-content').value.trim();
      var title = document.getElementById('snippet-title').value.trim();
      if (!content || !title) { App.showToast('Title and code are required', 'error'); return; }
      try {
        await API.adminAddSnippet({
          title: title,
          content: content,
          language: document.getElementById('snippet-language').value,
          difficulty: document.getElementById('snippet-difficulty').value,
        });
        App.showToast('Snippet added!', 'success');
        snippetForm.reset();
      } catch (e) { App.showToast('Failed to add snippet', 'error'); }
    });
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ---- Init ----
  loadAnalytics();
  loadUsers();
})();
