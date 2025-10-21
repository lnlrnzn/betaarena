"use client";

import Image from "next/image";
import { useState } from "react";

interface AgentAvatarProps {
  logo: string;
  logoFallback: string;
  name: string;
  color: string;
  size?: number;
}

export function AgentAvatar({
  logo,
  logoFallback,
  name,
  color,
  size = 32,
}: AgentAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // If image fails to load or doesn't exist, show fallback
  if (imageError || !logo) {
    return (
      <div
        className="flex items-center justify-center font-bold text-white border-2 border-border"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          fontSize: size * 0.5,
        }}
      >
        {logoFallback}
      </div>
    );
  }

  return (
    <div
      className="relative border-2 border-border overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image
        src={logo}
        alt={name}
        fill
        className="object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
