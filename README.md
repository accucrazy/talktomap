# Talk to Map

一個「對話式地理分析」平台：使用者以自然語言提問（例如「這個地點適合做什麼定位的商場？」「附近有哪些威脅層級的競爭商場？」），系統結合 Google 評論情緒分析、人流數據與地理空間查詢，在地圖上標註結果並產出結構化分析報告（競品比較表、威脅分級、銷售預測）。

參考情境：吉隆坡 Bukit Bintang / TRX 商圈的商場競爭分析（本案 LaLaport BBCC vs 118 Mall、The Exchange TRX、Pavilion KL、Lot 10、Berjaya Times Square）。

## 目前狀態

- ✅ Phase 1：儀表板（Google Map 標註 + 商場比較表 + 威脅分級）— 種子示範資料
- ✅ Phase 3（起步）：對話介面 + Gemini function calling 自然語言問答（競品掃描 / 威脅分析 / Huff 模型客流影響估算）
- ⬜ Phase 2：串接 Google Places API 真實評論/評分
- ⬜ Phase 4–5：真實人流資料、銷售預測模型精修

架構規劃詳見 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 快速開始

```bash
cd web
cp .env.example .env.local   # 填入兩把 key
npm install
npm run dev                  # http://localhost:3000
```

`.env.local` 需要：

| 變數 | 用途 |
|---|---|
| `GEMINI_API_KEY` | 對話分析（server 端，勿暴露） |
| `GOOGLE_MAPS_API_KEY` | 地圖底圖（server 於請求時讀取後傳給地圖元件；請在 GCP Console 設網域限制） |

> 注意：Google Maps key 所屬 GCP 專案需**綁定計費帳戶**並啟用 Maps JavaScript API，否則地圖會顯示「For development purposes only」浮水印與警告視窗。

## 部署到 Cloud Run

前置需求（本機一次性）：安裝 [gcloud SDK](https://cloud.google.com/sdk/docs/install)、`gcloud auth login`、GCP 專案已綁定計費。

```bash
PROJECT_ID=你的專案id \
GEMINI_API_KEY=xxx \
GOOGLE_MAPS_API_KEY=xxx \
./web/deploy.sh
```

腳本會自動啟用 Cloud Run / Cloud Build / Artifact Registry API，從原始碼（`web/Dockerfile`，Next.js standalone 模式）建置並部署，完成後印出服務網址。可用 `REGION`（預設 `asia-southeast1`）與 `SERVICE`（預設 `talktomap`）覆寫。

兩把 key 以 Cloud Run 環境變數（`--set-env-vars`）於執行期注入，不會進到映像檔或版本控制。

## 專案結構

```
web/
  src/app/page.tsx           # 主頁：Header + 對話面板 + 地圖 + 比較表
  src/app/api/chat/route.ts  # Gemini function calling 編排（NL → 工具 → 回覆 + 地圖動作）
  src/components/            # MapView / ChatPanel / ComparisonTable
  src/lib/data/malls.ts      # 五商場種子示範資料
  src/lib/analysis.ts        # 競品掃描 / 威脅評分 / 簡化 Huff 客流模型
  src/lib/gemini-tools.ts    # 工具宣告 + 派發 + 地圖動作推導
```
