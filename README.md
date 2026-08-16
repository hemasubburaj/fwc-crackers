# Fun With Crackers — Fullstack E-commerce (Demo)

A fullstack fireworks/crackers e-commerce website with Cash-on-Delivery and
Razorpay online payment integration. Built with:

- **Backend:** Node.js, Express, MongoDB (Mongoose), Razorpay
- **Frontend:** Vanilla HTML/CSS/JS (no build step needed)

> ⚠️ Note: I could not access `funwithcrackers.com` directly to copy its exact
> product catalog (the live site loads via JavaScript, and copying another
> business's exact catalog/branding isn't something I do). The product catalog
> and prices in `backend/seed/products.json` are taken directly from the
> "FWC_Pricelist_2025.pdf" you shared (142 products, 13 categories) — edit that
> file if prices change, then re-run the seed command.
>
> The site's visual design (homepage layout: hero, trust strip, feature grid,
> tabbed category showcase, testimonial, stats, gift-box pricing cards, FAQ)
> is modeled after the ScrewFast/ThemeWagon template you shared, adapted with
> a warm ivory + marigold-gold + vermillion colour palette for the fireworks
> theme. All other pages (shop, cart, checkout) share the same stylesheet so
> the whole site stays visually consistent. Product images use custom-coded
> colour + icon panels per category (`frontend/js/category-styles.js`)
> instead of hotlinked stock photos, so the site never breaks if an external
> image link goes down — swap in real product photography whenever you have it
> by editing `productImageHTML()` in that file. The admin dashboard includes a
> Chart.js analytics tab (revenue trend, order-status breakdown, top-selling
> products), matching the same charting approach used in the Senbagam
> Furniture admin panel.

---

## 1. Folder structure

```
crackers-ecommerce/
├── backend/
│   ├── config/db.js
│   ├── models/          Product.js, Order.js
│   ├── routes/          products.js, orders.js, payment.js
│   ├── seed/            products.json, seedProducts.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html        Home page
    ├── products.html      Shop / product listing + filters
    ├── cart.html
    ├── checkout.html      COD + Razorpay
    ├── order-success.html
    ├── track-order.html
    ├── admin/index.html   Simple order & price management
    ├── css/style.css
    └── js/  config.js, cart.js, checkout.js
```

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — get a free cluster at https://www.mongodb.com/cloud/atlas
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — get test keys at https://dashboard.razorpay.com/app/keys (use test mode keys first, switch to live keys only when ready to accept real payments)
- `CLIENT_URL` — your frontend URL (for local dev, `http://127.0.0.1:5500` if using VS Code Live Server)

Seed the database with sample products:

```bash
npm run seed
```

Start the server:

```bash
npm run dev     # with nodemon (auto-restart)
# or
npm start
```

Backend runs at `http://localhost:5000`. Test it: open `http://localhost:5000/api/health`.

## 3. Frontend setup

No build step — plain HTML/CSS/JS.

1. Open `frontend/js/config.js` and confirm `API_BASE_URL` points to your backend
   (`http://localhost:5000/api` for local dev).
2. Open `frontend/index.html` with a local server (e.g. **VS Code Live Server**
   extension, or `npx serve frontend`). Opening the file directly with `file://`
   will cause CORS issues — always serve it over http.

## 4. Editing your product catalog & prices

Open `backend/seed/products.json`. Each product looks like:

```json
{
  "productCode": "SP001",
  "name": "Electric Sparklers 7cm",
  "category": "Sparklers",
  "content": "1 Box (10 pkts x 10 pcs)",
  "mrp": 90,
  "discountPercent": 50,
  "finalPrice": 45,
  "stock": 300,
  "description": "Kid-safe short sparklers."
}
```

Update names/prices/categories to match your real price list, then run:

```bash
npm run seed
```

This wipes and reloads the products collection. (For ongoing edits without
wiping orders, use the **Admin dashboard** at `frontend/admin/index.html`
instead — it lets you edit prices and view/update order status live.)

## 5. Payment flow

- **Cash on Delivery (COD):** order is saved immediately with `paymentStatus: PENDING`.
- **Razorpay (online):**
  1. Frontend calls `/api/payment/create-order` → backend creates a Razorpay order.
  2. Razorpay checkout widget opens in the browser.
  3. On success, frontend calls `/api/payment/verify` → backend verifies the signature.
  4. Only if verified, the order is saved with `paymentStatus: PAID`.

Prices are always recalculated server-side from the database when an order is
placed — the frontend cart total is never trusted directly, so people can't
tamper with prices from the browser.

## 6. Deployment (matches your usual stack)

- **Backend:** Deploy to **Render** (Web Service, Node). Add the same env vars
  from `.env` in Render's dashboard. Update `CLIENT_URL` to your deployed
  frontend URL.
- **Frontend:** Deploy to **Netlify** or **Vercel** as a static site
  (publish directory: `frontend`). Update `API_BASE_URL` in `js/config.js`
  to your deployed Render backend URL before deploying.
- Remember to switch Razorpay to **live mode keys** only after testing
  fully in test mode, and complete Razorpay KYC/business verification
  (required for fireworks — check Razorpay's restricted goods policy, as
  some payment aggregators restrict fireworks; if Razorpay declines, COD-only
  or an aggregator that explicitly supports fireworks may be needed).

## 7. Admin dashboard (hidden, password-protected)

The admin panel is **not linked anywhere** in the customer-facing site (no
nav link, no footer link) — the only way to reach it is by typing the URL
directly, e.g.:

```
http://127.0.0.1:5500/admin/          (local dev)
https://yoursite.com/admin/           (after deploy)
```

Visiting `/admin/` redirects straight to `/admin/login.html` if you're not
logged in. Login uses the `ADMIN_EMAIL` / `ADMIN_PASSWORD` values from your
backend `.env` file — set these to your own credentials before deploying.
On success, the backend issues a JWT (signed with `JWT_SECRET` from `.env`,
valid 12 hours) which is stored in the browser and sent with every
admin request. All order-list, order-status-update, and price-update API
routes reject requests without a valid token, so even someone who finds the
`/admin` URL can't see orders or change prices without the password.

From the dashboard you can:
- **Dashboard tab** — revenue chart (last 14 days), order-status breakdown, and
  a top-selling-products chart (powered by Chart.js, same library used in the
  Senbagam Furniture admin panel).
- **Orders tab** — view all orders, update order status (Placed → Confirmed → Shipped → Delivered)
- **Products tab** — quick-edit product prices
- Log out (clears the stored token)

**Before going live:** change `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and especially
`JWT_SECRET` (use a long random string) in your production `.env` — never
keep the example values.

## 8. Legal note

Fireworks are age- and region-restricted in India. Add an 18+ confirmation
checkbox at checkout and check your state's cracker-sale timing rules before
going live.

## 9. Store address & map

The footer (on every page) shows a sample address and an embedded Google Map
centered on Sivakasi. Before going live:
- Edit the address block inside the footer in `index.html` (and it'll be
  consistent everywhere since all pages share the same footer markup)
- Update the map `<iframe src="...">` URL — replace
  `q=Sivakasi%2C%20Tamil%20Nadu` with your exact address
  (e.g. `q=Your+Shop+Name+Sivakasi`), or generate an embed link from
  Google Maps → Share → Embed a map for pinpoint accuracy.
