import express from 'express';
import Movie from '../models/Movie.js';
import Celebrity from '../models/Celebrity.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  try {
    const movies = await Movie.find().skip(skip).limit(limit);
    res.json(movies)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findOne({ movie_id: req.params.id });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const actors = await Celebrity.find({
      personality_id: { $in: movie.actors },
    });

    res.json({
      ...movie._doc,
      actors,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
