"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.File = exports.Scheme = exports.Admin = exports.Faculty = exports.OTP = exports.Post = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables from .env file
dotenv.config();
// Define user schema
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    checkbox: { type: Boolean, default: false }
});
// Hash password before saving
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Hash the password only if it's modified or new
            if (!this.isModified('password')) {
                return next();
            }
            const hashedPassword = yield bcrypt_1.default.hash(this.password, 10);
            this.password = hashedPassword;
            next();
        }
        catch (error) {
            console.log("its eror");
        }
    });
});
// Create and export User model
const User = (0, mongoose_1.model)('User', userSchema);
exports.User = User;
// Define user schema
const facultySchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
// Hash password before saving
facultySchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Hash the password only if it's modified or new
            if (!this.isModified('password')) {
                return next();
            }
            const hashedPassword = yield bcrypt_1.default.hash(this.password, 10);
            this.password = hashedPassword;
            next();
        }
        catch (error) {
            console.log("its eror");
        }
    });
});
// Create and export User model
const Faculty = (0, mongoose_1.model)('Faculty', facultySchema);
exports.Faculty = Faculty;
// Define Adminschema
const adminSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
// Hash password before saving
adminSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Hash the password only if it's modified or new
            if (!this.isModified('password')) {
                return next();
            }
            const hashedPassword = yield bcrypt_1.default.hash(this.password, 10);
            this.password = hashedPassword;
            next();
        }
        catch (error) {
            console.log("its eror");
        }
    });
});
// Create and export User model
const Admin = (0, mongoose_1.model)('Admin', adminSchema);
exports.Admin = Admin;
const postSchema = new mongoose_1.Schema({
    title: String,
    description: String,
});
const Post = mongoose_1.default.model('Post', postSchema);
exports.Post = Post;
const otpSchema = new mongoose_1.Schema({
    username: {
        type: String,
        default: ''
    },
    otp: {
        type: String,
        default: ''
    },
    expiry: {
        type: Date,
        required: true
    }
});
// Define TTL index on expiry field to automatically delete documents after expiry
otpSchema.index({ expiry: 1 }, { expireAfterSeconds: 0 });
// Define a pre-save hook to reset username and otp to an empty string after expiry
otpSchema.pre('save', function (next) {
    const now = new Date();
    console.log(now);
    console.log(this.expiry);
    if (now > this.expiry) {
        this.username = ''; // Reset username to an empty string
        this.otp = ''; // Reset OTP to an empty string
    }
    next();
});
const OTP = mongoose_1.default.model('OTP', otpSchema);
exports.OTP = OTP;
const schemeSchema = new mongoose_1.Schema({
    title: String,
    description: String,
});
const Scheme = mongoose_1.default.model('Scheme', schemeSchema);
exports.Scheme = Scheme;
// Define the schema for the File document
const fileSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true
    },
    scheme: {
        type: String,
    },
    exam: {
        type: String,
    },
    uploadedAt: {
        type: Date,
        required: true,
        default: Date.now // Default value is the current date and time
    },
    uploadedBy: {
        type: String
    },
    viewLink: {
        type: String,
        required: true
    },
    downLoadLink: {
        type: String,
        required: true
    },
    driveId: {
        type: String,
    }
});
// Create the model for the File schema
const File = (0, mongoose_1.model)('File', fileSchema);
exports.File = File;
