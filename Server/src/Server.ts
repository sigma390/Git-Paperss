import * as dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import cors from 'cors';

import mongoose from 'mongoose';
import path from 'path';
import adminRouter from './Routes/Admin/route';
import userRouter from './Routes/Student/user';
import facultyRouter from './Routes/Teacher/route';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/user', userRouter);
app.use('/faculty', facultyRouter);
app.use('/admin', adminRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`staretd on ${port}`);
});

// ================> Connect to MongoDB <======================
const MONGODB_URI = process.env.MONGODB_URI!;

mongoose
  .connect(MONGODB_URI, {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));
