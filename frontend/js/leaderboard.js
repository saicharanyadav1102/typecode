/* ============================================
   LEADERBOARD JS — typeCode
   ============================================ */
(function () {
  'use strict';

  var mode = 'normal';
  var duration = 60;

  async function loadLeaderboard() {
    try {
      var data = await API.getLeaderboard({ mode: mode, duration: duration, page: 1 });
      if (data && data.data) {
        renderTable(data.data);
      }
    } catch (e) {
      console.log('Leaderboard: using sample data (backend unavailable)');
    }
  }

  function renderTable(entries) {
    var tbody = document.getElementById('leaderboard-body');
    if (!tbody || !entries.length) return;
    tbody.innerHTML = '';

    entries.forEach(function (entry, i) {
      var rank = i + 1;
      var badgeClass = '';
      if (rank === 1) { badgeClass = 'badge-warning'; }
      else if (rank === 2) { badgeClass = 'badge-info'; }
      else if (rank === 3) { badgeClass = 'badge-accent'; }

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + (badgeClass ? '<span class="badge ' + badgeClass + '">#' + rank + '</span>' : '#' + rank) + '</td>' +
        '<td style="font-weight:600;color:var(--text-primary);">' + (entry.username || 'User') + '</td>' +
        '<td style="font-family:var(--font-mono);font-weight:700;color:var(--accent-light);">' + Math.round(entry.wpm) + '</td>' +
        '<td>' + (entry.accuracy || 0).toFixed(1) + '%</td>' +
        '<td>' + App.formatDateTime(entry.completed_at) + '</td>';
      tbody.appendChild(tr);
    });
  }

  // Mode tabs
  document.querySelectorAll('#lb-mode-tabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#lb-mode-tabs .tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      mode = tab.dataset.mode;
      loadLeaderboard();
    });
  });

  // Duration tabs
  document.querySelectorAll('#lb-duration-tabs .tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#lb-duration-tabs .tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      duration = parseInt(tab.dataset.duration);
      loadLeaderboard();
    });
  });

  loadLeaderboard();
})();
