/* Maps each product category to a distinct colour + icon for professional,
   consistent visuals across product cards (used instead of generic photos). */

const CATEGORY_STYLES = {
  "One Sound Crackers": { icon: "💥", from: "#E8654A", to: "#C43B26" },
  "Ground Chakkar":     { icon: "🌀", from: "#F2B84B", to: "#D9A431" },
  "Flower Pots":        { icon: "🌸", from: "#E8654A", to: "#B9841E" },
  "Twinkling Star":     { icon: "⭐", from: "#F2CB6B", to: "#D9A431" },
  "Rockets":            { icon: "🚀", from: "#C43B26", to: "#7A2A17" },
  "Bombs":              { icon: "💣", from: "#7A2A17", to: "#3A1710" },
  "Repeating Shots":    { icon: "🎇", from: "#E8654A", to: "#C43B26" },
  "Comets & Sky Shots": { icon: "☄️", from: "#D9A431", to: "#C43B26" },
  "Fancy Pencil Varieties": { icon: "🕯️", from: "#F2B84B", to: "#E8654A" },
  "Fountain & Fancy Novelties": { icon: "⛲", from: "#E8654A", to: "#D9A431" },
  "Matches":            { icon: "🔥", from: "#C43B26", to: "#E8654A" },
  "Sparklers":          { icon: "✨", from: "#F2CB6B", to: "#F2B84B" },
  "New Arrivals":       { icon: "🎁", from: "#D9A431", to: "#7A2A17" },
  "Pendulum":            { icon: "🔴", from: "#C43B26", to: "#7A2A17" },
};

const DEFAULT_CATEGORY_STYLE = { icon: "🎆", from: "#D9A431", to: "#C43B26" };

function getCategoryStyle(category) {
  return CATEGORY_STYLES[category] || DEFAULT_CATEGORY_STYLE;
}





function productImageHTML(category, imageUrl) {
  if (imageUrl && !imageUrl.includes('placeholder')) {
    return `<div class="product-img">
      <img src="${imageUrl}" alt="${category}" style="width:100%; height:100%; object-fit:contain; display:block;"
        onerror="this.parentElement.outerHTML = productImageHTML('${category}')" />
    </div>`;
  }



  const s = getCategoryStyle(category);
  return `<div class="product-img" style="background:linear-gradient(150deg, ${s.from}, ${s.to});">
    <span style="filter:drop-shadow(0 4px 10px rgba(0,0,0,0.18));">${s.icon}</span>
  </div>`;
}
