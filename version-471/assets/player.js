(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var playButton = shell.querySelector('[data-play]');
    var status = shell.querySelector('[data-status]');
    var source = shell.getAttribute('data-src') || (video ? video.getAttribute('data-src') : '');
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachSource() {
      if (!video || !source || video.getAttribute('data-loaded') === 'true') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.setAttribute('data-loaded', 'true');
        setStatus('已使用浏览器原生 HLS 播放。');
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('HLS 播放源已加载。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请刷新页面或更换浏览器。');
          }
        });
        video.setAttribute('data-loaded', 'true');
        return;
      }

      video.src = source;
      video.setAttribute('data-loaded', 'true');
      setStatus('当前浏览器不支持 HLS.js，已尝试直接加载播放源。');
    }

    function startPlayback() {
      attachSource();
      if (!video) {
        return;
      }
      video.controls = true;
      shell.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
          setStatus('浏览器阻止自动播放，请再次点击播放按钮。');
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }

    shell.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        startPlayback();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
