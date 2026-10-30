import React from 'react';
import { X, Printer, CheckCircle2, MapPin, Calendar, Clock, Armchair, Ticket } from 'lucide-react';
import { IBooking } from '../types/index.js';
import { QRCodeDisplay } from './QRCodeDisplay.js';

interface DigitalTicketModalProps {
  booking: IBooking | null;
  onClose: () => void;
  onViewAllBookings?: () => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  booking,
  onClose,
  onViewAllBookings
}) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0c0e14] border border-[#212739] rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#12151e] border-b border-[#1f2637]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Booking Confirmed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Ticket
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Digital Ticket Pass */}
        <div id="printable-ticket" className="p-6 space-y-6">
          {/* Cinema Header */}
          <div className="flex items-center justify-between border-b border-dashed border-[#242b3d] pb-4">
            <div>
              <div className="text-lg font-extrabold text-white flex items-center gap-1.5 font-['Outfit']">
                <span>IMOVIES CINEMAS</span>
                <span className="text-[10px] text-red-500 font-mono font-semibold uppercase px-1 py-0.5 bg-red-950/40 rounded border border-red-800/30">
                  VERIFIED PASS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Curated by Harsh Ranawat · Digital Entry Voucher
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Booking Ref</span>
              <span className="text-sm font-mono font-extrabold text-red-400 tracking-wider">
                {booking.referenceCode}
              </span>
            </div>
          </div>

          {/* Movie & Showtime Detail Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                  Movie
                </span>
                <h3 className="text-lg font-extrabold text-white font-['Outfit'] leading-tight">
                  {booking.movieTitle}
                </h3>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{booking.cinemaName}</span>
                </div>
                <div className="text-slate-400 text-[11px] pl-5">
                  {booking.screenName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1d2334] text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{booking.showDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{booking.showTime}</span>
                </div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-3 bg-[#131722] border border-[#232a3e] rounded-xl text-center">
              <QRCodeDisplay value={booking.qrPayload} size={110} />
              <span className="text-[9px] font-mono text-slate-400 mt-2 uppercase tracking-widest">
                Scan at Gate
              </span>
            </div>
          </div>

          {/* Seat Numbers & Patron Details */}
          <div className="p-3.5 bg-[#141824] border border-[#232b3d] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Reserved Seats ({booking.ticketQuantity})
              </span>
              <span className="text-base font-mono font-extrabold text-white">
                {booking.seatNumbers.join(', ')}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                Total Paid
              </span>
              <span className="text-base font-extrabold text-emerald-400 tabular-nums">
                ₹{booking.totalAmount}
              </span>
            </div>
          </div>

          {/* Barcode Simulator Strip */}
          <div className="pt-2 text-center border-t border-dashed border-[#242b3d]">
            <div className="h-9 w-full bg-[repeating-linear-gradient(90deg,#e2e8f0,#e2e8f0_2px,#141824_2px,#141824_6px,#e2e8f0_6px,#e2e8f0_10px,#141824_10px,#141824_12px)] opacity-60 rounded" />
            <div className="text-[10px] font-mono text-slate-500 mt-1 tracking-widest">
              {booking.id.toUpperCase()} · PATRON: {booking.userName.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#11141d] border-t border-[#1d2334] flex items-center justify-between gap-3">
          {onViewAllBookings && (
            <button
              onClick={() => {
                onClose();
                onViewAllBookings();
              }}
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Ticket className="w-4 h-4 text-red-500" />
              View in My Bookings
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
