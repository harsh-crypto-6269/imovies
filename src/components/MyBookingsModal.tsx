import React, { useState, useEffect } from 'react';
import { X, Ticket, Calendar, Clock, MapPin, QrCode, Printer, ChevronRight } from 'lucide-react';
import { IBooking } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface MyBookingsModalProps {
  onClose: () => void;
  onOpenTicket: (booking: IBooking) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({ onClose, onOpenTicket }) => {
  const { user, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming'>('all');

  useEffect(() => {
    if (!user) return;

    async function fetchBookings() {
      try {
        setLoading(true);
        const res = await api.bookings.getMyBookings();
        if (res.success) {
          setBookings(res.bookings);
        }
      } catch (err) {
        console.error('Failed to load user bookings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [user]);

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="w-full max-w-md bg-[#0e1017] border border-[#212739] rounded-2xl p-6 text-center space-y-4">
          <Ticket className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Sign In to View Your Bookings</h3>
          <p className="text-xs text-slate-400">
            Access your movie tickets, QR entrance vouchers, and booking receipts.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => {
                onClose();
                openAuthModal('login');
              }}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const displayedBookings = bookings.filter((b) => {
    if (filter === 'upcoming') {
      return b.showDate >= today;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0c0e14] border border-[#202637] rounded-2xl shadow-2xl flex flex-col my-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c2232] shrink-0">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-white font-['Outfit']">
              My Movie Tickets & Passes
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#141822] rounded-lg border border-[#23293a]">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  filter === 'all' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setFilter('upcoming')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  filter === 'upcoming' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Upcoming
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
              Retrieving your digital tickets...
            </div>
          ) : displayedBookings.length > 0 ? (
            displayedBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-[#12151e] border border-[#1f2637] hover:border-red-600/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-400 font-mono tracking-wider">
                      {b.referenceCode}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30">
                      Confirmed
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white font-['Outfit']">
                    {b.movieTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {b.cinemaName}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.showDate}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {b.showTime}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 pt-1">
                    Seats: <span className="font-mono font-bold text-white">{b.seatNumbers.join(', ')}</span> ({b.ticketQuantity} tickets)
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1c2232]">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">Paid</span>
                    <span className="text-sm font-bold text-white tabular-nums">₹{b.totalAmount}</span>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenTicket(b);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-md shadow-red-950 transition-all cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    View Ticket & QR
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center space-y-3">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No bookings found</p>
              <p className="text-xs text-slate-500">
                You haven't reserved any tickets yet. Explore movies now to book your seats!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
