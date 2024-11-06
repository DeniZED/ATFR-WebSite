import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import VideoBackground from './VideoBackground';

export default function Hero() {
  return (
    <VideoBackground videoUrl="https://wgsw-eu.gcdn.co/wgsw_media/video/wot/wmcs-50835_wot_discover_an_army_of_war_machines_out.mp4">
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="max-w-4xl bg-wot-darker/80 backdrop-blur-sm p-12 border border-wot-gold/20">
          <div className="flex flex-col items-center justify-center mb-8">
            <img 
              src="https://eu.wargaming.net/clans/media/clans/emblems/cl_501/500191501/emblem_195x195.png"
              alt="ATFR Clan Logo" 
              className="w-48 h-48 mb-6 drop-shadow-[0_0_15px_rgba(244,178,35,0.3)]"
            />
            <h1 className="text-8xl font-bold text-wot-gold text-shadow-gold tracking-wider">ATFR</h1>
          </div>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Star className="h-5 w-5 text-wot-goldLight" strokeWidth={1.5} />
            <p className="text-2xl text-wot-white uppercase tracking-widest">Clan World Of Tanks</p>
            <Star className="h-5 w-5 text-wot-goldLight" strokeWidth={1.5} />
          </div>
          <p className="text-xl mb-12 text-wot-light/90 max-w-2xl mx-auto">
            Clan français parmi les plus actifs du moment
          </p>
          <div className="flex justify-center gap-6">
            <a 
              href="#about" 
              className="btn-primary clip-diagonal"
            >
              Découvrir
              <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} />
            </a>
            <a 
              href="#join" 
              className="btn-secondary"
            >
              Nous Rejoindre
            </a>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}