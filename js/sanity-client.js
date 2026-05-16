/* ================================================================
   MEALS — Sanity CDN client (browser, no build step required)
   ================================================================
   SETUP: Replace YOUR_PROJECT_ID with the ID from `sanity init`.
   Also set the same ID in studio/sanity.config.js line 9.
   ================================================================ */

const SANITY_PROJECT_ID = '7kenz4it';
const SANITY_DATASET    = 'production';
const SANITY_API_VER    = '2024-01-01';

/* ── Fetch from Sanity CDN ────────────────────────────────────── */
async function sanityFetch(query, params = {}) {
  const url = new URL(
    `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VER}/data/query/${SANITY_DATASET}`
  );
  url.searchParams.set('query', query.trim());
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(val));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Sanity ${res.status}: ${res.statusText}`);
  return (await res.json()).result;
}

/* ── Build image CDN URL from a Sanity image reference ──────── */
function sanityImageUrl(ref, width = 800) {
  if (!ref) return '';
  const m = ref.match(/image-([a-f0-9]+)-(\d+x\d+)-(\w+)/);
  if (!m) return '';
  return (
    `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/` +
    `${m[1]}-${m[2]}.${m[3]}?w=${width}&auto=format&fit=crop`
  );
}

/* ── Build recipe card HTML (shared by homepage + category pages) */
function buildRecipeCardHTML(recipe, opts = {}) {
  const { linkPrefix = '', forCarousel = false } = opts;

  const slug  = recipe.slug?.current || recipe.slug || '';
  const href  = slug ? `${linkPrefix}recipe.html?slug=${slug}` : '#';
  const photo = recipe.photo?.asset?._ref
    ? sanityImageUrl(recipe.photo.asset._ref, 500)
    : '../../Brand essentials/hero-section-plates/1.png';

  const tags = (recipe.tags || [])
    .map(t => `<span class="recipe-card__tag">${escHtml(t)}</span>`)
    .join('');

  const cls    = forCarousel ? 'recipe-card' : 'recipe-card recipe-card--grid';
  const click  = href !== '#' ? ` onclick="location.href='${href}'"` : '';
  const cursor = href !== '#' ? 'cursor:pointer;' : '';

  const servings = recipe.defaultServings || 1;
  const servLabel = servings + ' serving' + (servings !== 1 ? 's' : '');

  const statsHtml = forCarousel
    ? `<div class="recipe-card__stats">
      <div class="recipe-card__stat">
        <span class="recipe-card__stat-label">Cooking Time</span>
        <span class="recipe-card__stat-value">${escHtml(recipe.cookingTime || '—')}</span>
      </div>
      <div class="recipe-card__stat">
        <span class="recipe-card__stat-label">Calories</span>
        <span class="recipe-card__stat-value">${recipe.calories ? recipe.calories + ' kcal' : '—'}</span>
      </div>
    </div>`
    : `<div class="recipe-card__stats">
      <div class="recipe-card__stat">
        <span class="recipe-card__stat-label">Cooking Time</span>
        <span class="recipe-card__stat-value">${escHtml(recipe.cookingTime || '—')}</span>
      </div>
      <div class="recipe-card__stat">
        <span class="recipe-card__stat-label">Calories</span>
        <span class="recipe-card__stat-value">${recipe.calories ? recipe.calories + ' kcal' : '—'}</span>
      </div>
      <div class="recipe-card__stat">
        <span class="recipe-card__stat-label">Serving</span>
        <span class="recipe-card__stat-value">${escHtml(servLabel)}</span>
      </div>
    </div>
    <div class="recipe-card__tags">${tags}</div>`;

  return `<article class="${cls}" data-slug="${escHtml(slug)}"${click} style="${cursor}">
  <div class="recipe-card__visual">
    <img class="recipe-card__plate" src="${photo}" alt="${escHtml(recipe.title || '')}">
  </div>
  <div class="recipe-card__body">
    <h3 class="recipe-card__title">${escHtml(recipe.title || 'Untitled')}</h3>
    <p class="recipe-card__desc">${escHtml(recipe.shortDescription || '')}</p>
    ${statsHtml}
  </div>
</article>`;
}

/* ── HTML escape helper ──────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
