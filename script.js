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

document.addEventListener('DOMContentLoaded', () => {
  // Target the poster image inside your glass-card
  const posterImg = document.querySelector('.glass-card img[src="noi-dung-bai/p9.png"]');
  if (!posterImg) return;

  // Make the poster image look clickable
  posterImg.style.cursor = 'pointer';

  posterImg.addEventListener('click', () => {
    // 1. Create Modal Elements
    const modal = document.createElement('div');
    const modalBg = document.createElement('div');
    const closeBtn = document.createElement('button');
    const imgContainer = document.createElement('div');
    const modalImg = document.createElement('img');
    
    // Zoom Slider Elements
    const sliderContainer = document.createElement('div');
    const sliderTrack = document.createElement('div');
    const sliderHandle = document.createElement('div');

    // 2. Setup Attributes & Content
    modalImg.src = posterImg.src;
    modalImg.alt = posterImg.alt;
    closeBtn.innerHTML = '&times;';

    // 3. Apply Styles via JS
    Object.assign(modal.style, {
      position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
      zIndex: '10000', display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', backdropFilter: 'blur(8px)'
    });

    Object.assign(modalBg.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: '1'
    });

    Object.assign(closeBtn.style, {
      position: 'absolute', top: '20px', right: '20px', backgroundColor: 'transparent',
      border: 'none', color: '#fff', fontSize: '2.5rem', cursor: 'pointer', zIndex: '10'
    });

    // Scrollable container for the zoomed image
    Object.assign(imgContainer.style, {
      position: 'relative', width: '100%', height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center', overflow: 'auto', zIndex: '2'
    });

    // Initial sizing: max out either width or height depending on aspect ratio
    Object.assign(modalImg.style, {
      maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto',
      objectFit: 'contain', transition: 'transform 0.1s ease-out', transformOrigin: 'center center'
    });

    // Vertical Zoom Slider UI
    Object.assign(sliderContainer.style, {
      position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)',
      width: '40px', height: '200px', zIndex: '10', display: 'flex',
      justifyContent: 'center', alignItems: 'center'
    });
    Object.assign(sliderTrack.style, {
      width: '6px', height: '100%', backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: '3px', position: 'relative'
    });
    Object.assign(sliderHandle.style, {
      width: '20px', height: '200px', // Hitbox is tall for easier tracking
      width: '20px', height: '20px', borderRadius: '50%',
      backgroundColor: '#fff', position: 'absolute', left: '-7px',
      bottom: '0px', cursor: 'ns-resize', boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
    });

    // Assemble the DOM tree
    sliderTrack.appendChild(sliderHandle);
    sliderContainer.appendChild(sliderTrack);
    imgContainer.appendChild(modalImg);
    modal.appendChild(modalBg);
    modal.appendChild(closeBtn);
    modal.appendChild(imgContainer);
    modal.appendChild(sliderContainer);
    document.body.appendChild(modal);

    // Prevent main body from scrolling behind the modal
    document.body.style.overflow = 'hidden';

  // 4. Zoom Slider Drag Logic (Fixed Scroll Boundaries)
    let isDragging = false;
    const maxZoom = 3; // 300% zoom
    const minZoom = 1; // 100% (Fits screen)
    
    // Get the exact initial bounding dimensions when the image fits the screen
    const initialRect = modalImg.getBoundingClientRect();
    const initialWidth = initialRect.width;
    const initialHeight = initialRect.height;

    // Reset initial styles so we can manipulate width/height directly
    modalImg.style.maxWidth = 'none';
    modalImg.style.maxHeight = 'none';
    modalImg.style.width = `${initialWidth}px`;
    modalImg.style.height = `${initialHeight}px`;
    modalImg.style.transform = 'none'; // Remove scale transformation entirely

    function updateZoom(clientY) {
      const trackRect = sliderTrack.getBoundingClientRect();
      let heightRatio = (trackRect.bottom - clientY) / trackRect.height;
      heightRatio = Math.max(0, Math.min(1, heightRatio)); // Clamp 0 to 1

      // Move slider handle
      sliderHandle.style.bottom = `${heightRatio * (trackRect.height - 20)}px`;

      // Calculate current zoom factor
      const currentZoom = minZoom + heightRatio * (maxZoom - minZoom);

      // Directly adjust the layout size of the image
      modalImg.style.width = `${initialWidth * currentZoom}px`;
      modalImg.style.height = `${initialHeight * currentZoom}px`;

      // Update layout alignment for scrolling
      if (currentZoom > 1) {
        imgContainer.style.alignItems = 'flex-start';
        imgContainer.style.justifyContent = 'flex-start';
        modalImg.style.margin = 'auto'; // Ensures centering if only one axis overflows
      } else {
        imgContainer.style.alignItems = 'center';
        imgContainer.style.justifyContent = 'center';
        modalImg.style.margin = '0';
      }
    }

    // Mouse/Touch events for the slider handle
    const startDrag = (e) => {
      isDragging = true;
      e.preventDefault();
    };

    const doDrag = (e) => {
      if (!isDragging) return;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      updateZoom(clientY);
    };

    const stopDrag = () => { isDragging = false; };

    sliderHandle.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);

    sliderHandle.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', doDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);

    // Click anywhere on track to jump to zoom level
    sliderTrack.addEventListener('click', (e) => {
      if (e.target === sliderHandle) return;
      updateZoom(e.clientY);
    });

    // 5. Close Modal Logic
    const closeModal = () => {
      document.body.style.overflow = '';
      window.removeEventListener('mousemove', doDrag);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', doDrag);
      window.removeEventListener('touchend', stopDrag);
      modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    modalBg.addEventListener('click', closeModal);
  });
});
