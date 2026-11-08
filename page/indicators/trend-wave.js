/* ============================================================
 * 指標與商品設定中心 (indicators/trend-wave.js)
 * 主網頁於 <head> 先載入本檔，再讀取 window.TV_SETTINGS：
 *   lines    : 各商品的均線長度 (過濾線 / 多頭線 / 日線 / 週線)
 *   tickSize : 各商品最小跳動點 → 決定 K 線與報價的小數位數
 * 規則：K 線、報價依跳動點顯示；均線、VWAP、指標數值一律取整數
 * 新增商品或修改均線長度，只需改這裡，不必動主網頁。
 * ============================================================ */
(function () {
  const lines = {
    'TX-1':    { filter: 12, ema20: 20, ema60: 60, daily: 76, weekly: 380 },
    'TXAM-1':  { filter: 12, ema20: 20, ema60: 60, daily: 76, weekly: 380 },
    'TWN-1':   { filter: 12, ema20: 20, ema60: 60, daily: 80, weekly: 400 },
    'NQ-1':    { filter: 12, ema20: 20, ema60: 60, daily: 92, weekly: 460 },
    'GC-1':    { filter: 12, ema20: 20, ema60: 60, daily: 92, weekly: 460 },
    'NK-1':    { filter: 12, ema20: 20, ema60: 60, daily: 92, weekly: 460 },
    'BTCUSDT': { filter: 12, ema20: 20, ema60: 60, daily: 96, weekly: 480 },
    'DEFAULT': { filter: 12, ema20: 20, ema60: 60, daily: 20, weekly: 60 }
  };
  const TICKS = { 'TX-1': 1, 'TXAM-1': 1, 'TWN-1': 0.05, 'NQ-1': 0.25, 'GC-1': 0.1, 'NK-1': 5,
                  'BTCUSDT': 0.01, 'TSEA': 0.01, 'OTCA': 0.01, 'TAIWANVIX': 0.01 };
  function tickSize(code, price) {
    const c = String(code || '').toUpperCase();
    if (c in TICKS) return TICKS[c];
    const p = price || 0;                                   // 個股 / 股期：台股升降單位
    return p < 10 ? 0.01 : p < 50 ? 0.05 : p < 100 ? 0.1 : p < 500 ? 0.5 : p < 1000 ? 1 : 5;
  }
  /* ---- 多空必來點：各商品「交易日時段」設定 ----
   *  tz      : 時區 (決定換日時間，自動處理夏令時間)
   *  start   : 交易日起算時間 (當地時間，分鐘；525=08:45、900=15:00、1080=18:00)
   *  evening : true = 夜盤/盤前時段歸入「隔一個」交易日 (台指 15:00、美期 18:00、日經夜盤)
   *  weekend : true = 週六日也是交易日 (比特幣)；false = 週末順延到週一
   *  day     : [起,迄] 日盤分鐘範圍，供「僅日盤」統計使用 (沒有日夜盤之分的商品不用填)
   *  closeAt : 前收定義  'session' = 前一個整個時段的最後收盤 (預設)
   *                      'day'     = 前一個時段中「日盤」的收盤 (有 day 才有效)
   *  label   : 顯示說明文字
   *  新增商品或調整時段只改這裡。 */
  const zoneSessions = {
    'TX-1':    { tz: 'Asia/Taipei',      start: 900,  evening: true,  day: [525, 825], closeAt: 'session', label: '全日盤 15:00~13:45' },
    'TXAM-1':  { tz: 'Asia/Taipei',      start: 525,  evening: false,                  closeAt: 'session', label: '日盤 08:45~13:45' },
    'TWN-1':   { tz: 'Asia/Taipei',      start: 525,  evening: false, day: [525, 825], closeAt: 'session', label: '全日盤 08:45~次日05:15' },
    'NQ-1':    { tz: 'America/New_York', start: 1080, evening: true,                   closeAt: 'session', label: 'CME 美東18:00~17:00' },
    'GC-1':    { tz: 'America/New_York', start: 1080, evening: true,                   closeAt: 'session', label: 'COMEX 美東18:00~17:00' },
    'NK-1':    { tz: 'Asia/Tokyo',       start: 990,  evening: true,  day: [525, 945], closeAt: 'session', label: '全日盤 夜盤+日盤' },
    'BTCUSDT': { tz: 'UTC',              start: 0,    evening: false, weekend: true,    closeAt: 'session', label: '24H（UTC 00:00 換日）' }
  };
  /* ---- 多空必來點：預設參數 (網頁設定選單修改後會以選單為準) ---- */
  const zone = { sessMode: 'auto', baseMode: 'prev', lookback: 20, shortN: 5, wLong: 0.5, wShort: 0.3, wLast: 0.2, linear: true, kTarget: 0.25, kRange: 0.5 };
  window.TV_SETTINGS = { lines, tickSize, zoneSessions, zone };
})();

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
  const PARAMS = { confirmBars: 2, tf: '15', useLine: 'daily' };   // useLine: 'daily' 或 'weekly'，EMA 長度依商品由 TV_SETTINGS.lines 決定

  /* 依商品代碼取得均線長度；查不到的商品 (個股等) 使用 DEFAULT */
  function emaLenFor(code, key) {
    const L = (window.TV_SETTINGS && window.TV_SETTINGS.lines) || {};
    const c = String(code || '').toUpperCase();
    const row = L[c] || L['DEFAULT'] || {};
    return row[key] || row.daily || 76;
  }

  let cache = { code: '', len: 0, from: 0, at: 0, bars: [], ema: [] };

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
    height: '10%',
    minHeight: '56px',
    refreshMs: 15000,
    yRange: [-1.5, 1.5],
    priceLines: [{ price: 0, color: '#787b86', lineStyle: 2, lineWidth: 1, axisLabelVisible: false }],
    /* 參數視窗（連點兩下「順勢波段」開啟）；數值由主網頁存檔，compute 以 host.params 取得 */
    params: [
      { key: 'confirmBars', label: '連續確認 K 棒數', value: PARAMS.confirmBars, min: 1, max: 20, step: 1 },
      { key: 'useLine', label: '使用均線', type: 'select', value: PARAMS.useLine, options: [['daily', '日線'], ['weekly', '週線']] },
      { key: 'emaLen', label: 'EMA 長度 (0=依商品)', value: 0, min: 0, max: 1000, step: 1 }
    ],
    series: [{ key: 'col', type: 'histogram', options: { priceFormat: { type: 'price', precision: 0, minMove: 1 } } }],

    async compute(candles, host, force) {
      const P = Object.assign({}, PARAMS, host.params || {});
      const confirmBars = Math.max(1, +P.confirmBars || PARAMS.confirmBars), tf = P.tf, useLine = P.useLine === 'weekly' ? 'weekly' : 'daily', tfSec = host.resSeconds(tf);
      const code = host.symbol(); if (!code) return { col: [] };
      const emaLength = (+P.emaLen > 0 ? Math.round(+P.emaLen) : emaLenFor(code, useLine)), alpha = 2 / (emaLength + 1);   // 依商品自動適應
      const from = candles[0].time - Math.max(7, Math.ceil(emaLength / 26) + 3) * 86400;   // 依均線長度多抓天數讓 EMA 暖機
      const stale = Date.now() - cache.at > 10000;
      if (cache.code !== code || cache.len !== emaLength || from < cache.from || (force && stale)) {
        const bars = await host.fetchBars(code, tf, from);
        cache = { code, len: emaLength, from, at: Date.now(), bars, ema: host.ema(bars.map(b => b.close), emaLength) };
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
      return { col: out, cfg: { ...P, confirmBars, emaLength } };
    },

    legend(t, res) {
      const p = res.col.find(x => x.time === t) || res.col[res.col.length - 1];
      if (!p) return '';
      return `<span class="lg-val" style="color:${p.value === 1 ? '#f23645' : '#089981'}">${p.value === 1 ? '多方 ▲' : '空方 ▼'}</span>` +
             `<span class="lg-par" style="color:#787b86">EMA${res.cfg.emaLength} · ${res.cfg.tf}分 · 連續${res.cfg.confirmBars}根</span>`;
    }
  });
})();
