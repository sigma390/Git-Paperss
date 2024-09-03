import bcrypt from 'bcrypt';
import express, { Request, Response } from 'express';
import fs from 'fs';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import Multer from 'multer';
import nodemailer from 'nodemailer';
import { Admin, Faculty, OTP, Post, User } from '../../db/db';
import { SECRET } from '../../middleware/Auth';
import { authenticateAccess } from '../../middleware/FacultyMiddleware';
import validate from '../../middleware/validate-middleware';
import { signUpSchema } from '../../validator/auth-Val';
const router = express.Router();

// //file Upload Setting up multer
// const multer = Multer({
//   storage: Multer.diskStorage({
//     destination: function (req, file, callback) {
//       callback(null, `${__dirname}/uploads`);
//     },
//     filename: function (req, file, callback) {
//       callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
//     },
//   }),
//   limits: {
//     fileSize: 50 * 1024 * 1024,
//   },
// });
// //authenticate Google
// const authenticateGoogle = () => {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: `${__dirname}/apikeys.json`,
//     scopes: "https://www.googleapis.com/auth/drive",
//   });
//   return auth;
// };
// //upload file to google
// const uploadToGoogleDrive = async (file: any, auth: any) => {
//   const fileMetadata = {
//     name: file.originalname,
//     parents: ["12Thfat1fnDYohfv5wwaSM08pla_zj-zJ"], // Change it according to your desired parent folder id
//   };

//   const media = {
//     mimeType: file.mimetype,
//     body: fs.createReadStream(file.path),
//   };

//   const driveService = google.drive({ version: "v3", auth });

//   try {
//     const response = await driveService.files.create({
//       requestBody: fileMetadata,
//       media: media,
//       fields: "id, webViewLink, webContentLink",
//     });
//     const { id, webViewLink, webContentLink } = response.data;
//     console.log(webViewLink);
//     console.log(webContentLink);
//     return response;
//   } catch (error) {
//     console.error("Error uploading file to Google Drive:", error);
//     throw error;
//   }
// };
// //delete Uploaded file
// const deleteFile = (filePath:any) => {
//   fs.unlink(filePath, () => {
//     console.log("file deleted");
//   });
// };

// //upload File Route
// router.post("/upload", multer.single("file"), async (req: any, res: any, next: any) => {
//   try {
//     if (!req.file) {
//       res.status(400).send("No file uploaded.");
//       return;
//     }
//     const auth = authenticateGoogle();
//     const response = await uploadToGoogleDrive(req.file, auth);
//     // Save file information to MongoDB

//     deleteFile(req.file.path);
//     res.status(200).json({ response });

//   } catch (err) {
//     console.log(err);
// }});

export const gmailPass = process.env.GMAIL_PASS!;

//=====================================> Encryption Testing <======================
router.post('/signup', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    // Check if the user already exists
    const user = await Admin.findOne({ email });
    if (user) {
      return res.status(403).json({ message: 'User already exists' });
    }

    // // Encrypt the password using bcrypt
    // const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    //Create a new user with the hashed password
    const adminCount = await Admin.countDocuments();
    if (adminCount < 4) {
      const newUser = new Admin({ name, email, password });
      console.log(password);
      await newUser.save();
    } else {
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    // Generate JWT token
    const token = jwt.sign({ email, role: 'admin' }, SECRET, {
      expiresIn: '10h',
    });
    return res.json({ message: 'admin User created successfully', token });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login Route
let attempts: any = {};

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    // Find the user by username
    const user = await Admin.findOne({ email });
    if (!user) {
      // User not found
      attempts[email] = (attempts[email] || 0) + 1;
      if (attempts[email] > 3) {
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
      attempts[email] = (attempts[email] || 0) + 1;
      if (attempts[email] > 3) {
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
    const token = jwt.sign({ email, role: 'admin' }, SECRET, {
      expiresIn: '10h',
    });
    return res.json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST route to send email and generate OTP
router.post('/sendemail', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await Admin.findOne({ email });
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
      username: email,
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
      to: email, // Assuming username is the email address
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
    const { email, password } = req.body;

    // Find the user by username
    const user = await Admin.findOne({ email });

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

// Interface for user summary
interface UserSummary {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalAdmins: number;
}

// Route to get the total number of users, students, faculty, and admins
router.get(
  '/users/summary',
  authenticateAccess,
  async (req: Request, res: Response) => {
    try {
      // Fetch total users, students, faculty, and admins from the database

      const totalStudents = await User.countDocuments();
      const totalFaculty = await Faculty.countDocuments({});
      const totalAdmins = await Admin.countDocuments({});
      const totalUsers = totalAdmins + totalFaculty + totalStudents;
      // Create the user summary object
      const userSummary: UserSummary = {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalAdmins,
      };
      console.log(totalAdmins);
      console.log(totalFaculty);

      // Return the user summary object as a JSON response
      res.json(userSummary);
    } catch (error) {
      console.error('Error fetching user summary:', error);
      res.status(500).json({ error: 'Failed to fetch user summary' });
    }
  }
);

export default router;
