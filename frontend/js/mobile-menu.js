
document.addEventListener("DOMContentLoaded", () => {

  const menuButton =
    document.querySelector(".mobile-menu-btn");

  const nav =
    document.querySelector(".nav-links");

  if (!menuButton || !nav) return;


  /* Create overlay */

  let overlay =
    document.querySelector(".mobile-menu-overlay");

  if (!overlay) {

    overlay =
      document.createElement("div");

    overlay.className =
      "mobile-menu-overlay";

    document.body.appendChild(overlay);

  }


  function openMenu() {

    nav.classList.add("mobile-open");

    overlay.classList.add(
      "mobile-overlay-open"
    );

    document.body.classList.add(
      "mobile-menu-active"
    );

    menuButton.textContent = "✕";

    menuButton.setAttribute(
      "aria-expanded",
      "true"
    );

  }


  function closeMenu() {

    nav.classList.remove("mobile-open");

    overlay.classList.remove(
      "mobile-overlay-open"
    );

    document.body.classList.remove(
      "mobile-menu-active"
    );

    menuButton.textContent = "☰";

    menuButton.setAttribute(
      "aria-expanded",
      "false"
    );

  }


  menuButton.addEventListener(
    "click",
    () => {

      if (
        nav.classList.contains(
          "mobile-open"
        )
      ) {
        closeMenu();
      } else {
        openMenu();
      }

    }
  );


  /* Click outside */

  overlay.addEventListener(
    "click",
    closeMenu
  );


  /* Click menu item */

  nav.querySelectorAll("a").forEach(
    link => {

      link.addEventListener(
        "click",
        closeMenu
      );

    }
  );


  /* ESC */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {
        closeMenu();
      }

    }
  );


  /* Resize */

  window.addEventListener(
    "resize",
    () => {

      if (window.innerWidth > 768) {
        closeMenu();
      }

    }
  );

});

