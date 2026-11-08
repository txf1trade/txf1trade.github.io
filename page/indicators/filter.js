/* 過濾線（主圖）— 來源：過濾線.txt
 * ema12 = ta.ema(close, 12)；plot(ema12, color = #df8028, title = 'E12', linewidth = 2) */
TVInd.register({
  id: 'filter', name: '過濾線', desc: '過濾線 EMA12（橘色）', pane: 'main', defaultOn: false,
  params: [
    { key: 'len', label: 'EMA 週期', type: 'number', def: 12, min: 2, max: 200, step: 1 }
  ],
  series: [
    { key: 'e12', kind: 'line', title: 'E12', color: '#df8028', width: 2, label: true }
  ],
  calc(c) {
    const e = c.ta.ema(c.c, c.p.len);
    return {
      e12: { v: e },
      legend: i => e[i] === e[i] ? [{ n: 'E12', v: Math.round(e[i]).toLocaleString('en-US'), c: '#df8028' }] : []
    };
  }
});
