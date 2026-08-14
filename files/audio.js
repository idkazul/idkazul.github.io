let actx, gain, src, buf;
let playing = false;

const toggle = document.getElementById('music-toggle');
const slider = document.getElementById('volume-slider');

async function loadAudio() {
  const res = await fetch('audio.mp3');
  const data = await res.arrayBuffer();
  actx = new (window.AudioContext || window.webkitAudioContext)();
  buf = await actx.decodeAudioData(data);
  gain = actx.createGain();
  gain.gain.value = parseFloat(slider.value);
  gain.connect(actx.destination);
}

function playAudio() {
  if (playing) return;
  if (!actx) return;
  src = actx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  src.detune.value = -300;
  src.connect(gain);
  src.start(0);
  playing = true;
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  `;
}

function toggleAudio() {
  if (!actx) return;
  if (playing) {
    src.stop();
    playing = false;
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
        <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        <line x1="2" y1="2" x2="22" y2="22" />
      </svg>
    `;
  } else {
    src = actx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.detune.value = -300;
    src.connect(gain);
    src.start(0);
    playing = true;
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    `;
  }
}

slider.addEventListener('input', (e) => {
  if (gain) gain.gain.value = parseFloat(e.target.value);
});

toggle.addEventListener('click', toggleAudio);
