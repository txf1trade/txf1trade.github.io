/* 籌碼（副圖）— 來源：Chip_更新.txt「MCDX with Stable Table」
 * 以 RSI 換算的主力 / 熱錢 / 散戶柱狀（0~20），右側表格顯示三者百分比。 */
TVInd.register({
  id: 'chip', name: '籌碼', desc: '主力 / 熱錢 / 散戶 比例（RSI 版 MCDX）', pane: 'sub', height: 100, range: [0, 20], defaultOn: false,
  params: [
    { key: 'bBase', label: 'Banker Base', type: 'number', def: 50, min: 10, max: 90, step: 1 },
    { key: 'bPer', label: 'Banker RSI Period', type: 'number', def: 50, min: 10, max: 200, step: 1 },
    { key: 'hBase', label: 'Hot Money RSI Base', type: 'number', def: 30, min: 10, max: 90, step: 1 },
    { key: 'hPer', label: 'Hot Money RSI Period', type: 'number', def: 40, min: 10, max: 200, step: 1 },
    { key: 'bSens', label: 'Sensitivity Banker', type: 'number', def: 1.5, min: 0.1, max: 10, step: 0.1 },
    { key: 'hSens', label: 'Sensitivity Hot Money', type: 'number', def: 0.7, min: 0.1, max: 10, step: 0.1 }
  ],
  series: [
    { key: 'retail', kind: 'hist', title: '散戶', color: 'rgba(24,156,33,.66)' },
    { key: 'hot', kind: 'hist', title: '熱錢', color: 'rgba(255,230,0,.81)' },
    { key: 'banker', kind: 'hist', title: '主力', color: 'rgba(255,0,0,.74)' }
  ],
  hlines: [{ price: 15, color: '#000000', width: 2 }, { price: 10, color: '#ffffff', width: 2 }, { price: 5, color: '#000000', width: 2 }],
  calc(c) {
    const { p, ta, n } = c, f = (sens, per, base) => ta.rsi(c.c, per).map(r => { const v = sens * (r - base); return v !== v ? NaN : Math.max(0, Math.min(20, v)); });
    const rb = f(p.bSens, p.bPer, p.bBase), rh = f(p.hSens, p.hPer, p.hBase);
    const i = n - 1, bp = rb[i] / 20 * 100, hp = rh[i] / 20 * 100, rp = 100 - Math.max(bp, hp);
    const out = { retail: { v: new Array(n).fill(20) }, hot: { v: rh }, banker: { v: rb } };
    if (bp === bp && hp === hp) {
      out.table = { pos: 'middle_right', rows: [
        [{ t: Math.round(bp) + '%', bg: 'rgba(245,47,47,.91)' }],
        [{ t: Math.round(hp) + '%', bg: 'rgba(255,230,0,.8)', fg: '#000' }],
        [{ t: Math.round(rp) + '%', bg: 'rgba(58,192,25,.96)' }]] };
      out.legend = () => [{ n: '主力', v: Math.round(bp) + '%', c: '#ff5252' }, { n: '熱錢', v: Math.round(hp) + '%', c: '#ffe600' }, { n: '散戶', v: Math.round(rp) + '%', c: '#3ac019' }];
    }
    return out;
  }
});
