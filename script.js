/* ─── CURSOR ─── */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
document.addEventListener('mousemove', e => {
  dot.style.left  = e.clientX + 'px';  dot.style.top  = e.clientY + 'px';
  ring.style.left = e.clientX + 'px';  ring.style.top = e.clientY + 'px';
});
document.querySelectorAll('.card').forEach(c => {
  c.addEventListener('mouseenter', () => { ring.style.width = '60px'; ring.style.height = '60px'; });
  c.addEventListener('mouseleave', () => { ring.style.width = '36px'; ring.style.height = '36px'; });
});

/* ─── CURSOR SPARKLE TRAIL ─── */
const trailColors = ['#FFB6D1','#FF8FB8','#E9B8FF','#FFE7A8','#FFC8A8'];
let lastTrailTime = 0;
document.addEventListener('mousemove', e => {
  const now = Date.now();
  if (now - lastTrailTime < 40) return;
  lastTrailTime = now;
  const s = document.createElement('div');
  s.style.cssText = `
    position:fixed;left:${e.clientX}px;top:${e.clientY}px;
    width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:9997;
    background:${trailColors[Math.floor(Math.random()*trailColors.length)]};
    transform:translate(-50%,-50%) scale(1);
    transition:transform .5s ease,opacity .5s ease;
    opacity:1;
  `;
  document.body.appendChild(s);
  requestAnimationFrame(() => { s.style.transform='translate(-50%,-50%) scale(0)'; s.style.opacity='0'; });
  setTimeout(() => s.remove(), 520);
});

/* ─── BG CANVAS: STARS + CONFETTI ─── */
(function() {
  const cv = document.getElementById('bg-canvas');
  const cx = cv.getContext('2d');
  const confColors = ['#FFB6D1','#FF8FB8','#FFD9E6','#F9A8D4','#E9B8FF','#FFC8A8','#fff'];
  let W, H;
  function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  // Stars
  const isMobile = window.innerWidth < 768;
  const numStars = isMobile ? 40 : 160;
  const stars = Array.from({length: numStars}, () => ({
    x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
    r: .4+Math.random()*1.8,
    a: Math.random(), da: .003+Math.random()*.008,
    color: Math.random()>.6 ? '#FFD9E6' : '#FFE7A8'
  }));

  // Confetti
  const shapes = ['petal','petal','petal','flower'];
  class Piece {
    constructor(initial) {
      this.x = Math.random()*W;
      this.y = initial ? Math.random()*H-H : -20;
      this.r = 4+Math.random()*8;
      this.rot = Math.random()*Math.PI*2;
      this.dr = (Math.random()-.5)*.12;
      this.vy = .8+Math.random()*1.8;
      this.vx = (Math.random()-.5)*.8;
      this.color = confColors[Math.floor(Math.random()*confColors.length)];
      this.shape = shapes[Math.floor(Math.random()*shapes.length)];
      this.alpha = .5+Math.random()*.4;
    }
    update() { this.y+=this.vy; this.x+=this.vx; this.rot+=this.dr; if(this.y>H+20) { this.y=-20; this.x=Math.random()*W; } }
    draw(ctx) {
      ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.rot);
      ctx.globalAlpha=this.alpha; ctx.fillStyle=this.color;
      if (this.shape==='petal') {
        const r=this.r*1.4;
        ctx.beginPath();
        ctx.moveTo(0,-r);
        ctx.bezierCurveTo(r*.9,-r*.5, r*.7,r*.7, 0,r);
        ctx.bezierCurveTo(-r*.7,r*.7, -r*.9,-r*.5, 0,-r);
        ctx.fill();
      } else {
        const r=this.r*1.1;
        for (let i=0;i<5;i++) {
          ctx.rotate(Math.PI*2/5);
          ctx.beginPath(); ctx.ellipse(0,-r*.7,r*.45,r*.75,0,0,Math.PI*2); ctx.fill();
        }
        ctx.fillStyle='#FFD76A'; ctx.globalAlpha=Math.min(1,this.alpha+.2);
        ctx.beginPath(); ctx.arc(0,0,r*.28,0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
  }
  const pieces = Array.from({length: isMobile ? 30 : 90}, (_,i) => new Piece(i < (isMobile ? 15 : 45)));

  function loop() {
    cx.clearRect(0,0,W,H);
    // draw stars
    stars.forEach(s => {
      s.a += s.da; if(s.a>1||s.a<0) s.da*=-1;
      cx.beginPath(); cx.arc(s.x,s.y,s.r,0,Math.PI*2);
      cx.fillStyle=s.color; cx.globalAlpha=s.a*.8; cx.fill();
    });
    cx.globalAlpha=1;
    // draw confetti
    pieces.forEach(p => { p.update(); p.draw(cx); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ─── FIREWORKS CANVAS ─── */
(function() {
  const cv = document.getElementById('particle-canvas');
  const cx = cv.getContext('2d');
  let W, H;
  function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  const fw_colors = ['#FF9EC4','#FFB6D1','#E9B8FF','#FFC8A8','#FFE7A8','#F9A8D4','#FF8FB8'];
  let particles = [];

  function burst(x, y) {
    const c = fw_colors[Math.floor(Math.random()*fw_colors.length)];
    for (let i = 0; i < 60; i++) {
      const angle = (Math.PI*2/60)*i;
      const speed = 2+Math.random()*5;
      particles.push({
        x, y,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed - 1,
        life: 1, decay: .012+Math.random()*.018,
        r: 2+Math.random()*3,
        color: Math.random()>.5 ? c : '#fff',
        trail: []
      });
    }
  }

  // Auto-fire bursts
  function randomBurst() {
    burst(Math.random()*W*.8+W*.1, Math.random()*H*.5+50);
    setTimeout(randomBurst, 2500+Math.random()*3000);
  }
  setTimeout(randomBurst, 1200);
  setTimeout(() => randomBurst(), 3500);

  function loop() {
    cx.clearRect(0,0,W,H);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.trail.push({x:p.x, y:p.y, a:p.life});
      if (p.trail.length > 5) p.trail.shift();
      // draw trail
      p.trail.forEach((t,i) => {
        cx.beginPath(); cx.arc(t.x,t.y,p.r*.5,0,Math.PI*2);
        cx.fillStyle=p.color; cx.globalAlpha=t.a*.25*(i/p.trail.length); cx.fill();
      });
      cx.beginPath(); cx.arc(p.x,p.y,p.r,0,Math.PI*2);
      cx.fillStyle=p.color; cx.globalAlpha=p.life; cx.fill();
      p.x+=p.vx; p.y+=p.vy; p.vy+=.06;
      p.vx*=.98; p.vy*=.98;
      p.life-=p.decay;
    });
    cx.globalAlpha=1;
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ─── FLOATING EMOJIS ─── */
(function() {
  const emojis = ['🌸','🌷','🌺','🌹','💐','🌼','🪷','🌻','💖','✨','🦋','🎂','🎀','🌸','🌷'];
  const rain = document.getElementById('emoji-rain');
  function spawn() {
    const el = document.createElement('div');
    el.className = 'floaty';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const dur = 8+Math.random()*10;
    el.style.cssText = `
      left:${Math.random()*95}%;
      bottom:-60px;
      animation-duration:${dur}s;
      animation-delay:${Math.random()*3}s;
      font-size:${1.2+Math.random()*1.4}rem;
    `;
    rain.appendChild(el);
    setTimeout(() => el.remove(), (dur+3)*1000);
  }
  for (let i = 0; i < 12; i++) setTimeout(spawn, i*600);
  setInterval(spawn, 1800);
})();

/* ─── 3D TILT ON CARDS ─── */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    card.style.transform = `perspective(700px) rotateY(${x*14}deg) rotateX(${-y*14}deg) scale(1.04)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) scale(1)';
    card.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1)';
  });
  card.addEventListener('mouseenter', () => { card.style.transition = 'transform .1s ease'; });

  // Sparkle burst on click
  card.addEventListener('click', e => {
    const r = card.getBoundingClientRect();
    const bx = e.clientX - r.left, by = e.clientY - r.top;
    const colors2 = ['#FFD700','#FF6B9D','#00D4AA','#A855F7'];
    for (let i = 0; i < 8; i++) {
      const sp = document.createElement('div');
      const angle = (Math.PI*2/8)*i;
      const dist  = 35+Math.random()*25;
      const tx = Math.cos(angle)*dist, ty = Math.sin(angle)*dist;
      sp.className = 'spark';
      sp.style.cssText = `
        left:${bx}px; top:${by}px; width:10px; height:10px;
        background:${colors2[Math.floor(Math.random()*colors2.length)]};
        border-radius:50%;
        --tx:${tx}px; --ty:${ty}px;
        animation:sparkFly .55s ease forwards;
      `;
      card.appendChild(sp);
      sp.animate([
        {transform:'translate(0,0) scale(1)', opacity:1},
        {transform:`translate(${tx}px,${ty}px) scale(0)`, opacity:0}
      ], {duration:550, easing:'ease-out', fill:'forwards'}).onfinish = () => sp.remove();
    }
  });
});

/* ─── INTERSECTION OBSERVER (scroll reveal) ─── */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { 
    if(en.isIntersecting) {
      if (en.target.classList.contains('new-letter') || en.target.classList.contains('finale-text')) {
        en.target.classList.add('visible');
      } else {
        en.target.style.animationPlayState='running'; 
      }
    }
  });
}, {threshold:.15});
document.querySelectorAll('.card').forEach(c => { c.style.animationPlayState='paused'; io.observe(c); });
document.querySelectorAll('.new-letter, .finale-text').forEach(l => { io.observe(l); });

/* ─── LETTER-BY-LETTER NAME ANIMATION ─── */
const nameLine = document.getElementById('name-line');
const letters = nameLine.textContent.split('');
nameLine.innerHTML = letters.map((l, i) =>
  `<span class="char" style="animation-delay:${1.2 + i*0.12}s">${l}</span>`
).join('');

/* ─── 🌷 LOADING SCREEN ─── */
(function () {
  const loader = document.getElementById('loader');
  if (!loader) return;
  const fill = document.getElementById('loader-fill');
  const pct  = document.getElementById('loader-pct');

  // falling petals inside loader
  const wrap = document.getElementById('loader-petals');
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('span');
    p.className = 'lp';
    const s = 10 + Math.random() * 16;
    p.style.cssText = `left:${Math.random()*100}%;width:${s}px;height:${s}px;` +
      `animation-duration:${6 + Math.random()*6}s;animation-delay:${-Math.random()*8}s;` +
      `--sway:${(Math.random()*120 - 60).toFixed(0)}px;`;
    wrap.appendChild(p);
  }

  // progress: smooth fake climb up to 90%, real window load pushes to 100%
  const MIN_MS = 3200;           // always show the bloom long enough to enjoy it
  const start = performance.now();
  let progress = 0, loaded = false, finished = false;

  Promise.all([new Promise(r => document.readyState === 'complete' ? r() : window.addEventListener('load', r)), document.fonts ? document.fonts.ready : 0]).then(() => { loaded = true; });
  setTimeout(() => { loaded = true; }, 12000);   // safety: never get stuck

  function tick() {
    const elapsed = performance.now() - start;
    const target = loaded ? 100 : Math.min(90, (elapsed / MIN_MS) * 90);
    progress += (target - progress) * 0.06 + 0.15;
    if (progress > target) progress = target;
    const shown = Math.min(100, Math.round(progress));
    fill.style.width = shown + '%';
    pct.textContent = shown + '%';

    if (loaded && shown >= 100 && elapsed >= MIN_MS && !finished) {
      finished = true;
      setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.remove('is-loading');
        setTimeout(() => loader.remove(), 1000);
      }, 350);
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();


/* ─── NEW PHOTO SECTIONS (all 21 photos) ─── */
(function () {
  const src = n => `img/img (${n}).jpg`;
  const thumb = n => `img/thumbs/img (${n}).jpg`;
  const all = Array.from({length: 21}, (_, i) => i + 1);
  const words = ['Radiance','Bliss','Charm','Dream','Wonder','Grace','Glow','Joy','Love','Bloom','Shine','Warmth','Spirit','Euphoria','Serenity','Glee','Aura','Elegance','Sparkle','Honey','Forever'];

  // 2 · Film strip — every photo, looped (two rows rolling opposite ways)
  const row = list => { const f = list.map(n => `<div class="frame"><img src="${thumb(n)}" alt="Madhu – photo ${n}" width="300" height="400" loading="lazy" decoding="async"></div>`).join(''); return f + f; };
  const rev = all.slice().reverse();
  document.getElementById('film-track').innerHTML = row(all);
  document.getElementById('film-track2').innerHTML = row(rev);

  // 3 · Bento mosaic — every photo
  const pat = ['tall','','wide','','tall','','','wide','',''];
  document.getElementById('bento').innerHTML = all.map((n, i) =>
    `<div class="bento-item ${pat[i % pat.length]}"><img src="${src(n)}" srcset="${thumb(n)} 600w, ${src(n)} 1400w" sizes="(max-width:600px) 46vw, 240px" alt="Madhu – ${words[i]}" loading="lazy" decoding="async"><span>${words[i]}</span></div>`).join('');
})();

/* ─── SCROLL REVEAL ─── */
(function () {
  const els = document.querySelectorAll('.card, .bonus-card, .polaroid, .bento-item, .pz-title, .gallery-title, .bonus-gallery-title, .new-letter');
  els.forEach(e => e.classList.add('reveal'));
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }), { threshold: .12 });
  els.forEach(e => io.observe(e));
})();

/* ─── LIGHTBOX ─── */
(function () {
  const lb = document.getElementById('lightbox'), im = lb.querySelector('img');
  const sel = '.card img, .bonus-card img, .polaroid img, .bento-item img, .frame img';
  let list = [], i = 0;
  const show = k => { i = (k + list.length) % list.length; im.src = list[i]; };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
  document.addEventListener('click', e => {
    const t = e.target.closest(sel);
    if (!t) return;
    const full = s => s.replace('/thumbs', '');
    list = [...new Set([...document.querySelectorAll(sel)].map(x => full(x.getAttribute('src'))))];
    show(Math.max(0, list.indexOf(full(t.getAttribute('src')))));
    lb.classList.add('open'); document.body.style.overflow = 'hidden';
  });
  lb.querySelector('.lb-x').onclick = close;
  lb.querySelector('.lb-prev').onclick = () => show(i - 1);
  lb.querySelector('.lb-next').onclick = () => show(i + 1);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
})();


/* ─── ENVELOPE LETTER ─── */
(function () {
  const L = document.getElementById('letter'), seal = document.getElementById('seal');
  if (!L || !seal) return;
  const open = () => {
    if (L.classList.contains('opening')) return;
    L.classList.add('opening');
    setTimeout(() => L.classList.add('opened'), 1000);
  };
  seal.addEventListener('click', open);
  document.getElementById('env').addEventListener('click', open);
})();
