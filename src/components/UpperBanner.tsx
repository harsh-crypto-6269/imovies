import React from 'react';
import { Film, Sparkles } from 'lucide-react';

interface UpperBannerProps {
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
}

export const UpperBanner: React.FC<UpperBannerProps> = ({ onOpenAdmin, isAdmin }) => {
  return (
    <div className="w-full bg-gradient-to-r from-red-950/70 via-black to-red-950/70 border-b border-red-900/30 text-xs py-1.5 px-4 text-slate-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex items-center gap-1.5 font-semibold text-red-400 tracking-wide">
            <Film className="w-3.5 h-3.5 text-red-500 shrink-0" />
            IMOVIES CINEMAS
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-200 font-medium tracking-wide">
            Curated & Architected by <span className="text-white font-bold underline decoration-red-500 underline-offset-2">Harsh Ranawat</span>
          </span>
          <span className="text-slate-600 hidden md:inline">·</span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            Official Premiere Ticketing Platform & Seat Reservation
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          <span className="text-red-400/90 font-mono hidden lg:inline">
            IMAX 3D · 4DX · DOLBY ATMOS
          </span>
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-red-400 hover:text-white font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-red-400" />
              Admin Mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
