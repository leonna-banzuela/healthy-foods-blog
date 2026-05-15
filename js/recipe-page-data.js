/* ================================================================
   MEALS — Recipe detail page: fetch from Sanity, populate DOM,
   then kick off the scroll/morph animations.
   Depends on: sanity-client.js (loaded first)
   ================================================================ */

(async function () {
  'use strict';

  /* ── 1. Read slug from URL (?slug=golden-morning-stack) ───── */
  const slug = new URLSearchParams(window.location.search).get('slug');
  if (!slug) { showError('No recipe found — missing slug in URL.'); return; }

  /* ── 2. Fetch full recipe from Sanity ────────────────────── */
  const QUERY = `
    *[_type == "recipe" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      photo,
      shortDescription,
      tags,
      cookingTime,
      calories,
      defaultServings,
      difficultyLevel,
      heroHeadlinePre,
      heroLede,
      benefitsHeading,
      benefits[] { name, copy },
      ingredients[] {
        name,
        photo,
        baseQuantity,
        unit,
        estimatedCost
      },
      sourceHeading,
      sourceAuthorName,
      sourceAuthorInitials,
      sourceLink
    }
  `;

  let recipe;
  try {
    recipe = await sanityFetch(QUERY, { slug });
  } catch (err) {
    console.error('[MEALS] Recipe fetch failed:', err);
    showError('Could not load recipe — check your Sanity project ID.');
    return;
  }

  if (!recipe) { showError('Recipe not found.'); return; }

  /* ── 3. Populate all DOM sections ───────────────────────── */
  populateRecipe(recipe);

  /* ── 4. Init scroll / morph animations ──────────────────── */
  if (typeof initRecipePage === 'function') {
    initRecipePage();
  }
})();


/* ── Error screen ───────────────────────────────────────────── */
function showError(msg) {
  document.body.innerHTML =
    `<div style="display:flex;align-items:center;justify-content:center;` +
    `height:100vh;font-family:Commissioner,sans-serif;font-size:1.1rem;` +
    `color:#1a1a1a;padding:2rem;text-align:center;">${msg}</div>`;
}


/* ── Populate recipe DOM ─────────────────────────────────────── */
function populateRecipe(r) {

  /* Helper: set textContent of first matching element */
  function set(sel, val) {
    const el = document.querySelector(sel);
    if (el && val != null) el.textContent = val;
  }

  /* ── Page title ── */
  document.title = `MEALS — ${r.title || 'Recipe'}`;

  /* ── Hero breadcrumb ── */
  const crumbLast = document.querySelector('.hero__crumbs span:last-child');
  if (crumbLast) crumbLast.textContent = r.title || '';

  /* ── Hero eyebrow ── */
  set('.hero__eyebrow', 'a meal worth romanticizing');

  /* ── Hero headline ── */
  set('.hero__pre', r.heroHeadlinePre || (r.title || '').toLowerCase());
  set('.hero__big', r.title || '');

  /* ── Hero lede ── */
  set('.hero__lede', r.heroLede || r.shortDescription || '');

  /* ── Meta chips (cook time, calories, serves, level) ── */
  const chips = document.querySelectorAll('.meta-chip');
  if (chips[0]) chips[0].querySelector('.meta-chip__value').textContent = r.cookingTime || '—';
  if (chips[1]) chips[1].querySelector('.meta-chip__value').textContent = r.calories ? r.calories + ' kcal' : '—';
  if (chips[2]) {
    const srv = r.defaultServings || 2;
    chips[2].querySelector('.meta-chip__value').textContent = srv + ' hungry';
    chips[2].querySelector('.meta-chip__value').id = 'hero-serves';
  }
  if (chips[3]) chips[3].querySelector('.meta-chip__value').textContent = r.difficultyLevel || 'easy';

  /* ── Hero tags ── */
  const tagsEl = document.querySelector('.hero__tags');
  if (tagsEl && r.tags && r.tags.length) {
    tagsEl.innerHTML = r.tags.map(t => `<span class="tag">${escHtml(t)}</span>`).join('');
  }

  /* ── Morph plate photo ── */
  const morphImg = document.getElementById('morph-img');
  if (morphImg && r.photo && r.photo.asset && r.photo.asset._ref) {
    morphImg.src = sanityImageUrl(r.photo.asset._ref, 700);
    morphImg.alt = r.title || '';
  }

  /* ── Benefits section ── */
  set('.benefits__heading', r.benefitsHeading || 'Four quiet things\nworking in your favour.');
  set('.benefits__lede', '');

  if (r.benefits && r.benefits.length) {
    const callouts = document.querySelectorAll('.callout');
    r.benefits.forEach((b, i) => {
      const el = callouts[i];
      if (!el) return;
      const nameEl = el.querySelector('.callout__name');
      const copyEl = el.querySelector('.callout__copy');
      if (nameEl) nameEl.textContent = b.name || '';
      if (copyEl) copyEl.textContent = b.copy || '';
    });
  }

  /* ── Ingredients strip ── */
  const ingRedsRow = document.getElementById('ingreds-row');
  const ingredients = r.ingredients || [];

  if (ingRedsRow && ingredients.length) {
    ingRedsRow.innerHTML = ingredients.map(ing => {
      const id    = (ing.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const photo = ing.photo && ing.photo.asset && ing.photo.asset._ref
        ? sanityImageUrl(ing.photo.asset._ref, 200)
        : '';
      const imgTag = photo
        ? `<img class="ingred__img" src="${photo}" alt="${escHtml(ing.name || '')}">`
        : `<div class="ingred__img" style="background:var(--cream-mid,#e8e4db);border-radius:50%;"></div>`;

      return `<div class="ingred" data-id="${escHtml(id)}">
  ${imgTag}
  <span class="ingred__sticker">${escHtml(ing.name || '')}</span>
  <div class="ingred__name">${escHtml(ing.name || '')}</div>
  <div class="ingred__qty" data-base="${ing.baseQuantity || 0}" data-unit="${escHtml(ing.unit || 'g')}">${ing.baseQuantity || ''} ${escHtml(ing.unit || '')}</div>
</div>`;
    }).join('');
  }

  /* ── Cart count suffix ── */
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.innerHTML = `0<span class="cart__count-of">/${ingredients.length}</span>`;
  }

  /* ── Receipt ── */
  const receiptTitle = document.querySelector('.receipt__title');
  if (receiptTitle && r.title) {
    const words = r.title.toLowerCase().split(' ');
    const half  = Math.ceil(words.length / 2);
    receiptTitle.innerHTML =
      escHtml(words.slice(0, half).join(' ')) + '<br>' +
      escHtml(words.slice(half).join(' '));
  }

  set('.receipt__sub',
    "a weeknight plate · ready in " + (r.cookingTime || '--')
  );

  /* Receipt cook time total row */
  const bigRow = document.querySelector('.receipt__total-row--big .receipt__total-row-value');
  if (!bigRow) {
    const bigRows = document.querySelectorAll('.receipt__total-row--big span');
    if (bigRows[1]) bigRows[1].textContent = r.cookingTime || '—';
  } else {
    bigRow.textContent = r.cookingTime || '—';
  }

  /* ── Pass base servings + total cost to recipe-page.js ── */
  const totalCost = ingredients.reduce((s, i) => s + (i.estimatedCost || 0), 0);
  window.__RECIPE_DATA__ = {
    baseServings: r.defaultServings || 2,
    totalCost:    totalCost > 0 ? totalCost : 11.40,
  };

  /* ── Source section ── */
  set('.source__heading', r.sourceHeading || "We didn’t write this one.");
  set('.source__lede', "We're the bridge between you and recipes worth sharing. We give credit where it's due.");
  set('.source__attrib-name', r.sourceAuthorName || '');


  const avatarSpan = document.querySelector('.source__avatar span');
  if (avatarSpan) avatarSpan.textContent = r.sourceAuthorInitials || '??';

  const sourceBtn = document.querySelector('.source__btn');
  if (sourceBtn && r.sourceLink) {
    sourceBtn.href = r.sourceLink;
  }
}


/* ── HTML escape helper ─────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
