/* 成交量（副圖）— 紅漲綠跌（收盤 >= 開盤為紅），附成交量均線 */
TVInd.register({
  id: 'volume', name: '成交量', desc: '成交量柱狀（紅漲綠跌）+ 均量線', pane: 'sub', height: 90, defaultOn: false,
  params: [
    { key: 'maLen', label: '均量期數(0=不顯示)', type: 'number', def: 20, min: 0, max: 200, step: 1 }
  ],
  series: [
    { key: 'vol', kind: 'hist', title: '量', color: '#f23645' },
    { key: 'ma', kind: 'line', title: '均量', color: '#ffb74d', width: 1 }
  ],
  calc(c) {
    const col = c.o.map((o, i) => c.c[i] >= o ? 'rgba(242,54,69,.8)' : 'rgba(8,153,129,.8)');
    const ma = c.p.maLen > 0 ? c.ta.sma(c.v, c.p.maLen) : null;
    const f = x => Math.round(x).toLocaleString('en-US');
    return {
      vol: { v: c.v, c: col }, ma: ma ? { v: ma } : null,
      legend: i => [{ n: '量', v: f(c.v[i]), c: c.c[i] >= c.o[i] ? '#f23645' : '#089981' }].concat(ma && ma[i] === ma[i] ? [{ n: '均量', v: f(ma[i]), c: '#ffb74d' }] : [])
    };
  }
});
