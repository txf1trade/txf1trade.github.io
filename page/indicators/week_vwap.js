/* 周成本 / 周關價（主圖）— 來源：周關價.txt
 * 以 hlc3 × 成交量累計，每週（台北時間週一起算）重新起算的週均價。週K 不顯示。 */
TVInd.register({
  id: 'week', name: '周成本', desc: '周成本（每週重新起算的 VWAP）', pane: 'main', defaultOn: false,
  params: [],
  series: [{ key: 'v', kind: 'line', title: '周成本', color: 'rgba(180,97,228,.87)', width: 3, label: true, legend: true, scale: true }],
  calc(c) {
    if (c.isWeek) return null;
    const out = new Array(c.n);
    let cur = null, pv = 0, vv = 0;
    for (let i = 0; i < c.n; i++) {
      const k = c.api.weekKey(c.t[i]); if (k !== cur) { cur = k; pv = 0; vv = 0; }
      pv += (c.h[i] + c.l[i] + c.c[i]) / 3 * c.v[i]; vv += c.v[i];
      out[i] = vv > 0 ? pv / vv : NaN;
    }
    return { v: { v: out } };
  }
});
