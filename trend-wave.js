/* ============================================================
 * 台指順勢波段  (由 Pine Script v5 移植)
 * 規則：15 分K 收盤價「連續 confirmBars 根」都在 EMA(emaLength) 之上 → 多(紅 +1)
 *       連續 confirmBars 根都在 EMA 之下 → 空(綠 -1)；其餘維持前一狀態
 * 與 Pine 的 request.security(lookahead_off) 行為一致：
 *   - 圖表週期 < 15 分：15 分K 為「形成中」，以本根收盤價與前一根已完成的 EMA 推算
 *   - 圖表週期 >= 15 分：取涵蓋該根 K 棒的最後一根 15 分K
 * 修改參數只需改下面 PARAMS，不必動主網頁。
 * ============================================================ */
(function () {
  const PARAMS = { emaLength: 76, confirmBars: 2, tf: '15' };

  let cache = { code: '', from: 0, at: 0, bars: [], ema: [] };

  /* 二分搜尋：最後一個 time <= t 的索引 (找不到 -1) */
  function lastLE(arr, t) {
    let lo = 0, hi = arr.length - 1, r = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m].time <= t) { r = m; lo = m + 1; } else hi = m - 1; }
    return r;
  }

  TVIndicators.register({
    id: 'trend-wave',
    name: '台指順勢波段',
    tab: '順勢波段',
    height: '16%',
    refreshMs: 15000,
    yRange: [-1.5, 1.5],
    priceLines: [{ price: 0, color: '#787b86', lineStyle: 2, lineWidth: 1, axisLabelVisible: false }],
    series: [{ key: 'col', type: 'histogram', options: { priceFormat: { type: 'price', precision: 0, minMove: 1 } } }],

    async compute(candles, host, force) {
      const { emaLength, confirmBars, tf } = PARAMS, tfSec = host.resSeconds(tf), alpha = 2 / (emaLength + 1);
      const code = host.symbol(); if (!code) return { col: [] };
      const from = candles[0].time - 7 * 86400;             // 多抓 7 天讓 EMA 暖機
      const stale = Date.now() - cache.at > 10000;
      if (cache.code !== code || from < cache.from || (force && stale)) {
        const bars = await host.fetchBars(code, tf, from);
        cache = { code, from, at: Date.now(), bars, ema: host.ema(bars.map(b => b.close), emaLength) };
      }
      const B = cache.bars, E = cache.ema;
      if (!B.length) return { col: [] };

      const dur = host.resSeconds(host.resolution());
      const out = [], bull = [], bear = [];
      let state = -1;
      candles.forEach((c, i) => {
        let c15 = null, e15 = null;
        if (dur < tfSec) {                                   // 形成中的 15 分K
          const j = lastLE(B, c.time);
          if (j >= 0 && c.time < B[j].time + tfSec) {
            const pe = j > 0 ? E[j - 1] : null;
            c15 = c.close; e15 = pe == null ? null : alpha * c15 + (1 - alpha) * pe;
          } else if (j >= 0) { c15 = B[j].close; e15 = E[j]; }
        } else {                                             // 涵蓋該根 K 的最後一根 15 分K
          const j = lastLE(B, c.time + dur - 1);
          if (j >= 0) { c15 = B[j].close; e15 = E[j]; }
        }
        const ok = c15 != null && e15 != null;
        bull[i] = ok && c15 > e15;                           // 與 Pine 相同：close15[i] 為「圖表上的前 i 根」
        bear[i] = ok && c15 < e15;
        if (i >= confirmBars - 1) {
          let isBull = true, isBear = true;
          for (let k = 0; k < confirmBars; k++) { if (!bull[i - k]) isBull = false; if (!bear[i - k]) isBear = false; }
          if (isBull) state = 1; else if (isBear) state = -1;
        }
        out.push({ time: c.time, value: state, color: state === 1 ? host.UP : host.DOWN });   // 紅=多、綠=空
      });
      return { col: out, cfg: { ...PARAMS } };
    },

    legend(t, res) {
      const p = res.col.find(x => x.time === t) || res.col[res.col.length - 1];
      if (!p) return '';
      return `<span style="color:${p.value === 1 ? '#f23645' : '#089981'}">${p.value === 1 ? '多方 ▲' : '空方 ▼'}</span>` +
             `<span style="color:#787b86">EMA${res.cfg.emaLength} · ${res.cfg.tf}分 · 連續${res.cfg.confirmBars}根</span>`;
    }
  });
})();
