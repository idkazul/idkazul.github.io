(function particles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, list = [];
  const n = 50;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }
  window.addEventListener('resize', resize);

  class P {
    constructor(init) {
      this.x = Math.random() * w;
      this.y = init ? Math.random() * h : -Math.random() * 60;
      this.s = Math.random() * 1.8 + 0.6;
      this.sp = Math.random() * 0.2 + 0.05;
      this.o = Math.random() * 0.15 + 0.05;
    }
    update() {
      this.y += this.sp;
      if (this.y > h + 20) {
        this.y = -10;
        this.x = Math.random() * w;
        this.s = Math.random() * 1.8 + 0.6;
        this.o = Math.random() * 0.15 + 0.05;
      }
    }
    draw() {
      ctx.fillStyle = `rgba(255,255,255,${this.o})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    resize();
    list = [];
    for (let i = 0; i < n; i++) list.push(new P(true));
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (const p of list) { p.update(); p.draw(); }
    requestAnimationFrame(animate);
  }

  init();
  animate();
  window.addEventListener('resize', () => { resize(); for (const p of list) { p.x = Math.random() * w; p.y = Math.random() * h; } });
})();
