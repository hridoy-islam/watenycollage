import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ApplicantProfile from './profile-applicant';
import InternationalStudentProfile from './profile-internationalStudent';
import EuStudentProfile from './profile-euStudent';


const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);



  return (
    <div>
      {user.role === 'student' && user.studentType === 'eu' && (
        <EuStudentProfile />
      )}
      {user.role === 'student' && user.studentType === 'international' && (
        <InternationalStudentProfile />
      )}
      {user.role === 'applicant' && <ApplicantProfile />}
    </div>
  );
};

export default ProfilePage;
