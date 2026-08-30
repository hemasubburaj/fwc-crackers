document.addEventListener("DOMContentLoaded", () => {

  const menuButton =
    document.querySelector(".mobile-menu-btn");

  const nav =
    document.querySelector(".nav-links");

  if (!menuButton || !nav) return;


  menuButton.addEventListener("click", () => {

    const isOpen =
      nav.classList.toggle("mobile-open");

    menuButton.setAttribute(
      "aria-expanded",
      isOpen ? "true" : "false"
    );

    menuButton.textContent =
      isOpen ? "✕" : "☰";

  });


  /* Close menu after clicking a link */

  nav.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {

      nav.classList.remove("mobile-open");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      menuButton.textContent = "☰";

    });

  });

});
