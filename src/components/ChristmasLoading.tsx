import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { useChristmasTheme } from '@/hooks/use-christmas-theme';

interface ChristmasLoadingProps {
  progress?: number;
}

export function ChristmasLoading({ progress = 66 }: ChristmasLoadingProps) {
  const { isChristmasTheme } = useChristmasTheme();
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; size: number; left: number; duration: number; sway: number }>>([]);

  useEffect(() => {
    if (!isChristmasTheme) return;

    // Generate realistic snowflakes with varied properties
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 10 + 8, // Larger snowflakes (8-18px)
      left: Math.random() * 100,
      duration: Math.random() * 20 + 10, // Slower fall (10-30s)
      sway: Math.random() * 40 + 20, // More sway (20-60px)
    }));
    setSnowflakes(flakes);
  }, [isChristmasTheme]);

  if (!isChristmasTheme) {
    return null;
  }

  return (
    <>
      {/* Snow effect */}
      <div className="christmas-snow">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="christmas-snowflake"
            style={{
              '--size': `${flake.size}px`,
              '--left-position': `${flake.left}%`,
              '--fall-duration': `${flake.duration}s`,
              '--sway-duration': `${flake.duration / 4}s`,
              '--sway-amount': `${flake.sway}px`,
              animationDelay: `${Math.random() * 5}s`, // Staggered start
            } as React.CSSProperties}
          >
            ❄
          </div>
        ))}
      </div>

      {/* Christmas loading content */}
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          {/* Animated Christmas tree */}
          <div className="relative">
            <div className="text-8xl animate-bounce">🎄</div>
            {/* Twinkling lights */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="absolute text-yellow-400 text-xl animate-pulse" style={{ top: '20%', left: '30%' }}>✨</span>
              <span className="absolute text-red-400 text-lg animate-pulse" style={{ top: '40%', right: '25%', animationDelay: '0.5s' }}>🔴</span>
              <span className="absolute text-blue-400 text-xl animate-pulse" style={{ bottom: '30%', left: '20%', animationDelay: '1s' }}>🔵</span>
              <span className="absolute text-yellow-300 text-lg animate-pulse" style={{ top: '60%', right: '30%', animationDelay: '1.5s' }}>⭐</span>
            </div>
          </div>

          {/* Loading text with animation */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
              <span className="inline-block animate-pulse">🎅</span>
              <span className="inline-block mx-2">Preparing Christmas Quests</span>
              <span className="inline-block animate-pulse" style={{ animationDelay: '0.5s' }}>🎁</span>
            </h1>
            <p className="text-sm text-muted-foreground animate-pulse" style={{ animationDelay: '1s' }}>
              Checking the naughty and nice lists...
            </p>
          </div>

          {/* Christmas-themed progress bar */}
          <div className="w-[240px] space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>🎄 Loading...</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Animated gift boxes */}
          <div className="flex gap-4">
            <div className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🎁</div>
            <div className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🦌</div>
            <div className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🔔</div>
            <div className="text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>⛄</div>
          </div>
        </div>
      </div>
    </>
  );
}