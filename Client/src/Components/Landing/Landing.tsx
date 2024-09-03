// LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import bg from '../../assets/bg1.jpg';

const Landing: React.FC = () => {
  return (
    <div className="bg-cover bg-center h-screen flex justify-center items-center" style={{ backgroundImage: `url(${bg})` }}>
      <div className="bg-black bg-opacity-40 rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-white mb-4 text-center font-custom ">Welcome</h1>
        <div className="flex flex-col justify-center items-center">
          <Link className="mt-2 hover:text-orange-500 duration-200" to="/login/student">
            <button className="w-56 flex p-2 bg-orange-700 rounded-xl justify-center items-center text-center text-xl text-white hover:bg-orange-500 duration-200 hover:scale-110">Student Login</button>
          </Link>
          <Link className="mt-2 hover:text-orange-500 duration-200" to="/login/faculty">
            <button className="w-56 flex p-2 bg-orange-700 rounded-xl justify-center items-center text-center text-xl text-white hover:bg-orange-500 duration-200 hover:scale-110">Faculty Login</button>
          </Link>
          <Link className="mt-2 hover:text-orange-500 duration-200" to="/login/admin">
            <button className="w-56 flex p-2 bg-orange-700 rounded-xl justify-center items-center text-center text-xl text-white hover:bg-orange-500 duration-200 hover:scale-110">Admin Login</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
