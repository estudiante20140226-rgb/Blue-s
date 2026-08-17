const wc   = document.getElementById('waveCanvas');
const wctx = wc.getContext('2d');
let W, H;

function resizeWaveCanvas() { 
  W = wc.width = window.innerWidth; 
  H = wc.height = window.innerHeight; 
}

resizeWaveCanvas();
window.addEventListener('resize', resizeWaveCanvas);

let waveTime = 0;
function drawWaves() {
  wctx.clearRect(0, 0, W, H);
  const waves = [
    { amp:40, freq:0.01,  speed:0.5,  y:H*0.44, a:0.05 },
    { amp:20, freq:0.018, speed:0.85, y:H*0.50, a:0.09 },
    { amp:55, freq:0.007, speed:0.35, y:H*0.55, a:0.04 },
    { amp:16, freq:0.022, speed:1.1,  y:H*0.47, a:0.07 },
  ];
  
  waves.forEach(w => {
    wctx.beginPath();
    wctx.strokeStyle = `rgba(61,84,160,${w.a})`;
    wctx.lineWidth = 1.2;
    for (let x=0; x<=W; x+=2) {
      const y = w.y + Math.sin(x*w.freq + waveTime*w.speed)*w.amp;
      x===0 ? wctx.moveTo(x,y) : wctx.lineTo(x,y);
    }
    wctx.stroke();
  });
  
  const bars = 55;
  const bw = W / bars;
  for (let i=0; i<bars; i++) {
    const bh = (Math.sin(i*0.38 + waveTime*1.1)*0.5+0.5)*70+8;
    const a  = 0.03 + (bh/78)*0.045;
    wctx.fillStyle = `rgba(61,84,160,${a})`;
    wctx.fillRect(i*bw+2, H*0.5-bh/2, bw-4, bh);
  }
  
  waveTime += 0.013;
  requestAnimationFrame(drawWaves);
}
drawWaves();

// Cambia esto si tu backend corre en otra URL (ej. cuando lo subas a producción)
const API_BASE_URL = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', () => {

  // Sin canciones de ejemplo: la playlist se arma únicamente
  // con lo que haya en #custom-tracks-source
  const defaultTracks = [];

  // === LEER PISTAS ESTÁTICAS AGREGADAS DESDE EL HTML ===
  function readCustomTracks() {
    const source = document.getElementById('custom-tracks-source');
    if (!source) return [];

    return Array.from(source.querySelectorAll('.custom-track')).map(el => {
      return {
        title: el.dataset.title || 'Sin título',
        artist: el.dataset.artist || 'Desconocido',
        album: el.dataset.album || '',
        art: el.dataset.art || '??',
        spotify: el.dataset.spotify || ''
      };
    });
  }

  // Saca el ID de la canción desde el link de embed
  // ej: https://open.spotify.com/embed/track/1NHWG8zxSEypSRF3UufrnO -> 1NHWG8zxSEypSRF3UufrnO
  function extractTrackId(spotifyUrl) {
    if (!spotifyUrl) return null;
    const match = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  // Convierte milisegundos a formato m:ss
  function formatDuration(ms) {
    if (!ms) return '';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  const customTracks = readCustomTracks();
  const playlist = [...defaultTracks, ...customTracks];
  let currentIndex = -1;

  // === ELEMENTOS DEL DOM ===
  const listContainer = document.getElementById('track-list');
  const spotifyFrame = document.getElementById('spotify-frame');

  // === RENDERIZAR TABLA DE CANCIONES ===
  function renderPlaylist() {
    listContainer.innerHTML = '';

    playlist.forEach((track, index) => {
      const row = document.createElement('div');
      row.classList.add('track-row');
      row.setAttribute('data-index', index);

      const artContent = track.artUrl
        ? `<img src="${track.artUrl}" alt="${track.title}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">`
        : (track.art || '??');

      row.innerHTML = `
        <div class="track-index">${index + 1}</div>
        <div class="track-meta">
          <div class="track-art">${artContent}</div>
          <div class="track-titles">
            <div class="track-title">${track.title}</div>
            <div class="track-artist">${track.artist}</div>
          </div>
        </div>
        <div class="track-album">${track.album}</div>
        <div class="track-duration" id="dur-${index}">${track.duration || ''}</div>
      `;

      row.addEventListener('click', () => loadTrack(index));

      listContainer.appendChild(row);
    });
    highlightActiveRow();
  }

  // === TRAER DATOS REALES DESDE EL BACKEND ===
  async function fetchRealTrackInfo() {
    const idsToFetch = playlist
      .map(t => extractTrackId(t.spotify))
      .filter(Boolean);

    if (idsToFetch.length === 0) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/track-info?ids=${idsToFetch.join(',')}`);
      if (!response.ok) throw new Error('Respuesta no OK del backend');

      const data = await response.json();
      const infoById = {};
      data.tracks.forEach(t => {
        if (t) infoById[t.id] = t;
      });

      playlist.forEach(track => {
        const id = extractTrackId(track.spotify);
        const info = infoById[id];
        if (info) {
          track.title = info.title;
          track.artist = info.artist;
          track.album = info.album;
          track.artUrl = info.art;
          track.duration = formatDuration(info.duration_ms);
        }
      });

      renderPlaylist();
    } catch (err) {
      console.warn('No se pudo conectar con el backend de Spotify. ¿Está corriendo node server.js?', err);
      // Si falla, la playlist se queda con los datos que ya tenía en el HTML
    }
  }

  // === CARGAR PISTA EN EL IFRAME DE SPOTIFY ===
  function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    currentIndex = index;
    const track = playlist[index];

    if (track.spotify) {
      spotifyFrame.src = track.spotify;
    }

    highlightActiveRow();
  }

  function highlightActiveRow() {
    document.querySelectorAll('.track-row').forEach(row => {
      const idx = parseInt(row.getAttribute('data-index'), 10);
      row.classList.toggle('playing', idx === currentIndex);
    });
  }

  // Carga inicial (con los datos que ya vienen en el HTML)
  renderPlaylist();

  // Y luego actualizamos con la info real de Spotify
  fetchRealTrackInfo();
});
