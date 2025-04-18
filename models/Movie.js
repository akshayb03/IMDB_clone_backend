import {Schema, model} from 'mongoose';

const MovieSchema = new Schema({
  movie_id: String,
  movie_name: String,
  release_date: Date,
  imdb_rating: Number,
  description: String,
  genre: String,
  duration: Number,
  actors: [String],
  producer: String,
  poster: { type: String },
});

export default model('Movie', MovieSchema);
