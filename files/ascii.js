const vertex = `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uEnableWaves;
  void main() {
    vUv = uv;
    float time = uTime * 5.;
    float waveFactor = uEnableWaves;
    vec3 transformed = position;
    transformed.x += sin(time + position.y) * 0.5 * waveFactor;
    transformed.y += cos(time + position.z) * 0.15 * waveFactor;
    transformed.z += sin(time + position.x) * waveFactor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragment = `
  varying vec2 vUv;
  uniform float mouse;
  uniform float uTime;
  uniform sampler2D uTexture;
  void main() {
    float time = uTime;
    vec2 pos = vUv;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
  }
`;

Math.map = function (n, s, e, s2, e2) {
  return ((n - s) / (e - s)) * (e2 - s2) + s2;
};

const R = window.devicePixelRatio || 1;

class F {
  constructor(renderer, { fontSize = 5, fontFamily = "'IBM Plex Mono', monospace", charset, invert = true } = {}) {
    this.renderer = renderer;
    this.dom = document.createElement('div');
    this.dom.className = 'ascii-text-container';
    this.dom.style.position = 'absolute';
    this.dom.style.top = '0';
    this.dom.style.left = '0';
    this.dom.style.width = '100%';
    this.dom.style.height = '100%';

    this.pre = document.createElement('pre');
    this.dom.appendChild(this.pre);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.dom.appendChild(this.canvas);

    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;

    this.deg = 0;
    this.invert = invert;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.charset = charset ?? ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

    this.move = this.move.bind(this);
    document.addEventListener('mousemove', this.move, { passive: true });
  }

  setSize(w, h) {
    this.w = w;
    this.h = h;
    this.renderer.setSize(w, h);
    this.reset();
    this.center = { x: w / 2, y: h / 2 };
    this.mouse = { x: this.center.x, y: this.center.y };
  }

  reset() {
    this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    const cw = this.ctx.measureText('A').width;
    this.cols = Math.floor(this.w / cw);
    this.rows = Math.floor(this.h / this.fontSize);
    this.canvas.width = this.cols;
    this.canvas.height = this.rows;
    this.pre.style.fontFamily = this.fontFamily;
    this.pre.style.fontSize = `${this.fontSize}px`;
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);
    if (this.ctx && w && h) {
      this.ctx.drawImage(this.renderer.domElement, 0, 0, w, h);
    }
    this.asciify(this.ctx, w, h);
    this.hue();
  }

  move(e) {
    this.mouse = { x: e.clientX * R, y: e.clientY * R };
  }

  get dx() { return this.mouse.x - this.center.x; }
  get dy() { return this.mouse.y - this.center.y; }

  hue() {
    const deg = (Math.atan2(this.dy, this.dx) * 180) / Math.PI;
    this.deg += (deg - this.deg) * 0.075;
    this.dom.style.filter = `hue-rotate(${this.deg.toFixed(1)}deg)`;
  }

  asciify(ctx, w, h) {
    if (w && h) {
      const data = ctx.getImageData(0, 0, w, h).data;
      let str = '';
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = x * 4 + y * 4 * w;
          const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
          if (a === 0) { str += ' '; continue; }
          let gray = (0.3 * r + 0.6 * g + 0.1 * b) / 255;
          let idx = Math.floor((1 - gray) * (this.charset.length - 1));
          if (this.invert) idx = this.charset.length - idx - 1;
          str += this.charset[idx];
        }
        str += '\n';
      }
      this.pre.innerHTML = str;
    }
  }
}

class T {
  constructor(txt, { fontSize = 200, fontFamily = 'IBM Plex Mono', color = '#fdf9f3' } = {}) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.txt = txt;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.color = color;
    this.font = `600 ${this.fontSize}px ${this.fontFamily}`;
  }

  resize() {
    this.ctx.font = this.font;
    const m = this.ctx.measureText(this.txt);
    this.canvas.width = Math.ceil(m.width) + 20;
    this.canvas.height = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + 20;
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = this.color;
    this.ctx.font = this.font;
    const m = this.ctx.measureText(this.txt);
    this.ctx.fillText(this.txt, 10, 10 + m.actualBoundingBoxAscent);
  }
}

class C {
  constructor({ text, asciiFontSize, textFontSize, textColor, planeBaseHeight, enableWaves }, container) {
    this.text = text;
    this.asciiFontSize = asciiFontSize;
    this.textFontSize = textFontSize;
    this.textColor = textColor;
    this.planeBaseHeight = planeBaseHeight;
    this.container = container;
    this.w = container.clientWidth;
    this.h = container.clientHeight;
    this.enableWaves = enableWaves;

    this.cam = new THREE.PerspectiveCamera(45, this.w / this.h, 1, 1000);
    this.cam.position.z = 30;
    this.scene = new THREE.Scene();
    this.mouse = { x: this.w / 2, y: this.h / 2 };

    this.move = this.move.bind(this);
  }

  async init() {
    try {
      await document.fonts.load(`600 ${this.textFontSize}px "IBM Plex Mono"`);
      await document.fonts.load(`400 ${this.asciiFontSize}px "IBM Plex Mono"`);
    } catch (e) {}

    this.tex = new T(this.text, {
      fontSize: this.textFontSize,
      color: this.textColor
    });
    this.tex.resize();
    this.tex.render();

    const tex = new THREE.CanvasTexture(this.tex.canvas);
    tex.minFilter = THREE.NearestFilter;

    const aspect = this.tex.canvas.width / this.tex.canvas.height;
    const baseH = this.planeBaseHeight;
    const pw = baseH * aspect;
    const ph = baseH;

    this.geo = new THREE.PlaneGeometry(pw, ph, 36, 36);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        mouse: { value: 1.0 },
        uTexture: { value: tex },
        uEnableWaves: { value: this.enableWaves ? 1.0 : 0.0 }
      }
    });

    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1);

    this.filter = new F(this.renderer, { fontSize: this.asciiFontSize });
    this.container.appendChild(this.filter.dom);

    this.filter.setSize(this.w, this.h);
    document.addEventListener('mousemove', this.move, { passive: true });

    this.loop();
  }

  move(e) {
    const b = this.container.getBoundingClientRect();
    this.mouse = { x: e.clientX - b.left, y: e.clientY - b.top };
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    if (document.hidden) return;

    const t = new Date().getTime() * 0.001;
    this.mesh.material.uniforms.uTime.value = Math.sin(t);

    const x = Math.min(0.5, Math.max(-0.5, Math.map(this.mouse.y, 0, this.h, -0.5, 0.5)));
    const y = Math.min(0.5, Math.max(-0.5, Math.map(this.mouse.x, 0, this.w, 0.5, -0.5)));
    this.mesh.rotation.x += (x - this.mesh.rotation.x) * 0.05;
    this.mesh.rotation.y += (y - this.mesh.rotation.y) * 0.05;

    this.filter.render(this.scene, this.cam);
  }
}

window.addEventListener('load', () => {
  const el = document.getElementById('ascii-container');
  if (el) {
    const ascii = new C({
      text: 'azul',
      asciiFontSize: 5,
      textFontSize: 200,
      textColor: '#ffffff',
      planeBaseHeight: 8.5,
      enableWaves: true
    }, el);
    ascii.init();
  }
});
