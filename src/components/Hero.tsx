import React, { useEffect, useRef } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import VideoBackground from './VideoBackground';

export default function Hero() {
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const content = contentRef.current;

    if (title && content) {
      requestAnimationFrame(() => {
        title.style.opacity = '1';
        title.style.transform = 'translateY(0)';
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      });
    }
  }, []);

  return (
    <VideoBackground videoUrl="https://wgsw-eu.gcdn.co/wgsw_media/video/wot/wmcs-50835_wot_discover_an_army_of_war_machines_out.mp4">
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="max-w-4xl bg-wot-darker/80 backdrop-blur-sm p-12 border border-wot-gold/20">
          <div 
            ref={titleRef}
            className="flex flex-col items-center justify-center mb-8 opacity-0 translate-y-8 transition-all duration-1000 ease-out"
          >
            <img 
              src="https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png"
              alt="ATFR Clan Logo" 
              className="w-48 h-48 mb-6 drop-shadow-[0_0_15px_rgba(244,178,35,0.3)] animate-pulse"
            />
            <h1 className="text-8xl font-bold text-wot-gold text-shadow-gold tracking-wider animate-[textGlow_3s_ease-in-out_infinite]">
              ATFR
            </h1>
          </div>
          <div 
            ref={contentRef}
            className="opacity-0 translate-y-8 transition-all duration-1000 delay-300 ease-out"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <Star className="h-5 w-5 text-wot-goldLight animate-spin-slow" strokeWidth={1.5} />
              <p className="text-2xl text-wot-white uppercase tracking-widest">Clan World Of Tanks</p>
              <Star className="h-5 w-5 text-wot-goldLight animate-spin-slow" strokeWidth={1.5} />
            </div>
            <p className="text-xl mb-12 text-wot-light/90 max-w-2xl mx-auto">
              Clan français parmi les plus actifs du moment
            </p>
            <div className="flex justify-center gap-6">
              <a 
                href="#about" 
                className="btn-primary clip-diagonal group"
              >
                Découvrir
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </a>
              <a 
                href="#join" 
                className="btn-secondary hover:scale-105"
              >
                Nous Rejoindre
              </a>
            </div>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}