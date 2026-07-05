/* ============================================================
   灵数仙途 · 双修共战（双人协作）
   两位道友各自答题，剑气共击一妖；共享队伍护盾。
   对称模拟：双方各自应用全部伤害/护盾事件，结果一致。
   ============================================================ */

const Coop = (() => {
  let C = null;          // 战斗状态
  let lobby = null;      // 大厅状态 {role, code, zoneId, partnerJoined, partnerLevel}
  let wakeLock = null;   // 防 iPad 锁屏断联

  async function acquireWakeLock() {
    try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (e) {}
  }
  function releaseWakeLock() {
    try { wakeLock && wakeLock.release(); } catch (e) {}
    wakeLock = null;
  }

  // ---------- 大厅 ----------
  function open() {
    lobby = { role: null, code: '', zoneId: 'zhulin', partnerJoined: false, partnerLevel: 0 };
    renderLobby();
    UI.showScreen('coop');
  }

  function renderLobby() {
    const el = $('#coop-body');
    const s = Store.get();
    if (!lobby.role) {
      el.innerHTML = `
        <div class="coop-intro">
          <div class="coop-fig">🤝</div>
          <p>两位道友，两台设备。<br>各自答题，剑气共击一妖，同守一面护盾！</p>
        </div>
        <button class="btn btn-primary btn-xl" id="coop-host">🏮 开坛做主</button>
        <button class="btn btn-ghost btn-xl" id="coop-join">🚪 输入灵咒加入</button>
        <p class="coop-hint">同一 WiFi 下连接最快，跨网也可一起修行</p>`;
      $('#coop-host').addEventListener('click', doHost);
      $('#coop-join').addEventListener('click', renderJoin);
      return;
    }
    if (lobby.role === 'host') {
      const zones = ZONES.filter(z => s.level >= z.unlockLevel);
      el.innerHTML = `
        <div class="coop-code-card">
          <div class="cc-label">灵 咒</div>
          <div class="cc-code">${lobby.code.split('').join(' ')}</div>
          <div class="cc-tip">让道友在另一台设备输入这四个数字</div>
        </div>
        <div class="coop-status ${lobby.partnerJoined ? 'ok' : ''}" id="coop-status">
          ${lobby.partnerJoined ? '✅ 道友已到坛前！' : '<span class="coop-spin">✦</span> 静候道友降临…'}
        </div>
        <div class="coop-zone-pick">
          <div class="czp-label">选择共战秘境</div>
          <div class="czp-list">${zones.map(z =>
            `<button class="czp-item ${z.id === lobby.zoneId ? 'on' : ''}" data-z="${z.id}">${z.icon} ${z.name}</button>`).join('')}</div>
        </div>
        <button class="btn btn-primary btn-xl ${lobby.partnerJoined ? '' : 'disabled'}" id="coop-start" ${lobby.partnerJoined ? '' : 'disabled'}>⚔️ 开 战</button>
        <button class="btn btn-ghost" id="coop-cancel">散坛</button>`;
      $$('.czp-item').forEach(b => b.addEventListener('click', () => {
        lobby.zoneId = b.dataset.z;
        $$('.czp-item').forEach(x => x.classList.toggle('on', x === b));
        Audio2.SFX.tap();
      }));
      $('#coop-start').addEventListener('click', hostStart);
      $('#coop-cancel').addEventListener('click', () => { Net.leave(); lobby.role = null; renderLobby(); });
      return;
    }
    // guest
    el.innerHTML = `
      <div class="coop-status ok">✅ 已入坛！</div>
      <div class="coop-wait-fig" id="coop-wait-hero"></div>
      <p class="coop-hint">等待宗主选择秘境开战…</p>
      <button class="btn btn-ghost" id="coop-cancel">离坛</button>`;
    $('#coop-wait-hero').innerHTML = Art.heroSVG({ tier: 1 });
    $('#coop-cancel').addEventListener('click', () => { Net.leave(); lobby.role = null; renderLobby(); });
  }

  function renderJoin() {
    const el = $('#coop-body');
    el.innerHTML = `
      <div class="coop-code-card">
        <div class="cc-label">输入灵咒</div>
        <div class="cc-input" id="cc-input"><span>_</span><span>_</span><span>_</span><span>_</span></div>
      </div>
      <div class="numpad coop-pad">
        ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pad-btn" data-k="${n}">${n}</button>`).join('')}
        <button class="pad-btn pad-del" data-k="del">⌫</button>
        <button class="pad-btn" data-k="0">0</button>
        <button class="pad-btn pad-ok" data-k="ok">加入</button>
      </div>
      <div class="coop-status hidden" id="join-status"></div>
      <button class="btn btn-ghost" id="coop-back0">返回</button>`;
    let code = '';
    const slots = $('#cc-input').children;
    const draw = () => { for (let i = 0; i < 4; i++) slots[i].textContent = code[i] || '_'; };
    $$('.coop-pad .pad-btn').forEach(b => b.addEventListener('click', async () => {
      const k = b.dataset.k;
      Audio2.SFX.tap();
      if (k === 'del') { code = code.slice(0, -1); draw(); return; }
      if (k === 'ok' || (code.length === 3 && k !== 'del' && k !== 'ok')) {
        if (k !== 'ok') { code += k; draw(); }
        if (code.length !== 4) return;
        const st = $('#join-status');
        st.classList.remove('hidden');
        st.innerHTML = '<span class="coop-spin">✦</span> 连接中…';
        try {
          await Net.join(code, netCallbacks());
          lobby.role = 'guest'; lobby.code = code;
          Net.send({ t: 'hello', level: Store.get().level });
          renderLobby();
        } catch (e) {
          st.textContent = '❌ 没找到这个坛号，检查灵咒或让宗主重开';
        }
        return;
      }
      if (code.length < 4) { code += k; draw(); }
    }));
    $('#coop-back0').addEventListener('click', () => { lobby.role = null; renderLobby(); });
  }

  async function doHost() {
    Audio2.SFX.tap();
    const el = $('#coop-body');
    el.innerHTML = '<div class="coop-status"><span class="coop-spin">✦</span> 布坛中…</div>';
    try {
      const code = await Net.host(netCallbacks());
      lobby.role = 'host'; lobby.code = code;
      renderLobby();
    } catch (e) {
      el.innerHTML = `<div class="coop-status">❌ 布坛失败（网络不通），稍后再试</div>
        <button class="btn btn-ghost" id="coop-back0">返回</button>`;
      $('#coop-back0').addEventListener('click', () => { lobby.role = null; renderLobby(); });
    }
  }

  function netCallbacks() {
    return {
      onPeerJoined() {
        if (lobby) { lobby.partnerJoined = true; Net.send({ t: 'hello', level: Store.get().level }); renderLobby(); Audio2.SFX.capture(); }
      },
      onPeerLeft() {
        if (C) { // 战斗中断线 → 转单人继续
          C.partnerGone = true;
          showToast('道友已离开，你独自战斗！');
          $('#partner-wrap')?.classList.add('partner-gone');
          return;
        }
        if (lobby && lobby.role) {
          lobby.partnerJoined = false;
          showToast('道友已离坛');
          if (lobby.role === 'guest') { lobby.role = null; }
          renderLobby();
        }
      },
      onMessage(d) { onMsg(d); },
    };
  }

  function onMsg(d) {
    if (d.t === 'hello') { if (lobby) lobby.partnerLevel = d.level || 0; return; }
    if (d.t === 'start') { startBattle(d.zone, d.lineup, d.hps, d.tier, false); return; }
    if (!C) return;
    if (d.t === 'dmg') { partnerAttack(d.v, d.crit); return; }
    if (d.t === 'wrong') { teamShieldDown(false); return; }
    if (d.t === 'combo') { C.partnerCombo = d.n; renderPartnerCombo(); return; }
  }

  // ---------- 开战 ----------
  function hostStart() {
    if (!lobby.partnerJoined) return;
    Audio2.SFX.tap();
    const zoneId = lobby.zoneId;
    const pool = MONSTERS[zoneId];
    const smalls = pool.filter(m => !m.boss);
    const boss = pool.filter(m => m.boss)[Math.random() < 0.5 ? 0 : 1];
    const lineup = [];
    for (let i = 0; i < 4; i++) lineup.push(smalls[Math.floor(Math.random() * smalls.length)].id);
    lineup.push(boss.id);
    const hps = [6, 6, 7, 7, 12]; // 双人共享血量
    Net.send({ t: 'start', zone: zoneId, lineup, hps, tier: 1 });
    startBattle(zoneId, lineup, hps, 1, true);
  }

  function startBattle(zoneId, lineupIds, hps, tier, isHost) {
    const zone = ZONES.find(z => z.id === zoneId);
    const lineup = lineupIds.map(id => MONSTERS[zoneId].find(m => m.id === id));
    C = {
      zone, lineup, hps: hps.slice(), hpMax: hps.slice(),
      mIdx: 0, tier,
      teamShield: 6, teamShieldMax: 6,
      combo: 0, maxCombo: 0, partnerCombo: 0,
      answered: 0, correct: 0, xpGain: 0, stoneGain: 0, myDmg: 0,
      session: Adaptive.newSession(), requeue: [],
      q: null, qStart: 0, timer: null, coyote: null, locked: false,
      startTime: Date.now(), over: false, partnerGone: false, transitioning: false,
    };
    // 舞台（复用战斗屏）
    $('#battle-bg').innerHTML = Art.bgSVG(zone.theme);
    Particles.setAmbient(zone.theme.particle);
    Particles.init($('#fx-canvas'));
    $('#battle-hero').innerHTML = Art.heroSVG({ tier: 0 });
    // 伙伴立绘
    let pw = $('#partner-wrap');
    if (!pw) {
      pw = document.createElement('div');
      pw.id = 'partner-wrap';
      $('.hero-zone').prepend(pw);
    }
    pw.classList.remove('partner-gone');
    pw.innerHTML = `<div class="partner-tag">道友 <span id="partner-combo-n"></span></div>
      <div class="partner-hero" id="partner-hero">${Art.heroSVG({ tier: 0 })}</div>`;
    renderTeamShield();
    renderCoopProgress();
    renderPartnerCombo();
    renderMyCombo();
    $('#enemy-speech').classList.remove('show');
    UI.showScreen('battle');
    Audio2.setMood('battle');
    acquireWakeLock();
    enterMonster(true);
  }

  // ---------- 渲染 ----------
  function renderTeamShield() {
    $('#hero-shield').innerHTML = `<span class="team-shield-label">队伍护盾</span>` +
      Array.from({ length: C.teamShieldMax }, (_, i) =>
        `<span class="shield-orb ${i < C.teamShield ? 'on' : 'off'}">●</span>`).join('');
  }
  function renderCoopProgress() {
    $('#battle-progress').innerHTML = C.lineup.map((m, i) =>
      `<span class="bp-dot ${i < C.mIdx ? 'done' : i === C.mIdx ? 'now' : ''} ${m.boss ? 'boss' : ''}"></span>`).join('');
  }
  function renderMyCombo() {
    const el = $('#combo-badge');
    const tier = comboTier(C.combo);
    el.className = 'combo-badge ' + tier.cls;
    el.innerHTML = C.combo >= 3 ? `<span class="combo-n">${C.combo}</span><span class="combo-t">连击${tier.name ? ' · ' + tier.name : ''}</span>` : '';
  }
  function renderPartnerCombo() {
    const el = $('#partner-combo-n');
    if (el) el.textContent = C.partnerCombo >= 3 ? `⚡${C.partnerCombo}` : '';
  }
  function updateEnemyHp() {
    $('#enemy-hp-fill').style.width = Math.max(0, C.hps[C.mIdx] / C.hpMax[C.mIdx] * 100) + '%';
  }

  // ---------- 妖兽 ----------
  function enterMonster(first) {
    if (C.mIdx >= C.lineup.length) return endBattle(true);
    const m = C.lineup[C.mIdx];
    C.transitioning = false;
    renderCoopProgress();
    const wrap = $('#enemy-wrap');
    wrap.classList.remove('enemy-die');
    $('#enemy-svg').innerHTML = Art.monsterSVG(m);
    $('#enemy-name').innerHTML = `${m.boss ? '<span class="boss-tag">妖王</span>' : ''}${m.name}`;
    updateEnemyHp();
    wrap.classList.remove('enemy-enter'); void wrap.offsetWidth; wrap.classList.add('enemy-enter');
    if (m.boss) { FX.shake($('#battle-stage'), 6, 300); Audio2.SFX.hurt(); }
    speech(m.taunt[Math.floor(Math.random() * m.taunt.length)]);
    if (first) setTimeout(() => nextQuestion(), 900);
  }

  function speech(text, ms = 1500) {
    const el = $('#enemy-speech');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(el._h);
    el._h = setTimeout(() => el.classList.remove('show'), ms);
  }

  // ---------- 题目流（独立于妖兽进度） ----------
  function nextQuestion() {
    if (!C || C.over) return;
    let q;
    if (C.requeue.length && (Math.random() < 0.35 || C.requeue.length > 2)) {
      q = C.requeue.shift();
      q.timeMs = Math.round(q.baseTime * 1000 * 1.15);
    } else {
      q = Adaptive.nextQuestion(C.zone.id, C.tier, C.session);
    }
    C.q = q; C.locked = false;
    $('#question-text').innerHTML = q.text.replace('?', '<span class="q-mark">?</span>');
    renderInput(q);
    const fill = $('#spell-timer-fill');
    fill.style.transition = 'none';
    fill.style.width = '100%';
    fill.className = 'spell-timer-fill';
    void fill.offsetWidth;
    fill.style.transition = `width ${q.timeMs}ms linear`;
    fill.style.width = '0%';
    C.qStart = performance.now();
    clearTimeout(C.timer);
    C.timer = setTimeout(() => {
      fill.classList.add('danger');
      C.coyote = setTimeout(() => onTimeout(), 400);
    }, q.timeMs);
    setTimeout(() => { if (C && C.q === q) fill.classList.add('danger'); }, Math.max(0, q.timeMs - 2000));
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
      $$('.numpad .pad-btn').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.k;
        Audio2.SFX.tap();
        if (k === 'del') val = val.slice(0, -1);
        else if (k === 'ok') { if (val) submit(val); return; }
        else if (val.length < 6) val += k;
        disp.textContent = val || ' ';
        if (val && val.length >= String(C.q.answer).length && k !== 'del') {
          setTimeout(() => { if (C && C.q === q && !C.locked && val) submit(val); }, 120);
        }
      }));
    }
  }

  function onKey(e) {
    if (!C || C.over || C.locked || !C.q) return;
    if (!document.querySelector('#screen-battle.active')) return;
    if (C.q.input !== 'pad') {
      const idx = parseInt(e.key) - 1;
      const btns = $$('.choice-btn');
      if (idx >= 0 && idx < btns.length) btns[idx].click();
      return;
    }
    if (/^[0-9]$/.test(e.key)) $(`.numpad .pad-btn[data-k="${e.key}"]`)?.click();
    else if (e.key === 'Backspace') $('.numpad .pad-btn[data-k="del"]')?.click();
    else if (e.key === 'Enter') $('.numpad .pad-btn[data-k="ok"]')?.click();
  }

  // ---------- 判定 ----------
  function submit(val, btnEl) {
    if (!C || C.locked || !C.q || C.over) return;
    C.locked = true;
    clearTimeout(C.timer); clearTimeout(C.coyote);
    $('#spell-timer-fill').style.transition = 'none';
    const ms = performance.now() - C.qStart;
    const correct = String(val).trim() === String(C.q.answer);
    C.answered++;
    Adaptive.record(C.q, correct, ms, C.session);
    if (correct) { C.correct++; onCorrect(ms, btnEl); }
    else onWrong(val, btnEl);
  }

  function speedGrade(ms) {
    const r = ms / C.q.timeMs;
    if (r < 0.3) return SPEED_GRADES[0];
    if (r < 0.55) return SPEED_GRADES[1];
    if (r < 0.8) return SPEED_GRADES[2];
    return SPEED_GRADES[3];
  }

  function onCorrect(ms, btnEl) {
    const g = speedGrade(ms);
    C.combo++;
    C.maxCombo = Math.max(C.maxCombo, C.combo);
    const tier = comboTier(C.combo);
    const dmg = Math.max(1, Math.round(1 * g.mult * tier.mult * 10) / 10);
    if (btnEl) btnEl.classList.add('right');
    renderMyCombo();
    if (C.combo >= 3) Audio2.SFX.combo(C.combo);
    Net.send({ t: 'combo', n: C.combo });
    $('#battle-hero').innerHTML = Art.heroSVG({ tier: COMBO_TIERS.indexOf(tier) });
    const heroW = $('#hero-wrap');
    heroW.classList.remove('hero-attack'); void heroW.offsetWidth; heroW.classList.add('hero-attack');
    Audio2.SFX.slash();
    const crit = g.grade === 'S';
    Net.send({ t: 'dmg', v: dmg, crit });
    C.myDmg += dmg;
    const xw = (C.q.tier || 0) + 1 + (crit ? 1 : 0);
    C.xpGain += xw; C.stoneGain += crit ? 2 : 1;
    setTimeout(() => hitMonster(dmg, crit, g, true), 280);
    setTimeout(() => { if (!C || C.over) return; nextQuestion(); }, 750);
  }

  // 伙伴出剑
  function partnerAttack(v, crit) {
    if (!C || C.over) return;
    const ph = $('#partner-hero');
    if (ph) { ph.classList.remove('hero-attack'); void ph.offsetWidth; ph.classList.add('hero-attack'); }
    setTimeout(() => hitMonster(v, crit, null, false), 240);
  }

  // 命中结算（对称）
  function hitMonster(dmg, crit, grade, mine) {
    if (!C || C.over || C.transitioning && C.mIdx >= C.lineup.length) return;
    if (C.mIdx >= C.lineup.length) return;
    const enemyW = $('#enemy-wrap'), stage = $('#battle-stage');
    const er = enemyW.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    FX.hitstop(crit ? 100 : 60);
    crit ? Audio2.SFX.crit() : Audio2.SFX.hit();
    FX.shake(stage, crit ? 11 : 6, crit ? 320 : 220);
    if (crit && mine) FX.flash('#ffffff', 80);
    const color = mine ? C.zone.theme.accent : '#ffd75e';
    Particles.burst(er.left - sr.left + er.width / 2, er.top - sr.top + er.height / 2, color, crit ? 36 : 20, crit ? 8 : 6);
    enemyW.classList.remove('enemy-hit'); void enemyW.offsetWidth; enemyW.classList.add('enemy-hit');
    FX.damagePop(stage, er.left - sr.left + er.width / 2 + (mine ? -20 : 26), er.top - sr.top + (mine ? 10 : 34),
      (crit ? '会心 ' : '') + '-' + dmg, { crit, color: mine ? (grade ? grade.color : '#fff') : '#ffd75e', cls: mine ? '' : 'partner-dmg' });
    if (!mine) FX.damagePop(stage, er.left - sr.left + er.width / 2 + 30, er.top - sr.top + 74, '道友', { cls: 'grade', color: '#ffd75e' });
    const m = C.lineup[C.mIdx];
    C.hps[C.mIdx] = Math.max(0, C.hps[C.mIdx] - dmg);
    updateEnemyHp();
    if (C.hps[C.mIdx] <= 0 && !C.transitioning) {
      C.transitioning = true;
      speech(m.hurt[Math.floor(Math.random() * m.hurt.length)], 900);
      setTimeout(() => killMonster(), 300);
    } else if (Math.random() < 0.4) {
      speech(m.hurt[Math.floor(Math.random() * m.hurt.length)], 800);
    }
  }

  function killMonster() {
    const m = C.lineup[C.mIdx];
    const enemyW = $('#enemy-wrap'), stage = $('#battle-stage');
    const er = enemyW.getBoundingClientRect(), sr = stage.getBoundingClientRect();
    if (m.boss) { FX.slowmo(360); FX.flash(C.zone.theme.accent + '88', 140); }
    enemyW.classList.add('enemy-die');
    Particles.burst(er.left - sr.left + er.width / 2, er.top - sr.top + er.height / 2, C.zone.theme.fog, m.boss ? 60 : 32, m.boss ? 10 : 7);
    Audio2.SFX.hurt();
    C.mIdx++;
    setTimeout(() => enterMonster(false), m.boss ? 1000 : 750);
  }

  function onWrong(val, btnEl) {
    C.combo = Math.floor(C.combo / 2);
    renderMyCombo();
    Net.send({ t: 'combo', n: C.combo });
    $('#battle-hero').innerHTML = Art.heroSVG({ tier: COMBO_TIERS.indexOf(comboTier(C.combo)) });
    if (btnEl) btnEl.classList.add('wrong-pick');
    if (C.q.input === 'choice') $$('.choice-btn').forEach(b => { if (b.dataset.v === String(C.q.answer)) b.classList.add('right'); });
    Audio2.SFX.wrong();
    Net.send({ t: 'wrong' });
    teamShieldDown(true);
    if (C.q.factId) C.requeue.push({ ...C.q });
    showTipCard(val);
  }

  function onTimeout() {
    if (!C || C.locked || !C.q || C.over) return;
    C.locked = true;
    Audio2.SFX.timeout();
    Adaptive.record(C.q, false, C.q.timeMs, C.session);
    C.answered++;
    onWrong('（超时）', null);
  }

  // 队伍护盾扣减（对称事件）
  function teamShieldDown(mine) {
    if (!C || C.over) return;
    C.teamShield--;
    renderTeamShield();
    const stage = $('#battle-stage');
    FX.shake(stage, 8, 260);
    Audio2.SFX.hurt();
    const heroW = mine ? $('#hero-wrap') : $('#partner-wrap');
    if (heroW) { heroW.classList.remove('hero-hurt'); void heroW.offsetWidth; heroW.classList.add('hero-hurt'); }
    const enemyW = $('#enemy-wrap');
    enemyW.classList.remove('enemy-attack'); void enemyW.offsetWidth; enemyW.classList.add('enemy-attack');
    if (C.teamShield <= 0) {
      C.over = true;
      clearTimeout(C.timer); clearTimeout(C.coyote);
      setTimeout(() => endBattle(false), mine ? 400 : 800); // 答错方稍先看到讲解卡的情形避免
    }
  }

  // 讲解卡（不阻塞伙伴）
  function showTipCard(val) {
    if (C.over) { // 护盾已破，直接结算
      $('#feedback-layer').classList.remove('show');
      return;
    }
    const q = C.q;
    const layer = $('#feedback-layer');
    layer.innerHTML = `
      <div class="tip-card">
        <div class="tip-head">✕ ${val === '（超时）' ? '时间到！' : '差一点！'}</div>
        <div class="tip-q">${q.text.replace('?', `<b class="tip-ans">${q.answer}</b>`)}</div>
        <div class="tip-hint">💡 ${q.tip || '再想一想！'}</div>
        <div class="tip-comfort">道友还在奋战，快回去帮忙！</div>
        <button class="btn btn-primary" id="tip-go-coop">记住了，继续！</button>
      </div>`;
    layer.classList.add('show');
    $('#tip-go-coop').addEventListener('click', () => {
      Audio2.SFX.tap();
      layer.classList.remove('show');
      layer.innerHTML = '';
      if (!C || C.over) return;
      setTimeout(() => nextQuestion(), 200);
    });
    // 8 秒自动继续（协作模式不宜久停）
    setTimeout(() => { if (layer.classList.contains('show')) $('#tip-go-coop')?.click(); }, 8000);
  }

  // ---------- 结算 ----------
  function endBattle(victory) {
    if (!C) return;
    C.over = true;
    clearTimeout(C.timer); clearTimeout(C.coyote);
    $('#feedback-layer').classList.remove('show');
    $('#feedback-layer').innerHTML = '';
    const acc = C.answered ? C.correct / C.answered : 0;
    const dur = Math.round((Date.now() - C.startTime) / 1000);
    const s = Store.get();
    let stars = 0;
    if (victory) {
      Audio2.SFX.victory();
      Particles.fountain(C.zone.theme.accent, 70);
      stars = acc >= 0.9 ? 3 : acc >= 0.75 ? 2 : 1;
      // 双修加成 20%
      C.xpGain = Math.round((C.xpGain + 16) * 1.2);
      C.stoneGain += 8;
    } else {
      Audio2.SFX.defeat();
      C.xpGain = Math.floor(C.xpGain / 2);
      C.stoneGain = Math.floor(C.stoneGain / 2);
    }
    s.totals.battles++;
    const oldLevel = s.level;
    s.xp += C.xpGain;
    s.stones += C.stoneGain;
    let leveled = false;
    while (s.level < MAX_LEVEL && s.xp >= xpForLevel(s.level)) {
      s.xp -= xpForLevel(s.level); s.level++; leveled = true;
    }
    Store.save();
    const bigBreak = leveled && Math.floor(s.level / 3) > Math.floor(oldLevel / 3);
    const zone = C.zone, myDmg = Math.round(C.myDmg * 10) / 10, maxCombo = C.maxCombo;
    const xp = C.xpGain, stones = C.stoneGain;
    C = null;
    $('#partner-wrap')?.remove();
    Net.leave();
    releaseWakeLock();
    Audio2.setMood('calm');
    UI.showResult({
      victory, stars, acc, dur, xp, stones, maxCombo,
      beastDrop: null, leveled, bigBreak,
      mode: 'coop', zone, chIdx: -1, isNewBest: false, coopDmg: myDmg,
    });
  }

  function flee() {
    if (!C) return;
    clearTimeout(C.timer); clearTimeout(C.coyote);
    C = null;
    $('#partner-wrap')?.remove();
    $('#feedback-layer').classList.remove('show');
    $('#feedback-layer').innerHTML = '';
    Net.leave();
    releaseWakeLock();
    Audio2.setMood('calm');
    UI.showScreen('home');
  }

  function active() { return !!C; }
  function leaveLobby() { Net.leave(); lobby = null; }

  return { open, onKey, flee, active, leaveLobby };
})();
