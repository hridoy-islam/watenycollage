import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useParams } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ErrorMessage from '@/components/shared/error-message';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export default function AgentRemit() {
  const [agent, setAgent] = useState({});
  const { id } = useParams();
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();

  // Watch for changes in the form values
  const formValues = watch();

  // Fetch agent data
  const fetchAgentData = async () => {
    const response = await axiosInstance.get(`/users/${id}`);
    const agentData = response?.data?.data || {};

    setAgent(agentData);

    // Populate form fields with the fetched data
    setValue('location2', agentData?.location2 || '');
    setValue('city', agentData?.city || '');
    setValue('state', agentData?.state || '');
    setValue('postCode', agentData?.postCode || '');
    setValue('country', agentData?.country || '');
  };

  useEffect(() => {
    fetchAgentData();
  }, [id]);

  const onSubmit = async (data) => {
    try {
      await axiosInstance.patch(`/users/${id}`, data);
      toast({
        title: "Record Updated successfully",
        className: "bg-supperagent border-none text-white",
      });

      // Optionally reset form after successful update
      reset(data);
    } catch (error) {
      toast({
        title: "Error updating agent data",
        className: "bg-destructive border-none text-white",
      });
    }
  };

  // Check if any form values have changed from the initial data
  const isFormModified = Object.keys(formValues).some(key => formValues[key] !== agent[key]);

  return (
    <div>
      <div className="w-full rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-lg font-semibold text-gray-900">
          {agent?.name}
        </h1>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-5">
          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-600">Email:</span>
            <span className="text-gray-800">{agent?.email}</span>
          </div>

          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-600">Phone:</span>
            <span className="text-gray-800">{agent?.phone}</span>
          </div>

          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-600">Location:</span>
            <span className="text-gray-800">{agent?.location}</span>
          </div>

          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-600">Organization:</span>
            <span className="text-gray-800">{agent?.organization}</span>
          </div>

          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-600">Contact Person:</span>
            <span className="text-gray-800">{agent?.contactPerson}</span>
          </div>
        </div>
      </div>

      <div className="my-1 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-2 font-semibold">Agent Remit Details</h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location2">Address Line 2</Label>
              <Input id="location2" {...register('location2')} />
              <ErrorMessage message={errors.location2?.message?.toString()} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Town / City</Label>
              <Input id="city" {...register('city')} />
              <ErrorMessage message={errors.city?.message?.toString()} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postCode">Post Code</Label>
              <Input id="postCode" {...register('postCode')} />
              <ErrorMessage message={errors.postCode?.message?.toString()} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...register('country')} />
              <ErrorMessage message={errors.country?.message?.toString()} />
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            {isFormModified ? (
              <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent">
                Update
              </Button>
            ) : (
              <Button type="submit" className="bg-supperagent text-white hover:bg-supperagent">
                Save
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
