'use client';

import { useEffect, useState } from 'react';
import api from '../app/lib/axios';

type User = {
  _id: string;
  name: string;
  email: string;
  phone_no?: string;
  mobile?: string;
  password: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<User[]>('/user/');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="bg-amber-200 text-center font-bold text-4xl p-4 mb-6">Power Share</h1>
      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user._id} className="bg-white shadow p-4 rounded-lg">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone_no || user.mobile}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
