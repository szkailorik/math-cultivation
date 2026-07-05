/* ============================================================
   灵数仙途 · 战斗状态机
   答题即施法：答对=剑气命中（伤害∝速度×连击），答错=妖兽反击
   ============================================================ */

const Battle = (() => {
  let B = null; // 当前战斗状态

  function zoneById(id) { return ZONES.find(z => z.id === id); }

  // ---------- 入口 ----------
  function start(zoneId, chIdx) {
    const zone = zoneById(zoneId);
    const cfg = chapterConfig(ZONES.indexOf(zone), chIdx);
    const pool = MONSTERS[zoneId];
    const smalls = pool.filter(m => !m.boss);
    const bosses = pool.filter(m => m.boss);
    const lineup = [];
    for (let i = 0; i < cfg.monsters; i++) {
      const isLast = i === cfg.monsters - 1;
      if (cfg.isBoss && isLast) lineup.push(bosses[chIdx === 2 ? 0 : 1]);
      else lineup.push(smalls[Math.floor(Math.random() * smalls.length)]);
    }
    B = {
      mode: 'chapter', zone, chIdx, cfg, lineup,
      mIdx: 0, mHp: 0, mHpMax: 0,
      qNeed: 0, qDone: 0,
      shield: 4, shieldMax: 4,
      combo: 0, maxCombo: 0,
      answered: 0, correct: 0,
      xpGain: 0, stoneGain: 0,
      session: Adaptive.newSession(),
      requeue: [], // 答错的题稍后重现
      q: null, qStart: 0, timer: null, coyote: null, locked: false,
      startTime: Date.now(),
    };
    setupStage();
    UI.showScreen('battle');
    Audio2.setMood('battle');
    nextMonster(true);
  }

  function startDaily() {
    const s = Store.get();
    const unlocked = ZONES.filter(z => s.level >= z.unlockLevel);
    const zone = unlocked[Math.floor(Math.random() * unlocked.length)];
    const lineup = [];
    for (let i = 0; i < 5; i++) {
      const uz = unlocked[Math.floor(Math.random() * unlocked.length)];
      const smalls = MONSTERS[uz.id].filter(m => !m.boss);
      const m = { ...smalls[Math.floor(Math.random() * smalls.length)] };
      m._zone = uz.id;
      lineup.push(m);
    }
    B = {
      mode: 'daily', zone, chIdx: -1, cfg: { qPerMonster: [2, 2, 2, 2, 2], isBoss: false, diffTier: 1 }, lineup,
      mIdx: 0, mHp: 0, mHpMax: 0, qNeed: 0, qDone: 0,
      shield: 4, shieldMax: 4, combo: 0, maxCombo: 0, answered: 0, correct: 0,
      xpGain: 0, stoneGain: 0, session: Adaptive.newSession(), requeue: [],
      q: null, qStart: 0, timer: null, coyote: null, locked: false, startTime: Date.now(),
    };
    setupStage();
    UI.showScreen('battle');
    Audio2.setMood('battle');
    nextMonster(true);
  }

  function startDemon() {
    const s = Store.get();
    const wrongs = Object.entries(s.wrongList);
    if (!wrongs.length) { showToast('心魔殿空空如也，太棒了！'); return; }
    const picked = wrongs.sort((a, b) => b[1].count - a[1].count).slice(0, 8);
    const zone = ZONES[0];
    const demonM = { id: 'demon', name: '心魔', kind: 'boss_void', hue: 300, boss: true,
      taunt: ['我就是你做错的题…', '还记得我吗？', '这题你错过哦，嘿嘿'], hurt: ['心魔消散中…', '你想起来了？!'], story: '由错题凝聚的心魔。' };
    B = {
      mode: 'demon', zone, chIdx: -1,
      cfg: { qPerMonster: [picked.length], isBoss: true, diffTier: 1 },
      lineup: [demonM],
      demonQs: picked.map(([fid, w]) => ({ factId: fid, zone: w.zone, text: w.sample, answer: w.answer, tip: w.tip, choices: w.choices, input: w.choices ? 'choice' : 'pad', baseTime: 14, tier: 1 })),
      mIdx: 0, mHp: 0, mHpMax: 0, qNeed: 0, qDone: 0,
      shield: 4, shieldMax: 4, combo: 0, maxCombo: 0, answered: 0, correct: 0,
      xpGain: 0, stoneGain: 0, session: Adaptive.newSession(), requeue: [],
      q: null, qStart: 0, timer: null, coyote: null, locked: false, startTime: Date.now(),
    };
    setupStage();
    UI.showScreen('battle');
    Audio2.setMood('battle');
    nextMonster(true);
  }

  // ---------- 舞台 ----------
  function setupStage() {
    const t = B.zone.theme;
    $('#battle-bg').innerHTML = Art.bgSVG(t);
    Particles.setAmbient(t.particle);
    Particles.init($('#fx-canvas'));
    $('#battle-hero').innerHTML = Art.heroSVG({ tier: 0 });
    renderShield();
    renderCombo();
    renderProgress();
    $('#enemy-speech').classList.remove('show');
  }

  function renderShield() {
    const el = $('#hero-shield');
    el.innerHTML = Array.from({ length: B.shieldMax }, (_, i) =>
      `<span class="shield-orb ${i < B.shield ? 'on' : 'off'}">●</span>`).join('');
  }
  function renderCombo() {
    const el = $('#combo-badge');
    const tier = comboTier(B.combo);
    el.className = 'combo-badge ' + tier.cls;
    el.innerHTML = B.combo >= 3 ? `<span class="combo-n">${B.combo}</span><span class="combo-t">连击${tier.name ? ' · ' + tier.name : ''}</span>` : '';
  }
  function renderProgress() {
    const el = $('#battle-progress');
    el.innerHTML = B.lineup.map((m, i) =>
      `<span class="bp-dot ${i < B.mIdx ? 'done' : i === B.mIdx ? 'now' : ''} ${m.boss ? 'boss' : ''}"></span>`).join('');
  }

  // ---------- 妖兽出场 ----------
  function nextMonster(first) {
    if (B.mIdx >= B.lineup.length) { return endBattle(true); }
    const m = B.lineup[B.mIdx];
    B.qNeed = B.cfg.qPerMonster[B.mIdx] || 2;
    B.qDone = 0;
    B.mHpMax = B.qNeed;
    B.mHp = B.qNeed;
    renderProgress();
    const wrap = $('#enemy-wrap');
    wrap.classList.remove('enemy-die');
    $('#enemy-svg').innerHTML = Art.monsterSVG(m);
    $('#enemy-name').innerHTML = `${m.boss ? '<span class="boss-tag">妖王</span>' : ''}${m.name}`;
    updateEnemyHp();
    wrap.classList.remove('enemy-enter');
    void wrap.offsetWidth;
    wrap.classList.add('enemy-enter');
    if (m.boss) { FX.shake($('#battle-stage'), 6, 300); Audio2.SFX.hurt(); }
    speech(m.taunt[Math.floor(Math.random() * m.taunt.length)]);
    setTimeout(() => nextQuestion(), first ? 900 : 700);
  }

  function updateEnemyHp() {
    $('#enemy-hp-fill').style.width = (B.mHp / B.mHpMax * 100) + '%';
  }

  function speech(text, ms = 1600) {
    const el = $('#enemy-speech');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(el._h);
    el._h = setTimeout(() => el.classList.remove('show'), ms);
  }

  // ---------- 出题 ----------
  function nextQuestion() {
    if (!B) return;
    let q;
    if (B.mode === 'demon') {
      q = B.requeue.length && Math.random() < 0.4 ? B.requeue.shift() : B.demonQs.shift();
      if (!q) q = B.requeue.shift();
      if (!q) return endBattle(true);
      q.timeMs = q.baseTime * 1000;
    } else if (B.requeue.length && (Math.random() < 0.35 || B.requeue.length > 2)) {
      q = B.requeue.shift();
      q.timeMs = Math.round(q.baseTime * 1000 * 1.15); // 重现题稍宽
    } else {
      const zid = B.mode === 'daily' ? (B.lineup[B.mIdx]._zone || B.zone.id) : B.zone.id;
      q = Adaptive.nextQuestion(zid, B.cfg.diffTier, B.session);
    }
    B.q = q; B.locked = false;
    $('#question-text').innerHTML = q.text.replace('?', '<span class="q-mark">?</span>');
    renderInput(q);
    // 聚灵计时条
    const fill = $('#spell-timer-fill');
    fill.style.transition = 'none';
    fill.style.width = '100%';
    fill.className = 'spell-timer-fill';
    void fill.offsetWidth;
    fill.style.transition = `width ${q.timeMs}ms linear`;
    fill.style.width = '0%';
    B.qStart = performance.now();
    clearTimeout(B.timer);
    B.timer = setTimeout(() => { // 郊狼时间
      fill.classList.add('danger');
      B.coyote = setTimeout(() => onTimeout(), 400);
    }, q.timeMs);
    setTimeout(() => { if (B && B.q === q) fill.classList.add(q.timeMs > 4000 ? 'x' : 'danger'); }, Math.max(0, q.timeMs - 2000));
  }

  function renderInput(q) {
    const zone = $('#answer-zone');
    if (q.input === 'choice') {
      zone.innerHTML = `<div class="choices">${q.choices.map(c =>
        `<button class="choice-btn" data-v="${c}">${c}</button>`).join('')}</div>`;
      $$('.choice-btn').forEach(b => b.addEventListener('click', () => { Audio2.SFX.tap(); submit(b.dataset.v, b); }));
    } else {
      zone.innerHTML = `
        <div class="pad-display" id="pad-display">&nbsp;</div>
        <div class="numpad">
          ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pad-btn" data-k="${n}">${n}</button>`).join('')}
          <button class="pad-btn pad-del" data-k="del">⌫</button>
          <button class="pad-btn" data-k="0">0</button>
          <button class="pad-btn pad-ok" data-k="ok">出剑</button>
        </div>`;
      let val = '';
      const disp = $('#pad-display');
      $$('.pad-btn').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.k;
        Audio2.SFX.tap();
        if (k === 'del') val = val.slice(0, -1);
        else if (k === 'ok') { if (val) submit(val); return; }
        else if (val.length < 6) val += k;
        disp.textContent = val || ' ';
        // 自动出剑：答案位数匹配即自动提交（速算爽感）
        if (val && val.length >= String(B.q.answer).length && k !== 'del') {
          setTimeout(() => { if (B && B.q === q && !B.locked && val) submit(val); }, 120);
        }
      }));
    }
  }

  // 键盘支持（桌面）
  function onKey(e) {
    if (!B || B.locked || !B.q) return;
    if (B.q.input !== 'pad') {
      const idx = parseInt(e.key) - 1;
      const btns = $$('.choice-btn');
      if (idx >= 0 && idx < btns.length) btns[idx].click();
      return;
    }
    if (/^[0-9]$/.test(e.key)) $(`.pad-btn[data-k="${e.key}"]`)?.click();
    else if (e.key === 'Backspace') $('.pad-btn[data-k="del"]')?.click();
    else if (e.key === 'Enter') $('.pad-btn[data-k="ok"]')?.click();
  }

  // ---------- 判定 ----------
  function submit(val, btnEl) {
    if (!B || B.locked || !B.q) return;
    B.locked = true;
    clearTimeout(B.timer); clearTimeout(B.coyote);
    $('#spell-timer-fill').style.transition = 'none';
    const ms = performance.now() - B.qStart;
    const correct = String(val).trim() === String(B.q.answer);
    B.answered++;
    if (B.mode !== 'demon') Adaptive.record(B.q, correct, ms, B.session);
    else recordDemon(B.q, correct);
    if (correct) { B.correct++; onCorrect(ms, btnEl); }
    else onWrong(val, btnEl);
  }

  function recordDemon(q, correct) {
    const s = Store.get();
    if (correct) {
      const f = Adaptive.factOf(q.factId);
      if (f.needRedeem > 0) f.needRedeem--;
      if (f.needRedeem === 0) { delete s.wrongList[q.factId]; }
    } else {
      const f = Adaptive.factOf(q.factId);
      f.needRedeem = 2;
      if (s.wrongList[q.factId]) s.wrongList[q.factId].count++;
    }
    Store.save();
  }

  function speedGrade(ms) {
    const r = ms / B.q.timeMs;
    if (r < 0.3) return SPEED_GRADES[0];
    if (r < 0.55) return SPEED_GRADES[1];
    if (r < 0.8) return SPEED_GRADES[2];
    return SPEED_GRADES[3];
  }

  function onCorrect(ms, btnEl) {
    const g = speedGrade(ms);
    B.combo++;
    B.maxCombo = Math.max(B.maxCombo, B.combo);
    const tier = comboTier(B.combo);
    const dmg = Math.max(1, Math.round(1 * g.mult * tier.mult * 10) / 10);
    if (btnEl) btnEl.classList.add('right');
    renderCombo();
    if (B.combo >= 3) Audio2.SFX.combo(B.combo);
    // 英雄形态
    $('#battle-hero').innerHTML = Art.heroSVG({ tier: COMBO_TIERS.indexOf(tier) });
    // 攻击演出
    const heroW = $('#hero-wrap'), enemyW = $('#enemy-wrap'), stage = $('#battle-stage');
    heroW.classList.remove('hero-attack'); void heroW.offsetWidth; heroW.classList.add('hero-attack');
    Audio2.SFX.slash();
    const hr = heroW.getBoundingClientRect(), er = enemyW.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    setTimeout(() => {
      const crit = g.grade === 'S';
      Particles.slashTrail(hr.left - sr.left + hr.width / 2, hr.top - sr.top + hr.height / 3,
        er.left - sr.left + er.width / 2, er.top - sr.top + er.height / 2, B.zone.theme.accent);
      setTimeout(() => {
        FX.hitstop(crit ? 110 : 70);
        crit ? Audio2.SFX.crit() : Audio2.SFX.hit();
        FX.shake(stage, crit ? 12 : 7, crit ? 340 : 240);
        if (crit) FX.flash('#ffffff', 90);
        Particles.burst(er.left - sr.left + er.width / 2, er.top - sr.top + er.height / 2, B.zone.theme.accent, crit ? 40 : 24, crit ? 8 : 6);
        enemyW.classList.remove('enemy-hit'); void enemyW.offsetWidth; enemyW.classList.add('enemy-hit');
        FX.damagePop(stage, er.left - sr.left + er.width / 2 - 20, er.top - sr.top + 10,
          (crit ? '会心 ' : '') + '-' + dmg, { crit, color: g.color });
        FX.damagePop(stage, er.left - sr.left + er.width / 2 + 30, er.top - sr.top + 60, g.label, { cls: 'grade', color: g.color });
        const m = B.lineup[B.mIdx];
        B.mHp = Math.max(0, B.mHp - dmg);
        B.qDone++;
        updateEnemyHp();
        // 奖励
        const xw = (B.q.tier || 0) + 1 + (g.grade === 'S' ? 1 : 0);
        B.xpGain += xw; B.stoneGain += (g.grade === 'S' ? 2 : 1);
        if (B.mHp <= 0) {
          speech(m.hurt[Math.floor(Math.random() * m.hurt.length)], 1000);
          setTimeout(() => killMonster(), 350);
        } else {
          speech(m.hurt[Math.floor(Math.random() * m.hurt.length)], 900);
          setTimeout(() => nextQuestion(), 650);
        }
      }, 130);
    }, 160);
  }

  function killMonster() {
    const m = B.lineup[B.mIdx];
    const enemyW = $('#enemy-wrap'), stage = $('#battle-stage');
    const er = enemyW.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    if (m.boss) { FX.slowmo(380); FX.flash(B.zone.theme.accent + '88', 150); }
    enemyW.classList.add('enemy-die');
    Particles.burst(er.left - sr.left + er.width / 2, er.top - sr.top + er.height / 2, B.zone.theme.fog, m.boss ? 70 : 36, m.boss ? 10 : 7);
    Audio2.SFX.hurt();
    B.mIdx++;
    setTimeout(() => nextMonster(false), m.boss ? 1100 : 800);
  }

  function onWrong(val, btnEl) {
    B.combo = Math.floor(B.combo / 2); // 连击记忆保留一半
    renderCombo();
    $('#battle-hero').innerHTML = Art.heroSVG({ tier: COMBO_TIERS.indexOf(comboTier(B.combo)) });
    if (btnEl) btnEl.classList.add('wrong-pick');
    // 显示正确选项
    if (B.q.input === 'choice') $$('.choice-btn').forEach(b => { if (b.dataset.v === String(B.q.answer)) b.classList.add('right'); });
    const m = B.lineup[B.mIdx];
    const stage = $('#battle-stage'), heroW = $('#hero-wrap');
    // 妖兽反击
    const enemyW = $('#enemy-wrap');
    enemyW.classList.remove('enemy-attack'); void enemyW.offsetWidth; enemyW.classList.add('enemy-attack');
    Audio2.SFX.wrong();
    setTimeout(() => {
      B.shield--;
      renderShield();
      FX.shake(stage, 9, 300);
      Audio2.SFX.hurt();
      heroW.classList.remove('hero-hurt'); void heroW.offsetWidth; heroW.classList.add('hero-hurt');
      const hr = heroW.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      Particles.burst(hr.left - sr.left + hr.width / 2, hr.top - sr.top + hr.height / 2, '#f06a6a', 18, 5);
      FX.damagePop(stage, hr.left - sr.left + hr.width / 2 - 16, hr.top - sr.top, '护盾-1', { color: '#f08a8a' });
      speech(m.taunt[Math.floor(Math.random() * m.taunt.length)], 1200);
      // 错题重现队列
      if (B.q.factId) {
        const clone = { ...B.q };
        B.requeue.push(clone);
      }
      // 讲解卡
      showTipCard(val);
    }, 300);
  }

  function onTimeout() {
    if (!B || B.locked || !B.q) return;
    B.locked = true;
    Audio2.SFX.timeout();
    if (B.mode !== 'demon') Adaptive.record(B.q, false, B.q.timeMs, B.session);
    B.answered++;
    onWrong('（超时）', null);
  }

  // 答错讲解卡：正解 + 口诀，孩子点"记住了"继续
  function showTipCard(val) {
    const q = B.q;
    const layer = $('#feedback-layer');
    layer.innerHTML = `
      <div class="tip-card">
        <div class="tip-head">✕ ${val === '（超时）' ? '时间到！' : '差一点！'}</div>
        <div class="tip-q">${q.text.replace('?', `<b class="tip-ans">${q.answer}</b>`)}</div>
        <div class="tip-hint">💡 ${q.tip || '再想一想，你可以的！'}</div>
        <div class="tip-comfort">${COMFORTS[Math.floor(Math.random() * COMFORTS.length)]}</div>
        <button class="btn btn-primary" id="tip-go">记住了，继续！</button>
      </div>`;
    layer.classList.add('show');
    $('#tip-go').addEventListener('click', () => {
      Audio2.SFX.tap();
      layer.classList.remove('show');
      layer.innerHTML = '';
      if (B.shield <= 0) return endBattle(false);
      setTimeout(() => nextQuestion(), 250);
    });
  }

  // ---------- 结算 ----------
  function endBattle(victory) {
    clearTimeout(B.timer); clearTimeout(B.coyote);
    const acc = B.answered ? B.correct / B.answered : 0;
    const s = Store.get();
    const dur = Math.round((Date.now() - B.startTime) / 1000);
    let stars = 0, beastDrop = null, isNewBest = false;
    if (victory) {
      Audio2.SFX.victory();
      Particles.fountain(B.zone.theme.accent, 70);
      stars = (acc >= 0.9 && B.shield === B.shieldMax) ? 3 : acc >= 0.9 ? Math.max(2, B.shield > 1 ? 3 : 2) : acc >= 0.75 ? 2 : 1;
      // 胜利奖励：基础 + 星级加成，妖王章更丰厚
      const winBonus = Math.round((12 + stars * 4) * (B.cfg.isBoss ? 1.5 : 1));
      B.xpGain += winBonus;
      B.stoneGain += 6 + stars * 2;
      if (B.mode === 'chapter') {
        if (!s.chapters[B.zone.id]) s.chapters[B.zone.id] = [];
        const prev = s.chapters[B.zone.id][B.chIdx];
        const firstClear = !prev;
        if (!prev || prev.stars < stars) { s.chapters[B.zone.id][B.chIdx] = { stars, best: acc }; isNewBest = !firstClear; }
        // 灵兽掉落
        const zBeasts = BEASTS.filter(b => b.zone === B.zone.id);
        if (B.chIdx === 2 && firstClear && zBeasts[0] && !s.beasts.includes(zBeasts[0].id)) beastDrop = zBeasts[0];
        if (B.chIdx === 5 && firstClear && zBeasts[1] && !s.beasts.includes(zBeasts[1].id)) beastDrop = zBeasts[1];
        const allThree = s.chapters[B.zone.id].length === CHAPTERS_PER_ZONE && s.chapters[B.zone.id].every(c => c && c.stars === 3);
        if (allThree && zBeasts[2] && !s.beasts.includes(zBeasts[2].id)) beastDrop = zBeasts[2];
        if (beastDrop) { s.beasts.push(beastDrop.id); Audio2.SFX.capture(); }
        if (B.cfg.isBoss) s.totals.bossKills++;
      }
      if (B.mode === 'daily') {
        s.daily = { day: todayStr(), done: true, bestMs: dur };
        const last = s.lastPlayDay;
        const today = todayStr();
        if (last !== today) {
          const y = new Date(); y.setDate(y.getDate() - 1);
          const yStr = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
          s.streakDays = last === yStr ? s.streakDays + 1 : 1;
          s.lastPlayDay = today;
        }
      }
    } else {
      Audio2.SFX.defeat();
      B.xpGain = Math.floor(B.xpGain / 2);
      B.stoneGain = Math.floor(B.stoneGain / 2);
    }
    s.totals.battles++;
    const oldLevel = s.level;
    s.xp += B.xpGain;
    s.stones += B.stoneGain;
    // 升级判定
    let leveled = false;
    while (s.level < MAX_LEVEL && s.xp >= xpForLevel(s.level)) {
      s.xp -= xpForLevel(s.level);
      s.level++;
      leveled = true;
    }
    Store.save();
    const bigBreak = leveled && Math.floor(s.level / 3) > Math.floor(oldLevel / 3);
    UI.showResult({
      victory, stars, acc, dur,
      xp: B.xpGain, stones: B.stoneGain,
      maxCombo: B.maxCombo, beastDrop, leveled, bigBreak,
      mode: B.mode, zone: B.zone, chIdx: B.chIdx, isNewBest,
    });
    Audio2.setMood('calm');
    B = null;
  }

  function flee() {
    if (!B) return;
    clearTimeout(B.timer); clearTimeout(B.coyote);
    Audio2.setMood('calm');
    const mode = B.mode;
    B = null;
    $('#feedback-layer').classList.remove('show');
    $('#feedback-layer').innerHTML = '';
    UI.showScreen(mode === 'chapter' ? 'chapters' : 'home');
  }

  return { start, startDaily, startDemon, flee, onKey };
})();
