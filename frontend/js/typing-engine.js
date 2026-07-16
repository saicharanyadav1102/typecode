/* ============================================
   TYPING ENGINE — typeCode (THE HEART)
   Core logic for typing tests:
   - Character-by-character rendering
   - Real-time keystroke detection
   - WPM / CPM / Accuracy calculation
   - Per-key error tracking
   - Timer management
   - Anti-cheat measures
   ============================================ */

const TypingEngine = (function () {
  'use strict';

  // ============================================
  // STATE
  // ============================================
  var state = {
    // Text
    text: '',                    // Full text to type
    chars: [],                   // Array of char objects: { char, status, el }
    currentIndex: 0,             // Current character position

    // Timer
    duration: 60,                // Test duration in seconds
    timeRemaining: 60,
    timerInterval: null,
    isRunning: false,
    isFinished: false,
    startTime: null,

    // Metrics
    totalTyped: 0,
    correctChars: 0,
    incorrectChars: 0,
    wpmHistory: [],              // Per-second WPM for consistency calc
    keyErrors: {},               // { key: { errors, attempts } }

    // Config
    mode: 'normal',              // 'normal' or 'programmer'
    difficulty: 'intermediate',
    language: null,               // For programmer mode
    contentId: null,

    // DOM references
    textDisplay: null,
    inputArea: null,
    wpmDisplay: null,
    cpmDisplay: null,
    accuracyDisplay: null,
    timerDisplay: null,
    errorDisplay: null,
    progressBar: null,
  };

  // ============================================
  // SAMPLE TEXTS (used when backend is unavailable)
  // ============================================
  var sampleTexts = {
    beginner: [
      "The quick brown fox jumps over the lazy dog. A gentle breeze swept through the open window, carrying the sweet scent of spring flowers. The children played happily in the garden while their parents watched from the porch.",
      "She walked along the quiet path near the river. The sun was setting and the sky turned orange and pink. Birds sang their evening songs as the day slowly came to an end. It was a peaceful moment.",
      "The cat sat on the warm window sill and watched the rain fall outside. Each drop made tiny circles in the puddles below. The sound of rain was soft and calming. It was a good day to stay inside and read.",
      "A small dog ran across the garden and chased a yellow ball. Leaves moved in the wind, birds called from the fence, and the grass smelled clean after the rain.",
      "The library was calm in the afternoon. Sunlight touched the wooden tables, and pages turned with a soft sound. Lina chose a story about space and began reading.",
    ],
    intermediate: [
      "Technology has transformed the way we communicate, learn, and work in the modern world. From smartphones to artificial intelligence, digital tools have become essential parts of daily life. Understanding how to use these tools effectively is crucial for success in today's fast-paced environment.",
      "The art of programming requires both logical thinking and creative problem-solving. Writing clean, efficient code is a skill that improves with practice and dedication. Every programmer starts as a beginner, making mistakes and learning from them along the way.",
      "Scientific research has shown that consistent practice is the key to mastering any skill. Whether it is playing a musical instrument, learning a new language, or improving typing speed, regular and focused effort leads to significant improvement over time.",
      "Digital security begins with ordinary choices. Strong passwords, updated software, careful downloads, and healthy skepticism protect personal information from many common attacks.",
      "Modern teams depend on clear communication as much as technical skill. When people explain decisions and document important details, fewer mistakes survive into production.",
    ],
    advanced: [
      "The philosophical implications of quantum mechanics challenge our fundamental understanding of reality. Superposition and entanglement suggest that particles exist in multiple states simultaneously until observed, raising profound questions about the nature of consciousness and its role in determining physical outcomes. These concepts continue to perplex scientists and philosophers alike.",
      "Algorithmic complexity analysis provides a framework for evaluating the efficiency of computational solutions. By examining time and space requirements through Big-O notation, developers can make informed decisions about trade-offs between memory usage and execution speed, ultimately optimizing applications for production environments with millions of concurrent users.",
      "The intersection of neuroscience and artificial intelligence has yielded unprecedented insights into cognitive architecture. Neural network architectures, inspired by biological synaptic connections, have demonstrated remarkable capabilities in pattern recognition, natural language processing, and autonomous decision-making, pushing the boundaries of what machines can accomplish independently.",
      "Distributed systems often fail in ways that appear inconsistent from the outside. Network partitions, clock drift, retry storms, and partial deployments can interact unpredictably.",
      "Resilient organizations treat incidents as opportunities for learning rather than occasions for blame. Teams convert painful failures into durable operational knowledge through careful review.",
    ],
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  function init(options) {
    // Merge options
    state.duration = options.duration || 60;
    state.timeRemaining = state.duration;
    state.mode = options.mode || 'normal';
    state.difficulty = options.difficulty || 'intermediate';
    state.language = options.language || null;

    // DOM references
    state.textDisplay   = document.getElementById('text-display');
    state.inputArea     = document.getElementById('typing-input');
    state.wpmDisplay    = document.getElementById('wpm-value');
    state.cpmDisplay    = document.getElementById('cpm-value');
    state.accuracyDisplay = document.getElementById('accuracy-value');
    state.timerDisplay  = document.getElementById('timer-value');
    state.errorDisplay  = document.getElementById('error-value');
    state.progressBar   = document.getElementById('progress-bar');

    // Reset state
    resetState();

    // Load text
    loadText(options.text);

    // Set up event listeners
    setupListeners();

    // Update display
    updateTimerDisplay();
    updateStats();
  }

  function resetState() {
    state.currentIndex = 0;
    state.totalTyped = 0;
    state.correctChars = 0;
    state.incorrectChars = 0;
    state.wpmHistory = [];
    state.keyErrors = {};
    state.isRunning = false;
    state.isFinished = false;
    state.startTime = null;
    state.timeRemaining = state.duration;

    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  // ============================================
  // TEXT LOADING & RENDERING
  // ============================================
  function loadText(text) {
    if (!text) {
      // Use sample text based on difficulty
      var texts = sampleTexts[state.difficulty] || sampleTexts.intermediate;
      text = texts[Math.floor(Math.random() * texts.length)];
    }

    state.text = text;
    state.chars = [];
    state.textDisplay.innerHTML = '';

    // Create individual <span> for each character
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = text[i] === ' ' ? '\u00A0' : text[i]; // Non-breaking space for visibility

      var charObj = {
        char: text[i],
        status: 'pending',  // 'pending', 'correct', 'incorrect', 'current'
        el: span,
      };

      state.chars.push(charObj);
      state.textDisplay.appendChild(span);
    }

    // Highlight first character
    if (state.chars.length > 0) {
      state.chars[0].el.classList.add('current');
    }
  }

  async function loadFromAPI() {
    try {
      var data;
      if (state.mode === 'programmer') {
        data = await API.getCodeSnippets({
          language: state.language,
          difficulty: state.difficulty,
        });
      } else {
        data = await API.getTexts({ difficulty: state.difficulty });
      }

      if (data && data.content) {
        state.contentId = data.id;
        loadText(data.content);
      }
    } catch (e) {
      console.log('Using offline text (backend unavailable)');
      // Already loaded sample text in init
    }
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  function setupListeners() {
    // Focus the hidden input area
    if (state.inputArea) {
      state.inputArea.value = '';
      state.inputArea.focus();

      // Keydown handler — main typing logic
      state.inputArea.removeEventListener('keydown', handleKeyDown);
      state.inputArea.addEventListener('keydown', handleKeyDown);

      // Prevent paste (anti-cheat)
      state.inputArea.addEventListener('paste', function (e) { e.preventDefault(); });

      // Re-focus on click anywhere on text display
      if (state.textDisplay) {
        state.textDisplay.addEventListener('click', function () {
          state.inputArea.focus();
        });
      }
    }

    // Prevent context menu on text display
    if (state.textDisplay) {
      state.textDisplay.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }
  }

  function removeListeners() {
    if (state.inputArea) {
      state.inputArea.removeEventListener('keydown', handleKeyDown);
    }
  }

  // ============================================
  // KEYSTROKE HANDLING (Core Logic)
  // ============================================
  function handleKeyDown(e) {
    if (state.isFinished) return;

    // Ignore modifier keys, function keys, etc.
    var ignoredKeys = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape',
                       'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
                       'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'Delete',
                       'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'];
    if (ignoredKeys.indexOf(e.key) !== -1) return;

    // Prevent Tab default behavior
    if (e.key === 'Tab') {
      e.preventDefault();
      // In programmer mode, Tab = indent (2 spaces)
      if (state.mode === 'programmer') {
        processChar(' ');
        processChar(' ');
      }
      return;
    }

    // Handle new lines in code snippets.
    if (e.key === 'Enter') {
      e.preventDefault();
      processChar('\n');
      return;
    }

    // Handle Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      handleBackspace();
      return;
    }

    // Start timer on first keypress
    if (!state.isRunning && !state.isFinished) {
      startTimer();
    }

    // Process the typed character
    if (e.key.length === 1) {
      e.preventDefault();
      processChar(e.key);
    }
  }

  function processChar(typedChar) {
    if (state.currentIndex >= state.chars.length) return;

    var charObj = state.chars[state.currentIndex];
    var expected = charObj.char;

    state.totalTyped++;

    // Track key attempt
    trackKeyAttempt(expected, typedChar);

    if (typedChar === expected) {
      // ✓ Correct keystroke
      charObj.status = 'correct';
      charObj.el.className = 'char correct';
      state.correctChars++;
    } else {
      // ✕ Incorrect keystroke
      charObj.status = 'incorrect';
      charObj.el.className = 'char incorrect';
      state.incorrectChars++;
    }

    // Remove current highlight
    charObj.el.classList.remove('current');

    // Move to next character
    state.currentIndex++;

    // Highlight next character
    if (state.currentIndex < state.chars.length) {
      state.chars[state.currentIndex].el.classList.add('current');
      scrollToCurrentChar();
    }

    // Update live stats
    updateStats();

    // Update progress bar
    updateProgress();

    // Check if test is complete (all characters typed)
    if (state.currentIndex >= state.chars.length) {
      finishTest();
    }
  }

  function handleBackspace() {
    if (state.currentIndex <= 0) return;

    // Remove current highlight
    if (state.currentIndex < state.chars.length) {
      state.chars[state.currentIndex].el.classList.remove('current');
    }

    // Move back
    state.currentIndex--;

    var charObj = state.chars[state.currentIndex];

    // Adjust counts
    if (charObj.status === 'correct') {
      state.correctChars--;
    } else if (charObj.status === 'incorrect') {
      state.incorrectChars--;
    }
    state.totalTyped = Math.max(0, state.totalTyped - 1);

    // Reset character
    charObj.status = 'pending';
    charObj.el.className = 'char current';

    updateStats();
    updateProgress();
  }

  // ============================================
  // KEY ERROR TRACKING
  // ============================================
  function trackKeyAttempt(expected, typed) {
    // Track attempts for the expected character
    if (!state.keyErrors[expected]) {
      state.keyErrors[expected] = { errors: 0, attempts: 0 };
    }
    state.keyErrors[expected].attempts++;

    if (typed !== expected) {
      state.keyErrors[expected].errors++;
    }
  }

  // ============================================
  // TIMER
  // ============================================
  function startTimer() {
    state.isRunning = true;
    state.startTime = Date.now();

    state.timerInterval = setInterval(function () {
      var elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      state.timeRemaining = Math.max(0, state.duration - elapsed);

      updateTimerDisplay();

      // Record WPM every second for consistency calculation
      state.wpmHistory.push(calculateWPM());

      if (state.timeRemaining <= 0) {
        finishTest();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    if (state.timerDisplay) {
      var mins = Math.floor(state.timeRemaining / 60);
      var secs = state.timeRemaining % 60;
      state.timerDisplay.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;

      // Color change when running low
      if (state.timeRemaining <= 10 && state.isRunning) {
        state.timerDisplay.classList.add('timer-warning');
      } else {
        state.timerDisplay.classList.remove('timer-warning');
      }
    }
  }

  // ============================================
  // METRIC CALCULATIONS
  // ============================================
  function getElapsedMinutes() {
    if (!state.startTime) return 0;
    return (Date.now() - state.startTime) / 60000;
  }

  function calculateWPM() {
    var minutes = getElapsedMinutes();
    if (minutes === 0) return 0;
    // Gross WPM: (correct chars / 5) / minutes
    var grossWPM = (state.correctChars / 5) / minutes;
    return Math.round(grossWPM);
  }

  function calculateNetWPM() {
    var minutes = getElapsedMinutes();
    if (minutes === 0) return 0;
    var netWPM = ((state.correctChars / 5) - state.incorrectChars) / minutes;
    return Math.max(0, Math.round(netWPM));
  }

  function calculateCPM() {
    var minutes = getElapsedMinutes();
    if (minutes === 0) return 0;
    return Math.round(state.correctChars / minutes);
  }

  function calculateAccuracy() {
    if (state.totalTyped === 0) return 100;
    return Math.round((state.correctChars / state.totalTyped) * 10000) / 100;
  }

  function calculateConsistency() {
    if (state.wpmHistory.length < 3) return 100;

    // Standard deviation of WPM readings
    var wpmArr = state.wpmHistory.filter(function (w) { return w > 0; });
    if (wpmArr.length < 2) return 100;

    var mean = wpmArr.reduce(function (a, b) { return a + b; }, 0) / wpmArr.length;
    var variance = wpmArr.reduce(function (sum, w) {
      return sum + Math.pow(w - mean, 2);
    }, 0) / wpmArr.length;
    var stdDev = Math.sqrt(variance);

    // Consistency = 100 - (stdDev as % of mean)
    var consistency = mean > 0 ? 100 - ((stdDev / mean) * 100) : 0;
    return Math.max(0, Math.min(100, Math.round(consistency * 100) / 100));
  }

  // ============================================
  // DISPLAY UPDATES
  // ============================================
  function updateStats() {
    if (state.wpmDisplay)      state.wpmDisplay.textContent      = calculateWPM();
    if (state.cpmDisplay)      state.cpmDisplay.textContent      = calculateCPM();
    if (state.accuracyDisplay) state.accuracyDisplay.textContent  = calculateAccuracy() + '%';
    if (state.errorDisplay)    state.errorDisplay.textContent     = state.incorrectChars;
  }

  function updateProgress() {
    if (state.progressBar) {
      var percent = (state.currentIndex / state.chars.length) * 100;
      state.progressBar.style.width = percent + '%';
    }
  }

  function scrollToCurrentChar() {
    if (state.currentIndex < state.chars.length) {
      var el = state.chars[state.currentIndex].el;
      var container = state.textDisplay;

      // Scroll text display so current char is visible
      var elTop = el.offsetTop;
      var containerScroll = container.scrollTop;
      var containerHeight = container.clientHeight;

      if (elTop > containerScroll + containerHeight - 50) {
        container.scrollTop = elTop - 50;
      }
    }
  }

  // ============================================
  // TEST COMPLETION
  // ============================================
  function finishTest() {
    if (state.isFinished) return;

    state.isFinished = true;
    state.isRunning = false;
    clearInterval(state.timerInterval);
    removeListeners();

    // Calculate final results
    var elapsedSeconds = state.startTime
      ? Math.round((Date.now() - state.startTime) / 1000)
      : (state.duration - state.timeRemaining);

    var results = {
      test_mode: state.mode,
      content_id: state.contentId || 0,
      content_type: state.mode === 'programmer' ? 'code' : 'text',
      duration_seconds: Math.max(1, elapsedSeconds),
      wpm: calculateWPM(),
      net_wpm: calculateNetWPM(),
      cpm: calculateCPM(),
      accuracy: calculateAccuracy(),
      total_chars: state.totalTyped,
      correct_chars: state.correctChars,
      incorrect_chars: state.incorrectChars,
      consistency: calculateConsistency(),
      difficulty: state.difficulty,
      language: state.language,
      key_errors: state.keyErrors,
    };

    // Save to backend if logged in
    saveResults(results);

    // Dispatch event for result page
    var event = new CustomEvent('typingTestComplete', { detail: results });
    document.dispatchEvent(event);

    // Show result overlay
    showResultOverlay(results);
  }

  async function saveResults(results) {
    if (typeof API === 'undefined' || !API.isLoggedIn()) {
      console.log('Skipping save: user not logged in');
      saveGuestResult(results);
      if (typeof App !== 'undefined') {
        App.showToast('Result saved on this device. Sign in to sync it to your account.', 'info');
      }
      return;
    }

    try {
      console.log('Saving typing result to API...');
      var response = await API.saveResult(results);
      console.log('Result saved successfully:', response);

      // Save key errors separately
      if (Object.keys(results.key_errors).length > 0) {
        await API.saveKeyErrors({ key_errors: results.key_errors });
        console.log('Key errors saved successfully');
      }
    } catch (e) {
      console.error('FAILED to save results:', e);
      saveGuestResult(results);
      if (typeof App !== 'undefined') {
        App.showToast('Could not sync result: ' + (e.message || 'Server error') + '. Saved on this device.', 'error');
      }
    }
  }

  function saveGuestResult(results) {
    try {
      var stored = localStorage.getItem('tc_guest_results');
      var history = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(history)) history = [];

      var record = Object.assign({}, results, {
        id: Date.now(),
        completed_at: new Date().toISOString(),
      });

      history.unshift(record);
      localStorage.setItem('tc_guest_results', JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Could not save guest result:', e);
    }
  }

  // ============================================
  // RESULT OVERLAY
  // ============================================
  function showResultOverlay(results) {
    var overlay = document.getElementById('result-overlay');
    if (!overlay) return;

    // Populate values
    var setVal = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('result-wpm', results.wpm);
    setVal('result-net-wpm', results.net_wpm);
    setVal('result-cpm', results.cpm);
    setVal('result-accuracy', results.accuracy + '%');
    setVal('result-correct', results.correct_chars);
    setVal('result-incorrect', results.incorrect_chars);
    setVal('result-consistency', results.consistency + '%');
    setVal('result-time', App.formatTime(results.duration_seconds));

    // Show top error keys
    var errorList = document.getElementById('result-error-keys');
    if (errorList) {
      errorList.innerHTML = '';
      var sorted = Object.entries(results.key_errors)
        .filter(function (e) { return e[1].errors > 0; })
        .sort(function (a, b) { return b[1].errors - a[1].errors; })
        .slice(0, 8);

      sorted.forEach(function (entry) {
        var key = entry[0];
        var data = entry[1];
        var rate = Math.round((data.errors / data.attempts) * 100);
        var li = document.createElement('div');
        li.className = 'error-key-item';
        li.innerHTML = '<span class="error-key-char">' +
          (key === ' ' ? '␣' : key) +
          '</span><span class="error-key-rate">' + rate + '% error</span>';
        errorList.appendChild(li);
      });

      if (sorted.length === 0) {
        errorList.innerHTML = '<p class="text-muted" style="font-size:0.85rem;">No errors! Perfect typing! 🎉</p>';
      }
    }

    // Show overlay
    overlay.classList.add('active');
  }

  // ============================================
  // RESTART
  // ============================================
  function restart(newText) {
    resetState();
    loadText(newText || null);
    setupListeners();
    updateTimerDisplay();
    updateStats();
    updateProgress();

    // Hide result overlay
    var overlay = document.getElementById('result-overlay');
    if (overlay) overlay.classList.remove('active');

    // Focus input
    if (state.inputArea) {
      state.inputArea.value = '';
      state.inputArea.focus();
    }
  }

  // ============================================
  // PUBLIC INTERFACE
  // ============================================
  return {
    init: init,
    restart: restart,
    loadFromAPI: loadFromAPI,
    getState: function () { return state; },
    getResults: function () {
      return {
        wpm: calculateWPM(),
        net_wpm: calculateNetWPM(),
        cpm: calculateCPM(),
        accuracy: calculateAccuracy(),
        consistency: calculateConsistency(),
        key_errors: state.keyErrors,
      };
    },
  };

})();
