// EventFlow Loading Screen Handler
// Automatically hides loading screen when page is fully loaded

(function() {
  'use strict';
  
  // Configuration
  const config = {
    minLoadingTime: 1200,  // Minimum time to show loading (ms)
    fadeOutDuration: 600,  // Fade out animation duration (ms)
    statusMessages: [
      'Initializing...',
      'Loading resources...',
      'Almost ready...',
      'Finalizing...'
    ],
    statusInterval: 400  // Time between status changes (ms)
  };

  let statusIndex = 0;
  let statusTimer = null;

  // Update loading status text
  function updateStatus() {
    const statusElement = document.querySelector('.loading-status');
    if (!statusElement) return;

    statusIndex = (statusIndex + 1) % config.statusMessages.length;
    statusElement.textContent = config.statusMessages[statusIndex];
  }

  // Start status updates
  function startStatusUpdates() {
    statusTimer = setInterval(updateStatus, config.statusInterval);
  }

  // Stop status updates
  function stopStatusUpdates() {
    if (statusTimer) {
      clearInterval(statusTimer);
      statusTimer = null;
    }
  }

  // Hide loading screen
  function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    // Stop status updates
    stopStatusUpdates();

    // Update final status
    const statusElement = document.querySelector('.loading-status');
    if (statusElement) {
      statusElement.textContent = 'Ready!';
    }

    // Wait a moment before fading out
    setTimeout(function() {
      // Add fade-out class
      loadingScreen.classList.add('fade-out');
      
      // Remove from DOM after animation
      setTimeout(function() {
        loadingScreen.style.display = 'none';
        // Trigger custom event for other scripts
        document.dispatchEvent(new CustomEvent('loadingComplete'));
      }, config.fadeOutDuration);
    }, 200);
  }

  // Initialize loading screen
  function initLoadingScreen() {
    // Start status updates
    startStatusUpdates();
  }

  // Wait for page to load
  window.addEventListener('load', function() {
    // Ensure minimum loading time for smooth UX
    setTimeout(hideLoadingScreen, config.minLoadingTime);
  });

  // Start immediately
  if (document.readyState === 'loading') {
    initLoadingScreen();
  } else {
    // DOM already loaded
    initLoadingScreen();
    setTimeout(hideLoadingScreen, config.minLoadingTime);
  }

  // Fallback: Hide after maximum time even if load event doesn't fire
  setTimeout(function() {
    if (document.getElementById('loading-screen')) {
      console.warn('Loading screen timeout - forcing hide');
      hideLoadingScreen();
    }
  }, 5000); // 5 second maximum

  // Handle page visibility changes
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
      // If page becomes visible and loading is still showing, hide it
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen && loadingScreen.style.display !== 'none') {
        setTimeout(hideLoadingScreen, 300);
      }
    }
  });

})();
