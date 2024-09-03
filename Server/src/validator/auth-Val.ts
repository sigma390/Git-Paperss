import { z } from 'zod';




//will be used in  Signup Route

export const signUpSchema = z.object({
    //username
    name:z.
    string({required_error:'Username is required!!!'}).trim()
    .min(3,{message:'username must be atleast of 3 chars'})
    .max(40,{message:'username must not be more than  40 chars'}),



    //email
    username:z.
    string({required_error:'Username is required!!!'}).trim()
    .email({message:'Invalid Email Addreess!!'})
    .min(3,{message:'username must be atleast of 3 chars'})
    .max(40,{message:'username must not be more than  40 chars'}),

    //for password 
    password:z.
    string({required_error:'Password is required!!!'}).trim()
    .min(6,{message:'Password must be atleast of 3 chars'})
    .max(20,{message:'Password must not be more than  20 chars'})

});

// teacher Signup Vaidation 
export const facultySignUpSchema = z.object({
    //username
    name:z.
    string({required_error:'Username is required!!!'}).trim()
    .min(3,{message:'username must be atleast of 3 chars'})
    .max(40,{message:'username must not be more than  40 chars'}),



    //email
    email:z.
    string({required_error:'Email is required!!!'}).trim()
    .email({message:'Invalid Email Addreess!!'})
    .min(3,{message:'Email must be atleast of 3 chars'})
    .max(40,{message:'Email must not be more than  40 chars'}),

    //for password 
    password:z.
    string({required_error:'Password is required!!!'}).trim()
    .min(6,{message:'Password must be atleast of 3 chars'})
    .max(20,{message:'Password must not be more than  20 chars'})

});




//will be used in  Login Route

export const loginSchema = z.object({
    username:z.
    string({required_error:'Username is required!!!'}).trim()
    .min(3,{message:'username must be atleast of 3 chars'})
    .max(20,{message:'username must not be more than  20 chars'}),

    //for password 
    password:z.
    string({required_error:'Password is required!!!'})
    .min(6,{message:'Password must be atleast of 3 chars'})
    .max(20,{message:'Password must not be more than  20 chars'})

});

export default {signUpSchema,loginSchema};