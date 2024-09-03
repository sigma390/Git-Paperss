"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gmailPass = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const db_1 = require("../../db/db");
const Auth_1 = require("../../middleware/Auth");
const FacultyMiddleware_1 = require("../../middleware/FacultyMiddleware");
const router = express_1.default.Router();
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
exports.gmailPass = process.env.GMAIL_PASS;
//=====================================> Encryption Testing <======================
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        // Check if the user already exists
        const user = yield db_1.Admin.findOne({ email });
        if (user) {
            return res.status(403).json({ message: 'User already exists' });
        }
        // // Encrypt the password using bcrypt
        // const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
        //Create a new user with the hashed password
        const adminCount = yield db_1.Admin.countDocuments();
        if (adminCount < 4) {
            const newUser = new db_1.Admin({ name, email, password });
            console.log(password);
            yield newUser.save();
        }
        else {
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ email, role: 'admin' }, Auth_1.SECRET, {
            expiresIn: '10h',
        });
        return res.json({ message: 'admin User created successfully', token });
    }
    catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// Login Route
let attempts = {};
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find the user by username
        const user = yield db_1.Admin.findOne({ email });
        if (!user) {
            // User not found
            attempts[email] = (attempts[email] || 0) + 1;
            if (attempts[email] > 3) {
                return res
                    .status(403)
                    .json({ message: 'Max Attempts Reached. Try again in 10 minutes' });
            }
            else {
                return res
                    .status(403)
                    .json({ message: 'Invalid username or password' });
            }
        }
        // Compare hashed password
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        console.log(passwordMatch);
        if (!passwordMatch) {
            attempts[email] = (attempts[email] || 0) + 1;
            if (attempts[email] > 3) {
                return res
                    .status(403)
                    .json({ message: 'Max Attempts Reached. Try again in 10 minutes' });
            }
            else {
                return res
                    .status(403)
                    .json({ message: 'Invalid username or password' });
            }
        }
        // Password matched, generate JWT token
        const token = jsonwebtoken_1.default.sign({ email, role: 'admin' }, Auth_1.SECRET, {
            expiresIn: '10h',
        });
        return res.json({ message: 'Logged in successfully', token });
    }
    catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
// POST route to send email and generate OTP
router.post('/sendemail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Check if the user exists
        const user = yield db_1.Admin.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Generate a random OTP (4 digits)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        // Save OTP into the database (if needed)
        // Save OTP into the database
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 2); // Expiry time is 1 minute from now
        const otpRecord = new db_1.OTP({
            username: email,
            otp,
            expiry,
        });
        yield otpRecord.save();
        // Send OTP to the user's email
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: 'test976673@gmail.com', // Your Gmail address
                pass: exports.gmailPass, // Your Gmail password or app-specific password
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
        yield transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'OTP sent successfully' });
    }
    catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send OTP email' });
    }
}));
//verify otp route
// POST route to verify OTP
router.post('/verifyotp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, otp } = req.body;
        // Check if the OTP and username exist in the database
        const otpRecord = yield db_1.OTP.findOne({ username, otp });
        if (otpRecord) {
            // Check if OTP has expired
            const now = new Date();
            if (now <= otpRecord.expiry) {
                return res.status(200).json({ message: 'OTP verified successfully' });
            }
            else {
                return res.status(403).json({ message: 'OTP has expired' });
            }
        }
        else {
            return res.status(403).json({ message: 'Invalid OTP or username' });
        }
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
}));
// POST route to change password
router.post('/change-pass', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find the user by username
        const user = yield db_1.Admin.findOne({ email });
        // If user not found, return an error
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Update the password
        console.log(password);
        user.password = password;
        yield user.save();
        console.log(password);
        // Return success response
        res.status(200).json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
}));
// Route to get the total number of users, students, faculty, and admins
router.get('/users/summary', FacultyMiddleware_1.authenticateAccess, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch total users, students, faculty, and admins from the database
        const totalStudents = yield db_1.User.countDocuments();
        const totalFaculty = yield db_1.Faculty.countDocuments({});
        const totalAdmins = yield db_1.Admin.countDocuments({});
        const totalUsers = totalAdmins + totalFaculty + totalStudents;
        // Create the user summary object
        const userSummary = {
            totalUsers,
            totalStudents,
            totalFaculty,
            totalAdmins,
        };
        console.log(totalAdmins);
        console.log(totalFaculty);
        // Return the user summary object as a JSON response
        res.json(userSummary);
    }
    catch (error) {
        console.error('Error fetching user summary:', error);
        res.status(500).json({ error: 'Failed to fetch user summary' });
    }
}));
exports.default = router;
