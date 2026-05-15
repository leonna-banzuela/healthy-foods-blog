import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'meals-healthy-foods-blog',
  title: 'Healthy Foods Blog',

  // ─── STEP: After running `sanity init`, paste your project ID below ───
  projectId: '7kenz4it',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('All Recipes')
              .schemaType('recipe')
              .child(S.documentTypeList('recipe').title('All Recipes')),

            S.divider(),

            S.listItem()
              .title('🌟 All Time Faves')
              .child(
                S.documentList()
                  .title('All Time Faves')
                  .apiVersion('2024-01-01')
                  .filter('_type == "recipe" && featuredInFaves == true')
                  .defaultOrdering([{ field: 'orderInFaves', direction: 'asc' }])
              ),

            S.divider(),

            S.listItem()
              .title('🌅 Breakfast')
              .child(
                S.documentList()
                  .title('Breakfast')
                  .apiVersion('2024-01-01')
                  .filter('_type == "recipe" && "breakfast" in categories')
              ),
            S.listItem()
              .title('☀️ Lunch')
              .child(
                S.documentList()
                  .title('Lunch')
                  .apiVersion('2024-01-01')
                  .filter('_type == "recipe" && "lunch" in categories')
              ),
            S.listItem()
              .title('🌙 Dinner')
              .child(
                S.documentList()
                  .title('Dinner')
                  .apiVersion('2024-01-01')
                  .filter('_type == "recipe" && "dinner" in categories')
              ),
            S.listItem()
              .title('🍎 Snack')
              .child(
                S.documentList()
                  .title('Snack')
                  .apiVersion('2024-01-01')
                  .filter('_type == "recipe" && "snack" in categories')
              ),
            S.listItem()
              .title('⚡ Quick & Easy')
              .child(
                S.documentList()
                  .title('Quick & Easy')
                  .apiVersion('2024-01-01')
                  .filter('_type == "recipe" && "quick-easy" in categories')
              ),
            S.listItem()
              .title('📦 Meal Prep')
              .child(
                S.documentList()
                  .title('Meal Prep')
                  .apiVersion('2024-01-01')
                  .filter('_type == "recipe" && "meal-prep" in categories')
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
