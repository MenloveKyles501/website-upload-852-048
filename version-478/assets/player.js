(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function connectVideo(video) {
    if (!video || video.getAttribute("data-ready") === "1") {
      return;
    }

    var stream = video.getAttribute("data-stream");

    if (!stream) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.setAttribute("data-ready", "1");
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      video.setAttribute("data-ready", "1");
      return;
    }

    video.src = stream;
    video.setAttribute("data-ready", "1");
  }

  ready(function() {
    document.querySelectorAll("video[data-stream]").forEach(function(video) {
      video.addEventListener("play", function() {
        connectVideo(video);
      }, { once: true });
    });

    document.querySelectorAll(".play-cover[data-player]").forEach(function(button) {
      button.addEventListener("click", function() {
        var video = document.getElementById(button.getAttribute("data-player"));
        connectVideo(video);
        button.classList.add("is-hidden");

        if (video) {
          var playResult = video.play();
          if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function() {
              button.classList.remove("is-hidden");
            });
          }
        }
      });
    });
  });
})();
