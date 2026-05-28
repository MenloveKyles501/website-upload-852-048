(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
          "<span class=\"poster-frame\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-year\">" + escapeHtml(movie.year) + "</span>" +
          "</span>" +
        "</a>" +
        "<div class=\"card-body\">" +
          "<a class=\"card-title\" href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a>" +
          "<p>" + escapeHtml(movie.oneLine || "") + "</p>" +
          "<div class=\"card-tags\">" + tags + "</div>" +
        "</div>" +
      "</article>";
  }

  ready(function() {
    var input = document.querySelector("#search-input");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    var data = window.SEARCH_MOVIES || [];

    if (!input || !results) {
      return;
    }

    input.value = initial;

    function render(query) {
      var normalized = String(query || "").trim().toLowerCase();
      var matches = data;

      if (normalized) {
        matches = data.filter(function(movie) {
          var haystack = [
            movie.title,
            movie.year,
            movie.region,
            movie.genre,
            movie.category,
            movie.oneLine,
            (movie.tags || []).join(" ")
          ].join(" ").toLowerCase();
          return haystack.indexOf(normalized) !== -1;
        });
      }

      matches = matches.slice(0, 80);

      if (title) {
        title.textContent = normalized ? "搜索结果" : "推荐内容";
      }

      if (!matches.length) {
        results.innerHTML = "<div class=\"empty-results\">没有找到匹配内容，可以换一个关键词继续浏览。</div>";
        return;
      }

      results.innerHTML = matches.map(card).join("");
    }

    render(initial);

    input.addEventListener("input", function() {
      render(input.value);
    });
  });
})();
