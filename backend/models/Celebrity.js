import {Schema, model} from 'mongoose';
import { v4 as uuidv4 } from 'uuid';


const CelebritySchema = new Schema({
  personality_id: {
    type: String,
    required: true,
    default: () => uuidv4() 
  },
  name: String,
  birthday: Date,
  movies: [String], 
  death_year: {
    type: String,
    default: ""
  },
  image: String
}, {
  versionKey: false
});

export default model('Celebrity', CelebritySchema);
