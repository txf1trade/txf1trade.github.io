/* 指標清單：決定載入哪些指標。底部指標列的顯示順序由頁面自動排序：英文開頭在前、中文在後（各自依字母/筆畫）。
 * 新增指標 = 把 xxx.js 放進 indicators/ 資料夾，再把檔名加到下面這個陣列。
 * 暫時不想用的指標：把檔名刪掉或前面加 // 即可。 */
window.INDICATOR_FILES = [
  'atr.js',        // ATR 趨勢（主圖）
  'dayweek.js',    // 日線 / 週線（主圖）
  'duotou.js',     // 多頭 E20 / E60（主圖）
  'vegas.js',      // Vegas 隧道（主圖）
  'vwap.js',       // 均價 VWAP（主圖）
  'week_vwap.js',  // 周成本 / 周關價（主圖）
  'wave.js',       // 台指順勢波段（副圖）
  'mcdx.js',       // MCDX 莊家/游資/散戶 + 5M/15M/60M 表格（副圖）
  'chip.js',       // 籌碼 MCDX 簡易版 + 比例表格（副圖）
  'volume.js'      // 成交量（副圖）
];
