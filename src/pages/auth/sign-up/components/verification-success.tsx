// components/verification-success.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/imges/home/logo.png';

interface VerificationSuccessProps {
  email: string;
}

export function VerificationSuccess({ email }: VerificationSuccessProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 p-4 lg:p-8">
  <div className="w-full max-w-6xl">
    <Card className="flex w-full flex-col justify-start overflow-y-auto rounded-sm border border-gray-200 p-6">
        <div className=" flex flex-col text-center items-center">
            <div className="mb-4 flex items-center gap-4">
              <img src={logo} alt="logo" className="w-32" />

              
            </div>
          </div>
      <div className="flex flex-col text-center  items-center space-y-4">
        {/* Icon */}
        {/* <CheckCircle className="h-16 w-16 text-green-500 mx-auto lg:mx-0" /> */}

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-900">
          Verification Successful!
        </h2>

        {/* Info Text */}
        <div className="space-y-2 text-center ">
          <p className="text-sm text-gray-600">
            Your email has been successfully verified and your account is now active.
          </p>
          <p className="text-sm font-medium text-gray-900">
            Welcome! You can log in using your email and password.
          </p>
        </div>

        {/* Button */}
        <Button asChild className="w-full sm:w-[30%] bg-watney text-white hover:bg-watney/90">
          <Link to="/">Continue to Login</Link>
        </Button>
      </div>
    </Card>
  </div>
</div>

  );
}