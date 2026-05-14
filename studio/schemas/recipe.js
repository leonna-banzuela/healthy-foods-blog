import { defineField, defineType } from 'sanity'

export const recipe = defineType({
  name: 'recipe',
  title: 'Recipe',
  type: 'document',
  groups: [
    { name: 'card',        title: '📇 Card Info'           },
    { name: 'categories',  title: '🗂️ Categories'           },
    { name: 'detail',      title: '📄 Recipe Detail Page'   },
    { name: 'benefits',    title: '✨ Health Benefits'      },
    { name: 'ingredients', title: '🧺 Ingredients'          },
    { name: 'source',      title: '🔗 Source & Credit'      },
  ],

  fields: [
    // ── CARD INFO ─────────────────────────────────────────────────────
    defineField({
      group: 'card',
      name: 'title',
      title: 'Recipe Name',
      type: 'string',
      validation: Rule => Rule.required().error('Every recipe needs a name.'),
    }),
    defineField({
      group: 'card',
      name: 'slug',
      title: 'URL Slug',
      description: 'Auto-generated from the recipe name. Used in the page URL.',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      group: 'card',
      name: 'photo',
      title: 'Recipe Photo',
      description: 'The main plate image shown on cards and the detail page.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      group: 'card',
      name: 'shortDescription',
      title: 'Short Description',
      description: 'Shown on recipe cards — keep it to 1–2 sentences.',
      type: 'text',
      rows: 2,
    }),
    defineField({
      group: 'card',
      name: 'tags',
      title: 'Labels / Tags',
      description: 'e.g. vegan, easy, weeknight, high-protein, one-pan',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      group: 'card',
      name: 'cookingTime',
      title: 'Cooking Time',
      description: 'e.g. 15 mins, 1 hr 30 mins',
      type: 'string',
    }),
    defineField({
      group: 'card',
      name: 'calories',
      title: 'Calories (kcal)',
      type: 'number',
    }),
    defineField({
      group: 'card',
      name: 'defaultServings',
      title: 'Default Servings',
      description: 'Starting servings count on the interactive receipt.',
      type: 'number',
      initialValue: 2,
    }),
    defineField({
      group: 'card',
      name: 'difficultyLevel',
      title: 'Difficulty Level',
      type: 'string',
      options: {
        list: [
          { title: 'Easy',   value: 'easy'   },
          { title: 'Medium', value: 'medium' },
          { title: 'Hard',   value: 'hard'   },
        ],
        layout: 'radio',
      },
      initialValue: 'easy',
    }),

    // ── CATEGORIES ────────────────────────────────────────────────────
    defineField({
      group: 'categories',
      name: 'categories',
      title: 'Category Pages',
      description: 'Which category pages should this recipe appear on? A recipe can be in multiple categories.',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Breakfast',   value: 'breakfast'  },
          { title: 'Lunch',       value: 'lunch'      },
          { title: 'Dinner',      value: 'dinner'     },
          { title: 'Snack',       value: 'snack'      },
          { title: 'Quick & Easy', value: 'quick-easy' },
          { title: 'Meal Prep',   value: 'meal-prep'  },
        ],
        layout: 'grid',
      },
    }),
    defineField({
      group: 'categories',
      name: 'featuredInFaves',
      title: 'Feature in "All Time Faves" Carousel',
      description: 'Toggle ON to show this recipe in the homepage carousel.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      group: 'categories',
      name: 'orderInFaves',
      title: 'Position in Faves Carousel',
      description: 'Lower number = appears first. Only relevant when Featured in Faves is on.',
      type: 'number',
      initialValue: 99,
    }),

    // ── RECIPE DETAIL PAGE ────────────────────────────────────────────
    defineField({
      group: 'detail',
      name: 'recipeNumber',
      title: 'Recipe Number',
      description: 'Shown as "no. 001" in the hero. Use 3 digits: 001, 002, etc.',
      type: 'string',
    }),
    defineField({
      group: 'detail',
      name: 'breadcrumbCategory',
      title: 'Breadcrumb Category',
      description: 'Shown in the hero breadcrumb trail (e.g. Dinner, Breakfast).',
      type: 'string',
    }),
    defineField({
      group: 'detail',
      name: 'heroHeadlinePre',
      title: 'Hero Headline — Small Italic Line',
      description: 'Small italicised line above the main title (e.g. "golden morning").',
      type: 'string',
    }),
    defineField({
      group: 'detail',
      name: 'heroLede',
      title: 'Hero Description',
      description: 'The paragraph shown under the headline on the recipe detail page.',
      type: 'text',
      rows: 4,
    }),

    // ── HEALTH BENEFITS ───────────────────────────────────────────────
    defineField({
      group: 'benefits',
      name: 'benefitsHeading',
      title: 'Benefits Section Heading',
      type: 'string',
      initialValue: 'Four quiet things working in your favour.',
    }),
    defineField({
      group: 'benefits',
      name: 'benefitsLede',
      title: 'Benefits Section Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      group: 'benefits',
      name: 'benefits',
      title: 'Health Benefit Callouts',
      description: 'Up to 4 callouts that radiate around the plate image (top-left → top-right → bottom-right → bottom-left).',
      type: 'array',
      of: [{
        type: 'object',
        name: 'benefit',
        fields: [
          defineField({ name: 'name', title: 'Benefit Name', type: 'string' }),
          defineField({ name: 'copy', title: 'Benefit Description', type: 'text', rows: 2 }),
        ],
        preview: { select: { title: 'name', subtitle: 'copy' } },
      }],
      validation: Rule => Rule.max(4).warning('Only 4 callouts are shown on the plate diagram.'),
    }),

    // ── INGREDIENTS ───────────────────────────────────────────────────
    defineField({
      group: 'ingredients',
      name: 'ingredients',
      title: 'Ingredients',
      description: 'Each ingredient appears in the animated shopping strip and on the receipt.',
      type: 'array',
      of: [{
        type: 'object',
        name: 'ingredient',
        fields: [
          defineField({
            name: 'name',
            title: 'Ingredient Name',
            type: 'string',
            validation: Rule => Rule.required(),
          }),
          defineField({
            name: 'photo',
            title: 'Ingredient Photo',
            description: 'Square image works best.',
            type: 'image',
            options: { hotspot: true },
          }),
          defineField({
            name: 'baseQuantity',
            title: 'Base Quantity',
            description: 'Quantity for the default serving count.',
            type: 'number',
          }),
          defineField({
            name: 'unit',
            title: 'Unit',
            description: 'e.g. g, ml, tsp, tbsp, cloves, bunch',
            type: 'string',
          }),
          defineField({
            name: 'estimatedCost',
            title: 'Estimated Cost (USD)',
            description: 'Used to calculate the total pantry cost on the receipt.',
            type: 'number',
          }),
        ],
        preview: {
          select: { title: 'name', media: 'photo', qty: 'baseQuantity', unit: 'unit' },
          prepare({ title, media, qty, unit }) {
            return { title, media, subtitle: qty && unit ? `${qty} ${unit}` : '' };
          },
        },
      }],
    }),
    defineField({
      group: 'ingredients',
      name: 'receiptSub',
      title: 'Receipt Subtitle Line',
      description: 'e.g. "a weeknight plate · ready in 30"',
      type: 'string',
    }),

    // ── SOURCE & CREDIT ───────────────────────────────────────────────
    defineField({
      group: 'source',
      name: 'sourceHeading',
      title: 'Source Section Heading',
      type: 'string',
      initialValue: "We didn't write this one.",
    }),
    defineField({
      group: 'source',
      name: 'sourceLede',
      title: 'Source Attribution Paragraph',
      description: 'Introduce who created this recipe and where it originally appeared.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      group: 'source',
      name: 'sourceAuthorName',
      title: 'Author Name & Publication',
      description: 'e.g. "Jane Doe · Healthy Kitchen"',
      type: 'string',
    }),
    defineField({
      group: 'source',
      name: 'sourceAuthorInitials',
      title: 'Author Avatar Initials',
      description: '2 characters shown in the avatar circle when no photo is available (e.g. HK).',
      type: 'string',
      validation: Rule => Rule.max(2),
    }),
    defineField({
      group: 'source',
      name: 'sourcePublishedMeta',
      title: 'Published Meta',
      description: 'e.g. "published Jan 2024 · 8 min read"',
      type: 'string',
    }),
    defineField({
      group: 'source',
      name: 'sourceLink',
      title: 'Link to Original Recipe',
      description: 'The external URL that leads to the full original recipe.',
      type: 'url',
      validation: Rule =>
        Rule.required().uri({ scheme: ['http', 'https'] }).error('A link to the original recipe is required.'),
    }),
  ],

  preview: {
    select: {
      title:      'title',
      media:      'photo',
      categories: 'categories',
      faves:      'featuredInFaves',
    },
    prepare({ title, media, categories, faves }) {
      const cats = Array.isArray(categories) && categories.length
        ? categories.join(', ')
        : 'no category';
      const star = faves ? '⭐ ' : '';
      return { title: star + (title || 'Untitled'), media, subtitle: cats };
    },
  },
})
