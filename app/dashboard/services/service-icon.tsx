"use client";

import { useState } from "react";
import { iconUrlForService } from "@/lib/service-icons";
import { colorForLabel } from "@/lib/services-catalog";

export default function ServiceIcon({
  name,
  size = 44,
}: {
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const url = iconUrlForService(name);

  if (!url || failed) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex shrink-0 items-center justify-center rounded-2xl text-base font-semibold text-white shadow-sm ${colorForLabel(name)}`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-2xl bg-white object-contain shadow-sm ring-1 ring-slate-100"
      style={{ width: size, height: size }}
    />
  );
}
