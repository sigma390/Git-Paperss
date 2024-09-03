import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdOutlineCancel } from "react-icons/md";
import { TbPlayerTrackNextFilled } from "react-icons/tb";


interface Scheme {
  title: string;
  description: string;
}

const Schemes: React.FC = () => {

  // Define the array with three items
  const exams = [
    { title: 'IA' },
    { title: 'SEE' },
    { title: 'Fastrack' }
  ];
  const [items, setItems] = useState<Scheme[]>([]);
  const [showCard, setShowCard] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedexam, setSelectedexam] = useState<string | null>(exams[0].title);
  const isAuthenticated = useSelector((state: { auth: { isAuthenticated: boolean } }) => state.auth.isAuthenticated);
  const basePath = 'http://localhost:3000/faculty';

  // Sort schemes by title
  items.sort((a, b) => {
    const titleA = parseFloat(a.title);
    const titleB = parseFloat(b.title);
    if (titleA < titleB) return -1;
    else if (titleA > titleB) return 1;
    else return 0;
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchSchemes();
    }
  }, [isAuthenticated]);

  const fetchSchemes = async () => {
    try {
      // Make GET request to fetch schemes from backend
      const response = await axios.get<Scheme[]>(`${basePath}/scheme`);
      setItems(response.data);
      if (response.data.length > 0) {
        setSelected(response.data[0].title);
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
    }
  };

  const addNewScheme = () => {
    setShowCard(true);
  };

  const handleSaveScheme = async () => {
    try {
      await axios.post(`${basePath}/scheme`, { title: name, description }, {
        headers: {
          authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      fetchSchemes();
      setShowCard(false);
    } catch (error) {
      console.error('Error creating scheme:', error);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div className="mt-10 ml-10 flex justify-start">
        <label className="h1 font-bold p-2" htmlFor="dropdown">Select a Scheme</label>
        <select
          className="select select-warning w-24 max-w-xs text-md"
          id="dropdown"
          onChange={(e) => setSelected(e.target.value)}
          value={selected || ''}
        >
          {items.map((item, index) => (
            <option key={index} value={item.title}>
              {item.title}
            </option>
          ))}
        </select>
        <label className="h1 font-bold p-2" htmlFor="dropdown">Select a Examination</label>
        <select
          className="select select-warning w-24 max-w-xs text-md"
          id="dropdown"
          onChange={(e) => setSelectedexam(e.target.value)}
          value={selectedexam || ''}
        >
          {exams.map((item, index) => (
          <option key={index} value={item.title}>
            {item.title}
          </option>
        ))}
        </select>

        <div className="flex justify-start">
          {(localStorage.userType === 'faculty' || localStorage.userType === 'admin') && (
            <button className="btn ml-5 btn-active" onClick={addNewScheme}>Add New Scheme</button>
          )}
          {selected && (
            <div className="flex justify-start">
              <Link className="btn btn-neutral ml-5" to={`/Papers/?scheme=${selected}&exam=${selectedexam}`} >
                Proceed <TbPlayerTrackNextFilled />
              </Link>
            </div>
          )}
        </div>
      </div>

      {showCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card bg-white p-5 rounded-lg shadow-lg">
            <div className="flex justify-between p-2">
              <h3 className="font-semibold">Add New Scheme</h3>
              <button onClick={() => setShowCard(false)} className="text-xl hover:scale-105 duration-150">
                <MdOutlineCancel />
              </button>
            </div>
            <input
              type="text"
              placeholder="Scheme Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered mb-3 w-full"
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input input-bordered mb-3 w-full"
            />
            <div className="flex justify-center space-x-2">
              <button onClick={handleSaveScheme} className="btn btn-neutral">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Schemes;
