/* ================================================================
   MEALS — Category page: load recipe grid from Sanity
   Depends on: sanity-client.js (loaded first)
   ================================================================ */

(async function () {
  'use strict';

  const section  = document.querySelector('.recipe-grid-section');
  const gridEl   = section && section.querySelector('.recipe-grid');
  const category = section && section.dataset.category;

  if (!gridEl || !category) return;

  gridEl.innerHTML =
    '<p class="recipe-grid__loading">Loading recipes…</p>';

  const QUERY = `
    *[_type == "recipe" && $cat in categories]
    | order(_createdAt desc) {
      _id, title, slug, photo,
      shortDescription, tags,
      cookingTime, calories, defaultServings
    }
  `;

  let recipes = [];
  try {
    recipes = await sanityFetch(QUERY, { cat: category });
  } catch (err) {
    console.error('[MEALS] Category load failed:', err);
    gridEl.innerHTML =
      '<p class="recipe-grid__loading">Could not load recipes — check Sanity project ID.</p>';
    return;
  }

  if (!recipes || recipes.length === 0) {
    gridEl.innerHTML =
      '<p class="recipe-grid__loading">No recipes in this category yet.<br>' +
      'Add some in <strong>Sanity Studio</strong> and assign them to this category.</p>';
    return;
  }

  gridEl.innerHTML = recipes
    .map(r => buildRecipeCardHTML(r, { linkPrefix: '', forCarousel: false }))
    .join('');
})();
