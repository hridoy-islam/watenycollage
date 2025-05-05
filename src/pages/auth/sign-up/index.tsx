import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { SignUpForm } from './components/sign-up-form';
import watney from '@/assets/imges/home/watney.jpg';
import logo from '@/assets/imges/home/logo.png';

export default function SignUpPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-4 lg:p-8">
      <div className="w-full max-w-md space-y-4">
        <Card className="mx-auto flex w-full flex-col justify-center space-y-4 rounded-sm border border-gray-200 p-4 sm:w-[350px]">
          <div className="mb-2 flex flex-col  text-left">
            <div className="flex flex-row mb-2 items-center gap-4 space-y-2 text-center">
             <Link to='/'><img src={logo} alt="logo" className="w-12 " /></Link> 
              <div className="h-12 border"></div>
              <h1 className="text-lg font-semibold tracking-tight">
                Create an account
              </h1>
            </div>

            <p className="text-sm text-black ">
              Enter your email and password to create an account. <br />
              Already have an account?{' '}
              <Link to="/" className="underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
          <SignUpForm />
        </Card>
      </div>
    </div>
  );
}
