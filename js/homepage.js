/* ================================================================
   MEALS — Homepage: load faves carousel from Sanity
   Depends on: sanity-client.js (loaded first)
   ================================================================ */

(async function () {
  'use strict';

  const deck = document.getElementById('faves-deck');
  if (!deck) return;

  const FAVES_QUERY = `
    *[_type == "recipe" && featuredInFaves == true]
    | order(_createdAt desc) {
      _id, title, slug, photo,
      shortDescription, tags,
      cookingTime, calories, defaultServings
    }
  `;

  let recipes = [];
  try {
    recipes = await sanityFetch(FAVES_QUERY);
  } catch (err) {
    console.error('[MEALS] Faves load failed:', err);
    deck.innerHTML =
      '<p style="color:#fff;text-align:center;padding:3rem 1rem;font-family:Commissioner,sans-serif;">' +
      'Could not load recipes — check your Sanity project ID in js/sanity-client.js.</p>';
    return;
  }

  if (!recipes || recipes.length === 0) {
    deck.innerHTML =
      '<p style="color:#fff;text-align:center;padding:3rem 1rem;font-family:Commissioner,sans-serif;">' +
      'No featured recipes yet — open Sanity Studio and add some!</p>';
    return;
  }

  deck.innerHTML = recipes
    .map(r => buildRecipeCardHTML(r, { linkPrefix: 'pages/', forCarousel: true }))
    .join('');

  initFavesCarousel(deck);
})();


/* ── Faves arc carousel ──────────────────────────────────────── */
function initFavesCarousel(deck) {
  const prevBtn = document.getElementById('faves-prev');
  const nextBtn = document.getElementById('faves-next');
  const cards   = Array.from(deck.querySelectorAll('.recipe-card'));
  const N       = cards.length;
  let   active  = 0;

  if (N === 0 || !prevBtn || !nextBtn) return;

  function isMobile() { return window.innerWidth <= 640; }

  function cardAtSlot(slot) {
    return cards[((active + slot) % N + N) % N];
  }

  function applyTransforms() {
    const mobile      = isMobile();
    const visibleSide = mobile ? 1 : 3;
    const cardH       = cards[0].offsetHeight;

    const R         = mobile ? 420 : 800;
    const angleStep = mobile ? 18  : 10;
    const bottomY   = mobile ? 360 : 486;
    const Y_center  = bottomY + R;
    const scaleStep = 0.07;

    cards.forEach(card => {
      card.style.opacity       = '0';
      card.style.pointerEvents = 'none';
      card.style.zIndex        = '0';
      card.style.cursor        = 'default';
    });

    /* Process center-out so the active (slot 0) card wins when N < slots */
    const slotsOrdered = [];
    for (let i = 0; i <= visibleSide; i++) {
      slotsOrdered.push(i);
      if (i !== 0) slotsOrdered.push(-i);
    }
    const assigned = new Set();

    for (const slot of slotsOrdered) {
      const card = cardAtSlot(slot);
      if (assigned.has(card)) continue;
      assigned.add(card);

      const absSlot  = Math.abs(slot);
      const thetaRad = slot * angleStep * Math.PI / 180;
      const thetaDeg = slot * angleStep;
      const bx       = R * Math.sin(thetaRad);
      const by       = Y_center - R * Math.cos(thetaRad);
      const tx       = bx;
      const ty       = by - cardH;
      const scale    = Math.max(0.5, 1 - absSlot * scaleStep);
      const opacity  = absSlot === 0 ? 1 : Math.max(0.06, Math.pow(0.75, absSlot));
      const zIndex   = 20 - absSlot;

      card.style.transform     = `translateX(calc(-50% + ${tx}px)) translateY(${ty}px) rotate(${thetaDeg}deg) scale(${scale})`;
      card.style.opacity       = String(opacity);
      card.style.zIndex        = String(zIndex);
      card.style.pointerEvents = 'auto';
      card.style.cursor        = slot === 0 ? 'default' : 'pointer';
    }
  }

  function goTo(newActive) {
    active = newActive;
    applyTransforms();
  }

  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      const rawSlot = ((idx - active) % N + N) % N;
      const slot    = rawSlot > Math.floor(N / 2) ? rawSlot - N : rawSlot;
      if (slot === 0) {
        const slug = card.dataset.slug;
        if (slug) window.location.href = 'pages/recipe.html?slug=' + encodeURIComponent(slug);
      } else {
        goTo(active + slot);
      }
    });
  });

  prevBtn.addEventListener('click', () => goTo(active - 1));
  nextBtn.addEventListener('click', () => goTo(active + 1));

  /* Touch swipe */
  let touchStartX = 0;
  deck.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  deck.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(active + (diff > 0 ? 1 : -1));
  }, { passive: true });

  /* Mouse drag */
  let mouseStartX = 0, dragging = false;
  deck.addEventListener('mousedown', e => { mouseStartX = e.clientX; dragging = true; });
  deck.addEventListener('dragstart', e => e.preventDefault());
  window.addEventListener('mouseup', e => {
    if (!dragging) return;
    dragging = false;
    const steps = Math.round((mouseStartX - e.clientX) / 100);
    if (steps !== 0) goTo(active + steps);
  });

  /* Wheel / trackpad */
  let wheelAccum = 0, wheelTimer = null;
  deck.parentElement.addEventListener('wheel', e => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    e.preventDefault();
    wheelAccum += e.deltaX;
    const steps = Math.trunc(wheelAccum / 80);
    if (steps !== 0) {
      wheelAccum -= steps * 80;
      deck.classList.add('faves__deck--scrolling');
      goTo(active + steps);
    }
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      wheelAccum = 0;
      deck.classList.remove('faves__deck--scrolling');
    }, 150);
  }, { passive: false });

  window.addEventListener('resize',   applyTransforms);
  window.addEventListener('pageshow', applyTransforms);
  applyTransforms();
}
