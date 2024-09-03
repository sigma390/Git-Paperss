import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { baseURL } from '../Signup/Signup';

const ResetPass = () => {
 const navigate = useNavigate();
 const [username, setUsername] = useState('');
 const [showOTPInput, setShowOTPInput] = useState(false);
 const [otp, setOTP] = useState('');
 const [error, setError] = useState('');

 const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
    
  };
  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOTP(event.target.value);
    
  };

  const sendOTP = async () => {
    try {
      await axios.post(baseURL+'/sendemail', { username: username});
      setShowOTPInput(true);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  //verify OTP

  const verifyOTP = async () => {
    try {
      await axios.post(baseURL+'/verifyotp', { username: username, otp });
      // Navigate to reset password page
      navigate('/change-pass', { state: { username } });
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    }
  };
  const handleSignup = ()=>{
    navigate('/signup')
  }





  return (
    <>
    <ToastContainer/>
     <div className=" shadow-lg shadow-slate-400 hover:scale-105 duration-200 signup-card ">
      <h2 className='text-2xl text-center hover:scale-110 duration-200' >Send Email</h2>
      <div className="input-group">
        <label htmlFor="username">Username (Email)</label>
        <input
          type="email"
          id="username"
          value={username}
          onChange={handleUsernameChange}
        />
    
      </div>
      <div className='flex mt-2 justify-center items-center'>
      <button className=' w-32 flex p-2 bg-orange-700 
      rounded-xl justify-center items-center text-center
       text-xl text-white
        hover:bg-orange-500
         duration-200 hover:scale-110 ' onClick={sendOTP}>Send OTP</button>



      </div>
     
      { showOTPInput&&
        <div className="input-group">
        <label htmlFor="username">Enter OTP</label>
        <input
          type="email"
          id="password"
          value={otp}
          onChange={handleOtpChange}
        />
        <div className='flex mt-2 justify-center items-center'>
        <button className=' w-32 flex p-2 bg-orange-700 
      rounded-xl justify-center items-center text-center
       text-xl text-white
        hover:bg-orange-500
         duration-200 hover:scale-110 ' onClick={verifyOTP}>Verify OTP</button>



        </div>
        
    
      </div>
       



      }
       {error && <p className='text-center'>{error}</p>}
      <div className='mt-2 flex justify-center items-center'><p>Dont have Account? </p><button onClick={handleSignup} className=' ml-2 text-blue-500'>Signup Here</button></div>
      




     
      
     
        
      </div>
      
      
     
     
      
      
      
    
    
    
    
    </>
  )
}

export default ResetPass