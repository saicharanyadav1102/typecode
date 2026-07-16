/* ============================================================================
   INTRO ANIMATION CONTROLLER — typeCode (Beginner-Friendly Version)
   ============================================================================
   
   What this script does:
   1. Checks if the user already saw the intro (`sessionStorage`) OR prefers reduced motion.
      -> If yes: Skips the animation immediately so they don't have to wait.
   2. Otherwise, runs the cinematic typing animation:
      - Blinking cursor pauses briefly.
      - Types "typeCode" letter by letter.
      - Backspaces letter by letter.
      - Cursor turns into a white dot and expands into a screen flash.
   3. Allows the user to SKIP at any time by pressing ANY keyboard key or clicking anywhere!
   ============================================================================ */

(function () {
  'use strict';

  // ---- Animation Settings (Easy to customize!) ----
  const CONFIG = {
    text: 'typeCode',            // The word that gets typed out on screen
    cursorBlinkDelay: 1500,      // Time (in milliseconds) the cursor blinks alone before typing starts
    typeSpeed: 160,              // Speed of typing each letter (higher = slower)
    pauseAfterType: 1000,        // Pause after the full word is typed
    backspaceSpeed: 120,         // Speed of erasing each letter
    pauseAfterErase: 500,        // Pause after erasing before the flash begins
    dotAppearDelay: 300,         // Time before the white dot appears
    dotExpandDelay: 500,         // Pause before the dot zooms out to fill the screen
    dotExpandDuration: 1500,     // How long the tunnel zoom animation takes
    flashHoldDuration: 300,      // How long the white flash holds on screen
    revealStaggerGap: 50,        // Delay between each feature card/badge fading in on the landing page
  };

  // ---- Find the HTML elements we need to animate ----
  const introOverlay  = document.getElementById('intro-overlay');
  const typedText     = document.getElementById('typed-text');
  const cursor        = document.getElementById('cursor');
  const whiteDot      = document.getElementById('white-dot');
  const mainWebsite   = document.getElementById('main-website');

  // ---- State variables to keep track of progress ----
  let charIndex = 0;              // Keeps track of which letter we are currently typing/erasing
  let isFinished = false;         // Prevents double-triggering when the intro finishes or is skipped
  let activeTimeouts = [];        // Keeps track of active timers so we can cancel them if the user skips!

  /**
   * Helper function to run a delayed timer (setTimeout) and store its ID.
   * This is beginner-friendly: if the user clicks "Skip", we can easily cancel all pending timers!
   */
  function schedule(callback, delay) {
    const timeoutId = setTimeout(callback, delay);
    activeTimeouts.push(timeoutId);
    return timeoutId;
  }

  /**
   * Cancels all currently running animation timers.
   */
  function cancelAllTimers() {
    activeTimeouts.forEach(function (id) {
      clearTimeout(id);
    });
    activeTimeouts = [];
  }

  // ============================================================================
  // STEP 1: Check rules before starting (Returning Visitor & Accessibility)
  // ============================================================================
  function init() {
    // Check if the user already watched the intro during this browser session
    const alreadySeen = sessionStorage.getItem('typeCode_intro_shown') === 'true';

    // Check if the user has "Reduced Motion" turned on in their operating system settings (for accessibility)
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (alreadySeen || prefersReducedMotion) {
      // If returning user or reduced motion, skip the intro instantly (0 milliseconds)
      revealMainWebsite(true);
      return;
    }

    // Otherwise, mark the intro as shown for next time, and start listening for skip shortcuts
    sessionStorage.setItem('typeCode_intro_shown', 'true');
    setupSkipListeners();

    // Start the cinematic animation sequence after the cursor blinks
    schedule(typeNextChar, CONFIG.cursorBlinkDelay);
  }

  // ============================================================================
  // SKIP SYSTEM: Listen for any keypress or click to skip instantly
  // ============================================================================
  function setupSkipListeners() {
    window.addEventListener('keydown', handleUserSkip);
    window.addEventListener('click', handleUserSkip);
    window.addEventListener('touchstart', handleUserSkip);
  }

  function removeSkipListeners() {
    window.removeEventListener('keydown', handleUserSkip);
    window.removeEventListener('click', handleUserSkip);
    window.removeEventListener('touchstart', handleUserSkip);
  }

  function handleUserSkip() {
    if (isFinished) return; // If already finished, do nothing

    // 1. Stop all future animation steps immediately
    cancelAllTimers();

    // 2. Reveal the main website right away (instant mode)
    revealMainWebsite(true);
  }

  // ============================================================================
  // STEP 2: Type text letter by letter ("t" -> "ty" -> "typ" ...)
  // ============================================================================
  function typeNextChar() {
    if (isFinished) return;

    if (charIndex < CONFIG.text.length) {
      // Add the next character to the screen
      typedText.textContent += CONFIG.text[charIndex];
      charIndex++;
      schedule(typeNextChar, CONFIG.typeSpeed);
    } else {
      // Finished typing full word — pause for 1 second, then start erasing
      schedule(startBackspace, CONFIG.pauseAfterType);
    }
  }

  // ============================================================================
  // STEP 3: Erase text letter by letter ("typeCode" -> "typeCod" -> ...)
  // ============================================================================
  function startBackspace() {
    if (isFinished) return;
    eraseNextChar();
  }

  function eraseNextChar() {
    if (isFinished) return;

    const currentText = typedText.textContent;
    if (currentText.length > 0) {
      // Remove the last letter (`slice(0, -1)` keeps everything except the last character)
      typedText.textContent = currentText.slice(0, -1);
      schedule(eraseNextChar, CONFIG.backspaceSpeed);
    } else {
      // Finished erasing all letters — start the tunnel flash animation
      schedule(startTunnelFlash, CONFIG.pauseAfterErase);
    }
  }

  // ============================================================================
  // STEP 4: Tunnel Flash (White dot zooms out to cover screen)
  // ============================================================================
  function startTunnelFlash() {
    if (isFinished) return;

    // Hide the blinking cursor
    cursor.style.display = 'none';

    // Show the small white dot in the center of the screen
    schedule(function () {
      if (isFinished) return;
      whiteDot.classList.add('visible');

      // Expand the dot to fill the entire screen
      schedule(function () {
        if (isFinished) return;
        whiteDot.classList.add('expand');

        // Once the expansion animation finishes, reveal the actual website
        schedule(function () {
          revealMainWebsite(false); // false = use smooth fade transition
        }, CONFIG.dotExpandDuration + CONFIG.flashHoldDuration);

      }, CONFIG.dotExpandDelay);

    }, CONFIG.dotAppearDelay);
  }

  // ============================================================================
  // STEP 5: Hide intro overlay and reveal the main landing page
  // ============================================================================
  function revealMainWebsite(instant) {
    if (isFinished) return;
    isFinished = true;

    // Stop listening for skip shortcuts since we are done
    removeSkipListeners();

    // Make sure the main website is no longer hidden
    mainWebsite.classList.remove('hidden');
    document.body.classList.add('intro-done');

    if (instant) {
      // Instant skip: hide the intro immediately without waiting for CSS fade
      introOverlay.style.display = 'none';
      introOverlay.setAttribute('aria-hidden', 'true');
      triggerRevealAnimations(true);
    } else {
      // Smooth finish: add the `fade-out` class to smoothly transition
      introOverlay.classList.add('fade-out');

      setTimeout(function () {
        introOverlay.style.display = 'none';
        introOverlay.setAttribute('aria-hidden', 'true');
      }, 600);

      triggerRevealAnimations(false);
    }
  }

  // ============================================================================
  // STEP 6: Staggered reveal (elements appear one after another cleanly)
  // ============================================================================
  function triggerRevealAnimations(instant) {
    const items = document.querySelectorAll('.reveal-item');
    
    items.forEach(function (item, index) {
      if (instant) {
        // If skipped instantly, make all cards visible immediately
        item.classList.add('visible');
      } else {
        // Otherwise, reveal with a slight delay between each card (50ms apart)
        setTimeout(function () {
          item.classList.add('visible');
        }, index * CONFIG.revealStaggerGap);
      }
    });
  }

  // ============================================================================
  // START: Run the init function as soon as the webpage loads
  // ============================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

