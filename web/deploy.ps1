# Talk to Map — Cloud Run 部署（Windows / PowerShell 版）
#
# 用法（PowerShell）：
#   .\web\deploy.ps1 -ProjectId 你的專案id -GeminiApiKey xxx -GoogleMapsApiKey xxx
#   可選：-Region asia-southeast1（預設）、-Service talktomap（預設）
#
# 注意：所有 gcloud 指令都帶明確的 --project，不會動到 gcloud config 目前設定的專案，
# 也就不會誤部署到目前 config 裡的其他專案。

param(
    [Parameter(Mandatory = $true)] [string] $ProjectId,
    [Parameter(Mandatory = $true)] [string] $GeminiApiKey,
    [Parameter(Mandatory = $true)] [string] $GoogleMapsApiKey,
    # 可選：日本 e-Stat 政府統計 appId（設定後名古屋情境會查 e-Stat 開放數據）
    [string] $EstatAppId = "",
    [string] $Region = "asia-southeast1",
    [string] $Service = "talktomap"
)

$ErrorActionPreference = "Stop"

# 這台機器的已知問題：CLOUDSDK_PYTHON 常指到不存在的 Python，導致 gcloud 起不來。
# 若未設定或路徑不存在，改指到實際安裝的 Python 3.11。
$knownPython = "C:\Users\Accucrazy\AppData\Local\Programs\Python\Python311\python.exe"
if (-not $env:CLOUDSDK_PYTHON -or -not (Test-Path $env:CLOUDSDK_PYTHON)) {
    if (Test-Path $knownPython) {
        $env:CLOUDSDK_PYTHON = $knownPython
        Write-Host "已設定 CLOUDSDK_PYTHON = $knownPython"
    } else {
        Write-Warning "找不到 $knownPython，請確認 Python 安裝路徑並手動設定 `$env:CLOUDSDK_PYTHON"
    }
}

# 確認 gcloud 可用與登入身分
gcloud config list --format="value(core.account)" | ForEach-Object {
    Write-Host "目前 gcloud 登入帳號：$_（部署目標專案：$ProjectId）"
}

$sourceDir = $PSScriptRoot

Write-Host "啟用必要的 API（已啟用會直接跳過）..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project $ProjectId

$envVars = "GEMINI_API_KEY=$GeminiApiKey,GOOGLE_MAPS_API_KEY=$GoogleMapsApiKey"
if ($EstatAppId) {
    $envVars = "$envVars,ESTAT_APP_ID=$EstatAppId"
    Write-Host "已帶入 ESTAT_APP_ID（名古屋情境將查詢 e-Stat 開放數據）"
}

Write-Host "從原始碼建置並部署到 Cloud Run..."
gcloud run deploy $Service `
    --source $sourceDir `
    --project $ProjectId `
    --region $Region `
    --allow-unauthenticated `
    --port 8080 `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 3 `
    --set-env-vars $envVars

Write-Host ""
Write-Host "部署完成。服務網址："
gcloud run services describe $Service --project $ProjectId --region $Region --format "value(status.url)"
