import * as THREE from 'three';

// ============================================================
// PLANETARY CONFIGURATIONS & EXACT ATTRIBUTES
// ============================================================
const PLANETS = {
  earth: {
    id: 'earth',
    name: 'EARTH',
    description: "Learn more about the fascinating details that we call our home, Planet Earth. Course enrollment starts today. Early Bird tickets typically last a week, don't miss out!",
    glowColor: new THREE.Color(0x38bdf8), // Cyan/Sky blue
    ambientColor: 'rgba(56, 189, 248, 0.28)',
    textureKey: 'earth',
    cloudsKey: 'earthClouds',
    specularKey: 'earthSpecular',
    leftId: 'venus',
    rightId: 'mars',
    initialRotation: { x: -0.52, y: -3.52 }, // Australia & Indian Ocean at bottom center
    rotationSpeed: 0.0005,
    hasClouds: true,
    roughness: 0.45,
    metalness: 0.05
  },
  mars: {
    id: 'mars',
    name: 'MARS',
    description: "The rust-red desert world, home to the tallest volcano we know of. Course enrollment starts today. Early Bird tickets typically last a week, don't miss out!",
    glowColor: new THREE.Color(0xf97316), // Rust Amber/Orange
    ambientColor: 'rgba(249, 115, 22, 0.28)',
    textureKey: 'mars',
    cloudsKey: null,
    specularKey: null,
    leftId: 'earth',
    rightId: 'venus',
    initialRotation: { x: -0.12, y: 0.95 }, // Olympus Mons caldera visible at center
    rotationSpeed: 0.0006,
    hasClouds: false,
    roughness: 0.85,
    metalness: 0.02
  },
  venus: {
    id: 'venus',
    name: 'VENUS',
    description: "The hottest world in our solar system, wrapped in clouds of sulfuric acid. Course enrollment starts today. Early Bird tickets typically last a week, don't miss out!",
    glowColor: new THREE.Color(0xdfaf5a), // Warm Golden Amber
    ambientColor: 'rgba(223, 175, 90, 0.22)',
    textureKey: 'venus',
    cloudsKey: null,
    specularKey: null,
    leftId: 'earth',
    rightId: 'mars',
    initialRotation: { x: 0.05, y: -1.57 }, // Swirling cloud bands at center
    rotationSpeed: -0.0004,
    hasClouds: false,
    roughness: 0.6,
    metalness: 0.02
  }
};

let currentPlanetId = 'earth';
let isTransitioning = false;
let audioEnabled = true;

// Check URL query parameters for direct planet deep-linking (e.g. ?planet=mars)
const urlParams = new URLSearchParams(window.location.search);
const paramPlanet = urlParams.get('planet')?.toLowerCase();
if (paramPlanet && PLANETS[paramPlanet]) {
  currentPlanetId = paramPlanet;
}

// ============================================================
// DOM ELEMENTS
// ============================================================
const heroTitle = document.getElementById('hero-title');
const heroDesc = document.getElementById('hero-description');
const ambientGlow = document.getElementById('ambient-glow');
const leftLabel = document.getElementById('left-planet-label');
const rightLabel = document.getElementById('right-planet-label');
const leftSelector = document.getElementById('left-selector');
const rightSelector = document.getElementById('right-selector');
const backBtn = document.getElementById('back-btn');
const ctaBtn = document.getElementById('cta-btn');
const enrollBtn = document.getElementById('enroll-btn');
const downBtn = document.getElementById('down-btn');
const audioToggle = document.getElementById('audio-toggle');
const soundIconOn = document.getElementById('sound-icon-on');
const soundIconOff = document.getElementById('sound-icon-off');

// ============================================================
// WEB AUDIO SYNTHESIZER
// ============================================================
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
}

function playTransitionSound(planetId) {
  if (!audioEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    let baseFreq = 392.0; // G4 (Earth)
    if (planetId === 'mars') baseFreq = 329.63; // E4 (Mars)
    if (planetId === 'venus') baseFreq = 440.0; // A4 (Venus)

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.6);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 0.5, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.75, now + 0.7);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(350, now + 0.8);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.9);
    osc2.stop(now + 0.9);
  } catch (e) {}
}

function playClickSound() {
  if (!audioEnabled || !audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(350, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {}
}

// ============================================================
// MAIN THREE.JS HERO SCENE
// ============================================================
const canvas = document.getElementById('webgl-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 18);

// Lighting
const ambientLight = new THREE.AmbientLight(0x0e1628, 0.4);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-6, 12, 10);
scene.add(sunLight);

const rimLight = new THREE.DirectionalLight(0x1e293b, 0.45);
rimLight.position.set(8, -6, -4);
scene.add(rimLight);

// ============================================================
// TEXTURES
// ============================================================
const textureLoader = new THREE.TextureLoader();

function loadTex(url) {
  const t = textureLoader.load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const textures = {
  earth: loadTex('assets/textures/earth.jpg'),
  earthClouds: loadTex('assets/textures/earth_clouds.png'),
  earthSpecular: loadTex('assets/textures/earth_specular.jpg'),
  mars: loadTex('assets/textures/mars.jpg'),
  venus: loadTex('assets/textures/venus.jpg'),
  stars: loadTex('assets/textures/stars.jpg')
};

// ============================================================
// BACKGROUND STARFIELD
// ============================================================
function createStarfield() {
  const starCount = 3000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const colors = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);

  const starPalette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xa5f3fc), // ice cyan
    new THREE.Color(0x93c5fd), // soft blue
    new THREE.Color(0xfef08a), // warm gold
    new THREE.Color(0xe0e7ff)  // faint lavender
  ];

  for (let i = 0; i < starCount; i++) {
    const radius = THREE.MathUtils.randFloat(80, 180);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = THREE.MathUtils.randFloat(0, Math.PI);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const c = starPalette[Math.floor(Math.random() * starPalette.length)];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    sizes[i] = THREE.MathUtils.randFloat(1.0, 2.5);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vTwinkle;
      uniform float uTime;
      
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vTwinkle = 0.7 + 0.3 * sin(uTime * 1.8 + position.x * 0.12 + position.y * 0.08);
        gl_PointSize = size * (220.0 / -mvPosition.z) * vTwinkle;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vTwinkle;
      
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, dist) * vTwinkle;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const starPoints = new THREE.Points(geometry, starMaterial);
  scene.add(starPoints);
  return { starPoints, starMaterial };
}

const starfield = createStarfield();

// ============================================================
// MAIN PLANET GEOMETRY & SYSTEM
// ============================================================
const planetRadius = 21.0;
const planetCenterY = -21.26;
const planetCenterZ = 0;

const planetGroup = new THREE.Group();
planetGroup.position.set(0, planetCenterY, planetCenterZ);
scene.add(planetGroup);

const sphereGeo = new THREE.SphereGeometry(planetRadius, 110, 110);

// Initialize DOM for active planet
const startPlanet = PLANETS[currentPlanetId];
heroTitle.textContent = startPlanet.name;
heroDesc.textContent = startPlanet.description;
leftLabel.textContent = PLANETS[startPlanet.leftId].name;
rightLabel.textContent = PLANETS[startPlanet.rightId].name;
ambientGlow.style.background = `radial-gradient(circle at 50% 65%, ${startPlanet.ambientColor} 0%, rgba(1, 4, 10, 0) 70%)`;

// Active Mesh A
const materialA = new THREE.MeshStandardMaterial({
  map: textures[startPlanet.textureKey],
  roughnessMap: startPlanet.specularKey ? textures[startPlanet.specularKey] : null,
  roughness: startPlanet.roughness,
  metalness: startPlanet.metalness,
  transparent: true,
  opacity: 1.0
});
const meshA = new THREE.Mesh(sphereGeo, materialA);
planetGroup.add(meshA);

// Inactive Mesh B
const materialB = new THREE.MeshStandardMaterial({
  map: textures.mars,
  roughness: 0.85,
  metalness: 0.02,
  transparent: true,
  opacity: 0.0
});
const meshB = new THREE.Mesh(sphereGeo, materialB);
planetGroup.add(meshB);

let activeMesh = meshA;
let inactiveMesh = meshB;

// Set initial rotation
meshA.rotation.x = startPlanet.initialRotation.x;
meshA.rotation.y = startPlanet.initialRotation.y;

// Cloud Sphere (Earth)
const cloudGeo = new THREE.SphereGeometry(planetRadius * 1.006, 110, 110);
const cloudMaterial = new THREE.MeshStandardMaterial({
  map: textures.earthClouds,
  transparent: true,
  opacity: startPlanet.hasClouds ? 0.55 : 0.0,
  blending: THREE.NormalBlending,
  depthWrite: false
});
const cloudMesh = new THREE.Mesh(cloudGeo, cloudMaterial);
cloudMesh.rotation.x = startPlanet.initialRotation.x;
cloudMesh.rotation.y = startPlanet.initialRotation.y + 0.12;
planetGroup.add(cloudMesh);

// ============================================================
// ATMOSPHERIC FRESNEL RIM GLOW SHADER
// ============================================================
// Wraps snugly against the planet surface with zero visible gap
const atmosphereGeo = new THREE.SphereGeometry(planetRadius * 1.003, 110, 110);

const atmosphereMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uColor: { value: startPlanet.glowColor.clone() },
    uPower: { value: 5.4 },
    uIntensity: { value: 2.8 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vPosition = mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uPower;
    uniform float uIntensity;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vec3 viewDir = normalize(-vPosition);
      float NdotV = dot(vNormal, viewDir);
      float rim = 1.0 - max(0.0, NdotV);
      
      float intensity = pow(rim, uPower) * uIntensity;
      intensity *= smoothstep(0.46, 0.98, rim);
      
      // Upper sunlight orientation bias
      float sunGlow = smoothstep(-0.25, 0.75, vNormal.y * 0.75 - vNormal.x * 0.4);
      float alpha = intensity * (0.35 + 0.65 * sunGlow);
      
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
  blending: THREE.AdditiveBlending,
  transparent: true,
  depthWrite: false,
  side: THREE.FrontSide
});

const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMaterial);
planetGroup.add(atmosphereMesh);

// Expose transition function globally for interactions and testing
window.transitionToPlanet = transitionToPlanet;

// ============================================================
// MINI 3D PREVIEW CANVASES (Side Selectors)
// ============================================================
class MiniPlanetViewer {
  constructor(canvasId, isLeft) {
    this.canvas = document.getElementById(canvasId);
    this.isLeft = isLeft;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(160, 160, false);
    this.canvas.style.width = '110px';
    this.canvas.style.height = '110px';
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    this.camera.position.set(0, 0, 3.8);

    // Directional light shines INWARDS towards the screen center
    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    if (isLeft) {
      dirLight.position.set(3.5, 2.5, 3.0);
    } else {
      dirLight.position.set(-3.5, 2.5, 3.0);
    }
    this.scene.add(dirLight);

    const ambLight = new THREE.AmbientLight(0x0a1220, 0.35);
    this.scene.add(ambLight);

    const geo = new THREE.SphereGeometry(1.22, 54, 54);
    this.material = new THREE.MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0.05
    });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.scene.add(this.mesh);

    // Mini atmosphere rim
    const atmGeo = new THREE.SphereGeometry(1.24, 54, 54);
    this.atmMtl = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x38bdf8) }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec3 vNormal;
        void main() {
          float rim = 1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
          rim = pow(rim, 3.5) * 1.6;
          gl_FragColor = vec4(uColor, rim);
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    this.atmMesh = new THREE.Mesh(atmGeo, this.atmMtl);
    this.scene.add(this.atmMesh);

    this.rotationSpeed = isLeft ? 0.005 : 0.005;
  }

  setPlanet(planetId) {
    const data = PLANETS[planetId];
    this.material.map = textures[data.textureKey];
    if (planetId === 'earth') {
      this.material.roughnessMap = textures.earthSpecular;
    } else {
      this.material.roughnessMap = null;
    }
    this.material.roughness = data.roughness;
    this.material.needsUpdate = true;
    this.atmMtl.uniforms.uColor.value.copy(data.glowColor);
    this.mesh.rotation.x = data.initialRotation.x;
  }

  render() {
    this.mesh.rotation.y += this.rotationSpeed;
    this.renderer.render(this.scene, this.camera);
  }
}

const leftMiniViewer = new MiniPlanetViewer('left-mini-canvas', true);
const rightMiniViewer = new MiniPlanetViewer('right-mini-canvas', false);

leftMiniViewer.setPlanet(startPlanet.leftId);
rightMiniViewer.setPlanet(startPlanet.rightId);

// ============================================================
// TRANSITION ORCHESTRATION
// ============================================================
let spinBoost = 0;
let targetGlowColor = startPlanet.glowColor.clone();
let currentGlowColor = startPlanet.glowColor.clone();

function transitionToPlanet(targetId) {
  if (targetId === currentPlanetId || isTransitioning) return;
  isTransitioning = true;
  initAudio();
  playTransitionSound(targetId);

  const prevPlanet = PLANETS[currentPlanetId];
  const nextPlanet = PLANETS[targetId];
  currentPlanetId = targetId;

  // Update browser URL query string without reloading
  try {
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('planet', targetId);
    window.history.pushState({}, '', newUrl);
  } catch (e) {}

  // 1. Hero text animation out
  heroTitle.classList.add('transitioning-out');
  heroDesc.classList.add('transitioning-out');

  // 2. Setup Mesh B with new texture
  inactiveMesh.material.map = textures[nextPlanet.textureKey];
  if (targetId === 'earth') {
    inactiveMesh.material.roughnessMap = textures.earthSpecular;
  } else {
    inactiveMesh.material.roughnessMap = null;
  }
  inactiveMesh.material.roughness = nextPlanet.roughness;
  inactiveMesh.material.needsUpdate = true;

  inactiveMesh.rotation.x = nextPlanet.initialRotation.x;
  inactiveMesh.rotation.y = nextPlanet.initialRotation.y - 0.35;
  inactiveMesh.material.opacity = 0;

  // Atmosphere target color
  targetGlowColor.copy(nextPlanet.glowColor);

  // Background radial backlight
  ambientGlow.style.background = `radial-gradient(circle at 50% 65%, ${nextPlanet.ambientColor} 0%, rgba(1, 4, 10, 0) 70%)`;

  // Acceleration spin kick
  spinBoost = 0.038;

  // Crossfade animation
  const startTime = performance.now();
  const duration = 750;

  function animateCrossfade(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1.0);
    const ease = progress < 0.5 
      ? 4 * progress * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    activeMesh.material.opacity = 1.0 - ease;
    inactiveMesh.material.opacity = ease;

    if (nextPlanet.hasClouds) {
      cloudMaterial.opacity = 0.55 * ease;
    } else if (prevPlanet.hasClouds) {
      cloudMaterial.opacity = 0.55 * (1.0 - ease);
    }

    if (progress < 1.0) {
      requestAnimationFrame(animateCrossfade);
    } else {
      const temp = activeMesh;
      activeMesh = inactiveMesh;
      inactiveMesh = temp;
      inactiveMesh.material.opacity = 0;
      isTransitioning = false;
    }
  }

  requestAnimationFrame(animateCrossfade);

  // Update text & side selectors halfway
  setTimeout(() => {
    heroTitle.textContent = nextPlanet.name;
    heroDesc.textContent = nextPlanet.description;

    heroTitle.classList.remove('transitioning-out');
    heroTitle.classList.add('transitioning-in');
    heroDesc.classList.remove('transitioning-out');

    void heroTitle.offsetWidth;
    heroTitle.classList.remove('transitioning-in');

    leftLabel.textContent = PLANETS[nextPlanet.leftId].name;
    rightLabel.textContent = PLANETS[nextPlanet.rightId].name;

    leftMiniViewer.setPlanet(nextPlanet.leftId);
    rightMiniViewer.setPlanet(nextPlanet.rightId);
  }, 260);
}

// ============================================================
// EVENT LISTENERS
// ============================================================

leftSelector.addEventListener('click', () => {
  transitionToPlanet(PLANETS[currentPlanetId].leftId);
});

rightSelector.addEventListener('click', () => {
  transitionToPlanet(PLANETS[currentPlanetId].rightId);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    transitionToPlanet(PLANETS[currentPlanetId].leftId);
  } else if (e.key === 'ArrowRight') {
    transitionToPlanet(PLANETS[currentPlanetId].rightId);
  }
});

let touchStartX = 0;
window.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) {
      transitionToPlanet(PLANETS[currentPlanetId].leftId);
    } else {
      transitionToPlanet(PLANETS[currentPlanetId].rightId);
    }
  }
}, { passive: true });

let mouseX = 0;
let mouseY = 0;
let targetCameraX = 0;
let targetCameraY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  targetCameraX = mouseX * 0.45;
  targetCameraY = mouseY * 0.25;
});

backBtn.addEventListener('click', () => {
  initAudio();
  playClickSound();
  transitionToPlanet(PLANETS[currentPlanetId].leftId);
});

ctaBtn.addEventListener('click', () => {
  initAudio();
  playClickSound();
  ctaBtn.style.transform = 'scale(0.96)';
  setTimeout(() => {
    ctaBtn.style.transform = '';
  }, 150);
});

enrollBtn.addEventListener('click', () => {
  initAudio();
  playClickSound();
});

downBtn.addEventListener('click', () => {
  initAudio();
  playClickSound();
  transitionToPlanet(PLANETS[currentPlanetId].rightId);
});

audioToggle.addEventListener('click', () => {
  initAudio();
  audioEnabled = !audioEnabled;
  if (audioEnabled) {
    soundIconOn.classList.remove('hidden');
    soundIconOff.classList.add('hidden');
    playClickSound();
  } else {
    soundIconOn.classList.add('hidden');
    soundIconOff.classList.remove('hidden');
  }
});

window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ============================================================
// ANIMATION LOOP
// ============================================================
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  // Twinkling stars
  starfield.starMaterial.uniforms.uTime.value = elapsedTime;
  starfield.starPoints.rotation.y += 0.0001;

  // Mouse parallax
  camera.position.x += (targetCameraX - camera.position.x) * 0.05;
  camera.position.y += (targetCameraY - camera.position.y) * 0.05;

  // Axial rotation
  const curData = PLANETS[currentPlanetId];
  activeMesh.rotation.y += curData.rotationSpeed + spinBoost;

  if (cloudMesh.visible && curData.hasClouds) {
    cloudMesh.rotation.y += curData.rotationSpeed * 1.35 + spinBoost;
  }

  spinBoost *= 0.94;
  if (Math.abs(spinBoost) < 0.00001) spinBoost = 0;

  // Atmosphere glow color transition
  currentGlowColor.lerp(targetGlowColor, 0.06);
  atmosphereMaterial.uniforms.uColor.value.copy(currentGlowColor);

  // Render main scene
  renderer.render(scene, camera);

  // Render side previews
  leftMiniViewer.render();
  rightMiniViewer.render();
}

animate();
