import bcrypt, { compare, hash } from 'bcrypt';
import express, { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { OTP, Post, User } from '../../db/db';
import { authenticateJwt, SECRET } from '../../middleware/Auth';
import validate from '../../middleware/validate-middleware';
import { loginSchema, signUpSchema } from '../../validator/auth-Val';
import { gmailPass } from '../Admin/route';

const router = express.Router();

// router.post('/signup',validate(signUpSchema), async (req:Request, res:Response) => {
//   const { username, password } = req.body;
//   try {
//     const user = await User.findOne({ username });
//     if (user) {
//       res.status(403).json({ message: 'User already exists' });
//     } else {
//       const newUser = new User({ username, password });
//       await newUser.save();
//       const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
//       res.json({ message: 'User created successfully', token });
//     }
//   } catch (error) {
//     console.error('Error creating user:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// //========================> Login Route <===================

// let attempts:any = {};

// router.post('/login', async (req: Request, res: Response) => {

//   const { username, password } = req.body;
//   try {
//     const user = await User.findOne({ username, password });
//     if (user) {
//       const token = jwt.sign({ username, role: 'user' }, SECRET, { expiresIn: '1h' });
//       return res.json({ message: 'Logged in successfully', token });
//     } else {
//         attempts[username] = (attempts[username] || 0) + 1;

//       if (attempts[username] > 3) {
//         return res.status(403).json({ message: 'Max Attempts Reached Try in 10 minutes' });

//       }else{
//         return res.status(403).json({ message: 'Invalid username or password' });
//       }
//     }
//   } catch (error) {
//     console.error('Error logging in:', error);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

//=====================================> Encryption Testing <======================
router.post(
  '/signup',
  validate(signUpSchema),
  async (req: Request, res: Response) => {
    const { name, username, password } = req.body;
    try {
      // Check if the user already exists
      const user = await User.findOne({ username });
      if (user) {
        return res.status(403).json({ message: 'User already exists' });
      }

      // // Encrypt the password using bcrypt
      // const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

      //Create a new user with the hashed password
      const newUser = new User({ name, username, password });
      console.log(password);
      await newUser.save();

      // Generate JWT token
      const token = jwt.sign({ username, role: 'user' }, SECRET, {
        expiresIn: '1h',
      });
      return res.json({ message: 'User created successfully', token });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);

// Login Route
let attempts: any = {};

router.post('/login', async (req: Request, res: Response) => {
  const { name, password } = req.body;
  try {
    // Find the user by username
    const user = await User.findOne({ name });
    if (!user) {
      // User not found
      attempts[name] = (attempts[name] || 0) + 1;
      if (attempts[name] > 3) {
        return res
          .status(403)
          .json({ message: 'Max Attempts Reached. Try again in 10 minutes' });
      } else {
        return res
          .status(403)
          .json({ message: 'Invalid username or password' });
      }
    }

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log(passwordMatch);
    if (!passwordMatch) {
      attempts[name] = (attempts[name] || 0) + 1;
      if (attempts[name] > 3) {
        return res
          .status(403)
          .json({ message: 'Max Attempts Reached. Try again in 10 minutes' });
      } else {
        return res
          .status(403)
          .json({ message: 'Invalid username or password' });
      }
    }

    // Password matched, generate JWT token
    const token = jwt.sign({ name, role: 'user' }, SECRET, { expiresIn: '1h' });
    return res.json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Pasword reset Routess

// POST route to send email and generate OTP
router.post('/sendemail', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    // Check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a random OTP (4 digits)
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP into the database (if needed)
    // Save OTP into the database
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 2); // Expiry time is 1 minute from now

    const otpRecord = new OTP({
      username,
      otp,
      expiry,
    });
    await otpRecord.save();

    // Send OTP to the user's email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'test976673@gmail.com', // Your Gmail address
        pass: gmailPass, // Your Gmail password or app-specific password
      },
    });

    // Define email options
    const mailOptions = {
      from: 'test976673@gmail.com',
      to: username, // Assuming username is the email address
      subject: 'OTP for Password Reset',
      text: `Your OTP for password reset is: ${otp}. This OTP is valid for the next 2 minutes.`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send OTP email' });
  }
});

//verify otp route
// POST route to verify OTP
router.post('/verifyotp', async (req, res) => {
  try {
    const { username, otp } = req.body;

    // Check if the OTP and username exist in the database
    const otpRecord = await OTP.findOne({ username, otp });
    if (otpRecord) {
      // Check if OTP has expired
      const now = new Date();
      if (now <= otpRecord.expiry) {
        return res.status(200).json({ message: 'OTP verified successfully' });
      } else {
        return res.status(403).json({ message: 'OTP has expired' });
      }
    } else {
      return res.status(403).json({ message: 'Invalid OTP or username' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// POST route to change password
router.post('/change-pass', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });

    // If user not found, return an error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the password
    console.log(password);

    user.password = password;
    await user.save();
    console.log(password);

    // Return success response
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

//===========================> Get all posts Route <=============
//=================>  proper Authentication is applied on this route <===================

router.get('/posts', authenticateJwt, async (req, res) => {
  const posts = await Post.find({});
  res.json({ posts });
});

// just for testing purpse i have added this create Post route
router.post('/post', async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.json({ message: 'Post created successfully', postId: post.id });
});

export default router;

function middleware() {
  throw new Error('Function not implemented.');
}
