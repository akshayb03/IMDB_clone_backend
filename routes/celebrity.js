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

router.patch('/:id', async (req, res) => {
  try {
    const actorId = req.params.id;
    const updates = req.body;

    if (updates.birthday) {
      updates.birthday = new Date(updates.birthday);
    }

    const updatedActor = await Celebrity.findOneAndUpdate(
      { personality_id: actorId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedActor) {
      return res.status(404).json({ message: 'Actor not found' });
    }

    res.json({
      success: true,
      message: 'Actor updated successfully',
      actor: updatedActor
    });
  } catch (err) {
    console.error('Error updating actor:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
});

export default router;
