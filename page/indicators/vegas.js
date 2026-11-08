/* Vegas 隧道（主圖）— 來源：VEGAS.txt
 * EMA12、EMA144/169（中長線趨勢隧道）、EMA576/676（長線趨勢隧道）、EMA200（過濾線）
 * 顏色為自訂（原檔只有 EMA 公式）。長期線需要較多 K 棒才準，K 棒不足時前段僅供參考。 */
TVInd.register({
  id: 'vegas', name: 'Vegas', desc: 'Vegas 隧道 EMA12 / 144 / 169 / 200 / 576 / 676', pane: 'main', defaultOn: false,
  params: [
    { key: 'e12', label: 'EMA 濾線', type: 'number', def: 12, min: 1, max: 2000, step: 1 },
    { key: 'e144', label: 'EMA 短線 1', type: 'number', def: 144, min: 1, max: 2000, step: 1 },
    { key: 'e169', label: 'EMA 短線 2', type: 'number', def: 169, min: 1, max: 2000, step: 1 },
    { key: 'e576', label: 'EMA 長線 1', type: 'number', def: 576, min: 1, max: 3000, step: 1 },
    { key: 'e676', label: 'EMA 長線 2', type: 'number', def: 676, min: 1, max: 3000, step: 1 }
  ],
  series: [
    { key: 'a', kind: 'line', title: 'EMA12', color: '#df8028', width: 2 },
    { key: 'b', kind: 'line', title: 'EMA144', color: '#ffffff', width: 2, legend: true },
    { key: 'c', kind: 'line', title: 'EMA169', color: '#ffffff', width: 2, legend: true },
    { key: 'e', kind: 'line', title: 'EMA576', color: '#2196f3', width: 2, legend: true },
    { key: 'f', kind: 'line', title: 'EMA676', color: '#2196f3', width: 2, legend: true }
  ],
  calc(c) {
    const e = (k) => ({ v: c.ta.ema(c.c, c.p[k]) });
    return { a: e('e12'), b: e('e144'), c: e('e169'), d: e('e200'), e: e('e576'), f: e('e676') };
  }
});
