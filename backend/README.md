# Lost & Found — MERN Stack

## Features
- Roles: Admin & User
- Auth: JWT, bcrypt, show/hide password, remember me, forgot password via email
- Lost/Found CRUD with image upload
- Auto-matching algorithm and matches collection
- Admin dashboard with real-time counts
- Search, filter, CSV/PDF export
- Security: helmet, rate-limit, sanitize

## Requirements
- Node 18+
- MongoDB
- npm or yarn

## Setup Backend
1. `cd backend`
2. `cp .env.example .env` and fill values
3. `npm install`
4. `npm run dev`

## Setup Frontend
1. `cd frontend`
2. `npm install`
3. create `.env` with `VITE_API_URL=http://localhost:5000/api`
4. `npm run dev`

## Notes
- Images are saved to `/backend/uploads` for local dev. In production use S3 or other object store.
- Update email SMTP settings in `.env` to enable forgot password emails.

## Architecture Diagram
(see diagram below)


lostitems
const LostItem = require('../models/LostItem');
const { computeMatchScore } = require('../utils/matcher');
const Match = require('../models/Match');
const FoundItem = require('../models/FoundItem');

/**
 * Create a lost item and run matcher against open found items
 */
exports.createLost = async (req, res) => {
  try {
    // images saved by multer in req.files
    const images = (req.files || []).map(f => `/uploads/${f.filename}`);
    const data = { ...req.body, images, reportedBy: req.user._id, dateLost: req.body.dateLost || new Date() };
    const lost = await LostItem.create(data);

    // run matcher: compare to all open found items
    const founds = await FoundItem.find({ status: 'open' });
    for (const f of founds) {
      const score = computeMatchScore(lost, f);
      if (score >= 40) { // threshold to create match record (tuneable)
        await Match.create({ lostItem: lost._id, foundItem: f._id, score });
      }
    }

    res.status(201).json({ lost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLosts = async (req, res) => {
  try {
    // support search and filters via query params
    const { q, category, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (q) filter.$or = [{ title: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }, { location: new RegExp(q, 'i') }];
    if (category) filter.category = category;
    if (status) filter.status = status;

    const items = await LostItem.find(filter).populate('reportedBy', 'username email').skip((page-1)*limit).limit(Number(limit)).sort({ createdAt: -1 });
    const count = await LostItem.countDocuments(filter);
    res.json({ items, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
