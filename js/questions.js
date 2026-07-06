/* ============================================================
   灵数仙途 · 题目生成引擎
   每题带 factId（用于 Leitner 熟练度追踪）、tip（错后口诀）、
   input: 'pad'（数字键盘）| 'choice'（四选一）
   diffTier: 0 / 1 / 2
   ============================================================ */

const Q = (() => {
  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[ri(0, arr.length - 1)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // 生成四个选项（含正确答案），干扰项贴近正确值
  function makeChoices(correct, distractors) {
    const set = new Set([String(correct)]);
    for (const d of distractors) { if (set.size >= 4) break; if (String(d) !== String(correct)) set.add(String(d)); }
    let guard = 0;
    while (set.size < 4 && guard++ < 50) {
      const v = typeof correct === 'number' ? correct + pick([-2, -1, 1, 2, 10, -10]) : correct;
      if (v > 0) set.add(String(v));
    }
    return shuffle([...set]);
  }

  // ---------- 小九九 ----------
  const HARD_XJJ = [[6,7],[6,8],[6,9],[7,8],[7,9],[8,9],[7,7],[8,8],[4,7],[3,8],[4,8],[6,6]];
  function genXiaojiujiu(tier) {
    let a, b;
    if (tier === 0) { a = ri(2, 9); b = ri(2, 6); }
    else if (tier === 1) { [a, b] = Math.random() < 0.5 ? pick(HARD_XJJ) : [ri(3, 9), ri(3, 9)]; }
    else { [a, b] = pick(HARD_XJJ); }
    if (Math.random() < 0.5) [a, b] = [b, a];
    const ans = a * b;
    // tier2 有时考逆运算：42 = 6 × ?
    if (tier === 2 && Math.random() < 0.3) {
      return { factId: `m${Math.min(a,b)}x${Math.max(a,b)}`, text: `${ans} ÷ ${a} = ?`, answer: b, input: 'pad', tip: `想乘法口诀：${a} × ${b} = ${ans}` };
    }
    return { factId: `m${Math.min(a,b)}x${Math.max(a,b)}`, text: `${a} × ${b} = ?`, answer: ans, input: 'pad', tip: `口诀：${['','一','二','三','四','五','六','七','八','九'][Math.min(a,b)]}${['','一','二','三','四','五','六','七','八','九'][Math.max(a,b)]}${numToCn(ans)}` };
  }
  function numToCn(n) {
    const c = ['零','一','二','三','四','五','六','七','八','九'];
    if (n < 10) return '得' + c[n];
    if (n < 20) return '十' + (n % 10 ? c[n % 10] : '');
    const t = Math.floor(n / 10), o = n % 10;
    return c[t] + '十' + (o ? c[o] : '');
  }

  // ---------- 大九九 (11~19) ----------
  function genDajiujiu(tier) {
    let a, b;
    if (tier === 0) { a = ri(11, 14); b = ri(11, 13); }
    else if (tier === 1) { a = ri(11, 19); b = ri(11, 15); }
    else { a = ri(13, 19); b = ri(13, 19); }
    if (Math.random() < 0.5) [a, b] = [b, a];
    const ans = a * b;
    const tip = `${a}×${b}：先算 ${a}×10=${a*10}，再算 ${a}×${b-10}=${a*(b-10)}，相加得 ${ans}`;
    return { factId: `d${Math.min(a,b)}x${Math.max(a,b)}`, text: `${a} × ${b} = ?`, answer: ans, input: 'pad', tip };
  }

  // ---------- 速算诀 ----------
  const COMBOS = [
    [25, 4, '25×4=100，凑整好搭档'], [25, 8, '25×8 = 25×4×2 = 200'], [125, 8, '125×8=1000，黄金搭档'],
    [125, 4, '125×4 = 125×8÷2 = 500'], [75, 4, '75×4 = 75×2×2 = 300'], [15, 4, '15×4 = 15×2×2 = 60'],
    [35, 2, '35×2=70'], [45, 2, '45×2=90'], [24, 5, '24×5 = 24×10÷2 = 120'], [16, 5, '16×5 = 16×10÷2 = 80'],
    [12, 5, '12×5 = 12×10÷2 = 60'], [18, 5, '18×5 = 18×10÷2 = 90'], [22, 5, '22×5 = 110'], [14, 50, '14×50 = 14×100÷2 = 700'],
  ];
  function genSusuan(tier) {
    const mode = tier === 0 ? pick(['combo', 'addsub']) : tier === 1 ? pick(['combo', 'addsub', 'square']) : pick(['combo', 'square', 'addsub2']);
    if (mode === 'combo') {
      const [a, b, tip] = pick(COMBOS);
      const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
      return { factId: `c${a}x${b}`, text: `${x} × ${y} = ?`, answer: a * b, input: 'pad', tip };
    }
    if (mode === 'square') {
      const n = ri(11, tier === 2 ? 25 : 19);
      const tip = n <= 19 ? `${n}² = ${n}×${n}，想 ${n}×10+${n}×${n-10} = ${n*10}+${n*(n-10)}` : `${n}² 记住常用平方数：${n}×${n}=${n*n}`;
      return { factId: `sq${n}`, text: `${n}² = ?`, answer: n * n, input: 'pad', tip };
    }
    if (mode === 'addsub2') {
      const a = ri(120, 480), b = ri(15, 99);
      const plus = Math.random() < 0.5;
      const ans = plus ? a + b : a - b;
      const near = Math.round(b / 10) * 10;
      const tip = plus ? `${a}+${b}：先加 ${near} 得 ${a+near}，再${b>near?'加':'减'} ${Math.abs(b-near)}` : `${a}−${b}：先减 ${near} 得 ${a-near}，再${b>near?'加':'减'}回 ${Math.abs(b-near)}`;
      return { factId: `as2_${plus?'p':'m'}${b%10}`, text: `${a} ${plus ? '+' : '−'} ${b} = ?`, answer: ans, input: 'pad', tip };
    }
    // addsub：两位数加减（凑十法）
    const a = ri(25, 98), b = ri(15, 79);
    const plus = Math.random() < 0.5;
    if (!plus && b > a) return genSusuan(tier);
    const ans = plus ? a + b : a - b;
    const tip = plus ? `${a}+${b}：拆成 ${a}+${Math.floor(b/10)*10}+${b%10}` : `${a}−${b}：拆成 ${a}−${Math.floor(b/10)*10}−${b%10}`;
    return { factId: `as_${plus?'p':'m'}${(a%10)}_${(b%10)}`, text: `${a} ${plus ? '+' : '−'} ${b} = ?`, answer: ans, input: 'pad', tip };
  }

  // ---------- 度量术（单位换算） ----------
  const UNITS = {
    length: { chain: [['毫米', 1], ['厘米', 10], ['分米', 100], ['米', 1000], ['千米', 1000000]], tip: '长度：毫米→厘米→分米→米 每级×10，米→千米 ×1000' },
    mass: { chain: [['克', 1], ['千克', 1000], ['吨', 1000000]], tip: '质量：1千克=1000克，1吨=1000千克' },
    time: { chain: [['秒', 1], ['分', 60], ['小时', 3600]], tip: '时间：1分=60秒，1小时=60分' },
    area: { chain: [['平方厘米', 1], ['平方分米', 100], ['平方米', 10000]], tip: '面积单位每级 ×100' },
  };
  function genDuliang(tier) {
    // 30%：单位辨析（判断题，选择）——诊断误概念
    if (Math.random() < 0.3) return genDuliangCompare(tier);
    const cat = tier === 0 ? pick(['length', 'mass', 'time']) : pick(['length', 'mass', 'time', 'area']);
    const u = UNITS[cat];
    let i = ri(0, u.chain.length - 2);
    let j = Math.min(u.chain.length - 1, i + (tier === 2 && Math.random() < 0.4 ? 2 : 1));
    if (cat === 'length' && j - i > 1 && u.chain[j][1] / u.chain[i][1] > 1000) j = i + 1;
    const ratio = u.chain[j][1] / u.chain[i][1];
    const big2small = Math.random() < 0.6;
    let text, ans;
    if (big2small) {
      const n = tier === 0 ? ri(1, 9) : pick([ri(1, 9), ri(2, 6) / 2]);
      ans = n * ratio;
      if (!Number.isInteger(ans)) return genDuliang(tier);
      text = `${n} ${u.chain[j][0]} = ? ${u.chain[i][0]}`;
    } else {
      const mult = tier === 0 ? ri(1, 9) : ri(2, 30);
      ans = mult;
      text = `${mult * ratio} ${u.chain[i][0]} = ? ${u.chain[j][0]}`;
    }
    // 数值提取 → 键盘输入（答案过长则退回选择）
    if (String(ans).length > 5) {
      const distract = [ans * 10, ans / 10, ans * 100, ans + ratio].filter(v => Number.isInteger(v) && v > 0);
      return { factId: `u_${cat}${i}${j}${big2small ? 'b' : 's'}`, text, answer: ans, input: 'choice', choices: makeChoices(ans, distract), tip: u.tip };
    }
    return { factId: `u_${cat}${i}${j}${big2small ? 'b' : 's'}`, text, answer: ans, input: 'pad', tip: u.tip };
  }
  // 单位辨析：跨单位比大小（诊断"数字大就大"误概念）
  function genDuliangCompare(tier) {
    const cat = pick(['length', 'mass', 'time']);
    const u = UNITS[cat];
    const i = ri(0, u.chain.length - 2), j = i + 1;
    const ratio = u.chain[j][1] / u.chain[i][1];
    const big = ri(1, 5);
    const mode = pick(['eq', 'gt', 'lt']);
    let small;
    if (mode === 'eq') small = big * ratio;
    else if (mode === 'gt') small = big * ratio - ri(1, Math.max(1, Math.floor(ratio / 2)));
    else small = big * ratio + ri(1, Math.floor(ratio / 2));
    const ans = mode === 'eq' ? '=' : mode === 'gt' ? '>' : '<';
    return { factId: `ucmp_${cat}${i}`, text: `${big} ${u.chain[j][0]} ○ ${small} ${u.chain[i][0]}`, answer: ans,
      input: 'choice', choices: ['>', '<', '='], tip: `先换成同一单位再比：${big} ${u.chain[j][0]} = ${big * ratio} ${u.chain[i][0]}` };
  }

  // ---------- 小数诀 ----------
  const FRAC_DEC = [['1/2', 0.5], ['1/4', 0.25], ['3/4', 0.75], ['1/5', 0.2], ['2/5', 0.4], ['3/5', 0.6], ['4/5', 0.8], ['1/8', 0.125], ['3/8', 0.375], ['5/8', 0.625], ['7/8', 0.875], ['1/10', 0.1], ['1/20', 0.05], ['1/25', 0.04], ['1/50', 0.02]];
  function fmt(n) { return parseFloat(n.toFixed(4)).toString(); }
  function genXiaoshu(tier) {
    const mode = tier === 0 ? pick(['shift', 'compare']) : tier === 1 ? pick(['shift', 'f2d', 'compare']) : pick(['shift2', 'f2d', 'd2f']);
    if (mode === 'shift' || mode === 'shift2') {
      const base = pick([2.5, 3.14, 0.6, 1.25, 45.6, 0.08, 7.2, 12.5, 0.35, 6.08]);
      const pow = mode === 'shift2' ? pick([10, 100, 1000]) : 10;
      const mul = Math.random() < 0.5;
      const ans = mul ? base * pow : base / pow;
      const dir = mul ? '右' : '左';
      const digits = String(pow).length - 1;
      if (fmt(ans).length > 7) return genXiaoshu(tier);
      return { factId: `xs_${mul?'mul':'div'}${pow}`, text: `${fmt(base)} ${mul ? '×' : '÷'} ${pow} = ?`, answer: fmt(ans),
        input: 'pad', allowDot: true,
        tip: `${mul ? '乘' : '除以'} ${pow}：小数点向${dir}移 ${digits} 位` };
    }
    if (mode === 'f2d') {
      const [f, d] = pick(FRAC_DEC);
      return { factId: `fd_${f.replace('/', '_')}`, text: `${f} = ?（小数）`, answer: fmt(d),
        input: 'pad', allowDot: true, tip: `${f} = ${fmt(d)}，这组要背熟` };
    }
    if (mode === 'd2f') {
      const [f, d] = pick(FRAC_DEC);
      return { factId: `df_${f.replace('/', '_')}`, text: `${fmt(d)} = ?（分数）`, answer: f, input: 'choice',
        choices: makeChoices(f, FRAC_DEC.map(x => x[0])), tip: `${fmt(d)} = ${f}，这组要背熟` };
    }
    // compare
    const a = pick([0.5, 0.25, 0.8, 0.35, 0.6, 0.75, 0.09, 0.4]);
    let b = pick([0.52, 0.3, 0.78, 0.4, 0.58, 0.7, 0.1, 0.42, 0.05]);
    if (a === b) b += 0.01;
    const ans = a > b ? '>' : '<';
    return { factId: `cmp_dec`, text: `${fmt(a)} ○ ${fmt(b)}，○ 里填什么？`, answer: ans, input: 'choice', choices: shuffle(['>', '<', '=']).slice(0, 3).includes(ans) ? shuffle(['>', '<', '=']) : ['>', '<', '='],
      tip: '比小数先比整数位，再从十分位逐位比' };
  }

  // ---------- 分数章 ----------
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function genFenshu(tier) {
    const mode = tier === 0 ? pick(['simplify', 'compare1']) : tier === 1 ? pick(['simplify', 'compare2', 'addsame']) : pick(['simplify2', 'compare2', 'addsame', 'subsame']);
    if (mode === 'simplify' || mode === 'simplify2') {
      const den = pick(mode === 'simplify2' ? [12, 16, 18, 20, 24] : [4, 6, 8, 9, 10, 12]);
      let num = ri(1, den - 1);
      const g = gcd(num, den);
      if (g === 1) return genFenshu(tier);
      const ans = `${num / g}/${den / g}`;
      return { factId: `fs_${num}_${den}`, text: `约分：${num}/${den} = ?`, answer: ans, input: 'choice',
        choices: makeChoices(ans, [`${num}/${den}`, `${num / g}/${den}`, `${num}/${den / g}`, `1/${den / g}`]),
        tip: `分子分母同除以最大公因数 ${g}：${num}÷${g}=${num / g}，${den}÷${g}=${den / g}` };
    }
    if (mode === 'compare1') {
      const den = pick([3, 4, 5, 7, 8]);
      let a = ri(1, den - 1), b = ri(1, den - 1);
      if (a === b) b = (b % (den - 1)) + 1;
      const ans = a > b ? '>' : '<';
      return { factId: `fc1_${den}`, text: `${a}/${den} ○ ${b}/${den}`, answer: ans, input: 'choice', choices: ['>', '<', '='],
        tip: '同分母比分数：分子大的分数大' };
    }
    if (mode === 'compare2') {
      const num = pick([1, 2, 3]);
      let d1 = ri(2, 9), d2 = ri(2, 9);
      if (d1 === d2) d2 = (d2 % 8) + 2;
      const ans = num / d1 > num / d2 ? '>' : '<';
      return { factId: `fc2_${num}`, text: `${num}/${d1} ○ ${num}/${d2}`, answer: ans, input: 'choice', choices: ['>', '<', '='],
        tip: '同分子比分数：分母小的反而大（分得少，每份多）' };
    }
    // 同分母加减
    const den = pick([5, 7, 8, 9, 10, 11]);
    const isAdd = mode === 'addsame';
    let a = ri(1, den - 2), b = ri(1, den - 1 - a);
    if (!isAdd) { a = ri(2, den - 1); b = ri(1, a - 1); }
    const rn = isAdd ? a + b : a - b;
    const g = gcd(rn, den);
    const ans = g > 1 ? `${rn / g}/${den / g}` : `${rn}/${den}`;
    return { factId: `fa_${den}_${isAdd?'a':'s'}`, text: `${a}/${den} ${isAdd ? '+' : '−'} ${b}/${den} = ?`, answer: ans, input: 'choice',
      choices: makeChoices(ans, [`${rn}/${den}`, `${rn}/${den * 2}`, `${a + b}/${den + den}`, `${Math.abs(a - b)}/${den}`]),
      tip: `同分母${isAdd ? '相加' : '相减'}：分母不变，分子${isAdd ? '相加' : '相减'}${g > 1 ? '，最后记得约分' : ''}` };
  }

  const GENERATORS = { zhulin: genXiaojiujiu, shamo: genDajiujiu, yunjian: genSusuan, qianji: genDuliang, bibo: genXiaoshu, xinghai: genFenshu };

  // 基础时限（秒），按 input 与模块调整
  function baseTime(zoneId, tier) {
    const t = { zhulin: [8, 6, 5], shamo: [12, 10, 8], yunjian: [10, 8, 7], qianji: [14, 12, 10], bibo: [12, 10, 9], xinghai: [14, 12, 10] };
    return (t[zoneId] || [10, 8, 6])[tier];
  }

  function gen(zoneId, tier) {
    const q = GENERATORS[zoneId](tier);
    q.zone = zoneId; q.tier = tier;
    q.baseTime = baseTime(zoneId, tier);
    q.answer = String(q.answer);
    return q;
  }

  // 键盘题输入耗时补偿（Reflex 做法：限时中扣除打字时间）
  function typingComp(q) {
    return q.input === 'pad' ? String(q.answer).length * 300 : 0;
  }

  return { gen, baseTime, typingComp };
})();
