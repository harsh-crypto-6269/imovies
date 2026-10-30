import { Response } from 'express';
import { db } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';
import { IBooking } from '../db/types.js';

// Generate clean human-readable booking reference e.g. IMV-2026-X892K
function generateBookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'IMV-2026-';
  for (let i = 0; i < 5; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export function holdSeats(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Please log in to reserve seats.' });
    }

    const { showId, seatIds } = req.body;

    if (!showId || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Valid show ID and seat list are required.' });
    }

    if (seatIds.length > 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 seats can be booked in a single transaction.' });
    }

    // Atomic hold via store
    const result = db.shows.holdSeats(showId, seatIds, req.user.id);

    return res.json({
      success: true,
      message: 'Seats held successfully for 10 minutes.',
      expiresAt: result.expiresAt
    });
  } catch (err: any) {
    return res.status(409).json({
      success: false,
      message: err.message || 'Seat reservation conflict. Some selected seats are no longer available.'
    });
  }
}

export function releaseSeats(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const { showId, seatIds } = req.body;
    if (showId && Array.isArray(seatIds)) {
      db.shows.releaseSeats(showId, seatIds, req.user.id);
    }

    return res.json({ success: true, message: 'Seats released.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to release seats.' });
  }
}

export function confirmBooking(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { showId, seatIds, paymentId, paymentMethod } = req.body;

    if (!showId || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Showtime and seats are required.' });
    }

    const show = db.shows.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }

    const movie = db.movies.findById(show.movieId);
    const cinema = db.cinemas.findById(show.cinemaId);
    const screen = db.screens.findById(show.screenId);

    if (!movie || !cinema || !screen) {
      return res.status(400).json({ success: false, message: 'Invalid show references.' });
    }

    // Calculate dynamic pricing based on screen categories
    const seatDetails: { seatId: string; category: string; price: number }[] = [];
    let subtotal = 0;

    for (const seatId of seatIds) {
      const rowLetter = seatId.charAt(0);
      const cat = screen.categories.find((c) => c.rows.includes(rowLetter)) || screen.categories[screen.categories.length - 1];
      const customPrice = show.pricing.find((p) => p.category === cat.name)?.price || cat.price;

      seatDetails.push({
        seatId,
        category: cat.name,
        price: customPrice
      });
      subtotal += customPrice;
    }

    // Taxes & convenience fees (18% GST)
    const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    // Confirm booking atomically on the show's bookedSeats
    db.shows.confirmBooking(showId, seatIds, req.user.id);

    const referenceCode = generateBookingRef();
    const qrPayload = `IMOVIES:${referenceCode}:${showId}:${seatIds.join(',')}:${totalAmount}:VERIFIED`;

    const booking: IBooking = {
      id: `bkg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      referenceCode,
      userId: req.user.id,
      userEmail: req.user.email,
      userName: req.user.name,
      showId,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.poster,
      cinemaId: cinema.id,
      cinemaName: cinema.name,
      screenName: screen.screenName,
      showDate: show.date,
      showTime: show.startTime,
      seatNumbers: seatIds,
      seatDetails,
      ticketQuantity: seatIds.length,
      subtotal,
      taxAmount,
      totalAmount,
      bookingStatus: 'confirmed',
      paymentId: paymentId || `txn_demo_${Date.now()}`,
      paymentMethod: paymentMethod || 'Demo Gateway (Test Verified)',
      qrPayload,
      createdAt: new Date().toISOString()
    };

    const saved = db.bookings.create(booking);

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: saved
    });
  } catch (err: any) {
    return res.status(409).json({
      success: false,
      message: err.message || 'Booking confirmation failed. One or more seats could not be secured.'
    });
  }
}

export function getMyBookings(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized.' });
    }

    const bookings = db.bookings.find((b) => b.userId === req.user!.id);
    return res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user bookings.' });
  }
}

export function getBookingById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const booking = db.bookings.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Only booking owner or admin can view
    if (req.user?.role !== 'admin' && booking.userId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this booking ticket.' });
    }

    return res.json({
      success: true,
      booking
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve ticket.' });
  }
}

export function verifyTicketReference(req: AuthRequest, res: Response) {
  try {
    const { ref } = req.params;
    const booking = db.bookings.findByReference(ref);

    if (!booking) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid booking reference code.'
      });
    }

    return res.json({
      success: true,
      valid: true,
      booking: {
        referenceCode: booking.referenceCode,
        movieTitle: booking.movieTitle,
        cinemaName: booking.cinemaName,
        screenName: booking.screenName,
        showDate: booking.showDate,
        showTime: booking.showTime,
        seats: booking.seatNumbers,
        userName: booking.userName,
        status: booking.bookingStatus,
        totalAmount: booking.totalAmount
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Verification error.' });
  }
}
