import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { UpperBanner } from './components/UpperBanner.js';
import { Navbar } from './components/Navbar.js';
import { HeroBanner } from './components/HeroBanner.js';
import { MovieCard } from './components/MovieCard.js';
import { MovieDetailsModal } from './components/MovieDetailsModal.js';
import { SeatBookingModal } from './components/SeatBookingModal.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { DigitalTicketModal } from './components/DigitalTicketModal.js';
import { MyBookingsModal } from './components/MyBookingsModal.js';
import { AuthModal } from './components/AuthModal.js';
import { AdminDashboardModal } from './components/AdminDashboardModal.js';
import { Footer } from './components/Footer.js';
import { IMovie, IShow, IBooking } from './types/index.js';
import { api } from './services/api.js';
import { Search, Film, Sparkles, Filter, SlidersHorizontal, MapPin, X } from 'lucide-react';

function MainApp() {
  const { user, isAdmin } = useAuth();

  // State
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [heroMovie, setHeroMovie] = useState<IMovie | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [currentView, setCurrentView] = useState<'home' | 'movies' | 'cinemas' | 'bookings' | 'admin'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'now_showing' | 'coming_soon'>('now_showing');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');

  // Modal States
  const [activeModalMovie, setActiveModalMovie] = useState<IMovie | null>(null);
  const [activeShowForBooking, setActiveShowForBooking] = useState<IShow | null>(null);
  const [checkoutData, setCheckoutData] = useState<any | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<IBooking | null>(null);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Cinemas
  const [cinemas, setCinemas] = useState<any[]>([]);

  // Load Movies
  const loadMovies = async () => {
    try {
      setLoading(true);
      const res = await api.movies.getAll();
      if (res.success) {
        setMovies(res.movies);
        // Find hero movie or fallback to first
        const hero = res.movies.find((m) => m.id === 'mov_nebula_01') || res.movies[0];
        setHeroMovie(hero);
      }
      const cinRes = await api.cinemas.getAll();
      if (cinRes.success) {
        setCinemas(cinRes.cinemas);
      }
    } catch (err) {
      console.error('Failed to load initial movie data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  // Filtered movies
  const filteredMovies = movies.filter((movie) => {
    if (statusFilter !== 'all' && movie.status !== statusFilter) return false;
    if (selectedGenre !== 'All' && !movie.genres.includes(selectedGenre)) return false;
    if (selectedLanguage !== 'All' && !movie.language.includes(selectedLanguage)) return false;
    if (selectedFormat !== 'All' && !movie.formats.includes(selectedFormat)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        movie.title.toLowerCase().includes(q) ||
        movie.description.toLowerCase().includes(q) ||
        movie.director.toLowerCase().includes(q) ||
        movie.genres.some((g) => g.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Unique genres and languages
  const genres = ['All', 'Sci-Fi', 'Action', 'Historical', 'Thriller', 'Adventure', 'Drama'];
  const languages = ['All', 'English', 'Hindi', 'Japanese'];
  const formats = ['All', 'IMAX 3D', 'Dolby Atmos', '4DX', '2D'];

  // Start booking workflow from a movie card
  const handleStartBooking = async (movie: IMovie) => {
    // Open details modal which has showtimes
    setActiveModalMovie(movie);
  };

  const handleSelectShowtime = (show: IShow) => {
    setActiveModalMovie(null);
    setActiveShowForBooking(show);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090c] text-slate-200">
      {/* 1. Upper Side Banner: prominently featuring Harsh Ranawat */}
      <UpperBanner
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 2. Top Bar Navigation: 3-Zone Contract */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'bookings') setIsMyBookingsOpen(true);
          if (view === 'admin') setIsAdminOpen(true);
          if (view === 'movies') {
            window.scrollTo({ top: 580, behavior: 'smooth' });
          } else if (view === 'cinemas') {
            window.scrollTo({ top: 1200, behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenMyBookings={() => setIsMyBookingsOpen(true)}
      />

      {/* 3. Search Floating Bar Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#0f121a] border border-[#273046] rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-red-500" />
              <input
                type="text"
                autoFocus
                placeholder="Search movies by title, genre, director, or cast..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {searchQuery && (
              <div className="mt-3 pt-3 border-t border-[#1f2537] text-xs text-slate-400">
                Found {filteredMovies.length} matching films. Press escape or close to view.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Hero Banner (Spotlight Film) */}
      <HeroBanner
        movie={heroMovie}
        onBookClick={handleStartBooking}
        onDetailsClick={(m) => setActiveModalMovie(m)}
      />

      {/* 5. Main Catalog Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 w-full py-10 space-y-12">
        {/* Filter Toolbar (Segmented Controls) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#181d2b]">
            {/* Status Segmented Control */}
            <div className="flex items-center gap-1 p-1 bg-[#12151f] rounded-xl border border-[#212739] w-fit">
              <button
                onClick={() => setStatusFilter('now_showing')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'now_showing'
                    ? 'bg-red-600 text-white shadow-md shadow-red-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Now Showing
              </button>
              <button
                onClick={() => setStatusFilter('coming_soon')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'coming_soon'
                    ? 'bg-red-600 text-white shadow-md shadow-red-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Coming Soon
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-red-600 text-white shadow-md shadow-red-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Releases ({movies.length})
              </button>
            </div>

            {/* In-page active search indicator */}
            {searchQuery && (
              <div className="flex items-center gap-2 text-xs bg-red-950/40 border border-red-800/40 px-3 py-1.5 rounded-lg text-red-300">
                <span>Filtering by: "{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-red-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Secondary Filter Tags */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Filter className="w-3 h-3 text-red-500" />
              Genre:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedGenre === g
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#131620] hover:bg-[#1c2130] text-slate-300 border border-[#212739]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <span className="text-slate-600 hidden sm:inline">|</span>

            <span className="font-semibold text-slate-300 flex items-center gap-1">
              Language:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <button
                  key={l}
                  onClick={() => setSelectedLanguage(l)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedLanguage === l
                      ? 'bg-white text-black font-bold'
                      : 'bg-[#131620] hover:bg-[#1c2130] text-slate-300 border border-[#212739]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <span className="text-slate-600 hidden md:inline">|</span>

            <span className="font-semibold text-slate-300 flex items-center gap-1">
              Format:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {formats.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFormat(f)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedFormat === f
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-[#131620] hover:bg-[#1c2130] text-slate-300 border border-[#212739]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Movies Grid Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
              {statusFilter === 'now_showing'
                ? 'Now Showing in Theaters'
                : statusFilter === 'coming_soon'
                ? 'Anticipated Upcoming Releases'
                : 'All Movie Titles'}
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {filteredMovies.length} {filteredMovies.length === 1 ? 'Movie' : 'Movies'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[3/4] bg-[#141822] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onBookClick={handleStartBooking}
                  onDetailsClick={(m) => setActiveModalMovie(m)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3 bg-[#11131a] rounded-2xl border border-[#1e2332]">
              <Film className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No movies match your filters</p>
              <p className="text-xs text-slate-400">
                Try resetting your genre, language, or search criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedGenre('All');
                  setSelectedLanguage('All');
                  setSelectedFormat('All');
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>

        {/* Cinema Experience Showcase Feature Section */}
        <section className="p-6 sm:p-8 bg-gradient-to-r from-[#121520] via-[#161a29] to-[#121520] border border-[#232a3e] rounded-2xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4" />
                The IMovies Standard
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                Redefining the Premium Cinema Experience
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Experience crystal clear laser projection, immersive 64-channel Dolby Atmos sound, and hand-stitched leather VIP recliners. Reserved exclusively through the platform curated by Harsh Ranawat.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-3 bg-[#10131d] rounded-xl border border-[#22283a]">
                  <span className="font-bold text-white block">Real-Time Seat Locks</span>
                  <span className="text-slate-400 text-[11px]">10-minute atomic reservation guarantee</span>
                </div>
                <div className="p-3 bg-[#10131d] rounded-xl border border-[#22283a]">
                  <span className="font-bold text-white block">Instant Digital Pass</span>
                  <span className="text-slate-400 text-[11px]">Contactless QR check-in at every auditorium</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#28324a] shadow-2xl">
              <img
                src="/src/assets/images/cinema_luxury_hall_1793329367952.jpg"
                alt="Luxury VIP Cinema Hall"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter brightness-[0.9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-bold text-white font-['Outfit']">
                  Audi 1 - IMAX Laser & Dolby Atmos Luxury Theater
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Participating Cinemas Strip */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              Featured Cinemas & Multiplexes
            </h2>
            <span className="text-xs text-slate-400">{cinemas.length} Locations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cinemas.map((cin) => (
              <div
                key={cin.id}
                className="p-4 bg-[#11141e] border border-[#1f2537] rounded-xl space-y-2 hover:border-red-600/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  <h4 className="text-xs font-bold text-white line-clamp-1">{cin.name}</h4>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{cin.address}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-[#1a1f2e]">
                  City: {cin.city} · {cin.amenities.slice(0, 2).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <Footer />

      {/* MODALS */}
      {/* Movie Details Modal */}
      {activeModalMovie && (
        <MovieDetailsModal
          movie={activeModalMovie}
          onClose={() => setActiveModalMovie(null)}
          onSelectShowtime={handleSelectShowtime}
        />
      )}

      {/* Interactive Seat Booking Modal */}
      {activeShowForBooking && (
        <SeatBookingModal
          show={activeShowForBooking}
          onClose={() => setActiveShowForBooking(null)}
          onProceedToCheckout={(data) => {
            setActiveShowForBooking(null);
            setCheckoutData(data);
          }}
        />
      )}

      {/* Checkout Modal */}
      {checkoutData && (
        <CheckoutModal
          bookingData={checkoutData}
          onClose={() => setCheckoutData(null)}
          onBookingSuccess={(booking) => {
            setCheckoutData(null);
            setConfirmedBooking(booking);
          }}
        />
      )}

      {/* Digital Ticket Modal */}
      {confirmedBooking && (
        <DigitalTicketModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
          onViewAllBookings={() => {
            setConfirmedBooking(null);
            setIsMyBookingsOpen(true);
          }}
        />
      )}

      {/* My Bookings Modal */}
      {isMyBookingsOpen && (
        <MyBookingsModal
          onClose={() => setIsMyBookingsOpen(false)}
          onOpenTicket={(b) => setConfirmedBooking(b)}
        />
      )}

      {/* Admin Dashboard Modal */}
      {isAdminOpen && (
        <AdminDashboardModal
          onClose={() => setIsAdminOpen(false)}
          onRefreshMovies={loadMovies}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
