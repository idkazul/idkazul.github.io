function resizeCursor(url, size = 32) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0, size, size);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

(async function cursors() {
  const d = 'images/cursor.png';
  const p = 'images/pointer.png';

  const [cur, poi] = await Promise.all([
    resizeCursor(d, 32),
    resizeCursor(p, 32)
  ]);

  document.body.style.cursor = `url('${cur}') 4 4, auto`;

  const el = document.querySelectorAll('a, button, [role="button"], .social-links a, #load-overlay, .music-btn, .volume-slider');
  el.forEach(e => { e.style.cursor = `url('${poi}') 4 4, pointer`; });

  const obs = new MutationObserver(() => {
    document.querySelectorAll('a, button, [role="button"]:not([style*="cursor"])').forEach(e => {
      e.style.cursor = `url('${poi}') 4 4, pointer`;
    });
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();
