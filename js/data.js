/* ============================================================
   灵数仙途 · 数据层
   境界体系 / 六大秘境 / 妖兽 / 灵兽 / 口诀
   ============================================================ */

// ---------- 境界体系 ----------
// 每个大境界 3 层，xp 为进入下一层所需修为
const REALMS = [
  { name: '炼气', color: '#7ec8a9', aura: '#a8e6c9' },
  { name: '筑基', color: '#e8c56a', aura: '#ffe9a8' },
  { name: '金丹', color: '#f0a35e', aura: '#ffd0a0' },
  { name: '元婴', color: '#c98fe8', aura: '#e6c9ff' },
  { name: '化神', color: '#7fb3f0', aura: '#b3d6ff' },
  { name: '炼虚', color: '#f08fb3', aura: '#ffc9e0' },
  { name: '合体', color: '#8fe8e0', aura: '#c9fff8' },
  { name: '大乘', color: '#f0e15e', aura: '#fff8b3' },
  { name: '渡劫', color: '#b0b8ff', aura: '#dde0ff' },
  { name: '真仙', color: '#ffdf8e', aura: '#fff3d0' },
];
const REALM_SUBS = ['一层', '二层', '三层'];
// 每一小层所需修为（递增）
function xpForLevel(level) { return 50 + level * 30 + Math.floor(level * level * 4); }
const MAX_LEVEL = REALMS.length * REALM_SUBS.length - 1;

function realmOfLevel(level) {
  const l = Math.min(level, MAX_LEVEL);
  const big = Math.floor(l / 3), sub = l % 3;
  return { big, sub, name: REALMS[big].name + REALM_SUBS[sub], color: REALMS[big].color, aura: REALMS[big].aura };
}

// ---------- 六大秘境 ----------
const ZONES = [
  {
    id: 'zhulin', name: '青竹林', module: '小九九', desc: '1~9 乘法真诀',
    theme: { sky1: '#0d2b1e', sky2: '#1a4a30', mid: '#2c6e49', fog: '#8fd9a8', accent: '#6fd08c', particle: 'leaf' },
    icon: '🎋', unlockLevel: 0,
  },
  {
    id: 'shamo', name: '石纹漠', module: '大九九', desc: '11~19 大数乘诀',
    theme: { sky1: '#2b1d0d', sky2: '#54381a', mid: '#8a5a2a', fog: '#e8c56a', accent: '#f0c060', particle: 'sand' },
    icon: '🏜️', unlockLevel: 2,
  },
  {
    id: 'yunjian', name: '流云涧', module: '速算诀', desc: '凑整 · 平方 · 加减速算',
    theme: { sky1: '#0d1e2b', sky2: '#1a3a54', mid: '#2a5a8a', fog: '#a0d0f0', accent: '#70b8f0', particle: 'cloud' },
    icon: '☁️', unlockLevel: 4,
  },
  {
    id: 'qianji', name: '千机阁', module: '度量术', desc: '长度 · 质量 · 时间 · 面积',
    theme: { sky1: '#2b120d', sky2: '#54261a', mid: '#8a3f2a', fog: '#f0a08a', accent: '#f08a5e', particle: 'gear' },
    icon: '⚙️', unlockLevel: 6,
  },
  {
    id: 'bibo', name: '碧波潭', module: '小数诀', desc: '小数乘除 · 互换 · 比较',
    theme: { sky1: '#0d2b28', sky2: '#1a5450', mid: '#2a8a80', fog: '#8ae8dc', accent: '#5ee0d0', particle: 'bubble' },
    icon: '🌊', unlockLevel: 8,
  },
  {
    id: 'xinghai', name: '星辰海', module: '分数章', desc: '约分 · 通分 · 分数运算',
    theme: { sky1: '#150d2b', sky2: '#2a1a54', mid: '#45308a', fog: '#b8a0f0', accent: '#9a7ef0', particle: 'star' },
    icon: '✨', unlockLevel: 10,
  },
];

const CHAPTERS_PER_ZONE = 6;
// 章节命名
const CHAPTER_NAMES = ['初探', '寻踪', '妖王现', '深行', '绝地', '镇魔'];
// 每章题目数（妖兽数 x 每妖题数）
function chapterConfig(zoneIdx, chIdx) {
  const isBoss = chIdx === 2 || chIdx === 5;
  return {
    monsters: isBoss ? 3 : 4,          // 妖兽数量（BOSS 章：2 小妖 + 1 BOSS）
    isBoss,
    qPerMonster: isBoss ? [2, 2, 4] : [2, 2, 2, 2], // 各妖需答对题数
    diffTier: Math.min(2, Math.floor(chIdx / 2)),    // 0/1/2 难度层
  };
}

// ---------- 妖兽库 ----------
// kind 对应 art.js 里的绘制器；每秘境 4 小妖 + 2 BOSS
const MONSTERS = {
  zhulin: [
    { id: 'zl1', name: '竹叶精', kind: 'sprite', hue: 130, taunt: ['嘻嘻，算不出吧！', '竹林是我的地盘！'], hurt: ['呀！', '好快的剑气！'], story: '竹叶所化的小妖，最怕算得快的修士。' },
    { id: 'zl2', name: '青斑蛙妖', kind: 'toad', hue: 110, taunt: ['呱！慢吞吞～', '呱呱，答错啦？'], hurt: ['呱！！', '蛙腿发软…'], story: '潭边修炼百年的蛙妖，一紧张就吐舌头。' },
    { id: 'zl3', name: '藤蔓婆', kind: 'vine', hue: 90, taunt: ['缠住你的思路…', '慢慢想，慢慢缠～'], hurt: ['藤断了！', '嘶——'], story: '会用藤蔓缠住犹豫不决的人。' },
    { id: 'zl4', name: '露珠灵', kind: 'slime', hue: 160, taunt: ['滴答，时间流走咯', '你追不上我的！'], hurt: ['碎了碎了！', '别打我呀！'], story: '晨露凝成的小灵，动作飞快。' },
    { id: 'zlb1', name: '铁背竹王', kind: 'boss_bamboo', hue: 125, boss: true, taunt: ['本王的竹甲，凡剑难破！', '九九不熟，休想过林！'], hurt: ['竹甲裂了？！', '好强的数道剑气！'], story: '青竹林之主，只服速算如飞之人。' },
    { id: 'zlb2', name: '幽篁大妖', kind: 'boss_shadow', hue: 140, boss: true, taunt: ['林深处，无人生还…', '让我看看你的真诀！'], hurt: ['不可能！', '此子剑心已成…'], story: '盘踞林心千年的大妖，败给它的修士不计其数。' },
  ],
  shamo: [
    { id: 'sm1', name: '沙粒鼠', kind: 'sprite', hue: 40, taunt: ['大九九很难的哟！', '吱吱，算错咯～'], hurt: ['吱！', '沙都被震散了！'], story: '在沙丘间打洞的小妖，爱捉弄算得慢的人。' },
    { id: 'sm2', name: '石甲蝎', kind: 'scorpion', hue: 30, taunt: ['我的毒针比你快！', '十七乘十八是多少？哈哈！'], hurt: ['甲壳碎裂！', '嘶嘶……'], story: '石纹漠的守关妖，尾针淬着"迟疑之毒"。' },
    { id: 'sm3', name: '海市蜃', kind: 'mirage', hue: 50, taunt: ['你看到的答案是幻象～', '迷惑，迷惑～'], hurt: ['幻象破了！', '看穿了？！'], story: '善用幻象把错误答案变得像真的。' },
    { id: 'sm4', name: '风滚妖', kind: 'slime', hue: 45, taunt: ['风一样快，你行吗？', '滚滚滚～'], hurt: ['被吹散了！', '呜哇！'], story: '滚得比风快的草团妖。' },
    { id: 'smb1', name: '金瞳沙帝', kind: 'boss_sand', hue: 42, boss: true, taunt: ['千年无人破我沙阵！', '大九九，敢与朕一战？'], hurt: ['沙阵……崩了！', '此等速算，闻所未闻！'], story: '统御黄沙的帝者，沙阵以 19×19 布成。' },
    { id: 'smb2', name: '石纹古龙', kind: 'boss_dragon', hue: 35, boss: true, taunt: ['吾即是沙漠！', '龙威之下，心算可还稳？'], hurt: ['龙鳞碎裂！', '吼——！'], story: '沉睡在石纹之下的古龙，醒来时飞沙走石。' },
  ],
  yunjian: [
    { id: 'yj1', name: '云雀妖', kind: 'bird', hue: 200, taunt: ['啾！凑整会吗？', '25×4？考考你！'], hurt: ['羽毛掉了！', '啾啾！！'], story: '在云涧穿梭的雀妖，出题又快又刁。' },
    { id: 'yj2', name: '雾隐狐', kind: 'fox', hue: 210, taunt: ['答案藏在雾里～', '嘻嘻，看不清吧？'], hurt: ['雾散了！', '尾巴烧到了！'], story: '九尾雾狐的后裔，善用迷雾遮蔽思路。' },
    { id: 'yj3', name: '雷鼓娃', kind: 'sprite', hue: 230, taunt: ['咚咚！心跳加速了吗？', '打雷咯！'], hurt: ['鼓破了！', '哎呀！'], story: '背着小雷鼓的娃娃妖，敲鼓扰人心神。' },
    { id: 'yj4', name: '流岚灵', kind: 'slime', hue: 190, taunt: ['像风一样自由～', '追上我再说！'], hurt: ['凝不住了！', '散了散了！'], story: '山岚凝成的灵体，飘忽不定。' },
    { id: 'yjb1', name: '苍云鹤君', kind: 'boss_crane', hue: 205, boss: true, taunt: ['速算不精，难登此涧！', '鹤鸣九霄，尔可敢应？'], hurt: ['翎羽折损！', '好个少年郎！'], story: '流云涧之主，一身傲骨，只敬速算高手。' },
    { id: 'yjb2', name: '雷泽真蛟', kind: 'boss_dragon', hue: 225, boss: true, taunt: ['雷池之内，寸步难行！', '尔的心算，可快过闪电？'], hurt: ['雷鳞崩落！', '竟比雷还快！'], story: '雷泽中修行的真蛟，攻势如疾雷。' },
  ],
  qianji: [
    { id: 'qj1', name: '铜齿鼠', kind: 'sprite', hue: 20, taunt: ['一千米是几千米？嘿嘿', '换算错了可要挨咬！'], hurt: ['齿轮卡住了！', '吱嘎！'], story: '啃食度量刻度的小妖，最恨换算精准的人。' },
    { id: 'qj2', name: '发条傀', kind: 'golem', hue: 25, taunt: ['滴答、滴答……', '时辰不对，换算重来！'], hurt: ['发条崩了！', '零件散落！'], story: '千机阁遗落的傀儡，只认精确的数字。' },
    { id: 'qj3', name: '量天尺妖', kind: 'vine', hue: 15, taunt: ['量一量你的斤两！', '几厘米？量错啦！'], hurt: ['尺断了！', '刻度花了！'], story: '一把成精的量天尺，说话句句带"量"。' },
    { id: 'qj4', name: '砝码灵', kind: 'slime', hue: 35, taunt: ['一吨等于几千克呀？', '压死你哟～'], hurt: ['失衡了！', '轻了轻了！'], story: '天平上的砝码所化，为人苛刻，锱铢必较。' },
    { id: 'qjb1', name: '千机阁主', kind: 'boss_mech', hue: 22, boss: true, taunt: ['吾阁机关，以度量为锁！', '差之毫厘，谬以千里！'], hurt: ['机关失灵！', '算无遗策？！'], story: '掌管千机阁的机关大师，出题最重单位换算。' },
    { id: 'qjb2', name: '浑天巨傀', kind: 'boss_golem', hue: 28, boss: true, taunt: ['浑天之力，压碎迟疑！', '快！再快！'], hurt: ['铜身开裂！', '轰隆……'], story: '以浑天仪为核的巨型傀儡，转动时天地变色。' },
  ],
  bibo: [
    { id: 'bb1', name: '水泡精', kind: 'slime', hue: 175, taunt: ['0.5 是几分之几呀？', '啵啵啵～'], hurt: ['泡泡破了！', '别戳我！'], story: '潭中水泡所化，圆滚滚软绵绵。' },
    { id: 'bb2', name: '碧鳞鲤', kind: 'fish', hue: 170, taunt: ['小数点游走咯～', '往左移？往右移？'], hurt: ['鳞片掉了！', '扑腾！'], story: '尾巴一甩就能拨动小数点的鲤妖。' },
    { id: 'bb3', name: '龟丞相', kind: 'turtle', hue: 155, taunt: ['慢慢来？那可不行～', '老夫考考你！'], hurt: ['龟甲裂纹！', '哎哟！'], story: '碧波潭的老丞相，出题一板一眼。' },
    { id: 'bb4', name: '涟漪灵', kind: 'sprite', hue: 185, taunt: ['一圈圈，晕了吗？', '波纹会骗人哟～'], hurt: ['波纹乱了！', '呀！'], story: '水面涟漪凝成的小灵。' },
    { id: 'bbb1', name: '碧波龙女', kind: 'boss_serpent', hue: 178, boss: true, taunt: ['潭中数千小数点，可敢来数？', '此潭深 0.001 里，你算得清么？'], hurt: ['水袖破损！', '好精准的数感！'], story: '碧波潭之主，优雅而骄傲，最爱考小数。' },
    { id: 'bbb2', name: '玄冰蚌皇', kind: 'boss_clam', hue: 165, boss: true, taunt: ['珍珠之内，藏着答案…', '寒气冻结你的思路！'], hurt: ['蚌壳崩开！', '珍珠碎了！'], story: '万年玄蚌，壳中珍珠映出万千小数。' },
  ],
  xinghai: [
    { id: 'xh1', name: '星屑鼠', kind: 'sprite', hue: 265, taunt: ['三分之一大还是二分之一大？', '星星眨眼，你分心啦！'], hurt: ['星屑散了！', '吱呀！'], story: '偷吃星屑的小妖，啃出满天分数。' },
    { id: 'xh2', name: '月牙蝶', kind: 'butterfly', hue: 280, taunt: ['约分了吗就来打我？', '翅膀一半是几分之几～'], hurt: ['翅膀破了！', '飘不稳了！'], story: '月光织成的蝶妖，翅纹是分数线。' },
    { id: 'xh3', name: '碎星傀', kind: 'golem', hue: 250, taunt: ['把你打成八分之一！', '通分！通分！'], hurt: ['星核震裂！', '碎了一角！'], story: '陨星碎片拼成的傀儡。' },
    { id: 'xh4', name: '雾星灵', kind: 'slime', hue: 290, taunt: ['答案在星雾里～', '看不清分母吧？'], hurt: ['雾气散了！', '呜——'], story: '星雾凝成的灵体，善于把分数变模糊。' },
    { id: 'xhb1', name: '星衍上仙', kind: 'boss_celestial', hue: 270, boss: true, taunt: ['星辰运转，皆是分数！', '尔之数道，可窥天机？'], hurt: ['星图紊乱！', '后生可畏……'], story: '堕入魔道的上仙，以星辰为筹演算天机。' },
    { id: 'xhb2', name: '噬空魔君', kind: 'boss_void', hue: 255, boss: true, taunt: ['万物皆可分割……包括你！', '在虚空中，答案毫无意义！'], hurt: ['虚空震荡！', '不——！'], story: '星辰海最深处的魔君，六境最终之敌。' },
  ],
};

// ---------- 灵兽图鉴 ----------
// 每秘境 3 只：R(第3章BOSS掉) / SR(第6章BOSS掉) / SSR(全章3星)
const BEASTS = [
  { id: 'b_zhu', zone: 'zhulin', name: '碧竹貂', rarity: 'R', kind: 'beast_weasel', hue: 130, desc: '竹灵所化的小貂，蜷在袖中能安神提速。' },
  { id: 'b_luzhu', zone: 'zhulin', name: '青露鹿', rarity: 'SR', kind: 'beast_deer', hue: 150, desc: '角挂晨露的灵鹿，踏叶无声。' },
  { id: 'b_zhuhuang', zone: 'zhulin', name: '篁羽凰', rarity: 'SSR', kind: 'beast_phoenix', hue: 120, desc: '竹林深处的翠凰，鸣声可解百惑。' },
  { id: 'b_shahu', zone: 'shamo', name: '沙金狐', rarity: 'R', kind: 'beast_fox', hue: 42, desc: '尾扫黄沙便知方位的小狐。' },
  { id: 'b_yansun', zone: 'shamo', name: '岩隼', rarity: 'SR', kind: 'beast_falcon', hue: 30, desc: '目力惊人的猎隼，可在沙暴中辨数。' },
  { id: 'b_jinlin', zone: 'shamo', name: '金鳞地龙', rarity: 'SSR', kind: 'beast_dragon', hue: 45, desc: '潜行沙海的幼龙，鳞片刻满乘法真诀。' },
  { id: 'b_yunque', zone: 'yunjian', name: '疾云雀', rarity: 'R', kind: 'beast_bird', hue: 200, desc: '比风更快的小雀，速算时啾啾助威。' },
  { id: 'b_shuanhu', zone: 'yunjian', name: '霜岚虎', rarity: 'SR', kind: 'beast_tiger', hue: 215, desc: '踏岚而行的白虎，虎啸可定心神。' },
  { id: 'b_leipeng', zone: 'yunjian', name: '雷翼大鹏', rarity: 'SSR', kind: 'beast_roc', hue: 230, desc: '振翅生雷的大鹏，一念千里。' },
  { id: 'b_tonggui', zone: 'qianji', name: '铜芯龟', rarity: 'R', kind: 'beast_turtle', hue: 22, desc: '背驮小罗盘的机关龟，量度分毫不差。' },
  { id: 'b_faxiao', zone: 'qianji', name: '法条鸮', rarity: 'SR', kind: 'beast_owl', hue: 28, desc: '发条驱动的猫头鹰，滴答声助人专注。' },
  { id: 'b_hunlu', zone: 'qianji', name: '浑天麒麟', rarity: 'SSR', kind: 'beast_qilin', hue: 35, desc: '蹄踏星盘的机关麒麟，度量万物。' },
  { id: 'b_boli', zone: 'bibo', name: '波璃虾', rarity: 'R', kind: 'beast_shrimp', hue: 175, desc: '透明如琉璃的小虾，弹指拨动小数点。' },
  { id: 'b_yueting', zone: 'bibo', name: '月汀鹭', rarity: 'SR', kind: 'beast_heron', hue: 185, desc: '单足立于月光水面的白鹭。' },
  { id: 'b_canglong', zone: 'bibo', name: '沧浪玉龙', rarity: 'SSR', kind: 'beast_dragon2', hue: 170, desc: '碧波深处的玉龙，行云布雨皆有度。' },
  { id: 'b_xingtu', zone: 'xinghai', name: '星尘兔', rarity: 'R', kind: 'beast_rabbit', hue: 275, desc: '耳朵能接住流星的小兔。' },
  { id: 'b_yinhe', zone: 'xinghai', name: '银河猫', rarity: 'SR', kind: 'beast_cat', hue: 260, desc: '瞳中流转银河的灵猫，夜行万里。' },
  { id: 'b_tianshu', zone: 'xinghai', name: '天枢神鲸', rarity: 'SSR', kind: 'beast_whale', hue: 250, desc: '遨游星海的神鲸，鲸歌演化万数。' },
];

const RARITY_META = {
  N: { name: '凡品', color: '#9aa5b5' },
  R: { name: '灵品', color: '#5ec8f0' },
  SR: { name: '仙品', color: '#c98fe8' },
  SSR: { name: '神品', color: '#ffd75e' },
};

// ---------- 鼓励语 / 口诀提示 ----------
const CHEERS = ['剑气如虹！', '数道精进！', '好快的心算！', '妖兽胆寒！', '灵光一闪！', '心如明镜！'];
const COMFORTS = ['莫慌，深呼吸再来！', '错题即机缘，记住它！', '大道不怕慢，就怕站！', '再试一次，剑会更快！'];
const SPEED_GRADES = [
  { grade: 'S', label: '疾如闪电', mult: 2.0, color: '#ffd75e' },
  { grade: 'A', label: '快剑', mult: 1.5, color: '#8fe8e0' },
  { grade: 'B', label: '稳健', mult: 1.0, color: '#a0c0e8' },
  { grade: 'C', label: '迟缓', mult: 0.7, color: '#9aa5b5' },
];
const COMBO_TIERS = [
  { at: 0, name: '', mult: 1.0, cls: '' },
  { at: 3, name: '凝神', mult: 1.2, cls: 'combo-t1' },
  { at: 5, name: '引灵', mult: 1.5, cls: 'combo-t2' },
  { at: 8, name: '驭剑', mult: 2.0, cls: 'combo-t3' },
  { at: 12, name: '剑心', mult: 2.5, cls: 'combo-t4' },
  { at: 16, name: '天人合一', mult: 3.0, cls: 'combo-t5' },
];
function comboTier(n) {
  let t = COMBO_TIERS[0];
  for (const c of COMBO_TIERS) if (n >= c.at) t = c;
  return t;
}
