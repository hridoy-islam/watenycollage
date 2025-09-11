import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { requestOtp } from '@/redux/features/authSlice';
import { AppDispatch } from '@/redux/store';
import { useRouter } from '@/routes/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import taskplan from '@/assets/imges/home/forget.png';
import logo from '@/assets/imges/home/logo.png';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const { error } = useSelector((state: any) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const defaultValues = {
    email: '',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    try {
      setLoading(true); // start loading
      const normalizedData = { ...data, email: data.email.toLowerCase() };
      const result: any = await dispatch(requestOtp(normalizedData));

      if (result?.payload?.success) {
        localStorage.setItem('tp_otp_email', data.email.toLowerCase());
        router.push('/otp');
      } else {
        // handle failure case if needed
        console.error('OTP request failed', result);
      }
    } catch (error) {
      console.error('An error occurred while requesting OTP:', error);
    } finally {
      setLoading(false); // stop loading in any case
    }
  };

  return (
    <>
      <div className="grid h-screen bg-gray-100 lg:px-0">
        <div className="flex  h-full items-center justify-center p-4 lg:p-8">
          <div className="justify-centers mx-auto flex w-full flex-col space-y-4 sm:w-[680px] sm:p-8">
            <Card className="flex w-full flex-col justify-center space-y-4 border border-gray-200 p-4 ">
              <div className="mb-2 flex flex-col space-y-2 text-left">
                <div className="flex flex-row items-center gap-4 space-y-2 text-center">
                  <Link to="/">
                    <img src={logo} alt="logo" className="w-24 " />
                  </Link>
                  <div className="h-12 border"></div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Forget Password
                  </h1>
                </div>
                <p className="text-sm text-muted">
                  Please enter your registered email address. <br />
                  We will send a One-Time Password (OTP) to your email for
                  verification.
                </p>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email..."
                              disabled={loading}
                              {...field}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      disabled={loading}
                      className="ml-auto flex w-full items-center justify-center gap-2 bg-watney text-white hover:bg-watney"
                      type="submit"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="h-5 w-5 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
              {/* <ForgotForm /> */}
              <p className="mt-4 px-8 text-center text-sm text-muted">
                Back to{'  '}
                <Link to="/" className="underline underline-offset-4">
                  Sign In
                </Link>
                .
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
