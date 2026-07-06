/* ============================================================
   灵数仙途 · 引擎层
   Store 存档 / Adaptive 自适应教学引擎 / Audio 程序化音频
   Particles 粒子 / FX 打击感
   ============================================================ */

// ---------- 存档 ----------
const Store = (() => {
  const KEY = 'lingshu_save_v1';
  const DEFAULT = () => ({
    created: Date.now(),
    xp: 0, level: 0, stones: 0,
    streakDays: 0, lastPlayDay: '',
    chapters: {},          // zoneId -> [ {stars, best} x6 ]
    facts: {},             // factId -> {box, seen, wrong, streak, avgMs, needRedeem}
    wrongList: {},         // factId -> {zone, text-ish sample, count, lastWrong}
    beasts: [],            // 已收服灵兽 id
    daily: { day: '', done: false, bestMs: 0 },
    settings: { sound: true, music: true, reducedFx: false },
    totals: { answered: 0, correct: 0, battles: 0, bossKills: 0 },
  });
  let data = null;
  function load() {
    try { data = JSON.parse(localStorage.getItem(KEY)) || DEFAULT(); }
    catch (e) { data = DEFAULT(); }
    // 补齐新字段
    const d = DEFAULT();
    for (const k of Object.keys(d)) if (data[k] === undefined) data[k] = d[k];
    return data;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  function get() { return data || load(); }
  function reset() { data = DEFAULT(); save(); }
  return { load, save, get, reset };
})();

// ---------- 自适应教学引擎 ----------
// 85% 法则 + Leitner 盒 + 隐藏气势值
const Adaptive = (() => {
  function factOf(id) {
    const s = Store.get();
    if (!s.facts[id]) s.facts[id] = { box: 0, seen: 0, wrong: 0, streak: 0, avgMs: 0, needRedeem: 0 };
    return s.facts[id];
  }

  // 出题权重：错题权重高、低盒权重高、洗白中的必出
  function weight(id) {
    const f = Store.get().facts[id];
    if (!f) return 1.0;
    let w = 1.0 + (4 - Math.min(f.box, 4)) * 0.5;
    w += Math.min(f.wrong, 5) * 0.8;
    if (f.needRedeem > 0) w += 3.0;
    if (f.box >= 4 && f.streak >= 3) w = 0.25; // 已自动化，少出
    return w;
  }

  // 会话状态：隐藏动态难度（气势 0-100）
  function newSession() {
    return { momentum: 50, recent: [], wrongStreak: 0, comfortNext: false };
  }

  // 生成一题：带拒绝采样（按权重挑“值得练”的题）
  function nextQuestion(zoneId, tier, session) {
    // 连错保护：出一道低一档的舒适题
    let useTier = tier;
    if (session.comfortNext) { useTier = Math.max(0, tier - 1); session.comfortNext = false; session.comfortGiven = true; }
    else session.comfortGiven = false;
    let best = null, bestW = -1;
    for (let i = 0; i < 5; i++) {
      const q = Q.gen(zoneId, useTier);
      const w = weight(q.factId) * (0.8 + Math.random() * 0.4);
      if (w > bestW) { bestW = w; best = q; }
    }
    // 时限：气势影响 ±25%，舒适题 +2s
    const mFac = 1 + (50 - session.momentum) / 200; // 气势低→时间多
    best.timeMs = Math.round(best.baseTime * 1000 * mFac) + Q.typingComp(best) + (session.comfortGiven ? 2000 : 0);
    return best;
  }

  // 记录作答
  function record(q, correct, ms, session) {
    const s = Store.get();
    const f = factOf(q.factId);
    f.seen++;
    s.totals.answered++;
    session.recent.push(correct ? 1 : 0);
    if (session.recent.length > 12) session.recent.shift();
    if (correct) {
      s.totals.correct++;
      f.streak++;
      f.avgMs = f.avgMs ? Math.round(f.avgMs * 0.7 + ms * 0.3) : ms;
      const fast = ms < q.timeMs * 0.35;
      if (f.needRedeem > 0) f.needRedeem--;
      else if (f.streak >= 2 || fast) f.box = Math.min(4, f.box + 1);
      if (f.needRedeem === 0 && s.wrongList[q.factId] && f.streak >= 2) delete s.wrongList[q.factId];
      session.wrongStreak = 0;
      session.momentum = Math.min(100, session.momentum + (fast ? 8 : 5));
    } else {
      f.wrong++; f.streak = 0; f.box = Math.max(0, f.box - 1);
      f.needRedeem = 2; // 两次独立答对才洗白
      s.wrongList[q.factId] = { zone: q.zone, sample: q.text, answer: q.answer, tip: q.tip, choices: q.choices || null, allowDot: q.allowDot || false, count: (s.wrongList[q.factId]?.count || 0) + 1, last: Date.now() };
      session.wrongStreak++;
      session.momentum = Math.max(0, session.momentum - 12);
      if (session.wrongStreak >= 2) { session.comfortNext = true; session.wrongStreak = 0; }
    }
    Store.save();
  }

  // 实时正确率（最近 12 题）
  function recentAcc(session) {
    if (!session.recent.length) return 0.85;
    return session.recent.reduce((a, b) => a + b, 0) / session.recent.length;
  }

  return { newSession, nextQuestion, record, recentAcc, factOf };
})();

// ---------- 程序化音频 ----------
const Audio2 = (() => {
  let ctx = null, musicTimer = null, musicOn = false, currentMood = 'calm';
  const PENTA = [0, 2, 4, 7, 9]; // 宫商角徵羽（大调五声）
  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function enabled(type) { const s = Store.get().settings; return type === 'music' ? s.music : s.sound; }

  // ----- 音效 -----
  function tone(freq, dur, type = 'sine', vol = 0.18, when = 0, slide = 0) {
    if (!enabled('sound')) return;
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + when);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), c.currentTime + when + dur);
    g.gain.setValueAtTime(vol, c.currentTime + when);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + when); o.stop(c.currentTime + when + dur + 0.05);
  }
  function noise(dur, vol = 0.12, when = 0) {
    if (!enabled('sound')) return;
    const c = ac(), len = c.sampleRate * dur, buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.value = vol;
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 800;
    src.connect(f); f.connect(g); g.connect(c.destination); src.start(c.currentTime + when);
  }
  const SFX = {
    tap: () => tone(660, 0.06, 'sine', 0.1),
    slash: () => { noise(0.12, 0.1); tone(880, 0.1, 'sawtooth', 0.06, 0, -500); },
    hit: () => { tone(180, 0.12, 'square', 0.12, 0, -80); noise(0.08, 0.08); },
    crit: () => { noise(0.15, 0.12); tone(1200, 0.15, 'sawtooth', 0.08, 0, -700); tone(1600, 0.2, 'sine', 0.1, 0.04, -800); },
    wrong: () => { tone(220, 0.25, 'triangle', 0.14, 0, -60); tone(160, 0.3, 'triangle', 0.1, 0.1, -40); },
    hurt: () => { tone(140, 0.2, 'square', 0.13, 0, -60); noise(0.1, 0.1); },
    combo: n => { const base = 520 + Math.min(n, 16) * 30; tone(base, 0.08, 'sine', 0.12); tone(base * 1.5, 0.1, 'sine', 0.1, 0.06); },
    victory: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.28, 'sine', 0.14, i * 0.13)); },
    defeat: () => { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.3, 'triangle', 0.12, i * 0.18)); },
    levelup: () => { [523, 659, 784, 1046, 1318].forEach((f, i) => { tone(f, 0.35, 'sine', 0.13, i * 0.1); tone(f * 2, 0.2, 'sine', 0.05, i * 0.1); }); },
    thunder: () => { noise(0.6, 0.25); tone(60, 0.8, 'sawtooth', 0.18, 0, -20); tone(90, 0.5, 'square', 0.1, 0.1, -40); },
    capture: () => { [660, 880, 1100, 880, 1320].forEach((f, i) => tone(f, 0.15, 'sine', 0.12, i * 0.09)); },
    stone: () => { tone(1400, 0.08, 'sine', 0.1); tone(1800, 0.1, 'sine', 0.08, 0.05); },
    timeout: () => { tone(300, 0.3, 'triangle', 0.12, 0, -150); },
  };

  // ----- 程序化 BGM：五声音阶拨弦 + 低音垫 -----
  function pluck(freq, when, vol = 0.09) {
    const c = ac(), o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = freq;
    f.type = 'lowpass'; f.frequency.setValueAtTime(freq * 4, c.currentTime + when);
    f.frequency.exponentialRampToValueAtTime(freq, c.currentTime + when + 0.5);
    g.gain.setValueAtTime(0, c.currentTime + when);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + 1.2);
    o.connect(f); f.connect(g); g.connect(c.destination);
    o.start(c.currentTime + when); o.stop(c.currentTime + when + 1.3);
  }
  function pad(freq, when, dur, vol = 0.03) {
    const c = ac(), o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    o2.type = 'sine'; o2.frequency.value = freq * 1.005;
    g.gain.setValueAtTime(0, c.currentTime + when);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + when + dur * 0.3);
    g.gain.linearRampToValueAtTime(0, c.currentTime + when + dur);
    o.connect(g); o2.connect(g); g.connect(c.destination);
    o.start(c.currentTime + when); o.stop(c.currentTime + when + dur);
    o2.start(c.currentTime + when); o2.stop(c.currentTime + when + dur);
  }
  function scheduleBar() {
    if (!musicOn || !enabled('music')) return;
    const root = currentMood === 'battle' ? 220 : 174.6; // A3 / F3
    const beat = currentMood === 'battle' ? 0.32 : 0.55;
    const bar = beat * 8;
    pad(root / 2, 0, bar * 1.05, 0.035);
    pad(root * 1.5 / 2, bar * 0.5, bar * 0.55, 0.02);
    let melodyCount = currentMood === 'battle' ? 6 : 4;
    for (let i = 0; i < melodyCount; i++) {
      if (Math.random() < 0.75) {
        const oct = Math.random() < 0.3 ? 2 : 1;
        const deg = PENTA[Math.floor(Math.random() * PENTA.length)];
        const freq = root * oct * Math.pow(2, deg / 12);
        pluck(freq, i * (bar / melodyCount) + Math.random() * 0.05, currentMood === 'battle' ? 0.07 : 0.055);
      }
    }
    if (currentMood === 'battle') for (let i = 0; i < 8; i++) if (i % 2 === 0) noiseTick(i * beat);
    musicTimer = setTimeout(scheduleBar, bar * 1000);
  }
  function noiseTick(when) {
    const c = ac(), len = c.sampleRate * 0.04, buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.5;
    const src = c.createBufferSource(); src.buffer = buf;
    const g = c.createGain(); g.gain.value = 0.05;
    src.connect(g); g.connect(c.destination); src.start(c.currentTime + when);
  }
  function startMusic(mood = 'calm') {
    currentMood = mood;
    if (musicOn) return;
    musicOn = true;
    if (enabled('music')) { try { ac(); scheduleBar(); } catch (e) {} }
  }
  function setMood(mood) { currentMood = mood; }
  function stopMusic() { musicOn = false; clearTimeout(musicTimer); }

  return { SFX, startMusic, stopMusic, setMood, ac };
})();

// ---------- Canvas 粒子系统（对象池） ----------
const Particles = (() => {
  let canvas, ctx2, pool = [], running = false, ambient = null;
  const MAX = 400;
  function init(cv) {
    canvas = cv; ctx2 = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    if (!running) { running = true; requestAnimationFrame(loop); }
  }
  function resize() {
    if (!canvas) return;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
  }
  function spawn(opts) {
    if (Store.get().settings.reducedFx) return;
    if (pool.filter(p => p.alive).length > MAX) return;
    let p = pool.find(p => !p.alive);
    if (!p) { p = {}; pool.push(p); }
    Object.assign(p, {
      alive: true, x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 1, decay: 0.02,
      size: 4, color: '#fff', shape: 'circle', rot: 0, vr: 0, glow: false,
    }, opts);
  }
  // 命中迸发
  function burst(x, y, color, n = 24, power = 6) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = (0.3 + Math.random() * 0.7) * power;
      spawn({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: 0.25, size: 2 + Math.random() * 5, color: Math.random() < 0.3 ? '#fff' : color, decay: 0.02 + Math.random() * 0.02, shape: Math.random() < 0.5 ? 'circle' : 'shard', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4 });
    }
  }
  // 剑气轨迹
  function slashTrail(x1, y1, x2, y2, color) {
    const n = 14;
    for (let i = 0; i < n; i++) {
      const t = i / n;
      spawn({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, size: 3 + Math.random() * 4, color, decay: 0.04, glow: true });
    }
  }
  // 全屏金粒喷泉（升级/胜利）
  function fountain(color = '#ffd75e', n = 80) {
    const w = canvas.width / devicePixelRatio, h = canvas.height / devicePixelRatio;
    for (let i = 0; i < n; i++) {
      spawn({ x: w / 2 + (Math.random() - 0.5) * 100, y: h + 10, vx: (Math.random() - 0.5) * 8, vy: -8 - Math.random() * 8, g: 0.22, size: 3 + Math.random() * 5, color: Math.random() < 0.5 ? color : '#fff8d0', decay: 0.008, shape: Math.random() < 0.4 ? 'star' : 'circle', rot: Math.random() * 6, vr: 0.1 });
    }
  }
  // 环境粒子（秘境氛围）
  function setAmbient(style) { ambient = style; }
  let ambientTick = 0;
  function loop() {
    if (!ctx2) { requestAnimationFrame(loop); return; }
    const w = canvas.width, h = canvas.height, dpr = devicePixelRatio;
    ctx2.clearRect(0, 0, w, h);
    // 环境粒子生成
    if (ambient && !Store.get().settings.reducedFx && ++ambientTick % 12 === 0) {
      const st = Art.PARTICLE_STYLES[ambient];
      if (st) {
        const col = st.colors[Math.floor(Math.random() * st.colors.length)];
        if (st.rise) spawn({ x: Math.random() * w / dpr, y: h / dpr + 8, vx: (Math.random() - 0.5) * 0.5, vy: -0.6 - Math.random(), size: 2 + Math.random() * 4, color: col, decay: 0.004, shape: 'ring' });
        else if (st.twinkle) spawn({ x: Math.random() * w / dpr, y: Math.random() * h / dpr * 0.7, vx: 0, vy: 0.1, size: 1 + Math.random() * 2.5, color: col, decay: 0.008, shape: 'star', glow: true });
        else spawn({ x: -8, y: Math.random() * h / dpr * 0.8, vx: 0.8 + Math.random() * 1.2, vy: 0.3 + Math.random() * 0.5, size: st.big ? 6 + Math.random() * 8 : 2 + Math.random() * 4, color: col, decay: 0.003, rot: Math.random() * 6, vr: 0.02, shape: st.big ? 'circle' : 'shard' });
      }
    }
    ctx2.save();
    ctx2.scale(dpr, dpr);
    for (const p of pool) {
      if (!p.alive) continue;
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= p.decay; p.rot += p.vr;
      if (p.life <= 0) { p.alive = false; continue; }
      ctx2.globalAlpha = Math.max(0, Math.min(1, p.life));
      ctx2.fillStyle = p.color;
      if (p.glow) { ctx2.shadowBlur = 10; ctx2.shadowColor = p.color; } else ctx2.shadowBlur = 0;
      if (p.shape === 'shard') {
        ctx2.save(); ctx2.translate(p.x, p.y); ctx2.rotate(p.rot);
        ctx2.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx2.restore();
      } else if (p.shape === 'star') {
        ctx2.save(); ctx2.translate(p.x, p.y); ctx2.rotate(p.rot);
        ctx2.beginPath();
        for (let i = 0; i < 4; i++) { ctx2.rotate(Math.PI / 2); ctx2.lineTo(0, -p.size); ctx2.lineTo(p.size * 0.35, -p.size * 0.35); }
        ctx2.closePath(); ctx2.fill(); ctx2.restore();
      } else if (p.shape === 'ring') {
        ctx2.strokeStyle = p.color; ctx2.lineWidth = 1.5;
        ctx2.beginPath(); ctx2.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx2.stroke();
      } else {
        ctx2.beginPath(); ctx2.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx2.fill();
      }
    }
    ctx2.restore();
    requestAnimationFrame(loop);
  }
  function clear() { for (const p of pool) p.alive = false; }
  return { init, burst, slashTrail, fountain, setAmbient, clear, resize };
})();

// ---------- 打击感 FX ----------
const FX = (() => {
  let hitstopUntil = 0;
  function reduced() { return Store.get().settings.reducedFx || window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  // hit-stop：短暂全局冻结（暂停 CSS 动画）
  function hitstop(ms = 70) {
    if (reduced()) return;
    document.body.classList.add('hitstop');
    setTimeout(() => document.body.classList.remove('hitstop'), ms);
  }
  // 屏幕震动
  function shake(el, power = 8, dur = 280) {
    if (reduced()) return;
    const start = performance.now();
    (function tick(now) {
      const t = (now - start) / dur;
      if (t >= 1) { el.style.transform = ''; return; }
      const decay = Math.pow(1 - t, 1.6);
      el.style.transform = `translate(${(Math.random() - 0.5) * 2 * power * decay}px, ${(Math.random() - 0.5) * 2 * power * decay}px)`;
      requestAnimationFrame(tick);
    })(start);
  }
  // 伤害飘字
  function damagePop(container, x, y, text, opts = {}) {
    const el = document.createElement('div');
    el.className = 'dmg-pop' + (opts.crit ? ' crit' : '') + (opts.cls ? ' ' + opts.cls : '');
    el.textContent = text;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    if (opts.color) el.style.color = opts.color;
    container.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
  // 全屏闪光
  function flash(color = '#ffffff', ms = 120) {
    if (reduced()) return;
    const el = document.createElement('div');
    el.className = 'screen-flash';
    el.style.background = color;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '0'; });
    setTimeout(() => el.remove(), ms + 260);
  }
  // 慢动作（终结一击）
  function slowmo(ms = 320) {
    if (reduced()) return;
    document.body.classList.add('slowmo');
    setTimeout(() => document.body.classList.remove('slowmo'), ms);
  }
  // 剑气月牙：从 (x1,y1) 飞向 (x2,y2)
  function slashArc(container, x1, y1, x2, y2, color = '#9fd0f5', dur = 180) {
    if (reduced()) return;
    const el = document.createElement('div');
    el.className = 'slash-arc';
    el.style.left = x1 + 'px';
    el.style.top = y1 + 'px';
    el.style.color = color;
    const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    el.innerHTML = `<svg viewBox="0 0 100 100">
      <path class="arc-path" d="M30 8 Q88 50 30 92 Q60 50 30 8 Z" fill="${color}" opacity="0.95"
        transform="rotate(${ang} 50 50)"/></svg>`;
    container.appendChild(el);
    el.style.transition = `transform ${dur}ms cubic-bezier(0.3, 0, 0.7, 1), opacity 120ms ease ${dur - 40}ms`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transform = `translate(${x2 - x1}px, ${y2 - y1}px) scale(1.25)`;
      el.style.opacity = '0';
    }));
    setTimeout(() => el.remove(), dur + 220);
  }
  return { hitstop, shake, damagePop, flash, slowmo, slashArc };
})();

// ---------- 工具 ----------
const $ = sel => document.querySelector(sel);
// 键盘题答案归一化比对（0.5 == .5 == 0.50）
function answersMatch(q, val) {
  const a = String(q.answer).trim(), v = String(val).trim();
  if (a === v) return true;
  if (q.input === 'pad') {
    const na = parseFloat(a), nv = parseFloat(v);
    return Number.isFinite(na) && Number.isFinite(nv) && na === nv;
  }
  return false;
}
const $$ = sel => [...document.querySelectorAll(sel)];
function showToast(msg, ms = 1800) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.add('hidden'), ms);
}
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
