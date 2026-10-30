import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { IUser, IMovie, ICinema, IScreen, IShow, IBooking, IPayment } from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'imovies_store.json');

export interface IStoreData {
  users: IUser[];
  movies: IMovie[];
  cinemas: ICinema[];
  screens: IScreen[];
  shows: IShow[];
  bookings: IBooking[];
  payments: IPayment[];
}

// In-memory cache synchronized with JSON storage
let store: IStoreData = {
  users: [],
  movies: [],
  cinemas: [],
  screens: [],
  shows: [],
  bookings: [],
  payments: []
};

// Seed initial data if empty
async function initStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      store = JSON.parse(raw);
      // Clean up any stale expired holds on load
      cleanupExpiredHolds();
      return;
    } catch (e) {
      console.warn('Could not parse existing database file, reseeding initial data.', e);
    }
  }

  // Generate seed data
  await seedDefaultData();
  saveStore();
}

export function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save data store:', err);
  }
}

// Expire holds older than timestamp
export function cleanupExpiredHolds() {
  const now = Date.now();
  let changed = false;
  store.shows.forEach((show) => {
    if (show.heldSeats && show.heldSeats.length > 0) {
      const active = show.heldSeats.filter((h) => h.expiresAt > now);
      if (active.length !== show.heldSeats.length) {
        show.heldSeats = active;
        changed = true;
      }
    }
  });
  if (changed) {
    saveStore();
  }
}

async function seedDefaultData() {
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const users: IUser[] = [
    {
      id: 'usr_admin_001',
      name: 'Harsh Ranawat (Admin)',
      email: 'admin@imovies.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+91 98765 43210',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'usr_demo_002',
      name: 'Aditya Lodhi',
      email: 'user@imovies.com',
      passwordHash: userPasswordHash,
      role: 'user',
      phone: '+91 98111 22334',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const movies: IMovie[] = [
    {
      id: 'mov_nebula_01',
      title: 'Nebula Protocol: Infinite Reach',
      description: 'When humanity uncovers an ancient celestial transmission at the edge of the Kuiper belt, commander Elara Vance leads an intrepid crew into a cosmic vortex where spacetime and human memories bend.',
      poster: '/src/assets/images/poster_sci_fi_odyssey_1793329366806.jpg',
      backdrop: '/src/assets/images/hero_cinematic_movie_1793329365739.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
      genres: ['Sci-Fi', 'Adventure', 'Mystery'],
      language: 'English',
      durationMinutes: 164,
      releaseDate: '2026-03-14',
      status: 'now_showing',
      rating: 9.2,
      certification: 'UA 16+',
      director: 'Christopher Nolan & Denis Villeneuve',
      cast: ['Elara Vance', 'Cassian Blake', 'Aris Thorne', 'Devon Ross'],
      formats: ['IMAX 3D', 'Dolby Atmos', '4DX', '2D']
    },
    {
      id: 'mov_shadow_02',
      title: 'Shadow of the Shogun: Crimson Moon',
      description: 'In 16th century feudal Kyoto, a disgraced samurai must rally fragmented clans to defend an emperor against an occult army rising from the sacred mountains under a blood moon.',
      poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      backdrop: '/src/assets/images/cinema_luxury_hall_1793329367952.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=wayt0f_8o18',
      genres: ['Action', 'Historical', 'Drama'],
      language: 'Japanese / Hindi / English',
      durationMinutes: 148,
      releaseDate: '2026-02-28',
      status: 'now_showing',
      rating: 8.9,
      certification: 'UA',
      director: 'Kenji Mizoguchi Jr.',
      cast: ['Hiroyuki Sanada', 'Anna Sawai', 'Tadanobu Asano', 'Ken Watanabe'],
      formats: ['IMAX', 'Dolby Atmos', '2D']
    },
    {
      id: 'mov_noir_03',
      title: 'Midnight Mirage: Neon Chronicles',
      description: 'A rain-slicked cyberpunk thriller following detective Kaelen Kane through the subterranean synth-clubs of Neo-Mumbai, untangling a corporate conspiracy of digital immortality.',
      poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      backdrop: '/src/assets/images/hero_cinematic_movie_1793329365739.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=g4Hbz2jLxvQ',
      genres: ['Action', 'Thriller', 'Sci-Fi'],
      language: 'English / Hindi',
      durationMinutes: 138,
      releaseDate: '2026-03-01',
      status: 'now_showing',
      rating: 8.7,
      certification: 'A',
      director: 'Nicolas Winding Refn',
      cast: ['Ryan Gosling', 'Ana de Armas', 'Vikram Massey', 'Jessica Chastain'],
      formats: ['IMAX 2D', '4DX', 'Dolby Atmos']
    },
    {
      id: 'mov_gladiator_04',
      title: 'Gladiator: Rise of the Colosseum',
      description: 'Decades after the sacrifice of Maximus, a young gladiator rises from the sands of North Africa to challenge the Roman senate and rekindle the light of freedom in the heart of Rome.',
      poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
      backdrop: '/src/assets/images/cinema_luxury_hall_1793329367952.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
      genres: ['Action', 'Drama', 'Adventure'],
      language: 'English',
      durationMinutes: 155,
      releaseDate: '2026-01-20',
      status: 'now_showing',
      rating: 8.6,
      certification: 'UA 16+',
      director: 'Ridley Scott',
      cast: ['Paul Mescal', 'Denzel Washington', 'Pedro Pascal', 'Connie Nielsen'],
      formats: ['IMAX', 'Dolby Atmos', '2D']
    },
    {
      id: 'mov_horizon_05',
      title: 'Quantum Convergence: Earth 2088',
      description: 'Parallel dimensions begin to collapse upon one another as quantum researchers discover an alternate Earth on an irreversible collision path. The countdown for human survival begins.',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      backdrop: '/src/assets/images/hero_cinematic_movie_1793329365739.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      genres: ['Sci-Fi', 'Thriller'],
      language: 'English',
      durationMinutes: 142,
      releaseDate: '2026-04-18',
      status: 'coming_soon',
      rating: 9.0,
      certification: 'UA',
      director: 'Alfonso Cuarón',
      cast: ['Sandra Bullock', 'George Clooney', 'Daniel Kaluuya', 'Florence Pugh'],
      formats: ['IMAX 3D', 'Dolby Atmos']
    },
    {
      id: 'mov_aurora_06',
      title: 'Echoes of the Arctic Crown',
      description: 'An atmospheric exploration epic following an expedition team tracking ancient sub-glacial ruins beneath the Greenland ice sheet that hold the key to Earth’s magnetic stabilization.',
      poster: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&auto=format&fit=crop&q=80',
      backdrop: '/src/assets/images/cinema_luxury_hall_1793329367952.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
      genres: ['Adventure', 'Mystery', 'Drama'],
      language: 'English / Hindi',
      durationMinutes: 130,
      releaseDate: '2026-05-02',
      status: 'coming_soon',
      rating: 8.8,
      certification: 'UA',
      director: 'James Cameron',
      cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
      formats: ['IMAX 3D', '4DX']
    }
  ];

  const cinemas: ICinema[] = [
    {
      id: 'cin_mumbai_01',
      name: 'IMovies Grand IMAX & Luxe',
      address: 'Level 4, Phoenix Palladium, High Street Phoenix, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      contactPhone: '+91 22 4987 1100',
      amenities: ['IMAX Laser 4K', 'Dolby Atmos 64-Channel', 'VIP Recliner Lounge', 'Gourmet Dining', 'Valet Parking']
    },
    {
      id: 'cin_delhi_02',
      name: 'IMovies Royale & Dolby Cinema',
      address: 'Select CITYWALK Mall, A-3 District Centre, Saket',
      city: 'Delhi NCR',
      state: 'Delhi',
      contactPhone: '+91 11 4123 7890',
      amenities: ['Dolby Cinema Vision', 'Ultra Plush Recliners', 'At-Seat Butler Service', 'Wheelchair Access']
    },
    {
      id: 'cin_blr_03',
      name: 'IMovies Cinepolis IMAX',
      address: 'Forum South Bangalore, Konanakunte Cross, Kanakapura Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      contactPhone: '+91 80 6789 2211',
      amenities: ['4DX Dynamic Motion', 'Dual Laser 3D', 'Starbucks Onsite', 'Infrared Audio Assist']
    },
    {
      id: 'cin_hyd_04',
      name: 'IMovies Grand Multiplex',
      address: 'Inorbit Mall, Hitech City, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      contactPhone: '+91 40 4455 6677',
      amenities: ['Laser Projection', 'Dolby 7.1 Surround', 'Artisan Popcorn Bar', 'Contactless QR Kiosks']
    }
  ];

  const screens: IScreen[] = [
    {
      id: 'scr_mum_imax',
      cinemaId: 'cin_mumbai_01',
      screenName: 'Audi 1 - IMAX with Laser',
      format: 'IMAX 3D',
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      cols: 12,
      categories: [
        { name: 'Recliner', price: 480, rows: ['A'] },
        { name: 'Premium', price: 340, rows: ['B', 'C', 'D'] },
        { name: 'Standard', price: 220, rows: ['E', 'F', 'G', 'H'] }
      ]
    },
    {
      id: 'scr_mum_atmos',
      cinemaId: 'cin_mumbai_01',
      screenName: 'Audi 2 - Dolby Atmos Luxe',
      format: 'Dolby Atmos',
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      cols: 10,
      categories: [
        { name: 'Recliner', price: 420, rows: ['A'] },
        { name: 'Premium', price: 300, rows: ['B', 'C'] },
        { name: 'Standard', price: 190, rows: ['D', 'E', 'F', 'G'] }
      ]
    },
    {
      id: 'scr_del_royale',
      cinemaId: 'cin_delhi_02',
      screenName: 'Audi 1 - Grand Royale',
      format: 'Dolby Atmos',
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      cols: 12,
      categories: [
        { name: 'Recliner', price: 500, rows: ['A'] },
        { name: 'Premium', price: 350, rows: ['B', 'C', 'D'] },
        { name: 'Standard', price: 230, rows: ['E', 'F', 'G', 'H'] }
      ]
    },
    {
      id: 'scr_blr_imax',
      cinemaId: 'cin_blr_03',
      screenName: 'Screen 1 - Dual Laser IMAX',
      format: 'IMAX 3D',
      rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      cols: 12,
      categories: [
        { name: 'Recliner', price: 450, rows: ['A'] },
        { name: 'Premium', price: 320, rows: ['B', 'C', 'D'] },
        { name: 'Standard', price: 210, rows: ['E', 'F', 'G', 'H'] }
      ]
    },
    {
      id: 'scr_hyd_01',
      cinemaId: 'cin_hyd_04',
      screenName: 'Audi 1 - 4DX Dynamic',
      format: '4DX',
      rows: ['A', 'B', 'C', 'D', 'E', 'F'],
      cols: 10,
      categories: [
        { name: 'Recliner', price: 420, rows: ['A'] },
        { name: 'Premium', price: 310, rows: ['B', 'C'] },
        { name: 'Standard', price: 200, rows: ['D', 'E', 'F'] }
      ]
    }
  ];

  // Helper for generating dates: today, tomorrow, day after tomorrow
  const getDates = () => {
    const dates: string[] = [];
    const base = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const dates = getDates();
  const times = ['10:15 AM', '01:30 PM', '04:45 PM', '08:00 PM', '10:45 PM'];
  const shows: IShow[] = [];

  let showCounter = 1;
  // Generate shows for active movies across dates and cinemas
  const activeMovies = movies.filter((m) => m.status === 'now_showing');

  for (const date of dates) {
    for (const cin of cinemas) {
      const cinemaScreens = screens.filter((s) => s.cinemaId === cin.id);
      for (const scr of cinemaScreens) {
        // Assign 2 movies per screen across time slots
        times.forEach((time, idx) => {
          const mov = activeMovies[(showCounter + idx) % activeMovies.length];
          // Pre-book some seats to showcase live occupied seats
          const bookedSeats: string[] = [];
          if (idx % 2 === 0) {
            bookedSeats.push('C4', 'C5', 'D6', 'D7', 'A2');
          } else {
            bookedSeats.push('B3', 'B4', 'F8', 'F9');
          }

          shows.push({
            id: `show_${showCounter++}`,
            movieId: mov.id,
            cinemaId: cin.id,
            screenId: scr.id,
            date,
            startTime: time,
            format: scr.format,
            language: mov.language.split('/')[0].trim(),
            pricing: scr.categories.map((c) => ({ category: c.name, price: c.price })),
            bookedSeats,
            heldSeats: []
          });
        });
      }
    }
  }

  // Pre-seed a sample completed booking for regular user
  const sampleShow = shows[0];
  const sampleMovie = movies[0];
  const sampleCinema = cinemas[0];
  const sampleBooking: IBooking = {
    id: 'bkg_seed_001',
    referenceCode: 'IMV-2026-X8890K',
    userId: 'usr_demo_002',
    userEmail: 'user@imovies.com',
    userName: 'Aditya Lodhi',
    showId: sampleShow.id,
    movieId: sampleMovie.id,
    movieTitle: sampleMovie.title,
    moviePoster: sampleMovie.poster,
    cinemaId: sampleCinema.id,
    cinemaName: sampleCinema.name,
    screenName: 'Audi 1 - IMAX with Laser',
    showDate: sampleShow.date,
    showTime: sampleShow.startTime,
    seatNumbers: ['C4', 'C5'],
    seatDetails: [
      { seatId: 'C4', category: 'Premium', price: 340 },
      { seatId: 'C5', category: 'Premium', price: 340 }
    ],
    ticketQuantity: 2,
    subtotal: 680,
    taxAmount: 122.4,
    totalAmount: 802.4,
    bookingStatus: 'confirmed',
    paymentId: 'pay_sim_seed_101',
    paymentMethod: 'UPI / Razorpay Test',
    qrPayload: 'IMOVIES-VERIFIED:IMV-2026-X8890K:usr_demo_002:C4,C5',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  };

  const samplePayment: IPayment = {
    id: 'pay_sim_seed_101',
    bookingReference: 'IMV-2026-X8890K',
    orderId: 'order_seed_001',
    transactionId: 'txn_rzp_mock_9921',
    amount: 802.4,
    currency: 'INR',
    status: 'success',
    method: 'Razorpay UPI (Test)',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  };

  store = {
    users,
    movies,
    cinemas,
    screens,
    shows,
    bookings: [sampleBooking],
    payments: [samplePayment]
  };
}

// Initialize on module load
initStore().catch(console.error);

export const db = {
  users: {
    find: () => store.users,
    findById: (id: string) => store.users.find((u) => u.id === id),
    findByEmail: (email: string) => store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    create: (user: IUser) => {
      store.users.push(user);
      saveStore();
      return user;
    },
    update: (id: string, updates: Partial<IUser>) => {
      const idx = store.users.findIndex((u) => u.id === id);
      if (idx !== -1) {
        store.users[idx] = { ...store.users[idx], ...updates, updatedAt: new Date().toISOString() };
        saveStore();
        return store.users[idx];
      }
      return null;
    }
  },
  movies: {
    find: (filter?: (m: IMovie) => boolean) => (filter ? store.movies.filter(filter) : store.movies),
    findById: (id: string) => store.movies.find((m) => m.id === id),
    create: (movie: IMovie) => {
      store.movies.push(movie);
      saveStore();
      return movie;
    },
    update: (id: string, updates: Partial<IMovie>) => {
      const idx = store.movies.findIndex((m) => m.id === id);
      if (idx !== -1) {
        store.movies[idx] = { ...store.movies[idx], ...updates };
        saveStore();
        return store.movies[idx];
      }
      return null;
    },
    delete: (id: string) => {
      const initial = store.movies.length;
      store.movies = store.movies.filter((m) => m.id !== id);
      if (store.movies.length !== initial) {
        saveStore();
        return true;
      }
      return false;
    }
  },
  cinemas: {
    find: () => store.cinemas,
    findById: (id: string) => store.cinemas.find((c) => c.id === id),
    create: (cinema: ICinema) => {
      store.cinemas.push(cinema);
      saveStore();
      return cinema;
    }
  },
  screens: {
    find: (cinemaId?: string) => (cinemaId ? store.screens.filter((s) => s.cinemaId === cinemaId) : store.screens),
    findById: (id: string) => store.screens.find((s) => s.id === id),
    create: (screen: IScreen) => {
      store.screens.push(screen);
      saveStore();
      return screen;
    }
  },
  shows: {
    find: (filter?: (s: IShow) => boolean) => {
      cleanupExpiredHolds();
      return filter ? store.shows.filter(filter) : store.shows;
    },
    findById: (id: string) => {
      cleanupExpiredHolds();
      return store.shows.find((s) => s.id === id);
    },
    create: (show: IShow) => {
      store.shows.push(show);
      saveStore();
      return show;
    },
    // Atomic seat hold
    holdSeats: (showId: string, seatIds: string[], userId: string, holdDurationMs = 10 * 60 * 1000) => {
      cleanupExpiredHolds();
      const show = store.shows.find((s) => s.id === showId);
      if (!show) throw new Error('Showtime not found');

      const now = Date.now();
      const expiresAt = now + holdDurationMs;

      // Check if any seat is already permanently booked
      for (const seatId of seatIds) {
        if (show.bookedSeats.includes(seatId)) {
          throw new Error(`Seat ${seatId} is already booked by another patron.`);
        }
      }

      // Check if any seat is held by someone else
      for (const seatId of seatIds) {
        const existingHold = show.heldSeats.find((h) => h.seatId === seatId && h.expiresAt > now);
        if (existingHold && existingHold.userId !== userId) {
          throw new Error(`Seat ${seatId} is currently reserved by another patron.`);
        }
      }

      // Remove existing holds by this user on these seats or re-apply
      show.heldSeats = show.heldSeats.filter((h) => !seatIds.includes(h.seatId));
      for (const seatId of seatIds) {
        show.heldSeats.push({ seatId, userId, expiresAt });
      }

      saveStore();
      return { success: true, expiresAt };
    },
    // Release held seats
    releaseSeats: (showId: string, seatIds: string[], userId: string) => {
      const show = store.shows.find((s) => s.id === showId);
      if (show) {
        show.heldSeats = show.heldSeats.filter((h) => !(seatIds.includes(h.seatId) && h.userId === userId));
        saveStore();
      }
    },
    // Confirm seats into bookedSeats
    confirmBooking: (showId: string, seatIds: string[], userId: string) => {
      cleanupExpiredHolds();
      const show = store.shows.find((s) => s.id === showId);
      if (!show) throw new Error('Showtime not found');

      // Verify seats are not already booked
      for (const seatId of seatIds) {
        if (show.bookedSeats.includes(seatId)) {
          throw new Error(`Seat ${seatId} was already booked.`);
        }
      }

      // Add to bookedSeats
      show.bookedSeats.push(...seatIds);
      // Remove from heldSeats
      show.heldSeats = show.heldSeats.filter((h) => !seatIds.includes(h.seatId));

      saveStore();
      return true;
    }
  },
  bookings: {
    find: (filter?: (b: IBooking) => boolean) => (filter ? store.bookings.filter(filter) : store.bookings),
    findById: (id: string) => store.bookings.find((b) => b.id === id),
    findByReference: (ref: string) => store.bookings.find((b) => b.referenceCode.toUpperCase() === ref.toUpperCase()),
    create: (booking: IBooking) => {
      store.bookings.unshift(booking);
      saveStore();
      return booking;
    },
    update: (id: string, updates: Partial<IBooking>) => {
      const idx = store.bookings.findIndex((b) => b.id === id);
      if (idx !== -1) {
        store.bookings[idx] = { ...store.bookings[idx], ...updates };
        saveStore();
        return store.bookings[idx];
      }
      return null;
    }
  },
  payments: {
    find: () => store.payments,
    findById: (id: string) => store.payments.find((p) => p.id === id),
    create: (payment: IPayment) => {
      store.payments.push(payment);
      saveStore();
      return payment;
    }
  },
  resetToDefaults: async () => {
    await seedDefaultData();
    saveStore();
  }
};
