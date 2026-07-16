/* ============================================
   PROGRESS JS — typeCode
   Keyboard heatmap + test history
   ============================================ */
(function () {
  'use strict';

  // ---- Keyboard Heatmap ----
  async function loadHeatmap() {
    // If not logged in, show demo data immediately
    if (!API.isLoggedIn()) {
      showDemoHeatmap();
      return;
    }

    try {
      var data = await API.getWeakKeys();
      if (data && data.data && data.data.length > 0) {
        applyHeatmap(data.data);
      } else {
        showDemoHeatmap();
      }
    } catch (e) {
      console.log('Progress: heatmap data unavailable, showing demo');
      showDemoHeatmap();
    }
  }

  function showDemoHeatmap() {
    applyHeatmap([
      { key_char: 'r', error_rate: 42 },
      { key_char: 't', error_rate: 35 },
      { key_char: ';', error_rate: 58 },
      { key_char: '[', error_rate: 65 },
      { key_char: ']', error_rate: 50 },
      { key_char: 'p', error_rate: 22 },
      { key_char: ' ', error_rate: 8 },
      { key_char: 'e', error_rate: 12 },
      { key_char: ',', error_rate: 30 },
    ]);
  }

  function applyHeatmap(keyData) {
    // Build error map
    var errorMap = {};
    keyData.forEach(function (k) {
      errorMap[k.key_char.toLowerCase()] = k.error_rate;
    });

    // Apply heat classes to keyboard keys
    document.querySelectorAll('.kb-key').forEach(function (keyEl) {
      var keyChar = keyEl.dataset.key;
      if (!keyChar) return;

      var rate = errorMap[keyChar.toLowerCase()] || 0;

      // Remove existing heat classes
      keyEl.classList.remove('heat-0', 'heat-1', 'heat-2', 'heat-3', 'heat-4');

      if (rate > 0) {
        var heatLevel;
        if (rate < 15) heatLevel = 0;       // Low
        else if (rate < 25) heatLevel = 1;   // Medium-low
        else if (rate < 40) heatLevel = 2;   // Medium
        else if (rate < 55) heatLevel = 3;   // High
        else heatLevel = 4;                  // Very high

        keyEl.classList.add('heat-' + heatLevel);
        keyEl.title = keyChar + ': ' + Math.round(rate) + '% error rate';
      }
    });
  }

  // ---- Test History ----
  async function loadHistory(page) {
    page = page || 1;
    try {
      var data = await API.getHistory({ page: page, limit: 15 });
      if (data && data.data && data.data.length > 0) {
        renderHistory(data.data);
      }
    } catch (e) {
      console.log('Progress: history unavailable');
    }
  }

  function renderHistory(tests) {
    var tbody = document.getElementById('history-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    tests.forEach(function (test) {
      var tr = document.createElement('tr');
      var modeLabel = test.test_mode === 'programmer'
        ? '💻 ' + (test.language || 'Code')
        : '⌨️ Normal';

      tr.innerHTML =
        '<td>' + modeLabel + '</td>' +
        '<td style="font-family:var(--font-mono);font-weight:700;color:var(--accent-light);">' + Math.round(test.wpm) + '</td>' +
        '<td>' + (test.accuracy || 0).toFixed(1) + '%</td>' +
        '<td>' + (test.incorrect_chars || 0) + '</td>' +
        '<td>' + App.formatTime(test.duration_seconds || 0) + '</td>' +
        '<td>' + App.formatDateTime(test.completed_at) + '</td>';
      tbody.appendChild(tr);
    });
  }

  // ---- Init ----
  loadHeatmap();
  loadHistory();
})();
