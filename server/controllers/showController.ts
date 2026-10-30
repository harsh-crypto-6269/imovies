import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';

export function getShows(req: Request, res: Response) {
  try {
    const { movieId, cinemaId, date } = req.query;

    let shows = db.shows.find();

    if (movieId) {
      shows = shows.filter((s) => s.movieId === String(movieId));
    }
    if (cinemaId) {
      shows = shows.filter((s) => s.cinemaId === String(cinemaId));
    }
    if (date) {
      shows = shows.filter((s) => s.date === String(date));
    }

    // Enrich show with cinema and screen names
    const enriched = shows.map((s) => {
      const cinema = db.cinemas.findById(s.cinemaId);
      const screen = db.screens.findById(s.screenId);
      const movie = db.movies.findById(s.movieId);
      return {
        ...s,
        cinemaName: cinema?.name || 'IMovies Cinema',
        cinemaCity: cinema?.city || '',
        screenName: screen?.screenName || 'Screen 1',
        movieTitle: movie?.title || ''
      };
    });

    return res.json({
      success: true,
      count: enriched.length,
      shows: enriched
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch showtimes.' });
  }
}

export function getShowById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const show = db.shows.findById(id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    const movie = db.movies.findById(show.movieId);
    const cinema = db.cinemas.findById(show.cinemaId);
    const screen = db.screens.findById(show.screenId);

    if (!screen) {
      return res.status(404).json({ success: false, message: 'Cinema screen layout not found.' });
    }

    const now = Date.now();
    // Build seat matrix
    const seatsData: {
      seatId: string;
      row: string;
      number: number;
      category: string;
      price: number;
      status: 'available' | 'selected' | 'booked' | 'held';
      heldByMe?: boolean;
    }[] = [];

    screen.rows.forEach((rowLetter) => {
      // Find category for this row
      const category = screen.categories.find((c) => c.rows.includes(rowLetter)) || screen.categories[screen.categories.length - 1];
      const price = show.pricing.find((p) => p.category === category.name)?.price || category.price;

      for (let num = 1; num <= screen.cols; num++) {
        const seatId = `${rowLetter}${num}`;
        let status: 'available' | 'selected' | 'booked' | 'held' = 'available';
        let heldByMe = false;

        if (show.bookedSeats.includes(seatId)) {
          status = 'booked';
        } else {
          const hold = show.heldSeats.find((h) => h.seatId === seatId && h.expiresAt > now);
          if (hold) {
            status = 'held';
            if (currentUserId && hold.userId === currentUserId) {
              heldByMe = true;
            }
          }
        }

        seatsData.push({
          seatId,
          row: rowLetter,
          number: num,
          category: category.name,
          price,
          status,
          heldByMe
        });
      }
    });

    return res.json({
      success: true,
      show,
      movie,
      cinema,
      screen: {
        id: screen.id,
        screenName: screen.screenName,
        format: screen.format,
        rows: screen.rows,
        cols: screen.cols,
        categories: screen.categories
      },
      seats: seatsData
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch show seats.' });
  }
}
