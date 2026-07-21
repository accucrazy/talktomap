import AppShell from "@/components/AppShell";

// 每次請求時讀取環境變數（Cloud Run 上以 --set-env-vars 注入，不需 build 時寫死）
export const dynamic = "force-dynamic";

export default function Page() {
  const mapsApiKey =
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
    "";
  return <AppShell mapsApiKey={mapsApiKey} />;
}
