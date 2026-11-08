/* 均價 VWAP（主圖）— 對應 ATR_更新.txt 的「均價VWAP」開關
 * 注意：原本的 VWAP.txt 是空檔，這裡用標準做法：以 hlc3 × 成交量累計，
 * 每個「交易日時段」重新起算（時段與必來點相同，見 APP_CFG.zoneSessions）。日K / 週K 不顯示。 */
TVInd.register({
  id: 'vwap', name: 'VWAP', desc: '均價 VWAP（每個交易日重新起算）', pane: 'main', defaultOn: false,
  params: [],
  series: [{ key: 'v', kind: 'line', title: 'VWAP', color: '#e040fb', width: 2, label: true, legend: true, scale: true }],
  calc(c) {
    if (c.isDay || c.isWeek) return null;
    const key = c.api.sessKeyFn(c.code), out = new Array(c.n);
    let cur = null, pv = 0, vv = 0;
    for (let i = 0; i < c.n; i++) {
      const k = key(c.t[i]); if (k !== cur) { cur = k; pv = 0; vv = 0; }
      const tp = (c.h[i] + c.l[i] + c.c[i]) / 3; pv += tp * c.v[i]; vv += c.v[i];
      out[i] = vv > 0 ? pv / vv : NaN;
    }
    return { v: { v: out } };
  }
});
