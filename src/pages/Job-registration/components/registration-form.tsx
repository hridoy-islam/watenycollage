import type React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Check, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

import axiosInstance from '@/lib/axios';
import { nationalities } from '@/types';
import ReactSelect from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const registrationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  firstName: z.string().min(1, 'First name is required').max(50),
  initial: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  nationality: z.string().min(1, 'Nationality is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const defaultRegistrationValues = {
  title: '',
  firstName: '',
  initial: '',
  lastName: '',
  phone: '',
  nationality: '',
  dateOfBirth: '',
  email: '',
  password: ''
};

interface RegistrationFormProps {
  formSubmitted: boolean;
  setFormSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess?: () => void;
}

export default function RegistrationForm({
  formSubmitted,
  setFormSubmitted,
  onSuccess
}: RegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Initialize form with React Hook Form + Zod validation
  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: defaultRegistrationValues
  });

  const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
    try {
      const response = await axiosInstance.post('/auth/signup', {
        ...values,
        name: `${values.title} ${values.firstName} ${values.initial} ${values.lastName}`,
        role: 'applicant',
        isCompleted: false,

        title: values.title,
        firstName: values.firstName,
                email:values.email.toLocaleLowerCase(),

        initial: values.initial,
        lastName: values.lastName,
        nationality: values.nationality,
        dateOfBirth: values.dateOfBirth
      });

      setFormSubmitted(true);

      toast({
        title: 'Thank you',
        description: 'Your account has been created.'
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast({
        title: 'Server Error',
        description: err.response?.data?.message || 'Please try again later.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <ReactSelect
                    options={['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'].map((item) => ({
                      label: item,
                      value: item
                    }))}
                    value={
                      field.value
                        ? { label: field.value, value: field.value }
                        : null
                    }
                    onChange={(option) => field.onChange(option?.value)}
                    placeholder="Select title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* First Name */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Middle Name (Optional) */}
          <FormField
            control={form.control}
            name="initial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input placeholder="(Optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number *</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nationality */}
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality *</FormLabel>
                <FormControl>
                  <ReactSelect
                    options={nationalities.map((nation) => ({
                      label: nation,
                      value: nation
                    }))}
                    value={
                      field.value
                        ? { label: field.value, value: field.value }
                        : null
                    }
                    onChange={(option) => field.onChange(option?.value)}
                    placeholder="Select nationality"
                  />
                </FormControl>
                <FormMessage />
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
                  <FormLabel className="block text-sm font-medium text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" max={today} {...field} />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john.doe@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password *</FormLabel>
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
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <FormMessage />
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-watney text-white hover:bg-watney/90"
        >
          Create Account
        </Button>
      </form>
    </Form>
  );
}
