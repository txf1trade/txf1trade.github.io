/* 多頭 E20 / E60（主圖）— 來源：多頭.txt
 * E20：收盤在 E20 之上紅色、之下綠色（台股紅漲綠跌）；E60：青色 */
TVInd.register({
  id: 'duotou', name: '多頭', desc: 'EMA20（多空變色）/ EMA60', pane: 'main', defaultOn: false,
  params: [
    { key: 'l1', label: 'E20 期數', type: 'number', def: 20, min: 1, max: 500, step: 1 },
    { key: 'l2', label: 'E60 期數', type: 'number', def: 60, min: 1, max: 500, step: 1 }
  ],
  series: [
    { key: 'e1', kind: 'line', title: 'E20', color: '#db2d2d', width: 2, legend: true, scale: true },
    { key: 'e2', kind: 'line', title: 'E60', color: '#00e1ff', width: 2, legend: true, scale: true }
  ],
  calc(c) {
    const a = c.ta.ema(c.c, c.p.l1), b = c.ta.ema(c.c, c.p.l2);
    return { e1: { v: a, c: a.map((v, i) => c.c[i] > v ? '#db2d2d' : '#489e2e') }, e2: { v: b } };
  }
});
