const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const connectDB = require('./connect');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and Express JSON parsing with 10mb limit for base64 uploads
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mfc',
  api_key: process.env.CLOUDINARY_API_KEY || '123118897662632',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'jCM3M80_iK0hqSkt3yyoGTO1trU'
});

// Database Models
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  venueName: { type: String, required: true },
  image: { type: String, required: true },
  rehearsalImages: [{ type: String }],
  schedule: [
    {
      time: { type: String },
      title: { type: String },
      description: { type: String }
    }
  ],
  pricingTiers: {
    silver: { price: { type: Number, default: 150 }, capacity: { type: Number, default: 200 } },
    gold: { price: { type: Number, default: 250 }, capacity: { type: Number, default: 150 } },
    vip: { price: { type: Number, default: 450 }, capacity: { type: Number, default: 100 } }
  },
  active: { type: Boolean, default: true }
});

const Event = mongoose.model('Event', EventSchema);

const BookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  studentId: { type: String },
  selectedSeats: [
    {
      seatId: { type: String, required: true }, // e.g. "L-VIP-1-2"
      type: { type: String, required: true }, // "VIP", "Gold", "Silver"
      price: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Completed' },
  bookingDate: { type: Date, default: Date.now },
  isCheckedIn: { type: Boolean, default: false },
  checkInDate: { type: Date }
});

const Booking = mongoose.model('Booking', BookingSchema);

// Initial Database Seeding Helper
const seedDatabase = async () => {
  const count = await Event.countDocuments();
  if (count === 0) {
    console.log('Seeding initial luxury fashion shows...');
    const initialEvents = [
      {
        title: 'THE HAUTE ETHER GALA',
        description: 'An evening of transcendent high fashion, sensory exploration, and digital art installations in the heart of the Grand Palais.',
        date: new Date('2026-10-24T20:00:00Z'),
        location: 'Paris, France',
        venueName: 'The Grand Palais Expose',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2zp9mt2s9NMz6BrgnUb3YY0d3kiA9TzIVf4oyRBB2ymI0h5zeo2N5P4xW-knR51jcjeIMPZZNSEIFT0ot4qZWsIRN55IV9IPz5N8DZo6Q4ioSJq3VN4pjnrTmo8vJARrCRXMEucFOSHN71XsjuZLnPcKkezdb0-FJKrhDclMOSVQjYWKyzCTHOV_kWp-bD48iKKRPJj2OyA1Ld7hcgEQBfwVz_EIxKyo2_sAI0bqf6_QT1at8d0AynzxEFd7Ft5kzjRW-Ta1wdFI',
        rehearsalImages: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuApty4F9Xfw23ECdQJ5ZTVMJVLqZkumLZSnPchteKqYAt7kbaw7ncNDFEiTRQCtG1cUSUAz39N6fHh50Iyp3oEUj3Dy3TB1oFcNg1J6tdNP5vG13lq_C73YLcAT62Hqm75Q8F-9Quai63CQVfiaA8Agz8inhwp0Kns_BBhx6BnKd9lUMJBpcfRIITdZoWncSm3ySDmbpq3EcCLnjUC8iSAJhkothu0xcmsWWUojosnMrC9wE02SjPWa4kp4rn9NWzo-PZlCpPQvdAg',
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBvI03WUoPKeNWczJqPulbV4jYx69PyV_6HlXgW63eIHQ2qiNUl7Twag7eS7TZJSpeKH9XaUk2COV5vdxM1Q2vUBvEvdlKCQNQBH-cVy0zRVUzrB2-l5wZgRd87t2g1lP-KQ0r6c7Lk8ecvi4tVI4EWoroomOh0ABy6vVt-dgLEhLu4oejJ-E57rTPxhdpuW2vMviFO3pzxMSpMYTqIG36Q3-s9cS5gB_zkN5thX6XIDxm75lxYUZtU8wV8uORuii-gpQMFNrZorrE'
        ],
        schedule: [
          { time: '19:00', title: 'Atmospheric Red Carpet & Arrival', description: 'Begin the journey with sensory cocktail pairings and editorial photography.' },
          { time: '20:00', title: 'The Haute Ether Runway Presentation', description: 'Unveiling zero-waste couture silhouettes against live digital scenography.' },
          { time: '21:30', title: 'Afterparty & Installation Gallery Tour', description: 'Mingle with designers and experience interactive projection-mapping installations.' }
        ],
        pricingTiers: {
          silver: { price: 150, capacity: 150 },
          gold: { price: 250, capacity: 100 },
          vip: { price: 450, capacity: 50 }
        },
        active: true
      },
      {
        title: 'NOIR COLLECTION SHOWCASE',
        description: 'Emphasizing luxurious textures, avant-garde silhouettes, and a nearly monochromatic dark palette punctuated by iridescent violet reflections.',
        date: new Date('2026-11-12T19:00:00Z'),
        location: 'Milan, Italy',
        venueName: 'Studio B Warehouse',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApty4F9Xfw23ECdQJ5ZTVMJVLqZkumLZSnPchteKqYAt7kbaw7ncNDFEiTRQCtG1cUSUAz39N6fHh50Iyp3oEUj3Dy3TB1oFcNg1J6tdNP5vG13lq_C73YLcAT62Hqm75Q8F-9Quai63CQVfiaA8Agz8inhwp0Kns_BBhx6BnKd9lUMJBpcfRIITdZoWncSm3ySDmbpq3EcCLnjUC8iSAJhkothu0xcmsWWUojosnMrC9wE02SjPWa4kp4rn9NWzo-PZlCpPQvdAg',
        rehearsalImages: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBvI03WUoPKeNWczJqPulbV4jYx69PyV_6HlXgW63eIHQ2qiNUl7Twag7eS7TZJSpeKH9XaUk2COV5vdxM1Q2vUBvEvdlKCQNQBH-cVy0zRVUzrB2-l5wZgRd87t2g1lP-KQ0r6c7Lk8ecvi4tVI4EWoroomOh0ABy6vVt-dgLEhLu4oejJ-E57rTPxhdpuW2vMviFO3pzxMSpMYTqIG36Q3-s9cS5gB_zkN5thX6XIDxm75lxYUZtU8wV8uORuii-gpQMFNrZorrE'
        ],
        schedule: [
          { time: '18:30', title: 'Exclusive VIP Receptions', description: 'Curated networking with front-row members and private collection previews.' },
          { time: '19:30', title: 'Couture Unveiling', description: 'Runway showcase of structures and futuristic fabrics.' },
          { time: '21:00', title: 'Panel Q&A & Designer Toast', description: 'Hear from the creative leads behind this dark-themed capsule.' }
        ],
        pricingTiers: {
          silver: { price: 120, capacity: 180 },
          gold: { price: 220, capacity: 120 },
          vip: { price: 400, capacity: 60 }
        },
        active: true
      },
      {
        title: 'ECO-COUTURE SHOWCASE',
        description: 'Elevating sustainability through absolute luxury. Showcasing organic silks, zero-waste patterns, and botanical digital projection mapping.',
        date: new Date('2026-12-05T19:30:00Z'),
        location: 'London, United Kingdom',
        venueName: 'Espace Vert Canopy',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvI03WUoPKeNWczJqPulbV4jYx69PyV_6HlXgW63eIHQ2qiNUl7Twag7eS7TZJSpeKH9XaUk2COV5vdxM1Q2vUBvEvdlKCQNQBH-cVy0zRVUzrB2-l5wZgRd87t2g1lP-KQ0r6c7Lk8ecvi4tVI4EWoroomOh0ABy6vVt-dgLEhLu4oejJ-E57rTPxhdpuW2vMviFO3pzxMSpMYTqIG36Q3-s9cS5gB_zkN5thX6XIDxm75lxYUZtU8wV8uORuii-gpQMFNrZorrE',
        rehearsalImages: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuA2zp9mt2s9NMz6BrgnUb3YY0d3kiA9TzIVf4oyRBB2ymI0h5zeo2N5P4xW-knR51jcjeIMPZZNSEIFT0ot4qZWsIRN55IV9IPz5N8DZo6Q4ioSJq3VN4pjnrTmo8vJARrCRXMEucFOSHN71XsjuZLnPcKkezdb0-FJKrhDclMOSVQjYWKyzCTHOV_kWp-bD48iKKRPJj2OyA1Ld7hcgEQBfwVz_EIxKyo2_sAI0bqf6_QT1at8d0AynzxEFd7Ft5kzjRW-Ta1wdFI'
        ],
        schedule: [
          { time: '19:00', title: 'Sustainable Cocktail Mixer', description: 'Zero-mile catering and organic pairing.' },
          { time: '20:00', title: 'The Eco Runway Reveal', description: 'Presentation of 24 fully biodegradable haute couture dresses.' },
          { time: '21:15', title: 'Couture Award & Discussion', description: 'Honoring pioneers in sustainable modern fashion designs.' }
        ],
        pricingTiers: {
          silver: { price: 100, capacity: 200 },
          gold: { price: 180, capacity: 100 },
          vip: { price: 350, capacity: 40 }
        },
        active: true
      }
    ];

    await Event.insertMany(initialEvents);
    console.log('Seed events added to database successfully!');
  }
};

// REST API Endpoints

// 1. GET all events
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({ active: true }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET single event detail
app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET occupied seat IDs for an event
app.get('/api/bookings/event/:eventId/occupied-seats', async (req, res) => {
  try {
    const bookings = await Booking.find({ eventId: req.params.eventId });
    const seatIds = bookings.flatMap(b => b.selectedSeats.map(s => s.seatId));
    res.json(seatIds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST submit booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { eventId, fullName, email, phone, studentId, selectedSeats, subtotal, paymentMethod } = req.body;
    
    // Verify booking items exist
    if (!selectedSeats || selectedSeats.length === 0) {
      return res.status(400).json({ message: 'Please select at least one seat.' });
    }

    // Verify seats aren't already booked
    const bookings = await Booking.find({ eventId });
    const takenSeats = bookings.flatMap(b => b.selectedSeats.map(s => s.seatId));
    const doubleBooked = selectedSeats.some(s => takenSeats.includes(s.seatId));
    
    if (doubleBooked) {
      return res.status(400).json({ message: 'One or more selected seats have already been reserved. Please select another seat.' });
    }

    const newBooking = new Booking({
      eventId,
      fullName,
      email,
      phone,
      studentId,
      selectedSeats,
      subtotal,
      paymentMethod,
      paymentStatus: 'Completed' // Mock payment auto-completes
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET single booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('eventId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GET bookings by customer email (History for Dashboard)
app.get('/api/bookings/email/:email', async (req, res) => {
  try {
    const bookings = await Booking.find({ email: req.params.email.toLowerCase() }).populate('eventId').sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. GET Admin Analytics
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const bookings = await Booking.find();
    const eventsCount = await Event.countDocuments({ active: true });
    
    const totalRevenue = bookings.reduce((sum, b) => sum + b.subtotal, 0);
    const ticketsSold = bookings.reduce((sum, b) => sum + b.selectedSeats.length, 0);
    const checkedInCount = bookings.filter(b => b.isCheckedIn).length;
    
    res.json({
      totalRevenue,
      ticketsSold,
      activeEvents: eventsCount,
      checkedInCount,
      totalBookingsCount: bookings.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. PUT check-in a ticket QR
app.put('/api/bookings/:id/check-in', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Ticket not found.' });
    
    booking.isCheckedIn = true;
    booking.checkInDate = new Date();
    await booking.save();
    
    res.json({ message: 'Check-in completed successfully!', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. POST admin create new event (with Cloudinary Base64 Image upload)
app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, location, venueName, pricingTiers, imageBase64, schedule } = req.body;
    
    let imageUrl = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'; // default placeholder

    // If base64 image is uploaded, send it to Cloudinary
    if (imageBase64) {
      console.log('Uploading event header cover to Cloudinary folder (mfc-luxe/events)...');
      const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
        folder: 'mfc-luxe/events',
        resource_type: 'image'
      });
      imageUrl = uploadResponse.secure_url;
      console.log('Uploaded successfully. Secure CDN Link:', imageUrl);
    }

    const newEvent = new Event({
      title,
      description,
      date,
      location,
      venueName,
      pricingTiers: pricingTiers || {
        silver: { price: 100, capacity: 200 },
        gold: { price: 180, capacity: 150 },
        vip: { price: 350, capacity: 80 }
      },
      image: imageUrl,
      rehearsalImages: [],
      schedule: schedule || [
        { time: '19:00', title: 'Opening Reception', description: 'Cocktail pairings and networking.' },
        { time: '20:00', title: 'Main Showcase', description: 'Runway presentation of the designer collection.' }
      ],
      active: true
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to Database and start server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://trungnho0512_db_user:JalOWyM2rbSe0zYa@mfc.k2iaper.mongodb.net/?appName=mfc';
connectDB(MONGODB_URI).then(() => {
  // Seed Database with items if necessary
  seedDatabase().catch(err => console.error('Database seeding failed:', err.message));

  app.listen(PORT, () => {
    console.log(`MFC Luxe Backend Server listening on http://localhost:${PORT}`);
  });
});
