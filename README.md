# 🌍 Earth Website — 3D Interactive Planetary Landing Page

An immersive, production-ready 3D planetary exploration website built with **Three.js** and **Vite**. Explore Earth, Mars, and Venus with realistic textures, atmospheric glow shaders, and smooth animated transitions — all running in your browser.

![Earth Preview](public/assets/textures/earth.jpg)

---

## ✨ Features

- 🌐 **3D Planets** — Photorealistic Earth (with rotating cloud layer), Mars, and Venus rendered using Three.js
- 🌫️ **Fresnel Atmospheric Glow** — Custom GLSL rim-lighting shader per planet (cyan for Earth, amber for Mars, golden for Venus)
- ⭐ **Twinkling Starfield** — 3,000 depth-layered star particles with animated twinkle shader
- 🔄 **Smooth Transitions** — Dual-mesh crossfade with inertia spin boost when switching planets
- 🪐 **Side Preview Selectors** — Interactive mini 3D globes half off-screen on left and right edges
- 🎵 **Cosmic Audio** — Web Audio API synthesizer for cosmic chimes and UI click sounds
- ⌨️ **Multi-Input Controls** — Keyboard `←` / `→` arrows, touch swipe gestures, and mouse parallax
- 🔗 **URL Deep-Linking** — `?planet=earth`, `?planet=mars`, `?planet=venus` with browser history support
- 📱 **Responsive** — Works across desktop and mobile

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/sahal241/earth_website.git
cd earth_website

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open your browser at [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🎮 Controls

| Action | Control |
|--------|---------|
| Switch planet | Click side preview sphere or label |
| Navigate left | `←` arrow key or swipe right |
| Navigate right | `→` arrow key or swipe left |
| Toggle sound | Click the 🔊 button (bottom right) |
| Direct access | `?planet=earth` / `?planet=mars` / `?planet=venus` |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Three.js](https://threejs.org/) v0.186 | 3D WebGL rendering |
| [Vite](https://vitejs.dev/) v8 | Lightning-fast dev server & bundler |
| GLSL Shaders | Custom Fresnel atmosphere & star twinkle |
| Web Audio API | Procedural cosmic sound effects |
| CSS Glassmorphism | UI overlays and navigation |
| [Cinzel](https://fonts.google.com/specimen/Cinzel) / [Playfair Display](https://fonts.google.com/specimen/Playfair+Display) | Serif typography |

---

## 📁 Project Structure

```
earth_website/
├── index.html              # Main HTML — nav, hero, side selectors
├── main.js                 # Three.js scene, planets, shaders, audio
├── style.css               # UI styles, glassmorphism, animations
├── package.json            # Vite + Three.js dependencies
└── public/
    └── assets/
        └── textures/
            ├── earth.jpg           # Earth surface texture
            ├── earth_clouds.png    # Cloud layer (transparent)
            ├── earth_specular.jpg  # Specular map for ocean reflections
            ├── mars.jpg            # Mars surface texture
            ├── venus.jpg           # Venus cloud texture
            └── stars.jpg          # Starfield background
```

---

## 🌈 Planet Highlights

### 🌍 Earth
- Centered on Australia & the Indian Ocean
- Independent slowly-drifting cloud sphere
- Ocean specular reflections via roughness map
- Cyan atmospheric glow (`#38bdf8`)

### 🔴 Mars
- Olympus Mons caldera centered at horizon
- Rust-red desert surface with crater detail
- Warm amber atmospheric rim (`#f97316`)

### 🌕 Venus
- Dense swirling sulfuric cloud bands
- Golden amber atmospheric halo (`#dfaf5a`)
- Slow retrograde rotation

---

## 📸 Screenshots

| Earth | Mars | Venus |
|-------|------|-------|
| Blue atmospheric glow, Australia visible | Olympus Mons, rust-red surface | Golden cloud bands, amber halo |

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">Built with ❤️ using Three.js & Vite</p>
