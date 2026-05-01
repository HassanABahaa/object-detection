import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './DB/connection.js';
import detectRouter from './src/modules/detect/detect.router.js';
import { globalErrorHandling } from './src/utils/errorHandling.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
// Increase payload limit because base64 images can be very large
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database connection
connectDB();

// Routes
app.use('/detect', detectRouter);

app.use((req, res, next) => {
    return res.status(404).json({ message: "In-valid Routing" });
});

// Global Error Handler
app.use(globalErrorHandling);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
