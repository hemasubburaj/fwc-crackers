/*
  Category colours, icons and optional images
*/

const CATEGORY_STYLES = {

  "One Sound Crackers": {
    icon: "💥",
    from: "#E8654A",
    to: "#C43B26"
  },

  "Ground Chakkar": {
    icon: "🌀",
    from: "#F2B84B",
    to: "#D9A431"
  },

  "Flower Pots": {
    icon: "🌸",
    from: "#E8654A",
    to: "#B9841E"
  },

  "Twinkling Star": {
    icon: "⭐",
    from: "#F2CB6B",
    to: "#D9A431"
  },

  "Rockets": {
    icon: "🚀",
    from: "#C43B26",
    to: "#7A2A17"
  },

  "Bombs": {
    icon: "💣",
    from: "#7A2A17",
    to: "#3A1710"
  },

  "Repeating Shots": {
    icon: "🎇",
    from: "#E8654A",
    to: "#C43B26"
  },

  "Comets & Sky Shots": {
    icon: "☄️",
    from: "#D9A431",
    to: "#C43B26"
  },

  "Fancy Pencil Varieties": {
    icon: "🕯️",
    from: "#F2B84B",
    to: "#E8654A"
  },

  "Fountain & Fancy Novelties": {
    icon: "⛲",
    from: "#E8654A",
    to: "#D9A431"
  },

  "Matches": {
    icon: "🔥",
    from: "#C43B26",
    to: "#E8654A"
  },

  "Sparklers": {
    icon: "✨",
    from: "#F2CB6B",
    to: "#F2B84B"
  },

  "New Arrivals": {
    icon: "🎁",
    from: "#D9A431",
    to: "#7A2A17"
  },

  "Pendulum": {
    icon: "🔴",
    image: "images/Pandiyans.png.webp",
    from: "#C43B26",
    to: "#7A2A17"
  }

};


const DEFAULT_CATEGORY_STYLE = {
  icon: "🎆",
  from: "#D9A431",
  to: "#C43B26"
};


/* Get category style */

function getCategoryStyle(category) {

  const categoryName =
    String(category || "").trim();

  return CATEGORY_STYLES[categoryName] ||
    DEFAULT_CATEGORY_STYLE;

}


/* Escape HTML */

function categoryEscapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* Product card image */

function productImageHTML(
  category,
  imageUrl
) {

  const style =
    getCategoryStyle(category);

  const image =
    String(imageUrl || "").trim();

  const hasImage =
    image &&
    !image
      .toLowerCase()
      .includes("placeholder");


  if (hasImage) {

    return `

      <div class="product-img">

        <img
          src="${categoryEscapeHTML(image)}"
          alt="${categoryEscapeHTML(category)}"
          loading="lazy"
          style="
            width:100%;
            height:100%;
            object-fit:contain;
            display:block;
          "
          onerror="
            this.style.display='none';
            this.nextElementSibling.style.display='flex';
          "
        />

        <span
          style="
            display:none;
            width:100%;
            height:100%;
            align-items:center;
            justify-content:center;
            font-size:42px;
            background:linear-gradient(
              150deg,
              ${style.from},
              ${style.to}
            );
          "
        >
          ${categoryEscapeHTML(style.icon)}
        </span>

      </div>

    `;

  }


  return `

    <div
      class="product-img"
      style="
        background:linear-gradient(
          150deg,
          ${style.from},
          ${style.to}
        );
        display:flex;
        align-items:center;
        justify-content:center;
      "
    >

      <span
        style="
          font-size:42px;
          filter:drop-shadow(
            0 4px 10px rgba(0,0,0,0.18)
          );
        "
      >
        ${categoryEscapeHTML(style.icon)}
      </span>

    </div>

  `;

}
