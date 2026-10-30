import { Request, Response } from 'express';
import { db } from '../db/store.js';

export function getMovies(req: Request, res: Response) {
  try {
    const { search, genre, language, status, format } = req.query;

    let movies = db.movies.find();

    if (status && (status === 'now_showing' || status === 'coming_soon')) {
      movies = movies.filter((m) => m.status === status);
    }

    if (genre && genre !== 'All') {
      const gStr = String(genre).toLowerCase();
      movies = movies.filter((m) => m.genres.some((g) => g.toLowerCase() === gStr));
    }

    if (language && language !== 'All') {
      const lStr = String(language).toLowerCase();
      movies = movies.filter((m) => m.language.toLowerCase().includes(lStr));
    }

    if (format && format !== 'All') {
      const fStr = String(format).toLowerCase();
      movies = movies.filter((m) => m.formats.some((f) => f.toLowerCase().includes(fStr)));
    }

    if (search) {
      const q = String(search).trim().toLowerCase();
      movies = movies.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.cast.some((c) => c.toLowerCase().includes(q)) ||
          m.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch movies.' });
  }
}

export function getMovieById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const movie = db.movies.findById(id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    // Also get active cinemas & dates showing this movie
    const shows = db.shows.find((s) => s.movieId === movie.id);
    const cinemaIds = Array.from(new Set(shows.map((s) => s.cinemaId)));
    const cinemas = cinemaIds.map((cId) => db.cinemas.findById(cId)).filter(Boolean);
    const availableDates = Array.from(new Set(shows.map((s) => s.date))).sort();

    return res.json({
      success: true,
      movie,
      availableCinemas: cinemas,
      availableDates
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch movie details.' });
  }
}

export function getFeaturedHero(req: Request, res: Response) {
  try {
    const movies = db.movies.find((m) => m.status === 'now_showing');
    const heroMovie = movies.find((m) => m.id === 'mov_nebula_01') || movies[0];
    return res.json({ success: true, movie: heroMovie });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch featured movie.' });
  }
}
