import { Request, Response } from 'express';
import { db } from '../db/store.js';

export function getCinemas(req: Request, res: Response) {
  try {
    const { city } = req.query;
    let cinemas = db.cinemas.find();
    if (city && city !== 'All') {
      cinemas = cinemas.filter((c) => c.city.toLowerCase() === String(city).toLowerCase());
    }

    const cities = Array.from(new Set(db.cinemas.find().map((c) => c.city)));

    return res.json({
      success: true,
      count: cinemas.length,
      cinemas,
      cities
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch cinemas.' });
  }
}

export function getCinemaById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const cinema = db.cinemas.findById(id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found.' });
    }

    const screens = db.screens.find(cinema.id);
    return res.json({
      success: true,
      cinema,
      screens
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch cinema details.' });
  }
}
