# The Olden Ways — Website

A modern, responsive static site for the Telegram channel “The Olden Ways” with topic-based navigation, dark/light theme toggle, and a glass header.

## Quick start
- Put the provided Telegram logo at `assets/telegram.png` (512×512 works well).
- Serve locally (any static server), e.g.:
  ```bash
  npx serve .
  ```
- Deploy to GitHub Pages, Netlify, or any static host.

## Structure
- `index.html` — landing page with introduction, credits, and topic cards
- `topics/*.html` — one page per topic
- `styles.css` — theme, layout, components, glow effects
- `script.js` — theme toggle with localStorage, smooth anchor scroll

## Editing content
- Replace the sample posts in each `topics/*.html` with your content.
- Keep the owner’s message and credit line intact to reflect intent and attribution.

## Assets
- Telegram logo: save as `assets/telegram.png`. Alt text is intentionally empty to keep the button label concise.

## Accessibility
- Keyboard-focusable controls
- Respects `prefers-reduced-motion`
- Sufficient contrast in both themes

## Contact
- Contact button: `mailto:ravencorp.net@gmail.com`
- Telegram: https://t.me/kkawaakib