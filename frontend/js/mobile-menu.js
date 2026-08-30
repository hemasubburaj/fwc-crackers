
document.addEventListener("DOMContentLoaded", function () {

  const menuButton =
    document.querySelector(".mobile-menu-btn");

  const navLinks =
    document.querySelector(".nav-links");

  if (!menuButton || !navLinks) return;

  menuButton.addEventListener("click", function (event) {

    event.stopPropagation();

    const isOpen =
      navLinks.classList.toggle("active");

    menuButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuButton.textContent =
      isOpen ? "✕" : "☰";

  });

  document.addEventListener("click", function (event) {

    if (
      !navLinks.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {

      navLinks.classList.remove("active");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      menuButton.textContent = "☰";

    }

  });

  navLinks.querySelectorAll("a").forEach(function (link) {

    link.addEventListener("click", function () {

      navLinks.classList.remove("active");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      menuButton.textContent = "☰";

    });

  });

});

