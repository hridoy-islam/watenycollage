import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { countries, mockData } from "@/types/index"
import { Controller, useForm } from "react-hook-form"
import Select from 'react-select';

export function PersonalDetailsForm({ student, onSave }) {
  const { control, handleSubmit, register, formState: { errors }, } = useForm();
  return (
    <div>
      <form className="space-y-4 p-4 shadow-md rounded-md mb-2" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Controller
              name="title"
              control={control}
              defaultValue="" // Set the default value for the select
              rules={{ required: "Title is required" }} // Validation rule
              render={({ field }) => (
                <Select
                  {...field}
                  classNamePrefix="select"
                  options={mockData.titles}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue={student.firstName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue={student.lastName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={student.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" defaultValue={student.phone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" defaultValue={student.dob} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maritualStatus">Maritual Status *</Label>

            <Controller
              name="maritualStatus"
              control={control}
              defaultValue="" // Set the default value for the select
              rules={{ required: "Maritual Status is required" }} // Validation rule
              render={({ field }) => (
                <Select
                  {...field}
                  classNamePrefix="select"
                  options={mockData.maritalStatuses}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            
            <Controller
              name="gender"
              control={control}
              defaultValue={
                student.gender
                  ? mockData.gender.find((option) => option.value === student.gender.toLowerCase()) // Find the matching option
                  : null // Handle cases where there is no default
              }
              rules={{ required: "Gender is required" }}
              render={({ field }) => (
                <Select
                  {...field}
                  classNamePrefix="select"
                  options={mockData.gender}
                  placeholder="Select Gender"
                  isClearable
                />
              )}
            />

          </div>
          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Controller
              name="nationality"
              control={control}
              defaultValue="" // Set the default value for the select
              rules={{ required: "Nationality is required" }} // Validation rule
              render={({ field }) => (
                <Select
                  {...field}
                  classNamePrefix="select"
                  options={countries}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countryOfBirth">Country of Residence</Label>
            <Controller
              name="countryOfBirth"
              control={control}
              defaultValue="" // Set the default value for the select
              render={({ field }) => (
                <Select
                  {...field}
                  classNamePrefix="select"
                  options={countries}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="countryOfBirth">Country of Birth</Label>
            <Controller
              name="countryOfBirth"
              control={control}
              defaultValue="" // Set the default value for the select
              render={({ field }) => (
                <Select
                  {...field}
                  classNamePrefix="select"
                  options={countries}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nativeLanguage">Native Language</Label>
            <Controller
              name="countryOfBirth"
              control={control}
              defaultValue="" // Set the default value for the select
              render={({ field }) => (
                <Select
                  {...field}
                  classNamePrefix="select"
                  options={countries}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Name as it appear in Passport:</Label>
            <Input id="dateOfBirth" type="text" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Passport issue Location:</Label>
            <Controller
              name="countryOfBirth"
              control={control}
              defaultValue="" // Set the default value for the select
              render={({ field }) => (
                <Select
                  {...field}
                  classNamePrefix="select"
                  options={countries}
                />
              )}
            />

          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Passport Number</Label>
            <Input id="dateOfBirth" type="text" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Passport Issue Date</Label>
            <Input id="dateOfBirth" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Passport Expiry Date</Label>
            <Input id="dateOfBirth" type="date" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant={'outline'} className="bg-supperagent text-white hover:bg-supperagent/90 border-none" onClick={() => onSave(student)}>Save Changes</Button>
        </div>
      </form>
    </div>
  )
}

