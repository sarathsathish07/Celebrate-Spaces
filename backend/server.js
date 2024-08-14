import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import hotelierRoutes from './routes/hotelierRoutes.js';
import cookieParser from 'cookie-parser';
import http from 'http';
import configureSocket from './config/socket.js';

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('backend/public'));

app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hotels', hotelierRoutes);

app.get('/', (req, res) => res.send('Server is ready'));

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);

const io = configureSocket(server); 

app.set('io', io);

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
