import React, { useState, useEffect } from 'react';
import { X, Clock, Armchair, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { IShow, ISeat } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface SeatBookingModalProps {
  show: IShow | null;
  onClose: () => void;
  onProceedToCheckout: (bookingData: {
    show: IShow;
    movie: any;
    cinema: any;
    screen: any;
    selectedSeats: string[];
    seatDetails: { seatId: string; category: string; price: number }[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    expiresAt: number;
  }) => void;
}

export const SeatBookingModal: React.FC<SeatBookingModalProps> = ({
  show,
  onClose,
  onProceedToCheckout
}) => {
  const { user, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [movieData, setMovieData] = useState<any>(null);
  const [cinemaData, setCinemaData] = useState<any>(null);
  const [screenData, setScreenData] = useState<any>(null);
  const [seats, setSeats] = useState<ISeat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  const [holding, setHolding] = useState(false);
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('10:00');

  // Load seat matrix from backend
  useEffect(() => {
    if (!show) return;

    async function loadSeats() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.shows.getById(show!.id);
        if (res.success) {
          setMovieData(res.movie);
          setCinemaData(res.cinema);
          setScreenData(res.screen);
          setSeats(res.seats);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load cinema seat map.');
      } finally {
        setLoading(false);
      }
    }

    loadSeats();
  }, [show]);

  // Hold Timer countdown
  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft('00:00');
        setError('Seat reservation hold expired. Please reselect your seats.');
        setSelectedSeatIds([]);
        setHoldExpiresAt(null);
      } else {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  if (!show) return null;

  // Toggle seat selection
  const handleSeatClick = (seat: ISeat) => {
    if (seat.status === 'booked') return;
    if (seat.status === 'held' && !seat.heldByMe) return;

    const alreadySelected = selectedSeatIds.includes(seat.seatId);

    if (alreadySelected) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.seatId));
    } else {
      if (selectedSeatIds.length >= 10) {
        setError('You can select a maximum of 10 seats per booking.');
        return;
      }
      setError(null);
      setSelectedSeatIds([...selectedSeatIds, seat.seatId]);
    }
  };

  // Group seats by row
  const rowsMap: { [row: string]: ISeat[] } = {};
  seats.forEach((seat) => {
    if (!rowsMap[seat.row]) {
      rowsMap[seat.row] = [];
    }
    rowsMap[seat.row].push(seat);
  });

  // Calculate pricing breakdown
  const selectedSeatDetails = selectedSeatIds.map((id) => {
    const seatObj = seats.find((s) => s.seatId === id);
    return {
      seatId: id,
      category: seatObj?.category || 'Standard',
      price: seatObj?.price || 200
    };
  });

  const subtotal = selectedSeatDetails.reduce((sum, s) => sum + s.price, 0);
  const taxAmount = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST / fee
  const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

  // Handle proceed: acquire temporary hold lock on backend
  const handleProceed = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (selectedSeatIds.length === 0) {
      setError('Please select at least one seat to proceed.');
      return;
    }

    try {
      setHolding(true);
      setError(null);

      // Call backend atomic hold
      const holdRes = await api.bookings.hold(show.id, selectedSeatIds);
      if (holdRes.success) {
        setHoldExpiresAt(holdRes.expiresAt);

        onProceedToCheckout({
          show,
          movie: movieData,
          cinema: cinemaData,
          screen: screenData,
          selectedSeats: selectedSeatIds,
          seatDetails: selectedSeatDetails,
          subtotal,
          taxAmount,
          totalAmount,
          expiresAt: holdRes.expiresAt
        });
      }
    } catch (err: any) {
      setError(err.message || 'Seat selection conflict. Some seats have just been reserved by another patron.');
      // Refresh seat layout to reflect current occupied seats
      const res = await api.shows.getById(show.id);
      if (res.success) {
        setSeats(res.seats);
      }
    } finally {
      setHolding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#0b0d13] border border-[#202637] rounded-2xl shadow-2xl flex flex-col my-4 max-h-[96vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1b2130] shrink-0">
          <div className="flex flex-col">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>{movieData?.title || show.movieTitle || 'Movie'}</span>
              <span className="text-xs text-red-400 font-mono font-normal">[{show.format}]</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{cinemaData?.name || show.cinemaName}</span>
              <span>·</span>
              <span>{screenData?.screenName || 'Screen 1'}</span>
              <span>·</span>
              <span className="text-white font-medium">{show.date} at {show.startTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {holdExpiresAt && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 border border-amber-800/40 rounded-lg text-amber-300 text-xs font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>Lock: {timeLeft}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Seat Map Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow flex flex-col items-center">
          {loading ? (
            <div className="py-20 text-center text-sm text-slate-400 animate-pulse">
              Generating cinema seating architecture...
            </div>
          ) : (
            <div className="w-full flex flex-col items-center max-w-3xl">
              {/* Cinema Screen Curve Graphic */}
              <div className="w-full max-w-xl mb-8 flex flex-col items-center">
                <div className="w-full h-3 rounded-[100%] bg-gradient-to-b from-red-500 to-red-600/30 cinema-screen-arc" />
                <span className="text-[11px] font-mono tracking-widest text-slate-500 uppercase mt-2">
                  All Eyes This Way · Curved Screen
                </span>
              </div>

              {/* Error Callout */}
              {error && (
                <div className="w-full mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center gap-2 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Seating Grid */}
              <div className="w-full overflow-x-auto pb-4 flex flex-col items-center">
                <div className="space-y-2.5 min-w-[500px]">
                  {Object.entries(rowsMap).map(([rowLetter, rowSeats]) => {
                    const rowCategory = rowSeats[0]?.category || 'Standard';
                    const rowPrice = rowSeats[0]?.price || 200;

                    return (
                      <div key={rowLetter} className="flex items-center gap-2 sm:gap-3 justify-center">
                        {/* Row Identifier */}
                        <div className="w-6 text-center text-xs font-bold text-slate-500 font-mono">
                          {rowLetter}
                        </div>

                        {/* Seat Row with center aisle split */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {rowSeats.map((seat, index) => {
                            const isSelected = selectedSeatIds.includes(seat.seatId);
                            const isBooked = seat.status === 'booked';
                            const isHeld = seat.status === 'held' && !seat.heldByMe;
                            const isAisleGap = index === 3 || index === 7;

                            let seatStyle = 'bg-[#1a202c] border-[#2d3748] text-slate-300 hover:border-red-500 hover:bg-[#252f40]';

                            if (isSelected) {
                              seatStyle = 'bg-red-600 border-red-500 text-white shadow-md shadow-red-900/60 font-bold scale-105';
                            } else if (isBooked) {
                              seatStyle = 'bg-[#11141c] border-[#181d28] text-slate-700 cursor-not-allowed opacity-50';
                            } else if (isHeld) {
                              seatStyle = 'bg-amber-950/40 border-amber-800/50 text-amber-500/60 cursor-not-allowed';
                            } else if (seat.category === 'Recliner') {
                              seatStyle = 'bg-[#211624] border-[#4a2b53] text-purple-300 hover:border-purple-400';
                            }

                            return (
                              <React.Fragment key={seat.seatId}>
                                <button
                                  disabled={isBooked || isHeld}
                                  onClick={() => handleSeatClick(seat)}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-[11px] font-mono flex items-center justify-center transition-all cursor-pointer ${seatStyle}`}
                                  title={`Seat ${seat.seatId} (${seat.category} - ₹${seat.price})`}
                                >
                                  {isSelected ? <Check className="w-3.5 h-3.5" /> : seat.number}
                                </button>
                                {isAisleGap && <div className="w-4 sm:w-6" />}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* Category Price tag on row end */}
                        <div className="w-16 text-right text-[10px] text-slate-500 font-mono hidden sm:block">
                          ₹{rowPrice}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visual Legend */}
              <div className="w-full flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 mt-4 border-t border-[#1a202e] text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#1a202c] border border-[#2d3748]" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-600 border border-red-500 shadow-sm" />
                  <span className="text-white font-medium">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#11141c] border border-[#181d28] opacity-50" />
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-950/60 border border-amber-800/50" />
                  <span className="text-amber-400">Reserved (Lock)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Armchair className="w-4 h-4 text-purple-400" />
                  <span>Recliner Row</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary Strip */}
        <div className="px-5 py-4 bg-[#0d0f16] border-t border-[#1c2232] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs w-full sm:w-auto">
            <div>
              <span className="text-slate-400 block">Selected Seats:</span>
              <span className="text-white font-bold font-mono text-sm">
                {selectedSeatIds.length > 0 ? selectedSeatIds.join(', ') : 'None'}
              </span>
            </div>

            {selectedSeatIds.length > 0 && (
              <div className="flex items-center gap-4 border-l border-[#22283a] sm:pl-6">
                <div>
                  <span className="text-slate-400 block">Tickets ({selectedSeatIds.length}):</span>
                  <span className="text-slate-200 tabular-nums">₹{subtotal}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">+ GST & Fee (18%):</span>
                  <span className="text-slate-200 tabular-nums">₹{taxAmount}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-white">Grand Total:</span>
                  <span className="text-red-400 font-extrabold text-base tabular-nums">₹{totalAmount}</span>
                </div>
              </div>
            )}
          </div>

          <button
            disabled={selectedSeatIds.length === 0 || holding}
            onClick={handleProceed}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-lg shadow-lg shadow-red-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {holding ? 'Securing Seats...' : 'Proceed to Checkout'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
