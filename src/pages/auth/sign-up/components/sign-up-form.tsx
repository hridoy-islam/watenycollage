import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from '@/routes/hooks';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { HTMLAttributes } from 'react';
import ReactSelect, { SingleValue } from 'react-select';
import { nationalities } from '@/types';
import { OtpVerification } from './otp-verification';
import { VerificationSuccess } from './verification-success';

interface OptionType {
  value: string;
  label: string;
}

interface SignUpFormProps extends HTMLAttributes<HTMLDivElement> { }

const signUpSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  initial: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(7, 'Phone number is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required')
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

type SignUpStep = 'form' | 'otp' | 'success';

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignUpStep>('form');
  const [userData, setUserData] = useState<SignUpFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      title: '',
      firstName: '',
      lastName: '',
      initial: '',
      email: '',
      password: '',
      phone: '',
      nationality: '',
      dateOfBirth: ''
    }
  });

  const handleFormSubmit = async (data: SignUpFormValues) => {
    setIsSubmitting(true);
    try {
      // Store user data for later use
      setUserData(data);

      // Generate OTP (4-digit)
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      // Save for verification later
      localStorage.setItem('signup_otp', otp);
      localStorage.setItem('signup_email', data.email);
      localStorage.setItem('signup_otp_timestamp', Date.now().toString());

      const response = await axiosInstance.post('/auth/pre-register', {
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        otp
      });
      setCurrentStep('otp');
    } catch (err: any) {
      form.setError('email', {
        type: 'server',
        message: err.response?.data?.message || 'Something went wrong'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerificationSuccess = async () => {
    if (!userData) return;

    try {
      setIsOtpVerifying(true); // show verifying on OTP button

      // Final registration API call
      const response = await axiosInstance.post('/auth/signup', {
        ...userData,
        name: `${userData.title} ${userData.firstName} ${userData.initial} ${userData.lastName}`.trim(),
        email: userData.email.toLowerCase(),
        role: 'applicant',
        isValided: true
      });

      if (response?.data?.success) {
        setCurrentStep('success');
      }
    } catch (err: any) {
      toast({
        title: 'Registration Failed',
        description: 'Please try again.',
        variant: 'destructive'
      });
      setCurrentStep('form');
    } finally {
      setIsOtpVerifying(false); // hide verifying
    }
  };
  const handleLogout = () => {
    // Clear any stored data
    localStorage.removeItem('signup_otp');
    localStorage.removeItem('signup_otp_timestamp');
    localStorage.removeItem('signup_email');

    setUserData(null);
    setCurrentStep('form');
    form.reset();
  };

  // Utility to convert strings to options
  const getOptions = (values: string[]) =>
    values.map((val) => ({ value: val, label: val }));

  const titleOptions = getOptions(['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof']);
  const nationalityOptions = nationalities.map((nation) => ({
    value: nation,
    label: nation
  }));

  return (
    <section className="relative">
      {/* OTP Verification Overlay */}
      {currentStep === 'otp' && userData && (
        <OtpVerification
          email={userData.email}
          firstName={userData.firstName}
          onVerificationSuccess={handleOtpVerificationSuccess}
          onLogout={handleLogout}
          isVerifying={isOtpVerifying}
        />
      )}

      {/* Success Overlay */}
      {currentStep === 'success' && userData && (
        <VerificationSuccess email={userData.email} />
      )}

      {/* Registration Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleFormSubmit)}
          className={cn(
            'space-y-2 py-6',
            currentStep !== 'form' && 'pointer-events-none opacity-50'
          )}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ReactSelect
                      options={titleOptions}
                      value={titleOptions.find(
                        (opt) => opt.value === field.value
                      )}
                      onChange={(option: SingleValue<OptionType>) =>
                        field.onChange(option?.value)
                      }
                      placeholder="Select title"
                      className="react-select-container rounded-full"

                      classNamePrefix="react-select"
                      styles={{
                              placeholder: (provided) => ({
                                ...provided,
                                fontSize: '1.125rem',
                                color: '#9CA3AF'
                              }),
                              control: (provided) => ({
                                ...provided,
                                borderRadius: '16px',
                                fontSize: '1.125rem',
                                minHeight: '3rem', // h-12 = 48px
                                height: '3rem'
                              }),
                              singleValue: (provided) => ({
                                ...provided,
                                fontSize: '1.125rem'
                              }),
                              input: (provided) => ({
                                ...provided,
                                fontSize: '1.125rem'
                              }),
                              valueContainer: (provided) => ({
                                ...provided,
                                padding: '0 0.75rem' // px-3 for better spacing
                              })
                            }}
                    />
                  </FormControl>
                  <FormMessage className="text-md text-red-600" />
                </FormItem>
              )}
            />

            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage className="text-md text-red-600" />
                </FormItem>
              )}
            />

            {/* Middle Name */}
            <FormField
              control={form.control}
              name="initial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Middle Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="(Optional)" {...field} />
                  </FormControl>
                  <FormMessage className="text-md text-red-600" />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage className="text-md text-red-600" />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Phone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage className="text-md text-red-600" />
                </FormItem>
              )}
            />

            {/* Nationality */}
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Nationality <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <ReactSelect
                      options={nationalityOptions}
                      value={nationalityOptions.find(
                        (opt) => opt.value === field.value
                      )}
                      onChange={(option: SingleValue<OptionType>) =>
                        field.onChange(option?.value)
                      }
                      placeholder="Select nationality"
                      className="react-select-container"
                      classNamePrefix="react-select"
                     styles={{
                              placeholder: (provided) => ({
                                ...provided,
                                fontSize: '1.125rem',
                                color: '#9CA3AF'
                              }),
                              control: (provided) => ({
                                ...provided,
                                borderRadius: '16px',
                                fontSize: '1.125rem',
                                minHeight: '3rem', // h-12 = 48px
                                height: '3rem'
                              }),
                              singleValue: (provided) => ({
                                ...provided,
                                fontSize: '1.125rem'
                              }),
                              input: (provided) => ({
                                ...provided,
                                fontSize: '1.125rem'
                              }),
                              valueContainer: (provided) => ({
                                ...provided,
                                padding: '0 0.75rem' // px-3 for better spacing
                              })
                            }}
                    />
                  </FormControl>
                  <FormMessage className="text-md text-red-600" />
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => {
                const today = new Date().toISOString().split('T')[0];
                return (
                  <FormItem>
                    <FormLabel className="block font-medium text-gray-700">
                      Date of Birth <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" max={today} {...field} />
                    </FormControl>
                    <FormMessage className="text-md text-red-600" />
                  </FormItem>
                );
              }}
            />
          </div>

          {/* Email & Password Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Email - Full width */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-md text-red-600" />
                </FormItem>
              )}
            />

            {/* Password - Full width */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <FormMessage className="text-md text-red-600" />
                  <p className="mt-1 text-md text-gray-500">
                    Password must be at least 6 characters
                  </p>
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full  bg-watney font-medium text-white shadow-sm transition-colors hover:bg-watney/90"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
