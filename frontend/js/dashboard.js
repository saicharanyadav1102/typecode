/* ============================================
   DASHBOARD JS — typeCode
   Loads user stats, recent tests, weak keys
   ============================================ */

(function () {
  'use strict';

  // ---- Load dashboard data ----
  async function loadDashboard() {
    // If not logged in, show guest state
    if (!API.isLoggedIn()) {
      loadGuestDashboard();
      return;
    }

    var loadedRemoteData = false;

    try {
      // Load progress data
      var progress = await API.getProgress();
      if (progress && progress.data) {
        var p = progress.data;
        setVal('dash-avg-wpm', Math.round(p.avg_wpm || 0));
        setVal('dash-best-wpm', Math.round(p.best_wpm || 0));
        setVal('dash-avg-accuracy', (p.avg_accuracy || 0).toFixed(1) + '%');
        setVal('dash-tests-taken', p.tests_completed || 0);
        loadedRemoteData = (p.tests_completed || 0) > 0;
      }
    } catch (e) {
      console.log('Dashboard: progress unavailable, using defaults');
    }

    try {
      // Load recent tests
      var history = await API.getHistory({ page: 1, limit: 5 });
      if (history && history.data && history.data.length > 0) {
        renderRecentTests(history.data);
        loadedRemoteData = true;
      }
    } catch (e) {
      console.log('Dashboard: history unavailable');
    }

    try {
      // Load weak keys
      var weakKeys = await API.getWeakKeys();
      if (weakKeys && weakKeys.data && weakKeys.data.length > 0) {
        renderWeakKeys(weakKeys.data);
      }
    } catch (e) {
      console.log('Dashboard: weak keys unavailable');
    }

    if (!loadedRemoteData && getGuestHistory().length) {
      loadGuestDashboard();
    }
  }

  function showGuestState() {
    setVal('dash-avg-wpm', '—');
    setVal('dash-best-wpm', '—');
    setVal('dash-avg-accuracy', '—');
    setVal('dash-tests-taken', '0');
  }

  function loadGuestDashboard() {
    var history = getGuestHistory();
    if (!history.length) {
      showGuestState();
      return;
    }

    var totalWpm = history.reduce(function (sum, test) {
      return sum + Number(test.wpm || 0);
    }, 0);
    var totalAccuracy = history.reduce(function (sum, test) {
      return sum + Number(test.accuracy || 0);
    }, 0);
    var bestWpm = history.reduce(function (best, test) {
      return Math.max(best, Number(test.wpm || 0));
    }, 0);

    setVal('dash-avg-wpm', Math.round(totalWpm / history.length));
    setVal('dash-best-wpm', Math.round(bestWpm));
    setVal('dash-avg-accuracy', (totalAccuracy / history.length).toFixed(1) + '%');
    setVal('dash-tests-taken', history.length);

    renderRecentTests(history.slice(0, 5));

    var weakKeys = getGuestWeakKeys(history);
    if (weakKeys.length) renderWeakKeys(weakKeys);
  }

  function getGuestHistory() {
    try {
      var stored = localStorage.getItem('tc_guest_results');
      var history = stored ? JSON.parse(stored) : [];
      return Array.isArray(history) ? history : [];
    } catch (e) {
      return [];
    }
  }

  function getGuestWeakKeys(history) {
    var totals = {};

    history.forEach(function (test) {
      var keyErrors = test.key_errors || {};
      Object.keys(keyErrors).forEach(function (keyChar) {
        var stats = keyErrors[keyChar] || {};
        if (!totals[keyChar]) {
          totals[keyChar] = { key_char: keyChar, error_count: 0, total_attempts: 0 };
        }
        totals[keyChar].error_count += Number(stats.errors || 0);
        totals[keyChar].total_attempts += Number(stats.attempts || 0);
      });
    });

    return Object.keys(totals).map(function (keyChar) {
      var record = totals[keyChar];
      record.error_rate = record.total_attempts > 0
        ? (record.error_count / record.total_attempts) * 100
        : 0;
      return record;
    }).filter(function (record) {
      return record.error_count > 0;
    }).sort(function (a, b) {
      return b.error_rate - a.error_rate;
    });
  }

  function renderRecentTests(tests) {
    var container = document.getElementById('recent-tests');
    if (!container) return;
    container.innerHTML = '';

    tests.forEach(function (test) {
      var row = document.createElement('div');
      row.className = 'recent-test-row';

      var modeLabel = test.test_mode === 'programmer'
        ? '💻 ' + (test.language || 'Code')
        : '⌨️ Normal';

      row.innerHTML =
        '<div class="recent-test-info">' +
          '<span class="recent-test-mode">' + modeLabel + '</span>' +
          '<span class="recent-test-meta">' +
            (test.accuracy || 0).toFixed(1) + '% accuracy · ' +
            App.formatDateTime(test.completed_at) +
          '</span>' +
        '</div>' +
        '<span class="recent-test-wpm">' + Math.round(test.wpm || 0) + ' WPM</span>';

      container.appendChild(row);
    });
  }

  function renderWeakKeys(keys) {
    var container = document.getElementById('weak-keys-summary');
    if (!container) return;
    container.innerHTML = '';

    // Show top 5 weakest keys
    keys.slice(0, 5).forEach(function (key) {
      var div = document.createElement('div');
      div.className = 'weak-key-bar';
      var rate = Math.round(key.error_rate || 0);
      var displayChar = key.key_char === ' ' ? '␣' : key.key_char;

      div.innerHTML =
        '<span class="weak-key-char">' + displayChar + '</span>' +
        '<div class="weak-key-track"><div class="weak-key-fill" style="width:' + rate + '%"></div></div>' +
        '<span class="weak-key-rate">' + rate + '%</span>';

      container.appendChild(div);
    });
  }

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ---- Init ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDashboard);
  } else {
    loadDashboard();
  }

})();
