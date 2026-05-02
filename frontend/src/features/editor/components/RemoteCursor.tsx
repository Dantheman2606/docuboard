// /features/editor/components/RemoteCursor.tsx
"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";

interface RemoteCursorProps {
  userId: string;
  userName: string;
  color: string;
  docPosition: number;
  lastUpdate?: number; // Timestamp of last update
  editor: Editor;
}

export function RemoteCursor({ userId, userName, color, docPosition, lastUpdate, editor }: RemoteCursorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // Calculate position from docPosition whenever it changes
  useEffect(() => {
    if (!editor) return;

    try {
      const maxPos = editor.state.doc.content.size;
      const safePos = Math.max(0, Math.min(docPosition, maxPos));
      const coords = editor.view.coordsAtPos(safePos);
      
      setPosition({
        x: coords.left,
        y: coords.top,
      });
    } catch (error) {
      // Invalid position
      setPosition(null);
    }
  }, [docPosition, editor]);

  // Hide cursor if inactive for more than 3 seconds
  useEffect(() => {
    if (!lastUpdate) return;

    const checkVisibility = () => {
      const timeSinceUpdate = Date.now() - lastUpdate;
      if (timeSinceUpdate > 3000) {
        setPosition(null); // Hide cursor
      }
    };

    checkVisibility();
    const interval = setInterval(checkVisibility, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

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
