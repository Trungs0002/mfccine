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
app.use(express.json({ limit: '40mb' }));

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
  role: { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 2. Settings Model
const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'EVENT TICKETING PRO' },
  siteTagline: { type: String, default: 'FOREIGN TRADE UNIVERSITY' },
  contactEmail: { type: String, default: 'support@eventpro.com' }
});

const Settings = mongoose.model('Settings', SettingsSchema);

// 3. Event Model (BILINGUAL SCHEMA)
const TierSchema = {
  label: { en: String, vi: String },
  description: { en: String, vi: String },
  price: { type: Number, default: 0 },
  capacity: { type: Number, default: 0 }
};

const EventSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    vi: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    vi: { type: String, required: true }
  },
  date: { type: Date, required: true },
  location: {
    en: { type: String, required: true },
    vi: { type: String, required: true }
  },
  venueName: {
    en: { type: String, required: true },
    vi: { type: String, required: true }
  },
  image: { type: String, required: true },
  schedule: [
    {
      time: { type: String },
      title: { en: String, vi: String },
      description: { en: String, vi: String }
    }
  ],
  pricingTiers: {
    standard: TierSchema,
    premium: TierSchema,
    vip: TierSchema
  },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', EventSchema);

// 4. Booking Model
const BookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticketCode: { type: String, unique: true, sparse: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  selectedSeats: [
    {
      seatId: { type: String, required: true },
      type: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ],
  subtotal: { type: Number, required: true },
  discountCode: { type: String, default: null },
  discountPercent: { type: Number, default: 0 },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Completed' },
  bookingDate: { type: Date, default: Date.now },
  isCheckedIn: { type: Boolean, default: false },
  checkInDate: { type: Date }
});

// 5. Discount Code Model
const DiscountCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  percent: { type: Number, required: true, min: 1, max: 100 },
  maxSeats: { type: Number, default: null, min: 1 }, // total number of seats this code can ever discount, across all bookings combined; null = unlimited
  usedSeats: { type: Number, default: 0, min: 0 }, // running total of seats already discounted by this code
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const DiscountCode = mongoose.model('DiscountCode', DiscountCodeSchema);

// 6. Recruitment Application Model (CTV sign-up form on /recruit)
const RecruitApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  school: { type: String, default: '' },
  department: { type: String, required: true },
  facebook: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  answers: { type: [{ question: String, answer: String }], default: [] }, // each entry keeps the question text alongside the answer
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: String, default: null },
  resolvedAt: { type: Date, default: null },
  notes: {
    type: [{ author: String, message: String, createdAt: { type: Date, default: Date.now } }],
    default: [],
  },
  createdAt: { type: Date, default: Date.now }
});

const RecruitApplication = mongoose.model('RecruitApplication', RecruitApplicationSchema);

// 7. "Nhất" Design Contest Submission Model (images kept as base64 data URIs for now — a simple
// first pass; swap for real object storage later if volume grows).
const NhatSubmissionSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  school: { type: String, default: '' },
  note: { type: String, default: '' },
  designImage: { type: String, required: true },
  outfitPhoto1: { type: String, required: true },
  outfitPhoto2: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const NhatSubmission = mongoose.model('NhatSubmission', NhatSubmissionSchema);

// Generate unique ticket code: MFC-XXXXXXXX
const generateTicketCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'MFC';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const Booking = mongoose.model('Booking', BookingSchema);

// Initial Database Seeding Helper
const seedDatabase = async () => {
  // Seed Settings
  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    await Settings.create({ siteName: 'MFC FTU TICKETING', contactEmail: 'contact@mfc-ftu.com' });
  }

  // Seed Admin User
  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    await User.create({ fullName: 'System Administrator', email: 'admin@mfcluxe.com', password: hashedAdminPassword, role: 'admin' });
  }
};

// REST API Endpoints

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// 0. AUTH
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create a staff account (used from the admin panel — separate from the public /register
// endpoint so a normal sign-up can never self-assign the staff/admin role)
app.post('/api/auth/register-staff', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing required fields.' });
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashedPassword, role: 'staff' });
    res.status(201).json({ id: user._id, fullName: user.fullName, email: user.email, role: user.role });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// List users (e.g. GET /api/users?role=staff)
app.get('/api/users', async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName || !fullName.trim()) return res.status(400).json({ error: 'Full name is required.' });
    const user = await User.findByIdAndUpdate(req.params.id, { fullName: fullName.trim() }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Missing required fields.' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect.' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 1. SETTINGS
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({ siteName: 'EVENT PRO' });
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/settings', async (req, res) => {
  try {
    const { siteName, siteTagline, contactEmail } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    settings.siteName = siteName || settings.siteName;
    settings.siteTagline = siteTagline || settings.siteTagline;
    settings.contactEmail = contactEmail || settings.contactEmail;
    await settings.save();
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. EVENTS
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({ active: true }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/events', async (req, res) => {
  try {
    const { title, description, date, location, venueName, image, pricingTiers, schedule } = req.body;
    let imageUrl = image;
    if (image && image.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(image, { folder: 'mfc_events' });
      imageUrl = uploadRes.secure_url;
    }
    const newEvent = await Event.create({ title, description, date, location, venueName, image: imageUrl, pricingTiers, schedule });
    res.status(201).json(newEvent);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { title, description, date, location, venueName, image, pricingTiers, schedule } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    let imageUrl = image;
    if (image && image.startsWith('data:image')) {
      const uploadRes = await cloudinary.uploader.upload(image, { folder: 'mfc_events' });
      imageUrl = uploadRes.secure_url;
    }
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (location) event.location = location;
    if (venueName) event.venueName = venueName;
    if (imageUrl) event.image = imageUrl;
    if (pricingTiers) event.pricingTiers = pricingTiers;
    if (schedule) event.schedule = schedule;
    await event.save();
    res.json(event);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    event.active = false;
    await event.save();
    res.json({ message: 'Event disabled successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. BOOKINGS
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().populate('eventId').sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { discountCode, subtotal, selectedSeats, ...rest } = req.body;

    // Validate the discount code server-side and recompute the final price from it —
    // never trust an already-discounted total sent by the client.
    let finalSubtotal = subtotal;
    let appliedCode = null;
    let discountPercent = 0;
    if (discountCode) {
      const coupon = await DiscountCode.findOne({ code: discountCode.trim().toUpperCase(), active: true });
      if (!coupon) return res.status(400).json({ error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' });

      // `maxSeats` is a total usage cap shared across every booking that ever applies this code —
      // once `usedSeats` reaches it, the code can no longer be applied at all.
      const remaining = coupon.maxSeats != null ? Math.max(0, coupon.maxSeats - coupon.usedSeats) : Infinity;
      if (remaining <= 0) return res.status(400).json({ error: 'Mã giảm giá đã hết lượt sử dụng.' });

      appliedCode = coupon.code;
      discountPercent = coupon.percent;

      // Discount covers up to the remaining allowance, applied to the highest-priced seats first
      // (so the customer gets the most value from it); any leftover seats in this order pay full price.
      const pricesDesc = [...selectedSeats].map(s => s.price).sort((a, b) => b - a);
      const applyCount = Math.min(remaining, pricesDesc.length);
      const discountBase = pricesDesc.slice(0, applyCount).reduce((sum, p) => sum + p, 0);
      const discountAmount = Math.round(discountBase * (coupon.percent / 100));
      finalSubtotal = subtotal - discountAmount;

      coupon.usedSeats += applyCount;
      await coupon.save();
    }

    // Generate a unique ticket code
    let ticketCode;
    let isUnique = false;
    while (!isUnique) {
      ticketCode = generateTicketCode();
      const existing = await Booking.findOne({ ticketCode });
      if (!existing) isUnique = true;
    }
    const booking = await Booking.create({
      ...rest,
      selectedSeats,
      subtotal: finalSubtotal,
      discountCode: appliedCode,
      discountPercent,
      ticketCode,
    });
    res.status(201).json({ message: 'Booking confirmed', bookingId: booking._id, ticketCode: booking.ticketCode });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/bookings/email/:email', async (req, res) => {
  try {
    const bookings = await Booking.find({ email: req.params.email }).populate('eventId').sort({ bookingDate: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('eventId');
    res.json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/bookings/event/:eventId/occupied-seats', async (req, res) => {
  try {
    const bookings = await Booking.find({ eventId: req.params.eventId });
    let occupied = [];
    bookings.forEach(b => { b.selectedSeats.forEach(s => occupied.push(s.seatId)); });
    res.json(occupied);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bookings/check-in/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let booking;

    // 1. Try matching by ticketCode (primary method for QR scanner)
    booking = await Booking.findOne({ ticketCode: id.toUpperCase() }).populate('eventId');

    // 2. Fallback: try MongoDB ObjectId
    if (!booking && mongoose.Types.ObjectId.isValid(id)) {
      booking = await Booking.findById(id).populate('eventId');
    }

    // 3. Last fallback: search by last 8 characters of ObjectId
    if (!booking) {
      const allBookings = await Booking.find({}).populate('eventId');
      booking = allBookings.find(b => b._id.toString().toUpperCase().endsWith(id.toUpperCase()));
    }

    if (!booking) return res.status(404).json({ error: 'Ticket not found' });

    // Helper to build the compact booking info object
    const buildTicketInfo = (b) => ({
      _id: b._id,
      ticketCode: b.ticketCode,
      fullName: b.fullName,
      email: b.email,
      phone: b.phone,
      selectedSeats: b.selectedSeats,
      subtotal: b.subtotal,
      paymentMethod: b.paymentMethod,
      eventTitle: b.eventId?.title,
      eventDate: b.eventId?.date,
      venueName: b.eventId?.venueName,
      location: b.eventId?.location,
      bookingDate: b.bookingDate,
      isCheckedIn: b.isCheckedIn,
      checkInDate: b.checkInDate,
    });

    // Already checked in — return info but with warning status
    if (booking.isCheckedIn) {
      return res.status(400).json({
        status: 'already_used',
        error: 'Ticket already checked in',
        booking: buildTicketInfo(booking)
      });
    }

    booking.isCheckedIn = true;
    booking.checkInDate = new Date();
    await booking.save();
    res.json({
      status: 'valid',
      message: 'Checked in successfully',
      booking: buildTicketInfo(booking)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
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
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.deleteOne({ _id: req.params.id });
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. DISCOUNT CODES
app.get('/api/coupons', async (req, res) => {
  try {
    const coupons = await DiscountCode.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const { code, percent, maxSeats } = req.body;
    if (!code || !percent) return res.status(400).json({ error: 'Code and percent are required.' });
    const normalizedCode = code.trim().toUpperCase();
    const existing = await DiscountCode.findOne({ code: normalizedCode });
    if (existing) return res.status(400).json({ error: 'Mã này đã tồn tại.' });
    const coupon = await DiscountCode.create({
      code: normalizedCode,
      percent,
      maxSeats: maxSeats ? Number(maxSeats) : null,
    });
    res.status(201).json(coupon);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/coupons/:id', async (req, res) => {
  try {
    const { percent, active, maxSeats } = req.body;
    const coupon = await DiscountCode.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    if (percent !== undefined) coupon.percent = percent;
    if (active !== undefined) coupon.active = active;
    if (maxSeats !== undefined) coupon.maxSeats = maxSeats ? Number(maxSeats) : null;
    await coupon.save();
    res.json(coupon);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/coupons/:id', async (req, res) => {
  try {
    await DiscountCode.deleteOne({ _id: req.params.id });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/coupons/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Vui lòng nhập mã giảm giá.' });
    const coupon = await DiscountCode.findOne({ code: code.trim().toUpperCase(), active: true });
    if (!coupon) return res.status(404).json({ error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' });
    const remaining = coupon.maxSeats != null ? Math.max(0, coupon.maxSeats - coupon.usedSeats) : null;
    if (coupon.maxSeats != null && remaining <= 0) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết lượt sử dụng.' });
    }
    res.json({ code: coupon.code, percent: coupon.percent, maxSeats: coupon.maxSeats, remaining });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. RECRUITMENT APPLICATIONS
app.get('/api/applications', async (req, res) => {
  try {
    const { department } = req.query;
    const filter = department ? { department } : {};
    const applications = await RecruitApplication.find(filter).sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/applications', async (req, res) => {
  try {
    const { name, dob, phone, email, school, department, facebook, portfolio, answers } = req.body;
    if (!name || !dob || !phone || !email || !department) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const application = await RecruitApplication.create({ name, dob, phone, email, school, department, facebook, portfolio, answers });
    res.status(201).json({ message: 'Application submitted', applicationId: application._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/applications/:id', async (req, res) => {
  try {
    await RecruitApplication.deleteOne({ _id: req.params.id });
    res.json({ message: 'Application deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add a staff note to an application (so other staff can see who did what)
app.post('/api/applications/:id/notes', async (req, res) => {
  try {
    const { author, message } = req.body;
    if (!author?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập tên nhân viên và nội dung ghi chú.' });
    }
    const application = await RecruitApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    application.notes.push({ author: author.trim(), message: message.trim() });
    await application.save();
    res.status(201).json(application);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Mark an application as processed, or reopen it
app.put('/api/applications/:id/resolve', async (req, res) => {
  try {
    const { resolved, resolvedBy } = req.body;
    const application = await RecruitApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Application not found' });
    application.resolved = !!resolved;
    application.resolvedBy = resolved ? (resolvedBy || null) : null;
    application.resolvedAt = resolved ? new Date() : null;
    await application.save();
    res.json(application);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// "NHẤT" DESIGN CONTEST SUBMISSIONS
app.get('/api/nhat-submissions', async (req, res) => {
  try {
    const submissions = await NhatSubmission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const isJpegOrPngDataUri = (str) => typeof str === 'string' && /^data:image\/(jpeg|png);base64,/.test(str);

app.post('/api/nhat-submissions', async (req, res) => {
  try {
    const { fullName, email, phone, school, note, designImage, outfitPhoto1, outfitPhoto2 } = req.body;
    if (!fullName || !email || !phone || !designImage || !outfitPhoto1 || !outfitPhoto2) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    if (![designImage, outfitPhoto1, outfitPhoto2].every(isJpegOrPngDataUri)) {
      return res.status(400).json({ error: 'Only JPG, JPEG, or PNG images are accepted.' });
    }
    // Upload original-quality images to Cloudinary instead of embedding base64 in MongoDB
    // (a MongoDB document is capped at 16MB, which 3 full-resolution photos can easily exceed).
    const [designUpload, outfit1Upload, outfit2Upload] = await Promise.all([
      cloudinary.uploader.upload(designImage, { folder: 'nhat_entries' }),
      cloudinary.uploader.upload(outfitPhoto1, { folder: 'nhat_entries' }),
      cloudinary.uploader.upload(outfitPhoto2, { folder: 'nhat_entries' }),
    ]);
    const submission = await NhatSubmission.create({
      fullName, email, phone, school, note,
      designImage: designUpload.secure_url,
      outfitPhoto1: outfit1Upload.secure_url,
      outfitPhoto2: outfit2Upload.secure_url,
    });
    res.status(201).json({ message: 'Submission received', submissionId: submission._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/nhat-submissions/:id', async (req, res) => {
  try {
    await NhatSubmission.deleteOne({ _id: req.params.id });
    res.json({ message: 'Submission deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. ANALYTICS
app.get('/api/analytics', async (req, res) => {
  try {
    const bookings = await Booking.find();
    const totalRevenue = bookings.reduce((sum, b) => sum + b.subtotal, 0);
    const ticketsSold = bookings.reduce((sum, b) => sum + b.selectedSeats.length, 0);
    const activeEvents = await Event.countDocuments({ active: true });
    const checkedInCount = bookings.filter(b => b.isCheckedIn).length;
    res.json({ totalRevenue, ticketsSold, activeEvents, checkedInCount, totalBookingsCount: bookings.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Connect to MongoDB & Start Server
connectDB(process.env.MONGODB_URI).then(() => {
  seedDatabase().catch(err => console.error('Seeding failed:', err));
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
