(function () {
  var root = document.documentElement;
  var stored = localStorage.getItem("mode");
  var preferred = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  root.setAttribute("data-mode", preferred);

  var toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-mode");
      var next = current === "light" ? "dark" : "light";
      root.setAttribute("data-mode", next);
      localStorage.setItem("mode", next);
    });
  }
})();
