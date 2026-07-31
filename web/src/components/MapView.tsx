"use client";

import {
  AdvancedMarker,
  APIProvider,
  InfoWindow,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { mallById, malls, targetMall, TARGET_MALL_ID } from "@/lib/data/malls";
import type { Mall } from "@/lib/types";
import { THREAT_META } from "./threat";

/** Map directive state, reduced from MapAction[] in AppShell */
export interface MapDirectives {
  focus: { mallId: string; zoom?: number } | null;
  highlightIds: string[];
  circles: { mallId: string; radiusKm: number }[];
  /** Incrementing sequence so an identical focus can re-trigger */
  seq: number;
}

const DEFAULT_CENTER = { lat: 3.141, lng: 101.7085 };
const DEFAULT_ZOOM = 14;

/** Camera control from chat directives */
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

/**
 * The main analysis radius circle, centered on the subject mall.
 * Fits the map to the circle whenever the radius changes.
 */
function AnalysisRadius({ radiusKm }: { radiusKm: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const t = targetMall();
    const circle = new google.maps.Circle({
      map,
      center: { lat: t.lat, lng: t.lng },
      radius: radiusKm * 1000,
      strokeColor: "#d81b60",
      strokeOpacity: 0.85,
      strokeWeight: 2,
      fillColor: "#d81b60",
      fillOpacity: 0.08,
      clickable: false,
    });
    const bounds = circle.getBounds();
    if (bounds) map.fitBounds(bounds, 48);
    return () => circle.setMap(null);
  }, [map, radiusKm]);
  return null;
}

/** A radius circle from a chat directive (imperative, no React wrapper) */
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

/** Mall label pin (red name badge, per the reference screenshot) */
function MallPin({
  mall,
  highlighted,
  dimmed,
  onClick,
}: {
  mall: Mall;
  highlighted: boolean;
  dimmed: boolean;
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
        className={`flex flex-col items-center transition-all duration-300 ${
          highlighted ? "scale-110" : ""
        } ${dimmed ? "opacity-40" : "opacity-100"}`}
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
            {mall.area}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 shadow">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: meta.color }}
          />
          <span className="text-[11px] font-bold" style={{ color: meta.color }}>
            {isTarget ? "Subject" : `Threat: ${meta.label}`}
          </span>
        </div>
      </div>
    </AdvancedMarker>
  );
}

export default function MapView({
  apiKey,
  directives,
  radiusKm,
  visibleIds,
}: {
  apiKey: string;
  directives: MapDirectives;
  radiusKm: number;
  /** Ids of malls inside the current radius (others are dimmed) */
  visibleIds: Set<string>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? mallById(selectedId) : undefined;

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        GOOGLE_MAPS_API_KEY is not set
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} language="en" region="MY">
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
        <AnalysisRadius radiusKm={radiusKm} />

        {directives.circles.map((c) => {
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
            dimmed={
              mall.id !== TARGET_MALL_ID && !visibleIds.has(mall.id)
            }
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
                  {selected.area}
                </span>
              </div>
              <div className="mb-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
                <span>Opened {selected.opened}</span>
                <span>{selected.sizeLabel}</span>
                <span>{selected.trafficLabel}</span>
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
