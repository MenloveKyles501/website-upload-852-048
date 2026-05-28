(() => {
  const box = document.querySelector('[data-player-box]');
  const video = document.querySelector('[data-video-player]');
  const overlay = document.querySelector('[data-player-overlay]');

  if (!box || !video || !overlay) {
    return;
  }

  const stream = box.dataset.stream || '';
  let hlsInstance = null;
  let attached = false;

  function attachStream() {
    if (attached || !stream) {
      return;
    }

    attached = true;

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    }
  }

  function playVideo() {
    attachStream();

    const playPromise = video.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        overlay.classList.add('is-hidden');
      }).catch(() => {
        overlay.classList.remove('is-hidden');
      });
    } else {
      overlay.classList.add('is-hidden');
    }
  }

  overlay.addEventListener('click', playVideo);

  video.addEventListener('click', () => {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', () => {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('pause', () => {
    if (!video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
