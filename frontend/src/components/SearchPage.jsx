import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const SearchPage = () => {
  const [query, setQuery] = useState(''); // User input
  const [users, setUsers] = useState([]); // Search results
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error handling

  // Debounce API call to reduce frequent requests
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim() !== '') {
        searchUsers(query);
      } else {
        setUsers([]); // Clear users if query is empty
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(delaySearch); // Cleanup
  }, [query]);

  // Fetch users from API
  const searchUsers = async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`http://localhost:8000/api/v1/user/search?query=${searchTerm}`, { withCredentials: true });
      if (res.data.success) {
        setUsers(res.data.users);
      } else {
        setUsers([]);
        setError(res.data.message || 'No users found');
      }
    } catch (err) {
      setUsers([]);
      setError('Failed to fetch users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Search Users</h2>
      <input
        type="text"
        placeholder="Search for users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

     {
      users.map((user) => {
                          return (
                              <div key={user._id} className='flex items-center justify-between my-5'>
                                  <div className='flex items-center gap-2'>
                                      <Link to={`/profile/${user?._id}`}>
                                          <Avatar>
                                              <AvatarImage src={user?.profilePicture} alt="post_image" />
                                              <AvatarFallback>CN</AvatarFallback>
                                          </Avatar>
                                      </Link>
                                      <div>
                                          <h1 className='font-semibold text-sm'><Link to={`/profile/${user?._id}`}>{user?.username}</Link></h1>
                                          <span className='text-gray-600 text-sm'>{user?.bio || 'I am enjoying using vibesnap'}</span>
                                      </div>
                                  </div>
                                  <span className='text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]'>Follow</span>
                              </div>
                          )
                      })
     }
      {!loading && query && users.length === 0 && <p>No users found</p>}
    </div>
  );
};

export default SearchPage;