/* ===== Edit these ===== */
const CONFIG = {
  store: 'https://motorrecycleindia.myshopify.com',
  whatsappGroup: '',   // https://chat.whatsapp.com/…
  whatsapp: '',        // admin number with country code, e.g. +91 98xxxxxxxx
  email: ''            // e.g. hello@yourdomain.com
};

/* ===== Helpers ===== */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const money = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const imgUrl = (src, w = 600) => src ? src + (src.includes('?') ? '&' : '?') + 'width=' + w + (/\.(heic|png)/i.test(src) ? '&format=jpg' : '') : '';
const param = k => new URLSearchParams(location.search).get(k);
const waNumber = CONFIG.whatsapp.replace(/\D/g, '');

/* Tidy shouty Shopify titles: Title Case, keep model codes, fix common typos */
const FIX = { handel: 'Handlebar', thurxton: 'Thruxton', himaliyan: 'Himalayan', pannel: 'Panel', alloys: 'Alloy', clipon: 'Clip-On', damged: 'Damaged' };
const KEEP = /^(usd|xc|t4|oem|re|lh|rh|\d.*|.*\d.*)$/i;
const SMALL = /^(for|and|with|of|the|in|to)$/i;
const tidy = t => t.split(/(\s+|\/)/).map((w, i) => {
  const k = w.toLowerCase();
  if (FIX[k]) return FIX[k];
  if (KEEP.test(w)) return w.toUpperCase().replace('CC', 'cc');
  if (i > 0 && SMALL.test(w)) return k;
  return k.charAt(0).toUpperCase() + k.slice(1);
}).join('');

const CATS = [
  ['Fuel Tanks & Bodywork', /tank|pann?el|mudguard|hugger|bracket/i],
  ['Exhausts & Protection', /exhaust|guard|knee/i],
  ['Seats, Wheels & Suspension', /seat|wheel|suspension/i],
  ['Visors & Glass', /visor/i],
  ['Lighting & Indicators', /headlamp|indicator/i],
  ['Controls, Mirrors & Electrics', /lever|mirror|clip|switch|pump|fuelx|key/i]
];
const catOf = t => (CATS.find(([, re]) => re.test(t)) || ['Other'])[0];

/* ===== Live products from the Shopify store (cached 10 min) ===== */
async function loadProducts() {
  const cached = JSON.parse(sessionStorage.getItem('mrc-products') || 'null');
  if (cached && Date.now() - cached.at < 6e5) return cached.list;
  const res = await fetch(CONFIG.store + '/products.json?limit=250');
  if (!res.ok) throw new Error('Store unavailable');
  const list = (await res.json()).products.map((p, i) => {
    const variants = p.variants.map(v => ({ id: v.id, title: v.title, price: +v.price, available: v.available, options: [v.option1, v.option2, v.option3].filter(Boolean) }));
    return {
      handle: p.handle, title: tidy(p.title), order: i,
      price: Math.min(...variants.map(v => v.price)),
      soldOut: !variants.some(v => v.available),
      images: p.images.map(im => im.src),
      options: p.options.map((o, i) => ({ name: o.name, values: o.values, i })).filter(o => o.values.length > 1),
      variants,
      desc: new DOMParser().parseFromString(p.body_html || '', 'text/html').body.textContent.replace(/\n{3,}/g, '\n\n').trim(),
      cat: catOf(p.title)
    };
  });
  sessionStorage.setItem('mrc-products', JSON.stringify({ at: Date.now(), list }));
  return list;
}
const loadError = el => el.innerHTML = `<p class="loading">Couldn't load products right now. <a href="${CONFIG.store}/collections/all">Shop on our Shopify store ›</a></p>`;

/* ===== Cards & rows ===== */
const card = p => `<a class="card${p.soldOut ? ' sold' : ''}" href="product.html?p=${p.handle}">
<div class="frame"><img src="${imgUrl(p.images[0])}" alt="${esc(p.title)}" loading="lazy">${p.soldOut ? '<span class="badge">Sold out</span>' : ''}
<div class="info"><span><b>${money(p.price)}</b><br><small>${p.soldOut ? 'Sold out' : 'In stock'}</small></span><span class="view">View</span></div></div>
<span class="t">${esc(p.title)}</span><span class="p">${money(p.price)}</span></a>`;
const row = (title, list, href, link = 'Explore all') => list.length ? `<section class="row" aria-label="${esc(title)}">
<h2>${esc(title)} <a href="${href}">${link} ›</a></h2><div class="track">${list.map(card).join('')}</div></section>` : '';

/* ===== Cart (saved in this browser; checkout hands off to Shopify) ===== */
const Cart = {
  get: () => JSON.parse(localStorage.getItem('mrc-cart') || '[]'),
  save(items) { localStorage.setItem('mrc-cart', JSON.stringify(items)); Cart.badge(); },
  add(item) { const items = Cart.get(), hit = items.find(i => i.id === item.id); hit ? hit.qty += item.qty : items.push(item); Cart.save(items); },
  count: () => Cart.get().reduce((n, i) => n + i.qty, 0),
  checkoutUrl: items => CONFIG.store + '/cart/' + items.map(i => i.id + ':' + i.qty).join(','),
  badge() { const c = $('#cartCount'); if (c) c.textContent = Cart.count() || ''; }
};
function toast(html) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.append(t); }
  t.innerHTML = html; t.classList.add('show'); clearTimeout(t.timer); t.timer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ===== Contact panels (used on Home and Contact) ===== */
const contactPanels = () => `<div class="col">
<div class="panel green"><span class="tag">WhatsApp community</span>
<h3 class="display">Ride with India's<br>Triumph riders</h3>
<p>Join our WhatsApp group for Triumph owners across India — swap tips, ask about fitment and be first to see new parts.</p>
<a class="btn wa" href="${CONFIG.whatsappGroup || '#'}" target="_blank" rel="noopener">Join the WhatsApp group</a></div>
<div class="panel"><h3>Talk to us directly</h3><div class="direct">
<a class="wa" href="${waNumber ? 'https://wa.me/' + waNumber : '#'}" target="_blank" rel="noopener"><b>WhatsApp the admin</b><small>${esc(CONFIG.whatsapp || 'Number coming soon')}</small></a>
<a class="outline" href="${CONFIG.email ? 'mailto:' + CONFIG.email : '#'}"><b>Email us</b><small>${esc(CONFIG.email || 'Email coming soon')}</small></a></div>
<p class="muted" style="font-size:14px">Send your bike model and the part you need — we'll reply on WhatsApp or by email.</p></div></div>`;

/* ===== Header & footer ===== */
function layout(active) {
  const nav = [['index.html', 'Home'], ['catalog.html', 'Catalog'], ['contact.html', 'Contact']]
    .map(([h, l]) => `<a href="${h}"${l === active ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<header>
<div class="notice">Welcome to our store — <b>specialist in Triumph motorcycles</b></div>
<div class="bar"><div class="bar-left"><a class="logo" href="index.html" aria-label="Motor Re Cycle home">MOTOR<span>RECYCLE</span></a></div>
<nav class="nav" aria-label="Main">${nav}</nav>
<div class="icons">
<form class="search" id="search" action="catalog.html" role="search"><label class="sr" for="q">Search products</label><input id="q" name="q" type="search" placeholder="Parts, models…"></form>
<button class="icon" id="searchBtn" aria-label="Search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></button>
<a class="icon" href="${CONFIG.store}/account" aria-label="Account"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg></a>
<a class="icon" href="cart.html" aria-label="Cart"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg><span class="count" id="cartCount"></span></a>
</div></div></header>`);
  document.body.insertAdjacentHTML('beforeend', `<footer>
<h2 style="margin:0;color:#fff;font-size:32px">Join our email list</h2>
<p style="margin:8px 0 0;font-size:18px;color:var(--soft)">Get exclusive deals and early access to new products.</p>
<form method="post" action="${CONFIG.store}/contact#newsletter"><input type="hidden" name="form_type" value="customer"><input type="hidden" name="contact[tags]" value="newsletter">
<label class="sr" for="em">Email</label><input id="em" name="contact[email]" type="email" required placeholder="Email address"><button class="btn ember">Subscribe ›</button></form>
<div class="links"><a href="index.html">Home</a><a href="catalog.html">Catalog</a><a href="contact.html">Contact</a><a href="${CONFIG.store}/policies/terms-of-service">Terms and Policies</a></div>
<p style="margin-top:28px;font-size:13px"><span class="logo" style="font-size:22px">MOTOR<span>RECYCLE</span></span><br>© ${new Date().getFullYear()} MOTOR RE CYCLE, Powered by Shopify</p></footer>`);
  const s = $('#search');
  $('#searchBtn').onclick = () => { s.classList.toggle('open'); s.q.focus(); };
  if (param('q')) s.q.value = param('q');
  Cart.badge();
}
