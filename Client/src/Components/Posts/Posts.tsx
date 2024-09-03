import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { baseURL } from '../Signup/Signup';
import { PostCard } from './PostCard'; // Assuming PostCard is in the same directory

interface Post {
  id: string;
  title: string;
  description: string;
  images: string;
}

const Posts: React.FC = () => {
  const location = useLocation();
  const user = location.state.name;
  const [posts, setPosts] = useState<Post[]>([]);
  const init = async () => {
    try {
      const response = await axios.get(`${baseURL}/posts`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setPosts(response.data.posts);
      toast.success(`Welcome!!! ${user}`, {
        position: 'top-center',
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <ToastContainer />
      <div className='flex justify-center items-center'>
        <h2 className='text-6xl text-center mt-36'>
          {' '}
          Welcome,{' '}
          <span className='text-red-500 hover:scale-110 duration-150'>
            {' '}
            {user}
          </span>
          , How You Do!!!!
        </h2>
      </div>
      <div className='grid mt-10 ml-24 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mr-24'>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            title={post.title}
            description={post.description}
            image={post.images}
          />
        ))}
      </div>
    </>
  );
};

export default Posts;
