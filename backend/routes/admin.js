import express from 'express';
import Movie from '../models/Movie.js';
import Celebrity from '../models/Celebrity.js';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_IMAGE_URL } from '../../utils/constants.js';

const router = express.Router();

router.post('/movies', async (req, res) => {
  try {
    if (!req.body.movie_name || !req.body.actors || !req.body.producer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingMovie = await Movie.findOne({ 
      movie_name: req.body.movie_name.trim() 
    });
    
    if (existingMovie) {
      return res.status(409).json({ 
        error: 'Movie already exists',
        existing_movie_id: existingMovie.movie_id
      });
    }

    const producerName = req.body.producer.name.trim();
    let producer = await Celebrity.findOne({ name: producerName });
    
    if (!producer) {
      producer = new Celebrity({
        name: producerName,
        birthday: req.body.producer.birthday || null,
        death_year: req.body.producer.death_year || "",
        image: req.body.producer.image || DEFAULT_IMAGE_URL
      });
      await producer.save();
    }

    const actorIds = [];
    for (const actorData of req.body.actors) {
      const actorName = actorData.name.trim();
      if (!actorName) continue;

      let actor = await Celebrity.findOne({ name: actorName });
      
      if (!actor) {
        actor = new Celebrity({
          name: actorName,
          birthday: actorData.birthday || null,
          death_year: actorData.death_year || "",
          image: actorData.image || "",
          movies: []
        });
        await actor.save();
      }
      actorIds.push(actor.personality_id);
    }

    const movie = new Movie({
      movie_id: uuidv4(),
      movie_name: req.body.movie_name.trim(),
      release_date: req.body.release_date,
      imdb_rating: req.body.imdb_rating,
      description: req.body.description.trim(),
      genre: req.body.genre.trim(),
      duration: req.body.duration,
      actors: actorIds,
      producer: producer.personality_id,
      poster: req.body.poster.trim()
    });
    await movie.save();

    if (movie.movie_id && !producer.movies.includes(movie.movie_id)) {
      producer.movies.push(movie.movie_id);
      await producer.save();
    }

    await Celebrity.updateMany(
      { personality_id: { $in: actorIds } },
      { $addToSet: { movies: movie.movie_id } }
    );

    res.status(201).json({ 
      success: true,
      movie: {
        ...movie.toObject(),
        producer_name: producer.name,
        actors: await Celebrity.find(
          { personality_id: { $in: actorIds } },
          'name personality_id image'
        )
      }
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
});

export default router;