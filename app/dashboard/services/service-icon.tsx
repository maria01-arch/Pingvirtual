"use client";

import { useState } from "react";
import { iconInfoForService } from "@/lib/service-icons";
import { colorForLabel } from "@/lib/services-catalog";

export default function ServiceIcon({
  name,
  size = 44,
}: {
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const info = iconInfoForService(name);

  if (!info || failed) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex shrink-0 items-center justify-center rounded-2xl text-base font-semibold text-white shadow-sm transition-transform duration-200 ${colorForLabel(name)}`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size, backgroundColor: info.color }}
      className="flex shrink-0 items-center justify-center rounded-2xl p-2.5 shadow-sm transition-transform duration-200"
    >
      <img
        src={info.url}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
