const overlay = document.getElementById('load-overlay');

async function boot() {
  if (!window.actx) await loadAudio();
  playAudio();
  overlay.classList.add('fade-out');
  setTimeout(() => overlay.style.display = 'none', 600);
}

overlay.addEventListener('click', boot);
overlay.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    boot();
  }
});
overlay.setAttribute('tabindex', '0');
