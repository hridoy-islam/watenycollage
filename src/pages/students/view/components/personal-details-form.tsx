import ErrorMessage from '@/components/shared/error-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { countries, languages, mockData } from '@/types';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axios'

export function PersonalDetailsForm({ student, onSave }) {

  const {
    handleSubmit,
    register,
    control,
    reset,
    setValue, // Needed to set the selected agent
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      firstName: '',
      lastName: '',
      phone: '',
      dob: '',
      email: '',
      gender: '',
      maritualStatus: '',
      nationality: '',
      countryResidence: '',
      countryBirth: '',
      nativeLanguage: '',
      passportName: '',
      passportIssueLocation: '',
      passportNumber: '',
      passportIssueDate: '',
      passportExpiryDate: '',
      collageRoll: '',
      agentId: '',
    }
  });
  const [staffOptions, setStaffOptions] = useState<any>([]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      if (isLoading) setIsLoading(true);
      const response = await axiosInstance.get('/agents?limit=all');
      const options = response.data.data.result.map((agent) => ({
        value: agent.id,
        label: agent.agentName,
      }));
      setStaffOptions(options);
      setIsLoading(false); // Set loading to false after fetching
    } catch (error) {
      console.error("Error fetching agents:", error);
      setIsLoading(false); // Set loading to false even if there's an error
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (student) {
      reset({
        title: student.title || '',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        dob: student.dob || '',
        phone: student.phone || '',
        email: student.email || '',
        gender: student.gender || '',
        maritualStatus: student.maritualStatus || '',
        nationality: student.nationality || '',
        countryResidence: student.countryResidence || '',
        countryBirth: student.countryBirth || '',
        nativeLanguage: student.nativeLanguage || '',
        passportName: student.passportName || '',
        passportIssueLocation: student.passportIssueLocation || '',
        passportNumber: student.passportNumber || '',
        passportIssueDate: student.passportIssueDate || '',
        passportExpiryDate: student.passportExpiryDate || '',
        collageRoll: student.collageRoll || '',
        agentId: student.agent?.id || '',
      });
    }
  }, [student, reset]);

  // Ensure agentId is set again when staffOptions are updated
  useEffect(() => {
    if (student?.agent?.id) {
      setValue('agentId', student.agent.id);
    }
  }, [staffOptions, student, setValue]);

  // Fetch agents when the component mounts


  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-2 space-y-4 rounded-md p-4 shadow-md"
      >
        <div className="grid grid-cols-3 gap-4">
          {/* Title Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.titles.map((title, index) => (
                      <SelectItem key={index} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              {...register('firstName', { required: 'First Name is required' })}
            />
            <ErrorMessage message={errors.firstName?.message?.toString()} />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...register('lastName', { required: 'Last Name is required' })}
            />
            <ErrorMessage message={errors.lastName?.message?.toString()} />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')} // Register the phone field
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" {...register('dob')} />
          </div>

          {/* Marital Status Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="maritualStatus">Marital Status *</Label>
            <Controller
              name="maritualStatus"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.maritalStatuses.map((status, index) => (
                      <SelectItem key={index} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Gender Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockData.gender.map((gender, index) => (
                      <SelectItem key={index} value={gender}>
                        {gender}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality *</Label>

            <Controller
              name="nationality"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || student?.nationality || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country, index) => (
                      <SelectItem key={index} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <ErrorMessage message={errors.nationality?.message?.toString()} />
          </div>

          {/* Country of Residence */}
          <div className="space-y-2">
            <Label htmlFor="countryResidence">Country of Residence</Label>
            <Controller
              name="countryResidence"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || student?.countryResidence || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country, index) => (
                      <SelectItem key={index} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Country of Birth */}
          <div className="space-y-2">
            <Label htmlFor="countryBirth">Country of Birth *</Label>
            <Controller
              name="countryBirth"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || student?.countryBirth || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country, index) => (
                      <SelectItem key={index} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Native Language */}
          <div className="space-y-2">
            <Label htmlFor="nativeLanguage">Native Language *</Label>
            <Controller
              name="nativeLanguage"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || student?.nativeLanguage || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Please select" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((item, index) => (
                      <SelectItem key={index} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Passport Name */}
          <div className="space-y-2">
            <Label htmlFor="passportName">
              Name as it appears in Passport:
            </Label>
            <Input
              id="passportName"
              type="text"
              {...register('passportName')}
            />
          </div>

          {/* Passport Issue Location */}
          <div className="space-y-2">
            <Label htmlFor="passportIssueLocation">
              Passport Issue Location:
            </Label>
            <Input
              id="passportIssueLocation"
              {...register('passportIssueLocation')}
            />
          </div>

          {/* Passport Number */}
          <div className="space-y-2">
            <Label htmlFor="passportNumber">Passport Number</Label>
            <Input
              id="passportNumber"
              type="text"
              {...register('passportNumber')}
            />
          </div>

          {/* Passport Issue Date */}
          <div className="space-y-2">
            <Label htmlFor="passportIssueDate">Passport Issue Date</Label>
            <Input
              id="passportIssueDate"
              type="date"
              {...register('passportIssueDate')}
            />
          </div>

          {/* Passport Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="passportExpiryDate">Passport Expiry Date</Label>
            <Input
              id="passportExpiryDate"
              type="date"
              {...register('passportExpiryDate')}
            />
          </div>

          {/* Collage Roll */}
          <div className="space-y-2">
            <Label htmlFor="collageRoll">Collage Roll</Label>
            <Input
              id="collageRoll"
              {...register('collageRoll')}
            />
          </div>
          <div>
            <Label htmlFor="agentId">Agent</Label>
            <Controller
              name="agentId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="border rounded p-2 w-full"
                >
                  <option value="">Select an Agent</option>
                  {staffOptions.map((agent) => (
                    <option key={agent.value} value={agent.value}>
                      {agent.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>


        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            variant={'outline'}
            className="border-none bg-supperagent text-white hover:bg-supperagent/90"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
