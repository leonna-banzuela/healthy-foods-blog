/* =============================================================
   MEALS — Recipe page scroll / morph / ingredients drop logic
   ============================================================= */

/* Exposed as a named function so recipe-page-data.js can call it
   after Sanity data has been written to the DOM.
   Static pages (recipe-faves-1.html) auto-call at the bottom of this file. */
function initRecipePage() {
  'use strict';

  /* Apply accent + callout style from __TWEAKS__ (set inline in HTML) */
  const TWEAKS = window.__TWEAKS__ || {};
  document.body.dataset.accent       = TWEAKS.accent       || 'gold';
  document.body.dataset.calloutStyle = TWEAKS.calloutStyle || 'diagram';

  /* ── Refs ── */
  const morph            = document.getElementById('morph');
  const morphPlate       = document.getElementById('morph-plate');
  const hero             = document.getElementById('hero');
  const heroPhotoCol     = hero.querySelector('.hero__photo-col');
  const benefits         = document.getElementById('benefits');
  const benefitsDiagram  = document.getElementById('benefits-diagram');
  const ingreds          = document.getElementById('ingreds');

  /* ── Servings logic ── */
  const servingsEl  = document.getElementById('servings-value');
  const heroServes  = document.getElementById('hero-serves');
  const linesEl     = document.getElementById('receipt-lines');
  const countEl     = document.getElementById('receipt-count');
  const costEl      = document.getElementById('receipt-cost');
  const stepBtns    = document.querySelectorAll('.receipt__step');
  const ingredients = Array.from(document.querySelectorAll('.ingred'));

  const baseServings = (window.__RECIPE_DATA__ && window.__RECIPE_DATA__.baseServings) || 2;
  let servings = baseServings;

  function fmtQty(base, unit, factor) {
    const n = base * factor;
    if (unit === 'bunch') {
      const v = (n % 1 === 0) ? n : Math.round(n * 2) / 2;
      return v + ' ' + unit;
    }
    if (unit === 'cloves' || unit === 'tbsp' || unit === 'tsp') {
      const v = Math.round(n * 2) / 2;
      const s = (v % 1 === 0) ? String(v)
              : v === 0.5 ? '½'
              : v === 1.5 ? '1½'
              : v === 2.5 ? '2½'
              : v.toFixed(1);
      return s + ' ' + unit;
    }
    /* grams / default */
    return Math.round(n / 5) * 5 + ' g';
  }

  function buildReceipt() {
    linesEl.innerHTML = '';
    const factor = servings / baseServings;

    ingredients.forEach(el => {
      const qtyEl = el.querySelector('.ingred__qty');
      const base  = parseFloat(qtyEl.dataset.base);
      const unit  = qtyEl.dataset.unit;
      const name  = el.querySelector('.ingred__name').textContent;
      const qty   = fmtQty(base, unit, factor);

      const li = document.createElement('li');
      li.className = 'receipt__line';
      li.dataset.id = el.dataset.id;
      li.innerHTML =
        '<span class="receipt__line-name">' + name + '</span>' +
        '<span class="receipt__line-qty">'  + qty  + '</span>';
      linesEl.appendChild(li);
    });

    const baseCost = (window.__RECIPE_DATA__ && window.__RECIPE_DATA__.totalCost) || 11.40;
    countEl.textContent = ingredients.length;
    costEl.textContent  = '$' + (baseCost * factor).toFixed(2);
  }

  function updateServings(next) {
    servings = Math.max(1, Math.min(8, next));
    servingsEl.textContent = servings;
    if (heroServes) heroServes.textContent = servings + ' hungry';
    buildReceipt();
    refreshReceiptHighlight();
  }

  stepBtns.forEach(b =>
    b.addEventListener('click', () =>
      updateServings(servings + parseInt(b.dataset.step, 10))
    )
  );

  buildReceipt();

  /* ── Geometry helpers ── */
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /* ── Scroll-driven morph ──
     p = 0: plate docked at hero photo column centre
     p = 1: plate docked at benefits diagram centre
     Interpolation runs in document coordinates so the plate stays
     perfectly anchored at each end as the page scrolls.            */
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  function update() {
    ticking = false;

    const vh      = window.innerHeight;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    /* Hero dock — measured every frame so resizes and font-loads can't desync */
    const hr       = heroPhotoCol.getBoundingClientRect();
    const heroDocCX = hr.left + hr.width / 2;
    const heroDocCY = hr.top + scrollY + hr.height / 2;
    const heroSize  = Math.min(hr.width, hr.height);

    /* Benefits dock */
    const br      = benefitsDiagram.getBoundingClientRect();
    const benDocCX = br.left + br.width / 2;
    const benDocCY = br.top + scrollY + br.height / 2;
    const benSize  = Math.min(br.width, br.height);

    /* Scroll progress 0→1 */
    const startScroll = heroDocCY - vh / 2;
    const endScroll   = benDocCY  - vh / 2;
    const range = Math.max(1, endScroll - startScroll);
    const p = clamp01((scrollY - startScroll) / range);
    const e = easeInOutCubic(p);

    /* Interpolate dock in document space */
    const docCX = lerp(heroDocCX, benDocCX, e);
    const docCY = lerp(heroDocCY, benDocCY, e);
    const size  = lerp(heroSize,  benSize,  e);

    morphPlate.style.left      = docCX + 'px';
    morphPlate.style.top       = (docCY - scrollY) + 'px';
    morphPlate.style.width     = size + 'px';
    morphPlate.style.height    = size + 'px';
    morphPlate.style.transform = 'translate(-50%, -50%)';

    /* Callouts: hysteresis band prevents flicker at threshold */
    if (e >= 0.92)      morph.classList.add('is-callouts');
    else if (e <= 0.85) morph.classList.remove('is-callouts');

    /* Fade morph out as ingredients section enters */
    const ingredsTop = ingreds.getBoundingClientRect().top;
    morph.style.opacity = ingredsTop < vh * 0.4
      ? String(Math.max(0, ingredsTop / (vh * 0.4)))
      : '1';

    updateCart();
  }

  /* ── Snake-pattern cart animation ── */
  const pin     = document.getElementById('ingreds-pin');
  const cart    = document.getElementById('cart');
  const cartCnt = document.getElementById('cart-count');
  const headEl  = document.querySelector('.ingreds__head');

  let collected        = -1;
  let cachedRows       = null; /* invalidated on resize */
  let cachedReceiptLeft = null; /* left edge of receipt relative to .ingreds__head */

  /* Rows computed from offsetTop/offsetLeft — stable, not scroll-dependent */
  function buildRows() {
    const rows = [];
    ingredients.forEach((el, idx) => {
      const top = el.offsetTop;
      let row = rows.find(r => Math.abs(r.top - top) < 8);
      if (!row) { row = { top, elH: el.offsetHeight, items: [] }; rows.push(row); }
      row.items.push({ el, idx, centerX: el.offsetLeft + el.offsetWidth / 2 });
    });
    rows.sort((a, b) => a.top - b.top);
    rows.forEach(r => r.items.sort((a, b) => a.centerX - b.centerX));

    /* Cache receipt's right-boundary for the cart.
       On desktop the receipt sits to the right: use its left edge so the cart
       disappears under it. On mobile the receipt stacks below (offsetLeft ≈ 0),
       so treat as off-screen: use the full container width instead. */
    const receiptEl   = document.getElementById('receipt');
    const receiptLeft = receiptEl ? receiptEl.offsetLeft : headEl.offsetWidth;
    const isDesktop   = receiptLeft > headEl.offsetWidth * 0.3;
    cachedReceiptLeft = isDesktop ? receiptLeft : headEl.offsetWidth;

    cachedRows = rows;
    return rows;
  }

  function refreshReceiptHighlight() {
    linesEl.querySelectorAll('.receipt__line').forEach((li, i) => {
      li.classList.toggle('is-on', i <= collected);
    });
    if (cartCnt.firstChild) cartCnt.firstChild.nodeValue = String(Math.max(0, collected + 1));
  }

  function collect(i) {
    if (i >= 0 && i < ingredients.length)
      ingredients[i].classList.add('is-collected');
  }

  function uncollect(i) {
    if (i >= 0 && i < ingredients.length)
      ingredients[i].classList.remove('is-collected');
  }

  function updateCart() {
    const pinRect = pin.getBoundingClientRect();
    const vh      = window.innerHeight;
    const navH    = parseInt(getComputedStyle(document.documentElement)
                      .getPropertyValue('--nav-height')) || 52;

    const travel   = pin.offsetHeight - (vh - navH);
    const scrolled = Math.max(0, -pinRect.top);
    const p        = clamp01(travel > 0 ? scrolled / travel : 0);

    if (!ingredients.length) return;

    /* Use cached rows — offsetTop is layout-stable, not scroll-dependent */
    const rows    = cachedRows || buildRows();
    const numRows = rows.length;
    if (!numRows) return;

    /* ── Which row and how far through it ── */
    const rawRow = p * numRows;
    const ri     = Math.min(Math.floor(rawRow), numRows - 1);
    const rowP   = clamp01(rawRow - ri);

    const ltr   = ri % 2 === 0;
    const row   = rows[ri];
    const cartW = cart.offsetWidth;
    const cartH = cart.offsetHeight;
    const headW = headEl.offsetWidth;

    /* Y: centre cart vertically on this row (offsetTop is relative to .ingreds__head) */
    const cartY = row.top + row.elH / 2 - cartH / 2;

    /* X: both directions share the same boundary on the right (receipt's left edge).
          LTR: enter from off-screen left → disappear under receipt.
          RTL: emerge from under receipt → exit off-screen left. */
    const ltrEnd = cachedReceiptLeft !== null ? cachedReceiptLeft : headW;
    const x0     = ltr ? -cartW  : ltrEnd;
    const x1     = ltr ?  ltrEnd : -cartW;
    const cartX  = lerp(x0, x1, rowP);

    cart.style.top       = cartY + 'px';
    cart.style.left      = cartX + 'px';
    cart.style.transform = ltr ? '' : 'scaleX(-1)';

    /* ── Collect / uncollect based on cart's actual X position ──
       Each ingredient triggers when the cart centre crosses its centre,
       respecting direction (LTR rows: cart sweeps right; RTL: sweeps left). */
    const cartCenterX = cartX + cartW / 2;
    let collectCount  = 0;

    rows.forEach((r, rowIdx) => {
      const rowLtr = rowIdx % 2 === 0;
      r.items.forEach(item => {
        let shouldCollect;
        if (rowIdx < ri) {
          shouldCollect = true;
        } else if (rowIdx > ri) {
          shouldCollect = false;
        } else {
          shouldCollect = rowLtr
            ? cartCenterX >= item.centerX
            : cartCenterX <= item.centerX;
        }
        const isCollected = item.el.classList.contains('is-collected');
        if (shouldCollect && !isCollected) collect(item.idx);
        if (!shouldCollect && isCollected) uncollect(item.idx);
        if (shouldCollect) collectCount++;
      });
    });

    const newCollected = collectCount - 1;
    if (newCollected !== collected) {
      collected = newCollected;
      refreshReceiptHighlight();
    }
  }

  /* ── Init ── */
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { cachedRows = null; requestAnimationFrame(update); });

  /* Wait for fonts/images to settle, then build row cache and run first frame */
  setTimeout(() => {
    buildRows();
    update();
    morph.classList.add('is-ready');
  }, 60);

  window.addEventListener('load', () => requestAnimationFrame(update));
}

/* Auto-init for static recipe pages (e.g. recipe-faves-1.html).
   When window.__SANITY_RECIPE__ is true, recipe-page-data.js
   calls initRecipePage() manually after populating the DOM. */
if (!window.__SANITY_RECIPE__) {
  initRecipePage();
}
