import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors'; 
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import socketHandler from './socketHandler.js';
import Razorpay from 'razorpay';
import authRoutes from './routes/authRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { preprocessPayment } from './controller/productController.js';
import payment from './routes/paymentRoutes.js';

// Load environment variables
dotenv.config({ path: 'server/config/config.env' });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}))


// Connect to MongoDB (commented out for this example)
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('MongoDB connected...');
//   } catch (error) {
//     console.error('MongoDB connection error:', error.message);
//     process.exit(1);
//   }
// };
// connectDB();

// Razopay Integration


// console.log("process.env.RAZORPAY_API_KEY : ",process.env.RAZORPAY_API_KEY)
// console.log("process.env.RAZORPAY_API_SECRET : ",process.env.RAZORPAY_API_SECRET)
// var instance = new Razorpay({
//   key_id: process.env.RAZORPAY_API_KEY,
//   key_secret: process.env.RAZORPAY_API_SECRET,
  
// });

export var instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});
app.use('/api/razorpay', payment);


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('BLUC API is running');
});
const TURN_TOKEN_ID = 'd7858c9a957d8906c239c613cf60fdff';
const CLOUDFLARE_API_TOKEN = '7f72238791c894558295f71fdf0005716eceef57c3482c07cfbea3357f484c7e';

app.get('/get-ice-servers', async (req, res) => {
  try {
    const response = await axios.post(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${TURN_TOKEN_ID}/credentials/generate-ice-servers`,
      { ttl: 3600 }, // credentials valid for 1 hour
      {
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',

        },
      }
    );
    console.log(response)
    
    res.json(response.data);
  } catch (error) {
    console.error('Failed to get ICE servers:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get ICE servers' });
  }
});


io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);
  socketHandler(io, socket);
});

// // Serve static files in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static('dist'));
  
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../', 'dist', 'index.html'));
//   });
// }

const PORT = process.env.PORT || 3000;
console.log(PORT)
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));