import UserAuthForm from './components/user-auth-form';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import watney from '@/assets/imges/home/watney.jpg';
import logo from '@/assets/imges/home/logo.png';
import { Card } from '@/components/ui/card';

export default function SignInPage() {
  const { user } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard'); // Adjust the path as needed
    }
  }, [user, navigate]);

  return (
    <div className="relative h-screen flex-col items-center justify-center w-full lg:px-0">

      <div className="flex h-full items-center p-4 lg:p-8 bg-gray-100 shadow-md">
        <Card className="mx-auto rounded-sm p-4 border border-gray-200 flex w-full flex-col justify-center space-y-4 sm:w-[350px]">
          <div className="flex flex-row space-y-2 text-center items-center gap-4">
            <img src={logo} alt="logo" className='w-24 ' />
            <div className='border h-12'></div>
            <h1 className="text-2xl font-semibold tracking-tight">Every Care</h1>
          </div>
          <h1 className='font-semibold text-2xl'>Login</h1>
          <UserAuthForm />
          
        </Card>
      </div>
    </div>
  );
}