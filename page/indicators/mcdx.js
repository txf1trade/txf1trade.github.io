/* MCDX（副圖）— 來源：MCDX_更新.txt（MCDX for qwert）
 * 莊家層 / 游資層 / 散戶區 柱狀 + 三條均線；左側表格顯示 5M / 15M / 60M 的莊家 / 游資 / 散戶比例與趨勢得分。
 * 5M / 15M / 60M 資料由頁面另外抓取，載入完成前表格不顯示。 */
(function () {
  const C = { bkS: '#f52f2f', bkW: '#dfa59f', rtS: '#048000', rtW: '#8ed984', hot: 'rgba(252,245,45,.925)' };
  const HEAD = '#363a45', A = 0.8;                       // 表格背景透明度 20 → 不透明度 0.8
  const lenOf = (mode, manual) => mode === 'auto' ? (i => i < 100 ? (i < 3 ? 3 : i) : 100) : mode === '50' ? (() => 50) : mode === '100' ? (() => 100) : (() => manual);

  /* f_mcdx_logic：回傳每根K棒的 pc(莊家) / fc(游資) 與其均線 */
  function logic(ta, cs, lenFn, off, maLen) {
    const n = cs.length, H = cs.map(b => b.high), L = cs.map(b => b.low), Cl = cs.map(b => b.close);
    const e20 = ta.ema(Cl, 20), pc = new Array(n), fc = new Array(n);
    for (let i = 0; i < n; i++) {
      const len = lenFn(i), h = ta.hi(H, i, len), l = ta.lo(L, i, len);
      if (h !== h || l !== l) { pc[i] = fc[i] = NaN; continue; }
      const src = Cl[i], op = cs[i].open, hh = cs[i].high, r = Math.max(h - l, 0.00001), avg = (h + l) / 2;
      const a50 = (ta.hi(H, i, 50) + ta.lo(L, i, 50)) / 2;
      const raw = ((src - l) / r * 100 + (src - avg) / r * 100) / 2 + 25 + off;
      pc[i] = raw < 0 ? 0 : raw > 100 ? 100 : raw;
      const base = 100 - (h - src) / r * 100 + 25, big = len >= 100;
      const f1 = big ? (src > op && l > e20[i] && l > avg && l > a50) : (src > op && l > e20[i] && l > avg);
      const f2 = big ? (src > op && src > e20[i] && src > avg && src > a50) : (src > op && src > e20[i] && src > avg);
      const f3 = big ? (src > e20[i] && op > avg && op > a50 && src > a50 && src > avg) : (src > e20[i] && op > avg && src > avg);
      const f4 = big ? (src >= op && hh > avg && src > a50) : (src >= op && hh > avg && src > avg);
      const fin = (f1 || f2 || f3 || f4) ? 100 : base;
      fc[i] = fin < 0 ? 0 : fin > 100 ? 100 : fin;
    }
    return { pc, fc, emaPc: ta.ema(pc, maLen), emaLc: ta.ema(fc.map(x => 100 - x), maLen), emaFc: ta.ema(fc, maLen) };
  }

  const memo = {};
  TVInd.register({
    id: 'mcdx', name: 'MCDX', desc: 'MCDX 莊家/游資/散戶 + 5M·15M·60M 表格', pane: 'sub', height: 150, range: [0, 100], defaultOn: false,
    params: [
      { key: 'autoOff', label: '自動設定偏移', type: 'bool', def: true },
      { key: 'off', label: '手動偏移', type: 'number', def: 5, min: 0.01, max: 50, step: 0.01 },
      { key: 'maLen', label: '均線期數', type: 'number', def: 10, min: 1, max: 100, step: 1 },
      { key: 'mode', label: '長度選擇', type: 'select', def: 'auto', options: [['auto', '自動'], ['50', '50天'], ['100', '100天'], ['manual', '手動輸入']] },
      { key: 'manual', label: '手動長度', type: 'number', def: 100, min: 3, max: 500, step: 1 },
      { key: 'table', label: '顯示表格', type: 'bool', def: true },
      { key: 'pos', label: '表格位置', type: 'select', def: 'left', options: [['left', '置左'], ['right', '置右']] }
    ],
    series: [
      { key: 'retail', kind: 'hist', title: '散戶區', color: C.rtS },
      { key: 'hot', kind: 'hist', title: '游資層', color: C.hot },
      { key: 'banker', kind: 'hist', title: '莊家層', color: C.bkS },
      { key: 'bMA', kind: 'line', title: '莊家均線', color: '#8d0d0d', width: 2 },
      { key: 'hMA', kind: 'line', title: '游資均線', color: '#ff7d03', width: 2 },
      { key: 'rMA', kind: 'line', title: '散戶均線', color: '#1b41bd', width: 2 }
    ],
    hlines: [{ price: 75, color: '#000000' }, { price: 50, color: '#000000', width: 2 }, { price: 25, color: '#000000' }],
    calc(c) {
      const { p, ta, n } = c, lenFn = lenOf(p.mode, p.manual);
      const off = p.autoOff ? (c.resMin ? (c.resMin <= 5 ? 0.5 : 2.5) : 5.0) : p.off;
      const m = logic(ta, c.candles, lenFn, off, p.maLen);
      const retailC = new Array(n), bankC = new Array(n);
      for (let i = 0; i < n; i++) {
        retailC[i] = m.pc[i] >= m.emaPc[i] ? C.rtW : C.rtS;
        bankC[i] = m.pc[i] > m.emaPc[i] ? C.bkS : C.bkW;
      }
      const out = {
        retail: { v: new Array(n).fill(100), c: retailC }, hot: { v: m.fc }, banker: { v: m.pc, c: bankC },
        bMA: { v: m.emaPc }, hMA: { v: m.emaFc }, rMA: { v: m.emaLc },
        legend: i => m.pc[i] !== m.pc[i] ? [] : [
          { n: '莊家', v: Math.round(m.pc[i]) + '%', c: '#ff5252' },
          { n: '游資', v: Math.round(Math.max(m.fc[i] - m.pc[i], 0)) + '%', c: '#fcf52d' },
          { n: '散戶', v: Math.round(100 - m.fc[i]) + '%', c: '#3ac019' }]
      };
      if (p.table) {
        const rows = [], scores = [];
        [['5M', '5', 12, 0.5], ['15M', '15', 30, 2.5], ['60M', '60', 60, 5.0]].forEach(([nm, res, days, o]) => {
          const bars = c.api.getBars(res, days); if (!bars) return;
          const key = [res, p.mode, p.manual, p.maLen, bars.length, bars[bars.length - 1].time, bars[bars.length - 1].close, bars[bars.length - 1].high, bars[bars.length - 1].low].join('|');
          let r = memo[res]; if (!r || r.key !== key) { const q = logic(ta, bars, lenFn, o, p.maLen), i = bars.length - 1; r = memo[res] = { key, pc: q.pc[i], fc: q.fc[i], ema: q.emaPc[i] }; }
          if (r.pc !== r.pc) return;
          const hd = { t: nm, bg: rgba(HEAD, A) }, pcC = { t: Math.round(r.pc) + '%', bg: rgba(r.pc > r.ema ? C.bkS : C.bkW, A), fg: '#000' };
          rows.push([hd, pcC, { t: Math.round(Math.max(r.fc - r.pc, 0)) + '%', bg: rgba('#ccc8c8', A), fg: '#000' }, { t: Math.round(100 - r.fc) + '%', bg: rgba('#3ac019', A), fg: '#000' }]);
          scores.push(r.pc > 50 && 100 - r.fc < 25 ? 1 : 0);
        });
        if (rows.length) {
          const sc = scores.reduce((a, b) => a + b, 0);
          const txt = sc === 3 ? '強勢噴發' : sc === 2 ? '多頭強勁' : sc === 1 ? '趨勢偏多' : '震盪洗盤';
          const col = sc === 3 ? C.bkS : sc === 2 ? '#ff5252' : sc === 1 ? '#ffab91' : C.rtS;
          rows.push([{ t: txt, bg: rgba(col, A), fg: '#fff', span: 4 }]);
          out.table = { pos: p.pos === 'right' ? 'middle_right' : 'middle_left', rows };
        }
      }
      return out;
    }
  });
  function rgba(hex, a) { return TVInd.rgba(hex, a); }
})();
