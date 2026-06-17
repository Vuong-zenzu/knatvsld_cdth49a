document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. THEME TOGGLE (DARK / LIGHT MODE)
     ========================================================================== */
  const themeToggle = document.getElementById('themeToggle');

  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');

    // Check saved theme or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
      if (!themeIcon) return;
      if (theme === 'light') {
        themeIcon.className = 'fa-solid fa-sun';
      } else {
        themeIcon.className = 'fa-solid fa-moon';
      }
    }
  } else {
    // Vẫn áp dụng theme đã lưu dù không có nút toggle
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
  }

  /* ==========================================================================
     2. NAVIGATION HIGHLIGHT & INTERSECTION OBSERVER
     ========================================================================== */
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    threshold: 0.2, // Trigger when 20% of section is visible
    rootMargin: '-50px 0px -50px 0px'
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add active-section class for CSS fade-in
        entry.target.classList.add('active-section');

        // Highlight corresponding Nav Link
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });

        // Trigger stats animation if this is the stats section
        if (id === 'stats') {
          animateStats();
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  /* ==========================================================================
     3. COUNT-UP ANIMATION FOR STATISTICS
     ========================================================================== */
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return; // Prevent double execution
    statsAnimated = true;

    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      const duration = 2000; // Animation duration in ms
      const startTime = performance.now();

      function updateNumber(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function: easeOutQuad
        const easeProgress = progress * (2 - progress);

        const currentValue = Math.floor(easeProgress * target);

        // Format thousands with dots (e.g. 6.000)
        if (target >= 1000) {
          stat.textContent = currentValue.toLocaleString('de-DE');
        } else {
          stat.textContent = currentValue;
        }

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          // Final value check
          if (target >= 1000) {
            stat.textContent = target.toLocaleString('de-DE');
          } else {
            stat.textContent = target;
          }
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  /* ==========================================================================
     4. SIMULATED AUDIO PLAYER PLAYBACK
        (Chỉ chạy nếu các phần tử audio player tồn tại trong HTML)
     ========================================================================== */
  const playBtn = document.getElementById('playBtn');
  const progressFill = document.getElementById('progressFill');
  const progressBar = document.getElementById('progressBar');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (playBtn) {
    const playIcon = playBtn.querySelector('i');
    const soundWave = document.querySelector('.sound-wave');
    const musicCover = document.querySelector('.music-cover');
    const timeElapsed = document.querySelector('.time-elapsed');

    let isPlaying = false;
    let playInterval;
    let currentSecond = 0;
    const totalSeconds = 192; // 3 minutes 12 seconds

    // Format time (seconds to MM:SS)
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function togglePlay() {
      isPlaying = !isPlaying;

      if (isPlaying) {
        if (playIcon) playIcon.className = 'fa-solid fa-pause';
        if (soundWave) soundWave.classList.add('playing');
        if (musicCover) musicCover.classList.add('playing');

        playInterval = setInterval(() => {
          currentSecond++;
          if (currentSecond > totalSeconds) {
            resetPlayer();
          } else {
            updatePlayerUI();
          }
        }, 1000);
      } else {
        pausePlayer();
      }
    }

    function pausePlayer() {
      isPlaying = false;
      if (playIcon) playIcon.className = 'fa-solid fa-play';
      if (soundWave) soundWave.classList.remove('playing');
      if (musicCover) musicCover.classList.remove('playing');
      clearInterval(playInterval);
    }

    function resetPlayer() {
      pausePlayer();
      currentSecond = 0;
      updatePlayerUI();
    }

    function updatePlayerUI() {
      const percentage = (currentSecond / totalSeconds) * 100;
      if (progressFill) progressFill.style.width = `${percentage}%`;
      if (timeElapsed) timeElapsed.textContent = formatTime(currentSecond);
    }

    // Handle clicking on progress bar to scrub/seek
    if (progressBar) {
      progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const clickPercentage = clickX / width;

        currentSecond = Math.floor(clickPercentage * totalSeconds);
        updatePlayerUI();

        // If paused, trigger play automatically
        if (!isPlaying) {
          togglePlay();
        }
      });
    }

    playBtn.addEventListener('click', togglePlay);

    // Simple next/prev controls
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentSecond = Math.max(0, currentSecond - 10); // Rewind 10s
        updatePlayerUI();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentSecond = Math.min(totalSeconds, currentSecond + 10); // Forward 10s
        updatePlayerUI();
      });
    }
  }
  // Kết thúc audio player block — tabs vẫn hoạt động bình thường dù không có audio player

  /* ==========================================================================
     5. INTERACTIVE TABS FOR SCAM TECHNIQUES
     ========================================================================== */
  const tabs = document.querySelectorAll('.tech-tab');
  const panels = document.querySelectorAll('.tech-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active to current tab
      tab.classList.add('active');

      const techId = tab.getAttribute('data-tech');

      // Hide all panels
      panels.forEach(panel => {
        panel.classList.remove('active');
      });

      // Show selected panel
      const targetPanel = document.getElementById(`tech-${techId}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

});
