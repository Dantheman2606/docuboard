// /features/editor/components/RemoteCursor.tsx
"use client";

import { useEffect, useState } from "react";

interface RemoteCursorProps {
  userId: string;
  userName: string;
  color: string;
  position: { x: number; y: number } | null;
  lastUpdate?: number; // Timestamp of last update
}

export function RemoteCursor({ userId, userName, color, position, lastUpdate }: RemoteCursorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Blink cursor
    const interval = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  // Calculate opacity based on time since last update (fade out after 2 seconds)
  useEffect(() => {
    if (!lastUpdate) {
      setOpacity(1);
      return;
    }

    const updateOpacity = () => {
      const timeSinceUpdate = Date.now() - lastUpdate;
      if (timeSinceUpdate < 2000) {
        setOpacity(1);
      } else if (timeSinceUpdate < 3000) {
        // Fade from 1 to 0.3 over 1 second (from 2s to 3s)
        const fadeProgress = (timeSinceUpdate - 2000) / 1000;
        setOpacity(1 - fadeProgress * 0.7);
      } else {
        setOpacity(0.3);
      }
    };

    updateOpacity();
    const interval = setInterval(updateOpacity, 100);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  if (!position) return null;

  return (
    <div
      className="remote-cursor-container"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'left 0.1s ease-out, top 0.1s ease-out, opacity 0.3s ease-out',
        opacity: opacity,
      }}
    >
      {/* Cursor line */}
      <div
        style={{
          width: '2px',
          height: '20px',
          backgroundColor: color,
          opacity: isVisible ? 1 : 0.3,
          transition: 'opacity 0.15s ease-in-out',
        }}
      />
      
      {/* User label */}
      <div
        style={{
          position: 'absolute',
          top: '-24px',
          left: '0',
          backgroundColor: color,
          color: '#fff',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '11px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        {userName}
      </div>
    </div>
  );
}
