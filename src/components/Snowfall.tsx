import { useEffect, useState } from "react";
import { useChristmasTheme } from "@/hooks/use-christmas-theme";

interface Snowflake {
  id: number;
  size: number;
  left: number;
  duration: number;
  sway: number;
  delay: number;
}

export function Snowfall() {
  const { isChristmasTheme } = useChristmasTheme();
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    if (!isChristmasTheme) {
      setSnowflakes([]);
      return;
    }

    // Generate snowflakes with varied properties
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 10 + 8, // 8-18px
      left: Math.random() * 100,
      duration: Math.random() * 20 + 10, // 10-30s fall time
      sway: Math.random() * 40 + 20, // 20-60px sway
      delay: Math.random() * 10, // Staggered start 0-10s
    }));
    setSnowflakes(flakes);
  }, [isChristmasTheme]);

  if (!isChristmasTheme || snowflakes.length === 0) {
    return null;
  }

  return (
    <div className="christmas-snow">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="christmas-snowflake"
          style={
            {
              "--size": `${flake.size}px`,
              "--left-position": `${flake.left}%`,
              "--fall-duration": `${flake.duration}s`,
              "--sway-duration": `${flake.duration / 4}s`,
              "--sway-amount": `${flake.sway}px`,
              animationDelay: `${flake.delay}s`,
            } as React.CSSProperties
          }
        >
          ❄
        </div>
      ))}
    </div>
  );
}
