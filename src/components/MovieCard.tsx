import React, { useState } from 'react';
import { Star, Ticket, Clock, Calendar, Film } from 'lucide-react';
import { IMovie } from '../types/index.js';

interface MovieCardProps {
  movie: IMovie;
  onBookClick: (movie: IMovie) => void;
  onDetailsClick: (movie: IMovie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onBookClick, onDetailsClick }) => {
  const [imageError, setImageError] = useState(false);
  const isNowShowing = movie.status === 'now_showing';

  return (
    <div className="group relative flex flex-col bg-[#11131a] border border-[#1e2332] hover:border-red-600/40 rounded-xl overflow-hidden shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60">
      {/* Poster Image Container */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#181c26] cursor-pointer"
        onClick={() => onDetailsClick(movie)}
      >
        {!imageError ? (
          <img
            src={movie.poster}
            alt={movie.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          /* Styled Fallback Container per Zero-Broken-Image Policy */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#161a24] to-[#0d0f15] text-center">
            <Film className="w-12 h-12 text-red-500/60 mb-2" />
            <span className="text-xs font-semibold text-slate-300 line-clamp-2">{movie.title}</span>
            <span className="text-[10px] text-slate-500 mt-1 font-mono">{movie.genres[0]}</span>
          </div>
        )}

        {/* Cinematic Gradient Scrim at bottom of poster */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11131a] via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Rating or Coming Soon badge in top right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          {isNowShowing ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-400 tabular-nums">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/80 backdrop-blur-md border border-red-700/40 text-[11px] font-semibold text-red-300">
              <Calendar className="w-3 h-3" />
              <span>Coming Soon</span>
            </div>
          )}
        </div>

        {/* Formats Overlay at bottom of image */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-300 font-medium z-10">
          <span className="text-red-400 font-semibold">{movie.formats.slice(0, 2).join(' · ')}</span>
          <span className="text-slate-400">{movie.certification}</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow p-4 space-y-3">
        {/* Title */}
        <h3
          onClick={() => onDetailsClick(movie)}
          className="text-base font-bold text-white group-hover:text-red-400 transition-colors cursor-pointer line-clamp-1 font-['Outfit']"
          title={movie.title}
        >
          {movie.title}
        </h3>

        {/* Clean unboxed metadata with dot separators */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 line-clamp-1">
          <span>{movie.genres.slice(0, 2).join(', ')}</span>
          <span aria-hidden="true">·</span>
          <span>{movie.language.split('/')[0].trim()}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {movie.durationMinutes}m
          </span>
        </div>

        {/* CTA Button */}
        <div className="pt-1 mt-auto">
          {isNowShowing ? (
            <button
              onClick={() => onBookClick(movie)}
              className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Ticket className="w-3.5 h-3.5" />
              Book Tickets
            </button>
          ) : (
            <button
              onClick={() => onDetailsClick(movie)}
              className="w-full py-2 px-3 bg-[#191d28] hover:bg-[#222736] text-slate-300 hover:text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              View Synopsis & Cast
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
