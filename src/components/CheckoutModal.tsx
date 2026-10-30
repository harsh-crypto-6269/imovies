import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, ArrowRight, Lock, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api.js';
import { IBooking } from '../types/index.js';

interface CheckoutModalProps {
  bookingData: {
    show: any;
    movie: any;
    cinema: any;
    screen: any;
    selectedSeats: string[];
    seatDetails: { seatId: string; category: string; price: number }[];
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    expiresAt: number;
  };
  onClose: () => void;
  onBookingSuccess: (booking: IBooking) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  bookingData,
  onClose,
  onBookingSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    try {
      setProcessing(true);
      setError(null);

      // 1. Create order on backend (Razorpay test order)
      const orderRes = await api.payments.createOrder({
        amount: bookingData.totalAmount,
        showId: bookingData.show.id,
        seatIds: bookingData.selectedSeats
      });

      if (!orderRes.success) {
        throw new Error('Failed to initiate secure payment gateway order.');
      }

      // Simulate network gateway transit
      await new Promise((res) => setTimeout(res, 1200));

      const paymentTxnId = `pay_rzp_test_${Date.now()}`;

      // 2. Verify payment on server
      const verifyRes = await api.payments.verify({
        orderId: orderRes.order.id,
        paymentId: paymentTxnId,
        amount: bookingData.totalAmount,
        method: `Razorpay Test (${paymentMethod.toUpperCase()})`,
        simulateFailure
      });

      if (!verifyRes.success) {
        throw new Error(verifyRes.message || 'Payment was declined by issuing bank simulator.');
      }

      // 3. Confirm booking atomically on backend
      const confirmRes = await api.bookings.confirm({
        showId: bookingData.show.id,
        seatIds: bookingData.selectedSeats,
        paymentId: paymentTxnId,
        paymentMethod: `Razorpay Test (${paymentMethod.toUpperCase()})`
      });

      if (confirmRes.success && confirmRes.booking) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        onBookingSuccess(confirmRes.booking);
      }
    } catch (err: any) {
      setError(err.message || 'Transaction could not be completed. Your seats remain reserved for the timer duration.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e1017] border border-[#212739] rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1d2334]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Secure Cinema Checkout
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
              Razorpay Test Mode
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Order Summary Card */}
          <div className="p-4 bg-[#141824] border border-[#232a3e] rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">{bookingData.movie?.title}</h4>
                <p className="text-xs text-slate-400">
                  {bookingData.cinema?.name} · {bookingData.screen?.screenName}
                </p>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {bookingData.show?.date} at {bookingData.show?.startTime}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Seats ({bookingData.selectedSeats.length})</span>
                <span className="text-sm font-mono font-bold text-red-400">
                  {bookingData.selectedSeats.join(', ')}
                </span>
              </div>
            </div>

            <div className="border-t border-[#1f2638] pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tickets Subtotal</span>
                <span className="tabular-nums">₹{bookingData.subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Integrated GST & Convenience Fee (18%)</span>
                <span className="tabular-nums">₹{bookingData.taxAmount}</span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-[#1f2638]">
                <span>Total Amount Due</span>
                <span className="text-red-400 font-extrabold tabular-nums">₹{bookingData.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Choose Payment Method
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'bg-red-950/40 border-red-500 text-white font-bold shadow-sm'
                    : 'bg-[#12151f] border-[#202738] text-slate-300 hover:bg-[#1a1f2c]'
                }`}
              >
                <div className="text-xs font-semibold">UPI Instant</div>
                <div className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-red-950/40 border-red-500 text-white font-bold shadow-sm'
                    : 'bg-[#12151f] border-[#202738] text-slate-300 hover:bg-[#1a1f2c]'
                }`}
              >
                <div className="text-xs font-semibold">Debit / Credit Card</div>
                <div className="text-[10px] text-slate-400">Visa, Mastercard</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'netbanking'
                    ? 'bg-red-950/40 border-red-500 text-white font-bold shadow-sm'
                    : 'bg-[#12151f] border-[#202738] text-slate-300 hover:bg-[#1a1f2c]'
                }`}
              >
                <div className="text-xs font-semibold">NetBanking</div>
                <div className="text-[10px] text-slate-400">All Major Banks</div>
              </button>
            </div>

            {/* Payment Fields (Demo & Test Mode Safe) */}
            <div className="p-3.5 bg-[#12151f] border border-[#202738] rounded-xl text-xs space-y-2">
              {paymentMethod === 'upi' && (
                <div className="space-y-1">
                  <span className="text-slate-400">Virtual Payment Address (VPA):</span>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1a1f2c] border border-[#2b334a] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-red-500"
                    placeholder="name@upi"
                  />
                  <p className="text-[11px] text-slate-500">
                    Test Mode: Any valid VPA will pass verification automatically.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-1">
                  <span className="text-slate-400">Test Card Simulator:</span>
                  <input
                    type="text"
                    value={cardNumber}
                    readOnly
                    className="w-full px-3 py-2 bg-[#1a1f2c] border border-[#2b334a] rounded-lg text-white font-mono text-xs cursor-default"
                  />
                  <p className="text-[11px] text-slate-500">
                    Zero raw card data stored. Processed through certified PCI-DSS test environment.
                  </p>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-1">
                  <span className="text-slate-400">Bank Selection:</span>
                  <select className="w-full px-3 py-2 bg-[#1a1f2c] border border-[#2b334a] rounded-lg text-white text-xs focus:outline-none focus:border-red-500">
                    <option>HDFC Bank (Test Gateway)</option>
                    <option>State Bank of India</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Test Simulation Toggle */}
          <div className="flex items-center justify-between p-3 bg-[#131620] border border-[#1f2536] rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">Simulate Payment Gateway Failure (QA Test):</span>
            </div>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="accent-red-600 w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            disabled={processing}
            onClick={handlePay}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-lg shadow-red-950/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Payment with Server...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Authorize & Pay ₹{bookingData.totalAmount}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
