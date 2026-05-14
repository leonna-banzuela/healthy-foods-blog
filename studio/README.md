# MEALS — Sanity Studio Setup

This folder contains the Sanity Studio CMS for the **Healthy Foods Blog**.

---

## First-time setup

### 1. Install Sanity CLI
```bash
npm install -g sanity@latest
```

### 2. Install studio dependencies
```bash
cd studio
npm install
```

### 3. Create the Sanity project
```bash
sanity init --bare
```
When prompted:
- **Project name:** `healthy foods blog`
- **Dataset:** `production`
- Copy the **Project ID** you receive.

### 4. Paste your Project ID
Open these two files and replace `YOUR_PROJECT_ID`:

- `studio/sanity.config.js` → line 9
- `versions/js/sanity-client.js` → line 5

### 5. Enable CORS for your site
In the Sanity dashboard → your project → **API** → **CORS Origins**, add:
- `http://localhost` (for local development)
- `https://your-github-username.github.io` (for GitHub Pages)

### 6. Start the studio
```bash
npm run dev
```
Opens at `http://localhost:3333` — log in with your Sanity account.

---

## Deploying the studio

To host the studio at a public URL (so you can edit from anywhere):
```bash
npm run deploy
```
This gives you a URL like `https://healthy-foods-blog.sanity.studio`.

---

## Editable fields per recipe

| Group | Field | Description |
|-------|-------|-------------|
| Card Info | Recipe Name | Title shown on cards |
| Card Info | URL Slug | Auto-generated; used in page URLs |
| Card Info | Recipe Photo | Main plate image |
| Card Info | Short Description | 1–2 sentence teaser |
| Card Info | Labels / Tags | e.g. vegan, easy, weeknight |
| Card Info | Cooking Time | e.g. 15 mins |
| Card Info | Calories | kcal value |
| Card Info | Default Servings | Starting count on the receipt |
| Card Info | Difficulty Level | Easy / Medium / Hard |
| Categories | Category Pages | Breakfast, Lunch, Dinner, Snack, Quick & Easy, Meal Prep |
| Categories | Feature in Faves | Toggle for homepage carousel |
| Categories | Position in Faves | Order within the carousel |
| Recipe Detail | Recipe Number | e.g. 001 |
| Recipe Detail | Breadcrumb Category | e.g. Dinner |
| Recipe Detail | Hero Headline (small) | Italic line above the main title |
| Recipe Detail | Hero Description | Paragraph under the headline |
| Health Benefits | Benefits Heading | Section heading |
| Health Benefits | Benefits Description | Section intro paragraph |
| Health Benefits | Callouts (×4) | Name + description for each callout around the plate |
| Ingredients | Ingredients (×N) | Name, photo, quantity, unit, cost per ingredient |
| Ingredients | Receipt Subtitle | e.g. "a weeknight plate · ready in 30" |
| Source & Credit | Source Heading | e.g. "We didn't write this one." |
| Source & Credit | Attribution Paragraph | Who made it, where it's from |
| Source & Credit | Author Name | e.g. "Jane Doe · Healthy Kitchen" |
| Source & Credit | Author Initials | 2-char avatar fallback |
| Source & Credit | Published Meta | e.g. "published Jan 2024 · 8 min read" |
| Source & Credit | Link to Original Recipe | External URL (required) |
