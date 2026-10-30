import React, { useState, useEffect } from 'react';
import {
  X, ShieldCheck, Plus, Trash2, Edit3, Film, Calendar,
  Ticket, DollarSign, Search, CheckCircle, RefreshCw, Armchair
} from 'lucide-react';
import { IAdminStats, IMovie, IBooking } from '../types/index.js';
import { api } from '../services/api.js';

interface AdminDashboardModalProps {
  onClose: () => void;
  onRefreshMovies: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
  onRefreshMovies
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'movies' | 'shows' | 'bookings'>('overview');
  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [searchBookingQuery, setSearchBookingQuery] = useState('');

  // Movie Form State
  const [isAddingMovie, setIsAddingMovie] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    poster: '',
    backdrop: '',
    trailerUrl: '',
    genres: 'Sci-Fi, Action',
    language: 'English',
    durationMinutes: 140,
    releaseDate: '2026-03-20',
    status: 'now_showing',
    rating: 8.8,
    certification: 'UA',
    director: '',
    cast: '',
    formats: 'IMAX 3D, Dolby Atmos, 2D'
  });

  // Show Scheduler Form State
  const [showForm, setShowForm] = useState({
    movieId: '',
    cinemaId: '',
    screenId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '07:30 PM',
    format: 'IMAX 3D',
    reclinerPrice: 480,
    premiumPrice: 340,
    standardPrice: 220
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, moviesRes, bookingsRes, cinemasRes] = await Promise.all([
        api.admin.getStats(),
        api.movies.getAll(),
        api.admin.getAllBookings(),
        api.cinemas.getAll()
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (moviesRes.success) {
        setMovies(moviesRes.movies);
        if (moviesRes.movies.length > 0 && !showForm.movieId) {
          setShowForm((prev) => ({ ...prev, movieId: moviesRes.movies[0].id }));
        }
      }
      if (bookingsRes.success) setBookings(bookingsRes.bookings);
      if (cinemasRes.success) {
        setCinemas(cinemasRes.cinemas);
        if (cinemasRes.cinemas.length > 0) {
          const firstCin = cinemasRes.cinemas[0];
          setShowForm((prev) => ({ ...prev, cinemaId: firstCin.id }));
          // Fetch screens for first cinema
          const cinDetails = await api.cinemas.getById(firstCin.id);
          if (cinDetails.success && cinDetails.screens.length > 0) {
            setScreens(cinDetails.screens);
            setShowForm((prev) => ({ ...prev, screenId: cinDetails.screens[0].id }));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When cinema selection changes in show scheduler, load screens
  const handleCinemaChange = async (cinemaId: string) => {
    setShowForm((prev) => ({ ...prev, cinemaId }));
    try {
      const res = await api.cinemas.getById(cinemaId);
      if (res.success && res.screens.length > 0) {
        setScreens(res.screens);
        setShowForm((prev) => ({ ...prev, screenId: res.screens[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...movieForm,
        genres: movieForm.genres.split(',').map((g) => g.trim()),
        cast: movieForm.cast.split(',').map((c) => c.trim()),
        formats: movieForm.formats.split(',').map((f) => f.trim())
      };

      if (editingMovieId) {
        await api.admin.updateMovie(editingMovieId, payload);
        setMessage('Movie updated successfully.');
      } else {
        await api.admin.createMovie(payload);
        setMessage('New movie added to catalog.');
      }

      setIsAddingMovie(false);
      setEditingMovieId(null);
      await loadData();
      onRefreshMovies();
    } catch (err: any) {
      setMessage(err.message || 'Error saving movie.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm('Are you sure you want to remove this movie?')) return;
    try {
      await api.admin.deleteMovie(id);
      setMessage('Movie deleted successfully.');
      await loadData();
      onRefreshMovies();
    } catch (err: any) {
      setMessage(err.message || 'Failed to delete movie.');
    }
  };

  const handleScheduleShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        movieId: showForm.movieId,
        cinemaId: showForm.cinemaId,
        screenId: showForm.screenId,
        date: showForm.date,
        startTime: showForm.startTime,
        format: showForm.format,
        pricing: [
          { category: 'Recliner', price: Number(showForm.reclinerPrice) },
          { category: 'Premium', price: Number(showForm.premiumPrice) },
          { category: 'Standard', price: Number(showForm.standardPrice) }
        ]
      };

      const res = await api.admin.createShow(payload);
      if (res.success) {
        setMessage('Showtime scheduled successfully!');
        await loadData();
      }
    } catch (err: any) {
      setMessage(err.message || 'Failed to schedule showtime.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset database to default seed movies, cinemas, and shows?')) return;
    try {
      setLoading(true);
      await api.admin.resetDb();
      setMessage('Database reset to defaults.');
      await loadData();
      onRefreshMovies();
    } catch (err: any) {
      setMessage('Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0b0d13] border border-[#202637] rounded-2xl shadow-2xl flex flex-col my-4 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2130] shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white font-['Outfit']">
              IMovies Administration Console
            </h2>
            <span className="text-[11px] text-slate-400">
              · Curated by Harsh Ranawat
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#10131c] border-b border-[#1b2130] text-xs font-semibold">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-1 transition-colors cursor-pointer ${
                activeTab === 'overview' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview & Metrics
            </button>
            <button
              onClick={() => setActiveTab('movies')}
              className={`py-1 transition-colors cursor-pointer ${
                activeTab === 'movies' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              Movie Catalog ({movies.length})
            </button>
            <button
              onClick={() => setActiveTab('shows')}
              className={`py-1 transition-colors cursor-pointer ${
                activeTab === 'shows' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              Showtime Scheduler
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-1 transition-colors cursor-pointer ${
                activeTab === 'bookings' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Bookings ({bookings.length})
            </button>
          </div>

          <button
            onClick={handleResetData}
            title="Reset to default demo movies"
            className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white bg-[#191d29] hover:bg-[#252b3d] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Data
          </button>
        </div>

        {/* Notice alert */}
        {message && (
          <div className="mx-6 mt-3 p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-emerald-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-[#131622] border border-[#20273a] rounded-xl space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Revenue</span>
                  <div className="text-xl font-extrabold text-white tabular-nums">
                    ₹{stats?.totalRevenue.toLocaleString() || '0'}
                  </div>
                </div>

                <div className="p-4 bg-[#131622] border border-[#20273a] rounded-xl space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Bookings</span>
                  <div className="text-xl font-extrabold text-white tabular-nums">
                    {stats?.totalBookings || 0}
                  </div>
                </div>

                <div className="p-4 bg-[#131622] border border-[#20273a] rounded-xl space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Tickets Issued</span>
                  <div className="text-xl font-extrabold text-white tabular-nums">
                    {stats?.totalTicketsSold || 0}
                  </div>
                </div>

                <div className="p-4 bg-[#131622] border border-[#20273a] rounded-xl space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Registered Users</span>
                  <div className="text-xl font-extrabold text-white tabular-nums">
                    {stats?.usersCount || 0}
                  </div>
                </div>
              </div>

              {/* Recent Bookings Feed */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recent Ticket Reservations
                </h3>
                <div className="border border-[#1f2536] rounded-xl overflow-hidden divide-y divide-[#1f2536]">
                  {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                    stats.recentBookings.map((b) => (
                      <div key={b.id} className="p-3 bg-[#11141e] flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-red-400 font-mono">{b.referenceCode}</span>
                          <span className="text-slate-300 ml-2 font-medium">{b.movieTitle}</span>
                          <span className="text-slate-500 ml-2">({b.userName})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-slate-400">Seats: {b.seatNumbers.join(', ')}</span>
                          <span className="font-bold text-emerald-400 tabular-nums">₹{b.totalAmount}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">No bookings recorded yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOVIE CATALOG */}
          {activeTab === 'movies' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Movie Titles</h3>
                <button
                  onClick={() => {
                    setEditingMovieId(null);
                    setMovieForm({
                      title: '',
                      description: '',
                      poster: '',
                      backdrop: '',
                      trailerUrl: '',
                      genres: 'Sci-Fi, Action',
                      language: 'English',
                      durationMinutes: 140,
                      releaseDate: '2026-03-20',
                      status: 'now_showing',
                      rating: 8.8,
                      certification: 'UA',
                      director: '',
                      cast: '',
                      formats: 'IMAX 3D, Dolby Atmos, 2D'
                    });
                    setIsAddingMovie(!isAddingMovie);
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingMovie ? 'Cancel' : 'Add New Movie'}
                </button>
              </div>

              {/* Add/Edit Form */}
              {isAddingMovie && (
                <form onSubmit={handleSaveMovie} className="p-4 bg-[#141824] border border-[#232b3e] rounded-xl space-y-3 text-xs">
                  <h4 className="font-bold text-white">{editingMovieId ? 'Edit Movie' : 'New Movie Details'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Movie Title"
                      required
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      className="px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                    <input
                      placeholder="Director Name"
                      required
                      value={movieForm.director}
                      onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                      className="px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                    <input
                      placeholder="Poster URL (or /src/assets/...)"
                      required
                      value={movieForm.poster}
                      onChange={(e) => setMovieForm({ ...movieForm, poster: e.target.value })}
                      className="px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                    <input
                      placeholder="Backdrop URL"
                      value={movieForm.backdrop}
                      onChange={(e) => setMovieForm({ ...movieForm, backdrop: e.target.value })}
                      className="px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                    <input
                      placeholder="Genres (comma separated)"
                      value={movieForm.genres}
                      onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                      className="px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                    <input
                      placeholder="Cast (comma separated)"
                      value={movieForm.cast}
                      onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                      className="px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Minutes"
                        value={movieForm.durationMinutes}
                        onChange={(e) => setMovieForm({ ...movieForm, durationMinutes: Number(e.target.value) })}
                        className="px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Rating"
                        value={movieForm.rating}
                        onChange={(e) => setMovieForm({ ...movieForm, rating: Number(e.target.value) })}
                        className="px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                      />
                      <select
                        value={movieForm.status}
                        onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                        className="px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                      >
                        <option value="now_showing">Now Showing</option>
                        <option value="coming_soon">Coming Soon</option>
                      </select>
                    </div>
                    <input
                      placeholder="Formats (e.g. IMAX 3D, Dolby Atmos)"
                      value={movieForm.formats}
                      onChange={(e) => setMovieForm({ ...movieForm, formats: e.target.value })}
                      className="px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Synopsis / description"
                    required
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Save Movie
                  </button>
                </form>
              )}

              {/* Movies Table */}
              <div className="border border-[#1f2638] rounded-xl overflow-hidden divide-y divide-[#1f2638]">
                {movies.map((m) => (
                  <div key={m.id} className="p-3 bg-[#11141e] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.poster}
                        alt={m.title}
                        referrerPolicy="no-referrer"
                        className="w-10 h-14 object-cover rounded bg-slate-800"
                      />
                      <div>
                        <div className="font-bold text-white">{m.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {m.genres.join(', ')} · {m.durationMinutes}m · {m.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingMovieId(m.id);
                          setMovieForm({
                            title: m.title,
                            description: m.description,
                            poster: m.poster,
                            backdrop: m.backdrop,
                            trailerUrl: m.trailerUrl,
                            genres: m.genres.join(', '),
                            language: m.language,
                            durationMinutes: m.durationMinutes,
                            releaseDate: m.releaseDate,
                            status: m.status,
                            rating: m.rating,
                            certification: m.certification,
                            director: m.director,
                            cast: m.cast.join(', '),
                            formats: m.formats.join(', ')
                          });
                          setIsAddingMovie(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(m.id)}
                        className="p-1.5 text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SHOWTIME SCHEDULER */}
          {activeTab === 'shows' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Schedule New Showtime</h3>

              <form onSubmit={handleScheduleShow} className="p-4 bg-[#141824] border border-[#232b3e] rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Movie</label>
                    <select
                      value={showForm.movieId}
                      onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    >
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Cinema</label>
                    <select
                      value={showForm.cinemaId}
                      onChange={(e) => handleCinemaChange(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    >
                      {cinemas.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Auditorium / Screen</label>
                    <select
                      value={showForm.screenId}
                      onChange={(e) => setShowForm({ ...showForm, screenId: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    >
                      {screens.map((s) => (
                        <option key={s.id} value={s.id}>{s.screenName} ({s.format})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Date</label>
                    <input
                      type="date"
                      value={showForm.date}
                      onChange={(e) => setShowForm({ ...showForm, date: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Showtime</label>
                    <input
                      type="text"
                      placeholder="e.g. 07:45 PM"
                      value={showForm.startTime}
                      onChange={(e) => setShowForm({ ...showForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Format</label>
                    <input
                      type="text"
                      placeholder="IMAX 3D / Dolby Atmos"
                      value={showForm.format}
                      onChange={(e) => setShowForm({ ...showForm, format: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#1f2638]">
                  <div>
                    <label className="text-slate-400 block mb-1">Recliner Price (₹)</label>
                    <input
                      type="number"
                      value={showForm.reclinerPrice}
                      onChange={(e) => setShowForm({ ...showForm, reclinerPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Premium Price (₹)</label>
                    <input
                      type="number"
                      value={showForm.premiumPrice}
                      onChange={(e) => setShowForm({ ...showForm, premiumPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Standard Price (₹)</label>
                    <input
                      type="number"
                      value={showForm.standardPrice}
                      onChange={(e) => setShowForm({ ...showForm, standardPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#1b2130] border border-[#2c364c] rounded-lg text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Schedule Show
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ALL BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-white">All Customer Bookings</h3>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by ref, email, title..."
                    value={searchBookingQuery}
                    onChange={(e) => setSearchBookingQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#141824] border border-[#222839] rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="border border-[#1f2638] rounded-xl overflow-hidden divide-y divide-[#1f2638]">
                {bookings
                  .filter(
                    (b) =>
                      !searchBookingQuery ||
                      b.referenceCode.toLowerCase().includes(searchBookingQuery.toLowerCase()) ||
                      b.userEmail.toLowerCase().includes(searchBookingQuery.toLowerCase()) ||
                      b.movieTitle.toLowerCase().includes(searchBookingQuery.toLowerCase())
                  )
                  .map((b) => (
                    <div key={b.id} className="p-3.5 bg-[#11141e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-red-400">{b.referenceCode}</span>
                          <span className="text-slate-400">· {b.userEmail} ({b.userName})</span>
                        </div>
                        <div className="text-white font-semibold mt-0.5">
                          {b.movieTitle} · <span className="text-slate-400 font-normal">{b.cinemaName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.showDate} at {b.showTime} · Seats: <span className="text-white font-mono">{b.seatNumbers.join(', ')}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400 tabular-nums">
                          ₹{b.totalAmount}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {b.paymentMethod || 'Razorpay Test'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
