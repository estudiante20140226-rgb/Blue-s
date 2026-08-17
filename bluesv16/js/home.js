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
  
  // Barras de espectro simuladas en tiempo real en la mitad de la pantalla
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

//  ——— MÓDULO 3: CANVAS DE PARTÍCULAS (NOTAS MUSICALES) ———
// const pc   = document.getElementById('partCanvas');
// const pctx = pc.getContext('2d');
// 
// function resizePartCanvas() { 
//   pc.width = window.innerWidth; 
//   pc.height = window.innerHeight; 
// }
// resizePartCanvas();
// window.addEventListener('resize', resizePartCanvas);
// 
// const NOTES = ['♩','♪','♫','♬','𝄞'];
// class Particle {
//   constructor() { this.reset(true); }
//   reset(init=false) {
//     this.x = Math.random() * pc.width;
//     this.y = init ? Math.random()*pc.height : pc.height + 20;
//     this.size  = 10 + Math.random()*13;
//     this.vy    = 0.25 + Math.random()*0.7;
//     this.vx    = (Math.random()-0.5)*0.5;
//     this.maxOp = 0.1 + Math.random()*0.14;
//     this.char  = NOTES[Math.floor(Math.random()*NOTES.length)];
//     this.life  = 0;
//     this.maxL  = 220 + Math.random()*280;
//   }
//   update() {
//     this.y -= this.vy;
//     this.x += this.vx + Math.sin(this.life*0.018)*0.3;
//     this.life++;
//     this.op = this.life < 50
//       ? (this.life/50)*this.maxOp
//       : this.life > this.maxL-50
//         ? ((this.maxL-this.life)/50)*this.maxOp
//         : this.maxOp;
//     if (this.life >= this.maxL) this.reset();
//   }
//   draw() {
//     pctx.save();
//     pctx.globalAlpha = this.op;
//     pctx.fillStyle = '#3d54a0';
//     pctx.font = `${this.size}px serif`;
//     pctx.fillText(this.char, this.x, this.y);
//     pctx.restore();
//   }
// }
// 
// const particles = [];
// for (let i=0; i<45; i++) particles.push(new Particle());
// 
// function animPart() {
//   pctx.clearRect(0,0,pc.width,pc.height);
//   particles.forEach(p=>{ p.update(); p.draw(); });
//   requestAnimationFrame(animPart);
// }
// animPart();

function initCarousel() {

    const slides = Array.from(document.querySelectorAll('.carrusel-slide'));
    const dots = Array.from(document.querySelectorAll('.dot'));
    const prevBtn = document.querySelector('.carrusel-btn.prev');
    const nextBtn = document.querySelector('.carrusel-btn.next');
    if (slides.length === 0) return;

    let current = 0;

    function show(index) {
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;
        slides.forEach((s, i) => { s.style.display = i === index ? 'block' : 'none'; });
        dots.forEach((d, i) => { d.classList.toggle('active', i === index); });
        current = index;
    }

    prevBtn && prevBtn.addEventListener('click', () => show(current - 1));
    nextBtn && nextBtn.addEventListener('click', () => show(current + 1));

    dots.forEach(d => d.addEventListener('click', (e) => {
        const idx = Number(e.currentTarget.getAttribute('data-index'));
        if (!Number.isNaN(idx)) show(idx);
    }));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
    });

    show(0);
}

document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
});


(function () {
  const TEAM_USER = 'equipo';
  const TEAM_PASS = 'blues2026';
  const STORAGE_KEY = 'bluesContactMessages';

  const form = document.getElementById('contactForm');
  const toggleBtn = document.getElementById('teamToggleBtn');
  const loginBox = document.getElementById('teamLoginBox');
  const adminPanel = document.getElementById('adminPanel');

  if (!form || !toggleBtn || !loginBox || !adminPanel) return;

  function getMessages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveMessages(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function renderMessages() {
    const list = getMessages();
    const container = document.getElementById('messagesList');

    if (!list.length) {
      container.innerHTML = '<p class="message-empty">Aún no hay mensajes recibidos.</p>';
      return;
    }

    container.innerHTML = list.map((m) => `
      <div class="message-card" data-id="${m.id}">
        <div class="message-meta">${m.fecha}</div>
        <div class="message-name">${m.nombre} — ${m.asunto}</div>
        <div class="message-body">${m.mensaje}</div>
        <div class="message-actions">
          <button type="button" class="button-ghost button-edit">Editar</button>
          <button type="button" class="button-danger button-delete">Eliminar</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.button-delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.message-card');
        const id = Number(card.dataset.id);
        saveMessages(getMessages().filter((m) => m.id !== id));
        renderMessages();
      });
    });

    container.querySelectorAll('.button-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.message-card');
        const id = Number(card.dataset.id);
        const m = getMessages().find((x) => x.id === id);
        if (!m) return;

        card.innerHTML = `
          <input class="message-field" value="${m.nombre}" data-field="nombre">
          <input class="message-field" value="${m.asunto}" data-field="asunto">
          <textarea class="message-field" rows="3" data-field="mensaje">${m.mensaje}</textarea>
          <div class="message-actions">
            <button type="button" class="button-indigo button-save">Guardar</button>
            <button type="button" class="button-ghost button-cancel">Cancelar</button>
          </div>
        `;

        card.querySelector('.button-save').addEventListener('click', () => {
          const list = getMessages();
          const idx = list.findIndex((x) => x.id === id);
          if (idx > -1) {
            card.querySelectorAll('.message-field').forEach((field) => {
              list[idx][field.dataset.field] = field.value.trim();
            });
            saveMessages(list);
          }
          renderMessages();
        });

        card.querySelector('.button-cancel').addEventListener('click', renderMessages);
      });
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const list = getMessages();
    list.unshift({
      id: Date.now(),
      nombre: document.getElementById('cNombre').value.trim(),
      asunto: document.getElementById('cAsunto').value.trim(),
      mensaje: document.getElementById('cMensaje').value.trim(),
      fecha: new Date().toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' })
    });

    saveMessages(list);
    form.reset();
    const msg = document.getElementById('formMsg');
    msg.textContent = '✓ Mensaje enviado. ¡Gracias por escribirnos!';
    setTimeout(() => (msg.textContent = ''), 4000);

    if (adminPanel.style.display === 'block') renderMessages();
  });

  toggleBtn.addEventListener('click', () => {
    loginBox.style.display = loginBox.style.display === 'none' ? 'flex' : 'none';
  });

  document.getElementById('loginBtn').addEventListener('click', () => {
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const errorEl = document.getElementById('loginError');

    if (user === TEAM_USER && pass === TEAM_PASS) {
      errorEl.textContent = '';
      adminPanel.style.display = 'block';
      loginBox.style.display = 'none';
      document.getElementById('loginUser').value = '';
      document.getElementById('loginPass').value = '';
      renderMessages();
      setTimeout(() => adminPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } else {
      errorEl.textContent = 'Usuario o contraseña incorrectos.';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    adminPanel.style.display = 'none';
  });
})();