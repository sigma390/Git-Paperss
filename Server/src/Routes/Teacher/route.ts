import bcrypt from 'bcrypt';
import express, { Request, Response } from 'express';
import fs from 'fs';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import Multer from 'multer';
import nodemailer from 'nodemailer';
import { Faculty, File, OTP, Post, Scheme } from '../../db/db';
import { SECRET } from '../../middleware/Auth';
import { authenticateAccess } from '../../middleware/FacultyMiddleware';
import validate from '../../middleware/validate-middleware';
import { signUpSchema } from '../../validator/auth-Val';
import { gmailPass } from '../Admin/route';

const router = express.Router();

//file Upload Setting up multer
const multer = Multer({
  storage: Multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, `${__dirname}/uploads`);
    },
    filename: function (req, file, callback) {
      callback(
        null,
        file.fieldname + '_' + Date.now() + '_' + file.originalname
      );
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});
//authenticate Google
const authenticateGoogle = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: process.env.GOOGLE_TYPE,
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
    },
    scopes: 'https://www.googleapis.com/auth/drive',
  });
  return auth;
};
//upload file to google
const uploadToGoogleDrive = async (file: any, auth: any) => {
  const fileMetadata = {
    name: file.originalname,
    parents: ['10tt0fbCLkdefoT7ZwXhG4OtGHr2crKP8'], // Change it according to your desired parent folder id
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const driveService = google.drive({ version: 'v3', auth });

  try {
    const response = await driveService.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });
    const { id, webViewLink, webContentLink } = response.data;
    console.log(webViewLink);
    console.log(webContentLink);
    return response;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw error;
  }
};
//delete Uploaded file
const deleteFile = (filePath: any) => {
  fs.unlink(filePath, () => {
    console.log('file deleted');
  });
};

//upload File Route
router.post(
  '/upload',
  multer.single('file'),
  async (req: any, res: any, next: any) => {
    try {
      if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
      }
      const auth = authenticateGoogle();
      const response = await uploadToGoogleDrive(req.file, auth);
      // Save file information to MongoDB

      // Extract the necessary links from the Google Drive response
      const { id: fileId, webViewLink, webContentLink } = response.data;
      // Extract the scheme field from query parameters

      console.log(req.body.scheme);

      // Create a new instance of the File model
      const newFile = new File({
        title: req.file.originalname,
        scheme: req.body.scheme, // Use the extracted scheme query parameter
        exam: req.body.exam,
        uploadedAt: new Date(),
        uploadedBy: req.body.uploadedBy, // Use the request body to get the uploader information
        viewLink: webViewLink,
        downLoadLink: webContentLink,
        driveId: fileId,
      });

      await newFile.save();
      deleteFile(req.file.path);
      res.status(200).json({ response });
    } catch (err) {
      console.log(err);
    }
  }
);

// delete files onb drive route
// Create a function to delete a file from Google Drive
const deleteFileFromGoogleDrive = async (
  fileId: string,
  auth: any
): Promise<void> => {
  const driveService = google.drive({ version: 'v3', auth });

  try {
    await driveService.files.delete({ fileId });
    console.log(`File with ID ${fileId} deleted from Google Drive`);
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    throw error;
  }
};

// Create a route to handle file deletion
router.delete(
  '/papers/:fileId',
  authenticateAccess,
  async (req: Request, res: Response) => {
    try {
      const fileId = req.params.fileId;
      console.log(fileId);
      const auth = authenticateGoogle();

      // Delete the file from Google Drive
      await deleteFileFromGoogleDrive(fileId, auth);

      // Delete the file information from the MongoDB database
      const fileDeleted = await File.findOneAndDelete({ driveId: fileId });

      if (!fileDeleted) {
        return res.status(404).json({ message: 'File not found in database' });
      }

      // Send a success response
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res
        .status(500)
        .json({ error: 'An error occurred while deleting the file' });
    }
  }
);

// add get paper routes

// // Define a route to handle the GET request for filtering papers by scheme
// router.get('/papers',authenticateAccess, async (req: Request, res: Response) => {
//   try {
//       // Extract the scheme query parameter from the request

//       // Query the MongoDB database for files with the matching scheme
//       const papers = await File.find();

//       // Return the filtered list of papers in the response
//       res.status(200).json(papers);
//   } catch (error) {
//       console.error('Error fetching papers:', error);
//       res.status(500).json({ error: 'An error occurred while fetching papers.' });
//   }
// });

// Define a route to handle the GET request for filtering papers by scheme
router.get(
  '/papers',
  authenticateAccess,
  async (req: Request, res: Response) => {
    try {
      // Extract the scheme query parameter from the request
      const scheme = req.query.scheme as string;
      const exam = req.query.exam as string;
      console.log(scheme);
      console.log(exam);
      // Query the MongoDB database for files with the matching scheme
      const papers = await File.find({ scheme, exam });

      // Return the filtered list of papers in the response
      res.status(200).json(papers);
    } catch (error) {
      console.error('Error fetching papers:', error);
      res
        .status(500)
        .json({ error: 'An error occurred while fetching papers.' });
    }
  }
);

//=====================================> Encryption Testing <======================
router.post('/signup', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    // Check if the user already exists
    const user = await Faculty.findOne({ email });
    if (user) {
      return res.status(403).json({ message: 'User already exists' });
    }

    // // Encrypt the password using bcrypt
    // const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    //Create a new user with the hashed password
    const newUser = new Faculty({ name, email, password });
    console.log(password);
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ email, role: 'faculty' }, SECRET, {
      expiresIn: '5h',
    });
    return res.json({ message: 'User created successfully', token });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login Route
let attempts: any = {};

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email);
  try {
    // Find the user by username
    const user = await Faculty.findOne({ email });
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
    const token = jwt.sign({ email, role: 'faculty' }, SECRET, {
      expiresIn: '5h',
    });
    return res.json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/scheme', async (req: Request, res: Response) => {
  try {
    const schemes = await Scheme.find();
    res.json(schemes);
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
//
router.post(
  '/scheme',
  authenticateAccess,
  async (req: Request, res: Response) => {
    try {
      const { title, description } = req.body;
      const existingScheme = await Scheme.findOne({ title });

      if (existingScheme) {
        return res.status(400).json({ message: 'Scheme already exists' });
      }

      const newScheme = new Scheme({ title, description });
      await newScheme.save();

      res
        .status(201)
        .json({ message: 'Scheme created successfully', scheme: newScheme });
    } catch (error) {
      console.error('Error creating scheme:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

// Pasword reset Routess

// POST route to send email and generate OTP
router.post('/sendemail', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if the user exists
    const user = await Faculty.findOne({ email });
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
    const user = await Faculty.findOne({ email });

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

//file upload route

// Define the route to handle storing file information
router.post('/file', async (req: Request, res: Response) => {
  try {
    const { title, courseCode, uploadedBy } = req.body;

    // Create a new file document with the provided information
    const newFile = new File({
      title,
      courseCode,
      uploadedBy,
      uploadedAt: new Date(), // Set the current date and time as the uploadedAt value
    });

    // Save the new file document to the database
    await newFile.save();

    // Send a success response with the newly created file document
    res.status(201).json(newFile);
  } catch (error) {
    console.error('Error storing file information:', error);
    // Send an error response if something goes wrong
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
