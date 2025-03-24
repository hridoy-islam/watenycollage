import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios';
import { useParams } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ErrorMessage from '@/components/shared/error-message';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
export default function AgentRemit() {
  const [agent, setAgent] = useState([]);
  const { id } = useParams();
  // Fetch agent data
  const fetchAgentData = async () => {
    const agent = await axiosInstance.get(`/users/${id}`);
    setAgent(agent?.data?.data || []);
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const {
    register,
    formState: { errors }
  } = useForm();
  return (
    <div>
      <div className="w-full rounded-lg bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-lg font-semibold text-gray-900">
          {agent.name}
        </h1>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-5">
          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-600">Email:</span>
            <span className="text-gray-800">{agent.email}</span>
          </div>

          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-600">Phone:</span>
            <span className="text-gray-800">{agent.phone}</span>
          </div>

          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-600">Location:</span>
            <span className="text-gray-800">{agent.location}</span>
          </div>

          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-600">Organization:</span>
            <span className="text-gray-800">{agent.organization}</span>
          </div>

          <div className="flex flex-col text-sm">
            <span className="font-medium text-gray-600">Contact Person:</span>
            <span className="text-gray-800">{agent.contactPerson}</span>
          </div>
        </div>
      </div>
      <div className="my-1 rounded-lg bg-white p-6 shadow-sm">
        <h3 className="mb-2 font-semibold">Agent Remit Details</h3>

        <div className=" grid grid-cols-3 gap-6 ">
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1*</Label>
            <Input
              id="addressLine1"
              {...register('addressLine1', {
                required: 'Address Line 1 is required'
              })}
            />
            <ErrorMessage message={errors.addressLine1?.message?.toString()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input id="addressLine2" {...register('addressLine2')} />
            <ErrorMessage message={errors.addressLine2?.message?.toString()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="townCity">Town / City</Label>
            <Input
              id="townCity"
              {...register('townCity', { required: 'Town / City is required' })}
            />
            <ErrorMessage message={errors.townCity?.message?.toString()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register('state')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postCode">Post Code</Label>
            <Input
              id="postCode"
              {...register('postCode', { required: 'Post Code is required' })}
            />
            <ErrorMessage message={errors.postCode?.message?.toString()} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register('country', { required: 'Country is required' })}
            />
            <ErrorMessage message={errors.country?.message?.toString()} />
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <Button className="bg-supperagent text-white hover:bg-supperagent">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
