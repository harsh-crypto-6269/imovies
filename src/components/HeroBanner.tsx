import React, { useState } from 'react';
import { Play, Ticket, Star, Sparkles, X } from 'lucide-react';
import { IMovie } from '../types/index.js';

interface HeroBannerProps {
  movie: IMovie | null;
  onBookClick: (movie: IMovie) => void;
  onDetailsClick: (movie: IMovie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movie, onBookClick, onDetailsClick }) => {
  const [showTrailer, setShowTrailer] = useState(false);

  if (!movie) return null;

  return (
    <div className="relative w-full overflow-hidden bg-[#08090c]">
      {/* Cinematic Backdrop with measured contrast scrim */}
      <div className="relative h-[480px] sm:h-[540px] lg:h-[620px] w-full">
        <img
          src={movie.backdrop || '/src/assets/images/hero_cinematic_movie_1793329365739.jpg'}
          alt={movie.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05]"
        />

        {/* Cinematic Multi-stop Vignette Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090c] via-[#08090c]/70 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-12 sm:pb-16 z-10">
          <div className="max-w-2xl space-y-4">
            {/* Top editorial kicker */}
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>Premiere Showcase · Curated by Harsh Ranawat</span>
            </div>

            {/* Movie Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance font-['Outfit']">
              {movie.title}
            </h1>

            {/* Clean unboxed metadata with separators (zero pill discipline) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {movie.rating.toFixed(1)} Rating
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span>{movie.durationMinutes} mins</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span>{movie.genres.join(', ')}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-slate-400">{movie.certification}</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-red-400 font-medium">{movie.formats.join(' / ')}</span>
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-xl">
              {movie.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onBookClick(movie)}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-lg shadow-red-950/70 hover:shadow-red-800/50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                Book Tickets
              </button>

              <button
                onClick={() => setShowTrailer(true)}
                className="px-5 py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-medium text-xs sm:text-sm rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-red-500" />
                Watch Trailer
              </button>

              <button
                onClick={() => onDetailsClick(movie)}
                className="px-4 py-2.5 text-slate-400 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                View Details & Cast
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Trailer Modal */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-[#11131a] rounded-2xl overflow-hidden border border-[#272d3f] shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#202535]">
              <span className="text-sm font-semibold text-white truncate">
                {movie.title} – Official Trailer
              </span>
              <button
                onClick={() => setShowTrailer(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(movie.trailerUrl)}?autoplay=1`}
                title={`${movie.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function getYouTubeId(url: string): string {
  if (!url) return 'd9MyW72ELq0';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : 'd9MyW72ELq0';
}
