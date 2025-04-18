import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import movieRoutes from './routes/movies.js';
import celebrityRoutes from './routes/celebrity.js';
import loginRoutes from './routes/login.js' 

dotenv.config();

const app = express();
const port = 8000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    if ('OPTIONS' === req.method) {
      res.send(200);
    }
    else {
      next();
    }
});

app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use('/api/movies', movieRoutes);
app.use('/api/celebrities', celebrityRoutes);
app.use('/api/login', loginRoutes);

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// eslint-disable-next-line no-undef
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
