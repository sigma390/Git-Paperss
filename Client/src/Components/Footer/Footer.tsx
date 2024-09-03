import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className='bg-gray-200 p-4 text-center mt-10'>
      {/* Link within the footer using Link component from React Router */}
      <Link to='/about-devs' className='text-blue-500 hover:underline'>
        About The Devlopers
      </Link>
    </footer>
  );
}

export default Footer;
