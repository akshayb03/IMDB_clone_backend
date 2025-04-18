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

    const moviesWithActors = await Promise.all(movies.map(async (movie) => {
      const actorData = await Celebrity.find({
        personality_id: { $in: movie.actors }
      });

      return {
        ...movie._doc,
        actors: actorData
      };
    }));

    res.json(moviesWithActors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const celeb = await Celebrity.findOne({ personality_id: req.params.id });
    if (!celeb) return res.status(404).json({ message: 'Celebrity not found' });

    const movies = await Movie.find({
      movie_id: { $in: celeb.movies },
    });

    res.json({
      ...celeb._doc,
      movies,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
