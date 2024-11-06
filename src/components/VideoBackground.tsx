import React, { ReactNode } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  children: ReactNode;
}

export default function VideoBackground({ videoUrl, children }: VideoBackgroundProps) {
  return (
    <div className="relative min-h-screen">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoUrl} type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <div className="relative z-10 text-white">
        {children}
      </div>
    </div>
  );
}