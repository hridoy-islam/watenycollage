import UserAuthForm from './components/user-auth-form';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import watney from '@/assets/imges/home/watney.jpg'; // Note: Not used in this snippet, but kept as in your original code
import logo from '@/assets/imges/home/logo.png';
import { Card } from '@/components/ui/card';
import { MoveLeft } from 'lucide-react';

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
      
      {/* Top Right Back Button */}
      <Button
onClick={() => window.location.href = 'https://www.watneycollege.co.uk/'}        variant={'default'}
        className={cn(
         
          'absolute right-4 top-8 md:right-8 md:top-8 bg-watney text-white hover:bg-watney'
        )}
      >
        <MoveLeft className='mr-2 w-5 h-5' /> Back To Website
      </Button>

      <div className="flex h-full items-center p-4 lg:p-8 bg-gray-100 shadow-md">
        <Card className="mx-auto shadow-none rounded-sm p-4 flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="flex flex-row space-y-2 text-center items-center gap-4">
            <img src={logo} alt="logo" className="w-12" />
            <div className="border h-12"></div>
            <h1 className="text-2xl font-semibold tracking-tight">Watney College</h1>
          </div>
          <h1 className="font-semibold text-2xl">Login</h1>
          <UserAuthForm />
        </Card>
      </div>
    </div>
  );
}