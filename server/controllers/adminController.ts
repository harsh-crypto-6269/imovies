import { Response } from 'express';
import { db } from '../db/store.js';
import { AuthRequest } from '../middleware/auth.js';
import { IMovie, IShow, ICinema, IScreen } from '../db/types.js';

export function getAdminStats(req: AuthRequest, res: Response) {
  try {
    const movies = db.movies.find();
    const cinemas = db.cinemas.find();
    const shows = db.shows.find();
    const bookings = db.bookings.find();
    const users = db.users.find();

    const totalRevenue = bookings
      .filter((b) => b.bookingStatus === 'confirmed')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const totalTicketsSold = bookings
      .filter((b) => b.bookingStatus === 'confirmed')
      .reduce((sum, b) => sum + b.ticketQuantity, 0);

    // Recent 10 bookings
    const recentBookings = bookings.slice(0, 10);

    return res.json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalBookings: bookings.length,
        totalTicketsSold,
        moviesCount: movies.length,
        cinemasCount: cinemas.length,
        showsCount: shows.length,
        usersCount: users.length,
        recentBookings
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
}

// Movies CRUD
export function createMovie(req: AuthRequest, res: Response) {
  try {
    const {
      title,
      description,
      poster,
      backdrop,
      trailerUrl,
      genres,
      language,
      durationMinutes,
      releaseDate,
      status,
      rating,
      certification,
      director,
      cast,
      formats
    } = req.body;

    if (!title || !description || !poster) {
      return res.status(400).json({ success: false, message: 'Title, description, and poster URL are required.' });
    }

    const newMovie: IMovie = {
      id: `mov_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      poster: poster.trim(),
      backdrop: backdrop ? backdrop.trim() : poster.trim(),
      trailerUrl: trailerUrl ? trailerUrl.trim() : 'https://www.youtube.com',
      genres: Array.isArray(genres) ? genres : [genres || 'Action'],
      language: language || 'English',
      durationMinutes: Number(durationMinutes) || 120,
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      status: status === 'coming_soon' ? 'coming_soon' : 'now_showing',
      rating: Number(rating) || 8.5,
      certification: certification || 'UA',
      director: director || 'Director Name',
      cast: Array.isArray(cast) ? cast : [cast || 'Lead Cast'],
      formats: Array.isArray(formats) ? formats : ['2D', 'Dolby Atmos']
    };

    const created = db.movies.create(newMovie);
    return res.status(201).json({ success: true, message: 'Movie created successfully.', movie: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create movie.' });
  }
}

export function updateMovie(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const updated = db.movies.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    return res.json({ success: true, message: 'Movie updated successfully.', movie: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update movie.' });
  }
}

export function deleteMovie(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const deleted = db.movies.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }
    return res.json({ success: true, message: 'Movie deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete movie.' });
  }
}

// Show creation
export function createShow(req: AuthRequest, res: Response) {
  try {
    const { movieId, cinemaId, screenId, date, startTime, format, language, pricing } = req.body;

    if (!movieId || !cinemaId || !screenId || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'Movie, cinema, screen, date, and start time are required.' });
    }

    const screen = db.screens.findById(screenId);
    const movie = db.movies.findById(movieId);

    const newShow: IShow = {
      id: `show_${Date.now()}`,
      movieId,
      cinemaId,
      screenId,
      date,
      startTime,
      format: format || screen?.format || '2D',
      language: language || movie?.language || 'English',
      pricing: pricing || [
        { category: 'Recliner', price: 450 },
        { category: 'Premium', price: 320 },
        { category: 'Standard', price: 200 }
      ],
      bookedSeats: [],
      heldSeats: []
    };

    const created = db.shows.create(newShow);
    return res.status(201).json({ success: true, message: 'Showtime scheduled successfully.', show: created });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to schedule show.' });
  }
}

// All Bookings
export function getAllBookings(req: AuthRequest, res: Response) {
  try {
    const { search } = req.query;
    let bookings = db.bookings.find();

    if (search) {
      const q = String(search).toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.referenceCode.toLowerCase().includes(q) ||
          b.userEmail.toLowerCase().includes(q) ||
          b.userName.toLowerCase().includes(q) ||
          b.movieTitle.toLowerCase().includes(q) ||
          b.cinemaName.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: bookings.length, bookings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
}

// Reset store to default demo state
export async function resetDatabase(req: AuthRequest, res: Response) {
  try {
    await db.resetToDefaults();
    return res.json({ success: true, message: 'Database reset to default demo seed data.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to reset database.' });
  }
}
