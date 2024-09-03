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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Auth_1 = require("../../middleware/Auth");
const db_1 = require("../../db/db");
const validate_middleware_1 = __importDefault(require("../../middleware/validate-middleware"));
const auth_Val_1 = require("../../validator/auth-Val");
const user_1 = __importDefault(require("../user"));
//student signup route
user_1.default.post('/student/signup', (0, validate_middleware_1.default)(auth_Val_1.signUpSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { usn, username, password } = req.body;
    try {
        // Check if the user already exists
        const user = yield db_1.Student.findOne({ username });
        if (user) {
            return res.status(403).json({ message: 'User already exists' });
        }
        // // Encrypt the password using bcrypt
        // const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
        //Create a new user with the hashed password
        const newUser = new db_1.Student({ usn, username, password });
        console.log(password);
        yield newUser.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ username, role: 'user' }, Auth_1.SECRET, { expiresIn: '1h' });
        return res.json({ message: 'User created successfully', token });
    }
    catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}));
