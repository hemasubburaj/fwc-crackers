/* Generates a printable "Estimate Bill" matching the Phoenix Crackers
   invoice format, used by both the admin dashboard (staff view) and the
   customer-facing order pages (View/Download Bill). */

function generateBillHTML(order) {
  const itemRows = order.items.map((item, i) => `
    <tr>
      <td style="padding:8px 6px; border-bottom:1px solid #eee; text-align:center;">${i + 1}</td>
      <td style="padding:8px 6px; border-bottom:1px solid #eee;">${item.name}</td>
      <td style="padding:8px 6px; border-bottom:1px solid #eee; text-align:center;">${item.qty}</td>
      <td style="padding:8px 6px; border-bottom:1px solid #eee; text-align:right;">Rs.${(item.mrp ?? item.price).toFixed(2)}</td>
      <td style="padding:8px 6px; border-bottom:1px solid #eee; text-align:right;">Rs.${item.price.toFixed(2)}</td>
      <td style="padding:8px 6px; border-bottom:1px solid #eee; text-align:center;">${item.unit || 'pcs'}</td>
      <td style="padding:8px 6px; border-bottom:1px solid #eee; text-align:right;">Rs.${(item.price * item.qty).toFixed(2)}</td>
    </tr>
  `).join('');

  const totalMRP = order.items.reduce((sum, item) => sum + (item.mrp ?? item.price) * item.qty, 0);
  const youSave = totalMRP - order.subtotal;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Estimate Bill ${order.orderId} — Phoenix Crackers</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #221008; max-width: 760px; margin: 30px auto; padding: 0 24px; font-size: 14px; }
        .brand-header { text-align: center; border-bottom: 3px solid #C43B26; padding-bottom: 16px; margin-bottom: 20px; }
        .brand-header h1 { font-size: 1.7rem; margin: 0 0 2px; letter-spacing: 1px; color: #C43B26; }
        .brand-header .tagline { font-size: 0.8rem; letter-spacing: 2px; color: #6E5C4C; text-transform: uppercase; margin-bottom: 8px; }
        .brand-header .contact-line { font-size: 0.82rem; color: #6E5C4C; }
        .bill-title { text-align: center; font-size: 1.1rem; font-weight: 700; letter-spacing: 2px; margin: 16px 0 20px; color: #221008; }
        .parties { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
        .party-box { flex: 1; font-size: 0.85rem; line-height: 1.6; }
        .party-box h3 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #9C8B79; margin: 0 0 6px; }
        .party-box strong { font-size: 0.95rem; }
        .order-meta { display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 16px; padding: 10px 14px; background: #F5ECDA; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 0.85rem; }
        thead th { text-align: left; padding: 8px 6px; background: #221008; color: #F5ECDA; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; }
        thead th:nth-child(1), thead th:nth-child(3), thead th:nth-child(6) { text-align: center; }
        thead th:nth-child(4), thead th:nth-child(5), thead th:nth-child(7) { text-align: right; }
        .section-label { background: #F5ECDA; font-weight: 700; font-size: 0.78rem; padding: 6px 8px; text-transform: uppercase; letter-spacing: 0.5px; color: #C43B26; }
        .terms { margin: 24px 0; font-size: 0.78rem; color: #6E5C4C; }
        .terms h3 { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #9C8B79; margin-bottom: 8px; }
        .terms ol { margin: 0; padding-left: 18px; line-height: 1.7; }
        .summary { margin-left: auto; width: 280px; font-size: 0.9rem; margin-top: 16px; }
        .summary div { display: flex; justify-content: space-between; padding: 5px 0; }
        .summary .save { color: #2F7A46; font-weight: 600; }
        .summary .grand { font-weight: 700; font-size: 1.2rem; border-top: 2px solid #221008; padding-top: 10px; margin-top: 6px; color: #C43B26; }
        .footer-note { margin-top: 40px; font-size: 0.82rem; color: #9C8B79; text-align: center; border-top: 1px solid #eee; padding-top: 16px; }
        .print-btn { display: block; margin: 0 auto 24px; padding: 10px 22px; border-radius: 999px; background: #C43B26; color: #fff; border: none; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
        @media print { .print-btn { display: none; } }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>

      <div class="brand-header">
        <h1>PHOENIX CRACKERS</h1>
        <div class="tagline">Sivakasi's Finest Fireworks</div>
        <div class="contact-line">www.funwithcrackers.com &nbsp;|&nbsp; +91 63836 59214 &nbsp;|&nbsp; nivasramasamy27@gmail.com</div>
      </div>

      <div class="bill-title">ESTIMATE BILL</div>

      <div class="parties">
        <div class="party-box">
          <h3>From</h3>
          <strong>Phoenix Crackers</strong><br/>
          Sivakasi, Tamil Nadu<br/>
          +91 63836 59214<br/>
          nivasramasamy27@gmail.com<br/>
          www.funwithcrackers.com
        </div>
        <div class="party-box">
          <h3>Bill To</h3>
          <strong>${order.customer.name}</strong><br/>
          ${order.customer.address}<br/>
          ${order.customer.city}, ${order.customer.state}, ${order.customer.pincode}<br/>
          Mobile: ${order.customer.phone}
        </div>
      </div>

      <div class="order-meta">
        <span><strong>Order ID:</strong> ${order.orderId}</span>
        <span><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sl.N</th><th>Product Name</th><th>Qty</th><th>Rate (Rs.)</th><th>Disc. Rate</th><th>Per</th><th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colspan="7" class="section-label">Discounted Products</td></tr>
          ${itemRows}
        </tbody>
      </table>

      <div class="terms">
        <h3>Terms &amp; Conditions</h3>
        <ol>
          <li>Product images are for reference only; actual items may vary.</li>
          <li>Delivery charges are payable by customer to the transport provider.</li>
          <li>Pickup from Sivakasi warehouse is at the buyer's own cost.</li>
          <li>Prices are valid at the time of quotation and subject to change.</li>
        </ol>
      </div>

      <div class="summary">
        <div><span>Total (MRP)</span><span>Rs.${totalMRP.toFixed(2)}</span></div>
        <div class="save"><span>You Save</span><span>- Rs.${youSave.toFixed(2)}</span></div>
        ${order.shippingFee > 0 ? `<div><span>Shipping</span><span>Rs.${order.shippingFee.toFixed(2)}</span></div>` : ''}
        <div class="grand"><span>Grand Total</span><span>Rs.${order.totalAmount.toFixed(2)}</span></div>
      </div>

      <div class="footer-note">
        Thank you for your business with Phoenix Crackers, Sivakasi<br/>
        Payment: ${order.paymentMethod} (${order.paymentStatus}) &nbsp;|&nbsp; Order Status: ${order.orderStatus}
      </div>
    </body>
    </html>
  `;
}

function openBill(order) {
  const blob = new Blob([generateBillHTML(order)], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
