/* ============================================================
   灵数仙途 · 启动
   ============================================================ */

(function boot() {
  Store.load();

  // 启动页主角
  $('#boot-hero').innerHTML = Art.heroSVG({ tier: 2 });

  $('#btn-start').addEventListener('click', () => {
    Audio2.SFX.tap();
    Audio2.startMusic('calm');
    UI.showScreen('home');
  });

  // 主页导航
  $('#btn-adventure').addEventListener('click', () => { Audio2.SFX.tap(); UI.showScreen('map'); });
  $('#btn-daily').addEventListener('click', () => {
    const s = Store.get();
    if (s.daily.day === todayStr() && s.daily.done) { showToast('今日晨课已完成，明天再来！'); return; }
    Audio2.SFX.tap();
    Battle.startDaily();
  });
  $('#btn-demon').addEventListener('click', () => { Audio2.SFX.tap(); UI.showScreen('demon'); });
  $('#btn-beasts').addEventListener('click', () => { Audio2.SFX.tap(); UI.showScreen('beasts'); });
  $('#btn-coop').addEventListener('click', () => {
    if (!window.Net) { showToast('联机模块加载中，稍等片刻…'); return; }
    Audio2.SFX.tap();
    Coop.open();
  });
  $('#btn-coop-back').addEventListener('click', () => { Audio2.SFX.tap(); Coop.leaveLobby(); UI.showScreen('home'); });
  $('#btn-settings').addEventListener('click', () => { Audio2.SFX.tap(); UI.showScreen('settings'); });

  // 返回按钮
  $$('.btn-back').forEach(b => b.addEventListener('click', () => { Audio2.SFX.tap(); UI.showScreen(b.dataset.back); }));

  // 战斗逃跑（确认）
  $('#btn-flee').addEventListener('click', () => {
    UI.openModal(`
      <div class="confirm-reset">
        <h3>要撤退吗？</h3>
        <p>本次战斗的进度会丢失哦。</p>
        <div class="result-btns">
          <button class="btn btn-ghost" id="flee-no">继续战斗</button>
          <button class="btn btn-danger" id="flee-yes">撤退</button>
        </div>
      </div>`);
    $('#flee-yes').addEventListener('click', () => { UI.closeModal(); Coop.active() ? Coop.flee() : Battle.flee(); });
    $('#flee-no').addEventListener('click', UI.closeModal);
  });

  // 键盘
  window.addEventListener('keydown', e => { Coop.active() ? Coop.onKey(e) : Battle.onKey(e); });

  // 防误缩放（iPad）
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });

  // PWA
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
