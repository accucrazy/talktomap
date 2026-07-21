#!/usr/bin/env bash
# Talk to Map — Cloud Run 一鍵部署
#
# 前置需求（本機執行一次）：
#   1. 安裝 gcloud SDK：https://cloud.google.com/sdk/docs/install
#   2. gcloud auth login
#   3. GCP 專案已綁定計費帳戶
#
# 用法：
#   PROJECT_ID=你的專案id \
#   GEMINI_API_KEY=xxx \
#   GOOGLE_MAPS_API_KEY=xxx \
#   ./deploy.sh
#
# 可選：REGION（預設 asia-southeast1 新加坡）、SERVICE（預設 talktomap）

set -euo pipefail

: "${PROJECT_ID:?請設定 PROJECT_ID（GCP 專案 id）}"
: "${GEMINI_API_KEY:?請設定 GEMINI_API_KEY}"
: "${GOOGLE_MAPS_API_KEY:?請設定 GOOGLE_MAPS_API_KEY}"
REGION="${REGION:-asia-southeast1}"
SERVICE="${SERVICE:-talktomap}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 啟用需要的 API（已啟用會直接跳過）
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com --project "$PROJECT_ID"

# 從原始碼建置並部署（偵測到 Dockerfile 會用 Docker 建置）
gcloud run deploy "$SERVICE" \
  --source "$SCRIPT_DIR" \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY},GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}"

echo
echo "部署完成。服務網址："
gcloud run services describe "$SERVICE" --project "$PROJECT_ID" \
  --region "$REGION" --format "value(status.url)"
