import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ApplicantProfile from './profile-applicant';

import axiosInstance from '@/lib/axios';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [userData, setUserData] = useState<any>([]);
  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/users/${user._id}`);
      setUserData(response.data.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user]);

  return (
    <div>
      
      {user.role === 'applicant' && <ApplicantProfile />}
    </div>
  );
};

export default ProfilePage;
