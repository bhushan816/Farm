# Govardhan Farm Website

**"Where Family, Nature & Celebrations Unite"**

A clean, elegant two-page website for Govardhan Farm — a 41,425 sq metre countryside farm in Gujarat, India.

---

## Project Structure

```
govardhan-farm/
├── index.html          # Home page
├── celebrations.html   # Celebrations page
├── css/
│   └── styles.css      # All styles
├── js/
│   └── main.js         # Scroll animations, nav, counter
└── README.md
```

---

## Features

- **Two pages**: Home and Celebrations
- **Sticky navigation** with scroll-aware transparency
- **Scroll reveal animations** (IntersectionObserver)
- **Parallax hero** background
- **Animated counter** (41,425 sq m stat)
- **Responsive design** — mobile, tablet, desktop
- **Google Fonts**: Playfair Display + Cormorant Garamond + Jost
- **Zero dependencies** — pure HTML, CSS, JS

---

## Deployment Options

### 1. Vercel (Recommended — Free)
```bash
npm i -g vercel
cd govardhan-farm
vercel
```

### 2. Netlify (Free)
- Drag and drop the `govardhan-farm/` folder at https://app.netlify.com/drop

### 3. GitHub Pages (Free)
```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/govardhan-farm.git
git push -u origin main
```
Then go to Settings → Pages → Deploy from main branch.

### 4. Static File Server (Local Preview)
```bash
# Python 3
cd govardhan-farm
python3 -m http.server 3000
# Open http://localhost:3000
```

---

## Customization

### Replace Images
The site uses Unsplash placeholder images. To use your own drone photos:
1. Add your images to an `assets/` folder
2. Replace `src="https://images.unsplash.com/..."` in both HTML files with `src="assets/your-image.jpg"`

### Update Farm Details
- **Coordinates**: Search for `22.512460, 70.264592` and replace with actual GPS if different
- **Stats**: The 41,425 sq m counter is in `index.html` (`data-counter="41425"`)
- **Content**: All text is inline in the HTML files — easy to find and edit

### Colors (in `css/styles.css`)
```css
:root {
  --cream: #f2ede3;     /* Page background */
  --dark:  #191917;     /* Footer / dark sections */
  --accent: #8b7355;    /* Buttons / highlights */
}
```

---

## Browser Support
Chrome 88+, Firefox 85+, Safari 14+, Edge 88+

---

*Govardhan Farm, Gujarat, India — 22.512460°N, 70.264592°E*
