import { FaCircleUser } from 'react-icons/fa6';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/git.jpg';
import { logout } from '../../store/authSlice';
export const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state: { auth: any }) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };
  return (
    <header className='shadow sticky z-50 top-0 '>
      <nav className='bg-white border-gray-200 px-12 lg:px-12 py-2.5 '>
        <div className='flex flex-wrap justify-between items-center mx-auto max-w-screen-xl'>
          <div className='flex justify-start'>
            <Link to='https://git.edu/' className='flex items-center'>
              <img src={logo} className='mr-3 h-16 rounded-full' alt='Logo' />
            </Link>
            <h1 className='pl-1  text-2xl pt-5 pb-5 font-custom'>
              KLS Gogte institute of Technology
            </h1>
          </div>

          <div className='flex items-center lg:order-2'>
            {auth.isAuthenticated ? (
              <>
                <span>{auth.user.name}</span>
                <FaCircleUser className='text-2xl mr-2' />
                <button
                  className='text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:ring-orange-300 font-medium
                                     rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none'
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to='/'
                  className='text-gray-800 duration-200 
                                 hover:text-orange-500 focus:ring-4
                                  focus:ring-gray-300 font-medium rounded-lg
                      
                                  text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 
                                   focus:outline-none'
                >
                  Log in
                </Link>
                <NavLink
                  to='/'
                  className='text-white bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none'
                >
                  Signup
                </NavLink>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
