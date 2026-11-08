/* ATR 趨勢（主圖）— 來源：ATR_更新.txt「主圖趨勢交易 V14.0」 */
TVInd.register({
  id: 'atr', name: 'ATR', desc: 'ATR 順勢趨勢線', pane: 'main', defaultOn: true,
  params: [
    { key: 'hl', label: '使用最高/最低點', type: 'bool', def: true },
    { key: 'len', label: '期數', type: 'number', def: 14, min: 1, max: 200, step: 1 },
    { key: 'atrLen', label: 'ATR 期數(EMA)', type: 'number', def: 14, min: 1, max: 200, step: 1 },
    { key: 'multi', label: 'ATR 權重', type: 'number', def: 2, min: 0.05, max: 20, step: 0.05 },
    { key: 'adv', label: '進階顏色', type: 'bool', def: true }
  ],
  series: [{ key: 'trend', kind: 'line', title: 'ATR', color: '#00cbff', width: 2, label: true, legend: true, scale: true }],
  calc(c) {
    const { candles: cs, n, p, ta } = c;
    const hiA = ta.highest(p.hl ? c.h : c.c, p.len), loA = ta.lowest(p.hl ? c.l : c.c, p.len);
    const atr = ta.ema(ta.tr(cs), p.atrLen).map(x => x * p.multi);
    const trend = new Array(n).fill(NaN), col = new Array(n);
    let udt = null;
    for (let i = 0; i < n; i++) {
      const prev = i ? trend[i - 1] : NaN, b = cs[i];
      const dir = i > 0 && hiA[i] > hiA[i - 1] ? 'up' : i > 0 && loA[i] < loA[i - 1] ? 'down' : 'neutral';
      let t;
      if (dir === 'up') { t = b.low - atr[i]; if (t < prev) t = prev; }
      else if (dir === 'down') { t = b.high + atr[i]; if (t > prev) t = prev; }
      else t = prev;
      trend[i] = t;
      if (t > prev) udt = 'up'; if (t < prev) udt = 'down';
      if (t !== t) continue;
      const hc = b.open + (b.close - b.open) / 2;       // half candle
      col[i] = p.adv
        ? ((hc < t && udt !== 'down') ? '#ff4100' : udt === 'up' ? '#00cbff' : hc > t ? '#ff4101' : '#ff0099')
        : (udt === 'up' ? '#00cbff' : '#ff0099');
    }
    return { trend: { v: trend, c: col } };
  }
});
