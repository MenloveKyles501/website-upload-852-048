(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("[data-player-video]");
      var button = player.querySelector("[data-play-button]");
      var videoUrl = video ? video.getAttribute("data-video-url") : "";
      var attached = false;
      var hlsInstance = null;

      function attach() {
        if (!video || !videoUrl || attached) {
          return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
          return;
        }

        loadHls(function () {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(videoUrl);
            hlsInstance.attachMedia(video);
          } else {
            video.src = videoUrl;
          }
        });
      }

      function play() {
        attach();
        if (!video) {
          return;
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
        });
        video.addEventListener("pause", function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
        video.addEventListener("ended", function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
