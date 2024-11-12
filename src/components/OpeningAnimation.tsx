import React, { useEffect, useState } from 'react';

export default function OpeningAnimation() {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isAnimating) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 bg-wot-darker flex items-center justify-center
        ${isAnimating ? 'animate-fadeOut' : ''}`}
    >
      <div className="relative">
        <img 
          src="https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png"
          alt="ATFR Logo"
          className="w-32 h-32 animate-scaleUp"
        />
        <div className="absolute inset-0 bg-wot-gold/30 animate-pulse rounded-full blur-xl" />
      </div>
    </div>
  );
}