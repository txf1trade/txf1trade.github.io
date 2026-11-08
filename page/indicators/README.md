# indicators/ 指標資料夾

`miniTrade.html` 啟動時會先讀 `indicators/manifest.js`，再依序載入裡面列的每個 `.js`。
底部指標列會自動多出對應分頁：**點一下 開/關，連點兩下 開參數視窗**（設定存在瀏覽器 localStorage）。

## 資料夾位置
html 與 `indicators/` 放同一層即可（用相對路徑），本機直接雙擊開 `miniTrade.html` 就能測；
之後放到 GitHub Pages（例如 `/page/miniTrade.html` + `/page/indicators/`）不用改任何程式。

## 新增一個指標
1. 在 `indicators/` 放 `myind.js`
2. 把 `'myind.js'` 加進 `manifest.js` 的陣列

```js
TVInd.register({
  id: 'myind', name: '我的指標', pane: 'main',   // 'main' 疊在K線上 / 'sub' 副圖
  defaultOn: false, height: 100, range: [0, 100], // height、range 只有副圖用
  params: [ { key:'len', label:'期數', type:'number', def:20, min:1, max:200, step:1 },
            { key:'flag', label:'開關', type:'bool', def:true } ],   // 也支援 type:'select' + options
  series: [ { key:'a', kind:'line', title:'A', color:'#fff', width:2, label:true, legend:true } ], // kind: 'line' | 'hist'
  hlines: [ { price:50, color:'#787b86', style:2 } ],                // 副圖水平線（選填）
  calc(c) {
    // c.candles / c.t c.o c.h c.l c.c c.v（陣列）、c.n、c.p（目前參數）、c.res、c.resMin、c.isDay、c.isWeek
    // c.ta.ema/rma/sma/rsi/tr/highest/lowest、c.api.getBars('15', 天數)、c.api.sessKeyFn(code)、c.api.weekKey(t)
    const a = c.ta.ema(c.c, c.p.len);
    return { a: { v: a, c: a.map(x => '#ff0') /* c 逐根顏色，可省略 */ },
             table: { pos:'middle_left', rows:[[{t:'文字', bg:'#363a45', fg:'#fff'}]] },   // Pine 的 table（選填）
             legend: i => [{ n:'A', v:'123', c:'#fff' }] };                                // 自訂圖例（選填）
  }
});
```
`v` 陣列長度要等於 K 棒數，無值用 `NaN`。

## 目前的指標對照
| 檔案 | 分頁 | 來源 Pine | 位置 |
|---|---|---|---|
| atr.js | ATR | ATR_更新.txt | 主圖（預設開） |
| dayweek.js | 日周線 | 日周線.txt | 主圖 |
| duotou.js | 多頭 | 多頭.txt | 主圖 |
| vegas.js | Vegas | VEGAS.txt | 主圖 |
| vwap.js | VWAP | ATR_更新.txt 的均價VWAP開關（VWAP.txt 是空檔） | 主圖 |
| week_vwap.js | 周成本 | 周關價.txt | 主圖 |
| wave.js | 波段 | 台指波段_更新.txt | 副圖 |
| mcdx.js | MCDX | MCDX_更新.txt | 副圖 |
| chip.js | 籌碼 | Chip_更新.txt | 副圖 |
| volume.js | 成交量 | （新增） | 副圖 |

「必來點」仍是 miniTrade.html 內建（含多商品交易時段），不在這個資料夾。
