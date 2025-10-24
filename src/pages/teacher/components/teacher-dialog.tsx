import { Controller, useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ErrorMessage from '@/components/shared/error-message';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import Select from 'react-select'; // Import react-select

export function TeacherDialog({ open, onOpenChange, onSubmit, initialData }) {
  const [staffOptions, setStaffOptions] = useState<any>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      password: ''
    }
  });
const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/users?role=staff&limit=all');
        const options = response.data.data.result.map((staff) => ({
          value: staff._id,
          label: `${staff.name}`
        }));
        setStaffOptions(options);
      } catch (error) {
        console.error('Error fetching staff options:', error);
      }
    };

    if (open) {
      fetchData();
    }

    return () => {
      if (!open) {
        reset();
      }
    };
  }, [open, reset]);

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name ?? '',

        phone: initialData.phone ?? '',
        email: initialData.email ?? '',
        address: initialData.address ?? '',

        password: '' // Clear password field for editing
      });
    }
  }, [initialData, reset]);

   const onSubmitForm = async (data) => {
    // Password validation for new teachers
    if (!initialData && !data.password) {
      errors.password = { message: 'Password is required for new teachers' };
      return;
    }

    if (!data.password) delete data.password; // Remove empty password

    data.email = data.email.toLowerCase(); // Ensure lowercase

    setSubmitting(true); // Start loading
    try {
      // Call parent submit function which handles API request
      await onSubmit(data);
      // Only close dialog if submit was successful
      // onSubmit function in parent should throw on failure
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      // Keep dialog open if error occurs
    } finally {
      setSubmitting(false); // Stop loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Teacher' : 'Add New Teacher'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">
                Teacher Name *
              </label>
              <Input
                {...register('name', { required: 'Teacher Name is required' })}
                placeholder="Teacher Name"
              />
              <ErrorMessage message={errors.name?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone</label>
              <Input {...register('phone')} placeholder="Phone" />
              <ErrorMessage message={errors.phone?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Email *</label>
              <Input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email format'
                  }
                })}
                placeholder="Email"
              />
              <ErrorMessage message={errors.email?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">Address *</label>
              <Input
                {...register('address', { required: 'Address is required' })}
                placeholder="address"
              />
              <ErrorMessage message={errors.address?.message?.toString()} />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Password {!initialData && '*'}
              </label>
              <Input
                type="password"
                {...register('password', {
                  required: !initialData
                    ? 'Password is required for new teachers'
                    : false // Conditional validation
                })}
              />
              <ErrorMessage message={errors.password?.message?.toString()} />
            </div>
          </div>

          <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-watney text-white hover:bg-watney/90"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : initialData ? 'Save Changes' : 'Add Teacher'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
