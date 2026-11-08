/* 日線 / 週線（主圖）— 來源：日周線.txt
 * 日線 = 15分K 的 EMA76（台指全日盤一天約 76 根 15分K），週線 = EMA380（5 天）。
 * 切換其他週期時，依「時間長度」換算期數（例如 60分K → 19 / 95、5分K → 228 / 1140），
 * 讓不同週期看到的是同一條線。日K / 週K 沒有意義，不顯示。 */
TVInd.register({
  id: 'dayweek', name: '日周線', desc: '日線 EMA76 / 週線 EMA380（以15分K為基準，隨週期換算）', pane: 'main', defaultOn: false,
  note: '以 15 分K 的 EMA76 / EMA380 為基準；其他分K週期自動換算期數。日K、週K不顯示。',
  params: [
    { key: 'colorDir', label: '日線多空色', type: 'bool', def: true },
    { key: 'dLen', label: '日線期數(15分K)', type: 'number', def: 76, min: 5, max: 500, step: 1 },
    { key: 'wLen', label: '週線期數(15分K)', type: 'number', def: 380, min: 20, max: 3000, step: 1 }
  ],
  series: [
    { key: 'd', kind: 'line', title: '日線', color: '#f52525', width: 3, label: true, legend: true, scale: true },
    { key: 'w', kind: 'line', title: '週線', color: '#2186c0', width: 3, label: true, legend: true, scale: true }
  ],
  calc(c) {
    if (!c.resMin) return null;
    const k = 15 / c.resMin, dl = Math.max(2, Math.round(c.p.dLen * k)), wl = Math.max(2, Math.round(c.p.wLen * k));
    const d = c.ta.ema(c.c, dl), w = c.ta.ema(c.c, wl);
    const col = d.map((v, i) => c.p.colorDir ? (i && v > d[i - 1] ? '#f52525' : '#15af1a') : '#077c59');
    return { d: { v: d, c: col }, w: { v: w } };
  }
});
