import { Card } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { SignUpForm } from './components/sign-up-form';
import logo from '@/assets/imges/home/logo.png';




export default function SignUpPage() {

  

    
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 lg:p-8">
      <div className="w-full max-w-6xl">
        <Card className=" flex max-h-[98vh] w-full flex-col justify-start overflow-y-auto rounded-sm border border-gray-200 p-4">
          <div className=" flex flex-col text-left">
            <div className="mb-4 flex items-center gap-4">
              <Link to="/">
                <img src={logo} alt="logo" className="w-24" />
              </Link>
              <div className="h-12 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold tracking-tight">
                Create an account
              </h1>
            </div>

            <p className="text-sm text-black pb-2 mt-6">
              Enter your email and password to create an account. <br />
              Already have an account?{' '}
              <Link to="/" className="underline underline-offset-4">
                Login here
              </Link>
            </p>
          </div>

          <div className=''>
            <SignUpForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
