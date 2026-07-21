"use client";

import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { mallById, malls, TARGET_MALL_ID } from "@/lib/data/malls";
import type { Mall } from "@/lib/types";
import { THREAT_META } from "./threat";

/** page.tsx 將 MapAction[] 化簡後傳入的地圖指令狀態 */
export interface MapDirectives {
  focus: { mallId: string; zoom?: number } | null;
  highlightIds: string[];
  circles: { mallId: string; radiusKm: number }[];
  /** 遞增序號，讓相同 focus 也能重新觸發 */
  seq: number;
}

const DEFAULT_CENTER = { lat: 3.1447, lng: 101.7095 };
const DEFAULT_ZOOM = 15;

/** 依指令控制鏡頭 */
function CameraController({ directives }: { directives: MapDirectives }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !directives.focus) return;
    const mall = mallById(directives.focus.mallId);
    if (!mall) return;
    map.panTo({ lat: mall.lat, lng: mall.lng });
    map.setZoom(directives.focus.zoom ?? 15);
  }, [map, directives.focus, directives.seq]);
  return null;
}

/** 半徑圈（google.maps.Circle 無 React 封裝，命令式建立） */
function RadiusCircle({
  lat,
  lng,
  radiusKm,
  color,
}: {
  lat: number;
  lng: number;
  radiusKm: number;
  color: string;
}) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const circle = new google.maps.Circle({
      map,
      center: { lat, lng },
      radius: radiusKm * 1000,
      strokeColor: color,
      strokeOpacity: 0.7,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.12,
      clickable: false,
    });
    return () => circle.setMap(null);
  }, [map, lat, lng, radiusKm, color]);
  return null;
}

/** 商場標籤圖釘（仿截圖的紅底名牌） */
function MallPin({
  mall,
  highlighted,
  onClick,
}: {
  mall: Mall;
  highlighted: boolean;
  onClick: () => void;
}) {
  const meta = THREAT_META[mall.threatLevel];
  const isTarget = mall.threatLevel === "target";
  return (
    <AdvancedMarker
      position={{ lat: mall.lat, lng: mall.lng }}
      onClick={onClick}
      zIndex={highlighted || isTarget ? 20 : 10}
    >
      <div
        className={`flex flex-col items-center transition-transform duration-300 ${
          highlighted ? "scale-110" : ""
        }`}
      >
        <div
          className="rounded-md px-2.5 py-1.5 text-center leading-tight shadow-lg"
          style={{
            background: isTarget ? "var(--threat-target)" : "var(--brand)",
            outline: highlighted ? `3px solid ${meta.color}` : "none",
            outlineOffset: "2px",
          }}
        >
          <div className="text-[13px] font-bold text-white">{mall.name}</div>
          <div className="text-[11px] font-medium text-white/90">
            {mall.nameEn}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1 rounded-full bg-white/95 px-2 py-0.5 shadow">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: meta.color }}
          />
          <span className="text-[11px] font-bold" style={{ color: meta.color }}>
            {isTarget ? "本案" : `威脅${meta.label}`}
          </span>
        </div>
      </div>
    </AdvancedMarker>
  );
}

export default function MapView({
  apiKey,
  directives,
}: {
  apiKey: string;
  directives: MapDirectives;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? mallById(selectedId) : undefined;

  // 對話尚未觸發任何半徑圈時，預設在本案畫 0.4km 圈（對應截圖粉紅圈）
  const circles =
    directives.circles.length > 0
      ? directives.circles
      : [{ mallId: TARGET_MALL_ID, radiusKm: 0.4 }];

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        尚未設定 GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} language="zh-TW" region="MY">
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        className="h-full w-full"
      >
        <CameraController directives={directives} />

        {circles.map((c) => {
          const mall = mallById(c.mallId);
          if (!mall) return null;
          const color =
            mall.threatLevel === "target"
              ? "#d81b60"
              : THREAT_META[mall.threatLevel].color;
          return (
            <RadiusCircle
              key={`${c.mallId}-${c.radiusKm}`}
              lat={mall.lat}
              lng={mall.lng}
              radiusKm={c.radiusKm}
              color={color}
            />
          );
        })}

        {malls.map((mall) => (
          <MallPin
            key={mall.id}
            mall={mall}
            highlighted={directives.highlightIds.includes(mall.id)}
            onClick={() => setSelectedId(mall.id)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            pixelOffset={[0, -20]}
            onCloseClick={() => setSelectedId(null)}
            maxWidth={320}
          >
            <div className="p-1">
              <div className="mb-1 text-sm font-bold text-gray-900">
                {selected.name}{" "}
                <span className="font-medium text-gray-500">
                  {selected.nameEn}
                </span>
              </div>
              <div className="mb-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
                <span>開幕 {selected.opened}</span>
                <span>{selected.sizeLabel}</span>
                <span>年人流 {selected.trafficLabel}</span>
              </div>
              <ul className="ml-4 list-disc space-y-0.5 text-xs text-gray-700">
                {selected.positioning.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
