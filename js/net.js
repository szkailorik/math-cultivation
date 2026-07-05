/* ============================================================
   灵数仙途 · 联机传输层（Trystero @ Nostr 多中继信令，WebRTC P2P）
   - 无自建服务器：信令走公共 Nostr relay（多中继冗余）
   - 两台设备同 WiFi 时数据直连本地网络，低延迟；跨网亦可
   - 房间号 = 4 位灵咒数字
   ============================================================ */

import { joinRoom, selfId } from '../vendor/trystero.mjs?v=0.25.2';

const APP_ID = 'lingshu-xiantu-coop-v1';

let room = null, sendMsg = null, cbs = {}, partnerId = null;

function cleanup() {
  try { room && room.leave(); } catch (e) {}
  room = null; sendMsg = null; partnerId = null;
}

function enterRoom(code, callbacks) {
  cbs = callbacks || {};
  cleanup();
  room = joinRoom({ appId: APP_ID, password: 'ls-' + code }, 'r' + code);
  const act = room.makeAction('m', {
    onMessage: d => {
      if (d && typeof d === 'object') (cbs.onMessage || (() => {}))(d);
    },
  });
  sendMsg = act.send;
  room.onPeerJoin = id => {
    if (partnerId) return; // 只结伴一位道友
    partnerId = id;
    (cbs.onPeerJoined || (() => {}))();
  };
  room.onPeerLeave = id => {
    if (id !== partnerId) return;
    partnerId = null;
    (cbs.onPeerLeft || (() => {}))();
  };
}

// 开坛（主机）：立即返回灵咒，等待道友
function host(callbacks) {
  const code = String(1000 + Math.floor(Math.random() * 9000));
  enterRoom(code, callbacks);
  return Promise.resolve(code);
}

// 加入（客机）：等到与主机牵手才算成功
function join(code, callbacks) {
  return new Promise((resolve, reject) => {
    const userJoined = callbacks && callbacks.onPeerJoined;
    let settled = false;
    enterRoom(code, {
      ...callbacks,
      onPeerJoined() {
        if (!settled) { settled = true; resolve(); }
        userJoined && userJoined();
      },
    });
    setTimeout(() => {
      if (!settled) { settled = true; cleanup(); reject(new Error('join-timeout')); }
    }, 15000);
  });
}

function send(obj) { try { sendMsg && sendMsg(obj); } catch (e) {} }
function leave() { cleanup(); }
function isAlive() { return !!partnerId; }

window.Net = { host, join, send, leave, isAlive };
