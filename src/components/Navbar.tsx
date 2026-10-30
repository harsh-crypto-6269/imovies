import React, { useState } from 'react';
import { Film, User, Ticket, ShieldCheck, LogOut, Search, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  onNavigate: (view: 'home' | 'movies' | 'cinemas' | 'bookings' | 'admin') => void;
  currentView: string;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onOpenMyBookings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  currentView,
  onOpenSearch,
  onOpenAdmin,
  onOpenMyBookings
}) => {
  const { user, logout, openAuthModal, isAdmin } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0c10]/95 backdrop-blur-md border-b border-[#1b202e]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-950/60 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1 font-['Outfit']">
                IMOVIES
                <span className="text-xs font-mono font-normal text-red-500 uppercase tracking-widest px-1 py-0.5 bg-red-950/40 rounded border border-red-800/30">
                  CINEMA
                </span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider">
                by Harsh Ranawat
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean text hover) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              currentView === 'home' ? 'text-red-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('movies')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              currentView === 'movies' ? 'text-red-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => onNavigate('cinemas')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              currentView === 'cinemas' ? 'text-red-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Cinemas
          </button>
          <button
            onClick={onOpenMyBookings}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              currentView === 'bookings' ? 'text-red-500 font-semibold' : 'hover:text-white'
            }`}
          >
            My Bookings
          </button>
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className={`whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'admin' ? 'text-red-400 font-semibold' : 'text-amber-400/90 hover:text-amber-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action & Search & User Menu */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenSearch}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Search movies"
            title="Search movies by title, genre, language"
          >
            <Search className="w-4 h-4" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-[#141822] hover:bg-[#1c2230] border border-[#262c3e] rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center text-[10px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-[#12151d] border border-[#252a3b] rounded-xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-[#202534]">
                      <p className="font-semibold text-white truncate">{user.name}</p>
                      <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] text-amber-400 font-mono">
                          Administrator
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenMyBookings();
                      }}
                      className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-[#1a1f2c] flex items-center gap-2 cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-red-400" />
                      My Bookings & Tickets
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-[#1a1f2c] flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        Admin Dashboard
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 flex items-center gap-2 cursor-pointer mt-1 border-t border-[#202534]"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md shadow-red-900/40 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0f15] border-b border-[#1f2433] px-4 py-3 space-y-2">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm text-slate-200 hover:text-red-500"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('movies');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm text-slate-200 hover:text-red-500"
          >
            Movies
          </button>
          <button
            onClick={() => {
              onNavigate('cinemas');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm text-slate-200 hover:text-red-500"
          >
            Cinemas
          </button>
          <button
            onClick={() => {
              onOpenMyBookings();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 text-sm text-slate-200 hover:text-red-500"
          >
            My Bookings
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm text-amber-400 font-semibold"
            >
              Admin Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
