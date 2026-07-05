/* ============================================================
   灵数仙途 · SVG 美术工厂
   分层动漫主角（呼吸/眨眼/发丝飘动）· 妖兽生成器 · 视差背景
   ============================================================ */

const Art = (() => {

  // ---------- 主角：小修士立绘（分层，伪 Live2D） ----------
  // tier: 连击阶段 0-5，影响光环
  let _huid = 0;
  function heroSVG(opts = {}) {
    const { tier = 0, size = 'lg' } = opts;
    const auraColors = ['none', '#7ec8a955', '#8fe8e066', '#70b8f077', '#c98fe888', '#ffd75e99'];
    const aura = auraColors[Math.min(tier, 5)];
    const u = 'hu' + (_huid++);
    return `
<svg class="hero-fig ${size}" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hRobe_${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eef4ff"/><stop offset="0.55" stop-color="#cfe0f5"/><stop offset="1" stop-color="#9db8dd"/>
    </linearGradient>
    <linearGradient id="hRobeIn_${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a7fc0"/><stop offset="1" stop-color="#3a5a95"/>
    </linearGradient>
    <linearGradient id="hHair_${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3d3a52"/><stop offset="1" stop-color="#211f30"/>
    </linearGradient>
    <linearGradient id="hSash_${u}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#e8b84a"/><stop offset="1" stop-color="#d09a30"/>
    </linearGradient>
    <linearGradient id="hBlade_${u}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eaf6ff"/><stop offset="0.5" stop-color="#bcd8f0"/><stop offset="1" stop-color="#8fb8dd"/>
    </linearGradient>
    <radialGradient id="hAura_${u}" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${aura === 'none' ? 'transparent' : aura}"/><stop offset="1" stop-color="transparent"/>
    </radialGradient>
    <filter id="hGlow_${u}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <ellipse class="h-aura" cx="110" cy="160" rx="105" ry="130" fill="url(#hAura_${u})"/>
  <ellipse cx="110" cy="282" rx="58" ry="10" fill="#00000033"/>

  <!-- 飞剑（背后） -->
  <g class="h-sword">
    <rect x="163" y="60" width="9" height="150" rx="4.5" fill="url(#hBlade_${u})" stroke="#7a9cc0" stroke-width="1.5" filter="url(#hGlow_${u})"/>
    <path d="M167.5 46 L175 62 L160 62 Z" fill="url(#hBlade_${u})" stroke="#7a9cc0" stroke-width="1.5"/>
    <rect x="156" y="208" width="23" height="8" rx="4" fill="url(#hSash_${u})"/>
    <rect x="163.5" y="216" width="8" height="20" rx="4" fill="#8a5a2a"/>
    <circle cx="167.5" cy="240" r="4" fill="#e8b84a"/>
  </g>

  <!-- 后发 -->
  <g class="h-hairback">
    <path d="M60 96 Q50 150 58 196 Q66 210 74 196 Q70 150 74 110 Z" fill="url(#hHair_${u})"/>
    <path d="M160 96 Q170 150 162 196 Q154 210 146 196 Q150 150 146 110 Z" fill="url(#hHair_${u})"/>
  </g>

  <!-- 身体（呼吸层） -->
  <g class="h-body">
    <!-- 袍 -->
    <path d="M74 168 Q68 200 60 262 Q60 274 78 276 L142 276 Q160 274 160 262 Q152 200 146 168 Q128 150 110 150 Q92 150 74 168 Z" fill="url(#hRobe_${u})" stroke="#8aa8cc" stroke-width="2"/>
    <!-- 内襟 -->
    <path d="M110 152 L96 176 L110 236 L124 176 Z" fill="url(#hRobeIn_${u})"/>
    <path d="M110 152 L98 174 L110 180 L122 174 Z" fill="#fff" opacity="0.9"/>
    <!-- 袖子 -->
    <g class="h-sleeve-l"><path d="M78 168 Q52 184 44 216 Q42 228 54 228 Q74 224 84 204 Q88 184 84 170 Z" fill="url(#hRobe_${u})" stroke="#8aa8cc" stroke-width="2"/></g>
    <g class="h-sleeve-r"><path d="M142 168 Q168 184 176 216 Q178 228 166 228 Q146 224 136 204 Q132 184 136 170 Z" fill="url(#hRobe_${u})" stroke="#8aa8cc" stroke-width="2"/></g>
    <!-- 腰带 -->
    <path d="M84 206 Q110 214 136 206 L136 218 Q110 226 84 218 Z" fill="url(#hSash_${u})" stroke="#b8862a" stroke-width="1.5"/>
    <circle cx="110" cy="212" r="5.5" fill="#fff" stroke="#b8862a" stroke-width="1.5"/>
    <!-- 玉佩 -->
    <path d="M110 218 L110 232" stroke="#b8862a" stroke-width="2"/>
    <circle cx="110" cy="238" r="6" fill="#8fe8c0" stroke="#5aa880" stroke-width="1.5"/>
  </g>

  <!-- 头（含微摆动画层） -->
  <g class="h-head">
    <!-- 脖子 -->
    <rect x="102" y="138" width="16" height="18" rx="7" fill="#ffe3cc"/>
    <!-- 脸 -->
    <path d="M66 84 Q64 138 92 148 Q110 154 128 148 Q156 138 154 84 Q152 44 110 42 Q68 44 66 84 Z" fill="#ffe9d6"/>
    <path d="M66 84 Q64 138 92 148 Q110 154 128 148 L128 150 Q110 156 90 150 Q62 138 66 84 Z" fill="#f0c8a8" opacity="0.5"/>
    <!-- 腮红 -->
    <ellipse cx="82" cy="116" rx="9" ry="5" fill="#ffb0a0" opacity="0.55"/>
    <ellipse cx="138" cy="116" rx="9" ry="5" fill="#ffb0a0" opacity="0.55"/>
    <!-- 眉 -->
    <path class="h-brow" d="M76 88 Q86 82 96 87" stroke="#3d3a52" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path class="h-brow" d="M124 87 Q134 82 144 88" stroke="#3d3a52" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- 眼（眨眼层） -->
    <g class="h-eyes">
      <g class="h-eye">
        <ellipse cx="87" cy="102" rx="11" ry="13" fill="#fff"/>
        <ellipse cx="87" cy="103" rx="8.5" ry="11" fill="#4a6a9a"/>
        <ellipse cx="87" cy="104" rx="5" ry="7" fill="#1d2a45"/>
        <circle cx="90" cy="98" r="3.4" fill="#fff"/>
        <circle cx="84" cy="108" r="1.6" fill="#ffffffaa"/>
        <path d="M75 94 Q87 86 99 94" stroke="#2a2740" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      </g>
      <g class="h-eye">
        <ellipse cx="133" cy="102" rx="11" ry="13" fill="#fff"/>
        <ellipse cx="133" cy="103" rx="8.5" ry="11" fill="#4a6a9a"/>
        <ellipse cx="133" cy="104" rx="5" ry="7" fill="#1d2a45"/>
        <circle cx="136" cy="98" r="3.4" fill="#fff"/>
        <circle cx="130" cy="108" r="1.6" fill="#ffffffaa"/>
        <path d="M121 94 Q133 86 145 94" stroke="#2a2740" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      </g>
    </g>
    <g class="h-eyelids"><rect x="70" y="86" width="34" height="0.1" rx="2" fill="#ffe9d6"/><rect x="116" y="86" width="34" height="0.1" rx="2" fill="#ffe9d6"/></g>
    <!-- 鼻嘴 -->
    <path d="M109 118 Q111 121 109 123" stroke="#d09a80" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path class="h-mouth" d="M102 132 Q110 138 118 132" stroke="#c06a5a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- 前发 -->
    <g class="h-hairfront">
      <path d="M62 92 Q56 40 96 30 Q110 26 124 30 Q164 40 158 92 Q156 74 148 66 Q152 84 144 78 Q146 60 132 52 Q138 66 128 62 Q126 46 110 44 Q94 46 92 62 Q82 66 88 52 Q74 60 76 78 Q68 84 72 66 Q64 74 62 92 Z" fill="url(#hHair_${u})"/>
      <path class="h-bang" d="M96 34 Q104 52 98 70 Q92 60 90 48 Z" fill="#4d4a66"/>
      <path class="h-bang b2" d="M124 34 Q116 52 122 70 Q128 60 130 48 Z" fill="#4d4a66"/>
      <!-- 发髻与簪 -->
      <ellipse cx="110" cy="26" rx="16" ry="12" fill="url(#hHair_${u})"/>
      <path d="M92 26 L74 18" stroke="#e8b84a" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="72" cy="17" r="4" fill="#8fe8c0" stroke="#5aa880" stroke-width="1.5"/>
      <path d="M96 20 Q110 12 124 20" stroke="#e8b84a" stroke-width="3" fill="none"/>
    </g>
  </g>
</svg>`;
  }

  // ---------- 妖兽生成器 ----------
  // 通用组件：大眼、嘴、身体形状，按 hue 上色
  function pal(hue, boss) {
    const s = boss ? 62 : 55;
    return {
      body: `hsl(${hue},${s}%,52%)`, bodyD: `hsl(${hue},${s + 5}%,36%)`, bodyL: `hsl(${hue},${s}%,68%)`,
      belly: `hsl(${hue},45%,78%)`, line: `hsl(${hue},60%,22%)`, glow: `hsl(${hue},90%,65%)`,
    };
  }
  function eyes(x1, x2, y, r, p, angry) {
    const browY = y - r - 4;
    const brows = angry
      ? `<path d="M${x1 - r} ${browY + 6} L${x1 + r * 0.8} ${browY - 2}" stroke="${p.line}" stroke-width="4" stroke-linecap="round"/>
         <path d="M${x2 + r} ${browY + 6} L${x2 - r * 0.8} ${browY - 2}" stroke="${p.line}" stroke-width="4" stroke-linecap="round"/>` : '';
    const one = (cx) => `
      <g class="m-eye">
        <ellipse cx="${cx}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="#fff"/>
        <ellipse class="m-pupil" cx="${cx}" cy="${y + 1}" rx="${r * 0.62}" ry="${r * 0.8}" fill="${p.line}"/>
        <circle cx="${cx + r * 0.25}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="#fff"/>
      </g>`;
    return brows + one(x1) + one(x2);
  }

  const MDRAW = {
    sprite(p) { // 小精怪：圆脑袋+小身子+叶/角
      return `
      <g class="m-bob">
        <ellipse cx="100" cy="172" rx="42" ry="8" fill="#00000030"/>
        <path d="M100 60 Q60 62 56 108 Q54 150 100 154 Q146 150 144 108 Q140 62 100 60 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <path d="M74 140 Q100 158 126 140 Q124 166 100 168 Q76 166 74 140 Z" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <ellipse cx="100" cy="120" rx="26" ry="18" fill="${p.belly}" opacity="0.8"/>
        <path d="M84 58 Q78 34 96 28 Q92 48 98 58 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/>
        <path d="M116 58 Q122 34 104 28 Q108 48 102 58 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/>
        ${eyes(82, 118, 100, 11, p)}
        <path class="m-mouth" d="M92 128 Q100 134 108 128" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>`;
    },
    slime(p) { // 果冻灵体
      return `
      <g class="m-bob">
        <ellipse cx="100" cy="170" rx="48" ry="9" fill="#00000030"/>
        <path class="m-jelly" d="M100 52 Q46 56 44 118 Q44 162 100 164 Q156 162 156 118 Q154 56 100 52 Z" fill="${p.body}" opacity="0.88" stroke="${p.line}" stroke-width="3"/>
        <path d="M64 78 Q56 96 58 116" stroke="#ffffff88" stroke-width="6" fill="none" stroke-linecap="round"/>
        ${eyes(80, 120, 104, 12, p)}
        <path class="m-mouth" d="M90 132 Q100 140 110 132" stroke="${p.line}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <circle cx="140" cy="80" r="7" fill="${p.bodyL}" opacity="0.7"/>
        <circle cx="60" cy="64" r="5" fill="${p.bodyL}" opacity="0.7"/>
      </g>`;
    },
    toad(p) {
      return `
      <g class="m-bob">
        <ellipse cx="100" cy="172" rx="52" ry="9" fill="#00000030"/>
        <path d="M100 70 Q48 72 44 128 Q42 160 74 164 L126 164 Q158 160 156 128 Q152 72 100 70 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <ellipse cx="100" cy="138" rx="34" ry="20" fill="${p.belly}"/>
        <circle cx="70" cy="66" r="17" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <circle cx="130" cy="66" r="17" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        ${eyes(70, 130, 64, 9, p)}
        <path class="m-mouth" d="M78 108 Q100 122 122 108" stroke="${p.line}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="58" cy="160" rx="14" ry="8" fill="${p.bodyD}" stroke="${p.line}" stroke-width="2.5"/>
        <ellipse cx="142" cy="160" rx="14" ry="8" fill="${p.bodyD}" stroke="${p.line}" stroke-width="2.5"/>
        <circle cx="86" cy="88" r="4" fill="${p.bodyD}"/><circle cx="114" cy="86" r="3" fill="${p.bodyD}"/>
      </g>`;
    },
    vine(p) {
      return `
      <g class="m-bob">
        <ellipse cx="100" cy="176" rx="40" ry="8" fill="#00000030"/>
        <path class="m-tail" d="M100 170 Q70 150 76 116 Q60 120 56 100" stroke="${p.bodyD}" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path class="m-tail t2" d="M100 170 Q130 150 124 116 Q140 120 144 100" stroke="${p.bodyD}" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M100 44 Q64 48 62 96 Q60 140 100 144 Q140 140 138 96 Q136 48 100 44 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <path d="M100 44 Q92 24 108 16 Q106 34 112 44 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/>
        ${eyes(84, 116, 90, 10, p)}
        <path class="m-mouth" d="M92 116 Q100 122 108 116" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M62 96 Q46 90 40 76" stroke="${p.body}" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M138 96 Q154 90 160 76" stroke="${p.body}" stroke-width="7" fill="none" stroke-linecap="round"/>
      </g>`;
    },
    scorpion(p) {
      return `
      <g class="m-bob">
        <ellipse cx="100" cy="172" rx="52" ry="9" fill="#00000030"/>
        <path class="m-tail" d="M148 130 Q176 110 168 78 Q164 62 150 58" stroke="${p.bodyD}" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M150 58 L138 46 L156 44 Z" fill="${p.bodyD}" stroke="${p.line}" stroke-width="2.5"/>
        <ellipse cx="96" cy="128" rx="52" ry="38" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <path d="M56 108 Q66 96 96 94 Q126 96 136 108" stroke="${p.line}" stroke-width="2.5" fill="none"/>
        <path d="M50 122 Q40 108 28 108 Q40 96 54 104" fill="${p.bodyD}" stroke="${p.line}" stroke-width="2.5"/>
        ${eyes(80, 116, 118, 10, p, true)}
        <path class="m-mouth" d="M88 146 Q98 152 108 146" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M60 160 L48 170 M84 166 L78 176 M112 166 L118 176 M136 158 L148 168" stroke="${p.bodyD}" stroke-width="6" stroke-linecap="round"/>
      </g>`;
    },
    mirage(p) {
      return `
      <g class="m-bob m-ghost">
        <path d="M100 42 Q58 46 56 100 Q54 138 66 158 Q74 148 82 160 Q90 148 100 162 Q110 148 118 160 Q126 148 134 158 Q146 138 144 100 Q142 46 100 42 Z" fill="${p.body}" opacity="0.82" stroke="${p.line}" stroke-width="3"/>
        ${eyes(82, 118, 92, 11, p)}
        <path class="m-mouth" d="M90 122 Q100 130 110 122" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="100" cy="20" r="8" fill="${p.glow}" opacity="0.8"><animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/></circle>
      </g>`;
    },
    bird(p) {
      return `
      <g class="m-bob">
        <ellipse cx="100" cy="170" rx="38" ry="8" fill="#00000030"/>
        <g class="m-wing"><path d="M56 100 Q26 84 18 56 Q46 66 62 88 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/></g>
        <g class="m-wing w2"><path d="M144 100 Q174 84 182 56 Q154 66 138 88 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/></g>
        <path d="M100 52 Q60 56 58 106 Q56 148 100 152 Q144 148 142 106 Q140 56 100 52 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <ellipse cx="100" cy="126" rx="24" ry="16" fill="${p.belly}"/>
        <path d="M100 96 L88 106 L100 112 L112 106 Z" fill="#f0a030" stroke="${p.line}" stroke-width="2.5"/>
        ${eyes(80, 120, 86, 10, p)}
        <path d="M88 40 Q94 26 102 38 Q108 24 116 40" stroke="${p.bodyD}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M84 152 L80 164 M116 152 L120 164" stroke="#f0a030" stroke-width="5" stroke-linecap="round"/>
      </g>`;
    },
    fox(p) {
      return `
      <g class="m-bob">
        <ellipse cx="100" cy="172" rx="46" ry="9" fill="#00000030"/>
        <path class="m-tail" d="M140 140 Q176 130 180 96 Q184 70 166 60 Q170 84 156 96 Q160 76 148 70 Q150 96 136 110 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/>
        <path d="M100 58 Q58 62 56 110 Q54 152 100 156 Q146 152 144 110 Q142 62 100 58 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <path d="M70 60 L56 24 L88 44 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <path d="M130 60 L144 24 L112 44 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <path d="M72 54 L62 32 L84 46 Z" fill="${p.belly}"/>
        <path d="M128 54 L138 32 L116 46 Z" fill="${p.belly}"/>
        <path d="M100 156 Q78 150 74 128 Q88 140 100 140 Q112 140 126 128 Q122 150 100 156 Z" fill="${p.belly}"/>
        ${eyes(82, 118, 96, 10, p)}
        <ellipse cx="100" cy="118" rx="5" ry="4" fill="${p.line}"/>
        <path class="m-mouth" d="M92 128 Q100 134 108 128" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>`;
    },
    golem(p) {
      return `
      <g class="m-bob">
        <ellipse cx="100" cy="176" rx="54" ry="9" fill="#00000030"/>
        <rect x="52" y="60" width="96" height="92" rx="20" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <rect x="66" y="74" width="68" height="40" rx="10" fill="${p.bodyD}"/>
        ${eyes(84, 116, 94, 9, p, true)}
        <rect x="88" y="122" width="24" height="7" rx="3.5" fill="${p.line}"/>
        <circle class="m-core" cx="100" cy="150" r="9" fill="${p.glow}"><animate attributeName="r" values="9;11;9" dur="1.6s" repeatCount="indefinite"/></circle>
        <rect x="30" y="92" width="20" height="44" rx="10" fill="${p.bodyD}" stroke="${p.line}" stroke-width="2.5"/>
        <rect x="150" y="92" width="20" height="44" rx="10" fill="${p.bodyD}" stroke="${p.line}" stroke-width="2.5"/>
        <rect x="62" y="152" width="26" height="22" rx="8" fill="${p.bodyD}" stroke="${p.line}" stroke-width="2.5"/>
        <rect x="112" y="152" width="26" height="22" rx="8" fill="${p.bodyD}" stroke="${p.line}" stroke-width="2.5"/>
        <path d="M64 52 L74 38 M136 52 L126 38" stroke="${p.line}" stroke-width="5" stroke-linecap="round"/>
      </g>`;
    },
    fish(p) {
      return `
      <g class="m-bob m-swim">
        <path class="m-tail" d="M150 108 Q176 88 184 66 Q186 100 178 112 Q186 124 184 150 Q176 128 150 112 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/>
        <path d="M100 58 Q46 66 42 108 Q46 150 100 158 Q140 152 152 110 Q140 64 100 58 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <path d="M70 64 Q78 44 96 42 Q90 56 92 64 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/>
        <path d="M60 84 Q84 78 108 84 M56 104 Q84 98 112 104 M60 124 Q84 120 108 124" stroke="${p.bodyD}" stroke-width="2.5" fill="none" opacity="0.7"/>
        ${eyes(74, 108, 96, 10, p)}
        <path class="m-mouth" d="M84 126 Q92 132 100 126" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="150" cy="70" r="5" fill="${p.glow}" opacity="0.6"/>
        <circle cx="162" cy="52" r="3.5" fill="${p.glow}" opacity="0.5"/>
      </g>`;
    },
    turtle(p) {
      return `
      <g class="m-bob">
        <ellipse cx="100" cy="172" rx="54" ry="9" fill="#00000030"/>
        <ellipse cx="100" cy="120" rx="56" ry="44" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <path d="M70 100 L100 84 L130 100 L130 134 L100 150 L70 134 Z" fill="${p.body}" stroke="${p.line}" stroke-width="2.5"/>
        <path d="M70 100 L100 116 L130 100 M100 116 L100 150" stroke="${p.line}" stroke-width="2.5" fill="none"/>
        <circle cx="100" cy="66" r="24" fill="${p.bodyL}" stroke="${p.line}" stroke-width="3"/>
        ${eyes(90, 110, 62, 7, p)}
        <path class="m-mouth" d="M94 78 Q100 82 106 78" stroke="${p.line}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <ellipse cx="52" cy="152" rx="13" ry="9" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/>
        <ellipse cx="148" cy="152" rx="13" ry="9" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/>
        <path d="M92 44 Q100 32 108 44" stroke="${p.line}" stroke-width="3" fill="none"/>
      </g>`;
    },
    butterfly(p) {
      return `
      <g class="m-bob">
        <g class="m-wing"><path d="M96 90 Q56 46 28 58 Q20 92 60 108 Q40 116 44 140 Q72 148 94 116 Z" fill="${p.bodyL}" opacity="0.9" stroke="${p.line}" stroke-width="2.5"/>
        <circle cx="52" cy="78" r="8" fill="${p.glow}" opacity="0.7"/><circle cx="58" cy="124" r="5" fill="${p.glow}" opacity="0.7"/></g>
        <g class="m-wing w2"><path d="M104 90 Q144 46 172 58 Q180 92 140 108 Q160 116 156 140 Q128 148 106 116 Z" fill="${p.bodyL}" opacity="0.9" stroke="${p.line}" stroke-width="2.5"/>
        <circle cx="148" cy="78" r="8" fill="${p.glow}" opacity="0.7"/><circle cx="142" cy="124" r="5" fill="${p.glow}" opacity="0.7"/></g>
        <ellipse cx="100" cy="108" rx="14" ry="34" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        <circle cx="100" cy="70" r="15" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>
        ${eyes(94, 106, 68, 5.5, p)}
        <path d="M92 58 Q84 44 76 42 M108 58 Q116 44 124 42" stroke="${p.line}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </g>`;
    },
    // ---------- BOSS ----------
    boss_bamboo(p) {
      return `
      <g class="m-bob m-boss">
        <ellipse cx="100" cy="182" rx="64" ry="10" fill="#00000038"/>
        <rect x="62" y="48" width="76" height="120" rx="26" fill="${p.body}" stroke="${p.line}" stroke-width="3.5"/>
        <path d="M62 84 L138 84 M62 122 L138 122" stroke="${p.bodyD}" stroke-width="5"/>
        <path d="M62 48 Q48 20 74 12 Q70 34 82 46 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="3"/>
        <path d="M138 48 Q152 20 126 12 Q130 34 118 46 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="3"/>
        <path d="M40 96 Q22 86 16 66 Q38 70 50 86 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="3"/>
        <path d="M160 96 Q178 86 184 66 Q162 70 150 86 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="3"/>
        ${eyes(82, 118, 100, 12, p, true)}
        <path class="m-mouth" d="M84 140 Q100 132 116 140" stroke="${p.line}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M74 140 L80 150 M126 140 L120 150" stroke="${p.line}" stroke-width="4" stroke-linecap="round"/>
        <rect x="74" y="160" width="52" height="10" rx="5" fill="${p.bodyD}"/>
      </g>`;
    },
    boss_shadow(p) {
      return `
      <g class="m-bob m-boss m-ghost">
        <path d="M100 26 Q40 34 36 104 Q34 150 54 172 Q64 158 72 174 Q82 160 92 178 Q100 164 108 178 Q118 160 128 174 Q136 158 146 172 Q166 150 164 104 Q160 34 100 26 Z" fill="${p.bodyD}" opacity="0.92" stroke="${p.line}" stroke-width="3.5"/>
        <circle cx="78" cy="92" r="13" fill="${p.glow}"><animate attributeName="opacity" values="1;0.5;1" dur="1.8s" repeatCount="indefinite"/></circle>
        <circle cx="122" cy="92" r="13" fill="${p.glow}"><animate attributeName="opacity" values="1;0.5;1" dur="1.8s" repeatCount="indefinite" begin="0.4s"/></circle>
        <circle cx="78" cy="92" r="5" fill="#0a0a14"/><circle cx="122" cy="92" r="5" fill="#0a0a14"/>
        <path class="m-mouth" d="M78 132 Q88 122 100 132 Q112 122 122 132" stroke="${p.glow}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M56 60 L44 40 M144 60 L156 40" stroke="${p.glow}" stroke-width="5" stroke-linecap="round"/>
      </g>`;
    },
    boss_sand(p) {
      return `
      <g class="m-bob m-boss">
        <ellipse cx="100" cy="184" rx="66" ry="10" fill="#00000038"/>
        <path d="M100 30 Q46 40 44 108 Q44 162 100 170 Q156 162 156 108 Q154 40 100 30 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3.5"/>
        <path d="M58 52 L42 24 L72 40 Z M142 52 L158 24 L128 40 Z" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <path d="M64 32 L74 8 L86 30 L100 4 L114 30 L126 8 L136 32" fill="${p.glow}" stroke="${p.line}" stroke-width="2.5"/>
        ${eyes(78, 122, 96, 13, p, true)}
        <ellipse class="m-pupil2" cx="78" cy="97" rx="5" ry="8" fill="#e8b000"/>
        <ellipse class="m-pupil2" cx="122" cy="97" rx="5" ry="8" fill="#e8b000"/>
        <path class="m-mouth" d="M80 138 Q100 128 120 138" stroke="${p.line}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M86 136 L90 148 M114 136 L110 148" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
        <ellipse cx="100" cy="158" rx="26" ry="8" fill="${p.bodyD}" opacity="0.7"/>
      </g>`;
    },
    boss_dragon(p) {
      return `
      <g class="m-bob m-boss">
        <ellipse cx="100" cy="186" rx="66" ry="10" fill="#00000038"/>
        <path class="m-tail" d="M146 150 Q182 136 186 100 Q188 78 174 68 Q178 92 164 102 Q168 82 156 78 Q158 104 142 120 Z" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <path d="M100 36 Q52 44 50 108 Q50 158 100 166 Q150 158 150 108 Q148 44 100 36 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3.5"/>
        <path d="M100 166 Q76 160 70 136 Q86 148 100 148 Q114 148 130 136 Q124 160 100 166 Z" fill="${p.belly}"/>
        <path d="M64 46 L44 12 L84 32 Z M136 46 L156 12 L116 32 Z" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <path d="M72 30 Q64 12 52 8 M128 30 Q136 12 148 8" stroke="${p.bodyL}" stroke-width="5" fill="none" stroke-linecap="round"/>
        ${eyes(80, 120, 92, 12, p, true)}
        <path d="M96 112 L92 122 L100 118 L108 122 L104 112" fill="${p.bodyD}" stroke="${p.line}" stroke-width="2"/>
        <path class="m-mouth" d="M82 136 Q100 126 118 136" stroke="${p.line}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
        <path d="M86 134 L90 146 M114 134 L110 146" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M100 36 L100 22 M88 40 L84 28 M112 40 L116 28" stroke="${p.glow}" stroke-width="4" stroke-linecap="round"/>
      </g>`;
    },
    boss_crane(p) {
      return `
      <g class="m-bob m-boss">
        <ellipse cx="100" cy="184" rx="56" ry="9" fill="#00000038"/>
        <g class="m-wing"><path d="M62 96 Q20 66 8 28 Q52 42 76 78 Z" fill="#f4f8ff" stroke="${p.line}" stroke-width="3"/></g>
        <g class="m-wing w2"><path d="M138 96 Q180 66 192 28 Q148 42 124 78 Z" fill="#f4f8ff" stroke="${p.line}" stroke-width="3"/></g>
        <path d="M100 48 Q56 56 54 112 Q54 158 100 166 Q146 158 146 112 Q144 56 100 48 Z" fill="#fdfeff" stroke="${p.line}" stroke-width="3.5"/>
        <path d="M100 166 Q80 160 74 142 Q90 152 100 152 Q110 152 126 142 Q120 160 100 166 Z" fill="${p.bodyL}"/>
        <path d="M100 50 Q94 34 100 22 Q106 34 100 50 Z" fill="#e83a30" stroke="${p.line}" stroke-width="2.5"/>
        <path d="M100 96 L86 108 L100 116 L114 108 Z" fill="#f0b030" stroke="${p.line}" stroke-width="2.5"/>
        ${eyes(80, 120, 84, 10, p)}
        <path d="M84 166 L80 182 M116 166 L120 182" stroke="#e88030" stroke-width="5" stroke-linecap="round"/>
      </g>`;
    },
    boss_mech(p) {
      return `
      <g class="m-bob m-boss">
        <ellipse cx="100" cy="184" rx="64" ry="10" fill="#00000038"/>
        <circle class="m-ring" cx="100" cy="106" r="72" fill="none" stroke="${p.glow}" stroke-width="3" stroke-dasharray="14 10" opacity="0.7"/>
        <rect x="56" y="52" width="88" height="104" rx="18" fill="${p.body}" stroke="${p.line}" stroke-width="3.5"/>
        <rect x="68" y="66" width="64" height="44" rx="10" fill="${p.bodyD}"/>
        ${eyes(86, 114, 88, 9, p, true)}
        <rect x="84" y="120" width="32" height="8" rx="4" fill="${p.line}"/>
        <circle class="m-core" cx="100" cy="142" r="11" fill="${p.glow}"><animate attributeName="r" values="11;14;11" dur="1.4s" repeatCount="indefinite"/></circle>
        <path d="M56 84 L34 72 M56 124 L34 136 M144 84 L166 72 M144 124 L166 136" stroke="${p.bodyD}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="30" cy="70" r="7" fill="${p.glow}"/><circle cx="30" cy="138" r="7" fill="${p.glow}"/>
        <circle cx="170" cy="70" r="7" fill="${p.glow}"/><circle cx="170" cy="138" r="7" fill="${p.glow}"/>
        <path d="M78 52 L72 34 L88 46 M122 52 L128 34 L112 46" fill="${p.bodyD}" stroke="${p.line}" stroke-width="2.5"/>
      </g>`;
    },
    boss_golem(p) {
      return `
      <g class="m-bob m-boss">
        <ellipse cx="100" cy="188" rx="70" ry="10" fill="#00000038"/>
        <rect x="46" y="44" width="108" height="118" rx="24" fill="${p.body}" stroke="${p.line}" stroke-width="4"/>
        <circle cx="100" cy="100" r="34" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <circle class="m-ring" cx="100" cy="100" r="26" fill="none" stroke="${p.glow}" stroke-width="3" stroke-dasharray="8 6"/>
        <circle class="m-core" cx="100" cy="100" r="12" fill="${p.glow}"><animate attributeName="opacity" values="1;0.55;1" dur="1.2s" repeatCount="indefinite"/></circle>
        ${eyes(74, 126, 62, 9, p, true)}
        <rect x="20" y="80" width="26" height="56" rx="13" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <rect x="154" y="80" width="26" height="56" rx="13" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <rect x="58" y="162" width="34" height="24" rx="9" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <rect x="108" y="162" width="34" height="24" rx="9" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <path d="M60 44 L52 22 L74 36 M140 44 L148 22 L126 36" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
      </g>`;
    },
    boss_serpent(p) {
      return `
      <g class="m-bob m-boss">
        <path class="m-tail" d="M100 170 Q60 162 54 132 Q80 142 100 138 Q120 142 146 132 Q140 162 100 170 Z" fill="${p.bodyD}" stroke="${p.line}" stroke-width="3"/>
        <path d="M100 26 Q54 34 52 96 Q52 140 100 148 Q148 140 148 96 Q146 34 100 26 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3.5"/>
        <path d="M62 40 Q50 20 58 6 Q70 22 72 36 Z M138 40 Q150 20 142 6 Q130 22 128 36 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/>
        <path d="M100 26 L100 8 M100 14 L88 6 M100 14 L112 6" stroke="${p.glow}" stroke-width="3.5" stroke-linecap="round"/>
        ${eyes(80, 120, 84, 12, p)}
        <ellipse cx="100" cy="112" rx="6" ry="4" fill="${p.line}"/>
        <path class="m-mouth" d="M88 126 Q100 134 112 126" stroke="${p.line}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M56 76 Q40 66 36 50 M144 76 Q160 66 164 50" stroke="${p.glow}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="34" cy="46" r="5" fill="${p.glow}"/><circle cx="166" cy="46" r="5" fill="${p.glow}"/>
      </g>`;
    },
    boss_clam(p) {
      return `
      <g class="m-bob m-boss">
        <ellipse cx="100" cy="182" rx="66" ry="10" fill="#00000038"/>
        <path d="M100 150 Q34 150 30 96 Q46 112 60 108 Q40 88 48 66 Q64 84 78 82 Q64 58 80 42 Q92 64 100 66 Q108 64 120 42 Q136 58 122 82 Q136 84 152 66 Q160 88 140 108 Q154 112 170 96 Q166 150 100 150 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3.5"/>
        <path d="M56 128 Q100 108 144 128 Q100 144 56 128 Z" fill="${p.bodyD}"/>
        <circle class="m-core" cx="100" cy="122" r="15" fill="#fef6ff" stroke="${p.glow}" stroke-width="3">
          <animate attributeName="r" values="15;17;15" dur="2s" repeatCount="indefinite"/></circle>
        <circle cx="95" cy="117" r="5" fill="#fff"/>
        ${eyes(72, 128, 96, 9, p, true)}
      </g>`;
    },
    boss_celestial(p) {
      return `
      <g class="m-bob m-boss m-ghost">
        <circle class="m-ring" cx="100" cy="100" r="80" fill="none" stroke="${p.glow}" stroke-width="2.5" stroke-dasharray="4 12" opacity="0.8"/>
        <circle class="m-ring r2" cx="100" cy="100" r="62" fill="none" stroke="${p.bodyL}" stroke-width="2" stroke-dasharray="20 8" opacity="0.6"/>
        <path d="M100 32 Q58 40 56 98 Q54 142 100 150 Q146 142 144 98 Q142 40 100 32 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3.5"/>
        <path d="M100 32 Q90 14 100 2 Q110 14 100 32 Z" fill="${p.glow}" stroke="${p.line}" stroke-width="2"/>
        <path d="M68 44 Q54 30 56 14 Q70 24 74 38 Z M132 44 Q146 30 144 14 Q130 24 126 38 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/>
        ${eyes(80, 120, 88, 11, p)}
        <path d="M94 74 L100 62 L106 74 L100 70 Z" fill="${p.glow}"/>
        <path class="m-mouth" d="M90 122 Q100 128 110 122" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="48" cy="58" r="4" fill="${p.glow}"><animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/></circle>
        <circle cx="156" cy="70" r="3.5" fill="${p.glow}"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/></circle>
        <circle cx="152" cy="140" r="3" fill="${p.glow}"><animate attributeName="opacity" values="1;0.4;1" dur="2.2s" repeatCount="indefinite"/></circle>
      </g>`;
    },
    boss_void(p) {
      return `
      <g class="m-bob m-boss m-ghost">
        <circle cx="100" cy="100" r="76" fill="#0a0a18" opacity="0.85"/>
        <circle class="m-ring" cx="100" cy="100" r="76" fill="none" stroke="${p.glow}" stroke-width="3" stroke-dasharray="30 14"/>
        <path d="M100 30 Q52 40 50 100 Q50 148 100 158 Q150 148 150 100 Q148 40 100 30 Z" fill="#141428" stroke="${p.glow}" stroke-width="3"/>
        <circle cx="76" cy="90" r="15" fill="${p.glow}"><animate attributeName="r" values="15;12;15" dur="1.6s" repeatCount="indefinite"/></circle>
        <circle cx="124" cy="90" r="15" fill="${p.glow}"><animate attributeName="r" values="15;12;15" dur="1.6s" repeatCount="indefinite" begin="0.5s"/></circle>
        <circle cx="76" cy="90" r="6" fill="#050510"/><circle cx="124" cy="90" r="6" fill="#050510"/>
        <path class="m-mouth" d="M70 128 L82 120 L94 130 L106 120 L118 130 L130 120" stroke="${p.glow}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M54 54 L38 34 M146 54 L162 34 M50 140 L32 152 M150 140 L168 152" stroke="${p.glow}" stroke-width="4.5" stroke-linecap="round"/>
      </g>`;
    },
  };

  function monsterSVG(m, opts = {}) {
    const p = pal(m.hue, m.boss);
    const draw = MDRAW[m.kind] || MDRAW.sprite;
    return `<svg class="monster-fig ${m.boss ? 'is-boss' : ''}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="mGlow${m.id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter></defs>
      ${draw(p)}</svg>`;
  }

  // ---------- 灵兽（图鉴小像，重用妖兽组件风格，更可爱） ----------
  const BDRAW = {
    beast_weasel: p => `<ellipse cx="100" cy="170" rx="40" ry="8" fill="#00000028"/><path class="m-tail" d="M136 130 Q170 120 172 88 Q150 96 140 116 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/><ellipse cx="100" cy="120" rx="42" ry="40" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><circle cx="100" cy="76" r="30" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><path d="M80 54 L72 34 L92 46 Z M120 54 L128 34 L108 46 Z" fill="${p.body}" stroke="${p.line}" stroke-width="2.5"/>${'EYES'}<ellipse cx="100" cy="130" rx="22" ry="16" fill="${p.belly}"/>`,
    beast_deer: p => `<ellipse cx="100" cy="172" rx="40" ry="8" fill="#00000028"/><path d="M74 46 Q60 30 62 12 M74 46 Q64 40 54 42 M126 46 Q140 30 138 12 M126 46 Q136 40 146 42" stroke="#c8a060" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="124" rx="38" ry="42" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><circle cx="100" cy="70" r="27" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>${'EYES'}<circle cx="88" cy="108" r="4" fill="#fff" opacity="0.8"/><circle cx="112" cy="118" r="3.5" fill="#fff" opacity="0.8"/><circle cx="96" cy="130" r="3" fill="#fff" opacity="0.8"/>`,
    beast_phoenix: p => `<g class="m-wing"><path d="M64 90 Q28 66 20 30 Q58 46 76 76 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/></g><g class="m-wing w2"><path d="M136 90 Q172 66 180 30 Q142 46 124 76 Z" fill="${p.bodyL}" stroke="${p.line}" stroke-width="2.5"/></g><ellipse cx="100" cy="110" rx="36" ry="40" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><path d="M100 150 Q80 176 60 182 Q84 178 100 164 Q116 178 140 182 Q120 176 100 150 Z" fill="${p.glow}" stroke="${p.line}" stroke-width="2"/><circle cx="100" cy="64" r="24" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><path d="M100 40 Q94 26 100 16 Q106 26 100 40 Z" fill="${p.glow}"/>${'EYES'}<path d="M100 84 L92 92 L100 96 L108 92 Z" fill="#f0a030" stroke="${p.line}" stroke-width="2"/>`,
    beast_fox: p => MDRAW.fox(p).replace('class="m-bob"', 'class="m-bob beast"'),
    beast_falcon: p => MDRAW.bird(p).replace('class="m-bob"', 'class="m-bob beast"'),
    beast_dragon: p => MDRAW.boss_dragon(p).replace('m-boss', ''),
    beast_bird: p => MDRAW.bird(p),
    beast_tiger: p => `<ellipse cx="100" cy="172" rx="46" ry="9" fill="#00000028"/><ellipse cx="100" cy="122" rx="46" ry="42" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><circle cx="100" cy="72" r="32" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><path d="M74 52 L64 30 L88 42 Z M126 52 L136 30 L112 42 Z" fill="${p.body}" stroke="${p.line}" stroke-width="2.5"/><path d="M84 44 L80 56 M100 40 L100 52 M116 44 L120 56" stroke="${p.line}" stroke-width="4" stroke-linecap="round"/>${'EYES'}<ellipse cx="100" cy="88" rx="5" ry="4" fill="${p.line}"/><path d="M92 96 Q100 102 108 96" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="134" rx="24" ry="18" fill="${p.belly}"/>`,
    beast_roc: p => MDRAW.boss_crane(p).replace('m-boss', ''),
    beast_turtle: p => MDRAW.turtle(p),
    beast_owl: p => `<ellipse cx="100" cy="170" rx="40" ry="8" fill="#00000028"/><ellipse cx="100" cy="112" rx="44" ry="52" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><path d="M64 66 L54 42 L80 54 Z M136 66 L146 42 L120 54 Z" fill="${p.body}" stroke="${p.line}" stroke-width="2.5"/><circle cx="80" cy="92" r="18" fill="${p.belly}" stroke="${p.line}" stroke-width="2.5"/><circle cx="120" cy="92" r="18" fill="${p.belly}" stroke="${p.line}" stroke-width="2.5"/>${'EYES'}<path d="M100 104 L92 114 L100 120 L108 114 Z" fill="#f0a030" stroke="${p.line}" stroke-width="2"/><ellipse cx="100" cy="144" rx="22" ry="16" fill="${p.belly}"/><circle class="m-core" cx="100" cy="144" r="6" fill="${p.glow}"/>`,
    beast_qilin: p => MDRAW.boss_dragon(p).replace('m-boss', ''),
    beast_shrimp: p => `<ellipse cx="100" cy="168" rx="40" ry="8" fill="#00000028"/><path class="m-tail" d="M140 120 Q166 108 170 84 Q150 90 140 104 Z" fill="${p.bodyL}" opacity="0.85" stroke="${p.line}" stroke-width="2.5"/><path d="M100 56 Q58 62 56 108 Q56 148 100 154 Q140 148 144 110 Q142 62 100 56 Z" fill="${p.body}" opacity="0.85" stroke="${p.line}" stroke-width="3"/><path d="M66 84 Q90 78 118 84 M62 106 Q90 100 122 106 M66 128 Q90 124 118 128" stroke="${p.bodyD}" stroke-width="2.5" fill="none" opacity="0.6"/>${'EYES'}<path d="M84 60 Q76 40 64 34 M116 60 Q124 40 136 34" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    beast_heron: p => MDRAW.boss_crane(p).replace('m-boss', ''),
    beast_dragon2: p => MDRAW.boss_serpent(p).replace('m-boss', ''),
    beast_rabbit: p => `<ellipse cx="100" cy="170" rx="40" ry="8" fill="#00000028"/><path d="M76 60 Q64 20 78 6 Q92 22 90 56 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><path d="M124 60 Q136 20 122 6 Q108 22 110 56 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><path d="M80 46 Q74 24 79 14 Q86 26 85 48 Z" fill="${p.belly}"/><path d="M120 46 Q126 24 121 14 Q114 26 115 48 Z" fill="${p.belly}"/><ellipse cx="100" cy="112" rx="42" ry="46" fill="${p.body}" stroke="${p.line}" stroke-width="3"/>${'EYES'}<ellipse cx="100" cy="110" rx="4" ry="3" fill="${p.line}"/><path d="M100 113 L100 120 M100 120 Q92 126 86 122 M100 120 Q108 126 114 122" stroke="${p.line}" stroke-width="2.5" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="140" rx="20" ry="14" fill="${p.belly}"/>`,
    beast_cat: p => `<ellipse cx="100" cy="170" rx="42" ry="8" fill="#00000028"/><path class="m-tail" d="M138 140 Q170 132 172 102 Q176 122 168 140 Q156 156 138 152 Z" fill="${p.body}" stroke="${p.line}" stroke-width="2.5"/><ellipse cx="100" cy="126" rx="40" ry="38" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><circle cx="100" cy="76" r="30" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><path d="M78 56 L68 32 L92 46 Z M122 56 L132 32 L108 46 Z" fill="${p.body}" stroke="${p.line}" stroke-width="2.5"/>${'EYES'}<ellipse cx="100" cy="92" rx="4" ry="3" fill="${p.line}"/><path d="M92 98 Q100 104 108 98" stroke="${p.line}" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M64 88 L44 84 M64 94 L46 96 M136 88 L156 84 M136 94 L154 96" stroke="${p.line}" stroke-width="2" stroke-linecap="round"/>`,
    beast_whale: p => `<path d="M100 50 Q40 58 36 110 Q38 150 90 156 Q86 168 72 174 Q94 174 104 158 Q160 152 164 108 Q160 58 100 50 Z" fill="${p.body}" stroke="${p.line}" stroke-width="3"/><path d="M44 120 Q80 132 124 126 Q160 120 162 108" stroke="${p.belly}" stroke-width="10" fill="none" opacity="0.6"/>${'EYES'}<path class="m-mouth" d="M64 118 Q76 126 90 122" stroke="${p.line}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M100 50 Q98 34 88 28 M100 50 Q108 36 118 32" stroke="${p.glow}" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="140" cy="70" r="4" fill="${p.glow}"><animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/></circle>`,
  };

  // 每种灵兽的眼睛位置（x1, x2, y, r）——头部高度不同
  const BEYE = {
    beast_weasel: [90, 110, 74, 7], beast_deer: [91, 109, 67, 6.5], beast_phoenix: [93, 107, 62, 5.5],
    beast_tiger: [88, 112, 70, 7.5], beast_owl: [80, 120, 92, 8], beast_rabbit: [88, 112, 100, 8],
    beast_cat: [90, 110, 72, 7.5], beast_shrimp: [84, 116, 96, 9], beast_whale: [70, 96, 94, 7],
  };
  function beastSVG(b) {
    const p = pal(b.hue, false);
    let body = (BDRAW[b.kind] || BDRAW.beast_weasel)(p);
    const e = BEYE[b.kind] || [88, 112, 96, 8];
    body = body.replace("'EYES'", '').replace('EYES', eyes(e[0], e[1], e[2], e[3], p));
    return `<svg class="beast-fig" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><g class="m-bob">${body}</g></svg>`;
  }

  // ---------- 视差背景 ----------
  let _bguid = 0;
  function bgSVG(theme, layers = 3) {
    const t = theme;
    const bu = 'sky' + (_bguid++);
    const far = `<svg class="bg-layer bg-far" viewBox="0 0 900 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="${bu}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${t.sky1}"/><stop offset="1" stop-color="${t.sky2}"/></linearGradient></defs>
      <rect width="900" height="600" fill="url(#${bu})"/>
      <circle cx="700" cy="110" r="52" fill="${t.fog}" opacity="0.5"/>
      <circle cx="700" cy="110" r="40" fill="${t.fog}" opacity="0.7"/>
      <path d="M0 420 L120 300 L230 400 L360 260 L500 410 L640 290 L780 400 L900 320 L900 600 L0 600 Z" fill="${t.mid}" opacity="0.45"/>
    </svg>`;
    const mid = `<svg class="bg-layer bg-mid" viewBox="0 0 900 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 470 L150 350 L280 460 L420 330 L560 470 L700 360 L830 460 L900 400 L900 600 L0 600 Z" fill="${t.mid}" opacity="0.75"/>
      <ellipse cx="200" cy="480" rx="180" ry="30" fill="${t.fog}" opacity="0.15"/>
      <ellipse cx="650" cy="500" rx="220" ry="36" fill="${t.fog}" opacity="0.12"/>
    </svg>`;
    const near = `<svg class="bg-layer bg-near" viewBox="0 0 900 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 560 Q225 520 450 555 Q675 585 900 545 L900 600 L0 600 Z" fill="${t.sky1}" opacity="0.9"/>
      <path d="M0 580 Q300 550 600 578 Q750 588 900 572 L900 600 L0 600 Z" fill="#000000" opacity="0.35"/>
    </svg>`;
    return far + mid + near;
  }

  // 环境粒子描述（由 engine 的粒子系统使用）
  const PARTICLE_STYLES = {
    leaf: { char: '🍃', colors: ['#6fd08c', '#8fd9a8'], drift: true },
    sand: { colors: ['#e8c56a', '#d0a850'], drift: true },
    cloud: { colors: ['#ffffff', '#d0e8f8'], drift: true, big: true },
    gear: { colors: ['#f0a05e', '#e88a50'], drift: true },
    bubble: { colors: ['#8ae8dc', '#b8f0ea'], rise: true },
    star: { colors: ['#ffd75e', '#b8a0f0', '#ffffff'], twinkle: true },
  };

  // ---------- 符阵（咏唱特效） ----------
  function spellCircleSVG(color) {
    return `<svg class="spell-circle" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="88" fill="none" stroke="${color}" stroke-width="2" class="sc-ring"/>
      <circle cx="100" cy="100" r="66" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="10 6" class="sc-ring r2"/>
      <path d="M100 22 L167 139 L33 139 Z" fill="none" stroke="${color}" stroke-width="1.5" class="sc-tri"/>
      <path d="M100 178 L33 61 L167 61 Z" fill="none" stroke="${color}" stroke-width="1.5" class="sc-tri t2"/>
      <circle cx="100" cy="100" r="10" fill="${color}" opacity="0.6"/>
    </svg>`;
  }

  return { heroSVG, monsterSVG, beastSVG, bgSVG, spellCircleSVG, PARTICLE_STYLES };
})();
