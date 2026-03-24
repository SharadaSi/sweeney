# Alone Concept — Website

A static marketing website for **Alone Concept**, a Czech premium architecture studio specialising in tiny houses, family homes, and developer projects.

**Live site:** [alone.cz](https://alone.cz)

---

## Overview

Alone Concept is built around three pillars: radical purposefulness, respect for place, and the courage of simplicity. The website presents the studio's services and philosophy, showcases completed and visualised projects, and lets visitors submit a project inquiry directly online.

## Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `html/index.html` | Hero video, philosophy, tiny house & family home sections, developer projects |
| About Us | `html/about-us.html` | Studio story, team cards, construction gallery slider |
| Inquiry Form | `html/inquiry-form.html` | Project inquiry form with budget range slider |

The root `index.html` is a redirect shim that forwards visitors to `html/index.html`.

## Project Structure

```
.
├── index.html              # Root redirect to html/index.html
├── CNAME                   # Custom domain (alone.cz)
├── html/
│   ├── index.html          # Main landing page
│   ├── about-us.html       # About the studio and team
│   └── inquiry-form.html   # Project inquiry form
├── css/
│   ├── style.css           # Compiled stylesheet
│   └── style.css.map       # Source map
├── js/
│   ├── main.js             # Hamburger nav, scroll reveal, floating button
│   ├── about-us.js         # About page gallery slider
│   ├── inquiry-form.js     # Budget range slider, form logic
│   └── convert-media.js    # Media conversion helper
└── media/                  # Images (AVIF / WebP / JPEG), SVG logos, MP4 videos
```

## Features

- **Full-screen hero video** with autoplay and a scroll indicator
- **Slide-in navigation** panel with hamburger toggle and overlay, keyboard-accessible (Escape to close)
- **Scroll reveal animations** powered by `IntersectionObserver`
- **Responsive images** served as AVIF, WebP, and JPEG with multiple srcset sizes (320 / 640 / 1280 px)
- **Flip-card team section** on the About Us page
- **Construction gallery slider** with previous/next arrow navigation
- **Dual-handle budget range slider** on the inquiry form
- **Floating inquiry button** that switches colour on scroll past the hero section
- Semantic HTML with ARIA labels throughout

## Getting Started

No build step or package installation is required — this is a plain HTML/CSS/JS site.

1. Clone the repository:
   ```bash
   git clone https://github.com/SharadaSi/sweeney.git
   cd sweeney
   ```

2. Open the site in a browser. For full functionality (video autoplay, correct relative paths), serve it over HTTP rather than opening files directly:
   ```bash
   # Python 3
   python -m http.server 8000
   ```
   Then visit [http://localhost:8000](http://localhost:8000).

## Deployment

The site is deployed via **GitHub Pages** with a custom domain configured in `CNAME`. Push to the default branch to trigger a deployment.

## Contact

| | |
|---|---|
| **Email** | info@aloneconcept.cz |
| **Phone** | +420 123 456 789 |
| **Location** | Praha, Česká republika |

---

© 2026 Alone Concept. All rights reserved.
