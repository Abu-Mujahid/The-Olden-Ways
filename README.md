# The Olden Ways — Website

Live site
- https://abu-mujahid.github.io/The-Olden-Ways/

A modern, responsive static site for the Telegram channel “The Olden Ways” with:
- Topic-based navigation
- Global search (Ctrl+K or `/`) across all topics and posts
- Tags with filtering on topic pages and a homepage tag cloud
- Dark/light theme toggle (dark by default)
- Glass, frosted header; soft-glow hover effects

## Quick start
- Ensure the Telegram logo is at `assets/telegram.png` (you already uploaded it).
- Serve locally:
  ```bash
  npx serve .
  ```
- Deploy to GitHub Pages (recommended) or Netlify/any static host.

## Content model
Content lives in `data/posts.json`:
```json
{
  "topics": [{ "slug": "affliction-dealing", "title": "Affliction Dealing" }],
  "posts": [
    {
      "id": "affliction-001",
      "topic": "affliction-dealing",
      "title": "Orienting the Heart in Hardship",
      "date": "2024-01-01",
      "summary": "Short description…",
      "tags": ["resilience", "dalīl"],
      "url": "/topics/affliction-dealing.html#affliction-001"
    }
  ]
}
```
- `topic` must match a slug in `topics`.
- `url` should point to the relevant section (can be the same page `#id` or an external link).
- Add/modify posts and refresh; the UI updates automatically.

## Adding posts
- Edit `data/posts.json` and commit.
- Optionally add anchors in the topic HTML (the renderer adds element IDs based on `id` automatically, so `#id` links work).

## Brand / typography
- The site uses the display font “Gloock” for headings/brand so the title itself looks like a logo.

## Accessibility
- Keyboard shortcuts for search, focusable controls, respects `prefers-reduced-motion`.

## Contact
- Contact button: `mailto:ravencorp.net@gmail.com`
- Telegram: https://t.me/kkawaakib