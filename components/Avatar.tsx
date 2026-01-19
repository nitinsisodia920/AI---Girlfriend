
import React from 'react';
import { Mood } from '../types';

interface AvatarProps {
  mood: Mood;
  isTalking: boolean;
  onInteraction: () => void;
  imageUrl: string | null;
}

const Avatar: React.FC<AvatarProps> = ({ mood, isTalking, onInteraction, imageUrl }) => {
  const getMoodColor = () => {
    switch (mood) {
      case 'happy': return 'from-pink-300 to-rose-400';
      case 'excited': return 'from-orange-300 to-pink-400';
      case 'shy': return 'from-pink-200 to-indigo-300';
      case 'sad': return 'from-blue-200 to-slate-400';
      case 'angry': return 'from-red-400 to-rose-600';
      default: return 'from-pink-300 to-rose-400';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full">
      {/* Soft Glow */}
      <div className={`absolute w-56 h-56 rounded-full blur-[60px] opacity-40 bg-gradient-to-tr ${getMoodColor()} transition-all duration-1000`}></div>

      <div 
        onClick={onInteraction}
        className={`relative group cursor-pointer transition-all duration-500 z-10 ${isTalking ? 'scale-105' : 'scale-100'}`}
      >
        {/* Cute Border Ring */}
        <div className={`w-40 h-40 rounded-full p-2 bg-white shadow-[0_10px_40px_rgba(255,117,140,0.2)] transition-all duration-500 ${isTalking ? 'pulse-soft' : 'animate-subtle-float'}`}>
           <div className={`w-full h-full rounded-full overflow-hidden relative border-4 border-white shadow-inner bg-gradient-to-tr ${getMoodColor()}`}>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Gunnu"
                className={`w-full h-full object-cover transition-transform duration-[8s] ${isTalking ? 'scale-110' : 'scale-100'}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <i className="fas fa-heart text-white/50 text-5xl animate-pulse"></i>
              </div>
            )}
            
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-pink-500/10"></div>
          </div>
        </div>

        {/* Kawaii Status Tag */}
        <div className="absolute -bottom-1 -right-1 bg-white rounded-2xl px-3 py-1.5 flex items-center justify-center shadow-lg border border-pink-50 transform group-hover:scale-110 transition-transform">
           {isTalking ? (
             <div className="flex gap-1 items-end h-3">
               <div className="w-1.5 bg-rose-400 h-2 rounded-full animate-bounce"></div>
               <div className="w-1.5 bg-rose-400 h-3 rounded-full animate-bounce [animation-delay:0.1s]"></div>
               <div className="w-1.5 bg-rose-400 h-2.5 rounded-full animate-bounce [animation-delay:0.2s]"></div>
             </div>
           ) : (
             <span className="text-lg">
               {mood === 'happy' && '🥰'}
               {mood === 'sad' && '🥺'}
               {mood === 'angry' && '😤'}
               {mood === 'shy' && '🙈'}
               {mood === 'excited' && '💖'}
             </span>
           )}
        </div>
      </div>
      
      <div className="mt-6 text-center z-10">
        <h2 className="text-3xl font-bold tracking-tight text-rose-500 flex items-center gap-2 justify-center" style={{ fontFamily: 'Varela Round' }}>
          Gunnu
          <i className="fas fa-certificate text-blue-400 text-xs shadow-sm"></i>
        </h2>
        <div className="flex items-center justify-center gap-2 mt-1">
           <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Your Sweetheart
           </p>
        </div>
      </div>
    </div>
  );
};

export default Avatar;
