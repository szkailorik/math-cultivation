/* ============================================================
   灵数仙途 · UI 层
   路由 / 宗门 / 秘境地图 / 章节 / 结算 / 突破演出 / 图鉴 / 心魔殿 / 设置
   ============================================================ */

const UI = (() => {
  let current = 'boot';

  function showScreen(name) {
    $$('.screen').forEach(s => s.classList.remove('active'));
    $('#screen-' + name).classList.add('active');
    current = name;
    if (name === 'home') renderHome();
    if (name === 'map') renderMap();
    if (name === 'beasts') renderBeasts();
    if (name === 'demon') renderDemon();
    if (name === 'settings') renderSettings();
  }

  // ---------- 宗门主页 ----------
  function renderHome() {
    const s = Store.get();
    const r = realmOfLevel(s.level);
    $('#home-hero').innerHTML = Art.heroSVG({ tier: Math.min(5, Math.floor(s.level / 6)) });
    $('#home-bg').innerHTML = Art.bgSVG({ sky1: '#0b1024', sky2: '#1a2348', mid: '#2a3868', fog: '#8fa8e0', accent: '#7ea8f0' });
    $('#cult-realm-name').textContent = r.name;
    $('#cult-realm-name').style.color = r.color;
    const need = xpForLevel(s.level);
    const pct = s.level >= MAX_LEVEL ? 100 : Math.min(100, s.xp / need * 100);
    $('#cult-bar-fill').style.width = pct + '%';
    $('#cult-bar-fill').style.background = `linear-gradient(90deg, ${r.color}, ${r.aura})`;
    $('#cult-xp-text').textContent = s.level >= MAX_LEVEL ? '已至巅峰' : `修为 ${s.xp} / ${need}`;
    $('#home-stones').textContent = `💎 ${s.stones}`;
    $('#home-streak').textContent = `🔥 ${s.streakDays}天`;
    $('#home-realm-badge').innerHTML = `<span class="rb-dot" style="background:${r.color}"></span>${r.name}`;
    const acc = s.totals.answered ? Math.round(s.totals.correct / s.totals.answered * 100) : 0;
    const daily = $('#btn-daily .nav-desc');
    daily.textContent = s.daily.day === todayStr() && s.daily.done ? '今日已完成 ✓' : '限时十题';
    const wrongN = Object.keys(s.wrongList).length;
    $('#btn-demon .nav-desc').textContent = wrongN ? `${wrongN} 只心魔待斩` : '暂无心魔';
    $('#btn-beasts .nav-desc').textContent = `已收服 ${s.beasts.length}/${BEASTS.length}`;
  }

  // ---------- 秘境地图 ----------
  function renderMap() {
    const s = Store.get();
    $('#map-list').innerHTML = ZONES.map((z, i) => {
      const locked = s.level < z.unlockLevel;
      const prog = s.chapters[z.id] || [];
      const starSum = prog.reduce((a, c) => a + (c ? c.stars : 0), 0);
      const done = prog.filter(Boolean).length;
      const t = z.theme;
      return `
      <button class="zone-card ${locked ? 'locked' : ''}" data-zone="${z.id}"
        style="--z1:${t.sky1};--z2:${t.sky2};--za:${t.accent}">
        <div class="zone-ico">${z.icon}</div>
        <div class="zone-info">
          <div class="zone-name">${z.name} <span class="zone-mod">${z.module}</span></div>
          <div class="zone-desc">${z.desc}</div>
          <div class="zone-prog">${locked
            ? `🔒 ${realmOfLevel(z.unlockLevel).name}解锁`
            : `${done}/${CHAPTERS_PER_ZONE} 章 · ⭐${starSum}/${CHAPTERS_PER_ZONE * 3}`}</div>
        </div>
        <div class="zone-arrow">›</div>
      </button>`;
    }).join('');
    $$('.zone-card').forEach(c => c.addEventListener('click', () => {
      if (c.classList.contains('locked')) {
        const z = ZONES.find(z => z.id === c.dataset.zone);
        showToast(`需修为达到「${realmOfLevel(z.unlockLevel).name}」方可进入`);
        return;
      }
      Audio2.SFX.tap();
      renderChapters(c.dataset.zone);
      showScreen('chapters');
    }));
  }

  // ---------- 章节路径 ----------
  function renderChapters(zoneId) {
    const s = Store.get();
    const z = ZONES.find(z => z.id === zoneId);
    const t = z.theme;
    $('#chapters-title').textContent = `${z.icon} ${z.name} · ${z.module}`;
    $('#chapter-bg').innerHTML = Art.bgSVG(t);
    Particles.setAmbient(null);
    const prog = s.chapters[zoneId] || [];
    $('#chapter-path').innerHTML = Array.from({ length: CHAPTERS_PER_ZONE }, (_, i) => {
      const cfg = chapterConfig(ZONES.indexOf(z), i);
      const p = prog[i];
      const unlocked = i === 0 || (prog[i - 1] && prog[i - 1].stars >= 1);
      const stars = p ? p.stars : 0;
      return `
      <div class="ch-node-wrap ${i % 2 ? 'right' : 'left'}">
        ${i > 0 ? `<div class="ch-link ${unlocked ? 'on' : ''}"></div>` : ''}
        <button class="ch-node ${unlocked ? '' : 'locked'} ${cfg.isBoss ? 'boss' : ''} ${p ? 'cleared' : ''}"
          data-ch="${i}" style="--za:${t.accent}">
          <span class="ch-num">${cfg.isBoss ? '👹' : i + 1}</span>
          <span class="ch-name">${CHAPTER_NAMES[i]}</span>
          <span class="ch-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>
        </button>
      </div>`;
    }).join('');
    $$('.ch-node').forEach(n => n.addEventListener('click', () => {
      if (n.classList.contains('locked')) { showToast('先通关上一章（至少 1 星）'); return; }
      Audio2.SFX.tap();
      Battle.start(zoneId, parseInt(n.dataset.ch));
    }));
  }

  // ---------- 结算 ----------
  function showResult(r) {
    const card = $('#result-card');
    const zTheme = r.zone.theme;
    if (r.victory) {
      card.innerHTML = `
        <div class="result-inner win">
          <div class="result-title">${r.mode === 'daily' ? '晨课圆满' : r.mode === 'demon' ? '心魔已斩' : r.mode === 'coop' ? '双剑合璧' : '秘境肃清'}</div>
          <div class="result-stars">${[1, 2, 3].map(i =>
            `<span class="rstar ${i <= r.stars ? 'on' : ''}" style="animation-delay:${i * 0.25}s">★</span>`).join('')}</div>
          <div class="result-stats">
            <div class="rs-item"><span class="rs-v">${Math.round(r.acc * 100)}%</span><span class="rs-k">正确率</span></div>
            <div class="rs-item"><span class="rs-v">${r.maxCombo}</span><span class="rs-k">最高连击</span></div>
            ${r.mode === 'coop'
              ? `<div class="rs-item"><span class="rs-v">${r.coopDmg}</span><span class="rs-k">你的剑气</span></div>`
              : `<div class="rs-item"><span class="rs-v">${r.dur}s</span><span class="rs-k">用时</span></div>`}
          </div>
          <div class="result-gains">
            <span class="gain">⚡ 修为 +${r.xp}${r.mode === 'coop' ? '<small class="coop-bonus">双修加成</small>' : ''}</span>
            <span class="gain">💎 灵石 +${r.stones}</span>
          </div>
          ${r.beastDrop ? `
          <div class="beast-drop" style="--rc:${RARITY_META[r.beastDrop.rarity].color}">
            <div class="bd-fig">${Art.beastSVG(r.beastDrop)}</div>
            <div class="bd-txt"><b>收服灵兽！</b><br>${r.beastDrop.name} <span class="bd-r">${RARITY_META[r.beastDrop.rarity].name}</span></div>
          </div>` : ''}
          <div class="result-btns">
            <button class="btn btn-ghost" id="res-home">回宗门</button>
            ${r.mode === 'chapter' ? `<button class="btn btn-primary" id="res-next">继续闯关</button>` : `<button class="btn btn-primary" id="res-home2">太棒了！</button>`}
          </div>
        </div>`;
    } else {
      card.innerHTML = `
        <div class="result-inner lose">
          <div class="result-title lose-t">灵力耗尽…</div>
          <div class="lose-fig">💫</div>
          <p class="lose-msg">${COMFORTS[Math.floor(Math.random() * COMFORTS.length)]}<br>妖兽只是暂时得逞，修为不会白费！</p>
          <div class="result-gains">
            <span class="gain">⚡ 修为 +${r.xp}</span>
            <span class="gain">💎 灵石 +${r.stones}</span>
          </div>
          <div class="result-btns">
            <button class="btn btn-ghost" id="res-home">回宗门</button>
            ${r.mode === 'chapter' ? `<button class="btn btn-primary" id="res-retry">再战一次</button>` : ''}
          </div>
        </div>`;
    }
    showScreen('result');
    const after = () => {
      if (r.bigBreak) showBreakthrough(r);
      else if (r.leveled) { showToast(`✨ 修为精进：${realmOfLevel(Store.get().level).name}！`); showScreen('home'); }
      else showScreen('home');
    };
    $('#res-home')?.addEventListener('click', () => { Audio2.SFX.tap(); after(); });
    $('#res-home2')?.addEventListener('click', () => { Audio2.SFX.tap(); after(); });
    $('#res-retry')?.addEventListener('click', () => { Audio2.SFX.tap(); Battle.start(r.zone.id, r.chIdx); });
    $('#res-next')?.addEventListener('click', () => {
      Audio2.SFX.tap();
      if (r.bigBreak) { showBreakthrough(r, () => { renderChapters(r.zone.id); showScreen('chapters'); }); return; }
      renderChapters(r.zone.id);
      showScreen('chapters');
    });
  }

  // ---------- 渡劫突破演出 ----------
  function showBreakthrough(r, done) {
    const s = Store.get();
    const realm = realmOfLevel(s.level);
    const stage = $('#bt-stage');
    stage.innerHTML = `
      <div class="bt-clouds"></div>
      <div class="bt-lightning" id="bt-lightning"></div>
      <div class="bt-hero">${Art.heroSVG({ tier: 5 })}</div>
      <div class="bt-circle">${Art.spellCircleSVG(realm.aura)}</div>
      <div class="bt-text">
        <div class="bt-label">境 界 突 破</div>
        <div class="bt-realm" style="color:${realm.color};text-shadow:0 0 30px ${realm.aura}">${realm.name}</div>
      </div>
      <button class="btn btn-primary bt-btn hidden" id="bt-continue">突破成功！</button>`;
    showScreen('breakthrough');
    Audio2.SFX.thunder();
    FX.shake($('#bt-stage'), 10, 500);
    setTimeout(() => { FX.flash('#ffffff', 100); Audio2.SFX.thunder(); FX.shake($('#bt-stage'), 14, 600); }, 900);
    setTimeout(() => { FX.flash(realm.aura, 150); Audio2.SFX.levelup(); Particles.fountain(realm.color, 100); }, 1800);
    setTimeout(() => $('#bt-continue').classList.remove('hidden'), 2600);
    $('#bt-continue').addEventListener('click', () => {
      Audio2.SFX.tap();
      done ? done() : showScreen('home');
    });
  }

  // ---------- 灵兽图鉴 ----------
  function renderBeasts() {
    const s = Store.get();
    $('#beasts-count').textContent = `${s.beasts.length}/${BEASTS.length}`;
    $('#beasts-grid').innerHTML = BEASTS.map(b => {
      const owned = s.beasts.includes(b.id);
      const rm = RARITY_META[b.rarity];
      const zone = ZONES.find(z => z.id === b.zone);
      return `
      <div class="beast-card ${owned ? 'owned' : 'unowned'}" style="--rc:${rm.color}" data-beast="${b.id}">
        <div class="beast-r" style="color:${rm.color}">${b.rarity}</div>
        <div class="beast-fig-wrap">${Art.beastSVG(b)}</div>
        <div class="beast-name">${owned ? b.name : '？？？'}</div>
        <div class="beast-zone">${zone.icon} ${zone.name}</div>
      </div>`;
    }).join('');
    $$('.beast-card').forEach(c => c.addEventListener('click', () => {
      const b = BEASTS.find(x => x.id === c.dataset.beast);
      const owned = s.beasts.includes(b.id);
      const rm = RARITY_META[b.rarity];
      const zone = ZONES.find(z => z.id === b.zone);
      openModal(`
        <div class="beast-detail" style="--rc:${rm.color}">
          <div class="bd-fig-lg">${Art.beastSVG(b)}</div>
          <h3>${owned ? b.name : '未知灵兽'} <span class="bd-r">${rm.name}</span></h3>
          <p>${owned ? b.desc : getBeastHint(b, zone)}</p>
        </div>`);
    }));
  }
  function getBeastHint(b, zone) {
    const i = BEASTS.filter(x => x.zone === b.zone).indexOf(b);
    return i === 0 ? `通关 ${zone.name} 第三章「妖王现」即可收服`
      : i === 1 ? `通关 ${zone.name} 第六章「镇魔」即可收服`
      : `${zone.name} 全六章达成 ⭐⭐⭐ 方可收服`;
  }

  // ---------- 心魔殿 ----------
  function renderDemon() {
    const s = Store.get();
    const wrongs = Object.entries(s.wrongList).sort((a, b) => b[1].count - a[1].count);
    $('#demon-body').innerHTML = wrongs.length ? `
      <p class="demon-intro">每道错题都会凝成一只心魔。斩尽心魔（同一题连对两次），数道才算圆满。</p>
      <button class="btn btn-primary btn-xl" id="btn-demon-fight">⚔️ 斩心魔（${Math.min(8, wrongs.length)} 题）</button>
      <div class="demon-list">${wrongs.map(([fid, w]) => {
        const z = ZONES.find(z => z.id === w.zone);
        return `<div class="demon-item">
          <span class="di-q">${w.sample}</span>
          <span class="di-meta">${z ? z.icon : ''} 错 ${w.count} 次</span>
        </div>`;
      }).join('')}</div>` : `
      <div class="demon-empty">
        <div class="de-fig">🏮</div>
        <p>心魔殿空空如也。<br>你的数道之心，澄澈如明镜！</p>
      </div>`;
    $('#btn-demon-fight')?.addEventListener('click', () => { Audio2.SFX.tap(); Battle.startDemon(); });
  }

  // ---------- 设置 ----------
  function renderSettings() {
    const s = Store.get();
    $('#settings-body').innerHTML = `
      <div class="set-group">
        ${setRow('sound', '⚔️ 音效', s.settings.sound)}
        ${setRow('music', '🎵 背景音乐', s.settings.music)}
        ${setRow('reducedFx', '🍃 减弱特效（低性能设备）', s.settings.reducedFx)}
      </div>
      <div class="set-stats">
        <h3>修行统计</h3>
        <p>累计答题 ${s.totals.answered} · 正确 ${s.totals.correct} · 战斗 ${s.totals.battles} 场 · 妖王 ${s.totals.bossKills} 只</p>
      </div>
      <button class="btn btn-danger" id="btn-reset">重置所有存档</button>
      <p class="set-ver">灵数仙途 v1.0 · 数道即仙道</p>`;
    $$('.set-toggle').forEach(t => t.addEventListener('click', () => {
      const k = t.dataset.k;
      const s2 = Store.get();
      s2.settings[k] = !s2.settings[k];
      Store.save();
      t.classList.toggle('on', s2.settings[k]);
      if (k === 'music') { s2.settings.music ? Audio2.startMusic() : Audio2.stopMusic(); }
      Audio2.SFX.tap();
    }));
    $('#btn-reset').addEventListener('click', () => {
      openModal(`
        <div class="confirm-reset">
          <h3>⚠️ 确定重置？</h3>
          <p>所有修为、星级、灵兽都会消失，无法恢复。</p>
          <div class="result-btns">
            <button class="btn btn-ghost" id="reset-no">取消</button>
            <button class="btn btn-danger" id="reset-yes">确定重置</button>
          </div>
        </div>`);
      $('#reset-yes').addEventListener('click', () => { Store.reset(); closeModal(); showScreen('home'); showToast('已重置，仙途重启！'); });
      $('#reset-no').addEventListener('click', closeModal);
    });
  }
  function setRow(k, label, on) {
    return `<div class="set-row"><span>${label}</span>
      <button class="set-toggle ${on ? 'on' : ''}" data-k="${k}"><span class="st-knob"></span></button></div>`;
  }

  // ---------- 弹层 ----------
  function openModal(html) {
    const m = $('#modal-layer');
    m.innerHTML = `<div class="modal-card">${html}<button class="modal-x" id="modal-close">✕</button></div>`;
    m.classList.remove('hidden');
    $('#modal-close').addEventListener('click', closeModal);
    m.addEventListener('click', e => { if (e.target === m) closeModal(); });
  }
  function closeModal() { $('#modal-layer').classList.add('hidden'); $('#modal-layer').innerHTML = ''; }

  return { showScreen, showResult, renderChapters, showBreakthrough, openModal, closeModal };
})();
