/* 台指順勢波段（副圖）— 來源：台指波段_更新.txt
 * 以 15 分K 的 EMA76（短波）/ EMA380（長波）判斷多空：連續 N 根收盤在線上 = 多方(紅 +1)，
 * 連續 N 根在線下 = 空方(綠 -1)，其餘維持前一狀態。左下角表格顯示短波 / 長波目前狀態。
 * 15 分K 資料由頁面另外抓取（與圖表目前週期無關），載入完成前副圖是空的。 */
TVInd.register({
  id: 'wave', name: '波段', desc: '台指順勢波段（15分K EMA76 / EMA380 多空）', pane: 'sub', height: 100, range: [-1.25, 1.25], defaultOn: false,
  params: [
    { key: 'emaLen', label: 'EMA 週期', type: 'number', def: 76, min: 5, max: 500, step: 1 },
    { key: 'confirm', label: '連續幾根K線確認', type: 'number', def: 2, min: 1, max: 20, step: 1 }
  ],
  series: [{ key: 'w', kind: 'hist', title: '波段', color: '#e44040' }],
  hlines: [{ price: 0, color: '#787b86', style: 2 }],
  calc(c) {
    const b = c.api.getBars('15', 60); if (!b) return null;
    const cl = b.map(x => x.close), e76 = c.ta.ema(cl, c.p.emaLen), e380 = c.ta.ema(cl, 380);
    // 15 分K 對應到圖表每根K棒（lookahead_off：只用「已收完」的 15 分K；最後一根用進行中的）
    const n = c.n, c15 = new Array(n), s76 = new Array(n), s380 = new Array(n);
    let k = -1;
    for (let i = 0; i < n; i++) {
      const endT = c.t[i] + (c.resSec || 900);
      if (i === n - 1) { while (k + 1 < b.length && b[k + 1].time <= c.t[i]) k++; }
      else { while (k + 1 < b.length && b[k + 1].time + 900 <= endT) k++; }
      if (k < 0) { c15[i] = s76[i] = s380[i] = NaN; } else { c15[i] = cl[k]; s76[i] = e76[k]; s380[i] = e380[k]; }
    }
    const N = c.p.confirm;
    const flag = (sig, i) => { let bull = i >= N - 1, bear = i >= N - 1; for (let m = 0; m < N && i - m >= 0; m++) { const x = c15[i - m], y = sig[i - m]; if (!(x > y)) bull = false; if (!(x < y)) bear = false; } return [bull, bear]; };
    const v = new Array(n), col = new Array(n); let pv = 0;
    for (let i = 0; i < n; i++) {
      const [bu, be] = flag(s76, i);
      if (bu) pv = 1; else if (be) pv = -1;
      v[i] = pv === 0 ? NaN : pv; col[i] = pv === 1 ? '#e44040' : '#4caf50';
    }
    const [b76, r76] = flag(s76, n - 1), [b380, r380] = flag(s380, n - 1);
    const hdr = { bg: '#a9a9a9', fg: '#fff' };
    return {
      w: { v, c: col },
      table: {
        pos: 'bottom_left', rows: [
          [{ t: '週期', ...hdr }, { t: '趨勢', ...hdr }],
          [{ t: '短波' }, { t: b76 ? '⬆ 多方' : r76 ? '⬇ 空方' : '盤整', bg: b76 ? 'rgba(255,82,82,.8)' : r76 ? 'rgba(76,175,80,.8)' : '#787b86' }],
          [{ t: '長波' }, { t: b380 ? '⬆ 偏多' : r380 ? '⬇ 偏空' : '盤整', bg: b380 ? 'rgba(255,82,82,.6)' : r380 ? 'rgba(76,175,80,.6)' : '#787b86' }]
        ]
      },
      legend: () => [{ n: '短波', v: b76 ? '多' : r76 ? '空' : '盤整', c: b76 ? '#ff5252' : r76 ? '#4caf50' : '#787b86' }, { n: '長波', v: b380 ? '多' : r380 ? '空' : '盤整', c: b380 ? '#ff5252' : r380 ? '#4caf50' : '#787b86' }]
    };
  }
});
