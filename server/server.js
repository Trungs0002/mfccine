const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('./connect');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env');
  process.exit(1);
}

// Enable CORS and Express JSON parsing with 10mb limit for base64 uploads
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Database Models

// 1. User Model
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 2. Settings Model
const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'EVENT TICKETING PRO' },
  contactEmail: { type: String, default: 'support@eventpro.com' }
});

const Settings = mongoose.model('Settings', SettingsSchema);

// 3. Event Model
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
    standard: { price: { type: Number, default: 100 }, capacity: { type: Number, default: 250 } },
    silver: { price: { type: Number, default: 150 }, capacity: { type: Number, default: 200 } },
    gold: { price: { type: Number, default: 250 }, capacity: { type: Number, default: 150 } },
    vip: { price: { type: Number, default: 450 }, capacity: { type: Number, default: 100 } }
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', EventSchema);

// 4. Booking Model
const BookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  studentId: { type: String },
  selectedSeats: [
    {
      seatId: { type: String, required: true },
      type: { type: String, required: true },
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
  // Seed Settings
  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    console.log('Initializing default site settings...');
    await Settings.create({
      siteName: 'MFC FTU TICKETING',
      contactEmail: 'contact@mfc-ftu.com'
    });
  }

  // Seed Admin User
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    console.log('Seeding default admin account...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      fullName: 'System Administrator',
      email: 'admin@mfcluxe.com',
      password: hashedAdminPassword,
      role: 'admin'
    });
  }

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
          standard: { price: 100, capacity: 250 },
          silver: { price: 150, capacity: 150 },
          gold: { price: 250, capacity: 100 },
          vip: { price: 450, capacity: 50 }
        },
        active: true
      }
    ];
    await Event.insertMany(initialEvents);
    console.log('Events seeded.');
  }
};

// REST API Endpoints

// 0. AUTH Endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. SETTINGS Endpoints
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ siteName: 'EVENT PRO' });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { siteName, contactEmail } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    settings.siteName = siteName || settings.siteName;
    settings.contactEmail = contactEmail || settings.contactEmail;
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. EVENTS Endpoints
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({ active: true }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, location, venueName, image, pricingTiers } = req.body;
    let imageUrl = image;
    if (image && image.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(image, { folder: 'mfc_events' });
      imageUrl = uploadRes.secure_url;
    }
    const newEvent = await Event.create({ title, description, date, location, venueName, image: imageUrl, pricingTiers });
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { title, description, date, location, venueName, image, pricingTiers } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    let imageUrl = image;
    if (image && image.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(image, { folder: 'mfc_events' });
      imageUrl = uploadRes.secure_url;
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    event.venueName = venueName || event.venueName;
    event.image = imageUrl || event.image;
    event.pricingTiers = pricingTiers || event.pricingTiers;

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Soft delete by setting active to false
    event.active = false;
    await event.save();
    res.json({ message: 'Event disabled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. BOOKINGS Endpoints
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('eventId').sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    res.status(201).json({ message: 'Booking confirmed', bookingId: booking._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/email/:email', async (req, res) => {
  try {
    const bookings = await Booking.find({ email: req.params.email }).populate('eventId').sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('eventId');
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings/event/:eventId/occupied-seats', async (req, res) => {
  try {
    const bookings = await Booking.find({ eventId: req.params.eventId });
    let occupied = [];
    bookings.forEach(b => {
      b.selectedSeats.forEach(s => occupied.push(s.seatId));
    });
    res.json(occupied);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings/check-in/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Ticket not found' });
    if (booking.isCheckedIn) return res.status(400).json({ error: 'Ticket already checked in' });

    booking.isCheckedIn = true;
    booking.checkInDate = new Date();
    await booking.save();
    res.json({ message: 'Checked in successfully', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id', async (req, res) => {
  try {
    const { fullName, email, phone, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.fullName = fullName || booking.fullName;
    booking.email = email || booking.email;
    booking.phone = phone || booking.phone;
    booking.paymentStatus = paymentStatus || booking.paymentStatus;

    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.deleteOne({ _id: req.params.id });
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. ANALYTICS Endpoints
app.get('/api/analytics', async (req, res) => {
  try {
    const bookings = await Booking.find();
    const totalRevenue = bookings.reduce((sum, b) => sum + b.subtotal, 0);
    const ticketsSold = bookings.reduce((sum, b) => sum + b.selectedSeats.length, 0);
    const activeEvents = await Event.countDocuments({ active: true });
    const checkedInCount = bookings.filter(b => b.isCheckedIn).length;
    res.json({ totalRevenue, ticketsSold, activeEvents, checkedInCount, totalBookingsCount: bookings.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB & Start Server
connectDB(process.env.MONGODB_URI).then(() => {
  seedDatabase().catch(err => console.error('Seeding failed:', err));
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
