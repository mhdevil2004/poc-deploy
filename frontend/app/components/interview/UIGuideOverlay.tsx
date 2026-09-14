"use client";

import { useEffect, useState } from "react";
import type { UIGuide as UIGuideProps } from "@/lib/api/interviewService";

export function UIGuideOverlay({ guide }: { guide?: UIGuideProps }) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!guide?.enabled || !guide.target) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const el = document.getElementById(guide.target!);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    updateRect();
    // Poll just in case the layout shifts (e.g. video loads)
    const interval = setInterval(updateRect, 500);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { capture: true });

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, { capture: true });
    };
  }, [guide]);

  if (!guide?.enabled || !targetRect) return null;

  const padding = 8;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dimmed background using a radial gradient or box shadow cutout */}
      <div 
        className="absolute inset-0 bg-black/60 transition-all duration-300"
        style={{
          clipPath: `polygon(
            0% 0%, 0% 100%, 
            ${targetRect.left - padding}px 100%, 
            ${targetRect.left - padding}px ${targetRect.top - padding}px, 
            ${targetRect.right + padding}px ${targetRect.top - padding}px, 
            ${targetRect.right + padding}px ${targetRect.bottom + padding}px, 
            ${targetRect.left - padding}px ${targetRect.bottom + padding}px, 
            ${targetRect.left - padding}px 100%, 
            100% 100%, 100% 0%
          )`
        }}
      />
      
      {/* Bounding box outline */}
      <div 
        className="absolute border-2 border-[#FFBD2E] rounded-xl transition-all duration-300 animate-pulse pointer-events-none"
        style={{
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
        }}
      >
        {/* Tooltip */}
        {guide.message && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap bg-[#090A0B] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-xl">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#090A0B] rotate-45" />
            <span className="relative z-10">{guide.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
