// components/otp-verification.tsx
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import logo from '@/assets/imges/home/logo.png';

interface OtpVerificationProps {
  email: string;
  firstName: string;
  onVerificationSuccess: () => void;
  onLogout: () => void;
   isVerifying: boolean; 
}

export function OtpVerification({
  email,
  firstName,
  onVerificationSuccess,
  onLogout,
  isVerifying
}: OtpVerificationProps) {
  const [otp, setOtp] = useState(Array(4).fill(''));
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isCooldownActive, setIsCooldownActive] = useState(true);

  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          setIsCooldownActive(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const index = inputRefs.current.indexOf(e.currentTarget);
    if (
      !/^[0-9]{1}$/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete'
    ) {
      e.preventDefault();
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      setOtp((prevOtp) => {
        const updatedOtp = [...prevOtp];
        updatedOtp[index] = '';
        return updatedOtp;
      });
      if (e.key === 'Backspace' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = inputRefs.current.indexOf(e.target);
    const val = e.target.value;
    if (/^[0-9]$/.test(val)) {
      const updated = [...otp];
      updated[index] = val;
      setOtp(updated);
      if (index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    e.target.select();

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (!new RegExp(`^[0-9]{${otp.length}}$`).test(pasted)) return;
    setOtp(pasted.split(''));
  };
const handleOtpSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    const otpCode = otp.join('');
    const storedOtp = localStorage.getItem('signup_otp');
    const storedTimestamp = localStorage.getItem('signup_otp_timestamp');
    const storedEmail = localStorage.getItem('signup_email');

    if (
      storedTimestamp &&
      Date.now() - parseInt(storedTimestamp) > 10 * 60 * 1000
    ) {
      setError('OTP has expired. Please request a new one.');
      return;
    }

    if (storedOtp === otpCode && storedEmail === email) {
      // OTP verification successful
      localStorage.removeItem('signup_otp');
      localStorage.removeItem('signup_otp_timestamp');
      localStorage.removeItem('signup_email');

  
      onVerificationSuccess();
    } else {
      setError('Invalid verification code. Please try again.');
    }
  } catch (err) {
    console.error('Error verifying OTP:', err);
    setError('Something went wrong. Please try again.');
  } 
};


  const handleResendOtp = async () => {
    try {
      setResendCooldown(30);
      setIsCooldownActive(true);
      setError('');
      setOtp(Array(4).fill(''));

      // Generate new OTP
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      localStorage.setItem('signup_otp', newOtp);
      localStorage.setItem('signup_otp_timestamp', Date.now().toString());

      // Call backend to send OTP
      await axiosInstance.post('/auth/pre-register/resend-otp', {
        email: email.toLowerCase(),
        firstName: firstName,
        otp: newOtp
      });

      // Start cooldown timer
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setIsCooldownActive(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Failed to resend OTP:', err);
      setError('Failed to resend OTP. Please try again.');
      setIsCooldownActive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 p-4 lg:p-8">
      <div className="w-full max-w-6xl">
        <Card className="flex w-full flex-col justify-center overflow-y-auto rounded-sm border border-gray-200 p-6">
          <div className=" flex flex-col text-left">
            <div className="mb-4 flex items-center gap-4">
              <img src={logo} alt="logo" className="w-24" />

              <div className="h-12 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold tracking-tight">
                VERIFY YOUR EMAIL ADDRESS
              </h1>
            </div>
          </div>
          <div className="flex w-full flex-col items-center space-y-6 text-center">
            {/* Info Text */}
            <div className="w-full space-y-2 text-center">
              <p className="font-medium text-gray-700">
                Thank you for registering with Everycare Romford.
              </p>
              <p className="text-sm text-gray-600">
                We've sent a 4-digit verification code to
              </p>
              <p className="text-sm font-bold text-gray-900">{email}</p>
              <p className="text-sm text-gray-600">
                Please check your inbox to continue.
              </p>
            </div>

            {/* Error */}
            {error && (
              <p className="w-full text-center text-sm text-red-500 ">
                {error}
              </p>
            )}

            {/* OTP Inputs */}
            <form
              className="flex w-full flex-col items-center justify-center gap-4"
              onSubmit={handleOtpSubmit}
            >
              <div className="flex flex-row justify-center gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onPaste={handlePaste}
                    ref={(el) => (inputRefs.current[index] = el!)}
                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-gray-300 bg-white text-center text-xl font-medium shadow-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}
              </div>
              <Button
                type="submit"
                disabled={otp.some((digit) => digit === '') || isVerifying}
                className="w-full bg-watney text-white hover:bg-watney/90 sm:w-[25%]"
              >
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>

            {/* Resend OTP */}
            <div className="flex w-full items-center justify-center space-x-1 text-center text-sm ">
              <span className="text-gray-600">Didn't receive the code?</span>
              <button
                onClick={handleResendOtp}
                disabled={isCooldownActive}
                type="button"
                className={`font-medium transition-opacity duration-200 ${
                  isCooldownActive
                    ? 'cursor-not-allowed opacity-70'
                    : 'text-watney hover:underline'
                }`}
              >
                {isCooldownActive
                  ? `Resend in ${resendCooldown}s`
                  : 'Resend code'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
