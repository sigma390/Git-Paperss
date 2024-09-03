import React, { useState } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { object, string,  ZodError } from 'zod';

const baseURL =  'http://localhost:3000/user';

const ChangePass = () => {
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate()
  

  const handlePassword1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    clearValidationError('password');
  };
  const handlePassword2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword2(event.target.value);
    clearValidationError('password');
  };






  //input validation
  const schema = object({
    password: string().min(6, { message: 'Password must be at least 6 characters long' }),
  });


  const handleSubmit = async () => {
    // Form data (assuming you have state variables for username and password)
    // Check if both passwords match
  if (password !== password2) {
    toast.error("Passwords don't match", { position: 'top-center' });
    return; // Stop further execution
  }
    // Access username from location state
  const username = location.state.username;
  
    try {
      schema.parse({username, password });
      
      const formData = {
        username,
        
        password: password
      };
      const response: AxiosResponse = await axios.post(baseURL+'/change-pass', formData);
      
      console.log('Password Change Response:', response.data);
      
      toast.success("Password Changed Successfully!",{
        position:'top-center'
      });
      navigate("/login/student")
      // Handle successful login response here
    } catch (error) {
      

        // Handle Zod validation errors
        
        if (error instanceof ZodError) {
          const validationErrors: { [key: string]: string } = {};
          error.errors.forEach((validationError) => {
            const field = validationError.path.join('_');
            validationErrors[field] = validationError.message;
          });
        setValidationErrors(validationErrors);

        }
        // Handle axios errors
        else if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            const responseData = axiosError.response.data as Record<string, unknown>;
            const errorMessage = responseData.message;
            toast.error(`${errorMessage}`, { position: 'top-center' });
          } else {
            console.error('Login error:', axiosError.message);
            toast.error('An error occurred. Please try again later.', { position: 'top-center' });
            
          }
        
      }
    }
  };
  const clearValidationError = (fieldName: string) => {
    setValidationErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[fieldName];
      return updatedErrors;
    });
  };


  return (
    <>
    <ToastContainer/>
     <div className=" shadow-lg shadow-slate-400 hover:scale-105 duration-200 signup-card ">
      <h2 className='text-2xl text-center hover:scale-110 duration-200' >Change Password</h2>
      <div className="input-group">
        <label htmlFor="username">Enter new password(Min 6 characters)</label>
        <input
          type='email'
          id="password"
          value={password}
          onChange={handlePassword1Change}
        />
        {validationErrors.username && (
          <div className="error-message  text-red-600">{validationErrors.username}</div>
        )}
      </div>
      <div className="input-group">
        <label htmlFor="password">Confirm Password </label>
        <input
          type='email'
          id="password"
          value={password2}
          onChange={handlePassword2Change}
        />
        {validationErrors.password && (
          <div className="error-message text-red-600">{validationErrors.password}</div>
        )}
        
        
      </div>
      <div className='flex mt-2 justify-center items-center'>
      <button className=' w-32 flex p-2 bg-orange-700 
      rounded-xl justify-center items-center text-center
       text-xl text-white
        hover:bg-orange-500
         duration-200 hover:scale-110 ' onClick={handleSubmit}>Change Password</button>



      </div>
      
    </div>
    
    
    
    </>
   
  );
};

export default ChangePass;