import React, { useState, useEffect } from 'react';
import { X, Star, Clock, Calendar, Film, Play, Ticket, MapPin } from 'lucide-react';
import { IMovie, IShow } from '../types/index.js';
import { api } from '../services/api.js';

interface MovieDetailsModalProps {
  movie: IMovie | null;
  onClose: () => void;
  onSelectShowtime: (show: IShow) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onSelectShowtime
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dates, setDates] = useState<string[]>([]);
  const [shows, setShows] = useState<IShow[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!movie) return;

    // Load available dates & initial shows for this movie
    async function loadData() {
      try {
        setLoadingShows(true);
        const detailsRes = await api.movies.getById(movie!.id);
        if (detailsRes.success && detailsRes.availableDates.length > 0) {
          setDates(detailsRes.availableDates);
          const initialDate = detailsRes.availableDates[0];
          setSelectedDate(initialDate);

          const showsRes = await api.shows.getAll({ movieId: movie!.id, date: initialDate });
          if (showsRes.success) {
            setShows(showsRes.shows);
          }
        } else {
          // If no shows, fallback to standard dates
          const today = new Date().toISOString().split('T')[0];
          setSelectedDate(today);
        }
      } catch (err) {
        console.error('Failed to load movie shows', err);
      } finally {
        setLoadingShows(false);
      }
    }
    loadData();
  }, [movie]);

  // When date changes, reload shows
  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    if (!movie) return;
    try {
      setLoadingShows(true);
      const res = await api.shows.getAll({ movieId: movie.id, date });
      if (res.success) {
        setShows(res.shows);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingShows(false);
    }
  };

  if (!movie) return null;

  // Group shows by cinema
  const showsByCinema: { [cinemaName: string]: IShow[] } = {};
  shows.forEach((s) => {
    const cinName = s.cinemaName || 'IMovies Multiplex';
    if (!showsByCinema[cinName]) {
      showsByCinema[cinName] = [];
    }
    showsByCinema[cinName].push(s);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0e1017] border border-[#212738] rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-black/60 hover:bg-black/80 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Strip */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-900">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter brightness-[0.7]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1017] via-[#0e1017]/60 to-transparent" />

          {/* Quick Play Trailer Button */}
          <button
            onClick={() => setShowTrailer(true)}
            className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 backdrop-blur-sm transition-all cursor-pointer shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Watch Trailer
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 sm:-mt-16 relative z-10 space-y-6">
          {/* Header Split: Poster thumbnail + Title info */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <img
              src={movie.poster}
              alt={movie.title}
              referrerPolicy="no-referrer"
              className="w-28 sm:w-36 aspect-[3/4] object-cover rounded-xl border-2 border-[#2b334a] shadow-xl shrink-0 hidden sm:block"
            />

            <div className="space-y-2 flex-grow">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                  {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-slate-400">{movie.certification}</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {movie.rating.toFixed(1)} / 10
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                {movie.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span>{movie.genres.join(', ')}</span>
                <span className="text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {movie.durationMinutes} mins
                </span>
                <span className="text-slate-600">·</span>
                <span>{movie.language}</span>
                <span className="text-slate-600">·</span>
                <span className="text-red-400 font-mono font-medium">{movie.formats.join(' / ')}</span>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Synopsis
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {movie.description}
            </p>
          </div>

          {/* Cast & Crew */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1d2334] text-xs">
            <div>
              <span className="text-slate-400 block font-semibold mb-1">Director</span>
              <span className="text-white font-medium">{movie.director}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold mb-1">Starring Cast</span>
              <span className="text-slate-200">{movie.cast.join(', ')}</span>
            </div>
          </div>

          {/* Showtimes & Booking Section (if Now Showing) */}
          {movie.status === 'now_showing' ? (
            <div className="pt-4 border-t border-[#1d2334] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-red-500" />
                  Select Date & Showtime
                </h3>
              </div>

              {/* Date Selector Tabs */}
              {dates.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {dates.map((dateStr) => {
                    const d = new Date(dateStr + 'T00:00:00');
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
                    const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDateChange(dateStr)}
                        className={`px-3.5 py-2 rounded-xl text-center text-xs font-medium transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 text-white shadow-md shadow-red-950 font-bold'
                            : 'bg-[#141822] text-slate-300 hover:bg-[#1e2332] border border-[#23293a]'
                        }`}
                      >
                        <div className="text-[10px] uppercase tracking-wider opacity-80">{dayName}</div>
                        <div className="text-xs font-semibold">{monthDay}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Cinemas & Showtimes List */}
              {loadingShows ? (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                  Loading available cinema showtimes...
                </div>
              ) : Object.keys(showsByCinema).length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {Object.entries(showsByCinema).map(([cinName, cinShows]) => (
                    <div
                      key={cinName}
                      className="p-3.5 bg-[#121620] border border-[#1f2638] rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span className="text-xs font-bold text-white">{cinName}</span>
                          {cinShows[0]?.cinemaCity && (
                            <span className="text-[11px] text-slate-400">· {cinShows[0].cinemaCity}</span>
                          )}
                        </div>
                      </div>

                      {/* Showtime Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {cinShows.map((show) => (
                          <button
                            key={show.id}
                            onClick={() => onSelectShowtime(show)}
                            className="px-3 py-1.5 rounded-lg bg-[#181d2a] hover:bg-red-600 border border-[#273046] hover:border-red-500 text-slate-200 hover:text-white transition-all text-xs font-semibold cursor-pointer group flex items-center gap-1.5 shadow-sm"
                          >
                            <span>{show.startTime}</span>
                            <span className="text-[10px] text-red-400 group-hover:text-red-100 font-normal">
                              {show.format}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#141822] rounded-xl text-center text-xs text-slate-400 border border-[#222839]">
                  No showtimes currently scheduled for {selectedDate}. Please pick another date or cinema.
                </div>
              )}
            </div>
          ) : (
            <div className="pt-4 border-t border-[#1d2334] p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-center text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-red-400 mx-auto mb-1.5" />
              This movie is releasing on <span className="text-white font-bold">{movie.releaseDate}</span>. Advance bookings will open soon!
            </div>
          )}
        </div>
      </div>

      {/* Embedded Trailer Overlay */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95">
          <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden border border-slate-800">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-3 right-3 z-10 p-1.5 text-white bg-black/60 rounded-full cursor-pointer hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
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
