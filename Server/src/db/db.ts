

import mongoose, { Schema, Document, model } from "mongoose";
import bcrypt from 'bcrypt';
import { hash, compare } from 'bcrypt';


import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define mongoose schemas

/// User interface
interface User extends Document {
  name:string;
  username: string;
  password: string;
  checkbox: boolean;
}

// Define user schema
const userSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  checkbox: { type: Boolean, default: false }
});
// Hash password before saving
userSchema.pre<User>('save', async function (next) {
  try {
    // Hash the password only if it's modified or new
    if (!this.isModified('password')) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.log("its eror")
  }
});

// Create and export User model
const User = model<User>('User', userSchema);


// ==================> Faculty schema <======================

interface faculty extends Document {
  name:string;
  email:string;
  password:string
}


// Define user schema
const facultySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving
facultySchema.pre<faculty>('save', async function (next) {
  try {
    // Hash the password only if it's modified or new
    if (!this.isModified('password')) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.log("its eror")
  }
});

// Create and export User model
const Faculty = model<faculty>('Faculty', facultySchema);


// ==============================> Admin Schema <====================================

interface admin extends Document {
  name:string;
  email:string;

  password:string
}

// Define Adminschema
const adminSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Hash password before saving
adminSchema.pre<admin>('save', async function (next) {
  try {
    // Hash the password only if it's modified or new
    if (!this.isModified('password')) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.log("its eror")
  }
});

// Create and export User model
const Admin = model<admin>('Admin', adminSchema);









//=======================>  Post schema <===========================
interface Post extends Document {
    title: string;
    description: string;
   
  }
  
  const postSchema: Schema = new Schema({
    title: String,
    description: String,


  });
  
  const Post = mongoose.model<Post>('Post', postSchema);
//OTP SCHEMA



export interface OTPModel {
  username: string;
  otp: string;
  expiry: Date;
}

const otpSchema: Schema<OTPModel> = new Schema({
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
otpSchema.pre<OTPModel>('save', function(next) {
  const now = new Date();
  console.log(now);
  console.log(this.expiry)
  if (now > this.expiry) {
    this.username = ''; // Reset username to an empty string
    this.otp = ''; // Reset OTP to an empty string
  }
  next();
});

const OTP =  mongoose.model<OTPModel>('OTP', otpSchema);


// Schemes Info 

interface Scheme extends Document {
  title: string;
  description: string;
 
}

const schemeSchema: Schema = new Schema({
  title: String,
  description: String,


});

const Scheme = mongoose.model<Scheme>('Scheme', schemeSchema);


// file schema 

// Define the interface for the File document
interface FileSchema extends Document {
  title: string;
  scheme: string;
  exam:string;
  uploadedAt: Date; // New field: Date and time of upload
  uploadedBy: string; // New field: Name or identifier of the uploader
  viewLink:string;
  downLoadLink:string;
  driveId:string
}

// Define the schema for the File document
const fileSchema = new Schema<FileSchema>({
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
  viewLink:{
    type: String,
    required: true
  },
  downLoadLink:{
    type: String,
    required: true
  },
  driveId:{
    type: String,
    
  }
});

// Create the model for the File schema
const File = model<FileSchema>('File', fileSchema);


//No of downloads 
interface Downloads extends Document {
  downlods :number
  
}




export { User, Post, OTP, Faculty, Admin , Scheme, File };

